import { MonsterDefinition } from './types';

export const circle4Monsters: MonsterDefinition[] = [
  {
    id: 'c4_hoarder',
    name: 'Hoarding Specter',
    nameKo: '수집가 망령',
    type: 'monster',
    imagePath: 'HoardingSpecter',
    description: 'A specter wandering the treasure piles of the Circle of Greed.',
    stats: { maxHp: 4000, power: 120, defense: 5, attackCooldown: 1000 },
    rewards: {
      gold: 80,
      drops: [
        { itemId: 'essence_greed', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 5 },
  },
  {
    id: 'c4_sinner',
    name: 'Avarice Golem',
    nameKo: '탐욕 골렘',
    type: 'monster',
    imagePath: 'AvariceGolem',
    description: 'A golem formed from metal and stone corrupted by greed in the Circle of Greed.',
    stats: { maxHp: 5500, power: 150, defense: 5, attackCooldown: 1000 },
    rewards: {
      gold: 110,
      drops: [
        { itemId: 'essence_greed', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 5 },
  },
  {
    id: 'c4_mimic',
    name: 'Mimic',
    nameKo: '미믹',
    type: 'monster',
    imagePath: 'Mimic',
    description: 'A predator disguised as a treasure chest in the Circle of Greed.',
    stats: { maxHp: 3500, power: 200, defense: 5, attackCooldown: 1000 },
    rewards: {
      gold: 70,
      drops: [
        { itemId: 'essence_greed', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 5 },
  },
  {
    id: 'c4_fafnir',
    name: 'Fafnir, the Guardian of Gold',
    nameKo: '황금의 수호자, 파프니르',
    type: 'boss',
    imagePath: 'Fafnir',
    description: 'The golden guardian of Circle 4, the inferno of Greed. He tolerates no one who touches his hoard.',
    width: 7,
    height: 7,
    stats: { maxHp: 180000, power: 550, defense: 65, attackCooldown: 2500 },
    rewards: {
      gold: 12000,
      drops: [
        { itemId: 'essence_greed', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'relic_fafnir_hoard', chance: 1.0, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 15, projectileId: 'FireBall', respawnMs: 20000 },
    patterns: [
      {
        type: 'shot',
        cooldown: 5000,
        warningLeadTime: 900,
        projectileCount: 3,
        projectileSpeed: 4,
        projectilePower: 45,
        projectileSize: 64,
      },
      {
        type: 'cross',
        cooldown: 8500,
        warningLeadTime: 1200,
        projectileSpeed: 3.2,
        projectilePower: 35,
        projectileSize: 72,
      },
      {
        type: 'aoe',
        cooldown: 12000,
        warningLeadTime: 1500,
        projectileCount: 12,
        projectileSpeed: 2.6,
        projectilePower: 30,
        projectileSize: 64,
      },
    ],
  },
];
