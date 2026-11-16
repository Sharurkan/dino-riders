// Commandes tactiles et compteurs, affichés par-dessus le royaume
import Phaser from 'phaser';
import { LARGEUR, HAUTEUR, POLICE } from '../config';
import { audio } from '../systems/Audio';
import { etat, controles, relacherControles } from '../systems/Etat';
import { CREATURES } from '../data/creatures';
import { creerBouton } from '../ui/Bouton';

export class HUD extends Phaser.Scene {
  private texteNotes!: Phaser.GameObjects.Text;
  private oeufs: Phaser.GameObjects.Image[] = [];
  private boutonChanger!: Phaser.GameObjects.Container;
  private iconeChanger!: Phaser.GameObjects.Image;
  private boutonAction!: Phaser.GameObjects.Container;
  private halo!: Phaser.GameObjects.Arc;

  constructor() {
    super('HUD');
  }

  create(): void {
    // --- Déplacement (main gauche) ---
    creerBouton(this, {
      x: 86, y: HAUTEUR - 84, rayon: 62, couleur: 0x3a8dff, icone: 'ico_gauche', maintien: true,
      surAppui: () => (controles.gauche = true), surRelache: () => (controles.gauche = false),
    }).setAlpha(0.9);
    creerBouton(this, {
      x: 232, y: HAUTEUR - 84, rayon: 62, couleur: 0x3a8dff, icone: 'ico_droite', maintien: true,
      surAppui: () => (controles.droite = true), surRelache: () => (controles.droite = false),
    }).setAlpha(0.9);

    // --- Saut et action (main droite) ---
    creerBouton(this, {
      x: LARGEUR - 96, y: HAUTEUR - 96, rayon: 74, couleur: 0xff8a1f, icone: 'ico_saut', maintien: true,
      surAppui: () => (controles.saut = true), surRelache: () => (controles.saut = false),
    }).setAlpha(0.9);

    // Halo qui clignote quand le tracteur peut faire pousser une plante
    this.halo = this.add.circle(LARGEUR - 250, HAUTEUR - 74, 70, 0xffffff, 0.5).setVisible(false);
    this.tweens.add({ targets: this.halo, scale: 1.25, alpha: 0.1, duration: 500, yoyo: true, repeat: -1 });
    this.boutonAction = creerBouton(this, {
      x: LARGEUR - 250, y: HAUTEUR - 74, rayon: 58, couleur: 0x3ecf5a, icone: 'ico_plante',
      surAppui: () => (controles.action = true),
    });

    // --- Changement de véhicule : l'icône montre le véhicule que l'on va prendre ---
    this.boutonChanger = creerBouton(this, {
      x: LARGEUR - 84, y: 190, rayon: 52, couleur: 0xffd84a, icone: 'tracteur',
      surAppui: () => (controles.changer = true),
    });
    this.iconeChanger = this.boutonChanger.getAt(1) as Phaser.GameObjects.Image;

    // --- Pause ---
    creerBouton(this, {
      x: LARGEUR - 64, y: 60, rayon: 48, couleur: 0x7a5cff, icone: 'ico_pause',
      surAppui: () => {
        audio.bouton();
        audio.musique(false);
        relacherControles();
        this.scene.pause('Royaume');
        this.scene.launch('Pause', { origine: 'Royaume' });
        this.scene.sleep();
      },
    });

    // --- Compteurs : notes ramassées et œufs trouvés ---
    this.add.image(44, 44, 'note').setScale(1.3);
    this.texteNotes = this.add.text(78, 44, '0', {
      fontFamily: POLICE, fontSize: '38px', color: '#ffffff', stroke: '#2b2140', strokeThickness: 7,
    }).setOrigin(0, 0.5);
    this.oeufs = CREATURES.map((_, i) => this.add.image(200 + i * 54, 44, 'oeuf').setScale(0.8));

    // Au réveil (retour de pause, d'éclosion...), aucun bouton ne doit rester enfoncé
    this.events.on('wake', relacherControles);
    this.events.once('shutdown', () => this.events.off('wake', relacherControles));
  }

  update(): void {
    this.texteNotes.setText(String(etat.notes));
    this.oeufs.forEach((o, i) => {
      if (etat.oeufs[i]) o.clearTint().setAlpha(1);
      else o.setTintFill(0x2b2140).setAlpha(0.35);
    });

    this.boutonChanger.setVisible(etat.tracteurDispo);
    this.iconeChanger.setTexture(etat.vehicule === 'moto' ? 'tracteur' : 'moto').setDisplaySize(70, 60);

    this.boutonAction.setVisible(etat.vehicule === 'tracteur');
    this.boutonAction.setAlpha(etat.actionPossible ? 1 : 0.5);
    this.halo.setVisible(etat.vehicule === 'tracteur' && etat.actionPossible);
  }
}
