import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Move,
  RotateCw,
  Square,
  Volume2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { CHRISTMAS_SHAPES } from '../data/christmasShapes';
import { ELF_BY_ID } from '../data/elfCharacters';
import { AUDIO_DELAYS, playClickPop } from '../lib/soundFx';
import { speakForKids, stopSpeaking, toggleSpeakForKids, useSpeakingElf, useSpeakingState } from '../lib/ttsVoice';
import { SchoolLevel, ShapeId } from '../types/christmasGeometry';
import { ResilientImage } from './ResilientImage';
import { ShapeSvg } from './ShapeSvg';

interface ShapesAtlasProps {
  soundEnabled: boolean;
  onExploreShape?: (shapeId: ShapeId) => void;
  limMode?: boolean;
}

type AtlasFilter = 'tutte' | SchoolLevel;
type StageViewMode = 'affianca' | 'sovrapponi' | 'sfondo';

export const ShapesAtlas: React.FC<ShapesAtlasProps> = ({
  soundEnabled,
  onExploreShape,
  limMode = false
}) => {
  const [filter, setFilter] = useState<AtlasFilter>('tutte');
  const [selectedId, setSelectedId] = useState<ShapeId>('triangolo');
  const [stageMode, setStageMode] = useState<StageViewMode>('affianca');
  const [rotationDeg, setRotationDeg] = useState(0);
  const [overlayPos, setOverlayPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [overlayScale, setOverlayScale] = useState(1);
  const [overlayTransparent, setOverlayTransparent] = useState(false);
  const [isManipulating, setIsManipulating] = useState(false);
  const [showVertices, setShowVertices] = useState(true);
  const [showRightAngles, setShowRightAngles] = useState(true);
  const [showSymmetry, setShowSymmetry] = useState(false);
  const [ornamentMode, setOrnamentMode] = useState(true);
  const [visitedIds, setVisitedIds] = useState<ShapeId[]>(['triangolo']);

  const stageAreaRef = useRef<HTMLDivElement | null>(null);
  const shapeCenterRef = useRef<HTMLDivElement | null>(null);
  const interactionRef = useRef<
    | {
        mode: 'drag';
        startClientX: number;
        startClientY: number;
        startX: number;
        startY: number;
      }
    | {
        mode: 'rotate';
        cx: number;
        cy: number;
      }
    | null
  >(null);

  const containerMax = limMode ? 'max-w-[1600px]' : 'max-w-[1160px]';
  const isSpeaking = useSpeakingState();
  const speakingElf = useSpeakingElf();
  const isAlfredoSpeaking = speakingElf === 'alfredo';

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const visibleShapes = useMemo(() => {
    if (filter === 'tutte') return CHRISTMAS_SHAPES;
    return CHRISTMAS_SHAPES.filter((s) => s.level === filter);
  }, [filter]);

  const activeShape = useMemo(
    () => visibleShapes.find((s) => s.id === selectedId) ?? visibleShapes[0] ?? CHRISTMAS_SHAPES[0],
    [visibleShapes, selectedId]
  );

  const activeIndex = useMemo(
    () => Math.max(0, visibleShapes.findIndex((s) => s.id === activeShape.id)),
    [visibleShapes, activeShape.id]
  );

  const resetOverlayTransform = () => {
    setOverlayPos({ x: 0, y: 0 });
    setRotationDeg(0);
    setOverlayScale(1);
  };

  const selectShape = (shapeId: ShapeId, announce = true) => {
    const target = CHRISTMAS_SHAPES.find((s) => s.id === shapeId);
    if (!target) return;
    setSelectedId(shapeId);
    resetOverlayTransform();
    setVisitedIds((prev) => (prev.includes(shapeId) ? prev : [...prev, shapeId]));
    onExploreShape?.(shapeId);
    if (announce) {
      speakForKids(`${target.name}: ${target.christmasObject}.`, soundEnabled, {
        delayMs: AUDIO_DELAYS.afterClick,
        elfId: 'alfredo'
      });
    }
  };

  const handleStagePointerDownMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (stageMode !== 'sovrapponi') return;
    e.stopPropagation();
    stageAreaRef.current?.setPointerCapture(e.pointerId);
    setIsManipulating(true);
    interactionRef.current = {
      mode: 'drag',
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: overlayPos.x,
      startY: overlayPos.y
    };
  };

  const handleRotateHandlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (stageMode !== 'sovrapponi') return;
    e.stopPropagation();
    stageAreaRef.current?.setPointerCapture(e.pointerId);
    const centerEl = shapeCenterRef.current;
    if (!centerEl) return;
    const rect = centerEl.getBoundingClientRect();
    setIsManipulating(true);
    interactionRef.current = {
      mode: 'rotate',
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2
    };
  };

  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const active = interactionRef.current;
    if (!active) return;

    if (active.mode === 'drag') {
      const stageRect = stageAreaRef.current?.getBoundingClientRect();
      const maxX = stageRect ? Math.max(60, stageRect.width / 2 - 44) : 180;
      const maxY = stageRect ? Math.max(40, stageRect.height / 2 - 44) : 110;
      const nextX = Math.max(-maxX, Math.min(maxX, active.startX + (e.clientX - active.startClientX)));
      const nextY = Math.max(-maxY, Math.min(maxY, active.startY + (e.clientY - active.startClientY)));
      setOverlayPos({ x: nextX, y: nextY });
    } else if (active.mode === 'rotate') {
      const dx = e.clientX - active.cx;
      const dy = e.clientY - active.cy;
      const deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      const normalized = ((Math.round(deg) % 360) + 360) % 360;
      setRotationDeg(normalized);
    }
  };

  const handleStagePointerEnd = () => {
    interactionRef.current = null;
    setIsManipulating(false);
  };

  const handleFilterChange = (nextFilter: AtlasFilter) => {
    playClickPop(soundEnabled);
    stopSpeaking();
    setFilter(nextFilter);
    const nextList =
      nextFilter === 'tutte'
        ? CHRISTMAS_SHAPES
        : CHRISTMAS_SHAPES.filter((s) => s.level === nextFilter);
    if (nextList.length > 0 && !nextList.some((s) => s.id === selectedId)) {
      selectShape(nextList[0].id, false);
    }
  };

  const handleStepShape = (delta: number) => {
    if (visibleShapes.length <= 1) return;
    playClickPop(soundEnabled);
    const nextIdx = (activeIndex + delta + visibleShapes.length) % visibleShapes.length;
    selectShape(visibleShapes[nextIdx].id);
  };

  const handleSpeakShape = (shape = activeShape) => {
    toggleSpeakForKids(
      `${shape.name}. Oggetto di Natale: ${shape.christmasObject}. ${shape.atlasMatchCaption} ${shape.description} ${shape.schoolTip}`,
      { elfId: 'alfredo' }
    );
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
            Atlante delle Forme
          </h1>
          {!limMode && (
            <p className="mt-0.5 text-xs text-slate-700">
              Confronta ogni figura geometrica con l’oggetto di Natale nello sfondo illustrato.
            </p>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-200 p-1">
          {[
            { id: 'tutte' as const, label: 'Tutte (14)' },
            { id: 'base' as const, label: '1ª–2ª Base' },
            { id: 'poligoni' as const, label: '3ª–4ª Poligoni' },
            { id: 'esperti' as const, label: '5ª Solidi' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleFilterChange(tab.id)}
              className={`min-h-[30px] rounded-lg px-2.5 py-0.5 text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === tab.id ? 'bg-white text-slate-900 shadow-xs' : 'bg-transparent text-slate-800 hover:bg-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Column Explorer (both standard and zero-scroll LIM horizontal mode) */}
      <div
        className={`grid grid-cols-1 gap-3 md:grid-cols-12 md:items-stretch ${
          limMode ? 'flex-1 min-h-0' : ''
        }`}
      >
        {/* Left Column: Interactive Geometry Stage with Shape-Matched Illustrated Backdrop */}
        <div
          className={`flex flex-col justify-between rounded-xl border border-slate-300 bg-white md:col-span-7 ${
            limMode ? 'p-3 min-h-0' : 'p-3.5 sm:p-4'
          }`}
        >
          <div className={limMode ? 'flex flex-1 flex-col min-h-0' : ''}>
            <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-red-700">
                  {activeShape.category === 'solido' ? 'Solido 3D' : 'Figura 2D'}
                  {' · '}
                  {activeShape.christmasObject}
                </span>
                <h2
                  className="text-lg sm:text-xl font-semibold text-slate-900"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {activeShape.name}
                </h2>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-2 py-1">
                  <div
                    className={`h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-xl border-2 border-emerald-400 bg-white shadow-xs transition-transform ${
                      isAlfredoSpeaking ? 'elf-speaking-active' : ''
                    }`}
                  >
                    <ResilientImage
                      src={ELF_BY_ID.alfredo.portraitSrc}
                      alt={ELF_BY_ID.alfredo.fullName}
                      fallbackTitle={ELF_BY_ID.alfredo.shortName}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                  <div className="hidden sm:block leading-tight">
                    <span className="block text-[10px] font-medium text-emerald-800">Guida</span>
                    <span className="text-[11px] font-bold text-emerald-950 whitespace-nowrap">
                      {ELF_BY_ID.alfredo.fullName}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSpeakShape(activeShape)}
                  className="inline-flex min-h-[30px] items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1 text-[11px] font-bold text-slate-950 hover:bg-amber-300 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isSpeaking ? (
                    <Square className="h-3 w-3 fill-slate-950" aria-hidden="true" />
                  ) : (
                    <Volume2 className="h-3 w-3" aria-hidden="true" />
                  )}
                  <span>{isSpeaking ? 'Ferma' : 'Ascolta'}</span>
                </button>
              </div>
            </div>

            {/* Unified Stage Control Bar: Mode Switcher + Stepper */}
            <div className={`flex flex-wrap items-center justify-between gap-2 shrink-0 ${limMode ? 'mt-1.5' : 'mt-2.5'}`}>
              <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1">
                {[
                  { id: 'affianca' as const, label: 'Affianca Forma' },
                  { id: 'sovrapponi' as const, label: 'Sovrapponi' },
                  { id: 'sfondo' as const, label: 'Solo Scena' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      playClickPop(soundEnabled);
                      setStageMode(mode.id);
                    }}
                    className={`min-h-[30px] rounded-lg px-2.5 py-0.5 text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      stageMode === mode.id
                        ? 'bg-[#0F5132] text-white shadow-xs'
                        : 'text-slate-800 hover:bg-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Prev / Next Quick Stepper for LIM & Tablet */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleStepShape(-1)}
                  aria-label="Figura precedente"
                  className="inline-flex min-h-[30px] min-w-[30px] items-center justify-center rounded-lg border border-slate-300 bg-white px-1.5 text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <span className="min-w-[40px] text-center font-mono text-[11px] font-semibold text-slate-700 tabular-nums">
                  {activeIndex + 1}/{visibleShapes.length}
                </span>
                <button
                  type="button"
                  onClick={() => handleStepShape(1)}
                  aria-label="Figura successiva"
                  className="inline-flex min-h-[30px] min-w-[30px] items-center justify-center rounded-lg border border-slate-300 bg-white px-1.5 text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Large Interactive Stage with Unique Per-Shape Christmas Illustration */}
            <div
              className={`relative mt-2 flex flex-col justify-between overflow-hidden rounded-xl border border-slate-300 bg-slate-900 ${
                limMode ? 'flex-1 min-h-[210px]' : 'min-h-[260px] sm:min-h-[290px]'
              }`}
            >
              <ResilientImage
                key={activeShape.id}
                src={activeShape.atlasBackgroundImage}
                alt={activeShape.atlasBackgroundAlt}
                fallbackTitle={activeShape.christmasObject}
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* Measured bottom readability scrim keeping the center scene crisp */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/15"
                aria-hidden="true"
              />

              {/* Stage Foreground: Translucent Frosted Callout, Windowless 360° Manipulation, or Unobstructed Scene */}
              <div
                ref={stageAreaRef}
                onPointerMove={handleStagePointerMove}
                onPointerUp={handleStagePointerEnd}
                onPointerCancel={handleStagePointerEnd}
                className={`relative z-10 flex flex-1 p-3 ${
                  stageMode === 'sovrapponi'
                    ? 'items-center justify-center touch-none select-none overflow-hidden'
                    : 'items-end sm:items-center justify-start'
                }`}
              >
                {stageMode === 'affianca' && (
                  <div className="flex flex-col items-center rounded-xl border border-white/75 bg-white/62 px-3 py-2 shadow-xl backdrop-blur-md transition-opacity duration-200">
                    <ShapeSvg
                      shapeId={activeShape.id}
                      size={limMode ? 148 : 128}
                      rotationDeg={rotationDeg}
                      showVertices={showVertices}
                      showRightAngles={showRightAngles}
                      showSymmetry={showSymmetry}
                      ornamentMode={ornamentMode}
                    />
                    <span className="mt-1 text-[11px] font-bold text-slate-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                      {activeShape.name} · {activeShape.christmasObject}
                    </span>
                  </div>
                )}

                {stageMode === 'sovrapponi' && (() => {
                  const baseSize = limMode ? 184 : 156;
                  const handleRadius = Math.round(baseSize * overlayScale * 0.38 + 20);
                  return (
                    <>
                      {/* Top floating mini-toolbar for quick 360° scale, transparency, and reset */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-950/75 px-2 py-1 text-[11px] font-semibold text-amber-200 backdrop-blur-xs">
                          <Move className="h-3 w-3" aria-hidden="true" />
                          <span>Trascina e ruota 360° · {rotationDeg}°</span>
                        </span>

                        <div className="flex items-center gap-1 pointer-events-auto">
                          <button
                            type="button"
                            onClick={() => {
                              playClickPop(soundEnabled);
                              setOverlayScale((s) => Math.max(0.55, Number((s - 0.15).toFixed(2))));
                            }}
                            aria-label="Riduci dimensione figura"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/25 bg-slate-950/75 text-white hover:bg-slate-900 touch-none cursor-pointer"
                          >
                            <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playClickPop(soundEnabled);
                              setOverlayScale((s) => Math.min(1.75, Number((s + 0.15).toFixed(2))));
                            }}
                            aria-label="Ingrandisci dimensione figura"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/25 bg-slate-950/75 text-white hover:bg-slate-900 touch-none cursor-pointer"
                          >
                            <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playClickPop(soundEnabled);
                              setOverlayTransparent((v) => !v);
                            }}
                            className={`inline-flex h-7 items-center rounded-md border px-2 text-[10px] font-bold touch-none cursor-pointer ${
                              overlayTransparent
                                ? 'border-amber-300 bg-amber-400 text-slate-950'
                                : 'border-white/25 bg-slate-950/75 text-white hover:bg-slate-900'
                            }`}
                          >
                            {overlayTransparent ? 'Velo: Sì' : 'Velo: No'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playClickPop(soundEnabled);
                              resetOverlayTransform();
                            }}
                            aria-label="Centra e azzera rotazione"
                            className="inline-flex h-7 items-center gap-1 rounded-md border border-white/25 bg-slate-950/75 px-2 text-[10px] font-bold text-white hover:bg-slate-900 touch-none cursor-pointer"
                          >
                            <Crosshair className="h-3 w-3 text-amber-300" aria-hidden="true" />
                            <span>Centra</span>
                          </button>
                        </div>
                      </div>

                      {/* Windowless floating shape with direct drag-to-move & 360° rotation handle */}
                      <div
                        ref={shapeCenterRef}
                        style={{
                          transform: `translate3d(${overlayPos.x}px, ${overlayPos.y}px, 0)`
                        }}
                        className="relative flex items-center justify-center touch-none select-none"
                      >
                        {/* 360° rotation knob orbiting around the shape's true center */}
                        <div
                          style={{ transform: `rotate(${rotationDeg}deg)` }}
                          className="pointer-events-none absolute inset-0 flex items-center justify-center"
                        >
                          <div
                            style={{ transform: `translateY(-${handleRadius}px)` }}
                            className="flex flex-col items-center"
                          >
                            <button
                              type="button"
                              onPointerDown={handleRotateHandlePointerDown}
                              aria-label="Trascina per ruotare di 360 gradi"
                              title="Trascina per ruotare 360°"
                              className={`pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-950 bg-amber-400 text-slate-950 shadow-md transition-transform touch-none cursor-grab active:cursor-grabbing ${
                                isManipulating ? 'scale-110 ring-3 ring-amber-300/60' : 'hover:scale-105'
                              }`}
                            >
                              <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <span className="h-3.5 w-0.5 bg-amber-300/90 shadow-xs" aria-hidden="true" />
                          </div>
                        </div>

                        {/* Directly draggable shape (NO frosted card/window) */}
                        <div
                          onPointerDown={handleStagePointerDownMove}
                          style={{ transform: `scale(${overlayScale})` }}
                          className={`touch-none select-none cursor-grab active:cursor-grabbing transition-opacity ${
                            overlayTransparent ? 'opacity-65' : 'opacity-95'
                          } drop-shadow-[0_6px_14px_rgba(15,23,42,0.55)]`}
                        >
                          <ShapeSvg
                            shapeId={activeShape.id}
                            size={baseSize}
                            rotationDeg={rotationDeg}
                            showVertices={showVertices}
                            showRightAngles={showRightAngles}
                            showSymmetry={showSymmetry}
                            ornamentMode={ornamentMode}
                          />
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* High-Contrast Frosted Bottom Match Caption */}
              <div className="relative z-10 border-t border-white/15 bg-slate-950/78 px-3.5 py-1.5 text-white backdrop-blur-md">
                <p className="text-xs font-semibold leading-snug">
                  <span className="font-bold text-amber-300">Nell’immagine: </span>
                  {activeShape.atlasMatchCaption}
                </p>
              </div>
            </div>

            {/* Interactive Geometry Layer Controls + Continuous 360° Angle Slider in Sovrapponi */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5 shrink-0">
              {[
                {
                  label: 'Vertici',
                  active: showVertices,
                  toggle: () => setShowVertices((v) => !v)
                },
                {
                  label: 'Angoli Retti',
                  active: showRightAngles,
                  toggle: () => setShowRightAngles((v) => !v)
                },
                {
                  label: 'Simmetria',
                  active: showSymmetry,
                  toggle: () => setShowSymmetry((v) => !v)
                },
                {
                  label: 'Decoro',
                  active: ornamentMode,
                  toggle: () => setOrnamentMode((v) => !v)
                }
              ].map((ctrl) => (
                <button
                  key={ctrl.label}
                  type="button"
                  onClick={() => {
                    playClickPop(soundEnabled);
                    ctrl.toggle();
                  }}
                  className={`min-h-[30px] rounded-lg border-2 px-2.5 py-0.5 text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    ctrl.active
                      ? 'border-[#0F5132] bg-[#0F5132] text-white'
                      : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {ctrl.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  playClickPop(soundEnabled);
                  setRotationDeg((deg) => (deg + 45) % 360);
                }}
                className="inline-flex min-h-[30px] items-center gap-1 rounded-lg border-2 border-slate-300 bg-white px-2.5 py-0.5 text-[11px] font-bold text-slate-900 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCw className="h-3 w-3" aria-hidden="true" />
                <span>{rotationDeg > 0 ? `+45° (${rotationDeg}°)` : 'Ruota +45°'}</span>
              </button>

              {stageMode === 'sovrapponi' && (
                <label className="inline-flex min-h-[30px] items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-0.5 text-[11px] font-bold text-slate-800">
                  <span className="whitespace-nowrap">360°:</span>
                  <input
                    type="range"
                    min={0}
                    max={359}
                    value={rotationDeg}
                    onChange={(e) => setRotationDeg(Number(e.target.value))}
                    aria-label="Rotazione continua 360 gradi"
                    className="h-1.5 w-20 sm:w-24 accent-[#0F5132] cursor-pointer"
                  />
                  <span className="w-8 text-right font-mono tabular-nums text-[#0F5132]">
                    {rotationDeg}°
                  </span>
                </label>
              )}
            </div>
          </div>

          {!limMode && (
            <div className="mt-3 border-t border-slate-200 pt-3">
              <p className="text-xs leading-relaxed text-slate-800">
                {activeShape.description}
              </p>
              <p className="mt-1 text-[11px] font-bold text-[#0F5132]">
                Regola d’oro: {activeShape.schoolTip}
              </p>

              <div className="mt-2.5 grid grid-cols-2 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/75 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
                <div className="p-2">
                  <span className="block text-[10px] font-medium text-slate-600">
                    {activeShape.category === 'solido' ? 'Spigoli / Facce' : 'Lati'}
                  </span>
                  <span className="mt-0.5 block font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    {activeShape.sides}
                  </span>
                </div>
                <div className="p-2">
                  <span className="block text-[10px] font-medium text-slate-600">Vertici</span>
                  <span className="mt-0.5 block font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    {activeShape.vertices}
                  </span>
                </div>
                <div className="p-2">
                  <span className="block text-[10px] font-medium text-slate-600">Angoli retti</span>
                  <span className="mt-0.5 block font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    {activeShape.rightAngles}
                  </span>
                </div>
                <div className="p-2">
                  <span className="block text-[10px] font-medium text-slate-600">Simmetrie</span>
                  <span className="mt-0.5 block font-mono text-[11px] font-semibold text-slate-900 tabular-nums">
                    {activeShape.symmetryAxes}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Shape Grid Selector (+ Compact Properties Strip in LIM Mode) */}
        <div
          className={`flex flex-col justify-between rounded-xl border border-slate-300 bg-white md:col-span-5 ${
            limMode ? 'p-3 min-h-0 overflow-hidden' : 'p-3.5 sm:p-4'
          }`}
        >
          <div className={limMode ? 'flex flex-col min-h-0' : ''}>
            <div className="flex shrink-0 items-center justify-between">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                Scegli una figura
              </h3>
              <span className="font-mono text-[11px] font-semibold text-slate-700 tabular-nums">
                {visibleShapes.length} schede
              </span>
            </div>

            <div
              className={`grid ${
                limMode
                  ? 'mt-2 grid-cols-2 gap-1.5 content-start'
                  : 'mt-2.5 grid-cols-1 gap-2 sm:grid-cols-2'
              }`}
            >
              {visibleShapes.map((shape) => {
                const selected = shape.id === activeShape.id;
                const visited = visitedIds.includes(shape.id);
                return (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => {
                      playClickPop(soundEnabled);
                      selectShape(shape.id);
                    }}
                    className={`flex items-center justify-between rounded-xl border-2 text-left transition-colors cursor-pointer ${
                      limMode ? 'min-h-[38px] gap-1.5 px-2 py-1' : 'min-h-[54px] gap-2 p-2'
                    } ${
                      selected
                        ? 'border-[#0F5132] bg-emerald-50 ring-2 ring-[#0F5132]/15'
                        : 'border-slate-200 bg-white hover:border-[#0F5132] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="shrink-0">
                        <ShapeSvg shapeId={shape.id} size={limMode ? 26 : 36} ornamentMode={ornamentMode} />
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate text-xs font-bold text-slate-900">
                          {shape.name}
                        </span>
                        {!limMode && (
                          <span className="block truncate text-[10px] font-semibold text-red-700">
                            {shape.christmasObject}
                          </span>
                        )}
                      </div>
                    </div>
                    {visited && (
                      <Check
                        className={`shrink-0 ${limMode ? 'h-3 w-3' : 'h-3.5 w-3.5'} ${
                          selected ? 'text-[#0F5132]' : 'text-emerald-600/70'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {limMode && (
            <div className="mt-2.5 shrink-0 border-t border-slate-200 pt-2.5">
              <p className="text-xs leading-snug text-slate-800 line-clamp-2">
                {activeShape.description}
              </p>
              <p className="mt-1 text-xs font-bold text-[#0F5132] line-clamp-1">
                Regola d’oro: {activeShape.schoolTip}
              </p>

              <div className="mt-2 grid grid-cols-4 divide-x divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/75">
                <div className="px-2.5 py-2">
                  <span className="block text-[10px] font-medium text-slate-600">
                    {activeShape.category === 'solido' ? 'Spigoli / Facce' : 'Lati'}
                  </span>
                  <span className="mt-0.5 block font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    {activeShape.sides}
                  </span>
                </div>
                <div className="px-2.5 py-2">
                  <span className="block text-[10px] font-medium text-slate-600">Vertici</span>
                  <span className="mt-0.5 block font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    {activeShape.vertices}
                  </span>
                </div>
                <div className="px-2.5 py-2">
                  <span className="block text-[10px] font-medium text-slate-600">Angoli retti</span>
                  <span className="mt-0.5 block font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    {activeShape.rightAngles}
                  </span>
                </div>
                <div className="px-2.5 py-2">
                  <span className="block text-[10px] font-medium text-slate-600">Simmetrie</span>
                  <span className="mt-0.5 block truncate font-mono text-xs font-semibold text-slate-900 tabular-nums">
                    {activeShape.symmetryAxes}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
