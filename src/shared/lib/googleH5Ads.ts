const isCrazyGamesBuild = process.env.NEXT_PUBLIC_BUILD_TARGET === 'crazygames';
const API_READY_TIMEOUT_MS = 10000;
const AD_REQUEST_TIMEOUT_MS = 10000;
const isGoogleH5AdsDebugEnabled = process.env.NEXT_PUBLIC_GOOGLE_H5_AD_DEBUG === 'on';
const GOOGLE_H5_ADS_DEBUG_LABEL = 'Google H5 Ads';
const NORMAL_RESPAWN_MESSAGE = 'Ad revive is unavailable right now. Respawn at Base Camp to continue.';

export const GOOGLE_H5_ADS_READY_EVENT = 'drilling-google-h5-ads-ready';

export type RewardedReviveAdResult =
  | { ok: true; status?: string }
  | {
      ok: false;
      reason:
        | 'unavailable'
        | 'dismissed'
        | 'not-ready'
        | 'timeout'
        | 'error'
        | 'frequency-capped'
        | 'invalid';
      message: string;
      status?: string;
    };

interface RewardedRevivePlacementCallbacks {
  onRewardAvailable: (showAd: () => void) => void;
  onAdStarted?: () => void;
  onAdFinished?: () => void;
  onResult: (result: RewardedReviveAdResult) => void;
}

export interface RewardedRevivePlacement {
  showAd: () => void;
  cancel: () => void;
}

/** Returns whether rewarded revive ads should be offered for the current build. */
export function isRewardedReviveAdEnabled(): boolean {
  return (
    !isCrazyGamesBuild &&
    typeof window !== 'undefined' &&
    window.__drillingGoogleH5AdsEnabled === true
  );
}

/**
 * Starts one rewarded revive placement and exposes Google's show function only
 * after the placement reports that the reward is available.
 */
export function startRewardedRevivePlacement(
  callbacks: RewardedRevivePlacementCallbacks,
): RewardedRevivePlacement {
  let settled = false;
  let adStarted = false;
  let showAdFn: (() => void) | null = null;
  let showAdRequested = false;
  let timeoutId: number | null = null;
  let readyListener: (() => void) | null = null;

  const clearWatchdog = () => {
    if (timeoutId === null || typeof window === 'undefined') return;
    window.clearTimeout(timeoutId);
    timeoutId = null;
  };

  const clearReadyListener = () => {
    if (!readyListener || typeof window === 'undefined') return;
    window.removeEventListener(GOOGLE_H5_ADS_READY_EVENT, readyListener);
    readyListener = null;
  };

  const finish = (result: RewardedReviveAdResult) => {
    if (settled) return;
    settled = true;
    clearWatchdog();
    clearReadyListener();
    recordGoogleH5Ads('placement-result', result);
    callbacks.onResult(result);
  };

  const placement: RewardedRevivePlacement = {
    showAd: () => {
      if (settled || showAdRequested) return;
      if (!showAdFn) {
        finish({
          ok: false,
          reason: 'not-ready',
          message: NORMAL_RESPAWN_MESSAGE,
          status: 'notReady',
        });
        return;
      }

      showAdRequested = true;
      recordGoogleH5Ads('show-ad');

      try {
        showAdFn();
      } catch (error) {
        finish({
          ok: false,
          reason: 'error',
          message: NORMAL_RESPAWN_MESSAGE,
          status: 'showAdError',
        });
      }
    },
    cancel: () => {
      if (settled) return;
      settled = true;
      clearWatchdog();
      clearReadyListener();
      recordGoogleH5Ads('placement-cancel');
    },
  };

  if (isCrazyGamesBuild || typeof window === 'undefined') {
    queueRewardedReviveResult(callbacks, {
      ok: false,
      reason: 'unavailable',
      message: NORMAL_RESPAWN_MESSAGE,
    });
    return placement;
  }

  const adBreak = window.adBreak;
  if (!isRewardedReviveAdEnabled() || typeof adBreak !== 'function') {
    queueRewardedReviveResult(callbacks, {
      ok: false,
      reason: 'not-ready',
      message: NORMAL_RESPAWN_MESSAGE,
    });
    return placement;
  }

  const startAdBreak = () => {
    if (settled) return;
    clearWatchdog();
    clearReadyListener();

    timeoutId = window.setTimeout(() => {
      finish({
        ok: false,
        reason: 'timeout',
        message: NORMAL_RESPAWN_MESSAGE,
        status: 'watchdogTimeout',
      });
    }, AD_REQUEST_TIMEOUT_MS);

    try {
      recordGoogleH5Ads('ad-break-start', { ready: window.__drillingGoogleH5AdsReady });

      adBreak({
        type: 'reward',
        name: 'death_revive',
        beforeAd: () => {
          if (settled) return;
          adStarted = true;
          recordGoogleH5Ads('before-ad');
          callbacks.onAdStarted?.();
        },
        afterAd: () => {
          if (!adStarted) return;
          adStarted = false;
          recordGoogleH5Ads('after-ad');
          callbacks.onAdFinished?.();
        },
        beforeReward: (showAd) => {
          if (settled) return;
          clearWatchdog();
          showAdFn = showAd;
          recordGoogleH5Ads('before-reward');
          callbacks.onRewardAvailable(placement.showAd);
        },
        adViewed: () => {
          recordGoogleH5Ads('ad-viewed');
          finish({ ok: true, status: 'viewed' });
        },
        adDismissed: () => {
          recordGoogleH5Ads('ad-dismissed');
          finish({
            ok: false,
            reason: 'dismissed',
            message: 'Ad was closed before completion. Respawn at Base Camp to continue.',
            status: 'dismissed',
          });
        },
        adBreakDone: (placementInfo) => {
          recordGoogleH5Ads('ad-break-done', placementInfo ?? null);
          if (settled) return;
          finish(resolveRewardedReviveAdBreakStatus(placementInfo?.breakStatus));
        },
      });
    } catch (error) {
      recordGoogleH5Ads('ad-break-error', error instanceof Error ? error.message : String(error));
      finish({
        ok: false,
        reason: 'error',
        message: NORMAL_RESPAWN_MESSAGE,
        status: 'adBreakError',
      });
    }
  };

  recordGoogleH5Ads('placement-start', { ready: window.__drillingGoogleH5AdsReady });

  if (window.__drillingGoogleH5AdsReady) {
    startAdBreak();
  } else {
    readyListener = startAdBreak;
    window.addEventListener(GOOGLE_H5_ADS_READY_EVENT, readyListener, { once: true });
    timeoutId = window.setTimeout(() => {
      finish({
        ok: false,
        reason: 'not-ready',
        message: NORMAL_RESPAWN_MESSAGE,
        status: 'readyWatchdogTimeout',
      });
    }, API_READY_TIMEOUT_MS);
  }

  return placement;
}

/** Converts Google's placement status into player-facing revive behavior. */
function resolveRewardedReviveAdBreakStatus(status?: string): RewardedReviveAdResult {
  switch (status) {
    case 'viewed':
      return { ok: true };
    case 'dismissed':
      return {
        ok: false,
        reason: 'dismissed',
        message: 'Ad was closed before completion. Respawn at Base Camp to continue.',
        status,
      };
    case 'notReady':
      return {
        ok: false,
        reason: 'not-ready',
        message: NORMAL_RESPAWN_MESSAGE,
        status,
      };
    case 'noAdPreloaded':
      return {
        ok: false,
        reason: 'unavailable',
        message: NORMAL_RESPAWN_MESSAGE,
        status,
      };
    case 'frequencyCapped':
      return {
        ok: false,
        reason: 'frequency-capped',
        message: NORMAL_RESPAWN_MESSAGE,
        status,
      };
    case 'timeout':
      return {
        ok: false,
        reason: 'timeout',
        message: NORMAL_RESPAWN_MESSAGE,
        status,
      };
    case 'invalid':
      return {
        ok: false,
        reason: 'invalid',
        message: NORMAL_RESPAWN_MESSAGE,
        status,
      };
    case 'error':
      return {
        ok: false,
        reason: 'error',
        message: NORMAL_RESPAWN_MESSAGE,
        status,
      };
    case 'ignored':
    case 'other':
      return {
        ok: false,
        reason: 'unavailable',
        message: NORMAL_RESPAWN_MESSAGE,
        status,
      };
    default:
      return {
        ok: false,
        reason: 'unavailable',
        message: NORMAL_RESPAWN_MESSAGE,
        status,
      };
  }
}

function queueRewardedReviveResult(
  callbacks: RewardedRevivePlacementCallbacks,
  result: RewardedReviveAdResult,
) {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(() => callbacks.onResult(result));
    return;
  }

  globalThis.setTimeout(() => callbacks.onResult(result), 0);
}

function debugGoogleH5Ads(event: string, payload?: unknown) {
  if (!isGoogleH5AdsDebugEnabled) return;
  if (payload === undefined) {
    console.info(`[${GOOGLE_H5_ADS_DEBUG_LABEL}] ${event}`);
    return;
  }

  console.info(`[${GOOGLE_H5_ADS_DEBUG_LABEL}] ${event}`, payload);
}

function recordGoogleH5Ads(event: string, payload?: unknown) {
  if (typeof window !== 'undefined') {
    window.__recordDrillingGoogleH5Ads?.(event, payload);
  }

  debugGoogleH5Ads(event, payload);
}
