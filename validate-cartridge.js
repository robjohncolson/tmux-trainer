#!/usr/bin/env node
// Cartridge validator — checks all 12 rules from cartridge-authoring-guide.md
// Usage: node validate-cartridge.js [path-to-cartridge.js]
//        Defaults to ./ap-stats-cartridge.js

const fs = require('fs');
const path = require('path');

const file = process.argv[2] || './ap-stats-cartridge.js';
if (!fs.existsSync(file)) { console.error('File not found:', file); process.exit(1); }

// Shim browser globals
global.window = global;
global.G = { difficulty: 'learn' };

// Load cartridge
eval(fs.readFileSync(file, 'utf8'));

// Find the cartridge object on window
const cartKey = Object.keys(window).find(k => k.endsWith('_CARTRIDGE') && typeof window[k] === 'object' && window[k].commands);
if (!cartKey) { console.error('No *_CARTRIDGE found on window'); process.exit(1); }
const cart = window[cartKey];

let pass = 0, fail = 0, warn = 0;

function ok(msg) { pass++; console.log('  \x1b[32mPASS\x1b[0m', msg); }
function bad(msg) { fail++; console.log('  \x1b[31mFAIL\x1b[0m', msg); }
function wn(msg) { warn++; console.log('  \x1b[33mWARN\x1b[0m', msg); }
function heading(msg) { console.log('\n\x1b[1m' + msg + '\x1b[0m'); }

// ── Extract validateBlank from cartridge ──
const validateBlank = cart.validateBlank ? cart.validateBlank.bind(cart) : null;

// Standalone norm for duplicate-choice detection (mirrors the cartridge norm)
function norm(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, '')
    .replace(/\u03c3/g, 'sigma').replace(/\u03bc/g, 'mu').replace(/\u03b2/g, 'beta').replace(/\u03c7/g, 'chi')
    .replace(/\\hat\{p\}/g, 'phat').replace(/\\bar\{x\}/g, 'xbar')
    .replace(/p\u0302/g, 'phat').replace(/x\u0304/g, 'xbar')
    .replace(/[\\{}_]/g, '');
}

// ══════════════════════════════════════
heading('1. METADATA');
// ══════════════════════════════════════
const metaFields = ['id', 'name', 'description', 'icon', 'inputMode', 'title', 'subtitle', 'startButton', 'instructions'];
for (const f of metaFields) {
  if (cart[f]) ok(f + ': ' + String(cart[f]).slice(0, 50));
  else bad('Missing metadata field: ' + f);
}
if (typeof cart.generateQuestion === 'function') ok('generateQuestion is a function');
else bad('generateQuestion missing or not a function');
if (typeof cart.validateBlank === 'function') ok('validateBlank is a function');
else bad('validateBlank missing or not a function');

// ══════════════════════════════════════
heading('2. COMMANDS (' + cart.commands.length + ' total)');
// ══════════════════════════════════════
const ids = new Set();
const doms = new Set();
const cmdFields = ['id', 'action', 'tier', 'dom', 'hint', 'explain', 'latex'];
const validTiers = new Set(['core', 'regular', 'power', 'support']);
let cmdErrors = 0;

for (const cmd of cart.commands) {
  const errs = [];

  // Required fields
  for (const f of cmdFields) {
    if (!cmd[f]) errs.push('missing ' + f);
  }

  // ID uniqueness
  if (cmd.id) {
    if (ids.has(cmd.id)) errs.push('duplicate id: ' + cmd.id);
    ids.add(cmd.id);
  }

  // Tier
  if (cmd.tier && !validTiers.has(cmd.tier)) errs.push('invalid tier: ' + cmd.tier);

  // Domain tracking
  if (cmd.dom) doms.add(cmd.dom);

  // Subconcepts: exactly 3, each with q/correct/wrong[2]
  if (!Array.isArray(cmd.subconcepts) || cmd.subconcepts.length !== 3) {
    errs.push('subconcepts must be array of exactly 3 (has ' + (cmd.subconcepts ? cmd.subconcepts.length : 0) + ')');
  } else {
    cmd.subconcepts.forEach((sc, i) => {
      if (!sc.q) errs.push('subconcept[' + i + '] missing q');
      if (!sc.correct) errs.push('subconcept[' + i + '] missing correct');
      if (!Array.isArray(sc.wrong) || sc.wrong.length !== 2) errs.push('subconcept[' + i + '] wrong must have exactly 2 entries');
    });
  }

  if (errs.length > 0) { cmdErrors++; bad(cmd.id + ': ' + errs.join(', ')); }
}
if (cmdErrors === 0) ok('All ' + cart.commands.length + ' commands have required fields, unique ids, valid tiers, 3 subconcepts');
else bad(cmdErrors + ' commands have structural errors');

// ══════════════════════════════════════
heading('3. BLANK VALIDATION (' + cart.commands.reduce((n, c) => n + (c.blanks ? c.blanks.length : 0), 0) + ' blanks)');
// ══════════════════════════════════════
let blankPass = 0, blankFail = 0;
for (const cmd of cart.commands) {
  for (const b of (cmd.blanks || [])) {
    if (!b.answer || !b.choices || b.choices.length < 2) {
      bad(cmd.id + ': blank missing answer or choices');
      blankFail++;
      continue;
    }
    if (validateBlank) {
      if (validateBlank(b.answer, b.choices[0])) blankPass++;
      else { bad(cmd.id + ': validateBlank("' + b.answer + '", "' + b.choices[0] + '") = false'); blankFail++; }
    } else {
      if (norm(b.answer) === norm(b.choices[0])) blankPass++;
      else { bad(cmd.id + ': answer "' + b.answer + '" != choices[0] "' + b.choices[0] + '" after norm'); blankFail++; }
    }
  }
}
if (blankFail === 0) ok(blankPass + '/' + blankPass + ' blanks validate');
else bad(blankFail + ' blanks fail validation');

// ══════════════════════════════════════
heading('4. DUPLICATE CHOICES');
// ══════════════════════════════════════
let dupCount = 0;
for (const cmd of cart.commands) {
  for (const b of (cmd.blanks || [])) {
    const normed = b.choices.map(norm);
    const unique = new Set(normed);
    if (unique.size !== normed.length) {
      bad(cmd.id + ': duplicate choices after norm: [' + b.choices.join(', ') + '] -> [' + normed.join(', ') + ']');
      dupCount++;
    }
  }
}
if (dupCount === 0) ok('0 duplicate choices');

// ══════════════════════════════════════
heading('5. VARIABLE_BANK');
// ══════════════════════════════════════
const vb = cart.variableBank || {};
let vbMissing = 0;
for (const cmd of cart.commands) {
  if (!vb[cmd.id] || vb[cmd.id].length === 0) { wn(cmd.id + ': no VARIABLE_BANK entry'); vbMissing++; }
  else {
    for (const v of vb[cmd.id]) {
      if (!v.s || !v.d) { bad(cmd.id + ': variable entry missing s or d'); break; }
    }
  }
}
if (vbMissing === 0) ok('All ' + cart.commands.length + ' commands have VARIABLE_BANK entries');
else wn(vbMissing + ' commands missing VARIABLE_BANK entries');

// ══════════════════════════════════════
heading('6. APPLICATION_BANK');
// ══════════════════════════════════════
const ab = cart.applicationBank || {};
let abMissing = 0, abGiveaway = 0;
for (const cmd of cart.commands) {
  if (!ab[cmd.id] || ab[cmd.id].length === 0) { wn(cmd.id + ': no APPLICATION_BANK entry'); abMissing++; }
  else {
    for (const entry of ab[cmd.id]) {
      if (!entry.scenario) { bad(cmd.id + ': application entry missing scenario'); continue; }
      if (!entry.confusionSet || entry.confusionSet.length < 2) {
        bad(cmd.id + ': confusionSet must have at least 2 entries');
      }
      // Basic giveaway check: does scenario contain the action name?
      const actionWords = cmd.action.replace(/\([^)]*\)/g, '').trim().toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const scenarioLower = entry.scenario.toLowerCase();
      for (const w of actionWords) {
        if (scenarioLower.includes(w) && !['test', 'sample', 'from', 'that', 'this', 'with', 'does', 'when', 'what', 'value', 'data', 'mean'].includes(w)) {
          wn(cmd.id + ': scenario may contain answer keyword "' + w + '"');
          abGiveaway++;
          break;
        }
      }
    }
  }
}
if (abMissing === 0) ok('All ' + cart.commands.length + ' commands have APPLICATION_BANK entries');
else wn(abMissing + ' commands missing APPLICATION_BANK entries');
if (abGiveaway > 0) wn(abGiveaway + ' scenarios may contain answer keywords (check manually)');

// ══════════════════════════════════════
heading('7. RELATIONSHIP_BANK');
// ══════════════════════════════════════
const rb = cart.relationshipBank || {};
let rbCount = 0;
const validDirs = new Set(['increases', 'decreases', 'stays the same']);
for (const [id, entries] of Object.entries(rb)) {
  for (const e of entries) {
    if (!e.input || !e.output || !e.direction || !e.explain) {
      bad(id + ': relationship entry missing field');
    } else if (!validDirs.has(e.direction)) {
      bad(id + ': invalid direction "' + e.direction + '"');
    }
    rbCount++;
  }
}
ok(rbCount + ' relationship entries across ' + Object.keys(rb).length + ' commands');

// ══════════════════════════════════════
heading('8. EXPLANATION_GLOSSARY');
// ══════════════════════════════════════
const glossary = cart.explanationGlossary || [];
let glossaryBad = 0;
for (const entry of glossary) {
  if (!entry.keys || !entry.title || !entry.lines || entry.lines.length !== 3) {
    bad('Glossary entry "' + (entry.title || '?') + '": must have keys, title, and exactly 3 lines');
    glossaryBad++;
  }
}
if (glossaryBad === 0) ok(glossary.length + ' glossary entries, all well-formed');

// ══════════════════════════════════════
heading('9. DOM_LABELS');
// ══════════════════════════════════════
const dl = cart.domLabels || {};
let domMissing = 0;
for (const d of doms) {
  if (!dl[d]) { bad('Domain "' + d + '" used in commands but missing from DOM_LABELS'); domMissing++; }
}
if (domMissing === 0) ok('All ' + doms.size + ' domains have DOM_LABELS entries');

// ══════════════════════════════════════
heading('10. PREREQUISITE DAG');
// ══════════════════════════════════════
const shared = cart.sharedPrereqNodes || {};
const sharedIds = new Set(Object.keys(shared));
let danglingRefs = 0, cycleRisk = 0;

// Check all prereq refs point to existing nodes
for (const [id, node] of Object.entries(shared)) {
  if (!node.q || !node.correct || !Array.isArray(node.wrong)) {
    bad('Shared node "' + id + '": missing q/correct/wrong');
  }
  if (!node.level || node.level < 2 || node.level > 5) {
    bad('Shared node "' + id + '": level must be 2-5 (has ' + node.level + ')');
  }
  for (const pId of (node.prereqs || [])) {
    if (!sharedIds.has(pId)) { bad('Shared node "' + id + '" references missing prereq "' + pId + '"'); danglingRefs++; }
  }
  // Simple self-reference check
  if ((node.prereqs || []).includes(id)) { bad('Shared node "' + id + '" references itself'); cycleRisk++; }
}
if (danglingRefs === 0) ok('0 dangling prereq refs in ' + sharedIds.size + ' shared nodes');
if (cycleRisk === 0) ok('0 self-referencing nodes');

// Check wireL1toL2 exists
if (typeof cart.wireL1toL2 === 'function') ok('wireL1toL2 is a function');
else wn('wireL1toL2 missing — subconcepts won\'t wire to shared nodes');

// Simulate wiring to count unwired subconcepts
if (typeof cart.wireL1toL2 === 'function') {
  const fakeDag = {};
  // Build L1 nodes from subconcepts
  for (const cmd of cart.commands) {
    for (let i = 0; i < (cmd.subconcepts || []).length; i++) {
      const sc = cmd.subconcepts[i];
      const nodeId = cmd.id + '_sc' + i;
      fakeDag[nodeId] = { id: nodeId, level: 1, autoGen: true, prereqs: [], q: sc.q, correct: sc.correct };
    }
  }
  // Add shared nodes
  Object.assign(fakeDag, JSON.parse(JSON.stringify(shared)));
  // Wire
  cart.wireL1toL2(fakeDag);
  const l1Nodes = Object.values(fakeDag).filter(n => n.level === 1 && n.autoGen);
  const unwired = l1Nodes.filter(n => n.prereqs.length === 0);
  if (unwired.length === 0) ok('0/' + l1Nodes.length + ' subconcepts unwired');
  else {
    bad(unwired.length + '/' + l1Nodes.length + ' subconcepts unwired:');
    unwired.slice(0, 10).forEach(n => console.log('       ', n.id, '—', n.q));
    if (unwired.length > 10) console.log('       ...and', unwired.length - 10, 'more');
  }
}

// ══════════════════════════════════════
heading('11. AUTO_BLANK_SPECS');
// ══════════════════════════════════════
const abs = cart.autoBlankSpecs || [];
let absBad = 0;
for (const spec of abs) {
  if (!spec.match && !spec.regex) { bad('AUTO_BLANK_SPEC missing both match and regex'); absBad++; continue; }
  if (!spec.choices || spec.choices.length < 2) { bad('AUTO_BLANK_SPEC missing choices'); absBad++; }
}
if (absBad === 0) ok(abs.length + ' auto-blank specs, all well-formed');

// ══════════════════════════════════════
heading('\nSUMMARY');
// ══════════════════════════════════════
console.log('  Commands: ' + cart.commands.length);
console.log('  Blanks:   ' + cart.commands.reduce((n, c) => n + (c.blanks ? c.blanks.length : 0), 0));
console.log('  Domains:  ' + [...doms].join(', '));
console.log('  Tiers:    ' + [...new Set(cart.commands.map(c => c.tier))].join(', '));
console.log('');
if (fail === 0) {
  console.log('  \x1b[32m' + pass + ' passed, ' + warn + ' warnings, 0 failures\x1b[0m');
} else {
  console.log('  \x1b[31m' + pass + ' passed, ' + warn + ' warnings, ' + fail + ' FAILURES\x1b[0m');
}
process.exit(fail > 0 ? 1 : 0);
