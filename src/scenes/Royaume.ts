// Scène principale : un royaume à explorer en véhicule
import Phaser from 'phaser';
import { HAUTEUR, SOL_Y, VEHICULES, type NomVehicule } from '../config';
import { audio } from '../systems/Audio';
import { Sauvegarde } from '../systems/Sauvegarde';
import { etat, controles, relacherControles } from '../systems/Etat';
import { VALLEE_DES_DINOS, type DefRoyaume } from '../data/royaumes';
import { CREATURES, trouverCreature } from '../data/creatures';
import { confettis } from '../ui/Bouton';

type Corps = Phaser.Physics.Arcade.Body;
type Image = Phaser.GameObjects.Image;

interface Terre { x: number; feuilles: number; poussee: boolean; indice: Image }
interface Suiveur { id: string; image: Image; phase: number }

/** Données reçues quand une scène posée par-dessus (éclosion, combat) se termine. */
interface Retour { eclosion?: string; combat?: 'gagne' }

export class Royaume extends Phaser.Scene {
  private def!: DefRoyaume;
  private joueur!: Phaser.Physics.Arcade.Sprite;
  private sols!: Phaser.Physics.Arcade.StaticGroup;
  private plateformes!: Phaser.Physics.Arcade.StaticGroup;
  private oeufs!: Phaser.Physics.Arcade.StaticGroup;
  private notes!: Phaser.Physics.Arcade.StaticGroup;
  private touches?: Phaser.Types.Input.Keyboard.CursorKeys;
  private poussiere!: Phaser.GameObjects.Particles.ParticleEmitter;
  private terres: Terre[] = [];
  private suiveurs: Suiveur[] = [];
  /** Positions récentes du joueur : les créatures marchent dans ses traces. */
  private traces: { x: number; y: number }[] = [];
  private ombre!: Image;
  private ombreVaincue = false;
  private gris?: Phaser.FX.ColorMatrix;
  private niveauGris = 0;
  private cadeau?: Image;
  /** Vrai pendant les animations où le joueur ne doit pas bouger. */
  private bloque = false;
  private termine = false;
  private dernierSol = { x: 140, y: SOL_Y - 60 };
  private rangNote = 0;

  constructor() {
    super('Royaume');
  }

  create(): void {
    this.def = VALLEE_DES_DINOS;
    const sauvegarde = Sauvegarde.lire();

    // Remise à zéro de l'état de la partie
    this.terres = [];
    this.suiveurs = [];
    this.traces = [];
    this.ombreVaincue = this.bloque = this.termine = false;
    this.niveauGris = 0;
    this.rangNote = 0;
    this.cadeau = undefined;
    this.gris = undefined;
    etat.vehicule = 'moto';
    etat.tracteurDispo = sauvegarde.tracteur;
    etat.actionPossible = false;
    etat.notes = 0;
    etat.oeufs = CREATURES.map(() => false);
    relacherControles();

    this.physics.world.setBounds(0, -300, this.def.largeur, HAUTEUR + 600);
    this.cameras.main.setBounds(0, 0, this.def.largeur, HAUTEUR);

    this.creerDecor();
    this.creerTerrain();
    this.creerObjets();
    this.creerJoueur();
    this.creerOmbre();
    if (etat.mode === 'petit') this.creerFleches();

    // Les créatures déjà dans l'album accompagnent le joueur dès le départ
    CREATURES.filter((c) => sauvegarde.creatures.includes(c.id)).forEach((c) => this.ajouterSuiveur(c.id));

    this.touches = this.input.keyboard?.createCursorKeys();
    this.scene.launch('HUD');
    audio.musique(true);

    // Retour d'une scène posée par-dessus (pause, éclosion, combat)
    this.events.on('resume', this.auRetour, this);
    this.events.once('shutdown', () => {
      this.events.off('resume', this.auRetour, this);
      audio.musique(false);
      this.scene.stop('HUD');
    });
  }

  // --- Construction du niveau ------------------------------------------------

  private creerDecor(): void {
    this.add.image(0, 0, 'ciel_' + this.def.cle).setOrigin(0).setScrollFactor(0);
    for (let i = 0; i < 4; i++) {
      this.add.image(120 + i * 330, 60 + (i % 2) * 50, 'nuage').setScrollFactor(0.1).setAlpha(0.9);
    }
    // Volcans au loin puis arbres : ils défilent moins vite que le sol (parallaxe)
    for (let i = 0; i < 4; i++) {
      this.add.image(380 + i * 560, SOL_Y + 40, 'volcan').setOrigin(0.5, 1).setScrollFactor(0.25).setScale(0.8 + (i % 2) * 0.3);
    }
    for (let i = 0; i < 12; i++) {
      this.add.image(80 + i * 290, SOL_Y + 20, 'arbre').setOrigin(0.5, 1).setScrollFactor(0.55).setScale(0.9 + (i % 3) * 0.15).setAlpha(0.95);
    }
  }

  private creerTerrain(): void {
    this.sols = this.physics.add.staticGroup();
    this.plateformes = this.physics.add.staticGroup();

    for (const [debut, fin] of this.def.sols) {
      const morceau = this.add.tileSprite(debut, SOL_Y, fin - debut, 100, 'sol').setOrigin(0);
      this.physics.add.existing(morceau, true);
      this.sols.add(morceau);
      // Buissons décoratifs, posés à intervalles réguliers
      for (let x = debut + 180; x < fin - 100; x += 430) {
        this.add.image(x, SOL_Y + 6, 'buisson').setOrigin(0.5, 1).setDepth(1);
      }
    }

    for (const p of this.def.plateformes) {
      if (p.mode && p.mode !== etat.mode) continue;
      this.ajouterPlateforme(p.x, p.y, 'plateforme');
    }

    // Carrés de terre : une bulle « tracteur » indique le véhicule à utiliser
    for (const t of this.def.terres) {
      this.add.image(t.x, SOL_Y + 2, 'terre').setDepth(2);
      const indice = this.add.image(t.x, SOL_Y - 90, 'tracteur').setScale(0.55).setAlpha(0.85).setDepth(2);
      this.tweens.add({ targets: indice, y: indice.y - 12, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.terres.push({ x: t.x, feuilles: t.feuilles, poussee: false, indice });
    }

    this.add.image(this.def.arriveeX, SOL_Y + 4, 'arche').setOrigin(0.5, 1).setDepth(1);
  }

  /** Plateforme traversable par-dessous : on ne s'y cogne jamais la tête. */
  private ajouterPlateforme(x: number, y: number, texture: string): Phaser.Physics.Arcade.Sprite {
    const p = this.plateformes.create(x, y, texture) as Phaser.Physics.Arcade.Sprite;
    p.setOrigin(0.5, 0).setDepth(3).refreshBody();
    const corps = p.body as Phaser.Physics.Arcade.StaticBody;
    corps.checkCollision.down = corps.checkCollision.left = corps.checkCollision.right = false;
    return p;
  }

  private creerObjets(): void {
    this.notes = this.physics.add.staticGroup();
    for (const n of this.def.notes) {
      const note = this.notes.create(n.x, n.y, 'note') as Image;
      this.tweens.add({ targets: note, y: n.y - 8, duration: 500, yoyo: true, repeat: -1, delay: (n.x % 5) * 80 });
    }

    this.oeufs = this.physics.add.staticGroup();
    for (const o of this.def.oeufs) {
      const pos = o[etat.mode];
      this.poserOeuf(pos.x, pos.y, o.creature);
      // Pour les grands, un buisson cache l'œuf : il faut être curieux !
      if (o.cache && etat.mode === 'grand') {
        this.add.image(pos.x, pos.y + 38, 'buisson').setOrigin(0.5, 1).setDepth(12);
      }
    }

    if (!etat.tracteurDispo) {
      this.cadeau = this.add.image(this.def.cadeauX, SOL_Y - 44, 'cadeau').setDepth(4);
      this.tweens.add({ targets: this.cadeau, y: SOL_Y - 60, angle: 6, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }

  private poserOeuf(x: number, y: number, creature: string): void {
    const oeuf = this.oeufs.create(x, y, 'oeuf') as Image;
    oeuf.setData('creature', creature).setDepth(4);
    this.tweens.add({ targets: oeuf, angle: { from: -8, to: 8 }, duration: 400, yoyo: true, repeat: -1 });
  }

  private creerJoueur(): void {
    this.joueur = this.physics.add.sprite(140, SOL_Y - 60, 'moto').setDepth(10);
    this.joueur.setCollideWorldBounds(true);
    (this.joueur.body as Corps).setSize(64, 62).setOffset(24, 32);
    this.dernierSol = { x: 140, y: SOL_Y - 60 };

    this.physics.add.collider(this.joueur, this.sols);
    this.physics.add.collider(this.joueur, this.plateformes);
    this.physics.add.overlap(this.joueur, this.notes, (_j, n) => this.ramasserNote(n as Image));
    this.physics.add.overlap(this.joueur, this.oeufs, (_j, o) => this.ramasserOeuf(o as Image));

    this.poussiere = this.add.particles(0, 0, 'particule', {
      speed: { min: 20, max: 70 }, angle: { min: 200, max: 340 }, lifespan: 350,
      scale: { start: 0.6, end: 0 }, alpha: { start: 0.6, end: 0 }, frequency: 60, tint: 0xfff0c8,
    }).setDepth(9);
    this.poussiere.startFollow(this.joueur, 0, 44);

    this.cameras.main.startFollow(this.joueur, true, 0.12, 1, -120, 0);
  }

  private creerOmbre(): void {
    this.ombre = this.add.image(this.def.ombre.x, SOL_Y - 110, 'ombre').setDepth(8);
    this.tweens.add({ targets: this.ombre, y: SOL_Y - 140, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: this.ombre, angle: { from: -8, to: 8 }, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private creerFleches(): void {
    for (const f of this.def.fleches) {
      const fleche = this.add.image(f.x, f.y, 'fleche').setTint(0xffe14a).setAlpha(0.9).setDepth(2);
      if (f.dir === 'bas') {
        fleche.setAngle(90);
        this.tweens.add({ targets: fleche, y: f.y + 18, duration: 450, yoyo: true, repeat: -1 });
      } else {
        this.tweens.add({ targets: fleche, x: f.x + 18, duration: 450, yoyo: true, repeat: -1 });
      }
    }
  }

  // --- Boucle de jeu -----------------------------------------------------------

  update(_temps: number, delta: number): void {
    const corps = this.joueur.body as Corps;
    const vehicule = VEHICULES[etat.vehicule];
    const auSol = corps.blocked.down;

    // Déplacement
    let dir = 0;
    if (!this.bloque) {
      if (controles.gauche || this.touches?.left.isDown) dir = -1;
      if (controles.droite || this.touches?.right.isDown) dir = 1;
    }
    this.joueur.setVelocityX(dir * vehicule.vitesse);
    if (dir !== 0) this.joueur.setFlipX(dir < 0);

    // Saut (maintenir le bouton fait rebondir : plus simple pour les petits)
    if (!this.bloque && auSol && (controles.saut || this.touches?.up.isDown || this.touches?.space.isDown)) {
      this.joueur.setVelocityY(-vehicule.saut);
      audio.saut();
    }

    // Petite inclinaison en l'air, poussière en roulant
    const inclinaison = auSol ? 0 : Phaser.Math.Clamp(corps.velocity.y / 40, -14, 14);
    this.joueur.setAngle(this.joueur.flipX ? -inclinaison : inclinaison);
    this.poussiere.emitting = auSol && dir !== 0;

    if (auSol) this.dernierSol = { x: this.joueur.x, y: this.joueur.y };
    if (this.joueur.y > HAUTEUR + 80) this.sauverDeLaChute();

    this.gererVehicules(auSol);
    this.gererOmbre(delta);
    this.gererSuiveurs();

    // Cadeau du tracteur
    if (this.cadeau && Math.abs(this.joueur.x - this.cadeau.x) < 60 && this.joueur.y > SOL_Y - 150) this.ouvrirCadeau();

    // Arrivée
    if (!this.termine && Math.abs(this.joueur.x - this.def.arriveeX) < 40) this.finir();
  }

  private gererVehicules(auSol: boolean): void {
    // Changement de véhicule
    if (controles.changer) {
      controles.changer = false;
      if (etat.tracteurDispo && !this.bloque) this.changerVehicule(etat.vehicule === 'moto' ? 'tracteur' : 'moto');
    }

    // Le tracteur peut faire pousser une plante sur un carré de terre
    const terre = this.terres.find((t) => !t.poussee && Math.abs(t.x - this.joueur.x) < 75);
    etat.actionPossible = etat.vehicule === 'tracteur' && auSol && !!terre && this.joueur.y > SOL_Y - 80;
    if (controles.action) {
      controles.action = false;
      if (etat.actionPossible && terre) this.fairePousser(terre);
      else audio.rate();
    }
  }

  private changerVehicule(nom: NomVehicule): void {
    etat.vehicule = nom;
    this.joueur.setTexture(VEHICULES[nom].texture);
    audio.pouf();
    this.nuageDeParticules(this.joueur.x, this.joueur.y, 0xffffff);
    this.tweens.add({ targets: this.joueur, scale: { from: 0.6, to: 1 }, duration: 250, ease: 'Back.easeOut' });
  }

  private nuageDeParticules(x: number, y: number, teinte: number): void {
    const e = this.add.particles(x, y, 'particule', {
      speed: { min: 80, max: 220 }, lifespan: 500, scale: { start: 1.2, end: 0 }, tint: teinte, emitting: false,
    }).setDepth(20);
    e.explode(18);
    this.time.delayedCall(700, () => e.destroy());
  }

  /** Fait pousser une plante-échelle : une tige et des feuilles où grimper. */
  private fairePousser(terre: Terre): void {
    terre.poussee = true;
    terre.indice.destroy();
    audio.plante();
    const hauteur = 95 * terre.feuilles;
    const tige = this.add.tileSprite(terre.x, SOL_Y, 20, 4, 'tige').setOrigin(0.5, 1).setDepth(2);
    this.tweens.add({ targets: tige, height: hauteur, duration: 120 * terre.feuilles * 2, ease: 'Sine.easeOut' });

    for (let i = 0; i < terre.feuilles; i++) {
      const x = terre.x + (i % 2 === 0 ? 60 : -60);
      const y = SOL_Y - 95 * (i + 1);
      this.time.delayedCall(240 * (i + 1), () => {
        const feuille = this.ajouterPlateforme(x, y, 'feuille');
        this.tweens.add({ targets: feuille, scaleX: { from: 0.1, to: 1 }, duration: 250, ease: 'Back.easeOut' });
        this.nuageDeParticules(x, y, 0x7be36b);
      });
    }
  }

  private ouvrirCadeau(): void {
    if (!this.cadeau) return;
    const { x, y } = this.cadeau;
    this.cadeau.destroy();
    this.cadeau = undefined;
    etat.tracteurDispo = true;
    Sauvegarde.modifier((d) => (d.tracteur = true));
    audio.victoire();
    confettis(this, x, y);
    this.changerVehicule('tracteur');
  }

  // --- Ombre et couleurs ---------------------------------------------------------

  private gererOmbre(delta: number): void {
    // Plus on approche de l'ombre, plus le monde perd ses couleurs
    const cible = this.ombreVaincue ? 0 : Phaser.Math.Clamp((this.joueur.x - (this.def.ombre.x - 800)) / 500, 0, 1);
    this.niveauGris = Phaser.Math.Linear(this.niveauGris, cible, Math.min(1, delta / 400));
    // Effet « couleurs volées » (WebGL uniquement) : le filtre n'existe que lorsqu'il sert,
    // pour ne rien coûter aux téléphones modestes le reste du temps
    if (this.game.renderer.type === Phaser.WEBGL) {
      if (this.niveauGris > 0.01) {
        this.gris ??= this.cameras.main.postFX.addColorMatrix();
        this.gris.grayscale(this.niveauGris);
      } else if (this.gris) {
        this.cameras.main.postFX.clear();
        this.gris = undefined;
      }
    }

    if (this.ombreVaincue || this.bloque) return;
    if (this.joueur.x > this.def.ombre.x - 150) {
      // Rencontre : le combat musical commence
      this.bloque = true;
      this.joueur.setVelocity(0, 0);
      audio.rigole();
      this.tweens.add({ targets: this.ombre, scale: 1.4, duration: 300, yoyo: true });
      this.time.delayedCall(700, () => this.ouvrirScene('CombatMusical'));
    }
  }

  private libererCouleurs(): void {
    this.ombreVaincue = true;
    this.bloque = false;
    // L'ombre, redevenue colorée, s'envole en dansant et laisse un œuf
    this.ombre.setTexture('ombre_couleur');
    confettis(this, this.ombre.x, this.ombre.y, 60);
    this.tweens.killTweensOf(this.ombre);
    this.tweens.add({
      targets: this.ombre, y: -150, x: this.ombre.x + 250, angle: 720, duration: 1800, ease: 'Sine.easeIn',
      onComplete: () => this.ombre.setVisible(false),
    });
    this.poserOeuf(this.def.ombre.x, SOL_Y - 34, this.def.ombre.creature);
  }

  // --- Collecte ---------------------------------------------------------------------

  private ramasserNote(note: Image): void {
    this.tweens.killTweensOf(note);
    note.destroy();
    etat.notes++;
    audio.note(this.rangNote++);
  }

  private ramasserOeuf(oeuf: Image): void {
    if (this.bloque) return;
    const id = oeuf.getData('creature') as string;
    this.tweens.killTweensOf(oeuf);
    oeuf.destroy();
    etat.oeufs[CREATURES.findIndex((c) => c.id === id)] = true;
    const nouvelle = Sauvegarde.ajouterCreature(id);
    audio.oeuf();
    this.ouvrirScene('Eclosion', { id, nouvelle });
  }

  // --- Créatures qui suivent le joueur ------------------------------------------------

  private ajouterSuiveur(id: string): void {
    if (this.suiveurs.some((s) => s.id === id)) return;
    const image = this.add.image(this.joueur.x, this.joueur.y, trouverCreature(id).texture).setOrigin(0.5, 1).setScale(0.5).setDepth(9);
    this.suiveurs.push({ id, image, phase: this.suiveurs.length * 1.3 });
  }

  private gererSuiveurs(): void {
    const dernier = this.traces[this.traces.length - 1];
    if (!dernier || Math.abs(dernier.x - this.joueur.x) > 2 || Math.abs(dernier.y - this.joueur.y) > 2) {
      this.traces.push({ x: this.joueur.x, y: this.joueur.y + 46 });
      if (this.traces.length > 200) this.traces.shift();
    }
    this.suiveurs.forEach((s, i) => {
      const trace = this.traces[Math.max(0, this.traces.length - 1 - (i + 1) * 16)];
      if (!trace) return;
      const saut = Math.abs(Math.sin(this.time.now / 140 + s.phase)) * 10;
      s.image.setFlipX(trace.x < s.image.x - 1 ? true : trace.x > s.image.x + 1 ? false : s.image.flipX);
      s.image.setPosition(Phaser.Math.Linear(s.image.x, trace.x, 0.3), Phaser.Math.Linear(s.image.y, trace.y, 0.3) - saut * 0.3);
    });
  }

  // --- Chute, scènes posées par-dessus, fin -------------------------------------------

  /** Pas de « game over » : une bulle ramène le joueur sur le dernier sol sûr. */
  private sauverDeLaChute(): void {
    audio.bulle();
    if (etat.mode === 'grand') etat.notes = Math.max(0, etat.notes - 3);
    // On recule un peu pour ne pas reposer le joueur au bord du trou
    const recul = this.dernierSol.x < this.joueur.x ? -70 : 70;
    this.joueur.setPosition(this.dernierSol.x + recul, this.dernierSol.y - 40);
    this.joueur.setVelocity(0, 0);
    const bulle = this.add.image(this.joueur.x, this.joueur.y, 'bulle').setDepth(11);
    this.tweens.add({ targets: bulle, scale: 1.4, alpha: 0, duration: 700, onComplete: () => bulle.destroy() });
  }

  private ouvrirScene(cle: string, donnees?: object): void {
    relacherControles();
    audio.musique(false);
    this.scene.sleep('HUD');
    this.scene.pause();
    this.scene.launch(cle, donnees);
  }

  private auRetour(_sys: Phaser.Scenes.Systems, retour?: Retour): void {
    relacherControles();
    this.scene.wake('HUD');
    audio.musique(true);
    if (retour?.eclosion) this.ajouterSuiveur(retour.eclosion);
    if (retour?.combat === 'gagne') this.libererCouleurs();
  }

  private finir(): void {
    this.termine = this.bloque = true;
    Sauvegarde.modifier((d) => (d.notes += etat.notes));
    audio.musique(false);
    audio.victoire();
    for (let i = 0; i < 4; i++) {
      this.time.delayedCall(i * 450, () => confettis(this, this.def.arriveeX - 150 + i * 100, SOL_Y - 160));
    }
    this.tweens.add({ targets: this.joueur, angle: 360, y: this.joueur.y - 60, duration: 500, yoyo: true, repeat: 2 });
    // Après la fête, on montre l'album
    this.time.delayedCall(3200, () => this.scene.start('Album'));
  }
}

