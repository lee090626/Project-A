import { BOSS_SPAWN_X } from './circleData';
import { BASE_DEPTH } from './constants';
import type { Position } from '@/shared/types/game';

const BASE_CAMP_Y_OFFSET_FROM_DEPTH = -2;

export const PLAYER_START_POSITION: Readonly<Position> = {
  x: BOSS_SPAWN_X,
  y: BASE_DEPTH + BASE_CAMP_Y_OFFSET_FROM_DEPTH,
};

/**
 * Returns a fresh mutable base-camp position for player state.
 */
export function createPlayerStartPosition(): Position {
  return { ...PLAYER_START_POSITION };
}

/**
 * Converts gameplay depth to world tile Y.
 */
export function getWorldYForDepth(depth: number): number {
  return BASE_DEPTH + depth;
}

/**
 * Returns the world tile position used by waypoint teleport.
 */
export function createWaypointPosition(depth: number): Position {
  return {
    x: PLAYER_START_POSITION.x,
    y: getWorldYForDepth(depth),
  };
}
