/**
 * Minimal view of the window globals that the Constellation bootstrap shell
 * creates. Kept local so this package does not leak @pega/pcore-pconnect-typedefs
 * into its public types.
 */
export interface PConnectLike {
  getComponentName(): string;
  [key: string]: unknown;
}

export interface PCoreLike {
  onPCoreReady(cb: (renderObj: { props: { getPConnect(): PConnectLike } }) => void | Promise<void>): void;
  registerComponentCreator(cb: (c11nEnv: unknown) => unknown): void;
  getMashupApi(): {
    createCase(caseType: string, context: string, options: { pageName?: string; startingFields?: Record<string, unknown> }): Promise<unknown>;
  };
  getConstants(): {
    APP: { APP: string };
    PUB_SUB_EVENTS: { EVENT_CANCEL: string; CASE_EVENTS: { END_OF_ASSIGNMENT_PROCESSING: string } };
  };
  getEnvironmentInfo(): {
    environmentInfoObject?: { pyCaseTypeList?: { pyWorkTypeImplementationClassName: string }[] };
  };
  getPubSubUtils(): {
    subscribe(event: string, cb: (payload?: unknown) => void, id: string): void;
    unsubscribe(event: string, id: string): void;
  };
}

type ConstellationWindow = Window & {
  PCore?: PCoreLike;
  myLoadMashup?: (rootId: string, preLoadComponents: boolean) => void;
};

export const constellationWindow = (): ConstellationWindow => window as ConstellationWindow;

export function getPCore(): PCoreLike {
  const pcore = constellationWindow().PCore;
  if (!pcore) {
    throw new Error('PCore is not loaded yet. Call ConstellationBootstrapService.start() first.');
  }
  return pcore;
}
