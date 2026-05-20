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

  return (
    <div className="absolute inset-x-0 top-3 sm:top-5 z-[45] flex justify-center px-3 pointer-events-none">
      <section
        className="pixel-panel pixel-font w-full max-w-[760px] pointer-events-auto text-white"
        aria-label="Quick start guide"
      >
        <div className="flex items-start justify-between gap-3 border-b-2 border-[#4e3d31] px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-black">Quick Start</h2>
            <p className="mt-0.5 text-xs sm:text-sm text-zinc-400">
              Dig down, craft gear, defeat the boss.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="pixel-button h-8 shrink-0 px-3 text-sm font-black text-[#f8e3a5] transition-colors active:translate-y-px"
          >
            Got it
          </button>
        </div>

        <div className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_1fr_1.2fr] sm:px-5 sm:py-4">
          <ControlHint
            title={isMobile ? 'Move / Mine' : 'Move / Mine / Attack'}
            primary={isMobile ? 'Joystick' : 'Arrows / WASD / ZQSD'}
            detail={
              isMobile
                ? 'Push into rock or enemies.'
                : 'Move, mine, and attack by pushing into targets.'
            }
          >
            {isMobile ? <JoystickGlyph /> : <ArrowKeyGlyph />}
          </ControlHint>

          <ControlHint
            title="Interact"
            primary={isMobile ? 'Action' : 'Space'}
            detail="Use near NPCs or stations."
          >
            <SpaceKeyGlyph label={isMobile ? 'Action' : 'Space'} />
          </ControlHint>

          <div className="min-w-0 border-t-2 border-[#4e3d31] pt-3 sm:border-l-2 sm:border-t-0 sm:pl-4 sm:pt-0">
            <p className="text-xs font-bold text-amber-300">Goal</p>
            <p className="mt-1 text-sm font-black text-white">Reach the next circle</p>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              Mine ore, craft gear, then challenge the boss.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ControlHint({
  title,
  primary,
  detail,
  children,
}: {
  title: string;
  primary: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[72px_1fr] items-center gap-3">
      {children}
      <div className="min-w-0">
        <p className="text-xs font-bold text-cyan-300">{title}</p>
        <p className="mt-1 text-sm font-black text-white">{primary}</p>
        <p className="mt-1 text-xs text-zinc-400">{detail}</p>
      </div>
    </div>
  );
}

function ArrowKeyGlyph() {
  return (
    <div className="grid grid-cols-[22px_22px_22px] grid-rows-[22px_22px] gap-1">
      <KeyCap className="col-start-2">↑</KeyCap>
      <KeyCap className="row-start-2">←</KeyCap>
      <KeyCap className="row-start-2">↓</KeyCap>
      <KeyCap className="row-start-2">→</KeyCap>
    </div>
  );
}

function JoystickGlyph() {
  return (
    <div className="pixel-slot relative h-[52px] w-[52px]">
      <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 bg-cyan-300/80" />
    </div>
  );
}

function SpaceKeyGlyph({ label }: { label: string }) {
  return (
    <div className="pixel-slot flex h-[52px] w-[72px] items-center justify-center px-2 text-xs font-black text-white">
      {label}
    </div>
  );
}

function KeyCap({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`pixel-slot flex h-[22px] w-[22px] items-center justify-center text-xs font-black text-white ${className}`}
    >
      {children}
    </div>
  );
}
