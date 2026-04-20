/**
 * 광물 및 아이템의 희귀 등급을 정의합니다.
 */
export type Rarity =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Epic'
  | 'Radiant'
  | 'Legendary'
  | 'Mythic'
  | 'Ancient';

/**
 * 게임 내 타일의 종류를 정의합니다.
 */
export type TileType =
  // === Circle 2 — Lust ===
  | 'crimsonstone'
  | 'galestone'
  | 'fervorstone'
  // === Circle 3 — Gluttony ===
  | 'moldstone'
  | 'siltstone'
  | 'gorestone'
  // === Circle 4 — Greed ===
  | 'goldstone'
  | 'luststone'
  | 'midasite'
  // === Circle 5 — Wrath ===
  | 'ragestone'
  | 'cinderstone'
  | 'furystone'
  // === Circle 6 — Heresy ===
  | 'ashstone'
  | 'blightstone'
  | 'vexite'
  // === Circle 7 — Violence ===
  | 'thornstone'
  | 'bloodstone'
  | 'cruelite'
  // === Circle 8 — Fraud ===
  | 'mimicite'
  | 'lurerstone'
  | 'phantomite'
  // === Circle 9 — Treachery ===
  | 'froststone'
  | 'glacialite'
  | 'abyssstone'
  // === 시스템 타일 ===
  | 'stone'
  | 'lava'
  | 'dungeon_bricks'
  | 'boss_core'
  | 'boss_skin'
  | 'monster_nest'
  | 'monster'
  | 'empty'
  | 'wall'
  | 'portal'
  // === 몬스터 전리품 및 정수 (Loot & Essences) ===
  | 'essence_lust'
  | 'essence_gluttony'
  | 'essence_greed'
  | 'essence_wrath'
  | 'essence_heresy'
  | 'essence_violence'
  | 'essence_fraud'
  | 'essence_treachery';

/** 타일 타입-ID 매핑 (저장 및 비트 패킹용) */
export const TILE_TYPE_TO_ID: Record<string, number> = {
  empty: 0,
  crimsonstone: 1,
  galestone: 2,
  fervorstone: 3,
  moldstone: 4,
  siltstone: 5,
  gorestone: 6,
  goldstone: 7,
  luststone: 8,
  midasite: 9,
  ragestone: 10,
  cinderstone: 11,
  furystone: 12,
  ashstone: 13,
  blightstone: 14,
  vexite: 15,
  thornstone: 16,
  bloodstone: 17,
  cruelite: 18,
  mimicite: 19,
  lurerstone: 20,
  phantomite: 21,
  froststone: 22,
  glacialite: 23,
  abyssstone: 24,
  lava: 25,
  dungeon_bricks: 26,
  boss_core: 27,
  monster_nest: 28,
  monster: 29,
  wall: 30,
  portal: 31,
  boss_skin: 32,
  stone: 33,
  // === 몬스터 전리품 및 정수 (100+) ===
  essence_lust: 100,
  essence_gluttony: 101,
  essence_greed: 102,
  essence_wrath: 103,
  essence_heresy: 104,
  essence_violence: 105,
  essence_fraud: 106,
  essence_treachery: 107,
};

/** ID-타일 타입 역매핑 */
export const ID_TO_TILE_TYPE: Record<number, TileType> = Object.entries(TILE_TYPE_TO_ID).reduce(
  (acc, [key, value]) => {
    acc[value] = key as TileType;
    return acc;
  },
  {} as Record<number, TileType>,
);

/**
 * 타일 객체의 구조를 정의합니다.
 */
export interface Tile {
  /** 타일의 종류 */
  type: TileType;
  /** 현재 내구도 (0이 되면 파괴됨) */
  health: number;
  /** 최대 내구도 */
  maxHealth: number;
  /** 광물 스팟(true)인지 배경 채우기 타일(false)인지 구분 */
  isSpot?: boolean;
}

/**
 * 게임 내 위치를 좌표로 나타냅니다.
 */
export interface Position {
  x: number;
  y: number;
}
