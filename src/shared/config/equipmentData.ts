import { UNRELEASED_CIRCLE_EQUIPMENT_REQUIREMENT } from './lateCircleLock';

/**
 * 장비 데이터베이스 (EQUIPMENTS)
 * 모든 드릴, 투구, 갑옷, 신발 데이터를 중앙 관리합니다.
 * 
 * @description
 * 각 Circle(지옥의 원)별로 4종류의 장비(드릴, 투구, 갑옷, 신발)를 제공합니다.
 * 각 장비는 특정 Circle의 테마와 난이도에 맞는 스탯을 제공합니다.
 * 
 * @property {string} id - 장비의 고유 식별자
 * @property {string} name - 장비의 이름
 * @property {string} description - 장비 설명
 * @property {string} part - 장비 부위 (drill, helmet, armor, boots)
 * @property {number} circle - 해당 Circle 번호 (2-9)
 * @property {string} icon - UI에 표시될 아이콘 (이모지)
 * @property {string} image - 아틀라스에 등록된 이미지 ID (AtlasIconName)
 * @property {Object} stats - 장비 스탯
 * @property {number} stats.power - 공격력/채굴력 (드릴 전용)
 * @property {number} stats.defense - 방어력 (투구, 갑옷, 신발)
 * @property {number} stats.maxHp - 최대 체력 (갑옷, 신발)
 * @property {number} stats.moveSpeed - 이동 속도 (신발)
 * @property {Object} price - 제작 재료
 */
export const EQUIPMENTS: Record<string, any> = {
  // === Circle 2 — Lust (색욕) ===
  'crimson_fang': {
    id: 'crimson_fang',
    name: 'Crimson Fang',
    description: 'A drill carved from lustrous red crystal. Focuses on pure mining power.',
    part: 'Drill',
    circle: 2,
    icon: '🦷',
    image: 'CrimsonFangDrill',
    stats: { power: 25 },
    price: { crimsonstone: 10, galestone: 5 },
  },
  'crimson_veil': {
    id: 'crimson_veil',
    name: 'Crimson Veil',
    description: 'A sleek helmet that sharpens the senses.',
    part: 'Helmet',
    circle: 2,
    icon: '🥽',
    image: 'CrimsonVeilHelmet',
    stats: { maxHp: 80, defense: 3 },
    price: { crimsonstone: 5, galestone: 3 },
  },
  'crimson_plate': {
    id: 'crimson_plate',
    name: 'Crimson Plate',
    description: 'Armor made from reinforced crimson crystal layers.',
    part: 'Armor',
    circle: 2,
    icon: '🛡️',
    image: 'CrimsonPlateArmor',
    stats: { maxHp: 200, defense: 5 },
    price: { crimsonstone: 25, fervorstone: 10 },
  },
  'crimson_stride': {
    id: 'crimson_stride',
    name: 'Crimson Stride',
    description: 'Boots that provide a balance of speed and protection.',
    part: 'Boots',
    circle: 2,
    icon: '👢',
    image: 'CrimsonStrideBoots',
    stats: { moveSpeed: 15, defense: 2 },
    price: { galestone: 15, fervorstone: 5 },
  },

  // === Circle 3 — Gluttony (탐식) ===
  'void_crusher': {
    id: 'void_crusher',
    name: 'Void Crusher',
    description: 'Consumes any resistance. Tremendous mining force.',
    part: 'Drill',
    circle: 3,
    icon: '🌑',
    image: 'VoidCrusher',
    stats: { power: 40 },
    price: { moldstone: 24, sludgestone: 8 },
  },
  'void_mask': {
    id: 'void_mask',
    name: 'Void Mask',
    description: 'Mask that devours incoming physical shock.',
    part: 'Helmet',
    circle: 3,
    icon: '🎭',
    image: 'VoidMask',
    stats: { maxHp: 80, defense: 6 },
    price: { moldstone: 16, sludgestone: 6 }
  },
  'void_mantle': {
    id: 'void_mantle',
    name: 'Void Mantle',
    description: 'A heavy cloak containing the weight of the void.',
    part: 'Armor',
    circle: 3,
    icon: '🧥',
    image: 'VoidMantle',
    stats: { maxHp: 400, defense: 10 },
    price: { moldstone: 24, sludgestone: 14, rotstone: 6 }
  },
  'void_step': {
    id: 'void_step',
    name: 'Void Step',
    description: 'Move as if gravity does not exist.',
    part: 'Boots',
    circle: 3,
    icon: '👣',
    image: 'VoidStep',
    stats: { moveSpeed: 25, defense: 6},
    price: { moldstone: 16, sludgestone: 8, rotstone: 4 }
  },

  // === Circle 4 — Greed (탐욕) ===
  'crown_piercer': {
    id: 'crown_piercer',
    name: 'Crown Piercer',
    description: 'Golden drill designed to extract the most precious riches.',
    part: 'Drill',
    circle: 4,
    icon: '🔱',
    image: 'CrownPiercer',
    stats: { power: 70 },
    price: { goldstone: 24 },
  },
  'crown_helm': {
    id: 'crown_helm',
    name: 'Crown Helm',
    description: 'A royal headpiece offering absolute protection.',
    part: 'Helmet',
    circle: 4,
    icon: '👑',
    image: 'CrownHelm',
    stats: { maxHp: 140, defense: 12 },
    price: { goldstone: 24, luststone: 10 }
  },
  'crown_vestment': {
    id: 'crown_vestment',
    name: 'Crown Vestment',
    description: 'Garments woven with golden threads of greed.',
    part: 'Armor',
    circle: 4,
    icon: '🥋',
    image: 'CrownVestment',
    stats: { maxHp: 700, defense: 18 },
    price: { goldstone: 36, luststone: 18, midasite: 8 }
  },
  'crown_treads': {
    id: 'crown_treads',
    name: 'Crown Treads',
    description: 'Walk upon the path of gold with haste.',
    part: 'Boots',
    circle: 4,
    icon: '👟',
    image: 'CrownTreads',
    stats: { moveSpeed: 35, defense: 10, maxHp: 150 },
    price: { goldstone: 24, luststone: 12, midasite: 6 }
  },

  // === Circle 5 — Wrath (분노) ===
  'ember_fang': {
    id: 'ember_fang',
    name: 'Ember Fang',
    description: 'Burning drill that melts through anything.',
    part: 'Drill',
    circle: 5,
    icon: '🔥',
    stats: { power: 90 },
    price: { furystone: UNRELEASED_CIRCLE_EQUIPMENT_REQUIREMENT },
  },
  'ember_visor': {
    id: 'ember_visor',
    name: 'Ember Visor',
    description: 'Red-hot visor that reveals weaknesses.',
    part: 'Helmet',
    circle: 5,
    icon: '🕶️',
    stats: { defense: 45 },
    price: { cinderstone: UNRELEASED_CIRCLE_EQUIPMENT_REQUIREMENT }
  },
  'ember_plate': {
    id: 'ember_plate',
    name: 'Ember Plate',
    description: 'Armor forged in the deepest furnace of wrath.',
    part: 'Armor',
    circle: 5,
    icon: '🛡️',
    stats: { maxHp: 1000 },
    price: { furystone: UNRELEASED_CIRCLE_EQUIPMENT_REQUIREMENT }
  },
  'ember_stride': {
    id: 'ember_stride',
    name: 'Ember Stride',
    description: 'Each step leaves a trail of burning anger.',
    part: 'Boots',
    circle: 5,
    icon: '🥾',
    stats: { moveSpeed: 55, defense: 15, maxHp: 300 },
    price: { cinderstone: UNRELEASED_CIRCLE_EQUIPMENT_REQUIREMENT }
  },

  // === Circle 6 — Heresy (이단) ===
  'ash_bore': {
    id: 'ash_bore',
    name: 'Ash Bore',
    description: 'A drill that turned to ash but kept its edge.',
    part: 'Drill',
    circle: 6,
    icon: '🌪️',
    stats: { power: 150 },
    price: { vexite: UNRELEASED_CIRCLE_EQUIPMENT_REQUIREMENT },
  },
  'ash_cowl': {
    id: 'ash_cowl',
    name: 'Ash Cowl',
    description: 'Silence the screams of the past.',
    part: 'Helmet',
    circle: 6,
    icon: '👤',
    stats: { defense: 80 },
    price: { ashstone: UNRELEASED_CIRCLE_EQUIPMENT_REQUIREMENT }
  },
  'ash_shroud': {
    id: 'ash_shroud',
    name: 'Ash Shroud',
    description: 'Light as dust, strong as obsidian.',
    part: 'Armor',
    circle: 6,
    icon: '🧥',
    stats: { maxHp: 2000 },
    price: { vexite: UNRELEASED_CIRCLE_EQUIPMENT_REQUIREMENT }
  },
  'ash_glide': {
    id: 'ash_glide',
    name: 'Ash Glide',
    description: 'Slide through the air itself.',
    part: 'Boots',
    circle: 6,
    icon: '🛸',
    stats: { moveSpeed: 80, defense: 30, maxHp: 600 },
    price: { ashstone: UNRELEASED_CIRCLE_EQUIPMENT_REQUIREMENT }
  }
};
