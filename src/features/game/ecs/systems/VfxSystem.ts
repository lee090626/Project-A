import { GameWorld } from '@/entities/world/model';
import { messageBus } from '@/shared/lib/MessageBus';
import { createFloatingText, createParticles } from '@/shared/lib/effectUtils';
import { getTileColor } from '@/shared/lib/tileUtils';
import { TILE_SIZE } from '@/shared/config/constants';
import { TileType } from '@/shared/types/game/core';

/**
 * 게임 내 시각 효과(VFX)를 전담하는 시스템입니다.
 * 핵심 로직 시스템으로부터 이벤트를 수신하여 화면 흔들림, 파편, 부동 텍스트 등을 생성합니다.
 */
export const vfxSystem = {
  /**
   * 이벤트 핸들러들을 등록합니다. 엔진 초기화 시점에 호출되어야 합니다.
   */
  init: (world: GameWorld) => {
    // 1. 타일 타격 관련 시각 효과
    messageBus.on('game:tile_hit', (payload: { 
      x: number, 
      y: number, 
      damage: number, 
      isCrit: boolean, 
      destroyed: boolean,
      tileType: TileType
    }) => {
      const { x, y, damage, isCrit, destroyed, tileType } = payload;
      const tx = x * TILE_SIZE;
      const ty = y * TILE_SIZE;

      // 파괴 시 더 강한 흔들림 (4.0), 일반 타격 시 (0.8)
      world.shake = Math.max(world.shake, destroyed ? 4.0 : 0.8);

      // 파편 생성 (파괴 시 8개, 일반 타격 시 2개)
      createParticles(world, tx, ty, getTileColor(tileType), destroyed ? 8 : 2);

      // 대미지 텍스트
      createFloatingText(
        world,
        tx,
        ty,
        isCrit ? `Crit! -${damage}` : `${damage}`,
        isCrit ? '#f87171' : '#ffffff',
      );
    });

    // 2. 엔티티(몬스터/보스) 타격 관련 시각 효과
    messageBus.on('game:entity_hit', (payload: {
      x: number,
      y: number,
      damage: number,
      isCrit: boolean,
      text?: string,
      color?: string
    }) => {
      const { x, y, damage, isCrit, text, color } = payload;
      
      // 크리티컬 타격 시 화면 흔들림
      if (isCrit) world.shake = Math.max(world.shake, 8);

      // 텍스트 효과
      createFloatingText(
        world,
        x,
        y - 30,
        text || `-${damage}`,
        color || (isCrit ? '#f87171' : '#ffffff')
      );
    });

    // 3. 플레이어 피격 시각 효과
    messageBus.on('game:player_hit', (payload: {
      x: number,
      y: number,
      damage: number
    }) => {
      const { x, y, damage } = payload;
      
      // 피격 흔들림 대폭 강화
      world.shake = Math.max(world.shake, 5);

      // 피격 텍스트 (빨간색)
      createFloatingText(world, x, y - 20, `-${damage}`, '#ef4444');
    });
  }
};
