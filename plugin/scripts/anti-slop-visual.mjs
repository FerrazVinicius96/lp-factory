#!/usr/bin/env node
/**
 * Anti-Slop visual: cor fora do sistema, ornamento sem funcao, placeholder e prova social inventada.
 * Uso:
 *   node anti-slop-visual.mjs <arquivo...>
 *   node anti-slop-visual.mjs --slug <slug>     (varre clients/<slug>/src e proto)
 *   ... | node anti-slop-visual.mjs             (hook)
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import {
  lexicon, compile, scanText, report, readHookInput,
  slugFromPath, logEvent, REPO_ROOT,
} from './lib.mjs';

const ALVOS = /\.(astro|html|css|jsx|tsx|svelte|vue)$/i;
const HEX = /#[0-9a-f]{3,8}\b/gi;
/** Hex tolerados fora do tema: neutros absolutos e transparencia. */
const HEX_OK = /^#(fff|ffffff|000|000000|transparent)$/i;

function listar(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e === 'dist' || e.startsWith('.')) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) listar(p, acc);
    else if (ALVOS.test(p)) acc.push(p);
  }
  return acc;
}

/** Cores declaradas no tokens.json do cliente sao as unicas permitidas no markup. */
function coresPermitidas(slug) {
  const p = join(REPO_ROOT, 'clients', slug || '', 'tokens.json');
  if (!slug || !existsSync(p)) return null;
  const cru = readFileSync(p, 'utf8');
  return new Set((cru.match(HEX) || []).map((h) => h.toLowerCase()));
}

function tokensCompletos(slug) {
  const p = join(REPO_ROOT, 'clients', slug || '', 'tokens.json');
  if (!slug || !existsSync(p)) return [];
  let t;
  try {
    t = JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    return [{ file: p, line: 1, id: 'tokens-invalido', msg: 'tokens.json nao e JSON valido.', trecho: '' }];
  }
  const faltas = [];
  const exigido = [
    ['tipografia', 'familia'], ['tipografia', 'razao'],
    ['cor', 'origem'],
    ['motivo', 'nome'], ['motivo', 'descricao'],
  ];
  for (const [a, b] of exigido) {
    const v = t?.[a]?.[b];
    if (!v || String(v).trim().length < 3) {
      faltas.push({
        file: p, line: 1, id: 'personalidade-incompleta',
        msg: `Campo obrigatorio de personalidade ausente ou vazio: ${a}.${b}. Sem os tres campos justificados, o Ciclo II nao fecha.`,
        trecho: `${a}.${b}`,
      });
    }
  }
  return faltas;
}

/**
 * Uma linha que DEFINE uma custom property (`--nome: #hex`) e a propria camada de tokens:
 * e ali que a cor deve nascer. O que a regra persegue e cor no PONTO DE USO —
 * style inline, ou valor literal em propriedade de pintura dentro de um seletor comum.
 */
const DEFINE_TOKEN = /^\s*--[\w-]+\s*:/;

function analisar(file, permitidas) {
  const texto = readFileSync(file, 'utf8');
  const achados = scanText(file, texto, compile(lexicon().visual));

  const linhas = texto.split('\n');
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    const hexes = linha.match(HEX) || [];
    if (!hexes.length) continue;

    const ehDefinicao = DEFINE_TOKEN.test(linha);

    for (const h of hexes) {
      const hx = h.toLowerCase();
      if (HEX_OK.test(hx)) continue;

      if (ehDefinicao) {
        // Deriva do sistema: so acusa quando o token nao consta do tokens.json do cliente.
        if (permitidas && permitidas.size && !permitidas.has(hx)) {
          achados.push({
            file, line: i + 1, id: 'token-nao-declarado',
            msg: 'Cor definida no CSS mas ausente do tokens.json. O sistema e o tokens.json; o CSS so o reflete.',
            trecho: linha.trim().slice(0, 120),
          });
        }
        continue;
      }

      if (permitidas && permitidas.has(hx)) continue;

      achados.push({
        file, line: i + 1, id: 'cor-fora-do-sistema',
        msg: 'Hex no ponto de uso. Cor nasce no tokens.json e chega aqui por variavel, nunca literal.',
        trecho: linha.trim().slice(0, 120),
      });
    }
  }
  return achados;
}

let args = process.argv.slice(2);
let slug = null;
const iSlug = args.indexOf('--slug');
if (iSlug !== -1) {
  slug = args[iSlug + 1];
  args = args.slice(0, iSlug);
}

let arquivos = args.filter((a) => !a.startsWith('-'));

if (arquivos.length === 0 && slug) {
  arquivos = [
    ...listar(join(REPO_ROOT, 'clients', slug, 'src')),
    ...listar(join(REPO_ROOT, 'clients', slug, 'proto')),
  ];
}

if (arquivos.length === 0 && !slug) {
  const hook = await readHookInput();
  const p = hook?.tool_input?.file_path;
  if (p) arquivos = [p];
}

arquivos = arquivos.filter((f) => existsSync(f) && ALVOS.test(f));
slug = slug || slugFromPath(arquivos[0]);

const permitidas = coresPermitidas(slug);
let todos = slug ? tokensCompletos(slug) : [];
for (const f of arquivos) todos = todos.concat(analisar(f, permitidas));

if (arquivos.length === 0 && todos.length === 0) process.exit(0);

logEvent(slug, { ev: 'antislop', escopo: 'visual', arquivos: arquivos.length, violacoes: todos.length });
process.exit(report(todos, 'Anti-Slop visual'));
