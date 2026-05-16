import { useMemo } from 'react';
import { PlayerStats, Equipment } from '@/shared/types/game';
import { EQUIPMENTS } from '@/shared/config/equipmentData';
import {
  BASE_PLAYER_MAX_HP,
  BASE_PLAYER_MOVE_SPEED,
  BASE_PLAYER_POWER,
} from '@/shared/config/playerConstants';
import {
  calculateCriticalStats,
  calculateMiningSpeedStats,
} from '@/features/game/lib/playerCombatStats';
import {
  getMasteryBonuses,
} from '@/shared/lib/masteryUtils';
import { calculateEffectBonuses } from '@/shared/lib/effectItemUtils';

export interface StatBreakdownItem {
  label: string;
  value: string | number;
  color?: string;
}

export interface StatusStatsResult {
  // Equipment
  equipped: {
    drill: Equipment | null;
    helmet: Equipment | null;
    armor: Equipment | null;
    boots: Equipment | null;
  };
  
  // Final computed stats
  finalPower: number;
  finalDefense: number;
  finalMaxHp: number;
  finalCritRate: number;
  finalCritDmg: number;
  finalMiningInterval: number;
  finalMoveSpeedMult: number;
  finalLuck: number;

  // Breakdowns for tooltip
  statBreakdowns: Record<string, StatBreakdownItem[]>;
}

/**
 * StatusWindow에서 사용하는 모든 스탯 계산 로직을 캡슐화한 Custom Hook.
 */
export function useStatusStats(stats: PlayerStats): StatusStatsResult {
  return useMemo(() => {
    // 1. 장착 장비 로드
    const equipped = {
      drill: stats.equipment.drillId ? EQUIPMENTS[stats.equipment.drillId] : null,
      helmet: stats.equipment.helmetId ? EQUIPMENTS[stats.equipment.helmetId] : null,
      armor: stats.equipment.armorId ? EQUIPMENTS[stats.equipment.armorId] : null,
      boots: stats.equipment.bootsId ? EQUIPMENTS[stats.equipment.bootsId] : null,
    };

    // 2. 통합 보너스 수합
    const effectBonuses = calculateEffectBonuses(stats);
    const masteryBonuses = getMasteryBonuses(stats);
    const drillBasePower = equipped.drill?.stats.power || 0;

    // 4. 최종 스탯 도출 (엔진 동기화 수치와 일치 시킴)
    const finalPower = stats.power;
    const finalDefense = (stats.defense || 0);
    const finalMaxHp = stats.maxHp;
    const finalLuck = stats.luck || 0;

    const { critRate: finalCritRate, critDamage: finalCritDmg } = calculateCriticalStats(stats);
    const miningSpeedStats = calculateMiningSpeedStats(stats);
    const finalMiningInterval = Math.round(miningSpeedStats.attackInterval);

    // 이동 속도 배율
    const finalMoveSpeedMult = stats.moveSpeed / BASE_PLAYER_MOVE_SPEED;

    // 5. Stat Breakdown Definitions
    const statBreakdowns: Record<string, StatBreakdownItem[]> = {
      power: [
        { label: 'Base Hero Power', value: BASE_PLAYER_POWER },
        { label: `Drill (${equipped.drill?.name || 'Hand'})`, value: drillBasePower },
        { label: 'Mastery Perks', value: `+${masteryBonuses.miningPower}`, color: 'text-emerald-500' },
        { label: 'Effect', value: `+${effectBonuses?.power || 0}`, color: 'text-orange-400' },
      ],
      defense: [
        { label: 'Helmet DEF', value: equipped.helmet?.stats.defense || 0 },
        { label: 'Boots Sub-DEF', value: equipped.boots?.stats.defense || 0 },
        { label: 'Effect', value: effectBonuses?.defense || 0, color: 'text-orange-400' },
      ],
      hp: [
        { label: 'Base Energy', value: BASE_PLAYER_MAX_HP },
        { label: 'Armor HP', value: `+${equipped.armor?.stats.maxHp || 0}` },
        { label: 'Boots Sub-HP', value: `+${equipped.boots?.stats.maxHp || 0}` },
        { label: 'Mastery Perks', value: `+${masteryBonuses.maxHp}`, color: 'text-emerald-500' },
        { label: 'Effect', value: `+${effectBonuses.maxHp || 0}`, color: 'text-orange-400' },
        { label: 'HP Multiplier', value: `x${(1 + masteryBonuses.maxHpMult).toFixed(2)}`, color: 'text-blue-400' },
      ],
      miningSpeed: [
        { label: 'System Baseline', value: `${miningSpeedStats.baseInterval}ms` },
        { label: 'Mastery Speed', value: `-${(miningSpeedStats.masterySpeedBonusMult * 100).toFixed(0)}%`, color: 'text-emerald-500' },
        { label: 'Effect', value: `-${(miningSpeedStats.effectSpeedBonus * 100).toFixed(0)}%`, color: 'text-orange-400' },
      ],
      moveSpeed: [
        { label: 'Base Speed', value: `${BASE_PLAYER_MOVE_SPEED}%` },
        { label: 'Boots Additive', value: `+${equipped.boots?.stats.moveSpeed || 0}%`, color: 'text-amber-400' },
        { label: 'Mastery Multiplier', value: `x${(1 + masteryBonuses.moveSpeedMult).toFixed(2)}`, color: 'text-blue-400' },
        { label: 'Effect', value: `+${(effectBonuses.moveSpeed || 0).toFixed(0)}%`, color: 'text-orange-400' },
      ],
    };

    return {
      equipped,
      finalPower,
      finalDefense,
      finalMaxHp,
      finalCritRate,
      finalCritDmg,
      finalMiningInterval,
      finalMoveSpeedMult,
      finalLuck,
      statBreakdowns,
    };
  }, [stats]);
}
