import * as PIXI from 'pixi.js';
import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE, BASE_DEPTH } from '@/shared/config/constants';
import { MINERALS } from '@/shared/config/mineralData';
import { getSafeTexture } from '@/shared/lib/assetUtils';

// ============================================================
// 내부 스프라이트 풀 (모듈 레벨 캐시)
// ============================================================

/**
 * 현재 화면에 표시 중인 타일 스프라이트 캐시입니다.
 * 키 형식: `"{x},{y}_{textureKey}"`
 */
const tileSpriteCache = new Map<string, PIXI.Sprite>();

/**
 * 재사용 대기 중인 타일 스프라이트 풀입니다.
 * 뷰포트 밖으로 나간 스프라이트를 파괴하지 않고 이 풀에 반환하여
 * 가비지 컬렉션 압박을 최소화합니다.
 */
const tilePool: PIXI.Sprite[] = [];

// ============================================================
// TileRenderer
// ============================================================

/**
 * [렌더러] 타일 레이어 렌더링을 전담하는 서브 렌더러입니다.
 *
 * 주요 책임:
 * - 플레이어 위치 기준 뷰포트 범위(±20x, ±15y 타일) 계산
 * - 지상 베이스 캠프 타일 및 지하 광물 타일을 스프라이트 풀로 관리
 * - 뷰포트 밖으로 나간 스프라이트를 풀에 반환(재활용)
 *
 * 호출 주체: `renderSystem.ts` 오케스트레이터
 *
 * @param world - 현재 게임 월드 상태
 * @param tileLayer - 타일 전용 PIXI 컨테이너
 * @param textures - 로드된 텍스처 맵
 */
export function renderTiles(
  world: GameWorld,
  tileLayer: PIXI.Container,
  textures: { [key: string]: PIXI.Texture },
): void {
  const { player, tileMap } = world;

  // 뷰포트 범위 계산 (플레이어 기준)
  const startTileX = Math.floor(player.visualPos.x - 20);
  const endTileX   = Math.ceil(player.visualPos.x + 20);
  const startTileY = Math.floor(player.visualPos.y - 15);
  const endTileY   = Math.ceil(player.visualPos.y + 15);

  const visibleTileKeys = new Set<string>();

  for (let y = startTileY; y <= endTileY; y++) {
    for (let x = startTileX; x <= endTileX; x++) {
      let textureKey = '';
      let isBaseTile = false;

      // 1. 지상 베이스 캠프 레이아웃
      if (y >= 0 && y < BASE_DEPTH && world.baseLayout) {
        const row = world.baseLayout[y];
        if (row && x >= 0 && x < row.length) {
          const tileId = row[x];
          textureKey = `tile_base_${tileId}`;
          isBaseTile = true;
        }
      }

      // 2. 지하 광물 타일
      const tile = !isBaseTile ? tileMap.getTile(x, y) : null;
      if (!isBaseTile && (!tile || tile.type === 'empty')) continue;

      // mineralData.tileImage 우선, 없으면 StoneTile 폴백
      const renderKey = isBaseTile
        ? textureKey
        : MINERALS.find((m) => m.key === tile!.type)?.tileImage || 'StoneTile';

      const key = `${x},${y}_${renderKey}`;
      visibleTileKeys.add(key);

      if (!tileSpriteCache.has(key)) {
        // 풀에서 스프라이트를 꺼내거나 새로 생성
        const sprite = tilePool.pop() ?? new PIXI.Sprite();
        sprite.texture = getSafeTexture(textures, renderKey as string, 'StoneTile');
        sprite.width   = TILE_SIZE;
        sprite.height  = TILE_SIZE;
        sprite.position.set(x * TILE_SIZE, y * TILE_SIZE);
        sprite.visible = true;

        tileLayer.addChild(sprite);
        tileSpriteCache.set(key, sprite);
      }
    }
  }

  // 뷰포트 밖으로 나간 스프라이트를 풀에 반환
  for (const [key, sprite] of tileSpriteCache.entries()) {
    if (!visibleTileKeys.has(key)) {
      tileLayer.removeChild(sprite);
      tilePool.push(sprite);
      tileSpriteCache.delete(key);
    }
  }
}
