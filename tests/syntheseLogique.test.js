// « Ma synthèse » (tâche A1), logique pure : classement visuel des six lettres, métiers qui reviennent, compétences communes,
// comparaison des lettres, écart de niveau, plafonds. Aucun calcul ne note la personne.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const S = require('../modules/comprendre-les-metiers/syntheseLogique.js');
const L = require('../modules/comprendre-les-metiers/logique.js');

const LET = ['R', 'I', 'A', 'S', 'E', 'C'];
const PARTIES = ['p1', 'p2', 'p3', 'p4'];
// Résultat du questionnaire à partir de pourcentages identiques dans les quatre parties.
function resultat(pctLettres) {
  const pct = {};
  PARTIES.forEach((p) => { pct[p] = Object.assign({}, pctLettres); });
  return L.cmqResultatDepuisPourcentages(pct, false);
}

test('lettres : deux premières en fort, troisième en moyen si elle se démarque, le reste discret', () => {
  const r = resultat({ R: 10, I: 20, A: 40, S: 90, E: 70, C: 50 });
  const c = S.synClasserLettres(r);
  assert.equal(c.S, 'fort');
  assert.equal(c.E, 'fort');
  assert.equal(c.C, 'moyen');
  assert.equal(c.A, 'discret');
  assert.equal(c.I, 'discret');
  assert.equal(c.R, 'discret');
});

test('lettres : la troisième reste discrète si elle ne se démarque pas de la quatrième', () => {
  const r = resultat({ R: 10, I: 20, A: 49, S: 90, E: 70, C: 50 });
  const c = S.synClasserLettres(r);
  assert.equal(c.C, 'discret');
  assert.equal(c.A, 'discret');
});

test('lettres : une lettre à égalité avec la deuxième est aussi en fort (ex aequo tous en fort)', () => {
  const r = resultat({ R: 10, I: 20, A: 40, S: 90, E: 70, C: 70 });
  const c = S.synClasserLettres(r);
  assert.equal(c.S, 'fort');
  assert.equal(c.E, 'fort');
  assert.equal(c.C, 'fort');
});

test('lettres : trois lettres à égalité tout en haut sont toutes en fort', () => {
  const r = resultat({ R: 10, I: 20, A: 40, S: 90, E: 90, C: 90 });
  const c = S.synClasserLettres(r);
  assert.equal(c.S, 'fort');
  assert.equal(c.E, 'fort');
  assert.equal(c.C, 'fort');
  assert.equal(c.A, 'discret');
});

test('lettres : deux lettres à égalité en tête, la troisième reste en moyen si elle se démarque', () => {
  const r = resultat({ R: 10, I: 20, A: 40, S: 90, E: 90, C: 70 });
  const c = S.synClasserLettres(r);
  assert.equal(c.S, 'fort');
  assert.equal(c.E, 'fort');
  assert.equal(c.C, 'moyen');
});

test('lettres : pas assez de réponses, tout est discret et rien n\'est mis en avant', () => {
  const r = resultat({ R: 5, I: 4, A: 3, S: 20, E: 2, C: 1 });
  assert.equal(r.etat, 'peu_reponses');
  const c = S.synClasserLettres(r);
  LET.forEach((l) => assert.equal(c[l], 'discret'));
});

test('lettres : un résultat absent ou mal formé ne casse rien', () => {
  [null, undefined, {}, { valeurs: {} }, { valeurs: {}, classement: 'x' }].forEach((x) => {
    const c = S.synClasserLettres(x);
    LET.forEach((l) => assert.equal(c[l], 'discret'));
  });
});

test('lettres : la troisième n\'est pas « moyen » si elle vaut moins de 10 % (hors du code)', () => {
  const r = resultat({ R: 0, I: 0, A: 5, S: 90, E: 70, C: 0 });
  assert.equal(S.synClasserLettres(r).A, 'discret');
});

test('métiers qui reviennent : seuls les métiers présents dans au moins deux passages, nom comparé sans accent ni majuscule', () => {
  const liste = S.synMetiersQuiReviennent({
    p1: ['Éducateur spécialisé', 'Boulanger', { nom: 'Aide-soignant' }],
    p2: ['Educateur specialise', 'Maçon'],
    p3: ['aide soignant', 'Educateur Specialise', 'Plombier']
  });
  assert.equal(liste.length, 2);
  assert.equal(liste[0].nom, 'Éducateur spécialisé');
  assert.deepEqual(liste[0].passages, ['p1', 'p2', 'p3']);
  assert.equal(liste[1].nom, 'Aide-soignant');
  assert.deepEqual(liste[1].passages, ['p1', 'p3']);
});

test('métiers qui reviennent : un doublon dans un même passage ne compte qu\'une fois', () => {
  const liste = S.synMetiersQuiReviennent({ p1: ['Boulanger', 'boulanger', 'BOULANGER'], p2: [], p3: undefined });
  assert.deepEqual(liste, []);
});

test('métiers qui reviennent : entrée absente, vide ou mal formée', () => {
  assert.deepEqual(S.synMetiersQuiReviennent(null), []);
  assert.deepEqual(S.synMetiersQuiReviennent({}), []);
  assert.deepEqual(S.synMetiersQuiReviennent({ p1: 'texte', p2: [null, undefined, 3, {}] }), []);
});

test('métiers qui reviennent : plafonné', () => {
  const noms = [];
  for (let i = 0; i < 20; i++) { noms.push('Métier ' + String.fromCharCode(65 + i)); }
  const liste = S.synMetiersQuiReviennent({ p1: noms, p2: noms });
  assert.equal(liste.length, S.SYN_PLAFONDS.metiersQuiReviennent);
});

test('compétences communes : celles présentes dans au moins deux listes', () => {
  const a = [{ t: 'sf', i: 1 }, { t: 'se', i: 2 }, { t: 'sv', i: 3 }];
  const b = [{ t: 'sf', i: 1 }, { t: 'sv', i: 9 }];
  const c = [{ t: 'se', i: 2 }, { t: 'sf', i: 1 }];
  const r = S.synCompetencesCommunes([a, b, c]);
  assert.equal(r.length, 2);
  assert.equal(r[0].competence.i, 1);
  assert.equal(r[0].fois, 3);
  assert.equal(r[1].competence.i, 2);
  assert.equal(r[1].fois, 2);
});

test('compétences communes : textes comparés sans accent, aucune erreur si l\'entrée est mal formée', () => {
  assert.equal(S.synCompetencesCommunes([['Écouter'], ['ecouter']]).length, 1);
  assert.deepEqual(S.synCompetencesCommunes(null), []);
  assert.deepEqual(S.synCompetencesCommunes([null, 'x', [null]]), []);
});

test('lettres du métier : communes, absentes du code, mêmes lettres', () => {
  const r = S.synComparerLettres(['S', 'E', 'C'], 'SA');
  assert.deepEqual(r.communes, [{ lettre: 'S', rangMetier: 1, rangPersonne: 1 }]);
  assert.deepEqual(r.absentes, ['A']);
  assert.equal(r.memes, false);
  const m = S.synComparerLettres('SEC', 'ES');
  assert.equal(m.memes, true);
  assert.equal(m.communes.length, 2);
  assert.equal(S.synComparerLettres([], '').memes, false);
});

test('écart de niveau : positif quand le métier demande plus, aucun quand l\'un des deux est inconnu', () => {
  assert.deepEqual(S.synEcartNiveau(3, 5), { connu: true, ecart: 2, taille: 'grand' });
  assert.deepEqual(S.synEcartNiveau(4, 5), { connu: true, ecart: 1, taille: 'un' });
  assert.deepEqual(S.synEcartNiveau(5, 4), { connu: true, ecart: -1, taille: 'aucun' });
  assert.equal(S.synEcartNiveau(null, 5).connu, false);
  assert.equal(S.synEcartNiveau(3, undefined).connu, false);
  assert.equal(S.synEcartNiveau(1, 5).connu, false);
  assert.equal(S.synEcartNiveau('4', 5).connu, false);
});

test('plafonds : liste et texte libre coupés, jamais au milieu d\'un mot si possible', () => {
  assert.deepEqual(S.synPlafonner([1, 2, 3, 4], 2), [1, 2]);
  assert.deepEqual(S.synPlafonner('pas une liste', 2), []);
  assert.deepEqual(S.synPlafonner([1, 2], -3), []);
  const long = 'mot '.repeat(300);
  const coupe = S.synPlafonnerTexte(long, 50);
  assert.ok(coupe.length <= 50);
  assert.ok(!/mo$/.test(coupe) && /mot$/.test(coupe));
  assert.equal(S.synPlafonnerTexte('  court   texte  ', 50), 'court texte');
  assert.equal(S.synPlafonnerTexte(null, 50), '');
});

test('ce qui diffère : les choix que la fiche du métier ne retrouve pas, rien d\'autre', () => {
  const choix = { actions: ['a1', 'a2'], activites: ['p1'], environnement: ['e1', 'e2'] };
  const fiche = { actions: ['a1'], activites: ['p1', 'p9'], environnement: ['e2'] };
  assert.deepEqual(S.synChoixNonRetrouves(choix, fiche), [{ cle: 'actions', id: 'a2' }, { cle: 'environnement', id: 'e1' }]);
  assert.deepEqual(S.synChoixNonRetrouves(choix, { actions: ['a1', 'a2'], activites: ['p1'], environnement: ['e1', 'e2'] }), []);
});

test('ce qui diffère : entrée absente ou mal formée', () => {
  assert.deepEqual(S.synChoixNonRetrouves(null, {}), []);
  assert.deepEqual(S.synChoixNonRetrouves({ actions: ['a1'] }, null), []);
  assert.deepEqual(S.synChoixNonRetrouves({ actions: 'x', activites: [null] }, {}), [{ cle: 'activites', id: null }]);
  assert.deepEqual(S.synChoixNonRetrouves({ actions: ['a1'] }, {}), [{ cle: 'actions', id: 'a1' }]);
});

const CONNUS = { 'boulanger': { nom: 'Boulanger', rome: 'D1102' }, 'aide-soignant': { nom: 'Aide-soignant', rome: 'J1501' } };
const resoudre = (nom) => CONNUS[S.synNormaliser(nom).replace(/ /g, '-')] || CONNUS[S.synNormaliser(nom)] || null;

test('disquette : rien n\'est envoyé tant que la personne n\'a pas gardé sa synthèse', () => {
  assert.equal(S.synPourFichier(null), null);
  assert.equal(S.synPourFichier({ retenu1: { nom: 'Boulanger', rome: 'D1102' }, gardee: false }), null);
});

test('disquette : seulement métiers retenus, niveau, suivi et compléments ; jamais le texte libre ni la lecture', () => {
  const f = S.synPourFichier({
    retenu1: { nom: 'Boulanger', rome: 'D1102' }, retenu2: null, retenu3: { nom: 'Aide-soignant', rome: 'J15<01>' },
    niveau: 4, suivi: ['a', 'b', 3], complements: ['c'], libre: 'texte privé', lecture: { x: 1 }, gardee: true
  });
  assert.equal(f.version, S.SYN_VERSION_FICHIER);
  assert.deepEqual(f.retenu1, { nom: 'Boulanger', rome: 'D1102' });
  assert.equal(f.retenu2, null);
  assert.equal(f.retenu3.rome, 'J1501');
  assert.equal(f.niveau, 4);
  assert.deepEqual(f.suivi, ['a', 'b']);
  assert.deepEqual(f.complements, ['c']);
  assert.equal(f.libre, undefined);
  assert.equal(f.lecture, undefined);
  assert.equal(S.synPourFichier({ gardee: true, niveau: 12 }).niveau, null);
});

test('disquette : relecture, un métier inconnu est ignoré et le nom prend l\'écriture actuelle de la base', () => {
  const s = S.synNormaliserDepuisFichier({ retenu1: { nom: 'boulanger' }, retenu2: { nom: 'Métier inventé' }, retenu3: 'x', niveau: 5 }, resoudre);
  assert.deepEqual(s.retenu1, { nom: 'Boulanger', rome: 'D1102' });
  assert.equal(s.retenu2, null);
  assert.equal(s.retenu3, null);
  assert.equal(s.niveau, 5);
  assert.equal(s.gardee, true);
  assert.equal(s.libre, '');
  assert.equal(s.lecture, null);
});

test('disquette : niveau hors bornes, non entier ou texte rejeté ; doublons et identifiants trop longs retirés', () => {
  [1, 9, 4.5, '4', null].forEach((n) => {
    const s = S.synNormaliserDepuisFichier({ retenu1: { nom: 'Boulanger' }, niveau: n }, resoudre);
    assert.equal(s.niveau, null);
  });
  const s = S.synNormaliserDepuisFichier({ niveau: 3, suivi: ['a', 'a', 'x'.repeat(100), 7, 'b'] }, resoudre);
  assert.deepEqual(s.suivi, ['a', 'b']);
});

test('disquette : un fichier vide, mal formé ou sans rien d\'utilisable donne null', () => {
  [null, undefined, 'x', 3, [], {}, { retenu1: { nom: 'Inconnu' } }, { suivi: 'a' }].forEach((x) => {
    assert.equal(S.synNormaliserDepuisFichier(x, resoudre), null);
  });
});

test('disquette : aller-retour, ce qui part est ce qui revient', () => {
  const depart = { retenu1: { nom: 'Boulanger', rome: 'D1102' }, retenu2: null, retenu3: { nom: 'Aide-soignant', rome: 'J1501' }, niveau: 6, suivi: ['a'], complements: ['b'], libre: 'privé', lecture: null, gardee: true };
  const retour = S.synNormaliserDepuisFichier(JSON.parse(JSON.stringify(S.synPourFichier(depart))), resoudre);
  assert.deepEqual(retour.retenu1, depart.retenu1);
  assert.deepEqual(retour.retenu3, depart.retenu3);
  assert.equal(retour.niveau, 6);
  assert.deepEqual(retour.suivi, ['a']);
  assert.deepEqual(retour.complements, ['b']);
  assert.equal(retour.libre, '');
});

test('liste honnête : seuls comptent les métiers qui ont les deux premières lettres, la liste courte est dite telle', () => {
  const liste = [{ lettres: 'SA' }, { lettres: 'AS' }, { lettres: 'SAE' }, { lettres: 'SE' }, { lettres: 'S' }, { lettres: 'EC' }];
  const h = S.synListeHonnete(liste, ['S', 'A', 'E'], 6);
  assert.equal(h.nb, 2, 'SA et SAE, jamais AS (autre ordre)');
  assert.equal(h.courte, true);
  assert.equal(h.aucun, false);
  assert.deepEqual(h.lettres, ['S', 'A']);
  assert.equal(S.synListeHonnete(liste, ['S', 'A'], 2).courte, false);
  assert.equal(S.synListeHonnete(liste, 'RI', 6).aucun, true);
  assert.equal(S.synListeHonnete(liste, ['S'], 1).nb, 4, 'un code à une lettre : les métiers qui commencent par cette lettre');
});

test('liste honnête : entrées absentes ou mal formées', () => {
  [null, undefined, 'x', [null]].forEach((l) => assert.equal(S.synListeHonnete(l, ['S', 'A'], 6).nb, 0));
  assert.equal(S.synListeHonnete([{ lettres: 'SA' }], null, 6).aucun, true);
  assert.equal(S.synListeHonnete([{ lettres: 'SA' }, null, {}], ['S', 'A']).nb, 1);
});

test('liste honnête : sur la vraie base, les codes rares donnent une liste courte, les codes courants une liste longue', () => {
  const rare = L.cmlMetiersPourLettres(['S', 'A']);
  const hr = S.synListeHonnete(rare, ['S', 'A'], 6);
  assert.equal(hr.nb, 4, 'SA : 4 métiers sur la base actuelle');
  assert.equal(hr.courte, true);
  assert.equal(S.synListeHonnete(L.cmlMetiersPourLettres(['A', 'S']), ['A', 'S'], 6).nb, 5);
  const courant = L.cmlMetiersPourLettres(['S', 'C']);
  assert.equal(S.synListeHonnete(courant, ['S', 'C'], 6).courte, false);
  hr.proches.forEach((x) => assert.ok(x.lettres.indexOf('SA') === 0));
});

const COND = require('../data/conditionsRome.js').CONDITIONS_ROME;
function enLicePour(lettres) {
  const code = lettres.slice(0, 2).join('');
  return L.cmlMetiersPourLettres(lettres)
    .filter((x) => x.lettres.indexOf(code) === 0)
    .map((x) => ({ nom: x.metier.nom, rome: x.metier.rome, lettres: x.lettres, secteur: x.metier.secteur, niveau: x.niveau, tags: COND.parCode[x.metier.rome] || [] }));
}

test('départage : sans aucune réponse, tous les métiers sont à égalité et montrés ensemble, jamais coupés au milieu d\'un groupe', () => {
  const en = enLicePour(['C', 'R', 'S']);
  assert.ok(en.length > 8);
  const l = S.synClasserDepartage(en, ['C', 'R', 'S'], {}, []);
  assert.equal(l.length, en.length);
  l.forEach((x) => { assert.equal(x.pts, 0); assert.deepEqual(x.raisons, []); });
  const g = S.synGroupesEgalite(l);
  assert.equal(g.montres.length, 1, 'un seul groupe : toute la liste est à égalité');
  assert.equal(g.montres[0].tous.length, en.length);
  assert.equal(g.montres[0].items.length, S.SYN_GROUPE_MAX);
});

test('départage : une réponse remonte les métiers qui la retrouvent, avec la raison écrite, sans jamais regarder le niveau d\'études', () => {
  const en = enLicePour(['C', 'R', 'S']);
  const l = S.synClasserDepartage(en, ['C', 'R', 'S'], { lieu: 'ext' }, []);
  const avecRaison = l.filter((x) => x.pts === 1);
  assert.ok(avecRaison.length >= 1 && avecRaison.length < l.length);
  avecRaison.forEach((x) => { assert.ok(x.tags.indexOf('exterieur') !== -1); assert.ok(/extérieur/.test(x.raisons[0])); });
  const idxPremierSans = l.findIndex((x) => x.pts === 0);
  assert.equal(idxPremierSans, avecRaison.length, 'tous ceux qui retrouvent la réponse passent avant les autres');
  // le niveau n'entre jamais dans l'ordre : deux métiers de même nombre de réponses sont classés sans lui (alphabet dans le groupe)
  const sansReponse = l.slice(idxPremierSans);
  for (let i = 1; i < sansReponse.length; i++) { assert.ok(sansReponse[i - 1].nom.localeCompare(sansReponse[i].nom, 'fr') <= 0); }
});

test('départage : les lettres exactes passent toujours avant un métier à une seule lettre, même s\'il retrouve plus de réponses', () => {
  const entrees = [
    { nom: 'Un', lettres: 'S', tags: ['exterieur'], secteur: 'X' },
    { nom: 'Deux', lettres: 'SA', tags: [], secteur: 'Y' }
  ];
  const l = S.synClasserDepartage(entrees, ['S', 'A'], { lieu: 'ext' }, []);
  assert.equal(l[0].nom, 'Deux');
  assert.equal(l[0].exact, true);
});

test('départage : secteurs choisis comptent pour une réponse, réponse inconnue ignorée', () => {
  const entrees = [{ nom: 'A', lettres: 'SA', tags: [], secteur: 'Éducation' }, { nom: 'B', lettres: 'SA', tags: [], secteur: 'Santé' }];
  const l = S.synClasserDepartage(entrees, ['S', 'A'], { lieu: 'inconnue' }, ['Santé']);
  assert.equal(l[0].nom, 'B');
  assert.match(l[0].raisons[0], /Santé/);
  assert.equal(l[1].pts, 0);
});

test('départage : une option sans effet n\'est jamais proposée, une option déjà choisie reste visible', () => {
  const en = [{ tags: ['exterieur'] }, { tags: ['exterieur'] }];
  const q = S.SYN_QUESTIONS_DEPARTAGE.find((x) => x.cle === 'lieu');
  assert.deepEqual(S.synOptionsProposees(q, en, null), [], 'tous retrouvent « extérieur » : sans effet');
  assert.deepEqual(S.synOptionsProposees(q, en, 'ext').map((o) => o.id), ['ext'], 'déjà choisie : reste visible');
  const mix = [{ tags: ['exterieur'] }, { tags: [] }];
  assert.deepEqual(S.synOptionsProposees(q, mix, null).map((o) => o.id), ['ext'], 'sépare les métiers : proposée ; « domicile » ne retrouve aucun métier : non proposée');
  assert.deepEqual(S.synOptionsProposees(q, [], null), []);
  assert.deepEqual(S.synOptionsProposees(null, mix, null), []);
});

test('départage : sur la vraie base (code CR), seules les options qui séparent réellement les métiers sont proposées', () => {
  const en = enLicePour(['C', 'R', 'S']);
  S.SYN_QUESTIONS_DEPARTAGE.forEach((q) => {
    S.synOptionsProposees(q, en, null).forEach((o) => {
      const k = en.filter((e) => o.test(e.tags)).length;
      assert.ok(k >= 1 && k < en.length, q.cle + '/' + o.id + ' doit séparer les métiers');
    });
  });
});

test('départage : groupes entiers, au moins trois métiers montrés, huit au plus par groupe', () => {
  const mk = (n, exact, pts) => Array.from({ length: n }, (_, i) => ({ nom: 'M' + exact + pts + i, exact, pts, raisons: [] }));
  const l = mk(2, true, 1).concat(mk(2, true, 0), mk(10, false, 0));
  const g = S.synGroupesEgalite(l);
  assert.equal(g.montres.length, 2, 'deux groupes de deux : on s\'arrête quand trois métiers au moins sont montrés');
  assert.equal(g.montres.every((x) => x.tous.length === x.items.length), true);
  assert.equal(g.reste, 10);
  const grand = S.synGroupesEgalite(mk(20, true, 0));
  assert.equal(grand.montres[0].items.length, 8);
  assert.equal(grand.reste, 12);
  assert.deepEqual(S.synGroupesEgalite(null), { montres: [], reste: 0 });
});

test('départage : la phrase de la demande ne dit que les réponses données, jamais « peu importe »', () => {
  assert.equal(S.synTexteReponsesDepartage({}, []), '');
  assert.equal(S.synTexteReponsesDepartage({ lieu: 'ext', dep: 'fixe', corps: 'peu' }, ['Santé', 'Éducation']), 'en extérieur ; sans déplacement ; secteurs : Santé, Éducation');
  assert.equal(S.synTexteReponsesDepartage(null, null), '');
});

test('situation : cocher ajoute, recocher retire, identifiant inconnu ignoré, plafond respecté, liste d\'origine intacte', () => {
  const orig = ['former'];
  const a = S.synBasculerDansListe(orig, 'vite', S.SYN_COMPLEMENTS, 10);
  assert.deepEqual(a, ['former', 'vite']);
  assert.deepEqual(orig, ['former']);
  assert.deepEqual(S.synBasculerDansListe(a, 'former', S.SYN_COMPLEMENTS, 10), ['vite']);
  assert.deepEqual(S.synBasculerDansListe(a, 'nimportequoi', S.SYN_COMPLEMENTS, 10), ['former', 'vite']);
  assert.deepEqual(S.synBasculerDansListe(['former', 'former', 3, null], 'vite', S.SYN_COMPLEMENTS, 10), ['former', 'vite']);
  assert.deepEqual(S.synBasculerDansListe(['former', 'vite'], 'permis', S.SYN_COMPLEMENTS, 2), ['former', 'vite'], 'plafond de 2');
  assert.deepEqual(S.synBasculerDansListe(null, 'vite', S.SYN_COMPLEMENTS, 10), ['vite']);
});

test('situation : l\'accompagnement est une réponse unique, la même touchée deux fois l\'efface', () => {
  assert.deepEqual(S.synChoisirUnique([], 'oui', S.SYN_ACCOMPAGNEMENTS), ['oui']);
  assert.deepEqual(S.synChoisirUnique(['oui'], 'non', S.SYN_ACCOMPAGNEMENTS), ['non']);
  assert.deepEqual(S.synChoisirUnique(['oui'], 'oui', S.SYN_ACCOMPAGNEMENTS), []);
  assert.deepEqual(S.synChoisirUnique(['oui'], 'zzz', S.SYN_ACCOMPAGNEMENTS), []);
  assert.deepEqual(S.synChoisirUnique(null, 'jamais', S.SYN_ACCOMPAGNEMENTS), ['jamais']);
});

test('situation : la phrase de la demande ne dit que ce qui est rempli', () => {
  assert.equal(S.synTexteSituation({}), '');
  assert.equal(S.synTexteSituation(null), '');
  assert.equal(S.synTexteSituation({ niveau: 4, suivi: ['non'], complements: ['former', 'vite'] }),
    'niveau d’études : Bac ; pas accompagné pour l’instant ; ce qui compte en ce moment : je peux me former ; je cherche vite un emploi');
  assert.equal(S.synTexteSituation({ niveau: 99, suivi: ['x'], complements: ['y'] }), '');
});

test('situation : tous les niveaux proposés sont des niveaux du ROME acceptés par la disquette', () => {
  S.SYN_NIVEAUX.forEach(([n]) => assert.ok(n >= 2 && n <= 8));
  const f = S.synPourFichier({ gardee: true, niveau: 4, suivi: ['oui'], complements: ['former'] });
  assert.equal(f.niveau, 4);
  assert.deepEqual(f.suivi, ['oui']);
});

test('chez moi : une piste n\'apparaît que si sa fiche est rattachée à un métier de l\'enquête du département', () => {
  const table = { 'Aides-soignants': ['aide_soignant'], 'Agriculteurs': ['rome_A1416', 'ouvrier_agricole'] };
  const idDe = (nom) => ({ 'Aide-soignant': 'aide_soignant', 'Boulanger': 'boulanger', 'Ouvrier agricole': 'ouvrier_agricole' })[nom] || null;
  const enquete = [{ nom: 'aides-soignants', met: 407, s: 84 }, { nom: 'Agriculteurs', met: 692, s: 610 }, { nom: 'Cuisiniers', met: 100, s: 0 }];
  const r = S.synPistesDansEnquete(['Aide-soignant', 'Boulanger', 'Ouvrier agricole', 'aide soignant', 'Inconnu'], idDe, table, enquete);
  assert.equal(r.length, 2, 'boulanger : pas dans l\'enquête ; inconnu : sans fiche ; doublon écarté');
  assert.equal(r[0].piste, 'Aide-soignant');
  assert.deepEqual(r[0].enquete, { nom: 'Aides-soignants', met: 407, s: 84, saisonnier: false });
  assert.equal(r[1].enquete.saisonnier, true);
});

test('chez moi : enquête absente, vide ou mal formée, aucune piste, aucune invention', () => {
  const table = { 'Aides-soignants': ['aide_soignant'] };
  const idDe = () => 'aide_soignant';
  assert.deepEqual(S.synPistesDansEnquete(['X'], idDe, table, []), []);
  assert.deepEqual(S.synPistesDansEnquete(['X'], idDe, table, null), []);
  assert.deepEqual(S.synPistesDansEnquete(['X'], idDe, table, [{ nom: 'Aides-soignants', met: 0 }]), []);
  assert.deepEqual(S.synPistesDansEnquete(null, idDe, table, []), []);
  assert.deepEqual(S.synPistesDansEnquete(['X'], null, table, [{ nom: 'Aides-soignants', met: 5 }]), []);
  assert.deepEqual(S.synPistesDansEnquete(['X'], idDe, null, [{ nom: 'Aides-soignants', met: 5 }]), []);
});

test('lettres : mêmes lettres, en partie, différentes, ou métier sans lettres', () => {
  assert.equal(S.synRecouvrementLettres(['S', 'A'], 'SA'), 'memes');
  assert.equal(S.synRecouvrementLettres(['S', 'E', 'C'], 'SA'), 'partie');
  assert.equal(S.synRecouvrementLettres(['S', 'E'], 'RI'), 'differentes');
  assert.equal(S.synRecouvrementLettres(['S', 'E'], ''), 'inconnu');
});

/* ---------- A4b : filtre « formation que je suis prêt ou prête à faire » ---------- */
test('le filtre de formation : rien n’est caché par défaut, jamais un classement', () => {
  const F = S.synFormationCachee;
  [2, 3, 4, 5, 6, 7, 8, null, undefined].forEach(n => assert.strictEqual(F(n, 'tous'), false));
  assert.strictEqual(F(3, 'court'), false);
  assert.strictEqual(F(4, 'court'), true);
  assert.strictEqual(F(7, 'court'), true);
  assert.strictEqual(F(5, 'moyen'), false);
  assert.strictEqual(F(6, 'moyen'), true);
  assert.strictEqual(F(null, 'court'), false, 'niveau non précisé : toujours visible');
  assert.strictEqual(F(null, 'moyen'), false);
  assert.strictEqual(F(7, 'valeur inconnue'), false, 'valeur inconnue = tous');
});

test('appliquer le filtre : l’ordre est gardé, le métier retenu reste visible, les cachés sont comptés', () => {
  const liste = [{ nom: 'A', niveau: 7 }, { nom: 'B', niveau: 3 }, { nom: 'C', niveau: 6 }, { nom: 'D', niveau: null }, { nom: 'E', niveau: 5 }, { nom: 'F', niveau: 2 }];
  const r = S.synAppliquerFormation(liste, 'moyen', 3, '');
  assert.deepStrictEqual(r.visibles.map(x => x.nom), ['B', 'D', 'E']);
  assert.deepStrictEqual(r.caches.map(x => x.nom), ['A', 'C']);
  const retenu = S.synAppliquerFormation(liste, 'court', 3, 'a');
  assert.deepStrictEqual(retenu.visibles.map(x => x.nom), ['A', 'B', 'D']);
  assert.strictEqual(S.synAppliquerFormation(liste, 'tous', 4, '').caches.length, 0);
  assert.deepStrictEqual(S.synAppliquerFormation(null, 'court', 3, '').visibles, []);
});

test('la formation choisie est dite à l’assistant, seulement si elle est choisie', () => {
  assert.ok(!S.synTexteSituation({ niveau: 3 }).includes('formation'));
  assert.ok(S.synTexteSituation({ niveau: 3, formation: 'court' }).includes('formation qu’elle se dit prête à faire : sans diplôme, cap ou bep, au plus'));
  assert.ok(!S.synTexteSituation({ formation: 'tous' }).includes('formation'));
});
