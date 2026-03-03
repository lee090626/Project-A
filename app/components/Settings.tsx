'use client';

import React, { useState, useEffect } from 'react';

interface SettingsProps {
  onReset: () => void;
  onClose: () => void;
}

export default function Settings({ onReset, onClose }: SettingsProps) {
  const [masterVolume, setMasterVolume] = useState(80);
  const [bgmVolume, setBgmVolume] = useState(60);
  const [sfxVolume, setSfxVolume] = useState(70);
  const [screenShake, setScreenShake] = useState(true);
  const [highPerformance, setHighPerformance] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('drilling-game-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.masterVolume !== undefined)
          setMasterVolume(parsed.masterVolume);
        if (parsed.bgmVolume !== undefined) setBgmVolume(parsed.bgmVolume);
        if (parsed.sfxVolume !== undefined) setSfxVolume(parsed.sfxVolume);
        if (parsed.screenShake !== undefined)
          setScreenShake(parsed.screenShake);
        if (parsed.highPerformance !== undefined)
          setHighPerformance(parsed.highPerformance);
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
  }, []);

  const saveSettings = (updates: any) => {
    const current = {
      masterVolume,
      bgmVolume,
      sfxVolume,
      screenShake,
      highPerformance,
      ...updates,
    };
    localStorage.setItem('drilling-game-settings', JSON.stringify(current));
  };

  const handleVolumeChange = (type: string, value: number) => {
    if (type === 'master') {
      setMasterVolume(value);
      saveSettings({ masterVolume: value });
    } else if (type === 'bgm') {
      setBgmVolume(value);
      saveSettings({ bgmVolume: value });
    } else if (type === 'sfx') {
      setSfxVolume(value);
      saveSettings({ sfxVolume: value });
    }
  };

  const Slider = ({ label, value, min = 0, max = 100, onChange }: any) => (
    <div className="flex flex-col gap-3 group/slider">
      <div className="flex justify-between items-end px-1">
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover/slider:text-white transition-colors">
          {label}
        </span>
        <span className="text-sm font-black text-[#eab308] tabular-nums">
          {value}%
        </span>
      </div>
      <div className="relative h-4 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-[#eab308] hover:accent-[#d9a306] transition-all"
        />
      </div>
    </div>
  );

  const Toggle = ({ label, subLabel, active, onToggle }: any) => (
    <div
      onClick={onToggle}
      className="flex justify-between items-center p-6 bg-zinc-950/40 rounded-xl border border-zinc-900 hover:border-zinc-700 transition-all cursor-pointer group/toggle"
    >
      <div className="flex flex-col gap-1 text-left">
        <span className="text-sm font-black text-zinc-300 group-hover/toggle:text-white transition-colors uppercase tracking-tight">
          {label}
        </span>
        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
          {subLabel}
        </span>
      </div>
      <div
        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${active ? 'bg-[#eab308]/20 border border-[#eab308]/30' : 'bg-zinc-900 border border-zinc-800'}`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${active ? 'translate-x-7 bg-[#eab308] shadow-[0_0_10px_#eab308]' : 'translate-x-1 bg-zinc-700'}`}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full text-[#d1d5db] font-sans p-8 bg-[#1a1a1b] border-l-[6px] border-[#eab308] shadow-2xl relative overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-black tracking-tighter text-[#eab308] uppercase">
          SETTINGS
        </h2>
        <button
          onClick={onClose}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#eab308] text-black hover:brightness-110 transition-all active:scale-90 shadow-xl"
        >
          <span className="text-xl font-black">✕</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto pb-10">
          <div className="bg-[#252526] p-8 rounded-2xl border border-zinc-800 shadow-xl space-y-8">
            <h3 className="text-[11px] font-black text-[#eab308] uppercase tracking-widest border-b border-zinc-800 pb-2">
              AUDIO
            </h3>
            <Slider
              label="MASTER VOLUME"
              value={masterVolume}
              onChange={(v: number) => handleVolumeChange('master', v)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Slider
                label="MUSIC"
                value={bgmVolume}
                onChange={(v: number) => handleVolumeChange('bgm', v)}
              />
              <Slider
                label="EFFECTS"
                value={sfxVolume}
                onChange={(v: number) => handleVolumeChange('sfx', v)}
              />
            </div>
          </div>

          <div className="bg-[#252526] p-8 rounded-2xl border border-zinc-800 shadow-xl space-y-6">
            <h3 className="text-[11px] font-black text-[#eab308] uppercase tracking-widest border-b border-zinc-800 pb-2">
              PLAYER
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Toggle
                label="SCREEN SHAKE"
                subLabel="Vibration Effects"
                active={screenShake}
                onToggle={() => {
                  setScreenShake(!screenShake);
                  saveSettings({ screenShake: !screenShake });
                }}
              />
              <Toggle
                label="HIGH PERFORMANCE"
                subLabel="Maximum frame rate"
                active={highPerformance}
                onToggle={() => {
                  setHighPerformance(!highPerformance);
                  saveSettings({ highPerformance: !highPerformance });
                }}
              />
            </div>
          </div>

          <div className="bg-rose-950/5 border border-rose-900/30 p-8 rounded-2xl group hover:bg-rose-950/10 transition-all">
            <div className="flex justify-between items-center mb-6">
              <div className="text-left">
                <h4 className="text-xl font-black text-white tracking-tighter uppercase">
                  HARD RESET
                </h4>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
                  Erase all game data
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Erase all progress? This action is final.'))
                    onReset();
                }}
                className="px-8 py-3 rounded-lg bg-rose-600/10 border border-rose-600/30 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-xl"
              >
                PURGE DATA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
