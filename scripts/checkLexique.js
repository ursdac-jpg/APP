/* ============================================================
   scripts/checkLexique.js
   ------------------------------------------------------------
   Script de validation du corpus du module Lexique (data/lexique.js).
   Aucune dependance externe (coherent avec ERIP : pas de bundler,
   pas de gestionnaire de paquets impose pour un simple script).
   Usage : node scripts/checkLexique.js

   Distingue deux niveaux :
   - ERREUR  : casse reellement quelque chose (reference invalide,
     id en double...), fait echouer le script (code de sortie 1).
   - AVERTISSEMENT : signal a verifier humainement (variante
     partagee entre deux fiches, collection tres courte...), ne
     fait jamais echouer le script seul.

   Pense pour grossir avec le corpus (42 fiches aujourd'hui, utile
   des la centaine) -- voir modules/lexique/ARCHITECTURE_TECHNIQUE.md
   et docs/CHANTIER_LEXIQUE.md section 9 pour les regles que ce
   script fait respecter.
   ============================================================ */

var fs = require('fs');
var path = require('path');
var renvoisCadre = require('./genererRenvoisCadre.js');

var CHEMIN_DONNEES = path.join(__dirname, '..', 'data', 'lexique.js');

// Univers et registres connus -- a tenir a jour manuellement si la
// liste evolue (docs/CHANTIER_LEXIQUE.md, section 5). Volontairement
// une liste en dur ici plutot qu'une dependance vers un autre fichier :
// ce script doit pouvoir tourner seul, sans supposer une structure
// de module qui n'existe pas encore au moment de l'ecrire.
var UNIVERS_CONNUS = [
  'accompagnement-insertion', 'emploi-recrutement', 'ressources-humaines',
  'organisation-travail-management', 'droit-travail', 'contrats-statuts-emploi',
  'formation', 'bulletin-salaire', 'protection-sociale', 'sante-travail',
  'structures-organismes', 'dispositifs', 'mobilite-budget',
  'entrepreneuriat-independance', 'demarches-administratives', 'conditions-travail',
  'acces-aux-soins'
];
var REGISTRES_CONNUS = [
  'langage-cip', 'langage-rh', 'langage-juridique', 'langage-employeur',
  'langage-administratif', 'langage-france-travail'
];
var GABARITS_CONNUS = [
  'explication', 'comparatif', 'decryptage', 'grille-lecture', 'deroule-demarche', 'role'
];

// Plafond porte de 3 a 4 le 2026-08-29 (decision Denis) : les fiches
// "accompagnement-insertion" ajoutees pour le repertoire des freins
// (surendettement, addictologie, aide-a-la-mobilite...) servent un public
// qui tape des mots tres varies du quotidien. 4 laisse un peu d'air sans
// ouvrir en grand -- au-dela, on s'appuie sur les synonymes des freins
// (data/freins.js), qui remontent aussi dans la recherche.
var MAX_VARIANTES = 4;
var MAX_VOIR_AUSSI = 3;
var MAX_A_NE_PAS_CONFONDRE = 2;

// Fiches injectees dans LEXIQUE_FICHES au runtime par des IIFE
// (data/urgences.js -> "urgence-*", data/freins.js -> "freins-*"), donc
// invisibles pour ce script qui lit data/lexique.js seul. Une fiche
// statique a le droit de pointer vers elles (ex. hebergement-urgence ->
// urgence-besoins-vitaux) : l'index des relations est reconstruit cote
// module une fois la projection faite.
function estIdProjeteRuntime(id) {
  return /^(urgence-|freins-)/.test(id);
}
var MIN_FICHES_COLLECTION = 4;

function chargerDonnees() {
  var contexte = {};
  var code = fs.readFileSync(CHEMIN_DONNEES, 'utf8');
  // eslint-disable-next-line no-new-func
  var fabrique = new Function('exports', code +
    '\nreturn { LEXIQUE_FICHES: LEXIQUE_FICHES, LEXIQUE_COLLECTIONS: LEXIQUE_COLLECTIONS, LEXIQUE_SECOND_NIVEAU: LEXIQUE_SECOND_NIVEAU };');
  return fabrique(contexte);
}

function verifier() {
  var erreurs = [];
  var avertissements = [];
  var donnees = chargerDonnees();
  var fiches = donnees.LEXIQUE_FICHES || [];
  var collections = donnees.LEXIQUE_COLLECTIONS || [];
  var secondNiveau = donnees.LEXIQUE_SECOND_NIVEAU || [];

  var idsFiches = {};
  var idsCollections = {};
  var idsSecondNiveau = {};

  // -- Identifiants uniques --
  fiches.forEach(function (f) {
    if (idsFiches[f.id]) { erreurs.push('Identifiant de fiche en double : "' + f.id + '"'); }
    idsFiches[f.id] = true;
  });
  collections.forEach(function (c) {
    if (idsCollections[c.id]) { erreurs.push('Identifiant de collection en double : "' + c.id + '"'); }
    idsCollections[c.id] = true;
  });
  secondNiveau.forEach(function (a) {
    if (idsSecondNiveau[a.id]) { erreurs.push('Identifiant de second niveau en double : "' + a.id + '"'); }
    idsSecondNiveau[a.id] = true;
  });

  // -- Index inverse (pour detecter les fiches jamais citees) --
  var citeePar = {}; // ficheId -> nombre de fiches qui la citent (relations)
  var dansCollection = {}; // ficheId -> nombre de collections qui la citent

  fiches.forEach(function (f) {
    // -- Champs obligatoires --
    if (!f.id) { erreurs.push('Une fiche sans identifiant (titre : "' + (f.titre || '?') + '")'); }
    if (!f.titre) { erreurs.push('Fiche "' + f.id + '" sans titre'); }
    if (!f.titreDeTri) { avertissements.push('Fiche "' + f.id + '" sans titreDeTri (retombera sur le titre pour le tri alphabetique)'); }
    if (!f.corps) { erreurs.push('Fiche "' + f.id + '" sans corps'); }
    if (f.type !== 'terme' && f.type !== 'notion') { erreurs.push('Fiche "' + f.id + '" : type inconnu "' + f.type + '"'); }
    if (f.type === 'notion' && GABARITS_CONNUS.indexOf(f.gabarit) === -1) {
      erreurs.push('Fiche "' + f.id + '" (notion) : gabarit inconnu ou absent "' + f.gabarit + '"');
    }
    if (f.type === 'terme' && f.gabarit) {
      erreurs.push('Fiche "' + f.id + '" (terme) : ne devrait pas avoir de gabarit ("' + f.gabarit + '")');
    }

    // -- Univers / registres connus --
    if (UNIVERS_CONNUS.indexOf(f.univers) === -1) {
      erreurs.push('Fiche "' + f.id + '" : univers inconnu "' + f.univers + '"');
    }
    (f.registres || []).forEach(function (r) {
      if (REGISTRES_CONNUS.indexOf(r) === -1) { erreurs.push('Fiche "' + f.id + '" : registre inconnu "' + r + '"'); }
    });

    // -- Densite maximale (docs/CHANTIER_LEXIQUE.md, section 9) --
    if ((f.variantesRecherche || []).length > MAX_VARIANTES) {
      erreurs.push('Fiche "' + f.id + '" : ' + f.variantesRecherche.length + ' variantes de recherche, plafond ' + MAX_VARIANTES);
    }
    var voirAussi = (f.relations || []).filter(function (r) { return r.type === 'voir-aussi'; });
    var aNePasConfondre = (f.relations || []).filter(function (r) { return r.type === 'a-ne-pas-confondre'; });
    if (voirAussi.length > MAX_VOIR_AUSSI) {
      erreurs.push('Fiche "' + f.id + '" : ' + voirAussi.length + ' liens "voir aussi" declares par elle-meme, plafond ' + MAX_VOIR_AUSSI + ' (le plafond porte sur ce qui est ecrit, pas sur le total affiche une fois les renvois calcules)');
    }
    if (aNePasConfondre.length > MAX_A_NE_PAS_CONFONDRE) {
      erreurs.push('Fiche "' + f.id + '" : ' + aNePasConfondre.length + ' liens "a ne pas confondre" declares, plafond ' + MAX_A_NE_PAS_CONFONDRE);
    }

    // -- Variantes de recherche dupliquees a l'interieur d'une meme fiche --
    var vues = {};
    (f.variantesRecherche || []).forEach(function (v) {
      var cle = v.toLowerCase().trim();
      if (vues[cle]) { erreurs.push('Fiche "' + f.id + '" : variante de recherche repetee ("' + v + '")'); }
      vues[cle] = true;
    });
  });

  // -- Deuxieme passe : references (a besoin que tous les ids soient deja connus) --
  fiches.forEach(function (f) {
    (f.relations || []).forEach(function (r) {
      if (!idsFiches[r.ficheId]) {
        if (estIdProjeteRuntime(r.ficheId)) { return; }
        erreurs.push('Fiche "' + f.id + '" : relation vers un identifiant inconnu "' + r.ficheId + '"');
        return;
      }
      if (r.ficheId === f.id) { erreurs.push('Fiche "' + f.id + '" : relation vers elle-meme'); return; }
      if (r.type !== 'voir-aussi' && r.type !== 'a-ne-pas-confondre') {
        erreurs.push('Fiche "' + f.id + '" : type de relation inconnu "' + r.type + '"');
      }
      citeePar[r.ficheId] = (citeePar[r.ficheId] || 0) + 1;
    });
  });

  collections.forEach(function (c) {
    if (!c.id) { erreurs.push('Une collection sans identifiant (titre : "' + (c.titre || '?') + '")'); }
    if (!c.titre) { erreurs.push('Collection "' + c.id + '" sans titre'); }
    if (c.mode !== 'collection' && c.mode !== 'parcours') {
      erreurs.push('Collection "' + c.id + '" : mode inconnu "' + c.mode + '"');
    }
    if (c.mode === 'parcours' && !c.accroche) {
      avertissements.push('Parcours "' + c.id + '" sans accroche a la premiere personne');
    }
    var liste = c.fichesOrdonnees || [];
    if (!liste.length) { erreurs.push('Collection "' + c.id + '" : aucune fiche'); }
    if (liste.length < MIN_FICHES_COLLECTION) {
      avertissements.push('Collection "' + c.id + '" : seulement ' + liste.length + ' fiche(s), en dessous du seuil habituel (' + MIN_FICHES_COLLECTION + ')');
    }
    var dejaVues = {};
    liste.forEach(function (fid) {
      if (!idsFiches[fid]) { erreurs.push('Collection "' + c.id + '" : reference une fiche inconnue "' + fid + '"'); return; }
      if (dejaVues[fid]) { erreurs.push('Collection "' + c.id + '" : fiche "' + fid + '" listee plusieurs fois'); }
      dejaVues[fid] = true;
      dansCollection[fid] = (dansCollection[fid] || 0) + 1;
    });
  });

  // -- Second niveau de lecture (etape 10) -- vide aujourd'hui, mais
  // valide des la premiere entree ecrite sans avoir a rouvrir ce script.
  secondNiveau.forEach(function (a) {
    if (!a.id) { erreurs.push('Une entree de second niveau sans identifiant (titre : "' + (a.titre || '?') + '")'); }
    if (!a.titre) { erreurs.push('Second niveau "' + a.id + '" sans titre'); }
    if (!a.corps) { erreurs.push('Second niveau "' + a.id + '" sans corps'); }
    var entrees = a.fichesEntree || [];
    if (!entrees.length) { erreurs.push('Second niveau "' + a.id + '" : aucune fiche d\'entree (fichesEntree), donc jamais atteignable'); }
    var dejaVues = {};
    entrees.forEach(function (fid) {
      if (!idsFiches[fid]) { erreurs.push('Second niveau "' + a.id + '" : reference une fiche inconnue "' + fid + '"'); return; }
      if (dejaVues[fid]) { erreurs.push('Second niveau "' + a.id + '" : fiche "' + fid + '" listee plusieurs fois dans fichesEntree'); }
      dejaVues[fid] = true;
    });
  });

  // -- Fiches jamais citees (ni par une relation, ni par une collection) --
  // Un avertissement, jamais une erreur : une fiche peut legitimement etre
  // un point d'arrivee assume (regle actee en fin de chantier editorial).
  fiches.forEach(function (f) {
    var citations = (citeePar[f.id] || 0) + (dansCollection[f.id] || 0);
    if (citations === 0) {
      avertissements.push('Fiche "' + f.id + '" : jamais citee par une autre fiche ni par une collection (point d\'arrivee possible, a confirmer)');
    }
  });

  // -- Variantes de recherche identiques sur deux fiches differentes --
  var varianteVersFiches = {};
  fiches.forEach(function (f) {
    (f.variantesRecherche || []).concat([f.titre]).forEach(function (v) {
      var cle = (v || '').toLowerCase().trim();
      if (!cle) { return; }
      varianteVersFiches[cle] = varianteVersFiches[cle] || [];
      varianteVersFiches[cle].push(f.id);
    });
  });
  Object.keys(varianteVersFiches).forEach(function (cle) {
    var liste = varianteVersFiches[cle];
    if (liste.length > 1) {
      avertissements.push('"' + cle + '" mene a ' + liste.length + ' fiches (' + liste.join(', ') + ') -- ambiguite possible en recherche');
    }
  });

  // -- Fraicheur de l'index inverse Lexique -> Comprendre le cadre --
  // (data/lexique-renvois-cadre.js, genere depuis les fiches Cadre par
  // scripts/genererRenvoisCadre.js). Une erreur, pas un avertissement :
  // un fichier perime affiche silencieusement un lien retour manquant.
  var messageRenvoisCadre = renvoisCadre.verifierFraicheur();
  if (messageRenvoisCadre) { erreurs.push(messageRenvoisCadre); }

  return {
    erreurs: erreurs, avertissements: avertissements,
    nbFiches: fiches.length, nbCollections: collections.length, nbSecondNiveau: secondNiveau.length
  };
}

// Sortie "inventaire" : la liste de tout ce que le Lexique couvre deja,
// prete a coller dans les prompts de veille [LEXIQUE] / [TRIAGE-MOTS]
// (docs/VEILLE_PROMPTS.md section 5quater) pour qu'un balayage ne
// re-propose jamais un mot deja traite. Une ligne par fiche :
//   id | titre | variante ; variante ; ...
// Usage : node scripts/checkLexique.js --termes
function listerTermes() {
  var donnees;
  try {
    donnees = chargerDonnees();
  } catch (e) {
    console.error('Echec du chargement de data/lexique.js :', e.message);
    process.exit(1);
  }
  var fiches = (donnees.LEXIQUE_FICHES || []).slice().sort(function (a, b) {
    return (a.titreDeTri || a.titre || '').localeCompare(b.titreDeTri || b.titre || '', 'fr');
  });
  console.log('# Inventaire du Lexique -- ' + fiches.length + ' fiches. Tout mot ci-dessous est DEJA couvert.');
  console.log('# Genere par : node scripts/checkLexique.js --termes\n');
  fiches.forEach(function (f) {
    var variantes = (f.variantesRecherche || []).join(' ; ');
    console.log(f.id + ' | ' + (f.titre || '') + (variantes ? ' | ' + variantes : ''));
  });
  var collections = (donnees.LEXIQUE_COLLECTIONS || []).slice().sort(function (a, b) {
    return (a.titre || '').localeCompare(b.titre || '', 'fr');
  });
  console.log('\n# ' + collections.length + ' familles (collections / parcours) :');
  collections.forEach(function (c) {
    console.log((c.mode === 'parcours' ? 'parcours' : 'collection') + ' | ' + c.id + ' | ' + (c.titre || ''));
  });
  process.exit(0);
}

function main() {
  if (process.argv.indexOf('--termes') !== -1) { listerTermes(); return; }

  var resultat;
  try {
    resultat = verifier();
  } catch (e) {
    console.error('Echec du chargement de data/lexique.js :', e.message);
    process.exit(1);
  }

  console.log('Corpus Lexique : ' + resultat.nbFiches + ' fiches, ' + resultat.nbCollections + ' collections, ' +
    resultat.nbSecondNiveau + ' entrees de second niveau.\n');

  if (resultat.avertissements.length) {
    console.log('Avertissements (' + resultat.avertissements.length + ') :');
    resultat.avertissements.forEach(function (a) { console.log('  - ' + a); });
    console.log('');
  }

  if (resultat.erreurs.length) {
    console.log('Erreurs (' + resultat.erreurs.length + ') :');
    resultat.erreurs.forEach(function (e) { console.log('  - ' + e); });
    console.log('\nEchec : ' + resultat.erreurs.length + ' erreur(s) a corriger.');
    process.exit(1);
  }

  console.log('Aucune erreur.');
  process.exit(0);
}

main();
