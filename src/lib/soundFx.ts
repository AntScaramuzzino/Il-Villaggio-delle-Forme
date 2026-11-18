let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType,
  startOffset = 0,
  volume = 0.08
) {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function playClickPop(enabled: boolean) {
  if (!enabled) return;
  playTone(540, 0.06, 'sine', 0, 0.05);
}

export function playSuccessChime(enabled: boolean) {
  if (!enabled) return;
  // Joyful sleigh-bell C5 - E5 - G5 chime
  playTone(523.25, 0.16, 'triangle', 0, 0.08);
  playTone(659.25, 0.16, 'triangle', 0.08, 0.08);
  playTone(783.99, 0.26, 'sine', 0.16, 0.09);
}

export function playErrorThud(enabled: boolean) {
  if (!enabled) return;
  // Gentle wooden low tone
  playTone(210, 0.18, 'triangle', 0, 0.07);
  playTone(170, 0.22, 'sine', 0.09, 0.06);
}

export function playVictoryFanfare(enabled: boolean) {
  if (!enabled) return;
  playTone(523.25, 0.14, 'triangle', 0, 0.08);
  playTone(659.25, 0.14, 'triangle', 0.1, 0.08);
  playTone(783.99, 0.14, 'triangle', 0.2, 0.08);
  playTone(1046.5, 0.42, 'sine', 0.3, 0.1);
}
