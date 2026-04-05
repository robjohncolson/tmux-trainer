# Codex Task: Implement Multi-Cartridge Support

## Context

This is a tower defense educational game (`index.html`) that currently loads a single cartridge (`ap-stats-cartridge.js`) via `window.AP_STATS_CARTRIDGE`. The full design spec is in `multi-cartridge-spec.md`. A dummy test cartridge template is included in that spec.

You are modifying 3 files: `index.html`, `ap-stats-cartridge.js`, and `sw.js`. You are also creating 1 new file: `dummy-cartridge.js`.

## What to do

### 1. `ap-stats-cartridge.js` — Add TD_CARTRIDGES registration (2 lines)

At line 1790, right after the existing `window.AP_STATS_CARTRIDGE=AP_STATS_CARTRIDGE;`, add:

```javascript
window.TD_CARTRIDGES=window.TD_CARTRIDGES||[];
window.TD_CARTRIDGES.push(AP_STATS_CARTRIDGE);
```

Do NOT remove the existing `window.AP_STATS_CARTRIDGE` line.

### 2. `dummy-cartridge.js` — Create test cartridge

Create this file from the template in `multi-cartridge-spec.md` (lines 272-347). It's a minimal 2-command arithmetic cartridge for testing the selector screen. Copy verbatim — it has id `test-basics`, name `Test Basics`, icon `🧪`, and 2 commands (add/sub).

### 3. `index.html` — CSS additions

Add these styles in the `<style>` block (anywhere in the existing CSS section, e.g. near the `.menu-tab` styles):

```css
.cart-grid{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin:20px auto;max-width:500px}
.cart-card{background:rgba(255,140,0,0.08);border:1px solid rgba(255,140,0,0.25);border-radius:8px;padding:16px 20px;cursor:pointer;text-align:center;min-width:140px;flex:1 1 140px;max-width:200px;transition:border-color .15s,background .15s;font-family:inherit;color:inherit}
.cart-card:hover,.cart-card:active{border-color:rgba(255,140,0,0.6);background:rgba(255,140,0,0.15)}
.cart-icon{font-size:32px;margin-bottom:8px}
.cart-name{font-size:14px;font-weight:bold;color:#ff8c00}
.cart-desc{font-size:11px;color:#996622;margin-top:4px}
.cart-hs{font-size:10px;color:#44ff88;margin-top:4px}
```

### 4. `index.html` — New functions (add near `showTitleScreen`, around line 4098)

Add these 3 functions right BEFORE `showTitleScreen`:

```javascript
function loadCartridge(cart){
  activeCartridge=cart;
  COMMANDS=cart.commands;
  Object.keys(PREREQ_DAG).forEach(k=>delete PREREQ_DAG[k]);
  buildDAGFromSubconcepts(COMMANDS);
  Object.assign(PREREQ_DAG,cart.sharedPrereqNodes);
  cart.wireL1toL2(PREREQ_DAG);
  validateDAG();
  EXPLANATION_BANK=cart.buildExplanationBank(COMMANDS);
  G.srs={};
  G.domainFilter=[];
  G.difficulty='learn';
  G._menuTab='play';
  loadSRS();
  if(typeof fetchAnimationManifest==='function')fetchAnimationManifest();
}

function showCartridgeSelector(){
  const cartridges=window.TD_CARTRIDGES||[];
  G.screen='selector';
  const ov=document.getElementById('overlay');
  ov.classList.remove('hidden');
  let html='<div class="title-shell">';
  html+='<h1>FORMULA DEFENSE</h1>';
  html+='<h2 style="color:#996622;font-size:12px;letter-spacing:3px;margin-top:4px">CHOOSE YOUR DECK</h2>';
  html+='<div class="cart-grid">';
  cartridges.forEach(function(cart,i){
    const hsKey='td-highscore-'+cart.id;
    const hs=parseInt(localStorage.getItem(hsKey)||'0',10);
    const cmdCount=cart.commands?cart.commands.length:0;
    html+='<button class="cart-card" onclick="selectCartridge('+i+')">';
    html+='<div class="cart-icon">'+(cart.icon||'\uD83D\uDCE6')+'</div>';
    html+='<div class="cart-name">'+(cart.name||cart.id)+'</div>';
    html+='<div class="cart-desc">'+cmdCount+' formulas</div>';
    if(hs>0)html+='<div class="cart-hs">High: '+hs+'</div>';
    html+='</button>';
  });
  html+='</div></div>';
  ov.innerHTML=html;
}

function selectCartridge(index){
  const cartridges=window.TD_CARTRIDGES||[];
  if(index<0||index>=cartridges.length)return;
  loadCartridge(cartridges[index]);
  showTitleScreen('boot');
}
```

### 5. `index.html` — Replace boot init (lines 5753-5772)

Replace the entire INIT block:

```javascript
// ═══════════════════════════════════════════════
//  INIT — boot
// ═══════════════════════════════════════════════
(function bootInit(){
  var carts=window.TD_CARTRIDGES||[];
  // Backward compat: check legacy single-cartridge global
  if(window.AP_STATS_CARTRIDGE){
    var found=false;
    for(var i=0;i<carts.length;i++){if(carts[i]===window.AP_STATS_CARTRIDGE){found=true;break}}
    if(!found)carts.push(window.AP_STATS_CARTRIDGE);
  }
  window.TD_CARTRIDGES=carts;
  if(carts.length===0){
    var overlay=document.getElementById('overlay');
    if(overlay){
      overlay.classList.remove('hidden');
      overlay.innerHTML='<h1>LOAD ERROR</h1><div class="desc">No cartridge files loaded.</div><div class="sub">Reload once to refresh the cached shell.</div>';
    }
    console.error('[Cartridge] No cartridges found in window.TD_CARTRIDGES');
  }else if(carts.length===1){
    loadCartridge(carts[0]);
    showTitleScreen('boot');
  }else{
    showCartridgeSelector();
  }
})();
```

### 6. `index.html` — Add CHANGE DECK button in MORE tab

In `showTitleScreen()`, in the SETTINGS TAB section (starts at line 4210 with the comment `// ═══ SETTINGS TAB ═══`), add this right before the QR code block (line 4243 `// QR code (MORE tab only)`):

```javascript
    // Change Deck button (only when multiple cartridges)
    if((window.TD_CARTRIDGES||[]).length>1){
      html+='<div class="menu-actions" style="margin-top:10px"><button class="btn btn-secondary" onclick="showCartridgeSelector()">[ CHANGE DECK ]</button></div>';
    }
```

### 7. `index.html` — Add selector keyboard handling

In the keyboard handler, find the title screen shortcut block (line 5145: `if(G.screen==='title'&&!MUSIC_EDITOR.open){`). Add a new block BEFORE it:

```javascript
  // ── Selector screen shortcuts ──
  if(G.screen==='selector'){
    const num=parseInt(e.key,10);
    if(num>=1&&num<=9){
      e.preventDefault();
      selectCartridge(num-1);
    }
    return;
  }
```

### 8. `index.html` — Treat selector like title in animate()

In the animate function, find anywhere `G.screen==='game'` is used to gate gameplay logic. The selector screen should NOT run gameplay. The existing code already returns early for non-game screens in the gameplay section, so just verify that `G.screen==='selector'` falls through to the non-game branch. No change needed if the code already uses `if(G.screen!=='game')return` or similar guards. Just confirm this.

### 9. `sw.js` — Add dummy-cartridge.js to precache (for testing only)

In `sw.js`, add `'./dummy-cartridge.js'` to the `PRECACHE_URLS` array and bump the cache name from `td-shell-v5` to `td-shell-v6`.

Also add `'./dummy-cartridge.js'` to the `<script>` tags in `index.html`, right after the `ap-stats-cartridge.js` tag (line 327), for testing:

```html
<script src="./ap-stats-cartridge.js"></script>
<script src="./dummy-cartridge.js"></script>
```

## What NOT to change

- Do NOT modify any `activeCartridge.*` references throughout the engine — they already work via the variable
- Do NOT change SRS key format — already scoped by `activeCartridge.id`
- Do NOT change cloud sync — already sends `cartridgeId`
- Do NOT change `generateQuestion` or `validateBlank` — they live on the cartridge object
- Do NOT remove `window.AP_STATS_CARTRIDGE` from `ap-stats-cartridge.js`
- Do NOT use `defer` or dynamic `import()` for cartridge scripts
- Do NOT add any npm dependencies

## Verification

After making all changes, verify:

1. `node --check ap-stats-cartridge.js` passes
2. `node --check dummy-cartridge.js` passes
3. Open `index.html` in a browser — with both cartridges loaded, the selector screen should appear showing 2 cards (AP Statistics with 81 formulas, Test Basics with 2 formulas)
4. Selecting AP Stats loads the full game correctly
5. Selecting Test Basics loads a minimal 2-command deck
6. In the MORE tab, a `[ CHANGE DECK ]` button appears and returns to the selector
7. On the selector, pressing `1` selects the first cartridge, `2` the second
8. Remove the `dummy-cartridge.js` script tag — with only 1 cartridge, the game boots directly to the title screen (no selector)
