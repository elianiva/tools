import { Dialog as FkDialog } from '@foldkit/ui'
import { Message as UiMessage, Toast, Ui, type UiRegistry } from '@tools/adapter'
import { Effect, Option, Queue, Schema, Stream } from 'effect'
import { Command, Dom, File, Navigation, Subscription, Update, Url } from 'foldkit'
import type { Document, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { acceptsFile } from '../tools/files.ts'
import { pathOfTool, toolOf, tools } from '../tools/registry.ts'
import { groupByBestMatch, groupTools, searchTools } from '../tools/search.ts'
import type { Tool } from '../tools/tool.ts'
import { shellView } from '../shell/view.ts'
import { AppRoute, pathOf, urlToRoute } from './route.ts'

const { UrlRequest } = Navigation

// The toaster belongs to the app, like `kit`.
export const toaster = Toast.makeToaster()

export const kit = Ui.define({ toast: Toast.componentOf(toaster) })

/** What the browser remembered: the tools the user starred and the ones used last. */
export const Flags = Schema.Struct({
  anchorId: Schema.String,
  favorites: Schema.Array(Schema.String),
  recents: Schema.Array(Schema.String),
})
export type Flags = typeof Flags.Type

const RECENT_LIMIT = 6

export const Model = Schema.Struct({
  anchorId: Schema.String,
  route: AppRoute,
  /** Each tool's own Model, by tool id, created the first time the tool opens. */
  tools: Schema.Record(Schema.String, Schema.Unknown),
  favorites: Schema.Array(Schema.String),
  recents: Schema.Array(Schema.String),
  palette: FkDialog.Model,
  paletteQuery: Schema.String,
  paletteIndex: Schema.Finite,
  ui: kit.Model,
  /** A file is being dragged over the page. */
  dragging: Schema.Boolean,
  /** Files that more than one tool takes, waiting for the user to pick the tool. */
  pendingFiles: Schema.Array(File.File),
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  GotUiMessage: { message: UiMessage },
  ClickedLink: { request: UrlRequest },
  ChangedUrl: { url: Url.Url },
  CompletedNavigation: {},
  GotToolMessage: { id: Schema.String, message: Schema.Unknown },
  GotPaletteMessage: { message: FkDialog.Message },
  OpenedPalette: {},
  ChangedPaletteQuery: { query: Schema.String },
  MovedPaletteIndex: { delta: Schema.Finite },
  ChosePaletteResult: { id: Schema.String },
  CompletedPaletteScroll: {},
  ToggledFavorite: { id: Schema.String },
  CompletedSave: {},
  ClickedCopy: { text: Schema.String },
  GotToast: { item: Toast.ToastItem },
  ChangedToasts: { ids: Schema.Array(Schema.String) },
  ChangedDragging: { dragging: Schema.Boolean },
  ReceivedFiles: { files: Schema.Array(File.File) },
  ChoseFileTool: { id: Schema.String },
  DismissedFiles: {},
})
export type Message = typeof Message.Type

// ── Commands ────────────────────────────────────────────────────────────────

export const Navigate = Command.define('Navigate', {
  args: { to: Schema.String },
  messages: [Message.CompletedNavigation],
  execute: ({ to }) => Navigation.pushUrl(to).pipe(Effect.as(Message.CompletedNavigation())),
})

export const LoadPage = Command.define('LoadPage', {
  args: { href: Schema.String },
  messages: [Message.CompletedNavigation],
  execute: ({ href }) => Navigation.load(href).pipe(Effect.as(Message.CompletedNavigation())),
})

const SETTINGS_KEY = 'tools.settings'

export const SaveSettings = Command.define('SaveSettings', {
  args: { favorites: Schema.Array(Schema.String), recents: Schema.Array(Schema.String) },
  messages: [Message.CompletedSave],
  execute: ({ favorites, recents }) =>
    Effect.sync(() => {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ favorites, recents }))
      } catch {
        // Private mode or a full disk: the site works, it just forgets.
      }
    }).pipe(Effect.as(Message.CompletedSave())),
})

export const ShowToast = Command.define('ShowToast', {
  args: { title: Schema.String, description: Schema.String, type: Schema.String },
  messages: [Message.GotToast],
  execute: ({ title, description, type }) =>
    Effect.sync(() =>
      Message.GotToast({ item: Toast.show(toaster, { title, description, type }) }),
    ),
})

export const CopyText = Command.define('CopyText', {
  args: { text: Schema.String },
  messages: [Message.GotToast],
  execute: ({ text }) =>
    Effect.promise(() =>
      navigator.clipboard.writeText(text).then(
        () => true,
        () => false,
      ),
    ).pipe(
      Effect.map((copied) =>
        Message.GotToast({
          item: Toast.show(toaster, {
            title: copied ? 'Copied' : 'Could not copy',
            description: copied ? 'The result is on your clipboard.' : 'The browser refused.',
            type: copied ? 'success' : 'error',
          }),
        }),
      ),
    ),
})

/** Keeps the arrow-keyed result inside the palette's scroll box. */
export const ScrollPaletteToResult = Command.define('ScrollPaletteToResult', {
  args: { index: Schema.Finite },
  messages: [Message.CompletedPaletteScroll],
  execute: ({ index }) =>
    Dom.scrollIntoView(`#palette-result-${index}`).pipe(
      Effect.ignore,
      Effect.as(Message.CompletedPaletteScroll()),
    ),
})

// ── Update ──────────────────────────────────────────────────────────────────

type Return = Update.Return<Model, Message, UiRegistry>

/** Reads what the browser remembered. Called once, before the app starts. */
export const readSettings = (): Pick<Flags, 'favorites' | 'recents'> => {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}')
    const decoded = Schema.decodeUnknownOption(
      Schema.Struct({
        favorites: Schema.optionalKey(Schema.Array(Schema.String)),
        recents: Schema.optionalKey(Schema.Array(Schema.String)),
      }),
    )(raw)
    return {
      favorites: Option.match(decoded, { onNone: () => [], onSome: (s) => s.favorites ?? [] }),
      recents: Option.match(decoded, { onNone: () => [], onSome: (s) => s.recents ?? [] }),
    }
  } catch {
    return { favorites: [], recents: [] }
  }
}

/** The tool a route shows, if it shows one. */
const toolOfRoute = (route: AppRoute): Tool | undefined =>
  route._tag === 'Tool' ? toolOf(route.category, route.id) : undefined

/** Opening a tool creates its Model once and puts it first in the recents. */
const enter = (model: Model, route: AppRoute): Model => {
  const tool = toolOfRoute(route)
  if (tool === undefined) return { ...model, route }
  return {
    ...model,
    route,
    tools:
      tool.meta.id in model.tools ? model.tools : { ...model.tools, [tool.meta.id]: tool.init() },
    recents: [tool.meta.id, ...model.recents.filter((id) => id !== tool.meta.id)].slice(
      0,
      RECENT_LIMIT,
    ),
  }
}

export const init = (flags: Flags, url: Url.Url) => {
  const model = enter(
    {
      anchorId: flags.anchorId,
      route: urlToRoute(url),
      tools: {},
      favorites: flags.favorites,
      recents: flags.recents,
      palette: FkDialog.init({ id: 'palette', isAnimated: true }),
      paletteQuery: '',
      paletteIndex: 0,
      ui: { toast: Toast.init({ key: 'toast' }) },
      dragging: false,
      pendingFiles: [],
    },
    urlToRoute(url),
  )
  return { model, commands: [SaveSettings({ favorites: model.favorites, recents: model.recents })] }
}

/** Runs one tool's update and lifts its Commands into the app's Message. */
const runTool = (model: Model, id: string, message: unknown): Return => {
  const tool = tools.find((candidate) => candidate.meta.id === id)
  if (tool === undefined) return { model }
  const result = tool.update(model.tools[id] ?? tool.init(), message)
  return {
    model: { ...model, tools: { ...model.tools, [id]: result.model } },
    commands: Command.mapMessages(result.commands ?? [], (next) =>
      Message.GotToolMessage({ id, message: next }),
    ),
  }
}

/** The tools that take at least one of these files. */
export const toolsFor = (files: ReadonlyArray<globalThis.File>): ReadonlyArray<Tool> =>
  tools.filter((tool) => {
    const accepts = tool.meta.accepts
    return accepts !== undefined && files.some((file) => acceptsFile(accepts, file))
  })

/** Hands files to a tool, opening it first when the user is somewhere else. */
const deliver = (model: Model, tool: Tool, files: ReadonlyArray<globalThis.File>): Return => {
  const route = AppRoute.Tool({ category: tool.meta.category, id: tool.meta.id })
  const here = toolOfRoute(model.route)?.meta.id === tool.meta.id
  const opened = here ? model : enter(model, route)
  const accepts = tool.meta.accepts ?? []
  const message = tool.receive?.(files.filter((file) => acceptsFile(accepts, file)))
  const run = message === undefined ? { model: opened } : runTool(opened, tool.meta.id, message)
  return {
    model: { ...run.model, pendingFiles: [] },
    commands: [...(run.commands ?? []), ...(here ? [] : [Navigate({ to: pathOf(route) })])],
  }
}

export const paletteResults = (model: Model): ReadonlyArray<Tool> =>
  paletteGroups(model).flatMap((group) => group.tools)

export type PaletteGroup = Readonly<{
  name: string
  tools: ReadonlyArray<Tool>
  /** Recent and Favorites mix categories, so their rows name the category. */
  showCategory: boolean
}>

/** Tools picked by id, in the order the ids appear. */
const pickTools = (ids: ReadonlyArray<string>): ReadonlyArray<Tool> =>
  ids.flatMap((id) => tools.filter((tool) => tool.meta.id === id))

/**
 * What the palette lists, in the order it lists it. With no query the list
 * answers "what next" from what the browser remembered, then falls back to the
 * catalogue. With a query it is the ranked matches, grouped for scanning.
 */
export const paletteGroups = (model: Model): ReadonlyArray<PaletteGroup> => {
  const ofCategory = (matches: ReadonlyArray<Tool>): ReadonlyArray<PaletteGroup> =>
    groupTools(matches).map((group) => ({ ...group, showCategory: false }))
  if (model.paletteQuery.trim() !== '')
    return groupByBestMatch(searchTools(tools, model.paletteQuery)).map((group) => ({
      ...group,
      showCategory: false,
    }))
  const recent = pickTools(model.recents).slice(0, 4)
  const recentIds = new Set(recent.map((tool) => tool.meta.id))
  const favorites = pickTools(model.favorites).filter((tool) => !recentIds.has(tool.meta.id))
  const favoriteIds = new Set(favorites.map((tool) => tool.meta.id))
  return [
    ...(recent.length === 0 ? [] : [{ name: 'Recent', tools: recent, showCategory: true }]),
    ...(favorites.length === 0
      ? []
      : [{ name: 'Favorites', tools: favorites, showCategory: true }]),
    ...ofCategory(
      tools.filter((tool) => !recentIds.has(tool.meta.id) && !favoriteIds.has(tool.meta.id)),
    ),
  ]
}

const saveCommand = (model: Model) =>
  SaveSettings({ favorites: model.favorites, recents: model.recents })

export const update = (model: Model, message: Message): Return =>
  Message.match<Return>(message, {
    GotUiMessage: ({ message: child }) => {
      const result = kit.update(model.ui, child)
      return {
        model: { ...model, ui: result.model },
        commands: Command.mapMessages(result.commands, (next) =>
          Message.GotUiMessage({ message: next }),
        ),
      }
    },
    ClickedLink: ({ request }) =>
      UrlRequest.match<Return>(request, {
        Internal: ({ url }) => ({ model, commands: [Navigate({ to: Url.toString(url) })] }),
        External: ({ href }) => ({ model, commands: [LoadPage({ href })] }),
      }),
    ChangedUrl: ({ url }) => {
      const next = enter(model, urlToRoute(url))
      return { model: next, commands: [saveCommand(next)] }
    },
    CompletedNavigation: () => ({ model }),
    GotToolMessage: ({ id, message: toolMessage }) => runTool(model, id, toolMessage),
    GotPaletteMessage: ({ message: child }) => {
      const result = FkDialog.update(model.palette, child)
      return {
        model: { ...model, palette: result.model },
        commands: Command.mapMessages(result.commands ?? [], (next) =>
          Message.GotPaletteMessage({ message: next }),
        ),
      }
    },
    OpenedPalette: () => {
      const result = FkDialog.open(model.palette)
      return {
        model: { ...model, palette: result.model, paletteQuery: '', paletteIndex: 0 },
        commands: Command.mapMessages(result.commands ?? [], (next) =>
          Message.GotPaletteMessage({ message: next }),
        ),
      }
    },
    ChangedPaletteQuery: ({ query }) => ({
      model: { ...model, paletteQuery: query, paletteIndex: 0 },
    }),
    CompletedPaletteScroll: () => ({ model }),
    MovedPaletteIndex: ({ delta }) => {
      const count = paletteResults(model).length
      const index = count === 0 ? 0 : (model.paletteIndex + delta + count) % count
      return {
        model: { ...model, paletteIndex: index },
        commands: [ScrollPaletteToResult({ index })],
      }
    },
    ChosePaletteResult: ({ id }) => {
      const tool = tools.find((candidate) => candidate.meta.id === id)
      if (tool === undefined) return { model }
      const closed = FkDialog.close(model.palette)
      return {
        model: { ...model, palette: closed.model },
        commands: [
          ...Command.mapMessages(closed.commands ?? [], (next) =>
            Message.GotPaletteMessage({ message: next }),
          ),
          Navigate({ to: pathOfTool(tool) }),
        ],
      }
    },
    ToggledFavorite: ({ id }) => {
      const favorites = model.favorites.includes(id)
        ? model.favorites.filter((favorite) => favorite !== id)
        : [...model.favorites, id]
      const next = { ...model, favorites }
      return { model: next, commands: [saveCommand(next)] }
    },
    CompletedSave: () => ({ model }),
    ClickedCopy: ({ text }) => ({ model, commands: [CopyText({ text })] }),
    GotToast: ({ item }) => ({
      model: { ...model, ui: { ...model.ui, toast: Toast.added(model.ui.toast, item) } },
    }),
    ChangedToasts: ({ ids }) => ({
      model: { ...model, ui: { ...model.ui, toast: Toast.synced(model.ui.toast, ids) } },
    }),
    ChangedDragging: ({ dragging }) => ({ model: { ...model, dragging } }),
    ReceivedFiles: ({ files }) => {
      const candidates = toolsFor(files)
      const current = toolOfRoute(model.route)
      const settled = { ...model, dragging: false }
      if (candidates.length === 0) {
        return {
          model: settled,
          commands: [
            ShowToast({
              title: 'No tool takes that file',
              description: 'Try another file, or pick a tool from the list.',
              type: 'error',
            }),
          ],
        }
      }
      const here = candidates.find((tool) => tool.meta.id === current?.meta.id)
      const only = candidates.length === 1 ? candidates[0] : undefined
      const target = here ?? only
      return target === undefined
        ? { model: { ...settled, pendingFiles: files } }
        : deliver(settled, target, files)
    },
    ChoseFileTool: ({ id }) => {
      const tool = tools.find((candidate) => candidate.meta.id === id)
      return tool === undefined ? { model } : deliver(model, tool, model.pendingFiles)
    },
    DismissedFiles: () => ({ model: { ...model, pendingFiles: [] } }),
  })

// ── View ────────────────────────────────────────────────────────────────────

export const view = (model: Model, h: HtmlBuilder<Message>): Document => shellView(model, h)

// ── Subscriptions ───────────────────────────────────────────────────────────

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

const hasFiles = (event: DragEvent): boolean => event.dataTransfer?.types.includes('Files') === true

export const subscriptions = Subscription.make<Model, Message>()((entry) => ({
  toasts: entry(
    { on: Schema.Boolean },
    {
      modelToDependencies: () => ({ on: true }),
      dependenciesToStream: () =>
        Stream.callback<Message>((queue) =>
          Effect.acquireRelease(
            Effect.sync(() =>
              Toast.watch(toaster, (ids) =>
                Queue.offerUnsafe(queue, Message.ChangedToasts({ ids })),
              ),
            ),
            (unsubscribe) => Effect.sync(unsubscribe),
          ).pipe(Effect.andThen(Effect.never)),
        ),
    },
  ),
  // Everything that happens to the whole page rather than to one element: the palette
  // shortcut, the copy buttons every tool renders, and files dropped or pasted anywhere.
  page: entry(
    { on: Schema.Boolean },
    {
      modelToDependencies: () => ({ on: true }),
      dependenciesToStream: () =>
        Stream.callback<Message>((queue) =>
          Effect.acquireRelease(
            Effect.sync(() => {
              const send = (message: Message) => Queue.offerUnsafe(queue, message)
              let depth = 0
              const onKeyDown = (event: KeyboardEvent) => {
                const modK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
                const slash = event.key === '/' && !isTyping(event.target)
                if (!modK && !slash) return
                event.preventDefault()
                send(Message.OpenedPalette())
              }
              const onClick = (event: MouseEvent) => {
                const source =
                  event.target instanceof Element ? event.target.closest('[data-copy]') : null
                const text = source?.getAttribute('data-copy')
                if (text !== null && text !== undefined) send(Message.ClickedCopy({ text }))
              }
              const onDragEnter = (event: DragEvent) => {
                if (!hasFiles(event)) return
                depth += 1
                send(Message.ChangedDragging({ dragging: true }))
              }
              const onDragLeave = (event: DragEvent) => {
                if (!hasFiles(event)) return
                depth = Math.max(0, depth - 1)
                if (depth === 0) send(Message.ChangedDragging({ dragging: false }))
              }
              const onDragOver = (event: DragEvent) => {
                if (hasFiles(event)) event.preventDefault()
              }
              const onDrop = (event: DragEvent) => {
                depth = 0
                const files = [...(event.dataTransfer?.files ?? [])]
                if (files.length === 0) return
                event.preventDefault()
                send(Message.ReceivedFiles({ files }))
              }
              const onPaste = (event: ClipboardEvent) => {
                const files = [...(event.clipboardData?.files ?? [])]
                if (files.length === 0) return
                event.preventDefault()
                send(Message.ReceivedFiles({ files }))
              }
              document.addEventListener('keydown', onKeyDown)
              document.addEventListener('click', onClick)
              document.addEventListener('dragenter', onDragEnter)
              document.addEventListener('dragleave', onDragLeave)
              document.addEventListener('dragover', onDragOver)
              document.addEventListener('drop', onDrop)
              document.addEventListener('paste', onPaste)
              return () => {
                document.removeEventListener('keydown', onKeyDown)
                document.removeEventListener('click', onClick)
                document.removeEventListener('dragenter', onDragEnter)
                document.removeEventListener('dragleave', onDragLeave)
                document.removeEventListener('dragover', onDragOver)
                document.removeEventListener('drop', onDrop)
                document.removeEventListener('paste', onPaste)
              }
            }),
            (cleanup) => Effect.sync(cleanup),
          ).pipe(Effect.andThen(Effect.never)),
        ),
    },
  ),
}))
