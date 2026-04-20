import { Rarity, TileType } from './core';

/**
 * 스킬룬의 기본 데이터 구조입니다.
 */
export interface SkillRune {
  id: string;
  name: string;
  nameKo?: string;
  description: string;
  descriptionKo?: string;
  effectType: 'passive' | 'active';
  rarity: Rarity | 'Unique';
  powerBonus?: number;
  speedMult?: number;
  effectChance?: number;
  effectValue?: number;
  image?: any;
}

/**
 * 인벤토리에 보관되는 실제 스킬룬 인스턴스 정보입니다.
 */
export interface SkillRuneItem {
  id: string;
  runeId: string;
  rarity: Rarity | 'Unique';
}

/**
 * 유물의 기본 데이터를 정의합니다. (단순 상호작용용 레거시 타입)
 */
export interface Artifact {
  id: string;
  name: string;
  description: string;
  icon: string;
  cooldownMs: number;
}

/**
 * 자원 가공소(용광로)에서 진행 중인 가공 작업 정보입니다.
 */
export interface SmeltingJob {
  id: string;
  inputMineral: string;
  outputItem: string;
  amount: number;
  startTime: number;
  durationMs: number;
}

/**
 * 게임 월드에 떨어져 물리 효과를 받는 아이템 객체입니다.
 */
export interface DroppedItem {
  id: string;
  type: TileType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}
