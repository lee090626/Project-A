import { MasteryPerkDef } from './types';

export const stoneMasteryPerks: MasteryPerkDef[] = [
  {
    id: 'perk_stone_50',
    tileType: 'stone',
    requiredLevel: 50,
    name: '단단한 근력',
    description: '채굴 위력이 5 증가합니다.',
    effects: [{ type: 'miningPower', value: 5, isMultiplier: false }],
  },
  {
    id: 'perk_stone_100',
    tileType: 'stone',
    requiredLevel: 100,
    name: '태산의 가호',
    description: '최대 체력이 20% 증가합니다.',
    effects: [{ type: 'maxHp', value: 0.2, isMultiplier: true }],
  },
  {
    id: 'perk_stone_150',
    tileType: 'stone',
    requiredLevel: 150,
    name: '견고한 장비',
    description: '채굴 위력이 15 증가합니다.',
    effects: [{ type: 'miningPower', value: 15, isMultiplier: false }],
  },
  {
    id: 'perk_stone_200',
    tileType: 'stone',
    requiredLevel: 200,
    name: '불멸의 의지',
    description: '최대 체력이 30% 증가합니다.',
    effects: [{ type: 'maxHp', value: 0.3, isMultiplier: true }],
  },
];
