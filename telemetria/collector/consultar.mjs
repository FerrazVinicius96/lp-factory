/**
 * Agrega os Web Vitals de campo do dia e imprime uma linha JSONL por site.
 * A rotina das 23h redireciona a saida para clients/<slug>/logs/runtime.jsonl.
 *
 * Uso: DATABASE_URL=... node consultar.mjs [--horas 24] [--site dominio]
 */
import pg from 'pg';

const args = process.argv.slice(2);
const val = (f, d) => {
  const i = args.indexOf(f);
  return i === -1 ? d : args[i + 1];
};

const horas = Number(val('--horas', 24));
const site = val('--site', null);

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });

const { rows } = await pool.query(
  `SELECT site, metrica,
          percentile_cont(0.75) WITHIN GROUP (ORDER BY valor) AS p75,
          count(*) AS amostras
     FROM vitals
    WHERE criado > now() - ($1 || ' hours')::interval
      AND ($2::text IS NULL OR site = $2)
    GROUP BY site, metrica`,
  [String(horas), site]
);

const porSite = {};
for (const r of rows) {
  porSite[r.site] ??= { ev: 'runtime', fonte: 'rum', janelaHoras: horas, amostras: 0 };
  porSite[r.site][r.metrica] = +Number(r.p75).toFixed(3);
  porSite[r.site].amostras = Math.max(porSite[r.site].amostras, Number(r.amostras));
}

for (const [s, v] of Object.entries(porSite)) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), site: s, ...v }));
}

await pool.end();
