/* Le repère « Pré-validée » des fiches du sas (outils/veillePrevalidees.js) : l'empreinte, la lecture, l'écriture et l'annotation des cartes.
   Contrôle aussi le vrai fichier outils/sas/prevalidees.txt : lisible et sans doublon. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const prev = require('../outils/veillePrevalidees.js');

test('l\'empreinte ignore la source, la date, l\'identifiant et l\'ordre des colonnes, mais pas le contenu', () => {
  const a = { id: 'x', nom: 'Cultura', site: 'https://www.cultura.com', source: 'une source', date: '' };
  assert.equal(prev.empreinte(a), prev.empreinte({ site: 'https://www.cultura.com', nom: 'Cultura', id: 'y', source: 'autre', date: '2026-10-31' }));
  assert.notEqual(prev.empreinte(a), prev.empreinte(Object.assign({}, a, { site: 'https://www.cultura.fr' })));
  assert.match(prev.empreinte(a), /^[0-9a-f]{10}$/);
});

test('lire refuse une ligne illisible et accepte les commentaires', () => {
  assert.equal(prev.lire('# commentaire\n\nemployeurs | a-b | texte-denis | 0123456789\n').lignes.length, 1);
  assert.equal(prev.lire('employeurs | a-b | inconnue | 0123456789').ok, false);
  assert.equal(prev.lire('autre | a-b | texte-denis | 0123456789').ok, false);
  assert.equal(prev.lire('employeurs | a-b | texte-denis | xyz').ok, false);
  assert.equal(prev.lire('employeurs | a-b | texte-denis').ok, false);
});

test('ecrire ajoute, remplace et retire les fiches qui ne sont plus dans le sas', () => {
  const v = { nom: 'N', site: 'https://s.fr' };
  let t = prev.ecrire('', 'employeurs', [{ id: 'a', base: 'texte-denis', valeurs: v }, { id: 'b', base: 'denis-main', valeurs: v }], ['a', 'b', 'c']);
  assert.equal(prev.lire(t).lignes.length, 2);
  // « b » n'est plus dans le sas (publiée) : sa ligne disparaît ; « a » est remplacée sans doublon
  t = prev.ecrire(t, 'employeurs', [{ id: 'a', base: 'appel-denis', valeurs: v }], ['a', 'c']);
  const l = prev.lire(t).lignes;
  assert.deepEqual(l.map(x => x.id + ':' + x.base), ['a:appel-denis']);
  // les lignes d'un autre sas ne sont pas touchées
  t = prev.ecrire(t, 'lieux', [{ id: 'z', base: 'denis-main', valeurs: v }], ['z']);
  t = prev.ecrire(t, 'employeurs', [], ['a']);
  assert.equal(prev.lire(t).lignes.length, 2);
  assert.throws(() => prev.ecrire('', 'employeurs', [{ id: 'q', base: 'texte-denis', valeurs: v }], ['a']), /absente du sas/);
  assert.throws(() => prev.ecrire('', 'employeurs', [{ id: 'a', base: 'nimporte', valeurs: v }], ['a']), /inconnue/);
});

test('annoter marque une carte pré-validée, et « modifiée depuis » si son contenu a changé', () => {
  const valeurs = { nom: 'N', site: 'https://s.fr' };
  const t = prev.ecrire('', 'employeurs', [{ id: 'a', base: 'texte-denis', valeurs: valeurs }, { id: 'b', base: 'texte-denis', valeurs: valeurs }], ['a', 'b']);
  const cartes = [{ id: 'a', valeurs: valeurs }, { id: 'b', valeurs: { nom: 'N', site: 'https://autre.fr' } }, { id: 'c', valeurs: valeurs }];
  assert.equal(prev.annoter('employeurs', cartes, t).annotees, 2);
  assert.equal(cartes[0].prevalidee.valide, true);
  assert.match(cartes[0].prevalidee.libelle, /copiés par Denis/);
  assert.equal(cartes[1].prevalidee.valide, false);
  assert.equal(cartes[2].prevalidee, undefined);
});

test('le vrai fichier des fiches pré-validées est lisible et sans doublon', () => {
  const racine = path.join(__dirname, '..');
  const f = path.join(racine, ...prev.CHEMIN);
  if (!fs.existsSync(f)) { return; }
  const lu = prev.lire(fs.readFileSync(f, 'utf8'));
  assert.equal(lu.ok, true, lu.erreur);
  const vus = {};
  lu.lignes.forEach(x => { assert.equal(vus[x.sas + '|' + x.id], undefined, 'fiche en double : ' + x.id); vus[x.sas + '|' + x.id] = true; });
  // Une fiche modifiée ou publiée depuis son contrôle est un cas NORMAL (l'outil l'affiche « modifiée depuis ») : on ne le compte pas comme une erreur.
});

test('baseDepuisSource : seulement la marque « Via prospection » avec « vérifiées à la main le » suivi d\'une date', () => {
  assert.equal(prev.baseDepuisSource({ source: 'Via prospection ; Registre des entreprises (Sirene) ; coordonnées vérifiées à la main le 12/10/2026' }), 'denis-main');
  assert.equal(prev.baseDepuisSource({ source: 'Via prospection ; coordonnées vérifiées à la main le ' }), '');
  assert.equal(prev.baseDepuisSource({ source: 'adresses données par Denis le 12/10/2026' }), '');
  assert.equal(prev.baseDepuisSource({}), '');
});

test('le niveau : « main » pour Denis, « assistant » pour un site testé par l\'assistant', () => {
  const v = { nom: 'N' };
  const t = prev.ecrire('', 'employeurs', [{ id: 'a', base: 'denis-main', valeurs: v }, { id: 'b', base: 'test-et-assistant', valeurs: v }], ['a', 'b']);
  const cartes = [{ id: 'a', valeurs: v }, { id: 'b', valeurs: v }];
  prev.annoter('employeurs', cartes, t);
  assert.deepEqual(cartes.map((c) => c.prevalidee.niveau), ['main', 'assistant']);
});
