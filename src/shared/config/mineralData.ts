import { TileType, Rarity } from '../types/game';
import DirtIcon from '../assets/minerals/DirtIcon.png';
import StoneIcon from '../assets/minerals/StoneIcon.png';
import CoalIcon from '../assets/minerals/CoalIcon.png';
import IronIcon from '../assets/minerals/IronIcon.png';
import GoldIcon from '../assets/minerals/GoldIcon.png';
import DiamondIcon from '../assets/minerals/DiamondIcon.png';
import EmeraldIcon from '../assets/minerals/EmeraldIcon.png';
import RubyIcon from '../assets/minerals/RubyIcon.png';
import SapphireIcon from '../assets/minerals/SapphireIcon.png';
import UraniumIcon from '../assets/minerals/UraniumIcon.png';
import ObsidianIcon from '../assets/minerals/ObsidianIcon.png';

// 추출된 타일 이미지들 임포트
import DirtTile from '../assets/tiles/dirt.png';
import StoneTile from '../assets/tiles/stone.png';
import CoalTile from '../assets/tiles/coal.png';
import IronTile from '../assets/tiles/iron.png';
import GoldTile from '../assets/tiles/gold.png';
import DiamondTile from '../assets/tiles/diamond.png';
import EmeraldTile from '../assets/tiles/emerald.png';
import RubyTile from '../assets/tiles/ruby.png';
import SapphireTile from '../assets/tiles/sapphire.png';
import UraniumTile from '../assets/tiles/uranium.png';
import ObsidianTile from '../assets/tiles/obsidian.png';
import WallTile from '../assets/tiles/wall.png';
import DungeonBricksTile from '../assets/tiles/dungeon_bricks.png';
import PortalTile from '../assets/tiles/portal.png';
import LavaTile from '../assets/tiles/lava.png';
import MonsterNestTile from '../assets/tiles/monster_nest.png';
import BossCoreTile from '../assets/tiles/boss_core.png';
import BossSkinTile from '../assets/tiles/boss_skin.png';

export interface MineralDefinition {
  key: TileType;
  name: string;
  icon: string;
  description: string;
  color: string;
  minDepth: number;
  basePrice: number; // 상점 판매 가격 (G)
  baseHealth: number; // 광물 파괴에 필요한 타격 체력
  defense: number; // 광물 방어력
  image?: any; // 선택적인 실제 이미지 에셋 (아이템 아이콘 용)
  tileImage?: any; // 맵 타일용 이미지 에셋
  _cachedImage?: any; // 렌더링 캔버스 최적화용 캐시 객체
  _cachedTileImage?: any; // 타일 렌더링 최적화용 캐시 객체
}

export const MINERALS: MineralDefinition[] = [
  {
    key: 'dirt',
    name: 'Dirt',
    icon: '🟤',
    description: 'The most common surface soil. Has minimal value.',
    color: '#94a3b8',
    minDepth: 0,
    basePrice: 1,
    baseHealth: 30,
    defense: 0,
    image: DirtIcon,
    tileImage: DirtTile,
  },
  {
    key: 'stone',
    name: 'Stone',
    icon: '🪨',
    description: 'Hardened rock. Used as basic construction material.',
    color: '#94a3b8',
    minDepth: 0,
    basePrice: 1,
    baseHealth: 100,
    defense: 10,
    image: StoneIcon,
    tileImage: StoneTile,
  },
  {
    key: 'coal',
    name: 'Coal',
    icon: '⬛',
    description: 'Carbon-rich mineral. Useful as fuel or early funding source.',
    color: '#4ade80',
    minDepth: 20,
    basePrice: 5,
    baseHealth: 250,
    defense: 25,
    image: CoalIcon,
    tileImage: CoalTile,
  },
  {
    key: 'iron',
    name: 'Iron',
    icon: '🥈',
    description: 'Dense industrial metal. Serves as the base for various equipment.',
    color: '#4ade80',
    minDepth: 100,
    basePrice: 20,
    baseHealth: 600,
    defense: 60,
    image: IronIcon,
    tileImage: IronTile,
  },
  {
    key: 'gold',
    name: 'Gold',
    icon: '🟡',
    description: 'Highly conductive precious metal. Traded at high prices in the shop.',
    color: '#60a5fa',
    minDepth: 300,
    basePrice: 100,
    baseHealth: 600,
    defense: 100,
    image: GoldIcon,
    tileImage: GoldTile,
  },
  {
    key: 'diamond',
    name: 'Diamond',
    icon: '💎',
    description: 'Pure carbon crystals. Extremely hard and disperses light in multiple directions.',
    color: '#ec4899',
    minDepth: 450,
    basePrice: 300,
    baseHealth: 1000,
    defense: 150,
    tileImage: DiamondTile,
    image: DiamondIcon, 
  },
  {
    key: 'emerald',
    name: 'Emerald',
    icon: '🟩',
    description: 'Transparent green gem used in precision optical equipment.',
    color: '#a855f7',
    minDepth: 650,
    basePrice: 800,
    baseHealth: 1500,
    defense: 200,
    tileImage: EmeraldTile,
    image: EmeraldIcon,
  },
  {
    key: 'ruby',
    name: 'Ruby',
    icon: '🟥',
    description: 'Heat-resistant red gem. Used in laser equipment and more.',
    color: '#a855f7',
    minDepth: 850,
    basePrice: 1500,
    baseHealth: 2000,
    defense: 300,
    tileImage: RubyTile,
    image: RubyIcon,
  },
  {
    key: 'sapphire',
    name: 'Sapphire',
    icon: '🟦',
    description: 'Extremely hard blue gem. Emits a brilliant light and is the core of high-performance sensor arrays.',
    color: '#ec4899',
    minDepth: 1050,
    basePrice: 3000,
    baseHealth: 3000,
    defense: 450,
    tileImage: SapphireTile,
  },
  {
    key: 'uranium',
    name: 'Uranium',
    icon: '☢️',
    description: 'Unstable but high-energy radioactive element.',
    color: '#f59e0b',
    minDepth: 1200,
    basePrice: 5000,
    baseHealth: 6000,
    defense: 850,
    tileImage: UraniumTile,
  },
  {
    key: 'obsidian',
    name: 'Obsidian',
    icon: '🌑',
    description: 'Volcanic glass with atomic-level sharpness. Carries mythical legends.',
    color: '#ef4444',
    minDepth: 1350,
    basePrice: 10000,
    baseHealth: 10000,
    defense: 1200,
    tileImage: ObsidianTile,
  },
  {
    key: 'iron_ingot',
    name: 'Iron Ingot',
    icon: '🪚',
    description: 'Smelted iron bar. Essential for advanced crafting.',
    color: '#94a3b8',
    minDepth: -1,
    basePrice: 150,
    baseHealth: 0,
    defense: 0,
  },
  {
    key: 'gold_ingot',
    name: 'Gold Ingot',
    icon: '🏅',
    description: 'Refined gold bar. Very valuable and conductive.',
    color: '#fbbf24',
    minDepth: -1,
    basePrice: 500,
    baseHealth: 0,
    defense: 0,
  },
  {
    key: 'polished_diamond',
    name: 'Polished Diamond',
    icon: '💠',
    description: 'Perfectly cut diamond. Focuses intense energy.',
    color: '#ec4899',
    minDepth: -1,
    basePrice: 8000,
    baseHealth: 0,
    defense: 0,
  },
  // 특수 타일 데이터 (유지보수용 개별 이미지 연동)
  {
    key: 'wall' as any,
    name: 'Wall',
    icon: '🧱',
    description: 'Unbreakable border wall.',
    color: '#1a1a1b',
    minDepth: -2,
    basePrice: 0,
    baseHealth: 1000,
    defense: 0,
    tileImage: WallTile,
  },
  {
    key: 'lava' as any,
    name: 'Lava',
    icon: '🔥',
    description: 'Dangerous liquid fire.',
    color: '#f97316',
    minDepth: -2,
    basePrice: 0,
    baseHealth: Infinity,
    defense: 0,
    tileImage: LavaTile,
  },
  {
    key: 'portal' as any,
    name: 'Portal',
    icon: '🌀',
    description: 'Relic of an ancient civilization.',
    color: '#a855f7',
    minDepth: -2,
    basePrice: 0,
    baseHealth: Infinity,
    defense: 0,
    tileImage: PortalTile,
  },
  {
    key: 'dungeon_bricks' as any,
    name: 'Dungeon Bricks',
    icon: '🧱',
    description: 'Ancient bricks.',
    color: '#374151',
    minDepth: -2,
    basePrice: 0,
    baseHealth: 1000,
    defense: 0,
    tileImage: DungeonBricksTile,
  },
  {
    key: 'monster_nest' as any,
    name: 'Monster Nest',
    icon: '🥚',
    description: 'A nest of monsters.',
    color: '#b91c1c',
    minDepth: -2,
    basePrice: 0,
    baseHealth: 200,
    defense: 0,
    tileImage: MonsterNestTile,
  },
  {
    key: 'boss_core' as any,
    name: 'Boss Core',
    icon: '🟣',
    description: 'The core of a boss.',
    color: '#064e3b',
    minDepth: -2,
    basePrice: 0,
    baseHealth: 10000,
    defense: 0,
    tileImage: BossCoreTile,
  },
  {
    key: 'boss_skin' as any,
    name: 'Boss Skin',
    icon: '🟢',
    description: 'The skin of a boss.',
    color: '#064e3b',
    minDepth: -2,
    basePrice: 0,
    baseHealth: 40000,
    defense: 0,
    tileImage: BossSkinTile,
  }
];

export const RARITY_COLORS: { [key in Rarity]: string } = {
  Common: '#94a3b8',
  Uncommon: '#4ade80',
  Rare: '#60a5fa',
  Epic: '#a855f7',
  Radiant: '#ec4899',
  Legendary: '#f59e0b',
  Mythic: '#ef4444',
  Ancient: '#22d3ee',
};
