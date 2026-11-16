/* Essai réel du message jaune « Votre CV dépasse un peu la page » (consigne 265, 12/11/2026).
   Méthode : l'application est ouverte comme pour une vraie personne, un CV TRÈS rempli est posé, le modèle « Rectangles arrondis » est choisi,
   puis on lit le message (texte, couleurs, boutons), on clique « Je le laisse tel quel », on rechange de modèle, et on prend des captures (clair et sombre).
   Utilisation : node scripts/rendu/essaiMessageDepasse.js
   Captures dans scripts/rendu/sorties_rectangles/. */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { ouvrir } = require('../parcours/lancerEssais.js');

(async () => {
  const dossierSortie = path.join(__dirname, 'sorties_rectangles');
  fs.mkdirSync(dossierSortie, { recursive: true });
  const b = await chromium.launch();
  const p = await ouvrir(b, 1280);
  const erreurs = [];
  p.on('pageerror', (e) => erreurs.push('PAGE ' + e.message.slice(0, 200)));
  await p.goto('http://app.local/index.html');
  await p.waitForTimeout(3500);
  await p.mouse.click(3, 600);
  await p.evaluate(async () => {
    const attente = (ms) => new Promise((r) => setTimeout(r, ms));
    const miss = (n) => Array.from({ length: n }, (_, i) => 'Mission numéro ' + (i + 1) + ' réalisée avec rigueur et sérieux au quotidien').join('\n');
    dossier.identite = { civilite: 'Madame', nom: 'Martin', prenom: 'Camille', ville: 'Limoges' };
    dossier.titreCV = 'Agent de sécurité incendie et prévention';
    dossier.experiences = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => ({ poste: 'Agent de sécurité ' + i, entreprise: 'Entreprise ' + i, lieu: 'Limoges', dateDebut: (2010 + i * 2) + '-01', dateFin: (2011 + i * 2) + '-12', missions: miss(6) }));
    dossier.formations = [{ niveau: 'CAP', intitule: 'Agent de prévention', etablissement: 'AFPA', annee: '2021', missions: 'Secourisme' }, { niveau: 'BEP', intitule: 'Vente', etablissement: 'Lycée Turgot', annee: '2018', missions: '' }];
    dossier.competencesCV = ['Rigueur', 'Ponctualité', 'Sens du contact', 'Gestion du stress', 'Travail en équipe', 'Sécurité', 'Fiabilité', 'Responsabilité', 'Sang-froid'];
    dossier.langues = [{ langue: 'Anglais', niveau: 'B1' }]; dossier.loisirs = ['Cuisine', 'Course à pied', 'Lecture'];
    dossier.certifications = ['Sensibilisation amiante (2026)', 'Habilitation échafaudage (2026)', 'Module travail en hauteur (2026)', 'Habilitation électrique (2026)'];
    dossier.formatCV = 'pdf'; dossier.dernierDocumentPrepare = 'cv'; dossier.modeCreation = 'nouveau'; dossier.pdfReglages = null; dossier.reglagesMiseEnPageCV = null;
    naviguerVers('resultats'); await attente(4500);
    const w = () => document.querySelector('#zonePdfInlineCV iframe').contentWindow;
    w()._pdfChoisirModeleCreatif('rectangles'); await attente(4000);
  });
  const lire = () => p.evaluate(() => {
    const a = document.getElementById('mepAvertPage');
    if (!a) { return { present: false }; }
    const cs = getComputedStyle(a), btns = Array.from(a.querySelectorAll('button')).map((x) => x.innerText);
    const feuille = document.querySelector('#zonePdfInlineCV iframe').contentDocument.querySelector('.page-a4');
    return { present: true, visible: a.style.display !== 'none', texte: a.innerText.replace(/\s+/g, ' ').trim(), fond: cs.backgroundColor, bordure: cs.borderLeftColor, boutons: btns, hauteurFeuille: feuille ? feuille.scrollHeight : 0, info: (document.getElementById('mepInfoPage') || {}).innerText };
  });
  let r = await lire();
  console.log('à l\'ouverture :', JSON.stringify(r));
  await (await p.$('#mepAvertPage')).scrollIntoViewIfNeeded().catch(() => {});
  await p.screenshot({ path: path.join(dossierSortie, 'message_depasse_clair.png') });
  await p.evaluate(() => document.documentElement.setAttribute('data-theme', 'sombre'));
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(dossierSortie, 'message_depasse_sombre.png') });
  console.log('sombre :', JSON.stringify(await lire()));
  await p.evaluate(() => document.documentElement.setAttribute('data-theme', 'clair'));
  const voir = await p.$('[data-mep-depasse-voir]');
  if (voir) { await voir.click(); await p.waitForTimeout(1500); console.log('après « Voir les propositions » : panneau ouvert = ' + await p.evaluate(() => !!_mepSuggestionsOuvert)); await (await p.$('[data-mep-sugg-ouvrir]')).click(); await p.waitForTimeout(800); }
  console.log('après fermeture du panneau :', JSON.stringify(await lire()).slice(0, 400)); await p.waitForTimeout(2500); console.log('2,5 s plus tard :', JSON.stringify(await lire()).slice(0, 300)); const laisser2 = await p.$('[data-mep-depasse-laisser]'); console.log('bouton « Je le laisse tel quel » trouvé : ' + !!laisser2); if (laisser2) { await laisser2.click(); await p.waitForTimeout(800); }
  r = await lire();
  console.log('après « Je le laisse tel quel » :', JSON.stringify({ visible: r.visible, hauteur: r.hauteurFeuille, memoire: await p.evaluate(() => _mepDepasseLaisseHauteur) }));
  await p.evaluate(async () => { const w = document.querySelector('#zonePdfInlineCV iframe').contentWindow; w._pdfRafraichir(); await new Promise((ok) => setTimeout(ok, 1500)); });
  r = await lire();
  console.log('après un rafraîchissement sans changement :', JSON.stringify({ visible: r.visible }));
  console.log('erreurs de page :', erreurs.length, erreurs.slice(0, 3).join(' | '));
  await b.close();
})();
