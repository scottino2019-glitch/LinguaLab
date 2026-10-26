export interface ParsedHtmlMeta {
  title: string;
  description: string;
  language?: string;
  category?: string;
  difficulty?: string;
  keywords: string[];
  icon?: string;
  author?: string;
}

export function parseHtmlMetadata(html: string, fallbackName: string): ParsedHtmlMeta {
  let title = fallbackName.replace(/\.html?$/i, '').replace(/[_-]/g, ' ');
  let description = 'Foglio di studio per la pratica linguistica.';
  let language: string | undefined;
  let category: string | undefined;
  let difficulty = 'Principiante';
  let keywords: string[] = [];
  let icon: string | undefined;
  let author: string | undefined;

  // Browser environment using DOMParser
  if (typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const docTitle = doc.querySelector('title')?.textContent?.trim();
      if (docTitle) title = docTitle;
      else {
        const h1 = doc.querySelector('h1')?.textContent?.trim();
        if (h1) title = h1;
      }

      const descMeta = doc.querySelector('meta[name="description"]')?.getAttribute('content');
      if (descMeta) description = descMeta.trim();

      const langMeta = doc.querySelector('meta[name="language"]')?.getAttribute('content') ||
                       doc.querySelector('meta[name="lang"]')?.getAttribute('content') ||
                       doc.documentElement.getAttribute('lang');
      if (langMeta) language = langMeta.toLowerCase().trim();

      const catMeta = doc.querySelector('meta[name="category"]')?.getAttribute('content');
      if (catMeta) category = catMeta.toLowerCase().trim();

      const diffMeta = doc.querySelector('meta[name="difficulty"]')?.getAttribute('content');
      if (diffMeta) difficulty = diffMeta.trim();

      const kwMeta = doc.querySelector('meta[name="keywords"]')?.getAttribute('content');
      if (kwMeta) {
        keywords = kwMeta.split(',').map(s => s.trim()).filter(Boolean);
      }

      const iconMeta = doc.querySelector('meta[name="icon"]')?.getAttribute('content');
      if (iconMeta) icon = iconMeta.trim();

      const authorMeta = doc.querySelector('meta[name="author"]')?.getAttribute('content');
      if (authorMeta) author = authorMeta.trim();

      return { title, description, language, category, difficulty, keywords, icon, author };
    } catch {
      // Fallback to regex below
    }
  }

  // Regex fallback (works in node and browser)
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
  }

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
  if (descMatch && descMatch[1]) {
    description = descMatch[1].trim();
  }

  const langMatch = html.match(/<meta[^>]*name=["'](?:language|lang)["'][^>]*content=["'](.*?)["']/i) ||
                    html.match(/<html[^>]*lang=["'](.*?)["']/i);
  if (langMatch && langMatch[1]) {
    language = langMatch[1].toLowerCase().trim();
  }

  const catMatch = html.match(/<meta[^>]*name=["']category["'][^>]*content=["'](.*?)["']/i);
  if (catMatch && catMatch[1]) {
    category = catMatch[1].toLowerCase().trim();
  }

  const diffMatch = html.match(/<meta[^>]*name=["']difficulty["'][^>]*content=["'](.*?)["']/i);
  if (diffMatch && diffMatch[1]) {
    difficulty = diffMatch[1].trim();
  }

  const kwMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["'](.*?)["']/i);
  if (kwMatch && kwMatch[1]) {
    keywords = kwMatch[1].split(',').map(s => s.trim()).filter(Boolean);
  }

  const iconMatch = html.match(/<meta[^>]*name=["']icon["'][^>]*content=["'](.*?)["']/i);
  if (iconMatch && iconMatch[1]) {
    icon = iconMatch[1].trim();
  }

  return { title, description, language, category, difficulty, keywords, icon, author };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
