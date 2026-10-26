/* ============================================================
   modules/vos-documents/familles.js
   ------------------------------------------------------------
   Registre des « familles » de parcours qui arrivent sur la page partagee « Vos documents » (pageResultats, js/app.js).
   Etape 0 de docs/CONCEPTION_REGISTRE_FAMILLES_VOS_DOCUMENTS_2026-10-26.md : cette fonction DECRIT le comportement actuel, a l'identique,
   sans rien changer a l'application (elle n'est pas encore chargee par index.html ni appelee par js/app.js).
   Les valeurs attendues sont celles MESUREES dans le navigateur le 26/10/2026 (docs/mesures_2026-10-26/matrice_vos_documents.REFERENCE.json).

   Fonction pure : aucune lecture de « dossier », de « window » ni du DOM. L'appelant (js/app.js) rassemblera les signaux, une seule fois.
   L'ordre des tests EST le comportement (precedence de pageResultats puis d'afficherProgression) : ne pas le modifier sans mettre a jour le test.
   Tests : tests/vosDocumentsFamilles.test.js.
   ============================================================ */

var VD_TITRE_PAR_DEFAUT = 'Vos documents';
var VD_TITRE_ESSAI = 'Nos modèles de CV';
var VD_TITRE_ENTRETIEN = 'Votre préparation d’entretien';
var VD_TITRES_RAPIDES = { lettre: 'Ma lettre de motivation rapide', entretien: 'Ma fiche de préparation à l’entretien' };

// Barre du haut et repere courant sur « Vos documents », dans l'ordre de pageResultats (barreHaut) puis d'afficherProgression('resultats').
function _vdBarre(s) {
  if (s.essaiModeles) { return { famille: 'essai-modeles', barre: 'ESSAI', indexBarre: null }; }
  if (s.origine === 'cv-sans-assistant' && s.modeFidele) { return { famille: 'voie3', barre: 'CSA', indexBarre: 4 }; }
  if (s.decouverteVersResultats) { return { famille: 'recit', barre: 'DECOUVERTE', indexBarre: s.cvTermine ? 7 : 6 }; }
  if (s.origine === 'un-cv-plusieurs-metiers') { return { famille: 'ucpm', barre: 'UCPM', indexBarre: s.aspectUcpm ? 4 : 2 }; }
  if (s.origine === 'prepa-entretien' && s.docActif === 'entretien') { return { famille: 'prepa-entretien', barre: 'PREPA_ENTRETIEN', indexBarre: 3 }; }
  if (s.modeCreation === 'maj') {
    return { famille: s.origineReformuler ? 'reformuler' : 'maj', barre: 'MAJ_CV', indexBarre: 4 };   // Reformuler porte la barre de « Mettre a jour » (constat C1)
  }
  if (s.modeCreation === 'pret') { return { famille: 'pret', barre: 'PREPARER_LETTRE_ENTRETIEN', indexBarre: 4 }; }
  if (s.modeCreation === 'nouveau') {
    return s.creationSansAssistant
      ? { famille: 'creer-main', barre: 'CREER_CV_SANS', indexBarre: 4 }
      : { famille: 'creer-assistant', barre: 'CREER_CV', indexBarre: 5 };
  }
  if ((s.origineCoLettre && s.docActif !== 'cv') || s.lettreDejaImportee) { return { famille: 'co-lettre', barre: 'CO_LETTRE', indexBarre: 3 }; }
  return { famille: s.origine === 'bilan' ? 'bilan' : 'direct', barre: 'ANCIENNE', indexBarre: null };   // ancienne barre a 9 reperes (constat C10)
}

// Grand titre de la page (pageResultats, h1).
function _vdTitre(s) {
  if (s.essaiModeles) { return VD_TITRE_ESSAI; }
  if (s.docActif === 'entretien' && s.origine === 'prepa-entretien') { return VD_TITRE_ENTRETIEN; }
  var rapide = (s.modeCreation === 'pret' || s.modeCreation === 'maj') && (s.docActif === 'lettre' || s.docActif === 'entretien');
  var coLettreEnCours = !!s.origineCoLettre && s.docActif !== 'cv';
  if (rapide && !coLettreEnCours) { return VD_TITRES_RAPIDES[s.docActif]; }
  return VD_TITRE_PAR_DEFAUT;
}

// Destination de « Retour » (resultatsCibleRetour, js/app.js) : le registre decrit, il ne navigue pas.
function _vdRetour(s, famille) {
  if (s.decouverteVersResultats) { return { type: 'fonction', cible: 'reafficherDecouverteCompetences()' }; }
  if (famille === 'ucpm') { return { type: 'fonction', cible: 'ucpmRetourDepuisEditeur()' }; }   // onclickPrecedent passe par le module (constat C12)
  var cible = s.importDirect ? (s.pageAvantImport || 'cv') : (s.origine || 'revelation');
  return { type: 'route', cible: cible };
}

// Fin du parcours (terminerParcours, js/app.js, decision de Denis 15, 16 et 17/09/2026 : pas de fenetre quand la page propose deja la suite).
function _vdFin(s) {
  if (s.docActif === 'cv') {
    return (s.modeCreation === 'nouveau' || s.origineReformuler) ? 'accueil' : 'fenetre-et-maintenant';
  }
  if (s.docActif === 'lettre') { return 'accueil'; }
  return 'fenetre-effacement';
}

function familleVosDocuments(signaux) {
  var s = signaux || {};
  var b = _vdBarre(s);
  return {
    famille: b.famille,
    barre: b.barre,
    indexBarre: b.indexBarre,
    titre: _vdTitre(s),
    retour: _vdRetour(s, b.famille),
    fin: _vdFin(s)
  };
}

if (typeof module !== 'undefined') {
  module.exports = { familleVosDocuments: familleVosDocuments };
}
