import { GameWorld } from '@/entities/world/model';
import { bossDirector } from './spawn/BossDirector';
import { mobSpawner } from './spawn/MobSpawner';
import { spawnCleaner } from './spawn/SpawnCleaner';

/**
 * 플레이어의 위치를 기반으로 주변 서클의 보스, 일반 몬스터를 스폰하고
 * 자원을 관리하는 메인 시스템(오케스트레이터)입니다.
 */
export const spawnSystem = (world: GameWorld) => {
  // 1. [SoC: 보스] 서클 보스 소환 관리
  bossDirector(world);

  // 2. [SoC: 일반 몹] 그리드 탐색 기반 몬스터 스폰
  mobSpawner(world);

  // 3. [SoC: 정리] 사거리 밖 엔티티 및 좌표 데이터 최적화
  spawnCleaner(world);
};
