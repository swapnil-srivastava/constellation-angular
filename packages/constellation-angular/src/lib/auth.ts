// Ported from pegasystems/angular-sdk v26.1.10 src/app/_samples/embedded/utils.ts (Apache-2.0).
import { sdkSetAuthHeader, sdkSetCustomTokenParamsCB } from '@pega/auth/lib/sdk-auth-manager';
import { ConstellationSdkConfig } from './types';

/**
 * Applies the custom auth modes supported by the Angular SDK embedded sample
 * (Basic, BasicTO, CustomIdentifier). For the normal OAuth flow it does nothing.
 */
export function initializeAuthentication(sdkConfigAuth: ConstellationSdkConfig['authConfig']): void {
  const noOAuthClient = sdkConfigAuth.mashupGrantType === 'none' || !sdkConfigAuth.mashupClientId;
  const password = sdkConfigAuth.mashupPassword ? window.atob(sdkConfigAuth.mashupPassword) : '';

  if (noOAuthClient && sdkConfigAuth.customAuthType === 'Basic') {
    sdkSetAuthHeader(`Basic ${window.btoa(`${sdkConfigAuth.mashupUserIdentifier}:${password}`)}`);
  }

  if (noOAuthClient && sdkConfigAuth.customAuthType === 'BasicTO') {
    const expTime = new Date(Date.now() + 5 * 60 * 1000);
    const isoTime = `${expTime.toISOString().split('.')[0]}Z`.replace(/[-:]/g, '');
    sdkSetAuthHeader(`Basic ${window.btoa(`${sdkConfigAuth.mashupUserIdentifier}:${password}:${isoTime}`)}`);
  }

  if (sdkConfigAuth.mashupGrantType === 'customBearer' && sdkConfigAuth.customAuthType === 'CustomIdentifier') {
    // Insecure, demo only (same caveat as Pega's sample)
    sdkSetCustomTokenParamsCB(() => ({ userIdentifier: sdkConfigAuth.mashupUserIdentifier }));
  }
}
