# PROJECT — Q&F Queiroz e Ferraz

> **Marca fictícia declarada.** Piloto técnico da fábrica. Nenhum dado real de escritório, advogado,
> inscrição na OAB ou cliente foi usado nem inventado como se fosse verdadeiro.

## 1. Escopo

**Nível: avancado**

Landing page única de captação informativa para escritório de advocacia de família, com foco em
**divórcio e dissolução de união estável**. Objetivo único: agendamento de uma conversa inicial.

Público em estado de incerteza, não de comparação de fornecedores. Dor central: não saber o que vem
pela frente. Objeção principal: medo de que procurar um advogado transforme um acordo possível em
uma disputa.

Camada de conformidade `oab` ativa (`clients/qf-queiroz-ferraz/compliance`), somada ao gate de copy.
Sem prova social, sem número e sem promessa, o único diferencial legítimo é **ser a página que
explica o processo** — que é também o que o Provimento 205/2021 favorece.

Publicação em URL pública de demonstração: a página é marcada como piloto (`noindex, nofollow`,
faixa de aviso no topo, formulário que não transmite dados).

## 2. Requisitos Funcionais

| # | Requisito | Estado |
|---|---|---|
| RF1 | 11 seções na ordem do `copy.md`, texto verbatim, 3 passes de copy | Entregue |
| RF2 | Direção visual A ("editorial sóbria"), motivo gráfico "fio de margem" em ≥ 3 seções | Entregue (7 aplicações) |
| RF3 | Tema claro/escuro com tokens semânticos, AA nos dois temas | Entregue |
| RF4 | Peça interativa: orientador de próximos passos, 3 perguntas, 4 saídas genéricas | Entregue |
| RF5 | Orçamento de JS de aplicação ≤ 60 KB gzip | Entregue (0,71 KB de ilha) |
| RF6 | SEO avançado: FAQPage + LegalService schema, canonical, OG, árvore de headings | Entregue |
| RF7 | Motion scroll-linked em CSS, dentro de `@supports`, com `prefers-reduced-motion` | Entregue |
| RF8 | Beacon de Web Vitals dentro do cap de 1,5 KB | Entregue (0,77 KB) |
| RF9 | Marcação de demonstração: `noindex`, faixa no topo, formulário sem destino | Entregue |
| RF10 | Alvo de toque ≥ 44px em todo controle (WCAG 2.5.8) | Entregue |

## 3. Fora de Escopo (cortes negociados)

| Corte | Motivo |
|---|---|
| Seção de depoimentos, avaliações e casos de sucesso | Vedada/controversa sob o Provimento 205/2021 e sem material no brief |
| Qualquer número, contagem ou estatística | Sem origem no brief não existe número; a regra de substância do gate reprova |
| Estimativa de prazo, valor ou honorário | Vedada; prazo dependeria de comarca e complexidade — seria promessa disfarçada |
| Fotografia de pessoa, logotipo, mapa e endereço | Ativos não entregues pelo cliente; viram pendência, nunca ficção |
| Vídeo e WebGL, permitidos no nível avançado | Nada no brief justifica; o LCP é tipográfico e o assunto é sensível |
| Páginas próprias das áreas conexas | Fora do escopo desta entrega; os temas ficam sem link e a falta é declarada na página |
| Sitemap | Contradiz `noindex, nofollow` de uma marca fictícia |
| Persistência do tema no navegador | Exigiria script de head e armazenamento local em página de tema sensível; o padrão segue o sistema |

## 4. Composição do Time de Subagents

| Nome | Escopo | Model | permissionMode | isolation | Justificativa |
|---|---|---|---|---|---|
| `lp-strategist` | Ciclo I: briefing, dor, copy, wireframe | opus | padrão | — | Copy sob restrição regulatória é o ponto de maior risco de julgamento da entrega |
| `lp-designer` | Ciclo II: direção visual, tokens, tema, mídia | opus | padrão | — | Direções divergentes em paralelo são a defesa estrutural contra a média |
| `lp-builder` | Ciclo III: implementação Astro 7 + Tailwind v4 | sonnet | padrão | worktree | Trabalho de execução com especificação fechada; worktree isola o build do repositório |
| `tech-lead` | Gate: matriz 0–5 e Anti-Slop qualitativo | opus | padrão (só leitura + Bash) | — | Julgamento, não execução; sem Write/Edit para não corrigir o que deveria devolver |
| `perf-a11y-auditor` | Auditoria dedicada de performance e a11y | sonnet | padrão (só leitura + Bash) | — | Exigido pelo nível avançado; roda em paralelo ao `tech-lead` para não herdar o viés dele |
| `lp-deployer` | Build, publicação na Railway, registro | sonnet | padrão (só leitura + Bash) | — | Sem Write: o deploy não é lugar de corrigir código |
| `lp-maintainer` | Rotina das 23h, delta de logs e telemetria | sonnet | padrão | worktree | Roda sozinho e agendado; worktree impede que a manutenção pise na entrega em curso |

Separação reforçada tecnicamente por `tools`/`disallowedTools` no frontmatter de cada agente, não
apenas por instrução em prosa: `tech-lead`, `perf-a11y-auditor` e `lp-deployer` não têm `Write`/`Edit`.

## 5. Decisões de Arquitetura

| Decisão | Motivo | Alternativa descartada |
|---|---|---|
| Camada semântica em `semantica.css` com `light-dark()` + `color-scheme` | O tema inteiro custa zero JS, zero flash e nenhuma cor redeclarada: o botão só troca `color-scheme` | Duas listas de cores em `@media (prefers-color-scheme)` + `[data-tema]`, como no protótipo — duplicava toda a paleta |
| Conteúdo no frontmatter de `index.astro`, não em módulo de dados | O gate de copy varre `.astro`; texto em `.ts` sairia do alcance do gate | `src/data/conteudo.ts` |
| Orientador com as 4 saídas já no HTML; o JS só decide o que mostrar | Funciona sem JS, o gate de copy enxerga o texto e a ilha custa centenas de bytes | Renderizar as saídas por JS a partir de um objeto de strings |
| Mensagem de pendência **dentro** da região `role="status"` | Fora dela, a 1ª e a 2ª resposta esvaziavam a região viva e nada era anunciado | Região viva contendo só o resultado final |
| `role`/`aria-live` aplicados por JS após a primeira pintura | Impede que o ajuste de estado inicial vire um anúncio na carga da página | Atributos estáticos no HTML |
| Faixa de demonstração no fluxo, não `position: fixed` | Em 320–768px ela tem 68–106px de altura e cobria cabeçalho e skip link (WCAG 2.4.11) | Manter fixa e remendar `--altura-faixa` com media queries |
| `inlineStylesheets: 'always'` + uma única requisição de fonte | `'auto'` não inlinava nada (25,7 KB brutos) e havia 3 recursos bloqueando renderização | Duas folhas de fonte, uma delas só com o peso do hero |
| Sublinhado de `.elo` por `text-decoration`, não `border-bottom` | Com a caixa esticada até 44px de alvo, a borda descolava do texto | `border-bottom` + `padding-block` |
| `.opcao:has(input:focus)` em vez de `:focus-visible` | O foco volta por JS ao limpar respostas; após clique de ponteiro `:focus-visible` não casa e o anel sumia | `:focus-visible` apenas |
| Formulário sem `action` e com submit `disabled` | Garantia estrutural de não envio, inclusive por Enter, sem uma linha de JS | `preventDefault()` no submit |
| `LegalService` só com campo existente | Sem endereço, telefone ou inscrição no brief, inventar dado estruturado é fabricação | Schema "completo" com dados de exemplo |

## 6. Histórico de Ciclos

### Ciclo I — estratégia e copy (`lp-strategist`)
`brief.md` e `copy.md` com 3 passes. 11 seções, 3 variantes de headline (A informativa como padrão,
C pelo receio como teste). Nenhuma afirmação quantitativa na página, por decisão de origem.

### Ciclo II — direção visual (`lp-designer`)
Três direções divergentes em paralelo. Aprovada a **direção A, "editorial sóbria"**: Bodoni Moda +
Newsreader, paleta derivada dos materiais físicos do procedimento (papel de certidão, tinta
ferrogálica, verde de encadernação), motivo gráfico **"fio de margem"**. `tokens.json` da direção A
promovido a `tokens.json` do cliente; direções B e C arquivadas em `proto-descartado/`.

### Ciclo III — implementação, 1ª rodada (`lp-builder`)
`index.astro` + 10 componentes, camada semântica, ilha do orientador, SEO avançado.
Três gates de script verdes. **Gate do nível avançado: DEVOLVIDO, nota 4 (piso 5).**
`tech-lead` e `perf-a11y-auditor` convergiram no mesmo defeito principal. Direção A preservada:
todos os defeitos eram de implementação.

Defeitos apontados: (P0) faixa fixa de 106px sobre 52px reservados, cobrindo cabeçalho e skip link;
`aria-live` anunciando vazio nas duas primeiras respostas; alvos de toque de 41/36,2/28,9px;
foco invisível ao limpar respostas e `tabindex` inalcançável; CSS bloqueante sem crítico inline;
pesos de fonte baixados e nunca usados. (P1) sitemap de URL `noindex`; numerais das perguntas sem a
animação de entrada do protótipo; áreas conexas sem link e sem declarar a decisão; `PROJECT.md` ausente.

### Ciclo III — implementação, 2ª rodada (`lp-builder`)
Correções de 1 a 10. A fábrica corrigiu em paralelo três defeitos que eram dela e não da entrega:
`tokens-to-theme.mjs` passou a emitir a pilha CSS real a partir de `tipografia.pilha`
(`--font-titulo`, `--font-texto`), eliminando o token-armadilha `--font-marca`; e a razão de
contraste declarada em `tokens.json` foi corrigida para 5,20:1; e `budget-check.mjs` passou a ler o
atributo `type` da tag em vez do conteúdo do script, deixando de contar JSON-LD como JavaScript
(a conta caiu de 1,67 para 0,71 KB sem que nada tenha mudado na página).

Verificação em navegador (Chromium, 320/360/390/768/1280px): faixa `static`, nunca cobrindo o
cabeçalho; skip link é o 1º foco, visível em `top: 0` e não obstruído; menor alvo de toque 44px;
sem overflow horizontal. JS de aplicação: 0,71 KB gzip.

## 7. Pendências e Riscos Ativos

### Pendências do cliente — bloqueiam a publicação como página real
- [ ] Nome completo dos sócios e número de inscrição na OAB — **obrigatório** no rodapé
- [ ] Nome empresarial e inscrição da sociedade na OAB
- [ ] Fotografias reais dos advogados e do escritório
- [ ] Cidade e endereço de atendimento
- [ ] Canal de contato oficial (telefone, e-mail, mensageria institucional)
- [ ] Logotipo em vetor (sem ele não há imagem OG: o card é `summary`)
- [ ] Política de Privacidade
- [ ] Endpoint de captura do formulário
- [ ] Páginas de conteúdo das quatro áreas conexas

Enquanto ausentes, aparecem como pendência visível na página — nunca preenchidas com ficção.

### Riscos ativos
| Risco | Severidade | Tratamento |
|---|---|---|
| Validação do texto junto à seccional da OAB não foi feita | Alta | A camada `oab` é rede de segurança contra o erro óbvio, **não parecer jurídico**. A validação final é do escritório. Bloqueia publicação como página real |
| Página fictícia em URL pública ser confundida com escritório real | Média | `noindex, nofollow`, faixa de demonstração no topo, formulário sem destino, `disambiguatingDescription` no schema |
| `site` aponta para domínio de serviço da Railway | Baixa | Sobrescritível por `LP_SITE` no deploy; trocar quando houver domínio |
| Fallback de motion no Firefox | Baixa | Sem `animation-timeline`, o estado final estático continua legível. Não vale JS de scroll |
| Blocos reaproveitáveis não promovidos para `templates/blocks/` | Baixa | `Pendencia` e `Secao` são candidatos, mas o formato exige `referencia.png`. Pendente de screenshot |
| `templates/registry.json` sem a assinatura visual desta entrega | Média | O registro é a defesa anti-repetição entre clientes. O arquivo está vazio e sem precedente de formato: cabe ao `lp-designer` definir o schema |
