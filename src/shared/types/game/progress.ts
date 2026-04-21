/**
 * 특정 지층(타일)이나 장비의 숙련도 상태를 관리합니다.
 */
export interface MasteryState {
  /** 대상 ID (타일 타입 또는 장비 ID) */
  id: string;
  /** 장착된 스킬룬의 인스턴스 ID 목록 (장비일 경우에만 사용) */
  slottedRunes?: (string | null)[];
  /** 현재 획득한 경험치 */
  exp: number;
  /** 현재 숙련도 레벨 */
  level: number;
}

/**
 * 연구(스킬트리) 효과의 종류와 수치를 정의합니다.
 */
export interface ResearchEffect {
  type:
    | 'power'
    | 'miningSpeed'
    | 'moveSpeed'
    | 'luck'
    | 'maxHp'
    | 'maxHpMult'
    | 'defense'
    | 'masteryExp'
    | 'critRate'
    | 'critDmg';
  value: number;
}

/**
 * 연구소의 개별 연구 노드를 정의합니다.
 */
export interface ResearchNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: { [key: string]: number };
  effect: ResearchEffect;
  position?: { x: number; y: number };
  dependencies: string[];
}


