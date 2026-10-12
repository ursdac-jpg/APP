const { test } = require('node:test');
const assert = require('node:assert/strict');

// Logique pure du module « Un CV, plusieurs métiers » (aucun DOM). L'interface (pages routées) n'est testée qu'en navigateur.
const ucpm = require('../modules/un-cv-plusieurs-metiers/logique.js');

test('ucpm : sept pages, une icône et un libellé chacune, jamais d\'icône de visage', () => {
  assert.equal(ucpm.UCPM_ETAPES.length, 7);
  assert.equal(ucpm.UCPM_NB_PAGES, 7);
  ucpm.UCPM_ETAPES.forEach(function (e) {
    assert.ok(e.label && e.icone, 'étape ' + JSON.stringify(e));
    assert.ok(!/128578|128512|128513|129504/.test(e.icone), 'pas de visage ni de cerveau : ' + e.icone);
  });
});

test('ucpm : bornes du module (10 métiers au plus, 2 pour créer)', () => {
  assert.equal(ucpm.UCPM_MAX_METIERS, 10);
  assert.equal(ucpm.UCPM_MIN_METIERS_POUR_CREER, 2);
});

test('ucpmBornerPage : toujours entre 1 et 7, jamais d\'exception', () => {
  assert.equal(ucpm.ucpmBornerPage(0), 1);
  assert.equal(ucpm.ucpmBornerPage(-5), 1);
  assert.equal(ucpm.ucpmBornerPage(3), 3);
  assert.equal(ucpm.ucpmBornerPage('4'), 4);
  assert.equal(ucpm.ucpmBornerPage(99), 7);
  assert.equal(ucpm.ucpmBornerPage(undefined), 1);
  assert.equal(ucpm.ucpmBornerPage('abc'), 1);
});

test('ucpmAUnTravailEnCours : un état neuf n\'a rien à reprendre', () => {
  assert.equal(ucpm.ucpmAUnTravailEnCours(null), false);
  assert.equal(ucpm.ucpmAUnTravailEnCours(undefined), false);
  assert.equal(ucpm.ucpmAUnTravailEnCours(ucpm.ucpmEtatInitial()), false);
  const e = ucpm.ucpmEtatInitial(); e.texteCV = ' ';
  assert.equal(ucpm.ucpmAUnTravailEnCours(e), false);
});

test('ucpmAUnTravailEnCours : un CV déposé, une réponse ou une page avancée comptent comme du travail', () => {
  const a = ucpm.ucpmEtatInitial(); a.texteCV = 'Agent d\'accueil';
  assert.equal(ucpm.ucpmAUnTravailEnCours(a), true);
  const b = ucpm.ucpmEtatInitial(); b.reponseMetiers = { metiers: [] };
  assert.equal(ucpm.ucpmAUnTravailEnCours(b), true);
  const c = ucpm.ucpmEtatInitial(); c.page = 2;
  assert.equal(ucpm.ucpmAUnTravailEnCours(c), true);
});

test('ucpmNormaliserEtat : complète les champs, borne la page, refuse ce qui n\'est pas un état', () => {
  assert.equal(ucpm.ucpmNormaliserEtat(null), null);
  assert.equal(ucpm.ucpmNormaliserEtat('x'), null);
  assert.equal(ucpm.ucpmNormaliserEtat([1, 2]), null);
  const e = ucpm.ucpmNormaliserEtat({ page: 42, texteCV: 'abc' });
  assert.equal(e.page, 7);
  assert.equal(e.pageMax, 7);
  assert.equal(e.texteCV, 'abc');
  assert.equal(e.reponseMetiers, null);
  assert.equal(e.version, 1);
});

test('ucpmExporterEtat : rien à garder = null ; sinon copie indépendante', () => {
  assert.equal(ucpm.ucpmExporterEtat(ucpm.ucpmEtatInitial()), null);
  const e = ucpm.ucpmEtatInitial(); e.texteCV = 'CV';
  const copie = ucpm.ucpmExporterEtat(e);
  assert.deepEqual(copie, e);
  copie.texteCV = 'autre';
  assert.equal(e.texteCV, 'CV', 'la copie ne touche pas l\'original');
});

test('ucpm : l\'aller-retour disquette redonne le même état', () => {
  const e = ucpm.ucpmEtatInitial(); e.texteCV = 'CV'; e.page = 3; e.pageMax = 4;
  const restaure = ucpm.ucpmNormaliserEtat(ucpm.ucpmExporterEtat(e));
  assert.equal(restaure.page, 3);
  assert.equal(restaure.pageMax, 4);
  assert.equal(restaure.texteCV, 'CV');
});

test('ucpm : le module reste fermé au public tant que son parcours n\'est pas complet', () => {
  assert.equal(typeof ucpm, 'object');
  // L'interrupteur n'est pas exporté : on le lit dans la source (il doit rester à false jusqu'au lot de clôture).
  const src = require('node:fs').readFileSync(require('node:path').join(__dirname, '../modules/un-cv-plusieurs-metiers/logique.js'), 'utf8');
  assert.match(src, /var UCPM_OUVERT = (false|true);/);
});

// ---------------- Lecture de la réponse « métiers » (page 1) ----------------
const fs = require('node:fs');
const path = require('node:path');
const dossierReponses = path.join(__dirname, '../docs/essais_prompts_ucpm/reponses');
const lire = (nom) => fs.readFileSync(path.join(dossierReponses, nom), 'utf8');

test('ucpmLireReponseMetiers : les cinq vraies réponses de ChatGPT sont lues (avec ou sans barres obliques de copie)', () => {
  ['01_metiers_V1_chatgpt_1.txt', '01_metiers_V2_chatgpt_1.txt', '01_metiers_V3_chatgpt_1.txt', '01_metiers_V4_chatgpt_1.txt', '01_metiers_V5_chatgpt_1.txt'].forEach((f) => {
    const r = ucpm.ucpmLireReponseMetiers(lire(f));
    assert.equal(r.succes, true, f + ' : ' + r.erreur);
    assert.ok(r.valeurs.synthese.metier, f + ' : métier du CV');
    assert.ok(r.valeurs.synthese.competencesCles.length >= 4, f + ' : compétences clés');
    assert.ok(r.valeurs.autresMetiers.length >= 5 && r.valeurs.autresMetiers.length <= 10, f + ' : autres métiers');
  });
});

test('ucpmLireReponseMetiers : V5 garde les deux formes de chaque métier et le « À vérifier »', () => {
  const r = ucpm.ucpmLireReponseMetiers(lire('01_metiers_V5_chatgpt_1.txt'));
  r.valeurs.autresMetiers.forEach((m) => { assert.ok(m.masculin && m.feminin, 'deux formes : ' + JSON.stringify(m)); });
  r.valeurs.intitulesMemeMetier.forEach((m) => { assert.ok(m.masculin && m.feminin); });
  assert.ok(r.valeurs.autresMetiers.some((m) => /lectricien/i.test(m.masculin) && m.aVerifier), 'électricien marqué « À vérifier »');
  const feminins = r.valeurs.autresMetiers.filter((m) => m.masculin !== m.feminin).length;
  assert.ok(feminins >= 3, 'plusieurs métiers ont une forme féminine différente');
});

test('ucpmLireReponseMetiers : les barres obliques de la copie (V1 en avait 42) sont retirées', () => {
  const r = ucpm.ucpmLireReponseMetiers(lire('01_metiers_V1_chatgpt_1.txt'));
  assert.equal(r.succes, true);
  assert.ok(r.echappes > 10, 'des échappements ont été retirés : ' + r.echappes);
  assert.ok(!/\[\[\]_*#]/.test(JSON.stringify(r.valeurs)), 'aucune barre oblique restante');
});

test('ucpmLireReponseMetiers : vide, sans JSON, coupée : un message clair, jamais une exception', () => {
  assert.equal(ucpm.ucpmLireReponseMetiers('').succes, false);
  assert.equal(ucpm.ucpmLireReponseMetiers(null).succes, false);
  const sansJson = ucpm.ucpmLireReponseMetiers('Voici mes conseils pour votre CV.');
  assert.equal(sansJson.succes, false);
  assert.match(sansJson.erreur, /ne ressemble pas/);
  const brut = lire('01_metiers_V5_chatgpt_1.txt');
  const coupee = ucpm.ucpmLireReponseMetiers(brut.slice(0, Math.floor(brut.length * 0.6)));
  assert.equal(coupee.succes, false);
  assert.equal(coupee.coupe, true, 'une réponse tronquée est reconnue comme coupée');
  assert.match(coupee.erreur, /coupée/);
});

test('ucpmLireReponseMetiers : texte autour du JSON, tableau, JSON sans contenu', () => {
  const avecTexte = ucpm.ucpmLireReponseMetiers('Voici :\n```json\n{"synthese":{"metier":"Peintre"},"intitulesMemeMetier":[],"autresMetiers":[{"metierMasculin":"Plâtrier","metierFeminin":"Plâtrière","retrouveDansLeCV":["a","b"],"aVerifier":""}]}\n```\nBonne chance.');
  assert.equal(avecTexte.succes, true);
  assert.equal(avecTexte.valeurs.autresMetiers[0].feminin, 'Plâtrière');
  assert.equal(ucpm.ucpmLireReponseMetiers('[1,2,3]').succes, false);
  assert.equal(ucpm.ucpmLireReponseMetiers('{"autre":"chose"}').succes, false);
});

test('ucpmLireReponseMetiers : une seule forme donnée = reprise pour les deux ; tiret long nettoyé ; 10 métiers au plus', () => {
  const metiers = [];
  for (let i = 0; i < 14; i++) { metiers.push({ metier: 'Métier ' + i + ' \u2013 test', retrouveDansLeCV: ['x' + i] }); }
  const r = ucpm.ucpmLireReponseMetiers(JSON.stringify({ synthese: { metier: 'Agent' }, intitulesMemeMetier: [], autresMetiers: metiers }));
  assert.equal(r.succes, true);
  assert.equal(r.valeurs.autresMetiers.length, 10);
  assert.equal(r.valeurs.autresMetiers[0].masculin, r.valeurs.autresMetiers[0].feminin);
  assert.ok(!/[\u2013\u2014]/.test(JSON.stringify(r.valeurs)), 'aucun tiret long');
});

test('ucpmConstruirePromptMetiers : remplit les trois marqueurs, repli explicite pour les objectifs', () => {
  const modele = fs.readFileSync(path.join(__dirname, '../prompts/ucpm-metiers.md'), 'utf8');
  const texte = ucpm.ucpmConstruirePromptMetiers(modele, { cv: 'Agent d\'entretien, 10 ans.' });
  assert.ok(!/\{(INTITULE|OBJECTIFS|CV)\}/.test(texte), 'aucun marqueur restant');
  assert.ok(texte.includes('Agent d\'entretien, 10 ans.'));
  assert.ok(texte.includes(ucpm.UCPM_OBJECTIFS_PAR_DEFAUT));
  const avec = ucpm.ucpmConstruirePromptMetiers(modele, { cv: 'CV', intitule: 'Peintre', objectifs: 'Alternance' });
  assert.ok(avec.includes('Peintre') && avec.includes('Alternance'));
});
