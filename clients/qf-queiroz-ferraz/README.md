# Template base da fábrica

Astro 7 + Tailwind v4. Copiado para `clients/<slug>/` na abertura do cliente.

## Fluxo
1. O Ciclo II entrega `tokens.json` na raiz do cliente.
2. `npm run tokens` gera `src/styles/theme.css` com o `@theme`. O build já roda isso.
3. O Ciclo III implementa as seções consumindo apenas classes do tema.

## Regras que o build faz cumprir
- `tokens.json` sem os campos de personalidade (tipografia.familia, tipografia.razao, cor.origem, motivo.nome, motivo.descricao) **quebra o build**.
- Cor literal no markup é reprovada pelo gate visual.
- `motion.css` já escalona o movimento por nível e respeita `prefers-reduced-motion`.
- O beacon de Web Vitals é servido como `/rum.js` e tem cap próprio de 1,5 KB gzip.

## Deploy na Railway
`railway.json` já define build e start (`serve dist`). Ative o CDN nas configurações do serviço.
