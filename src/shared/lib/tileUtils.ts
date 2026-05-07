import { TileType } from '../types/game';

import { TILE_DEFINITIONS } from '../config/mineralData';

type SpecialTileType =
  | 'dungeon_bricks'
  | 'monster_nest'
  | 'boss_skin'
  | 'wall'
  | 'empty';

interface SpecialTileDefinition {
  color: string;
  index: number;
  health: number;
}

const SPECIAL_TILE_DEFINITIONS: Record<SpecialTileType, SpecialTileDefinition> = {
  dungeon_bricks: {
    color: '#374151',
    index: 9,
    health: 1000,
  },
  monster_nest: {
    color: '#b91c1c',
    index: 31,
    health: 200,
  },
  boss_skin: {
    color: '#064e3b',
    index: 33,
    health: 40000,
  },
  wall: {
    color: '#1a1a1b',
    index: 4,
    health: 1000,
  },
  empty: {
    color: '#000000',
    index: -1,
    health: 0,
  },
};

/**
 * 특정 타일 타입에 해당하는 렌더링 색상을 반환합니다.
 * @param type 타일의 종류
 * @returns 헥사코드 색상 문자열
 */
export function getTileColor(type: TileType): string {
  const specialTile = SPECIAL_TILE_DEFINITIONS[type as SpecialTileType];
  if (specialTile) {
    return specialTile.color;
  }

  // 2. 광물 데이터 테이블에서 조회
  const mineral = TILE_DEFINITIONS.find((m) => m.key === type);
  if (mineral && mineral.color) return mineral.color;

  return '#455a64'; // fallback string
}

/**
 * 타일셋 이미지 내에서 해당 타일 타입이 위치한 인덱스를 반환합니다.
 * @param type 타일 종류 문자열
 * @returns 타일셋에서의 0-기반 인덱스
 */
export function getTileIndex(type: string): number {
  const specialTile = SPECIAL_TILE_DEFINITIONS[type as SpecialTileType];
  if (specialTile) {
    return specialTile.index;
  }

  return 0; // 광물은 개별 아이콘이나 stone으로 렌더링됨
}

/**
 * 타일 타입에 따른 기본 스탯(내구도 등)을 조회합니다.
 * 광물과 배경 타일은 전체 타일 정의(SSOT)에서 가져오며, 특수 타일은 직접 계산합니다.
 * @param type 조회할 타일의 종류
 * @returns 타일의 체력 정보를 포함한 객체
 */
export function getMineralStats(type: TileType): { health: number } {
  const specialTile = SPECIAL_TILE_DEFINITIONS[type as SpecialTileType];
  if (specialTile) {
    return { health: specialTile.health };
  }

  // 2. 전체 타일 정의 테이블에서 조회 (단일 진실 공급원 전술)
  const mineral = TILE_DEFINITIONS.find((m) => m.key === type);
  if (mineral) {
    return {
      health: mineral.baseHealth,
    };
  }

  // 기본값 (알 수 없는 타입 등 방어 코드)
  return { health: 10 };
}
