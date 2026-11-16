// Sauvegarde locale (localStorage) : rien ne quitte le téléphone.

const CLE = 'dino-riders-sauvegarde-v1';

export interface Donnees {
  /** Identifiants des créatures déjà écloses (album). */
  creatures: string[];
  /** Le tracteur a-t-il été débloqué ? */
  tracteur: boolean;
  /** Total des notes ramassées, toutes parties confondues. */
  notes: number;
  /** Son activé ? */
  son: boolean;
}

const DEFAUT: Donnees = { creatures: [], tracteur: false, notes: 0, son: true };

export const Sauvegarde = {
  lire(): Donnees {
    try {
      const brut = localStorage.getItem(CLE);
      if (brut) return { ...DEFAUT, ...JSON.parse(brut) };
    } catch {
      // Stockage indisponible (navigation privée...) : on joue sans sauvegarde
    }
    return { ...DEFAUT, creatures: [] };
  },

  ecrire(donnees: Donnees): void {
    try {
      localStorage.setItem(CLE, JSON.stringify(donnees));
    } catch {
      // Ignoré : le jeu reste jouable
    }
  },

  /** Modifie la sauvegarde en une étape. */
  modifier(action: (d: Donnees) => void): Donnees {
    const d = this.lire();
    action(d);
    this.ecrire(d);
    return d;
  },

  /** Ajoute une créature à l'album. Renvoie vrai si elle est nouvelle. */
  ajouterCreature(id: string): boolean {
    let nouvelle = false;
    this.modifier((d) => {
      if (!d.creatures.includes(id)) {
        d.creatures.push(id);
        nouvelle = true;
      }
    });
    return nouvelle;
  },
};
