// Consigne 100 : chaque mot du Lexique se retrouve par ses synonymes et mots voisins, dans la barre de l'accueil comme dans celle du Lexique.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RACINE = path.join(__dirname, '..');

function charger() {
  const ctx = { console, window: {}, departementRessourcesMemorise: function () { return null; } };
  vm.createContext(ctx);
  const html = fs.readFileSync(path.join(RACINE, 'index.html'), 'utf8');
  const fichiers = (html.match(/<script src="data\/[^"]+\.js"/g) || []).map(function (s) { return s.match(/"([^"]+)"/)[1]; });
  fichiers.slice(0, fichiers.indexOf('data/lexique.js') + 1).forEach(function (f) {
    vm.runInContext(fs.readFileSync(path.join(RACINE, f), 'utf8'), ctx, { filename: f });
  });
  return {
    fiches: vm.runInContext('LEXIQUE_FICHES', ctx),
    accueil: function (texte) { return vm.runInContext('rechercherBaseConnaissances(' + JSON.stringify(texte) + ')', ctx); },
    rang: function (id, texte) {
      return vm.runInContext('rangFicheLexiqueERIP(LEXIQUE_FICHES.filter(function (f) { return f.id === ' + JSON.stringify(id) + '; })[0], normaliserTexte(' + JSON.stringify(texte) + '))', ctx);
    }
  };
}
const C = charger();

test('Chaque mot du Lexique a au moins 2 variantes de recherche, jamais plus de 4', () => {
  const pauvres = C.fiches.filter((f) => (f.variantesRecherche || []).length < 2).map((f) => f.id);
  assert.equal(pauvres.length, 0, 'mots à 0 ou 1 variante : ' + pauvres.join(', '));
  C.fiches.forEach((f) => assert.ok((f.variantesRecherche || []).length <= 4, f.id));
});

test('Aucune variante n\'est un mot trop banal', () => {
  const banals = ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'aide', 'droit', 'droits', 'contrat', 'travail', 'emploi', 'argent', 'famille', 'sante', 'logement', 'formation', 'dossier', 'demande', 'service', 'plan', 'carte', 'titre'];
  const faux = [];
  C.fiches.forEach((f) => (f.variantesRecherche || []).forEach((v) => {
    const n = v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
    if (banals.indexOf(n) !== -1) { faux.push(f.id + ' : ' + v); }
  }));
  assert.equal(faux.length, 0, faux.join(' ; '));
});

test('Classement : le sigle exact passe avant les mots qui le contiennent', () => {
  const groupes = C.accueil('ass');
  const g = groupes.filter((x) => x.type === 'lexique')[0];
  assert.ok(g, 'groupe Lexique absent');
  assert.equal(g.resultats[0].id, 'ass');
  assert.equal(C.rang('ass', 'ass'), 0);
});

test('Recherche par mots : « différence cdd intérim » retrouve la comparaison, dans l\'accueil et dans le Lexique', () => {
  assert.ok(C.rang('cdd-ou-interim', 'différence cdd intérim') < 9);
  const g = C.accueil('différence cdd intérim').filter((x) => x.type === 'lexique')[0];
  assert.ok(g && g.resultats.some((r) => r.id === 'cdd-ou-interim'));
});

test('Synonymes : quelques recherches de la vie courante retrouvent le bon mot', () => {
  const essais = [['fiche de paie', 'bulletin-salaire'], ['feuille de paie', 'bulletin-salaire'], ['perdre son emploi', 'licenciement'], ['soft skills', 'soft-skills-ou-hard-skills'],
    ['rupture à l\'amiable', 'rupture-conventionnelle'], ['travailleur handicapé', 'rqth'], ['s\'inscrire au chômage', 'france-travail']];
  essais.forEach(([saisie, id]) => {
    const g = C.accueil(saisie).filter((x) => x.type === 'lexique')[0];
    const ids = g ? g.resultats.map((r) => r.id) : [];
    assert.ok(ids.indexOf(id) !== -1 || C.rang(id, saisie) < 9, '« ' + saisie + ' » devrait retrouver ' + id);
  });
});
