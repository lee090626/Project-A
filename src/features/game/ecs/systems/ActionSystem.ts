import { GameWorld } from '@/entities/world/model';
import { handleEconomyAction } from './actions/economyActions';
import { handleRuneAction } from './actions/runeActions';
import { handleWorldAction } from './actions/worldActions';

/**
 * 액션 핸들러 함수 타입 정의
 * @param world - 게임 월드 객체
 * @param action - 액션 타입 문자열
 * @param data - 액션에 필요한 데이터
 */
type ActionHandler = (world: GameWorld, action: string, data: any) => void;

/**
 * 액션 도메인별 핸들러 맵 (Strategy Pattern)
 * 각 액션 타입에 따라 적절한 핸들러 함수로 라우팅합니다.
 */
const actionHandlers: Record<string, ActionHandler> = {
  // 경제 관련 액션: 강화, 판매, 제작
  upgrade: handleEconomyAction,
  sell: handleEconomyAction,
  craft: handleEconomyAction,

  // 룬 관련 액션: 소환, 장착, 해제, 합성
  summonRune: handleRuneAction,
  equipRune: handleRuneAction,
  unequipRune: handleRuneAction,
  synthesizeRunes: handleRuneAction,
};

/**
 * 게임 내 플레이어의 명시적인 액션(아이템 구매, 강화, 제련, 차원 이동 등)을 처리하는 시스템입니다.
 * Strategy Pattern을 사용하여 액션 타입에 따라 적절한 핸들러로 라우팅합니다.
 * 
 * @param world - 게임 월드 객체
 * @param payload - 액션 데이터 (action, data 포함)
 * @param payload.action - 실행할 액션 타입 (예: 'upgrade', 'sell', 'summonRune' 등)
 * @param payload.data - 액션에 필요한 데이터
 * 
 * @example
 * // 강화 액션
 * handlePlayerAction(world, { action: 'upgrade', data: { itemId: 'sword', level: 5 } });
 * 
 * @example
 * // 룬 소환 액션
 * handlePlayerAction(world, { action: 'summonRune', data: { runeType: 'fire' } });
 */
export function handlePlayerAction(world: GameWorld, payload: any) {
  const { action, data } = payload;
  const handler = actionHandlers[action] || handleWorldAction;

  handler(world, action, data);
}
