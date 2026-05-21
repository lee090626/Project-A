import React from 'react';
import { createPortal } from 'react-dom';

interface TooltipState {
  id: string;
  name: string;
  desc: string;
  x: number;
  y: number;
  type: 'stat' | 'perk';
  details?: { label: string; value: string | number; color?: string }[];
}

interface StatTooltipProps {
  tooltip: TooltipState | null;
}

export function StatTooltip({ tooltip }: StatTooltipProps) {
  if (!tooltip || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed z-1000000 pointer-events-none -translate-x-1/2 -translate-y-full transition-all duration-300 ease-out"
      style={{
        left: tooltip.x,
        top: tooltip.y,
        opacity: 1,
      }}
    >
      <div className="pixel-card pixel-font p-4 min-w-[200px] max-w-[280px] border-emerald-500/50!">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="pixel-icon-box w-5 h-5 flex items-center justify-center border-emerald-500/40!">
            <span className="text-[12px] text-emerald-400">
              {tooltip.type === 'stat' ? '📊' : '✨'}
            </span>
          </div>
          <span className="text-xs font-black text-white">
            {tooltip.name}
          </span>
        </div>

        {tooltip.type === 'stat' && tooltip.details ? (
          <div className="space-y-1.5 mt-2">
            {tooltip.details.map((detail, idx) => (
              <div key={idx} className="flex justify-between items-center gap-4 text-[11px]">
                <span className="text-[#a89065] font-medium">{detail.label}</span>
                <span className={`font-bold tabular-nums ${detail.color || 'text-[#f4dfb8]'}`}>
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[#d0b886] font-medium leading-relaxed mt-1">
            {tooltip.desc}
          </p>
        )}
      </div>
      <div className="w-3 h-3 bg-[#2b3029] border-r-2 border-b-2 border-emerald-500/40 absolute left-1/2 -translate-x-1/2 -bottom-1.5 rotate-45" />
    </div>,
    document.body,
  );
}

export default React.memo(StatTooltip);
