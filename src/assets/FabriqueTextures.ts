// Fabrique toutes les images du jeu en dessin vectoriel.
//
// REMPLACER PAR DE VRAIS SPRITES : chaque image est enregistrée sous une clé
// (« moto », « creature_pikou »...). Il suffit de charger un PNG sous la même clé
// dans Boot.preload() : la fabrique saute alors ce dessin (voir `creer`).
import Phaser from 'phaser';
import { LARGEUR, HAUTEUR } from '../config';

type G = Phaser.GameObjects.Graphics;

const CONTOUR = 0x2b2140;

export class FabriqueTextures {
  private g: G;

  constructor(private scene: Phaser.Scene) {
    this.g = scene.make.graphics({ x: 0, y: 0 }, false);
  }

  /** Dessine une texture, sauf si une image du même nom a déjà été chargée. */
  private creer(cle: string, l: number, h: number, dessin: (g: G) => void): void {
    if (this.scene.textures.exists(cle)) return;
    this.g.clear();
    dessin(this.g);
    this.g.generateTexture(cle, l, h);
  }

  toutCreer(): void {
    this.vehicules();
    this.creatures();
    this.ombres();
    this.decor();
    this.objets();
    this.icones();
  }

  // --- Héros et véhicules -------------------------------------------------

  /** Petit dino casqué, tourné vers la droite, dans un carré de 64 px. */
  private dino(g: G, ox: number, oy: number): void {
    g.fillStyle(0x3fae4a).fillTriangle(ox + 2, oy + 50, ox + 18, oy + 34, ox + 20, oy + 54); // queue
    g.fillStyle(0x5fd35f).fillEllipse(ox + 28, oy + 44, 40, 34); // corps
    g.fillStyle(0xd8f7a8).fillEllipse(ox + 32, oy + 48, 22, 20); // ventre
    g.fillStyle(0x5fd35f).fillCircle(ox + 42, oy + 22, 16).fillEllipse(ox + 54, oy + 26, 20, 15); // tête, museau
    g.fillStyle(0xffffff).fillCircle(ox + 46, oy + 18, 6);
    g.fillStyle(0x1c1c1c).fillCircle(ox + 48, oy + 18, 3).fillCircle(ox + 60, oy + 23, 1.5);
    g.fillStyle(0xff4d4d).slice(ox + 40, oy + 18, 18, Math.PI, Math.PI * 2, false).fillPath(); // casque
    g.fillStyle(0xffd84a).fillRect(ox + 22, oy + 14, 36, 5);
  }

  private roue(g: G, x: number, y: number, r: number): void {
    g.fillStyle(CONTOUR).fillCircle(x, y, r);
    g.fillStyle(0x8f8aa6).fillCircle(x, y, r * 0.55);
    g.fillStyle(0xffd84a).fillCircle(x, y, r * 0.22);
  }

  private vehicules(): void {
    this.creer('dino', 68, 66, (g) => this.dino(g, 0, 0));

    this.creer('moto', 112, 96, (g) => {
      this.dino(g, 22, 0);
      g.fillStyle(0xff8a1f).fillRoundedRect(20, 50, 72, 18, 9); // cadre
      g.fillStyle(0xffc21f).fillRoundedRect(34, 46, 30, 10, 5); // selle
      g.lineStyle(6, CONTOUR).lineBetween(80, 44, 90, 72); // fourche
      g.lineStyle(5, CONTOUR).lineBetween(72, 42, 88, 42); // guidon
      this.roue(g, 24, 74, 20);
      this.roue(g, 88, 74, 20);
    });

    this.creer('tracteur', 112, 96, (g) => {
      this.dino(g, 18, -2);
      g.fillStyle(0x8f8aa6).fillRect(92, 20, 7, 24); // cheminée
      g.fillStyle(0xe8413c).fillRoundedRect(36, 40, 70, 34, 8); // capot
      g.fillStyle(0xffd84a).fillRect(40, 46, 62, 5);
      g.fillStyle(0xb92d2a).fillRoundedRect(8, 54, 40, 22, 6);
      this.roue(g, 30, 66, 28);
      this.roue(g, 92, 78, 16);
    });
  }

  // --- Créatures de l'album (96 x 96) ------------------------------------

  private yeux(g: G, x1: number, x2: number, y: number, r = 9): void {
    g.fillStyle(0xffffff).fillCircle(x1, y, r).fillCircle(x2, y, r);
    g.fillStyle(0x1c1c1c).fillCircle(x1 + 2, y + 1, r * 0.5).fillCircle(x2 + 2, y + 1, r * 0.5);
    g.fillStyle(0xffffff).fillCircle(x1 + 4, y - 2, r * 0.2).fillCircle(x2 + 4, y - 2, r * 0.2);
  }

  private creatures(): void {
    // Pikou : bébé dino orange à trois petites cornes
    this.creer('creature_pikou', 96, 96, (g) => {
      g.fillStyle(0xffb347).fillEllipse(48, 30, 76, 44); // collerette
      g.fillStyle(0xff8a1f).fillEllipse(48, 56, 64, 58);
      g.fillStyle(0xffe1a8).fillEllipse(48, 68, 36, 28);
      g.fillStyle(0xfff4d6).fillTriangle(26, 30, 32, 8, 38, 30).fillTriangle(58, 30, 64, 8, 70, 30).fillTriangle(42, 50, 48, 36, 54, 50);
      this.yeux(g, 34, 62, 48);
      g.fillStyle(0xd96a10).fillEllipse(32, 88, 20, 12).fillEllipse(64, 88, 20, 12);
    });

    // Bloup : petit monstre bleu à un œil et une antenne
    this.creer('creature_bloup', 96, 96, (g) => {
      g.lineStyle(5, 0x2a8fd6).lineBetween(48, 26, 60, 8);
      g.fillStyle(0xff5fa2).fillCircle(61, 8, 7);
      g.fillStyle(0x3ab8ff).fillCircle(48, 54, 34);
      g.fillStyle(0x8fdcff).fillEllipse(36, 40, 18, 12);
      g.fillStyle(0xffffff).fillCircle(48, 48, 16);
      g.fillStyle(0x1c1c1c).fillCircle(51, 50, 8);
      g.fillStyle(0xffffff).fillCircle(54, 46, 3);
      g.fillStyle(0x1c5f99).fillEllipse(48, 74, 22, 8); // sourire
      g.fillStyle(0x2a8fd6).fillEllipse(32, 90, 20, 10).fillEllipse(64, 90, 20, 10);
    });

    // Mimo : bébé long-cou rose à pois
    this.creer('creature_mimo', 96, 96, (g) => {
      g.fillStyle(0xff8fc0).fillTriangle(4, 76, 26, 58, 28, 80); // queue
      g.fillStyle(0xff8fc0).fillEllipse(42, 70, 60, 38);
      g.fillStyle(0xff8fc0).fillRoundedRect(54, 22, 18, 50, 9); // cou
      g.fillStyle(0xff8fc0).fillEllipse(68, 22, 36, 28);
      g.fillStyle(0xffd0e6).fillCircle(30, 66, 6).fillCircle(46, 76, 5).fillCircle(44, 60, 4);
      this.yeux(g, 62, 78, 18, 7);
      g.fillStyle(0xe0609a).fillEllipse(28, 90, 18, 10).fillEllipse(56, 90, 18, 10);
    });

    // Silhouette mystère pour les cases vides de l'album
    this.creer('creature_mystere', 96, 96, (g) => {
      g.fillStyle(0xffffff).fillEllipse(48, 54, 50, 66);
    });
  }

  // --- Ombres rigolotes (120 x 120) --------------------------------------

  private ombre(g: G, arcEnCiel: boolean): void {
    if (arcEnCiel) {
      // Version colorée : apparaît peu à peu pendant le combat musical
      const bandes = [0xff5f5f, 0xffb347, 0xffe14a, 0x7be36b, 0x3ad6ff, 0xb07bff];
      bandes.forEach((c, i) => g.fillStyle(c).fillCircle(60, 56, 50 - i * 8));
    } else {
      g.fillStyle(0x4a2f7a).fillCircle(60, 56, 50);
    }
    const bas = arcEnCiel ? 0xff5f5f : 0x4a2f7a;
    g.fillStyle(bas).fillCircle(24, 100, 14).fillCircle(48, 104, 14).fillCircle(72, 104, 14).fillCircle(96, 100, 14);
    // Gros yeux qui louchent et langue tirée : plus rigolote que méchante
    g.fillStyle(0xffffff).fillCircle(42, 44, 16).fillCircle(80, 46, 13);
    g.fillStyle(0x1c1c1c).fillCircle(47, 47, 7).fillCircle(76, 49, 6);
    g.fillStyle(0x1c1c1c).fillEllipse(60, 78, 44, 20);
    g.fillStyle(0xff7a9e).fillEllipse(64, 86, 20, 18);
    g.fillStyle(0xffffff).fillRect(46, 70, 8, 8);
  }

  private ombres(): void {
    this.creer('ombre', 120, 120, (g) => this.ombre(g, false));
    this.creer('ombre_couleur', 120, 120, (g) => this.ombre(g, true));
  }

  // --- Décor ---------------------------------------------------------------

  /** Ciel en dégradé (bandes), une texture par royaume. */
  ciel(cle: string, haut: number, bas: number): void {
    this.creer(cle, LARGEUR, HAUTEUR, (g) => {
      const a = Phaser.Display.Color.ValueToColor(haut);
      const b = Phaser.Display.Color.ValueToColor(bas);
      const n = 30;
      for (let i = 0; i < n; i++) {
        const c = Phaser.Display.Color.Interpolate.ColorWithColor(a, b, n - 1, i);
        g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b)).fillRect(0, (i * HAUTEUR) / n, LARGEUR, HAUTEUR / n + 1);
      }
    });
  }

  private decor(): void {
    this.creer('sol', 64, 100, (g) => {
      g.fillStyle(0x9b6a3c).fillRect(0, 0, 64, 100);
      g.fillStyle(0x845630).fillCircle(14, 50, 6).fillCircle(46, 74, 8).fillCircle(34, 38, 4);
      g.fillStyle(0x58c94f).fillRect(0, 0, 64, 18);
      g.fillStyle(0x7be36b).fillRect(0, 0, 64, 7);
      g.fillStyle(0x58c94f).fillCircle(10, 18, 7).fillCircle(32, 19, 8).fillCircle(54, 18, 7);
    });

    this.creer('plateforme', 128, 32, (g) => {
      g.fillStyle(0x845630).fillRoundedRect(0, 6, 128, 26, 12);
      g.fillStyle(0x58c94f).fillRoundedRect(0, 0, 128, 16, 8);
      g.fillStyle(0x7be36b).fillRoundedRect(4, 2, 120, 6, 3);
    });

    this.creer('feuille', 140, 28, (g) => {
      g.fillStyle(0x2f9e44).fillEllipse(70, 14, 140, 28);
      g.fillStyle(0x51cf66).fillEllipse(70, 10, 124, 16);
    });

    this.creer('tige', 20, 32, (g) => {
      g.fillStyle(0x2f9e44).fillRect(4, 0, 12, 32);
      g.fillStyle(0x51cf66).fillRect(6, 0, 4, 32);
    });

    this.creer('terre', 110, 26, (g) => {
      g.fillStyle(0x5c3a1e).fillEllipse(55, 15, 110, 22);
      g.fillStyle(0x7a4f2a).fillEllipse(55, 12, 92, 12);
      g.fillStyle(0x51cf66).fillEllipse(48, 5, 12, 7).fillEllipse(62, 5, 12, 7); // petite pousse
    });

    this.creer('volcan', 420, 300, (g) => {
      g.fillStyle(0x8a6fb0).fillTriangle(0, 300, 210, 20, 420, 300);
      g.fillStyle(0x705a94).fillTriangle(210, 20, 420, 300, 260, 300);
      g.fillStyle(0xff8a1f).fillTriangle(170, 74, 210, 20, 250, 74);
      g.fillStyle(0xffd84a).fillCircle(210, 44, 14);
      g.fillStyle(0xffffff, 0.7).fillCircle(214, 8, 12).fillCircle(232, 0, 9);
    });

    this.creer('arbre', 150, 230, (g) => {
      g.fillStyle(0x7a4f2a).fillRoundedRect(64, 110, 22, 120, 8);
      g.fillStyle(0x2f9e44).fillCircle(75, 80, 62).fillCircle(36, 110, 36).fillCircle(114, 110, 36);
      g.fillStyle(0x51cf66).fillCircle(64, 62, 30);
    });

    this.creer('buisson', 120, 70, (g) => {
      g.fillStyle(0x2f9e44).fillCircle(30, 46, 28).fillCircle(62, 34, 34).fillCircle(94, 48, 26);
      g.fillStyle(0x51cf66).fillCircle(56, 28, 16);
      g.fillStyle(0xff5fa2).fillCircle(30, 40, 5).fillCircle(84, 36, 5);
    });

    this.creer('nuage', 150, 70, (g) => {
      g.fillStyle(0xffffff).fillCircle(40, 44, 26).fillCircle(76, 34, 32).fillCircle(112, 46, 24).fillRoundedRect(30, 44, 90, 24, 12);
    });

    this.creer('arche', 180, 260, (g) => {
      g.lineStyle(22, 0xff5fa2).beginPath().arc(90, 110, 76, Math.PI, 0).strokePath();
      g.lineStyle(10, 0xffd84a).beginPath().arc(90, 110, 76, Math.PI, 0).strokePath();
      g.fillStyle(0xff5fa2).fillRect(3, 110, 22, 150).fillRect(155, 110, 22, 150);
      g.fillStyle(0xffd84a).fillRect(9, 110, 10, 150).fillRect(161, 110, 10, 150);
    });
  }

  // --- Objets ---------------------------------------------------------------

  private etoile(g: G, x: number, y: number, r: number, couleur: number): void {
    const pts: Phaser.Math.Vector2[] = [];
    for (let i = 0; i < 10; i++) {
      const rayon = i % 2 === 0 ? r : r * 0.45;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      pts.push(new Phaser.Math.Vector2(x + Math.cos(a) * rayon, y + Math.sin(a) * rayon));
    }
    g.fillStyle(couleur).fillPoints(pts, true);
  }

  private objets(): void {
    this.creer('oeuf', 48, 60, (g) => {
      g.fillStyle(0xfff4d6).fillEllipse(24, 32, 44, 56);
      g.fillStyle(0xff5fa2).fillCircle(16, 22, 6);
      g.fillStyle(0x3ad6ff).fillCircle(32, 34, 7);
      g.fillStyle(0x7be36b).fillCircle(18, 44, 5);
    });

    this.creer('note', 36, 40, (g) => {
      g.fillStyle(0xffd84a).fillEllipse(13, 30, 20, 16);
      g.fillRect(20, 4, 5, 26);
      g.fillTriangle(20, 4, 34, 10, 20, 16);
    });

    this.creer('etoile', 48, 48, (g) => this.etoile(g, 24, 25, 22, 0xffffff));
    this.creer('particule', 16, 16, (g) => g.fillStyle(0xffffff).fillCircle(8, 8, 8));

    this.creer('cadeau', 80, 80, (g) => {
      g.fillStyle(0x3ad6ff).fillRoundedRect(8, 28, 64, 48, 8);
      g.fillStyle(0xff5fa2).fillRect(34, 28, 12, 48).fillRoundedRect(4, 20, 72, 14, 6);
      g.fillStyle(0xff5fa2).fillCircle(30, 14, 10).fillCircle(50, 14, 10);
      g.fillStyle(0xffd84a).fillCircle(40, 18, 6);
    });

    this.creer('bulle', 140, 140, (g) => {
      g.fillStyle(0x9be7ff, 0.35).fillCircle(70, 70, 66);
      g.lineStyle(5, 0xffffff, 0.9).strokeCircle(70, 70, 66);
      g.fillStyle(0xffffff, 0.8).fillEllipse(46, 40, 26, 14);
    });

    this.creer('fleche', 72, 72, (g) => {
      // Flèche vers la droite (on la tourne pour les autres directions)
      g.fillStyle(0xffffff).fillRoundedRect(4, 24, 38, 24, 8).fillTriangle(34, 6, 68, 36, 34, 66);
    });
  }

  // --- Icônes des boutons (blanches, 64 x 64) --------------------------------

  private icones(): void {
    const blanc = 0xffffff;
    this.creer('ico_droite', 64, 64, (g) => g.fillStyle(blanc).fillTriangle(18, 8, 54, 32, 18, 56));
    this.creer('ico_gauche', 64, 64, (g) => g.fillStyle(blanc).fillTriangle(46, 8, 10, 32, 46, 56));
    this.creer('ico_saut', 64, 64, (g) => g.fillStyle(blanc).fillTriangle(8, 38, 32, 6, 56, 38).fillRoundedRect(22, 34, 20, 24, 6));
    this.creer('ico_jouer', 64, 64, (g) => g.fillStyle(blanc).fillTriangle(16, 4, 60, 32, 16, 60));
    this.creer('ico_pause', 64, 64, (g) => g.fillStyle(blanc).fillRoundedRect(12, 8, 14, 48, 5).fillRoundedRect(38, 8, 14, 48, 5));
    this.creer('ico_retour', 64, 64, (g) => g.fillStyle(blanc).fillTriangle(34, 6, 4, 32, 34, 58).fillRoundedRect(28, 22, 32, 20, 6));
    this.creer('ico_maison', 64, 64, (g) => {
      g.fillStyle(blanc).fillTriangle(4, 32, 32, 4, 60, 32).fillRect(12, 30, 40, 28);
      g.fillStyle(0x000000, 0.35).fillRect(26, 40, 12, 18);
    });
    this.creer('ico_son', 64, 64, (g) => {
      g.fillStyle(blanc).fillRect(6, 22, 14, 20).fillTriangle(16, 32, 38, 8, 38, 56);
      g.lineStyle(5, blanc).beginPath().arc(38, 32, 12, -1, 1).strokePath().beginPath().arc(38, 32, 22, -1, 1).strokePath();
    });
    this.creer('ico_muet', 64, 64, (g) => {
      g.fillStyle(blanc).fillRect(6, 22, 14, 20).fillTriangle(16, 32, 38, 8, 38, 56);
      g.lineStyle(6, blanc).lineBetween(44, 22, 60, 42).lineBetween(60, 22, 44, 42);
    });
    this.creer('ico_album', 64, 64, (g) => {
      g.fillStyle(blanc).fillRoundedRect(6, 8, 52, 48, 6);
      g.fillStyle(0x000000, 0.3).fillRect(30, 8, 4, 48);
      g.fillStyle(0xffd84a).fillEllipse(19, 32, 14, 20).fillEllipse(45, 32, 14, 20);
    });
    this.creer('ico_plante', 64, 64, (g) => {
      g.fillStyle(blanc).fillRect(29, 24, 6, 36);
      g.fillEllipse(18, 22, 26, 16).fillEllipse(46, 16, 26, 16);
    });
    this.creer('ico_musique', 64, 64, (g) => {
      g.fillStyle(blanc).fillEllipse(18, 48, 22, 16).fillEllipse(48, 42, 22, 16);
      g.fillRect(24, 10, 5, 38).fillRect(54, 6, 5, 36).fillTriangle(24, 8, 59, 2, 59, 14).fillTriangle(24, 8, 24, 20, 59, 14);
    });
  }
}
