/**
 * Reference test: shows how to test a FieldBase component with the fakes in
 * pconnect-test-helpers.ts, using the SDK's own TextInputComponent.
 * Copy this shape for custom components and overrides.
 */
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TextInputComponent } from '@pega/angular-sdk-components';
import { createFakePConnect, fieldInputs, provideFieldTestProviders } from './pconnect-test-helpers';

async function render(config: Parameters<typeof createFakePConnect>[0]) {
  await TestBed.configureTestingModule({
    imports: [TextInputComponent],
    providers: [provideZonelessChangeDetection(), provideNoopAnimations(), ...provideFieldTestProviders()]
  }).compileComponents();
  const pConn = createFakePConnect(config);
  const fixture = TestBed.createComponent(TextInputComponent);
  for (const [key, value] of Object.entries(fieldInputs(pConn))) fixture.componentRef.setInput(key, value);
  await fixture.whenStable();
  return { fixture, pConn, el: fixture.nativeElement as HTMLElement };
}

describe('Reference: SDK TextInputComponent with fake pConn', () => {
  it('renders the label and value from config props', async () => {
    const { el } = await render({ label: 'Customer email', value: 'a@b.com' });
    expect(el.textContent).toContain('Customer email');
    expect(el.querySelector('input')?.value).toBe('a@b.com');
  });

  it('marks the input required', async () => {
    const { el } = await render({ label: 'Email', required: true });
    expect(el.querySelector('input')?.required).toBe(true);
  });

  it('clears error messages when the value changes', async () => {
    const { el, pConn } = await render({ label: 'Email', value: '' });
    const input = el.querySelector('input')!;
    input.value = 'new';
    input.dispatchEvent(new Event('change'));
    expect(pConn.calls.clearErrorMessages).toEqual(['.TestProperty']);
  });
});
