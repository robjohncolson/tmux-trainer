# Desk Roster Alignment + Stability + Gamification — Spec

**Date**: 2026-06-10 · **Status**: awaiting sign-off · **Repos**: `tmux-trainer` (this repo) + `school/follow-alongs` (Desk + roster-server)

All file:line citations verified against live code on 2026-06-10 (30/30 ground-truth claims held; audit findings each adversarially cross-checked). Codex external review incorporated (10 findings: 4 HIGH, 4 MEDIUM, 2 LOW — all addressed; revision notes inline, marked **[CX-n]**).

**Discovered during review:** the follow-alongs repo has already provisioned the trainer's ledger path — `migrations/0016_item_ledger_trainer_source.sql` exists (naming tmux-trainer as an intended writer) and `ledger.js` already maps check-violations to a friendly 503 (`isSourceNotProvisioned`, ledger.js:11-17). The sibling ti84-trainer-v2 already writes `source:'trainer'` rows with a `TI84-` itemId prefix; this app uses the distinct `TR-` prefix.

---

## 0. Teacher decisions (locked 2026-06-10)

| # | Decision | Choice |
|---|----------|--------|
| 1 | lrsl backend fate | **Port to roster-server** — retire lrsl for ALL decks; new `trainer_state` storage on roster-server |
| 2 | Kanji decks | **Roster identity too** — same sync path, deckId `joyo-kanji` (compact wire format is mandatory: full kanji SRS is ~0.5–1.3 MB and already exceeds lrsl's 100 kb body limit — every kanji push 413s today while showing "synced") |
| 3 | Grade pipeline | **Grade-inert ledger rows** — teacher runs a migration adding `source='trainer'`; rows are skipped by the grade engine by construction (`lesson-grade.js` branches never match, `parseItemLesson` skips unknown itemId patterns) |
| 4 | Token bridge | **Send token over postMessage**, origin-pinned both directions |
| 5 | CORS | **Document dependent origins now**; explicit-allowlist prepared as a patch the teacher applies/deploys when convenient |
| 6 | Exam date | **Per-cartridge metadata + auto-quiesce** (no date or past date → normal mode, no banner) |
| 7 | Gamification | **All four bundles**: Quick wins, Daily loop, Quests & challenges, Social & teacher |

---

## 1. Identity system (replaces lrsl login end-to-end)

### 1.1 Session model

New localStorage key **`td-roster.v1`**, mirroring the Desk's frozen `apstats_roster.v1` shape (`roster-client.js:87-97`):

```json
{ "studentId": "...", "username": "date_tiger", "realName": "...", "section": "PeriodX",
  "token": "b64url.b64url", "role": "student", "spriteHue": null,
  "mustChangePassword": false, "signedInAt": "ISO" }
```

New helpers replace the old trio (`getIdentity` `:2280`, `setIdentity` `:2294`, `clearIdentity` `:2303`):

- `getRosterSession()` — reads/validates `td-roster.v1` (guarded JSON.parse). Returns `null` when absent/expired.
- `setRosterSession(session)` — writes the full shape. **The PIN is never an argument and never stored.**
- `clearRosterSession()` — removes `td-roster.v1` **and** all legacy keys.

**Legacy purge (one-time, on every boot):** delete `td-cloud-username`, `td-cloud-realname`, `userIdentity` (localStorage) and `td-cloud-pw` (sessionStorage). This kills the plaintext-password store (`:2300`) and the broken-logout vector (`clearIdentity` never removed `userIdentity`, so logout silently un-logged-out — confirmed at `:2288-2291` + `:4423`).

### 1.2 Standalone sign-in (MORE tab, vercel.app or GH Pages)

Replaces the lrsl picker (`:4607-4620`) and `verifyUser` (`:2311-2317`):

1. Section select: `GET /roster/open-sections` (public, 120 s cache) → default/auto-select when exactly one section.
2. Student picker: `GET /roster/section/:section` (public) → dropdown of `realName (username)`. Fallback to free-text username input on fetch failure (mirrors current behavior).
3. PIN input: `type="password" inputmode="numeric" maxlength="4" autocomplete="off"`.
4. `POST /roster/verify {username, password: pin}` → on 200, `setRosterSession({...resp, username: typedUsername})` (**verify omits `username` in the response** — keep what the user typed, per `roster-client.js:89`).
5. Then run the trainer-state pull (§3).

**Error UX** (current code conflates everything — confirmed at `:2311-2317`, `:2400-2426`):

| Response | Message |
|---|---|
| 401 | "Wrong username or PIN." |
| 429 | "Too many tries — locked for a bit. Wait ~15 minutes and try again." |
| 5xx / JSON parse fail | "Class server hiccup — try again in a minute." + `[RETRY]` |
| timeout (8 s) | "Server is waking up (can take ~30 s)…" + `[RETRY]` |

**Form fixes** (verified defects): Enter submits the form; the title-screen hotkey handler gets an editable-element guard (`INPUT/SELECT/TEXTAREA → return`) at the top of `:5480-5493` mirroring the existing Space guard at `:5431-5433` — today typing `p`/`b`/`r` in the PIN field switches tabs and wipes the form.

No claim/self-signup flow in the trainer — students claim accounts via the Desk. Sign-out button: `clearRosterSession()` + re-render; verify in DevTools that storage is empty.

### 1.3 Embedded handshake (postMessage, designed from scratch — zero protocol exists in the Desk today)

**Child (trainer), in `bootInit`:** if `window.parent !== window`, post `{type:'roster-identity-request'}` to `window.parent` with `targetOrigin 'https://robjohncolson.github.io'`. Retry at 300 ms / 1 s / 3 s until a reply or 4 attempts (covers listener races; close→reopen reboots the iframe so boot-time request suffices — minimize keeps the iframe alive and needs no re-handshake, per Desk `:12953-12955`, `:12964-12972`).

Accept replies only when `event.origin === 'https://robjohncolson.github.io'` and `event.data?.type === 'roster-identity'`. The reply's `session` field is **authoritative for the embedded context**: object → `setRosterSession(session)`; `null` → run anonymous (do not nag).

Standalone / `file://` / no reply: fall back to stored `td-roster.v1`, else anonymous. Note: the embed's localStorage is **partitioned** from the direct-visit store in modern browsers — the handshake (identity) plus server sync (progress) is what bridges contexts; document this, don't fight it.

**Desk (follow-alongs repo), in the APP LAUNCHER block after `minimizeApp` (~line 13008):**

```js
window.addEventListener('message', function (event) {
  if (event.origin !== 'https://tmux-trainer.vercel.app') return;
  // [CX-1] Bind to the launched iframe instance — never answer arbitrary
  // windows that merely share the origin (popups, other tabs):
  var frame = document.getElementById('app-formulas-frame');
  if (!frame || event.source !== frame.contentWindow) return;
  var data = event.data || {};
  if (data.type === 'roster-identity-request') {
    var session = (window.rosterClient && rosterClient.current()) || null;
    if (session) session = Object.assign({}, session, { token: rosterClient.token() });
    event.source.postMessage({ type: 'roster-identity', session: session },
      'https://tmux-trainer.vercel.app');
  }
  // 'trainer-event' handling — §5.4
});
```

- Reply via `event.source` (already verified === the formulas iframe), targetOrigin pinned.
- **[CX-1]** Child side symmetrically requires `event.source === window.parent` in addition to the origin check before accepting a `roster-identity` reply.
- `rosterClient.current()` deliberately omits the token (`roster-client.js:52-64`); decision #4 adds `rosterClient.token()` explicitly.
- `roster-client.js` loads at Desk line 1996, far before this block — `rosterClient` is guaranteed present.
- Listener is top-level and additive; if it throws, nothing else in the Desk is affected (fail-open).
- Note: Desk "view-as-student" preview sends the **real** signed-in session (teacher), not the view-as target — acceptable; the trainer respects `role`.

**Token rules:** never in a URL query string (server access logs). Storage: inside `td-roster.v1` only. On any roster-server 401 (expired 30-day token, no refresh endpoint exists): clear the session, show "Session expired — sign in again" (standalone) or silently re-request from the parent (embedded).

### 1.4 Iframe keyboard focus (verified defect — all shortcuts dead until a click inside the embed)

- **Desk side:** in `openApp`, after `overlay.style.display='block'`, call `iframe.focus()` (best-effort, wrapped in try).
- **Trainer side:** at boot, if `document.hasFocus()===false`, show a small "▶ CLICK TO ACTIVATE KEYBOARD" badge on the title screen; remove on first `focus`/`pointerdown`. (The title screen is fully clickable, so this is a hint, not a gate.)

---

## 2. Server work (roster-server — auto-deploys to Railway on push; grade-affecting; land carefully)

### 2.1 Migrations (TEACHER RUNS THESE in Supabase — code ships before, degrading gracefully)

**[CX-5]** The ledger-source migration **already exists** as `migrations/0016_item_ledger_trainer_source.sql` (user-run; whether it has been executed is unknown — the friendly-503 path covers both states). Do **not** create a duplicate. The only new migration is:

**`migrations/0017_trainer_state.sql`**

```sql
create table if not exists trainer_state (
  student_id text not null references roster(student_id) on delete cascade,
  deck_id    text not null check (deck_id ~ '^[a-z0-9-]{1,64}$'),
  state      jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (student_id, deck_id)
);
```

**[CX-7]** `default now()` only fires on INSERT — every upsert's `ON CONFLICT DO UPDATE` (or Supabase upsert payload) must explicitly set `updated_at = now()`, otherwise leaderboard "last active" goes permanently stale. This is a route-contract requirement, not optional.

### 2.2 New module `roster-server/trainer.js` (mounted like ledger.js)

| Route | Auth | Behavior |
|---|---|---|
| `GET /trainer/state/:deckId` | **Bearer only** [CX-2] → own row | `{ok, found, state, updatedAt}`; `found:false` when no row |
| `PUT /trainer/state/:deckId` | token in body | body `{token, state, baseUpdatedAt}`; full-replace upsert with **optimistic concurrency** [CX-4]: if the row exists and its `updated_at` ≠ `baseUpdatedAt` → `409 {error:'stale', updatedAt}`; client re-pulls, merges (§3.2 rule 9), retries once. `baseUpdatedAt:null` is required-and-honored only when the client has never pulled a row (`found:false`). Reject state > 256 KB (413 + friendly message). Upsert sets `updated_at = now()` explicitly [CX-7] |
| `PATCH /trainer/state/:deckId` | token in body | **[CX-3] delta endpoint for the page-hide flush.** Body `{token, delta}`; server merges: top-level keys shallow-replace (`state || delta`), except `delta.srs` which merges **per-card** into `state.srs` (union, incoming card wins). No concurrency check (best-effort flush; the next pull reconciles per-card by rev). No existing row → insert the delta as initial sparse state (completes on the next full PUT); sets `updated_at = now()`. PUT and PATCH success responses include the fresh `updatedAt` so the client refreshes `baseUpdatedAt` without an extra GET |
| `GET /trainer/leaderboard/:section/:deckId` | public | join roster ↔ trainer_state, per student: `{username, realName, lb, updatedAt}` where `lb` is the client-stamped summary (§5.1). **[CX-8] Explicitly non-authoritative classroom display** — values are client-owned and tamperable; never feed grades or rewards with teeth from this. Names are already public via `GET /roster/section/:section` (same data class), so public read matches house style |
| `GET /trainer/section/:section/summary/:deckId` | teacher (`requireTeacher` — bearer token resolving to role teacher; never the shared secret in client code) | leaderboard fields + `updatedAt` (last active) per student — feeds the teacher snapshot. Same non-authoritative caveat: engagement signal, not assessment |

- **[CX-2] Token transport:** GET routes are `Authorization: Bearer` only — **no `?token` query param on any new route** (query strings land in access logs/history; do not copy the legacy `?token` pattern from sprite-hue/ledger GETs). Writes carry the token in the JSON body, matching `/ledger/record`.
- **[CX-9] Token scoping:** any valid token (student or teacher role) reads/writes **only its own row** on `/trainer/state`. Cross-student access exists only via the teacher summary endpoint and returns summaries — never full SRS state.
- **[CX-10] deckId validation:** `/^[a-z0-9-]{1,64}$/` enforced on every route (and by the client before calling); no normalization — invalid input is rejected with 400.
- **Friendly-503 pattern** (house style, `class.js:79-86`): all trainer routes detect `42P01` (missing table) → `503 {error:'trainer_state not provisioned'}`. ~~ledger.js detector~~ — **already shipped** (`isSourceNotProvisioned`, ledger.js:11-17) [CX-5].
- **[CX-6] Body limit:** the global `app.use(express.json())` at `server.js:49` (Express default 100 kb) runs before any router and would reject kanji-sized PUTs (~90–120 KB). Change it to `express.json({ limit: '600kb' })` — one deliberate global raise, documented in roster-server CLAUDE.md (blast radius: all routes accept larger bodies; acceptable for a single-class server).
- Server stays otherwise dumb: no validation of `state` internals beyond size + deckId.

### 2.3 Grade-inert ledger writes (decision #3)

Client POSTs `POST /ledger/record {token, source:'trainer', itemId, response, score, attempt:1}` on **daily-mission completion** and **quest claims** only (not every run — keeps the ledger signal, not noise):

- `itemId` namespace is **hyphenated** — `TR-<deckId>-DAILY-<yyyy-mm-dd>`, `TR-<deckId>-QUEST-<topicId>` — because `GET /ledger/student/:id?prefix=` forbids underscores (Supabase `.like` wildcard). Distinct from ti84-trainer-v2's `TI84-` prefix on the same source; conventions aligned with its `recordTrainerAttempt` (`app.js:2163-2187`): score 0..1, `attempt:1` so re-completion upserts the same row, fire-and-forget.
- `score` = accuracy 0..1; `response` = small JSON (waves, xp, topic).
- Grade-inert by construction: no `src==='trainer'` branch exists in `grade.js`/`lesson-grade.js`, and `parseItemLesson` returns null for the `TR-` pattern (0016's header documents the same intent: "Recording starts now; grading joins later").
- Client treats 503 ("source not provisioned" — already implemented server-side) and 5xx as silent no-ops — safe to ship before the teacher runs 0016.

### 2.4 CORS (decision #5)

- **This pass:** add a "Dependent origins" section to `follow-alongs/roster-server/CLAUDE.md` (or README) listing `https://robjohncolson.github.io`, `https://tmux-trainer.vercel.app`, plus note that `app.use(cors())` at `server.js:48` is intentionally open and must not be hardened without including these.
- **Prepared, not deployed:** `roster-server/docs/cors-allowlist.patch` — one-line `cors({origin: [github.io, vercel.app, localhost dev origins]})` change + apply/verify instructions. Teacher applies and pushes when convenient (push = deploy).

---

## 3. Cloud sync port (lrsl → roster-server) — with every audited defect fixed by design

The lrsl client (`SYNC_SERVER :2274`, `syncToCloud :2318`, `pullFromCloud :2343`, leaderboard `:4555-4601` incl. the N+1 fallback) is **deleted**, not flagged off. The replacement:

### 3.1 Wire format (compact — the kanji constraint)

`state.srs` syncs as per-card 4-tuples, not full card objects:

```
srs: { "<cardId>": [rev, pKnown_x1000, mastery, lastUpdated_epochMin] }
```

≈ 45 bytes/card → joyo-kanji (2,002 cards) ≈ 90–120 KB (vs. 0.5–1.3 MB today). `dagState`/`subPKnown`/static fields stay device-local (acceptable fidelity loss; BKT pKnown + mastery + rev are the cross-device essentials). Local storage format (`td-srs-<deckId>`) is unchanged.

### 3.2 Sync engine rules (each rule maps to a confirmed defect)

1. **`fetchWithTimeout(url, opts, ms=8000)`** — AbortController wrapper; **every** network call in the app routes through it (today: zero timeouts on 9 fetch sites).
2. **Check `resp.ok` everywhere** (today: `syncToCloud` shows green "synced" on 4xx/5xx — `:2328-2338`; `pullFromCloud` treats a 500-with-JSON-body as "no remote data" then arms pushes — `:2348-2374`).
3. **Pushes arm only after a successful pull** that returned 200 + (`found:true` merge done, or explicit `found:false`). A failed/timed-out/unrecognized pull leaves pushes disarmed and schedules retries (backoff 5 s/15 s/60 s, then on-demand). Kills both data-loss vectors (`:2377` catch and the non-ok path).
4. **In-flight queue with trailing push**: replace the `cloudSyncInFlight` boolean-drop (`:2320`) with a dirty flag; if a push is in flight, chain exactly one trailing push in `finally`. Add a `window 'online'` listener that flushes when dirty.
5. **Deck-switch guard**: snapshot `deckId` before any await; bail after the await if `activeCartridge.id` changed (today a slow pull merges deck A's cards into deck B's SRS — confirmed reachable). Single `pullInFlight` guard per deck.
6. **Page-hide flush**: `visibilitychange→hidden` and `pagehide` call `syncRunCheckpoint()` (run state + SRS — today the flush skips the run checkpoint entirely and is identity-gated, `:2394-2398`) and a **`PATCH` delta** with `keepalive:true` — `{lb, xp, streak, daily, hs, srs:<dirty card tuples only>}`, < 64 KB keepalive cap. **[CX-3]** Never a full-replace PUT from the flush path: a partial body through PUT would delete every omitted field; PATCH's defined merge semantics (§2.2) make the slim payload safe.
7. **`resetRev` persisted** in localStorage alongside `td-srs-<deckId>` (today memory-only — a reset while the push fails is silently reverted on next pull, confirmed `:2444`/`:4668-4680`).
8. SRS merge rule (client-side, unchanged semantics): per-card higher `rev` wins, `lastUpdated` tiebreak, `resetRev` epoch filtering.
9. **[CX-4] Non-SRS merge + stale-write handling**: every PUT carries `baseUpdatedAt` from the last pull; on `409 stale` the client re-pulls, merges, and retries once (then surrenders to last-writer-wins with a console warning). Cross-device merge rules for non-SRS fields, applied on every pull and on 409-retry:
   - **max()**: `xp.total`, `streak.best`, `hs`, `daily.missionsCompleted`, `streak.freezes`
   - **union**: `quests.claimed`, `quests.crests` (earlier claim timestamp wins per key)
   - **week-aware**: `xp.weeklyXp` — same `weekIso` → max; different → keep the newer week's pair
   - **newest-wins**: `streak.current`/`streak.lastDayIso` (the side with the later `lastDayIso`), `daily.lastMissionIso`
   - `lb` is never merged — recomputed from the merged state before each push.

### 3.3 Sync indicator states

`synced` / `syncing` / `offline (retrying)` / `error — tap to retry` / `signed out`. Never show `synced` unless the last push got a 2xx.

---

## 4. Stability fixes (Task 2 — all confirmed by adversarial verification)

### 4.1 Boot resilience

| Fix | Defect (verified) |
|---|---|
| Move `serviceWorker.register` into its own early `<script>` block; add `if (typeof THREE === 'undefined')` guard before first use that renders a friendly "OFFLINE — connect once to download" overlay | three.js CDN failure is boot-fatal: ReferenceError at `:2530` kills the whole inline script including SW registration at `:6168` → permanent black screen that can't self-heal |
| `lsGet`/`lsSet`/`lsRemove` safe wrappers; fix the **one top-level unguarded access at `:379`** (+ bare reads `:2204`, `:2220`, `:2252`, `:4472`) | `SecurityError` on blocked third-party storage (Chrome incognito default!) inside the Desk iframe kills the entire script → blank panel |
| Wrap each `loadCartridge` call in `bootInit` (`:6141-6158`) in try/catch → LOAD ERROR overlay ("Reload once to refresh the cached shell"); `onerror` on cartridge `<script>` tags logs which deck failed | SW version skew (network-first HTML + cache-first JS) can run new HTML against stale cartridges; a contract change then dies blank with no message |
| `window.addEventListener('error')` + `('unhandledrejection')` → one-line visible banner ("Something broke — reload") | No global error handler anywhere; embedded students have no console and the teacher gets no signal |

### 4.2 UI/input fixes

- **Dead BROWSE DRILL buttons** (`:4350`): `JSON.stringify(cmds)`'s double quotes truncate the double-quoted `onclick` attr → every handler is the syntax-error fragment `_browseStartTopic('1-7',[`. Fix: pass only the topic id; `_browseStartTopic(topicId)` looks up commands from `window.AP_STATS_TOPIC_MAP`.
- Hotkey editable-element guard + Enter-to-submit (§1.2).
- **XSS/escaping**: `escapeHtml()` helper applied to every server-derived string before innerHTML (leaderboard rows `:4592`, any picker options — confirmed stored-XSS vector via self-registered real names; also fixes `<`/`&` corrupting the table).
- **QR/link origin fork**: QR encodes `vercel.app` (`:1788`) but the printed link says `github.io/tmux-trainer` (`:4541`) — both become `https://tmux-trainer.vercel.app/`.
- Leaderboard denominator: `'/66'` (`:4594`) → `activeCartridge.commands.length` (AP deck is 81; kanji shows 2,002).
- Cold-start feedback: after 4 s of any loading state, swap to "Waking the class server… (can take ~30 s)"; every failure state gets `[RETRY]`.
- Domain-pill label disambiguation (`:4411-4418`) after a 5-minute audit of actual `dom` assignments; video link 📖→▶ with ≥40 px tap target; truncated topic descriptions get tap-to-expand (tooltips are hover-only).

### 4.3 Game-state hardening

- **Run-state versioning**: `loadRunState` (`:2189-2199`) rejects `parsed.version !== 1` and clears the key; `continueGame` sanitizes each enemy (numeric id, finite `t` in [0,1], resolvable `cmd.id`) and wraps the restore in try/catch → `clearRunState()` + fresh title (today a malformed checkpoint soft-bricks CONTINUE forever, confirmed incl. the Escape-path re-poisoning).
- **Slim snapshots**: drop the full `srs` map from `buildRunStateSnapshot` (`:2148` — it's independently persisted and re-merged from `td-srs` anyway) and store enemies/waveCommands as cmd-id references rehydrated from `COMMANDS`. Cuts joyo wave-clear writes from ~1–2.6 MB to a few KB; removes the quota exposure.
- High-score NaN guard: `Math.max(0, parseInt(...,10)||0)` (`:2200-2212` — a poisoned value currently persists `'NaN'` forever and disables the feature).
- Animation manifest: route through `fetchWithTimeout`; on SW-synthesized 503 keep `animationManifest=null` ("unknown") instead of an empty Set that permanently hides WATCH for the session (`:1369-1385`).
- Exam date (decision #6): `EXAM_DATE` const (`:1945`) → `getExamDate()` reading `activeCartridge.examDate` → `lsGet('td-exam-date')` override → null. Past/absent → `{urgency:0, daysLeft:null, mode:'normal'}`, no banner (`:4442-4444` branch). The AP cartridge ships **without** a 2027 date until published; kanji has none. Unblocks new-card intake currently throttled to 1/wave forever.
- Multi-tab run-state: before overwrite, skip the write if the stored snapshot has a newer `savedAt` AND higher wave (cheap last-writer-wins mitigation).

### 4.4 Cheap accessibility wins (full pass stays in backlog)

Remove `maximum-scale=1.0, user-scalable=no` from the viewport meta (`:5`); bump the worst contrast offenders (`#5a3800`, `#3d1f00` on near-black → ≥ `#8a5a20`); one `aria-live="polite"` status node for wave-clear/game-over announcements.

### 4.5 Deliberately deferred

Particle pooling (stretch goal — GC churn, not a leak; pool pattern already exists for trail ghosts), full ARIA/focus-trap pass, `prefers-reduced-motion`, modularization. The "event-listener leak on screen transitions" known-issues item is **closed as already-mitigated** (verified: all 16 listeners attach once at boot by design).

---

## 5. Gamification (all four bundles)

### 5.1 `trainer_state` JSONB shape (one row per student × deck; client-owned)

```json
{
  "v": 1,
  "srs": { "<cardId>": [rev, pKnown_x1000, mastery, lastUpdated_epochMin] },
  "resetRev": 0,
  "hs": 12345,
  "xp": { "total": 0, "weekIso": "2026-W24", "weeklyXp": 0 },
  "streak": { "current": 0, "best": 0, "lastDayIso": "", "freezes": 0 },
  "daily": { "lastMissionIso": "", "missionsCompleted": 0 },
  "quests": { "claimed": { "<topicId>": "ISO" }, "crests": { "<unit>": "ISO" } },
  "lb": { "gold": 0, "seen": 0, "hs": 0, "weeklyXp": 0, "streak": 0, "level": 1, "weakUnit": "U5" }
}
```

`lb` is the small denormalized summary the leaderboard/teacher endpoints read (`state->'lb'`) without touching the srs blob. Client recomputes `lb` on every push. Level is derived: `level = floor(sqrt(xp.total/150)) + 1`.

### 5.2 Daily loop

- **DAILY MISSION** button on the PLAY tab: a 3-wave run (~18 questions, ~5 min) whose pool is the due/overdue/decayed buckets `pickCommands` already classifies (`:2047-2085`), falling back to fresh cards when < 12 are due. End screen: cards banked, XP earned, "N cards come due tomorrow."
- **Streak**: a day counts when a daily mission is completed. **School-week streaks** — Saturday/Sunday are skipped in the day-diff (never break, never count). Every 7-day streak earns one **freeze token** (bank cap 2) that auto-spends to cover a missed weekday.
- **XP** (anti-grind by design): base 10/correct answer; + BKT delta bonus `round(ΔpKnown×100)` cap 25; first silver (mastery ≥3) +50; first gold (≥4) +100; decayed-card rescue +15; per-card daily cap of 3 scoring answers; mission completion +100. Weekly challenge runs ×2 (§5.3). `weeklyXp` resets when the ISO week changes.
- Display: XP/level chip on the PLAY tab + game-over screen; streak flame next to it.

### 5.3 Quests & challenges

- **Topic quests**: silver-star every formula in a topic → badge (claim action on BROWSE row); all topics in a unit → **unit crest** shown in BROWSE and the title screen. Prereq fix: `showEndScreen` currently nulls `topicFilter`/`topicFilterId` before recording anything (`:4905-4906`) — record topic-run completion first.
- **BROWSE mastery heatmap**: per-topic chips colored by live mastery (join `td-srs` × `AP_STATS_TOPIC_MAP` in `buildBrowseTabHtml :4321`, reuse `MASTERY_COLORS :363`) + per-unit progress rings. Per-topic best score stored under `quests` fixes "one high score for everything."
- **Weekly challenge**: deterministic from ISO week number — rotates through the 9 units (~4 full passes before May 2027), banner on PLAY ("WEEK 24: UNIT 6 · 2× XP"), challenge difficulty preset.
- **Path-to-May meter**: when `examDate` is set, show pace ("37 of 81 formulas on track — at this pace you finish in February") instead of a bare countdown; when unset, show coverage only.
- **Comeback valves**: perfect wave (zero misses) → +1 life, cap 5 (no regen path exists today; `BASE_LIVES=5`); returning after ≥3 days → first wave built from the student's decayed cards at gentler speed with bonus XP ("rust-buster").
- Topic-drill HUD badge: render `G.topicFilterId` next to the wave indicator and on the CONTINUE line (`:4485`, `:4788-4794` already persist it).

### 5.4 Social & teacher

- **Section leaderboard** (RANKS tab, replaces lrsl): `GET /trainer/leaderboard/:section/:deckId`. Columns: **Weekly XP** (default sort — resets weekly so the same three students don't own it), gold stars, streak, all-time high score. "YOU" highlight via session. Anonymous users see the board read-only with a gentle "sign in to appear" note (one line, MORE tab only otherwise).
- **Teacher snapshot**: when `role==='teacher'`, the RANKS tab gains a TEACHER view — per student: last active (`updatedAt`), current streak, weekly XP, level, weakest unit (`lb.weakUnit`, client-computed as the unit with lowest avg pKnown). Auth: the teacher's own **bearer token** (which `requireTeacher` accepts when it resolves to `role='teacher'`) — the shared `x-teacher-secret` must never appear in client code. [CX-8] caveat applies: this is an engagement signal built from client-stamped data, not assessment evidence.
- **Desk-visible completion**: on run-complete / quest-claim / daily-mission, if embedded, post `{type:'trainer-event', event, deckId, topicId?, score, accuracy, ts}` to the parent (pinned targetOrigin). Desk listener (same block as §1.3) appends to a capped (50) `localStorage['trainer-events.v1']` log and shows a small toast using existing Desk UI conventions + `MacSFX`. Grade pipeline untouched.
- **Section co-op goal** (lowest priority, ships last): bar on RANKS — "PeriodX has banked N/T stars in Unit ⟨current weekly-challenge unit⟩"; section aggregate computed client-side from the public leaderboard response. Reward: cosmetic palette unlock for everyone when filled.

### 5.5 Explicitly out of scope

Cosmetic unlock track (melody slots/palettes/scene skins) — deferred until the XP/quest sink proves out; grade-relevant credit; claim flow in the trainer.

---

## 6. Implementation plan (order matters)

| Phase | Repo | Work | Risk |
|---|---|---|---|
| A | tmux-trainer | Stability core: `fetchWithTimeout`, `lsGet/lsSet`, escapeHtml, boot guards, global error handlers, DRILL fix, hotkey/Enter fixes, QR/link, denominator, NaN guard, run-state hardening, exam-date quiesce, a11y quick wins | Low — self-contained |
| B | follow-alongs | roster-server: migration **0017_trainer_state.sql** (file only — teacher runs SQL; 0016 + ledger 503 already exist [CX-5]), `trainer.js` router + mount, `express.json` limit raise [CX-6], CORS docs + patch file | **Server deploys on push** — code must degrade gracefully pre-migration (it does, via found:false/503 paths) |
| C | tmux-trainer | Identity swap (§1), sync engine port (§3), legacy lrsl code deletion, new RANKS data source | Medium — biggest diff; anonymous play must stay untouched |
| D | follow-alongs | Desk: postMessage listener + `iframe.focus()` + trainer-event toasts | Low — additive, fail-open; **stage only own paths** (~180 dirty untracked files in that repo; never `git add -A`) |
| E | tmux-trainer | Gamification: daily mission, XP/streak, quests, heatmap, weekly challenge, comeback, leaderboard UI, teacher view, co-op bar | Medium — feature-gated on cartridge id where AP-specific (topics need `AP_STATS_TOPIC_MAP`; kanji gets XP/streak/daily but no topic quests) |
| F | both | SW `CACHE_SHELL` → `td-shell-v13`; `CONTINUATION_PROMPT.md` update (incl. fixing the v11 stale refs + line-2553 mojibake); commit + push both repos | — |

GitNexus: index can't resolve `index.html` inline functions (known) — impact analysis applies to roster-server `.js` files only; run `gitnexus_detect_changes` before the follow-alongs commit.

## 7. Testing plan (definition of done)

From the mission checklist, plus additions:

- [ ] Standalone vercel.app: sign in as `date_tiger` + PIN → identity shown, survives reload, sign-out leaves **zero** identity keys (DevTools audit).
- [ ] `grep`-proof: no PIN/password string written to any storage anywhere; no `userIdentity`/`td-cloud-*` writers remain.
- [ ] Inside the Desk (GH Pages, signed in): trainer shows the same identity with no re-login; signed-out Desk → anonymous trainer, no nag.
- [ ] Clear all site data → fully playable anonymously; only the MORE tab mentions sign-in.
- [ ] 10 wrong PINs → friendly lockout message (429 path).
- [ ] Cloud round-trip: play on device A, open device B signed in → progress appears; kill server mid-session → indicator goes offline, localStorage intact, no cloud overwrite after recovery (the §3.2 rules).
- [ ] Pre-migration server: trainer state GET/PUT/PATCH 503s handled silently; ledger writes silent; everything else works. Post-0017: PUT with stale `baseUpdatedAt` → 409 → pull-merge-retry observed; PATCH flush merges without deleting fields.
- [ ] DRILL buttons start topic runs; daily mission runs 3 waves and stamps the streak; XP/level/leaderboard update; teacher account sees the snapshot.
- [ ] Kanji deck: same identity, sync payload < 256 KB, no exam banner, no topic quests, no regression in kanji gameplay.
- [ ] Parse check (inline-JS `new Function` harness) passes; `validate-cartridge.js` passes; SW bumped to v13 and a redeploy propagates without hard refresh.
- [ ] Both repos pushed; teacher tests on public URLs.

## 8. Edge cases

- **Roster is nearly empty today** (PeriodX = 1 account): picker renders fine with 1 entry; free-text fallback covers unlisted users; design assumes the teacher seeds sections before September.
- Token expiry (30 days, no refresh): 401 → re-login/re-handshake path (§1.3); embedded re-handshake is silent.
- `mustChangePassword:true`: show one-line "Update your PIN in the Desk" note; don't block play.
- Teacher in the trainer: gets XP etc. like anyone; excluded from the student leaderboard render (role filter client-side); sees TEACHER view.
- Whole-class simultaneous sign-in behind one school NAT: per-IP limiter is 300/15 min on verify — 25 students is fine; document the limit.
- Two tabs same deck: state pushes are full-replace last-writer-wins; per-card rev merge on pull bounds the damage (same as today, now without the corruption vectors).
- Desk minimize/restore: no reboot → no re-handshake needed; close/reopen → fresh boot handshake (verified Desk lifecycle).
- lrsl server: untouched and still serving the legacy lrsl-driller app; this work only removes the *trainer's* dependency on it.
