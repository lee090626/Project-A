import { MonsterDefinition } from './types';

export const circle3Monsters: MonsterDefinition[] = [
  {
    id: 'c3_devourer',
    name: 'Bloated Devourer',
    nameKo: '비대한 포식자',
    type: 'monster',
    imagePath: 'BloatedDevourer',
    description: 'Gluttony 서클의 하급 영혼입니다.',
    width: 2,
    height: 2,
    stats: { maxHp: 1500, power: 60, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 150,
      gold: 30,
      drops: [
        { itemId: 'essence_gluttony', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'stationary', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c3_worm',
    name: 'Starving Wraith',
    nameKo: '굶주린 망령',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Gluttony 서클의 하급 영혼입니다.',
    stats: { maxHp: 1200, power: 70, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 120,
      gold: 24,
      drops: [
        { itemId: 'essence_gluttony', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'stationary', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c3_mud_shade',
    name: 'Greedy slaughter',
    nameKo: '탐식의 도살자',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Gluttony 서클의 하급 영혼입니다.',
    stats: { maxHp: 1800, power: 50, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 180,
      gold: 36,
      drops: [
        { itemId: 'essence_gluttony', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'stationary', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c3_cerberus',
    name: 'Cerberus, the Hound of Gluttony',
    nameKo: '탐식의 파수견, 케르베로스',
    type: 'boss',
    imagePath: 'Cerberus',
    description:
      '음침한 비가 쏟아지의 제3원 탐식의 지옥을 지키는 세 머리 달린 괴물 개. 끊임없이 짖어대며 죄인들을 갈기갈기 찢어발기며 탐식의 죄를 처단합니다.',
    width: 7,
    height: 7,
    stats: { maxHp: 100000, power: 350, defense: 30, speed: 1.5, attackCooldown: 2000 },
    rewards: {
      exp: 22500,
      gold: 4500,
      drops: [
        { itemId: 'essence_gluttony', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'boss_core', chance: 1.0, minAmount: 1, maxAmount: 1 },
        { itemId: 'relic_beelzebub_needle', chance: 0.5, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 3.5, aggroRange: 15, respawnMs: 15000 },
    patterns: [
      {
        type: 'dash',
        cooldown: 5000,
        warningLeadTime: 800,
        dashDuration: 1200,
        projectileSpeed: 10, // Dash speed
      },
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
    phases: [
      { phase: 2, hpThreshold: 70 },
      { phase: 3, hpThreshold: 35 },
    ],
  },
];
