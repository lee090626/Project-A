const isCrazyGamesBuild = process.env.NEXT_PUBLIC_BUILD_TARGET === 'crazygames';
const AD_REQUEST_TIMEOUT_MS = 10000;
const isGoogleH5AdsDebugEnabled = process.env.NEXT_PUBLIC_GOOGLE_H5_AD_DEBUG === 'on';
const GOOGLE_H5_ADS_DEBUG_LABEL = 'Google H5 Ads';

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

  const clearWatchdog = () => {
    if (timeoutId === null || typeof window === 'undefined') return;
    window.clearTimeout(timeoutId);
    timeoutId = null;
  };

  const finish = (result: RewardedReviveAdResult) => {
    if (settled) return;
    settled = true;
    clearWatchdog();
    debugGoogleH5Ads('result', result);
    callbacks.onResult(result);
  };

  const placement: RewardedRevivePlacement = {
    showAd: () => {
      if (settled || showAdRequested) return;
      if (!showAdFn) {
        finish({
          ok: false,
          reason: 'not-ready',
          message: 'Rewarded ad is not ready yet. Use normal respawn this time.',
          status: 'notReady',
        });
        return;
      }

      showAdRequested = true;
      debugGoogleH5Ads('showAd');

      try {
        showAdFn();
      } catch (error) {
        finish({
          ok: false,
          reason: 'error',
          message: 'Rewarded ad failed to start. Try normal respawn.',
          status: 'showAdError',
        });
      }
    },
    cancel: () => {
      if (settled) return;
      settled = true;
      clearWatchdog();
      debugGoogleH5Ads('cancel');
    },
  };

  if (isCrazyGamesBuild || typeof window === 'undefined') {
    queueRewardedReviveResult(callbacks, {
      ok: false,
      reason: 'unavailable',
      message: 'Rewarded ads are not enabled for this build.',
    });
    return placement;
  }

  const adBreak = window.adBreak;
  if (!isRewardedReviveAdEnabled() || typeof adBreak !== 'function') {
    queueRewardedReviveResult(callbacks, {
      ok: false,
      reason: 'not-ready',
      message: 'Rewarded ads are not initialized yet. Try again in a moment.',
    });
    return placement;
  }

  timeoutId = window.setTimeout(() => {
    finish({
      ok: false,
      reason: 'timeout',
      message: 'Rewarded ad check timed out. Use normal respawn this time.',
      status: 'watchdogTimeout',
    });
  }, AD_REQUEST_TIMEOUT_MS);

  try {
    debugGoogleH5Ads('adBreak start');

    adBreak({
      type: 'reward',
      name: 'death_revive',
      beforeAd: () => {
        if (settled) return;
        adStarted = true;
        debugGoogleH5Ads('beforeAd');
        callbacks.onAdStarted?.();
      },
      afterAd: () => {
        if (!adStarted) return;
        adStarted = false;
        debugGoogleH5Ads('afterAd');
        callbacks.onAdFinished?.();
      },
      beforeReward: (showAd) => {
        if (settled) return;
        clearWatchdog();
        showAdFn = showAd;
        debugGoogleH5Ads('beforeReward');
        callbacks.onRewardAvailable(placement.showAd);
      },
      adViewed: () => {
        finish({ ok: true, status: 'viewed' });
      },
      adDismissed: () => {
        finish({
          ok: false,
          reason: 'dismissed',
          message: 'Ad was closed before completion. Try normal respawn.',
          status: 'dismissed',
        });
      },
      adBreakDone: (placementInfo) => {
        debugGoogleH5Ads('adBreakDone', placementInfo?.breakStatus ?? 'unknown');
        if (settled) return;
        finish(resolveRewardedReviveAdBreakStatus(placementInfo?.breakStatus));
      },
    });
  } catch (error) {
    finish({
      ok: false,
      reason: 'error',
      message: 'Rewarded ad failed to start. Try normal respawn.',
      status: 'adBreakError',
    });
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
        message: 'Ad was closed before completion. Try normal respawn.',
        status,
      };
    case 'notReady':
      return {
        ok: false,
        reason: 'not-ready',
        message: 'Ad Placement API is not initialized yet. Use normal respawn this time.',
        status,
      };
    case 'noAdPreloaded':
      return {
        ok: false,
        reason: 'unavailable',
        message: 'Rewarded ad is not preloaded yet. Use normal respawn this time.',
        status,
      };
    case 'frequencyCapped':
      return {
        ok: false,
        reason: 'frequency-capped',
        message: 'Rewarded ad is frequency capped. Use normal respawn this time.',
        status,
      };
    case 'timeout':
      return {
        ok: false,
        reason: 'timeout',
        message: 'Ad Placement API timed out. Use normal respawn this time.',
        status,
      };
    case 'invalid':
      return {
        ok: false,
        reason: 'invalid',
        message: 'Rewarded ad placement was rejected. Use normal respawn this time.',
        status,
      };
    case 'error':
      return {
        ok: false,
        reason: 'error',
        message: 'Rewarded ad failed in the browser. Try normal respawn.',
        status,
      };
    case 'ignored':
    case 'other':
      return {
        ok: false,
        reason: 'unavailable',
        message: 'No rewarded ad is available right now. Use normal respawn this time.',
        status,
      };
    default:
      return {
        ok: false,
        reason: 'unavailable',
        message: 'No rewarded ad is available right now. Try normal respawn.',
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
