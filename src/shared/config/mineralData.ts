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
 * 게임 내 광물(Mineral) 데이터베이스입니다.
 * 각 서클별 모듈에서 가져온 데이터를 하나로 통합합니다.
 */
export const MINERALS: MineralDefinition[] = [
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
 * 빠른 조회(O(1))를 위한 광물 맵입니다.
 */
export const MINERAL_MAP: Record<string, MineralDefinition> = MINERALS.reduce(
  (acc, mineral) => {
    acc[mineral.key] = mineral;
    return acc;
  },
  {} as Record<string, MineralDefinition>
);
