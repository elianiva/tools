import { Option, pipe, Schema } from 'effect'
import { Route, Url } from 'foldkit'
import { mapTo, oneOf, parseUrlWithFallback, root, slash, string } from 'foldkit/route'

export const AppRoute = Route.defineRouteUnion({
  Home: {},
  Category: { category: Schema.String },
  Tool: { category: Schema.String, id: Schema.String },
  NotFound: { path: Schema.String },
})
export type AppRoute = typeof AppRoute.Type

export const homeRouter = pipe(root, mapTo(AppRoute.Home))
export const categoryRouter = pipe(string('category'), mapTo(AppRoute.Category))
export const toolRouter = pipe(string('category'), slash(string('id')), mapTo(AppRoute.Tool))

export const urlToRoute = parseUrlWithFallback(
  oneOf(toolRouter, categoryRouter, homeRouter),
  AppRoute.NotFound,
)

/** The URL a route lives at. The one place a path is written. */
export const pathOf = (route: AppRoute): string =>
  AppRoute.match<string>(route, {
    Home: () => homeRouter(),
    Category: ({ category }) => categoryRouter({ category }),
    Tool: ({ category, id }) => toolRouter({ category, id }),
    NotFound: ({ path }) => path,
  })

/** A `Url` for a path, as the browser would hand it to `init`. Tests use it too. */
export const urlOf = (pathname: string): Url.Url => ({
  protocol: 'http:',
  host: 'localhost',
  port: Option.none(),
  pathname,
  search: Option.none(),
  hash: Option.none(),
})
