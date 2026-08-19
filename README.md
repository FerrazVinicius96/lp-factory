# lp-factory

Fábrica agêntica de landing pages no ecossistema Claude. Produz sob demanda em 3 ciclos, publica na Railway e roda manutenção diária às 23h.

## Instalação

### Windows — um script faz tudo

Baixe o `lp-factory.zip`, coloque o `setup-windows.ps1` em qualquer pasta e rode:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup-windows.ps1
```

Ou dê duplo clique em `setup-windows.bat`, que faz o mesmo sem mexer na ExecutionPolicy.

Ele confere git/Node/npm, acha o zip em Downloads, extrai, **roda a suíte de gates para provar que a fábrica funciona nesta máquina**, inicializa o git e publica no GitHub via `gh`. Sem `gh`, ele para no commit e imprime os comandos exatos para publicar à mão.

```powershell
# opções
-Zip "C:\caminho\lp-factory.zip"   # em vez de procurar em Downloads
-Destino "C:\dev\lp-factory"       # padrão: %USERPROFILE%\lp-factory
-Repo minha-fabrica                 # nome do repositório
-Visibilidade public                # padrão: private
-InstalarTemplate                   # já instala as dependências do Astro
-PularGitHub                        # só o setup local
-Forcar                             # sobrescreve destino existente
```

### Linux e macOS

```bash
git clone <seu-repo> lp-factory && cd lp-factory
claude
/plugin marketplace add .
/plugin install lp-factory@lp-factory-marketplace
```

Os subagents ficam em `.claude/agents/` e carregam sozinhos. O plugin traz as skills, os hooks e os monitors.
Para testar sem instalar: `claude --plugin-dir ./plugin`.

## Uso

```
/lp-intake        abre um cliente, coleta o briefing e fixa o nível
/lp-cycle <slug>  roda Ciclo I → II → III com o gate entre eles
/lp-maintenance   rotina diária (também roda sozinha pelo agendamento)
```

## Verificar os gates

```bash
npm run test:gates
```
18 casos: léxico de copy, claim sem fonte, cor fora do sistema, personalidade incompleta, escrita em segredo, comando destrutivo, deploy sem gate verde, nota abaixo do piso e orçamento de JS por nível.

## Estrutura

```
.claude/agents/      7 subagents com tools/disallowedTools explícitos
.claude/rules/       regras com paths, carregam só no arquivo relevante
.claude/workflows/   lp-qa.js — auditoria paralela com verificação adversarial
plugin/              skills, hooks, monitors, scripts e config do plugin
templates/base/      Astro 7 + Tailwind v4, motion por nível, beacon de Web Vitals
templates/blocks/    biblioteca que cresce a cada entrega
telemetria/          coletor de Web Vitals de campo (serviço na Railway)
clients/<slug>/      cada landing page, com seus logs
```

## Documentos que governam

- `PROJECT.md` — escopo, time, decisões, histórico. Estrutura de 7 seções não muda sem aprovação.
- `POLITICA_ANTI_SLOP.md` — obrigatória. Reprovação bloqueia merge e deploy.
- `CLAUDE.md` — regras permanentes carregadas em toda sessão.
- `ROTINA_23H.md` — como ligar o agendamento.

## Limites conhecidos

- O `budget-check` mede JS emitido e `<script>` inline no HTML. JS injetado em runtime por terceiro (pixel, chat) não é medido — mantenha esses no gerenciador de tags e revise manualmente.
- Scroll-driven animations não funcionam no Firefox: o fallback é o estado final estático. Onde paridade total for exigida, o builder liga o IntersectionObserver.
- `/impeccable` é dependência externa declarada, não incluída neste repositório.
