#!/usr/bin/env node
/**
 * tokens.json -> src/styles/theme.css (@theme do Tailwind v4).
 * Unica ponte entre a decisao do Ciclo II e o codigo do Ciclo III.
 * Falha ruidosamente se os campos de personalidade estiverem vazios: sem eles o Ciclo II nao fechou.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const raiz = process.cwd();
const src = join(raiz, 'tokens.json');

if (!existsSync(src)) {
  console.error('tokens.json ausente. O Ciclo II precisa entrega-lo antes do build.');
  process.exit(1);
}

const t = JSON.parse(readFileSync(src, 'utf8'));

for (const [a, b] of [['tipografia', 'familia'], ['tipografia', 'razao'], ['cor', 'origem'], ['motivo', 'nome'], ['motivo', 'descricao']]) {
  const v = t?.[a]?.[b];
  if (!v || String(v).trim().length < 3) {
    console.error(`tokens.json: campo obrigatorio ${a}.${b} vazio. Personalidade incompleta bloqueia o build.`);
    process.exit(1);
  }
}

const linhas = [];

/**
 * Um token so vale se for um VALOR CSS. Campos de prosa dentro de espacamento/raio/sombra
 * (justificativas, notas do designer) produziriam declaracoes invalidas que o parser descarta
 * em silencio — pior do que nao existir, porque parecem existir.
 */
const PALAVRA_CSS = /^(FN|-?[\d.]+(px|rem|em|%|vh|vw|ch|fr|s|ms|deg)?|#[0-9a-f]{3,8}|inset|solid|dashed|dotted|none|auto|transparent|currentcolor|0)$/i;

/** Funcao CSS balanceada (um nivel de aninhamento), incluindo clamp/var/calc/color-mix. */
const FUNCAO_CSS = /[a-z-]+\([^()]*(?:\([^()]*\)[^()]*)*\)/gi;

/**
 * Um valor CSS e um conjunto de PALAVRAS que sao todas valores CSS, depois de
 * colapsar cada funcao balanceada em um unico simbolo. Prosa falha porque contem
 * palavra comum, mesmo citando uma medida: "filete de 1px com entalhe" tem
 * "filete", "de", "com", "entalhe". Sem isso, nota de designer virava token
 * invalido silencioso; com uma versao ingenua disso, clamp() legitimo era rejeitado.
 */
const VALOR_CSS = {
  test: (v) => {
    const partes = String(v).trim().replace(FUNCAO_CSS, ' FN ').replace(/,/g, ' ').split(/\s+/).filter(Boolean);
    return partes.length > 0 && partes.length <= 12 && partes.every((p) => PALAVRA_CSS.test(p));
  },
};

const descartados = [];

const emit = (prefixo, obj) => {
  for (const [k, v] of Object.entries(obj || {})) {
    if (v && typeof v === 'object') {
      emit(`${prefixo}-${k}`, v);
    } else if (v != null) {
      const valor = String(v).trim();
      // Sombra e composta e pode ter varias camadas separadas por virgula.
      if (VALOR_CSS.test(valor)) {
        linhas.push(`  ${prefixo}-${k}: ${valor};`);
      } else {
        descartados.push(`${prefixo}-${k}`);
      }
    }
  }
};

emit('--color', t.cor?.escala || {});
emit('--spacing', t.espacamento || {});
emit('--radius', t.raio || {});
emit('--shadow', t.sombra || {});

/**
 * `tipografia.familia` e prosa legivel por humano ("Bodoni Moda (titulos) + Newsreader (texto)").
 * A pilha CSS real vem de `tipografia.pilha`. Emitir a prosa como font-family produzia um token
 * armadilha: valido no CSS, silenciosamente resolvido para o fallback sans no meio de uma pagina serifada.
 */
const pilhas = t.tipografia?.pilha;
if (pilhas && typeof pilhas === 'object') {
  for (const [nome, valor] of Object.entries(pilhas)) {
    linhas.push(`  --font-${nome}: ${valor};`);
  }
} else if (typeof pilhas === 'string') {
  linhas.push(`  --font-marca: ${pilhas};`);
} else if (t.tipografia?.familia && !/[()+]|\bou\b/.test(t.tipografia.familia)) {
  linhas.push(`  --font-marca: ${JSON.stringify(t.tipografia.familia)}, ui-serif, Georgia, serif;`);
} else {
  console.warn(
    'aviso: tokens.json sem `tipografia.pilha`. Nenhum token de fonte emitido — ' +
    'declare a pilha CSS real em tipografia.pilha, ex.: { "titulo": "\'Bodoni Moda\', serif" }.'
  );
}

const css = `/* Gerado por scripts/tokens-to-theme.mjs. Nao edite a mao.
   Tipografia: ${t.tipografia.familia} — ${t.tipografia.razao}
   Cor: ${t.cor.origem}
   Motivo grafico: ${t.motivo.nome} — ${t.motivo.descricao} */
@import "tailwindcss";

@theme {
${linhas.join('\n')}
}
`;

writeFileSync(join(raiz, 'src', 'styles', 'theme.css'), css);
console.log(`theme.css gerado com ${linhas.length} tokens.`);
if (descartados.length) {
  console.warn(
    `aviso: ${descartados.length} campo(s) descartado(s) por nao serem valor CSS ` +
    `(prosa em vez de valor): ${descartados.join(', ')}. Mova a justificativa para um campo de nota.`
  );
}
