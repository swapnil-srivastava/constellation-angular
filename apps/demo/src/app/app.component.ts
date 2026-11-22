import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { EmbedCaseComponent } from '@swapnil-srivastava/constellation-angular';

type Status = 'idle' | 'running' | 'cancelled' | 'completed' | 'failed';

const COPY: Record<Status, { title: string; message: string }> = {
  idle: { title: 'Start a case', message: 'Start a new case. The steps and fields come from your Pega application.' },
  running: { title: 'Your case', message: '' },
  completed: { title: 'Case submitted', message: 'Thank you. Your case was submitted.' },
  cancelled: { title: 'Case cancelled', message: 'The case was cancelled. Nothing was submitted.' },
  failed: { title: 'The case could not be started', message: 'Something went wrong while starting the case. Please try again.' }
};

@Component({
  selector: 'app-root',
  imports: [EmbedCaseComponent, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="app-header">
      <span class="app-name">Constellation case demo</span>
    </header>

    <main class="app-main">
      <h1 #heading tabindex="-1">{{ copy().title }}</h1>
      <!-- One persistent live region: screen readers announce its text when the status changes -->
      <p role="status" [class.app-status-empty]="!copy().message">{{ copy().message }}</p>
      @switch (status()) {
        @case ('running') {
          <!-- Leave caseType empty to use serverConfig.appMashupCaseType from sdk-config.json -->
          <cx-embed-case
            [caseType]="caseType"
            (cancelled)="status.set('cancelled')"
            (completed)="status.set('completed')"
            (failed)="status.set('failed')"
          />
        }
        @case ('failed') {
          <button mat-flat-button type="button" (click)="start()">Try again</button>
        }
        @case ('idle') {
          <button mat-flat-button type="button" (click)="start()">Start case</button>
        }
        @default {
          <button mat-flat-button type="button" (click)="start()">Start again</button>
        }
      }
    </main>
  `,
  styles: `
    :host {
      display: block;
    }
    .app-header {
      display: flex;
      align-items: center;
      min-height: 56px;
      padding: 0 16px;
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      font: var(--mat-sys-title-medium);
    }
    .app-main {
      max-width: 960px;
      margin: 0 auto;
      padding: 24px 16px 48px;
    }
    h1 {
      font: var(--mat-sys-headline-small);
      color: var(--mat-sys-on-background);
      margin: 0 0 12px;
    }
    h1:focus {
      outline: none;
    }
    h1:focus-visible,
    button:focus-visible {
      outline: 2px solid var(--mat-sys-primary);
      outline-offset: 4px;
    }
    .app-status-empty {
      display: none;
    }
    p {
      font: var(--mat-sys-body-large);
      color: var(--mat-sys-on-surface-variant);
      margin: 0 0 24px;
    }
  `
})
export class AppComponent {
  /**
   * Case type class to create. Empty uses PEGA_CASE_TYPE from sdk-config.json.
   * For quick tests you can override it in the URL: ?caseType=ORG-App-Work-MyCase
   */
  readonly caseType = new URLSearchParams(window.location.search).get('caseType') ?? '';
  readonly status = signal<Status>('idle');
  protected readonly copy = computed(() => COPY[this.status()]);

  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly injector = inject(Injector);
  private firstRender = true;

  constructor() {
    // Move focus to the new screen's heading so keyboard and screen reader users land on it.
    effect(() => {
      this.status();
      if (this.firstRender) {
        this.firstRender = false;
        return;
      }
      afterNextRender(() => this.heading()?.nativeElement.focus(), { injector: this.injector });
    });
  }

  start(): void {
    this.status.set('running');
  }
}
