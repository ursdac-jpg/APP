const L = require('./lib.js'); const M = require('./saisies3.js');
(async () => {
  const { b, p } = await M.assistantJusquALaPage();
  await M.collerReponseCv(p, L);
  await L.photo(p, 'assist-4b-apres-collage');
  console.log(await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('#btnSuivantNavigation, #btnContinuerCollage').forEach(e => { const r = e.getBoundingClientRect(); const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); out.push(`${e.id} visible=${e.offsetParent !== null} rect=${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)}x${Math.round(r.height)} disabled=${e.disabled} display=${getComputedStyle(e).display} dessus=${top ? top.tagName + '#' + top.id + '.' + top.className : 'rien'}`); });
    return out.join('\n');
  }));
  await b.close();
})();
