import { ArtifactDefinition } from './artifacts/types';
import { essenceArtifacts } from './artifacts/essences';
import { relicArtifacts } from './artifacts/relics';
import { craftedEffects } from './artifacts/items';

// 타입 재내보내기 (하위 호환성 유지)
export type { ArtifactType, ArtifactDefinition } from './artifacts/types';
export type EffectDefinition = ArtifactDefinition;

/**
 * 보유만으로 패시브 효과를 제공하는 모든 Effect 데이터 통합 정의입니다.
 * Essence, Relic, Crafted Effect는 모두 이 컬렉션에 포함됩니다.
 */
export const EFFECT_DATA: Record<string, EffectDefinition> = {
  ...essenceArtifacts,
  ...relicArtifacts,
  ...craftedEffects,
};

/**
 * 도감이나 UI 렌더링에 사용할 Effect 리스트 배열입니다.
 */
export const EFFECT_LIST = Object.values(EFFECT_DATA);

export const ARTIFACT_DATA = EFFECT_DATA;
export const ARTIFACT_LIST = EFFECT_LIST;
