# faq

Perguntas e respostas curtas, todas abertas, com zero JS. Emite `FAQPage` opcionalmente.

## Para que serve

Responder as objeções que sobraram depois do corpo da página, no formato que a pessoa já
espera. Duas decisões estão embutidas:

1. **Sem accordion.** Esconder resposta curta atrás de um clique custa JS para piorar a
   leitura, quebrar o Ctrl+F e atrapalhar a indexação. Se as respostas são longas demais para
   ficarem abertas, o problema é o tamanho das respostas.
2. **Uma fonte de verdade.** Com `schema`, o JSON-LD `FAQPage` é gerado da mesma lista que
   pinta a tela — o dado estruturado não tem como divergir do texto visível, que é a causa
   comum de penalização de rich result. JSON-LD não é JS de aplicação e não consome o
   orçamento de JS do nível.

## Quando usar

- 4 a 8 perguntas reais, vindas do que o cliente ouve, não inventadas para preencher a seção.
- Respostas de uma a quatro linhas.
- Ao final da página, depois do conteúdo que constrói o argumento.

## Quando NÃO usar

- **Como depósito de conteúdo que não coube.** Se a informação é central, ela é seção, não FAQ.
- **Com pergunta que ninguém faz.** "Por que escolher a nossa empresa?" não é dúvida, é anúncio
  fantasiado de pergunta — e cai no léxico anti-slop.
- **Com resposta longa.** Acima de ~4 linhas por resposta, a página fica um paredão; prefira
  seção própria ou artigo.
- **Para termo + explicação.** Isso é `lista-definicoes`. Este bloco é só para o que é
  literalmente uma pergunta.
- **Com `schema` em mais de um FAQ na mesma página.** Dois `FAQPage` no mesmo documento é erro
  de dado estruturado.
- **Com `schema` se a página já emite o `FAQPage` por conta própria.** Escolha um dos dois.
- **Para respostas que mudam por caso.** Se a resposta depende da situação de quem lê, o bloco
  certo é `orientador`.

## Props

| prop | tipo | padrão | o que faz |
|---|---|---|---|
| `itens` | `{ pergunta, resposta }[]` | — | Conteúdo. |
| `schema` | `boolean` | `false` | Emite `<script type="application/ld+json">` com `FAQPage`. Uma vez por página. |
| `nivelTitulo` | `2 \| 3 \| 4 \| 5` | `3` | Nível do heading de cada pergunta. |
| `classe` | `string` | `''` | Classe extra na raiz. |

**`nivelTitulo` é obrigação de quem monta a página.** O padrão `3` supõe um `h2` de seção logo
acima ("Perguntas frequentes"). Salto de nível reprova no gate de acessibilidade.

O texto de `resposta` é escapado por Astro na tela; no schema, todo `<` é convertido para a
sua forma escapada em JSON, então texto vindo do brief não consegue fechar o `<script>` do
JSON-LD.
O bloco não aceita marcação dentro da resposta, e isso é deliberado — se a resposta precisa de
lista ou link, ela é longa demais para um FAQ.

## Dependências de token

Obrigatórios: `--color-conteudo-suave`, `--color-fio`.

Opcionais (com fallback no bloco):

| token | fallback | papel |
|---|---|---|
| `--font-titulo` | `inherit` | pergunta |
| `--spacing-fio` | `1px` | espessura do filete entre itens |
| `--spacing-interno` | `2rem` | respiro vertical de cada item |
| `--spacing-chamada` | `0.5rem` | intervalo entre pergunta e resposta |
| `--medida` | `34em` | medida de linha da resposta |

A cor da pergunta é herdada — o bloco não a declara, para seguir a cor de conteúdo do contexto.
