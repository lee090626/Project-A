'use client';

import React, { useState, useMemo } from 'react';
import { PlayerStats, EquipmentPart } from '@/shared/types/game';
import { EQUIPMENTS } from '@/shared/config/equipmentData';

import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';
import RecipeDetail from './RecipeDetail';

/**
 * 제작 시스템 컴포넌트의 Props 인터페이스입니다.
 */
interface CraftingProps {
  /** 플레이어 통계 데이터 */
  stats: PlayerStats;
  /** 아이템 제작 실행 콜백 */
  onCraft: (requirements: any, result: any) => void;
  /** 제작 창 닫기 콜백 */
  onClose: () => void;
}

/**
 * 플레이어가 수집한 광물을 사용하여 4부위 장비를 제작할 수 있는 대장간(Forge) 컴포넌트입니다.
 * 상점에 있던 장비 필터링 로직을 완벽하게 이식하고 UI를 강화했습니다.
 */
function Crafting({ stats, onCraft, onClose }: CraftingProps) {
  const [selectedPart, setSelectedPart] = useState<EquipmentPart>('drill');
  const [selectedCircle, setSelectedCircle] = useState<number>(2);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  /** 현재 필터링된 조건에 맞는 레시피 목록 생성 */
  const visibleRecipes = useMemo(() => {
    return Object.values(EQUIPMENTS)
      .filter((eq) => eq.circle === selectedCircle && eq.part === selectedPart)
      .map((eq) => ({
        ...eq,
        requirements: eq.price || {},
        result: {
          [`${eq.part}Id`]: eq.id,
        },
        power: eq.stats.power || 0,
        defense: eq.stats.defense || 0,
        maxHp: eq.stats.maxHp || 0,
        moveSpeed: eq.stats.moveSpeed || 0,
        type: eq.part,
      }));
  }, [selectedCircle, selectedPart]);

  /** 해당 레시피를 제작할 수 있는지 확인하는 함수 */
  const canCraft = (rcp: any) => {
    if (!rcp) return false;
    const owned = stats.ownedEquipmentIds?.includes(rcp.id);
    if (owned) return false;

    // 모든 재료 조건을 충족하는지 확인
    return Object.entries(rcp.requirements).every(([key, val]) => {
      const currentVal =
        (stats as any)[key] !== undefined
          ? (stats as any)[key]
          : (stats.inventory as any)[key] || 0;
      return currentVal >= (val as number);
    });
  };

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
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 px-4 py-4 md:px-8 md:py-5 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/50 rounded-2xl md:rounded-3xl shadow-2xl shrink-0 gap-4 md:gap-6 relative z-10">
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent rounded-2xl md:rounded-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-rose-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-3xl border border-rose-500/20 shadow-inner">
              ⚒️
            </div>
            <div className="flex flex-col">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-rose-500 leading-none">
                Forgemaster
              </h2>
              <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mt-1 opacity-60">
                Ancient Blacksmith
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto justify-between md:justify-end relative z-10">
          <div className="flex items-center justify-center gap-3 md:gap-4 bg-black/40 px-5 py-2.5 md:px-8 md:py-3.5 rounded-xl md:rounded-3xl border border-white/5 shadow-inner group">
            <AtlasIcon name="GoldIcon" size={32} />
            <span className="text-sm md:text-2xl font-black text-white tabular-nums tracking-tighter">
              {stats.goldCoins.toLocaleString()}
              <span className="ml-2 text-rose-500 text-[10px] md:text-xs uppercase tracking-widest opacity-60">Gold</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-14 md:h-14 shrink-0 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-rose-500 hover:text-white transition-all active:scale-90 shadow-xl"
          >
            <span className="text-lg md:text-xl font-bold">✕</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden">
        {/* LEFT COLUMN: Filters & Blueprint List */}
        <div className="flex-1 flex flex-col h-auto lg:h-full overflow-hidden min-h-0 relative z-10">
          <div className="bg-zinc-900/60 backdrop-blur-xl p-6 rounded-3xl md:rounded-[3rem] flex flex-col h-full overflow-hidden shadow-2xl border border-white/5">
            {/* Filters */}
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mr-2">Circle:</span>
                {[2, 3, 4, 5, 6, 7, 8, 9].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedCircle(c);
                      setSelectedRecipe(null);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                      selectedCircle === c
                        ? 'bg-rose-500 text-white border-rose-400 shadow-[0_4px_12px_rgba(244,63,94,0.3)]'
                        : 'bg-black/20 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    C{c}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mr-2">Part:</span>
                {(['drill', 'helmet', 'armor', 'boots'] as EquipmentPart[]).map((part) => (
                  <button
                    key={part}
                    onClick={() => {
                      setSelectedPart(part);
                      setSelectedRecipe(null);
                    }}
                    className={`px-5 py-2.5 rounded-xl text-[10px] md:text-xs font-black tracking-[0.1em] border transition-all uppercase ${
                      selectedPart === part
                        ? 'bg-white text-black border-white shadow-xl'
                        : 'bg-zinc-800/40 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                    }`}
                  >
                    {part}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-white/5 mb-6" />

            {/* Blueprints Grid */}
            <div className="overflow-y-auto px-2 custom-scrollbar flex-1 pb-12 min-h-0">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {visibleRecipes.map((rcp) => {
                  const active = selectedRecipe?.id === rcp.id;
                  const craftable = canCraft(rcp);
                  const owned = stats.ownedEquipmentIds?.includes(rcp.id);

                  return (
                    <button
                      key={rcp.id}
                      onClick={() => setSelectedRecipe(rcp)}
                      className={`relative p-5 rounded-[2rem] border transition-all flex items-center gap-6 text-left group overflow-hidden focus:outline-none ${
                        active
                          ? 'bg-zinc-800 border-rose-500/50 shadow-lg ring-1 ring-rose-500/20'
                          : 'bg-zinc-950/40 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-4xl shadow-inner group-hover:border-rose-500/30 transition-colors shrink-0 overflow-hidden">
                        {rcp.image ? (
                          <AtlasIcon name={rcp.image} size={64} className={owned ? 'opacity-40 grayscale' : ''} />
                        ) : (
                          <span className={owned ? 'opacity-40 grayscale' : ''}>{rcp.icon}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-lg md:text-xl font-black tracking-tighter truncate ${active ? 'text-white' : 'text-zinc-300'}`}>
                            {rcp.name}
                          </span>
                          {owned && (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-[8px] font-black uppercase tracking-widest">OWNED</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="h-1 w-20 bg-black/40 rounded-full overflow-hidden border border-white/5">
                              <div className={`h-full bg-rose-500 ${craftable ? 'opacity-100' : 'opacity-20'}`} style={{ width: craftable ? '100%' : '30%' }} />
                           </div>
                        </div>
                      </div>

                      {active && <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 blur-3xl rounded-full" />}
                    </button>
                  );
                })}

                {visibleRecipes.length === 0 && (
                  <div className="col-span-full py-20 text-center opacity-20">
                    <p className="text-sm font-black uppercase tracking-widest">No Designs Discovered</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Detail & Production */}
        <div className="w-full lg:w-[320px] xl:w-[420px] shrink-0 relative z-10">
          <RecipeDetail
            selectedRecipe={selectedRecipe}
            stats={stats}
            canCraft={canCraft}
            onCraft={onCraft}
          />
        </div>
      </div>
    </div>
  );
}

export default React.memo(Crafting, (prev, next) => prev.stats === next.stats);
