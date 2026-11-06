const { test } = require('node:test');
const assert = require('node:assert/strict');
const P = require('../modules/passages-a-preciser/logique.js');
const metiers = require('../data/metiers.js');
const inc = require('../data/incoherencesImport.js');

function jeu() {
  return {
    certifications: ['sSsT', 'Habilitation électrique B0'],
    savoirEtre: ['Rigueur NI', 'Patience'],
    experiences: [{ poste: 'Vendeur', dateDebut: '2024', dateFin: '2021' }, { poste: 'Caissier', dateDebut: '2018', dateFin: '2019' }]
  };
}
function etatSur(valeurs, points) {
  return P.passagesCreerEtat(points, {
    cibles: () => [valeurs],
    marqueurRetirer: metiers.PRECISION_RETIRER,
    appliquer: (extrait, valeur, point) => (point && point.cible ? inc.appliquerPrecisionCible(valeurs, point.cible, valeur) : metiers.remplacerPrecisionDansListes(valeurs, extrait, valeur))
  });
}
const PT_SST = { titre: 'Certification à vérifier', extrait: 'sSsT', question: 'Quel intitulé ?' };
const PT_RIGUEUR = { titre: 'Qualité à vérifier', extrait: 'Rigueur NI', question: 'Écrire seulement Rigueur ?' };
const PT_DATES = { titre: 'Dates', extrait: 'Vendeur', question: 'Quelles années ?', cible: { type: 'dates', poste: 'Vendeur', dateDebut: '2024', dateFin: '2021' } };

// ---------------- Réponse appliquée puis modifiée ----------------
test('une réponse remplace le texte, une autre réponse le remplace par la nouvelle valeur', () => {
  const v = jeu(); const e = etatSur(v, [PT_SST]);
  assert.equal(P.passagesDefinirReponse(e, 0, 'repondu', 'SST').applique, true);
  assert.deepEqual(v.certifications, ['SST', 'Habilitation électrique B0']);
  P.passagesDefinirReponse(e, 0, 'repondu', 'Sauveteur secouriste du travail');
  assert.deepEqual(v.certifications, ['Sauveteur secouriste du travail', 'Habilitation électrique B0']);
});

test('passer la question défait la réponse précédente et remet le texte d’origine à sa place', () => {
  const v = jeu(); const e = etatSur(v, [PT_SST]);
  P.passagesDefinirReponse(e, 0, 'repondu', 'SST');
  P.passagesDefinirReponse(e, 0, 'passe');
  assert.deepEqual(v.certifications, ['sSsT', 'Habilitation électrique B0']);
  assert.equal(P.passagesStatut(e, 0), 'passe');
});

test('vider le champ (réponse vide) défait aussi la réponse', () => {
  const v = jeu(); const e = etatSur(v, [PT_SST]);
  P.passagesDefinirReponse(e, 0, 'repondu', 'SST');
  P.passagesDefinirReponse(e, 0, 'repondu', '   ');
  assert.deepEqual(v.certifications, ['sSsT', 'Habilitation électrique B0']);
  assert.equal(P.passagesStatut(e, 0), 'attente');
});

test('retirer supprime l’élément, changer d’avis le remet à son rang', () => {
  const v = jeu(); const e = etatSur(v, [PT_SST]);
  P.passagesDefinirReponse(e, 0, 'retire');
  assert.deepEqual(v.certifications, ['Habilitation électrique B0']);
  P.passagesDefinirReponse(e, 0, 'passe');
  assert.deepEqual(v.certifications, ['sSsT', 'Habilitation électrique B0']);
});

test('deux questions indépendantes : défaire l’une laisse l’autre en place', () => {
  const v = jeu(); const e = etatSur(v, [PT_SST, PT_RIGUEUR]);
  P.passagesDefinirReponse(e, 0, 'repondu', 'SST');
  P.passagesDefinirReponse(e, 1, 'repondu', 'Rigueur');
  assert.deepEqual(v.savoirEtre, ['Rigueur', 'Patience']);
  P.passagesDefinirReponse(e, 0, 'passe');
  assert.deepEqual(v.certifications, ['sSsT', 'Habilitation électrique B0']);
  assert.deepEqual(v.savoirEtre, ['Rigueur', 'Patience']);
});

test('dates d’une expérience : appliquées, corrigées, puis remises comme avant', () => {
  const v = jeu(); const e = etatSur(v, [PT_DATES]);
  assert.equal(P.passagesDefinirReponse(e, 0, 'repondu', '2021 à 2024').applique, true);
  assert.equal(v.experiences[0].dateDebut, '2021');
  assert.equal(v.experiences[0].dateFin, '2024');
  P.passagesDefinirReponse(e, 0, 'passe');
  assert.equal(v.experiences[0].dateDebut, '2024');
  assert.equal(v.experiences[0].dateFin, '2021');
});

// ---------------- Valeur retouchée à la main entre-temps ----------------
test('une valeur retouchée à la main n’est pas écrasée par l’annulation, et on le sait', () => {
  const v = jeu(); const e = etatSur(v, [PT_SST]);
  P.passagesDefinirReponse(e, 0, 'repondu', 'SST');
  v.certifications[0] = 'SST (2021)';   // la personne a corrigé à la main sur la page
  const r = P.passagesDefinirReponse(e, 0, 'passe');
  assert.equal(r.ignorees, 1);
  assert.deepEqual(v.certifications, ['SST (2021)', 'Habilitation électrique B0']);
});

test('une date retouchée à la main n’est pas écrasée', () => {
  const v = jeu(); const e = etatSur(v, [PT_DATES]);
  P.passagesDefinirReponse(e, 0, 'repondu', '2021 à 2024');
  v.experiences[0].dateDebut = '2022';
  const r = P.passagesDefinirReponse(e, 0, 'passe');
  assert.equal(r.ignorees, 1);
  assert.equal(v.experiences[0].dateDebut, '2022');
});

// ---------------- Réponse qui ne trouve rien à remplacer ----------------
test('une réponse qui ne remplace rien reste dans les informations non classées, une seule fois', () => {
  const v = jeu();
  const e = etatSur(v, [{ titre: 'Passage', extrait: 'Texte introuvable', question: 'Que voulez-vous dire ?' }]);
  assert.equal(P.passagesDefinirReponse(e, 0, 'repondu', 'Précision utile').applique, false);
  assert.deepEqual(P.passagesReponsesNonAppliquees(e), ['Passage : Précision utile']);
  const dossier = {};
  assert.deepEqual(P.passagesFinaliser(e, dossier), ['Passage : Précision utile']);
  assert.deepEqual(dossier.informationsNonClassees, ['Passage : Précision utile']);
  assert.deepEqual(P.passagesFinaliser(e, dossier), []);
  assert.equal(dossier.informationsNonClassees.length, 1);
});

test('une réponse appliquée n’est pas répétée dans les informations non classées', () => {
  const v = jeu(); const e = etatSur(v, [PT_SST]);
  P.passagesDefinirReponse(e, 0, 'repondu', 'SST');
  assert.deepEqual(P.passagesReponsesNonAppliquees(e), []);
});

test('une fois la page validée, plus aucune modification', () => {
  const v = jeu(); const e = etatSur(v, [PT_SST]);
  P.passagesDefinirReponse(e, 0, 'repondu', 'SST');
  P.passagesFinaliser(e, {});
  P.passagesDefinirReponse(e, 0, 'passe');
  assert.deepEqual(v.certifications, ['SST', 'Habilitation électrique B0']);
});

test('sans fonction d’application ni objet à suivre : la réponse est gardée, rien n’est modifié', () => {
  const e = P.passagesCreerEtat([PT_SST], {});
  assert.equal(P.passagesDefinirReponse(e, 0, 'repondu', 'SST').applique, false);
  assert.deepEqual(P.passagesReponsesNonAppliquees(e), ['Certification à vérifier : SST']);
});

test('une fonction d’application qui plante ne casse pas le bloc', () => {
  const e = P.passagesCreerEtat([PT_SST], { appliquer: () => { throw new Error('x'); }, cibles: () => [] });
  assert.equal(P.passagesDefinirReponse(e, 0, 'repondu', 'SST').applique, false);
});

test('plusieurs objets suivis (deux versions du CV) : la réponse touche les deux, l’annulation aussi', () => {
  const a = jeu(), b = jeu();
  const e = P.passagesCreerEtat([PT_SST], {
    cibles: () => [a, b],
    marqueurRetirer: metiers.PRECISION_RETIRER,
    appliquer: (extrait, valeur) => [a, b].some((o) => metiers.remplacerPrecisionDansListes(o, extrait, valeur))
  });
  P.passagesDefinirReponse(e, 0, 'repondu', 'SST');
  assert.equal(a.certifications[0], 'SST');
  P.passagesDefinirReponse(e, 0, 'passe');
  assert.equal(a.certifications[0], 'sSsT');
  assert.equal(b.certifications[0], 'sSsT');
});

// ---------------- Chiffres et textes ----------------
test('compteur, bilan et résumé', () => {
  const v = jeu(); const e = etatSur(v, [PT_SST, PT_RIGUEUR, PT_DATES]);
  assert.equal(P.passagesTexteCompteur(e), '0 question sur 3 traitée');
  P.passagesDefinirReponse(e, 0, 'repondu', 'SST');
  P.passagesDefinirReponse(e, 1, 'passe');
  assert.equal(P.passagesTexteCompteur(e), '2 questions sur 3 traitées');
  assert.deepEqual(P.passagesBilan(e), { total: 3, repondues: 1, passees: 1, retirees: 0, restantes: 1, traitees: 2 });
  assert.equal(P.passagesTexteResume(e), 'Passages à préciser : 1 précisé, 1 passé, 1 laissé sans réponse.');
  P.passagesDefinirReponse(e, 2, 'retire');
  assert.match(P.passagesTexteResume(e), /1 à retirer/);
});

test('les questions sans texte de question sont ignorées', () => {
  const e = P.passagesCreerEtat([{ titre: 'x', question: '' }, PT_SST], {});
  assert.equal(e.points.length, 1);
});

// ---------------- Regroupements ----------------
test('groupes d’années : seulement à partir de deux certifications sous la même formation', () => {
  const pts = [
    { titre: 'Année de certification', extrait: 'SST', question: 'q', groupe: 'BTS', suggestions: ['2021', '2022'] },
    { titre: 'Année de certification', extrait: 'B0', question: 'q', groupe: 'BTS', suggestions: ['2021', '2022'] },
    { titre: 'Année de certification', extrait: 'CACES', question: 'q', groupe: 'CAP', suggestions: ['2019'] }
  ];
  const g = P.passagesGroupesAnnees(pts);
  assert.equal(g.length, 1);
  assert.deepEqual(g[0].indices, [0, 1]);
  assert.deepEqual(g[0].annees, ['2021', '2022']);
});

test('sujets : une certification par sujet (accents et casse ignorés), le reste dans « Autres passages »', () => {
  const pts = [
    { titre: 'Année de certification', extrait: 'SST (Sauveteur secouriste)', question: 'q' },
    { titre: 'Certification à vérifier', extrait: 'sst (sauveteur secouriste)', question: 'q' },
    { titre: 'Dates', extrait: 'Vendeur', question: 'q' }
  ];
  const s = P.passagesSujets(pts);
  assert.equal(s.length, 2);
  assert.deepEqual(s[0].indices, [0, 1]);
  assert.equal(s[0].nom, 'SST');
  assert.equal(s[1].nom, 'Autres passages');
});

// ---------------- Différence et annulation : cas limites ----------------
test('différence : rien de changé, aucune opération', () => {
  assert.deepEqual(P.passagesDifference({ a: [1, 2] }, { a: [1, 2] }), []);
});

test('annulation : chemin disparu, opération ignorée sans erreur', () => {
  const ops = P.passagesDifference({ x: { y: 'a' } }, { x: { y: 'b' } }).map((o) => Object.assign({ cible: 0 }, o));
  const cible = { x: null };
  assert.deepEqual(P.passagesAnnulerOps([cible], ops), { annulees: 0, ignorees: 1 });
});

// ---------------- Rangement au fil des réponses (dossierInfos) ----------------
test('avec le dossier : une réponse qui ne remplace rien est rangée tout de suite, corrigée puis retirée si on passe', () => {
  const v = jeu(); const dossier = { informationsNonClassees: ['Déjà là'] };
  const e = P.passagesCreerEtat([{ titre: 'Passage', extrait: 'Introuvable', question: 'Que voulez-vous dire ?' }], {
    cibles: () => [v], dossierInfos: dossier, appliquer: (x, val) => metiers.remplacerPrecisionDansListes(v, x, val)
  });
  P.passagesDefinirReponse(e, 0, 'repondu', 'Premier texte');
  assert.deepEqual(dossier.informationsNonClassees, ['Déjà là', 'Passage : Premier texte']);
  P.passagesDefinirReponse(e, 0, 'repondu', 'Second texte');
  assert.deepEqual(dossier.informationsNonClassees, ['Déjà là', 'Passage : Second texte']);
  P.passagesDefinirReponse(e, 0, 'passe');
  assert.deepEqual(dossier.informationsNonClassees, ['Déjà là']);
  assert.deepEqual(P.passagesFinaliser(e, dossier), []);
  assert.deepEqual(dossier.informationsNonClassees, ['Déjà là']);
});

test('avec le dossier : une réponse appliquée n’est rangée nulle part', () => {
  const v = jeu(); const dossier = {};
  const e = P.passagesCreerEtat([PT_SST], { cibles: () => [v], dossierInfos: dossier, marqueurRetirer: metiers.PRECISION_RETIRER, appliquer: (x, val) => metiers.remplacerPrecisionDansListes(v, x, val) });
  P.passagesDefinirReponse(e, 0, 'repondu', 'SST');
  assert.equal(dossier.informationsNonClassees, undefined);
  assert.equal(v.certifications[0], 'SST');
});

// ---------------- Mode différé (écran de validation du Bilan) ----------------
test('différé : les réponses sont gardées sans rien appliquer, puis appliquées d’un coup sur l’objet de travail', () => {
  const travail = { certifications: ['sSsT', 'Habilitation électrique B0'], savoirEtre: ['Rigueur NI'], experiences: [] };
  const e = P.passagesCreerEtat([PT_SST, PT_RIGUEUR], { differe: true, marqueurRetirer: metiers.PRECISION_RETIRER });
  assert.deepEqual(P.passagesDefinirReponse(e, 0, 'repondu', 'SST'), { applique: false, ignorees: 0 });
  P.passagesDefinirReponse(e, 1, 'retire');
  assert.deepEqual(travail.certifications, ['sSsT', 'Habilitation électrique B0']);
  P.passagesDefinirReponse(e, 0, 'repondu', 'SST (Sauveteur secouriste du travail)');   // on peut changer d’avis jusqu’à la validation
  const non = P.passagesAppliquerSurObjet(e, travail, (x, v, p) => metiers.remplacerPrecisionDansListes(travail, x, v));
  assert.deepEqual(non, []);
  assert.deepEqual(travail.certifications, ['SST (Sauveteur secouriste du travail)', 'Habilitation électrique B0']);
  assert.deepEqual(travail.savoirEtre, []);
});

test('différé : une réponse qui ne trouve rien est renvoyée pour les informations non classées ; passer ou ne pas répondre ne fait rien', () => {
  const travail = { certifications: ['A'] };
  const e = P.passagesCreerEtat([{ titre: 'Passage', extrait: 'Introuvable', question: 'q' }, PT_SST, PT_RIGUEUR], { differe: true });
  P.passagesDefinirReponse(e, 0, 'repondu', 'Texte libre');
  P.passagesDefinirReponse(e, 1, 'passe');
  assert.deepEqual(P.passagesAppliquerSurObjet(e, travail, (x, v) => metiers.remplacerPrecisionDansListes(travail, x, v)), ['Passage : Texte libre']);
  assert.deepEqual(travail.certifications, ['A']);
});

// ---------------- Mode « rejoué » (Reformuler : la page relit sa réponse avec les corrections à chaque affichage) ----------------
test('rejoué : comme différé (rien n’est appliqué par le composant), et l’état le dit pour que le texte du bloc soit juste', () => {
  const e = P.passagesCreerEtat([PT_SST], { rejoue: true, marqueurRetirer: metiers.PRECISION_RETIRER });
  assert.equal(e.differe, true);
  assert.equal(e.rejoue, true);
  assert.deepEqual(P.passagesDefinirReponse(e, 0, 'repondu', 'SST'), { applique: false, ignorees: 0 });
  assert.equal(e.reponses[0].valeur, 'SST');
  P.passagesDefinirReponse(e, 0, 'retire');
  assert.equal(e.reponses[0].valeur, metiers.PRECISION_RETIRER);
  assert.equal(P.passagesCreerEtat([PT_SST], { differe: true }).rejoue, false);
});
