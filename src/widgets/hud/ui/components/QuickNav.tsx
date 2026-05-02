import React from 'react';
import { AtlasIcon } from '../AtlasIcon';
import { atlasMap } from '@/shared/config/atlasMap';

interface NavItem {
  label: string;
  key: string;
  icon?: string;
  iconKey?: keyof typeof atlasMap;
  onClick?: () => void;
  color: string;
}

interface QuickNavProps {
  items: NavItem[];
}

/**
 * 하단 중앙의 퀵 액세스 네비게이션 메뉴 컴포넌트입니다.
 */
export const QuickNav: React.FC<QuickNavProps> = React.memo(({ items }) => {
  return (
    <div className="absolute left-1/2 bottom-3 md:bottom-5 lg:bottom-6 -translate-x-1/2 flex gap-1.5 md:gap-2.5 lg:gap-3 pointer-events-auto z-20">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className="group relative flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-white/60 rounded-xl p-0.5 transition-all"
        >
          <div className="absolute -top-8 md:-top-9 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-950/90 text-white text-[10px] font-bold rounded-md opacity-0 md:group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-white/15 shadow-lg backdrop-blur-md">
            {item.label}
          </div>
          <div className="w-14 h-14 md:w-16 md:h-16 bg-zinc-950/75 backdrop-blur-xl border border-white/15 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:border-white/35 group-hover:bg-zinc-900/85 active:scale-95 relative overflow-hidden shadow-[0_10px_24px_-12px_rgba(0,0,0,0.75)]">
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-10"
              style={{ backgroundColor: item.color }}
            />

            <div className="relative w-12 h-12 md:w-14 md:h-14 z-10 transition-all duration-200 flex items-center justify-center">
              {item.iconKey ? (
                <AtlasIcon name={item.iconKey as any} alt={item.label} size={38} />
              ) : (
                <span className="text-2xl md:text-3xl drop-shadow-lg">{item.icon}</span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
});
