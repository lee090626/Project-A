import { useEffect, useRef } from 'react';
import { GameWorld } from '@/entities/world/model';
import { SendToWorker } from './types';

const SHORTCUTS: Record<string, keyof GameWorld['ui']> = {
  KeyI: 'isInventoryOpen',
  KeyC: 'isStatusOpen',
  KeyB: 'isEncyclopediaOpen',
  KeyV: 'isElevatorOpen',
  KeyR: 'isLaboratoryOpen',
  KeyH: 'isGuideOpen',
};

export function useGameInput(
  worldRef: React.MutableRefObject<GameWorld>,
  isAnyModalOpen: () => boolean,
  closeAllModals: () => void,
  handleOpen: (modal: keyof GameWorld['ui']) => void,
  handleClose: (modal: keyof GameWorld['ui']) => void,
  sendToWorker: SendToWorker,
) {
  const keyStateRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore game shortcuts if system modifiers (Cmd, Ctrl, Alt) are active
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const code = e.code;

      if (code === 'Escape') {
        if (isAnyModalOpen()) closeAllModals();
        else handleOpen('isSettingsOpen');
        return;
      }

      const target = SHORTCUTS[code];
      if (target) {
        if (isAnyModalOpen()) {
          if (worldRef.current.ui[target]) handleClose(target);
        } else {
          handleOpen(target);
        }
        return;
      }

      if (isAnyModalOpen()) return;

      if (!keyStateRef.current[code]) {
        keyStateRef.current[code] = true;
        sendToWorker('INPUT', { keys: { [code]: true } });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (keyStateRef.current[code]) {
        keyStateRef.current[code] = false;
        sendToWorker('INPUT', { keys: { [code]: false } });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isAnyModalOpen, closeAllModals, handleOpen, handleClose, sendToWorker, worldRef]);
}
