// État partagé entre les scènes pendant une partie (non sauvegardé)
import type { NomVehicule } from '../config';

export type Mode = 'petit' | 'grand';

export const etat = {
  /** Âge choisi : « petit » (5 ans) ou « grand » (7 ans). */
  mode: 'petit' as Mode,
  vehicule: 'moto' as NomVehicule,
  tracteurDispo: false,
  /** Vrai quand le tracteur est sur un carré de terre : le bouton plante clignote. */
  actionPossible: false,
  /** Notes de musique ramassées dans la partie en cours. */
  notes: 0,
  /** Œufs trouvés dans la partie en cours (un booléen par œuf du royaume). */
  oeufs: [false, false, false] as boolean[],
};

/** Commandes tactiles : remplies par le HUD, lues par le royaume. */
export const controles = {
  gauche: false,
  droite: false,
  saut: false,
  /** Impulsions : mises à vrai par un appui, remises à faux une fois traitées. */
  action: false,
  changer: false,
};

export function relacherControles(): void {
  controles.gauche = controles.droite = controles.saut = false;
  controles.action = controles.changer = false;
}
