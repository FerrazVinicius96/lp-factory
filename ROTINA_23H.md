# Rotina diária das 23h

Duas formas de ligar. A primeira é a decidida no planejamento; a segunda já está pronta no repositório e serve de garantia.

## Opção A — Routine na nuvem (decidida)

Na CLI do Claude Code, dentro do repositório:

```
/schedule manutencao diaria das landing pages, todos os dias as 23h
```

Claude pergunta o restante e salva na sua conta. Ao criar, use como prompt:

> Execute a rotina de manutenção diária da fábrica de landing pages seguindo a skill `lp-maintenance`. Leia apenas o delta dos logs desde `.last_run`, o `BACKLOG.md` de cada cliente e a telemetria. Triagem pela matriz 0–5: nota 0–1 vira hotfix, 2 vira PR, 3 vai para o backlog, 4–5 propõe um upgrade incremental com base na telemetria real. Toda correção passa pelo gate antes de publicar. Ao final grave `logs/maintenance/<data>.md` com no máximo 15 linhas, atualize `BACKLOG.md` e `.last_run`, e rode `plugin/scripts/rotate-logs.mjs`.

Pontos de atenção:
- A sessão da nuvem trabalha sobre um clone novo: **o estado precisa estar commitado**.
- Inclua apenas os conectores necessários (Railway). Conector incluído pode ser usado sem pedir permissão durante a execução.
- Routines está em research preview — revise o comportamento no changelog mensalmente.

## Opção B — GitHub Actions (já no repositório)

`.github/workflows/manutencao-diaria.yml`, cron `0 2 * * *` (= 23h em São Paulo).

Segredos necessários no repositório:
- `ANTHROPIC_API_KEY`
- `VITALS_DATABASE_URL` — Postgres do coletor de telemetria. Sem ele, a manutenção roda sem os Web Vitals de campo.

O job coleta o p75 do dia para `runtime.jsonl` **antes** de a sessão começar. É por isso que a rotina consegue triar por comportamento real gastando quase nada de contexto.

## Horário de verão

O cron está em UTC. Se o horário de verão voltar a valer no Brasil, ajuste para `0 3 * * *`.
