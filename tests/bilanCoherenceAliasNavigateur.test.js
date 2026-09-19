const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// ============================================================
// Garde-fou contre une classe de bug reelle, trouvee le 2026-08-09 en
// integrant le module dans app.js : 42 occurrences, dans 18 fichiers,
// jamais detectees par les 218 tests existants -- tous executes sous
// Node, ou require() est toujours defini.
//
// Chaque fichier du module suit ce motif pour ses dependances
// inter-fichiers :
//   if (typeof require !== 'undefined') {
//     var _bilanXxx = require('./autreFichier.js');
//     var bilanChargerTemplate = _bilanXxx.bilanChargerTemplate;
//   }
// Sous Node, ce bloc s'execute : peu importe le nom local choisi, il est
// correctement assigne. Dans le navigateur, ce bloc est ENTIEREMENT
// ignore (pas de require()) -- le seul mecanisme qui fonctionne alors est
// la resolution vers la fonction/constante GLOBALE de meme nom, deja
// chargee par son fichier source (function bilanChargerTemplate(){} en
// portee globale). Ca ne marche QUE SI le nom local est EXACTEMENT le
// meme que la propriete importee -- un alias renomme/suffixe (ex.
// bilanCreerErreurMetier_pb, BILAN_STATUT_PREPARATION_DRP) reste
// `undefined` dans le navigateur : var bilanCreerErreurMetier_pb; (hisse,
// jamais assigne) ne correspond a AUCUNE fonction globale de ce nom.
//
// Ce test lit le texte source (jamais require() les fichiers pour cette
// verification precise -- on veut inspecter la DECLARATION telle
// qu'ecrite, pas son resultat sous Node, qui masquerait justement le
// probleme) et signale tout alias dont le nom local differe du nom
// importe, avant que ca ne redevienne un bug invisible aux tests.
// ============================================================

function listerFichiersJS(dossier) {
  var resultats = [];
  fs.readdirSync(dossier, { withFileTypes: true }).forEach(function (entree) {
    var cheminComplet = path.join(dossier, entree.name);
    if (entree.isDirectory()) {
      resultats = resultats.concat(listerFichiersJS(cheminComplet));
    } else if (entree.isFile() && entree.name.endsWith('.js')) {
      resultats.push(cheminComplet);
    }
  });
  return resultats;
}

// Capture "var LOCAL = ALIAS.PROPRIETE;" -- ALIAS commence par _ (seule
// convention utilisee par le module pour un require() intermediaire).
var MOTIF_ALIAS = /var\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(_[A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z_][A-Za-z0-9_]*)\s*;/g;

function trouverIncoherences(cheminFichier) {
  var texte = fs.readFileSync(cheminFichier, 'utf8');
  var lignes = texte.split('\n');
  var incoherences = [];
  var correspondance;
  while ((correspondance = MOTIF_ALIAS.exec(texte)) !== null) {
    var nomLocal = correspondance[1];
    var propriete = correspondance[3];
    if (nomLocal !== propriete) {
      var numeroLigne = texte.slice(0, correspondance.index).split('\n').length;
      incoherences.push({
        fichier: cheminFichier,
        ligne: numeroLigne,
        local: nomLocal,
        propriete: propriete,
        texteLigne: (lignes[numeroLigne - 1] || '').trim()
      });
    }
  }
  return incoherences;
}

var DOSSIER_MODULE = path.join(__dirname, '..', 'modules', 'bilan-candidature');

test('bilan-candidature : aucun alias require() renomme -- chaque nom local doit etre identique a la propriete importee (seule forme qui fonctionne aussi dans le navigateur, pas seulement sous Node)', () => {
  var fichiers = listerFichiersJS(DOSSIER_MODULE);
  var toutesIncoherences = [];
  fichiers.forEach(function (fichier) {
    toutesIncoherences = toutesIncoherences.concat(trouverIncoherences(fichier));
  });

  if (toutesIncoherences.length > 0) {
    var messageDetail = toutesIncoherences.map(function (i) {
      return '  ' + path.relative(path.join(__dirname, '..'), i.fichier) + ':' + i.ligne +
        '  local="' + i.local + '"  propriete="' + i.propriete + '"\n    ' + i.texteLigne;
    }).join('\n');
    assert.fail(
      toutesIncoherences.length + ' alias renomme(s) trouve(s) -- fonctionnent sous Node, casseraient dans le navigateur ' +
      '(voir l\'en-tete de ce fichier de test pour l\'explication complete) :\n' + messageDetail
    );
  }

  assert.equal(toutesIncoherences.length, 0);
});

test('listerFichiersJS/trouverIncoherences : verification du detecteur lui-meme sur un cas fabrique (le detecteur doit reellement detecter, pas juste ne rien trouver par hasard)', () => {
  var fichierTemporaire = path.join(require('node:os').tmpdir(), 'bilanTestAliasDetecteur_' + Date.now() + '.js');
  fs.writeFileSync(fichierTemporaire,
    "if (typeof require !== 'undefined') {\n" +
    "  var _bilanXxx = require('./xxx.js');\n" +
    "  var bilanChargerTemplate_renomme = _bilanXxx.bilanChargerTemplate;\n" +
    "  var bilanChargerTemplate = _bilanXxx.bilanChargerTemplate;\n" +
    "}\n"
  );
  try {
    var incoherences = trouverIncoherences(fichierTemporaire);
    assert.equal(incoherences.length, 1);
    assert.equal(incoherences[0].local, 'bilanChargerTemplate_renomme');
    assert.equal(incoherences[0].propriete, 'bilanChargerTemplate');
  } finally {
    fs.unlinkSync(fichierTemporaire);
  }
});
