import { Tile, Entity, TILE_TYPE_TO_ID, ID_TO_TILE_TYPE } from '@/shared/types/game';
import { getMineralStats } from '@/shared/lib/tileUtils';
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
    }

    chunk[idx] = packed;
    this.modifiedCoords.add(`${x},${y}`);
    return health <= 0;
  }

  clearArea(startX: number, startY: number, width: number, height: number): void {
    const emptyId = TILE_TYPE_TO_ID['empty'] & TYPE_MASK;

    for (let cy = startY; cy < startY + height; cy++) {
      if (cy < 0 || cy >= MAP_HEIGHT) continue;

      for (let cx = startX; cx < startX + width; cx++) {
        const { chunkX, localX } = this.getChunkInfo(cx);
        const chunk = this.getChunk(chunkX);
        const idx = cy * CHUNK_WIDTH + localX;

        // 타입 0(empty), HP 0, GEN/MOD 플래그 설정
        chunk[idx] = emptyId | GEN_FLAG | MOD_FLAG;
        this.modifiedCoords.add(`${cx},${cy}`);
      }
    }
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
  }

  reset(newSeed?: number, newDimension?: number): void {
    if (newSeed !== undefined) {
      this.seed = newSeed;
      this.generator = new MapGenerator(this.seed, MAP_HEIGHT);
    }
    if (newDimension !== undefined) this.dimension = newDimension;
    this.chunks.clear();
    this.modifiedCoords.clear();
  }
}
