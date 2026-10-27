import fs from 'fs';
import path from 'path';
import type { LanguageFile, ScanResult } from '../types/index.ts';
import { formatBytes, parseHtmlMetadata } from '../utils/htmlParser.ts';

export function inferLanguageAndCategory(relFromPublic: string, metaLang?: string, metaCat?: string) {
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

export function scanPublicDirectory(rootDir: string = process.cwd()): ScanResult {
  const publicDir = path.resolve(rootDir, 'public');
  const results: LanguageFile[] = [];

  if (!fs.existsSync(publicDir)) {
    return {
      files: [],
      scannedAt: new Date().toISOString(),
      stats: { totalFiles: 0, byLanguage: {}, byCategory: {} }
    };
  }

  function traverse(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && /\.(html|htm)$/i.test(entry.name)) {
        // Skip root index.html if in public
        const relFromPublic = path.relative(publicDir, fullPath).replace(/\\/g, '/');
        if (relFromPublic === 'index.html') continue;

        try {
          const stats = fs.statSync(fullPath);
          const rawContent = fs.readFileSync(fullPath, 'utf8');
          const meta = parseHtmlMetadata(rawContent, entry.name);

          const { finalLang, finalCat } = inferLanguageAndCategory(relFromPublic, meta.language, meta.category);

          const fileObj: LanguageFile = {
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

  // Calculate statistics
  const byLanguage: Record<string, number> = {};
  const byCategory: Record<string, number> = {};

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
