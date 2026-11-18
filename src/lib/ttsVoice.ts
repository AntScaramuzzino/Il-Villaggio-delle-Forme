let cachedItalianVoice: SpeechSynthesisVoice | null = null;
let voicesInitialized = false;

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

  // Prefer warm, clear, natural-sounding Italian voices across Chrome, Safari, Edge, iOS
  const preferredKeywords = [
    'alice',
    'federica',
    'elsa',
    'google italiano',
    'silvia',
    'paola',
    'luca',
    'natural',
    'enhanced'
  ];

  for (const kw of preferredKeywords) {
    const match = italianVoices.find((v) =>
      v.name.toLowerCase().includes(kw)
    );
    if (match) return match;
  }

  return italianVoices[0];
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
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore speech synthesis cancel errors
  }
}

export function speakForKids(text: string, enabled: boolean) {
  if (!enabled || !text.trim()) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  ensureVoicesLoaded();

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'it-IT';
    // Slightly slower and brighter pitch for warm, cheerful primary-school clarity
    utterance.rate = 0.94;
    utterance.pitch = 1.15;
    utterance.volume = 1.0;

    if (!cachedItalianVoice) {
      cachedItalianVoice = pickChildFriendlyItalianVoice();
    }
    if (cachedItalianVoice) {
      utterance.voice = cachedItalianVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore TTS failures on unsupported browsers
  }
}
