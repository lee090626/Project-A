'use client';

import Joystick from './Joystick';

interface MobileControllerProps {
  onJoystickMove: (data: { x: number; y: number; active: boolean }) => void;
  onActionPress?: () => void;
}

/**
 * 모바일 화면 하단에 표시되는 가상 컨트롤러 레이아웃입니다.
 * 좌측 조이스틱과 우측 액션 버튼을 포함합니다.
 */
export default function MobileController({ onJoystickMove, onActionPress }: MobileControllerProps) {
  return (
    <div className="absolute inset-0 z-40 pointer-events-none select-none touch-none">
      {/* 좌측 조이스틱 영역 */}
      <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-[calc(env(safe-area-inset-left)+1rem)] md:bottom-[calc(env(safe-area-inset-bottom)+3rem)] md:left-[calc(env(safe-area-inset-left)+3rem)] pointer-events-auto">
        <Joystick onMove={onJoystickMove} size={100} stickSize={45} />
      </div>

      {/* 우측 액션 버튼 영역 */}
      <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] right-[calc(env(safe-area-inset-right)+1.5rem)] md:bottom-[calc(env(safe-area-inset-bottom)+3rem)] md:right-[calc(env(safe-area-inset-right)+3rem)] pointer-events-auto flex flex-col gap-4">
        {onActionPress && (
          <button
            type="button"
            aria-label="Use action"
            onPointerDown={(e) => {
              if (e.cancelable) e.preventDefault();
              onActionPress();
            }}
            className="pixel-button pixel-button-action pixel-font relative w-16 h-16 md:w-24 md:h-24 flex items-center justify-center active:translate-y-px transition-colors group"
          >
            <div className="absolute inset-0 bg-[#f4dfb8]/10 opacity-0 group-active:opacity-100 transition-opacity" />
            <span className="relative text-[#fff1bf] font-black text-[10px] md:text-sm">Action</span>
          </button>
        )}
      </div>
    </div>
  );
}
