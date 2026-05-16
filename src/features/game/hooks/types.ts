import { GameWorld } from '@/entities/world/model';
import { CraftRequirements } from '@/shared/types/game';
import { WorkerMessageType } from '@/shared/types/worker';

/**
 * Game Worker 관련 타입
 */
export type SendToWorker = (
  type: WorkerMessageType,
  payload?: unknown,
  transfer?: Transferable[],
) => void;

/**
 * useGameUI 반환 타입
 */
export interface UseGameUIResult {
  closeAllModals: () => void;
  toggleModal: (target: keyof GameWorld['ui']) => void;
  handleClose: (target: keyof GameWorld['ui']) => void;
  handleOpen: (target: keyof GameWorld['ui']) => void;
  isAnyModalOpen: () => boolean;
}

/**
 * useGameActions 반환 타입
 */
export interface UseGameActionsResult {
  handleCraft: (req: CraftRequirements, res: any) => void;
  handleSynthesizeEffect: (effectId: string) => void;
  handleSell: (resource: string, amount: number, price: number) => void;
  handleEquipEquipment: (id: string, part: string) => void;
  handleRerollEquipmentOption: (equipmentId: string) => void;
  handleSelectCheckpoint: (depth: number) => void;
  handleResetGame: () => void;
  handleExportSave: () => void;
  handleImportSave: (code: string) => void;
  handleRespawn: () => void;
  handleRewardRevive: () => void;
}
