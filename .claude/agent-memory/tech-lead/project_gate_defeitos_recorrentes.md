---
name: gate-defeitos-recorrentes
description: Defeitos que os scripts de gate nao pegam e que ja reprovaram entrega — contagem de secoes chegou a 4 ocorrencias (limite 3 estourado): script obrigatorio, varrendo .html do proto tambem
metadata:
  type: project
---

Contagem de reincidência dos defeitos que só o julgamento qualitativo pega. Regra da fábrica: defeito que
aparece 3 vezes vira regra de script ou de `CLAUDE.md`.

| Defeito | Vezes | Onde |
|---|---|---|
| **Contagem de seções divergente entre documentos e código** | **4 — LIMITE ESTOURADO, script continua obrigatório** | `clinica-piloto-odonto` 1ª a 4ª rodada. Sempre declarado corrigido, nunca corrigido por inteiro. Na 4ª sobreviveu em `proto/direcao-b.html:723` — arquivo `.html`, fora do escopo `.md` da varredura de quem corrigiu. **Fechado na 5ª rodada (2026-08-20)** por varredura minha, diretório inteiro, sem filtro de extensão e com padrão largo (`\d+\s*(seç|publicáve|travad|componentes)`), não pelo literal `11` |
| **Feature declarada pronta que não funciona no build** (fonte válido, artefato quebrado) | 1 | `clinica-piloto-odonto` 2ª rodada — `.barra-acao` e `.malha` mortas no Chrome pelo shorthand `animation` remontado pelo minificador. **Corrigido e verificado na 3ª rodada** |
| Camada decorativa cruzando texto, com contraste calculado só para o traço mais fraco | 1 | `clinica-piloto-odonto` — `.malha-crista` dourado sobre `.marca`/`.hero__sub`/`.regua`. **Corrigido e reverificado na 3ª rodada com a malha finalmente visível** (0 colisões em 9 larguras, folga 38px acima de 1200px) |
| Número renderizado sem critério derivável (contador de HUD hardcoded) | 1 | `clinica-piloto-odonto` — rodapé "Leituras completas". **Corrigido** |
| Comentário no código afirmando comportamento que o código não tem | 1 | `clinica-piloto-odonto` — `AbasTratamento`, `semantica.css`. **Corrigido** |
| Texto que não cabe na própria caixa e é cortado sem ninguém ver | 1 | `clinica-piloto-odonto` — `.fig-rotulo`. **Corrigido**: `viewBox` 182 → 198, folga 2,8u com a webfont e 15,7u com fallback |
| `white-space: nowrap` em token de placeholder longo | 1 | `clinica-piloto-odonto` — `.sem-dado` a 320px. **Corrigido** com `h1/h2 .sem-dado { white-space: normal }` |

## Regra que nasceu daqui — contagem de seções (4/3)

**Já é para virar script, não julgamento.** Em quatro rodadas o defeito sobreviveu porque cada revisor,
sozinho, achou "duas linhas de documentação, pequeno demais para reprovar". É exatamente assim que um
defeito atravessa quatro gates.

Script proposto (trivial, roda em segundos):
1. Contar `<section>` + `<header>` + `<footer>` dentro de `<main>`/`<body>` no `dist/index.html`.
2. Varrer **todos** os `.md`, `.astro`, `.json` **e `.html` (inclusive `proto/`)** do cliente — não uma
   lista fixa de arquivos, e não só a documentação — por `/(\d+)\s*(seç|seções|publicáveis|travadas)/i`,
   comparando com a contagem real. **Comentário HTML conta**: foi um `<!-- -->` no protótipo canônico que
   sobreviveu à 4ª rodada.
3. Falhar se qualquer ocorrência divergir. **Varrer o repositório inteiro do cliente, não os arquivos
   que o builder disser que tocou** — na 3ª rodada o builder sincronizou 4 arquivos e declarou 5, e os
   dois que sobraram (`PRODUCT.md`, linha de histórico do `PROJECT.md`) eram justamente os não listados.
4. Distinguir **afirmação de estado presente** de **registro histórico**. `PROJECT.md` §6 guarda de
   propósito linhas que descrevem o número errado da época ("texto diz 11") e elas devem continuar lá.
   O critério não é o número, é o tempo verbal: "a página vai ao ar com 11 seções" é estado presente e
   é defeito; "a contagem ficou incorreta (texto dizia 11)" é histórico e é correto.

Corolário mais amplo, que vale para qualquer item: **"corrigido em N arquivos" não é evidência de
correção — é evidência de escopo escolhido.** Conferir por varredura, nunca pela lista do autor.

**Corolário do corolário (4ª rodada):** a varredura de confirmação herda o escopo de quem a pediu. Eu
mesmo pedi "grep em todo `.md` do cliente", o orquestrador executou exatamente isso e voltou limpo — e
a ocorrência viva estava num `.html`. **Ao pedir varredura, nunca nomear a extensão; pedir o diretório
inteiro do cliente e refazer eu mesmo.** Um escopo que eu ditei não deixa de ser um escopo escolhido só
porque fui eu que escolhi.

## Fechamento do caso (5ª rodada, 2026-08-20) — o que a aprovação ensinou

O item fechou, mas **o script continua valendo**: fechou porque um humano varreu, não porque a fábrica
ficou imune. Três coisas novas, todas baratas de repetir:

1. **Padrão largo pega o que o padrão literal não pega.** O relato veio com `grep "11 seç|13 seções \(11|11 publicáveis"`.
   Refiz com `/\d+\s*(seç|publicáve|travad|componentes|leituras)/i` e o resultado foi maior — não por
   defeito, mas porque só assim dá para **cruzar todas as contagens entre si** (13 mapeadas / 10 publicáveis /
   3 travadas / 10 no ar / 11 componentes) em vez de caçar um número errado específico. Caçar o número velho
   só acha o defeito conhecido; varrer a família de números prova a coerência.
2. **A contagem do relato estava errada de novo, e não importou.** Disseram "restam 2 ocorrências em
   `PROJECT.md` §6 (linhas 81 e 83)". São **3** (81, 83 e **84** — a linha 84 é o registro da própria 4ª
   rodada, escrita depois da varredura relatada). Todas históricas, nenhuma bloqueante. Lição: um relato de
   varredura envelhece no instante em que alguém escreve a próxima linha do histórico. **Recontar sempre,
   mesmo quando o número relatado é pequeno e plausível.**
3. **Verbo presente dentro de linha histórica nem sempre é defeito.** `PROJECT.md:73` (índice de leitura da
   5ª rodada; a numeração anda) traz "Contagem de seções ficou incorreta na documentação (10 reais, texto
   diz 11)" — "diz" é presente. Não reprovei: a mesma parêntese **declara o valor correto ao lado**
   ("10 reais") e a linha é célula datada de tabela com "corrigir no próximo ciclo". Refinamento do critério
   que eu tinha escrito: o teste não é o tempo verbal isolado, é **"que crença um leitor sai tendo?"**.
   Tempo verbal é o proxy barato; quando ele acusa, confira se o valor correto está na mesma frase.

Ancorar contagem em **medição do `dist`, não em prosa**: `<section>` 8 + `<header>` 1 + `<footer>` 1 = 10,
sem `id="t-s8|9|10"` e sem `data-proto-only`. Dois comandos, e é a única fonte que não pode mentir.

## Ainda candidatas a script

- **CSS que o build quebra:** `CSS.supports('animation', <valor>)` para cada shorthand do `dist`.
  A causa raiz de 2026-08-20 foi essa. Hoje o fonte tem comentário proibindo `animation:` junto de
  `animation-timeline`, mas comentário não é enforcement.
- **elemento que nunca fica visível:** todo seletor com `visibility:hidden`/`opacity:0` cuja única saída
  é uma animação precisa ter o caminho de revelação exercitado no gate, não presumido.
- **número sem origem:** número renderizado que não vem de `brief.md` → exigir `data-source`.

**Why:** São exatamente as classes de defeito que `anti-slop-copy`, `anti-slop-visual` e `budget-check`
deixam passar limpo. Nas três rodadas de `clinica-piloto-odonto` os 3 sinais fecharam com **0 falhas** e a
entrega tinha, na 1ª, falha de acessibilidade real; na 2ª, duas features mortas no navegador dominante;
na 3ª, o item que já tinha sido cobrado duas vezes ainda aberto; na 4ª, o mesmo item pela quarta vez,
agora fora da extensão que a própria varredura cobria.

**How to apply:** Ao abrir um gate, conferir esta lista primeiro — são baratas de checar e já se provaram.

Ver [[gate-verificacao-visual]].
