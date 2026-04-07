# Codex Prompt — Kanji Chain Drill Rewrite

## Context

You are working on `tmux-trainer`, a tower defense game where enemies are quiz questions. The game currently has an AP Stats cartridge (81 formula commands) and a Japanese cartridge (1,186 commands across kana + kanji G1-G6). The kanji cartridges use a complex 5-type question system with DAG decomposition, multiple banks (VARIABLE, APPLICATION, RELATIONSHIP), and radical-based prereqs.

We are **radically simplifying** the kanji learning model to a clean 3-step chain per kanji. Read `kanji-chain-spec.md` for the full design. This prompt covers the implementation.

## Task Overview

Two parts:
1. **Engine**: Add chain question support to `index.html` (additive — does not break AP Stats)
2. **Cartridge**: Rewrite `kanji-g1-cartridge-v2.js` as the first grade using the new chain format

After G1 is validated, the same pattern will be applied to G2-G6 in follow-up tasks.

## Part 1: Engine — Chain Question Support

### Files to modify

- `index.html` (the game engine, ~4,800 lines inline JS)

### What to add

#### 1a. Chain enemy state initialization

In the enemy creation code (search for where enemies are pushed onto `G.enemies`), when a command has a `chain` property:

```javascript
enemy.chainStep = 0;
enemy.chainMisses = [0, 0, 0];
```

#### 1b. Chain question rendering in `setInputPanelContent()`

When the selected enemy's command has a `.chain` array, render a chain question instead of the normal identify/fillblank/variable/application/relationship flow.

Build the input panel HTML:

```javascript
if (cmd.chain) {
  const step = enemy.chainStep || 0;
  const ch = cmd.chain[step];
  const stepLabels = ['reading', 'romaji', 'meaning'];
  const dots = cmd.chain.map((_, i) => i <= step ? '●' : '○').join(' ');

  // Prompt: large centered text
  // For step 0 (kanji), render via KaTeX. For steps 1-2, plain large text.
  const promptHtml = step === 0
    ? `<div class="latex-shell"><div class="latex-scroll chain-prompt">${renderLatex(ch.prompt)}</div></div>`
    : `<div class="chain-prompt">${ch.prompt}</div>`;

  // Step indicator
  const indicatorHtml = `<div class="chain-dots">${dots} <span class="chain-label">${stepLabels[step]}</span></div>`;

  // Shuffle options
  const options = [{ text: ch.correct, isCorrect: true }, ...ch.wrong.map(w => ({ text: w, isCorrect: false }))];
  shuffleArray(options);

  // 3 MC buttons (reuse existing .quiz-opt styling)
  const buttonsHtml = options.map((opt, i) => {
    const letter = ['A', 'B', 'C'][i];
    return `<button class="btn quiz-opt" data-chain-idx="${i}" data-correct="${opt.isCorrect}" onclick="handleChainChoice(${i}, ${opt.isCorrect})">[${letter}] ${opt.text}</button>`;
  }).join('');

  headerHtml = promptHtml + indicatorHtml;
  bodyHtml = `<div class="chain-options">${buttonsHtml}</div>`;
}
```

Place this BEFORE the existing question-type branching. The `cmd.chain` check gates it cleanly.

#### 1c. `handleChainChoice(idx, isCorrect)` — new function

```javascript
function handleChainChoice(idx, isCorrect) {
  const enemy = G.enemies.find(e => e.id === G.selectedId);
  if (!enemy) return;
  const cmd = enemy.command || activeCartridge.commands.find(c => c.id === enemy.cmdId);
  if (!cmd || !cmd.chain) return;

  if (isCorrect) {
    enemy.chainStep++;

    // BKT update — weight by step (recognition hardest)
    const weights = [1.0, 0.7, 0.5];
    bktUpdate(enemy.cmdId, { correct: true, bktWeight: weights[enemy.chainStep - 1] || 0.5 });

    if (enemy.chainStep >= cmd.chain.length) {
      // Full chain complete — kill the enemy
      handleHit(enemy);
    } else {
      // Advance to next step — green flash + re-render
      SFX.play && SFX.play('hit');  // small audio cue
      setInputPanelContent();  // re-render with new step
    }
  } else {
    // Wrong answer
    const step = enemy.chainStep || 0;
    enemy.chainMisses[step] = (enemy.chainMisses[step] || 0) + 1;

    // Miss cap: step 0 = 2 misses, steps 1-2 = 3 misses
    const cap = step === 0 ? 2 : 3;
    if (enemy.chainMisses[step] >= cap) {
      // Forced breach
      handleBreach(enemy);
      return;
    }

    // Standard miss handling (surge, speed boost, tree penalty for L0)
    // Only penalize tree depth on step 0 misses
    handleMiss(enemy, { skipDAG: true, skipTreePenalty: step > 0 });

    // Reshuffle wrongs from grade pool and re-render
    reshuffleChainWrongs(enemy, cmd);
    setInputPanelContent();
  }
}
```

#### 1d. `reshuffleChainWrongs(enemy, cmd)` — new function

After a wrong answer, replace the 2 wrong options with fresh ones from the same grade pool:

```javascript
function reshuffleChainWrongs(enemy, cmd) {
  const step = enemy.chainStep || 0;
  const ch = cmd.chain[step];
  const correct = ch.correct;

  // Gather all options of the same type from same-grade commands
  const gradeCommands = activeCartridge.commands.filter(c => c.dom === cmd.dom && c.chain && c.id !== cmd.id);
  let pool;
  if (step === 0) pool = gradeCommands.map(c => c.chain[0].correct);       // furigana
  else if (step === 1) pool = gradeCommands.map(c => c.chain[1].correct);  // romaji
  else pool = gradeCommands.map(c => c.chain[2].correct);                   // english

  pool = [...new Set(pool)].filter(x => x !== correct);
  shuffleArray(pool);
  ch.wrong = pool.slice(0, 2);

  // Fallback: if pool too small, keep originals
  if (ch.wrong.length < 2) ch.wrong = cmd.chain[step].wrong || ch.wrong;
}
```

**Important**: mutate `ch.wrong` on the enemy's working copy, not the cartridge source. Clone the chain into the enemy at spawn time.

#### 1e. Chain clone at enemy spawn

When creating an enemy from a chain command, deep-clone the chain so reshuffles don't corrupt the source:

```javascript
if (cmd.chain) {
  enemy.chain = cmd.chain.map(step => ({
    ...step,
    wrong: [...step.wrong]
  }));
}
```

Then `handleChainChoice` reads `enemy.chain` instead of `cmd.chain`.

#### 1f. Keyboard handler for chain

In the keyboard handler (A/B/C keys for MC), add a chain branch:

```javascript
// Inside keydown handler, after checking for quiz mode:
if (selectedCmd && selectedCmd.chain) {
  if (['a','b','c'].includes(key)) {
    const idx = key.charCodeAt(0) - 97; // a=0, b=1, c=2
    // Find which button is at this index and its correctness
    const buttons = document.querySelectorAll('.chain-options .quiz-opt');
    if (buttons[idx]) buttons[idx].click();
  }
  return;
}
```

#### 1g. Compound gating in `pickCommands()`

In `pickCommands()`, skip commands with `requires` where prereqs aren't mastered:

```javascript
if (cmd.requires) {
  const ready = cmd.requires.every(reqId => {
    const card = srs[reqId];
    return card && card.pKnown >= 0.5;
  });
  if (!ready) continue;
}
```

#### 1h. CSS for chain display

Add after existing input panel CSS:

```css
.chain-prompt { font-size: 3rem; text-align: center; padding: 0.5rem 0; }
.chain-dots { text-align: center; font-size: 1.2rem; color: var(--amb); margin: 0.3rem 0; letter-spacing: 0.3em; }
.chain-dots .chain-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.7; margin-left: 0.5em; }
.chain-options { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.5rem; }
.chain-options .quiz-opt { font-size: 1.3rem; min-height: 56px; }
@media (max-width:600px) {
  .chain-prompt { font-size: 2.4rem; }
  .chain-options .quiz-opt { font-size: 1.1rem; }
}
```

### What NOT to change

- `generateQuestion()` — only used for non-chain commands (AP Stats, kana)
- `handleQuizChoice()` — existing path for non-chain MC
- `handlePrereqChoice()` — not used by chain
- Hydra/DAG system — not touched, still works for AP Stats
- `setInputPanelContent()` existing branches — chain check goes FIRST, falls through to existing code

## Part 2: Cartridge — Rewrite kanji-g1-cartridge-v2.js

### Current file

`kanji-g1-cartridge-v2.js` (~1,883 lines) — 80 Grade 1 kanji with complex banks, DAG nodes, wireL1toL2, subconcepts, blanks, variable/application/relationship banks, explanation glossary.

### New file

Complete rewrite. ~600-900 lines. The file exports `window.KANJI_G1_DATA` (same export pattern as current).

### Structure

```javascript
(function() {
  'use strict';

  // ── Source Data ──────────────────────────────────────────

  // [kanji, hiragana, romaji, english, tier]
  // Distractors auto-selected from grade pool when omitted
  const KANJI = [
    ['一', 'いち', 'ichi', 'one', 'core'],
    ['二', 'に', 'ni', 'two', 'core'],
    ['三', 'さん', 'san', 'three', 'core'],
    ['四', 'よん', 'yon', 'four', 'core'],
    ['五', 'ご', 'go', 'five', 'core'],
    ['六', 'ろく', 'roku', 'six', 'core'],
    ['七', 'なな', 'nana', 'seven', 'core'],
    ['八', 'はち', 'hachi', 'eight', 'core'],
    ['九', 'きゅう', 'kyuu', 'nine', 'core'],
    ['十', 'じゅう', 'juu', 'ten', 'core'],
    // ... all 80 Grade 1 kanji
    // Use the MOST COMMON reading (kun'yomi for standalone, on'yomi where kun is rare)
    // For kanji with multiple common readings, use the one taught first in Japanese schools
  ];

  // [compound, hiragana, romaji, english, [componentIds], tier]
  const COMPOUNDS = [
    ['一日', 'いちにち', 'ichinichi', 'one day', ['k-4e00', 'k-65e5'], 'regular'],
    ['大人', 'おとな', 'otona', 'adult', ['k-5927', 'k-4eba'], 'regular'],
    ['山川', 'やまかわ', 'yamakawa', 'mountains and rivers', ['k-5c71', 'k-5ddd'], 'regular'],
    // ... ~120 compounds from standard G1 jukugo lists
    // Source: existing hint fields + standard elementary school vocabulary
  ];

  // ── Builder ──────────────────────────────────────────────

  function kanjiId(char) {
    return 'k-' + char.codePointAt(0).toString(16);
  }

  function compoundId(chars) {
    return 'kc-' + [...chars].map(c => c.codePointAt(0).toString(16)).join('-');
  }

  function pickWrongs(pool, correctValue, count) {
    const filtered = pool.filter(x => x !== correctValue);
    // Shuffle and take `count`
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    return filtered.slice(0, count);
  }

  function buildCommands() {
    const allFurigana = KANJI.map(r => r[1]);
    const allRomaji = KANJI.map(r => r[2]);
    const allEnglish = KANJI.map(r => r[3]);

    // Build individual kanji commands
    const kanjiCmds = KANJI.map(([kanji, furi, roma, eng, tier]) => ({
      id: kanjiId(kanji),
      action: eng,
      tier: tier,
      dom: 'g1',
      latex: kanji,
      chain: [
        { type: 'kanji-to-furigana', prompt: kanji, correct: furi, wrong: pickWrongs(allFurigana, furi, 2) },
        { type: 'furigana-to-romaji', prompt: furi, correct: roma, wrong: pickWrongs(allRomaji, roma, 2) },
        { type: 'romaji-to-english', prompt: roma, correct: eng, wrong: pickWrongs(allEnglish, eng, 2) }
      ]
    }));

    // Build compound commands
    const compFurigana = COMPOUNDS.map(r => r[1]);
    const compRomaji = COMPOUNDS.map(r => r[2]);
    const compEnglish = COMPOUNDS.map(r => r[3]);

    const compoundCmds = COMPOUNDS.map(([comp, furi, roma, eng, reqIds, tier]) => ({
      id: compoundId(comp),
      action: eng,
      tier: tier,
      dom: 'g1',
      latex: comp,
      chain: [
        { type: 'kanji-to-furigana', prompt: comp, correct: furi, wrong: pickWrongs(compFurigana, furi, 2) },
        { type: 'furigana-to-romaji', prompt: furi, correct: roma, wrong: pickWrongs(compRomaji, roma, 2) },
        { type: 'romaji-to-english', prompt: roma, correct: eng, wrong: pickWrongs(compEnglish, eng, 2) }
      ],
      requires: reqIds
    }));

    return kanjiCmds.concat(compoundCmds);
  }

  // ── Export ───────────────────────────────────────────────

  window.KANJI_G1_DATA = {
    id: 'g1',
    name: 'Grade 1',
    domLabels: { g1: ['Grade 1 (一年)'] },
    commands: buildCommands(),
    // No banks, no DAG, no wireL1toL2 — chain is the entire pedagogy
    sharedPrereqNodes: {},
    wireL1toL2: function() {}
  };
})();
```

### Kanji data to include

All 80 Grade 1 kanji. Use the primary reading taught in Japanese elementary schools. Reference the existing `kanji-g1-cartridge-v2.js` command list for the 80 kanji characters and their meanings, but simplify to one primary reading each.

**Reading selection rule**: Use the most commonly taught standalone reading. For number kanji, use on'yomi (いち, に, さん). For nature/object kanji (山, 川, 花), use kun'yomi (やま, かわ, はな). When in doubt, use the reading that appears first in standard G1 curriculum materials.

### Compound data to include

~100-120 common Grade 1 jukugo. Source these from:
1. The `hint` fields in the current `kanji-g1-cartridge-v2.js` (each has example compounds)
2. Standard elementary school vocabulary lists
3. Only include compounds where ALL component kanji are in the G1 set

### Merger file update (kanji-joyo-cartridge.js)

Simplify the merger — no more bank merging, DAG wiring, or glossary building:

```javascript
// Build unified commands from all grades
const allCommands = [];
const allDomLabels = {};
[KANA_DATA, KANJI_G1_DATA, KANJI_G2_DATA, ...].forEach(src => {
  allCommands.push(...src.commands);
  Object.assign(allDomLabels, src.domLabels);
});
```

The kana cartridge (`KANA_DATA`) keeps its existing format — it doesn't use chains. The engine handles both chain and non-chain commands in the same deck.

## Validation

After implementation, verify:

1. `node --check kanji-g1-cartridge-v2.js` — JS parses clean
2. 80 individual kanji commands, each with 3 chain steps
3. ~100-120 compound commands, each with 3 chain steps + `requires`
4. Every `requires` ID exists as a kanji command ID
5. No duplicate command IDs
6. Every chain step has exactly 2 wrongs
7. No wrong answer duplicates the correct answer in any step
8. All furigana are valid hiragana strings
9. All romaji are valid romanizations of the furigana
10. Browser smoke test: load index.html, select Japanese deck, filter to G1, start game, verify chain question renders with 3 MC buttons and step dots

## Constraints

- Do NOT modify `ap-stats-cartridge.js`
- Do NOT modify `kana-cartridge.js`
- Do NOT remove the non-chain question rendering in `index.html` — it must still work for AP Stats and kana
- Keep the `window.KANJI_G1_DATA` export shape compatible with `kanji-joyo-cartridge.js` merger
- Chain check in engine: `if (cmd.chain)` — simple, no new cartridge-level flag needed
- Bump SW cache version in `sw.js`
