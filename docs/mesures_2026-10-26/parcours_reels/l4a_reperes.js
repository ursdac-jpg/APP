/* Lot L4a (D13, D14, D37) : Mes Repères avec un Repère, boutons flottants et champ de recherche. Mesure : recouvrement du bouton du Carnet avec « Garder une réflexion »,
   largeur du champ de recherche, débordement horizontal. Usage : CAPTURES=dossier [VIEWPORT=375x800] node l4a_reperes.js */
process.env.CONTROLES = '0';
const L = require('./lib.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await L.carte(p, 'boiteaoutils', 'btnCarteAccueilReperes', 'tuile Mes Repères');
  await L.clic(p, '#btnReperesIntroCommencer', 'Je commence'); await p.waitForTimeout(800);
  await L.clicTexte(p, 'Garder une réflexion', 'Garder une réflexion'); await p.locator('.reperes-type-btn', { hasText: 'Question' }).click(); await p.waitForTimeout(600);
  await p.locator('#reperesSaisieTexte').fill('Comment présenter mes quatre ans d’entretien de bureaux à un employeur ?'); await p.waitForTimeout(500);
  await p.locator('#reperesSaisieTerminer').click(); await p.waitForTimeout(1200);
  const m = await p.evaluate(() => {
    const r = e => { const q = e && e.getBoundingClientRect(); return q ? { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height), r: Math.round(q.right), b: Math.round(q.bottom) } : null; };
    const inter = (a, b) => (a && b) ? Math.max(0, Math.min(a.r, b.r) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.y, b.y)) : 0;
    const carnet = document.getElementById('btnCarnet'), garder = [...document.querySelectorAll('button')].find(e => /Garder une réflexion/.test(e.textContent) && e.offsetParent), champ = document.getElementById('reperesRechercheChamp');
    const rc = r(carnet), rg = r(garder), rch = r(champ);
    const flot = ['btnCarnet', 'btnJournalParcours', 'btnSessionTransfert'].map(id => ({ id, rect: r(document.getElementById(id)) })).filter(x => x.rect);
    return { vue: [innerWidth, innerHeight], carnet: rc, garder: rg, recouvrementCarnetGarderPx2: inter(rc, rg), champ: rch, placeholderCoupe: champ ? champ.scrollWidth > champ.clientWidth : null, debordement: document.documentElement.scrollWidth - innerWidth, flottants: flot };
  });
  console.log(JSON.stringify(m));
  await L.photo(p, 'l4a-' + (process.env.VIEWPORT || '1280'));
  await b.close();
})();
