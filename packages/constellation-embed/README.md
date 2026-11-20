# @swapnil-srivastava/constellation-embed

Embed a Pega Constellation case in any Angular 21 app. Built on Pega's `@pega/angular-sdk-components` 26.1.x (Infinity '26), which supplies RootContainer, FlowContainer, Assignment and all field components.

## Install

```bash
pnpm add @swapnil-srivastava/constellation-embed @pega/angular-sdk-components@~26.1.10 @pega/auth @angular/material
pnpm add -D @pega/constellationjs@~26.1.0
```

## Use

```ts
// main.ts
bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideAnimations(),
    provideConstellation({ localComponentMap: {} }) // reads ./sdk-config.json, or pass { sdkConfig }
  ]
});
```

```html
<cx-embed-case caseType="ORG-App-Work-MyCase" (completed)="onDone()" (cancelled)="onCancel()" />
```

```scss
// styles.scss
@use '@swapnil-srivastava/constellation-embed/styles/constellation';
```

| API | Purpose |
| --- | --- |
| `provideConstellation(options)` | `sdkConfig` (skip the sdk-config.json fetch), `localComponentMap` (custom and override components), `mashupRootId`, `appName`. |
| `<cx-embed-case>` | Inputs `caseType`, `startingFields`, `pageName` (default `pyEmbedAssignment`). Outputs `started`, `cancelled`, `completed`, `failed`. |
| `ConstellationBootstrapService.start()` | Login + PCore bootstrap once per page; resolves the root PConnect. |

## Host app assets

Copy these in `angular.json` `assets` (see the demo app):

- `@pega/constellationjs/dist/bootstrap-shell.*` and `lib_asset.json` → `constellation/`
- `@pega/constellationjs/dist/constellation-core.*` → `constellation/prerequisite/`, and `dist/js/**` → `constellation/prerequisite/js/`
- this package's `assets/icons/*.svg` → `constellation/assets/icons/`
- `@pega/auth/lib/oauth-client/auth.html` → `/`

## Limits

One embedded case per page: PCore, the bootstrap shell and the component map are window globals.
Not affiliated with Pegasystems. See NOTICE for adapted files and licences.
