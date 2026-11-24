# New component spec: KvK number field (hand-built baseline)

Requirement IDs: CX-08 (baseline measurement), CX-04, CX-05 (the same bar the AI-built component must meet)
Status: draft for Swapnil, 2026-11-24
Built by: hand, **without any AI assistant** (Copilot and Claude switched off in the editor)

## Why this component
The demo compares building a component by hand with building one with the AI assistant (requirement analysis, build step 3). The two must be comparable but not the same, or the second build reuses what was learned in the first. The AI will build the Dutch IBAN field (validation with a checksum, derived display text). The baseline is the **KvK number field**, which has the same shape: a text field with a Dutch-specific format check and a formatted read-only display.

## Purpose
Business Account Opening asks for the company's KvK number (Dutch Chamber of Commerce registration number). The SDK's TextInput accepts any text. This field accepts digits only, checks that there are exactly 8, and shows the number grouped as `1234 5678` when read-only, so typing mistakes are caught before the case reaches KvK lookup or review.

## Where it is used
- Case type: `DIXL-MediaCo-Work-BusinessAccountOpening`
- Views and field: CreateForm_Default and CaptureCompanyDetails → `.KvKNumber`
- Registered as: `DIXL_MediaCo_KvKNumber` in `apps/demo/src/app/local-component-map.ts`. The key must match the name published to Pega exactly, including case; a missing or misspelled key shows the SDK's error box instead of the field.
- Folder: `apps/demo/src/app/components/kvk-number/` (`kvk-number.component.ts|html|scss|spec.ts`, `README.md`)
- Class: `KvkNumberComponent`, selector `app-kvk-number`, extends the SDK's `FieldBase`

## Config props (from Pega)
| Prop | Type | Required | Notes |
| --- | --- | --- | --- |
| label | string | yes | Via `updateComponentCommonProperties` |
| value | string | | Stored as 8 digits, no spaces |
| required, readOnly, disabled, visibility, displayMode | | | Standard field props, handled by `FieldBase` |
| helperText, placeholder, testId | string | | Standard |

## Data
No data page. The stored value is the 8 digits without spaces. The space in `1234 5678` is display only.

## Behaviour
- While typing: strip anything that is not a digit; allow at most 8 digits.
- On change: if the value differs, `pConn$.clearErrorMessages({ property: propName })`.
- On blur: if the value is not empty and not exactly 8 digits, show "Enter the 8-digit KvK number" and do not write it back. Otherwise call `handleEvent(actionsApi, 'changeNblur', propName, value)`.
- Server validation messages (from `angularPConnectData.validateMessage`) show the same way as the client message.

## States
- [ ] Editable
- [ ] Required (visible marker and `required` on the input)
- [ ] Read-only / display mode (shows `1234 5678` through `FieldValueList`)
- [ ] Disabled
- [ ] Hidden (`bVisible$ === false` renders nothing)
- [ ] Validation message (client and server)
- [ ] Empty value

## Look
Same Material form field as the SDK TextInput (`mat-form-field`, `--mat-sys-*` tokens only, no hard-coded colours). `inputmode="numeric"`, `autocomplete="off"`, `maxlength="9"` (allows the optional space while typing).

## Accessibility
- Visible `mat-label` tied to the input.
- Helper text and the error linked through `aria-describedby` (Material does this when `mat-hint` and `mat-error` are used).
- Keyboard: plain text input, no custom keys.
- The error text says what to do ("Enter the 8-digit KvK number"), not just "Invalid".

## Acceptance tests
Each line becomes one test in `kvk-number.component.spec.ts`. Use `createFakePConnect`, `provideFieldTestProviders` and `fieldInputs` and copy the shape of `apps/demo/src/testing/reference-text-input.spec.ts`.
- [ ] Renders the label and the stored value.
- [ ] Required: the input has `required`.
- [ ] Display mode shows `1234 5678`.
- [ ] Disabled: the control is disabled.
- [ ] Hidden: renders nothing.
- [ ] Non-digits are removed while typing.
- [ ] Seven digits on blur shows the error and makes no `changeNblur` call.
- [ ] Changing the value clears errors (`pConn.calls.clearErrorMessages`).
- [ ] Eight digits on blur writes the value back (`actionsApi.calls`).
- [ ] A server validation message is shown.

## Out of scope
- Looking the number up at KvK or checking that the company exists.
- Publishing the component definition to Pega (timed separately, same as for the AI build).

## How to run the baseline

### Part 1: publish the component to Pega (not timed)
Done by Claude in the cloud from the angular-sdk fork (`swapnil-srivastava/angular-sdk`, branch `feature/custom_component`), the same way as `DIXL_MediaCo_PublishCheck`. The AI-built IBAN field gets exactly the same setup.

1. The DX Component Builder creates `DIXL_MediaCo_KvKNumber` (Field, Text, organization DIXL, library MediaCo).
2. It is published to ruleset `CustomDXComponents` 01-01-01. Swapnil only pastes back the sign-in code.
3. Only the React preview copy and `config.json` go to Pega. It stays a plain text field; the real behaviour is the Angular component built in part 2.
4. Do not put the component on a view yet. The live app would show an error box until part 2 is merged and deployed.

Any extra property the component needs must be declared in `config.json` in the fork and published again. It then arrives in `this.pConn$.getConfigProps()`; read it in `updateSelf()` after `resolveConfigProps`.

### Part 2: build it by hand (timed)
Before you start the clock (not timed):

1. Check that part 1 is done.
2. Switch off Copilot and Claude in the editor and close any AI chat tabs.
3. In this repo: `git pull` on main, `pnpm install`, `pnpm --filter demo test`. The tests must pass; fix the setup first if they don't. Node 22.12 or newer is needed.
4. `git checkout -b baseline/kvk-number`.
5. Keep at hand: this spec, the SDK `TextInputComponent` source, `apps/demo/src/testing/reference-text-input.spec.ts`. These and the Angular docs are the only sources.

The timed part. Use one stopwatch, and write the clock time in the log at every switch between rows.

1. **Start the stopwatch.** Row "Read spec and SDK reference": read this spec, `FieldBase` and `TextInputComponent`.
2. Row "Tests written (failing)" starts when you create `kvk-number.component.spec.ts`. Write the 10 acceptance tests and run `pnpm --filter demo test`. It ends when they fail for the right reason (the component is missing or behaves wrongly), not because of a typo in a test.
3. Row "Component until tests pass": write the `.ts`, `.html`, `.scss` and `README.md` until all 10 tests pass.
4. Row "Register and run in the app": add `DIXL_MediaCo_KvKNumber: KvkNumberComponent` to `local-component-map.ts` and run `pnpm build`. It cannot be seen in a case yet, because no view uses it.
5. Row "Accessibility check", by hand in the browser's developer tools: the label is visible and tied to the input; the field can be reached and used with the Tab key alone; help and error text are linked through `aria-describedby`.
6. Row "`pnpm verify` green": run `pnpm verify` until it passes, counting every run. **Stop the stopwatch** when it passes.

Pause the stopwatch for breaks, calls, and anything not about this component (Pega, network, the computer). Write down why and how long. Problems with Angular, tests or lint are part of the work: keep the clock running.

After the clock stops:

1. Fill in the minutes per row, the total, the number of `pnpm verify` runs and the pauses.
2. Commit and open the PR titled `feat(demo): add KvK number field (hand-built baseline)`.
3. The Claude review on GitHub comments on the PR. Note the number of findings, and time any fixes separately as "revisions".

### Part 3: use it in the case (not timed)
After the PR is merged and deployed, set `.KvKNumber` to display as "KvK Number" in CaptureCompanyDetails and CreateForm_Default in Infinity Studio, then check it in the live app.

## Time log (fill in)
| Activity | Start | End | Minutes | Notes |
| --- | --- | --- | --- | --- |
| Read spec and SDK reference | | | | |
| Tests written (failing) | | | | |
| Component until tests pass | | | | |
| Register and run in the app | | | | |
| Accessibility check | | | | |
| `pnpm verify` green | | | | |
| **Total** | | | | |

Also note: number of `pnpm verify` runs, review findings and revisions. These go into the measurement table in the requirement analysis (CX-08).
