export {};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
    adBreak?: (options: GoogleH5AdBreakOptions) => void;
    adConfig?: (options: GoogleH5AdConfigOptions) => void;
  }

  interface GoogleH5AdConfigOptions {
    preloadAdBreaks?: 'on' | 'auto';
    sound?: 'on' | 'off';
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
