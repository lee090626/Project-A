'use client';

import React from 'react';
import { PlayerStats } from '@/shared/types/game';
import RecipeDetail from './RecipeDetail';
import { useCrafting } from './useCrafting';

// 새롭게 분리된 하위 컴포넌트들
import ForgeHeader from './components/ForgeHeader';
import RecipeFilters from './components/RecipeFilters';
import RecipeList from './components/RecipeList';

/**
 * 제작 시스템 컴포넌트의 Props 인터페이스입니다.
 */
interface CraftingProps {
  /** 플레이어 통계 데이터 */
  stats: PlayerStats;
  /** 아이템 제작 실행 콜백 */
  onCraft: (requirements: any, result: any) => void;
  /** 특수 아이템(Relic/Effect) 제작 콜백 */
  onSynthesizeRelic: (relicId: string) => void;
  /** 제작 창 닫기 콜백 */
  onClose: () => void;
}

/**
 * 플레이어가 수집한 광물을 사용하여 4부위 장비를 제작할 수 있는 대장간(Forge) 컴포넌트입니다.
 * 비즈니스 로직은 useCrafting 훅으로, UI는 도메인별 컴포넌트로 분리되었습니다.
 */
function Crafting({ stats, onCraft, onSynthesizeRelic, onClose }: CraftingProps) {
  const {
    craftType,
    selectedPart,
    selectedCircle,
    selectedRecipe,
    visibleRecipes,
    setSelectedRecipe,
    canCraft,
    selectTab,
    selectCircle,
    selectPart
  } = useCrafting(stats);

  return (
    <div className="flex flex-col w-full h-full text-[#d1d5db] font-sans p-4 md:p-8 bg-[#1a1a1b] border border-zinc-800 rounded-xl md:rounded-3xl shadow-2xl relative overflow-hidden">
      {/* 배경 장식 요소 */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #ffffff 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute top-0 left-0 w-full h-64 bg-linear-to-b from-rose-500/5 to-transparent pointer-events-none" />

      {/* HEADER SECTION */}
      <ForgeHeader goldCoins={stats.goldCoins} onClose={onClose} />

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden">
        {/* LEFT COLUMN: Filters & Blueprint List */}
        <div className="flex-1 flex flex-col h-auto lg:h-full overflow-hidden min-h-0 relative z-10">
          <div className="bg-zinc-900/60 backdrop-blur-xl p-6 rounded-3xl md:rounded-[3rem] flex flex-col h-full overflow-hidden shadow-2xl border border-white/5">
            <RecipeFilters 
              craftType={craftType}
              onSelectTab={selectTab}
              selectedCircle={selectedCircle}
              onSelectCircle={selectCircle}
              selectedPart={selectedPart}
              onSelectPart={selectPart}
            />

            <RecipeList 
              visibleRecipes={visibleRecipes}
              selectedRecipeId={selectedRecipe?.id}
              onSelectRecipe={setSelectedRecipe}
              canCraft={canCraft}
              stats={stats}
              craftType={craftType}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Detail & Production */}
        <div className="w-full lg:w-[320px] xl:w-[420px] shrink-0 relative z-10">
          <RecipeDetail
            selectedRecipe={selectedRecipe}
            stats={stats}
            canCraft={canCraft}
            onCraft={(reqs, result) => {
              if (craftType === 'Equipment') {
                onCraft(reqs, result);
              } else {
                onSynthesizeRelic(result.relicId);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default React.memo(Crafting, (prev, next) => prev.stats === next.stats);
