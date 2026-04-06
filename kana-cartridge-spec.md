# Spec: Hiragana & Katakana Cartridge (208 kana)

## Goal
Create `kana-cartridge.js` as a foundational cartridge covering all hiragana and katakana. This is the prerequisite layer for the kanji cartridges — students master kana recognition before tackling kanji compounds.

## Kana Inventory (208 entries)

### Hiragana Basic (46)
```
あいうえお かきくけこ さしすせそ たちつてと なにぬねの
はひふへほ まみむめも やゆよ らりるれろ わをん
```

### Hiragana Voiced/Semi-voiced (25)
```
がぎぐげご ざじずぜぞ だぢづでど ばびぶべぼ ぱぴぷぺぽ
```

### Katakana Basic (46)
```
アイウエオ カキクケコ サシスセソ タチツテト ナニヌネノ
ハヒフヘホ マミムメモ ヤユヨ ラリルレロ ワヲン
```

### Katakana Voiced/Semi-voiced (25)
```
ガギグゲゴ ザジズゼゾ ダヂヅデド バビブベボ パピプペポ
```

### Yōon Combinations (66)
Hiragana (33):
```
きゃきゅきょ ぎゃぎゅぎょ しゃしゅしょ じゃじゅじょ ちゃちゅちょ
にゃにゅにょ ひゃひゅひょ びゃびゅびょ ぴゃぴゅぴょ みゃみゅみょ りゃりゅりょ
```
Katakana (33):
```
キャキュキョ ギャギュギョ シャシュショ ジャジュジョ チャチュチョ
ニャニュニョ ヒャヒュヒョ ビャビュビョ ピャピュピョ ミャミュミョ リャリュリョ
```

## Cartridge Metadata
```javascript
{
  id: 'kana',
  name: 'Hiragana & Katakana',
  description: 'Master all Japanese kana — hiragana, katakana, and combination characters',
  icon: 'あ',
  inputMode: 'quiz',
  title: 'KANA かな',
  subtitle: 'DEFENSE',
  startButton: 'はじめ',
  identifyPrompt: 'What is the romaji for this character?',
  variablePrompt: 'What does <span id="var-symbol" style="display:inline-block"></span> represent in this kana?',
  applicationPrompt: 'Which kana makes this sound?',
}
```

## Command Schema

- `id`: `kana-{unicode hex}` for single kana, `kana-{first hex}-{second hex}` for yōon
- `dom`: `hiragana`, `katakana`, or `yoon`
- `tier`: basic (46+46) = `core`, voiced (25+25) = `regular`, yōon (66) = `regular`
- `action`: romaji reading (e.g., "a", "ka", "shi", "kya")
- `latex`: the kana character(s)
- `hint`: row name + stroke count + mnemonic hint
- `explain`: one sentence — shape mnemonic or common usage note
- `blanks[2]`: word-completion (fill the missing kana in a common word)
- `subconcepts[3]`:
  1. Row/group question: "Which row does this kana belong to?" (ka-row, sa-row, etc.)
  2. Counterpart question: "What is the katakana/hiragana for this character?"
  3. Word recognition: "Which word uses this kana?"

## Domains

| Domain | Label | Commands |
|--------|-------|----------|
| `hiragana` | Hiragana (basic + voiced) | 71 |
| `katakana` | Katakana (basic + voiced) | 71 |
| `yoon` | Yōon Combinations | 66 |

DOM_LABELS:
```javascript
{
  'hiragana': ['Hiragana (ひらがな)'],
  'katakana': ['Katakana (カタカナ)'],
  'yoon': ['Yōon Combinations (拗音)'],
}
```

## Confusable Sets

### Classic Katakana Confusables
| Group | Kana | Why confused |
|-------|------|-------------|
| シ/ツ | シ ツ | Stroke direction (シ = vertical start, ツ = horizontal start) |
| ソ/ン | ソ ン | Mirror angle |
| ア/マ | ア マ | Similar top strokes |
| ク/タ/ケ | ク タ ケ | Angular shapes |
| ヌ/ス | ヌ ス | Curving strokes |
| ウ/ワ/フ | ウ ワ フ | Crown shapes |
| コ/ユ | コ ユ | Rectangular |
| ナ/メ | ナ メ | Crossed strokes |
| チ/テ | チ テ | T-shapes |
| セ/ヤ | セ ヤ | Similar angles |

### Classic Hiragana Confusables
| Group | Kana | Why confused |
|-------|------|-------------|
| は/ほ | は ほ | Right side differs subtly |
| ぬ/め | ぬ め | Loop vs no loop |
| き/さ | き さ | Connected vs disconnected strokes |
| わ/ね/れ | わ ね れ | Left hook variations |
| る/ろ | る ろ | Loop vs no loop |
| い/り | い り | Two strokes, different curves |
| あ/お | あ お | Similar flow |
| た/な | た な | Cross stroke variations |
| う/つ | う つ | Curve difference |
| こ/て | こ て | Angular similarity |

### Cross-system Confusables
| Hiragana | Katakana | Note |
|----------|----------|------|
| か/カ | か カ | Learners mix systems |
| も/モ | も モ | Similar shape |
| り/リ | り リ | Nearly identical |
| へ/ヘ | へ ヘ | Identical shape, different system |
| や/ヤ | や ヤ | Similar |

### Voiced/Unvoiced Pairs
Every dakuten kana is confusable with its unvoiced base:
か↔が, き↔ぎ, く↔ぐ, etc. (dakuten = voiced)
は↔ば↔ぱ (dakuten = voiced, handakuten = semi-voiced)

## Banks

**VARIABLE_BANK**: 2 `{s, d}` entries per kana:
- Stroke component (e.g., `{s: '一', d: 'horizontal stroke'}`)
- Row membership (e.g., `{s: 'ka-row', d: 'か き く け こ group'}`)

**APPLICATION_BANK**: 1 scenario per kana: a word or context where this kana appears.
- Example for し: "You dip soy sauce at a sushi restaurant. Which kana starts the word for this cuisine?"
- confusionSet: 3 kana IDs from the same confusable group
- Scenarios must NOT contain the romaji reading directly

**EXPLANATION_GLOSSARY**: 1 entry per kana:
```javascript
{
  keys: ['あ'],
  title: 'a',
  lines: [
    'Meaning: The vowel sound "a" as in "father"',
    'Row: a-row (あ行) | Strokes: 3',
    'Example: あめ (ame) = rain'
  ]
}
```

**RELATIONSHIP_BANK**: `{}` (empty)

**AUTO_BLANK_SPECS**: `[]` (empty)

## Shared DAG

The kanji cartridges already have kana nodes at L4-L5 (hiragana-a-row, katakana-vowels, etc.). The kana cartridge should define its OWN DAG nodes focused on kana-specific skills:

### L2 Nodes (Kana-specific)
| Node ID | Concept |
|---------|---------|
| `vowel-sounds` | The 5 Japanese vowels: a i u e o |
| `consonant-k` | K-row: ka ki ku ke ko |
| `consonant-s` | S-row: sa shi su se so |
| `consonant-t` | T-row: ta chi tsu te to |
| `consonant-n` | N-row: na ni nu ne no |
| `consonant-h` | H-row: ha hi fu he ho |
| `consonant-m` | M-row: ma mi mu me mo |
| `consonant-r` | R-row: ra ri ru re ro |
| `consonant-y` | Y-row: ya yu yo |
| `consonant-w` | W-row: wa wo |
| `dakuten-rules` | Voicing rules: adding ゛ changes k→g, s→z, t→d, h→b |
| `handakuten-rules` | Semi-voicing: adding ゜ changes h→p |
| `yoon-rules` | Combination rules: consonant + small ゃゅょ |
| `hira-kata-pairs` | System correspondence: each hiragana has a katakana match |

### L3 Nodes
| Node ID | Concept |
|---------|---------|
| `stroke-direction` | Left→right, top→bottom stroke order |
| `system-recognition` | Hiragana = native/grammar, katakana = foreign/emphasis |

### L4-L5 Leaf Nodes
Reuse: `kana-basics`, `stroke-basics` from kanji DAG

## Question Types

### Identify (romaji recognition)
- Show kana, 4-option MC with romaji answers
- Example: `あ` → A) a B) o C) u D) e
- Distractors from same row or confusable set

### Fillblank (word completion)
- Show a common Japanese word with one kana replaced by `□`
- Example: `す□` (sushi) → choices: し, ち, き
- Uses real beginner vocabulary (greetings, food, animals, colors)

### Variable (component recognition)
- "Which row does し belong to?"
- "What happens when you add dakuten to は?"

### Application (sound-in-context)
- Real-world scenario, student picks the correct kana
- "At a convenience store, the clerk says 'arigatou gozaimasu.' Which kana starts this greeting?"

## Word Bank for Blanks

Curated list of ~300 beginner Japanese words using only kana (no kanji needed):
- Greetings: おはよう, こんにちは, ありがとう, すみません
- Food: すし, ラーメン, おにぎり, たまご, さかな
- Animals: ねこ, いぬ, さる, うさぎ, とり
- Colors: あか, あお, しろ, くろ, きいろ
- Body: あたま, て, あし, め, みみ
- Nature: やま, かわ, うみ, そら, はな
- Numbers: いち, に, さん, よん, ご
- Katakana loanwords: コーヒー, テレビ, パン, バス, タクシー

Each word should be tagged with which kana it exercises, so blanks target specific characters.

## Registration
```javascript
window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
window.TD_CARTRIDGES.push(KANA_CARTRIDGE);
```

## Validation
`node validate-cartridge.js kana-cartridge.js` must pass all 12 rules with 0 failures.

## Deep Link
`https://tmux-trainer.vercel.app/#deck=kana`

## Relationship to Kanji Cartridges

The kana cartridge is a **standalone deck** — it does not require any kanji cartridge to be loaded. However:

- The kanji DAG already has kana nodes at L4-L5 that reference kana row concepts
- If both kana and kanji cartridges are loaded, a student who struggles with kana in kanji decomposition will see those same kana concepts reinforced
- Future work: cross-cartridge SRS transfer (mastering あ in the kana deck seeds the `hiragana-a-row` DAG node in kanji)

This is the foundation layer. Master kana first → unlock kanji.
