/* Essai RÉEL au pointeur de l'éditeur plein écran : on ouvre « Régler l'en-tête et les rectangles » sur Rectangles arrondis, on tire « Savoirs » par-dessus
   « Compétences comportementales » comme le ferait une personne, et on vérifie que plus aucun texte n'est caché (consigne 265, 12/11/2026).
   Utilisation : node scripts/rendu/essaiGlisserRectangles.js [sobre]
   Captures dans scripts/rendu/sorties_rectangles/. */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { ouvrir } = require('../parcours/lancerEssais.js');

(async () => {
  const sobre = process.argv.includes('sobre');
  const dossierSortie = path.join(__dirname, 'sorties_rectangles');
  fs.mkdirSync(dossierSortie, { recursive: true });
  const b = await chromium.launch();
  const p = await ouvrir(b, 1400);
  const erreurs = [];
  p.on('pageerror', (e) => erreurs.push('PAGE ' + e.message.slice(0, 200)));
  await p.goto('http://app.local/index.html');
  await p.waitForTimeout(3500);
  await p.mouse.click(3, 600);
  await p.evaluate(async (sobre) => {
    const attente = (ms) => new Promise((r) => setTimeout(r, ms));
    dossier.identite = { civilite: 'Madame', nom: 'Martin', prenom: 'Camille', ville: 'Limoges' };
    dossier.titreCV = 'Agent de sécurité';
    dossier.experiences = [{ poste: 'Agent', entreprise: 'Sécuritas', lieu: 'Limoges', dateDebut: '2022-01', dateFin: '2024-06', missions: 'Surveiller les accès\nContrôler les badges' }];
    dossier.formations = [{ niveau: 'CAP', intitule: 'Agent de prévention', etablissement: 'AFPA', annee: '2021', missions: 'Secourisme' }];
    dossier.competencesCV = ['Rigueur', 'Ponctualité', 'Sens du contact', 'Gestion du stress', 'Travail en équipe', 'Sécurité', 'Fiabilité', 'Responsabilité', 'Sang-froid', 'Discipline', 'Discrétion'];
    dossier.langues = [{ langue: 'Anglais', niveau: 'B1' }]; dossier.loisirs = ['Cuisine'];
    dossier.formatCV = 'pdf'; dossier.dernierDocumentPrepare = 'cv'; dossier.modeCreation = 'nouveau'; dossier.pdfReglages = null; dossier.reglagesMiseEnPageCV = null;
    naviguerVers('resultats'); await attente(4500);
    const w = document.querySelector('#zonePdfInlineCV iframe').contentWindow;
    if (sobre) { w._pdfChoisirVarianteSobre('mq-rectangles'); } else { w._pdfChoisirModeleCreatif('rectangles'); }
    await attente(4000);
    ouvrirPleinEcranMaquette(); await attente(3500);
  }, sobre);
  await p.click('#mqTEntete');
  await p.waitForTimeout(3000);
  const mesure = () => p.evaluate(() => {
    const d = document.getElementById('mqFrame').contentDocument, zone = d.querySelector('.rc-boxes.libre');
    if (!zone) { return { libre: false }; }
    const blcs = Array.from(zone.children).filter((e) => e.classList.contains('blc'));
    const z = (e) => parseInt(e.style.zIndex, 10) || 0;
    let caches = 0;
    const boites = blcs.map((blc, i) => {
      const box = blc.querySelector('.rc-box'), ul = box.querySelector('ul'), r = blc.getBoundingClientRect();
      Array.from(box.querySelectorAll('.rc-boxt, li')).forEach((el) => {
        const pl = d.createRange(); pl.selectNodeContents(el);
        Array.from(pl.getClientRects()).forEach((q) => {
          if (q.width <= 0) { return; }
          blcs.forEach((a, j) => { if (j !== i && (z(a) > z(blc) || (z(a) === z(blc) && j > i))) { const c = a.getBoundingClientRect(); if (!(q.right <= c.left + 1 || q.left >= c.right - 1 || q.bottom <= c.top + 1 || q.top >= c.bottom - 1)) { caches++; } } });
        });
      });
      return { bl: blc.getAttribute('data-bl'), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), cols: ul.style.columnCount || '-', rouge: blc.classList.contains('hors-cadre') };
    });
    return { libre: true, caches, boites, info: JSON.stringify(zone.__rcInfo || {}), zone: Math.round(zone.getBoundingClientRect().height), indice: (document.getElementById('mqHint') || {}).textContent };
  });
  const cadre = p.frameLocator('#mqFrame');
  console.log('avant le geste :', JSON.stringify(await mesure()));
  const b3 = await cadre.locator('.blc[data-bl="b3"]').boundingBox();
  const b2 = await cadre.locator('.blc[data-bl="b2"]').boundingBox();
  console.log('b3', JSON.stringify(b3), 'b2', JSON.stringify(b2));
  // On attrape « Savoirs » par son titre et on le pose au milieu de « Compétences comportementales ».
  const depart = { x: b3.x + b3.width / 2, y: b3.y + 22 };
  const arrivee = { x: b2.x + b2.width / 2 - 40, y: b2.y + b2.height * 0.55 };
  await p.mouse.move(depart.x, depart.y);
  await p.mouse.down();
  const pas = 14;
  for (let i = 1; i <= pas; i++) {
    await p.mouse.move(depart.x + (arrivee.x - depart.x) * i / pas, depart.y + (arrivee.y - depart.y) * i / pas);
    await p.waitForTimeout(40);
    if (i === 7) { console.log('en plein geste :', JSON.stringify((await mesure()).caches)); }
  }
  await p.screenshot({ path: path.join(dossierSortie, (sobre ? 'sobre_' : 'creatif_') + 'geste_en_cours.png') });
  await p.mouse.up();
  await p.waitForTimeout(2500);
  const apres = await mesure();
  console.log('après le geste :', JSON.stringify(apres));
  await p.screenshot({ path: path.join(dossierSortie, (sobre ? 'sobre_' : 'creatif_') + 'geste_fini.png') });
  // Redimensionner « Savoirs » à la poignée de droite, puis ré-ouvrir : rien ne doit rester caché
  const poi = await cadre.locator('.blc[data-bl="b3"] .poi-l').boundingBox();
  if (poi) {
    await p.mouse.move(poi.x + poi.width / 2, poi.y + poi.height / 2); await p.mouse.down();
    await p.mouse.move(poi.x + poi.width / 2 + 60, poi.y + poi.height / 2, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(2500);
    const larg = await mesure(); console.log('après élargissement de « Savoirs » :', JSON.stringify({ caches: larg.caches, zone: larg.zone }));
  }
  console.log(apres.caches === 0 ? 'OK : aucun texte caché après le geste' : 'ATTENTION : du texte reste caché');
  console.log('erreurs de page :', erreurs.length, erreurs.slice(0, 3).join(' | '));
  await b.close();
})();
