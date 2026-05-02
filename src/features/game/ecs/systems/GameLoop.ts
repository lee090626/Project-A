import { GameWorld } from '@/entities/world/model';
import { inputSystem } from '@/features/input/inputSystem';
import { physicsSystem } from '@/features/game/ecs/systems/physics';
import { miningSystem } from '@/features/game/ecs/systems/mining';
import { interactionSystem } from '@/features/game/ecs/systems/interactionSystem';

import { spawnSystem } from '@/features/game/ecs/systems/spawn';
import { monsterAiSystem } from '@/features/game/ecs/systems/combat/monsterAiSystem';
import { combatSystem } from '@/features/game/ecs/systems/combat';
import { effectSystem } from '@/features/game/ecs/systems/effect';
import { renderSystem } from '@/features/game/ecs/systems/renderSystem';
import { statusSystem } from '@/features/game/ecs/systems/status';
import { tutorialSystem } from '@/features/game/ecs/systems/tutorialSystem';
import { bossBehaviorSystem } from '@/features/game/ecs/systems/boss';
import { projectileSystem } from '@/features/game/ecs/systems/combat/projectileSystem';
import { statsSyncSystem } from '@/features/game/ecs/systems/statsSyncSystem';
import { spatialHashUpdateSystem } from '@/features/game/ecs/systems/spatialHashUpdateSystem';
import { syncUiSystem } from '@/features/game/ecs/systems/syncSystem';
import { autoSaveSystem } from '@/features/game/ecs/systems/storageSystem';
import { vfxSystem } from '@/features/game/ecs/systems/VfxSystem';
import * as PIXI from 'pixi.js';
import {
  TILE_SIZE,
  UI_SYNC_INTERVAL,
  SPATIAL_HASH_INTERVAL,
} from '@/shared/config/constants';
import { RenderSyncEncoder } from '@/features/game/lib/RenderSyncEncoder';
import { GameLayers, TextureRegistry } from '@/shared/types/engine';
import { LightingFilter } from '@/features/game/lib/LightingFilter';

type PerfPhase =
  | 'spatialHash'
  | 'input'
  | 'status'
  | 'physics'
  | 'mining'
  | 'interaction'
  | 'spawn'
  | 'monsterAi'
  | 'bossBehavior'
  | 'projectile'
  | 'combat'
  | 'effect'
  | 'tutorial'
  | 'render'
  | 'uiSync'
  | 'renderSync'
  | 'autoSave'
  | 'statsSync';

/**
 * GameLoop 디버그 샘플러가 시스템별 누적 실행 시간을 기록하는 구조체입니다.
 */
interface PerfCounter {
  totalMs: number;
  maxMs: number;
  calls: number;
}

const PERF_PHASES: PerfPhase[] = [
  'spatialHash',
  'input',
  'status',
  'physics',
  'mining',
  'interaction',
  'spawn',
  'monsterAi',
  'bossBehavior',
  'projectile',
  'combat',
  'effect',
  'tutorial',
  'render',
  'uiSync',
  'renderSync',
  'autoSave',
  'statsSync',
];

/**
 * GameLoop 시스템별 성능 카운터를 초기화합니다.
 *
 * @returns 모든 측정 구간이 0으로 초기화된 성능 카운터 맵
 */
function createPerfCounters(): Record<PerfPhase, PerfCounter> {
  return PERF_PHASES.reduce(
    (counters, phase) => {
      counters[phase] = { totalMs: 0, maxMs: 0, calls: 0 };
      return counters;
    },
    {} as Record<PerfPhase, PerfCounter>,
  );
}

/**
 * 게임 메인 루프를 관리하는 클래스 (Ticker)
 * 각 시스템(ECS)의 틱을 제어하고, 워커-메인 간의 상태 동기화를 보장합니다.
 */
export class GameLoop {
  private isRunning: boolean = false;
  private lastLoopTime: number = 0;

  // 상태 동기화 관리
  private lastSyncTime: number = 0;
  private lastUiSyncTime: number = 0;
  private lastSpatialHashTime: number = 0;
  private lastSpawnTime: number = 0;
  private lastSaveTime: number = 0;
  private lastStatsSyncTime: number = 0;
  private readonly STATS_SYNC_FALLBACK_INTERVAL: number = 2000; // 2초 안전망
  private readonly SPAWN_SYSTEM_INTERVAL: number = 100; // 몬스터/보스 스폰 판정은 10Hz로 제한
  public readonly syncInterval: number = 66.66; // HUD interpolation sync target (~15Hz)
  private readonly perfSamplerEnabled = process.env.NODE_ENV !== 'production';
  private readonly perfSampleInterval: number = 1000;
  private perfSampleStartTime: number = 0;
  private perfFrameCount: number = 0;
  private perfCounters: Record<PerfPhase, PerfCounter> = createPerfCounters();

  // 의존성 주입(DI) 데이터
  private world: GameWorld;
  private pixiApp: PIXI.Application | null;
  private layers: GameLayers | null;
  private textures: TextureRegistry;
  private lightingFilter: LightingFilter | null;
  private bufferPool: ArrayBuffer[];

  constructor(
    world: GameWorld,
    pixiApp: PIXI.Application | null,
    layers: GameLayers | null,
    textures: TextureRegistry,
    lightingFilter: LightingFilter | null,
    bufferPool: ArrayBuffer[]
  ) {
    this.world = world;
    this.pixiApp = pixiApp;
    this.layers = layers;
    this.textures = textures;
    this.lightingFilter = lightingFilter;
    this.bufferPool = bufferPool;

    // [STEP 9] 시각 효과(VFX) 시스템 초기화 및 이벤트 리스너 등록
    vfxSystem.init(this.world);
  }

  public updateDependencies(
    world: GameWorld,
    pixiApp: PIXI.Application | null,
    layers: GameLayers | null,
    textures: TextureRegistry,
    lightingFilter: LightingFilter | null
  ) {
    this.world = world;
    this.pixiApp = pixiApp;
    this.layers = layers;
    this.textures = textures;
    this.lightingFilter = lightingFilter;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastLoopTime = performance.now();
    this.loop(this.lastLoopTime);
  }

  public stop() {
    this.isRunning = false;
  }

  /**
   * 디버그 모드에서 특정 시스템 실행 시간을 측정합니다.
   *
   * @param phase - 측정 대상 시스템 이름
   * @param callback - 측정하며 실행할 작업
   * @returns callback 실행 결과
   */
  private samplePerf<T>(phase: PerfPhase, callback: () => T): T {
    if (!this.perfSamplerEnabled) return callback();

    const start = performance.now();
    try {
      return callback();
    } finally {
      const elapsed = performance.now() - start;
      const counter = this.perfCounters[phase];
      counter.totalMs += elapsed;
      counter.maxMs = Math.max(counter.maxMs, elapsed);
      counter.calls++;
    }
  }

  /**
   * 누적된 GameLoop 성능 샘플을 1초 단위로 콘솔에 출력합니다.
   *
   * @param now - 현재 루프 타임스탬프
   */
  private reportPerfSample(now: number): void {
    if (!this.perfSamplerEnabled) return;

    if (this.perfSampleStartTime === 0) {
      this.perfSampleStartTime = now;
    }

    this.perfFrameCount++;
    const elapsed = now - this.perfSampleStartTime;
    if (elapsed < this.perfSampleInterval) return;

    const rows = PERF_PHASES
      .map((phase) => {
        const counter = this.perfCounters[phase];
        if (counter.calls === 0) return null;

        return {
          phase,
          calls: counter.calls,
          avgMs: Number((counter.totalMs / counter.calls).toFixed(3)),
          maxMs: Number(counter.maxMs.toFixed(3)),
          totalMs: Number(counter.totalMs.toFixed(3)),
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .sort((a, b) => b.totalMs - a.totalMs);

    console.log(
      `[GameLoop Perf] ${this.perfFrameCount} frames, avg frame ${(
        elapsed / this.perfFrameCount
      ).toFixed(2)}ms`,
    );
    console.table(rows);

    this.perfSampleStartTime = now;
    this.perfFrameCount = 0;
    this.perfCounters = createPerfCounters();
  }

  /**
   * [v4 Protocol] 차원 이동 및 월드 리셋을 위한 안전 시퀀스
   */
  public async safeReset(newSeed: number, nextDim: number) {
    // 1. Pause
    this.isRunning = false;
    console.log('[GameLoop] Reset sequence started. Loop paused.');

    // 2. Flush (최종 UI 상태 동기화)
    self.postMessage({
      type: 'SYNC_UI',
      payload: {
        stats: this.world.player.stats,
        ui: this.world.ui,
      },
    });

    // 약간의 딜레이를 주어 메시지가 전송될 시간을 확보 (필요 시)
    await new Promise((resolve) => setTimeout(resolve, 50));

    // 3. Clear (풀 비우기)
    this.world.particlePool.getPool().forEach((p) => (p.active = false));
    this.world.floatingTextPool.getPool().forEach((f) => (f.active = false));
    this.world.droppedItemPool.clear();
    this.world.entities.clear(); // [v4] Protocol: Reuse instance, just clear data
    this.world.spawnedCoords.clear();

    // 4. Reset (타일맵 리셋)
    this.world.tileMap.reset(newSeed, nextDim);

    // 플레이어 위치 초기화
    this.world.player.pos = { x: 15, y: 8 };
    this.world.player.visualPos = { x: 15, y: 8 };
    this.world.player.stats.depth = 0;

    console.log('[GameLoop] World reset complete.');

    // 5. Resume
    this.isRunning = true;
    this.lastLoopTime = performance.now();
    this.loop(this.lastLoopTime);
  }

  private loop = (now: number) => {
    if (!this.isRunning) return;

    const deltaTime = now - (this.lastLoopTime || now);
    this.lastLoopTime = now;

    try {
      // 0. 공간 분할(Spatial Hash) 그리드 업데이트 (Throttling 적용: ~30Hz)
      if (now - this.lastSpatialHashTime > SPATIAL_HASH_INTERVAL) {
        this.samplePerf('spatialHash', () => spatialHashUpdateSystem(this.world));
        this.lastSpatialHashTime = now;
      }

      // 1. 게임 시뮬레이션 (역경직 중에는 스킵)
      const isHitStopping = now < this.world.hitStopUntil;
      
      if (!isHitStopping) {
        this.samplePerf('input', () => inputSystem(this.world));
        this.samplePerf('status', () => statusSystem(this.world, now));
        
        // [Stage 3] 매 프레임 호출 제거 (이벤트 기반으로 전환)
        // statsSyncSystem(this.world.player); 

        this.samplePerf('physics', () => physicsSystem(this.world, now));
        this.samplePerf('mining', () => miningSystem(this.world, now));
        this.samplePerf('interaction', () => interactionSystem(this.world));
        if (now - this.lastSpawnTime > this.SPAWN_SYSTEM_INTERVAL) {
          this.samplePerf('spawn', () => spawnSystem(this.world));
          this.lastSpawnTime = now;
        }
        this.samplePerf('monsterAi', () => monsterAiSystem(this.world, now));
        this.samplePerf('bossBehavior', () => bossBehaviorSystem(this.world, deltaTime, now));
        this.samplePerf('projectile', () => projectileSystem(this.world, deltaTime, now));
        this.samplePerf('combat', () => combatSystem(this.world, deltaTime, now));
        this.samplePerf('effect', () => effectSystem(this.world, deltaTime));
        this.samplePerf('tutorial', () => tutorialSystem(this.world));
      } else {
        // 역경직 중에도 효과 시스템(이펙트 가시성)은 업데이트할 수도 있으나, 
        // 완벽한 멈춤을 위해 일단 모든 로직 시뮬레이션을 건너뜁니다.
      }

      // 2. 렌더링 호출
      if (this.pixiApp && this.layers) {
        this.samplePerf('render', () => {
          renderSystem(this.world, this.pixiApp!, this.layers!, now, this.textures, this.lightingFilter);
        });
      }

      // 3. UI 동기화 방출 (Zustand 데이터)
      this.lastUiSyncTime = this.samplePerf('uiSync', () =>
        syncUiSystem(this.world, this.lastUiSyncTime, now, UI_SYNC_INTERVAL),
      );

      // 4. 트리플 버퍼 기반 렌더 패킷 방출 (Viewport Culling 적용)
      if (now - this.lastSyncTime > this.syncInterval && this.bufferPool.length > 0) {
        this.lastSyncTime = now;
        const buffer = this.bufferPool.shift()!;
        this.samplePerf('renderSync', () => RenderSyncEncoder.encodeAndSend(this.world, buffer, now));
      }

      // 5. 자동 저장(10초)
      this.lastSaveTime = this.samplePerf('autoSave', () => autoSaveSystem(this.world, this.lastSaveTime, now));

      // 6. [Stage 3] 스탯 동기화 안전망 (이벤트 누락 대비 2초마다 1회 실행)
      if (now - this.lastStatsSyncTime > this.STATS_SYNC_FALLBACK_INTERVAL) {
        this.samplePerf('statsSync', () => statsSyncSystem(this.world.player));
        this.lastStatsSyncTime = now;
      }

      this.reportPerfSample(now);
    } catch (err) {
      console.error('[Worker Loop Error]', err);
    }

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(this.loop);
    } else {
      setTimeout(() => this.loop(performance.now()), 16);
    }
  };
}
