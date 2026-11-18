import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, HelpCircle, RotateCcw, Volume2, XCircle } from 'lucide-react';
import { getShapeById, RIDDLES_BANK, SCHOOL_LEVEL_INFO } from '../data/christmasShapes';
import { playClickPop, playErrorThud, playSuccessChime } from '../lib/soundFx';
import { speakForKids, stopSpeaking } from '../lib/ttsVoice';
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
  const containerMax = limMode ? 'max-w-[1600px]' : 'max-w-[1200px]';

  useEffect(() => {
    if (soundEnabled) {
      speakForKids(`Indovinello numero ${safeIndex + 1}: ${riddle.question}`, true);
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
        soundEnabled
      );
    } else {
      playErrorThud(soundEnabled);
      speakForKids(
        `Non è ${chosenShape.articleName}. Riprova oppure chiedi un indizio all'Elfo Pino!`,
        soundEnabled
      );
    }
  };

  const handleNext = () => {
    playClickPop(soundEnabled);
    setIndex((prev) => (prev + 1) % levelRiddles.length);
    setClueStep(0);
    setSelectedOption(null);
  };

  const handleRetry = () => {
    playClickPop(soundEnabled);
    setSelectedOption(null);
  };

  const handleAskClue = () => {
    playClickPop(soundEnabled);
    const nextStep = Math.min(2, clueStep + 1);
    setClueStep(nextStep);
    const clueText = riddle.clues[nextStep - 1];
    if (clueText) {
      speakForKids(`Indizio ${nextStep}: ${clueText}`, soundEnabled);
    }
  };

  return (
    <section
      className={`mx-auto ${containerMax} px-4 sm:px-6 ${
        limMode ? 'flex flex-col py-3 md:h-full md:overflow-hidden gap-3' : 'py-5'
      }`}
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-semibold text-slate-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Indovinelli Geometrici di Natale
          </h1>
          {!limMode && (
            <p className="mt-1 text-sm text-slate-700">
              Ascolta gli indizi su lati, vertici e solidi per svelare la forma e il suo oggetto di Natale.
            </p>
          )}
        </div>

        {/* Level selector */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-200 p-1">
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
              className={`min-h-[38px] rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                level === lvl ? 'bg-white text-slate-900 shadow-xs' : 'bg-transparent text-slate-800 hover:bg-white/70'
              }`}
            >
              {SCHOOL_LEVEL_INFO[lvl].classes}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`grid grid-cols-1 md:grid-cols-12 md:items-stretch ${
          limMode ? 'flex-1 min-h-0 gap-4' : 'mt-5 gap-6'
        }`}
      >
        {/* Left: Illustrated Starry Night Riddle Stage */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#0F5132] p-6 text-white md:col-span-5">
          <ResilientImage
            src="/src/assets/images/bg_starry_winter_sky_1794994127354.jpg"
            alt="Cielo stellato d'inverno sullo sfondo degli indovinelli"
            fallbackTitle="Notte Stellata di Natale"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-[#0B3B24]/80" aria-hidden="true" />

          <div className="relative z-10">
            <div className="flex items-center justify-between text-xs text-emerald-100">
              <span>Indovinello {safeIndex + 1} di {levelRiddles.length}</span>
              <span className="font-mono tabular-nums">
                Risolti: {solvedRiddles.length}/{RIDDLES_BANK.length}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/25 bg-white">
                  <ResilientImage
                    src="/src/assets/images/elf_craftsman_avatar_1794993394306.jpg"
                    alt="Elfo Pino con indovinello"
                    fallbackTitle="Elfo Pino"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-sm font-semibold text-amber-200">
                  L’Elfo Pino chiede:
                </span>
              </div>

              <button
                type="button"
                onClick={() => speakForKids(riddle.question, true)}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Volume2 className="h-4 w-4" aria-hidden="true" />
                <span>Ascolta</span>
              </button>
            </div>

            <blockquote
              className={`mt-4 font-medium leading-relaxed text-white ${
                limMode ? 'text-2xl sm:text-3xl' : 'text-xl'
              }`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              “{riddle.question}”
            </blockquote>

            {/* Progressive Clues */}
            <div className="mt-6 space-y-2.5">
              {clueStep >= 1 && (
                <div className="rounded-xl border border-emerald-300/45 bg-[#083822] p-3.5 text-sm text-amber-100">
                  <span className="font-semibold text-amber-300">Indizio 1: </span>
                  {riddle.clues[0]}
                </div>
              )}
              {clueStep >= 2 && (
                <div className="rounded-xl border border-emerald-300/45 bg-[#083822] p-3.5 text-sm text-amber-100">
                  <span className="font-semibold text-amber-300">Indizio 2: </span>
                  {riddle.clues[1]}
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 mt-6 border-t border-emerald-300/20 pt-4">
            <button
              type="button"
              disabled={clueStep >= 2}
              onClick={handleAskClue}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-xl border border-emerald-300/60 bg-[#083822] px-4 py-2 text-sm font-bold text-white hover:bg-[#062b1a] whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-45 disabled:cursor-default"
            >
              <HelpCircle className="h-4 w-4 text-amber-300" aria-hidden="true" />
              <span>
                {clueStep === 0
                  ? 'Chiedi Indizio 1'
                  : clueStep === 1
                  ? 'Chiedi Indizio 2'
                  : 'Tutti gli indizi mostrati'}
              </span>
            </button>
          </div>
        </div>

        {/* Right: Options & Explanation */}
        <div
          className={`flex flex-col justify-between rounded-2xl border border-slate-300 bg-white md:col-span-7 ${
            limMode ? 'p-5 min-h-0' : 'p-6'
          }`}
        >
          <div className={limMode ? 'flex flex-1 flex-col min-h-0' : ''}>
            <h2 className={`shrink-0 font-semibold text-slate-900 ${limMode ? 'text-base sm:text-lg' : 'text-base'}`}>
              Quale figura corrisponde all’indovinello?
            </h2>

            <div
              className={`grid grid-cols-1 sm:grid-cols-2 ${
                limMode ? 'mt-3 flex-1 min-h-0 sm:grid-rows-2 gap-3' : 'mt-4 gap-4'
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
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 transition-colors cursor-pointer disabled:cursor-default ${
                      limMode ? 'min-h-[120px]' : 'min-h-[154px] p-4'
                    } ${style}`}
                  >
                    <ShapeSvg shapeId={optId} size={limMode ? 90 : 84} ornamentMode />
                    <span className={`font-bold text-slate-900 ${limMode ? 'text-lg sm:text-xl' : 'text-base'}`}>
                      {shape.name}
                    </span>
                    <span className="text-xs font-semibold text-red-700">
                      {isAnswered ? shape.christmasObject : 'Tocca per svelare l’oggetto'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`shrink-0 ${limMode ? 'mt-3' : 'mt-6'}`}>
            {isAnswered ? (
              <div
                className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border-2 p-4 ${
                  isCorrect
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                    : 'border-red-300 bg-red-50 text-red-950'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" aria-hidden="true" />
                  ) : (
                    <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-700" aria-hidden="true" />
                  )}
                  <div>
                    <p className="text-sm font-bold">
                      {isCorrect
                        ? `Risposta esatta! Oggetto svelato: ${correctShape.christmasObject}`
                        : 'Non è questa la figura.'}
                    </p>
                    <p className="mt-0.5 text-sm">
                      {isCorrect ? riddle.explanation : 'Riprova oppure chiedi un indizio all’Elfo.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isCorrect && (
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-bold text-red-900 hover:bg-red-100 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Riprova</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="min-h-[44px] rounded-lg bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Prossimo Indovinello
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700">
                Tocca una delle quattro figure decorate per verificare la risposta e svelare l’oggetto di Natale.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
