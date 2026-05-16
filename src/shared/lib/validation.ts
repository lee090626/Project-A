export { EQUIPMENT_PARTS, isEquipmentPart } from './equipmentParts';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function isNonEmptyString(value: unknown, maxLength = 160): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}
