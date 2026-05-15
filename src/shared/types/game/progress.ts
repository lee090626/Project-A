/**
 * 특정 지층(타일)이나 장비의 숙련도 상태를 관리합니다.
 */
export interface MasteryState {
  /** 대상 ID (타일 타입 또는 장비 ID) */
  id: string;
  /** 현재 획득한 경험치 */
  exp: number;
  /** 현재 숙련도 레벨 */
  level: number;
}

/**
 * 장비별 재련 상태입니다.
 */
export interface EquipmentState extends MasteryState {
  /** 장비 주스탯 보정률입니다. -20~20 범위의 정수 퍼센트입니다. */
  mainStatBonusPct: number;
}
