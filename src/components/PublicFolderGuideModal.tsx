import React, { useState } from 'react';
import { X, FolderTree, Copy, Check, RefreshCw } from 'lucide-react';

interface PublicFolderGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRescan: () => void;
}

export const PublicFolderGuideModal: React.FC<PublicFolderGuideModalProps> = ({
  isOpen,
  onClose,
  onRescan,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sampleHtmlCode = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Titolo del Tuo Foglio di Studio</title>
  <meta name="description" content="Descrizione chiara del contenuto del foglio...">
  <meta name="language" content="cinese"> <!-- cinese, giapponese, coreano, russo, altre -->
  <meta name="category" content="giochi"> <!-- giochi, esercizi, grammatica, vocabolario, letture -->
  <meta name="difficulty" content="Principiante"> <!-- Principiante, Intermedio, Avanzato -->
  <meta name="keywords" content="vocabolario, quiz, pronuncia">
  <meta name="icon" content="✨">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 p-8 min-h-screen">
  <h1 class="text-3xl font-bold mb-4">Il mio foglio interattivo</h1>
  <!-- Il tuo codice HTML, CSS e JavaScript qui -->
</body>
</html>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleHtmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#242c37] border-2 border-[#475569] rounded-2xl p-6 md:p-8 shadow-2xl max-h-[90vh] flex flex-col text-slate-200 relative overflow-hidden">
        {/* Accent Stripe */}
        <div className="h-1.5 -mx-8 -mt-8 mb-6 bg-indigo-600 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3b4757] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#2e3745] text-indigo-300 border border-[#475569]">
              <FolderTree className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">
                Guida: Caricamento Automatico da Cartella <code className="text-indigo-300 font-mono">public/langs/</code>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Nessuna configurazione: basta posizionare il file HTML e l'app fa tutto il resto!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
            <span>Chiudi</span>
          </button>
        </div>

        {/* Scrollable instructions */}
        <div className="flex-1 overflow-y-auto pr-1 my-4 space-y-5 text-sm text-slate-300">
          {/* Step 1 */}
          <div className="bg-[#21252e] p-4 rounded-2xl border border-[#323946]">
            <h4 className="font-bold text-white text-base flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-mono font-bold">1</span>
              La struttura delle cartelle in <code className="text-indigo-400 font-mono">public/langs/</code>
            </h4>
            <p className="text-xs text-slate-300 mb-3">
              Organizza i file nelle cartelle per lingua e per sottocartella d'uso:
            </p>
            <div className="bg-[#121419] p-4 rounded-xl border border-[#262c37] font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto">
              <span className="text-emerald-400 font-bold">public/langs/</span><br />
              ├── <span className="text-amber-400 font-bold">cinese/</span><br />
              │   ├── <span className="text-cyan-300">giochi/</span> (es. memory_hanzi.html)<br />
              │   ├── <span className="text-cyan-300">esercizi/</span> (es. toni_e_pinyin.html)<br />
              │   ├── <span className="text-cyan-300">grammatica/</span> (es. struttura_frase.html)<br />
              │   ├── <span className="text-cyan-300">vocabolario/</span> (es. hsk1_essenziale.html)<br />
              │   └── <span className="text-cyan-300">letture/</span> (es. leggenda_del_drago.html)<br />
              ├── <span className="text-rose-400 font-bold">giapponese/</span> (giochi | esercizi | grammatica | vocabolario | letture)<br />
              ├── <span className="text-sky-400 font-bold">coreano/</span> (giochi | esercizi | grammatica | vocabolario | letture)<br />
              ├── <span className="text-blue-400 font-bold">russo/</span> (giochi | esercizi | grammatica | vocabolario | letture)<br />
              └── <span className="text-emerald-400 font-bold">altre/</span> (o qualsiasi altra cartella personalizzata!)
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#21252e] p-4 rounded-2xl border border-[#323946]">
            <h4 className="font-bold text-white text-base flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-mono font-bold">2</span>
              Come l'app legge automaticamente le informazioni
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              L'app esamina il codice HTML e compila la card estraendo:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#181b22] border border-[#2e3543]">
                <span className="text-indigo-400 font-mono font-bold">&lt;title&gt;</span>
                <span className="block text-slate-300 mt-1">Diventa il titolo della card</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#181b22] border border-[#2e3543]">
                <span className="text-indigo-400 font-mono font-bold">&lt;meta name="description"&gt;</span>
                <span className="block text-slate-300 mt-1">Sommario visualizzato</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#181b22] border border-[#2e3543]">
                <span className="text-indigo-400 font-mono font-bold">&lt;meta name="category"&gt;</span>
                <span className="block text-slate-300 mt-1">giochi, esercizi, grammatica...</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#181b22] border border-[#2e3543]">
                <span className="text-indigo-400 font-mono font-bold">&lt;meta name="difficulty"&gt;</span>
                <span className="block text-slate-300 mt-1">Principiante, Intermedio, Avanzato</span>
              </div>
            </div>
          </div>

          {/* Step 3: Template */}
          <div className="bg-[#21252e] p-4 rounded-2xl border border-[#323946]">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-mono font-bold">3</span>
                Template HTML pronto all'uso
              </h4>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#282e3a] hover:bg-[#323948] text-xs font-bold text-slate-200 rounded-lg transition border border-[#3e4758] shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiato!' : 'Copia Modello'}</span>
              </button>
            </div>
            <pre className="p-3 bg-[#121419] text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 border border-[#262c37]">
              {sampleHtmlCode}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#2d3340] flex justify-between items-center shrink-0">
          <button
            onClick={() => {
              onRescan();
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#242933] hover:bg-[#2c333f] text-slate-200 rounded-xl text-xs font-bold transition border border-[#384050] shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Riscansiona Cartella Ora</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-xs"
          >
            Chiudi Guida
          </button>
        </div>
      </div>
    </div>
  );
};
