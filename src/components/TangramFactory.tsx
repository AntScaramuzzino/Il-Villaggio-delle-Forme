import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  FlipHorizontal,
  HelpCircle,
  Image as ImageIcon,
  Magnet,
  RotateCcw,
  RotateCw,
  Sparkles,
  Square,
  Volume2
} from 'lucide-react';
import { ELF_BY_ID } from '../data/elfCharacters';
import {
  AUDIO_DELAYS,
  playClickPop,
  playMagnetSnap,
  playPieceFlip,
  playPiecePickup,
  playPieceRotate,
  playSlotSnap,
  playVictoryFanfare
} from '../lib/soundFx';
import { speakForKids, stopSpeaking, toggleSpeakForKids, useSpeakingElf, useSpeakingState } from '../lib/ttsVoice';
import { ResilientImage } from './ResilientImage';

type TanKind = 'big-tri' | 'med-tri' | 'small-tri' | 'square' | 'parallelogram';

interface Pt {
  x: number;
  y: number;
}

interface TanTemplateSlot {
  id: string;
  kind: TanKind;
  name: string;
  x: number;
  y: number;
  rotation: number;
  flipped?: boolean;
  color: string;
}

interface TanPieceState {
  id: string;
  kind: TanKind;
  name: string;
  christmasPart: string;
  x: number;
  y: number;
  rotation: number;
  flipped: boolean;
  color: string;
  snappedSlotId: string | null;
}

interface TangramModel {
  id: string;
  title: string;
  christmasObject: string;
  christmasObjectArticle: string;
  subtitle: string;
  backgroundImage: string;
  backgroundAlt: string;
  targets: TanTemplateSlot[];
}

const TAN_VERTICES: Record<TanKind, Pt[]> = {
  // Classic Tangram ratios scaled to U = 120, centered at centroid (0,0)
  'big-tri': [
    { x: -60, y: 20 },
    { x: 60, y: 20 },
    { x: 0, y: -40 }
  ],
  'med-tri': [
    { x: -20, y: 20 },
    { x: -20, y: -40 },
    { x: 40, y: 20 }
  ],
  'small-tri': [
    { x: -30, y: 10 },
    { x: 30, y: 10 },
    { x: 0, y: -20 }
  ],
  square: [
    { x: -30, y: 0 },
    { x: 0, y: -30 },
    { x: 30, y: 0 },
    { x: 0, y: 30 }
  ],
  parallelogram: [
    { x: -45, y: 15 },
    { x: 15, y: 15 },
    { x: 45, y: -15 },
    { x: -15, y: -15 }
  ]
};

const TAN_POLYGONS: Record<TanKind, string> = {
  'big-tri': TAN_VERTICES['big-tri'].map((p) => `${p.x},${p.y}`).join(' '),
  'med-tri': TAN_VERTICES['med-tri'].map((p) => `${p.x},${p.y}`).join(' '),
  'small-tri': TAN_VERTICES['small-tri'].map((p) => `${p.x},${p.y}`).join(' '),
  square: TAN_VERTICES.square.map((p) => `${p.x},${p.y}`).join(' '),
  parallelogram: TAN_VERTICES.parallelogram.map((p) => `${p.x},${p.y}`).join(' ')
};

const INITIAL_TRAY_PIECES: Array<{
  id: string;
  kind: TanKind;
  name: string;
  christmasPart: string;
  homeX: number;
  homeY: number;
  color: string;
}> = [
  { id: 'tan-big-1', kind: 'big-tri', name: 'Triangolo Grande 1', christmasPart: 'Chioma / Vela', homeX: 84, homeY: 66, color: '#15803D' },
  { id: 'tan-big-2', kind: 'big-tri', name: 'Triangolo Grande 2', christmasPart: 'Base / Ala', homeX: 84, homeY: 148, color: '#16A34A' },
  { id: 'tan-med', kind: 'med-tri', name: 'Triangolo Medio', christmasPart: 'Tetto / Scia', homeX: 84, homeY: 226, color: '#0284C7' },
  { id: 'tan-sq', kind: 'square', name: 'Quadrato', christmasPart: 'Pacco Regalo', homeX: 84, homeY: 292, color: '#D97706' },
  { id: 'tan-sm-1', kind: 'small-tri', name: 'Triangolo Piccolo 1', christmasPart: 'Punta / Fiamma', homeX: 396, homeY: 70, color: '#DC2626' },
  { id: 'tan-sm-2', kind: 'small-tri', name: 'Triangolo Piccolo 2', christmasPart: 'Stella / Fiocco', homeX: 396, homeY: 146, color: '#EAB308' },
  { id: 'tan-par', kind: 'parallelogram', name: 'Parallelogramma', christmasPart: 'Nastro / Slitta', homeX: 396, homeY: 230, color: '#0D9488' }
];

const TANGRAM_MODELS: TangramModel[] = [
  {
    id: 'tangram-albero',
    title: 'Abete di Natale',
    christmasObject: 'Albero decorato con i 7 Tan',
    christmasObjectArticle: 'l’albero decorato con i 7 Tan',
    subtitle: 'Trascina e ruota i 7 pezzi del Tangram per formare l’albero di Natale sulla neve.',
    backgroundImage: '/src/assets/images/bg_snowy_forest_clearing_1794994126896.jpg',
    backgroundAlt: 'Radura innevata tra gli abeti',
    targets: [
      { id: 't1', kind: 'small-tri', name: 'Punta stella', x: 240, y: 56, rotation: 0, color: '#EAB308' },
      { id: 't2', kind: 'med-tri', name: 'Chioma alta', x: 240, y: 94.3, rotation: 135, color: '#0284C7' },
      { id: 't3', kind: 'big-tri', name: 'Chioma media', x: 240, y: 148.4, rotation: 0, color: '#16A34A' },
      { id: 't4', kind: 'big-tri', name: 'Chioma bassa', x: 240, y: 208.4, rotation: 0, color: '#15803D' },
      { id: 't5', kind: 'square', name: 'Tronco regalo', x: 240, y: 249.6, rotation: 45, color: '#D97706' },
      { id: 't6', kind: 'small-tri', name: 'Pacco sinistro', x: 204.6, y: 256.7, rotation: 135, color: '#DC2626' },
      { id: 't7', kind: 'parallelogram', name: 'Vaso slitta', x: 240, y: 285.8, rotation: 0, color: '#0D9488' }
    ]
  },
  {
    id: 'tangram-casetta',
    title: 'Baita di Natale',
    christmasObject: 'Baita Innevata con Veranda',
    christmasObjectArticle: 'la baita innevata con veranda',
    subtitle: 'Unisci i due triangoli grandi per le pareti, il tetto, la veranda e la mansarda.',
    backgroundImage: '/src/assets/images/bg_christmas_hearth_1794994128347.jpg',
    backgroundAlt: 'Interno caldo natalizio',
    targets: [
      { id: 'c1', kind: 'big-tri', name: 'Parete sinistra', x: 191, y: 222, rotation: 225, color: '#15803D' },
      { id: 'c2', kind: 'big-tri', name: 'Parete destra', x: 219.3, y: 193.7, rotation: 45, color: '#16A34A' },
      { id: 'c3', kind: 'med-tri', name: 'Tetto spiovente', x: 205.1, y: 151.3, rotation: 135, color: '#DC2626' },
      { id: 'c4', kind: 'parallelogram', name: 'Mansarda e camino', x: 183.9, y: 123, rotation: 135, color: '#0D9488' },
      { id: 'c5', kind: 'square', name: 'Veranda', x: 268.8, y: 229.1, rotation: 45, color: '#D97706' },
      { id: 'c6', kind: 'small-tri', name: 'Tetto veranda', x: 261.7, y: 193.7, rotation: 225, color: '#0284C7' },
      { id: 'c7', kind: 'small-tri', name: 'Ingresso innevato', x: 304.1, y: 236.1, rotation: 225, color: '#EAB308' }
    ]
  },
  {
    id: 'tangram-candela',
    title: 'Candela di Natale',
    christmasObject: 'Candela Accesa delle Feste',
    christmasObjectArticle: 'la candela accesa delle feste',
    subtitle: 'Componi il portacandela, il corpo di cera e la fiamma brillante in cima.',
    backgroundImage: '/src/assets/images/bg_christmas_hearth_1794994128347.jpg',
    backgroundAlt: 'Camino natalizio caldo',
    targets: [
      { id: 'cd1', kind: 'square', name: 'Fiamma d’oro', x: 240, y: 61.4, rotation: 0, color: '#EAB308' },
      { id: 'cd2', kind: 'med-tri', name: 'Punta della cera', x: 240, y: 119.7, rotation: 135, color: '#0284C7' },
      { id: 'cd3', kind: 'big-tri', name: 'Cera sinistra', x: 225.9, y: 190.4, rotation: 225, color: '#DC2626' },
      { id: 'cd4', kind: 'big-tri', name: 'Cera destra', x: 254.1, y: 162.1, rotation: 45, color: '#16A34A' },
      { id: 'cd5', kind: 'small-tri', name: 'Coppa sinistra', x: 225.9, y: 232.9, rotation: 45, color: '#D97706' },
      { id: 'cd6', kind: 'small-tri', name: 'Coppa destra', x: 254.1, y: 232.9, rotation: 315, color: '#15803D' },
      { id: 'cd7', kind: 'parallelogram', name: 'Base portacandela', x: 240, y: 276.1, rotation: 0, color: '#0D9488' }
    ]
  },
  {
    id: 'tangram-angelo',
    title: 'Angelo di Natale',
    christmasObject: 'Angelo con Ali e Aureola',
    christmasObjectArticle: 'l’angelo con ali e aureola',
    subtitle: 'Apri le grandi ali dell’angelo con i due triangoli grandi e posiziona l’aureola.',
    backgroundImage: '/src/assets/images/bg_starry_winter_sky_1794994127354.jpg',
    backgroundAlt: 'Cielo notturno di Natale',
    targets: [
      { id: 'an1', kind: 'small-tri', name: 'Corona aureola', x: 240, y: 40, rotation: 0, color: '#EAB308' },
      { id: 'an2', kind: 'square', name: 'Viso luminoso', x: 240, y: 80, rotation: 0, color: '#D97706' },
      { id: 'an3', kind: 'big-tri', name: 'Ala sinistra', x: 211.7, y: 166.6, rotation: 135, color: '#15803D' },
      { id: 'an4', kind: 'big-tri', name: 'Ala destra', x: 268.3, y: 166.6, rotation: 225, color: '#16A34A' },
      { id: 'an5', kind: 'med-tri', name: 'Veste lunga', x: 240, y: 223.2, rotation: 135, color: '#0284C7' },
      { id: 'an6', kind: 'parallelogram', name: 'Nuvola', x: 240, y: 252.3, rotation: 0, color: '#0D9488' },
      { id: 'an7', kind: 'small-tri', name: 'Scia d’oro', x: 225, y: 277.3, rotation: 180, color: '#DC2626' }
    ]
  },
  {
    id: 'tangram-cometa',
    title: 'Stella Cometa',
    christmasObject: 'Cometa nel Cielo Stellato',
    christmasObjectArticle: 'la cometa nel cielo stellato',
    subtitle: 'Componi la punta della cometa e la lunga scia luminosa ruotando i pezzi.',
    backgroundImage: '/src/assets/images/bg_starry_winter_sky_1794994127354.jpg',
    backgroundAlt: 'Cielo stellato di Natale',
    targets: [
      { id: 's1', kind: 'big-tri', name: 'Punta della cometa', x: 186, y: 170, rotation: 270, color: '#EAB308' },
      { id: 's2', kind: 'parallelogram', name: 'Fascio superiore', x: 221, y: 155, rotation: 90, color: '#0D9488' },
      { id: 's3', kind: 'small-tri', name: 'Raggio inferiore', x: 216, y: 200, rotation: 90, color: '#DC2626' },
      { id: 's4', kind: 'med-tri', name: 'Nucleo centrale', x: 256, y: 160, rotation: 90, color: '#0284C7' },
      { id: 's5', kind: 'square', name: 'Gemma alta', x: 257.2, y: 118.8, rotation: 45, color: '#D97706' },
      { id: 's6', kind: 'small-tri', name: 'Punta alta', x: 292.6, y: 125.9, rotation: 225, color: '#16A34A' },
      { id: 's7', kind: 'big-tri', name: 'Coda lunga', x: 264.3, y: 228.3, rotation: 315, color: '#15803D' }
    ]
  },
  {
    id: 'tangram-renna',
    title: 'Renna di Natale',
    christmasObject: 'Renna di Babbo Natale',
    christmasObjectArticle: 'la renna di Babbo Natale',
    subtitle: 'Costruisci il corpo, le zampe, il collo alto e il muso della renna.',
    backgroundImage: '/src/assets/images/bg_snowy_forest_clearing_1794994126896.jpg',
    backgroundAlt: 'Bosco innevato di Natale',
    targets: [
      { id: 'rn1', kind: 'big-tri', name: 'Schiena', x: 191, y: 205, rotation: 225, color: '#15803D' },
      { id: 'rn2', kind: 'big-tri', name: 'Petto', x: 219.3, y: 176.7, rotation: 45, color: '#16A34A' },
      { id: 'rn3', kind: 'med-tri', name: 'Zampe posteriori', x: 182.7, y: 253.3, rotation: 90, color: '#0284C7' },
      { id: 'rn4', kind: 'parallelogram', name: 'Collo slanciato', x: 226.4, y: 106, rotation: 135, color: '#0D9488' },
      { id: 'rn5', kind: 'small-tri', name: 'Base del collo', x: 233.5, y: 134.3, rotation: 135, color: '#EAB308' },
      { id: 'rn6', kind: 'square', name: 'Testa', x: 268.8, y: 84.8, rotation: 45, color: '#D97706' },
      { id: 'rn7', kind: 'small-tri', name: 'Muso rosso', x: 304.1, y: 77.7, rotation: 315, color: '#DC2626' }
    ]
  },
  {
    id: 'tangram-slitta',
    title: 'Slitta dei Regali',
    christmasObject: 'Slitta Carica di Regali',
    christmasObjectArticle: 'la slitta carica di regali',
    subtitle: 'Assembla i pattini della slitta, il grande carico di doni e la stella sulla cima.',
    backgroundImage: '/src/assets/images/bg_winter_railway_bridge_1794994127233.jpg',
    backgroundAlt: 'Paesaggio invernale con ponte nella neve',
    targets: [
      { id: 'sl1', kind: 'small-tri', name: 'Punta dietro', x: 190, y: 220, rotation: 180, color: '#DC2626' },
      { id: 'sl2', kind: 'parallelogram', name: 'Pattino slitta', x: 235, y: 225, rotation: 0, color: '#0D9488' },
      { id: 'sl3', kind: 'small-tri', name: 'Punta davanti', x: 280, y: 230, rotation: 0, color: '#EAB308' },
      { id: 'sl4', kind: 'big-tri', name: 'Carico sinistro', x: 206.3, y: 181.7, rotation: 225, color: '#15803D' },
      { id: 'sl5', kind: 'big-tri', name: 'Carico destro', x: 234.6, y: 153.4, rotation: 45, color: '#16A34A' },
      { id: 'sl6', kind: 'med-tri', name: 'Tetto dei regali', x: 220.4, y: 111, rotation: 135, color: '#0284C7' },
      { id: 'sl7', kind: 'square', name: 'Stella di punta', x: 220.4, y: 52.7, rotation: 0, color: '#D97706' }
    ]
  },
  {
    id: 'tangram-libera',
    title: 'Fabbrica Libera',
    christmasObject: 'Creazione Personale di Natale',
    christmasObjectArticle: 'la tua creazione personale di Natale',
    subtitle: 'Avvicina i 7 Tan nell’area centrale: si agganciano tra loro come calamite! Ruota di 45° per unirli.',
    backgroundImage: '/src/assets/images/christmas_workshop_banner_1794993393827.jpg',
    backgroundAlt: 'Tavolo della fabbrica di Natale',
    targets: []
  }
];

function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function isRotationMatch(kind: TanKind, currentRot: number, targetRot: number): boolean {
  const a = normalizeAngle(currentRot);
  const b = normalizeAngle(targetRot);
  if (kind === 'square') {
    return a % 90 === b % 90;
  }
  if (kind === 'parallelogram') {
    return a % 180 === b % 180;
  }
  return a === b;
}

function transformLocalPoint(piece: Pick<TanPieceState, 'x' | 'y' | 'rotation' | 'flipped'>, lp: Pt): Pt {
  const sx = piece.flipped ? -lp.x : lp.x;
  const sy = lp.y;
  const rad = (piece.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: piece.x + sx * cos - sy * sin,
    y: piece.y + sx * sin + sy * cos
  };
}

function getWorldVertices(piece: Pick<TanPieceState, 'kind' | 'x' | 'y' | 'rotation' | 'flipped'>): Pt[] {
  return TAN_VERTICES[piece.kind].map((v) => transformLocalPoint(piece, v));
}

function getPieceAnchors(piece: Pick<TanPieceState, 'kind' | 'x' | 'y' | 'rotation' | 'flipped'>): Pt[] {
  const verts = getWorldVertices(piece);
  const anchors: Pt[] = [...verts];
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    anchors.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  }
  return anchors;
}

function pointInPolygon(pt: Pt, poly: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    const intersect =
      yi > pt.y !== yj > pt.y &&
      pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function piecesOverlapDeeply(
  a: Pick<TanPieceState, 'kind' | 'x' | 'y' | 'rotation' | 'flipped'>,
  b: Pick<TanPieceState, 'kind' | 'x' | 'y' | 'rotation' | 'flipped'>
): boolean {
  const va = getWorldVertices(a);
  const vb = getWorldVertices(b);

  const insetPoly = (center: Pt, verts: Pt[], factor: number): Pt[] =>
    verts.map((v) => ({
      x: center.x + (v.x - center.x) * factor,
      y: center.y + (v.y - center.y) * factor
    }));

  const insetA = insetPoly({ x: a.x, y: a.y }, va, 0.82);
  const insetB = insetPoly({ x: b.x, y: b.y }, vb, 0.82);

  const samplesA = [{ x: a.x, y: a.y }, ...insetPoly({ x: a.x, y: a.y }, va, 0.65)];
  const samplesB = [{ x: b.x, y: b.y }, ...insetPoly({ x: b.x, y: b.y }, vb, 0.65)];

  for (const pt of samplesA) {
    if (pointInPolygon(pt, insetB)) return true;
  }
  for (const pt of samplesB) {
    if (pointInPolygon(pt, insetA)) return true;
  }
  return false;
}

interface MagneticSnapResult {
  dx: number;
  dy: number;
  contactX: number;
  contactY: number;
  partnerName: string;
}

const FREE_MAGNET_RADIUS = 16;

function findMagneticSnap(
  piece: TanPieceState,
  allPieces: TanPieceState[]
): MagneticSnapResult | null {
  // Only attract toward pieces placed inside the central workbench (outside the side trays)
  const boardPeers = allPieces.filter(
    (other) => other.id !== piece.id && other.x > 134 && other.x < 346
  );
  if (boardPeers.length === 0) return null;

  // Also avoid snapping while the piece is still parked deep in the side tray
  if (piece.x < 118 || piece.x > 362) return null;

  const myAnchors = getPieceAnchors(piece);
  const candidates: Array<MagneticSnapResult & { dist: number }> = [];

  for (const peer of boardPeers) {
    const peerAnchors = getPieceAnchors(peer);
    for (const ma of myAnchors) {
      for (const pa of peerAnchors) {
        const dist = Math.hypot(pa.x - ma.x, pa.y - ma.y);
        if (dist <= FREE_MAGNET_RADIUS) {
          candidates.push({
            dx: pa.x - ma.x,
            dy: pa.y - ma.y,
            contactX: pa.x,
            contactY: pa.y,
            partnerName: peer.name,
            dist
          });
        }
      }
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.dist - b.dist);

  for (const cand of candidates) {
    const shifted: TanPieceState = {
      ...piece,
      x: Math.max(36, Math.min(444, piece.x + cand.dx)),
      y: Math.max(32, Math.min(308, piece.y + cand.dy))
    };
    const overlapsAny = boardPeers.some((peer) => piecesOverlapDeeply(shifted, peer));
    if (!overlapsAny) {
      return {
        dx: shifted.x - piece.x,
        dy: shifted.y - piece.y,
        contactX: cand.contactX,
        contactY: cand.contactY,
        partnerName: cand.partnerName
      };
    }
  }

  return null;
}

function makeInitialPieces(): TanPieceState[] {
  return INITIAL_TRAY_PIECES.map((p) => ({
    id: p.id,
    kind: p.kind,
    name: p.name,
    christmasPart: p.christmasPart,
    x: p.homeX,
    y: p.homeY,
    rotation: 0,
    flipped: false,
    color: p.color,
    snappedSlotId: null
  }));
}

interface TangramFactoryProps {
  soundEnabled: boolean;
  onCompleteFactoryModel: (modelId: string) => void;
  limMode?: boolean;
}

export const TangramFactory: React.FC<TangramFactoryProps> = ({
  soundEnabled,
  onCompleteFactoryModel,
  limMode = false
}) => {
  const [modelIdx, setModelIdx] = useState(0);
  const [pieces, setPieces] = useState<TanPieceState[]>(makeInitialPieces);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>('tan-big-1');
  const [showGuides, setShowGuides] = useState(true);
  const [showBackdrop, setShowBackdrop] = useState(true);
  const [magnetEnabled, setMagnetEnabled] = useState(true);
  const [magnetContact, setMagnetContact] = useState<Pt | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Trascina i 7 pezzi al centro, toccali due volte o usa Ruota 45° per incastrarli nella sagoma!'
  );

  const svgRef = useRef<SVGSVGElement | null>(null);
  const piecesRef = useRef<TanPieceState[]>(pieces);
  piecesRef.current = pieces;

  const dragStateRef = useRef<{
    pieceId: string;
    offsetX: number;
    offsetY: number;
    moved: boolean;
  } | null>(null);
  const magnetContactRef = useRef<Pt | null>(null);
  const lastTapRef = useRef<{ pieceId: string; time: number }>({ pieceId: '', time: 0 });

  const model = TANGRAM_MODELS[modelIdx];
  const isFreeMode = model.targets.length === 0;
  const speakingElf = useSpeakingElf();
  const isLorenzoSpeaking = speakingElf === 'lorenzo';
  const snappedCount = useMemo(
    () => pieces.filter((p) => p.snappedSlotId !== null).length,
    [pieces]
  );
  const isComplete = !isFreeMode && snappedCount === model.targets.length;

  const selectedPiece = useMemo(
    () => pieces.find((p) => p.id === selectedPieceId) ?? null,
    [pieces, selectedPieceId]
  );

  const isSpeaking = useSpeakingState();

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const toSvgCoords = (clientX: number, clientY: number): Pt => {
    const svg = svgRef.current;
    if (!svg) return { x: 240, y: 170 };
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 240, y: 170 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const transformed = pt.matrixTransform(ctm.inverse());
    return { x: transformed.x, y: transformed.y };
  };

  const selectModel = (idx: number) => {
    playClickPop(soundEnabled);
    setModelIdx(idx);
    const fresh = makeInitialPieces();
    piecesRef.current = fresh;
    setPieces(fresh);
    setSelectedPieceId('tan-big-1');
    magnetContactRef.current = null;
    setMagnetContact(null);
    const chosen = TANGRAM_MODELS[idx];
    const msg =
      chosen.targets.length === 0
        ? 'Fabbrica Libera con Calamita attiva! Avvicina due pezzi al centro per agganciarli tra loro.'
        : `Nuovo modello: ${chosen.title}! Trascina i pezzi e ruotali di 45° per incastrarli.`;
    setStatusMessage(msg);
    speakForKids(msg, soundEnabled, { delayMs: AUDIO_DELAYS.afterClick, elfId: 'lorenzo' });
  };

  const resetBoard = () => {
    playClickPop(soundEnabled);
    stopSpeaking();
    const fresh = makeInitialPieces();
    piecesRef.current = fresh;
    setPieces(fresh);
    setSelectedPieceId('tan-big-1');
    magnetContactRef.current = null;
    setMagnetContact(null);
    setStatusMessage('Banco della fabbrica pulito! Ricomincia la costruzione.');
  };

  const trySnapPiece = (piece: TanPieceState, list: TanPieceState[]): TanPieceState[] => {
    if (isFreeMode) {
      if (!magnetEnabled) return list;
      const snap = findMagneticSnap(piece, list);
      if (!snap) return list;
      playMagnetSnap(soundEnabled);
      setStatusMessage(`Aggancio magnetico! ${piece.name} si è unito a ${snap.partnerName}.`);
      return list.map((p) =>
        p.id === piece.id
          ? {
              ...p,
              x: Math.max(36, Math.min(444, piece.x + snap.dx)),
              y: Math.max(32, Math.min(308, piece.y + snap.dy)),
              snappedSlotId: null
            }
          : p
      );
    }

    const usedSlots = new Set(
      list.filter((p) => p.id !== piece.id && p.snappedSlotId).map((p) => p.snappedSlotId as string)
    );

    const matchingTarget = model.targets.find((t) => {
      if (t.kind !== piece.kind || usedSlots.has(t.id)) return false;
      const dist = Math.hypot(piece.x - t.x, piece.y - t.y);
      return dist <= 34 && isRotationMatch(piece.kind, piece.rotation, t.rotation);
    });

    if (!matchingTarget) return list;

    const updated = list.map((p) =>
      p.id === piece.id
        ? {
            ...p,
            x: matchingTarget.x,
            y: matchingTarget.y,
            rotation: matchingTarget.rotation,
            flipped: Boolean(matchingTarget.flipped),
            snappedSlotId: matchingTarget.id
          }
        : p
    );

    const nextSnapped = updated.filter((p) => p.snappedSlotId !== null).length;
    if (nextSnapped === model.targets.length) {
      playVictoryFanfare(soundEnabled);
      onCompleteFactoryModel(model.id);
      const msg = `Meraviglioso! Hai costruito ${model.christmasObjectArticle}!`;
      setStatusMessage(msg);
      speakForKids(msg, soundEnabled, { delayMs: AUDIO_DELAYS.afterFanfare, elfId: 'lorenzo' });
    } else {
      playSlotSnap(soundEnabled);
      const msg = `Perfetto! Hai incastrato ${piece.name} (${matchingTarget.name}).`;
      setStatusMessage(msg);
      speakForKids(msg, soundEnabled, { delayMs: AUDIO_DELAYS.afterChime, elfId: 'lorenzo' });
    }

    return updated;
  };

  const rotatePieceById = (pieceId: string, delta: number) => {
    playPieceRotate(soundEnabled, delta >= 0 ? 1 : -1);
    setSelectedPieceId(pieceId);
    magnetContactRef.current = null;
    setMagnetContact(null);

    const prev = piecesRef.current;
    const next = prev.map((p) =>
      p.id === pieceId
        ? { ...p, rotation: normalizeAngle(p.rotation + delta), snappedSlotId: null }
        : p
    );
    const updated = next.find((p) => p.id === pieceId);
    if (!updated) return;

    const snapped = trySnapPiece(updated, next);
    piecesRef.current = snapped;
    setPieces(snapped);
  };

  const rotateSelected = (delta: number) => {
    if (!selectedPieceId) return;
    rotatePieceById(selectedPieceId, delta);
  };

  const flipSelected = () => {
    if (!selectedPieceId) return;
    playPieceFlip(soundEnabled);
    magnetContactRef.current = null;
    setMagnetContact(null);

    const prev = piecesRef.current;
    const next = prev.map((p) =>
      p.id === selectedPieceId ? { ...p, flipped: !p.flipped, snappedSlotId: null } : p
    );
    const updated = next.find((p) => p.id === selectedPieceId);
    const snapped = updated ? trySnapPiece(updated, next) : next;
    piecesRef.current = snapped;
    setPieces(snapped);
  };

  // Keyboard shortcuts for quick rotation when using a keyboard/LIM
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPieceId) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'q' || e.key === 'Q' || e.key === '[') {
        rotatePieceById(selectedPieceId, -45);
      } else if (e.key === 'e' || e.key === 'E' || e.key === 'r' || e.key === 'R' || e.key === ']') {
        rotatePieceById(selectedPieceId, 45);
      } else if (e.key === 'f' || e.key === 'F') {
        const sel = piecesRef.current.find((p) => p.id === selectedPieceId);
        if (sel?.kind === 'parallelogram') flipSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handlePointerDown = (e: React.PointerEvent<SVGGElement>, piece: TanPieceState) => {
    e.stopPropagation();
    (e.currentTarget as SVGGElement).setPointerCapture(e.pointerId);
    playPiecePickup(soundEnabled);
    setSelectedPieceId(piece.id);
    const coords = toSvgCoords(e.clientX, e.clientY);
    dragStateRef.current = {
      pieceId: piece.id,
      offsetX: piece.x - coords.x,
      offsetY: piece.y - coords.y,
      moved: false
    };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragStateRef.current;
    if (!drag) return;
    const coords = toSvgCoords(e.clientX, e.clientY);
    const rawX = Math.max(36, Math.min(444, coords.x + drag.offsetX));
    const rawY = Math.max(32, Math.min(308, coords.y + drag.offsetY));

    const prev = piecesRef.current;
    const current = prev.find((p) => p.id === drag.pieceId);
    if (!current) return;

    if (Math.hypot(rawX - current.x, rawY - current.y) > 3) {
      drag.moved = true;
    }

    let finalX = rawX;
    let finalY = rawY;
    let nextContact: Pt | null = null;

    if (isFreeMode && magnetEnabled) {
      const candidate: TanPieceState = { ...current, x: rawX, y: rawY, snappedSlotId: null };
      const snap = findMagneticSnap(candidate, prev);
      if (snap) {
        finalX = Math.max(36, Math.min(444, rawX + snap.dx));
        finalY = Math.max(32, Math.min(308, rawY + snap.dy));
        nextContact = { x: snap.contactX, y: snap.contactY };
      }
    }

    const prevContact = magnetContactRef.current;
    if (
      nextContact &&
      (!prevContact || Math.hypot(nextContact.x - prevContact.x, nextContact.y - prevContact.y) > 6)
    ) {
      playMagnetSnap(soundEnabled);
    }

    magnetContactRef.current = nextContact;
    setMagnetContact(nextContact);

    const next = prev.map((p) =>
      p.id === drag.pieceId
        ? { ...p, x: finalX, y: finalY, snappedSlotId: null }
        : p
    );
    piecesRef.current = next;
    setPieces(next);
  };

  const handlePointerUp = () => {
    const drag = dragStateRef.current;
    if (!drag) return;
    dragStateRef.current = null;

    // Double-tap / double-click quick rotate (+45°) without dragging
    const now = Date.now();
    if (!drag.moved) {
      if (
        lastTapRef.current.pieceId === drag.pieceId &&
        now - lastTapRef.current.time < 340
      ) {
        lastTapRef.current = { pieceId: '', time: 0 };
        rotatePieceById(drag.pieceId, 45);
        return;
      }
      lastTapRef.current = { pieceId: drag.pieceId, time: now };
    }

    const activeContact = magnetContactRef.current;
    magnetContactRef.current = null;
    setMagnetContact(null);

    if (isFreeMode && magnetEnabled && activeContact) {
      const piece = piecesRef.current.find((p) => p.id === drag.pieceId);
      setStatusMessage(
        piece
          ? `Aggancio magnetico! ${piece.name} si è unito al pezzo vicino.`
          : 'Aggancio magnetico completato!'
      );
      return;
    }

    const prev = piecesRef.current;
    const target = prev.find((p) => p.id === drag.pieceId);
    if (!target) return;
    const snapped = trySnapPiece(target, prev);
    piecesRef.current = snapped;
    setPieces(snapped);
  };

  const autoPlaceNextPiece = () => {
    if (isFreeMode) return;
    const prev = piecesRef.current;
    const usedSlots = new Set(
      prev.filter((p) => p.snappedSlotId).map((p) => p.snappedSlotId as string)
    );
    const nextSlot = model.targets.find((t) => !usedSlots.has(t.id));
    if (!nextSlot) return;

    const candidatePiece = prev.find(
      (p) => p.kind === nextSlot.kind && !p.snappedSlotId
    );
    if (!candidatePiece) return;

    setSelectedPieceId(candidatePiece.id);

    const updated = prev.map((p) =>
      p.id === candidatePiece.id
        ? {
            ...p,
            x: nextSlot.x,
            y: nextSlot.y,
            rotation: nextSlot.rotation,
            flipped: Boolean(nextSlot.flipped),
            snappedSlotId: nextSlot.id
          }
        : p
    );
    piecesRef.current = updated;
    setPieces(updated);

    const count = updated.filter((p) => p.snappedSlotId !== null).length;
    if (count === model.targets.length) {
      playVictoryFanfare(soundEnabled);
      onCompleteFactoryModel(model.id);
    } else {
      playSlotSnap(soundEnabled);
    }

    const msg = `Aiuto: ${candidatePiece.name} va su "${nextSlot.name}"!`;
    setStatusMessage(msg);
    speakForKids(msg, soundEnabled, { delayMs: AUDIO_DELAYS.afterChime, elfId: 'lorenzo' });
  };

  return (
    <div className={limMode ? 'flex-1 min-h-0 flex flex-col gap-2 overflow-hidden' : 'space-y-3'}>
      {/* Model Selector */}
      <div
        className={`grid gap-1 rounded-xl bg-slate-200 p-1 ${
          limMode ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-8' : 'grid-cols-2 sm:grid-cols-4'
        }`}
      >
        {TANGRAM_MODELS.map((item, idx) => {
          const active = idx === modelIdx;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectModel(idx)}
              className={`rounded-lg text-left text-[11px] font-bold transition-colors cursor-pointer ${
                limMode ? 'min-h-[30px] px-2 py-0.5' : 'min-h-[32px] px-2.5 py-1'
              } ${
                active
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'bg-transparent text-slate-900 hover:bg-white/75'
              }`}
            >
              <span className="block truncate">{item.title}</span>
              {!limMode && (
                <span className="block truncate text-[10px] font-medium text-slate-600">
                  {item.targets.length === 0 ? 'Magneti tra pezzi' : '7 pezzi Tangram'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Interactive Tangram Factory Canvas + Controls */}
      <div
        className={`grid grid-cols-1 gap-3 md:grid-cols-12 md:items-stretch ${
          limMode ? 'flex-1 min-h-0' : ''
        }`}
      >
        {/* Left: Interactive Drag & Snap SVG Board */}
        <div
          className={`flex flex-col justify-between rounded-xl bg-[#0F5132] text-white md:col-span-8 ${
            limMode ? 'min-h-0 p-3' : 'p-3.5'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white">
                {model.title}
              </h2>
              <p className="text-[11px] text-emerald-100">
                {isFreeMode
                  ? 'Fabbrica Libera · Trascina al centro per agganciare i pezzi'
                  : `Pezzi incastrati: ${snappedCount}/${model.targets.length}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  playClickPop(soundEnabled);
                  setShowBackdrop((v) => !v);
                }}
                className="inline-flex min-h-[28px] items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-slate-900 hover:bg-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ImageIcon className="h-3 w-3 text-[#0F5132]" aria-hidden="true" />
                <span>{showBackdrop ? 'Sfondo: Scena' : 'Sfondo: Lavagna'}</span>
              </button>

              {isFreeMode ? (
                <button
                  type="button"
                  onClick={() => {
                    playClickPop(soundEnabled);
                    setMagnetEnabled((v) => !v);
                    setMagnetContact(null);
                  }}
                  className={`inline-flex min-h-[28px] items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                    magnetEnabled
                      ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                      : 'bg-white text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Magnet className="h-3 w-3" aria-hidden="true" />
                  <span>{magnetEnabled ? 'Calamita: Sì' : 'Calamita: No'}</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      playClickPop(soundEnabled);
                      setShowGuides((v) => !v);
                    }}
                    className="inline-flex min-h-[28px] items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-slate-900 hover:bg-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {showGuides ? (
                      <Eye className="h-3 w-3 text-[#0F5132]" aria-hidden="true" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-slate-600" aria-hidden="true" />
                    )}
                    <span>{showGuides ? 'Guida: Sì' : 'Guida: Ombra'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={autoPlaceNextPiece}
                    disabled={isComplete}
                    className="inline-flex min-h-[28px] items-center gap-1 rounded-md bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-slate-950 hover:bg-amber-300 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-45"
                  >
                    <HelpCircle className="h-3 w-3" aria-hidden="true" />
                    <span>Aiuto</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={resetBoard}
                className="inline-flex min-h-[28px] items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-slate-900 hover:bg-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3 text-red-600" aria-hidden="true" />
                <span>Ricomincia</span>
              </button>
            </div>
          </div>

          {/* Interactive SVG Workspace */}
          <div
            className={`relative flex flex-1 min-h-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-300/30 bg-[#083822] ${
              limMode ? 'mt-2' : 'mt-2.5'
            }`}
          >
            {showBackdrop && (
              <>
                <ResilientImage
                  src={model.backgroundImage}
                  alt={model.backgroundAlt}
                  fallbackTitle={model.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/42" aria-hidden="true" />
              </>
            )}

            <svg
              ref={svgRef}
              viewBox="0 0 480 340"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`relative z-10 touch-none select-none ${
                limMode ? 'h-full w-full max-h-full' : 'h-auto w-full max-h-[300px]'
              }`}
              role="img"
              aria-label={`Fabbrica Tangram: ${model.title}`}
            >
              {/* Side tray zones */}
              <rect x="12" y="14" width="128" height="312" rx="12" fill="rgba(15,23,42,0.42)" stroke="rgba(255,255,255,0.22)" />
              <rect x="340" y="14" width="128" height="312" rx="12" fill="rgba(15,23,42,0.42)" stroke="rgba(255,255,255,0.22)" />

              {/* Center magnetic workbench hint frame in Free Mode */}
              {isFreeMode && (
                <rect
                  x="148"
                  y="18"
                  width="184"
                  height="304"
                  rx="12"
                  fill="rgba(255,255,255,0.04)"
                  stroke="rgba(253,224,71,0.32)"
                  strokeDasharray="6 4"
                />
              )}

              {/* Target silhouette slots */}
              {model.targets.map((slot) => (
                <g
                  key={slot.id}
                  transform={`translate(${slot.x}, ${slot.y}) rotate(${slot.rotation})`}
                >
                  <polygon
                    points={TAN_POLYGONS[slot.kind]}
                    fill="rgba(15, 23, 42, 0.55)"
                    stroke={showGuides ? '#FDE047' : 'rgba(255,255,255,0.5)'}
                    strokeWidth={showGuides ? 2 : 1.5}
                    strokeDasharray={showGuides ? '5 4' : undefined}
                    strokeLinejoin="round"
                  />
                </g>
              ))}

              {/* Draggable 7 Tangram Pieces */}
              {pieces.map((piece) => {
                const isSelected = selectedPieceId === piece.id;
                const scaleX = piece.flipped ? -1 : 1;
                return (
                  <g
                    key={piece.id}
                    transform={`translate(${piece.x}, ${piece.y}) rotate(${piece.rotation}) scale(${scaleX}, 1)`}
                    onPointerDown={(e) => handlePointerDown(e, piece)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <polygon
                      points={TAN_POLYGONS[piece.kind]}
                      fill={piece.color}
                      stroke={isSelected ? '#FACC15' : '#0F172A'}
                      strokeWidth={isSelected ? 4 : 2.5}
                      strokeLinejoin="round"
                    />
                    {/* Subtle festive star dot in center of piece */}
                    <circle cx="0" cy="0" r="3.5" fill="#FEF3C7" opacity="0.85" pointerEvents="none" />
                  </g>
                );
              })}

              {/* Glowing magnetic snap ring when two pieces attract */}
              {magnetContact && (
                <g pointerEvents="none">
                  <circle
                    cx={magnetContact.x}
                    cy={magnetContact.y}
                    r="11"
                    fill="rgba(250, 204, 21, 0.35)"
                    stroke="#FDE047"
                    strokeWidth="2.5"
                  />
                  <circle cx={magnetContact.x} cy={magnetContact.y} r="3.5" fill="#FFFFFF" />
                </g>
              )}
            </svg>
          </div>

          {/* Direct On-Board Quick Rotation Bar (essential on tablet & LIM!) */}
          <div
            className={`flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#083822] px-2.5 ${
              limMode ? 'mt-1.5 py-1' : 'mt-2 py-1.5'
            }`}
          >
            <span className="text-[11px] font-semibold text-amber-200">
              {selectedPiece
                ? `${selectedPiece.name} (${selectedPiece.rotation}°) · Doppio tocco per ruotare`
                : 'Seleziona un pezzo per ruotarlo'}
            </span>
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                disabled={!selectedPiece}
                onClick={() => rotateSelected(-45)}
                className="inline-flex min-h-[28px] items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-slate-900 hover:bg-amber-100 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-45"
              >
                <RotateCcw className="h-3 w-3 text-[#0F5132]" aria-hidden="true" />
                <span>-45°</span>
              </button>
              <button
                type="button"
                disabled={!selectedPiece}
                onClick={() => rotateSelected(45)}
                className="inline-flex min-h-[28px] items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-slate-900 hover:bg-amber-100 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-45"
              >
                <RotateCw className="h-3 w-3 text-[#0F5132]" aria-hidden="true" />
                <span>+45°</span>
              </button>
              {selectedPiece?.kind === 'parallelogram' && (
                <button
                  type="button"
                  onClick={flipSelected}
                  className="inline-flex min-h-[28px] items-center gap-1 rounded-md bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-slate-950 hover:bg-amber-300 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <FlipHorizontal className="h-3 w-3" aria-hidden="true" />
                  <span>Capovolgi</span>
                </button>
              )}
            </div>
          </div>

          {/* Status & Voice Feedback */}
          <div
            className={`flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#062B1A] px-3 text-white ${
              limMode ? 'mt-1.5 py-1.5 text-xs' : 'mt-2 py-1.5 text-xs sm:text-[13px]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={`shrink-0 overflow-hidden rounded-2xl border-2 border-amber-300/80 bg-white shadow-sm transition-transform ${
                  limMode ? 'h-16 w-16' : 'h-16 w-16 sm:h-20 sm:w-20'
                } ${isLorenzoSpeaking ? 'elf-speaking-active' : ''}`}
              >
                <ResilientImage
                  src={ELF_BY_ID.lorenzo.portraitSrc}
                  alt={ELF_BY_ID.lorenzo.fullName}
                  fallbackTitle={ELF_BY_ID.lorenzo.shortName}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              {isComplete ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden="true" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden="true" />
              )}
              <span className={limMode ? 'line-clamp-1' : ''}>{statusMessage}</span>
            </div>

            <button
              type="button"
              onClick={() => toggleSpeakForKids(statusMessage, { elfId: 'lorenzo' })}
              className="inline-flex min-h-[28px] items-center gap-1 rounded-md bg-amber-400 px-2.5 py-0.5 text-[11px] font-bold text-slate-950 hover:bg-amber-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isSpeaking ? (
                <Square className="h-2.5 w-2.5 fill-slate-950" aria-hidden="true" />
              ) : (
                <Volume2 className="h-3 w-3" aria-hidden="true" />
              )}
              <span>{isSpeaking ? 'Ferma' : 'Ascolta'}</span>
            </button>
          </div>
        </div>

        {/* Right: Tactile Rotation & Piece Controls for Tablet / LIM */}
        <div
          className={`flex flex-col justify-between rounded-xl border border-slate-300 bg-white md:col-span-4 ${
            limMode ? 'min-h-0 overflow-hidden p-3' : 'p-3.5'
          }`}
        >
          <div className={limMode ? 'flex flex-col flex-1 min-h-0 justify-between' : ''}>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Comandi Pezzo
              </h3>
              {!limMode && (
                <p className="mt-0.5 text-[11px] text-slate-600">
                  Tocca un pezzo per selezionarlo, poi ruotalo di 45° o capovolgilo.
                </p>
              )}

              {selectedPiece ? (
                <div
                  className={`rounded-lg border border-slate-200 bg-slate-50 ${
                    limMode ? 'mt-1.5 p-2' : 'mt-2 p-2.5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {selectedPiece.name}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-slate-700 tabular-nums">
                      {selectedPiece.rotation}°
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium text-[#0F5132]">
                    Elemento: {selectedPiece.christmasPart}
                  </p>

                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => rotateSelected(-45)}
                      className="inline-flex min-h-[30px] items-center justify-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-bold text-slate-900 hover:bg-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3 text-[#0F5132]" aria-hidden="true" />
                      <span>-45°</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => rotateSelected(45)}
                      className="inline-flex min-h-[30px] items-center justify-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-bold text-slate-900 hover:bg-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <RotateCw className="h-3 w-3 text-[#0F5132]" aria-hidden="true" />
                      <span>+45°</span>
                    </button>
                  </div>

                  {selectedPiece.kind === 'parallelogram' && (
                    <button
                      type="button"
                      onClick={flipSelected}
                      className="mt-1.5 inline-flex min-h-[30px] w-full items-center justify-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-900 hover:bg-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <FlipHorizontal className="h-3 w-3 text-amber-700" aria-hidden="true" />
                      <span>Capovolgi</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[11px] text-slate-600">
                  Nessun pezzo selezionato: tocca uno dei 7 pezzi colorati.
                </div>
              )}
            </div>

            {/* Quick List of 7 Tans */}
            <div className={limMode ? 'mt-1.5' : 'mt-2.5'}>
              <span className="block text-[11px] font-semibold text-slate-700">
                I 7 pezzi del Tangram
              </span>
              <div className={`mt-1 grid gap-1 ${limMode ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {pieces.map((p) => {
                  const active = p.id === selectedPieceId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        playPiecePickup(soundEnabled);
                        setSelectedPieceId(p.id);
                      }}
                      className={`flex items-center justify-between gap-1.5 rounded-md border text-left font-semibold transition-colors cursor-pointer ${
                        limMode ? 'min-h-[28px] px-2 py-0.5 text-[10px]' : 'min-h-[30px] px-2.5 py-0.5 text-[11px]'
                      } ${
                        active
                          ? 'border-[#0F5132] bg-emerald-50 text-slate-900'
                          : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="inline-block h-2 w-2 rounded-xs shrink-0"
                          style={{ backgroundColor: p.color }}
                          aria-hidden="true"
                        />
                        <span className="truncate">{p.name}</span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-600 shrink-0 tabular-nums">
                        {p.snappedSlotId ? 'OK' : `${p.rotation}°`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
