import React from 'react';
import { ExternalLink, Star, CheckCircle, FileCode, Play, Download } from 'lucide-react';
import { LanguageFile } from '../types';
import { getLanguageMeta, getCategoryMeta } from '../constants/languages';

interface LanguageCardProps {
  file: LanguageFile;
  onOpen: (file: LanguageFile) => void;
  onToggleFavorite: (id: string) => void;
  onToggleCompleted: (id: string) => void;
  onInspect: (file: LanguageFile) => void;
}

export const LanguageCard: React.FC<LanguageCardProps> = ({
  file,
  onOpen,
  onToggleFavorite,
  onToggleCompleted,
  onInspect,
}) => {
  const langMeta = getLanguageMeta(file.language);
  const catMeta = getCategoryMeta(file.category);

  const getDifficultyBadge = (diff?: string) => {
    switch (diff?.toLowerCase()) {
      case 'avanzato':
        return 'bg-red-950/80 text-red-300 border border-red-700/60';
      case 'intermedio':
        return 'bg-amber-950/80 text-amber-300 border border-amber-700/60';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60';
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (file.content) {
      const blob = new Blob([file.content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.fileName;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.fileName;
      a.click();
    }
  };

  return (
    <div
      onClick={() => onOpen(file)}
      className={`group relative rounded-2xl transition-all duration-200 shadow-md hover:shadow-xl flex flex-col justify-between cursor-pointer overflow-hidden ${catMeta.cardBg} ${catMeta.cardBorder}`}
    >
      {/* Category Header Strip: solid distinct category bar */}
      <div className={`px-4 py-2.5 flex items-center justify-between gap-2 ${catMeta.cardHeaderBg}`}>
        <div className="flex items-center gap-2">
          <span className="text-base select-none">{catMeta.icon}</span>
          <span className="text-xs font-black uppercase tracking-wider font-sans">
            {catMeta.label}
          </span>
          <span className="opacity-40">•</span>
          {/* Language Flag and Name */}
          <span className="inline-flex items-center gap-1 text-xs font-bold">
            <span>{langMeta.flag}</span>
            <span>{langMeta.label}</span>
          </span>
        </div>

        {/* Favorite & Completed */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onToggleFavorite(file.id)}
            className={`p-1.5 rounded-lg transition ${
              file.favorite
                ? 'text-amber-400 bg-amber-400/20'
                : 'text-slate-400 hover:text-amber-400 hover:bg-black/20'
            }`}
            title={file.favorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
          >
            <Star className={`w-4 h-4 ${file.favorite ? 'fill-amber-400' : ''}`} />
          </button>
          <button
            onClick={() => onToggleCompleted(file.id)}
            className={`p-1.5 rounded-lg transition ${
              file.completed
                ? 'text-emerald-400 bg-emerald-400/20'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-black/20'
            }`}
            title={file.completed ? 'Contrassegna come da completare' : 'Contrassegna come completato'}
          >
            <CheckCircle className={`w-4 h-4 ${file.completed ? 'fill-emerald-400/30' : ''}`} />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="text-base font-black text-white group-hover:text-amber-200 transition-colors line-clamp-2 leading-snug flex items-start gap-1.5">
            {file.icon && <span className="text-lg leading-none shrink-0">{file.icon}</span>}
            <span>{file.title}</span>
          </h3>

          {/* Description: soft, clear, highly legible text */}
          <p className="text-xs text-slate-200/90 mt-2 line-clamp-2 leading-relaxed font-normal">
            {file.description || 'Foglio HTML pronto per la consultazione e la pratica.'}
          </p>

          {/* Tags */}
          {file.keywords && file.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {file.keywords.slice(0, 3).map((kw, i) => (
                <span
                  key={i}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold ${catMeta.tagClass}`}
                >
                  #{kw}
                </span>
              ))}
              {file.keywords.length > 3 && (
                <span className="text-[10px] text-slate-400 self-center">
                  +{file.keywords.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer info & actions */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${getDifficultyBadge(
                file.difficulty
              )}`}
            >
              {file.difficulty || 'Principiante'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">{file.formattedSize}</span>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onInspect(file)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-black/20 transition"
              title="Dettagli e percorso"
            >
              <FileCode className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-black/20 transition"
              title="Scarica file HTML"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-black/20 transition"
              title="Apri in nuova scheda"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => onOpen(file)}
              className={`flex items-center gap-1 ml-1 px-3 py-1 rounded-lg font-bold text-xs shadow-sm transition active:scale-95 ${catMeta.actionBtn}`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Apri</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
