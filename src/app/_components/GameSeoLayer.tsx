/**
 * 게임 canvas가 시작되기 전 보조 기술에 노출되는 짧은 실행 화면 설명입니다.
 */
export function GameSeoLayer() {
  return (
    <div className="sr-only">
      <div className="space-y-6">
        <h1 className="text-5xl md:text-8xl font-black text-[#f4dfb8] tracking-tighter">
          Drilling RPG
        </h1>
        <h2 className="pixel-font text-xl md:text-3xl font-bold text-cyan-500 max-w-3xl mx-auto">
          Deep Abyss Exploration
        </h2>
      </div>

      <div className="pixel-font grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl text-[#f4dfb8] font-medium text-[10px]">
        <div className="space-y-2">
          <h3 className="font-black text-[#d0b886]">Resource Extraction</h3>
          <p className="leading-relaxed">Circle ores, crafting materials, and local save progress</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-black text-[#d0b886]">Combat Systems</h3>
          <p className="leading-relaxed">Abyssal Lord Encounters</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-black text-[#d0b886]">Tech Upgrades</h3>
          <p className="leading-relaxed">Essence, relic, and equipment growth</p>
        </div>
      </div>
    </div>
  );
}
