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
    description: 'Wrath 서클의 하급 영혼입니다.',
    stats: {
      maxHp: UNRELEASED_CIRCLE_MONSTER_HP,
      power: UNRELEASED_CIRCLE_MONSTER_POWER,
      defense: UNRELEASED_CIRCLE_MONSTER_DEFENSE,
      attackCooldown: 1000,
    },
    rewards: {
      exp: 1200,
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
    description: 'Wrath 서클의 하급 영혼입니다.',
    stats: {
      maxHp: UNRELEASED_CIRCLE_MONSTER_HP,
      power: UNRELEASED_CIRCLE_MONSTER_POWER,
      defense: UNRELEASED_CIRCLE_MONSTER_DEFENSE,
      attackCooldown: 1000,
    },
    rewards: {
      exp: 1000,
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
    description: 'Wrath 서클의 하급 영혼입니다.',
    stats: {
      maxHp: UNRELEASED_CIRCLE_MONSTER_HP,
      power: UNRELEASED_CIRCLE_MONSTER_POWER,
      defense: UNRELEASED_CIRCLE_MONSTER_DEFENSE,
      attackCooldown: 1000,
    },
    rewards: {
      exp: 2500,
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
    description: 'Circle 5 분노의 지옥을 지배하는 최초의 전쟁군주. 끊임없는 증오심으로 적을 섬멸합니다.',
    width: 5,
    height: 5,
    stats: {
      maxHp: UNRELEASED_CIRCLE_BOSS_HP,
      power: UNRELEASED_CIRCLE_BOSS_POWER,
      defense: UNRELEASED_CIRCLE_BOSS_DEFENSE,
      attackCooldown: 2500,
    },
    rewards: {
      exp: 175000,
      gold: 35000,
      drops: [
        { itemId: 'essence_wrath', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'relic_satan_heart', chance: 0.3, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 10 },
  },
];
