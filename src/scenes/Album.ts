// Album : les créatures trouvées en couleur, les autres en silhouette grise
import Phaser from 'phaser';
import { LARGEUR } from '../config';
import { audio } from '../systems/Audio';
import { Sauvegarde } from '../systems/Sauvegarde';
import { CREATURES, CASES_ALBUM } from '../data/creatures';
import { creerBouton } from '../ui/Bouton';

export class Album extends Phaser.Scene {
  constructor() {
    super('Album');
  }

  create(): void {
    const trouvees = Sauvegarde.lire().creatures;
    this.add.image(0, 0, 'ciel_vallee').setOrigin(0).setTint(0xd9c8ff);

    creerBouton(this, {
      x: 70, y: 70, rayon: 44, couleur: 0x7a5cff, icone: 'ico_retour',
      surAppui: () => {
        audio.bouton();
        this.scene.start('Titre');
      },
    });

    // Rangée d'étoiles : une par créature trouvée
    CREATURES.forEach((c, i) => {
      const etoile = this.add.image(LARGEUR / 2 + (i - (CREATURES.length - 1) / 2) * 60, 60, 'etoile').setScale(1.1);
      etoile.setTint(trouvees.includes(c.id) ? 0xffe14a : 0x8a7fb0);
    });

    // Grille de cartes (3 colonnes)
    const colonnes = 3;
    for (let i = 0; i < CASES_ALBUM; i++) {
      const x = LARGEUR / 2 + ((i % colonnes) - 1) * 230;
      const y = 215 + Math.floor(i / colonnes) * 200;
      const def = CREATURES[i];
      const trouvee = !!def && trouvees.includes(def.id);

      const fond = this.add.graphics({ x, y });
      fond.fillStyle(0x2b2140, 0.25).fillRoundedRect(-100, -82, 200, 180, 28);
      fond.fillStyle(trouvee ? 0xfff4d6 : 0xc9c2de).fillRoundedRect(-100, -90, 200, 180, 28);

      if (!def) {
        // Case réservée à une future créature
        this.add.image(x, y, 'creature_mystere').setTintFill(0xa9a2c0).setAlpha(0.7);
        continue;
      }

      const image = this.add.image(x, y + 4, def.texture).setScale(1.4);
      if (!trouvee) {
        // Silhouette grise : on devine la forme, pas les couleurs
        image.setTintFill(0x8f8aa6);
        continue;
      }

      this.tweens.add({ targets: image, y: y - 6, duration: 500, yoyo: true, repeat: -1, delay: i * 150, ease: 'Sine.easeInOut' });
      // Toucher une créature la fait sauter et chanter
      image.setInteractive();
      image.on('pointerdown', () => {
        audio.note(def.cri);
        audio.note(def.cri + 2);
        this.tweens.add({ targets: image, scale: { from: 1.9, to: 1.4 }, angle: { from: -15, to: 0 }, duration: 350, ease: 'Back.easeOut' });
      });
    }
  }
}
