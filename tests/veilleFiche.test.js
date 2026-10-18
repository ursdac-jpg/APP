'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const F = require('../outils/veilleFiche.js');

const CESU_FIXTURE = "---\nid: emploi-cesu\nrayon: emploi\ntitre: \"Travailler chez un particulier avec le CESU\"\npour_qui: \"Utile si vous cherchez ou occupez un emploi chez un particulier : ménage, garde d'enfant, aide à une personne âgée.\"\ntags: [CESU, particulier employeur, services à la personne, aide à domicile]\nterritoire: national\nstatut: actif\nfrein: false\nverifie_le: 2026-10-05\nlexique:\n  - terme: \"CESU\"\n    definition: \"Chèque emploi service universel : moyen simplifié pour un particulier de déclarer et payer un salarié à son domicile.\"\nvoir_aussi_lexique:\n  - cesu\nsources:\n  - francetravail-cesu\n  - code-travail-numerique-cesu\ncollecte: emploi.collecte.md\n---\n\nLe CESU permet à un particulier de vous employer directement à son domicile : ménage, garde d'enfant, soutien scolaire, aide à une personne âgée ou dépendante, entre autres. C'est une façon simplifiée de déclarer un emploi, pas un type de contrat à part : vous avez les mêmes droits qu'un salarié classique (congés payés, protection sociale, cotisations retraite).\n\nConcrètement, l'employeur particulier déclare vos heures et votre salaire sur une plateforme dédiée (Urssaf), qui calcule et prélève les cotisations automatiquement. Vous n'avez pas de bulletin de paie à réclamer séparément : l'attestation d'emploi vaut bulletin de salaire.\n\nC'est un mode d'embauche très répandu dans les services à la personne, un secteur qui recrute beaucoup localement, notamment dans l'aide à domicile. Plusieurs employeurs particuliers peuvent vous employer en même temps, chacun déclarant ses propres heures.\n\nSi un désaccord survient (heures non payées, rupture du contrat), les mêmes règles générales du droit du travail s'appliquent : voir les fiches de ce rayon sur la fin d'un contrat, et le rayon Questions juridiques en cas de litige.\n";

const BASE = path.resolve(__dirname, '..', 'modules', 'comprendre-le-cadre', 'contenu');

// Toutes les fiches réelles (hors README et fichiers de collecte), avec leur rayon.
function fichesReelles() {
  const sortie = [];
  fs.readdirSync(BASE).forEach(function (rayon) {
    const dossier = path.join(BASE, rayon);
    if (!fs.statSync(dossier).isDirectory()) { return; }
    fs.readdirSync(dossier).forEach(function (nom) {
      if (/\.md$/.test(nom) && !/^README|\.collecte\.md$/.test(nom)) { sortie.push({ rayon: rayon, nom: nom, chemin: path.join(dossier, nom) }); }
    });
  });
  return sortie;
}

test('veilleFiche : le dossier contient bien les fiches attendues (garde-fou de l\'essai)', () => {
  assert.ok(fichesReelles().length >= 120);
});

test('veilleFiche : toute fiche réelle se lit, et rien modifié = octet pour octet', () => {
  fichesReelles().forEach(function (f) {
    const t = fs.readFileSync(f.chemin, 'utf8'), fi = F.lire(t);
    assert.ok(fi.ok, f.nom + ' : ' + fi.erreur);
    assert.strictEqual(F.ecrire(fi, {}).texte, t, f.nom + ' : réécriture sans changement différente de l\'original');
  });
});

test('veilleFiche : la forme canonique redonne chaque fiche à l\'identique (sauf les deux fiches « méthode », forme à part)', () => {
  fichesReelles().filter(function (f) { return f.rayon !== 'methode'; }).forEach(function (f) {
    const t = fs.readFileSync(f.chemin, 'utf8'), fi = F.lire(t);
    assert.strictEqual(F.ecrire(fi, {}, { toutCanonique: true }).texte, t, f.rayon + '/' + f.nom + ' : la forme canonique ne redonne pas la fiche');
  });
});

test('veilleFiche : modifier le titre ne change que la ligne du titre', () => {
  const t = CESU_FIXTURE;
  const r = F.ecrire(F.lire(t), { titre: 'Un autre titre : le CESU' });
  assert.ok(r.ok);
  const a = t.split('\n'), b = r.texte.split('\n');
  assert.strictEqual(a.length, b.length);
  const diff = a.map(function (l, i) { return l === b[i] ? null : i; }).filter(function (x) { return x !== null; });
  assert.strictEqual(diff.length, 1);
  assert.strictEqual(b[diff[0]], 'titre: "Un autre titre : le CESU"');
});

test('veilleFiche : modifier le corps ne touche pas l\'en-tête, et garde un seul saut de ligne final', () => {
  const t = CESU_FIXTURE, fi = F.lire(t);
  const r = F.ecrire(fi, { corps: '\n\nPremier paragraphe.\n\nSecond paragraphe.\n\n\n' });
  assert.ok(r.ok);
  const f2 = F.lire(r.texte);
  assert.strictEqual(f2.entete.map(function (b) { return b.brut; }).join('\n'), fi.entete.map(function (b) { return b.brut; }).join('\n'));
  assert.strictEqual(f2.corpsBrut, '\nPremier paragraphe.\n\nSecond paragraphe.\n');
});

test('veilleFiche : guillemets français acceptés et relus identiques ; guillemet droit ou saut de ligne refusés', () => {
  const t = CESU_FIXTURE;
  const r = F.ecrire(F.lire(t), { titre: 'Le « CESU » simple', lexique: [{ terme: 'CESU', definition: 'Un « chèque » simple' }] });
  const c = F.champs(F.lire(r.texte));
  assert.strictEqual(c.titre, 'Le « CESU » simple');
  assert.deepStrictEqual(c.lexique, [{ terme: 'CESU', definition: 'Un « chèque » simple' }]);
  assert.strictEqual(F.ecrire(F.lire(t), { titre: 'Le "CESU"' }).ok, false);
  assert.strictEqual(F.ecrire(F.lire(t), { lexique: [{ terme: 'CESU', definition: 'Un "chèque"' }] }).ok, false);
  assert.strictEqual(F.ecrire(F.lire(t), { pour_qui: 'Deux\nlignes' }).ok, false);
});

test('veilleFiche : listes (sources, révisions, ce qui change souvent) réécrites au bon format', () => {
  const t = CESU_FIXTURE;
  const r = F.ecrire(F.lire(t), { sources: ['francetravail-cesu'], revisions: ['2026-10 : plafond mis à jour'], ce_qui_change_souvent: [] });
  assert.ok(/^sources:\n  - francetravail-cesu\n/m.test(r.texte));
  assert.ok(/^revisions:\n  - "2026-10 : plafond mis à jour"\n/m.test(r.texte));
  assert.ok(/^ce_qui_change_souvent: \[\]\n/m.test(r.texte));
});

test('veilleFiche : un champ absent qui est ajouté se place avant « collecte »', () => {
  const t = CESU_FIXTURE;
  const r = F.ecrire(F.lire(t), { structures: ['asso-exemple'] });
  assert.ok(r.ok);
  assert.ok(/^structures:\n  - asso-exemple\ncollecte: /m.test(r.texte));
});

test('veilleFiche : identifiant, rayon et collecte refusés ; champ inconnu refusé', () => {
  const t = CESU_FIXTURE;
  ['id', 'rayon', 'collecte'].forEach(function (k) {
    const ch = {}; ch[k] = 'autre';
    assert.strictEqual(F.ecrire(F.lire(t), ch).ok, false, k);
  });
  assert.strictEqual(F.ecrire(F.lire(t), { fantaisie: 'x' }).ok, false);
});

test('veilleFiche : une fiche aux fins de ligne Windows garde ses fins de ligne, après modification du titre et du corps', () => {
  const t = CESU_FIXTURE.replace(/\n/g, '\r\n');
  assert.strictEqual(F.ecrire(F.lire(t), {}).texte, t);
  assert.strictEqual(F.ecrire(F.lire(t), {}, { toutCanonique: true }).texte, t);
  const r = F.ecrire(F.lire(t), { titre: 'Titre de l\'essai', corps: 'Un.\n\nDeux.' });
  assert.ok(r.ok);
  assert.strictEqual(r.texte.split('\r\n').length, r.texte.split('\n').length, 'fins de ligne mélangées après modification');
});

test('veilleFiche : un texte sans en-tête ou aux fins de ligne mélangées est refusé proprement', () => {
  assert.strictEqual(F.lire('Pas d\'en-tête').ok, false);
  assert.strictEqual(F.lire('---\r\nid: a\n---\n\ncorps').ok, false);
});

// ---------- appliquerModification : une demande complète ----------
const CX = { aujourdhui: '2026-10-18', sourcesConnues: ['francetravail-cesu', 'code-travail-numerique-cesu', 'legifrance'], lexiqueIds: ['cesu', 'cdd'] };
function demande(ch, plus) { return Object.assign({ changements: ch, datation: 'garder' }, plus || {}); }

test('appliquerModification : un titre changé sans phrase est refusé, avec la phrase il passe et ajoute la révision du mois', () => {
  const t = CESU_FIXTURE;
  assert.strictEqual(F.appliquerModification(t, demande({ titre: 'Nouveau titre' }), CX).ok, false);
  const r = F.appliquerModification(t, demande({ titre: 'Nouveau titre' }, { revision: 'titre plus court' }), CX);
  assert.ok(r.ok, r.erreur);
  const c = F.champs(F.lire(r.texte));
  assert.strictEqual(c.titre, 'Nouveau titre');
  assert.deepStrictEqual(c.revisions, ['2026-10 : titre plus court']);
  assert.strictEqual(c.verifie_le, '2026-10-05', 'la date ne change jamais toute seule');
  assert.strictEqual(r.resume.action, 'modifiée');
});

test('appliquerModification : « simple correction de forme » dispense de la phrase et n\'ajoute aucune révision', () => {
  const t = CESU_FIXTURE;
  const r = F.appliquerModification(t, demande({ pour_qui: 'Utile si vous travaillez chez un particulier.' }, { formeSeule: true }), CX);
  assert.ok(r.ok, r.erreur);
  assert.ok(!(F.champs(F.lire(r.texte)).revisions || []).length, 'aucune ligne de révision ajoutée');
  const r2 = F.appliquerModification(t, demande({ titre: 'Titre corrigé' }, { formeSeule: true }), CX);
  assert.ok(r2.ok);
  assert.strictEqual(r2.resume.phrase, 'simple correction de forme');
});

test('appliquerModification : redater met la date du jour, sans autre changement = action « redatée »', () => {
  const t = CESU_FIXTURE;
  const r = F.appliquerModification(t, { changements: {}, datation: 'redater' }, CX);
  assert.ok(r.ok, r.erreur);
  assert.strictEqual(F.champs(F.lire(r.texte)).verifie_le, '2026-10-18');
  assert.strictEqual(r.resume.action, 'redatée');
  assert.strictEqual(F.appliquerModification(r.texte, { changements: {}, datation: 'redater' }, CX).ok, false, 'déjà redatée aujourd\'hui : rien à changer');
});

test('appliquerModification : rien qui change = refusé ; une valeur identique n\'est pas une modification', () => {
  const t = CESU_FIXTURE, c = F.champs(F.lire(t));
  assert.strictEqual(F.appliquerModification(t, demande({}), CX).ok, false);
  assert.strictEqual(F.appliquerModification(t, demande({ titre: c.titre, tags: c.tags, corps: F.corpsDe(F.lire(t)) }), CX).ok, false);
});

test('appliquerModification : date, révisions et verrouillés ne se fixent jamais directement', () => {
  const t = CESU_FIXTURE;
  ['verifie_le', 'revisions', 'retire_le', 'id', 'rayon', 'collecte'].forEach(function (k) {
    const ch = {}; ch[k] = 'x';
    assert.strictEqual(F.appliquerModification(t, demande(ch), CX).ok, false, k);
  });
});

test('appliquerModification : tiret long, titre vide, territoire inconnu, source ou mot du Lexique inconnus refusés', () => {
  const t = CESU_FIXTURE, tl = String.fromCharCode(0x2014);
  const avec = { revision: 'essai' };
  assert.strictEqual(F.appliquerModification(t, demande({ corps: 'Un ' + tl + ' tiret' }, avec), CX).ok, false);
  assert.strictEqual(F.appliquerModification(t, demande({ titre: '  ' }, avec), CX).ok, false);
  assert.strictEqual(F.appliquerModification(t, demande({ territoire: 'ailleurs' }, avec), CX).ok, false);
  assert.strictEqual(F.appliquerModification(t, demande({ sources: ['francetravail-cesu', 'inconnue-au-registre'] }, avec), CX).ok, false);
  assert.strictEqual(F.appliquerModification(t, demande({ sources: ['francetravail-cesu', 'legifrance'] }, avec), CX).ok, true);
  assert.strictEqual(F.appliquerModification(t, demande({ voir_aussi_lexique: ['mot-introuvable'] }, avec), CX).ok, false);
  assert.strictEqual(F.appliquerModification(t, demande({ lexique: [{ terme: 'CESU', definition: '' }] }, avec), CX).ok, false);
});

test('appliquerModification : retirer demande une raison, garde le texte, puis réactiver enlève les champs de retrait', () => {
  const t = CESU_FIXTURE;
  assert.strictEqual(F.appliquerModification(t, demande({ statut: 'retire' }), CX).ok, false);
  const r = F.appliquerModification(t, demande({ statut: 'retire', retire_raison: 'règle abrogée', remplace_par: 'emploi-csp' }), CX);
  assert.ok(r.ok, r.erreur);
  const f = F.lire(r.texte), c = F.champs(f);
  assert.strictEqual(c.statut, 'retire'); assert.strictEqual(c.retire_le, '2026-10-18'); assert.strictEqual(c.retire_raison, 'règle abrogée'); assert.strictEqual(c.remplace_par, 'emploi-csp');
  assert.strictEqual(r.resume.action, 'retirée');
  assert.strictEqual(F.corpsDe(f), F.corpsDe(F.lire(t)), 'le texte est gardé');
  assert.ok(/^remplace_par: emploi-csp\ncollecte: /m.test(r.texte), 'les champs de retrait sont placés avant « collecte »');
  const r2 = F.appliquerModification(r.texte, demande({ statut: 'actif' }), CX);
  assert.ok(r2.ok, r2.erreur);
  assert.strictEqual(r2.resume.action, 'réactivée');
  assert.strictEqual(r2.texte, t, 'retirer puis réactiver redonne la fiche d\'origine');
});

test('appliquerModification : une fiche sans champ « revisions » en reçoit un à la première phrase', () => {
  const t = CESU_FIXTURE;
  assert.ok(!/^revisions:/m.test(t), 'la fiche d\'essai n\'a pas de champ révisions');
  const r = F.appliquerModification(t, demande({ pour_qui: 'Nouvelle phrase « utile si ».' }, { revision: 'phrase d\'accroche' }), CX);
  assert.ok(r.ok, r.erreur);
  assert.ok(/^revisions:\n  - "2026-10 : phrase d'accroche"\n/m.test(r.texte));
});

// ---------- phrase du bouton vers « Comprendre les chiffres » (voir_aussi_chiffres), 2026-10-18 ----------
test('voir_aussi_chiffres : ajouter une phrase l\'écrit avant « collecte », sans toucher aux autres blocs ni demander de phrase de révision', () => {
  const t = CESU_FIXTURE;
  const r = F.appliquerModification(t, demande({ voir_aussi_chiffres: 'Comment on est embauché ici' }), CX);
  assert.ok(r.ok, r.erreur);
  assert.ok(/voir_aussi_chiffres: "Comment on est embauché ici"\ncollecte: emploi.collecte.md/.test(r.texte));
  const avant = t.split('\n'), apres = r.texte.split('\n');
  assert.strictEqual(apres.length, avant.length + 1, 'une seule ligne de plus');
  assert.deepStrictEqual(r.resume.champs, ['voir_aussi_chiffres']);
  assert.strictEqual(F.champs(F.lire(r.texte)).voir_aussi_chiffres, 'Comment on est embauché ici');
});

test('voir_aussi_chiffres : changer la phrase la remplace ; une phrase vide retire le champ ; vide sur une fiche sans phrase ne change rien', () => {
  const avec = F.appliquerModification(CESU_FIXTURE, demande({ voir_aussi_chiffres: 'Voir où en est l\'accès aux soins ici' }), CX).texte;
  const r1 = F.appliquerModification(avec, demande({ voir_aussi_chiffres: '  Comment on est embauché ici  ' }), CX);
  assert.ok(r1.ok, r1.erreur);
  assert.strictEqual((r1.texte.match(/^voir_aussi_chiffres:/gm) || []).length, 1);
  assert.ok(/^voir_aussi_chiffres: "Comment on est embauché ici"$/m.test(r1.texte), 'espaces autour retirés');
  const r2 = F.appliquerModification(avec, demande({ voir_aussi_chiffres: '' }), CX);
  assert.ok(r2.ok, r2.erreur);
  assert.strictEqual(r2.texte, CESU_FIXTURE, 'retirer la phrase redonne exactement la fiche d\'origine');
  assert.deepStrictEqual(r2.resume.champs, ['voir_aussi_chiffres']);
  assert.strictEqual(F.appliquerModification(CESU_FIXTURE, demande({ voir_aussi_chiffres: '   ' }), CX).ok, false, 'rien à changer');
  assert.strictEqual(F.appliquerModification(avec, demande({ voir_aussi_chiffres: 'Voir où en est l\'accès aux soins ici' }), CX).ok, false, 'même phrase : rien à changer');
});

test('voir_aussi_chiffres : refus d\'une phrase trop longue, avec « < », « > » ou « & », un guillemet droit, un saut de ligne, un tiret long, ou qui n\'est pas un texte', () => {
  const ko = (v) => F.appliquerModification(CESU_FIXTURE, demande({ voir_aussi_chiffres: v }), CX);
  assert.strictEqual(ko('x'.repeat(F.LONGUEUR_MAX_PHRASE_CHIFFRES + 1)).ok, false);
  assert.ok(ko('x'.repeat(F.LONGUEUR_MAX_PHRASE_CHIFFRES)).ok, 'la longueur maximale passe');
  ['Voir <b>ici</b>', 'Tout & rien ici', 'Plus > moins ici'].forEach((p) => { const r = ko(p); assert.strictEqual(r.ok, false, p); assert.match(r.erreur, /< | >|&/); });
  assert.strictEqual(ko('Il dit "ici"').ok, false);
  assert.strictEqual(ko('Ligne un\nligne deux').ok, false);
  assert.strictEqual(ko('Voir ' + String.fromCharCode(0x2014) + ' ici').ok, false);
  assert.strictEqual(ko(42).ok, false);
});

test('voir_aussi_chiffres : les 7 phrases actuelles des fiches réelles respectent la longueur maximale et les signes permis (aucune fiche réelle ne serait refusée)', () => {
  let n = 0;
  fichesReelles().forEach(function (f) {
    const p = F.champs(F.lire(fs.readFileSync(f.chemin, 'utf8'))).voir_aussi_chiffres;
    if (typeof p !== 'string' || !p) { return; }
    n++;
    assert.ok(p.length <= F.LONGUEUR_MAX_PHRASE_CHIFFRES, f.nom + ' : ' + p.length + ' caractères');
    assert.ok(!/[<>&"]/.test(p), f.nom);
  });
  assert.ok(n >= 7, 'au moins 7 fiches ont une phrase');
});
