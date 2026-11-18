import { ShapeId } from '../types/christmasGeometry';

export type ElfCharacterId = 'alfredo' | 'antonio' | 'lorenzo' | 'rossella' | 'stella';

export interface ElfCharacter {
  id: ElfCharacterId;
  shortName: string;
  fullName: string;
  role: string;
  specialtyArea: string;
  badgeLabel: string;
  shapeId: ShapeId;
  portraitSrc: string;
  accentBorder: string;
  accentBg: string;
  greetingSpeech: string;
}

export const ELF_CHARACTERS: ElfCharacter[] = [
  {
    id: 'alfredo',
    shortName: 'Alfredo',
    fullName: 'Elfo Alfredo',
    role: 'Nodo Elfo Equipers',
    specialtyArea: 'Atlante delle Forme',
    badgeLabel: 'Geometria & Logica',
    shapeId: 'triangolo',
    portraitSrc: '/src/assets/images/elfo_alfredo_v2_1795009456410.jpg',
    accentBorder: 'border-emerald-300',
    accentBg: 'bg-emerald-50/75',
    greetingSpeech:
      "Ciao! Sono Elfo Alfredo. Nell'Atlante delle Forme ti aiuto a osservare lati, vertici, angoli e simmetrie!"
  },
  {
    id: 'antonio',
    shortName: 'Antonio',
    fullName: 'Elfo Antonio',
    role: 'Nodo Elfo Equipers',
    specialtyArea: 'Sfida Slitta',
    badgeLabel: 'Coding & Interazione',
    shapeId: 'quadrato',
    portraitSrc: '/src/assets/images/elfo_antonio_v2_1795009453772.jpg',
    accentBorder: 'border-amber-300',
    accentBg: 'bg-amber-50/75',
    greetingSpeech:
      'Ciao! Sono Elfo Antonio. Nella Sfida Slitta prepariamo insieme i regali con le forme geometriche giuste!'
  },
  {
    id: 'lorenzo',
    shortName: 'Lorenzo',
    fullName: 'Elfo Lorenzo',
    role: 'Nodo Elfo Equipers',
    specialtyArea: 'Albero & Tangram',
    badgeLabel: 'Tangram & Design',
    shapeId: 'esagono',
    portraitSrc: '/src/assets/images/elfo_lorenzo_v2_1795009456477.jpg',
    accentBorder: 'border-teal-300',
    accentBg: 'bg-teal-50/75',
    greetingSpeech:
      "Ciao! Sono Elfo Lorenzo. Tra Albero Magico e Fabbrica Tangram ti guido a ruotare e incastrare ogni pezzo!"
  },
  {
    id: 'rossella',
    shortName: 'Rossella',
    fullName: 'Elfa Rossella',
    role: 'Nodo Elfo Equipers',
    specialtyArea: 'Indovinelli Geometrici',
    badgeLabel: 'Didattica Primaria',
    shapeId: 'rombo',
    portraitSrc: '/src/assets/images/elfa_rossella_1795008692519.jpg',
    accentBorder: 'border-sky-300',
    accentBg: 'bg-sky-50/75',
    greetingSpeech:
      'Ciao! Sono Elfa Rossella. Negli Indovinelli Geometrici ti do gli indizi giusti per scoprire le figure!'
  },
  {
    id: 'stella',
    shortName: 'Stella',
    fullName: 'Elfa Stella',
    role: 'Nodo Elfo Equipers',
    specialtyArea: 'Dashboard & Certificati',
    badgeLabel: 'Creatività & LIM',
    shapeId: 'stella',
    portraitSrc: '/src/assets/images/elfa_stella_1795008691557.jpg',
    accentBorder: 'border-yellow-400',
    accentBg: 'bg-yellow-50/85',
    greetingSpeech:
      "Ciao! Sono Elfa Stella. Ti accolgo nella classe LIM e firmo il tuo Certificato dell'Elfo Geometra!"
  }
];

export const ELF_BY_ID: Record<ElfCharacterId, ElfCharacter> = ELF_CHARACTERS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<ElfCharacterId, ElfCharacter>
);
