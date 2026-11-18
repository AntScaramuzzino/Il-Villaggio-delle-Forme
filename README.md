# Missione Natale: Il Villaggio delle Forme

Gioco didattico interattivo sulle forme geometriche per la **Scuola Primaria** (classi 1ª–5ª), progettato per computer, **tablet** e **LIM** (Lavagna Interattiva Multimediale).

## Sezioni del gioco
- **Sfida Slitta**: riconoscimento di figure piane, poligoni e solidi decorati su 3 livelli scolastici con audio Web Audio API e punteggi.
- **Albero Magico**: 8 costruzioni natalizie stile tangram su sfondi illustrati, con supporto tocco e trascinamento.
- **Indovinelli**: quiz sulle proprietà geometriche (lati, vertici, angoli retti e solidi 3D) con indizi progressivi.
- **Atlante**: schede interattive delle 14 forme con numerazione dei vertici, angoli retti e assi di simmetria.
- **Dashboard**: grafico a barre (Recharts) con il conteggio delle stelle raccolte in ogni gioco (salvate localmente in `localStorage`).

## Sviluppo locale

```bash
npm install
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:3000`.

## Controllo tipi e build di produzione

```bash
npm run lint
npm run build
```

## Pubblicazione su GitHub e Vercel

1. **Carica su GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Villaggio delle Forme"
   git branch -M main
   git remote add origin https://github.com/<tuo-utente>/<tuo-repository>.git
   git push -u origin main
   ```
2. **Importa su Vercel**:
   - Accedi a [vercel.com](https://vercel.com), seleziona **Add New Project** e importa il repository GitHub.
   - Vercel rileverà automaticamente `vercel.json` e il framework **Vite** (`Build Command: npm run build`, `Output Directory: dist`).
   - **Nessuna variabile d'ambiente è richiesta**: il gioco è interamente client-side e pronto all'uso.
   - **Nota se compare l'avviso `Build output contains no "functions", "static", or "services" directory`**:
     1. Apri **Project Settings → Build and Deployment** su Vercel e verifica che **Framework Preset** sia impostato su **Vite**, **Build Command** su `npm run build`, **Output Directory** su `dist` e **Root Directory** sia vuota (non `Other` o `.`).
     2. Se fai deploy da terminale con Vercel CLI, esegui prima `vercel build` (oppure usa direttamente `vercel --prod` senza `--prebuilt`, perché `--prebuilt` richiede `.vercel/output/static` generato da `vercel build`).

