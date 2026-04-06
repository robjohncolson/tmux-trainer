# Spec: Grade 5 Kanji Cartridge (193 kanji)

## Goal
Create `kanji-g5-cartridge.js` as a new self-contained cartridge for 193 Grade 5 Joyo kanji. Follows the same architecture as `kanji-g3-cartridge.js` / `kanji-g4-cartridge.js`.

## Kanji List (from kanji-list.txt, Grade 5 — 193 kanji)
```
久士支比仏圧永可刊旧句史示犯布弁因仮件再在団任囲応快技均告災志似序条状判防余易往価河居効妻枝舎述招制性毒版肥非武紀逆型限故厚査政祖則独保迷益桜格個耕航財殺師修素造能破粉脈容留移液眼基寄規救許経険現混採授術常情責接設率断張停堂得貧婦務略営過喜検減証象税絶測属貸貯提程統費備評復報貿解幹義禁鉱罪資飼準勢損墓豊夢演慣境構際雑酸精製総像増態適銅複綿領歴確潔賛質賞導編暴衛興築燃輸講謝績額織職識護
```

## Cartridge Metadata
```javascript
{
  id: 'joyo-kanji-g5',
  name: 'Joyo Kanji - Grade 5',
  description: 'Kanji defense for 193 Grade 5 (elementary year 5) Joyo kanji',
  icon: '経',
  inputMode: 'quiz',
  title: 'KANJI 五年',
  subtitle: 'DEFENSE',
  startButton: '出陣',
  identifyPrompt: 'What is the meaning of this kanji?',
  variablePrompt: 'What does <span id="var-symbol" style="display:inline-block"></span> represent in this kanji?',
  applicationPrompt: 'Which kanji fits this context?',
}
```

## Command Schema
Same as G1-G4:
- `id`: `k-{hex codepoint}`
- `dom`: `g5`
- `tier`: ~70 `core`, ~123 `regular`
- `blanks[2-3]`: compound-completion with varied distractors
- `subconcepts[3]`: radical/reading/meaning, no duplicate wrongs

## Tier Assignment (core candidates)
High-frequency kanji appearing in everyday vocabulary and JLPT N3-N2 level:
比 圧 永 可 旧 史 示 犯 布 因 仮 件 再 在 団 任 応 技 均 告 災 志 条 状 判 防 易 往 価 居 効 述 制 性 非 武 限 故 厚 査 政 則 独 保 迷 益 格 個 航 財 師 修 素 造 能 破 容 留 移 液 眼 基 規 救 許 経 険 現 混 採 授 術 常 情 責 接 設 率 断 張 停 得 貧 務 略 営 過 検 減 証 象 税 測 属 貸 提 程 統 費 備 評 復 報 解 義 禁 罪 資 準 勢 損 豊 演 慣 境 構 際 雑 精 製 総 像 増 態 適 複 領 歴 確 質 賞 導 編 暴 衛 興 築 輸 講 謝 績 額 織 職 識 護 (roughly 70)

## Confusable Sets for Grade 5

| Group | Kanji | Type |
|-------|-------|------|
| Shell radical 貝 | 財 貸 貯 費 貧 資 貿 質 賛 賞 | Major radical cluster (10 kanji) |
| Hand radical 扌 | 技 採 授 接 招 損 | Action-hand cluster |
| Speech radical 言 | 許 証 設 講 識 謝 護 評 | Communication cluster |
| Thread radical 糸 | 経 総 織 績 統 紀 編 複 綿 製 | Thread/silk cluster |
| Stone radical 石 | 破 確 鉱 | Stone cluster |
| Rice radical 米 | 精 粉 | Grain/powder cluster |
| Flesh radical 月 | 脈 肥 | Body cluster |
| Re/again pair | 再 在 | Visual similarity |
| Fake/similar | 仮 似 | Visual + semantic overlap |
| Investigate pair | 査 検 | Semantic pair |
| Evidence cluster | 証 象 像 | Visual (象 component shared) |
| Weave/work | 識 織 職 | Visual near-identical (音/耳+戈 variations) |
| Return/repeat | 復 複 | Visual (复 component shared) |
| Finance cluster | 財 税 貸 貯 費 資 貿 価 (G4) 益 営 経 | Economics semantic |
| Governance cluster | 政 則 制 防 判 犯 禁 罪 | Law/politics semantic |
| Measurement | 均 率 測 程 統 | Quantity/statistics |
| Body | 肥 脈 眼 | Physical body |
| Person radical 亻 | 仮 件 任 似 保 修 個 像 価 (G4) | Person-left cluster |
| Walk radical 辶 | 逆 迷 造 適 | Road cluster |
| Water radical 氵 | 液 混 減 測 潔 準 | Water cluster |
| Building | 堂 墓 築 舎 | Structure cluster |
| Nature | 桜 酸 鉱 銅 | Natural materials |
| Knowledge | 師 術 識 講 歴 | Education cluster |
| War/force | 武 衛 暴 | Military/violence |
| Cross-grade | 識 織 職 (all G5) vs 試 験 (G4); 精 製 vs 清 (G3); 復 複 vs 服 (G3) | Level bridges |

## Banks

**VARIABLE_BANK**: 2-3 `{s, d}` entries per kanji decomposing into radicals/components. Grade 5 kanji have high structural complexity — most have 2-3 identifiable radicals.

**APPLICATION_BANK**: 1 scenario per kanji. Context-based clues that do NOT give away the English meaning. Same style as G1-G4 (describe the situation, not the word).

**EXPLANATION_GLOSSARY**: 1 entry per kanji: `{keys: ['kanji'], title: 'gloss', lines: ['Meaning: ...', 'On: ... | Kun: ...', 'Example: word (reading)']}`

**RELATIONSHIP_BANK**: `{}` (empty)

**AUTO_BLANK_SPECS**: `[]` (empty)

**DOM_LABELS**: `{'g5': ['Grade 5 (fifth-year elementary)']}`

## Shared DAG

Copy the DAG infrastructure from G4 (which includes kana nodes + G1/G2/G3/G4 radicals). Add new radical nodes at L2:

| Node ID | Radical | Examples |
|---------|---------|----------|
| `radical-shell-g5` | 貝 (shell/money) | 財 貸 貯 費 貧 資 貿 質 賛 賞 |
| `radical-hand-g5` | 扌 (hand, extended) | 技 採 授 接 招 損 |
| `radical-speech-g5` | 言 (speech, extended) | 許 証 設 講 識 謝 護 評 |
| `radical-stone-g5` | 石 (stone, extended) | 破 確 鉱 |
| `radical-rice` | 米 (rice/grain) | 精 粉 |
| `radical-flesh-g5` | 月/⺝ (flesh) | 脈 肥 |
| `radical-thread-g5` | 糸 (thread, extended) | 経 総 織 績 統 紀 編 複 綿 製 |
| `radical-net` | 罒 (net) | 罪 |
| `radical-altar` | 示/礻 (show/altar) | 祖 示 |

New conceptual groupings at L3:
- `economics-concepts` (財 税 貸 貯 費 資 貿 価 益 営 経)
- `governance-g5-concepts` (政 則 制 防 判 犯 禁 罪)
- `body-g5-concepts` (肥 脈 眼)
- `measurement-g5-concepts` (均 率 測 程 統)

Reuse existing L4-L5 kana nodes and reading foundation nodes.

## generateQuestion()
Copy from G4 — identical 4-type weight renormalization.

## Registration
- Bottom of IIFE: `window.TD_CARTRIDGES.push(KANJI_G5); window.KANJI_G5_CARTRIDGE = KANJI_G5;`
- Add `<script src="./kanji-g5-cartridge.js"></script>` to `index.html` after the G4 script tag

## Validation
`node validate-cartridge.js kanji-g5-cartridge.js` must pass all 12 rules with 0 failures.

## Deep Link
`https://tmux-trainer.vercel.app/#deck=joyo-kanji-g5`
