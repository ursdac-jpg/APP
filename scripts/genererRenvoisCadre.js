// Genere data/lexique-renvois-cadre.js : l'index inverse du lien
// Cadre -> Lexique (champ voir_aussi_lexique: des fiches de
// "Comprendre le cadre"), pour alimenter le nouveau lien retour
// Lexique -> Cadre (chantier "liens bidirectionnels", item 14 de
// docs/TACHES_VALIDEES.md, decide par Denis le 2026-09-13).
//
// La seule source de verite reste le champ voir_aussi_lexique: de
// chaque fiche .md de modules/comprendre-le-cadre/contenu/ : ce script
// ne fait que le relire dans l'autre sens, jamais une saisie manuelle
// en double. C'est pourquoi le fichier genere doit toujours etre a
// jour avec les fiches sources -- verifie automatiquement par
// scripts/checkLexique.js (mode --check ci-dessous).
//
// Usage :
//   node scripts/genererRenvoisCadre.js          (ecrit le fichier)
//   node scripts/genererRenvoisCadre.js --check  (verifie sans ecrire,
//                                                  code de sortie 1 si perime)

var fs = require('fs');
var path = require('path');

var RACINE = path.join(__dirname, '..');
var CONTENU = path.join(RACINE, 'modules', 'comprendre-le-cadre', 'contenu');
var SORTIE = path.join(RACINE, 'data', 'lexique-renvois-cadre.js');

// Meme technique que _comprendreLeCadreExtraireListeYaml()
// (modules/comprendre-le-cadre/index.js) : une liste YAML simple
// ("- item") jusqu'a la prochaine cle de premier niveau.
function extraireListeYaml(bloc, nom) {
  var lignes = bloc.split('\n'), dedans = false, out = [];
  for (var i = 0; i < lignes.length; i++) {
    if (new RegExp('^' + nom + '\\s*:').test(lignes[i])) { dedans = true; continue; }
    if (dedans) {
      if (/^[a-z_]+\s*:/.test(lignes[i]) && !/^\s*-/.test(lignes[i])) { break; }
      var it = lignes[i].replace(/^\s*[-*]\s*/, '').replace(/^"|"$/g, '').trim();
      if (it) { out.push(it); }
    }
  }
  return out;
}

function parserFiche(texteMd) {
  var m = texteMd.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!m) { return null; }
  var entete = m[1];
  var f = { id: '', rayon: '', titre: '', voir_aussi_lexique: [] };
  ['id', 'rayon', 'titre'].forEach(function (cle) {
    var mm = entete.match(new RegExp('^' + cle + ':\\s*(.+)$', 'm'));
    if (mm) { f[cle] = mm[1].trim().replace(/^"|"$/g, ''); }
  });
  f.voir_aussi_lexique = extraireListeYaml(entete, 'voir_aussi_lexique');
  return f;
}

function listerFichesMd() {
  var fichiers = [];
  fs.readdirSync(CONTENU).forEach(function (rayonDir) {
    var chemin = path.join(CONTENU, rayonDir);
    if (!fs.statSync(chemin).isDirectory()) { return; }
    fs.readdirSync(chemin).forEach(function (nom) {
      if (!nom.endsWith('.md') || nom === 'README.md' || nom.endsWith('.collecte.md')) { return; }
      fichiers.push(path.join(chemin, nom));
    });
  });
  return fichiers;
}

function construireIndexInverse() {
  var index = {};
  listerFichesMd().forEach(function (chemin) {
    var f = parserFiche(fs.readFileSync(chemin, 'utf8'));
    if (!f || !f.id || !f.voir_aussi_lexique.length) { return; }
    f.voir_aussi_lexique.forEach(function (idLexique) {
      if (!index[idLexique]) { index[idLexique] = []; }
      index[idLexique].push({ ficheId: f.id, rayon: f.rayon, titre: f.titre });
    });
  });
  // Ordre stable (id Lexique, puis id de fiche) : un diff git lisible
  // d'une regeneration a l'autre.
  var trie = {};
  Object.keys(index).sort().forEach(function (idLexique) {
    trie[idLexique] = index[idLexique].sort(function (a, b) { return a.ficheId < b.ficheId ? -1 : 1; });
  });
  return trie;
}

function genererContenuFichier(index) {
  var lignes = [];
  lignes.push('// Genere automatiquement par scripts/genererRenvoisCadre.js -- NE PAS EDITER A LA MAIN.');
  lignes.push('// Index inverse du champ voir_aussi_lexique: des fiches de "Comprendre le');
  lignes.push('// cadre" (modules/comprendre-le-cadre/contenu/**/*.md) : pour chaque id du');
  lignes.push('// Lexique, la liste des fiches Cadre qui le citent. Sert au lien retour');
  lignes.push('// "Pour aller plus loin -> Comprendre le cadre" du module Lexique.');
  lignes.push('// Regenerer apres tout ajout/retrait de voir_aussi_lexique: dans une fiche');
  lignes.push('// Cadre : node scripts/genererRenvoisCadre.js (verifie par checkLexique.js).');
  lignes.push('var LEXIQUE_RENVOIS_CADRE = ' + JSON.stringify(index, null, 2) + ';');
  lignes.push('');
  return lignes.join('\n');
}

// Reutilisable par scripts/checkLexique.js (verification de fraicheur
// sans relancer un sous-processus Node) : renvoie null si a jour, sinon
// un message d'erreur pret a afficher.
function verifierFraicheur() {
  var index = construireIndexInverse();
  var contenuAttendu = genererContenuFichier(index);
  var contenuActuel = fs.existsSync(SORTIE) ? fs.readFileSync(SORTIE, 'utf8') : null;
  if (contenuActuel === contenuAttendu) { return null; }
  return 'data/lexique-renvois-cadre.js est perime par rapport aux fiches Cadre ' +
    '(voir_aussi_lexique:) : relancer "node scripts/genererRenvoisCadre.js".';
}

module.exports = { construireIndexInverse: construireIndexInverse, genererContenuFichier: genererContenuFichier, verifierFraicheur: verifierFraicheur };

if (require.main === module) {
  var verifierSeulement = process.argv.indexOf('--check') !== -1;
  if (verifierSeulement) {
    var messageErreur = verifierFraicheur();
    if (!messageErreur) {
      console.log('data/lexique-renvois-cadre.js est a jour.');
      process.exit(0);
    }
    console.error(messageErreur);
    process.exit(1);
  } else {
    var index = construireIndexInverse();
    fs.writeFileSync(SORTIE, genererContenuFichier(index), 'utf8');
    console.log('data/lexique-renvois-cadre.js regenere : ' + Object.keys(index).length + ' mots relies.');
  }
}
