// The PDF work itself. Each function takes the user's files and options and returns files
// to download. A failure the user can fix throws an `Error` whose message is shown as is.
import { degrees, PDFDocument } from 'pdf-lib'
import {
  blocksOf,
  describeSize,
  parseGroups,
  parsePages,
  pdfDate,
  pdfName,
  withoutPages,
} from './pdf.logic.ts'

export type Output = Readonly<{ name: string; blob: Blob }>
export type Result = Readonly<{ outputs: ReadonlyArray<Output>; text?: string; note?: string }>
export type Options = Readonly<Record<string, string>>

const PDF = 'application/pdf'

const bytesOf = async (file: File): Promise<Uint8Array> => new Uint8Array(await file.arrayBuffer())

const blobOf = (bytes: Uint8Array, type: string): Blob => new Blob([bytes as BlobPart], { type })

const open = async (file: File): Promise<PDFDocument> => {
  try {
    return await PDFDocument.load(await bytesOf(file))
  } catch {
    throw new Error(`Could not open ${file.name}. It may be damaged or password-protected.`)
  }
}

const pick = async (source: PDFDocument, pages: ReadonlyArray<number>): Promise<PDFDocument> => {
  const out = await PDFDocument.create()
  for (const page of await out.copyPages(
    source,
    pages.map((page) => page - 1),
  ))
    out.addPage(page)
  return out
}

const save = async (doc: PDFDocument): Promise<Blob> => blobOf(await doc.save(), PDF)

const only = (files: ReadonlyArray<File>): File => {
  const file = files[0]
  if (file === undefined) throw new Error('Add a PDF first.')
  return file
}

export const merge = async (files: ReadonlyArray<File>): Promise<Result> => {
  if (files.length < 2) throw new Error('Add at least two PDFs to merge.')
  const out = await PDFDocument.create()
  for (const file of files) {
    const source = await open(file)
    for (const page of await out.copyPages(source, source.getPageIndices())) out.addPage(page)
  }
  return {
    outputs: [{ name: 'merged.pdf', blob: await save(out) }],
    note: `${files.length} files, ${out.getPageCount()} pages.`,
  }
}

export const split = async (files: ReadonlyArray<File>, options: Options): Promise<Result> => {
  const file = only(files)
  const source = await open(file)
  const total = source.getPageCount()
  const mode = options['mode'] ?? 'ranges'
  const groups =
    mode === 'single'
      ? blocksOf(total, 1)
      : mode === 'every'
        ? blocksOf(total, Number(options['value']) || 1)
        : parseGroups(options['value'] ?? '', total)
  const outputs: Array<Output> = []
  for (const [index, pages] of groups.entries()) {
    outputs.push({
      name: pdfName(file.name, `-part-${index + 1}`),
      blob: await save(await pick(source, pages)),
    })
  }
  return {
    outputs,
    note: `${total} pages into ${outputs.length} ${outputs.length === 1 ? 'file' : 'files'}.`,
  }
}

export const pickPages = async (files: ReadonlyArray<File>, options: Options): Promise<Result> => {
  const file = only(files)
  const source = await open(file)
  const total = source.getPageCount()
  const listed = parsePages(options['pages'] ?? '', total)
  const pages = options['mode'] === 'remove' ? withoutPages(total, listed) : listed
  if (pages.length === 0) throw new Error('That would remove every page.')
  return {
    outputs: [{ name: pdfName(file.name, '-edited'), blob: await save(await pick(source, pages)) }],
    note: `${pages.length} of ${total} pages kept.`,
  }
}

export const rotate = async (files: ReadonlyArray<File>, options: Options): Promise<Result> => {
  const file = only(files)
  const doc = await open(file)
  const pages = parsePages(options['pages'] ?? '', doc.getPageCount())
  const angle = Number(options['angle'] ?? '90')
  for (const number of new Set(pages)) {
    const page = doc.getPage(number - 1)
    page.setRotation(degrees((page.getRotation().angle + angle) % 360))
  }
  return {
    outputs: [{ name: pdfName(file.name, '-rotated'), blob: await save(doc) }],
    note: `${new Set(pages).size} pages turned ${angle}° clockwise.`,
  }
}

export const info = async (files: ReadonlyArray<File>): Promise<Result> => {
  const file = only(files)
  const doc = await open(file)
  const first = doc.getPage(0).getSize()
  const rows: ReadonlyArray<readonly [string, string]> = [
    ['Pages', String(doc.getPageCount())],
    ['Page size', describeSize(first.width, first.height)],
    ['File size', `${(file.size / 1024).toFixed(file.size < 102400 ? 1 : 0)} KB`],
    ['Title', doc.getTitle() ?? ''],
    ['Author', doc.getAuthor() ?? ''],
    ['Subject', doc.getSubject() ?? ''],
    ['Producer', doc.getProducer() ?? ''],
    ['Created', pdfDate(doc.getCreationDate())],
    ['Modified', pdfDate(doc.getModificationDate())],
  ]
  return {
    outputs: [],
    text: rows
      .filter(([, value]) => value !== '')
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n'),
  }
}

const PAPER_POINTS: Readonly<Record<string, readonly [number, number]>> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
}

/** PNG and JPG go in as they are. Anything else the browser can draw is re-encoded as PNG. */
const embedImage = async (doc: PDFDocument, file: File) => {
  const bytes = await bytesOf(file)
  if (file.type === 'image/png') return doc.embedPng(bytes)
  if (file.type === 'image/jpeg') return doc.embedJpg(bytes)
  try {
    const bitmap = await createImageBitmap(file)
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0)
    const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (png === null) throw new Error('empty')
    return await doc.embedPng(new Uint8Array(await png.arrayBuffer()))
  } catch {
    throw new Error(`Could not read ${file.name} as an image.`)
  }
}

export const imagesToPdf = async (
  files: ReadonlyArray<File>,
  options: Options,
): Promise<Result> => {
  if (files.length === 0) throw new Error('Add at least one image.')
  const doc = await PDFDocument.create()
  const paper = PAPER_POINTS[options['size'] ?? 'fit']
  for (const file of files) {
    const image = await embedImage(doc, file)
    if (paper === undefined) {
      doc.addPage([image.width, image.height]).drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      })
      continue
    }
    const landscape = image.width > image.height
    const [pageWidth, pageHeight] = landscape ? [paper[1], paper[0]] : paper
    const scale = Math.min(pageWidth / image.width, pageHeight / image.height, 1)
    const width = image.width * scale
    const height = image.height * scale
    doc.addPage([pageWidth, pageHeight]).drawImage(image, {
      x: (pageWidth - width) / 2,
      y: (pageHeight - height) / 2,
      width,
      height,
    })
  }
  return {
    outputs: [{ name: 'images.pdf', blob: await save(doc) }],
    note: `${files.length} ${files.length === 1 ? 'page' : 'pages'}.`,
  }
}

export const pdfToImages = async (
  files: ReadonlyArray<File>,
  options: Options,
): Promise<Result> => {
  const file = only(files)
  const [pdfjs, worker] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ])
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default
  let document_
  let loading
  try {
    loading = pdfjs.getDocument({ data: await bytesOf(file) })
    document_ = await loading.promise
  } catch {
    throw new Error(`Could not open ${file.name}. It may be damaged or password-protected.`)
  }
  const jpeg = options['format'] === 'jpg'
  const scale = Number(options['scale'] ?? '2')
  const pages = parsePages(options['pages'] ?? '', document_.numPages)
  const base = file.name.replace(/\.[^.]+$/u, '')
  const width = String(document_.numPages).length
  const outputs: Array<Output> = []
  for (const number of new Set(pages)) {
    const page = await document_.getPage(number)
    const viewport = page.getViewport({ scale })
    const canvas = window.document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    const context = canvas.getContext('2d')
    if (context === null) throw new Error('This browser cannot draw pages.')
    if (jpeg) {
      context.fillStyle = '#fff'
      context.fillRect(0, 0, canvas.width, canvas.height)
    }
    await page.render({ canvas, canvasContext: context, viewport }).promise
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, jpeg ? 'image/jpeg' : 'image/png', 0.92),
    )
    if (blob === null) throw new Error(`Could not draw page ${number}.`)
    outputs.push({
      name: `${base}-${String(number).padStart(width, '0')}.${jpeg ? 'jpg' : 'png'}`,
      blob,
    })
  }
  await loading?.destroy()
  return { outputs, note: `${outputs.length} ${outputs.length === 1 ? 'page' : 'pages'} drawn.` }
}
