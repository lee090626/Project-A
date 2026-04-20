import { ArtifactDefinition } from './artifacts/types';
import { essenceArtifacts } from './artifacts/essences';
import { relicArtifacts } from './artifacts/relics';
import { craftableArtifacts } from './artifacts/items';

// 타입 재내보내기 (하위 호환성 유지)
export type { ArtifactType, ArtifactDefinition } from './artifacts/types';

/**
 * 모든 유물 데이터 통합 정의 (구 정수 + 구 성물 + 제작 아이템)
 */
export const ARTIFACT_DATA: Record<string, ArtifactDefinition> = {
  ...essenceArtifacts,
  ...relicArtifacts,
  ...craftableArtifacts,
};

/**
 * 도감이나 UI 렌더링에 사용할 유물 리스트 배열
 */
export const ARTIFACT_LIST = Object.values(ARTIFACT_DATA);
