# lista-definicoes

Termo + explicação, um item por linha, com filete à esquerda. Ordenada ou não.

## Para que serve

A forma editorial de verbete: um rótulo curto e uma explicação de uma a três linhas.
Serve duas coisas com a mesma estrutura, escolhidas por `ordenada`:

- **ordenada** (`<ol>`): etapas de um processo, com o numeral em coluna própria;
- **não ordenada** (`<ul>`): serviços conexos, critérios, glossário, o que está incluído.

A leitura é vertical de propósito. É a alternativa direta ao reflexo de transformar toda
lista de três itens em três cartões com ícone — composição que a política anti-slop persegue.

## Quando usar

- Entre 3 e 8 itens de peso equivalente.
- Quando cada item tem nome próprio e uma explicação curta.
- Quando a ordem é real (use `ordenada`) ou claramente irrelevante (não use).

## Quando NÃO usar

- **Para pares pergunta/resposta.** Isso é o bloco `faq`, que também alimenta o schema
  `FAQPage`. Duplicar aqui gera dado estruturado divergente da tela.
- **Para comparar duas ou três opções entre si.** Lista sugere itens complementares, não
  alternativas excludentes; quem compara precisa ver lado a lado.
- **Para itens sem explicação.** Só termos? É uma lista simples, não precisa deste bloco.
- **Como grade de features com ícone.** O bloco não tem slot de mídia e não deve ganhar um.
- **Acima de ~8 itens.** Vira índice; quebre em seções ou paginação de conteúdo.
- **Para numerar o que não tem ordem.** `ordenada` promete sequência; usá-la por estética faz
  a página mentir sobre o processo.

## Props

| prop | tipo | padrão | o que faz |
|---|---|---|---|
| `itens` | `{ termo, texto }[]` | — | Conteúdo. Um item por linha. |
| `ordenada` | `boolean` | `false` | `<ol>` + numeral `01, 02…`. Só quando a ordem for real. |
| `nivelTitulo` | `2 \| 3 \| 4 \| 5` | `3` | Nível do heading de cada termo. |
| `classe` | `string` | `''` | Classe extra na raiz. |

**`nivelTitulo` é obrigação de quem monta a página, não detalhe estético.** O padrão `3` supõe
um `h2` de seção logo acima. Se o bloco entrar direto sob o `h1`, use `2`; se estiver aninhado
sob um `h3`, use `4`. Salto de nível reprova no gate de acessibilidade.

## Dependências de token

Obrigatórios: `--color-conteudo-suave`, `--color-fio`.

Opcionais (com fallback no bloco):

| token | fallback | papel |
|---|---|---|
| `--color-anotacao` | `--color-conteudo-suave` | numeral da etapa |
| `--font-titulo` | `inherit` | termo e numeral |
| `--spacing-fio` | `1px` | espessura do filete |
| `--spacing-interno` | `2rem` | respiro vertical e recuo do texto |
| `--spacing-chamada` | `0.5rem` | intervalo entre termo e explicação, e coluna do numeral |
| `--medida` | `34em` | medida de linha da explicação |

A cor do termo é herdada — o bloco não a declara, para que o texto siga a cor de conteúdo do
contexto em que for inserido.
