import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { LanguageFile } from '../types';
import { getLanguageMeta, getCategoryMeta } from '../constants/languages';

interface ConfirmDeleteModalProps {
  file: LanguageFile | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: LanguageFile) => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  file,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !file) return null;

  const langMeta = getLanguageMeta(file.language);
  const catMeta = getCategoryMeta(file.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#242c37] border-2 border-rose-500/40 rounded-2xl p-6 shadow-2xl text-slate-200 relative overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Rose Top Strip */}
        <div className="h-1.5 -mx-6 -mt-6 mb-4 bg-rose-600 shrink-0" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Elimina Foglio di Studio
              </h3>
              <p className="text-xs text-slate-400">
                Questa azione è definitiva e rimuoverà il file
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#343e4d] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target File Card */}
        <div className="bg-[#1c222b] border border-[#3b4555] rounded-xl p-3.5 mb-5 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span>{langMeta.flag}</span>
            <span className="font-bold text-white">{langMeta.label}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">{catMeta.icon} {catMeta.label}</span>
          </div>

          <h4 className="text-sm font-bold text-white truncate" title={file.title}>
            {file.title}
          </h4>

          <div className="text-[11px] font-mono text-indigo-300 bg-[#161a22] px-2.5 py-1 rounded-lg border border-[#2d3542] truncate">
            {file.isCustom ? `Locale: ${file.relPath}` : `public/${file.relPath}`}
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          {file.isCustom
            ? 'Il foglio verrà eliminato dalla memoria locale del tuo dispositivo.'
            : 'Il file HTML verrà rimosso permanentemente dalla cartella public sul server.'}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#333d4b] hover:bg-[#3d495a] border border-[#475569] text-xs font-bold text-slate-200 transition cursor-pointer"
          >
            Annulla
          </button>
          <button
            onClick={() => onConfirm(file)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-xs font-extrabold text-white shadow-md shadow-rose-950/50 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Elimina Definitivamente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
