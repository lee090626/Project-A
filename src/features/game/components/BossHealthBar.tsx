import React from 'react';
import { useGameStore } from '@/shared/lib/store';

/**
 * 보스 전투 시 화면 상단에 표시되는 전역 보스 체력 바 컴포넌트입니다.
 * Zustand 스토어의 boss 상태(다중 보스 지원 Record)를 구독하여 실시간으로 업데이트됩니다.
 */
const BossHealthBar: React.FC = () => {
  const bossMap = useGameStore((state) => state.boss);

  // 현재 활성화된 보스들만 필터링
  const activeBossEntries = Object.entries(bossMap || {}).filter(([, boss]) => boss && boss.active);

  if (activeBossEntries.length === 0) return null;

  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50 pointer-events-none flex flex-col gap-6">
      {activeBossEntries.map(([instanceId, boss]) => {
        const hpPercent = Math.max(0, (boss.hp / boss.maxHp) * 100);
        const circleMatch = boss.id?.match(/c(\d+)_/);
        const circleNumber = circleMatch ? circleMatch[1] : '?';

        return (
          <div key={instanceId} className="pixel-panel pixel-font p-3 animate-in slide-in-from-top-10 duration-300">
            {/* 보스 이름 및 정보 */}
            <div className="flex justify-between items-end mb-1.5 px-2">
              <div className="flex flex-col">
                <span className="text-[10px] md:text-xs font-black text-[#b84a3c] opacity-90">
                  Abyssal Lord - Circle {circleNumber}
                </span>
                <h2 className="text-xl md:text-3xl font-black text-[#f4dfb8] drop-shadow-[2px_2px_0_rgba(19,13,9,0.85)]">
                  {boss.name}
                </h2>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-lg md:text-2xl font-black text-[#f4dfb8]">
                  {Math.ceil(hpPercent)}%
                </span>
              </div>
            </div>

            {/* 체력 바 메인 컨테이너 */}
            <div className="pixel-bar relative h-4 md:h-6 p-[2px]">
              {/* 배경 그리드 장식 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(90deg,rgba(255,255,255,0.28)_1px,transparent_1px)] bg-[size:8px_8px]" />

              {/* 실제 체력 바 (애니메이션 적용) */}
              <div
                className="pixel-bar-fill h-full transition-[width] duration-300 bg-[#d94b4b] relative"
                style={{ width: `${hpPercent}%` }}
              >
                {/* 하이라이트 효과 */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-[#f4dfb8]/20" />
              </div>
            </div>

            {/* 하단 장식 (데코레이션 브라켓) */}
            <div className="mt-1 flex justify-between px-1 opacity-40">
              <div className="w-10 h-1 border-l border-b border-[#5f4a2f]" />
              <div className="w-10 h-1 border-r border-b border-[#5f4a2f]" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BossHealthBar;
