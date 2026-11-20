# Override spec: <SDK component> → <design-system component>

Requirement IDs: CX-06 (add others)

## What is replaced
- SDK component key: `<TextInput | Dropdown | Button …>`
- Override component: `Ds<Name>Component` in `apps/demo/src/app/components/ds-<name>/`

## Design-system component
Name, import, and the props it takes. Token set in use.

## Mapping
| SDK / Pega prop | Design-system prop | Notes |
| --- | --- | --- |
| label | | |
| value | | |
| required | | |
| disabled | | |
| readOnly | | |
| helperText | | |
| validation message | | |

## Behaviour that must not change
- Value written back with `handleEvent(actionsApi, 'changeNblur', propName, value)` on blur or selection.
- Errors cleared with `pConn$.clearErrorMessages` on change.
- Display mode and read-only render the value as text.

## Acceptance tests
- [ ] Every field of this type in the Add-on Services view shows the design-system look.
- [ ] Same behaviour tests as the SDK component (see `apps/demo/src/testing/reference-text-input.spec.ts`).
