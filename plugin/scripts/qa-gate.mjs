#!/usr/bin/env node
/**
 * Coletor de sinais mensuraveis do gate. O tech-lead le este relatorio e julga o resto.
 * Uso: node qa-gate.mjs --slug <slug> [--nota N] [--veredito APROVADO|DEVOLVIDO]
 *
 * Sem --veredito, apenas coleta e imprime (exit 2 se algum sinal falhou).
 * Com --veredito, grava a decisao em clients/<slug>/logs/qa.jsonl.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tiers, tierOf, logEvent, REPO_ROOT } from './lib.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const val = (f) => {
  const i = args.indexOf(f);
  return i === -1 ? null : args[i + 1];
};

const slug = val('--slug');
if (!slug) {
  console.error('uso: qa-gate.mjs --slug <slug> [--nota N] [--veredito APROVADO|DEVOLVIDO]');
  process.exit(1);
}

const nivel = (val('--tier') || tierOf(slug) || 'basico').toLowerCase();
const conf = tiers()[nivel];
const base = join(REPO_ROOT, 'clients', slug);

function passo(nome, argv) {
  const r = spawnSync(process.execPath, argv, { encoding: 'utf8' });
  const saida = (r.stdout || '') + (r.stderr || '');
  const ok = r.status === 0;
  console.log(`\n=== ${nome} : ${ok ? 'OK' : 'FALHOU'} ===`);
  if (saida.trim()) console.log(saida.trim());
  return { nome, ok, saida: saida.trim().slice(0, 2000) };
}

console.log(`Gate de "${slug}" | nivel ${nivel} | piso de nota ${conf.notaMinima}`);

const resultados = [];

const copyFile = join(base, 'copy.md');
if (existsSync(copyFile)) {
  resultados.push(passo('Anti-Slop copy', [join(HERE, 'anti-slop-copy.mjs'), copyFile]));
} else {
  console.log('\n=== Anti-Slop copy : PULADO (copy.md ausente) ===');
}

resultados.push(passo('Anti-Slop visual', [join(HERE, 'anti-slop-visual.mjs'), '--slug', slug]));

if (existsSync(join(base, 'dist'))) {
  resultados.push(passo('Orcamento de JS', [join(HERE, 'budget-check.mjs'), '--slug', slug]));
} else {
  console.log('\n=== Orcamento de JS : PULADO (dist ausente, rode o build) ===');
}

const falhas = resultados.filter((r) => !r.ok);

console.log('\n---------------------------------------------');
console.log(`Sinais coletados: ${resultados.length} | falhas: ${falhas.length}`);
if (falhas.length) {
  console.log('Falharam: ' + falhas.map((f) => f.nome).join(', '));
  console.log('Nenhuma nota pode ficar acima de 2 enquanto houver falha de Anti-Slop ou de orcamento.');
} else {
  console.log('Todos os sinais mensuraveis passaram. O julgamento qualitativo e do tech-lead.');
}

const veredito = val('--veredito');
if (veredito) {
  const nota = Number(val('--nota') ?? (falhas.length ? 2 : conf.notaMinima));
  logEvent(slug, {
    ev: 'qa',
    nivel,
    nota,
    veredito: veredito.toUpperCase(),
    piso: conf.notaMinima,
    falhas: falhas.map((f) => f.nome),
  });
  console.log(`\nRegistrado em logs/qa.jsonl: ${veredito.toUpperCase()} nota ${nota}.`);
}

process.exit(falhas.length ? 2 : 0);
