#!/usr/bin/env node

/**
 * upload-ap-stats-animations.mjs
 *
 * Uploads rendered Manim MP4s for AP Stats formulas to Supabase storage.
 * Also generates and uploads the availability manifest.
 *
 * Usage:
 *   node scripts/upload-ap-stats-animations.mjs
 *   node scripts/upload-ap-stats-animations.mjs --id mean zscore linreg
 *   node scripts/upload-ap-stats-animations.mjs --dry-run
 */

import { readFileSync, existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { parseArgs } from "node:util";

const SCRIPT_DIR = resolve(import.meta.dirname);
const PROJECT_DIR = resolve(SCRIPT_DIR, "..");
const OUTPUT_DIR = join(PROJECT_DIR, "animations", "output");
const BUCKET = "videos";
const CARTRIDGE_PATH = "ap-stats-formulas";

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const { values: args } = parseArgs({
  options: {
    id: { type: "string", multiple: true },
    "dry-run": { type: "boolean", default: false },
  },
  strict: true,
});

// ---------------------------------------------------------------------------
// .env loading — check both tmux-trainer/.env and lrsl-driller/.env
// ---------------------------------------------------------------------------

function loadEnv() {
  const candidates = [
    join(PROJECT_DIR, ".env"),
    resolve(PROJECT_DIR, "..", "not-school", "lrsl-driller", ".env"),
  ];

  for (const envPath of candidates) {
    if (!existsSync(envPath)) continue;
    const lines = readFileSync(envPath, "utf-8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n" +
    "Create a .env file in the project root or ensure lrsl-driller/.env exists."
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Discover rendered MP4s
// ---------------------------------------------------------------------------

function discoverMP4s(filterIds) {
  if (!existsSync(OUTPUT_DIR)) {
    console.error(`Output directory not found: ${OUTPUT_DIR}`);
    process.exit(1);
  }

  const entries = readdirSync(OUTPUT_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .filter(d => !filterIds || filterIds.includes(d.name));

  const found = [];
  for (const dir of entries) {
    const mp4Path = join(OUTPUT_DIR, dir.name, `${dir.name}.mp4`);
    if (existsSync(mp4Path)) {
      found.push({ id: dir.name, path: mp4Path });
    }
  }
  return found;
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

async function uploadFile(id, filePath) {
  const objectPath = `animations/${CARTRIDGE_PATH}/${id}.mp4`;
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${objectPath}`;
  const body = readFileSync(filePath);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "video/mp4",
      "x-upsert": "true",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed for ${id}: ${res.status} ${text}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${objectPath}`;
}

async function uploadManifest(ids) {
  const manifest = { version: 1, animations: ids.sort() };
  const objectPath = `animations/${CARTRIDGE_PATH}/manifest.json`;
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${objectPath}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
      "x-upsert": "true",
    },
    body: JSON.stringify(manifest),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Manifest upload failed: ${res.status} ${text}`);
  }

  // Also save locally
  writeFileSync(
    join(SCRIPT_DIR, "animation-availability.json"),
    JSON.stringify(manifest, null, 2)
  );

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${objectPath}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const filterIds = args.id || null;
  const dryRun = args["dry-run"];

  const mp4s = discoverMP4s(filterIds);

  if (mp4s.length === 0) {
    console.error("No rendered MP4s found in", OUTPUT_DIR);
    console.error("Run generate-animations.py --render first.");
    process.exit(1);
  }

  console.log(`Found ${mp4s.length} MP4(s) to upload:\n`);

  let uploaded = 0;
  let failed = 0;
  const uploadedIds = [];

  for (const { id, path } of mp4s) {
    const sizeKB = (statSync(path).size / 1024).toFixed(0);
    const target = `animations/${CARTRIDGE_PATH}/${id}.mp4`;

    if (dryRun) {
      console.log(`[DRY RUN] ${id} (${sizeKB} KB) -> ${target}`);
      uploadedIds.push(id);
      continue;
    }

    console.log(`Uploading ${id} (${sizeKB} KB) -> ${target}`);
    try {
      const publicUrl = await uploadFile(id, path);
      console.log(`  -> ${publicUrl}\n`);
      uploaded++;
      uploadedIds.push(id);
    } catch (err) {
      console.error(`  !! ${err.message}\n`);
      failed++;
    }
  }

  // Upload availability manifest
  if (uploadedIds.length > 0) {
    console.log(`\nUploading availability manifest (${uploadedIds.length} IDs)...`);
    if (!dryRun) {
      try {
        const manifestUrl = await uploadManifest(uploadedIds);
        console.log(`  -> ${manifestUrl}`);
      } catch (err) {
        console.error(`  !! Manifest: ${err.message}`);
      }
    } else {
      console.log(`[DRY RUN] Would upload manifest with ${uploadedIds.length} IDs`);
    }
  }

  console.log(`\nDone. ${uploaded} uploaded, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main();
