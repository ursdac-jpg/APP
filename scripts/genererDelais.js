// Genere modules/comprendre-le-cadre/donnees/delais.json : la liste des « Délais à ne pas rater ».
//
// SOURCE UNIQUE : chaque fiche de modules/comprendre-le-cadre/contenu/ porte, dans son en-tête, une ou plusieurs lignes
//   delai:
//     - "Thème | Quand | Situation | Phrase de résumé"
// La page de l'application lit ce fichier généré (une seule lecture au lieu d'ouvrir les 24 rayons). Le fichier ne se modifie
// jamais à la main : tests/delaisFiches.test.js échoue s'il n'est plus identique à ce que ce script produit.
//
// Usage :  node scripts/genererDelais.js           (écrit le fichier)
//          node scripts/genererDelais.js --verifier (compare seulement, code de sortie 1 s'il diffère)
// À relancer après toute modification d'une fiche (genererBaseVeille.js le fait aussi).

var fs = require('fs');
var path = require('path');

var RACINE = path.join(__dirname, '..');
var CONTENU = path.join(RACINE, 'modules', 'comprendre-le-cadre', 'contenu');
var SORTIE = path.join(RACINE, 'modules', 'comprendre-le-cadre', 'donnees', 'delais.json');
// Ordre d'affichage des thèmes ; un thème absent de cette liste vient ensuite, par ordre alphabétique.
var ORDRE_THEMES = ['Emploi et ruptures de contrat', 'Droits et recours', 'Famille et enfants', 'Argent et banque', 'Logement', 'Créer son activité', 'Se former'];

function valeur(entete, cle) {
  var m = entete.match(new RegExp('^' + cle + ':\\s*(.+)$', 'm'));
  return m ? m[1].trim().replace(/^"|"$/g, '') : '';
}
function liste(entete, cle) {
  var lignes = entete.split('\n'), dedans = false, sortie = [];
  for (var i = 0; i < lignes.length; i++) {
    if (new RegExp('^' + cle + '\\s*:').test(lignes[i])) { dedans = true; continue; }
    if (!dedans) { continue; }
    if (/^[a-z_]+\s*:/.test(lignes[i]) && !/^\s*-/.test(lignes[i])) { break; }
    var it = lignes[i].replace(/^\s*-\s*/, '').trim().replace(/^"|"$/g, '').replace(/\\"/g, '"');
    if (it) { sortie.push(it); }
  }
  return sortie;
}

// Retourne { delais: [...], erreurs: [...] } ; une ligne mal formée est une erreur, jamais ignorée en silence.
function construire() {
  var delais = [], erreurs = [];
  fs.readdirSync(CONTENU).sort().forEach(function (rayon) {
    var dossier = path.join(CONTENU, rayon);
    if (!fs.statSync(dossier).isDirectory() || rayon === 'balayage' || rayon === 'methode') { return; }
    fs.readdirSync(dossier).sort().forEach(function (nom) {
      if (!/\.md$/.test(nom) || /^README\.md$/i.test(nom) || /\.collecte\.md$/.test(nom)) { return; }
      var texte = fs.readFileSync(path.join(dossier, nom), 'utf8').replace(/\r\n/g, '\n');
      var m = texte.match(/^---\n([\s\S]*?)\n---\n/);
      if (!m) { return; }
      var statut = valeur(m[1], 'statut') || 'actif';
      var lignes = liste(m[1], 'delai');
      if (!lignes.length || statut !== 'actif') { return; }
      lignes.forEach(function (l) {
        var p = l.split(' | ').map(function (x) { return x.trim(); });
        if (p.length !== 4 || p.some(function (x) { return !x; })) { erreurs.push(nom + ' : ligne delai mal formée (4 parties séparées par « | » attendues) : ' + l.slice(0, 60)); return; }
        delais.push({ theme: p[0], quand: p[1], situation: p[2], resume: p[3], fiche: valeur(m[1], 'id'), rayon: rayon, titre: valeur(m[1], 'titre'), verifie_le: valeur(m[1], 'verifie_le') });
      });
    });
  });
  var rang = function (t) { var i = ORDRE_THEMES.indexOf(t); return i === -1 ? ORDRE_THEMES.length : i; };
  delais.sort(function (a, b) {
    return rang(a.theme) - rang(b.theme) || a.theme.localeCompare(b.theme, 'fr') || a.fiche.localeCompare(b.fiche) || a.quand.localeCompare(b.quand, 'fr');
  });
  return { delais: delais, erreurs: erreurs };
}

function texteSortie(delais) { return JSON.stringify(delais, null, 1) + '\n'; }

function ecrire() {
  var r = construire();
  if (r.erreurs.length) { throw new Error(r.erreurs.join('\n')); }
  fs.mkdirSync(path.dirname(SORTIE), { recursive: true });
  fs.writeFileSync(SORTIE, texteSortie(r.delais), 'utf8');
  return r.delais.length;
}

module.exports = { construire: construire, texteSortie: texteSortie, ecrire: ecrire, SORTIE: SORTIE };

if (require.main === module) {
  if (process.argv.indexOf('--verifier') !== -1) {
    var r = construire();
    var actuel = fs.existsSync(SORTIE) ? fs.readFileSync(SORTIE, 'utf8').replace(/\r\n/g, '\n') : '';
    if (r.erreurs.length || actuel !== texteSortie(r.delais)) { console.error(r.erreurs.join('\n') || 'delais.json n\'est plus à jour : relancer node scripts/genererDelais.js'); process.exit(1); }
    console.log('delais.json à jour (' + r.delais.length + ' délais).');
  } else {
    console.log(ecrire() + ' délais écrits dans ' + path.relative(RACINE, SORTIE));
  }
}
