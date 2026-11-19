// Données du module « Explorer les métiers » (phase 1 du plan de clôture, 17/11/2026) :
// structure du questionnaire (90 / 90 / 60 / 60 énoncés), profils de lettres de la partie 2,
// textes des six lettres, sigles de métiers, explications des familles de choix.
// Aucune logique ici : ce sont des contrôles de structure et de langue.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const D = require('../data/questionnaireRiasec.js');
const T = require('../data/comprendreMetiersTextes.js');
const { baseMetiers } = require('../data/metiers.js');

const LETTRES = ['R', 'I', 'A', 'S', 'E', 'C'];
const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, ' ').trim();

// Tous les textes visibles par la personne, pour les contrôles de langue.
function tousLesTextes() {
  const out = [];
  [D.RIASEC_PARTIE_1, D.RIASEC_PARTIE_3, D.RIASEC_PARTIE_4].forEach((p) => p.forEach((e) => { out.push(e.texte, e.theme); }));
  D.RIASEC_PARTIE_2.forEach((l) => { out.push(l.ligne); l.exemples.forEach((x) => out.push(x)); });
  Object.values(D.NOMS_LETTRES_RIASEC).forEach((n) => out.push(n));
  Object.values(T.TEXTES_LETTRES_RIASEC).forEach((t) => Object.values(t).forEach((v) => out.push(v)));
  T.SIGLES_METIERS.forEach((s) => out.push(s.signification));
  Object.values(T.EXPLICATIONS_CHOIX_METIERS).forEach((v) => out.push(v));
  return out;
}

test('questionnaire : 90 activités, 90 lignes de métiers, 60 aptitudes, 60 phrases', () => {
  assert.equal(D.RIASEC_PARTIE_1.length, 90);
  assert.equal(D.RIASEC_PARTIE_2.length, 90);
  assert.equal(D.RIASEC_PARTIE_3.length, 60);
  assert.equal(D.RIASEC_PARTIE_4.length, 60);
});

test('questionnaire : 15, 10 et 10 énoncés par lettre dans les parties 1, 3 et 4', () => {
  [[D.RIASEC_PARTIE_1, 15], [D.RIASEC_PARTIE_3, 10], [D.RIASEC_PARTIE_4, 10]].forEach(([partie, n]) => {
    LETTRES.forEach((L) => assert.equal(partie.filter((e) => e.lettre === L).length, n, 'lettre ' + L));
  });
});

test('questionnaire : identifiants uniques, bien formés, accordés à la lettre ; aucun texte vide', () => {
  const vus = new Set();
  [D.RIASEC_PARTIE_1, D.RIASEC_PARTIE_3, D.RIASEC_PARTIE_4].forEach((partie, k) => {
    const ids = new Set();
    partie.forEach((e) => {
      assert.match(e.id, /^[RIASEC]\d{1,2}$/, 'id mal formé : ' + e.id);
      assert.equal(e.id[0], e.lettre, 'id et lettre différents : ' + e.id);
      assert.ok(!ids.has(e.id), 'id en double dans la partie ' + k + ' : ' + e.id);
      ids.add(e.id);
      assert.ok(e.texte && e.texte.trim() === e.texte && e.texte.length > 8, 'texte vide ou à nettoyer : ' + e.id);
      assert.ok(e.theme && e.theme.trim() === e.theme, 'thème vide : ' + e.id);
    });
    vus.add(ids.size);
  });
  const idsL = new Set();
  D.RIASEC_PARTIE_2.forEach((l) => {
    assert.match(l.id, /^F\d{1,2}$/);
    assert.ok(!idsL.has(l.id), 'ligne en double : ' + l.id);
    idsL.add(l.id);
    assert.ok(l.ligne && l.ligne.trim() === l.ligne && l.ligne.length > 10, 'ligne vide : ' + l.id);
    assert.ok(l.exemples.length >= 4 && l.exemples.length <= 5, l.id + ' : ' + l.exemples.length + ' exemples');
    assert.equal(new Set(l.exemples).size, l.exemples.length, l.id + ' : exemple en double');
  });
});

test('partie 2 : chaque ligne porte les six lettres, des parts entre 0 et 1 qui font 1', () => {
  D.RIASEC_PARTIE_2.forEach((l) => {
    assert.deepEqual(Object.keys(l.profil).sort(), LETTRES.slice().sort(), l.id + ' : lettres');
    let somme = 0;
    LETTRES.forEach((L) => {
      assert.ok(l.profil[L] >= 0 && l.profil[L] <= 1, l.id + ' : part hors de 0..1 pour ' + L);
      somme += l.profil[L];
    });
    assert.ok(Math.abs(somme - 1) < 0.01, l.id + ' : les parts font ' + somme);
  });
});

test('partie 2 : la somme des parts de chaque lettre (maximum de la lettre) reste celle validée le 16/11/2026', () => {
  // Valeurs de la règle de calcul : R 27,1 ; C 23,4 ; E 13,3 ; S 10,5 ; I 10,2 ; A 5,5 (« environ »).
  // Écart admis 0,3 : la régénération des familles après le rangement des métiers de l'hôpital les a décalées d'au plus 0,15.
  const attendu = { R: 27.1, C: 23.4, E: 13.3, S: 10.5, I: 10.2, A: 5.5 };
  LETTRES.forEach((L) => {
    const somme = D.RIASEC_PARTIE_2.reduce((a, l) => a + l.profil[L], 0);
    assert.ok(Math.abs(somme - attendu[L]) < 0.3, L + ' : somme ' + somme.toFixed(2) + ' au lieu de ' + attendu[L]);
  });
});

test('partie 2 : la lettre rare (A) reste présente et plus faible que les autres, c\'est la réalité du répertoire', () => {
  const somme = (L) => D.RIASEC_PARTIE_2.reduce((a, l) => a + l.profil[L], 0);
  LETTRES.filter((L) => L !== 'A').forEach((L) => assert.ok(somme(L) > somme('A'), L + ' devrait dépasser A'));
  assert.ok(D.RIASEC_PARTIE_2.some((l) => l.profil.A >= 0.4), 'au moins une ligne à dominante artistique');
});

test('partie 2 : au moins 90 % des exemples sont de vrais noms de fiches (les autres : sigle écrit en toutes lettres, féminin, intitulé courant)', () => {
  const noms = baseMetiers.map((f) => norm(f.nom).replace(/[-,]/g, ' ').replace(/\s+/g, ' '));
  let total = 0, trouves = 0;
  D.RIASEC_PARTIE_2.forEach((l) => l.exemples.forEach((e) => {
    total += 1;
    const n = norm(e).replace(/[-,]/g, ' ').replace(/\s+/g, ' ');
    if (noms.some((x) => x === n || x.includes(n) || n.includes(x))) { trouves += 1; }
  }));
  assert.ok(trouves / total >= 0.9, trouves + ' exemples sur ' + total + ' correspondent à une fiche');
});

test('langue : aucun tiret long ou demi-cadratin, aucun mot « IA », aucun sigle en majuscules dans les énoncés', () => {
  tousLesTextes().forEach((t) => {
    assert.ok(!/[—–]/.test(t), 'tiret long : ' + t);
    assert.ok(!/\bIA\b/.test(t), 'mot IA : ' + t);
    assert.ok(!/ {2}/.test(t), 'double espace : ' + t);
  });
  [D.RIASEC_PARTIE_1, D.RIASEC_PARTIE_3, D.RIASEC_PARTIE_4].forEach((p) => p.forEach((e) => {
    assert.ok(!/\b[A-ZÉ]{2,}\b/.test(e.texte), 'sigle dans un énoncé : ' + e.texte);
  }));
  D.RIASEC_PARTIE_2.forEach((l) => assert.ok(!/\b[A-ZÉ]{2,}\b/.test(l.ligne), 'sigle dans une ligne : ' + l.ligne));
});

test('langue : aucun anglicisme ni expression écartée dans les textes du module', () => {
  // Mots refusés par Denis : anglais (y compris noms de métiers), « bilan de compétences », « facultatif ».
  const interdits = /\b(coach|manager|designer|trader|barista|scrum|data|web designer|game master|office manager|community manager|devops|freelance|bilan de comp[ée]tences|facultati(f|ve)|bravo|f[ée]licitations)\b/i;
  tousLesTextes().forEach((t) => {
    // « chef de produit » etc. n'ont rien d'anglais ; « marketing » seul est dans le titre officiel d'une famille.
    const sansMarketing = t.replace(/marketing/gi, '');
    assert.ok(!interdits.test(sansMarketing), 'mot refusé : ' + t);
  });
});

test('langue : les énoncés ne posent jamais de diagnostic ni de jugement sur la personne', () => {
  const diagnostic = /\b(vous [eê]tes (timide|paresseux|nul|incapable)|incapable|handicap[ée]e? de|trouble|d[ée]faut|inadapt)/i;
  [D.RIASEC_PARTIE_1, D.RIASEC_PARTIE_3, D.RIASEC_PARTIE_4].forEach((p) => p.forEach((e) => {
    assert.ok(!diagnostic.test(e.texte), 'formulation à revoir : ' + e.texte);
  }));
});

test('six lettres : un nom et six textes non vides pour chacune', () => {
  assert.deepEqual(Object.keys(D.NOMS_LETTRES_RIASEC), LETTRES);
  assert.deepEqual(D.LETTRES_RIASEC, LETTRES);
  assert.deepEqual(Object.keys(T.TEXTES_LETTRES_RIASEC), LETTRES);
  LETTRES.forEach((L) => {
    ['court', 'bref', 'attire', 'forts', 'attention', 'univers', 'metiers'].forEach((c) => {
      assert.ok(T.TEXTES_LETTRES_RIASEC[L][c] && T.TEXTES_LETTRES_RIASEC[L][c].length > 10, L + ' ' + c);
    });
  });
});

test('sigles : uniques, chaque fiche citée existe, aucun sigle déjà écrit dans le nom d\'une fiche', () => {
  const noms = new Set(baseMetiers.map((f) => norm(f.nom)));
  const sigles = new Set();
  T.SIGLES_METIERS.forEach((s) => {
    assert.match(s.sigle, /^[A-Z]{2,5}$/, 'sigle mal formé : ' + s.sigle);
    assert.ok(!sigles.has(s.sigle), 'sigle en double : ' + s.sigle);
    sigles.add(s.sigle);
    assert.ok(s.signification.length > 10, s.sigle + ' : signification');
    assert.ok(s.fiches.length >= 1, s.sigle + ' : aucune fiche');
    s.fiches.forEach((n) => assert.ok(noms.has(norm(n)), s.sigle + ' : fiche introuvable : ' + n));
    const rx = new RegExp('\\b' + s.sigle + '\\b');
    // Un sigle peut désigner deux métiers (CIP : conseiller en insertion professionnelle, et conseiller d'insertion et de probation, dont la fiche l'écrit dans son nom) :
    // le catalogue ne porte alors que le métier dont le nom ne l'écrit pas, et la recherche affiche les deux.
    const HOMONYMES = ['CIP'];
    baseMetiers.forEach((f) => assert.ok(HOMONYMES.includes(s.sigle) ? !s.fiches.some((n) => norm(n) === norm(f.nom)) || !rx.test(f.nom) : !rx.test(f.nom), s.sigle + ' est déjà écrit dans la fiche « ' + f.nom + ' » : inutile dans le catalogue'));
  });
  assert.equal(T.SIGLES_METIERS.length, 15);
});

test('explications des choix : une phrase pour chacune des 15 familles des catalogues, ni plus ni moins', () => {
  const ctx = {}; vm.createContext(ctx);
  ['actionsProfessionnelles', 'personnesMaterielsLieux', 'environnementsTravail'].forEach((f) => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', f + '.js'), 'utf8') + ';', ctx));
  const categories = [];
  ['CATALOGUE_ACTIONS_PRO', 'CATALOGUE_PERSONNES_MATERIELS_LIEUX', 'CATALOGUE_ENVIRONNEMENTS_TRAVAIL'].forEach((nom) => {
    vm.runInContext(nom, ctx).forEach((g) => categories.push(g.categorie));
  });
  assert.equal(categories.length, 15, 'familles de choix trouvées : ' + categories.length);
  assert.deepEqual(Object.keys(T.EXPLICATIONS_CHOIX_METIERS).sort(), categories.slice().sort());
  Object.values(T.EXPLICATIONS_CHOIX_METIERS).forEach((v) => assert.ok(v.length > 20 && /[.…]$/.test(v), 'phrase à terminer : ' + v));
});
