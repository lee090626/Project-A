import { GameWorld } from '@/entities/world/model';
import { ActiveEffect } from '@/shared/types/game';

/**
 * 캐릭터(플레이어 및 엔티티)의 상태 이상을 관리하는 시스템입니다.
 * - 지속 시간 체크 및 만료된 효과 제거
 * - 효과에 따른 스택 및 수치 적용
 */
export const statusSystem = (world: GameWorld, now: number) => {
  const { player } = world;

  // 1. 플레이어 상태 이상 업데이트
  if (player.stats.activeEffects && player.stats.activeEffects.length > 0) {
    // 만료된 효과 제거 (Filter)
    player.stats.activeEffects = player.stats.activeEffects.filter(effect => {
      const isExpired = now >= effect.endTime;
      return !isExpired;
    });

    // 특수 효과에 따른 로직 강제 적용 (예: STUN)
    const isStunned = player.stats.activeEffects.some(e => e.type === 'STUN');
    if (isStunned) {
      // 스턴 상태일 때: 플레이어의 모든 이동/채굴 의지 차단
      world.intent.moveX = 0;
      world.intent.moveY = 0;
      world.intent.miningTarget = null;
      
      // 채굴 상태 강제 해제
      player.isDrilling = false;
    }
  } else if (!player.stats.activeEffects) {
    player.stats.activeEffects = [];
  }

  // 2. [미래 확장] 몬스터 상태 이상 업데이트
  // 현재 SoA 구조에서는 별도 배열 관리가 필요함 (필요 시 도입)
};

/**
 * 대상에게 상태 이상을 부여하는 유틸리티 함수
 */
export const applyStatusEffect = (world: GameWorld, effect: Omit<ActiveEffect, 'endTime'>, durationMs: number) => {
  const { player } = world;
  const now = Date.now();
  
  if (!player.stats.activeEffects) {
    player.stats.activeEffects = [];
  }

  // 동일한 타입의 효과가 있으면 갱신 (지속 시간 연장)
  const existing = player.stats.activeEffects.find(e => e.type === effect.type);
  if (existing) {
    existing.endTime = now + durationMs;
    if (effect.value !== undefined) existing.value = effect.value;
  } else {
    player.stats.activeEffects.push({
      ...effect,
      endTime: now + durationMs
    });
  }
};
