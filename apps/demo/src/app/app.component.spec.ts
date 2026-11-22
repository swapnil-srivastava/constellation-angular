import { Component, input, output, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EmbedCaseComponent } from '@swapnil-srivastava/constellation-angular';
import { AppComponent } from './app.component';

@Component({ selector: 'cx-embed-case', template: '' })
class StubEmbedCaseComponent {
  readonly caseType = input<string>('');
  readonly cancelled = output<void>();
  readonly completed = output<void>();
  readonly failed = output<unknown>();
}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideZonelessChangeDetection()]
    })
      .overrideComponent(AppComponent, {
        remove: { imports: [EmbedCaseComponent] },
        add: { imports: [StubEmbedCaseComponent] }
      })
      .compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    document.body.appendChild(fixture.nativeElement);
    el = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  afterEach(() => (fixture.nativeElement as HTMLElement).remove());

  const button = (name: string): HTMLButtonElement | undefined =>
    Array.from(el.querySelectorAll('button')).find(b => b.textContent?.trim() === name);
  const heading = () => el.querySelector('main h1') as HTMLElement | null;
  const statusText = () => el.querySelector('main [role="status"]')?.textContent ?? '';
  const stub = () => fixture.debugElement.query(By.directive(StubEmbedCaseComponent));

  async function setStatus(s: 'completed' | 'cancelled' | 'failed'): Promise<void> {
    fixture.componentInstance.start();
    await fixture.whenStable();
    stub().componentInstance[s].emit();
    await fixture.whenStable();
  }

  it('idle shows one h1 inside main and a Start case button', () => {
    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(heading()?.textContent).toContain('Start a case');
    expect(el.querySelector('header')).not.toBeNull();
    expect(button('Start case')).toBeDefined();
  });

  it('Start renders cx-embed-case and passes caseType', async () => {
    button('Start case')!.click();
    await fixture.whenStable();
    expect(stub()).not.toBeNull();
    expect(stub().componentInstance.caseType()).toBe(fixture.componentInstance.caseType);
  });

  it('completed announces the result and Start again restarts the case', async () => {
    await setStatus('completed');
    expect(heading()?.textContent).toContain('Case submitted');
    expect(statusText()).toContain('submitted');
    button('Start again')!.click();
    await fixture.whenStable();
    expect(fixture.debugElement.queryAll(By.directive(StubEmbedCaseComponent)).length).toBe(1);
  });

  it('cancelled announces the result and offers Start again', async () => {
    await setStatus('cancelled');
    expect(heading()?.textContent).toContain('Case cancelled');
    expect(statusText()).toContain('cancelled');
    expect(button('Start again')).toBeDefined();
  });

  it('failed shows a plain message and Try again without developer instructions', async () => {
    await setStatus('failed');
    expect(heading()?.textContent).toContain('could not be started');
    expect(statusText()).not.toBe('');
    expect(el.textContent).not.toContain('Network tab');
    expect(button('Try again')).toBeDefined();
  });

  it('moves focus to the new heading on each state change', async () => {
    await setStatus('completed');
    expect(document.activeElement).toBe(heading());
    button('Start again')!.click();
    await fixture.whenStable();
    expect(heading()?.textContent).toContain('Your case');
    expect(document.activeElement).toBe(heading());
  });
});
