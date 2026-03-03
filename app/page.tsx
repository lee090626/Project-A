import GameEngine from './components/GameEngine';

export default function Home() {
  return (
    <main className="fixed inset-0 bg-black overflow-hidden select-none">
      <GameEngine />
    </main>
  );
}
