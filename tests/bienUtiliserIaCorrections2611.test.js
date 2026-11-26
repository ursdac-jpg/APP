// Module « Bien utiliser l'IA » : corrections du 26/11/2026, après l'essai fait par Claude avec ChatGPT le 25/11/2026 (validées par Denis).
// Détail des défauts constatés : docs/RESULTATS_ESSAIS_BIEN_UTILISER_L_IA_2026-11-25.md.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const B = require('../modules/bien-utiliser-ia/blocs.js');
const L = require('../modules/bien-utiliser-ia/modeleLogique.js');

const racine = path.join(__dirname, '..');
const blocs = (id) => B.buiaLireBlocs(fs.readFileSync(path.join(racine, L.buiaDefModele(id).fichier), 'utf8')).blocs;
const assembler = (id, champs, choix) => {
  const s = L.buiaSaisieParDefaut(id);
  Object.assign(s.champs, champs); Object.assign(s.choix, choix || {}); s.confirme = true;
  return L.buiaAssemblerModele(id, blocs(id), s, { aujourdhui: new Date(2026, 10, 26, 10, 0, 0), alerte: null, reprise: false });
};

test('modèle 1 : ne rien dire de ce qu’une expérience a appris si la personne ne l’a pas écrit', () => {
  const r = assembler(1, { poste: 'boulanger', entreprise: 'une boulangerie', parcours: 'un an en rayon' }, { objectif: 'immersion' });
  assert.match(r.texte, /ce qu’une expérience m’a appris ou fait découvrir/);
});

test('modèle 3, variante « trou » : aucune qualité ajoutée, rien après les deux questions', () => {
  const r = assembler(3, { poste: 'agent d’entretien', parcours: 'deux emplois', trou: 'un an sans emploi' }, { objectif: 'trou' });
  assert.match(r.texte, /N’ajoute aucune qualité ni aucun trait de caractère/);
  assert.match(r.texte, /n’ajoute rien après/);
});

test('modèle 6 : les accords de genre sont évités, pour les quatre buts', () => {
  ['repondre', 'relancer', 'refuser', 'excuser'].forEach((o) => {
    const r = assembler(6, { destinataire: 'mon formateur', message: 'un retard' }, { objectif: o });
    assert.match(r.texte, /éviter les accords qui dépendent de mon genre/, o);
  });
});

test('modèle 7 : les références sont gardées et ce qui est retiré est dit, pour les trois transformations', () => {
  ['simple', 'court', 'pose'].forEach((t) => {
    const r = assembler(7, { texte: 'Article 4 du règlement.' }, { transformation: t });
    assert.match(r.texte, /Garde telles quelles les références du texte/, t);
    assert.match(r.texte, /ce que tu as retiré ou regroupé/, t);
    if (t !== 'court') { assert.match(r.texte, /références?.{0,60}recopiées mot pour mot/, t); }
  });
});

test('modèles 10 et 11 : qui fait quoi seulement si les notes le disent ; mots de la personne non transformés', () => {
  const r10 = assembler(10, { notes: 'Entretien.' });
  assert.match(r10.texte, /N’écris qui s’en charge que si les notes le disent/);
  assert.doesNotMatch(r10.texte, /par qui et pour quand/);
  assert.match(r10.texte, /ne les transforme pas en difficulté/);
  const r11 = assembler(11, { notes: 'Entretien.' });
  assert.match(r11.texte, /n’écris qui s’en charge que si les notes le disent/);
  assert.match(r11.texte, /la personne a dit : » suivi de la citation/);
  assert.match(r11.texte, /écris-la à l’infinitif, sans l’attribuer à personne/);
  assert.match(r11.texte, /ne transforme pas ses mots en difficulté/);
});

test('modèle 13 : le déroulé garde les six temps et demande l’addition des durées ; la variante « exercices » ne refait pas le déroulé', () => {
  const champs = { theme: 'préparer un entretien', public: 'six personnes', objectif: 'se présenter en deux minutes' };
  const d = assembler(13, champs, { type: 'deroule' });
  assert.match(d.texte, /Organise l’atelier en six temps/);
  assert.match(d.texte, /si le total n’est pas égal à la durée de l’atelier, corrige les durées/);
  assert.doesNotMatch(d.texte, /trois à cinq exercices/);
  const e = assembler(13, champs, { type: 'exercices' });
  assert.doesNotMatch(e.texte, /six temps/);
  assert.match(e.texte, /trois à cinq exercices/);
  assert.match(e.texte, /sans réécrire tout le déroulé/);
  assert.match(e.texte, /si le total n’est pas égal à la durée de l’atelier, corrige les durées/);
  assert.equal(e.aCompleter, false);
  assert.deepEqual(L.buiaVerifierBlocsModele(13, B.buiaLireBlocs(fs.readFileSync(path.join(racine, L.buiaDefModele(13).fichier), 'utf8'))), []);
});

test('modèle 13 : l’aide du champ « objectif » invite à commencer par un verbe', () => {
  const ch = L.buiaDefModele(13).champs.filter((c) => c.id === 'objectif')[0];
  assert.match(ch.aide, /en commençant par un verbe/);
});
