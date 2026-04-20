import { GameWorld } from '@/entities/world/model';
import { ActiveEffect, StatusType } from '@/shared/types/game';
import { createFloatingText } from '@/shared/lib/effectUtils';
import { TILE_SIZE } from '@/shared/config/constants';

/**
 * 캐릭터(플레이어 및 엔티티)의 상태 이상을 관리하는 시스템입니다.
 * - 지속 시간 체크 및 만료된 효과 제거
 * - 도트 대미지(화상, 독) 처리
 * - 환경 디버프(Hazards) 처리
 */
export const statusSystem = (world: GameWorld, now: number) => {
  const { player } = world;

  if (!player.stats.activeEffects) {
    player.stats.activeEffects = [];
  }

  // 1. 주기적 효과 체크 및 자연 회복 (1초마다 수행)
  if (!world.timestamp) (world as any).timestamp = {};
  const lastRegenCheck = (world.timestamp as any).lastRegenCheck || 0;

  if (now - lastRegenCheck > 1000) {
    (world.timestamp as any).lastRegenCheck = now;

    // 자연 회복 (Passive Regen): 매 초당 최대 체력의 1% 회복 (단, 완전 사망 상태가 아닐 때만)
    if (player.stats.hp > 0 && player.stats.hp < player.stats.maxHp) {
      const regenAmount = Math.max(1, Math.floor(player.stats.maxHp * 0.01));
      player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + regenAmount);
    }
  }

  // 2. [Specialist] 플레이어 상태 이상 업데이트 및 만료 처리
  const { processActiveEffects } = require('./status/EffectProcessor');
  processActiveEffects(world, now);


  // 3. 행동 제어 상태 체크 (STUN) - FREEZE는 속도 저하로 physicsSystem에서 처리
  const isActionBlocked = player.stats.activeEffects.some((e) => e.type === 'STUN');
  if (isActionBlocked) {
    world.intent.moveX = 0;
    world.intent.moveY = 0;
    world.intent.miningTarget = null;
    player.isDrilling = false;
  }

  // --- [v4 Emergency Fix] Stuck Stun Cleanser ---
  if (player.stats.activeEffects.length > 0) {
    player.stats.activeEffects = player.stats.activeEffects.filter(e => {
      if (e.type === 'STUN' && e.endTime > now + 3600000) return false; 
      return true;
    });
  }
};


import { applyStatusEffect } from './status/StatusUtils';

/**
 * 대상에게 상태 이상을 부여하는 유틸리티 함수
 */
export { applyStatusEffect };

