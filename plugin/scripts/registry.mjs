#!/usr/bin/env node
/**
 * Registro de assinaturas visuais — a defesa da fabrica contra repetir a si mesma.
 *
 * O slop tambem aparece quando a quarta landing page de um nicho e a primeira de novo.
 * A regra do POLITICA_ANTI_SLOP era prosa; aqui ela vira verificacao.
 *
 * Uso:
 *   node registry.mjs --verificar --slug <slug> --nicho <nicho> [--estrutura-hero <id>]
 *   node registry.mjs --registrar --slug <slug> --nicho <nicho> --estrutura-hero <id> [--direcao "A — ..."]
 *   node registry.mjs --listar [--nicho <nicho>]
 *
 * --verificar sai com codigo 2 quando a proposta colide com as ultimas JANELA entregas do mesmo nicho.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT, logEvent } from './lib.mjs';

const JANELA = Number(process.env.LP_JANELA_ANTIRREPETICAO || 5);
const CAMINHO = join(REPO_ROOT, 'templates', 'registry.json');

const args = process.argv.slice(2);
const val = (f) => {
  const i = args.indexOf(f);
  return i === -1 ? null : args[i + 1];
};
const tem = (f) => args.includes(f);

function carregar() {
  if (!existsSync(CAMINHO)) return { schema: 1, entregas: [] };
  const cru = JSON.parse(readFileSync(CAMINHO, 'utf8'));
  return { schema: cru.schema ?? 1, descricao: cru.descricao, entregas: cru.entregas || [] };
}

/** Extrai a assinatura visual do tokens.json do cliente. */
function assinatura(slug, estruturaHero) {
  const p = join(REPO_ROOT, 'clients', slug, 'tokens.json');
  if (!existsSync(p)) {
    console.error(`tokens.json de "${slug}" ausente. O Ciclo II precisa entrega-lo antes do registro.`);
    process.exit(1);
  }
  const t = JSON.parse(readFileSync(p, 'utf8'));

  const pilha = t.tipografia?.pilha;
  const familias = pilha && typeof pilha === 'object'
    ? Object.values(pilha).map((v) => String(v).split(',')[0].replace(/['"]/g, '').trim())
    : [String(t.tipografia?.familia || '').split('(')[0].trim()];

  const escala = t.cor?.escala || {};
  const cores = Object.values(escala).filter((v) => /^#/.test(String(v)));

  return {
    tipografia: [...new Set(familias)].filter(Boolean),
    paletaBase: cores[0] || null,
    acento: cores[cores.length - 1] || null,
    motivo: t.motivo?.nome || null,
    estruturaHero: estruturaHero || null,
  };
}

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

/** Colisao = mesma familia tipografica principal E mesma estrutura de hero, no mesmo nicho. */
function colisoes(nova, entregas, nicho, slugAtual) {
  // Um cliente nao colide consigo mesmo: reverificar uma entrega ja registrada
  // nao pode reprovar a direcao que ela propria definiu.
  const recentes = entregas
    .filter((e) => norm(e.nicho) === norm(nicho) && e.slug !== slugAtual)
    .slice(-JANELA);
  const achadas = [];

  for (const e of recentes) {
    const motivos = [];
    const tipoNova = norm(nova.tipografia[0]);
    const tipoAntiga = norm((e.assinatura?.tipografia || [])[0]);
    if (tipoNova && tipoNova === tipoAntiga) motivos.push(`mesma familia tipografica principal (${nova.tipografia[0]})`);
    if (nova.estruturaHero && norm(nova.estruturaHero) === norm(e.assinatura?.estruturaHero)) {
      motivos.push(`mesma estrutura de hero (${nova.estruturaHero})`);
    }
    if (nova.motivo && norm(nova.motivo) === norm(e.assinatura?.motivo)) {
      motivos.push(`mesmo motivo grafico (${nova.motivo})`);
    }
    // A regra da politica: familia + estrutura repetidas juntas e colisao.
    if (motivos.length >= 2) achadas.push({ entrega: e, motivos });
  }
  return { achadas, janela: recentes.length };
}

const slug = val('--slug');
const nicho = val('--nicho');
const estruturaHero = val('--estrutura-hero');
const reg = carregar();

if (tem('--listar')) {
  const lista = nicho ? reg.entregas.filter((e) => norm(e.nicho) === norm(nicho)) : reg.entregas;
  if (!lista.length) {
    console.log(nicho ? `Nenhuma entrega registrada no nicho "${nicho}".` : 'Registro vazio.');
    process.exit(0);
  }
  for (const e of lista) {
    const a = e.assinatura || {};
    console.log(`${e.data}  ${e.slug}  [${e.nicho}/${e.nivel}]`);
    console.log(`   ${(a.tipografia || []).join(' + ')} | ${a.paletaBase} -> ${a.acento} | motivo: ${a.motivo} | hero: ${a.estruturaHero}`);
  }
  process.exit(0);
}

if (!slug || !nicho) {
  console.error('uso: registry.mjs --verificar|--registrar --slug <slug> --nicho <nicho> [--estrutura-hero <id>]');
  process.exit(1);
}

const nova = assinatura(slug, estruturaHero);

if (tem('--verificar')) {
  const { achadas, janela } = colisoes(nova, reg.entregas, nicho, slug);
  console.log(`Assinatura proposta para "${slug}" (${nicho}):`);
  console.log(`  tipografia: ${nova.tipografia.join(' + ') || '—'}`);
  console.log(`  paleta    : ${nova.paletaBase} -> ${nova.acento}`);
  console.log(`  motivo    : ${nova.motivo || '—'}`);
  console.log(`  hero      : ${nova.estruturaHero || '(nao informado)'}`);
  console.log(`Comparada com as ultimas ${janela} entrega(s) do nicho.`);

  if (!achadas.length) {
    console.log('OK  nenhuma colisao. A direcao se distingue do que a fabrica ja entregou neste nicho.');
    process.exit(0);
  }

  console.error(`\nFALHA  ${achadas.length} colisao(oes) de assinatura:`);
  for (const c of achadas) {
    console.error(`  contra ${c.entrega.slug} (${c.entrega.data}):`);
    for (const m of c.motivos) console.error(`    - ${m}`);
  }
  console.error('\nA fabrica repetindo a si mesma e slop com outro nome. Proponha outra direcao.');
  process.exit(2);
}

if (tem('--registrar')) {
  if (!estruturaHero) {
    console.error('--registrar exige --estrutura-hero: sem ela a verificacao futura fica cega a metade da regra.');
    process.exit(1);
  }
  const tier = join(REPO_ROOT, 'clients', slug, 'tier');
  const entrada = {
    slug,
    data: new Date().toISOString().slice(0, 10),
    nicho,
    nivel: existsSync(tier) ? readFileSync(tier, 'utf8').trim() : null,
    direcao: val('--direcao') || null,
    assinatura: nova,
  };

  reg.entregas = reg.entregas.filter((e) => e.slug !== slug).concat(entrada);
  writeFileSync(
    CAMINHO,
    JSON.stringify(
      {
        schema: 1,
        descricao:
          'Assinatura visual de cada entrega. O lp-designer consulta antes de propor direcao: ' +
          'repetir familia tipografica, estrutura de hero e motivo no mesmo nicho e colisao. ' +
          `Janela de comparacao: ultimas ${JANELA} entregas do nicho.`,
        entregas: reg.entregas,
      },
      null,
      2
    ) + '\n'
  );

  logEvent(slug, { ev: 'ciclo', fase: 'registro-assinatura', nicho, motivo: nova.motivo });
  console.log(`OK  assinatura de "${slug}" registrada. Registro tem ${reg.entregas.length} entrega(s).`);
  process.exit(0);
}

console.error('informe --verificar, --registrar ou --listar.');
process.exit(1);
