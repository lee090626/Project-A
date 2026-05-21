import { PlayerStats } from '@/shared/types/game';
import { MINERALS } from '@/shared/config/mineralData';
import AtlasIcon from '@/shared/ui/AtlasIcon';

interface EncyclopediaDetailProps {
  id: string;
  tab: 'minerals' | 'bosses';
  stats: PlayerStats;
  bossesData: any[]; // BOSSES array passed from parent
}

export function EncyclopediaDetail({ id, tab, stats, bossesData }: EncyclopediaDetailProps) {

  if (tab === 'minerals') {
    const mineral = MINERALS.find((m) => m.key === id);
    const isDiscovered = stats.discoveredMinerals.includes(id);
    if (!mineral) return null;

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-start mb-8">
          <span
            className="pixel-badge text-[10px] font-black px-3 py-1.5"
            style={{
              backgroundColor: isDiscovered ? `${mineral.color}20` : '#242a24',
              borderColor: isDiscovered ? mineral.color : '#6f6646',
              color: isDiscovered ? mineral.color : '#d0b886',
            }}
          >
            {isDiscovered ? 'Mineral' : 'Unknown'}
          </span>
          <span className="text-[9px] font-black text-[#7d6648]">
            ID: {id}
          </span>
        </div>

        <div className="pixel-icon-box w-40 h-40 flex items-center justify-center text-8xl mx-auto mb-10 relative">
          <div
            className={`w-36 h-36 flex items-center justify-center ${!isDiscovered ? 'opacity-25' : ''}`}
          >
            {isDiscovered ? (
              mineral.image ? (
                <AtlasIcon name={mineral.image} size={112} />
              ) : (
                <span className="text-8xl">{mineral.icon}</span>
              )
            ) : (
              '?'
            )}
          </div>
          {!isDiscovered && (
            <div className="absolute inset-0 flex items-center justify-center text-[#d0b886] font-black text-5xl opacity-45">
              Locked
            </div>
          )}
          {isDiscovered && (
            <div
              className="absolute inset-0 opacity-20"
              style={{ boxShadow: `inset 0 0 40px ${mineral.color}` }}
            />
          )}
        </div>

        <h3 className="text-3xl font-black text-[#f4dfb8] text-center mb-6">
          {isDiscovered ? mineral.name : 'Unknown Mineral'}
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatBox
            label="Min Depth"
            value={isDiscovered ? `${mineral.minDepth}m` : '???'}
            color="#2c8f87"
          />
          <div className="pixel-card pixel-card-muted p-4 text-center flex flex-col items-center justify-center">
            <div className="text-[8px] text-[#7d6648] font-bold mb-1">
              Base Value
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-amber-500">
                {isDiscovered ? mineral.basePrice.toLocaleString() : '???'}
              </span>
              {isDiscovered && <AtlasIcon name="GoldIcon" size={14} />}
            </div>
          </div>
        </div>

        <div className="pixel-card pixel-card-muted p-6 leading-relaxed text-xs text-[#d0b886] text-center">
          {isDiscovered
            ? mineral.description
            : 'Data is Locked. Please mine this mineral to unlock the data.'}
        </div>
      </div>
    );
  } else {
    const boss = bossesData.find((b) => b.id === id);
    const isEncountered = stats.encounteredBossIds.includes(id);
    if (!boss) return null;

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-start mb-8">
          <span className="pixel-badge text-[#b84a3c] text-[9px] font-black px-3 py-1.5 border-[#8f2f2f]!">
            Boss Class
          </span>
          <span className="text-[9px] font-black text-[#7d6648]">
            Depth: {boss.depth}m
          </span>
        </div>

        <div className="pixel-icon-box w-40 h-40 flex items-center justify-center mx-auto mb-10 relative">
          <div className={!isEncountered ? 'opacity-25' : ''}>
            {isEncountered ? (
              <AtlasIcon name={boss.imagePath as any} size={128} />
            ) : (
              <span className="text-8xl">💀</span>
            )}
          </div>
          {!isEncountered && (
            <div className="absolute inset-0 flex items-center justify-center text-[#8f2f2f] font-black text-5xl opacity-40">
              Missing
            </div>
          )}
        </div>

        <h3 className="text-3xl font-black text-[#f4dfb8] text-center mb-6">
          {isEncountered ? boss.name : 'Unknown Entity'}
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatBox
            label="HP"
            value={isEncountered && boss.stats ? boss.stats.maxHp.toLocaleString() : '???'}
            color="#ef4444"
          />
          <StatBox
            label="ATK"
            value={isEncountered && boss.stats ? boss.stats.power.toLocaleString() : '???'}
            color="#f59e0b"
          />
        </div>

        <div className="pixel-card pixel-card-muted p-6 leading-relaxed text-xs text-[#d0b886] text-center">
          {isEncountered
            ? boss.description
            : 'Strong biological signals detected in the depths. Data will be recorded upon encounter.'}
        </div>
      </div>
    );
  }
}

export function ProgressBox({
  label,
  current,
  total,
  color,
}: {
  label: string;
  current: number;
  total: number;
  color: string;
}) {
  const percent = (current / total) * 100;
  return (
    <div className="pixel-card pixel-card-muted p-4">
      <div className="flex justify-between items-end mb-2">
        <span className="text-[9px] font-black text-[#7d6648]">{label}</span>
        <span className="text-xs font-black text-[#f4dfb8] tabular-nums">
          {current} / {total}
        </span>
      </div>
      <div className="pixel-bar h-2">
        <div
          className="pixel-bar-fill h-full transition-all duration-1000"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="pixel-card pixel-card-muted p-4 text-center">
      <div className="text-[8px] text-[#7d6648] font-bold mb-1">{label}</div>
      <div className="text-sm font-black" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
