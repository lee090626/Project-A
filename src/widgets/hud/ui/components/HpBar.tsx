import React from 'react';
import { ActiveEffect, StatusType } from '@/shared/types/game';

interface HpBarProps {
  hp: number;
  maxHp: number;
  activeEffects?: ActiveEffect[];
}

const STATUS_EFFECT_META: Record<StatusType, { icon: string; label: string; toneClassName: string }> = {
  STUN: { icon: '✦', label: 'Stun', toneClassName: 'text-amber-200 bg-amber-500/20 border-amber-400/40' },
  SLOW: { icon: '🕸', label: 'Slow', toneClassName: 'text-sky-200 bg-sky-500/20 border-sky-400/40' },
  BURN: { icon: '🔥', label: 'Burn', toneClassName: 'text-orange-200 bg-orange-500/20 border-orange-400/40' },
  FREEZE: { icon: '❄', label: 'Freeze', toneClassName: 'text-cyan-200 bg-cyan-500/20 border-cyan-400/40' },
  POISON: { icon: '☠', label: 'Poison', toneClassName: 'text-lime-200 bg-lime-500/20 border-lime-400/40' },
  BUFF_POWER: { icon: '⚔', label: 'Power Up', toneClassName: 'text-rose-200 bg-rose-500/20 border-rose-400/40' },
  BUFF_SPEED: { icon: '➤', label: 'Speed Up', toneClassName: 'text-emerald-200 bg-emerald-500/20 border-emerald-400/40' },
  WEAKEN: { icon: '⬇', label: 'Weaken', toneClassName: 'text-zinc-200 bg-zinc-500/20 border-zinc-400/40' },
  SHIELD: { icon: '🛡', label: 'Shield', toneClassName: 'text-indigo-200 bg-indigo-500/20 border-indigo-400/40' },
  LUCKY: { icon: '🍀', label: 'Lucky', toneClassName: 'text-green-200 bg-green-500/20 border-green-400/40' },
  INVINCIBLE: { icon: '✶', label: 'Invincible', toneClassName: 'text-yellow-100 bg-yellow-500/20 border-yellow-300/40' },
  FATIGUE: { icon: '⌛', label: 'Fatigue', toneClassName: 'text-stone-200 bg-stone-500/20 border-stone-400/40' },
  BLEED: { icon: '🩸', label: 'Bleed', toneClassName: 'text-red-200 bg-red-500/20 border-red-400/40' },
  CONFUSION: { icon: '🌀', label: 'Confusion', toneClassName: 'text-fuchsia-200 bg-fuchsia-500/20 border-fuchsia-400/40' },
  CURSE: { icon: '☾', label: 'Curse', toneClassName: 'text-violet-200 bg-violet-500/20 border-violet-400/40' },
  ENRAGE: { icon: '‼', label: 'Enrage', toneClassName: 'text-rose-200 bg-rose-600/20 border-rose-500/40' },
};

/**
 * 플레이어의 현재 체력을 시각적으로 표시하는 바 컴포넌트입니다.
 */
export const HpBar: React.FC<HpBarProps> = React.memo(({ hp, maxHp, activeEffects = [] }) => {
  const hpPercent = Math.max(0, (hp / maxHp) * 100);

  return (
    <div className="pixel-font flex flex-col gap-1 w-36 md:w-52 lg:w-64 mt-1">
      <div className="pixel-bar relative h-5 md:h-6 lg:h-7 p-[2px]">
        <div
          className={`pixel-bar-fill h-full transition-[width] duration-300 ${
            hpPercent > 50
              ? 'bg-[#24c77b]'
              : hpPercent > 20
                ? 'bg-[#e8973c]'
                : 'bg-[#d94b4b] animate-pulse'
          }`}
          style={{ width: `${hpPercent}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white text-[10px] md:text-xs font-bold drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
            {Math.floor(hp)}{' '}
            <span className="text-white/90 text-[10px] md:text-xs hidden sm:inline">/ {maxHp}</span>
          </span>
        </div>
      </div>
      <div className="flex min-h-5 flex-wrap items-center gap-1">
        {activeEffects.map((effect) => {
          const meta = STATUS_EFFECT_META[effect.type];
          if (!meta) return null;

          return (
            <div
              key={effect.type}
              title={meta.label}
              role="img"
              aria-label={meta.label}
              className={`pixel-badge flex h-5 w-5 items-center justify-center text-[11px] md:h-6 md:w-6 md:text-xs ${meta.toneClassName}`}
            >
              <span>{meta.icon}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
