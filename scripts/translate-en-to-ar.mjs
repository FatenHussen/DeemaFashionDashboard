/**
 * One-off: rebuild src/locales/ar.json from en.json using Google Translate (unofficial API).
 * Run: node scripts/translate-en-to-ar.mjs
 * Requires: npm i -D google-translate-api-x
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import translate from 'google-translate-api-x';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const enPath = join(root, 'src/locales/en.json');
const arPath = join(root, 'src/locales/ar.json');

const CHUNK_SIZE = 32;
const PAUSE_MS = 600;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/** Protect {{name}} so translators do not localize variable keys. */
function shieldPlaceholders(text) {
  const parts = [];
  const out = text.replace(/\{\{[^}]+\}\}/g, (m) => {
    const i = parts.length;
    parts.push(m);
    return `⟦PH${i}⟧`;
  });
  return { out, parts };
}

function unshieldPlaceholders(text, parts) {
  let s = text;
  for (let i = 0; i < parts.length; i++) {
    s = s.split(`⟦PH${i}⟧`).join(parts[i]);
  }
  return s;
}

/** @param {Record<string, unknown>} obj */
function collectStringLeaves(obj, path = []) {
  /** @type {{ path: string[]; value: string }[]} */
  const out = [];
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (typeof v === 'string') {
      out.push({ path: [...path, k], value: v });
    } else if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      out.push(...collectStringLeaves(v, [...path, k]));
    }
  }
  return out;
}

/** @param {{ path: string[]; value: string }[]} leaves @param {string[]} values */
function buildTree(leaves, values) {
  /** @type {Record<string, unknown>} */
  const tree = {};
  for (let i = 0; i < leaves.length; i++) {
    const { path } = leaves[i];
    const val = values[i];
    let cur = tree;
    for (let j = 0; j < path.length - 1; j++) {
      const key = path[j];
      if (!(key in cur) || typeof cur[key] !== 'object' || cur[key] === null) {
        cur[key] = {};
      }
      cur = /** @type {Record<string, unknown>} */ (cur[key]);
    }
    cur[path[path.length - 1]] = val;
  }
  return tree;
}

async function translateChunk(texts) {
  const shielded = texts.map((t) => shieldPlaceholders(t));
  const res = await translate(
    shielded.map((s) => s.out),
    {
      from: 'en',
      to: 'ar',
      forceBatch: true,
    }
  );
  const arr = Array.isArray(res) ? res : [res];
  return arr.map((r, i) => unshieldPlaceholders(r.text, shielded[i].parts));
}

async function main() {
  const en = JSON.parse(readFileSync(enPath, 'utf8'));
  const leaves = collectStringLeaves(en);
  /** @type {string[]} */
  const translated = [];

  console.log(`Strings to translate: ${leaves.length}`);

  for (let i = 0; i < leaves.length; i += CHUNK_SIZE) {
    const end = Math.min(i + CHUNK_SIZE, leaves.length);
    const slice = leaves.slice(i, end);
    const batch = slice.map((l) => l.value);

    process.stderr.write(`\rBatch ${i + 1}–${end} / ${leaves.length}   `);

    try {
      const parts = await translateChunk(batch);
      if (parts.length !== batch.length) {
        throw new Error(`Length mismatch: got ${parts.length}, expected ${batch.length}`);
      }
      translated.push(...parts);
    } catch (e) {
      console.error(`\nChunk failed at ${i}, falling back to single requests:`, e?.message || e);
      for (const text of batch) {
        try {
          const { out, parts } = shieldPlaceholders(text);
          const one = await translate(out, { from: 'en', to: 'ar' });
          translated.push(unshieldPlaceholders(one.text, parts));
        } catch (e2) {
          console.error('Skip / keep English for one key:', e2?.message || e2);
          translated.push(text);
        }
        await delay(250);
      }
    }

    await delay(PAUSE_MS);
  }

  const ar = buildTree(leaves, translated);
  writeFileSync(arPath, `${JSON.stringify(ar, null, 2)}\n`, 'utf8');
  console.log(`\nWrote ${arPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
