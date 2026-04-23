import { createInitialWorld, GameWorld } from '@/entities/world/model';
import * as PIXI from 'pixi.js';
import { LightingFilter } from '@/features/game/lib/LightingFilter';
import { GameLoop } from '@/features/game/ecs/systems/GameLoop';
import { handlePlayerAction } from '@/features/game/ecs/systems/ActionSystem';
import { syncPermanentStats } from '@/features/game/ecs/systems/statsSyncSystem';
import { forceSyncUi } from '@/features/game/ecs/systems/syncSystem';
import { messageBus, TOPIC } from '@/shared/lib/MessageBus';
import { AssetParser } from '../lib/AssetParser';
import {
  InitPayload,
  UpdateAssetsPayload,
  InputPayload,
  ActionPayload,
} from '@/shared/types/worker';
import { GameLayers, TextureRegistry } from '@/shared/types/engine';

/**
 * GameEngineInstance class
 * Handles dependency injection and message routing within the worker.
 */
export class GameEngineInstance {
  world: GameWorld;
  pixiApp: PIXI.Application | null = null;

  // Pixi layer structure
  layers: GameLayers | null = null;
  textures: TextureRegistry = {};
  lightingFilter: LightingFilter | null = null;

  private readonly BUFFER_SIZE = (16 + 5000 * 8) * 4;
  bufferPool: ArrayBuffer[] = [];

  private gameLoop: GameLoop | null = null;

  constructor() {
    this.world = createInitialWorld(12345);
    for (let i = 0; i < 3; i++) {
      this.bufferPool.push(new ArrayBuffer(this.BUFFER_SIZE));
    }

    // [Stage 3] 스탯 재계산 이벤트 리스너 등록
    messageBus.on(TOPIC.RECALCULATE_PLAYER_STATS, () => {
      if (this.world?.player) {
        syncPermanentStats(this.world.player);
        // 즉시 UI 동기화 (반영 핑 제거)
        forceSyncUi(this.world);
      }
    });
  }

  /** Initialize Pixi with new OffscreenCanvas */
  async setCanvas(newCanvas: OffscreenCanvas) {
    if (this.pixiApp) {
      this.pixiApp.destroy(true, { children: true, texture: true });
    }

    this.pixiApp = new PIXI.Application();
    await this.pixiApp.init({
      canvas: newCanvas,
      width: newCanvas.width,
      height: newCanvas.height,
      backgroundAlpha: 0,
      antialias: true,
      preference: 'webgl',
    });

    const stage = new PIXI.Container();
    const tileLayer = new PIXI.Container();
    const staticLayer = new PIXI.Container();
    const entityLayer = new PIXI.Container();
    const effectLayer = new PIXI.Container();
    const lightLayer = new PIXI.Container();
    const uiLayer = new PIXI.Container();

    stage.addChild(tileLayer);
    stage.addChild(staticLayer);
    stage.addChild(entityLayer);
    stage.addChild(effectLayer);
    stage.addChild(lightLayer);
    stage.addChild(uiLayer);

    this.pixiApp.stage.addChild(stage);

    this.lightingFilter = new LightingFilter();
    stage.filters = [this.lightingFilter];

    this.layers = { stage, tileLayer, staticLayer, entityLayer, effectLayer, lightLayer, uiLayer };

    if (this.gameLoop) {
      this.gameLoop.updateDependencies(
        this.world,
        this.pixiApp,
        this.layers,
        this.textures,
        this.lightingFilter,
      );
    }
  }

  returnBuffer(buffer: ArrayBuffer) {
    this.bufferPool.push(buffer);
  }

  /**
   * 엔진 초기화 및 세이브 데이터 로드
   * @param payload 초기화 설정 및 데이터
   */
  async init(payload: InitPayload) {
    const seed = payload.seed || 12345;
    const currentAssets = this.world.assets;
    const currentLayout = this.world.baseLayout;
    const currentStaticEntities = this.world.staticEntities;

    // 월드 초기화
    this.world = createInitialWorld(seed);
    this.world.assets = currentAssets;
    this.world.baseLayout = currentLayout;
    this.world.staticEntities = currentStaticEntities;

    // 세이브 데이터 복구
    if (payload.saveData) {
      const { stats, position, tileMap, tileMapData, tileMapBuffer } = payload.saveData;
      this.world.player.stats = stats;
      this.world.player.pos = position;
      this.world.player.visualPos = { ...position };

      if (tileMapBuffer) {
        // [New] IndexedDB에서 로드한 바이너리 버퍼 직접 사용 (변환 없음)
        this.world.tileMap.deserializeFromBuffer(tileMapBuffer, stats.mapSeed, stats.dimension);
      } else if (tileMapData) {
        // [Legacy] Base64 문자열을 디코딩 후 복원
        const binary = atob(tileMapData);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        this.world.tileMap.deserializeFromBuffer(bytes.buffer, stats.mapSeed, stats.dimension);
      } else if (tileMap) {
        this.world.tileMap.deserialize(tileMap, stats.mapSeed, stats.dimension);
      }
    }

    // 캔버스 설정
    if (payload.offscreen) {
      await this.setCanvas(payload.offscreen);
    }

    // 게임 루프 시작 또는 업데이트
    if (!this.gameLoop) {
      this.gameLoop = new GameLoop(
        this.world,
        this.pixiApp,
        this.layers,
        this.textures,
        this.lightingFilter,
        this.bufferPool,
      );
      this.gameLoop.start();
      self.postMessage({ type: 'ENGINE_READY' });
    } else {
      this.gameLoop.updateDependencies(
        this.world,
        this.pixiApp,
        this.layers,
        this.textures,
        this.lightingFilter,
      );
    }

    // [Stage 3] 초기화 완료 후 최초 1회 강제 스탯 동기화
    syncPermanentStats(this.world.player);
  }

  /**
   * 아틀라스 데이터로부터 에셋 및 레이아웃 업데이트
   * @param payload 에셋 데이터
   */
  async updateAssetsFromAtlas(payload: UpdateAssetsPayload) {
    if (!this.world) return;
    const { atlasData, layout, entities } = payload;

    this.world.baseLayout = layout;
    this.world.staticEntities = entities;

    // 분할된 AssetParser 호출 (단일 책임 원칙)
    await AssetParser.parseAtlasData(atlasData, this.textures);

    if (this.gameLoop) {
      this.gameLoop.updateDependencies(
        this.world,
        this.pixiApp,
        this.layers,
        this.textures,
        this.lightingFilter,
      );
    }

    self.postMessage({ type: 'ENGINE_READY' });
  }

  resize(width: number, height: number) {
    if (this.pixiApp) {
      this.pixiApp.renderer.resize(width, height);
    }
  }

  /**
   * 입력 상태 업데이트 (키보드, 조이스틱)
   * @param payload 입력 데이터
   */
  handleInput(payload: InputPayload) {
    if (payload.keys) {
      this.world.keys = { ...this.world.keys, ...payload.keys };
    }
    if (payload.mobileJoystick) {
      this.world.mobileJoystick = payload.mobileJoystick;
    }
  }

  /**
   * 액션 처리 (차원 이동 등)
   * @param payload 액션 데이터
   */
  handleAction(payload: ActionPayload) {
    const { action } = payload;

    if (action === 'travelDimension') {
      const targetDepth = payload.targetDepth || 0;
      this.world.player.pos.x = 15;
      this.world.player.pos.y = targetDepth;
      this.world.player.visualPos.x = 15;
      this.world.player.visualPos.y = targetDepth;
      this.world.player.stats.depth = targetDepth;

      (self as any).postMessage({ type: 'DIMENSION_TRAVEL_COMPLETE' });
      return;
    }

    handlePlayerAction(this.world, payload);
  }

  handleSaveRequest() {
    const tileMapBuffer = this.world.tileMap.serializeToBuffer();
    (self as any).postMessage(
      {
        type: 'EXPORT_DATA',
        payload: {
          version: 1,
          timestamp: Date.now(),
          stats: this.world.player.stats,
          position: this.world.player.pos,
          tileMapBuffer: tileMapBuffer,
        },
      },
      [tileMapBuffer.buffer],
    );
  }

  async safeReset(seed: number, dimension: number) {
    if (this.gameLoop) {
      await this.gameLoop.safeReset(seed, dimension);
      this.world.player.stats.mapSeed = seed;
      this.world.player.stats.dimension = dimension;
    }
  }
}
