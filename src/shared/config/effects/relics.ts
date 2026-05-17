import { EffectDefinition } from './types';

export const ASMODEUS_RING_EFFECT_ID = 'CIRCLE3_MINERAL_DEFENSE_IGNORE';
export const ASMODEUS_RING_TARGET_CIRCLE_ID = 3;
export const CERBERUS_FANG_EFFECT_ID = 'CIRCLE4_MINERAL_DEFENSE_IGNORE';
export const CERBERUS_FANG_TARGET_CIRCLE_ID = 4;
export const FAFNIR_HOARD_EFFECT_ID = 'CIRCLE5_MINERAL_DEFENSE_IGNORE';
export const FAFNIR_HOARD_TARGET_CIRCLE_ID = 5;

export const BOSS_RELIC_DEFENSE_IGNORE_MAX_STACK = 10;
export const BOSS_RELIC_DEFENSE_IGNORE_PER_STACK = 0.05;
export const BOSS_RELIC_DEFENSE_IGNORE_CAP =
  BOSS_RELIC_DEFENSE_IGNORE_MAX_STACK * BOSS_RELIC_DEFENSE_IGNORE_PER_STACK;

export const BOSS_RELIC_DEFENSE_IGNORE_RULES = [
  {
    effectId: ASMODEUS_RING_EFFECT_ID,
    targetCircleId: ASMODEUS_RING_TARGET_CIRCLE_ID,
  },
  {
    effectId: CERBERUS_FANG_EFFECT_ID,
    targetCircleId: CERBERUS_FANG_TARGET_CIRCLE_ID,
  },
  {
    effectId: FAFNIR_HOARD_EFFECT_ID,
    targetCircleId: FAFNIR_HOARD_TARGET_CIRCLE_ID,
  },
] as const;

export const relicEffects: Record<string, EffectDefinition> = {
  relic_asmodeus_ring: {
    id: 'relic_asmodeus_ring',
    name: "Asmodeus's Ring",
    nameKo: '아스모데우스의 반지',
    type: 'stackable',
    maxStack: BOSS_RELIC_DEFENSE_IGNORE_MAX_STACK,
    image: 'AsmodeusRingRelic',
    description: 'Ignores Circle 3 mineral defense per stack.',
    descriptionKo: '보유량에 따라 제3원 광물의 방어력을 일부 무시합니다.',
    effectId: ASMODEUS_RING_EFFECT_ID,
    effectDescription: 'Ignores C3 mineral defense by 5% per stack',
    effectDescriptionKo: '중첩당 C3 광물 방어력 5% 무시',
  },
  relic_cerberus_fang: {
    id: 'relic_cerberus_fang',
    name: "Cerberus's Devouring Fang",
    nameKo: '케르베로스의 포식 송곳니',
    type: 'stackable',
    maxStack: BOSS_RELIC_DEFENSE_IGNORE_MAX_STACK,
    image: 'Cerberus',
    description: 'Ignores Circle 4 mineral defense per stack.',
    descriptionKo: '보유량에 따라 제4원 광물의 방어력을 일부 무시합니다.',
    effectId: CERBERUS_FANG_EFFECT_ID,
    effectDescription: 'Ignores C4 mineral defense by 5% per stack',
    effectDescriptionKo: '중첩당 C4 광물 방어력 5% 무시',
  },
  relic_fafnir_hoard: {
    id: 'relic_fafnir_hoard',
    name: "Fafnir's Golden Hoard",
    nameKo: '파프니르의 황금 보물',
    type: 'stackable',
    maxStack: BOSS_RELIC_DEFENSE_IGNORE_MAX_STACK,
    image: 'FafnirHoardRelic',
    description: 'Ignores Circle 5 mineral defense per stack.',
    descriptionKo: '보유량에 따라 제5원 광물의 방어력을 일부 무시합니다.',
    effectId: FAFNIR_HOARD_EFFECT_ID,
    effectDescription: 'Ignores C5 mineral defense by 5% per stack',
    effectDescriptionKo: '중첩당 C5 광물 방어력 5% 무시',
  },
};
