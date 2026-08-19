#!/usr/bin/env node
/**
 * Acompanha um log JSONL de todos os clientes e emite uma linha legivel por evento novo.
 * Substitui `tail -F clients/*&#47;logs/<nome>.jsonl`, que nao existe no Windows —
 * os monitors precisam funcionar em qualquer maquina onde a fabrica rode.
 *
 * Uso: node tail-logs.mjs <nome-do-log>     ex.: qa, deploy, build
 * Emite uma linha por evento em stdout; o Claude Code entrega cada linha como notificacao.
 */
import { existsSync, readdirSync, statSync, watch, openSync, readSync, closeSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from './lib.mjs';

const nome = process.argv[2] || 'qa';
const raiz = join(REPO_ROOT, 'clients');
const posicoes = new Map();

/** Le o que foi acrescentado desde a ultima leitura, sem carregar o arquivo inteiro. */
function lerNovas(arquivo) {
  let tamanho;
  try {
    tamanho = statSync(arquivo).size;
  } catch {
    return [];
  }

  const anterior = posicoes.get(arquivo) ?? tamanho; // na primeira passagem, so acompanha daqui pra frente
  if (tamanho < anterior) {
    // Arquivo rotacionado ou truncado: recomeca do zero.
    posicoes.set(arquivo, 0);
    return lerNovas(arquivo);
  }
  if (tamanho === anterior) {
    posicoes.set(arquivo, tamanho);
    return [];
  }

  const fd = openSync(arquivo, 'r');
  try {
    const buf = Buffer.alloc(tamanho - anterior);
    readSync(fd, buf, 0, buf.length, anterior);
    posicoes.set(arquivo, tamanho);
    return buf.toString('utf8').split('\n').filter((l) => l.trim());
  } finally {
    closeSync(fd);
  }
}

function resumir(slug, linha) {
  let o;
  try {
    o = JSON.parse(linha);
  } catch {
    return `${slug}: ${linha.slice(0, 160)}`;
  }

  if (o.ev === 'qa') return `${slug}: gate ${o.veredito} nota ${o.nota} (piso ${o.piso}, nivel ${o.nivel})`;
  if (o.ev === 'deploy') {
    return `${slug}: deploy ${o.status}${o.url ? ' -> ' + o.url : ''}${o.motivo ? ' — ' + o.motivo : ''}`;
  }
  if (o.ev === 'build') return `${slug}: build ${o.jsAppKbGzip} KB de JS (teto ${o.tetoKb} KB)`;
  if (o.ev === 'antislop') return `${slug}: anti-slop ${o.escopo} — ${o.violacoes} violacao(oes)`;
  return `${slug}: ${JSON.stringify(o).slice(0, 200)}`;
}

function alvos() {
  if (!existsSync(raiz)) return [];
  return readdirSync(raiz)
    .filter((s) => {
      try {
        return statSync(join(raiz, s)).isDirectory();
      } catch {
        return false;
      }
    })
    .map((s) => ({ slug: s, arquivo: join(raiz, s, 'logs', `${nome}.jsonl`) }))
    .filter((a) => existsSync(a.arquivo));
}

function varrer() {
  for (const { slug, arquivo } of alvos()) {
    for (const linha of lerNovas(arquivo)) console.log(resumir(slug, linha));
  }
}

varrer(); // fixa as posicoes atuais sem despejar historico

// `fs.watch` recursivo cobre Windows e macOS; no Linux o intervalo abaixo garante a cobertura.
if (existsSync(raiz)) {
  try {
    watch(raiz, { recursive: true }, (_e, arquivo) => {
      if (arquivo && String(arquivo).includes(`${nome}.jsonl`)) varrer();
    });
  } catch {
    /* sem watch recursivo: o intervalo abaixo assume */
  }
}

setInterval(varrer, 2000);
