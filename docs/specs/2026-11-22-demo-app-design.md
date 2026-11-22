# Design: demo app look and feel

Requirement IDs: CX-01, CX-02 (the create and submit flow this styles)
Status: draft, waiting for Swapnil's approval
Scope: `apps/demo` only. The npm package (`packages/constellation-angular`) is not changed in this round.

## Why
The demo is shown to a Dutch bank (engineering lead, CTO, platform lead). Today the app looks unfinished: no theme is applied, the copy is written for developers, and a few accessibility basics are missing. The goal is a start screen and case states that look like a real customer journey, without touching how the case itself is rendered.

## Goals
1. **Theme (fix 1).** Apply one Material 3 theme to the whole app in `apps/demo/src/styles.scss`, so every `--mat-sys-*` token is set. This styles the header, buttons and all Pega SDK fields.
2. **Start screen and states (fix 4).** Replace developer copy with a product-like page:
   - Header: fictional bank name and logo mark (text only), no real bank's branding.
   - Idle: `h1` title, one line about the journey, primary "Start" button in the page body.
   - Running: the embedded case in a centred column.
   - Completed / cancelled: a short message plus a "Start again" button.
   - Failed: a plain-language message plus "Try again"; developer details go to the console only.
3. **Accessibility (fix 5).** One `h1` per state, header and main landmarks, result messages in a `role="status"` region, and focus moved to the new heading when the state changes.
4. **Fonts (fix 7).** Stop loading Roboto and Material Icons from Google's servers. Serve them from the app build instead.

## Non-goals
- No changes to the npm package: the 50% form width, the 650px dialog minimum and the hidden stepper stay for a later round.
- No custom field components or overrides.
- No dark mode.

## Anti-goals
- Copying any real bank's name, logo or colours.
- Changing how cases are created or submitted.

## Approaches considered
- **A. Theme only through Material tokens (chosen).** `mat.theme()` with a custom navy/teal palette on `html`. Every SDK component picks it up because they read the same tokens.
- B. Hand-written CSS overrides per component. More control, but fragile against SDK updates and much more code.
- C. Use the package's existing `.light` or `.mediaco` class. Cheapest, but not bank-like (violet or magenta).

## Decided
- Look: neutral navy and teal with a fictional bank name (recommended on the decision card; switch to option C if Swapnil picks MediaCo or violet).
- App only, package later (Swapnil, 2026-11-22).

## Builder's calls (marked as mine)
- Fictional name: "Polder Bank" (placeholder; easy to change in one constant).
- Fonts: self-host with the `@fontsource/roboto` and `material-icons` npm packages, so the look stays the same and no request goes to Google.
- Focus handling: `afterNextRender` on the state's heading with `tabindex="-1"`.

## Acceptance tests (`app.component.spec.ts`)
- [ ] Idle shows an `h1` and a "Start" button.
- [ ] Pressing Start renders `<cx-embed-case>` (stubbed).
- [ ] Completed and cancelled show a message in `role="status"` and a "Start again" button that returns to running.
- [ ] Failed shows a plain message and "Try again"; no mention of the Network tab.
- [ ] The state heading receives focus after a state change.
- [ ] `index.html` loads no `fonts.googleapis.com` URL.
- [ ] `pnpm verify` passes.
