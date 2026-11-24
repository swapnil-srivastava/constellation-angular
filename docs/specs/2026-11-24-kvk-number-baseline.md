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
- Registered as: `DIXL_MediaCo_KvKNumber` in `apps/demo/src/app/local-component-map.ts` (confirm the organization and library prefix Pega uses for MediaCo)
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
Follow the repo's six-step workflow in `CLAUDE.md`, but do every step yourself.

1. Switch off Copilot and Claude in the editor. Use the SDK source, the reference spec and Angular docs only.
2. Create a branch, for example `baseline/kvk-number`.
3. Start a stopwatch and write the start time in the log below.
4. Write `kvk-number.component.spec.ts` from the acceptance tests and run `pnpm --filter demo test` until the tests fail for the right reason.
5. Write the component, template, styles and README until the tests pass.
6. Register it in `local-component-map.ts`.
7. Do the accessibility check by hand: label, keyboard, `aria-describedby`.
8. Run `pnpm verify` until it passes. Stop the stopwatch.
9. Fill in the log. Open the PR with the title `feat(demo): add KvK number field (hand-built baseline)`.

Pause the stopwatch for breaks and anything not about this component, such as Pega or environment problems, and write down why.

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
