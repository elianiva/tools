// A suite is one page that holds several related tools. The tools keep their own Model,
// Messages, and view; the suite only picks which one is showing and routes messages to it.
import { Schema } from 'effect'
import { Command, Submodel } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import { acceptsFile } from './files.ts'
import { css } from '../../styled-system/css'
import { defineTool, type Tool, type ToolMeta } from './tool.ts'

type SuiteModel = Readonly<{
  /** The id of the tool on show. */
  variant: string
  /** Each tool's Model, created the first time the tool is opened. */
  models: Readonly<Record<string, unknown>>
}>

const Message = defineMessageUnion({
  Picked: { variant: Schema.String },
  Inner: { variant: Schema.String, message: Schema.Unknown },
})
type Message = typeof Message.Type

/** A suite is a Tool, so the router, palette, and recents treat it like any other. */
export type Suite = Tool &
  Readonly<{
    /** The tools on the page, in the order they are offered. */
    variants: ReadonlyArray<Tool>
    /** The Model with another tool on show. An old URL of a merged tool opens through this. */
    select: (model: unknown, variant: string) => unknown
  }>

type SuiteSpec = Readonly<{
  meta: Omit<ToolMeta, 'accepts' | 'keywords' | 'description'> &
    Readonly<{ description: string; keywords?: ReadonlyArray<string> }>
  tools: ReadonlyArray<Tool>
}>

const tabsCls = css({
  display: 'flex',
  gap: '0.25rem',
  overflowX: 'auto',
  scrollbarWidth: 'none',
  marginBottom: '0.4rem',
  borderBottom: '1px solid color-mix(in oklab, var(--foreground) 12%, transparent)',
  '& button': {
    flex: 'none',
    padding: '0.5rem 0.8rem',
    border: 0,
    borderBottom: '2px solid transparent',
    marginBottom: '-1px',
    background: 'transparent',
    boxShadow: 'none',
    color: 'var(--muted-foreground)',
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'color 150ms, border-color 150ms',
  },
  '& button:hover': { color: 'var(--foreground)' },
  '& button[aria-selected="true"]': {
    color: 'var(--foreground)',
    borderBottomColor: 'var(--primary)',
  },
})
const aboutCls = css({
  margin: '0 0 1rem',
  fontSize: '0.85rem',
  color: 'var(--muted-foreground)',
})

const unique = (values: ReadonlyArray<string>): ReadonlyArray<string> => [...new Set(values)]

export const defineSuite = (spec: SuiteSpec): Suite => {
  const variants = spec.tools
  const first = variants[0]
  if (first === undefined) throw new Error(`Suite ${spec.meta.id} has no tools.`)
  const find = (id: string): Tool => variants.find((tool) => tool.meta.id === id) ?? first
  const accepts = unique(variants.flatMap((tool) => tool.meta.accepts ?? []))

  const update = (model: SuiteModel, message: Message) =>
    Message.match<{ model: SuiteModel; commands?: ReadonlyArray<Command.Command<Message>> }>(
      message,
      {
        Picked: ({ variant }) => {
          const tool = find(variant)
          return {
            model: {
              variant: tool.meta.id,
              models:
                tool.meta.id in model.models
                  ? model.models
                  : { ...model.models, [tool.meta.id]: tool.init() },
            },
          }
        },
        Inner: ({ variant, message: inner }) => {
          const tool = find(variant)
          const id = tool.meta.id
          const result = tool.update(model.models[id] ?? tool.init(), inner)
          return {
            model: { variant: id, models: { ...model.models, [id]: result.model } },
            commands: Command.mapMessages(result.commands ?? [], (next) =>
              Message.Inner({ variant: id, message: next }),
            ),
          }
        },
      },
    )

  const view = Submodel.defineView<SuiteModel, Message>((model, h) => {
    const tool = find(model.variant)
    return h.div(
      [],
      [
        h.div(
          [h.Class(tabsCls), h.Role('tablist'), h.AriaLabel(spec.meta.name)],
          variants.map((entry) =>
            h.button(
              [
                h.Type('button'),
                h.Role('tab'),
                h.AriaSelected(entry.meta.id === tool.meta.id),
                h.OnClick(Message.Picked({ variant: entry.meta.id })),
              ],
              [entry.meta.name],
            ),
          ),
        ),
        h.p([h.Class(aboutCls)], [tool.meta.description]),
        tool.view(model.models[tool.meta.id] ?? tool.init(), h, (message) =>
          Message.Inner({ variant: tool.meta.id, message }),
        ),
      ],
    )
  })

  const suite = defineTool<SuiteModel, Message>({
    meta: {
      ...spec.meta,
      keywords: unique([
        ...(spec.meta.keywords ?? []),
        ...variants.flatMap((tool) => [tool.meta.name, ...tool.meta.keywords]),
      ]),
      ...(accepts.length === 0 ? {} : { accepts }),
    },
    init: () => ({ variant: first.meta.id, models: { [first.meta.id]: first.init() } }),
    update,
    view,
    ...(accepts.length === 0
      ? {}
      : {
          receive: (files: ReadonlyArray<File>) => {
            const tool =
              variants.find(
                (entry) =>
                  entry.receive !== undefined &&
                  files.some((file) => acceptsFile(entry.meta.accepts ?? [], file)),
              ) ?? first
            const mine = files.filter((file) => acceptsFile(tool.meta.accepts ?? [], file))
            return Message.Inner({ variant: tool.meta.id, message: tool.receive?.(mine) })
          },
        }),
  })
  return {
    ...suite,
    variants,
    // Safety: the app only passes the Model this suite returned from `init` or `update`.
    select: (model, variant) => update(model as SuiteModel, Message.Picked({ variant })).model,
  }
}

export const isSuite = (tool: Tool): tool is Suite => 'variants' in tool
