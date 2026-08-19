import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';

/* Piloto tecnico de marca ficticia. Nao existe dominio de cliente: o endereco
   canonico e o do proprio servico e pode ser sobrescrito no deploy por LP_SITE. */
const site = process.env.LP_SITE || 'https://qf-queiroz-ferraz.up.railway.app';

export default defineConfig({
  site,
  output: 'static',
  /* 'auto' nao inlinava nada: 25,7 KB brutos passam do limiar do Astro e a folha
     virava um terceiro recurso bloqueante. Com 'always' o critico vai inline e
     so a folha de fonte, cross-origin, bloqueia a renderizacao. */
  build: { inlineStylesheets: 'always' },
  /* Sem sitemap: esta pagina e `noindex, nofollow` e de marca ficticia —
     anunciar a URL em um sitemap contradiz a propria marcacao de demonstracao. */
  vite: { plugins: [tailwind()] },
});
