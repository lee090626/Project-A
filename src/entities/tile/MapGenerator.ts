import { Tile, TileType, Entity } from '@/shared/types/game';
import { getMineralStats } from '@/shared/lib/tileUtils';
import { BASE_DEPTH } from '@/shared/config/constants';
import {
  BOSS_SPAWN_X,
  CircleConfig,
  getBossSpawnDepth,
  getCircleConfig,
  getLayerFromDepth,
  MonsterSpawnRule,
} from '@/shared/config/circleData';
import { MONSTER_LIST } from '@/shared/config/monsterData';

export class MapGenerator {
  constructor(private seed: number, private mapHeight: number) {}

  public hash(x: number, y: number): number {
    const h = (Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453) % 1;
    return h < 0 ? h + 1 : h;
  }

  public calculateOriginalTile(x: number, y: number): Tile & { isSpot: boolean } {
    if (y < 0 || y >= this.mapHeight)
      return { type: 'wall', health: 1000000, maxHealth: 1000000, isSpot: false };

    if (y < BASE_DEPTH) {
      return { type: 'empty', health: 0, maxHealth: 0, isSpot: false };
    }

    const config = getCircleConfig(y - BASE_DEPTH);
    const layer = getLayerFromDepth(y - BASE_DEPTH, config);

    if (this.isBossSpawnFootprint(x, y, config))
      return { type: 'empty', health: 0, maxHealth: 0, isSpot: false };

    if (this.getInitialMonster(x, y))
      return { type: 'empty', health: 0, maxHealth: 0, isSpot: false };

    let type: TileType = (config.bgType ?? 'stone') as TileType;
    let isSpot = false;

    const SECTOR_SIZE = 5;
    const PADDING = 1;
    const sectorX = Math.floor(x / SECTOR_SIZE);
    const sectorY = Math.floor(y / SECTOR_SIZE);

    const SAFE_RANGE = SECTOR_SIZE - 2 * PADDING;

    const countHash = this.hash(sectorX * 31, sectorY * 37);
    const targetCount = Math.floor(countHash * 3) + 1; // 1, 2, or 3

    for (let i = 0; i < targetCount; i++) {
      const rx = Math.floor(this.hash(sectorX + 123 + i, sectorY + 456 + i) * SAFE_RANGE) + PADDING;
      const ry = Math.floor(this.hash(sectorX + 789 + i, sectorY + 101 + i) * SAFE_RANGE) + PADDING;
      const spotX = sectorX * SECTOR_SIZE + rx;
      const spotY = sectorY * SECTOR_SIZE + ry;

      if (spotX === x && spotY === y) {
        const roll = this.hash(x + 500, y + 600);

        const valuableMinerals = config.minerals.filter((rule) => layer >= (rule.minLayer ?? 1));
        let totalWeight = 0;
        for (const rule of valuableMinerals) {
          totalWeight += rule.threshold;
        }

        let cumulative = 0;
        const weightedRoll = roll * totalWeight;

        for (const rule of valuableMinerals) {
          cumulative += rule.threshold;
          if (weightedRoll <= cumulative) {
            type = rule.type;
            isSpot = true;
            break;
          }
        }

        if (!isSpot && valuableMinerals.length > 0) {
          type = valuableMinerals[0].type;
          isSpot = true;
        }
        break;
      }
    }

    const stats = getMineralStats(type);
    const health = stats.health;
    return { type, health, maxHealth: health, isSpot };
  }

  public getInitialMonster(x: number, y: number): Entity | null {
    if (y < BASE_DEPTH + 10) return null;
    const config = getCircleConfig(y - BASE_DEPTH);
    if (this.isBossSpawnFootprint(x, y, config)) return null;

    const layer = getLayerFromDepth(y - BASE_DEPTH, config);

    const available = config.monsters.filter(
      (m) => layer >= m.minLayer && (!m.maxLayer || layer <= m.maxLayer),
    );
    if (available.length === 0) return null;

    const MONSTER_SECTOR_SIZE = 8;
    const sectorX = Math.floor(x / MONSTER_SECTOR_SIZE);
    const sectorY = Math.floor(y / MONSTER_SECTOR_SIZE);

    const countHash = this.hash(sectorX * 41, sectorY * 43);
    const targetCount = Math.floor(countHash * 3) + 1; // 1, 2, or 3

    for (let i = 0; i < targetCount; i++) {
      const rx = Math.floor(this.hash(sectorX + 111 + i, sectorY + 222 + i) * MONSTER_SECTOR_SIZE);
      const ry = Math.floor(this.hash(sectorX + 333 + i, sectorY + 444 + i) * MONSTER_SECTOR_SIZE);
      const spotX = sectorX * MONSTER_SECTOR_SIZE + rx;
      const spotY = sectorY * MONSTER_SECTOR_SIZE + ry;

      if (spotX === x && spotY === y) {
        const spawnDensity = this.getMonsterDensity(config, layer, available);
        const spawnRoll = this.hash(x + 1777, y + 1999);
        if (spawnRoll > spawnDensity) return null;

        let totalWeight = 0;
        for (const rule of available) totalWeight += rule.weight;
        
        const roll = this.hash(sectorX * 997 + i * 73, sectorY * 877 + i * 61) * totalWeight;
        let cumulative = 0;
        let selectedRule = available[0];

        for (const rule of available) {
          cumulative += rule.weight;
          if (roll <= cumulative) {
            selectedRule = rule;
            break;
          }
        }

        const mob = MONSTER_LIST.find((m) => m.id === selectedRule.monsterId);
        if (!mob) continue;

        return {
          id: `mob_${x}_${y}_${mob.id}`,
          type: 'monster',
          name: mob.name,
          x,
          y,
          interactionType: 'none',
          imagePath: mob.imagePath,
          stats: {
            hp: mob.stats.maxHp,
            maxHp: mob.stats.maxHp,
            attack: mob.stats.power,
            defense: mob.stats.defense,
            attackCooldown: mob.stats.attackCooldown,
          },
          state: 'idle',
        };
      }
    }
    return null;
  }

  /**
   * 보스가 스폰되는 정확한 footprint 좌표인지 판정합니다.
   *
   * @param x - 월드 타일 X 좌표
   * @param y - 월드 타일 Y 좌표
   * @param config - 현재 서클 설정
   * @returns 좌표가 보스 스폰 footprint 안이면 true
   */
  private isBossSpawnFootprint(x: number, y: number, config: CircleConfig): boolean {
    if (!config.boss) return false;

    const boss = MONSTER_LIST.find((m) => m.id === config.boss?.id);
    const width = boss?.width ?? 5;
    const height = boss?.height ?? 5;
    const centerY = BASE_DEPTH + getBossSpawnDepth(config);
    const startX = BOSS_SPAWN_X - Math.floor(width / 2);
    const startY = centerY - Math.floor(height / 2);

    return x >= startX && x < startX + width && y >= startY && y < startY + height;
  }

  /**
   * 현재 서클/층에서 스폰 후보 슬롯이 실제 몬스터로 채워질 확률을 계산합니다.
   * 명시적인 density 설정이 있으면 우선 사용하고, 아직 이전 chance 구조를 쓰는 서클은 가중 평균 chance로 호환합니다.
   *
   * @param config - 현재 서클 설정
   * @param layer - 현재 서클 내부 층
   * @param available - 현재 층에서 선택 가능한 몬스터 규칙 목록
   * @returns 0~1 범위의 스폰 밀도
   */
  private getMonsterDensity(
    config: CircleConfig,
    layer: number,
    available: MonsterSpawnRule[],
  ): number {
    const explicitDensity = config.monsterDensityByLayer?.[layer];
    if (explicitDensity !== undefined) return this.clampChance(explicitDensity);

    let weightedChance = 0;
    let totalWeight = 0;
    for (const rule of available) {
      weightedChance += (rule.chance ?? 0) * rule.weight;
      totalWeight += rule.weight;
    }

    if (totalWeight <= 0) return 0;
    return this.clampChance(weightedChance / totalWeight);
  }

  /**
   * 확률 값을 안전한 0~1 범위로 제한합니다.
   *
   * @param value - 제한할 확률 값
   * @returns 0~1 범위로 보정된 값
   */
  private clampChance(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(1, value));
  }
}
