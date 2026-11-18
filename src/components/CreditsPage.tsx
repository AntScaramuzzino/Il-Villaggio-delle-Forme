import React, { useEffect, useState } from 'react';
import { ExternalLink, Globe, HeartHandshake, Sparkles, Square, Volume2 } from 'lucide-react';
import { ELF_CHARACTERS, ElfCharacterId } from '../data/elfCharacters';
import { playClickPop } from '../lib/soundFx';
import { stopSpeaking, toggleSpeakForKids, useSpeakingElf, useSpeakingState } from '../lib/ttsVoice';
import { ResilientImage } from './ResilientImage';
import { ShapeSvg } from './ShapeSvg';

interface CreditsPageProps {
  soundEnabled: boolean;
  limMode?: boolean;
}

const EFT_URL = 'https://www.istruzione.calabria.it/EFT/';

const CREDITS_SPEECH =
  'Crediti del progetto: Missione Natale, Il Villaggio delle Forme, realizzato dai 5 personaggi degli Elfi Equipers dell’Équipe Formativa Territoriale della Calabria: Elfo Alfredo, Elfo Antonio, Elfo Lorenzo, Elfa Rossella ed Elfa Stella.';

export const CreditsPage: React.FC<CreditsPageProps> = ({
  soundEnabled,
  limMode = false
}) => {
  const containerMax = limMode ? 'max-w-[1600px]' : 'max-w-[1160px]';
  const isSpeaking = useSpeakingState();
  const speakingElf = useSpeakingElf();
  const [activeElfId, setActiveElfId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleSpeakElf = (elfId: ElfCharacterId, speech: string) => {
    playClickPop(soundEnabled);
    setActiveElfId(elfId);
    toggleSpeakForKids(speech, { elfId });
  };

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
                Credits · I 5 Personaggi degli Elfi Equipers
              </h1>
              {!limMode && (
                <p className="mt-0.5 text-xs text-emerald-100">
                  Tocca un personaggio per ascoltare la sua presentazione nell’officina geometrica natalizia.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveElfId(null);
                toggleSpeakForKids(CREDITS_SPEECH, { elfId: 'stella' });
              }}
              className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1 text-[11px] font-bold text-slate-950 hover:bg-amber-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isSpeaking && activeElfId === null ? (
                <Square className="h-3 w-3 fill-slate-950" aria-hidden="true" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{isSpeaking && activeElfId === null ? 'Ferma' : 'Ascolta'}</span>
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

      {/* 5 Cartoon Characters Grid: Elfo Alfredo, Elfo Antonio, Elfo Lorenzo, Elfa Rossella, Elfa Stella */}
      <div
        className={`rounded-xl border border-slate-300 bg-white ${
          limMode ? 'flex-1 min-h-0 flex flex-col justify-between p-3.5' : 'p-3.5 sm:p-4 space-y-3'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-900">
              I Nodi e i Personaggi degli “Elfi Equipers”
            </h2>
            <p className="text-[11px] text-slate-600">
              Elfo Antonio, Elfo Alfredo, Elfo Lorenzo, Elfa Stella ed Elfa Rossella ti accompagnano in ogni gioco del Villaggio.
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
          {ELF_CHARACTERS.map((elf) => {
            const isSelected = isSpeaking && (speakingElf === elf.id || activeElfId === elf.id);
            return (
              <button
                key={elf.id}
                type="button"
                onClick={() => handleSpeakElf(elf.id, elf.greetingSpeech)}
                className={`group flex flex-col items-center justify-between rounded-xl border-2 text-center transition-all cursor-pointer hover:shadow-md ${elf.accentBorder} ${elf.accentBg} ${
                  limMode ? 'p-2.5' : 'p-3'
                } ${isSelected ? 'ring-3 ring-amber-400/70' : ''}`}
              >
                <div className="flex flex-col items-center w-full">
                  <div className="relative">
                    <div
                      className={`overflow-hidden rounded-2xl border-2 border-white bg-white shadow-sm transition-transform ${
                        limMode ? 'h-28 w-28' : 'h-32 w-32 sm:h-36 sm:w-36'
                      } ${isSelected ? 'elf-speaking-active' : ''}`}
                    >
                      <ResilientImage
                        src={elf.portraitSrc}
                        alt={`Ritratto fumettistico di ${elf.fullName}`}
                        fallbackTitle={elf.fullName}
                        className="h-full w-full object-cover object-top transition-transform duration-200 group-hover:scale-105"
                      />
                    </div>
                    <div
                      className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-xs"
                      aria-hidden="true"
                    >
                      <ShapeSvg shapeId={elf.shapeId} size={22} ornamentMode />
                    </div>
                  </div>

                  <h3
                    className="mt-3 text-base font-semibold text-slate-900"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {elf.fullName}
                  </h3>
                  <span className="mt-0.5 text-[11px] font-semibold text-[#0F5132]">
                    {elf.specialtyArea}
                  </span>
                </div>

                <div className="mt-2.5 flex w-full flex-col items-center gap-1.5">
                  <span className="inline-block rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700">
                    {elf.badgeLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800">
                    <Volume2 className="h-3 w-3" aria-hidden="true" />
                    <span>{isSelected ? 'Sta parlando...' : 'Tocca per ascoltare'}</span>
                  </span>
                </div>
              </button>
            );
          })}
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
