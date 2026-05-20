import { MonsterDefinition } from './types';
import {
  UNRELEASED_CIRCLE_BOSS_DEFENSE,
  UNRELEASED_CIRCLE_BOSS_HP,
  UNRELEASED_CIRCLE_BOSS_POWER,
  UNRELEASED_CIRCLE_MONSTER_DEFENSE,
  UNRELEASED_CIRCLE_MONSTER_HP,
  UNRELEASED_CIRCLE_MONSTER_POWER,
} from '../lateCircleLock';

export const circle5Monsters: MonsterDefinition[] = [
  {
    id: 'c5_dweller',
    name: 'Styx Dweller',
    nameKo: '스틱스의 거주자',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'A lesser soul from the Circle of Wrath.',
    stats: {
      maxHp: UNRELEASED_CIRCLE_MONSTER_HP,
      power: UNRELEASED_CIRCLE_MONSTER_POWER,
      defense: UNRELEASED_CIRCLE_MONSTER_DEFENSE,
      attackCooldown: 1000,
    },
    rewards: {
      gold: 240,
      drops: [
        { itemId: 'essence_wrath', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 5 },
  },
  {
    id: 'c5_fury',
    name: 'Raging Fury',
    nameKo: '격노한 복수심',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'A lesser soul from the Circle of Wrath.',
    stats: {
      maxHp: UNRELEASED_CIRCLE_MONSTER_HP,
      power: UNRELEASED_CIRCLE_MONSTER_POWER,
      defense: UNRELEASED_CIRCLE_MONSTER_DEFENSE,
      attackCooldown: 1000,
    },
    rewards: {
      gold: 200,
      drops: [
        { itemId: 'essence_wrath', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 5 },
  },
  {
    id: 'c5_golem',
    name: 'Mud Golem',
    nameKo: '진흙 골렘',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'A lesser soul from the Circle of Wrath.',
    stats: {
      maxHp: UNRELEASED_CIRCLE_MONSTER_HP,
      power: UNRELEASED_CIRCLE_MONSTER_POWER,
      defense: UNRELEASED_CIRCLE_MONSTER_DEFENSE,
      attackCooldown: 1000,
    },
    rewards: {
      gold: 500,
      drops: [
        { itemId: 'essence_wrath', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 5 },
  },
  {
    id: 'c5_azazel',
    name: 'Azazel, the First Warlord',
    nameKo: '최초의 전쟁군주, 아자젤',
    type: 'boss',
    imagePath: 'Asmodeus',
    description: 'The first warlord who rules Circle 5, the inferno of Wrath. He annihilates enemies with endless hatred.',
    width: 5,
    height: 5,
    stats: {
      maxHp: UNRELEASED_CIRCLE_BOSS_HP,
      power: UNRELEASED_CIRCLE_BOSS_POWER,
      defense: UNRELEASED_CIRCLE_BOSS_DEFENSE,
      attackCooldown: 2500,
    },
    rewards: {
      gold: 35000,
      drops: [
        { itemId: 'essence_wrath', chance: 1.0, minAmount: 5, maxAmount: 10 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 10 },
  },
];
