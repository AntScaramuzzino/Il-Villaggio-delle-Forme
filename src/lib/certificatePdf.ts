import { jsPDF } from 'jspdf';
import { CHRISTMAS_MEDALS } from '../components/ChristmasMedals';
import { CHRISTMAS_SHAPES, RIDDLES_BANK, TANGRAM_PUZZLES } from '../data/christmasShapes';
import { WorkshopStats } from '../types/christmasGeometry';

function toLatin1Safe(text: string): string {
  return text
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/—/g, '-')
    .replace(/–/g, '-');
}

function getElfRank(totalStars: number): { title: string; motto: string } {
  if (totalStars >= 60) {
    return {
      title: 'Gran Maestro Stella Cometa',
      motto: 'Hai illuminato tutto il Villaggio delle Forme padroneggiando figure piane, solidi e Tangram!'
    };
  }
  if (totalStars >= 40) {
    return {
      title: 'Guida della Renna Polare',
      motto: 'Orientamento, simmetrie e logica geometrica da vero navigatore delle feste!'
    };
  }
  if (totalStars >= 25) {
    return {
      title: 'Aiutante dei Doni di Natale',
      motto: 'Hai riconosciuto con precisione poligoni, solidi e oggetti natalizi nella bottega.'
    };
  }
  if (totalStars >= 15) {
    return {
      title: "Elfo Costruttore dell'Albero",
      motto: 'Ottimo lavoro tra incastri geometrici, rotazioni e figure natalizie!'
    };
  }
  if (totalStars >= 8) {
    return {
      title: "Elfo Campanella d'Oro",
      motto: 'Stai esplorando con successo lati, vertici e forme della geometria di Natale.'
    };
  }
  if (totalStars >= 3) {
    return {
      title: 'Elfo Fiocco di Neve',
      motto: 'Primi passi brillanti nel Villaggio delle Forme: continua così!'
    };
  }
  return {
    title: 'Apprendista del Villaggio',
    motto: 'Pronto a iniziare la missione tra slitta, Tangram, indovinelli e atlante geometrico!'
  };
}

function drawVectorStar(
  doc: jsPDF,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  fillRgb: [number, number, number],
  strokeRgb: [number, number, number]
) {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = ((-90 + i * 36) * Math.PI) / 180;
    pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  const deltas: Array<[number, number]> = [];
  for (let i = 1; i < pts.length; i++) {
    deltas.push([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]]);
  }
  doc.setFillColor(...fillRgb);
  doc.setDrawColor(...strokeRgb);
  doc.setLineWidth(0.45);
  doc.lines(deltas, pts[0][0], pts[0][1], [1, 1], 'FD', true);
}

async function loadLogoDataUrl(): Promise<{ dataUrl: string; width: number; height: number } | null> {
  if (typeof window === 'undefined') return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = window.setTimeout(() => resolve(null), 1500);

    img.onload = () => {
      window.clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 200;
        canvas.height = img.naturalHeight || 80;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          width: canvas.width,
          height: canvas.height
        });
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };

    img.src = '/assets/aistudio/LOGO_EFT_Calabria_trasparente_29afe73d.png';
  });
}

export async function generateElfCertificatePdf(params: {
  studentName?: string;
  stats: WorkshopStats;
}): Promise<void> {
  const { studentName, stats } = params;
  const cleanName = toLatin1Safe((studentName ?? '').trim());
  const rank = getElfRank(stats.totalStars);
  const unlockedMedals = CHRISTMAS_MEDALS.filter((m) => stats.totalStars >= m.requiredStars);

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const W = 297;
  const H = 210;

  // Warm parchment background
  doc.setFillColor(255, 253, 247);
  doc.rect(0, 0, W, H, 'F');

  // Outer Pine Green frame
  doc.setDrawColor(15, 81, 50);
  doc.setLineWidth(2.4);
  doc.rect(8, 8, W - 16, H - 16);

  // Inner Amber Gold + Red accent border
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.7);
  doc.rect(12, 12, W - 24, H - 24);

  // Top festive header ribbon
  doc.setFillColor(15, 81, 50);
  doc.rect(14, 14, W - 28, 28, 'F');

  // Load EFT Calabria logo if available
  const logo = await loadLogoDataUrl();
  if (logo) {
    const targetH = 18;
    const targetW = Math.min(44, (logo.width / logo.height) * targetH);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(19, 17.5, targetW + 4, targetH + 3, 2, 2, 'F');
    doc.addImage(logo.dataUrl, 'PNG', 21, 19, targetW, targetH);
  }

  // Header titles
  doc.setTextColor(253, 224, 71);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(
    toLatin1Safe('MISSIONE NATALE: IL VILLAGGIO DELLE FORME  |  SCUOLA PRIMARIA'),
    W / 2 + 8,
    23,
    { align: 'center' }
  );

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(toLatin1Safe("CERTIFICATO DELL'ELFO GEOMETRA"), W / 2 + 8, 34, { align: 'center' });

  // Decorative corner stars
  drawVectorStar(doc, 22, 52, 5.5, 2.4, [250, 204, 21], [180, 83, 9]);
  drawVectorStar(doc, W - 22, 52, 5.5, 2.4, [250, 204, 21], [180, 83, 9]);

  // Recipient section
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('Si certifica con gioia che', W / 2, 55, { align: 'center' });

  if (cleanName) {
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(cleanName, W / 2, 68, { align: 'center' });
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(78, 72, W - 78, 72);
  } else {
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.6);
    doc.line(76, 70, W - 76, 70);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.text('(Nome alunno/a o classe)', W / 2, 75, { align: 'center' });
  }

  // Rank Banner Pill
  doc.setFillColor(220, 38, 38);
  doc.roundedRect(64, 80, W - 128, 13, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.text(toLatin1Safe(`Titolo conseguito: ${rank.title}`), W / 2, 88.6, { align: 'center' });

  // Motto
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(toLatin1Safe(rank.motto), W / 2, 102, { align: 'center', maxWidth: 230 });

  // 4-Column Achievement Summary Cards
  const cardY = 112;
  const cardH = 32;
  const cardGap = 6;
  const startX = 20;
  const cardW = (W - startX * 2 - cardGap * 3) / 4;

  const cards = [
    {
      label: 'STELLE TOTALI',
      value: `${stats.totalStars}`,
      sub: 'Raccolte nei giochi',
      accent: [217, 119, 6] as [number, number, number]
    },
    {
      label: 'MEDAGLIE SBLOCCATE',
      value: `${unlockedMedals.length}/${CHRISTMAS_MEDALS.length}`,
      sub:
        unlockedMedals.length > 0
          ? unlockedMedals[unlockedMedals.length - 1].title
          : 'Prossima a 3 stelle',
      accent: [220, 38, 38] as [number, number, number]
    },
    {
      label: 'ALBERO & TANGRAM',
      value: `${stats.completedPuzzles.length}/${TANGRAM_PUZZLES.length}`,
      sub: `${stats.bestSleighScore} pt record Slitta`,
      accent: [15, 81, 50] as [number, number, number]
    },
    {
      label: 'INDOVINELLI & ATLANTE',
      value: `${stats.solvedRiddles.length}/${RIDDLES_BANK.length}`,
      sub: `${stats.exploredShapes.length}/${CHRISTMAS_SHAPES.length} forme esplorate`,
      accent: [2, 132, 199] as [number, number, number]
    }
  ];

  cards.forEach((c, idx) => {
    const x = startX + idx * (cardW + cardGap);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.45);
    doc.roundedRect(x, cardY, cardW, cardH, 2.5, 2.5, 'FD');

    doc.setFillColor(...c.accent);
    doc.rect(x, cardY, cardW, 2.5, 'F');

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(toLatin1Safe(c.label), x + cardW / 2, cardY + 9, { align: 'center' });

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text(toLatin1Safe(c.value), x + cardW / 2, cardY + 20, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.text(toLatin1Safe(c.sub), x + cardW / 2, cardY + 27.5, {
      align: 'center',
      maxWidth: cardW - 6
    });
  });

  // Unlocked Medals Ribbon List
  const medalsListText =
    unlockedMedals.length > 0
      ? `Medaglie di Natale ottenute: ${unlockedMedals.map((m) => m.title).join(', ')}`
      : 'Medaglie di Natale: raggiungi almeno 3 stelle per sbloccare il Fiocco di Neve!';

  doc.setTextColor(15, 81, 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(toLatin1Safe(medalsListText), W / 2, 154, { align: 'center', maxWidth: 245 });

  // Gold Seal Rosette on bottom right
  const sealX = W - 44;
  const sealY = 175;
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(1.1);
  doc.circle(sealX, sealY, 14, 'FD');
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.4);
  doc.circle(sealX, sealY, 11.5, 'S');
  drawVectorStar(doc, sealX, sealY - 3.5, 4.2, 1.8, [250, 204, 21], [180, 83, 9]);

  doc.setTextColor(146, 64, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`${stats.totalStars} STELLE`, sealX, sealY + 6.5, { align: 'center' });

  // Bottom Date & Signatures
  const todayStr = new Date().toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(toLatin1Safe(`Rilasciato il ${todayStr}`), 24, 174);
  doc.text(toLatin1Safe('Elfi Equipers - EFT Calabria (istruzione.calabria.it/EFT)'), 24, 181);

  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.45);
  doc.line(130, 178, 216, 178);
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(toLatin1Safe("Firma dell'Elfo Pino e dell'Insegnante"), 173, 183, { align: 'center' });

  const fileSuffix = cleanName
    ? `_${cleanName.replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '')}`
    : '';
  doc.save(`Certificato_Elfo_Geometra${fileSuffix}.pdf`);
}
