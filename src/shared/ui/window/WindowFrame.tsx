import type { ReactNode } from 'react';

interface WindowFrameProps {
  /** 창 내부에 렌더링할 콘텐츠입니다. */
  children: ReactNode;
  /** 창 외곽 컨테이너에 추가할 클래스입니다. */
  className?: string;
  /** 은은한 점 패턴 배경 장식을 표시할지 여부입니다. */
  showPattern?: boolean;
  /** 상단 방향 그라데이션 장식의 시작 색상 클래스입니다. */
  topGlowClassName?: string;
}

/**
 * 게임 내 전체 화면 창들이 공유하는 외곽 프레임입니다.
 */
export function WindowFrame({
  children,
  className = '',
  showPattern = false,
  topGlowClassName,
}: WindowFrameProps) {
  return (
    <div
      className={[
        'flex flex-col w-full h-full text-[#d1d5db] font-sans p-4 md:p-8 bg-[#1a1a1b] border border-zinc-800 rounded-xl md:rounded-3xl shadow-2xl relative overflow-hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showPattern && (
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #ffffff 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
      )}

      {topGlowClassName && (
        <div
          className={[
            'absolute top-0 left-0 w-full h-64 bg-linear-to-b to-transparent pointer-events-none',
            topGlowClassName,
          ].join(' ')}
        />
      )}

      {children}
    </div>
  );
}
