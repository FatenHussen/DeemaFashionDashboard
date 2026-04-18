/**
 * Restore i18n {{variable}} names from en.json into ar.json (machine translate often breaks them).
 * Run: node scripts/fix-ar-placeholders.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const enPath = join(root, 'src/locales/en.json');
const arPath = join(root, 'src/locales/ar.json');

/** @param {string} s */
function placeholders(s) {
  return [...s.matchAll(/\{\{[^}]+\}\}/g)].map((m) => m[0]);
}

/**
 * @param {unknown} enNode
 * @param {unknown} arNode
 */
function fixNode(enNode, arNode) {
  if (typeof enNode === 'string' && typeof arNode === 'string') {
    const enPh = placeholders(enNode);
    const arPh = placeholders(arNode);
    if (enPh.length > 0 && enPh.length === arPh.length) {
      let r = arNode;
      for (let i = 0; i < enPh.length; i++) {
        r = r.replace(arPh[i], enPh[i]);
      }
      return r;
    }
    return arNode;
  }
  if (
    enNode !== null &&
    typeof enNode === 'object' &&
    !Array.isArray(enNode) &&
    arNode !== null &&
    typeof arNode === 'object' &&
    !Array.isArray(arNode)
  ) {
    /** @type {Record<string, unknown>} */
    const out = { ...arNode };
    for (const k of Object.keys(enNode)) {
      if (k in arNode && k in out) {
        out[k] = fixNode(enNode[k], arNode[k]);
      }
    }
    return out;
  }
  return arNode;
}

const en = JSON.parse(readFileSync(enPath, 'utf8'));
const ar = JSON.parse(readFileSync(arPath, 'utf8'));
const fixed = fixNode(en, ar);
writeFileSync(arPath, `${JSON.stringify(fixed, null, 2)}\n`, 'utf8');
console.log('Fixed placeholders in', arPath);
