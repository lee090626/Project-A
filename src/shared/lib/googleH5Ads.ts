const isCrazyGamesBuild = process.env.NEXT_PUBLIC_BUILD_TARGET === 'crazygames';
const AD_REQUEST_TIMEOUT_MS = 10000;

export const GOOGLE_H5_ADS_READY_EVENT = 'drilling-google-h5-ads-ready';

export type RewardedReviveAdResult =
  | { ok: true }
  | {
      ok: false;
      reason: 'unavailable' | 'dismissed' | 'not-ready' | 'timeout' | 'error';
      message: string;
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

/** Returns whether the Google H5 ad placement API is ready to serve requests. */
export function isRewardedReviveAdConfigured(): boolean {
  return (
    isRewardedReviveAdEnabled() &&
    window.__drillingGoogleH5AdsReady === true &&
    typeof window.adBreak === 'function'
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
    });
  }

  const adBreak = window.adBreak;
  if (window.__drillingGoogleH5AdsReady !== true || typeof adBreak !== 'function') {
    return Promise.resolve({
      ok: false,
      reason: 'not-ready',
      message: 'Rewarded ads are still loading. Try normal respawn.',
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
        message: 'Rewarded ad request timed out. Try normal respawn.',
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
          });
        },
        adBreakDone: (placementInfo) => {
          if (settled) return;
          const status = placementInfo?.breakStatus;
          finish({
            ok: false,
            reason: status ? 'unavailable' : 'not-ready',
            message: 'No rewarded ad is available. Try normal respawn.',
          });
        },
      });
    } catch (error) {
      finish({
        ok: false,
        reason: 'error',
        message: 'Rewarded ad failed to start. Try normal respawn.',
      });
    }
  });
}
