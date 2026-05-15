import { useCallback } from 'react';
import { GameWorld } from '@/entities/world/model';
import { saveManager } from '@/shared/lib/saveManager';
import { CraftRequirements } from '@/shared/types/game';
import { SendToWorker, UseGameActionsResult } from './types';

/**
 * 게임의 핵심 액션(업그레이드, 제작, 판매 등)을 처리하는 커스텀 훅입니다.
 */
export const useGameActions = (
  worldRef: React.MutableRefObject<GameWorld>,
  updateUi: () => void,
  sendToWorker: SendToWorker,
): UseGameActionsResult => {
  /** 업그레이드(공격력, 최대 체력) 처리 */
  const handleUpgrade = useCallback(
    (type: string, requirements: CraftRequirements) => {
      sendToWorker('ACTION', {
        action: 'upgrade',
        data: { type, requirements },
      });
      updateUi();
    },
    [sendToWorker, updateUi],
  );

  /** 새로운 아이템 제작 처리 */
  const handleCraft = useCallback(
    (req: CraftRequirements, res: any) => {
      // 실제 재료 차감 및 데이터 추가는 워커에서 처리하도록 액션 전송
      sendToWorker('ACTION', {
        action: 'craft',
        data: { req, res },
      });
      updateUi();
    },
    [sendToWorker, updateUi],
  );

  /** 제작 Effect 합성 처리 */
  const handleSynthesizeEffect = useCallback(
    (effectId: string) => {
      sendToWorker('ACTION', {
        action: 'synthesizeEffect',
        data: { effectId },
      });
      updateUi();
    },
    [sendToWorker, updateUi],
  );

  /** 수집한 자원 판매 처리 */
  const handleSell = useCallback(
    (resource: string, amount: number, price: number) => {
      sendToWorker('ACTION', {
        action: 'sell',
        data: { resource, amount, price },
      });
      updateUi();
    },
    [sendToWorker, updateUi],
  );

  /** 장비(드릴, 투구, 갑옷, 신발) 장착 변경 */
  const handleEquipEquipment = useCallback(
    (id: string, part: string) => {
      sendToWorker('ACTION', {
        action: 'equip',
        data: { id, part },
      });
      updateUi();
    },
    [sendToWorker, updateUi],
  );

  /** 장비 주스탯 옵션 재련 처리 */
  const handleRerollEquipmentOption = useCallback(
    (equipmentId: string) => {
      sendToWorker('ACTION', {
        action: 'rerollEquipmentOption',
        data: { equipmentId },
      });
      updateUi();
    },
    [sendToWorker, updateUi],
  );

  /** 웨이포인트를 통한 층 이동 처리 */
  const handleSelectCheckpoint = useCallback(
    (depth: number) => {
      sendToWorker('ACTION', { action: 'selectCheckpoint', data: { depth } });
      updateUi();
    },
    [sendToWorker, updateUi],
  );

  const handleResetGame = useCallback(() => {
    if (confirm('Are you sure you want to reset all progress?')) {
      saveManager.clear();
      window.location.reload();
    }
  }, []);

  const handleExportSave = useCallback(() => {
    sendToWorker('SAVE_REQUEST', { type: 'export' });
  }, [sendToWorker]);

  const handleImportSave = useCallback((code: string) => {
    if (code) {
      const imported = saveManager.import(code);
      if (imported) {
        saveManager.save(imported);
        window.location.reload();
      } else {
        alert('Invalid save code.');
      }
    }
  }, []);

  return {
    handleUpgrade,
    handleCraft,
    handleSynthesizeEffect,
    handleSell,
    handleEquipEquipment,
    handleRerollEquipmentOption,
    handleSelectCheckpoint,
    handleResetGame,
    handleExportSave,
    handleImportSave,
    handleRespawn: useCallback(() => {
      sendToWorker('ACTION', { action: 'respawn' });
      updateUi();
    }, [sendToWorker, updateUi]),
    handleRewardRevive: useCallback(() => {
      sendToWorker('ACTION', { action: 'rewardRevive' });
      updateUi();
    }, [sendToWorker, updateUi]),
  };
};
