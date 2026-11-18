import React, { useEffect, useState } from 'react';
import { BookOpen, Check, Copy, Layers, Sparkles, Square, Volume2, Wand2 } from 'lucide-react';
import { playClickPop } from '../lib/soundFx';
import { stopSpeaking, toggleSpeakForKids, useSpeakingState } from '../lib/ttsVoice';

interface CanvasGuidePageProps {
  soundEnabled: boolean;
  limMode?: boolean;
}

const GOOGLE_CANVAS_PROMPT = `Crea un'applicazione web didattica interattiva a tema natalizio per la Scuola Primaria (classi 1ª-5ª) intitolata "Missione Natale: Il Villaggio delle Forme", ottimizzata sia per PC/Tablet sia per la LIM (Lavagna Interattiva Multimediale) in classe.

Struttura e Funzionalità richieste:
1. Quattro modalità di gioco principali + Dashboard progressi:
   - Sfida Slitta: quiz a risposta multipla (8 domande per round, 3 vite, serie di punti e stelle) dove i bambini associano figure geometriche piane e solidi 3D a oggetti natalizi (es. triangolo = punta dell'abete, trapezio = panettone, pentagono = casetta di marzapane, cubo = pacco regalo).
   - Albero Magico & Fabbrica Tangram: due laboratori visivi. Nel primo i bambini incastrano forme geometriche su sagome tratteggiate di scene natalizie; nel secondo manipolano i 7 pezzi del Tangram classico trascinandoli con il dito/mouse, ruotandoli di 45° (o con doppio tocco) e agganciandoli con calamita magnetica.
   - Indovinelli Geometrici: indovinelli su lati, vertici e angoli con indizi progressivi sbloccabili.
   - Atlante delle Forme: schede interattive con filtro per classe, toggle per vertici, angoli retti, assi di simmetria e modalità "Sovrapponi" libera a 360° (trascinamento, rotazione continua 0°-359° e zoom direttamente sull'immagine).
2. Dashboard Progressi & Medaglie:
   - Grafico delle stelle raccolte per gioco e 6 medaglie natalizie sbloccabili a soglie di stelle (Fiocco di Neve, Campanella d'Oro, Alberello Magico, Pacco dei Doni, Renna Polare, Stella Cometa).
3. Accessibilità LIM, Touch e Audio:
   - Pulsante "Modalità LIM" con layout orizzontale senza scorrimento verticale e touch-action: none sui controlli interattivi per evitare conflitti con i gesti del sistema operativo.
   - Effetti sonori generati con Web Audio API e sintesi vocale in italiano (Web Speech API, audio muto all'avvio con pulsante Audio dedicato e bottoni "Ascolta" contestuali).
   - Palette ad alto contrasto (verde pino #0F5132, rosso #DC2626, oro #D97706 su sfondo chiaro #F8FAFC) e leggero effetto nevicata CSS disattivabile.`;

const GUIDE_SPEECH =
  'Istruzioni e guida per Google Canvas. Puoi usare questa app in classe alla LIM attivando la Modalità LIM in alto, oppure copiare il prompt pronto e incollarlo su Gemini con lo strumento Canvas attivo per creare un nuovo gioco didattico personalizzato.';

export const CanvasGuidePage: React.FC<CanvasGuidePageProps> = ({
  soundEnabled,
  limMode = false
}) => {
  const [copied, setCopied] = useState(false);
  const containerMax = limMode ? 'max-w-[1600px]' : 'max-w-[1160px]';
  const isSpeaking = useSpeakingState();

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleCopyPrompt = async () => {
    playClickPop(soundEnabled);
    try {
      await navigator.clipboard.writeText(GOOGLE_CANVAS_PROMPT);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // Clipboard fallback via hidden textarea
      const textarea = document.createElement('textarea');
      textarea.value = GOOGLE_CANVAS_PROMPT;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2400);
      } finally {
        document.body.removeChild(textarea);
      }
    }
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
            Istruzioni & Prompt Google Canvas
          </h1>
          {!limMode && (
            <p className="mt-0.5 text-xs text-slate-700">
              Guida rapida all’uso in classe e prompt pronto per ricreare o adattare un gioco simile in Google Gemini Canvas.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => toggleSpeakForKids(GUIDE_SPEECH)}
          className="inline-flex min-h-[30px] items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1 text-[11px] font-bold text-slate-950 hover:bg-amber-300 whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isSpeaking ? (
            <Square className="h-3 w-3 fill-slate-950" aria-hidden="true" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>{isSpeaking ? 'Ferma' : 'Ascolta'}</span>
        </button>
      </div>

      {/* Two-Column Workbench: Classroom Instructions + Google Canvas Prompt */}
      <div
        className={`grid grid-cols-1 gap-3 md:grid-cols-12 md:items-stretch ${
          limMode ? 'flex-1 min-h-0' : ''
        }`}
      >
        {/* Left: Classroom & Google Canvas Step-by-Step Instructions */}
        <div
          className={`flex flex-col justify-between rounded-xl border border-slate-300 bg-white md:col-span-5 ${
            limMode ? 'p-3 min-h-0 overflow-hidden' : 'p-3.5 sm:p-4 space-y-3'
          }`}
        >
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0F5132] text-white">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <h2 className="text-sm font-semibold text-slate-900">
                Come usare il gioco in classe
              </h2>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-700">
              <li className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                <strong className="font-semibold text-slate-900">1. Scegli la vista:</strong> usa{' '}
                <strong className="text-[#0F5132]">Modalità LIM</strong> per una lavagna orizzontale senza scorrimento oppure Tablet/PC per lo studio individuale.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                <strong className="font-semibold text-slate-900">2. Gestisci audio e neve:</strong> l’audio parte muto per non disturbare la classe; attivalo in alto o usa i bottoni <strong className="text-amber-700">Ascolta</strong>. Puoi anche disattivare la neve dalla barra aula.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                <strong className="font-semibold text-slate-900">3. Manipola le forme:</strong> nel Tangram usa il trascinamento o doppio tocco; nell’Atlante attiva <strong className="text-[#0F5132]">Sovrapponi</strong> per ruotare a 360° direttamente sulle foto.
              </li>
            </ul>
          </div>

          <div className="mt-2.5 rounded-xl border border-emerald-200 bg-emerald-50/75 p-3">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 shrink-0 text-[#0F5132]" aria-hidden="true" />
              <h3 className="text-xs font-bold text-[#0F5132]">
                Ricreare il gioco con Google Canvas (3 passi)
              </h3>
            </div>
            <ol className="mt-1.5 space-y-1 text-[11px] text-slate-800 list-decimal list-inside">
              <li>Apri Gemini e seleziona lo strumento <strong>Canvas</strong> nella barra del prompt.</li>
              <li>Clicca su <strong>Copia Prompt</strong> qui accanto e incollalo nella chat.</li>
              <li>Personalizza tema o disciplina (es. frazioni, verbi, geografia) chiedendo modifiche dirette in Canvas!</li>
            </ol>
          </div>
        </div>

        {/* Right: Copyable Google Canvas Prompt Card */}
        <div
          className={`flex flex-col justify-between rounded-xl bg-[#0F5132] text-white md:col-span-7 ${
            limMode ? 'p-3 min-h-0 overflow-hidden' : 'p-3.5 sm:p-4'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-300" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Prompt pronto per Google Canvas
                </h2>
                <p className="text-[11px] text-emerald-100">
                  Copia questo testo in Gemini Canvas per generare un’app educativa simile.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyPrompt}
              className={`inline-flex min-h-[32px] items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                copied
                  ? 'bg-emerald-300 text-slate-950'
                  : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
              }`}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{copied ? 'Prompt copiato!' : 'Copia Prompt'}</span>
            </button>
          </div>

          <div
            className={`mt-2.5 rounded-xl border border-emerald-300/30 bg-[#083822] p-3 font-mono text-[11px] leading-relaxed text-emerald-50 select-text ${
              limMode ? 'flex-1 min-h-0 overflow-y-auto' : 'max-h-[340px] overflow-y-auto'
            }`}
          >
            <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
              {GOOGLE_CANVAS_PROMPT}
            </pre>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-emerald-100 shrink-0">
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-300" aria-hidden="true" />
              <span>Suggerimento: puoi chiedere a Canvas di cambiare classe, lingua o materia in un solo messaggio.</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
