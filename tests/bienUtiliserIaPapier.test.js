// Module « Bien utiliser l'IA », commit 4 : logique du chemin 2 « J'ai un papier ou une situation » : catalogue (data/buiaModeles.js), repérage par les mots
// (modelesLogique.js), masquage, lecture des dates et des délais, alerte calme (papierLogique.js). Essais sur les trois courriers fictifs A, B, C du corpus.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const D = require('../data/buiaModeles.js');
const M = require('../modules/bien-utiliser-ia/modelesLogique.js');
const P = require('../modules/bien-utiliser-ia/papierLogique.js');

const racine = path.join(__dirname, '..');
const lire = (p) => fs.readFileSync(path.join(racine, p), 'utf8');
const AJ = new Date(2026, 10, 23); // lundi 23 novembre 2026 : le jour du corpus
const A = D.BUIA_COURRIERS_FICTIFS.A.texte, B = D.BUIA_COURRIERS_FICTIFS.B.texte, C = D.BUIA_COURRIERS_FICTIFS.C.texte;
const ids = (r) => r.map((x) => x.id);
const jour = (d) => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();

// ---------------- Catalogue ----------------
test('catalogue : treize modèles, quatre familles, identifiants uniques, chaque modèle dans une famille connue', () => {
  assert.equal(D.BUIA_MODELES.length, 13);
  assert.equal(new Set(D.BUIA_MODELES.map((m) => m.id)).size, 13);
  assert.deepEqual(M.buiaFamilles(), ['Chercher un emploi', 'Administration et démarches', 'Écrire et comprendre', 'Pour les professionnels']);
  D.BUIA_MODELES.forEach((m) => { assert.ok(D.BUIA_FAMILLES.includes(m.famille), m.nom); assert.ok(m.mots.length >= 4, m.nom); });
  D.BUIA_FAMILLES.forEach((f) => assert.ok(M.buiaModelesParFamille(f).length >= 3, f));
});

test('catalogue : les treize modèles sont rédigés ; les professionnels sont une famille à part avec un rappel', () => {
  assert.deepEqual(D.BUIA_MODELES.filter((m) => m.redige).map((m) => m.id).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  assert.deepEqual(M.buiaModeles({ redigesSeulement: true }).map((m) => m.id).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  assert.deepEqual(M.buiaModelesParFamille('Pour les professionnels').map((m) => m.id), [10, 11, 12, 13]);
  assert.ok(D.BUIA_MODELES.filter((m) => m.pro).every((m) => m.famille === 'Pour les professionnels'));
  assert.equal(M.buiaModele(4).nom, 'Comprendre un courrier reçu');
  assert.equal(M.buiaModele(99), null);
  assert.match(D.BUIA_RAPPEL_PRO, /sans noms ni données nominatives/);
});

test('catalogue : les mots de repérage sont écrits sans accent, en minuscules, sans espace ni doublon', () => {
  D.BUIA_MODELES.forEach((m) => {
    assert.equal(new Set(m.mots).size, m.mots.length, 'doublon dans ' + m.nom);
    m.mots.forEach((k) => assert.match(k, /^[a-z]+(-[a-z]+)?$/, m.nom + ' : ' + k));
  });
});

test('catalogue : textes affichés (noms, variantes) sans tiret long, sans « on », sans mot IA, apostrophes typographiques', () => {
  const t = [D.BUIA_RAPPEL_PRO];
  D.BUIA_MODELES.forEach((m) => t.push(m.nom, m.variantes));
  Object.values(D.BUIA_COURRIERS_FICTIFS).forEach((c) => t.push(c.bouton));
  t.forEach((x) => {
    assert.ok(!/[–—]/.test(x), 'tiret long : ' + x);
    assert.ok(!/(^|[^\p{L}])[Oo]n([^\p{L}]|$)/u.test(x), '« on » : ' + x);
    assert.ok(!/\bIA\b|robot|prompt/i.test(x), x);
    assert.ok(!/'/.test(x), 'apostrophe droite : ' + x);
  });
});

test('courriers fictifs : ville, organismes et numéros inventés ; aucun téléphone, courriel ni IBAN dedans', () => {
  Object.values(D.BUIA_COURRIERS_FICTIFS).forEach((c) => {
    assert.match(c.texte, /Villeneuve-Exemple/);
    assert.equal(P.buiaMasquer(c.texte).total, 0);
    assert.ok(!/[–—]/.test(c.texte.replace(/\n- /g, '\n')), 'tiret long');
  });
});

// ---------------- Repérage du modèle ----------------
test('repérage, courrier A (pièces à fournir) : « Comprendre un courrier » et « Répondre à l\'administration » ressortent, dans cet ordre', () => {
  const r = M.buiaReperer(A, true);
  assert.deepEqual(ids(r), [4, 5]);
  assert.ok(r[0].mots.includes('courrier') && r[1].mots.includes('piece') && r[1].mots.includes('justificatif'));
});

test('repérage, courrier B (convocation) : « Préparer un rendez-vous ou un appel » et « Comprendre un courrier » ressortent', () => {
  const r = M.buiaReperer(B, true);
  assert.deepEqual(ids(r), [9, 4]);
  assert.ok(r[0].mots.includes('convocation'));
});

test('repérage, courrier C (trop-perçu) : « Comprendre un courrier » en tête, avec les mots du trop-perçu', () => {
  const r = M.buiaReperer(C, true);
  assert.equal(r[0].id, 4);
  ['trop-percu', 'indu', 'caisse'].forEach((k) => assert.ok(r[0].mots.includes(k), k));
  assert.ok(r.length <= 3);
});

test('repérage : jamais plus de trois propositions, chacune avec ses mots, son score et son état « rédigé »', () => {
  [A, B, C, 'courrier lettre mail message offre emploi cv entretien rendez-vous caisse'].forEach((t) => {
    const r = M.buiaReperer(t, t.length > 100);
    assert.ok(r.length <= 3);
    r.forEach((x) => { assert.ok(x.mots.length >= 1 && x.score >= x.mots.length && typeof x.redige === 'boolean' && M.buiaModele(x.id)); });
    for (let i = 1; i < r.length; i++) { assert.ok(r[i - 1].score >= r[i].score); }
  });
});

test('repérage par mots : les cinq exemples de la maquette', () => {
  assert.equal(M.buiaReperer('je dois répondre à la caisse', false)[0].id, 5);
  assert.equal(M.buiaReperer('lettre de motivation', false)[0].id, 1);
  assert.equal(M.buiaReperer('résumer un texte', false)[0].id, 7);
  assert.equal(M.buiaReperer('préparer un rendez-vous', false)[0].id, 9);
  assert.equal(M.buiaReperer('je ne comprends pas ce courrier', false)[0].id, 4);
});

test('repérage par mots : fautes de frappe d\'accent, majuscules, début de mot (la frappe en cours), « trop perçu » avec ou sans tiret', () => {
  assert.equal(M.buiaReperer('RÉSUMER UN TEXTE', false)[0].id, 7);
  assert.equal(M.buiaReperer('resumer un texte', false)[0].id, 7);
  assert.ok(ids(M.buiaReperer('convoc', false)).includes(9));
  assert.equal(M.buiaReperer('trop perçu', false)[0].id, 4);
  assert.equal(M.buiaReperer('trop-perçu', false)[0].id, 4);
  assert.equal(M.buiaReperer('J’ai reçu une convocation', false)[0].id, 4);
});

// Phrases de mes essais (écrites par Claude, PAS celles de Denis : ses vraies phrases remplaceront celles-ci quand il les aura données).
const ESSAIS = [
  ['la caisse me réclame de l argent', null], ['je dois écrire à pôle emploi', null], ['aide moi pour mon cv', 2], ['je veux postuler à une offre', 1],
  ['comment répondre à la caisse d allocations', 5], ['rdv chez le conseiller lundi', 9], ['expliquer un document', 8], ['j ai un entretien d embauche', 3],
  ['relancer un employeur par mail', 6], ['simplifier un texte', 7], ['bilan de parcours', 11], ['synthèse de mes notes d entretien', 10]
];
test('repérage par mots : mes douze phrases d\'essai (provisoires, avant celles de Denis) : le modèle attendu est proposé, jamais plus de trois', () => {
  ESSAIS.forEach(([phrase, attendu]) => {
    const r = M.buiaReperer(phrase, false);
    assert.ok(r.length <= 3, phrase);
    if (attendu !== null) { assert.ok(ids(r).includes(attendu), phrase + ' => ' + JSON.stringify(ids(r))); }
  });
});

test('repérage : « cv » (deux lettres) est reconnu en entier, pas en début de mot', () => {
  assert.equal(M.buiaReperer('mon cv', false)[0].id, 2);
  assert.equal(M.buiaReperer('cv', false)[0].id, 2);
  assert.deepEqual(M.buiaReperer('cvx', false), []);
  assert.ok(ids(M.buiaReperer('Voici mon CV et une offre d’emploi', true)).includes(2));
});

test('repérage : rien à proposer pour un texte vide, trop court, ou sans mot connu ; jamais d\'erreur sur une valeur étrange', () => {
  ['', '   ', 'ok', 'xyzqw abc'].forEach((t) => assert.deepEqual(M.buiaReperer(t, false), [], t));
  [undefined, null, 42, {}].forEach((t) => assert.ok(Array.isArray(M.buiaReperer(t, true)) && Array.isArray(M.buiaReperer(t, false))));
  assert.deepEqual(M.buiaReperer(undefined, true), []);
  assert.deepEqual(M.buiaReperer(null, false), []);
});

test('repérage : « rédigés seulement » ne propose que les modèles rédigés (les treize)', () => {
  const tout = M.buiaReperer('lettre de motivation pour une offre', false);
  assert.equal(tout[0].id, 1);
  const seul = M.buiaReperer('lettre de motivation pour une offre', false, { redigesSeulement: true });
  seul.forEach((x) => assert.ok([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].includes(x.id) && x.redige));
  assert.ok(ids(seul).includes(1));
  assert.ok(ids(M.buiaReperer('synthèse de notes d’entretien', false, { redigesSeulement: true })).includes(10));
});

test('repérage d\'un papier : un mot ne compte que s\'il est entier (« papier » ne se trouve pas dans « papiers peints »… mais « courriers » compte)', () => {
  assert.ok(ids(M.buiaReperer('les courriers reçus ce mois', true)).includes(4));
  assert.deepEqual(M.buiaReperer('un recouvrement de créances', true), []);
});

// ---------------- Masquage ----------------
test('masquage : courriels, numéros de téléphone français sous toutes leurs écritures, IBAN', () => {
  const t = 'Écrire à jean.dupont@exemple.fr ou appeler le 06 12 34 56 78, le 0612345678, le 06.12.34.56.78, le 06-12-34-56-78, le +33 6 12 34 56 78, le +33(0)6 12 34 56 78 ou le 0033612345678. IBAN : FR76 3000 6000 0112 3456 7890 189.';
  const r = P.buiaMasquer(t);
  assert.equal(r.courriels, 1);
  assert.equal(r.telephones, 7);
  assert.equal(r.iban, 1);
  assert.equal(r.total, 9);
  assert.ok(!/@|\d{2}[ .-]\d{2}[ .-]\d{2}|FR76|0612/.test(r.texte), r.texte);
  assert.match(r.texte, /\[courriel masqué\]/);
  assert.match(r.texte, /\[IBAN masqué\]/);
  assert.match(r.texte, /\[numéro masqué\]/);
});

test('masquage : un IBAN d\'un autre pays est masqué aussi, sans que ses chiffres soient pris pour un téléphone', () => {
  const r = P.buiaMasquer('Virement sur BE68 5390 0754 7034 puis DE89 3704 0044 0532 0130 00.');
  assert.equal(r.iban, 2);
  assert.equal(r.telephones, 0);
});

test('masquage : jamais les noms, les adresses, les dates, les montants, les codes postaux, les références de dossier ni les durées', () => {
  const t = 'Madame Martine Durand, 12 rue des Lilas, 87000 Limoges. Dossier 0000-EX-123 du 12/11/2026. Somme de 287,40 euros sur 15 jours, du 1er mars au 31 mai 2026. Entretien à 14 h 30. N° 2026-1187.';
  const r = P.buiaMasquer(t);
  assert.equal(r.total, 0);
  assert.equal(r.texte, t);
});

test('masquage : sans effet de bord (deuxième passage sans rien changer), texte vide ou étrange accepté', () => {
  const a = P.buiaMasquer('Contact : 06 12 34 56 78 et a.b@c.fr');
  assert.equal(P.buiaMasquer(a.texte).total, 0);
  assert.equal(P.buiaMasquer(a.texte).texte, a.texte);
  [undefined, null, ''].forEach((v) => assert.deepEqual(P.buiaMasquer(v), { texte: '', courriels: 0, iban: 0, telephones: 0, total: 0 }));
  assert.equal(P.buiaMasquer(1234).texte, '1234');
});

test('message de masquage : au singulier, au pluriel, et quand rien n\'est repéré ; il rappelle toujours que nom et adresse restent à masquer', () => {
  assert.equal(P.buiaMessageMasquage(P.buiaMasquer('06 12 34 56 78')), '1 élément masqué. Vos nom et adresse restent à masquer vous-même.');
  assert.equal(P.buiaMessageMasquage(P.buiaMasquer('06 12 34 56 78 et a@b.fr')), '2 éléments masqués. Vos nom et adresse restent à masquer vous-même.');
  assert.equal(P.buiaMessageMasquage(P.buiaMasquer('rien')), 'Aucun numéro ni courriel repéré. Vos nom et adresse restent à masquer vous-même.');
  assert.equal(P.buiaMessageMasquage(null), 'Aucun numéro ni courriel repéré. Vos nom et adresse restent à masquer vous-même.');
});

// ---------------- Lecture des dates ----------------
const FORMULATIONS = [
  ['le 24 novembre 2026', '2026-11-24'], ['Le 1er décembre 2026', '2026-12-1'], ['le 15 JANVIER 2027', '2027-1-15'], ['le 3 déc. 2026', '2026-12-3'],
  ['le 3 sept. 2026', '2026-9-3'], ['le 5 févr. 2027', '2027-2-5'], ['le 8 août 2026', '2026-8-8'], ['le 24/11/2026', '2026-11-24'], ['le 24-11-2026', '2026-11-24'],
  ['le 24.11.2026', '2026-11-24'], ['le 24/11/26', '2026-11-24'], ['le 01/12/2026', '2026-12-1'],
  ['mardi 24 novembre', '2026-11-24'], ['avant le 30 novembre', '2026-11-30'], ['jusqu’au 5 décembre', '2026-12-5'], ['au 5 décembre', '2026-12-5'], ['le 2 janvier', '2027-1-2']
];
test('dates : les formulations courantes d\'un courrier sont lues, accents et majuscules sans importance', () => {
  FORMULATIONS.forEach(([texte, attendu]) => {
    const d = P.buiaLireDates('Merci de répondre ' + texte + ' au plus tard.', AJ);
    if (attendu === null) { assert.equal(d.length, 0, texte); return; }
    assert.equal(d.length, 1, texte + ' => ' + d.length);
    assert.equal(jour(d[0].date), attendu, texte);
  });
});

test('dates sans année : l\'année retenue est la plus proche d\'aujourd\'hui (décembre qui vise janvier : année suivante)', () => {
  const dec = new Date(2026, 11, 20);
  assert.equal(jour(P.buiaLireDates('avant le 5 janvier', dec)[0].date), '2027-1-5');
  assert.equal(jour(P.buiaLireDates('mardi 24 novembre', dec)[0].date), '2026-11-24');
  assert.equal(P.buiaLireDates('avant le 5 janvier', dec)[0].sansAnnee, true);
  assert.equal(P.buiaLireDates('le 5 janvier 2027', dec)[0].sansAnnee, false);
});

test('dates : une période (« du 1er mars au 31 mai 2026 ») ne donne que sa fin ; une date sans année sans contexte clair est ignorée', () => {
  const d = P.buiaLireDates('au titre de la période du 1er mars au 31 mai 2026', AJ);
  assert.deepEqual(d.map((x) => jour(x.date)), ['2026-5-31']);
  assert.deepEqual(P.buiaLireDates('Nous sommes au 5 décembre prochain et le 12 mars je vous écris', AJ).length, 2);
  assert.deepEqual(P.buiaLireDates('la réunion de mai, le 12 ou presque', AJ), []);
});

test('dates : un numéro de téléphone, de dossier ou une date impossible n\'est jamais lu comme une date', () => {
  ['Téléphone : 06.12.34.56.78', 'Appeler le 01.23.45.67.89', 'Dossier 12-03-2026-45', 'Référence 12/11/2026/04', 'le 31/02/2026', 'le 31 février 2026', 'le 45 mars 2026', 'le 12/13/2026'].forEach((t) => {
    assert.deepEqual(P.buiaLireDates(t, AJ), [], t);
  });
});

test('dates : une seule fois par jour, triées dans l\'ordre ; la phrase montrée est celle de la date, pas tout le courrier', () => {
  const d = P.buiaLireDates('Réunion le 30 novembre 2026. Rappel le 24 novembre 2026. Encore le 24/11/2026 pour confirmation.', AJ);
  assert.deepEqual(d.map((x) => jour(x.date)), ['2026-11-24', '2026-11-30']);
  assert.equal(d[0].phrase, 'Rappel le 24 novembre 2026.');
  assert.ok(P.buiaLireDates('x '.repeat(400) + 'le 24 novembre 2026', AJ)[0].phrase.length <= 223);
});

test('dates : texte vide, absent ou étrange : liste vide, jamais d\'erreur', () => {
  [undefined, null, '', 12].forEach((v) => assert.deepEqual(P.buiaLireDates(v, AJ), []));
  assert.equal(P.buiaLireDates('le 24 novembre 2026', undefined).length, 1);
  assert.equal(P.buiaLireDates('le 24 novembre 2026', new Date('x')).length, 1);
});

// ---------------- Délais ----------------
test('délais : écrits en durée, montrés tels quels, jamais convertis en date', () => {
  assert.deepEqual(P.buiaLireDelais(A), ['délai de 15 jours à compter de la réception du présent courrier']);
  assert.deepEqual(P.buiaLireDelais(C), ['délai de deux mois', 'délai de deux mois à compter de la réception du présent courrier']);
  assert.deepEqual(P.buiaLireDelais(B), []);
  assert.deepEqual(P.buiaLireDelais('Vous répondez sous 8 jours ou sous deux semaines.'), ['sous 8 jours', 'sous deux semaines']);
  assert.deepEqual(P.buiaLireDelais('dans un délai de 48 heures'), ['délai de 48 heures']);
  assert.deepEqual(P.buiaLireDelais('le délai de grâce est long'), []);
  [undefined, null, ''].forEach((v) => assert.deepEqual(P.buiaLireDelais(v), []));
});

// ---------------- Alerte ----------------
test('alerte, courrier B : la convocation du lendemain est une date proche, annoncée avec calme', () => {
  const a = P.buiaAlerteDates(B, AJ);
  assert.equal(a.proches.length, 1);
  assert.equal(a.proches[0].jours, 1);
  const p = P.buiaPhrasesProches(a);
  assert.equal(p[0].titre, 'Une date proche a été repérée dans votre courrier : mardi 24 novembre 2026 (demain).');
  assert.equal(p[0].conseil, 'Vérifiez-la dans le courrier.');
  assert.match(p[0].phrase, /^Phrase du courrier : « Nous vous convoquons à un entretien de suivi le mardi 24 novembre 2026/);
  assert.equal(a.autres.length, 1);
  assert.equal(a.autres[0].nature, 'courrier');
  assert.equal(P.buiaTexteAlerteDouce(a), 'Autres dates repérées : 5 novembre 2026 (date du courrier).');
});

test('alerte, courrier A : aucune date proche ; le délai écrit en durée est montré sans date calculée ; la date du courrier n\'est pas une échéance', () => {
  const a = P.buiaAlerteDates(A, AJ);
  assert.equal(a.proches.length, 0);
  assert.deepEqual(P.buiaPhrasesProches(a), []);
  assert.equal(P.buiaLigneRepriseDate(a), '');
  assert.equal(P.buiaTexteAlerteDouce(a), 'Un délai est indiqué : « délai de 15 jours à compter de la réception du présent courrier ». Lisez-le avec attention : l’application ne peut pas en tirer une date. Autres dates repérées : 12 novembre 2026 (date du courrier).');
  assert.equal(a.passeeNonCourrier, false);
});

test('alerte, courrier C : la date passée de la période est signalée avec la démarche à vérifier ; deux délais au pluriel', () => {
  const a = P.buiaAlerteDates(C, AJ);
  assert.equal(a.proches.length, 0);
  assert.equal(a.passeeNonCourrier, true);
  const t = P.buiaTexteAlerteDouce(a);
  assert.match(t, /^Des délais sont indiqués : « délai de deux mois » ; « délai de deux mois à compter de la réception du présent courrier »\. Lisez-les avec attention/);
  assert.match(t, /31 mai 2026 \(passée\)/);
  assert.match(t, /18 novembre 2026 \(date du courrier\)/);
  assert.match(t, /Pour une date passée, vérifiez dans le courrier si une démarche reste à faire\.$/);
});

test('alerte : la frontière est nette : aujourd\'hui et dans 14 jours sont « proches », dans 15 jours et hier ne le sont pas', () => {
  const cas = [[0, true, 'aujourd’hui'], [1, true, 'demain'], [14, true, 'dans 14 jours'], [15, false], [-1, false]];
  cas.forEach(([n, proche, libelle]) => {
    const d = new Date(2026, 10, 23 + n);
    const texte = 'Veuillez venir le ' + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + '.';
    const a = P.buiaAlerteDates(texte, AJ);
    assert.equal(a.proches.length, proche ? 1 : 0, 'jour ' + n);
    if (proche) { assert.equal(P.buiaLibelleJours(a.proches[0].jours), libelle); }
  });
});

test('alerte : passage à l\'heure d\'hiver (25 octobre 2026) sans décalage d\'un jour', () => {
  const a = P.buiaAlerteDates('Rendez-vous le 26 octobre 2026.', new Date(2026, 9, 24));
  assert.equal(a.proches[0].jours, 2);
  assert.equal(P.buiaJoursEntre(new Date(2026, 9, 24, 23, 59), new Date(2026, 9, 26, 0, 1)), 2);
});

test('alerte : sans texte, pas d\'alerte du tout (null) ; un texte sans date donne une alerte vide', () => {
  assert.equal(P.buiaAlerteDates('', AJ), null);
  assert.equal(P.buiaAlerteDates('   \n ', AJ), null);
  assert.equal(P.buiaAlerteDates(undefined, AJ), null);
  const v = P.buiaAlerteDates('Bonjour, merci de me rappeler.', AJ);
  assert.deepEqual(v, { proches: [], autres: [], delais: [], passeeNonCourrier: false });
  assert.equal(P.buiaTexteAlerteDouce(v), '');
  assert.equal(P.buiaTexteAlerteDouce(null), '');
  assert.deepEqual(P.buiaPhrasesProches(null), []);
});

test('reprise de la date dans la demande : une ligne calme, seulement s\'il y a une date proche, sans crochet ni tiret long', () => {
  const l = P.buiaLigneRepriseDate(P.buiaAlerteDates(B, AJ));
  assert.equal(l, 'Une date proche est écrite dans le courrier : 24 novembre 2026. Mets-la tout en haut de ta réponse, en une phrase calme.');
  assert.ok(!/[\[\]{}–—]/.test(l));
  const deux = P.buiaLigneRepriseDate(P.buiaAlerteDates('Le 24 novembre 2026 et le 1er décembre 2026.', AJ));
  assert.match(deux, /24 novembre 2026 ; 1er décembre 2026\./);
  assert.equal(P.buiaLigneRepriseDate(null), '');
});

test('date du jour : « Aujourd\'hui, nous sommes le 23 novembre 2026. » ; sans date fournie, la date réelle, jamais un texte cassé', () => {
  assert.equal(P.buiaLigneDateDuJour(AJ), 'Aujourd’hui, nous sommes le 23 novembre 2026.');
  assert.match(P.buiaLigneDateDuJour(), /^Aujourd’hui, nous sommes le \d{1,2}(er)? [a-zéû]+ \d{4}\.$/);
  assert.match(P.buiaLigneDateDuJour(new Date('x')), /^Aujourd’hui, nous sommes le \d/);
});

test('textes de l\'alerte : sans tiret long, sans « on », sans mot IA ; ton calme (jamais « urgent », « attention danger », « vite »)', () => {
  const textes = [];
  [A, B, C].forEach((c) => { const a = P.buiaAlerteDates(c, AJ); textes.push(P.buiaTexteAlerteDouce(a), P.buiaLigneRepriseDate(a)); P.buiaPhrasesProches(a).forEach((p) => textes.push(p.titre, p.conseil)); });
  textes.push(P.buiaMessageMasquage(P.buiaMasquer('06 12 34 56 78')), P.buiaLigneDateDuJour(AJ));
  textes.filter(Boolean).forEach((x) => {
    assert.ok(!/[–—]/.test(x), x);
    assert.ok(!/(^|[^\p{L}])[Oo]n([^\p{L}]|$)/u.test(x), x);
    assert.ok(!/\bIA\b|urgent|danger|vite|catastroph/i.test(x), x);
  });
});

// ---------------- Branchement ----------------
test('branchement : les scripts du chemin 2 sont chargés dans l\'ordre (données, repérage, papier) ; aucun enregistrement sur l\'appareil', () => {
  const html = lire('index.html');
  const ordre = ['data/buiaModeles.js', 'modules/bien-utiliser-ia/comprendreLogique.js', 'modules/bien-utiliser-ia/modelesLogique.js', 'modules/bien-utiliser-ia/papierLogique.js', 'modules/bien-utiliser-ia/index.js'];
  ordre.forEach((s) => { assert.ok(html.includes('src="' + s + '"'), s); assert.ok(fs.existsSync(path.join(racine, s)), s); });
  for (let i = 1; i < ordre.length; i++) { assert.ok(html.indexOf(ordre[i - 1]) < html.indexOf(ordre[i]), ordre[i - 1] + ' avant ' + ordre[i]); }
  ['modules/bien-utiliser-ia/modelesLogique.js', 'modules/bien-utiliser-ia/papierLogique.js'].forEach((f) => {
    const src = lire(f);
    assert.ok(!/localStorage|sessionStorage|document\.|window\./.test(src.replace(/\/\*[\s\S]*?\*\//g, '')), f + ' : logique pure, sans navigateur');
    assert.ok(!/\(\?<[=!]/.test(src), f + ' : pas d\'expression « lookbehind » (refusée par d\'anciens navigateurs)');
  });
});
