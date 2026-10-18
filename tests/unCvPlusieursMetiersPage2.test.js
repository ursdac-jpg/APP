const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Logique pure de la page 2 « Métiers » (aucun DOM). Les constantes de logique.js sont globales dans le navigateur : on les fournit ici.
const base = require('../modules/un-cv-plusieurs-metiers/logique.js');
global.UCPM_MAX_METIERS = base.UCPM_MAX_METIERS;
global.UCPM_MIN_METIERS_POUR_CREER = base.UCPM_MIN_METIERS_POUR_CREER;
const m = require('../modules/un-cv-plusieurs-metiers/logiqueMetiers.js');

const reponse = base.ucpmLireReponseMetiers(fs.readFileSync(path.join(__dirname, '../docs/essais_prompts_ucpm/reponses/01_metiers_V5_chatgpt_1.txt'), 'utf8'));
function etatTest() { return m.ucpmCreerListes(reponse.valeurs); }

test('page 2 : sept démarches, chacune avec un titre et une famille', () => {
  assert.equal(m.UCPM_DEMARCHES.length, 7);
  ['spontanee', 'offre', 'reconversion', 'stage', 'pmsmp', 'alternance', 'formation'].forEach((id) => assert.ok(m.ucpmDemarche(id), id));
  assert.equal(m.ucpmDemarche('inconnue'), null);
  assert.equal(m.ucpmTitreDemarche('pmsmp'), 'Stage d’immersion (PMSMP)');
});

test('ucpmCreerListes : deux colonnes, rien de coché, identifiants stables', () => {
  const e = etatTest();
  assert.ok(e.intitules.length >= 3 && e.autres.length >= 5);
  assert.ok(e.intitules.every((x) => /^g\d+$/.test(x.id) && x.coche === false && x.objectif === null));
  assert.ok(e.autres.every((x) => /^d\d+$/.test(x.id) && x.coche === false));
  assert.equal(m.ucpmCompterCoches(e).total, 0);
});

test('ucpmNomMetier : les deux formes tant que le sexe est inconnu, une seule ensuite', () => {
  const elec = { masculin: 'Électricien d’entretien', feminin: 'Électricienne d’entretien' };
  assert.equal(m.ucpmNomMetier(elec, ''), 'Électricien / Électricienne d’entretien');
  assert.equal(m.ucpmNomMetier(elec, 'f'), 'Électricienne d’entretien');
  assert.equal(m.ucpmNomMetier(elec, 'm'), 'Électricien d’entretien');
  assert.equal(m.ucpmNomMetier({ masculin: 'Agent d’accueil', feminin: 'Agent d’accueil' }, ''), 'Agent d’accueil');
  assert.equal(m.ucpmNomMetier({ masculin: 'Plombier', feminin: 'Plombière' }, ''), 'Plombier / Plombière');
  assert.equal(m.ucpmNomMetier({ masculin: 'Ouvrier paysagiste', feminin: 'Ouvrière paysagiste' }, ''), 'Ouvrier / Ouvrière paysagiste');
  assert.equal(m.ucpmNomMetier(null, ''), '');
});

test('ucpmBasculerCoche : dix cochées au plus', () => {
  const e = etatTest();
  const toutes = m.ucpmToutesEntrees(e);
  let ok = 0;
  toutes.forEach((x) => { if (m.ucpmBasculerCoche(e, x.id, true).ok) { ok++; } });
  assert.equal(ok, Math.min(10, toutes.length));
  assert.equal(m.ucpmCompterCoches(e).total, Math.min(10, toutes.length));
  if (toutes.length > 10) {
    const refus = m.ucpmBasculerCoche(e, toutes[toutes.length - 1].id, true);
    assert.equal(refus.ok, false);
    assert.equal(refus.raison, 'plein');
  }
  assert.equal(m.ucpmBasculerCoche(e, toutes[0].id, false).ok, true);
  assert.equal(m.ucpmBasculerCoche(e, 'zzz', true).ok, false);
});

test('ucpmAjouterIntitule : écrit par la personne, coché si la place le permet, sans doublon ni tiret long', () => {
  const e = etatTest();
  const r = m.ucpmAjouterIntitule(e, '  Agent de maintenance  ');
  assert.equal(r.ok, true);
  assert.equal(r.entree.source, 'perso');
  assert.equal(r.entree.masculin, 'Agent de maintenance');
  assert.equal(r.entree.feminin, 'Agent de maintenance');
  assert.equal(r.entree.coche, true);
  assert.equal(m.ucpmAjouterIntitule(e, 'agent de maintenance').raison, 'doublon');
  assert.equal(m.ucpmAjouterIntitule(e, '   ').raison, 'vide');
  assert.equal(m.ucpmAjouterIntitule(e, 'x'.repeat(81)).raison, 'trop-long');
  const t = m.ucpmAjouterIntitule(e, 'Agent ' + String.fromCharCode(0x2013) + ' maintenance');
  assert.equal(t.ok, true);
  assert.ok(!/[\u2013\u2014]/.test(t.entree.masculin), 'aucun tiret long');
});

test('ucpmAjouterIntitule : non coché quand les dix places sont prises', () => {
  const e = etatTest();
  m.ucpmToutesEntrees(e).forEach((x) => m.ucpmBasculerCoche(e, x.id, true));
  const r = m.ucpmAjouterIntitule(e, 'Un autre métier');
  assert.equal(r.ok, true);
  assert.equal(r.entree.coche, m.ucpmCompterCoches(e).total <= 10 && r.entree.coche);
  assert.ok(m.ucpmCompterCoches(e).total <= 10);
});

test('ucpmCorrigerIntitule et ucpmRetirerIntitule : seulement la colonne de gauche', () => {
  const e = etatTest();
  const g = e.intitules[0];
  assert.equal(m.ucpmCorrigerIntitule(e, g.id, 'Mon intitulé').ok, true);
  assert.equal(g.masculin, 'Mon intitulé');
  assert.equal(g.feminin, 'Mon intitulé');
  assert.equal(g.source, 'corrige');
  assert.equal(m.ucpmCorrigerIntitule(e, e.autres[0].id, 'Non').ok, false);
  assert.equal(m.ucpmRetirerIntitule(e, e.autres[0].id).ok, false);
  const avant = e.intitules.length;
  assert.equal(m.ucpmRetirerIntitule(e, g.id).ok, true);
  assert.equal(e.intitules.length, avant - 1);
});

test('objectif : une démarche suffit, le reste est facultatif', () => {
  assert.equal(m.ucpmObjectifValide(null), false);
  assert.equal(m.ucpmObjectifValide(m.ucpmObjectifVide('')), false);
  assert.equal(m.ucpmObjectifValide(m.ucpmObjectifVide('alternance')), true);
  assert.equal(m.ucpmObjectifValide({ demarche: 'nimportequoi' }), false);
});

test('ucpmDetailsObjectif : la ligne de détails reprend tout ce qui est renseigné, rien d’autre', () => {
  const o = m.ucpmObjectifVide('alternance');
  assert.equal(m.ucpmDetailsObjectif(o), '');
  Object.assign(o, { typeStructure: 'Entreprise privée (secteur marchand)', secteur: 'bâtiment', dureeQuantite: '2', dureeUnite: 'ans', dateDebut: 'septembre prochain', heures: '35', disponibleA: 'septembre', formationVisee: 'CAP peintre' });
  const t = m.ucpmDetailsObjectif(o);
  ['type de structure : Entreprise privée', 'secteur : bâtiment', 'durée : 2 ans', 'début souhaité : septembre prochain', 'heures par semaine : 35', 'formation visée : CAP peintre', 'disponible à partir de : septembre'].forEach((p) => assert.ok(t.includes(p), p + ' dans ' + t));
  const e = m.ucpmObjectifVide('offre'); e.contrat = ['CDI', 'CDD']; e.tempsTravail = ['Temps plein'];
  assert.equal(m.ucpmDetailsObjectif(e), 'contrat : CDI, CDD ; temps plein');
  const a = m.ucpmObjectifVide('spontanee'); a.typeStructure = 'Autre'; a.typeStructureAutre = 'Mairie rurale';
  assert.equal(m.ucpmDetailsObjectif(a), 'type de structure : Mairie rurale');
});

test('ucpmAppliquerObjectif : portée tous / gauche / droite / un ; employeur et recruteur seulement pour un métier', () => {
  const e = etatTest();
  const o = m.ucpmObjectifVide('spontanee'); o.secteur = 'bâtiment'; o.employeur = 'Entreprise X'; o.nomRecruteur = 'Martin';
  assert.equal(m.ucpmAppliquerObjectif(e, 'tous', null, o).nb, m.ucpmToutesEntrees(e).length);
  assert.ok(m.ucpmToutesEntrees(e).every((x) => x.objectif.demarche === 'spontanee' && x.objectif.employeur === ''), 'employeur non recopié aux autres');
  const stage = m.ucpmObjectifVide('stage');
  assert.equal(m.ucpmAppliquerObjectif(e, 'gauche', null, stage).nb, e.intitules.length);
  assert.ok(e.intitules.every((x) => x.objectif.demarche === 'stage'));
  assert.ok(e.autres.every((x) => x.objectif.demarche === 'spontanee'));
  const un = m.ucpmObjectifVide('offre'); un.employeur = 'Lacroix Peinture'; un.nomRecruteur = 'Martin'; un.civiliteRecruteur = 'Madame'; un.posteOffre = 'Peintre';
  assert.equal(m.ucpmAppliquerObjectif(e, 'un', e.autres[0].id, un).nb, 1);
  assert.equal(e.autres[0].objectif.employeur, 'Lacroix Peinture');
  assert.equal(e.autres[0].objectif.civiliteRecruteur, 'Madame');
  assert.equal(e.autres[1].objectif.demarche, 'spontanee');
  assert.equal(m.ucpmAppliquerObjectif(e, 'droite', null, m.ucpmObjectifVide('')).ok, false, 'sans démarche : refusé');
  const copie = e.autres[2].objectif; copie.secteur = 'modifié';
  assert.notEqual(e.autres[3].objectif.secteur, 'modifié', 'chaque entrée a sa propre copie');
});

test('ucpmPeutCreerCV : 2 cochées, un objectif chacune, dix au plus', () => {
  const e = etatTest();
  assert.equal(m.ucpmPeutCreerCV(e).ok, false);
  m.ucpmBasculerCoche(e, e.intitules[0].id, true);
  assert.match(m.ucpmPeutCreerCV(e).raison, /au moins 2/);
  m.ucpmBasculerCoche(e, e.autres[0].id, true);
  const sans = m.ucpmPeutCreerCV(e);
  assert.equal(sans.ok, false);
  assert.match(sans.raison, /objectif/);
  assert.equal(m.ucpmCochesSansObjectif(e).length, 2);
  m.ucpmAppliquerObjectif(e, 'tous', null, m.ucpmObjectifVide('alternance'));
  assert.equal(m.ucpmPeutCreerCV(e).ok, true);
  m.ucpmBasculerCoche(e, e.autres[1].id, true);
  assert.equal(m.ucpmPeutCreerCV(e).ok, true);
});

test('demande d’offres : métiers cochés, objectif et détails remontent dans le texte envoyé, jamais le CV', () => {
  const e = etatTest();
  m.ucpmBasculerCoche(e, e.autres[0].id, true);
  m.ucpmBasculerCoche(e, e.autres[1].id, true);
  const o1 = m.ucpmObjectifVide('alternance'); o1.secteur = 'bâtiment'; o1.dureeQuantite = '2'; o1.dureeUnite = 'ans';
  m.ucpmAppliquerObjectif(e, 'un', e.autres[0].id, o1);
  m.ucpmAppliquerObjectif(e, 'un', e.autres[1].id, m.ucpmObjectifVide('formation'));
  const modele = fs.readFileSync(path.join(__dirname, '../prompts/ucpm-offres.md'), 'utf8');
  const t = m.ucpmConstruireDemandeOffres(modele, m.ucpmEntreesCochees(e), 'Haute-Vienne (87)', '10 octobre 2026', '');
  assert.ok(!/\{(DATE|DEPARTEMENT|METIERS)\}/.test(t), 'aucun marqueur restant');
  assert.ok(!t.includes('<!--'), 'le commentaire de version n’est jamais envoyé');
  assert.ok(t.includes('Nous sommes le 10 octobre 2026'));
  assert.ok(t.includes('Haute-Vienne (87)'));
  assert.ok(t.includes(': alternance (secteur : bâtiment ; durée : 2 ans)'));
  assert.ok(t.includes(': entrée en formation'));
  assert.ok(t.includes('1. ') && t.includes('2. '));
});

test('département et date de la demande d’offres', () => {
  assert.equal(m.ucpmNomDepartement('24', ''), 'Dordogne (24)');
  assert.equal(m.ucpmNomDepartement('87', 'ignoré'), 'Haute-Vienne (87)');
  assert.equal(m.ucpmNomDepartement('ailleurs', '  Creuse (23) '), 'Creuse (23)');
  assert.equal(m.ucpmNomDepartement('ailleurs', ''), '');
  assert.equal(m.ucpmDateEnTexte(new Date(2026, 9, 10)), '10 octobre 2026');
  assert.equal(m.ucpmDateEnTexte(new Date(2026, 0, 1)), '1er janvier 2026');
});

test('ucpmNormaliserObjectif : forme sûre, listes nettoyées', () => {
  assert.equal(m.ucpmNormaliserObjectif(null), null);
  const o = m.ucpmNormaliserObjectif({ demarche: 'stage', contrat: ['CDI', '', '  CDD '], secteur: ' bâtiment  ', demarcheInconnue: 'x' });
  assert.deepEqual(o.contrat, ['CDI', 'CDD']);
  assert.equal(o.secteur, 'bâtiment');
  assert.equal(o.demarche, 'stage');
  assert.equal(m.ucpmNormaliserObjectif({ demarche: 'bidon' }).demarche, '');
});

test('texte d’avertissement des offres : celui validé par Denis, sans tiret long, sans annoncer le module suivant', () => {
  const t = m.UCPM_AVERTISSEMENT_OFFRES.join(' ');
  assert.equal(m.UCPM_AVERTISSEMENT_OFFRES.length, 4);
  ['seulement les offres d’emploi publiées', 'marché caché', 'chercher aussi les structures', 'ne le reprend pas, ne le vérifie pas et n’en est pas responsable', 'vérifiez toujours auprès de la source'].forEach((p) => assert.ok(t.includes(p), p));
  assert.ok(!/[\u2013\u2014]/.test(t));
  assert.ok(!/employeurs du territoire|répertoire|module suivant/i.test(t));
  assert.ok(!/\bIA\b/.test(t));
});

test('CV de référence : par défaut le métier du CV, sinon la colonne de gauche, toujours une entrée cochée', () => {
  const e = etatTest();
  e.reponseMetiers = reponse.valeurs;
  assert.equal(m.ucpmRefParDefaut(e), null, 'rien de coché, pas de référence');
  m.ucpmBasculerCoche(e, e.autres[0].id, true);
  m.ucpmBasculerCoche(e, e.intitules[1].id, true);
  assert.equal(m.ucpmRefParDefaut(e).id, e.intitules[1].id, 'colonne de gauche d’abord');
  const metierDuCv = { masculin: 'Agent d’entretien des bâtiments', feminin: 'Agent d’entretien des bâtiments' };
  e.autres[2].masculin = metierDuCv.masculin; e.autres[2].feminin = metierDuCv.feminin;
  m.ucpmBasculerCoche(e, e.autres[2].id, true);
  assert.equal(m.ucpmRefParDefaut(e).id, e.autres[2].id, 'le métier du CV, accents et casse ignorés');
  e.refId = e.autres[0].id;
  assert.equal(m.ucpmRefCourante(e).id, e.autres[0].id, 'le choix de la personne est respecté');
  m.ucpmBasculerCoche(e, e.autres[0].id, false);
  assert.notEqual(m.ucpmRefCourante(e).id, e.autres[0].id, 'une entrée décochée ne peut plus servir de référence');
});

test('page 2 : un métier précis ou un secteur, le métier visé figure dans les détails et l’étiquette', () => {
  const o = m.ucpmObjectifVide('spontanee');
  o.cible = 'metier'; o.metierVise = 'Auxiliaire de vie';
  assert.match(m.ucpmDetailsObjectif(o), /métier visé : Auxiliaire de vie/);
  assert.match(m.ucpmEtiquetteObjectif(o), /Candidature spontanée \(Auxiliaire de vie\)/);
  const s = m.ucpmObjectifVide('spontanee');
  s.cible = 'secteur'; s.secteur = 'Social et services à la personne';
  assert.match(m.ucpmDetailsObjectif(s), /secteur : Social et services à la personne/);
  assert.doesNotMatch(m.ucpmDetailsObjectif(s), /métier visé/);
});

test('page 2 : le métier visé ne se recopie pas sur plusieurs métiers, il reste propre à un seul', () => {
  const e = etatTest();
  const o = m.ucpmObjectifVide('spontanee');
  o.cible = 'metier'; o.metierVise = 'Peintre';
  m.ucpmAppliquerObjectif(e, 'tous', null, o);
  const premier = m.ucpmToutesEntrees(e)[0];
  assert.equal(premier.objectif.metierVise, '', 'pour plusieurs métiers, chaque CV garde son propre métier');
  assert.equal(premier.objectif.cible, '', 'le choix « métier précis » n’a plus de sens pour plusieurs métiers');
  m.ucpmAppliquerObjectif(e, 'un', premier.id, o);
  assert.equal(premier.objectif.metierVise, 'Peintre');
  assert.equal(premier.objectif.cible, 'metier');
});

test('nouveaux champs d objectif : ancien métier, organisme, objectifs de l immersion, dans les détails et la normalisation', () => {
  const r = m.ucpmObjectifVide('reconversion'); r.ancienType = 'metier'; r.ancienValeur = 'plaquiste';
  assert.match(m.ucpmDetailsObjectif(r), /ancien métier : plaquiste/);
  r.ancienType = 'secteur'; r.ancienValeur = 'bâtiment';
  assert.match(m.ucpmDetailsObjectif(r), /ancien secteur d’activité : bâtiment/);
  const a = m.ucpmObjectifVide('alternance'); a.organisme = 'AFPA';
  assert.match(m.ucpmDetailsObjectif(a), /organisme de formation : AFPA/);
  const p = m.ucpmObjectifVide('pmsmp'); p.objectifsPmsmp = [m.UCPM_OBJECTIFS_PMSMP[0], m.UCPM_OBJECTIFS_PMSMP[1]]; p.objectifPmsmpAutre = 'voir le rythme';
  const d = m.ucpmDetailsObjectif(p);
  assert.match(d, /objectif de l’immersion : Découvrir le métier ; Confirmer mon projet professionnel ; voir le rythme/);
  const n = m.ucpmNormaliserObjectif(JSON.parse(JSON.stringify(p)));
  assert.deepEqual(Array.from(n.objectifsPmsmp), Array.from(p.objectifsPmsmp));
  assert.equal(m.UCPM_OBJECTIFS_PMSMP.length, 7);
});

test('objectif par portée : le dernier choix appliqué est gardé pour tous, gauche et droite, sans les champs propres à un métier', () => {
  const e = etatTest();
  const o = m.ucpmObjectifVide('stage'); o.organisme = 'GRETA'; o.employeur = 'X';
  m.ucpmAppliquerObjectif(e, 'gauche', null, o);
  assert.equal(e.objectifsPortee.gauche.demarche, 'stage');
  assert.equal(e.objectifsPortee.gauche.organisme, 'GRETA');
  assert.equal(e.objectifsPortee.gauche.employeur, '');
  assert.equal(e.objectifsPortee.droite, undefined);
  m.ucpmAppliquerObjectif(e, 'gauche', null, m.ucpmObjectifVide('offre'));
  assert.equal(e.objectifsPortee.gauche.demarche, 'offre', 'le dernier choix fait foi');
  m.ucpmAppliquerObjectif(e, 'un', e.autres[0].id, m.ucpmObjectifVide('formation'));
  assert.equal(e.objectifsPortee.un, undefined, 'un métier seul ne change pas la mémoire des portées');
});

test('objectif appliqué : le compte des métiers cochés concernés est rendu', () => {
  const e = etatTest();
  m.ucpmBasculerCoche(e, e.intitules[0].id, true); m.ucpmBasculerCoche(e, e.intitules[1].id, true);
  const r = m.ucpmAppliquerObjectif(e, 'tous', null, m.ucpmObjectifVide('spontanee'));
  assert.equal(r.nbCoches, 2);
  assert.equal(r.nb, m.ucpmToutesEntrees(e).length);
});

test('objectifs par colonne : état de chaque colonne, colonne source unique, objectif principal repris (retour de Denis, 2026-10-13)', () => {
  const e = etatTest();
  assert.deepEqual(m.ucpmResumeColonne(e, 'gauche').demarches, [], 'au départ : aucun objectif');
  assert.equal(m.ucpmColonneSourceUnique(e), null, 'aucune colonne : pas de question');
  assert.equal(m.ucpmObjectifPrincipal(e, 'gauche'), null);

  const stage = m.ucpmObjectifVide('stage'); stage.dureeQuantite = '3'; stage.dureeUnite = 'mois';
  m.ucpmAppliquerObjectif(e, 'gauche', null, stage);
  const g = m.ucpmResumeColonne(e, 'gauche'), d = m.ucpmResumeColonne(e, 'droite');
  assert.equal(g.nb, e.intitules.length); assert.deepEqual(g.demarches, ['stage']); assert.equal(g.libelle, 'Stage de formation');
  assert.equal(d.nb, 0);
  assert.equal(m.ucpmColonneSourceUnique(e), 'gauche', 'une seule colonne a des objectifs : on pose la question');

  const principal = m.ucpmObjectifPrincipal(e, 'gauche');
  assert.equal(principal.demarche, 'stage'); assert.equal(principal.dureeQuantite, '3', 'le détail de la colonne est repris');
  assert.equal(principal.employeur, ''); assert.equal(principal.metierVise, '');

  // plusieurs objectifs différents dans la colonne : candidature spontanée par défaut
  m.ucpmAppliquerObjectif(e, 'un', e.intitules[0].id, m.ucpmObjectifVide('alternance'));
  assert.deepEqual(m.ucpmResumeColonne(e, 'gauche').demarches.sort(), ['alternance', 'stage']);
  const defaut = m.ucpmObjectifPrincipal(e, 'gauche');
  assert.equal(defaut.demarche, 'spontanee'); assert.equal(defaut.dureeQuantite, '');

  // la colonne de droite seule : la source est la droite ; les deux colonnes : plus de question
  const e2 = etatTest();
  m.ucpmAppliquerObjectif(e2, 'droite', null, m.ucpmObjectifVide('formation'));
  assert.equal(m.ucpmColonneSourceUnique(e2), 'droite');
  m.ucpmAppliquerObjectif(e2, 'gauche', null, m.ucpmObjectifVide('spontanee'));
  assert.equal(m.ucpmColonneSourceUnique(e2), null);

  // un objectif posé sur un seul métier (portée « un ») compte aussi pour sa colonne
  const e3 = etatTest();
  m.ucpmAppliquerObjectif(e3, 'un', e3.autres[0].id, m.ucpmObjectifVide('offre'));
  assert.equal(m.ucpmColonneSourceUnique(e3), 'droite');
  const r3 = m.ucpmResumeColonne(e3, 'droite'); assert.equal(r3.nb, 1); assert.ok(r3.total > 1);
});
