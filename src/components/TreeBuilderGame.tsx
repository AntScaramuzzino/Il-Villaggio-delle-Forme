import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  HelpCircle,
  Image as ImageIcon,
  Puzzle,
  RotateCcw,
  Sparkles,
  Trees,
  Volume2
} from 'lucide-react';
import { getShapeById, TANGRAM_PUZZLES } from '../data/christmasShapes';
import { playClickPop, playErrorThud, playSuccessChime, playVictoryFanfare } from '../lib/soundFx';
import { speakForKids, stopSpeaking } from '../lib/ttsVoice';
import { ShapeId, TangramSlot } from '../types/christmasGeometry';
import { ResilientImage } from './ResilientImage';
import { ShapeSvg } from './ShapeSvg';
import { TangramFactory } from './TangramFactory';

interface TreeBuilderGameProps {
  soundEnabled: boolean;
  completedPuzzles: string[];
  onCompletePuzzle: (puzzleId: string) => void;
  limMode?: boolean;
}

type BuilderMode = 'scenes' | 'tangram';

function getRegularPolyPath(cx: number, cy: number, rx: number, ry: number, sides: number, startDeg = -90): string {
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = ((startDeg + (360 / sides) * i) * Math.PI) / 180;
    pts.push(`${(cx + rx * Math.cos(a)).toFixed(1)},${(cy + ry * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

function getSlotPolygonPath(slot: TangramSlot): string {
  const { shapeId, x, y, width, height } = slot;
  const hw = width / 2;
  const hh = height / 2;

  if (shapeId === 'triangolo') {
    return `${x},${y - hh} ${x + hw},${y + hh} ${x - hw},${y + hh}`;
  }
  if (shapeId === 'quadrato' || shapeId === 'rettangolo') {
    return `${x - hw},${y - hh} ${x + hw},${y - hh} ${x + hw},${y + hh} ${x - hw},${y + hh}`;
  }
  if (shapeId === 'rombo') {
    return `${x},${y - hh} ${x + hw},${y} ${x},${y + hh} ${x - hw},${y}`;
  }
  if (shapeId === 'trapezio') {
    const topHalf = hw * 0.62;
    return `${x - topHalf},${y - hh} ${x + topHalf},${y - hh} ${x + hw},${y + hh} ${x - hw},${y + hh}`;
  }
  if (shapeId === 'pentagono') {
    return getRegularPolyPath(x, y, hw, hh, 5, -90);
  }
  if (shapeId === 'esagono') {
    return getRegularPolyPath(x, y, hw, hh, 6, -90);
  }
  if (shapeId === 'ottagono') {
    return getRegularPolyPath(x, y, hw, hh, 8, -67.5);
  }
  if (shapeId === 'stella') {
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? hw : hw * 0.44;
      const a = ((-90 + i * 36) * Math.PI) / 180;
      pts.push(`${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`);
    }
    return pts.join(' ');
  }
  return '';
}

export const TreeBuilderGame: React.FC<TreeBuilderGameProps> = ({
  soundEnabled,
  completedPuzzles,
  onCompletePuzzle,
  limMode = false
}) => {
  const [builderMode, setBuilderMode] = useState<BuilderMode>('scenes');
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [placedSlots, setPlacedSlots] = useState<Record<string, boolean>>({});
  const [selectedPiece, setSelectedPiece] = useState<ShapeId | null>(null);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showBackdrop, setShowBackdrop] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<string>(
    'Tocca una figura decorata nel vassoio e poi tocca lo spazio tratteggiato giusto!'
  );
  const [feedbackStatus, setFeedbackStatus] = useState<'neutral' | 'ok' | 'err'>('neutral');

  const puzzle = TANGRAM_PUZZLES[puzzleIdx];
  const containerMax = limMode ? 'max-w-[1600px]' : 'max-w-[1200px]';

  const placedCount = useMemo(
    () => puzzle.slots.filter((s) => placedSlots[s.slotId]).length,
    [puzzle, placedSlots]
  );

  const isCompleted = placedCount === puzzle.slots.length;

  const switchMode = (mode: BuilderMode) => {
    playClickPop(soundEnabled);
    stopSpeaking();
    setBuilderMode(mode);
  };

  const selectPuzzle = (idx: number) => {
    playClickPop(soundEnabled);
    setPuzzleIdx(idx);
    setPlacedSlots({});
    setSelectedPiece(null);
    setActiveSlotId(null);
    setFeedbackStatus('neutral');
    const msg = `Nuova scena: ${TANGRAM_PUZZLES[idx].title}. Tocca una forma nel vassoio e poi lo spazio tratteggiato.`;
    setFeedbackMsg(msg);
    speakForKids(msg, soundEnabled);
  };

  const resetCurrentPuzzle = () => {
    playClickPop(soundEnabled);
    setPlacedSlots({});
    setSelectedPiece(null);
    setActiveSlotId(null);
    setFeedbackStatus('neutral');
    const msg = 'Tavolo pulito! Ricomincia la costruzione natalizia.';
    setFeedbackMsg(msg);
    speakForKids(msg, soundEnabled);
  };

  const tryPlacePiece = (slot: TangramSlot, pieceId: ShapeId) => {
    if (placedSlots[slot.slotId]) return;

    const chosenDef = getShapeById(pieceId);

    if (slot.shapeId === pieceId) {
      const nextPlaced = { ...placedSlots, [slot.slotId]: true };
      setPlacedSlots(nextPlaced);
      setActiveSlotId(null);
      setFeedbackStatus('ok');

      const nextCount = puzzle.slots.filter((s) => nextPlaced[s.slotId]).length;
      if (nextCount === puzzle.slots.length) {
        playVictoryFanfare(soundEnabled);
        onCompletePuzzle(puzzle.id);
        const msg = `Fantastico! Hai completato "${puzzle.title}"! Il ${chosenDef.name.toLowerCase()} ha svelato: ${chosenDef.christmasObject}!`;
        setFeedbackMsg(msg);
        speakForKids(msg, soundEnabled);
      } else {
        playSuccessChime(soundEnabled);
        const msg = `Perfetto! ${chosenDef.name} incastrato in "${slot.label}" — oggetto di Natale: ${chosenDef.christmasObject}!`;
        setFeedbackMsg(msg);
        speakForKids(msg, soundEnabled);
      }
    } else {
      playErrorThud(soundEnabled);
      setFeedbackStatus('err');
      const msg = `Non entra qui! Hai scelto ${chosenDef.articleName} (${chosenDef.christmasObject}). Indizio: ${slot.hint}`;
      setFeedbackMsg(msg);
      speakForKids(msg, soundEnabled);
    }
  };

  const handleSlotClick = (slot: TangramSlot) => {
    if (placedSlots[slot.slotId]) return;

    if (selectedPiece) {
      tryPlacePiece(slot, selectedPiece);
    } else {
      playClickPop(soundEnabled);
      setActiveSlotId(slot.slotId);
      setFeedbackStatus('neutral');
      const msg = `Spazio selezionato: "${slot.label}". ${slot.hint}`;
      setFeedbackMsg(msg);
      speakForKids(msg, soundEnabled);
    }
  };

  const handlePieceClick = (pieceId: ShapeId) => {
    playClickPop(soundEnabled);
    const def = getShapeById(pieceId);
    if (activeSlotId) {
      const targetSlot = puzzle.slots.find((s) => s.slotId === activeSlotId);
      if (targetSlot && !placedSlots[targetSlot.slotId]) {
        tryPlacePiece(targetSlot, pieceId);
        return;
      }
    }
    setSelectedPiece((prev) => (prev === pieceId ? null : pieceId));
    setFeedbackStatus('neutral');
    const msg = `Hai preso ${def.articleName}: ${def.christmasObject}. Ora tocca lo spazio giusto sul disegno!`;
    setFeedbackMsg(msg);
    speakForKids(msg, soundEnabled);
  };

  const handleRevealHint = () => {
    const firstMissing = puzzle.slots.find((s) => !placedSlots[s.slotId]);
    if (!firstMissing) return;
    playClickPop(soundEnabled);
    setActiveSlotId(firstMissing.slotId);
    setFeedbackStatus('neutral');
    const msg = `Aiuto per "${firstMissing.label}": ${firstMissing.hint}`;
    setFeedbackMsg(msg);
    speakForKids(msg, soundEnabled);
  };

  return (
    <section
      className={`mx-auto ${containerMax} px-4 sm:px-6 ${
        limMode ? 'flex flex-col gap-2.5 py-2.5 md:h-full md:overflow-hidden' : 'py-5'
      }`}
    >
      {/* Mode Switcher: 8 Christmas Scenes vs 7-Piece Tangram Factory */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-slate-300 bg-white ${
          limMode ? 'px-3 py-1.5' : 'mb-5 p-3'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => switchMode('scenes')}
            className={`inline-flex items-center gap-2 rounded-xl border-2 px-3.5 py-1.5 text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              limMode ? 'min-h-[38px]' : 'min-h-[44px] px-4 py-2'
            } ${
              builderMode === 'scenes'
                ? 'border-[#0F5132] bg-[#0F5132] text-white'
                : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Trees className="h-4 w-4" aria-hidden="true" />
            <span>Scene di Natale (8 Modelli)</span>
          </button>

          <button
            type="button"
            onClick={() => switchMode('tangram')}
            className={`inline-flex items-center gap-2 rounded-xl border-2 px-3.5 py-1.5 text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              limMode ? 'min-h-[38px]' : 'min-h-[44px] px-4 py-2'
            } ${
              builderMode === 'tangram'
                ? 'border-red-600 bg-red-600 text-white'
                : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Puzzle className="h-4 w-4" aria-hidden="true" />
            <span>Fabbrica Tangram (7 Pezzi)</span>
          </button>
        </div>

        <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
          Completate: {completedPuzzles.length}/{TANGRAM_PUZZLES.length} scene
        </span>
      </div>

      {builderMode === 'tangram' ? (
        <TangramFactory
          soundEnabled={soundEnabled}
          onCompleteFactoryModel={onCompletePuzzle}
          limMode={limMode}
        />
      ) : (
        <div className={limMode ? 'flex-1 min-h-0 flex flex-col gap-2.5' : ''}>
          {/* Header & Construction Selector */}
          <div>
            {!limMode && (
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h1
                    className="text-2xl sm:text-3xl font-semibold text-slate-900"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Albero Magico e Costruzioni di Natale
                  </h1>
                  <p className="mt-1 text-sm text-slate-700">
                    {puzzle.subtitle}
                  </p>
                </div>
              </div>
            )}

            {/* 8-Construction Selector Grid */}
            <div
              className={`grid gap-1.5 rounded-xl bg-slate-200 p-1.5 ${
                limMode ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-8' : 'mt-4 grid-cols-2 sm:grid-cols-4 gap-2'
              }`}
            >
              {TANGRAM_PUZZLES.map((item, idx) => {
                const active = idx === puzzleIdx;
                const done = completedPuzzles.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectPuzzle(idx)}
                    className={`flex items-center justify-between gap-1.5 rounded-lg border text-left text-xs font-bold transition-colors cursor-pointer ${
                      limMode ? 'min-h-[38px] px-2.5 py-1.5' : 'min-h-[46px] px-3 py-2'
                    } ${
                      active
                        ? 'border-[#0F5132] bg-white text-slate-900 shadow-xs'
                        : 'border-transparent bg-slate-100 text-slate-900 hover:bg-white'
                    }`}
                  >
                    <span className="truncate text-xs">{item.title}</span>
                    <span className="flex items-center gap-1 shrink-0 font-semibold text-[11px] text-slate-700">
                      {done && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />}
                      {!limMode && <span className="hidden lg:inline">{item.levelLabel}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Two-zone Workbench (side-by-side already on tablet landscape md:) */}
          <div
            className={`grid grid-cols-1 md:grid-cols-12 md:items-stretch ${
              limMode ? 'flex-1 min-h-0 gap-4' : 'mt-5 gap-6'
            }`}
          >
            {/* Left: Illustrated Blueprint Canvas */}
            <div
              className={`flex flex-col justify-between rounded-2xl bg-[#0F5132] text-white md:col-span-7 ${
                limMode ? 'min-h-0 p-3.5' : 'p-5 sm:p-6'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-emerald-100">
                  <span className="font-semibold text-white">{puzzle.title}</span>
                  <span className="mx-2" aria-hidden="true">·</span>
                  <span>{puzzle.levelLabel}</span>
                  <span className="mx-2" aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    Pezzi: {placedCount}/{puzzle.slots.length}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {puzzle.backgroundImage && (
                    <button
                      type="button"
                      onClick={() => {
                        playClickPop(soundEnabled);
                        setShowBackdrop((v) => !v);
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/60 bg-[#083822] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#062b1a] whitespace-nowrap shrink-0 cursor-pointer ${
                        limMode ? 'min-h-[36px]' : 'min-h-[42px] px-3 py-1.5'
                      }`}
                    >
                      <ImageIcon className="h-3.5 w-3.5 text-emerald-200" aria-hidden="true" />
                      <span>{showBackdrop ? 'Sfondo: Scena' : 'Sfondo: Lavagna'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRevealHint}
                    disabled={isCompleted}
                    className={`inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/60 bg-[#083822] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#062b1a] whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-45 ${
                      limMode ? 'min-h-[36px]' : 'min-h-[42px] px-3 py-1.5'
                    }`}
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                    <span>Aiuto</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetCurrentPuzzle}
                    className={`inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/60 bg-[#083822] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#062b1a] whitespace-nowrap shrink-0 cursor-pointer ${
                      limMode ? 'min-h-[36px]' : 'min-h-[42px] px-3 py-1.5'
                    }`}
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Ricomincia</span>
                  </button>
                </div>
              </div>

              {/* Interactive SVG Scene with Illustrated Background */}
              <div
                className={`relative flex flex-1 min-h-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-300/25 bg-[#0A3A24] ${
                  limMode ? 'mt-2.5' : 'mt-4'
                }`}
              >
                {showBackdrop && puzzle.backgroundImage && (
                  <>
                    <ResilientImage
                      src={puzzle.backgroundImage}
                      alt={puzzle.backgroundAlt ?? puzzle.title}
                      fallbackTitle={puzzle.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/38" aria-hidden="true" />
                  </>
                )}

                <svg
                  viewBox="0 0 400 310"
                  className={`relative z-10 select-none ${
                    limMode
                      ? 'h-full w-full max-h-full p-1.5'
                      : 'h-auto w-full max-h-[390px] max-w-[500px] p-2'
                  }`}
                  role="img"
                  aria-label={`Schema di costruzione: ${puzzle.title}`}
                >
                  {(!showBackdrop || !puzzle.backgroundImage) && (
                    <path
                      d="M 10 296 Q 200 282 390 296 L 390 310 L 10 310 Z"
                      fill="#E2E8F0"
                      opacity="0.18"
                    />
                  )}

                  {puzzle.slots.map((slot) => {
                    const isPlaced = Boolean(placedSlots[slot.slotId]);
                    const isActive = activeSlotId === slot.slotId;
                    const fill = isPlaced
                      ? slot.fillColor
                      : isActive
                      ? 'rgba(251, 191, 36, 0.36)'
                      : 'rgba(15, 23, 42, 0.44)';
                    const stroke = isPlaced ? '#0F172A' : isActive ? '#FDE047' : '#FFFFFF';
                    const dash = isPlaced ? undefined : '6 4';

                    return (
                      <g
                        key={slot.slotId}
                        transform={slot.rotation ? `rotate(${slot.rotation} ${slot.x} ${slot.y})` : undefined}
                        onClick={() => handleSlotClick(slot)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const droppedPiece = e.dataTransfer.getData('text/plain') as ShapeId;
                          if (droppedPiece) {
                            tryPlacePiece(slot, droppedPiece);
                          }
                        }}
                        className={isPlaced ? 'cursor-default' : 'cursor-pointer'}
                      >
                        {/* Invisible enlarged touch halo for tablet fingers & LIM pens */}
                        {!isPlaced && (
                          <circle
                            cx={slot.x}
                            cy={slot.y}
                            r={Math.max(26, Math.max(slot.width, slot.height) / 2 + 8)}
                            fill="transparent"
                          />
                        )}

                        {slot.shapeId === 'cerchio' ? (
                          <circle
                            cx={slot.x}
                            cy={slot.y}
                            r={slot.width / 2}
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={isPlaced ? 2.5 : 2.4}
                            strokeDasharray={dash}
                          />
                        ) : (
                          <polygon
                            points={getSlotPolygonPath(slot)}
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={isPlaced ? 2.5 : 2.4}
                            strokeDasharray={dash}
                            strokeLinejoin="round"
                          />
                        )}

                        {!isPlaced && (
                          <text
                            x={slot.x}
                            y={slot.y + 4}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="700"
                            fill="#FFFFFF"
                            stroke="#0F172A"
                            strokeWidth="2.6"
                            paintOrder="stroke"
                            pointerEvents="none"
                          >
                            {slot.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Feedback strip with TTS Ascolta button */}
              <div
                className={`flex flex-wrap items-center justify-between gap-2.5 rounded-xl px-3.5 ${
                  limMode ? 'mt-2.5 py-2 text-sm' : 'mt-4 px-4 py-3 text-sm'
                } ${
                  feedbackStatus === 'ok'
                    ? 'bg-[#083822] text-emerald-50 border border-emerald-400/50'
                    : feedbackStatus === 'err'
                    ? 'bg-red-950 text-red-100 border border-red-400/50'
                    : 'bg-[#083822] text-emerald-50 border border-emerald-300/30'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {isCompleted && <Sparkles className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />}
                  <span className={limMode ? 'line-clamp-2' : ''}>{feedbackMsg}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => speakForKids(feedbackMsg, true)}
                    className={`inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 text-xs font-bold text-slate-950 hover:bg-amber-300 whitespace-nowrap shrink-0 cursor-pointer ${
                      limMode ? 'min-h-[36px] py-1' : 'min-h-[42px] px-3.5 py-2'
                    }`}
                  >
                    <Volume2 className="h-4 w-4" aria-hidden="true" />
                    <span>Ascolta</span>
                  </button>

                  {isCompleted && (
                    <button
                      type="button"
                      onClick={() => selectPuzzle((puzzleIdx + 1) % TANGRAM_PUZZLES.length)}
                      className={`rounded-lg bg-white px-3.5 text-xs font-bold text-slate-950 hover:bg-slate-100 whitespace-nowrap shrink-0 cursor-pointer ${
                        limMode ? 'min-h-[36px] py-1' : 'min-h-[42px] px-4 py-2'
                      }`}
                    >
                      Prossima Costruzione
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Wooden Shape Pieces Tray */}
            <div
              className={`flex flex-col justify-between rounded-2xl border border-slate-300 bg-white md:col-span-5 ${
                limMode ? 'min-h-0 overflow-hidden p-3.5' : 'p-5 sm:p-6'
              }`}
            >
              <div className={limMode ? 'flex-1 min-h-0 flex flex-col' : ''}>
                <div className="flex items-center justify-between gap-2">
                  <h2 className={`font-semibold text-slate-900 ${limMode ? 'text-base' : 'text-lg'}`}>
                    Vassoio delle Forme
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      playClickPop(soundEnabled);
                      setShowLabels((prev) => !prev);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-bold text-slate-900 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer ${
                      limMode ? 'min-h-[34px] py-1' : 'min-h-[40px] px-3 py-1.5'
                    }`}
                  >
                    {showLabels ? (
                      <Eye className="h-3.5 w-3.5 text-slate-700" aria-hidden="true" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                    )}
                    <span>{showLabels ? 'Nomi: Visibili' : 'Nomi: Nascosti'}</span>
                  </button>
                </div>

                {!limMode && (
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                    Tocca una forma decorata qui sotto e poi tocca la sagoma sul disegno (oppure trascinala).
                  </p>
                )}

                <div
                  className={
                    limMode
                      ? 'mt-2.5 grid flex-1 min-h-0 grid-cols-2 lg:grid-cols-3 gap-2 content-start'
                      : 'mt-4 grid grid-cols-2 gap-3'
                  }
                >
                  {puzzle.palette.map((shapeId) => {
                    const def = getShapeById(shapeId);
                    const isSelected = selectedPiece === shapeId;
                    const remainingForShape = puzzle.slots.filter(
                      (s) => s.shapeId === shapeId && !placedSlots[s.slotId]
                    ).length;

                    return (
                      <button
                        key={shapeId}
                        type="button"
                        draggable={remainingForShape > 0}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', shapeId);
                          setSelectedPiece(shapeId);
                        }}
                        disabled={remainingForShape === 0}
                        onClick={() => handlePieceClick(shapeId)}
                        className={`flex flex-col items-center justify-center rounded-xl border-2 transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-default ${
                          limMode ? 'min-h-[96px] gap-1 p-2' : 'min-h-[126px] gap-1.5 p-3'
                        } ${
                          isSelected
                            ? 'border-red-600 bg-red-50 ring-2 ring-red-500/30'
                            : 'border-slate-300 bg-white hover:border-[#0F5132] hover:bg-emerald-50/45'
                        }`}
                      >
                        <ShapeSvg shapeId={shapeId} size={limMode ? 48 : 62} ornamentMode />
                        {showLabels && (
                          <div className="text-center">
                            <span className={`block font-bold text-slate-900 ${limMode ? 'text-xs' : 'text-sm'}`}>
                              {def.name}
                            </span>
                            <span className="block text-[10px] font-semibold text-red-700 leading-tight">
                              {def.christmasObject}
                            </span>
                          </div>
                        )}
                        <span className="font-mono text-[10px] font-semibold text-slate-700 tabular-nums">
                          {remainingForShape > 0
                            ? `Da inserire: ${remainingForShape}`
                            : 'Completato'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                className={`rounded-xl border border-slate-200 bg-slate-50 text-xs leading-relaxed text-slate-700 ${
                  limMode ? 'mt-2 px-3 py-2 text-[11px]' : 'mt-5 p-4'
                }`}
              >
                <strong className="font-semibold text-slate-900">Suggerimento per la LIM:</strong>{' '}
                {limMode
                  ? 'Tocca prima lo spazio sul disegno e poi la figura nel vassoio, oppure apri la Fabbrica Tangram.'
                  : 'I bambini possono toccare prima lo spazio tratteggiato sulla lavagna e poi la figura corrispondente nel vassoio, oppure aprire la Fabbrica Tangram in alto!'}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
