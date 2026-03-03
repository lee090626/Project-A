import { Tile, TileType } from '../types/game';

export const MAP_WIDTH = 31;
export const MAP_HEIGHT = 1000;
export const TILE_SIZE = 40;

export class TileMap {
  grid: Tile[][];

  constructor() {
    this.grid = this.generateMap();
  }

  generateMap(): Tile[][] {
    const grid: Tile[][] = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < MAP_WIDTH; x++) {
        row.push(this.generateTile(x, y));
      }
      grid.push(row);
    }
    return grid;
  }

  generateTile(x: number, y: number): Tile {
    // Top layers are air/surface (matching BASE_DEPTH in GameEngine)
    if (y < 10) {
      return { type: 'empty', health: 0, maxHealth: 0, value: 0 };
    }

    // Map boundaries (0 and MAP_WIDTH-1) are enforced in GameEngine.tsx getTile()
    // No physical walls are generated here to keep the map feeling open.

    // Procedural generation based on depth
    const rand = Math.random();
    const stats = getTileStats('dirt');
    let type: TileType = 'dirt';
    let health = stats.health;
    let value = stats.value;

    if (y < 20) {
      if (rand < 0.05) {
        type = 'coal';
        const s = getTileStats('coal');
        health = s.health;
        value = s.value;
      }
    } else if (y < 50) {
      if (rand < 0.1) {
        type = 'stone';
        const s = getTileStats('stone');
        health = s.health;
        value = s.value;
      } else if (rand < 0.15) {
        type = 'coal';
        const s = getTileStats('coal');
        health = s.health;
        value = s.value;
      } else if (rand < 0.17) {
        type = 'iron';
        const s = getTileStats('iron');
        health = s.health;
        value = s.value;
      }
    } else {
      // 50+ Depth
      if (rand < 0.2) {
        type = 'stone';
        const s = getTileStats('stone');
        health = s.health;
        value = s.value;
      } else if (rand < 0.25) {
        type = 'iron';
        const s = getTileStats('iron');
        health = s.health;
        value = s.value;
      } else if (rand < 0.27) {
        type = 'gold';
        const s = getTileStats('gold');
        health = s.health;
        value = s.value;
      } else if (rand < 0.29 && y > 50) {
        type = 'diamond';
        const s = getTileStats('diamond');
        health = s.health;
        value = s.value;
      } else if (rand < 0.31 && y > 100) {
        type = 'emerald';
        const s = getTileStats('emerald');
        health = s.health;
        value = s.value;
      } else if (rand < 0.33 && y > 150) {
        type = 'ruby';
        const s = getTileStats('ruby');
        health = s.health;
        value = s.value;
      } else if (rand < 0.345 && y > 200) {
        type = 'sapphire';
        const s = getTileStats('sapphire');
        health = s.health;
        value = s.value;
      } else if (rand < 0.355 && y > 300) {
        type = 'uranium';
        const s = getTileStats('uranium');
        health = s.health;
        value = s.value;
      } else if (rand < 0.36 && y > 500) {
        type = 'obsidian';
        const s = getTileStats('obsidian');
        health = s.health;
        value = s.value;
      }

      // --- RPG Dungeon Overrides Removed ---
      // (Used to have walls here, now open as per user request)
      if (y === 1000 && x === Math.floor(MAP_WIDTH / 2)) {
        type = 'boss_core';
        health = 10000;
      } else if (
        y === 1000 &&
        (x === Math.floor(MAP_WIDTH / 2) - 1 ||
          x === Math.floor(MAP_WIDTH / 2) + 1)
      ) {
        type = 'monster_nest';
        health = 200;
      }
    }

    return { type, health, maxHealth: health, value };
  }

  getTile(x: number, y: number): Tile | null {
    if (y < 0 || y >= MAP_HEIGHT || x < 0 || x >= MAP_WIDTH) return null;
    return this.grid[y][x];
  }

  damageTile(x: number, y: number, amount: number): boolean {
    const tile = this.getTile(x, y);
    if (!tile || tile.type === 'empty' || tile.type === 'wall') return false;

    tile.health -= amount;
    if (tile.health <= 0) {
      tile.type = 'empty';
      tile.health = 0;
      return true; // Tile destroyed
    }
    return false; // Tile damaged but not destroyed
  }

  // --- Persistence Logic ---

  // Compact format: [typeIndex, health] per tile, flattened or row-by-row
  // Optimization: 30x1000 = 30,000 tiles.
  // JSON of 30k arrays [1, 100] is roughly 300KB. Acceptable for LocalStorage.

  serialize(): number[][][] {
    const data: number[][][] = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
      const row: number[][] = [];
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = this.grid[y][x];
        const typeIdx = TILE_TYPE_TO_ID[tile.type] ?? 0;
        row.push([typeIdx, tile.health]);
      }
      data.push(row);
    }
    return data;
  }

  deserialize(data: number[][][]): void {
    if (!data || data.length !== MAP_HEIGHT || data[0].length !== MAP_WIDTH) {
      console.error('Invalid save data dimensions');
      // Fallback to regen if invalid? For now, just keep current or regen.
      // this.grid = this.generateMap();
      return;
    }

    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const row = data[y];
        if (!row || !row[x]) continue;

        const [typeIdx, health] = row[x];
        let type = ID_TO_TILE_TYPE[typeIdx] || 'dirt';

        // SCRUB BEDROCK: Convert any existing walls/bricks to dirt
        if (type === 'wall' || type === 'dungeon_bricks') {
          type = 'dirt';
        }

        const stats = getTileStats(type);
        const syncedHealth = Math.min(health, stats.health);

        this.grid[y][x] = {
          type,
          health: syncedHealth,
          maxHealth: stats.health,
          value: stats.value,
        };
      }
    }
  }

  // --- Regeneration System ---
  regenerateAllResources(playerX: number, playerY: number): void {
    const SAFE_RADIUS = 5; // Do not regen within 5 tiles of player

    // Iterate map - optimization: skip top surface layers
    for (let y = 10; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = this.grid[y][x];

        // Only regenerate empty tiles
        if (tile.type !== 'empty') continue;

        // Check safety radius
        const dx = x - playerX;
        const dy = y - playerY;
        if (dx * dx + dy * dy < SAFE_RADIUS * SAFE_RADIUS) continue;

        // Global Regen Chance: For global regen, we don't need a low chance.
        // We fill MOST empty spots, or maybe a good chunk of them?
        // User said "Resource generation probability increase" in previous prompt (Step 1215),
        // but then switched to "Global regen every 30 mins".
        // If we run this every 60 mins, we should probably fill empty tiles with the standard generation logic.
        // Let's use the same logic as generateTile but applied to empty spots.

        // Re-rolling random for type using standard generation logic
        // We can reuse the logic from generateTile but we need to ensure we don't overwrite existing walls/etc (already checked type !== 'empty')

        // Let's simplify and just use a prob check to see if we should fill this empty spot.
        // If we fill 100% of empty spots, the map becomes solid again (except safe zone).
        // Maybe we want to fill ~50% of empty spots? Or use the original density?
        // Original generation has logic like "if rand < 0.05 then coal". This means 95% dirt?
        // Wait, generateTile returns 'dirt' by default in the procedural part if no ore is selected.
        // So standard map is FULL of dirt/stone/ores.
        // So if we run this, we should probably make the tile 'dirt' or 'stone' or 'ore'.
        // Effectively "resetting" the tile to a pristine state.

        const rand = Math.random();
        let newType: TileType = 'dirt';

        // Depth based generation logic (Simplified from generateTile for regeneration)
        if (y < 20) {
          if (rand < 0.1)
            newType = 'coal'; // Increased rate as per previous plan?
          else newType = 'dirt';
        } else if (y < 50) {
          if (rand < 0.1) newType = 'stone';
          else if (rand < 0.2) newType = 'coal';
          else if (rand < 0.25) newType = 'iron';
          else newType = 'dirt';
        } else {
          // Deep layers
          if (rand < 0.2) newType = 'stone';
          else if (rand < 0.3) newType = 'iron';
          else if (rand < 0.35) newType = 'gold';
          else if (rand < 0.39)
            newType = 'diamond'; // 4%
          else if (rand < 0.43 && y > 100) newType = 'emerald';
          else if (rand < 0.46 && y > 150) newType = 'ruby';
          else if (rand < 0.49 && y > 200) newType = 'sapphire';
          else if (rand < 0.51 && y > 300) newType = 'uranium';
          else if (rand < 0.52 && y > 500) newType = 'obsidian';
          else newType = 'dirt';
        }

        const stats = getTileStats(newType);

        this.grid[y][x] = {
          type: newType,
          health: stats.health,
          maxHealth: stats.health,
          value: stats.value,
        };
      }
    }
  }
}

// Stats helper
function getTileStats(type: TileType): { health: number; value: number } {
  switch (type) {
    case 'dirt':
      return { health: 10, value: 1 };
    case 'coal':
      return { health: 60, value: 10 };
    case 'stone':
      return { health: 120, value: 0 };
    case 'iron':
      return { health: 300, value: 50 };
    case 'gold':
      return { health: 800, value: 200 };
    case 'diamond':
      return { health: 2000, value: 1000 };
    case 'emerald':
      return { health: 4000, value: 500 };
    case 'ruby':
      return { health: 6000, value: 800 };
    case 'sapphire':
      return { health: 10000, value: 1200 };
    case 'uranium':
      return { health: 18000, value: 2000 };
    case 'obsidian':
      return { health: 30000, value: 5000 };
    case 'lava':
      return { health: Infinity, value: 0 };
    case 'wall':
    case 'dungeon_bricks':
      return { health: 1000, value: 0 };
    case 'boss_core':
      return { health: 10000, value: 0 };
    case 'monster_nest':
      return { health: 200, value: 0 };
    case 'empty':
      return { health: 0, value: 0 };
    default:
      return { health: 10, value: 1 };
  }
}

// Mapping
const TILE_TYPE_TO_ID: Record<TileType, number> = {
  empty: 0,
  dirt: 1,
  stone: 2,
  coal: 3,
  iron: 4,
  gold: 5,
  diamond: 6,
  emerald: 7,
  ruby: 8,
  sapphire: 9,
  uranium: 10,
  obsidian: 11,
  lava: 12,
  dungeon_bricks: 13,
  boss_core: 14,
  monster_nest: 15,
  wall: 16,
};

const ID_TO_TILE_TYPE: Record<number, TileType> = Object.entries(
  TILE_TYPE_TO_ID,
).reduce(
  (acc, [key, value]) => {
    acc[value] = key as TileType;
    return acc;
  },
  {} as Record<number, TileType>,
);
