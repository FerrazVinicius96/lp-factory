---
paths: ["clients/**/*.astro", "clients/**/*.css", "templates/**/*.astro", "templates/**/*.css"]
---

# Regras de front-end

- Nenhuma cor, espaçamento, raio ou sombra literal. Tudo vem do `@theme` gerado por `tokens.json`.
- Motion: `animation-timeline` sempre dentro de `@supports`. Toda animação respeita `prefers-reduced-motion`.
- Imagem: AVIF/WebP responsivo, `width`/`height` explícitos, `loading="lazy"` fora da dobra.
- Vídeo nunca é o elemento LCP: `poster` em AVIF, `preload="none"`, desligado em `prefers-reduced-motion` e em `saveData`.
- Ilha interativa só onde há interação real. Se for para exibir, é HTML.
- Antes de declarar pronto, rode `npm run build` e o `budget-check`. Estourar o teto do nível não é opção.
