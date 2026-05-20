import { MonsterDefinition } from './types';
import {
  UNRELEASED_CIRCLE_BOSS_DEFENSE,
  UNRELEASED_CIRCLE_BOSS_HP,
  UNRELEASED_CIRCLE_BOSS_POWER,
  UNRELEASED_CIRCLE_MONSTER_DEFENSE,
  UNRELEASED_CIRCLE_MONSTER_HP,
  UNRELEASED_CIRCLE_MONSTER_POWER,
} from '../lateCircleLock';

export const circle7Monsters: MonsterDefinition[] = [
  {
    id: 'c7_centaur',
    name: 'Centaur Archer',
    nameKo: '켄타우로스 궁수',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'A lesser soul from the Circle of Violence.',
    stats: {
      maxHp: UNRELEASED_CIRCLE_MONSTER_HP,
      power: UNRELEASED_CIRCLE_MONSTER_POWER,
      defense: UNRELEASED_CIRCLE_MONSTER_DEFENSE,
      attackCooldown: 1000,
    },
    rewards: {
      gold: 2400,
      drops: [
        { itemId: 'essence_violence', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 5 },
  },
  {
    id: 'c7_guard',
    name: 'Blood-soaked Guard',
    nameKo: '선혈의 경비병',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'A lesser soul from the Circle of Violence.',
    stats: {
      maxHp: UNRELEASED_CIRCLE_MONSTER_HP,
      power: UNRELEASED_CIRCLE_MONSTER_POWER,
      defense: UNRELEASED_CIRCLE_MONSTER_DEFENSE,
      attackCooldown: 1000,
    },
    rewards: {
      gold: 3600,
      drops: [
        { itemId: 'essence_violence', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 5 },
  },
  {
    id: 'c7_spawn',
    name: 'Minotaur Spawn',
    nameKo: '미노타우로스 하수인',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'A lesser soul from the Circle of Violence.',
    stats: {
      maxHp: UNRELEASED_CIRCLE_MONSTER_HP,
      power: UNRELEASED_CIRCLE_MONSTER_POWER,
      defense: UNRELEASED_CIRCLE_MONSTER_DEFENSE,
      attackCooldown: 1000,
    },
    rewards: {
      gold: 5000,
      drops: [
        { itemId: 'essence_violence', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 5 },
  },
  {
    id: 'c7_camael',
    name: 'Camael, the Divine Executioner',
    nameKo: '신성한 처형자, 카마엘',
    type: 'boss',
    imagePath: 'Asmodeus',
    description: 'A cold executioner who rules the pools of Violence. He condemns sinners with a massive blade of judgment.',
    width: 5,
    height: 5,
    stats: {
      maxHp: UNRELEASED_CIRCLE_BOSS_HP,
      power: UNRELEASED_CIRCLE_BOSS_POWER,
      defense: UNRELEASED_CIRCLE_BOSS_DEFENSE,
      attackCooldown: 2000,
    },
    rewards: {
      gold: 300000,
      drops: [
        { itemId: 'essence_violence', chance: 1.0, minAmount: 5, maxAmount: 10 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 10 },
  },
];
