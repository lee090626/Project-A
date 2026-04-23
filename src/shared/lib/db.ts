const DB_NAME = 'drilling-game-db';
const DB_VERSION = 1;
const STORE_NAME = 'save-data';
const TILE_MAP_KEY = 'tileMapBuffer';

/**
 * IndexedDB를 다루기 위한 가벼운 래퍼입니다.
 *
 * IndexedDB가 사용 불가능한 환경(시크릿 모드, 구형 Safari 등)에서는
 * `isAvailable`이 false가 되어 saveManager가 기존 LocalStorage 방식으로 폴백합니다.
 * 에러를 throw하지 않으므로 어떤 환경에서도 게임이 멈추지 않습니다.
 */
class GameDB {
  /** IndexedDB 사용 가능 여부. false면 saveManager가 LocalStorage 방식으로 자동 전환합니다. */
  public isAvailable: boolean = false;

  private db: IDBDatabase | null = null;

  /**
   * IndexedDB를 초기화합니다. 앱 시작 시 1회 호출합니다.
   * 실패해도 에러를 throw하지 않고 isAvailable = false로 세팅합니다.
   */
  async init(): Promise<void> {
    if (typeof indexedDB === 'undefined') return;

    try {
      this.db = await new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };

        req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
        req.onerror = () => reject(req.error);
      });

      this.isAvailable = true;
    } catch (e) {
      console.warn('[GameDB] IndexedDB 초기화 실패. LocalStorage로 폴백합니다.', e);
      this.isAvailable = false;
    }
  }

  /**
   * 타일맵 ArrayBuffer를 IndexedDB에 직접 저장합니다.
   * 텍스트 변환 없이 바이너리 그대로 저장합니다.
   * @param buffer 타일맵 직렬화 버퍼
   */
  async saveTileMap(buffer: ArrayBuffer): Promise<void> {
    if (!this.isAvailable || !this.db) return;

    await new Promise<void>((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(buffer, TILE_MAP_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * IndexedDB에서 타일맵 ArrayBuffer를 직접 로드합니다.
   * @returns 저장된 버퍼, 없으면 null
   */
  async loadTileMap(): Promise<ArrayBuffer | null> {
    if (!this.isAvailable || !this.db) return null;

    return new Promise<ArrayBuffer | null>((resolve) => {
      const tx = this.db!.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(TILE_MAP_KEY);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  }

  /**
   * IndexedDB에서 타일맵 데이터를 삭제합니다.
   * 마이그레이션 롤백 시 사용합니다.
   */
  async clearTileMap(): Promise<void> {
    if (!this.isAvailable || !this.db) return;

    await new Promise<void>((resolve) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(TILE_MAP_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve(); // 실패해도 롤백 흐름 계속 진행
    });
  }
}

/** 전역 싱글턴 인스턴스 (메인 스레드 전용) */
export const gameDB = new GameDB();
