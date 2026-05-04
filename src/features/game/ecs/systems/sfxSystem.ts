import { messageBus } from '@/shared/lib/MessageBus';
import type { GameSfxId } from '@/shared/types/game';
import type { PlaySfxPayload } from '@/shared/types/game/audio';

const WORKER_SFX_COOLDOWN_MS: Record<GameSfxId, number> = {
  mine_hit: 55,
  tile_break: 90,
  item_pickup: 75,
  enemy_hit: 65,
  player_hit: 140,
  boss_defeat: 500,
  ui_click: 40,
};

const lastEmittedAt: Partial<Record<GameSfxId, number>> = {};

/**
 * 워커 ECS 이벤트를 메인 스레드 효과음 요청으로 변환하는 시스템입니다.
 */
export const sfxSystem = {
  /**
   * 효과음 관련 이벤트 핸들러를 등록합니다.
   */
  init: () => {
    messageBus.on('game:tile_hit', (payload: { destroyed: boolean }) => {
      emitSfx(payload.destroyed ? 'tile_break' : 'mine_hit', payload.destroyed ? 1.15 : 0.75);
    });

    messageBus.on('game:entity_hit', (payload: { isCrit?: boolean }) => {
      emitSfx('enemy_hit', payload.isCrit ? 1.15 : 0.85);
    });

    messageBus.on('game:player_hit', () => {
      emitSfx('player_hit', 1.1);
    });

    messageBus.on('game:item_collected', () => {
      emitSfx('item_pickup', 0.8);
    });

    messageBus.on('game:boss_defeated', () => {
      emitSfx('boss_defeat', 1.2);
    });
  },
};

function emitSfx(id: GameSfxId, intensity = 1): void {
  if (typeof self === 'undefined' || typeof self.postMessage !== 'function') return;

  const now = performance.now();
  const cooldown = WORKER_SFX_COOLDOWN_MS[id];
  if (now - (lastEmittedAt[id] ?? -Infinity) < cooldown) return;
  lastEmittedAt[id] = now;

  const payload: PlaySfxPayload = { id, intensity };
  self.postMessage({ type: 'PLAY_SFX', payload });
}
