/**
 * 토스트 알림의 유형을 정의합니다.
 */
export type ToastType = 'success' | 'info' | 'warning' | 'error';

/**
 * 아이템 획득 토스트에 표시할 단일 아이템 정보입니다.
 */
export interface ToastItem {
  /** 아이템 또는 자원 ID */
  id: string;
  /** 접근성 및 fallback 표시용 이름 */
  label: string;
  /** 획득 수량 */
  amount: number;
  /** 아틀라스 이미지 ID */
  image: string | null;
}

/**
 * 화면에 표시될 토스트 알림 메시지 정보입니다.
 */
export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  /** 아이템 획득 토스트를 이미지 칩으로 렌더링하기 위한 목록 */
  items?: ToastItem[];
}

/**
 * 화면에 표시되는 파티클 효과 정보를 정의합니다.
 */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  active: boolean;
}

/**
 * 화면에 떠다니는 텍스트(대미지 표시 등) 정보를 정의합니다.
 */
export interface FloatingText {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  text: string;
  color: string;
  startY?: number;
  life: number;
  active: boolean;
}

/**
 * 게임 내 그래픽 자원들을 관리하는 인터페이스입니다.
 */
export interface GameAssets {
  player: HTMLImageElement | ImageBitmap | null;
  tileset: HTMLImageElement | ImageBitmap | null;
  baseTileset: HTMLImageElement | ImageBitmap | null;
  boss: HTMLImageElement | ImageBitmap | null;
  entities: { [path: string]: HTMLImageElement | ImageBitmap };
  resources: { [type: string]: HTMLImageElement | ImageBitmap };
  tileBitmaps?: { [key: string]: ImageBitmap };
  itemBitmaps?: { [key: string]: ImageBitmap };
}
