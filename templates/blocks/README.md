# Biblioteca de blocos

Cada landing page entregue devolve para cá as seções reaproveitáveis, com screenshot de
referência. É o que faz a qualidade média subir com o volume — a quarta LP de um nicho começa
muito melhor que a primeira.

Estrutura de cada bloco:
```
<nome>/
  bloco.astro       markup, só classes do tema
  README.md         para que serve, quando usar, quando não usar
  referencia.png    screenshot
```
Um bloco não carrega cor literal nem copy do cliente de origem.

## Blocos disponíveis

| bloco | o que é | JS |
|---|---|---|
| `pendencia` | O material que o cliente não entregou, exibido como falta. | 0 |
| `orientador` | 2–4 perguntas de múltipla escolha que revelam um resultado já escrito. | ~0,6 KB gzip |
| `lista-definicoes` | Termo + explicação, ordenada (etapas) ou não (verbetes). | 0 |
| `faq` | Perguntas e respostas abertas, com `FAQPage` opcional. | 0 |

## Regra de promoção

Um componente de cliente vira bloco quando o que ele carrega é **estrutura ou comportamento**
que sobrevive fora do nicho de origem. Não promova o que só existe por causa do motivo gráfico
de uma direção visual: sem o motivo, ele vira um `grid` de duas colunas com nome bonito, e
biblioteca inchada é pior que biblioteca pequena.

## Contrato de tokens

Qualquer direção visual futura precisa declarar os tokens abaixo para que a biblioteca inteira
funcione. Os **obrigatórios** não têm fallback: faltando, o bloco perde borda ou cor — a falha
é visível de propósito, e não silenciosa.

### Obrigatórios — papéis de cor (`src/styles/semantica.css`)

| token | papel |
|---|---|
| `--color-conteudo` | texto corrente |
| `--color-conteudo-suave` | texto secundário e contorno de controle |
| `--color-acento` | cor de ação e de estado escolhido |
| `--color-acento-conteudo` | texto sobre o acento preenchido |
| `--color-fio` | filete decorativo de separação (1px) |

### Opcionais — com fallback declarado dentro de cada bloco

| token | fallback | papel |
|---|---|---|
| `--color-superficie-alt` | `transparent` | fundo de bloco destacado |
| `--color-anotacao` | `--color-conteudo-suave` | marca de margem: selo, numeral, rótulo |
| `--color-foco` | `--color-acento` | anel de foco |
| `--font-titulo` | `inherit` | títulos, numerais e marcadores |
| `--alvo-toque` | `44px` | altura mínima de controle (WCAG 2.5.8). Nunca declare abaixo de 44px. |
| `--spacing-fio` | `1px` | espessura do filete |
| `--spacing-chamada` | `0.5rem` | intervalo curto (título → texto) |
| `--spacing-entre-linhas-bloco` | `1.25rem` | intervalo médio, dentro do bloco |
| `--spacing-interno` | `2rem` | respiro interno |
| `--spacing-entre-blocos` | `3.5rem` | distância entre blocos |
| `--radius-controle` | `0` | raio de controle interativo |
| `--radius-pendencia` | `0` | raio próprio do bloco de pendência |
| `--traco-pendencia` | `dashed` | estilo de borda que sinaliza informação incompleta |
| `--medida` | `34em` | medida de linha |

Os `--spacing-*` e `--radius-*` são emitidos por `scripts/tokens-to-theme.mjs` a partir das
chaves de `espacamento` e `raio` do `tokens.json` — declarar o contrato é escrever a chave lá,
não escrever CSS à mão. `--medida` e `--alvo-toque` não são emitidos pelo gerador: eles vivem na
camada de sistema do cliente.

## O que os blocos deliberadamente não trazem

- **Motivo gráfico.** Fio de margem, recorte, textura e assinatura de traço são da direção
  visual, não da fábrica. O bloco entrega estrutura e comportamento; a personalidade vem do
  tema, e a política anti-slop continua exigindo um motivo próprio por cliente.
- **Cor literal.** Nenhum hex, nenhum `rgb()`, nenhum gradiente.
- **Copy.** Todo texto entra por prop, inclusive rótulos de interface e mensagens de estado.
- **Heading de seção.** Nenhum bloco emite o título da seção em que vive, e os que emitem
  headings internos recebem o nível por prop (`nivelTitulo`), para não abrir salto na árvore.

## Acessibilidade que veio junto

Os blocos foram auditados em produção. Ao editar, preserve: alvo de toque de 44px, região
`aria-live` que nunca esvazia, `fieldset`/`legend` por grupo de opções, foco visível também
depois de clique de ponteiro, `prefers-reduced-motion` em toda transição, e árvore de títulos
sem salto. Cada README repete o que é inegociável no bloco dele.
