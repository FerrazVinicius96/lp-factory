---
name: camada-decorativa-sobre-texto
description: Regra vinda de uma reprovação de gate — contraste de camada decorativa se garante por posição, não por opacidade, e vale para todas as camadas ou para nenhuma
metadata:
  type: feedback
---

Camada decorativa (imagem de fundo, SVG de motivo, textura) **não fica sobre texto**. A garantia é
posicional — a camada só existe numa zona que nunca contém texto — e não gráfica (opacidade baixa,
véu, rampa de máscara). E vale para **todas** as camadas da mesma superfície, não só para a que eu
lembrei de mascarar.

**Why:** em 2026-08-20 o `tech-lead` devolveu a entrega do `clinica-piloto-odonto` com nota 3 (piso
5) exatamente por isso. O protótipo tinha a disciplina de máscara aplicada ao PNG do herói e não ao
SVG do motivo, que era a camada com o traço **mais claro** da página. A conta original de contraste
modelava o traço azul fino e nunca o dourado, então o número declarado no `tokens.json` (4,64:1)
descrevia um traço que não era o problema. Real: 3,97:1 no mobile e 3,01:1 no desktop. O alfa
efetivo máximo que um texto de apoio aguenta de um traço dourado é ~28% — e nem esse sobra quando há
uma imagem por baixo. Só zero fecha.

Um segundo dano do mesmo bug: `left: 42%` numa camada `inset: 0; width: 100%` desloca sem estreitar,
então a camada transborda o container. O mesmo erro cobria texto no estreito e cortava o motivo no
largo. Deslocamento de camada absoluta que não mexe na largura é sempre suspeito.

**How to apply:**
- Antes de fechar qualquer direção com imagem ou motivo atrás de texto: liste **todas** as camadas
  decorativas da superfície e prove a zona de cada uma, não da que veio à cabeça.
- Ao declarar contraste no `tokens.json`, meça o traço **mais claro** que a camada pode produzir, não
  o traço típico. É o pior caso que o gate mede.
- Feche a conta dos dois lados: a zona define onde a decoração pode começar, e um `max-width` no
  contêiner de texto define onde o texto pode terminar. Máscara sem limite de coluna é meia
  garantia — basta um `h2` sem `max-width` para furá-la.
- Prove abrindo a página e medindo (ver [[fluxo-impeccable-na-fabrica]]), não relendo o CSS.

Ver [[projeto-clinica-piloto-odonto]] para a aplicação concreta ("zona de campo").
