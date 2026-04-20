import * as PIXI from 'pixi.js';
import { TILE_SIZE } from '@/shared/config/constants';

/**
 * 모든 엔티티의 기본 컨테이너를 생성합니다 (바디 스프라이트 포함).
 */
const createBaseContainer = (
  width: number,
  height: number,
  texture: PIXI.Texture,
  tint?: number
): { container: PIXI.Container; sprite: PIXI.Sprite } => {
  const container = new PIXI.Container();
  const sprite = new PIXI.Sprite(texture);
  
  sprite.label = 'body';
  sprite.width = width * TILE_SIZE;
  sprite.height = height * TILE_SIZE;
  if (tint !== undefined) sprite.tint = tint;
  
  container.addChild(sprite);
  return { container, sprite };
};

/**
 * 플레이어 전용 엔티티 컨테이너를 생성합니다.
 */
export const createPlayerContainer = (
  textures: { [key: string]: PIXI.Texture },
  forceTextureKey?: string
): PIXI.Container => {
  const texture = textures[forceTextureKey || 'player'] || PIXI.Texture.WHITE;
  const { container } = createBaseContainer(1, 1, texture);
  return container;
};

/**
 * 일반 몬스터 전용 엔티티 컨테이너를 생성합니다.
 */
export const createMobContainer = (
  entity: any,
  textures: { [key: string]: PIXI.Texture },
  forceTextureKey?: string
): PIXI.Container => {
  const textureKey = forceTextureKey || entity.imagePath || '';
  const texture = textures[textureKey] || PIXI.Texture.WHITE;
  const tint = !textureKey ? 0xef4444 : undefined;
  
  const { container, sprite } = createBaseContainer(entity.width || 1, entity.height || 1, texture, tint);

  // HP Bar
  const hpBar = new PIXI.Graphics();
  hpBar.label = 'hpBar';
  container.addChild(hpBar);

  // Cast Bar
  const castBar = new PIXI.Graphics();
  castBar.label = 'castBar';
  castBar.visible = false;
  container.addChild(castBar);

  return container;
};

/**
 * 보스 전용 엔티티 컨테이너를 생성합니다.
 */
export const createBossContainer = (
  entity: any,
  textures: { [key: string]: PIXI.Texture },
  forceTextureKey?: string
): PIXI.Container => {
  const container = createMobContainer(entity, textures, forceTextureKey);
  const ew = (entity.width || 1) * TILE_SIZE;

  // Name Tag
  const nameTag = new PIXI.Text({
    text: entity.name || 'Boss',
    style: {
      fontSize: 14,
      fill: 0xffffff,
      fontWeight: 'bold',
      stroke: { color: 0x000000, width: 2 },
    },
  });
  nameTag.label = 'nameTag';
  nameTag.anchor.set(0.5, 0.5);
  nameTag.position.set(ew / 2, -18);
  container.addChild(nameTag);

  return container;
};

/**
 * 투사체 전용 엔티티 컨테이너를 생성합니다.
 */
export const createProjectileContainer = (
  entity: any,
  textures: { [key: string]: PIXI.Texture },
  forceTextureKey?: string
): PIXI.Container => {
  const textureKey = forceTextureKey || entity.imagePath || '';
  const texture = textures[textureKey] || PIXI.Texture.WHITE;
  const { container } = createBaseContainer(entity.width || 1, entity.height || 1, texture);
  return container;
};

/**
 * 엔티티 타입에 따른 적절한 오케스트레이션 팩토리 함수입니다 (Entry Point).
 */
export const createEntityFactory = (
  entity: any,
  textures: { [key: string]: PIXI.Texture },
  forceTextureKey?: string
): PIXI.Container => {
  const type = entity.type || 'player';

  switch (type) {
    case 'player':
      return createPlayerContainer(textures, forceTextureKey);
    case 'boss':
      return createBossContainer(entity, textures, forceTextureKey);
    case 'projectile':
      return createProjectileContainer(entity, textures, forceTextureKey);
    case 'monster':
    default:
      return createMobContainer(entity, textures, forceTextureKey);
  }
};
