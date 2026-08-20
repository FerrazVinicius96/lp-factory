---
name: integridade-prova-social
description: Como tratar seção de prova social e afirmação factual quando o material do cliente não chegou — travar a seção, nunca preencher
metadata:
  type: feedback
---

Quando o brief **descreve** um ativo (depoimentos, antes/depois, fotos) mas os arquivos não vieram, a seção
entra no wireframe como **travada**: não renderiza, e o texto do bloco fica registrado em `copy.md` para
quando o material chegar. Nunca escrever depoimento de exemplo, nem "para ilustrar o formato".

**Why:** a política anti-slop trata isso como reprovação imediata (seção C), e o `tech-lead` confere item a
item contra o `brief.md`. Descrição de ativo no brief não é o ativo.

**How to apply:**
- Toda afirmação factual sobre a operação da clínica/escritório que não esteja no brief vira slot `{{...}}`
  inline + linha na tabela de pendências dizendo qual bloco ela trava. Vale também para protocolo clínico,
  prazo, garantia e condição comercial.
- Todo número precisa de `data-source` **na mesma linha** — o script `anti-slop-copy.mjs` lê linha a linha.
  Formato que funciona em markdown: `texto com o número <!-- data-source: brief.md §N · item -->`.
- O script casa `\d…(%|mil|milhão|clientes|empresas|alunos|projetos|anos|x)`: cuidado com "30 a 55 anos"
  numa nota de estratégia, que também precisa de fonte.
- Ao travar uma seção, dizer explicitamente quantas seções a página publica sem ela — evita que o
  designer preencha o vazio no Ciclo II.
