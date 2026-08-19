---
name: lp-cycle
description: Roda os tres ciclos de producao da landing page com o gate entre eles. Use depois do briefing, ou para retomar um ciclo apos reprovacao.
---

# Ciclo de produção

Argumento: `$ARGUMENTS` = slug do cliente. Leia `clients/<slug>/tier` antes de qualquer coisa — ele governa todos os orçamentos.

## Ciclo I — Concepção e Copy
Delegue ao subagent `lp-strategist`. Entrega: `copy.md` e `wireframe.md`.
**Checkpoint com o usuário:** apresente o esqueleto de texto e a estrutura. Só avance com aprovação.

## Ciclo II — Design Visual
Delegue ao subagent `lp-designer`. Entrega: `tokens.json` e protótipo navegável em `proto/`.
Antes de fechar, o designer roda `registry.mjs --verificar`; ao fechar, `registry.mjs --registrar`. Direção que colide com entrega recente do mesmo nicho não passa.
Nos níveis intermediário e avançado, peça **direções divergentes em paralelo** e apresente as alternativas ao usuário.
**Checkpoint com o usuário:** validação estética. Só avance com aprovação.

## Ciclo III — Construção
Delegue ao subagent `lp-builder`. Entrega: `src/` implementado, build passando, dentro do orçamento de JS do nível.

## Gate
1. Rode `node plugin/scripts/qa-gate.mjs --slug <slug>` para coletar os sinais mensuráveis.
2. Delegue ao subagent `tech-lead` o julgamento. No nível avançado, dispare `perf-a11y-auditor` **em paralelo**.
3. Nota ≤ 2 → volta ao **Ciclo II**. Abaixo do piso do nível → volta ao ciclo correspondente ao defeito.
4. Aprovado → registre com `--veredito APROVADO --nota N` e siga para publicação.

## Publicação
Delegue ao `lp-deployer`. Ele confere o gate no log antes de publicar; o hook bloqueia se não estiver verde.

## Fechamento
- Promova blocos reaproveitáveis para `templates/blocks/`, com `README.md` (incluindo "Quando NÃO usar") e `referencia.png`.
- Confirme que a assinatura visual foi registrada: `node plugin/scripts/registry.mjs --listar --nicho <nicho>`.
- Atualize a seção 6 do `PROJECT.md` do cliente.
- Confirme que `logs/` tem entradas de build, qa e deploy do ciclo.
