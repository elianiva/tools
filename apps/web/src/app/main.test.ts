import { describe, expect, it } from 'vitest'
import { init, Message, toolsFor, update } from './main.ts'
import { AppRoute, urlOf } from './route.ts'

const flags = { anchorId: 'anchor', favorites: [], recents: [] }
const start = (path = '/') => init(flags, urlOf(path)).model

describe('navigation', () => {
  it('opens a tool from the URL and remembers it first in the recents', () => {
    const model = start('/text/word-counter')
    expect(model.route).toEqual(AppRoute.Tool({ category: 'text', id: 'word-counter' }))
    expect(model.recents).toEqual(['word-counter'])
    expect(model.tools['word-counter']).toEqual({ text: '' })
  })

  it('keeps a tool state while the user visits another page', () => {
    const typed = update(
      start('/text/word-counter'),
      Message.GotToolMessage({
        id: 'word-counter',
        message: { _tag: 'ChangedText', text: 'hello there' },
      }),
    ).model
    const away = update(typed, Message.ChangedUrl({ url: urlOf('/') })).model
    const back = update(away, Message.ChangedUrl({ url: urlOf('/text/word-counter') })).model
    expect(back.tools['word-counter']).toEqual({ text: 'hello there' })
  })

  it('creates no state for a tool that does not exist', () => {
    const model = update(start(), Message.ChangedUrl({ url: urlOf('/text/nope') })).model
    expect(model.tools['nope']).toBeUndefined()
  })
})

describe('favorites', () => {
  it('toggles a tool and saves the list', () => {
    const on = update(start(), Message.ToggledFavorite({ id: 'word-counter' }))
    expect(on.model.favorites).toEqual(['word-counter'])
    expect(on.commands?.map((command) => command.name)).toContain('SaveSettings')
    expect(
      update(on.model, Message.ToggledFavorite({ id: 'word-counter' })).model.favorites,
    ).toEqual([])
  })
})

describe('files', () => {
  const text = new File(['hi there'], 'note.txt', { type: 'text/plain' })
  const photo = new File([''], 'a.png', { type: 'image/png' })
  const archive = new File([''], 'a.zip', { type: 'application/zip' })

  it('finds the tools that take a file', () => {
    expect(toolsFor([text]).map((tool) => tool.meta.id)).toEqual(['word-counter'])
    expect(toolsFor([photo]).map((tool) => tool.meta.id)).toEqual(['image-converter'])
    expect(toolsFor([archive])).toEqual([])
  })

  it('hands a dropped text file to the tool on screen and reads it', () => {
    const result = update(start('/text/word-counter'), Message.ReceivedFiles({ files: [text] }))
    expect(result.commands?.map((command) => command.name)).toEqual(['LoadText'])
  })

  it('opens the tool that takes a file dropped on the home page', () => {
    const result = update(start(), Message.ReceivedFiles({ files: [text] }))
    expect(result.model.route).toEqual(AppRoute.Tool({ category: 'text', id: 'word-counter' }))
    expect(result.commands?.map((command) => command.name)).toEqual(['LoadText', 'Navigate'])
  })

  it('opens the image converter for a dropped image and starts converting it', () => {
    const result = update(start(), Message.ReceivedFiles({ files: [photo] }))
    expect(result.model.route).toEqual(AppRoute.Tool({ category: 'images', id: 'image-converter' }))
    expect(result.commands?.map((command) => command.name)).toEqual(['ConvertImage', 'Navigate'])
  })

  it('tells the user when nothing takes the file', () => {
    const result = update(start(), Message.ReceivedFiles({ files: [archive] }))
    expect(result.commands?.map((command) => command.name)).toEqual(['ShowToast'])
  })
})
