export type GameSection = 'slitta' | 'albero' | 'indovinelli' | 'atlante' | 'dashboard' | 'istruzioni' | 'credits';

export type SchoolLevel = 'base' | 'poligoni' | 'esperti';

export type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'ROUND_SUMMARY' | 'GAME_OVER';

export type ShapeCategory = 'piana' | 'solido';

export type ShapeId =
  | 'cerchio'
  | 'quadrato'
  | 'triangolo'
  | 'rettangolo'
  | 'stella'
  | 'rombo'
  | 'trapezio'
  | 'pentagono'
  | 'esagono'
  | 'ottagono'
  | 'cubo'
  | 'sfera'
  | 'cono'
  | 'cilindro';

export interface ChristmasShapeDef {
  id: ShapeId;
  name: string;
  articleName: string;
  category: ShapeCategory;
  level: SchoolLevel;
  sides: number | null;
  vertices: number | null;
  rightAngles: number | null;
  symmetryAxes: string;
  christmasObject: string;
  christmasObjectArticle: string;
  christmasClue: string;
  description: string;
  schoolTip: string;
  fillHex: string;
  strokeHex: string;
  atlasBackgroundImage: string;
  atlasBackgroundAlt: string;
  atlasMatchCaption: string;
}

export interface TangramSlot {
  slotId: string;
  shapeId: ShapeId;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  fillColor: string;
  hint: string;
}

export interface TangramPuzzle {
  id: string;
  title: string;
  levelLabel: string;
  subtitle: string;
  backgroundImage?: string;
  backgroundAlt?: string;
  slots: TangramSlot[];
  palette: ShapeId[];
}

export interface RiddleItem {
  id: string;
  level: SchoolLevel;
  question: string;
  clues: [string, string];
  correctShapeId: ShapeId;
  optionShapeIds: ShapeId[];
  explanation: string;
}

export interface WorkshopStats {
  totalStars: number;
  sleighStars: number;
  sleighRoundsCompleted: number;
  bestSleighScore: number;
  completedPuzzles: string[];
  solvedRiddles: string[];
  exploredShapes: ShapeId[];
}
