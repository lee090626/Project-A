import { PlayerStats, Position, Inventory } from '../types/game';
import { DRILLING_SECRET_KEY } from '../config/constants';
import { MINERALS } from '../config/mineralData';
import { gameDB } from './db';

/**
 * 저장될 게임 데이터의 규격을 정의합니다.
 */
export interface SaveData {
  /** 데이터 버전 (호환성 체크용) */
  version: number;
  /** 저장된 시간 타임스탬프 */
  timestamp: number;
  /** 플레이어 스탯 정보 */
  stats: PlayerStats;
  /** 플레이어 현재 위치 */
  position: Position;
  /** (Legacy) 구버전 호환용 타일 맵 데이터 */
  tileMap?: Record<string, [number, number]>;
  /** (New) Buffer를 Base64로 인코딩한 타일 맵 데이터 */
  tileMapData?: string;
  /** (Memory) 저장 직전 워커로부터 전달받는 버퍼 (저장 전 인코딩용, 실제 디스크에는 기록불가) */
  tileMapBuffer?: Uint32Array;
}

const SAVE_KEY = 'drilling-game-save';

/**
 * 브라우저 로컬 저장소에 저장하기 전 데이터를 난독화합니다.
 * 비트 연산(XOR)과 Base64 인코딩을 조합하여 텍스트를 변조합니다.
 * @param jsonStr 저장할 JSON 문자열
 * @returns 난독화된 문자열
 */
function obfuscate(jsonStr: string): string {
  const key = DRILLING_SECRET_KEY;
  let obfuscated = '';
  for (let i = 0; i < jsonStr.length; i++) {
    const charCode = jsonStr.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    obfuscated += String.fromCharCode(charCode);
  }

  try {
    // 유니코드 안전한 Base64 인코딩 패턴
    return btoa(unescape(encodeURIComponent(obfuscated)));
  } catch (e) {
    return btoa(obfuscated);
  }
}

/**
 * 난독화된 저장 데이터를 다시 읽기 가능한 JSON 문자열로 복구합니다.
 * @param encoded 난독화된 Base64 문자열
 * @returns 복구된 원본 JSON 문자열
 */
function deobfuscate(encoded: string): string {
  const key = DRILLING_SECRET_KEY;
  let decoded = '';
  try {
    decoded = decodeURIComponent(escape(atob(encoded)));
  } catch (e) {
    decoded = atob(encoded);
  }

  let deobfuscated = '';
  for (let i = 0; i < decoded.length; i++) {
    const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    deobfuscated += String.fromCharCode(charCode);
  }
  return deobfuscated;
}

/**
 * 로컬 저장소와 세이브 데이터의 입출력을 관리하는 유틸리티입니다.
 */
export const saveManager = {
  /**
   * 새로운 데이터를 저장합니다.
   * - 스탯/위치: LocalStorage (JSON)
   * - 타일맵: IndexedDB를 통해 바이너리로 저장 (IndexedDB 공: Base64 폴백)
   * @param data 저장할 세이브 데이터 객체
   */
  save(data: SaveData) {
    try {
      // 타일맵 버퍼 IndexedDB에 저장 (비동기, 폴백 시 LocalStorage에 Base64로 저장)
      if (data.tileMapBuffer) {
        const buffer = data.tileMapBuffer.buffer as ArrayBuffer;
        if (gameDB.isAvailable) {
          // IndexedDB: 바이너리 그대로 저장
          gameDB.saveTileMap(buffer);
          delete data.tileMapData; // 이전 Base64 데이터 활성화 안 됨
        } else {
          // 폴백: 기존 Base64 방식
          const bytes = new Uint8Array(buffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          data.tileMapData = btoa(binary);
        }
        delete data.tileMapBuffer;
      }

      // 스탯/위치는 LocalStorage에 JSON으로 저장 (기존 방식 유지하되 타일맵 제외하다 훨씬 가볈)
      const statsOnly = {
        version: data.version,
        timestamp: data.timestamp,
        stats: data.stats,
        position: data.position,
        // IndexedDB 가용 시 tileMapData를 포함하지 않음
        ...(gameDB.isAvailable ? {} : { tileMapData: data.tileMapData }),
      };
      const json = JSON.stringify(statsOnly);
      const obfuscatedStr = obfuscate(json);
      localStorage.setItem(SAVE_KEY, obfuscatedStr);
    } catch (e) {
      console.error('게임 저장 실패:', e);
    }
  },

  /**
   * 로컬 저장소에서 데이터를 불러옵니다.
   * @returns 불러온 데이터 객체 또는 데이터가 없을 시 null
   */
  load(): SaveData | null {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (!saved) return null;
      const json = deobfuscate(saved);
      const data = JSON.parse(json);

      // 구 버전 데이터와의 호환성을 위한 패치 로직
      if (data.stats) {
        const s = data.stats;
        if (!s.equipmentStates) s.equipmentStates = {};
        if (!s.unlockedResearchIds) s.unlockedResearchIds = ['root'];
        if (!s.killedMonsterIds) s.killedMonsterIds = [];
        if (s.artifacts === undefined) s.artifacts = [];
        if (s.equippedArtifactId === undefined) s.equippedArtifactId = null;
        if (!s.artifactCooldowns) s.artifactCooldowns = {};
        if (!s.refinerySlots) s.refinerySlots = 1;
        if (!s.activeSmeltingJobs) s.activeSmeltingJobs = [];
        if (!s.inventoryRunes) s.inventoryRunes = [];
        if (!s.tileMastery) s.tileMastery = {};
        if (!s.unlockedMasteryPerks) s.unlockedMasteryPerks = [];
        if (!s.collectionHistory) s.collectionHistory = {};
        if (typeof s.spawnRulesVersion !== 'number') s.spawnRulesVersion = 0;
        if (!Array.isArray(s.unlockedWaypoints)) {
          s.unlockedWaypoints = [0];
        }
        if (!s.unlockedWaypoints.includes(0)) {
          s.unlockedWaypoints.push(0);
        }
        const validWaypoints = s.unlockedWaypoints.filter(
          (depth: unknown): depth is number =>
            typeof depth === 'number' && Number.isFinite(depth) && depth >= 0,
        );
        s.unlockedWaypoints = Array.from(new Set<number>(validWaypoints)).sort((a, b) => a - b);

        // 인벤토리 누락 아이템 보정 및 레거시 데이터 마이그레이션
        if (s.inventory) {
          const validMineralKeys: Set<string> = new Set(MINERALS.map((m) => m.key as string));
          const oldInv = s.inventory as any;
          s.inventory = {} as Inventory;

          let compensationGold = 0;
          for (const key of Object.keys(oldInv)) {
            // 명시적 마이그레이션: veinstone -> crimsonstone
            if (key === 'veinstone') {
              (s.inventory as any).crimsonstone =
                ((s.inventory as any).crimsonstone || 0) + oldInv[key];
              console.log(`[SaveManager] migrated 'veinstone' to 'crimsonstone'`);
              continue;
            }

            if (validMineralKeys.has(key)) {
              (s.inventory as any)[key] = oldInv[key];
            } else if (typeof oldInv[key] === 'number' && oldInv[key] > 0) {
              // 사용되지 않는 구형 광물(dirt, stone 등)은 1개당 10G로 환산
              compensationGold += oldInv[key] * 10;
            }
          }

          if (compensationGold > 0) {
            s.goldCoins = (s.goldCoins || 0) + compensationGold;
            console.log(`[SaveManager] Legacy items converted to ${compensationGold} Gold Coins.`);
          }

          // 신규 광물 초기화
          MINERALS.forEach((m) => {
            if ((s.inventory as any)[m.key] === undefined) {
              (s.inventory as any)[m.key] = 0;
            }
          });
        }
      }

      return data;
    } catch (e) {
      console.error('게임 로드 실패:', e);
      return null;
    }
  },

  /**
   * 저장된 모든 데이터를 삭제합니다. (초기화용)
   */
  clear() {
    localStorage.removeItem(SAVE_KEY);
    if (gameDB.isAvailable) {
      gameDB.clearTileMap();
    }
  },

  /**
   * [1회성 실행] LocalStorage의 레거시 tileMapData(Base64)를
   * IndexedDB 바이너리로 안전하게 이사합니다.
   *
   * 쳋변: 복사 -> 검증 -> 삭제 철칙을 엄격히 준수합니다.
   * 검증 실패 시 IndexedDB 데이터를 삭제하고 LocalStorage 원본을 유지합니다.
   *
   * @param tileMapDataBase64 LocalStorage에서 받은 Base64 타일맵 문자열
   */
  async migrateTileMapToIndexedDB(tileMapDataBase64: string): Promise<void> {
    if (!gameDB.isAvailable) return;

    try {
      // 1. Base64 데코딩 후 ArrayBuffer로 변환
      const binary = atob(tileMapDataBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const buffer = bytes.buffer;

      // 2. IndexedDB에 복사
      await gameDB.saveTileMap(buffer);

      // 3. 검증: IndexedDB에서 다시 불러와 크기 확인
      const loaded = await gameDB.loadTileMap();
      if (!loaded || loaded.byteLength !== buffer.byteLength) {
        throw new Error(`검증 실패: 예상 ${buffer.byteLength}bytes, 실제 ${loaded?.byteLength ?? 0}bytes`);
      }

      // 4. 검증 성공 시에만 LocalStorage의 tileMapData 제거
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const json = deobfuscate(saved);
        const data = JSON.parse(json);
        delete data.tileMapData;
        delete data.tileMap;
        localStorage.setItem(SAVE_KEY, obfuscate(JSON.stringify(data)));
      }

      console.log('[SaveManager] 타일맵 IndexedDB 마이그레이션 완료.');
    } catch (e) {
      // 5. 실패 시 롤백: IndexedDB 데이터 삭제, LocalStorage 원본 유지
      console.warn('[SaveManager] 마이그레이션 실패. LocalStorage 원본 유지.', e);
      await gameDB.clearTileMap();
    }
  },

  /**
   * 세이브 코드를 추출하여 외부로 내보냅니다.
   * @param data 내보낼 데이터
   * @returns 난독화된 세이브 문자열
   */
  export(data: SaveData): string {
    // Buffer가 존재할 경우 Base64 문자열로 인코딩하여 외부용 텍스트 코드로 만듦
    if (data.tileMapBuffer) {
      const bytes = new Uint8Array(data.tileMapBuffer.buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      data.tileMapData = btoa(binary);
      delete data.tileMapBuffer;
    }
    return obfuscate(JSON.stringify(data));
  },

  /**
   * 외부에서 제공받은 세이브 코드를 데이터 객체로 변환합니다.
   * @param obfuscatedStr 세이브 문자열 (코드)
   * @returns 변환된 데이터 또는 실패 시 null
   */
  import(obfuscatedStr: string): SaveData | null {
    try {
      const json = deobfuscate(obfuscatedStr);
      return JSON.parse(json);
    } catch (e) {
      console.error('세이브 데이터 임포트 실패:', e);
      return null;
    }
  },
};
