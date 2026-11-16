// Menu pause : reprendre, retour à l'accueil, son
import Phaser from 'phaser';
import { LARGEUR, HAUTEUR } from '../config';
import { audio } from '../systems/Audio';
import { Sauvegarde } from '../systems/Sauvegarde';
import { creerBouton, changerIcone } from '../ui/Bouton';

export class Pause extends Phaser.Scene {
  /** Scène mise en pause : « Royaume » ou « CombatMusical ». */
  private origine = 'Royaume';

  constructor() {
    super('Pause');
  }

  init(donnees: { origine: string }): void {
    this.origine = donnees.origine;
  }

  create(): void {
    // Le fond capte les touchers pour qu'ils n'atteignent pas le jeu en dessous
    this.add.rectangle(0, 0, LARGEUR, HAUTEUR, 0x1a0b3a, 0.75).setOrigin(0).setInteractive();
    const y = HAUTEUR / 2;

    // Reprendre
    creerBouton(this, {
      x: LARGEUR / 2, y, rayon: 90, couleur: 0x3ecf5a, icone: 'ico_jouer',
      surAppui: () => {
        audio.bouton();
        this.scene.stop();
        this.scene.resume(this.origine);
      },
    });

    // Retour à l'accueil
    creerBouton(this, {
      x: LARGEUR / 2 - 230, y, rayon: 62, couleur: 0xff5fa2, icone: 'ico_maison',
      surAppui: () => {
        audio.bouton();
        this.scene.stop('CombatMusical');
        this.scene.stop('Royaume');
        this.scene.start('Titre');
      },
    });

    // Son
    const son = creerBouton(this, {
      x: LARGEUR / 2 + 230, y, rayon: 62, couleur: 0x7a5cff, icone: audio.sonActif ? 'ico_son' : 'ico_muet',
      surAppui: () => {
        const actif = !audio.sonActif;
        audio.definirSon(actif);
        Sauvegarde.modifier((d) => (d.son = actif));
        changerIcone(son, actif ? 'ico_son' : 'ico_muet');
        audio.bouton();
      },
    });
  }
}
