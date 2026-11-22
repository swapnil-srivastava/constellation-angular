import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { EmbedCaseComponent } from '@swapnil-srivastava/constellation-angular';

type Status = 'idle' | 'running' | 'cancelled' | 'completed' | 'failed';

@Component({
  selector: 'app-root',
  imports: [EmbedCaseComponent, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="app-header">
      <span class="app-name">Constellation case demo</span>
    </header>

    <main class="app-main">
      @switch (status()) {
        @case ('running') {
          <h1 #heading tabindex="-1">Your case</h1>
          <!-- Leave caseType empty to use serverConfig.appMashupCaseType from sdk-config.json -->
          <cx-embed-case
            [caseType]="caseType"
            (cancelled)="status.set('cancelled')"
            (completed)="status.set('completed')"
            (failed)="status.set('failed')"
          />
        }
        @case ('completed') {
          <h1 #heading tabindex="-1">Case submitted</h1>
          <p role="status">Thank you. Your case was submitted.</p>
          <button mat-flat-button type="button" (click)="start()">Start again</button>
        }
        @case ('cancelled') {
          <h1 #heading tabindex="-1">Case cancelled</h1>
          <p role="status">The case was cancelled. Nothing was submitted.</p>
          <button mat-flat-button type="button" (click)="start()">Start again</button>
        }
        @case ('failed') {
          <h1 #heading tabindex="-1">The case could not be started</h1>
          <p role="status">Something went wrong while starting the case. Please try again.</p>
          <button mat-flat-button type="button" (click)="start()">Try again</button>
        }
        @default {
          <h1 #heading tabindex="-1">Start a case</h1>
          <p>Start a new case. The steps and fields come from your Pega application.</p>
          <button mat-flat-button type="button" (click)="start()">Start case</button>
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
