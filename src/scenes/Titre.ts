// Écran titre : un gros bouton « jouer », l'album et le réglage du son
import Phaser from 'phaser';
import { LARGEUR, SOL_Y, POLICE } from '../config';
import { audio } from '../systems/Audio';
import { Sauvegarde } from '../systems/Sauvegarde';
import { creerBouton, changerIcone } from '../ui/Bouton';
import { CREATURES } from '../data/creatures';

export class Titre extends Phaser.Scene {
  constructor() {
    super('Titre');
  }

  create(): void {
    audio.musique(false);
    this.add.image(0, 0, 'ciel_vallee').setOrigin(0);
    this.add.image(760, SOL_Y + 30, 'volcan').setOrigin(0.5, 1);
    this.add.image(140, 90, 'nuage');
    this.add.image(640, 60, 'nuage').setScale(0.7);
    this.add.image(120, SOL_Y + 10, 'arbre').setOrigin(0.5, 1);
    this.add.tileSprite(0, SOL_Y, LARGEUR, 100, 'sol').setOrigin(0);

    // Logo (seul texte du jeu, purement décoratif)
    const logo = this.add.text(LARGEUR / 2, 92, 'DINO RIDERS', {
      fontFamily: POLICE, fontSize: '84px', color: '#ffd84a', stroke: '#2b2140', strokeThickness: 12,
    }).setOrigin(0.5);
    this.add.text(LARGEUR / 2, 160, "l'île aux Échos", {
      fontFamily: POLICE, fontSize: '34px', color: '#ffffff', stroke: '#2b2140', strokeThickness: 8,
    }).setOrigin(0.5);
    this.tweens.add({ targets: logo, scale: 1.05, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Le héros sur sa moto, suivi des créatures déjà trouvées
    const moto = this.add.image(300, SOL_Y - 46, 'moto').setScale(1.3);
    this.tweens.add({ targets: moto, y: moto.y - 8, duration: 160, yoyo: true, repeat: -1 });
    const trouvees = Sauvegarde.lire().creatures;
    CREATURES.filter((c) => trouvees.includes(c.id)).forEach((c, i) => {
      const img = this.add.image(200 - i * 62, SOL_Y, c.texture).setOrigin(0.5, 1).setScale(0.6);
      this.tweens.add({ targets: img, y: SOL_Y - 14, duration: 260, yoyo: true, repeat: -1, delay: i * 120 });
    });

    // Bouton jouer
    const jouer = creerBouton(this, {
      x: LARGEUR / 2, y: 310, rayon: 84, couleur: 0x3ecf5a, icone: 'ico_jouer',
      surAppui: () => {
        audio.deverrouiller();
        audio.bouton();
        this.scene.start('ChoixAge');
      },
    });
    this.tweens.add({ targets: jouer, scale: 1.08, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Bouton album
    creerBouton(this, {
      x: LARGEUR - 110, y: 310, rayon: 56, couleur: 0xff5fa2, icone: 'ico_album',
      surAppui: () => {
        audio.deverrouiller();
        audio.bouton();
        this.scene.start('Album');
      },
    });

    // Bouton son
    const son = creerBouton(this, {
      x: LARGEUR - 70, y: 70, rayon: 44, couleur: 0x7a5cff, icone: audio.sonActif ? 'ico_son' : 'ico_muet',
      surAppui: () => {
        audio.deverrouiller();
        const actif = !audio.sonActif;
        audio.definirSon(actif);
        Sauvegarde.modifier((d) => (d.son = actif));
        changerIcone(son, actif ? 'ico_son' : 'ico_muet');
        audio.bouton();
      },
    });
  }
}
