import { InjectionToken, Type } from '@angular/core';

/**
 * Shape of sdk-config.json as read by @pega/auth. Only the keys this package
 * touches are typed; everything else passes through unchanged.
 * See https://docs.pega.com/bundle/constellation-sdk/page/constellation-sdks/sdks/configuring-sdk-config-json.html
 */
export interface ConstellationSdkConfig {
  theme?: 'light' | 'dark' | string;
  authConfig: {
    authService?: string;
    mashupClientId?: string;
    mashupGrantType?: string;
    mashupUserIdentifier?: string;
    /** Base64 encoded. Only for local testing: anything here is readable in the browser. */
    mashupPassword?: string;
    customAuthType?: string;
    portalClientId?: string;
    [key: string]: unknown;
  };
  serverConfig: {
    infinityRestServerUrl: string;
    appAlias?: string;
    sdkContentServerUrl?: string;
    appMashupCaseType?: string;
    showModalsInEmbeddedMode?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** Map of Constellation component name to an Angular component that renders it. */
export type LocalComponentMap = Record<string, Type<unknown>>;

export interface ConstellationOptions {
  /**
   * Pass the config object directly instead of fetching ./sdk-config.json.
   * Useful when values come from your own backend or environment.
   */
  sdkConfig?: ConstellationSdkConfig;
  /**
   * Custom and override components, merged in front of Pega's component map
   * (same role as sdk-local-component-map.ts in the Angular SDK).
   */
  localComponentMap?: LocalComponentMap;
  /** Root id passed to the bootstrap shell's loadMashup. Defaults to 'app-root'. */
  mashupRootId?: string;
  /**
   * appName passed to loginIfNecessary. Defaults to the current path,
   * which is what the Angular SDK embedded sample does.
   */
  appName?: string;
}

export const CONSTELLATION_OPTIONS = new InjectionToken<ConstellationOptions>('CONSTELLATION_OPTIONS');
