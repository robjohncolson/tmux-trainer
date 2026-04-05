# Codex Spec: Multi-Cartridge Support

## Overview

The game currently hardcodes a single cartridge (`window.AP_STATS_CARTRIDGE`). Add support for multiple cartridges with a selection screen before the title/play tabs. Each cartridge is a separate `.js` file following the pattern in `cartridge-authoring-guide.md`.

## Current State (single cartridge)

### Loading (index.html line 327)
```html
<script src="./ap-stats-cartridge.js"></script>
```

### Boot init (index.html lines 5756-5772)
```javascript
activeCartridge = window.AP_STATS_CARTRIDGE;
if (!activeCartridge) { /* error screen */ }
else {
  COMMANDS = activeCartridge.commands;
  buildDAGFromSubconcepts(COMMANDS);
  Object.assign(PREREQ_DAG, activeCartridge.sharedPrereqNodes);
  activeCartridge.wireL1toL2(PREREQ_DAG);
  validateDAG();
  EXPLANATION_BANK = activeCartridge.buildExplanationBank(COMMANDS);
  showTitleScreen('boot');
}
```

### Engine references
- `activeCartridge` (line 1779): module-level variable, read everywhere
- `COMMANDS` (line 1780): flat array of commands from active cartridge
- `PREREQ_DAG` (line 1784): built at boot from active cartridge
- `EXPLANATION_BANK` (line 1783): built at boot from active cartridge
- All SRS/highscore/run-state keys use `activeCartridge.id` as suffix — already scoped
- Cloud sync posts `cartridgeId` — already scoped
- Title screen reads `activeCartridge.title`, `.subtitle`, `.instructions`, `.domLabels`, etc.

## Design

### Cartridge Registration

Each cartridge file pushes itself onto a shared array:

```javascript
// In each cartridge file (e.g., ap-stats-cartridge.js)
window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
window.TD_CARTRIDGES.push(AP_STATS_CARTRIDGE);
```

The existing `window.AP_STATS_CARTRIDGE = ...` line stays for backward compatibility. Both registration paths work.

### Script Tags

All cartridge scripts load statically (blocking, not defer):

```html
<script src="./ap-stats-cartridge.js"></script>
<!-- Future cartridges added here -->
<!-- <script src="./algebra2-cartridge.js"></script> -->
<script>
// ... inline engine ...
```

### Boot Flow Change

Replace the current single-cartridge boot (lines 5756-5772) with:

```
1. Collect cartridges: window.TD_CARTRIDGES || []
2. Also check window.AP_STATS_CARTRIDGE for backward compat (push if not already in array)
3. If 0 cartridges → error screen (same as current)
4. If 1 cartridge → skip selector, go straight to loadCartridge() + showTitleScreen()
5. If 2+ cartridges → showCartridgeSelector()
```

### New function: `loadCartridge(cart)`

Extract the current boot init into a reusable function:

```javascript
function loadCartridge(cart) {
  // Reset previous cartridge state
  activeCartridge = cart;
  COMMANDS = cart.commands;

  // Rebuild DAG from scratch (clear previous)
  Object.keys(PREREQ_DAG).forEach(k => delete PREREQ_DAG[k]);
  buildDAGFromSubconcepts(COMMANDS);
  Object.assign(PREREQ_DAG, cart.sharedPrereqNodes);
  cart.wireL1toL2(PREREQ_DAG);
  validateDAG();

  // Rebuild explanation bank
  EXPLANATION_BANK = cart.buildExplanationBank(COMMANDS);

  // Reset game state for new cartridge
  G.srs = {};
  G.domainFilter = [];
  G.difficulty = 'learn';
  G._menuTab = 'play';

  // Load SRS from localStorage for this cartridge
  loadSRS();

  // Fetch animation manifest for this cartridge (if applicable)
  if (typeof fetchAnimationManifest === 'function') fetchAnimationManifest();
}
```

### New function: `showCartridgeSelector()`

A simple screen showing available cartridges as cards. Renders into `#overlay`.

```javascript
function showCartridgeSelector() {
  const cartridges = window.TD_CARTRIDGES || [];
  G.screen = 'selector';
  const ov = document.getElementById('overlay');
  ov.classList.remove('hidden');

  let html = '<div class="title-shell">';
  html += '<h1>FORMULA DEFENSE</h1>';
  html += '<h2>CHOOSE YOUR DECK</h2>';
  html += '<div class="cart-grid">';

  cartridges.forEach((cart, i) => {
    const hsKey = 'td-highscore-' + cart.id;
    const hs = parseInt(localStorage.getItem(hsKey) || '0', 10);
    const cmdCount = cart.commands ? cart.commands.length : 0;

    html += '<button class="cart-card" onclick="selectCartridge(' + i + ')">';
    html += '<div class="cart-icon">' + (cart.icon || '📦') + '</div>';
    html += '<div class="cart-name">' + (cart.name || cart.id) + '</div>';
    html += '<div class="cart-desc">' + cmdCount + ' formulas</div>';
    if (hs > 0) html += '<div class="cart-hs">High: ' + hs + '</div>';
    html += '</button>';
  });

  html += '</div></div>';
  ov.innerHTML = html;
}

function selectCartridge(index) {
  const cartridges = window.TD_CARTRIDGES || [];
  if (index < 0 || index >= cartridges.length) return;
  loadCartridge(cartridges[index]);
  showTitleScreen('boot');
}
```

### CSS for selector

Add minimal styles for the cartridge grid. Keep it consistent with existing title screen aesthetics (amber theme, dark background).

```css
.cart-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin: 20px auto;
  max-width: 500px;
}
.cart-card {
  background: rgba(255,140,0,0.08);
  border: 1px solid rgba(255,140,0,0.25);
  border-radius: 8px;
  padding: 16px 20px;
  cursor: pointer;
  text-align: center;
  min-width: 140px;
  flex: 1 1 140px;
  max-width: 200px;
  transition: border-color 0.15s, background 0.15s;
}
.cart-card:hover, .cart-card:active {
  border-color: rgba(255,140,0,0.6);
  background: rgba(255,140,0,0.15);
}
.cart-icon { font-size: 32px; margin-bottom: 8px; }
.cart-name { font-size: 14px; font-weight: bold; color: #ff8c00; }
.cart-desc { font-size: 11px; color: #996622; margin-top: 4px; }
.cart-hs { font-size: 10px; color: #44ff88; margin-top: 4px; }
```

### "Back to Decks" from title screen

Add a way to return to the cartridge selector from the title screen (only when 2+ cartridges are loaded):

- In the MORE tab, add a `[ CHANGE DECK ]` button that calls `showCartridgeSelector()`
- The button only renders when `(window.TD_CARTRIDGES || []).length > 1`

### Screen state

Add `'selector'` as a valid `G.screen` value. The animate loop, keyboard handler, and pause logic should treat it like `'title'` (no gameplay, no BGM).

### Keyboard shortcut on selector

Number keys 1-9 select cartridge by index. Enter/Space selects if only one is highlighted.

## Changes to ap-stats-cartridge.js

Add one line at the end, before `})();`:

```javascript
// Multi-cartridge registration
window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
window.TD_CARTRIDGES.push(AP_STATS_CARTRIDGE);
```

The existing `window.AP_STATS_CARTRIDGE = AP_STATS_CARTRIDGE;` line stays for backward compatibility.

## Changes to sw.js

No changes needed now. When a new cartridge file is added, it must be added to `PRECACHE_URLS` and `CACHE_SHELL` bumped. Document this in the authoring guide.

## Changes to index.html

### CSS section
- Add `.cart-grid`, `.cart-card`, `.cart-icon`, `.cart-name`, `.cart-desc`, `.cart-hs` styles

### Script section

1. **New functions** (near existing screen functions):
   - `loadCartridge(cart)` — extracted from boot init
   - `showCartridgeSelector()` — renders card grid
   - `selectCartridge(index)` — loads + shows title

2. **Modified boot init** (lines 5756-5772):
   - Collect from `window.TD_CARTRIDGES` + backward compat check for `window.AP_STATS_CARTRIDGE`
   - 0 cartridges → error
   - 1 cartridge → `loadCartridge(cart); showTitleScreen('boot');`
   - 2+ cartridges → `showCartridgeSelector()`

3. **Modified `showTitleScreen()`** (MORE tab):
   - Add `[ CHANGE DECK ]` button when multiple cartridges available
   - `onclick="showCartridgeSelector()"`

4. **Modified keyboard handler**:
   - When `G.screen === 'selector'`: number keys 1-9 call `selectCartridge(n-1)`

5. **Modified animate()**:
   - `G.screen === 'selector'` treated same as `'title'` (no gameplay tick)

## What NOT to change

- Do NOT modify `activeCartridge` references throughout the engine — they already work via the variable
- Do NOT change SRS key format — already scoped by `activeCartridge.id`
- Do NOT change cloud sync — already sends `cartridgeId`
- Do NOT change `generateQuestion` — lives on the cartridge object
- Do NOT change `validateBlank` — lives on the cartridge object
- Do NOT remove `window.AP_STATS_CARTRIDGE` — keep for backward compat
- Do NOT lazy-load cartridge scripts (complicates SW offline)

## Validation checklist

1. With only `ap-stats-cartridge.js` loaded (1 cartridge): boots straight to title screen, no selector shown
2. With a second dummy cartridge: selector screen appears, both cards show icon/name/formula count
3. Selecting AP Stats loads correctly — all 81 commands, DAG validates, title screen works
4. `[ CHANGE DECK ]` in MORE tab returns to selector
5. Number key 1 on selector screen selects first cartridge
6. SRS data is independent between cartridges (different localStorage keys)
7. Returning to selector and picking a different cartridge re-inits DAG/explanation bank
8. Offline: both cartridge files cached by SW, selector works in airplane mode
9. `G.screen === 'selector'` does not run gameplay loop
10. Single-cartridge deployments see zero UI change (no selector, no CHANGE DECK button)

## Template for testing: dummy-cartridge.js

For testing multi-cartridge, create a minimal dummy cartridge:

```javascript
(function(){
const DUMMY = {
  id: 'test-basics',
  name: 'Test Basics',
  description: 'Minimal cartridge for testing multi-cartridge support',
  icon: '🧪',
  inputMode: 'quiz',
  prefixLabel: null,
  title: 'TEST',
  subtitle: 'BASICS',
  startButton: 'GO',
  instructions: 'Test deck with 2 commands.',
  instructionsSub: '',
  commands: [
    {id:'add',action:'Addition',tier:'core',dom:'arithmetic',hint:'a+b',explain:'Combine two numbers',
      latex:'a + b = c',
      blanks:[{latex:'a + \\boxed{\\,?\\,} = c',answer:'b',choices:['b','a','c']}],
      subconcepts:[
        {q:'What does + mean?',correct:'Combine quantities',wrong:['Subtract','Multiply']},
        {q:'Is addition commutative?',correct:'Yes, a+b = b+a',wrong:['No','Only for negatives']},
        {q:'What is the identity element?',correct:'Zero (a+0=a)',wrong:['One','Negative a']}
      ]},
    {id:'sub',action:'Subtraction',tier:'core',dom:'arithmetic',hint:'a-b',explain:'Find the difference',
      latex:'a - b = c',
      blanks:[{latex:'a - \\boxed{\\,?\\,} = c',answer:'b',choices:['b','a','c']}],
      subconcepts:[
        {q:'What does - mean?',correct:'Remove a quantity',wrong:['Add','Multiply']},
        {q:'Is subtraction commutative?',correct:'No, a-b ≠ b-a usually',wrong:['Yes','Only for zero']},
        {q:'What is a-a?',correct:'Zero',wrong:['One','Undefined']}
      ]}
  ],
  generateQuestion(cmd, allCommands){
    const options = allCommands.map(c=>c.action);
    while(options.length<4)options.push('Unknown');
    const ci = options.indexOf(cmd.action);
    return{type:'identify',latex:cmd.latex,options,correctIdx:ci,correctKey:['a','b','c','d'][ci]};
  },
  formatPrompt(cmd){return cmd.action},
  formatAnswer(cmd){return cmd.latex?'(formula)':cmd.action},
  validateBlank(input,answer){return input.trim().toLowerCase()===answer.trim().toLowerCase()},
};

// Banks (minimal)
const VARIABLE_BANK = {
  'add':[{s:'a',d:'first number'},{s:'b',d:'second number'}],
  'sub':[{s:'a',d:'starting value'},{s:'b',d:'amount subtracted'}]
};
const APPLICATION_BANK = {
  'add':[{scenario:'Combining the count of two groups.',confusionSet:['sub']}],
  'sub':[{scenario:'Finding how many more in one group than another.',confusionSet:['add']}]
};
const RELATIONSHIP_BANK = {};
const EXPLANATION_GLOSSARY = [];
const AUTO_BLANK_SPECS = [];
const DOM_LABELS = {'arithmetic':['Arithmetic Basics']};
const SHARED_PREREQ_NODES = {};
function wireL1toL2(){}

DUMMY.variableBank=VARIABLE_BANK;
DUMMY.applicationBank=APPLICATION_BANK;
DUMMY.relationshipBank=RELATIONSHIP_BANK;
DUMMY.explanationGlossary=EXPLANATION_GLOSSARY;
DUMMY.autoBlankSpecs=AUTO_BLANK_SPECS;
DUMMY.domLabels=DOM_LABELS;
DUMMY.sharedPrereqNodes=SHARED_PREREQ_NODES;
DUMMY.normalizeExplanationLookup=function(s){return s.toLowerCase().trim()};
DUMMY.buildExplanationBank=function(){return{byId:{},byLabel:{}}};
DUMMY.wireL1toL2=wireL1toL2;

// Register
window.TD_CARTRIDGES=window.TD_CARTRIDGES||[];
window.TD_CARTRIDGES.push(DUMMY);
window.DUMMY_CARTRIDGE=DUMMY;
})();
```

This file is for development testing only. Do not deploy it. Add `<script src="./dummy-cartridge.js"></script>` after the AP Stats script tag to test multi-cartridge.
