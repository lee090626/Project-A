import * as PIXI from 'pixi.js';
import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { ID_TO_TILE_TYPE } from '@/shared/types/game';
import { MINERALS } from '@/shared/config/mineralData';
import { ARTIFACT_DATA } from '@/shared/config/artifactData';
import { getSafeTexture } from '@/shared/lib/assetUtils';

// ============================================================
// 내부 스프라이트 풀 (모듈 레벨 캐시)
// ============================================================

/** 파티클 Graphics 풀 (재활용) */
const particleSpritePool: PIXI.Graphics[] = [];
/** 현재 활성화된 파티클 → Graphics 매핑 */
const activeParticleSprites = new Map<object, PIXI.Graphics>();

/** 플로팅 텍스트 풀 (재활용) */
const textSpritePool: PIXI.Text[] = [];
/** 현재 활성화된 플로팅 텍스트 → Text 매핑 */
const activeTextSprites = new Map<object, PIXI.Text>();

/** 드롭 아이템 스프라이트 맵 (generation-based ID → Sprite) */
const itemSpriteMap = new Map<number, PIXI.Sprite>();

// ============================================================
// EffectRenderer
// ============================================================

/**
 * [렌더러] 파티클, 플로팅 텍스트, 드롭 아이템을 전담하는 서브 렌더러입니다.
 *
 * 주요 책임:
 * - 파티클(ObjectPool) → PIXI.Graphics 풀 매핑 및 갱신
 * - 플로팅 텍스트(ObjectPool) → PIXI.Text 풀 매핑, 스타일(크리티컬/골드/블록/기본) 적용
 * - 드롭 아이템(DroppedItemManager) → Sprite 생성 및 비활성 시 정리
 *
 * 호출 주체: `renderSystem.ts` 오케스트레이터
 *
 * @param world - 현재 게임 월드 상태
 * @param effectLayer - 이펙트 전용 PIXI 컨테이너
 * @param textures - 로드된 텍스처 맵
 */
export function renderEffects(
  world: GameWorld,
  effectLayer: PIXI.Container,
  textures: { [key: string]: PIXI.Texture },
): void {
  _updateParticles(world, effectLayer);
  _updateFloatingTexts(world, effectLayer);
  _updateDroppedItems(world, effectLayer, textures);
}

// ─── 파티클 ──────────────────────────────────────────────────

/**
 * ObjectPool의 파티클 데이터를 PIXI.Graphics 스프라이트에 동기화합니다.
 * 비활성 파티클의 Graphics는 풀에 반환(재활용)합니다.
 */
function _updateParticles(world: GameWorld, effectLayer: PIXI.Container): void {
  const pPool = world.particlePool.getPool();

  for (let i = 0; i < pPool.length; i++) {
    const p = pPool[i];
    let sprite = activeParticleSprites.get(p);

    if (p.active) {
      if (!sprite) {
        sprite = particleSpritePool.pop() ?? new PIXI.Graphics();
        effectLayer.addChild(sprite);
        activeParticleSprites.set(p, sprite);
      }
      sprite.clear();
      sprite.fill({ color: p.color, alpha: p.life });
      sprite.rect(0, 0, p.size, p.size);
      sprite.position.set(p.x, p.y);
    } else if (sprite) {
      effectLayer.removeChild(sprite);
      particleSpritePool.push(sprite);
      activeParticleSprites.delete(p);
    }
  }
}

// ─── 플로팅 텍스트 ────────────────────────────────────────────

/**
 * 플로팅 텍스트의 타입(크리티컬/골드/블록/기본)에 따른 스타일 프리셋입니다.
 */
const FLOAT_TEXT_STYLES = {
  crit: {
    fill: 0xf87171,
    fontSize: 28,
    stroke: { color: 0x000000, width: 4 },
    dropShadow: { alpha: 0.6, blur: 5, color: 0x000000, distance: 4, angle: Math.PI / 6 },
  },
  gold: {
    fill: 0xfacc15,
    fontSize: 20,
    stroke: { color: 0x422006, width: 3 },
    dropShadow: { alpha: 0.4, blur: 3, color: 0x000000, distance: 2, angle: Math.PI / 6 },
  },
  block: {
    fill: 0x3b82f6,
    fontSize: 22,
    stroke: { color: 0x1e3a8a, width: 3 },
    dropShadow: { alpha: 0.3, blur: 2, color: 0x000000, distance: 2, angle: Math.PI / 6 },
  },
  default: {
    fill: 0xffffff,
    fontSize: 18,
    stroke: { color: 0x000000, width: 3 },
    dropShadow: false as const,
  },
} as const;

/**
 * ObjectPool의 플로팅 텍스트 데이터를 PIXI.Text 스프라이트에 동기화합니다.
 * 비활성 텍스트의 Text는 풀에 반환(재활용)합니다.
 */
function _updateFloatingTexts(world: GameWorld, effectLayer: PIXI.Container): void {
  const ftPool = world.floatingTextPool.getPool();

  for (let i = 0; i < ftPool.length; i++) {
    const ft = ftPool[i];
    let sprite = activeTextSprites.get(ft);

    if (ft.active) {
      const isCrit  = ft.text.includes('Crit');
      const isGold  = ft.text.includes('G') || ft.color === '#fbbf24';
      const isBlock = ft.text === 'BLOCK!';

      if (!sprite) {
        sprite = textSpritePool.pop() ?? new PIXI.Text({ text: ft.text });
        sprite.style.fontFamily  = 'Geist, Arial, sans-serif';
        sprite.style.fontWeight  = '900';
        sprite.style.align       = 'center';
        sprite.anchor.set(0.5, 0.5);
        effectLayer.addChild(sprite);
        activeTextSprites.set(ft, sprite);
      }

      sprite.text = ft.text;

      // 타입에 따른 스타일 프리셋 적용
      const preset = isCrit
        ? FLOAT_TEXT_STYLES.crit
        : isGold
          ? FLOAT_TEXT_STYLES.gold
          : isBlock
            ? FLOAT_TEXT_STYLES.block
            : FLOAT_TEXT_STYLES.default;

      sprite.style.fill       = preset.fill;
      sprite.style.fontSize   = preset.fontSize;
      sprite.style.stroke     = preset.stroke;
      sprite.style.dropShadow = preset.dropShadow as any;

      // 팝(pop) 애니메이션 스케일 적용
      const popT    = 1.0 - ft.life;
      const popAmt  = Math.sin(popT * Math.PI) * 0.4;
      const scale   = (0.8 + popAmt) * (isCrit ? 1.5 : 1);

      sprite.alpha = ft.life;
      sprite.position.set(ft.x, ft.y);
      sprite.scale.set(scale);
    } else if (sprite) {
      effectLayer.removeChild(sprite);
      textSpritePool.push(sprite);
      activeTextSprites.delete(ft);
    }
  }
}

// ─── 드롭 아이템 ─────────────────────────────────────────────

/**
 * DroppedItemManager의 풀 데이터를 PIXI.Sprite에 동기화합니다.
 * 비활성화된 아이템의 Sprite를 제거하고 메모리를 해제합니다.
 */
function _updateDroppedItems(
  world: GameWorld,
  effectLayer: PIXI.Container,
  textures: { [key: string]: PIXI.Texture },
): void {
  const dp = world.droppedItemPool;
  const activeIds = new Set<number>();

  for (let i = 0; i < dp.capacity; i++) {
    if (!dp.active[i]) continue;

    const id = (dp.generation[i] << 16) | i;
    activeIds.add(id);

    let sprite = itemSpriteMap.get(id);
    if (!sprite) {
      const type    = ID_TO_TILE_TYPE[dp.typeId[i]];
      const mineral = MINERALS.find((m) => m.key === type);
      const artifact = ARTIFACT_DATA[type as keyof typeof ARTIFACT_DATA];
      const iconKey = mineral?.image || artifact?.image || `${type}_icon`;

      const texture = getSafeTexture(textures, iconKey as string, 'StoneTile');
      sprite = new PIXI.Sprite(texture);
      sprite.anchor.set(0.5, 0.5);
      const itemSize = TILE_SIZE * 0.5;
      sprite.width  = itemSize;
      sprite.height = itemSize;
      effectLayer.addChild(sprite);
      itemSpriteMap.set(id, sprite);
    }
    sprite.position.set(dp.x[i], dp.y[i]);
  }

  // 비활성 아이템 스프라이트 제거
  for (const [id, sprite] of itemSpriteMap.entries()) {
    if (!activeIds.has(id)) {
      effectLayer.removeChild(sprite);
      sprite.destroy();
      itemSpriteMap.delete(id);
    }
  }
}
