import * as PIXI from 'pixi.js';

/**
 * 텍스처 및 스프라이트 시트(아틀라스) 파싱 로직을 담당하는 클래스입니다.
 */
export class AssetParser {
  /**
   * 전송받은 아틀라스 바이너리 데이터를 파싱하여 텍스처 맵을 구성합니다.
   */
  public static async parseAtlasData(atlasData: any[], texturesRef: { [key: string]: PIXI.Texture }) {
    for (const atlas of atlasData) {
      const { json, bitmap } = atlas;
      const baseTexture = PIXI.Texture.from(bitmap as any);

      const spritesheet = new PIXI.Spritesheet(baseTexture, json);
      await spritesheet.parse();

      for (const [name, texture] of Object.entries(spritesheet.textures)) {
        // 원본 파일명 그대로 등록 (PascalCase 유지)
        texturesRef[name] = texture;

        // 확장자만 제거한 키로도 등록
        const cleanName = name.replace(/\.(png|webp)$/i, '');
        texturesRef[cleanName] = texture;

        if (name === 'Player.png') texturesRef['player'] = texture;
        if (name === 'BaseTileset.png') {
          texturesRef['tileset'] = texture;
          texturesRef['baseTileset'] = texture;

          const TILE_SIZE_RAW = 128;
          const COLUMNS = 5;
          const rows = Math.floor(texture.height / TILE_SIZE_RAW);

          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < COLUMNS; col++) {
              const id = row * COLUMNS + col;
              texturesRef[`tile_base_${id}`] = new PIXI.Texture({
                source: texture.source,
                frame: new PIXI.Rectangle(
                  texture.frame.x + col * TILE_SIZE_RAW,
                  texture.frame.y + row * TILE_SIZE_RAW,
                  TILE_SIZE_RAW,
                  TILE_SIZE_RAW,
                ),
              });
            }
          }
        }
      }
    }
  }
}
