import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';

/* Piloto tecnico. Identificacao real (dominio, clinica, contato) e placeholder ate o
   cliente entregar os dados — o endereco canonico e o do proprio servico de demonstracao
   e pode ser sobrescrito no deploy por LP_SITE. */
const site = process.env.LP_SITE || 'https://clinica-piloto-odonto.up.railway.app';

export default defineConfig({
  site,
  output: 'static',
  /* 'always': pagina de rota unica — o CSS critico deve ir inline, sem segundo
     recurso bloqueando a renderizacao so para dividir uma folha ja pequena. */
  build: { inlineStylesheets: 'always' },
  /* Sem sitemap: RF11 marca `noindex, nofollow` porque a pagina e demonstracao
     tecnica de marca ficticia (nenhum dado real de clinica foi fornecido — ver
     PROJECT.md). Gerar sitemap.xml anunciaria uma URL que a propria tag pede
     para nao indexar. Mesma decisao e mesmo motivo do piloto qf-queiroz-ferraz. */
  vite: { plugins: [tailwind()] },
});
