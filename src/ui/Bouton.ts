// Gros bouton rond tactile avec icône (aucun texte).
import Phaser from 'phaser';

export interface OptionsBouton {
  x: number;
  y: number;
  rayon: number;
  couleur: number;
  icone: string;
  /** Appelé quand le doigt se pose. */
  surAppui: () => void;
  /** Appelé quand le doigt se lève ou quitte le bouton (boutons à maintenir). */
  surRelache?: () => void;
  /** Bouton à maintenir : glisser le doigt dessus l'active aussi. */
  maintien?: boolean;
}

export function creerBouton(scene: Phaser.Scene, o: OptionsBouton): Phaser.GameObjects.Container {
  const fonce = Phaser.Display.Color.ValueToColor(o.couleur).darken(30).color;
  const g = scene.add.graphics();
  g.fillStyle(fonce).fillCircle(0, 6, o.rayon); // épaisseur du bouton
  g.fillStyle(o.couleur).fillCircle(0, 0, o.rayon);
  g.fillStyle(0xffffff, 0.25).fillEllipse(-o.rayon * 0.2, -o.rayon * 0.45, o.rayon * 1.1, o.rayon * 0.5);
  const icone = scene.add.image(0, 0, o.icone).setDisplaySize(o.rayon * 1.05, o.rayon * 1.05);

  const bouton = scene.add.container(o.x, o.y, [g, icone]);
  // Zone de toucher carrée, un peu plus large que le dessin
  bouton.setSize(o.rayon * 2.2, o.rayon * 2.2).setInteractive();

  let enfonce = false;
  const appuyer = () => {
    if (enfonce) return;
    enfonce = true;
    bouton.setScale(0.9);
    o.surAppui();
  };
  const relacher = () => {
    if (!enfonce) return;
    enfonce = false;
    bouton.setScale(1);
    o.surRelache?.();
  };

  bouton.on('pointerdown', appuyer);
  bouton.on('pointerup', relacher);
  bouton.on('pointerout', relacher);
  if (o.maintien) {
    bouton.on('pointerover', (p: Phaser.Input.Pointer) => {
      if (p.isDown) appuyer();
    });
  }
  return bouton;
}

/** Remplace l'icône d'un bouton créé par creerBouton. */
export function changerIcone(bouton: Phaser.GameObjects.Container, icone: string): void {
  (bouton.getAt(1) as Phaser.GameObjects.Image).setTexture(icone);
}

/** Pluie de confettis colorés autour d'un point. */
export function confettis(scene: Phaser.Scene, x: number, y: number, quantite = 40): void {
  const emetteur = scene.add.particles(x, y, 'particule', {
    speed: { min: 150, max: 420 },
    angle: { min: 200, max: 340 },
    gravityY: 600,
    lifespan: 1400,
    scale: { start: 0.9, end: 0.2 },
    tint: [0xff5fa2, 0x3ad6ff, 0xffd84a, 0x7be36b, 0xb07bff],
    emitting: false,
  });
  emetteur.setDepth(100);
  emetteur.explode(quantite);
  scene.time.delayedCall(1600, () => emetteur.destroy());
}
