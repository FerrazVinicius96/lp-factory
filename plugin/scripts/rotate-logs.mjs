#!/usr/bin/env node
/**
 * Rotacao de logs: remove linhas JSONL com mais de RETENCAO dias.
 * O resumo diario em logs/maintenance/ permanece.
 * Roda em SessionEnd e ao final da manutencao. Nunca falha o fluxo.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from './lib.mjs';

const RETENCAO_DIAS = Number(process.env.LP_LOG_RETENCAO || 30);
const corte = Date.now() - RETENCAO_DIAS * 86400000;

try {
  const raiz = join(REPO_ROOT, 'clients');
  if (!existsSync(raiz)) process.exit(0);

  let removidas = 0;
  for (const slug of readdirSync(raiz)) {
    const dir = join(raiz, slug, 'logs');
    if (!existsSync(dir) || !statSync(dir).isDirectory()) continue;

    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.jsonl')) continue;
      const p = join(dir, f);
      const linhas = readFileSync(p, 'utf8').split('\n').filter(Boolean);
      const mantidas = linhas.filter((l) => {
        try {
          return new Date(JSON.parse(l).ts).getTime() >= corte;
        } catch {
          return true;
        }
      });
      if (mantidas.length !== linhas.length) {
        removidas += linhas.length - mantidas.length;
        writeFileSync(p, mantidas.length ? mantidas.join('\n') + '\n' : '');
      }
    }
  }
  if (removidas) console.log(`rotacao: ${removidas} linha(s) com mais de ${RETENCAO_DIAS} dias removidas.`);
} catch {
  /* rotacao nunca quebra a sessao */
}
process.exit(0);
