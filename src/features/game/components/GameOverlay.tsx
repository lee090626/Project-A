import React from 'react';
import { GameWorld } from '@/entities/world/model';
import MobileController from '@/features/input/ui/MobileController';
import Hud from '@/widgets/hud/ui/Hud';
import ToastContainer from '@/shared/ui/ToastContainer';
import BossHealthBar from './BossHealthBar';
import { useGameStore } from '@/shared/lib/store';

// 새롭게 분리된 레이어 컴포넌트들
import InteractionLayer from './InteractionLayer';
import ModalLayer from './ModalLayer';

/**
 * 게임 메인 UI 레이어들의 오케스트레이터입니다.
 * 관심사(Hud, Interaction, Modals)에 따라 내부 레이어를 분리하여 관리합니다.
 */
interface GameOverlayProps {
  worldRef: React.MutableRefObject<GameWorld>;
  stats: any;
  interpolatedState: React.MutableRefObject<{
    x: number;
    y: number;
    camX: number;
    camY: number;
    shake: number;
    hp: number;
  }>;
  uiActions: any; // useGameUI의 반환값
  gameActions: any; // useGameActions의 반환값
  visibleEntitiesCount: number;
  sendToWorker: (type: string, payload?: any) => void;
}

export default function GameOverlay({
  worldRef,
  stats,
  interpolatedState,
  uiActions,
  gameActions,
}: GameOverlayProps) {
  const world = worldRef.current;
  const { ui, player } = world;
  
  // Zustand 스토어 구독 (Interaction Prompt)
  const showInteractionPrompt = useGameStore((state) => state.ui.showInteractionPrompt);
  const activeInteractionType = useGameStore((state) => state.ui.activeInteractionType);
  
  const currentStats = stats || player.stats;
  const { toggleModal, handleClose } = uiActions;
  const { handleRespawn } = gameActions;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {/* 1. 글로벌 보스 체력 바 레이어 */}
      <BossHealthBar />

      {/* 2. HUD 레이어 (항시 표시) */}
      <div className="pointer-events-auto w-full h-full">
        <Hud
          stats={currentStats}
          pos={{ x: interpolatedState.current.x, y: interpolatedState.current.y }}
          onOpenStatus={() => toggleModal('isStatusOpen')}
          onOpenInventory={() => toggleModal('isInventoryOpen')}
          onOpenEncyclopedia={() => toggleModal('isEncyclopediaOpen')}
          onOpenElevator={() => toggleModal('isElevatorOpen')}
          onOpenSettings={() => toggleModal('isSettingsOpen')}
          onOpenGuide={() => toggleModal('isGuideOpen')}
        />
      </div>

      {/* 3. 모달 레이어 (상점, 인벤토리 등 오버레이 윈도우) */}
      <ModalLayer 
        ui={ui}
        currentStats={currentStats}
        handleClose={handleClose}
        gameActions={gameActions}
      />

      {/* 4. 상호작용 및 사망 오버레이 레이어 */}
      <InteractionLayer 
        currentStats={currentStats}
        showInteractionPrompt={showInteractionPrompt}
        activeInteractionType={activeInteractionType}
        handleRespawn={handleRespawn}
      />

      {/* 5. 모바일 컨트롤러 레이어 */}
      {currentStats.hp > 0 && world.ui.isMobile && (
        <MobileController
          onJoystickMove={(data) => {
            worldRef.current.mobileJoystick = data;
          }}
          onActionPress={() => {
            worldRef.current.keys[' '] = true;
            setTimeout(() => {
              worldRef.current.keys[' '] = false;
            }, 100);
          }}
        />
      )}

      {/* 6. 전역 알림 컨테이너 */}
      <ToastContainer />
    </div>
  );
}
