# Enhanced Fractal Particle Branching

## Problem

Fractal branching on kill particles is barely visible. At 3% chance per frame, only during the ~300ms burst phase, most particles never branch. The effect exists but players can't see it.

## Solution

Three changes to make branching a visible, satisfying part of every kill:

### 1. Increase branch chance: 3% → 10%
- ~10% per frame during burst means most kills produce at least a few forks
- Still random enough to feel organic, not mechanical

### 2. Raise particle cap: 80 → 120
- With 24-52 base particles per kill, 80 cap leaves little room for branches
- 120 gives headroom for branches without runaway allocation

### 3. Allow branching during funnel phase (not just burst)
- Currently branches only happen during the first 250-400ms burst
- Add a second branching window during funnel flight: lower chance (4%), only for particles past 40% of their funnel journey
- Mid-flight forks toward the scoreboard create visible branching trails
- Same max depth 2, same cap check, same `branched` flag per particle

## Implementation

### Changes to spawnExplosion particle loop (no changes needed)

### Changes to animate() particle update loop (~line 6712)

**Burst phase branching (existing block):**
```
- Math.random()<0.03  →  Math.random()<0.10
- particles.length<80  →  particles.length<120
```

**Funnel phase branching (new block, after the funnel pull calculation):**
```javascript
// Funnel-phase branching: fork mid-flight toward score
if(!p.branched&&(p.branchDepth||0)<2&&particles.length<120&&Math.random()<0.04){
  p.branched=true;
  // spawn child with deflected velocity, shorter life
  // ... same pattern as burst branch ...
}
```

The funnel branch child should:
- Copy parent position
- Use parent velocity rotated ±30-60° around Y axis
- Have 60% of parent's remaining life
- Inherit `funnelToScore:true` and `awardId`
- Start at 70% of parent's current scale

## Blast Radius

| Area | Impact |
|------|--------|
| Burst branch block (~line 6712) | Chance 3%→10%, cap 80→120 |
| Funnel phase (~line 6730) | New branch block added |
| spawnExplosion() | NO CHANGE |
| createScoreAward() | NO CHANGE — branches share parent's awardId |
| collectScoreAwardChunk() | NO CHANGE — collection is per-awardId proximity |
| Mobile performance | Cap 120 still bounded; reduced mode already cuts base count by 30% |

## Edge Cases

- **Rapid kills**: Two kills in quick succession could push toward 120 cap. Cap check prevents runaway. Branches simply stop spawning.
- **Branch inherits awardId**: Branch particles can collect score chunks just like parents. This is intentional — they're part of the same kill's particle cloud.
- **Mobile reduced mode**: Base count is already 70% on mobile. With 120 cap and 30% fewer starting particles, branches have room.
- **Branch of a branch**: Depth 2 max means a branch can branch once more. Depth check prevents infinite recursion.

## Testing Plan

1. Parse check passes
2. Kill an enemy — visible forking during burst phase
3. Watch funnel flight — occasional mid-flight forks toward scoreboard
4. Rapid kills — no frame drops, particle count stays under 120
5. Mobile: fewer base particles, branches still spawn within cap
