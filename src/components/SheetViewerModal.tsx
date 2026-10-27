import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  RotateCw,
  ExternalLink,
  Volume2,
  StickyNote,
  CheckCircle,
  Star,
  Copy,
  Check
} from 'lucide-react';
import { LanguageFile } from '../types';
import { getLanguageMeta, getCategoryMeta } from '../constants/languages';

interface SheetViewerModalProps {
  file: LanguageFile | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onToggleCompleted: (id: string) => void;
}

export const SheetViewerModal: React.FC<SheetViewerModalProps> = ({
  file,
  onClose,
  onToggleFavorite,
  onToggleCompleted,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!file) return;

    const savedNotes = localStorage.getItem(`notes_${file.id}`) || '';
    setNotes(savedNotes);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [file, onClose]);

  if (!file) return null;

  const langMeta = getLanguageMeta(file.language);
  const catMeta = getCategoryMeta(file.category);

  const handleNotesChange = (val: string) => {
    setNotes(val);
    localStorage.setItem(`notes_${file.id}`, val);
  };

  const handleReloadIframe = () => {
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = currentSrc;
    }
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(`public/${file.relPath}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `${file.title}. ${file.description}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (langMeta.code && langMeta.code !== 'other') {
      utterance.lang = langMeta.code === 'zh' ? 'zh-CN' : langMeta.code === 'ja' ? 'ja-JP' : langMeta.code === 'ko' ? 'ko-KR' : 'ru-RU';
    }
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const iframeSrc = file.content ? undefined : file.url;
  const iframeSrcDoc = file.content ? file.content : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-3 md:p-6 animate-in fade-in duration-200">
      <div
        className={`w-full h-full bg-[#242c37] border-2 border-[#475569] rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-all ${
          isFullscreen ? 'fixed inset-0 rounded-none border-none' : 'max-w-6xl max-h-[92vh]'
        }`}
      >
        {/* Category Accent Stripe on top */}
        <div className={`h-1.5 w-full shrink-0 ${catMeta.accentBar}`} />

        {/* Top App Bar */}
        <div className="bg-[#2d3542] border-b border-[#475569] px-4 py-3 flex items-center justify-between gap-3 shrink-0">
          {/* File Meta info */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl shrink-0 select-none">{langMeta.flag}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${langMeta.badgeBg}`}>
                  {langMeta.label}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${catMeta.badgeClass}`}>
                  {catMeta.icon} {catMeta.label}
                </span>
                <span className="text-[10px] text-slate-300 font-mono hidden sm:inline">
                  {file.formattedSize}
                </span>
              </div>
              <h2 className="text-sm md:text-base font-extrabold text-white truncate mt-0.5" title={file.title}>
                {file.title}
              </h2>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Audio speech button */}
            <button
              onClick={handleSpeak}
              className={`p-2 rounded-xl border transition ${
                isSpeaking
                  ? 'bg-indigo-600 text-white border-indigo-400 animate-pulse'
                  : 'bg-[#394353] border-[#4e5c70] text-slate-200 hover:text-white hover:bg-[#434f62]'
              }`}
              title={isSpeaking ? 'Ferma sintesi vocale' : 'Ascolta titolo e descrizione'}
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Favorite toggle */}
            <button
              onClick={() => onToggleFavorite(file.id)}
              className={`p-2 rounded-xl border transition ${
                file.favorite
                  ? 'bg-amber-950/80 text-amber-300 border-amber-600/70'
                  : 'bg-[#394353] border-[#4e5c70] text-slate-200 hover:text-amber-400 hover:bg-[#434f62]'
              }`}
              title="Aggiungi o rimuovi dai preferiti"
            >
              <Star className={`w-4 h-4 ${file.favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>

            {/* Completed toggle */}
            <button
              onClick={() => onToggleCompleted(file.id)}
              className={`p-2 rounded-xl border transition ${
                file.completed
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70'
                  : 'bg-[#394353] border-[#4e5c70] text-slate-200 hover:text-emerald-400 hover:bg-[#434f62]'
              }`}
              title="Segna come completato"
            >
              <CheckCircle className={`w-4 h-4 ${file.completed ? 'fill-emerald-400/30 text-emerald-400' : ''}`} />
            </button>

            {/* Notes toggle */}
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`p-2 rounded-xl border transition ${
                showNotes || notes.trim()
                  ? 'bg-purple-950/80 text-purple-300 border-purple-600/70'
                  : 'bg-[#394353] border-[#4e5c70] text-slate-200 hover:text-purple-300 hover:bg-[#434f62]'
              }`}
              title="Appunti personali di studio"
            >
              <StickyNote className="w-4 h-4" />
            </button>

            {/* Reload iframe */}
            <button
              onClick={handleReloadIframe}
              className="p-2 rounded-xl bg-[#394353] hover:bg-[#434f62] border border-[#4e5c70] text-slate-200 hover:text-white transition"
              title="Ricarica foglio"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Open in new window */}
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-[#394353] hover:bg-[#434f62] border border-[#4e5c70] text-slate-200 hover:text-white transition"
              title="Apri a schermo intero in nuova scheda"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-[#394353] hover:bg-[#434f62] border border-[#4e5c70] text-slate-200 hover:text-white transition hidden sm:flex"
              title={isFullscreen ? 'Riduci' : 'Massimizza'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* High-visibility Prominent Close Button */}
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md shadow-rose-950/50 transition active:scale-95 ml-2 shrink-0 cursor-pointer"
              title="Chiudi visualizzatore (Esc)"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              <span>Chiudi</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 bg-[#1e242d] overflow-hidden relative border-t border-b border-[#475569]">
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              srcDoc={iframeSrcDoc}
              title={file.title}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              className="w-full h-full border-none"
            />
          </div>

          {/* Notes Sidebar */}
          {showNotes && (
            <div className="w-80 md:w-96 bg-[#242c37] border-l border-[#475569] flex flex-col p-4 z-20 shrink-0">
              <div className="flex items-center justify-between pb-3 border-b border-[#3b4757] mb-3">
                <div className="flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-purple-400" />
                  <h4 className="text-sm font-bold text-white">Appunti di Studio</h4>
                </div>
                <button
                  onClick={() => setShowNotes(false)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Scrivi qui vocaboli nuovi, dubbi, regole o frasi da ricordare per questo foglio... (Salvataggio automatico locale)"
                className="flex-1 w-full bg-[#2e3745] border border-[#475569] rounded-xl p-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-400 resize-none font-sans"
              />

              <div className="mt-3 text-[11px] text-slate-300 flex justify-between items-center font-medium">
                <span>Salvati sul tuo dispositivo (PWA)</span>
                {notes.trim() && <span className="text-purple-300 font-bold">✓ Salvato</span>}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Sub-bar */}
        <div className="bg-[#2d3542] border-t border-[#475569] px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-200 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-indigo-200 font-bold bg-[#394353] px-2.5 py-1 rounded-lg border border-[#4e5c70]">public/{file.relPath}</span>
            <button
              onClick={handleCopyPath}
              className="px-2.5 py-1 bg-[#394353] hover:bg-[#434f62] border border-[#4e5c70] rounded-lg text-slate-100 transition flex items-center gap-1 text-[11px] font-bold"
              title="Copia percorso file"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiato!' : 'Copia'}</span>
            </button>
          </div>
          <div className="text-slate-300 text-xs flex items-center gap-2">
            <span>Tasti rapidi:</span>
            <kbd className="px-2 py-0.5 bg-[#394353] rounded border border-[#4e5c70] text-slate-100 font-semibold font-mono text-[11px]">Esc</kbd> per chiudere
          </div>
        </div>
      </div>
    </div>
  );
};
