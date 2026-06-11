// Unified Joyo Kanji cartridge assembled from the six grade data exports.
(function(){
const GRADE_SOURCES = [
  {key:'KANJI_G1_DATA', file:'kanji-g1-cartridge-v2.js', dom:'g1'},
  {key:'KANJI_G2_DATA', file:'kanji-g2-cartridge.js', dom:'g2'},
  {key:'KANJI_G3_DATA', file:'kanji-g3-cartridge.js', dom:'g3'},
  {key:'KANJI_G4_DATA', file:'kanji-g4-cartridge.js', dom:'g4'},
  {key:'KANJI_G5_DATA', file:'kanji-g5-cartridge.js', dom:'g5'},
  {key:'KANJI_G6_DATA', file:'kanji-g6-cartridge.js', dom:'g6'},
];

const LEGACY_DECK_DOMAINS = {
  'joyo-kanji-g1':['g1'],
  'joyo-kanji-g2':['g2'],
  'joyo-kanji-g3':['g3'],
  'joyo-kanji-g4':['g4'],
  'joyo-kanji-g5':['g5'],
  'joyo-kanji-g6':['g6'],
};

function ensureGradeDataLoaded(){
  if(typeof require!=='function') return;
  const fs = require('fs');
  const path = require('path');
  const baseDir = typeof __dirname === 'string' ? __dirname : process.cwd();
  GRADE_SOURCES.forEach(function(source){
    if(window[source.key]) return;
    const fullPath = path.resolve(baseDir, source.file);
    if(!fs.existsSync(fullPath)) return;
    eval(fs.readFileSync(fullPath, 'utf8'));
  });
}

function migrateLegacyDeckHash(){
  if(typeof window==='undefined' || !window.location || !window.location.hash) return;
  const match = window.location.hash.match(/(?:^#|&)deck=([^&]+)/);
  if(!match) return;
  const legacyId = decodeURIComponent(match[1]);
  const preset = LEGACY_DECK_DOMAINS[legacyId];
  if(!preset) return;
  window.TD_INITIAL_DOMAIN_FILTER = preset.slice();
  const nextHash = window.location.hash.replace(/deck=[^&]*/, 'deck=joyo-kanji');
  if(nextHash === window.location.hash) return;
  try{
    window.history.replaceState(null, '', window.location.pathname + window.location.search + nextHash);
  }catch(_){
    window.location.hash = nextHash.replace(/^#/, '');
  }
}

function migratePerGradeSRS() {
  const oldKeys = [
    'td-srs-joyo-kanji-g1', 'td-srs-joyo-kanji-g2', 'td-srs-joyo-kanji-g3',
    'td-srs-joyo-kanji-g4', 'td-srs-joyo-kanji-g5', 'td-srs-joyo-kanji-g6'
  ];
  const unifiedKey = 'td-srs-joyo-kanji';
  let unified = {};
  try { unified = JSON.parse(localStorage.getItem(unifiedKey)) || {}; } catch(e) {}

  let migrated = false;
  for (const key of oldKeys) {
    try {
      const old = JSON.parse(localStorage.getItem(key));
      if (!old) continue;
      for (const entry of Object.entries(old)) {
        const cardId = entry[0];
        const card = entry[1];
        if (!unified[cardId] || (card.rev || 0) > (unified[cardId].rev || 0)) {
          unified[cardId] = card;
        }
      }
      localStorage.removeItem(key);
      migrated = true;
    } catch(e) {}
  }
  if (migrated) {
    localStorage.setItem(unifiedKey, JSON.stringify(unified));
  }
}

function fallbackNormalizeExplanationLookup(label){
  return String(label || '').toLowerCase().trim().replace(/\s+/g, '-');
}

ensureGradeDataLoaded();
migrateLegacyDeckHash();
if(typeof localStorage!=='undefined') migratePerGradeSRS();

// ── 12-wave kanji soundtrack (music D6) ────────────────────────────────────
// Voiced toward 陰旋法 (in-scale / miyako-bushi) colors: raw-Hz triads built from
// root+4th+b2 clusters, sus4/sus2 ("min-add9 without the 3rd") voicings, quartal
// stacks and open fifths; pentatonic-leaning bass multipliers (root/m3/4th/5th only);
// sparser hi-hat patterns than the stock soundtrack. Tension arc mirrors the
// default's: calm open → W6 peak (嵐) → cool-down → W12 triumph (旭日).
// Exposed as window.TD_KANJI_MUSIC so the JLPT N5 cartridge can adopt it with a
// single `musicConfigRef:'kanji'` line (resolved by the engine's getWaveConfig
// chain); attached below as KANJI_JOYO.musicConfig for this deck.
const KANJI_MUSIC=[
  {name:'夜明け (Dawn)',                    // W1 — serene A-insen open: Asus4 → Gsus4 → Dm/F → Esus4
    chords:[[220,293.66,329.63],[196,261.63,293.66],[174.61,220,293.66],[164.81,220,246.94]],
    bass:[1,0,0,0,1.5,0,0,0], pad:[.55,0,.25,0,.55,0,.85,0], tempo:78, padVol:.05, bassVol:.60, hihatVol:.08, hihat:[0,0,1,0,0,0,1,0],
    kick:[1,0,0,0,1,0,0,0], snare:[0,0,0,0,0,0,1,0], kickVol:.26, snareVol:.18},
  {name:'竹林 (Bamboo Grove)',              // W2 — sus2 colors: Aadd9(no3) → Gsus2 → Em → F
    chords:[[220,246.94,329.63],[196,220,293.66],[164.81,196,246.94],[174.61,220,261.63]],
    bass:[1,0,1,0,1.335,0,1.5,0], pad:[.55,0,.45,0,.55,0,.85,0], tempo:88, padVol:.05, bassVol:.60, hihatVol:.09, hihat:[1,0,0,0,1,0,0,0],
    kick:[1,0,0,0,1,0,0,0], snare:[0,0,0,0,1,0,0,0], kickVol:.28, snareVol:.20},
  {name:'神社 (Shrine)',                    // W3 — root+b2+4 miyako cluster on E (E F A) → Am → Dm → Esus4
    chords:[[164.81,174.61,220],[220,261.63,329.63],[146.83,174.61,220],[164.81,220,246.94]],
    bass:[1,0,0,1.335,0,0,1.5,0], pad:[.55,0,.25,0,.55,0,.85,0], tempo:82, padVol:.05, bassVol:.60, hihatVol:.08, hihat:[0,0,1,0,0,0,1,0],
    kick:[1,0,0,0,0,0,1,0], snare:[0,0,0,0,1,0,0,0], kickVol:.27, snareVol:.19},
  {name:'桜吹雪 (Sakura Blizzard)',         // W4 — hirajoshi 1-2-b3 cluster (A B C) → G → F → E5
    chords:[[220,246.94,261.63],[196,246.94,293.66],[174.61,220,261.63],[164.81,246.94,329.63]],
    bass:[1,1.5,0,1,1.335,0,1.5,1.189], pad:[.55,.25,.45,0,.55,0,.85,.25], tempo:96, padVol:.05, bassVol:.60, hihatVol:.10, hihat:[1,0,1,0,1,0,0,0],
    kick:[1,0,0,1,1,0,0,0], snare:[0,0,0,0,1,0,0,0], kickVol:.29, snareVol:.22},
  {name:'月見 (Moon Viewing)',              // W5 — Dsus2 → A root+4+b6 (A D F) → C/G → E root+b2+5 shimmer
    chords:[[146.83,164.81,220],[220,293.66,349.23],[196,261.63,329.63],[164.81,174.61,246.94]],
    bass:[1,0,1.189,0,1,0,1.335,0], pad:[.55,0,.45,0,.55,0,.85,0], tempo:84, padVol:.05, bassVol:.60, hihatVol:.08, hihat:[0,0,1,0,0,1,0,0],
    kick:[1,0,0,0,1,0,0,1], snare:[0,0,0,0,0,0,1,0], kickVol:.27, snareVol:.19},
  {name:'嵐 (Storm)',                       // W6 — PEAK: Fsus4 → D b2 cluster w/ tritone (D Eb A) → E+4+b5 grit → Eb
    chords:[[174.61,233.08,261.63],[146.83,155.56,220],[164.81,220,233.08],[155.56,196,233.08]],
    bass:[1,1,1.189,1,1,1.335,1,1.5], pad:[.55,.25,.45,.25,.55,.25,.85,.25], tempo:126, padVol:.05, bassVol:.60, hihatVol:.11, hihat:[1,0,1,1,1,0,1,1],
    kick:[1,0,1,0,1,0,1,0], snare:[0,0,0,0,1,0,0,1], kickVol:.32, snareVol:.27},
  {name:'霧雨 (Drizzle)',                   // W7 — cool-down quartal stacks: Gsus4 → Bb/F → E-A-D → D-G-C
    chords:[[196,261.63,293.66],[174.61,233.08,293.66],[164.81,220,293.66],[146.83,196,261.63]],
    bass:[1,0,0,0,1.335,0,0,0], pad:[.55,0,.25,0,.45,0,.85,0], tempo:80, padVol:.05, bassVol:.60, hihatVol:.07, hihat:[0,0,1,0,0,0,0,0],
    kick:[1,0,0,0,0,0,1,0], snare:[0,0,0,0,1,0,0,0], kickVol:.26, snareVol:.18},
  {name:'祭り (Festival)',                  // W8 — matsuri drive: Asus4 → G-C-G → A 1-2-4 → E5
    chords:[[220,293.66,329.63],[196,261.63,392],[220,246.94,293.66],[164.81,246.94,329.63]],
    bass:[1,1,1.5,1,1.335,1,1.5,1], pad:[.55,.25,.45,.25,.55,.25,.85,.25], tempo:112, padVol:.05, bassVol:.60, hihatVol:.11, hihat:[1,0,1,0,1,0,1,0],
    kick:[1,0,0,1,0,1,0,0], snare:[0,0,1,0,0,0,1,0], kickVol:.31, snareVol:.25},
  {name:'雪舞 (Snow Dance)',                // W9 — soft b6 region: Bb → F/A → Gm → Dm/F
    chords:[[233.08,293.66,349.23],[220,261.63,349.23],[196,233.08,293.66],[174.61,220,293.66]],
    bass:[1,0,0,1,0,0,1.189,0], pad:[.55,0,.45,0,.55,0,.85,0], tempo:86, padVol:.05, bassVol:.60, hihatVol:.08, hihat:[0,0,1,0,0,0,1,0],
    kick:[1,0,0,0,1,0,0,0], snare:[0,0,0,0,0,0,1,0], kickVol:.27, snareVol:.19},
  {name:'紅葉 (Autumn Leaves)',             // W10 — cascading open fifths: Asus2 → G5 → F5 → E5
    chords:[[220,246.94,329.63],[196,293.66,392],[174.61,261.63,349.23],[164.81,246.94,329.63]],
    bass:[1,0,1.5,0,1,0,1.335,1], pad:[.55,.25,.45,0,.55,.25,.85,0], tempo:104, padVol:.05, bassVol:.60, hihatVol:.10, hihat:[1,0,0,0,1,0,1,0],
    kick:[1,0,0,1,0,0,1,0], snare:[0,0,0,0,1,0,0,0], kickVol:.29, snareVol:.23},
  {name:'鶴の舞 (Crane Dance)',             // W11 — brightening into A-ritsu (F# enters): Bsus4 → D/A → Gmaj7(no5) → E-A-E
    chords:[[246.94,329.63,369.99],[220,293.66,369.99],[196,246.94,369.99],[164.81,220,329.63]],
    bass:[1,0,1,0,1.5,0,1.189,0], pad:[.55,0,.45,.25,.55,0,.85,.25], tempo:92, padVol:.05, bassVol:.60, hihatVol:.09, hihat:[0,0,1,0,1,0,0,0],
    kick:[1,0,0,0,1,0,1,0], snare:[0,0,0,1,0,0,1,0], kickVol:.28, snareVol:.21},
  {name:'旭日 (Rising Sun)',                // W12 — TRIUMPH: Asus4 → G → F → A octave-fifth blaze (A E A)
    chords:[[220,293.66,329.63],[196,246.94,293.66],[174.61,220,261.63],[220,329.63,440]],
    bass:[1,1.189,1.335,1.5,1.335,1.189,1,1], pad:[.55,.25,.45,.25,.55,.25,.85,.25], tempo:116, padVol:.05, bassVol:.60, hihatVol:.11, hihat:[1,0,1,0,1,0,1,0],
    kick:[1,0,0,1,1,0,1,0], snare:[0,0,0,0,1,0,1,0], kickVol:.31, snareVol:.26},
];
if(typeof window!=='undefined') window.TD_KANJI_MUSIC = KANJI_MUSIC;

const sources = GRADE_SOURCES.map(function(source){ return window[source.key]; }).filter(Boolean);
if(sources.length===0) return;

const allCommands = [];
const seenIds = new Set();
const allDomLabels = {};
sources.forEach(function(source){
  (source.commands || []).forEach(function(cmd){
    if(seenIds.has(cmd.id)) return;
    seenIds.add(cmd.id);
    allCommands.push(cmd);
  });
  Object.assign(allDomLabels, source.domLabels || {});
});

const legacySources = sources.filter(function(source){
  return typeof source.generateQuestion === 'function' ||
    typeof source.validateBlank === 'function' ||
    source.variableBank ||
    source.applicationBank ||
    source.relationshipBank ||
    (source.explanationGlossary && source.explanationGlossary.length) ||
    (source.sharedPrereqNodes && Object.keys(source.sharedPrereqNodes).length);
});
const sourceWithQuestions = legacySources.find(function(source){
  return typeof source.generateQuestion === 'function';
}) || legacySources[0] || null;
const explanationNormalizer = legacySources.find(function(source){
  return typeof source.normalizeExplanationLookup === 'function';
});
const normalizeExplanationLookup = explanationNormalizer
  ? explanationNormalizer.normalizeExplanationLookup
  : fallbackNormalizeExplanationLookup;
const mergedGlossary = legacySources.reduce(function(all, source){
  return all.concat(source.explanationGlossary || []);
}, []);

function buildExplanationBank(){
  const byId = {};
  const byLabel = {};
  mergedGlossary.forEach(function(entry, index){
    byId[index] = entry;
    (entry.keys || []).forEach(function(key){
      byLabel[normalizeExplanationLookup(key)] = entry;
    });
  });
  return {byId, byLabel};
}

function wireL1toL2(dag){
  legacySources.forEach(function(source){
    if(typeof source.wireL1toL2 === 'function') source.wireL1toL2(dag);
  });
}

const KANJI_JOYO = {
  id:'joyo-kanji',
  name:'Japanese Joyo Kanji',
  description:'All 1,026 elementary school kanji (Grades 1-6)',
  icon:'漢',
  inputMode:'quiz',
  prefixLabel:null,
  title:'にほんご',
  subtitle:'DEFENSE',
  startButton:'出陣',
  instructions:'かんじのよみをえらんでてきをたおせ。',
  instructionsSub:'Grades 1-6 — mixed deck — Select levels on the PLAY tab',
  identifyPrompt:'What is the meaning of this kanji?',
  variablePrompt:'What does <span id="var-symbol" style="display:inline-block"></span> represent in this kanji?',
  applicationPrompt:'Which kanji fits this context?',
  commands:allCommands,
  generateQuestion:sourceWithQuestions && sourceWithQuestions.generateQuestion,
  formatPrompt:sourceWithQuestions && sourceWithQuestions.formatPrompt ? sourceWithQuestions.formatPrompt : function(cmd){ return cmd.latex || cmd.action; },
  formatAnswer:sourceWithQuestions && sourceWithQuestions.formatAnswer ? sourceWithQuestions.formatAnswer : function(cmd){ return cmd.displayLabel || cmd.action; },
  validateBlank:sourceWithQuestions && sourceWithQuestions.validateBlank ? sourceWithQuestions.validateBlank : function(input, answer){ return String(input || '').trim() === String(answer || '').trim(); },
};

KANJI_JOYO.variableBank = Object.assign.apply(Object, [{}].concat(legacySources.map(function(source){
  return source.variableBank || {};
})));
KANJI_JOYO.applicationBank = Object.assign.apply(Object, [{}].concat(legacySources.map(function(source){
  return source.applicationBank || {};
})));
KANJI_JOYO.relationshipBank = Object.assign.apply(Object, [{}].concat(legacySources.map(function(source){
  return source.relationshipBank || {};
})));
KANJI_JOYO.explanationGlossary = mergedGlossary;
KANJI_JOYO.autoBlankSpecs = legacySources.reduce(function(all, source){
  return all.concat(source.autoBlankSpecs || []);
}, []);
KANJI_JOYO.sharedPrereqNodes = Object.assign.apply(Object, [{}].concat(legacySources.map(function(source){
  return source.sharedPrereqNodes || {};
})));
KANJI_JOYO.domLabels = allDomLabels;
KANJI_JOYO.musicConfig = KANJI_MUSIC; // music D6: 12-wave 陰旋法 soundtrack (also window.TD_KANJI_MUSIC for the N5 deck)
KANJI_JOYO.normalizeExplanationLookup = normalizeExplanationLookup;
KANJI_JOYO.buildExplanationBank = buildExplanationBank;
KANJI_JOYO.wireL1toL2 = wireL1toL2;

window.KANJI_JOYO_CARTRIDGE = KANJI_JOYO;
window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
const existingIndex = window.TD_CARTRIDGES.findIndex(function(cart){
  return cart && cart.id === KANJI_JOYO.id;
});
if(existingIndex >= 0) window.TD_CARTRIDGES[existingIndex] = KANJI_JOYO;
else window.TD_CARTRIDGES.push(KANJI_JOYO);
})();
