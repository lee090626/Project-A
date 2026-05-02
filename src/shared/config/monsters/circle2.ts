import { MonsterDefinition } from './types';

export const circle2Monsters: MonsterDefinition[] = [
  {
    id: 'c2_whisperer',
    name: 'Lustful Whisperer',
    nameKo: '유혹하는 속삭임',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Lust 서클의 하급 영혼입니다.',
    stats: { maxHp: 60, power: 2, defense: 4, speed: 0.6, attackCooldown: 1600 },
    rewards: {
      exp: 50,
      gold: 15,
      drops: [
        { itemId: 'essence_lust', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 3.5 },
  },
  {
    id: 'c2_wind_soul',
    name: 'Wind-torn Soul',
    nameKo: '바람에 찢긴 영혼',
    type: 'monster',
    imagePath: 'WindTornSoul',
    description: 'Lust 서클의 하급 영혼입니다.',
    stats: { maxHp: 220, power: 10, defense: 5, speed: 0.7, attackCooldown: 1700 },
    rewards: {
      exp: 60,
      gold: 25,
      drops: [
        { itemId: 'essence_lust', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 4.5 },
  },
  {
    id: 'c2_gale_bat',
    name: 'Gale Bat',
    nameKo: '돌풍 박쥐',
    type: 'monster',
    imagePath: 'GaleBat',
    description: 'Lust 서클의 하급 영혼입니다.',
    stats: { maxHp: 130, power: 8, defense: 5, speed: 0.8, attackCooldown: 1500 },
    rewards: {
      exp: 45,
      gold: 20,
      drops: [
        { itemId: 'essence_lust', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 4.5 },
  },
  {
    id: 'c2_asmodeus',
    name: 'Asmodeus, the Lord of Desire',
    nameKo: '욕망의 군주, 아스모데우스',
    type: 'boss',
    imagePath: 'Asmodeus',
    description: 'Circle 2 색욕의 지옥을 지배하는 위대한 악마. 치명적인 유혹과 갈망의 힘으로 침입자를 파멸시킵니다.',
    width: 5,
    height: 5,
    stats: { maxHp: 12000, power: 85, defense: 20, speed: 0, attackCooldown: 2500 },
    rewards: {
      exp: 7500,
      gold: 1500,
      drops: [
        { itemId: 'essence_lust', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'relic_asmodeus_ring', chance: 1.0, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: {
      movementType: 'stationary',
      attackRange: 2.5,
      aggroRange: 10,
      projectileId: 'FireBall',
      respawnMs: 10000,
    },
    patterns: [
      {
        type: 'shot',
        cooldown: 5500,
        warningLeadTime: 1000,
        projectileCount: 3, // 단일 페이즈용 밸런스 조정 (3발 고정)
        projectileSpeed: 8,
        projectilePower: 20,
        projectileSize: 128,
      },
      {
        type: 'cross',
        cooldown: 4000,
        warningLeadTime: 1000,
        projectileSpeed: 7,
        projectilePower: 23,
        projectileSize: 128,
      },
      {
        type: 'lure',
        cooldown: 5000,
        lureDuration: 2000,
        lureCycle: 5000,
      },
    ],
  },
];
