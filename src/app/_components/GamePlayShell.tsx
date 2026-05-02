import GameEngine from '@/features/game/GameEngine';
import { GameSeoLayer } from './GameSeoLayer';

/**
 * 전체 화면 게임 실행 페이지의 공통 shell입니다.
 */
export function GamePlayShell() {
  return (
    <main className="fixed inset-0 bg-zinc-950 overflow-hidden select-none">
      <GameSeoLayer />

      <div className="relative z-60 w-full h-full bg-transparent">
        <GameEngine />
      </div>
    </main>
  );
}
