# Codex Prompt: Grade 4 Kanji Cartridge (202 kanji)

## Context

You are working in the `tmux-trainer` project. Read the full spec in `kanji-g4-spec.md`.

**Key reference files** (read before writing code):
- `kanji-g4-spec.md` — the specification
- `cartridge-authoring-guide.md` — engine contract
- `kanji-g3-cartridge.js` — structural template to follow exactly (Grade 3, 200 kanji)
- `kanji-g2-cartridge.js` — also useful reference (Grade 2, 160 kanji)
- `validate-cartridge.js` — validator: `node validate-cartridge.js <file>`
- `kanji-list.txt` — contains the Grade 4 kanji list

## Task: Create `kanji-g4-cartridge.js`

Create a new file `kanji-g4-cartridge.js` for 202 Grade 4 Joyo kanji. Follow the exact structure and patterns of `kanji-g3-cartridge.js`.

### Step 1: File Structure

Use the same IIFE pattern, helpers, and data-driven approach as `kanji-g3-cartridge.js`. The G3 cartridge uses a compact source-data array that gets expanded into commands at load time — replicate this pattern for G4.

Helpers to copy from G3: `shuffleArr`, `uniqueBy`, `makeId`, `parseComponents`, `buildBlankLatex`, `normalizeLookup`, `pickDistinct`.

### Step 2: The 202 Commands

For each of these 202 kanji, provide source data:
```
欠氏井不夫以加功札司失必付辺包末未民令衣印各共好成争仲兆伝灯老位改完岐希求芸佐材児初臣折束沖低努阪兵別利良冷労英岡果芽官季泣協径固刷参治周松卒底的典奈念府阜法牧例茨栄軍建香昨祝城信省浅単栃飛変便約勇要案害挙訓郡候差残借笑席倉孫帯徒特梅浴料連貨械健康菜埼崎産鹿唱清巣側梨敗票副望陸媛賀街覚給極景結最散滋順焼然隊達博飯富満無量愛塩群試辞照節戦続置働管関旗漁熊察種静説徳億課潟器縄選熱標養輪機積録観験類願鏡議競
```

Each kanji needs:
- `id`: `k-{hex codepoint}` via `kanji.charCodeAt(0).toString(16)`
- `action`: Primary English gloss (1-3 words, concise)
- `tier`: `core` or `regular` — see spec for core candidates (~70 high-frequency)
- `dom`: `g4`
- On-yomi and kun-yomi readings
- Example word with reading and meaning
- A second example word for blank variety
- Component/radical spec (2-3 components separated by semicolons, format `component:description`)
- Scenario: 1-2 sentence context clue that does NOT give away the English meaning

For each command object generated from source data:
- `hint`: Format as `'オン: X | くん: Y | 例: word (reading)'`
- `explain`: One sentence about usage, mnemonic, or disambiguation
- `latex`: The kanji character
- `blanks[2-3]`: Compound-completion using `\boxed{\,?\,}`. Vary distractors across blanks using confusable sets from the spec. `choices[0]` must always be the correct answer.
- `subconcepts[3]`: (1) radical/component question, (2) reading question, (3) meaning/vocabulary question. Each has `{q, correct, wrong}` where `wrong` has exactly 2 **distinct** strings.

### Step 3: Banks

**VARIABLE_BANK**: Built from the component spec — 2-3 `{s, d}` entries per command.

**APPLICATION_BANK**: Built from scenarios — 1 entry per command: `{scenario, confusionSet}`.
- `confusionSet`: 3 Grade 4 kanji IDs (or cross-grade IDs for overlapping groups)
- Use the confusable groups from the spec:
  - Mirror pair: 末/未
  - Person radical cluster: 仲 伝 位 佐 信 借 候 億 健 側 働
  - Water radical cluster: 浅 浴 清 治 沖 泣 滋 潟
  - Tree radical cluster: 松 梅 梨 栃 栄 機 械 極 標 材 果
  - Fire radical cluster: 灯 焼 然 熱 熊 照
  - Power radical cluster: 功 加 努 労 勇
  - Thread radical cluster: 結 続 縄 給
  - Walk radical cluster: 辺 連 達 選
  - Speech radical cluster: 訓 説 議 試
  - Grass radical cluster: 芸 英 芽 菜 茨
  - Military: 軍 兵 戦 隊
  - Government: 民 令 官 府 法 管 関 議
  - Prefecture names: 岐 奈 阪 岡 栃 茨 埼 崎 滋 媛 潟 熊 鹿 阜 賀 佐 沖
  - Health pair: 健 康
  - Test pair: 試 験
  - Compete cluster: 争 戦 競
  - Knife radical: 刷 別 副 利 初
- Scenarios must NOT contain the English meaning or a direct translation

**EXPLANATION_GLOSSARY**: 1 entry per kanji with meaning, readings, example word.

**RELATIONSHIP_BANK**: `{}`

**AUTO_BLANK_SPECS**: `[]`

**DOM_LABELS**: `{'g4': ['Grade 4 (fourth-year elementary)']}`

### Step 4: Shared DAG

Copy the base DAG structure from `kanji-g3-cartridge.js` (which includes kana nodes, G1/G2/G3 radicals). Add the new radical nodes from the spec:

- `radical-thread` (糸 thread/silk)
- `radical-grain` (禾 grain)
- `radical-shelter` (广 cliff/shelter)
- `radical-fire-g4` (火/灬 fire dots)
- `radical-grass-g4` (艹 grass, extended)
- `radical-power-g4` (力 power)
- `radical-earth-g4` (土 earth, extended)
- `radical-enclosure` (囗 enclosure)
- `radical-knife-g4` (刂/刀 knife)
- `radical-dish` (皿 dish/plate)
- `radical-roof-g4` (宀 roof, extended)

New L3 groupings:
- `government-concepts`
- `military-concepts`
- `measurement-concepts`
- `nature-g4-concepts`
- `prefecture-concepts`

Include all kana→romaji L4-L5 nodes (copy from G3).

Update `wireL1toL2` to handle Grade 4 subconcept patterns. Add rules for the new radicals:

```javascript
[/radical.*糸|thread|silk/i, ['radical-thread']],
[/radical.*禾|grain|rice plant/i, ['radical-grain']],
[/radical.*广|shelter|cliff/i, ['radical-shelter']],
[/radical.*火|灬|fire|flame|heat|burn/i, ['radical-fire-g4']],
[/radical.*艹|grass|plant|herb/i, ['radical-grass-g4']],
[/radical.*力|power|strength|effort/i, ['radical-power-g4']],
[/radical.*土|earth|ground/i, ['radical-earth-g4']],
[/radical.*囗|enclosure|surround/i, ['radical-enclosure']],
[/radical.*刂|刀|knife|blade|cut/i, ['radical-knife-g4']],
[/radical.*皿|dish|plate|vessel/i, ['radical-dish']],
[/radical.*宀|roof|house/i, ['radical-roof-g4']],
[/government|law|rule|official|authority|administration/i, ['government-concepts']],
[/military|army|soldier|troops|war|battle|defense/i, ['military-concepts']],
[/measure|count|amount|accumulate|volume|billion/i, ['measurement-concepts']],
[/prefecture|region|province|県|岐|奈|阪|岡|栃|茨|埼|崎|滋|媛|潟/i, ['prefecture-concepts']],
```

Also carry forward ALL existing wireL1toL2 rules from G3 (kana, G1/G2/G3 radicals, conceptual groupings).

### Step 5: generateQuestion()

Copy the `generateQuestion` function from `kanji-g3-cartridge.js` exactly. It handles identify, fillblank, variable, application with weight renormalization.

### Step 6: Registration

Bottom of IIFE:
```javascript
KANJI_G4.variableBank = VARIABLE_BANK;
KANJI_G4.applicationBank = APPLICATION_BANK;
KANJI_G4.relationshipBank = RELATIONSHIP_BANK;
KANJI_G4.explanationGlossary = EXPLANATION_GLOSSARY;
KANJI_G4.autoBlankSpecs = AUTO_BLANK_SPECS;
KANJI_G4.domLabels = DOM_LABELS;
KANJI_G4.sharedPrereqNodes = SHARED_PREREQ_NODES;
KANJI_G4.normalizeExplanationLookup = normalizeLookup;
KANJI_G4.buildExplanationBank = function() {
  const byId = {}, byLabel = {};
  EXPLANATION_GLOSSARY.forEach((entry, i) => {
    byId[i] = entry;
    entry.keys.forEach(k => { byLabel[normalizeLookup(k)] = entry; });
  });
  return { byId, byLabel };
};
KANJI_G4.wireL1toL2 = wireL1toL2;

window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
window.TD_CARTRIDGES.push(KANJI_G4);
window.KANJI_G4_CARTRIDGE = KANJI_G4;
```

### Step 7: Register in index.html

Add after the G3 script tag:
```html
<script src="./kanji-g4-cartridge.js"></script>
```

### Step 8: Validate

Run `node validate-cartridge.js kanji-g4-cartridge.js` — all 12 rules must pass with 0 failures. Expected summary: 202 commands, ~404-606 blanks, domain g4, tiers core+regular.

## Grade 4 Specific Notes

Grade 4 has several characteristics that differ from earlier grades:

1. **Prefecture kanji**: 17 kanji (岐 奈 阪 岡 栃 茨 埼 崎 滋 媛 潟 熊 鹿 阜 賀 佐 沖) are primarily known as parts of prefecture names. Scenarios and blanks should use the prefecture compound (e.g., 大阪, 新潟, 沖縄) rather than standalone meanings.

2. **Mirror confusion 末/未**: These two kanji differ only by which horizontal stroke is longer. The subconcept and blank distractors should exploit this confusion pair. 末 = end (bottom stroke longer), 未 = not yet (top stroke longer).

3. **Abstract concepts**: G4 introduces more abstract vocabulary (必 necessary, 約 promise/approximately, 然 naturally, 無 nothing, 類 type/kind). Blanks should use concrete compound words to ground the abstract meaning.

4. **Semantic pairs**: Several G4 kanji form natural pairs that should appear in each other's confusionSets: 健/康, 試/験, 争/競, 功/労, 末/未, 覚/観.

5. **Radical density**: G4 kanji average more strokes and more identifiable radical components than G1-G3. The VARIABLE_BANK should capture 2-3 components per kanji reliably.

## Important Constraints

- **New file only** — do not modify any existing cartridge files
- Only modify `index.html` to add the `<script>` tag
- Every APPLICATION_BANK scenario must NOT give away the answer
- Every subconcept must have 2 distinct wrong answers
- Follow the G3 cartridge data-driven pattern exactly (source array → expanded commands)
- Run validator after completion
