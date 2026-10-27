import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  RotateCw,
  ExternalLink,
  Volume2,
  VolumeX,
  StickyNote,
  CheckCircle,
  Star,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  FileCode,
  Sparkles,
  Trash2
} from 'lucide-react';
import { LanguageFile } from '../types';
import { getLanguageMeta, getCategoryMeta } from '../constants/languages';

interface SheetViewerModalProps {
  file: LanguageFile | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onToggleCompleted: (id: string) => void;
  onDelete?: (file: LanguageFile) => void;
}

export const SheetViewerModal: React.FC<SheetViewerModalProps> = ({
  file,
  onClose,
  onToggleFavorite,
  onToggleCompleted,
  onDelete,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fetch or retrieve file content
  const loadContent = useCallback(async (targetFile: LanguageFile) => {
    // 1. If file already has bundled content (e.g. from preloadedFiles or scan with content)
    if (targetFile.content && targetFile.content.trim().length > 0) {
      setHtmlContent(cleanInjectedScripts(targetFile.content));
      setIsLoadingContent(false);
      setLoadError(null);
      return;
    }

    setIsLoadingContent(true);
    setLoadError(null);

    try {
      // 2. Try the dedicated API endpoint
      const apiUrl = `/api/file-content?url=${encodeURIComponent(targetFile.url)}`;
      let res = await fetch(apiUrl, { cache: 'no-store' });

      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 0) {
          setHtmlContent(cleanInjectedScripts(text));
          setIsLoadingContent(false);
          return;
        }
      }

      // 3. Fallback: try fetching direct URL
      res = await fetch(targetFile.url, { cache: 'no-store' });
      if (res.ok) {
        const directText = await res.text();
        if (directText && directText.trim().length > 0) {
          setHtmlContent(cleanInjectedScripts(directText));
          setIsLoadingContent(false);
          return;
        }
      }

      throw new Error(`File non accessibile su ${targetFile.url}`);
    } catch (err) {
      console.error('Error fetching file content:', err);
      setLoadError((err as Error).message || 'Impossibile leggere il contenuto del file.');
      setIsLoadingContent(false);
    }
  }, []);

  // Remove any parent harness scripts like _aistudio-iframe.js injected by reverse proxy
  function cleanInjectedScripts(html: string): string {
    return html.replace(/<script[^>]*src=["'][^"']*_aistudio-iframe\.js[^"']*["'][^>]*><\/script>/gi, '');
  }

  useEffect(() => {
    if (!file) return;

    const savedNotes = localStorage.getItem(`notes_${file.id}`) || '';
    setNotes(savedNotes);
    loadContent(file);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [file, onClose, loadContent]);

  if (!file) return null;

  const langMeta = getLanguageMeta(file.language);
  const catMeta = getCategoryMeta(file.category);

  const handleNotesChange = (val: string) => {
    setNotes(val);
    localStorage.setItem(`notes_${file.id}`, val);
  };

  const handleReloadIframe = () => {
    setIframeKey(k => k + 1);
    if (!file.content) {
      loadContent(file);
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
      utterance.lang =
        langMeta.code === 'zh'
          ? 'zh-CN'
          : langMeta.code === 'ja'
          ? 'ja-JP'
          : langMeta.code === 'ko'
          ? 'ko-KR'
          : 'ru-RU';
    }
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className={`w-full h-full bg-[#1e242d] border border-[#3b4555] rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-all ${
          isFullscreen ? 'fixed inset-0 rounded-none border-none' : 'max-w-6xl max-h-[94vh]'
        }`}
      >
        {/* Category Accent Stripe on top */}
        <div className={`h-1.5 w-full shrink-0 ${catMeta.accentBar}`} />

        {/* =========================================================================
            HEADER TIER 1: File Identity, Status Buttons & High-Visibility Close
            Clean, spacious, zero overlapping at any screen resolution
           ========================================================================= */}
        <header className="bg-[#2a323d] border-b border-[#3b4555] px-4 py-2.5 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* File Meta Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="text-2xl sm:text-3xl shrink-0 select-none drop-shadow-xs">
              {langMeta.flag}
            </span>
            <div className="min-w-0 flex-1">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border ${langMeta.badgeBg}`}>
                  {langMeta.label}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${catMeta.badgeClass}`}>
                  {catMeta.icon} {catMeta.label}
                </span>
                {file.difficulty && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#1e242d] border border-[#3b4555] text-slate-300">
                    {file.difficulty}
                  </span>
                )}
                <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                  {file.formattedSize}
                </span>
              </div>

              {/* Title */}
              <h2
                className="text-sm sm:text-base font-extrabold text-white truncate mt-0.5 tracking-tight"
                title={file.title}
              >
                {file.title}
              </h2>
            </div>
          </div>

          {/* Quick Primary Status Controls & Close Button */}
          <div className="flex items-center justify-end gap-1.5 shrink-0">
            {/* Favorite toggle */}
            <button
              onClick={() => onToggleFavorite(file.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition shadow-xs ${
                file.favorite
                  ? 'bg-amber-950/80 text-amber-300 border-amber-600/80'
                  : 'bg-[#333d4b] border-[#445163] text-slate-300 hover:text-amber-300 hover:bg-[#3b4757]'
              }`}
              title="Aggiungi o rimuovi dai preferiti"
            >
              <Star className={`w-3.5 h-3.5 ${file.favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span className="hidden md:inline">{file.favorite ? 'Preferito' : 'Salva'}</span>
            </button>

            {/* Completed toggle */}
            <button
              onClick={() => onToggleCompleted(file.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition shadow-xs ${
                file.completed
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/80'
                  : 'bg-[#333d4b] border-[#445163] text-slate-300 hover:text-emerald-300 hover:bg-[#3b4757]'
              }`}
              title="Segna come completato"
            >
              <CheckCircle className={`w-3.5 h-3.5 ${file.completed ? 'fill-emerald-400/30 text-emerald-400' : ''}`} />
              <span className="hidden md:inline">{file.completed ? 'Fatto' : 'Completa'}</span>
            </button>

            {/* High-visibility Prominent Close Button */}
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md shadow-rose-950/50 transition active:scale-95 ml-1 shrink-0 cursor-pointer"
              title="Chiudi visualizzatore (Esc)"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              <span>Chiudi</span>
            </button>
          </div>
        </header>

        {/* =========================================================================
            HEADER TIER 2: Secondary Toolbar (Breadcrumbs + Study & Viewer Tools)
            Dedicated row with zero wrapping overlap
           ========================================================================= */}
        <nav className="bg-[#242b35] border-b border-[#3b4555] px-4 py-2 shrink-0 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Breadcrumb Path & Copy */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-indigo-300 font-bold bg-[#1e242d] px-2.5 py-1 rounded-lg border border-[#3b4555] truncate max-w-[240px] sm:max-w-md text-[11px]">
              public/{file.relPath}
            </span>
            <button
              onClick={handleCopyPath}
              className="px-2.5 py-1 bg-[#333d4b] hover:bg-[#3b4757] border border-[#445163] rounded-lg text-slate-200 transition flex items-center gap-1 text-[11px] font-bold shrink-0"
              title="Copia percorso file"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiato' : 'Copia'}</span>
            </button>
          </div>

          {/* Viewer Tools Group */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            {/* Audio speech button */}
            <button
              onClick={handleSpeak}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition ${
                isSpeaking
                  ? 'bg-indigo-600 text-white border-indigo-400 animate-pulse'
                  : 'bg-[#333d4b] border-[#445163] text-slate-200 hover:text-white hover:bg-[#3b4757]'
              }`}
              title={isSpeaking ? 'Ferma sintesi vocale' : 'Ascolta titolo e descrizione con audio TTS'}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isSpeaking ? 'Ferma' : 'Ascolta'}</span>
            </button>

            {/* Notes toggle */}
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition relative ${
                showNotes || notes.trim()
                  ? 'bg-purple-950/80 text-purple-200 border-purple-500/70'
                  : 'bg-[#333d4b] border-[#445163] text-slate-200 hover:text-purple-300 hover:bg-[#3b4757]'
              }`}
              title="Apri appunti personali di studio"
            >
              <StickyNote className="w-3.5 h-3.5" />
              <span>Appunti</span>
              {notes.trim() && (
                <span className="w-2 h-2 rounded-full bg-purple-400 absolute -top-0.5 -right-0.5 ring-2 ring-[#242b35]" />
              )}
            </button>

            {/* Reload iframe */}
            <button
              onClick={handleReloadIframe}
              className="p-1.5 rounded-lg bg-[#333d4b] hover:bg-[#3b4757] border border-[#445163] text-slate-200 hover:text-white transition"
              title="Ricarica foglio HTML"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Open in new window */}
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-[#333d4b] hover:bg-[#3b4757] border border-[#445163] text-slate-200 hover:text-white transition"
              title="Apri a schermo intero in nuova scheda browser"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-[#333d4b] hover:bg-[#3b4757] border border-[#445163] text-slate-200 hover:text-white transition hidden sm:inline-flex"
              title={isFullscreen ? 'Riduci a finestra' : 'Schermo intero'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Delete File button */}
            {onDelete && (
              <button
                onClick={() => onDelete(file)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition bg-[#333d4b] border-[#445163] text-rose-300 hover:text-white hover:bg-rose-600 hover:border-rose-500 cursor-pointer"
                title="Elimina questo foglio"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Elimina</span>
              </button>
            )}
          </div>
        </nav>

        {/* =========================================================================
            CONTENT AREA: Loading State, Error Fallback & Direct HTML srcDoc Iframe
           ========================================================================= */}
        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 bg-[#14181f] overflow-hidden relative flex flex-col">
            {isLoadingContent ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Caricamento del foglio HTML...</h3>
                  <p className="text-xs text-slate-400 font-mono">public/{file.relPath}</p>
                </div>
              </div>
            ) : loadError ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">Impossibile caricare il foglio HTML</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {loadError}
                  </p>
                  <p className="text-xs text-slate-400 font-mono bg-[#1e242d] p-2 rounded-lg border border-[#3b4555]">
                    Percorso atteso: public/{file.relPath}
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => loadContent(file)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                  >
                    Riprova Caricamento
                  </button>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#2a323d] hover:bg-[#333d4b] text-slate-200 border border-[#445163] font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Apri File Diretto</span>
                  </a>
                </div>
              </div>
            ) : (
              <iframe
                key={iframeKey}
                ref={iframeRef}
                srcDoc={htmlContent}
                title={file.title}
                sandbox="allow-scripts allow-forms allow-modals allow-same-origin allow-downloads"
                className="w-full h-full border-none bg-white"
              />
            )}
          </div>

          {/* =========================================================================
              NOTES SIDEBAR (Desktop side panel, Mobile responsive overlay)
             ========================================================================= */}
          {showNotes && (
            <div className="fixed inset-y-0 right-0 z-30 w-full sm:w-96 bg-[#242b35] border-l border-[#3b4555] flex flex-col p-4 shadow-2xl lg:static lg:z-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#3b4555] mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-purple-400" />
                  <h4 className="text-sm font-bold text-white">Appunti di Studio</h4>
                </div>
                <button
                  onClick={() => setShowNotes(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#333d4b] transition"
                  title="Chiudi appunti"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-slate-400 mb-2">
                I tuoi appunti per questo foglio vengono salvati automaticamente nella memoria locale del dispositivo.
              </p>

              <textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Scrivi qui vocaboli nuovi, dubbi, regole o frasi da ricordare per questo foglio..."
                className="flex-1 w-full bg-[#1c222b] border border-[#3b4555] rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400 resize-none font-sans"
              />

              <div className="mt-3 text-[11px] text-slate-400 flex justify-between items-center font-medium shrink-0">
                <span>Disponibili anche offline (PWA)</span>
                {notes.trim() && <span className="text-purple-300 font-bold">✓ Salvato</span>}
              </div>
            </div>
          )}
        </div>

        {/* Quick Footer hint */}
        <div className="bg-[#1e242d] border-t border-[#3b4555] px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span>Foglio HTML interattivo</span>
            <span>•</span>
            <span>Fai clic sui componenti per interagire</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-[#2a323d] rounded border border-[#3b4555] text-slate-200 font-mono text-[10px]">
              Esc
            </kbd>
            <span>per chiudere</span>
          </div>
        </div>
      </div>
    </div>
  );
};
