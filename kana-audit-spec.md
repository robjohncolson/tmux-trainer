# Spec: Kana Cartridge Full Audit — Fix Answers + Flesh Out DAG

## Problems Found

### P0: Counterpart subconcepts show "unknown" wrong answers

**Root cause**: `buildCounterpartWrongs(record, index)` calls `pickDistinct()` on a pool of counterpart kana filtered by `desiredScript` and `dom`. For some records (especially yōon and voiced kana), this pool is empty or has only 1 entry, so `pickDistinct` returns `['unknown','unknown']`.

**Location**: `kana-cartridge.js` ~line 445-451 (`buildCounterpartWrongs`), ~line 508-510 (subconcept 2 builder)

**Fix required**: Every kana command must have exactly 2 distinct, real wrong answers for the counterpart subconcept. The wrong answers should be real kana from the opposite script (hiragana→katakana wrongs, katakana→hiragana wrongs). For yōon, wrongs should be other yōon from the opposite script.

### P1: Blank choices may be triple-duplicates

**Root cause**: Blanks are initialized at line 498 as `choices:[kana,kana,kana]`, then rebuilt at line 527 via `buildBlankChoices()`. If `pickKanaDistractors` fails (empty pool, all candidates match the answer), the choices stay as triple-duplicates.

**Location**: `kana-cartridge.js` ~line 497-499 (initial blank build), ~line 522-528 (rebuild)

**Fix required**: Every blank must have `choices[0]` = correct kana and `choices[1]`, `choices[2]` = distinct wrong kana. Wrongs should be visually confusable kana from the same script/domain.

### P2: DAG is too shallow for meaningful decomposition

**Current state**: 18 nodes total — 10 row nodes, 4 rule nodes (dakuten, handakuten, yōon, hira-kata-pairs), 2 concept nodes (stroke-direction, system-recognition), 2 leaf nodes (kana-basics, stroke-basics).

**Problem**: When a student misses a kana question, the hydra decomposition drills abstract concepts ("What sounds belong to the k-row?") instead of practical recognition ("What sound does か make?" or "Which word starts with か?"). There's no vocabulary-level drilling.

## Required Fixes

### Fix 1: Counterpart Subconcept Audit (all 208 commands)

For EVERY record in RECORDS:

1. Verify `record.counterpart` is non-null and is a real kana character
2. Verify the counterpart is from the opposite script (hiragana↔katakana)
3. If counterpart is null (especially for yōon like きゃ→キャ), fix the `COUNTERPART_BY_KANA` map
4. Rebuild `buildCounterpartWrongs()` to guarantee 2 distinct wrongs:
   - Pool: all counterparts from the same script as the correct answer
   - Example: if correct = カ (katakana), wrongs = キ and ク (other katakana)
   - Fallback: if the filtered pool is too small, expand to any kana from the target script
5. **Validation rule**: no subconcept may have "unknown" in its `wrong` array

### Fix 2: Blank Choice Audit (all 416 blanks)

For EVERY blank in every command:

1. Verify `choices[0]` = `answer` (the correct kana)
2. Verify `choices[1]` and `choices[2]` are distinct from each other AND from `choices[0]`
3. Verify all choices are real kana characters (not null, not "unknown")
4. Wrong choices should be visually confusable where possible (from `CONFUSABLE_MAP`)
5. **Validation rule**: `validateBlank(choices[0], answer)` must pass for every blank

### Fix 3: Expand DAG for Phonetic Recognition

Add L2 nodes for individual sound recognition. These fire when a student can't identify a kana:

**Per-vowel recognition nodes (5)**:
```javascript
'sound-a': { level: 2, q: 'Which kana makes the "a" sound (as in "father")?', 
  correct: 'あ / ア', wrong: ['い / イ', 'う / ウ'], prereqs: ['vowel-sounds'] },
'sound-i': { level: 2, q: 'Which kana makes the "i" sound (as in "feet")?',
  correct: 'い / イ', wrong: ['え / エ', 'う / ウ'], prereqs: ['vowel-sounds'] },
// ... etc for u, e, o
```

**Per-consonant-row recognition nodes (8)**:
```javascript
'sound-ka': { level: 2, q: 'What sound does か/カ make?',
  correct: 'ka', wrong: ['sa', 'ta'], prereqs: ['consonant-k'] },
'sound-sa': { level: 2, q: 'What sound does さ/サ make?',
  correct: 'sa', wrong: ['ka', 'ha'], prereqs: ['consonant-s'] },
// ... etc for ta, na, ha, ma, ra, ya, wa rows
```

**Voicing recognition nodes (4)**:
```javascript
'sound-ga': { level: 2, q: 'What happens to "ka" when dakuten is added?',
  correct: 'It becomes "ga"', wrong: ['It becomes "ba"', 'It becomes "pa"'], prereqs: ['dakuten-rules','consonant-k'] },
// ... etc for za, da, ba rows
```

### Fix 4: Add Vocabulary DAG Nodes

Add L3 nodes that test kana in the context of simple words. These fire when a student can't complete word blanks:

**Common word nodes (10-15)**:
```javascript
'word-greetings': { level: 3, q: 'Which kana starts the greeting おはよう?',
  correct: 'お', wrong: ['あ', 'え'], prereqs: ['vowel-sounds'] },
'word-animals': { level: 3, q: 'Which kana starts the word ねこ (cat)?',
  correct: 'ね', wrong: ['の', 'な'], prereqs: ['consonant-n'] },
'word-food': { level: 3, q: 'Which kana starts the word すし (sushi)?',
  correct: 'す', wrong: ['し', 'せ'], prereqs: ['consonant-s'] },
'word-nature': { level: 3, q: 'Which kana starts the word やま (mountain)?',
  correct: 'や', wrong: ['ゆ', 'よ'], prereqs: ['consonant-y'] },
'word-body': { level: 3, q: 'Which kana starts the word て (hand)?',
  correct: 'て', wrong: ['た', 'と'], prereqs: ['consonant-t'] },
'word-colors': { level: 3, q: 'Which kana starts the word あか (red)?',
  correct: 'あ', wrong: ['え', 'お'], prereqs: ['vowel-sounds'] },
'word-numbers': { level: 3, q: 'Which kana starts いち (one)?',
  correct: 'い', wrong: ['う', 'え'], prereqs: ['vowel-sounds'] },
'word-loanwords': { level: 3, q: 'Which katakana starts コーヒー (coffee)?',
  correct: 'コ', wrong: ['カ', 'ケ'], prereqs: ['consonant-k'] },
'word-school': { level: 3, q: 'Which kana starts せんせい (teacher)?',
  correct: 'せ', wrong: ['さ', 'し'], prereqs: ['consonant-s'] },
'word-family': { level: 3, q: 'Which kana starts はは (mother)?',
  correct: 'は', wrong: ['ひ', 'ほ'], prereqs: ['consonant-h'] },
```

### Fix 5: Add Confusable Discrimination Nodes

Add L2 nodes that directly drill the classic confusable pairs:

```javascript
'confuse-shi-tsu': { level: 2, q: 'How do you tell シ (shi) from ツ (tsu)?',
  correct: 'シ strokes go up-left; ツ strokes go up-right', 
  wrong: ['They are the same character', 'シ has 3 strokes; ツ has 2'], prereqs: ['stroke-direction'] },
'confuse-so-n': { level: 2, q: 'How do you tell ソ (so) from ン (n)?',
  correct: 'ソ starts top-right; ン starts top-left',
  wrong: ['They are identical', 'ン has a dakuten dot'], prereqs: ['stroke-direction'] },
'confuse-ha-ho': { level: 2, q: 'How do you tell は (ha) from ほ (ho)?',
  correct: 'は has 2 bumps on the right; ほ has a cross and tail',
  wrong: ['They sound the same', 'は has more strokes'], prereqs: ['consonant-h'] },
'confuse-nu-me': { level: 2, q: 'How do you tell ぬ (nu) from め (me)?',
  correct: 'ぬ has a loop at the end; め does not',
  wrong: ['め has the loop', 'They are in the same row'], prereqs: ['kana-basics'] },
'confuse-ru-ro': { level: 2, q: 'How do you tell る (ru) from ろ (ro)?',
  correct: 'る has a small hook at the bottom; ろ ends straight',
  wrong: ['ろ has the hook', 'They are pronounced identically'], prereqs: ['consonant-r'] },
```

Add 5-8 more for other classic pairs (き/さ, わ/ね/れ, ア/マ, ク/タ/ケ, etc.)

### Fix 6: Update wireL1toL2 Rules

Add rules to route subconcept misses to the new DAG nodes:

```javascript
// Sound recognition
[/what sound|what.*romaji|pronounce|read as/i, ['sound-a','sound-ka','sound-sa','sound-ta','sound-na','sound-ha','sound-ma','sound-ra']],

// Vocabulary
[/word.*start|which word|contains.*word|greeting|animal|food/i, ['word-greetings','word-animals','word-food','word-nature','word-body']],

// Confusable discrimination  
[/シ.*ツ|shi.*tsu|ツ.*シ/i, ['confuse-shi-tsu']],
[/ソ.*ン|so.*n\b|ン.*ソ/i, ['confuse-so-n']],
[/は.*ほ|ha.*ho|ほ.*は/i, ['confuse-ha-ho']],
[/ぬ.*め|nu.*me|め.*ぬ/i, ['confuse-nu-me']],
[/る.*ろ|ru.*ro|ろ.*る/i, ['confuse-ru-ro']],
```

## Validation Checklist

After all fixes, run `node validate-cartridge.js kana-cartridge.js` (or test via the merged joyo cartridge). Additionally verify:

1. [ ] 0 subconcepts with "unknown" in `wrong` array
2. [ ] 0 blanks where `choices[0]` !== `answer`
3. [ ] 0 blanks with duplicate choices
4. [ ] 0 counterpart subconcepts with null `correct`
5. [ ] Every hiragana command's counterpart is a real katakana, and vice versa
6. [ ] Every yōon command has a valid cross-script counterpart
7. [ ] DAG has 40+ nodes (was 18)
8. [ ] wireL1toL2 covers sound recognition, vocabulary, and confusable discrimination
9. [ ] `validateDAG()` passes at boot (no cycles, no dangling refs)
10. [ ] Merged joyo validator still passes: 1,234 commands, 0 failures

## DAG Node Count Target

| Level | Current | Target | Category |
|-------|---------|--------|----------|
| L2 | 14 | ~35 | Row nodes (10) + sound recognition (13) + voicing (4) + confusable pairs (8) |
| L3 | 2 | ~15 | Vocabulary words (10-12) + stroke-direction + system-recognition + yōon-rules |
| L5 | 2 | 2 | kana-basics, stroke-basics (unchanged) |
| **Total** | **18** | **~52** | |
