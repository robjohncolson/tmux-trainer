# Align the Equation Trainer with the Desk's roster identity + stability & gamification pass

You are working in `C:/Users/rober/Downloads/Projects/tmux-trainer` — the "Equation Trainer" used by an AP Statistics class. Everything in the **Ground truth** sections below was extracted from the actual code on 2026-06-10 with file:line citations — trust it over older docs in either repo, and re-verify a citation before building on it if anything seems off.

## Mission (in priority order)

1. **Identity alignment**: replace this app's legacy account system with the roster identity the Desk uses, end-to-end (standalone AND embedded-in-Desk).
2. **Stability pass**: fix the known defects listed below, then do your own audit.
3. **Make the app better and more gamified**: brainstorm broadly, present a menu, spec the approved items, implement.

**Process**: the teacher prefers brainstorm-first → written spec (a `.md` in this repo) → sign-off → implement. Put ALL the decision-point questions (section below) to the teacher in one batch before writing the spec.

## Context

- This repo is a single-file static app: `index.html` (~6,171 lines, inline CSS+JS), no framework, no build, no package.json. CDN deps (three.js r128, KaTeX 0.16.9, qrcode) at `index.html:322-325`. Deck data loads as sibling scripts (`index.html:344-353`).
- Deployed at **https://tmux-trainer.vercel.app** (Vercel serves repo root, all defaults — no vercel.json) and mirrored at https://robjohncolson.github.io/tmux-trainer/ (the in-app QR at `index.html:4541` points at the GH Pages mirror — check whether it's stale).
- It is embedded **cross-origin** as the "Equation Trainer" inside the AP Stats **Desk**: repo `C:/Users/rober/Downloads/Projects/school/follow-alongs`, deployed page `https://robjohncolson.github.io/apstats-live-worksheet/ap_stats_roadmap_square_mode.html`. The Desk's `APP_REGISTRY` (line 12933) loads `https://tmux-trainer.vercel.app/#deck=ap-stats-formulas` into `<iframe id="app-formulas-frame">`.
- Decks register by pushing onto `window.TD_CARTRIDGES` (`ap-stats-cartridge.js:1790` — the AP deck, 81 commands; plus the kanji decks). `#deck=` hash parsing in `bootInit()` (`index.html:6119`); `#topic=N-M` deep-links the BROWSE tab.
- Service worker `sw.js`: shell cache `td-shell-v12`, network-first navigations. **Bump the cache version whenever you change shipped assets.**
- No test framework; `validate-cartridge.js` validates cartridges only. The live known-issues list is at the tail of `CONTINUATION_PROMPT.md`. GitNexus cannot resolve `index.html`'s inline functions as symbols (noted there) — don't fight it.
- Repo untouched since 2026-04-28 (HEAD `a9f2bb1`, BROWSE tab).

## Ground truth A — the CURRENT identity system (what you're replacing)

- `getIdentity()` (`index.html:2280-2293`) reads localStorage `td-cloud-username`, `td-cloud-realname`, sessionStorage `td-cloud-pw` (**plaintext password**), falling back to localStorage `userIdentity` = JSON `{username, realName, password}` (**plaintext password, shared with the old lrsl-driller app**).
- `setIdentity()` (`:2294-2302`) writes all of those *including* the plaintext password into `userIdentity`. `clearIdentity()` (`:2303-2310`) removes the `td-cloud-*` keys but **not** `userIdentity` — so logout silently un-logs-out on next load. Both are defects to eliminate.
- Login backend is the **old lrsl-driller server**: `SYNC_SERVER='https://lrsl-driller-production.up.railway.app'` (`:2274`). `GET /api/users` → `[{username, real_name, class_period}]` populates a picker (`:4609-4619`); `POST /api/users/verify {username,password}` (`:2311-2317`); `handleLogin()` (`:2400-2426`). **This is NOT the roster system the Desk uses — they are disjoint account databases.** Probe early whether that server is even still alive.
- Cloud SRS sync (`:2318-2380`): `POST /api/progress/cartridge-sync` (full-replace of the SRS map), `GET /api/progress/cartridge/<username>/td-<deckId>` with per-card rev merge; leaderboard `GET /api/progress/leaderboard/td-<deckId>`.
- Progress is per-deck, identity-independent: localStorage `td-srs-<deckId>` (BKT cards), `td-highscore-<deckId>`, `td-run-state-<deckId>`, `td-melody-<deckId>`. Anonymous play is fully functional — identity only adds cloud sync + leaderboard.

## Ground truth B — the roster identity contract (the target)

Server: **roster-server**, `https://roster-production-12c1.up.railway.app` (source: `follow-alongs/roster-server/`). Client reference implementation: `follow-alongs/roster-client.js` (+ `roster_config.js`, `gradebook-client.js`).

- **CORS is wildcard-open**: literally `app.use(cors())` (`server.js:48`) — no origin allowlist, no cookies. A fetch from `https://tmux-trainer.vercel.app` works **today**. (Fragile dependency — see decision points.)
- **`POST /roster/verify`** — FROZEN CONTRACT (`server.js:166-251`). Body `{username, password}` → 200 `{ok:true, studentId, token, realName, section, mustChangePassword, role:'student'|'teacher', spriteHue:number|null}` (note: **no username in the response** — keep what the user typed). 401 with the same message for unknown-user and bad-password. **Per-username lockout: 10 failures / 15 min** (credentials are 4-digit PINs, so this matters — surface a friendly "locked, wait a bit" message on 429).
- **`POST /roster/claim`** — student self-signup (`server.js:326-439`): `{realName, section (must be in the open-sections allowlist, default 'PeriodX'), username (client-rolled fruit_animal, `^[a-z0-9_]{3,40}$`), pin (exactly 4 digits)}` → same response shape as verify (claim IS sign-in). 409 `username-taken` → re-roll. `GET /roster/open-sections` lists valid sections.
- **Token**: bearer-style HMAC (`b64url(JSON{sid,exp}).b64url(HMAC_SHA256)`), **30-day expiry**, not a JWT (`token.js:27-63`). Validate/whoami via `POST /roster/resolve {token}` → `{ok, studentId}`. **Never put the token in a URL query string** (server access logs); URL *fragment* or postMessage only.
- **Public student picker**: `GET /roster/section/:section` → `{students:[{username, realName, section}]}` (no auth) — can replace the lrsl `GET /api/users` picker UX.
- The Desk's session shape (localStorage `apstats_roster.v1`, FROZEN, written by `roster-client.js:87-97`): `{studentId, username, realName, section, token, role, spriteHue, mustChangePassword, signedInAt}`. **You cannot read that key from vercel.app — different origin.** Mirror the shape in your own key.
- **Score recording** (`POST /ledger/record`, `ledger.js:9-69`): `{token, source, itemId, response, unit?, topic?, skill?, score?, attempt?}`; studentId is derived server-side from the token (never trusted from the client). ⚠ `source` is a **closed Postgres CHECK enum**: `('worksheet','frq','curriculum_quiz','pc','blooket','quiz_exception','quiz_review')`. There is **no 'trainer' value** — writing one today fails as an opaque 500. Adding one = a USER-RUN Supabase migration (mirror `migrations/0013`) + a `lesson-grade.js` engine change if it should ever count toward grades; also pin the friendly-503 pattern from `class.js:79-84` in your spec. **Do not ship ledger writes until this is decided and provisioned.**
- Cross-origin state precedent: durable cross-app user state (e.g. `sprite_hue`) is stored **on the roster row server-side** and returned by `/roster/verify` — the right pattern for anything that must survive the origin boundary.

## Ground truth C — the Desk side (what exists and what doesn't)

- **No postMessage protocol exists anywhere** in the Desk — zero `postMessage`/message-listener hits in its 14k lines. `openApp(id)` just sets a static iframe src; **no identity params are appended to any app URL** (`ap_stats_roadmap_square_mode.html:12930-12961`). You will be designing the bridge from scratch.
- Same-origin apps (the in-Desk quiz at `robjohncolson.github.io/curriculum_render/`) get identity by reading the shared `apstats_roster.v1` localStorage key. That mechanism is origin-bound and unavailable to you.
- Today the Equation Trainer is a pure content link: opening it only bumps a local icon-usage counter. Nothing flows back into grades, Do-Now, or lesson completion (`_isLessonComplete` gates on worksheet+blooket only).
- The proven auto-score model to copy *if* trainer scores ever become grade-relevant: curriculum_render's quiz feeder POSTs `/ledger/record` → the engine → the Desk reads `/grade` and gates its Done button. No self-reporting.

## Task 1 — identity alignment (the core deliverable)

Requirements:

1. **Roster identity becomes THE identity** for this app: signed-in = `{studentId, username (fruit_animal), realName, section, role, token}`.
2. **Anonymous play keeps working exactly as today.** Identity adds sync/leaderboard/credit — it never blocks play.
3. **Standalone path** (student opens vercel.app directly): replace the lrsl login on the MORE tab with roster sign-in — username + 4-digit PIN → `POST /roster/verify`. Consider the `GET /roster/section/:section` picker to preserve the current dropdown UX. Handle 401 vs 429-lockout distinctly and kindly.
4. **Embedded path** (inside the Desk): design a minimal postMessage handshake. Suggested shape — child sends `{type:'roster-identity-request'}` to `window.parent` on boot; Desk replies `{type:'roster-identity', session:{studentId, username, realName, section, role, token}}`. **Both sides pin exact origins**: trainer accepts only `event.origin === 'https://robjohncolson.github.io'`; Desk sends only to `targetOrigin 'https://tmux-trainer.vercel.app'` and only for the `formulas` iframe. Trainer falls back gracefully to its stored session / anonymous when no parent answers (standalone, file://, GH Pages mirror).
5. The Desk-side patch lands in the **follow-alongs repo** (near `openApp`/`APP_REGISTRY`). Spec it precisely; you may implement it there as well — but that repo's working tree has unrelated dirty files, so **stage only your own paths**, follow its CLAUDE.md (roster-server pushes auto-deploy and are grade-affecting), and test on the public GH Pages URL (local file:// is not a valid test surface).
6. Store the trainer's session in its own localStorage under a new key (suggest `td-roster.v1`) mirroring the Desk session shape. **Never persist the PIN/password anywhere** — kill the `userIdentity` plaintext-password write and the `td-cloud-pw` sessionStorage stash. Make logout actually remove everything.
7. Decide (with the teacher — see decision points) what happens to the lrsl cloud-sync + leaderboard, and to the kanji decks' identity. Don't leave two half-alive account systems.

## Task 2 — stability (fix these, then audit)

Known defects found by code-reading (all cited from `index.html`):

1. **Expired exam date**: `EXAM_DATE='2026-05-07'` (`:1945`) is past, so `getExamUrgency` clamps to permanent CRAM mode — red "0 days" banner, new-card intake throttled to 1/wave forever. Make the date configurable (and define sane post-exam/no-date behavior); next cycle is ~May 2027.
2. **Cloud data-loss vector**: `pullFromCloud`'s catch sets `cloudSyncReady=true` even on failure (`:2377`), and the server sync is a full-replace — a failed pull followed by any push overwrites cloud SRS with local-only state. Fix the ordering/guard (moot if lrsl sync is retired, but fix whatever sync survives).
3. **Leaderboard hardcodes `/66`** (`:4594`) while the deck has 81 commands.
4. **Broken logout** (`clearIdentity`, `:2303-2310`) — see Task 1.
5. No fetch timeouts on any network call; no `window.onerror`/`unhandledrejection` handler anywhere.
6. `CONTINUATION_PROMPT.md` tail items: event-listener cleanup on screen transitions (memory leak), particle pooling, accessibility pass.
7. Embed-specific: verify keyboard focus inside the Desk iframe (gameplay is keyboard-driven and nothing claims focus on load) and audio autoplay policy in an iframe.

Then do your own pass: race conditions, SW cache-version discipline, the `td-run-state` checkpoint path, KaTeX/three.js CDN failure behavior offline.

## Task 3 — gamification & general betterment (brainstorm first, menu to teacher)

What exists: per-run score/combo (cap 3×)/streak with SFX milestones, BKT mastery stars (gold ≥4 / silver ≥3), per-deck high score, 12-wave runs, lives, exam-urgency mode, formula explainer videos (Supabase MP4s), BROWSE tab with per-topic runs. What does NOT exist: XP, levels, daily streaks, badges, section leaderboards, any tie-in to the class grade pipeline.

Seed ideas to evaluate and extend (estimate effort for each; let the teacher pick):

- Daily-streak + XP/level system layered on the existing SRS (persists per roster identity, not per device).
- **Period/section leaderboards** keyed on roster identity — `GET /roster/section/:section` gives the roster; decide server side (roster-server is the durable home; lrsl is the legacy one).
- Per-topic mastery quests tied to the BROWSE tab (`apstats-topic-map.js`) — "clear Unit 4" challenges that mirror the Desk's topic structure.
- Optional practice-credit into the grade pipeline (gated on the `source`-enum decision; start grade-INERT — visible to the teacher, not counted).
- Desk-visible completion: a postMessage back to the Desk ("student finished a 12-wave run on topic 4.7") even if grades stay untouched — the Desk could surface it in the resource panel.
- Comeback mechanics, weekly challenge seeds, cosmetic unlocks tied to mastery (the app already has a melody/MIDI system and three.js scenes to build on).
- Fresh eyes welcome: play the app first (`https://tmux-trainer.vercel.app/#deck=ap-stats-formulas`), list friction, then propose.

## Decision points — ask the teacher ALL of these before the spec

1. **lrsl backend fate**: retire it for the AP deck (roster-only) — and then: port cloud SRS sync + leaderboard onto roster-server (new endpoints, cross-repo work), keep lrsl temporarily keyed by roster username, or go local-only-with-ledger? Recommend: port to roster-server; it's the durable identity home.
2. **Kanji decks**: keep lrsl identity for them, or roster-everything, or anonymous-only?
3. **Grade-relevant or grade-inert** trainer scores? (Grade-relevant = USER-RUN migration + engine change + teacher sign-off on weights.)
4. **CORS dependency**: roster-server is wildcard-open today; one hardening line would break the trainer silently. Record `tmux-trainer.vercel.app` as a dependent origin (in roster-server docs/CLAUDE.md) or proactively switch the server to an explicit allowlist that includes it?
5. Exam-date policy for 2027 (hardcode next date, settings field, or auto-advance?).

## DECISIONS UPDATE (2026-06-10, from the follow-alongs session — supersedes the open questions above)

The teacher has decided several of the decision points fleet-wide. Build against these:

1. **Ledger source = `'trainer'`** — shared by this app and the TI-84 trainer. Migration `0016_item_ledger_trainer_source.sql` lives in follow-alongs/roster-server (USER-RUN on Supabase; do NOT create your own migration — follow-alongs owns the enum). Until the teacher runs it, `POST /ledger/record` with source `'trainer'` returns **503 "source 'trainer' not provisioned"** (friendly mapping just added) and `record()`-style fire-and-forget callers degrade harmlessly. Ship writes behind that expectation.
2. **Engine treatment: grade-INERT initially.** Rows persist and are teacher-visible; nothing in lesson-grade.js consumes `'trainer'`. Counting later is a deliberate separate change. Do not propose engine edits.
3. **itemId convention**: charset `[A-Za-z0-9-]` only. `TI84-<procedure>` is taken by the TI-84 trainer; use `EQ-<formulaId>` (e.g. `EQ-mean-sample`) for this app. Use `attempt: 1` so re-practice upserts one row per formula (latest-state semantics). Stamp `unit`/`topic` when the formula maps to one (the BROWSE topic map gives you this).
4. **lrsl-driller verdict**: it is being KEPT as a dormant backup for next year — its backend stays alive and is NOT being retired or migrated now. So for this app's cloud SRS sync, do not port lrsl sync onto roster-server. Recommended: local-only SRS + roster identity + `'trainer'` ledger rows; keeping lrsl cloud-sync temporarily (keyed by roster username) is acceptable as a stopgap if cross-device SRS matters, but treat it as deprecated. Kanji decks: still open — default them to local/anonymous.

## Verification checklist (definition of done for Task 1)

- [ ] Standalone on vercel.app: sign in with a real roster username+PIN → identity shown, survives reload, logout truly clears everything (verify in DevTools storage).
- [ ] Inside the Desk on GH Pages: open Equation Trainer while signed into the Desk → same identity appears with **no re-login**; anonymous Desk user → trainer behaves anonymously.
- [ ] Clear all site data → app fully playable anonymously; no login nag beyond the MORE tab.
- [ ] `grep`-proof: no plaintext credential written to localStorage/sessionStorage anywhere.
- [ ] 10 wrong PINs → friendly lockout message, not a raw error.
- [ ] SW cache version bumped; a hard-refresh-free redeploy propagates (network-first nav).
- [ ] Kanji decks unaffected per the kanji decision.
- [ ] `CONTINUATION_PROMPT.md` updated per repo convention; spec committed; both repos pushed (the teacher tests on public URLs).
