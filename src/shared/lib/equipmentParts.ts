import type { EquipmentPart } from '@/shared/types/game';

export type EquipmentSlotKey = 'drillId' | 'helmetId' | 'armorId' | 'bootsId';

export const EQUIPMENT_PARTS = ['Drill', 'Helmet', 'Armor', 'Boots'] as const satisfies readonly EquipmentPart[];

export const EQUIPMENT_SLOT_BY_PART: Record<EquipmentPart, EquipmentSlotKey> = {
  Drill: 'drillId',
  Helmet: 'helmetId',
  Armor: 'armorId',
  Boots: 'bootsId',
};

export const EQUIPMENT_SLOT_KEYS = Object.values(EQUIPMENT_SLOT_BY_PART);

export const EQUIPMENT_PART_LABELS: Record<EquipmentPart, string> = {
  Drill: 'Weapon (Drill)',
  Helmet: 'Head (Helmet)',
  Armor: 'Body (Armor)',
  Boots: 'Legs (Boots)',
};

export function isEquipmentPart(value: unknown): value is EquipmentPart {
  return typeof value === 'string' && (EQUIPMENT_PARTS as readonly string[]).includes(value);
}
