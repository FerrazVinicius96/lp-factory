# orientador

Duas a quatro perguntas de múltipla escolha que revelam um resultado **já escrito no HTML**.

## Para que serve

A pessoa chega à página sem saber em qual caso ela se encaixa. Em vez de um texto que tenta
cobrir todos os cenários de uma vez, o bloco pergunta o mínimo e mostra o trecho que é dela.
Todos os resultados existem no HTML desde a primeira pintura: o script só decide qual fica
visível. Sem JS, a página mostra todos — não quebra, não fica vazia, não perde conteúdo.

Casos típicos: qual modalidade de um serviço se aplica, qual etapa vem primeiro, qual
documentação preparar, qual plano corresponde ao uso descrito.

## Quando usar

- Quando as saídas são **poucas, fechadas e escritas por gente** — 3 a 6 resultados.
- Quando a resposta muda de verdade conforme as respostas. Se todo mundo chega ao mesmo
  texto, use um parágrafo.
- Quando o valor está em reduzir leitura, não em capturar dado.

## Quando NÃO usar

- **Como formulário disfarçado.** O bloco não envia, não guarda e não identifica ninguém. Se o
  objetivo é gerar lead, use um formulário e diga que é um formulário.
- **Como calculadora, simulador de preço ou estimador de prazo.** Ele só revela texto fixo.
  Número que sai daqui é número inventado — reprovação de integridade.
- **Com mais de ~4 perguntas ou mais de ~8 resultados.** A matriz de regras vira ilegível e o
  HTML carrega todos os resultados sempre. Acima disso, o problema é uma página por caso.
- **Como triagem de caso concreto em nicho regulado.** Em advocacia, saúde e finanças, o
  resultado tem de descrever o caminho típico, nunca avaliar a situação de quem responde.
- **No nível básico.** Ele é a ilha de JS da página; o orçamento básico é 0 KB.
- **Acima da dobra como elemento principal.** Interação obrigatória antes de qualquer conteúdo
  é uma barreira, não uma ajuda.

## Orçamento de JS

Ilha vanilla, sem framework, **607 B gzip** (1 248 B brutos, medido no build). Ela consome parte do orçamento de JS de
aplicação do nível (intermediário 15 KB, avançado 60 KB por rota — `plugin/config/tiers.json`).
Contabilize antes de somar outra ilha na mesma rota. Não a converta em componente de framework:
o custo dobraria de ordem de grandeza para o mesmo comportamento.

## Props

| prop | tipo | padrão | o que faz |
|---|---|---|---|
| `perguntas` | `Pergunta[]` | — | `{ nome, texto, marcador?, opcoes: [{ valor, texto }] }`. `nome` é a chave usada nas regras. `marcador` é decorativo (`aria-hidden`). |
| `resultados` | `Resultado[]` | — | `{ chave, termo, texto, quando? }`. Ordem importa: vence o **primeiro** que casa. |
| `complementos` | `Complemento[]` | `[]` | `{ texto, quando? }`. Lista secundária filtrada pelas mesmas respostas. |
| `tituloComplementos` | `string` | `'O que preparar'` | Rótulo da lista secundária. |
| `rotuloTodos` | `string` | `'Resultados possíveis'` | Rótulo visível apenas sem JS. |
| `rotuloEscolhido` | `string` | `'Seu resultado'` | Rótulo do resultado selecionado. |
| `textoPendente` | `string` | `'Responda a todas as perguntas…'` | Mensagem enquanto faltam respostas. |
| `textoSemCombinacao` | `string` | `'Essa combinação…'` | Rede de segurança quando nenhuma regra casa. |
| `textoLimpar` | `string` | `'Limpar respostas'` | Rótulo do botão de reinício. |
| `aviso` | `string` | `''` | Limite de escopo ao final. Diga o que o bloco **não** responde. |
| `id` | `string` | `'orientador'` | Prefixo dos `name` dos radios. Troque se houver dois na mesma página. |

### Regras (`quando`)

Mapa `nome da pergunta → valor aceito` (string ou array). Um resultado casa quando **todas** as
chaves declaradas batem; chave omitida significa "qualquer resposta". Omitir `quando` inteiro
faz o resultado pegar tudo — deixe esse por último, como saída padrão.

```astro
<Orientador
  perguntas={[
    { nome: 'porte', marcador: '01', texto: 'Quantas pessoas usam?', opcoes: [
      { valor: 'pouco', texto: 'Até 5' }, { valor: 'muito', texto: 'Mais de 5' } ] },
    { nome: 'prazo', marcador: '02', texto: 'Precisa começar quando?', opcoes: [
      { valor: 'ja', texto: 'Este mês' }, { valor: 'depois', texto: 'Sem data' } ] },
  ]}
  resultados={[
    { chave: 'expresso', termo: 'Implantação assistida', texto: '…',
      quando: { porte: 'pouco', prazo: 'ja' } },
    { chave: 'projeto', termo: 'Projeto acompanhado', texto: '…',
      quando: { porte: 'muito' } },
    { chave: 'padrao', termo: 'Caminho comum', texto: '…' },
  ]}
  complementos={[
    { texto: 'Lista de pessoas que vão usar', quando: { porte: 'muito' } },
    { texto: 'Contrato atual, se houver' },
  ]}
  aviso="Este roteiro descreve o caminho comum. Ele não estima prazo nem valor."
/>
```

## Comportamento que não pode se perder

Auditado em três rodadas. Alterações no bloco precisam preservar:

- `fieldset`/`legend` por pergunta, radios nativos (setas do teclado funcionam de graça);
- alvo de toque de 44px em cada opção (`--alvo-toque`, WCAG 2.5.8);
- radio recortado a 1px, **nunca** `display:none`, com o anel de foco no rótulo via `:focus`
  (não `:focus-visible` — depois de clique de ponteiro ele não casaria, e o foco devolvido por
  JS ao limpar as respostas ficaria invisível);
- estado escolhido marcado por preenchimento **e** borda, não só por cor;
- região viva que nunca esvazia — sempre há pendente, resultado ou aviso de combinação;
- `role="status"` + `aria-live="polite"` aplicados por JS **depois** da primeira pintura, para
  que o estado inicial não seja anunciado no carregamento;
- nenhum heading no bloco: ele entra em qualquer profundidade sem quebrar a árvore de títulos;
- transições dentro de `@media (prefers-reduced-motion: no-preference)`.

## Dependências de token

Obrigatórios: `--color-conteudo`, `--color-conteudo-suave`, `--color-acento`,
`--color-acento-conteudo`, `--color-fio`.

Opcionais (com fallback no bloco):

| token | fallback | papel |
|---|---|---|
| `--color-foco` | `--color-acento` | anel de foco |
| `--color-anotacao` | `--color-conteudo-suave` | marcador da pergunta e rótulos |
| `--font-titulo` | `inherit` | marcador numérico da pergunta |
| `--alvo-toque` | `44px` | altura mínima dos controles — se declarar, nunca abaixo de 44px |
| `--spacing-fio` | `1px` | espessura dos filetes |
| `--spacing-interno` | `2rem` | respiro interno e coluna do enunciado |
| `--spacing-entre-linhas-bloco` | `1.25rem` | intervalos curtos |
| `--spacing-entre-blocos` | `3.5rem` | distância até o aviso final |
| `--radius-controle` | `0` | raio das opções e do botão |
| `--medida` | `34em` | medida de linha dos textos longos |
