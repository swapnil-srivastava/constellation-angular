// Case start and RootContainer rendering ported from pegasystems/angular-sdk v26.1.10
// src/app/_samples/embedded/main-screen/main-screen.component.ts (Apache-2.0).
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, input, output, signal } from '@angular/core';
import { ComponentMapperComponent, Utils } from '@pega/angular-sdk-components';
import { SdkConfigAccess } from '@pega/auth/lib/sdk-auth-manager';
import { ConstellationBootstrapService } from './constellation-bootstrap.service';
import { getPCore, PConnectLike } from './pcore';

let nextId = 0;

/**
 * Starts a Constellation case and renders it in place.
 *
 * ```html
 * <cx-embed-case caseType="ORG-App-Work-MyCase" (completed)="done()" />
 * ```
 */
@Component({
  selector: 'cx-embed-case',
  imports: [ComponentMapperComponent],
  providers: [Utils],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pega-part-of-page cx-embed-case' },
  template: `
    @if (error(); as message) {
      <div class="cx-embed-case__error" role="alert">{{ message }}</div>
    } @else if (pConn(); as pConn$) {
      <component-mapper name="RootContainer" [props]="{ pConn$: pConn$, displayOnlyFA$: true }" />
    } @else {
      <div class="cx-embed-case__loading" aria-busy="true">Loading…</div>
    }
  `
})
export class EmbedCaseComponent implements OnInit, OnDestroy {
  /** Case type class, e.g. ORG-App-Work-MyCase. Falls back to serverConfig.appMashupCaseType when empty. */
  readonly caseType = input<string>('');
  /** Fields to set on the new case (Pega's startingFields). */
  readonly startingFields = input<Record<string, unknown>>({});
  /** Page the mashup renders into. */
  readonly pageName = input<string>('pyEmbedAssignment');

  /** The case has been created and the first assignment is rendering. */
  readonly started = output<void>();
  /** The user cancelled the assignment. */
  readonly cancelled = output<void>();
  /** The assignment finished processing. */
  readonly completed = output<void>();
  /** Login, bootstrap or case creation failed. */
  readonly failed = output<unknown>();

  protected readonly pConn = signal<PConnectLike | undefined>(undefined);
  protected readonly error = signal<string | undefined>(undefined);

  private readonly bootstrap = inject(ConstellationBootstrapService);
  private readonly subscriptionId = `cx-embed-case-${nextId++}`;
  private subscribed = false;

  async ngOnInit(): Promise<void> {
    try {
      const rootPConn = await this.bootstrap.start();
      this.subscribeToCaseEvents();
      this.pConn.set(rootPConn);
      await this.createCase();
      this.started.emit();
    } catch (err) {
      console.error('[constellation-embed]', err);
      this.error.set(err instanceof Error ? err.message : 'Could not start the case.');
      this.failed.emit(err);
    }
  }

  ngOnDestroy(): void {
    if (!this.subscribed) return;
    const pcore = getPCore();
    const { PUB_SUB_EVENTS } = pcore.getConstants();
    pcore.getPubSubUtils().unsubscribe(PUB_SUB_EVENTS.EVENT_CANCEL, this.subscriptionId);
    pcore.getPubSubUtils().unsubscribe(PUB_SUB_EVENTS.CASE_EVENTS.END_OF_ASSIGNMENT_PROCESSING, this.subscriptionId);
  }

  private subscribeToCaseEvents(): void {
    const pcore = getPCore();
    const { PUB_SUB_EVENTS } = pcore.getConstants();
    pcore.getPubSubUtils().subscribe(PUB_SUB_EVENTS.EVENT_CANCEL, () => this.cancelled.emit(), this.subscriptionId);
    pcore
      .getPubSubUtils()
      .subscribe(PUB_SUB_EVENTS.CASE_EVENTS.END_OF_ASSIGNMENT_PROCESSING, () => this.completed.emit(), this.subscriptionId);
    this.subscribed = true;
  }

  private async createCase(): Promise<void> {
    const pcore = getPCore();
    const caseType = this.caseType() || this.configuredCaseType();
    if (!caseType) {
      throw new Error('No case type: set the caseType input or serverConfig.appMashupCaseType.');
    }
    await pcore.getMashupApi().createCase(caseType, pcore.getConstants().APP.APP, {
      pageName: this.pageName(),
      startingFields: this.startingFields()
    });
  }

  private configuredCaseType(): string | undefined {
    const server = SdkConfigAccess?.getSdkConfigServer() as { appMashupCaseType?: string } | undefined;
    if (server?.appMashupCaseType) return server.appMashupCaseType;
    // Same fallback as the SDK sample: the first case type in the application
    return getPCore().getEnvironmentInfo().environmentInfoObject?.pyCaseTypeList?.[0]?.pyWorkTypeImplementationClassName;
  }
}
