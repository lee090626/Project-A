import { TileType } from './core';
import { MasteryState } from './progress';
import { SkillRuneItem, SmeltingJob } from './items';
import { ActiveEffect } from './entity';

// NOTE: We'll fix these cyclic imports after all files are created and game.ts is updated.

/**
 * 플레이어의 인벤토리 구조입니다.
 * 광물 종류별로 수량을 저장합니다.
 */
export type Inventory = {
  [K in Exclude<
    TileType,
    | 'empty'
    | 'wall'
    | 'portal'
    | 'boss_core'
    | 'boss_skin'
    | 'monster_nest'
    | 'monster'
    | 'lava'
    | 'dungeon_bricks'
  >]: number;
} & {
  [key: string]: number;
};

/**
 * 플레이어의 전체적인 통계 및 진행 상태를 저장합니다.
 */
export interface PlayerStats {
  /** 현재 장착 중인 장비 정보 */
  equipment: {
    drillId: string | null;
    helmetId: string | null;
    armorId: string | null;
    bootsId: string | null;
  };
  /** 보유하고 있는 모든 장비의 ID 목록 */
  ownedEquipmentIds: string[];

  /** 진행 중인 제련 작업 목록 */
  activeSmeltingJobs: SmeltingJob[];
  /** 해제된 용광로 제련 슬롯 수 */
  refinerySlots: number;

  /** 탐험 정보 */
  /** 지금까지 도달한 최대 깊이 */
  maxDepthReached: number;
  /** 해금된 웨이포인트 깊이 목록 (0m은 베이스 캠프) */
  unlockedWaypoints: number[];

  /** 전투 및 기본 스탯 */
  /** 현재 체력 */
  hp: number;
  /** 최대 체력 */
  maxHp: number;
  /** 기본 채굴 위력 (장비 위력과 합산됨) */
  power: number;
  /** 캐릭터 기본 이동 속도 (기본 100) */
  moveSpeed: number;
  /** 캐릭터 기본 방어력 */
  defense: number;
  /** 캐릭터 기본 행운 (기본 0) */
  luck: number;

  /** 자원 및 아이템 */
  /** 광물 인벤토리 */
  inventory: Inventory;
  /** 소지하고 있는 스킬룬 목록 */
  inventoryRunes: SkillRuneItem[];
  /** 보유 중인 골드 코인 수량 */
  goldCoins: number;
  /** 월드 생성을 위한 맵 시드 번호 */
  mapSeed: number;
  /** 현재 저장 데이터가 반영한 몬스터 스폰 규칙 버전 */
  spawnRulesVersion: number;

  /** 발견한 광물 종류 목록 (도감용) */
  discoveredMinerals: string[];
  /** 조우한 보스 ID 목록 */
  encounteredBossIds: string[];
  /** 보스별 재생성 가능 시간 (타임스탬프) */
  bossRespawnTimers: Record<string, number>;
  /** 현재 탐험 중인 차원 번호 */
  dimension: number;

  /** 각 장비별 숙련도 및 스토리지 관리 (ID 기반) */
  equipmentStates: { [eqId: string]: MasteryState };

  /** 각 타일 종류별 숙련도 관리 */
  tileMastery: { [tileType: string]: MasteryState };

  /** 해금된 연구(스킬트리) ID 목록 */
  unlockedResearchIds: string[];

  /** 해금된 마스터리 돌파 특성 ID 목록 */
  unlockedMasteryPerks: string[];

  /** 지옥의 정수 등 수집 가능한 아이템의 누적 획득량 기록 */
  collectionHistory?: Record<string, number>;

  /** [상태 이상] 현재 적용 중인 상태 효과 목록 */
  activeEffects?: ActiveEffect[];
  /** [튜토리얼] 이미 트리거된 가이드 ID 목록 */
  tutorialFlags?: Record<string, boolean>;

  /** [Type Safety Bridge] 동적 필드 참조 허용 */
  [key: string]: any;
}
