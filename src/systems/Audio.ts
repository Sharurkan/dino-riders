// Tous les sons sont fabriqués avec la Web Audio API : aucun fichier audio.

/** Gamme pentatonique joyeuse (do, ré, mi, sol, la, do...). */
export const GAMME = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];

// Petite boucle de musique du royaume en croches (rang dans la gamme, -1 = silence)
const MELODIE = [0, 2, 3, 2, 0, 2, 4, -1, 3, 2, 0, 2, 3, 5, 4, -1];
const BASSE = [130.81, 0, 196, 0, 174.61, 0, 196, 0];

class MoteurAudio {
  private ctx: AudioContext | null = null;
  private sortie: GainNode | null = null;
  private actif = true;
  private minuterie: number | undefined;
  private pas = 0;

  /** À appeler au premier toucher : les navigateurs bloquent le son avant. */
  deverrouiller(): void {
    if (!this.ctx) {
      const Classe: typeof AudioContext | undefined =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Classe) return;
      this.ctx = new Classe();
      this.sortie = this.ctx.createGain();
      this.sortie.gain.value = this.actif ? 1 : 0;
      this.sortie.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  /** Coupe le son quand le jeu passe en arrière-plan. */
  suspendre(cache: boolean): void {
    if (!this.ctx) return;
    if (cache) void this.ctx.suspend();
    else void this.ctx.resume();
  }

  definirSon(actif: boolean): void {
    this.actif = actif;
    if (this.sortie) this.sortie.gain.value = actif ? 1 : 0;
  }

  get sonActif(): boolean {
    return this.actif;
  }

  /** Joue un bip. `glisse` (Hz) fait monter ou descendre la note pendant sa durée. */
  bip(freq: number, duree = 0.12, type: OscillatorType = 'sine', volume = 0.2, delai = 0, glisse = 0): void {
    if (!this.ctx || !this.sortie) return;
    const t = this.ctx.currentTime + delai;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (glisse) osc.frequency.linearRampToValueAtTime(Math.max(30, freq + glisse), t + duree);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    osc.connect(gain).connect(this.sortie);
    osc.start(t);
    osc.stop(t + duree + 0.02);
  }

  /** Souffle court (charleston, « pouf »). */
  bruit(duree = 0.05, volume = 0.1, delai = 0): void {
    if (!this.ctx || !this.sortie) return;
    const n = Math.floor(this.ctx.sampleRate * duree);
    const tampon = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const donnees = tampon.getChannelData(0);
    for (let i = 0; i < n; i++) donnees[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    source.buffer = tampon;
    source.connect(gain).connect(this.sortie);
    source.start(this.ctx.currentTime + delai);
  }

  /** Joue une suite de notes de la gamme. */
  arpege(indices: number[], pas = 0.09, type: OscillatorType = 'triangle', volume = 0.2): void {
    indices.forEach((i, k) => this.bip(GAMME[i % GAMME.length], pas * 1.8, type, volume, k * pas));
  }

  // --- Sons du jeu -------------------------------------------------------
  bouton(): void { this.bip(660, 0.08, 'square', 0.1); this.bip(990, 0.1, 'square', 0.1, 0.06); }
  saut(): void { this.bip(330, 0.18, 'sine', 0.18, 0, 400); }
  note(rang: number): void { this.bip(GAMME[rang % GAMME.length], 0.18, 'triangle', 0.2); }
  oeuf(): void { this.arpege([0, 2, 4, 5], 0.07); }
  fissure(): void { this.bruit(0.08, 0.2); this.bip(200, 0.08, 'square', 0.1); }
  eclosion(): void { this.arpege([0, 2, 4, 5, 4, 5, 7], 0.1, 'triangle', 0.25); }
  plante(): void { [0, 1, 2, 3, 4, 5].forEach((i, k) => this.bip(GAMME[i], 0.2, 'sine', 0.2, k * 0.12)); }
  pouf(): void { this.bruit(0.15, 0.2); this.bip(500, 0.2, 'sine', 0.15, 0, 300); }
  bulle(): void { this.bip(300, 0.3, 'sine', 0.2, 0, 500); }
  rate(): void { this.bip(220, 0.15, 'sine', 0.12, 0, -60); }
  rigole(): void { [0, 1, 2, 3].forEach((k) => this.bip(700 - k * 60, 0.09, 'square', 0.08, k * 0.1, 80)); }
  victoire(): void { this.arpege([0, 2, 4, 5, 4, 5, 7, 7], 0.12, 'square', 0.14); }
  grosseCaisse(): void { this.bip(140, 0.16, 'sine', 0.4, 0, -100); }
  charleston(): void { this.bruit(0.04, 0.07); }

  // --- Musique de fond du royaume ---------------------------------------
  musique(jouer: boolean): void {
    window.clearInterval(this.minuterie);
    this.minuterie = undefined;
    if (!jouer) return;
    this.minuterie = window.setInterval(() => {
      const m = MELODIE[this.pas % MELODIE.length];
      if (m >= 0) this.bip(GAMME[m] / 2, 0.22, 'triangle', 0.05);
      const b = BASSE[this.pas % BASSE.length];
      if (b) this.bip(b, 0.2, 'sine', 0.08);
      if (this.pas % 2 === 1) this.bruit(0.03, 0.02);
      this.pas++;
    }, 240);
  }
}

/** Instance unique utilisée par tout le jeu. */
export const audio = new MoteurAudio();
