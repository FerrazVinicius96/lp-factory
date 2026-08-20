# Product

<!-- impeccable:product-schema 1 -->

> **Origem dos fatos.** Este registro foi escrito sem rodada de perguntas ao usuário: nesta sessão o
> `lp-designer` não dispõe de ferramenta de pergunta estruturada nem de página de decisão, e o
> `context.mjs` da skill exige que a substituição seja declarada. Todo fato abaixo vem de
> `brief.md`, `PROJECT.md`, `copy.md` e `wireframe.md` deste cliente, já aprovados pelo usuário no
> Ciclo I. Nada foi inferido além do que esses arquivos declaram; onde o brief cala, o campo está
> marcado como **[em aberto]** e não foi preenchido.

## Platform

web

## Stack

Astro 7 + Tailwind v4, sem React por padrão — decisão permanente da fábrica (`CLAUDE.md`), não deste
cliente. O protótipo do Ciclo II é HTML+CSS estático e autocontido, para que o Ciclo III o traduza em
componentes Astro sem interpretar nada.

## Users

Homens e mulheres de 30 a 55 anos, classes A e B, que valorizam estética e status social
<!-- brief.md §2 -->. Chegam por tráfego frio (o CTA único é WhatsApp, não há navegação na página),
em geral no celular, depois de anos adiando a consulta.

A cena real: a pessoa cobre a boca com a mão na hora da foto, mastiga de um lado só há tanto tempo
que virou jeito de comer, e escolhe o prato pelo que dá para morder. Já foi tratada como lead antes
e reconhece script de vendas <!-- copy.md §0 -->. Duas coisas travam a decisão, nesta ordem: medo da
dor e do tempo parado; e medo de sair com sorriso artificial — "dente de piano", branco demais.

O trabalho que ela está fazendo na página não é escolher tratamento. É decidir se vale gastar uma
tarde para descobrir o que dá para fazer com a própria boca.

## Product Purpose

Landing page única de captação de lead para clínica de odontologia estética e reabilitação oral, com
foco em implantes dentários e lentes de contato em porcelana. A oferta que a página vende **não é o
tratamento**: é uma avaliação especializada com escaneamento 3D digital, sem compromisso de fechar
tratamento <!-- brief.md §1 -->.

Sucesso = um clique no botão de WhatsApp com mensagem pré-programada de agendamento. Não há segundo
caminho de conversão, formulário alternativo ou menu de navegação.

## Positioning

**Você vê o seu caso planejado em imagem antes de decidir qualquer coisa.**

O escaneamento intraoral inverte a ordem do setor: primeiro a imagem, depois a decisão, só então o
procedimento. O concorrente médio do nicho promete o resultado ("sorriso perfeito", "tratamento
indolor") e entrega a imagem só depois que já não dá para voltar atrás. Esta clínica entrega o
modelo digital na mesma consulta e o plano por escrito na mão do paciente, que decide fora da
cadeira <!-- copy.md §0, S3, S4 -->.

Duas promessas concorrentes foram deliberadamente descartadas no Ciclo I e não voltam: "tratamento
indolor" (headline padrão do nicho; rebaixada a tratamento de objeção no FAQ) e "volte a mastigar
dos dois lados" (atende só o público de implante). Registrado em `PROJECT.md` §5.

## Operating Context

A avaliação tem quatro etapas declaradas <!-- copy.md S4 -->: conversa nas palavras do paciente;
escaneamento 3D com scanner intraoral, sem massa de moldagem; leitura do modelo na tela junto com o
profissional; plano por escrito entregue em mãos, com etapas, sequência e tempo estimado.

Os dois caminhos de tratamento são separados por encaixe de caso, não comparados como produtos:
implante resolve a raiz e a distribuição da mordida; lente de porcelana resolve a face visível do
dente. Cada um tem um "o que **não** resolve" declarado, e esse bloco carrega o maior peso da seção
<!-- copy.md S5, wireframe.md S5 -->.

## Capabilities and Constraints

- **Nível de entrega: avançado** (`tier`). Orçamento de JS de aplicação ≤ 60 KB gzip por rota; tema
  claro/escuro **obrigatório** com tokens semânticos; motion permitido inclui scroll-linked,
  parallax e scroll-zoom em CSS, dentro de `@supports` e respeitando `prefers-reduced-motion`.
- **Interação real na página: duas, e só duas** — abas em S5 (padrão tablist acessível, conteúdo das
  duas abas no HTML) e accordion em S11 (nativo, pergunta 1 nasce aberta). Nada mais justifica JS.
- **LCP é o bloco de headline de S1.** Nenhum vídeo, imagem ou animação de entrada disputa esse slot
  <!-- wireframe.md -->.
- **Coluna única do início ao fim, inclusive em desktop.** A página é uma leitura sequencial de
  argumento em AIDA; grade de cards competiria com a ordem <!-- wireframe.md -->.
- **Sem menu de navegação.** Objetivo único; link no topo é fuga.
- **CTA aparece 3 vezes** (hero, fim de S5, fecho S12) mais um botão flutuante no mobile ativado
  após o fim de S2. Destino e texto únicos para todos.
- **Página nunca é indexada** enquanto for piloto: `noindex, nofollow` e faixa de aviso de
  demonstração (RF11).
- **Sem camada de conformidade CFO neste ciclo** — decisão explícita do cliente para o piloto
  técnico, com reavaliação obrigatória antes de qualquer publicação real <!-- PROJECT.md §7 -->.

Vocabulário que a página usa: o paciente diz "cobrir a boca com a mão", não "reabilitação oral". A
copy adota a segunda linguagem e o design não deve reintroduzir a primeira em rótulo ou legenda.

## Brand Commitments

- **Paleta declarada pelo cliente: Azul Marinho, Branco Gelo, detalhes em Dourado** <!-- brief.md §4 -->.
  É restrição de marca, não sugestão. Vinculante para qualquer direção visual.
- **Estilo declarado: premium e minimalista, muito white space, tipografia sem serifa elegante e
  moderna** <!-- brief.md §5 -->. Vinculante.
- **Atmosfera: rigor de clínica de alto padrão — higiene, tecnologia, conforto — sem parecer
  ambiente hospitalar frio** <!-- brief.md §5 -->.
- **Identificação real ausente por decisão de escopo.** Nome fantasia, especialista, CRO, endereço,
  cidade, horário e WhatsApp permanecem como `{{...}}` e **não podem ser substituídos por versão
  "realista"** — o risco declarado é confusão com clínica real <!-- PROJECT.md §5 -->.
- **Logotipo:** existe em SVG do lado do cliente, descrito mas não entregue (`{{LOGO_SVG}}`). O
  espaço da marca é reservado, não preenchido com marca inventada.

## Evidence on Hand

Existe hoje:
- Dois números de autoridade, declarados no brief e com `data-source` apontando para ele: "+ de 15
  anos de experiência clínica" e "+ de 5.000 sorrisos transformados" <!-- brief.md §4 -->. São texto
  estático — contador animado sobre número reprova na política.
- Copy final em 3 passes, com 13 seções mapeadas (10 publicáveis).

**Não existe, e não pode ser fabricado:**
- Fotos reais do consultório, do especialista e de antes/depois — descritas no brief, arquivos não
  entregues. Sem elas, **S8 e S9 não renderizam**.
- Os 3 vídeos de depoimento e as autorizações de uso — sem eles, **S10 não renderiza**.
- Protocolo de anestesia, conduta pós-operatória, tempo de retorno à rotina, política de provisório
  e de desgaste, condição comercial da semana e data-limite — todos são afirmação clínica ou
  comercial sobre esta clínica específica. A fábrica escreveu a estrutura do argumento; o conteúdo
  factual é pendência do cliente.
- Qualquer valor, percentual ou desconto. O brief não traz número e nenhum será inventado.

Imagem gerada por IA nesta entrega serve como **apoio de composição** (textura, elemento abstrato) e
nunca como substituta de ativo real pendente, nem retrata pessoa identificável, nem simula registro
documental de atendimento que não ocorreu.

## Product Principles

1. **A imagem antes da decisão é o produto.** Toda seção, todo elemento visual e todo motion existe
   para tornar essa inversão de ordem visível. Um recurso que não sirva a isso é ornamento.
2. **O que a clínica não resolve tem tanto peso quanto o que resolve.** É o que separa a página do
   concorrente médio; nivelar os quatro itens de S5 destrói a seção.
3. **Ausência é declarada, nunca preenchida.** Seção sem material do cliente não renderiza e não
   ganha substituto ilustrativo. A pendência é informação, não buraco.
4. **O leitor já reconhece script de vendas.** Urgência artificial, contador regressivo, selo
   inventado e superlativo empilhado custam mais confiança do que compram cliques.
5. **Uma promessa central, três CTAs idênticos, um destino.** Qualquer caminho alternativo divide o
   clique e sai da página.

## Accessibility & Inclusion

- WCAG AA verificado para corpo de texto e CTA nos dois temas (claro e escuro), exigência do gate.
- As duas interações (abas e accordion) precisam funcionar por teclado e ter conteúdo presente no
  HTML — exigência simultânea de acessibilidade e do schema `FAQPage`.
- `prefers-reduced-motion` respeitado em toda animação; nenhuma informação existe só no movimento.
- Público de 30 a 55 anos lendo texto longo no celular: medida de leitura e tamanho de corpo são
  decisão de acessibilidade antes de serem decisão estética.
