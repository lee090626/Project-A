import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE, BASE_DEPTH } from '@/shared/config/constants';
import { showToast } from '../toastSystem';

const WAYPOINT_INTERVAL = 100;

/**
 * 현재 최대 깊이를 기준으로 해금되어야 할 웨이포인트를 동기화합니다.
 *
 * @param world 게임 월드
 */
const syncUnlockedWaypoints = (world: GameWorld, showUnlockToast: boolean = false) => {
  const { stats } = world.player;
  if (!Array.isArray(stats.unlockedWaypoints)) {
    stats.unlockedWaypoints = [0];
  }

  const maxUnlockDepth = Math.floor(stats.maxDepthReached / WAYPOINT_INTERVAL) * WAYPOINT_INTERVAL;
  for (let depth = WAYPOINT_INTERVAL; depth <= maxUnlockDepth; depth += WAYPOINT_INTERVAL) {
    if (stats.unlockedWaypoints.includes(depth)) continue;
    stats.unlockedWaypoints.push(depth);
    if (showUnlockToast) {
      showToast(`Waypoint ${depth}m unlocked`, 'success', 2200);
    }
  }

  stats.unlockedWaypoints.sort((a, b) => a - b);
};

/**
 * 플레이어의 이동 메카닉, 시각적 보간 및 펫 드론 추적을 관리합니다.
 */
export const playerDynamics = (
  world: GameWorld,
  now: number,
  movementDelay: number,
  lerpFactor: number
) => {
  const { player, intent, tileMap } = world;

  // 1. 논리적 위치 업데이트 (그리드 이동)
  if (now - world.timestamp.lastMove >= movementDelay) {
    processGridMovement(world, now);
  }

  // 2. 통계 업데이트 (깊이 기록)
  player.stats.depth = Math.floor(player.pos.y) - BASE_DEPTH;
  if (player.stats.depth > player.stats.maxDepthReached) {
    player.stats.maxDepthReached = player.stats.depth;
    syncUnlockedWaypoints(world, true);
  }

  // 3. 시각적 위치 보간 (Renderer를 위한 Lerp)
  player.visualPos.x += (player.pos.x - player.visualPos.x) * lerpFactor;
  player.visualPos.y += (player.pos.y - player.visualPos.y) * lerpFactor;
};

/**
 * 플레이어의 입력을 그리드 좌표로 변환하고 충돌을 검사합니다.
 */
function processGridMovement(world: GameWorld, now: number) {
  const { player, intent, tileMap } = world;
  let moved = false;
  let drilling = false;

  if (intent.moveX !== 0 || intent.moveY !== 0) {
    // 주 입력 방향 결정 (상태 이상 등에 의한 반전은 상위에서 처리됨)
    let dx = 0;
    let dy = 0;

    if (intent.moveX !== 0) {
      dx = intent.moveX > 0 ? 1 : -1;
    } else if (intent.moveY !== 0) {
      dy = intent.moveY > 0 ? 1 : -1;
    }

    // [상태 이상: 혼란] 방향 반전
    if (player.stats.activeEffects?.some((e) => e.type === 'CONFUSION')) {
      dx *= -1;
      dy *= -1;
    }

    if (dx !== 0 || dy !== 0) {
      const targetX = Math.round(player.pos.x + dx);
      const targetY = Math.round(player.pos.y + dy);

      // --- 몬스터 충돌 체크 (SpatialHash) ---
      const monsterAtTarget = world.spatialHash.query(
        targetX * TILE_SIZE + TILE_SIZE / 2,
        targetY * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE * 0.5,
      ).find((idx) => {
        const type = world.entities.soa.type[idx];
        if (type !== 1 && type !== 2 || world.entities.soa.hp[idx] <= 0) return false;
        
        const ex = world.entities.soa.x[idx];
        const ey = world.entities.soa.y[idx];
        const ew = world.entities.soa.width[idx] || TILE_SIZE;
        const eh = world.entities.soa.height[idx] || TILE_SIZE;
        const px = targetX * TILE_SIZE;
        const py = targetY * TILE_SIZE;

        return px < ex + ew && px + TILE_SIZE > ex && py < ey + eh && py + TILE_SIZE > ey;
      });

      const tile = tileMap.getTile(targetX, targetY);

      if (monsterAtTarget !== undefined) {
        drilling = true;
        intent.miningTarget = { x: targetX, y: targetY };
      } else if (tile && (tile.type === 'empty' || tile.type === 'portal')) {
        player.pos.x = targetX;
        player.pos.y = targetY;
        moved = true;
      } else if (tile && tile.type !== 'wall') {
        drilling = true;
        intent.miningTarget = { x: targetX, y: targetY };
      }
    }
  }

  // 상태 확정
  if (moved) {
    world.timestamp.lastMove = now;
    player.isDrilling = false;
  } else if (drilling) {
    player.isDrilling = true;
  } else {
    player.isDrilling = false;
  }
}
