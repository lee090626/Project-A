import React, { useCallback, useEffect, useState } from 'react';
import { PlayerStats } from '@/shared/types/game';
import { GameWorld } from '@/entities/world/model';
import {
  isRewardedReviveAdEnabled,
  requestRewardedReviveAd,
} from '@/shared/lib/googleH5Ads';

interface InteractionLayerProps {
  currentStats: PlayerStats;
  showInteractionPrompt: boolean;
  activeInteractionType: GameWorld['ui']['activeInteractionType'];
  isMobile: boolean;
  handleRespawn: () => void;
  handleRewardRevive: () => void;
}

const InteractionLayer = ({
  currentStats,
  showInteractionPrompt,
  activeInteractionType,
  isMobile,
  handleRespawn,
  handleRewardRevive,
}: InteractionLayerProps) => {
  const [isReviveAdLoading, setIsReviveAdLoading] = useState(false);
  const [reviveAdAttempted, setReviveAdAttempted] = useState(false);
  const [reviveAdMessage, setReviveAdMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentStats.hp > 0) {
      setIsReviveAdLoading(false);
      setReviveAdAttempted(false);
      setReviveAdMessage(null);
    }
  }, [currentStats.hp]);

  const handleRewardedReviveClick = useCallback(async () => {
    if (isReviveAdLoading || reviveAdAttempted) return;

    setIsReviveAdLoading(true);
    setReviveAdAttempted(true);
    setReviveAdMessage(null);

    const result = await requestRewardedReviveAd();
    setIsReviveAdLoading(false);

    if (result.ok) {
      handleRewardRevive();
      return;
    }

    setReviveAdMessage(result.message);
  }, [handleRewardRevive, isReviveAdLoading, reviveAdAttempted]);

  const canShowRewardedRevive =
    currentStats.hp <= 0 &&
    isRewardedReviveAdEnabled() &&
    (!reviveAdAttempted || isReviveAdLoading);

  return (
    <>
      {/* Death Overlay */}
      {currentStats.hp <= 0 && (
        <div className="absolute inset-0 z-100 flex flex-col items-center justify-center bg-red-950/60 backdrop-blur-xl animate-in fade-in duration-700 pointer-events-auto">
          <div className="text-center space-y-7 p-8 md:p-12 bg-zinc-950/80 border-2 border-red-500/50 rounded-3xl shadow-2xl shadow-red-900/40 max-w-md w-[calc(100%-2rem)] pointer-events-auto">
            <div className="space-y-2">
              <h2 className="text-5xl font-black text-red-500 tracking-tighter drop-shadow-sm">
                Driller Down
              </h2>
              <p className="text-zinc-400 font-medium tracking-widest text-xs">
                Structural integrity compromised
              </p>
            </div>

            <div className="py-4">
              <div className="text-4xl font-mono text-zinc-500">
                Depth: <span className="text-white">{currentStats.depth}m</span>
              </div>
            </div>

            {canShowRewardedRevive && (
              <button
                onClick={handleRewardedReviveClick}
                disabled={isReviveAdLoading}
                className="w-full py-4 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-400 text-black font-black rounded-xl transition-all shadow-lg shadow-emerald-900/20 tracking-widest text-sm"
              >
                {isReviveAdLoading ? 'Loading Ad...' : 'Watch Ad to Revive'}
              </button>
            )}

            {reviveAdMessage && (
              <p className="text-xs font-bold text-amber-200/90">
                {reviveAdMessage}
              </p>
            )}

            <button
              onClick={handleRespawn}
              className="w-full py-4 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black rounded-xl transition-all shadow-lg shadow-red-900/20 tracking-widest text-sm"
            >
              Request Respawn
            </button>
          </div>
        </div>
      )}

      {/* Interaction Prompt Overlay */}
      {showInteractionPrompt && activeInteractionType && currentStats.hp > 0 && (
        <div className="absolute left-1/2 bottom-32 md:bottom-40 lg:bottom-44 -translate-x-1/2 z-30 animate-in slide-in-from-bottom-4 fade-in duration-300 pointer-events-none">
          <div className="flex items-center px-10 justify-center w-15 h-10 bg-emerald-500 text-black font-black rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            <span className="text-base">{isMobile ? 'Action' : 'Space'}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(InteractionLayer);
