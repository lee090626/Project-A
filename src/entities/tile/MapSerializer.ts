import {
  CHUNK_WIDTH,
  TYPE_MASK,
  HP_BITS,
  HP_MASK,
  GEN_FLAG,
  MOD_FLAG,
} from './TileMapConstants';

export class MapSerializer {
  private static addModifiedIndex(
    modifiedTileIndicesByChunk: Map<number, Set<number>>,
    chunkX: number,
    idx: number,
  ): void {
    let set = modifiedTileIndicesByChunk.get(chunkX);
    if (!set) {
      set = new Set<number>();
      modifiedTileIndicesByChunk.set(chunkX, set);
    }
    set.add(idx);
  }

  public static serializeToBuffer(
    modifiedTileIndicesByChunk: Map<number, Set<number>>,
    chunks: Map<number, Int32Array>,
  ): Uint32Array {
    let modCount = 0;
    const validCoords: { x: number; y: number; packed: number }[] = [];

    for (const [chunkX, indices] of modifiedTileIndicesByChunk) {
      const chunk = chunks.get(chunkX);
      if (!chunk) continue;

      for (const idx of indices) {
        const packed = chunk[idx];
        if (!(packed & MOD_FLAG)) continue;

        const y = Math.floor(idx / CHUNK_WIDTH);
        const localX = idx - y * CHUNK_WIDTH;
        const x = chunkX * CHUNK_WIDTH + localX;

        validCoords.push({ x, y, packed });
        modCount++;
      }
    }

    const HEADER_SIZE = 4;
    const buffer = new Uint32Array(HEADER_SIZE + modCount * 3);

    buffer[0] = 2; // Version 2
    buffer[1] = 0; // MAP_WIDTH (Legacy)
    buffer[2] = modCount;
    buffer[3] = 0;

    let ptr = HEADER_SIZE;
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
    modifiedTileIndicesByChunk: Map<number, Set<number>>,
    getChunk: (chunkX: number) => Int32Array
  ): void {
    if (!buffer || buffer.byteLength === 0) return;

    const data32 = new Uint32Array(buffer);
    const HEADER_SIZE = 4;
    if (data32.length < HEADER_SIZE) return;

    const version = data32[0];
    const savedMapWidth = data32[1];
    const dataCount = data32[2];

    let ptr = HEADER_SIZE;
    if (version >= 2) {
      for (let i = 0; i < dataCount; i++) {
        if (ptr + 2 >= data32.length) break;
        const x = data32[ptr++] | 0; // signed int32
        const y = data32[ptr++];
        const packed = data32[ptr++];

        const chunkX = Math.floor(x / CHUNK_WIDTH);
        const localX = x - chunkX * CHUNK_WIDTH;
        const chunk = getChunk(chunkX);
        const idx = y * CHUNK_WIDTH + localX;
        chunk[idx] = packed;
        this.addModifiedIndex(modifiedTileIndicesByChunk, chunkX, idx);
      }
    } else {
      const savedHalfWidth = Math.floor(savedMapWidth / 2);
      for (let i = 0; i < dataCount; i++) {
        if (ptr + 1 >= data32.length) break;
        const savedIndex = data32[ptr++];
        const packed = data32[ptr++];

        const x = (savedIndex % savedMapWidth) - savedHalfWidth;
        const y = Math.floor(savedIndex / savedMapWidth);

        const chunkX = Math.floor(x / CHUNK_WIDTH);
        const localX = x - chunkX * CHUNK_WIDTH;
        const chunk = getChunk(chunkX);
        const idx = y * CHUNK_WIDTH + localX;
        chunk[idx] = packed;
        this.addModifiedIndex(modifiedTileIndicesByChunk, chunkX, idx);
      }
    }
  }

  public static deserializeObject(
    data: any,
    chunks: Map<number, Int32Array>,
    modifiedTileIndicesByChunk: Map<number, Set<number>>,
    getChunk: (chunkX: number) => Int32Array
  ): void {
    if (!data) return;

    for (const [key, tileData] of Object.entries(data as Record<string, [number, number]>)) {
      const [x, y] = key.split(',').map(Number);
      const chunkX = Math.floor(x / CHUNK_WIDTH);
      const localX = x - chunkX * CHUNK_WIDTH;
      const chunk = getChunk(chunkX);
      const idx = y * CHUNK_WIDTH + localX;

      const [typeId, health] = tileData;
      const packed = (typeId & TYPE_MASK) | ((health & HP_MASK) << HP_BITS) | GEN_FLAG | MOD_FLAG;
      chunk[idx] = packed;
      this.addModifiedIndex(modifiedTileIndicesByChunk, chunkX, idx);
    }
  }
}
