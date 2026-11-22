# Demo app shell accessibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the demo app shell accessible and case-agnostic without touching the package or the Pega rendering.

**Architecture:** All changes live in `apps/demo/src/app/app.component.ts` (template, styles, focus handling) and `apps/demo/src/index.html` (default theme class on `<body>`). The case keeps rendering through `<cx-embed-case>` unchanged.

**Tech Stack:** Angular 21 (zoneless, standalone, signals), Angular Material 21, Vitest via `@angular/build:unit-test`.

**Spec:** `docs/specs/2026-11-22-demo-app-design.md`

## Global Constraints

- No change under `packages/constellation-angular`.
- No case-type-specific copy; nothing Pega configures is hard-coded.
- Shell colours come only from `--mat-sys-*` tokens; typography from Material classes or `--mat-sys-*` font tokens.
- No "Network tab" text on screen; developer detail goes to `console.error` (already logged by the package).
- `pnpm verify` passes.

## Review Focus

1. Pressing "Start again" after completed must create a fresh `<cx-embed-case>` (the old one is destroyed), not reuse it. Test: completed → Start again → one `cx-embed-case` present.
2. Focus moves to the heading on every state change, including back to running. Test: heading of the new state is `document.activeElement`.
3. Status text must be inside a `role="status"` element that exists in every state, so screen readers announce the change. Test per result state.
4. Header must not hide the "Start case" action from keyboard users when running (no action shown while running is fine; no focus trap).
5. `?caseType=` override still reaches `<cx-embed-case>`. Test: stub receives the `caseType` input.

---

### Task 1: Accessible, neutral app shell

**Files:**
- Modify: `apps/demo/src/app/app.component.ts`
- Modify: `apps/demo/src/index.html` (`<body class="mat-typography light">`)
- Test: `apps/demo/src/app/app.component.spec.ts`

**Interfaces:**
- Produces: `AppComponent.status: WritableSignal<'idle'|'running'|'cancelled'|'completed'|'failed'>`, `start(): void`.
- Test stub: `@Component({ selector: 'cx-embed-case' })` with `caseType` input and `cancelled`, `completed`, `failed` outputs, swapped in with `TestBed.overrideComponent`.

- [ ] **Step 1: Write the failing tests** in `app.component.spec.ts`:
  - `idle shows an h1 and a Start case button`
  - `Start renders cx-embed-case and passes caseType`
  - `completed announces the result and Start again restarts` (status region text contains "submitted"; button "Start again" → one `cx-embed-case`)
  - `cancelled announces the result and offers Start again`
  - `failed shows a plain message and Try again without the Network tab`
  - `moves focus to the new heading on each state change`
- [ ] **Step 2: Run** `pnpm --filter demo test` — expect the new tests to FAIL.
- [ ] **Step 3: Implement** in `app.component.ts`: `<header>` with app name (not an h1) ; `<main>` with one `h1` per state (`tabindex="-1"`, `#heading`); a `role="status"` paragraph per state; buttons "Start case", "Start again", "Try again"; focus via `effect` on `status()` + `afterNextRender` focusing the `viewChild('heading')`. Copy: idle h1 "Start a case", running h1 "Your case", completed "Case submitted", cancelled "Case cancelled", failed "The case could not be started".
- [ ] **Step 4: Run** `pnpm --filter demo test` — expect PASS.
- [ ] **Step 5: Commit** `feat(demo): accessible, case-agnostic app shell`.

### Task 2: Accessibility check and verify

- [ ] **Step 1:** Run `design:accessibility-review` on the built app (axe via Playwright on idle/completed/failed at 1280 and 390 px).
- [ ] **Step 2:** `pnpm verify` — expect lint, test and build to pass.
- [ ] **Step 3:** `/code-review medium`, fix findings, open the PR.
