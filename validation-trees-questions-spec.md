# Spec: Validation Bug Fix, Tree Positioning, Question Depth

## Three bundled items

### 1. Fix: Answer validation race condition (BUG)

**Problem:** `queueQuizChoiceResolution()` creates wrong-answer feedback (line ~3914) capturing `correctIdx` text from the CURRENT option order. Then `reshuffleQuestionOptions()` (line ~3938) reshuffles options in the resolve callback. The feedback shows stale option references.

**Fix:** Move `reshuffleQuestionOptions()` call to AFTER feedback is dismissed (after GOT IT / space), not during the resolve callback. The options should stay stable while the student is reading the feedback.

```javascript
// In resolveFn(), change from:
handleMiss(liveEnemy);
reshuffleQuestionOptions(stillAlive);  // ← WRONG: reshuffles during feedback

// To:
handleMiss(liveEnemy);
// Reshuffle AFTER feedback dismissed, not during resolution
// Move to the feedback.held callback or clearQuizAnswerFeedback
```

Actually simpler: reshuffle when `clearQuizAnswerFeedback()` is called (when GOT IT is pressed or space dismisses). This ensures options stay stable during the entire feedback display.

### 2. Fix: Tree z-positioning too close

**Problem:** Trees at z=-4 to z=-10 are too close to the camera. When zoomed into an enemy cube, you only see the lower portion of trees.

**Fix:** Push all TREE_POOL z-coordinates further back:
- Current range: z=-4 to z=-10
- New range: z=-10 to z=-16
- This places trees well behind the action (camera zooms to z≈8, enemies are at z≈-6)

### 3. Design: Deeper question types (spec only — content authoring is follow-up)

**Current question types:**
- Identify (MC): "What does this formula calculate?" → recall only
- Fillblank: "What symbol goes here?" → notation recall
- Subconcept: true/false from hydra splits

**Proposed new question types:**

**Type: Variable Role** — for each variable in the equation:
- "In [formula], what does [variable] represent?"
- "If [variable] increases, what happens to [output]?"
- "Which of these is NOT a component of [formula]?"

**Type: Application** — AP exam-style context:
- "A researcher collects n=50 samples with s=4.2. Which formula would you use to find the standard error?"
- "You're testing H₀: p=0.3 with n=100 and p̂=0.38. What's the first step?"

**Type: Relationship** — understanding connections:
- "How does the confidence interval width change when you increase n?"
- "Why does the standard error use s instead of σ?"

This requires authoring ~200 new question variants across 66 formulas. The game code needs a new question generation path, but the content is the bottleneck. **This is a follow-up task, not implemented in this commit.**

## Implementation (items 1 and 2 only)

### Reshuffle timing fix

Move `reshuffleQuestionOptions()` from `resolveFn()` inside `queueQuizChoiceResolution()` to `clearQuizAnswerFeedback()`. This ensures options stay stable while feedback is visible.

### Tree z-push

Subtract 6 from all TREE_POOL z values.

## Blast Radius

| Area | Change |
|------|--------|
| `queueQuizChoiceResolution()` | Remove `reshuffleQuestionOptions()` from wrong-answer resolve |
| `clearQuizAnswerFeedback()` | Add `reshuffleQuestionOptions()` for the current enemy after clearing feedback |
| `TREE_POOL` | Push z coordinates back by 6 units |

## Testing

- [ ] Wrong answer: feedback stays stable, options don't reshuffle until GOT IT
- [ ] After GOT IT: options reshuffle for next attempt
- [ ] Trees visible in full when zoomed into enemy cube
- [ ] Parse check passes
