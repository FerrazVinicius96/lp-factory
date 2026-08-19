#!/usr/bin/env node
/**
 * Gates inegociaveis. Rodam em PreToolUse.
 *   guard.mjs write   -> bloqueia escrita em segredo
 *   guard.mjs bash    -> bloqueia comando destrutivo e deploy sem gate verde
 * Protocolo: exit 0 libera, exit 2 bloqueia e devolve a mensagem da stderr ao agente.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readHookInput, slugFromPath, tierOf, tiers, logEvent, REPO_ROOT } from './lib.mjs';

const modo = process.argv[2];
const hook = await readHookInput();

function bloquear(msg) {
  console.error(`BLOQUEADO pelo gate da fabrica: ${msg}`);
  process.exit(2);
}

/* ------------------------------------------------------------------ write */
if (modo === 'write') {
  const p = String(hook?.tool_input?.file_path || '');
  if (!p) process.exit(0);

  const alvo = p.replace(/\\/g, '/');
  if (/(^|\/)\.env($|\.)/.test(alvo) || /\/secrets\//.test(alvo) || /\.(pem|key|p12|keystore)$/i.test(alvo)) {
    bloquear(
      `escrita em arquivo de segredo (${alvo}). Variaveis de ambiente entram pelo painel da Railway ou pelo conector, nunca no repositorio.`
    );
  }
  process.exit(0);
}

/* ------------------------------------------------------------------- bash */
if (modo === 'bash') {
  const cmd = String(hook?.tool_input?.command || '');
  if (!cmd) process.exit(0);

  const destrutivo = [
    { re: /\brm\s+-[a-z]*r[a-z]*f\b/i, msg: 'remocao recursiva forcada' },
    { re: /\bgit\s+push\b[^\n]*--force(?!-with-lease)/i, msg: 'git push --force' },
    { re: /\bgit\s+reset\s+--hard\s+origin\//i, msg: 'reset --hard contra o remoto' },
    { re: /\bdrop\s+database\b/i, msg: 'drop database' },
  ];
  for (const d of destrutivo) {
    if (d.re.test(cmd)) bloquear(`${d.msg}. Se for mesmo necessario, peca confirmacao explicita ao operador humano.`);
  }

  // Deploy so passa com gate verde.
  const ehDeploy = /\brailway\s+(up|redeploy)\b/i.test(cmd) || /\bnpm\s+run\s+deploy\b/i.test(cmd);
  if (ehDeploy) {
    const slug =
      slugFromPath(cmd) ||
      (cmd.match(/clients\/([\w-]+)/) || [])[1] ||
      process.env.LP_SLUG;

    if (!slug) {
      bloquear('deploy sem cliente identificado. Rode a partir de clients/<slug> ou defina LP_SLUG.');
    }

    const qa = join(REPO_ROOT, 'clients', slug, 'logs', 'qa.jsonl');
    if (!existsSync(qa)) {
      bloquear(`deploy de "${slug}" sem nenhum registro de gate em logs/qa.jsonl. Rode o tech-lead antes.`);
    }

    const linhas = readFileSync(qa, 'utf8').trim().split('\n').filter(Boolean);
    let ultimo = null;
    try {
      ultimo = JSON.parse(linhas[linhas.length - 1]);
    } catch {
      bloquear(`ultima linha de qa.jsonl de "${slug}" esta corrompida. Rode o gate novamente.`);
    }

    const nivel = tierOf(slug) || 'basico';
    const piso = tiers()[nivel]?.notaMinima ?? 3;

    if (ultimo.veredito !== 'APROVADO') {
      bloquear(`ultimo gate de "${slug}" retornou ${ultimo.veredito || 'sem veredito'}. Producao so recebe deploy com gate verde.`);
    }
    if (Number(ultimo.nota) < piso) {
      bloquear(`nota ${ultimo.nota} abaixo do piso ${piso} do nivel ${nivel}. Corrija e reavalie antes de publicar.`);
    }

    logEvent(slug, { ev: 'deploy', fase: 'autorizado', nota: ultimo.nota, nivel });
  }
  process.exit(0);
}

process.exit(0);
