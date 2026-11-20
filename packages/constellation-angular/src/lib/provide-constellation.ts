import { EnvironmentProviders, makeEnvironmentProviders, provideEnvironmentInitializer } from '@angular/core';
import { setConfigRetrievalOverride } from '@pega/auth/lib/sdk-auth-manager';
import { CONSTELLATION_OPTIONS, ConstellationOptions } from './types';

/**
 * Registers Constellation embedding for the app.
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideHttpClient(), provideAnimations(), provideConstellation({ localComponentMap })]
 * });
 * ```
 */
export function provideConstellation(options: ConstellationOptions = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: CONSTELLATION_OPTIONS, useValue: options },
    provideEnvironmentInitializer(() => {
      const { sdkConfig } = options;
      if (sdkConfig) {
        // @pega/auth otherwise fetches ./sdk-config.json
        setConfigRetrievalOverride(async () => structuredClone(sdkConfig));
      }
    })
  ]);
}
