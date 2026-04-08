import { TileType } from '../types/game';

export interface MineralRule {
  /** 광물 종류 */
  type: TileType;
  /** 기준 출현 확률 (0~1) */
  threshold: number;
  /** 출현 시작 최소 깊이 */
  minDepth?: number;
  /** 가장 많이 출현하는 정점 깊이 (옵션) */
  peakDepth?: number;
  /** 정점 깊이 전후로 분포되는 범위 (옵션) */
  range?: number;
  /** 노이즈 기반 군집 크기 (옵션, 클수록 뭉텅이로 나옴) */
  scale?: number;
}

export interface MonsterSpawnRule {
  /** 몬스터 종류 ID (monsterData.ts 참조) */
  monsterId: string;
  /** 기본 출현 확률 (0~1) */
  chance: number;
  /** 출현 가중치 (여러 마리 중 선택 시) */
  weight: number;
  /** 최소 깊이 */
  minDepth: number;
  /** 최대 깊이 */
  maxDepth?: number;
}

export interface DimensionConfig {
  id: number;
  name: string;
  bossHeight: number;
  minerals: MineralRule[];
  monsters: MonsterSpawnRule[];
  hasMonsterNest: boolean;
}

export const DIMENSIONS: DimensionConfig[] = [
  {
    id: 0,
    name: 'TERRA',
    bossHeight: 1500, 
    hasMonsterNest: true,
    monsters: [
      { monsterId: 'pebble_golem', chance: 0.05, weight: 1, minDepth: 10, maxDepth: 500 },
      { monsterId: 'thief_mole', chance: 0.02, weight: 1, minDepth: 100, maxDepth: 600 },
      { monsterId: 'iron_scale_tortoise', chance: 0.015, weight: 1, minDepth: 200, maxDepth: 700 },
    ],
    minerals: [
      // 1. 특수/희귀 광물 (누적 확률 기반)
      // 5x5 섹터 모델에서 3% 밀도를 유지하기 위해 가중치를 미세 조정합니다.
      { type: 'obsidian', threshold: 0.01, minDepth: 1350, peakDepth: 1480, range: 120, scale: 5 },
      { type: 'uranium', threshold: 0.02, minDepth: 1200, peakDepth: 1350, range: 150, scale: 6 },
      { type: 'sapphire', threshold: 0.04, minDepth: 1050, peakDepth: 1200, range: 150, scale: 6 },
      { type: 'diamond', threshold: 0.06, minDepth: 450, peakDepth: 650, range: 200, scale: 8 },
      { type: 'ruby', threshold: 0.08, minDepth: 850, peakDepth: 1050, range: 200, scale: 7 },
      { type: 'emerald', threshold: 0.10, minDepth: 650, peakDepth: 850, range: 200, scale: 7 },
      { type: 'gold', threshold: 0.14, minDepth: 300, peakDepth: 500, range: 200, scale: 8 },
      
      // 2. 일반 광물
      { type: 'iron', threshold: 0.20, minDepth: 120, peakDepth: 280, range: 150, scale: 8 },
      { type: 'coal', threshold: 0.30, minDepth: 30, peakDepth: 120, range: 100, scale: 8 },
      { type: 'stone', threshold: 0.40, scale: 12 },
    ]
  }
];

export const getDimensionConfig = (id: number): DimensionConfig => {
  return DIMENSIONS.find(d => d.id === id) || DIMENSIONS[DIMENSIONS.length - 1];
};
