import { MonsterDefinition } from './types';
import {
  UNRELEASED_CIRCLE_BOSS_DEFENSE,
  UNRELEASED_CIRCLE_BOSS_HP,
  UNRELEASED_CIRCLE_BOSS_POWER,
  UNRELEASED_CIRCLE_MONSTER_DEFENSE,
  UNRELEASED_CIRCLE_MONSTER_HP,
  UNRELEASED_CIRCLE_MONSTER_POWER,
} from '../lateCircleLock';

export const circle6Monsters: MonsterDefinition[] = [
  {
    id: 'c6_priest',
    name: 'Heretic Priest',
    nameKo: '이단 사제',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Heresy 서클의 하급 영혼입니다.',
    stats: {
      maxHp: UNRELEASED_CIRCLE_MONSTER_HP,
      power: UNRELEASED_CIRCLE_MONSTER_POWER,
      defense: UNRELEASED_CIRCLE_MONSTER_DEFENSE,
      attackCooldown: 1000,
    },
    rewards: {
      exp: 3500,
      gold: 700,
      drops: [
        { itemId: 'essence_heresy', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 5 },
  },
  {
    id: 'c6_flame',
    name: 'Eternal Flame Soul',
    nameKo: '영겁의 불꽃 영혼',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Heresy 서클의 하급 영혼입니다.',
    stats: {
      maxHp: UNRELEASED_CIRCLE_MONSTER_HP,
      power: UNRELEASED_CIRCLE_MONSTER_POWER,
      defense: UNRELEASED_CIRCLE_MONSTER_DEFENSE,
      attackCooldown: 1000,
    },
    rewards: {
      exp: 3000,
      gold: 600,
      drops: [
        { itemId: 'essence_heresy', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 5 },
  },
  {
    id: 'c6_angel',
    name: 'Fallen Angel',
    nameKo: '타락한 천사',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Heresy 서클의 하급 영혼입니다.',
    stats: {
      maxHp: UNRELEASED_CIRCLE_MONSTER_HP,
      power: UNRELEASED_CIRCLE_MONSTER_POWER,
      defense: UNRELEASED_CIRCLE_MONSTER_DEFENSE,
      attackCooldown: 1000,
    },
    rewards: {
      exp: 5000,
      gold: 1000,
      drops: [
        { itemId: 'essence_heresy', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 5 },
  },
  {
    id: 'c6_lilith',
    name: 'Lilith, the Heretic Saint',
    nameKo: '이단의 성녀, 릴리스',
    type: 'boss',
    imagePath: 'Asmodeus',
    description: '타락한 신앙의 상징. 아름다우면서도 치명적인 권능으로 이단자들을 이끕니다.',
    width: 5,
    height: 5,
    stats: {
      maxHp: UNRELEASED_CIRCLE_BOSS_HP,
      power: UNRELEASED_CIRCLE_BOSS_POWER,
      defense: UNRELEASED_CIRCLE_BOSS_DEFENSE,
      attackCooldown: 2000,
    },
    rewards: {
      exp: 450000,
      gold: 90000,
      drops: [
        { itemId: 'essence_heresy', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'relic_belphegor_eye', chance: 0.2, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { attackRange: 1, aggroRange: 10 },
  },
];
