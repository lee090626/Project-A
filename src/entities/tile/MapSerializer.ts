import {
  MAP_HEIGHT,
  CHUNK_WIDTH,
  TYPE_MASK,
  HP_BITS,
  HP_MASK,
  GEN_FLAG,
  MOD_FLAG,
} from './TileMapConstants';

const SERIALIZED_HEADER_SIZE = 4;
const MAX_SERIALIZED_TILE_RECORDS = 250_000;
const MAX_DESERIALIZED_CHUNKS = 128;

function isValidTileCoord(x: number, y: number): boolean {
  return Number.isInteger(x) && Number.isInteger(y) && y >= 0 && y < MAP_HEIGHT;
}

function getBoundedRecordCount(
  declaredCount: number,
  dataLength: number,
  fieldsPerRecord: number,
): number {
  const availableCount = Math.max(
    0,
    Math.floor((dataLength - SERIALIZED_HEADER_SIZE) / fieldsPerRecord),
  );
  return Math.min(declaredCount, availableCount, MAX_SERIALIZED_TILE_RECORDS);
}

function canRestoreChunk(chunkX: number, restoredChunks: Set<number>): boolean {
  if (restoredChunks.has(chunkX)) return true;
  if (restoredChunks.size >= MAX_DESERIALIZED_CHUNKS) return false;

  restoredChunks.add(chunkX);
  return true;
}

export class MapSerializer {
  public static serializeToBuffer(
    modifiedCoords: Set<string>,
    chunks: Map<number, Int32Array>,
    getChunkInfo: (x: number) => { chunkX: number; localX: number }
  ): Uint32Array {
    let modCount = 0;
    const validCoords: { x: number; y: number; packed: number }[] = [];

    for (const coordStr of modifiedCoords) {
      const [x, y] = coordStr.split(',').map(Number);
      const { chunkX, localX } = getChunkInfo(x);
      const chunk = chunks.get(chunkX);
      if (chunk) {
        const idx = y * CHUNK_WIDTH + localX;
        const packed = chunk[idx];
        if (packed & MOD_FLAG) {
          validCoords.push({ x, y, packed });
          modCount++;
        }
      }
    }

    const buffer = new Uint32Array(SERIALIZED_HEADER_SIZE + modCount * 3);

    buffer[0] = 2; // Version 2
    buffer[1] = 0; // MAP_WIDTH (Legacy)
    buffer[2] = modCount;
    buffer[3] = 0;

    let ptr = SERIALIZED_HEADER_SIZE;
    for (const item of validCoords) {
      buffer[ptr++] = item.x >= 0 ? item.x : item.x >>> 0;
      buffer[ptr++] = item.y;
      buffer[ptr++] = item.packed;
    }

    return buffer;
  }

  public static deserializeFromBuffer(
    buffer: ArrayBuffer,
    chunks: Map<number, Int32Array>,
    modifiedCoords: Set<string>,
    getChunkInfo: (x: number) => { chunkX: number; localX: number },
    getChunk: (chunkX: number) => Int32Array
  ): void {
    if (!buffer || buffer.byteLength === 0) return;
    if (buffer.byteLength % Uint32Array.BYTES_PER_ELEMENT !== 0) return;

    const data32 = new Uint32Array(buffer);
    if (data32.length < SERIALIZED_HEADER_SIZE) return;

    const version = data32[0];
    const savedMapWidth = data32[1];
    const dataCount = data32[2];
    const restoredChunks = new Set<number>();

    let ptr = SERIALIZED_HEADER_SIZE;
    if (version === 2) {
      const recordCount = getBoundedRecordCount(dataCount, data32.length, 3);
      for (let i = 0; i < recordCount; i++) {
        if (ptr + 2 >= data32.length) break;
        const x = data32[ptr++] | 0; // signed int32
        const y = data32[ptr++];
        const packed = data32[ptr++];
        if (!isValidTileCoord(x, y)) continue;

        const { chunkX, localX } = getChunkInfo(x);
        if (!canRestoreChunk(chunkX, restoredChunks)) continue;

        const chunk = getChunk(chunkX);
        const idx = y * CHUNK_WIDTH + localX;
        if (idx < 0 || idx >= chunk.length) continue;

        chunk[idx] = packed;
        modifiedCoords.add(`${x},${y}`);
      }
    } else if (version <= 1) {
      if (!Number.isInteger(savedMapWidth) || savedMapWidth <= 0) return;

      const savedHalfWidth = Math.floor(savedMapWidth / 2);
      const recordCount = getBoundedRecordCount(dataCount, data32.length, 2);
      for (let i = 0; i < recordCount; i++) {
        if (ptr + 1 >= data32.length) break;
        const savedIndex = data32[ptr++];
        const packed = data32[ptr++];

        const x = (savedIndex % savedMapWidth) - savedHalfWidth;
        const y = Math.floor(savedIndex / savedMapWidth);
        if (!isValidTileCoord(x, y)) continue;

        const { chunkX, localX } = getChunkInfo(x);
        if (!canRestoreChunk(chunkX, restoredChunks)) continue;

        const chunk = getChunk(chunkX);
        const idx = y * CHUNK_WIDTH + localX;
        if (idx < 0 || idx >= chunk.length) continue;

        chunk[idx] = packed;
        modifiedCoords.add(`${x},${y}`);
      }
    }
  }

  public static deserializeObject(
    data: any,
    chunks: Map<number, Int32Array>,
    modifiedCoords: Set<string>,
    getChunkInfo: (x: number) => { chunkX: number; localX: number },
    getChunk: (chunkX: number) => Int32Array
  ): void {
    if (!data || typeof data !== 'object') return;

    const restoredChunks = new Set<number>();
    let restoredRecords = 0;
    for (const [key, tileData] of Object.entries(data as Record<string, unknown>)) {
      if (restoredRecords >= MAX_SERIALIZED_TILE_RECORDS) break;
      if (!Array.isArray(tileData) || tileData.length < 2) continue;

      const [x, y] = key.split(',').map(Number);
      if (!isValidTileCoord(x, y)) continue;

      const { chunkX, localX } = getChunkInfo(x);
      if (!canRestoreChunk(chunkX, restoredChunks)) continue;

      const chunk = getChunk(chunkX);
      const idx = y * CHUNK_WIDTH + localX;
      if (idx < 0 || idx >= chunk.length) continue;

      const [typeId, health] = tileData;
      if (
        typeof typeId !== 'number' ||
        typeof health !== 'number' ||
        !Number.isFinite(typeId) ||
        !Number.isFinite(health)
      ) {
        continue;
      }

      const packed =
        (Math.trunc(typeId) & TYPE_MASK) |
        ((Math.trunc(health) & HP_MASK) << HP_BITS) |
        GEN_FLAG |
        MOD_FLAG;
      chunk[idx] = packed;
      modifiedCoords.add(`${x},${y}`);
      restoredRecords++;
    }
  }
}
