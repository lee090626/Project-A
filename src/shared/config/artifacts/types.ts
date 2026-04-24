export type ArtifactType = 'stackable';

export interface ArtifactDefinition {
  id: string;
  name: string;
  nameKo: string;
  type: ArtifactType;
  /** 최대 중첩 수량 (미지정 시 기본값 1000) */
  maxStack?: number;
  description: string;
  descriptionKo: string;
  icon?: string; // 레거시: 이모지 아이콘
  image?: string; // 아틀라스 이미지 키 (PascalCaseEssence / PascalCaseRelic)

  // 공통: 보유 스택 1개당 적용되는 기본 스탯 보너스
  bonus?: {
    stat:
      | 'power'
      | 'maxHp'
      | 'moveSpeed'
      | 'luck'
      | 'critRate'
      | 'critDamage'
      | 'defense'
      | 'miningSpeed';
    value: number;
  };

  // 보유 효과(선택)
  effectId?: string;
  /** 스택 효과 설명 (영문) */
  effectDescription?: string;
  /** 스택 효과 설명 (한국어) */
  effectDescriptionKo?: string;

  // 조합 레시피 (몬스터 전리품 위주)
  requirements?: {
    [key: string]: number;
  };
}
