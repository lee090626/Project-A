export const GAME_SFX_IDS = [
  'mine_hit',
  'tile_break',
  'item_pickup',
  'enemy_hit',
  'player_hit',
  'boss_defeat',
  'ui_click',
] as const;

export type GameSfxId = (typeof GAME_SFX_IDS)[number];

/**
 * 워커에서 메인 스레드로 요청하는 단발 효과음 재생 페이로드입니다.
 */
export interface PlaySfxPayload {
  /** 재생할 효과음 ID */
  id: GameSfxId;
  /** 1을 기준으로 하는 효과음 강도 배율 */
  intensity?: number;
}

/**
 * 워커와 메인 스레드 사이에서 전달되는 효과음 ID가 지원 범위 안에 있는지 확인합니다.
 *
 * @param value - 검사할 값
 * @returns 지원하는 효과음 ID이면 true
 */
export function isGameSfxId(value: unknown): value is GameSfxId {
  return typeof value === 'string' && (GAME_SFX_IDS as readonly string[]).includes(value);
}
