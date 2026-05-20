import { MonsterDefinition } from './types';

export const circle2Monsters: MonsterDefinition[] = [
  {
    id: 'c2_whisperer',
    name: 'Lustful Whisperer',
    nameKo: '유혹하는 속삭임',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'A lesser soul from the Circle of Lust.',
    stats: { maxHp: 60, power: 2, defense: 4, attackCooldown: 1600 },
    rewards: {
      gold: 15,
      drops: [
        { itemId: 'essence_lust', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 3.5 },
  },
  {
    id: 'c2_wind_soul',
    name: 'Wind-torn Soul',
    nameKo: '바람에 찢긴 영혼',
    type: 'monster',
    imagePath: 'WindTornSoul',
    description: 'A lesser soul from the Circle of Lust.',
    stats: { maxHp: 220, power: 10, defense: 5, attackCooldown: 1700 },
    rewards: {
      gold: 25,
      drops: [
        { itemId: 'essence_lust', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 4.5 },
  },
  {
    id: 'c2_gale_bat',
    name: 'Gale Bat',
    nameKo: '돌풍 박쥐',
    type: 'monster',
    imagePath: 'GaleBat',
    description: 'A lesser soul from the Circle of Lust.',
    stats: { maxHp: 130, power: 8, defense: 5, attackCooldown: 1500 },
    rewards: {
      gold: 20,
      drops: [
        { itemId: 'essence_lust', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 4.5 },
  },
  {
    id: 'c2_asmodeus',
    name: 'Asmodeus, the Lord of Desire',
    nameKo: '욕망의 군주, 아스모데우스',
    type: 'boss',
    imagePath: 'Asmodeus',
    description:
      'A great demon who rules Circle 2, the inferno of Lust. He destroys intruders with deadly temptation and overwhelming desire.',
    width: 5,
    height: 5,
    stats: { maxHp: 14000, power: 85, defense: 20, attackCooldown: 2500 },
    rewards: {
      gold: 1500,
      drops: [
        { itemId: 'essence_lust', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'relic_asmodeus_ring', chance: 1.0, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: {
      attackRange: 1,
      aggroRange: 10,
      projectileId: 'FireBall',
      respawnMs: 10000,
    },
    patterns: [
      {
        type: 'lure',
        cooldown: 8000,
        lureDuration: 1000,
        lureCycle: 8000,
      },
    ],
  },
];
