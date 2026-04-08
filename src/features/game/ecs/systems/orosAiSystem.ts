import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { applyStatusEffect } from './statusSystem';
import { createFloatingText } from '@/shared/lib/effectUtils';

/**
 * 차원 1 보스 '태고의 바위: 오로스' 전용 AI 시스템
 * 패턴: 수직 점프 -> 제자리 낙약 -> 광역 충격파(스턴)
 */
export const orosAiSystem = (world: GameWorld, now: number) => {
  const { entities, player } = world;
  const { soa } = entities;

  for (let i = 0; i < soa.count; i++) {
    // 타입 2: 보스, 이름에 '오로스'가 포함된 경우 (또는 ID 체크)
    if (soa.type[i] !== 2) continue;

    // 보스 전용 상태 관리 (공유 SoA의 state 활용 가능하나, 커스텀 데이터 필요 시 확장)
    // 여기서는 간단하게 시간 기반 FSM 구현
    if (!soa.lastAttackTime[i]) soa.lastAttackTime[i] = now;
    
    const cycleTime = 8000; // 전체 패턴 주기 8초
    const elapsed = (now - soa.lastAttackTime[i]) % cycleTime;

    const spawnY = soa.y[i]; // 초기 위치 (제자리 낙하를 위해 필요)
    // 주의: SoA에 초기 위치가 저장되어 있지 않다면 별도 관리가 필요할 수 있음.
    // 여기서는 간단히 현재 위치를 기준으로 하지만, '제자리' 원칙을 위해 로컬 변수나 추가 필드 필요.

    if (elapsed < 3000) {
      // 1. IDLE (3초)
      soa.state[i] = 0; // Idle
    } else if (elapsed < 4000) {
      // 2. READY (1초) - 눈 빛남 및 진동 예고
      soa.state[i] = 1; // Ready
      world.shake = Math.max(world.shake, 2);
    } else if (elapsed < 5000) {
      // 3. JUMP (1초) - 하늘로 솟구침
      soa.state[i] = 2; // Jump
      // 시각적 높이 조절은 Renderer에서 수행하거나 Y값을 직접 변경 (수직 점프)
      // 여기서는 시스템 로직이므로 실제 충돌 판정 위치는 하늘 위로 간주
    } else if (elapsed < 5500) {
      // 4. FALL (0.5초) - 급강하
      soa.state[i] = 3; // Fall
    } else if (elapsed < 6000) {
      // 5. SLAM (0.5초) - 착지 및 충격파 발생
      if (soa.state[i] !== 4) { // 착지 순간 1회 실행
        soa.state[i] = 4; // Slam
        world.shake = 15; // 강한 진동
        
        // 충격파 범위 체크 (중앙 기준 8타일 반경)
        const bx = soa.x[i] + (soa.width[i] || TILE_SIZE) / 2;
        const by = soa.y[i] + (soa.height[i] || TILE_SIZE) / 2;
        const px = player.pos.x * TILE_SIZE;
        const py = player.pos.y * TILE_SIZE;
        
        const dist = Math.sqrt((bx - px) ** 2 + (by - py) ** 2);
        if (dist < TILE_SIZE * 8) {
          // 플레이어 스턴 부여 (2초)
          applyStatusEffect(world, { type: 'STUN', vfxId: 'stars' }, 2000);
          createFloatingText(world, px, py - 40, 'STUNNED!', '#fbbf24');
        }
      }
    } else {
      // 6. COOLDOWN (2초)
      soa.state[i] = 0;
    }
  }
};
