import React from 'react';
import { X, FileCode, ExternalLink } from 'lucide-react';
import { LanguageFile } from '../types';
import { getLanguageMeta, getCategoryMeta } from '../constants/languages';

interface FileInspectorModalProps {
  file: LanguageFile | null;
  onClose: () => void;
  onOpen: (file: LanguageFile) => void;
}

export const FileInspectorModal: React.FC<FileInspectorModalProps> = ({ file, onClose, onOpen }) => {
  if (!file) return null;

  const langMeta = getLanguageMeta(file.language);
  const catMeta = getCategoryMeta(file.category);

  const [copied, setCopied] = React.useState(false);

  const copyPath = () => {
    navigator.clipboard.writeText(`public/${file.relPath}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#242c37] border-2 border-[#475569] rounded-2xl p-6 shadow-2xl text-slate-200 relative overflow-hidden">
        {/* Category Accent Stripe */}
        <div className={`h-1.5 -mx-6 -mt-6 mb-4 ${catMeta.accentBar}`} />

        <div className="flex items-center justify-between pb-3 border-b border-[#3b4757] mb-4">
          <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-sm">
            <FileCode className="w-4 h-4" />
            <span>Dettagli File HTML</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
            <span>Chiudi</span>
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-slate-300 font-semibold block mb-1">Titolo Riconosciuto:</span>
            <div className="text-sm font-bold text-white bg-[#2e3745] p-2.5 rounded-xl border border-[#475569]">
              {file.title}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#2e3745] p-2.5 rounded-xl border border-[#475569]">
              <span className="text-slate-300 font-semibold block mb-1">Lingua / Riconoscimento</span>
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>{langMeta.flag}</span>
                <span>{langMeta.label}</span>
              </span>
            </div>
            <div className="bg-[#222731] p-2.5 rounded-xl border border-[#343c4d]">
              <span className="text-slate-400 font-semibold block mb-1">Sottocartella / Categoria</span>
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>{catMeta.icon}</span>
                <span>{catMeta.label}</span>
              </span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block mb-1">Posizione su Disco:</span>
            <div className="flex items-center justify-between bg-[#222731] p-2.5 rounded-xl border border-[#343c4d] font-mono text-[11px] text-slate-200">
              <span className="truncate mr-2 font-bold text-indigo-300">public/{file.relPath}</span>
              <button onClick={copyPath} className="px-2 py-1 bg-[#2b323f] hover:bg-[#343c4c] border border-[#3d475a] rounded text-[10px] text-indigo-300 font-bold shrink-0 shadow-xs">
                {copied ? '✓ Copiato!' : 'Copia'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#222731] p-2.5 rounded-xl border border-[#343c4d]">
              <span className="text-slate-400 font-semibold block mb-1">Dimensione File</span>
              <span className="font-mono text-white font-bold">{file.formattedSize}</span>
            </div>
            <div className="bg-[#222731] p-2.5 rounded-xl border border-[#343c4d]">
              <span className="text-slate-400 font-semibold block mb-1">Difficoltà</span>
              <span className="text-emerald-400 font-bold">{file.difficulty}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block mb-1">Descrizione:</span>
            <div className="bg-[#222731] p-2.5 rounded-xl border border-[#343c4d] text-slate-300 leading-relaxed font-normal">
              {file.description}
            </div>
          </div>

          {file.keywords && file.keywords.length > 0 && (
            <div>
              <span className="text-slate-400 font-semibold block mb-1">Parole Chiave:</span>
              <div className="flex flex-wrap gap-1">
                {file.keywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-[#2b323f] text-slate-200 font-mono text-[10px] font-medium border border-[#3c4658]">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-[#2d3340] flex justify-between gap-2">
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-[#242933] hover:bg-[#2c333f] border border-[#384050] text-xs text-slate-200 font-bold flex items-center gap-1.5 shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Nuova Scheda</span>
          </a>
          <button
            onClick={() => {
              onClose();
              onOpen(file);
            }}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xs"
          >
            Apri nel Visualizzatore
          </button>
        </div>
      </div>
    </div>
  );
};
