# Anti-Button-Mash Spec v3

*Revised after Codex review (6 findings incorporated)*

## Problem

Quiz mode (AP Stats cartridge) is trivially brute-forceable:

1. **4 choices, same positions** — wrong answer keeps the same question with the same option layout. Pressing a→b→c→d guarantees a correct answer within 4 tries.
2. **Tiny feedback lock (220ms)** — players can retry almost instantly after a miss.
3. **Weak miss surge (0.08)** — enemy only advances 8% per miss. Takes ~12 misses to breach, but max 3 misses needed before a guaranteed hit.
4. **Subconcept/hint modes (3 choices)** — even easier to brute-force with only 3 options.
5. **No attempt cap** — unlimited retries on the same enemy with no escalating penalty beyond a flat surge.

A player who knows zero material can button-mash through all 12 waves.

## Solution: 4 Reinforcing Fixes

### Fix 1: Escalating Lockout

**Current:** `QUIZ_ANSWER_FEEDBACK` lock is a flat 220ms on every answer (correct or wrong).

**New:** The feedback delay escalates on consecutive misses against the **same enemy**:

| Consecutive misses on enemy | Feedback delay |
|-----------------------------|---------------|
| 0 (correct on first try) | 220ms (unchanged) |
| 1st miss | 800ms |
| 2nd miss | 1800ms |
| 3rd+ miss | 3000ms |

**Implementation:**
- Store miss count **on the enemy object** as `enemy.missCount` (default 0 at spawn). NOT on `G` — storing on `G` is bypassable via tab-retarget (Codex finding #1).
- In `queueQuizChoiceResolution()`:
  - **Before** scheduling the timeout, increment `enemy.missCount` on wrong answers (Codex finding #4 — off-by-one fix).
  - Compute delay: `isCorrect ? 220 : [800, 1800, 3000][Math.min(enemy.missCount - 1, 2)]`
- Correct answers always use 220ms regardless of prior misses.
- The lockout applies to quiz, fillblank, and subconcept question types equally.
- `enemy.missCount` is serialized in checkpoint save/restore (Codex finding #6).

**Blast radius:** `queueQuizChoiceResolution()`, enemy spawn (init `missCount:0`), `saveRunState()`/`loadRunState()` (persist `missCount`).

### Fix 2: Harsher Miss Surge

**Current surge values (quiz mode):**
- depth 0: 0.08
- depth 1: 0.13
- depth 2: 0.20

**New surge values (quiz mode):**
- depth 0: 0.15
- depth 1: 0.22
- depth 2: 0.30

This means 3 misses at depth 0 push the enemy 0.45 along the path — nearly half the track — creating real breach risk.

**Non-quiz modes** (prefix-key, typed): surge stays at 0.06 (unchanged, those modes aren't brute-forceable).

**Implementation:**
- Update the `surge` calculation in `handleMiss()`.
- The existing conditional `isQuizMode ? ... : 0.06` structure stays, just with new numbers.

**Blast radius:** `handleMiss()` only.

### Fix 3: Option Shuffle on Miss

**Current:** After a wrong answer, the same question with the same option positions stays on screen. Players can systematically try a→b→c→d.

**New:** After a wrong answer, the multiple-choice options are reshuffled into new positions. The question text stays the same, but which option is a/b/c/d changes.

**Implementation:**
- After `handleMiss()` resolves for quiz-mode enemies, call a new function `reshuffleQuestionOptions(enemy)`.
- `reshuffleQuestionOptions(enemy)`:
  - For `identify` questions: shuffle `enemy.question.options` array, then recompute **both** `enemy.question.correctIdx` and `enemy.question.correctKey` from the new position of the correct answer (Codex finding #2).
  - For `fillblank` questions: shuffle `enemy.question.choices` array. No correctness map needed — `validateBlank(choice, answer)` compares against the fixed `answer` field (Codex finding #2 confirmation).
  - For `subconcept` questions: shuffle `enemy.question.options` array, recompute `correctIdx` and `correctKey`.
  - Clear `G.showHint` (but keep `G.hintUsed` true for scoring). Just clearing `eliminatedIdx` is NOT enough — `updateInput()` will auto-eliminate again if `G.showHint` is still true (Codex finding #2).
  - Delete `enemy.question.eliminatedIdx`.
- After reshuffling, **clear `lastInputState`** to bust the render cache, then call `updateInput()` (Codex finding #3 — memoization bypass).
- Use Fisher-Yates shuffle (the existing `shuffleArr()` utility).

**Blast radius:** `handleMiss()` path in `queueQuizChoiceResolution()`, new `reshuffleQuestionOptions()`, `lastInputState` cache clear.

### Fix 4: Attempt Cap with Auto-Surge

**Current:** Unlimited attempts on the same enemy.

**New:** After 3 wrong answers on the same enemy, the enemy auto-surges to `t = max(current_t, 0.85)` and gets a 3x speed multiplier. This makes breach nearly inevitable unless the player is already very close to killing it.

**Implementation:**
- Use `enemy.missCount` (from Fix 1) instead of `G.attemptsOnCurrent`. This is per-enemy and survives tab-retarget (Codex finding #1).
- In `handleMiss()`, after processing the miss, check `enemy.missCount >= 3`:
  - If yes: `enemy.t = Math.max(enemy.t, 0.85)`, `enemy.speedMult = Math.max(enemy.speedMult, 3.0)`
  - Flash: `'MAX MISS! BREACHING ⚠'` in red
  - Play SFX.breach() warning sound
- This stacks with Fix 2 (the 3 misses that triggered the cap also applied surge each time).

**Note on hydra interaction** (Codex finding #5): Depth-0 and depth-1 enemies split on the FIRST miss via `spawnHydraChildren()`, so they never reach miss 2 or 3. The escalating lockout and 3-miss cap primarily affect **depth-2 grandchildren** and **split-failure** cases (enemy count > 20). This is by design — the hydra split itself is already a punishment for depth-0/1 misses. The cap catches the depth-2 tail where splits don't happen.

**Blast radius:** `handleMiss()` only (uses `enemy.missCount` from Fix 1).

## Combined Effect

A button-masher faces:
1. **Escalating delays** (220ms → 800ms → 1800ms → 3000ms) — mashing gets slower each miss
2. **Shuffled options** — can't just go a→b→c→d; must actually read
3. **Heavy surge** (0.15 per miss × 3 = 0.45) — enemy is nearly halfway to breach after 3 wrong
4. **Auto-surge at 3 misses** — enemy jumps to 0.85 and speeds up 3x, virtually guaranteeing breach
5. **Hydra splits** (existing) — depth-0/1 misses fracture into harder sub-questions

A knowledgeable player who answers correctly on the first try sees **zero difference** — the 220ms feedback, no surge, no shuffle, no cap.

## Edge Cases

- **Hydra splits**: When a depth-0 enemy splits on miss, children are new enemies with `missCount: 0`. Escalating lockout and cap are fresh. This is correct — each child is a fresh question. The cap is primarily a depth-2 mechanic.
- **Hint usage**: Clear `G.showHint` on shuffle (keep `G.hintUsed` for scoring). Player can press H again post-shuffle to get a new elimination on the reshuffled options.
- **`pendingCorrectHit`**: Shuffle only on miss path, never on correct path. No conflict.
- **Tab-retarget dodge**: Counters stored on `enemy` object, not `G`. Tabbing away and back does NOT reset `enemy.missCount`.
- **Run checkpoint/restore**: `enemy.missCount` must be serialized in `saveRunState()` and restored in `loadRunState()`. The existing `attemptsOnCurrent` is already persisted — `missCount` follows the same pattern but lives on the enemy array.
- **Input render cache**: `lastInputState` must be cleared after shuffle to force repaint.
- **Non-quiz modes**: prefix-key and typed modes are unaffected. All 4 fixes gate on `isQuizMode` or the question type.

## Files Modified

- `index.html` — all changes in the inline `<script>` block:
  - Enemy spawn (~line 3171): add `missCount: 0` to enemy object
  - `queueQuizChoiceResolution()` (~line 2737): escalating delay calculation, increment `enemy.missCount` before scheduling, call `reshuffleQuestionOptions()` on miss resolution
  - `handleMiss()` (~line 3279): harsher surge values, attempt cap auto-surge check using `enemy.missCount`
  - `saveRunState()` / `loadRunState()`: persist/restore `enemy.missCount`
  - New function: `reshuffleQuestionOptions(enemy)` — Fisher-Yates shuffle + correctIdx/correctKey recompute + hint state clear + cache bust
  - `lastInputState` reference for cache bust

## Testing Plan

1. **Parse check**: Verify `index.html` inline script parses without errors
2. **Button-mash test**: In quiz mode, rapidly press random a/b/c/d keys. Verify:
   - Lockout delays increase noticeably after each miss
   - Options reshuffle visually after each wrong answer
   - After 3 misses on depth-2, enemy surges to near-breach
   - Enemies actually breach from mashing (unlike before)
3. **Knowledge test**: Answer correctly on first try. Verify:
   - 220ms feedback delay (unchanged)
   - No surge, no shuffle
   - Score and SRS update normally
4. **Hydra split test**: Miss a depth-0 enemy. Verify children spawn correctly with `missCount: 0`.
5. **Hint test**: Use hint, miss, verify `G.showHint` clears on shuffle, can re-hint on reshuffled options.
6. **Tab-retarget test**: Miss once, tab to different enemy, tab back. Verify `enemy.missCount` is preserved (not reset).
7. **Checkpoint test**: Miss twice, save+exit, continue. Verify `enemy.missCount` is restored correctly.
8. **Render cache test**: After shuffle, verify options visually update (not stale from memoization).
9. **Mobile test**: Verify MC button taps still work at 375px width with shuffled options.
