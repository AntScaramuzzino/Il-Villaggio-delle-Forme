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
import { ArrowRight, FileDown, RotateCcw, Star } from 'lucide-react';
import { CHRISTMAS_SHAPES, RIDDLES_BANK, TANGRAM_PUZZLES } from '../data/christmasShapes';
import { ELF_BY_ID } from '../data/elfCharacters';
import { generateElfCertificatePdf } from '../lib/certificatePdf';
import { playClickPop, playSuccessChime } from '../lib/soundFx';
import { speakForKids, useSpeakingElf } from '../lib/ttsVoice';
import { GameSection, WorkshopStats } from '../types/christmasGeometry';
import { ChristmasMedals } from './ChristmasMedals';
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
  const [studentName, setStudentName] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const speakingElf = useSpeakingElf();
  const isStellaSpeaking = speakingElf === 'stella';

  const handleDownloadCertificate = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      await generateElfCertificatePdf({ studentName, stats });
      playSuccessChime(soundEnabled);
      speakForKids(
        `Certificato dell'Elfo Geometra rilasciato da Elfa Stella e scaricato con ${stats.totalStars} stelle!`,
        soundEnabled,
        { elfId: 'stella' }
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const puzzleStars = stats.completedPuzzles.length * 2;
  const riddleStars = stats.solvedRiddles.length;
  const sleighStars = stats.sleighStars;
  const containerMax = limMode ? 'max-w-[1600px]' : 'max-w-[1160px]';

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
      className={`mx-auto ${containerMax} px-3 sm:px-5 ${
        limMode ? 'flex flex-col py-2 md:h-full md:overflow-hidden gap-2' : 'py-3 space-y-3'
      }`}
    >
      {/* Illustrated Workshop Banner Header */}
      <div className={`relative shrink-0 overflow-hidden rounded-xl bg-[#0F5132] text-white ${limMode ? 'px-3.5 py-2.5' : 'px-4 py-3'}`}>
        <ResilientImage
          src="/src/assets/images/christmas_workshop_banner_1794993393827.jpg"
          alt="Officina natalizia del Villaggio delle Forme"
          fallbackTitle="Dashboard dei Progressi"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F5132]/92 via-[#0F5132]/82 to-[#0F5132]/65" aria-hidden="true" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5">
          <div>
            <h1
              className="text-xl sm:text-2xl font-semibold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Dashboard dei Progressi
            </h1>
            {!limMode && (
              <p className="mt-0.5 text-xs text-emerald-100">
                Controlla le stelle raccolte nei giochi del Villaggio delle Forme.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-[#0B3B24]/85 px-2 py-1">
              <div
                className={`h-11 w-11 sm:h-12 sm:w-12 shrink-0 overflow-hidden rounded-xl border-2 border-amber-300 bg-white shadow-sm transition-transform ${
                  isStellaSpeaking ? 'elf-speaking-active' : ''
                }`}
              >
                <ResilientImage
                  src={ELF_BY_ID.stella.portraitSrc}
                  alt={ELF_BY_ID.stella.fullName}
                  fallbackTitle={ELF_BY_ID.stella.shortName}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="hidden sm:block leading-tight">
                <span className="block text-[10px] font-medium text-emerald-200">Rilascia</span>
                <span className="text-[11px] font-bold text-amber-200 whitespace-nowrap">
                  Elfa Stella
                </span>
              </div>
            </div>

            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Nome o classe (opz.)"
              maxLength={40}
              aria-label="Nome alunno o classe per il certificato PDF"
              className="h-[30px] w-36 sm:w-44 rounded-lg border border-white/40 bg-white/95 px-2.5 text-[11px] font-medium text-slate-900 placeholder:text-slate-500 focus:outline-2 focus:outline-amber-300"
            />

            <button
              type="button"
              onClick={handleDownloadCertificate}
              disabled={isGeneratingPdf}
              className="inline-flex min-h-[30px] items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1 text-[11px] font-bold text-slate-950 hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
            >
              <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isGeneratingPdf ? 'Creo PDF...' : 'Certificato PDF'}</span>
            </button>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => {
                  playClickPop(soundEnabled);
                  setConfirmReset(true);
                }}
                className="inline-flex min-h-[30px] items-center gap-1.5 rounded-lg border border-white bg-white px-2.5 py-1 text-[11px] font-bold text-slate-900 hover:bg-amber-50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                <span>Azzera</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2 py-0.5">
                <span className="text-[11px] font-semibold text-red-900">Azzerare?</span>
                <button
                  type="button"
                  onClick={() => {
                    playClickPop(soundEnabled);
                    onResetStats();
                    setConfirmReset(false);
                  }}
                  className="min-h-[26px] rounded-md bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-red-700 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Sì
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="min-h-[26px] rounded-md border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  No
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid shrink-0 grid-cols-2 gap-2.5 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-300 bg-white p-3">
          <span className="text-[11px] font-medium text-slate-600">Stelle Totali</span>
          <div className="mt-0.5 flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-500" aria-hidden="true" />
            <span className="font-mono text-xl font-semibold text-slate-900 tabular-nums">
              {stats.totalStars}
            </span>
          </div>
          {!limMode && (
            <span className="mt-0.5 block text-[11px] text-slate-500">
              Somma di tutti i giochi
            </span>
          )}
        </div>

        <div className="rounded-xl border border-slate-300 bg-white p-3">
          <span className="text-[11px] font-medium text-slate-600">Record Sfida Slitta</span>
          <span className="mt-0.5 block font-mono text-xl font-semibold text-slate-900 tabular-nums">
            {stats.bestSleighScore} pt
          </span>
          <span className="mt-0.5 block text-[11px] text-slate-500 tabular-nums">
            {stats.sleighRoundsCompleted} viaggi completati
          </span>
        </div>

        <div className="rounded-xl border border-slate-300 bg-white p-3">
          <span className="text-[11px] font-medium text-slate-600">Albero & Tangram</span>
          <span className="mt-0.5 block font-mono text-xl font-semibold text-[#0F5132] tabular-nums">
            {stats.completedPuzzles.length}/{TANGRAM_PUZZLES.length}
          </span>
          <span className="mt-0.5 block text-[11px] text-slate-500 tabular-nums">
            {puzzleStars} stelle vinte
          </span>
        </div>

        <div className="rounded-xl border border-slate-300 bg-white p-3">
          <span className="text-[11px] font-medium text-slate-600">Indovinelli & Atlante</span>
          <span className="mt-0.5 block font-mono text-xl font-semibold text-slate-900 tabular-nums">
            {stats.solvedRiddles.length}/{RIDDLES_BANK.length}
          </span>
          <span className="mt-0.5 block text-[11px] text-slate-500 tabular-nums">
            {stats.exploredShapes.length}/{CHRISTMAS_SHAPES.length} forme esplorate
          </span>
        </div>
      </div>

      {/* Empty State Banner when no stars earned yet (compactly replaced by medal progress in LIM mode) */}
      {!hasAnyStars && !limMode && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl border-2 border-amber-300 bg-slate-50 shadow-xs">
              <ResilientImage
                src={ELF_BY_ID.stella.portraitSrc}
                alt={ELF_BY_ID.stella.fullName}
                fallbackTitle={ELF_BY_ID.stella.fullName}
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-semibold text-slate-900">
                Nessuna stella ancora guadagnata
              </h2>
              <p className="text-[11px] text-slate-600">
                Completa una partita su Sfida Slitta, Albero Magico o Indovinelli per riempire il grafico e sbloccare le medaglie.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playClickPop(soundEnabled);
              onNavigate('slitta');
            }}
            className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Gioca ora</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Christmas Medals & Badges unlocked by Total Stars */}
      <ChristmasMedals
        totalStars={stats.totalStars}
        soundEnabled={soundEnabled}
        limMode={limMode}
      />

      {/* Main Chart + Per-Game Summary Grid */}
      <div
        className={`grid grid-cols-1 gap-3 md:grid-cols-12 md:items-stretch ${
          limMode ? 'flex-1 min-h-0' : ''
        }`}
      >
        {/* Left: Recharts Bar Chart */}
        <div className={`flex flex-col justify-between rounded-xl border border-slate-300 bg-white md:col-span-7 ${limMode ? 'p-3 min-h-0' : 'p-3.5 sm:p-4'}`}>
          <div className="shrink-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                Stelle guadagnate per gioco
              </h2>
              <span className="font-mono text-[11px] font-semibold text-slate-600 tabular-nums">
                Totale: {stats.totalStars} stelle
              </span>
            </div>
          </div>

          <div className={`w-full ${limMode ? 'mt-2 flex-1 min-h-[130px]' : 'mt-3 h-[210px]'}`}>
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
          <div className="mt-2.5 flex flex-wrap items-center gap-3.5 border-t border-slate-200 pt-2.5 text-[11px] text-slate-700">
            {chartData.map((item) => (
              <div key={item.id} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-xs"
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
        <div className={`flex flex-col justify-between rounded-xl border border-slate-300 bg-white md:col-span-5 ${limMode ? 'p-3 min-h-0' : 'p-3.5 sm:p-4'}`}>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-900">
              Dettaglio Attività
            </h2>

            <div className="mt-2 divide-y divide-slate-200">
              {chartData.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-2.5 first:pt-0 last:pb-0 ${limMode ? 'py-1.5' : 'py-2.5'}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-2 w-2 shrink-0 rounded-xs"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <span className="text-xs sm:text-[13px] font-semibold text-slate-900">
                        {item.gameName}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-600 truncate">{item.detail}</p>
                    <p className="mt-0.5 font-mono text-[11px] font-semibold text-amber-700 tabular-nums">
                      {item.stars} {item.stars === 1 ? 'stella' : 'stelle'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playClickPop(soundEnabled);
                      onNavigate(item.id);
                    }}
                    className="min-h-[30px] rounded-lg border border-slate-300 bg-white px-3 py-1 text-[11px] font-bold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Gioca
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2.5 shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <div className="flex items-center justify-between gap-2.5">
              <div>
                <span className="block text-xs sm:text-[13px] font-semibold text-slate-900">
                  Atlante delle Forme
                </span>
                <span className="mt-0.5 block text-[11px] text-slate-600 tabular-nums">
                  Studiate: {stats.exploredShapes.length}/{CHRISTMAS_SHAPES.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  playClickPop(soundEnabled);
                  onNavigate('atlante');
                }}
                className="min-h-[30px] rounded-lg bg-[#0F5132] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#14532D] whitespace-nowrap shrink-0 cursor-pointer"
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
