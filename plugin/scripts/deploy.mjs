#!/usr/bin/env node
/**
 * Camada de deploy. Passo executavel unico, do build ate a verificacao pos-publicacao.
 *
 * Uso:
 *   node plugin/scripts/deploy.mjs --slug <slug> [--preview] [--dry-run]
 *
 * Sequencia:
 *   1. confere o gate no log (a mesma regra do hook, verificada aqui tambem: defesa em profundidade)
 *   2. build
 *   3. orcamento de JS
 *   4. publica na Railway
 *   5. verifica a URL publica: status, titulo e presenca do formulario
 *   6. grava logs/deploy.jsonl com url, sha, duracao e tamanho do bundle
 *
 * Qualquer falha interrompe a sequencia e registra o motivo. Nunca publica as cegas.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tiers, tierOf, logEvent, REPO_ROOT } from './lib.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const val = (f) => {
  const i = args.indexOf(f);
  return i === -1 ? null : args[i + 1];
};
const tem = (f) => args.includes(f);

const slug = val('--slug');
const preview = tem('--preview');
const dryRun = tem('--dry-run');
const registrarUrl = val('--registrar');

if (!slug) {
  console.error('uso: deploy.mjs --slug <slug> [--preview] [--dry-run]');
  process.exit(1);
}

const base = join(REPO_ROOT, 'clients', slug);
if (!existsSync(base)) {
  console.error(`cliente "${slug}" nao existe em clients/.`);
  process.exit(1);
}

const nivel = (tierOf(slug) || 'basico').toLowerCase();
const piso = tiers()[nivel]?.notaMinima ?? 3;
const inicio = Date.now();

function abortar(motivo, extra = {}) {
  console.error(`\nFALHA no deploy de "${slug}": ${motivo}`);
  logEvent(slug, { ev: 'deploy', status: 'failed', fase: extra.fase || 'desconhecida', motivo, nivel });
  process.exit(2);
}

function rodar(cmd, argv, cwd) {
  // No Windows, npm/git/railway sao shims .cmd/.bat: sem shell:true o spawnSync
  // nao os localiza e falha com ENOENT (code null), sem log de erro legivel. Mas
  // shell:true so vale para esses shims por nome — para um executavel chamado
  // por caminho absoluto (ex.: process.execPath), o shell reintroduz o problema
  // que resolve: cmd.exe corta o caminho no primeiro espaco ("C:\Program").
  const usarShell = process.platform === 'win32' && !cmd.includes('\\') && !cmd.includes('/');
  const r = spawnSync(cmd, argv, { cwd, encoding: 'utf8', stdio: 'pipe', shell: usarShell });
  return { code: r.status, out: ((r.stdout || '') + (r.stderr || '')).trim() };
}

/* ---------------------------------------------------------- 1. gate verde */
console.log(`Deploy de "${slug}" | nivel ${nivel} | ${preview ? 'preview' : 'PRODUCAO'}`);

const qa = join(base, 'logs', 'qa.jsonl');
if (!existsSync(qa)) abortar('sem registro de gate em logs/qa.jsonl. Rode o tech-lead antes.', { fase: 'gate' });

const linhas = readFileSync(qa, 'utf8').trim().split('\n').filter(Boolean);
let ultimo;
try {
  ultimo = JSON.parse(linhas[linhas.length - 1]);
} catch {
  abortar('ultima linha de qa.jsonl corrompida.', { fase: 'gate' });
}

if (ultimo.veredito !== 'APROVADO') {
  abortar(`ultimo gate retornou ${ultimo.veredito || 'sem veredito'}.`, { fase: 'gate' });
}
if (Number(ultimo.nota) < piso) {
  abortar(`nota ${ultimo.nota} abaixo do piso ${piso} do nivel ${nivel}.`, { fase: 'gate' });
}
console.log(`  gate: APROVADO nota ${ultimo.nota} (piso ${piso})`);

/* -------------------------------------------------------------- 2. build */
const build = rodar('npm', ['run', 'build'], base);
if (build.code !== 0) {
  console.error(build.out.slice(-2000));
  abortar('build quebrado. Devolva ao lp-builder com o log acima; nao tente adivinhar a correcao.', { fase: 'build' });
}
console.log('  build: ok');

/* ---------------------------------------------------------- 3. orcamento */
const orc = rodar(process.execPath, [join(HERE, 'budget-check.mjs'), '--slug', slug]);
console.log(orc.out.split('\n').map((l) => '  ' + l).join('\n'));
if (orc.code !== 0) abortar('orcamento de JS estourado.', { fase: 'orcamento' });

const dist = join(base, 'dist');
let bytes = 0;
(function medir(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    const s = statSync(p);
    s.isDirectory() ? medir(p) : (bytes += s.size);
  }
})(dist);

/* ------------------------------------------------------------ 4. publicar */
const sha = rodar('git', ['rev-parse', '--short', 'HEAD'], REPO_ROOT).out || 'sem-git';

if (dryRun) {
  console.log('\n  --dry-run: tudo verificado, publicacao nao executada.');
  logEvent(slug, { ev: 'deploy', status: 'dry-run', nivel, sha, nota: ultimo.nota });
  process.exit(0);
}

let pub = { out: '' };
if (!registrarUrl) {
  // Preflight, em vez de so ler a mensagem de erro: em locale nao-ingles (ex.: cmd.exe
  // em pt-BR) a mensagem de "comando nao encontrado" nao bate com nenhum regex fixo,
  // e ainda sai com mojibake porque a saida vem em OEM/CP850, nao UTF-8. Testar a
  // disponibilidade antes evita depender de string de erro localizada.
  const sonda = rodar('railway', ['--version'], base);
  if (sonda.code !== 0) {
    console.error(
      '\n  A CLI da Railway nao esta disponivel neste ambiente.\n' +
      '  Publique pelo conector Railway (create-deployment / redeploy) e depois rode:\n' +
      `    node plugin/scripts/deploy.mjs --slug ${slug} --registrar <url>\n`
    );
    logEvent(slug, { ev: 'deploy', status: 'pendente', motivo: 'cli-ausente', nivel, sha });
    process.exit(3);
  }

  const servico = process.env.RAILWAY_SERVICE || slug;
  const railwayArgs = ['up', '--service', servico, '--detach'];
  if (preview) railwayArgs.push('--environment', process.env.RAILWAY_ENV_PREVIEW || 'preview');

  pub = rodar('railway', railwayArgs, base);
  if (pub.code === null || /not found|command not found|ENOENT|is not recognized/i.test(pub.out)) {
    console.error(
      '\n  A CLI da Railway nao esta disponivel neste ambiente.\n' +
      '  Publique pelo conector Railway (create-deployment / redeploy) e depois rode:\n' +
      `    node plugin/scripts/deploy.mjs --slug ${slug} --registrar <url>\n`
    );
    logEvent(slug, { ev: 'deploy', status: 'pendente', motivo: 'cli-ausente', nivel, sha });
    process.exit(3);
  }
  if (pub.code !== 0) {
    console.error(pub.out.slice(-2000));
    abortar('publicacao recusada pela Railway.', { fase: 'publicacao' });
  }
  console.log('  publicacao: enviada');
} else {
  console.log(`  publicacao: pulada (--registrar) — assumindo que ja foi publicada pelo conector Railway`);
}

/* ------------------------------------------------- 5. verificar a URL viva */
const url = registrarUrl ||
  val('--url') ||
  process.env.LP_URL ||
  (pub.out.match(/https?:\/\/[^\s"']+/) || [])[0];

let verificacao = { checado: false };

if (url) {
  try {
    const r = await fetch(url, { redirect: 'follow' });
    const html = await r.text();
    verificacao = {
      checado: true,
      status: r.status,
      temTitulo: /<title>[^<]{5,}<\/title>/i.test(html),
      temForm: /<form|wa\.me|whatsapp/i.test(html),
      temBeacon: /rum\.js/i.test(html),
    };
    console.log(`  verificacao: HTTP ${r.status} | titulo ${verificacao.temTitulo ? 'ok' : 'AUSENTE'} | contato ${verificacao.temForm ? 'ok' : 'AUSENTE'} | beacon ${verificacao.temBeacon ? 'ok' : 'AUSENTE'}`);
    if (r.status !== 200) abortar(`URL publica respondeu ${r.status}.`, { fase: 'verificacao' });
    if (!verificacao.temForm) abortar('pagina publicada sem formulario nem link de contato.', { fase: 'verificacao' });
  } catch (e) {
    abortar(`URL publica inacessivel: ${e.message}`, { fase: 'verificacao' });
  }
} else {
  console.log('  verificacao: URL nao identificada na saida. Passe --url para verificar automaticamente.');
}

/* ----------------------------------------------------------- 6. registrar */
logEvent(slug, {
  ev: 'deploy',
  status: 'ok',
  ambiente: preview ? 'preview' : 'producao',
  nivel,
  nota: ultimo.nota,
  sha,
  url: url || null,
  duracaoMs: Date.now() - inicio,
  bundleKb: +(bytes / 1024).toFixed(1),
  verificacao,
});

console.log(`\nOK  deploy concluido em ${((Date.now() - inicio) / 1000).toFixed(1)}s. Registrado em logs/deploy.jsonl.`);
process.exit(0);
