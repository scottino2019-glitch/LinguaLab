import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FileCode, Play } from 'lucide-react';
import { LanguageFile } from '../types';
import { getLanguageMeta, getCategoryMeta } from '../constants/languages';

interface FolderTreeViewProps {
  files: LanguageFile[];
  onOpen: (file: LanguageFile) => void;
}

export const FolderTreeView: React.FC<FolderTreeViewProps> = ({ files, onOpen }) => {
  const tree: Record<string, Record<string, LanguageFile[]>> = {};

  files.forEach((f) => {
    if (!tree[f.language]) tree[f.language] = {};
    if (!tree[f.language][f.category]) tree[f.language][f.category] = [];
    tree[f.language][f.category].push(f);
  });

  const [openLangs, setOpenLangs] = useState<Record<string, boolean>>({
    cinese: true,
    giapponese: true,
    coreano: true,
    russo: true,
    altre: true,
  });

  const [openCats, setOpenCats] = useState<Record<string, boolean>>({
    'cinese_giochi': true,
    'giapponese_giochi': true,
  });

  const toggleLang = (lang: string) => {
    setOpenLangs(prev => ({ ...prev, [lang]: !prev[lang] }));
  };

  const toggleCat = (key: string) => {
    setOpenCats(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-[#1b2029] border border-[#2d3545] rounded-2xl p-6 shadow-md">
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#2d3545] text-sm font-bold text-white">
        <Folder className="w-5 h-5 text-indigo-400" />
        <span>Esplora Albero Cartelle (<code className="text-indigo-400 font-mono">public/langs/</code>)</span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {Object.keys(tree).map((langKey) => {
          const langMeta = getLanguageMeta(langKey);
          const isLangOpen = openLangs[langKey] ?? true;
          const categories = tree[langKey];
          const totalFiles = Object.values(categories).reduce((acc, curr) => acc + curr.length, 0);

          return (
            <div key={langKey} className="border border-[#2d3545] rounded-xl p-3 bg-[#222733]">
              <div
                onClick={() => toggleLang(langKey)}
                className="flex items-center justify-between cursor-pointer py-1 text-slate-200 hover:text-indigo-300 select-none"
              >
                <div className="flex items-center gap-2">
                  {isLangOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  <span className="text-base">{langMeta.flag}</span>
                  <span className="font-bold font-sans text-sm text-white">{langMeta.label}</span>
                  <span className="text-slate-400 font-mono text-[11px]">/langs/{langKey}/</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#16181d] text-slate-300 border border-[#343b48] text-[10px] font-sans font-bold">
                  {totalFiles} {totalFiles === 1 ? 'foglio' : 'fogli'}
                </span>
              </div>

              {isLangOpen && (
                <div className="pl-6 pt-2 space-y-2 border-l-2 border-[#2d3340] ml-4 mt-2">
                  {Object.keys(categories).map((catKey) => {
                    const catMeta = getCategoryMeta(catKey);
                    const catIdKey = `${langKey}_${catKey}`;
                    const isCatOpen = openCats[catIdKey] ?? true;
                    const catFiles = categories[catKey];

                    return (
                      <div key={catKey} className="rounded-lg">
                        <div
                          onClick={() => toggleCat(catIdKey)}
                          className="flex items-center justify-between cursor-pointer py-1.5 px-2 rounded-lg text-slate-300 hover:bg-[#2a303d] select-none"
                        >
                          <div className="flex items-center gap-1.5">
                            {isCatOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                            <span>{catMeta.icon}</span>
                            <span className="font-sans font-bold text-xs text-white">{catMeta.label}</span>
                            <span className="text-slate-400 text-[10px]">/{catKey}/</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-sans font-semibold">({catFiles.length})</span>
                        </div>

                        {isCatOpen && (
                          <div className="pl-4 pt-1 space-y-1.5 border-l-2 border-[#2d3340] ml-3 mt-1">
                            {catFiles.map((f) => (
                              <div
                                key={f.id}
                                onClick={() => onOpen(f)}
                                className={`group flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition shadow-xs ${catMeta.cardBg} ${catMeta.cardBorder} hover:scale-[1.01]`}
                              >
                                <div className="flex items-center gap-2 truncate mr-2">
                                  <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="text-white font-sans text-xs font-bold group-hover:text-amber-200 transition truncate">
                                    {f.title}
                                  </span>
                                  <span className="text-[10px] text-slate-400 hidden sm:inline font-mono">
                                    ({f.fileName})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] text-slate-300 font-mono">{f.formattedSize}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpen(f);
                                    }}
                                    className={`p-1 px-2.5 rounded-lg text-white font-sans text-[11px] font-bold flex items-center gap-1 shadow-xs transition ${catMeta.actionBtn}`}
                                  >
                                    <Play className="w-2.5 h-2.5 fill-current" />
                                    <span>Apri</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
