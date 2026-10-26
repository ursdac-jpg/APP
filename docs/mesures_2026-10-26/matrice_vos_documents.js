const { chromium } = require('playwright');
const SC = process.env.CAPTURES || require('os').tmpdir() + '/captures_vos_documents';
require('fs').mkdirSync(SC, { recursive: true });
const familles = [
  ['01-nouveau-main',      { modeCreation: 'nouveau', creationSansAssistant: true, dernierDocumentPrepare: 'cv' }, null],
  ['02-nouveau-assistant', { modeCreation: 'nouveau', creationSansAssistant: false, dernierDocumentPrepare: 'cv' }, null],
  ['03-recit',             { modeCreation: 'nouveau', decouverteTerminee: true, dernierDocumentPrepare: 'cv' }, null],
  ['04-maj',               { modeCreation: 'maj', cvAnalyse: true, dernierDocumentPrepare: 'cv' }, null],
  ['05-reformuler',        { modeCreation: 'maj', cvAnalyse: true, _origineReformuler: true, dernierDocumentPrepare: 'cv' }, null],
  ['06-voie3',             { modeCreation: 'maj', cvAnalyse: true, modeFidele: true, dernierDocumentPrepare: 'cv' }, 'cv-sans-assistant'],
  ['07-pret-lettre',       { modeCreation: 'pret', cvAnalyse: true, dernierDocumentPrepare: 'lettre' }, null],
  ['08-colettre',          { _origineCoLettre: true, dernierDocumentPrepare: 'lettre' }, null],
  ['09-prepa-entretien',   { dernierDocumentPrepare: 'entretien' }, 'prepa-entretien'],
  ['10-ucpm',              { modeCreation: 'maj', cvAnalyse: true, dernierDocumentPrepare: 'cv' }, 'un-cv-plusieurs-metiers'],
  ['11-bilan',             { dernierDocumentPrepare: 'cv' }, 'bilan'],
  ['12-direct',            { dernierDocumentPrepare: 'cv' }, null]
];
(async () => {
  const b = await chromium.launch();
  const sortie = [];
  for (const [nom, etat, origine] of familles) {
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    const err = [];
    p.on('pageerror', e => err.push(String(e).slice(0, 140)));
    await p.goto('' + (process.env.URL_APP || 'http://localhost:8123') + '/index.html');
    await p.waitForTimeout(3000);
    const r = await p.evaluate(async ({ etat, origine }) => {
      try {
        try { localStorage.clear(); } catch (e) {}
        Object.assign(dossier, etat);
        if (origine) { pageActuelle = origine; }
        naviguerVers('resultats');
        await new Promise(r => setTimeout(r, 2500));
        const barre = document.querySelector('.barre-etapes-bilan');
        const pastilles = barre ? [...barre.querySelectorAll('.pastille-etape-action-label')].map(e => e.textContent.trim()) : null;
        const actif = barre ? [...barre.children].map(c => c.className).join('|').slice(0, 0) : '';
        const ancienne = !!document.querySelector('.progression-etapes');
        const h1 = (document.querySelector('h1') || {}).textContent || '';
        const bas = [...document.querySelectorAll('.barre-navigation button')].map(b => b.textContent.trim().replace(/\s+/g, ' '));
        const retour = (document.querySelector('.barre-navigation button') || {}).getAttribute ? document.querySelector('.barre-navigation button').getAttribute('onclick') : null;
        const selecteur = !!document.querySelector('[data-doc], .selecteur-document, #selecteurDocument');
        return { route: pageActuelle, pastilles, ancienneBarre: ancienne, h1: h1.trim(), bas, retour, selecteur };
      } catch (e) { return { erreur: String(e).slice(0, 200) }; }
    }, { etat, origine });
    r.nom = nom; r.erreursPage = err.length;
    await p.screenshot({ path: `${SC}/${nom}.png`, fullPage: false });
    sortie.push(r);
    await p.close();
  }
  console.log(JSON.stringify(sortie, null, 1));
  await b.close();
})();
