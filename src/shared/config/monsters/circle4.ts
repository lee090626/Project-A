import { MonsterDefinition } from './types';

export const circle4Monsters: MonsterDefinition[] = [
  {
    id: 'c4_hoarder',
    name: 'Hoarding Specter',
    nameKo: '수집가 망령',
    type: 'monster',
    imagePath: 'HoardingSpecter',
    description: 'Greed 서클의 보물 더미 주변을 떠도는 망령입니다.',
    stats: { maxHp: 4000, power: 120, defense: 5, attackCooldown: 1000 },
    rewards: {
      exp: 400,
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
    description: 'Greed 서클의 금속과 암석이 탐욕에 물들어 뭉친 골렘입니다.',
    stats: { maxHp: 5500, power: 150, defense: 5, attackCooldown: 1000 },
    rewards: {
      exp: 550,
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
    description: 'Greed 서클의 보물상자로 위장한 포식자입니다.',
    stats: { maxHp: 3500, power: 200, defense: 5, attackCooldown: 1000 },
    rewards: {
      exp: 350,
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
    description: 'Circle 4 탐욕의 지옥을 지키는 황금의 수호자. 자신의 보물을 건드리는 자를 용납하지 않습니다.',
    width: 7,
    height: 7,
    stats: { maxHp: 180000, power: 550, defense: 65, attackCooldown: 2500 },
    rewards: {
      exp: 60000,
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
