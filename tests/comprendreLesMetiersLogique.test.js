// Module « Explorer les métiers », phase 2 (17/11/2026) : calcul du questionnaire (les neuf tests de docs/REGLE_DE_CALCUL_RIASEC_2026-11-16.md),
// textes qui adoucissent, ordre mélangé, résultat gardé, métiers qui partagent les lettres, niveau d'accès, réglages de l'entrée 2.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const L = require('../modules/comprendre-les-metiers/logique.js');
const M = require('../data/metiers.js');
const D = require('../data/questionnaireRiasec.js');

const LET = ['R', 'I', 'A', 'S', 'E', 'C'];
const PARTIES = ['p1', 'p2', 'p3', 'p4'];
const proche = (a, b, tol) => Math.abs(a - b) <= (tol === undefined ? 1e-6 : tol);

// Fabrique des réponses : toutes les réponses d'une partie à la même valeur, ou choisies par une fonction (énoncé -> réponse).
function repondre(valeurs, partie4Passee) {
  const r = { partie4Passee: !!partie4Passee };
  PARTIES.forEach((p) => {
    r[p] = {};
    L.cmqEnonces(p).forEach((e) => { const v = typeof valeurs[p] === 'function' ? valeurs[p](e) : valeurs[p]; if (v) { r[p][e.id] = v; } });
  });
  return r;
}
const TOUT_OUI = { p1: 'oui', p2: 'oui', p3: 'a_laise', p4: 'ressemble' };
const TOUT_NON = { p1: 'non', p2: 'non', p3: 'pas_encore', p4: 'pas_vraiment' };
// Pourcentages par partie pour les tests au cœur du calcul.
const pctUniforme = (v) => { const o = {}; PARTIES.forEach((p) => { o[p] = {}; LET.forEach((l) => { o[p][l] = v; }); }); return o; };
function pctDepuisResultat(resultats) {   // chaque lettre a la même valeur dans les quatre parties
  const o = {}; PARTIES.forEach((p) => { o[p] = Object.assign({}, resultats); }); return o;
}

test('maximums : 15 en partie 1, 20 en parties 3 et 4, somme des parts des 90 lignes en partie 2', () => {
  const max = L.cmqMaximums();
  LET.forEach((l) => {
    assert.equal(max.p1[l], 15);
    assert.equal(max.p3[l], 20);
    assert.equal(max.p4[l], 20);
    const somme = D.RIASEC_PARTIE_2.reduce((a, ligne) => a + ligne.profil[l], 0);
    assert.ok(proche(max.p2[l], somme), l + ' : maximum de la partie 2');
  });
});

test('test 1 : tout « oui » donne 100 % à chaque lettre, dans chaque partie', () => {
  const c = L.cmqCalculer(repondre(TOUT_OUI));
  LET.forEach((l) => { assert.equal(c.pourcentages[l], 100, l); PARTIES.forEach((p) => assert.ok(proche(c.parties[p][l], 100), p + l)); });
  assert.equal(c.etat, 'reparties');   // toutes égales : aucune lettre ne ressort
  assert.equal(c.code.length, 3);
});

test('test 2 : tout « non » ou « je ne sais pas » donne 0 % partout et « peu de réponses », sans code', () => {
  [TOUT_NON, { p1: 'nsp', p2: 'nsp', p3: 'pas_encore', p4: 'pas_vraiment' }, { p1: null, p2: null, p3: null, p4: null }].forEach((valeurs) => {
    const c = L.cmqCalculer(repondre(valeurs));
    LET.forEach((l) => assert.equal(c.pourcentages[l], 0));
    assert.equal(c.etat, 'peu_reponses');
    assert.equal(c.code, null);
    assert.deepEqual(c.lettresPourMetiers, []);
    assert.ok(c.messages.includes(L.CMQ_TEXTES.peuReponses));
    assert.equal(c.axes.personnes.phrase, null);
  });
});

test('test 3 : la lettre rare n\'est pas pénalisée (oui à tout ce qui porte la lettre A en partie 2 = 100 % en A, comme R pour la lettre R)', () => {
  const pour = (lettre) => L.cmqCalculer(repondre({ p1: 'non', p2: (e) => (e.profil[lettre] > 0 ? 'oui' : 'non'), p3: 'pas_encore', p4: 'pas_vraiment' }));
  assert.ok(proche(pour('A').parties.p2.A, 100), 'A en partie 2');
  assert.ok(proche(pour('R').parties.p2.R, 100), 'R en partie 2');
  assert.ok(pour('A').parties.p2.R < 100 && pour('A').parties.p2.R > 0, 'les autres lettres ne sont pas à 100');
  // Une seule ligne très artistique rapporte beaucoup plus à A qu'une ligne réaliste ne rapporte à R (les maximums sont par lettre).
  const maxA = L.cmqMaximums().p2.A, maxR = L.cmqMaximums().p2.R;
  assert.ok(maxA < maxR / 3, 'la lettre A a bien moins de « lignes » que R dans le répertoire');
});

test('test 4 : symétrie, deux lettres permutées donnent deux résultats permutés', () => {
  // Parties 1, 3 et 4 : mêmes maximums pour toutes les lettres, donc on échange les réponses de R et de I énoncé par énoncé.
  const motif = ['oui', 'non', 'oui', 'oui', 'nsp', 'oui', 'non', 'oui', 'oui', 'non', 'oui', 'nsp', 'oui', 'oui', 'non'];
  const a = repondre({ p1: (e) => (e.lettre === 'R' ? motif[Number(e.id.slice(1)) - 1] : 'non'), p2: 'non', p3: (e) => (e.lettre === 'R' ? 'a_laise' : 'pas_encore'), p4: (e) => (e.lettre === 'R' ? 'un_peu' : 'pas_vraiment') });
  const b = repondre({ p1: (e) => (e.lettre === 'I' ? motif[Number(e.id.slice(1)) - 1] : 'non'), p2: 'non', p3: (e) => (e.lettre === 'I' ? 'a_laise' : 'pas_encore'), p4: (e) => (e.lettre === 'I' ? 'un_peu' : 'pas_vraiment') });
  const ca = L.cmqCalculer(a), cb = L.cmqCalculer(b);
  assert.ok(proche(ca.valeurs.R, cb.valeurs.I), 'R du premier = I du second');
  assert.ok(proche(ca.valeurs.I, cb.valeurs.R), 'I du premier = R du second');
  assert.ok(ca.valeurs.R > 0 && ca.valeurs.I === 0);
});

test('test 5 : la moitié de tout donne 50 % à chaque lettre (exactement au cœur du calcul, à 6 points près avec des réponses réelles) et le texte « préférences réparties », avec un code quand même', () => {
  // 50 % exact : parties 3 et 4 « en progrès » / « un peu » (1 point sur 2) ; partie 1 : 15 énoncés par lettre, 7 ou 8 « oui » ;
  // partie 2 : les lignes dont le numéro est pair, partie 1 alternée de façon à ne favoriser aucune lettre.
  const r = repondre({
    p1: (e) => (Number(e.id.slice(1)) % 2 === 0 ? 'oui' : 'non'),
    p2: (e) => (Number(e.id.slice(1)) % 2 === 0 ? 'oui' : 'non'),
    p3: 'en_progres', p4: 'un_peu'
  });
  const c = L.cmqCalculer(r);
  LET.forEach((l) => assert.ok(Math.abs(c.valeurs[l] - 50) < 6, l + ' = ' + c.valeurs[l]));   // 7 sur 15 donne 46,7 %, partie 2 dépend des lignes tirées
  assert.equal(c.etat, 'reparties');
  assert.ok(c.code && c.code.length === 3);
  assert.ok(c.messages.includes(L.CMQ_TEXTES.reparties));
  // Exemple 4 de la règle : exactement 50 % partout.
  const exact = L.cmqResultatDepuisPourcentages(pctUniforme(50), false);
  LET.forEach((l) => assert.equal(exact.pourcentages[l], 50));
  assert.equal(exact.etat, 'reparties');
  assert.ok(exact.code && exact.code.length === 3, 'le code est affiché avec le texte');
});

test('test 6 : deux lettres à moins de 3 points à la frontière du code, le texte d\'ex aequo apparaît (exemple 3 de la règle)', () => {
  const c = L.cmqResultatDepuisPourcentages(pctDepuisResultat({ S: 54, I: 54, C: 52, E: 51, R: 51, A: 47 }), false);
  assert.equal(c.etat, 'reparties');         // 7 points d'écart
  assert.equal(c.procheFrontiere, true);
  assert.ok(c.messages.includes(L.CMQ_TEXTES.frontiere));
  assert.deepEqual(c.code, ['I', 'S', 'C']);  // S et I à égalité exacte, mêmes parties 1 et 4 : l'ordre R, I, A, S, E, C met I devant S
  assert.ok(c.lettresPourMetiers.includes('E') && c.lettresPourMetiers.includes('R'), 'les lettres proches de la troisième servent aux métiers');
  // Pas de texte si la troisième lettre est nettement détachée.
  const net = L.cmqResultatDepuisPourcentages(pctDepuisResultat({ S: 80, I: 70, C: 60, E: 40, R: 30, A: 10 }), false);
  assert.equal(net.procheFrontiere, false);
  assert.equal(net.etat, 'normal');
  assert.deepEqual(net.lettresPourMetiers, ['S', 'I', 'C']);
});

test('test 7 : partie 4 passée, moyenne sur trois parties et texte qui le précise (exemple 5 de la règle)', () => {
  const pct = {
    p1: { E: 80, C: 70, R: 60, S: 30, I: 30, A: 20 },
    p2: { E: 70, C: 76, R: 55, S: 32, I: 28, A: 18 },
    p3: { E: 72, C: 73, R: 62, S: 34, I: 29, A: 19 },
    p4: { E: 0, C: 0, R: 0, S: 0, I: 0, A: 0 }
  };
  const c = L.cmqResultatDepuisPourcentages(pct, true);
  assert.deepEqual(c.code, ['E', 'C', 'R']);
  assert.ok(proche(c.valeurs.E, (80 + 70 + 72) / 3));   // moyenne sur trois parties, jamais divisée par quatre
  assert.equal(c.partie4Passee, true);
  assert.ok(c.messages.includes(L.CMQ_TEXTES.sansPartie4));
  // Avec les vraies réponses : une partie 4 passée n'apporte aucun point, même si des réponses y traînent.
  const r = repondre(TOUT_OUI, true);
  assert.deepEqual(L.cmqPoints(r).p4, { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 });
  assert.ok(proche(L.cmqCalculer(r).valeurs.R, 100));
});

test('test 8 : les axes suivent les lettres (S et E positifs pour les personnes, R et I pour les objets) ; une phrase seulement au-delà de 10 points (exemple 1)', () => {
  const ex1 = L.cmqResultatDepuisPourcentages(pctDepuisResultat({ S: 83, A: 79, I: 38, E: 32, C: 19, R: 18 }), false);
  assert.deepEqual(ex1.code, ['S', 'A', 'I']);
  assert.ok(proche(ex1.axes.personnes.ecart, 29.5, 0.01), 'écart personnes ' + ex1.axes.personnes.ecart);
  assert.ok(proche(ex1.axes.idees.ecart, -33, 0.01), 'écart idées ' + ex1.axes.idees.ecart);
  assert.equal(ex1.axes.personnes.phrase, L.CMQ_TEXTES.personnes);
  assert.equal(ex1.axes.idees.phrase, L.CMQ_TEXTES.idees);
  assert.deepEqual(ex1.niveaux, { S: 'tres_marquee', A: 'tres_marquee', I: 'presente', E: 'presente', C: 'peu_marquee', R: 'peu_marquee' });
  const objets = L.cmqResultatDepuisPourcentages(pctDepuisResultat({ R: 80, I: 60, S: 20, E: 20, A: 10, C: 40 }), false);
  assert.equal(objets.axes.personnes.phrase, L.CMQ_TEXTES.objets);
  const donnees = L.cmqResultatDepuisPourcentages(pctDepuisResultat({ C: 90, E: 60, A: 10, I: 20, R: 30, S: 40 }), false);
  assert.equal(donnees.axes.idees.phrase, L.CMQ_TEXTES.donnees);
  const equilibre = L.cmqResultatDepuisPourcentages(pctDepuisResultat({ S: 60, E: 55, R: 50, I: 52, A: 50, C: 53 }), false);
  assert.equal(equilibre.axes.personnes.phrase, null);
  assert.equal(equilibre.axes.idees.phrase, null);
  // Aucun chiffre dans les phrases d'axe.
  [L.CMQ_TEXTES.personnes, L.CMQ_TEXTES.objets, L.CMQ_TEXTES.donnees, L.CMQ_TEXTES.idees].forEach((t) => assert.ok(!/\d/.test(t)));
});

test('test 9 : les points de la partie 2 s\'additionnent selon les profils des 90 lignes', () => {
  // Une seule ligne « oui » : les points de chaque lettre sont exactement le profil de la ligne.
  const ligne = D.RIASEC_PARTIE_2[55];   // famille 56 (soins infirmiers) : plusieurs lettres
  const r = repondre({ p1: 'non', p2: (e) => (e.id === ligne.id ? 'oui' : 'non'), p3: 'pas_encore', p4: 'pas_vraiment' });
  const pts = L.cmqPoints(r).p2;
  LET.forEach((l) => assert.ok(proche(pts[l], ligne.profil[l]), l));
  // « Ça ne me plairait pas » et « Je ne sais pas » ne retirent jamais rien.
  const r2 = repondre({ p1: 'non', p2: (e) => (e.id === ligne.id ? 'oui' : 'non'), p3: 'pas_encore', p4: 'pas_vraiment' });
  const r3 = repondre({ p1: 'nsp', p2: (e) => (e.id === ligne.id ? 'oui' : 'nsp'), p3: 'pas_encore', p4: 'pas_vraiment' });
  assert.deepEqual(L.cmqPoints(r2), L.cmqPoints(r3));
});

test('seuils : « peu de réponses » sous 25 %, « répartis » sous 15 points d\'écart, bandes 75 / 50 / 25', () => {
  const peu = L.cmqResultatDepuisPourcentages(pctDepuisResultat({ R: 24, I: 10, A: 5, S: 0, E: 3, C: 8 }), false);
  assert.equal(peu.etat, 'peu_reponses'); assert.equal(peu.code, null);
  const limite = L.cmqResultatDepuisPourcentages(pctDepuisResultat({ R: 25, I: 10, A: 5, S: 0, E: 3, C: 8 }), false);
  assert.equal(limite.etat, 'normal'); assert.equal(limite.code[0], 'R');
  const reparti = L.cmqResultatDepuisPourcentages(pctDepuisResultat({ R: 60, I: 50, A: 46, S: 47, E: 48, C: 49 }), false);
  assert.equal(reparti.etat, 'reparties');   // 60 - 46 = 14
  const net = L.cmqResultatDepuisPourcentages(pctDepuisResultat({ R: 61, I: 50, A: 46, S: 47, E: 48, C: 49 }), false);
  assert.equal(net.etat, 'normal');          // 61 - 46 = 15
  const bandes = L.cmqResultatDepuisPourcentages(pctDepuisResultat({ R: 75, I: 74, A: 50, S: 49, E: 25, C: 24 }), false);
  assert.deepEqual(bandes.niveaux, { R: 'tres_marquee', I: 'marquee', A: 'marquee', S: 'presente', E: 'presente', C: 'peu_marquee' });
  assert.equal(L.cmqLibelleNiveau('tres_marquee'), 'Une préférence très marquée');
  Object.values(L.CMQ_TEXTES.niveaux).forEach((t) => assert.ok(!/note|bon|mauvais/i.test(t)));
});

test('égalité exacte : la lettre la plus haute en partie 1 passe devant, puis la partie 4, puis l\'ordre R I A S E C', () => {
  const pct = pctDepuisResultat({ R: 50, I: 50, A: 50, S: 50, E: 50, C: 50 });
  assert.deepEqual(L.cmqResultatDepuisPourcentages(pct, false).classement, ['R', 'I', 'A', 'S', 'E', 'C']);
  pct.p1.S = 60; pct.p2.S = 40;           // S égale les autres au total mais plus haute en partie 1
  assert.equal(L.cmqResultatDepuisPourcentages(pct, false).classement[0], 'S');
  const pct2 = pctDepuisResultat({ R: 50, I: 50, A: 50, S: 50, E: 50, C: 50 });
  pct2.p4.E = 60; pct2.p3.E = 40;         // E égale les autres, plus haute en partie 4 (partie 1 identique)
  assert.equal(L.cmqResultatDepuisPourcentages(pct2, false).classement[0], 'E');
});

test('ordre mélangé : toutes les questions une fois, même graine = même ordre, graine différente = autre ordre', () => {
  PARTIES.forEach((p) => {
    const ids = L.cmqEnonces(p).map((e) => e.id).sort();
    const a = L.cmqOrdreMelange(p, 12345), b = L.cmqOrdreMelange(p, 12345), c = L.cmqOrdreMelange(p, 54321);
    assert.deepEqual(a.slice().sort(), ids, p + ' : toutes les questions, une fois');
    assert.deepEqual(a, b);
    assert.notDeepEqual(a, c);
    assert.notDeepEqual(a, L.cmqEnonces(p).map((e) => e.id), p + ' : l\'ordre des documents n\'est pas gardé');
  });
  // Les lettres sont bien brassées : dans les 15 premières questions de la partie 1, au moins quatre lettres différentes.
  const premiers = L.cmqOrdreMelange('p1', 777).slice(0, 15).map((id) => id[0]);
  assert.ok(new Set(premiers).size >= 4);
});

test('avancement : nombre de réponses et partie complète', () => {
  const r = repondre({ p1: (e) => (Number(e.id.slice(1)) <= 5 ? 'oui' : null), p2: 'non', p3: null, p4: null });
  assert.equal(L.cmqNombreReponses(r, 'p1'), 30);
  assert.equal(L.cmqPartieComplete(r, 'p1'), false);
  assert.equal(L.cmqPartieComplete(r, 'p2'), true);
  assert.equal(L.cmqNombreReponses(r, 'p3'), 0);
});

test('résultat gardé dans la disquette : le résultat seulement, jamais les réponses, et relu avec méfiance', () => {
  const c = L.cmqCalculer(repondre({ p1: (e) => (e.lettre === 'S' || e.lettre === 'A' ? 'oui' : 'non'), p2: 'non', p3: (e) => (e.lettre === 'S' ? 'a_laise' : 'en_progres'), p4: 'un_peu' }));
  const garde = L.cmqResultatAGarder(c, '17/11/2026');
  assert.deepEqual(Object.keys(garde).sort(), ['code', 'date', 'etat', 'lettresPourMetiers', 'nbLignes', 'nbReponses', 'partie4Passee', 'parties', 'pourcentages', 'version']);
  assert.ok(!JSON.stringify(garde).includes('R1'), 'aucune réponse');
  assert.deepEqual(L.cmqNormaliserResultatGarde(JSON.parse(JSON.stringify(garde))), garde);
  // Recalcul identique depuis la disquette : même code, mêmes niveaux, mêmes axes.
  const refait = L.cmqCalculDepuisGarde(L.cmqNormaliserResultatGarde(JSON.parse(JSON.stringify(garde))));
  assert.deepEqual(refait.code, c.code); assert.deepEqual(refait.pourcentages, c.pourcentages); assert.deepEqual(refait.niveaux, c.niveaux); assert.equal(refait.etat, c.etat);
  assert.deepEqual(refait.axes, c.axes); assert.deepEqual(refait.messages, c.messages); assert.deepEqual(refait.lettresPourMetiers, c.lettresPourMetiers);
  assert.equal(L.cmqCalculDepuisGarde(L.cmqNormaliserResultatGarde({ pourcentages: { R: 1, I: 1, A: 1, S: 1, E: 1, C: 1 } })), null, 'sans les pourcentages par partie : pas de recalcul');
  assert.equal(L.cmqNormaliserResultatGarde({ pourcentages: { R: 1, I: 1, A: 1, S: 1, E: 1, C: 1 }, parties: { p1: { R: 'x' } } }).parties, null);
  assert.equal(L.cmqNormaliserResultatGarde(null), null);
  assert.equal(L.cmqNormaliserResultatGarde({ pourcentages: { R: 'x' } }), null);
  const sale = L.cmqNormaliserResultatGarde({ date: 'x'.repeat(100), etat: 'autre', code: ['S', 'Z', 'A'], pourcentages: { R: 150, I: -5, A: 40.4, S: 70, E: 0, C: 1 } });
  assert.equal(sale.code, null); assert.equal(sale.etat, 'normal'); assert.equal(sale.pourcentages.R, 100); assert.equal(sale.pourcentages.I, 0); assert.ok(sale.date.length <= 40);
  const peu = L.cmqNormaliserResultatGarde({ etat: 'peu_reponses', code: ['S', 'A', 'I'], pourcentages: { R: 1, I: 1, A: 1, S: 1, E: 1, C: 1 } });
  assert.equal(peu.code, null);
});

test('aucune réponse n\'est envoyée au suivi d\'usage : la logique ne l\'appelle jamais', () => {
  const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'modules', 'comprendre-les-metiers', 'logique.js'), 'utf8');
  assert.ok(!/trackEvenement|umami|fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage/.test(src), 'la logique ne touche ni au réseau ni au stockage');
});

/* ---------- métiers qui partagent les lettres ---------- */

test('indice des lettres : mêmes lettres dans le même ordre = 1, une seule lettre commune = moins, aucune = 0', () => {
  assert.equal(L.cmlIndiceLettres(['S', 'A', 'I'], 'SA'), 1);
  assert.equal(L.cmlIndiceLettres(['S', 'A', 'I'], 'S'), 1);
  assert.ok(L.cmlIndiceLettres(['S', 'A', 'I'], 'AS') < 1 && L.cmlIndiceLettres(['S', 'A', 'I'], 'AS') > L.cmlIndiceLettres(['S', 'A', 'I'], 'SR'));
  assert.ok(L.cmlIndiceLettres(['S', 'A', 'I'], 'SR') > 0);
  assert.equal(L.cmlIndiceLettres(['S', 'A', 'I'], 'RC'), 0);
  assert.ok(L.cmlIndiceLettres(['S', 'A', 'I'], 'SA') > L.cmlIndiceLettres(['S', 'A', 'I'], 'SI'));
  assert.ok(L.cmlIndiceLettres(['S', 'A', 'I', 'E'], 'ES') > 0, 'une quatrième lettre proche sert aussi');
});

test('métiers pour un code : seuls les métiers qui portent au moins une lettre, les plus proches d\'abord, sans doublon de nom', () => {
  const liste = L.cmlMetiersPourLettres(['S', 'A', 'I']);
  assert.ok(liste.length > 100);
  liste.forEach((e) => assert.ok(e.indice > 0 && e.indice <= 1 && e.lettres.split('').some((l) => 'SAI'.includes(l)), e.metier.nom));
  for (let i = 1; i < liste.length; i++) { assert.ok(liste[i - 1].indice >= liste[i].indice - 1e-9, 'ordre décroissant'); }
  assert.equal(new Set(liste.map((e) => M.normaliserTexte(e.metier.nom))).size, liste.length, 'un métier une seule fois');
  assert.equal(liste[0].indice, 1);
  assert.ok(liste[0].memesLettres);
  assert.deepEqual(L.cmlMetiersPourLettres([]), []);
  const sansLettre = L.cmlMetiersPourLettres(['R']).filter((e) => !e.lettres.includes('R'));
  assert.equal(sansLettre.length, 0);
  // Jamais de vocabulaire de jugement dans les textes du module.
  const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'modules', 'comprendre-les-metiers', 'logique.js'), 'utf8');
  assert.ok(!/(adapt|meilleur|fait pour vous)/i.test(Object.values(L.CMQ_TEXTES).filter((t) => typeof t === 'string').join(' ')), src.length > 0 ? 'textes sans jugement' : '');
});

test('niveau d\'accès : libellé, trois groupes et un quatrième pour le niveau non précisé ; jamais un filtre, tout reste visible', () => {
  assert.equal(L.cmlGroupeNiveau(2), 'court'); assert.equal(L.cmlGroupeNiveau(3), 'court');
  assert.equal(L.cmlGroupeNiveau(4), 'moyen'); assert.equal(L.cmlGroupeNiveau(5), 'moyen');
  assert.equal(L.cmlGroupeNiveau(6), 'long'); assert.equal(L.cmlGroupeNiveau(8), 'long');
  assert.equal(L.cmlGroupeNiveau(null), 'non_precise');
  assert.equal(L.cmlLibelleNiveauAcces(5), 'Bac + 2');
  assert.equal(L.cmlLibelleNiveauAcces(null), 'Niveau d’accès non précisé');
  const liste = L.cmlMetiersPourLettres(['S', 'A', 'I']).slice(0, 300).map((e) => e.metier);
  const groupes = L.cmlGrouperParNiveau(liste);
  assert.equal(groupes.reduce((t, g) => t + g.metiers.length, 0), liste.length, 'aucun métier perdu');
  groupes.forEach((g) => g.metiers.forEach((m) => assert.equal(L.cmlGroupeNiveau(L.cmlNiveauDeMetier(m)), g.cle)));
  assert.deepEqual(groupes.map((g) => g.cle), L.CML_GROUPES_NIVEAU.map((g) => g.cle).filter((c) => groupes.some((g) => g.cle === c)), 'ordre des groupes constant');
  // L'ordre d'arrivée est gardé dans chaque groupe.
  groupes.forEach((g) => { const positions = g.metiers.map((m) => liste.indexOf(m)); assert.deepEqual(positions, positions.slice().sort((a, b) => a - b)); });
});

/* ---------- entrée 2 ---------- */

const PROFIL_BATIMENT = { actions: ['construire', 'installer', 'monter', 'utiliser_machines_outils', 'appliquer_consignes_securite'], activites: ['outils', 'materiaux', 'machines', 'collegues'], environnement: ['exterieur'] };
const PROFIL_SOIN = { actions: ['soigner', 'accompagner', 'accueillir', 'informer'], activites: ['patients', 'personnes_agees', 'personnes_handicap', 'familles'], environnement: ['sante', 'domicile', 'social_creche'] };

test('moteur : un appel sans réglage donne exactement les mêmes résultats qu\'avant (aucun autre écran n\'est touché)', () => {
  [PROFIL_BATIMENT, PROFIL_SOIN].forEach((p) => {
    const sans = M.rechercherMetiers(p, 5000).map((m) => m.id + ':' + m.scoreExact);
    const videReglages = M.rechercherMetiers(Object.assign({ reglages: {} }, p), 5000).map((m) => m.id + ':' + m.scoreExact);
    const indefini = M.rechercherMetiers(Object.assign({ reglages: undefined }, p), 5000).map((m) => m.id + ':' + m.scoreExact);
    assert.deepEqual(videReglages, sans);
    assert.deepEqual(indefini, sans);
  });
});

test('moteur : le facteur de quantité accepte un plafond du plein, ignoré s\'il est absent ou trop bas', () => {
  const profil = { actions: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], activites: [], environnement: [] };
  const f30 = M.facteurInformation(profil, 30), f16 = M.facteurInformation(profil, 30, 16);
  assert.ok(f16 > f30, 'plein plus bas : une même quantité pèse davantage');
  assert.equal(M.facteurInformation(profil, 30, undefined), f30);
  assert.equal(M.facteurInformation(profil, 30, 3), f30, 'un plafond sous le plein minimum est ignoré');
  const seize = { actions: Array(16).fill('x').map((x, i) => x + i), activites: [], environnement: [] };
  assert.equal(M.facteurInformation(seize, 30, 16), 1, 'seize éléments atteignent le plein à 16');
  assert.ok(M.facteurInformation(seize, 30) < 1, 'et pas le plein à 30');
});

test('entrée 2 (consigne 516) : le minimum de choix retrouvés est une source unique, lue par le classement et par la phrase de l’écran', () => {
  assert.equal(L.cmlChoixMinimum(1), 1);
  assert.equal(L.cmlChoixMinimum(3), 2);
  assert.equal(L.cmlChoixMinimum(4), 2);
  assert.equal(L.cmlChoixMinimum(5), 3, 'la moitié arrondie au-dessus (consigne 517)');
  assert.equal(L.cmlChoixMinimum(7), 4);
  assert.equal(L.cmlChoixMinimum(10), 5);
  assert.equal(L.cmlChoixMinimum(11), 5, 'plafonné à 5 : une fiche ne porte qu’une dizaine de choix (consigne 519)');
  assert.equal(L.cmlChoixMinimum(15), 5);
  assert.equal(L.cmlChoixMinimum(40), 5);
  // 15 choix très variés : au moins un métier est proposé (avant le plafond, la moitié exigeait 8 choix et aucune fiche n’y arrivait).
  const varie = { activites: ['clients', 'enfants', 'machines', 'animaux_compagnie'], actions: ['cuisiner', 'soigner', 'conduire', 'decouper', 'vendre', 'nettoyer', 'cultiver_entretenir_plantes', 'servir'], environnement: ['bureau', 'exterieur', 'domicile'] };
  const rVarie = L.cmlEntree2Metiers(varie, 5000);
  assert.ok(rVarie.length > 0, 'au moins un métier pour quinze choix très variés');
  rVarie.forEach((m) => assert.ok(m.choixRetrouves >= 5, m.nom));
  // Tout métier proposé retrouve au moins ce minimum.
  const choix = { actions: ['cuisiner'], activites: ['clients'], environnement: ['bureau'] };
  const n = L.cmlEntree2NombreChoix(choix);
  L.cmlEntree2Metiers(choix, 200).forEach((m) => assert.ok(m.choixRetrouves >= L.cmlChoixMinimum(n), m.nom));
});

test('entrée 2 (consigne 488) : le pourcentage plafonne selon le nombre de choix, jamais 53 % avec un seul choix', () => {
  assert.deepEqual(L.CML_PLAFOND_PAR_NB_CHOIX, [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95]);
  assert.equal(L.cmlPlafondChoix(0), 0);
  assert.equal(L.cmlPlafondChoix(1), 10);
  assert.equal(L.cmlPlafondChoix(3), 30);
  assert.equal(L.cmlPlafondChoix(9), 90);
  assert.equal(L.cmlPlafondChoix(30), 95, 'jamais 100 %');
  [{ actions: ['cuisiner'] }, { activites: ['clients'] }, { activites: ['animaux_compagnie'] }, { environnement: ['bureau'] }].forEach((p) => {
    const r = L.cmlEntree2Metiers(p);
    assert.ok(r.length > 0);
    r.forEach((m) => assert.ok(m.score <= 10, 'un seul choix : au plus 10 % (' + m.nom + ' ' + m.score + ')'));
  });
  // Plus il y a de choix retrouvés par un même métier, plus le pourcentage monte.
  const suite = [{ actions: ['cuisiner'] }, { actions: ['cuisiner'], activites: ['clients'] }, { actions: ['cuisiner', 'servir'], activites: ['clients'] }, { actions: ['cuisiner', 'servir'], activites: ['clients', 'collegues'] }];
  let precedent = 0;
  suite.forEach((p) => {
    const r = L.cmlEntree2Metiers(p);
    assert.ok(r[0].score >= precedent, 'le meilleur pourcentage ne baisse pas quand on ajoute un choix que le métier retrouve');
    precedent = r[0].score;
  });
  assert.ok(precedent > 25 && precedent <= 65, 'quatre choix : entre 26 et 65 %');
  [PROFIL_BATIMENT, PROFIL_SOIN].forEach((p) => {
    const apres = L.cmlEntree2Metiers(p);
    assert.ok(apres.length > 0 && apres[0].score <= 100);
    apres.forEach((m) => { assert.ok(m.choixRetrouves >= L.cmlChoixMinimum(m.choixTotal), 'au moins la moitié des choix retrouvés, jamais plus de 5 exigés : ' + m.nom); });
  });
});

test('entrée 2 (consigne 488) : des choix de nature et d’animaux ne font pas ressortir des métiers de bureau, et la liste n’est pas classée par ordre alphabétique', () => {
  const r = L.cmlEntree2Metiers({ activites: ['animaux_compagnie', 'vegetaux'], environnement: ['espaces_verts'] });
  assert.ok(r.length > 0);
  assert.ok(r.slice(0, 5).every((m) => m.choixRetrouves >= 2), 'les premiers retrouvent au moins deux choix sur trois');
  assert.ok(!r.some((m) => /web|cin[ée]aste|comptable/i.test(m.nom)), 'aucun métier d’écran ni de bureau');
  const un = L.cmlEntree2Metiers({ activites: ['clients'] });
  const noms = un.slice(0, 30).map((m) => m.nom);
  assert.notDeepEqual(noms, noms.slice().sort((a, b) => a.localeCompare(b, 'fr')), 'à choix égal, ce n’est pas l’ordre alphabétique qui décide');
});

test('entrée 3 (consigne 488) : à indice égal, le contenu départage (lettres retrouvées, moins de lettres en trop), l’ordre alphabétique vient en dernier', () => {
  const r = L.cmlMetiersPourLettres(['R', 'I', 'A']);
  assert.ok(r.length > 0);
  for (let k = 1; k < r.length; k++) {
    const a = r[k - 1], b = r[k];
    if (Math.abs(a.indice - b.indice) < 1e-9) {
      assert.ok(a.retrouvees >= b.retrouvees, 'plus de lettres retrouvées d’abord : ' + a.metier.nom + ' avant ' + b.metier.nom);
      if (a.retrouvees === b.retrouvees) { assert.ok(a.ecart <= b.ecart, 'puis moins de lettres en trop'); }
    }
  }
  assert.ok(r[0].retrouvees >= 2, 'le premier retrouve au moins deux lettres du code RIA');
});

test('entrée 2 (consigne 488) : des choix que la base ne retrouve dans aucun métier ne donnent aucune proposition', () => {
  assert.deepEqual(L.cmlEntree2Metiers({ actions: ['choix_inconnu_1', 'choix_inconnu_2'] }), []);
});

test('entrée 2 : maximum de choix par page, phrase « choix très variés » au-delà de 20, rien sans choix', () => {
  assert.deepEqual(L.CML_MAX_CHOIX, { actions: 16, activites: 16, environnement: 12 });
  const trop = { actions: Array(30).fill('x').map((x, i) => x + i), activites: Array(30).fill('y').map((x, i) => x + i), environnement: Array(30).fill('z').map((x, i) => x + i) };
  const profil = L.cmlEntree2Profil(trop);
  assert.deepEqual([profil.actions.length, profil.activites.length, profil.environnement.length], [16, 16, 12]);
  assert.deepEqual(profil.reglages, { pleinMax: 16 });
  assert.equal(L.cmlEntree2ChoixVaries(PROFIL_BATIMENT), false);
  assert.equal(L.cmlEntree2NombreChoix(PROFIL_SOIN), 11);
  const vingtEtUn = { actions: Array(10).fill('a').map((x, i) => x + i), activites: Array(8).fill('b').map((x, i) => x + i), environnement: ['c1', 'c2', 'c3'] };
  assert.equal(L.cmlEntree2NombreChoix(vingtEtUn), 21);
  assert.equal(L.cmlEntree2ChoixVaries(vingtEtUn), true);
  assert.equal(L.cmlEntree2ChoixVaries({ actions: Array(20).fill('a').map((x, i) => x + i) }), false, 'vingt choix : pas encore');
  assert.deepEqual(L.cmlEntree2Metiers({}), []);
  assert.deepEqual(L.cmlEntree2Metiers(null), []);
});

test('page « Pourquoi ils recrutent » : trois explications reliées au Lexique, département partagé, chiffres lus dans la source unique', () => {
  const fs = require('fs'), path = require('path');
  const src = fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-les-metiers', 'parMetier.js'), 'utf8');
  const lex = fs.readFileSync(path.join(__dirname, '..', 'data', 'lexique.js'), 'utf8');
  ['metier-en-tension', 'turnover', 'emploi-saisonnier'].forEach((id) => {
    assert.ok(src.includes("fiche: '" + id + "'"), 'explication reliée à ' + id);
    assert.ok(lex.includes("id: '" + id + "'") && lex.includes("fichesEntree: ['" + id + "']"), 'fiche et second niveau de ' + id);
  });
  assert.ok(src.includes('_comprendreLesChiffresBmoDep') && src.includes('_comprendreLesChiffresBmoDonnees'), 'département et données partagés avec Comprendre les chiffres');
  assert.ok(!/\b(66|45|52)\s?%/.test(src), 'aucun chiffre recopié dans le module');
});

test('seuil de 10 % (décision de Denis, 17/11/2026) : une lettre sous 10 % n’entre pas dans le code, qui compte 1, 2 ou 3 lettres', () => {
  const calc = (v) => L.cmqResultatDepuisPourcentages(pctDepuisResultat(v), false);
  const tresArtistique = calc({ R: 3, I: 1, A: 95, S: 0, E: 2, C: 1 });
  assert.deepEqual(tresArtistique.code, ['A'], 'une seule lettre retenue');
  assert.equal(tresArtistique.procheFrontiere, false, 'pas de « troisième lettre proche » quand il n’y a pas de troisième lettre');
  assert.deepEqual(tresArtistique.lettresPourMetiers, ['A'], 'les métiers ne sont proposés que d’après la lettre retenue');
  const deux = calc({ R: 6, I: 9, A: 80, S: 40, E: 4, C: 2 });
  assert.deepEqual(deux.code, ['A', 'S'], 'deux lettres : A et S, I à 9 % reste dehors');
  const pile = calc({ R: 10, I: 9, A: 80, S: 60, E: 4, C: 2 });
  assert.deepEqual(pile.code, ['A', 'S', 'R'], 'à 10 % pile, la lettre est retenue');
  const trois = calc({ R: 50, I: 20, A: 80, S: 60, E: 15, C: 12 });
  assert.equal(trois.code.length, 3, 'trois lettres quand elles dépassent toutes 10 %');
});

test('seuil de 10 % : le résultat à une lettre reste gardé et relu à l’identique, et propose des métiers', () => {
  const calcul = L.cmqResultatDepuisPourcentages(pctDepuisResultat({ R: 3, I: 1, A: 95, S: 0, E: 2, C: 1 }), false);
  const garde = L.cmqNormaliserResultatGarde(L.cmqResultatAGarder(calcul, '17/11/2026'));
  assert.deepEqual(garde.code, ['A'], 'un code d’une lettre n’est plus jeté à la relecture');
  const recalcule = L.cmqCalculDepuisGarde(garde);
  assert.deepEqual(recalcule.code, ['A']);
  const metiers = L.cmlMetiersPourLettres(calcul.lettresPourMetiers);
  assert.ok(metiers.length > 0, 'des métiers sont proposés à partir d’une seule lettre');
});

test('chaque chemin a sa vraie page de présentation : deux boutons par carte, entrée directe, Revoir la présentation par chemin, le RIASEC vit dans le questionnaire', () => {
  const fs = require('fs'), path = require('path');
  const lire = (f) => fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-les-metiers', f), 'utf8');
  const index = lire('index.js'), metier = lire('parMetier.js'), actions = lire('parActions.js'), quest = lire('questionnaire.js');
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  // trois routes de présentation, branchées dans js/app.js
  ['comprendre-les-metiers-intro-metier', 'comprendre-les-metiers-intro-actions', 'comprendre-les-metiers-intro-q'].forEach((r) => {
    assert.ok(index.includes("'" + r + "'"), 'route déclarée : ' + r);
    assert.ok(app.includes("'" + r + "':"), 'route branchée : ' + r);
    assert.ok(app.includes("AIDE_PAGES['" + r + "']"), 'aide contextuelle : ' + r);
  });
  // les cartes : un bouton qui entre directement, un bouton de présentation
  assert.ok(index.includes('data-cml="entrer"') && index.includes('data-cml="presenter"') && index.includes('Présentation de ce chemin'), 'deux boutons par carte');
  assert.ok(/cmvEnregistrerAction\('entrer'/.test(index) && /cmvEnregistrerAction\('presenter'/.test(index));
  // les anciens écrans d'explication n'existent plus et rien ne renvoie vers eux
  assert.ok(!/cmvEnregistrerVue\('(metier-intro|actions-intro|q-intro)'/.test(index + metier + actions + quest), 'plus d’écran d’explication dans le module');
  assert.ok(!/['"](metier-intro|actions-intro|q-intro)['"]/.test(index + metier + actions + quest + lire('parMetierEcran.js')), 'aucun renvoi vers les anciens écrans');
  // Revoir la présentation ramène à la présentation du chemin où se trouve la personne
  assert.ok(index.includes('cmvRetourVersPresentation(true, cmvCheminDeVue(etat.vue))'));
  assert.ok(/CMV_CHEMIN_DE_VUE = \{ metier: 'metier', competence: 'metier', secteur: 'metier', actions1: 'actions'/.test(index));
  assert.ok(/'q-ouverture': 'q', 'q-page': 'q', 'q-fin': 'q', resultat: 'q'/.test(index));
  // le premier écran de chaque chemin revient à l'accueil du module, et le questionnaire s'ouvre directement (avec son avertissement)
  assert.ok(lire('parMetierEcran.js').includes("retour: 'accueil'") && actions.includes("retour: 'accueil', suite: 'actions2'"));
  assert.ok(quest.includes('function cmqvCommencer(etat)') && quest.includes("cmvAller('accueil')"));
  // (maquette validée le 18/11/2026) l'avertissement des 300 questions est sur l'écran « Avant de commencer », qui précède la partie 1
  assert.ok(/cmvEnregistrerVue\('q-avant'/.test(quest) && /cmvEncart\('bi-exclamation-triangle'/.test(quest) && /etat\.vue = 'q-avant'/.test(quest), 'avertissement sur « Avant de commencer »');
  // le RIASEC : plus dans la présentation générale, une seule fois dans celle du questionnaire
  assert.equal((index.match(/Le RIASEC, le modèle du questionnaire/g) || []).length, 0, 'plus de RIASEC dans la présentation générale');
  assert.equal((quest.match(/Le RIASEC, le modèle du questionnaire/g) || []).length, 1, 'un seul rectangle pour le RIASEC');
  assert.equal((index.match(/cmvFichesLettres\(/g) || []).length, 1, 'les six types en détail : seulement la définition dans index.js, plus d’appel dans la présentation générale');
  assert.ok(index.includes('CMV_TEXTE_ORIGINE') && quest.includes('CMV_TEXTE_ORIGINE'), 'phrase d’origine du test : une seule source');
  assert.ok(!/Nous n’avons rien inventé|Ce n’est pas une invention/.test(index + quest), 'plus de formule défensive');
  // chaque corps de présentation existe
  assert.ok(metier.includes('function cmvCorpsPresentationMetier()') && actions.includes('function cmvCorpsPresentationActions()') && quest.includes('function cmvCorpsPresentationQuestionnaire()'));
});

test('aucune durée n’est annoncée pour le questionnaire : seulement le nombre de questions (consigne 445)', () => {
  const fs = require('node:fs');
  const lire = (f) => fs.readFileSync(require('node:path').join(__dirname, '..', f), 'utf8');
  const tout = ['modules/comprendre-les-metiers/index.js', 'modules/comprendre-les-metiers/questionnaire.js'].map(lire).join('\n');
  assert.ok(!/demi-heure|trois quarts d.heure|quart d.heure|\d+ ?min(ute)?s?\b/i.test(tout), 'aucune durée dans le module');
  // l'aide contextuelle du questionnaire (js/app.js) : la ligne q-ouverture ne parle d'aucune durée
  const ligne = lire('js/app.js').split('\n').find((l) => /'q-ouverture':/.test(l)) || '';
  assert.ok(ligne.length > 20 && !/demi-heure|quarts d.heure|minutes/i.test(ligne), 'aide contextuelle sans durée');
  assert.ok(tout.includes('cmvNombreQuestions()'), 'le nombre de questions est calculé, jamais écrit en dur');
  const total = PARTIES.reduce((n, p) => n + L.cmqEnonces(p).length, 0);
  assert.equal(total, 300);
});

test('jamais « aimer travailler » dans ce que la personne lit (consigne 446)', () => {
  const fs = require('node:fs');
  const lire = (f) => fs.readFileSync(require('node:path').join(__dirname, '..', f), 'utf8');
  ['modules/comprendre-les-metiers/index.js', 'modules/comprendre-les-metiers/questionnaire.js', 'modules/comprendre-les-metiers/parActions.js', 'modules/comprendre-les-metiers/parMetier.js',
    'modules/comprendre-les-metiers/parMetierEcran.js', 'data/questionnaireRiasec.js', 'data/metiers.js', 'js/app.js'].forEach((f) => {
    const t = lire(f);
    assert.ok(!/\baim(e|ez|er|eriez|erais|erait|ent)[- ](vous[- ])?travailler/i.test(t), 'aimer travailler dans ' + f);
  });
});

test('échelle de pistes (consigne 505) : aucun niveau sous 3 choix, quatre niveaux aux bornes 3, 5, 7 et 9', () => {
  assert.deepEqual(L.CML_BORNES_NIVEAUX, [3, 5, 7, 9]);
  assert.equal(L.CML_MIN_CHOIX_PISTES, 3);
  const niv = (n) => L.cmlNiveauPistes(n);
  assert.deepEqual([0, 1, 2].map(niv), [0, 0, 0], 'un ou deux choix : pas encore de pistes');
  assert.deepEqual([3, 4, 5, 6, 7, 8, 9, 10, 25].map(niv), [1, 1, 2, 2, 3, 3, 4, 4, 4]);
  assert.deepEqual(L.CML_NIVEAUX_PISTES.map((v) => v.nom), ['Piste éloignée', 'Piste à explorer', 'Piste proche', 'Piste précise']);
});
test('échelle de pistes (consigne 505) : le nom, le texte et le nombre de choix qui manquent pour le niveau suivant', () => {
  const a = L.cmlInfoNiveauPistes(1);
  assert.equal(a.niveau, 0); assert.equal(a.nom, 'Pas encore de pistes'); assert.equal(a.reste, 2);
  const b = L.cmlInfoNiveauPistes(2);
  assert.equal(b.reste, 1, 'encore un choix pour voir les premières pistes');
  const c = L.cmlInfoNiveauPistes(3);
  assert.equal(c.nom, 'Piste éloignée'); assert.equal(c.reste, 2); assert.equal(c.suivant, 'Piste à explorer');
  const d = L.cmlInfoNiveauPistes(6);
  assert.equal(d.nom, 'Piste à explorer'); assert.equal(d.reste, 1); assert.equal(d.suivant, 'Piste proche');
  const e = L.cmlInfoNiveauPistes(12);
  assert.equal(e.niveau, 4); assert.equal(e.reste, 0); assert.equal(e.suivant, '');
  L.CML_NIVEAUX_PISTES.forEach((v) => { assert.ok(v.texte.length > 20); assert.ok(!/[—–]/.test(v.nom + v.texte)); assert.ok(!/\bIA\b/.test(v.nom + v.texte)); });
});
test('échelle de pistes (consigne 505) : la première proposition demande le niveau 2 et au plus 3 métiers à égalité en tête', () => {
  assert.equal(L.cmlEgalitesEnTete([]), 0);
  assert.equal(L.cmlEgalitesEnTete([50, 50, 50, 40]), 3);
  assert.equal(L.cmlEgalitesEnTete([60, 50, 50]), 1);
  assert.deepEqual(L.cmlVedetteAutorisee(4, 1), { oui: false, raison: 'trop-tot' }, 'niveau 1 : trop tôt, même sans égalité');
  assert.deepEqual(L.cmlVedetteAutorisee(2, 1), { oui: false, raison: 'trop-tot' });
  assert.deepEqual(L.cmlVedetteAutorisee(5, 3), { oui: true, raison: '' });
  assert.deepEqual(L.cmlVedetteAutorisee(5, 4), { oui: false, raison: 'egalite' }, 'quatre métiers à égalité : en choisir un serait arbitraire');
  assert.deepEqual(L.cmlVedetteAutorisee(9, 1), { oui: true, raison: '' });
});
test('échelle de pistes (consigne 505) : un seul plafond pour les deux chemins, et aucun ancien texte de fiabilité', () => {
  assert.equal(typeof L.cmlFiabiliteListe, 'undefined', 'la fiabilité est remplacée par les niveaux');
  const C = require('../modules/comprendre-les-metiers/parMetierCalcul.js');
  [1, 2, 3, 5, 9, 12].forEach((n) => {
    const S = C.pmcEtatInitial();
    S.comp = Array.from({ length: n }, (_, i) => ({ t: 'sf', i }));
    assert.equal(C.pmcPlafond(S), L.cmlPlafondChoix(n), n + ' choix : même plafond que « Partir de vos envies »');
  });
  const lire = (f) => require('node:fs').readFileSync(require('node:path').join(__dirname, '..', f), 'utf8');
  ['modules/comprendre-les-metiers/parActions.js', 'modules/comprendre-les-metiers/parMetierEcran.js'].forEach((f) => {
    const t = lire(f);
    assert.ok(t.indexOf('cmvBandeauNiveau') !== -1 || t.indexOf('cmvPasDePistes') !== -1, 'le bandeau de niveau est branché dans ' + f);
    assert.ok(t.indexOf('cmvEncartQuestionnaire') !== -1, 'le pont vers le questionnaire est branché dans ' + f);
    assert.ok(t.indexOf('cmlFiabiliteListe') === -1, 'plus d’ancienne fiabilité dans ' + f);
  });
});

// Consigne 499 (21/11/2026) : « Comment vos choix ont été lus ». Les fonctions COMPTENT avec les règles du moteur, elles ne recalculent jamais un pourcentage.
test('consigne 499 : le niveau d’aide d’un choix dépend de la part de métiers qu’il décrit', () => {
  assert.equal(L.cmlNiveauAide(0, 1925), 0, 'un choix que la base ne reconnaît chez aucun métier n’aide pas à distinguer');
  assert.equal(L.cmlNiveauAide(33, 1925), 3, 'moins de 8 % : beaucoup');
  assert.equal(L.cmlNiveauAide(300, 1925), 2, 'de 8 % à 25 % : moyennement');
  assert.equal(L.cmlNiveauAide(900, 1925), 1, 'plus de 25 % : un peu');
  assert.deepEqual(L.CML_MOTS_AIDE, ['', 'un peu', 'moyennement', 'beaucoup']);
});
test('consigne 499 : chemin 2, chaque choix est compté dans toute la base et dans la liste affichée', () => {
  const choix = { activites: ['animaux_compagnie', 'vegetaux'], actions: [], environnement: ['espaces_verts'] };
  const liste = L.cmlEntree2Metiers(choix, 5000);
  const lus = L.cmlChoixLus2(choix, liste);
  assert.equal(lus.total, M.baseMetiers.length);
  assert.equal(lus.liste, liste.length);
  assert.equal(lus.lignes.length, 3);
  lus.lignes.forEach((x) => { assert.ok(x.nbMetiers >= x.dansListe, 'la liste est une partie de la base'); assert.ok(x.nbMetiers > 0); });
  assert.equal(lus.lignes[0].item, 'animaux_compagnie', 'l’ordre est celui du moteur : avec qui ou quoi, puis actions, puis où');
  // Cohérence avec le moteur : la somme des « dans la liste » est la somme des choix retrouvés de chaque métier affiché.
  assert.equal(lus.lignes.reduce((s, x) => s + x.dansListe, 0), liste.reduce((s, m) => s + m.choixRetrouves, 0));
  // Un choix retrouvé par moins d’un quart de la liste est signalé, jamais les autres.
  assert.deepEqual(lus.faibles.map((x) => x.item), ['animaux_compagnie']);
});
test('consigne 499 : chemin 2, rien à lire sans choix, et le classement n’a pas changé', () => {
  assert.equal(L.cmlChoixLus2({ activites: [], actions: [], environnement: [] }, []), null);
  const liste = L.cmlEntree2Metiers({ activites: ['animaux_compagnie'], actions: [], environnement: [] }, 5000);
  assert.ok(liste.length > 0 && liste.every((m) => m.choixTotal === 1 && m.choixRetrouves === 1 && m.score === 10));
});
test('consigne 499 : chemin 3, une ligne par lettre du code avec le nombre de métiers dont elle est la lettre principale', () => {
  assert.equal(L.cmlChoixLus3(''), null);
  const lus = L.cmlChoixLus3('RIS');
  assert.equal(lus.lettres.length, 3);
  assert.deepEqual(lus.lettres.map((x) => x.l + x.rang), ['R1', 'I2', 'S3']);
  assert.equal(lus.liste, L.cmlMetiersPourLettres('RIS').length);
  assert.equal(lus.total, M.baseMetiers.length);
  assert.ok(lus.lettres.every((x) => x.nbMajeure > 0));
  assert.ok(lus.lettres.reduce((s, x) => s + x.nbMajeure, 0) <= lus.total);
});

// Consigne 501 (21/11/2026) : « Vos choix vont dans plusieurs directions ». On compte dans la base, sans liste de paires opposées.
test('consigne 501 : le noyau de calcul, seuils, choix à retirer et absence de message sous 4 choix', () => {
  const f = (o) => o.split('').map((c) => c === '1');
  // 4 choix, aucun métier ne retrouve 3 choix sur 4 (deux groupes de métiers, chacun avec deux choix)
  const base = []; for (let i = 0; i < 30; i++) { base.push(f('1100')); base.push(f('0011')); }
  const r = L.cmlDirectionsChoix(base, 4);
  assert.equal(r.declenche, true); assert.equal(r.nbCouverts, 0);
  assert.equal(r.retirer.nb, 30, 'sans le choix 0, trente métiers retrouvent deux choix sur trois');
  // le choix 3 bloque : sans lui, 20 métiers retrouvent 2 choix sur 3
  const bloque = []; for (let i = 0; i < 20; i++) { bloque.push(f('1110')); } bloque.push(f('0001'));
  const r2 = L.cmlDirectionsChoix(bloque, 4);
  assert.equal(r2.declenche, false, '20 métiers retrouvent 3 choix sur 4 : rien à dire');
  const r3 = L.cmlDirectionsChoix(bloque.slice(20).concat([f('1100'), f('1100'), f('0110'), f('1010'), f('1010'), f('0110'), f('1100'), f('1010'), f('0110'), f('1100'), f('1100'), f('1010')]), 4);
  assert.equal(r3.declenche, true);
  assert.equal(r3.retirer.index, 3, 'sans le choix 3, douze métiers retrouvent deux choix sur trois');
  assert.equal(r3.retirer.nb, 12);
  assert.equal(L.cmlDirectionsChoix(base, 3).declenche, false, 'jamais sous 4 choix');
  assert.equal(L.cmlDirectionsChoix([], 5).declenche, false);
});
test('consigne 501 : aucun des profils cohérents du banc d’essai ne déclenche le message, les contradictoires oui', () => {
  const B = require('../scripts/bancEssaiMoteur.js');
  const complet = (c) => ({ activites: c.activites || [], actions: c.actions || [], environnement: c.environnement || [] });
  B.PERSONAS.forEach((p) => {
    const r = L.cmlDirections2(complet(p.choix));
    assert.equal(r.declenche, false, p.titre + ' : ' + r.nbCouverts + ' métiers');
  });
  const contradictoire = L.cmlDirections2(complet(B.DIFFICILES[0].choix));
  assert.equal(contradictoire.declenche, true);
  assert.ok(contradictoire.nbCouverts < 5);
  assert.ok(contradictoire.retirer && contradictoire.retirer.nb >= 10 && contradictoire.retirer.choix.item === 'soigner', 'sans « soigner », 159 métiers (sans « bureau », 59)');
  const quinze = L.cmlDirections2(complet(B.DIFFICILES[4].choix));
  assert.equal(quinze.declenche, true); assert.equal(quinze.retirer, null, 'à quinze choix, retirer un seul ne change rien');
  assert.equal(L.cmlDirections2({ activites: [], actions: [], environnement: [] }), null);
});

// Consigne 502 (21/11/2026) : « à éviter » du chemin 2. Un métier qui porte un choix évité voit son pourcentage divisé par deux par choix évité retrouvé, et le dit. Jamais retiré.
test('consigne 502 : un choix à éviter divise le pourcentage par deux, signale le métier et ne retire aucun métier', () => {
  const B = require('../scripts/bancEssaiMoteur.js');
  const p = B.PERSONAS.find((x) => /cuisine/i.test(x.titre));
  const choix = { activites: p.choix.activites || [], actions: p.choix.actions || [], environnement: p.choix.environnement || [] };
  const liste = L.cmlEntree2Metiers(choix, 5000);
  const avant = JSON.stringify(liste);
  assert.equal(L.cmlAppliquerEvites(liste, []), liste, 'sans choix évité, la liste est rendue telle quelle');
  const res = L.cmlAppliquerEvites(liste, [{ cat: 'activites', item: 'machines' }]);
  assert.equal(JSON.stringify(liste), avant, 'la liste d’origine n’est pas modifiée');
  assert.equal(res.length, liste.length, 'aucun métier retiré');
  const touches = res.filter((m) => m.evitesPortes.length);
  assert.ok(touches.length > 0 && touches.length < res.length);
  touches.forEach((m) => {
    assert.equal(m.score, Math.max(1, Math.round(m.scoreAvantEvites * 0.5)), m.nom);
    assert.equal(m.evitesPortes[0].item, 'machines');
  });
  res.forEach((m, i) => { if (i) { assert.ok(res[i - 1].score >= m.score, 'classé par pourcentage décroissant'); } });
  assert.ok(res.filter((m) => !m.evitesPortes.length).every((m) => m.scoreAvantEvites === undefined));
  // deux choix évités retrouvés : divisé par quatre ; le minimum reste 1 tant que le métier avait un pourcentage
  const deux = L.cmlAppliquerEvites([{ nom: 'X', score: 3, activites: ['machines'], actions: ['utiliser_machines_outils'], environnement: [] }], [{ cat: 'activites', item: 'machines' }, { cat: 'actions', item: 'utiliser_machines_outils' }]);
  assert.equal(deux[0].evitesPortes.length, 2); assert.equal(deux[0].score, 1);
});
test('consigne 502 : les choix à éviter ne dépassent pas la limite et la page « à éviter » est branchée partout', () => {
  assert.equal(L.CML_MAX_EVITER, 12);
  const fs = require('node:fs'), path = require('node:path');
  const lire = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  const pa = lire('modules/comprendre-les-metiers/parActions.js'), idx = lire('modules/comprendre-les-metiers/index.js'), g = lire('modules/comprendre-les-metiers/garder.js'), app = lire('js/app.js');
  assert.ok(/suite: 'actionsEviter'/.test(pa), 'la page « où » mène à « à éviter »');
  assert.ok(/'actions3', 'actionsEviter', 'actions4'/.test(pa), 'cinq étapes dans le fil');
  assert.ok(/cmlAppliquerEvites\(pmcAjusterListeConditions/.test(pa), 'l’effet vient après les conditions');
  assert.ok(/eviter: \[\]/.test(idx) && /actionsEviter: 'actions'/.test(idx));
  assert.ok(/_cmgEvitesConnus\(pa\.choix\.eviter, choix\)/.test(g), 'relu avec méfiance depuis la disquette');
  assert.ok(/actionsEviter:/.test(app), 'texte d’aide de la page');
});

// ---------------- Échelle du questionnaire, chemin 3 (consigne 508) ----------------
// Réponses « oui » seulement aux n premiers énoncés (parties 1 à 4 à la suite) : les autres lignes restent vides.
function repondrePartiel(n, partie4Passee) {
  const r = { partie4Passee: !!partie4Passee, p1: {}, p2: {}, p3: {}, p4: {} };
  const ok = { p1: 'oui', p2: 'oui', p3: 'a_laise', p4: 'ressemble' };
  let i = 0;
  PARTIES.forEach((p) => { L.cmqEnonces(p).forEach((e) => { if (i < n && !(p === 'p4' && partie4Passee)) { r[p][e.id] = ok[p]; } i++; }); });
  return r;
}
test('échelle du questionnaire : niveaux selon la part des lignes répondues (40, 50, 67 et 83 %)', () => {
  const niv = (a, b) => L.cmlNiveauQuestionnaire(a, b);
  assert.deepEqual([119, 120, 149, 150, 199, 200, 249, 250, 300].map((a) => niv(a, 300)), [0, 1, 1, 2, 2, 3, 3, 4, 4]);
  assert.equal(niv(0, 300), 0);
  assert.equal(niv(5, 0), null, 'nombre de lignes inconnu : aucun niveau');
  assert.equal(niv(null, 300), null);
  const i = L.cmlInfoNiveauQuestionnaire(119, 300);
  assert.equal(i.nom, 'Pas encore de pistes'); assert.equal(i.pct, 39, 'jamais « 40 % » sous le seuil'); assert.equal(i.minimum, 120); assert.equal(i.aRepondre, 120);
  const j = L.cmlInfoNiveauQuestionnaire(150, 300);
  assert.equal(j.nom, 'Piste à explorer'); assert.equal(j.aRepondre, 200); assert.equal(j.suivant, 'Piste proche'); assert.equal(j.pct, 50);
  const k = L.cmlInfoNiveauQuestionnaire(290, 300);
  assert.equal(k.nom, 'Piste précise'); assert.equal(k.aRepondre, 0); assert.equal(k.suivant, '');
  assert.deepEqual(L.CML_NIVEAUX_PISTES.map((v) => v.nom), ['Piste éloignée', 'Piste à explorer', 'Piste proche', 'Piste précise'], 'mêmes noms que les chemins 1 et 2');
  L.CML_NIVEAUX_PISTES.forEach((v) => { assert.ok(v.texteQ && !/[—–]/.test(v.texteQ) && !/\bIA\b/.test(v.texteQ), 'texte du questionnaire propre : ' + v.nom); });
});
test('échelle du questionnaire : sous 40 % de lignes répondues, aucune lettre (état « peu de réponses »)', () => {
  const peu = L.cmqCalculer(repondrePartiel(100));
  assert.equal(peu.nbReponses, 100); assert.equal(peu.nbLignes, 300); assert.equal(peu.peuDeLignes, true);
  assert.equal(peu.etat, 'peu_reponses'); assert.equal(peu.code, null); assert.deepEqual(peu.lettresPourMetiers, []);
  const assez = L.cmqCalculer(repondrePartiel(120));
  assert.equal(assez.peuDeLignes, false); assert.equal(assez.nbReponses, 120);
  assert.equal(L.cmqCalculer(repondre(TOUT_NON)).peuDeLignes, false, 'répondre « non » à tout est répondre : la règle compte les lignes, pas les « oui »');
  assert.equal(L.cmqCalculer(repondre({ p1: null, p2: null, p3: null, p4: null })).peuDeLignes, true, 'aucune ligne répondue');
});
test('échelle du questionnaire : une partie 4 passée sort du total des lignes', () => {
  const total4 = L.cmqEnonces('p4').length;
  const c = L.cmqCalculer(repondrePartiel(150, true));
  assert.equal(c.nbLignes, 300 - total4); assert.equal(c.nbReponses, 150);
  assert.equal(L.cmqCalculer(repondre(TOUT_OUI, true)).nbReponses, 300 - total4);
});
test('échelle du questionnaire : le nombre de lignes répondues est gardé et relu avec méfiance', () => {
  const c = L.cmqCalculer(repondrePartiel(130));
  const garde = L.cmqResultatAGarder(c, '21/11/2026');
  assert.equal(garde.nbReponses, 130); assert.equal(garde.nbLignes, 300);
  const refait = L.cmqCalculDepuisGarde(L.cmqNormaliserResultatGarde(JSON.parse(JSON.stringify(garde))));
  assert.equal(refait.nbReponses, 130); assert.equal(refait.peuDeLignes, false);
  const vide = L.cmqCalculDepuisGarde(L.cmqNormaliserResultatGarde(JSON.parse(JSON.stringify(L.cmqResultatAGarder(L.cmqCalculer(repondrePartiel(60)), '21/11/2026')))));
  assert.equal(vide.peuDeLignes, true); assert.equal(vide.etat, 'peu_reponses'); assert.equal(vide.code, null);
  // Résultat gardé avant cette règle, ou disquette abîmée : aucun niveau, comportement d'avant.
  const ancien = Object.assign({}, garde); delete ancien.nbReponses; delete ancien.nbLignes;
  const relu = L.cmqNormaliserResultatGarde(ancien);
  assert.equal(relu.nbLignes, null); assert.equal(L.cmqCalculDepuisGarde(relu).peuDeLignes, false); assert.equal(L.cmlInfoNiveauQuestionnaire(relu.nbReponses, relu.nbLignes), null);
  [{ nbReponses: 500, nbLignes: 300 }, { nbReponses: -1, nbLignes: 300 }, { nbReponses: 'x', nbLignes: 300 }, { nbReponses: 10, nbLignes: 99999 }].forEach((mauvais) => {
    assert.equal(L.cmqNormaliserResultatGarde(Object.assign({}, garde, mauvais)).nbLignes, null, JSON.stringify(mauvais));
  });
});

// Cartes enrichies (consigne 509, règle ajustée le 21/11/2026) : compétences et conditions de travail montrées sur les cartes des trois chemins.
test('Cartes enrichies : les conditions sont les plus rares d\'abord, sans les statuts', () => {
  const K = { libelles: { nuit: 'N', charges: 'C', public: 'P', s_interim: 'Intérim' }, ordre: ['nuit', 'charges', 'public', 's_interim'],
    parCode: { A: ['nuit', 'charges', 'public', 's_interim'], B: ['nuit', 'public'], C: ['nuit'], D: ['nuit'] } };
  // fréquence : nuit 4, public 2, charges 1 : charges d'abord, puis public, puis nuit ; le statut n'apparaît jamais
  assert.deepEqual(L.cmlConditionsCarte('A', K).map((x) => x.id), ['charges', 'public', 'nuit']);
  assert.deepEqual(L.cmlConditionsCarte('A', K).map((x) => x.lib), ['C', 'P', 'N']);
  assert.deepEqual(L.cmlConditionsCarte('inconnu', K), []);
  assert.deepEqual(L.cmlConditionsCarte('A', null), []);
  // égalité de fréquence : l'ordre du ROME
  const K2 = { libelles: { a: 'A', b: 'B' }, ordre: ['a', 'b'], parCode: { X: ['b', 'a'] } };
  assert.deepEqual(L.cmlConditionsCarte('X', K2).map((x) => x.id), ['a', 'b']);
});
test('Cartes enrichies : les compétences viennent du champ « cartes », rien si le fichier manque', () => {
  const CP = { phrases: ['p0', 'p1', 'p2', 'p3', 'p4'], parCode: { X: [0, 1, 2, 3, 4] }, cartes: { X: [3, 1, 4, 0] } };
  assert.deepEqual(L.cmlCompetencesCarte('X', CP), ['p3', 'p1', 'p4', 'p0']);
  assert.deepEqual(L.cmlCompetencesCarte('Y', CP), []);
  assert.deepEqual(L.cmlCompetencesCarte('X', null), []);
  assert.deepEqual(L.cmlCompetencesCarte('X', { phrases: [], parCode: {} }), []);
});
test('Cartes enrichies : trois compétences et trois conditions par défaut, avec ce qui reste dans la fiche', () => {
  const CP = { phrases: ['p0', 'p1', 'p2', 'p3', 'p4'], parCode: { X: [0, 1, 2, 3, 4] }, cartes: { X: [3, 1, 4, 0] } };
  const K = { libelles: { a: 'A', b: 'B', c: 'C', d: 'D', e: 'E' }, ordre: ['a', 'b', 'c', 'd', 'e'], parCode: { X: ['a', 'b', 'c', 'd', 'e'] } };
  const r = L.cmlResumeMetier('X', K, CP);
  assert.equal(r.competences.length, 3); assert.equal(r.resteCompetences, 2);
  assert.equal(r.conditions.length, 3); assert.equal(r.resteConditions, 2);
  const s = L.cmlResumeMetier('X', K, CP, 0);
  assert.equal(s.competences.length, 0); assert.equal(s.resteCompetences, 0); assert.equal(s.conditions.length, 3);
  const sans = L.cmlResumeMetier('X', K, null);
  assert.equal(sans.competences.length, 0); assert.equal(sans.resteCompetences, 0); assert.equal(sans.conditions.length, 3);
});
test('Cartes enrichies : sur les vraies données, toute carte a ses compétences et celles-ci sont connues', () => {
  const K = require('../data/conditionsRome.js').CONDITIONS_ROME, CP = require('../data/competencesRome.js').COMPETENCES_ROME;
  const codes = Object.keys(CP.parCode);
  assert.ok(codes.length > 1900);
  let sans = 0;
  codes.forEach((c) => {
    const comp = L.cmlCompetencesCarte(c, CP);
    if (!comp.length) { sans++; return; }
    assert.ok(comp.length <= 6 && comp.length === new Set(comp).size, c);
    comp.forEach((p) => assert.equal(typeof p, 'string'));
    CP.cartes[c].forEach((i) => assert.ok(CP.parCode[c].indexOf(i) !== -1, c + ' : la phrase de la carte doit être une phrase du code'));
  });
  assert.ok(sans <= 3, 'codes sans compétence : ' + sans);
  M.baseMetiers.filter((m) => m.rome).slice(0, 400).forEach((m) => {
    L.cmlConditionsCarte(m.rome, K).forEach((x) => assert.ok(x.id.indexOf('s_') !== 0 && x.lib));
  });
});
