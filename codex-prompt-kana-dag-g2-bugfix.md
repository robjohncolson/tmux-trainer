# Codex Prompt: Kana DAG Nodes + Grade 2 Cartridge + Wrong-Answer Timeout Fix

## Context

You are working in the `tmux-trainer` project — a browser-based game engine that loads "cartridges" (self-contained JS files) to teach subjects via quiz gameplay. Read the full spec in `kanji-kana-dag-and-g2-spec.md`.

**Key reference files** (read before writing code):
- `kanji-kana-dag-and-g2-spec.md` — the specification for all three tasks
- `cartridge-authoring-guide.md` — engine contract (command schema, banks, DAG rules)
- `kanji-g1-cartridge-v2.js` — reference: the Grade 1 cartridge you'll model Grade 2 after
- `ap-stats-cartridge.js` — reference: weight renormalization, all 5 question types
- `validate-cartridge.js` — validator: `node validate-cartridge.js <file>` checks 12 rules
- `index.html` — game engine; modify only the safety valve and script tags
- `kanji-list.txt` — contains the Grade 2 kanji list

## Task 1: Wrong-Answer Timeout Bug Fix (in `index.html`)

This is the smallest change — do it first.

**The bug**: When a player answers wrong and waits 5+ seconds instead of pressing spacebar/GOT IT, the safety valve at line ~3697 calls `clearQuizAnswerFeedback()` which nulls `heldCallback` without ever calling `handleMiss()`. The wrong answer penalty (BKT, SRS, DAG decomposition, streak reset) is never applied.

**The fix**: In `index.html`, find the safety valve block inside `updateInput()`:

```javascript
if(QUIZ_ANSWER_FEEDBACK.locked&&QUIZ_ANSWER_FEEDBACK.lockedAt&&Date.now()-QUIZ_ANSWER_FEEDBACK.lockedAt>5000){
  clearQuizAnswerFeedback();
}
```

Replace with:

```javascript
if(QUIZ_ANSWER_FEEDBACK.locked&&QUIZ_ANSWER_FEEDBACK.lockedAt&&Date.now()-QUIZ_ANSWER_FEEDBACK.lockedAt>5000){
  if(QUIZ_ANSWER_FEEDBACK.heldCallback){
    QUIZ_ANSWER_FEEDBACK.held=false;
    QUIZ_ANSWER_FEEDBACK.heldCallback();
  }else{
    clearQuizAnswerFeedback();
  }
}
```

This ensures `handleMiss()` fires after 5 seconds if the player doesn't dismiss manually. The spacebar and GOT IT button still work as early dismissal.

**Do NOT change anything else in `updateInput()`, `handleMiss()`, `clearQuizAnswerFeedback()`, or `queueQuizChoiceResolution()`.**

## Task 2: Kana→Romaji DAG Nodes (in `kanji-g1-cartridge-v2.js`)

Add hiragana and katakana recognition nodes to the shared prerequisite DAG so that reading-related failures drill down into actual kana practice.

### 2a. Add new SHARED_PREREQ_NODES

Find the `SHARED_PREREQ_NODES` object in `kanji-g1-cartridge-v2.js`. Add these nodes:

**L5 leaf node:**
```javascript
'kana-basics': {
  id: 'kana-basics', type: 'conceptual', level: 5,
  q: 'Japanese has two phonetic scripts. What are they called?',
  correct: 'Hiragana and Katakana',
  wrong: ['Romaji and Kanji', 'Hiragana and Romaji'],
  prereqs: []
}
```

**L4 hiragana nodes** (10 nodes, one per row):
```javascript
'hiragana-vowels': {
  id: 'hiragana-vowels', type: 'computational', level: 4,
  q: 'What is the romaji for あ い う え お?',
  correct: 'a i u e o',
  wrong: ['e i u o a', 'ka ki ku ke ko'],
  prereqs: ['kana-basics']
},
'hiragana-ka-row': {
  id: 'hiragana-ka-row', type: 'computational', level: 4,
  q: 'What is the romaji for か?',
  correct: 'ka',
  wrong: ['ga', 'ki'],
  prereqs: ['kana-basics']
},
'hiragana-sa-row': {
  id: 'hiragana-sa-row', type: 'computational', level: 4,
  q: 'What is the romaji for さ?',
  correct: 'sa',
  wrong: ['za', 'shi'],
  prereqs: ['kana-basics']
},
'hiragana-ta-row': {
  id: 'hiragana-ta-row', type: 'computational', level: 4,
  q: 'What is the romaji for た?',
  correct: 'ta',
  wrong: ['da', 'chi'],
  prereqs: ['kana-basics']
},
'hiragana-na-row': {
  id: 'hiragana-na-row', type: 'computational', level: 4,
  q: 'What is the romaji for な?',
  correct: 'na',
  wrong: ['ni', 'nu'],
  prereqs: ['kana-basics']
},
'hiragana-ha-row': {
  id: 'hiragana-ha-row', type: 'computational', level: 4,
  q: 'What is the romaji for は?',
  correct: 'ha',
  wrong: ['ba', 'pa'],
  prereqs: ['kana-basics']
},
'hiragana-ma-row': {
  id: 'hiragana-ma-row', type: 'computational', level: 4,
  q: 'What is the romaji for ま?',
  correct: 'ma',
  wrong: ['mi', 'na'],
  prereqs: ['kana-basics']
},
'hiragana-ya-row': {
  id: 'hiragana-ya-row', type: 'computational', level: 4,
  q: 'What is the romaji for や?',
  correct: 'ya',
  wrong: ['yu', 'wa'],
  prereqs: ['kana-basics']
},
'hiragana-ra-row': {
  id: 'hiragana-ra-row', type: 'computational', level: 4,
  q: 'What is the romaji for ら?',
  correct: 'ra',
  wrong: ['la', 'ri'],
  prereqs: ['kana-basics']
},
'hiragana-wa-n': {
  id: 'hiragana-wa-n', type: 'computational', level: 4,
  q: 'What is the romaji for ん?',
  correct: 'n',
  wrong: ['m', 'ng'],
  prereqs: ['kana-basics']
},
```

**L4 katakana nodes** (5 key rows):
```javascript
'katakana-vowels': {
  id: 'katakana-vowels', type: 'computational', level: 4,
  q: 'What is the romaji for ア イ ウ エ オ?',
  correct: 'a i u e o',
  wrong: ['e i u o a', 'ka ki ku ke ko'],
  prereqs: ['kana-basics']
},
'katakana-ka-row': {
  id: 'katakana-ka-row', type: 'computational', level: 4,
  q: 'What is the romaji for カ?',
  correct: 'ka',
  wrong: ['ga', 'sa'],
  prereqs: ['kana-basics']
},
'katakana-sa-row': {
  id: 'katakana-sa-row', type: 'computational', level: 4,
  q: 'What is the romaji for サ?',
  correct: 'sa',
  wrong: ['za', 'ka'],
  prereqs: ['kana-basics']
},
'katakana-ta-row': {
  id: 'katakana-ta-row', type: 'computational', level: 4,
  q: 'What is the romaji for タ?',
  correct: 'ta',
  wrong: ['da', 'ka'],
  prereqs: ['kana-basics']
},
'katakana-na-row': {
  id: 'katakana-na-row', type: 'computational', level: 4,
  q: 'What is the romaji for ナ?',
  correct: 'na',
  wrong: ['ni', 'ma'],
  prereqs: ['kana-basics']
},
```

### 2b. Update existing node prereqs

Find the existing `hiragana-reading` node in SHARED_PREREQ_NODES. Add to its `prereqs` array:
```javascript
prereqs: ['hiragana-vowels', 'hiragana-ka-row', 'hiragana-sa-row', 'hiragana-ta-row', 'hiragana-na-row']
```

Find the existing `onyomi-kunyomi` node. Add to its `prereqs` array (append, don't replace existing):
```javascript
// Add these to the existing prereqs array:
'katakana-vowels', 'katakana-ka-row'
```

### 2c. Update wireL1toL2 rules

In the `wireL1toL2` function, ensure rules exist for:
- `/reading|よみ|romaji/i` → wires to `hiragana-reading`
- `/カタカナ|katakana|オン.*yomi/i` → wires to `katakana-vowels`

These may already partially exist. Verify and add if missing.

### 2d. Validate
Run `node validate-cartridge.js kanji-g1-cartridge-v2.js` — all checks must pass, especially:
- 0 dangling prereq refs
- 0 unwired L1 subconcepts

## Task 3: Grade 2 Kanji Cartridge (new file `kanji-g2-cartridge.js`)

Create a new file `kanji-g2-cartridge.js` with 160 Grade 2 kanji. Follow `kanji-g1-cartridge-v2.js` as the structural template exactly.

### 3a. File Structure

Copy the IIFE pattern from `kanji-g1-cartridge-v2.js`:
```javascript
(function(){
  function shuffleArr(arr){...} // same helper

  const KANJI_G2 = {
    id: 'joyo-kanji-g2',
    name: 'Joyo Kanji - Grade 2',
    description: 'Kanji defense for 160 Grade 2 (elementary year 2) Joyo kanji',
    icon: '語',
    inputMode: 'quiz',
    prefixLabel: null,
    title: 'KANJI 二年',
    subtitle: 'DEFENSE',
    startButton: '出陣',
    instructions: 'Identify kanji by <b>meaning</b>, <b>reading</b>, and <b>components</b>. Fill blanks in real vocabulary compounds. Wrong answers decompose into radical and reading sub-questions.',
    instructionsSub: 'Grade 2 - 160 kanji - Recognition → Recall → Compounds',
    identifyPrompt: 'What is the meaning of this kanji?',
    variablePrompt: 'What does <span id="var-symbol" style="display:inline-block"></span> represent in this kanji?',
    applicationPrompt: 'Which kanji fits this context?',
    commands: [ /* 160 command objects */ ],
    generateQuestion(cmd, allCommands) { /* same as G1 v2 */ },
    formatPrompt(cmd) { return cmd.latex + ' — ' + cmd.action; },
    formatAnswer(cmd) { return cmd.action; },
    validateBlank(input, answer) { /* same as G1 v2 */ },
  };

  // Banks, DAG, registration...
})();
```

### 3b. The 160 Commands

For each of these 160 kanji, create a command object:
```
刀丸弓工才万引牛元戸午公今止少心切太内父分方毛友外兄古広市矢台冬半母北用羽回会交光考行合寺自色西多地池当同肉米毎何角汽近形言谷作社図声走体弟売麦来里画岩京国姉知長直店東歩妹明門夜科海活計後思室首秋春食星前茶昼点南風夏家記帰原高紙時弱書通馬魚強教黄黒細週雪船組鳥野理雲絵間場晴朝答道買番園遠楽新数電話歌語算読聞鳴線親頭顔曜
```

Each command needs:
- `id`: `k-{hex codepoint}` — use `'k-' + kanji.charCodeAt(0).toString(16)` logic
- `action`: Primary English gloss (1-3 words). Be concise. Examples: 刀→"sword", 丸→"round", 弓→"bow", 工→"craft; construction", 才→"talent", 万→"ten thousand"
- `tier`: `core` or `regular` per the spec's tier guidance
- `dom`: `g2`
- `hint`: Format as `'オン: X | くん: Y | 例: word (reading)'`
- `explain`: One sentence about usage or mnemonic
- `latex`: The kanji character itself
- `blanks[2-3]`: Compound-completion. Use `\boxed{\,?\,}` for the blank. Each blank needs `{latex, answer, choices}` where `choices[0]` is the correct answer and the array has 3 items total. **Vary distractors across blanks for the same kanji.** Pull from confusable sets in the spec.
- `subconcepts[3]`: Three questions — (1) radical/component, (2) reading, (3) meaning/vocabulary. Each has `{q, correct, wrong}` where `wrong` is an array of 2 **distinct** strings.

### 3c. Banks

**VARIABLE_BANK**: 2-3 `{s, d}` entries per command. Decompose each kanji into radicals/components.

**APPLICATION_BANK**: 1 entry per command: `{scenario, confusionSet}`.
- Scenarios must describe a context/situation WITHOUT giving away the English meaning
- Use the confusable groups from the spec (sword/blade, parent pair, directions, seasons, animals, communication, movement, time of day, weather, buildings, food, colors)
- `confusionSet`: array of 3 Grade 2 kanji IDs (or cross-grade Grade 1 IDs for color/direction groups)

**EXPLANATION_GLOSSARY**: One entry per kanji: `{keys: ['kanji'], title: 'gloss', lines: ['Meaning: ...', 'On: ... | Kun: ...', 'Example: word (reading)']}`

**RELATIONSHIP_BANK**: `{}`

**AUTO_BLANK_SPECS**: `[]`

**DOM_LABELS**: `{'g2': ['Grade 2 (second-year elementary)']}`

### 3d. Shared DAG

Include all nodes from Grade 1's DAG (copy them — each cartridge is self-contained) PLUS:

New radical nodes at L2:
- `radical-sword` (刀/刂): `{id:'radical-sword', type:'conceptual', level:2, q:'Which radical represents a blade or cutting?', correct:'刂 (sword/knife)', wrong:['力 (power)','十 (ten)'], prereqs:['nature-elements']}`
- `radical-speech` (言/訁): similar pattern
- `radical-walk` (辶): similar pattern
- `radical-food` (食/飠): similar pattern
- `radical-horse` (馬): similar pattern
- `radical-bird` (鳥): similar pattern
- `radical-rice` (米): similar pattern

New conceptual groupings at L3:
- `family-relationships`
- `time-concepts`
- `communication-concepts`

Include all the kana→romaji nodes from Task 2 (they're shared infrastructure).

Update `wireL1toL2` to handle Grade 2 subconcept patterns (more radicals, more reading patterns).

### 3e. generateQuestion()

Copy the `generateQuestion` function from `kanji-g1-cartridge-v2.js` exactly. It already handles identify, fillblank, variable, and application types with weight renormalization. The only change: the function references `this.variableBank`, `this.applicationBank`, etc., which will be set from the Grade 2 banks.

### 3f. Registration

At the bottom of the IIFE:
```javascript
KANJI_G2.variableBank = VARIABLE_BANK;
KANJI_G2.applicationBank = APPLICATION_BANK;
KANJI_G2.relationshipBank = RELATIONSHIP_BANK;
KANJI_G2.explanationGlossary = EXPLANATION_GLOSSARY;
KANJI_G2.autoBlankSpecs = AUTO_BLANK_SPECS;
KANJI_G2.domLabels = DOM_LABELS;
KANJI_G2.sharedPrereqNodes = SHARED_PREREQ_NODES;
KANJI_G2.wireL1toL2 = wireL1toL2;

window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
window.TD_CARTRIDGES.push(KANJI_G2);
window.KANJI_G2_CARTRIDGE = KANJI_G2;
```

### 3g. Register in index.html

Add this line after the Grade 1 cartridge script tag:
```html
<script src="./kanji-g2-cartridge.js"></script>
```

### 3h. Validate

Run `node validate-cartridge.js kanji-g2-cartridge.js` — all 12 rules must pass with 0 failures.

## Execution Order

1. **Task 1** (bug fix) — smallest, do first, in `index.html`
2. **Task 2** (kana DAG) — in `kanji-g1-cartridge-v2.js`, then validate
3. **Task 3** (Grade 2 cartridge) — new file `kanji-g2-cartridge.js`, register in `index.html`, then validate

## Files Modified
- `index.html` — safety valve fix (Task 1) + new script tag (Task 3)
- `kanji-g1-cartridge-v2.js` — new DAG nodes + wiring (Task 2)
- `kanji-g2-cartridge.js` — **new file** (Task 3)

## Important Constraints
- Do NOT merge Grade 1 and Grade 2 into one cartridge — they are separate
- Do NOT modify the engine beyond the safety valve fix and script tag addition
- Do NOT modify `handleMiss()`, `clearQuizAnswerFeedback()`, or `queueQuizChoiceResolution()`
- Do NOT add stroke-order animation UI
- Do NOT use external data sources — hand-author all content
- Every APPLICATION_BANK scenario must NOT give away the answer (no "A word meaning X")
- Every subconcept must have 2 distinct wrong answers (no duplicates)
- Run the validator after each task
