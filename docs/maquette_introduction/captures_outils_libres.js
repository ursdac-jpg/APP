/* Captures réelles DANS les outils qui ne passent pas par l'assistant (Employeurs, Qui fait quoi, Repères, Carnet, Lexique, Comprendre le cadre, Comprendre les chiffres), pour l'Introduction (01/11/2026).
   Vue « modules ouverts » : Employeurs et Qui fait quoi s'ouvrent au public bientôt, l'Introduction doit en parler comme s'ils étaient là.
   Usage : URL_APP=http://localhost:8124 [SEUL=employeurs,repères] node captures_outils_libres.js */
const path = require('path');
process.env.CONTROLES = '0';
const SORTIE = process.env.SORTIE || path.join(__dirname, '_lib');
require('fs').mkdirSync(SORTIE, { recursive: true });
process.env.CAPTURES = SORTIE;
const R = path.join(__dirname, '..', 'mesures_2026-10-26', 'parcours_reels');
const L = require(path.join(R, 'lib.js'));
async function essai(fn, nom) { try { await fn(); } catch (e) { console.log('   (sauté) ' + nom + ' : ' + String(e).split('\n')[0].slice(0, 100)); } }
async function haut(p) { await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(500); }
async function vers(p, y, nom) { await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(500); await L.photo(p, nom); }
async function dept(p) { await essai(async () => { await L.clicTexte(p, 'Choisir mon département', 'dept'); await p.waitForTimeout(700); await L.clicTexte(p, 'Haute-Vienne (87)', 'Haute-Vienne'); await p.waitForTimeout(2500); }, 'département'); }
async function tuile(p, texte) { await p.locator('.sous-carte-accueil', { hasText: texte }).first().click({ timeout: 4000 }); await p.waitForTimeout(2500); }

const SCENARIOS = {
  employeurs: async (p) => {
    await L.carte(p, 'preparer', 'btnCarteAccueilEmployeurs', 'tuile Employeurs'); await p.waitForTimeout(1500);
    await L.clic(p, '#btnEmployeursCommencer', 'Voir les employeurs'); await p.waitForTimeout(2000);
    await dept(p); await haut(p); await L.photo(p, 'employeurs_1_domaines');
    await essai(() => tuile(p, 'Employeurs qui publient'), 'tuile publient'); await haut(p); await L.photo(p, 'employeurs_2_liste'); await vers(p, 600, 'employeurs_3_liste_suite'); await vers(p, 1200, 'employeurs_4_liste_suite');
    console.log((await p.evaluate(() => [...document.querySelectorAll('button, a.btn')].filter(e => e.offsetParent !== null).map(e => (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)).slice(0, 14).join(' | '))));
  },
  quifaitquoi: async (p) => {
    await L.carte(p, 'informe', 'btnCarteAccueilMonTerritoire', 'tuile Qui fait quoi');
    await L.clic(p, '#btnMonTerritoireCommencer', 'Ouvrir'); await p.waitForTimeout(2000);
    await dept(p); await haut(p); await L.photo(p, 'qfq_1_accueil');
    console.log((await p.evaluate(() => [...document.querySelectorAll('button, a.btn, .sous-carte-accueil')].filter(e => e.offsetParent !== null).map(e => (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)).slice(0, 20).join(' | '))));
    await essai(() => tuile(p, 'Emploi'), 'tuile Emploi'); await haut(p); await L.photo(p, 'qfq_2_emploi'); await vers(p, 600, 'qfq_3_emploi_suite'); await vers(p, 1200, 'qfq_4_emploi_suite');
  },
  reperes: async (p) => {
    await L.carte(p, 'boiteaoutils', 'btnCarteAccueilReperes', 'tuile Mes Repères');
    await L.clic(p, '#btnReperesIntroCommencer', 'Je commence'); await p.waitForTimeout(1200);
    for (const [type, texte] of [[0, 'Comment présenter mes quatre ans d’entretien de bureaux à un employeur ?'], [1, 'Demander une formation en autolaveuse à ma conseillère.'], [0, 'Est-ce que je peux candidater à la mairie sans concours ?']]) {
      await essai(async () => {
        await L.clicTexte(p, 'Garder une réflexion', 'Garder une réflexion'); await p.locator('.reperes-type-btn').nth(type).click({ timeout: 3000 }); await p.waitForTimeout(500);
        await p.locator('#reperesSaisieTexte').fill(texte); await p.waitForTimeout(400); await p.locator('#reperesSaisieTerminer').click(); await p.waitForTimeout(1200);
      }, 'repère ' + type);
    }
    await haut(p); await L.photo(p, 'reperes_1_liste');
  },
  carnet: async (p) => {
    await L.carte(p, 'boiteaoutils', 'btnCarteAccueilCarnet', 'tuile Mon Carnet');
    await L.clic(p, '#btnCarnetIntroOuvrir', 'Ouvrir mon Carnet'); await p.waitForTimeout(1200);
    for (const t of ['Ma conseillère m’a dit de relancer les employeurs le jeudi.', 'Appeler l’agence d’intérim de Limoges lundi matin, demander Mme Roche.']) {
      await essai(async () => { await p.locator('textarea:visible').first().fill(t); await p.waitForTimeout(500); await L.clic(p, '#btnCarnetGarder', '+ Noter'); await p.waitForTimeout(900); }, 'note');
    }
    await haut(p); await L.photo(p, 'carnet_1_notes');
  },
  lexique: async (p) => {
    await L.carte(p, 'boiteaoutils', 'btnCarteAccueilLexique', 'tuile Lexique');
    await essai(() => L.clic(p, '#btnLexiqueIntroCommencer', 'Ouvrir le lexique'), 'ouvrir lexique'); await p.waitForTimeout(1200);
    await essai(async () => { const c = p.locator('input[type=text]:visible').first(); await c.click(); await c.pressSequentially('CDD', { delay: 90 }); await p.waitForTimeout(1200); await haut(p); await L.photo(p, 'lexique_1_recherche'); await p.locator('text=CDD ou intérim').first().click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(500); await L.clicTexte(p, 'CDD', 'fiche CDD'); await p.waitForTimeout(1500); }, 'recherche CDD');
    await haut(p); await L.photo(p, 'lexique_2_fiche');
  },
  cadre: async (p) => {
    await L.carte(p, 'informe', 'btnCarteAccueilCadre', 'tuile Comprendre le cadre');
    await essai(() => p.locator('button', { hasText: /Choisir mon département|Commencer|Ouvrir/ }).first().click({ timeout: 3000 }), 'ouvrir'); await p.waitForTimeout(1500);
    await dept(p); await haut(p); await L.photo(p, 'cadre_1_accueil'); await vers(p, 500, 'cadre_2_suite');
    await essai(async () => { await p.locator('.sous-carte-accueil, .cadre-rayon, button', { hasText: 'Emploi et contrats' }).first().click({ timeout: 3000 }); await p.waitForTimeout(1500); }, 'rayon');
    await haut(p); await L.photo(p, 'cadre_3_rayon');
    await essai(async () => { await p.getByText('La période d’essai', { exact: false }).first().click({ timeout: 3000 }); await p.waitForTimeout(1500); }, 'fiche');
    await haut(p); await L.photo(p, 'cadre_4_fiche');
  },
  chiffres: async (p) => {
    await L.carte(p, 'informe', 'btnCarteAccueilChiffres', 'tuile Comprendre les chiffres');
    await L.clic(p, '#btnComprendreLesChiffresCommencer', 'Ouvrir'); await p.waitForTimeout(2000);
    await dept(p); await haut(p); await L.photo(p, 'chiffres_1_territoire'); await vers(p, 600, 'chiffres_2_suite'); await vers(p, 1200, 'chiffres_3_suite');
  }
};

(async () => {
  const seul = (process.env.SEUL || '').split(',').filter(Boolean);
  for (const nom of Object.keys(SCENARIOS)) {
    if (seul.length && seul.indexOf(nom) === -1) { continue; }
    console.log('######## ' + nom);
    const { b, p } = await L.ouvrir();
    await essai(() => SCENARIOS[nom](p), nom);
    console.log('   erreurs page :', p.errs);
    await b.close();
  }
})();
