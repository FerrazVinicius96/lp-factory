---
name: fluxo-impeccable-na-fabrica
description: Como rodar /impeccable init e concept-seed na fábrica multi-cliente, e como ver e MEDIR a página de verdade (Chrome headless) nesta máquina
metadata:
  type: project
---

`/impeccable init` escreve `PRODUCT.md` **dentro de `clients/<slug>/`**, nunca na raiz do
repositório. O `concept-seed.mjs` é bloqueado sem `PRODUCT.md` e resolve o contexto pelo `cwd`,
então ele precisa ser executado com o diretório do cliente como cwd. Como subagente eu não tenho
ferramenta de pergunta estruturada nem página de decisão: a skill exige que essa substituição
seja declarada na primeira resposta e que todo fato inferido seja rotulado no `PRODUCT.md`.

**Why:** a raiz do repositório já tem um `PROJECT.md` que é a fonte da verdade da fábrica, e a
skill avisa para não criar autoridade concorrente. Um `PRODUCT.md` na raiz descreveria um cliente
como se fosse o repositório inteiro e seria sobrescrito pelo cliente seguinte.

**How to apply:** rode o `context.mjs` da skill uma vez por sessão a partir da raiz, escreva o
`PRODUCT.md` do cliente, depois rode o `concept-seed.mjs` com `cwd` no diretório do cliente. A
rolagem do concept-seed atribui uma direção da minha própria lista ordenada por ressonância — ela
não é sugestão e não pode ser trocada por gosto, só por falha factual.

**Verificação visual: dá para ver e medir, e é obrigatório fazer.** A extensão do Chrome não
funciona nesta máquina, e `playwright`/`puppeteer` **não estão instalados** (a versão anterior
desta memória dizia que `npx --no-install playwright screenshot` funcionava; não funciona). O que
funciona é o Chrome instalado, em duas modalidades, ambas confirmadas em 2026-08-20:

- **Ver:** `"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu
  --hide-scrollbars --force-device-scale-factor=1 --window-size=<w>,<h>
  --screenshot=<saida.png> --virtual-time-budget=6000 "file:///<caminho absoluto>"`.
- **Medir:** a mesma linha trocando `--screenshot` por `--dump-dom`, numa cópia temporária do HTML
  com uma sonda que roda `getBoundingClientRect` e `getComputedStyle` no `load` e escreve o
  resultado em `document.title`; depois é só `grep` do marcador. É assim que se prova que uma
  camada decorativa não toca texto, em vez de afirmar.

Duas limitações reais: a janela mínima do Chrome no Windows é **500px de largura** (320 e 390 só
por aritmética), e `--headless=new` assume `prefers-color-scheme: dark` — para o tema claro,
gere uma cópia com `data-tema="claro"` no `<html>`. Apague as cópias temporárias ao terminar.

O detector mecânico da skill (`detect.mjs`) roda **degradado** aqui (faltam `htmlparser2`,
`css-select`, `css-tree`, `domutils`): ele cai para regex, não avalia custom properties nem
contraste computado, e devolve `[]`. `[]` dele não é aprovação — é silêncio.
Ver [[projeto-clinica-piloto-odonto]].
