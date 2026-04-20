'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { PlayerStats, EquipmentPart } from '@/shared/types/game';
import { EQUIPMENTS } from '@/shared/config/equipmentData';
import { MINERALS } from '@/shared/config/mineralData';
import { SKILL_RUNES } from '@/shared/config/skillRuneData';
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';
import { ARTIFACT_DATA, ARTIFACT_LIST } from '@/shared/config/artifactData';
import RuneEquipOverlay from './RuneEquipOverlay';

// 새롭게 분리된 하위 컴포넌트들
import InventoryTabs, { InventoryTab } from './components/InventoryTabs';
import TabIngredients from './components/TabIngredients';
import TabEffects from './components/TabEffects';
import TabEquipment from './components/TabEquipment';
import TabRunes from './components/TabRunes';

/**
 * 인벤토리 컴포넌트의 Props 인터페이스입니다.
 */
interface InventoryProps {
  stats: PlayerStats;
  onClose: () => void;
  onEquip?: (id: string, part: EquipmentPart) => void;
  onEquipRune?: (runeInstanceId: string, slotIndex: number) => void;
}

/**
 * 플레이어의 소지품(재료, 장비, 스킬젬)을 관리하고 장착할 수 있는 인벤토리 컴포넌트입니다.
 */
function Inventory({ stats, onClose, onEquip, onEquipRune }: InventoryProps) {
  // 상태 관리: 선택된 광물/유물 키, 선택된 룬 ID, 현재 활성화된 탭
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedRuneId, setSelectedRuneId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<InventoryTab>('ingredients');
  const [isEquippingRune, setIsEquippingRune] = useState(false);
  const [selectedPart, setSelectedPart] = useState<EquipmentPart>('Drill');

  /** 현재 선택된 유물 정보 계산 */
  const selectedArtifact = useMemo(
    () => (selectedKey ? ARTIFACT_DATA[selectedKey] || null : null),
    [selectedKey],
  );

  /** 현재 선택된 룬 인스턴스 및 설정 계산 */
  const selectedRuneInstance = useMemo(
    () => stats.inventoryRunes?.find((g) => g.id === selectedRuneId) || null,
    [stats.inventoryRunes, selectedRuneId],
  );
  
  const selectedRuneConfig = useMemo(
    () => (selectedRuneInstance ? SKILL_RUNES[selectedRuneInstance.runeId] || null : null),
    [selectedRuneInstance],
  );

  /** 현재 선택된 부위의 보유 장비 목록 필터링 */
  const visibleEquipments = useMemo(() => {
    return (stats.ownedEquipmentIds || [])
      .filter((id) => {
        const eq = EQUIPMENTS[id];
        return eq && eq.part === selectedPart;
      })
      .sort((a, b) => (EQUIPMENTS[a]?.circle || 0) - (EQUIPMENTS[b]?.circle || 0));
  }, [stats.ownedEquipmentIds, selectedPart]);

  /** 장착되지 않은 룬만 필터 (인벤토리 표시용) */
  const availableRunes = useMemo(() => {
    const equippedRuneIds = new Set<string>();
    Object.values(stats.equipmentStates || {}).forEach((eqState: any) => {
      if (eqState?.slottedRunes) {
        eqState.slottedRunes.forEach((id: string | null) => {
          if (id) equippedRuneIds.add(id);
        });
      }
    });
    return (stats.inventoryRunes || []).filter((r) => !equippedRuneIds.has(r.id));
  }, [stats.inventoryRunes, stats.equipmentStates]);

  /** 효과 아이템 (정수 & 성유물) 필터링 (보유한 것만 표시) */
  const ownedArtifacts = useMemo(() => {
    return ARTIFACT_LIST.filter((item) => (stats.collectionHistory?.[item.id] || 0) > 0);
  }, [stats.collectionHistory]);

  /** 보유한 광물만 필터링 */
  const ownedMinerals = useMemo(() => {
    return MINERALS.filter((m) => ((stats.inventory as any)[m.key] || 0) > 0);
  }, [stats.inventory]);

  // 핸들러 모음
  const handleTabChange = useCallback((tab: InventoryTab) => {
    setActiveTab(tab);
    setSelectedKey(null);
  }, []);

  const handleSelectKey = useCallback((key: string | null) => {
    setSelectedKey(key);
  }, []);

  const handleSelectRuneId = useCallback((id: string | null) => {
    setSelectedRuneId(id);
    setIsEquippingRune(false);
  }, []);

  const handleOpenEquipOverlay = useCallback(() => {
    setIsEquippingRune(true);
  }, []);

  return (
    <div className="flex flex-col w-full h-full text-[#d1d5db] font-sans p-4 md:p-8 bg-[#1a1a1b] border border-zinc-800 rounded-xl md:rounded-3xl shadow-2xl relative overflow-hidden">
      {/* HEADER SECTION - Bento Style Floating Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 px-4 py-4 md:px-8 md:py-5 bg-zinc-900 border border-zinc-800 rounded-2xl md:rounded-3xl shadow-2xl shrink-0 gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl md:text-3xl">📦</span>
            <div className="flex flex-col">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-cyan-400 leading-none">
                Inventory
              </h2>
            </div>
          </div>

          <InventoryTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center justify-center gap-2 md:gap-4 bg-zinc-950 px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl border border-zinc-800 shadow-inner">
            <div className="flex items-center justify-center">
              <AtlasIcon name="GoldIcon" size={32} />
            </div>
            <span className="text-sm md:text-xl font-black text-white tabular-nums tracking-tighter">
              {stats.goldCoins.toLocaleString()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-cyan-400 hover:text-black hover:border-cyan-400 transition-all active:scale-90 shadow-xl"
          >
            <span className="text-lg md:text-xl font-bold">✕</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-8 overflow-hidden pr-0 lg:pr-2">
        {activeTab === 'ingredients' && (
          <TabIngredients 
            ownedMinerals={ownedMinerals} 
            inventory={stats.inventory} 
          />
        )}
        
        {activeTab === 'effects' && (
          <TabEffects 
            stats={stats}
            ownedArtifacts={ownedArtifacts}
            selectedKey={selectedKey}
            onSelectKey={handleSelectKey}
            selectedArtifact={selectedArtifact}
          />
        )}
        
        {activeTab === 'equipment' && (
          <TabEquipment 
            selectedPart={selectedPart}
            onSetSelectedPart={setSelectedPart}
            visibleEquipments={visibleEquipments}
            stats={stats}
            onEquip={onEquip}
          />
        )}
        
        {activeTab === 'skillrunes' && (
          <TabRunes 
            availableRunes={availableRunes}
            selectedRuneId={selectedRuneId}
            onSelectRuneId={handleSelectRuneId}
            selectedRuneConfig={selectedRuneConfig}
            selectedRuneInstance={selectedRuneInstance}
            onOpenEquipOverlay={handleOpenEquipOverlay}
          />
        )}
      </div>

      {/* SLOT SELECTION OVERLAY */}
      {isEquippingRune && selectedRuneId && selectedRuneConfig && (
        <RuneEquipOverlay
          stats={stats}
          selectedRuneId={selectedRuneId}
          runeName={selectedRuneConfig.name}
          onEquipRune={onEquipRune}
          onClose={() => {
            setSelectedRuneId(null);
            setIsEquippingRune(false);
          }}
        />
      )}
    </div>
  );
}

export default React.memo(Inventory, (prev, next) => {
  return prev.stats === next.stats;
});
