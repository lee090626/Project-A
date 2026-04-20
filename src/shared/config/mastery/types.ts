/**
 * 마스터리 돌파 특성 보너스 효과의 세부 명세입니다.
 */
export interface MasteryPerkEffect {
  type:
    | 'moveSpeed'
    | 'miningPower'
    | 'miningSpeed'
    | 'hpRegen'
    | 'maxHp'
    | 'luck'
    | 'masteryExp'
    | 'critRate'
    | 'critDmg';
  value: number;
  isMultiplier: boolean;
  chance?: number;
}

/**
 * 마스터리 돌파 특성 정보를 정의하는 데이터 설정 파일입니다.
 */
export interface MasteryPerkDef {
  id: string;
  tileType: string;
  requiredLevel: number;
  name: string;
  description: string;
  effects: MasteryPerkEffect[];
}
