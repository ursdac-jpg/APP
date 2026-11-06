// Teste des adresses une par une : code de réponse, adresse finale (redirections) et titre de la page.
// Usage : node scripts/veille_sas/tester_urls.js <url> <url> ...
// Lecture : 200 = répond ; 403/429/503 = le site bloque les robots (non concluant) ; ENOTFOUND = le nom de domaine n'existe pas ; erreur de certificat = non concluant.
const urls = process.argv.slice(2);
(async () => {
  for (const u of urls) {
    try {
      const r = await fetch(u, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(15000) });
      const t = await r.text(); const m = t.match(/<title[^>]*>([^<]*)/i);
      console.log(r.status, u, '->', r.url, '|', (m ? m[1].trim() : '').slice(0, 70));
    } catch (e) { console.log('ERR', u, (e.cause && e.cause.code) || e.message); }
  }
})();
