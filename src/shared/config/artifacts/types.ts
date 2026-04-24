export type ArtifactType = 'stackable' | 'unique';

export interface ArtifactDefinition {
  id: string;
  name: string;
  nameKo: string;
  type: ArtifactType;
  /** 최대 중첩 수량 (미지정 시 type 기본값 사용: stackable=1000, unique=1) */
  maxStack?: number;
  description: string;
  descriptionKo: string;
  icon?: string; // 레거시: 이모지 아이콘
  image?: string; // 아틀라스 이미지 키 (PascalCaseEssence / PascalCaseRelic)

  // 공통: 기본 스탯 보너스 (stackable의 경우 개당 수치, unique의 경우 고정 수치)
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
    value: number; // stackable의 경우 valuePerEssence 역할을 함
  };

  // unique 전용: 특수 성장/편의성 효과
  effectId?: string;
  /** 스택 효과 설명 (영문) */
  effectDescription?: string;
  /** 스택 효과 설명 (한국어) */
  effectDescriptionKo?: string;

  // unique 전용: 조합 레시피 (몬스터 전리품 위주)
  requirements?: {
    [key: string]: number;
  };
}
