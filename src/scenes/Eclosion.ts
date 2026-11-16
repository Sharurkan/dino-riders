// Éclosion d'un œuf : on tape dessus, il se fissure, la créature apparaît
import Phaser from 'phaser';
import { LARGEUR, HAUTEUR } from '../config';
import { audio } from '../systems/Audio';
import { trouverCreature } from '../data/creatures';
import { confettis } from '../ui/Bouton';

export class Eclosion extends Phaser.Scene {
  private id = '';
  private nouvelle = false;
  private coups = 0;
  private eclos = false;
  private peutSortir = false;
  private oeuf!: Phaser.GameObjects.Image;
  private fissures!: Phaser.GameObjects.Graphics;
  private relance?: Phaser.Time.TimerEvent;

  constructor() {
    super('Eclosion');
  }

  init(donnees: { id: string; nouvelle: boolean }): void {
    this.id = donnees.id;
    this.nouvelle = donnees.nouvelle;
    this.coups = 0;
    this.eclos = this.peutSortir = false;
  }

  create(): void {
    const cx = LARGEUR / 2;
    const cy = HAUTEUR / 2;
    this.add.rectangle(0, 0, LARGEUR, HAUTEUR, 0x1a0b3a, 0.8).setOrigin(0);

    // Rayons de lumière qui tournent derrière l'œuf
    const rayons = this.add.graphics({ x: cx, y: cy });
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      rayons.fillStyle(i % 2 ? 0xffd84a : 0xff5fa2, 0.35);
      rayons.fillTriangle(0, 0, Math.cos(a - 0.13) * 420, Math.sin(a - 0.13) * 420, Math.cos(a + 0.13) * 420, Math.sin(a + 0.13) * 420);
    }
    this.tweens.add({ targets: rayons, angle: 360, duration: 9000, repeat: -1 });

    this.oeuf = this.add.image(cx, cy, 'oeuf').setScale(3.4);
    this.fissures = this.add.graphics({ x: cx, y: cy });
    this.tweens.add({ targets: this.oeuf, angle: { from: -6, to: 6 }, duration: 260, yoyo: true, repeat: -1 });

    // Taper n'importe où sur l'écran fonctionne
    this.input.on('pointerdown', () => (this.eclos ? this.sortir() : this.taper()));
    // Si personne ne tape, l'œuf éclot quand même tout seul
    this.relance = this.time.addEvent({ delay: 1500, loop: true, callback: () => this.taper() });
  }

  private taper(): void {
    if (this.eclos) return;
    this.coups++;
    audio.fissure();
    this.cameras.main.shake(120, 0.008);
    this.tweens.add({ targets: this.oeuf, scale: { from: 3.9, to: 3.4 }, duration: 180 });

    // Une nouvelle fissure en zigzag à chaque coup
    this.fissures.lineStyle(6, 0x2b2140);
    const x = (this.coups - 2) * 34;
    this.fissures.beginPath().moveTo(x, -70).lineTo(x + 16, -30).lineTo(x - 12, 5).lineTo(x + 14, 40).strokePath();

    if (this.coups >= 3) this.eclore();
  }

  private eclore(): void {
    this.eclos = true;
    this.relance?.remove();
    const cx = LARGEUR / 2;
    const cy = HAUTEUR / 2;
    this.oeuf.destroy();
    this.fissures.destroy();
    this.cameras.main.flash(350, 255, 255, 255);
    audio.eclosion();
    confettis(this, cx, cy, this.nouvelle ? 70 : 30);

    const creature = this.add.image(cx, cy + 20, trouverCreature(this.id).texture).setScale(0);
    this.tweens.add({ targets: creature, scale: 3, duration: 600, ease: 'Back.easeOut' });
    this.tweens.add({ targets: creature, y: cy - 10, duration: 350, yoyo: true, repeat: -1, delay: 600, ease: 'Sine.easeInOut' });

    // Nouvelle créature dans l'album : une couronne d'étoiles en plus
    if (this.nouvelle) {
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const etoile = this.add.image(cx, cy, 'etoile').setTint(0xffe14a).setScale(0);
        this.tweens.add({ targets: etoile, x: cx + Math.cos(a) * 220, y: cy + Math.sin(a) * 190, scale: 1.2, angle: 360, duration: 700, ease: 'Back.easeOut', delay: 300 });
      }
    }

    // On laisse le temps d'admirer, puis un toucher (ou quelques secondes) ramène au jeu
    this.time.delayedCall(1400, () => (this.peutSortir = true));
    this.time.delayedCall(4500, () => this.sortir());
  }

  private sortir(): void {
    if (!this.peutSortir) return;
    this.peutSortir = false;
    this.scene.stop();
    this.scene.resume('Royaume', { eclosion: this.id });
  }
}
