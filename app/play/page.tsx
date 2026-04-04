import GameEngine from '@/src/app/game/GameEngine';

export const dynamic = 'force-static';

/**
 * 게임의 메인 플레이 페이지 엔트리 포인트입니다.
 * GameEngine 컴포넌트를 렌더링하며 화면 전체를 고정 레이아웃으로 설정합니다.
 */
export default function Play() {
  return (
    <main className="fixed inset-0 bg-black overflow-hidden select-none">
      {/* 
          High-Visibility SEO Layer for AdSense & Crawlers:
          자바스크립트가 실행되기 전, 서버에서 바로 내려주는 텍스트들입니다.
          애드센스 봇이 "내용 없음"으로 판단하는 것을 방지합니다.
      */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-8 z-0">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-7xl font-black text-white/20 tracking-tighter uppercase">
            Drilling RPG
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-zinc-600 max-w-2xl mx-auto">
            The Ultimate Browser-Based Deep Abyss Mining Exploration Action Role-Playing Game
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl text-zinc-700">
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <h3 className="font-bold text-zinc-500 mb-2">Deep Exploration</h3>
            <p className="text-sm">Explore infinite underground worlds filled with rare minerals like Diamonds, Rubies, and Uranium.</p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <h3 className="font-bold text-zinc-500 mb-2">Epic Battles</h3>
            <p className="text-sm">Defeat giant dimensional bosses using powerful specialized drills and AI pet drones.</p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <h3 className="font-bold text-zinc-500 mb-2">Infinite Growth</h3>
            <p className="text-sm">Upgrade your drilling stats, research new technologies, and collect ancient artifacts.</p>
          </div>
        </div>
      </div>

      {/* Actual Game Engine (Canvas will cover the text above) */}
      <div className="relative z-10 w-full h-full bg-transparent">
        <GameEngine />
      </div>
    </main>
  );
}
