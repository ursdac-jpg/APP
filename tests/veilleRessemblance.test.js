'use strict';
const test = require('node:test');
const assert = require('node:assert');
const R = require('../outils/veilleRessemblance.js');
const fichesSas = require('../outils/veilleFichesSas.js');

const TEXTE_ASS_REPRISE = 'Vous touchez l\'ASS et un employeur vous propose un contrat. Allez-vous perdre votre allocation tout de suite ? Pas forcément. Si vous reprenez une activité, l\'ASS peut être maintenue. Elle se cumule en entier avec votre salaire pendant 3 mois, qui se suivent ou non, dans la limite des droits qu\'il vous reste. Pour compter ces 3 mois, tout mois du calendrier pendant lequel vous avez travaillé compte, même si l\'activité a été occasionnelle ou réduite. Après ces 3 mois, si l\'activité continue, le versement de l\'ASS s\'arrête.';
const TEXTE_AAH_TRAVAIL = 'L\'allocation aux adultes handicapés est un revenu minimum versé par la CAF. L\'AAH n\'empêche pas de travailler, au contraire. Si vous reprenez un emploi, une partie de votre salaire n\'est pas comptée grâce à un abattement. Si vous travaillez en ESAT, la façon de déclarer vos revenus change à partir d\'octobre 2026.';

// Un petit extrait réaliste des fiches publiées : l'ASS est dans « budget », l'AAH dans « handicap ».
const EXISTANTES = [
  { id: 'budget-ass-reprise-d-activite-que-devient-mon-allocation', rayon: 'budget', titre: 'Je touche l\'ASS et je reprends un travail : que devient mon allocation ?', tags: ['ASS', 'reprise d\'activité', 'cumul', 'prime d\'activité', 'allocation de solidarité spécifique'], sources: ['service-public-ass'], statut: 'actif', texte: TEXTE_ASS_REPRISE },
  { id: 'handicap-fin-du-cumul-ass-aah-au-31-decembre-2026', rayon: 'handicap', titre: 'Je touche l\'ASS et l\'AAH en même temps : que se passe-t-il au 31 décembre 2026 ?', tags: ['ASS', 'AAH', 'cumul', 'fin du cumul', '2027', 'allocation de solidarité spécifique', 'allocation aux adultes handicapés'], sources: ['service-public-aah-ass-cumul-2027', 'service-public-ass'], statut: 'actif', texte: 'Le cumul prend fin le 31 décembre 2026.' },
  { id: 'handicap-aah-et-travail', rayon: 'handicap', titre: 'L\'allocation aux adultes handicapés (AAH) et le travail', tags: ['AAH', 'allocation aux adultes handicapés', 'MDPH', 'CDAPH', 'CAF', 'cumul emploi', 'abattement', 'déconjugalisation'], sources: ['service-public-aah'], statut: 'actif', texte: TEXTE_AAH_TRAVAIL },
  { id: 'accompagnement-a-qui-m-adresser', rayon: 'accompagnement', titre: 'Qui accompagne vers l\'emploi : le bon interlocuteur selon ma situation', tags: ['accompagnement', 'France Travail', 'Mission locale', 'Cap emploi', 'RSA'], sources: ['france-travail'], statut: 'actif' },
  { id: 'budget-droit-au-compte', rayon: 'budget', titre: 'Une banque refuse de m\'ouvrir un compte : le droit au compte', tags: ['droit au compte', 'banque', 'France Travail'], sources: ['banque-de-france'], statut: 'actif' },
  { id: 'budget-ancienne', rayon: 'budget', titre: 'Je touche l\'ASS et je reprends un travail (ancienne version)', tags: ['ASS', 'reprise d\'activité', 'cumul', 'prime d\'activité'], sources: ['service-public-ass'], statut: 'retire' }
];

const TEXTE_DOUBLON = 'Vous touchez l\'ASS et on vous propose un contrat ? Reprendre une activité ne fait pas disparaître l\'allocation. L\'ASS peut se cumuler en totalité avec les revenus d\'une activité pendant 3 mois, qui se suivent ou non, dans la limite des droits qu\'il vous reste. Pour calculer ces 3 mois, tout mois du calendrier pendant lequel vous avez travaillé compte, même si l\'activité a été occasionnelle ou réduite. Après ces 3 mois, si l\'activité continue, le versement de l\'ASS s\'arrête.';
const TEXTE_AUTRE_QUESTION = 'Vous vivez avec un handicap et vous vous demandez si l\'AAH est faite pour vous ? Il faut un taux d\'incapacité d\'au moins 80 %. Entre 50 % et 79 %, on peut y prétendre avec une restriction substantielle et durable d\'accès à un emploi. Il faut avoir au moins 20 ans et résider en France.';

test('une fiche qui recopie des passages d\'une fiche publiée est signalée « répète », avec les passages, même depuis un autre rayon', () => {
  const r = R.chercher({ id: '', titre: 'Peut-on reprendre un travail en touchant l\'ASS ?', tags: 'ASS, reprise d\'activité, cumul, prime d\'activité, emploi, France Travail', sources: ['service-public-ass'], texte: TEXTE_DOUBLON }, EXISTANTES);
  assert.strictEqual(r[0].id, 'budget-ass-reprise-d-activite-que-devient-mon-allocation');
  assert.strictEqual(r[0].niveau, 'repete');
  assert.ok(r[0].partTexte >= 8 && r[0].passages.length >= 1, 'la part du texte et au moins un passage répété sont donnés');
  assert.ok(r[0].tagsCommuns.indexOf('ASS') !== -1 && r[0].sourcesCommunes.indexOf('service-public-ass') !== -1);
  assert.ok(r.length <= 3);
});

test('même thème mais textes qui ne se répètent pas : simple note « theme », jamais « repete »', () => {
  const r = R.chercher({ id: '', titre: 'Qui peut recevoir l\'allocation aux adultes handicapés (AAH) ?', tags: ['AAH', 'allocation aux adultes handicapés', 'CDAPH', 'déconjugalisation'], sources: ['service-public-aah'], texte: TEXTE_AUTRE_QUESTION }, EXISTANTES);
  const x = r.filter((y) => y.id === 'handicap-aah-et-travail')[0];
  assert.ok(x, 'le même thème est signalé');
  assert.strictEqual(x.niveau, 'theme');
  assert.deepStrictEqual(x.passages, []);
});

test('une fiche dont « ce n\'est pas un doublon » a été dit n\'est plus signalée', () => {
  const cand = { id: '', titre: 'Qui peut recevoir l\'allocation aux adultes handicapés (AAH) ?', tags: ['AAH', 'allocation aux adultes handicapés', 'CDAPH', 'déconjugalisation'], sources: ['service-public-aah'], texte: TEXTE_AUTRE_QUESTION };
  const r = R.chercher(cand, EXISTANTES, ['handicap-aah-et-travail']);
  assert.ok(r.every((y) => y.id !== 'handicap-aah-et-travail'));
});

test('une fiche retirée n\'est jamais proposée, et une fiche n\'est pas comparée à elle-même', () => {
  const r = R.chercher({ id: 'budget-ass-reprise-d-activite-que-devient-mon-allocation', titre: 'Je touche l\'ASS et je reprends un travail', tags: ['ASS', 'reprise d\'activité', 'cumul', 'prime d\'activité'], sources: ['service-public-ass'] }, EXISTANTES);
  assert.ok(r.every((x) => x.id !== 'budget-ancienne' && x.id !== 'budget-ass-reprise-d-activite-que-devient-mon-allocation'));
});

test('un sujet sans rapport n\'est pas signalé (pas de fausse alerte)', () => {
  const r = R.chercher({ id: '', titre: 'Comment faire un CV pour un premier emploi ?', tags: ['CV', 'premier emploi', 'jeune'], sources: ['service-public-cv'] }, EXISTANTES);
  assert.deepStrictEqual(r, []);
});

test('des mots-clés très répandus (France Travail) ne suffisent pas à signaler une ressemblance', () => {
  const r = R.chercher({ id: '', titre: 'Les horaires d\'ouverture', tags: ['France Travail'], sources: [] }, EXISTANTES);
  assert.deepStrictEqual(r, []);
});

test('message de rédaction : les fiches des autres rayons dont les mots-clés sont dans le matériau sont proposées, pas celles du rayon choisi ni les hors sujet', () => {
  const materiau = 'L\'ASS, allocation de solidarité spécifique, se cumule avec une activité : reprise d\'activité, prime d\'activité, cumul pendant 3 mois.';
  const l = R.autresRayonsProches(materiau, 'handicap', EXISTANTES, 25);
  assert.ok(l.some((x) => x.id === 'budget-ass-reprise-d-activite-que-devient-mon-allocation'));
  assert.ok(l.every((x) => x.rayon !== 'handicap' && x.id !== 'budget-ancienne' && x.id !== 'budget-droit-au-compte'));
});

test('sas des fiches : une nouvelle proposition qui répète une fiche publiée est signalée sans être bloquée ; « pas un doublon » la fait taire', () => {
  const bloc = '[FICHE 3]\nid:\ntitre: Peut-on reprendre un travail en touchant l\'ASS ?\npour_qui: Pour une personne qui touche l\'ASS.\nterritoire: national\ntags: ASS, reprise d\'activité, cumul, prime d\'activité\nsources:\n- service-public-ass\nce_qui_change_souvent:\n- La durée du cumul\nphrase_generale: L\'ASS peut se cumuler un temps avec un salaire.\ntexte:\n' + TEXTE_DOUBLON + '\n[/FICHE 3]';
  const cx = { aujourdhui: '2026-11-08', rayon: 'handicap', rayons: ['handicap', 'budget'], trouverFiche: () => null, fichesExistantes: () => EXISTANTES, sourcesConnues: ['service-public-ass'] };
  const lu = fichesSas.lireReponse(bloc, cx);
  assert.strictEqual(lu.items[0].genre, 'nouv');
  const ev = fichesSas.evaluer(lu.items[0], cx);
  assert.strictEqual(ev.ressemble[0].id, 'budget-ass-reprise-d-activite-que-devient-mon-allocation');
  assert.strictEqual(ev.ressemble[0].niveau, 'repete');
  assert.ok(!ev.problemes.some((p) => /ressemble|doublon|répète/i.test(p)), 'jamais un blocage : la personne tranche');
  const rec = { id: 'nouv-x', genre: 'nouv', rayon: 'handicap', fiche: 'handicap-peut-on-reprendre', titre: 'Peut-on reprendre', cree_le: '2026-11-08', champs: lu.items[0].champs };
  const texteSas = fichesSas.ecrireSas([rec]);
  assert.ok(fichesSas.lister(texteSas, cx).lignes[0].ressemble.length >= 1, 'la liste du sas montre aussi la ressemblance');
  // « Ce n'est pas un doublon » : gardé dans la proposition, et la ressemblance ne revient plus pour cette fiche.
  const ap = fichesSas.appliquer(texteSas, [{ op: 'pas-doublon', id: 'nouv-x', fiche: 'budget-ass-reprise-d-activite-que-devient-mon-allocation' }], cx);
  assert.ok(ap.ok, ap.erreur);
  const apres = fichesSas.lister(ap.texte, cx).lignes[0];
  assert.ok(apres.ressemble.every((y) => y.id !== 'budget-ass-reprise-d-activite-que-devient-mon-allocation'));
  // et on peut revenir sur sa décision
  const retour = fichesSas.appliquer(ap.texte, [{ op: 'pas-doublon', id: 'nouv-x', fiche: 'budget-ass-reprise-d-activite-que-devient-mon-allocation', retablir: true }], cx);
  assert.ok(fichesSas.lister(retour.texte, cx).lignes[0].ressemble.some((y) => y.id === 'budget-ass-reprise-d-activite-que-devient-mon-allocation'));
  // une proposition inconnue ou un identifiant invalide sont refusés
  assert.strictEqual(fichesSas.appliquer(texteSas, [{ op: 'pas-doublon', id: 'nouv-inconnue', fiche: 'handicap-aah-et-travail' }], cx).ok, false);
  assert.strictEqual(fichesSas.appliquer(texteSas, [{ op: 'pas-doublon', id: 'nouv-x', fiche: 'Pas Valide !' }], cx).ok, false);
});
