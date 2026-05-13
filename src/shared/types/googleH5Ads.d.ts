export {};

declare global {
  interface Window {
    __drillingGoogleH5AdsEnabled?: boolean;
    __drillingGoogleH5AdsReady?: boolean;
    __drillingGoogleH5AdsDebug?: boolean;
    __drillingGoogleH5AdsEvents?: GoogleH5AdsDebugEvent[];
    __recordDrillingGoogleH5Ads?: (event: string, payload?: unknown) => void;
    adsbygoogle?: unknown[];
    adBreak?: (options: GoogleH5AdBreakOptions) => void;
    adConfig?: (options: GoogleH5AdConfigOptions) => void;
  }

  interface GoogleH5AdsDebugEvent {
    event: string;
    payload?: unknown;
    at: number;
  }

  interface GoogleH5AdConfigOptions {
    preloadAdBreaks?: 'on' | 'auto';
    sound?: 'on' | 'off';
    onReady?: () => void;
  }

  interface GoogleH5AdBreakPlacementInfo {
    breakStatus?: string;
  }

  interface GoogleH5AdBreakOptions {
    type: 'start' | 'pause' | 'next' | 'browse' | 'reward';
    name: string;
    beforeAd?: () => void;
    afterAd?: () => void;
    beforeReward?: (showAdFn: () => void) => void;
    adViewed?: () => void;
    adDismissed?: () => void;
    adBreakDone?: (placementInfo?: GoogleH5AdBreakPlacementInfo) => void;
  }
}
