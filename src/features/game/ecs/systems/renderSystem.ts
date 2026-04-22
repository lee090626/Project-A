import * as PIXI from 'pixi.js';
import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE, CAMERA_SCALE } from '@/shared/config/constants';
import { renderEntities } from './entityRenderer';
import { renderTiles } from './renderers/TileRenderer';
import { renderEffects } from './renderers/EffectRenderer';
import { renderLighting } from './renderers/LightRenderer';
import { GameLayers, TextureRegistry } from '@/shared/types/engine';
import { LightingFilter } from '@/features/game/lib/LightingFilter';

/**
 * System that renders all visual elements using PixiJS.
 */
export const renderSystem = (
  world: GameWorld,
  app: PIXI.Application,
  layers: GameLayers,
  now: number,
  textures: TextureRegistry,
  lightingFilter: LightingFilter | null = null,
) => {
  const { player, tileMap, entities, assets, shake } = world;
  const { stage, tileLayer, staticLayer, entityLayer, effectLayer, lightLayer, uiLayer } = layers;

  // 1. Camera Control (centering and shake)
  const shakeX = (Math.random() - 0.5) * shake * 2;
  const shakeY = (Math.random() - 0.5) * shake * 2;

  const centerX = app.screen.width / 2;
  const centerY = app.screen.height / 2;

  stage.scale.set(CAMERA_SCALE);
  stage.position.set(
    centerX - (player.visualPos.x * TILE_SIZE + TILE_SIZE / 2) * CAMERA_SCALE + shakeX,
    centerY - (player.visualPos.y * TILE_SIZE + TILE_SIZE / 2) * CAMERA_SCALE + shakeY,
  );

  // 2. Tile Rendering
  renderTiles(world, tileLayer, textures);

  // 3. Entity Rendering (Mobs, Projectiles, etc.)
  renderEntities(world, layers, now, textures);

  // 4. Effects Rendering (Particles, Floating Texts, Dropped Items)
  renderEffects(world, effectLayer, textures);

  // 5. UI Overlays (Mining Target)
  updateMiningTarget(world, layers);

  // 6. Lighting
  renderLighting(world, stage, app.screen.width, app.screen.height, now, lightingFilter);
};



function updateMiningTarget(world: GameWorld, layers: GameLayers) {
  const { uiLayer } = layers;
  const { intent, tileMap } = world;

  let targetRect = uiLayer.getChildByLabel('miningTarget') as PIXI.Graphics;

  if (intent.miningTarget && !targetRect) {
    targetRect = new PIXI.Graphics();
    targetRect.label = 'miningTarget';
    uiLayer.addChild(targetRect);
  }

  if (intent.miningTarget) {
    const tx = intent.miningTarget.x * TILE_SIZE;
    const ty = intent.miningTarget.y * TILE_SIZE;

    targetRect.clear();

    const tile = tileMap.getTile(intent.miningTarget.x, intent.miningTarget.y);
    const hasTileHealth =
      tile &&
      tile.maxHealth > 0 &&
      tile.type !== 'empty' &&
      tile.type !== 'wall' &&
      tile.type !== 'portal';

    const entIdx = world.spatialHash.query(tx + TILE_SIZE / 2, ty + TILE_SIZE / 2, TILE_SIZE * 0.5)[0];
    const isBoss = entIdx !== undefined && world.entities.soa.type[entIdx] === 2;
    const highlightW = isBoss ? TILE_SIZE * 5 : TILE_SIZE;
    const highlightH = isBoss ? TILE_SIZE * 5 : TILE_SIZE;
    const drawX = isBoss ? world.entities.soa.x[entIdx] : tx;
    const drawY = isBoss ? world.entities.soa.y[entIdx] : ty;

    targetRect
      .rect(drawX + 1, drawY + 1, highlightW - 2, highlightH - 2)
      .fill({ color: 0xef4444, alpha: 0.15 })
      .stroke({ color: 0xef4444, width: 2, alignment: 0 });

    if (hasTileHealth) {
      const barW = TILE_SIZE - 12;
      const barH = 6;
      const barX = tx + 6;
      const barY = ty + TILE_SIZE - barH - 4;

      const ratio = Math.max(0, Math.min(1, tile.health / tile.maxHealth));

      // Healthbar background
      targetRect
        .roundRect(barX - 1, barY - 1, barW + 2, barH + 2, 2)
        .fill({ color: 0x09090b, alpha: 0.8 })
        .stroke({ color: 0xffffff, alpha: 0.3, width: 1, alignment: 0 });

      // Healthbar fill
      if (ratio > 0) {
        let hpColor = 0x10b981;
        if (ratio < 0.25) hpColor = 0xef4444;
        else if (ratio < 0.5) hpColor = 0xf59e0b;

        targetRect.roundRect(barX, barY, barW * ratio, barH, 1).fill({ color: hpColor });
      }
    }

    targetRect.visible = true;
  } else if (targetRect) {
    targetRect.visible = false;
  }
}


