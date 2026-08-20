---
name: projeto-clinica-piloto-odonto
description: Estado do cliente clinica-piloto-odonto — direção B ("Visor") canônica; o gate devolveu por contraste de camada decorativa e a correção virou a regra da "zona de campo"
metadata:
  type: project
---

Em 2026-08-20 o Ciclo II do `clinica-piloto-odonto` (nível avançado, nicho odontologia-estética)
entregou três direções divergentes. O usuário aprovou a **direção B — "Visor"**, que virou canônica:
`tokens.json` espelha `proto/tokens-b.json`, `proto/direcao-b.html` é o protótipo, A e C foram para
`proto-descartado/` e a assinatura registrada em `templates/registry.json` é
`visor-campo-cheio-malha-regua-esquerda`.

O máster da imagem do herói **não fica em `public/`**: fica em `media-fonte/` (registro) e em
`src/assets/sintetico/` (entrada do pipeline do Astro). O protótipo apontou para
`public/media/sintetico/` por horas com a referência morta, e o campo não renderizava para
ninguém — inclusive no gate. Conferir caminho de imagem de protótipo abrindo a página, não lendo
o código.

**Why:** é piloto técnico de ponta a ponta, não entrega para publicação. Nenhum ativo real chegou —
sem nome de clínica, sem CRO, sem foto, sem vídeo, sem WhatsApp — então a restrição de projeto mais
forte não é estética: é que a página precisa **declarar a ausência** em vez de preenchê-la. A direção
B faz isso pelo motivo "malha de captura": onde há dado a malha fecha, onde não há ela abre.

Em 2026-08-20 o gate **devolveu a entrega com nota 3** (piso 5) por um defeito nascido no Ciclo II,
e a correção rendeu a regra mais reaproveitável desta direção — ver abaixo.

**How to apply:**
- **Duas restrições da direção B custam caro se esquecidas.** (1) O LCP é o bloco de headline de S1,
  então mídia no herói entra como `background-image` em camada decorativa, nunca como elemento de
  imagem com prioridade alta. (2) Não existe alfa admissível de camada decorativa sob texto: o traço
  dourado da crista (`--medida-clara`) derruba a leitura de apoio para 3,97:1 a 38% de alfa e 3,01:1
  a 50%. O máximo que a leitura de apoio aguentaria é 28%, e nem isso sobra depois do campo
  sintético. **Só zero fecha.**
- **A regra que saiu da correção: "zona de campo".** Máscara sozinha é meia garantia, e garantia
  gráfica é frágil — quem promete precisa ser a **posição**. Existe uma zona onde as camadas
  decorativas podem existir (faixa abaixo do texto no estreito, coluna à direita de um limite
  calculado no grid no largo), a zona nunca contém texto, e **a coluna de texto é limitada pelo
  mesmo token que define o limite**. Os dois lados da conta viram código. O comprimento da rampa da
  máscara dentro da zona volta a ser composição livre. Se eu aplicar disciplina de contraste a uma
  camada, aplicar às **todas** — o defeito foi ter mascarado o PNG e esquecido o SVG.
- **Um defeito de contraste também é um defeito de largura.** O `left: 42%` sem reduzir
  `width: 100%` fazia as duas coisas ao mesmo tempo: cobria texto no estreito e jogava a arcada
  para fora da tela no largo. Ninguém tinha visto porque ninguém tinha aberto a página.
- Herança para o Ciclo III: remover o bloco `data-proto-only` inteiro (reservas de S8/S9/S10 não vão
  ao ar), gerar AVIF/WebP a partir do máster PNG, medir qual elemento é reportado como LCP,
  reaplicar a zona de campo em `VisorHero.astro`/`CtaFinal.astro`, e acrescentar a barra flutuante
  mobile com a âncora `cta_flutuante`.
- Antes de qualquer conversa sobre publicação real, lembrar que a camada de conformidade CFO foi
  cortada por decisão de escopo e precisa ser reavaliada.

Ver [[feedback-integridade-midia-gerada]] e [[fluxo-impeccable-na-fabrica]].
