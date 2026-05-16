import type { CraftRequirements, PlayerStats } from '@/shared/types/game';
import { isFiniteNumber, isNonEmptyString, isRecord } from './validation';

export function getResourceAmount(stats: PlayerStats, resource: string): number | undefined {
  if (resource === 'goldCoins') return stats.goldCoins || 0;

  const amount = stats.inventory?.[resource];
  return typeof amount === 'number' ? amount : undefined;
}

export function isValidRequirementAmount(amount: unknown): amount is number {
  return isFiniteNumber(amount) && amount >= 0;
}

export function isRequirementsRecord(value: unknown): value is CraftRequirements {
  return (
    isRecord(value) &&
    Object.entries(value).every(
      ([key, amount]) => isNonEmptyString(key) && isValidRequirementAmount(amount),
    )
  );
}

export function canAffordRequirements(
  stats: PlayerStats,
  requirements: CraftRequirements,
): boolean {
  return Object.entries(requirements).every(([resource, amount]) => {
    const owned = getResourceAmount(stats, resource);
    return owned !== undefined && isValidRequirementAmount(amount) && owned >= amount;
  });
}

export function spendRequirements(stats: PlayerStats, requirements: CraftRequirements): void {
  Object.entries(requirements).forEach(([resource, amount]) => {
    if (!isValidRequirementAmount(amount) || amount === 0) return;

    if (resource === 'goldCoins') {
      stats.goldCoins -= amount;
      return;
    }

    stats.inventory[resource] -= amount;
  });
}
