import React, { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, RotateCw, Volume2 } from 'lucide-react';
import { CHRISTMAS_SHAPES } from '../data/christmasShapes';
import { playClickPop } from '../lib/soundFx';
import { speakForKids } from '../lib/ttsVoice';
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
  const [showVertices, setShowVertices] = useState(true);
  const [showRightAngles, setShowRightAngles] = useState(true);
  const [showSymmetry, setShowSymmetry] = useState(false);
  const [ornamentMode, setOrnamentMode] = useState(true);
  const [visitedIds, setVisitedIds] = useState<ShapeId[]>(['triangolo']);

  const containerMax = limMode ? 'max-w-[1600px]' : 'max-w-[1200px]';

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

  const selectShape = (shapeId: ShapeId, announce = true) => {
    const target = CHRISTMAS_SHAPES.find((s) => s.id === shapeId);
    if (!target) return;
    setSelectedId(shapeId);
    setRotationDeg(0);
    setVisitedIds((prev) => (prev.includes(shapeId) ? prev : [...prev, shapeId]));
    onExploreShape?.(shapeId);
    if (announce) {
      speakForKids(`${target.name}: ${target.christmasObject}.`, soundEnabled);
    }
  };

  const handleFilterChange = (nextFilter: AtlasFilter) => {
    playClickPop(soundEnabled);
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
    speakForKids(
      `${shape.name}. Oggetto di Natale: ${shape.christmasObject}. ${shape.atlasMatchCaption} ${shape.description} ${shape.schoolTip}`,
      true
    );
  };

  return (
    <section
      className={`mx-auto ${containerMax} px-4 sm:px-6 ${
        limMode ? 'flex flex-col py-3 md:h-full md:overflow-hidden gap-3' : 'py-5'
      }`}
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-semibold text-slate-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Atlante delle Forme di Natale
          </h1>
          {!limMode && (
            <p className="mt-1 text-sm text-slate-700">
              Ogni forma ha il suo sfondo natalizio: confronta la figura geometrica con l’oggetto reale nell’immagine.
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
              className={`min-h-[38px] rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === tab.id ? 'bg-white text-slate-900 shadow-xs' : 'bg-transparent text-slate-800 hover:bg-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Explorer: 3 columns in LIM mode (zero scroll), 2 columns in standard mode */}
      <div
        className={`grid grid-cols-1 md:grid-cols-12 md:items-stretch ${
          limMode ? 'mt-0 flex-1 min-h-0 gap-4' : 'mt-5 gap-6'
        }`}
      >
        {/* Left: Interactive Geometry Stage with Shape-Matched Illustrated Backdrop */}
        <div
          className={`flex flex-col justify-between rounded-2xl border border-slate-300 bg-white ${
            limMode ? 'p-4 md:col-span-6 min-h-0' : 'p-5 sm:p-6 md:col-span-7'
          }`}
        >
          <div className={limMode ? 'flex flex-1 flex-col min-h-0' : ''}>
            {!limMode && (
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-red-700">
                    {activeShape.category === 'solido' ? 'Solido Geometrico 3D' : 'Figura Piana 2D'}
                    {' · '}
                    Oggetto di Natale: {activeShape.christmasObject}
                  </span>
                  <h2
                    className="mt-1 text-2xl font-semibold text-slate-900"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {activeShape.name}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => handleSpeakShape(activeShape)}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                  <span>Ascolta Scheda</span>
                </button>
              </div>
            )}

            {/* Unified Stage Control Bar: Mode Switcher + Stepper */}
            <div className={`flex flex-wrap items-center justify-between gap-2 ${limMode ? 'mt-0 shrink-0' : 'mt-4'}`}>
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
                    className={`min-h-[36px] rounded-lg px-3 py-1 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStepShape(-1)}
                  aria-label="Figura precedente"
                  className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border border-slate-300 bg-white px-2 text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <span className="min-w-[44px] text-center font-mono text-xs font-semibold text-slate-700 tabular-nums">
                  {activeIndex + 1}/{visibleShapes.length}
                </span>
                <button
                  type="button"
                  onClick={() => handleStepShape(1)}
                  aria-label="Figura successiva"
                  className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border border-slate-300 bg-white px-2 text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Large Interactive Stage with Unique Per-Shape Christmas Illustration */}
            <div
              className={`relative mt-2.5 flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-300 bg-slate-900 ${
                limMode ? 'flex-1 min-h-[240px]' : 'min-h-[310px] sm:min-h-[360px]'
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

              {/* Stage Foreground: Translucent Frosted Callout, Centered Overlay, or Unobstructed Scene */}
              <div
                className={`relative z-10 flex flex-1 p-3.5 sm:p-4 ${
                  stageMode === 'sovrapponi'
                    ? 'items-center justify-center'
                    : 'items-end sm:items-center justify-start'
                }`}
              >
                {stageMode === 'affianca' && (
                  <div className="flex flex-col items-center rounded-2xl border border-white/75 bg-white/62 px-3.5 py-2.5 shadow-xl backdrop-blur-md transition-opacity duration-200">
                    <ShapeSvg
                      shapeId={activeShape.id}
                      size={limMode ? 156 : 148}
                      rotationDeg={rotationDeg}
                      showVertices={showVertices}
                      showRightAngles={showRightAngles}
                      showSymmetry={showSymmetry}
                      ornamentMode={ornamentMode}
                    />
                    <span className="mt-1 text-xs font-bold text-slate-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                      {activeShape.name} · {activeShape.christmasObject}
                    </span>
                  </div>
                )}

                {stageMode === 'sovrapponi' && (
                  <div className="rounded-2xl border border-white/75 bg-white/38 p-3 shadow-xl backdrop-blur-[2px] transition-opacity duration-200">
                    <ShapeSvg
                      shapeId={activeShape.id}
                      size={limMode ? 210 : 196}
                      rotationDeg={rotationDeg}
                      showVertices={showVertices}
                      showRightAngles={showRightAngles}
                      showSymmetry={showSymmetry}
                      ornamentMode={ornamentMode}
                    />
                  </div>
                )}
              </div>

              {/* High-Contrast Frosted Bottom Match Caption */}
              <div className="relative z-10 border-t border-white/15 bg-slate-950/78 px-4 py-2 text-white backdrop-blur-md">
                <p className="text-xs sm:text-sm font-semibold leading-snug">
                  <span className="font-bold text-amber-300">Nell’immagine: </span>
                  {activeShape.atlasMatchCaption}
                </p>
              </div>
            </div>

            {/* Interactive Geometry Layer Controls */}
            <div className={`flex flex-wrap gap-1.5 shrink-0 ${limMode ? 'mt-3' : 'mt-4 gap-2'}`}>
              {[
                {
                  label: limMode ? 'Vertici' : 'Mostra Vertici',
                  active: showVertices,
                  toggle: () => setShowVertices((v) => !v)
                },
                {
                  label: 'Angoli Retti',
                  active: showRightAngles,
                  toggle: () => setShowRightAngles((v) => !v)
                },
                {
                  label: limMode ? 'Simmetria' : 'Assi di Simmetria',
                  active: showSymmetry,
                  toggle: () => setShowSymmetry((v) => !v)
                },
                {
                  label: limMode ? 'Decoro Natale' : 'Decorazione Natale',
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
                  className={`rounded-lg border-2 px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    limMode ? 'min-h-[38px]' : 'min-h-[42px] px-3.5'
                  } ${
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
                className={`inline-flex items-center gap-1.5 rounded-lg border-2 border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer ${
                  limMode ? 'min-h-[38px]' : 'min-h-[42px] px-3.5'
                }`}
              >
                <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Ruota {rotationDeg > 0 ? `(${rotationDeg}°)` : '+45°'}</span>
              </button>
            </div>
          </div>

          {!limMode && (
            <div className="mt-5 border-t border-slate-200 pt-5">
              <p className="text-sm leading-relaxed text-slate-800">
                {activeShape.description}
              </p>
              <p className="mt-1.5 text-xs font-bold text-[#0F5132]">
                Regola d’oro: {activeShape.schoolTip}
              </p>

              <div className="mt-4 grid grid-cols-2 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/75 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
                <div className="p-3">
                  <span className="block text-[11px] font-medium text-slate-600">
                    {activeShape.category === 'solido' ? 'Spigoli / Facce' : 'Lati'}
                  </span>
                  <span className="mt-0.5 block font-mono text-lg font-semibold text-slate-900 tabular-nums">
                    {activeShape.sides}
                  </span>
                </div>
                <div className="p-3">
                  <span className="block text-[11px] font-medium text-slate-600">Vertici</span>
                  <span className="mt-0.5 block font-mono text-lg font-semibold text-slate-900 tabular-nums">
                    {activeShape.vertices}
                  </span>
                </div>
                <div className="p-3">
                  <span className="block text-[11px] font-medium text-slate-600">Angoli retti</span>
                  <span className="mt-0.5 block font-mono text-lg font-semibold text-slate-900 tabular-nums">
                    {activeShape.rightAngles}
                  </span>
                </div>
                <div className="p-3">
                  <span className="block text-[11px] font-medium text-slate-600">Simmetrie</span>
                  <span className="mt-0.5 block font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    {activeShape.symmetryAxes}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LIM Mode Middle Column: Dedicated Properties & Audio Card */}
        {limMode && (
          <div className="flex flex-col justify-between rounded-2xl border border-slate-300 bg-white p-4 md:col-span-3 min-h-0">
            <div>
              <span className="text-xs font-semibold text-red-700">
                {activeShape.category === 'solido' ? 'Solido Geometrico 3D' : 'Figura Piana 2D'}
              </span>
              <h2
                className="mt-0.5 text-2xl font-semibold text-slate-900"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {activeShape.name}
              </h2>
              <p className="mt-0.5 text-xs font-bold text-[#0F5132]">
                Oggetto: {activeShape.christmasObject}
              </p>

              <button
                type="button"
                onClick={() => handleSpeakShape(activeShape)}
                className="mt-3 inline-flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300 whitespace-nowrap cursor-pointer"
              >
                <Volume2 className="h-4 w-4" aria-hidden="true" />
                <span>Ascolta Scheda</span>
              </button>

              <div className="mt-4 border-t border-slate-200 pt-3">
                <p className="text-sm leading-relaxed text-slate-800">
                  {activeShape.description}
                </p>
                <p className="mt-2 rounded-lg bg-emerald-50 p-2.5 text-xs font-bold text-[#0F5132]">
                  Regola d’oro: {activeShape.schoolTip}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 divide-x divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/75">
              <div className="p-2.5">
                <span className="block text-[11px] font-medium text-slate-600">
                  {activeShape.category === 'solido' ? 'Spigoli / Facce' : 'Lati'}
                </span>
                <span className="mt-0.5 block font-mono text-lg font-semibold text-slate-900 tabular-nums">
                  {activeShape.sides}
                </span>
              </div>
              <div className="p-2.5">
                <span className="block text-[11px] font-medium text-slate-600">Vertici</span>
                <span className="mt-0.5 block font-mono text-lg font-semibold text-slate-900 tabular-nums">
                  {activeShape.vertices}
                </span>
              </div>
              <div className="p-2.5">
                <span className="block text-[11px] font-medium text-slate-600">Angoli retti</span>
                <span className="mt-0.5 block font-mono text-lg font-semibold text-slate-900 tabular-nums">
                  {activeShape.rightAngles}
                </span>
              </div>
              <div className="p-2.5">
                <span className="block text-[11px] font-medium text-slate-600">Simmetrie</span>
                <span className="mt-0.5 block font-mono text-sm font-semibold text-slate-900 tabular-nums">
                  {activeShape.symmetryAxes}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Right: Shape Grid Selector (compact 2-col 14-item grid fits zero-scroll in LIM mode) */}
        <div
          className={`flex flex-col rounded-2xl border border-slate-300 bg-white ${
            limMode ? 'p-3.5 md:col-span-3 min-h-0' : 'p-5 md:col-span-5'
          }`}
        >
          <div className="flex shrink-0 items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Scegli una figura
            </h3>
            <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
              {visibleShapes.length} schede
            </span>
          </div>

          <div
            className={`grid ${
              limMode
                ? 'mt-2.5 flex-1 grid-cols-2 gap-1.5 content-start'
                : 'mt-4 grid-cols-1 gap-2.5 sm:grid-cols-2'
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
                    limMode ? 'min-h-[48px] gap-1.5 p-1.5' : 'min-h-[68px] gap-2.5 p-2.5'
                  } ${
                    selected
                      ? 'border-[#0F5132] bg-emerald-50 ring-2 ring-[#0F5132]/15'
                      : 'border-slate-200 bg-white hover:border-[#0F5132] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="shrink-0">
                      <ShapeSvg shapeId={shape.id} size={limMode ? 32 : 46} ornamentMode={ornamentMode} />
                    </div>
                    <div className="min-w-0">
                      <span className={`block truncate font-bold text-slate-900 ${limMode ? 'text-xs' : 'text-sm'}`}>
                        {shape.name}
                      </span>
                      {!limMode && (
                        <span className="block truncate text-[11px] font-semibold text-red-700">
                          {shape.christmasObject}
                        </span>
                      )}
                    </div>
                  </div>
                  {visited && (
                    <Check
                      className={`shrink-0 ${limMode ? 'h-3.5 w-3.5' : 'h-4 w-4'} ${
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
      </div>
    </section>
  );
};
