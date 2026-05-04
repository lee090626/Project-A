import { useEffect } from 'react';
import { configureGameSfx, unlockGameSfx } from '@/shared/lib/sfxManager';

/**
 * 브라우저 입력 이벤트를 통해 게임 효과음 AudioContext를 활성화하고 설정을 동기화합니다.
 *
 * @param enabled - 효과음 활성화 여부
 */
export function useGameSfx(enabled: boolean): void {
  useEffect(() => {
    configureGameSfx({ enabled });
  }, [enabled]);

  useEffect(() => {
    const unlock = () => unlockGameSfx();

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);
}
