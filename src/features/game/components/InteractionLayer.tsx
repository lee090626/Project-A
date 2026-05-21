import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PlayerStats } from '@/shared/types/game';
import { GameWorld } from '@/entities/world/model';
import type { RewardedRevivePlacement } from '@/shared/lib/googleH5Ads';

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
  const isCrazyGamesBuild = process.env.NEXT_PUBLIC_BUILD_TARGET === 'crazygames';
  const [reviveAdState, setReviveAdState] = useState<
    'idle' | 'checking' | 'ready' | 'showing' | 'finished'
  >('idle');
  const [reviveAdMessage, setReviveAdMessage] = useState<string | null>(null);
  const revivePlacementRef = useRef<RewardedRevivePlacement | null>(null);
  const showRewardedAdRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (currentStats.hp > 0) {
      revivePlacementRef.current?.cancel();
      revivePlacementRef.current = null;
      showRewardedAdRef.current = null;
      setReviveAdState('idle');
      setReviveAdMessage(null);
    }
  }, [currentStats.hp]);

  useEffect(() => {
    if (isCrazyGamesBuild || currentStats.hp > 0 || reviveAdState !== 'idle') return;

    let isCancelled = false;

    import('@/shared/lib/googleH5Ads')
      .then(({ isRewardedReviveAdEnabled, startRewardedRevivePlacement }) => {
        if (isCancelled) return;

        if (!isRewardedReviveAdEnabled()) {
          setReviveAdState('finished');
          return;
        }

        setReviveAdState('checking');
        setReviveAdMessage(null);
        revivePlacementRef.current = startRewardedRevivePlacement({
          onRewardAvailable: (showAd) => {
            showRewardedAdRef.current = showAd;
            setReviveAdState('ready');
          },
          onAdStarted: () => {
            setReviveAdState('showing');
          },
          onResult: (result) => {
            revivePlacementRef.current = null;
            showRewardedAdRef.current = null;
            setReviveAdState('finished');

            if (result.ok) {
              handleRewardRevive();
              return;
            }

            setReviveAdMessage(result.message);
          },
        });
      })
      .catch(() => {
        if (isCancelled) return;

        setReviveAdState('finished');
        setReviveAdMessage('Ad revive is unavailable right now. Respawn at Base Camp to continue.');
      });

    return () => {
      isCancelled = true;
    };
  }, [currentStats.hp, handleRewardRevive, isCrazyGamesBuild, reviveAdState]);

  useEffect(() => {
    return () => {
      revivePlacementRef.current?.cancel();
      revivePlacementRef.current = null;
      showRewardedAdRef.current = null;
    };
  }, []);

  const handleRewardedReviveClick = useCallback(() => {
    if (reviveAdState !== 'ready' || !showRewardedAdRef.current) return;

    setReviveAdState('showing');
    setReviveAdMessage(null);
    showRewardedAdRef.current();
  }, [reviveAdState]);

  const canShowRewardedRevive =
    currentStats.hp <= 0 &&
    !isCrazyGamesBuild &&
    (reviveAdState === 'checking' || reviveAdState === 'ready' || reviveAdState === 'showing');

  const rewardedReviveLabel =
    reviveAdState === 'ready'
      ? 'Watch Ad to Revive'
      : reviveAdState === 'showing'
        ? 'Opening Ad...'
        : 'Checking Revive...';

  return (
    <>
      {/* Death Overlay */}
      {currentStats.hp <= 0 && (
        <div className="absolute inset-0 z-100 flex flex-col items-center justify-center bg-red-950/60 animate-in fade-in duration-300 pointer-events-auto">
          <div className="pixel-frame pixel-font text-center space-y-7 p-8 md:p-12 max-w-md w-[calc(100%-2rem)] pointer-events-auto">
            <div className="space-y-2">
              <h2 className="text-5xl font-black text-red-500 drop-shadow-[2px_2px_0_rgba(0,0,0,0.85)]">
                Driller Down
              </h2>
              <p className="text-[#d0b886] font-medium text-xs">Structural integrity compromised</p>
            </div>

            <div className="py-4">
              <div className="text-4xl text-[#a89065]">
                Depth: <span className="text-white">{currentStats.depth}m</span>
              </div>
            </div>

            {canShowRewardedRevive && (
              <button
                onClick={handleRewardedReviveClick}
                disabled={reviveAdState !== 'ready'}
                className="pixel-button pixel-button-success w-full py-4 disabled:bg-[#1d241f] disabled:text-[#d0b886] font-black transition-colors text-sm"
              >
                {rewardedReviveLabel}
              </button>
            )}

            {reviveAdMessage && (
              <p className="text-xs font-bold text-amber-200/90">{reviveAdMessage}</p>
            )}

            <button
              onClick={handleRespawn}
              className="pixel-button pixel-button-danger w-full py-4 font-black transition-colors text-sm"
            >
              Respawn at Base Camp
            </button>
          </div>
        </div>
      )}

      {/* Interaction Prompt Overlay */}
      {showInteractionPrompt && activeInteractionType && currentStats.hp > 0 && (
        <div className="absolute left-1/2 bottom-32 md:bottom-40 lg:bottom-44 -translate-x-1/2 z-30 animate-in slide-in-from-bottom-4 fade-in duration-300 pointer-events-none">
          <div className="pixel-button pixel-button-success pixel-font flex items-center px-10 justify-center w-15 h-10 font-black">
            <span className="text-base">{isMobile ? 'Action' : 'Space'}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(InteractionLayer);
