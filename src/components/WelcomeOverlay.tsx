import React, { useEffect } from 'react';
import {
  CheckCircle2,
  Hand,
  Monitor,
  RotateCw,
  Sparkles,
  Square,
  Volume2,
  X
} from 'lucide-react';
import { playClickPop } from '../lib/soundFx';
import { stopSpeaking, toggleSpeakForKids, useSpeakingState } from '../lib/ttsVoice';
import { ResilientImage } from './ResilientImage';

interface WelcomeOverlayProps {
  open: boolean;
  limMode: boolean;
  soundEnabled: boolean;
  onToggleLimMode: () => void;
  onClose: () => void;
}

const WELCOME_SPEECH_TEXT =
  'Benvenuto nel Villaggio delle Forme! Ecco tre regole facili per giocare alla LIM e sul tablet. Primo: tocca una figura e poi lo spazio tratteggiato, oppure trascina i pezzi del Tangram direttamente sulla lavagna. Secondo: fai doppio tocco su un pezzo o usa i bottoni meno 45, più 45 e Capovolgi per ruotarlo. Terzo: esplora Sfida Slitta, Tangram, Indovinelli e Atlante per raccogliere stelle di Natale. Tocca Inizia a Giocare quando sei pronto!';

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({
  open,
  limMode,
  soundEnabled,
  onToggleLimMode,
  onClose
}) => {
  const isSpeaking = useSpeakingState();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        stopSpeaking();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleDismiss = () => {
    playClickPop(soundEnabled);
    stopSpeaking();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-overlay-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3 sm:p-5 backdrop-blur-xs touch-none select-none"
      onClick={handleDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative flex w-full flex-col overflow-hidden rounded-2xl border border-slate-300 bg-white text-slate-900 shadow-2xl touch-none select-none ${
          limMode
            ? 'max-w-[980px] max-h-[92vh] overflow-y-auto md:overflow-hidden'
            : 'max-w-[820px] max-h-[90vh] overflow-y-auto'
        }`}
      >
        {/* Top festive header */}
        <div
          className={`flex items-center justify-between gap-3 bg-[#0F5132] text-white ${
            limMode ? 'px-5 py-3.5' : 'px-4 py-3 sm:px-5'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`shrink-0 overflow-hidden rounded-xl border border-white/30 bg-white ${
                limMode ? 'h-12 w-12' : 'h-11 w-11'
              }`}
            >
              <ResilientImage
                src="/src/assets/images/elf_craftsman_avatar_1794993394306.jpg"
                alt="Elfo Pino"
                fallbackTitle="Elfo Pino"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] font-semibold text-amber-200">
                Guida rapida per la classe · {limMode ? 'Modalità LIM attiva' : 'Tablet, PC e LIM'}
              </span>
              <h2
                id="welcome-overlay-title"
                className={`font-semibold text-white truncate ${
                  limMode ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
                }`}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Benvenuto nel Villaggio delle Forme!
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => toggleSpeakForKids(WELCOME_SPEECH_TEXT)}
              className={`inline-flex items-center gap-1.5 rounded-lg bg-amber-400 font-bold text-slate-950 hover:bg-amber-300 touch-none select-none whitespace-nowrap shrink-0 cursor-pointer ${
                limMode ? 'min-h-[38px] px-3.5 py-1.5 text-xs' : 'min-h-[32px] px-3 py-1 text-[11px]'
              }`}
            >
              {isSpeaking ? (
                <Square className="h-3.5 w-3.5 fill-slate-950" aria-hidden="true" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{isSpeaking ? 'Ferma' : 'Ascolta'}</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Chiudi guida di benvenuto"
              className={`inline-flex items-center justify-center rounded-lg border border-white/30 bg-[#083822] text-white hover:bg-[#062b1a] touch-none select-none shrink-0 cursor-pointer ${
                limMode ? 'h-[38px] w-[38px]' : 'h-[32px] w-[32px]'
              }`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Horizontal 3-column guide body (zero-scroll on LIM & Desktop) */}
        <div className={limMode ? 'p-4 sm:p-5 space-y-3.5' : 'p-4 space-y-3'}>
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
            {/* Step 1: Touch & Drag */}
            <div
              className={`flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 ${
                limMode ? 'p-3.5' : 'p-3'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0F5132] text-white">
                    <Hand className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h3 className={`font-bold text-slate-900 ${limMode ? 'text-sm' : 'text-[13px]'}`}>
                    1. Tocca o Trascina
                  </h3>
                </div>
                <p className={`mt-2 leading-relaxed text-slate-700 ${limMode ? 'text-xs sm:text-[13px]' : 'text-xs'}`}>
                  Alla LIM o sul tablet, tocca una forma nel vassoio e poi lo spazio tratteggiato sulla lavagna, oppure trascina i pezzi del Tangram direttamente con il dito o la penna.
                </p>
              </div>
              <span className="mt-2.5 inline-block text-[11px] font-semibold text-[#0F5132]">
                Sfida Slitta · Scene · Fabbrica Tangram
              </span>
            </div>

            {/* Step 2: Rotate & Flip */}
            <div
              className={`flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 ${
                limMode ? 'p-3.5' : 'p-3'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white">
                    <RotateCw className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h3 className={`font-bold text-slate-900 ${limMode ? 'text-sm' : 'text-[13px]'}`}>
                    2. Ruota e Incastra
                  </h3>
                </div>
                <p className={`mt-2 leading-relaxed text-slate-700 ${limMode ? 'text-xs sm:text-[13px]' : 'text-xs'}`}>
                  Fai doppio tocco su un pezzo del Tangram oppure premi i bottoni <strong className="font-semibold text-slate-900">-45°</strong>, <strong className="font-semibold text-slate-900">+45°</strong> e <strong className="font-semibold text-slate-900">Capovolgi</strong> per orientarlo prima dell’incastro.
                </p>
              </div>
              <span className="mt-2.5 inline-block text-[11px] font-semibold text-red-700">
                Doppio tocco · Barra rapida su lavagna
              </span>
            </div>

            {/* Step 3: Explore & Listen */}
            <div
              className={`flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 ${
                limMode ? 'p-3.5' : 'p-3'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-slate-950">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h3 className={`font-bold text-slate-900 ${limMode ? 'text-sm' : 'text-[13px]'}`}>
                    3. Gioca e Raccogli Stelle
                  </h3>
                </div>
                <p className={`mt-2 leading-relaxed text-slate-700 ${limMode ? 'text-xs sm:text-[13px]' : 'text-xs'}`}>
                  Esplora tutte le attività dal menu in alto: <strong className="font-semibold text-slate-900">Indovinelli</strong>, <strong className="font-semibold text-slate-900">Atlante</strong> e <strong className="font-semibold text-slate-900">Dashboard</strong>. Attiva <strong className="font-semibold text-slate-900">Audio</strong> per la voce guida automatica!
                </p>
              </div>
              <span className="mt-2.5 inline-block text-[11px] font-semibold text-amber-800">
                Stelle · Indizi · Voce dell’Elfo Pino
              </span>
            </div>
          </div>

          {/* Classroom LIM quick strip + primary CTA */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <Monitor className="h-4 w-4 shrink-0 text-[#0F5132]" aria-hidden="true" />
              <p className="text-xs font-medium text-slate-800">
                {limMode
                  ? 'Modalità LIM attiva: schermo orizzontale senza scorrimento e tocchi protetti per la lavagna di classe.'
                  : 'Proietti alla lavagna in classe? Attiva la Modalità LIM per bloccare lo scorrimento e ingrandire l’area orizzontale.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  playClickPop(soundEnabled);
                  onToggleLimMode();
                }}
                aria-pressed={limMode}
                className={`inline-flex items-center gap-1.5 rounded-lg border font-bold transition-colors touch-none select-none whitespace-nowrap shrink-0 cursor-pointer ${
                  limMode ? 'min-h-[38px] px-3 py-1.5 text-xs' : 'min-h-[34px] px-3 py-1 text-[11px]'
                } ${
                  limMode
                    ? 'border-[#0F5132] bg-white text-[#0F5132] hover:bg-emerald-100'
                    : 'border-[#0F5132] bg-[#0F5132] text-white hover:bg-[#14532D]'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{limMode ? 'LIM: Attiva' : 'Attiva Modalità LIM'}</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className={`inline-flex items-center gap-1.5 rounded-lg bg-red-600 font-bold text-white hover:bg-red-700 transition-colors touch-none select-none whitespace-nowrap shrink-0 cursor-pointer ${
                  limMode ? 'min-h-[38px] px-4 py-1.5 text-xs' : 'min-h-[34px] px-4 py-1 text-xs'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Inizia a Giocare</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
