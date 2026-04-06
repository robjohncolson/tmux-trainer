# Codex Prompt: Grade 6 Kanji Cartridge (191 kanji)

## Context

You are working in the `tmux-trainer` project. Read the full spec in `kanji-g6-spec.md`.

**Key reference files** (read before writing code):
- `kanji-g6-spec.md` — the specification
- `cartridge-authoring-guide.md` — engine contract
- `kanji-g5-cartridge.js` — structural template to follow exactly (Grade 5, 193 kanji)
- `kanji-g4-cartridge.js` — also useful reference (Grade 4, 202 kanji)
- `validate-cartridge.js` — validator: `node validate-cartridge.js <file>`
- `kanji-list.txt` — contains the Grade 6 kanji list

## Task: Create `kanji-g6-cartridge.js`

Create a new file `kanji-g6-cartridge.js` for 191 Grade 6 Joyo kanji. Follow the exact structure and patterns of `kanji-g5-cartridge.js`.

### Step 1: File Structure

Use the same IIFE pattern, helpers, and data-driven approach as `kanji-g5-cartridge.js`. The cartridges use a compact source-data array that gets expanded into commands at load time — replicate this pattern for G6.

Helpers to copy: `shuffleArr`, `uniqueBy`, `makeId`, `parseComponents`, `buildBlankLatex`, `normalizeLookup`, `pickDistinct`.

### Step 2: The 191 Commands

For each of these 191 kanji, provide source data:
```
干己寸亡尺収仁片穴冊処庁幼宇灰危机吸后至舌存宅我系孝困私否批忘乱卵延沿拡供券呼刻若宗承垂担宙忠届乳拝並宝枚胃映革巻看皇紅砂姿宣専泉洗染奏退段派背肺律恩株胸降骨座蚕射従純除将針値展討党納俳班秘俵陛朗異域郷済視捨推盛窓探著頂脳閉訪密訳郵欲翌割揮貴勤筋敬裁策詞就衆善創装尊痛晩補棒絹源署傷蒸聖誠暖腸賃腹幕盟預裏閣疑誤穀誌磁障銭層認暮模遺劇権熟諸蔵誕潮敵論激憲鋼樹縦操糖奮厳縮優覧簡難臨警臓
```

Each kanji needs:
- `id`: `k-{hex codepoint}` via `kanji.charCodeAt(0).toString(16)`
- `action`: Primary English gloss (1-3 words, concise)
- `tier`: `core` or `regular` — see spec for core candidates (~65 high-frequency)
- `dom`: `g6`
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
- `confusionSet`: 3 kanji IDs from Grade 6 (or cross-grade for overlapping groups)
- Use the confusable groups from the spec:
  - Body organ cluster (月 radical): 胃 胸 脳 腸 腹 肺 臓
  - Roof radical cluster: 宇 宅 宗 宙 宝 宣 密
  - Hand radical cluster: 担 拡 拝 推 揮 探 捨
  - Speech radical cluster: 詞 訳 訪 認 誌 誕 論 誠 誤 諸 警
  - Thread radical cluster: 純 絹 縦 縮
  - Metal radical cluster: 針 鋼 銭
  - Gate radical cluster: 閉 閣
  - Ethics cluster: 善 聖 誠 忠 孝 仁 尊
  - Authority cluster: 皇 陛 后 将 権 憲
  - Breathe pair: 呼 吸
  - Vertical/horizontal: 縦 横 (G3)
  - Clothing/fabric: 装 裏 絹 革
  - Buildings/institutions: 庁 閣 署 党
  - Performance/arts: 奏 俳 劇 映
  - Die/forget component: 亡 忘 望 (G4) 盟
  - Complete/sincerity: 盛 誠 成 (G4)
- Scenarios must NOT contain the English meaning or a direct translation

**EXPLANATION_GLOSSARY**: 1 entry per kanji with meaning, readings, example word.

**RELATIONSHIP_BANK**: `{}`

**AUTO_BLANK_SPECS**: `[]`

**DOM_LABELS**: `{'g6': ['Grade 6 (sixth-year elementary)']}`

### Step 4: Shared DAG

Copy the base DAG structure from `kanji-g5-cartridge.js` (which includes kana nodes, G1-G5 radicals). Add the new radical nodes from the spec:

- `radical-flesh-g6` (月/⺝ flesh, major cluster — 7 body organs)
- `radical-roof-g6` (宀 roof, extended)
- `radical-gate-g6` (門 gate, extended)
- `radical-bamboo-g6` (竹 bamboo, extended)
- `radical-bone` (骨 bone)
- `radical-leather` (革 leather)
- `radical-illness-g6` (疒 illness, extended)
- `radical-inch` (寸 inch/measure)
- `radical-hole` (穴 cave/hole)
- `radical-hand-g6` (扌 hand, extended)
- `radical-speech-g6` (言 speech, extended)

New L3 groupings:
- `body-organ-concepts` (the 7 body organs)
- `ethics-concepts` (virtue/morality cluster)
- `authority-concepts` (royalty/governance cluster)
- `performance-concepts` (creative arts cluster)

Include all kana→romaji L4-L5 nodes (copy from G5).

Update `wireL1toL2` to handle Grade 6 subconcept patterns. Add rules for the new radicals:

```javascript
[/radical.*月|⺝|flesh|meat|organ|body/i, ['radical-flesh-g6']],
[/radical.*宀|roof|house|shelter|home/i, ['radical-roof-g6']],
[/radical.*門|gate|door/i, ['radical-gate-g6']],
[/radical.*竹|⺮|bamboo/i, ['radical-bamboo-g6']],
[/radical.*骨|bone|skeleton/i, ['radical-bone']],
[/radical.*革|leather|hide/i, ['radical-leather']],
[/radical.*疒|illness|sick|disease|pain/i, ['radical-illness-g6']],
[/radical.*寸|inch|measure|hand/i, ['radical-inch']],
[/radical.*穴|hole|cave|hollow/i, ['radical-hole']],
[/radical.*扌|hand.*radical|grip|push|pull/i, ['radical-hand-g6']],
[/radical.*言|訁|speech|say|word|language/i, ['radical-speech-g6']],
[/organ|stomach|lung|brain|intestine|chest|abdomen/i, ['body-organ-concepts']],
[/virtue|moral|loyal|filial|benevolent|sacred|sincere|respect/i, ['ethics-concepts']],
[/emperor|empress|throne|royal|authority|constitution|power/i, ['authority-concepts']],
[/perform|play.*music|drama|theater|film|act/i, ['performance-concepts']],
```

Also carry forward ALL existing wireL1toL2 rules from G5 (kana, G1-G5 radicals, conceptual groupings).

### Step 5: generateQuestion()

Copy the `generateQuestion` function from `kanji-g5-cartridge.js` exactly. It handles identify, fillblank, variable, application with weight renormalization.

### Step 6: Registration

Bottom of IIFE:
```javascript
KANJI_G6.variableBank = VARIABLE_BANK;
KANJI_G6.applicationBank = APPLICATION_BANK;
KANJI_G6.relationshipBank = RELATIONSHIP_BANK;
KANJI_G6.explanationGlossary = EXPLANATION_GLOSSARY;
KANJI_G6.autoBlankSpecs = AUTO_BLANK_SPECS;
KANJI_G6.domLabels = DOM_LABELS;
KANJI_G6.sharedPrereqNodes = SHARED_PREREQ_NODES;
KANJI_G6.normalizeExplanationLookup = normalizeLookup;
KANJI_G6.buildExplanationBank = function() {
  const byId = {}, byLabel = {};
  EXPLANATION_GLOSSARY.forEach((entry, i) => {
    byId[i] = entry;
    entry.keys.forEach(k => { byLabel[normalizeLookup(k)] = entry; });
  });
  return { byId, byLabel };
};
KANJI_G6.wireL1toL2 = wireL1toL2;

window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
window.TD_CARTRIDGES.push(KANJI_G6);
window.KANJI_G6_CARTRIDGE = KANJI_G6;
```

### Step 7: Register in index.html

Add after the G5 script tag:
```html
<script src="./kanji-g6-cartridge.js"></script>
```

### Step 8: Validate

Run `node validate-cartridge.js kanji-g6-cartridge.js` — all 12 rules must pass with 0 failures. Expected summary: 191 commands, ~382-573 blanks, domain g6, tiers core+regular.

## Grade 6 Specific Notes

1. **Body organ cluster is the signature feature of G6**. 7 kanji (胃 胸 脳 腸 腹 肺 臓) all share the 月 (flesh) radical and mean internal organs. This is the densest same-radical same-semantic cluster in all of elementary school. confusionSets should heavily cross-reference within this group. Blank distractors should swap organ kanji (e.g., "心臓" blank with distractors 肺 胃 脳).

2. **Ethics/virtue kanji** (善 聖 誠 忠 孝 仁 尊) are abstract moral concepts. Application scenarios should use concrete situations: a student helping others (善), a loyal samurai (忠), respecting elders (孝), rather than dictionary definitions.

3. **己 vs 已 vs 巳**: Only 己 is in the elementary Joyo set, but the other two exist in Japanese. Subconcept should test: "己 has a fully open bottom stroke" as the distinguishing feature.

4. **Government buildings cluster** (庁 閣 署 党): These appear in real institutional names (都庁, 内閣, 警察署, 政党). Blanks should use these real compounds.

5. **This is the final elementary grade**. Grade 6 completes the 1,026 kyoiku kanji. The cartridge should feel like a capstone — the hardest kanji, the most complex radicals, the most abstract meanings.

6. **Cross-grade semantic pairs**: Several G6 kanji complete pairs started in earlier grades:
   - 閉 (G6 close) vs 開 (G3 open)
   - 縦 (G6 vertical) vs 横 (G3 horizontal)
   - 認 (G6 recognize) vs 識 (G5 know)
   - 痛 (G6 pain) vs 病 (G3 sick)
   - confusionSets should bridge these cross-grade pairs

## Important Constraints

- **New file only** — do not modify any existing cartridge files
- Only modify `index.html` to add the `<script>` tag
- Every APPLICATION_BANK scenario must NOT give away the answer
- Every subconcept must have 2 distinct wrong answers
- Follow the G5 cartridge data-driven pattern exactly (source array → expanded commands)
- Run validator after completion
