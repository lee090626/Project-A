import { Position, Entity } from '@/shared/types/game';

/**
 * 두 좌표 사이의 유클리드 거리를 계산합니다.
 * @param p1 - 첫 번째 좌표 (Position 객체 또는 {x, y} 형식)
 * @param p2 - 두 번째 좌표 (Position 객체 또는 {x, y} 형식)
 * @returns 두 좌표 사이의 거리 (타일 단위)
 * @example
 * ```typescript
 * const distance = getDistance({x: 0, y: 0}, {x: 3, y: 4}); // 5
 * ```
 */
export const getDistance = (
  p1: Position | { x: number; y: number },
  p2: Position | { x: number; y: number },
) => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * 엔티티(몬스터/보스)의 타일 중앙 좌표를 반환합니다.
 * @param entity - 엔티티 객체 (x, y, width, height 속성을 가짐)
 * @returns 엔티티의 중심 좌표 {x, y}
 * @description 엔티티의 위치는 좌상단 기준이므로, 중심을 계산하여 정확한 거리 계산에 사용합니다.
 */
export const getEntityCenter = (entity: Entity) => {
  return {
    x: entity.x + (entity.width || 1) / 2,
    y: entity.y + (entity.height || 1) / 2,
  };
};

/**
 * 특정 범위 내에 있는 엔티티들을 필터링합니다.
 * @param entities - 검사할 엔티티 배열
 * @param pos - 기준 좌표 {x, y}
 * @param range - 검사 범위 (타일 단위)
 * @returns 범위 내에 있는 엔티티들의 배열
 * @description 전투 시스템에서 공격 가능한 대상이나 어그로 범위 내의 몬스터를 찾을 때 사용됩니다.
 */
export const getEntitiesInRange = (
  entities: Entity[],
  pos: { x: number; y: number },
  range: number,
) => {
  return entities.filter((entity) => {
    const center = getEntityCenter(entity);
    return getDistance(pos, center) <= range;
  });
};
