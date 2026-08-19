---
name: lp-maintenance
description: Rotina diaria de manutencao das landing pages publicadas. Le o delta dos logs e da telemetria, tria pela matriz 0-5, corrige e alimenta o backlog. Use as 23h ou sob pedido explicito de manutencao.
---

# Manutenção diária

Argumento opcional: `$ARGUMENTS` = slug específico. Sem argumento, percorre todos os clientes publicados.

## Regra de custo
Esta rotina é desenhada para ser barata. **Não releia o repositório.** Leia apenas o delta desde `logs/.last_run`, o `BACKLOG.md` e a telemetria. Um dia sem eventos deve custar quase nada.

## Passos
1. Para cada cliente, delegue ao subagent `lp-maintainer`.
2. O maintainer tria pela matriz 0–5:
   - 0–1 → hotfix agora, gate, deploy.
   - 2 → correção em branch e PR, sem merge automático.
   - 3 → entra no `BACKLOG.md`.
   - 4–5 → propõe **um** upgrade incremental baseado em telemetria real.
3. Toda correção passa pelo gate antes de publicar. Sem exceção, inclusive em hotfix.
4. Ao final: `logs/maintenance/<data>.md` com no máximo 15 linhas, `BACKLOG.md` atualizado, `.last_run` gravado e `node plugin/scripts/rotate-logs.mjs` executado.

## Relatório
Devolva um resumo único de todos os clientes: o que quebrou, o que foi corrigido, o que ficou pendente e o que entrou no backlog. Sem narrar passo a passo.
