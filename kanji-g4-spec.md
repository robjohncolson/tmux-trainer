# Spec: Grade 4 Kanji Cartridge (202 kanji)

## Goal
Create `kanji-g4-cartridge.js` as a new self-contained cartridge for 202 Grade 4 Joyo kanji. Follows the same architecture as `kanji-g3-cartridge.js`.

## Kanji List (from kanji-list.txt, Grade 4 — 202 kanji)
```
欠氏井不夫以加功札司失必付辺包末未民令衣印各共好成争仲兆伝灯老位改完岐希求芸佐材児初臣折束沖低努阪兵別利良冷労英岡果芽官季泣協径固刷参治周松卒底的典奈念府阜法牧例茨栄軍建香昨祝城信省浅単栃飛変便約勇要案害挙訓郡候差残借笑席倉孫帯徒特梅浴料連貨械健康菜埼崎産鹿唱清巣側梨敗票副望陸媛賀街覚給極景結最散滋順焼然隊達博飯富満無量愛塩群試辞照節戦続置働管関旗漁熊察種静説徳億課潟器縄選熱標養輪機積録観験類願鏡議競
```

## Cartridge Metadata
```javascript
{
  id: 'joyo-kanji-g4',
  name: 'Joyo Kanji - Grade 4',
  description: 'Kanji defense for 202 Grade 4 (elementary year 4) Joyo kanji',
  icon: '令',
  inputMode: 'quiz',
  title: 'KANJI 四年',
  subtitle: 'DEFENSE',
  startButton: '出陣',
  identifyPrompt: 'What is the meaning of this kanji?',
  variablePrompt: 'What does <span id="var-symbol" style="display:inline-block"></span> represent in this kanji?',
  applicationPrompt: 'Which kanji fits this context?',
}
```

## Command Schema
Same as G1 v2, G2, and G3:
- `id`: `k-{hex codepoint}`
- `dom`: `g4`
- `tier`: ~70 `core`, ~132 `regular`
- `blanks[2-3]`: compound-completion with varied distractors
- `subconcepts[3]`: radical/reading/meaning, no duplicate wrongs

## Tier Assignment (core candidates)
High-frequency kanji appearing in everyday vocabulary and JLPT N4-N3 level:
不 以 加 必 付 民 成 伝 位 改 完 求 初 別 利 良 冷 労 英 果 官 協 参 治 的 念 法 例 建 信 省 単 飛 変 便 約 要 案 害 候 差 残 借 席 特 料 連 健 康 産 清 望 覚 給 景 結 最 散 然 達 飯 満 無 量 愛 試 節 戦 続 置 働 関 種 静 説 選 熱 養 機 積 録 観 験 類 願 議 競 (roughly 70)

## Confusable Sets for Grade 4

| Group | Kanji | Type |
|-------|-------|------|
| Mirror pair | 末 未 | Visual (stroke length swapped) |
| Clan/people | 氏 民 | Visual + semantic |
| Lack/blow | 欠 次 (G3) | Visual (欠 component) |
| Cold command | 令 冷 | 令 is component of 冷 |
| Trust/transmit | 信 伝 | 亻 radical + communication |
| Compete/fight | 争 戦 競 | Semantic cluster |
| Win/lose | 勝 (G3) 敗 | Semantic opposites |
| Change/convenience | 変 便 | Visual similarity |
| Health pair | 健 康 | Semantic pair (health) |
| Test/examine | 試 験 | Semantic pair (testing) |
| See/observe | 覚 観 鏡 | Perception/seeing cluster |
| Thread radical 糸 | 結 続 縄 給 | Radical cluster |
| Water radical 氵 | 浅 浴 清 治 沖 泣 滋 潟 | Radical cluster |
| Tree radical 木 | 松 梅 梨 栃 栄 機 械 極 標 材 果 | 木 component cluster |
| Fire radical 火/灬 | 灯 焼 然 熱 熊 照 | Fire/heat cluster |
| Power radical 力 | 功 加 努 労 勇 | 力 component cluster |
| Grass radical 艹 | 芸 英 芽 菜 茨 | Grass-top cluster |
| Person radical 亻 | 仲 伝 位 佐 信 借 候 億 健 側 働 | Person-left cluster |
| Walk radical 辶 | 辺 連 達 選 | Road-bottom cluster |
| Speech radical 言/訁 | 訓 説 議 試 | Speech-left cluster |
| Metal radical 金/釒 | 鏡 録 | Metal cluster |
| Earth radical 土 | 城 塩 埼 | Earth cluster |
| Shelter radical 广 | 府 康 | Cliff-top cluster |
| Military | 軍 兵 戦 隊 | Semantic cluster |
| Government/law | 民 令 官 府 法 管 関 議 | Governance cluster |
| Nature/plants | 松 梅 梨 菜 芽 果 牧 | Flora cluster |
| Animals | 鹿 熊 漁 | Fauna/related cluster |
| Prefecture names | 岐 奈 阪 岡 栃 茨 埼 崎 滋 媛 潟 熊 鹿 阜 賀 佐 沖 | Geography cluster |
| Measurement | 量 積 億 | Quantity cluster |
| Buildings/places | 倉 城 席 街 | Structure cluster |
| Money/goods | 貨 札 賀 給 料 | Value cluster |
| Cross-grade confusables | 末 未 vs 本 (G1); 氏 民 vs 名 (G1); 努 労 vs 力 (G1); 老 vs 者 (G3) | Level bridges |

## Banks

**VARIABLE_BANK**: 2-3 `{s, d}` entries per kanji decomposing into radicals/components. Grade 4 kanji are structurally complex — most have 2-3 identifiable radicals.

**APPLICATION_BANK**: 1 scenario per kanji. Context-based clues that do NOT give away the English meaning. Same style as G1 v2, G2, and G3 (describe the situation, not the word).

**EXPLANATION_GLOSSARY**: 1 entry per kanji: `{keys: ['kanji'], title: 'gloss', lines: ['Meaning: ...', 'On: ... | Kun: ...', 'Example: word (reading)']}`

**RELATIONSHIP_BANK**: `{}` (empty)

**AUTO_BLANK_SPECS**: `[]` (empty)

**DOM_LABELS**: `{'g4': ['Grade 4 (fourth-year elementary)']}`

## Shared DAG

Copy the DAG infrastructure from G3 (which includes kana nodes + G1/G2/G3 radicals). Add new radical nodes at L2:

| Node ID | Radical | Examples |
|---------|---------|----------|
| `radical-thread` | 糸 (thread/silk) | 結 続 縄 給 |
| `radical-grain` | 禾 (grain) | 種 積 |
| `radical-shelter` | 广 (cliff/shelter) | 府 康 |
| `radical-fire-g4` | 火/灬 (fire dots) | 灯 焼 然 熱 熊 照 |
| `radical-grass-g4` | 艹 (grass, extended) | 芸 英 芽 菜 茨 |
| `radical-power-g4` | 力 (power) | 功 加 努 労 勇 |
| `radical-earth-g4` | 土 (earth, extended) | 城 塩 埼 |
| `radical-enclosure` | 囗 (enclosure) | 固 |
| `radical-knife-g4` | 刂/刀 (knife) | 刷 別 副 利 初 |
| `radical-dish` | 皿 (dish/plate) | 皿 塩 |
| `radical-roof-g4` | 宀 (roof, extended) | 完 官 害 |

New conceptual groupings at L3:
- `government-concepts` (民 令 官 府 法 管 関 議)
- `military-concepts` (軍 兵 戦 隊)
- `measurement-concepts` (量 積 億)
- `nature-g4-concepts` (松 梅 梨 菜 芽 果 漁 熊)
- `prefecture-concepts` (岐 奈 阪 岡 栃 茨 埼 崎 滋 媛 潟 熊 鹿 阜 賀 佐 沖)

Reuse existing L4-L5 kana nodes and reading foundation nodes.

## generateQuestion()
Copy from G3 — identical 4-type weight renormalization.

## Registration
- Bottom of IIFE: `window.TD_CARTRIDGES.push(KANJI_G4); window.KANJI_G4_CARTRIDGE = KANJI_G4;`
- Add `<script src="./kanji-g4-cartridge.js"></script>` to `index.html` after the G3 script tag

## Validation
`node validate-cartridge.js kanji-g4-cartridge.js` must pass all 12 rules with 0 failures.

## Deep Link
`https://tmux-trainer.vercel.app/#deck=joyo-kanji-g4`
