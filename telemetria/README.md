# Telemetria da fábrica

A Railway não expõe erros de runtime e Web Vitals de front-end. Sem isto, a manutenção das 23h só enxergaria saúde de servidor. Com isto, ela tria por comportamento real.

## Três fontes que alimentam `runtime.jsonl`

1. **Logs e métricas do serviço** — via conector Railway (`get-logs`, `get-service-metrics`): 4xx/5xx, uso, reinícios.
2. **RUM próprio** — o beacon `/rum.js` de cada página envia LCP, CLS, INP e TTFB para o coletor. `consultar.mjs` agrega o p75 do dia.
3. **Analytics self-hosted** — Umami ou Plausible como serviço no mesmo projeto Railway, compartilhando o Postgres. Dá conversão por seção e origem de tráfego.

## Subir o coletor

1. Novo serviço na Railway a partir de `telemetria/collector/`.
2. Adicione um Postgres ao projeto e vincule `DATABASE_URL`.
3. Defina `ORIGENS_PERMITIDAS` com os domínios das landing pages, separados por vírgula.
4. Gere o domínio do serviço e aponte o `data-endpoint` do beacon para `https://<coletor>/`.

## Privacidade

O coletor grava caminho, métrica, valor e horário. Não grava IP, cookie, identificador de usuário nem query string. É telemetria de performance, não rastreamento de pessoa — e é isso que deve ser informado na política de privacidade da página.
