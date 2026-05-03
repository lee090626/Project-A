import { MineralDefinition } from './minerals/types';
import { stoneMinerals } from './minerals/stone';
import { circle2Minerals } from './minerals/circle2';
import { circle3Minerals } from './minerals/circle3';
import { circle4Minerals } from './minerals/circle4';
import { circle5Minerals } from './minerals/circle5';
import { circle6Minerals } from './minerals/circle6';
import { circle7Minerals } from './minerals/circle7';
import { circle8Minerals } from './minerals/circle8';
import { circle9Minerals } from './minerals/circle9';

// 타입 재내보내기 (하위 호환성 유지)
export type { MineralDefinition } from './minerals/types';

/**
 * 게임 내 채굴 가능한 타일 정의 전체입니다.
 * 배경 타일과 수집 가능한 광물을 모두 포함합니다.
 */
export const TILE_DEFINITIONS: MineralDefinition[] = [
  ...stoneMinerals,
  ...circle2Minerals,
  ...circle3Minerals,
  ...circle4Minerals,
  ...circle5Minerals,
  ...circle6Minerals,
  ...circle7Minerals,
  ...circle8Minerals,
  ...circle9Minerals,
];

/**
 * 인벤토리, 판매, 도감, 숙련도에 노출되는 수집 가능 광물 목록입니다.
 */
export const MINERALS: MineralDefinition[] = TILE_DEFINITIONS.filter(
  (mineral) => mineral.collectible !== false,
);

/**
 * 빠른 조회(O(1))를 위한 전체 타일 정의 맵입니다.
 */
export const MINERAL_MAP: Record<string, MineralDefinition> = TILE_DEFINITIONS.reduce(
  (acc, mineral) => {
    acc[mineral.key] = mineral;
    return acc;
  },
  {} as Record<string, MineralDefinition>
);

/**
 * 수집 가능 광물인지 판정합니다.
 *
 * @param key - 검사할 타일 또는 아이템 키
 * @returns 인벤토리/드롭/마스터리 대상이면 true
 */
export const isCollectibleMineral = (key: string): boolean => {
  return MINERAL_MAP[key]?.collectible !== false && MINERAL_MAP[key] !== undefined;
};
