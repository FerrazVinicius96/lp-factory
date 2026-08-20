---
name: gate-verificacao-visual
description: No gate, renderizar o BUILD com Chrome headless via CDP e medir — aprovacao "no papel" ja escondeu falha de contraste AA e o minificador ja quebrou CSS valido
metadata:
  type: feedback
---

Nunca aceitar aprovação de ciclo baseada na descrição escrita do `lp-designer`/`lp-builder`. No gate,
renderizar **o `dist/`, não o fonte**, com Chrome headless e **medir**, não só olhar.

**Why:** Dois incidentes no mesmo cliente (`clinica-piloto-odonto`, 2026-08-20). (1) 1ª rodada: o Ciclo II
foi aprovado sem ninguém ver a página; todos os sinais mensuráveis passaram limpos e a renderização real
mostrou traço dourado cruzando o herói a 3,01:1. (2) 2ª rodada: o fonte estava correto e o **minificador
do build** transformou `animation: X linear both; animation-timeline: --t;` em `animation: linear both X --t`,
que é shorthand inválido — o Chrome descarta a declaração inteira. Ler o `.astro`/`.css` teria aprovado; ler
o `dist/index.html` reprovou. Ver [[gate-defeitos-recorrentes]].

**How to apply:** Chrome em `C:/Program Files/Google/Chrome/Application/chrome.exe`. Sem playwright/
puppeteer/PIL nesta máquina.

`--dump-dom` **parou de funcionar** (trava até o timeout; testado no Chrome 151, `--headless=new` e
`--headless` antigo). O caminho que funciona hoje é **CDP por WebSocket**, e é melhor que o antigo:

1. Servir `dist/` com um http server mínimo em Node (readFile + content-type, ~8 linhas), em background.
2. `chrome.exe --headless=new --disable-gpu --no-sandbox --no-first-run --hide-scrollbars
   --remote-debugging-port=9222 --user-data-dir=<abs> about:blank` — **em background de verdade**; com `&`
   no bash o processo morre junto com a shell.
3. Node 24 tem `WebSocket` global: `fetch('http://127.0.0.1:9222/json/version')` -> `webSocketDebuggerUrl`
   -> `Target.createTarget` + `Target.attachToTarget {flatten:true}` -> `Runtime.evaluate {returnByValue:true}`.
4. `Emulation.setDeviceMetricsOverride` dá **innerWidth exato, inclusive 320px** — some o problema da
   janela mínima de 500px do Windows e a necessidade de conferir 320/390 por aritmética.
5. `Emulation.setEmulatedMedia` com `prefers-reduced-motion` e `prefers-color-scheme`. **Rodar os dois
   estados de motion:** foi a diferença entre ver a malha e ver o herói vazio.
6. `Page.captureScreenshot` para confirmar o que a medida disse. Tema também via `data-tema` no `<html>`.

Armadilhas já pagas, que devo evitar repetir:
- `--window-size=390` NÃO dá `innerWidth=390`. Use `setDeviceMetricsOverride`, não `--window-size`.
- `mobile:true` no override infla `innerWidth` quando há overflow. Use `mobile:false` para medir overflow.
- `scrollTo(0,y)` respeita `scroll-behavior: smooth` e a captura sai no meio do trajeto. Use
  `scrollTo({top:y, behavior:'instant'})`.
- Interseção de bounding box não é sobreposição de pixel — e o contrário também vale: quando a camada usa
  `mask-image`, a caixa **cobre** o texto de propósito. Medir o limiar da máscara (um `div` com
  `width: var(--token)` dentro do container resolve o `calc()` com `%`), não a caixa.
- Arquivo de sonda escrito dentro de `dist/` entra na conta do `budget-check`. Apagar antes de rodar o gate.

## Confirmado na 3ª rodada (2026-08-20)

**`animation-timeline: view()` FUNCIONA em `<path>` de SVG no Chrome 151** — a ViewTimeline fica ativa e
o progresso resolve normalmente. Cheguei ao gate suspeitando que fosse essa a causa da malha morta; não
era. A causa era só o shorthand remontado pelo minificador. Não gastar tempo com essa hipótese de novo.

Sondas que valeram o esforço e que devo reusar:
- **`document.elementFromPoint` no centro do CTA**, não só o rect: prova que o botão é clicável de
  verdade e que nada está por cima. Rect visível com outro elemento no topo é o bug clássico que
  medir só a caixa deixa passar.
- **`el.getAnimations()`** com `playState`, `timeline.constructor.name` e `getComputedTiming().progress`:
  distingue "animação existe e terminou" (`finished`, prog 1) de "declaração descartada pelo navegador"
  (lista vazia) e de "timeline inativa". É a medida que teria pego o defeito da 2ª rodada em segundos.
- **`getBBox()` do `<text>` contra o `viewBox` parseado**: mede corte de texto em SVG, que screenshot em
  tamanho pequeno não revela. Medir também com a webfont bloqueada (`Network.enable` +
  `Network.setBlockedURLs`) — a métrica do fallback é outra, e é o que o usuário de rede ruim vê.
- **Overflow**: `documentElement.scrollWidth > clientWidth` mais varredura de `getBoundingClientRect().right`
  elemento a elemento, **pulando `position:fixed`** — senão a barra flutuante entra como falso positivo.
- **Sobreposição de camada decorativa**: rodar a checagem no estado em que o usuário realmente vê. Na 2ª
  rodada o contraste foi verificado com a malha invisível no Chrome; só na 3ª ela existia de fato para
  ser medida. Feature quebrada esconde o defeito da feature que depende dela.

Armadilha nova: ao montar a sonda por heredoc, `split(/\s+/)` dentro de template literal virou NaN e o
teste "cabe no viewBox" deu falso negativo. **Sempre imprimir os valores brutos ao lado do booleano** —
foi só porque o `viewBox` saiu como `[null]` no log que percebi que o `false` era da sonda, não da página.
Booleano sem os números que o produziram não é medição, é opinião com sintaxe de medição.
