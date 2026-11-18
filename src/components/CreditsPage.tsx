import React, { useEffect } from 'react';
import { ExternalLink, Globe, HeartHandshake, Sparkles, Square, Volume2 } from 'lucide-react';
import { playClickPop } from '../lib/soundFx';
import { stopSpeaking, toggleSpeakForKids, useSpeakingState } from '../lib/ttsVoice';
import { ShapeId } from '../types/christmasGeometry';
import { ResilientImage } from './ResilientImage';
import { ShapeSvg } from './ShapeSvg';

interface CreditsPageProps {
  soundEnabled: boolean;
  limMode?: boolean;
}

interface ElfEquiperNode {
  name: string;
  role: string;
  shapeId: ShapeId;
  badgeLabel: string;
  accentBorder: string;
  accentBg: string;
}

const ELFI_EQUIPERS: ElfEquiperNode[] = [
  {
    name: 'Alfredo',
    role: 'Nodo Elfo Equipers',
    shapeId: 'triangolo',
    badgeLabel: 'Geometria & Logica',
    accentBorder: 'border-emerald-300',
    accentBg: 'bg-emerald-50/70'
  },
  {
    name: 'Antonio',
    role: 'Nodo Elfo Equipers',
    shapeId: 'quadrato',
    badgeLabel: 'Coding & Interazione',
    accentBorder: 'border-amber-300',
    accentBg: 'bg-amber-50/70'
  },
  {
    name: 'Lorenzo',
    role: 'Nodo Elfo Equipers',
    shapeId: 'esagono',
    badgeLabel: 'Tangram & Design',
    accentBorder: 'border-teal-300',
    accentBg: 'bg-teal-50/70'
  },
  {
    name: 'Rossella',
    role: 'Nodo Elfo Equipers',
    shapeId: 'rombo',
    badgeLabel: 'Didattica Primaria',
    accentBorder: 'border-sky-300',
    accentBg: 'bg-sky-50/70'
  },
  {
    name: 'Stella',
    role: 'Nodo Elfo Equipers',
    shapeId: 'stella',
    badgeLabel: 'Creatività & LIM',
    accentBorder: 'border-yellow-400',
    accentBg: 'bg-yellow-50/80'
  }
];

const EFT_URL = 'https://www.istruzione.calabria.it/EFT/';

const CREDITS_SPEECH =
  'Crediti del progetto: Missione Natale, Il Villaggio delle Forme, realizzato dai nodi degli Elfi Equipers dell’Équipe Formativa Territoriale della Calabria: Alfredo, Antonio, Lorenzo, Rossella e Stella.';

export const CreditsPage: React.FC<CreditsPageProps> = ({
  soundEnabled,
  limMode = false
}) => {
  const containerMax = limMode ? 'max-w-[1600px]' : 'max-w-[1160px]';
  const isSpeaking = useSpeakingState();

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  return (
    <section
      className={`mx-auto ${containerMax} px-3 sm:px-5 ${
        limMode ? 'flex flex-col py-2 md:h-full md:overflow-hidden gap-2.5' : 'py-3 space-y-3'
      }`}
    >
      {/* Festive EFT Calabria Header Banner */}
      <div
        className={`relative shrink-0 overflow-hidden rounded-xl bg-[#0F5132] text-white ${
          limMode ? 'px-4 py-3' : 'px-4 py-3.5 sm:px-5'
        }`}
      >
        <ResilientImage
          src="/src/assets/images/bg_starry_winter_sky_1794994127354.jpg"
          alt="Cielo stellato d'inverno sullo sfondo dei crediti"
          fallbackTitle="Elfi Equipers EFT Calabria"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#0F5132]/95 via-[#0F5132]/85 to-[#0B3B24]/75"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 rounded-xl bg-white p-1.5 shadow-sm">
              <img
                src="/assets/aistudio/LOGO_EFT_Calabria_trasparente_29afe73d.png"
                alt="Logo Équipe Formativa Territoriale Calabria"
                className="h-10 w-auto sm:h-11 object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-200">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                <span>Équipe Formativa Territoriale della Calabria</span>
              </span>
              <h1
                className="text-xl sm:text-2xl font-semibold text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Credits · Gli Elfi Equipers
              </h1>
              {!limMode && (
                <p className="mt-0.5 text-xs text-emerald-100">
                  I nodi territoriali che hanno ideato e curato l’officina geometrica natalizia per la Scuola Primaria.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => toggleSpeakForKids(CREDITS_SPEECH)}
              className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1 text-[11px] font-bold text-slate-950 hover:bg-amber-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isSpeaking ? (
                <Square className="h-3 w-3 fill-slate-950" aria-hidden="true" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{isSpeaking ? 'Ferma' : 'Ascolta'}</span>
            </button>

            <a
              href={EFT_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playClickPop(soundEnabled)}
              className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-white/40 bg-white px-3 py-1 text-[11px] font-bold text-[#0F5132] hover:bg-emerald-50 whitespace-nowrap shrink-0"
            >
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Portale EFT Calabria</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* 5 Nodes Grid: Alfredo, Antonio, Lorenzo, Rossella, Stella */}
      <div
        className={`rounded-xl border border-slate-300 bg-white ${
          limMode ? 'flex-1 min-h-0 flex flex-col justify-between p-3.5' : 'p-3.5 sm:p-4 space-y-3'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-900">
              I Nodi degli “Elfi Equipers”
            </h2>
            <p className="text-[11px] text-slate-600">
              Cinque nodi di innovazione digitale e didattica nella bottega dell’Équipe Formativa Calabria.
            </p>
          </div>
          <span className="font-mono text-[11px] font-semibold text-[#0F5132] tabular-nums">
            5 Elfi · EFT Calabria
          </span>
        </div>

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 ${
            limMode ? 'my-auto' : ''
          }`}
        >
          {ELFI_EQUIPERS.map((elf) => (
            <div
              key={elf.name}
              className={`flex flex-col items-center justify-between rounded-xl border-2 text-center transition-colors ${elf.accentBorder} ${elf.accentBg} ${
                limMode ? 'p-3' : 'p-3.5'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white bg-white shadow-xs">
                  <ShapeSvg shapeId={elf.shapeId} size={50} ornamentMode />
                </div>
                <h3
                  className="mt-2.5 text-base font-semibold text-slate-900"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {elf.name}
                </h3>
                <span className="mt-0.5 text-[11px] font-semibold text-[#0F5132]">
                  {elf.role}
                </span>
              </div>

              <span className="mt-2.5 inline-block rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700">
                {elf.badgeLabel}
              </span>
            </div>
          ))}
        </div>

        {/* Official EFT Calabria Portal Card */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2.5 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <HeartHandshake className="h-4 w-4 shrink-0 text-[#0F5132]" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900">
                Scopri i progetti e la formazione dell’Équipe Formativa Territoriale Calabria
              </p>
              <a
                href={EFT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate font-mono text-[11px] font-medium text-[#0F5132] underline hover:text-red-700"
              >
                {EFT_URL}
              </a>
            </div>
          </div>

          <a
            href={EFT_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playClickPop(soundEnabled)}
            className="inline-flex min-h-[30px] items-center gap-1.5 rounded-lg bg-[#0F5132] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#14532D] whitespace-nowrap shrink-0"
          >
            <span>Visita il sito EFT</span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
};
