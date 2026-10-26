import fs from 'fs';
import path from 'path';

const baseDir = path.resolve('public', 'langs');

const files = [
  // ===================== CINESE =====================
  {
    lang: 'cinese',
    cat: 'giochi',
    file: 'memory_hanzi.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gioco di Memoria: Caratteri Hanzi Fondamentali</title>
  <meta name="description" content="Abbina i caratteri cinesi essenziali (HSK 1) al loro significato e pinyin. Sfida a tempo con punteggio e pronuncia audio!">
  <meta name="language" content="cinese">
  <meta name="category" content="giochi">
  <meta name="difficulty" content="Principiante">
  <meta name="keywords" content="cinese, hanzi, pinyin, memoria, hsk1, gioco">
  <meta name="icon" content="🀄">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@500;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .hanzi { font-family: 'Noto Sans SC', sans-serif; }
    .card { perspective: 1000px; }
    .card-inner { transition: transform 0.4s; transform-style: preserve-3d; }
    .card.flipped .card-inner { transform: rotateY(180deg); }
    .back { transform: rotateY(180deg); }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8 flex flex-col items-center">
  <div class="max-w-2xl w-full">
    <header class="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
      <div>
        <span class="text-xs uppercase tracking-widest text-emerald-400 font-bold">🇨🇳 Cinese • Giochi & Quiz</span>
        <h1 class="text-2xl md:text-3xl font-extrabold text-white mt-1">Memory dei Caratteri Hanzi</h1>
      </div>
      <div class="flex gap-4 text-center">
        <div class="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <div class="text-xs text-slate-400">Mosse</div>
          <div id="moves" class="text-lg font-bold text-amber-400">0</div>
        </div>
        <div class="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <div class="text-xs text-slate-400">Coppie</div>
          <div id="matches" class="text-lg font-bold text-emerald-400">0/6</div>
        </div>
      </div>
    </header>

    <div id="win-banner" class="hidden mb-4 p-3 bg-emerald-600/90 border border-emerald-400 rounded-xl text-center font-bold text-white animate-bounce"></div>
    <div id="grid" class="grid grid-cols-3 sm:grid-cols-4 gap-3 md:gap-4 mb-6"></div>

    <div class="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-800 text-sm">
      <p class="text-slate-400">Ascolta la pronuncia cliccando sulle carte scoperte.</p>
      <button onclick="initGame()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-semibold text-white rounded-lg transition shadow-lg shadow-emerald-900/40">
        Ricomincia
      </button>
    </div>
  </div>

  <script>
    const items = [
      { id: 1, hanzi: '水', pinyin: 'shuǐ', it: 'Acqua' },
      { id: 2, hanzi: '火', pinyin: 'huǒ', it: 'Fuoco' },
      { id: 3, hanzi: '山', pinyin: 'shān', it: 'Montagna' },
      { id: 4, hanzi: '月', pinyin: 'yuè', it: 'Luna / Mese' },
      { id: 5, hanzi: '日', pinyin: 'rì', it: 'Sole / Giorno' },
      { id: 6, hanzi: '人', pinyin: 'rén', it: 'Persona' }
    ];

    let cards = [];
    let flipped = [];
    let matchedCount = 0;
    let moves = 0;
    let canClick = true;

    function speak(text) {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'zh-CN';
        window.speechSynthesis.speak(u);
      }
    }

    function initGame() {
      matchedCount = 0;
      moves = 0;
      flipped = [];
      canClick = true;
      document.getElementById('moves').textContent = '0';
      document.getElementById('matches').textContent = '0/' + items.length;

      cards = [];
      items.forEach(item => {
        cards.push({ id: item.id, type: 'hanzi', content: item.hanzi, sub: item.pinyin, speak: item.hanzi });
        cards.push({ id: item.id, type: 'meaning', content: item.it, sub: item.pinyin, speak: item.hanzi });
      });
      cards.sort(() => Math.random() - 0.5);

      const grid = document.getElementById('grid');
      grid.innerHTML = '';
      cards.forEach((card, index) => {
        const el = document.createElement('div');
        el.className = 'card h-28 md:h-32 cursor-pointer select-none';
        el.dataset.index = index;
        el.innerHTML = \`
          <div class="card-inner relative w-full h-full">
            <div class="absolute inset-0 bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-xl flex items-center justify-center text-slate-500 font-bold text-2xl backface-hidden shadow-md">
              ?
            </div>
            <div class="back absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700 border-2 border-emerald-500/50 rounded-xl flex flex-col items-center justify-center p-2 text-center backface-hidden shadow-lg">
              <span class="\${card.type === 'hanzi' ? 'hanzi text-3xl md:text-4xl font-bold text-amber-300' : 'text-base md:text-lg font-bold text-white'}">\${card.content}</span>
              <span class="text-xs text-emerald-400 mt-1 font-mono">\${card.sub}</span>
            </div>
          </div>
        \`;
        el.onclick = () => onCardClick(index, el);
        grid.appendChild(el);
      });
    }

    function onCardClick(index, el) {
      if (!canClick || el.classList.contains('flipped') || flipped.some(f => f.index === index)) return;
      el.classList.add('flipped');
      speak(cards[index].speak);
      flipped.push({ index, el, card: cards[index] });

      if (flipped.length === 2) {
        moves++;
        document.getElementById('moves').textContent = moves;
        canClick = false;

        const [c1, c2] = flipped;
        if (c1.card.id === c2.card.id && c1.card.type !== c2.card.type) {
          matchedCount++;
          document.getElementById('matches').textContent = matchedCount + '/' + items.length;
          c1.el.querySelector('.back').classList.add('!border-emerald-400', '!bg-emerald-950/40');
          c2.el.querySelector('.back').classList.add('!border-emerald-400', '!bg-emerald-950/40');
          flipped = [];
          canClick = true;
          if (matchedCount === items.length) {
            const winEl = document.getElementById('win-banner');
            if (winEl) {
              winEl.textContent = '🎉 Complimenti! Hai completato la sfida in ' + moves + ' mosse!';
              winEl.classList.remove('hidden');
            }
          }
        } else {
          setTimeout(() => {
            c1.el.classList.remove('flipped');
            c2.el.classList.remove('flipped');
            flipped = [];
            canClick = true;
          }, 900);
        }
      }
    }

    initGame();
  </script>
</body>
</html>`
  },
  {
    lang: 'cinese',
    cat: 'esercizi',
    file: 'toni_e_pinyin.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Esercizi di Ascolto e Riconoscimento: I 4 Toni del Cinese</title>
  <meta name="description" content="Allena l'orecchio a distinguere i 4 toni del cinese mandarino (alto, ascendente, discendente-ascendente, discendente).">
  <meta name="language" content="cinese">
  <meta name="category" content="esercizi">
  <meta name="difficulty" content="Principiante">
  <meta name="keywords" content="cinese, toni, pinyin, ascolto, pronuncia">
  <meta name="icon" content="🎵">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8 flex flex-col items-center">
  <div class="max-w-xl w-full">
    <header class="mb-6 pb-4 border-b border-slate-800">
      <span class="text-xs uppercase tracking-widest text-blue-400 font-bold">🇨🇳 Cinese • Esercizi</span>
      <h1 class="text-2xl md:text-3xl font-extrabold text-white mt-1">Sfida dei 4 Toni Mandarini</h1>
      <p class="text-sm text-slate-400 mt-1">Ascolta il suono e scegli il tono o carattere corretto.</p>
    </header>

    <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl mb-6 text-center">
      <div class="text-xs font-semibold text-slate-400 mb-2">DOMANDA <span id="q-num">1</span> DI <span id="q-total">5</span></div>
      <button id="listen-btn" class="my-4 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-2xl flex items-center justify-center gap-3 mx-auto transition shadow-lg shadow-indigo-600/30">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
        Ascolta il Suono
      </button>

      <div class="grid grid-cols-2 gap-3 mt-6" id="options"></div>
      <div id="feedback" class="mt-4 text-sm font-semibold h-6"></div>
    </div>

    <div class="flex justify-between items-center text-sm text-slate-400">
      <div>Punteggio: <span id="score" class="font-bold text-emerald-400">0</span></div>
      <button onclick="restart()" class="text-indigo-400 hover:underline">Ricomincia quiz</button>
    </div>
  </div>

  <script>
    const questions = [
      { text: 'mā', char: '妈 (mamma)', tone: '1° Tono (mā - piano)', sound: 'mā', options: ['1° Tono (mā)', '2° Tono (má)', '3° Tono (mǎ)', '4° Tono (mà)'], correct: 0 },
      { text: 'má', char: '麻 (canapa)', tone: '2° Tono (má - salita)', sound: 'má', options: ['1° Tono (mā)', '2° Tono (má)', '3° Tono (mǎ)', '4° Tono (mà)'], correct: 1 },
      { text: 'mǎ', char: '马 (cavallo)', tone: '3° Tono (mǎ - curva)', sound: 'mǎ', options: ['1° Tono (mā)', '2° Tono (má)', '3° Tono (mǎ)', '4° Tono (mà)'], correct: 2 },
      { text: 'mà', char: '骂 (rimproverare)', tone: '4° Tono (mà - discesa)', sound: 'mà', options: ['1° Tono (mā)', '2° Tono (má)', '3° Tono (mǎ)', '4° Tono (mà)'], correct: 3 },
      { text: 'hǎo', char: '好 (bene/buono)', tone: '3° Tono (hǎo)', sound: 'hǎo', options: ['1° Tono (hāo)', '2° Tono (háo)', '3° Tono (hǎo)', '4° Tono (hào)'], correct: 2 }
    ];

    let current = 0;
    let score = 0;

    function playSound() {
      const q = questions[current];
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(q.sound);
        u.lang = 'zh-CN';
        window.speechSynthesis.speak(u);
      }
    }

    document.getElementById('listen-btn').onclick = playSound;

    function renderQuestion() {
      const q = questions[current];
      document.getElementById('q-num').textContent = current + 1;
      document.getElementById('q-total').textContent = questions.length;
      document.getElementById('feedback').textContent = '';
      
      const optContainer = document.getElementById('options');
      optContainer.innerHTML = '';
      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'p-3 bg-slate-700/60 hover:bg-slate-700 border border-slate-600 rounded-xl font-medium text-slate-200 transition text-sm';
        btn.textContent = opt;
        btn.onclick = () => selectOption(idx);
        optContainer.appendChild(btn);
      });
      playSound();
    }

    function selectOption(idx) {
      const q = questions[current];
      const feedback = document.getElementById('feedback');
      const buttons = document.querySelectorAll('#options button');
      buttons.forEach(b => b.disabled = true);

      if (idx === q.correct) {
        score++;
        document.getElementById('score').textContent = score;
        buttons[idx].classList.add('!bg-emerald-600', '!border-emerald-400', 'text-white');
        feedback.textContent = 'Esatto! Era ' + q.char;
        feedback.className = 'mt-4 text-sm font-semibold text-emerald-400';
      } else {
        buttons[idx].classList.add('!bg-rose-600', '!border-rose-400', 'text-white');
        buttons[q.correct].classList.add('!bg-emerald-600', '!border-emerald-400', 'text-white');
        feedback.textContent = 'Non proprio: la risposta era ' + q.char;
        feedback.className = 'mt-4 text-sm font-semibold text-rose-400';
      }

      setTimeout(() => {
        current++;
        if (current < questions.length) {
          renderQuestion();
        } else {
          document.getElementById('options').innerHTML = '<div class="col-span-2 py-4 text-emerald-400 font-bold text-lg">Esercizio completato! Punteggio: ' + score + '/' + questions.length + '</div>';
          document.getElementById('feedback').textContent = '';
        }
      }, 1500);
    }

    function restart() {
      current = 0;
      score = 0;
      document.getElementById('score').textContent = '0';
      renderQuestion();
    }

    renderQuestion();
  </script>
</body>
</html>`
  },
  {
    lang: 'cinese',
    cat: 'grammatica',
    file: 'struttura_frase.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grammatica Cinese: Ordine della Frase e Particelle</title>
  <meta name="description" content="Guida visiva interattiva alla struttura sintattica S-T-M-L-V-O in cinese e all'uso fondamentale delle particelle 的, 得, 地.">
  <meta name="language" content="cinese">
  <meta name="category" content="grammatica">
  <meta name="difficulty" content="Intermedio">
  <meta name="keywords" content="cinese, grammatica, sintassi, de, particelle, frase">
  <meta name="icon" content="📚">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8">
  <div class="max-w-3xl mx-auto">
    <header class="mb-8 pb-4 border-b border-slate-800">
      <span class="text-xs uppercase tracking-widest text-purple-400 font-bold">🇨🇳 Cinese • Grammatica & Regole</span>
      <h1 class="text-2xl md:text-3xl font-extrabold text-white mt-1">La Formula della Frase Cinese</h1>
      <p class="text-slate-400 mt-2">La sequenza standard è <strong>Soggetto + Tempo + Luogo + Mezzo + Verbo + Oggetto</strong>.</p>
    </header>

    <div class="bg-slate-800/70 border border-slate-700 rounded-2xl p-6 mb-8">
      <h2 class="text-lg font-bold text-amber-300 mb-3">Schema Sintattico Interattivo</h2>
      <div class="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs font-mono font-bold mb-4">
        <div class="bg-indigo-900/60 border border-indigo-500/40 p-2.5 rounded-lg text-indigo-200">Soggetto (S)<br><span class="text-sm font-sans font-normal text-white">我 (Io)</span></div>
        <div class="bg-blue-900/60 border border-blue-500/40 p-2.5 rounded-lg text-blue-200">Tempo (T)<br><span class="text-sm font-sans font-normal text-white">明天 (Domani)</span></div>
        <div class="bg-teal-900/60 border border-teal-500/40 p-2.5 rounded-lg text-teal-200">Luogo (L)<br><span class="text-sm font-sans font-normal text-white">在图书馆</span></div>
        <div class="bg-emerald-900/60 border border-emerald-500/40 p-2.5 rounded-lg text-emerald-200">Mezzo (M)<br><span class="text-sm font-sans font-normal text-white">跟朋友 (Con amici)</span></div>
        <div class="bg-amber-900/60 border border-amber-500/40 p-2.5 rounded-lg text-amber-200">Verbo (V)<br><span class="text-sm font-sans font-normal text-white">学 (Studio)</span></div>
        <div class="bg-rose-900/60 border border-rose-500/40 p-2.5 rounded-lg text-rose-200">Oggetto (O)<br><span class="text-sm font-sans font-normal text-white">中文 (Cinese)</span></div>
      </div>
      <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-sm flex items-center justify-between">
        <span class="text-slate-300">Frase unita: <strong>我明天在图书馆跟朋友学中文。</strong></span>
        <button onclick="speak('我明天在图书馆跟朋友学中文')" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded text-white flex items-center gap-1">
          🔊 Ascolta
        </button>
      </div>
    </div>

    <div class="grid md:grid-cols-3 gap-4">
      <div class="bg-slate-800/50 border border-slate-700/60 p-4 rounded-xl">
        <span class="text-xl font-bold text-amber-400">的 (de)</span>
        <h3 class="font-bold text-white text-sm mt-1">Possesso e Modificatore</h3>
        <p class="text-xs text-slate-400 mt-2">Collega aggettivo o possessore a un sostantivo: 我的书 (Il mio libro), 红色的花 (Fiore rosso).</p>
      </div>
      <div class="bg-slate-800/50 border border-slate-700/60 p-4 rounded-xl">
        <span class="text-xl font-bold text-cyan-400">得 (de)</span>
        <h3 class="font-bold text-white text-sm mt-1">Grado e Risultato</h3>
        <p class="text-xs text-slate-400 mt-2">Segue il verbo per indicare come l'azione viene svolta: 他跑得很快 (Lui corre molto veloce).</p>
      </div>
      <div class="bg-slate-800/50 border border-slate-700/60 p-4 rounded-xl">
        <span class="text-xl font-bold text-emerald-400">地 (de)</span>
        <h3 class="font-bold text-white text-sm mt-1">Avverbiale</h3>
        <p class="text-xs text-slate-400 mt-2">Trasforma un aggettivo in avverbio prima del verbo: 高兴地笑了 (Sorrise felicemente).</p>
      </div>
    </div>
  </div>
  <script>
    function speak(text) {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'zh-CN';
        window.speechSynthesis.speak(u);
      }
    }
  </script>
</body>
</html>`
  },
  {
    lang: 'cinese',
    cat: 'vocabolario',
    file: 'hsk1_essenziale.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vocabolario Essenziale HSK 1: Le 20 Parole Chiave</title>
  <meta name="description" content="Schede flashcard interattive dei vocaboli più importanti del livello HSK 1 con pronuncia, pinyin e frasi di esempio.">
  <meta name="language" content="cinese">
  <meta name="category" content="vocabolario">
  <meta name="difficulty" content="Principiante">
  <meta name="keywords" content="cinese, hsk1, vocabolario, flashcards, pinyin">
  <meta name="icon" content="🗂️">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8">
  <div class="max-w-4xl mx-auto">
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800">
      <div>
        <span class="text-xs uppercase tracking-widest text-emerald-400 font-bold">🇨🇳 Cinese • Vocabolario</span>
        <h1 class="text-2xl md:text-3xl font-extrabold text-white mt-1">Flashcard HSK 1 Fondamentali</h1>
      </div>
      <input type="text" id="search" placeholder="Cerca parola o pinyin..." oninput="filterWords()" class="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-500 w-full sm:w-64">
    </header>

    <div id="cards-container" class="grid sm:grid-cols-2 md:grid-cols-3 gap-4"></div>
  </div>

  <script>
    const words = [
      { hanzi: '你好', pinyin: 'nǐ hǎo', it: 'Ciao / Buongiorno', ex: '你好，很高兴认识你。' },
      { hanzi: '谢谢', pinyin: 'xièxie', it: 'Grazie', ex: '太谢谢你了！' },
      { hanzi: '不客气', pinyin: 'bù kèqi', it: 'Prego / Di nulla', ex: '别客气。' },
      { hanzi: '再见', pinyin: 'zàijiàn', it: 'Arrivederci', ex: '明天再见！' },
      { hanzi: '吃', pinyin: 'chī', it: 'Mangiare', ex: '你想吃什么？' },
      { hanzi: '喝', pinyin: 'hē', it: 'Bere', ex: '我想喝茶。' },
      { hanzi: '茶', pinyin: 'chá', it: 'Tè', ex: '中国茶很好喝。' },
      { hanzi: '朋友', pinyin: 'péngyou', it: 'Amico', ex: '他是我的好朋友。' },
      { hanzi: '老师', pinyin: 'lǎoshī', it: 'Insegnante', ex: '王老师好！' }
    ];

    function speak(txt) {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(txt);
        u.lang = 'zh-CN';
        window.speechSynthesis.speak(u);
      }
    }

    function render(list) {
      const c = document.getElementById('cards-container');
      c.innerHTML = '';
      list.forEach(w => {
        const d = document.createElement('div');
        d.className = 'bg-slate-800/80 border border-slate-700/80 hover:border-slate-500 rounded-2xl p-5 transition flex flex-col justify-between';
        d.innerHTML = \`
          <div>
            <div class="flex items-start justify-between">
              <span class="text-3xl font-extrabold text-amber-300 font-['Noto_Sans_SC']">\${w.hanzi}</span>
              <button onclick="speak('\${w.hanzi}')" class="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition">🔊</button>
            </div>
            <div class="text-emerald-400 font-mono text-sm mt-1">\${w.pinyin}</div>
            <div class="text-slate-200 font-medium text-base mt-2">\${w.it}</div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-700/60 text-xs text-slate-400">
            <span class="text-slate-500">Es:</span> \${w.ex}
          </div>
        \`;
        c.appendChild(d);
      });
    }

    function filterWords() {
      const q = document.getElementById('search').value.toLowerCase();
      const filtered = words.filter(w => w.hanzi.includes(q) || w.pinyin.toLowerCase().includes(q) || w.it.toLowerCase().includes(q));
      render(filtered);
    }

    render(words);
  </script>
</body>
</html>`
  },
  {
    lang: 'cinese',
    cat: 'letture',
    file: 'leggenda_del_drago.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lettura Graduata: La Leggenda del Drago Cinese</title>
  <meta name="description" content="Breve racconto graduato per studenti di lingua cinese con testo a fronte, pinyin interattivo e lettore audio integrato.">
  <meta name="language" content="cinese">
  <meta name="category" content="letture">
  <meta name="difficulty" content="Intermedio">
  <meta name="keywords" content="cinese, lettura, racconto, pinyin, draghi, cultura">
  <meta name="icon" content="🐉">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8">
  <div class="max-w-3xl mx-auto">
    <header class="mb-8 pb-4 border-b border-slate-800">
      <span class="text-xs uppercase tracking-widest text-amber-400 font-bold">🇨🇳 Cinese • Letture & Testi</span>
      <h1 class="text-2xl md:text-3xl font-extrabold text-white mt-1">龙的传说 (La Leggenda del Drago)</h1>
      <div class="flex items-center gap-4 mt-3">
        <button id="toggle-pinyin" onclick="togglePinyin()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700">
          Mostra/Nascondi Pinyin
        </button>
        <button onclick="readAll()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg text-white">
          ▶️ Ascolta Tutto
        </button>
      </div>
    </header>

    <article class="space-y-6 text-slate-300 leading-relaxed" id="reading-content">
      <div class="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
        <p class="text-xl text-white font-['Noto_Sans_SC'] mb-1">
          在中国文化中，龙是吉祥和力量的象征。
        </p>
        <p class="pinyin text-xs text-amber-400 font-mono mb-2">Zài Zhōngguó wénhuà zhōng, lóng shì jíxiáng hé lìliang de xiàngzhēng.</p>
        <p class="text-sm text-slate-400">Nella cultura cinese, il drago è simbolo di buon auspicio e di forza.</p>
      </div>

      <div class="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
        <p class="text-xl text-white font-['Noto_Sans_SC'] mb-1">
          龙不仅能带来雨水，还能保佑丰收。人们在节日里舞龙庆祝。
        </p>
        <p class="pinyin text-xs text-amber-400 font-mono mb-2">Lóng bùjǐn néng dàilái yǔshuǐ, hái néng bǎoyòu fēngshōu. Rénmen zài jiérì lǐ wǔlóng qìngzhù.</p>
        <p class="text-sm text-slate-400">Il drago non solo porta la pioggia, ma protegge anche il raccolto. Durante le festività, la gente danza con il drago.</p>
      </div>
    </article>
  </div>
  <script>
    let pinyinVisible = true;
    function togglePinyin() {
      pinyinVisible = !pinyinVisible;
      document.querySelectorAll('.pinyin').forEach(el => {
        el.style.display = pinyinVisible ? 'block' : 'none';
      });
    }
    function readAll() {
      const text = "在中国文化中，龙是吉祥和力量的象征。龙不仅能带来雨水，还能保佑丰收。人们在节日里舞龙庆祝。";
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'zh-CN';
        window.speechSynthesis.speak(u);
      }
    }
  </script>
</body>
</html>`
  },

  // ===================== GIAPPONESE =====================
  {
    lang: 'giapponese',
    cat: 'giochi',
    file: 'kana_arcade.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kana Arcade: Velocità Hiragana e Katakana</title>
  <meta name="description" content="Sfida di velocità a tempo sui sillabari Hiragana e Katakana con streak, punteggio e pronuncia audio autentica!">
  <meta name="language" content="giapponese">
  <meta name="category" content="giochi">
  <meta name="difficulty" content="Principiante">
  <meta name="keywords" content="giapponese, hiragana, katakana, quiz, gioco, arcade">
  <meta name="icon" content="🌸">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8 flex flex-col items-center">
  <div class="max-w-md w-full">
    <header class="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
      <div>
        <span class="text-xs uppercase tracking-widest text-rose-400 font-bold">🇯🇵 Giapponese • Giochi & Quiz</span>
        <h1 class="text-2xl font-black text-white mt-1">Kana Arcade</h1>
      </div>
      <div class="flex gap-2">
        <div class="bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 text-center">
          <div class="text-[10px] text-slate-400">STREAK</div>
          <div id="streak" class="text-base font-bold text-amber-400">🔥 0</div>
        </div>
      </div>
    </header>

    <div class="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 text-center shadow-2xl mb-4">
      <div class="text-xs font-semibold text-slate-400 mb-2">QUALE ROMAJI CORRISPONDE?</div>
      <div id="target-kana" class="text-7xl font-black text-rose-300 py-6 font-['Noto_Sans_JP'] drop-shadow-md">あ</div>
      <div id="buttons-grid" class="grid grid-cols-2 gap-3 mt-4"></div>
    </div>

    <div class="flex justify-between items-center text-xs text-slate-400 px-2">
      <span>Punti: <strong id="score" class="text-emerald-400 text-sm">0</strong></span>
      <button onclick="newRound()" class="hover:text-white transition">Salta canale ↻</button>
    </div>
  </div>

  <script>
    const kanaList = [
      { kana: 'あ', romaji: 'a' }, { kana: 'い', romaji: 'i' }, { kana: 'う', romaji: 'u' }, { kana: 'え', romaji: 'e' }, { kana: 'お', romaji: 'o' },
      { kana: 'か', romaji: 'ka' }, { kana: 'き', romaji: 'ki' }, { kana: 'く', romaji: 'ku' }, { kana: 'け', romaji: 'ke' }, { kana: 'こ', romaji: 'ko' },
      { kana: 'さ', romaji: 'sa' }, { kana: 'し', romaji: 'shi' }, { kana: 'す', romaji: 'su' }, { kana: 'せ', romaji: 'se' }, { kana: 'そ', romaji: 'so' },
      { kana: 'ア', romaji: 'a' }, { kana: 'カ', romaji: 'ka' }, { kana: 'サ', romaji: 'sa' }, { kana: 'ナ', romaji: 'na' }
    ];

    let current = null;
    let score = 0;
    let streak = 0;

    function speak(text) {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ja-JP';
        window.speechSynthesis.speak(u);
      }
    }

    function newRound() {
      current = kanaList[Math.floor(Math.random() * kanaList.length)];
      document.getElementById('target-kana').textContent = current.kana;
      speak(current.kana);

      // Wrong options
      let wrong = kanaList.map(k => k.romaji).filter(r => r !== current.romaji);
      wrong = [...new Set(wrong)].sort(() => Math.random() - 0.5).slice(0, 3);
      const choices = [current.romaji, ...wrong].sort(() => Math.random() - 0.5);

      const grid = document.getElementById('buttons-grid');
      grid.innerHTML = '';
      choices.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'py-3.5 bg-slate-700/80 hover:bg-slate-700 border border-slate-600 rounded-xl font-bold text-lg text-slate-100 transition active:scale-95';
        btn.textContent = c;
        btn.onclick = () => {
          if (c === current.romaji) {
            score += 10;
            streak++;
            btn.classList.add('!bg-emerald-600');
          } else {
            streak = 0;
            btn.classList.add('!bg-rose-600');
          }
          document.getElementById('score').textContent = score;
          document.getElementById('streak').textContent = '🔥 ' + streak;
          setTimeout(newRound, 400);
        };
        grid.appendChild(btn);
      });
    }

    newRound();
  </script>
</body>
</html>`
  },
  {
    lang: 'giapponese',
    cat: 'esercizi',
    file: 'particelle_wa_ga_wo.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Esercizi Particelle Giapponesi: は (wa), が (ga), を (wo), に (ni)</title>
  <meta name="description" content="Mettiti alla prova con le particelle grammaticali essenziali del giapponese moderno con spiegazione immediata dell'errore.">
  <meta name="language" content="giapponese">
  <meta name="category" content="esercizi">
  <meta name="difficulty" content="Principiante">
  <meta name="keywords" content="giapponese, particelle, wa, ga, wo, ni, esercizi, grammatica">
  <meta name="icon" content="✏️">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8">
  <div class="max-w-2xl mx-auto">
    <header class="mb-6 pb-4 border-b border-slate-800">
      <span class="text-xs uppercase tracking-widest text-emerald-400 font-bold">🇯🇵 Giapponese • Esercizi</span>
      <h1 class="text-2xl md:text-3xl font-extrabold text-white mt-1">Scegli la Particella Corretta</h1>
      <p class="text-sm text-slate-400 mt-1">Completa la frase giapponese con la particella appropriata.</p>
    </header>

    <div id="quiz-box" class="space-y-4"></div>
  </div>

  <script>
    const questions = [
      { text: 'わたし [ ? ] がくせいです。 (Io sono uno studente)', options: ['は (wa)', 'が (ga)', 'を (wo)', 'に (ni)'], correct: 0, why: 'は marca il tema principale della frase (watashi wa).' },
      { text: 'みず [ ? ] のみます。 (Bevo acqua)', options: ['は (wa)', 'が (ga)', 'を (wo)', 'に (ni)'], correct: 2, why: 'を (letto "o") marca l\'oggetto diretto del verbo transitivo.' },
      { text: 'とうきょう [ ? ] いきます。 (Vado a Tokyo)', options: ['は (wa)', 'が (ga)', 'を (wo)', 'に (ni)'], correct: 3, why: 'に marca la direzione e il punto di arrivo (Tokyo ni ikimasu).' },
      { text: 'だれ [ ? ] きましたか。 (Chi è venuto?)', options: ['は (wa)', 'が (ga)', 'を (wo)', 'に (ni)'], correct: 1, why: 'I pronomi interrogativi come だれ (chi) prendono sempre が come soggetto.' }
    ];

    const box = document.getElementById('quiz-box');
    questions.forEach((q, i) => {
      const card = document.createElement('div');
      card.className = 'bg-slate-800/70 border border-slate-700/80 p-5 rounded-2xl';
      card.innerHTML = \`
        <p class="text-lg font-bold text-white mb-3 font-['Noto_Sans_JP']">\${q.text}</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          \${q.options.map((opt, optIndex) => \`
            <button onclick="check(\${i}, \${optIndex}, this)" class="p-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition border border-slate-600">\${opt}</button>
          \`).join('')}
        </div>
        <div id="expl-\${i}" class="text-xs hidden p-3 rounded-lg"></div>
      \`;
      box.appendChild(card);
    });

    function check(qIndex, choiceIndex, btn) {
      const q = questions[qIndex];
      const parent = btn.parentElement;
      const allButtons = parent.querySelectorAll('button');
      allButtons.forEach(b => b.disabled = true);

      const expl = document.getElementById('expl-' + qIndex);
      expl.classList.remove('hidden');

      if (choiceIndex === q.correct) {
        btn.classList.add('!bg-emerald-600', '!border-emerald-400');
        expl.className = 'text-xs p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300';
        expl.textContent = '✅ Esatto! ' + q.why;
      } else {
        btn.classList.add('!bg-rose-600', '!border-rose-400');
        allButtons[q.correct].classList.add('!bg-emerald-600');
        expl.className = 'text-xs p-3 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300';
        expl.textContent = '❌ Sbagliato. Spiegazione: ' + q.why;
      }
    }
  </script>
</body>
</html>`
  },
  {
    lang: 'giapponese',
    cat: 'grammatica',
    file: 'coniugazione_verbi.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tavola di Coniugazione dei Verbi Giapponesi</title>
  <meta name="description" content="Esploratore visuale dei 3 gruppi di verbi: Godan (Gruppo 1), Ichidan (Gruppo 2) e Irregolari (Gruppo 3).">
  <meta name="language" content="giapponese">
  <meta name="category" content="grammatica">
  <meta name="difficulty" content="Intermedio">
  <meta name="keywords" content="giapponese, verbi, coniugazione, godan, ichidan, masu, te">
  <meta name="icon" content="📖">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8">
  <div class="max-w-4xl mx-auto">
    <header class="mb-6 pb-4 border-b border-slate-800">
      <span class="text-xs uppercase tracking-widest text-indigo-400 font-bold">🇯🇵 Giapponese • Grammatica & Regole</span>
      <h1 class="text-2xl md:text-3xl font-extrabold text-white mt-1">Coniugazione dei Verbi Giapponesi</h1>
      <p class="text-slate-400 mt-1">Seleziona una forma per vedere come cambiano i verbi guida.</p>
    </header>

    <div class="grid md:grid-cols-3 gap-4 mb-6">
      <div class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
        <span class="text-xs font-bold text-amber-400 uppercase">Gruppo 1 (Godan)</span>
        <h3 class="text-xl font-bold text-white mt-1">いく (Iku - Andare)</h3>
        <ul class="text-sm space-y-2 mt-4 text-slate-300">
          <li><strong>Dizionario:</strong> 行く (iku)</li>
          <li><strong>Forma -Masu:</strong> 行きます (ikimasu)</li>
          <li><strong>Forma -Te:</strong> 行って (itte)</li>
          <li><strong>Negativo:</strong> 行かない (ikanai)</li>
        </ul>
      </div>

      <div class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
        <span class="text-xs font-bold text-emerald-400 uppercase">Gruppo 2 (Ichidan)</span>
        <h3 class="text-xl font-bold text-white mt-1">たべる (Taberu - Mangiare)</h3>
        <ul class="text-sm space-y-2 mt-4 text-slate-300">
          <li><strong>Dizionario:</strong> 食べる (taberu)</li>
          <li><strong>Forma -Masu:</strong> 食べます (tabemasu)</li>
          <li><strong>Forma -Te:</strong> 食べて (tabete)</li>
          <li><strong>Negativo:</strong> 食べない (tabenai)</li>
        </ul>
      </div>

      <div class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
        <span class="text-xs font-bold text-rose-400 uppercase">Gruppo 3 (Irregolari)</span>
        <h3 class="text-xl font-bold text-white mt-1">する & くる (Fare & Venire)</h3>
        <ul class="text-sm space-y-2 mt-4 text-slate-300">
          <li><strong>Fare:</strong> する → します → して</li>
          <li><strong>Venire:</strong> くる → きます → きて</li>
          <li><strong>Negativo:</strong> しない / こない</li>
        </ul>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    lang: 'giapponese',
    cat: 'vocabolario',
    file: 'jlpt_n5_oggetti.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vocabolario JLPT N5: Vita Quotidiana e Oggetti</title>
  <meta name="description" content="Schede di vocabolario per il livello base JLPT N5 con kanji, furigana, pronuncia e traduzione italiana.">
  <meta name="language" content="giapponese">
  <meta name="category" content="vocabolario">
  <meta name="difficulty" content="Principiante">
  <meta name="keywords" content="giapponese, jlpt, n5, vocabolario, kanji, furigana">
  <meta name="icon" content="🍱">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8">
  <div class="max-w-4xl mx-auto">
    <header class="mb-6 pb-4 border-b border-slate-800">
      <span class="text-xs uppercase tracking-widest text-emerald-400 font-bold">🇯🇵 Giapponese • Vocabolario</span>
      <h1 class="text-2xl md:text-3xl font-extrabold text-white mt-1">Vocabolario Vita Quotidiana JLPT N5</h1>
    </header>

    <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4" id="vocab-grid"></div>
  </div>
  <script>
    const items = [
      { kanji: '本', kana: 'ほん', romaji: 'hon', it: 'Libro' },
      { kanji: '車', kana: 'くるま', romaji: 'kuruma', it: 'Macchina / Auto' },
      { kanji: '猫', kana: 'ねこ', romaji: 'neko', it: 'Gatto' },
      { kanji: '犬', kana: 'いぬ', romaji: 'inu', it: 'Cane' },
      { kanji: '水', kana: 'みず', romaji: 'mizu', it: 'Acqua' },
      { kanji: '時間', kana: 'じかん', romaji: 'jikan', it: 'Tempo / Ora' }
    ];

    function speak(txt) {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(txt);
        u.lang = 'ja-JP';
        window.speechSynthesis.speak(u);
      }
    }

    const grid = document.getElementById('vocab-grid');
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'bg-slate-800/70 border border-slate-700/80 p-5 rounded-2xl flex items-center justify-between';
      card.innerHTML = \`
        <div>
          <ruby class="text-3xl font-black text-rose-300">\${item.kanji}<rt class="text-xs text-slate-400">\${item.kana}</rt></ruby>
          <div class="text-xs font-mono text-emerald-400 mt-1">\${item.romaji}</div>
          <div class="text-sm font-semibold text-white mt-1">\${item.it}</div>
        </div>
        <button onclick="speak('\${item.kana}')" class="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition text-lg">🔊</button>
      \`;
      grid.appendChild(card);
    });
  </script>
</body>
</html>`
  },
  {
    lang: 'giapponese',
    cat: 'letture',
    file: 'giorno_a_shibuya.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lettura Graduata: Un Giorno a Shibuya</title>
  <meta name="description" content="Racconto in giapponese semplice con furigana e traduzione italiana, ambientato nell'incrocio più famoso del mondo.">
  <meta name="language" content="giapponese">
  <meta name="category" content="letture">
  <meta name="difficulty" content="Intermedio">
  <meta name="keywords" content="giapponese, lettura, shibuya, tokyo, furigana">
  <meta name="icon" content="🗼">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8">
  <div class="max-w-3xl mx-auto">
    <header class="mb-6 pb-4 border-b border-slate-800 flex justify-between items-center">
      <div>
        <span class="text-xs uppercase tracking-widest text-cyan-400 font-bold">🇯🇵 Giapponese • Letture</span>
        <h1 class="text-2xl md:text-3xl font-extrabold text-white mt-1">渋谷のいちにち (Un Giorno a Shibuya)</h1>
      </div>
      <button onclick="speakStory()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white">🔊 Ascolta</button>
    </header>

    <div class="space-y-6 text-slate-300">
      <div class="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
        <p class="text-lg text-white leading-relaxed">
          きょうは ともだちと <ruby>渋谷<rt>しぶや</rt></ruby>で あいました。
        </p>
        <p class="text-sm text-slate-400 mt-2">Oggi ho incontrato un amico a Shibuya.</p>
      </div>

      <div class="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
        <p class="text-lg text-white leading-relaxed">
          スクランブル<ruby>交差点<rt>こうさてん</rt></ruby>には たくさんの ひとが いました。
        </p>
        <p class="text-sm text-slate-400 mt-2">All'incrocio pedonale scramble c'erano tantissime persone.</p>
      </div>
    </div>
  </div>
  <script>
    function speakStory() {
      const text = "きょうは ともだちと しぶやで あいました。スクランブルこうさてんには たくさんの ひとが いました。";
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ja-JP';
        window.speechSynthesis.speak(u);
      }
    }
  </script>
</body>
</html>`
  },

  // ===================== COREANO =====================
  {
    lang: 'coreano',
    cat: 'giochi',
    file: 'hangul_blaster.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hangul Blaster: Crea le Sillabe Coreane</title>
  <meta name="description" content="Impara come si formano i blocchi sillabici coreani unendo consonanti e vocali Hangul con pronuncia audio!">
  <meta name="language" content="coreano">
  <meta name="category" content="giochi">
  <meta name="difficulty" content="Principiante">
  <meta name="keywords" content="coreano, hangul, sillabe, blocchi, gioco">
  <meta name="icon" content="🎯">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8 flex flex-col items-center">
  <div class="max-w-lg w-full">
    <header class="mb-6 pb-3 border-b border-slate-800 text-center">
      <span class="text-xs uppercase tracking-widest text-cyan-400 font-bold">🇰🇷 Coreano • Giochi & Quiz</span>
      <h1 class="text-2xl font-black text-white mt-1">Hangul Block Builder</h1>
    </header>

    <div class="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 text-center shadow-xl mb-6">
      <div class="text-xs font-semibold text-slate-400 mb-2">BLOCCO GENERATO</div>
      <div id="result" class="text-7xl font-black text-cyan-300 py-4 font-['Noto_Sans_KR']">가</div>
      <div id="pronounce" class="text-sm font-mono text-emerald-400">ga (g + a)</div>

      <div class="mt-6 space-y-4">
        <div>
          <span class="text-xs text-slate-400 block mb-1">1. Scegli Consonante (Choseong)</span>
          <div class="flex justify-center gap-2" id="cons"></div>
        </div>
        <div>
          <span class="text-xs text-slate-400 block mb-1">2. Scegli Vocale (Jungseong)</span>
          <div class="flex justify-center gap-2" id="vow"></div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const consonants = [
      { char: 'ㄱ', name: 'g/k', code: 0 },
      { char: 'ㄴ', name: 'n', code: 2 },
      { char: 'ㄷ', name: 'd/t', code: 3 },
      { char: 'ㄹ', name: 'r/l', code: 5 },
      { char: 'ㅁ', name: 'm', code: 6 },
      { char: 'ㅂ', name: 'b/p', code: 7 }
    ];

    const vowels = [
      { char: 'ㅏ', name: 'a', code: 0 },
      { char: 'ㅓ', name: 'eo', code: 4 },
      { char: 'ㅗ', name: 'o', code: 8 },
      { char: 'ㅜ', name: 'u', code: 13 },
      { char: 'ㅣ', name: 'i', code: 20 }
    ];

    let selCons = consonants[0];
    let selVow = vowels[0];

    function update() {
      // Hangul formula: 0xAC00 + (initial * 588) + (medial * 28)
      const code = 0xAC00 + (selCons.code * 588) + (selVow.code * 28);
      const syllable = String.fromCharCode(code);
      document.getElementById('result').textContent = syllable;
      document.getElementById('pronounce').textContent = selCons.name + selVow.name + ' (' + selCons.char + ' + ' + selVow.char + ')';

      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(syllable);
        u.lang = 'ko-KR';
        window.speechSynthesis.speak(u);
      }
    }

    const cDiv = document.getElementById('cons');
    consonants.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-lg';
      btn.textContent = c.char;
      btn.onclick = () => { selCons = c; update(); };
      cDiv.appendChild(btn);
    });

    const vDiv = document.getElementById('vow');
    vowels.forEach(v => {
      const btn = document.createElement('button');
      btn.className = 'w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-lg';
      btn.textContent = v.char;
      btn.onclick = () => { selVow = v; update(); };
      vDiv.appendChild(btn);
    });
  </script>
</body>
</html>`
  },
  {
    lang: 'coreano',
    cat: 'esercizi',
    file: 'livelli_onorifici.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Esercizi Coreano: I Livelli di Formalità (Banmal vs Jondaenmal)</title>
  <meta name="description" content="Allena la distinzione tra linguaggio informale (Banmal), cortese informale (-ayo/-eoyo) e formale formale (-seumnida).">
  <meta name="language" content="coreano">
  <meta name="category" content="esercizi">
  <meta name="difficulty" content="Intermedio">
  <meta name="keywords" content="coreano, grammatica, onorifico, formalita, jondaenmal">
  <meta name="icon" content="🎎">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8">
  <div class="max-w-2xl mx-auto">
    <header class="mb-6 pb-4 border-b border-slate-800">
      <span class="text-xs uppercase tracking-widest text-emerald-400 font-bold">🇰🇷 Coreano • Esercizi</span>
      <h1 class="text-2xl md:text-3xl font-extrabold text-white mt-1">Gradi di Cortesia</h1>
      <p class="text-sm text-slate-400 mt-1">Associa ciascuna frase al contesto relazionale corretto.</p>
    </header>

    <div class="space-y-4">
      <div class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
        <p class="text-lg font-bold text-white mb-2">밥 먹었어? (Bap meogeosseo?)</p>
        <p class="text-xs text-slate-400 mb-3">Con chi puoi usare questa espressione?</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-semibold">
          <button onclick="document.getElementById('fb1').textContent='✅ Corretto! È banmal (informale), adatto tra amici stretti o verso i più giovani.'; document.getElementById('fb1').className='p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs mt-3 block';" class="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-left">
            Amici stretti / Coetanei
          </button>
          <button onclick="document.getElementById('fb1').textContent='❌ Errore: troppo informale per un professore o estraneo!'; document.getElementById('fb1').className='p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-300 text-xs mt-3 block';" class="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-left">
            Professore / Capo
          </button>
        </div>
        <div id="fb1" class="hidden"></div>
      </div>

      <div class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
        <p class="text-lg font-bold text-white mb-2">식사하셨습니까? (Siksahasyeosseumnikka?)</p>
        <p class="text-xs text-slate-400 mb-3">Quale grado di cortesia rappresenta?</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-semibold">
          <button onclick="document.getElementById('fb2').textContent='✅ Corretto! È il massimo livello formale ed onorifico (Hasipsio-che).'; document.getElementById('fb2').className='p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs mt-3 block';" class="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-left">
            Alta formalità / Onorifico aziendale
          </button>
          <button onclick="document.getElementById('fb2').textContent='❌ Errore! Sarebbe eccessivamente formale per un fratello minore.'; document.getElementById('fb2').className='p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-300 text-xs mt-3 block';" class="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-left">
            Fratello minore in casa
          </button>
        </div>
        <div id="fb2" class="hidden"></div>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    lang: 'coreano',
    cat: 'grammatica',
    file: 'particelle_coreane.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grammatica Coreana: 은/는 (Topic) vs 이/가 (Subject)</title>
  <meta name="description" content="Spiegazione chiara della differenza tra le particelle di tema e le particelle di soggetto con esempi pratici.">
  <meta name="language" content="coreano">
  <meta name="category" content="grammatica">
  <meta name="difficulty" content="Intermedio">
  <meta name="keywords" content="coreano, particelle, eun, neun, i, ga, grammatica">
  <meta name="icon" content="📖">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8">
  <div class="max-w-3xl mx-auto">
    <header class="mb-6 pb-4 border-b border-slate-800">
      <span class="text-xs uppercase tracking-widest text-indigo-400 font-bold">🇰🇷 Coreano • Grammatica & Regole</span>
      <h1 class="text-2xl md:text-3xl font-extrabold text-white mt-1">은/는 vs 이/가: La Guida Definitiva</h1>
    </header>

    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
        <span class="text-amber-400 font-bold text-lg">은 / 는 (Tema & Contrasto)</span>
        <p class="text-sm text-slate-300 mt-2">Introduce il tema di conversazione ("Per quanto riguarda...") o evidenzia un contrasto.</p>
        <div class="mt-4 p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
          <strong>Regola fonetica:</strong><br>
          • Con consonante finale: <strong>은</strong> (es. 책 + 은 = 책은)<br>
          • Con vocale finale: <strong>는</strong> (es. 나 + 는 = 나는)
        </div>
      </div>

      <div class="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
        <span class="text-cyan-400 font-bold text-lg">이 / 가 (Soggetto & Nuova Info)</span>
        <p class="text-sm text-slate-300 mt-2">Mette in risalto CHI compie l'azione e risponde alla domanda "Chi o Cosa?".</p>
        <div class="mt-4 p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
          <strong>Regola fonetica:</strong><br>
          • Con consonante finale: <strong>이</strong> (es. 물 + 이 = 물이)<br>
          • Con vocale finale: <strong>가</strong> (es. 비 + 가 = 비가)
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    lang: 'coreano',
    cat: 'vocabolario',
    file: 'cibo_e_frasi.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vocabolario Coreano: Cibo, Ristorante ed Ordinare</title>
  <meta name="description" content="Tutto ciò che serve per ordinare cibo a Seoul: kimchi, bibimbap, acqua e chiedere il conto.">
  <meta name="language" content="coreano">
  <meta name="category" content="vocabolario">
  <meta name="difficulty" content="Principiante">
  <meta name="keywords" content="coreano, cibo, ristorante, frasi utili, ordinare">
  <meta name="icon" content="🍲">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8">
  <div class="max-w-3xl mx-auto">
    <header class="mb-6 pb-4 border-b border-slate-800">
      <span class="text-xs uppercase tracking-widest text-emerald-400 font-bold">🇰🇷 Coreano • Vocabolario</span>
      <h1 class="text-2xl md:text-3xl font-extrabold text-white mt-1">Al Ristorante a Seoul</h1>
    </header>

    <div class="grid sm:grid-cols-2 gap-4">
      <div class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
        <div class="text-2xl font-bold text-amber-300">물 좀 주세요</div>
        <div class="text-xs font-mono text-cyan-400 mt-1">Mul jom juseyo</div>
        <div class="text-sm text-slate-300 mt-2">Un po' d'acqua per favore.</div>
      </div>
      <div class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
        <div class="text-2xl font-bold text-amber-300">얼마예요?</div>
        <div class="text-xs font-mono text-cyan-400 mt-1">Eolmayeyo?</div>
        <div class="text-sm text-slate-300 mt-2">Quanto costa?</div>
      </div>
      <div class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
        <div class="text-2xl font-bold text-amber-300">맛있어요!</div>
        <div class="text-xs font-mono text-cyan-400 mt-1">Masisseoyo!</div>
        <div class="text-sm text-slate-300 mt-2">È delizioso!</div>
      </div>
      <div class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
        <div class="text-2xl font-bold text-amber-300">계산해 주세요</div>
        <div class="text-xs font-mono text-cyan-400 mt-1">Gyesanhae juseyo</div>
        <div class="text-sm text-slate-300 mt-2">Il conto, per favore.</div>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    lang: 'coreano',
    cat: 'letture',
    file: 'sera_a_seoul.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lettura Graduata: Una Sera sul Fiume Han</title>
  <meta name="description" content="Breve racconto graduato su una piacevole serata sul fiume Han con testo coreano e note a margine.">
  <meta name="language" content="coreano">
  <meta name="category" content="letture">
  <meta name="difficulty" content="Intermedio">
  <meta name="keywords" content="coreano, lettura, seoul, fiume han, testo">
  <meta name="icon" content="🌙">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8">
  <div class="max-w-2xl mx-auto">
    <header class="mb-6 pb-4 border-b border-slate-800 flex justify-between items-center">
      <div>
        <span class="text-xs uppercase tracking-widest text-indigo-400 font-bold">🇰🇷 Coreano • Letture</span>
        <h1 class="text-2xl md:text-3xl font-extrabold text-white mt-1">한강의 밤 (La Notte sul Fiume Han)</h1>
      </div>
      <button onclick="speak()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white">🔊 Ascolta</button>
    </header>

    <div class="space-y-4 text-slate-300">
      <div class="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
        <p class="text-xl text-white font-['Noto_Sans_KR']">
          날씨가 따뜻해서 친구들과 한강 공원에 갔습니다.
        </p>
        <p class="text-sm text-slate-400 mt-2">Dato che il tempo era mite, sono andato al parco del fiume Han con gli amici.</p>
      </div>

      <div class="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
        <p class="text-xl text-white font-['Noto_Sans_KR']">
          강변에서 라면을 먹고 자전거를 탔습니다.
        </p>
        <p class="text-sm text-slate-400 mt-2">Abbiamo mangiato ramen sulla riva del fiume e siamo andati in bicicletta.</p>
      </div>
    </div>
  </div>
  <script>
    function speak() {
      const text = "날씨가 따뜻해서 친구들과 한강 공원에 갔습니다. 강변에서 라면을 먹고 자전거를 탔습니다.";
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ko-KR';
        window.speechSynthesis.speak(u);
      }
    }
  </script>
</body>
</html>`
  },

  // ===================== RUSSO =====================
  {
    lang: 'russo',
    cat: 'giochi',
    file: 'cirillico_explorer.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cirillico Explorer: I Falsi Amici dell'Alfabeto Russo</title>
  <meta name="description" content="Gioco interattivo per imparare le lettere cirilliche che traggono in inganno (В = V, Р = R, Н = N, Х = H).">
  <meta name="language" content="russo">
  <meta name="category" content="giochi">
  <meta name="difficulty" content="Principiante">
  <meta name="keywords" content="russo, cirillico, alfabeto, falsi amici, quiz">
  <meta name="icon" content="🪆">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8 flex flex-col items-center">
  <div class="max-w-md w-full">
    <header class="mb-6 pb-3 border-b border-slate-800 text-center">
      <span class="text-xs uppercase tracking-widest text-amber-400 font-bold">🇷🇺 Russo • Giochi & Quiz</span>
      <h1 class="text-2xl font-black text-white mt-1">Falsi Amici del Cirillico</h1>
      <p class="text-xs text-slate-400 mt-1">Attento: queste lettere si scrivono come in italiano ma suonano diverse!</p>
    </header>

    <div class="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 text-center shadow-xl mb-4">
      <div id="cyr-letter" class="text-7xl font-black text-amber-300 py-4">В</div>
      <div class="text-xs text-slate-400 mb-4">Come si pronuncia in russo questa lettera?</div>
      <div id="choices" class="grid grid-cols-2 gap-3"></div>
      <div id="res" class="mt-4 text-xs font-bold h-5"></div>
    </div>
  </div>

  <script>
    const pairs = [
      { cyr: 'В', correct: 'V come Vaso', wrong: ['B come Barca', 'P come Pane', 'N come Notte'] },
      { cyr: 'Р', correct: 'R come Roma', wrong: ['P come Pietro', 'D come Dado', 'F come Fiume'] },
      { cyr: 'Н', correct: 'N come Notte', wrong: ['H come Hotel', 'M come Mare', 'K come Kiwi'] },
      { cyr: 'С', correct: 'S come Sole', wrong: ['C come Casa', 'G come Gatto', 'T come Torre'] },
      { cyr: 'Х', correct: 'Ch / H aspirata', wrong: ['X (Ics)', 'K forte', 'Z dolce'] }
    ];

    let currentIdx = 0;

    function renderRound() {
      const q = pairs[currentIdx];
      document.getElementById('cyr-letter').textContent = q.cyr;
      document.getElementById('res').textContent = '';

      const opts = [q.correct, ...q.wrong].sort(() => Math.random() - 0.5);
      const grid = document.getElementById('choices');
      grid.innerHTML = '';
      opts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'p-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold text-sm transition';
        btn.textContent = opt;
        btn.onclick = () => {
          if (opt === q.correct) {
            document.getElementById('res').textContent = '✅ Esatto!';
            document.getElementById('res').className = 'mt-4 text-xs font-bold text-emerald-400';
            setTimeout(() => {
              currentIdx = (currentIdx + 1) % pairs.length;
              renderRound();
            }, 800);
          } else {
            document.getElementById('res').textContent = '❌ No, riprova!';
            document.getElementById('res').className = 'mt-4 text-xs font-bold text-rose-400';
          }
        };
        grid.appendChild(btn);
      });
    }

    renderRound();
  </script>
</body>
</html>`
  },
  {
    lang: 'russo',
    cat: 'esercizi',
    file: 'casi_e_preposizioni.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Esercizi sui Casi Russi: Prepositivo vs Accusativo</title>
  <meta name="description" content="Allena la distinzione fondamentale tra stato in luogo (В/НА + Prepositivo) e moto a luogo (В/НА + Accusativo).">
  <meta name="language" content="russo">
  <meta name="category" content="esercizi">
  <meta name="difficulty" content="Intermedio">
  <meta name="keywords" content="russo, grammatica, casi, accusativo, prepositivo">
  <meta name="icon" content="✏️">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8">
  <div class="max-w-2xl mx-auto">
    <header class="mb-6 pb-4 border-b border-slate-800">
      <span class="text-xs uppercase tracking-widest text-emerald-400 font-bold">🇷🇺 Russo • Esercizi</span>
      <h1 class="text-2xl md:text-3xl font-extrabold text-white mt-1">Stato in Luogo o Moto a Luogo?</h1>
    </header>

    <div class="space-y-4">
      <div class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
        <p class="text-lg font-bold text-white mb-2">Я иду в [ ? ] (Vado al parco - moto a luogo)</p>
        <div class="flex gap-2">
          <button onclick="document.getElementById('rfb1').textContent='✅ Esatto! Sostantivo inanimato maschile all accusativo resta invariato: парк.'; document.getElementById('rfb1').className='p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs mt-3 block';" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold">парк</button>
          <button onclick="document.getElementById('rfb1').textContent='❌ Errore! парке è il prepositivo, usato per lo stato in luogo (Я в парке).'; document.getElementById('rfb1').className='p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-300 text-xs mt-3 block';" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold">парке</button>
        </div>
        <div id="rfb1" class="hidden"></div>
      </div>
      <div class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
        <p class="text-lg font-bold text-white mb-2">Я сейчас в [ ? ] (Ora sono a scuola - stato in luogo)</p>
        <div class="flex gap-2">
          <button onclick="document.getElementById('rfb2').textContent='✅ Esatto! In prepositivo школу diventa школе.'; document.getElementById('rfb2').className='p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs mt-3 block';" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold">школе</button>
          <button onclick="document.getElementById('rfb2').textContent='❌ Errore! школу è all accusativo, usato per il moto a luogo (Иду в школу).'; document.getElementById('rfb2').className='p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-300 text-xs mt-3 block';" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold">школу</button>
        </div>
        <div id="rfb2" class="hidden"></div>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    lang: 'russo',
    cat: 'grammatica',
    file: 'verbi_di_moto.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verbi di Moto Russi: Idti vs Khodit', Ekhat' vs Ezdit'</title>
  <meta name="description" content="Guida visiva completa ai verbi di movimento unidirezionali e pluridirezionali (a piedi e con un mezzo).">
  <meta name="language" content="russo">
  <meta name="category" content="grammatica">
  <meta name="difficulty" content="Intermedio">
  <meta name="keywords" content="russo, verbi di moto, idti, khodit, grammatica">
  <meta name="icon" content="🚂">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8">
  <div class="max-w-3xl mx-auto">
    <header class="mb-6 pb-4 border-b border-slate-800">
      <span class="text-xs uppercase tracking-widest text-indigo-400 font-bold">🇷🇺 Russo • Grammatica & Regole</span>
      <h1 class="text-2xl md:text-3xl font-extrabold text-white mt-1">I Verbi di Moto Russi</h1>
    </header>

    <div class="grid md:grid-cols-2 gap-4">
      <div class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-amber-300">A Piedi (Пешком)</h3>
        <ul class="text-sm space-y-2 mt-3 text-slate-300">
          <li><strong>идти:</strong> Moto unidirezionale in corso ora (Я иду на работу).</li>
          <li><strong>ходить:</strong> Andata e ritorno, abitudine o movimento ripetuto (Я каждый день хожу на работу).</li>
        </ul>
      </div>

      <div class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-cyan-300">Con Mezzo (На транспорте)</h3>
        <ul class="text-sm space-y-2 mt-3 text-slate-300">
          <li><strong>ехать:</strong> Unidirezionale in corso ora (Мы едем в Москву).</li>
          <li><strong>ездить:</strong> Andata e ritorno o abitudine (Летом мы часто ездим на море).</li>
        </ul>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    lang: 'russo',
    cat: 'vocabolario',
    file: 'saluti_e_frasi_chiave.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vocabolario Russo: Saluti, Cortesia e Frasi Essenziali</title>
  <meta name="description" content="Impara i saluti russi formali ed informali con accenti tonici, trascrizione e audio.">
  <meta name="language" content="russo">
  <meta name="category" content="vocabolario">
  <meta name="difficulty" content="Principiante">
  <meta name="keywords" content="russo, saluti, vocabolario, audio, frasi">
  <meta name="icon" content="🗂️">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8">
  <div class="max-w-3xl mx-auto">
    <header class="mb-6 pb-4 border-b border-slate-800">
      <span class="text-xs uppercase tracking-widest text-emerald-400 font-bold">🇷🇺 Russo • Vocabolario</span>
      <h1 class="text-2xl md:text-3xl font-extrabold text-white mt-1">Saluti & Cortesia in Russo</h1>
    </header>

    <div class="grid sm:grid-cols-2 gap-4">
      <div class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
        <div class="text-2xl font-bold text-white">Здравствуйте</div>
        <div class="text-xs font-mono text-amber-300 mt-1">Zdrávstvuyte (Formale)</div>
        <div class="text-sm text-slate-400 mt-2">Buongiorno / Salve</div>
      </div>
      <div class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
        <div class="text-2xl font-bold text-white">Привет</div>
        <div class="text-xs font-mono text-amber-300 mt-1">Privét (Informale)</div>
        <div class="text-sm text-slate-400 mt-2">Ciao</div>
      </div>
      <div class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
        <div class="text-2xl font-bold text-white">Спасибо</div>
        <div class="text-xs font-mono text-amber-300 mt-1">Spasíbo</div>
        <div class="text-sm text-slate-400 mt-2">Grazie</div>
      </div>
      <div class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
        <div class="text-2xl font-bold text-white">Пожалуйста</div>
        <div class="text-xs font-mono text-amber-300 mt-1">Pozháluysta</div>
        <div class="text-sm text-slate-400 mt-2">Per favore / Prego</div>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    lang: 'russo',
    cat: 'letture',
    file: 'viaggio_sul_baikal.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lettura Graduata: Il Lago Baikal d'Inverno</title>
  <meta name="description" content="Racconto in lingua russa con accenti e traduzione sul lago più profondo della Terra.">
  <meta name="language" content="russo">
  <meta name="category" content="letture">
  <meta name="difficulty" content="Intermedio">
  <meta name="keywords" content="russo, lettura, baikal, inverno, siberia">
  <meta name="icon" content="❄️">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8">
  <div class="max-w-2xl mx-auto">
    <header class="mb-6 pb-4 border-b border-slate-800 flex justify-between items-center">
      <div>
        <span class="text-xs uppercase tracking-widest text-cyan-400 font-bold">🇷🇺 Russo • Letture</span>
        <h1 class="text-2xl md:text-3xl font-extrabold text-white mt-1">Озеро Байкал (Il Lago Baikal)</h1>
      </div>
      <button onclick="speak()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white">🔊 Ascolta</button>
    </header>

    <div class="space-y-4 text-slate-300">
      <div class="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
        <p class="text-lg text-white">
          Байка́л — са́мое глубо́кое и древнее о́зеро в ми́ре.
        </p>
        <p class="text-sm text-slate-400 mt-2">Il Baikal è il lago più profondo e antico del mondo.</p>
      </div>

      <div class="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
        <p class="text-lg text-white">
          Зимо́й лёд на Байка́ле прозра́чный, как стекло́.
        </p>
        <p class="text-sm text-slate-400 mt-2">D'inverno il ghiaccio sul Baikal è trasparente come il vetro.</p>
      </div>
    </div>
  </div>
  <script>
    function speak() {
      const text = "Байкал — самое глубокое и древнее озеро в мире. Зимой лёд на Байкале прозрачный, как стекло.";
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ru-RU';
        window.speechSynthesis.speak(u);
      }
    }
  </script>
</body>
</html>`
  },

  // ===================== ALTRE LINGUE =====================
  {
    lang: 'altre',
    cat: 'giochi',
    file: 'inglese_idiom_quest.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Idiom Quest: I Modi di Dire Inglesi</title>
  <meta name="description" content="Indovina il vero significato dei modi di dire inglesi più comuni (Piece of cake, Break a leg, Once in a blue moon).">
  <meta name="language" content="altre">
  <meta name="category" content="giochi">
  <meta name="difficulty" content="Intermedio">
  <meta name="keywords" content="inglese, idioms, modi di dire, quiz, gioco">
  <meta name="icon" content="🎭">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8 flex flex-col items-center">
  <div class="max-w-md w-full">
    <header class="mb-6 pb-3 border-b border-slate-800 text-center">
      <span class="text-xs uppercase tracking-widest text-emerald-400 font-bold">🌐 Altre Lingue • Inglese</span>
      <h1 class="text-2xl font-black text-white mt-1">English Idiom Quest</h1>
    </header>

    <div class="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 text-center shadow-xl mb-4">
      <div class="text-xs text-slate-400 mb-2">CHE COSA SIGNIFICA:</div>
      <div id="idiom" class="text-2xl font-bold text-amber-300 py-3">"A piece of cake"</div>
      <div id="opts" class="grid gap-2 mt-4"></div>
      <div id="res" class="mt-4 text-xs font-bold h-5"></div>
    </div>
  </div>

  <script>
    const questions = [
      { idm: '"A piece of cake"', correct: 'Qualcosa di estremamente facile', wrong: ['Una fetta di torta gratis', 'Una situazione complicata'] },
      { idm: '"Break a leg!"', correct: 'Buona fortuna (in teatro/spettacoli)', wrong: ['Augurare una frattura', 'Sbrigati subito'] },
      { idm: '"Once in a blue moon"', correct: 'Molto raramente / quasi mai', wrong: ['Ogni mese di notte', 'Quando c è brutto tempo'] }
    ];
    let cur = 0;

    function render() {
      const q = questions[cur];
      document.getElementById('idiom').textContent = q.idm;
      document.getElementById('res').textContent = '';
      const list = [q.correct, ...q.wrong].sort(() => Math.random() - 0.5);
      const div = document.getElementById('opts');
      div.innerHTML = '';
      list.forEach(o => {
        const b = document.createElement('button');
        b.className = 'p-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-sm transition text-left';
        b.textContent = o;
        b.onclick = () => {
          if (o === q.correct) {
            document.getElementById('res').textContent = '✅ Corretto!';
            document.getElementById('res').className = 'mt-4 text-xs font-bold text-emerald-400';
            setTimeout(() => { cur = (cur + 1) % questions.length; render(); }, 800);
          } else {
            document.getElementById('res').textContent = '❌ Sbagliato!';
            document.getElementById('res').className = 'mt-4 text-xs font-bold text-rose-400';
          }
        };
        div.appendChild(b);
      });
    }
    render();
  </script>
</body>
</html>`
  },
  {
    lang: 'altre',
    cat: 'grammatica',
    file: 'guida_tempi_passati.html',
    content: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grammatica Inglese: Past Simple vs Present Perfect</title>
  <meta name="description" content="Come scegliere senza esitazione tra Past Simple (tempo finito) e Present Perfect (connessione col presente).">
  <meta name="language" content="altre">
  <meta name="category" content="grammatica">
  <meta name="difficulty" content="Intermedio">
  <meta name="keywords" content="inglese, past simple, present perfect, grammatica">
  <meta name="icon" content="⏱️">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8">
  <div class="max-w-3xl mx-auto">
    <header class="mb-6 pb-4 border-b border-slate-800">
      <span class="text-xs uppercase tracking-widest text-purple-400 font-bold">🌐 Altre Lingue • Inglese</span>
      <h1 class="text-2xl md:text-3xl font-extrabold text-white mt-1">Past Simple vs Present Perfect</h1>
    </header>

    <div class="grid md:grid-cols-2 gap-4">
      <div class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-amber-300">Past Simple</h3>
        <p class="text-sm text-slate-300 mt-2">Azione conclusa in un tempo passato finito e definito (yesterday, in 2020, ago).</p>
        <p class="text-xs text-slate-400 mt-3 font-mono">I visited Kyoto in 2019.</p>
      </div>
      <div class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-cyan-300">Present Perfect</h3>
        <p class="text-sm text-slate-300 mt-2">Esperienza di vita fino ad oggi o azione passata con effetto sul presente (ever, never, just, already).</p>
        <p class="text-xs text-slate-400 mt-3 font-mono">I have visited Kyoto twice.</p>
      </div>
    </div>
  </div>
</body>
</html>`
  }
];

files.forEach(f => {
  const dir = path.join(baseDir, f.lang, f.cat);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, f.file);
  fs.writeFileSync(filePath, f.content.trim(), 'utf8');
  console.log('Created:', path.relative(path.resolve(), filePath));
});

console.log('All sample language HTML sheets created successfully!');
