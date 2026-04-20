import * as PIXI from 'pixi.js';
import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { updatePlayerRenderer } from './renderers/entityPlayer';
import { updateMobRenderer } from './renderers/entityMob';
import { updateProjectileRenderer } from './renderers/entityProjectile';

/**
 * 엔티티별 Pixi 컨테이너 캐시 (ID -> Container)
 */
const entityContainerMap = new Map<string, PIXI.Container>();
const staticContainerMap = new Map<string, PIXI.Container>();

/**
 * 엔티티 컨테이너 풀 (객체 재사용)
 */
const entityPool: PIXI.Container[] = [];

/**
 * 모든 시각적 요소를 렌더링하는 메인 엔트리 포인트입니다.
 */
export const renderEntities = (
  world: GameWorld,
  layers: { staticLayer: PIXI.Container; entityLayer: PIXI.Container; effectLayer: PIXI.Container },
  now: number,
  textures: { [key: string]: PIXI.Texture },
) => {
  const { entities, player } = world;
  const { staticLayer, entityLayer } = layers;
  const { soa } = entities;

  // 1. 플레이어 렌더링
  let playerContainer = entityContainerMap.get('player');
  if (!playerContainer) {
    playerContainer = createEntityContainer(
      { type: 'player', width: 1, height: 1 },
      textures,
      'player',
    );
    entityLayer.addChild(playerContainer);
    entityContainerMap.set('player', playerContainer);
  }
  updatePlayerRenderer(world, player, playerContainer, now);

  // 2. SoA 엔티티 렌더링 (Culling & Pool 관리)
  const visibleIndices = world.spatialHash.query(
    player.visualPos.x * TILE_SIZE,
    player.visualPos.y * TILE_SIZE,
    1200,
  );

  const monsterStartIndex = 1;
  while (entityLayer.children.length - monsterStartIndex < visibleIndices.length) {
    const container =
      entityPool.pop() || createEntityContainer({ type: 'monster', width: 1, height: 1 }, textures);
    container.alpha = 0;
    entityLayer.addChild(container);
  }
  while (entityLayer.children.length - monsterStartIndex > visibleIndices.length) {
    const container = entityLayer.removeChildAt(entityLayer.children.length - 1) as PIXI.Container;
    container.visible = false;
    entityPool.push(container);
  }

  for (let i = 0; i < visibleIndices.length; i++) {
    const idx = visibleIndices[i];
    const container = entityLayer.getChildAt(i + monsterStartIndex) as PIXI.Container;
    container.visible = true;
    updateEntitySpriteFromSoA(idx, soa, player, container, now, textures);
  }

  // 3. 정적 NPC 및 오브젝트 렌더링
  if (world.staticEntities) {
    for (let i = 0; i < world.staticEntities.length; i++) {
      const staticEntity = world.staticEntities[i];
      let staticContainer = staticContainerMap.get(staticEntity.id);
      if (!staticContainer) {
        staticContainer = createEntityContainer(staticEntity, textures);
        staticLayer.addChild(staticContainer);
        staticContainerMap.set(staticEntity.id, staticContainer);
      }
      // 정적 엔티티는 플레이어 렌더러의 정적 모드를 재사용하거나 단순 위치 업데이트
      staticContainer.x = staticEntity.x * TILE_SIZE;
      staticContainer.y = staticEntity.y * TILE_SIZE;
    }
  }
};

/**
 * 엔티티 타입에 따라 전용 렌더러로 라우팅합니다.
 */
function updateEntitySpriteFromSoA(
  idx: number,
  soa: any,
  player: any,
  container: PIXI.Container,
  now: number,
  textures: any,
) {
  const type = soa.type[idx];

  if (type === 5) {
    // Projectile
    updateProjectileRenderer(idx, soa, container, textures);
  } else {
    // Monster, Boss
    updateMobRenderer(idx, soa, player, container, now, textures);
  }
}

import { createEntityFactory as createEntityContainer } from './renderers/factory';


