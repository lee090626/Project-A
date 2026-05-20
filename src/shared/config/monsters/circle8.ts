import { MonsterDefinition } from './types';
import {
  UNRELEASED_CIRCLE_BOSS_DEFENSE,
  UNRELEASED_CIRCLE_BOSS_HP,
  UNRELEASED_CIRCLE_BOSS_POWER,
  UNRELEASED_CIRCLE_MONSTER_DEFENSE,
  UNRELEASED_CIRCLE_MONSTER_HP,
  UNRELEASED_CIRCLE_MONSTER_POWER,
} from '../lateCircleLock';

export const circle8Monsters: MonsterDefinition[] = [
  {
    id: 'c8_malebranche',
    name: 'Malebranche',
    nameKo: '말레브랑케',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'A lesser soul from the Circle of Fraud.',
    stats: {
      maxHp: UNRELEASED_CIRCLE_MONSTER_HP,
      power: UNRELEASED_CIRCLE_MONSTER_POWER,
      defense: UNRELEASED_CIRCLE_MONSTER_DEFENSE,
      attackCooldown: 1000,
    },
    rewards: {
      gold: 12000,
      drops: [
        { itemId: 'essence_fraud', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 5 },
  },
  {
    id: 'c8_prophet',
    name: 'False Prophet',
    nameKo: '거짓 예언자',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'A lesser soul from the Circle of Fraud.',
    stats: {
      maxHp: UNRELEASED_CIRCLE_MONSTER_HP,
      power: UNRELEASED_CIRCLE_MONSTER_POWER,
      defense: UNRELEASED_CIRCLE_MONSTER_DEFENSE,
      attackCooldown: 1000,
    },
    rewards: {
      gold: 10000,
      drops: [
        { itemId: 'essence_fraud', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 5 },
  },
  {
    id: 'c8_illusionist',
    name: 'Illusionist Shade',
    nameKo: '환술사의 그림자',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'A lesser soul from the Circle of Fraud.',
    stats: {
      maxHp: UNRELEASED_CIRCLE_MONSTER_HP,
      power: UNRELEASED_CIRCLE_MONSTER_POWER,
      defense: UNRELEASED_CIRCLE_MONSTER_DEFENSE,
      attackCooldown: 1000,
    },
    rewards: {
      gold: 9000,
      drops: [
        { itemId: 'essence_fraud', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 5 },
  },
  {
    id: 'c8_gadreel',
    name: 'Gadreel, the False Judge',
    nameKo: '거짓된 심판자 가드리엘',
    type: 'boss',
    imagePath: 'Asmodeus',
    description: 'A false judge who claims divine authority while corrupting souls through deception and decay as the ruler of Circle 8.',
    width: 5,
    height: 5,
    stats: {
      maxHp: UNRELEASED_CIRCLE_BOSS_HP,
      power: UNRELEASED_CIRCLE_BOSS_POWER,
      defense: UNRELEASED_CIRCLE_BOSS_DEFENSE,
      attackCooldown: 2000,
    },
    rewards: {
      gold: 1200000,
      drops: [
        { itemId: 'essence_fraud', chance: 1.0, minAmount: 5, maxAmount: 10 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 10 },
  },
];
