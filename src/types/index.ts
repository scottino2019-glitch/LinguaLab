export type CategoryKey = 'tutti' | 'giochi' | 'esercizi' | 'grammatica' | 'vocabolario' | 'letture' | string;

export interface LanguageDef {
  id: string;
  label: string;
  nativeLabel: string;
  flag: string;
  code: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  greeting: string;
}

export interface CategoryDef {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
  cardBg: string;
  cardBorder: string;
  cardHeaderBg: string;
  badgeClass: string;
  tagClass: string;
  actionBtn: string;
  accentBar: string;
}

export interface LanguageFile {
  id: string;
  title: string;
  fileName: string;
  relPath: string;
  url: string;
  language: string;
  category: string;
  description: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzato' | string;
  keywords: string[];
  icon?: string;
  fileSize: number;
  formattedSize: string;
  lastModified: string;
  isCustom?: boolean;
  content?: string;
  favorite?: boolean;
  completed?: boolean;
}

export interface ScanResult {
  files: LanguageFile[];
  scannedAt: string;
  stats: {
    totalFiles: number;
    byLanguage: Record<string, number>;
    byCategory: Record<string, number>;
  };
}
