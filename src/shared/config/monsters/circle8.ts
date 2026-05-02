import { MonsterDefinition } from './types';

export const circle8Monsters: MonsterDefinition[] = [
  {
    id: 'c8_malebranche',
    name: 'Malebranche',
    nameKo: '말레브랑케',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Fraud 서클의 하급 영혼입니다.',
    stats: { maxHp: 600000, power: 10000, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 60000,
      gold: 12000,
      drops: [
        { itemId: 'essence_fraud', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'stationary', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c8_prophet',
    name: 'False Prophet',
    nameKo: '거짓 예언자',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Fraud 서클의 하급 영혼입니다.',
    stats: { maxHp: 500000, power: 15000, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 50000,
      gold: 10000,
      drops: [
        { itemId: 'essence_fraud', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'stationary', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c8_illusionist',
    name: 'Illusionist Shade',
    nameKo: '환술사의 그림자',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Fraud 서클의 하급 영혼입니다.',
    stats: { maxHp: 450000, power: 12000, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 45000,
      gold: 9000,
      drops: [
        { itemId: 'essence_fraud', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'stationary', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c8_gadreel',
    name: 'Gadreel, the False Judge',
    nameKo: '거짓된 심판자 가드리엘',
    type: 'boss',
    imagePath: 'Asmodeus',
    description: '신성한 심판자를 자처하지만, 사실은 기만과 부패로 영혼들을 타락시키는 서클 8의 지배자.',
    width: 5,
    height: 5,
    stats: { maxHp: 12000000, power: 45000, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: {
      exp: 6000000,
      gold: 1200000,
      drops: [
        { itemId: 'essence_fraud', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'boss_core', chance: 1.0, minAmount: 1, maxAmount: 1 },
        { itemId: 'relic_abaddon_blade', chance: 0.1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 },
  },
];
