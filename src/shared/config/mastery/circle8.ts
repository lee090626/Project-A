import { MasteryPerkDef } from './types';

export const circle8MasteryPerks: MasteryPerkDef[] = [
  // mimicite
  {
    id: 'perk_mimicite_50',
    tileType: 'mimicite',
    requiredLevel: 50,
    name: '의태의 전술',
    description: '이동 속도가 20% 증가합니다.',
    effects: [{ type: 'moveSpeed', value: 0.2, isMultiplier: true }],
  },
  {
    id: 'perk_mimicite_100',
    tileType: 'mimicite',
    requiredLevel: 100,
    name: '유령 드릴',
    description: '채굴 속도가 15% 증가합니다.',
    effects: [{ type: 'miningSpeed', value: 0.15, isMultiplier: true }],
  },
  {
    id: 'perk_mimicite_150',
    tileType: 'mimicite',
    requiredLevel: 150,
    name: '거짓된 무게',
    description: '이동 속도가 40% 증가합니다.',
    effects: [{ type: 'moveSpeed', value: 0.4, isMultiplier: true }],
  },
  {
    id: 'perk_mimicite_200',
    tileType: 'mimicite',
    requiredLevel: 200,
    name: '완전한 의태',
    description: '이동 및 채굴 속도가 30% 증가합니다.',
    effects: [
      { type: 'moveSpeed', value: 0.3, isMultiplier: true },
      { type: 'miningSpeed', value: 0.3, isMultiplier: true },
    ],
  },
  // lurerstone
  {
    id: 'perk_lurerstone_50',
    tileType: 'lurerstone',
    requiredLevel: 50,
    name: '유혹의 비늘',
    description: '행운이 100 증가합니다.',
    effects: [{ type: 'luck', value: 100, isMultiplier: false }],
  },
  {
    id: 'perk_lurerstone_100',
    tileType: 'lurerstone',
    requiredLevel: 100,
    name: '환각의 행운',
    description: '행운이 300 증가합니다.',
    effects: [{ type: 'luck', value: 300, isMultiplier: false }],
  },
  {
    id: 'perk_lurerstone_150',
    tileType: 'lurerstone',
    requiredLevel: 150,
    name: '기만의 향기',
    description: '행운이 50% 증가합니다.',
    effects: [{ type: 'luck', value: 0.5, isMultiplier: true }],
  },
  {
    id: 'perk_lurerstone_200',
    tileType: 'lurerstone',
    requiredLevel: 200,
    name: '강탈자의 환상',
    description: '행운이 200% 증가합니다.',
    effects: [{ type: 'luck', value: 2.0, isMultiplier: true }],
  },
  // phantomite
  {
    id: 'perk_phantomite_50',
    tileType: 'phantomite',
    requiredLevel: 50,
    name: '망령의 신속함',
    description: '채굴 속도가 20% 증가합니다.',
    effects: [{ type: 'miningSpeed', value: 0.2, isMultiplier: true }],
  },
  {
    id: 'perk_phantomite_100',
    tileType: 'phantomite',
    requiredLevel: 100,
    name: '실체 없는 타격',
    description: '채굴 공격력이 40% 증가합니다.',
    effects: [{ type: 'miningPower', value: 0.4, isMultiplier: true }],
  },
  {
    id: 'perk_phantomite_150',
    tileType: 'phantomite',
    requiredLevel: 150,
    name: '그림자 파동',
    description: '채굴 속도가 50% 증가합니다.',
    effects: [{ type: 'miningSpeed', value: 0.5, isMultiplier: true }],
  },
  {
    id: 'perk_phantomite_200',
    tileType: 'phantomite',
    requiredLevel: 200,
    name: '심연의 망령',
    description: '채굴 속도 60%, 공격력 60% 증가합니다.',
    effects: [
      { type: 'miningSpeed', value: 0.6, isMultiplier: true },
      { type: 'miningPower', value: 0.6, isMultiplier: true },
    ],
  },
];
