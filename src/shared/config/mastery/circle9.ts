import { MasteryPerkDef } from './types';

export const circle9MasteryPerks: MasteryPerkDef[] = [
  // froststone
  {
    id: 'perk_froststone_50',
    tileType: 'froststone',
    requiredLevel: 50,
    name: '동토의 단단함',
    description: '최대 체력이 100% 증가합니다.',
    effects: [{ type: 'maxHp', value: 1.0, isMultiplier: true }],
  },
  {
    id: 'perk_froststone_100',
    tileType: 'froststone',
    requiredLevel: 100,
    name: '영결의 숨결',
    description: '전체 공격력이 50% 증가합니다.',
    effects: [{ type: 'miningPower', value: 0.5, isMultiplier: true }],
  },
  {
    id: 'perk_froststone_150',
    tileType: 'froststone',
    requiredLevel: 150,
    name: '절대 영도',
    description: '최대 체력이 200% 증가합니다.',
    effects: [{ type: 'maxHp', value: 2.0, isMultiplier: true }],
  },
  {
    id: 'perk_froststone_200',
    tileType: 'froststone',
    requiredLevel: 200,
    name: '배신의 고독',
    description: '공격력 100%, 체력 100% 증가합니다.',
    effects: [
      { type: 'miningPower', value: 1.0, isMultiplier: true },
      { type: 'maxHp', value: 1.0, isMultiplier: true },
    ],
  },
  // glacialite
  {
    id: 'perk_glacialite_50',
    tileType: 'glacialite',
    requiredLevel: 50,
    name: '빙하의 무게',
    description: '채굴 공격력이 100% 증가합니다.',
    effects: [{ type: 'miningPower', value: 1.0, isMultiplier: true }],
  },
  {
    id: 'perk_glacialite_100',
    tileType: 'glacialite',
    requiredLevel: 100,
    name: '영겁의 냉기',
    description: '채굴 속도가 50% 증가합니다.',
    effects: [{ type: 'miningSpeed', value: 0.5, isMultiplier: true }],
  },
  {
    id: 'perk_glacialite_150',
    tileType: 'glacialite',
    requiredLevel: 150,
    name: '거대 빙산',
    description: '채굴 공격력이 200% 증가합니다.',
    effects: [{ type: 'miningPower', value: 2.0, isMultiplier: true }],
  },
  {
    id: 'perk_glacialite_200',
    tileType: 'glacialite',
    requiredLevel: 200,
    name: '절대 권력자',
    description: '채굴 공격력 300%, 속도 100% 증가합니다.',
    effects: [
      { type: 'miningPower', value: 3.0, isMultiplier: true },
      { type: 'miningSpeed', value: 1.0, isMultiplier: true },
    ],
  },
  // abyssstone
  {
    id: 'perk_abyssstone_50',
    tileType: 'abyssstone',
    requiredLevel: 50,
    name: '심연의 부름',
    description: '모든 스탯이 50% 상승합니다.',
    effects: [
      { type: 'miningPower', value: 0.5, isMultiplier: true },
      { type: 'maxHp', value: 0.5, isMultiplier: true },
      { type: 'luck', value: 0.5, isMultiplier: true },
    ],
  },
  {
    id: 'perk_abyssstone_100',
    tileType: 'abyssstone',
    requiredLevel: 100,
    name: '어둠의 지배',
    description: '채굴 속도가 100% 증가합니다.',
    effects: [{ type: 'miningSpeed', value: 1.0, isMultiplier: true }],
  },
  {
    id: 'perk_abyssstone_150',
    tileType: 'abyssstone',
    requiredLevel: 150,
    name: '공허의 제왕',
    description: '치명타 확률 20%, 치명타 피해 200% 증가합니다.',
    effects: [
      { type: 'critRate', value: 0.2, isMultiplier: false },
      { type: 'critDmg', value: 2.0, isMultiplier: false },
    ],
  },
  {
    id: 'perk_abyssstone_200',
    tileType: 'abyssstone',
    requiredLevel: 200,
    name: '심연의 신',
    description: '모든 성능이 500% 폭증합니다.',
    effects: [
      { type: 'miningPower', value: 5.0, isMultiplier: true },
      { type: 'miningSpeed', value: 2.0, isMultiplier: true },
      { type: 'luck', value: 5.0, isMultiplier: true },
    ],
  },
];
