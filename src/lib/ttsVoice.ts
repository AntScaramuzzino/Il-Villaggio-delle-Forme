import { useEffect, useState } from 'react';
import { ElfCharacterId } from '../data/elfCharacters';

interface ElfVoiceProfile {
  gender: 'male' | 'female';
  voiceSlot: number;
  pitch: number;
  rate: number;
}

const ELF_VOICE_PROFILES: Record<ElfCharacterId, ElfVoiceProfile> = {
  // All 3 male elves share the highest-quality Italian male voice, with subtle speed & tone differences
  antonio: { gender: 'male', voiceSlot: 0, pitch: 1.0, rate: 1.03 },
  lorenzo: { gender: 'male', voiceSlot: 0, pitch: 1.02, rate: 0.96 },
  alfredo: { gender: 'male', voiceSlot: 0, pitch: 0.95, rate: 0.90 },
  // 2 Female Italian Voices
  rossella: { gender: 'female', voiceSlot: 0, pitch: 1.04, rate: 0.94 },
  stella: { gender: 'female', voiceSlot: 1, pitch: 1.12, rate: 1.0 }
};

const PREFERRED_MALE_VOICES = [
  'diego',
  'giuseppe',
  'luca',
  'matteo',
  'lorenzo',
  'marco',
  'alessandro',
  'emanuele',
  'andrea'
];

const LEGACY_ROBOTIC_VOICE_HINTS = [
  'espeak',
  'mbrola',
  'festival',
  'compact',
  'cosimo',
  'eloquence'
];

const MALE_ITALIAN_VOICE_KEYWORDS = [
  'diego',
  'giuseppe',
  'luca',
  'matteo',
  'marco',
  'lorenzo',
  'emanuele',
  'alessandro',
  'andrea',
  'giorgio',
  'paolo',
  'roberto',
  'vittorio',
  'ivan',
  'antonio',
  'alfredo',
  'giovanni',
  'benigno',
  'calimero',
  'cataldo',
  'flavio',
  'gianni',
  'rinaldo',
  'cosimo',
  'tommaso',
  'federico',
  'riccardo',
  'davide',
  'stefano',
  'masch',
  'male',
  '(m)',
  'uomo'
];

const FEMALE_ITALIAN_VOICE_KEYWORDS = [
  'isabella',
  'elsa',
  'alice',
  'federica',
  'silvia',
  'paola',
  'chiara',
  'lucia',
  'giulia',
  'sofia',
  'valentina',
  'elena',
  'fabiola',
  'bianca',
  'carla',
  'palmira',
  'irma',
  'imelda',
  'sara',
  'marta',
  'google italiano',
  'femm',
  'female',
  '(f)',
  'donna'
];

let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesInitialized = false;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let speakSequence = 0;
let isSpeaking = false;
let currentSpeakingElf: ElfCharacterId | null = null;
let activeSpeechKey = '';
const speakingListeners = new Set<(speaking: boolean, elfId: ElfCharacterId | null) => void>();

export interface SpeakOptions {
  delayMs?: number;
  onEnd?: () => void;
  elfId?: ElfCharacterId;
}

function setSpeakingState(next: boolean, elfId: ElfCharacterId | null = null) {
  const nextElf = next ? elfId : null;
  if (!next) {
    activeSpeechKey = '';
  }
  if (isSpeaking === next && currentSpeakingElf === nextElf) return;
  isSpeaking = next;
  currentSpeakingElf = nextElf;
  speakingListeners.forEach((listener) => listener(next, nextElf));
}

export function useSpeakingState(): boolean {
  const [speaking, setSpeaking] = useState(isSpeaking);

  useEffect(() => {
    setSpeaking(isSpeaking);
    const handler = (next: boolean) => setSpeaking(next);
    speakingListeners.add(handler);
    return () => {
      speakingListeners.delete(handler);
    };
  }, []);

  return speaking;
}

export function useSpeakingElf(): ElfCharacterId | null {
  const [elf, setElf] = useState<ElfCharacterId | null>(currentSpeakingElf);

  useEffect(() => {
    setElf(currentSpeakingElf);
    const handler = (_speaking: boolean, nextElf: ElfCharacterId | null) => setElf(nextElf);
    speakingListeners.add(handler);
    return () => {
      speakingListeners.delete(handler);
    };
  }, []);

  return elf;
}

function matchesKeyword(haystack: string, keyword: string): boolean {
  if (keyword.startsWith('(')) {
    return haystack.includes(keyword);
  }
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-zàèéìòù])${escaped}([^a-zàèéìòù]|$)`, 'i').test(haystack);
}

function scoreVoiceQuality(v: SpeechSynthesisVoice): number {
  const n = v.name.toLowerCase();
  let score = 0;

  if (n.includes('natural') || n.includes('neural') || n.includes('wavenet') || n.includes('premium')) {
    score += 65;
  } else if (n.includes('enhanced') || n.includes('online')) {
    score += 45;
  }

  if (n.includes('apple') || n.includes('microsoft') || n.includes('google')) {
    score += 12;
  }

  if (PREFERRED_MALE_VOICES.some((kw) => matchesKeyword(n, kw))) {
    score += 22;
  }

  if (v.lang.toLowerCase() === 'it-it') {
    score += 8;
  }

  if (v.localService) {
    score += 4;
  }

  if (LEGACY_ROBOTIC_VOICE_HINTS.some((kw) => n.includes(kw))) {
    score -= 45;
  }

  return score;
}

function classifyVoiceGender(v: SpeechSynthesisVoice): 'male' | 'female' | 'unknown' {
  const name = v.name.toLowerCase();
  const isFemale = FEMALE_ITALIAN_VOICE_KEYWORDS.some((kw) => matchesKeyword(name, kw));
  const isMale = MALE_ITALIAN_VOICE_KEYWORDS.some((kw) => matchesKeyword(name, kw));
  if (isMale && !isFemale) return 'male';
  if (isFemale && !isMale) return 'female';
  if (isFemale) return 'female';
  if (isMale) return 'male';
  return 'unknown';
}

function refreshVoicesCache() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const list = window.speechSynthesis.getVoices();
  if (list && list.length > 0) {
    cachedVoices = list;
  }
}

function ensureVoicesLoaded() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  refreshVoicesCache();
  if (!voicesInitialized) {
    voicesInitialized = true;
    window.speechSynthesis.onvoiceschanged = () => {
      refreshVoicesCache();
    };
  }
}

function pickItalianVoiceForElf(elfId?: ElfCharacterId): {
  voice: SpeechSynthesisVoice | null;
  pitch: number;
  rate: number;
} {
  const profile: ElfVoiceProfile = elfId
    ? ELF_VOICE_PROFILES[elfId]
    : ELF_VOICE_PROFILES.stella;

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return { voice: null, pitch: profile.pitch, rate: profile.rate };
  }

  refreshVoicesCache();
  const allVoices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (!allVoices || allVoices.length === 0) {
    return { voice: null, pitch: profile.pitch, rate: profile.rate };
  }

  const italianVoices = allVoices
    .filter((v) => v.lang.toLowerCase().startsWith('it'))
    .sort((a, b) => scoreVoiceQuality(b) - scoreVoiceQuality(a));

  if (italianVoices.length === 0) {
    return { voice: null, pitch: profile.pitch, rate: profile.rate };
  }

  const malePool = italianVoices.filter((v) => classifyVoiceGender(v) === 'male');
  const femalePool = italianVoices.filter((v) => classifyVoiceGender(v) === 'female');
  const unknownPool = italianVoices.filter((v) => classifyVoiceGender(v) === 'unknown');

  let chosenPool: SpeechSynthesisVoice[];
  let adjustedPitch = profile.pitch;

  if (profile.gender === 'male') {
    if (malePool.length > 0) {
      chosenPool = malePool;
    } else if (unknownPool.length > 0) {
      chosenPool = unknownPool;
      // Gentle pitch shift on neutral/unknown voice without introducing robotic distortion
      adjustedPitch = Math.max(0.84, profile.pitch - 0.12);
    } else {
      chosenPool = italianVoices;
      adjustedPitch = Math.max(0.82, profile.pitch - 0.15);
    }
  } else {
    if (femalePool.length > 0) {
      chosenPool = femalePool;
    } else if (unknownPool.length > 0) {
      chosenPool = unknownPool;
      adjustedPitch = Math.min(1.25, profile.pitch + 0.06);
    } else {
      chosenPool = italianVoices;
      adjustedPitch = Math.min(1.28, profile.pitch + 0.08);
    }
  }

  const chosenVoice = chosenPool[profile.voiceSlot % chosenPool.length] ?? null;
  return {
    voice: chosenVoice,
    pitch: adjustedPitch,
    rate: profile.rate
  };
}

export function stopSpeaking() {
  speakSequence += 1;
  activeUtterance = null;
  setSpeakingState(false);

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
  } catch {
    // Ignore speech synthesis cancel errors
  }
}

export function speakForKids(text: string, enabled: boolean, options?: SpeakOptions) {
  const cleanText = text.trim();
  if (!enabled || !cleanText) {
    if (!enabled) stopSpeaking();
    options?.onEnd?.();
    return;
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onEnd?.();
    return;
  }

  ensureVoicesLoaded();
  speakSequence += 1;
  const seq = speakSequence;
  const resolvedElfId: ElfCharacterId = options?.elfId ?? 'stella';
  const speechKey = `${resolvedElfId}::${cleanText}`;

  try {
    const synth = window.speechSynthesis;
    if (synth.speaking || synth.pending) {
      synth.cancel();
    }
    if (synth.paused) {
      synth.resume();
    }

    const startSpeech = (useSpecificVoice: boolean) => {
      if (seq !== speakSequence) return;

      const selected = pickItalianVoiceForElf(resolvedElfId);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'it-IT';
      utterance.rate = selected.rate;
      utterance.pitch = selected.pitch;
      utterance.volume = 1.0;

      if (useSpecificVoice && selected.voice) {
        utterance.voice = selected.voice;
      }

      utterance.onstart = () => {
        if (seq === speakSequence) {
          activeSpeechKey = speechKey;
          setSpeakingState(true, resolvedElfId);
        }
      };

      utterance.onend = () => {
        if (seq !== speakSequence) return;
        activeUtterance = null;
        setSpeakingState(false, null);
        options?.onEnd?.();
      };

      utterance.onerror = () => {
        if (seq !== speakSequence) return;
        // If a selected voice failed, retry once synchronously using default it-IT voice with elf's pitch/rate
        if (useSpecificVoice && utterance.voice) {
          startSpeech(false);
          return;
        }
        activeUtterance = null;
        setSpeakingState(false, null);
        options?.onEnd?.();
      };

      // Retain strong reference until completion so Chromium doesn't GC utterance mid-sentence
      activeUtterance = utterance;
      activeSpeechKey = speechKey;
      setSpeakingState(true, resolvedElfId);
      if (activeUtterance) {
        synth.speak(utterance);
      }
    };

    // Execute synchronously inside user interaction call stack so browsers never block speech
    startSpeech(true);
  } catch {
    activeUtterance = null;
    setSpeakingState(false, null);
    options?.onEnd?.();
  }
}

export function toggleSpeakForKids(text: string, options?: SpeakOptions) {
  const cleanText = text.trim();
  const nextKey = `${options?.elfId ?? 'stella'}::${cleanText}`;
  const synthSpeaking =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    window.speechSynthesis.speaking;

  if (isSpeaking && synthSpeaking && activeSpeechKey === nextKey) {
    stopSpeaking();
    return;
  }
  speakForKids(cleanText, true, options);
}
