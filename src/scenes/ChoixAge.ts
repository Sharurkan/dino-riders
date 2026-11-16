// Choix de l'âge, sans lecture : un petit dino (5 ans) ou un grand dino (7 ans)
import Phaser from 'phaser';
import { LARGEUR } from '../config';
import { audio } from '../systems/Audio';
import { etat, type Mode } from '../systems/Etat';
import { creerBouton } from '../ui/Bouton';

export class ChoixAge extends Phaser.Scene {
  constructor() {
    super('ChoixAge');
  }

  create(): void {
    this.add.image(0, 0, 'ciel_vallee').setOrigin(0);
    this.carte(LARGEUR / 2 - 200, 'petit', 0x3ad6ff, 1.3, 1);
    this.carte(LARGEUR / 2 + 200, 'grand', 0xff8a1f, 2.3, 3);

    creerBouton(this, {
      x: 70, y: 70, rayon: 44, couleur: 0x7a5cff, icone: 'ico_retour',
      surAppui: () => {
        audio.bouton();
        this.scene.start('Titre');
      },
    });
  }

  /** Grande carte tactile : taille du dino et nombre d'étoiles indiquent le niveau. */
  private carte(x: number, mode: Mode, couleur: number, echelle: number, etoiles: number): void {
    const y = 290;
    const fond = this.add.graphics();
    fond.fillStyle(0x2b2140, 0.25).fillRoundedRect(-150, -180 + 10, 300, 380, 40);
    fond.fillStyle(couleur).fillRoundedRect(-150, -180, 300, 380, 40);
    fond.fillStyle(0xffffff, 0.2).fillRoundedRect(-134, -166, 268, 120, 30);

    const dino = this.add.image(0, 70, 'dino').setOrigin(0.5, 1).setScale(echelle);
    const objets: Phaser.GameObjects.GameObject[] = [fond, dino];
    for (let i = 0; i < etoiles; i++) {
      objets.push(this.add.image((i - (etoiles - 1) / 2) * 64, 135, 'etoile').setTint(0xffe14a).setScale(1.2));
    }

    const carte = this.add.container(x, y, objets);
    carte.setSize(300, 380).setInteractive();
    this.tweens.add({ targets: dino, y: 58, duration: 400, yoyo: true, repeat: -1, delay: mode === 'petit' ? 0 : 200 });
    carte.on('pointerdown', () => {
      audio.deverrouiller();
      audio.arpege(mode === 'petit' ? [0, 2, 4] : [2, 4, 7]);
      etat.mode = mode;
      this.tweens.add({ targets: carte, scale: 1.1, duration: 150, yoyo: true, onComplete: () => this.scene.start('Royaume') });
    });
  }
}
