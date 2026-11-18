import React, { useEffect, useState } from 'react';
import { BookOpen, Check, Copy, Layers, Sparkles, Square, Volume2, Wand2 } from 'lucide-react';
import { ELF_BY_ID } from '../data/elfCharacters';
import { playClickPop } from '../lib/soundFx';
import { stopSpeaking, toggleSpeakForKids, useSpeakingElf, useSpeakingState } from '../lib/ttsVoice';
import { ResilientImage } from './ResilientImage';

interface CanvasGuidePageProps {
  soundEnabled: boolean;
  limMode?: boolean;
}

type PromptTier = 'simple' | 'advanced';

const SIMPLE_PROMPT = `Crea un'applicazione web didattica a tema natalizio per la Scuola Primaria (classi 1ª–5ª) intitolata "Missione Natale: Il Villaggio delle Forme", utilizzabile sia su PC/Tablet sia alla LIM in classe.

Funzionalità essenziali:
1. Quattro attività di geometria:
   - Sfida Slitta: quiz da 8 domande (3 vite, punti e stelle) per riconoscere figure piane e solidi 3D associati a oggetti di Natale.
   - Albero Magico & Tangram: scene natalizie da completare incastrando le figure e laboratorio Tangram da 7 pezzi trascinabili e ruotabili di 45°.
   - Indovinelli Geometrici: indovinelli su lati e vertici con 2 indizi progressivi.
   - Atlante delle Forme: schede visive con proprietà geometriche e confronto con oggetti natalizi.
2. Dashboard Progressi con grafico delle stelle raccolte, medaglie natalizie sbloccabili e attestato finale stampabile.
3. Interfaccia ad alto contrasto (verde pino, rosso Natale, oro su sfondo chiaro), pulsante "Modalità LIM" senza scorrimento, nevicata leggera disattivabile e sintesi vocale in italiano con pulsante Audio (muto all'avvio).`;

const ADVANCED_AI_STUDIO_PROMPT = `Realizza un'applicazione web educativa completa in React, TypeScript e Tailwind CSS per la Scuola Primaria (classi 1ª–5ª) intitolata "Missione Natale: Il Villaggio delle Forme" (progetto Xmas Lab · EFT Calabria), progettata con massima cura per Desktop, Tablet e LIM (Lavagna Interattiva Multimediale).

1. ARCHITETTURA E ATTIVITÀ DIDATTICHE (4 Giochi + Atlante + Dashboard + Istruzioni + Credits):
   - Sfida Slitta: round da 8 domande a scelta multipla con 3 vite, serie consecutiva, record e 1–3 stelle. Classi filtrabili: 1ª–2ª Base (triangolo, quadrato, rettangolo, cerchio, stella), 3ª–4ª Poligoni (rombo, trapezio, pentagono, esagono, ottagono), 5ª Solidi 3D (cubo, sfera, cono, cilindro). Rispetta rigorosamente gli articoli grammaticali italiani nei feedback vocali e testuali (es. "la punta dell'abete", "la casetta di marzapane").
   - Albero Magico & Fabbrica Tangram:
     * Modalità Scene (8 costruzioni natalizie): incastro guidato tap-to-place e drag-and-drop con sagome tratteggiate, etichette disattivabili e aiuti.
     * Modalità Fabbrica Tangram (7 pezzi classici SVG ad alta precisione): trascinamento libero con puntatore/dito, rotazione ±45° (bottoni + doppio tocco sul pezzo), Capovolgi, calamita magnetica in modalità libera e 7 modelli natalizi con calamita di incastro.
   - Indovinelli Geometrici: banca di indovinelli su lati, vertici, angoli retti e solidi, 2 indizi progressivi sbloccabili e spiegazione didattica finale.
   - Atlante delle Forme (14 schede illustrate): toggle interattivi per mostrare Vertici, Angoli Retti, Assi di Simmetria e versione Ornamento/Piana. Include 3 modalità di vista ("Affianca Forma", "Sovrapponi", "Solo Scena"): la modalità "Sovrapponi" sblocca la manipolazione diretta a 360° sull'immagine senza finestra (trascinamento libero, maniglia orbitale 0°–359°, slider continuo, zoom +/-, velo trasparente).

2. PERSONAGGI FUMETTISTICI, AUDIO WEB AUDIO & 5 VOCI ITALIANE:
   - Inserisci 5 personaggi fumettistici ("Elfi Equipers"): Elfo Antonio (Sfida Slitta), Elfo Alfredo (Atlante), Elfo Lorenzo (Albero & Tangram), Elfa Rossella (Indovinelli), Elfa Stella (Benvenuto, Dashboard e Certificati).
   - Sintesi vocale Web Speech API in italiano con 5 profili vocali distinti per genere (voci maschili per Antonio, Alfredo, Lorenzo; voci femminili per Rossella, Stella) e timbri/ritmi dedicati.
   - Effetti sonori generati via Web Audio API (click, successo, errore, fanfara). Audio muto di default all'avvio con toggle Audio in toolbar e pulsanti "Ascolta/Ferma" contestuali.

3. DASHBOARD, MEDAGLIE E CERTIFICATO PDF LATO CLIENT:
   - Grafico a barre (Recharts) delle stelle per gioco + 6 Medaglie Natalizie SVG sbloccabili a soglie di stelle (Fiocco di Neve 3★, Campanella d'Oro 8★, Alberello Magico 15★, Pacco dei Doni 25★, Renna Polare 40★, Stella Cometa 60★).
   - Generazione lato client di un PDF A4 orizzontale con jsPDF ("Certificato dell'Elfo Geometra") personalizzabile con nome alunno/classe, grado raggiunto, riepilogo statistiche, medaglie ottenute, elementi grafici natalizi (palline, alberelli, agrifoglio, fiocchi di neve, coccarda con nastri), loghi istituzionali e rilascio ufficiale firmato da Elfa Stella.

4. ACCESSIBILITÀ LIM, TOUCH & ATMOSFERA:
   - Toolbar compatta con animazione pop/bounce al clic/tocco su tutti i pulsanti.
   - Modalità LIM orizzontale zero-scroll su desktop/lavagna con touch-action: none sui controlli e blocco pinch-zoom/menu contestuale, Schermo Intero (con fallback in-app), Overlay Benvenuto ottimizzato LIM e Nevicata CSS a particelle disattivabile dalla barra aula.
   - Pagine dedicate Istruzioni & Prompt e Credits con schede vocali dei 5 Elfi Equipers.`;

const GUIDE_SPEECH =
  'Istruzioni e prompt per Google AI Studio e Canvas. Puoi scegliere tra il Prompt Semplice per iniziare velocemente e il Prompt Avanzato con tutte le funzioni dell’app, copiarlo e provarlo subito!';

export const CanvasGuidePage: React.FC<CanvasGuidePageProps> = ({
  soundEnabled,
  limMode = false
}) => {
  const [promptTier, setPromptTier] = useState<PromptTier>('simple');
  const [copied, setCopied] = useState(false);
  const containerMax = limMode ? 'max-w-[1600px]' : 'max-w-[1160px]';
  const isSpeaking = useSpeakingState();
  const speakingElf = useSpeakingElf();
  const isStellaSpeaking = speakingElf === 'stella';

  const activePrompt = promptTier === 'simple' ? SIMPLE_PROMPT : ADVANCED_AI_STUDIO_PROMPT;

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleCopyPrompt = async () => {
    playClickPop(soundEnabled);
    try {
      await navigator.clipboard.writeText(activePrompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = activePrompt;
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
        <div className="flex items-center gap-3">
          <div
            className={`h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl border-2 border-amber-400 bg-white shadow-sm transition-transform ${
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
          <div>
            <h1
              className="text-xl sm:text-2xl font-semibold text-slate-900"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Istruzioni & Prompt
            </h1>
            {!limMode && (
              <p className="mt-0.5 text-xs text-slate-700">
                Guida rapida all’uso in classe e due prompt pronti (Semplice e Avanzato) per ricreare l’app in Google AI Studio.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => toggleSpeakForKids(GUIDE_SPEECH, { elfId: 'stella' })}
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

      {/* Two-Column Workbench: Classroom Instructions + Dual Prompt Switcher */}
      <div
        className={`grid grid-cols-1 gap-3 md:grid-cols-12 md:items-stretch ${
          limMode ? 'flex-1 min-h-0' : ''
        }`}
      >
        {/* Left: Classroom & Google AI Studio Step-by-Step Instructions */}
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
                <strong className="font-semibold text-slate-900">2. Ascolta i 5 Elfi:</strong> Antonio, Alfredo e Lorenzo usano voci maschili, Rossella e Stella voci femminili. Attiva l’audio in alto o clicca <strong className="text-amber-700">Ascolta</strong>.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                <strong className="font-semibold text-slate-900">3. Esplora e certifica:</strong> manipola le forme a 360° in <strong className="text-[#0F5132]">Sovrapponi</strong> e scarica dalla Dashboard il certificato PDF rilasciato da <strong className="text-[#0F5132]">Elfa Stella</strong>.
              </li>
            </ul>
          </div>

          <div className="mt-2.5 rounded-xl border border-emerald-200 bg-emerald-50/75 p-3">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 shrink-0 text-[#0F5132]" aria-hidden="true" />
              <h3 className="text-xs font-bold text-[#0F5132]">
                Ricreare l’app con Google AI Studio / Canvas
              </h3>
            </div>
            <ol className="mt-1.5 space-y-1 text-[11px] text-slate-800 list-decimal list-inside">
              <li>Scegli <strong>Prompt Semplice</strong> (prototipo rapido) o <strong>Prompt Avanzato</strong> (tutte le funzionalità).</li>
              <li>Clicca su <strong>Copia Prompt</strong> e incollalo in <strong>Google AI Studio Build</strong> o Gemini Canvas.</li>
              <li>Carica eventuali loghi o personaggi personalizzati per adattarlo subito alla tua classe!</li>
            </ol>
          </div>
        </div>

        {/* Right: Dual Copyable Prompt Card (Simple + Advanced AI Studio) */}
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
                  {promptTier === 'simple'
                    ? 'Prompt Semplice (Avvio Rapido)'
                    : 'Prompt Avanzato (Google AI Studio Completo)'}
                </h2>
                <p className="text-[11px] text-emerald-100">
                  {promptTier === 'simple'
                    ? 'Versione sintetica ideale per Gemini Canvas o per partire da una base leggera.'
                    : 'Specifica completa con 5 voci, LIM, Tangram, 360°, medaglie e certificato PDF.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex items-center rounded-lg bg-[#083822] p-0.5 border border-emerald-300/30">
                <button
                  type="button"
                  onClick={() => {
                    playClickPop(soundEnabled);
                    setPromptTier('simple');
                    setCopied(false);
                  }}
                  className={`min-h-[28px] rounded-md px-2.5 py-0.5 text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    promptTier === 'simple'
                      ? 'bg-white text-[#0F5132]'
                      : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  Semplice
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClickPop(soundEnabled);
                    setPromptTier('advanced');
                    setCopied(false);
                  }}
                  className={`min-h-[28px] rounded-md px-2.5 py-0.5 text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    promptTier === 'advanced'
                      ? 'bg-white text-[#0F5132]'
                      : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  Avanzato AI Studio
                </button>
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
                <span>{copied ? 'Copiato!' : 'Copia Prompt'}</span>
              </button>
            </div>
          </div>

          <div
            className={`mt-2.5 rounded-xl border border-emerald-300/30 bg-[#083822] p-3 font-mono text-[11px] leading-relaxed text-emerald-50 select-text ${
              limMode ? 'flex-1 min-h-0 overflow-y-auto' : 'max-h-[340px] overflow-y-auto'
            }`}
          >
            <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
              {activePrompt}
            </pre>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-emerald-100 shrink-0">
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-300" aria-hidden="true" />
              <span>
                {promptTier === 'simple'
                  ? 'Passa ad "Avanzato AI Studio" per ottenere il prompt tecnico completo di ogni funzione.'
                  : 'Include tutte le funzioni implementate: LIM, 5 voci maschili/femminili, Tangram, 360°, Medaglie e PDF.'}
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
