/**
 * 화면상의 엔티티(NPC, 오브젝트, 몬스터 등) 정보를 정의합니다.
 */
export interface Entity {
  /** 엔티티 고유 ID */
  id: string;
  /** 엔티티 종류 */
  type: 'npc' | 'object' | 'monster' | 'boss' | 'projectile';
  /** 표시될 이름 */
  name: string;
  /** 가로 좌표 (타일 단위) */
  x: number;
  /** 세로 좌표 (타일 단위) */
  y: number;
  /** 타일셋 내의 스프라이트 인덱스 (옵션) */
  spriteIndex?: number;
  /** 이미지 파일 경로 (옵션) */
  imagePath?: string;
  /** 엔티티 너비 (타일 단위) */
  width?: number;
  /** 엔티티 높이 (타일 단위) */
  height?: number;
  /** 상호작용 시 발생할 행동 종류 */
  interactionType: 'shop' | 'dialog' | 'crafting' | 'elevator' | 'refinery' | 'none';
  /** 엔티티 스탯 (전투용) */
  stats?: {
    hp: number;
    maxHp: number;
    attack: number;
    speed: number;
    defense: number;
    /** 공격 쿨타임 (ms) */
    attackCooldown?: number;
  };
  /** 마지막 공격 시간 */
  lastAttackTime?: number;
  /** 현재 상태 (추적, 대기 등) */
  state?: 'idle' | 'chase' | 'attack';
}

/** 상호작용 가능 타입 별칭 */
export type InteractionType = Entity['interactionType'];

/**
 * 상태 이상의 종류를 정의합니다.
 */
export type StatusType =
  | 'STUN'
  | 'SLOW'
  | 'BURN'
  | 'FREEZE'
  | 'POISON'
  | 'BUFF_POWER'
  | 'BUFF_SPEED'
  | 'WEAKEN'
  | 'SHIELD'
  | 'LUCKY'
  | 'INVINCIBLE'
  | 'FATIGUE'
  | 'BLEED'
  | 'CONFUSION'
  | 'CURSE'
  | 'ENRAGE';

/**
 * 활성화된 캐릭터 상태 효과 정보입니다.
 */
export interface ActiveEffect {
  /** 효과 종류 */
  type: StatusType;
  /** 효과 시작 시간 */
  startTime: number;
  /** 효과 종료 시간 (Date.now() 기준 타임스탬프) */
  endTime: number;
  /** 효과의 강도나 수치 (옵션) */
  value?: number;
  /** 시각적 효과 부여 여부 (옵션) */
  vfxId?: string;
}
