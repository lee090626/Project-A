import { MonsterDefinition } from './types';
import {
  UNRELEASED_CIRCLE_BOSS_DEFENSE,
  UNRELEASED_CIRCLE_BOSS_HP,
  UNRELEASED_CIRCLE_BOSS_POWER,
  UNRELEASED_CIRCLE_MONSTER_DEFENSE,
  UNRELEASED_CIRCLE_MONSTER_HP,
  UNRELEASED_CIRCLE_MONSTER_POWER,
} from '../lateCircleLock';

export const circle9Monsters: MonsterDefinition[] = [
  {
    id: 'c9_sinner',
    name: 'Ice-bound Sinner',
    nameKo: '빙결된 죄인',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'A lesser soul from the Circle of Treachery.',
    stats: {
      maxHp: UNRELEASED_CIRCLE_MONSTER_HP,
      power: UNRELEASED_CIRCLE_MONSTER_POWER,
      defense: UNRELEASED_CIRCLE_MONSTER_DEFENSE,
      attackCooldown: 1000,
    },
    rewards: {
      gold: 50000,
      drops: [
        { itemId: 'essence_treachery', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 5 },
  },
  {
    id: 'c9_specter',
    name: 'Cocytus Specter',
    nameKo: '코키토스 망령',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'A lesser soul from the Circle of Treachery.',
    stats: {
      maxHp: UNRELEASED_CIRCLE_MONSTER_HP,
      power: UNRELEASED_CIRCLE_MONSTER_POWER,
      defense: UNRELEASED_CIRCLE_MONSTER_DEFENSE,
      attackCooldown: 1000,
    },
    rewards: {
      gold: 40000,
      drops: [
        { itemId: 'essence_treachery', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 5 },
  },
  {
    id: 'c9_shadow',
    name: 'Treacherous Shadow',
    nameKo: '배신의 그림자',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'A lesser soul from the Circle of Treachery.',
    stats: {
      maxHp: UNRELEASED_CIRCLE_MONSTER_HP,
      power: UNRELEASED_CIRCLE_MONSTER_POWER,
      defense: UNRELEASED_CIRCLE_MONSTER_DEFENSE,
      attackCooldown: 1000,
    },
    rewards: {
      gold: 60000,
      drops: [
        { itemId: 'essence_treachery', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 5 },
  },
  {
    id: 'c9_lucifer',
    name: 'Lucifer, the Fallen Star',
    nameKo: '추락한 별, 루시퍼',
    type: 'boss',
    imagePath: 'Asmodeus',
    description:
      'A fallen ruler with three faces, trapped waist-deep in massive ice. Six broken wings are charred black, and frozen tears cling to his face.',
    width: 5,
    height: 5,
    stats: {
      maxHp: UNRELEASED_CIRCLE_BOSS_HP,
      power: UNRELEASED_CIRCLE_BOSS_POWER,
      defense: UNRELEASED_CIRCLE_BOSS_DEFENSE,
      attackCooldown: 2000,
    },
    rewards: {
      gold: 10000000,
      drops: [
        { itemId: 'essence_treachery', chance: 1.0, minAmount: 5, maxAmount: 10 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 10 },
  },
];
