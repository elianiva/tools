import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { info, merge, pickPages, rotate, split } from './engine.ts'

const pdf = async (pages: number, name = 'a.pdf'): Promise<File> => {
  const doc = await PDFDocument.create()
  for (let index = 0; index < pages; index += 1) doc.addPage([100 + index, 200])
  return new File([(await doc.save()) as BlobPart], name, { type: 'application/pdf' })
}

const widths = async (blob: Blob): Promise<ReadonlyArray<number>> => {
  const doc = await PDFDocument.load(new Uint8Array(await blob.arrayBuffer()))
  return doc.getPages().map((page) => page.getWidth())
}

describe('pdf engine', () => {
  it('merges in the order given', async () => {
    const result = await merge([await pdf(2), await pdf(1)])
    expect(await widths(result.outputs[0]!.blob)).toEqual([100, 101, 100])
  })

  it('splits by ranges into named files', async () => {
    const result = await split([await pdf(4, 'book.pdf')], { mode: 'ranges', value: '1-2, 4' })
    expect(result.outputs.map((out) => out.name)).toEqual(['book-part-1.pdf', 'book-part-2.pdf'])
    expect(await widths(result.outputs[1]!.blob)).toEqual([103])
  })

  it('reorders pages and refuses to remove them all', async () => {
    const file = await pdf(3)
    const kept = await pickPages([file], { mode: 'keep', pages: '3, 1' })
    expect(await widths(kept.outputs[0]!.blob)).toEqual([102, 100])
    await expect(pickPages([file], { mode: 'remove', pages: '1-3' })).rejects.toThrow('every page')
  })

  it('rotates only the pages asked for', async () => {
    const result = await rotate([await pdf(2)], { angle: '90', pages: '2' })
    const doc = await PDFDocument.load(new Uint8Array(await result.outputs[0]!.blob.arrayBuffer()))
    expect(doc.getPages().map((page) => page.getRotation().angle)).toEqual([0, 90])
  })

  it('reports page count and rejects a non-PDF', async () => {
    expect((await info([await pdf(3)])).text).toContain('Pages: 3')
    const bad = new File(['nope'], 'bad.pdf')
    await expect(info([bad])).rejects.toThrow('Could not open bad.pdf')
  })
})
