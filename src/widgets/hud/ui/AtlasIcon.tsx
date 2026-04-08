import React from 'react';
const atlas = { src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/5+hHgAFgwJ/lK6ZAAAAAElFTkSuQmCC', width: 64, height: 64 };
import { atlasMap } from '@/shared/config/atlasMap';

interface Props {
  name: keyof typeof atlasMap;
  alt: string;
  size?: number; // pixel size
}

export const AtlasIcon: React.FC<Props> = ({ name, alt, size = 32 }) => {
  const { x, y, width, height } = atlasMap[name];
  const style: React.CSSProperties = {
    backgroundImage: `url(${atlas.src})`,
    backgroundPosition: `-${x}px -${y}px`,
    width: size,
    height: size,
    backgroundSize: `${atlas.width}px ${atlas.height}px`,
    backgroundRepeat: 'no-repeat',
  };
  return <div style={style} aria-label={alt} />;
};
