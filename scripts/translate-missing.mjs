import { readFileSync, writeFileSync } from 'node:fs';
import translate from 'google-translate-api-x';

const enPath = 'src/locales/en.json';
const arPath = 'src/locales/ar.json';
const en = JSON.parse(readFileSync(enPath, 'utf8'));
const ar = JSON.parse(readFileSync(arPath, 'utf8'));

function collectLeaves(obj, path = []) {
  const out = [];
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (typeof v === 'string') out.push({ path: [...path, k], value: v });
    else if (v !== null && typeof v === 'object' && !Array.isArray(v)) out.push(...collectLeaves(v, [...path, k]));
  }
  return out;
}

function getDeep(obj, pathArr) {
  let cur = obj;
  for (const p of pathArr) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function setDeep(obj, pathArr, value) {
  let cur = obj;
  for (let i = 0; i < pathArr.length - 1; i++) {
    const p = pathArr[i];
    if (typeof cur[p] !== 'object' || cur[p] === null) cur[p] = {};
    cur = cur[p];
  }
  cur[pathArr[pathArr.length - 1]] = value;
}

function shield(text) {
  const parts = [];
  const out = text.replace(/\{\{[^}]+\}\}/g, (m) => { const i = parts.length; parts.push(m); return `⟦PH${i}⟧`; });
  return { out, parts };
}
function unshield(text, parts) {
  let s = text;
  for (let i = 0; i < parts.length; i++) s = s.split(`⟦PH${i}⟧`).join(parts[i]);
  return s;
}

const leaves = collectLeaves(en);
const toTranslate = [];
for (const leaf of leaves) {
  const existingAr = getDeep(ar, leaf.path);
  // Only translate if ar is missing or identical to en (placeholder we added)
  if (existingAr === undefined || existingAr === null || existingAr === '' || existingAr === leaf.value) {
    toTranslate.push(leaf);
  }
}
console.log('Keys needing translation:', toTranslate.length);

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const CHUNK = 32;

for (let i = 0; i < toTranslate.length; i += CHUNK) {
  const batch = toTranslate.slice(i, i + CHUNK);
  const texts = batch.map((b) => b.value);
  const shielded = texts.map((t) => shield(t));
  process.stderr.write(`\r[${i + batch.length}/${toTranslate.length}] `);
  try {
    const res = await translate(shielded.map((s) => s.out), { from: 'en', to: 'ar', forceBatch: true });
    const arr = Array.isArray(res) ? res : [res];
    for (let j = 0; j < arr.length; j++) {
      const arText = unshield(arr[j].text, shielded[j].parts);
      setDeep(ar, batch[j].path, arText);
    }
  } catch (e) {
    console.error('\nBatch failed, single-retry:', e.message);
    for (let j = 0; j < batch.length; j++) {
      try {
        const { out, parts } = shield(batch[j].value);
        const one = await translate(out, { from: 'en', to: 'ar' });
        setDeep(ar, batch[j].path, unshield(one.text, parts));
      } catch (e2) {
        console.error('Skip:', batch[j].path.join('.'));
      }
      await delay(250);
    }
  }
  await delay(500);
}

writeFileSync(arPath, JSON.stringify(ar, null, 2) + '\n', 'utf8');
console.log('\nDone. Wrote', arPath);
