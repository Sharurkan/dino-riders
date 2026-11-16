// Point d'entrée : configuration de Phaser et liste des scènes
import Phaser from 'phaser';
import { LARGEUR, HAUTEUR } from './config';
import { audio } from './systems/Audio';
import { Boot } from './scenes/Boot';
import { Titre } from './scenes/Titre';
import { ChoixAge } from './scenes/ChoixAge';
import { Royaume } from './scenes/Royaume';
import { HUD } from './scenes/HUD';
import { CombatMusical } from './scenes/CombatMusical';
import { Eclosion } from './scenes/Eclosion';
import { Album } from './scenes/Album';
import { Pause } from './scenes/Pause';

const jeu = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'jeu',
  backgroundColor: '#1a0b3a',
  // L'image garde ses proportions et remplit au mieux l'écran du téléphone
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: LARGEUR, height: HAUTEUR },
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 1400 } } },
  // Plusieurs doigts en même temps (avancer + sauter)
  input: { activePointers: 4 },
  scene: [Boot, Titre, ChoixAge, Royaume, HUD, CombatMusical, Eclosion, Album, Pause],
});

// Le son ne peut démarrer qu'après un premier toucher (règle des navigateurs)
const deverrouiller = () => audio.deverrouiller();
window.addEventListener('pointerdown', deverrouiller);
window.addEventListener('touchend', deverrouiller);

// Silence quand le jeu passe en arrière-plan
document.addEventListener('visibilitychange', () => audio.suspendre(document.hidden));

// Accès pratique pour les tests automatiques
(window as unknown as { jeu: Phaser.Game }).jeu = jeu;
