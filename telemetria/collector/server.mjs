/**
 * Coletor de Web Vitals de campo. Um servico na Railway, compartilhado por todas as landing pages.
 * Recebe o beacon de /rum.js e grava no Postgres do projeto.
 *
 * Variaveis: DATABASE_URL (obrigatoria), ORIGENS_PERMITIDAS (csv de dominios), PORT.
 * Sem dado pessoal: caminho, metricas e timestamp. Nada de IP, cookie ou identificador.
 */
import { createServer } from 'node:http';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 4 });
const permitidas = (process.env.ORIGENS_PERMITIDAS || '').split(',').map((s) => s.trim()).filter(Boolean);

await pool.query(`
  CREATE TABLE IF NOT EXISTS vitals (
    id       bigserial PRIMARY KEY,
    site     text NOT NULL,
    caminho  text NOT NULL,
    metrica  text NOT NULL,
    valor    double precision NOT NULL,
    criado   timestamptz NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS vitals_site_criado ON vitals (site, criado DESC);
`);

const cors = (req) => {
  const o = req.headers.origin || '';
  if (!permitidas.length) return '*';
  return permitidas.some((p) => o.endsWith(p)) ? o : '';
};

createServer(async (req, res) => {
  const origem = cors(req);
  res.setHeader('Access-Control-Allow-Origin', origem || 'null');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');

  if (req.method === 'OPTIONS') return res.writeHead(204).end();
  if (req.method === 'GET' && req.url === '/saude') return res.writeHead(200).end('ok');
  if (req.method !== 'POST') return res.writeHead(405).end();
  if (!origem) return res.writeHead(403).end();

  let corpo = '';
  req.on('data', (c) => {
    corpo += c;
    if (corpo.length > 8192) req.destroy();
  });

  req.on('end', async () => {
    try {
      const { p, m } = JSON.parse(corpo);
      const site = new URL(req.headers.origin).hostname;
      const linhas = (m || []).filter((x) => x && typeof x.v === 'number' && Number.isFinite(x.v)).slice(0, 8);
      for (const x of linhas) {
        await pool.query('INSERT INTO vitals (site, caminho, metrica, valor) VALUES ($1,$2,$3,$4)', [
          site, String(p || '/').slice(0, 200), String(x.n).slice(0, 16), x.v,
        ]);
      }
      res.writeHead(204).end();
    } catch {
      res.writeHead(400).end();
    }
  });
}).listen(process.env.PORT || 3000, () => console.log('coletor de vitals no ar'));
