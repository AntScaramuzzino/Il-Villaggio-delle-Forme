import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Heart, HelpCircle, Pause, Play, RotateCcw, Star, Volume2, VolumeX, XCircle } from 'lucide-react';
import { getShapeById, getShapesForLevel, SCHOOL_LEVEL_INFO } from '../data/christmasShapes';
import { playClickPop, playErrorThud, playSuccessChime, playVictoryFanfare } from '../lib/soundFx';
import { speakForKids, stopSpeaking } from '../lib/ttsVoice';
import { ChristmasShapeDef, GameState, SchoolLevel, ShapeId } from '../types/christmasGeometry';
import { ResilientImage } from './ResilientImage';
import { ShapeSvg } from './ShapeSvg';

interface SleighQuestion {
  target: ChristmasShapeDef;
  options: Array<{ shape: ChristmasShapeDef; rotation: number }>;
  promptStyle: 'by-name' | 'by-clue' | 'by-sides';
  promptText: string;
}

interface SleighChallengeGameProps {
  level: SchoolLevel;
  onChangeLevel: (level: SchoolLevel) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  bestScore: number;
  onRecordScore: (score: number, starsEarned: number) => void;
  resetSignal: number;
  limMode?: boolean;
}

const ROUND_LENGTH = 8;

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildRoundQuestions(level: SchoolLevel): SleighQuestion[] {
  const pool = getShapesForLevel(level);
  const questions: SleighQuestion[] = [];

  for (let i = 0; i < ROUND_LENGTH; i++) {
    const target = pool[i % pool.length];
    const distractors = shuffleArray(pool.filter((s) => s.id !== target.id)).slice(0, 3);
    const allOptions = shuffleArray([target, ...distractors]).map((shape) => ({
      shape,
      rotation: level === 'base' ? 0 : [0, 15, -15, 30][Math.floor(Math.random() * 4)]
    }));

    let promptStyle: SleighQuestion['promptStyle'] = 'by-name';
    let promptText = `Carica sulla slitta ${target.articleName}!`;

    if (i % 3 === 1) {
      promptStyle = 'by-clue';
      promptText = `L'elfo cerca il ${target.christmasObject}: ${target.christmasClue}`;
    } else if (i % 3 === 2 && target.sides !== null && target.category === 'piana') {
      promptStyle = 'by-sides';
      promptText =
        target.sides === 0
          ? 'Trova la figura piana senza lati dritti e senza vertici!'
          : `Trova la figura piana con ${target.sides} lati: ${target.articleName}!`;
    }

    questions.push({
      target,
      options: allOptions,
      promptStyle,
      promptText
    });
  }

  return shuffleArray(questions);
}

export const SleighChallengeGame: React.FC<SleighChallengeGameProps> = ({
  level,
  onChangeLevel,
  soundEnabled,
  onToggleSound,
  bestScore,
  onRecordScore,
  resetSignal,
  limMode = false
}) => {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [questions, setQuestions] = useState<SleighQuestion[]>(() => buildRoundQuestions(level));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedId, setSelectedId] = useState<ShapeId | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [loadedGifts, setLoadedGifts] = useState<ShapeId[]>([]);

  const containerMax = limMode ? 'max-w-[1600px]' : 'max-w-[1200px]';
  const currentQuestion = questions[currentIndex];

  // Speak new question aloud when actively playing
  useEffect(() => {
    if (gameState === 'PLAYING' && currentQuestion && feedback === null) {
      speakForKids(currentQuestion.promptText, soundEnabled);
    }
    return () => {
      if (gameState !== 'PLAYING') {
        stopSpeaking();
      }
    };
  }, [gameState, currentIndex, currentQuestion, feedback, soundEnabled]);

  const startRound = useCallback(
    (targetLevel: SchoolLevel = level) => {
      playClickPop(soundEnabled);
      setQuestions(buildRoundQuestions(targetLevel));
      setCurrentIndex(0);
      setScore(0);
      setStreak(0);
      setLives(3);
      setCorrectCount(0);
      setSelectedId(null);
      setFeedback(null);
      setShowHint(false);
      setLoadedGifts([]);
      setGameState('PLAYING');
    },
    [level, soundEnabled]
  );

  useEffect(() => {
    if (resetSignal > 0) {
      stopSpeaking();
      setGameState('TITLE_MENU');
    }
  }, [resetSignal]);

  const handleSelectOption = (chosen: ChristmasShapeDef) => {
    if (gameState !== 'PLAYING' || feedback !== null || !currentQuestion) return;

    setSelectedId(chosen.id);
    const isCorrect = chosen.id === currentQuestion.target.id;

    if (isCorrect) {
      playSuccessChime(soundEnabled);
      const nextStreak = streak + 1;
      const pointsEarned = 20 + (nextStreak > 1 ? (nextStreak - 1) * 5 : 0);
      const msg = `Ottimo lavoro! È ${chosen.articleName}, proprio come ${chosen.christmasObject}!`;
      setScore((prev) => prev + pointsEarned);
      setStreak(nextStreak);
      setCorrectCount((prev) => prev + 1);
      setLoadedGifts((prev) => [...prev, chosen.id]);
      setFeedback({
        isCorrect: true,
        message: `${msg} (+${pointsEarned} punti)`
      });
      speakForKids(msg, soundEnabled);
    } else {
      playErrorThud(soundEnabled);
      const nextLives = lives - 1;
      const msg = `Quello era ${chosen.articleName}, che sembra ${chosen.christmasObject}. ${currentQuestion.target.schoolTip}`;
      setLives(nextLives);
      setStreak(0);
      setFeedback({
        isCorrect: false,
        message: msg
      });
      speakForKids(msg, soundEnabled);
      if (nextLives <= 0) {
        window.setTimeout(() => {
          setGameState('GAME_OVER');
        }, 1600);
      }
    }
  };

  const handleNextQuestion = () => {
    playClickPop(soundEnabled);
    if (lives <= 0) {
      setGameState('GAME_OVER');
      return;
    }
    if (currentIndex + 1 >= questions.length) {
      playVictoryFanfare(soundEnabled);
      const starsEarned = correctCount >= 7 ? 3 : correctCount >= 5 ? 2 : 1;
      onRecordScore(score, starsEarned);
      setGameState('ROUND_SUMMARY');
      speakForKids(
        `Bravissimo! Hai caricato la slitta con ${score} punti e vinto ${starsEarned} stelle!`,
        soundEnabled
      );
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedId(null);
    setFeedback(null);
    setShowHint(false);
  };

  const starsPreview = useMemo(() => {
    if (correctCount >= 7) return 3;
    if (correctCount >= 5) return 2;
    return 1;
  }, [correctCount]);

  // TITLE MENU
  if (gameState === 'TITLE_MENU') {
    const levelShapes = getShapesForLevel(level);
    return (
      <section
        className={`mx-auto ${containerMax} px-4 sm:px-6 ${
          limMode ? 'flex flex-col py-3 md:h-full md:overflow-hidden gap-3' : 'py-6'
        }`}
      >
        <div
          className={`grid grid-cols-1 md:grid-cols-12 md:items-stretch ${
            limMode ? 'flex-1 min-h-0 gap-4' : 'gap-6'
          }`}
        >
          <div
            className={`flex flex-col justify-between rounded-2xl border border-slate-300 bg-white md:col-span-7 ${
              limMode ? 'p-5 min-h-0' : 'p-6 sm:p-8'
            }`}
          >
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
                <span>Scuola Primaria</span>
                <span aria-hidden="true">·</span>
                <span>Classi 1ª–5ª</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">Record personale: {bestScore} punti</span>
              </div>

              <h1
                className={`mt-2 font-semibold tracking-tight text-slate-900 ${
                  limMode ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-4xl'
                }`}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Missione Natale: Il Villaggio delle Forme
              </h1>

              <p className={`mt-2 max-w-2xl leading-relaxed text-slate-700 ${limMode ? 'text-sm sm:text-base' : 'text-base'}`}>
                Aiuta gli elfi del villaggio a preparare la slitta: ogni forma nasconde un oggetto
                di Natale come il panettone, il puntale o la pallina dell’albero!
              </p>

              {/* Level selector */}
              <div className={limMode ? 'mt-4' : 'mt-6'}>
                <span className="block text-sm font-semibold text-slate-900">
                  Scegli la tua classe
                </span>
                <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {(['base', 'poligoni', 'esperti'] as SchoolLevel[]).map((lvl) => {
                    const info = SCHOOL_LEVEL_INFO[lvl];
                    const active = level === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => {
                          playClickPop(soundEnabled);
                          onChangeLevel(lvl);
                        }}
                        className={`flex flex-col items-start rounded-xl border-2 text-left transition-colors cursor-pointer ${
                          limMode ? 'min-h-[64px] p-3' : 'min-h-[78px] p-3.5'
                        } ${
                          active
                            ? 'border-[#0F5132] bg-emerald-50 text-slate-900'
                            : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400'
                        }`}
                      >
                        <span className={`font-semibold text-slate-900 whitespace-nowrap ${limMode ? 'text-sm sm:text-base' : 'text-sm'}`}>
                          {info.classes}
                        </span>
                        <span className="mt-0.5 text-xs leading-snug text-slate-700">
                          {info.summary}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={`flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 ${limMode ? 'mt-4 pt-4' : 'mt-8 pt-6'}`}>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => startRound(level)}
                  className={`inline-flex items-center gap-2 rounded-xl bg-red-600 font-semibold text-white transition-colors hover:bg-red-700 whitespace-nowrap shrink-0 cursor-pointer ${
                    limMode ? 'min-h-[48px] px-7 py-2.5 text-base' : 'min-h-[48px] px-6 py-2.5 text-sm'
                  }`}
                >
                  <Play className="h-5 w-5" aria-hidden="true" />
                  <span>Inizia Partita</span>
                </button>

                <button
                  type="button"
                  onClick={onToggleSound}
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4 text-[#0F5132]" aria-hidden="true" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  )}
                  <span>{soundEnabled ? 'Voce & Audio: Attivi' : 'Voce & Audio: Spenti'}</span>
                </button>
              </div>

              <span className="text-xs font-medium text-slate-600 tabular-nums">
                8 regali per ogni viaggio
              </span>
            </div>
          </div>

          {/* Right illustrated card */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-300 bg-[#0F5132] text-white md:col-span-5 min-h-0">
            <div className={`relative w-full ${limMode ? 'flex-1 min-h-[140px]' : 'h-60 sm:h-68 md:flex-1'}`}>
              <ResilientImage
                src="/src/assets/images/christmas_workshop_banner_1794993393827.jpg"
                alt="Tavolo da lavoro dell'officina di Natale con forme geometriche in legno"
                fallbackTitle="Villaggio delle Forme di Natale"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F5132] via-[#0F5132]/30 to-transparent" />
            </div>
            <div className={`flex shrink-0 items-center gap-4 ${limMode ? 'p-4' : 'p-6'}`}>
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/25 bg-white">
                <ResilientImage
                  src="/src/assets/images/elf_craftsman_avatar_1794993394306.jpg"
                  alt="Elfo Pino con squadra gialla"
                  fallbackTitle="Elfo Pino"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">
                  La voce dell’Elfo Pino
                </h2>
                <p className="mt-0.5 text-xs sm:text-sm leading-snug text-emerald-100">
                  L’elfo legge ad alta voce le richieste e svela quale oggetto di Natale si
                  nasconde in ogni forma!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview strip of shapes + Christmas objects in selected level */}
        <div className={`shrink-0 rounded-2xl border border-slate-300 bg-white ${limMode ? 'p-3.5' : 'mt-6 p-5 sm:p-6'}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm sm:text-base font-semibold text-slate-900">
              Forme e oggetti di Natale in {SCHOOL_LEVEL_INFO[level].classes}
            </h2>
            <span className="text-xs text-slate-600 tabular-nums">
              {levelShapes.length} figure sul banco
            </span>
          </div>
          <div
            className={`grid ${
              limMode
                ? levelShapes.length <= 5
                  ? 'mt-2.5 grid-cols-2 sm:grid-cols-5 gap-2'
                  : 'mt-2.5 grid-cols-2 sm:grid-cols-5 lg:grid-cols-7 gap-2'
                : 'mt-4 grid-cols-2 gap-3 sm:grid-cols-5 lg:grid-cols-7'
            }`}
          >
            {levelShapes.map((shape) => (
              <button
                key={shape.id}
                type="button"
                onClick={() => {
                  playClickPop(soundEnabled);
                  speakForKids(
                    `${shape.name}: sembra ${shape.christmasObject}. ${shape.schoolTip}`,
                    soundEnabled
                  );
                }}
                className={`flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 text-center text-slate-900 hover:border-[#0F5132] hover:bg-emerald-50/40 transition-colors cursor-pointer ${
                  limMode ? 'p-2' : 'p-3'
                }`}
              >
                <ShapeSvg shapeId={shape.id} size={limMode ? 40 : 58} ornamentMode />
                <span className="mt-1 text-xs font-bold text-slate-900 truncate max-w-full">{shape.name}</span>
                <span className="text-[11px] font-medium text-[#0F5132] truncate max-w-full">
                  {shape.christmasObject}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // PAUSED OVERLAY STATE
  if (gameState === 'PAUSED') {
    return (
      <section className="mx-auto max-w-[720px] px-4 py-14 sm:px-6">
        <div className="rounded-2xl border border-slate-300 bg-white p-8 text-center">
          <h2
            className="text-2xl font-semibold text-slate-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Partita in Pausa
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            La slitta ti aspetta sulla neve! Riprendi quando sei pronto.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                playClickPop(soundEnabled);
                setGameState('PLAYING');
              }}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#0F5132] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#14532D] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              <span>Riprendi</span>
            </button>
            <button
              type="button"
              onClick={() => startRound(level)}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Ricomincia</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ROUND SUMMARY OR GAME OVER
  if (gameState === 'ROUND_SUMMARY' || gameState === 'GAME_OVER') {
    const isVictory = gameState === 'ROUND_SUMMARY';
    return (
      <section className="mx-auto max-w-[880px] px-4 py-10 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-12 md:items-stretch">
            <div className="relative min-h-[240px] bg-[#0F5132] md:col-span-5">
              <ResilientImage
                src="/src/assets/images/santa_sleigh_scene_1794993393513.jpg"
                alt="Slitta di Babbo Natale pronta a partire nella neve"
                fallbackTitle="Slitta di Babbo Natale"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-between p-6 sm:p-8 md:col-span-7">
              <div>
                <span className="text-xs font-semibold text-slate-600">
                  {SCHOOL_LEVEL_INFO[level].classes} · {isVictory ? 'Viaggio completato' : 'Slitta ferma'}
                </span>
                <h2
                  className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {isVictory
                    ? 'Bravissimo! La slitta è carica di regali!'
                    : 'Oh no, sono caduti troppi pacchi!'}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {isVictory
                    ? 'Hai riconosciuto con precisione le forme geometriche aiutando gli elfi a preparare la consegna.'
                    : 'Non preoccuparti: riprova con calma usando l’aiuto per contare i lati e i vertici.'}
                </p>

                <div className="mt-6 grid grid-cols-3 gap-3 border-y border-slate-200 py-4">
                  <div>
                    <span className="block text-xs text-slate-600">Punteggio</span>
                    <span className="mt-1 block font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                      {score}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-600">Regali esatti</span>
                    <span className="mt-1 block font-mono text-2xl font-semibold text-[#0F5132] tabular-nums">
                      {correctCount}/{ROUND_LENGTH}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-600">Stelle vinte</span>
                    <div className="mt-1 flex items-center gap-1">
                      {[1, 2, 3].map((idx) => (
                        <Star
                          key={idx}
                          className={`h-6 w-6 ${
                            isVictory && idx <= starsPreview
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-200'
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => startRound(level)}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>Gioca Ancora</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopSpeaking();
                    setGameState('TITLE_MENU');
                  }}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Cambia Classe</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ACTIVE PLAYING VIEW
  return (
    <section
      className={`mx-auto ${containerMax} px-4 sm:px-6 ${
        limMode ? 'flex flex-col py-3 md:h-full md:overflow-hidden gap-3' : 'py-5'
      }`}
    >
      {/* Unobtrusive Top Game HUD */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-300 bg-white px-4 py-2.5">
        <div className={`flex flex-wrap items-center gap-4 sm:gap-5 ${limMode ? 'text-base' : 'text-sm'}`}>
          <span className="font-semibold text-slate-900">
            {SCHOOL_LEVEL_INFO[level].classes}
          </span>
          <span className="text-slate-300" aria-hidden="true">|</span>
          <span className="font-mono text-slate-800 tabular-nums">
            Regalo {currentIndex + 1}/{ROUND_LENGTH}
          </span>
          <span className="font-mono font-semibold text-[#0F5132] tabular-nums">
            Punti: {score}
          </span>
          <span className="font-mono text-amber-700 tabular-nums">
            Serie: {streak}
          </span>
          <div className="flex items-center gap-1.5" aria-label={`Vite rimaste: ${lives} su 3`}>
            {[1, 2, 3].map((h) => (
              <Heart
                key={h}
                className={`h-5 w-5 ${h <= lives ? 'fill-red-600 text-red-600' : 'text-slate-200'}`}
                aria-hidden="true"
              />
            ))}
            <span className="ml-1 text-xs font-semibold text-slate-800 tabular-nums">
              {lives}/3
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSound}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-[#0F5132]" aria-hidden="true" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-500" aria-hidden="true" />
            )}
            <span>{soundEnabled ? 'Voce: Attiva' : 'Voce: Muta'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              setGameState('PAUSED');
            }}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Pause className="h-4 w-4" aria-hidden="true" />
            <span>Pausa</span>
          </button>
        </div>
      </div>

      {/* Main Two-Zone Game Arena */}
      <div
        className={`grid grid-cols-1 md:grid-cols-12 md:items-stretch ${
          limMode ? 'flex-1 min-h-0 gap-4' : 'mt-5 gap-6'
        }`}
      >
        {/* Left: Illustrated Pine Workshop Stage & Sleigh */}
        <div
          className={`relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#0F5132] text-white md:col-span-5 ${
            limMode ? 'p-5 min-h-0' : 'p-6'
          }`}
        >
          <ResilientImage
            src="/src/assets/images/santa_sleigh_scene_1794993393513.jpg"
            alt="Sfondo innevato della slitta di Babbo Natale"
            fallbackTitle="Slitta di Babbo Natale"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-[#0F5132]/75" aria-hidden="true" />

          <div className="relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/30 bg-white">
                <ResilientImage
                  src="/src/assets/images/elf_craftsman_avatar_1794993394306.jpg"
                  alt="Elfo Pino"
                  fallbackTitle="Elfo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <span className="text-xs font-semibold text-amber-200">
                  Richiesta dell’Elfo Pino
                </span>
                <h2
                  className={`mt-0.5 font-semibold leading-snug text-white ${
                    limMode ? 'text-xl sm:text-2xl' : 'text-xl'
                  }`}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {currentQuestion?.promptText}
                </h2>
              </div>
            </div>

            {/* Voice replay + Geometric Hint Toggles */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  if (currentQuestion) {
                    speakForKids(currentQuestion.promptText, true);
                  }
                }}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-300 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Volume2 className="h-4 w-4" aria-hidden="true" />
                <span>Ascolta</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickPop(soundEnabled);
                  const next = !showHint;
                  setShowHint(next);
                  if (next && currentQuestion) {
                    speakForKids(currentQuestion.target.schoolTip, soundEnabled);
                  }
                }}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-white/40 bg-[#083822] px-4 py-2 text-sm font-semibold text-white hover:bg-[#062B1A] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <HelpCircle className="h-4 w-4 text-amber-300" aria-hidden="true" />
                <span>{showHint ? 'Nascondi Aiuto' : 'Mostra Aiuto'}</span>
              </button>
            </div>

            {showHint && currentQuestion && (
              <div className="mt-3 rounded-xl border border-emerald-300/35 bg-[#062B1A] p-3.5 text-sm text-white">
                <p className={`font-medium text-amber-200 ${limMode ? 'text-sm sm:text-base' : 'text-sm'}`}>
                  {currentQuestion.target.schoolTip}
                </p>
                <p className="mt-1 text-xs text-emerald-100 tabular-nums">
                  {currentQuestion.target.category === 'solido'
                    ? `Oggetto di Natale: ${currentQuestion.target.christmasObject}`
                    : `Lati: ${currentQuestion.target.sides} · Vertici: ${currentQuestion.target.vertices} · Oggetto: ${currentQuestion.target.christmasObject}`}
                </p>
              </div>
            )}
          </div>

          {/* Sleigh Load Progress */}
          <div className="relative z-10 mt-4 shrink-0 rounded-xl border border-white/20 bg-[#083822] p-3.5">
            <div className="flex items-center justify-between text-xs text-emerald-100">
              <span className="font-semibold">Slitta di Babbo Natale</span>
              <span className="font-mono tabular-nums">
                {loadedGifts.length}/{ROUND_LENGTH} pacchi
              </span>
            </div>
            <div className="mt-2.5 flex min-h-[52px] flex-wrap items-center gap-2 rounded-lg bg-[#052315] p-2">
              {loadedGifts.length === 0 ? (
                <span className="text-xs text-emerald-100">
                  La slitta è vuota: scegli il primo pacco!
                </span>
              ) : (
                loadedGifts.map((giftId, idx) => (
                  <div
                    key={`${giftId}-${idx}`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1"
                    title={`${getShapeById(giftId).name} — ${getShapeById(giftId).christmasObject}`}
                  >
                    <ShapeSvg shapeId={giftId} size={32} ornamentMode />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: 4 Large Tactile Choice Cards */}
        <div
          className={`flex flex-col justify-between rounded-2xl border border-slate-300 bg-white md:col-span-7 ${
            limMode ? 'p-5 min-h-0' : 'p-6'
          }`}
        >
          <div className={limMode ? 'flex flex-1 flex-col min-h-0' : ''}>
            <div className="flex shrink-0 items-center justify-between gap-2">
              <span className={`font-semibold text-slate-900 ${limMode ? 'text-base' : 'text-sm'}`}>
                Tocca il pacco con la forma giusta
              </span>
              <span className="text-xs font-medium text-slate-600">
                Ogni forma svela un oggetto di Natale
              </span>
            </div>

            <div
              className={`grid grid-cols-1 sm:grid-cols-2 ${
                limMode ? 'mt-3 flex-1 min-h-0 sm:grid-rows-2 gap-3' : 'mt-4 gap-4'
              }`}
            >
              {currentQuestion?.options.map(({ shape, rotation }, idx) => {
                const isSelected = selectedId === shape.id;
                const isTarget = currentQuestion.target.id === shape.id;
                const showResult = feedback !== null;
                const revealIdentity = level === 'base' || showResult;

                let cardStyle =
                  'border-slate-300 bg-slate-50 text-slate-900 hover:border-[#0F5132] hover:bg-emerald-50';
                if (showResult && isTarget) {
                  cardStyle = 'border-emerald-600 bg-emerald-50 text-slate-900 ring-3 ring-emerald-500/35';
                } else if (showResult && isSelected && !isTarget) {
                  cardStyle = 'border-red-600 bg-red-50 text-slate-900';
                }

                return (
                  <button
                    key={shape.id}
                    type="button"
                    disabled={feedback !== null}
                    onClick={() => handleSelectOption(shape)}
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 transition-transform duration-150 active:scale-[0.98] cursor-pointer disabled:cursor-default ${
                      limMode ? 'min-h-[120px]' : 'min-h-[164px] p-4'
                    } ${cardStyle}`}
                  >
                    <ShapeSvg
                      shapeId={shape.id}
                      size={limMode ? 96 : 94}
                      rotationDeg={rotation}
                      showVertices={showHint}
                      ornamentMode
                    />
                    <div className="text-center">
                      {revealIdentity ? (
                        <>
                          <span className={`block font-bold text-slate-900 ${limMode ? 'text-lg sm:text-xl' : 'text-base'}`}>
                            {shape.name}
                          </span>
                          <span className={`mt-0.5 block font-semibold text-[#0F5132] ${limMode ? 'text-xs sm:text-sm' : 'text-xs'}`}>
                            {shape.christmasObject}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className={`block font-bold text-slate-900 ${limMode ? 'text-lg' : 'text-sm'}`}>
                            Scegli forma {idx + 1}
                          </span>
                          <span className="mt-0.5 block text-xs font-medium text-slate-700">
                            {shape.category === 'solido' ? 'Solido 3D' : 'Figura piana'}
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback & Next Bar */}
          <div className={`shrink-0 ${limMode ? 'mt-3 min-h-[64px]' : 'mt-6 min-h-[76px]'}`}>
            {feedback ? (
              <div
                className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border-2 p-3.5 ${
                  feedback.isCorrect
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                    : 'border-red-300 bg-red-50 text-red-950'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {feedback.isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" aria-hidden="true" />
                  ) : (
                    <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-700" aria-hidden="true" />
                  )}
                  <p className={`font-medium leading-snug ${limMode ? 'text-sm sm:text-base' : 'text-sm'}`}>
                    {feedback.message}
                  </p>
                </div>

                {lives > 0 && (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className={`rounded-xl bg-slate-900 font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer ${
                      limMode ? 'min-h-[44px] px-6 py-2 text-sm sm:text-base' : 'min-h-[44px] px-5 py-2 text-sm'
                    }`}
                  >
                    {currentIndex + 1 >= ROUND_LENGTH ? 'Vedi Risultato' : 'Prossimo Regalo'}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-700">
                <span>Suggerimento: tocca con il dito o la penna LIM la forma che corrisponde.</span>
                <span className="font-mono tabular-nums">+20 pt</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
