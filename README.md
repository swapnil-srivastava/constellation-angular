# constellation-angular (monorepo)

Turborepo (pnpm) for embedding Pega Constellation cases in Angular.

| Path | What it is |
| --- | --- |
| `packages/constellation-angular` | `@swapnil-srivastava/constellation-angular`, a publishable Angular library (ng-packagr). Wraps Pega's `@pega/angular-sdk-components`: login, PCore bootstrap, create case, RootContainer. |
| `apps/demo` | Angular 21 app that consumes the library and starts a case. |

Pinned to Pega Angular SDK **26.1.10** (Infinity '26), Angular **21.2**, pnpm **10**, Node **22.12+** (Pega tests with Node 24).

## Run it

```bash
pnpm install
cp apps/demo/.env.example apps/demo/.env   # fill in server URL, OAuth client ID, case type
pnpm start                                 # builds the library, then serves the demo on http://localhost:3500
```

`apps/demo/scripts/write-sdk-config.mjs` turns `.env` into `apps/demo/public/sdk-config.json`. Both files are gitignored.
Everything in `sdk-config.json` is served to the browser, so use a public OAuth client (Authorization Code + PKCE) and no passwords outside local testing.

On the Pega side, the OAuth 2.0 client registration needs `http://localhost:3500/auth.html` as a redirect URI, and the server must allow CORS from `http://localhost:3500`.

## Build and publish the library

```bash
pnpm build                                          # turbo: library first (^build), then app
cd packages/constellation-angular/dist && npm publish # publishes @swapnil-srivastava/constellation-angular
```

Always publish from `dist/`, which ng-packagr generates with the right entry points.

## How the app consumes the library

- In the workspace, `apps/demo/tsconfig.json` maps the package name to `packages/constellation-angular/dist`, so the app uses the built output exactly as npm consumers will.
- Outside the workspace, `pnpm add @swapnil-srivastava/constellation-angular @pega/angular-sdk-components @pega/auth` and copy the asset globs from `apps/demo/angular.json`.

## Credits and licences

Library code and assets are adapted from [pegasystems/angular-sdk](https://github.com/pegasystems/angular-sdk) v26.1.10 (Apache-2.0); see `packages/constellation-angular/NOTICE`.
`@pega/constellationjs` (ConstellationJS Engine License) is a dev dependency of the app only and is never bundled into the library.

## Deploy the demo to Vercel

Live demo: https://constellation-angular-swapnil-srivastavas-projects-c9797073.vercel.app (redeploys on every push to `main`).

`vercel.json` builds the demo (and the library first) and serves `apps/demo/dist/browser`.
Set these in Vercel → Project → Settings → Environment Variables: `PEGA_SERVER_URL`, `PEGA_MASHUP_CLIENT_ID`, and optionally `PEGA_APP_ALIAS`, `PEGA_CASE_TYPE`.
Without them the build still succeeds but `sdk-config.json` is a placeholder and login won't work.
In Pega, add `https://<your-vercel-domain>/auth.html` as an OAuth redirect URI and allow CORS from that domain.
