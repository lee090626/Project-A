/**
 * 보스가 사용할 수 있는 공격 패턴의 종류를 정의합니다.
 */
export type BossPatternType = 'shot' | 'cross' | 'lure' | 'aoe' | 'swarm' | 'gravity' | 'roar' | 'hellfire';

/**
 * 보스의 단일 공격 패턴 데이터 정의입니다.
 */
export interface BossPattern {
  /** 패턴 식별 타입 */
  type: BossPatternType;
  /** 이 패턴의 발동 주기 (밀리초) */
  cooldown: number;
  /** 발사되는 투사체의 수 */
  projectileCount?: number;
  /** 투사체 이동 속도 (픽셀/틱) */
  projectileSpeed?: number;
  /** 투사체 공격력 */
  projectilePower?: number;
  /** 투사체 크기 (px) */
  projectileSize?: number;
  /** lure 패턴 전용: 혼란 효과 지속 시간 (밀리초) */
  lureDuration?: number;
  /** lure 패턴 전용: 혼란 효과 발동을 위한 주기 시작 시간 (밀리초) */
  lureCycle?: number;
  /** 공격 전조 표시 시작 시간 (밀리초) */
  warningLeadTime?: number;
  /** roar 패턴 전용: 효과 반경 (px) */
  roarRadius?: number;
}

/**
 * 몬스터의 전체 정의 인터페이스입니다.
 */
export interface MonsterDefinition {
  /** 몬스터의 고유 식별자 */
  id: string;
  /** 영어 이름 */
  name: string;
  /** 한국어 이름 */
  nameKo: string;
  /** 몬스터 유형 */
  type: 'monster' | 'boss';
  /** 타일 단위 가로 크기 (기본값 1) */
  width?: number;
  /** 타일 단위 세로 크기 (기본값 1) */
  height?: number;
  /** 아틀라스 키 */
  imagePath: string;
  /** 몬스터 설명 */
  description: string;
  /** 전투 메커니즘 설명 */
  mechanic?: string;
  /** 희귀도 */
  rarity?: string;
  /** 스탯 정보 */
  stats: {
    maxHp: number;
    power: number;
    defense: number;
    attackCooldown: number;
  };
  /** 보상 정보 */
  rewards: {
    exp: number;
    gold: number;
    drops: Array<{
      itemId: string;
      chance: number;
      minAmount: number;
      maxAmount: number;
    }>;
  };
  /** 행동 패턴 */
  behavior: {
    attackRange: number;
    aggroRange: number;
    projectileId?: string;
    /** 재생성 대기 시간 (밀리초, 보스 전용) */
    respawnMs?: number;
  };
  /** 보스 전용 공격 패턴 */
  patterns?: BossPattern[];
}
