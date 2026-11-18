import React, { useEffect, useState } from 'react';
import { BarChart3, BookOpen, Gift, HelpCircle, Maximize2, Minimize2, Monitor, Trees, Volume2, VolumeX } from 'lucide-react';
import { ProgressDashboard } from './components/ProgressDashboard';
import { RiddlesQuiz } from './components/RiddlesQuiz';
import { ShapesAtlas } from './components/ShapesAtlas';
import { SleighChallengeGame } from './components/SleighChallengeGame';
import { TreeBuilderGame } from './components/TreeBuilderGame';
import { RIDDLES_BANK, TANGRAM_PUZZLES } from './data/christmasShapes';
import { playClickPop } from './lib/soundFx';
import { stopSpeaking } from './lib/ttsVoice';
import { GameSection, SchoolLevel, ShapeId, WorkshopStats } from './types/christmasGeometry';

const NAV_ITEMS: Array<{
  id: GameSection;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
}> = [
  { id: 'slitta', label: 'Sfida Slitta', shortLabel: 'Slitta', icon: Gift },
  { id: 'albero', label: 'Tangram', shortLabel: 'Tangram', icon: Trees },
  { id: 'indovinelli', label: 'Indovinelli', shortLabel: 'Quiz', icon: HelpCircle },
  { id: 'atlante', label: 'Atlante', shortLabel: 'Atlante', icon: BookOpen },
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Progressi', icon: BarChart3 }
];

const STORAGE_KEY = 'bottega-natale-geometria-stats-v1';

const DEFAULT_STATS: WorkshopStats = {
  totalStars: 0,
  sleighStars: 0,
  sleighRoundsCompleted: 0,
  bestSleighScore: 0,
  completedPuzzles: [],
  solvedRiddles: [],
  exploredShapes: []
};

function loadInitialStats(): WorkshopStats {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<WorkshopStats>;
      const completedPuzzles = Array.isArray(parsed.completedPuzzles) ? parsed.completedPuzzles : [];
      const solvedRiddles = Array.isArray(parsed.solvedRiddles) ? parsed.solvedRiddles : [];
      const exploredShapes = Array.isArray(parsed.exploredShapes) ? parsed.exploredShapes : [];
      const totalStars = typeof parsed.totalStars === 'number' ? parsed.totalStars : 0;
      const inferredSleighStars = Math.max(
        0,
        totalStars - completedPuzzles.length * 2 - solvedRiddles.length
      );
      return {
        ...DEFAULT_STATS,
        ...parsed,
        completedPuzzles,
        solvedRiddles,
        exploredShapes,
        sleighStars: typeof parsed.sleighStars === 'number' ? parsed.sleighStars : inferredSleighStars,
        sleighRoundsCompleted:
          typeof parsed.sleighRoundsCompleted === 'number' ? parsed.sleighRoundsCompleted : 0
      };
    }
  } catch {
    // Ignore storage read errors
  }
  return DEFAULT_STATS;
}

export default function App() {
  const [section, setSection] = useState<GameSection>('slitta');
  const [level, setLevel] = useState<SchoolLevel>('base');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [limMode, setLimMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [stats, setStats] = useState<WorkshopStats>(loadInitialStats);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // Ignore storage write errors
    }
  }, [stats]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = async () => {
    playClickPop(soundEnabled);
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fallback: if fullscreen is blocked in sandboxed iframe, enable LIM projection mode
      setLimMode((prev) => !prev);
    }
  };

  const handleRecordScore = (score: number, starsEarned: number) => {
    setStats((prev) => ({
      ...prev,
      totalStars: prev.totalStars + starsEarned,
      sleighStars: prev.sleighStars + starsEarned,
      sleighRoundsCompleted: prev.sleighRoundsCompleted + 1,
      bestSleighScore: Math.max(prev.bestSleighScore, score)
    }));
  };

  const handleCompletePuzzle = (puzzleId: string) => {
    setStats((prev) => {
      if (prev.completedPuzzles.includes(puzzleId)) return prev;
      return {
        ...prev,
        totalStars: prev.totalStars + 2,
        completedPuzzles: [...prev.completedPuzzles, puzzleId]
      };
    });
  };

  const handleSolveRiddle = (riddleId: string) => {
    setStats((prev) => {
      if (prev.solvedRiddles.includes(riddleId)) return prev;
      return {
        ...prev,
        totalStars: prev.totalStars + 1,
        solvedRiddles: [...prev.solvedRiddles, riddleId]
      };
    });
  };

  const handleExploreShape = (shapeId: ShapeId) => {
    setStats((prev) => {
      if (prev.exploredShapes.includes(shapeId)) return prev;
      return {
        ...prev,
        exploredShapes: [...prev.exploredShapes, shapeId]
      };
    });
  };

  const handleResetStats = () => {
    setStats(DEFAULT_STATS);
  };

  const handleNewGame = () => {
    playClickPop(soundEnabled);
    stopSpeaking();
    setSection('slitta');
    setResetSignal((n) => n + 1);
  };

  const handleSelectSection = (next: GameSection) => {
    playClickPop(soundEnabled);
    stopSpeaking();
    setSection(next);
  };

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      if (prev) stopSpeaking();
      return !prev;
    });
  };

  return (
    <div
      className={`flex flex-col bg-slate-50 text-slate-900 ${
        limMode ? 'min-h-screen md:h-screen md:overflow-hidden pb-16 md:pb-0' : 'min-h-screen pb-16 md:pb-0'
      }`}
    >
      {/* Three-Zone Top Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex h-14 md:h-auto max-w-[1440px] items-center justify-between gap-3 lg:gap-8 px-4 md:py-2.5 sm:px-6">
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <img
              src="/assets/aistudio/LOGO_EFT_Calabria_trasparente_29afe73d.png"
              alt="Logo Équipe Formativa Calabria"
              className="h-8 w-auto sm:h-10 object-contain shrink-0"
            />
            <span className="hidden sm:block h-7 w-px bg-slate-200" aria-hidden="true" />
            <button
              type="button"
              onClick={() => handleSelectSection('slitta')}
              className="text-left text-base lg:text-lg font-semibold tracking-tight text-[#0F5132] whitespace-nowrap shrink-0 cursor-pointer"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Villaggio delle Forme
            </button>
          </div>

          {/* Desktop & Tablet Horizontal Nav */}
          <nav
            aria-label="Navigazione giochi di geometria"
            className="hidden md:flex items-center gap-3 lg:gap-6 text-sm font-medium text-slate-600"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSection(item.id)}
                  className={`relative min-h-[40px] px-1 py-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-[13px] h-[3px] bg-red-600" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleNewGame}
              className="min-h-[40px] rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Nuova Partita
            </button>
          </div>
        </div>
      </header>

      {/* Classroom LIM & Tablet Display Toolbar (below header) */}
      <div className="shrink-0 border-b border-slate-200 bg-white">
        <div
          className={`mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2 px-4 sm:px-6 ${
            limMode ? 'py-1.5' : 'py-2'
          }`}
        >
          <span className="text-xs font-medium text-slate-600">
            Visualizzazione Aula · {limMode ? 'Modalità LIM orizzontale senza scorrimento' : 'Formato standard tablet e PC'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playClickPop(soundEnabled);
                setLimMode((prev) => !prev);
              }}
              aria-pressed={limMode}
              className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                limMode
                  ? 'border-[#0F5132] bg-[#0F5132] text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{limMode ? 'Modalità LIM: Attiva' : 'Modalità LIM'}</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isFullscreen ? (
                <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{isFullscreen ? 'Esci da Schermo Intero' : 'Schermo Intero'}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleSound}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-[#0F5132]" aria-hidden="true" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              )}
              <span>{soundEnabled ? 'Audio e Voce: Attivi' : 'Audio: Muto'}</span>
            </button>
          </div>
        </div>
      </div>

      <main className={limMode ? 'flex-1 min-h-0 md:overflow-hidden' : 'flex-1'}>
        {section === 'slitta' && (
          <SleighChallengeGame
            level={level}
            onChangeLevel={setLevel}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            bestScore={stats.bestSleighScore}
            onRecordScore={handleRecordScore}
            resetSignal={resetSignal}
            limMode={limMode}
          />
        )}

        {section === 'albero' && (
          <TreeBuilderGame
            soundEnabled={soundEnabled}
            completedPuzzles={stats.completedPuzzles}
            onCompletePuzzle={handleCompletePuzzle}
            limMode={limMode}
          />
        )}

        {section === 'indovinelli' && (
          <RiddlesQuiz
            level={level}
            onChangeLevel={setLevel}
            soundEnabled={soundEnabled}
            solvedRiddles={stats.solvedRiddles}
            onSolveRiddle={handleSolveRiddle}
            limMode={limMode}
          />
        )}

        {section === 'atlante' && (
          <ShapesAtlas
            soundEnabled={soundEnabled}
            onExploreShape={handleExploreShape}
            limMode={limMode}
          />
        )}

        {section === 'dashboard' && (
          <ProgressDashboard
            stats={stats}
            soundEnabled={soundEnabled}
            onNavigate={setSection}
            onResetStats={handleResetStats}
            limMode={limMode}
          />
        )}
      </main>

      {!limMode && (
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/LOGO_EFT_Calabria_trasparente_29afe73d.png"
                alt="Équipe Formativa Calabria"
                className="h-8 w-auto object-contain shrink-0"
              />
              <span className="font-medium">
                Missione Natale: Il Villaggio delle Forme · Scuola Primaria
              </span>
            </div>
            <span className="font-mono tabular-nums text-slate-500">
              Stelle raccolte: {stats.totalStars} · Costruzioni: {stats.completedPuzzles.length}/{TANGRAM_PUZZLES.length} · Indovinelli: {stats.solvedRiddles.length}/{RIDDLES_BANK.length}
            </span>
          </div>
        </footer>
      )}

      {/* Mobile & Small Tablet Bottom Thumb-Zone Tab Bar */}
      <nav
        aria-label="Menu rapido tablet e smartphone"
        className="fixed bottom-0 left-0 right-0 z-40 grid h-14 grid-cols-5 border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = section === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectSection(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                isActive ? 'text-red-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="truncate max-w-[68px]">{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
