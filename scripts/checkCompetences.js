/* ============================================================
   scripts/checkCompetences.js
   ------------------------------------------------------------
   Script de validation du referentiel de competences
   (data/competences.js) face au vocabulaire reel des fiches
   metier (data/metiers.js). Sur le modele de scripts/checkLexique.js.
   Usage : node scripts/checkCompetences.js

   Distingue deux niveaux :
   - ERREUR  : casse reellement quelque chose (categorie invalide,
     descriptif vide...), fait echouer le script (code de sortie 1).
   - AVERTISSEMENT : signal a verifier humainement (terme absent,
     doublon probable, competence peu discriminante...), ne fait
     jamais echouer le script seul.

   Ecrit dans le cadre du chantier competences (docs/CHANTIER_COMPETENCES.md,
   docs/PLAN_COMPETENCES_2026-09-15.md, etape 2) pour eviter d'avoir a
   refaire a la main l'audit qui a lance ce chantier a chaque fois que la
   base grossit.
   ============================================================ */

var competencesData = require('../data/competences.js');
var metiersData = require('../data/metiers.js');

var categorieCompetence = competencesData.categorieCompetence;
var DESCRIPTIFS_COMPETENCES = competencesData.DESCRIPTIFS_COMPETENCES;
var baseMetiers = metiersData.baseMetiers;
var correspond = metiersData.correspond;

var CATEGORIES_VALIDES = ['Savoir-faire', 'Savoir-etre', 'Savoirs'];

// Au-dela de ce taux de metiers qui citent une competence, elle est jugee
// peu discriminante pour orienter vers un metier precis (rapport, jamais
// une obligation d'agir -- voir docs/CHANTIER_COMPETENCES.md, section
// "Competences non discriminantes").
var SEUIL_NON_DISCRIMINANTE = 0.4;

// "Savoirs" : par nature specifiques a un metier/secteur (ex. "Cycle de la
// vigne"), on ne les catalogue pas un par un dans categorieCompetence --
// decision du plan (etape 1). Ce script ne liste donc PAS chaque terme
// absent de cette categorie individuellement (bruit inutile), seulement
// un compte global + les plus frequents, a titre indicatif.
var TOP_SAVOIRS_NON_CATALOGUES = 5;

function calculerFrequences() {
  var freq = { savoirFaire: {}, savoirEtre: {}, savoirs: {} };
  baseMetiers.forEach(function (met) {
    ['savoirFaire', 'savoirEtre', 'savoirs'].forEach(function (champ) {
      (met[champ] || []).forEach(function (v) { freq[champ][v] = (freq[champ][v] || 0) + 1; });
    });
  });
  return freq;
}

function verifier() {
  var erreurs = [];
  var avertissements = [];
  var clesCategorie = Object.keys(categorieCompetence);
  var clesDescriptifs = Object.keys(DESCRIPTIFS_COMPETENCES);
  var freq = calculerFrequences();

  // -- Categorie valide --
  clesCategorie.forEach(function (c) {
    if (CATEGORIES_VALIDES.indexOf(categorieCompetence[c]) === -1) {
      erreurs.push('Competence "' + c + '" : categorie invalide "' + categorieCompetence[c] +
        '" (attendu Savoir-faire / Savoir-etre / Savoirs)');
    }
  });

  // -- Parite categorieCompetence <-> DESCRIPTIFS_COMPETENCES --
  // Pas une obligation stricte (une competence sans descriptif garde
  // l'ancien comportement, voir commentaire au-dessus de
  // DESCRIPTIFS_COMPETENCES dans data/competences.js) mais un ecart vaut
  // d'etre signale plutot que de passer inapercu.
  clesCategorie.forEach(function (c) {
    if (!DESCRIPTIFS_COMPETENCES[c]) {
      avertissements.push('Competence "' + c + '" : aucun descriptif dans DESCRIPTIFS_COMPETENCES');
    }
  });
  clesDescriptifs.forEach(function (c) {
    if (!categorieCompetence[c]) {
      avertissements.push('Descriptif "' + c + '" : aucune categorie dans categorieCompetence ' +
        '(classee Savoir-faire par defaut a l\'affichage)');
    }
    if (!DESCRIPTIFS_COMPETENCES[c] || !DESCRIPTIFS_COMPETENCES[c].trim()) {
      erreurs.push('Competence "' + c + '" : descriptif vide');
    }
  });

  // -- Doublons probables entre libelles de categorieCompetence --
  for (var i = 0; i < clesCategorie.length; i++) {
    for (var j = i + 1; j < clesCategorie.length; j++) {
      if (correspond(clesCategorie[i], clesCategorie[j])) {
        avertissements.push('Competences potentiellement en double : "' + clesCategorie[i] +
          '" et "' + clesCategorie[j] + '" -- verifier s\'il faut fusionner');
      }
    }
  }

  // -- Vocabulaire reel savoirFaire/savoirEtre absent de categorieCompetence --
  // (les "savoirs" sont traites a part plus bas, volontairement moins
  // exhaustif -- voir TOP_SAVOIRS_NON_CATALOGUES ci-dessus)
  ['savoirFaire', 'savoirEtre'].forEach(function (champ) {
    Object.keys(freq[champ]).forEach(function (terme) {
      if (categorieCompetence[terme]) { return; }
      var procheDe = clesCategorie.filter(function (c) { return correspond(c, terme); });
      if (procheDe.length) {
        avertissements.push('Terme "' + terme + '" (' + champ + ', ' + freq[champ][terme] +
          'x dans les fiches metier) absent de categorieCompetence, proche de : ' +
          procheDe.join(', ') + ' -- coquille probable ou vrai terme distinct a trancher');
      } else {
        avertissements.push('Terme "' + terme + '" (' + champ + ', ' + freq[champ][terme] +
          'x dans les fiches metier) absent de categorieCompetence');
      }
    });
  });

  // -- Savoirs non catalogues : compte global + les plus frequents seulement --
  var savoirsAbsents = Object.keys(freq.savoirs).filter(function (t) { return !categorieCompetence[t]; });
  if (savoirsAbsents.length) {
    var topSavoirs = savoirsAbsents
      .sort(function (a, b) { return freq.savoirs[b] - freq.savoirs[a]; })
      .slice(0, TOP_SAVOIRS_NON_CATALOGUES)
      .map(function (t) { return t + ' (' + freq.savoirs[t] + 'x)'; });
    avertissements.push(savoirsAbsents.length + ' libelles "savoirs" non catalogues dans categorieCompetence ' +
      '(choix assumé, specifiques a un metier/secteur -- voir docs/CHANTIER_COMPETENCES.md). ' +
      'Les plus frequents : ' + topSavoirs.join(', '));
  }

  // -- Competences a 0 metier associe --
  clesCategorie.forEach(function (c) {
    var total = (freq.savoirFaire[c] || 0) + (freq.savoirEtre[c] || 0) + (freq.savoirs[c] || 0);
    if (total === 0) {
      avertissements.push('Competence "' + c + '" : aucun metier ne la cite dans ses fiches (0 piste possible pour cette competence)');
    }
  });

  // -- Competences peu discriminantes (rapport, jamais une obligation d'agir) --
  clesCategorie.forEach(function (c) {
    var total = (freq.savoirFaire[c] || 0) + (freq.savoirEtre[c] || 0) + (freq.savoirs[c] || 0);
    var taux = total / baseMetiers.length;
    if (taux > SEUIL_NON_DISCRIMINANTE) {
      avertissements.push('Competence "' + c + '" : presente dans ' + total + '/' + baseMetiers.length +
        ' metiers (' + Math.round(taux * 100) + ' %), peu discriminante pour orienter vers un metier precis');
    }
  });

  return {
    erreurs: erreurs, avertissements: avertissements,
    nbCompetences: clesCategorie.length, nbMetiers: baseMetiers.length
  };
}

function main() {
  var resultat;
  try {
    resultat = verifier();
  } catch (e) {
    console.error('Echec du chargement de data/competences.js ou data/metiers.js :', e.message);
    process.exit(1);
  }

  console.log('Referentiel competences : ' + resultat.nbCompetences + ' competences, ' +
    resultat.nbMetiers + ' fiches metier.\n');

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
