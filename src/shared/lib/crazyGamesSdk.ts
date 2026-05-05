type CrazyGamesGameApi = {
  gameplayStart?: (this: CrazyGamesGameApi) => void | Promise<void>;
  gameplayStop?: (this: CrazyGamesGameApi) => void | Promise<void>;
  loadingStart?: (this: CrazyGamesGameApi) => void | Promise<void>;
  loadingStop?: (this: CrazyGamesGameApi) => void | Promise<void>;
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
const SDK_WAIT_TIMEOUT_MS = 5000;
const SDK_WAIT_INTERVAL_MS = 50;

let initPromise: Promise<CrazyGamesSdk | null> | null = null;
let loadingStarted = false;
let loadingStartPending = false;
let loadingStopped = false;
let loadingStopPending = false;
let gameplayStarted = false;
let gameplayStartPending = false;

/** Delays SDK polling without blocking the main thread. */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** Waits for the CrazyGames script tag to expose the SDK on the window object. */
async function waitForCrazyGamesSdk(): Promise<CrazyGamesSdk | null> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < SDK_WAIT_TIMEOUT_MS) {
    const sdk = window.CrazyGames?.SDK;
    if (sdk) return sdk;

    await wait(SDK_WAIT_INTERVAL_MS);
  }

  return null;
}

/** Initializes the CrazyGames SDK when the hosted platform has injected it. */
async function initCrazyGamesSdk(): Promise<CrazyGamesSdk | null> {
  if (!isCrazyGamesBuild || typeof window === 'undefined') return null;

  if (!initPromise) {
    initPromise = waitForCrazyGamesSdk()
      .then(async (sdk) => {
        if (!sdk) {
          console.warn('[CrazyGames] SDK object was not detected before timeout.');
          return null;
        }

        await sdk.init?.();
        return sdk;
      })
      .catch((err) => {
        console.warn('[CrazyGames] SDK init failed:', err);
        return null;
      });
  }

  const sdk = await initPromise;
  if (!sdk) initPromise = null;

  return sdk;
}

/** Calls a CrazyGames game event after SDK initialization has completed. */
async function callSdkGameEvent(eventName: keyof CrazyGamesGameApi): Promise<boolean> {
  if (!isCrazyGamesBuild) return false;

  const sdk = await initCrazyGamesSdk();
  const gameApi = sdk?.game;
  const event = gameApi?.[eventName];
  if (!gameApi || !event) return false;

  await event.call(gameApi);
  return true;
}

/** Notifies CrazyGames that game asset loading has started. */
export function notifyCrazyGamesLoadingStart(): void {
  if (loadingStarted || loadingStartPending) return;

  loadingStartPending = true;
  void callSdkGameEvent('loadingStart')
    .then((called) => {
      if (called) {
        loadingStarted = true;
        loadingStopped = false;
      }
    })
    .catch((err) => {
      console.warn('[CrazyGames] loadingStart event failed:', err);
    })
    .finally(() => {
      loadingStartPending = false;
    });
}

/** Notifies CrazyGames that game asset loading has stopped. */
export function notifyCrazyGamesLoadingStop(): void {
  if (loadingStopped || loadingStopPending) return;

  loadingStopPending = true;
  void callSdkGameEvent('loadingStop')
    .then((called) => {
      if (called) loadingStopped = true;
    })
    .catch((err) => {
      console.warn('[CrazyGames] loadingStop event failed:', err);
    })
    .finally(() => {
      loadingStopPending = false;
    });
}

/** Notifies CrazyGames that the player reached interactive gameplay. */
export function notifyCrazyGamesGameplayStart(): void {
  if (gameplayStarted || gameplayStartPending) return;

  gameplayStartPending = true;
  void callSdkGameEvent('gameplayStart')
    .then((called) => {
      if (called) gameplayStarted = true;
    })
    .catch((err) => {
      console.warn('[CrazyGames] gameplayStart event failed:', err);
    })
    .finally(() => {
      gameplayStartPending = false;
    });
}

export {};
