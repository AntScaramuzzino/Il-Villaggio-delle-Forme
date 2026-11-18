import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, HelpCircle, RotateCcw, Square, Volume2, XCircle } from 'lucide-react';
import { getShapeById, RIDDLES_BANK, SCHOOL_LEVEL_INFO } from '../data/christmasShapes';
import { ELF_BY_ID } from '../data/elfCharacters';
import { AUDIO_DELAYS, playClickPop, playErrorThud, playSuccessChime } from '../lib/soundFx';
import { speakForKids, stopSpeaking, toggleSpeakForKids, useSpeakingElf, useSpeakingState } from '../lib/ttsVoice';
import { SchoolLevel, ShapeId } from '../types/christmasGeometry';
import { ResilientImage } from './ResilientImage';
import { ShapeSvg } from './ShapeSvg';

interface RiddlesQuizProps {
  level: SchoolLevel;
  onChangeLevel: (level: SchoolLevel) => void;
  soundEnabled: boolean;
  solvedRiddles: string[];
  onSolveRiddle: (riddleId: string) => void;
  limMode?: boolean;
}

export const RiddlesQuiz: React.FC<RiddlesQuizProps> = ({
  level,
  onChangeLevel,
  soundEnabled,
  solvedRiddles,
  onSolveRiddle,
  limMode = false
}) => {
  const levelRiddles = useMemo(() => {
    if (level === 'base') return RIDDLES_BANK.filter((r) => r.level === 'base');
    if (level === 'poligoni') {
      return RIDDLES_BANK.filter((r) => r.level === 'base' || r.level === 'poligoni');
    }
    return RIDDLES_BANK;
  }, [level]);

  const [index, setIndex] = useState(0);
  const [clueStep, setClueStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<ShapeId | null>(null);

  const safeIndex = index % levelRiddles.length;
  const riddle = levelRiddles[safeIndex];
  const correctShape = getShapeById(riddle.correctShapeId);

  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === riddle.correctShapeId;
  const containerMax = limMode ? 'max-w-[1600px]' : 'max-w-[1160px]';
  const isSpeaking = useSpeakingState();
  const speakingElf = useSpeakingElf();
  const isRossellaSpeaking = speakingElf === 'rossella';

  useEffect(() => {
    if (soundEnabled) {
      speakForKids(`Indovinello numero ${safeIndex + 1}: ${riddle.question}`, true, {
        delayMs: AUDIO_DELAYS.afterClick,
        elfId: 'rossella'
      });
    } else {
      stopSpeaking();
    }
    return () => {
      stopSpeaking();
    };
  }, [riddle.id, riddle.question, safeIndex, soundEnabled]);

  const handleSelectAnswer = (shapeId: ShapeId) => {
    if (isAnswered) return;
    setSelectedOption(shapeId);
    const chosenShape = getShapeById(shapeId);
    if (shapeId === riddle.correctShapeId) {
      playSuccessChime(soundEnabled);
      onSolveRiddle(riddle.id);
      speakForKids(
        `Risposta esatta! È ${chosenShape.articleName}: ${chosenShape.christmasObject}. ${riddle.explanation}`,
        soundEnabled,
        { delayMs: AUDIO_DELAYS.afterChime, elfId: 'rossella' }
      );
    } else {
      playErrorThud(soundEnabled);
      speakForKids(
        `Non è ${chosenShape.articleName}. Riprova oppure chiedi un indizio a Elfa Rossella!`,
        soundEnabled,
        { delayMs: AUDIO_DELAYS.afterThud, elfId: 'rossella' }
      );
    }
  };

  const handleNext = () => {
    playClickPop(soundEnabled);
    stopSpeaking();
    setIndex((prev) => (prev + 1) % levelRiddles.length);
    setClueStep(0);
    setSelectedOption(null);
  };

  const handleRetry = () => {
    playClickPop(soundEnabled);
    stopSpeaking();
    setSelectedOption(null);
  };

  const handleAskClue = () => {
    playClickPop(soundEnabled);
    const nextStep = Math.min(2, clueStep + 1);
    setClueStep(nextStep);
    const clueText = riddle.clues[nextStep - 1];
    if (clueText) {
      speakForKids(`Indizio ${nextStep}: ${clueText}`, soundEnabled, {
        delayMs: AUDIO_DELAYS.afterClick,
        elfId: 'rossella'
      });
    }
  };

  return (
    <section
      className={`mx-auto ${containerMax} px-3 sm:px-5 ${
        limMode ? 'flex flex-col py-2 md:h-full md:overflow-hidden gap-2' : 'py-3 space-y-3'
      }`}
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1
            className="text-xl sm:text-2xl font-semibold text-slate-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Indovinelli Geometrici
          </h1>
          {!limMode && (
            <p className="mt-0.5 text-xs text-slate-700">
              Ascolta gli indizi su lati, vertici e solidi per svelare la forma di Natale.
            </p>
          )}
        </div>

        {/* Level selector */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-200 p-0.5">
          {(['base', 'poligoni', 'esperti'] as SchoolLevel[]).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => {
                playClickPop(soundEnabled);
                onChangeLevel(lvl);
                setIndex(0);
                setClueStep(0);
                setSelectedOption(null);
              }}
              className={`min-h-[30px] rounded-md px-2.5 py-0.5 text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                level === lvl ? 'bg-white text-slate-900 shadow-xs' : 'bg-transparent text-slate-800 hover:bg-white/70'
              }`}
            >
              {SCHOOL_LEVEL_INFO[lvl].classes}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`grid grid-cols-1 gap-3 md:grid-cols-12 md:items-stretch ${
          limMode ? 'flex-1 min-h-0' : ''
        }`}
      >
        {/* Left: Illustrated Starry Night Riddle Stage */}
        <div
          className={`relative flex flex-col justify-between overflow-hidden rounded-xl bg-[#0F5132] text-white md:col-span-5 ${
            limMode ? 'p-3.5 min-h-0' : 'p-3.5 sm:p-4'
          }`}
        >
          <ResilientImage
            src="/src/assets/images/bg_starry_winter_sky_1794994127354.jpg"
            alt="Cielo stellato d'inverno sullo sfondo degli indovinelli"
            fallbackTitle="Notte Stellata di Natale"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-[#0B3B24]/80" aria-hidden="true" />

          <div className="relative z-10">
            <div className="flex items-center justify-between text-[11px] text-emerald-100">
              <span>Indovinello {safeIndex + 1}/{levelRiddles.length}</span>
              <span className="font-mono tabular-nums">
                Risolti: {solvedRiddles.length}/{RIDDLES_BANK.length}
              </span>
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div
                  className={`h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border-2 border-amber-300/80 bg-white shadow-sm transition-transform ${
                    isRossellaSpeaking ? 'elf-speaking-active' : ''
                  }`}
                >
                  <ResilientImage
                    src={ELF_BY_ID.rossella.portraitSrc}
                    alt={`${ELF_BY_ID.rossella.fullName} con indovinello`}
                    fallbackTitle={ELF_BY_ID.rossella.fullName}
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div>
                  <span className="block text-[10px] font-medium text-emerald-200">
                    Guida Indovinelli
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-amber-200">
                    Elfa Rossella chiede:
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleSpeakForKids(riddle.question, { elfId: 'rossella' })}
                className="inline-flex min-h-[30px] items-center gap-1 rounded-lg bg-amber-400 px-3 py-1 text-[11px] font-bold text-slate-950 hover:bg-amber-300 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isSpeaking ? (
                  <Square className="h-3 w-3 fill-slate-950" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-3 w-3" aria-hidden="true" />
                )}
                <span>{isSpeaking ? 'Ferma' : 'Ascolta'}</span>
              </button>
            </div>

            <blockquote
              className={`mt-2.5 font-medium leading-snug text-white ${
                limMode ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
              }`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              “{riddle.question}”
            </blockquote>

            {/* Progressive Clues */}
            <div className="mt-3 space-y-1.5">
              {clueStep >= 1 && (
                <div className="rounded-lg border border-emerald-300/45 bg-[#083822] p-2.5 text-xs text-amber-100">
                  <span className="font-semibold text-amber-300">Indizio 1: </span>
                  {riddle.clues[0]}
                </div>
              )}
              {clueStep >= 2 && (
                <div className="rounded-lg border border-emerald-300/45 bg-[#083822] p-2.5 text-xs text-amber-100">
                  <span className="font-semibold text-amber-300">Indizio 2: </span>
                  {riddle.clues[1]}
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 mt-3 border-t border-emerald-300/20 pt-2.5">
            <button
              type="button"
              disabled={clueStep >= 2}
              onClick={handleAskClue}
              className="inline-flex min-h-[32px] items-center gap-1 rounded-lg border border-emerald-300/60 bg-[#083822] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#062b1a] whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-45 disabled:cursor-default"
            >
              <HelpCircle className="h-3 w-3 text-amber-300" aria-hidden="true" />
              <span>
                {clueStep === 0
                  ? 'Indizio 1'
                  : clueStep === 1
                  ? 'Indizio 2'
                  : 'Indizi esauriti'}
              </span>
            </button>
          </div>
        </div>

        {/* Right: Options & Explanation */}
        <div
          className={`flex flex-col justify-between rounded-xl border border-slate-300 bg-white md:col-span-7 ${
            limMode ? 'p-3.5 min-h-0' : 'p-3.5 sm:p-4'
          }`}
        >
          <div className={limMode ? 'flex flex-1 flex-col min-h-0' : ''}>
            <h2 className="shrink-0 text-sm font-semibold text-slate-900">
              Scegli la figura giusta
            </h2>

            <div
              className={`grid grid-cols-1 sm:grid-cols-2 ${
                limMode ? 'mt-2 flex-1 min-h-0 sm:grid-rows-2 gap-2.5' : 'mt-2.5 gap-2.5'
              }`}
            >
              {riddle.optionShapeIds.map((optId) => {
                const shape = getShapeById(optId);
                const chosen = selectedOption === optId;
                const correct = riddle.correctShapeId === optId;

                let style =
                  'border-slate-300 bg-white hover:border-[#0F5132] hover:bg-emerald-50/50';
                if (isAnswered && correct) {
                  style = 'border-emerald-600 bg-emerald-50 ring-3 ring-emerald-500/35';
                } else if (isAnswered && chosen && !correct) {
                  style = 'border-red-600 bg-red-50';
                }

                return (
                  <button
                    key={optId}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectAnswer(optId)}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 transition-colors cursor-pointer disabled:cursor-default ${
                      limMode ? 'min-h-[104px] p-2' : 'min-h-[116px] p-2.5'
                    } ${style}`}
                  >
                    <ShapeSvg shapeId={optId} size={limMode ? 78 : 68} ornamentMode />
                    <span className={`font-bold text-slate-900 ${limMode ? 'text-sm sm:text-base' : 'text-sm'}`}>
                      {shape.name}
                    </span>
                    <span className="text-[11px] font-semibold text-red-700">
                      {isAnswered ? shape.christmasObject : 'Tocca per svelare'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-2.5 shrink-0">
            {isAnswered ? (
              <div
                className={`flex flex-wrap items-center justify-between gap-2.5 rounded-xl border-2 p-2.5 ${
                  isCorrect
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                    : 'border-red-300 bg-red-50 text-red-950'
                }`}
              >
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  {isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
                  )}
                  <div>
                    <p className="text-xs font-bold">
                      {isCorrect
                        ? `Esatto! ${correctShape.christmasObject}`
                        : 'Non è questa la figura.'}
                    </p>
                    <p className="mt-0.5 text-xs">
                      {isCorrect ? riddle.explanation : 'Riprova oppure chiedi un indizio a Elfa Rossella.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!isCorrect && (
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="inline-flex min-h-[32px] items-center gap-1 rounded-lg border border-red-300 bg-white px-2.5 py-1 text-[11px] font-bold text-red-900 hover:bg-red-100 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" aria-hidden="true" />
                      <span>Riprova</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="min-h-[32px] rounded-lg bg-slate-900 px-3 py-1 text-[11px] font-bold text-white hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Prossimo
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-700">
                Tocca una delle quattro figure per verificare la risposta e svelare l’oggetto di Natale.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
