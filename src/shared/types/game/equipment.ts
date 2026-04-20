/**
 * 장비의 부위를 정의합니다.
 */
export type EquipmentPart = 'Drill' | 'Helmet' | 'Armor' | 'Boots';

/**
 * 장비가 제공하는 스탯 정보를 정의합니다.
 */
export interface EquipmentStats {
  power?: number;
  maxHp?: number;
  moveSpeed?: number;
  defense?: number;
}

/**
 * 모든 장비의 기본 명세를 정의합니다.
 */
export interface Equipment {
  /** 장비 고유 ID */
  id: string;
  /** 장비 이름 */
  name: string;
  /** 장비 설명 */
  description: string;
  /** 부위 */
  part: EquipmentPart;
  /** 서클 레벨 (Circle 2-9) */
  circle: number;
  /** UI에 표시될 아이콘 */
  icon: string;
  /** 장비 이미지 (스프라이트 키) */
  image?: string;
  /** 장비가 제공하는 능력치 */
  stats: EquipmentStats;
  /** 제작 시 필요한 재료 및 비용 */
  price?: { [key: string]: number };
  /** 장비에 장착 가능한 최대 스킬룬 슬롯 수 */
  maxSkillSlots?: number;
  /** 장착 시 부여되는 특수 효과 */
  specialEffect?: string;
}
