/* Captures réelles DANS les outils (pas les pages d'explication), pour l'Introduction (01/11/2026).
   Un personnage inventé (Camille Martin) crée son CV à la main, puis chaque outil est joué avec de vrais clics ;
   la réponse de l'assistant en ligne est une réponse d'exemple (fichiers de docs/mesures_2026-10-26/parcours_reels/), collée par le vrai bouton « Coller la réponse ».
   Lecture seule pour l'application. Usage : URL_APP=http://localhost:8124 [SEUL=bilan,ats] node captures_modules_interieur.js */
const path = require('path');
process.env.CONTROLES = '0';
const SORTIE = process.env.SORTIE || path.join(__dirname, '_int');
require('fs').mkdirSync(SORTIE, { recursive: true });
process.env.CAPTURES = SORTIE;
const R = path.join(__dirname, '..', 'mesures_2026-10-26', 'parcours_reels');
const L = require(path.join(R, 'lib.js')); const S = require(path.join(R, 'saisies.js'));
const CV = require(path.join(R, 'cvtexte.js'));
const fix = (n) => { try { return require(path.join(R, n)); } catch (e) { return null; } };

const MODULES = {
  bilan: { route: 'bilan', debut: '#btnBilanIntroCommencer', prep: ['Un métier précis', 'Je me présente de façon générale'], fixture: 'bilan.js', voir: '#btnContinuerCollage' },
  ats: { route: 'ats-intro', debut: '#btnAtsCommencer', prep: ['Un métier précis', 'Je cherche simplement un emploi'], fixture: 'ats.js', voir: '#btnContinuerCollage' },
  lettre: { route: 'co-lettre', debut: '#btnCoLettreCommencer', prep: ['Candidature spontanée', 'Un métier précis', 'Je me présente de façon générale', 'En recherche d’emploi'], fixture: 'lettre.js', voir: '#btnContinuerCollage' },
  entretien: { route: 'prepa-entretien', debut: '#btnPrepaEntretienCommencer', prep: ['Candidature spontanée', 'Un métier précis', 'Je me présente de façon générale', 'En recherche d’emploi'], fixture: 'entretien.js', voir: '#btnContinuerCollage' },
  coherence: { route: 'coherence-transversale', debut: '#ctBoutonJeCommence', prep: [], fixture: 'coherence.js', voir: '#btnContinuerCollage' },
  regard: { route: 'regard-recruteur-intro', debut: '#btnRegardRecruteurCommencer', prep: ['Lire le contenu seul'], fixture: 'regard.js', voir: '#btnContinuerCollage' }
};

async function creerCamille(p) {
  await L.clicTexte(p, 'Mes documents', 'carte'); await L.clic(p, '#btnCarteAccueilCvNouveau', 'tuile'); await L.clic(p, '#btnCreerCvSansAssistant', 'main');
  await L.clicTexte(p, 'Commencer mon CV', 'Commencer'); await S.objectifSpontanee(p, L); await L.clic(p, '#btnSuivantNavigation', 'c1');
  await S.identite(p, L); await S.experience(p, L); await L.clic(p, '#btnSuivantNavigation', 'c2'); await S.parcoursQuatreQuestions(p, L);
  await L.clic(p, '#btnSuivantNavigation', 'c3'); await L.clic(p, '#btnSuivantNavigation', 'c4'); await p.waitForTimeout(3000);
}
async function essai(p, fn, nom) { try { await fn(); } catch (e) { console.log('   (sauté) ' + nom + ' : ' + String(e).split('\n')[0].slice(0, 90)); } }
async function haut(p) { await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(400); }

async function jouer(p, nom, cfg) {
  console.log('######## ' + nom);
  await p.evaluate((r) => naviguerVers(r), cfg.route); await p.waitForTimeout(1500);
  await essai(p, () => p.locator(cfg.debut).click({ timeout: 4000 }), 'début'); await p.waitForTimeout(2000);
  if (await p.locator('#depotPageColler').count()) {
    await essai(p, async () => { await p.locator('#depotPageColler').click({ timeout: 3000 }); await p.waitForTimeout(600); await p.locator('#depotPageTexte').fill(CV); await p.waitForTimeout(800); await p.locator('#depotPageLireTexte').click({ timeout: 3000 }); await p.waitForTimeout(2500); }, 'dépôt du CV par le texte');
    await essai(p, () => p.getByText('Retirer tout ce qui est en jaune', { exact: false }).first().click({ timeout: 2000 }), 'retirer le jaune'); await p.waitForTimeout(600);
  }
  await essai(p, () => p.locator('#verifDocBtnEnregistrer').click({ timeout: 2500 }), 'enregistrer le CV'); await p.waitForTimeout(1500);
  for (const t of cfg.prep) { await essai(p, () => p.getByText(t, { exact: false }).first().click({ timeout: 2500 }), t); await p.waitForTimeout(500); }
  await haut(p); await L.photo(p, nom + '_1_preparer');
  const bas = await p.evaluate(() => [...document.querySelectorAll('.barre-navigation-fixe button')].filter(e => e.offsetParent).map(e => (e.disabled ? '(grisé) ' : '') + e.textContent.trim()).join(' | '));
  console.log('   barre du bas :', bas);
  const fx = fix(cfg.fixture);
  if (!fx) { console.log('   pas de réponse d’exemple'); return; }
  await essai(p, async () => { await p.locator('.barre-navigation-fixe button').last().click({ timeout: 3000 }); }, 'continuer');
  await p.waitForTimeout(2500); await haut(p); await L.photo(p, nom + '_2_assistant');
  await essai(p, () => p.getByText('Claude', { exact: false }).first().click({ timeout: 3000 }), 'assistant');
  await p.waitForTimeout(1200);
  await essai(p, () => p.getByText('Je comprends, continuer', { exact: false }).first().click({ timeout: 3000 }), 'je comprends'); await p.waitForTimeout(3000);
  await essai(p, () => p.locator('#btnContinuerMaintenantIA').click({ timeout: 3000 }), 'ouvrir maintenant'); await p.waitForTimeout(2500);
  await essai(p, () => p.locator('button', { hasText: 'Je suis de retour' }).first().click({ timeout: 3000 }), 'je suis de retour'); await p.waitForTimeout(1500);
  await haut(p); await L.photo(p, nom + '_3_collage');
  await p.evaluate((txt) => navigator.clipboard.writeText(txt), '```json\n' + JSON.stringify(fx) + '\n```');
  await essai(p, () => p.locator('button', { hasText: 'Coller la réponse' }).first().click({ timeout: 3000 }), 'coller la réponse'); await p.waitForTimeout(3500);
  await essai(p, () => p.locator(cfg.voir).click({ timeout: 3000 }), 'voir le résultat'); await p.waitForTimeout(3500);
  for (let i = 0; i < 4; i++) { await p.evaluate((y) => window.scrollTo(0, y), i * 600); await p.waitForTimeout(500); await L.photo(p, nom + '_4_resultat' + i); }
  console.log('   fin : route', await p.evaluate(() => pageActuelle + ' | ' + ((document.querySelector('h1') || {}).textContent || '').trim().slice(0, 50)));
}

(async () => {
  const seul = (process.env.SEUL || '').split(',').filter(Boolean);
  for (const nom of Object.keys(MODULES)) {
    if (seul.length && seul.indexOf(nom) === -1) { continue; }
    const { b, p } = await L.ouvrir();
    await creerCamille(p);
    await jouer(p, nom, MODULES[nom]);
    console.log('   erreurs page :', p.errs);
    await b.close();
  }
})();
