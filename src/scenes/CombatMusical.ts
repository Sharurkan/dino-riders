// Combat musical : taper en rythme pour rendre ses couleurs à l'ombre.
// Un anneau se resserre autour du bouton : on tape quand il le touche.
import Phaser from 'phaser';
import { LARGEUR, HAUTEUR, DIFFICULTE } from '../config';
import { audio, GAMME } from '../systems/Audio';
import { etat } from '../systems/Etat';
import { creerBouton, confettis } from '../ui/Bouton';

interface Battement { t: number; voie: number; anneau: Phaser.GameObjects.Arc }

const COULEURS_VOIES = [0xffd84a, 0x3ad6ff];
const RAYON_BOUTON = 78;
// Suite de boutons à taper en mode Grand (0 = gauche, 1 = droite)
const MOTIF = [0, 1, 0, 1, 0, 0, 1, 1];

export class CombatMusical extends Phaser.Scene {
  private reglage!: (typeof DIFFICULTE)[keyof typeof DIFFICULTE];
  private intervalle = 0;
  private battements: Battement[] = [];
  private prochainTemps = 0;
  private numero = 0;
  private prochainTic = 0;
  private numeroTic = 0;
  private reussites = 0;
  private echecs = 0;
  private fini = false;
  private positions: number[] = [];
  private etoiles: Phaser.GameObjects.Image[] = [];
  private ombre!: Phaser.GameObjects.Image;
  private ombreCouleur!: Phaser.GameObjects.Image;
  private heros!: Phaser.GameObjects.Image;
  private grille!: Phaser.GameObjects.Graphics;

  constructor() {
    super('CombatMusical');
  }

  create(): void {
    this.reglage = DIFFICULTE[etat.mode];
    this.intervalle = 60000 / this.reglage.bpm;
    this.battements = [];
    this.reussites = this.echecs = this.numero = this.numeroTic = 0;
    this.fini = false;

    this.creerScene();

    // Boutons de rythme : un seul pour les petits, deux pour les grands
    this.positions = this.reglage.boutons === 1 ? [LARGEUR / 2] : [LARGEUR / 2 - 150, LARGEUR / 2 + 150];
    this.positions.forEach((x, voie) => {
      creerBouton(this, {
        x, y: HAUTEUR - 110, rayon: RAYON_BOUTON, couleur: COULEURS_VOIES[voie], icone: 'ico_musique',
        surAppui: () => this.taper(voie),
      }).setDepth(5);
    });

    // Étoiles de progression : une par note réussie à obtenir
    const n = this.reglage.cible;
    this.etoiles = Array.from({ length: n }, (_, i) =>
      this.add.image(LARGEUR / 2 + (i - (n - 1) / 2) * 44, 40, 'etoile').setScale(0.8).setTint(0x4a3a7a));

    // Pause
    creerBouton(this, {
      x: LARGEUR - 64, y: 60, rayon: 48, couleur: 0x7a5cff, icone: 'ico_pause',
      surAppui: () => {
        audio.bouton();
        this.scene.pause();
        this.scene.launch('Pause', { origine: 'CombatMusical' });
      },
    });

    // Clavier (tests sur ordinateur) : flèches gauche / droite
    this.input.keyboard?.on('keydown-LEFT', () => this.taper(0));
    this.input.keyboard?.on('keydown-RIGHT', () => this.taper(this.reglage.boutons - 1));

    this.demarrerRythme(1600);
  }

  /** Décor néon, héros à gauche, ombre à droite. */
  private creerScene(): void {
    this.add.rectangle(0, 0, LARGEUR, HAUTEUR, 0x1a0b3a).setOrigin(0);
    this.grille = this.add.graphics();
    this.grille.lineStyle(3, 0xff5fa2, 0.6);
    for (let i = -6; i <= 18; i++) this.grille.lineBetween(LARGEUR / 2 + (i - 6) * 40, 300, (i - 6) * 220 + LARGEUR / 2, HAUTEUR);
    this.grille.lineStyle(3, 0x3ad6ff, 0.6);
    for (let j = 0; j < 6; j++) this.grille.lineBetween(0, 300 + j * j * 9, LARGEUR, 300 + j * j * 9);
    // Projecteurs colorés
    [0xff5fa2, 0x3ad6ff, 0xffd84a].forEach((c, i) => {
      const rond = this.add.circle(200 + i * 280, 150, 130, c, 0.12);
      this.tweens.add({ targets: rond, alpha: 0.28, scale: 1.2, duration: 700 + i * 150, yoyo: true, repeat: -1 });
    });

    this.heros = this.add.image(200, 250, etat.vehicule).setScale(1.6);
    this.ombre = this.add.image(LARGEUR - 220, 200, 'ombre').setScale(1.7);
    this.ombreCouleur = this.add.image(LARGEUR - 220, 200, 'ombre_couleur').setScale(1.7).setAlpha(0);
    this.tweens.add({ targets: [this.ombre, this.ombreCouleur], y: 220, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private demarrerRythme(delai: number): void {
    this.prochainTemps = this.time.now + delai;
    this.prochainTic = this.prochainTemps;
    this.numero = this.numeroTic = 0;
  }

  // --- Boucle : apparition des anneaux, métronome, jugement ---------------------

  update(): void {
    if (this.fini) return;
    const maintenant = this.time.now;
    const avance = this.intervalle * 2; // un anneau met deux temps à se resserrer

    // Nouveaux anneaux
    while (this.prochainTemps - avance <= maintenant) {
      const voie = this.reglage.boutons === 1 ? 0 : MOTIF[this.numero % MOTIF.length];
      const anneau = this.add.circle(this.positions[voie], HAUTEUR - 110, RAYON_BOUTON).setStrokeStyle(8, COULEURS_VOIES[voie]).setDepth(4);
      this.battements.push({ t: this.prochainTemps, voie, anneau });
      this.prochainTemps += this.intervalle;
      this.numero++;
    }

    // Métronome : grosse caisse sur le temps, charleston entre deux temps
    while (this.prochainTic <= maintenant) {
      if (this.numeroTic % 2 === 0) {
        audio.grosseCaisse();
        this.tweens.add({ targets: this.heros, scale: { from: 1.75, to: 1.6 }, duration: 150 });
        this.grille.setAlpha(1);
      } else {
        audio.charleston();
        this.grille.setAlpha(0.6);
      }
      this.prochainTic += this.intervalle / 2;
      this.numeroTic++;
    }

    // Les anneaux se resserrent ; ceux qui passent sans être tapés sont manqués
    for (const b of [...this.battements]) {
      const reste = Phaser.Math.Clamp((b.t - maintenant) / avance, 0, 1);
      b.anneau.setScale(1 + reste * 1.7).setAlpha(1 - reste * 0.6);
      if (maintenant > b.t + this.reglage.fenetreMs) {
        this.retirer(b);
        this.manquer(false);
      }
    }
  }

  private retirer(b: Battement): void {
    b.anneau.destroy();
    this.battements.splice(this.battements.indexOf(b), 1);
  }

  private taper(voie: number): void {
    if (this.fini) return;
    const maintenant = this.time.now;
    const cible = this.battements.find((b) => b.voie === voie && Math.abs(b.t - maintenant) <= this.reglage.fenetreMs);
    if (cible) {
      this.retirer(cible);
      this.reussir(voie);
    } else {
      this.manquer(true);
    }
  }

  // --- Réussite, raté, victoire -------------------------------------------------

  private reussir(voie: number): void {
    const x = this.positions[voie];
    const couleur = COULEURS_VOIES[voie];
    audio.bip(GAMME[this.reussites % GAMME.length], 0.25, 'triangle', 0.3);

    // Onde de lumière autour du bouton, puis éclair coloré vers l'ombre
    const onde = this.add.circle(x, HAUTEUR - 110, RAYON_BOUTON).setStrokeStyle(10, couleur);
    this.tweens.add({ targets: onde, scale: 3, alpha: 0, duration: 450, onComplete: () => onde.destroy() });
    const eclair = this.add.image(this.heros.x + 60, this.heros.y, 'etoile').setTint(couleur).setScale(1.2);
    this.tweens.add({
      targets: eclair, x: this.ombre.x, y: this.ombre.y, angle: 360, duration: 280,
      onComplete: () => {
        eclair.destroy();
        confettis(this, this.ombre.x, this.ombre.y, 8);
      },
    });
    this.tweens.add({ targets: [this.ombre, this.ombreCouleur], scale: { from: 1.45, to: 1.7 }, duration: 220, delay: 260 });

    // L'ombre retrouve ses couleurs petit à petit
    this.etoiles[this.reussites]?.setTint(0xffe14a).setScale(1.1);
    this.reussites++;
    this.ombreCouleur.setAlpha(this.reussites / this.reglage.cible);
    if (this.reussites >= this.reglage.cible) this.gagner();
  }

  private manquer(tapeTropTot: boolean): void {
    // Mode Petit : aucun raté ne compte, on continue simplement à jouer
    if (this.reglage.echecsMax === Infinity) return;
    if (tapeTropTot) audio.rate();
    this.echecs++;
    this.cameras.main.shake(80, 0.004);
    if (this.echecs >= this.reglage.echecsMax) this.recommencer();
  }

  /** Mode Grand : trop de ratés, l'ombre rigole et le combat repart aussitôt. */
  private recommencer(): void {
    audio.rigole();
    this.battements.forEach((b) => b.anneau.destroy());
    this.battements = [];
    this.reussites = this.echecs = 0;
    this.ombreCouleur.setAlpha(0);
    this.etoiles.forEach((e) => e.setTint(0x4a3a7a).setScale(0.8));
    this.tweens.add({ targets: [this.ombre, this.ombreCouleur], angle: { from: -15, to: 15 }, duration: 120, yoyo: true, repeat: 4, onComplete: () => this.ombre.setAngle(0) });
    this.demarrerRythme(1800);
  }

  private gagner(): void {
    this.fini = true;
    this.battements.forEach((b) => b.anneau.destroy());
    this.battements = [];
    audio.victoire();
    this.ombre.setVisible(false);
    this.ombreCouleur.setAlpha(1);
    this.tweens.add({ targets: this.ombreCouleur, angle: 360, duration: 600, repeat: 2 });
    for (let i = 0; i < 4; i++) this.time.delayedCall(i * 350, () => confettis(this, 200 + i * 190, 260));
    this.cameras.main.flash(400, 255, 255, 255);
    this.time.delayedCall(2400, () => {
      this.scene.stop();
      this.scene.resume('Royaume', { combat: 'gagne' });
    });
  }
}
