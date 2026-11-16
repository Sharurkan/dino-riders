// Démarrage : fabrique les images, lit la sauvegarde, puis affiche le titre
import Phaser from 'phaser';
import { FabriqueTextures } from '../assets/FabriqueTextures';
import { Sauvegarde } from '../systems/Sauvegarde';
import { audio } from '../systems/Audio';
import { VALLEE_DES_DINOS } from '../data/royaumes';

export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    // Pour utiliser de vrais sprites plus tard, les charger ici sous la même clé :
    // this.load.image('moto', 'sprites/moto.png');
  }

  create(): void {
    const fabrique = new FabriqueTextures(this);
    fabrique.toutCreer();
    fabrique.ciel('ciel_' + VALLEE_DES_DINOS.cle, ...VALLEE_DES_DINOS.ciel);
    audio.definirSon(Sauvegarde.lire().son);
    this.scene.start('Titre');
  }
}
