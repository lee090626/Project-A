import type { GameSfxId } from '@/shared/types/game';

/**
 * Safari 계열 브라우저의 레거시 AudioContext 생성자를 허용하기 위한 Window 확장 타입입니다.
 */
interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

const MASTER_VOLUME = 3;
const DEFAULT_VOLUME = 1;

const SFX_COOLDOWN_MS: Record<GameSfxId, number> = {
  mine_hit: 55,
  tile_break: 90,
  item_pickup: 75,
  enemy_hit: 65,
  player_hit: 140,
  boss_defeat: 500,
  ui_click: 40,
};

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isEnabled = true;
let outputVolume = DEFAULT_VOLUME;
const lastPlayedAt: Partial<Record<GameSfxId, number>> = {};

/**
 * 브라우저 오디오 정책에 맞춰 사용자 입력 후 AudioContext를 깨웁니다.
 */
export function unlockGameSfx(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
}

/**
 * 효과음 재생 가능 여부와 출력 볼륨을 갱신합니다.
 *
 * @param options - 효과음 설정 값
 */
export function configureGameSfx(options: { enabled?: boolean; volume?: number }): void {
  if (typeof options.enabled === 'boolean') {
    isEnabled = options.enabled;
  }
  if (typeof options.volume === 'number') {
    outputVolume = clamp(options.volume, 0, 1);
  }
  if (masterGain) {
    masterGain.gain.value = isEnabled ? MASTER_VOLUME * outputVolume : 0;
  }
}

/**
 * 지정한 게임 효과음을 짧은 Web Audio 합성음으로 재생합니다.
 *
 * @param id - 효과음 ID
 * @param intensity - 효과음 강도 배율
 */
export function playGameSfx(id: GameSfxId, intensity = 1): void {
  if (!isEnabled || typeof window === 'undefined') return;

  const nowMs = performance.now();
  const cooldown = SFX_COOLDOWN_MS[id];
  if (nowMs - (lastPlayedAt[id] ?? -Infinity) < cooldown) return;
  lastPlayedAt[id] = nowMs;

  const output = getMasterOutput();
  if (!output) return;

  const { ctx, gain } = output;
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  const amount = clamp(intensity, 0.25, 1.6);
  const start = ctx.currentTime + 0.006;

  switch (id) {
    case 'mine_hit':
      playNoise(ctx, gain, start, 0.035, 1650, 'bandpass', 0.045 * amount);
      playNoise(ctx, gain, start + 0.012, 0.055, 520, 'lowpass', 0.055 * amount);
      playTone(ctx, gain, start, 'square', 2100, 820, 0.025, 0.018 * amount);
      playTone(ctx, gain, start + 0.006, 'triangle', 115, 68, 0.075, 0.045 * amount);
      break;
    case 'tile_break':
      playNoise(ctx, gain, start, 0.035, 2400, 'bandpass', 0.055 * amount);
      playNoise(ctx, gain, start + 0.018, 0.16, 900, 'lowpass', 0.11 * amount);
      playNoise(ctx, gain, start + 0.075, 0.12, 420, 'lowpass', 0.085 * amount);
      playTone(ctx, gain, start, 'triangle', 150, 46, 0.19, 0.07 * amount);
      break;
    case 'item_pickup':
      playTone(ctx, gain, start, 'sine', 620, 920, 0.085, 0.09 * amount);
      playTone(ctx, gain, start + 0.045, 'sine', 920, 1380, 0.1, 0.075 * amount);
      break;
    case 'enemy_hit':
      playNoise(ctx, gain, start, 0.04, 1150, 'bandpass', 0.065 * amount);
      playNoise(ctx, gain, start + 0.012, 0.075, 430, 'lowpass', 0.05 * amount);
      playTone(ctx, gain, start + 0.004, 'triangle', 140, 82, 0.085, 0.035 * amount);
      break;
    case 'player_hit':
      playNoise(ctx, gain, start, 0.05, 1500, 'bandpass', 0.045 * amount);
      playNoise(ctx, gain, start + 0.018, 0.14, 360, 'lowpass', 0.105 * amount);
      playTone(ctx, gain, start + 0.006, 'triangle', 96, 52, 0.18, 0.04 * amount);
      break;
    case 'boss_defeat':
      playTone(ctx, gain, start, 'triangle', 165, 220, 0.28, 0.09 * amount);
      playTone(ctx, gain, start + 0.09, 'sine', 330, 495, 0.24, 0.08 * amount);
      playTone(ctx, gain, start + 0.18, 'sine', 495, 880, 0.32, 0.07 * amount);
      playNoise(ctx, gain, start + 0.02, 0.24, 1050, 'lowpass', 0.08 * amount);
      break;
    case 'ui_click':
      playTone(ctx, gain, start, 'sine', 520, 420, 0.045, 0.045 * amount);
      break;
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (audioContext) return audioContext;

  const AudioCtor =
    window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
  if (!AudioCtor) return null;

  audioContext = new AudioCtor();
  return audioContext;
}

function getMasterOutput(): { ctx: AudioContext; gain: GainNode } | null {
  const ctx = getAudioContext();
  if (!ctx) return null;

  if (!masterGain || masterGain.context !== ctx) {
    masterGain = ctx.createGain();
    masterGain.gain.value = isEnabled ? MASTER_VOLUME * outputVolume : 0;
    masterGain.connect(ctx.destination);
  }

  return { ctx, gain: masterGain };
}

function playTone(
  ctx: AudioContext,
  output: AudioNode,
  start: number,
  type: OscillatorType,
  fromHz: number,
  toHz: number,
  duration: number,
  volume: number,
): void {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const end = start + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(Math.max(1, fromHz), start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, toHz), end);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(gain);
  gain.connect(output);
  oscillator.start(start);
  oscillator.stop(end + 0.02);
}

function playNoise(
  ctx: AudioContext,
  output: AudioNode,
  start: number,
  duration: number,
  frequency: number,
  filterType: BiquadFilterType,
  volume: number,
): void {
  const frameCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < frameCount; i++) {
    const fade = 1 - i / frameCount;
    data[i] = (Math.random() * 2 - 1) * fade;
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  const end = start + duration;

  source.buffer = buffer;
  filter.type = filterType;
  filter.frequency.setValueAtTime(frequency, start);
  filter.Q.setValueAtTime(0.9, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(output);
  source.start(start);
  source.stop(end + 0.02);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
