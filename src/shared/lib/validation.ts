import type { EquipmentPart } from '@/shared/types/game';

export const EQUIPMENT_PARTS = ['Drill', 'Helmet', 'Armor', 'Boots'] as const satisfies readonly EquipmentPart[];

export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function isNonEmptyString(value: unknown, maxLength = 160): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

export function isEquipmentPart(value: unknown): value is EquipmentPart {
  return typeof value === 'string' && (EQUIPMENT_PARTS as readonly string[]).includes(value);
}
