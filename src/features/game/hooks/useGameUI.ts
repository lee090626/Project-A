import { useCallback } from 'react';
import { GameWorld, isAnyModalOpen as hasAnyModalOpen, MODAL_UI_KEYS } from '@/entities/world/model';
import type { ModalUiKey } from '@/entities/world/model';
import type { SendToWorker, UseGameUIResult } from './types';

function createWorkerUiState(ui: GameWorld['ui']): Record<string, boolean> {
  return MODAL_UI_KEYS.reduce<Record<string, boolean>>(
    (payload, key) => {
      payload[key] = ui[key];
      return payload;
    },
    { isMobile: ui.isMobile },
  );
}

function isModalUiKey(target: keyof GameWorld['ui']): target is ModalUiKey {
  return (MODAL_UI_KEYS as readonly string[]).includes(target);
}

/**
 * 게임의 UI 상태(모달 창의 열림/닫힘)를 관리하는 커스텀 훅입니다.
 * @param worldRef 게임 월드 상태 객체에 대한 Ref
 * @param updateUi UI 갱신을 트리거하는 콜백 함수
 * @param sendToWorker 워커 입력 차단에 필요한 UI 상태를 동기화하는 콜백
 */
export const useGameUI = (
  worldRef: React.MutableRefObject<GameWorld>,
  updateUi: () => void,
  sendToWorker: SendToWorker,
): UseGameUIResult => {
  const commitUiUpdate = useCallback(() => {
    updateUi();
    sendToWorker('UI_STATE', { ui: createWorkerUiState(worldRef.current.ui) });
  }, [worldRef, updateUi, sendToWorker]);

  /** 모든 모달 창을 닫습니다. */
  const closeAllModals = useCallback(() => {
    const { ui } = worldRef.current;
    MODAL_UI_KEYS.forEach((key) => {
      ui[key] = false;
    });
    commitUiUpdate();
  }, [worldRef, commitUiUpdate]);

  /**
   * 특정 모달의 상태를 반전(토글)시킵니다.
   * @param target 토글할 UI 상태 키
   */
  const toggleModal = useCallback(
    (target: keyof GameWorld['ui']) => {
      if (!isModalUiKey(target)) return;

      const { ui } = worldRef.current;
      const current = ui[target];

      ui[target] = !current;
      commitUiUpdate();
    },
    [worldRef, commitUiUpdate],
  );

  /** 특정 모달을 닫습니다. */
  const handleClose = useCallback(
    (target: keyof GameWorld['ui']) => {
      if (!isModalUiKey(target)) return;

      worldRef.current.ui[target] = false;
      commitUiUpdate();
    },
    [worldRef, commitUiUpdate],
  );

  /** 특정 모달을 엽니다. */
  const handleOpen = useCallback(
    (target: keyof GameWorld['ui']) => {
      if (!isModalUiKey(target)) return;

      worldRef.current.ui[target] = true;
      commitUiUpdate();
    },
    [worldRef, commitUiUpdate],
  );

  /** 현재 열려 있는 모달이 하나라도 있는지 확인합니다. */
  const isAnyModalOpen = useCallback(() => {
    return hasAnyModalOpen(worldRef.current.ui);
  }, [worldRef]);

  return {
    closeAllModals,
    toggleModal,
    handleClose,
    handleOpen,
    isAnyModalOpen,
  };
};
