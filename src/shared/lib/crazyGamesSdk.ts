type CrazyGamesGameApi = {
  gameplayStart?: () => void | Promise<void>;
  gameplayStop?: () => void | Promise<void>;
  loadingStart?: () => void | Promise<void>;
  loadingStop?: () => void | Promise<void>;
};

interface CrazyGamesSdk {
  init?: () => void | Promise<void>;
  game?: CrazyGamesGameApi;
}

declare global {
  interface Window {
    CrazyGames?: {
      SDK?: CrazyGamesSdk;
    };
  }
}

const isCrazyGamesBuild = process.env.NEXT_PUBLIC_BUILD_TARGET === 'crazygames';

let initPromise: Promise<CrazyGamesSdk | null> | null = null;
let gameplayStarted = false;

/** Initializes the CrazyGames SDK when the hosted platform has injected it. */
async function initCrazyGamesSdk(): Promise<CrazyGamesSdk | null> {
  if (!isCrazyGamesBuild || typeof window === 'undefined') return null;

  const sdk = window.CrazyGames?.SDK;
  if (!sdk) return null;

  if (!initPromise) {
    initPromise = Promise.resolve(sdk.init?.())
      .then(() => sdk)
      .catch((err) => {
        console.warn('[CrazyGames] SDK init failed:', err);
        return null;
      });
  }

  return initPromise;
}

function callSdkGameEvent(eventName: keyof CrazyGamesGameApi): void {
  if (!isCrazyGamesBuild) return;

  void initCrazyGamesSdk()
    .then((sdk) => sdk?.game?.[eventName]?.())
    .catch((err) => {
      console.warn(`[CrazyGames] ${eventName} event failed:`, err);
    });
}

/** Notifies CrazyGames that game asset loading has started. */
export function notifyCrazyGamesLoadingStart(): void {
  callSdkGameEvent('loadingStart');
}

/** Notifies CrazyGames that game asset loading has stopped. */
export function notifyCrazyGamesLoadingStop(): void {
  callSdkGameEvent('loadingStop');
}

/** Notifies CrazyGames that the player reached interactive gameplay. */
export function notifyCrazyGamesGameplayStart(): void {
  if (gameplayStarted) return;
  gameplayStarted = true;
  callSdkGameEvent('gameplayStart');
}

export {};
