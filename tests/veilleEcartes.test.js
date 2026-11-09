const test = require('node:test');
const assert = require('node:assert');
const E = require('../outils/veilleEcartes.js');

// Historique de ce que Denis a écarté (09/11/2026, consigne 185) : reconnaissance de « la même information », remise, compteur.
const ANCIEN = { id: 'x1', mois: '2026-10', domaine: 'Emploi et contrats de travail', intitule: 'Certification des compétences acquises dans un mandat électif local', nature: 'décret, publié le 2026-10-07', en_vigueur: '', concerne: '', ce_qui_change: '', source_titre: '', source_url: '' };
const REVENU = { mois: '2026-10', domaine: 'Emploi et contrats de travail', intitule: 'Formations aux compétences acquises dans un mandat électif local', nature: 'décret n° 2026-929 du 6 octobre 2026, publié le 2026-10-07', en_vigueur: '2026-10-08', ce_qui_change: 'Les compétences acquises peuvent donner lieu à une certification.', source_url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054956301' };
const AUTRE = { mois: '2026-10', domaine: 'Emploi et contrats de travail', intitule: 'Congé d\'accompagnement spécifique après un congé de reclassement', nature: 'décret n° 2026-972 du 20 octobre 2026', en_vigueur: '2026-10-22', ce_qui_change: 'Une convention est remise 15 jours avant la fin du congé.', source_url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000055002852' };

test('le cas réel : le même décret qui revient sous un autre intitulé est reconnu (même mois, même domaine, titre très proche)', () => {
  const e = E.creerEntree('changement', ANCIEN, 'public', '', '2026-11-06');
  assert.ok(E.trouver([e], 'changement', REVENU), 'le mandat électif ressorti est reconnu');
  assert.strictEqual(E.trouver([e], 'changement', AUTRE), null, 'un autre décret du même mois et du même domaine n\'est pas bloqué');
});

test('une page d\'actualités qui sert de source à plusieurs changements ne bloque pas les autres', () => {
  const page = 'https://www.info.gouv.fr/actualite/ce-qui-change-en-octobre-2026';
  const e = E.creerEntree('changement', { id: 'p1', mois: '2026-10', domaine: 'Accès aux soins', intitule: 'Cups et culottes menstruelles remboursées', source_url: page }, 'public', '', '2026-11-09');
  assert.strictEqual(E.trouver([e], 'changement', { mois: '2026-10', domaine: 'Logement', intitule: 'Revalorisation des aides au logement de 1,15 %', source_url: page }), null);
  assert.ok(E.trouver([e], 'changement', { mois: '2026-11', domaine: 'Autre', intitule: 'Cups et culottes menstruelles remboursées par l\'Assurance maladie', source_url: '' }), 'même intitulé, même sujet : reconnu');
});

test('« fausse ou périmée » ne bloque que cette version du texte', () => {
  const e = E.creerEntree('changement', REVENU, 'faux', '', '2026-11-09');
  assert.ok(E.trouver([e], 'changement', REVENU), 'le même texte est bloqué');
  assert.strictEqual(E.trouver([e], 'changement', Object.assign({}, REVENU, { ce_qui_change: 'Version corrigée : la date a changé.', en_vigueur: '2026-11-01' })), null, 'une version corrigée peut revenir');
});

test('fiches : un retrait se reconnaît à la fiche ; une mise à jour à la fiche ET au contenu ; une nouvelle fiche au titre', () => {
  const maj = { genre: 'maj', fiche: 'logement-aides', titre: 'Aides au logement', revision: 'revalorisation du 1er octobre ajoutée', champs: { texte: 'A' }, sources_detail: [] };
  const e = E.creerEntree('fiche', Object.assign({ id: 'maj-logement-aides' }, maj), 'couvert', '', '2026-11-09');
  assert.ok(E.trouver([e], 'fiche', Object.assign({}, maj)), 'même mise à jour');
  assert.ok(E.trouver([e], 'fiche', Object.assign({}, maj, { champs: { texte: 'B' } })), 'même révision, texte reformulé');
  assert.strictEqual(E.trouver([e], 'fiche', Object.assign({}, maj, { revision: 'étudiants étrangers précisés', champs: { texte: 'C' } })), null, 'une autre mise à jour de la même fiche passe');
  assert.strictEqual(E.trouver([e], 'fiche', Object.assign({}, maj, { genre: 'ret' })), null, 'un autre genre passe');
  const nouv = { genre: 'nouv', fiche: 'sante-soutien-psy', titre: 'Voir un psychologue avec Mon soutien psy', champs: { texte: 'T' } };
  const en = E.creerEntree('fiche', Object.assign({ id: 'nouv-sante-soutien-psy' }, nouv), 'public', '', '2026-11-09');
  assert.ok(E.trouver([en], 'fiche', Object.assign({}, nouv, { fiche: 'sante-mon-soutien-psy' })), 'même titre, autre identifiant');
});

test('le fichier s\'écrit et se relit ; le compteur monte ; remettre sort l\'entrée et rend l\'original', () => {
  const e = E.creerEntree('changement', ANCIEN, 'autre', 'trop local', '2026-11-06');
  let r = E.appliquer('', [{ op: 'ajouter', entree: e }]); assert.ok(r.ok);
  r = E.appliquer(r.texte, [{ op: 'toucher', id: e.id, date: '2026-11-09' }, { op: 'toucher', id: e.id, date: '2026-11-10' }]);
  const lue = E.parser(r.texte); assert.strictEqual(lue.length, 1);
  assert.deepStrictEqual(lue[0].reproposee, { nb: 2, derniere: '2026-11-10' });
  assert.strictEqual(lue[0].precision, 'trop local');
  r = E.appliquer(r.texte, [{ op: 'precision', id: e.id, motif: 'public', precision: '' }]); assert.strictEqual(E.parser(r.texte)[0].motif, 'public');
  r = E.appliquer(r.texte, [{ op: 'retirer', id: e.id }]);
  assert.strictEqual(r.remis.length, 1); assert.deepStrictEqual(r.remis[0].original, ANCIEN); assert.strictEqual(E.parser(r.texte).length, 0);
  assert.strictEqual(E.appliquer(r.texte, [{ op: 'retirer', id: 'inconnu' }]).ok, false);
  assert.ok(!/—|–/.test(E.EN_TETE));
});
