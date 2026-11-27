import { describe, expect, it } from 'vitest'
import { init, Message, paletteGroups, toolsFor, update } from './main.ts'
import { AppRoute, urlOf } from './route.ts'

const flags = { anchorId: 'anchor', favorites: [], recents: [] }
const start = (path = '/') => init(flags, urlOf(path)).model

describe('navigation', () => {
  it('opens a tool from the URL and remembers it first in the recents', () => {
    const model = start('/text/text-statistics')
    expect(model.route).toEqual(AppRoute.Tool({ category: 'text', id: 'text-statistics' }))
    expect(model.recents).toEqual(['text-statistics'])
    expect(model.tools['text-statistics']).toHaveProperty('variant', 'word-counter')
  })

  it('opens the suite on the tool when an old URL of a merged tool is used', () => {
    const model = start('/text/vowel-counter')
    expect(model.recents).toEqual(['text-statistics'])
    expect(model.tools['text-statistics']).toHaveProperty('variant', 'vowel-counter')
  })

  it('keeps a tool state while the user visits another page', () => {
    const typed = update(
      start('/text/text-statistics'),
      Message.GotToolMessage({
        id: 'text-statistics',
        message: {
          _tag: 'Inner',
          variant: 'word-counter',
          message: { _tag: 'ChangedText', text: 'hello there' },
        },
      }),
    ).model
    const away = update(typed, Message.ChangedUrl({ url: urlOf('/') })).model
    const back = update(away, Message.ChangedUrl({ url: urlOf('/text/text-statistics') })).model
    expect(back.tools['text-statistics']).toMatchObject({
      models: { 'word-counter': { text: 'hello there' } },
    })
  })

  it('creates no state for a tool that does not exist', () => {
    const model = update(start(), Message.ChangedUrl({ url: urlOf('/text/nope') })).model
    expect(model.tools['nope']).toBeUndefined()
  })
})

describe('favorites', () => {
  it('toggles a tool and saves the list', () => {
    const on = update(start(), Message.ToggledFavorite({ id: 'text-statistics' }))
    expect(on.model.favorites).toEqual(['text-statistics'])
    expect(on.commands?.map((command) => command.name)).toContain('SaveSettings')
    expect(
      update(on.model, Message.ToggledFavorite({ id: 'text-statistics' })).model.favorites,
    ).toEqual([])
  })
})

describe('palette', () => {
  it('lists recents and favorites once, before the catalogue', () => {
    const opened = update(
      update(start('/text/text-statistics'), Message.ToggledFavorite({ id: 'text-statistics' }))
        .model,
      Message.ChangedUrl({ url: urlOf('/developer/data-formats') }),
    ).model
    const groups = paletteGroups(opened)
    expect(groups[0]).toMatchObject({ name: 'Recent', showCategory: true })
    expect(groups[0]?.tools.map((tool) => tool.meta.id)).toEqual([
      'data-formats',
      'text-statistics',
    ])
    const rest = groups.slice(1).flatMap((group) => group.tools.map((tool) => tool.meta.id))
    expect(rest).not.toContain('text-statistics')
    expect(rest).not.toContain('data-formats')
    expect(groups.slice(1)[0]).toMatchObject({ name: 'Images', showCategory: false })
  })

  it('puts the category of the strongest match first', () => {
    const searched = update(start(), Message.ChangedPaletteQuery({ query: 'time' })).model
    const groups = paletteGroups(searched)
    expect(groups[0]?.name).toBe('Convert')
    expect(groups[0]?.tools[0]?.meta.name.toLowerCase().startsWith('time')).toBe(true)
  })
})

describe('files', () => {
  const text = new File(['hi there'], 'note.txt', { type: 'text/plain' })
  const photo = new File([''], 'a.png', { type: 'image/png' })
  const archive = new File([''], 'a.zip', { type: 'application/zip' })

  it('finds the tools that take a file', () => {
    expect(toolsFor([text]).map((tool) => tool.meta.id)).toContain('text-statistics')
    expect(toolsFor([text]).length).toBeGreaterThan(1)
    expect(toolsFor([photo]).map((tool) => tool.meta.id)).toEqual([
      'image-converter',
      'convert-pdf',
    ])
    expect(toolsFor([archive])).toEqual([])
  })

  it('hands a dropped text file to the tool on screen and reads it', () => {
    const result = update(start('/text/text-statistics'), Message.ReceivedFiles({ files: [text] }))
    expect(result.commands?.map((command) => command.name)).toEqual(['LoadText'])
  })

  it('asks which tool to use when several take the file dropped on the home page', () => {
    const result = update(start(), Message.ReceivedFiles({ files: [text] }))
    expect(result.model.route._tag).toBe('Home')
    expect(result.model.pendingFiles).toEqual([text])
    expect(result.commands ?? []).toEqual([])
  })

  it('hands the pending file to the tool the user picks', () => {
    const pending = update(start(), Message.ReceivedFiles({ files: [text] })).model
    const result = update(pending, Message.ChoseFileTool({ id: 'text-statistics' }))
    expect(result.model.route).toEqual(AppRoute.Tool({ category: 'text', id: 'text-statistics' }))
    expect(result.model.pendingFiles).toEqual([])
    expect(result.commands?.map((command) => command.name)).toEqual(['LoadText', 'Navigate'])
  })

  it('opens the image converter for a picked image tool and starts converting it', () => {
    const pending = update(start(), Message.ReceivedFiles({ files: [photo] })).model
    const result = update(pending, Message.ChoseFileTool({ id: 'image-converter' }))
    expect(result.model.route).toEqual(AppRoute.Tool({ category: 'images', id: 'image-converter' }))
    expect(result.commands?.map((command) => command.name)).toEqual(['ConvertImage', 'Navigate'])
  })

  it('tells the user when nothing takes the file', () => {
    const result = update(start(), Message.ReceivedFiles({ files: [archive] }))
    expect(result.commands?.map((command) => command.name)).toEqual(['ShowToast'])
  })
})
