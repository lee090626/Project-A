const isCrazyGamesBuild = process.env.NEXT_PUBLIC_BUILD_TARGET === 'crazygames';
const AD_REQUEST_TIMEOUT_MS = 10000;

export const GOOGLE_H5_ADS_READY_EVENT = 'drilling-google-h5-ads-ready';

export type RewardedReviveAdResult =
  | { ok: true }
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
      consumesAttempt: boolean;
      status?: string;
    };

interface RewardedReviveAdCallbacks {
  beforeAd?: () => void;
  afterAd?: () => void;
}

/** Returns whether rewarded revive ads should be offered for the current build. */
export function isRewardedReviveAdEnabled(): boolean {
  return (
    !isCrazyGamesBuild &&
    typeof window !== 'undefined' &&
    window.__drillingGoogleH5AdsEnabled === true
  );
}

/** Requests a rewarded ad and resolves only after the placement reports a final result. */
export function requestRewardedReviveAd(
  callbacks: RewardedReviveAdCallbacks = {},
): Promise<RewardedReviveAdResult> {
  if (isCrazyGamesBuild || typeof window === 'undefined') {
    return Promise.resolve({
      ok: false,
      reason: 'unavailable',
      message: 'Rewarded ads are not enabled for this build.',
      consumesAttempt: false,
    });
  }

  const adBreak = window.adBreak;
  if (!isRewardedReviveAdEnabled() || typeof adBreak !== 'function') {
    return Promise.resolve({
      ok: false,
      reason: 'not-ready',
      message: 'Rewarded ads are not initialized yet. Try again in a moment.',
      consumesAttempt: false,
    });
  }

  return new Promise((resolve) => {
    let settled = false;
    let adStarted = false;

    const finish = (result: RewardedReviveAdResult) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      if (adStarted) {
        callbacks.afterAd?.();
        adStarted = false;
      }
      resolve(result);
    };

    const timeoutId = window.setTimeout(() => {
      finish({
        ok: false,
        reason: 'timeout',
        message: 'Rewarded ad request timed out. Check ad blocker or try again.',
        consumesAttempt: false,
      });
    }, AD_REQUEST_TIMEOUT_MS);

    try {
      adBreak({
        type: 'reward',
        name: 'death_revive',
        beforeAd: () => {
          adStarted = true;
          callbacks.beforeAd?.();
        },
        afterAd: () => {
          if (adStarted) callbacks.afterAd?.();
          adStarted = false;
        },
        beforeReward: (showAdFn) => {
          showAdFn();
        },
        adViewed: () => {
          finish({ ok: true });
        },
        adDismissed: () => {
          finish({
            ok: false,
            reason: 'dismissed',
            message: 'Ad was closed before completion. Try normal respawn.',
            consumesAttempt: true,
          });
        },
        adBreakDone: (placementInfo) => {
          if (settled) return;
          finish(resolveRewardedReviveAdBreakStatus(placementInfo?.breakStatus));
        },
      });
    } catch (error) {
      finish({
        ok: false,
        reason: 'error',
        message: 'Rewarded ad failed to start. Try normal respawn.',
        consumesAttempt: true,
      });
    }
  });
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
        consumesAttempt: true,
        status,
      };
    case 'notReady':
      return {
        ok: false,
        reason: 'not-ready',
        message: 'Ad Placement API is not initialized yet. Try again in a moment.',
        consumesAttempt: false,
        status,
      };
    case 'noAdPreloaded':
      return {
        ok: false,
        reason: 'unavailable',
        message: 'Rewarded ad is not preloaded yet. Try again in a moment.',
        consumesAttempt: false,
        status,
      };
    case 'frequencyCapped':
      return {
        ok: false,
        reason: 'frequency-capped',
        message: 'Rewarded ad is frequency capped. Use normal respawn this time.',
        consumesAttempt: true,
        status,
      };
    case 'timeout':
      return {
        ok: false,
        reason: 'timeout',
        message: 'Ad Placement API timed out. Check ad blocker or try again.',
        consumesAttempt: false,
        status,
      };
    case 'invalid':
      return {
        ok: false,
        reason: 'invalid',
        message: 'Rewarded ad placement was rejected. Use normal respawn this time.',
        consumesAttempt: true,
        status,
      };
    case 'error':
      return {
        ok: false,
        reason: 'error',
        message: 'Rewarded ad failed in the browser. Try normal respawn.',
        consumesAttempt: true,
        status,
      };
    case 'ignored':
    case 'other':
      return {
        ok: false,
        reason: 'unavailable',
        message: 'No rewarded ad is available right now. Try again in a moment.',
        consumesAttempt: false,
        status,
      };
    default:
      return {
        ok: false,
        reason: 'unavailable',
        message: 'No rewarded ad is available right now. Try normal respawn.',
        consumesAttempt: false,
        status,
      };
  }
}
