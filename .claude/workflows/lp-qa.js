export const meta = {
  name: 'lp-qa',
  description: 'Auditoria paralela da landing page: performance, responsividade, acessibilidade, tracking e anti-slop',
  phases: [
    { title: 'Auditar', detail: 'uma lente independente por dimensao' },
    { title: 'Verificar', detail: 'confirmar cada achado antes de reportar' },
  ],
};

const slug = (args && args.slug) || args;
const nivel = (args && args.nivel) || 'intermediario';

const LENTES = [
  {
    key: 'performance',
    prompt: `Audite a landing page em clients/${slug} sob a lente de PERFORMANCE. Rode o build, meça o JS enviado, identifique o provável elemento LCP, procure bloqueio de renderização, imagem sem dimensão e fonte não subsetada. Nivel do projeto: ${nivel}.`,
  },
  {
    key: 'responsividade',
    prompt: `Audite clients/${slug} sob a lente de RESPONSIVIDADE. Verifique 360px, 768px e 1440px: quebra de layout, overflow horizontal, alvo de toque menor que 44px, texto que estoura container.`,
  },
  {
    key: 'acessibilidade',
    prompt: `Audite clients/${slug} sob a lente de ACESSIBILIDADE. Contraste AA no corpo e no CTA, árvore de headings sem salto, navegação por teclado, foco visível, formulário com label e erro anunciado, prefers-reduced-motion desligando toda animação.`,
  },
  {
    key: 'tracking',
    prompt: `Audite clients/${slug} sob a lente de TRACKING E CONVERSÃO. O formulário envia e confirma? Pixels e eventos disparam? O beacon /rum.js está presente e apontando para o coletor? Links de WhatsApp corretos?`,
  },
  {
    key: 'anti-slop',
    prompt: `Audite clients/${slug} sob a lente ANTI-SLOP, seguindo POLITICA_ANTI_SLOP.md. Foque no que o script não pega: composição genérica, ornamento sem função, iconografia de clichê, motivo gráfico declarado no tokens.json que não aparece na página, e QUALQUER prova social sem origem no brief.md.`,
  },
];

const ACHADOS = {
  type: 'object',
  required: ['achados'],
  properties: {
    achados: {
      type: 'array',
      items: {
        type: 'object',
        required: ['titulo', 'gravidade', 'onde'],
        properties: {
          titulo: { type: 'string' },
          gravidade: { type: 'string', enum: ['critico', 'alto', 'medio', 'baixo'] },
          onde: { type: 'string' },
          evidencia: { type: 'string' },
        },
      },
    },
  },
};

const VEREDITO = {
  type: 'object',
  required: ['real', 'razao'],
  properties: { real: { type: 'boolean' }, razao: { type: 'string' } },
};

const resultados = await pipeline(
  LENTES,
  (l) => agent(l.prompt, { label: `auditar:${l.key}`, phase: 'Auditar', schema: ACHADOS }),
  (r, l) =>
    parallel(
      (r?.achados || []).map((a) => () =>
        agent(
          `Tente REFUTAR este achado sobre clients/${slug}: "${a.titulo}" em ${a.onde}. ` +
          `Evidencia alegada: ${a.evidencia || 'nenhuma'}. Verifique no codigo. Na duvida, refute.`,
          { label: `verificar:${l.key}`, phase: 'Verificar', schema: VEREDITO }
        ).then((v) => ({ ...a, lente: l.key, confirmado: v?.real === true, razao: v?.razao }))
      )
    )
);

const confirmados = resultados
  .flat()
  .filter(Boolean)
  .filter((a) => a.confirmado);

const ordem = { critico: 0, alto: 1, medio: 2, baixo: 3 };
confirmados.sort((a, b) => ordem[a.gravidade] - ordem[b.gravidade]);

log(`${confirmados.length} achado(s) confirmado(s) de ${resultados.flat().filter(Boolean).length} levantado(s).`);

return { slug, nivel, confirmados };
