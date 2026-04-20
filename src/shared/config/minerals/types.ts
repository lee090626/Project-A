import { TileType } from '../../types/game';
import { AtlasIconName } from '../atlasMap';

/**
 * 게임 내 광물(Mineral) 데이터 정의 인터페이스입니다.
 */
export interface MineralDefinition {
  key: TileType;
  name: string;
  nameKo: string;
  icon: string;
  description: string;
  descriptionKo: string;
  color: string;
  minDepth: number;
  basePrice: number;
  baseHealth: number;
  defense: number;
  image?: AtlasIconName | null | any;
  tileImage?: AtlasIconName | null | any;
}
