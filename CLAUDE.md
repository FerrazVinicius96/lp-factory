# Fábrica Agêntica de Landing Pages

Regras permanentes. Mantenha este arquivo abaixo de 200 linhas.

## O que é
Estrutura multi-cliente que produz landing pages sob demanda em 3 ciclos, publica na Railway e roda manutenção diária às 23h (America/Sao_Paulo).

## Documentos de referência
- `PROJECT.md` — escopo, time, decisões, histórico. Fonte da verdade. Estrutura de 7 seções não muda sem aprovação.
- `POLITICA_ANTI_SLOP.md` — política obrigatória. Reprovação bloqueia merge e deploy.
- `plugin/config/tiers.json` — orçamentos numéricos de cada nível.

## Stack
Astro 7 + Tailwind v4. Sem React por padrão. Ilha interativa só onde há interação real.
Cor, espaçamento, tipografia e sombra vêm **sempre** de `tokens.json` via `@theme`. Hex solto reprova no gate.

## Níveis de entrega
Todo cliente tem um nível em `clients/<slug>/PROJECT.md`: `basico`, `intermediario` ou `avancado`.
O nível define orçamento de JS, motion permitido, fonte de mídia, SEO, passes de copy e rigor do gate.
Orçamento de JS de aplicação: básico 0 KB · intermediário 15 KB · avançado 60 KB por rota. O beacon de Web Vitals tem cap próprio de 1,5 KB e não entra nessa conta.
Nunca ultrapasse o orçamento do nível para "melhorar" a página. Proponha subir o nível ao cliente.

## Motion
Padrão é CSS. Use `animation-timeline` dentro de `@supports (animation-timeline: scroll())`.
Fallback IntersectionObserver apenas onde o suporte falta (Firefox). JS de motion nunca no caminho crítico.
Respeite `prefers-reduced-motion` em toda animação. Vídeo nunca é o elemento LCP.

## Mídia
básico → artlist (imagem estática) · intermediário → Higgsfield `generate_image` · avançado → Higgsfield imagem + vídeo.
Higgsfield é pago: teto de 8 gerações no intermediário e 20 no avançado por projeto.

## Fluxo
1. `/lp-intake` abre o cliente e fixa o nível.
2. `/lp-cycle` roda Ciclo I → II → III com o gate entre eles.
3. `tech-lead` avalia pela matriz 0–5. Nota ≤ 2 devolve ao Ciclo II. Piso: básico 3, intermediário 4, avançado 5.
4. `lp-deployer` publica. `/lp-maintenance` roda às 23h.

## Integridade — inegociável
Prova social, depoimento, número, logo e selo só existem se vieram do `brief.md`. Nada é inventado, nem como exemplo.
Sem material do cliente, a seção sai da página ou vira pendência. Não preencha com ficção.

## Conformidade por nicho
Se `clients/<slug>/compliance` existir, ele lista camadas regulatórias (ex.: `oab`) somadas ao gate de copy.
Para advocacia, valem as restrições do Provimento 205/2021: sem promessa de resultado, sem valores ou honorários,
sem superlativo ou comparação, sem caso concreto como argumento de venda, sem urgência artificial, e depoimento
de cliente só com confirmação da seccional. **Isto é rede de segurança contra o erro óbvio, não parecer jurídico:**
a validação final é do cliente com a seccional dele.

## Deploy
Passo único: `node plugin/scripts/deploy.mjs --slug <slug>` (use `--preview` ou `--dry-run`).
Ele confere o gate, builda, mede o orçamento, publica, verifica a URL viva e registra `logs/deploy.jsonl`.
Nunca publique por fora: o hook bloqueia `railway up` sem gate verde, e o script verifica de novo.

## Logs
Nunca escreva log manualmente. Os hooks gravam `clients/<slug>/logs/*.jsonl`.
A manutenção lê apenas o delta desde `last_run`. Não releia o repositório inteiro para saber o que aconteceu.

## Git
Commits atômicos por funcionalidade ou decisão. Nunca commite `.env`, chave ou segredo.
Produção só recebe deploy com gate verde.
