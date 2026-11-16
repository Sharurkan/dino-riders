// Description des royaumes sous forme de données.
// Pour ajouter un royaume (ex. Ferme Turbo) : créer une nouvelle constante DefRoyaume.
import { SOL_Y } from '../config';
import type { Mode } from '../systems/Etat';

interface Point { x: number; y: number }

export interface DefRoyaume {
  cle: string;
  largeur: number;
  /** Couleurs du ciel (haut, bas). */
  ciel: [number, number];
  /** Morceaux de sol [début, fin] : les trous entre deux morceaux sont des fossés. */
  sols: [number, number][];
  /** Plateformes (x = centre, y = dessus). `mode` : présente seulement pour cet âge. */
  plateformes: (Point & { mode?: Mode })[];
  notes: Point[];
  /** Œufs posés dans le niveau : position selon l'âge (mieux cachés pour les grands). */
  oeufs: { creature: string; petit: Point; grand: Point; cache?: boolean }[];
  /** Carrés de terre où le tracteur fait pousser une plante-échelle. */
  terres: { x: number; feuilles: number }[];
  /** L'ombre qui vole les couleurs, et la créature de l'œuf qu'elle rend. */
  ombre: { x: number; creature: string };
  /** Emplacement du cadeau qui débloque le tracteur. */
  cadeauX: number;
  arriveeX: number;
  /** Flèches de guidage (mode Petit uniquement). */
  fleches: (Point & { dir: 'droite' | 'bas' })[];
}

/** Fabrique une ligne de notes. */
function ligne(x: number, n: number, y = SOL_Y - 45, pas = 70): Point[] {
  return Array.from({ length: n }, (_, i) => ({ x: x + i * pas, y }));
}

export const VALLEE_DES_DINOS: DefRoyaume = {
  cle: 'vallee',
  largeur: 5400,
  ciel: [0x4fc3ff, 0xfff0b8],
  sols: [[0, 1500], [1630, 3050], [3180, 5400]],
  plateformes: [
    { x: 520, y: 340 },
    { x: 700, y: 240, mode: 'grand' },
    // Récompense en hauteur, accessible grâce à la plante du premier carré de terre
    { x: 1350, y: 155 },
    // Petits ponts au-dessus des fossés pour les plus jeunes
    { x: 1565, y: SOL_Y, mode: 'petit' },
    { x: 3115, y: SOL_Y, mode: 'petit' },
    { x: 1950, y: 340 },
    { x: 2150, y: 250 },
    { x: 2350, y: 340 },
    // Corniche de l'œuf n°3, accessible grâce à la plante du second carré de terre
    { x: 4340, y: 155 },
  ],
  notes: [
    ...ligne(260, 3),
    ...ligne(800, 3),
    ...ligne(1280, 3, 110, 60),
    ...ligne(1750, 2),
    { x: 1950, y: 295 }, { x: 2150, y: 205 }, { x: 2350, y: 295 },
    ...ligne(2450, 2),
    ...ligne(3300, 4),
    ...ligne(3800, 3),
    ...ligne(4550, 5),
  ],
  oeufs: [
    { creature: 'pikou', petit: { x: 520, y: 305 }, grand: { x: 700, y: 205 }, cache: true },
    { creature: 'mimo', petit: { x: 4340, y: 120 }, grand: { x: 4340, y: 120 } },
  ],
  terres: [
    { x: 1100, feuilles: 3 },
    { x: 4100, feuilles: 3 },
  ],
  ombre: { x: 2780, creature: 'bloup' },
  cadeauX: 3600,
  arriveeX: 5150,
  fleches: [
    { x: 330, y: 230, dir: 'droite' },
    { x: 520, y: 215, dir: 'bas' },
    { x: 1750, y: 230, dir: 'droite' },
    { x: 3600, y: 250, dir: 'bas' },
    { x: 4100, y: 300, dir: 'bas' },
    { x: 4750, y: 230, dir: 'droite' },
  ],
};
