import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const publicDir = path.resolve(rootDir, 'public');
const manifestPath = path.resolve(publicDir, 'files-manifest.json');
const tsExportPath = path.resolve(rootDir, 'src', 'constants', 'preloadedFiles.ts');

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function parseHtmlMetadata(html, fallbackName) {
  const getTagContent = (tagName) => {
    const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
    return match ? match[1].trim() : '';
  };

  const getMetaAttr = (name) => {
    const m = html.match(new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["'](.*?)["']`, 'i')) ||
              html.match(new RegExp(`<meta\\s+content=["'](.*?)["']\\s+name=["']${name}["']`, 'i'));
    return m ? m[1].trim() : '';
  };

  const rawTitle = getTagContent('title') || fallbackName.replace(/\.html?$/i, '');
  const description = getMetaAttr('description') || 'Foglio interattivo per la pratica linguistica.';
  const language = getMetaAttr('language') || '';
  const category = getMetaAttr('category') || '';
  const difficulty = getMetaAttr('difficulty') || 'Principiante';
  const icon = getMetaAttr('icon') || '';
  const keywordsRaw = getMetaAttr('keywords') || '';
  const keywords = keywordsRaw
    ? keywordsRaw.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return { title: rawTitle, description, language, category, difficulty, icon, keywords };
}

function inferLanguageAndCategory(relFromPublic, metaLang, metaCat) {
  const parts = relFromPublic.split('/').filter(Boolean);
  const dirs = parts.slice(0, -1);
  let folderLang = 'altre';
  let folderCat = 'generale';

  if (dirs.length > 0 && dirs[0].toLowerCase() === 'langs') {
    if (dirs.length >= 3) {
      folderLang = dirs[1].toLowerCase();
      folderCat = dirs[2].toLowerCase();
    } else if (dirs.length === 2) {
      folderLang = dirs[1].toLowerCase();
      folderCat = 'generale';
    }
  } else if (dirs.length >= 2) {
    folderLang = dirs[0].toLowerCase();
    folderCat = dirs[1].toLowerCase();
  } else if (dirs.length === 1) {
    const singleDir = dirs[0].toLowerCase();
    const knownCategories = ['giochi', 'grammatica', 'esercizi', 'vocabolario', 'letture', 'quiz'];
    if (knownCategories.includes(singleDir)) {
      folderLang = 'altre';
      folderCat = singleDir;
    } else {
      folderLang = singleDir;
      folderCat = 'generale';
    }
  }

  const finalLang = (metaLang && metaLang.trim()) ? metaLang.toLowerCase().trim() : folderLang;
  let finalCat = (metaCat && metaCat.trim()) ? metaCat.toLowerCase().trim() : folderCat;
  finalCat = finalCat.replace(/\.html?$/i, '').trim() || 'generale';

  return { finalLang, finalCat };
}

function scanPublic() {
  const results = [];
  if (!fs.existsSync(publicDir)) {
    return { files: [], scannedAt: new Date().toISOString(), stats: { totalFiles: 0, byLanguage: {}, byCategory: {} } };
  }

  function traverse(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && /\.(html|htm)$/i.test(entry.name)) {
        const relFromPublic = path.relative(publicDir, fullPath).replace(/\\/g, '/');
        if (relFromPublic === 'index.html') continue;

        try {
          const stats = fs.statSync(fullPath);
          const rawContent = fs.readFileSync(fullPath, 'utf8');
          const meta = parseHtmlMetadata(rawContent, entry.name);

          const { finalLang, finalCat } = inferLanguageAndCategory(relFromPublic, meta.language, meta.category);

          const fileObj = {
            id: `pub_${relFromPublic.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
            title: meta.title,
            fileName: entry.name,
            relPath: relFromPublic,
            url: `/${relFromPublic}`,
            language: finalLang,
            category: finalCat,
            description: meta.description,
            difficulty: meta.difficulty || 'Principiante',
            keywords: meta.keywords.length > 0 ? meta.keywords : [finalLang, finalCat],
            icon: meta.icon,
            fileSize: stats.size,
            formattedSize: formatBytes(stats.size),
            lastModified: stats.mtime.toISOString(),
            isCustom: false,
            content: rawContent
          };

          results.push(fileObj);
        } catch (err) {
          console.error(`Error reading ${fullPath}:`, err);
        }
      }
    }
  }

  traverse(publicDir);

  const byLanguage = {};
  const byCategory = {};
  results.forEach(f => {
    byLanguage[f.language] = (byLanguage[f.language] || 0) + 1;
    byCategory[f.category] = (byCategory[f.category] || 0) + 1;
  });

  return {
    files: results,
    scannedAt: new Date().toISOString(),
    stats: {
      totalFiles: results.length,
      byLanguage,
      byCategory
    }
  };
}

const manifest = scanPublic();

// Write JSON manifest to public/files-manifest.json
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log(`Generated ${manifestPath} with ${manifest.files.length} files.`);

// Write TypeScript constants file to src/constants/preloadedFiles.ts
const tsContent = `// Auto-generated by scripts/generate-manifest.js
// Provides static fallback so the app works instantly on Vercel, Netlify, and offline
import { LanguageFile } from '../types';

export const PRELOADED_FILES: LanguageFile[] = ${JSON.stringify(manifest.files, null, 2)};
`;

fs.writeFileSync(tsExportPath, tsContent, 'utf8');
console.log(`Generated ${tsExportPath} with ${manifest.files.length} preloaded files.`);
