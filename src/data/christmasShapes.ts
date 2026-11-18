import { ChristmasShapeDef, RiddleItem, SchoolLevel, ShapeId, TangramPuzzle } from '../types/christmasGeometry';

export const SCHOOL_LEVEL_INFO: Record<
  SchoolLevel,
  { label: string; classes: string; summary: string }
> = {
  base: {
    label: 'Livello Base',
    classes: 'Classi 1ª e 2ª',
    summary: 'Cerchio, quadrato, triangolo, rettangolo e stella tra regali e decorazioni.'
  },
  poligoni: {
    label: 'Livello Poligoni',
    classes: 'Classi 3ª e 4ª',
    summary: 'Rombo, trapezio, pentagono, esagono e ottagono con lati e vertici.'
  },
  esperti: {
    label: 'Livello Esperti',
    classes: 'Classe 5ª',
    summary: 'Tutte le figure piane, gli angoli retti, le simmetrie e i solidi di Natale.'
  }
};

export const CHRISTMAS_SHAPES: ChristmasShapeDef[] = [
  {
    id: 'cerchio',
    name: 'Cerchio',
    articleName: 'il cerchio',
    category: 'piana',
    level: 'base',
    sides: 0,
    vertices: 0,
    rightAngles: 0,
    symmetryAxes: 'Infiniti',
    christmasObject: "Pallina dell'Albero",
    christmasClue: 'Rotola sul tavolo ed è perfetto per appendere una pallina colorata.',
    description: 'Una figura piana racchiusa da una linea curva chiusa: non ha lati dritti né spigoli.',
    schoolTip: 'Tutti i punti del bordo hanno la stessa distanza dal centro.',
    fillHex: '#DC2626',
    strokeHex: '#991B1B',
    atlasBackgroundImage: '/src/assets/images/atlas_cerchio_1794996124896.jpg',
    atlasBackgroundAlt: 'Palline rotonde rosse e dorate appese ai rami dell’albero di Natale',
    atlasMatchCaption: 'Guarda la pallina rossa appesa al ramo: il suo contorno è un cerchio perfetto senza spigoli!'
  },
  {
    id: 'quadrato',
    name: 'Quadrato',
    articleName: 'il quadrato',
    category: 'piana',
    level: 'base',
    sides: 4,
    vertices: 4,
    rightAngles: 4,
    symmetryAxes: '4',
    christmasObject: 'Pacco Regalo Quadrato',
    christmasClue: 'Ha quattro lati uguali e un bel fiocco rosso proprio al centro.',
    description: 'Un quadrilatero con 4 lati tutti della stessa lunghezza e 4 angoli retti.',
    schoolTip: 'Se lo ruoti di un quarto di giro resta identico.',
    fillHex: '#D97706',
    strokeHex: '#92400E',
    atlasBackgroundImage: '/src/assets/images/atlas_quadrato_1794996126359.jpg',
    atlasBackgroundAlt: 'Pacco regalo dorato visto dall’alto con nastro rosso incrociato',
    atlasMatchCaption: 'Osserva il coperchio del pacco regalo dorato: 4 lati uguali e 4 angoli dritti come un quadrato!'
  },
  {
    id: 'triangolo',
    name: 'Triangolo',
    articleName: 'il triangolo',
    category: 'piana',
    level: 'base',
    sides: 3,
    vertices: 3,
    rightAngles: 0,
    symmetryAxes: '3 (equilatero)',
    christmasObject: "Punta dell'Abete",
    christmasClue: 'Sembra il cappello a punta di un elfo o la chioma verde di un abete.',
    description: 'Il poligono con il minor numero di lati possibile: esattamente 3 lati e 3 vertici.',
    schoolTip: 'La parola tri-angolo significa proprio che ha tre angoli.',
    fillHex: '#15803D',
    strokeHex: '#14532D',
    atlasBackgroundImage: '/src/assets/images/atlas_triangolo_1794996125022.jpg',
    atlasBackgroundAlt: 'Abete verde innevato dalla sagoma triangolare nel bosco invernale',
    atlasMatchCaption: 'Segui la chioma dell’abete innevato: dalla punta in cima scende formando un grande triangolo!'
  },
  {
    id: 'rettangolo',
    name: 'Rettangolo',
    articleName: 'il rettangolo',
    category: 'piana',
    level: 'base',
    sides: 4,
    vertices: 4,
    rightAngles: 4,
    symmetryAxes: '2',
    christmasObject: 'Biglietto di Auguri',
    christmasClue: 'Ha i lati opposti uguali, come una busta per la lettera a Babbo Natale.',
    description: 'Un quadrilatero con 4 angoli retti e i lati opposti uguali e paralleli a due a due.',
    schoolTip: 'Due lati sono più lunghi (base) e due più corti (altezza).',
    fillHex: '#0284C7',
    strokeHex: '#075985',
    atlasBackgroundImage: '/src/assets/images/atlas_rettangolo_1794996125956.jpg',
    atlasBackgroundAlt: 'Biglietto di auguri natalizio e busta rossa sul tavolo di legno',
    atlasMatchCaption: 'Guarda la busta rossa e il biglietto d’auguri: hanno due lati più lunghi e due più corti!'
  },
  {
    id: 'stella',
    name: 'Stella',
    articleName: 'la stella',
    category: 'piana',
    level: 'base',
    sides: 10,
    vertices: 10,
    rightAngles: 0,
    symmetryAxes: '5',
    christmasObject: "Puntale dell'Albero",
    christmasClue: 'Brilla in cima all’albero di Natale con cinque punte luminose.',
    description: 'Un poligono stellato formato da 5 punte esterne e 5 rientranze interne.',
    schoolTip: 'Conta i tratti del contorno: sono 10 lati in tutto.',
    fillHex: '#EAB308',
    strokeHex: '#A16207',
    atlasBackgroundImage: '/src/assets/images/atlas_stella_1794996126696.jpg',
    atlasBackgroundAlt: 'Puntale a stella dorato a cinque punte sulla cima dell’albero di Natale',
    atlasMatchCaption: 'In cima all’albero splende il puntale d’oro: conta le sue 5 punte luminose!'
  },
  {
    id: 'rombo',
    name: 'Rombo',
    articleName: 'il rombo',
    category: 'piana',
    level: 'poligoni',
    sides: 4,
    vertices: 4,
    rightAngles: 0,
    symmetryAxes: '2',
    christmasObject: 'Cristallo di Ghiaccio',
    christmasClue: 'Sembra un aquilone o un cristallo scintillante appeso alla finestra.',
    description: 'Un quadrilatero con 4 lati tutti uguali, ma con 2 angoli acuti e 2 angoli ottusi.',
    schoolTip: 'Le due diagonali del rombo si incrociano formando angoli retti.',
    fillHex: '#0EA5E9',
    strokeHex: '#0369A1',
    atlasBackgroundImage: '/src/assets/images/atlas_rombo_1794996128215.jpg',
    atlasBackgroundAlt: 'Decorazioni di cristallo di ghiaccio a forma di rombo appese davanti alla finestra innevata',
    atlasMatchCaption: 'I cristalli di ghiaccio appesi alla finestra hanno 4 lati uguali con le punte in alto e in basso!'
  },
  {
    id: 'trapezio',
    name: 'Trapezio',
    articleName: 'il trapezio',
    category: 'piana',
    level: 'poligoni',
    sides: 4,
    vertices: 4,
    rightAngles: 0,
    symmetryAxes: '1 (isoscele)',
    christmasObject: 'Panettone di Natale',
    christmasClue: 'Ha la base più larga in basso e quella più stretta in alto, proprio come un dolce panettone!',
    description: 'Un quadrilatero che ha almeno una coppia di lati paralleli chiamati basi.',
    schoolTip: 'La base maggiore è più lunga della base minore, come nel panettone.',
    fillHex: '#B45309',
    strokeHex: '#78350F',
    atlasBackgroundImage: '/src/assets/images/atlas_trapezio_1794996127764.jpg',
    atlasBackgroundAlt: 'Panettone di Natale sul tavolo imbandito con profilo a trapezio',
    atlasMatchCaption: 'Osserva il panettone sul tavolo: ha la base più larga in basso, quella più stretta in alto e due lati inclinati come un trapezio!'
  },
  {
    id: 'pentagono',
    name: 'Pentagono',
    articleName: 'il pentagono',
    category: 'piana',
    level: 'poligoni',
    sides: 5,
    vertices: 5,
    rightAngles: 0,
    symmetryAxes: '5',
    christmasObject: 'Casetta di Marzapane',
    christmasClue: 'Ha cinque lati e ricorda la sagoma frontale di una casetta col tetto a punta.',
    description: 'Un poligono con 5 lati e 5 vertici. Quando è regolare, tutti i lati sono uguali.',
    schoolTip: 'Il prefisso penta- in greco significa cinque.',
    fillHex: '#EA580C',
    strokeHex: '#9A3412',
    atlasBackgroundImage: '/src/assets/images/atlas_pentagono_1794996147149.jpg',
    atlasBackgroundAlt: 'Casetta di marzapane decorata vista di fronte con sagoma a cinque lati',
    atlasMatchCaption: 'Conta i lati della facciata della casetta di marzapane: base, due pareti e due falde del tetto fanno 5 lati!'
  },
  {
    id: 'esagono',
    name: 'Esagono',
    articleName: 'l’esagono',
    category: 'piana',
    level: 'poligoni',
    sides: 6,
    vertices: 6,
    rightAngles: 0,
    symmetryAxes: '6',
    christmasObject: 'Fiocco di Neve',
    christmasClue: 'Ogni vero fiocco di neve ha sei punte e nasce proprio da questa forma.',
    description: 'Un poligono con 6 lati e 6 vertici, molto diffuso in natura nei cristalli e negli alveari.',
    schoolTip: 'Esa- significa sei: conta i 6 vertici attorno al centro.',
    fillHex: '#0D9488',
    strokeHex: '#115E59',
    atlasBackgroundImage: '/src/assets/images/atlas_esagono_1794996148405.jpg',
    atlasBackgroundAlt: 'Grande fiocco di neve cristallino a sei punte su sfondo invernale',
    atlasMatchCaption: 'Al centro del fiocco di neve c’è un cristallo perfetto con 6 lati e 6 raggi simmetrici!'
  },
  {
    id: 'ottagono',
    name: 'Ottagono',
    articleName: 'l’ottagono',
    category: 'piana',
    level: 'poligoni',
    sides: 8,
    vertices: 8,
    rightAngles: 0,
    symmetryAxes: '8',
    christmasObject: 'Medaglione delle Feste',
    christmasClue: 'Un grande medaglione da tavolo con otto lati regolari tutto intorno.',
    description: 'Un poligono con 8 lati e 8 vertici. Ha la stessa forma dei cartelli stradali di STOP.',
    schoolTip: 'Otto lati uguali formano una corona quasi rotonda.',
    fillHex: '#7C3AED',
    strokeHex: '#5B21B6',
    atlasBackgroundImage: '/src/assets/images/atlas_ottagono_1794996146950.jpg',
    atlasBackgroundAlt: 'Vassoio e medaglione natalizio dorato a otto lati circondato da agrifoglio',
    atlasMatchCaption: 'Guarda il bordo del medaglione dorato delle feste: conta gli 8 lati uguali lungo tutta la cornice!'
  },
  {
    id: 'cubo',
    name: 'Cubo',
    articleName: 'il cubo',
    category: 'solido',
    level: 'esperti',
    sides: 12,
    vertices: 8,
    rightAngles: 24,
    symmetryAxes: '9 piani',
    christmasObject: 'Scatola Regalo 3D',
    christmasClue: 'Un solido con 6 facce quadrate tutte uguali, perfetto per un grande regalo.',
    description: 'Un solido geometrico (figura in 3D) formato da 6 facce quadrate, 12 spigoli e 8 vertici.',
    schoolTip: 'Le figure piane hanno 2 dimensioni; i solidi occupano spazio in 3D.',
    fillHex: '#DC2626',
    strokeHex: '#7F1D1D',
    atlasBackgroundImage: '/src/assets/images/atlas_cubo_1794996147475.jpg',
    atlasBackgroundAlt: 'Scatola regalo rossa tridimensionale a forma di cubo con fiocco dorato',
    atlasMatchCaption: 'La scatola regalo rossa occupa spazio in 3D: ogni sua faccia visibile è un quadrato perfetto!'
  },
  {
    id: 'sfera',
    name: 'Sfera',
    articleName: 'la sfera',
    category: 'solido',
    level: 'esperti',
    sides: 0,
    vertices: 0,
    rightAngles: 0,
    symmetryAxes: 'Infiniti',
    christmasObject: 'Boccia di Vetro',
    christmasClue: 'Una palla di vetro o di neve che si può tenere in mano in tre dimensioni.',
    description: 'Un solido rotondo completamente liscio senza facce piane, spigoli o vertici.',
    schoolTip: 'Attenzione: il cerchio è piatto su un foglio, la sfera è piena nello spazio!',
    fillHex: '#0284C7',
    strokeHex: '#0C4A6E',
    atlasBackgroundImage: '/src/assets/images/atlas_sfera_1794996148937.jpg',
    atlasBackgroundAlt: 'Palla di neve in vetro trasparente con paesaggio invernale all’interno',
    atlasMatchCaption: 'La boccia di vetro con la neve dentro non è piatta come un foglio: è una sfera piena in 3D!'
  },
  {
    id: 'cono',
    name: 'Cono',
    articleName: 'il cono',
    category: 'solido',
    level: 'esperti',
    sides: 1,
    vertices: 1,
    rightAngles: 0,
    symmetryAxes: 'Infiniti',
    christmasObject: 'Cappello di Babbo Natale',
    christmasClue: 'Ha una base circolare sotto e sale fino a una sola punta in cima.',
    description: 'Un solido con una sola faccia piana a forma di cerchio e un solo vertice in alto.',
    schoolTip: 'Assomiglia a un cappellino delle feste o a un cono gelato rovesciato.',
    fillHex: '#15803D',
    strokeHex: '#14532D',
    atlasBackgroundImage: '/src/assets/images/atlas_cono_1794996148800.jpg',
    atlasBackgroundAlt: 'Cappello rosso di Babbo Natale con bordo bianco rotondo e punta in alto',
    atlasMatchCaption: 'Il cappello di Babbo Natale ha la base rotonda per la testa e sale fino a una sola punta!'
  },
  {
    id: 'cilindro',
    name: 'Cilindro',
    articleName: 'il cilindro',
    category: 'solido',
    level: 'esperti',
    sides: 2,
    vertices: 0,
    rightAngles: 0,
    symmetryAxes: 'Infiniti',
    christmasObject: 'Candela di Natale',
    christmasClue: 'Sta in piedi su due basi rotonde uguali, proprio come una candela accesa.',
    description: 'Un solido con 2 facce piane circolari parallele e una superficie curva attorno.',
    schoolTip: 'Non ha vertici appuntiti, ma può rotolare di lato.',
    fillHex: '#D97706',
    strokeHex: '#78350F',
    atlasBackgroundImage: '/src/assets/images/atlas_cilindro_1794996149335.jpg',
    atlasBackgroundAlt: 'Candele natalizie cilindriche accese a strisce bianche e rosse sul tavolo delle feste',
    atlasMatchCaption: 'Guarda le candele accese: il corpo è rotondo senza spigoli e poggia su una base circolare!'
  }
];

export function getShapesForLevel(level: SchoolLevel): ChristmasShapeDef[] {
  if (level === 'base') {
    return CHRISTMAS_SHAPES.filter((s) => s.level === 'base');
  }
  if (level === 'poligoni') {
    return CHRISTMAS_SHAPES.filter((s) => s.level === 'base' || s.level === 'poligoni');
  }
  return CHRISTMAS_SHAPES;
}

export function getShapeById(id: ShapeId): ChristmasShapeDef {
  return CHRISTMAS_SHAPES.find((s) => s.id === id) ?? CHRISTMAS_SHAPES[0];
}

export const TANGRAM_PUZZLES: TangramPuzzle[] = [
  {
    id: 'albero-natale',
    title: 'Albero di Natale',
    levelLabel: '1ª–2ª Classe',
    subtitle: 'Costruisci l’abete nella radura innevata scegliendo triangoli, rettangolo, stella e palline.',
    backgroundImage: '/src/assets/images/bg_snowy_forest_clearing_1794994126896.jpg',
    backgroundAlt: 'Radura innevata tra gli abeti sotto il cielo stellato',
    palette: ['stella', 'triangolo', 'rettangolo', 'cerchio'],
    slots: [
      {
        slotId: 'puntale',
        shapeId: 'stella',
        label: 'Puntale',
        x: 200,
        y: 42,
        width: 56,
        height: 56,
        fillColor: '#EAB308',
        hint: 'In cima all’albero brilla una figura a 5 punte.'
      },
      {
        slotId: 'chioma-alta',
        shapeId: 'triangolo',
        label: 'Punta alta',
        x: 200,
        y: 112,
        width: 112,
        height: 82,
        fillColor: '#16A34A',
        hint: 'Qui serve un triangolo con 3 lati e 3 vertici.'
      },
      {
        slotId: 'chioma-bassa',
        shapeId: 'triangolo',
        label: 'Chioma grande',
        x: 200,
        y: 186,
        width: 176,
        height: 102,
        fillColor: '#15803D',
        hint: 'Un altro triangolo per allargare i rami dell’abete.'
      },
      {
        slotId: 'pallina-sx',
        shapeId: 'cerchio',
        label: 'Pallina sinistra',
        x: 162,
        y: 202,
        width: 30,
        height: 30,
        fillColor: '#DC2626',
        hint: 'Una pallina rotonda senza spigoli!'
      },
      {
        slotId: 'pallina-dx',
        shapeId: 'cerchio',
        label: 'Pallina destra',
        x: 236,
        y: 196,
        width: 30,
        height: 30,
        fillColor: '#0284C7',
        hint: 'Un’altra pallina a forma di cerchio.'
      },
      {
        slotId: 'tronco',
        shapeId: 'rettangolo',
        label: 'Tronco',
        x: 200,
        y: 266,
        width: 44,
        height: 56,
        fillColor: '#92400E',
        hint: 'La base dell’albero ha 4 angoli retti e lati opposti uguali.'
      }
    ]
  },
  {
    id: 'casetta-marzapane',
    title: 'Casetta di Marzapane',
    levelLabel: '2ª–3ª Classe',
    subtitle: 'Unisci tetto, pareti, porta e finestre geometriche nella radura del bosco.',
    backgroundImage: '/src/assets/images/bg_snowy_forest_clearing_1794994126896.jpg',
    backgroundAlt: 'Radura innevata nel bosco di Natale',
    palette: ['triangolo', 'quadrato', 'rettangolo', 'cerchio', 'rombo'],
    slots: [
      {
        slotId: 'tetto',
        shapeId: 'triangolo',
        label: 'Tetto',
        x: 200,
        y: 94,
        width: 196,
        height: 92,
        fillColor: '#DC2626',
        hint: 'Il tetto spiovente ha 3 lati.'
      },
      {
        slotId: 'parete',
        shapeId: 'quadrato',
        label: 'Parete',
        x: 200,
        y: 206,
        width: 146,
        height: 136,
        fillColor: '#D97706',
        hint: 'Il corpo della casetta è un quadrato con 4 lati uguali.'
      },
      {
        slotId: 'porta',
        shapeId: 'rettangolo',
        label: 'Porta',
        x: 175,
        y: 236,
        width: 42,
        height: 74,
        fillColor: '#78350F',
        hint: 'La porta è alta e stretta: è un rettangolo!'
      },
      {
        slotId: 'finestra-tonda',
        shapeId: 'cerchio',
        label: 'Oblò tetto',
        x: 200,
        y: 108,
        width: 32,
        height: 32,
        fillColor: '#BAE6FD',
        hint: 'Sotto la punta del tetto c’è un piccolo oblò rotondo.'
      },
      {
        slotId: 'decoro-rombo',
        shapeId: 'rombo',
        label: 'Finestra cristallo',
        x: 236,
        y: 196,
        width: 40,
        height: 46,
        fillColor: '#0EA5E9',
        hint: 'Questa finestra inclinata ha 4 lati uguali ma senza angoli retti.'
      }
    ]
  },
  {
    id: 'slitta-doni',
    title: 'Slitta dei Doni',
    levelLabel: '2ª–3ª Classe',
    subtitle: 'Costruisci la slitta carica di pacchi sulla neve con trapezio, quadrati e stella.',
    backgroundImage: '/src/assets/images/santa_sleigh_scene_1794993393513.jpg',
    backgroundAlt: 'Paesaggio invernale con pini innevati e cielo stellato',
    palette: ['trapezio', 'rettangolo', 'quadrato', 'triangolo', 'stella'],
    slots: [
      {
        slotId: 'pacco-grande',
        shapeId: 'quadrato',
        label: 'Pacco grande',
        x: 158,
        y: 144,
        width: 56,
        height: 56,
        fillColor: '#D97706',
        hint: 'Un pacco regalo con 4 lati tutti uguali.'
      },
      {
        slotId: 'pacco-punta',
        shapeId: 'triangolo',
        label: 'Pacco triangolare',
        x: 222,
        y: 146,
        width: 58,
        height: 52,
        fillColor: '#16A34A',
        hint: 'Sopra la slitta c’è un pacco a 3 lati!'
      },
      {
        slotId: 'stella-fiocco',
        shapeId: 'stella',
        label: 'Sigillo stella',
        x: 158,
        y: 96,
        width: 38,
        height: 38,
        fillColor: '#EAB308',
        hint: 'Sopra il pacco brilla una stella a 5 punte.'
      },
      {
        slotId: 'scocca-slitta',
        shapeId: 'trapezio',
        label: 'Scocca slitta',
        x: 198,
        y: 204,
        width: 190,
        height: 62,
        rotation: 180,
        fillColor: '#DC2626',
        hint: 'Il corpo della slitta ha due basi parallele diverse: un trapezio!'
      },
      {
        slotId: 'pattini',
        shapeId: 'rettangolo',
        label: 'Pattino neve',
        x: 198,
        y: 256,
        width: 210,
        height: 20,
        fillColor: '#92400E',
        hint: 'La base lunga e sottile per scivolare sulla neve è un rettangolo.'
      }
    ]
  },
  {
    id: 'pupazzo-neve',
    title: 'Pupazzo di Neve',
    levelLabel: '3ª–4ª Classe',
    subtitle: 'Componi il pupazzo nella radura con cerchi, trapezio, rettangolo, triangolo e quadrato.',
    backgroundImage: '/src/assets/images/bg_snowy_forest_clearing_1794994126896.jpg',
    backgroundAlt: 'Radura innevata sotto la luna invernale',
    palette: ['cerchio', 'triangolo', 'quadrato', 'rettangolo', 'trapezio'],
    slots: [
      {
        slotId: 'cappello-testa',
        shapeId: 'quadrato',
        label: 'Tubo cappello',
        x: 200,
        y: 58,
        width: 50,
        height: 46,
        fillColor: '#1E293B',
        hint: 'La parte alta del cilindro del pupazzo è un quadrato scuro.'
      },
      {
        slotId: 'cappello-tesa',
        shapeId: 'rettangolo',
        label: 'Tesa cappello',
        x: 200,
        y: 86,
        width: 86,
        height: 16,
        fillColor: '#DC2626',
        hint: 'Una fascia rossa lunga e stretta: scegli il rettangolo.'
      },
      {
        slotId: 'testa',
        shapeId: 'cerchio',
        label: 'Testa',
        x: 200,
        y: 126,
        width: 68,
        height: 68,
        fillColor: '#F1F5F9',
        hint: 'La palla di neve più piccola è un cerchio.'
      },
      {
        slotId: 'naso',
        shapeId: 'triangolo',
        label: 'Naso carota',
        x: 222,
        y: 128,
        width: 30,
        height: 18,
        rotation: 90,
        fillColor: '#EA580C',
        hint: 'La carota appuntita ha 3 lati: è un triangolo!'
      },
      {
        slotId: 'sciarpa',
        shapeId: 'trapezio',
        label: 'Sciarpa',
        x: 200,
        y: 170,
        width: 78,
        height: 26,
        fillColor: '#16A34A',
        hint: 'La sciarpa si allarga verso il basso: cerca il trapezio.'
      },
      {
        slotId: 'pancia',
        shapeId: 'cerchio',
        label: 'Corpo',
        x: 200,
        y: 238,
        width: 112,
        height: 112,
        fillColor: '#F8FAFC',
        hint: 'La grande palla di neve alla base è un cerchio.'
      }
    ]
  },
  {
    id: 'angelo-natale',
    title: 'Angelo di Natale',
    levelLabel: '3ª–4ª Classe',
    subtitle: 'Componi l’angelo nel cielo stellato usando stella, cerchio, triangolo, rombi e trapezio.',
    backgroundImage: '/src/assets/images/bg_starry_winter_sky_1794994127354.jpg',
    backgroundAlt: 'Cielo notturno invernale con aurora e stelle',
    palette: ['stella', 'cerchio', 'triangolo', 'rombo', 'trapezio'],
    slots: [
      {
        slotId: 'aureola',
        shapeId: 'stella',
        label: 'Stella guida',
        x: 200,
        y: 44,
        width: 44,
        height: 44,
        fillColor: '#FACC15',
        hint: 'Sopra l’angelo brilla una stella a cinque punte.'
      },
      {
        slotId: 'testa-angelo',
        shapeId: 'cerchio',
        label: 'Viso',
        x: 200,
        y: 96,
        width: 48,
        height: 48,
        fillColor: '#FEF3C7',
        hint: 'Il viso dell’angelo è perfettamente rotondo: un cerchio.'
      },
      {
        slotId: 'ala-sx',
        shapeId: 'rombo',
        label: 'Ala sinistra',
        x: 132,
        y: 146,
        width: 64,
        height: 82,
        rotation: -35,
        fillColor: '#BAE6FD',
        hint: 'Le ali hanno 4 lati uguali e angoli acuti e ottusi: scegli il rombo!'
      },
      {
        slotId: 'ala-dx',
        shapeId: 'rombo',
        label: 'Ala destra',
        x: 268,
        y: 146,
        width: 64,
        height: 82,
        rotation: 35,
        fillColor: '#BAE6FD',
        hint: 'Anche l’ala destra è un rombo simmetrico.'
      },
      {
        slotId: 'abito-angelo',
        shapeId: 'triangolo',
        label: 'Veste',
        x: 200,
        y: 178,
        width: 112,
        height: 110,
        fillColor: '#FFFFFF',
        hint: 'La veste scende allargandosi con 3 lati: è un triangolo.'
      },
      {
        slotId: 'nuvola-base',
        shapeId: 'trapezio',
        label: 'Nuvola d’oro',
        x: 200,
        y: 254,
        width: 152,
        height: 36,
        fillColor: '#FDE68A',
        hint: 'Alla base c’è una soffice nuvola a forma di trapezio.'
      }
    ]
  },
  {
    id: 'trenino-regali',
    title: 'Trenino dei Regali',
    levelLabel: '4ª–5ª Classe',
    subtitle: 'Assembla la locomotiva sui binari innevati usando poligoni e ruote perfettamente tonde.',
    backgroundImage: '/src/assets/images/bg_winter_railway_bridge_1794994127233.jpg',
    backgroundAlt: 'Binari ferroviari nella valle alpina innevata',
    palette: ['rettangolo', 'quadrato', 'triangolo', 'cerchio', 'esagono', 'trapezio'],
    slots: [
      {
        slotId: 'caldaia',
        shapeId: 'rettangolo',
        label: 'Caldaia',
        x: 158,
        y: 190,
        width: 126,
        height: 66,
        fillColor: '#DC2626',
        hint: 'Il corpo orizzontale della locomotiva è un rettangolo.'
      },
      {
        slotId: 'cabina',
        shapeId: 'quadrato',
        label: 'Cabina',
        x: 264,
        y: 168,
        width: 84,
        height: 84,
        fillColor: '#15803D',
        hint: 'La cabina del macchinista ha tutti e 4 i lati uguali.'
      },
      {
        slotId: 'tetto-cabina',
        shapeId: 'trapezio',
        label: 'Tetto cabina',
        x: 264,
        y: 114,
        width: 102,
        height: 26,
        fillColor: '#D97706',
        hint: 'Sopra la cabina c’è una tettoia a forma di trapezio.'
      },
      {
        slotId: 'fumo-esagono',
        shapeId: 'esagono',
        label: 'Nuvola magica',
        x: 126,
        y: 92,
        width: 48,
        height: 48,
        fillColor: '#0D9488',
        hint: 'Dal camino esce un cristallo con 6 lati: l’esagono!'
      },
      {
        slotId: 'spazzaneve',
        shapeId: 'triangolo',
        label: 'Spazzaneve',
        x: 78,
        y: 204,
        width: 44,
        height: 44,
        rotation: -90,
        fillColor: '#EAB308',
        hint: 'La punta davanti al treno ha 3 lati.'
      },
      {
        slotId: 'ruota-1',
        shapeId: 'cerchio',
        label: 'Ruota anteriore',
        x: 128,
        y: 248,
        width: 46,
        height: 46,
        fillColor: '#1E293B',
        hint: 'Per rotolare sui binari serve un cerchio.'
      },
      {
        slotId: 'ruota-2',
        shapeId: 'cerchio',
        label: 'Ruota posteriore',
        x: 248,
        y: 248,
        width: 54,
        height: 54,
        fillColor: '#1E293B',
        hint: 'Un altro cerchio per la ruota grande!'
      }
    ]
  },
  {
    id: 'stella-cometa',
    title: 'Cometa e Cristallo',
    levelLabel: '4ª–5ª Classe',
    subtitle: 'Accendi la notte stellata costruendo una cometa con ottagono, esagono, stella e triangoli.',
    backgroundImage: '/src/assets/images/bg_starry_winter_sky_1794994127354.jpg',
    backgroundAlt: 'Cielo stellato d’inverno sopra le colline innevate',
    palette: ['stella', 'ottagono', 'esagono', 'triangolo', 'rombo'],
    slots: [
      {
        slotId: 'nucleo-ottagono',
        shapeId: 'ottagono',
        label: 'Nucleo cometa',
        x: 112,
        y: 128,
        width: 78,
        height: 78,
        fillColor: '#F59E0B',
        hint: 'Il nucleo centrale della cometa ha 8 lati: è un ottagono!'
      },
      {
        slotId: 'stella-cuore',
        shapeId: 'stella',
        label: 'Cuore brillante',
        x: 112,
        y: 128,
        width: 44,
        height: 44,
        fillColor: '#FEF08A',
        hint: 'Al centro del nucleo splende una stella a 5 punte.'
      },
      {
        slotId: 'coda-alta',
        shapeId: 'triangolo',
        label: 'Scia superiore',
        x: 224,
        y: 102,
        width: 52,
        height: 138,
        rotation: 82,
        fillColor: '#FDE047',
        hint: 'La scia luminosa superiore è un lungo triangolo.'
      },
      {
        slotId: 'coda-bassa',
        shapeId: 'triangolo',
        label: 'Scia inferiore',
        x: 226,
        y: 156,
        width: 52,
        height: 138,
        rotation: 98,
        fillColor: '#FBBF24',
        hint: 'Anche la scia inferiore ha 3 lati e 3 vertici.'
      },
      {
        slotId: 'cristallo-neve',
        shapeId: 'esagono',
        label: 'Cristallo di neve',
        x: 314,
        y: 78,
        width: 54,
        height: 54,
        fillColor: '#38BDF8',
        hint: 'Ogni cristallo di neve ha 6 lati: scegli l’esagono!'
      },
      {
        slotId: 'bagliore',
        shapeId: 'rombo',
        label: 'Bagliore',
        x: 304,
        y: 198,
        width: 44,
        height: 56,
        fillColor: '#7DD3FC',
        hint: 'Un piccolo diamante con 4 lati uguali: il rombo.'
      }
    ]
  },
  {
    id: 'candela-feste',
    title: 'Candela delle Feste',
    levelLabel: '4ª–5ª Classe',
    subtitle: 'Decora la sala della baita costruendo candela, ghirlanda ottagonale e pacco pentagonale.',
    backgroundImage: '/src/assets/images/bg_christmas_hearth_1794994128347.jpg',
    backgroundAlt: 'Stanza in legno decorata con ghirlande e luci natalizie',
    palette: ['rettangolo', 'rombo', 'trapezio', 'ottagono', 'cerchio', 'pentagono'],
    slots: [
      {
        slotId: 'ghirlanda-esterna',
        shapeId: 'ottagono',
        label: 'Ghirlanda',
        x: 112,
        y: 118,
        width: 90,
        height: 90,
        fillColor: '#15803D',
        hint: 'La corona appesa alla parete ha 8 lati: l’ottagono!'
      },
      {
        slotId: 'ghirlanda-centro',
        shapeId: 'cerchio',
        label: 'Centro corona',
        x: 112,
        y: 118,
        width: 38,
        height: 38,
        fillColor: '#DC2626',
        hint: 'Al centro della ghirlanda c’è un medaglione rotondo: un cerchio.'
      },
      {
        slotId: 'fiamma',
        shapeId: 'rombo',
        label: 'Fiamma',
        x: 214,
        y: 74,
        width: 28,
        height: 44,
        fillColor: '#FACC15',
        hint: 'La fiammella appuntita ha 4 lati uguali: usa il rombo.'
      },
      {
        slotId: 'candela-corpo',
        shapeId: 'rettangolo',
        label: 'Candela',
        x: 214,
        y: 154,
        width: 44,
        height: 102,
        fillColor: '#DC2626',
        hint: 'Il fusto della candela è alto con 4 angoli retti: il rettangolo.'
      },
      {
        slotId: 'portacandela',
        shapeId: 'trapezio',
        label: 'Portacandela',
        x: 214,
        y: 224,
        width: 94,
        height: 32,
        fillColor: '#D97706',
        hint: 'La base dorata che sostiene la candela è un trapezio.'
      },
      {
        slotId: 'pacco-pentagono',
        shapeId: 'pentagono',
        label: 'Casetta regalo',
        x: 312,
        y: 204,
        width: 72,
        height: 72,
        fillColor: '#0284C7',
        hint: 'Questo pacchetto speciale ha 5 lati e 5 vertici: il pentagono!'
      }
    ]
  }
];

export const RIDDLES_BANK: RiddleItem[] = [
  {
    id: 'r-1',
    level: 'base',
    question: 'Ho esattamente 3 lati e 3 punte. Sul tavolo sembro la punta di un albero di Natale. Chi sono?',
    clues: ['Il mio nome inizia con "Tri-" che significa tre.', 'Non ho lati curvi e ho 3 vertici.'],
    correctShapeId: 'triangolo',
    optionShapeIds: ['triangolo', 'quadrato', 'cerchio', 'stella'],
    explanation: 'Il triangolo ha sempre 3 lati e 3 vertici!'
  },
  {
    id: 'r-2',
    level: 'base',
    question: 'Non ho né lati né spigoli e posso rotolare come una pallina appesa ai rami. Chi sono?',
    clues: ['Il mio bordo è una linea curva chiusa.', 'Tutti i punti del bordo hanno la stessa distanza dal centro.'],
    correctShapeId: 'cerchio',
    optionShapeIds: ['cerchio', 'stella', 'rettangolo', 'triangolo'],
    explanation: 'Il cerchio non ha lati dritti né vertici: per questo è perfettamente rotondo.'
  },
  {
    id: 'r-3',
    level: 'base',
    question: 'Ho 4 lati tutti uguali e 4 angoli dritti come gli spigoli di un bel pacco regalo. Chi sono?',
    clues: ['Tutti i miei 4 lati hanno la stessa identica lunghezza.', 'I miei 4 angoli sono tutti angoli retti.'],
    correctShapeId: 'quadrato',
    optionShapeIds: ['rettangolo', 'quadrato', 'triangolo', 'cerchio'],
    explanation: 'Il quadrato ha 4 lati tutti uguali e 4 angoli retti.'
  },
  {
    id: 'r-4',
    level: 'base',
    question: 'Ho 4 angoli retti come il quadrato, ma due lati sono più lunghi e due più corti, come una busta per Babbo Natale.',
    clues: ['I miei lati opposti sono uguali a due a due.', 'Ho 4 lati e 4 vertici.'],
    correctShapeId: 'rettangolo',
    optionShapeIds: ['quadrato', 'rettangolo', 'stella', 'triangolo'],
    explanation: 'Il rettangolo ha 4 angoli retti e i lati opposti uguali.'
  },
  {
    id: 'r-5',
    level: 'poligoni',
    question: 'Sembro un cristallo di neve: ho esattamente 6 lati uguali e 6 vertici. Chi sono?',
    clues: ['Ho più di 5 lati ma meno di 8.', 'Il prefisso "esa-" significa sei.'],
    correctShapeId: 'esagono',
    optionShapeIds: ['pentagono', 'esagono', 'ottagono', 'rombo'],
    explanation: 'L’esagono è il poligono con 6 lati e 6 vertici, proprio come i cristalli di neve.'
  },
  {
    id: 'r-6',
    level: 'poligoni',
    question: 'Ho 4 lati tutti uguali come il quadrato, ma i miei angoli non sono retti: due sono stretti e due sono larghi.',
    clues: ['Assomiglio a un aquilone o a un cristallo appuntito.', 'Ho 2 assi di simmetria lungo le diagonali.'],
    correctShapeId: 'rombo',
    optionShapeIds: ['quadrato', 'trapezio', 'rombo', 'pentagono'],
    explanation: 'Il rombo ha 4 lati uguali, 2 angoli acuti e 2 ottusi.'
  },
  {
    id: 'r-7',
    level: 'poligoni',
    question: 'Ho 5 lati e 5 vertici, e somiglio alla facciata della casetta di marzapane con il tetto a punta.',
    clues: ['Ho un lato in più rispetto a un quadrato.', 'Il prefisso "penta-" indica il numero 5.'],
    correctShapeId: 'pentagono',
    optionShapeIds: ['esagono', 'pentagono', 'trapezio', 'ottagono'],
    explanation: 'Il pentagono ha 5 lati e 5 vertici.'
  },
  {
    id: 'r-8',
    level: 'poligoni',
    question: 'Ho 4 lati, ma solo due sono paralleli tra loro: una base più lunga sotto e una più corta sopra, come un panettone. Chi sono?',
    clues: ['Sono un quadrilatero, quindi ho 4 vertici.', 'Ricordo proprio la forma del Panettone di Natale!'],
    correctShapeId: 'trapezio',
    optionShapeIds: ['rombo', 'rettangolo', 'trapezio', 'pentagono'],
    explanation: 'Il trapezio è un quadrilatero con una coppia di lati paralleli, proprio come il Panettone di Natale!'
  },
  {
    id: 'r-9',
    level: 'esperti',
    question: 'Sono una figura solida in 3D: ho 6 facce quadrate tutte uguali, 12 spigoli e 8 vertici. Chi sono?',
    clues: ['Non sono una figura piana: occupo spazio come un dado o una scatola.', 'Tutte le mie facce sono quadrati identici.'],
    correctShapeId: 'cubo',
    optionShapeIds: ['quadrato', 'cubo', 'cilindro', 'cono'],
    explanation: 'Il cubo è un solido formato da 6 facce quadrate, 8 vertici e 12 spigoli.'
  },
  {
    id: 'r-10',
    level: 'esperti',
    question: 'Sono un solido con una sola faccia piatta rotonda alla base e una sola punta in cima, come il cappello di Babbo Natale.',
    clues: ['La mia base è un cerchio.', 'Ho un solo vertice in alto.'],
    correctShapeId: 'cono',
    optionShapeIds: ['cilindro', 'sfera', 'cono', 'triangolo'],
    explanation: 'Il cono ha una base circolare e un unico vertice.'
  },
  {
    id: 'r-11',
    level: 'esperti',
    question: 'Ho due facce piane circolari alle estremità e nessun vertice: sembro proprio una candela natalizia.',
    clues: ['Posso stare in piedi sulle mie basi rotonde o rotolare di lato.', 'Ho zero vertici.'],
    correctShapeId: 'cilindro',
    optionShapeIds: ['sfera', 'cono', 'cilindro', 'cubo'],
    explanation: 'Il cilindro è un solido con due basi circolari parallele e zero vertici.'
  },
  {
    id: 'r-12',
    level: 'esperti',
    question: 'Ho 8 lati e 8 vertici regolari e sono usato spesso per medaglioni festivi e cartelli stradali di STOP.',
    clues: ['Ho due lati in più di un esagono.', 'Il mio nome richiama il numero 8.'],
    correctShapeId: 'ottagono',
    optionShapeIds: ['esagono', 'ottagono', 'pentagono', 'stella'],
    explanation: 'L’ottagono è il poligono con 8 lati e 8 vertici.'
  }
];
