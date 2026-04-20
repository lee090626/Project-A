import React from 'react';
import Shop from '@/widgets/shop/Shop';
import Inventory from '@/widgets/inventory/Inventory';
import Crafting from '@/widgets/crafting/Crafting';
import StatusWindow from '@/widgets/status/StatusWindow';
import Elevator from '@/widgets/elevator/Elevator';
import Encyclopedia from '@/widgets/encyclopedia/Encyclopedia';
import Settings from '@/widgets/settings/Settings';
import GuideWindow from '@/widgets/guide/GuideWindow';

interface ModalLayerProps {
  ui: any;
  currentStats: any;
  handleClose: (key: string) => void;
  gameActions: any;
}

const ModalLayer = ({ ui, currentStats, handleClose, gameActions }: ModalLayerProps) => {
  const {
    handleUpgrade,
    handleCraft,
    handleSell,
    handleSummonRune,
    handleSynthesizeRunes,
    handleEquipEquipment,
    handleEquipRune,
    handleUnequipRune,
    handleSelectCheckpoint,
    handleResetGame,
    handleExportSave,
    handleImportSave,
    handleEquipArtifact,
    handleSynthesizeRelic,
  } = gameActions;

  return (
    <>
      {ui.isShopOpen && (
        <Overlay key="shop" onClose={() => handleClose('isShopOpen')}>
          <Shop
            stats={currentStats}
            onClose={() => handleClose('isShopOpen')}
            onUpgrade={handleUpgrade}
            onSell={handleSell}
            onSummonRune={handleSummonRune}
            onSynthesizeRunes={handleSynthesizeRunes}
          />
        </Overlay>
      )}

      {ui.isStatusOpen && (
        <Overlay key="status" onClose={() => handleClose('isStatusOpen')}>
          <StatusWindow
            stats={currentStats}
            onClose={() => handleClose('isStatusOpen')}
            onUnequipRune={handleUnequipRune}
            onEquipArtifact={handleEquipArtifact}
          />
        </Overlay>
      )}

      {ui.isInventoryOpen && (
        <Overlay key="inventory" onClose={() => handleClose('isInventoryOpen')}>
          <Inventory
            stats={currentStats}
            onClose={() => handleClose('isInventoryOpen')}
            onEquip={handleEquipEquipment}
            onEquipRune={handleEquipRune}
          />
        </Overlay>
      )}

      {ui.isCraftingOpen && (
        <Overlay key="crafting" onClose={() => handleClose('isCraftingOpen')}>
          <Crafting
            stats={currentStats}
            onClose={() => handleClose('isCraftingOpen')}
            onCraft={handleCraft}
            onSynthesizeRelic={handleSynthesizeRelic}
          />
        </Overlay>
      )}

      {ui.isElevatorOpen && (
        <Overlay key="elevator" onClose={() => handleClose('isElevatorOpen')}>
          <Elevator
            stats={currentStats}
            onClose={() => handleClose('isElevatorOpen')}
            onSelectCheckpoint={handleSelectCheckpoint}
          />
        </Overlay>
      )}

      {ui.isEncyclopediaOpen && (
        <Overlay key="encyclopedia" onClose={() => handleClose('isEncyclopediaOpen')}>
          <Encyclopedia stats={currentStats} onClose={() => handleClose('isEncyclopediaOpen')} />
        </Overlay>
      )}

      {ui.isSettingsOpen && (
        <Overlay key="settings" onClose={() => handleClose('isSettingsOpen')}>
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
        <Overlay key="guide" onClose={() => handleClose('isGuideOpen')}>
          <GuideWindow onClose={() => handleClose('isGuideOpen')} />
        </Overlay>
      )}
    </>
  );
};

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-2 sm:p-6 lg:p-12 bg-zinc-950/40 backdrop-blur-md animate-in fade-in duration-500 pointer-events-auto">
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
