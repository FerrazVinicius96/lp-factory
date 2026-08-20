# PROJECT — {{NOME_CLINICA}} (piloto técnico)

> **Cliente de teste.** Identificação real da clínica, especialista, endereço e contatos ainda não
> fornecida — todos os campos de identificação usam placeholder `{{...}}` para substituição posterior.
> Sem camada de conformidade CFO (decisão do cliente para este piloto — ver seção 7).

## 1. Escopo

**Nível: avancado**

Landing page única de captação de lead para clínica de odontologia estética e reabilitação oral,
com foco em **implantes dentários e lentes de contato em porcelana**. Oferta central: agendamento de
avaliação especializada com escaneamento 3D digital (sem compromisso). Objetivo único: clique no CTA
de WhatsApp com mensagem pré-programada.

Público: homens e mulheres de 30–55 anos, classes A/B. Dor central: vergonha de sorrir, dificuldade
de mastigação, medo de dor/de dentista tradicional. Estrutura de conversão em AIDA, com FAQ dedicado
a quebrar objeção de dor e tempo de recuperação.

## 2. Requisitos Funcionais

| # | Requisito | Estado |
|---|---|---|
| RF1 | Estrutura AIDA completa (Atenção → Interesse → Desejo → Ação) | Pendente — Ciclo I |
| RF2 | FAQ de quebra de objeção: dor e tempo de recuperação | Pendente — Ciclo I |
| RF3 | Direção visual premium/minimalista, paleta Azul Marinho + Branco Gelo + Dourado | Pendente — Ciclo II |
| RF4 | Tema claro/escuro com tokens semânticos (obrigatório no avançado) | Pendente — Ciclo II |
| RF5 | Orçamento de JS de aplicação ≤ 60 KB gzip por rota | Pendente — Ciclo III |
| RF6 | SEO avançado: FAQPage + Service schema, canonical, OG, árvore de headings | Pendente — Ciclo III |
| RF7 | Motion scroll-linked em CSS, dentro de `@supports`, com `prefers-reduced-motion` | Pendente — Ciclo III |
| RF8 | Beacon de Web Vitals dentro do cap de 1,5 KB | Pendente — Ciclo III |
| RF9 | CTA único para WhatsApp com mensagem pré-programada | Pendente — Ciclo I/III |
| RF10 | Indicativos no código de onde injetar Pixel/GTM (sem IDs reais) | Pendente — Ciclo III |
| RF11 | Marcação de piloto/teste: `noindex, nofollow`, faixa de aviso no topo | Pendente — Ciclo III |

## 3. Fora de Escopo (cortes negociados)

| Corte | Motivo |
|---|---|
| Camada de conformidade CFO (odontologia) | Decisão explícita do cliente: este ciclo é teste técnico do pipeline, não entrega para publicação real |
| Nome real, CRO, endereço, telefone | Não fornecidos — ficam como placeholder, nunca inventados |
| Fotos, logotipo em arquivo, vídeos de depoimento | Descritos no brief, mas arquivos não entregues — a página referencia placeholders visuais, não substitutos fictícios do conteúdo real |
| Valor numérico da condição especial de pagamento | Não fornecido no brief; a regra de substância do gate reprova número sem `data-source` |
| Publicação real / indexação | Página nunca sai do estado de piloto interno enquanto os placeholders não forem substituídos |

## 4. Composição do Time de Subagents

Segue o padrão do nível avançado definido em `PROJECT.md` da fábrica (seção 4): `lp-strategist` →
`lp-designer` → `lp-builder` → gate `tech-lead` + `perf-a11y-auditor` (paralelo) → `lp-deployer`.
Nenhuma composição especial neste piloto — ausência da camada `compliance` é a única diferença em
relação ao fluxo padrão do nível avançado.

## 5. Decisões de Arquitetura

| Decisão | Motivo | Alternativa descartada |
|---|---|---|
| Sem pasta `compliance/` | Cliente optou por teste técnico puro nesta rodada, ver seção 7 | Camada `cfo`, análoga à `oab` do piloto `qf-queiroz-ferraz` |
| Identificação real substituída por `{{PLACEHOLDER}}` em todo o brief e código | Permite rodar o pipeline completo sem inventar dado de cliente real | Usar nome/dados fictícios "realistas" — risco de confusão com clínica real |
| Números de autoridade ("15 anos", "5.000 sorrisos") mantidos como declarados no brief | Vieram do próprio brief, não são invenção da fábrica | Remover por falta de comprovante anexado — o brief é a fonte válida por definição do gate |
| **Promessa central: "você vê o seu caso planejado em imagem antes de decidir"** (Ciclo I, `copy.md` §0) | O escaneamento 3D é o único ativo do brief que nenhum concorrente médio do nicho consegue copiar na headline; nomeia a oferta real (avaliação) e não o tratamento | **Descartada 1: "tratamento indolor"** — é a headline padrão do nicho (bloco intercambiável reprova na política anti-slop) e é afirmação clínica que o brief não sustenta com protocolo. Rebaixada a tratamento de objeção no FAQ. **Descartada 2: "volte a mastigar dos dois lados"** — atende só o público de implante e deixa lentes de porcelana de fora. Reaproveitada como bullet de dor e eixo da aba de implantes |
| **Campo sintético do herói entra como `background-image` em camada decorativa, não como elemento de imagem** | O LCP travado no bloco de headline (RF7, `wireframe.md`) não admite concorrente. A camada cobre o viewport inteiro no desktop — condição em que o Chrome trata a imagem como fundo e a exclui de candidata a LCP — e no mobile a faixa nasce abaixo da dobra. `background-image` ainda é descoberto depois do CSSOM, então não disputa banda com a fonte nem com o primeiro parágrafo | Elemento de imagem com `fetchpriority="high"`: é o padrão para hero, mas aqui tornaria a imagem candidata direta a LCP e mataria a regra que a própria direção existe para servir |
| **Onde a imagem aparece é decidido pela máscara, não pela caixa** | Medição, não composição: o pixel mais claro do arquivo é `#FEFDFC` e o traço da malha SVG sozinho já derruba `leitura-escura` para 4,64:1 — o piso exato do AA. Não sobra alfa admissível sob texto nenhum, então a máscara mantém alfa zero em toda a coluna de texto, com o limite calculado nas medidas do próprio grid | Véu escuro sobre a imagem para recuperar contraste: recupera a razão, mas apaga a imagem que justificou a geração e vira gradiente decorativo não declarado no tema |
| **A regra acima virou ZONA DE CAMPO, e vale para as duas camadas do visor** (correção pós-gate) | A disciplina de máscara tinha sido aplicada só ao PNG. O SVG da malha ficou de fora e foi o que reprovou: `left: 42%` sem reduzir `width: 100%` alargava a camada para além do container, cobria a coluna de texto abaixo de 60rem e jogava 531px da arcada para fora da tela acima dela. A garantia agora é **posicional**, não gráfica: existe uma zona de campo — faixa sob o texto abaixo de 75rem, coluna à direita de `--campo-limite` acima — e **as duas camadas só existem dentro dela**. O comprimento da entrada da máscara dentro da zona voltou a ser composição. Verificado no navegador em 9 larguras: folga mínima de 38px na horizontal e 64px na vertical | Manter a caixa cheia e confiar só na rampa da máscara para o SVG: é o que já existia para o PNG e não impede que uma futura mudança de caixa reabra o defeito sem ninguém perceber |
| **A coluna de texto do visor é limitada pelo mesmo token que o `--campo-limite` promete** (`.visor__coluna` = `--medida-texto`) | A máscara sozinha é meia garantia: o `h2` do fecho não tinha `max-width` e, em 1920, chegaria a ~822px — passando por baixo da rampa. Com o limite na coluna, os dois lados da conta são código, não intenção | Dar `max-width` elemento a elemento: funciona hoje e quebra no primeiro elemento novo que o Ciclo III acrescentar |
| **CTA flutuante mobile implementado, não cortado** | O `wireframe.md` o exige e ele tinha sumido em silêncio entre wireframe e protótipo. A página tem um KPI só (clique no WhatsApp) e o percurso do mobile entre o CTA do herói e o do fim de S5 é longo. Cortar um elemento de conversão de uma página de conversão para poupar trabalho é a decisão fraca. Desenhado como linha de estado do visor — campo escuro, fio, leitura em mono, ação em dourado — para não ser a pílula flutuante intercambiável que a política anti-slop reprova. Gatilho em `view-timeline` sobre um marco no fim de S2; `IntersectionObserver` só como fallback de Firefox | Cortar formalmente alegando que os 3 CTAs em linha já cobrem a jornada: cobrem a estrutura do argumento, não o custo de rolagem do celular, que é onde o público desta página está |
| **Reservas de S8/S9/S10 são estruturais e vivem só no protótipo** (`data-proto-only`) | O cliente precisa dimensionar o que tem de entregar — proporção, quantidade, autorização —, e isso é informação, não buraco. Mas a regra de integridade não muda: a seção continua não renderizando em produção | Renderizar as seções com imagem gerada por IA no lugar da foto real: viola a política anti-slop §C ("nem como exemplo") e já foi recusado pelo usuário |

## 6. Histórico de Ciclos

| Data | Ciclo | Evento | Resultado |
|---|---|---|---|
| 2026-08-20 | 0 | `/lp-intake`: briefing completo recebido em bloco único, nível avançado fixado, decisão de não aplicar camada CFO | Cliente aberto, `clients/clinica-piloto-odonto/` criado |
| 2026-08-20 | I | `lp-strategist`: promessa central definida, 3 passes de copy, 3 variantes de headline, 13 seções (10 publicáveis, S8/S9/S10 travadas por falta de material) | `copy.md` e `wireframe.md` criados — RF1, RF2 e RF9 (texto do CTA) atendidos. Aguardando aprovação do cliente antes do Ciclo II |
| 2026-08-20 | II | `lp-designer`: três direções divergentes em paralelo (A, B, C). Usuário aprovou a **direção B — "Visor"** | `tokens.json` = `proto/tokens-b.json`; `proto/direcao-b.html` canônico; A e C em `proto-descartado/`. Assinatura registrada em `templates/registry.json` (`visor-campo-cheio-malha-regua-esquerda`). RF3 e RF4 atendidos |
| 2026-08-20 | II | Integração de mídia e reservas estruturais no protótipo canônico | Campo sintético do herói e do fecho; reservas de S8/S9/S10; `tokens.json` §`midia`. Detalhes na seção 5 (decisões) e abaixo (Mídia gerada) |
| 2026-08-20 | II | **Checkpoint do cliente: aprovação condicional.** Extensão do Chrome indisponível (nem o orquestrador nem o cliente conseguiram inspecionar visualmente); cliente aprovou seguir mesmo assim, verificação real fica pendente | Ciclo II segue como aprovado *sob condição* — ver pendência em §7. Bloqueia o gate final até a verificação visual ocorrer |
| 2026-08-20 | III | `lp-builder`: implementação completa em Astro/Tailwind, 11 componentes, 0,47 KB JS de aplicação, AVIF/WebP responsivo do campo sintético | Build limpo, `qa-gate.mjs` (copy+visual+orçamento) OK. Contagem de seções ficou incorreta na documentação (10 reais, texto diz 11) — corrigir no próximo ciclo |
| 2026-08-20 | Gate | `tech-lead` + `perf-a11y-auditor` em paralelo — primeira rodada | **DEVOLVIDO, nota 3** (piso 5). Defeito raiz: `.visor__malha` (SVG decorativo) deslocada com `left:42%` sem reduzir largura, traço dourado cruza texto em 320–1200px, contraste 3,97:1 mobile / 3,01:1 desktop (abaixo do AA). É defeito de **Ciclo II** (protótipo já carregava o bug), não do builder. Achado colateral: CTA flutuante mobile do `wireframe.md` nunca foi implementado nem registrado como corte. Integridade e anti-slop qualitativo: sem ressalva. LCP real 2,7s (teto 2,0s) — causa é bloqueio da fonte Google Fonts, não a imagem de fundo (arquitetura do LCP-é-o-H1 confirmada por medição real) |
| 2026-08-20 | II | `lp-designer`: correção do defeito de contraste | `left:42%` substituído por **zona de campo** (faixa/coluna que as duas camadas decorativas obedecem), `.visor__coluna` limitando a coluna de texto, caminho de imagem morto corrigido. Contraste remedido: pior caso 5,01:1, 0 reprovas em 20 pares. CTA flutuante mobile **implementado** (decisão registrada, não cortado) |
| 2026-08-20 | III | `lp-builder`: segunda rodada — reaplicação da zona de campo no código, CTA flutuante mobile (`BarraAcao.astro`), as 10 correções do gate anterior, e fix de LCP (Google Fonts non-blocking) | Build limpo. `qa-gate.mjs` OK (0,66 KB JS de 60 KB). LCP local medido em 0,9s via Lighthouse (ressalva: servidor estático local, não condição de rede de produção) |
| 2026-08-20 | Gate | `tech-lead` + `perf-a11y-auditor` — segunda rodada | **DEVOLVIDO, nota 3** (piso 5), de novo. Contraste/zona de campo, LCP (0,9s com throttling real), CLS (~0,002) e as 10 correções da rodada 1 **confirmados de verdade** — sem regressão. Defeito novo, mesma causa raiz: o minificador do build (Lightning CSS) funde `animation-name`+`animation-timeline` num shorthand `animation:` inválido no Chrome, que descarta a declaração inteira. Efeito: (1) CTA flutuante nunca aparece em navegadores Chromium; (2) a malha do herói (motivo da direção "Visor") fica invisível no estado padrão, só aparece com `prefers-reduced-motion`. Mais 3 achados: rótulo cortado em S6 (`viewBox` pequeno, defeito de Ciclo II), overflow horizontal a 320px (`.sem-dado` sem `nowrap` seguro), e a contagem "11 seções" (real: 10) que já devia ter sido corrigida na rodada anterior e não foi |
| 2026-08-20 | III | `lp-builder`: terceira rodada — causa raiz corrigida (longhands puros de `animation-*`, nunca shorthand `animation:` em regra com `animation-timeline`, para sobreviver ao minificador), `viewBox` de `FiguraProporcao` alargado, overflow de `.sem-dado` a 320px corrigido, contagem de seções sincronizada (10) em 5 arquivos, comentário de contraste desatualizado corrigido | Confirmado no HTML gerado, não só no fonte: `grep animation: dist/index.html` vazio — nenhum shorthand fundido sobrevive. `qa-gate.mjs` OK (0,66 KB JS de 60 KB) |
| 2026-08-20 | Gate | `tech-lead` + `perf-a11y-auditor` — terceira rodada | **DEVOLVIDO, nota 4** (piso 5). CTA flutuante, malha do herói, rótulo de S6 e overflow 320px: **confirmados funcionando de verdade em Chrome real** (não só CSS válido) — `perf-a11y` aprovou o item. Único bloqueador: a varredura da rodada 2 disse "sincronizado em 5 arquivos" mas restaram 2 linhas vivas com "11 seções" (`PRODUCT.md:113`, `PROJECT.md:73`) — a lista do autor não é evidência de correção. Corrigidas diretamente pelo orquestrador (sem nova rodada de agente), varredura de confirmação limpa. Achado não bloqueante do perf-a11y: `.faixa__aviso` fora de landmark ARIA (axe, moderado) — vai para o backlog |
| 2026-08-20 | Gate | `tech-lead` — quarta rodada | **DEVOLVIDO, nota 4** de novo — mesma classe de defeito. As 2 linhas confirmadas corretas, mas a varredura (escopo `.md` que o próprio orquestrador pediu) deixou passar `proto/direcao-b.html:723` — comentário HTML "não renderizar em produção" com "11 seções" em tempo presente. Arquivo canônico do Ciclo II, nunca tocado pelas sincronizações anteriores. Corrigido diretamente. Varredura refeita **sem filtro de extensão, diretório inteiro** — só sobram as 2 menções históricas legítimas em `PROJECT.md` §6 |
| 2026-08-20 | II | **Correção de defeito, sem nova rodada de direções.** Direção B segue aprovada e canônica. (1) O contrato de máscara passou a valer para as duas camadas do visor: `.visor__malha` perdeu o `left: 42%` e passou a ocupar a mesma zona de campo do PNG, com o breakpoint da geometria movido de 60rem para 75rem — abaixo disso a coluna à direita seria um filete. (2) `.visor__coluna` limita a coluna de texto a `--medida-texto`, fechando o outro lado da conta. (3) CTA flutuante mobile implementado. (4) Achado colateral: o protótipo apontava para `public/media/sintetico/`, pasta que não existe desde que o Ciclo III moveu o máster — a referência estava morta e **o campo sintético não renderizava para ninguém**, inclusive no gate | Contraste refeito: 20 pares verificados, 0 reprovas, menor razão de texto 5,01:1, pior caso dentro do visor 8,57:1. Verificação visual real feita em Chrome headless (500–1920px, tema claro e escuro), o que **encerra a pendência de verificação visual da §7**. `tokens.json` ganhou o bloco `zona-campo` e `handoff.invariantes-para-o-ciclo-iii`. Assinatura inalterada — `registry.mjs --verificar` sem colisão |
| 2026-08-20 | Correção | Orquestrador: `proto/direcao-b.html:723` ("11 seções" → "10 seções", comentário `NÃO RENDERIZAR EM PRODUÇÃO`) | Varredura de confirmação sobre o diretório inteiro, sem filtro de extensão — limpa |
| 2026-08-20 | Gate | `tech-lead` — quinta rodada | **APROVADO — nota 5** (piso 5). Varredura própria refeita com padrão largo (`\d+\s*(seç\|publicáve\|travad\|componentes\|leituras)`), 14 ocorrências, todas coerentes. `dist/`: 10 seções reais, `data-proto-only` ausente. Integridade item a item contra o brief: sem ressalva. **Entrega final do piloto técnico** |
| 2026-08-20 | Deploy | `deploy.mjs` quebrava no Windows: `spawnSync('npm'\|'git'\|'railway', …)` sem `shell:true` não localiza os shims `.cmd`. Corrigido (`shell` só para comandos por nome, nunca para caminho absoluto — evita reabrir o mesmo bug com `process.execPath`), regex de detecção de CLI ausente ampliada, e implementado o `--registrar <url>` que o próprio script já prometia. CLI da Railway não está instalada neste ambiente — serviço `clinica-piloto-odonto` criado no projeto Railway `lp-factory` via conector (MCP), espelhando a config do `qf-queiroz-ferraz` (Railpack, Node 22, build `cd clients/... && npm install && npm run build`). 1ª tentativa falhou: `RAILPACK_SPA_OUTPUT_DIR` apontava pra `dist` (raiz) em vez de `clients/clinica-piloto-odonto/dist` — corrigido e redeploy | **Publicado**: `https://clinica-piloto-odonto-production.up.railway.app`. Verificado: HTTP 200, título ok, `wa.me` presente, beacon presente, `noindex, nofollow` presente. Registrado em `logs/deploy.jsonl` via `deploy.mjs --registrar` |

### Mídia gerada — contador do teto

Nível avançado: **teto de 20 gerações Higgsfield por projeto. Usadas 2.**

| # | Arquivo | Modelo | Estado | Uso |
|---|---|---|---|---|
| 1 | `media-fonte/hero-malha-v1.png` (2688×1536, PNG 2,3 MB) · entrada do pipeline em `src/assets/sintetico/` | Higgsfield `recraft_v4_1` | **Aprovada pelo usuário** | Campo de profundidade do visor em S1 (força .46 na faixa, .58 na coluna) e S12 (força .34). Composição abstrata de malha em perspectiva, paleta cobalto/dourado da direção B |
| 2 | `media-fonte/hero-malha-v2.png` | Higgsfield `recraft_v4_1` | **Descartada pelo usuário** | Não referenciada em lugar nenhum. Mantida em disco só como registro da rodada |

**Integridade da imagem gerada.** A v1 é composição abstrata: não retrata pessoa identificável, consultório
ou registro documental de atendimento, e **não substitui nenhum ativo pendente**. A condição está declarada
na régua do herói (`CAMPO · composição sintética`) e no rodapé da página.

**Não há `logs/media.jsonl`.** O `CLAUDE.md` da fábrica proíbe escrever log à mão e delega isso aos hooks;
nenhum hook gravou esta rodada, porque as duas gerações saíram da sessão do orquestrador. Fica como
pendência de infraestrutura, não de conteúdo — ver seção 7.

### Reservas estruturais de S8, S9 e S10

**São estruturais, não fotográficas.** O bloco `data-proto-only="true"` em `proto/direcao-b.html` mostra
apenas a área que cada arquivo real vai ocupar — proporção, quantidade, posição e o que o cliente precisa
entregar junto (autorização, resolução, enquadramento). O conteúdo do bloco é o rótulo **ATIVO PENDENTE**;
não há foto, caso ou depoimento simulado, nem como exemplo.

| Seção | Reserva | Especificação declarada ao cliente |
|---|---|---|
| S8 — Consultório | 3 campos 4:3, faixa com rolagem lateral no mobile | Foto horizontal, mínimo 2000 px no lado maior, arquivo original sem filtro |
| S9 — Antes e depois | 3 pares 1:1 (bloco 2:1) com divisória fixa, empilhados | Mesmo enquadramento, distância e luz nas duas fotos do par; autorização de uso assinada; tratamento realizado |
| S10 — Depoimentos | 3 campos 3:4, faixa com rolagem lateral no mobile | Vídeo vertical 3:4, poster no mesmo enquadramento, sem autoplay, autorização de uso, primeiro nome e tratamento, transcrição |

**As três seções continuam travadas.** A página publicada vai ao ar com 10 seções. O Ciclo III **não
renderiza** o bloco `data-proto-only` em produção.

## 7. Pendências e Riscos Ativos

### Pendências do cliente — bloqueiam publicação real
- [ ] Nome fantasia real da clínica e CRO do especialista responsável
- [ ] Endereço e cidade de atendimento
- [ ] Número de WhatsApp real para o CTA
- [ ] Logotipo em arquivo vetorial (SVG)
- [ ] Fotos reais (consultório, especialista, antes/depois)
- [ ] Arquivos ou transcrição autorizada dos 3 vídeos de depoimento
- [ ] Valor ou condição concreta da oferta "esta semana"
- [ ] IDs reais de Pixel/GTM (o código só marca onde injetar)

Levantadas no Ciclo I (`copy.md` — lista completa com o bloco que cada uma trava):
- [ ] Protocolo de anestesia e conduta pós-operatória (FAQ, perguntas 1 e 2)
- [ ] Tempo de retorno à rotina e restrições iniciais (FAQ, pergunta 2)
- [ ] Política de dente provisório e de desgaste para lente (FAQ, perguntas 3 e 4)
- [ ] Duração da avaliação e horário de atendimento
- [ ] Confirmação de etapa de ensaio visual / mock-up prévio (opcional — reforça a seção S6)
- [ ] Critério de contagem dos números de autoridade (recomendado antes de publicação real)

### Riscos ativos
| Risco | Severidade | Tratamento |
|---|---|---|
| Sem camada de conformidade CFO, a copy pode incluir promessa de indolor, "antes e depois" e urgência promocional em formato que não passaria num gate real de odontologia | Alta | Aceito pelo cliente como escopo deste piloto técnico. **Reavaliar obrigatoriamente antes de qualquer publicação real** — recriar a camada `compliance/cfo` análoga à `oab` |
| Página fictícia poder ser confundida com clínica real, se publicada | Média | Mesma mitigação do piloto `qf-queiroz-ferraz`: `noindex, nofollow`, faixa de demonstração, sem endpoint real de captura |
| Números de autoridade sem comprovação anexada | Baixa | Vieram do brief; ficam com `data-source` apontando para a seção 4 deste brief, não para documento externo |
| Bloco `data-proto-only` de S8/S9/S10 vazar para produção | Alta | O bloco é a única parte da página que não pode ir ao ar. Marcado com atributo, comentário de abertura e de fechamento no HTML. **O Ciclo III remove o bloco inteiro, e o gate confere que `data-proto-only` não existe no build** |
| Campo sintético virar o elemento de LCP no build real | Média | Mitigado por construção (camada de fundo cobrindo o viewport, sem elemento de imagem). **Medição obrigatória no Ciclo III:** se o campo for reportado como LCP na página construída, reduzir a caixa antes de qualquer outro ajuste |
| Máster de 2,3 MB servido sem conversão | Média | O protótipo referencia o PNG máster porque não há conversor de imagem nesta máquina (`cwebp`, `magick`, `ffmpeg` e Pillow ausentes). O Ciclo III emite AVIF + WebP em 768/1280/1920/2560 pelo pipeline do Astro. Não publicar sem isso |
| `logs/media.jsonl` não existe | Baixa | Nenhum hook gravou as duas gerações Higgsfield desta rodada. O contador vive nesta seção 6 até que um hook cubra o caminho. Registrar log à mão é proibido pelo `CLAUDE.md` |
| ~~**Aprovação do Ciclo II é condicional — sem verificação visual real.**~~ **Resolvido em 2026-08-20** | — | A extensão do Chrome continua indisponível, mas o Chrome instalado roda em `--headless=new`, o que permitiu captura real e sondagem de layout via `--dump-dom`. Verificado em 500, 752, 944, 1183, 1216, 1264, 1424 e 1904px de largura útil, nos temas claro e escuro. **Foi essa verificação que revelou o caminho morto da imagem** — o defeito que nenhuma leitura de código tinha pego. Fica como método para as próximas entregas: `chrome.exe --headless=new --screenshot` para ver, `--dump-dom` com uma sonda de `getBoundingClientRect` para medir |
| **Largura útil mínima verificável é 500px, não 320px** | Baixa | O Chrome no Windows não abre janela abaixo de 500px de largura, então 320 e 390 foram verificados por aritmética (mesma que reproduziu exatamente as razões medidas pelo `tech-lead`), não por captura. A geometria da faixa não depende da largura — o campo nasce abaixo do texto em qualquer valor —, então o risco residual é de composição, não de contraste. Confirmar em aparelho real antes da publicação |
| ~~**Piloto não publicado**~~ **Resolvido em 2026-08-20** | — | Publicado via conector Railway (MCP) em `https://clinica-piloto-odonto-production.up.railway.app`, ambiente `production` do projeto Railway `lp-factory` (a CLI não gera ambiente `preview` separado quando não há CLI — publicado direto, mas a página continua marcada como demonstração via `noindex`/faixa). Verificação pós-deploy OK |
| **`plugin/scripts/deploy.mjs` quebrava no Windows** (infraestrutura da fábrica, não deste cliente) | Alta | `spawnSync('npm'\|'git'\|'railway', …)` sem `shell:true` não localiza os shims `.cmd` do Windows — abortava com "build quebrado" mesmo com build funcionando. Corrigido: `shell:true` só para comandos por nome (nunca para `process.execPath`, que quebraria de novo com espaço no caminho), detecção de CLI ausente por preflight (`railway --version`) em vez de regex sobre mensagem de erro localizada, e `--registrar <url>` implementado como a mensagem de erro já prometia. **Resíduo conhecido, benigno:** o processo termina com um crash do libuv (`UV_HANDLE_CLOSING`) *depois* do log já gravado — não afeta o resultado, mas vale investigar se afetar CI |
| **Nenhum serviço Railway existia para este cliente** | — | Criado via `create-deployment` (conector Railway/MCP, já que a CLI está ausente), espelhando a config do `qf-queiroz-ferraz`: Railpack, Node 22, `buildCommand` escopado ao diretório do cliente. Corrigido um erro de config na 1ª tentativa: `RAILPACK_SPA_OUTPUT_DIR` apontava para `dist` (raiz do repo) em vez de `clients/clinica-piloto-odonto/dist` |
