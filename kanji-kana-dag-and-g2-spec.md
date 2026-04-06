# Spec: Kana→Romaji DAG Nodes + Grade 2 Expansion + Wrong-Answer Timeout Fix

## 0. Validator Enhancement: Level-Monotonicity Check

### Problem
The DAG cycle check catches direct loops but not *latent* cycles from same-level cross-wiring. Example: `onyomi-kunyomi` (L4) → `katakana-vowels` (L4) is fine today, but if anyone later wires `katakana-vowels` → something → `onyomi-kunyomi`, the cycle won't be obvious until it's already committed.

### Fix
Add a rule to `validate-cartridge.js` (rule 10 enhancement): for every edge `A.prereqs includes B`, assert `B.level >= A.level`. Same-level is acceptable (siblings), but pointing *upward* (lower level number = closer to root) is a warning. This makes the DAG's layered structure enforceable, not just conventional.

```
WARN: node 'katakana-vowels' (L4) is a prereq of 'onyomi-kunyomi' (L4) — same-level wiring, verify no future back-edge risk
FAIL: node 'radical-mouth' (L2) is a prereq of 'hiragana-reading' (L4) — prereq points upward (L2 < L4)
```

## 1. Kana→Romaji Prerequisite DAG Nodes

### Problem
When a student misses a reading-related subconcept (e.g., "In 一日, what is the reading?"), the DAG decomposes into nodes like `onyomi-kunyomi` and `hiragana-reading`. But `hiragana-reading` is currently a leaf node with a single generic question. A student who can't read ひらがな or カタカナ needs actual kana practice, not just a concept question.

### Solution
Add kana→romaji test nodes at L4-L5 of the shared prerequisite DAG. When a student fails a reading subconcept, they drill down into actual kana recognition.

### New Shared Prereq Nodes

**L4 — Kana Category Nodes** (wire from existing `hiragana-reading` and `onyomi-kunyomi`):

| Node ID | Type | Question | Correct | Wrong | Prereqs |
|---------|------|----------|---------|-------|---------|
| `hiragana-vowels` | computational | What is the romaji for あ い う え お? | a i u e o | e i u o a, a e i o u | `kana-basics` |
| `hiragana-ka-row` | computational | What is the romaji for か? | ka | ga, ki | `kana-basics` |
| `hiragana-sa-row` | computational | What is the romaji for さ? | sa | za, shi | `kana-basics` |
| `hiragana-ta-row` | computational | What is the romaji for た? | ta | da, chi | `kana-basics` |
| `hiragana-na-row` | computational | What is the romaji for な? | na | ni, nu | `kana-basics` |
| `hiragana-ha-row` | computational | What is the romaji for は? | ha | ba, pa | `kana-basics` |
| `hiragana-ma-row` | computational | What is the romaji for ま? | ma | mi, na | `kana-basics` |
| `hiragana-ya-row` | computational | What is the romaji for や? | ya | yu, wa | `kana-basics` |
| `hiragana-ra-row` | computational | What is the romaji for ら? | ra | la, ri | `kana-basics` |
| `hiragana-wa-n` | computational | What is the romaji for ん? | n | m, ng | `kana-basics` |
| `katakana-vowels` | computational | What is the romaji for ア イ ウ エ オ? | a i u e o | e i u o a, ka ki ku ke ko | `kana-basics` |
| `katakana-ka-row` | computational | What is the romaji for カ? | ka | ga, sa | `kana-basics` |
| `katakana-sa-row` | computational | What is the romaji for サ? | sa | za, ka | `kana-basics` |
| `katakana-ta-row` | computational | What is the romaji for タ? | ta | da, ka | `kana-basics` |
| `katakana-na-row` | computational | What is the romaji for ナ? | na | ni, ma | `kana-basics` |

**L5 — Leaf Node**:

| Node ID | Type | Question | Correct | Wrong | Prereqs |
|---------|------|----------|---------|-------|---------|
| `kana-basics` | conceptual | Japanese has two phonetic scripts. What are they called? | Hiragana and Katakana | Romaji and Kanji, Hiragana and Romaji | [] |

### Wiring Changes

Update existing nodes:
- `hiragana-reading` (currently L4 leaf): add prereqs `['hiragana-vowels', 'hiragana-ka-row', 'hiragana-sa-row', 'hiragana-ta-row', 'hiragana-na-row']`
- `onyomi-kunyomi` (currently L4): add prereqs `['katakana-vowels', 'katakana-ka-row']` (on'yomi is written in katakana)

Update `wireL1toL2` rules:
- Subconcepts matching `/reading|よみ|romaji/i` should wire to `hiragana-reading` (which now cascades to kana nodes)
- Subconcepts matching `/カタカナ|katakana|オン/i` should wire to `katakana-vowels`

### DAG Depth After Change
- L0: Kanji command
- L1: Subconcepts (auto)
- L2: Radical nodes
- L3: Conceptual groupings
- L4: Reading foundations (hiragana-reading, onyomi-kunyomi) + Kana category nodes (hiragana-vowels, katakana-ka-row, etc.)
- L5: `kana-basics` leaf + `stroke-basics` leaf

---

## 2. Grade 2 Kanji Cartridge (160 kanji)

### Approach
Create `kanji-g2-cartridge.js` as a new file following the exact same structure as the v2 Grade 1 cartridge. This is a **separate cartridge**, not merged into Grade 1.

### Kanji List (from kanji-list.txt)
```
刀丸弓工才万引牛元戸午公今止少心切太内父分方毛友外兄古広市矢台冬半母北用羽回会交光考行合寺自色西多地池当同肉米毎何角汽近形言谷作社図声走体弟売麦来里画岩京国姉知長直店東歩妹明門夜科海活計後思室首秋春食星前茶昼点南風夏家記帰原高紙時弱書通馬魚強教黄黒細週雪船組鳥野理雲絵間場晴朝答道買番園遠楽新数電話歌語算読聞鳴線親頭顔曜
```

160 kanji total.

### Cartridge Metadata
```javascript
{
  id: 'joyo-kanji-g2',
  name: 'Joyo Kanji - Grade 2',
  description: 'Kanji defense for 160 Grade 2 (elementary year 2) Joyo kanji',
  icon: '語',
  inputMode: 'quiz',
  title: 'KANJI 二年',
  subtitle: 'DEFENSE',
  startButton: '出陣',
  identifyPrompt: 'What is the meaning of this kanji?',
  variablePrompt: 'What does <span id="var-symbol" style="display:inline-block"></span> represent in this kanji?',
  applicationPrompt: 'Which kanji fits this context?',
}
```

### Command Schema
Same as Grade 1 v2:
- `id`: `k-{hex codepoint}` (e.g., `k-5200` for 刀)
- `dom`: `g2`
- `tier`: ~50 `core` (high-frequency: say, think, come, go, eat, buy, read, write, hear, talk, etc.), ~110 `regular`
- `blanks[2-3]`: compound-completion, varied distractors from confusable sets
- `subconcepts[3]`: radical/reading/meaning, no duplicate wrongs

### Tier Assignment (core candidates for Grade 2)
High-frequency kanji that appear in everyday vocabulary: 万 引 元 今 少 心 切 内 分 方 友 会 光 行 合 自 色 多 地 当 同 毎 何 近 言 作 声 走 体 来 国 知 長 店 東 歩 明 門 夜 海 後 思 食 前 家 高 時 書 通 強 教 道 買 新 電 話 語 読 聞 頭 (roughly 60)

### Banks

**VARIABLE_BANK**: 2-3 component/radical entries per kanji. Grade 2 has more complex kanji with identifiable radicals (e.g., 語 = 言 + 五 + 口).

**APPLICATION_BANK**: 1 scenario per kanji. Context-based clues that do NOT give away the meaning. Same style as the rewritten Grade 1 scenarios.

**EXPLANATION_GLOSSARY**: 1 entry per kanji with meaning, on/kun readings, example word.

**RELATIONSHIP_BANK**: Empty `{}`

**DOM_LABELS**: `{'g2': ['Grade 2 (second-year elementary)']}`

### Confusable Sets for Grade 2

| Group | Kanji | Type |
|-------|-------|------|
| Sword/blade | 刀 切 分 | Visual (blade component) |
| Circle/round | 丸 円 (G1) 回 | Semantic |
| Parent pair | 父 母 兄 姉 妹 弟 | Family semantic cluster |
| Direction | 東 西 南 北 | Cardinal directions |
| Season | 春 夏 秋 冬 | Seasons |
| Animal | 牛 馬 魚 鳥 | Animals |
| Communication | 言 話 語 読 聞 声 | Language/communication |
| Movement | 行 来 走 歩 通 | Movement verbs |
| Time | 朝 昼 夜 | Time of day |
| Weather | 雲 雪 風 晴 | Weather |
| Building | 店 家 室 門 園 | Buildings/places |
| Food | 食 米 肉 茶 麦 | Food |
| Color | 黄 黒 (+ G1: 赤 青 白) | Colors cross-grade |

### Shared DAG Nodes
Reuse the Grade 1 DAG structure. Grade 2 adds more radicals:

New radical nodes at L2:
- `radical-sword` (刀/刂)
- `radical-speech` (言/訁)
- `radical-walk` (辶)
- `radical-gate` (門) — already exists from G1
- `radical-food` (食/飠)
- `radical-horse` (馬)
- `radical-bird` (鳥)
- `radical-rice` (米)

New conceptual groupings at L3:
- `family-relationships` (parent/sibling terms)
- `direction-concepts` (already exists, expand)
- `time-concepts` (seasons, time of day)
- `communication-concepts` (speech, reading, writing)

The kana→romaji nodes from Section 1 are shared across both cartridges.

### Registration
Add `<script src="./kanji-g2-cartridge.js"></script>` to `index.html` alongside the Grade 1 script.

---

## 3. Wrong-Answer Timeout Bug Fix

### Problem
When a player gets a wrong answer, `handleMiss()` is deferred inside `resolveFn` (index.html:4007-4023). This function only executes when the player presses spacebar or clicks "GOT IT". If the player waits 5+ seconds, the safety valve at line 3697 calls `clearQuizAnswerFeedback()` which:
1. Clears the UI lock
2. **Nulls `heldCallback`** (line 3947)
3. Never calls `handleMiss()`

Result: no BKT update, no SRS penalty, no DAG decomposition, no streak reset. The wrong answer is erased.

### Root Cause
Line 3992: `const delay = isCorrect ? 220 : 0;`

Wrong answers get `delay=0`, which means `QUIZ_ANSWER_FEEDBACK.held = true` and the game waits forever for user input. The 5-second safety valve then clears the lock without applying penalties.

### Fix
The safety valve at line 3697-3699 should call `resolveFn` (via `heldCallback`) instead of just clearing the UI. Change:

```javascript
// BEFORE (line 3697-3699):
if(QUIZ_ANSWER_FEEDBACK.locked&&QUIZ_ANSWER_FEEDBACK.lockedAt&&Date.now()-QUIZ_ANSWER_FEEDBACK.lockedAt>5000){
  clearQuizAnswerFeedback();
}

// AFTER:
if(QUIZ_ANSWER_FEEDBACK.locked&&QUIZ_ANSWER_FEEDBACK.lockedAt&&Date.now()-QUIZ_ANSWER_FEEDBACK.lockedAt>5000){
  if(QUIZ_ANSWER_FEEDBACK.heldCallback){
    QUIZ_ANSWER_FEEDBACK.held=false;
    QUIZ_ANSWER_FEEDBACK.heldCallback();
  }else{
    clearQuizAnswerFeedback();
  }
}
```

This ensures that after 5 seconds, `handleMiss()` fires automatically — the student cannot avoid the penalty by waiting. The "GOT IT" button and spacebar still work as early dismissal.

### Impact
- `updateInput()` (called every frame) — only the safety-valve branch changes
- `handleMiss()` — no change, just now always gets called
- `clearQuizAnswerFeedback()` — no change
- `queueQuizChoiceResolution()` — no change

### Testing
1. Get a wrong answer, press spacebar immediately → penalty applied (existing behavior, unchanged)
2. Get a wrong answer, click GOT IT → penalty applied (existing behavior, unchanged)
3. Get a wrong answer, wait 5+ seconds → penalty now applied automatically (bug fixed)
4. Get a correct answer → auto-resolves after 220ms (unchanged)
