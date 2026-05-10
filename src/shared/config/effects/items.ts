import { EffectDefinition } from './types';

export const craftedEffects: Record<string, EffectDefinition> = {
  mastery_seal: {
    id: 'mastery_seal',
    name: 'Mastery Seal',
    nameKo: '숙련의 인장',
    type: 'stackable',
    maxStack: 10,
    image: 'MasterySealRelic',
    description: 'Increases mastery EXP gained from mining.',
    descriptionKo: '채굴 시 획득하는 숙련도를 고정 수치만큼 증가시킵니다.',
    bonus: { stat: 'masteryExpFlat', value: 5 },
    requirements: {
      crimsonstone: 20,
      galestone: 15,
      fervorstone: 10,
      goldCoins: 1000,
    },
  },
};
