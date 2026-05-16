import React from 'react';
import Shop from '@/widgets/shop/Shop';
import Inventory from '@/widgets/inventory/Inventory';
import Crafting from '@/widgets/crafting/Crafting';
import StatusWindow from '@/widgets/status/StatusWindow';
import Elevator from '@/widgets/elevator/Elevator';
import Encyclopedia from '@/widgets/encyclopedia/Encyclopedia';
import Settings from '@/widgets/settings/Settings';
import GuideWindow from '@/widgets/guide/GuideWindow';
import { UseGameActionsResult } from '../hooks/types';
import { PlayerStats } from '@/shared/types/game';
import { GameWorld } from '@/entities/world/model';

interface ModalLayerProps {
  ui: GameWorld['ui'];
  currentStats: PlayerStats;
  handleClose: (key: keyof GameWorld['ui']) => void;
  gameActions: UseGameActionsResult;
}

const ModalLayer = ({ ui, currentStats, handleClose, gameActions }: ModalLayerProps) => {
  const {
    handleCraft,
    handleSynthesizeEffect,
    handleSell,
    handleEquipEquipment,
    handleRerollEquipmentOption,
    handleSelectCheckpoint,
    handleResetGame,
    handleExportSave,
    handleImportSave,
  } = gameActions;

  return (
    <>
      {ui.isShopOpen && (
        <Overlay key="shop">
          <Shop
            stats={currentStats}
            onClose={() => handleClose('isShopOpen')}
            onSell={handleSell}
          />
        </Overlay>
      )}

      {ui.isStatusOpen && (
        <Overlay key="status">
          <StatusWindow
            stats={currentStats}
            onClose={() => handleClose('isStatusOpen')}
          />
        </Overlay>
      )}

      {ui.isInventoryOpen && (
        <Overlay key="inventory">
          <Inventory
            stats={currentStats}
            onClose={() => handleClose('isInventoryOpen')}
            onEquip={handleEquipEquipment}
            onRerollEquipmentOption={handleRerollEquipmentOption}
          />
        </Overlay>
      )}

      {ui.isCraftingOpen && (
        <Overlay key="crafting">
          <Crafting
            stats={currentStats}
            onClose={() => handleClose('isCraftingOpen')}
            onCraft={handleCraft}
            onSynthesizeEffect={handleSynthesizeEffect}
          />
        </Overlay>
      )}

      {ui.isElevatorOpen && (
        <Overlay key="elevator">
          <Elevator
            stats={currentStats}
            onClose={() => handleClose('isElevatorOpen')}
            onSelectCheckpoint={handleSelectCheckpoint}
          />
        </Overlay>
      )}

      {ui.isEncyclopediaOpen && (
        <Overlay key="encyclopedia">
          <Encyclopedia stats={currentStats} onClose={() => handleClose('isEncyclopediaOpen')} />
        </Overlay>
      )}

      {ui.isSettingsOpen && (
        <Overlay key="settings">
          <Settings
            onClose={() => handleClose('isSettingsOpen')}
            onReset={handleResetGame}
            onExport={handleExportSave}
            onImport={() => {
              const code = prompt('Enter save code:');
              if (code) handleImportSave(code);
            }}
          />
        </Overlay>
      )}

      {ui.isGuideOpen && (
        <Overlay key="guide">
          <GuideWindow onClose={() => handleClose('isGuideOpen')} />
        </Overlay>
      )}
    </>
  );
};

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-2 sm:p-6 lg:p-12 bg-zinc-950/70 animate-in fade-in duration-150 pointer-events-auto">
      <div
        className="w-full max-w-[1280px] h-full lg:h-auto lg:aspect-video max-h-[95vh] lg:max-h-[85vh] relative pointer-events-auto flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default React.memo(ModalLayer);
