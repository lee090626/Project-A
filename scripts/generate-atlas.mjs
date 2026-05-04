import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { MaxRectsPacker } from 'maxrects-packer';
import sharp from 'sharp';

/**
 * 아틀라스(Atlas) 생성에 포함할 에셋들의 경로 목록입니다.
 * 각 카테고리별 PNG/WebP 파일들을 재귀적으로 찾아 포함합니다.
 */
const ASSET_SOURCES = ['src/shared/assets/**/*.{png,webp}'];

/** 결과물이 저장될 디렉토리 및 파일명의 기본 베이스입니다. */
const OUTPUT_DIR = 'public/assets';
const ATLAS_NAME = 'game-atlas';

/** 텍스처 아틀라스 한 장의 최대 크기입니다. */
const MAX_ATLAS_SIZE = 2048;

/** 스프라이트 사이의 투명 여백입니다. */
const PADDING = 2;

/** 텍스처 블리딩을 막기 위해 가장자리 픽셀을 확장하는 크기입니다. */
const EXTRUDE = 1;

/** WebP 출력 옵션입니다. */
const WEBP_OPTIONS = { quality: 90, effort: 6, lossless: false };

/** 투명 픽셀 판정에 사용하는 알파 임계값입니다. */
const ALPHA_THRESHOLD = 0;

/** 투명 배경 색상입니다. */
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

/**
 * alpha 채널을 스캔하여 실제 이미지가 차지하는 영역을 반환합니다.
 */
function findAlphaBounds(data, width, height) {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha <= ALPHA_THRESHOLD) continue;

      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }

  if (right < left || bottom < top) return null;

  return {
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1,
  };
}

/**
 * 같은 픽셀 데이터를 공유하는 스프라이트를 중복 패킹하지 않기 위한 키를 만듭니다.
 */
function createContentHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * 단일 에셋을 읽어 PixiJS spritesheet frame 생성에 필요한 정보를 구성합니다.
 */
async function loadSpriteAsset(filePath) {
  const fileName = path.basename(filePath);
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const bounds = findAlphaBounds(data, info.width, info.height);

  if (!bounds) {
    const trimmedBuffer = await sharp({
      create: {
        width: 1,
        height: 1,
        channels: 4,
        background: TRANSPARENT,
      },
    })
      .png()
      .toBuffer();

    return {
      fileName,
      key: createContentHash(trimmedBuffer),
      buffer: trimmedBuffer,
      sourceSize: { w: info.width, h: info.height },
      spriteSourceSize: { x: 0, y: 0, w: 1, h: 1 },
      width: 1,
      height: 1,
      trimmed: true,
    };
  }

  const trimmedBuffer = await sharp(filePath)
    .ensureAlpha()
    .extract(bounds)
    .png()
    .toBuffer();
  const trimmed =
    bounds.left !== 0 ||
    bounds.top !== 0 ||
    bounds.width !== info.width ||
    bounds.height !== info.height;

  return {
    fileName,
    key: createContentHash(trimmedBuffer),
    buffer: trimmedBuffer,
    sourceSize: { w: info.width, h: info.height },
    spriteSourceSize: {
      x: bounds.left,
      y: bounds.top,
      w: bounds.width,
      h: bounds.height,
    },
    width: bounds.width,
    height: bounds.height,
    trimmed,
  };
}

/**
 * 패킹할 에셋 목록을 읽고, 동일한 픽셀 데이터를 가진 스프라이트를 묶습니다.
 */
async function collectSprites() {
  const filePaths = (
    await Promise.all(ASSET_SOURCES.map((pattern) => glob(pattern)))
  )
    .flat()
    .sort();
  const spritesByKey = new Map();

  for (const filePath of filePaths) {
    const asset = await loadSpriteAsset(filePath);
    const sprite = spritesByKey.get(asset.key);

    if (sprite) {
      sprite.assets.push(asset);
      continue;
    }

    spritesByKey.set(asset.key, {
      key: asset.key,
      buffer: asset.buffer,
      width: asset.width,
      height: asset.height,
      packedWidth: asset.width + (PADDING + EXTRUDE) * 2,
      packedHeight: asset.height + (PADDING + EXTRUDE) * 2,
      assets: [asset],
    });
  }

  return {
    sourceCount: filePaths.length,
    sprites: [...spritesByKey.values()],
  };
}

/**
 * maxrects-packer에 전달할 사각형 목록을 구성합니다.
 */
function packSprites(sprites) {
  const packer = new MaxRectsPacker(MAX_ATLAS_SIZE, MAX_ATLAS_SIZE, 0, {
    smart: true,
    pot: false,
    square: false,
    allowRotation: false,
    tag: false,
    border: 0,
  });
  const rects = sprites.map((sprite) => ({
    width: sprite.packedWidth,
    height: sprite.packedHeight,
    sprite,
  }));

  packer.addArray(rects);

  for (const bin of packer.bins) {
    for (const rect of bin.rects) {
      if (!rect.oversized) continue;

      const firstAsset = rect.sprite.assets[0];
      throw new Error(
        `Atlas asset is too large for ${MAX_ATLAS_SIZE}x${MAX_ATLAS_SIZE}: ${firstAsset.fileName}`,
      );
    }
  }

  return packer.bins;
}

/**
 * 스프라이트 주변 가장자리 픽셀을 확장한 패킹용 이미지를 만듭니다.
 */
async function createExtrudedBuffer(sprite) {
  if (EXTRUDE <= 0) return sprite.buffer;

  return sharp(sprite.buffer)
    .extend({
      top: EXTRUDE,
      bottom: EXTRUDE,
      left: EXTRUDE,
      right: EXTRUDE,
      extendWith: 'copy',
    })
    .png()
    .toBuffer();
}

/**
 * PixiJS spritesheet가 읽을 수 있는 frame 메타데이터를 생성합니다.
 */
function createFrame(asset, x, y) {
  return {
    frame: {
      x,
      y,
      w: asset.width,
      h: asset.height,
    },
    rotated: false,
    trimmed: asset.trimmed,
    spriteSourceSize: asset.spriteSourceSize,
    sourceSize: asset.sourceSize,
    pivot: {
      x: 0.5,
      y: 0.5,
    },
  };
}

/**
 * 하나의 packed bin을 WebP 이미지와 PixiJS JSON으로 저장합니다.
 */
async function writeAtlasBin(bin, atlasIndex) {
  const frames = {};
  const composites = [];

  for (const rect of bin.rects) {
    const sprite = rect.sprite;
    const drawX = rect.x + PADDING;
    const drawY = rect.y + PADDING;
    const frameX = drawX + EXTRUDE;
    const frameY = drawY + EXTRUDE;

    composites.push({
      input: await createExtrudedBuffer(sprite),
      left: drawX,
      top: drawY,
    });

    for (const asset of sprite.assets) {
      frames[asset.fileName] = createFrame(asset, frameX, frameY);
    }
  }

  const atlasBaseName = `${ATLAS_NAME}-${atlasIndex}`;
  const imageBuffer = await sharp({
    create: {
      width: bin.width,
      height: bin.height,
      channels: 4,
      background: TRANSPARENT,
    },
  })
    .composite(composites)
    .webp(WEBP_OPTIONS)
    .toBuffer();
  const json = {
    frames,
    meta: {
      app: 'drilling-game atlas generator',
      version: '1.0.0',
      image: `${atlasBaseName}.png`,
      format: 'RGBA8888',
      size: {
        w: bin.width,
        h: bin.height,
      },
      scale: 1,
    },
  };

  await fs.writeFile(path.join(OUTPUT_DIR, `${atlasBaseName}.webp`), imageBuffer);
  await fs.writeFile(
    path.join(OUTPUT_DIR, `${atlasBaseName}.json`),
    JSON.stringify(json, null, 2),
  );

  console.log(`✅ 저장됨: ${atlasBaseName}.webp (${(imageBuffer.length / 1024).toFixed(1)} KB)`);
  console.log(`✅ 저장됨: ${atlasBaseName}.json`);

  return {
    fileName: `${atlasBaseName}.json`,
    size: imageBuffer.length,
  };
}

/**
 * 게임 에셋들을 하나의 아틀라스 이미지와 JSON 설정 파일로 묶어주는 메인 함수입니다.
 * PixiJS와 같은 게임 엔진에서 효율적으로 텍스처를 로드할 수 있도록 도와줍니다.
 */
async function generateAtlas() {
  console.log('🚀 아틀라스 생성을 시작합니다...');

  // 기존 파일을 덮어쓰기 때문에 사용자가 작업을 취소할 수 있도록 유도합니다.
  console.log('⚠️ [경고] public/assets 폴더의 기존 파일들이 덮어씌워집니다!');
  console.log('중요한 변경 사항이 있다면 Ctrl+C로 지금 취소하세요.');
  for (let i = 3; i > 0; i--) {
    process.stdout.write(`${i}... `);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  console.log('\n🏗️ 에셋 패킹 중...');

  const oldFiles = await glob(`${OUTPUT_DIR}/${ATLAS_NAME}-*.{json,webp}`);
  const oldManifest = path.join(OUTPUT_DIR, 'manifest.json');

  for (const file of oldFiles) {
    await fs.unlink(file).catch(() => {});
  }
  await fs.unlink(oldManifest).catch(() => {});
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const { sourceCount, sprites } = await collectSprites();

  if (sourceCount === 0) {
    console.error('❌ 패킹할 에셋 파일을 찾지 못했습니다!');
    return;
  }

  const bins = packSprites(sprites);
  const writtenFiles = [];

  for (let index = 0; index < bins.length; index++) {
    writtenFiles.push(await writeAtlasBin(bins[index], index));
  }

  const manifest = {
    atlasFiles: writtenFiles.map((file) => file.fileName).reverse(),
  };
  await fs.writeFile(path.join(OUTPUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('✅ 저장됨: manifest.json');

  const totalSize = writtenFiles.reduce((sum, file) => sum + file.size, 0);
  console.log('---');
  console.log('🎉 아틀라스 생성이 완료되었습니다!');
  console.log(`${sourceCount}개의 스프라이트를 ${writtenFiles.length}개의 아틀라스로 묶었습니다.`);
  console.log(`전체 아틀라스 용량: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
}

generateAtlas().catch((err) => {
  console.error('❌ 아틀라스 생성 중 오류 발생:', err);
  process.exitCode = 1;
});
