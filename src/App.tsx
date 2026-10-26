/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FolderPlus,
  RefreshCw,
  Search,
  FolderTree,
  LayoutGrid,
  List,
  Sparkles,
  Star,
  CheckCircle,
  Layers,
  Globe
} from 'lucide-react';

import { LanguageFile, ScanResult } from './types';
import { LANGUAGES, CATEGORIES, getLanguageMeta, getCategoryMeta } from './constants/languages';
import { LanguageCard } from './components/LanguageCard';
import { SheetViewerModal } from './components/SheetViewerModal';
import { UploadModal } from './components/UploadModal';
import { PublicFolderGuideModal } from './components/PublicFolderGuideModal';
import { FileInspectorModal } from './components/FileInspectorModal';
import { FolderTreeView } from './components/FolderTreeView';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  getCustomFiles,
  saveCustomFile,
  getFavoriteIds,
  toggleFavorite,
  getCompletedIds,
  toggleCompleted,
  recordRecentFile
} from './utils/localStore';

export default function App() {
  const [files, setFiles] = useState<LanguageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showOnlyCompleted, setShowOnlyCompleted] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'tree'>('grid');

  // Modals state
  const [activeViewerFile, setActiveViewerFile] = useState<LanguageFile | null>(null);
  const [inspectedFile, setInspectedFile] = useState<LanguageFile | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadFiles = useCallback(async (isManualRescan = false) => {
    if (isManualRescan) setIsRefreshing(true);
    try {
      const res = await fetch('/api/files');
      if (!res.ok) throw new Error('API server unreachable');
      const data: ScanResult = await res.json();

      const favIds = new Set(getFavoriteIds());
      const compIds = new Set(getCompletedIds());
      const customFiles = getCustomFiles();

      const serverFiles: LanguageFile[] = (data.files || []).map(f => ({
        ...f,
        favorite: favIds.has(f.id),
        completed: compIds.has(f.id)
      }));

      const existingIds = new Set(serverFiles.map(f => f.id));
      const filteredCustom = customFiles
        .filter(c => !existingIds.has(c.id))
        .map(c => ({
          ...c,
          favorite: favIds.has(c.id),
          completed: compIds.has(c.id)
        }));

      const merged = [...serverFiles, ...filteredCustom];
      setFiles(merged);

      if (isManualRescan) {
        showToast(`Cartella aggiornata: rilevati ${merged.length} fogli HTML!`);
      }
    } catch (err) {
      console.warn('Cannot fetch from /api/files (using local cache):', err);
      const customFiles = getCustomFiles();
      const favIds = new Set(getFavoriteIds());
      const compIds = new Set(getCompletedIds());

      setFiles(customFiles.map(c => ({
        ...c,
        favorite: favIds.has(c.id),
        completed: compIds.has(c.id)
      })));

      if (isManualRescan) {
        showToast('Modalità Offline: caricati i fogli salvati in locale.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
    setFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, favorite: !f.favorite } : f))
    );
  };

  const handleToggleCompleted = (id: string) => {
    toggleCompleted(id);
    setFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, completed: !f.completed } : f))
    );
  };

  const handleOpenFile = (file: LanguageFile) => {
    recordRecentFile(file.id);
    setActiveViewerFile(file);
  };

  const handleFileSaved = (newFile: LanguageFile) => {
    if (newFile.isCustom) {
      saveCustomFile(newFile);
    }
    setFiles(prev => [newFile, ...prev.filter(f => f.id !== newFile.id)]);
    showToast(`Foglio "${newFile.title}" salvato e aggiunto!`);
    loadFiles();
  };

  const dynamicLanguages = useMemo(() => {
    const knownIds = new Set(LANGUAGES.map(l => l.id));
    const extraLangIds = new Set<string>();

    files.forEach(f => {
      const l = f.language.toLowerCase().trim();
      if (!knownIds.has(l) && l !== 'altre') {
        extraLangIds.add(l);
      }
    });

    const extraDefs = Array.from(extraLangIds).map(id => getLanguageMeta(id));
    return [...LANGUAGES, ...extraDefs];
  }, [files]);

  const filteredFiles = useMemo(() => {
    return files.filter(f => {
      if (selectedLanguage !== 'all') {
        if (f.language.toLowerCase() !== selectedLanguage.toLowerCase()) return false;
      }

      if (selectedCategory !== 'all') {
        if (f.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }

      if (selectedDifficulty !== 'all') {
        if (f.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) return false;
      }

      if (showOnlyFavorites && !f.favorite) return false;
      if (showOnlyCompleted && !f.completed) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = f.title.toLowerCase().includes(q);
        const inDesc = f.description.toLowerCase().includes(q);
        const inName = f.fileName.toLowerCase().includes(q);
        const inKeywords = f.keywords.some(k => k.toLowerCase().includes(q));
        const inLang = f.language.toLowerCase().includes(q);
        const inCat = f.category.toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inName && !inKeywords && !inLang && !inCat) {
          return false;
        }
      }

      return true;
    });
  }, [files, selectedLanguage, selectedCategory, selectedDifficulty, showOnlyFavorites, showOnlyCompleted, searchQuery]);

  const stats = useMemo(() => {
    const langCounts: Record<string, number> = {};
    const catCounts: Record<string, number> = {};

    files.forEach(f => {
      langCounts[f.language] = (langCounts[f.language] || 0) + 1;
      catCounts[f.category] = (catCounts[f.category] || 0) + 1;
    });

    return {
      total: files.length,
      langCounts,
      catCounts,
      favoritesCount: files.filter(f => f.favorite).length,
      completedCount: files.filter(f => f.completed).length,
    };
  }, [files]);

  const activeLangMeta = selectedLanguage !== 'all' ? getLanguageMeta(selectedLanguage) : null;

  return (
    <div className="min-h-screen bg-[#c5ced8] text-slate-900 flex flex-col antialiased selection:bg-indigo-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-[#1b2029] px-4 py-2.5 text-xs md:text-sm font-semibold text-white shadow-2xl border border-[#3a4456] animate-in slide-in-from-top duration-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header with Sleek Dark Slate Look (No white, no blue notte, no glare) */}
      <header className="sticky top-0 z-30 bg-[#1b2029]/95 backdrop-blur-md border-b border-[#2d3545] px-4 md:px-8 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#252b36] border border-[#3b4456] flex items-center justify-center text-white font-black text-xl shadow-xs">
                文
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg md:text-xl font-extrabold text-white tracking-tight">
                    LinguaHub <span className="text-indigo-400 font-mono text-xs px-2 py-0.5 rounded-md bg-[#252b36] border border-[#373f4e] font-bold">PWA</span>
                  </h1>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  Raccoglitore dinamico di fogli HTML in <code className="text-indigo-300 font-mono font-semibold">public/langs/</code>
                </p>
              </div>
            </div>

            {/* Mobile actions shortcut */}
            <div className="flex items-center gap-2 md:hidden">
              <PWAInstallButton />
              <button
                onClick={() => loadFiles(true)}
                disabled={isRefreshing}
                className="p-2 rounded-xl bg-[#252b36] border border-[#3b4456] text-slate-200 hover:bg-[#2d3442]"
                title="Riscansiona"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Guide Button */}
            <button
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#252b36] hover:bg-[#2d3442] border border-[#3b4456] text-xs font-bold text-slate-200 transition shadow-xs"
              title="Come organizzare i file in public/"
            >
              <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Guida</span> Cartella public
            </button>

            {/* Rescan Button */}
            <button
              onClick={() => loadFiles(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#252b36] hover:bg-[#2d3442] border border-[#3b4456] text-xs font-bold text-slate-200 transition shadow-xs disabled:opacity-50"
              title="Riscansiona cartella public per nuovi file aggiunti"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden sm:inline">Riscansiona</span>
            </button>

            {/* Add File / Template Button */}
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-sm transition active:scale-95"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Aggiungi Foglio</span>
            </button>

            {/* PWA Install Button */}
            <div className="hidden md:block">
              <PWAInstallButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Languages Tabs / Filter Bar */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              Filtra per Lingua
            </span>
            <span className="text-xs text-slate-700 font-mono font-bold">
              {stats.total} fogli catalogati
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedLanguage('all')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold shrink-0 transition flex items-center gap-2 border shadow-xs ${
                selectedLanguage === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-400/40'
                  : 'bg-[#1b2029] border-[#2d3545] text-slate-200 hover:bg-[#252b36] hover:text-white'
              }`}
            >
              <span>🌐</span>
              <span>Tutte le Lingue</span>
              <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-mono ${
                selectedLanguage === 'all' ? 'bg-indigo-800 text-indigo-100' : 'bg-[#131720] text-slate-300'
              }`}>
                {stats.total}
              </span>
            </button>

            {dynamicLanguages.map((lang) => {
              const count = stats.langCounts[lang.id] || 0;
              const isSelected = selectedLanguage.toLowerCase() === lang.id.toLowerCase();

              return (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLanguage(isSelected ? 'all' : lang.id)}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold shrink-0 transition flex items-center gap-2 border shadow-xs ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-400/40'
                      : 'bg-[#1b2029] border-[#2d3545] text-slate-200 hover:bg-[#252b36] hover:text-white'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.label}</span>
                  <span className="text-[11px] opacity-75 font-normal hidden sm:inline">({lang.nativeLabel})</span>
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-mono ${
                      isSelected ? 'bg-indigo-800 text-indigo-100' : 'bg-[#131720] text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Categories Bar: Distinct Colors for Distinct Categories */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Sottocartelle & Tipologia
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 border shadow-xs ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-400/40'
                  : 'bg-[#1b2029] border-[#2d3545] text-slate-200 hover:bg-[#252b36] hover:text-white'
              }`}
            >
              <span>📁</span>
              <span>Tutte le cartelle</span>
            </button>

            {CATEGORIES.map((cat) => {
              const count = stats.catCounts[cat.id] || 0;
              const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 border shadow-sm ${
                    isSelected
                      ? `${cat.cardHeaderBg} border-2 ${cat.cardBorder.split(' ')[1]} ring-2 ring-white/40 scale-102`
                      : `${cat.cardBg} ${cat.cardBorder} hover:scale-102 opacity-90 hover:opacity-100`
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span className="font-bold text-white">{cat.label}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/40 text-white">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Search, Filter Toolbar, View mode switcher */}
        <section className="bg-[#1b2029] border border-[#2d3545] rounded-2xl p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca per titolo, vocabolo, grammatica o tag..."
              className="w-full bg-[#242933] border border-[#3a4252] rounded-xl pl-9.5 pr-4 py-2 text-xs md:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-[#242933] border border-[#3a4252] rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              <option value="all">Tutti i Livelli</option>
              <option value="Principiante">Principiante</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzato">Avanzato</option>
            </select>

            {/* Favorite toggle */}
            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                showOnlyFavorites
                  ? 'bg-amber-950/70 border-amber-500/80 text-amber-300'
                  : 'bg-[#242933] border-[#3a4252] text-slate-300 hover:bg-[#2c333f]'
              }`}
              title="Filtra solo i preferiti"
            >
              <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span className="hidden sm:inline">Preferiti</span>
              {stats.favoritesCount > 0 && <span className="font-mono text-[10px]">({stats.favoritesCount})</span>}
            </button>

            {/* Completed toggle */}
            <button
              onClick={() => setShowOnlyCompleted(!showOnlyCompleted)}
              className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                showOnlyCompleted
                  ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-300'
                  : 'bg-[#242933] border-[#3a4252] text-slate-300 hover:bg-[#2c333f]'
              }`}
              title="Filtra solo completati"
            >
              <CheckCircle className={`w-3.5 h-3.5 ${showOnlyCompleted ? 'fill-emerald-400/30 text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Completati</span>
            </button>

            {/* View Mode Switcher */}
            <div className="flex bg-[#242933] border border-[#3a4252] rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-[#3c4656] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Vista a Griglia (Card)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list' ? 'bg-[#3c4656] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Vista a Elenco Compatto"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'tree' ? 'bg-[#3c4656] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Vista ad Albero Cartelle"
              >
                <FolderTree className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Selected Context Hero / Banner */}
        {activeLangMeta && (
          <div
            className="rounded-2xl p-5 border-2 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all bg-[#1b2029] shadow-md"
            style={{
              borderColor: activeLangMeta.accentColor
            }}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">{activeLangMeta.flag}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">{activeLangMeta.label}</h2>
                  <span className="text-sm font-bold" style={{ color: activeLangMeta.accentColor }}>
                    {activeLangMeta.nativeLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Saluto tipico: <span className="font-bold text-white">{activeLangMeta.greeting}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="bg-[#252b36] px-3 py-1.5 rounded-xl border border-[#3b4456] font-medium">
                Cartella: <code className="text-indigo-300 font-mono font-bold">public/langs/{activeLangMeta.id}/</code>
              </span>
              <button
                onClick={() => setSelectedLanguage('all')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
              >
                Mostra tutte le lingue
              </button>
            </div>
          </div>
        )}

        {/* Content Section */}
        <section>
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-800">Scansione dei fogli HTML in corso...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            /* Empty State */
            <div className="bg-[#1b2029] border border-[#2d3545] rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-lg text-white">
              <div className="w-16 h-16 rounded-2xl bg-[#252b36] border border-[#3b4456] flex items-center justify-center mx-auto text-2xl">
                📂
              </div>
              <h3 className="text-lg font-bold text-white">Nessun foglio trovato con i filtri selezionati</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Nessun file HTML corrisponde alla ricerca corrente. Prova ad azzerare i filtri oppure inserisci un nuovo file nella cartella <code className="text-indigo-400 font-mono font-bold">public/langs/</code>.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedLanguage('all');
                    setSelectedCategory('all');
                    setSelectedDifficulty('all');
                    setShowOnlyFavorites(false);
                    setShowOnlyCompleted(false);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#252b36] hover:bg-[#2d3442] text-xs font-bold text-slate-200 border border-[#3b4456]"
                >
                  Azzera Tutti i Filtri
                </button>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-sm"
                >
                  Carica Nuovo Foglio
                </button>
              </div>
            </div>
          ) : viewMode === 'tree' ? (
            /* Folder Tree View */
            <FolderTreeView files={filteredFiles} onOpen={handleOpenFile} />
          ) : viewMode === 'list' ? (
            /* Compact List View */
            <div className="bg-[#1b2029] border border-[#2d3545] rounded-2xl overflow-hidden divide-y divide-[#2d3545] shadow-md">
              {filteredFiles.map((f) => {
                const lang = getLanguageMeta(f.language);
                const cat = getCategoryMeta(f.category);

                return (
                  <div
                    key={f.id}
                    onClick={() => handleOpenFile(f)}
                    className="p-4 hover:bg-[#252b36] flex items-center justify-between gap-4 cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{lang.flag}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${lang.badgeBg}`}>
                            {lang.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${cat.badgeClass}`}>
                            {cat.icon} {cat.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {f.formattedSize}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-200 transition truncate mt-0.5">
                          {f.title}
                        </h4>
                        <p className="text-xs text-slate-300 truncate mt-0.5">{f.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleFavorite(f.id)}
                        className={`p-1.5 rounded-lg ${f.favorite ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        <Star className={`w-4 h-4 ${f.favorite ? 'fill-amber-400' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleOpenFile(f)}
                        className={`px-3 py-1.5 rounded-xl text-white font-bold text-xs shadow-xs transition ${cat.actionBtn}`}
                      >
                        Apri
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Cards Grid View: Distinct Colors per Category */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {filteredFiles.map((file) => (
                <LanguageCard
                  key={file.id}
                  file={file}
                  onOpen={handleOpenFile}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleCompleted={handleToggleCompleted}
                  onInspect={(f) => setInspectedFile(f)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#2d3545] bg-[#1b2029] py-5 px-4 md:px-8 text-center text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            LinguaHub PWA • Architettura aperta: salva i tuoi fogli in <code className="text-indigo-400 font-mono font-bold">public/langs/&lt;lingua&gt;/&lt;sottocartella&gt;/*.html</code>
          </div>
          <div className="flex items-center gap-4 font-semibold">
            <button onClick={() => setIsGuideOpen(true)} className="hover:text-indigo-400 transition">
              Guida alle cartelle
            </button>
            <button onClick={() => setIsUploadOpen(true)} className="hover:text-indigo-400 transition">
              Aggiungi foglio
            </button>
          </div>
        </div>
      </footer>

      {/* Offline Status Floating Toast Indicator */}
      <OfflineIndicator />

      {/* Modals */}
      <SheetViewerModal
        file={activeViewerFile}
        onClose={() => setActiveViewerFile(null)}
        onToggleFavorite={handleToggleFavorite}
        onToggleCompleted={handleToggleCompleted}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onFileSaved={handleFileSaved}
      />

      <PublicFolderGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onRescan={() => loadFiles(true)}
      />

      <FileInspectorModal
        file={inspectedFile}
        onClose={() => setInspectedFile(null)}
        onOpen={handleOpenFile}
      />
    </div>
  );
}
