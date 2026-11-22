# Design: demo app accessibility and neutral copy

Requirement IDs: CX-01, CX-02 (the create and submit flow this wraps)
Status: draft, waiting for Swapnil's approval
Scope: `apps/demo` app shell only (`app.component.ts`, `index.html`). No change to `packages/constellation-angular`.

## Why
The demo is shown to prospective clients. Swapnil (2026-11-22): the case is a Pega case and its look and content come from the Pega configuration, so the package stays as it is and whatever is configured in Pega must show through. The visual UI comes later. For now the app that hosts the case should follow sound style and accessibility guidelines itself, without assuming anything about the case.

## Goals
1. **Accessibility of the app shell.**
   - One `h1` per screen, inside `<header>` and `<main>` landmarks.
   - Loading, completed, cancelled and failed messages in a `role="status"` region so screen readers announce them.
   - Focus moves to the new screen's heading when the state changes (`tabindex="-1"`).
   - Every action is a real button with a visible label, reachable by keyboard.
2. **Neutral, case-agnostic copy.** No case-type-specific wording. Remove developer instructions (the Network tab line) from the screen; keep details in the console. Completed, cancelled and failed screens each get a "Start again" or "Try again" button.
3. **Styles come from tokens only.** The shell uses `--mat-sys-*` tokens and Material typography classes, no hard-coded colours, so whatever theme is configured (`theme` in `sdk-config.json`) shows in the shell and the case alike.

## Non-goals (later)
- Visual redesign, bank branding and a custom theme.
- Self-hosting fonts instead of Google Fonts.
- Any package change: the 50% form width, the 650px dialog minimum and the hidden stepper.

## Anti-goals
- Hard-coding anything that Pega configures (case name, steps, field labels).
- Changing how cases are created, rendered or submitted.

## Approaches considered
- **A. Small shell changes in `app.component.ts` (chosen).** Keeps the package and the Pega rendering untouched.
- B. Wrapper components per state. More structure than four short states need.

## Builder's calls (marked as mine)
- The start screen theme gap: the package adds the configured theme class to `<body>` only when a case starts. Putting the same class (`light`, the template default) on `<body>` in `index.html` makes the start screen match without touching the package. The configured theme still wins once the case starts.
- Focus handling with `afterNextRender` on the state heading.

## Acceptance tests (`app.component.spec.ts`)
- [ ] Idle shows an `h1` and a "Start case" button.
- [ ] Pressing Start renders `<cx-embed-case>` (stubbed).
- [ ] Completed and cancelled show their message in `role="status"` and a "Start again" button that returns to running.
- [ ] Failed shows a plain message and "Try again", with no mention of the Network tab.
- [ ] The state heading receives focus after a state change.
- [ ] `pnpm verify` passes.
