# New component spec: <Component name>

Requirement IDs: CX-04, CX-05 (add others)

## Purpose
One or two sentences: what the user does with it and why the SDK default is not enough.

## Where it is used
- Case type: `DIXL-MediaCo-Work-AddonServices`
- View and field: <view name> → <property, e.g. .CurrentPlan>
- Registered as: `<Organization>_<Library>_<ComponentName>`

## Config props (from Pega)
| Prop | Type | Required | Notes |
| --- | --- | --- | --- |
| label | string | yes | |
| value | string | | |
| <custom prop> | | | |

## Data
Data page or list it reads, and which field is the stored value vs the display text.

## States
- [ ] Editable
- [ ] Required
- [ ] Read-only / display mode
- [ ] Disabled
- [ ] Hidden
- [ ] Validation message (client and server)
- [ ] Empty / loading data

## Look
Sketch or description. Design tokens to use.

## Accessibility
Keyboard behaviour, focus order, how the label and errors are announced.

## Acceptance tests
Each line becomes one test in the `.spec.ts`.
- [ ] …

## Out of scope
- …
