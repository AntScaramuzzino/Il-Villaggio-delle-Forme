import { useEffect, useState } from 'react';

let cachedItalianVoice: SpeechSynthesisVoice | null = null;
let voicesInitialized = false;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let speakSequence = 0;
let isSpeaking = false;
const speakingListeners = new Set<(speaking: boolean) => void>();

export interface SpeakOptions {
  delayMs?: number;
  onEnd?: () => void;
}

function setSpeakingState(next: boolean) {
  if (isSpeaking === next) return;
  isSpeaking = next;
  speakingListeners.forEach((listener) => listener(next));
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

function pickChildFriendlyItalianVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const italianVoices = voices.filter((v) =>
    v.lang.toLowerCase().startsWith('it')
  );
  if (italianVoices.length === 0) return null;

  // Prefer reliable local/OS Italian voices first, then natural-sounding voices
  const localItalian = italianVoices.filter((v) => v.localService);
  const searchPool = localItalian.length > 0 ? localItalian : italianVoices;

  const preferredKeywords = [
    'alice',
    'federica',
    'elsa',
    'silvia',
    'paola',
    'luca',
    'google italiano',
    'natural',
    'enhanced'
  ];

  for (const kw of preferredKeywords) {
    const match = searchPool.find((v) =>
      v.name.toLowerCase().includes(kw)
    );
    if (match) return match;
  }

  return searchPool[0];
}

function ensureVoicesLoaded() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  if (!voicesInitialized) {
    voicesInitialized = true;
    cachedItalianVoice = pickChildFriendlyItalianVoice();
    window.speechSynthesis.onvoiceschanged = () => {
      cachedItalianVoice = pickChildFriendlyItalianVoice();
    };
  }
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

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'it-IT';
      utterance.rate = 0.94;
      utterance.pitch = 1.15;
      utterance.volume = 1.0;

      if (useSpecificVoice) {
        if (!cachedItalianVoice) {
          cachedItalianVoice = pickChildFriendlyItalianVoice();
        }
        if (cachedItalianVoice) {
          utterance.voice = cachedItalianVoice;
        }
      }

      utterance.onstart = () => {
        if (seq === speakSequence) {
          setSpeakingState(true);
        }
      };

      utterance.onend = () => {
        if (seq !== speakSequence) return;
        activeUtterance = null;
        setSpeakingState(false);
        options?.onEnd?.();
      };

      utterance.onerror = () => {
        if (seq !== speakSequence) return;
        // If a selected voice failed, retry once synchronously using default it-IT voice
        if (useSpecificVoice && utterance.voice) {
          cachedItalianVoice = null;
          startSpeech(false);
          return;
        }
        activeUtterance = null;
        setSpeakingState(false);
        options?.onEnd?.();
      };

      // Retain strong reference until completion so Chromium doesn't GC utterance mid-sentence
      activeUtterance = utterance;
      // Keep activeUtterance referenced across ticks
      if (activeUtterance) {
        synth.speak(utterance);
      }
    };

    // Execute synchronously inside user interaction call stack so browsers never block speech
    startSpeech(true);
  } catch {
    activeUtterance = null;
    setSpeakingState(false);
    options?.onEnd?.();
  }
}

export function toggleSpeakForKids(text: string) {
  const synthSpeaking =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    window.speechSynthesis.speaking;

  if (isSpeaking && synthSpeaking) {
    stopSpeaking();
    return;
  }
  speakForKids(text, true);
}
