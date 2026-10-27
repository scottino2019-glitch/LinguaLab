import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scanPublicDirectory } from './src/server/scannerNode.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  // API: Get scanned public files
  app.get('/api/files', (_req, res) => {
    try {
      const scan = scanPublicDirectory(process.cwd());
      res.json(scan);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // API: Get content of a specific file from public directory
  app.get('/api/file-content', (req, res) => {
    try {
      const rawParam = (req.query.url as string || req.query.path as string || '').trim();
      const sanitized = rawParam.replace(/^\/+/, '').replace(/\.\./g, '');
      if (!sanitized) {
        return res.status(400).json({ error: 'Parametro percorso non valido' });
      }

      const fullPath = path.resolve(process.cwd(), 'public', sanitized);
      if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
        return res.status(404).json({ error: `File non trovato in public: ${sanitized}` });
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(content);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // API: Upload / Save HTML file to public/langs/<lang>/<cat>/<filename>
  app.post('/api/upload', (req, res) => {
    try {
      const { language, category, fileName, content } = req.body;
      const lang = (language || 'altre').toLowerCase().trim();
      const cat = (category || 'generale').toLowerCase().trim();
      const safeName = (fileName || 'foglio.html').replace(/[^a-zA-Z0-9_.-]/g, '_');

      const targetDir = path.resolve(process.cwd(), 'public', 'langs', lang, cat);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const targetPath = path.join(targetDir, safeName);
      fs.writeFileSync(targetPath, content || '', 'utf8');

      res.json({
        success: true,
        relPath: `langs/${lang}/${cat}/${safeName}`,
        url: `/langs/${lang}/${cat}/${safeName}`
      });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // API: Delete an HTML file from public directory
  const handleDelete = (req: express.Request, res: express.Response) => {
    try {
      const targetParam = (req.body?.relPath || req.body?.url || req.query.path || req.query.url || '') as string;
      const sanitized = targetParam.replace(/^\/+/, '').replace(/\.\./g, '').trim();

      if (!sanitized) {
        return res.status(400).json({ error: 'Percorso file non specificato' });
      }

      // Safeguard against deleting critical app files
      if (
        sanitized.startsWith('assets/') ||
        sanitized === 'index.html' ||
        sanitized === 'files-manifest.json' ||
        sanitized.endsWith('.png') ||
        sanitized.endsWith('.svg') ||
        sanitized.endsWith('.ico') ||
        sanitized.endsWith('.webmanifest')
      ) {
        return res.status(403).json({ error: 'Operazione non consentita per questo file protetto' });
      }

      const fullPath = path.resolve(process.cwd(), 'public', sanitized);
      if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
        return res.status(404).json({ error: `File non trovato: ${sanitized}` });
      }

      fs.unlinkSync(fullPath);

      // Clean empty directory if not top-level langs or public
      const parentDir = path.dirname(fullPath);
      const publicDir = path.resolve(process.cwd(), 'public');
      if (parentDir !== publicDir && parentDir !== path.join(publicDir, 'langs')) {
        try {
          const files = fs.readdirSync(parentDir);
          if (files.length === 0) {
            fs.rmdirSync(parentDir);
          }
        } catch {
          // Ignore directory cleanup error
        }
      }

      res.json({ success: true, message: `File ${sanitized} eliminato con successo` });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  };

  app.post('/api/delete', handleDelete);
  app.delete('/api/files', handleDelete);

  // Serve static files from public
  app.use(express.static(path.resolve(__dirname, 'public'), {
    maxAge: '1h',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  }));

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LinguaHub Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
