let audioCtx: AudioContext | null = null;
let unlockRegistered = false;

export const AUDIO_DELAYS = {
  afterClick: 0,
  afterThud: 0,
  afterChime: 0,
  afterFanfare: 0
} as const;

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

export function registerAudioUnlock() {
  if (typeof window === 'undefined' || unlockRegistered) return;
  unlockRegistered = true;

  const unlock = () => {
    const ctx = ensureContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };

  window.addEventListener('pointerdown', unlock, { passive: true, capture: true });
  window.addEventListener('keydown', unlock, { passive: true, capture: true });
}

registerAudioUnlock();

function scheduleTone(
  ctx: AudioContext,
  freq: number,
  duration: number,
  type: OscillatorType,
  startOffset: number,
  volume: number
) {
  const now = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType,
  startOffset = 0,
  volume = 0.08
) {
  const ctx = ensureContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  scheduleTone(ctx, freq, duration, type, startOffset, volume);
}

export function playClickPop(enabled: boolean) {
  if (!enabled) return;
  playTone(540, 0.05, 'sine', 0, 0.045);
}

export function playSuccessChime(enabled: boolean) {
  if (!enabled) return;
  // Crisp sleigh-bell C5 - E5 - G5 chime resolving before TTS finishes warming up
  playTone(523.25, 0.11, 'triangle', 0, 0.07);
  playTone(659.25, 0.11, 'triangle', 0.06, 0.07);
  playTone(783.99, 0.16, 'sine', 0.12, 0.08);
}

export function playErrorThud(enabled: boolean) {
  if (!enabled) return;
  // Gentle wooden low tone
  playTone(210, 0.12, 'triangle', 0, 0.06);
  playTone(170, 0.14, 'sine', 0.06, 0.055);
}

export function playVictoryFanfare(enabled: boolean) {
  if (!enabled) return;
  // Festive C5-E5-G5-C6 fanfare
  playTone(523.25, 0.1, 'triangle', 0, 0.07);
  playTone(659.25, 0.1, 'triangle', 0.07, 0.07);
  playTone(783.99, 0.1, 'triangle', 0.14, 0.07);
  playTone(1046.5, 0.28, 'sine', 0.21, 0.085);
}

export function playPiecePickup(enabled: boolean) {
  if (!enabled) return;
  // Soft wooden tile lift
  playTone(392, 0.045, 'sine', 0, 0.042);
  playTone(587.33, 0.055, 'triangle', 0.025, 0.036);
}

export function playPieceRotate(enabled: boolean, direction: 1 | -1 = 1) {
  if (!enabled) return;
  // Crisp mechanical/wooden 45° click-turn
  const startFreq = direction > 0 ? 440 : 520;
  const endFreq = direction > 0 ? 540 : 420;
  playTone(startFreq, 0.035, 'triangle', 0, 0.038);
  playTone(endFreq, 0.045, 'sine', 0.024, 0.035);
}

export function playPieceFlip(enabled: boolean) {
  if (!enabled) return;
  // Quick playful mirror-flip sound
  playTone(440, 0.045, 'sine', 0, 0.04);
  playTone(659.25, 0.06, 'triangle', 0.035, 0.042);
}

export function playSlotSnap(enabled: boolean) {
  if (!enabled) return;
  // Tactile puzzle-piece "incastro": wooden lock thump + bright harmonic confirmation
  playTone(329.63, 0.045, 'triangle', 0, 0.055);
  playTone(659.25, 0.085, 'triangle', 0.028, 0.065);
  playTone(880, 0.12, 'sine', 0.065, 0.06);
}

export function playMagnetSnap(enabled: boolean) {
  if (!enabled) return;
  // Crisp magnetic "clack-ping" when two shapes attract and lock together
  playTone(920, 0.03, 'triangle', 0, 0.05);
  playTone(659.25, 0.075, 'sine', 0.018, 0.055);
  playTone(1046.5, 0.11, 'sine', 0.042, 0.05);
}
