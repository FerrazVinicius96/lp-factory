import { readFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

export const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || join(HERE, '..');
export const REPO_ROOT = process.env.LP_FACTORY_ROOT || process.cwd();

export function loadJSON(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

export function lexicon() {
  return loadJSON(join(PLUGIN_ROOT, 'config', 'anti-slop-lexicon.json'));
}

export function tiers() {
  return loadJSON(join(PLUGIN_ROOT, 'config', 'tiers.json'));
}

/**
 * Camada de conformidade do cliente, quando houver.
 * clients/<slug>/compliance com uma palavra por linha (ex.: "oab") carrega
 * plugin/config/compliance-<nome>.json e soma as regras ao gate de copy.
 */
export function compliance(slug) {
  if (!slug) return [];
  const f = join(REPO_ROOT, 'clients', slug, 'compliance');
  if (!existsSync(f)) return [];
  const nomes = readFileSync(f, 'utf8').split(/\s+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
  const out = [];
  for (const n of nomes) {
    const p = join(PLUGIN_ROOT, 'config', `compliance-${n}.json`);
    if (existsSync(p)) out.push({ nome: n, ...loadJSON(p) });
  }
  return out;
}

/** Baixa a caixa e remove acentos, para as regras nao dependerem de acentuacao. */
export function normalize(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Le o payload JSON de um hook na stdin. Retorna {} quando nao houver. */
export async function readHookInput() {
  if (process.stdin.isTTY) return {};
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  raw = raw.trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** Extrai o slug do cliente de um caminho clients/<slug>/... */
export function slugFromPath(p) {
  if (!p) return null;
  const m = String(p).replace(/\\/g, '/').match(/clients\/([^/]+)\//);
  return m ? m[1] : null;
}

/** Descobre o nivel do cliente: arquivo `tier` ou campo no PROJECT.md dele. */
export function tierOf(slug) {
  if (!slug) return null;
  const f = join(REPO_ROOT, 'clients', slug, 'tier');
  if (existsSync(f)) return readFileSync(f, 'utf8').trim().toLowerCase();
  const pj = join(REPO_ROOT, 'clients', slug, 'PROJECT.md');
  if (existsSync(pj)) {
    const m = readFileSync(pj, 'utf8').match(/n[ií]vel:\s*(basico|intermediario|avancado)/i);
    if (m) return m[1].toLowerCase();
  }
  return null;
}

/** Append determinístico de uma linha de log. Nunca lanca: log jamais quebra o fluxo. */
export function logEvent(slug, obj) {
  try {
    if (!slug) return;
    const dir = join(REPO_ROOT, 'clients', slug, 'logs');
    mkdirSync(dir, { recursive: true });
    const file = join(dir, (obj.ev || 'event') + '.jsonl');
    appendFileSync(file, JSON.stringify({ ts: new Date().toISOString(), ...obj }) + '\n');
  } catch {
    /* silencioso por desenho */
  }
}

/** Compila as regras do lexico em RegExp reutilizaveis. */
export function compile(rules) {
  return rules.map((r) => ({ ...r, rx: new RegExp(r.re, 'iu') }));
}

/**
 * Roda um conjunto de regras compiladas linha a linha.
 * Retorna [{ file, line, id, msg, trecho }]
 */
export function scanText(file, text, rules) {
  const out = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const norm = normalize(lines[i]);
    for (const r of rules) {
      if (r.rx.test(norm)) {
        out.push({ file, line: i + 1, id: r.id, msg: r.msg, trecho: lines[i].trim().slice(0, 120) });
      }
    }
  }
  return out;
}

export function report(findings, titulo) {
  if (findings.length === 0) {
    console.log(`OK  ${titulo}: nenhuma violacao.`);
    return 0;
  }
  console.error(`FALHA  ${titulo}: ${findings.length} violacao(oes).`);
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  [${f.id}] ${f.msg}`);
    console.error(`    > ${f.trecho}`);
  }
  return 2;
}
