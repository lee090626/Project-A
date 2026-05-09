import { EffectDefinition } from './effects/types';
import { essenceEffects } from './effects/essences';
import { relicEffects } from './effects/relics';
import { craftedEffects } from './effects/items';

export type { EffectItemType, EffectDefinition } from './effects/types';

/**
 * 보유만으로 패시브 효과를 제공하는 모든 Effect 데이터 통합 정의입니다.
 * Essence, Relic, Crafted Effect는 모두 이 컬렉션에 포함됩니다.
 */
export const EFFECT_DATA: Record<string, EffectDefinition> = {
  ...essenceEffects,
  ...relicEffects,
  ...craftedEffects,
};

/**
 * 도감이나 UI 렌더링에 사용할 Effect 리스트 배열입니다.
 */
export const EFFECT_LIST = Object.values(EFFECT_DATA);
