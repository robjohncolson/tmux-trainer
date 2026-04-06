# Codex Prompt: Hiragana & Katakana Cartridge (208 kana)

## Context

You are working in the `tmux-trainer` project. Read the full spec in `kana-cartridge-spec.md`.

**Key reference files** (read before writing code):
- `kana-cartridge-spec.md` — the specification (read this FIRST)
- `cartridge-authoring-guide.md` — engine contract
- `kanji-g3-cartridge.js` — structural template (data-driven source array pattern)
- `validate-cartridge.js` — validator: `node validate-cartridge.js <file>`

## Task: Create `kana-cartridge.js`

Create a new file `kana-cartridge.js` for all 208 hiragana, katakana, and yōon combination characters. Follow the data-driven source-array pattern from the kanji cartridges.

### Step 1: File Structure

Use the same IIFE pattern as the kanji cartridges. Source data as compact arrays, expanded into command objects at load time.

Helpers to include: `shuffleArr`, `uniqueBy`, `makeId` (modified for kana IDs), `normalizeLookup`, `pickDistinct`.

### Step 2: Source Data Arrays

Three source arrays:

**HIRAGANA_SOURCE** (71 entries — 46 basic + 25 voiced/semi-voiced):
Each entry:
```javascript
["あ", "a", "a-row", "hiragana", "core", "あめ", "ame", "rain", "あさ", "asa", "morning", "one curved stroke like a fish hook"]
// [kana, romaji, row, dom, tier, word1, reading1, meaning1, word2, reading2, meaning2, mnemonic]
```

**KATAKANA_SOURCE** (71 entries — 46 basic + 25 voiced/semi-voiced):
Same format, dom = `"katakana"`, tier = `"core"` for basic, `"regular"` for voiced.

**YOON_SOURCE** (66 entries — 33 hiragana + 33 katakana combos):
```javascript
["きゃ", "kya", "k-row", "yoon", "regular", "きゃく", "kyaku", "guest", "きゃべつ", "kyabetsu", "cabbage", "ki + small ya"]
```

### Step 3: Build Commands from Source

For each source entry, generate:
```javascript
{
  id: 'kana-' + kana.charCodeAt(0).toString(16),  // for yōon: 'kana-{first}-{second}'
  action: romaji,
  dom: dom,
  tier: tier,
  latex: kana,
  hint: 'Row: ' + row + ' | ' + mnemonic,
  explain: mnemonic + '. Used in: ' + word1 + ' (' + reading1 + ') = ' + meaning1,
  blanks: [
    // Blank 1: word1 with this kana replaced by □
    { latex: buildKanaBlank(word1, kana), answer: kana, choices: [kana, ...distractors] },
    // Blank 2: word2 with this kana replaced by □
    { latex: buildKanaBlank(word2, kana), answer: kana, choices: [kana, ...distractors] },
  ],
  subconcepts: [
    { q: 'Which row does ' + kana + ' belong to?', correct: row, wrong: [otherRow1, otherRow2] },
    { q: 'What is the ' + counterSystem + ' for ' + kana + '?', correct: counterpart, wrong: [wrong1, wrong2] },
    { q: 'Which word contains ' + kana + '?', correct: word1, wrong: [wrongWord1, wrongWord2] },
  ]
}
```

### Step 4: Confusable Map

Build `CONFUSABLE_MAP` keyed by kana ID. Use the confusable sets from the spec:

**Katakana:** シ↔ツ, ソ↔ン, ア↔マ, ク↔タ↔ケ, ヌ↔ス, ウ↔ワ↔フ, コ↔ユ, ナ↔メ, チ↔テ, セ↔ヤ

**Hiragana:** は↔ほ, ぬ↔め, き↔さ, わ↔ね↔れ, る↔ろ, い↔り, あ↔お, た↔な, う↔つ, こ↔て

**Voiced pairs:** か↔が, き↔ぎ, く↔ぐ, etc. (every dakuten pair)

**Cross-system:** へ↔ヘ, り↔リ, も↔モ, etc.

Use confusable map for:
- Blank distractors
- Application scenario confusionSets
- Identify question wrong answers

### Step 5: Banks

**VARIABLE_BANK**: 2 entries per kana:
```javascript
'kana-3042': [  // あ
  { s: 'a-row', d: 'あ い う え お vowel group' },
  { s: '3 strokes', d: 'stroke count for あ' }
]
```

**APPLICATION_BANK**: 1 scenario per kana. Use the word bank from the spec. Context-based clues:
- Food scenarios for food-related words
- Greeting scenarios for greeting-related kana
- Animal scenarios, etc.
- confusionSet: 3 IDs from confusable map
- **CRITICAL**: scenario must NOT contain the romaji reading

**EXPLANATION_GLOSSARY**: 1 entry per kana:
```javascript
{ keys: ['あ'], title: 'a', lines: [
  'Meaning: The vowel "a" as in "father"',
  'Row: a-row (あ行) | Strokes: 3',
  'Example: あめ (ame) = rain'
]}
```

**RELATIONSHIP_BANK**: `{}`
**AUTO_BLANK_SPECS**: `[]`
**DOM_LABELS**: `{ 'hiragana': ['Hiragana (ひらがな)'], 'katakana': ['Katakana (カタカナ)'], 'yoon': ['Yōon Combinations (拗音)'] }`

### Step 6: DAG

Define kana-specific prerequisite nodes:

**L2 nodes** (14):
- `vowel-sounds`: The 5 vowels a i u e o
- `consonant-k` through `consonant-w`: one per consonant row
- `dakuten-rules`: voicing rules
- `handakuten-rules`: semi-voicing rules  
- `yoon-rules`: combination rules
- `hira-kata-pairs`: system correspondence

**L3 nodes** (2):
- `stroke-direction`: basic stroke order rules
- `system-recognition`: hiragana vs katakana usage

**L4-L5 leaf nodes**: `kana-basics`, `stroke-basics`

**wireL1toL2**: match subconcept questions to DAG nodes:
```javascript
[/a-row|vowel/i, ['vowel-sounds']],
[/k-row|ka.*row/i, ['consonant-k']],
[/s-row|sa.*row/i, ['consonant-s']],
// ... etc for each row
[/dakuten|voiced|゛/i, ['dakuten-rules']],
[/handakuten|゜|semi/i, ['handakuten-rules']],
[/yōon|combination|small.*ya/i, ['yoon-rules']],
[/katakana.*for|hiragana.*for|counterpart/i, ['hira-kata-pairs']],
[/stroke|write|order/i, ['stroke-direction']],
[/hiragana.*used|katakana.*used|native|foreign/i, ['system-recognition']],
```

### Step 7: generateQuestion

Copy the `generateQuestion` function from any kanji cartridge. It handles identify, fillblank, variable, application with weight renormalization. Works unchanged for kana.

### Step 8: Registration

```javascript
KANA.variableBank = VARIABLE_BANK;
KANA.applicationBank = APPLICATION_BANK;
KANA.relationshipBank = RELATIONSHIP_BANK;
KANA.explanationGlossary = EXPLANATION_GLOSSARY;
KANA.autoBlankSpecs = AUTO_BLANK_SPECS;
KANA.domLabels = DOM_LABELS;
KANA.sharedPrereqNodes = SHARED_PREREQ_NODES;
KANA.normalizeExplanationLookup = normalizeLookup;
KANA.buildExplanationBank = function() {
  const byId = {}, byLabel = {};
  EXPLANATION_GLOSSARY.forEach((entry, i) => {
    byId[i] = entry;
    entry.keys.forEach(k => { byLabel[normalizeLookup(k)] = entry; });
  });
  return { byId, byLabel };
};
KANA.wireL1toL2 = wireL1toL2;

window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
window.TD_CARTRIDGES.push(KANA);
```

### Step 9: Register in index.html

Add before the kanji script tags:
```html
<script src="./kana-cartridge.js"></script>
```

### Step 10: Validate

Run `node validate-cartridge.js kana-cartridge.js` — all 12 rules must pass with 0 failures.

Expected: 208 commands, ~416 blanks, domains hiragana+katakana+yoon, tiers core+regular.

## Kana-Specific Design Notes

1. **Romaji standard**: Use modified Hepburn romanization (the AP/standard textbook system):
   - し = shi (not si), ち = chi (not ti), つ = tsu (not tu), ふ = fu (not hu)
   - じ = ji (not zi), ぢ = ji (note: same romaji as じ), づ = zu (same as ず)
   - を = wo (particle pronunciation)
   - ん = n

2. **Word bank quality**: Every blank word must be a real Japanese word that beginners would encounter. Prefer words from JLPT N5 vocabulary. Each word should contain the target kana in a natural position.

3. **Yōon IDs**: Use double-hex format: `kana-304d-3083` for きゃ (き=304D, ゃ=3083). This avoids ID collisions.

4. **Counterpart subconcepts**: Every hiragana command should have "What is the katakana?" as SC2, and vice versa. This builds system-switching fluency.

5. **Voiced kana**: Dakuten kana (が, ぎ, etc.) should always have the unvoiced base in their confusionSet. The dakuten distinction is the #1 beginner error.

## Important Constraints

- **New file only** — do not modify any existing cartridge files
- Only modify `index.html` to add the `<script>` tag
- Every APPLICATION_BANK scenario must NOT give away the romaji reading
- Every subconcept must have 2 distinct wrong answers
- Follow the kanji cartridge data-driven pattern (source array → expanded commands)
- Use modified Hepburn romanization consistently
- Run validator after completion
