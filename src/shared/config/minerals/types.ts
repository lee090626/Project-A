import { TileType } from '../../types/game';
import { AtlasIconName } from '../atlasMap';

/**
 * 게임 내 광물(Mineral) 데이터 정의 인터페이스입니다.
 */
export interface MineralDefinition {
  key: TileType;
  name: string;
  nameKo: string;
  /** 이미지 생성과 아트 방향성을 잡는 데 사용하는 실제 광물 레퍼런스 영문명입니다. */
  referenceName?: string;
  /** 이미지 생성과 아트 방향성을 잡는 데 사용하는 실제 광물 레퍼런스 한글명입니다. */
  referenceNameKo?: string;
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
