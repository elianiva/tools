// The browser half of the converter: decode, resize, encode. Nothing here touches the
// network. Codecs that the browser lacks are WebAssembly modules loaded on first use.
import { fitSize, formatOf, sniff, type FormatId } from './convert.logic.ts'

// iOS Safari refuses canvases above about 16.7 million pixels.
const MAX_PIXELS = 16_000_000

export type Converted = Readonly<{ blob: Blob; note: string }>

const decode = async (file: File): Promise<ImageBitmap> => {
  const kind = sniff(new Uint8Array(await file.slice(0, 32).arrayBuffer()))
  if (kind === 'heic') {
    // Safari decodes HEIC itself. Everything else needs libheif.
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      const { heicTo } = await import('heic-to')
      const png = await heicTo({ blob: file, type: 'image/png' })
      return createImageBitmap(png)
    }
  }
  return createImageBitmap(file, { imageOrientation: 'from-image' })
}

const hasAlpha = (data: ImageData): boolean => {
  for (let i = 3; i < data.data.length; i += 4) if (data.data[i] !== 255) return true
  return false
}

const canvasBlob = (canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => {
        // An unsupported type does not fail: the browser hands back a PNG.
        if (blob === null || blob.type !== mime)
          reject(new Error(`This browser cannot write ${mime}.`))
        else resolve(blob)
      },
      mime,
      quality,
    ),
  )

export const convertImage = async (
  file: File,
  format: FormatId,
  quality: number,
  maxWidth: number,
): Promise<Converted> => {
  const target = formatOf(format)
  const bitmap = await decode(file)
  const fit = fitSize(bitmap.width, bitmap.height, maxWidth, MAX_PIXELS)
  const canvas = document.createElement('canvas')
  canvas.width = fit.width
  canvas.height = fit.height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (context === null) throw new Error('Canvas is not available.')
  const notes: Array<string> = []
  if (fit.scaled) notes.push(`resized to ${fit.width} × ${fit.height}`)
  if (format === 'jpeg') {
    // JPEG has no alpha: transparent pixels would turn black.
    context.fillStyle = '#fff'
    context.fillRect(0, 0, fit.width, fit.height)
  }
  context.drawImage(bitmap, 0, 0, fit.width, fit.height)
  bitmap.close()
  const pixels = context.getImageData(0, 0, fit.width, fit.height)
  if (format === 'jpeg') {
    // The white fill hides the alpha, so look at the source: draw it again on nothing.
    const probe = document.createElement('canvas')
    probe.width = Math.min(fit.width, 256)
    probe.height = Math.min(fit.height, 256)
    const probeContext = probe.getContext('2d', { willReadFrequently: true })
    if (probeContext !== null) {
      const again = await decode(file)
      probeContext.drawImage(again, 0, 0, probe.width, probe.height)
      again.close()
      if (hasAlpha(probeContext.getImageData(0, 0, probe.width, probe.height))) {
        notes.push('transparent areas filled with white')
      }
    }
  }
  const q = quality / 100
  const blob =
    format === 'png'
      ? await canvasBlob(canvas, 'image/png', 1)
      : format === 'jpeg'
        ? await canvasBlob(canvas, 'image/jpeg', q)
        : format === 'webp'
          ? // Safari cannot write WebP from a canvas, so every browser uses the same encoder.
            new Blob([await (await import('@jsquash/webp/encode')).default(pixels, { quality })], {
              type: target.mime,
            })
          : new Blob([await (await import('@jsquash/avif/encode')).default(pixels, { quality })], {
              type: target.mime,
            })
  return { blob, note: notes.join(', ') }
}
