const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// La base lue par l'outil de veille (outils/base_fiches.js) est une COPIE GENEREE des fiches de
// modules/comprendre-le-cadre/contenu/ (scripts/genererBaseVeille.js). Ce test echoue des qu'une fiche a
// change sans que la base ait ete regeneree : l'outil montrerait alors des fiches perimees.
// Correction : node scripts/genererBaseVeille.js (ou double-clic sur outils/Mettre a jour la base de l'outil de veille.bat).

const RACINE = path.join(__dirname, '..');
const CONTENU = path.join(RACINE, 'modules', 'comprendre-le-cadre', 'contenu');

function fichesSurDisque() {
  const out = [];
  fs.readdirSync(CONTENU).sort().forEach((rayon) => {
    const dossier = path.join(CONTENU, rayon);
    if (!fs.statSync(dossier).isDirectory() || rayon === 'balayage' || rayon === 'methode') { return; }
    fs.readdirSync(dossier).sort().forEach((nom) => {
      if (!/\.md$/.test(nom) || /^README\.md$/i.test(nom) || /\.collecte\.md$/.test(nom)) { return; }
      out.push({ fichier: nom, texte: fs.readFileSync(path.join(dossier, nom), 'utf8').replace(/\r\n/g, '\n') });
    });
  });
  return out;
}

test('la base de l\'outil de veille est à jour avec les fiches', () => {
  const brut = fs.readFileSync(path.join(RACINE, 'outils', 'base_fiches.js'), 'utf8');
  const debut = brut.indexOf('window.BASE_VEILLE = ');
  assert.ok(debut >= 0, 'base_fiches.js ne contient pas window.BASE_VEILLE');
  const json = brut.slice(debut + 'window.BASE_VEILLE = '.length).replace(/;\s*$/, '');
  const base = JSON.parse(json);
  const disque = fichesSurDisque();
  assert.equal(base.fiches.length, disque.length, 'nombre de fiches différent : relancer node scripts/genererBaseVeille.js');
  disque.forEach((f, i) => {
    assert.equal(base.fiches[i].fichier, f.fichier, 'ordre ou nom différent : relancer node scripts/genererBaseVeille.js');
    assert.equal(base.fiches[i].texte, f.texte, 'la fiche ' + f.fichier + ' a changé : relancer node scripts/genererBaseVeille.js');
  });
});
