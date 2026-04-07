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

const sources = GRADE_SOURCES.map(function(source){ return window[source.key]; }).filter(Boolean);
if(sources.length===0) return;

const allCommands = [];
const allDomLabels = {};
sources.forEach(function(source){
  allCommands.push.apply(allCommands, source.commands || []);
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
  instructions:'All grades use a 4-step chain: glyph → reading → romaji → meaning → recall. Wrong reading answers spawn kana practice drills.',
  instructionsSub:'Grades 1-6 — mixed deck — Select levels on the PLAY tab',
  identifyPrompt:'What is the meaning of this kanji?',
  variablePrompt:'What does <span id="var-symbol" style="display:inline-block"></span> represent in this kanji?',
  applicationPrompt:'Which kanji fits this context?',
  commands:allCommands,
  generateQuestion:sourceWithQuestions && sourceWithQuestions.generateQuestion,
  formatPrompt:sourceWithQuestions && sourceWithQuestions.formatPrompt ? sourceWithQuestions.formatPrompt : function(cmd){ return cmd.latex || cmd.action; },
  formatAnswer:sourceWithQuestions && sourceWithQuestions.formatAnswer ? sourceWithQuestions.formatAnswer : function(cmd){ return cmd.action; },
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
KANJI_JOYO.normalizeExplanationLookup = normalizeExplanationLookup;
KANJI_JOYO.buildExplanationBank = buildExplanationBank;
KANJI_JOYO.wireL1toL2 = wireL1toL2;
// Merge kana→romaji maps from grade sources for chain decomposition
KANJI_JOYO.kanaRomaji = Object.assign.apply(Object, [{}].concat(sources.map(function(s){ return s.kanaRomaji || {}; })));
KANJI_JOYO.digraphRomaji = Object.assign.apply(Object, [{}].concat(sources.map(function(s){ return s.digraphRomaji || {}; })));

window.KANJI_JOYO_CARTRIDGE = KANJI_JOYO;
window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
const existingIndex = window.TD_CARTRIDGES.findIndex(function(cart){
  return cart && cart.id === KANJI_JOYO.id;
});
if(existingIndex >= 0) window.TD_CARTRIDGES[existingIndex] = KANJI_JOYO;
else window.TD_CARTRIDGES.push(KANJI_JOYO);
})();
