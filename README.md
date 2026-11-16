# Dino Riders : l'île aux Échos

Jeu mobile de plateforme et de collection pour enfants de 5 à 7 ans.
Phaser 3 + TypeScript + Vite, installable comme application (PWA), jouable hors ligne.
Aucune pub, aucun achat, aucune connexion, aucune donnée collectée : la sauvegarde reste dans le téléphone.

## Lancer le jeu sur un ordinateur

```bash
npm install
npm run dev        # version de développement
npm run build      # version finale dans dist/
npm run preview    # sert dist/ (pour tester la PWA et le hors-ligne)
```

Au clavier : flèches gauche/droite pour rouler, flèche haut ou espace pour sauter.
Dans Chrome, F12 puis l'icône téléphone affiche le mode mobile avec les boutons tactiles.

## Installer sur un téléphone

Le jeu est publié automatiquement sur GitHub Pages à chaque envoi sur `main`
(adresse : `https://<compte>.github.io/dino-riders/`).

- **Android (Chrome)** : ouvrir l'adresse, menu ⋮, « Ajouter à l'écran d'accueil » ou « Installer l'application ».
- **iPhone / iPad (Safari uniquement)** : ouvrir l'adresse, bouton Partager, « Sur l'écran d'accueil ».

Après une première ouverture avec du réseau, le jeu fonctionne sans connexion.
Sur iPhone, tenir le téléphone à l'horizontale (verrouillage de rotation désactivé).

## Comment on joue

- Écran titre : bouton vert pour jouer, bouton rose pour l'album.
- Choix de l'âge : petit dino (5 ans) ou grand dino (7 ans).
- Dans le royaume : flèches bleues pour rouler, bouton orange pour sauter.
- Les œufs éclosent quand on tape dessus ; les créatures suivent ensuite le joueur.
- L'ombre vole les couleurs : on tape en rythme quand l'anneau touche le bouton.
- Le cadeau donne le tracteur. Sur un carré de terre, le bouton vert fait pousser une plante-échelle.
- Le bouton jaune change de véhicule.

| | Petit (5 ans) | Grand (7 ans) |
|---|---|---|
| Fossés | petits ponts | à sauter |
| Rythme | 1 bouton, lent, aucun raté ne compte | 2 boutons, plus rapide, 6 ratés = on recommence |
| Guidage | flèches jaunes | aucun |
| Œufs | visibles | un œuf caché derrière un buisson |

## Organisation du code

```
src/
  main.ts                  configuration Phaser et liste des scènes
  config.ts                tailles, véhicules, difficulté
  scenes/                  Boot, Titre, ChoixAge, Royaume, HUD, CombatMusical, Eclosion, Album, Pause
  systems/                 Audio (Web Audio), Sauvegarde (localStorage), Etat (partagé entre scènes)
  data/                    royaumes.ts (niveaux), creatures.ts (album)
  assets/FabriqueTextures  tous les dessins vectoriels
  ui/Bouton.ts             boutons tactiles et confettis
```

### Remplacer les dessins par de vrais sprites

Chaque image porte une clé (`moto`, `tracteur`, `creature_pikou`, `ombre`...).
Charger un PNG sous la même clé dans `Boot.preload()` suffit : la fabrique ne redessine pas une clé déjà chargée.

### Ajouter du contenu

- Une créature : une ligne dans `data/creatures.ts` et sa texture `creature_<id>`.
- Un royaume : une nouvelle constante `DefRoyaume` dans `data/royaumes.ts`.
- Un véhicule : une entrée dans `VEHICULES` (`config.ts`) et sa texture.
