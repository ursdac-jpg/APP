/* ============================================================
   modules/coherence-transversale/collecte/relectureConfidentialite.js
   ------------------------------------------------------------
   Implementation LOCALE a ce module (meme decision que le Bilan, voir
   modules/bilan-candidature/CONTRATS.md, amendement confidentialite du
   2026-08-08) : aucun texte ne part vers une IA externe sans relecture
   et validation explicite. Reutilise les memes briques GENERIQUES que le
   Bilan (partagees par toute l'application, jamais un import du module
   Bilan lui-meme) :
     - ouvrirFenetreERIP()/fermerFenetreERIP() (js/app.js)
     - htmlVerificationDocument()/cablerVerificationDocument() (data/metiers.js)
     - echapperAttribut() (js/app.js)

   ctDemanderRelectureDossier() relit CV, lettre, puis entretien (si
   fourni), EN SEQUENCE. Invariant 6 (CONTRATS.md) : aucun texte envoye a
   l'IA sans relecture -- mais un document deja relu ailleurs (ex. deja
   passe par le composant de depot ouvrirAssistantDepotCV(), qui inclut
   sa propre etape de relecture/masquage) n'est jamais relu une seconde
   fois, meme principe que bilanDemanderRelectureCv() (Bilan, RC-02 --
   "cvDejaRelu"). Offre/entreprise ne sont jamais relues separement :
   informations publiques courtes, jamais un texte long transmis tel quel.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _ctUtilRelecture = require('../modeles/utilitaires.js');
  var ctCreerErreurMetier = _ctUtilRelecture.ctCreerErreurMetier;
}

// contenu : texte a relire. afficherEcran : fonction (contenu, titreDocument, callbacks) -> rien,
// chargee d'afficher l'ecran et d'appeler callbacks.onValider(contenuValide) ou callbacks.onAnnuler().
// dejaValide (optionnel, defaut false) : ce texte a deja ete relu ailleurs
// (ex. via ouvrirAssistantDepotCV()) -- resout immediatement, jamais une
// seconde relecture du meme contenu.
// Retourne une Promise<{contenuValide}>, rejetee avec RelectureAnnulee si annulee.
function ctDemanderRelectureDocument(contenu, titreDocument, afficherEcran, dejaValide) {
  if (dejaValide) { return Promise.resolve({ contenuValide: contenu }); }
  afficherEcran = afficherEcran || ctAfficherEcranRelectureParDefaut;
  return new Promise(function (resolve, reject) {
    afficherEcran(contenu, titreDocument, {
      onValider: function (contenuValide) { resolve({ contenuValide: contenuValide }); },
      onAnnuler: function () { reject(ctCreerErreurMetier('RelectureAnnulee', 'La relecture de "' + titreDocument + '" a été annulée avant l\'envoi.')); }
    });
  });
}

// dossier : DossierTransversal non encore valide (cv/lettre non vides,
// deja verifie par l'appelant -- voir modeles/dossierTransversal.js).
// dejaRelu (optionnel) : { cv, lettre, preparationEntretien } -- booleens,
// voir ctDemanderRelectureDocument ci-dessus.
// Retourne une Promise<{ cv, lettre, preparationEntretien }> une fois
// toutes les relectures necessaires faites. preparationEntretien absent
// du dossier -> jamais relu (rien a relire).
function ctDemanderRelectureDossier(dossier, afficherEcran, dejaRelu) {
  dejaRelu = dejaRelu || {};
  return ctDemanderRelectureDocument(dossier.cv, 'CV', afficherEcran, dejaRelu.cv).then(function (resultatCv) {
    return ctDemanderRelectureDocument(dossier.lettre, 'lettre de motivation', afficherEcran, dejaRelu.lettre).then(function (resultatLettre) {
      if (!dossier.preparationEntretien) {
        return { cv: resultatCv.contenuValide, lettre: resultatLettre.contenuValide, preparationEntretien: null };
      }
      return ctDemanderRelectureDocument(dossier.preparationEntretien, 'préparation d’entretien', afficherEcran, dejaRelu.preparationEntretien).then(function (resultatEntretien) {
        return { cv: resultatCv.contenuValide, lettre: resultatLettre.contenuValide, preparationEntretien: resultatEntretien.contenuValide };
      });
    });
  });
}

var CT_MESSAGE_TRANSPARENCE_RELECTURE =
  'Ce texte va être transmis à l’assistant que vous choisirez. Aucune anonymisation automatique n\'est ' +
  'effectuée (elle s\'est avérée impossible à fiabiliser) : relisez-le et modifiez ou supprimez vous-même toute ' +
  'information que vous ne souhaitez pas transmettre (nom, coordonnées, nom d\'employeur...).';

// Seule partie couplee au DOM. Reutilise le systeme de fenetre existant --
// aucune nouvelle primitive d'affichage creee pour ce besoin.
function ctAfficherEcranRelectureParDefaut(contenu, titreDocument, callbacks) {
  var idBoutonAnnuler = 'ctRelectureAnnulerBtn';
  var idBoutonContinuer = 'ctRelectureContinuerBtn';

  var cfgVerif = {
    mode: 'texte',
    titreDocument: titreDocument,
    texteInitial: contenu,
    onEnregistre: function () {
      var btn = document.getElementById(idBoutonContinuer);
      if (btn) { btn.disabled = false; btn.classList.add('bouton-incitation-action'); }
    }
  };

  ouvrirFenetreERIP({
    titre: '',
    taille: 'large',
    contenuHTML:
      '<p class="small text-muted">' + CT_MESSAGE_TRANSPARENCE_RELECTURE + '</p>' +
      htmlVerificationDocument(cfgVerif) +
      '<div class="d-flex justify-content-between align-items-center mt-4 pt-4" style="border-top:1px solid #E5E7EB;">' +
      '<button type="button" id="' + idBoutonAnnuler + '" class="btn btn-outline-secondary">Annuler</button>' +
      '<button type="button" id="' + idBoutonContinuer + '" class="btn btn-primary verif-doc-btn-continuer" disabled>Continuer &#8594;</button>' +
      '</div>'
  });

  cablerVerificationDocument(cfgVerif);

  function annuler() {
    fermerFenetreERIP();
    callbacks.onAnnuler();
  }

  document.getElementById(idBoutonContinuer).addEventListener('click', function () {
    if (document.getElementById(idBoutonContinuer).disabled) { return; }
    var champ = document.getElementById('verifDocTextarea');
    var contenuValide = champ ? champ.value : contenu;
    fermerFenetreERIP();
    callbacks.onValider(contenuValide);
  });
  document.getElementById(idBoutonAnnuler).addEventListener('click', annuler);
  var boutonFermerCroix = document.getElementById('fenetreERIPFermerBtn');
  if (boutonFermerCroix) { boutonFermerCroix.addEventListener('click', annuler); }
}

if (typeof module !== 'undefined') {
  module.exports = {
    ctDemanderRelectureDocument: ctDemanderRelectureDocument,
    ctDemanderRelectureDossier: ctDemanderRelectureDossier,
    ctAfficherEcranRelectureParDefaut: ctAfficherEcranRelectureParDefaut,
    CT_MESSAGE_TRANSPARENCE_RELECTURE: CT_MESSAGE_TRANSPARENCE_RELECTURE
  };
}
