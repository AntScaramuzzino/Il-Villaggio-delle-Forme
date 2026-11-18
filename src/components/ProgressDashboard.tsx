import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { ArrowRight, RotateCcw, Star } from 'lucide-react';
import { CHRISTMAS_SHAPES, RIDDLES_BANK, TANGRAM_PUZZLES } from '../data/christmasShapes';
import { playClickPop } from '../lib/soundFx';
import { GameSection, WorkshopStats } from '../types/christmasGeometry';
import { ResilientImage } from './ResilientImage';

interface ProgressDashboardProps {
  stats: WorkshopStats;
  soundEnabled: boolean;
  onNavigate: (section: GameSection) => void;
  onResetStats: () => void;
  limMode?: boolean;
}

interface GameChartDatum {
  id: GameSection;
  gameName: string;
  stars: number;
  detail: string;
  color: string;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  stats,
  soundEnabled,
  onNavigate,
  onResetStats,
  limMode = false
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  const puzzleStars = stats.completedPuzzles.length * 2;
  const riddleStars = stats.solvedRiddles.length;
  const sleighStars = stats.sleighStars;
  const containerMax = limMode ? 'max-w-[1600px]' : 'max-w-[1200px]';

  const chartData: GameChartDatum[] = useMemo(
    () => [
      {
        id: 'slitta',
        gameName: 'Sfida Slitta',
        stars: sleighStars,
        detail: `${stats.sleighRoundsCompleted} viaggi completati · Record ${stats.bestSleighScore} pt`,
        color: '#DC2626'
      },
      {
        id: 'albero',
        gameName: 'Tangram & Scene',
        stars: puzzleStars,
        detail: `${stats.completedPuzzles.length}/${TANGRAM_PUZZLES.length} costruzioni completate`,
        color: '#0F5132'
      },
      {
        id: 'indovinelli',
        gameName: 'Indovinelli',
        stars: riddleStars,
        detail: `${stats.solvedRiddles.length}/${RIDDLES_BANK.length} indovinelli risolti`,
        color: '#D97706'
      }
    ],
    [
      sleighStars,
      puzzleStars,
      riddleStars,
      stats.sleighRoundsCompleted,
      stats.bestSleighScore,
      stats.completedPuzzles.length,
      stats.solvedRiddles.length
    ]
  );

  const hasAnyStars = stats.totalStars > 0;
  const yMax = Math.max(6, ...chartData.map((d) => d.stars + 1));

  return (
    <section
      className={`mx-auto ${containerMax} px-4 sm:px-6 ${
        limMode ? 'flex flex-col py-3 md:h-full md:overflow-hidden gap-3' : 'py-5'
      }`}
    >
      {/* Illustrated Workshop Banner Header */}
      <div className={`relative shrink-0 overflow-hidden rounded-2xl bg-[#0F5132] text-white ${limMode ? 'px-5 py-3.5' : 'p-6'}`}>
        <ResilientImage
          src="/src/assets/images/christmas_workshop_banner_1794993393827.jpg"
          alt="Officina natalizia del Villaggio delle Forme"
          fallbackTitle="Dashboard dei Progressi"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F5132]/92 via-[#0F5132]/82 to-[#0F5132]/65" aria-hidden="true" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1
              className={`font-semibold text-white ${limMode ? 'text-2xl sm:text-3xl' : 'text-2xl sm:text-3xl'}`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Dashboard dei Progressi della Classe
            </h1>
            {!limMode && (
              <p className="mt-1 text-sm text-emerald-100">
                Controlla quante stelle hai raccolto in ciascun gioco del Villaggio delle Forme.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => {
                  playClickPop(soundEnabled);
                  setConfirmReset(true);
                }}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-white bg-white px-3.5 py-1.5 text-xs font-bold text-slate-900 hover:bg-amber-50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Azzera Progressi</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5">
                <span className="text-xs font-semibold text-red-900">Confermi azzeramento?</span>
                <button
                  type="button"
                  onClick={() => {
                    playClickPop(soundEnabled);
                    onResetStats();
                    setConfirmReset(false);
                  }}
                  className="min-h-[34px] rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Sì, azzera
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="min-h-[34px] rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Annulla
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className={`grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 ${limMode ? '' : 'mt-5 gap-4'}`}>
        <div className={`rounded-xl border border-slate-300 bg-white ${limMode ? 'p-3.5' : 'p-5'}`}>
          <span className="text-xs font-medium text-slate-600">Stelle Totali</span>
          <div className="mt-1 flex items-center gap-2">
            <Star className="h-5 w-5 fill-amber-400 text-amber-500" aria-hidden="true" />
            <span className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {stats.totalStars}
            </span>
          </div>
          {!limMode && (
            <span className="mt-1 block text-xs text-slate-500">
              Somma di tutti i giochi
            </span>
          )}
        </div>

        <div className={`rounded-xl border border-slate-300 bg-white ${limMode ? 'p-3.5' : 'p-5'}`}>
          <span className="text-xs font-medium text-slate-600">Record Sfida Slitta</span>
          <span className="mt-1 block font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {stats.bestSleighScore} pt
          </span>
          <span className="mt-0.5 block text-xs text-slate-500 tabular-nums">
            {stats.sleighRoundsCompleted} viaggi completati
          </span>
        </div>

        <div className={`rounded-xl border border-slate-300 bg-white ${limMode ? 'p-3.5' : 'p-5'}`}>
          <span className="text-xs font-medium text-slate-600">Costruzioni Albero Magico</span>
          <span className="mt-1 block font-mono text-2xl font-semibold text-[#0F5132] tabular-nums">
            {stats.completedPuzzles.length}/{TANGRAM_PUZZLES.length}
          </span>
          <span className="mt-0.5 block text-xs text-slate-500 tabular-nums">
            {puzzleStars} stelle vinte (2 per scena)
          </span>
        </div>

        <div className={`rounded-xl border border-slate-300 bg-white ${limMode ? 'p-3.5' : 'p-5'}`}>
          <span className="text-xs font-medium text-slate-600">Indovinelli e Atlante</span>
          <span className="mt-1 block font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {stats.solvedRiddles.length}/{RIDDLES_BANK.length}
          </span>
          <span className="mt-0.5 block text-xs text-slate-500 tabular-nums">
            {stats.exploredShapes.length}/{CHRISTMAS_SHAPES.length} forme esplorate
          </span>
        </div>
      </div>

      {/* Empty State Banner when no stars earned yet */}
      {!hasAnyStars && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-300 bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <ResilientImage
                src="/src/assets/images/elf_craftsman_avatar_1794993394306.jpg"
                alt="Elfo Pino"
                fallbackTitle="Elfo Pino"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Nessuna stella ancora guadagnata
              </h2>
              <p className="mt-0.5 text-sm text-slate-600">
                Completa una partita su Sfida Slitta, assembla una scena in Albero Magico o risolvi
                un Indovinello per vedere crescere le colonne del grafico!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playClickPop(soundEnabled);
              onNavigate('slitta');
            }}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Inizia a Giocare</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Main Chart + Per-Game Summary Grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-12 md:items-stretch ${
          limMode ? 'flex-1 min-h-0 gap-4' : 'mt-5 gap-6'
        }`}
      >
        {/* Left: Recharts Bar Chart */}
        <div className={`flex flex-col justify-between rounded-2xl border border-slate-300 bg-white md:col-span-7 ${limMode ? 'p-4 min-h-0' : 'p-6'}`}>
          <div className="shrink-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className={`font-semibold text-slate-900 ${limMode ? 'text-lg' : 'text-lg'}`}>
                Stelle guadagnate in ogni gioco
              </h2>
              <span className="font-mono text-xs font-semibold text-slate-600 tabular-nums">
                Totale: {stats.totalStars} stelle
              </span>
            </div>
            {!limMode && (
              <p className="mt-1 text-xs text-slate-500">
                Confronto tra Sfida Slitta, Tangram & Scene e Indovinelli Geometrici.
              </p>
            )}
          </div>

          <div className={`w-full ${limMode ? 'mt-2 flex-1 min-h-[180px]' : 'mt-5 h-[290px]'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 12, right: 16, left: -12, bottom: 8 }}
                barCategoryGap="28%"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" />
                <XAxis
                  dataKey="gameName"
                  tick={{ fill: '#1E293B', fontSize: limMode ? 14 : 12, fontWeight: 600 }}
                  axisLine={{ stroke: '#94A3B8' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, yMax]}
                  tick={{ fill: '#475569', fontSize: limMode ? 14 : 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const datum = payload[0].payload as GameChartDatum;
                    return (
                      <div className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 shadow-sm">
                        <p className="text-xs font-semibold text-slate-900">{datum.gameName}</p>
                        <p className="mt-1 font-mono text-sm font-semibold text-amber-600 tabular-nums">
                          {datum.stars} {datum.stars === 1 ? 'stella' : 'stelle'}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-600">{datum.detail}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="stars" name="Stelle" radius={[8, 8, 0, 0]} maxBarSize={76}>
                  {chartData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-5 border-t border-slate-200 pt-4 text-xs text-slate-700">
            {chartData.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-xs"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                <span>{item.gameName}</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {item.stars}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Detailed Per-Game Progress List */}
        <div className={`flex flex-col justify-between rounded-2xl border border-slate-300 bg-white md:col-span-5 ${limMode ? 'p-4 min-h-0' : 'p-6'}`}>
          <div>
            <h2 className={`font-semibold text-slate-900 ${limMode ? 'text-lg' : 'text-lg'}`}>
              Dettaglio Attività
            </h2>
            {!limMode && (
              <p className="mt-1 text-xs text-slate-600">
                Scegli un gioco per guadagnare nuove stelle.
              </p>
            )}

            <div className={`divide-y divide-slate-200 ${limMode ? 'mt-2.5' : 'mt-5'}`}>
              {chartData.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-4 first:pt-0 last:pb-0 ${limMode ? 'py-2.5' : 'py-4'}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 shrink-0 rounded-xs"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-semibold text-slate-900">
                        {item.gameName}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600">{item.detail}</p>
                    <p className="mt-0.5 font-mono text-xs font-semibold text-amber-700 tabular-nums">
                      {item.stars} {item.stars === 1 ? 'stella guadagnata' : 'stelle guadagnate'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playClickPop(soundEnabled);
                      onNavigate(item.id);
                    }}
                    className="min-h-[40px] rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Gioca
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={`shrink-0 rounded-xl border border-slate-200 bg-slate-50 ${limMode ? 'mt-3 p-3' : 'mt-6 p-4'}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="block text-sm font-semibold text-slate-900">
                  Atlante delle Forme
                </span>
                <span className="mt-0.5 block text-xs text-slate-600 tabular-nums">
                  Forme studiate: {stats.exploredShapes.length} su {CHRISTMAS_SHAPES.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  playClickPop(soundEnabled);
                  onNavigate('atlante');
                }}
                className="min-h-[40px] rounded-lg bg-[#0F5132] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#14532D] whitespace-nowrap shrink-0 cursor-pointer"
              >
                Esplora
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
