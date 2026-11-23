import { Dialog as FkDialog } from '@foldkit/ui'
import { stamp, Toast, type PartsConfig, type Message as UiMessage } from '@tools/adapter'
import { Elements } from '@tools/ui'
import { Option } from 'effect'
import type { Document, Html, HtmlBuilder } from 'foldkit/html'
import { css } from '../../styled-system/css'
import { AppRoute } from '../app/route.ts'
import type { Message, Model } from '../app/main.ts'
import { Message as AppMessage, toolsFor } from '../app/main.ts'
import { pathOfTool, toolOf, tools, toolsIn } from '../tools/registry.ts'
import { searchTools } from '../tools/search.ts'
import { CATEGORIES, categoryName, type CategoryId, type Tool } from '../tools/tool.ts'

type H = HtmlBuilder<Message>

const frameCls = css({ minHeight: '100vh', display: 'flex', flexDirection: 'column' })
const topbarCls = css({
  position: 'sticky',
  top: 0,
  zIndex: 10,
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '0.6rem 1.25rem',
  background: 'color-mix(in oklab, var(--background) 82%, transparent)',
  backdropFilter: 'blur(14px) saturate(1.4)',
  boxShadow: '0 1px 0 var(--hairline)',
})
const brandCls = css({
  fontFamily: 'var(--mono)',
  fontSize: '0.85rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--foreground)',
  textDecoration: 'none',
})
const searchButtonCls = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '2rem',
  minWidth: 'min(22rem, 100%)',
  padding: '0.45rem 0.6rem 0.45rem 0.85rem',
  color: 'var(--muted-foreground)',
  fontWeight: 400,
})
const bodyCls = css({
  display: 'grid',
  gridTemplateColumns: '15rem minmax(0, 1fr)',
  flex: 1,
  '@media (max-width: 56rem)': { gridTemplateColumns: 'minmax(0, 1fr)' },
})
const sideCls = css({
  position: 'sticky',
  top: '3.4rem',
  alignSelf: 'start',
  height: 'calc(100vh - 3.4rem)',
  overflowY: 'auto',
  padding: '0.5rem 0.8rem 2rem',
  '@media (max-width: 56rem)': { display: 'none' },
})
const groupCls = css({
  margin: '1rem 0.6rem 0.3rem',
  fontFamily: 'var(--mono)',
  fontSize: '0.68rem',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
})
const linkCls = css({
  display: 'block',
  padding: '0.3rem 0.6rem',
  borderRadius: '6px',
  color: 'var(--muted-foreground)',
  fontSize: '0.88rem',
  textDecoration: 'none',
  '&:hover': { background: 'var(--accent)', color: 'var(--foreground)' },
  '&[aria-current="page"]': {
    background: 'var(--raised-top)',
    boxShadow: 'var(--elev-raised)',
    color: 'var(--foreground)',
    fontWeight: 550,
  },
})
const mainCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  width: '100%',
  maxWidth: '58rem',
  padding: '2rem 1.5rem 5rem',
  '@media (min-width: 56rem)': { padding: '2.5rem 2.5rem 5rem' },
})
const titleCls = css({ margin: 0, fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em' })
const leadCls = css({ margin: 0, color: 'var(--muted-foreground)' })
const headerRowCls = css({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '1rem',
})
const sectionTitleCls = css({
  margin: '0 0 0.7rem',
  fontFamily: 'var(--mono)',
  fontSize: '0.7rem',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
})
const gridCls = css({
  display: 'grid',
  gap: '0.7rem',
  gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))',
})
const cardCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  padding: '0.9rem 1rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  color: 'var(--foreground)',
  textDecoration: 'none',
  transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 160ms',
  '&:hover': { boxShadow: 'var(--elev-float)', transform: 'translateY(-1px)' },
  '& strong': { fontWeight: 600, fontSize: '0.95rem' },
  '& span': { color: 'var(--muted-foreground)', fontSize: '0.83rem' },
})
const sectionsCls = css({ display: 'flex', flexDirection: 'column', gap: '2rem' })
const overlayCls = css({
  position: 'fixed',
  inset: 0,
  zIndex: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'color-mix(in oklab, var(--background) 70%, transparent)',
  backdropFilter: 'blur(6px)',
  outline: '2px dashed var(--primary)',
  outlineOffset: '-1.2rem',
  fontSize: '1.2rem',
  fontWeight: 550,
  pointerEvents: 'none',
})
const paletteCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  width: 'min(34rem, calc(100vw - 2rem))',
  maxHeight: 'min(30rem, 80vh)',
  padding: '0.6rem',
  '& ul': {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  '& li button': {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '0.5rem 0.65rem',
    borderRadius: '8px',
    background: 'transparent',
    boxShadow: 'none',
    textAlign: 'start',
  },
  '& li button[aria-selected="true"]': { background: 'var(--accent)' },
  '& li button span:last-child': { color: 'var(--muted-foreground)', fontSize: '0.8rem' },
})
const pickerCls = css({
  position: 'fixed',
  inset: 0,
  zIndex: 45,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgb(15 18 25 / 0.45)',
  '& > div': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    width: 'min(26rem, calc(100vw - 2rem))',
    padding: '1.1rem',
    borderRadius: '14px',
    background: 'var(--card)',
    boxShadow: 'var(--elev-float)',
  },
})

const hiddenCls = css({
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
})

const uiOf = (model: Model): PartsConfig<Message> => ({
  toMessage: (message: UiMessage) => AppMessage.GotUiMessage({ message }),
  anchor: model.anchorId,
})

const link = (h: H, href: string, label: string, current: boolean): Html =>
  h.a([h.Class(linkCls), h.Href(href), ...(current ? [h.AriaCurrent('page')] : [])], [label])

const currentToolId = (model: Model): string | undefined =>
  model.route._tag === 'Tool' ? model.route.id : undefined

// ── Top bar and sidebar ─────────────────────────────────────────────────────

const topbar = (h: H): Html =>
  h.header(
    [h.Class(topbarCls)],
    [
      h.a([h.Class(brandCls), h.Href('/')], ['tools']),
      h.button(
        [
          h.Class(searchButtonCls),
          h.Type('button'),
          h.AriaLabel('Search tools'),
          h.OnClick(AppMessage.OpenedPalette()),
        ],
        ['Search tools', Elements.kbd(h, '⌘K')],
      ),
    ],
  )

const sidebar = (h: H, model: Model): Html => {
  const current = currentToolId(model)
  const starred = model.favorites.flatMap((id) => tools.filter((tool) => tool.meta.id === id))
  return h.nav(
    [h.Class(sideCls), h.AriaLabel('Tools')],
    [
      ...(starred.length === 0
        ? []
        : [
            h.p([h.Class(groupCls)], ['Favorites']),
            ...starred.map((tool) =>
              link(h, pathOfTool(tool), tool.meta.name, tool.meta.id === current),
            ),
          ]),
      ...CATEGORIES.flatMap((category) => {
        const inCategory = toolsIn(category.id)
        return inCategory.length === 0
          ? []
          : [
              h.p([h.Class(groupCls)], [category.name]),
              ...inCategory.map((tool) =>
                link(h, pathOfTool(tool), tool.meta.name, tool.meta.id === current),
              ),
            ]
      }),
    ],
  )
}

// ── Pages ───────────────────────────────────────────────────────────────────

const toolCard = (h: H, tool: Tool): Html =>
  h.a(
    [h.Class(cardCls), h.Href(pathOfTool(tool))],
    [h.strong([], [tool.meta.name]), h.span([], [tool.meta.description])],
  )

const toolGrid = (h: H, list: ReadonlyArray<Tool>): Html =>
  h.div(
    [h.Class(gridCls)],
    list.map((tool) => toolCard(h, tool)),
  )

const section = (h: H, title: string, list: ReadonlyArray<Tool>): Html =>
  h.section([], [h.h2([h.Class(sectionTitleCls)], [title]), toolGrid(h, list)])

const pickTools = (ids: ReadonlyArray<string>): ReadonlyArray<Tool> =>
  ids.flatMap((id) => tools.filter((tool) => tool.meta.id === id))

const home = (h: H, model: Model): Html => {
  const recents = pickTools(model.recents).slice(0, 4)
  const starred = pickTools(model.favorites)
  return h.div(
    [h.Class(sectionsCls)],
    [
      h.h1([h.Class(titleCls)], ['Everyday tools']),
      ...(starred.length === 0 ? [] : [section(h, 'Favorites', starred)]),
      ...(recents.length === 0 ? [] : [section(h, 'Recent', recents)]),
      ...CATEGORIES.flatMap((category) => {
        const inCategory = toolsIn(category.id)
        return inCategory.length === 0 ? [] : [section(h, category.name, inCategory)]
      }),
    ],
  )
}

const categoryPage = (h: H, id: CategoryId): Html =>
  h.div(
    [h.Class(sectionsCls)],
    [
      Elements.breadcrumbs(h, [{ label: 'Tools', href: '/' }, { label: categoryName(id) }]),
      h.h1([h.Class(titleCls)], [categoryName(id)]),
      toolGrid(h, toolsIn(id)),
    ],
  )

const notFound = (h: H): Html =>
  Elements.empty(
    h,
    { title: 'Nothing here', description: 'That page does not exist.' },
    Elements.link(h, '/', ['Back to all tools']),
  )

const toolPage = (h: H, model: Model, tool: Tool): Html => {
  const starred = model.favorites.includes(tool.meta.id)
  return h.div(
    [h.Class(sectionsCls)],
    [
      h.div(
        [],
        [
          Elements.breadcrumbs(h, [
            { label: 'Tools', href: '/' },
            { label: categoryName(tool.meta.category), href: `/${tool.meta.category}` },
            { label: tool.meta.name },
          ]),
          h.div(
            [h.Class(headerRowCls)],
            [
              h.div(
                [],
                [
                  h.h1([h.Class(titleCls)], [tool.meta.name]),
                  h.p([h.Class(leadCls)], [tool.meta.description]),
                ],
              ),
              h.div(
                [],
                [
                  Elements.button(
                    h,
                    { variant: 'ghost' },
                    [
                      h.AriaPressed(starred ? 'true' : 'false'),
                      h.OnClick(AppMessage.ToggledFavorite({ id: tool.meta.id })),
                    ],
                    [starred ? 'Favorited' : 'Favorite'],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
      tool.view(model.tools[tool.meta.id] ?? tool.init(), h, (message) =>
        AppMessage.GotToolMessage({ id: tool.meta.id, message }),
      ),
      h.div([], [Elements.badge(h, 'success', ['Runs on your device'])]),
    ],
  )
}

const content = (h: H, model: Model): Html =>
  AppRoute.match<Html>(model.route, {
    Home: () => home(h, model),
    Category: ({ category }) =>
      CATEGORIES.some((entry) => entry.id === category)
        ? categoryPage(h, category as CategoryId)
        : notFound(h),
    Tool: ({ category, id }) => {
      const tool = toolOf(category, id)
      return tool === undefined ? notFound(h) : toolPage(h, model, tool)
    },
    NotFound: () => notFound(h),
  })

// ── Overlays ────────────────────────────────────────────────────────────────

const palette = (h: H, model: Model): Html => {
  const results = searchTools(tools, model.paletteQuery)
  const highlighted = results[model.paletteIndex]
  return h.submodel({
    slotId: 'palette',
    model: model.palette,
    view: FkDialog.view,
    toParentMessage: (message) => AppMessage.GotPaletteMessage({ message }),
    viewInputs: {
      hasDescription: false,
      toView: (r) =>
        h.dialog(
          [...r.dialog],
          [
            h.div([...r.backdrop, ...stamp(h, 'dialog-backdrop')], []),
            h.div(
              [...r.panel, ...stamp(h, 'dialog-content'), h.Class(paletteCls)],
              [
                h.h2([...r.title, h.Class(hiddenCls)], ['Search tools']),
                h.input([
                  h.Attribute('data-slot', 'input'),
                  h.Type('text'),
                  h.Placeholder('Search tools'),
                  h.Autocomplete('off'),
                  ...r.initialFocus,
                  h.AriaLabel('Search tools'),
                  h.Value(model.paletteQuery),
                  h.OnInput((query) => AppMessage.ChangedPaletteQuery({ query })),
                  h.OnKeyDownPreventDefault((key) =>
                    key === 'ArrowDown'
                      ? Option.some(AppMessage.MovedPaletteIndex({ delta: 1 }))
                      : key === 'ArrowUp'
                        ? Option.some(AppMessage.MovedPaletteIndex({ delta: -1 }))
                        : key === 'Enter' && highlighted !== undefined
                          ? Option.some(AppMessage.ChosePaletteResult({ id: highlighted.meta.id }))
                          : Option.none(),
                  ),
                ]),
                results.length === 0
                  ? Elements.empty(h, { title: 'No tools match' })
                  : h.ul(
                      [h.Role('listbox')],
                      results.map((tool, index) =>
                        h.li(
                          [h.Key(tool.meta.id)],
                          [
                            h.button(
                              [
                                h.Type('button'),
                                h.Role('option'),
                                h.AriaSelected(index === model.paletteIndex),
                                h.OnClick(AppMessage.ChosePaletteResult({ id: tool.meta.id })),
                              ],
                              [
                                h.span([], [tool.meta.name]),
                                h.span([], [categoryName(tool.meta.category)]),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
              ],
            ),
          ],
        ),
    },
  })
}

const filePicker = (h: H, model: Model): Html => {
  const candidates = toolsFor(model.pendingFiles)
  return h.div(
    [h.Class(pickerCls), h.Role('dialog'), h.AriaLabel('Open files with')],
    [
      h.div(
        [],
        [
          h.h2(
            [h.Class(sectionTitleCls)],
            [`Open ${model.pendingFiles.length === 1 ? 'file' : 'files'} with`],
          ),
          ...candidates.map((tool) =>
            Elements.button(
              h,
              { variant: 'secondary' },
              [h.OnClick(AppMessage.ChoseFileTool({ id: tool.meta.id }))],
              [tool.meta.name],
            ),
          ),
          Elements.button(
            h,
            { variant: 'ghost' },
            [h.OnClick(AppMessage.DismissedFiles())],
            ['Cancel'],
          ),
        ],
      ),
    ],
  )
}

const toasts = (h: H, model: Model): Html => {
  const t = Toast.parts(model.ui.toast, h, uiOf(model))
  return t.region(
    {},
    [],
    [
      t.list(
        {},
        [],
        [...model.ui.toast.items]
          .reverse()
          .map((item) =>
            t.root(
              { id: item.id },
              [],
              [
                t.title({ id: item.id }, [], [item.title]),
                t.description({ id: item.id }, [], [item.description]),
                t.close({ id: item.id }, [], ['×']),
              ],
            ),
          ),
      ),
    ],
  )
}

// ── Document ────────────────────────────────────────────────────────────────

const titleOf = (model: Model): string => {
  const tool =
    model.route._tag === 'Tool' ? toolOf(model.route.category, model.route.id) : undefined
  return tool === undefined ? 'Tools' : `${tool.meta.name} · Tools`
}

export const shellView = (model: Model, h: H): Document => ({
  title: titleOf(model),
  body: h.div(
    [h.Class(frameCls)],
    [
      topbar(h),
      h.div(
        [h.Class(bodyCls)],
        [sidebar(h, model), h.main([h.Class(mainCls), h.Id('main')], [content(h, model)])],
      ),
      palette(h, model),
      model.dragging ? h.div([h.Class(overlayCls)], ['Drop to open']) : null,
      model.pendingFiles.length > 0 ? filePicker(h, model) : null,
      toasts(h, model),
    ],
  ),
})
