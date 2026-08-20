# Wireframe — {{NOME_CLINICA}}

> Baixa fidelidade. **Ordem, hierarquia e função.** Nenhuma decisão de estética: cor, tipografia, espaçamento,
> sombra e motivo gráfico são do Ciclo II (`lp-designer`), a partir de `tokens.json`.
> Mobile-first: cada seção é descrita empilhada; a variação em desktop vem anotada onde muda a leitura.
> Corresponde 1:1 a `copy.md` — S1…S13.

---

## Regras estruturais da página

| Regra | Definição |
|---|---|
| **Coluna única** | Do início ao fim, inclusive em desktop. A página é uma leitura sequencial de argumento; grid de cards competiria com a ordem AIDA. |
| **Largura de leitura** | Bloco de texto corrido limitado a medida de leitura confortável. Blocos de imagem podem sangrar mais largo. |
| **CTA** | Aparece 3 vezes: S1 (hero), fim de S5 (após o leitor se identificar com um dos caminhos), S12 (fecho). Nada de barra fixa no topo. |
| **CTA flutuante mobile** | Botão persistente no rodapé da viewport, ativado após o fim de S2 — antes disso o leitor ainda não sabe o que está sendo oferecido. Não cobre o conteúdo: reserva de espaço no fim da página. |
| **Destino único** | Todos os CTAs vão para o mesmo `{{WHATSAPP_NUMERO}}` com a mesma mensagem pré-programada. |
| **Seções travadas** | S8, S9 e S10 não renderizam enquanto o material do cliente não chegar. A página vai ao ar com 10 seções, sem espaço vazio nem substituto. |
| **Âncoras de rastreamento** | Marcadas abaixo com `[TRACK]`. O Ciclo III insere apenas os comentários de injeção de Pixel/GTM — nenhum ID real. |
| **LCP** | O elemento LCP é o bloco de headline de S1. Nenhum vídeo ou animação de entrada disputa esse slot. |

---

## S1 — Hero · **Atenção**

**Precisa provar:** que a página fala do problema dele, e que o primeiro passo custa pouco.

```
┌──────────────────────────────────────────┐
│ [logo {{LOGO_SVG}}]                      │  topo mínimo, sem menu de navegação
├──────────────────────────────────────────┤
│                                          │
│  H1 — headline (3 linhas no mobile)      │  ← elemento LCP
│  P  — subheadline (2–3 linhas)           │
│                                          │
│  [ CTA PRIMÁRIO — botão largura total ]  │  [TRACK] cta_hero
│  linha de apoio: canal · horário ·       │
│  "sem compromisso"                       │
│                                          │
│  ── tira de autoridade ──                │
│  nome · CRO · nº de anos <!-- data-source: brief.md §4 -->
│                                          │
│  [ ÁREA VISUAL — escaneamento/tela 3D ]  │  abaixo do texto no mobile;
│                                          │  ao lado, à direita, em desktop
└──────────────────────────────────────────┘
```

**Sem menu de navegação.** Página de objetivo único; link no topo é fuga.
**Área visual:** precisa mostrar *modelo digital / tela de escaneamento*, não rosto sorrindo. A promessa é ver antes de decidir — a imagem tem que ser a prova disso. Foto de sorriso genérico contradiz a headline e reprova no gate visual.

---

## S2 — Espelho da dor · **Atenção**

**Precisa provar:** que a clínica conhece a experiência do paciente antes de falar de si mesma.

```
┌──────────────────────────────────────────┐
│  H2 — heading de reconhecimento          │
│  P  — 1 linha de conexão                 │
│                                          │
│  · bullet 1                              │  4 itens, texto curto,
│  · bullet 2                              │  sem ícone e sem card:
│  · bullet 3                              │  lista de fatos, não de features
│  · bullet 4                              │
│                                          │
│  P — frase-ponte para o mecanismo        │
└──────────────────────────────────────────┘
```

**Sem CTA.** Interromper o reconhecimento com botão quebra a seção.
**Sem ícones nos bullets.** Ícone transforma dor em feature. Marcador tipográfico simples.

---

## S3 — A virada · **Interesse**

**Precisa provar:** que existe diferença de método, não de simpatia.

```
┌──────────────────────────────────────────┐
│  H2 — "primeiro a imagem, depois a       │
│        decisão"                          │
│                                          │
│  ┌── ANTES ────┐   ┌── AGORA ─────────┐  │  contraste em 2 blocos,
│  │ caminho     │   │ escaneamento 3D  │  │  lado a lado só em desktop;
│  │ antigo      │   │ modelo na tela   │  │  empilhado no mobile,
│  └─────────────┘   └──────────────────┘  │  ANTES primeiro
│                                          │
│  P — frase de fecho                      │
└──────────────────────────────────────────┘
```

**Anotação de motion (Ciclo III):** se houver animação scroll-linked, é aqui — a transição visual entre "antes" e "agora" tem função narrativa. Dentro de `@supports`, respeitando `prefers-reduced-motion`, e nunca no caminho crítico.

---

## S4 — Como é a avaliação · **Interesse**

**Precisa provar:** que a consulta é previsível e sem armadilha comercial. É a seção que reduz o custo do clique.

```
┌──────────────────────────────────────────┐
│  H2                                      │
│                                          │
│  ①  passo 1 — título + 1 linha           │  numeração visível:
│  ②  passo 2 — título + 1 linha           │  a sequência é o argumento
│  ③  passo 3 — título + 1 linha           │
│  ④  passo 4 — título + 1 linha           │
│                                          │
│  P — "sem compromisso de fechar"         │  destaque tipográfico leve
└──────────────────────────────────────────┘
```

**Vertical, numerada, sem cards.** Timeline horizontal quebra no mobile e perde a ordem, que aqui é o conteúdo.

---

## S5 — Os dois caminhos · **Interesse**

**Precisa provar:** que a clínica separa os casos e diz o que cada tratamento **não** resolve.

```
┌──────────────────────────────────────────┐
│  H2                                      │
│  [ Implantes ] [ Lentes de porcelana ]   │  abas — implantes ativa por padrão
│  ┌──────────────────────────────────────┐│
│  │ Para quem                            ││
│  │ O que resolve                        ││
│  │ O que NÃO resolve   ← peso visual    ││
│  │ O que o escaneamento mostra antes    ││
│  └──────────────────────────────────────┘│
│                                          │
│  [ CTA SECUNDÁRIO — mesma ação ]         │  [TRACK] cta_meio
└──────────────────────────────────────────┘
```

**Abas, não colunas paralelas.** Colunas convidam à comparação entre tratamentos; a decisão não é essa — é de encaixe. O leitor escolhe a sua aba.
**Acessibilidade (herda para o Ciclo III):** as abas são a única interação real da página junto com o accordion do FAQ. Padrão de tablist com teclado; conteúdo das duas abas presente no HTML para SEO e para leitura sem JS.
**"O que NÃO resolve"** recebe o maior peso do bloco. É o diferencial de posicionamento — se o designer nivelar os quatro itens, a seção perde a função.

---

## S6 — Medo de ficar artificial · **Desejo**

**Precisa provar:** que o resultado é discutível antes de ser executado. Seção-assinatura da página.

```
┌──────────────────────────────────────────┐
│  H2                                      │
│  P — o resultado que ele não quer        │
│  P — por que acontece                    │
│  P — o que o modelo digital muda         │
│                                          │
│  [ ÁREA VISUAL — comparação de           │
│    formato/proporção no modelo digital ] │
└──────────────────────────────────────────┘
```

**A área visual não é antes/depois de paciente.** É visualização de plano — formato e proporção. Antes/depois com caso real é S9, e depende de autorização.
**Texto corrido, sem bullets.** O medo é narrativo; lista o dissolve.

---

## S7 — Quem vai atender · **Desejo**

**Precisa provar:** que existe um responsável com nome e registro.

```
┌──────────────────────────────────────────┐
│  [ FOTO do especialista ]  ┐             │  foto acima no mobile,
│  H2 nome                   │ pendência   │  à esquerda em desktop
│  titulação · CRO           ┘             │
│                                          │
│  ┌ nº de anos de experiência ┐           │  <!-- data-source: brief.md §4 -->
│  └ nº de sorrisos            ┘           │  <!-- data-source: brief.md §4 -->
│                                          │
│  " frase do especialista "               │
└──────────────────────────────────────────┘
```

**Os dois números são texto estático.** Sem contador animado — a política reprova contador sobre número, e o efeito pede atenção que a seção não precisa.
**Sem foto, a seção continua** com nome, CRO e frase. O que não existe é substituto de foto.

---

## S8 — O consultório · **Desejo**

**Precisa provar:** higiene, equipamento e conforto — por imagem. Copy é legenda.

```
┌──────────────────────────────────────────┐
│  H2                                      │
│  [ imagem 1 ][ imagem 2 ][ imagem 3 ]    │  faixa horizontal, scroll lateral
│                                          │  no mobile
│  cidade · endereço                       │
│  1 linha de legenda                      │
└──────────────────────────────────────────┘
```

**Seção inteiramente dependente de foto real.** Sem os arquivos, ela **não renderiza** — o texto sozinho não prova ambiente, e imagem de banco de imagens reprova no gate.

---

## S9 — Antes e depois · **Desejo** · SEÇÃO TRAVADA

**Precisa provar:** resultado real em paciente real desta clínica.

```
┌──────────────────────────────────────────┐
│  H2                                      │
│  ┌ antes ┬ depois ┐  caso 1 + legenda    │  par de imagens com divisória;
│  ┌ antes ┬ depois ┐  caso 2 + legenda    │  sem slider arrastável —
│  ┌ antes ┬ depois ┐  caso 3 + legenda    │  JS sem função de decisão
└──────────────────────────────────────────┘
```

**Estado atual: não renderiza.** Faltam imagens e autorização de uso. Nenhum caso ilustrativo, simulação ou imagem de banco ocupa este espaço.

---

## S10 — Depoimentos em vídeo · **Desejo** · SEÇÃO TRAVADA

**Precisa provar:** que outras pessoas com a mesma dor passaram por isso e falam a respeito.

```
┌──────────────────────────────────────────┐
│  H2                                      │
│  [ vídeo 1 ][ vídeo 2 ][ vídeo 3 ]       │  poster estático, play sob clique
│  nome · tratamento (por vídeo)           │  nenhum autoplay
└──────────────────────────────────────────┘
```

**Estado atual: não renderiza.** Faltam arquivos e autorização. **Nenhum depoimento é escrito pela fábrica**, nem como exemplo de formato.
**Quando renderizar:** vídeo nunca é elemento LCP; carregamento sob interação, com poster.

---

## S11 — FAQ · **Ação**

**Precisa provar:** que as duas objeções que travam o agendamento — dor e tempo de recuperação — foram enfrentadas de frente.

```
┌──────────────────────────────────────────┐
│  H2                                      │
│  ▼ 1. Vou sentir dor?          ← ABERTA  │  nasce expandida
│  ▶ 2. Quanto tempo até voltar à rotina?  │
│  ▶ 3. Vou ficar sem dente?               │
│  ▶ 4. Lente estraga o dente?             │
│  ▶ 5. Quantas consultas?                 │
│  ▶ 6. Preciso decidir na hora?           │
│  ▶ 7. Quanto custa?                      │
└──────────────────────────────────────────┘
```

**Ordem é argumento:** dor → tempo → provisório → integridade do dente → esforço → compromisso → preço. Sobe da objeção física para a comercial. Preço por último, porque só faz sentido depois que o risco caiu.
**Pergunta 1 nasce aberta:** é a objeção principal do público; escondê-la atrás de um clique é jogar contra a própria seção.
**Accordion nativo** (`<details>`/`<summary>` ou equivalente acessível), conteúdo no HTML — exigência do `FAQPage` schema (RF6) e de leitura sem JS.
**[TRACK]** abertura de cada item — quais objeções o tráfego abre é o dado mais útil desta página.

---

## S12 — CTA final · **Ação**

**Precisa provar:** que o próximo passo é único, claro e de baixo risco — e por que agora.

```
┌──────────────────────────────────────────┐
│  H2 — repete a oferta, não a headline    │
│  P  — o que a consulta entrega (1 linha) │
│  P  — condição da semana + data-limite   │
│                                          │
│  [ CTA PRIMÁRIO — largura total ]        │  [TRACK] cta_final
│  horário · cidade                        │
└──────────────────────────────────────────┘
```

**Bloco visualmente encerrado.** Depois dele, só rodapé — nenhum conteúdo novo compete com o clique.
**Sem contador regressivo.** Não há data-limite fornecida e relógio artificial contradiz o tom da página.

---

## S13 — Rodapé

```
┌──────────────────────────────────────────┐
│  nome · endereço · cidade                │
│  responsável técnico · CRO               │
│  contato · horário                       │
│  ── aviso de página de demonstração ──   │
└──────────────────────────────────────────┘
```

Baixo contraste, sem links de navegação. Identificação e responsável técnico são obrigação de uma página real de clínica — ficam aqui, não no hero.

---

## Sequência de leitura (checagem final)

| Ordem | Seção | Pergunta que o visitante faz | Onde ela é respondida |
|---|---|---|---|
| 1 | S1 | "Isso é sobre o quê?" | Headline + oferta nomeada |
| 2 | S2 | "Isso é sobre mim?" | Bullets de dor na linguagem dele |
| 3 | S3 | "O que muda aqui?" | Contraste de método |
| 4 | S4 | "O que vai acontecer comigo?" | Os 4 passos |
| 5 | S5 | "Qual é o meu caso?" | Abas + "o que não resolve" |
| 6 | S6 | "Vai ficar falso?" | Decisão de formato antes da execução |
| 7 | S7 | "Quem faz?" | Nome, CRO, números com fonte |
| 8 | S8 | "Onde?" | Fotos do consultório |
| 9 | S9–S10 | "Funcionou com outra pessoa?" | **Sem resposta hoje — pendência do cliente** |
| 10 | S11 | "Vai doer? Quanto tempo eu paro?" | FAQ |
| 11 | S12 | "E agora?" | CTA único |

**Buraco conhecido:** o degrau 9 é o único da sequência sem resposta. É prova social, e prova social não se fabrica. Enquanto o material não chega, S6 e S7 carregam o peso do desejo — e a página tem CTA suficiente antes do degrau para não depender dele.
