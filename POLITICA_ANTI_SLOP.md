# Política Anti-Slop

> Regra permanente da fábrica. Referenciada pelo `CLAUDE.md` do repositório e aplicada por script em hook + julgamento do `tech-lead`.
> **Reprovação aqui bloqueia merge e deploy.** Não gera aviso.

---

## Princípio

Slop não é "conteúdo gerado por IA". É **conteúdo que não decidiu nada**: a headline que serviria para qualquer empresa, o gradiente roxo que serviria para qualquer produto, o depoimento que não veio de ninguém. A política existe para forçar decisão em cada camada — e para tornar a ausência de decisão detectável por máquina onde for possível, e por auditor onde não for.

Regra de ouro, válida nos três níveis: **se um bloco da página funcionaria idêntico no site de um concorrente, ele não passa.**

---

## A. Copy — léxico e estrutura proibidos

Verificado por `scripts/anti-slop-copy.mjs` em `PostToolUse` sobre `copy.md` e arquivos de conteúdo.

**Léxico bloqueado** (lista viva em `config/anti-slop-lexicon.json`):
`revolucionário`, `transforme sua vida`, `descubra o segredo`, `não perca essa oportunidade`, `solução completa`, `em um mundo cada vez mais…`, `eleve seu/sua`, `desbloqueie`, `potencialize`, `jornada` (como metáfora de compra), `sinergia`, `disruptivo`, `game changer`, `nunca foi tão fácil`, `tudo o que você precisa`, `feito para você`.

**Estruturas bloqueadas:**
- Antítese de efeito: *"Não é apenas X, é Y"*.
- Tricolon vazio: *"mais rápido, mais simples, mais inteligente"* (três adjetivos sem substantivo mensurável).
- Pergunta retórica de abertura: *"Você já se sentiu…?"* como headline.
- Emoji em headline ou CTA; mais de um ponto de exclamação na página.
- Bloco de benefício com verbo genérico e nenhum número (`otimize`, `melhore`, `maximize` sem métrica).

**Regra de substância:** toda afirmação quantitativa exige atributo `data-source` apontando para o item correspondente no `brief.md`. Sem fonte, o build falha. Não existe "número ilustrativo".

---

## B. Design — léxico visual proibido

Verificado por `scripts/anti-slop-visual.mjs` (análise dos tokens e do CSS gerado) + revisão do `tech-lead`.

**Bloqueado por script:**
- Cor fora do `tokens.json`. Hex solto no markup ou no CSS de componente = reprovação. Toda cor nasce do tema.
- Gradiente não declarado no tema. E, especificamente, a faixa violeta-para-azul de tom "IA genérica" só é permitida se derivar de cor da marca presente no brief.
- `border-radius` e `box-shadow` uniformes em todos os componentes (sinal de ausência de sistema).
- Fonte padrão de fallback usada como fonte de marca sem declaração explícita de intenção no `tokens.json`.
- Placeholder e lorem ipsum em qualquer arquivo de produção.
- Emoji usado como ícone.

**Bloqueado por auditoria do `tech-lead`:**
- Composição "hero centralizado + três cards + gradiente de fundo" sem justificativa no brief.
- Blob orgânico decorativo, glassmorphism sem função, partículas de fundo.
- Iconografia de foguete, lâmpada, engrenagem, aperto de mão, alvo com flecha.
- Foto de banco de imagens com pessoas sorrindo em escritório genérico.
- Mockup de dashboard fictício apresentado como produto real.
- Contador animado sobre número sem fonte.

**Exigência positiva — a página precisa ter uma decisão de personalidade.** O `tokens.json` declara, obrigatoriamente:
1. uma escolha tipográfica com caráter e a razão dela para o nicho;
2. um sistema cromático derivado da marca ou do setor, não de paleta padrão;
3. **um motivo gráfico próprio** (tratamento de borda, grid visível, textura, recorte, assinatura de traço) que se repita e identifique a página.

Sem os três campos preenchidos e justificados, o Ciclo II não fecha.

---

## C. Integridade — inegociável em todos os níveis

Estas regras não são estéticas. Valem inclusive contra pedido do cliente:

- **Prova social só existe se veio do brief.** Depoimento, avaliação, nota, número de clientes: nada é inventado, nem "a título de exemplo". Sem material, a seção não é preenchida com ficção — ela sai da página ou fica marcada como pendência do cliente.
- **Logos de clientes, imprensa e certificações** só entram com autorização registrada no brief.
- **Imagem gerada por IA** não retrata pessoa real identificável nem simula registro documental de evento que não ocorreu.
- **Selos, garantias e prazos** refletem o que o cliente efetivamente pratica.

O hook bloqueia a palavra-chave de placeholder em seções de prova social; o `tech-lead` verifica correspondência item a item com o `brief.md`.

---

## D. Anti-repetição entre clientes

O slop também aparece quando a *fábrica* repete a si mesma.

- Cada entrega registra sua assinatura visual (família tipográfica, paleta base, acento, motivo gráfico, estrutura de hero) em `templates/registry.json`.
- `plugin/scripts/registry.mjs --verificar` compara a direção proposta contra as últimas 5 entregas do mesmo nicho e **reprova com código 2** quando dois ou mais elementos de assinatura coincidem. Isto não é alerta: é gate.
- O `lp-designer` consulta também seu `MEMORY.md`. O script pega repetição de assinatura; o agente pega repetição de ideia — que é a mais difícil das duas.
- Nos níveis Intermediário e Avançado, o Ciclo II gera **direções divergentes em paralelo** antes de convergir — divergência forçada é a defesa estrutural contra a média.

---

## E. Como a política é aplicada em cada nível

| | Básico | Intermediário | Avançado |
|---|---|---|---|
| Léxico de copy | script | script | script + revisão de tom pelo `tech-lead` |
| Léxico visual | script | script + `tech-lead` | script + `tech-lead` + auditoria dedicada |
| Motivo gráfico próprio | obrigatório | obrigatório | obrigatório e aplicado em ≥ 3 seções |
| Integridade | integral | integral | integral |
| Anti-repetição | registro | registro + verificação | registro + verificação + direções divergentes |

---

## F. O que a política **não** faz

Não mede originalidade — isso não é mensurável. Ela elimina o detectável (o clichê, o placeholder, a cor fora do sistema, a alegação sem fonte) e obriga a decisão onde a máquina não consegue julgar. O teto estético continua vindo do briefing e do repertório do `lp-designer`; a política só garante que nada abaixo do piso chegue ao ar.
