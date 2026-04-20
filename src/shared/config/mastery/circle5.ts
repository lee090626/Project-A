import { MasteryPerkDef } from './types';

export const circle5MasteryPerks: MasteryPerkDef[] = [
  // ragestone
  {
    id: 'perk_ragestone_50',
    tileType: 'ragestone',
    requiredLevel: 50,
    name: '분노의 일격',
    description: '치명타 확률이 2% 증가합니다.',
    effects: [{ type: 'critRate', value: 0.02, isMultiplier: false }],
  },
  {
    id: 'perk_ragestone_100',
    tileType: 'ragestone',
    requiredLevel: 100,
    name: '폭발적 분출',
    description: '치명타 피해량이 20% 증가합니다.',
    effects: [{ type: 'critDmg', value: 0.2, isMultiplier: false }],
  },
  {
    id: 'perk_ragestone_150',
    tileType: 'ragestone',
    requiredLevel: 150,
    name: '격렬한 분노',
    description: '치명타 확률이 5% 증가합니다.',
    effects: [{ type: 'critRate', value: 0.05, isMultiplier: false }],
  },
  {
    id: 'perk_ragestone_200',
    tileType: 'ragestone',
    requiredLevel: 200,
    name: '진노의 현신',
    description: '치명타 피해량이 50% 증가합니다.',
    effects: [{ type: 'critDmg', value: 0.5, isMultiplier: false }],
  },
  // cinderstone
  {
    id: 'perk_cinderstone_50',
    tileType: 'cinderstone',
    requiredLevel: 50,
    name: '잿더미 속 예리함',
    description: '치명타 확률이 3% 증가합니다.',
    effects: [{ type: 'critRate', value: 0.03, isMultiplier: false }],
  },
  {
    id: 'perk_cinderstone_100',
    tileType: 'cinderstone',
    requiredLevel: 100,
    name: '검은 고통',
    description: '치명타 피해량이 30% 증가합니다.',
    effects: [{ type: 'critDmg', value: 0.3, isMultiplier: false }],
  },
  {
    id: 'perk_cinderstone_150',
    tileType: 'cinderstone',
    requiredLevel: 150,
    name: '꺼지지 않는 불꽃',
    description: '치명타 확률이 8% 증가합니다.',
    effects: [{ type: 'critRate', value: 0.08, isMultiplier: false }],
  },
  {
    id: 'perk_cinderstone_200',
    tileType: 'cinderstone',
    requiredLevel: 200,
    name: '잿빛 학살자',
    description: '치명타 확률 10%, 피해량 40% 증가합니다.',
    effects: [
      { type: 'critRate', value: 0.1, isMultiplier: false },
      { type: 'critDmg', value: 0.4, isMultiplier: false },
    ],
  },
  // furystone
  {
    id: 'perk_furystone_50',
    tileType: 'furystone',
    requiredLevel: 50,
    name: '격노의 타격',
    description: '치명타 피해량이 40% 증가합니다.',
    effects: [{ type: 'critDmg', value: 0.4, isMultiplier: false }],
  },
  {
    id: 'perk_furystone_100',
    tileType: 'furystone',
    requiredLevel: 100,
    name: '광폭 충격',
    description: '치명타 확률이 10% 증가합니다.',
    effects: [{ type: 'critRate', value: 0.1, isMultiplier: false }],
  },
  {
    id: 'perk_furystone_150',
    tileType: 'furystone',
    requiredLevel: 150,
    name: '학살의 의지',
    description: '치명타 피해량이 100% 증가합니다.',
    effects: [{ type: 'critDmg', value: 1.0, isMultiplier: false }],
  },
  {
    id: 'perk_furystone_200',
    tileType: 'furystone',
    requiredLevel: 200,
    name: '영원한 복수자',
    description: '치명타 확률 20%, 피해량 150% 증가합니다.',
    effects: [
      { type: 'critRate', value: 0.2, isMultiplier: false },
      { type: 'critDmg', value: 1.5, isMultiplier: false },
    ],
  },
];
