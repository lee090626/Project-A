/**
 * 시스템 간의 결합도를 낮추기 위한 초경량 이벤트 버스입니다.
 * 직접적인 함수 호출 대신 이벤트를 발행(Publish)하고 구독(Subscribe)하여 소통합니다.
 */
export type MessageHandler<T = any> = (payload: T) => void;

class MessageBus {
  private handlers: Map<string, Set<MessageHandler>> = new Map();

  /** 특정 주제(Topic)에 대한 핸들러를 등록합니다. */
  public on<T = any>(topic: string, handler: MessageHandler<T>): void {
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set());
    }
    this.handlers.get(topic)!.add(handler);
  }

  /** 특정 주제의 핸들러 등록을 해제합니다. */
  public off<T = any>(topic: string, handler: MessageHandler<T>): void {
    const topicHandlers = this.handlers.get(topic);
    if (topicHandlers) {
      topicHandlers.delete(handler);
    }
  }

  /** 특정 주제로 메시지를 발행합니다. */
  public emit<T = any>(topic: string, payload: T): void {
    const topicHandlers = this.handlers.get(topic);
    if (topicHandlers) {
      topicHandlers.forEach((handler) => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`[MessageBus] Error in topic "${topic}":`, error);
        }
      });
    }
  }

  /** 모든 핸들러를 제거합니다. (엔진 재시작 시 활용) */
  public clear(): void {
    this.handlers.clear();
  }
}

// 전역 싱글턴 인스턴스 (워커 스레드 내에서만 사용)
export const messageBus = new MessageBus();

/** 
 * 시스템 간 공유되는 공통 토픽 상수 정의 
 */
export const TOPIC = {
  /** 플레이어 스탯 재계산 필요 시 발행 */
  RECALCULATE_PLAYER_STATS: 'RECALCULATE_PLAYER_STATS',
} as const;
