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
const fichierBord = (cle) => path.join(dossierMini, cle.replace(':', '_') + '.bord.json');

test('chaque modèle du registre a sa miniature, qui porte l\'empreinte du registre', () => {
  const cles = Object.keys(registre);
  assert.ok(cles.length >= 37, 'le registre doit couvrir tous les modèles de la galerie');
  const manquants = cles.filter((c) => !fs.existsSync(fichier(c)));
  assert.deepStrictEqual(manquants, [], 'miniatures manquantes : ' + manquants.join(', '));
  const perimees = cles.filter((c) => JSON.parse(fs.readFileSync(fichier(c), 'utf8')).hash !== registre[c].html);
  assert.deepStrictEqual(perimees, [], 'miniatures périmées (régénérer avec le banc) : ' + perimees.join(', '));
});

test('aucune miniature sans modèle dans le registre', () => {
  const bordsBandeau = ['droit', 'arrondi', 'vallonne'];
  const attendus = new Set(Object.keys(registre).map((c) => c.replace(':', '_') + '.json')
    .concat(Object.keys(registre).filter((c) => registre[c].bord).map((c) => c.replace(':', '_') + '.bord.json'))
    .concat([].concat(...Object.keys(registre).filter((c) => registre[c].bandeau).map((c) => bordsBandeau.filter((b) => b !== registre[c].bandeau).map((b) => c.replace(':', '_') + '.bandeau-' + b + '.json')))));
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

test('bord de la colonne : chaque modèle à bord au choix a sa miniature de l’autre bord, à jour', () => {
  const avecChoix = Object.keys(registre).filter((c) => registre[c].bord);
  assert.ok(avecChoix.length >= 5, 'les modèles à colonne colorée doivent proposer le choix du bord, trouvé ' + avecChoix.length);
  avecChoix.forEach((c) => {
    assert.ok(['droit', 'vallonne'].includes(registre[c].bord), c + ' : bord inconnu');
    const d = JSON.parse(fs.readFileSync(fichier(c), 'utf8'));
    assert.strictEqual(d.bord, registre[c].bord, c + ' : la miniature ne dit pas son bord');
    assert.ok(fs.existsSync(fichierBord(c)), c + ' : miniature de l’autre bord manquante');
    const b = JSON.parse(fs.readFileSync(fichierBord(c), 'utf8'));
    assert.strictEqual(b.hash, registre[c].bordAlt, c + ' : miniature de l’autre bord périmée (régénérer avec le banc)');
    assert.strictEqual(b.bord, registre[c].bord === 'droit' ? 'vallonne' : 'droit', c + ' : l’autre bord doit être l’opposé');
    assert.ok(b.html.length > 1000 && b.css.length > 1000 && !/:root/.test(b.css), c + ' : miniature de l’autre bord incomplète');
  });
});

test('bord du bandeau : chaque modèle à bandeau au choix a les miniatures de ses deux autres bords, à jour', () => {
  const bords = ['droit', 'arrondi', 'vallonne'];
  const avecChoix = Object.keys(registre).filter((c) => registre[c].bandeau);
  assert.deepStrictEqual(avecChoix.sort(), ['creatif:duoOvale', 'creatif:mqBandeau', 'creatif:vagueMarine'], 'Bandeau entier, Duo ovale et Vague marine proposent le choix du bord du bandeau');
  avecChoix.forEach((c) => {
    assert.ok(bords.includes(registre[c].bandeau), c + ' : bord inconnu');
    const d = JSON.parse(fs.readFileSync(fichier(c), 'utf8'));
    assert.strictEqual(d.bandeau, registre[c].bandeau, c + ' : la miniature ne dit pas son bord');
    const hashs = bords.filter((b) => b !== registre[c].bandeau).map((b) => {
      const f = path.join(dossierMini, c.replace(':', '_') + '.bandeau-' + b + '.json');
      assert.ok(fs.existsSync(f), c + ' : miniature du bord ' + b + ' manquante');
      const m = JSON.parse(fs.readFileSync(f, 'utf8'));
      assert.strictEqual(m.bandeau, b);
      assert.ok(m.html.length > 1000 && m.css.length > 1000 && !/:root\b/.test(m.css), c + ' : miniature du bord ' + b + ' incomplète');
      return m.hash;
    });
    assert.strictEqual(hashs.join(';') + ';', registre[c].bandeauAlt, c + ' : miniatures des autres bords périmées (régénérer avec le banc)');
  });
});
