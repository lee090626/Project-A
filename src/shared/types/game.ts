/**
 * 통합 게임 타입 파일 (어그리게이터)
 * 모든 타입은 도메인별 서브 모듈로 분리되어 관리됩니다.
 * 하위 호환성을 위해 기존과 동일한 인터페이스를 유지합니다.
 */

// 핵심 시스템 (타일, 희귀도, 위치)
export type { Rarity, TileType, Tile, Position } from './game/core';
export { TILE_TYPE_TO_ID, ID_TO_TILE_TYPE } from './game/core';

// 엔티티 및 상태 효과
export type { Entity, InteractionType, StatusType, ActiveEffect } from './game/entity';

// 플레이어 통계 및 인벤토리
export type { Inventory, PlayerStats } from './game/player';

// 장비 시스템
export type { EquipmentPart, EquipmentStats, Equipment } from './game/equipment';

// 아이템 (스킬룬, 유물, 드롭템, 제련)
export type { SkillRune, SkillRuneItem, Artifact, SmeltingJob, DroppedItem } from './game/items';

// 제작 시스템
export type { CraftRequirements, CraftResult } from './game/crafting';

// 성장 및 연구 (마스터리)
export type { MasteryState, ResearchEffect, ResearchNode } from './game/progress';

// UI 및 시각 효과
export type {
  ToastType,
  ToastItem,
  ToastMessage,
  Particle,
  FloatingText,
  GameAssets,
} from './game/ui';
