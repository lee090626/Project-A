import { Artifact } from '../types/game';

/**
 * 게임 내에 존재하는 모든 액티브 유물의 상세 정의입니다.
 */
export const ARTIFACT_DATA: Record<string, Artifact> = {
  'dimension_0_core': {
    id: 'dimension_0_core',
    name: 'Seismic Shock',
    description: 'Releases a powerful shockwave that damages all tiles and monsters in a 5x5 area.',
    icon: '🌋',
    cooldownMs: 15000,
  },
  'dimension_1_core': {
    id: 'dimension_1_core',
    name: 'Tectonic Rift',
    description: 'Instantly shatters the 3 tiles directly in front of you with extreme force.',
    icon: '💎',
    cooldownMs: 10000,
  }
};
