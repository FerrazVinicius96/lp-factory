/* Beacon de Web Vitals de campo. Servido como /rum.js, cap de 1.5 KB gzip.
   Fica fora do orcamento de design porque e instrumentacao da fabrica, nao escolha estetica.
   Sem dependencia: PerformanceObserver direto, um unico envio no pagehide. */
(function () {
  var url = (document.currentScript && document.currentScript.getAttribute('data-endpoint')) || '/_vitals';
  var lcp = 0, cls = 0, inp = 0;

  function obs(tipo, fn, extra) {
    try {
      var o = new PerformanceObserver(function (l) { l.getEntries().forEach(fn); });
      var cfg = { type: tipo, buffered: true };
      if (extra) for (var k in extra) cfg[k] = extra[k];
      o.observe(cfg);
    } catch (e) { /* sem suporte: silencio */ }
  }

  obs('largest-contentful-paint', function (e) { lcp = e.startTime; });
  obs('layout-shift', function (e) { if (!e.hadRecentInput) cls += e.value; });
  obs('event', function (e) { if (e.duration > inp) inp = e.duration; }, { durationThreshold: 40 });

  addEventListener('pagehide', function () {
    var nav = performance.getEntriesByType('navigation')[0];
    var m = [
      { n: 'lcp', v: Math.round(lcp) },
      { n: 'cls', v: +cls.toFixed(3) },
      { n: 'inp', v: Math.round(inp) }
    ];
    if (nav) m.push({ n: 'ttfb', v: Math.round(nav.responseStart) });
    try {
      navigator.sendBeacon(url, JSON.stringify({ p: location.pathname, m: m, t: Date.now() }));
    } catch (e) { /* nada a fazer */ }
  }, { once: true });
})();
