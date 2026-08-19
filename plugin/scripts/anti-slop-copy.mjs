#!/usr/bin/env node
/**
 * Anti-Slop: lexico e estrutura proibidos na copy.
 * Uso:
 *   node anti-slop-copy.mjs <arquivo...>        (CLI)
 *   ... | node anti-slop-copy.mjs               (hook PostToolUse: le tool_input.file_path da stdin)
 * Saida: exit 0 aprovado, exit 2 reprovado (bloqueia e devolve feedback ao agente).
 */
import { readFileSync, existsSync } from 'node:fs';
import { lexicon, compile, scanText, report, readHookInput, slugFromPath, logEvent, compliance } from './lib.mjs';

const ALVOS = /\.(md|mdx|astro|html)$/i;
const IGNORAR = /(POLITICA_ANTI_SLOP|PROJECT|CLAUDE|README|BACKLOG)\.md$/i;

/** Claim numerica sem fonte declarada. */
const CLAIM = /(\d[\d.,]*\s?(%|mil|milh(o|ao|oes)|clientes|empresas|alunos|projetos|anos|x\b))/iu;
const TEM_FONTE = /data-source|fonte:|\[fonte\]/i;

/**
 * Em HTML/Astro, CSS e JS nao sao copy: `animation-range: entry 10%` nao e alegacao,
 * e `#hex` nao e lexico. Zera esses blocos preservando a numeracao das linhas.
 */
function apenasConteudo(file, texto) {
  if (!/\.(html?|astro|mdx)$/i.test(file)) return texto;
  return texto.replace(
    /<(style|script)\b[^>]*>[\s\S]*?<\/\1>/gi,
    (bloco) => bloco.replace(/[^\n]/g, ' ')
  );
}

function analisar(file, camadas) {
  const texto = apenasConteudo(file, readFileSync(file, 'utf8'));
  const regras = compile(lexicon().copy);
  const achados = scanText(file, texto, regras);

  // Camadas de conformidade do cliente (ex.: OAB para escritorio de advocacia).
  for (const c of camadas) {
    for (const a of scanText(file, texto, compile(c.regras))) {
      achados.push({ ...a, id: a.id, msg: `[${c.nome.toUpperCase()}] ${a.msg}` });
    }
  }

  // Regra de substancia: numero sem origem declarada no brief.
  const linhas = texto.split('\n');
  for (let i = 0; i < linhas.length; i++) {
    const l = linhas[i];
    if (CLAIM.test(l) && !TEM_FONTE.test(l)) {
      achados.push({
        file,
        line: i + 1,
        id: 'claim-sem-fonte',
        msg: 'Afirmacao quantitativa sem data-source apontando para o brief. Sem fonte, nao existe numero.',
        trecho: l.trim().slice(0, 120),
      });
    }
  }
  return achados;
}

const args = process.argv.slice(2);
let arquivos = args.filter((a) => !a.startsWith('-'));

if (arquivos.length === 0) {
  const hook = await readHookInput();
  const p = hook?.tool_input?.file_path;
  if (p) arquivos = [p];
}

arquivos = arquivos.filter((f) => existsSync(f) && ALVOS.test(f) && !IGNORAR.test(f));

if (arquivos.length === 0) process.exit(0);

const slug = slugFromPath(arquivos[0]);
const camadas = compliance(slug);

let todos = [];
for (const f of arquivos) todos = todos.concat(analisar(f, camadas));

if (camadas.length) {
  console.log(`Camadas de conformidade ativas: ${camadas.map((c) => c.nome).join(', ')}`);
}
logEvent(slug, { ev: 'antislop', escopo: 'copy', arquivos: arquivos.length, violacoes: todos.length });

process.exit(report(todos, 'Anti-Slop copy'));
