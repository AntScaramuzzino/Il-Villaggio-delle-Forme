// Gentle Web Audio API Christmas music box / celesta synthesizer
// Plays a warm, child-friendly holiday medley (Jingle Bells, We Wish You a Merry Christmas, Astro del Ciel)
// with smooth TTS ducking and browser autoplay-gesture unlock.

const NOTE_FREQ: Record<string, number> = {
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0
};

interface MedleyStep {
  melody?: string;
  chord?: string[];
  beats: number;
  beatSec: number;
}

const JINGLE_BEAT = 0.44;
const WISH_BEAT = 0.46;
const SILENT_BEAT = 0.56;

const CHRISTMAS_MEDLEY: MedleyStep[] = [
  // --- 1. Jingle Bells (Chorus) ---
  { melody: 'E5', chord: ['C3', 'G3', 'E4'], beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'E5', beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'E5', chord: ['C3', 'G3'], beats: 2, beatSec: JINGLE_BEAT },

  { melody: 'E5', chord: ['C3', 'G3', 'E4'], beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'E5', beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'E5', chord: ['C3', 'G3'], beats: 2, beatSec: JINGLE_BEAT },

  { melody: 'E5', chord: ['C3', 'G3', 'E4'], beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'G5', beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'C5', chord: ['C3', 'E3', 'G3'], beats: 1.5, beatSec: JINGLE_BEAT },
  { melody: 'D5', beats: 0.5, beatSec: JINGLE_BEAT },
  { melody: 'E5', chord: ['C3', 'G3', 'C4'], beats: 4, beatSec: JINGLE_BEAT },

  { melody: 'F5', chord: ['F3', 'A3', 'C4'], beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'F5', beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'F5', chord: ['F3', 'C4'], beats: 1.5, beatSec: JINGLE_BEAT },
  { melody: 'F5', beats: 0.5, beatSec: JINGLE_BEAT },

  { melody: 'F5', chord: ['C3', 'G3', 'E4'], beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'E5', beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'E5', chord: ['C3', 'G3'], beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'E5', beats: 0.5, beatSec: JINGLE_BEAT },
  { melody: 'E5', beats: 0.5, beatSec: JINGLE_BEAT },

  { melody: 'E5', chord: ['G3', 'B3', 'D4'], beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'D5', beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'D5', chord: ['G3', 'D4'], beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'E5', beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'D5', chord: ['G3', 'B3'], beats: 2, beatSec: JINGLE_BEAT },
  { melody: 'G5', chord: ['G3', 'D4'], beats: 2, beatSec: JINGLE_BEAT },

  { melody: 'E5', chord: ['C3', 'G3', 'E4'], beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'E5', beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'E5', chord: ['C3', 'G3'], beats: 2, beatSec: JINGLE_BEAT },

  { melody: 'E5', chord: ['C3', 'G3', 'E4'], beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'E5', beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'E5', chord: ['C3', 'G3'], beats: 2, beatSec: JINGLE_BEAT },

  { melody: 'E5', chord: ['C3', 'G3', 'E4'], beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'G5', beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'C5', chord: ['C3', 'E3', 'G3'], beats: 1.5, beatSec: JINGLE_BEAT },
  { melody: 'D5', beats: 0.5, beatSec: JINGLE_BEAT },
  { melody: 'E5', chord: ['C3', 'G3', 'C4'], beats: 4, beatSec: JINGLE_BEAT },

  { melody: 'F5', chord: ['F3', 'A3', 'C4'], beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'F5', beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'F5', chord: ['F3', 'C4'], beats: 1.5, beatSec: JINGLE_BEAT },
  { melody: 'F5', beats: 0.5, beatSec: JINGLE_BEAT },

  { melody: 'F5', chord: ['C3', 'G3', 'E4'], beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'E5', beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'E5', chord: ['C3', 'G3'], beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'E5', beats: 0.5, beatSec: JINGLE_BEAT },
  { melody: 'E5', beats: 0.5, beatSec: JINGLE_BEAT },

  { melody: 'G5', chord: ['G3', 'B3', 'D4'], beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'G5', beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'F5', chord: ['G3', 'D4'], beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'D5', beats: 1, beatSec: JINGLE_BEAT },
  { melody: 'C5', chord: ['C3', 'E3', 'G3', 'C4'], beats: 4, beatSec: JINGLE_BEAT },

  // Pause between songs
  { beats: 2, beatSec: WISH_BEAT },

  // --- 2. We Wish You a Merry Christmas ---
  { melody: 'G4', beats: 1, beatSec: WISH_BEAT },
  { melody: 'C5', chord: ['C3', 'E3', 'G3'], beats: 1, beatSec: WISH_BEAT },
  { melody: 'C5', beats: 0.5, beatSec: WISH_BEAT },
  { melody: 'D5', beats: 0.5, beatSec: WISH_BEAT },
  { melody: 'C5', beats: 0.5, beatSec: WISH_BEAT },
  { melody: 'B4', beats: 0.5, beatSec: WISH_BEAT },

  { melody: 'A4', chord: ['F3', 'A3', 'C4'], beats: 1, beatSec: WISH_BEAT },
  { melody: 'A4', beats: 1, beatSec: WISH_BEAT },
  { melody: 'A4', beats: 1, beatSec: WISH_BEAT },

  { melody: 'D5', chord: ['D3', 'A3', 'C4'], beats: 1, beatSec: WISH_BEAT },
  { melody: 'D5', beats: 0.5, beatSec: WISH_BEAT },
  { melody: 'E5', beats: 0.5, beatSec: WISH_BEAT },
  { melody: 'D5', beats: 0.5, beatSec: WISH_BEAT },
  { melody: 'C5', beats: 0.5, beatSec: WISH_BEAT },

  { melody: 'B4', chord: ['G3', 'B3', 'D4'], beats: 1, beatSec: WISH_BEAT },
  { melody: 'G4', beats: 1, beatSec: WISH_BEAT },
  { melody: 'G4', beats: 1, beatSec: WISH_BEAT },

  { melody: 'E5', chord: ['E3', 'G3', 'B3'], beats: 1, beatSec: WISH_BEAT },
  { melody: 'E5', beats: 0.5, beatSec: WISH_BEAT },
  { melody: 'F5', beats: 0.5, beatSec: WISH_BEAT },
  { melody: 'E5', beats: 0.5, beatSec: WISH_BEAT },
  { melody: 'D5', beats: 0.5, beatSec: WISH_BEAT },

  { melody: 'C5', chord: ['A3', 'C4', 'E4'], beats: 1, beatSec: WISH_BEAT },
  { melody: 'A4', beats: 1, beatSec: WISH_BEAT },
  { melody: 'G4', beats: 0.5, beatSec: WISH_BEAT },
  { melody: 'G4', beats: 0.5, beatSec: WISH_BEAT },

  { melody: 'A4', chord: ['F3', 'A3', 'C4'], beats: 1, beatSec: WISH_BEAT },
  { melody: 'D5', chord: ['G3', 'B3', 'D4'], beats: 1, beatSec: WISH_BEAT },
  { melody: 'B4', beats: 1, beatSec: WISH_BEAT },
  { melody: 'C5', chord: ['C3', 'E3', 'G3', 'C4'], beats: 3, beatSec: WISH_BEAT },

  // Pause between songs
  { beats: 2, beatSec: SILENT_BEAT },

  // --- 3. Astro del Ciel (Silent Night) ---
  { melody: 'G4', chord: ['C3', 'E3', 'G3'], beats: 1.5, beatSec: SILENT_BEAT },
  { melody: 'A4', beats: 0.5, beatSec: SILENT_BEAT },
  { melody: 'G4', beats: 1, beatSec: SILENT_BEAT },
  { melody: 'E4', chord: ['C3', 'G3'], beats: 3, beatSec: SILENT_BEAT },

  { melody: 'G4', chord: ['C3', 'E3', 'G3'], beats: 1.5, beatSec: SILENT_BEAT },
  { melody: 'A4', beats: 0.5, beatSec: SILENT_BEAT },
  { melody: 'G4', beats: 1, beatSec: SILENT_BEAT },
  { melody: 'E4', chord: ['C3', 'G3'], beats: 3, beatSec: SILENT_BEAT },

  { melody: 'D5', chord: ['G3', 'B3', 'D4'], beats: 2, beatSec: SILENT_BEAT },
  { melody: 'D5', beats: 1, beatSec: SILENT_BEAT },
  { melody: 'B4', chord: ['G3', 'D4'], beats: 3, beatSec: SILENT_BEAT },

  { melody: 'C5', chord: ['C3', 'E3', 'G3'], beats: 2, beatSec: SILENT_BEAT },
  { melody: 'C5', beats: 1, beatSec: SILENT_BEAT },
  { melody: 'G4', chord: ['C3', 'G3'], beats: 3, beatSec: SILENT_BEAT },

  { melody: 'A4', chord: ['F3', 'A3', 'C4'], beats: 2, beatSec: SILENT_BEAT },
  { melody: 'A4', beats: 1, beatSec: SILENT_BEAT },
  { melody: 'C5', chord: ['F3', 'C4'], beats: 1.5, beatSec: SILENT_BEAT },
  { melody: 'B4', beats: 0.5, beatSec: SILENT_BEAT },
  { melody: 'A4', beats: 1, beatSec: SILENT_BEAT },

  { melody: 'G4', chord: ['C3', 'E3', 'G3'], beats: 1.5, beatSec: SILENT_BEAT },
  { melody: 'A4', beats: 0.5, beatSec: SILENT_BEAT },
  { melody: 'G4', beats: 1, beatSec: SILENT_BEAT },
  { melody: 'E4', chord: ['C3', 'G3'], beats: 3, beatSec: SILENT_BEAT },

  { melody: 'D5', chord: ['G3', 'B3', 'D4'], beats: 2, beatSec: SILENT_BEAT },
  { melody: 'D5', beats: 1, beatSec: SILENT_BEAT },
  { melody: 'F5', chord: ['G3', 'B3', 'F4'], beats: 1.5, beatSec: SILENT_BEAT },
  { melody: 'D5', beats: 0.5, beatSec: SILENT_BEAT },
  { melody: 'B4', beats: 1, beatSec: SILENT_BEAT },

  { melody: 'C5', chord: ['C3', 'E3', 'G3'], beats: 3, beatSec: SILENT_BEAT },
  { melody: 'E5', chord: ['C3', 'G3', 'C4'], beats: 3, beatSec: SILENT_BEAT },

  { melody: 'C5', chord: ['C3', 'E3', 'G3'], beats: 1, beatSec: SILENT_BEAT },
  { melody: 'G4', beats: 1, beatSec: SILENT_BEAT },
  { melody: 'E4', beats: 1, beatSec: SILENT_BEAT },
  { melody: 'G4', chord: ['G3', 'B3', 'D4'], beats: 1.5, beatSec: SILENT_BEAT },
  { melody: 'F4', beats: 0.5, beatSec: SILENT_BEAT },
  { melody: 'D4', beats: 1, beatSec: SILENT_BEAT },
  { melody: 'C4', chord: ['C3', 'E3', 'G3', 'C4'], beats: 3.5, beatSec: SILENT_BEAT },

  // Gentle breath before looping back to Jingle Bells
  { beats: 2.5, beatSec: JINGLE_BEAT }
];

const NORMAL_VOLUME = 0.14;
const DUCKED_VOLUME = 0.042;
const LOOKAHEAD_MS = 85;
const SCHEDULE_AHEAD_SEC = 0.24;

let musicCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let melodyFilter: BiquadFilterNode | null = null;
let chordFilter: BiquadFilterNode | null = null;

let wantPlaying = false;
let isDucked = false;
let isHidden = false;
let schedulerId: number | null = null;
let stepIndex = 0;
let nextNoteTime = 0;
let listenersRegistered = false;

function getTargetVolume(): number {
  if (!wantPlaying || isHidden) return 0.0001;
  return isDucked ? DUCKED_VOLUME : NORMAL_VOLUME;
}

function ensureMusicGraph(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!musicCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    musicCtx = new AudioContextClass();

    masterGain = musicCtx.createGain();
    masterGain.gain.setValueAtTime(0.0001, musicCtx.currentTime);
    masterGain.connect(musicCtx.destination);

    melodyFilter = musicCtx.createBiquadFilter();
    melodyFilter.type = 'lowpass';
    melodyFilter.frequency.setValueAtTime(2700, musicCtx.currentTime);
    melodyFilter.Q.setValueAtTime(0.7, musicCtx.currentTime);
    melodyFilter.connect(masterGain);

    chordFilter = musicCtx.createBiquadFilter();
    chordFilter.type = 'lowpass';
    chordFilter.frequency.setValueAtTime(880, musicCtx.currentTime);
    chordFilter.Q.setValueAtTime(0.5, musicCtx.currentTime);
    chordFilter.connect(masterGain);
  }

  return musicCtx;
}

function rampMasterGain(timeConstant = 0.18) {
  if (!musicCtx || !masterGain) return;
  const now = musicCtx.currentTime;
  try {
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setTargetAtTime(getTargetVolume(), now, timeConstant);
  } catch {
    // Ignore Web Audio automation edge cases
  }
}

function scheduleCelestaNote(ctx: AudioContext, freq: number, startTime: number, durationSec: number) {
  if (!melodyFilter) return;

  const decay = Math.min(2.0, Math.max(0.42, durationSec * 1.35));

  // Warm sine fundamental
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, startTime);

  gain1.gain.setValueAtTime(0.0001, startTime);
  gain1.gain.linearRampToValueAtTime(0.28, startTime + 0.014);
  gain1.gain.exponentialRampToValueAtTime(0.0008, startTime + decay);

  osc1.connect(gain1);
  gain1.connect(melodyFilter);
  osc1.start(startTime);
  osc1.stop(startTime + decay + 0.04);

  // Delicate music-box octave shimmer (2nd harmonic, short bell tail)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2, startTime);

  const shimmerDecay = Math.min(0.65, decay * 0.45);
  gain2.gain.setValueAtTime(0.0001, startTime);
  gain2.gain.linearRampToValueAtTime(0.055, startTime + 0.008);
  gain2.gain.exponentialRampToValueAtTime(0.0005, startTime + shimmerDecay);

  osc2.connect(gain2);
  gain2.connect(melodyFilter);
  osc2.start(startTime);
  osc2.stop(startTime + shimmerDecay + 0.03);
}

function scheduleWarmChord(ctx: AudioContext, notes: string[], startTime: number, durationSec: number) {
  const targetFilter = chordFilter;
  if (!targetFilter) return;

  const padDuration = Math.min(2.4, Math.max(0.75, durationSec * 1.45));
  const perNoteVol = 0.065 / Math.max(1, Math.sqrt(notes.length));

  notes.forEach((noteName, idx) => {
    const freq = NOTE_FREQ[noteName];
    if (!freq) return;

    // Tiny harp-like arpeggio roll (18ms per note) for organic warmth
    const t = startTime + idx * 0.018;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(perNoteVol, t + 0.045);
    gain.gain.exponentialRampToValueAtTime(0.0005, t + padDuration);

    osc.connect(gain);
    gain.connect(targetFilter);
    osc.start(t);
    osc.stop(t + padDuration + 0.04);
  });
}

function tickScheduler() {
  if (!wantPlaying || isHidden || !musicCtx) return;
  if (musicCtx.state !== 'running') return;

  // Catch up cleanly if the browser paused timers
  if (nextNoteTime < musicCtx.currentTime - 0.15) {
    nextNoteTime = musicCtx.currentTime + 0.05;
  }

  while (nextNoteTime < musicCtx.currentTime + SCHEDULE_AHEAD_SEC) {
    const step = CHRISTMAS_MEDLEY[stepIndex];
    const stepDur = step.beats * step.beatSec;

    if (step.melody && NOTE_FREQ[step.melody]) {
      scheduleCelestaNote(musicCtx, NOTE_FREQ[step.melody], nextNoteTime, stepDur);
    }
    if (step.chord && step.chord.length > 0) {
      scheduleWarmChord(musicCtx, step.chord, nextNoteTime, stepDur);
    }

    nextNoteTime += stepDur;
    stepIndex = (stepIndex + 1) % CHRISTMAS_MEDLEY.length;
  }
}

function startSchedulerLoop() {
  if (!musicCtx) return;
  if (schedulerId !== null) return;
  nextNoteTime = musicCtx.currentTime + 0.06;
  schedulerId = window.setInterval(tickScheduler, LOOKAHEAD_MS);
  tickScheduler();
}

function stopSchedulerLoop() {
  if (schedulerId !== null) {
    window.clearInterval(schedulerId);
    schedulerId = null;
  }
}

function tryResumeAndPlay() {
  if (!wantPlaying || isHidden) return;
  const ctx = ensureMusicGraph();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx
      .resume()
      .then(() => {
        if (!wantPlaying || isHidden) return;
        rampMasterGain(0.25);
        startSchedulerLoop();
      })
      .catch(() => {
        // Browser requires an explicit user gesture; gesture listener will retry automatically
      });
  } else if (ctx.state === 'running') {
    rampMasterGain(0.25);
    startSchedulerLoop();
  }
}

function registerLifecycleListeners() {
  if (typeof window === 'undefined' || listenersRegistered) return;
  listenersRegistered = true;

  const handleUserGesture = () => {
    if (wantPlaying && !isHidden) {
      tryResumeAndPlay();
    }
  };

  const handleVisibilityChange = () => {
    isHidden = document.hidden;
    if (isHidden) {
      rampMasterGain(0.08);
      stopSchedulerLoop();
    } else if (wantPlaying) {
      tryResumeAndPlay();
    }
  };

  window.addEventListener('pointerdown', handleUserGesture, { passive: true, capture: true });
  window.addEventListener('keydown', handleUserGesture, { passive: true, capture: true });
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

export function setChristmasMusicEnabled(enabled: boolean) {
  registerLifecycleListeners();
  wantPlaying = enabled;

  if (enabled) {
    isHidden = typeof document !== 'undefined' ? document.hidden : false;
    tryResumeAndPlay();
  } else {
    rampMasterGain(0.08);
    stopSchedulerLoop();
  }
}

export function setChristmasMusicDucked(ducked: boolean) {
  isDucked = ducked;
  if (wantPlaying && !isHidden) {
    rampMasterGain(ducked ? 0.1 : 0.35);
  }
}
