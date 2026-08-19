# PROJECT.md — Fábrica Agêntica de Landing Pages

> Fonte da verdade do projeto. Estrutura de seções fixa (não alterar sem aprovação explícita).
> Última atualização: 19/08/2026 · Ciclo: 0 (setup não iniciado)

---

## 1. Escopo

Estrutura agêntica autônoma, no ecossistema Claude, que produz landing pages sob demanda, publica, monitora e executa manutenção diária com correção de bugs e upgrades incrementais. Multi-cliente, permanente, com estado em disco (não em contexto).

**Base de processo:** documento *Modelo para landing pages — Projetos menores* (3 ciclos + matriz de qualidade 0–5).
**Estratégia aprovada:** **B — Híbrida.** Criação roda localmente; manutenção diária roda na nuvem, independente da máquina do operador.

**Decisões já ratificadas pelo cliente (VF):**

| Item | Decisão |
|---|---|
| Estratégia | B — Híbrida |
| Hospedagem da fábrica | Repositório GitHub |
| Publicação das páginas | Railway (plano Pro) |
| Rotina de manutenção | Diária, 23h (America/Sao_Paulo) |
| Níveis de entrega | Três: Básico, Intermediário, Avançado |
| Política Anti-Slop | **Obrigatória** — ver `POLITICA_ANTI_SLOP.md` |

---

## 2. Requisitos Funcionais

**RF01 — Abertura de cliente sob demanda.** `/lp-intake` cria `clients/<slug>/`, coleta briefing por perguntas de múltipla escolha e **define o nível de entrega** (Básico / Intermediário / Avançado), que passa a governar todos os orçamentos técnicos do projeto.

**RF02 — Ciclo I (Concepção e Copy).** Oferta, dor do público, copy e wireframe de baixa fidelidade. Número de passes de copy conforme o nível (1 / 2 / 3 + variantes de headline).

**RF03 — Ciclo II (Design Visual).** Direção visual, `tokens.json`, protótipo navegável. Tema claro/escuro conforme o nível (não / opcional / obrigatório com tokens semânticos).

**RF04 — Ciclo III (Construção e Performance).** Código, motion dentro do orçamento do nível, integrações, SEO conforme o nível, tracking.

**RF05 — Gate de qualidade.** `tech-lead` avalia pela matriz 0–5 e **reprova devolvendo ao Ciclo II** quando a nota é ≤ 2. No nível Avançado, roda em paralelo com auditoria dedicada de performance e acessibilidade.

**RF06 — Publicação.** Deploy na Railway, domínio, CDN, registro no log de deploy.

**RF07 — Log operacional.** Todo build, QA, deploy e evento de runtime grava uma linha em JSONL, escrita por hook (determinística), não pelo modelo.

**RF08 — Manutenção diária às 23h.** Sessão nova lê apenas o delta dos logs + telemetria, tria pela matriz 0–5, corrige P0/P1, alimenta o backlog de upgrades, resume o dia e rotaciona os logs.

**RF09 — Política Anti-Slop.** Verificação automatizada (léxico proibido, léxico visual, placeholders, claims sem fonte) mais julgamento qualitativo do `tech-lead`. **Bloqueia merge**, não gera aviso.

**RF10 — Acúmulo de ativo.** Cada LP entregue devolve blocos reaproveitáveis para `templates/blocks/` e aprendizado para o `MEMORY.md` dos agentes.

### Níveis de entrega

| Dimensão | Básico | Intermediário | Avançado |
|---|---|---|---|
| Seções | 4–6 | 7–9 | 10+ |
| Motion | só transições CSS de estado | scroll-triggered | scroll-linked timeline, parallax, zoom na rolagem |
| 3D/WebGL | proibido | proibido | permitido, só quando o brief justificar |
| Vídeo | proibido | proibido | motion background em loop |
| Mídia | artlist (imagem estática) | Higgsfield `generate_image` | Higgsfield imagem + vídeo |
| Tema claro/escuro | não | opcional | obrigatório, com tokens semânticos |
| Interatividade | form + WhatsApp | + tabs, accordion, mapa estilizado | + simulador/configurador ou canvas |
| SEO | meta, OG, sitemap, alt | + Schema.org, canonical, heading tree | + FAQPage/Service schema, budget de CWV |
| Copy | 1 passe | 2 passes | 3 passes + variantes de headline |
| Gate | checklist enxuta | `tech-lead` completo | `tech-lead` + performance e a11y verificadas |
| **Orçamento de JS (derivado)** | **0 KB** | **≤ 15 KB** | **≤ 60 KB por rota, carregado sob demanda** |
| **Piso de qualidade (matriz 0–5)** | **≥ 3** | **≥ 4** | **5** |

As duas últimas linhas são derivadas, não substituem nada da tabela original: traduzem cada nível em número verificável por hook.

---

## 3. Fora de Escopo (cortes negociados)

- **Agent teams.** Recurso experimental, desativado por padrão, custo por teammate alto. Subagents resolvem a coordenação necessária aqui com custo menor.
- **Next.js / Nuxt / WordPress / Webflow.** Runtime e complexidade que uma página estática não paga; as plataformas no-code ainda quebram o eixo do pedido (não versionáveis por agente, sem hooks de gate, sem substrato para a manutenção noturna ler e escrever).
- **Orquestração do ciclo inteiro como Dynamic Workflow** (Estratégia C). Adotado apenas o recorte de QA em paralelo.
- **Cobertura de testes exaustiva.** Validação funcional por smoke test a cada ciclo, conforme princípio do projeto.
- **A/B testing automatizado na v1.** Entra no backlog de upgrades depois que houver tráfego real.

---

## 4. Composição do Time de Subagents

| Nome | Escopo | Model | permissionMode | isolation | Justificativa |
|---|---|---|---|---|---|
| `lp-strategist` | Ciclo I — oferta, dor, copy, wireframe, variantes de headline | `opus` | `default` | — | Etapa de maior alavancagem comercial e menor mecanicidade |
| `lp-designer` | Ciclo II — direção visual, `tokens.json`, tema, geração de mídia (artlist / Higgsfield conforme o nível) | `opus` | `default` | — | O diferencial declarado do produto; recebe orçamento de raciocínio |
| `lp-builder` | Ciclo III — código, motion dentro do orçamento de JS do nível, SEO, integrações | `sonnet` | `default` | `worktree` | Execução de volume; worktree isola clientes construídos em paralelo |
| `tech-lead` | Gate — matriz 0–5, Anti-Slop qualitativo, arquitetura. **`disallowedTools: Write, Edit`** | `opus` | `default` | — | Auditor não corrige o que audita; sem ferramenta de escrita o veredito é honesto por construção |
| `perf-a11y-auditor` | Só no nível **Avançado** — Lighthouse, CWV de campo, WCAG, `prefers-reduced-motion`. **`disallowedTools: Write, Edit`** | `sonnet` | `default` | — | Roda em paralelo ao `tech-lead`; existe apenas onde a tabela exige verificação dedicada |
| `lp-deployer` | Build, deploy na Railway, domínio, CDN, registro do deploy | `sonnet` | `default` (nunca `bypassPermissions`) | — | Única fronteira com produção, mantida sob permissão explícita |
| `lp-maintainer` | Rotina das 23h — delta de logs, triagem 0–5, hotfix, backlog | `sonnet` (`effort: high`) | `default` | `worktree` | Roda desassistido; worktree impede que uma manutenção suje árvore de trabalho ativa |

**Teto de fan-out:** 6 agentes ativos por ciclo no Básico/Intermediário, 7 no Avançado. Delegação aninhada permanece desativada (padrão da ferramenta).

**Memória persistente (`memory: project`):** `lp-strategist`, `lp-designer`, `tech-lead` e `lp-maintainer`. O `MEMORY.md` de cada um substitui releitura do repositório — principal alavanca de economia de token.

---

## 5. Decisões de Arquitetura

| Decisão | Motivo | Alternativa descartada |
|---|---|---|
| Subagents em `.claude/agents/`, não dentro do plugin | Agentes distribuídos por plugin **ignoram** `hooks`, `mcpServers` e `permissionMode` — os três campos que sustentam os gates deste desenho | Empacotar os agentes no plugin |
| Plugin carrega skills, hooks e monitors | Componentes que o plugin distribui sem perda de capacidade | Tudo solto no repositório, sem versionamento de distribuição |
| Estado em JSONL append-only escrito por hook | Determinístico, barato e imune a alucinação de log | Pedir ao modelo que "registre o que fez" |
| Manutenção lê apenas o delta desde `last_run` | Mantém o custo diário constante em vez de crescente | Reler o repositório ou o histórico completo |
| Sumarização diária + rotação de 30 dias | Impede que o contexto de amanhã carregue o passado | Acumular log indefinidamente |
| `tech-lead` sem `Write`/`Edit` | Separação de responsabilidade reforçada tecnicamente, não em prosa | Confiar na instrução do system prompt |
| Anti-Slop como script em hook + rubric do `tech-lead` | Regex pega o mensurável; o agente julga o resto. Bloqueia merge | Política apenas escrita no CLAUDE.md |
| Nível de entrega define orçamentos numéricos | Torna Básico/Intermediário/Avançado verificáveis por máquina | Níveis como descrição qualitativa |
| RUM próprio + analytics self-hosted na Railway | A Railway não expõe erros de runtime e Web Vitals de front-end como outros provedores; sem isso a manutenção só enxerga saúde de servidor | Depender só de `get-logs` e `get-service-metrics` |
| CDN embutido da Railway como padrão, Cloudflare como opção | Um passo a menos no setup, com POPs de borda já roteando o visitante | Cloudflare obrigatório desde o início |

---

## 6. Histórico de Ciclos

| Data | Ciclo | Evento | Resultado |
|---|---|---|---|
| 19/08/2026 | 0 | Planejamento e apresentação de 3 estratégias | Estratégia B aprovada |
| 19/08/2026 | 0 | Aprofundamento de stack sob a ótica do design | Railway + GitHub + 23h ratificados; stack pendente de confirmação final |
| 19/08/2026 | 0 | Cliente define 3 níveis de entrega e exige política Anti-Slop | Incorporado a este documento e a `POLITICA_ANTI_SLOP.md` |
| 19/08/2026 | 0 | Deliberação fechada: Astro 7 + Tailwind v4, CSS scroll-driven com fallback IO, RUM desde o setup | Setup autorizado |
| 19/08/2026 | 1 | **Setup executado.** Repositório `lp-factory` construído: 7 subagents, 3 skills, hooks de gate, scripts Anti-Slop, template Astro, coletor de telemetria, workflow de QA paralelo e agendamento das 23h | Smoke test: 18/18 gates passando; template compila com **0 KB de JS de aplicação** e beacon de 0,77 KB |

---

## 7. Pendências e Riscos Ativos

| # | Item | Tipo | Estado |
|---|---|---|---|
| 1 | **`/impeccable`** é plugin local do Claude Code, não visível daqui. Declarado como dependência externa no `README.md`; ainda **não está referenciado** por nenhum agente ou skill | Pendência de integração | Aberta — precisa da descrição dele para virar passo do Ciclo II |
| 2 | Stack confirmada: Astro 7 + Tailwind v4, orçamento de JS escalonado | Decisão | **Fechada** |
| 3 | RUM próprio + analytics self-hosted: coletor escrito em `telemetria/collector/`, ainda **não publicado** na Railway | Execução | Aberta — depende de você criar o serviço e o Postgres |
| 4 | Motion: CSS scroll-driven com fallback IntersectionObserver | Decisão | **Fechada** — implementado em `templates/base/src/styles/motion.css` |
| 5 | Vídeo no Avançado nunca é o elemento LCP; poster AVIF, `preload="none"`, desligado em `prefers-reduced-motion` e `saveData` | Mitigação | **Fechada** — regra no `lp-builder` e em `.claude/rules/frontend.md` |
| 6 | 3D/WebGL no Avançado carrega sob demanda, fora do caminho crítico | Mitigação | **Fechada** — regra no `lp-builder` |
| 7 | Routines em research preview | Risco externo | Aberta — mitigada pelo workflow do GitHub Actions já incluído |
| 8 | Teto de gerações Higgsfield: 8 no Intermediário, 20 no Avançado | Risco de custo | **Fechada** — em `tiers.json` e no `lp-designer` |
| 9 | `budget-check` não mede JS injetado em runtime por terceiro (pixel, chat) | Limite conhecido | Aberta — manter esses no gerenciador de tags e revisar manualmente |
| 10 | Nenhum cliente-piloto rodado de ponta a ponta ainda. O smoke test cobre os gates e o template, não o ciclo completo | Validação | **Próximo passo** |
