import { GameWorld } from '@/entities/world/model';
import { damageProcessor } from './DamageProcessor';
import { deathHandler } from './DeathHandler';
import { LootGenerator } from './LootGenerator';

// 전역 초기화 여부 플래그
let isCombatInitialized = false;

/**
 * 플레이어와 몬스터 간의 전투(대미지 처리, 사망 등)를 관리하는 메인 시스템(오케스트레이터)입니다.
 * SoC 원칙에 따라 실질적인 연산은 하위 도메인 시스템에 위임합니다.
 */
export const combatSystem = (world: GameWorld, deltaTime: number, now: number) => {
  // 1. 도메인 서비스 초기화 (최초 1회)
  if (!isCombatInitialized) {
    LootGenerator.init();
    isCombatInitialized = true;
  }

  // 2. [SoC: 대미지] 상호 타격 판정 및 시각 효과 처리
  damageProcessor(world, now);

  // 3. [SoC: 사망] HP 체크, 보상 정산 및 이벤트 발행
  // 이 시스템 내부에서 'ENTITY_DIED' 메시지가 발행되며 LootGenerator가 이를 수신합니다.
  deathHandler(world, now);
};
