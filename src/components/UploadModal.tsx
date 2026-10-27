import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileCode,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Layers,
  Code
} from 'lucide-react';
import { LANGUAGES, CATEGORIES, getLanguageMeta, getCategoryMeta } from '../constants/languages';
import { parseHtmlMetadata, formatBytes } from '../utils/htmlParser';
import { LanguageFile } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSaved: (file: LanguageFile) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onFileSaved }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('cinese');
  const [customLanguage, setCustomLanguage] = useState('');
  const [category, setCategory] = useState('giochi');
  const [customCategory, setCustomCategory] = useState('');
  const [difficulty, setDifficulty] = useState('Principiante');
  const [keywords, setKeywords] = useState('');
  const [saveMode, setSaveMode] = useState<'public' | 'local'>('public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'template'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    if (!file.name.match(/\.(html|htm)$/i)) {
      setError('Carica un file HTML valido (.html o .htm)');
      return;
    }
    setError(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      setFileContent(text);
      const meta = parseHtmlMetadata(text, file.name);

      setTitle(meta.title || file.name.replace(/\.html?$/i, ''));
      setDescription(meta.description || '');
      if (meta.language) {
        const found = LANGUAGES.find(l => l.id === meta.language);
        if (found) setLanguage(found.id);
        else {
          setLanguage('custom');
          setCustomLanguage(meta.language);
        }
      }
      if (meta.category) {
        const found = CATEGORIES.find(c => c.id === meta.category);
        if (found) setCategory(found.id);
        else {
          setCategory('custom');
          setCustomCategory(meta.category);
        }
      }
      if (meta.difficulty) setDifficulty(meta.difficulty);
      if (meta.keywords.length > 0) setKeywords(meta.keywords.join(', '));
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async () => {
    if (!fileContent.trim()) {
      setError('Nessun contenuto HTML fornito.');
      return;
    }

    setLoading(true);
    setError(null);

    const targetLang = language === 'custom' ? customLanguage.toLowerCase().trim() || 'altre' : language;
    const targetCat = category === 'custom' ? customCategory.toLowerCase().trim() || 'generale' : category;
    const cleanFileName = (selectedFile?.name || `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.html`).replace(/[^a-zA-Z0-9_.-]/g, '_');

    try {
      if (saveMode === 'public') {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: targetLang,
            category: targetCat,
            fileName: cleanFileName,
            content: fileContent,
          }),
        });

        if (!res.ok) {
          throw new Error('Salvataggio su server fallito. Salvataggio locale attivato.');
        }

        const data = await res.json();
        const newFile: LanguageFile = {
          id: `pub_${data.relPath.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
          title: title || cleanFileName,
          fileName: cleanFileName,
          relPath: data.relPath,
          url: data.url,
          language: targetLang,
          category: targetCat,
          description: description || 'Foglio aggiunto di recente',
          difficulty,
          keywords: keywords.split(',').map(s => s.trim()).filter(Boolean),
          fileSize: fileContent.length,
          formattedSize: formatBytes(fileContent.length),
          lastModified: new Date().toISOString(),
          isCustom: false,
        };
        onFileSaved(newFile);
        onClose();
      } else {
        // Save locally
        const newFile: LanguageFile = {
          id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          title: title || cleanFileName,
          fileName: cleanFileName,
          relPath: `custom/${targetLang}/${targetCat}/${cleanFileName}`,
          url: '',
          language: targetLang,
          category: targetCat,
          description: description || 'Foglio salvato localmente',
          difficulty,
          keywords: keywords.split(',').map(s => s.trim()).filter(Boolean),
          fileSize: fileContent.length,
          formattedSize: formatBytes(fileContent.length),
          lastModified: new Date().toISOString(),
          isCustom: true,
          content: fileContent,
        };
        onFileSaved(newFile);
        onClose();
      }
    } catch (err) {
      console.warn('Fallback to local store:', err);
      // Fallback local save
      const newFile: LanguageFile = {
        id: `custom_${Date.now()}`,
        title: title || cleanFileName,
        fileName: cleanFileName,
        relPath: `local/${targetLang}/${targetCat}/${cleanFileName}`,
        url: '',
        language: targetLang,
        category: targetCat,
        description: description || 'Foglio salvato nella cache PWA',
        difficulty,
        keywords: keywords.split(',').map(s => s.trim()).filter(Boolean),
        fileSize: fileContent.length,
        formattedSize: formatBytes(fileContent.length),
        lastModified: new Date().toISOString(),
        isCustom: true,
        content: fileContent,
      };
      onFileSaved(newFile);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (catType: string) => {
    const templates: Record<string, string> = {
      giochi: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Nuovo Gioco Interattivo</title>
  <meta name="description" content="Mini-gioco interattivo per la pratica linguistica.">
  <meta name="language" content="giapponese">
  <meta name="category" content="giochi">
  <meta name="difficulty" content="Principiante">
  <meta name="keywords" content="gioco, quiz, memoria">
  <meta name="icon" content="🎮">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white p-8 flex flex-col items-center">
  <h1 class="text-3xl font-bold mb-4">Quiz Interattivo</h1>
  <button onclick="document.getElementById('msg').textContent='Hai completato il livello!'; document.getElementById('msg').classList.remove('hidden');" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition">Gioca Ora</button>
  <div id="msg" class="hidden mt-4 p-3 bg-emerald-800/80 rounded-xl text-emerald-200 font-bold text-center"></div>
</body>
</html>`,
      esercizi: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Esercizio di Verifica</title>
  <meta name="description" content="Esercizio a scelta multipla con spiegazione immediata.">
  <meta name="language" content="cinese">
  <meta name="category" content="esercizi">
  <meta name="difficulty" content="Intermedio">
  <meta name="keywords" content="esercizi, verifica, grammatica">
  <meta name="icon" content="✏️">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white p-8">
  <h1 class="text-2xl font-bold mb-4">Domanda di Pratica</h1>
  <p class="text-slate-300">Scegli la risposta corretta...</p>
</body>
</html>`,
      grammatica: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Scheda di Grammatica</title>
  <meta name="description" content="Tavola grammaticale e spiegazioni sintattiche.">
  <meta name="language" content="coreano">
  <meta name="category" content="grammatica">
  <meta name="difficulty" content="Intermedio">
  <meta name="keywords" content="grammatica, regole, coniugazione">
  <meta name="icon" content="📖">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white p-8">
  <h1 class="text-2xl font-bold text-indigo-400">Regola Grammaticale</h1>
  <p class="text-slate-300 mt-2">Spiegazione ed esempi d'uso...</p>
</body>
</html>`,
      vocabolario: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Flashcard Vocabolario</title>
  <meta name="description" content="Lista vocaboli con audio e frasi di esempio.">
  <meta name="language" content="russo">
  <meta name="category" content="vocabolario">
  <meta name="difficulty" content="Principiante">
  <meta name="keywords" content="vocabolario, parole, flashcards">
  <meta name="icon" content="🗂️">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white p-8">
  <h1 class="text-2xl font-bold text-amber-400">Nuovi Termini</h1>
  <p class="text-slate-300 mt-2">Elenco e pronunce...</p>
</body>
</html>`,
      letture: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Lettura Graduata con Audio</title>
  <meta name="description" content="Testo graduato con traduzione a fronte.">
  <meta name="language" content="giapponese">
  <meta name="category" content="letture">
  <meta name="difficulty" content="Intermedio">
  <meta name="keywords" content="lettura, storia, testo, comprensione">
  <meta name="icon" content="📜">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white p-8">
  <h1 class="text-2xl font-bold text-cyan-400">Storia da Leggere</h1>
  <p class="text-slate-300 mt-2">Testo in lingua originale...</p>
</body>
</html>`
    };

    const code = templates[catType] || templates.giochi;
    setFileContent(code);
    setSelectedFile(new File([code], `${catType}_template.html`, { type: 'text/html' }));
    const meta = parseHtmlMetadata(code, `${catType}_template.html`);
    setTitle(meta.title);
    setDescription(meta.description);
    setLanguage(meta.language || 'cinese');
    setCategory(meta.category || 'giochi');
    setDifficulty(meta.difficulty || 'Principiante');
    setActiveTab('upload');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#242c37] border-2 border-[#475569] rounded-2xl p-6 shadow-2xl max-h-[90vh] flex flex-col text-slate-200 relative overflow-hidden">
        {/* Accent Stripe */}
        <div className="h-1.5 -mx-6 -mt-6 mb-4 bg-indigo-600 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3b4757] shrink-0">
          <div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-400" />
              Aggiungi Foglio HTML per le Lingue
            </h3>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Carica o incolla un foglio HTML: l'app leggerà automaticamente titolo, metadati e categoria!
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
            <span>Chiudi</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 my-4 shrink-0">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              activeTab === 'upload'
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                : 'bg-[#2e3745] border-[#475569] text-slate-200 hover:bg-[#384353] hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            Carica / Trascina File
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              activeTab === 'template'
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                : 'bg-[#2e3745] border-[#475569] text-slate-200 hover:bg-[#384353] hover:text-white'
            }`}
          >
            <Code className="w-4 h-4" />
            Crea da Modello Pronto
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'template' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 font-medium">
                Seleziona un modello da personalizzare per generare subito un nuovo foglio:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => loadTemplate(cat.id)}
                    className={`p-3 border-2 rounded-xl text-left transition shadow-xs ${cat.cardBg} ${cat.cardBorder} hover:scale-102`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <h4 className="text-sm font-bold text-white mt-1">{cat.label}</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">{cat.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                  dragOver
                    ? 'border-indigo-400 bg-indigo-950/40'
                    : selectedFile
                    ? 'border-emerald-500 bg-emerald-950/40'
                    : 'border-[#363e4f] hover:border-slate-400 bg-[#212630]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,.htm"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mb-2" />
                    <span className="text-sm font-bold text-white">{selectedFile.name}</span>
                    <span className="text-xs text-slate-400 mt-1 font-mono">
                      {formatBytes(selectedFile.size)}
                    </span>
                    <span className="text-xs text-indigo-400 font-bold mt-2 underline">
                      Clicca per sostituire
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm font-bold text-slate-200">
                      Trascina qui il file HTML o clicca per sfogliare
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      Supporta fogli standalone con HTML, CSS e JavaScript
                    </span>
                  </div>
                )}
              </div>

              {/* Form Metadata */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Titolo del Foglio
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Es. Memory dei Caratteri Hanzi"
                    className="w-full bg-[#222731] border border-[#343c4d] rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Language Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Lingua
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-[#222731] border border-[#343c4d] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400 cursor-pointer"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.id} value={l.id} className="bg-[#1a1d24] text-white">
                          {l.flag} {l.label} ({l.nativeLabel})
                        </option>
                      ))}
                      <option value="custom" className="bg-[#1a1d24] text-white">➕ Altra lingua personalizzata...</option>
                    </select>
                    {language === 'custom' && (
                      <input
                        type="text"
                        value={customLanguage}
                        onChange={(e) => setCustomLanguage(e.target.value)}
                        placeholder="Nome lingua (es. arabo, tedesco)"
                        className="mt-2 w-full bg-[#222731] border border-[#343c4d] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
                      />
                    )}
                  </div>

                  {/* Category Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Sottocartella / Categoria
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#222731] border border-[#343c4d] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400 cursor-pointer"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#1a1d24] text-white">
                          {c.icon} {c.label}
                        </option>
                      ))}
                      <option value="custom" className="bg-[#1a1d24] text-white">➕ Nuova categoria personalizzata...</option>
                    </select>
                    {category === 'custom' && (
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Nome cartella (es. podcast, poesie)"
                        className="mt-2 w-full bg-[#222731] border border-[#343c4d] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Livello di Difficoltà
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-[#222731] border border-[#343c4d] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400 cursor-pointer"
                    >
                      <option value="Principiante" className="bg-[#1a1d24] text-white">Principiante (Base / A1-A2)</option>
                      <option value="Intermedio" className="bg-[#1a1d24] text-white">Intermedio (B1-B2)</option>
                      <option value="Avanzato" className="bg-[#1a1d24] text-white">Avanzato (C1-C2)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Tag / Parole Chiave (separate da virgola)
                    </label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="es. hanzi, pinyin, hsk1"
                      className="w-full bg-[#222731] border border-[#343c4d] rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Descrizione
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Breve sommario per la card di presentazione..."
                    className="w-full bg-[#222731] border border-[#343c4d] rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 resize-none transition"
                  />
                </div>

                {/* Storage destination */}
                <div className="p-3 bg-[#21252e] rounded-xl border border-[#333a47] text-xs">
                  <span className="font-bold text-slate-300 block mb-2">Destinazione di Salvataggio:</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium hover:text-white">
                      <input
                        type="radio"
                        name="saveMode"
                        checked={saveMode === 'public'}
                        onChange={() => setSaveMode('public')}
                        className="text-indigo-500 focus:ring-indigo-400"
                      />
                      <span>Cartella <code className="font-mono text-indigo-400 font-bold">public/langs/</code> (Progetto)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium hover:text-white">
                      <input
                        type="radio"
                        name="saveMode"
                        checked={saveMode === 'local'}
                        onChange={() => setSaveMode('local')}
                        className="text-indigo-500 focus:ring-indigo-400"
                      />
                      <span>Browser PWA (Offline Storage)</span>
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-[#2d3340] flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-[#252a36] transition"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !fileContent.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {loading ? (
              <span>Salvataggio in corso...</span>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Salva e Aggiungi Card</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
