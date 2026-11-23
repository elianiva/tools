import { Effect, Layer } from 'effect'
import { Runtime } from 'foldkit'
import {
  Flags,
  init,
  kit,
  Message,
  Model,
  readSettings,
  subscriptions,
  update,
  view,
} from './app/main.ts'
import { ApiRpc } from './platform/rpc.ts'
import { reportCrash, reportSlow, startSentry, tracerLayer } from './platform/sentry.ts'
import './styles.css'

// First, so errors while the app boots are caught too.
startSentry()

const container = document.getElementById('root') ?? document.body

// The layer returns the id its registry is recorded under; Flags carry it to init and the Model.
const ui = kit.layer(container)

const application = Runtime.makeApplication({
  Model,
  Flags,
  init,
  update,
  view,
  subscriptions,
  routing: {
    onUrlRequest: (request) => Message.ClickedLink({ request }),
    onUrlChange: (url) => Message.ChangedUrl({ url }),
  },
  resources: Layer.mergeAll(ApiRpc.layer, tracerLayer, ui.layer),
  container,
  crash: { report: reportCrash },
  slow: { show: 'Always', onSlow: reportSlow },
  devTools: { Message },
})

Runtime.run(application, {
  flags: Effect.sync(() => ({ anchorId: ui.anchorId, ...readSettings() })),
})
