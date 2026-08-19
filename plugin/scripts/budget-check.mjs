#!/usr/bin/env node
/**
 * Orcamento de JS por nivel. Mede o JS efetivamente enviado ao browser em clients/<slug>/dist.
 *
 * Duas contas separadas, por honestidade:
 *   - APLICACAO: arquivos .js/.mjs emitidos + conteudo de <script> inline no HTML.
 *                Comparado contra o teto do nivel.
 *   - TELEMETRIA: o beacon de Web Vitals (rum*.js). Cap proprio, nao entra no teto de design,
 *                 porque nao e escolha estetica e sim instrumentacao da fabrica.
 *
 * Uso: node budget-check.mjs --slug <slug> [--dist <caminho>] [--tier <nivel>]
 * exit 0 dentro dos tetos, exit 2 acima.
 */
import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { tiers, tierOf, logEvent, REPO_ROOT } from './lib.mjs';

const TETO_TELEMETRIA_KB = Number(process.env.LP_TETO_RUM_KB || 1.5);

const args = process.argv.slice(2);
const val = (f) => {
  const i = args.indexOf(f);
  return i === -1 ? null : args[i + 1];
};

const slug = val('--slug');
if (!slug) {
  console.error('uso: budget-check.mjs --slug <slug> [--dist <caminho>] [--tier <nivel>]');
  process.exit(1);
}

const dist = val('--dist') || join(REPO_ROOT, 'clients', slug, 'dist');
const nivel = (val('--tier') || tierOf(slug) || 'basico').toLowerCase();
const conf = tiers()[nivel];

if (!conf) {
  console.error(`nivel desconhecido: ${nivel}`);
  process.exit(1);
}

if (!existsSync(dist)) {
  console.error(`FALHA  orcamento: build ausente em ${dist}. Rode o build antes do gate.`);
  process.exit(2);
}

function varrer(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) varrer(p, acc);
    else acc.push(p);
  }
  return acc;
}

const kb = (buf) => +(gzipSync(buf).length / 1024).toFixed(2);
const ehTelemetria = (p) => /(^|\/)(rum|telemetry|vitals)[\w.-]*\.m?js$/i.test(p.replace(/\\/g, '/'));

let app = 0;
let tele = 0;
const detalhe = [];

for (const f of varrer(dist)) {
  if (/\.m?js$/i.test(f)) {
    const t = kb(readFileSync(f));
    if (ehTelemetria(f)) {
      tele += t;
      detalhe.push({ f: f.replace(dist, ''), kb: t, tipo: 'telemetria' });
    } else {
      app += t;
      detalhe.push({ f: f.replace(dist, ''), kb: t, tipo: 'aplicacao' });
    }
  } else if (/\.html?$/i.test(f)) {
    // <script> inline tambem e JS enviado ao browser: conta.
    const html = readFileSync(f, 'utf8');
    const inline = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
      // O filtro precisa olhar os ATRIBUTOS da tag, nao o conteudo dela:
      // schema em ld+json e dado estruturado, nao JavaScript enviado ao browser.
      .filter(([, attrs]) => !/\bsrc=/i.test(attrs) && !/type=["'](application\/(ld\+json|json)|importmap|speculationrules)["']/i.test(attrs))
      .map(([, , corpo]) => corpo)
      .filter((c) => c.trim())
      .join('\n');
    if (inline.trim()) {
      const t = kb(Buffer.from(inline));
      app += t;
      detalhe.push({ f: f.replace(dist, '') + ' (inline)', kb: t, tipo: 'aplicacao' });
    }
  }
}

app = +app.toFixed(2);
tele = +tele.toFixed(2);
const teto = conf.jsBudgetKb;

logEvent(slug, {
  ev: 'build',
  nivel,
  jsAppKbGzip: app,
  jsTelemetriaKbGzip: tele,
  tetoKb: teto,
});

detalhe.sort((a, b) => b.kb - a.kb);
console.log(`Nivel ${nivel}`);
console.log(`  aplicacao : ${app} KB gzip  (teto ${teto} KB)`);
console.log(`  telemetria: ${tele} KB gzip  (teto ${TETO_TELEMETRIA_KB} KB, fora do orcamento de design)`);
for (const d of detalhe.slice(0, 8)) console.log(`    ${String(d.kb).padStart(6)} KB  [${d.tipo}] ${d.f}`);

let falhou = false;

if (app > teto) {
  console.error(
    `FALHA  orcamento de aplicacao estourado em ${(app - teto).toFixed(2)} KB. ` +
    `Nao ultrapasse o teto para "melhorar" a pagina: reduza o JS ou proponha subir o nivel ao cliente.`
  );
  falhou = true;
}

if (tele > TETO_TELEMETRIA_KB) {
  console.error(
    `FALHA  beacon de telemetria em ${tele} KB, acima do cap de ${TETO_TELEMETRIA_KB} KB. ` +
    `Instrumentacao nao pode virar peso de pagina.`
  );
  falhou = true;
}

if (falhou) process.exit(2);
console.log('OK  dentro dos tetos do nivel.');
process.exit(0);
