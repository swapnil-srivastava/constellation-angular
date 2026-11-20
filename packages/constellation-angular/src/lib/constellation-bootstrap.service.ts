// Bootstrap sequence ported from pegasystems/angular-sdk v26.1.10
// src/app/_samples/embedded/embedded.component.ts (Apache-2.0).
import { Injectable, inject } from '@angular/core';
import { getSdkConfig, loginIfNecessary } from '@pega/auth/lib/sdk-auth-manager';
import { compareSdkPCoreVersions, getSdkComponentMap } from '@pega/angular-sdk-components';
import { initializeAuthentication } from './auth';
import { constellationWindow, PConnectLike } from './pcore';
import { CONSTELLATION_OPTIONS, ConstellationSdkConfig } from './types';

/**
 * Logs in, loads the Constellation bootstrap shell and PCore, and initialises
 * the SDK component map. Runs once per page: PCore and the component map are
 * window-level singletons.
 */
@Injectable({ providedIn: 'root' })
export class ConstellationBootstrapService {
  private readonly options = inject(CONSTELLATION_OPTIONS, { optional: true }) ?? {};
  private ready?: Promise<PConnectLike>;

  /** Resolves with the root PConnect once PCore is ready. Safe to call many times. */
  start(): Promise<PConnectLike> {
    this.ready ??= this.boot().catch(err => {
      this.ready = undefined; // allow a retry
      throw err;
    });
    return this.ready;
  }

  private async boot(): Promise<PConnectLike> {
    const sdkConfig = (await getSdkConfig()) as ConstellationSdkConfig;
    const { authConfig, theme } = sdkConfig;

    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme || 'light');

    initializeAuthentication(authConfig);

    // Register before login: @pega/auth fires this once the bootstrap shell has loaded.
    const constellationReady = new Promise<void>(resolve =>
      document.addEventListener('SdkConstellationReady', () => resolve(), { once: true })
    );

    const path = window.location.pathname;
    const appName = this.options.appName ?? path.substring(path.indexOf('/') + 1);
    loginIfNecessary({ appName, mainRedirect: false });

    await constellationReady;

    return new Promise<PConnectLike>((resolve, reject) => {
      const win = constellationWindow();
      win.PCore!.onPCoreReady(async renderObj => {
        try {
          compareSdkPCoreVersions();
          await getSdkComponentMap(this.options.localComponentMap ?? {});
          // Required so PConnect.createComponent returns the c11n environment
          win.PCore!.registerComponentCreator(c11nEnv => c11nEnv);
          resolve(renderObj.props.getPConnect());
        } catch (err) {
          reject(err);
        }
      });

      if (!win.myLoadMashup) {
        reject(new Error('Bootstrap shell did not define loadMashup. Check that /constellation/bootstrap-shell.js is served.'));
        return;
      }
      win.myLoadMashup(this.options.mashupRootId ?? 'app-root', false);
    });
  }
}
