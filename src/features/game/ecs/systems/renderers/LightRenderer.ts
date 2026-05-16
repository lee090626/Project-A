import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';

// ============================================================
// LightRenderer
// ============================================================

/**
 * [렌더러] 조명 마스크 및 셰이더 파라미터 제어를 전담하는 서브 렌더러입니다.
 *
 * 주요 책임:
 * - 화면 암전 효과를 비활성화한 상태로 조명 필터 파라미터 유지
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
  _now: number,
  lightingFilter: any | null,
): void {
  if (!lightingFilter) return;

  const { player } = world;

  // ─── 1. 셰이더 유니폼 갱신 ─────────────────────────────────
  lightingFilter.updateUniforms(
    0,
    stage.scale.x,
    player.visualPos.x * TILE_SIZE + TILE_SIZE / 2,
    player.visualPos.y * TILE_SIZE + TILE_SIZE / 2,
    screenWidth,
    screenHeight,
    [],
  );
}
