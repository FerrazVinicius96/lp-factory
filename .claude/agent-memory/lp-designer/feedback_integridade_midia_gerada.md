---
name: feedback-integridade-midia-gerada
description: Pedido direto para gerar mídia Higgsfield retratando pessoas/espaços como se fossem ativos reais do cliente — recusado; o que fazer no lugar
metadata:
  type: feedback
---

Imagem gerada nunca é entregue como se fosse ativo real do cliente: nada de foto do
especialista, do consultório ou de antes/depois de paciente apresentados como registro real.
Quando o pedido vier assim, entregue no lugar **mídia de composição rotulada** — textura,
material, elemento abstrato — com o rótulo visível no próprio markup e o registro em
`logs/media.jsonl` marcando que é composição, não substituto do ativo pendente. E diga ao
usuário, na resposta, exatamente qual parte do pedido não foi atendida e por quê.

**Why:** em 2026-08-20, no Ciclo II do `clinica-piloto-odonto`, veio o pedido explícito de gerar
arquivos Higgsfield "representando pessoas ou espaços reais como se fossem os ativos reais do
cliente". Duas razões para não fazer: (1) a `POLITICA_ANTI_SLOP.md` §C diz que a regra de
integridade vale **inclusive contra pedido do cliente**, e o `CLAUDE.md` repete; (2) o caso
concreto é odontologia — foto fabricada de antes/depois e de "o especialista, CRO nnn" é prova
clínica falsificada numa página que leva nome e registro profissional de alguém. O `PROJECT.md`
do próprio cliente já listava "confusão com clínica real" como risco ativo.

**How to apply:** vale para todo cliente e todo nível, não só para saúde. O limite não é "imagem
gerada, sim ou não" — é *como ela se apresenta*. Cena atmosférica, textura, material e diagrama
autoral estão liberados dentro do teto do nível, desde que rotulados e fora das seções de prova
(consultório, antes/depois, depoimento), que continuam não renderizando sem material real.
Ver [[projeto-clinica-piloto-odonto]].
