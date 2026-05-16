import { PlayerStats, Position, Inventory } from '../types/game';
import { DRILLING_SECRET_KEY } from '../config/constants';
import { MINERALS, TILE_DEFINITIONS } from '../config/mineralData';
import { EFFECT_DATA } from '../config/effectData';
import { C2_GUIDE_QUEST_ID_SET } from '../config/guideQuestData';
import { gameDB } from './db';
import { clampMainStatBonusPct } from './equipmentRefinement';
import { createInitialEquipmentState } from './masteryUtils';

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
const WAYPOINT_INTERVAL = 100;
const COLLECTIBLE_MINERAL_KEYS = new Set(MINERALS.map((m) => m.key as string));
const KNOWN_TILE_DEFINITION_KEYS = new Set(TILE_DEFINITIONS.map((m) => m.key as string));
const LEGACY_BOSS_CORE_PATTERN = /^circle_(\d+)_core$/;
const LEGACY_C3_BOSS_RELIC_ID = 'relic_beelzebub_needle';
const C3_BOSS_RELIC_ID = 'relic_cerberus_fang';
const LEGACY_C4_BOSS_RELIC_ID = 'relic_mammon_coin';
const C4_BOSS_RELIC_ID = 'relic_fafnir_hoard';
const REMOVED_UNRELEASED_RELIC_IDS = [
  'relic_satan_heart',
  'relic_belphegor_eye',
  'relic_abaddon_blade',
  'relic_leviathan_mirror',
  'relic_lucifer_ice',
] as const;

/**
 * 세이브 데이터의 웨이포인트 목록을 최대 도달 깊이에 맞춰 정규화합니다.
 * 구버전 세이브 보정은 프레임 루프가 아니라 로드 시점에 한 번만 수행합니다.
 *
 * @param stats 플레이어 스탯
 */
function normalizeUnlockedWaypoints(stats: PlayerStats): void {
  const source = Array.isArray(stats.unlockedWaypoints) ? stats.unlockedWaypoints : [0];
  const waypointSet = new Set<number>();

  for (const depth of source) {
    if (typeof depth === 'number' && Number.isFinite(depth) && depth >= 0) {
      waypointSet.add(depth);
    }
  }

  waypointSet.add(0);

  const maxDepthReached = Number.isFinite(stats.maxDepthReached)
    ? Math.max(0, stats.maxDepthReached)
    : 0;
  const maxUnlockDepth = Math.floor(maxDepthReached / WAYPOINT_INTERVAL) * WAYPOINT_INTERVAL;
  for (let depth = WAYPOINT_INTERVAL; depth <= maxUnlockDepth; depth += WAYPOINT_INTERVAL) {
    waypointSet.add(depth);
  }

  stats.unlockedWaypoints = Array.from(waypointSet).sort((a, b) => a - b);
}

/**
 * 세이브에 남아 있는 비수집 배경 타일 진행 데이터를 제거합니다.
 * 타일 정의와 수집 광물 목록이 분리되기 전 저장된 오염 데이터를 로드 시점에 정리합니다.
 *
 * @param stats 플레이어 스탯
 */
function normalizeCollectibleMineralProgress(stats: PlayerStats): void {
  if (Array.isArray(stats.discoveredMinerals)) {
    stats.discoveredMinerals = stats.discoveredMinerals.filter((key) =>
      COLLECTIBLE_MINERAL_KEYS.has(key),
    );
  } else {
    stats.discoveredMinerals = [];
  }

  if (!stats.tileMastery) {
    stats.tileMastery = {};
    return;
  }

  Object.keys(stats.tileMastery).forEach((key) => {
    if (!COLLECTIBLE_MINERAL_KEYS.has(key)) {
      delete stats.tileMastery[key];
    }
  });
}

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
 * Effect 데이터의 maxStack 설정에 맞춰 기존 세이브의 초과 중첩을 정리합니다.
 *
 * @param stats 플레이어 스탯
 */
function normalizeEffectStacks(stats: PlayerStats): void {
  if (!stats.collectionHistory) {
    stats.collectionHistory = {};
    return;
  }

  for (const [itemId, count] of Object.entries(stats.collectionHistory)) {
    const effect = EFFECT_DATA[itemId];
    if (!effect?.maxStack) continue;

    stats.collectionHistory[itemId] = Math.min(count, effect.maxStack);
  }
}

/**
 * 현재 보스 relic ID 체계로 바뀌기 전 저장된 수집 기록을 이전합니다.
 *
 * @param stats 플레이어 스탯
 */
function migrateLegacyEffectIds(stats: PlayerStats): void {
  if (!stats.collectionHistory) {
    stats.collectionHistory = {};
    return;
  }

  const legacyC3BossRelicCount = stats.collectionHistory[LEGACY_C3_BOSS_RELIC_ID];
  if (typeof legacyC3BossRelicCount === 'number' && legacyC3BossRelicCount > 0) {
    stats.collectionHistory[C3_BOSS_RELIC_ID] =
      (stats.collectionHistory[C3_BOSS_RELIC_ID] || 0) + legacyC3BossRelicCount;
  }
  delete stats.collectionHistory[LEGACY_C3_BOSS_RELIC_ID];

  const legacyC4BossRelicCount = stats.collectionHistory[LEGACY_C4_BOSS_RELIC_ID];
  if (typeof legacyC4BossRelicCount === 'number' && legacyC4BossRelicCount > 0) {
    stats.collectionHistory[C4_BOSS_RELIC_ID] =
      (stats.collectionHistory[C4_BOSS_RELIC_ID] || 0) + legacyC4BossRelicCount;
  }
  delete stats.collectionHistory[LEGACY_C4_BOSS_RELIC_ID];

  for (const relicId of REMOVED_UNRELEASED_RELIC_IDS) {
    delete stats.collectionHistory[relicId];
  }
}

/**
 * 구버전 보스 코어 기록을 보스 클리어 진행도 필드로 이전합니다.
 *
 * @param stats 플레이어 스탯
 */
function normalizeClearedCircleIds(stats: PlayerStats): void {
  const clearedCircleIds = new Set<number>();
  const existingIds = Array.isArray(stats.clearedCircleIds) ? stats.clearedCircleIds : [];

  for (const circleId of existingIds) {
    if (typeof circleId === 'number' && Number.isFinite(circleId) && circleId > 0) {
      clearedCircleIds.add(Math.floor(circleId));
    }
  }

  const legacyCoreItems = Array.isArray(stats.artifacts) ? stats.artifacts : [];
  for (const itemId of legacyCoreItems) {
    if (typeof itemId !== 'string') continue;

    const match = itemId.match(LEGACY_BOSS_CORE_PATTERN);
    if (match) {
      clearedCircleIds.add(Number(match[1]));
    }
  }

  if (typeof stats.equippedArtifactId === 'string') {
    const match = stats.equippedArtifactId.match(LEGACY_BOSS_CORE_PATTERN);
    if (match) {
      clearedCircleIds.add(Number(match[1]));
    }
  }

  stats.clearedCircleIds = Array.from(clearedCircleIds).sort((a, b) => a - b);
  delete stats.artifacts;
  delete stats.equippedArtifactId;
  delete stats.artifactCooldowns;
}

/**
 * 저장된 가이드 퀘스트 상태의 배열/객체 형태를 보정합니다.
 *
 * @param stats 플레이어 스탯
 */
function normalizeGuideQuest(stats: PlayerStats): void {
  if (!stats.guideQuest) return;

  const guideQuest = stats.guideQuest;
  guideQuest.completedIds = Array.isArray(guideQuest.completedIds)
    ? guideQuest.completedIds.filter((id) => C2_GUIDE_QUEST_ID_SET.has(id))
    : [];
  guideQuest.claimedRewardIds = Array.isArray(guideQuest.claimedRewardIds)
    ? guideQuest.claimedRewardIds.filter((id) => C2_GUIDE_QUEST_ID_SET.has(id))
    : [];
  guideQuest.counters =
    guideQuest.counters && typeof guideQuest.counters === 'object' ? guideQuest.counters : {};
  guideQuest.observed =
    guideQuest.observed && typeof guideQuest.observed === 'object' ? guideQuest.observed : {};

  if (guideQuest.activeId && !C2_GUIDE_QUEST_ID_SET.has(guideQuest.activeId)) {
    guideQuest.activeId = null;
  }
}

/**
 * 구버전 장비 숙련도 상태를 현재 장비 재련 상태로 보정합니다.
 *
 * @param stats 플레이어 스탯
 */
function normalizeEquipmentStates(stats: PlayerStats): void {
  if (!stats.equipmentStates || typeof stats.equipmentStates !== 'object') {
    stats.equipmentStates = {};
  }

  if (!Array.isArray(stats.ownedEquipmentIds)) {
    stats.ownedEquipmentIds = Array.isArray(stats.ownedDrillIds) ? stats.ownedDrillIds : [];
  }

  const equipmentIds = new Set<string>(stats.ownedEquipmentIds);
  Object.values(stats.equipment || {}).forEach((equipmentId) => {
    if (typeof equipmentId === 'string') {
      equipmentIds.add(equipmentId);
    }
  });

  equipmentIds.forEach((equipmentId) => {
    const existing = stats.equipmentStates[equipmentId];
    if (!existing || typeof existing !== 'object') {
      stats.equipmentStates[equipmentId] = createInitialEquipmentState(equipmentId);
      return;
    }

    stats.equipmentStates[equipmentId] = {
      id: typeof existing.id === 'string' ? existing.id : equipmentId,
      exp: typeof existing.exp === 'number' && Number.isFinite(existing.exp) ? existing.exp : 0,
      level:
        typeof existing.level === 'number' && Number.isFinite(existing.level) ? existing.level : 1,
      mainStatBonusPct: clampMainStatBonusPct(existing.mainStatBonusPct),
    };
  });
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
        if (!s.killedMonsterIds) s.killedMonsterIds = [];
        if (!s.refinerySlots) s.refinerySlots = 1;
        if (!s.activeSmeltingJobs) s.activeSmeltingJobs = [];
        if (!s.tileMastery) s.tileMastery = {};
        if (!s.unlockedMasteryPerks) s.unlockedMasteryPerks = [];
        if (!s.collectionHistory) s.collectionHistory = {};
        if (typeof s.spawnRulesVersion !== 'number') s.spawnRulesVersion = 0;
        normalizeUnlockedWaypoints(s as PlayerStats);
        normalizeCollectibleMineralProgress(s as PlayerStats);
        normalizeClearedCircleIds(s as PlayerStats);
        migrateLegacyEffectIds(s as PlayerStats);
        normalizeEffectStacks(s as PlayerStats);
        normalizeGuideQuest(s as PlayerStats);
        normalizeEquipmentStates(s as PlayerStats);

        // 인벤토리 누락 아이템 보정 및 레거시 데이터 마이그레이션
        const oldInv = (s.inventory || {}) as any;
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

          if (COLLECTIBLE_MINERAL_KEYS.has(key)) {
            (s.inventory as any)[key] = oldInv[key];
          } else if (KNOWN_TILE_DEFINITION_KEYS.has(key)) {
            // stone, gluttony_stone 같은 배경 타일 잔여 데이터는 보상 없이 제거합니다.
            continue;
          } else if (typeof oldInv[key] === 'number' && oldInv[key] > 0) {
            // 더 이상 정의되지 않는 구형 광물은 1개당 10G로 환산
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
