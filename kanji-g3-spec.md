# Spec: Grade 3 Kanji Cartridge (200 kanji)

## Goal
Create `kanji-g3-cartridge.js` as a new self-contained cartridge for 200 Grade 3 Joyo kanji. Follows the same architecture as `kanji-g2-cartridge.js`.

## Kanji List (from kanji-list.txt, Grade 3 — 200 kanji)
```
丁化区反予央去号皿仕写主申世他打代皮氷平由礼安曲血向死次式守州全有羊両列医究局君決住助身対投豆坂返役委育泳岸苦具幸使始事実者取受所昔注定波板表服物放味命油和屋界客急級係研県指持拾重昭乗神相送待炭柱追度畑発美秒品負面洋員院荷起宮庫根酒消真息速庭島配倍病勉流旅悪球祭終習宿商章深進族第帳笛転都動部問飲運温開階寒期軽湖港歯集暑勝植短着湯登等童悲筆遊葉陽落暗意感漢業詩想鉄農福路駅銀鼻様緑練横談調箱館橋整薬題
```

## Cartridge Metadata
```javascript
{
  id: 'joyo-kanji-g3',
  name: 'Joyo Kanji - Grade 3',
  description: 'Kanji defense for 200 Grade 3 (elementary year 3) Joyo kanji',
  icon: '漢',
  inputMode: 'quiz',
  title: 'KANJI 三年',
  subtitle: 'DEFENSE',
  startButton: '出陣',
  identifyPrompt: 'What is the meaning of this kanji?',
  variablePrompt: 'What does <span id="var-symbol" style="display:inline-block"></span> represent in this kanji?',
  applicationPrompt: 'Which kanji fits this context?',
}
```

## Command Schema
Same as G1 v2 and G2:
- `id`: `k-{hex codepoint}`
- `dom`: `g3`
- `tier`: ~65 `core`, ~135 `regular`
- `blanks[2-3]`: compound-completion with varied distractors
- `subconcepts[3]`: radical/reading/meaning, no duplicate wrongs

## Tier Assignment (core candidates)
High-frequency kanji appearing in everyday vocabulary and JLPT N4-N3 level:
化 去 世 他 代 平 安 向 死 次 全 有 決 住 助 身 対 使 始 事 実 者 取 受 所 注 定 表 物 放 味 命 和 屋 界 客 急 係 研 県 持 重 乗 神 相 送 待 追 度 発 美 品 面 員 起 消 真 息 速 庭 島 病 勉 流 旅 悪 終 習 商 深 進 動 部 問 飲 運 温 開 寒 軽 集 勝 短 着 登 落 意 感 想 (roughly 65)

## Confusable Sets for Grade 3

| Group | Kanji | Type |
|-------|-------|------|
| Apply/return | 反 返 坂 | Visual (反 component) |
| Write/copy | 写 主 注 | Semantic + visual |
| Body/self | 身 自 (G2) | Semantic overlap |
| Hit/throw | 打 投 | Action verbs with 扌 radical |
| Water/liquid | 氷 波 泳 湖 湯 温 洋 油 酒 消 流 港 深 | 氵 radical cluster |
| Person actions | 仕 住 使 係 待 | 亻 radical cluster |
| Go/move | 去 返 追 送 進 運 転 遊 落 | Movement verbs |
| Speak/discuss | 談 調 話 (G2) 言 (G2) 読 (G2) | Communication |
| Building/place | 宮 庫 宿 院 館 屋 | Structures |
| Nature | 岸 島 畑 庭 湖 | Geography |
| Time | 昔 昭 暑 暗 | 日 radical cluster |
| Mouth actions | 号 味 命 飲 | 口 component |
| Plant/green | 植 葉 緑 薬 | 艹/木 radical cluster |
| Metal/value | 鉄 銀 駅 | 金 radical cluster |
| Contest/win | 勝 負 | Semantic opposites |
| Sickness | 病 悪 苦 | Negative conditions |
| Light/warmth | 陽 温 暑 | Warmth cluster |
| Cold/cool | 寒 氷 涼 | Cold cluster |
| Cross-grade confusables | 駅 (G3) vs 馬 (G2); 鼻 (G3) vs 目 耳 口 (G1) | Body/transport |

## Banks

**VARIABLE_BANK**: 2-3 `{s, d}` entries per kanji decomposing into radicals/components. Grade 3 kanji are more complex so most have 2-3 identifiable radicals.

**APPLICATION_BANK**: 1 scenario per kanji. Context-based clues that do NOT give away the English meaning. Same style as G1 v2 and G2 (describe the situation, not the word).

**EXPLANATION_GLOSSARY**: 1 entry per kanji: `{keys: ['kanji'], title: 'gloss', lines: ['Meaning: ...', 'On: ... | Kun: ...', 'Example: word (reading)']}`

**RELATIONSHIP_BANK**: `{}` (empty)

**AUTO_BLANK_SPECS**: `[]` (empty)

**DOM_LABELS**: `{'g3': ['Grade 3 (third-year elementary)']}`

## Shared DAG

Copy the DAG infrastructure from G2 (which includes kana nodes). Add new radical nodes at L2:

| Node ID | Radical | Examples |
|---------|---------|----------|
| `radical-water-g3` | 氵 (water) | 氷 波 泳 湖 湯 温 洋 油 酒 消 流 港 深 |
| `radical-person-action` | 亻 (person) | 仕 住 使 係 待 |
| `radical-road` | 辶 (road/walk) | 送 追 返 進 速 運 遊 |
| `radical-gate` | 門 (gate) | 開 問 間 関 |
| `radical-illness` | 疒 (sickness) | 病 |
| `radical-metal-g3` | 金/釒 (metal) | 鉄 銀 |
| `radical-earth-g3` | 土 (earth) | 坂 |
| `radical-heart-g3` | 忄/心 (heart/mind) | 悪 意 感 想 悲 |
| `radical-cloth` | 衤 (clothing) | 表 |
| `radical-stone` | 石 | 研 |
| `radical-bamboo-g3` | 竹 (bamboo) | 笛 箱 筆 第 等 |

New conceptual groupings at L3:
- `emotion-concepts` (悪 意 感 想 悲)
- `geography-concepts` (岸 島 畑 庭 湖)
- `health-concepts` (病 薬 医)

Reuse existing L4-L5 kana nodes and reading foundation nodes.

## generateQuestion()
Copy from G2 — identical 4-type weight renormalization.

## Registration
- Bottom of IIFE: `window.TD_CARTRIDGES.push(KANJI_G3); window.KANJI_G3_CARTRIDGE = KANJI_G3;`
- Add `<script src="./kanji-g3-cartridge.js"></script>` to `index.html` after the G2 script tag

## Validation
`node validate-cartridge.js kanji-g3-cartridge.js` must pass all 12 rules with 0 failures.

## Deep Link
`https://tmux-trainer.vercel.app/#deck=joyo-kanji-g3`
