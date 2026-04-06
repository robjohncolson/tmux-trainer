# Codex Prompt: Grade 5 Kanji Cartridge (193 kanji)

## Context

You are working in the `tmux-trainer` project. Read the full spec in `kanji-g5-spec.md`.

**Key reference files** (read before writing code):
- `kanji-g5-spec.md` — the specification
- `cartridge-authoring-guide.md` — engine contract
- `kanji-g4-cartridge.js` — structural template to follow exactly (Grade 4, 202 kanji)
- `kanji-g3-cartridge.js` — also useful reference (Grade 3, 200 kanji)
- `validate-cartridge.js` — validator: `node validate-cartridge.js <file>`
- `kanji-list.txt` — contains the Grade 5 kanji list

## Task: Create `kanji-g5-cartridge.js`

Create a new file `kanji-g5-cartridge.js` for 193 Grade 5 Joyo kanji. Follow the exact structure and patterns of `kanji-g4-cartridge.js`.

### Step 1: File Structure

Use the same IIFE pattern, helpers, and data-driven approach as `kanji-g4-cartridge.js`. The G4 cartridge uses a compact source-data array that gets expanded into commands at load time — replicate this pattern for G5.

Helpers to copy from G4: `shuffleArr`, `uniqueBy`, `makeId`, `parseComponents`, `buildBlankLatex`, `normalizeLookup`, `pickDistinct`.

### Step 2: The 193 Commands

For each of these 193 kanji, provide source data:
```
久士支比仏圧永可刊旧句史示犯布弁因仮件再在団任囲応快技均告災志似序条状判防余易往価河居効妻枝舎述招制性毒版肥非武紀逆型限故厚査政祖則独保迷益桜格個耕航財殺師修素造能破粉脈容留移液眼基寄規救許経険現混採授術常情責接設率断張停堂得貧婦務略営過喜検減証象税絶測属貸貯提程統費備評復報貿解幹義禁鉱罪資飼準勢損墓豊夢演慣境構際雑酸精製総像増態適銅複綿領歴確潔賛質賞導編暴衛興築燃輸講謝績額織職識護
```

Each kanji needs:
- `id`: `k-{hex codepoint}` via `kanji.charCodeAt(0).toString(16)`
- `action`: Primary English gloss (1-3 words, concise)
- `tier`: `core` or `regular` — see spec for core candidates (~70 high-frequency)
- `dom`: `g5`
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
- `confusionSet`: 3 kanji IDs from Grade 5 (or cross-grade for overlapping groups)
- Use the confusable groups from the spec:
  - Shell radical cluster: 財 貸 貯 費 貧 資 貿 質 賛 賞
  - Hand radical cluster: 技 採 授 接 招 損
  - Speech radical cluster: 許 証 設 講 識 謝 護 評
  - Thread radical cluster: 経 総 織 績 統 紀 編 複 綿 製
  - Person radical cluster: 仮 件 任 似 保 修 個 像
  - Walk radical cluster: 逆 迷 造 適
  - Water radical cluster: 液 混 減 測 潔 準
  - Evidence cluster: 証 象 像
  - Weave/work triplet: 識 織 職
  - Return/repeat pair: 復 複
  - Finance cluster: 財 税 貸 貯 費 資 貿 益 営 経
  - Governance cluster: 政 則 制 防 判 犯 禁 罪
- Scenarios must NOT contain the English meaning or a direct translation

**EXPLANATION_GLOSSARY**: 1 entry per kanji with meaning, readings, example word.

**RELATIONSHIP_BANK**: `{}`

**AUTO_BLANK_SPECS**: `[]`

**DOM_LABELS**: `{'g5': ['Grade 5 (fifth-year elementary)']}`

### Step 4: Shared DAG

Copy the base DAG structure from `kanji-g4-cartridge.js` (which includes kana nodes, G1-G4 radicals). Add the new radical nodes from the spec:

- `radical-shell-g5` (貝 shell/money)
- `radical-hand-g5` (扌 hand, extended)
- `radical-speech-g5` (言 speech, extended)
- `radical-stone-g5` (石 stone, extended)
- `radical-rice` (米 rice/grain)
- `radical-flesh-g5` (月/⺝ flesh)
- `radical-thread-g5` (糸 thread, extended)
- `radical-net` (罒 net)
- `radical-altar` (示/礻 show/altar)

New L3 groupings:
- `economics-concepts`
- `governance-g5-concepts`
- `body-g5-concepts`
- `measurement-g5-concepts`

Include all kana→romaji L4-L5 nodes (copy from G4).

Update `wireL1toL2` to handle Grade 5 subconcept patterns. Add rules for the new radicals:

```javascript
[/radical.*貝|shell|money|treasure/i, ['radical-shell-g5']],
[/radical.*扌|hand.*radical|grasp/i, ['radical-hand-g5']],
[/radical.*言|訁|speech|language|word|say/i, ['radical-speech-g5']],
[/radical.*石|stone|rock|mineral/i, ['radical-stone-g5']],
[/radical.*米|rice|grain|powder/i, ['radical-rice']],
[/radical.*月|⺝|flesh|meat|organ/i, ['radical-flesh-g5']],
[/radical.*糸|thread|silk|weave|fabric/i, ['radical-thread-g5']],
[/radical.*罒|net|cover/i, ['radical-net']],
[/radical.*示|礻|altar|ritual|show/i, ['radical-altar']],
[/econom|financ|money|tax|cost|price|trade|profit|wealth/i, ['economics-concepts']],
[/govern|politic|law|rule|justice|crime|punish|restrict/i, ['governance-g5-concepts']],
[/body.*part|flesh|organ|fat|vein|eye/i, ['body-g5-concepts']],
[/measure|average|rate|ratio|distance|statistic|degree/i, ['measurement-g5-concepts']],
```

Also carry forward ALL existing wireL1toL2 rules from G4 (kana, G1-G4 radicals, conceptual groupings).

### Step 5: generateQuestion()

Copy the `generateQuestion` function from `kanji-g4-cartridge.js` exactly. It handles identify, fillblank, variable, application with weight renormalization.

### Step 6: Registration

Bottom of IIFE:
```javascript
KANJI_G5.variableBank = VARIABLE_BANK;
KANJI_G5.applicationBank = APPLICATION_BANK;
KANJI_G5.relationshipBank = RELATIONSHIP_BANK;
KANJI_G5.explanationGlossary = EXPLANATION_GLOSSARY;
KANJI_G5.autoBlankSpecs = AUTO_BLANK_SPECS;
KANJI_G5.domLabels = DOM_LABELS;
KANJI_G5.sharedPrereqNodes = SHARED_PREREQ_NODES;
KANJI_G5.normalizeExplanationLookup = normalizeLookup;
KANJI_G5.buildExplanationBank = function() {
  const byId = {}, byLabel = {};
  EXPLANATION_GLOSSARY.forEach((entry, i) => {
    byId[i] = entry;
    entry.keys.forEach(k => { byLabel[normalizeLookup(k)] = entry; });
  });
  return { byId, byLabel };
};
KANJI_G5.wireL1toL2 = wireL1toL2;

window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
window.TD_CARTRIDGES.push(KANJI_G5);
window.KANJI_G5_CARTRIDGE = KANJI_G5;
```

### Step 7: Register in index.html

Add after the G4 script tag:
```html
<script src="./kanji-g5-cartridge.js"></script>
```

### Step 8: Validate

Run `node validate-cartridge.js kanji-g5-cartridge.js` — all 12 rules must pass with 0 failures. Expected summary: 193 commands, ~386-579 blanks, domain g5, tiers core+regular.

## Grade 5 Specific Notes

1. **貝 radical is the largest cluster** (10 kanji). All relate to money/value. Confusion sets should cross-reference within this group and with G4 economics kanji (貨, 料, 札).

2. **識/織/職 triplet**: These three are visually near-identical. The shared 音 component makes them the hardest disambiguation challenge in G5. Subconcepts should drill the distinguishing left radicals (言 vs 糸 vs 耳).

3. **復/複 pair**: Both contain 复. 復 = return/restore, 複 = duplicate/complex. Blank compounds should test the specific meaning (回復 vs 複雑).

4. **証/象/像 cluster**: 象 appears as a component in 像. 証 is a separate kanji but semantically close (evidence/proof vs image/elephant). confusionSets should group these.

5. **High abstraction level**: G5 introduces many abstract social/academic concepts (経済, 政治, 均等, 統計). Scenarios should use concrete everyday situations to make the abstract tangible.

## Important Constraints

- **New file only** — do not modify any existing cartridge files
- Only modify `index.html` to add the `<script>` tag
- Every APPLICATION_BANK scenario must NOT give away the answer
- Every subconcept must have 2 distinct wrong answers
- Follow the G4 cartridge data-driven pattern exactly (source array → expanded commands)
- Run validator after completion
