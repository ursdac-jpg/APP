/* ============================================================
   modules/bilan-candidature/collecte/relectureConfidentialite.js
   ------------------------------------------------------------
   Implementation LOCALE au module (decision du 2026-08-08 : pas de
   service transversal modules/confidentialite/ pour cette V1, voir
   CONTRATS.md). Garantit qu'aucun texte ne part vers un assistant externe sans
   relecture et validation explicite -- aucune anonymisation automatique,
   la personne reste seule decisionnaire.

   Reutilise l'existant plutot que d'en creer un second :
     - ouvrirFenetreERIP()/fermerFenetreERIP() (js/app.js) : meme systeme
       de fenetre que tout le reste de l'application.
     - htmlDeclencheurDemoVideo('masquage-texte') (js/app.js) : video
       pedagogique deja existante, pas une nouvelle.
     - echapperAttribut() (js/app.js) : echappement deja utilise ailleurs
       pour inserer du texte utilisateur dans une zone editable.

   Design : bilanDemanderRelectureCv() est pure logique de flux (testable
   avec un afficherEcran injecte) ; bilanAfficherEcranRelectureParDefaut()
   est la seule partie couplee au DOM -- separation volontaire, la
   premiere est couverte par des tests unitaires, la seconde se verifie
   dans le navigateur.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanUtilRelecture = require('../modeles/utilitaires.js');
  var bilanCreerErreurMetier = _bilanUtilRelecture.bilanCreerErreurMetier;
}

// contenu : texte a relire (le CV). afficherEcran : fonction (contenu,
// callbacks) -> rien, chargee d'afficher l'ecran et d'appeler
// callbacks.onValider(contenuValide) ou callbacks.onAnnuler() une fois
// l'utilisateur decide -- jamais les deux, jamais aucun des deux.
// dejaValide (optionnel, defaut false) : ce texte a deja ete relu et
// valide ailleurs (ex. RC-02 -- depot leger, etape 2 du wizard partage)
// -- resout immediatement sans jamais afficher l'ecran, plutot qu'une
// seconde relecture du meme contenu. Capacite de la primitive elle-meme
// (jamais un ecran factice injecte par un appelant) : la garantie "jamais
// envoye sans relecture humaine" reste intacte, elle a simplement deja
// eu lieu.
// Retourne une Promise<{contenuValide}>, rejetee avec RelectureAnnulee
// si l'utilisateur annule.
function bilanDemanderRelectureCv(contenu, afficherEcran, dejaValide) {
  if (dejaValide) { return Promise.resolve({ contenuValide: contenu }); }
  afficherEcran = afficherEcran || bilanAfficherEcranRelectureParDefaut;
  return new Promise(function (resolve, reject) {
    afficherEcran(contenu, {
      onValider: function (contenuValide) {
        resolve({ contenuValide: contenuValide });
      },
      onAnnuler: function () {
        reject(bilanCreerErreurMetier('RelectureAnnulee', 'La relecture du CV a ete annulee avant l\'envoi.'));
      }
    });
  });
}

var BILAN_MESSAGE_TRANSPARENCE_RELECTURE =
  'Ce texte va être transmis à l’assistant que vous choisirez. Aucune anonymisation automatique n\'est ' +
  'effectuée (elle s\'est avérée impossible à fiabiliser) : relisez-le et modifiez ou supprimez vous-même toute ' +
  'information que vous ne souhaitez pas transmettre (nom, coordonnées, nom d\'employeur...).';

// Seule partie couplee au DOM. Reutilise le systeme de fenetre existant --
// aucune nouvelle primitive d'affichage creee pour ce besoin.
// TACHE (chantier "fenetre de verification unifiee") : le corps (role,
// zone de texte, detection auto, video) delegue desormais a
// htmlVerificationDocument()/cablerVerificationDocument() (data/metiers.js,
// meme composant que le wizard CV et Preparer un entretien) -- "J'ai
// vérifié, envoyer" devient "Enregistrer" (dans le corps) puis "Continuer"
// (pied de fenetre, actif seulement une fois enregistre), meme logique de
// bouton que partout ailleurs desormais.
function bilanAfficherEcranRelectureParDefaut(contenu, callbacks) {
  var idBoutonAnnuler = 'bilanRelectureAnnulerBtn';
  var idBoutonContinuer = 'bilanRelectureContinuerBtn';

  var cfgVerif = {
    mode: 'texte',
    titreDocument: 'CV',
    texteInitial: contenu,
    onEnregistre: function () {
      var btn = document.getElementById(idBoutonContinuer);
      if (btn) { btn.disabled = false; btn.classList.add('bouton-incitation-action'); }
    }
  };

  // TACHE (rapprochement maquette) : titre vide -- porte desormais par
  // htmlVerificationDocument() lui-meme (etiquette + titre principal),
  // jamais affiche deux fois.
  ouvrirFenetreERIP({
    titre: '',
    taille: 'large',
    contenuHTML:
      '<p class="small text-muted">' + BILAN_MESSAGE_TRANSPARENCE_RELECTURE + '</p>' +
      htmlVerificationDocument(cfgVerif) +
      // TACHE (rapprochement maquette, pied de fenetre) : meme gabarit que
      // le wizard CV et Preparer un entretien -- bord superieur, un
      // element de chaque cote, meme respiration (mt-4/pt-4).
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
  // La fenetre ERIP fournit deja son propre bouton de fermeture (croix,
  // id fixe "fenetreERIPFermerBtn") -- ferme-la sans le savoir sans ce
  // branchement : traite comme une annulation, jamais un envoi silencieux.
  var boutonFermerCroix = document.getElementById('fenetreERIPFermerBtn');
  if (boutonFermerCroix) { boutonFermerCroix.addEventListener('click', annuler); }
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanDemanderRelectureCv: bilanDemanderRelectureCv,
    bilanAfficherEcranRelectureParDefaut: bilanAfficherEcranRelectureParDefaut,
    BILAN_MESSAGE_TRANSPARENCE_RELECTURE: BILAN_MESSAGE_TRANSPARENCE_RELECTURE
  };
}
