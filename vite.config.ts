import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// base './' : le jeu fonctionne quel que soit le sous-dossier d'hébergement (GitHub Pages, etc.)
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 2000 },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      // Tout le jeu est mis en cache : il fonctionne ensuite sans réseau
      workbox: { globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest}'] },
      includeAssets: ['icons/*.png'],
      manifest: {
        name: "Dino Riders : l'île aux Échos",
        short_name: 'Dino Riders',
        description: 'Jeu de plateforme et de collection pour enfants',
        lang: 'fr',
        start_url: './',
        scope: './',
        display: 'fullscreen',
        orientation: 'landscape',
        background_color: '#1a0b3a',
        theme_color: '#1a0b3a',
        icons: [
          { src: 'icons/icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icone-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icone-512-masquable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
