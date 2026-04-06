# Spec: Kana Cartridge v2 — Learn Hiragana Through G1 Vocabulary

## Vision

Replace the current kana cartridge (208 isolated characters) with a vocabulary-driven approach: show G1 kanji words written entirely in hiragana (furigana), quiz for English meaning. When students fail, decompose into romaji of the word, then romaji of individual hiragana characters.

This teaches kana through real words students will encounter in Grade 1, not isolated あいうえお drills.

## Learning Flow

```
L0 (main question):  みぎて  →  "right hand"     (hiragana → English meaning)
     ↓ miss
L1 (subconcept):     みぎて  →  "migite"          (hiragana → romaji of word)
     ↓ miss
L2 (DAG node):       み      →  "mi"              (single hiragana → romaji)
     ↓ miss
L3 (DAG node):       m-row: ma mi mu me mo        (row membership)
     ↓ miss
L4-L5:               kana-basics / stroke-basics   (foundation)
```

## Data Source: G1 Kanji Cartridge

Extract ALL vocabulary from `kanji-g1-cartridge-v2.js`:

1. **Example words from hints**: format `例: WORD (READING)` — 80 entries (1 per kanji)
2. **Reading words from subconcepts**: format `In WORD (GLOSS), what is the reading?` — 80 entries
3. **Meaning words from subconcepts**: format `What does WORD mean?` — 80 entries
4. **Kun-yomi readings from hints**: format `くん: READING` — standalone readings like みぎ, ひと(つ), etc.

After deduplication by reading: expect ~120-160 unique vocabulary commands.

Each command's English meaning comes from the G1 kanji's `action` field or from the subconcept context.

### Supplementary words

If the extracted set doesn't cover all 46 basic hiragana + 25 voiced hiragana, add common beginner words to fill gaps. Target: every basic hiragana appears in at least 2 commands. Use JLPT N5 vocabulary:

- Greetings: おはよう (good morning), こんにちは (hello), ありがとう (thank you), さようなら (goodbye)
- Classroom: せんせい (teacher), きょうしつ (classroom), しゅくだい (homework)
- Food: おべんとう (lunch box), おちゃ (tea), ごはん (meal/rice)
- Time: あした (tomorrow), きのう (yesterday), いま (now)

## Cartridge Metadata

```javascript
{
  id: 'kana',
  name: 'Kana Reading',
  description: 'Learn hiragana by reading Grade 1 vocabulary words',
  icon: 'あ',
  inputMode: 'quiz',
  title: 'よみかた',
  subtitle: 'DEFENSE',
  startButton: 'はじめ',
  identifyPrompt: 'What does this word mean?',
  variablePrompt: 'What does <span id="var-symbol" style="display:inline-block"></span> represent in this word?',
  applicationPrompt: 'Which word means this?',
}
```

## Command Schema

Each command = one hiragana vocabulary word:

```javascript
{
  id: 'kv-{hash}',              // kv = kana-vocab, hash from the reading string
  action: 'right hand',         // English meaning
  tier: 'core' or 'regular',    // core = common G1 words, regular = less frequent
  dom: 'kana',                  // single domain (merged into joyo deck)
  latex: 'みぎて',              // the hiragana word (what the student sees)
  hint: 'From kanji: 右手 | romaji: migite',
  explain: 'みぎ (right) + て (hand). A common direction + body compound.',
  blanks: [
    // Blank 1: fill the missing hiragana in the word
    { latex: '□ぎて', answer: 'み', choices: ['み', 'め', 'も'] },
    // Blank 2: different position
    { latex: 'みぎ□', answer: 'て', choices: ['て', 'た', 'と'] },
  ],
  subconcepts: [
    // SC1: Full word → romaji
    { q: 'What is the romaji for みぎて?', correct: 'migite', wrong: ['hidari', 'migime'] },
    // SC2: Individual kana → romaji (pick hardest kana in the word)
    { q: 'What is the romaji for ぎ?', correct: 'gi', wrong: ['ki', 'ji'] },
    // SC3: Reverse quiz — English → hiragana word
    { q: 'Which word means "right hand"?', correct: 'みぎて', wrong: ['ひだりて', 'みぎめ'] },
  ]
}
```

### ID scheme

`kv-` prefix + hex of first character + length, e.g., `kv-307f-4` for みぎて (み=307F, length 4 chars). This avoids collision with kanji IDs (`k-`) and old kana IDs (`kana-`).

### Tier assignment

- `core`: Words from G1 kanji marked as `core` tier + common greetings/classroom words
- `regular`: Words from `regular` tier kanji + supplementary vocabulary

## Banks

### VARIABLE_BANK (2 entries per command)

```javascript
'kv-XXXX': [
  { s: 'みぎ', d: 'right (direction component)' },
  { s: 'て', d: 'hand (body part component)' },
]
```

Decompose each word into its meaningful parts (kanji-equivalent morphemes).

### APPLICATION_BANK (1 scenario per command)

Context-based scenarios that do NOT give away the English meaning:

```javascript
'kv-XXXX': [{
  scenario: 'You are pointing to something on your dominant side. Which word describes this direction plus a body part you use to point?',
  confusionSet: ['kv-YYYY', 'kv-ZZZZ', 'kv-WWWW']  // semantically related words
}]
```

### EXPLANATION_GLOSSARY (1 entry per command)

```javascript
{
  keys: ['みぎて'],
  title: 'migite — right hand',
  lines: [
    'Meaning: right hand (the hand on your right side)',
    'Kanji: 右手 | Romaji: migite',
    'Components: みぎ (right) + て (hand)'
  ]
}
```

### Other banks

- `RELATIONSHIP_BANK`: `{}` (empty)
- `AUTO_BLANK_SPECS`: `[]` (empty)
- `DOM_LABELS`: `{ 'kana': ['Kana Reading (ひらがな)'] }`

## Prerequisite DAG

### L2: Individual Hiragana Nodes (~65 nodes)

One node per unique hiragana character that appears in the vocabulary:

```javascript
'hira-mi': {
  id: 'hira-mi', type: 'conceptual', level: 2,
  q: 'What is the romaji for み?',
  correct: 'mi',
  wrong: ['me', 'mu'],
  prereqs: ['row-m']
},
'hira-gi': {
  id: 'hira-gi', type: 'conceptual', level: 2,
  q: 'What is the romaji for ぎ?',
  correct: 'gi',
  wrong: ['ki', 'ji'],
  prereqs: ['row-k', 'voicing-k-to-g']
},
```

Wrong answers should be same-row confusables or voiced/unvoiced pairs.

### L3: Row Nodes (10 nodes)

```javascript
'row-a': { level: 3, q: 'What are the a-row sounds?', correct: 'a i u e o', wrong: [...], prereqs: ['kana-foundation'] },
'row-k': { level: 3, q: 'What are the k-row sounds?', correct: 'ka ki ku ke ko', wrong: [...], prereqs: ['kana-foundation'] },
// ... etc for s, t, n, h, m, y, r, w rows
```

### L3: Voicing Nodes (4 nodes)

```javascript
'voicing-k-to-g': { level: 3, q: 'What happens when dakuten (゛) is added to k-row?', correct: 'K becomes G: ka→ga, ki→gi...', wrong: [...], prereqs: ['kana-foundation'] },
'voicing-s-to-z': { ... },
'voicing-t-to-d': { ... },
'voicing-h-to-b': { ... },
```

### L3: Confusable Discrimination Nodes (5-8 nodes)

```javascript
'confuse-ha-ho': { level: 3, q: 'How do you tell は from ほ?', correct: 'は has 2 bumps; ほ has a cross and tail', wrong: [...], prereqs: ['row-h'] },
'confuse-nu-me': { ... },
'confuse-ru-ro': { ... },
// etc for classic confusable pairs
```

### L4: Foundation

```javascript
'kana-foundation': { level: 4, q: 'What are the two phonetic scripts in Japanese?', correct: 'Hiragana and Katakana', wrong: [...], prereqs: [] },
```

### Total DAG: ~85 nodes

| Level | Count | Purpose |
|-------|-------|---------|
| L2 | ~65 | Individual hiragana → romaji |
| L3 | ~20 | Row membership + voicing rules + confusable discrimination |
| L4 | 1 | Kana foundation |

### wireL1toL2 Routing

```javascript
// SC1 (word romaji) → route to row nodes for constituent kana
[/romaji for.*[ぁ-ん]/i, rowNodesFromWordKana],

// SC2 (individual kana romaji) → route to specific hira-X node
[/romaji for\s+([ぁ-ん])/i, specificHiraNode],

// SC3 (meaning reverse) → route to vocabulary context
[/which word means/i, ['kana-foundation']],
```

The wiring function should dynamically match the kana character in the subconcept question text and route to the corresponding `hira-X` node.

## Integration with Joyo Merger

The kana cartridge exports via `window.KANA_DATA` (unchanged). The joyo merger in `kanji-joyo-cartridge.js` already pulls it in and remaps domains to `kana`. No changes needed to the merger.

The new kana cartridge has:
- Different command IDs (`kv-` prefix vs old `kana-` prefix)
- Same `dom` values that get remapped to `kana` by the merger
- Compatible `generateQuestion` function
- Compatible bank structures

### SRS Migration

Old `td-srs-kana` keys use `kana-XXXX` IDs. New commands use `kv-XXXX` IDs. Old SRS data is irrelevant to the new commands, so no migration needed — the old key was already migrated into `td-srs-joyo-kanji` by the merger, and the old command IDs won't match new ones. Clean slate.

## Question Types (4-type system)

### Identify (hiragana → English meaning)
- Show: みぎて
- Prompt: "What does this word mean?"
- Options: "right hand", "left hand", "right foot", "left foot"
- Distractors from semantically related words (direction words, body parts, etc.)

### Fillblank (complete the hiragana word)
- Show: □ぎて (fill the missing kana)
- Options: み, め, も
- Distractors from same-row or confusable kana

### Variable (word decomposition)
- Show component: みぎ
- Ask: "What does みぎ mean in this word?"
- Options: "right", "hand", "left"

### Application (context → word)
- Scenario: "You raise the hand on your dominant side to answer a question."
- Ask: "Which word relates to this?"
- Options: みぎて, ひだりて, あたま, ゆび

## Validation

`node validate-cartridge.js kana-cartridge.js` must pass 24/0/0.

After merge: `node validate-cartridge.js kanji-joyo-cartridge.js` must also pass.

Expected: ~120-160 commands, ~240-320 blanks, domain: kana.

## Comparison: Old vs New Kana Cartridge

| Aspect | Old (v1) | New (v2) |
|--------|----------|----------|
| What it teaches | Isolated kana characters | Hiragana through real vocabulary |
| Commands | 208 (individual あ, い, う...) | ~120-160 (G1 vocab words) |
| Main question | "What romaji is this?" | "What does this word mean?" |
| Decomposition | Row → kana basics | Word romaji → individual kana → row |
| Real-world connection | Memorize 208 shapes | Read words you'll see in G1 kanji |
| DAG depth | 2 levels (shallow) | 4 levels (word → kana → row → foundation) |
