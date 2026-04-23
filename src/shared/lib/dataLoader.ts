import { Entity } from '../types/game';
import { BASE_LAYOUT_FILE, ENTITIES_FILE } from '../config/coreDataFiles';
import { withBasePath } from './basePath';

/**
 * 베이스 캠프의 레이아웃 데이터를 서버로부터 불러옵니다.
 * @returns 베이스 캠프 타일 맵 데이터 (2차원 배열) 또는 로드 실패 시 null
 */
export async function fetchBaseLayout(): Promise<number[][] | null> {
  try {
    const res = await fetch(withBasePath(BASE_LAYOUT_FILE));
    const data = await res.json();
    return data.tiles;
  } catch (err) {
    console.error('베이스 레이아웃 로드 실패:', err);
    return null;
  }
}

/**
 * 게임 내에 배치된 엔티티(NPC, 오브젝트 등) 데이터를 불러옵니다.
 * @returns 엔티티 목록 배열
 */
export async function fetchEntities(): Promise<Entity[]> {
  try {
    const res = await fetch(withBasePath(ENTITIES_FILE));
    const data = await res.json();
    return data.entities || [];
  } catch (err) {
    console.error('엔티티 데이터 로드 실패:', err);
    return [];
  }
}
