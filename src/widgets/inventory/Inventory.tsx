'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { PlayerStats, EquipmentPart } from '@/shared/types/game';
import { EQUIPMENTS } from '@/shared/config/equipmentData';
import { MINERALS } from '@/shared/config/mineralData';
import { WindowFrame, WindowHeader } from '@/shared/ui/window';
import { EFFECT_DATA, EFFECT_LIST } from '@/shared/config/effectData';

// 새롭게 분리된 하위 컴포넌트들
import InventoryTabs, { InventoryTab } from './components/InventoryTabs';
import TabIngredients from './components/TabIngredients';
import TabEffects from './components/TabEffects';
import TabEquipment from './components/TabEquipment';

/**
 * 인벤토리 컴포넌트의 Props 인터페이스입니다.
 */
interface InventoryProps {
  stats: PlayerStats;
  onClose: () => void;
  onEquip?: (id: string, part: EquipmentPart) => void;
}

/**
 * 플레이어의 소지품(재료, 장비, 스킬젬)을 관리하고 장착할 수 있는 인벤토리 컴포넌트입니다.
 */
function Inventory({ stats, onClose, onEquip }: InventoryProps) {
  // 상태 관리: 선택된 광물/Effect 키, 현재 활성화된 탭
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<InventoryTab>('ingredients');
  const [selectedPart, setSelectedPart] = useState<EquipmentPart>('Drill');

  /** 현재 선택된 Effect 정보 계산 */
  const selectedEffect = useMemo(
    () => (selectedKey ? EFFECT_DATA[selectedKey] || null : null),
    [selectedKey],
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

  /** Effect 아이템 필터링 (보유한 것만 표시) */
  const ownedEffects = useMemo(() => {
    return EFFECT_LIST.filter((item) => (stats.collectionHistory?.[item.id] || 0) > 0);
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

  return (
    <WindowFrame>
      <WindowHeader
        icon={<span className="text-2xl md:text-3xl">📦</span>}
        title="Inventory"
        titleClassName="text-cyan-400"
        gold={stats.goldCoins}
        onClose={onClose}
        closeButtonClassName="hover:bg-cyan-400 hover:text-black hover:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400/50"
      >
        <InventoryTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </WindowHeader>

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
            ownedEffects={ownedEffects}
            selectedKey={selectedKey}
            onSelectKey={handleSelectKey}
            selectedEffect={selectedEffect}
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
      </div>
    </WindowFrame>
  );
}

export default React.memo(Inventory, (prev, next) => {
  return prev.stats === next.stats;
});
