/**
 * 제작 시 필요한 재료 명세입니다.
 */
export interface CraftRequirements {
  [resource: string]: number;
}

/**
 * 제작 결과물 정보입니다.
 */
export interface CraftResult {
  drillId?: string;
  itemId?: string;
}
