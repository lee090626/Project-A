import { useEffect, useRef, useCallback, useState } from 'react';
import { saveManager, SaveData } from '@/shared/lib/saveManager';
import { gameDB } from '@/shared/lib/db';
import { useGameStore } from '@/shared/lib/store';
import { ToastType } from '@/shared/types/game';
import { SendToWorker } from './types';
import {
  MainToWorkerMessage,
  WorkerMessageType,
  isMainToWorkerMessage,
  isWorkerToMainMessage,
} from '@/shared/types/worker';

let globalWorker: Worker | null = null;
const isObjectPayload = (value: unknown): value is Record<string, any> =>
  !!value && typeof value === 'object';

const isSaveDataPayload = (value: unknown): value is SaveData =>
  isObjectPayload(value) &&
  typeof value.version === 'number' &&
  typeof value.timestamp === 'number' &&
  isObjectPayload(value.stats) &&
  isObjectPayload(value.position);

export function useGameWorker(
  isClient: boolean,
  snapshots: React.MutableRefObject<{ time: number; data: Float32Array }[]>,
  setIsEngineReady: (ready: boolean) => void,
  isReadyRef: React.MutableRefObject<boolean>,
  loadAssetsAndTransfer: (
    sendToWorker: SendToWorker,
  ) => void,
  handleTravelDimension: (targetDepth: number) => void,
  handleOpenModal: (target: keyof (import('@/entities/world/model').GameWorld)['ui']) => void,
) {
  const workerRef = useRef<Worker | null>(null);

  const sendToWorker: SendToWorker = useCallback(
    (type: WorkerMessageType, payload?: any, transfer?: Transferable[]) => {
      if (globalWorker) {
        const message: MainToWorkerMessage = { type, payload } as MainToWorkerMessage;
        if (!isMainToWorkerMessage(message)) {
          console.warn('[Main] Dropping invalid outgoing worker message:', message);
          return;
        }
        globalWorker.postMessage(message, transfer || []);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;

    if (!globalWorker) {
      globalWorker = new Worker(new URL('../worker/game.worker.ts', import.meta.url));
      console.log('[Main] Worker Singleton Created.');
    }
    workerRef.current = globalWorker;

    const worker = globalWorker;
    const onMessage = (e: MessageEvent) => {
      if (!isWorkerToMainMessage(e.data)) {
        console.warn('[Main] Dropping invalid incoming worker message:', e.data);
        return;
      }
      const message = e.data;
      const type = message.type;
      const payload = 'payload' in message ? message.payload : undefined;

      if (type === 'RENDER_SYNC') {
        const view = new Float32Array(message.buffer);
        const timestamp = view[1];

        snapshots.current.push({ time: timestamp, data: view });
        if (snapshots.current.length > 2) {
          const old = snapshots.current.shift();
          if (old) {
            worker.postMessage({ type: 'RETURN_BUFFER', payload: { buffer: old.data.buffer } }, [
              old.data.buffer,
            ]);
          }
        }

        if (!isReadyRef.current) {
          setIsEngineReady(true);
        }
      } else if (type === 'SYNC_UI' && isObjectPayload(payload)) {
        // Zustand Update
        if (payload.stats) useGameStore.getState().updateStats(payload.stats);
        if (payload.ui) useGameStore.getState().updateUI(payload.ui);
        if (payload.boss) useGameStore.getState().updateBoss(payload.boss);
        else if (payload.boss === null) useGameStore.getState().updateBoss({});
      } else if (type === 'ENGINE_READY') {
        setIsEngineReady(true);
        console.log('[Main] Engine is ready to render!');
      } else if (type === 'SAVE' && isObjectPayload(payload)) {
        // Zero-Copy 흐름: 버퍼를 IndexedDB에 저장한 뒤 워커에돌려줌
        const { tileMapBuffer, ...rest } = payload;
        if (isSaveDataPayload(rest)) {
          saveManager.save(rest); // 스탯/위치 LocalStorage에 저장
        }
        if (tileMapBuffer instanceof ArrayBuffer && gameDB.isAvailable) {
          gameDB.saveTileMap(tileMapBuffer).then(() => {
            // 저장 완료 후 버퍼를 워커에게 돌려줌 (Zero-Copy 재활용)
            worker.postMessage(
              { type: 'RETURN_SAVE_BUFFER', payload: { buffer: tileMapBuffer } },
              [tileMapBuffer]
            );
          });
        } else {
          // IndexedDB 불가 시 폴백: 기존 Base64 방식
          if (isSaveDataPayload(payload)) {
            saveManager.save(payload);
          }
        }
      } else if (type === 'EXPORT_DATA') {
        if (!isSaveDataPayload(payload)) return;
        const exported = saveManager.export(payload);
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(exported);
          alert('Save code copied to clipboard!');
        }
      } else if (type === 'PORTAL_TRIGGERED') {
        if (!isObjectPayload(payload)) return;
        if (
          confirm(
            `Circle ${payload.nextCircleId}로 하강하시겠습니까?\n새로운 심연 탐험이 시작됩니다!`,
          )
        ) {
          handleTravelDimension(payload.nextDepth);
        }
      } else if (type === 'DIMENSION_TRAVEL_COMPLETE') {
        alert(`원하는 Circle에 도착했습니다!`);
      } else if (type === 'TUTORIAL_TRIGGER') {
        // 워커로부터 튜토리얼 발생 신호를 받으면 가이드 창을 엶
        handleOpenModal('isGuideOpen');
      } else if (type === 'OPEN_MODAL' && isObjectPayload(payload)) {
        // 워커에서 상호작용 성공 시 모달 오픈 신호를 보냄
        handleOpenModal(payload.target as keyof (import('@/entities/world/model').GameWorld)['ui']);
      } else if (type === 'SHOW_TOAST' && isObjectPayload(payload)) {
        // 워커로부터 토스트 알림 요청을 받음
        useGameStore.getState().addToast(
          payload.message,
          (payload.type || 'info') as ToastType,
          payload.duration,
        );
      }
    };

    worker.addEventListener('message', onMessage);

    // 에셋 로딩은 IndexedDB와 독립적으로 즉시 병렬 시작
    loadAssetsAndTransfer(sendToWorker);

    // IndexedDB 초기화 + 세이브 데이터 로드 (병렬 진행)
    const t0 = performance.now();
    gameDB.init().then(async () => {
      const saved = saveManager.load();

      let tileMapBuffer: ArrayBuffer | undefined;

      if (saved) {
        if (gameDB.isAvailable) {
          // 마이그레이션: 레거시 tileMapData가 있는 경우 IndexedDB로 이사 (1회성)
          if (saved.tileMapData) {
            await saveManager.migrateTileMapToIndexedDB(saved.tileMapData);
          }
          // IndexedDB에서 타일맵 바이너리 로드
          const buf = await gameDB.loadTileMap();
          if (buf) tileMapBuffer = buf;
        }
      }

      const elapsed = (performance.now() - t0).toFixed(1);
      console.log(`[Main] Save load complete in ${elapsed}ms (IndexedDB: ${gameDB.isAvailable})`);
      console.log('[Main] Sending INIT to worker...');

      // INIT 메시지 전송 (타일맵 버퍼가 있으면 Transferable로 전달)
      const transferables: Transferable[] = tileMapBuffer ? [tileMapBuffer] : [];
      worker.postMessage(
        {
          type: 'INIT',
          payload: {
            seed: saved?.stats.mapSeed || 12345,
            saveData: saved
              ? { ...saved, tileMapData: undefined, tileMapBuffer }
              : undefined,
          },
        },
        transferables
      );
    });

    const timeoutId = setTimeout(() => {
      if (!isReadyRef.current) {
        console.warn('[Main] Engine initialization timeout (5s). Forcing start...');
        setIsEngineReady(true);
      }
    }, 5000);

    return () => {
      // NOTE: 페이지 이동(Unmount) 시 완전한 Worker 종료를 통한 메모리 누수 방지
      worker.removeEventListener('message', onMessage);
      worker.terminate();
      globalWorker = null; // 다음 Mount 시 새 Worker가 생성되도록 초기화
      clearTimeout(timeoutId);
    };
  }, [isClient, loadAssetsAndTransfer, sendToWorker, handleTravelDimension, handleOpenModal]);

  return { sendToWorker, globalWorker };
}
