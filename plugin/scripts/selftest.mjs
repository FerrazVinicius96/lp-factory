#!/usr/bin/env node
/**
 * Smoke test dos gates. Prova que o que deve reprovar reprova e o que deve passar passa.
 * Uso: node plugin/scripts/selftest.mjs
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const PLUGIN = join(HERE, '..');
const raiz = mkdtempSync(join(tmpdir(), 'lp-selftest-'));
const slug = 'cliente-teste';
const base = join(raiz, 'clients', slug);

mkdirSync(join(base, 'src'), { recursive: true });
mkdirSync(join(base, 'logs'), { recursive: true });
writeFileSync(join(base, 'tier'), 'intermediario');

const env = { ...process.env, LP_FACTORY_ROOT: raiz, CLAUDE_PLUGIN_ROOT: PLUGIN };

let passou = 0;
let falhou = 0;

function checar(nome, esperado, obtido, extra = '') {
  const ok = esperado === obtido;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${nome}  (esperado exit ${esperado}, obtido ${obtido})${extra && !ok ? '\n      ' + extra.split('\n')[0] : ''}`);
  ok ? passou++ : falhou++;
}

function node(argv, stdin) {
  const r = spawnSync(process.execPath, argv, { env, input: stdin ?? '', encoding: 'utf8' });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

/* ---------------------------------------------------- Anti-Slop na copy */
writeFileSync(join(base, 'copy.md'), [
  '# Reduza o tempo de fechamento de contrato',
  '',
  'Advogados de contencao levam 6 horas por peticao. <span data-source="brief:dor-1">6 horas</span>.',
  '',
  'CTA: Agendar diagnostico',
].join('\n'));
let r = node([join(PLUGIN, 'scripts', 'anti-slop-copy.mjs'), join(base, 'copy.md')]);
checar('copy limpa passa', 0, r.code, r.out);

writeFileSync(join(base, 'copy.md'), [
  '# Transforme sua vida com nossa solucao completa',
  '',
  'Uma abordagem revolucionaria. Nao e apenas um servico, e uma experiencia.',
  'Ja atendemos 500 clientes.',
].join('\n'));
r = node([join(PLUGIN, 'scripts', 'anti-slop-copy.mjs'), join(base, 'copy.md')]);
checar('copy com lexico proibido reprova', 2, r.code, r.out);
checar('detecta claim sem fonte', true, /claim-sem-fonte/.test(r.out), r.out);

/* -------------------------------------------------- Anti-Slop no visual */
writeFileSync(join(base, 'tokens.json'), JSON.stringify({
  tipografia: { familia: 'Fraunces', razao: 'serifa com contraste alto para escritorio tradicional' },
  cor: { origem: 'verde do logo do cliente', escala: { base: '#1f3d2b', acento: '#c9a227' } },
  motivo: { nome: 'regua', descricao: 'linha fina dourada que mede secoes', aplicacao: ['hero', 'precos'] },
}, null, 2));
writeFileSync(join(base, 'src', 'ok.astro'), '<section class="bg-base text-acento">conteudo real</section>');
r = node([join(PLUGIN, 'scripts', 'anti-slop-visual.mjs'), '--slug', slug]);
checar('visual com tokens completos passa', 0, r.code, r.out);

writeFileSync(join(base, 'src', 'ruim.astro'), '<section style="background:#6366f1">Lorem ipsum dolor</section>');
r = node([join(PLUGIN, 'scripts', 'anti-slop-visual.mjs'), '--slug', slug]);
checar('roxo generico + placeholder reprovam', 2, r.code, r.out);
checar('detecta cor fora do sistema', true, /cor-fora-do-sistema|ai-purple/.test(r.out), r.out);

writeFileSync(join(base, 'tokens.json'), JSON.stringify({ tipografia: { familia: 'Inter' }, cor: {}, motivo: {} }, null, 2));
r = node([join(PLUGIN, 'scripts', 'anti-slop-visual.mjs'), '--slug', slug]);
checar('tokens sem personalidade reprovam', 2, r.code, r.out);
checar('acusa personalidade incompleta', true, /personalidade-incompleta/.test(r.out), r.out);

/* ----------------------------------------------------- gate de segredos */
r = node([join(PLUGIN, 'scripts', 'guard.mjs'), 'write'],
  JSON.stringify({ tool_name: 'Write', tool_input: { file_path: join(base, '.env') } }));
checar('escrita em .env e bloqueada', 2, r.code, r.out);

r = node([join(PLUGIN, 'scripts', 'guard.mjs'), 'write'],
  JSON.stringify({ tool_name: 'Write', tool_input: { file_path: join(base, 'src', 'index.astro') } }));
checar('escrita em arquivo normal passa', 0, r.code, r.out);

/* -------------------------------------------------------- gate de bash */
r = node([join(PLUGIN, 'scripts', 'guard.mjs'), 'bash'],
  JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'rm -rf ./dist' } }));
checar('rm -rf e bloqueado', 2, r.code, r.out);

r = node([join(PLUGIN, 'scripts', 'guard.mjs'), 'bash'],
  JSON.stringify({ tool_name: 'Bash', tool_input: { command: `railway up --service clients/${slug}` } }));
checar('deploy sem gate e bloqueado', 2, r.code, r.out);

writeFileSync(join(base, 'logs', 'qa.jsonl'),
  JSON.stringify({ ts: new Date().toISOString(), ev: 'qa', nota: 2, veredito: 'DEVOLVIDO' }) + '\n');
r = node([join(PLUGIN, 'scripts', 'guard.mjs'), 'bash'],
  JSON.stringify({ tool_name: 'Bash', tool_input: { command: `railway up --service clients/${slug}` } }));
checar('deploy com gate reprovado e bloqueado', 2, r.code, r.out);

writeFileSync(join(base, 'logs', 'qa.jsonl'),
  JSON.stringify({ ts: new Date().toISOString(), ev: 'qa', nota: 3, veredito: 'APROVADO' }) + '\n');
r = node([join(PLUGIN, 'scripts', 'guard.mjs'), 'bash'],
  JSON.stringify({ tool_name: 'Bash', tool_input: { command: `railway up --service clients/${slug}` } }));
checar('nota 3 abaixo do piso 4 do intermediario e bloqueada', 2, r.code, r.out);

writeFileSync(join(base, 'logs', 'qa.jsonl'),
  JSON.stringify({ ts: new Date().toISOString(), ev: 'qa', nota: 4, veredito: 'APROVADO' }) + '\n');
r = node([join(PLUGIN, 'scripts', 'guard.mjs'), 'bash'],
  JSON.stringify({ tool_name: 'Bash', tool_input: { command: `railway up --service clients/${slug}` } }));
checar('deploy com gate verde e nota no piso passa', 0, r.code, r.out);

/* ----------------------------------------------------- orcamento de JS */
mkdirSync(join(base, 'dist', '_astro'), { recursive: true });
writeFileSync(join(base, 'dist', '_astro', 'pequeno.js'), 'console.log(1);');
r = node([join(PLUGIN, 'scripts', 'budget-check.mjs'), '--slug', slug]);
checar('bundle pequeno passa no intermediario', 0, r.code, r.out);

writeFileSync(join(base, 'dist', '_astro', 'gordo.js'),
  Array.from({ length: 40000 }, (_, i) => `export const v${i} = "${i}-${Math.random()}";`).join('\n'));
r = node([join(PLUGIN, 'scripts', 'budget-check.mjs'), '--slug', slug]);
checar('bundle acima do teto reprova', 2, r.code, r.out);

writeFileSync(join(base, 'tier'), 'basico');
rmSync(join(base, 'dist', '_astro', 'gordo.js'));
r = node([join(PLUGIN, 'scripts', 'budget-check.mjs'), '--slug', slug]);
checar('nivel basico reprova qualquer JS (teto 0 KB)', 2, r.code, r.out);

/* ------------------------------------------------ conformidade OAB */
writeFileSync(join(base, 'compliance'), 'oab');
writeFileSync(join(base, 'copy.md'), [
  '# Advocacia de familia com acompanhamento proximo',
  '',
  'Divorcio, guarda e pensao. Atuacao em direito de familia.',
  '',
  'CTA: Agendar uma conversa',
].join('\n'));
r = node([join(PLUGIN, 'scripts', 'anti-slop-copy.mjs'), join(base, 'copy.md')]);
checar('copy juridica conforme passa', 0, r.code, r.out);
checar('camada oab e ativada', true, /conformidade ativas: oab/i.test(r.out), r.out);

writeFileSync(join(base, 'copy.md'), [
  '# O melhor escritorio de familia da cidade',
  '',
  'Garantimos a guarda do seu filho. Primeira consulta gratis.',
  'Honorarios a partir de R$ 500. Veja nossos casos de sucesso.',
  'Vagas limitadas: chame no whats agora.',
].join('\n'));
r = node([join(PLUGIN, 'scripts', 'anti-slop-copy.mjs'), join(base, 'copy.md')]);
checar('copy juridica irregular reprova', 2, r.code, r.out);
for (const id of ['oab-superlativo', 'oab-promessa-resultado', 'oab-honorarios', 'oab-preco', 'oab-caso-concreto', 'oab-captacao']) {
  checar(`detecta ${id}`, true, new RegExp(id).test(r.out), r.out);
}
rmSync(join(base, 'compliance'));

/* ------------------------------------------------------ camada de deploy */
writeFileSync(join(base, 'logs', 'qa.jsonl'),
  JSON.stringify({ ts: new Date().toISOString(), ev: 'qa', nota: 2, veredito: 'DEVOLVIDO' }) + '\n');
r = node([join(PLUGIN, 'scripts', 'deploy.mjs'), '--slug', slug, '--dry-run']);
checar('deploy.mjs recusa gate reprovado', 2, r.code, r.out);

writeFileSync(join(base, 'logs', 'qa.jsonl'),
  JSON.stringify({ ts: new Date().toISOString(), ev: 'qa', nota: 3, veredito: 'APROVADO' }) + '\n');
writeFileSync(join(base, 'tier'), 'avancado');
r = node([join(PLUGIN, 'scripts', 'deploy.mjs'), '--slug', slug, '--dry-run']);
checar('deploy.mjs recusa nota abaixo do piso do avancado', 2, r.code, r.out);

/* ------------------------------ gerador de tokens: valor CSS x prosa */
{
  const gen = join(HERE, '..', '..', 'templates', 'base', 'scripts', 'tokens-to-theme.mjs');
  const cli = join(raiz, 'cliente-tokens');
  mkdirSync(join(cli, 'src', 'styles'), { recursive: true });
  writeFileSync(join(cli, 'tokens.json'), JSON.stringify({
    tipografia: { familia: 'Bodoni Moda (titulos) + Newsreader (texto)', razao: 'didone para publicacao seria',
                  pilha: { titulo: "'Bodoni Moda', serif", texto: "'Newsreader', serif" } },
    cor: { origem: 'materiais do procedimento', escala: { papel: '#F6F3EC', tinta: '#131A17' } },
    motivo: { nome: 'fio de margem', descricao: 'filete vertical de 1px na margem' },
    espacamento: { base: '8px', secao: 'clamp(5rem, 11vh, 9rem)',
                   nota: 'Escala nao uniforme de proposito: o salto de 2px entre secoes e maior que o resto.' },
    raio: { nenhum: '0', recorte: '0 0 0 14px' },
    sombra: { impressao: '1px 1px 0 var(--color-fio)' },
  }, null, 2));

  const g = spawnSync(process.execPath, [gen], { cwd: cli, encoding: 'utf8' });
  const css = readFileSync(join(cli, 'src', 'styles', 'theme.css'), 'utf8');

  checar('gerador aceita valor simples', true, /--spacing-base:\s*8px;/.test(css), css);
  checar('gerador aceita clamp()', true, /--spacing-secao:\s*clamp\(/.test(css), css);
  checar('gerador aceita sombra composta com var()', true, /--shadow-impressao:\s*1px 1px 0 var\(/.test(css), css);
  checar('gerador aceita raio de quatro valores', true, /--radius-recorte:\s*0 0 0 14px;/.test(css), css);
  checar('gerador emite a pilha de fontes, nao a prosa', true, /--font-titulo:\s*'Bodoni Moda'/.test(css), css);
  checar('gerador descarta prosa que cita medida', false, /--spacing-nota/.test(css), css);
  checar('gerador avisa o descarte em vez de silenciar', true, /descartado/i.test(g.stderr + g.stdout), g.stderr);
}

/* ------------------------------- antirrepeticao entre clientes (registry) */
{
  mkdirSync(join(raiz, 'templates'), { recursive: true });
  writeFileSync(join(raiz, 'templates', 'registry.json'), JSON.stringify({ schema: 1, entregas: [] }));

  const tokensDe = (fam, motivo) => JSON.stringify({
    tipografia: { familia: fam, razao: 'razao qualquer', pilha: { titulo: `'${fam}', serif` } },
    cor: { origem: 'setor', escala: { base: '#111111', acento: '#c9a227' } },
    motivo: { nome: motivo, descricao: 'descricao do motivo' },
  });

  const cliA = join(raiz, 'clients', 'escritorio-a');
  const cliB = join(raiz, 'clients', 'escritorio-b');
  const cliC = join(raiz, 'clients', 'escritorio-c');
  for (const c of [cliA, cliB, cliC]) mkdirSync(c, { recursive: true });
  writeFileSync(join(cliA, 'tokens.json'), tokensDe('Bodoni Moda', 'fio de margem'));
  writeFileSync(join(cliA, 'tier'), 'avancado');
  writeFileSync(join(cliB, 'tokens.json'), tokensDe('Bodoni Moda', 'fio de margem'));
  writeFileSync(join(cliC, 'tokens.json'), tokensDe('Archivo', 'pauta'));

  const R = join(PLUGIN, 'scripts', 'registry.mjs');
  const HERO = 'titulo-esquerda-numeral-margem';

  r = node([R, '--registrar', '--slug', 'escritorio-a', '--nicho', 'advocacia', '--estrutura-hero', HERO]);
  checar('registry registra a primeira entrega', 0, r.code, r.out);

  r = node([R, '--verificar', '--slug', 'escritorio-a', '--nicho', 'advocacia', '--estrutura-hero', HERO]);
  checar('cliente nao colide consigo mesmo', 0, r.code, r.out);

  r = node([R, '--verificar', '--slug', 'escritorio-b', '--nicho', 'advocacia', '--estrutura-hero', HERO]);
  checar('mesma fonte + mesmo hero no mesmo nicho colide', 2, r.code, r.out);

  r = node([R, '--verificar', '--slug', 'escritorio-c', '--nicho', 'advocacia', '--estrutura-hero', 'hero-centralizado-sem-numeral']);
  checar('direcao divergente no mesmo nicho passa', 0, r.code, r.out);

  r = node([R, '--verificar', '--slug', 'escritorio-b', '--nicho', 'clinica', '--estrutura-hero', HERO]);
  checar('mesma assinatura em outro nicho passa', 0, r.code, r.out);

  r = node([R, '--registrar', '--slug', 'escritorio-c', '--nicho', 'advocacia']);
  checar('registrar sem estrutura-hero e recusado', 1, r.code, r.out);
}

/* -------------------------------------------------------------- resumo */
console.log('\n---------------------------------------------');
console.log(`${passou} passaram, ${falhou} falharam.`);
rmSync(raiz, { recursive: true, force: true });
process.exit(falhou ? 1 : 0);
