// Constantes générales du jeu

/** Taille logique de l'écran (paysage 16:9). Phaser l'adapte à l'écran réel. */
export const LARGEUR = 960;
export const HAUTEUR = 540;

/** Hauteur (y) du dessus du sol dans les royaumes. */
export const SOL_Y = 440;

/** Police arrondie présente sur la plupart des téléphones (aucun fichier externe). */
export const POLICE = '"Arial Rounded MT Bold", "Trebuchet MS", "Verdana", sans-serif';

/** Réglages des véhicules. Ajouter ici le camion-benne et le 4x4 plus tard. */
export const VEHICULES = {
  moto: { texture: 'moto', vitesse: 320, saut: 640 },
  tracteur: { texture: 'tracteur', vitesse: 210, saut: 570 },
} as const;

export type NomVehicule = keyof typeof VEHICULES;

/** Réglages qui changent selon l'âge choisi. */
export const DIFFICULTE = {
  petit: { bpm: 80, boutons: 1, cible: 8, fenetreMs: 280, echecsMax: Infinity },
  grand: { bpm: 104, boutons: 2, cible: 12, fenetreMs: 170, echecsMax: 6 },
} as const;
