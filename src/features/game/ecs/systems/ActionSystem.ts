import { GameWorld } from '@/entities/world/model';
import { ActionPayload } from '@/shared/types/worker';
import { handleEconomyAction } from './actions/economyActions';
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
  // 경제 관련 액션: 판매, 제작, 장비 재련
  sell: handleEconomyAction,
  craft: handleEconomyAction,
  rerollEquipmentOption: handleEconomyAction,
  equip: handleWorldAction,
  synthesizeEffect: handleWorldAction,
};

/**
 * 게임 내 플레이어의 명시적인 액션(판매, 제작, 제련, 차원 이동 등)을 처리하는 시스템입니다.
 * Strategy Pattern을 사용하여 액션 타입에 따라 적절한 핸들러로 라우팅합니다.
 * 
 * @param world - 게임 월드 객체
 * @param payload - 액션 데이터 (action, data 포함)
 * @param payload.action - 실행할 액션 타입 (예: 'sell', 'craft' 등)
 * @param payload.data - 액션에 필요한 데이터
 * 
 * @example
 * // 판매 액션
 * handlePlayerAction(world, { action: 'sell', data: { resource: 'iron', amount: 1 } });
 * 
 */
export function handlePlayerAction(world: GameWorld, payload: ActionPayload) {
  const { action, data } = payload;
  const handler = actionHandlers[action] || handleWorldAction;

  handler(world, action, data);
}
