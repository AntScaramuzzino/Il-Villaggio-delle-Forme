import React from 'react';
import { CheckCircle2, Lock, Star } from 'lucide-react';
import { playClickPop } from '../lib/soundFx';
import { speakForKids } from '../lib/ttsVoice';

export interface ChristmasMedal {
  id: string;
  title: string;
  requiredStars: number;
  subtitle: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
}

export const CHRISTMAS_MEDALS: ChristmasMedal[] = [
  {
    id: 'fiocco',
    title: 'Fiocco di Neve',
    requiredStars: 3,
    subtitle: 'Primi passi nella bottega',
    accentBg: 'bg-sky-50',
    accentBorder: 'border-sky-300',
    accentText: 'text-sky-800'
  },
  {
    id: 'campanella',
    title: 'Campanella d’Oro',
    requiredStars: 8,
    subtitle: 'Esploratore curioso',
    accentBg: 'bg-amber-50',
    accentBorder: 'border-amber-300',
    accentText: 'text-amber-800'
  },
  {
    id: 'alberello',
    title: 'Alberello Magico',
    requiredStars: 15,
    subtitle: 'Costruttore di forme',
    accentBg: 'bg-emerald-50',
    accentBorder: 'border-emerald-300',
    accentText: 'text-emerald-900'
  },
  {
    id: 'pacco',
    title: 'Pacco dei Doni',
    requiredStars: 25,
    subtitle: 'Aiutante degli elfi',
    accentBg: 'bg-red-50',
    accentBorder: 'border-red-300',
    accentText: 'text-red-800'
  },
  {
    id: 'renna',
    title: 'Renna Polare',
    requiredStars: 40,
    subtitle: 'Guida della slitta',
    accentBg: 'bg-orange-50',
    accentBorder: 'border-orange-300',
    accentText: 'text-orange-900'
  },
  {
    id: 'cometa',
    title: 'Stella Cometa',
    requiredStars: 60,
    subtitle: 'Maestro della geometria',
    accentBg: 'bg-yellow-50',
    accentBorder: 'border-yellow-400',
    accentText: 'text-yellow-900'
  }
];

const MedalArt: React.FC<{ id: string; unlocked: boolean; size?: number }> = ({
  id,
  unlocked,
  size = 34
}) => {
  const muted = !unlocked;

  if (id === 'fiocco') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        <g
          stroke={muted ? '#94A3B8' : '#0284C7'}
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        >
          <line x1="20" y1="4" x2="20" y2="36" />
          <line x1="6.1" y1="12" x2="33.9" y2="28" />
          <line x1="33.9" y1="12" x2="6.1" y2="28" />
          <polyline points="16,8 20,12 24,8" />
          <polyline points="16,32 20,28 24,32" />
          <polyline points="9,16 13,16 11,11" />
          <polyline points="31,24 27,24 29,29" />
          <polyline points="29,11 27,16 31,16" />
          <polyline points="11,29 13,24 9,24" />
        </g>
        <circle cx="20" cy="20" r="3" fill={muted ? '#CBD5E1' : '#38BDF8'} />
      </svg>
    );
  }

  if (id === 'campanella') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="7" r="2.6" fill={muted ? '#94A3B8' : '#B45309'} />
        <path
          d="M 11 27 C 11 16 14 10 20 10 C 26 10 29 16 29 27 L 33 30 L 7 30 Z"
          fill={muted ? '#E2E8F0' : '#FBBF24'}
          stroke={muted ? '#94A3B8' : '#92400E'}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="33" r="3" fill={muted ? '#94A3B8' : '#DC2626'} />
        {!muted && (
          <path d="M 16 15 Q 15 20 15 24" stroke="#FEF3C7" strokeWidth="2" strokeLinecap="round" fill="none" />
        )}
      </svg>
    );
  }

  if (id === 'alberello') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        <rect x="17" y="30" width="6" height="6" rx="1" fill={muted ? '#94A3B8' : '#78350F'} />
        <polygon
          points="20,5 30,17 25,17 32,25 26,25 34,31 6,31 14,25 8,25 15,17 10,17"
          fill={muted ? '#E2E8F0' : '#15803D'}
          stroke={muted ? '#94A3B8' : '#0F5132'}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="5.5" r="2.6" fill={muted ? '#CBD5E1' : '#FACC15'} />
        {!muted && (
          <>
            <circle cx="17" cy="21" r="2" fill="#EF4444" />
            <circle cx="23" cy="26" r="2" fill="#FACC15" />
            <circle cx="15" cy="28" r="1.8" fill="#38BDF8" />
          </>
        )}
      </svg>
    );
  }

  if (id === 'pacco') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        <rect
          x="8"
          y="14"
          width="24"
          height="20"
          rx="3"
          fill={muted ? '#E2E8F0' : '#DC2626'}
          stroke={muted ? '#94A3B8' : '#991B1B'}
          strokeWidth="2"
        />
        <rect
          x="6.5"
          y="12"
          width="27"
          height="6"
          rx="2"
          fill={muted ? '#CBD5E1' : '#EF4444'}
          stroke={muted ? '#94A3B8' : '#991B1B'}
          strokeWidth="1.8"
        />
        <rect x="17.5" y="12" width="5" height="22" fill={muted ? '#94A3B8' : '#FACC15'} />
        <path
          d="M 20 12 C 15 6 11 9 14 12 Z M 20 12 C 25 6 29 9 26 12 Z"
          fill={muted ? '#CBD5E1' : '#FDE047'}
          stroke={muted ? '#94A3B8' : '#B45309'}
          strokeWidth="1.6"
        />
      </svg>
    );
  }

  if (id === 'renna') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        {/* Antlers */}
        <path
          d="M 14 13 L 10 5 M 12 9 L 7 9 M 13 10 L 15 6 M 26 13 L 30 5 M 28 9 L 33 9 M 27 10 L 25 6"
          stroke={muted ? '#94A3B8' : '#78350F'}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Ears */}
        <ellipse cx="11" cy="17" rx="3.5" ry="2.2" transform="rotate(-25 11 17)" fill={muted ? '#CBD5E1' : '#B45309'} />
        <ellipse cx="29" cy="17" rx="3.5" ry="2.2" transform="rotate(25 29 17)" fill={muted ? '#CBD5E1' : '#B45309'} />
        {/* Head */}
        <ellipse
          cx="20"
          cy="22"
          rx="9"
          ry="10"
          fill={muted ? '#E2E8F0' : '#D97706'}
          stroke={muted ? '#94A3B8' : '#78350F'}
          strokeWidth="2"
        />
        {/* Muzzle */}
        <ellipse cx="20" cy="27" rx="6" ry="4.5" fill={muted ? '#F1F5F9' : '#FDE68A'} />
        {/* Eyes */}
        <circle cx="16.5" cy="19.5" r="1.5" fill={muted ? '#94A3B8' : '#0F172A'} />
        <circle cx="23.5" cy="19.5" r="1.5" fill={muted ? '#94A3B8' : '#0F172A'} />
        {/* Rudolph glowing red nose */}
        <circle cx="20" cy="25.5" r="3" fill={muted ? '#94A3B8' : '#DC2626'} />
      </svg>
    );
  }

  // Stella Cometa
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <path
        d="M 24 14 Q 31 12 36 8 Q 32 17 26 21 Z"
        fill={muted ? '#CBD5E1' : '#FDE047'}
        opacity="0.85"
      />
      <path
        d="M 22 21 Q 30 22 35 19 Q 29 27 22 27 Z"
        fill={muted ? '#E2E8F0' : '#FBBF24'}
        opacity="0.75"
      />
      <polygon
        points="16,6 19.2,13.2 27,14 21,19.2 22.8,27 16,22.8 9.2,27 11,19.2 5,14 12.8,13.2"
        fill={muted ? '#E2E8F0' : '#FACC15'}
        stroke={muted ? '#94A3B8' : '#B45309'}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="17.5" r="2.6" fill={muted ? '#CBD5E1' : '#FFFFFF'} opacity="0.8" />
    </svg>
  );
};

interface ChristmasMedalsProps {
  totalStars: number;
  soundEnabled: boolean;
  limMode?: boolean;
}

export const ChristmasMedals: React.FC<ChristmasMedalsProps> = ({
  totalStars,
  soundEnabled,
  limMode = false
}) => {
  const unlockedCount = CHRISTMAS_MEDALS.filter((m) => totalStars >= m.requiredStars).length;
  const nextMedal = CHRISTMAS_MEDALS.find((m) => totalStars < m.requiredStars) ?? null;
  const maxStars = CHRISTMAS_MEDALS[CHRISTMAS_MEDALS.length - 1].requiredStars;
  const overallProgressPct = Math.min(100, Math.round((totalStars / maxStars) * 100));

  const handleMedalClick = (medal: ChristmasMedal, unlocked: boolean) => {
    playClickPop(soundEnabled);
    const msg = unlocked
      ? `Medaglia ${medal.title} sbloccata! ${medal.subtitle}.`
      : `Medaglia ${medal.title}: servono ${medal.requiredStars} stelle. Te ne mancano ${medal.requiredStars - totalStars}!`;
    speakForKids(msg, soundEnabled, { elfId: 'stella' });
  };

  return (
    <div
      className={`shrink-0 rounded-xl border border-slate-300 bg-white ${
        limMode ? 'p-2.5' : 'p-3.5 sm:p-4'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-semibold text-slate-900">
            Medaglie di Natale
          </h2>
          <span className="font-mono text-[11px] font-bold text-[#0F5132] tabular-nums">
            {unlockedCount}/{CHRISTMAS_MEDALS.length}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-medium text-slate-600 tabular-nums">
            {nextMedal
              ? `Prossima: ${nextMedal.title} (-${nextMedal.requiredStars - totalStars} ★)`
              : 'Tutte le medaglie sbloccate!'}
          </span>
          <div
            className="hidden sm:block h-2 w-24 overflow-hidden rounded-full bg-slate-200"
            aria-label={`Avanzamento medaglie ${overallProgressPct}%`}
          >
            <div
              className="h-full bg-[#0F5132] transition-all duration-300"
              style={{ width: `${overallProgressPct}%` }}
            />
          </div>
        </div>
      </div>

      <div
        className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 ${
          limMode ? 'mt-1.5 gap-1.5' : 'mt-2.5 gap-2'
        }`}
      >
        {CHRISTMAS_MEDALS.map((medal) => {
          const unlocked = totalStars >= medal.requiredStars;
          const remaining = Math.max(0, medal.requiredStars - totalStars);
          return (
            <button
              key={medal.id}
              type="button"
              onClick={() => handleMedalClick(medal, unlocked)}
              className={`group flex items-center gap-2 rounded-xl border text-left transition-colors cursor-pointer ${
                limMode ? 'p-1.5' : 'flex-col justify-center p-2.5 text-center'
              } ${
                unlocked
                  ? `${medal.accentBorder} ${medal.accentBg}`
                  : 'border-slate-200 bg-slate-50/75 hover:border-slate-300'
              }`}
            >
              <div
                className={`relative flex shrink-0 items-center justify-center rounded-xl border ${
                  limMode ? 'h-9 w-9' : 'h-11 w-11'
                } ${
                  unlocked
                    ? 'border-white/90 bg-white shadow-xs'
                    : 'border-dashed border-slate-300 bg-white/70 opacity-75'
                }`}
              >
                <MedalArt id={medal.id} unlocked={unlocked} size={limMode ? 26 : 32} />
                {unlocked ? (
                  <CheckCircle2
                    className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-white text-emerald-600"
                    aria-hidden="true"
                  />
                ) : (
                  <Lock
                    className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-white p-0.5 text-slate-400"
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="min-w-0">
                <span
                  className={`block truncate text-[11px] font-bold ${
                    unlocked ? medal.accentText : 'text-slate-600'
                  }`}
                >
                  {medal.title}
                </span>
                <span
                  className={`mt-0.5 inline-flex items-center gap-0.5 font-mono text-[10px] font-semibold tabular-nums ${
                    unlocked ? 'text-amber-700' : 'text-slate-500'
                  }`}
                >
                  <Star
                    className={`h-2.5 w-2.5 ${
                      unlocked ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
                    }`}
                    aria-hidden="true"
                  />
                  {unlocked
                    ? `${medal.requiredStars} ★ · Presa`
                    : `${medal.requiredStars} ★ (-${remaining})`}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
