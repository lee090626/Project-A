'use client';

import React, { useEffect, useState } from 'react';
import { ToastMessage, ToastType } from '@/shared/types/game';
import AtlasSprite from './AtlasSprite';
import { atlasMap } from '@/shared/config/atlasMap';
import type { AtlasIconName } from '@/shared/config/atlasMap';

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const hasItemChips = !!toast.items?.length;

  useEffect(() => {
    // Mount animation
    const timer = setTimeout(() => setIsVisible(true), 10);

    // Auto remove timer
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300); // Wait for exit animation
    }, toast.duration || 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [toast, onRemove]);

  const getStyleByType = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400';
      case 'error':
        return 'border-rose-500/50 bg-rose-950/40 text-rose-400';
      case 'warning':
        return 'border-amber-500/50 bg-amber-950/40 text-amber-400';
      default:
        return 'border-blue-500/50 bg-blue-950/40 text-blue-400';
    }
  };

  const isAtlasIconName = (name: string | null): name is AtlasIconName => {
    return !!name && name in atlasMap;
  };

  return (
    <div
      className={`
        pointer-events-auto
        flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl
        transition-all duration-300 ease-out
        ${getStyleByType(toast.type)}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}
      `}
      aria-label={
        hasItemChips
          ? toast.items?.map((item) => `${item.label} x${item.amount}`).join(', ')
          : undefined
      }
    >
      {hasItemChips ? (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-black tracking-tight leading-tight opacity-50 mb-0.5">
            {toast.message}
          </span>
          <div className="flex flex-wrap gap-2">
            {toast.items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950/45 px-2.5 py-2"
                aria-label={`${item.label} x${item.amount}`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/30">
                  {isAtlasIconName(item.image) ? (
                    <AtlasSprite name={item.image} alt={item.label} size={30} />
                  ) : (
                    <span className="text-sm font-black text-white/70">?</span>
                  )}
                </div>
                <span className="font-mono text-sm font-black text-white">
                  x{item.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <span className="text-sm font-black tracking-tight leading-tight opacity-50 mb-0.5">
            {toast.type}
          </span>
          <p className="text-base md:text-lg font-bold tracking-tighter text-white">
            {toast.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default Toast;
