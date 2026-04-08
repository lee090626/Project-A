'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createInitialWorld, GameWorld } from '@/entities/world/model';
import { fetchBaseLayout, fetchEntities } from '@/shared/lib/dataLoader';
import { saveManager, SaveData } from '@/shared/lib/saveManager';
import { MINERALS } from '@/shared/config/mineralData';

// Widgets
import Hud from '@/widgets/hud/ui/Hud';
import Shop from '@/widgets/shop/Shop';
import Inventory from '@/widgets/inventory/Inventory';
import Crafting from '@/widgets/crafting/Crafting';
import StatusWindow from '@/widgets/status/StatusWindow';
import Settings from '@/widgets/settings/Settings';
import Elevator from '@/widgets/elevator/Elevator';
import Encyclopedia from '@/widgets/encyclopedia/Encyclopedia';
import RefineryWindow from '@/widgets/refinery/RefineryWindow';
import Laboratory from '@/widgets/laboratory/Laboratory';
import GuideWindow from '@/widgets/guide/GuideWindow';

// Hooks
import { useGameUI } from './hooks/useGameUI';
import { useGameActions } from './hooks/useGameActions';
import MobileController from '@/features/input/ui/MobileController';
import { useGameStore } from '@/shared/lib/store';

const SHORTCUTS: Record<string, keyof GameWorld['ui']> = {
  'i': 'isInventoryOpen',
  'c': 'isStatusOpen',
  'b': 'isEncyclopediaOpen',
  'v': 'isElevatorOpen',
  'r': 'isLaboratoryOpen',
  'h': 'isGuideOpen',
  's': 'isSettingsOpen'
};

interface GameSyncData {
  stats: any;
  pos: { x: number; y: number };
  visualPos: { x: number; y: number };
  shake: number;
}

/** 
 * 전역 워커 관리 (Singleton)
 * 리렌더링이나 Strict Mode에 관계없이 워커 인스턴스를 하나만 유지합니다.
 */
let globalWorker: Worker | null = null;

export default function GameEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const hasTransferredRef = useRef(false);
  const worldRef = useRef<GameWorld>(createInitialWorld(12345));
  
  const [syncData, setSyncData] = useState<GameSyncData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [uiVersion, setUiVersion] = useState(0); 
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isEngineReady, setIsEngineReady] = useState(false);
  const isReadyRef = useRef(false);

  // Zustand 스토어 상태 구독
  const stats = useGameStore((state) => state.stats);

  // 트리플 버퍼링 및 보간(Lerp) 관련 Ref
  const snapshots = useRef<{ time: number, data: Float32Array }[]>([]);
  const interpolatedState = useRef({
    x: 15, y: 8, camX: 15, camY: 8, shake: 0, hp: 0
  });

  // 고유 스냅샷 임계값 (텔레포트 감지)
  const TELEPORT_THRESHOLD = 5; // 5타일 이상 차이 나면 Snap

  const updateUi = useCallback(() => {
    setUiVersion(v => v + 1);
  }, []);

  const sendToWorker = useCallback((type: string, payload?: any, transfer?: Transferable[]) => {
    if (globalWorker) {
      globalWorker.postMessage({ type, payload }, transfer || []);
    }
  }, []);

  const loadImageBitmap = useCallback((url: string): Promise<ImageBitmap> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => createImageBitmap(img).then(resolve).catch(reject);
      img.onerror = reject;
      img.src = url;
    });
  }, []);

  const loadAssetsAndTransfer = useCallback(async () => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const assetsPath = `${basePath}/assets`;

    try {
      // 1. Load Manifest
      const manifestRes = await fetch(`${assetsPath}/manifest.json`);
      if (!manifestRes.ok) throw new Error('Failed to load atlas manifest');
      const manifest = await manifestRes.json();

      const atlasData: any[] = [];
      const transferList: Transferable[] = [];

      // 2. Load each Atlas
      await Promise.all(manifest.atlasFiles.map(async (jsonFile: string) => {
        const jsonRes = await fetch(`${assetsPath}/${jsonFile}`);
        const jsonData = await jsonRes.json();
        
        // Find corresponding image file (atlas-X.webp)
        const webpFile = jsonFile.replace('.json', '.webp');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = `${assetsPath}/${webpFile}`;
        });
        
        const bitmap = await createImageBitmap(img);
        atlasData.push({ json: jsonData, bitmap });
        transferList.push(bitmap);
      }));

      // 3. Load other static data
      const [layout, entities] = await Promise.all([fetchBaseLayout(), fetchEntities()]);

      // 4. Send to Worker
      sendToWorker('ASSETS_ATLAS', { atlasData, layout, entities }, transferList);
      console.log(`[Main] Sent ${atlasData.length} atlases to worker.`);
    } catch (err) {
      console.error("Asset transfer failed:", err);
      // Fallback: If atlas fails, engine ready anyway to prevent stuck loading
      setIsEngineReady(true);
    }
  }, [sendToWorker]);

  const { closeAllModals, toggleModal, handleClose, handleOpen, isAnyModalOpen } = useGameUI(worldRef, updateUi);
  const { handleUpgrade, handleCraft, handleSell, handleExtractRune, handleSynthesizeRunes, handleEquipDrill, handleEquipDrone, handleEquipRune, handleUnequipRune, handleSelectCheckpoint, handleResetGame, handleRegenerateWorld, handleExportSave, handleImportSave, handleStartSmelting, handleCollectSmelting, handleUnlockResearch, handleUseArtifact, handleEquipArtifact, handleTravelDimension, handleRespawn } = useGameActions(worldRef, updateUi, sendToWorker);

  // 1. 워커 엔진 초기화 (최초 1회)
  useEffect(() => {
    setIsClient(true);
    if (typeof window === 'undefined') return;

    if (!globalWorker) {
      globalWorker = new Worker(new URL('./worker/game.worker.ts', import.meta.url));
      console.log('[Main] Worker Singleton Created.');
    }

    const worker = globalWorker;
    worker.onmessage = (e) => {
      const { type, payload, buffer } = e.data;
      
      if (type === 'RENDER_SYNC' && buffer) {
        const view = new Float32Array(buffer);
        const timestamp = view[1];
        
        // 스냅샷 리스트 관리 (최신 2개 유지)
        snapshots.current.push({ time: timestamp, data: view });
        if (snapshots.current.length > 2) {
          const old = snapshots.current.shift();
          // 사용이 끝난 버퍼를 워커로 반환 (트리플 버퍼링 핵심)
          if (old) {
            worker.postMessage({ type: 'RETURN_BUFFER', payload: { buffer: old.data.buffer } }, [old.data.buffer]);
          }
        }

        if (!isReadyRef.current) {
          setIsEngineReady(true);
        }
      } else if (type === 'SYNC_UI' && payload) {
        // Zustand 스토어 업데이트 (Throttled 수신)
        useGameStore.getState().updateStats(payload.stats);
      } else if (type === 'ENGINE_READY') {
        setIsEngineReady(true);
        console.log('[Main] Engine is ready to render!');
      } else if (type === 'SAVE') {
        saveManager.save(payload);
      } else if (type === 'EXPORT_DATA') {
        const exported = saveManager.export(payload);
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(exported);
          alert('Save code copied to clipboard!');
        }
      } else if (type === 'PORTAL_TRIGGERED') {
        const nextDim = payload.nextDim;
        if (confirm(`Dimension ${nextDim}으로 이동하시겠습니까?\n새로운 세계에서 모험이 시작됩니다!`)) {
          handleTravelDimension();
        }
      } else if (type === 'DIMENSION_TRAVEL_COMPLETE') {
        alert(`Dimension ${payload.dimension}에 도착했습니다!`);
      }
    };

    const saved = saveManager.load();
    console.log('[Main] Sending INIT to worker...');
    worker.postMessage({ 
      type: 'INIT', 
      payload: { seed: saved?.stats.mapSeed || 12345, saveData: saved } 
    });

    loadAssetsAndTransfer();

    // 5초 타임아웃: 엔진이 응답하지 않으면 강제로 로딩 화면 해제
    const timeoutId = setTimeout(() => {
      if (!isReadyRef.current) {
        console.warn('[Main] Engine initialization timeout (5s). Forcing start...');
        setIsEngineReady(true);
      }
    }, 5000);

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'escape') {
        if (isAnyModalOpen()) closeAllModals();
        else handleOpen('isSettingsOpen');
        return;
      }
      const target = SHORTCUTS[key];
      if (target) {
        if (isAnyModalOpen()) {
          if (worldRef.current.ui[target]) handleClose(target);
        } else handleOpen(target);
        return;
      }
      if (key === 'p') {
        sendToWorker('ACTION', { action: 'STRESS_TEST' });
        return;
      }
      if (isAnyModalOpen()) return;
      sendToWorker('INPUT', { keys: { [key]: true } });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      sendToWorker('INPUT', { keys: { [e.key.toLowerCase()]: false } });
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });
      sendToWorker('RESIZE', { width, height });
    };

    handleResize();

    // 메인 스레드 보간 루프 (RAF)
    let rafId: number;
    const renderLoop = () => {
      const now = performance.now();
      const snaps = snapshots.current;

      if (snaps.length >= 2) {
        const s0 = snaps[0];
        const s1 = snaps[1];
        
        // 보간 계수(alpha) 계산
        const renderTime = now - 50; // 약 50ms (3틱) 지연 보간으로 부드러움 극대화
        let alpha = (renderTime - s0.time) / (s1.time - s0.time);
        alpha = Math.max(0, Math.min(1, alpha));

        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

        // Header: [count, time, camX, camY, shake, playerX, playerY, hp, ...]
        const p0 = s0.data;
        const p1 = s1.data;

        // 텔레포트 감지 (거리 임계값)
        const dist = Math.sqrt(Math.pow(p1[2] - p0[2], 2) + Math.pow(p1[3] - p0[3], 2));
        const finalAlpha = dist > TELEPORT_THRESHOLD ? 1 : alpha;

        interpolatedState.current = {
          x: lerp(p0[2], p1[2], finalAlpha),
          y: lerp(p0[3], p1[3], finalAlpha),
          camX: lerp(p0[2], p1[2], finalAlpha), // 카메라 좌표와 동기화
          camY: lerp(p0[3], p1[3], finalAlpha),
          shake: lerp(p0[4], p1[4], finalAlpha),
          hp: lerp(p0[5], p1[5], finalAlpha)
        };
        
        // UI 연동을 위한 Legacy Ref 업데이트 (필요시)
        worldRef.current.player.visualPos.x = interpolatedState.current.x;
        worldRef.current.player.visualPos.y = interpolatedState.current.y;
        worldRef.current.shake = interpolatedState.current.shake;
        
        // UI 강제 리렌더링 (저주사율 데이터는 Zustand가, 고주사율 위치는 uiVersion이 트리거)
        updateUi();
      }

      rafId = requestAnimationFrame(renderLoop);
    };
    rafId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [loadAssetsAndTransfer, sendToWorker]);

  // 2. 캔버스 엘리먼트 유효성 감지 및 제어권 전송 (재마운트 대응)
  useEffect(() => {
    if (!globalWorker || !canvasRef.current) return;

    try {
      const offscreen = canvasRef.current.transferControlToOffscreen();
      globalWorker.postMessage({ type: 'SET_CANVAS', payload: { offscreen } }, [offscreen]);
      console.log('[Main] Canvas control transferred.');
    } catch (e) {
      // 이미 전송된 경우 등의 오류 무시
    }
  }, [isClient]);

  if (!isClient) return <div className="fixed inset-0 bg-zinc-950" />;

  const world = worldRef.current;
  const { ui, player } = world;

  return (
    <div className="fixed inset-0 overflow-hidden bg-transparent">
      <canvas
        ref={canvasRef}
        width={windowSize.width}
        height={windowSize.height}
        className="w-full h-full block relative z-0 opacity-100"
      />

      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="pointer-events-auto w-full h-full">
          <Hud 
            stats={stats || player.stats} 
            pos={{ x: interpolatedState.current.x, y: interpolatedState.current.y }}
            onOpenStatus={() => toggleModal('isStatusOpen')}
            onOpenInventory={() => toggleModal('isInventoryOpen')}
            onOpenEncyclopedia={() => toggleModal('isEncyclopediaOpen')} 
            onOpenElevator={() => toggleModal('isElevatorOpen')}
            onOpenSettings={() => toggleModal('isSettingsOpen')}
            onOpenGuide={() => toggleModal('isGuideOpen')}
          />
        </div>

        {player.stats.hp > 0 && world.ui.isMobile && (
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
      </div>

      {/* Modals ... */}
      {ui.isShopOpen && <Overlay key="shop" onClose={() => handleClose('isShopOpen')}><Shop stats={stats || worldRef.current.player.stats} onClose={() => handleClose('isShopOpen')} onUpgrade={handleUpgrade} onSell={handleSell} onExtractRune={handleExtractRune} onSynthesizeRunes={handleSynthesizeRunes} /></Overlay>}
      {ui.isStatusOpen && <Overlay key="status" onClose={() => handleClose('isStatusOpen')}><StatusWindow stats={stats || player.stats} onClose={() => handleClose('isStatusOpen')} onUnequipRune={handleUnequipRune} onEquipArtifact={handleEquipArtifact} /></Overlay>}
      {ui.isInventoryOpen && <Overlay key="inventory" onClose={() => handleClose('isInventoryOpen')}><Inventory stats={stats || player.stats} onClose={() => handleClose('isInventoryOpen')} onEquip={(id, type) => { if (type === 'drill') handleEquipDrill(id); else handleEquipDrone(id); }} onEquipRune={handleEquipRune} /></Overlay>}
      {ui.isCraftingOpen && <Overlay key="crafting" onClose={() => handleClose('isCraftingOpen')}><Crafting stats={stats || player.stats} onClose={() => handleClose('isCraftingOpen')} onCraft={handleCraft} /></Overlay>}
      {ui.isElevatorOpen && <Overlay key="elevator" onClose={() => handleClose('isElevatorOpen')}><Elevator stats={stats || player.stats} onClose={() => handleClose('isElevatorOpen')} onSelectCheckpoint={handleSelectCheckpoint} /></Overlay>}
      {ui.isEncyclopediaOpen && <Overlay key="encyclopedia" onClose={() => handleClose('isEncyclopediaOpen')}><Encyclopedia stats={stats || player.stats} onClose={() => handleClose('isEncyclopediaOpen')} /></Overlay>}
      {ui.isRefineryOpen && <Overlay key="refinery" onClose={() => handleClose('isRefineryOpen')}><RefineryWindow stats={stats || player.stats} onClose={() => handleClose('isRefineryOpen')} onStartSmelting={handleStartSmelting} onCollectSmelting={handleCollectSmelting} /></Overlay>}
      {ui.isSettingsOpen && <Overlay key="settings" onClose={() => handleClose('isSettingsOpen')}><Settings onClose={() => handleClose('isSettingsOpen')} onReset={handleResetGame} onRegenerateWorld={handleRegenerateWorld} onExport={handleExportSave} onImport={() => {
        const code = prompt('Enter save code:');
        if (code) handleImportSave(code);
      }} /></Overlay>}
      {world.ui.isLaboratoryOpen && <Overlay key="laboratory" onClose={() => handleClose('isLaboratoryOpen')}><Laboratory stats={stats || player.stats} onUnlockResearch={handleUnlockResearch} onClose={() => handleClose('isLaboratoryOpen')} /></Overlay>}
      {world.ui.isGuideOpen && <Overlay key="guide" onClose={() => handleClose('isGuideOpen')}><GuideWindow onClose={() => handleClose('isGuideOpen')} /></Overlay>}
      
      {/* Death Overlay */}
      {(stats?.hp || player.stats.hp) <= 0 && (
        <div className="absolute inset-0 z-100 flex flex-col items-center justify-center bg-red-950/60 backdrop-blur-xl animate-in fade-in duration-700">
           <div className="text-center space-y-8 p-12 bg-zinc-950/80 border-2 border-red-500/50 rounded-3xl shadow-2xl shadow-red-900/40 max-w-md w-full">
              <div className="space-y-2">
                <h2 className="text-5xl font-black text-red-500 tracking-tighter uppercase italic drop-shadow-sm">
                  Driller Down
                </h2>
                <p className="text-zinc-400 font-medium tracking-widest text-xs uppercase">
                  Structural integrity compromised
                </p>
              </div>
              
              <div className="py-4">
                <div className="text-4xl font-mono text-zinc-500">
                  DEPTH: <span className="text-white">{(stats?.depth || player.stats.depth)}m</span>
                </div>
              </div>

              <button 
                onClick={handleRespawn}
                className="w-full py-4 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black rounded-xl transition-all shadow-lg shadow-red-900/20 uppercase tracking-widest text-sm"
              >
                Request Respawn
              </button>
           </div>
        </div>
      )}
      {/* Debug Info (Phase 5) */}
      <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs font-mono z-100 border border-white/20 select-none pointer-events-all">
        <div>Visible Entities: {snapshots.current[0]?.data[0] || 0}</div>
        <div className="text-zinc-400 mt-1">Press [P] for 5,000 Monsters</div>
      </div>
    </div>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-2 sm:p-6 lg:p-12 bg-zinc-950/40 backdrop-blur-md animate-in fade-in duration-500 pointer-events-auto">
      <div className="w-full max-w-[1280px] h-full lg:h-auto lg:aspect-video max-h-[95vh] lg:max-h-[85vh] relative pointer-events-auto flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
