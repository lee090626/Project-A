import { GamePlayShell } from '../_components/GamePlayShell';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Play Drilling RPG | Browser Mining RPG',
  description:
    'Launch Drilling RPG in the browser. Mine pixel ores, craft gear, and fight circle bosses in the current C2 to C4 build.',
  alternates: { canonical: '/play' },
};

/**
 * 게임의 메인 플레이 페이지 엔트리 포인트입니다.
 * GameEngine 컴포넌트를 렌더링하며 화면 전체를 고정 레이아웃으로 설정합니다.
 */
export default function Play() {
  return <GamePlayShell />;
}
