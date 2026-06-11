# Kanji Immersion + JLPT N5 + Responsive Music — Spec

**Date**: 2026-06-10 · **Status**: awaiting sign-off · **Repo**: tmux-trainer (+ one-line roster-server allowlist change in follow-alongs)

Teacher decisions (locked): all of bundle A except speech synthesis; bundle B as **no-English immersion** (kanji → furigana only — user is a heritage speaker; meaning translation is noise, reading recognition is the gap); bundle C (palettes) dropped; all of bundle D (responsive music). No audio/TTS.

All file:line references verified by code recon on 2026-06-10 (post-roster-alignment ship, HEAD `165d9c9`). Codex review incorporated — 9 findings, all addressed inline, marked **[CX-n]**.

---

## 1. Chain redesign — immersion (all kanji cartridges)

### 1.1 New chain shape

Every kanji and compound becomes a **single-step chain**:

```
山 → [やま | かわ | もり]    kanji → furigana, 3 MC
```

`buildChain` in all six grade files (`kanji-g1-cartridge-v2.js:274-302` and the g2–g6 equivalents) emits one step: `{type:'kanji-to-furigana', label:'よみ', prompt:<glyph>, correct:<reading>, wrong:pickWrongs(pools.readings, reading, 2)}`. The `furigana-to-romaji`, `romaji-to-english`, and `kanji-to-english` steps are deleted. English and romaji **stay in the source data arrays** (they cost nothing and future features may want a `gloss`), but no chain step and no gameplay surface renders them.

### 1.2 Engine changes (index.html)

- **Per-step labels**: `stepLabels` (`:5039`) is a positional cosmetic array — replace with `step.label` (each step object carries its own label; fallback `''`). Kanji steps use `よみ`; conjugation steps use the form name (§2.3).
- **BKT weights**: drop the positional `CHAIN_BKT_WEIGHTS` array (`:5248`) for a generic rule: intermediate steps weight **0.6**, final step **1.0** (single-step chains = 1.0, matching a normal quiz answer). `handleHit`'s `bktWeightOverride` plumbing (`:5312`) is unchanged.
- **Kana decomposition: retired.** `spawnKanaDecomposition` (`:5262-5300`), its trigger (`:5326-5328`), and the `kanaRomaji`/`digraphRomaji` merger plumbing (`kanji-joyo-cartridge.js:186-188`) are deleted — the mechanic exists to remediate romaji, which no longer exists, and kana fluency is assumed. Wrong answers take the existing surge/remove path (`:5334`).
- **No-English display [CX-4]**: do NOT overload `action` (it is a label/score/fallback field with unaudited consumers). Kanji cartridges keep `action` as-is and gain a `displayLabel` field set to the **reading**; every kanji-deck display surface (kill text, HUD answer echo) prefers `cmd.displayLabel || cmd.action`. Implementation includes a grep audit of all `action` consumers; English appears on no gameplay surface for kanji decks.
- **Copy**: update the joyo `instructions` string (`kanji-joyo-cartridge.js:154`) and grade-file equivalents to describe the reading drill; HOW TO PLAY stays generic.
- **Saved-run behavior [CX-1]**: run-state restore clamps `chainStep` via `Math.min(cmd.chain.length-1, saved)` (`:6084`) — a checkpoint saved mid-old-chain restores at step 0 of the new 1-step chain (the enemy re-asks the reading; cannot exceed bounds, cannot auto-kill). This is the intended behavior, verified in tests; no migration or version marker needed since chains are always rebuilt from the canonical command at restore.
- **BKT carry-over policy [CX-2]**: existing joyo mastery is kept unchanged, deliberately. Rationale: step 0 of the old chain was always exactly kanji→furigana, so every mastered card has repeatedly passed the reading test — the deleted romaji/English steps were the *easy* steps for a heritage speaker, not the evidence we care about. Resetting would punish real reading mastery. The weight change (final step 1.0, same as before) does not recalibrate old cards.
- **Guessing/evidence note [CX-3]**: 3-choice MC has a 33% guess floor — same as the existing quiz mode the BKT was tuned for; mastery ≥ 3 requires multiple correct encounters by construction, and the kanji reading distractors are authored confusables (`pools.readings` + per-row authored `f` distractors), not random. Implementer verifies the BKT guess parameter is honest for 3-MC and keeps authored distractors preferred over pool-random.

### 1.3 Wrong-answer behavior (unchanged, stated for clarity)

Wrong chain answer → BKT penalty + enemy removed, no life lost, `waveMisses` increments (perfect-wave valve stays honest). Reading recognition is pass/fail per encounter; the SRS brings missed kanji back sooner.

---

## 2. JLPT N5 cartridge (`jlpt-n5-cartridge.js`, new file)

New cartridge `{id:'jlpt-n5', name:'JLPT N5', icon:'⛩️', inputMode:'quiz'}` registered via `window.TD_CARTRIDGES` — the selector (`:5496-5518`) picks it up automatically. Separate progress store (`td-srs-jlpt-n5`, `td-meta-jlpt-n5`) — deliberately NOT shared with joyo even though kanji ids overlap (different curricular goal; revisit if double-drilling annoys).

### 2.1 Domains (the PLAY-tab pills derive from `cmd.dom` automatically, `:5711-5721`)

| dom | content | chain | count (target) |
|---|---|---|---|
| `kanji` | the standard N5 kanji set | 1-step reading | ~103 |
| `vocab` | N5 vocabulary **written with kanji** (kana-only vocab is untestable in a no-English reading drill — excluded) | 1-step reading | ~200 curated |
| `verbs` | N5 verbs | **conjugation chain** (§2.3) | ~55 |
| `particles` | cloze sentences | 1-step particle MC (§2.4) | ~50 |

`domLabels`: `かんじ / ことば / どうし / じょし`.

### 2.2 Gating & tiers

- `kanji` = tier `core` (waves 1–3); `vocab`/`verbs`/`particles` = tier `regular` (enter wave 4+, per `getUnlockedTiersForWave :5914`).
- `vocab` and `verbs` carry `requires:[<component kanji ids>]` — the existing compound-gating primitive (`classifyPool :2106-2111`, pKnown ≥ 0.5) holds them back until their kanji are known. Particles are ungated (sentence kanji kept within the N5 core set, readings shown via the prompt where needed — see §2.4).

### 2.3 Conjugation chains (verbs)

Five steps, all Japanese, every step 3-choice MC:

```
step 0  食べる → [たべる | しょくべる | くべる]        よみ      (reading)
step 1  食べる→ます形 → [食べます | 食べります | 食べいます]   ます形
step 2  食べる→て形  → [食べて | 食べって | 食べりて]      て形
step 3  食べる→ない形 → [食べない | 食べらない | 食べくない]   ない形
step 4  食べる→た形  → [食べた | 食べった | 食べりた]      た形
```

- Step `label` carries the form name; prompt is `<dict form>→<form>` rendered plain-text (the KaTeX branch at `:5043` only fires for `kanji-to-*` types — conjugation types render as text automatically).
- **Distractors are authored, not generated**, targeting real error classes: ichidan/godan stem confusion (食べります), wrong て-euphony (飲みて/飲んで, 行きて/行って), adjective-pattern bleed (〜くない on verbs). Irregulars (する/くる) and the godan て-form families each appear.
- **Data validation rules [CX-8]**: every verb card carries `group` (`godan`/`ichidan`/`irregular`); each distractor must be same-script, same-register, and plausible **for that verb's class** (a godan distractor on an ichidan verb that no learner would produce fails validation). Explicit required coverage: する/くる, 行く (行って exception), all five godan て/た euphony families (う・つ・る→って, ぬ・ぶ・む→んで, く→いて, ぐ→いで, す→して). The cartridge builder validates at load and `console.warn`s violations; the teacher data review (§2.6) is the human gate.
- BKT: intermediate 0.6 / final 1.0 per §1.2. A verb card is one SRS unit — the chain is the drill, mastery is per-verb.
- Wrong at any step → surge + enemy removed (same as kanji); the SRS resurfaces the verb.

### 2.4 Particle cards

1-step chain: `{type:'particle-cloze', label:'じょし', prompt:'私は学校［　］行きます', correct:'に', wrong:['を','で']}`. Prompts use N5 kanji only. Distractors are authored per sentence (the plausible-wrong particle for that syntactic slot, not random). **[CX-9] Rendering/normalization rules**: the blank renders as `［　］` (full-width brackets — visually distinct from any reading helper); answers are **orthographic particles** (は, へ, を as written, never pronunciation spellings わ/え/お); if a sentence needs an out-of-set reading, the helper renders as smaller trailing kana in 「」 after the word, never adjacent to the blank.

### 2.5 N5 readiness meter

Generalize the pacing meter: `buildPacingHtml` (`:2727-2749`) is currently gated by `topicFeaturesActive()` (AP-only). Add a cartridge metadata flag `progressMeter:'domains'` — when set, the PLAY tab renders per-domain mastery instead: `かんじ 78/103 · ことば 112/200 · どうし 21/55 · じょし 30/50` (mastery ≥ 3 counts, same threshold as everywhere). Joyo can opt in later; AP keeps its formula meter.

### 2.6 Content sourcing & review

I generate all four lists from the standard public N5 sets; **the teacher (native speaker) reviews the generated data files before ship** — especially conjugation distractors and particle sentences. Counts are targets, not contracts.

### 2.7 Server touch (follow-alongs, one line + test)

`TRAINER_DECK_ALLOWLIST` default in `roster-server/trainer.js:26` gains `jlpt-n5` — without it, cloud sync PUTs for the new deck 400 (`'unknown deck'`) and the client surfaces "deck not syncable". Test updated. (Deploys on push; additive.)

---

## 3. Responsive music (bundle D — all six)

Grounded in the SFX recon: 15-voice FM synth (`:456-1261`), one-bar self-rescheduling sequencer `seq()` (`:1029-1170`), tempo re-read every bar (`:1049`), existing couplings wave→key / treeDepth→layers / streak→groove / kill→chord stab.

| # | Feature | Effort | Design |
|---|---|---|---|
| D1 | **Chain-step arpeggio** | S | New `SFX.chainStep(i, total)`: plays ascending chord tones of the current bar's chord (`wc()`) via `playFmNote`, step i of total. **[CX-7] Call semantics pinned: `chainStep` fires ONLY for non-final correct steps** (replacing the flat `SFX.hit(0.2)` at `:5316`, which is already the intermediate-only call site); the final correct answer routes through `handleHit` → `killMelody` exactly as today — the two never fire for the same answer. Arpeggio notes go through the 7-voice round-robin SFX pool (`playFmNote :930-947`), which already handles stealing; `killMelody` uses the same pool, so a fast chain at worst steals the oldest arpeggio voice — acceptable and self-resolving. Single-step chains never call `chainStep`. Conjugation chains become ascending 4-note phrases resolved by the kill stab |
| D2 | **Combo → drum intensity** | S | `SFX.setCombo(G.combo)` mirroring the `setStreak` pattern; in `seq()` next to the streak blocks (`:1106-1126`): combo ≥ 2 accents the kick, combo 3 (max) opens the hi-hats on offbeats (`scheduleFmHihat closed=false` exists at `:771` but is never called) |
| D3 | **Lives → tempo urgency** | S–M | **[CX-6] Base vs runtime tempo separated**: the editor reads/writes/displays only `baseTempo` (config field, 50–160 envelope unchanged); `seq()` computes `runtimeTempo = clamp(baseTempo × tempoMult, 50, 180)` at schedule time. `tempoMult` (lives 5→1 mapped onto ×1.0→×1.12, set via `SFX.setUrgency` from the breach path `:6362-6381`) is **never persisted** and never visible in the editor; a user-set 160 BPM track still gets headroom because the runtime clamp ceiling (180) sits above the editor ceiling (160) |
| D4 | **Near-breach dread drone** | M | Game loop computes `max(enemy.t)` (it already calls `SFX.setKey` per frame at `:7205`) → `SFX.setDanger(x)`; maps to pad filter cutoff rise. Requires hoisting the `padF`/`bassF` filter consts (`:643`, `:648`) to module scope |
| D5 | **Breach stinger + duck** | M | `SFX.breach()` (`:1214-1221`) ducks `padBus`/`drumBus` ~250 ms then restores over ~1.2 s, using the `clearBgmAutomation` pattern (`:798-843`) so bus automation stays safe |
| D6 | **Per-cartridge soundtrack** | M | `getWaveConfig` (`:592-596`) is the single read point — `activeCartridge.musicConfig` shadows `DEFAULT_MUSIC_CONFIG`. Music-editor saves become **per-deck**: key `td-music-config-v1-<deckId>`. **[CX-5] Lookup order pinned so a legacy global config can't shadow new decks' soundtracks**: per-deck key → `activeCartridge.musicConfig` → legacy global `td-music-config-v1` → `DEFAULT_MUSIC_CONFIG`. (The cartridge default outranks the legacy global; the legacy key keeps serving decks with no cartridge config — i.e. AP Stats — which is where it was authored. Saving in the editor always writes the per-deck key only.) The kanji decks (joyo + N5) ship a 12-wave config voiced toward 陰旋法-flavored colors (the chord arrays are raw Hz triads — not limited to the editor's 24 maj/min picks; sus4/min-add voicings are legal data) |

Latency note (from recon): `seq()` schedules a full bar ahead, so D2/D3 react at the next bar (~2–4 s) — correct for groove changes; D1/D5 go through `playFmNote`/bus automation and react instantly.

---

## 4. Out of scope

Speech synthesis / any audio content (decided), palettes (decided), kana-only vocabulary drills (untestable without translation), English anywhere in kanji-deck gameplay, joyo/N5 shared progress, grammar beyond particles + the five conjugation forms.

## 5. Implementation plan

| Phase | Work | Files |
|---|---|---|
| 1 | Chain redesign: 6× `buildChain`, kana-decomposition removal, step labels, BKT rule, action=reading, copy | 6 grade files, `kanji-joyo-cartridge.js`, `index.html` |
| 2 | N5 content generation (4 data sets) + cartridge file | `jlpt-n5-cartridge.js` (new), `index.html` (script tag + SW precache) |
| 3 | Readiness meter generalization | `index.html` |
| 4 | Music D1–D6 | `index.html` |
| 5 | Server allowlist + test | follow-alongs `roster-server/trainer.js`, `tests/trainer.test.js` |
| 6 | Verify (parse check, cartridge validation, review loop) → teacher reviews N5 data → SW bump v14 → `CONTINUATION_PROMPT.md` → commit + push both repos | — |

## 6. Testing

- Parse check + `validate-cartridge.js` after every phase.
- Chain engine: 1-step kanji kill, 5-step verb chain full walk, wrong-at-step-N surge/remove, `waveMisses` increments, restore mid-chain (clamp), BKT weights land (0.6/1.0).
- Joyo regression: existing SRS mastery untouched after the chain swap (same ids); domain pills G1–G6 still render; daily mission/streak/XP unaffected.
- N5: gating (verbs locked until kanji pKnown ≥ 0.5), tier entry at wave 4, readiness meter counts, sync round-trip under `jlpt-n5` post-allowlist.
- Music: each Dn toggled in isolation; mute path; music editor round-trip with per-deck keys; legacy `td-music-config-v1` still loads.
- No-English grep over kanji-deck gameplay surfaces.
