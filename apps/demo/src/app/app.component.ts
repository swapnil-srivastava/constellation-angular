import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { EmbedCaseComponent } from '@swapnil-srivastava/constellation-embed';

type Status = 'idle' | 'running' | 'cancelled' | 'completed' | 'failed';

@Component({
  selector: 'app-root',
  imports: [EmbedCaseComponent, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-header">
      <strong>Constellation embed demo</strong>
      @if (status() !== 'running') {
        <button mat-flat-button (click)="start()">Start case</button>
      }
    </header>

    <main>
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
        @case ('completed') {
          <p class="demo-message">Thanks, the case was submitted.</p>
        }
        @case ('cancelled') {
          <p class="demo-message">Case cancelled.</p>
        }
        @case ('failed') {
          <p class="demo-message">Could not start the case. Check the browser console and sdk-config.json.</p>
        }
        @default {
          <p class="demo-message">Press "Start case" to create a case on your Pega server.</p>
        }
      }
    </main>
  `,
  styles: `
    .demo-message {
      padding: 24px;
    }
  `
})
export class AppComponent {
  /** Set your case type class here, or in .env as PEGA_CASE_TYPE. */
  readonly caseType = '';
  readonly status = signal<Status>('idle');

  start(): void {
    this.status.set('running');
  }
}
