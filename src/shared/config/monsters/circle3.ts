import { MonsterDefinition } from './types';

export const circle3Monsters: MonsterDefinition[] = [
  {
    id: 'c3_devourer',
    name: 'Bloated Devourer',
    nameKo: '비대한 포식자',
    type: 'monster',
    imagePath: 'BloatedDevourer',
    description: 'A lesser soul from the Circle of Gluttony.',
    width: 2,
    height: 2,
    stats: { maxHp: 1000, power: 40, defense: 5, attackCooldown: 1000 },
    rewards: {
      gold: 30,
      drops: [
        { itemId: 'essence_gluttony', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 5 },
  },
  {
    id: 'c3_worm',
    name: 'Starving Wraith',
    nameKo: '굶주린 망령',
    type: 'monster',
    imagePath: 'StarvingWraith',
    description: 'A lesser soul from the Circle of Gluttony.',
    stats: { maxHp: 850, power: 45, defense: 5, attackCooldown: 1000 },
    rewards: {
      gold: 24,
      drops: [
        { itemId: 'essence_gluttony', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 5 },
  },
  {
    id: 'c3_mud_shade',
    name: 'Greedy slaughter',
    nameKo: '탐식의 도살자',
    type: 'monster',
    imagePath: 'GreedySlaughter',
    description: 'A lesser soul from the Circle of Gluttony.',
    stats: { maxHp: 1250, power: 38, defense: 5, attackCooldown: 1000 },
    rewards: {
      gold: 36,
      drops: [
        { itemId: 'essence_gluttony', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 5 },
  },
  {
    id: 'c3_cerberus',
    name: 'Cerberus, the Hound of Gluttony',
    nameKo: '탐식의 파수견, 케르베로스',
    type: 'boss',
    imagePath: 'Cerberus',
    description:
      'A three-headed beast that guards Circle 3, the inferno of Gluttony, beneath a bleak and endless rain. Its relentless barking tears sinners apart and enforces the sin of gluttony.',
    width: 7,
    height: 7,
    stats: { maxHp: 50000, power: 180, defense: 25, attackCooldown: 2000 },
    rewards: {
      gold: 4500,
      drops: [
        { itemId: 'essence_gluttony', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'relic_cerberus_fang', chance: 1.0, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 15, respawnMs: 15000 },
    patterns: [
      {
        type: 'roar',
        cooldown: 7000,
        warningLeadTime: 1000,
        roarRadius: 250,
        projectilePower: 60,
      },
      {
        type: 'hellfire',
        cooldown: 6000,
        warningLeadTime: 1500,
        projectileCount: 8,
        projectileSpeed: 2.5,
        projectilePower: 25,
        projectileSize: 80,
      },
    ],
  },
];
