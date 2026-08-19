---
name: lp-intake
description: Abre um cliente novo na fabrica de landing pages, coleta o briefing e fixa o nivel de entrega. Use quando o usuario pedir uma landing page nova.
disable-model-invocation: false
---

# Abertura de cliente

Argumento opcional: `$ARGUMENTS` (nome ou slug do cliente).

## 1. Briefing — use AskUserQuestion, não texto corrido

Colete, em no máximo duas rodadas de perguntas:

- **Negócio e oferta:** o que se vende, ticket, o que acontece depois da conversão.
- **Público e dor:** quem é, qual dor específica, em que momento chega à página.
- **Objetivo da página:** lead, venda direta ou clique. Um só.
- **Ativos disponíveis:** marca, logo, fotos, **depoimentos e números reais** (isto define o que pode existir na página).
- **Referências visuais:** o que o cliente considera bom e o que rejeita.
- **Nível de entrega:** básico, intermediário ou avançado — apresente a tabela de `plugin/config/tiers.json` traduzida em benefício, não em jargão.

## 2. Estrutura

Crie `clients/<slug>/` com:

```
brief.md        respostas do briefing, organizadas
tier            uma linha: basico | intermediario | avancado
PROJECT.md      as 7 secoes do padrao da fabrica, com "Nivel: <tier>" na secao 1
BACKLOG.md      vazio, com cabecalho
logs/           .last_run com a data de hoje
```

## 3. Regras de abertura

- O nível fixa orçamento de JS, motion, mídia, SEO, passes de copy e piso de nota. Não invente exceção.
- Registre explicitamente no `brief.md` a seção **Ativos ausentes**: depoimento, número, logo ou selo que o cliente não forneceu. Essas seções não serão preenchidas com ficção — viram pendência.
- Se o cliente pedir algo fora do nível escolhido (vídeo no básico, WebGL no intermediário), apresente o custo de subir de nível em vez de abrir exceção.

## 4. Encerramento

Confirme com o usuário o resumo do briefing e o nível antes de chamar `/lp-cycle`.
