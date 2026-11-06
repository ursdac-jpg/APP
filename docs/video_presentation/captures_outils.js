// Refait les trois captures des outils privés du diaporama (images/introduction/i_veille_1_accueil, i_veille_2_sas, i_prospection_1_carnet).
// Lancer : node docs/video_presentation/captures_outils.js   (depuis le dossier Site_V2)
// Les deux outils sont démarrés ici SANS ouvrir le navigateur de Denis. L'outil de prospection tourne sur un dossier de données temporaire
// (sept entreprises inventées) et une sauvegarde temporaire : le carnet réel de Denis n'est ni lu ni écrit. L'outil de veille n'écrit rien dans cet essai
// (aucun bouton n'est cliqué à part « À valider », qui ne fait qu'ouvrir la fenêtre).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright');

const SITE = path.resolve(__dirname, '..', '..');
const SORTIE = path.join(SITE, 'images', 'introduction') + path.sep;
const PROSPECTION = path.resolve(SITE, '..', 'PROSPECTION');

// Sept entreprises inventées, de la forme du carnet de l'outil de prospection.
const INVENTEES = [
  ['Boulangerie du Pont Neuf', 'Commerce de détail', 'À contacter', 1, 'Périgueux', '24000', '12 rue de la Gare'],
  ['Menuiserie Lacombe', 'Bâtiment et travaux publics', 'Contactée', 2, 'Bergerac', '24100', '4 route des Prés'],
  ['Garage des Tilleuls', 'Réparation automobile', 'A répondu', 2, 'Limoges', '87000', '27 avenue du Stade'],
  ['Maison de retraite Les Cèdres', 'Santé et action sociale', 'Contactée', 3, 'Sarlat-la-Canéda', '24200', '8 chemin des Écoles'],
  ['Entrepôt Logis Plus', 'Transport et logistique', 'À contacter', 1, 'Brive-la-Gaillarde', '19100', 'Zone d\'activité Nord'],
  ['Restaurant La Table du Marché', 'Hôtellerie et restauration', 'Pas pour moi', 1, 'Nontron', '24300', '3 place du Marché'],
  ['Atelier Vert Jardin', 'Espaces verts', 'A répondu', 3, 'Saint-Junien', '87200', '15 rue des Vignes']
];
function carnetInvente() {
  const entrees = {};
  INVENTEES.forEach((x, i) => {
    const siret = String(99999100000000 + i);
    entrees[siret] = { siret: siret, siren: siret.slice(0, 9), nom: x[0], adresse: x[6] + ' ' + x[5] + ' ' + x[4].toUpperCase(), secteur: x[1], etape: x[3], statut: x[2], notes: '',
      telephone: '', mail: '', site: '', recrutement: '', adressePostale: '', accordStages: '', personne: false, partielle: false, commune: x[4].toUpperCase(), codePostal: x[5],
      rue: x[6], vuBonneBoite: false, vuImmersion: false, annonces: null, ajoutLe: '2026-10-2' + i + 'T10:00:00.000Z' };
    if (x[2] !== 'À contacter' && x[2] !== 'Pas pour moi') { entrees[siret].contacteLe = '2026-10-2' + i + 'T14:00:00.000Z'; }
  });
  return { entrees: entrees, lot: [], enregistreLe: '2026-11-01T10:00:00.000Z' };
}

function demarrer(module, options) {
  return new Promise((resolve, reject) => { module.demarrer(0, (e, s) => (e ? reject(e) : resolve(s)), 10, options); });
}

(async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'captures_outils_'));
  fs.mkdirSync(path.join(temp, 'donnees'));
  fs.mkdirSync(path.join(temp, 'sauvegarde'));
  fs.writeFileSync(path.join(temp, 'donnees', 'carnet.json'), JSON.stringify(carnetInvente()));
  process.env.PROSPECTION_DONNEES = path.join(temp, 'donnees');

  const veille = await demarrer(require(path.join(SITE, 'outils', 'serveur_veille.js')));
  const prospection = await demarrer(require(path.join(PROSPECTION, 'serveur_prospection.js')),
    { dossierDonnees: path.join(temp, 'donnees'), dossierSauvegarde: path.join(temp, 'sauvegarde') });

  const navigateur = await chromium.launch();
  const erreurs = [];
  // L'outil de veille : dates de passage d'exemple (un navigateur neuf n'a pas celles de l'ordinateur de Denis), bouton « Travailler avec Claude » masqué.
  const ctxV = await navigateur.newContext({ viewport: { width: 1000, height: 720 }, deviceScaleFactor: 1 });
  await ctxV.addInitScript(() => {
    try {
      localStorage.setItem('veille_hebdo_derniere', '2026-10-31');
      localStorage.setItem('veille_faits', JSON.stringify({ mois: '2026-11-01', reseau: '2026-10-24', chiffres: '2026-10-20', lexique: '2026-10-27', manuel: '2026-10-29' }));
    } catch (e) { /* tant pis */ }
  });
  const pv = await ctxV.newPage();
  pv.on('pageerror', (e) => erreurs.push(String(e)));
  await pv.goto('http://127.0.0.1:' + veille.address().port + '/veille.html');
  await pv.waitForTimeout(2500);
  await pv.addStyleTag({ content: '#btnTravClaude{visibility:hidden !important}' });
  await pv.screenshot({ path: SORTIE + 'i_veille_1_accueil.png' });
  await pv.evaluate(() => document.getElementById('chgOuvrir').click());
  await pv.waitForTimeout(2000);
  await pv.screenshot({ path: SORTIE + 'i_veille_2_sas.png' });

  const pp = await (await navigateur.newContext({ viewport: { width: 1000, height: 720 }, deviceScaleFactor: 1 })).newPage();
  pp.on('pageerror', (e) => erreurs.push(String(e)));
  await pp.goto('http://127.0.0.1:' + prospection.address().port + '/prospection.html');
  await pp.waitForTimeout(1500);
  await pp.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Mon carnet/.test(x.textContent)); if (b) { b.click(); } });
  await pp.waitForTimeout(1000);
  await pp.screenshot({ path: SORTIE + 'i_prospection_1_carnet.png' });

  console.log('erreurs de page :', JSON.stringify(erreurs));
  await navigateur.close();
  veille.close();
  prospection.close();
  fs.rmSync(temp, { recursive: true, force: true });
})().catch((e) => { console.log('ECHEC', e && e.message); process.exit(1); });
