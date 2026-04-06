# Codex Prompt: Kana Cartridge Full Audit — Fix Answers + Flesh Out DAG

## Context

You are working in the `tmux-trainer` project. Read the full spec in `kana-audit-spec.md`.

**Key reference files** (read before writing code):
- `kana-audit-spec.md` — the specification (read this FIRST)
- `kana-cartridge.js` — the file you will modify
- `validate-cartridge.js` — validator: `node validate-cartridge.js kana-cartridge.js`
- `kanji-joyo-cartridge.js` — the merger that pulls kana in (verify it still works after your changes)

## Bugs to Fix

### Bug 1: Counterpart subconcepts show "unknown" wrong answers

The counterpart subconcept (SC2 of each command) asks "What is the katakana/hiragana counterpart for X?" The correct answer is `record.counterpart`, and wrong answers come from `buildCounterpartWrongs()`.

**Problem**: For many records, the wrong-answer pool is empty or too small, so `pickDistinct()` returns `['unknown','unknown']`.

**Fix**:

1. First, verify every record has a non-null `counterpart`. Check the `COUNTERPART_BY_KANA` map — it's built from `BASE_SYLLABLES` and `BASE_YOON` pairs. If any kana (especially yōon) is missing from the map, add it.

2. Rewrite `buildCounterpartWrongs(record, index)` to guarantee 2 real wrong answers:
   ```javascript
   function buildCounterpartWrongs(record, index) {
     // The correct answer is record.counterpart (opposite script)
     // Wrong answers should be other kana from the SAME script as the counterpart
     const targetScript = record.script === 'hiragana' ? 'katakana' : 'hiragana';
     const pool = RECORDS
       .filter(r => r.script === targetScript && r.kana !== record.counterpart)
       .map(r => r.kana);
     return pickDistinct(pool, record.counterpart, index, 7);
   }
   ```

3. Add a build-time assertion that no subconcept has "unknown" in its wrong array:
   ```javascript
   COMMANDS.forEach(cmd => {
     cmd.subconcepts.forEach((sc, i) => {
       if (sc.wrong.includes('unknown')) {
         console.warn(`[kana] ${cmd.id} SC${i} has "unknown" wrong answer`);
       }
     });
   });
   ```

### Bug 2: Blank choices may be triple-duplicates

Blanks are initialized with `choices:[kana,kana,kana]` then rebuilt by `buildBlankChoices()`. If `pickKanaDistractors()` fails, blanks keep the triple-duplicate.

**Fix**: Rewrite the blank choice builder to guarantee distinct wrong kana:

```javascript
function buildBlankChoices(cmd) {
  const record = RECORD_BY_ID[cmd.id];
  if (!record) return [cmd.latex, cmd.latex, cmd.latex]; // shouldn't happen
  
  // Get confusable kana first, then fall back to same-script kana
  const candidates = [
    ...(CONFUSABLE_MAP[record.id] || []).map(id => RECORD_BY_ID[id]).filter(Boolean).map(r => r.kana),
    ...RECORDS.filter(r => r.script === record.script && r.dom === record.dom && r.kana !== record.kana).map(r => r.kana),
    ...RECORDS.filter(r => r.kana !== record.kana).map(r => r.kana)
  ];
  
  const wrongs = [];
  const used = new Set([record.kana]);
  for (const k of candidates) {
    if (!used.has(k)) { wrongs.push(k); used.add(k); }
    if (wrongs.length >= 2) break;
  }
  
  return [record.kana, wrongs[0] || '?', wrongs[1] || '??'];
}
```

After rebuilding, verify no blank has duplicate choices.

### Bug 3: DAG is too shallow

**Current**: 18 nodes (rows, rules, 2 leaves). Missing: phonetic recognition, vocabulary context, confusable discrimination.

**Add the following node categories** (see spec for full details):

#### A. Sound Recognition Nodes (L2, ~13 nodes)

Per-vowel (5): `sound-a`, `sound-i`, `sound-u`, `sound-e`, `sound-o`
- Question: "Which kana makes the 'X' sound?"
- Correct: the kana pair (あ/ア)
- Wrong: other vowel pairs
- Prereqs: `['vowel-sounds']`

Per-consonant-row (8): `sound-ka`, `sound-sa`, `sound-ta`, `sound-na`, `sound-ha`, `sound-ma`, `sound-ra`, `sound-ya`
- Question: "What sound does か/カ make?"
- Correct: the romaji
- Wrong: other romaji from nearby rows
- Prereqs: `['consonant-X']` (matching row)

#### B. Voicing Recognition Nodes (L2, 4 nodes)

`voice-k-to-g`, `voice-s-to-z`, `voice-t-to-d`, `voice-h-to-b`
- Question: "What happens to the K-row when dakuten is added?"
- Correct: "K sounds become G sounds (ka→ga, ki→gi...)"
- Wrong: other voicing transformations
- Prereqs: `['dakuten-rules', 'consonant-X']`

#### C. Vocabulary Word Nodes (L3, 10-12 nodes)

`word-greetings`, `word-animals`, `word-food`, `word-nature`, `word-body`, `word-colors`, `word-numbers`, `word-loanwords`, `word-school`, `word-family`
- Question: "Which kana starts [word] ([meaning])?"
- Correct: the starting kana
- Wrong: other kana from similar rows
- Prereqs: `['vowel-sounds']` or the relevant consonant row

These provide concrete context when a student fails a word-blank question. Instead of drilling abstract row membership, they drill "what kana is used in this word?"

#### D. Confusable Discrimination Nodes (L2, 8-10 nodes)

`confuse-shi-tsu`, `confuse-so-n`, `confuse-ha-ho`, `confuse-nu-me`, `confuse-ru-ro`, `confuse-ki-sa`, `confuse-wa-ne-re`, `confuse-a-ma`, `confuse-ku-ta-ke`, `confuse-u-wa-fu`
- Question: "How do you tell X from Y?"
- Correct: the visual distinguishing feature
- Wrong: incorrect claims about the characters
- Prereqs: `['stroke-direction']` or relevant row node

These fire when a student picks the wrong kana from a confusable pair.

#### E. Update wireL1toL2 Rules

Add rules to match subconcept question text to the new DAG nodes:

```javascript
// Sound recognition — match "what sound" or "what romaji" questions
[/what sound|what.*romaji|pronounce|how.*read/i, soundNodeIds],

// Vocabulary — match "which word" or "word contains" questions
[/which word|word.*contains|starts with|word.*start/i, vocabNodeIds],

// Confusable pairs — match specific character comparisons
[/シ.*ツ|ツ.*シ|shi.*tsu|tsu.*shi/i, ['confuse-shi-tsu']],
[/ソ.*ン|ン.*ソ/i, ['confuse-so-n']],
[/は.*ほ|ほ.*は/i, ['confuse-ha-ho']],
[/ぬ.*め|め.*ぬ/i, ['confuse-nu-me']],
[/る.*ろ|ろ.*る/i, ['confuse-ru-ro']],
[/き.*さ|さ.*き/i, ['confuse-ki-sa']],
[/わ.*ね|ね.*れ|わ.*れ/i, ['confuse-wa-ne-re']],
[/ア.*マ|マ.*ア/i, ['confuse-a-ma']],
[/ク.*タ|タ.*ケ|ク.*ケ/i, ['confuse-ku-ta-ke']],
```

## Implementation Order

1. **Fix `COUNTERPART_BY_KANA`** — ensure all 208 records have valid counterparts
2. **Fix `buildCounterpartWrongs()`** — guarantee 2 distinct real wrong answers
3. **Fix `buildBlankChoices()` / `pickKanaDistractors()`** — guarantee distinct wrong kana
4. **Add sound recognition nodes** to `SHARED_PREREQ_NODES` (13 nodes)
5. **Add voicing recognition nodes** (4 nodes)
6. **Add vocabulary word nodes** (10-12 nodes)
7. **Add confusable discrimination nodes** (8-10 nodes)
8. **Update `wireL1toL2`** with new rules for all added node categories
9. **Add build-time assertions** — warn on any "unknown" wrongs or duplicate choices
10. **Validate**: `node validate-cartridge.js kana-cartridge.js` must pass 24/0/0

## Validation

After all changes:

```bash
node validate-cartridge.js kana-cartridge.js
```

Expected: 208 commands, ~416 blanks, 24 passed, 0 failures.

Also run the merged joyo validation:
```bash
node validate-cartridge.js kanji-joyo-cartridge.js
```

Expected: 1,234 commands, ~2,547 blanks, 24 passed, 0 failures.

### Manual spot-checks

1. Pick 5 hiragana commands, verify SC2 (counterpart) has real katakana wrong answers
2. Pick 5 katakana commands, verify SC2 has real hiragana wrong answers
3. Pick 5 yōon commands, verify counterpart is the opposite-script yōon
4. Pick 10 random blanks, verify choices[0] = answer and choices are all distinct
5. Count SHARED_PREREQ_NODES keys — should be ~50 (was 18)
6. Run `validateDAG()` mentally: no node should reference an ID that doesn't exist

## Important Constraints

- Only modify `kana-cartridge.js` — no other files
- Do NOT change command IDs, actions, or the source data tables
- Do NOT change the `generateQuestion` function
- Do NOT change the cartridge metadata or registration pattern
- The kana cartridge is currently merged into the joyo deck via `kanji-joyo-cartridge.js` — your changes must not break this integration
- All new DAG nodes must have `prereqs` pointing to existing nodes (no dangling refs)
- Run validator after completion
