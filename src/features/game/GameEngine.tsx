'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createInitialWorld, GameWorld } from '@/entities/world/model';
import { validateAtlasManifest } from '@/shared/config/assetConfigValidation.mjs';
import { fetchBaseLayout, fetchEntities } from '@/shared/lib/dataLoader';
import { getBasePath } from '@/shared/lib/basePath';
import {
  notifyCrazyGamesGameplayStart,
  notifyCrazyGamesLoadingStart,
  notifyCrazyGamesLoadingStop,
} from '@/shared/lib/crazyGamesSdk';
import { useGameStore } from '@/shared/lib/store';

// Custom Hooks
import { useGameUI } from './hooks/useGameUI';
import { useGameActions } from './hooks/useGameActions';
import { useGameInput } from './hooks/useGameInput';
import { useGameWorker } from './hooks/useGameWorker';
import { SendToWorker } from './hooks/types';

// UI Overlay
import GameOverlay from './components/GameOverlay';

export default function GameEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<GameWorld>(createInitialWorld(12345));

  const [isClient, setIsClient] = useState(false);
  const [, setUiVersion] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [hudPosition, setHudPosition] = useState({ x: 15, y: 8 });

  const isReadyRef = useRef(false);
  useEffect(() => {
    isReadyRef.current = isEngineReady;
  }, [isEngineReady]);

  // Zustand 스토어 상태 구독
  const stats = useGameStore((state) => state.stats);
  const { screenShake } = useGameStore((state) => state.settings);

  // 트리플 버퍼링 및 보간(Lerp) 관련 Ref
  const snapshots = useRef<{ time: number; data: Float32Array }[]>([]);
  const interpolatedState = useRef({
    x: 15,
    y: 8,
    camX: 15,
    camY: 8,
    shake: 0,
    hp: 0,
  });
  const hudPositionRef = useRef(hudPosition);

  const TELEPORT_THRESHOLD = 5;

  const updateUi = useCallback(() => {
    setUiVersion((v) => v + 1);
  }, []);

  const loadAssetsAndTransfer = useCallback(async (sendWorker: SendToWorker) => {
    const basePath = getBasePath();
    const assetsPath = `${basePath}/assets`;

    try {
      notifyCrazyGamesLoadingStart();
      const manifestRes = await fetch(`${assetsPath}/manifest.json`);
      if (!manifestRes.ok) throw new Error('Failed to load atlas manifest');
      const manifest = validateAtlasManifest(await manifestRes.json());

      const atlasData: any[] = [];
      const transferList: Transferable[] = [];

      // [성능 측정] DevTools Console에서 로딩 시간 확인
      const t0 = performance.now();

      await Promise.all(
        manifest.atlasFiles.map(async (jsonFile) => {
          const webpFile = jsonFile.replace('.json', '.webp');

          // JSON + WebP 동시 fetch (직렬 → 병렬)
          const [jsonRes, webpRes] = await Promise.all([
            fetch(`${assetsPath}/${jsonFile}`),
            fetch(`${assetsPath}/${webpFile}`),
          ]);

          if (!jsonRes.ok) throw new Error(`[AssetLoad] Failed: ${jsonFile} (${jsonRes.status})`);
          if (!webpRes.ok) throw new Error(`[AssetLoad] Failed: ${webpFile} (${webpRes.status})`);

          // blob → createImageBitmap: 이중 디코딩 제거 (new Image() 불필요)
          const [jsonData, blob] = await Promise.all([jsonRes.json(), webpRes.blob()]);
          const bitmap = await createImageBitmap(blob);

          atlasData.push({ json: jsonData, bitmap });
          transferList.push(bitmap);
        }),
      );

      console.log(
        `[AssetLoad] ${atlasData.length} atlases decoded in ${(performance.now() - t0).toFixed(1)}ms`,
      );

      const [layout, entities] = await Promise.all([fetchBaseLayout(), fetchEntities()]);
      sendWorker('ASSETS_ATLAS', { atlasData, layout, entities }, transferList);
      notifyCrazyGamesLoadingStop();
      console.log(`[Main] Sent ${atlasData.length} atlases to worker.`);
    } catch (err) {
      notifyCrazyGamesLoadingStop();
      console.error('Asset transfer failed:', err);
      setIsEngineReady(true);
    }
  }, []);

  const uiActions = useGameUI(worldRef, updateUi);
  const { toggleModal, handleClose, handleOpen, isAnyModalOpen, closeAllModals } = uiActions;

  // Need to provide a throwaway `sendToWorker` for `useGameActions` initially, or properly wrap
  const [workerSender, setWorkerSender] = useState<{ send: SendToWorker }>({
    send: () => {},
  });

  const gameActions = useGameActions(worldRef, updateUi, workerSender.send);
  const { handleTravelDimension } = gameActions;

  // 1. Worker Lifecycle (Hook)
  const { sendToWorker, globalWorker } = useGameWorker(
    isClient,
    snapshots,
    setIsEngineReady,
    isReadyRef,
    loadAssetsAndTransfer,
    handleTravelDimension,
    handleOpen,
  );

  useEffect(() => {
    setWorkerSender({ send: sendToWorker });
  }, [sendToWorker]);

  useEffect(() => {
    if (!isEngineReady) return;
    notifyCrazyGamesGameplayStart();
  }, [isEngineReady]);

  // 2. Input Setup (Hook)
  useGameInput(worldRef, isAnyModalOpen, closeAllModals, handleOpen, handleClose, sendToWorker);

  // 3. Client Init & Render Loop
  useEffect(() => {
    setIsClient(true);
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });
      sendToWorker('RESIZE', { width, height });
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    let rafId: number;
    const renderLoop = () => {
      const now = performance.now();
      const snaps = snapshots.current;

      if (snaps.length >= 2) {
        const s0 = snaps[0];
        const s1 = snaps[1];

        const renderTime = now - 50;
        let alpha = (renderTime - s0.time) / (s1.time - s0.time);
        alpha = Math.max(0, Math.min(1, alpha));

        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

        const p0 = s0.data;
        const p1 = s1.data;

        const dist = Math.sqrt(Math.pow(p1[2] - p0[2], 2) + Math.pow(p1[3] - p0[3], 2));
        const finalAlpha = dist > TELEPORT_THRESHOLD ? 1 : alpha;

        const nextX = lerp(p0[2], p1[2], finalAlpha);
        const nextY = lerp(p0[3], p1[3], finalAlpha);
        const nextShake = lerp(p0[4], p1[4], finalAlpha);
        const nextHp = lerp(p0[5], p1[5], finalAlpha);

        const interpolated = interpolatedState.current;
        interpolated.x = nextX;
        interpolated.y = nextY;
        interpolated.camX = nextX;
        interpolated.camY = nextY;
        interpolated.shake = nextShake;
        interpolated.hp = nextHp;

        worldRef.current.player.visualPos.x = interpolatedState.current.x;
        worldRef.current.player.visualPos.y = interpolatedState.current.y;
        worldRef.current.shake = screenShake ? interpolatedState.current.shake : 0;

        const roundedX = Math.round(nextX);
        const roundedY = Math.round(nextY);
        const currentHudPosition = hudPositionRef.current;
        if (currentHudPosition.x !== roundedX || currentHudPosition.y !== roundedY) {
          const nextHudPosition = { x: roundedX, y: roundedY };
          hudPositionRef.current = nextHudPosition;
          setHudPosition(nextHudPosition);
        }
      }

      rafId = requestAnimationFrame(renderLoop);
    };
    rafId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
    };
  }, [screenShake, sendToWorker]);

  // 4. Offscreen Canvas Transfer
  useEffect(() => {
    if (!globalWorker || !canvasRef.current) return;

    try {
      if (!canvasRef.current.dataset.transferred) {
        const offscreen = canvasRef.current.transferControlToOffscreen();
        globalWorker.postMessage({ type: 'SET_CANVAS', payload: { offscreen } }, [offscreen]);
        console.log('[Main] Canvas control transferred.');
        canvasRef.current.dataset.transferred = 'true';
      }
    } catch (e) {
      // Ignore double transfer errors
    }
  }, [isClient, globalWorker]);

  if (!isClient) return <div className="fixed inset-0 bg-zinc-950" />;

  return (
    <div className="fixed inset-0 overflow-hidden bg-transparent">
      <canvas
        ref={canvasRef}
        width={windowSize.width}
        height={windowSize.height}
        className="w-full h-full block relative z-0 opacity-100"
      />
      <GameOverlay
        worldRef={worldRef}
        stats={stats || worldRef.current.player.stats}
        hudPosition={hudPosition}
        uiActions={uiActions}
        gameActions={gameActions}
      />
    </div>
  );
}
