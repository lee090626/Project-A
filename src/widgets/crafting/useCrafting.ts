import { useState, useMemo, useCallback } from 'react';
import { PlayerStats, EquipmentPart } from '@/shared/types/game';
import { EQUIPMENTS } from '@/shared/config/equipmentData';
import { ARTIFACT_DATA } from '@/shared/config/artifactData';

export type CraftType = 'Equipment' | 'Specials';

export function useCrafting(stats: PlayerStats) {
  const [craftType, setCraftType] = useState<CraftType>('Equipment');
  const [selectedPart, setSelectedPart] = useState<EquipmentPart>('Drill');
  const [selectedCircle, setSelectedCircle] = useState<number>(2);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  /** 현재 필터링된 조건에 맞는 레시피 목록 생성 */
  const visibleRecipes = useMemo(() => {
    if (craftType === 'Equipment') {
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
    } else {
      return Object.values(ARTIFACT_DATA)
        .filter((art) => art.requirements)
        .map((art) => ({
          ...art,
          result: { relicId: art.id },
          power: 0,
          defense: 0,
          maxHp: 0,
          moveSpeed: 0,
        }));
    }
  }, [craftType, selectedCircle, selectedPart]);

  /** 해당 레시피를 제작할 수 있는지 확인하는 함수 */
  const canCraft = useCallback((rcp: any) => {
    if (!rcp) return false;
    
    if (craftType === 'Equipment') {
      const owned = stats.ownedEquipmentIds?.includes(rcp.id);
      if (owned) return false;
    } else {
      if (rcp.type === 'unique' && stats.unlockedResearchIds?.includes(rcp.id)) return false;
    }

    // 모든 재료 조건을 충족하는지 확인
    return Object.entries(rcp.requirements).every(([key, val]) => {
      const currentVal =
        (stats as any)[key] !== undefined
          ? (stats as any)[key]
          : (stats.inventory as any)[key] || 0;
      return currentVal >= (val as number);
    });
  }, [craftType, stats]);

  const selectTab = useCallback((tab: CraftType) => {
    setCraftType(tab);
    setSelectedRecipe(null);
  }, []);

  const selectCircle = useCallback((circle: number) => {
    setSelectedCircle(circle);
    setSelectedRecipe(null);
  }, []);

  const selectPart = useCallback((part: EquipmentPart) => {
    setSelectedPart(part);
    setSelectedRecipe(null);
  }, []);

  return {
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
  };
}
