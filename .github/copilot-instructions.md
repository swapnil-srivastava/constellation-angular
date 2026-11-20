# Copilot instructions

Instructions for AI coding assistants working in this repository. Claude reads the same rules from `CLAUDE.md` at the repo root; keep the two in sync.

## What this repo is

A pnpm + Turborepo monorepo that renders a Pega Constellation case in Angular.

| Path | What it is |
| --- | --- |
| `packages/constellation-angular` | `@swapnil-srivastava/constellation-angular`, a thin ng-packagr wrapper around `@pega/angular-sdk-components` 26.1.10: login, PCore bootstrap, `createCase`, `<cx-embed-case>`. Published to npm. |
| `apps/demo` | Angular 21 demo app (zoneless, standalone). Consumes the package and holds this project's custom components and design-system overrides. Deployed to Vercel. |
| `apps/demo/src/app/components/` | Custom components and overrides, one folder each. |
| `apps/demo/src/app/local-component-map.ts` | Registers components with the SDK. |
| `apps/demo/src/testing/` | Test fakes for `pConn$` and the SDK services, plus a reference spec. |
| `docs/specs/` | Spec templates for a new component and an override. |

Versions: Pega Infinity '26, `@pega/angular-sdk-components` ~26.1.10, `@pega/constellationjs` ~26.1.0, Angular ~21.2. Do not upgrade any of them without being asked; the SDK must match the Infinity version.

## Hard rules

- Never edit Pega's packages (`node_modules/@pega/*`). Reuse them through imports and the component map.
- Never copy `@pega/constellationjs` into the repo or the npm package. It is proprietary; the app only copies its assets at build time.
- No credentials in the repo. `apps/demo/.env` and `public/sdk-config.json` are gitignored; only `sdk-config.template.json` and `.env.example` are committed.
- No bank code, internal packages or internal environment details.
- Every new component or override ships with a `*.spec.ts`, and `pnpm lint`, `pnpm test` and `pnpm build` must pass.

## How a Constellation field component works

The SDK passes each field component two inputs and expects it to keep itself in sync with the Constellation store. Extend the SDK's `FieldBase`, which already does the wiring. Use the SDK's `TextInputComponent` as the reference implementation (`node_modules/@pega/angular-sdk-components/fesm2022/pega-angular-sdk-components.mjs`, search `class TextInputComponent`).

1. **Inputs.** `FieldBase` declares `@Input() pConn$` (the component's PConnect object) and `@Input() formGroup$` (the parent Angular form). Do not redeclare them.
2. **Register and subscribe.** `FieldBase.ngOnInit` registers with `AngularPConnectService`, adds `fieldControl` to `formGroup$`, and stores `actionsApi` and `propName` (from `pConn$.getStateProps().value`). If you override `ngOnInit` or `ngOnDestroy`, call `super`.
3. **Resolve config.** Implement `override updateSelf()`:
   ```ts
   this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
   this.updateComponentCommonProperties(this.configProps$); // label, required, readOnly, disabled, visibility, displayMode, helperText, placeholder, testId, validation message
   const { value } = this.configProps$;
   this.value$ = value;
   ```
   `updateSelf` runs on every store change, so keep it cheap and side-effect free.
4. **States to handle.** Every field must handle:
   - `bVisible$ === false`: render nothing.
   - `displayMode$` set (`DISPLAY_ONLY`, `STACKED_LARGE_VAL`): render the value read-only, usually via `<component-mapper name="FieldValueList">`.
   - `bReadonly$` or no form (`!bHasForm$`): read-only rendering.
   - `bRequired$`: `required` on the control and a visible required marker.
   - `bDisabled$`: `FieldBase` already disables `fieldControl`.
   - Validation: show `getErrorMessage()` when `fieldControl.invalid`. Server messages arrive through `angularPConnectData.validateMessage`.
   - `helperText` and the warning style via `[appFieldWarning]="bFieldMessageVisible$"`.
5. **Write values back.**
   - On change: if the value differs, call `this.pConn$.clearErrorMessages({ property: this.propName })`.
   - On blur, or on selection for pickers: `handleEvent(this.actionsApi, 'changeNblur', this.propName, value)` (import `handleEvent` from `@pega/angular-sdk-components`).
6. **Change detection.** The app is zoneless. Follow the `FieldBase` pattern (plain fields set in `updateSelf`) and do not add `OnPush` to `FieldBase` subclasses. New non-field components may use signals and `OnPush`.

## Registering a component

Add it to `apps/demo/src/app/local-component-map.ts`. The SDK checks this map before its own, so the key decides what happens:

- **Override** an SDK component: use the SDK's name as the key (for example `TextInput`, `Dropdown`, `Checkbox`; the full list is `pegaSdkComponentMap` in the SDK bundle).
- **Custom component**: use the name Pega knows it by after publishing, in the form `<Organization>_<Library>_<ComponentName>`.

## Where files go

```
apps/demo/src/app/components/<kebab-name>/
  <kebab-name>.component.ts       # standalone component, selector prefix "app-"
  <kebab-name>.component.html
  <kebab-name>.component.scss
  <kebab-name>.component.spec.ts
  README.md                       # what it does, config props, states
```

Class names end in `Component`. Override components are named after what they replace, for example `DsTextInputComponent` in `ds-text-input/`.

## Tests

- Runner: Vitest through Angular's `@angular/build:unit-test` builder.
- Use the fakes in `apps/demo/src/testing/pconnect-test-helpers.ts`: `createFakePConnect(config)`, `provideFieldTestProviders()` and `fieldInputs(pConn)`. Copy the shape of `apps/demo/src/testing/reference-text-input.spec.ts`.
- Cover at least: renders label and value; required; read-only or display mode; disabled; hidden; validation message shown; change clears errors; blur or selection writes the value (`actionsApi.calls`).
- Use `provideZonelessChangeDetection()` and `await fixture.whenStable()`.

## Commands

Run from the repo root:

```sh
pnpm install
pnpm build                               # library, then demo
pnpm lint                                # ESLint (angular-eslint, template a11y rules)
pnpm test                                # Vitest
pnpm --filter demo test                  # demo tests only
pnpm start                               # demo on http://localhost:3500 (needs apps/demo/.env)
```

The library must be built before the demo compiles (`turbo` handles this through `^build`).

## Pull requests and releases

- PR titles follow Conventional Commits (`feat(demo): add plan cards`, `fix: ...`, `chore: ...`; `!` after the type marks a breaking change). PRs are squash-merged, so the title becomes the commit on main. CI checks it.
- If a PR changes `packages/constellation-angular` (other than `*.md` and `*.spec.ts`) and its type is `feat`, `fix`, `perf` or breaking, bump `version` in `packages/constellation-angular/package.json` in the same PR: `fix`/`perf` patch, `feat` minor, breaking major (minor while below 1.0.0). CI checks it.
- After CI passes on main, the Release workflow publishes the package to npm if that version is not there yet, and creates the `v<version>` tag and GitHub release. Never publish by hand.

## Working style

- Start from a spec in `docs/specs/` and refer to requirements by ID (CX-01 and so on).
- Small diffs. Do not reformat or refactor code you were not asked to touch.
- Accessibility: keep a visible label, keyboard operation, and `aria-describedby` linking errors and help text to the control.
- Say when something is unverified or version-specific. Do not invent Pega APIs. If a PConnect method is not used by an SDK component, check the SDK source before relying on it.
