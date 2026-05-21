'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/shared/lib/store';
import { WindowFrame, WindowHeader } from '@/shared/ui/window';

/**
 * 설정 컴포넌트의 Props 인터페이스입니다.
 */
interface SettingsProps {
  /** 데이터 초기화 함수 */
  onReset: () => void;
  /** 설정 창 닫기 함수 */
  onClose: () => void;
  /** 세이브 데이터 내보내기 함수 */
  onExport: () => void;
  /** 세이브 데이터 가져오기 함수 */
  onImport: () => void;
}

/**
 * 게임 환경 설정 데이터 구조입니다.
 */
interface GameSettings {
  /** 화면 흔들림 효과 활성화 여부 */
  screenShake: boolean;
  /** 고성능 모드(프레임 제한 해제 등) 활성화 여부 */
  highPerformance: boolean;
  /** 효과음 활성화 여부 */
  soundEffects: boolean;
}

/**
 * 게임의 각종 환경 설정을 관리하고 표시하는 모달 컴포넌트입니다.
 */
export default function Settings({ onReset, onClose, onExport, onImport }: SettingsProps) {
  const { screenShake, highPerformance, soundEffects } = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);

  // 로컬 스토리지에서 처음 설정 로드 (Store 초기화)
  useEffect(() => {
    const saved = localStorage.getItem('drilling-game-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        updateSettings(parsed);
      } catch (e) {
        console.error('Failed to load settings.', e);
      }
    }
  }, [updateSettings]);

  /**
   * 변경된 설정을 저장하고 스토어를 업데이트합니다.
   */
  const saveAndSync = (updates: Partial<GameSettings>) => {
    updateSettings(updates);
    const current = { screenShake, highPerformance, soundEffects, ...updates };
    localStorage.setItem('drilling-game-settings', JSON.stringify(current));
  };

  /**
   * 개별 설정 항목을 토글하는 스위치 컴포넌트입니다 (내부용).
   */
  const Toggle = ({
    label,
    subLabel,
    active,
    onToggle,
  }: {
    label: string;
    subLabel: string;
    active: boolean;
    onToggle: () => void;
  }) => (
    <div
      onClick={onToggle}
      onKeyDown={(e) => e.key === 'Enter' && onToggle()}
      tabIndex={0}
      className={`pixel-panel flex justify-between items-center p-6 transition-colors cursor-pointer group/toggle relative focus:outline-none focus:ring-2 focus:ring-amber-400/50
        ${active ? 'pixel-panel-active' : 'pixel-panel-muted hover:border-[#ffd05f]'}`}
    >
      <div className="flex flex-col gap-1 relative z-10">
        <span
          className={`text-base font-bold transition-colors duration-200 ${active ? 'text-[#f4dfb8]' : 'text-[#d0b886] group-hover/toggle:text-[#f4dfb8]'}`}
        >
          {label}
        </span>
        <span className="text-[10px] text-[#d0b886] font-bold">{subLabel}</span>
      </div>

      <div
        className={`pixel-bar w-14 h-7 relative transition-colors duration-300 p-1 flex items-center
        ${active ? 'pixel-bar-active' : 'border-[#4a2d1c]'}`}
      >
        <div
          className={`w-5 h-5 transition-transform duration-300
            ${active ? 'translate-x-7 bg-[#090a08]' : 'translate-x-0 bg-[#242a24]'}`}
        />
      </div>
    </div>
  );

  return (
    <WindowFrame>
      <WindowHeader
        icon={<span className="text-2xl md:text-3xl">⚙️</span>}
        title="Settings"
        subtitle="System Configuration"
        titleClassName="text-[#f4dfb8]"
        subtitleClassName="text-[#d0b886]"
        onClose={onClose}
        closeButtonClassName="hover:border-[#ffd05f] focus-visible:ring-2 focus-visible:ring-[#ffd05f]/50"
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar px-10 py-10 flex items-center justify-center">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 게임플레이 설정 섹션 */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[#d0b886]">🎮</span>
              <h3 className="text-[10px] font-bold text-[#d0b886]">Gameplay Settings</h3>
            </div>

            <div className="flex flex-col gap-4">
              <Toggle
                label="Screen Shake"
                subLabel="In-game camera vibration effects"
                active={screenShake}
                onToggle={() => {
                  saveAndSync({ screenShake: !screenShake });
                }}
              />
              <Toggle
                label="Sound Effects"
                subLabel="Mining, pickup, and combat feedback"
                active={soundEffects}
                onToggle={() => {
                  saveAndSync({ soundEffects: !soundEffects });
                }}
              />
              <Toggle
                label="High Performance"
                subLabel="Unlock maximum frame rate"
                active={highPerformance}
                onToggle={() => {
                  saveAndSync({ highPerformance: !highPerformance });
                }}
              />
            </div>
          </div>

          {/* 시스템 및 데이터 섹션 */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[#d0b886]">⚙️</span>
              <h3 className="text-[10px] font-bold text-[#d0b886]">System & Data</h3>
            </div>

            <div className="flex flex-col gap-4">
              {/* 백업 그룹 */}
              <div className="pixel-panel p-6">
                <h4 className="text-[10px] font-bold text-[#d0b886] mb-4">Data Backup</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={onExport}
                    className="pixel-button h-12 text-[10px] font-bold transition-colors active:translate-y-px flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd05f]/50"
                  >
                    <span>📤</span> Export Save
                  </button>
                  <button
                    onClick={onImport}
                    className="pixel-button h-12 text-[10px] font-bold transition-colors active:translate-y-px flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd05f]/50"
                  >
                    <span>📥</span> Import Save
                  </button>
                </div>
              </div>

              {/* 초기화 그룹 */}
              <div className="pixel-card pixel-card-danger p-6 group/reset relative overflow-hidden">
                <div className="flex flex-col relative z-10">
                  <h4 className="text-sm font-bold text-[#5b1717]">Data Reset</h4>
                  <p className="text-[9px] text-[#d0b886] font-bold mt-1 mb-4 leading-relaxed">
                    Permanently deletes all game progress. This action cannot be undone.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm('Delete all progress? This action cannot be undone.')) onReset();
                    }}
                    className="pixel-button pixel-button-danger w-full h-12 text-[10px] font-bold transition-colors active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b84a3c]/50"
                  >
                    Reset Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}
