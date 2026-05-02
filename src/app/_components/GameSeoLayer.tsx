/**
 * 크롤러가 자바스크립트 실행 전에도 게임 핵심 콘텐츠를 인식하도록 숨김 텍스트를 제공합니다.
 */
export function GameSeoLayer() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 space-y-12 z-0 opacity-0 pointer-events-none">
      <div className="space-y-6">
        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter">
          Drilling RPG
        </h1>
        <h2 className="text-xl md:text-3xl font-bold text-cyan-500 max-w-3xl mx-auto tracking-widest">
          Deep Abyss Exploration
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl text-white font-medium tracking-widest text-[10px]">
        <div className="space-y-2">
          <h3 className="font-black text-zinc-500">Resource Extraction</h3>
          <p className="leading-relaxed">Diamonds, Rubies, Uranium</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-black text-zinc-500">Combat Systems</h3>
          <p className="leading-relaxed">Abyssal Lord Encounters</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-black text-zinc-500">Tech Upgrades</h3>
          <p className="leading-relaxed">Passive Artifact Magic</p>
        </div>
      </div>
    </div>
  );
}
