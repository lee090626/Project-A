import { Tile, Entity, TILE_TYPE_TO_ID, ID_TO_TILE_TYPE } from '@/shared/types/game';
import { getMineralStats } from '@/shared/lib/tileUtils';
import { BASE_DEPTH } from '@/shared/config/constants';
import { CIRCLES } from '@/shared/config/circleData';
import {
  MAP_HEIGHT,
  CHUNK_WIDTH,
  TYPE_MASK,
  HP_BITS,
  HP_MASK,
  GEN_FLAG,
  MOD_FLAG,
  SPOT_FLAG,
} from './TileMapConstants';
import { MapGenerator } from './MapGenerator';
import { MapSerializer } from './MapSerializer';

/**
 * [무한 가로맵 버전] TileMap 클래스
 * - 청크(Chunk) 기반 시스템으로 가로 방향 무한 확장 지원
 * - 단일 책임 원칙 (SRP) 준수를 위해 생성 로직과 직렬화 로직 분리
 */
export class TileMap {
  private chunks: Map<number, Int32Array> = new Map();
  private generator: MapGenerator;

  public seed: number;
  public dimension: number;
  public modifiedCoords: Set<string> = new Set();
  /** 타일 렌더러가 지형 변경 여부를 빠르게 감지하기 위한 버전 값입니다. */
  public renderRevision: number = 0;

  constructor(seed: number = 12345, dimension: number = 0) {
    this.seed = seed;
    this.dimension = dimension;
    this.generator = new MapGenerator(this.seed, MAP_HEIGHT);
  }

  public getChunkInfo(x: number) {
    const chunkX = Math.floor(x / CHUNK_WIDTH);
    const localX = x - chunkX * CHUNK_WIDTH;
    return { chunkX, localX };
  }

  public getChunk(chunkX: number): Int32Array {
    let chunk = this.chunks.get(chunkX);
    if (!chunk) {
      chunk = new Int32Array(CHUNK_WIDTH * MAP_HEIGHT);
      this.chunks.set(chunkX, chunk);
    }
    return chunk;
  }

  public getInitialMonster(x: number, y: number): Entity | null {
    return this.generator.getInitialMonster(x, y);
  }

  /**
   * 지정 영역 안에서 플레이어가 직접 수정하지 않은 생성 타일만 무효화합니다.
   * 스폰 규칙 변경 후 몬스터 자리로 재판정될 수 있는 기존 주변 타일을 새 규칙으로 다시 생성하기 위해 사용합니다.
   *
   * @param startX - 무효화 시작 X 좌표
   * @param startY - 무효화 시작 Y 좌표
   * @param width - 무효화할 타일 가로 길이
   * @param height - 무효화할 타일 세로 길이
   */
  public invalidateGeneratedUnmodifiedArea(
    startX: number,
    startY: number,
    width: number,
    height: number,
  ): void {
    let changed = false;

    for (let y = startY; y < startY + height; y++) {
      if (y < 0 || y >= MAP_HEIGHT) continue;

      for (let x = startX; x < startX + width; x++) {
        const { chunkX, localX } = this.getChunkInfo(x);
        const chunk = this.chunks.get(chunkX);
        if (!chunk) continue;

        const idx = y * CHUNK_WIDTH + localX;
        const packed = chunk[idx];
        if ((packed & GEN_FLAG) && !(packed & MOD_FLAG)) {
          chunk[idx] = 0;
          changed = true;
        }
      }
    }

    if (changed) this.renderRevision++;
  }

  /**
   * 저장된 수정 타일 중 특정 깊이 범위와 타입이 일치하는 타일만 다른 타입으로 교체합니다.
   * HP와 GEN/MOD/SPOT 플래그는 유지하여 기존 파손 상태와 저장 상태를 보존합니다.
   *
   * @param fromType - 교체 전 타일 타입
   * @param toType - 교체 후 타일 타입
   * @param startY - 포함되는 시작 Y 좌표
   * @param endY - 제외되는 종료 Y 좌표
   */
  public replaceModifiedTileTypeInDepthRange(
    fromType: Tile['type'],
    toType: Tile['type'],
    startY: number,
    endY: number,
  ): void {
    const fromTypeId = TILE_TYPE_TO_ID[fromType];
    const toTypeId = TILE_TYPE_TO_ID[toType];
    if (fromTypeId === undefined || toTypeId === undefined) return;

    let changed = false;

    for (const coordStr of this.modifiedCoords) {
      const [x, y] = coordStr.split(',').map(Number);
      if (y < startY || y >= endY) continue;

      const { chunkX, localX } = this.getChunkInfo(x);
      const chunk = this.chunks.get(chunkX);
      if (!chunk) continue;

      const idx = y * CHUNK_WIDTH + localX;
      const packed = chunk[idx];
      if (!(packed & MOD_FLAG)) continue;
      if ((packed & TYPE_MASK) !== fromTypeId) continue;

      chunk[idx] = (packed & ~TYPE_MASK) | (toTypeId & TYPE_MASK);
      changed = true;
    }

    if (changed) this.renderRevision++;
  }

  /**
   * 지정 영역 안의 저장된 빈칸 수정을 제거하여 다음 조회 시 원본 생성 규칙으로 다시 생성되게 합니다.
   *
   * @param startX - 복구 시작 X 좌표
   * @param startY - 복구 시작 Y 좌표
   * @param width - 복구할 타일 가로 길이
   * @param height - 복구할 타일 세로 길이
   * @returns 복구된 타일 수
   */
  public restoreModifiedEmptyArea(
    startX: number,
    startY: number,
    width: number,
    height: number,
  ): number {
    const emptyId = TILE_TYPE_TO_ID['empty'] & TYPE_MASK;
    let restoredCount = 0;

    for (let y = startY; y < startY + height; y++) {
      if (y < 0 || y >= MAP_HEIGHT) continue;

      for (let x = startX; x < startX + width; x++) {
        const { chunkX, localX } = this.getChunkInfo(x);
        const chunk = this.chunks.get(chunkX);
        if (!chunk) continue;

        const idx = y * CHUNK_WIDTH + localX;
        const packed = chunk[idx];
        if (!(packed & MOD_FLAG)) continue;
        if ((packed & TYPE_MASK) !== emptyId) continue;

        chunk[idx] = 0;
        this.modifiedCoords.delete(`${x},${y}`);
        restoredCount++;
      }
    }

    if (restoredCount > 0) this.renderRevision++;
    return restoredCount;
  }

  /**
   * 지정 영역 안의 저장된 수정을 제거하여 다음 조회 시 원본 생성 규칙으로 다시 생성되게 합니다.
   *
   * @param startX - 복구 시작 X 좌표
   * @param startY - 복구 시작 Y 좌표
   * @param width - 복구할 타일 가로 길이
   * @param height - 복구할 타일 세로 길이
   * @returns 복구된 타일 수
   */
  public restoreModifiedArea(
    startX: number,
    startY: number,
    width: number,
    height: number,
  ): number {
    let restoredCount = 0;

    for (let y = startY; y < startY + height; y++) {
      if (y < 0 || y >= MAP_HEIGHT) continue;

      for (let x = startX; x < startX + width; x++) {
        const { chunkX, localX } = this.getChunkInfo(x);
        const chunk = this.chunks.get(chunkX);
        if (!chunk) continue;

        const idx = y * CHUNK_WIDTH + localX;
        const packed = chunk[idx];
        if (!(packed & MOD_FLAG)) continue;

        chunk[idx] = 0;
        this.modifiedCoords.delete(`${x},${y}`);
        restoredCount++;
      }
    }

    if (restoredCount > 0) this.renderRevision++;
    return restoredCount;
  }

  /**
   * C3 전용 배경 타입 도입 이전 세이브의 수정된 일반 stone 배경을 탐식 지층으로 승격합니다.
   */
  private migrateGluttonyBackgroundTiles(): void {
    const gluttonyCircle = CIRCLES.find((circle) => circle.id === 3);
    if (!gluttonyCircle) return;

    this.replaceModifiedTileTypeInDepthRange(
      'stone',
      'gluttony_stone',
      BASE_DEPTH + gluttonyCircle.depthStart,
      BASE_DEPTH + gluttonyCircle.depthEnd,
    );
  }

  getTile(x: number, y: number): Tile | null {
    if (y < 0 || y >= MAP_HEIGHT) return null;

    const { chunkX, localX } = this.getChunkInfo(x);
    const chunk = this.getChunk(chunkX);
    const idx = y * CHUNK_WIDTH + localX;

    let packed = chunk[idx];

    // 생성된 적이 없으면 즉석 생성 및 패킹 저장
    if (!(packed & GEN_FLAG)) {
      const original = this.generator.calculateOriginalTile(x, y);
      const typeId = TILE_TYPE_TO_ID[original.type] ?? 0;
      packed =
        (typeId & TYPE_MASK) |
        ((original.health & HP_MASK) << HP_BITS) |
        GEN_FLAG |
        (original.isSpot ? SPOT_FLAG : 0);
      chunk[idx] = packed;
    }

    const typeId = packed & TYPE_MASK;
    const health = (packed >> HP_BITS) & HP_MASK;
    const type = ID_TO_TILE_TYPE[typeId] || 'crimsonstone';
    const stats = getMineralStats(type);
    const isSpot = !!(packed & SPOT_FLAG);

    return {
      type,
      health,
      maxHealth: stats.health,
      isSpot,
    };
  }

  damageTile(x: number, y: number, amount: number): boolean {
    if (y < 0 || y >= MAP_HEIGHT) return false;

    const { chunkX, localX } = this.getChunkInfo(x);
    const chunk = this.getChunk(chunkX);
    const idx = y * CHUNK_WIDTH + localX;

    if (!(chunk[idx] & GEN_FLAG)) {
      this.getTile(x, y);
    }

    let packed = chunk[idx];
    const typeId = packed & TYPE_MASK;
    if (typeId === TILE_TYPE_TO_ID['empty'] || typeId === TILE_TYPE_TO_ID['wall']) return false;

    let health = (packed >> HP_BITS) & HP_MASK;
    health = Math.max(0, health - amount);

    packed = (packed & ~(HP_MASK << HP_BITS)) | (health << HP_BITS);
    packed |= MOD_FLAG;

    if (health <= 0) {
      packed = (packed & ~TYPE_MASK) | (TILE_TYPE_TO_ID['empty'] & TYPE_MASK);
      this.renderRevision++;
    }

    chunk[idx] = packed;
    this.modifiedCoords.add(`${x},${y}`);
    return health <= 0;
  }

  clearArea(startX: number, startY: number, width: number, height: number): void {
    const emptyId = TILE_TYPE_TO_ID['empty'] & TYPE_MASK;
    let changed = false;

    for (let cy = startY; cy < startY + height; cy++) {
      if (cy < 0 || cy >= MAP_HEIGHT) continue;

      for (let cx = startX; cx < startX + width; cx++) {
        const { chunkX, localX } = this.getChunkInfo(cx);
        const chunk = this.getChunk(chunkX);
        const idx = cy * CHUNK_WIDTH + localX;

        // 타입 0(empty), HP 0, GEN/MOD 플래그 설정
        chunk[idx] = emptyId | GEN_FLAG | MOD_FLAG;
        this.modifiedCoords.add(`${cx},${cy}`);
        changed = true;
      }
    }

    if (changed) this.renderRevision++;
  }

  serializeToBuffer(): Uint32Array {
    return MapSerializer.serializeToBuffer(this.modifiedCoords, this.chunks, this.getChunkInfo.bind(this));
  }

  deserializeFromBuffer(buffer: ArrayBuffer, seed?: number, dimension?: number): void {
    if (seed !== undefined) {
      this.seed = seed;
      this.generator = new MapGenerator(this.seed, MAP_HEIGHT);
    }
    if (dimension !== undefined) this.dimension = dimension;

    this.chunks.clear();
    this.modifiedCoords.clear();

    MapSerializer.deserializeFromBuffer(
      buffer,
      this.chunks,
      this.modifiedCoords,
      this.getChunkInfo.bind(this),
      this.getChunk.bind(this)
    );
    this.migrateGluttonyBackgroundTiles();
    this.renderRevision++;
  }

  deserialize(data: any, seed?: number, dimension?: number): void {
    if (seed !== undefined) {
      this.seed = seed;
      this.generator = new MapGenerator(this.seed, MAP_HEIGHT);
    }
    if (dimension !== undefined) this.dimension = dimension;

    this.chunks.clear();
    this.modifiedCoords.clear();

    MapSerializer.deserializeObject(
      data,
      this.chunks,
      this.modifiedCoords,
      this.getChunkInfo.bind(this),
      this.getChunk.bind(this)
    );
    this.migrateGluttonyBackgroundTiles();
    this.renderRevision++;
  }

  reset(newSeed?: number, newDimension?: number): void {
    if (newSeed !== undefined) {
      this.seed = newSeed;
      this.generator = new MapGenerator(this.seed, MAP_HEIGHT);
    }
    if (newDimension !== undefined) this.dimension = newDimension;
    this.chunks.clear();
    this.modifiedCoords.clear();
    this.renderRevision++;
  }
}
