# Cloud Auth + SRS Sync Spec

## Problem Statement

Student progress (SRS mastery, BKT knowledge state) is trapped in localStorage — per-browser, per-device. A student who practices on a classroom desktop loses all progress when they switch to their phone. The lrsl-driller platform already has a username/password auth system backed by Supabase, and a Railway server with progress sync endpoints.

## Solution Design

Integrate tmux-trainer with the existing lrsl-driller auth infrastructure so students can log in with their Fruit_Animal username and sync SRS data across devices.

### Server: Reuse lrsl-driller Railway server

- **Auth endpoint**: `POST /api/users/verify` — username+password → `{valid, username, real_name}`
- **Sync endpoint**: `POST /api/progress/cartridge-sync` — upserts `user_progress` row with SRS in `modeProgress` JSONB
- **Load endpoint**: `GET /api/progress/cartridge/:username/:cartridgeId` — returns `{found, data: {mode_progress, updated_at}}`
- **CORS**: Already open (all origins allowed)
- **No server changes needed** — the existing endpoints handle everything

### Server URL

The lrsl-driller Railway server URL. This needs to be configurable. We'll use a constant at the top of the script that can be overridden:

```javascript
const SYNC_SERVER = 'https://shared-grading-proxy-production.up.railway.app';
```

Wait — that's the grading proxy, not the main server. Let me check. The main lrsl-driller server is deployed separately. We need the actual Railway URL of the lrsl-driller server.

For now, we'll use a configurable constant. The actual URL will be set when we know the deployment.

### Cartridge ID for Sync

Use `'td-' + activeCartridge.id` (e.g., `'td-ap-stats-formulas'`) to namespace tmux-trainer progress in the shared `user_progress` table.

### Login UI

On the title screen, above the DEPLOY button:

```
┌─────────────────────────────────────┐
│  [Username ___________]             │
│  [Password ___________]             │
│  [LOG IN]  or  [PLAY OFFLINE]       │
│                                     │
│  Logged in as: Mango_Tiger  [LOG OUT]│
└─────────────────────────────────────┘
```

- If already logged in (identity in localStorage), show "Logged in as: X" with logout option
- If not logged in, show login form + "PLAY OFFLINE" option
- Login calls `/api/users/verify`
- On success: store `{username, realName, password}` in `localStorage.userIdentity`
- On failure: show error message inline
- Same `localStorage.userIdentity` key as lrsl-driller (shared identity!)

### HUD Indicator

When logged in, show a small cloud sync indicator:
- `☁ Mango_Tiger` in the HUD (compact, muted color)
- Changes to `☁ Syncing...` during sync
- Changes to `☁ ✓` after successful sync
- Changes to `⚠ Offline` on sync failure

### Cloud SRS Sync

**Push** (after every `saveSRS(true)` — immediate checkpoint saves):
1. If no identity in localStorage, skip
2. `POST /api/progress/cartridge-sync` with:
   - `username`: from identity
   - `cartridgeId`: `'td-' + activeCartridge.id`
   - `modeProgress`: `{ srs: G.srs, highScore: currentHighScore }`
   - `stars`/`totalWeightedScore`: derive from mastery counts
3. On failure: queue for retry (simple flag, retry on next checkpoint)

**Pull** (on login + on title screen load when logged in):
1. `GET /api/progress/cartridge/:username/:cartridgeId`
2. If `found`: merge `data.mode_progress.srs` with local SRS using existing per-card rev+timestamp logic
3. If not found: local SRS is authoritative (first sync will push)

**Merge strategy** (already built):
- Per-card: compare `rev` first, then `lastUpdated`
- Higher rev wins; on tie, higher lastUpdated wins
- This is the same logic already in `saveSRS()` and `continueGame()`

### Offline Behavior

- Login state persists in localStorage (no re-auth needed until logout)
- Game works fully offline
- Sync attempts on checkpoint saves; failures are silent (local save still works)
- Next successful sync pushes latest state

## Implementation Plan

### Login/Auth
1. Add `SYNC_SERVER` constant
2. Add `getIdentity()` / `setIdentity()` / `clearIdentity()` helpers for `localStorage.userIdentity`
3. Add `verifyUser(username, password)` — fetch to `/api/users/verify`
4. Add login form HTML to `showTitleScreen()`
5. Add `handleLogin()` / `handleLogout()` functions
6. Show identity state on title screen (logged in vs login form)

### Cloud Sync
7. Add `syncToCloud()` — push SRS to server
8. Add `pullFromCloud()` — fetch remote SRS, merge with local
9. Call `pullFromCloud()` on login success and on title screen load when logged in
10. Call `syncToCloud()` after every `saveSRS(true)` (immediate saves only, not debounced)
11. Add HUD sync indicator

### CSS
12. Style login form inputs
13. Style sync indicator in HUD

## Blast Radius

### Title Screen
- `showTitleScreen()`: add login form or identity display
- New login/logout handlers

### SRS Persistence
- `saveSRS(true)`: add cloud push after localStorage write
- `loadSRS()`: no change (pull happens at title screen, not during load)

### HUD
- New sync indicator element

### No Impact On
- Game mechanics, scoring, BKT math
- Music editor, step sequencer
- Mobile touch controls
- Offline play (fully preserved)

## Testing Plan
- Parse check passes
- Login form renders on title screen
- Successful login stores identity and shows username
- Failed login shows error message
- Logout clears identity
- Cloud push fires on checkpoint saves when logged in
- Cloud pull merges remote SRS on login
- Offline play works when not logged in
- Sync indicator shows status

## Edge Cases
- Server unreachable: sync silently fails, local save works
- No user_progress row yet: first sync creates it
- User logs in on device B after playing offline on device A: pull merges, newer cards win
- User resets progress: local clear + push empty SRS to cloud
- Multiple tabs: each tab syncs independently; server-side upsert is atomic
