import React, { useEffect, useState } from 'react';
import { Award, BarChart3, BookOpen, Gift, HelpCircle, Maximize2, Minimize2, Monitor, Music, Snowflake, Trees, Volume2, VolumeX, Wand2 } from 'lucide-react';
import { CanvasGuidePage } from './components/CanvasGuidePage';
import { CreditsPage } from './components/CreditsPage';
import { ProgressDashboard } from './components/ProgressDashboard';
import { RiddlesQuiz } from './components/RiddlesQuiz';
import { ShapesAtlas } from './components/ShapesAtlas';
import { SleighChallengeGame } from './components/SleighChallengeGame';
import { SnowfallOverlay } from './components/SnowfallOverlay';
import { TreeBuilderGame } from './components/TreeBuilderGame';
import { WelcomeOverlay } from './components/WelcomeOverlay';
import { RIDDLES_BANK, TANGRAM_PUZZLES } from './data/christmasShapes';
import { setChristmasMusicDucked, setChristmasMusicEnabled } from './lib/christmasMusic';
import { playClickPop } from './lib/soundFx';
import { stopSpeaking, useSpeakingState } from './lib/ttsVoice';
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
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Stelle', icon: BarChart3 },
  { id: 'istruzioni', label: 'Istruzioni', shortLabel: 'Istruzioni', icon: Wand2 },
  { id: 'credits', label: 'Credits', shortLabel: 'Credits', icon: Award }
];

const STORAGE_KEY = 'bottega-natale-geometria-stats-v1';
const WELCOME_STORAGE_KEY = 'bottega-natale-welcome-seen-v1';
const SNOW_STORAGE_KEY = 'bottega-natale-snow-enabled-v1';
const MUSIC_STORAGE_KEY = 'bottega-natale-music-enabled-v1';

function hasSeenWelcome(): boolean {
  try {
    return localStorage.getItem(WELCOME_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function loadSnowEnabled(): boolean {
  try {
    const saved = localStorage.getItem(SNOW_STORAGE_KEY);
    return saved === null ? true : saved === '1';
  } catch {
    return true;
  }
}

function loadMusicEnabled(): boolean {
  try {
    const saved = localStorage.getItem(MUSIC_STORAGE_KEY);
    return saved === null ? true : saved === '1';
  } catch {
    return true;
  }
}

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
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [snowEnabled, setSnowEnabled] = useState<boolean>(loadSnowEnabled);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(loadMusicEnabled);
  const [limMode, setLimMode] = useState(false);
  const [nativeFullscreen, setNativeFullscreen] = useState(false);
  const [fallbackFullscreen, setFallbackFullscreen] = useState(false);
  const [showWelcome, setShowWelcome] = useState<boolean>(() => !hasSeenWelcome());
  const [resetSignal, setResetSignal] = useState(0);
  const [transitionDir, setTransitionDir] = useState<'forward' | 'backward' | 'pop'>('pop');
  const [stats, setStats] = useState<WorkshopStats>(loadInitialStats);
  const isElfSpeaking = useSpeakingState();

  const triggerToolbarPop = (button: HTMLButtonElement | null) => {
    if (!button) return;
    button.classList.remove('is-popping');
    void button.offsetWidth;
    button.classList.add('is-popping');
  };

  const handlePopAnimationEnd = (event: React.AnimationEvent<HTMLButtonElement>) => {
    event.currentTarget.classList.remove('is-popping');
  };

  const handleToggleSnow = () => {
    playClickPop(soundEnabled);
    setSnowEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SNOW_STORAGE_KEY, next ? '1' : '0');
      } catch {
        // Ignore storage write errors
      }
      return next;
    });
  };

  const handleToggleMusic = () => {
    playClickPop(soundEnabled);
    setMusicEnabled((prev) => {
      const next = !prev;
      setChristmasMusicEnabled(next);
      try {
        localStorage.setItem(MUSIC_STORAGE_KEY, next ? '1' : '0');
      } catch {
        // Ignore storage write errors
      }
      return next;
    });
  };

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    try {
      localStorage.setItem(WELCOME_STORAGE_KEY, '1');
    } catch {
      // Ignore storage write errors
    }
  };

  const isFullscreen = nativeFullscreen || fallbackFullscreen;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // Ignore storage write errors
    }
  }, [stats]);

  useEffect(() => {
    setChristmasMusicEnabled(musicEnabled);
  }, [musicEnabled]);

  useEffect(() => {
    return () => {
      setChristmasMusicEnabled(false);
    };
  }, []);

  useEffect(() => {
    setChristmasMusicDucked(isElfSpeaking);
  }, [isElfSpeaking]);

  useEffect(() => {
    const getFullscreenElement = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element | null };
      return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
    };
    const handleFsChange = () => {
      const active = Boolean(getFullscreenElement());
      setNativeFullscreen(active);
      if (!active) {
        setFallbackFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  useEffect(() => {
    if (!fallbackFullscreen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFallbackFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fallbackFullscreen]);

  // Robust touch & pointer gesture guard in LIM mode to prevent mobile OS conflicts
  // (pinch-zoom, pull-to-refresh, edge swipe/overscroll, long-press context menu)
  useEffect(() => {
    const rootEl = document.documentElement;
    if (limMode) {
      rootEl.setAttribute('data-lim-mode', 'true');
    } else {
      rootEl.removeAttribute('data-lim-mode');
      return;
    }

    const preventMultiTouchZoom = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    const preventGestureZoom = (event: Event) => {
      event.preventDefault();
    };

    const preventInteractiveContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (
        target.closest(
          'button, [role="button"], svg, [data-game-area="true"], [data-touch-zone="interactive"]'
        )
      ) {
        event.preventDefault();
      }
    };

    document.addEventListener('touchstart', preventMultiTouchZoom, { passive: false });
    document.addEventListener('touchmove', preventMultiTouchZoom, { passive: false });
    document.addEventListener('gesturestart', preventGestureZoom, { passive: false });
    document.addEventListener('gesturechange', preventGestureZoom, { passive: false });
    document.addEventListener('contextmenu', preventInteractiveContextMenu);

    return () => {
      rootEl.removeAttribute('data-lim-mode');
      document.removeEventListener('touchstart', preventMultiTouchZoom);
      document.removeEventListener('touchmove', preventMultiTouchZoom);
      document.removeEventListener('gesturestart', preventGestureZoom);
      document.removeEventListener('gesturechange', preventGestureZoom);
      document.removeEventListener('contextmenu', preventInteractiveContextMenu);
    };
  }, [limMode]);

  const toggleFullscreen = async () => {
    playClickPop(soundEnabled);
    const doc = document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => Promise<void> | void;
      webkitFullscreenEnabled?: boolean;
    };
    const root = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    };
    const currentFsEl = document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;

    if (currentFsEl) {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }
      } catch {
        setNativeFullscreen(false);
      }
      setFallbackFullscreen(false);
      return;
    }

    if (fallbackFullscreen) {
      setFallbackFullscreen(false);
      return;
    }

    const canNativeFs = Boolean(
      (document.fullscreenEnabled ?? doc.webkitFullscreenEnabled ?? true) &&
        (root.requestFullscreen || root.webkitRequestFullscreen)
    );

    if (canNativeFs) {
      try {
        if (root.requestFullscreen) {
          await root.requestFullscreen();
        } else if (root.webkitRequestFullscreen) {
          await root.webkitRequestFullscreen();
        }
        return;
      } catch {
        // Blocked by iframe Permissions-Policy or browser restriction: use in-app fullscreen
      }
    }

    setFallbackFullscreen(true);
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
    setTransitionDir('pop');
    setSection('slitta');
    setResetSignal((n) => n + 1);
  };

  const handleSelectSection = (next: GameSection) => {
    playClickPop(soundEnabled);
    stopSpeaking();
    if (next !== section) {
      const prevIdx = NAV_ITEMS.findIndex((item) => item.id === section);
      const nextIdx = NAV_ITEMS.findIndex((item) => item.id === next);
      setTransitionDir(nextIdx >= prevIdx ? 'forward' : 'backward');
    }
    setSection(next);
  };

  const sectionTransitionClass =
    transitionDir === 'forward'
      ? 'section-transition-forward'
      : transitionDir === 'backward'
        ? 'section-transition-backward'
        : 'section-transition-pop';

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      if (prev) {
        stopSpeaking();
        return false;
      }
      playClickPop(true);
      return true;
    });
  };

  return (
    <div
      data-lim-mode={limMode ? 'true' : 'false'}
      className={`flex flex-col bg-slate-50 text-slate-900 ${
        fallbackFullscreen ? 'fixed inset-0 z-50 ' : ''
      }${
        limMode
          ? 'min-h-screen md:h-screen md:overflow-hidden md:touch-none overscroll-none select-none pb-16 md:pb-0'
          : `${fallbackFullscreen ? 'h-screen overflow-y-auto' : 'min-h-screen'} pb-16 md:pb-0`
      }`}
    >
      {/* Three-Zone Top Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs touch-none">
        <div className="mx-auto flex h-11 md:h-auto max-w-[1360px] items-center justify-between gap-3 lg:gap-6 px-3 md:py-1.5 sm:px-5">
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <img
              src="/assets/aistudio/LOGO_EFT_Calabria_trasparente_29afe73d.png"
              alt="Logo Équipe Formativa Calabria"
              draggable={false}
              className="h-7 w-auto sm:h-8 object-contain shrink-0 select-none"
            />
            <span className="hidden sm:block h-5 w-px bg-slate-200" aria-hidden="true" />
            <button
              type="button"
              onClick={(e) => {
                triggerToolbarPop(e.currentTarget);
                handleSelectSection('slitta');
              }}
              onAnimationEnd={handlePopAnimationEnd}
              className="toolbar-pop-btn text-left text-sm lg:text-base font-semibold tracking-tight text-[#0F5132] touch-none select-none whitespace-nowrap shrink-0 cursor-pointer"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Villaggio delle Forme
            </button>
          </div>

          {/* Desktop & Tablet Horizontal Nav */}
          <nav
            aria-label="Navigazione giochi di geometria"
            className="hidden md:flex items-center gap-2 lg:gap-4 text-xs lg:text-[13px] font-medium text-slate-600 touch-none"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => {
                    triggerToolbarPop(e.currentTarget);
                    handleSelectSection(item.id);
                  }}
                  onAnimationEnd={handlePopAnimationEnd}
                  className={`toolbar-pop-btn relative min-h-[30px] px-1 py-0.5 touch-none select-none whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="lg:hidden">{item.shortLabel}</span>
                  <span className="hidden lg:inline">{item.label}</span>
                  {isActive && (
                    <span className="nav-indicator-active absolute inset-x-0 -bottom-[7px] h-[2px] bg-red-600" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={(e) => {
                triggerToolbarPop(e.currentTarget);
                handleNewGame();
              }}
              onAnimationEnd={handlePopAnimationEnd}
              className="toolbar-pop-btn min-h-[30px] rounded-md bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-700 touch-none select-none whitespace-nowrap shrink-0 cursor-pointer"
            >
              Nuova Partita
            </button>
          </div>
        </div>
      </header>

      {/* Classroom LIM & Tablet Display Toolbar (below header) */}
      <div className="shrink-0 border-b border-slate-200 bg-white touch-none">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2 px-3 py-1 sm:px-5">
          <span className="text-[11px] font-medium text-slate-600 select-none">
            Aula · {limMode ? 'LIM orizzontale' : 'Tablet e PC'}
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                triggerToolbarPop(e.currentTarget);
                playClickPop(soundEnabled);
                setShowWelcome(true);
              }}
              onAnimationEnd={handlePopAnimationEnd}
              aria-expanded={showWelcome}
              className="toolbar-pop-btn inline-flex min-h-[28px] items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 touch-none select-none whitespace-nowrap shrink-0 cursor-pointer"
            >
              <HelpCircle className="h-3 w-3 text-amber-600" aria-hidden="true" />
              <span>Guida</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                triggerToolbarPop(e.currentTarget);
                playClickPop(soundEnabled);
                setLimMode((prev) => !prev);
              }}
              onAnimationEnd={handlePopAnimationEnd}
              aria-pressed={limMode}
              className={`toolbar-pop-btn inline-flex min-h-[28px] items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold touch-none select-none whitespace-nowrap shrink-0 cursor-pointer ${
                limMode
                  ? 'border-[#0F5132] bg-[#0F5132] text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Monitor className="h-3 w-3" aria-hidden="true" />
              <span>{limMode ? 'LIM: Attiva' : 'Modalità LIM'}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                triggerToolbarPop(e.currentTarget);
                void toggleFullscreen();
              }}
              onAnimationEnd={handlePopAnimationEnd}
              aria-pressed={isFullscreen}
              className={`toolbar-pop-btn inline-flex min-h-[28px] items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold touch-none select-none whitespace-nowrap shrink-0 cursor-pointer ${
                isFullscreen
                  ? 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isFullscreen ? (
                <Minimize2 className="h-3 w-3" aria-hidden="true" />
              ) : (
                <Maximize2 className="h-3 w-3" aria-hidden="true" />
              )}
              <span>{isFullscreen ? 'Esci Intero' : 'Schermo Intero'}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                triggerToolbarPop(e.currentTarget);
                handleToggleSnow();
              }}
              onAnimationEnd={handlePopAnimationEnd}
              aria-pressed={snowEnabled}
              className={`toolbar-pop-btn inline-flex min-h-[28px] items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold touch-none select-none whitespace-nowrap shrink-0 cursor-pointer ${
                snowEnabled
                  ? 'border-sky-300 bg-sky-50 text-sky-900 hover:bg-sky-100'
                  : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Snowflake
                className={`h-3 w-3 ${snowEnabled ? 'text-sky-600' : 'text-slate-400'}`}
                aria-hidden="true"
              />
              <span>{snowEnabled ? 'Neve: Sì' : 'Neve: No'}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                triggerToolbarPop(e.currentTarget);
                handleToggleMusic();
              }}
              onAnimationEnd={handlePopAnimationEnd}
              aria-pressed={musicEnabled}
              className={`toolbar-pop-btn inline-flex min-h-[28px] items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold touch-none select-none whitespace-nowrap shrink-0 cursor-pointer ${
                musicEnabled
                  ? 'border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100'
                  : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Music
                className={`h-3 w-3 ${musicEnabled ? 'text-red-600' : 'text-slate-400'}`}
                aria-hidden="true"
              />
              <span>{musicEnabled ? 'Musica: Sì' : 'Musica: No'}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                triggerToolbarPop(e.currentTarget);
                handleToggleSound();
              }}
              onAnimationEnd={handlePopAnimationEnd}
              className="toolbar-pop-btn inline-flex min-h-[28px] items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 touch-none select-none whitespace-nowrap shrink-0 cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="h-3 w-3 text-[#0F5132]" aria-hidden="true" />
              ) : (
                <VolumeX className="h-3 w-3 text-slate-400" aria-hidden="true" />
              )}
              <span>{soundEnabled ? 'Audio: Attivo' : 'Audio: Muto'}</span>
            </button>
          </div>
        </div>
      </div>

      <main
        data-game-area="true"
        className={
          limMode
            ? 'flex-1 min-h-0 overflow-x-hidden md:overflow-hidden md:touch-none overscroll-none select-none'
            : 'flex-1 overflow-x-hidden'
        }
      >
        <div
          key={section === 'slitta' ? `slitta-${resetSignal}` : section}
          className={`${sectionTransitionClass} ${limMode ? 'h-full min-h-0' : ''}`}
        >
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
              onNavigate={handleSelectSection}
              onResetStats={handleResetStats}
              limMode={limMode}
            />
          )}

          {section === 'istruzioni' && (
            <CanvasGuidePage
              soundEnabled={soundEnabled}
              limMode={limMode}
            />
          )}

          {section === 'credits' && (
            <CreditsPage
              soundEnabled={soundEnabled}
              limMode={limMode}
            />
          )}
        </div>
      </main>

      {!limMode && !isFullscreen && (
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-[1360px] flex-col gap-2 px-3 py-2.5 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-2">
              <img
                src="/assets/aistudio/LOGO_EFT_Calabria_trasparente_29afe73d.png"
                alt="Équipe Formativa Calabria"
                className="h-6 w-auto object-contain shrink-0"
              />
              <span className="font-medium">
                Missione Natale: Il Villaggio delle Forme · EFT Calabria
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono tabular-nums text-slate-500">
                Stelle: {stats.totalStars} · Costruzioni: {stats.completedPuzzles.length}/{TANGRAM_PUZZLES.length} · Indovinelli: {stats.solvedRiddles.length}/{RIDDLES_BANK.length}
              </span>
              <div className="flex items-center gap-2 font-semibold">
                <button
                  type="button"
                  onClick={() => handleSelectSection('istruzioni')}
                  className="text-[#0F5132] hover:underline cursor-pointer"
                >
                  Istruzioni
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => handleSelectSection('credits')}
                  className="text-[#0F5132] hover:underline cursor-pointer"
                >
                  Elfi Equipers
                </button>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Mobile & Small Tablet Bottom Thumb-Zone Tab Bar */}
      <nav
        aria-label="Menu rapido tablet e smartphone"
        className="fixed bottom-0 left-0 right-0 z-40 grid h-14 grid-cols-7 border-t border-slate-200 bg-white/95 backdrop-blur-md touch-none md:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = section === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={(e) => {
                triggerToolbarPop(e.currentTarget);
                handleSelectSection(item.id);
              }}
              onAnimationEnd={handlePopAnimationEnd}
              className={`toolbar-pop-btn flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold touch-none select-none cursor-pointer ${
                isActive ? 'text-red-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="truncate max-w-full px-0.5">{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>

      <SnowfallOverlay enabled={snowEnabled} />

      <WelcomeOverlay
        open={showWelcome}
        limMode={limMode}
        soundEnabled={soundEnabled}
        onToggleLimMode={() => setLimMode((prev) => !prev)}
        onClose={handleCloseWelcome}
      />
    </div>
  );
}
