import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { scanPublicDirectory } from './src/server/scannerNode.ts';

function publicLangsApiPlugin(): Plugin {
  return {
    name: 'public-langs-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();

        if (req.url.startsWith('/api/files') && req.method === 'GET') {
          try {
            const scan = scanPublicDirectory(process.cwd());
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(scan));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: (err as Error).message }));
          }
          return;
        }

        if (req.url.startsWith('/api/upload') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const lang = (data.language || 'altre').toLowerCase().trim();
              const cat = (data.category || 'generale').toLowerCase().trim();
              const fileName = (data.fileName || 'foglio.html').replace(/[^a-zA-Z0-9_.-]/g, '_');

              const targetDir = path.resolve(process.cwd(), 'public', 'langs', lang, cat);
              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
              }

              const targetPath = path.join(targetDir, fileName);
              fs.writeFileSync(targetPath, data.content || '', 'utf8');

              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  relPath: `langs/${lang}/${cat}/${fileName}`,
                  url: `/langs/${lang}/${cat}/${fileName}`
                })
              );
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: (err as Error).message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      publicLangsApiPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: '/',
          name: 'LinguaHub PWA',
          short_name: 'LinguaHub',
          description: 'PWA modulare per raccogliere e consultare fogli HTML per lingue.',
          theme_color: '#3b82f6',
          background_color: '#090d16',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}']
        },
        devOptions: {
          enabled: true,
          type: 'module'
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.')
      }
    },
    server: {
      hmr: false,
      watch: process.env.DISABLE_HMR === 'true' ? null : {}
    }
  };
});
