// Liste des créatures de l'album.
// Pour en ajouter une : une entrée ici + une texture « creature_<id> » (voir FabriqueTextures).

export interface DefCreature {
  id: string;
  /** Clé de texture : remplaçable par un vrai sprite chargé sous la même clé. */
  texture: string;
  /** Hauteur de la note de son petit cri (rang dans la gamme). */
  cri: number;
}

export const CREATURES: DefCreature[] = [
  { id: 'pikou', texture: 'creature_pikou', cri: 2 },
  { id: 'bloup', texture: 'creature_bloup', cri: 0 },
  { id: 'mimo', texture: 'creature_mimo', cri: 5 },
];

/** Nombre de cases de l'album (les cases en trop annoncent les futures créatures). */
export const CASES_ALBUM = 6;

export function trouverCreature(id: string): DefCreature {
  return CREATURES.find((c) => c.id === id) ?? CREATURES[0];
}
