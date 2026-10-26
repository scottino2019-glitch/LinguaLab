import { CategoryDef, LanguageDef } from '../types';

export const LANGUAGES: LanguageDef[] = [
  {
    id: 'cinese',
    label: 'Cinese',
    nativeLabel: '中文',
    flag: '🇨🇳',
    code: 'zh',
    accentColor: '#f59e0b',
    badgeBg: 'bg-[#3b2910] border-[#6b4716] text-[#fde68a]',
    badgeText: 'text-[#fde68a]',
    greeting: '你好 (Nǐ hǎo)'
  },
  {
    id: 'giapponese',
    label: 'Giapponese',
    nativeLabel: '日本語',
    flag: '🇯🇵',
    code: 'ja',
    accentColor: '#f43f5e',
    badgeBg: 'bg-[#3b1722] border-[#6b283b] text-[#fecdd3]',
    badgeText: 'text-[#fecdd3]',
    greeting: 'こんにちは (Konnichiwa)'
  },
  {
    id: 'coreano',
    label: 'Coreano',
    nativeLabel: '한국어',
    flag: '🇰🇷',
    code: 'ko',
    accentColor: '#06b6d4',
    badgeBg: 'bg-[#122e38] border-[#1d4c5c] text-[#a5f3fc]',
    badgeText: 'text-[#a5f3fc]',
    greeting: '안녕하세요 (Annyeonghaseyo)'
  },
  {
    id: 'russo',
    label: 'Russo',
    nativeLabel: 'Русский',
    flag: '🇷🇺',
    code: 'ru',
    accentColor: '#38bdf8',
    badgeBg: 'bg-[#152e42] border-[#204a69] text-[#bae6fd]',
    badgeText: 'text-[#bae6fd]',
    greeting: 'Здравствуйте (Zdravstvuyte)'
  },
  {
    id: 'altre',
    label: 'Altre Lingue',
    nativeLabel: 'Altre',
    flag: '🌐',
    code: 'other',
    accentColor: '#10b981',
    badgeBg: 'bg-[#133325] border-[#1f533c] text-[#a7f3d0]',
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
    cardBg: 'bg-[#132c23] hover:bg-[#16342a]',
    cardBorder: 'border-2 border-[#10b981] hover:border-[#34d399]',
    cardHeaderBg: 'bg-[#193a2e] text-[#6ee7b7] border-b border-[#245342]',
    badgeClass: 'bg-[#059669] text-white border-transparent',
    tagClass: 'bg-[#193a2e] text-[#a7f3d0] border border-[#245342]',
    actionBtn: 'bg-[#059669] hover:bg-[#047857] text-white',
    accentBar: 'bg-[#10b981]'
  },
  {
    id: 'esercizi',
    label: 'Esercizi',
    icon: '✏️',
    description: 'Test grammaticali, particelle, declinazioni e verifica rapida.',
    color: 'blue',
    cardBg: 'bg-[#13283c] hover:bg-[#163048]',
    cardBorder: 'border-2 border-[#0ea5e9] hover:border-[#38bdf8]',
    cardHeaderBg: 'bg-[#1a3551] text-[#7dd3fc] border-b border-[#254a70]',
    badgeClass: 'bg-[#0284c7] text-white border-transparent',
    tagClass: 'bg-[#1a3551] text-[#bae6fd] border border-[#254a70]',
    actionBtn: 'bg-[#0284c7] hover:bg-[#0369a1] text-white',
    accentBar: 'bg-[#0ea5e9]'
  },
  {
    id: 'grammatica',
    label: 'Grammatica',
    icon: '📖',
    description: 'Regole sintattiche, coniugazioni verbali, particelle e formule.',
    color: 'purple',
    cardBg: 'bg-[#26173a] hover:bg-[#2e1c46]',
    cardBorder: 'border-2 border-[#a855f7] hover:border-[#c084fc]',
    cardHeaderBg: 'bg-[#341f4e] text-[#d8b4fe] border-b border-[#492d6e]',
    badgeClass: 'bg-[#7e22ce] text-white border-transparent',
    tagClass: 'bg-[#341f4e] text-[#e9d5ff] border border-[#492d6e]',
    actionBtn: 'bg-[#7e22ce] hover:bg-[#6b21a8] text-white',
    accentBar: 'bg-[#a855f7]'
  },
  {
    id: 'vocabolario',
    label: 'Vocabolario',
    icon: '🗂️',
    description: 'Flashcard tematiche, liste parole frequenti e termini utili con audio.',
    color: 'amber',
    cardBg: 'bg-[#33210b] hover:bg-[#3d280d]',
    cardBorder: 'border-2 border-[#f59e0b] hover:border-[#fbbf24]',
    cardHeaderBg: 'bg-[#452e10] text-[#fcd34d] border-b border-[#5e3f16]',
    badgeClass: 'bg-[#d97706] text-white border-transparent',
    tagClass: 'bg-[#452e10] text-[#fde68a] border border-[#5e3f16]',
    actionBtn: 'bg-[#d97706] hover:bg-[#b45309] text-white',
    accentBar: 'bg-[#f59e0b]'
  },
  {
    id: 'letture',
    label: 'Letture',
    icon: '📜',
    description: 'Brani graduati con trascrizione fonetica, traduzione a fronte e audio.',
    color: 'rose',
    cardBg: 'bg-[#33141d] hover:bg-[#3e1923]',
    cardBorder: 'border-2 border-[#f43f5e] hover:border-[#fb7185]',
    cardHeaderBg: 'bg-[#461a28] text-[#fda4af] border-b border-[#602538]',
    badgeClass: 'bg-[#e11d48] text-white border-transparent',
    tagClass: 'bg-[#461a28] text-[#fecdd3] border border-[#602538]',
    actionBtn: 'bg-[#e11d48] hover:bg-[#be123c] text-white',
    accentBar: 'bg-[#f43f5e]'
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
    accentColor: '#6366f1',
    badgeBg: 'bg-[#1f242d] border-[#373e4b] text-[#cbd5e1]',
    badgeText: 'text-[#cbd5e1]',
    greeting: 'Benvenuto'
  };
}

export function getCategoryMeta(catId: string): CategoryDef {
  const norm = (catId || '').toLowerCase().trim();
  const found = CATEGORIES.find(c => c.id === norm || c.label.toLowerCase() === norm);
  if (found) return found;

  return {
    id: norm || 'generale',
    label: catId ? catId.charAt(0).toUpperCase() + catId.slice(1) : 'Generale',
    icon: '📁',
    description: 'Fogli e risorse per lo studio',
    color: 'slate',
    cardBg: 'bg-[#1f242d] hover:bg-[#282e39]',
    cardBorder: 'border-2 border-[#475569] hover:border-[#64748b]',
    cardHeaderBg: 'bg-[#29303d] text-[#cbd5e1] border-b border-[#3b4455]',
    badgeClass: 'bg-[#475569] text-white border-transparent',
    tagClass: 'bg-[#29303d] text-[#cbd5e1] border border-[#3b4455]',
    actionBtn: 'bg-[#475569] hover:bg-[#334155] text-white',
    accentBar: 'bg-[#64748b]'
  };
}
