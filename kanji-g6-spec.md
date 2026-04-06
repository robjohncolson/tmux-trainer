# Spec: Grade 6 Kanji Cartridge (191 kanji)

## Goal
Create `kanji-g6-cartridge.js` as a new self-contained cartridge for 191 Grade 6 Joyo kanji. Follows the same architecture as `kanji-g3-cartridge.js` / `kanji-g4-cartridge.js`.

## Kanji List (from kanji-list.txt, Grade 6 — 191 kanji)
```
干己寸亡尺収仁片穴冊処庁幼宇灰危机吸后至舌存宅我系孝困私否批忘乱卵延沿拡供券呼刻若宗承垂担宙忠届乳拝並宝枚胃映革巻看皇紅砂姿宣専泉洗染奏退段派背肺律恩株胸降骨座蚕射従純除将針値展討党納俳班秘俵陛朗異域郷済視捨推盛窓探著頂脳閉訪密訳郵欲翌割揮貴勤筋敬裁策詞就衆善創装尊痛晩補棒絹源署傷蒸聖誠暖腸賃腹幕盟預裏閣疑誤穀誌磁障銭層認暮模遺劇権熟諸蔵誕潮敵論激憲鋼樹縦操糖奮厳縮優覧簡難臨警臓
```

## Cartridge Metadata
```javascript
{
  id: 'joyo-kanji-g6',
  name: 'Joyo Kanji - Grade 6',
  description: 'Kanji defense for 191 Grade 6 (elementary year 6) Joyo kanji',
  icon: '臓',
  inputMode: 'quiz',
  title: 'KANJI 六年',
  subtitle: 'DEFENSE',
  startButton: '出陣',
  identifyPrompt: 'What is the meaning of this kanji?',
  variablePrompt: 'What does <span id="var-symbol" style="display:inline-block"></span> represent in this kanji?',
  applicationPrompt: 'Which kanji fits this context?',
}
```

## Command Schema
Same as G1-G5:
- `id`: `k-{hex codepoint}`
- `dom`: `g6`
- `tier`: ~65 `core`, ~126 `regular`
- `blanks[2-3]`: compound-completion with varied distractors
- `subconcepts[3]`: radical/reading/meaning, no duplicate wrongs

## Tier Assignment (core candidates)
High-frequency kanji appearing in everyday vocabulary and JLPT N3-N2 level:
収 処 危 吸 存 宅 我 困 私 否 忘 乱 延 拡 供 呼 若 承 担 届 拝 並 宝 胃 映 革 看 宣 専 泉 洗 染 退 段 派 背 肺 律 恩 株 胸 降 骨 座 射 従 純 除 将 針 値 展 討 党 納 秘 異 域 済 視 捨 推 盛 窓 探 著 頂 脳 閉 訪 密 訳 欲 翌 割 貴 勤 筋 敬 裁 策 詞 就 衆 善 創 装 尊 痛 補 源 署 傷 暖 腸 認 層 模 遺 劇 権 熟 蔵 論 激 憲 樹 操 優 簡 難 臨 警 (roughly 65)

## Confusable Sets for Grade 6

| Group | Kanji | Type |
|-------|-------|------|
| Body/organ radical 月 | 胃 胸 脳 腸 腹 肺 臓 | Major radical cluster (7 body organs) |
| Roof radical 宀 | 宇 宅 宗 宙 宝 宣 密 | Shelter cluster |
| Hand radical 扌 | 担 拡 拝 推 揮 探 捨 | Action-hand cluster |
| Speech radical 言 | 詞 訳 訪 認 誌 誕 論 誠 誤 諸 警 | Communication cluster |
| Thread radical 糸 | 純 絹 縦 縮 | Thread cluster |
| Metal radical 金 | 針 鋼 銭 鏡 (G4) | Metal cluster |
| Gate radical 門 | 閉 閣 | Gate cluster |
| Bamboo radical 竹 | 筋 簡 | Bamboo cluster |
| Illness radical 疒 | 痛 | Illness cluster |
| Die/forget | 亡 忘 望 (G4) 盟 | 亡 as component |
| Breathe pair | 呼 吸 | Semantic pair (exhale/inhale) |
| Vertical/horizontal | 縦 横 (G3) | Semantic opposites |
| Complete/sincerity | 盛 誠 成 (G4) | 成 as shared component |
| Recognize | 認 識 (G5) | Semantic pair (acknowledge/know) |
| Obstacle/chapter | 障 章 (G3) | 章 is component of 障 |
| Loyalty/ethics | 善 聖 誠 忠 孝 仁 尊 | Ethics/virtue cluster |
| Authority/royalty | 皇 陛 后 将 権 憲 | Power/governance cluster |
| Value/plant | 値 植 (G3) | Visual similarity (直 component) |
| Actor/haiku | 俳 俵 | Visual similarity (亻+ 非/表) |
| Warm/dusk | 暖 暮 | Both have 日 component |
| Deposit | 預 貯 (G5) 蓄 | Semantic cluster (save/store) |
| Treasure/real | 宝 実 (G3) | Both under 宀 |
| Spray/steam | 蒸 蔵 | Both 艹 top + complex bottom |
| Nature | 泉 砂 潮 穀 | Natural elements |
| Art/performance | 奏 俳 劇 映 | Creative arts |
| Body organs (semantic) | 胃 胸 脳 腸 腹 肺 臓 骨 筋 | Medical/anatomy cluster |
| Clothing/fabric | 装 裏 絹 革 | Material/clothing cluster |
| Buildings/institutions | 庁 閣 署 党 | Government buildings |
| Cross-grade | 胃 vs 胸 腹 脳 (all G6 body); 閉 閣 vs 開 関 (G3/G4); 済 vs 斉; 痛 vs 病 (G3) | Level bridges |

## Banks

**VARIABLE_BANK**: 2-3 `{s, d}` entries per kanji decomposing into radicals/components. Grade 6 has the highest structural complexity in elementary school — nearly all kanji have 2-3 identifiable radicals.

**APPLICATION_BANK**: 1 scenario per kanji. Context-based clues that do NOT give away the English meaning. Same style as G1-G5 (describe the situation, not the word).

**EXPLANATION_GLOSSARY**: 1 entry per kanji: `{keys: ['kanji'], title: 'gloss', lines: ['Meaning: ...', 'On: ... | Kun: ...', 'Example: word (reading)']}`

**RELATIONSHIP_BANK**: `{}` (empty)

**AUTO_BLANK_SPECS**: `[]` (empty)

**DOM_LABELS**: `{'g6': ['Grade 6 (sixth-year elementary)']}`

## Shared DAG

Copy the DAG infrastructure from G5 (which includes kana nodes + G1-G5 radicals). Add new radical nodes at L2:

| Node ID | Radical | Examples |
|---------|---------|----------|
| `radical-flesh-g6` | 月/⺝ (flesh, major cluster) | 胃 胸 脳 腸 腹 肺 臓 |
| `radical-roof-g6` | 宀 (roof, extended) | 宇 宅 宗 宙 宝 宣 密 |
| `radical-gate-g6` | 門 (gate, extended) | 閉 閣 |
| `radical-bamboo-g6` | 竹 (bamboo, extended) | 筋 簡 |
| `radical-bone` | 骨 (bone) | 骨 |
| `radical-leather` | 革 (leather) | 革 |
| `radical-illness-g6` | 疒 (illness, extended) | 痛 |
| `radical-inch` | 寸 (inch/measure) | 寸 尊 導 (G5) 射 |
| `radical-hole` | 穴 (cave/hole) | 穴 窓 |
| `radical-hand-g6` | 扌 (hand, extended) | 担 拡 拝 推 揮 探 捨 |
| `radical-speech-g6` | 言 (speech, extended) | 詞 訳 訪 認 誌 誕 論 誠 誤 諸 警 |

New conceptual groupings at L3:
- `body-organ-concepts` (胃 胸 脳 腸 腹 肺 臓 — the 7 body organs)
- `ethics-concepts` (善 聖 誠 忠 孝 仁 尊)
- `authority-concepts` (皇 陛 后 将 権 憲)
- `performance-concepts` (奏 俳 劇 映)

Reuse existing L4-L5 kana nodes and reading foundation nodes.

## Grade 6 Specific Notes

1. **Body organ cluster**: 7 kanji (胃 胸 脳 腸 腹 肺 臓) all share the 月 (flesh) radical and refer to internal organs. This is the densest semantic cluster in any grade. confusionSets should cross-reference within this group heavily.

2. **Ethics/virtue kanji**: 善 聖 誠 忠 孝 仁 尊 are abstract moral concepts rarely encountered in daily conversation by students. Scenarios should use concrete situations (news stories, historical anecdotes) rather than dictionary definitions.

3. **Government vocabulary**: 庁 閣 署 党 権 憲 form a civics cluster. Blank compounds should use real institutional names (内閣, 警察署, 政党) to ground abstract governance concepts.

4. **Complexity ceiling**: Grade 6 has the most complex kanji in elementary school (臓 19 strokes, 警 19 strokes, 鋼 16 strokes). Component decomposition in VARIABLE_BANK is especially important for these multi-radical kanji.

5. **己 isolation**: 己 (self) is visually similar to 已 (already) and 巳 (snake/6th zodiac), but only 己 is in the Joyo elementary set. Subconcepts should test the "fully open bottom" distinguishing feature.

## generateQuestion()
Copy from G5 — identical 4-type weight renormalization.

## Registration
- Bottom of IIFE: `window.TD_CARTRIDGES.push(KANJI_G6); window.KANJI_G6_CARTRIDGE = KANJI_G6;`
- Add `<script src="./kanji-g6-cartridge.js"></script>` to `index.html` after the G5 script tag

## Validation
`node validate-cartridge.js kanji-g6-cartridge.js` must pass all 12 rules with 0 failures.

## Deep Link
`https://tmux-trainer.vercel.app/#deck=joyo-kanji-g6`
