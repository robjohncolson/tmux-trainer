# Codex Prompt: Kana Cartridge v2 — Learn Hiragana Through G1 Vocabulary

## Context

You are working in the `tmux-trainer` project. Read the full spec in `kana-vocab-spec.md`.

**Key reference files** (read before writing code):
- `kana-vocab-spec.md` — the specification (read this FIRST)
- `kanji-g1-cartridge-v2.js` — data source: extract all vocabulary words with hiragana readings
- `kana-cartridge.js` — the file you will REPLACE (keep the same filename)
- `cartridge-authoring-guide.md` — engine contract
- `validate-cartridge.js` — validator
- `kanji-joyo-cartridge.js` — the merger that pulls kana in via `window.KANA_DATA`

## Task: Rewrite `kana-cartridge.js`

Replace the current kana cartridge (208 isolated characters) with a vocabulary-driven deck where students read G1 words in hiragana and answer with English meanings.

### Step 1: Extract G1 Vocabulary

Read `kanji-g1-cartridge-v2.js` and extract every vocabulary word with its hiragana reading and English meaning. Sources:

1. **Hint field**: `例: KANJI_WORD (HIRAGANA_READING)` — 1 per kanji
2. **Reading subconcepts**: `In COMPOUND (GLOSS), what is the reading?` — correct answer is the hiragana reading
3. **Meaning subconcepts**: `What does COMPOUND mean?` — correct answer is the English meaning
4. **Kun-yomi from hints**: `くん: READING` — standalone readings

Compile these into a source array. Each entry:
```javascript
['みぎて', 'migite', 'right hand', '右手', 'k-53f3', 'core']
// [hiragana, romaji, english, kanji_form, source_kanji_id, tier]
```

Deduplicate by hiragana reading. Target: 120-160 unique vocabulary words.

**Coverage check**: After extraction, list all unique hiragana characters used. If any of the 46 basic hiragana or 25 common voiced hiragana are missing, add supplementary beginner words to fill gaps. Good supplementary words:

- Greetings: おはよう/ohayo/good morning, こんにちは/konnichiwa/hello, ありがとう/arigatou/thank you, さようなら/sayounara/goodbye, すみません/sumimasen/excuse me
- Classroom: せんせい/sensei/teacher, きょうしつ/kyoushitsu/classroom
- Food: おべんとう/obentou/lunch box, おちゃ/ocha/tea
- Time: あした/ashita/tomorrow, きのう/kinou/yesterday
- Other: ともだち/tomodachi/friend, おとうさん/otousan/father, おかあさん/okaasan/mother

### Step 2: Build Commands

Use the same IIFE + source-array pattern as the kanji cartridges. For each vocabulary entry, generate:

```javascript
{
  id: 'kv-' + hiragana.charCodeAt(0).toString(16) + '-' + hiragana.length,
  action: english,          // 'right hand'
  tier: tier,               // 'core' or 'regular'
  dom: 'kana',              // single domain, remapped by joyo merger
  latex: hiragana,          // 'みぎて' — what the student sees
  hint: 'Kanji: ' + kanjiForm + ' | Romaji: ' + romaji,
  explain: 'Component breakdown + usage note',
  blanks: [/* 2 blanks: fill missing hiragana in the word */],
  subconcepts: [
    // SC1: word → romaji
    { q: 'What is the romaji for ' + hiragana + '?', correct: romaji, wrong: [/* 2 plausible romaji */] },
    // SC2: individual kana → romaji (pick the trickiest kana in the word)
    { q: 'What is the romaji for ' + trickiestKana + '?', correct: kanaRomaji, wrong: [/* same-row confusables */] },
    // SC3: reverse — English → hiragana
    { q: 'Which word means "' + english + '"?', correct: hiragana, wrong: [/* 2 semantically similar words */] },
  ]
}
```

### Blank construction

For each command, create 2 blanks by removing different hiragana from the word:

```javascript
function buildBlank(word, position) {
  const chars = [...word];
  const removed = chars[position];
  chars[position] = '□';
  return {
    latex: chars.join(''),
    answer: removed,
    choices: [removed, ...getSameRowDistractors(removed, 2)]
  };
}
```

Pick positions that target different kana (e.g., first and last character, or the hardest character).

Blank distractors should be:
1. First: same-row kana (み → め, む)
2. Fallback: voiced/unvoiced pair (ぎ → き, じ)
3. Last resort: any hiragana from the same column

### Romaji subconcept wrong answers (SC1)

Wrong romaji should be plausible misreadings:
- Swap one syllable (migite → migime, hidari)
- Use a word from the same semantic group (right hand → left hand, right foot)

### Individual kana subconcept (SC2)

Pick the "trickiest" kana in each word using this priority:
1. Voiced kana (ぎ, ず, ど, etc.) — students often confuse voiced/unvoiced
2. Confusable kana (は/ほ, ぬ/め, る/ろ, etc.)
3. Less common kana (ぬ, む, ゆ, etc.)
4. First kana as fallback

Wrong answers: same-row kana or voiced/unvoiced pair.

### Reverse subconcept wrong answers (SC3)

Wrong hiragana words from the same semantic group:
- みぎて (right hand) → ひだりて (left hand), みぎあし (right foot)
- いちにち (one day) → ふつか (two days), いちねん (one year)

Build semantic groups from the G1 vocabulary (numbers, directions, body parts, nature, school, family, etc.)

### Step 3: Build Banks

**VARIABLE_BANK**: Decompose each word into meaningful morphemes:
```javascript
'kv-XXXX': [
  { s: 'みぎ', d: 'right (direction)' },
  { s: 'て', d: 'hand (body part)' },
]
```

**APPLICATION_BANK**: 1 context scenario per word. Do NOT include the English meaning in the scenario. Use confusionSets from the same semantic group.

**EXPLANATION_GLOSSARY**: 1 entry per word with meaning, kanji form, romaji, component breakdown.

**RELATIONSHIP_BANK**: `{}`
**AUTO_BLANK_SPECS**: `[]`
**DOM_LABELS**: `{ 'kana': ['Kana Reading (ひらがな)'] }`

### Step 4: Build DAG

#### L2: Individual Hiragana Nodes (~65 nodes)

One node per unique hiragana character that appears in any vocabulary word:

```javascript
'hira-3042': {  // あ = U+3042
  id: 'hira-3042', type: 'conceptual', level: 2,
  q: 'What is the romaji for あ?',
  correct: 'a',
  wrong: ['o', 'e'],  // same-row confusables
  prereqs: ['row-a']
},
```

Generate these programmatically: scan all commands, collect unique hiragana characters, build a node for each. Use same-row kana as wrong answers.

Node ID scheme: `hira-{hex codepoint}` (e.g., `hira-304f` for み).

#### L3: Row Nodes (10 nodes)

```javascript
'row-a': { id: 'row-a', level: 3, q: 'Name the a-row sounds', correct: 'a i u e o', wrong: ['ka ki ku ke ko', 'sa shi su se so'], prereqs: ['kana-foundation'] },
'row-k': { id: 'row-k', level: 3, q: 'Name the k-row sounds', correct: 'ka ki ku ke ko', wrong: ['sa shi su se so', 'ta chi tsu te to'], prereqs: ['kana-foundation'] },
// ... 10 total (a, k, s, t, n, h, m, y, r, w)
```

#### L3: Voicing Nodes (4 nodes)

```javascript
'voicing-k-g': { level: 3, q: 'What does dakuten do to k-row?', correct: 'Changes K to G', wrong: ['Changes K to S', 'Changes K to T'], prereqs: ['kana-foundation'] },
// ... s→z, t→d, h→b
```

#### L3: Confusable Discrimination Nodes (5-8 nodes)

For the classic hiragana confusion pairs:
- は/ほ, ぬ/め, き/さ, わ/ね/れ, る/ろ, い/り, あ/お, う/つ

#### L4: Foundation

```javascript
'kana-foundation': { id: 'kana-foundation', level: 4, q: 'What are Japanese phonetic scripts?', correct: 'Hiragana and Katakana', wrong: ['Kanji and Romaji', 'Latin and Greek'], prereqs: [] },
```

#### Total: ~85 nodes

### Step 5: wireL1toL2

Route subconcept misses to DAG nodes based on the question content:

```javascript
function wireL1toL2(PREREQ_DAG) {
  const rules = [
    // SC1: word romaji → route to row nodes of constituent kana
    // (dynamic: parse kana from question, map to row nodes)
    
    // SC2: individual kana romaji → route to specific hira-XXXX node
    // (dynamic: extract the kana character from the question)
    
    // SC3: meaning reverse → vocabulary foundation
    [/which word means/i, ['kana-foundation']],
    
    // Row rules (fallback)
    [/a-row|vowel/i, ['row-a']],
    [/k-row/i, ['row-k']],
    // ... etc
    
    // Voicing
    [/dakuten|voiced/i, ['voicing-k-g', 'voicing-s-z', 'voicing-t-d', 'voicing-h-b']],
    
    // Confusables
    [/は.*ほ|ほ.*は/i, ['confuse-ha-ho']],
    [/ぬ.*め|め.*ぬ/i, ['confuse-nu-me']],
    // ... etc
  ];

  // Dynamic routing for individual kana questions
  for (const node of Object.values(PREREQ_DAG)) {
    if (node.level !== 1 || !node.autoGen || node.prereqs.length > 0) continue;
    const matched = new Set();
    
    // Try to extract a specific hiragana character from the question
    const kanaMatch = (node.q || '').match(/romaji for\s+([ぁ-ん])\s*\?/);
    if (kanaMatch) {
      const hex = kanaMatch[1].charCodeAt(0).toString(16);
      const nodeId = 'hira-' + hex;
      if (PREREQ_DAG[nodeId]) matched.add(nodeId);
    }
    
    // Fall through to static rules
    for (const [re, ids] of rules) {
      if (re.test(node.q) || re.test(node.correct)) {
        ids.forEach(id => { if (PREREQ_DAG[id]) matched.add(id); });
      }
    }
    
    if (matched.size === 0 && PREREQ_DAG['kana-foundation']) matched.add('kana-foundation');
    node.prereqs = [...matched];
  }
}
```

### Step 6: generateQuestion

Copy the same 4-type weight system from the kanji cartridges. Identical structure:

```javascript
generateQuestion(cmd, allCommands) {
  // learn: identify 40%, fillblank 25%, variable 15%, application 10%
  // practice: identify 25%, fillblank 32.5%, variable 15%, application 17.5%
  // challenge: identify 10%, fillblank 40%, variable 15%, application 25%
  // ... renormalize over available types
}
```

### Step 7: Registration

Export data only (kana is merged into joyo deck):

```javascript
window.KANA_DATA = KANA;
```

Also add a conditional standalone export for the validator:
```javascript
if (typeof window.TD_CARTRIDGES !== 'undefined' && !window.KANJI_G1_DATA) {
  // Standalone mode (validator)
  window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
  window.TD_CARTRIDGES.push(KANA);
}
```

### Step 8: Validate

```bash
node validate-cartridge.js kana-cartridge.js
# Expected: ~120-160 commands, ~240-320 blanks, 24 passed, 0 failures

node validate-cartridge.js kanji-joyo-cartridge.js
# Expected: ~1,146-1,186 commands (1026 kanji + 120-160 kana), 0 failures
```

## Important Constraints

- **Overwrite `kana-cartridge.js`** — same filename, completely new content
- Do NOT modify any other cartridge file or the joyo merger
- Export as `window.KANA_DATA` (same export name as current)
- All hiragana readings must be accurate — cross-reference with G1 cartridge data
- Romaji must use modified Hepburn: し=shi, ち=chi, つ=tsu, ふ=fu, じ=ji, ぢ=ji, づ=zu, を=wo
- Every subconcept must have 2 distinct non-"unknown" wrong answers
- Every blank must have distinct choices with choices[0] = answer
- Run validator after completion

## Data Extraction Helper

To extract vocabulary from the G1 cartridge without running in a browser, Codex can:

```javascript
global.window = {};
eval(require('fs').readFileSync('kanji-g1-cartridge-v2.js', 'utf8'));
const g1 = window.KANJI_G1_DATA;

// Extract from hints
g1.commands.forEach(cmd => {
  const m = cmd.hint.match(/例:\s*(.+?)\s*[（(](.+?)[)）]/);
  if (m) { /* m[1] = kanji word, m[2] = hiragana reading, cmd.action = meaning */ }
});

// Extract from subconcepts
g1.commands.forEach(cmd => {
  cmd.subconcepts.forEach(sc => {
    const rm = sc.q.match(/In\s+(.+?)\s+\((.+?)\),\s+what is the reading/);
    if (rm) { /* rm[1] = compound, rm[2] = gloss, sc.correct = hiragana reading */ }
    const mm = sc.q.match(/What does\s+(.+?)\s+mean/);
    if (mm) { /* mm[1] = compound, sc.correct = english meaning */ }
  });
});
```

However, the cleanest approach is to hard-code the extracted vocabulary directly in the kana source array (like the kanji cartridges do), so the kana cartridge has no runtime dependency on the G1 cartridge being loaded.
