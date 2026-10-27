import { CategoryDef, LanguageDef } from '../types';

export const LANGUAGES: LanguageDef[] = [
  {
    id: 'cinese',
    label: 'Cinese',
    nativeLabel: '中文',
    flag: '🇨🇳',
    code: 'zh',
    accentColor: '#d97706',
    badgeBg: 'bg-[#403525] border-[#574833] text-[#fde68a]',
    badgeText: 'text-[#fde68a]',
    greeting: '你好 (Nǐ hǎo)'
  },
  {
    id: 'giapponese',
    label: 'Giapponese',
    nativeLabel: '日本語',
    flag: '🇯🇵',
    code: 'ja',
    accentColor: '#e11d48',
    badgeBg: 'bg-[#422e35] border-[#5c3e49] text-[#fecdd3]',
    badgeText: 'text-[#fecdd3]',
    greeting: 'こんにちは (Konnichiwa)'
  },
  {
    id: 'coreano',
    label: 'Coreano',
    nativeLabel: '한국어',
    flag: '🇰🇷',
    code: 'ko',
    accentColor: '#0891b2',
    badgeBg: 'bg-[#283842] border-[#384f5d] text-[#a5f3fc]',
    badgeText: 'text-[#a5f3fc]',
    greeting: '안녕하세요 (Annyeonghaseyo)'
  },
  {
    id: 'russo',
    label: 'Russo',
    nativeLabel: 'Русский',
    flag: '🇷🇺',
    code: 'ru',
    accentColor: '#2563eb',
    badgeBg: 'bg-[#283445] border-[#394a63] text-[#bae6fd]',
    badgeText: 'text-[#bae6fd]',
    greeting: 'Здравствуйте (Zdravstvuyte)'
  },
  {
    id: 'altre',
    label: 'Altre Lingue',
    nativeLabel: 'Altre',
    flag: '🌐',
    code: 'other',
    accentColor: '#059669',
    badgeBg: 'bg-[#293830] border-[#3b4f44] text-[#a7f3d0]',
    badgeText: 'text-[#a7f3d0]',
    greeting: 'Hello / Bonjour / Hola'
  }
];

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'giochi',
    label: 'Giochi',
    icon: '🎮',
    description: 'Quiz interattivi, sfide a tempo e memory per allenarsi giocando.',
    color: 'emerald',
    cardBg: 'bg-[#28362f] hover:bg-[#2f4037]',
    cardBorder: 'border border-[#3c5146]',
    cardHeaderBg: 'bg-[#32443a] text-[#a7f3d0] border-b border-[#3c5146]',
    badgeClass: 'bg-[#203429] text-[#86efac] border border-[#334e3f]',
    tagClass: 'bg-[#1e2f26] text-[#86efac] border border-[#2f4639]',
    actionBtn: 'bg-[#059669] hover:bg-[#047857] text-white',
    accentBar: 'bg-[#059669]'
  },
  {
    id: 'esercizi',
    label: 'Esercizi',
    icon: '✏️',
    description: 'Test grammaticali, particelle, declinazioni e verifica rapida.',
    color: 'blue',
    cardBg: 'bg-[#263342] hover:bg-[#2d3c4e]',
    cardBorder: 'border border-[#384b61]',
    cardHeaderBg: 'bg-[#2f3f52] text-[#bae6fd] border-b border-[#384b61]',
    badgeClass: 'bg-[#1d2d3e] text-[#7dd3fc] border border-[#2f445c]',
    tagClass: 'bg-[#1b2938] text-[#7dd3fc] border border-[#2b3d52]',
    actionBtn: 'bg-[#0284c7] hover:bg-[#0369a1] text-white',
    accentBar: 'bg-[#0284c7]'
  },
  {
    id: 'grammatica',
    label: 'Grammatica',
    icon: '📖',
    description: 'Regole sintattiche, coniugazioni verbali, particelle e formule.',
    color: 'purple',
    cardBg: 'bg-[#33283c] hover:bg-[#3d3047]',
    cardBorder: 'border border-[#4a3b57]',
    cardHeaderBg: 'bg-[#3d3048] text-[#e9d5ff] border-b border-[#4a3b57]',
    badgeClass: 'bg-[#2b1f33] text-[#d8b4fe] border border-[#402f4d]',
    tagClass: 'bg-[#261c2e] text-[#d8b4fe] border border-[#3a2a46]',
    actionBtn: 'bg-[#7e22ce] hover:bg-[#6b21a8] text-white',
    accentBar: 'bg-[#7e22ce]'
  },
  {
    id: 'vocabolario',
    label: 'Vocabolario',
    icon: '🗂️',
    description: 'Flashcard tematiche, liste parole frequenti e termini utili con audio.',
    color: 'amber',
    cardBg: 'bg-[#372e22] hover:bg-[#413729]',
    cardBorder: 'border border-[#4e4231]',
    cardHeaderBg: 'bg-[#423729] text-[#fde68a] border-b border-[#4e4231]',
    badgeClass: 'bg-[#2e261b] text-[#fcd34d] border border-[#453725]',
    tagClass: 'bg-[#282015] text-[#fcd34d] border border-[#3d3120]',
    actionBtn: 'bg-[#d97706] hover:bg-[#b45309] text-white',
    accentBar: 'bg-[#d97706]'
  },
  {
    id: 'letture',
    label: 'Letture',
    icon: '📜',
    description: 'Brani graduati con trascrizione fonetica, traduzione a fronte e audio.',
    color: 'rose',
    cardBg: 'bg-[#37262c] hover:bg-[#412e35]',
    cardBorder: 'border border-[#513841]',
    cardHeaderBg: 'bg-[#412d34] text-[#fecdd3] border-b border-[#513841]',
    badgeClass: 'bg-[#2d1d23] text-[#fda4af] border border-[#462b35]',
    tagClass: 'bg-[#27181e] text-[#fda4af] border border-[#3e242f]',
    actionBtn: 'bg-[#e11d48] hover:bg-[#be123c] text-white',
    accentBar: 'bg-[#e11d48]'
  }
];

export function getLanguageMeta(langId: string): LanguageDef {
  const norm = (langId || '').toLowerCase().trim();
  const found = LANGUAGES.find(l => l.id === norm || l.label.toLowerCase() === norm);
  if (found) return found;

  return {
    id: norm || 'altre',
    label: langId ? langId.charAt(0).toUpperCase() + langId.slice(1) : 'Altra Lingua',
    nativeLabel: 'Lingua',
    flag: '🌐',
    code: 'other',
    accentColor: '#4f46e5',
    badgeBg: 'bg-[#333b47] border-[#475263] text-[#e2e8f0]',
    badgeText: 'text-[#e2e8f0]',
    greeting: 'Benvenuto'
  };
}

export function getCategoryMeta(catId: string): CategoryDef {
  const norm = (catId || '').toLowerCase().trim();
  const found = CATEGORIES.find(c => c.id === norm || c.label.toLowerCase() === norm);
  if (found) return found;

  // Smart icons based on custom category keyword
  let icon = '📁';
  if (/cultur|storia|tradizion/i.test(norm)) icon = '🏛️';
  else if (/music|canzon|audio|sound/i.test(norm)) icon = '🎵';
  else if (/ascolt|listening|podcast/i.test(norm)) icon = '🎧';
  else if (/dialog|conversazion|chat/i.test(norm)) icon = '💬';
  else if (/quiz|test|sfida/i.test(norm)) icon = '🎯';
  else if (/fras|espression/i.test(norm)) icon = '🗣️';
  else if (/kanji|hanzi|scrittur|caratter/i.test(norm)) icon = '🖌️';
  else if (/verb|coniugaz/i.test(norm)) icon = '⚡';
  else if (/vide|film|cinema/i.test(norm)) icon = '🎬';

  return {
    id: norm || 'generale',
    label: catId ? catId.charAt(0).toUpperCase() + catId.slice(1) : 'Generale',
    icon,
    description: 'Fogli e risorse per lo studio',
    color: 'slate',
    cardBg: 'bg-[#2d3542] hover:bg-[#343e4d]',
    cardBorder: 'border border-[#424e60]',
    cardHeaderBg: 'bg-[#364151] text-[#e2e8f0] border-b border-[#424e60]',
    badgeClass: 'bg-[#242b36] text-[#cbd5e1] border border-[#3b4757]',
    tagClass: 'bg-[#222833] text-[#cbd5e1] border border-[#35404f]',
    actionBtn: 'bg-[#4f46e5] hover:bg-[#4338ca] text-white',
    accentBar: 'bg-[#6366f1]'
  };
}
