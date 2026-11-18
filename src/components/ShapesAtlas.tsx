import React, { useMemo, useState } from 'react';
import { Volume2 } from 'lucide-react';
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
  const [showVertices, setShowVertices] = useState(true);
  const [showRightAngles, setShowRightAngles] = useState(true);
  const [showSymmetry, setShowSymmetry] = useState(false);
  const [ornamentMode, setOrnamentMode] = useState(true);

  const containerMax = limMode ? 'max-w-[1400px]' : 'max-w-[1200px]';

  const visibleShapes = useMemo(() => {
    if (filter === 'tutte') return CHRISTMAS_SHAPES;
    return CHRISTMAS_SHAPES.filter((s) => s.level === filter);
  }, [filter]);

  const activeShape = useMemo(
    () => CHRISTMAS_SHAPES.find((s) => s.id === selectedId) ?? CHRISTMAS_SHAPES[0],
    [selectedId]
  );

  const handleSpeakShape = (shape = activeShape) => {
    speakForKids(
      `${shape.name}. Oggetto di Natale: ${shape.christmasObject}. ${shape.atlasMatchCaption} ${shape.description} ${shape.schoolTip}`,
      true
    );
  };

  return (
    <section className={`mx-auto ${containerMax} px-4 py-5 sm:px-6`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            className={`font-semibold text-slate-900 ${limMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Atlante delle Forme di Natale
          </h1>
          <p className={`mt-1 text-slate-700 ${limMode ? 'text-base' : 'text-sm'}`}>
            Ogni forma ha il suo sfondo natalizio: trova nell’immagine l’oggetto che riprende la figura geometrica.
          </p>
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
              onClick={() => {
                playClickPop(soundEnabled);
                setFilter(tab.id);
              }}
              className={`min-h-[40px] rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === tab.id ? 'bg-white text-slate-900 shadow-xs' : 'bg-transparent text-slate-800 hover:bg-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Two-Zone Explorer (side-by-side already on tablet landscape md:) */}
      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-stretch">
        {/* Left: Interactive Geometry Stage with Shape-Matched Illustrated Backdrop */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-300 bg-white p-6 md:col-span-7">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-red-700">
                  {activeShape.category === 'solido' ? 'Solido Geometrico 3D' : 'Figura Piana 2D'}
                  {' · '}
                  Oggetto di Natale: {activeShape.christmasObject}
                </span>
                <h2
                  className={`mt-1 font-semibold text-slate-900 ${limMode ? 'text-3xl' : 'text-2xl'}`}
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

            {/* Stage Mode Switcher */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700">
                Confronto con lo sfondo:
              </span>
              <div className="flex flex-wrap gap-1.5">
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
                    className={`min-h-[38px] rounded-lg border px-3 py-1 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      stageMode === mode.id
                        ? 'border-[#0F5132] bg-[#0F5132] text-white'
                        : 'border-slate-300 bg-slate-50 text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Large Interactive Stage with Unique Per-Shape Christmas Illustration */}
            <div className="relative mt-3 flex min-h-[290px] flex-col justify-between overflow-hidden rounded-2xl border-2 border-slate-300 bg-slate-900 sm:min-h-[320px]">
              <ResilientImage
                key={activeShape.id}
                src={activeShape.atlasBackgroundImage}
                alt={activeShape.atlasBackgroundAlt}
                fallbackTitle={activeShape.christmasObject}
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* Subtle edge readability scrim keeping the center illustration bright and vivid */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/20"
                aria-hidden="true"
              />

              {/* Stage Foreground: Side-by-side Card, Centered Overlay, or Unobstructed Scene */}
              <div
                className={`relative z-10 flex flex-1 p-4 sm:p-5 ${
                  stageMode === 'sovrapponi'
                    ? 'items-center justify-center'
                    : 'items-center justify-start'
                }`}
              >
                {stageMode === 'affianca' && (
                  <div className="flex flex-col items-center rounded-2xl border-2 border-white bg-white/92 p-3 shadow-lg backdrop-blur-xs">
                    <ShapeSvg
                      shapeId={activeShape.id}
                      size={limMode ? 184 : 152}
                      showVertices={showVertices}
                      showRightAngles={showRightAngles}
                      showSymmetry={showSymmetry}
                      ornamentMode={ornamentMode}
                    />
                    <span className="mt-1.5 text-xs font-bold text-slate-900">
                      {activeShape.name} → {activeShape.christmasObject}
                    </span>
                  </div>
                )}

                {stageMode === 'sovrapponi' && (
                  <div className="rounded-2xl border-2 border-white/80 bg-white/45 p-3 shadow-lg backdrop-blur-[2px]">
                    <ShapeSvg
                      shapeId={activeShape.id}
                      size={limMode ? 228 : 196}
                      showVertices={showVertices}
                      showRightAngles={showRightAngles}
                      showSymmetry={showSymmetry}
                      ornamentMode={ornamentMode}
                    />
                  </div>
                )}
              </div>

              {/* High-Contrast Bottom Match Caption */}
              <div className="relative z-10 border-t border-white/15 bg-slate-950/88 px-4 py-2.5 text-white">
                <p className={`font-semibold leading-snug ${limMode ? 'text-sm' : 'text-xs sm:text-sm'}`}>
                  <span className="font-bold text-amber-300">Nell’immagine: </span>
                  {activeShape.atlasMatchCaption}
                </p>
              </div>
            </div>

            {/* Interactive Layer Toggles */}
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                {
                  label: 'Mostra Vertici',
                  active: showVertices,
                  toggle: () => setShowVertices((v) => !v)
                },
                {
                  label: 'Angoli Retti',
                  active: showRightAngles,
                  toggle: () => setShowRightAngles((v) => !v)
                },
                {
                  label: 'Assi di Simmetria',
                  active: showSymmetry,
                  toggle: () => setShowSymmetry((v) => !v)
                },
                {
                  label: 'Decorazione Natale',
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
                  className={`min-h-[42px] rounded-lg border-2 px-3.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    ctrl.active
                      ? 'border-[#0F5132] bg-[#0F5132] text-white'
                      : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {ctrl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Properties Summary Table */}
          <div className="mt-6 border-t border-slate-200 pt-5">
            <p className={`leading-relaxed text-slate-800 ${limMode ? 'text-base' : 'text-sm'}`}>
              {activeShape.description}
            </p>
            <p className="mt-1.5 text-xs font-bold text-[#0F5132]">
              Regola d’oro: {activeShape.schoolTip}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="block text-[11px] font-medium text-slate-600">
                  {activeShape.category === 'solido' ? 'Spigoli / Facce' : 'Lati'}
                </span>
                <span className="mt-0.5 block font-mono text-lg font-semibold text-slate-900 tabular-nums">
                  {activeShape.sides}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="block text-[11px] font-medium text-slate-600">Vertici</span>
                <span className="mt-0.5 block font-mono text-lg font-semibold text-slate-900 tabular-nums">
                  {activeShape.vertices}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="block text-[11px] font-medium text-slate-600">Angoli retti</span>
                <span className="mt-0.5 block font-mono text-lg font-semibold text-slate-900 tabular-nums">
                  {activeShape.rightAngles}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="block text-[11px] font-medium text-slate-600">Simmetrie</span>
                <span className="mt-0.5 block font-mono text-sm font-semibold text-slate-900 tabular-nums">
                  {activeShape.symmetryAxes}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Shape Grid Selector */}
        <div className="rounded-2xl border border-slate-300 bg-white p-5 md:col-span-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">
              Scegli una figura
            </h3>
            <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
              {visibleShapes.length} schede
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {visibleShapes.map((shape) => {
              const selected = shape.id === activeShape.id;
              return (
                <button
                  key={shape.id}
                  type="button"
                  onClick={() => {
                    playClickPop(soundEnabled);
                    setSelectedId(shape.id);
                    onExploreShape?.(shape.id);
                    speakForKids(`${shape.name}: ${shape.christmasObject}.`, soundEnabled);
                  }}
                  className={`flex min-h-[68px] items-center gap-3 rounded-xl border-2 p-2.5 text-left transition-colors cursor-pointer ${
                    selected
                      ? 'border-[#0F5132] bg-emerald-50'
                      : 'border-slate-300 bg-white hover:border-[#0F5132] hover:bg-slate-50'
                  }`}
                >
                  <div className="shrink-0">
                    <ShapeSvg shapeId={shape.id} size={48} ornamentMode={ornamentMode} />
                  </div>
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-900">
                      {shape.name}
                    </span>
                    <span className="block truncate text-[11px] font-semibold text-red-700">
                      {shape.christmasObject}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
