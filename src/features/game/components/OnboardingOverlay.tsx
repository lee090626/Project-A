import React, { useEffect } from 'react';

const AUTO_DISMISS_MS = 12000;

interface OnboardingOverlayProps {
  isMobile: boolean;
  onClose: () => void;
}

/**
 * 첫 실행 유저에게 핵심 조작과 목표만 짧게 안내하는 비차단 온보딩 오버레이입니다.
 */
export default function OnboardingOverlay({ isMobile, onClose }: OnboardingOverlayProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(onClose, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timeoutId);
  }, [onClose]);

  const positionClassName = isMobile
    ? 'left-3 top-[calc(env(safe-area-inset-top)+10rem)] max-w-[230px]'
    : 'left-6 top-48 max-w-[260px]';

  return (
    <div className={`absolute z-[45] pointer-events-none ${positionClassName}`}>
      <section
        className="pixel-panel pixel-font pointer-events-auto px-3 py-2 text-[#f4dfb8]"
        aria-label="Quick start guide"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[10px] font-black text-[#2c8f87]">First Objective</h2>
            <p className="mt-1 text-xs font-black text-[#fff1bf]">
              Reach the next circle
            </p>
            <div className="pixel-bar mt-2 h-1.5 w-full">
              <div className="pixel-bar-fill h-full w-1/3 bg-[#d8a84f]" />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="pixel-button h-7 shrink-0 px-2 text-[10px] font-black text-[#f8e3a5] transition-colors active:translate-y-px"
          >
            OK
          </button>
        </div>
      </section>
    </div>
  );
}
