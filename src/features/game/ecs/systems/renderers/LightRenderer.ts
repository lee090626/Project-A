import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { ID_TO_TILE_TYPE } from '@/shared/types/game';

// ============================================================
// LightRenderer
// ============================================================

/**
 * [렌더러] 조명 마스크 및 셰이더 파라미터 제어를 전담하는 서브 렌더러입니다.
 *
 * 주요 책임:
 * - 플레이어 위치 기반 광원(flickering) 생성
 * - 드롭 아이템(goldstone/luststone) 주변 소형 광원 추가
 * - 깊이(depth)에 따른 어둠 강도 계산
 * - lightingFilter에 최종 파라미터 전달
 *
 * 호출 주체: `renderSystem.ts` 오케스트레이터
 *
 * @param world - 현재 게임 월드 상태
 * @param stage - 씬 루트 컨테이너 (scale 참조용)
 * @param screenWidth - 현재 캔버스 너비
 * @param screenHeight - 현재 캔버스 높이
 * @param now - 현재 타임스탬프 (ms, flickering 계산용)
 * @param lightingFilter - PixiJS 커스텀 조명 필터 인스턴스 (null이면 스킵)
 */
export function renderLighting(
  world: GameWorld,
  stage: { scale: { x: number } },
  screenWidth: number,
  screenHeight: number,
  now: number,
  lightingFilter: any | null,
): void {
  if (!lightingFilter) return;

  const { player } = world;

  /**
   * 광원 배열 포맷: [x, y, radius, intensity, ...]
   * 최대 16개 광원까지 지원합니다 (셰이더 유니폼 제한).
   */
  const lights: number[] = [];

  // ─── 1. 플레이어 광원 (flickering 효과 포함) ─────────────────
  const flicker = Math.sin(now / 150) * 3;
  lights.push(
    player.visualPos.x * TILE_SIZE + TILE_SIZE / 2,
    player.visualPos.y * TILE_SIZE + TILE_SIZE / 2,
    TILE_SIZE * 5.5 + flicker,
    1.0,
  );

  // ─── 2. 빛나는 드롭 아이템 광원 ─────────────────────────────
  const GLOWING_TILE_TYPES = new Set(['goldstone', 'luststone']);
  const dp = world.droppedItemPool;

  for (let i = 0; i < dp.capacity; i++) {
    if (!dp.active[i]) continue;
    if (lights.length >= 64) break; // 셰이더 유니폼 한도 64 (4 floats × 16개)

    const type = ID_TO_TILE_TYPE[dp.typeId[i]];
    if (GLOWING_TILE_TYPES.has(type)) {
      lights.push(dp.x[i], dp.y[i], TILE_SIZE * 2, 0.5);
    }
  }

  // ─── 3. 깊이 기반 어둠 강도 계산 ────────────────────────────
  // depth 0 → 어둠 0.45, depth 800 이상 → 최대 어둠 0.95
  const depthFactor = Math.min(1.0, player.stats.depth / 800);
  const darkness    = 0.45 + depthFactor * 0.5;

  // ─── 4. 셰이더 유니폼 갱신 ─────────────────────────────────
  lightingFilter.updateUniforms(
    darkness,
    stage.scale.x,
    player.visualPos.x * TILE_SIZE + TILE_SIZE / 2,
    player.visualPos.y * TILE_SIZE + TILE_SIZE / 2,
    screenWidth,
    screenHeight,
    lights,
  );
}
