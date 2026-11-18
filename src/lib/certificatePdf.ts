import { jsPDF } from 'jspdf';
import { CHRISTMAS_MEDALS } from '../components/ChristmasMedals';
import { CHRISTMAS_SHAPES, RIDDLES_BANK, TANGRAM_PUZZLES } from '../data/christmasShapes';
import { ELF_BY_ID } from '../data/elfCharacters';
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
  doc.setLineWidth(0.4);
  doc.lines(deltas, pts[0][0], pts[0][1], [1, 1], 'FD', true);
}

function drawVectorSnowflake(
  doc: jsPDF,
  cx: number,
  cy: number,
  radius: number,
  rgb: [number, number, number]
) {
  doc.setDrawColor(...rgb);
  doc.setLineWidth(0.35);
  for (let i = 0; i < 6; i++) {
    const rad = (i * 60 * Math.PI) / 180;
    const x2 = cx + radius * Math.cos(rad);
    const y2 = cy + radius * Math.sin(rad);
    doc.line(cx, cy, x2, y2);

    // Small V-branches on each arm
    const bx = cx + radius * 0.62 * Math.cos(rad);
    const by = cy + radius * 0.62 * Math.sin(rad);
    const branchLen = radius * 0.34;
    const leftRad = rad + (42 * Math.PI) / 180;
    const rightRad = rad - (42 * Math.PI) / 180;
    doc.line(bx, by, bx + branchLen * Math.cos(leftRad), by + branchLen * Math.sin(leftRad));
    doc.line(bx, by, bx + branchLen * Math.cos(rightRad), by + branchLen * Math.sin(rightRad));
  }
  doc.setFillColor(...rgb);
  doc.circle(cx, cy, radius * 0.14, 'F');
}

function drawChristmasBauble(
  doc: jsPDF,
  cx: number,
  hangTopY: number,
  stringLen: number,
  radius: number,
  fillRgb: [number, number, number],
  stripeRgb: [number, number, number]
) {
  const cy = hangTopY + stringLen + radius;

  // Golden hanging thread
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.45);
  doc.line(cx, hangTopY, cx, cy - radius - 1.2);

  // Cap
  doc.setFillColor(245, 158, 11);
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.3);
  doc.roundedRect(cx - 2, cy - radius - 1.6, 4, 2.2, 0.5, 0.5, 'FD');

  // Main bauble sphere
  doc.setFillColor(...fillRgb);
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.35);
  doc.circle(cx, cy, radius, 'FD');

  // Decorative festive band
  doc.setFillColor(...stripeRgb);
  doc.rect(cx - radius + 0.6, cy - 1.1, (radius - 0.6) * 2, 2.2, 'F');

  // Tiny white shine highlight
  doc.setFillColor(255, 255, 255);
  doc.circle(cx - radius * 0.38, cy - radius * 0.35, radius * 0.18, 'F');
}

function drawMiniChristmasTree(doc: jsPDF, cx: number, baseY: number, scale = 1) {
  // Trunk
  doc.setFillColor(120, 53, 15);
  doc.rect(cx - 2 * scale, baseY - 4.5 * scale, 4 * scale, 4.5 * scale, 'F');

  // Bottom tier
  doc.setFillColor(15, 81, 50);
  doc.setDrawColor(11, 59, 36);
  doc.setLineWidth(0.3);
  doc.triangle(
    cx,
    baseY - 14 * scale,
    cx - 9 * scale,
    baseY - 4 * scale,
    cx + 9 * scale,
    baseY - 4 * scale,
    'FD'
  );

  // Middle tier
  doc.setFillColor(21, 128, 61);
  doc.triangle(
    cx,
    baseY - 20 * scale,
    cx - 7 * scale,
    baseY - 10.5 * scale,
    cx + 7 * scale,
    baseY - 10.5 * scale,
    'FD'
  );

  // Top tier
  doc.setFillColor(22, 163, 74);
  doc.triangle(
    cx,
    baseY - 25.5 * scale,
    cx - 5 * scale,
    baseY - 16.5 * scale,
    cx + 5 * scale,
    baseY - 16.5 * scale,
    'FD'
  );

  // Tiny baubles on tree
  doc.setFillColor(220, 38, 38);
  doc.circle(cx - 3.2 * scale, baseY - 7 * scale, 1 * scale, 'F');
  doc.circle(cx + 2.5 * scale, baseY - 13 * scale, 0.9 * scale, 'F');
  doc.setFillColor(250, 204, 21);
  doc.circle(cx + 3.4 * scale, baseY - 6.5 * scale, 0.9 * scale, 'F');
  doc.circle(cx - 2 * scale, baseY - 13.5 * scale, 0.85 * scale, 'F');

  // Star topper
  drawVectorStar(
    doc,
    cx,
    baseY - 26.8 * scale,
    2.7 * scale,
    1.2 * scale,
    [250, 204, 21],
    [180, 83, 9]
  );
}

function drawHollyCorner(doc: jsPDF, cx: number, cy: number, dirX: 1 | -1, dirY: 1 | -1) {
  // Two holly leaves angled along corner
  doc.setFillColor(21, 128, 61);
  doc.setDrawColor(15, 81, 50);
  doc.setLineWidth(0.35);

  doc.ellipse(cx + dirX * 5.2, cy + dirY * 1.6, 4.8, 2.2, 'FD');
  doc.ellipse(cx + dirX * 1.6, cy + dirY * 5.2, 2.2, 4.8, 'FD');

  // Three festive red berries
  doc.setFillColor(220, 38, 38);
  doc.setDrawColor(153, 27, 27);
  doc.circle(cx + dirX * 1.2, cy + dirY * 1.2, 1.35, 'FD');
  doc.circle(cx + dirX * 3.1, cy + dirY * 2.7, 1.25, 'FD');
  doc.circle(cx + dirX * 2.5, cy + dirY * 0.7, 1.15, 'FD');
}

async function loadImageDataUrl(
  src: string,
  format: 'image/png' | 'image/jpeg' = 'image/png'
): Promise<{ dataUrl: string; width: number; height: number } | null> {
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
        canvas.height = img.naturalHeight || 200;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve({
          dataUrl: canvas.toDataURL(format, 0.92),
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

    img.src = src;
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

  // Warm parchment background with subtle winter border tint
  doc.setFillColor(255, 253, 247);
  doc.rect(0, 0, W, H, 'F');

  // Subtle decorative snowflakes scattered in clean background margins
  drawVectorSnowflake(doc, 27, 89, 5.2, [191, 219, 254]);
  drawVectorSnowflake(doc, W - 27, 89, 5.2, [191, 219, 254]);
  drawVectorSnowflake(doc, 52, 56, 3.6, [203, 213, 225]);
  drawVectorSnowflake(doc, W - 52, 56, 3.6, [203, 213, 225]);
  drawVectorSnowflake(doc, 46, 104, 3.3, [203, 213, 225]);
  drawVectorSnowflake(doc, W - 46, 104, 3.3, [203, 213, 225]);

  // Outer Pine Green frame
  doc.setDrawColor(15, 81, 50);
  doc.setLineWidth(2.4);
  doc.rect(8, 8, W - 16, H - 16);

  // Inner Crimson & Gold double festive border
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.55);
  doc.rect(10.8, 10.8, W - 21.6, H - 21.6);

  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.75);
  doc.rect(12.6, 12.6, W - 25.2, H - 25.2);

  // Top festive header ribbon
  doc.setFillColor(15, 81, 50);
  doc.rect(14.5, 14.5, W - 29, 30, 'F');

  // Gold bottom trim under header ribbon
  doc.setFillColor(217, 119, 6);
  doc.rect(14.5, 44, W - 29, 1.3, 'F');

  // Load EFT Calabria logo, Xmas Lab initiative logo, and Elfa Stella portrait in parallel
  const [eftLogo, xmasLabLogo, stellaPortrait] = await Promise.all([
    loadImageDataUrl('/assets/aistudio/LOGO_EFT_Calabria_trasparente_29afe73d.png', 'image/png'),
    loadImageDataUrl('/assets/aistudio/Logo_Xmas_Lab_trasparente_080dc195.png', 'image/png'),
    loadImageDataUrl(ELF_BY_ID.stella.portraitSrc, 'image/jpeg')
  ]);

  // Left Badge: EFT Calabria Logo
  if (eftLogo) {
    const targetH = 18;
    const targetW = Math.min(44, (eftLogo.width / eftLogo.height) * targetH);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(19, 19, targetW + 4, targetH + 3, 2, 2, 'F');
    doc.addImage(eftLogo.dataUrl, 'PNG', 21, 20.5, targetW, targetH);
  }

  // Right Badge: Xmas Lab Initiative Logo ("La magIA continua")
  if (xmasLabLogo) {
    const badgeSize = 23;
    const ratio = xmasLabLogo.width / xmasLabLogo.height;
    const imgH = badgeSize - 2.4;
    const imgW = imgH * ratio;
    const boxX = W - 19 - (imgW + 4);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(boxX, 18, imgW + 4, badgeSize, 2.5, 2.5, 'F');
    doc.addImage(xmasLabLogo.dataUrl, 'PNG', boxX + 2, 19.2, imgW, imgH);
  }

  // Centered Header Titles
  doc.setTextColor(253, 224, 71);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(
    toLatin1Safe('MISSIONE NATALE: IL VILLAGGIO DELLE FORME  |  XMAS LAB'),
    W / 2,
    24,
    { align: 'center' }
  );

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(toLatin1Safe("CERTIFICATO DELL'ELFO GEOMETRA"), W / 2, 35.5, { align: 'center' });

  // Hanging Christmas Baubles from top ribbon
  drawChristmasBauble(doc, 26, 45.3, 6, 5.2, [220, 38, 38], [250, 204, 21]);
  drawChristmasBauble(doc, 39, 45.3, 11, 4.2, [15, 81, 50], [250, 204, 21]);
  drawChristmasBauble(doc, W - 26, 45.3, 6, 5.2, [220, 38, 38], [250, 204, 21]);
  drawChristmasBauble(doc, W - 39, 45.3, 11, 4.2, [15, 81, 50], [250, 204, 21]);

  // Decorative Golden Stars near recipient heading
  drawVectorStar(doc, 68, 55, 4.2, 1.8, [250, 204, 21], [180, 83, 9]);
  drawVectorStar(doc, W - 68, 55, 4.2, 1.8, [250, 204, 21], [180, 83, 9]);

  // Recipient section
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('Si certifica con gioia che', W / 2, 56.5, { align: 'center' });

  if (cleanName) {
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(cleanName, W / 2, 69, { align: 'center' });
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(78, 73, W - 78, 73);
  } else {
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.6);
    doc.line(76, 71, W - 76, 71);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.text('(Nome alunno/a o classe)', W / 2, 76, { align: 'center' });
  }

  // Mini Christmas Trees flanking the Rank Banner Pill
  drawMiniChristmasTree(doc, 52, 95, 0.88);
  drawMiniChristmasTree(doc, W - 52, 95, 0.88);

  // Rank Banner Pill
  doc.setFillColor(220, 38, 38);
  doc.setDrawColor(185, 28, 28);
  doc.setLineWidth(0.5);
  doc.roundedRect(68, 81, W - 136, 13, 3, 3, 'FD');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.text(toLatin1Safe(`Titolo conseguito: ${rank.title}`), W / 2, 89.6, { align: 'center' });

  // Motto
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(toLatin1Safe(rank.motto), W / 2, 102.5, { align: 'center', maxWidth: 220 });

  // 4-Column Achievement Summary Cards
  const cardY = 111.5;
  const cardH = 30.5;
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
    doc.text(toLatin1Safe(c.label), x + cardW / 2, cardY + 8.6, { align: 'center' });

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text(toLatin1Safe(c.value), x + cardW / 2, cardY + 19.2, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.text(toLatin1Safe(c.sub), x + cardW / 2, cardY + 26.2, {
      align: 'center',
      maxWidth: cardW - 6
    });
  });

  // Unlocked Medals Ribbon Pill
  const medalsListText =
    unlockedMedals.length > 0
      ? `Medaglie di Natale ottenute: ${unlockedMedals.map((m) => m.title).join(', ')}`
      : 'Medaglie di Natale: raggiungi almeno 3 stelle per sbloccare il Fiocco di Neve!';

  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.setLineWidth(0.4);
  doc.roundedRect(24, 145.5, W - 48, 9.5, 2, 2, 'FD');

  doc.setTextColor(15, 81, 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.2);
  doc.text(toLatin1Safe(medalsListText), W / 2, 151.6, { align: 'center', maxWidth: W - 56 });

  // Holly & Berries on bottom frame corners
  drawHollyCorner(doc, 14.5, H - 14.5, 1, -1);
  drawHollyCorner(doc, W - 14.5, H - 14.5, -1, -1);

  // Elfa Stella Issuing Badge (bottom-left)
  const textStartX = stellaPortrait ? 52 : 26;
  if (stellaPortrait) {
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.85);
    doc.roundedRect(23, 160, 24, 24, 3, 3, 'FD');
    doc.addImage(stellaPortrait.dataUrl, 'JPEG', 24, 161, 22, 22);
  }

  // Bottom Date & Issuing Credit (Elfa Stella + Xmas Lab)
  const todayStr = new Date().toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  doc.setTextColor(15, 81, 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(toLatin1Safe("Rilasciato ufficialmente dall'Elfa Stella"), textStartX, 166.5);

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.text(toLatin1Safe(`Iniziativa Xmas Lab · In data ${todayStr}`), textStartX, 172.8);
  doc.text(
    toLatin1Safe('Elfi Equipers - EFT Calabria (istruzione.calabria.it/EFT)'),
    textStartX,
    179
  );

  // Signature line (center-right)
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.45);
  doc.line(156, 177, 232, 177);
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(toLatin1Safe("Firma dell'Elfa Stella e dell'Insegnante"), 194, 182.5, {
    align: 'center'
  });

  // Gold Seal Rosette with Crimson Ribbons on bottom right
  const sealX = W - 40;
  const sealY = 172;

  // Ribbon tails behind seal
  doc.setFillColor(220, 38, 38);
  doc.setDrawColor(153, 27, 27);
  doc.setLineWidth(0.35);
  doc.triangle(sealX - 7, sealY + 7, sealX - 11, sealY + 21, sealX - 2, sealY + 17, 'FD');
  doc.triangle(sealX + 7, sealY + 7, sealX + 11, sealY + 21, sealX + 2, sealY + 17, 'FD');

  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(1.1);
  doc.circle(sealX, sealY, 13.5, 'FD');
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.4);
  doc.circle(sealX, sealY, 11, 'S');
  drawVectorStar(doc, sealX, sealY - 3.3, 4.1, 1.75, [250, 204, 21], [180, 83, 9]);

  doc.setTextColor(146, 64, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.2);
  doc.text(`${stats.totalStars} STELLE`, sealX, sealY + 6.4, { align: 'center' });

  const fileSuffix = cleanName
    ? `_${cleanName.replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '')}`
    : '';
  doc.save(`Certificato_Elfo_Geometra${fileSuffix}.pdf`);
}
