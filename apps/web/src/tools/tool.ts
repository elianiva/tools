import type { Command, Submodel } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'

/** The groups the site is organised by. Order here is the order everywhere. */
export const CATEGORIES = [
  { id: 'images', name: 'Images' },
  { id: 'text', name: 'Text' },
  { id: 'developer', name: 'Developer' },
  { id: 'convert', name: 'Convert' },
  { id: 'calculate', name: 'Calculate' },
  { id: 'generate', name: 'Generate' },
] as const

export type CategoryId = (typeof CATEGORIES)[number]['id']

export const categoryName = (id: CategoryId): string =>
  CATEGORIES.find((category) => category.id === id)?.name ?? id

export type ToolMeta = Readonly<{
  /** The last path segment: `/text/word-counter`. Unique across the site. */
  id: string
  name: string
  category: CategoryId
  /** One line. Shown on cards and in the palette. */
  description: string
  /** Extra words the palette matches on. */
  keywords: ReadonlyArray<string>
  /** MIME types or `.ext` patterns the tool takes as files. A file dropped on the site offers these tools. */
  accepts?: ReadonlyArray<string>
}>

type Result<Model, Message> = Readonly<{
  model: Model
  commands?: ReadonlyArray<Command.Command<Message>>
}>

/**
 * What a tool author writes: a plain Foldkit component with its own Model and Message.
 * `receive` turns files dropped or pasted on the site into one of the tool's Messages.
 */
export type ToolSpec<Model, Message> = Readonly<{
  meta: ToolMeta
  init: () => Model
  update: (model: Model, message: Message) => Result<Model, Message>
  view: Submodel.View<Model, Message>
  receive?: (files: ReadonlyArray<File>) => Message
}>

/**
 * A tool with its Model and Message erased. The app holds every tool's state in one
 * record and routes messages by tool id, so it cannot know each tool's types. The casts
 * live in `defineTool` and nowhere else.
 */
export type Tool = Readonly<{
  meta: ToolMeta
  init: () => unknown
  update: (model: unknown, message: unknown) => Result<unknown, unknown>
  view: <Parent>(model: unknown, h: HtmlBuilder<Parent>, lift: (message: unknown) => Parent) => Html
  receive: ((files: ReadonlyArray<File>) => unknown) | undefined
}>

export const defineTool = <Model, Message>(spec: ToolSpec<Model, Message>): Tool => ({
  meta: spec.meta,
  init: spec.init,
  // Safety: the app only passes a tool the Model it returned from `init` and a Message
  // its own `view` or `receive` produced, because both are keyed by the tool's id.
  update: (model, message) => spec.update(model as Model, message as Message),
  view: (model, h, lift) =>
    h.submodel({
      slotId: spec.meta.id,
      view: spec.view,
      model: model as Model,
      toParentMessage: (message) => lift(message),
    }),
  receive: spec.receive,
})
