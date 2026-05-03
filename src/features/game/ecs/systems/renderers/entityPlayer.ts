import * as PIXI from 'pixi.js';
import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { TextureRegistry } from '@/shared/types/engine';
import {
  PLAYER_IDLE_TEXTURE_KEY,
  PlayerAnimationDirection,
  resolvePlayerAnimationFrame,
  resolvePlayerWalkDirection,
  shouldMirrorPlayerWalkFrame,
} from './playerAnimation';
import { updateStatusVFX } from './uiComponents';

/**
 * 플레이어 전용 렌더링을 처리합니다.
 * 플레이어 스프라이트는 이동 중 프레임 애니메이션을 사용하고, 절차적 바디 변형은 적용하지 않습니다.
 * 
 * @param world - 게임 월드 객체 (플레이어 상태, 인텐트, 월드 상태 포함)
 * @param entity - 플레이어 엔티티 객체 (위치, 상태, 시각적 위치 등)
 * @param container - PIXI 컨테이너 (스프라이트, 애니메이션, 효과를 포함)
 * @param now - 현재 시간 (상태 효과 VFX 갱신용, 밀리초)
 * @param textures - 아틀라스 텍스처 레지스트리
 * 
 * @description
 * 이 함수는 플레이어 캐릭터의 시각적 표현을 업데이트합니다. 다음을 처리합니다:
 * 1. 월드 좌표 기반 위치 동기화
 * 2. 이동 프레임 애니메이션
 * 3. 방향 전환 (좌우 반전)
 * 4. 상태 효과 시각적 효과
 * 
 * @example
 * // 게임 루프에서 호출 예시
 * updatePlayerRenderer(world, playerEntity, playerContainer, performance.now(), textures);
 */
export function updatePlayerRenderer(
  world: GameWorld,
  entity: any,
  container: PIXI.Container,
  now: number,
  textures: TextureRegistry,
) {
  const body = container.getChildByLabel('body') as PIXI.Sprite;
  if (!body) return;

  // 1. 위치 동기화
  container.x = entity.visualPos.x * TILE_SIZE;
  container.y = entity.visualPos.y * TILE_SIZE;

  if (body.anchor.y !== 1) {
    body.anchor.set(0.5, 1);
  }

  const pContainer = container as any;

  const nextWalkDirection = resolvePlayerWalkDirection(world.intent.moveX, world.intent.moveY);
  if (nextWalkDirection) {
    pContainer.walkDirection = nextWalkDirection;
  } else if (!pContainer.walkDirection) {
    pContainer.walkDirection = 'Down';
  }

  const isInterpolating = Math.abs(entity.pos.x - entity.visualPos.x) > 0.01 ||
    Math.abs(entity.pos.y - entity.visualPos.y) > 0.01;
  const hasMoveInput = nextWalkDirection !== null;
  const isWalking = !entity.isDrilling && (hasMoveInput || isInterpolating);
  const walkDirection = pContainer.walkDirection as PlayerAnimationDirection;
  if (
    isWalking &&
    (typeof pContainer.walkAnimationStartTime !== 'number' ||
      pContainer.walkAnimationDirection !== walkDirection)
  ) {
    pContainer.walkAnimationStartTime = now;
    pContainer.walkAnimationDirection = walkDirection;
  } else if (!isWalking) {
    pContainer.walkAnimationStartTime = null;
    pContainer.walkAnimationDirection = null;
  }

  const walkElapsed = isWalking ? now - pContainer.walkAnimationStartTime : 0;
  const textureKey = resolvePlayerAnimationFrame({
    state: isWalking ? 'walk' : 'idle',
    direction: walkDirection,
    elapsedMs: walkElapsed,
  });
  const nextTexture = textures[textureKey] || textures[PLAYER_IDLE_TEXTURE_KEY];
  if (nextTexture && body.texture !== nextTexture) {
    body.texture = nextTexture;
  }

  const baseScaleX = TILE_SIZE / (body.texture.width || TILE_SIZE);
  const baseScaleY = TILE_SIZE / (body.texture.height || TILE_SIZE);

  body.alpha = 1.0;
  body.rotation = 0;
  body.position.set(TILE_SIZE / 2, TILE_SIZE);
  const animationScaleX = shouldMirrorPlayerWalkFrame(walkDirection) ? -1 : 1;
  body.scale.set(baseScaleX * (isWalking ? animationScaleX : 1), baseScaleY);

  updateStatusVFX(container, entity.stats.activeEffects || [], TILE_SIZE, TILE_SIZE, now);
}
