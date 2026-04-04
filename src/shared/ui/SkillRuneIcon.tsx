import React from 'react';
import { SKILL_RUNES } from '../config/skillRuneData';
import { Rarity } from '../types/game';

export const rarityColors: Record<string, string> = {
  Common: 'from-zinc-800 to-zinc-900 border-zinc-700 text-zinc-400',
  Uncommon: 'from-emerald-900/40 to-emerald-950 border-emerald-900 text-emerald-400 glow-emerald',
  Rare: 'from-blue-900/40 to-blue-950 border-blue-900 text-blue-400 glow-blue',
  Epic: 'from-purple-900/40 to-purple-950 border-purple-900 text-purple-400 glow-purple',
  Radiant: 'from-rose-900/40 to-rose-950 border-rose-900 text-rose-400 glow-rose',
  Legendary: 'from-amber-900/40 to-amber-950 border-amber-900/50 text-amber-400 glow-amber',
  Mythic: 'from-red-900/40 to-red-950 border-red-900/50 text-red-500 glow-red',
  Ancient: 'from-cyan-900/40 to-cyan-950 border-cyan-900/50 text-cyan-400 glow-cyan',
};

interface SkillRuneIconProps {
  runeId: string;
  rarity: Rarity;
  size?: string;
  className?: string;
}

export default function SkillRuneIcon({ runeId, rarity, size = 'w-16 h-16', className = '' }: SkillRuneIconProps) {
  const runeDef = SKILL_RUNES[runeId];
  if (!runeDef) return <div className={`${size} bg-zinc-900 rounded-2xl ${className}`} />;

  const themeClass = rarityColors[rarity] || rarityColors.Common;
  const imgSrc = typeof runeDef.image === 'string' ? runeDef.image : (runeDef.image.src || runeDef.image);

  return (
    <div className={`relative ${size} flex flex-col items-center justify-center rounded-2xl border bg-linear-to-br ${themeClass} overflow-hidden shadow-inner ${className}`}>
      {/* Background glow for high tiers */}
      {['Legendary', 'Mythic', 'Ancient', 'Radiant'].includes(rarity) && (
        <>
          <div className="absolute -inset-full bg-linear-to-r from-transparent via-white/10 to-transparent animate-[spin_4s_linear_infinite]" />
          <div className="absolute inset-0 bg-current opacity-10 animate-pulse" />
        </>
      )}
      <div className="relative z-10 w-[70%] h-[70%] flex items-center justify-center">
        <img 
          src={imgSrc} 
          alt={runeDef.name} 
          className="w-full h-full object-contain drop-shadow-2xl" 
        />
      </div>
    </div>
  );
}
