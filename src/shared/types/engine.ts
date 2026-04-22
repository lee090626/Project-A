import * as PIXI from 'pixi.js';

/**
 * 게임 엔진에서 사용하는 Pixi 레이어 구조체
 */
export interface GameLayers {
  stage: PIXI.Container;
  tileLayer: PIXI.Container;
  staticLayer: PIXI.Container;
  entityLayer: PIXI.Container;
  effectLayer: PIXI.Container;
  uiLayer: PIXI.Container;
  lightLayer: PIXI.Container;
}

/**
 * 텍스처 레지스트리 타입
 */
export interface TextureRegistry {
  [key: string]: PIXI.Texture;
}
