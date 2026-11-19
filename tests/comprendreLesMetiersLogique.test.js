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
  assert.deepEqual(Object.keys(garde).sort(), ['code', 'date', 'etat', 'lettresPourMetiers', 'partie4Passee', 'parties', 'pourcentages', 'version']);
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

test('entrée 2 : avec le plein à 16, les pourcentages ne baissent jamais et le premier métier monte pour un profil à 8 ou 12 choix', () => {
  let montes = 0;
  [PROFIL_BATIMENT, PROFIL_SOIN].forEach((p) => {
    const avant = M.rechercherMetiers(p, 5000);
    const apres = L.cmlEntree2Metiers(p);
    const scoreAvant = {}; avant.forEach((m) => { scoreAvant[m.id] = m.scoreExact; });
    apres.forEach((m) => { if (scoreAvant[m.id] !== undefined) { assert.ok(m.scoreExact >= scoreAvant[m.id] - 1e-9, m.nom); } });
    assert.ok(apres[0].score >= avant[0].score, 'le premier ne baisse pas');
    montes += apres[0].score > avant[0].score ? 1 : 0;
    assert.ok(apres[0].score <= 100);
  });
  assert.ok(montes >= 1, 'le premier métier monte pour au moins un des deux profils');
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
