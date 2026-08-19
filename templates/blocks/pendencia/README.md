# pendencia

Caixa que declara, na própria página, a informação que o cliente ainda não entregou.

## Para que serve

Dar forma visível à regra de integridade da fábrica: prova social, número, selo, foto,
endereço e canal de contato só existem se vierem do `brief.md`. Quando não vieram, a seção
não é preenchida com ficção — ela é substituída por este bloco, que nomeia o que falta e de
quem é a falta. A ausência fica auditável pelo cliente em vez de virar texto plausível.

## Quando usar

- Seção prevista na estrutura da página cujo material o cliente não mandou (equipe, endereço,
  depoimento, certificação, número de atendimentos).
- Página publicada como piloto ou demonstração, antes do material definitivo.
- Lista de itens que o cliente precisa devolver para a próxima rodada — use `itens`.

## Quando NÃO usar

- **Como caixa de destaque, aviso legal, "nota importante" ou call-out genérico.** O bloco
  significa uma coisa só: informação faltando. Usá-lo como ornamento apaga o sinal.
- **Para esconder uma decisão de escopo.** Se a seção foi cortada, corte a seção; pendência
  não é lixeira de conteúdo que ninguém quis escrever.
- **Em página de produção já completa.** Pendência visível é aceitável em piloto e em entrega
  parcial acordada; numa página final ela vira sinal de trabalho inacabado para o visitante.
- **Para conteúdo que existe mas está feio.** Isso é revisão de copy, não pendência.
- **Mais de duas por página.** Três blocos de pendência dizem que a página não deveria ter ido
  ao ar ainda.

## Props

| prop | tipo | padrão | o que faz |
|---|---|---|---|
| `selo` | `string` | `'Pendência do cliente'` | Rótulo em versalete no topo. Diga de quem é a pendência. |
| `itens` | `string[]` | `[]` | Lista do que falta. Renderiza abaixo do slot; vazia, não renderiza nada. |
| `classe` | `string` | `''` | Classe extra na raiz, para o tema posicionar o bloco. |

O texto corrido entra pelo slot padrão (`<p>` em diante). O bloco estiliza `p` do slot via
`:global()`, e não emite nenhum heading — pode ser inserido em qualquer profundidade sem
abrir buraco na árvore de títulos.

## Dependências de token

Obrigatórios (sem fallback — faltando, a borda some; a falha é visível de propósito):

- `--color-conteudo` — texto do slot
- `--color-conteudo-suave` — itens da lista
- `--color-fio` — filete à esquerda de cada item

Opcionais (com fallback declarado no bloco):

| token | fallback | papel |
|---|---|---|
| `--color-anotacao` | `--color-conteudo-suave` | cor do selo e da borda; papel de "marca de margem" |
| `--color-superficie-alt` | `transparent` | fundo da caixa |
| `--spacing-fio` | `1px` | espessura do filete |
| `--spacing-interno` | `2rem` | respiro interno |
| `--spacing-entre-linhas-bloco` | `1.25rem` | intervalo entre selo, texto e lista |
| `--medida` | `34em` | medida de linha do texto do slot |
| `--radius-pendencia` | `0` | raio próprio, se a direção visual quiser um recorte |
| `--traco-pendencia` | `dashed` | estilo da borda; o tracejado é o sinal semântico de incompleto |
