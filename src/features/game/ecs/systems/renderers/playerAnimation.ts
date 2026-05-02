/**
 * 플레이어 렌더링 애니메이션 상태입니다.
 */
export type PlayerAnimationState = 'idle' | 'walk';

/**
 * 플레이어 걷기 애니메이션 방향입니다.
 */
export type PlayerAnimationDirection = 'Down' | 'Up' | 'Right' | 'Left';

/**
 * 플레이어 애니메이션 클립 정의입니다.
 */
export interface PlayerAnimationClip {
  readonly state: PlayerAnimationState;
  readonly direction: PlayerAnimationDirection;
  readonly frames: readonly string[];
  readonly frameDurationMs: number;
  readonly loop: boolean;
}

/**
 * 플레이어 애니메이션 프레임 선택 요청입니다.
 */
export interface PlayerAnimationFrameRequest {
  readonly state: PlayerAnimationState;
  readonly direction: PlayerAnimationDirection;
  readonly elapsedMs: number;
}

export const PLAYER_IDLE_TEXTURE_KEY = 'player';

const WALK_FRAME_DURATION_MS = 40;

type PlayerWalkClipDirection = Exclude<PlayerAnimationDirection, 'Right'>;

const PLAYER_WALK_CLIPS: Record<PlayerWalkClipDirection, PlayerAnimationClip> = {
  Down: {
    state: 'walk',
    direction: 'Down',
    frameDurationMs: WALK_FRAME_DURATION_MS,
    loop: true,
    frames: [
      'PlayerWalkDown01',
      'PlayerWalkDown02',
      'PlayerWalkDown03',
      'PlayerWalkDown04',
      'PlayerWalkDown05',
      'PlayerWalkDown06',
    ],
  },
  Up: {
    state: 'walk',
    direction: 'Up',
    frameDurationMs: WALK_FRAME_DURATION_MS,
    loop: true,
    frames: [
      'PlayerWalkUp01',
      'PlayerWalkUp02',
      'PlayerWalkUp03',
      'PlayerWalkUp04',
      'PlayerWalkUp05',
      'PlayerWalkUp06',
    ],
  },
  Left: {
    state: 'walk',
    direction: 'Left',
    frameDurationMs: WALK_FRAME_DURATION_MS,
    loop: true,
    frames: [
      'PlayerWalkLeft01',
      'PlayerWalkLeft02',
      'PlayerWalkLeft03',
      'PlayerWalkLeft04',
      'PlayerWalkLeft05',
      'PlayerWalkLeft06',
    ],
  },
};

/**
 * 현재 이동 입력을 플레이어 걷기 애니메이션 방향으로 변환합니다.
 *
 * @param moveX - 좌우 이동 입력값
 * @param moveY - 상하 이동 입력값
 * @returns 이동 입력이 있으면 방향, 없으면 null
 */
export function resolvePlayerWalkDirection(
  moveX: number,
  moveY: number,
): PlayerAnimationDirection | null {
  if (moveX > 0) return 'Right';
  if (moveX < 0) return 'Left';
  if (moveY > 0) return 'Down';
  if (moveY < 0) return 'Up';
  return null;
}

/**
 * 현재 걷기 방향에서 스프라이트 좌우 반전이 필요한지 반환합니다.
 *
 * @param direction - 플레이어 걷기 애니메이션 방향
 * @returns 왼쪽 프레임을 오른쪽 이동에 재사용해야 하면 true
 */
export function shouldMirrorPlayerWalkFrame(direction: PlayerAnimationDirection): boolean {
  return direction === 'Right';
}

/**
 * 애니메이션 상태와 진행 시간에 맞는 텍스처 키를 반환합니다.
 *
 * @param request - 애니메이션 상태, 방향, 경과 시간
 * @returns 현재 프레임에 대응하는 아틀라스 텍스처 키
 */
export function resolvePlayerAnimationFrame(request: PlayerAnimationFrameRequest): string {
  if (request.state === 'idle') {
    return PLAYER_IDLE_TEXTURE_KEY;
  }

  const clipDirection: PlayerWalkClipDirection = request.direction === 'Right'
    ? 'Left'
    : request.direction;
  const clip = PLAYER_WALK_CLIPS[clipDirection];
  const rawFrameIndex = Math.floor(request.elapsedMs / clip.frameDurationMs);
  const frameIndex = clip.loop
    ? rawFrameIndex % clip.frames.length
    : Math.min(rawFrameIndex, clip.frames.length - 1);

  return clip.frames[frameIndex];
}
