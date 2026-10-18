const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Logique pure de la préparation à l'entretien (page 8) : réglages, périodes sans activité, demande à l'assistant, lecture de la réponse.
const base = require('../modules/un-cv-plusieurs-metiers/logique.js');
Object.assign(global, base);
const metiers = require('../modules/un-cv-plusieurs-metiers/logiqueMetiers.js');
Object.assign(global, metiers);
const cv = require('../modules/un-cv-plusieurs-metiers/logiqueCv.js');
Object.assign(global, cv);
const prep = require('../modules/un-cv-plusieurs-metiers/logiquePreparation.js');

const lire = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const AUJ = { a: 2026, m: 10 };
const exp = (d, f) => ({ poste: 'X', dateDebut: d, dateFin: f });

test('préparation : les périodes sans activité sont repérées sans rien deviner', () => {
  // suite continue jusqu'en 2024 puis plus rien : une période jusqu'à aujourd'hui
  const p1 = prep.ucpmPeriodesSansActivite([exp('2012', '2014'), exp('2014', '2016'), exp('2016', '2019'), exp('2019', '2024')], AUJ);
  assert.equal(p1.length, 1);
  assert.equal(p1[0].de, '2024');
  assert.equal(p1[0].a, 'aujourd’hui');
  assert.ok(p1[0].mois >= 20, 'environ 21 mois');
  assert.equal(prep.ucpmTextePeriodesSansActivite(p1), 'de 2024 à aujourd’hui (environ 1 an et demi) : aucune expérience indiquée sur le CV');
  // un trou au milieu, années seules : 2016 puis 2019 = trou certain
  const p2 = prep.ucpmPeriodesSansActivite([exp('2012', '2016'), exp('2019', '2024'), exp('2025', '2026')], AUJ);
  assert.equal(p2.length, 1);
  assert.equal(p2[0].de, '2016');
  assert.equal(p2[0].a, '2019');
  // deux années qui se suivent : aucun trou certain
  assert.equal(prep.ucpmPeriodesSansActivite([exp('2016', '2017'), exp('2018', '2019')], { a: 2019, m: 12 }).length, 0);
  // les mois connus donnent des périodes plus fines
  const p3 = prep.ucpmPeriodesSansActivite([exp('2020-01', '2020-06'), exp('2021-03', '2022-01')], { a: 2022, m: 2 });
  assert.equal(p3.length, 1);
  assert.equal(p3[0].de, 'juin 2020');
  assert.equal(p3[0].a, 'mars 2021');
});

test('préparation : une expérience sans date de fin n’est jamais devinée « en cours », ni les chevauchements pris pour un trou', () => {
  assert.deepEqual(prep.ucpmPeriodesSansActivite([exp('2015', '2017'), exp('2019', '')], AUJ).map((p) => p.de + '>' + p.a), ['2017>2019'], 'le trou avant est vu, jamais un trou après');
  assert.equal(prep.ucpmPeriodesSansActivite([exp('2010', '2020'), exp('2012', '2014'), exp('2020', '2024')], { a: 2024, m: 6 }).length, 0, 'une expérience dans une autre ne crée pas de trou');
  assert.deepEqual(prep.ucpmPeriodesSansActivite([], AUJ), []);
  assert.deepEqual(prep.ucpmPeriodesSansActivite([exp('???', '2020'), exp('', '')], AUJ), [], 'dates illisibles ignorées');
  assert.equal(prep.ucpmTextePeriodesSansActivite([]), 'aucune');
  assert.equal(prep.ucpmTextePeriodesSansActivite([{ de: '2022', a: '2023', mois: 8 }]), 'de 2022 à 2023 (environ 8 mois) : aucune expérience indiquée sur le CV');
});

test('préparation : le bloc des réglages (général fixe, approfondi au choix)', () => {
  const g = prep.ucpmBlocReglagesPreparation({ mode: 'general', niveau: 'tres-exigeant', nombre: 12 });
  assert.ok(g.includes('Niveau d’exigence : Réaliste') && g.includes('questions par métier : 5') && !g.includes('Très'), 'le mode général ignore les réglages de l’approfondi');
  const a = prep.ucpmBlocReglagesPreparation({ mode: 'approfondi', niveau: 'exigeant', nombre: 10, sujets: ['parcours', 'entreprise', 'situation'], pistes: true });
  ['approfondi (un seul métier)', 'Niveau d’exigence : Exigeant', 'Nombre de questions par métier : 10', 'le parcours ; pourquoi cette entreprise ou cette structure ; les mises en situation', 'Pistes de réponse : oui'].forEach((x) => assert.ok(a.includes(x), x));
  assert.ok(prep.ucpmBlocReglagesPreparation({ mode: 'approfondi', pistes: false, sujets: [] }).includes('Pistes de réponse : non'), 'sans pistes');
  assert.ok(prep.ucpmBlocReglagesPreparation({ mode: 'approfondi', nombre: 99, niveau: 'inconnu', sujets: [] }).includes('Nombre de questions par métier : 10'), 'nombre et niveau remis à un défaut sûr');
  assert.ok(prep.ucpmBlocReglagesPreparation({ mode: 'approfondi', sujets: [] }).includes('Sujets : le parcours'), 'au moins un sujet');
  assert.equal(prep.ucpmPreparationAvecRelance('exigeant'), true);
  assert.equal(prep.ucpmPreparationAvecRelance('tres-exigeant'), true);
  assert.equal(prep.ucpmPreparationAvecRelance('realiste'), false);
  assert.equal(prep.ucpmPreparationAvecRelance('rassurant'), false);
});

test('préparation : le prompt est rempli, sans marqueur, et ne contient ni nom ni signature', () => {
  const o = metiers.ucpmObjectifVide('offre');
  Object.assign(o, { employeur: 'Résidences des Tilleuls', posteOffre: 'Gardien', texteOffre: 'Entretien  des parties communes' });
  const bloc = prep.ucpmBlocMetiersPreparation([{ titre: 'Gardienne d’immeuble', accroche: 'Dix ans.', objectif: o, lettre: 'Madame Martin,\n\nCorps.\n\nCordialement.', periodes: prep.ucpmTextePeriodesSansActivite([{ de: '2024', a: 'aujourd’hui', mois: 21 }]) }]);
  ['1. Métier : Gardienne d’immeuble', 'Employeur : Résidences des Tilleuls', 'Poste visé : Gardien', 'Extrait de l’offre : Entretien des parties communes', 'Périodes sans activité repérées par l’application : de 2024 à aujourd’hui', 'Corps.'].forEach((x) => assert.ok(bloc.includes(x), x));
  const t = prep.ucpmConstruirePromptPreparation(lire('prompts/ucpm-preparation.md'), { sexe: 'f', profil: 'Profil validé', reglages: prep.ucpmBlocReglagesPreparation({ mode: 'general' }), metiers: bloc });
  assert.ok(!/\{(GENRE|PROFIL|REGLAGES|METIERS)\}/.test(t), 'aucun marqueur restant');
  assert.ok(t.includes('Féminin : la personne est une femme') && t.includes('Mode : général') && t.includes('Profil validé'));
  assert.ok(/relance/.test(t), 'le prompt décrit le champ relance');
});

test('préparation : la réponse est lue, le repère « délicate » suit le sujet, la relance est gardée', () => {
  const rep = '```json\n' + JSON.stringify([{ id: 1, metier: 'Agent', questions: [
    { question: 'Présentez-vous – brièvement ?', sujet: 'parcours', delicate: false, attente: 'Un fil logique.', piste: 'Partez de l’expérience en résidence.', relance: '' },
    { question: 'Que faisiez-vous depuis 2024 ?', sujet: 'delicat', delicate: false, attente: 'Comprendre.', piste: 'Dites les faits.', relance: 'Et concrètement ?' },
    { question: 'Pourquoi chez nous ?', sujet: 'entreprise', delicate: false, attente: 'Un intérêt réel.', piste: 'Repérez deux éléments.' },
    { question: 'Pourquoi ce métier ?', sujet: 'motivation', delicate: false, attente: 'Une raison.', piste: 'Un fait.' },
    { question: 'Question étrange ?', sujet: 'inconnu', delicate: true, attente: 'x', piste: 'y' },
    { question: '', sujet: 'parcours' }
  ], aMettreEnAvant: ['Dix ans.', 'Dix ans.', 'CAP.', 'BS.', 'Permis B.', 'Cinquième.'] }]) + '\n```';
  const r = prep.ucpmLireReponsePreparation(rep, ['g1']);
  assert.equal(r.succes, true);
  const p = r.preparations.g1;
  assert.equal(p.questions.length, 5, 'la question vide est écartée');
  assert.equal(p.questions[0].question, 'Présentez-vous - brièvement ?', 'aucun tiret long');
  assert.equal(p.questions[0].delicate, false);
  assert.equal(p.questions[1].delicate, true, 'sujet delicat');
  assert.equal(p.questions[1].relance, 'Et concrètement ?');
  assert.equal(p.questions[2].delicate, true, 'pourquoi cette entreprise est délicate');
  assert.equal(p.questions[3].delicate, false, 'la motivation ne l’est pas');
  assert.equal(p.questions[4].sujet, 'parcours', 'un sujet inconnu retombe sur « parcours »');
  assert.equal(p.questions[4].delicate, true, 'une question marquée délicate par l’assistant le reste');
  assert.deepEqual(p.aMettreEnAvant, ['Dix ans.', 'CAP.', 'BS.', 'Permis B.'], 'doublon retiré, quatre au plus');
});

test('préparation : un métier sans question n’empêche pas les autres, une réponse coupée ou illisible est expliquée', () => {
  const rep = JSON.stringify([{ id: 1, metier: 'A', questions: [{ question: 'Q1 ?', sujet: 'parcours', attente: 'a', piste: 'p' }] }, { id: 2, metier: 'B', questions: [] }]);
  const r = prep.ucpmLireReponsePreparation(rep, ['x', 'y']);
  assert.equal(r.succes, true);
  assert.deepEqual(Object.keys(r.preparations), ['x']);
  assert.deepEqual(r.manquants, ['y']);
  assert.equal(prep.ucpmLireReponsePreparation('', ['x']).succes, false);
  assert.equal(prep.ucpmLireReponsePreparation('du texte sans json', ['x']).succes, false);
  const coupee = prep.ucpmLireReponsePreparation('[{"id":1,"questions":[{"question":"Q ?","sujet":"parcours"', ['x']);
  assert.equal(coupee.succes, false);
  assert.equal(coupee.coupe, true);
  assert.equal(prep.ucpmLireReponsePreparation('[{"id":1,"questions":[]}]', ['x']).succes, false, 'aucune question lisible');
  const trop = JSON.stringify([{ id: 1, questions: Array.from({ length: 20 }, (_, i) => ({ question: 'Question ' + i + ' ?', sujet: 'parcours' })) }]);
  assert.equal(prep.ucpmLireReponsePreparation(trop, ['x']).preparations.x.questions.length, 12, 'douze questions au plus');
});

test('préparation : fusion (une approfondie remplace la générale du même métier), cibles et plafond du mode général', () => {
  const anc = { a: { questions: [{ question: 'Ancienne ?' }], aMettreEnAvant: [], mode: 'general' }, b: { questions: [{ question: 'B ?' }], aMettreEnAvant: [], mode: 'general' } };
  const f = prep.ucpmFusionnerPreparations(anc, { a: { questions: [{ question: 'Nouvelle ?' }], aMettreEnAvant: ['x'] } }, 'approfondi', 'exigeant');
  assert.equal(f.a.questions[0].question, 'Nouvelle ?');
  assert.equal(f.a.mode, 'approfondi');
  assert.equal(f.a.niveau, 'exigeant');
  assert.equal(prep.ucpmFusionnerPreparations({}, { a: { questions: [], aMettreEnAvant: [] } }, 'general', 'exigeant').a.niveau, '', 'pas de niveau en général');
  assert.equal(f.b.questions[0].question, 'B ?', 'les autres métiers ne bougent pas');
  const entrees = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  assert.deepEqual(prep.ucpmCiblesPreparation(entrees, null).map((e) => e.id), ['a', 'b', 'c']);
  assert.deepEqual(prep.ucpmCiblesPreparation(entrees, ['c', 'a']).map((e) => e.id), ['a', 'c'], 'dans l’ordre des CV');
  assert.deepEqual(prep.ucpmCiblesPreparation(entrees, ['z']).map((e) => e.id), ['a', 'b', 'c'], 'un choix devenu vide revient à tous');
  assert.equal(prep.ucpmPreparationTropDeMetiers(7, 'general'), true);
  assert.equal(prep.ucpmPreparationTropDeMetiers(6, 'general'), false);
  assert.equal(prep.ucpmPreparationTropDeMetiers(1, 'approfondi'), false);
});

test('préparation : les conseils écrits par l’application sont complets, sans tiret long ni visage', () => {
  const c = prep.UCPM_CONSEILS_ENTRETIEN;
  ['avant', 'pendant', 'apres'].forEach((k) => assert.ok(Array.isArray(c[k]) && c[k].length >= 3, k));
  const tout = JSON.stringify(c);
  assert.ok(!/[–—]/.test(tout), 'aucun tiret long');
  assert.ok(!/IA\b/.test(tout), 'jamais le mot IA');
  assert.ok(c.rassurance.length > 20);
  prep.UCPM_PREP_NIVEAUX.forEach((n) => assert.ok(n.id && n.titre && n.texte && !/[–—]/.test(n.texte), n.id));
  assert.equal(prep.UCPM_PREP_NIVEAUX.length, 4);
});

test('préparation : le prompt ne contient ni tiret long (hors la consigne qui l’interdit) ni nom de personne', () => {
  const p = lire('prompts/ucpm-preparation.md').replace(/\(– ou —\)/, '');
  assert.ok(!/[–—]/.test(p));
});

// ---------------- Feuille imprimable ----------------
Object.assign(global, require('../modules/un-cv-plusieurs-metiers/logiqueDocuments.js'));
// Les fonctions de la feuille ont besoin des conseils et de ucpmEchapperHtml, globaux dans le navigateur.
global.UCPM_CONSEILS_ENTRETIEN = prep.UCPM_CONSEILS_ENTRETIEN;
const feuille = require('../modules/un-cv-plusieurs-metiers/logiquePreparation.js');

const PREP_TEST = { questions: [
  { question: 'Parlez de vous <b>?</b>', sujet: 'parcours', delicate: false, attente: 'Un fil logique.', piste: 'Partez de la résidence.', relance: '' },
  { question: 'Que faisiez-vous depuis 2024 ?', sujet: 'delicat', delicate: true, attente: 'Comprendre.', piste: 'Dites les faits.', relance: 'Et concrètement ?' }
], aMettreEnAvant: ['Dix ans en résidence.', 'CAP.'] };

test('feuille : chaque question est numérotée, la délicate est repérée par une étiquette écrite, la relance n’apparaît que si elle existe', () => {
  const b = feuille.ucpmBlocsHtmlPreparation({ metier: 'Gardienne d’immeuble', etiquette: 'Offre d’emploi', niveauTitre: 'Exigeant', prep: PREP_TEST });
  assert.equal(b.questions.length, 2);
  assert.ok(b.questions[0].includes('<span class="num">1.</span>') && b.questions[1].includes('<span class="num">2.</span>'));
  assert.ok(!b.questions[0].includes('QUESTION DÉLICATE') && b.questions[1].includes('QUESTION DÉLICATE'), 'étiquette écrite, pas seulement une couleur');
  assert.ok(!b.questions[0].includes('Il peut relancer') && b.questions[1].includes('Il peut relancer :</span> Et concrètement ?'));
  assert.ok(b.questions[0].includes('Parlez de vous &lt;b&gt;?&lt;/b&gt;'), 'le texte est échappé');
  assert.ok(b.entete.includes('Préparer mon entretien : Gardienne d’immeuble') && b.entete.includes('niveau exigeant') && b.entete.includes('Document personnel, à ne pas envoyer'));
  assert.ok(b.suite.includes('(suite)'));
  assert.ok(b.mettre.includes('Dix ans en résidence.'));
  ['Avant', 'Pendant', 'Après', 'Savoir-être, attitude et comportement'].forEach((x) => assert.ok(b.conseils.includes(x), x));
  assert.ok(b.pied.includes('Il est normal d’hésiter'));
  const g = feuille.ucpmBlocsHtmlPreparation({ metier: 'A', etiquette: '', niveauTitre: '', prep: { questions: PREP_TEST.questions.slice(0, 1), aMettreEnAvant: [] } });
  assert.ok(!g.entete.includes('niveau'), 'pas de niveau en mode général');
  assert.equal(g.mettre, '', 'rien à mettre en avant : pas de bloc vide');
});

test('feuille : une page assemble en-tête ou rappel, les blocs choisis et le pied sur la dernière', () => {
  const b = feuille.ucpmBlocsHtmlPreparation({ metier: 'M', etiquette: 'E', niveauTitre: '', prep: PREP_TEST });
  assert.equal(feuille.ucpmListeBlocsPreparation(b).length, 5, 'deux questions, à mettre en avant, conseils, pied');
  const p1 = feuille.ucpmHtmlPagePreparation(b, [0, 2], { premiere: true, taillePt: 10.5 });
  assert.ok(p1.includes('<h1>') && !p1.includes('(suite)') && p1.includes('Parlez de vous') && !p1.includes('Que faisiez-vous') && !p1.includes('Il est normal') && p1.includes('font-size:10.5pt'));
  const p2 = feuille.ucpmHtmlPagePreparation(b, [1, 3, 4], { premiere: false });
  assert.ok(p2.includes('(suite)') && !p2.includes('<h1>') && p2.includes('Que faisiez-vous') && p2.includes('Il est normal') && p2.includes('font-size:11pt'));
});

test('feuille : la répartition ne coupe jamais un bloc et laisse un bloc trop haut seul', () => {
  assert.deepEqual(feuille.ucpmRepartirBlocs([100, 100, 100], { premiere: 350, suivantes: 350 }), [[0, 1, 2]]);
  assert.deepEqual(feuille.ucpmRepartirBlocs([100, 100, 100, 100], { premiere: 250, suivantes: 300 }), [[0, 1], [2, 3]]);
  assert.deepEqual(feuille.ucpmRepartirBlocs([100, 400, 100], { premiere: 250, suivantes: 300 }), [[0], [1], [2]], 'un bloc plus haut que la page reste seul');
  assert.deepEqual(feuille.ucpmRepartirBlocs([], { premiere: 100, suivantes: 100 }), [[]]);
  assert.deepEqual(feuille.ucpmRepartirBlocs([500], { premiere: 100, suivantes: 100 }), [[0]], 'le premier bloc est toujours posé');
});

test('feuille : le style est sobre (aucune couleur de fond autre que le blanc), A4 et corps de 10 points au moins', () => {
  const css = feuille.ucpmCssPreparation();
  assert.ok(css.includes('width:210mm') && css.includes('height:296mm'));
  assert.ok(!/background:#(?!fff)/i.test(css), 'aucun fond coloré');
  assert.ok(Math.min.apply(null, feuille.UCPM_PREP_TAILLES_PT) >= 10, 'corps de 10 points au moins (décision D7)');
  assert.equal(feuille.UCPM_PREP_TAILLES_PT[0], 11);
});

test('préparation : la ligne « changement de métier » est décidée par l’application, pas devinée par l’assistant', () => {
  const o = metiers.ucpmObjectifVide('spontanee');
  const b = prep.ucpmBlocMetiersPreparation([
    { titre: 'Agent', accroche: 'A.', objectif: o, lettre: 'x', periodes: 'aucune', changement: false },
    { titre: 'Gardienne', accroche: 'G.', objectif: o, lettre: 'y', periodes: 'aucune', changement: true }]);
  assert.ok(b.includes('Changement de métier par rapport au CV de référence : non (même métier'));
  assert.ok(b.includes('Changement de métier par rapport au CV de référence : oui (un autre métier'));
  assert.ok(lire('prompts/ucpm-preparation.md').includes('OBLIGATOIREMENT sur ce changement'), 'le prompt rend la question obligatoire quand la ligne dit oui');
});
