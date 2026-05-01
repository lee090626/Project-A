import type { CSSProperties, FC } from 'react';
import { atlasMap } from '@/shared/config/atlasMap';
import type { AtlasIconName } from '@/shared/config/atlasMap';
import { withBasePath } from '@/shared/lib/basePath';

interface AtlasSpriteProps {
  name: AtlasIconName;
  alt?: string;
  size?: number;
  className?: string;
}

/**
 * 공유 UI 레이어에서 아틀라스 이미지를 DOM 배경으로 렌더링하는 경량 컴포넌트입니다.
 */
export const AtlasSprite: FC<AtlasSpriteProps> = ({
  name,
  alt = '',
  size = 32,
  className = '',
}) => {
  const meta = atlasMap[name];
  if (!meta) {
    return (
      <div
        className={className}
        style={{ width: size, height: size, backgroundColor: '#333' }}
        aria-label={alt}
      />
    );
  }

  const { atlasIndex, x, y, width, height, atlasWidth, atlasHeight } = meta;
  const scale = size / Math.max(width, height);
  const atlasImageUrl = withBasePath(`/assets/game-atlas-${atlasIndex}.webp`);

  const containerStyle: CSSProperties = {
    width: size,
    height: size,
    overflow: 'hidden',
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const spriteStyle: CSSProperties = {
    width: width * scale,
    height: height * scale,
    backgroundImage: `url(${atlasImageUrl})`,
    backgroundPosition: `-${x * scale}px -${y * scale}px`,
    backgroundSize: `${atlasWidth * scale}px ${atlasHeight * scale}px`,
    backgroundRepeat: 'no-repeat',
    flexShrink: 0,
  };

  return (
    <div style={containerStyle} aria-label={alt} className={className}>
      <div style={spriteStyle} />
    </div>
  );
};

export default AtlasSprite;
