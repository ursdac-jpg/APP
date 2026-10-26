'use strict';
// Les miniatures de la galerie des modèles de CV (data/miniatures/*.json) suivent le registre du banc de rendu (scripts/rendu/registre.json).
// Si un modèle change, le banc (navigateur : scripts/rendu/banc.js, mode « vérifier ») le signale ; ce test garde l'accord entre les fichiers.
// Régénération : voir l'en-tête de scripts/rendu/banc.js.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const racine = path.join(__dirname, '..');
const registre = JSON.parse(fs.readFileSync(path.join(racine, 'scripts', 'rendu', 'registre.json'), 'utf8'));
const dossierMini = path.join(racine, 'data', 'miniatures');
const fichier = (cle) => path.join(dossierMini, cle.replace(':', '_') + '.json');

test('chaque modèle du registre a sa miniature, qui porte l\'empreinte du registre', () => {
  const cles = Object.keys(registre);
  assert.ok(cles.length >= 37, 'le registre doit couvrir tous les modèles de la galerie');
  const manquants = cles.filter((c) => !fs.existsSync(fichier(c)));
  assert.deepStrictEqual(manquants, [], 'miniatures manquantes : ' + manquants.join(', '));
  const perimees = cles.filter((c) => JSON.parse(fs.readFileSync(fichier(c), 'utf8')).hash !== registre[c].html);
  assert.deepStrictEqual(perimees, [], 'miniatures périmées (régénérer avec le banc) : ' + perimees.join(', '));
});

test('aucune miniature sans modèle dans le registre', () => {
  // Une miniature de base par modèle (plus de miniatures de variantes : décision 2026-10-20, les formes se voient sur l'aperçu).
  const attendus = new Set(Object.keys(registre).map((c) => c.replace(':', '_') + '.json'));
  const en_trop = fs.readdirSync(dossierMini).filter((f) => f.endsWith('.json') && !attendus.has(f));
  assert.deepStrictEqual(en_trop, [], 'miniatures sans modèle : ' + en_trop.join(', '));
});

test('chaque miniature est prête à être montrée : du HTML, un style converti pour un compartiment, pas de zone modifiable', () => {
  Object.keys(registre).forEach((c) => {
    const d = JSON.parse(fs.readFileSync(fichier(c), 'utf8'));
    assert.ok(d.html && d.html.length > 1000, c + ' : HTML vide');
    assert.ok(d.css && d.css.length > 1000, c + ' : style vide');
    assert.ok(!/:root\b/.test(d.css), c + ' : le style doit viser :host, pas :root');
    assert.ok(!/contenteditable/.test(d.html), c + ' : zone modifiable dans la miniature');
  });
});

test('tous les modèles de la galerie de l\'application ont une entrée dans le registre', () => {
  const source = fs.readFileSync(path.join(racine, 'js', 'app.js'), 'utf8');
  const bloc = (nom) => source.slice(source.indexOf('var ' + nom + ' = ['), source.indexOf('];', source.indexOf('var ' + nom + ' = [')));
  const ids = (nom, prefixe) => (bloc(nom).match(/^\s*\['([^']+)'/gm) || []).map((l) => prefixe + l.match(/\['([^']+)'/)[1]);
  const attendus = ids('_MEP_GALERIE_CREATIF', 'creatif:').concat(ids('_MEP_GALERIE_SOBRE', 'sobre:'));
  assert.ok(attendus.length >= 37, 'la lecture de la galerie doit trouver les 37 modèles, trouvé ' + attendus.length);
  const sans = attendus.filter((c) => !(c in registre));
  assert.deepStrictEqual(sans, [], 'modèles de la galerie sans entrée au registre (lancer le banc, mode régénérer) : ' + sans.join(', '));
});

test('bords : la miniature de base dit son bord de départ, et les modèles à choix sont ceux de la table des capacités', () => {
  const capacites = JSON.parse(fs.readFileSync(path.join(racine, 'scripts', 'rendu', 'capacites.json'), 'utf8'));
  Object.keys(registre).forEach((c) => {
    const d = JSON.parse(fs.readFileSync(fichier(c), 'utf8'));
    assert.strictEqual(d.bord, registre[c].bord || undefined, c + ' : la miniature ne dit pas son bord de colonne');
    assert.strictEqual(d.bandeau, registre[c].bandeau || undefined, c + ' : la miniature ne dit pas son bord de bandeau');
    if (registre[c].bord) { assert.ok(['droit', 'vallonne'].includes(registre[c].bord), c + ' : bord inconnu'); }
    if (registre[c].bandeau) { assert.ok(['droit', 'arrondi', 'vallonne', 'pointe', 'diagonale', 'coin', 'demiovale', 'vague2', 'creneaux', 'carte', 'pilule', 'ruban', 'rubanCourt', 'contour', 'contourRond', 'filets'].includes(registre[c].bandeau), c + ' : bord de bandeau inconnu'); }
    assert.ok(capacites[c], c + ' : absent de la table des capacités (régénérer avec le banc)');
  });
});
