# Codex Prompt: Grade 3 Kanji Cartridge (200 kanji)

## Context

You are working in the `tmux-trainer` project. Read the full spec in `kanji-g3-spec.md`.

**Key reference files** (read before writing code):
- `kanji-g3-spec.md` — the specification
- `cartridge-authoring-guide.md` — engine contract
- `kanji-g2-cartridge.js` — structural template to follow exactly (Grade 2, 160 kanji)
- `kanji-g1-cartridge-v2.js` — also useful reference (Grade 1, 80 kanji)
- `validate-cartridge.js` — validator: `node validate-cartridge.js <file>`
- `kanji-list.txt` — contains the Grade 3 kanji list

## Task: Create `kanji-g3-cartridge.js`

Create a new file `kanji-g3-cartridge.js` for 200 Grade 3 Joyo kanji. Follow the exact structure and patterns of `kanji-g2-cartridge.js`.

### Step 1: File Structure

Use the same IIFE pattern, helpers, and data-driven approach as `kanji-g2-cartridge.js`. The G2 cartridge uses a compact source-data array that gets expanded into commands at load time — replicate this pattern for G3.

### Step 2: The 200 Commands

For each of these 200 kanji, provide source data:
```
丁化区反予央去号皿仕写主申世他打代皮氷平由礼安曲血向死次式守州全有羊両列医究局君決住助身対投豆坂返役委育泳岸苦具幸使始事実者取受所昔注定波板表服物放味命油和屋界客急級係研県指持拾重昭乗神相送待炭柱追度畑発美秒品負面洋員院荷起宮庫根酒消真息速庭島配倍病勉流旅悪球祭終習宿商章深進族第帳笛転都動部問飲運温開階寒期軽湖港歯集暑勝植短着湯登等童悲筆遊葉陽落暗意感漢業詩想鉄農福路駅銀鼻様緑練横談調箱館橋整薬題
```

Each kanji needs:
- `id`: `k-{hex codepoint}` via `kanji.charCodeAt(0).toString(16)`
- `action`: Primary English gloss (1-3 words, concise)
- `tier`: `core` or `regular` — see spec for core candidates (~65 high-frequency)
- `dom`: `g3`
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
- `confusionSet`: 3 Grade 3 kanji IDs (or cross-grade IDs for overlapping groups like colors/body-parts)
- Use the confusable groups from the spec (water radical cluster, person-action cluster, movement verbs, building/place, nature, emotion/heart radical, metal radical, etc.)
- Scenarios must NOT contain the English meaning or a direct translation

**EXPLANATION_GLOSSARY**: 1 entry per kanji with meaning, readings, example word.

**RELATIONSHIP_BANK**: `{}`

**AUTO_BLANK_SPECS**: `[]`

**DOM_LABELS**: `{'g3': ['Grade 3 (third-year elementary)']}`

### Step 4: Shared DAG

Copy the base DAG structure from `kanji-g2-cartridge.js` (which includes kana nodes and G1/G2 radicals). Add the new radical nodes from the spec:

- `radical-water-g3` (氵)
- `radical-person-action` (亻)
- `radical-road` (辶)
- `radical-gate` (門)
- `radical-illness` (疒)
- `radical-metal-g3` (金/釒)
- `radical-heart-g3` (忄/心)
- `radical-cloth` (衤)
- `radical-stone` (石)
- `radical-bamboo-g3` (竹)

New L3 groupings:
- `emotion-concepts`
- `geography-concepts`
- `health-concepts`

Include all kana→romaji L4-L5 nodes.

Update `wireL1toL2` to handle Grade 3 subconcept patterns — more radicals, more reading patterns.

### Step 5: generateQuestion()

Copy the `generateQuestion` function from `kanji-g2-cartridge.js` exactly. It handles identify, fillblank, variable, application with weight renormalization.

### Step 6: Registration

Bottom of IIFE:
```javascript
KANJI_G3.variableBank = VARIABLE_BANK;
KANJI_G3.applicationBank = APPLICATION_BANK;
KANJI_G3.relationshipBank = RELATIONSHIP_BANK;
KANJI_G3.explanationGlossary = EXPLANATION_GLOSSARY;
KANJI_G3.autoBlankSpecs = AUTO_BLANK_SPECS;
KANJI_G3.domLabels = DOM_LABELS;
KANJI_G3.sharedPrereqNodes = SHARED_PREREQ_NODES;
KANJI_G3.wireL1toL2 = wireL1toL2;

window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
window.TD_CARTRIDGES.push(KANJI_G3);
window.KANJI_G3_CARTRIDGE = KANJI_G3;
```

### Step 7: Register in index.html

Add after the G2 script tag:
```html
<script src="./kanji-g3-cartridge.js"></script>
```

### Step 8: Validate

Run `node validate-cartridge.js kanji-g3-cartridge.js` — all 12 rules must pass with 0 failures. Expected summary: 200 commands, ~400-600 blanks, domain g3, tiers core+regular.

## Important Constraints

- **New file only** — do not modify `kanji-g1-cartridge-v2.js` or `kanji-g2-cartridge.js`
- Only modify `index.html` to add the `<script>` tag
- Every APPLICATION_BANK scenario must NOT give away the answer
- Every subconcept must have 2 distinct wrong answers
- Follow the G2 cartridge data-driven pattern exactly (source array → expanded commands)
- Run validator after completion
