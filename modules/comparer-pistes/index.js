/* ============================================================
   modules/comparer-pistes/index.js
   ------------------------------------------------------------
   Module "Comparer mes pistes" (aide a la decision d'orientation).

   Fonction transversale : elle aide une personne qui hesite entre 2 ou 3
   pistes (metiers, formations, situations) a mieux comprendre les enjeux
   de chacune, JAMAIS a designer une "meilleure" option. Aucun score,
   aucun classement, aucun "metier d'avenir", aucun "metier choisi".
   Principe directeur et parcours complet : docs/CHANTIER_AIDE_DECISION_ORIENTATION.md
   Maquette de flux : docs/MAQUETTE_COMPARER_PISTES_FLUX_2026-08-31.html

   Meme patron que "Decouvrir mes competences" : PAGE routee (jamais une
   fenetre modale). L'etat de la session vit dans la closure de
   ouvrirComparerPistes() ; pageComparerPistes() (route 'comparer-pistes',
   js/app.js) redessine l'ecran courant, ou renvoie a la presentation du
   module (route 'aide-decision-intro') si aucune session n'est en cours.

   Parcours complet (blocs 2 a 9). Point d'entree : le CTA de
   pageIntroAideDecision (data/metiers.js) -> ouvrirComparerPistes() +
   naviguerVers('comparer-pistes').
   ============================================================ */

// Suivi d'usage (Umami via trackEvenement, js/app.js). Jamais de contenu
// personnel dans les evenements : seulement des compteurs et des libelles
// d'etape. Silencieux si le traqueur n'est pas charge.
function _comparerTrack(nom, props) {
  if (typeof trackEvenement === 'function') {
    try { trackEvenement(nom, props || undefined); } catch (e) { /* jamais bloquant */ }
  }
}
// Nom interne de la forme -> libelle clair pour le suivi d'usage.
function _comparerFormeLisible(f) {
  return ({
    'superposition': 'cote_a_cote',
    'frise': 'dans_le_temps',
    'mixte': 'mixte',
    'orientation-first': 'orientation_d_abord'
  })[f] || String(f || 'inconnue');
}

// ============================================================
// PANIER DE COMPARAISON -- point d'entree transversal.
// Depuis une carte de resultat de recherche ou le panneau "choix de
// parcours" d'un metier, la personne accumule 2 ou 3 pistes, puis lance
// la comparaison (barre fixe en bas). L'aiguillage reste : la comparaison
// arrive au bout d'une reflexion, jamais comme point de depart
// (docs/CHANTIER_AIDE_DECISION_ORIENTATION.md, "Ou la comparaison
// intervient").
// ============================================================
// ============================================================
//  "MA COMPARAISON" -- le sac unique et persistant.
//  Fusion de l'ancien panier (pistes mises de cote depuis une fiche
//  metier / la recherche) et de la session du module. Un seul objet,
//  _comparerEtat, qui vit dans ET hors du module. Il ne se vide JAMAIS
//  tout seul : seule la personne retire une piste (croix) ou efface
//  tout. bloc 1 du chantier "sac persistant" (maquette 2026-09-01).
// ============================================================
var _comparerEtat = null;      // l'objet unique, ou null si aucune comparaison
// TACHE (retour Denis 2026-09-20) : plus de plafond sur le nombre total de
// pistes de cote -- "elle peut en mettre autant qu'elle veut, il n'y a pas
// de probleme". Seul _COMPARER_ANALYSE_MAX (regardees ENSEMBLE) reste borne.
var _COMPARER_PANIER_MAX = Infinity;
var _COMPARER_ANALYSE_MAX = 3; // pistes regardees ENSEMBLE en un tour
var _comparerHandlerPanierInstalle = false;
var _comparerHandlerIconePanierInstalle = false;
// TACHE (retour Denis 2026-09-20) : pulse l'infobulle "i" du panneau a la
// toute premiere ouverture reelle -- meme principe que
// _reperesJournalInfoPulseDejaDeclenche/_carnetInfoPulseDejaDeclenche.
var _comparerInfoPulseDejaDeclenche = false;
var _comparerPisteSeq = 0;

function comparerAujourdhui() {
  try { return new Date().toISOString().slice(0, 10); } catch (e) { return ''; }
}

// 'AAAA-MM-JJ' -> "1er sept." / "28 août" (pour le badge "deja etudie le").
var _COMPARER_MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
function comparerDateCourte(iso) {
  if (!iso || String(iso).length < 10) { return ''; }
  var j = parseInt(String(iso).slice(8, 10), 10);
  var m = parseInt(String(iso).slice(5, 7), 10) - 1;
  if (isNaN(j) || m < 0 || m > 11) { return ''; }
  return (j === 1 ? '1er' : j) + ' ' + _COMPARER_MOIS[m];
}

// Fabrique une piste du sac. ajoutLe / etudieLe : dates ISO 'AAAA-MM-JJ'
// (etudieLe est pose a l'etape "Collecter", bloc 2).
function comparerFabriquerPiste(nom, opts) {
  opts = opts || {};
  _comparerPisteSeq += 1;
  return {
    id: 'p' + _comparerPisteSeq,
    nom: String(nom || '').trim(),
    source: opts.source || 'manuelle',
    etiquette: opts.etiquette || null,
    extrait: opts.extrait || '',
    couleur: opts.couleur || COMPARER_PALETTE[0],
    ajoutLe: opts.ajoutLe || comparerAujourdhui(),
    etudieLe: opts.etudieLe || null
  };
}

// L'objet neuf. Sorti de ouvrirComparerPistes() pour vivre au niveau
// module : persister entre deux entrees, etre nourri depuis l'exterieur.
function comparerEtatNeuf() {
  return {
    ecran: 0,
    _ecranMax: 0,
    recit: '',
    pistesNommees: [
      { nom: '', attrait: '' },
      { nom: '', attrait: '' },
      { nom: '', attrait: '' }
    ],
    piste3Visible: false,
    documentsTexte: '',
    situation: null,
    trancheAge: null,
    territoire: null,
    handicap: null,
    handicapNote: '',
    detectionBrut: '',
    detectionErreur: '',
    detectionFaite: false,
    _detectionPistes: null,
    _pistesConstruites: false,
    pistes: [],                // les <= 3 regardees ensemble
    pistesReserve: [],         // les autres, mises de cote
    ceQuiNeRentrePas: '',
    correctionAngle: 'auto',
    reponses: {},
    collecteBrut: '',
    collecteErreur: '',
    collecteAlertes: [],
    collecteSansAssistant: false,
    dossiersCollecte: null,
    formeComparaison: null,
    anglesVus: [],
    superpositionAffinee: null,
    superpositionAffineeErreur: '',
    friseBrut: '',
    friseErreur: '',
    friseSansAssistant: false,
    frise: null,
    pistesReflexionBrut: '',
    pistesReflexionErreur: '',
    pistesReflexionSautee: false,
    pistesReflexion: null,
    envoi: {},                 // phase de chaque envoi a un assistant : { detection|collecte|superpo|frise|apl : 'choix'|'chez'|'coller' }
    retenirTexte: ''
  };
}

// Les pistes actives portent les 3 couleurs de la palette dans l'ordre.
function comparerRecolorer(pistes) {
  (pistes || []).forEach(function (p, i) { p.couleur = COMPARER_PALETTE[i % COMPARER_PALETTE.length]; });
}

function _comparerNormNom(s) {
  return (typeof normaliserTexte === 'function') ? normaliserTexte(s) : String(s || '').toLowerCase().trim();
}

// Le sac = pistes regardees + pistes de cote, dans l'ordre.
function comparerSacPistes() {
  if (!_comparerEtat) { return []; }
  return (_comparerEtat.pistes || []).concat(_comparerEtat.pistesReserve || []);
}
function comparerPanierListe() {
  return comparerSacPistes().map(function (p) { return p.nom; });
}
function comparerPanierContient(nom) {
  var c = _comparerNormNom(nom);
  return comparerSacPistes().some(function (p) { return _comparerNormNom(p.nom) === c; });
}
// Ajouter une piste depuis une fiche metier / la recherche. Cree le sac
// si besoin. Va dans les "regardees" tant qu'il reste de la place (< 3),
// sinon en reserve. Rien n'est jamais retire ici.
// TACHE (retour Denis 2026-09-20) : etiquette AUTO-DETECTEE (metier si
// metierParNom() reconnait le nom -- vrai pour tous les appelants
// existants, qui passent toujours un vrai nom de metier issu d'une fiche
// ou de la recherche), sinon null ("a preciser" a l'affichage, voir
// _comparerRenduLignePiste). Corrige une etiquette 'metier' jusque-la
// posee EN DUR meme pour une piste tapee a la main (ecran 0, formulaire du
// panneau) qui n'en est pas forcement un.
function comparerPanierAjouter(nom) {
  nom = String(nom || '').trim();
  if (!nom || comparerPanierContient(nom)) { return false; }
  if (comparerSacPistes().length >= _COMPARER_PANIER_MAX) { return false; }
  var e = _comparerEtat || (_comparerEtat = comparerEtatNeuf());
  var etiquetteDeduite = (typeof metierParNom === 'function' && metierParNom(nom)) ? 'metier' : null;
  var piste = comparerFabriquerPiste(nom, { source: 'panier', etiquette: etiquetteDeduite });
  var nbActives = e.pistes.filter(function (p) { return (p.nom || '').trim(); }).length;
  if (nbActives < _COMPARER_ANALYSE_MAX) { e.pistes.push(piste); }
  else { e.pistesReserve.push(piste); }
  comparerRecolorer(e.pistes);
  e._pistesConstruites = true;
  _comparerMettreAJourIconePanier();
  // Suivi 1/3 : une piste a ete ajoutee a la comparaison depuis une fiche
  // metier ou un resultat de recherche (mesure l'usage du point d'entree).
  _comparerTrack('comparer_piste_ajoutee_depuis_fiche');
  return true;
}
function comparerPanierRetirer(nom) {
  if (!_comparerEtat) { return; }
  var c = _comparerNormNom(nom);
  _comparerEtat.pistes = (_comparerEtat.pistes || []).filter(function (p) { return _comparerNormNom(p.nom) !== c; });
  _comparerEtat.pistesReserve = (_comparerEtat.pistesReserve || []).filter(function (p) { return _comparerNormNom(p.nom) !== c; });
  comparerRecolorer(_comparerEtat.pistes);
  _comparerMettreAJourIconePanier();
}
// Vide tout le sac SANS confirmation (utilise par les tests). L'UI passe
// par comparerToutEffacer().
function comparerPanierVider() {
  comparerReinitialiser();
  _comparerMettreAJourIconePanier();
}

// "Tout effacer" (bouton de l'ecran 0). Une seule fenetre de confirmation
// qui nomme ce qui part. Pas d'annulation.
function comparerToutEffacer() {
  var faire = function () {
    comparerReinitialiser();
    _comparerMettreAJourIconePanier();
    if (typeof naviguerVers === 'function') { naviguerVers('aide-decision-intro'); }
  };
  if (typeof confirmerAction === 'function') {
    confirmerAction(
      'Tout effacer dans « Comparer mes pistes » ?',
      'Vont partir : les pistes de « Ma comparaison », les comparaisons déjà faites, et la comparaison en cours s’il y en a une. Vos autres modules, Mes Repères et Mon Carnet ne sont pas touchés. Il n’y a pas d’annulation.',
      'Tout effacer', 'btn-danger', faire
    );
  } else {
    faire();
  }
}

// Bouton "Comparer cette piste" a poser sur une carte metier / un panneau
// de metier. TACHE (retour Denis 2026-09-20) : une fois la piste ajoutee,
// le bouton reste visible mais devient INERTE (disabled) -- plus de bascule
// retour "Comparer"/"Retirer" depuis l'exterieur du module, pour eviter la
// surprise d'ajouter deux fois la meme chose. Retirer une piste ne se fait
// plus que depuis l'interieur de "Comparer mes pistes".
function comparerBoutonPanier(nom) {
  var dedans = comparerPanierContient(nom);
  var esc = (typeof echapperAttribut === 'function') ? echapperAttribut(nom) : String(nom).replace(/"/g, '&quot;');
  return '<button type="button" class="btn btn-sm btn-outline-primary cp-btn-panier' + (dedans ? ' cp-btn-panier-actif' : '') + '" ' +
    'data-cp-panier="' + esc + '"' + (dedans ? ' disabled' : '') + '><i class="bi bi-signpost-split"></i> ' +
    (dedans ? '&#10003; Dans la comparaison' : 'Comparer cette piste') + '</button>';
}

// Handler global (phase de CAPTURE) : intercepte un clic sur un bouton
// [data-cp-panier] AVANT les handlers de carte (bulle), pour ne pas
// declencher aussi l'ouverture du parcours de candidature de la carte.
// TACHE (retour Denis 2026-09-20) : ne quitte plus jamais l'ecran en cours
// -- ni saut direct dans le module, ni barre flottante avec un bouton
// "Ouvrir". A la place : un message ephemere (afficherToast, js/app.js) qui
// dit ou retrouver la piste, et disparait seul. Le bouton devient disabled
// une fois la piste ajoutee (voir comparerBoutonPanier) : un clic ne peut
// plus arriver ici pour une piste deja dedans (les navigateurs n'emettent
// pas de clic sur un bouton disabled), le garde ci-dessous n'est qu'une
// securite si le HTML etait reste perime.
function comparerInstallerHandlerPanier() {
  if (_comparerHandlerPanierInstalle || typeof document === 'undefined') { return; }
  _comparerHandlerPanierInstalle = true;
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-cp-panier]');
    if (!b) { return; }
    e.stopPropagation();
    e.preventDefault();
    var nom = b.getAttribute('data-cp-panier');
    if (comparerPanierContient(nom)) { return; }
    comparerPanierAjouter(nom);
    b.setAttribute('disabled', 'disabled');
    b.classList.add('cp-btn-panier-actif');
    b.innerHTML = '<i class="bi bi-signpost-split"></i> &#10003; Dans la comparaison';
    if (typeof afficherToast === 'function') {
      var nomAffiche = (typeof echapperTexte === 'function') ? echapperTexte(nom) : nom;
      afficherToast(
        '« ' + nomAffiche + ' » a été mis de côté pour comparer vos pistes. ' +
        'Vous pouvez continuer votre travail ici. Quand vous serez prêt(e), ouvrez le module « Comparer mes pistes » : ' +
        'vous y retrouverez tout ce que vous avez mis de côté.',
        12000
      );
    }
    _comparerMettreAJourIconePanier();
  }, true);
  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', _comparerMettreAJourIconePanier);
  }
}

// ============================================================
// Icone panier (retour Denis 2026-09-20, precise plusieurs fois le meme
// jour) : POSITION FIXE, meme ligne et meme gabarit que
// #btnPreferencesAffichage/#btnAide/#btnSessionTransfert (css/style.css)
// -- a droite au lieu d'a gauche, jamais recalculee en JS (contrairement a
// #btnJournalParcours). Cette place est volontairement AU-DESSUS de
// #btnCarnet (top: 90px) : aucune interference possible avec Carnet ni
// avec Journal, qui vivent dans une colonne distincte plus bas.
//
// Visible PARTOUT dans l'application (comme Carnet), des la 1re piste de
// cote (pas seulement a partir de 2, decision revue le jour meme) : la
// personne peut avoir mis un metier suggere par l'application, puis avoir
// en tete une 2e piste (une formation, par exemple) qui ne se trouve pas
// dans le catalogue -- il lui faut deja le panier pour pouvoir la creer
// elle-meme (voir formulaire d'ajout ci-dessous) et lancer la comparaison
// avec ces 2 pistes.
//
// Le panneau ouvert donne un petit historique (les 5 dernieres pistes de
// cote, extensible aux 10 dernieres), la possibilite d'ajouter une piste
// A LA MAIN (texte libre, pour une idee qui n'est pas dans le catalogue de
// metiers), et un acces DIRECT au module (naviguerVers) : a la difference
// du bouton "Comparer cette piste" d'une fiche metier, cliquer ICI est un
// geste volontaire de la personne qui veut consulter son panier -- jamais
// une interruption surprise d'un autre module.
// ============================================================

// TACHE (retour Denis 2026-09-20, derniere version) : les 5 dernieres
// pistes de cote sont TOUJOURS visibles (jamais besoin de cliquer pour
// les voir) ; un bouton "Voir l'historique" etend a 10. "Voir toutes mes
// pistes" reste separe et part directement dans le module, que
// l'historique soit ouvert ou non.
var _COMPARER_PANNEAU_HISTORIQUE_COURT = 5;
var _COMPARER_PANNEAU_HISTORIQUE_MAX = 10;
var _comparerPanneauHistoriqueOuvert = false;
// Id de la piste actuellement depliee dans le panneau (une seule a la
// fois, panneau etroit) -- remis a null a chaque fermeture.
var _comparerPanneauPisteOuverte = null;
// TACHE (retour Denis 2026-09-20) : le choix de type de piste (metier/
// formation/...) reste replie sur SON seul jeton actif une fois qu'il en
// existe un -- cliquer dessus deplie les autres pour en changer. Un seul
// booleen suffit (une seule piste depliee a la fois, voir ci-dessus) ;
// remis a false a chaque fois qu'on change de piste depliee ou qu'on
// ferme le panneau. Sans etiquette encore posee ("a preciser"), les
// jetons restent tous visibles d'emblee -- rien a replier sur un choix
// qui n'existe pas encore.
var _comparerPanneauEtiquettePickerOuvert = false;

function _comparerFermerPanneauPanier() {
  var panneau = (typeof document !== 'undefined') ? document.getElementById('panneauComparerPanier') : null;
  if (panneau) { panneau.hidden = true; }
  _comparerPanneauHistoriqueOuvert = false;
  _comparerPanneauPisteOuverte = null;
  _comparerPanneauEtiquettePickerOuvert = false;
}

// Retrouve une piste par id dans le sac (actives ou en reserve).
function _comparerPisteParId(id) {
  return comparerSacPistes().filter(function (p) { return p.id === id; })[0] || null;
}

// Une ligne de piste, avec son detail deplie ou non. TACHE (retour Denis
// 2026-09-20) : chaque piste est cliquable -- si elle correspond a un
// metier connu (metierParNom, data/metiers.js), affiche son savoir-faire/
// savoir-etre/savoirs deja identifies par l'application (matiere utile
// pour le prompt de comparaison) ; toujours une zone de notes libres
// (piste.extrait -- CHAMP DEJA EXISTANT, deja lu par le prompt et les
// questions de reprise, jamais un 2e champ redondant). Le bouton du bas
// change de role selon le contenu : rien a taper -> "Annuler" (ferme
// simplement) ; du texte -> "Valider" (enregistre puis ferme).
function _comparerRenduLignePiste(p) {
  var ouverte = (_comparerPanneauPisteOuverte === p.id);
  var detailHTML = '';
  if (ouverte) {
    var metier = (typeof metierParNom === 'function') ? metierParNom(p.nom) : null;
    var connuHTML = '<p class="cp-piste-detail-vide">Pas de fiche métier reconnue pour cette piste.</p>';
    if (metier) {
      var champ = function (label, liste) {
        return (liste && liste.length)
          ? '<p class="cp-piste-detail-ligne"><strong>' + label + ' :</strong> ' + echapperTexte(liste.join(', ')) + '</p>' : '';
      };
      connuHTML = champ('Savoir-faire', metier.savoirFaire) + champ('Savoir-être', metier.savoirEtre) + champ('Savoirs', metier.savoirs);
    }
    // TACHE (retour Denis 2026-09-20) : type de piste -- REUTILISE
    // COMPARER_ETIQUETTES (deja la table de reference plus bas dans ce
    // fichier, deja lue par le prompt de comparaison), jamais une 2e liste
    // metier/formation/idee inventee ici. Jetons cliquables, meme patron
    // que l'ecran 0 bis (data-cp-etiquette-idx, plus haut) mais adresses
    // par id de piste plutot que par index.
    // TACHE (retour Denis 2026-09-20, precise le meme jour) : une fois un
    // type deja choisi (auto-detecte ou pose a la main), un SEUL jeton
    // reste affiche -- cliquer dessus deplie les autres pour en changer.
    // Rien a replier tant qu'aucun choix n'existe encore (etiquette null).
    var etiquetteActuelle = COMPARER_ETIQUETTES.filter(function (e) { return e.id === p.etiquette; })[0];
    var jetonsEtiquette;
    if (etiquetteActuelle && !_comparerPanneauEtiquettePickerOuvert) {
      jetonsEtiquette = '<button type="button" class="cp-piste-etiquette-jeton cp-piste-etiquette-jeton-actif" ' +
        'data-cp-piste-etiquette-deplier="' + p.id + '">' + etiquetteActuelle.libelle + ' <i class="bi bi-pencil"></i></button>';
    } else {
      jetonsEtiquette = COMPARER_ETIQUETTES.map(function (e) {
        return '<button type="button" class="cp-piste-etiquette-jeton' + (p.etiquette === e.id ? ' cp-piste-etiquette-jeton-actif' : '') +
          '" data-cp-piste-etiquette="' + p.id + '" data-etiquette-id="' + e.id + '">' + e.libelle + '</button>';
      }).join('');
    }
    var aDuTexte = !!(p.extrait && p.extrait.trim());
    detailHTML = '<div class="cp-piste-detail">' +
      connuHTML +
      '<label class="cp-piste-detail-label">De quel type de piste s’agit-il ?</label>' +
      '<div class="cp-piste-etiquette-jetons">' + jetonsEtiquette + '</div>' +
      '<label class="cp-piste-detail-label">Vos notes sur cette piste</label>' +
      '<textarea class="form-control form-control-sm" rows="2" data-cp-piste-contexte="' + p.id +
      '" placeholder="Ce qui vous attire, ce que vous savez déjà...">' + echapperTexte(p.extrait || '') + '</textarea>' +
      '<button type="button" class="btn btn-sm ' + (aDuTexte ? 'btn-primary' : 'btn-outline-secondary') +
      ' cp-piste-detail-bouton" data-cp-piste-detail-bouton="' + p.id + '">' + (aDuTexte ? 'Valider' : 'Annuler') + '</button>' +
      '</div>';
  }
  // Suffixe "(libellé)" -- MEME format que celui deja utilise pour le
  // prompt de comparaison (voir plus bas dans ce fichier, "t += ' (' +
  // etq.libelle + ')'"), jamais une 2e mise en forme inventee. Pas encore
  // identifiee -> invite a preciser plutot que de rester muet.
  var etq = COMPARER_ETIQUETTES.filter(function (e) { return e.id === p.etiquette; })[0];
  var suffixeEtiquette = '<span class="cp-piste-ligne-etiquette' + (etq ? '' : ' cp-piste-ligne-etiquette-vide') + '">' +
    '(' + (etq ? etq.libelle : 'à préciser') + ')</span>';
  return '<li class="cp-piste-item' + (ouverte ? ' cp-piste-item-ouverte' : '') + '">' +
    '<button type="button" class="cp-piste-ligne" data-cp-piste-toggle="' + p.id + '">' +
    '<span class="cp-pastille" style="background:' + (p.couleur || '#2563eb') + ';"></span>' +
    '<span class="cp-piste-ligne-nom">' + echapperTexte(p.nom) + '</span>' +
    suffixeEtiquette +
    '<i class="bi ' + (ouverte ? 'bi-chevron-up' : 'bi-chevron-down') + '"></i>' +
    '</button>' +
    detailHTML +
    '</li>';
}

// Contenu du panneau : les 5 dernieres pistes de cote TOUJOURS visibles
// (chacune cliquable pour son detail), un bouton "Voir l'historique" pour
// etendre a 10, un formulaire d'ajout a la main, et un bouton separe pour
// aller directement au module -- jamais de case a cocher DUPLIQUEE ici
// (l'ecran d'accueil du module sait deja faire choisir jusqu'a 3 pistes a
// etudier ensemble).
function _comparerRenduPanneauPanier() {
  var toutes = comparerSacPistes().slice().reverse();
  var n = toutes.length;
  var limite = _comparerPanneauHistoriqueOuvert ? _COMPARER_PANNEAU_HISTORIQUE_MAX : _COMPARER_PANNEAU_HISTORIQUE_COURT;
  var listeHTML = '<ul class="cp-panneau-panier-liste">' + toutes.slice(0, limite).map(_comparerRenduLignePiste).join('') + '</ul>';
  var boutonHistorique = (n > _COMPARER_PANNEAU_HISTORIQUE_COURT)
    ? '<button type="button" class="cp-panneau-panier-historique" data-cp-panneau-historique>' +
      '<i class="bi ' + (_comparerPanneauHistoriqueOuvert ? 'bi-chevron-up' : 'bi-chevron-down') + '"></i> ' +
      (_comparerPanneauHistoriqueOuvert ? 'Voir moins' : 'Voir l’historique') +
      ' <span class="cp-panneau-panier-historique-n">(' + Math.min(n, _COMPARER_PANNEAU_HISTORIQUE_MAX) + ' dernières)</span>' +
      '</button>'
    : '';
  return '<div class="cp-panneau-panier-entete">' +
    '<div class="cp-panneau-panier-entete-titre">' +
    '<h6><i class="bi bi-signpost-split"></i> Pistes de côté</h6>' +
    '<button type="button" class="bulle-info-hover bulle-info-icone" ' +
    'data-tooltip="Un raccourci pour mettre une piste de côté (un métier, une formation, une idée) sans quitter votre page. Retrouvez tout dans « Comparer mes pistes », accessible aussi depuis la Boîte à outils." ' +
    'aria-label="À quoi servent les Pistes de côté ? Un raccourci pour mettre une piste de côté sans quitter votre page. Retrouvez tout dans Comparer mes pistes, accessible aussi depuis la Boîte à outils.">&#8505;</button>' +
    '</div>' +
    '<button type="button" class="cp-panneau-panier-fermer" aria-label="Fermer" data-cp-panneau-fermer>&#10005;</button>' +
    '</div>' +
    '<p class="cp-panneau-panier-intro">Ce que vous avez mis de côté pour comparer vos pistes.</p>' +
    listeHTML +
    boutonHistorique +
    '<div class="cp-panneau-panier-ajout">' +
    '<input type="text" class="form-control form-control-sm" placeholder="Ajouter une piste à la main (une formation, une idée...)" data-cp-panneau-nouvelle-piste>' +
    '<button type="button" class="btn btn-outline-primary btn-sm" data-cp-panneau-ajouter>Ajouter</button>' +
    '</div>' +
    '<button type="button" class="btn btn-primary btn-sm w-100" data-cp-panneau-voir-tout>Voir toutes mes pistes &#8594;</button>';
}

// Enregistre (ou efface) la note libre d'une piste depuis le panneau, puis
// referme son detail. TACHE : ecrit directement dans piste.extrait, le
// MEME champ que "Je nomme mes pistes" (ecran 0) -- jamais un 2e champ.
function _comparerPanneauValiderNotePiste(id) {
  var panneau = document.getElementById('panneauComparerPanier');
  var champ = panneau ? panneau.querySelector('[data-cp-piste-contexte="' + id + '"]') : null;
  var piste = _comparerPisteParId(id);
  if (piste) { piste.extrait = champ ? champ.value.trim() : ''; }
  _comparerPanneauPisteOuverte = null;
  if (panneau) { panneau.innerHTML = _comparerRenduPanneauPanier(); }
}

// Ajoute la piste tapee dans le formulaire du panneau (texte libre --
// meme fonction que le bouton d'une fiche metier, comparerPanierAjouter,
// une seule source de verite pour le sac).
function _comparerPanneauAjouterPisteLibre() {
  var champ = (typeof document !== 'undefined') ? document.getElementById('panneauComparerPanier').querySelector('[data-cp-panneau-nouvelle-piste]') : null;
  if (!champ) { return; }
  var nom = champ.value.trim();
  if (!nom) { return; }
  comparerPanierAjouter(nom);
  var panneau = document.getElementById('panneauComparerPanier');
  if (panneau) { panneau.innerHTML = _comparerRenduPanneauPanier(); }
}

function _comparerInstallerHandlerIconePanier() {
  if (_comparerHandlerIconePanierInstalle || typeof document === 'undefined') { return; }
  _comparerHandlerIconePanierInstalle = true;
  document.addEventListener('click', function (e) {
    var bouton = document.getElementById('btnComparerPanier');
    var panneau = document.getElementById('panneauComparerPanier');
    if (!bouton || !panneau) { return; }
    if (e.target.closest && e.target.closest('#btnComparerPanier')) {
      var ouvrait = !panneau.hidden;
      panneau.hidden = ouvrait;
      if (!ouvrait) {
        _comparerPanneauHistoriqueOuvert = false;
        panneau.innerHTML = _comparerRenduPanneauPanier();
        // TACHE (retour Denis 2026-09-20) : pulse l'infobulle "i" a la
        // toute premiere ouverture reelle -- meme principe/intensite/duree
        // que .reperes-journal-info et l'infobulle du Carnet.
        var boutonInfo = panneau.querySelector('.bulle-info-hover');
        if (!_comparerInfoPulseDejaDeclenche && boutonInfo) {
          _comparerInfoPulseDejaDeclenche = true;
          boutonInfo.classList.add('cp-pulse-confirmation');
          setTimeout(function () { boutonInfo.classList.remove('cp-pulse-confirmation'); }, 10000);
        }
      }
      return;
    }
    if (e.target.closest && e.target.closest('[data-cp-panneau-fermer]')) { _comparerFermerPanneauPanier(); return; }
    if (e.target.closest && e.target.closest('[data-cp-panneau-historique]')) {
      _comparerPanneauHistoriqueOuvert = !_comparerPanneauHistoriqueOuvert;
      panneau.innerHTML = _comparerRenduPanneauPanier();
      return;
    }
    if (e.target.closest && e.target.closest('[data-cp-panneau-ajouter]')) { _comparerPanneauAjouterPisteLibre(); return; }
    if (e.target.closest && e.target.closest('[data-cp-panneau-voir-tout]')) {
      _comparerFermerPanneauPanier();
      if (typeof naviguerVers === 'function') { naviguerVers('comparer-pistes'); }
      return;
    }
    var toggle = e.target.closest && e.target.closest('[data-cp-piste-toggle]');
    if (toggle) {
      var idClique = toggle.getAttribute('data-cp-piste-toggle');
      _comparerPanneauPisteOuverte = (_comparerPanneauPisteOuverte === idClique) ? null : idClique;
      _comparerPanneauEtiquettePickerOuvert = false;
      panneau.innerHTML = _comparerRenduPanneauPanier();
      return;
    }
    var boutonDetail = e.target.closest && e.target.closest('[data-cp-piste-detail-bouton]');
    if (boutonDetail) { _comparerPanneauValiderNotePiste(boutonDetail.getAttribute('data-cp-piste-detail-bouton')); return; }
    var deplierEtiquette = e.target.closest && e.target.closest('[data-cp-piste-etiquette-deplier]');
    if (deplierEtiquette) {
      _comparerPanneauEtiquettePickerOuvert = true;
      panneau.innerHTML = _comparerRenduPanneauPanier();
      return;
    }
    var jetonEtiquette = e.target.closest && e.target.closest('[data-cp-piste-etiquette]');
    if (jetonEtiquette) {
      var pisteEtq = _comparerPisteParId(jetonEtiquette.getAttribute('data-cp-piste-etiquette'));
      if (pisteEtq) { pisteEtq.etiquette = jetonEtiquette.getAttribute('data-etiquette-id'); }
      // TACHE (retour Denis 2026-09-20) : un choix vient d'etre fait ->
      // se replie tout seul sur ce seul jeton, prete pour la prochaine fois.
      _comparerPanneauEtiquettePickerOuvert = false;
      panneau.innerHTML = _comparerRenduPanneauPanier();
      return;
    }
    // TACHE (retour Denis 2026-09-20) : jamais de fermeture au clic
    // ailleurs -- meme comportement que #panneauCarnet, seule la croix
    // (data-cp-panneau-fermer, ci-dessus) ou l'icone elle-meme ferment.
  });
  // Touche "Entree" dans le champ d'ajout -- meme confort qu'un vrai
  // formulaire, sans en faire un <form> (deja masque hors de #app).
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target && e.target.matches && e.target.matches('[data-cp-panneau-nouvelle-piste]')) {
      e.preventDefault();
      _comparerPanneauAjouterPisteLibre();
    }
  });
  // Le bouton du bas de detail change de role (Annuler/Valider) SANS
  // re-rendre tout le panneau a chaque frappe -- perdrait le focus et la
  // position du curseur dans la zone de texte.
  document.addEventListener('input', function (e) {
    if (!(e.target && e.target.matches && e.target.matches('[data-cp-piste-contexte]'))) { return; }
    var id = e.target.getAttribute('data-cp-piste-contexte');
    var bouton = document.querySelector('[data-cp-piste-detail-bouton="' + id + '"]');
    if (!bouton) { return; }
    var aDuTexte = !!e.target.value.trim();
    bouton.textContent = aDuTexte ? 'Valider' : 'Annuler';
    bouton.classList.toggle('btn-primary', aDuTexte);
    bouton.classList.toggle('btn-outline-secondary', !aDuTexte);
  });
}

// Appelee a chaque navigation reelle (js/app.js, meme patron que
// carnetApresNavigation/reperesApresNavigation) ET a chaque changement
// interne au sac (ajout/retrait/vidage). Seule condition d'affichage :
// au moins 1 piste de cote -- jamais liee a la page courante (icone
// globale, comme Carnet).
// TACHE (retour Denis 2026-09-20) : #btnComparerPanier reste a une
// position FIXE (voir css/style.css), quelle que soit la page -- plus de
// calcul dynamique (positionnerIconePersistante). Decision assumee :
// Denis a choisi la constance entre les pages plutot que le calcul qui
// evitait un chevauchement avec un titre exceptionnellement haut.
function _comparerMettreAJourIconePanier() {
  if (typeof document === 'undefined') { return; }
  var bouton = document.getElementById('btnComparerPanier');
  if (!bouton) { return; }
  var visible = comparerSacPistes().length >= 1;
  bouton.hidden = !visible;
  // Carnet doit se recaler (fermer son panneau perime) qu'on vienne de
  // reveler ou de masquer le panier -- toujours appele, avant le return
  // de la branche masquee.
  if (typeof carnetApresNavigation === 'function') { carnetApresNavigation(); }
  if (!visible) { _comparerFermerPanneauPanier(); return; }
  _comparerInstallerHandlerIconePanier();
  var panneau = document.getElementById('panneauComparerPanier');
  if (panneau && !panneau.hidden) { panneau.innerHTML = _comparerRenduPanneauPanier(); }
}

function comparerApresNavigation(route) {
  _comparerMettreAJourIconePanier();
}

// Barre d'etapes visuelle du module : meme composant que "Analyser ma
// candidature" et "Decouvrir mes competences" (barreEtapesModule, js/app.js).
var COMPARER_NAV_ETAPES = [
  { label: 'Mes pistes', icone: '&#128203;' },        // clipboard
  { label: 'Collecter', icone: '&#128269;' },         // loupe
  { label: 'Fiches', icone: '&#128196;' },            // page
  { label: 'Comparer', icone: '&#128209;' },          // pages cote a cote
  { label: 'Aller plus loin', icone: '&#128161;' },   // ampoule (etape optionnelle)
  { label: 'Ce que je retiens', icone: '&#128278;' }  // marque-page
];

// Index interne d'ecran (0..8) -> index de repere (0..5).
function _comparerNavIndex(ecran) {
  var table = [0, 0, 1, 2, 3, 3, 3, 4, 5];
  var i = table[ecran];
  return (typeof i === 'number') ? i : -1;
}

// Les 4 temps decrits dans le choix de l'assistant, pour l'etape « Collecter les informations » (composant commun htmlChoixAssistantBilanCorps).
var COMPARER_ETAPES_CHOIX_IA = [
  { titre: 'Copie', detail: 'Le texte préparé est copié automatiquement, rien à écrire ni à coller vous-même.' },
  { titre: 'Recherche', detail: 'L’assistant cherche sur internet les informations officielles sur vos pistes (formation, coûts, aides, recrutement).' },
  { titre: 'Réponse', detail: 'Vous revenez ici et collez sa réponse : le texte reste caché, vous n’avez rien à relire.' },
  { titre: 'Vérification', detail: 'L’application signale une réponse qui n’a pas l’air fiable (sans source, dates douteuses). Rien n’est appliqué sans vous.' }
];
// Les 3 temps pour les etapes qui ne cherchent rien sur internet (l'assistant ne fait que lire ou reorganiser ce qui est deja dans l'application).
var COMPARER_ETAPES_CHOIX_IA_SANS_WEB = [
  { titre: 'Copie', detail: 'Le texte préparé est copié automatiquement, rien à écrire ni à coller vous-même.' },
  { titre: 'Réflexion', detail: 'L’assistant lit seulement ce qui est déjà dans l’application : aucune recherche sur internet n’est nécessaire.' },
  { titre: 'Réponse', detail: 'Vous revenez ici et collez sa réponse : le texte reste caché, vous n’avez rien à relire.' }
];
var _comparerIntervalleDecompte = null;

var COMPARER_TITRES_ECRANS = [
  'Ajouter mes pistes',
  'Les pistes qu’on a comprises',
  'Collecter les informations',
  'Une fiche par piste',
  'Deux angles pour vos pistes',
  'Superposer : les pistes côte à côte',
  'Dans le temps',
  'Aller plus loin : pistes de réflexion',
  'Ce que vous retenez'
];

// Bloc A : ou en etes-vous. (id -> libelle) -- les id conditionnent plus
// tard le routage des questions du bloc B (ecran 0 bis).
var COMPARER_SITUATIONS = [
  { id: 'emploi', libelle: 'En emploi (CDI, CDD, intérim)' },
  { id: 'sans-emploi', libelle: 'Sans emploi' },
  { id: 'formation', libelle: 'En formation ou études' },
  { id: 'foyer', libelle: 'Au foyer, aidant(e)' },
  { id: 'arret-sante', libelle: 'En arrêt ou souci de santé' },
  { id: 'independant', libelle: 'J’ai, ou je crée, une activité indépendante' }
];
var COMPARER_TRANCHES_AGE = [
  { id: '-26', libelle: 'Moins de 26 ans' },
  { id: '26-45', libelle: '26 à 45 ans' },
  { id: '45+', libelle: '45 ans et plus' }
];

// _comparerRenduEcran : la fonction afficherEcran de la session en cours,
// ou null si aucune session. _comparerEcranCourant : dernier ecran rendu.
var _comparerRenduEcran = null;
var _comparerEcranCourant = 0;

// Cible de la route 'comparer-pistes' (js/app.js). Le sac persiste, donc
// on rouvre des qu'il existe une comparaison (meme sans rendu en cours,
// par ex. apres une restauration disquette).
function pageComparerPistes() {
  if (_comparerEtat || typeof _comparerRenduEcran === 'function') {
    ouvrirComparerPistes();
    return;
  }
  if (typeof naviguerVers === 'function') { naviguerVers('aide-decision-intro'); }
}

// TACHE (chantier "bouton presentation", 2026-09-01, alignement sur
// Coherence) : _comparerDetourPresentation = detour de CONSULTATION
// ("Revoir la presentation" depuis un ecran de travail, pas d'encart) ;
// _comparerReprisePendante = retour dans le module avec une comparaison en
// cours (encart "Continuer / Recommencer" a droite + gel jusqu'au choix).
var _comparerDetourPresentation = false;
var _comparerReprisePendante = false;

// TACHE (correctif boucle Retour, 2026-09-09 -- LECONS section 2,
// "Variante boucle infinie"). "Retour" de la barre du bas (et du bouton
// "Retour" en tete depuis le tout premier ecran) : ouvre la presentation
// en mode NORMAL (jamais detour), dont le propre "Retour" enchaine vers
// l'accueil de la carte (retourVersCarteAccueil, voir pageIntroAideDecision).
// AVANT : "Retour" appelait comparerRetourVersPresentation() (detour) dont
// le "Retour" revenait a l'ecran de travail -> les deux se pointaient l'un
// l'autre, plus aucun moyen de reculer jusqu'a l'accueil.
// Actions de la barre du bas commune, posees a chaque rendu d'ecran par ouvrirComparerPistes() (elles connaissent l'etat de la session).
var _comparerActionsBarre = { retour: null, continuer: null };
function comparerBarreRetour() {
  if (typeof _comparerActionsBarre.retour === 'function') { _comparerActionsBarre.retour(); } else { comparerRetour(); }
}
function comparerBarreContinuer() {
  if (typeof _comparerActionsBarre.continuer === 'function') { _comparerActionsBarre.continuer(); }
}

function comparerRetour() {
  _comparerDetourPresentation = false;
  // Retour Denis 2026-09-30 (C17) : depuis le premier ecran, « Retour » ramene a la page d'ou la personne est venue, pas a la
  // presentation du module. Repli (origine inconnue, par ex. apres une restauration) : la presentation, comme avant.
  var origine = (typeof _pageOrigineAvantAideDecision !== 'undefined') ? _pageOrigineAvantAideDecision : null;
  if (typeof naviguerVers === 'function') { naviguerVers(origine || 'aide-decision-intro'); }
}

// "Revoir la presentation" (bouton contextuel en tete d'ecran) -> page de
// presentation en mode DETOUR de consultation, jamais l'accueil (bouton
// "Accueil" pour ca). Non destructif : l'etat de la session reste dans la
// closure. Reserve a ce seul bouton (voir correctif boucle ci-dessus).
function comparerRetourVersPresentation() {
  _comparerDetourPresentation = true;
  if (typeof naviguerVers === 'function') { naviguerVers('aide-decision-intro'); }
}

// "Revenir au module" depuis la presentation en detour -> retour exact a
// l'ecran de travail quitte.
function comparerRevenirDeLaPresentation() {
  _comparerDetourPresentation = false;
  if (typeof naviguerVers === 'function') { naviguerVers('comparer-pistes'); }
}

// "Continuer" de l'encart de reprise -> leve le gel, garde tout l'etat.
function comparerRepriseContinuer() {
  _comparerReprisePendante = false;
  if (typeof naviguerVers === 'function') { naviguerVers('comparer-pistes'); }
}

// Detruit la comparaison (appele par "Recommencer" et "Tout effacer").
// C'est le SEUL endroit qui remet _comparerEtat a null.
function comparerReinitialiser() {
  _comparerEtat = null;
  _comparerRenduEcran = null;
  _comparerEcranCourant = 0;
  _comparerDetourPresentation = false;
  _comparerReprisePendante = false;
}

// ---- Pont disquette (LECONS 7ter) : ce module garde son etat hors de
// `dossier`. _comparerEtat EST l'etat a sauvegarder -- un objet de
// donnees pures, serialisable tel quel. Branche dans js/app.js
// (collecterEtatsModulesPourSauvegarde / restaurerEtatsModules).
function comparerPistesExporterEtatPourSauvegarde() {
  if (!_comparerEtat) { return null; }
  var e = _comparerEtat;
  var vide = !((e.pistes && e.pistes.length) || (e.pistesReserve && e.pistesReserve.length) ||
    (e.recit || '').trim() || (e.documentsTexte || '').trim());
  if (vide) { return null; }
  try { return JSON.parse(JSON.stringify(e)); } catch (err) { return null; }
}
function comparerPistesRestaurerEtatDepuisSauvegarde(snap) {
  if (snap && typeof snap === 'object' && (Array.isArray(snap.pistes) || Array.isArray(snap.pistesReserve))) {
    _comparerEtat = snap;
    _comparerEtat.pistes = _comparerEtat.pistes || [];
    _comparerEtat.pistesReserve = _comparerEtat.pistesReserve || [];
    _comparerRenduEcran = null; // le rendu en cours (s'il existe) est perime
  } else {
    _comparerEtat = null;
    _comparerRenduEcran = null;
  }
  _comparerMettreAJourIconePanier();
}

// ---- Ouverture du module. Le sac (_comparerEtat) persiste entre deux
// entrees : on ne le reconstruit plus ici, on l'ouvre. Les pistes venues
// des fiches metier / de la recherche y sont deja (comparerPanierAjouter).
function ouvrirComparerPistes() {
  var premiereFois = !_comparerEtat;
  if (premiereFois) { _comparerTrack('comparer_session_demarree'); }
  var etat = _comparerEtat || (_comparerEtat = comparerEtatNeuf());

  var app = document.getElementById('app');

  // ------------------------------------------------------------------
  // ECRAN 0 -- Ajouter mes pistes
  // ------------------------------------------------------------------
  function ecran0AuMoinsUneFacon() {
    if ((etat.recit || '').trim()) { return true; }
    if ((etat.documentsTexte || '').trim()) { return true; }
    if (etat.pistes.some(function (p) { return (p.nom || '').trim(); })) { return true; } // pistes du panier
    if ((etat.pistesReserve || []).some(function (p) { return (p.nom || '').trim(); })) { return true; }
    return etat.pistesNommees.some(function (p) { return (p.nom || '').trim(); });
  }
  function ecran0NbActivesNommees() {
    return (etat.pistes || []).filter(function (p) { return (p.nom || '').trim(); }).length;
  }
  function ecran0PeutContinuer() {
    if (!ecran0AuMoinsUneFacon() || !etat.situation) { return false; }
    if ((etat.pistesReserve || []).length && ecran0NbActivesNommees() < 2) { return false; }
    return true;
  }
  function ecran0RaisonBlocage() {
    if (!ecran0AuMoinsUneFacon()) {
      return 'Commencez par nous parler de vos pistes : racontez, nommez-les, ou collez un texte.';
    }
    if (!etat.situation) { return 'Indiquez où vous en êtes en ce moment.'; }
    if ((etat.pistesReserve || []).length && ecran0NbActivesNommees() < 2) {
      return 'Cochez au moins 2 pistes à regarder ensemble.';
    }
    return '';
  }

  function ecran0PiluleFacons() {
    return ecran0AuMoinsUneFacon()
      ? '<span class="pilule-etat pe-ok">Vos pistes sont là</span>'
      : '<span class="pilule-etat pe-attente">À remplir</span>';
  }
  function ecran0PiluleSituation() {
    if (!etat.situation) { return '<span class="pilule-etat pe-attente">À remplir</span>'; }
    var s = COMPARER_SITUATIONS.filter(function (o) { return o.id === etat.situation; })[0];
    return '<span class="pilule-etat pe-ok">' + echapperAttribut(s ? s.libelle : '') + '</span>';
  }
  function ecran0PiluleTerritoire() {
    var lbl = _comparerTerritoireLibelle(etat.territoire);
    return lbl
      ? '<span class="pilule-etat pe-ok">' + echapperAttribut(lbl) + '</span>'
      : '<span class="pilule-etat pe-info">National par défaut</span>';
  }
  function ecran0PiluleHandicap() {
    if (etat.handicap === 'rqth') { return '<span class="pilule-etat pe-info">RQTH indiquée</span>'; }
    if (etat.handicap === 'besoin') { return '<span class="pilule-etat pe-info">Besoin possible</span>'; }
    if (etat.handicap === 'non') { return '<span class="pilule-etat pe-info">Non concerné(e)</span>'; }
    return '';
  }

  function ecran0HTML() {
    var pistesNommeesHTML = '';
    for (var i = 0; i < 3; i++) {
      if (i === 2 && !etat.piste3Visible) { continue; }
      var p = etat.pistesNommees[i];
      pistesNommeesHTML +=
        '<p style="font-size:.9rem;margin:.5rem 0 .2rem;"><strong>Piste ' + (i + 1) + '</strong></p>' +
        '<input type="text" class="form-control form-control-sm" data-cp-piste-nom="' + i + '" ' +
        'placeholder="Nom de la piste (ex. CAP vendeur)" value="' + echapperAttribut(p.nom || '') + '">' +
        '<textarea class="form-control form-control-sm mt-1" rows="2" data-cp-piste-attrait="' + i + '" ' +
        'placeholder="Ce qui m’attire dans cette piste, pourquoi je voudrais la faire...">' +
        echapperTexte(p.attrait || '') + '</textarea>';
    }
    if (!etat.piste3Visible) {
      pistesNommeesHTML +=
        '<button type="button" class="btn btn-outline-secondary btn-sm mt-2" data-cp-ajouter-piste3>+ Ajouter une 3e piste</button>';
    }

    var territoireLbl = _comparerTerritoireLibelle(etat.territoire);

    // Pistes deja presentes (arrivee depuis une fiche metier / la recherche,
    // ou reprise d'une session) : on les MONTRE des l'ecran 0, sinon la
    // personne croit que sa selection a ete perdue. Retrait possible ici ;
    // renommage / couleur / etiquette a l'ecran suivant (0 bis).
    // Si des pistes ont ete mises de cote (plus de 3 ajoutees), l'ecran 0
    // devient un choix : cocher les 2 ou 3 a regarder ensemble.
    var recapActives = (etat.pistes || []).filter(function (p) { return (p.nom || '').trim(); });
    var recapReserve = (etat.pistesReserve || []).filter(function (p) { return (p.nom || '').trim(); });
    var recapChoix = recapReserve.length > 0;
    var recapHTML = '';
    if (recapActives.length || recapReserve.length) {
      var ligneRecap = function (p, active) {
        var styleP = active
          ? 'background:' + echapperAttribut(p.couleur || '#2563eb') + ';'
          : 'background:var(--text-muted);opacity:.5;';
        var caseHTML = recapChoix
          ? '<input type="checkbox" class="cp-pistes-recap-case" data-cp-retenue-ref="' + echapperAttribut(p.nom) + '"' +
            (active ? ' checked' : '') +
            (!active && recapActives.length >= _COMPARER_ANALYSE_MAX ? ' disabled' : '') + '> '
          : '';
        return '<li>' + caseHTML +
          '<span class="cp-pastille" style="' + styleP + '"></span>' +
          '<span class="cp-pistes-recap-nom' + (recapChoix && !active ? ' cp-pistes-recap-parked' : '') + '">' +
          echapperTexte(p.nom) + '</span>' +
          (p.etudieLe ? '<span class="cp-badge-etudie">déjà étudié le ' + comparerDateCourte(p.etudieLe) + '</span>' : '') +
          '<button type="button" class="btn btn-outline-secondary btn-sm" data-cp-recap-retirer-ref="' + echapperAttribut(p.nom) + '" title="Retirer cette piste">&#10005;</button></li>';
      };
      var recapEtudiees = recapActives.filter(function (p) { return p.etudieLe; });
      var rappelEtudieHTML = '';
      if (recapEtudiees.length === 1) {
        rappelEtudieHTML = '<p class="cp-rappel-etudie">&#8505;&#65039; Vous avez déjà étudié <strong>' +
          echapperTexte(recapEtudiees[0].nom) + '</strong> le ' + comparerDateCourte(recapEtudiees[0].etudieLe) +
          '. Vous pouvez la comparer à nouveau, ici avec d’autres pistes ; elle ne sera pas effacée, et son étude précédente reste disponible.</p>';
      } else if (recapEtudiees.length > 1) {
        rappelEtudieHTML = '<p class="cp-rappel-etudie">&#8505;&#65039; ' + recapEtudiees.length +
          ' de ces pistes ont déjà été étudiées. Vous pouvez les comparer à nouveau dans une autre combinaison ; rien n’est effacé.</p>';
      }
      recapHTML = '<div class="carte-preparer-ok">' +
        '<strong>&#128204; Pistes ' + (recapChoix ? 'à comparer' : 'déjà ajoutées') + '</strong>' +
        (recapChoix
          ? '<p class="preparer-detail" style="margin:.3rem 0 .1rem;">Cochez les 2 ou 3 pistes à regarder ensemble. 2, c’est l’idéal ; 3 au maximum. Les autres restent ici : vous pourrez recommencer avec elles, l’application n’en élimine aucune.</p>'
          : '') +
        '<ul class="cp-pistes-recap">' +
        recapActives.map(function (p) { return ligneRecap(p, true); }).join('') +
        recapReserve.map(function (p) { return ligneRecap(p, false); }).join('') +
        '</ul>' +
        rappelEtudieHTML +
        '<p class="preparer-detail" style="margin:.4rem 0 0;">Vous pourrez les renommer, changer leur couleur, préciser de quel type de piste il s’agit, ou en retirer à l’étape suivante.</p>' +
        '<div class="cp-sac-pied"><button type="button" class="btn btn-sm cp-tout-effacer" data-cp-tout-effacer>Tout effacer</button></div>' +
        '</div>';
    }

    return '<div class="bilan-preparer">' +
      '<p class="text-muted small" style="margin-bottom:1rem;">Choisissez la façon qui vous convient. Vous pouvez même en mélanger plusieurs (raconter pour une piste, coller un texte pour une autre). On en regarde 2 ou 3 ensemble.</p>' +
      recapHTML +

      // --- Bloc 1 : comment nous en parler (obligatoire) ---
      '<details class="bloc-depli' + (ecran0AuMoinsUneFacon() ? ' bd-ok' : '') + '" id="cpBlocFacons" open>' +
      '<summary><span class="preparer-num">1</span><span class="preparer-titre">Comment voulez-vous nous en parler ?</span>' +
      '<span class="preparer-oblig">obligatoire</span>' + ecran0PiluleFacons() + '</summary>' +
      '<div class="bloc-depli-corps">' +
      // Retour Denis 2026-09-30 (C18-a) : consigne du premier point beaucoup plus grande.
      '<p class="cp-consigne-facons">Au moins une façon. Cliquez sur une ligne pour l’ouvrir.</p>' +

      '<details class="bloc-depli"><summary><span class="preparer-titre">&#127897;&#65039; Je raconte</span></summary>' +
      '<div class="bloc-depli-corps">' +
      '<p class="preparer-detail" style="margin-top:0;">À l’écrit ou à la voix (' +
      '<strong><span style="white-space:nowrap;">Windows + H</span></strong>). Ce qui vous tracasse, entre quoi vous hésitez. ' +
      'On en tire des pistes que vous validez ensuite.</p>' +
      '<textarea class="form-control form-control-sm" rows="4" data-cp-recit ' +
      'placeholder="Dites ou écrivez ce qui vous fait hésiter...">' + echapperTexte(etat.recit || '') + '</textarea>' +
      '</div></details>' +

      '<details class="bloc-depli"><summary><span class="preparer-titre">&#9999;&#65039; Je nomme mes pistes</span></summary>' +
      '<div class="bloc-depli-corps">' +
      '<p class="preparer-detail" style="margin-top:0;">Le nom de chaque piste, plus quelques lignes sur ce qui vous attire.</p>' +
      pistesNommeesHTML +
      '</div></details>' +

      '<details class="bloc-depli"><summary><span class="preparer-titre">&#128206; J’ajoute un texte</span></summary>' +
      '<div class="bloc-depli-corps">' +
      '<p class="preparer-detail" style="margin-top:0;">Collez le texte d’une fiche, d’une offre, d’un programme.</p>' +
      '<textarea class="form-control form-control-sm" rows="3" data-cp-documents ' +
      'placeholder="Collez ici un texte utile à propos d’une de vos pistes..."></textarea>' +
      '<p class="preparer-detail">L’application ne lit pas les fichiers. Vous pourrez joindre des photos directement sur le site de l’assistant en ligne, à l’étape « Collecter ».</p>' +
      '<p class="preparer-detail">Ces photos concernent vos pistes (une offre, un programme, une fiche), pas vous. Si l’une d’elles montre malgré tout votre nom, votre adresse ou votre téléphone, masquez-les d’abord : un rectangle plein par-dessus, avec Paint ou l’application Photos.</p>' +
      '</div></details>' +

      '</div></details>' +

      // --- Bloc 2 : ou en etes-vous (obligatoire) ---
      // TACHE (Paquet B, decision de Denis 2026-09-26) : "open" ne se
      // recalcule plus depuis etat.situation a chaque rendu (fermeture
      // automatique bannie) -- voir ouvertBlocDepliManuel() (data/metiers.js).
      '<details class="bloc-depli' + (etat.situation ? ' bd-ok' : '') + '" id="cpBlocSituation"' + (ouvertBlocDepliManuel(etat, 'blocSituation', true) ? ' open' : '') + '>' +
      '<summary><span class="preparer-num">2</span><span class="preparer-titre">Où en êtes-vous en ce moment ?</span>' +
      '<span class="preparer-oblig">obligatoire</span>' + ecran0PiluleSituation() + '</summary>' +
      '<div class="bloc-depli-corps">' +
      '<p class="preparer-detail" style="margin-top:0;">Sert à choisir les questions et les dispositifs pertinents (par ex. ARE ou RSA, Mission Locale ou France Travail). Ne sert jamais à noter ni à classer.</p>' +
      '<div class="preparer-jetons">' +
      COMPARER_SITUATIONS.map(function (o) {
        return '<button type="button" class="preparer-jeton' + (etat.situation === o.id ? ' preparer-jeton-actif' : '') +
          '" data-cp-situation="' + o.id + '">' + o.libelle + '</button>';
      }).join('') +
      '</div>' +
      '<p style="font-size:.87rem;margin:.7rem 0 .2rem;">Votre tranche d’âge</p>' +
      '<div class="preparer-jetons">' +
      COMPARER_TRANCHES_AGE.map(function (o) {
        return '<button type="button" class="preparer-jeton' + (etat.trancheAge === o.id ? ' preparer-jeton-actif' : '') +
          '" data-cp-age="' + o.id + '">' + o.libelle + '</button>';
      }).join('') +
      '</div>' +
      '</div></details>' +

      // --- Bloc 3 : ou etes-vous (facultatif) ---
      '<details class="bloc-depli' + (etat.territoire ? ' bd-ok' : '') + '" id="cpBlocTerritoire" open>' +
      '<summary><span class="preparer-num">3</span><span class="preparer-titre">Où êtes-vous ?</span>' +
      '<span class="preparer-oblig">facultatif</span>' + ecran0PiluleTerritoire() + '</summary>' +
      '<div class="bloc-depli-corps">' +
      '<p class="preparer-detail" style="margin-top:0;">Précise les informations locales (formations près de chez vous, acteurs du département). Sans réponse, la recherche reste nationale.</p>' +
      (territoireLbl
        ? '<div class="carte-preparer-ok"><strong>&#128205; ' + echapperAttribut(territoireLbl) + '</strong>' +
          '<button type="button" class="btn btn-outline-secondary btn-sm ms-2" data-cp-changer-territoire>Changer</button></div>'
        : '<button type="button" class="btn btn-outline-secondary btn-sm" data-cp-indiquer-territoire>Indiquer mon département</button>') +
      '</div></details>' +

      // --- Bloc 4 : handicap (facultatif) ---
      '<details class="bloc-depli' + (etat.handicap ? ' bd-ok' : '') + '" id="cpBlocHandicap" open>' +
      '<summary><span class="preparer-num">4</span><span class="preparer-titre">Une situation de handicap, une RQTH, un besoin d’aménagement ?</span>' +
      '<span class="preparer-oblig">facultatif</span>' + ecran0PiluleHandicap() + '</summary>' +
      '<div class="bloc-depli-corps">' +
      '<p class="preparer-detail" style="margin-top:0;">Si vous l’indiquez, les informations et les acteurs cités seront adaptés (aménagements possibles, formations accessibles, Cap emploi, MDPH, AGEFIPH). Ce que vous cochez ici reste dans l’application : le texte préparé pour l’assistant ne dira que « la personne a, ou demande, une RQTH ».</p>' +
      '<div class="preparer-jetons">' +
      '<button type="button" class="preparer-jeton' + (etat.handicap === 'rqth' ? ' preparer-jeton-actif' : '') + '" data-cp-handicap="rqth">J’ai une RQTH ou une demande en cours</button>' +
      '<button type="button" class="preparer-jeton' + (etat.handicap === 'besoin' ? ' preparer-jeton-actif' : '') + '" data-cp-handicap="besoin">Je pense en avoir besoin</button>' +
      '<button type="button" class="preparer-jeton' + (etat.handicap === 'non' ? ' preparer-jeton-actif' : '') + '" data-cp-handicap="non">Pas concerné(e)</button>' +
      '</div>' +
      '<textarea class="form-control form-control-sm mt-2" rows="2" data-cp-handicap-note ' +
      'placeholder="Un besoin d’aménagement à ne pas oublier ? (facultatif)">' + echapperTexte(etat.handicapNote || '') + '</textarea>' +
      '</div></details>' +

      '<p class="preparer-detail" style="margin-top:1rem;">Vous n’avez rien d’autre à catégoriser. La façon de regarder vos pistes (côte à côte, ou dans le temps) est déterminée à l’étape suivante, à partir de vos pistes, et vous pourrez la corriger.</p>' +
      '</div>';
  }

  function ecran0Brancher() {
    var racine = document.getElementById('contenuEcranComparer');
    if (!racine) { return; }

    // TACHE (Paquet B) : memorise tout clic manuel sur "Ou en etes-vous ?".
    cablerBlocDepliManuel(etat, 'blocSituation', 'cpBlocSituation');

    // Champs libres -> etat (input).
    var champRecit = racine.querySelector('[data-cp-recit]');
    if (champRecit) { champRecit.addEventListener('input', function () { etat.recit = this.value; rafraichirEcran0Etats(); }); }
    var champDocs = racine.querySelector('[data-cp-documents]');
    if (champDocs) {
      champDocs.value = etat.documentsTexte || '';
      champDocs.addEventListener('input', function () { etat.documentsTexte = this.value; rafraichirEcran0Etats(); });
    }
    racine.querySelectorAll('[data-cp-piste-nom]').forEach(function (el) {
      el.addEventListener('input', function () {
        etat.pistesNommees[parseInt(this.dataset.cpPisteNom, 10)].nom = this.value;
        rafraichirEcran0Etats();
      });
    });
    racine.querySelectorAll('[data-cp-piste-attrait]').forEach(function (el) {
      el.addEventListener('input', function () {
        etat.pistesNommees[parseInt(this.dataset.cpPisteAttrait, 10)].attrait = this.value;
      });
    });
    var champHandiNote = racine.querySelector('[data-cp-handicap-note]');
    if (champHandiNote) { champHandiNote.addEventListener('input', function () { etat.handicapNote = this.value; }); }

    // Ajouter la 3e piste.
    var btnP3 = racine.querySelector('[data-cp-ajouter-piste3]');
    if (btnP3) { btnP3.addEventListener('click', function () { etat.piste3Visible = true; afficherEcran(0); }); }

    // Recap en tete d'ecran : retirer une piste (active ou en reserve),
    // ou cocher/decocher celles a regarder ensemble.
    var _cpRetirerParNom = function (nom) {
      var n = _comparerNormNom(nom);
      etat.pistes = etat.pistes.filter(function (p) { return _comparerNormNom(p.nom) !== n; });
      etat.pistesReserve = (etat.pistesReserve || []).filter(function (p) { return _comparerNormNom(p.nom) !== n; });
      comparerRecolorer(etat.pistes);
      afficherEcran(0);
    };
    racine.querySelectorAll('[data-cp-recap-retirer-ref]').forEach(function (el) {
      el.addEventListener('click', function () { _cpRetirerParNom(this.dataset.cpRecapRetirerRef); });
    });
    var btnToutEffacer = racine.querySelector('[data-cp-tout-effacer]');
    if (btnToutEffacer) { btnToutEffacer.addEventListener('click', comparerToutEffacer); }
    racine.querySelectorAll('[data-cp-retenue-ref]').forEach(function (el) {
      el.addEventListener('change', function () {
        var n = _comparerNormNom(this.dataset.cpRetenueRef);
        var reserve = etat.pistesReserve || [];
        if (this.checked) {
          if (etat.pistes.length >= _COMPARER_ANALYSE_MAX) { this.checked = false; return; }
          var pris = reserve.filter(function (p) { return _comparerNormNom(p.nom) === n; })[0];
          if (pris) {
            etat.pistesReserve = reserve.filter(function (p) { return p !== pris; });
            etat.pistes.push(pris);
          }
        } else {
          var sorti = etat.pistes.filter(function (p) { return _comparerNormNom(p.nom) === n; })[0];
          if (sorti) {
            etat.pistes = etat.pistes.filter(function (p) { return p !== sorti; });
            reserve.unshift(sorti);
            etat.pistesReserve = reserve;
          }
        }
        comparerRecolorer(etat.pistes);
        afficherEcran(0);
      });
    });

    // Jetons : situation / age / handicap.
    racine.querySelectorAll('[data-cp-situation]').forEach(function (el) {
      el.addEventListener('click', function () {
        etat.situation = (etat.situation === this.dataset.cpSituation) ? null : this.dataset.cpSituation;
        afficherEcran(0);
      });
    });
    racine.querySelectorAll('[data-cp-age]').forEach(function (el) {
      el.addEventListener('click', function () {
        etat.trancheAge = (etat.trancheAge === this.dataset.cpAge) ? null : this.dataset.cpAge;
        afficherEcran(0);
      });
    });
    racine.querySelectorAll('[data-cp-handicap]').forEach(function (el) {
      el.addEventListener('click', function () {
        etat.handicap = (etat.handicap === this.dataset.cpHandicap) ? null : this.dataset.cpHandicap;
        afficherEcran(0);
      });
    });

    // Territoire : reutilise demanderDepartementSiInconnu / le stockage
    // partage CLE_DEPARTEMENT_RESSOURCES (choix revocable, LECONS 9.27).
    var btnIndiquer = racine.querySelector('[data-cp-indiquer-territoire]');
    if (btnIndiquer && typeof demanderDepartementSiInconnu === 'function') {
      btnIndiquer.addEventListener('click', function () {
        demanderDepartementSiInconnu(function (dep) { etat.territoire = dep; afficherEcran(0); });
      });
    }
    var btnChanger = racine.querySelector('[data-cp-changer-territoire]');
    if (btnChanger && typeof demanderDepartementSiInconnu === 'function') {
      btnChanger.addEventListener('click', function () {
        if (typeof oublierDepartementRessources === 'function') { oublierDepartementRessources(); }
        demanderDepartementSiInconnu(function (dep) { etat.territoire = dep; afficherEcran(0); });
      });
    }
  }

  // Met a jour les pilules + le bouton Continuer sans re-rendre tout
  // l'ecran (evite de perdre le focus pendant la frappe).
  function rafraichirEcran0Etats() {
    var blocF = document.getElementById('cpBlocFacons');
    if (blocF) {
      blocF.classList.toggle('bd-ok', ecran0AuMoinsUneFacon());
      var pilF = blocF.querySelector('summary .pilule-etat');
      if (pilF) { pilF.outerHTML = ecran0PiluleFacons(); }
    }
    _majBoutonContinuer();
  }

  // ------------------------------------------------------------------
  // ECRAN 0 bis -- Les pistes qu'on a comprises
  // ------------------------------------------------------------------

  // La personne a-t-elle un recit / des documents qui demandent une
  // detection (prompt 0) pas encore faite ?
  function ecran0bisBesoinDetection() {
    var aRacontE = (etat.recit || '').trim() || (etat.documentsTexte || '').trim();
    return !!aRacontE && !etat.detectionFaite;
  }

  // Assemble etat.pistes a partir de "Je nomme" + de la detection. Fait
  // UNE fois (etat._pistesConstruites) ; ensuite la personne edite
  // directement etat.pistes (renomme, re-etiquette, ajoute, retire), on ne
  // reconstruit plus. Passer force=true apres une nouvelle detection.
  function ecran0bisConstruirePistes(force) {
    if (etat._pistesConstruites && !force) { return; }
    etat._pistesConstruites = true;
    var norm = (typeof normaliserTexte === 'function')
      ? normaliserTexte
      : function (s) { return String(s).toLowerCase().trim(); };
    var ancien = {};
    etat.pistes.forEach(function (p) { ancien[norm(p.nom)] = p; });

    var sortie = [];
    var vus = {};
    function ajouter(nom, source, etiquette, extrait) {
      nom = String(nom || '').trim();
      if (!nom) { return; }
      var cle = norm(nom);
      if (vus[cle]) { return; }
      vus[cle] = true;
      var precedent = ancien[cle];
      sortie.push({
        id: (precedent && precedent.id) || ('p' + (sortie.length + 1)),
        nom: nom,
        source: source,
        etiquette: (precedent && precedent.etiquette) || etiquette || null,
        extrait: (precedent && precedent.extrait) || extrait || '',
        couleur: (precedent && precedent.couleur) || COMPARER_PALETTE[sortie.length % COMPARER_PALETTE.length],
        ajoutLe: (precedent && precedent.ajoutLe) || comparerAujourdhui(),
        etudieLe: (precedent && precedent.etudieLe) || null
      });
    }

    etat.pistesNommees.forEach(function (p) {
      if ((p.nom || '').trim()) { ajouter(p.nom, 'nommee', null, p.attrait || ''); }
    });
    if (etat.detectionFaite && etat._detectionPistes) {
      etat._detectionPistes.forEach(function (p) { ajouter(p.nom, 'recit', p.etiquette, p.extrait); });
    }
    etat.pistes = sortie;
  }

  function ecran0bisPistesAffichees() {
    return etat.pistes.slice(0, 3);
  }

  function ecran0bisFormeCourante() {
    return comparerRouterForme(ecran0bisPistesAffichees(), etat.correctionAngle);
  }

  function ecran0bisPeutContinuer() {
    var forme = ecran0bisFormeCourante();
    if (forme === 'orientation-first') { return false; }
    // Chaque piste "reelle" affichee doit porter une etiquette.
    return ecran0bisPistesAffichees().every(function (p) { return !!p.etiquette; });
  }
  function ecran0bisRaisonBlocage() {
    if (ecran0bisBesoinDetection() && !etat.detectionFaite) {
      return 'Collez d’abord la réponse de l’assistant, ou nommez vos pistes vous-même.';
    }
    if (ecran0bisPistesAffichees().some(function (p) { return !p.etiquette; })) {
      return 'Donnez une étiquette à chaque piste (métier, formation, situation...).';
    }
    if (ecran0bisFormeCourante() === 'orientation-first') {
      return 'Il faut au moins deux pistes concrètes (métier, formation ou situation) pour comparer.';
    }
    return '';
  }

  // --- Texte du prompt de detection (prompt 0), place-holders resolus.
  function ecran0bisTextePromptDetection() {
    var brut = (typeof promptsExternesCharges !== 'undefined' && promptsExternesCharges)
      ? promptsExternesCharges['comparer-detection'] : null;
    if (!brut) { return null; }
    var valeurs = {
      RECIT: (etat.recit || '').trim() || '(rien saisi)',
      DOCUMENTS: (etat.documentsTexte || '').trim() || '(aucun)'
    };
    if (typeof bilanResoudrePlaceholders === 'function') {
      return bilanResoudrePlaceholders(brut, valeurs).texte;
    }
    return brut.replace(/\{RECIT\}/g, valeurs.RECIT).replace(/\{DOCUMENTS\}/g, valeurs.DOCUMENTS);
  }

  // --- Bloc "Voici comment on va regarder vos pistes" (court, adresse a
  // la personne).
  function ecran0bisBoiteCommentOnRegarde() {
    var pistes = ecran0bisPistesAffichees();
    var forme = ecran0bisFormeCourante();
    function pastille(p) {
      return '<span class="cp-pastille" style="background:' + echapperAttribut(p.couleur) + ';"></span>' + echapperAttribut(p.nom);
    }
    var metierFormation = pistes.filter(function (p) { return p.etiquette === 'metier' || p.etiquette === 'formation'; });
    var situations = pistes.filter(function (p) { return p.etiquette === 'situation'; });
    var puces = '';

    if (forme === 'orientation-first') {
      puces = '<li>Pas encore assez de pistes concrètes pour comparer.</li>';
    } else if (forme === 'superposition') {
      puces = '<li>' + pistes.map(pastille).join(' ') + ' : <strong>côte à côte</strong>.</li>';
    } else if (forme === 'frise') {
      puces = pistes.map(function (p) {
        return '<li>' + pastille(p) + ' : <strong>dans le temps</strong>.</li>';
      }).join('');
    } else if (etat.correctionAngle === 'les-deux') { // les deux angles, l'un apres l'autre
      puces = '<li>' + pistes.map(pastille).join(' ') + ' : <strong>côte à côte</strong>, puis <strong>dans le temps</strong>.</li>';
    } else { // mixte
      puces = '<li>' + metierFormation.map(pastille).join(' ') + ' : <strong>côte à côte</strong>.</li>' +
        situations.map(function (p) {
          return '<li>' + pastille(p) + ' : <strong>dans le temps</strong>.</li>';
        }).join('');
    }

    return '<div class="cp-boite-regard">' +
      '<p class="cp-regard-titre"><strong>&#128260; Voici comment on vous propose de regarder vos pistes :</strong></p>' +
      '<ul class="cp-regard-liste">' + puces + '</ul>' +
      (forme === 'mixte'
        ? '<p class="preparer-detail" style="margin:.3rem 0 0;">On commence par un angle, vous pourrez faire l’autre juste après.</p>'
        : '') +
      '<p class="cp-regard-autre">Vous préférez regarder autrement ?</p>' +
      '<div class="preparer-jetons">' +
      '<button type="button" class="preparer-jeton' + (etat.correctionAngle === 'tout-temps' ? ' preparer-jeton-actif' : '') + '" data-cp-angle="tout-temps">Tout regarder « dans le temps »</button>' +
      '<button type="button" class="preparer-jeton' + (etat.correctionAngle === 'dabord-metiers' ? ' preparer-jeton-actif' : '') + '" data-cp-angle="dabord-metiers">Voir d’abord seulement les métiers</button>' +
      (metierFormation.length >= 2 ? '<button type="button" class="preparer-jeton' + (etat.correctionAngle === 'les-deux' ? ' preparer-jeton-actif' : '') + '" data-cp-angle="les-deux">Les deux angles, l’un après l’autre</button>' : '') +
      (etat.correctionAngle !== 'auto'
        ? '<button type="button" class="preparer-jeton" data-cp-angle="auto">Revenir à la proposition</button>' : '') +
      '</div></div>';
  }

  function ecran0bisHTML() {
    // Etape "detection" : la personne colle le resultat du prompt 0.
    if (ecran0bisBesoinDetection()) {
      return '<div class="bilan-preparer">' +
        '<p class="text-muted small" style="margin-bottom:1rem;">Vous n’avez rien catégorisé. On demande à un assistant en ligne de lire ce que vous avez dit et d’en tirer des pistes, que vous validez ensuite.</p>' +
        envoiIAHTML('detection') +
        '<p class="preparer-detail" style="margin-top:1rem;">L’assistant ne renvoie rien d’utilisable ? <button type="button" class="btn btn-outline-secondary btn-sm" data-cp-sauter-detection>Nommer mes pistes moi-même</button></p>' +
        '</div>';
    }

    // Etape "etiquettes" : la liste des pistes comprises.
    ecran0bisConstruirePistes();
    var pistes = ecran0bisPistesAffichees();
    var enReserve = (etat.pistesReserve || []).filter(function (p) { return (p.nom || '').trim(); }).length;
    var enTrop = (etat.pistes.length - pistes.length) + enReserve;

    var listeHTML = pistes.map(function (p, i) {
      return '<div class="cp-piste">' +
        '<div class="cp-piste-tete">' +
        '<span class="cp-pastille" style="background:' + echapperAttribut(p.couleur) + ';"></span>' +
        '<input type="text" class="form-control form-control-sm" data-cp-piste-nom-idx="' + i + '" placeholder="Nom de la piste" value="' + echapperAttribut(p.nom) + '">' +
        '<input type="color" class="cp-couleur" data-cp-piste-couleur-idx="' + i + '" value="' + echapperAttribut(p.couleur) + '" title="Couleur de cette piste">' +
        '<button type="button" class="btn btn-outline-secondary btn-sm" data-cp-retirer-idx="' + i + '" title="Retirer cette piste">&#10005;</button>' +
        '</div>' +
        '<p style="margin:.35rem 0 .1rem;font-size:.85rem;">Étiquette :</p>' +
        '<div class="preparer-jetons">' +
        COMPARER_ETIQUETTES.map(function (e) {
          return '<button type="button" class="preparer-jeton' + (p.etiquette === e.id ? ' preparer-jeton-actif' : '') +
            '" data-cp-etiquette-idx="' + i + '" data-cp-etiquette="' + e.id + '">' + e.libelle + '</button>';
        }).join('') +
        '</div>' +
        (p.etiquette === 'frein_ou_etape' ? ecran0bisFreinHTML(p) : '') +
        (p.etiquette === 'idee_a_explorer'
          ? '<p class="preparer-detail" style="margin:.4rem 0 0;">Sans piste concrète derrière, on ne compare pas : voir l’encadré plus bas.</p>'
          : '') +
        '</div>';
    }).join('');

    return '<div class="bilan-preparer">' +
      '<p class="text-muted small" style="margin-bottom:1rem;">Un assistant a lu ce que vous avez dit et propose des pistes, chacune avec une <strong>étiquette</strong>. Corrigez d’un clic si c’est faux, changez un nom, choisissez une couleur.</p>' +
      listeHTML +
      (etat.pistes.length < 4
        ? '<button type="button" class="btn btn-outline-secondary btn-sm" data-cp-ajouter-piste>+ Ajouter une piste</button>'
        : '') +
      '<div class="cp-piste">' +
      '<p style="margin:0 0 .2rem;font-size:.85rem;">Il manque quelque chose ?</p>' +
      '<textarea class="form-control form-control-sm" rows="2" data-cp-filet ' +
      'placeholder="Écrivez-le ici, avec vos mots. Tout ce qui n’entre pas dans une piste y va.">' + echapperTexte(etat.ceQuiNeRentrePas || '') + '</textarea>' +
      '</div>' +
      (enTrop > 0
        ? '<p class="preparer-detail">Vous avez ' + (pistes.length + enTrop) + ' pistes en tout. On en regarde ' + pistes.length + ' ici. Pour changer lesquelles, revenez à l’étape précédente. L’application n’élimine jamais une piste.</p>'
        : '') +
      ecran0bisBoiteCommentOnRegarde() +
      ecran0bisBlocBHTML() +
      '<details class="bloc-depli mt-2"><summary><span class="preparer-titre">&#128161; Et si je n’avais aucune piste précise ?</span></summary>' +
      '<div class="bloc-depli-corps"><p style="margin:0;font-size:.87rem;">Si vous aviez surtout dit « j’ai envie de changer mais je ne sais pas vers quoi », sans piste concrète, on ne lancerait pas de comparaison. On proposerait d’abord un <strong>bilan</strong> ou un <strong>conseil en évolution professionnelle</strong> (CEP, gratuit), pour faire apparaître des pistes. La comparaison viendrait ensuite.</p></div></details>' +
      '</div>';
  }

  // Frein / etape : ce n'est pas une piste, c'est une condition. Reliee au
  // repertoire verifie data/freins.js (l'assistant classe, le code garantit
  // les ressources -- aucune URL d'assistant, LECONS 9.13 / 9.16).
  function ecran0bisFreinHTML(p) {
    var code = comparerNomVersCodeFrein(p.nom);
    var intro = '<p class="preparer-detail" style="margin:.4rem 0 0;">Ce n’est pas une piste : c’est une <strong>condition</strong> à regarder, pas quelque chose à comparer.</p>';
    if (!code || typeof regardExterieurRenduFicheFrein !== 'function') {
      return intro + '<p class="preparer-detail" style="margin:.2rem 0 0;">À noter pour votre conseiller : « ' + echapperTexte(p.nom) + ' ».</p>';
    }
    return intro +
      '<details class="bloc-depli mt-2" open><summary><span class="preparer-titre">&#128161; Se renseigner sur ce point</span></summary>' +
      '<div class="bloc-depli-corps cp-frein-fiche">' + regardExterieurRenduFicheFrein(code, { sansDefinition: false }) + '</div></details>';
  }

  // Bloc B : precisions selon la situation. Une seule serie, choisie par le
  // code (comparerRouterBlocB). Tout facultatif, "Je ne sais pas" valide.
  function ecran0bisBlocBHTML() {
    var serieId = comparerRouterBlocB(etat);
    var serie = COMPARER_BLOC_B[serieId];
    if (!serie) { return ''; }
    etat.reponses = etat.reponses || {};
    etat.reponses.blocB = etat.reponses.blocB || {};
    var rep = etat.reponses.blocB;

    var qHTML = serie.questions.map(function (q) {
      var bloc = '<p style="font-size:.87rem;margin:.6rem 0 .2rem;">' + q.texte + '</p>';
      if (q.type === 'texte') {
        bloc += '<textarea class="form-control form-control-sm" rows="2" data-cp-bq="' + q.id + '">' +
          echapperTexte(rep[q.id] || '') + '</textarea>';
      } else {
        bloc += '<div class="preparer-jetons">' + q.options.map(function (opt) {
          return '<button type="button" class="preparer-jeton' + (rep[q.id] === opt ? ' preparer-jeton-actif' : '') +
            '" data-cp-bq="' + q.id + '" data-cp-bq-val="' + echapperAttribut(opt) + '">' + echapperTexte(opt) + '</button>';
        }).join('') + '</div>';
      }
      return bloc;
    }).join('');

    return '<details class="bloc-depli mt-2" id="cpBlocB" open><summary>' +
      '<span class="preparer-titre">&#128172; Quelques précisions selon votre situation</span>' +
      '<span class="preparer-oblig">facultatif</span></summary>' +
      '<div class="bloc-depli-corps">' +
      '<p class="preparer-detail" style="margin-top:0;">' + echapperTexte(serie.titre) + '. Ces questions changent selon ce que vous avez indiqué. Tout est facultatif ; « Je ne sais pas » devient une question pour votre conseiller.</p>' +
      qHTML +
      '</div></details>';
  }

  function ecran0bisTraiterDetection(texte) {
    var res = comparerParserDetection(texte);
    if (res.erreur) { etat.detectionErreur = res.erreur; afficherEcran(1); return; }
    _comparerTrack('comparer_reponse_collee', { type: 'detection' });
    etat.detectionBrut = texte;
    etat._detectionPistes = res.pistes;
    if (res.ceQuiNeRentrePas && !etat.ceQuiNeRentrePas) { etat.ceQuiNeRentrePas = res.ceQuiNeRentrePas; }
    etat.detectionErreur = '';
    etat.detectionFaite = true;
    etat._pistesConstruites = false;
    ecran0bisConstruirePistes(true);
    afficherEcran(1);
  }

  function ecran0bisBrancher() {
    var racine = document.getElementById('contenuEcranComparer');
    if (!racine) { return; }

    // -- Etape detection (brique commune d'envoi a un assistant) --
    envoiIABrancher('detection');
    var btnSauter = racine.querySelector('[data-cp-sauter-detection]');
    if (btnSauter) {
      btnSauter.addEventListener('click', function () {
        etat.detectionFaite = true;
        etat._detectionPistes = [];
        etat._pistesConstruites = false;
        ecran0bisConstruirePistes(true);
        afficherEcran(1);
      });
    }

    // -- Etape etiquettes --
    racine.querySelectorAll('[data-cp-retirer-idx]').forEach(function (el) {
      el.addEventListener('click', function () {
        var i = parseInt(this.dataset.cpRetirerIdx, 10);
        etat.pistes.splice(i, 1);
        afficherEcran(1);
      });
    });
    var btnAjouterPiste = racine.querySelector('[data-cp-ajouter-piste]');
    if (btnAjouterPiste) {
      btnAjouterPiste.addEventListener('click', function () {
        etat.pistes.push(comparerFabriquerPiste('', {
          couleur: COMPARER_PALETTE[etat.pistes.length % COMPARER_PALETTE.length]
        }));
        afficherEcran(1);
      });
    }
    racine.querySelectorAll('[data-cp-piste-nom-idx]').forEach(function (el) {
      el.addEventListener('input', function () {
        var i = parseInt(this.dataset.cpPisteNomIdx, 10);
        if (etat.pistes[i]) { etat.pistes[i].nom = this.value; }
      });
    });
    racine.querySelectorAll('[data-cp-piste-couleur-idx]').forEach(function (el) {
      el.addEventListener('input', function () {
        var i = parseInt(this.dataset.cpPisteCouleurIdx, 10);
        if (etat.pistes[i]) {
          etat.pistes[i].couleur = this.value;
          var tete = this.closest('.cp-piste').querySelector('.cp-pastille');
          if (tete) { tete.style.background = this.value; }
        }
      });
    });
    racine.querySelectorAll('[data-cp-etiquette-idx]').forEach(function (el) {
      el.addEventListener('click', function () {
        var i = parseInt(this.dataset.cpEtiquetteIdx, 10);
        var et = this.dataset.cpEtiquette;
        if (etat.pistes[i]) {
          etat.pistes[i].etiquette = (etat.pistes[i].etiquette === et) ? null : et;
        }
        afficherEcran(1);
      });
    });
    var filet = racine.querySelector('[data-cp-filet]');
    if (filet) { filet.addEventListener('input', function () { etat.ceQuiNeRentrePas = this.value; }); }
    racine.querySelectorAll('[data-cp-angle]').forEach(function (el) {
      el.addEventListener('click', function () {
        etat.correctionAngle = this.dataset.cpAngle;
        afficherEcran(1);
      });
    });

    // -- Bloc B (precisions selon la situation) --
    etat.reponses = etat.reponses || {};
    etat.reponses.blocB = etat.reponses.blocB || {};
    racine.querySelectorAll('button[data-cp-bq]').forEach(function (el) {
      el.addEventListener('click', function () {
        var q = this.dataset.cpBq;
        var v = this.dataset.cpBqVal;
        etat.reponses.blocB[q] = (etat.reponses.blocB[q] === v) ? null : v;
        // Re-rendu leger : bascule l'etat actif des jetons de cette question.
        this.parentNode.querySelectorAll('[data-cp-bq="' + q + '"]').forEach(function (b) {
          b.classList.toggle('preparer-jeton-actif', b.dataset.cpBqVal === etat.reponses.blocB[q]);
        });
      });
    });
    racine.querySelectorAll('textarea[data-cp-bq]').forEach(function (el) {
      el.addEventListener('input', function () { etat.reponses.blocB[this.dataset.cpBq] = this.value; });
    });

    // -- Frein : bouton "structures pres de chez vous" (rendu par
    // regardExterieurRenduFicheFrein). Meme delegation que le Lexique. --
    racine.querySelectorAll('.cp-frein-fiche [data-frein-structures-locales]').forEach(function (el) {
      el.addEventListener('click', function () {
        if (typeof ouvrirRenvoiAnnuaire === 'function') {
          ouvrirRenvoiAnnuaire('Pour « ' + this.getAttribute('data-frein-structures-locales') + ' », des structures près de chez vous :');
        }
      });
    });
  }

  // ------------------------------------------------------------------
  // ECRAN 2 -- Collecter les informations
  // ------------------------------------------------------------------

  function ecran2PistesReelles() {
    return ecran0bisPistesAffichees().filter(function (p) {
      return p.etiquette === 'metier' || p.etiquette === 'formation' || p.etiquette === 'situation';
    });
  }

  function ecran2TerritoireTexte() {
    if (etat.territoire === '24') { return 'le département de la Dordogne (24), en Nouvelle-Aquitaine'; }
    if (etat.territoire === '87') { return 'la Haute-Vienne (87), en Nouvelle-Aquitaine'; }
    return 'la France (aucun département précisé : privilégie le niveau national)';
  }

  function ecran2Type() {
    var f = etat.formeComparaison || comparerRouterForme(ecran0bisPistesAffichees(), etat.correctionAngle);
    if (f === 'frise') { return 'situation contre situation'; }
    if (f === 'mixte') { return 'mixte (des pistes de même nature et au moins une situation)'; }
    return 'même nature';
  }

  function ecran2HandicapTexte() {
    if (etat.handicap === 'rqth') {
      return 'La personne a, ou demande, une RQTH : ajoute agefiph.fr, monparcourshandicap.gouv.fr, la MDPH du département et Cap emploi ; pour chaque piste, renseigne les aménagements possibles et l’accessibilité de la formation.';
    }
    if (etat.handicap === 'besoin') {
      return 'La personne pense pouvoir avoir besoin d’un aménagement (pas de RQTH pour l’instant) : mentionne agefiph.fr et la possibilité d’une RQTH.';
    }
    return 'Pas de situation de handicap indiquée.';
  }

  function ecran2PrecisionsTexte() {
    var rep = (etat.reponses && etat.reponses.blocB) || {};
    var serie = COMPARER_BLOC_B[comparerRouterBlocB(etat)];
    var lignes = [];
    var s = COMPARER_SITUATIONS.filter(function (o) { return o.id === etat.situation; })[0];
    var age = COMPARER_TRANCHES_AGE.filter(function (o) { return o.id === etat.trancheAge; })[0];
    lignes.push('Situation : ' + (s ? s.libelle : 'non précisée') + (age ? ' ; ' + age.libelle : ''));
    if (serie) {
      serie.questions.forEach(function (q) {
        var v = rep[q.id];
        if (v && String(v).trim()) { lignes.push(q.texte + ' ' + String(v).trim()); }
      });
    }
    return lignes.join('\n');
  }

  function ecran2PistesTexte() {
    var lignes = ecran2PistesReelles().map(function (p, i) {
      var t = (i + 1) + '. ' + p.nom;
      var etq = COMPARER_ETIQUETTES.filter(function (e) { return e.id === p.etiquette; })[0];
      if (etq) { t += ' (' + etq.libelle + ')'; }
      if (p.extrait && p.source === 'nommee') { t += ' - ce qui attire la personne : ' + p.extrait; }
      return t;
    });
    var freins = ecran0bisPistesAffichees().filter(function (p) { return p.etiquette === 'frein_ou_etape'; });
    if (freins.length) {
      lignes.push('Conditions signalées par la personne (pas des pistes) : ' +
        freins.map(function (p) { return p.nom; }).join(' ; ') + '.');
    }
    return 'Type de comparaison : ' + ecran2Type() + '.\n' + lignes.join('\n');
  }

  function ecran2DocumentsTexte() {
    var d = (etat.documentsTexte || '').trim();
    if (d) {
      return 'La personne a ajouté ce texte à propos d’une piste (joins aussi les photos qu’elle t’enverra) :\n---\n' + d + '\n---';
    }
    return 'Aucun document ajouté.';
  }

  function ecran2ConstruireTexte() {
    var brut = (typeof promptsExternesCharges !== 'undefined' && promptsExternesCharges)
      ? promptsExternesCharges['comparer-collecte'] : null;
    if (!brut) { return null; }
    var valeurs = {
      TERRITOIRE: ecran2TerritoireTexte(),
      PISTES: ecran2PistesTexte(),
      SITUATION: (function () {
        var s = COMPARER_SITUATIONS.filter(function (o) { return o.id === etat.situation; })[0];
        var age = COMPARER_TRANCHES_AGE.filter(function (o) { return o.id === etat.trancheAge; })[0];
        return (s ? s.libelle : 'non précisée') + (age ? ', ' + age.libelle : '');
      })(),
      PRECISIONS: ecran2PrecisionsTexte(),
      HANDICAP: ecran2HandicapTexte(),
      DOCUMENTS: ecran2DocumentsTexte()
    };
    if (typeof bilanResoudrePlaceholders === 'function') {
      return bilanResoudrePlaceholders(brut, valeurs).texte;
    }
    return brut.replace(/\{([A-Z_]+)\}/g, function (m, k) { return valeurs[k] != null ? valeurs[k] : m; });
  }

  function ecran2PeutContinuer() {
    if (etat.collecteSansAssistant) { return true; }
    return !!(etat.dossiersCollecte && etat.dossiersCollecte.pistes && etat.dossiersCollecte.pistes.length);
  }
  function ecran2RaisonBlocage() {
    if (ecran2PeutContinuer()) { return ''; }
    return 'Collez la réponse de l’assistant, ou choisissez « Je n’ai pas d’assistant en ligne ».';
  }

  function ecran2HTML() {
    var dossiers = etat.dossiersCollecte;

    var blocReponse;
    if (etat.collecteSansAssistant) {
      blocReponse = '<div class="cp-info-encart"><strong>&#9432; Sans recherche web.</strong> On garde les informations stables (les fiches) et les questions à préparer. Les informations qui changent (rémunération, financement, tension) resteront « à vérifier avec un conseiller ».</div>' +
        '<button type="button" class="btn btn-outline-secondary btn-sm mt-2" data-cp-collecte-reprendre>Finalement, coller une réponse d’assistant</button>';
    } else if (dossiers) {
      blocReponse =
        '<div class="cp-info-encart' + (etat.collecteAlertes.length ? ' cp-info-alerte' : '') + '">' +
        (etat.collecteAlertes.length
          ? '<strong>&#9888;&#65039; Cette réponse n’a pas l’air fiable.</strong><ul style="margin:.3rem 0 0;">' +
            etat.collecteAlertes.map(function (a) { return '<li>' + echapperTexte(a) + '</li>'; }).join('') +
            '</ul><p style="margin:.4rem 0 0;">Vous pouvez recommencer avec l’assistant recommandé (recherche web activée), ou apporter cette recherche à votre conseiller. Ce qui est exploitable est gardé, le reste sera marqué « à vérifier ».</p>'
          : '<strong>&#9989; Réponse reçue</strong> pour ' + dossiers.pistes.length + ' piste(s). Vous pouvez continuer.') +
        '</div>' +
        '<button type="button" class="btn btn-outline-secondary btn-sm mt-2" data-cp-collecte-recommencer>Coller une autre réponse</button>';
    } else {
      blocReponse = '';
    }

    // Retour Denis 2026-09-30 (C14-e) : plus de texte affiche. Meme parcours que le reste de l'application : choix de l'assistant, le texte est copie
    // et l'assistant s'ouvre, puis « De retour : collez la reponse » (composants communs).
    var attente = !etat.collecteSansAssistant && !dossiers;
    var intro = '<p class="text-muted small" style="margin-bottom:1rem;">L’application ne va pas chercher elle-même. Elle prépare le texte et l’envoie pour vous chez l’assistant en ligne de votre choix, qui cherche sur le web ; vous rapportez ensuite sa réponse ici.</p>';
    var confid = '<div class="cp-confid"><span>&#128274;</span><span><strong>Avant d’envoyer ce texte :</strong> il part chez l’assistant en ligne que vous choisissez, en dehors de l’application. Il ne contient pas votre nom. Restez général sur votre santé (« une contrainte physique » plutôt que le détail). Ne collez pas de documents avec des données très personnelles (numéro de sécurité sociale, avis d’imposition). Si vous joignez une photo (une offre, un programme, une fiche), vérifiez qu’elle ne montre pas votre nom, votre adresse ou votre téléphone ; sinon, masquez-les d’abord (un rectangle plein par-dessus, avec Paint ou l’application Photos).</span></div>';
    var contenu = attente ? envoiIAHTML('collecte') : blocReponse;
    return '<div class="bilan-preparer">' + intro + confid + contenu + '</div>';
  }

  // ------------------------------------------------------------------
  // BRIQUE COMMUNE : envoyer un texte a un assistant en ligne, puis coller sa reponse
  // (retour Denis 2026-09-30 : meme parcours que le reste de l'application, plus de texte de prompt affiche, plus de bouton « Copier »).
  // Trois phases par envoi, retenues dans etat.envoi[id] : 'choix' (on choisit l'assistant, le texte est copie), 'chez' (decompte, onglet
  // ouvert, « Je suis de retour »), 'coller' (on colle la reponse). Une configuration par ecran dans envoiIAConfig() : detection (ecran 1),
  // collecte (2), superposition (5), frise (6), aller plus loin (7).
  // ------------------------------------------------------------------
  var ENVOI_IA_ECRANS = { 1: 'detection', 2: 'collecte', 5: 'superpo', 6: 'frise', 7: 'apl' };
  function envoiIAPhase(id) { return (etat.envoi && etat.envoi[id]) || 'choix'; }
  function envoiIADefinirPhase(id, phase) { etat.envoi = etat.envoi || {}; etat.envoi[id] = phase; }
  function envoiIAConfig(id) {
    var confidPistes = 'Le texte reprend les informations déjà rassemblées sur vos pistes, sans votre nom. Rien n’est envoyé avant votre clic sur un assistant.';
    var configs = {
      collecte: {
        ecran: 2, suffixe: 'CompCollecte', web: true, track: 'collecte', video: 'comparer-activer-recherche-web',
        texte: ecran2ConstruireTexte, traiter: ecran2TraiterCollage,
        erreur: function () { return etat.collecteErreur; }, effacerErreur: function () { etat.collecteErreur = ''; },
        attente: function () { return !etat.collecteSansAssistant && !etat.dossiersCollecte; },
        confidentialite: 'Le texte ne contient pas votre nom. Rien n’est envoyé avant votre clic sur un assistant.',
        aideColler: '<p class="preparer-detail" style="margin-top:0;">Si la réponse n’a aucun lien de source, ou si toutes les dates sont celles d’aujourd’hui, l’application le signale : elle n’a probablement pas été cherchée sur internet.</p>',
        extraChoix: function () {
          return (
          '<details class="bloc-depli" open><summary><span class="preparer-titre">Je n’ai pas d’assistant en ligne</span></summary>' +
        '<div class="bloc-depli-corps">' +
        '<p style="font-size:.87rem;margin:.2rem 0;">Vous pouvez consulter vous-même les sites officiels : service-public.fr, francetravail.fr, moncompteformation.gouv.fr, Cap Métiers Nouvelle-Aquitaine, et pour le handicap agefiph.fr et votre MDPH. Ou apporter cette recherche à votre conseiller.</p>' +
        '<button type="button" class="btn btn-outline-secondary btn-sm" data-cp-sans-assistant>Continuer sans recherche web</button>' +
        '</div></details>');
        }
      },
      detection: {
        ecran: 1, suffixe: 'CompDetection', web: false, track: 'detection', video: null,
        texte: ecran0bisTextePromptDetection, traiter: ecran0bisTraiterDetection,
        erreur: function () { return etat.detectionErreur; }, effacerErreur: function () { etat.detectionErreur = ''; },
        attente: function () { return ecran0bisBesoinDetection(); },
        confidentialite: 'Le texte reprend ce que vous avez écrit dans « Ajouter mes pistes ». Si vous y avez mis votre nom, votre adresse ou votre téléphone, revenez les retirer avant de choisir un assistant. Rien n’est envoyé avant votre clic sur un assistant.'
      },
      superpo: {
        ecran: 5, suffixe: 'CompSuperpo', web: false, track: 'superposition', video: null,
        texte: ecran5TextePromptSuperpo, traiter: ecran5TraiterAffinage,
        erreur: function () { return etat.superpositionAffineeErreur; }, effacerErreur: function () { etat.superpositionAffineeErreur = ''; },
        attente: function () { return !etat.superpositionAffinee; },
        confidentialite: confidPistes
      },
      frise: {
        ecran: 6, suffixe: 'CompFrise', web: false, track: 'frise', video: null,
        texte: ecran6TextePromptFrise, traiter: ecran6TraiterCollage,
        erreur: function () { return etat.friseErreur; }, effacerErreur: function () { etat.friseErreur = ''; },
        attente: function () { return !etat.frise && !etat.friseSansAssistant; },
        confidentialite: confidPistes
      },
      apl: {
        ecran: 7, suffixe: 'CompApl', web: false, track: 'aller-plus-loin', video: null,
        texte: ecran7TextePrompt, traiter: ecran7TraiterCollage,
        erreur: function () { return etat.pistesReflexionErreur; }, effacerErreur: function () { etat.pistesReflexionErreur = ''; },
        attente: function () { return !etat.pistesReflexion; },
        confidentialite: 'Le texte reprend tout ce qui a été rassemblé sur vos pistes et vos réponses, sans votre nom. Rien n’est envoyé avant votre clic sur un assistant.'
      }
    };
    return configs[id];
  }

  function envoiIAHTML(id) {
    var cfg = envoiIAConfig(id);
    var phase = envoiIAPhase(id);
    var nomAssistant = (typeof _etatTransitionIA !== 'undefined' && _etatTransitionIA && _etatTransitionIA.nomAssistant) || 'l’assistant';
    if (phase === 'chez') {
      return '<div class="cv-section" data-cp-ecran-chez="' + id + '"><h4>&#128172; Chez ' + echapperAttribut(nomAssistant) + '</h4>' +
        '<p class="text-muted small mb-2">Le texte est déjà copié. L’onglet s’ouvre tout seul ; <strong>cette page reste ouverte</strong>, c’est ici que vous reviendrez.</p>' +
        (typeof htmlBanniereTransitionIA === 'function' ? htmlBanniereTransitionIA() : '') + '</div>';
    }
    if (phase === 'coller') {
      var erreurColler = cfg.erreur();
      return '<div class="cv-section bilan-etape-import-ia"><h4>&#128229; De retour : collez la réponse</h4>' +
        '<p class="text-muted small mb-2">Vous revenez de <strong>' + echapperAttribut(nomAssistant) + '</strong>. Sa réponse est dans votre presse-papiers : collez-la ci-dessous, puis <strong>Importer</strong>.</p>' +
        (cfg.aideColler || '') +
        '<div class="bilan-zone-collage">' +
        (typeof htmlCollageInstantane === 'function'
          ? htmlCollageInstantane(cfg.suffixe, { messageImportInitial: erreurColler ? '⚠️ ' + erreurColler : '', messageImportInitialErreur: !!erreurColler })
          : '<textarea class="form-control form-control-sm" rows="6" data-cp-collecte-manuel placeholder="Collez ici la réponse de l’assistant"></textarea>') +
        '</div></div>';
    }
    // Phase « choix »
    if (!cfg.texte()) {
      return '<p class="preparer-detail">Le texte n’a pas pu être chargé. Rechargez la page.</p>';
    }
    var erreurChoix = cfg.erreur();
    return '<div class="cv-section"><h4>&#128172; Choisissez votre assistant</h4>' +
      '<p class="text-muted small mb-2">Cliquez sur un assistant. L’application prépare et copie tout, puis l’ouvre dans un nouvel onglet : <strong>cette page reste ouverte</strong>, vous n’avez rien à taper.</p>' +
      // Retour Denis 2026-09-30 : pour la recherche sur internet, un bouton direct vers Perplexity, en plus de la liste habituelle.
      (cfg.web ? '<div class="text-center my-3"><button type="button" class="btn btn-primary btn-lg" data-cp-assistant="perplexity">&#11088; Aller sur Perplexity <span class="small">(recommandé pour cette recherche)</span></button>' +
        '<p class="preparer-detail mt-1 mb-0">Ou choisissez un autre assistant ci-dessous, par exemple celui que vous utilisez d’habitude.</p></div>' : '') +
      (typeof htmlChoixAssistantBilanCorps === 'function'
        ? htmlChoixAssistantBilanCorps({
            idErreur: 'cpErreurChoixIA', attrAssistant: 'data-cp-assistant', recapContexte: null,
            etapes: cfg.web ? COMPARER_ETAPES_CHOIX_IA : COMPARER_ETAPES_CHOIX_IA_SANS_WEB,
            texteConfidentialite: cfg.confidentialite,
            texteRecommande: cfg.web
              ? '&#11088; <strong>Pour cette étape, l’assistant doit chercher sur internet.</strong> Nous recommandons <strong>Perplexity</strong>, qui cherche toujours sur le web. Avec un autre assistant, vérifiez que la <strong>recherche web</strong> est en marche (un seul clic).'
              : undefined
          })
        : '<p class="text-muted">Choix de l’assistant (composant partagé).</p>') +
      (cfg.video && typeof htmlDeclencheurDemoVideo === 'function' ? htmlDeclencheurDemoVideo(cfg.video) : '') +
      '</div>' +
      (cfg.extraChoix ? cfg.extraChoix() : '') +
      (erreurChoix ? '<p class="cp-erreur">&#9888;&#65039; ' + echapperTexte(erreurChoix) + '</p>' : '');
  }

  // Choix d'un assistant : meme fenetre de confirmation que partout ailleurs (le texte est copie), puis on passe « Chez l'assistant ».
  function envoiIAPreparerEtEnvoyer(id, assistantId) {
    var cfg = envoiIAConfig(id);
    var assistant = (typeof ASSISTANTS_IA !== 'undefined') ? ASSISTANTS_IA.filter(function (a) { return a.id === assistantId; })[0] : null;
    if (!assistant || typeof ouvrirFenetreAssistantIA !== 'function') { return; }
    _comparerTrack('comparer_assistant_choisi', { assistant: assistant.id });
    ouvrirFenetreAssistantIA({
      nomAssistant: assistant.nom, idAssistant: assistant.id, urlAssistant: assistant.url,
      etapes: (typeof ETAPES_ASSISTANT_IA_TEXTE !== 'undefined') ? ETAPES_ASSISTANT_IA_TEXTE : undefined,
      construireTexteACopier: function () { return cfg.texte() || ''; },
      onApresValidation: function (urlAssistant, nomAssistantValide) {
        _etatTransitionIA = { urlAssistant: urlAssistant, nomAssistant: nomAssistantValide, phase: 'decompte', secondesRestantes: 5 };
        envoiIADefinirPhase(id, 'chez'); cfg.effacerErreur();
        _comparerTrack('comparer_prompt_copie', { type: cfg.track });
        afficherEcran(cfg.ecran);
      }
    });
  }
  // Etape « Chez l'assistant » : decompte, ouverture de l'onglet, « Je suis de retour » (meme sequence que le Bilan et Les mots de votre CV).
  function envoiIABrancherChez(id) {
    var cfg = envoiIAConfig(id);
    if (typeof _etatTransitionIA === 'undefined' || !_etatTransitionIA) { envoiIADefinirPhase(id, 'choix'); afficherEcran(cfg.ecran); return; }
    if (['decompte', 'bloque', 'ouvert'].indexOf(_etatTransitionIA.phase) === -1) { _etatTransitionIA.phase = 'ouvert'; afficherEcran(cfg.ecran); return; }
    function ouvrirEnAttente() {
      if (!document.querySelector('[data-cp-ecran-chez]')) { clearInterval(_comparerIntervalleDecompte); return; }
      recopierTexteAssistantPuisOuvrir(function () {
        var fen = window.open(_etatTransitionIA.urlAssistant, '_blank');
        _etatTransitionIA.phase = fen ? 'ouvert' : 'bloque';
        afficherEcran(cfg.ecran);
      });
    }
    if (_etatTransitionIA.phase === 'decompte') {
      var cont = document.getElementById('btnContinuerMaintenantIA');
      if (cont) { cont.addEventListener('click', function () { clearInterval(_comparerIntervalleDecompte); ouvrirEnAttente(); }); }
      clearInterval(_comparerIntervalleDecompte);
      _comparerIntervalleDecompte = setInterval(function () {
        _etatTransitionIA.secondesRestantes -= 1;
        var c = document.getElementById('compteurDecompteIA');
        if (c) { c.textContent = _etatTransitionIA.secondesRestantes; }
        if (_etatTransitionIA.secondesRestantes <= 0) { clearInterval(_comparerIntervalleDecompte); ouvrirEnAttente(); }
      }, 1000);
    } else if (_etatTransitionIA.phase === 'bloque') {
      var bl = document.getElementById('btnOuvrirBloqueIA');
      if (bl) { bl.addEventListener('click', ouvrirEnAttente); }
    } else if (_etatTransitionIA.phase === 'ouvert') {
      var ret = document.getElementById('btnJeSuisDeRetourIA');
      if (ret) { ret.addEventListener('click', function () { _etatTransitionIA.phase = 'revenu'; envoiIADefinirPhase(id, 'coller'); afficherEcran(cfg.ecran); }); }
      var rouvrir = document.getElementById('btnRouvrirSiteIA');
      if (rouvrir) { rouvrir.addEventListener('click', ouvrirEnAttente); }
    }
  }
  // Cablage d'un envoi : choix de l'assistant, etape « Chez l'assistant », collage de la reponse.
  function envoiIABrancher(id) {
    var racine = document.getElementById('contenuEcranComparer');
    if (!racine) { return; }
    var cfg = envoiIAConfig(id);
    racine.querySelectorAll('[data-cp-assistant]').forEach(function (el) {
      el.addEventListener('click', function () { envoiIAPreparerEtEnvoyer(id, this.getAttribute('data-cp-assistant')); });
    });
    if (racine.querySelector('[data-cp-ecran-chez="' + id + '"]')) { envoiIABrancherChez(id); }
    if (racine.querySelector('#zoneCollageAuto' + cfg.suffixe) && typeof activerCollageInstantane === 'function') {
      activerCollageInstantane({
        idZoneAuto: 'zoneCollageAuto' + cfg.suffixe, idZoneApercu: 'zoneApercuCollage' + cfg.suffixe,
        idTextarea: 'texteCollage' + cfg.suffixe, idBoutonColler: 'btnCollerAuto' + cfg.suffixe
      });
      var btnImp = document.getElementById('btnImporter' + cfg.suffixe);
      if (btnImp) {
        btnImp.addEventListener('click', function () {
          var ta = document.getElementById('texteCollage' + cfg.suffixe);
          var v = ta ? ta.value : '';
          var msg = document.getElementById('messageImport' + cfg.suffixe);
          if (msg) { msg.textContent = ''; msg.style.color = ''; }
          if (!v || !v.trim()) {
            if (msg) { msg.style.color = 'var(--danger)'; msg.textContent = '⚠️ Collez d’abord la réponse de l’assistant.'; }
            return;
          }
          cfg.traiter(v);
        });
      }
    }
  }
  // « Retour » : recule d'une etape de l'envoi en cours (coller -> chez -> choix) avant de quitter l'ecran. Renvoie true si l'ecran a recule.
  function envoiIARetourArriere() {
    var id = ENVOI_IA_ECRANS[etat.ecran];
    if (!id) { return false; }
    var cfg = envoiIAConfig(id);
    var phase = envoiIAPhase(id);
    if (!cfg.attente() || (phase !== 'coller' && phase !== 'chez')) { return false; }
    clearInterval(_comparerIntervalleDecompte);
    var avant = (phase === 'coller') ? 'chez' : 'choix';
    envoiIADefinirPhase(id, avant);
    if (avant === 'chez' && typeof _etatTransitionIA !== 'undefined' && _etatTransitionIA) { _etatTransitionIA.phase = 'ouvert'; }
    afficherEcran(cfg.ecran);
    return true;
  }

  function ecran2TraiterCollage(texte) {
    var res = comparerParserCollecte(texte);
    if (res.erreur) {
      etat.collecteErreur = res.erreur;
      afficherEcran(2);
      return;
    }
    _comparerTrack('comparer_reponse_collee', { type: 'collecte' });
    etat.collecteBrut = texte;
    etat.dossiersCollecte = res;
    etat.collecteErreur = '';
    var gf = comparerGardeFouCollecte(res);
    etat.collecteAlertes = gf.alertes;
    if (gf.alertes.length) { _comparerTrack('comparer_garde_fou', { alertes: gf.alertes.length }); }
    comparerMarquerEtudiees(res);
    afficherEcran(2);
  }

  // bloc 2 du sac persistant : au retour de la collecte ("la reponse a
  // ete emportee"), les pistes qui ont recu un dossier passent "deja
  // etudie le <aujourd'hui>". Date de DERNIERE etude (re-etude = mise a
  // jour). N'empeche jamais de re-etudier une piste.
  function comparerMarquerEtudiees(res) {
    if (!res || !res.pistes || !res.pistes.length) { return; }
    var reelles = ecran2PistesReelles();
    var appariement = (typeof comparerApparierDossiers === 'function')
      ? comparerApparierDossiers(reelles, res.pistes) : {};
    var jour = comparerAujourdhui();
    var reetudiees = 0;
    reelles.forEach(function (p) {
      if (!appariement[p.id]) { return; }
      if (p.etudieLe) { reetudiees += 1; } // portait deja un marquage
      p.etudieLe = jour;
    });
    // Suivi 3/3 : une piste deja etudiee est relancee dans une nouvelle
    // comparaison -> mesure si le sac persistant sert vraiment.
    if (reetudiees) { _comparerTrack('comparer_piste_reetudiee', { nombre: reetudiees }); }
  }

  function ecran2Brancher() {
    var racine = document.getElementById('contenuEcranComparer');
    if (!racine) { return; }

    // Choix de l'assistant, etape « Chez l'assistant », puis collage de la reponse (brique commune).
    envoiIABrancher('collecte');
    var manuel = racine.querySelector('[data-cp-collecte-manuel]');
    if (manuel) {
      manuel.addEventListener('change', function () { if (this.value.trim()) { ecran2TraiterCollage(this.value); } });
    }
    var btnRecommencer = racine.querySelector('[data-cp-collecte-recommencer]');
    if (btnRecommencer) {
      btnRecommencer.addEventListener('click', function () {
        etat.dossiersCollecte = null; etat.collecteAlertes = []; etat.collecteErreur = ''; envoiIADefinirPhase('collecte', 'choix');
        afficherEcran(2);
      });
    }
    var btnSans = racine.querySelector('[data-cp-sans-assistant]');
    if (btnSans) {
      btnSans.addEventListener('click', function () { etat.collecteSansAssistant = true; afficherEcran(2); });
    }
    var btnReprendre = racine.querySelector('[data-cp-collecte-reprendre]');
    if (btnReprendre) {
      btnReprendre.addEventListener('click', function () { etat.collecteSansAssistant = false; afficherEcran(2); });
    }
  }

  // ------------------------------------------------------------------
  // ECRAN 3 -- Une fiche par piste
  // ------------------------------------------------------------------

  // Legende "Vos pistes" (couleur + nom), partagee par les ecrans 3 a 8.
  function ecranLegendePistes(pistesArg) {
    var pistes = pistesArg || ecran2PistesReelles();
    if (!pistes.length) { return ''; }
    return '<div class="cp-legende"><span class="cp-legende-titre">Vos pistes</span>' +
      pistes.map(function (p) {
        return '<span class="cp-legende-piste"><span class="cp-pastille" style="background:' +
          echapperAttribut(p.couleur) + ';"></span>' + echapperTexte(p.nom) + '</span>';
      }).join('') + '</div>';
  }

  function ecran3SrclineHTML(l) {
    if (!l.source || !l.source.nom) {
      return '<span class="srcline manque"><strong>Source :</strong> aucune source trouvée, à voir avec le conseiller</span>';
    }
    var bouts = [echapperTexte(l.source.nom)];
    if (l.portee) { bouts.push(echapperTexte(l.portee)); }
    bouts.push(l.date_info ? echapperTexte(String(l.date_info)) : 'date non affichée');
    return '<span class="srcline"><strong>Source :</strong> ' + bouts.join(' · ') + '</span>';
  }

  function ecran3FicheHTML(piste, dossier) {
    var d = (dossier && dossier.durable) || {};
    var av = (dossier && dossier.a_verifier) || [];
    var inc = (dossier && dossier.incertitudes) || [];
    var couleurTxt = comparerTexteSurCouleur(piste.couleur);

    var durableHTML = '';
    if (dossier) {
      if (d.en_quoi_ca_consiste || d.activites_principales) {
        durableHTML += '<h3>Activités</h3><p>' +
          echapperTexte([d.en_quoi_ca_consiste, d.activites_principales].filter(Boolean).join(' ')) + '</p>';
      }
      if (d.conditions_travail) { durableHTML += '<h3>Conditions de travail</h3><p>' + echapperTexte(d.conditions_travail) + '</p>'; }
      var implique = [];
      if (d.niveau_ou_diplome) { implique.push('Niveau visé : ' + d.niveau_ou_diplome); }
      if (d.voies_acces) { implique.push('Voies d’accès : ' + d.voies_acces); }
      if (d.evolutions_et_metiers_proches) { implique.push('Évolutions et métiers proches : ' + d.evolutions_et_metiers_proches); }
      if (etat.handicap === 'rqth' && d.handicap_amenagements) { implique.push('Handicap : ' + d.handicap_amenagements); }
      if (implique.length) {
        durableHTML += '<h3>Ce que cette piste implique</h3><ul>' +
          implique.map(function (x) { return '<li>' + echapperTexte(x) + '</li>'; }).join('') + '</ul>';
      }
    } else {
      durableHTML = '<p class="preparer-detail">Informations non collectées pour cette piste. Consultez Onisep (onisep.fr) ou apportez cette piste à votre conseiller.</p>';
    }

    var verifItems = av.map(function (l) {
      var lbl = COMPARER_ELEMENT_LABELS[l.element] || (l.element || 'À vérifier').replace(/_/g, ' ');
      return '<li>' + echapperTexte(lbl) + ' : ' + echapperTexte(comparerFormaterValeur(l)) +
        ecran3SrclineHTML(l) + '</li>';
    });
    inc.forEach(function (t) {
      verifItems.push('<li>' + echapperTexte(t) +
        '<span class="srcline manque"><strong>À vérifier</strong> avec le conseiller</span></li>');
    });
    if (!verifItems.length) {
      verifItems.push('<li>Rien de collecté ici : à préparer avec votre conseiller.<span class="srcline manque"></span></li>');
    }

    var questions = [];
    if (piste.etiquette === 'formation') {
      questions.push('Le calendrier et le financement de cette formation sont-ils compatibles avec votre situation ?');
    } else if (piste.etiquette === 'situation') {
      questions.push('Qu’est-ce qui vous retient, ou vous attire, dans cette situation aujourd’hui ?');
    } else {
      questions.push('Avez-vous pu observer ce métier de près (immersion, échange avec un professionnel) ?');
    }
    if (piste.extrait && piste.source === 'nommee') {
      questions.push('Vous aviez noté « ' + piste.extrait + ' ». Est-ce toujours ce qui compte le plus ?');
    }

    return '<div class="cp-fiche">' +
      '<div class="cp-fiche-tete" style="background:' + echapperAttribut(piste.couleur) + ';color:' + couleurTxt + ';">' +
      echapperTexte(piste.nom) + '</div>' +
      '<div class="cp-fiche-corps">' +
      durableHTML +
      '<div class="cp-verif"><strong>À vérifier avant votre décision</strong> ' +
      '<span class="preparer-detail" style="display:block;">chaque ligne avec sa source, sa portée et sa date</span>' +
      '<ul class="verif-liste">' + verifItems.join('') + '</ul></div>' +
      '<h3>Questions à vous poser</h3><ul>' +
      questions.map(function (q) { return '<li>' + echapperTexte(q) + '</li>'; }).join('') + '</ul>' +
      '</div></div>';
  }

  function ecran3BlocCHTML() {
    etat.reponses = etat.reponses || {};
    etat.reponses.blocC = etat.reponses.blocC || { criteres: [], contrainte: '' };
    var choisis = etat.reponses.blocC.criteres;
    var opts = [
      'Le temps avant de retravailler', 'Le revenu pendant la transition', 'Le revenu après',
      'La sécurité, la stabilité', 'Les conditions de travail', 'Le lieu et le trajet',
      'Pouvoir changer plus tard (garder des portes ouvertes)', 'Être accompagné, ne pas être seul'
    ];
    return '<details class="bloc-depli mt-2" id="cpBlocC" open><summary>' +
      '<span class="preparer-titre">&#10068; Avant de continuer : qu’est-ce qui compte pour vous ?</span>' +
      '<span class="preparer-oblig">facultatif</span></summary>' +
      '<div class="bloc-depli-corps">' +
      '<p class="preparer-detail" style="margin-top:0;">Plusieurs possibles, aucune n’est « la bonne ». Réutilisé à l’étape « Aller plus loin ».</p>' +
      '<div class="preparer-jetons">' + opts.map(function (o) {
        return '<button type="button" class="preparer-jeton' + (choisis.indexOf(o) >= 0 ? ' preparer-jeton-actif' : '') +
          '" data-cp-critere="' + echapperAttribut(o) + '">' + echapperTexte(o) + '</button>';
      }).join('') + '</div>' +
      '<p style="font-size:.87rem;margin:.6rem 0 .2rem;">Une contrainte à ne pas oublier ?</p>' +
      '<textarea class="form-control form-control-sm" rows="2" data-cp-contrainte>' + echapperTexte(etat.reponses.blocC.contrainte || '') + '</textarea>' +
      '</div></details>';
  }

  function ecran3HTML() {
    var pistes = ecran2PistesReelles();
    var appariement = comparerApparierDossiers(pistes, etat.dossiersCollecte && etat.dossiersCollecte.pistes);

    return '<div class="bilan-preparer">' +
      '<p class="text-muted small" style="margin-bottom:.6rem;">Même structure pour chaque piste, chacune dans sa couleur. Vous pouvez vous arrêter là.</p>' +
      ecranLegendePistes(pistes) +
      (etat.collecteSansAssistant
        ? '<div class="cp-info-encart">Vous avez continué sans recherche web : les informations qui changent (rémunération, financement, tension) sont à vérifier avec un conseiller.</div>'
        : '') +
      '<div class="cp-fiches">' + pistes.map(function (p) { return ecran3FicheHTML(p, appariement[p.id]); }).join('') + '</div>' +
      '<div class="cp-info-encart"><strong>D’où viennent ces informations :</strong> les parties « Activités », « Conditions », « Ce que cette piste implique » viennent de la synthèse rapportée à l’étape précédente. L’encadré « À vérifier » porte, pour chaque ligne, sa source, sa portée et sa date, en texte (pas en lien : un lien rapporté par un assistant peut être faux). Toutes ces sources sont réunies à la fin pour votre conseiller.</div>' +
      ecran3BlocCHTML() +
      '<p class="mt-3"><button type="button" class="btn btn-outline-secondary btn-sm" data-cp-vers-fin>Passer directement à « Ce que je retiens »</button></p>' +
      '</div>';
  }

  function ecran3Brancher() {
    var racine = document.getElementById('contenuEcranComparer');
    if (!racine) { return; }
    etat.reponses = etat.reponses || {};
    etat.reponses.blocC = etat.reponses.blocC || { criteres: [], contrainte: '' };
    racine.querySelectorAll('[data-cp-critere]').forEach(function (el) {
      el.addEventListener('click', function () {
        var o = this.dataset.cpCritere;
        var arr = etat.reponses.blocC.criteres;
        var i = arr.indexOf(o);
        if (i >= 0) { arr.splice(i, 1); } else { arr.push(o); }
        this.classList.toggle('preparer-jeton-actif', arr.indexOf(o) >= 0);
      });
    });
    var contrainte = racine.querySelector('[data-cp-contrainte]');
    if (contrainte) { contrainte.addEventListener('input', function () { etat.reponses.blocC.contrainte = this.value; }); }
    var btnFin = racine.querySelector('[data-cp-vers-fin]');
    if (btnFin) { btnFin.addEventListener('click', function () { afficherEcran(8); }); }
  }

  // ------------------------------------------------------------------
  // ECRAN 4 -- Deux angles (aiguillage, cas mixte uniquement)
  // ------------------------------------------------------------------
  function ecran4HTML() {
    var dejaSuperpo = etat.anglesVus.indexOf('superposition') >= 0;
    var dejaFrise = etat.anglesVus.indexOf('frise') >= 0;
    return '<div class="bilan-preparer">' +
      '<p class="text-muted small" style="margin-bottom:.6rem;">Votre liste mélange des pistes de même nature et une (ou des) situation(s). On ne peut pas tout mettre sur la même échelle : on regarde en deux temps. Vous pouvez faire les deux, dans l’ordre que vous voulez, et y revenir.</p>' +
      ecranLegendePistes() +
      '<div class="cp-fiches">' +
      '<div class="cp-voie' + (dejaFrise ? ' cp-voie-faite' : '') + '"><strong>&#128260; Dans le temps</strong>' +
      '<p class="preparer-detail">Ce que ça change, mois après mois, de rester ou de partir sur chacune des autres pistes. Une frise : aujourd’hui, pendant, après.</p>' +
      '<button type="button" class="btn btn-primary btn-sm" data-cp-angle-vers="6">' + (dejaFrise ? 'Revoir cet angle' : 'Commencer par cet angle') + ' &#8594;</button></div>' +
      '<div class="cp-voie' + (dejaSuperpo ? ' cp-voie-faite' : '') + '"><strong>&#128209; Côte à côte</strong>' +
      '<p class="preparer-detail">Vos formations sur les mêmes repères chiffrés : durée, coût, rémunération. Des réglettes, une dimension à la fois.</p>' +
      '<button type="button" class="btn btn-outline-secondary btn-sm" data-cp-angle-vers="5">' + (dejaSuperpo ? 'Revoir cet angle' : 'Voir cet angle') + ' &#8594;</button></div>' +
      '</div>' +
      '<div class="cp-info-encart"><strong>On vous conseille de commencer par « dans le temps ».</strong> C’est la question qui commande : bouger, ou pas. « Côte à côte » aide ensuite à choisir entre les formations, si vous décidez de bouger.</div>' +
      (dejaSuperpo && dejaFrise
        ? '<p class="mt-3"><button type="button" class="btn btn-primary" data-cp-angle-vers="7">Continuer &#8594;</button></p>'
        : '') +
      '</div>';
  }
  function ecran4Brancher() {
    var racine = document.getElementById('contenuEcranComparer');
    if (!racine) { return; }
    racine.querySelectorAll('[data-cp-angle-vers]').forEach(function (el) {
      el.addEventListener('click', function () { afficherEcran(parseInt(this.dataset.cpAngleVers, 10)); });
    });
  }

  // ------------------------------------------------------------------
  // ECRAN 5 -- Superposer (construit a partir des donnees de collecte)
  // ------------------------------------------------------------------
  // Une dimension est affichee : par defaut les cinq habituelles ; la personne peut en retirer, ou en ajouter parmi les autres (etat.dimensionsChoisies).
  function ecran5DimensionAffichee(dim) {
    return etat.dimensionsChoisies ? etat.dimensionsChoisies.indexOf(dim.element) !== -1 : !dim.optionnelle;
  }
  function ecran5DonneesToutes() {
    var pistes = ecran2PistesReelles().filter(function (p) {
      return p.etiquette === 'metier' || p.etiquette === 'formation';
    });
    var appariement = comparerApparierDossiers(pistes, etat.dossiersCollecte && etat.dossiersCollecte.pistes);
    return COMPARER_DIMENSIONS_REGLETTE.map(function (dim) {
      var valeurs = pistes.map(function (p) {
        var dossier = appariement[p.id];
        var ligne = dossier && (dossier.a_verifier || []).filter(function (l) {
          return l.element === dim.element;
        })[0];
        var nb = ligne ? comparerExtraireNombres(ligne.valeur) : null;
        return {
          piste: p, ligne: ligne || null, nb: nb,
          texte: ligne ? comparerFormaterValeur(ligne) : null
        };
      });
      var avecNb = valeurs.filter(function (v) { return v.nb; });
      var borneMin = 0, borneMax = 1;
      if (avecNb.length) {
        var lo = Math.min.apply(null, avecNb.map(function (v) { return v.nb.min; }));
        var hi = Math.max.apply(null, avecNb.map(function (v) { return v.nb.max; }));
        var span = hi - lo;
        var marge = span > 0 ? span * 0.2 : Math.max(hi * 0.1, 1);
        // Echelle depuis 0 seulement si les valeurs sont proches de 0.
        borneMin = (lo <= hi * 0.4) ? 0 : Math.max(0, lo - marge);
        borneMax = hi + marge;
      }
      return { dim: dim, valeurs: valeurs, avecNb: avecNb.length, borneMin: borneMin, borneMax: borneMax };
    }).filter(function (d) {
      // On garde une dimension si au moins une piste a une valeur (chiffree ou texte).
      return d.valeurs.some(function (v) { return v.texte; });
    });
  }
  function ecran5Donnees() {
    return ecran5DonneesToutes().filter(function (d) { return ecran5DimensionAffichee(d.dim); });
  }
  // « Ce que je compare » : une case par dimension pour laquelle des informations ont ete trouvees.
  function ecran5ChoixDimensionsHTML() {
    var toutes = ecran5DonneesToutes();
    if (toutes.length < 2) { return ''; }
    return '<div class="cp-choix-dim"><p class="cp-choix-dim-titre">Ce que je compare</p>' +
      '<p class="preparer-detail" style="margin:0 0 .4rem;">Cochez les lignes qui comptent pour vous. Les informations viennent de la recherche déjà faite.</p>' +
      '<div class="cp-choix-dim-liste">' + toutes.map(function (d) {
        return '<label class="cp-choix-dim-ligne"><input type="checkbox" data-cp-dim="' + echapperAttribut(d.dim.element) + '"' + (ecran5DimensionAffichee(d.dim) ? ' checked' : '') + '> ' + echapperTexte(d.dim.label) + '</label>';
      }).join('') + '</div></div>';
  }

  function ecran5RegletteHTML(d) {
    var etendue = d.borneMax - d.borneMin || 1;
    var reperes = d.valeurs.filter(function (v) { return v.nb; }).map(function (v, i) {
      var centre = (v.nb.min + v.nb.max) / 2;
      var pct = Math.max(8, Math.min(92, ((centre - d.borneMin) / etendue) * 100));
      return '<div class="cp-repere" style="left:' + pct.toFixed(1) + '%;bottom:' + (i % 2 ? '-2.6rem' : '1.4rem') + ';">' +
        '<div class="cp-repere-lbl" style="color:' + echapperAttribut(v.piste.couleur) + ';">' + echapperTexte(v.piste.nom) + '</div>' +
        '<div class="cp-repere-pt" style="background:' + echapperAttribut(v.piste.couleur) + ';"></div>' +
        '<div class="cp-repere-val">' + echapperTexte(v.texte) + '</div></div>';
    }).join('');
    var track = '<div class="cp-reglette">' +
      '<div class="cp-grad" style="left:1%"><span>' + Math.round(d.borneMin) + '</span></div>' +
      '<div class="cp-grad" style="left:99%"><span>' + Math.round(d.borneMax) + '</span></div>' +
      reperes + '</div>';

    var absentes = d.valeurs.filter(function (v) { return !v.texte; }).map(function (v) { return v.piste.nom; });
    var nonChiffrees = d.valeurs.filter(function (v) { return v.texte && !v.nb; });
    var srcs = d.valeurs.filter(function (v) { return v.ligne && v.ligne.source && v.ligne.source.nom; });

    var q = d.dim.question;
    if (d.avecNb < 2) {
      q = 'Sur ce point, la dimension ne distingue pas vos pistes (une seule valeur chiffrée). ' + q;
    }

    return '<div class="cp-dim-bloc">' +
      '<p class="cp-dim-titre">' + echapperTexte(d.dim.label) + (d.dim.unite ? ' (' + d.dim.unite + ')' : '') + '</p>' +
      (d.avecNb ? track : (d.dim.type === 'texte' ? '' : '<p class="preparer-detail">Aucune valeur chiffrée à placer sur une échelle.</p>')) +
      nonChiffrees.map(function (v) {
        return '<p class="preparer-detail" style="margin:.2rem 0 0;">' + echapperTexte(v.piste.nom) + ' : ' + echapperTexte(v.texte) + '</p>';
      }).join('') +
      (absentes.length ? '<p class="srcline manque" style="margin:.2rem 0 0;">Non trouvé pour : ' + echapperTexte(absentes.join(', ')) + '.</p>' : '') +
      '<p class="cp-dim-question">' + echapperTexte(q) + '</p>' +
      (srcs.length ? '<p class="srcline">' + srcs.map(function (v) {
        return echapperTexte(v.piste.nom + ' : ' + v.ligne.source.nom + (v.ligne.date_info ? ' (' + v.ligne.date_info + ')' : ''));
      }).join(' ; ') + '</p>' : '') +
      '</div>';
  }

  function ecran5HTML() {
    var donnees = ecran5Donnees();
    var pistesSuperpo = ecran2PistesReelles().filter(function (p) { return p.etiquette === 'metier' || p.etiquette === 'formation'; });
    if (etat.anglesVus.indexOf('superposition') < 0) { etat.anglesVus.push('superposition'); }

    var corps = ecran5ChoixDimensionsHTML() + (donnees.length
      ? donnees.map(ecran5RegletteHTML).join('')
      : '<p class="preparer-detail">Aucune donnée chiffrée à superposer pour l’instant. Les fiches (écran précédent) gardent le détail.</p>');

    var promptAffine = ecran5TextePromptSuperpo();
    var affinage = (promptAffine && typeof htmlCollageInstantane === 'function')
      ? '<details class="bloc-depli mt-3" open><summary><span class="preparer-titre">&#10024; Affiner avec un assistant (optionnel)</span></summary>' +
        '<div class="bloc-depli-corps">' +
'<p class="preparer-detail" style="margin-top:0;">L’application a placé ce qu’elle a pu. Pour des questions plus fines ou des valeurs floues, vous pouvez passer ce texte à un assistant (aucune recherche web).</p>' +
        (etat.superpositionAffinee
          ? '<p class="small" style="color:var(--success-strong);">&#9989; Réponse prise en compte, merci.</p>' +
            '<button type="button" class="btn btn-outline-secondary btn-sm" data-cp-superpo-recommencer>Coller une autre réponse</button>'
          : envoiIAHTML('superpo')) +
        '</div></details>'
      : '';

    return '<div class="bilan-preparer">' +
      '<p class="text-muted small" style="margin-bottom:.6rem;">Une dimension à la fois, les pistes sur la même échelle, chacune dans sa couleur. Une valeur plus courte, moins chère ou plus élevée n’est pas « meilleure ».</p>' +
      ecranLegendePistes(pistesSuperpo) +
      corps +
      '<div class="cp-info-encart">Les dimensions sans chiffre comparable (activités, conditions de travail, ce que ça implique) ne sont pas superposées : elles restent dans les fiches. Aucun total, aucune note.</div>' +
      affinage +
      (etat.formeComparaison === 'mixte'
        ? '<div class="cp-info-encart"><strong>&#128260; Il reste l’autre angle.</strong> Pour savoir si bouger vaut le coup, regardez « dans le temps ».' +
          ' <button type="button" class="btn btn-primary btn-sm" data-cp-angle-vers="6">Regarder « dans le temps » &#8594;</button>' +
          ' <button type="button" class="btn btn-outline-secondary btn-sm" data-cp-angle-vers="4">Retour à la carte des angles</button></div>'
        : '') +
      '</div>';
  }

  function ecran5TextePromptSuperpo() {
    var brut = (typeof promptsExternesCharges !== 'undefined' && promptsExternesCharges)
      ? promptsExternesCharges['comparer-meme-categorie'] : null;
    if (!brut || !etat.dossiersCollecte) { return null; }
    var pistesSuperpo = ecran2PistesReelles().filter(function (p) { return p.etiquette === 'metier' || p.etiquette === 'formation'; });
    var appariement = comparerApparierDossiers(pistesSuperpo, etat.dossiersCollecte.pistes);
    var dossiersLegers = pistesSuperpo.map(function (p) {
      var d = appariement[p.id];
      return { nom: p.nom, a_verifier: (d && d.a_verifier) || [] };
    });
    var valeurs = {
      DOSSIERS: JSON.stringify(dossiersLegers, null, 1),
      COMMUNE: ''
    };
    return (typeof bilanResoudrePlaceholders === 'function')
      ? bilanResoudrePlaceholders(brut, valeurs).texte
      : brut.replace(/\{DOSSIERS\}/g, valeurs.DOSSIERS).replace(/\{COMMUNE\}/g, '');
  }

  function ecran5Brancher() {
    var racine = document.getElementById('contenuEcranComparer');
    if (!racine) { return; }
    racine.querySelectorAll('[data-cp-angle-vers]').forEach(function (el) {
      el.addEventListener('click', function () { afficherEcran(parseInt(this.dataset.cpAngleVers, 10)); });
    });
    // « Ce que je compare » : cocher ou decocher une ligne (la selection de depart = les cinq lignes habituelles).
    racine.querySelectorAll('[data-cp-dim]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        if (!etat.dimensionsChoisies) {
          etat.dimensionsChoisies = COMPARER_DIMENSIONS_REGLETTE.filter(function (d) { return !d.optionnelle; }).map(function (d) { return d.element; });
        }
        var el = this.getAttribute('data-cp-dim'), i = etat.dimensionsChoisies.indexOf(el);
        if (this.checked && i === -1) { etat.dimensionsChoisies.push(el); }
        if (!this.checked && i !== -1) { etat.dimensionsChoisies.splice(i, 1); }
        _comparerTrack('comparer_dimensions_choisies', { nombre: etat.dimensionsChoisies.length });
        afficherEcran(5);
      });
    });
    envoiIABrancher('superpo');
    var rSuperpo = racine.querySelector('[data-cp-superpo-recommencer]');
    if (rSuperpo) { rSuperpo.addEventListener('click', function () { etat.superpositionAffinee = null; etat.superpositionAffineeErreur = ''; envoiIADefinirPhase('superpo', 'choix'); afficherEcran(5); }); }
  }

  function ecran5TraiterAffinage(texte) {
    // TACHE (audit de stabilisation, 2026-09-13, finding 1) : un succes ne donnait auparavant AUCUN retour visible ; le message de confirmation
    // est desormais affiche dans le bloc (« Reponse prise en compte, merci »).
    try {
      var t = String(texte); var a = t.indexOf('{'); var b = t.lastIndexOf('}');
      var obj = _comparerLireJSON(t.slice(a, b + 1), t);
      if (!obj || !Array.isArray(obj.dimensions)) { throw new Error('format'); }
      etat.superpositionAffinee = obj;
      etat.superpositionAffineeErreur = '';
    } catch (e) {
      etat.superpositionAffineeErreur = 'La réponse n’a pas pu être lue. L’affichage automatique reste valable.';
    }
    afficherEcran(5);
  }

  // ------------------------------------------------------------------
  // ECRAN 6 -- Dans le temps (frise, aller-retour du prompt 3)
  // ------------------------------------------------------------------
  function ecran6Colonnes() {
    var reelles = ecran2PistesReelles();
    var situations = reelles.filter(function (p) { return p.etiquette === 'situation'; });
    var departs = reelles.filter(function (p) { return p.etiquette === 'metier' || p.etiquette === 'formation'; });
    // Frise pure (que des situations) : toutes en colonnes, la premiere sert de repere.
    if (!departs.length) {
      return situations.map(function (p, i) { return { piste: p, role: i === 0 ? 'repere' : 'depart' }; });
    }
    return situations.map(function (p) { return { piste: p, role: 'repere' }; })
      .concat(departs.map(function (p) { return { piste: p, role: 'depart' }; }));
  }

  function ecran6TextePromptFrise() {
    var brut = (typeof promptsExternesCharges !== 'undefined' && promptsExternesCharges)
      ? promptsExternesCharges['comparer-situations'] : null;
    if (!brut) { return null; }
    var cols = ecran6Colonnes();
    var colonnesTxt = cols.map(function (c) {
      return '- ' + c.piste.nom + ' (' + (c.role === 'repere' ? 'repère' : 'départ') + ')';
    }).join('\n');
    var appariement = comparerApparierDossiers(cols.map(function (c) { return c.piste; }), etat.dossiersCollecte && etat.dossiersCollecte.pistes);
    var dossiersLegers = cols.map(function (c) {
      var d = appariement[c.piste.id];
      return { nom: c.piste.nom, a_verifier: (d && d.a_verifier) || [] };
    });
    var valeurs = {
      COLONNES: colonnesTxt,
      DOSSIERS: JSON.stringify(dossiersLegers, null, 1),
      PRECISIONS: ecran2PrecisionsTexte(),
      ECHEANCE: 'aucune échéance précisée',
      HANDICAP: ecran2HandicapTexte()
    };
    return (typeof bilanResoudrePlaceholders === 'function')
      ? bilanResoudrePlaceholders(brut, valeurs).texte
      : brut.replace(/\{([A-Z_]+)\}/g, function (m, k) { return valeurs[k] != null ? valeurs[k] : m; });
  }

  function ecran6TraiterCollage(texte) {
    var res = comparerParserFrise(texte);
    if (res.erreur) { etat.friseErreur = res.erreur; afficherEcran(6); return; }
    _comparerTrack('comparer_reponse_collee', { type: 'frise' });
    etat.friseBrut = texte;
    etat.frise = res;
    etat.friseErreur = '';
    afficherEcran(6);
  }

  function ecran6FriseHTML() {
    var cols = ecran6Colonnes();
    var parNom = {};
    var norm = (typeof normaliserTexte === 'function') ? normaliserTexte : function (s) { return String(s).toLowerCase(); };
    cols.forEach(function (c) { parNom[norm(c.piste.nom)] = c.piste; });
    function couleurDe(nom) {
      var cible = norm(nom);
      var cle = Object.keys(parNom).filter(function (k) { return k === cible || k.indexOf(cible) >= 0 || cible.indexOf(k) >= 0; })[0];
      return cle ? parNom[cle].couleur : 'var(--text-muted)';
    }
    var colonnes = (etat.frise.colonnes || []).slice();
    colonnes.sort(function (x, y) { return (x.role === 'repere' ? 0 : 1) - (y.role === 'repere' ? 0 : 1); });

    function rang(cle, libelleMoment) {
      return '<div class="cp-frise-rang"><div class="cp-frise-moment">' + libelleMoment + '</div>' +
        '<div class="cp-frise-cells">' + colonnes.map(function (c) {
          return '<div class="cp-frise-cell" style="border-left-color:' + echapperAttribut(couleurDe(c.nom)) + ';">' +
            '<b style="color:' + echapperAttribut(couleurDe(c.nom)) + ';">' + echapperTexte(c.nom) + '</b> : ' +
            echapperTexte(c[cle] || 'à préparer avec le conseiller') + '</div>';
        }).join('') + '</div></div>';
    }

    var conditions = (etat.frise.conditions_a_reunir || []).concat(etat.frise.impact_sur_les_droits || []);
    var condHTML = conditions.length
      ? '<div class="cp-section"><h3>Conditions à réunir, effet sur vos droits</h3><ul class="verif-liste">' +
        conditions.map(function (c) {
          return '<li>' + echapperTexte(c.libelle) + (c.regle ? ' - ' + echapperTexte(c.regle) : '') +
            (c.source && c.source.nom
              ? '<span class="srcline"><strong>Source :</strong> ' + echapperTexte(c.source.nom) + (c.date_info ? ' · ' + echapperTexte(String(c.date_info)) : '') + '</span>'
              : '<span class="srcline manque"><strong>À vérifier</strong> avec le conseiller</span>') + '</li>';
        }).join('') + '</ul></div>'
      : '';

    return '<div class="cp-frise">' + rang('aujourdhui', 'Aujourd’hui') + rang('pendant', 'Pendant') + rang('apres', 'Après') + '</div>' +
      '<div class="cp-info-encart"><strong>Vient de :</strong> le prompt « dans le temps ». Une colonne par piste, jamais fusionnées, aucune n’est présentée comme préférable.</div>' +
      condHTML +
      (etat.frise.incertitudes && etat.frise.incertitudes.length
        ? '<p class="srcline manque">À vérifier : ' + etat.frise.incertitudes.map(echapperTexte).join(' ; ') + '</p>' : '') +
      '<div class="cp-info-encart"><strong>L’application ne dit jamais</strong> « partez » ni « restez ». Elle pose les conditions, les échéances et les questions à préparer avec un conseiller.</div>';
  }

  function ecran6HTML() {
    if (etat.anglesVus.indexOf('frise') < 0) { etat.anglesVus.push('frise'); }
    var cols = ecran6Colonnes();
    var legendeHTML = '<div class="cp-legende"><span class="cp-legende-titre">Vos pistes</span>' +
      cols.map(function (c) {
        return '<span class="cp-legende-piste"><span class="cp-pastille" style="background:' + echapperAttribut(c.piste.couleur) + ';"></span>' +
          (c.role === 'repere' ? 'Repère : ' : 'Départ : ') + echapperTexte(c.piste.nom) + '</span>';
      }).join('') + '</div>';

    var corps;
    if (etat.frise) {
      corps = ecran6FriseHTML() +
        '<button type="button" class="btn btn-outline-secondary btn-sm mt-2" data-cp-frise-recommencer>Coller une autre réponse</button>';
    } else if (etat.friseSansAssistant) {
      corps = '<div class="cp-info-encart">Sans assistant : voici les colonnes, à remplir avec votre conseiller.</div>' +
        '<div class="cp-frise"><div class="cp-frise-rang"><div class="cp-frise-moment">Aujourd’hui / Pendant / Après</div>' +
        '<div class="cp-frise-cells">' + cols.map(function (c) {
          return '<div class="cp-frise-cell" style="border-left-color:' + echapperAttribut(c.piste.couleur) + ';"><b>' +
            echapperTexte(c.piste.nom) + '</b> : à préparer avec le conseiller</div>';
        }).join('') + '</div></div></div>' +
        '<button type="button" class="btn btn-outline-secondary btn-sm mt-2" data-cp-frise-reprendre>Finalement, coller une réponse d’assistant</button>';
    } else {
      corps = envoiIAHTML('frise') +
        '<p class="preparer-detail mt-2"><button type="button" class="btn btn-outline-secondary btn-sm" data-cp-frise-sans-assistant>Je n’ai pas d’assistant en ligne</button></p>';
    }

    return '<div class="bilan-preparer">' +
      '<p class="text-muted small" style="margin-bottom:.6rem;">On ne met pas ces pistes sur une échelle : on regarde ce que chacune change <strong>mois après mois</strong>. La colonne « repère » sert de point de comparaison.</p>' +
      legendeHTML + corps +
      (etat.formeComparaison === 'mixte'
        ? '<div class="cp-info-encart"><strong>&#128209; Il reste l’autre angle.</strong> Pour départager vos formations sur les chiffres, regardez-les « côte à côte ».' +
          ' <button type="button" class="btn btn-primary btn-sm" data-cp-angle-vers="5">Regarder « côte à côte » &#8594;</button>' +
          ' <button type="button" class="btn btn-outline-secondary btn-sm" data-cp-angle-vers="4">Retour à la carte des angles</button></div>'
        : '') +
      '</div>';
  }

  function ecran6PeutContinuer() { return !!etat.frise || etat.friseSansAssistant; }
  function ecran6RaisonBlocage() {
    return ecran6PeutContinuer() ? '' : 'Collez la réponse de l’assistant, ou choisissez « Je n’ai pas d’assistant en ligne ».';
  }

  function ecran6Brancher() {
    var racine = document.getElementById('contenuEcranComparer');
    if (!racine) { return; }
    racine.querySelectorAll('[data-cp-angle-vers]').forEach(function (el) {
      el.addEventListener('click', function () { afficherEcran(parseInt(this.dataset.cpAngleVers, 10)); });
    });
    envoiIABrancher('frise');
    var r = racine.querySelector('[data-cp-frise-recommencer]');
    if (r) { r.addEventListener('click', function () { etat.frise = null; etat.friseErreur = ''; envoiIADefinirPhase('frise', 'choix'); afficherEcran(6); }); }
    var s = racine.querySelector('[data-cp-frise-sans-assistant]');
    if (s) { s.addEventListener('click', function () { etat.friseSansAssistant = true; afficherEcran(6); }); }
    var rep = racine.querySelector('[data-cp-frise-reprendre]');
    if (rep) { rep.addEventListener('click', function () { etat.friseSansAssistant = false; afficherEcran(6); }); }
  }

  // ------------------------------------------------------------------
  // ECRAN 7 -- Aller plus loin (prompt 4, optionnel)
  // ------------------------------------------------------------------
  function ecran7TextePrompt() {
    var brut = (typeof promptsExternesCharges !== 'undefined' && promptsExternesCharges)
      ? promptsExternesCharges['comparer-aller-plus-loin'] : null;
    if (!brut) { return null; }
    var pistes = ecran2PistesReelles();
    var appariement = comparerApparierDossiers(pistes, etat.dossiersCollecte && etat.dossiersCollecte.pistes);
    var dossiersLegers = pistes.map(function (p) {
      var d = appariement[p.id];
      return { nom: p.nom, a_verifier: (d && d.a_verifier) || [], durable: (d && d.durable) || {} };
    });
    var rc = (etat.reponses && etat.reponses.blocC) || { criteres: [], contrainte: '' };
    var comparaison = [];
    if (etat.anglesVus.indexOf('superposition') >= 0) { comparaison.push('Superposition faite.'); }
    if (etat.frise) { comparaison.push('Frise dans le temps faite.'); }
    var valeurs = {
      DOSSIERS: JSON.stringify(dossiersLegers, null, 1),
      COMPARAISON: comparaison.join(' ') || 'Pas encore de vue comparée.',
      CE_QUI_COMPTE: (rc.criteres || []).join(', ') || 'non précisé',
      CONTRAINTES: [rc.contrainte, ecran2PrecisionsTexte()].filter(Boolean).join(' ; '),
      HANDICAP: ecran2HandicapTexte()
    };
    return (typeof bilanResoudrePlaceholders === 'function')
      ? bilanResoudrePlaceholders(brut, valeurs).texte
      : brut.replace(/\{([A-Z_]+)\}/g, function (m, k) { return valeurs[k] != null ? valeurs[k] : m; });
  }

  function ecran7TraiterCollage(texte) {
    var res = comparerParserAllerPlusLoin(texte);
    if (res.erreur) { etat.pistesReflexionErreur = res.erreur; afficherEcran(7); return; }
    _comparerTrack('comparer_reponse_collee', { type: 'aller-plus-loin' });
    etat.pistesReflexionBrut = texte;
    etat.pistesReflexion = res.questions;
    etat.pistesReflexionErreur = '';
    afficherEcran(7);
  }

  function ecran7HTML() {
    var corps;
    if (etat.pistesReflexion) {
      corps = '<div class="cp-section"><h3>&#128161; Pistes de réflexion</h3><ul>' +
        etat.pistesReflexion.map(function (q) { return '<li>' + echapperTexte(q) + '</li>'; }).join('') +
        '</ul><p class="preparer-detail">Affiché à part, jamais mélangé aux fiches. Aucune n’est un résultat : ce sont des angles à travailler avec un conseiller.</p></div>' +
        '<button type="button" class="btn btn-outline-secondary btn-sm mt-2" data-cp-apl-recommencer>Coller une autre réponse</button>';
    } else {
      corps = envoiIAHTML('apl');
    }
    return '<div class="bilan-preparer">' +
      '<p class="text-muted small" style="margin-bottom:.6rem;">Optionnel. Ce texte ouvre des angles que vous n’avez peut-être pas encore vus. Vous pouvez passer directement à la suite.</p>' +
      corps +
      '<p class="mt-3"><button type="button" class="btn btn-outline-secondary btn-sm" data-cp-apl-passer>Passer, aller à « Ce que je retiens »</button></p>' +
      '</div>';
  }

  function ecran7Brancher() {
    var racine = document.getElementById('contenuEcranComparer');
    if (!racine) { return; }
    envoiIABrancher('apl');
    var rr = racine.querySelector('[data-cp-apl-recommencer]');
    if (rr) { rr.addEventListener('click', function () { etat.pistesReflexion = null; etat.pistesReflexionErreur = ''; envoiIADefinirPhase('apl', 'choix'); afficherEcran(7); }); }
    var pp = racine.querySelector('[data-cp-apl-passer]');
    if (pp) { pp.addEventListener('click', function () { etat.pistesReflexionSautee = true; afficherEcran(8); }); }
  }

  // ------------------------------------------------------------------
  // ECRAN 8 -- Ce que vous retenez
  // ------------------------------------------------------------------

  // Points a discuter avec le conseiller : tout ce qui reste "a verifier"
  // + conditions + incertitudes + questions conseiller + freins + handicap.
  function ecran8PointsConseiller() {
    var pts = [];
    (etat.dossiersCollecte && etat.dossiersCollecte.pistes || []).forEach(function (p) {
      (p.a_verifier || []).forEach(function (l) {
        if (!l.source || !l.source.nom || l.valeur === null) {
          pts.push((COMPARER_ELEMENT_LABELS[l.element] || l.element) + ' pour « ' + p.nom + ' » : à préciser.');
        }
      });
      (p.incertitudes || []).forEach(function (t) { pts.push(t); });
    });
    if (etat.frise) {
      (etat.frise.conditions_a_reunir || []).forEach(function (c) { pts.push(c.libelle + (c.regle ? ' - ' + c.regle : '')); });
      (etat.frise.impact_sur_les_droits || []).forEach(function (c) { pts.push('Impact sur ' + c.libelle + (c.regle ? ' : ' + c.regle : '')); });
      (etat.frise.questions_conseiller || []).forEach(function (q) { pts.push(q); });
    }
    ecran0bisPistesAffichees().filter(function (p) { return p.etiquette === 'frein_ou_etape'; }).forEach(function (p) {
      var code = comparerNomVersCodeFrein(p.nom);
      pts.push('Frein « ' + p.nom + ' »' + (code ? ' : voir les ressources du répertoire de l’application' : ' : à noter'));
    });
    if (etat.handicap === 'rqth') {
      pts.push('Handicap : aménagements possibles, formation accessible, aides AGEFIPH. Interlocuteurs : Cap emploi, MDPH du département.');
    }
    // Dedoublonnage grossier.
    var vus = {};
    return pts.filter(function (t) { t = t.trim(); if (!t || vus[t]) { return false; } vus[t] = true; return true; });
  }

  function ecran8TableauSourcesHTML() {
    var lignes = [];
    (etat.dossiersCollecte && etat.dossiersCollecte.pistes || []).forEach(function (p) {
      (p.a_verifier || []).forEach(function (l) {
        lignes.push({
          info: (COMPARER_ELEMENT_LABELS[l.element] || l.element) + ' - ' + p.nom,
          rapporte: comparerFormaterValeur(l),
          source: (l.source && l.source.nom)
            ? l.source.nom + (l.portee ? ' · ' + l.portee : '') + ' · ' + (l.date_info || 'date non affichée')
            : 'aucune source'
        });
      });
    });
    if (!lignes.length) { return ''; }
    return '<div class="cp-section"><h3>&#128209; Sources des informations</h3>' +
      '<p class="preparer-detail" style="margin-top:0;">Chaque information rapportée, avec sa source, sa portée et sa date. Incluse dans le récapitulatif à copier pour votre conseiller. Les lignes « aucune source » sont à vérifier en priorité.</p>' +
      '<div style="overflow-x:auto;"><table class="cp-src-tableau"><thead><tr><th>Information</th><th>Ce qui a été rapporté</th><th>Source, portée, date</th></tr></thead><tbody>' +
      lignes.map(function (l) {
        return '<tr><td>' + echapperTexte(l.info) + '</td><td>' + echapperTexte(l.rapporte) + '</td><td>' + echapperTexte(l.source) + '</td></tr>';
      }).join('') + '</tbody></table></div></div>';
  }

  function ecran8RecapTexte() {
    var lignes = ['COMPARER MES PISTES - récapitulatif pour un échange avec un conseiller', ''];
    lignes.push('Pistes : ' + ecran2PistesReelles().map(function (p) { return p.nom; }).join(' ; '));
    var s = COMPARER_SITUATIONS.filter(function (o) { return o.id === etat.situation; })[0];
    if (s) { lignes.push('Situation : ' + s.libelle); }
    var rc = (etat.reponses && etat.reponses.blocC) || {};
    if (rc.criteres && rc.criteres.length) { lignes.push('Ce qui compte : ' + rc.criteres.join(', ')); }
    if (rc.contrainte) { lignes.push('Contrainte à ne pas oublier : ' + rc.contrainte); }
    if (etat.retenirTexte) { lignes.push('', 'Ce que je retiens :', etat.retenirTexte); }
    lignes.push('', 'Points à discuter avec mon conseiller :');
    ecran8PointsConseiller().forEach(function (t) { lignes.push('- ' + t); });
    var srcLignes = [];
    (etat.dossiersCollecte && etat.dossiersCollecte.pistes || []).forEach(function (p) {
      (p.a_verifier || []).forEach(function (l) {
        srcLignes.push('- ' + (COMPARER_ELEMENT_LABELS[l.element] || l.element) + ' (' + p.nom + ') : ' +
          comparerFormaterValeur(l) + ' [' + ((l.source && l.source.nom) ? l.source.nom + (l.date_info ? ', ' + l.date_info : '') : 'aucune source') + ']');
      });
    });
    if (srcLignes.length) { lignes.push('', 'Sources :'); srcLignes.forEach(function (t) { lignes.push(t); }); }
    lignes.push('', 'Ces informations servent à préparer un échange avec un conseiller et peuvent évoluer.');
    return lignes.join('\n');
  }

  function ecran8HTML() {
    var pistes = ecran2PistesReelles();
    var attirance = pistes.filter(function (p) { return p.source === 'nommee' && p.extrait; })[0];
    var pts = ecran8PointsConseiller();

    return '<div class="bilan-preparer">' +
      ecranLegendePistes(pistes) +
      (attirance
        ? '<div class="cp-info-encart"><strong>&#128278; Ce que vous aviez dit vous attirer</strong><br>' +
          echapperTexte(attirance.nom) + ' : « ' + echapperTexte(attirance.extrait) + ' »' +
          '<span class="preparer-detail" style="display:block;">Rappelé depuis « Je nomme mes pistes ». Non modifiable ici.</span></div>'
        : '') +
      '<div class="cp-section"><h3>Ce qui vous attire, ce qui vous inquiète, ce que vous voulez approfondir</h3>' +
      '<textarea class="form-control form-control-sm" rows="3" data-cp-retenir placeholder="Écrivez librement...">' + echapperTexte(etat.retenirTexte || '') + '</textarea></div>' +
      '<div class="cp-section"><h3>Points à discuter avec mon conseiller</h3>' +
      (pts.length
        ? '<ul>' + pts.map(function (t) { return '<li>' + echapperTexte(t) + '</li>'; }).join('') + '</ul>'
        : '<p class="preparer-detail">Rien d’automatique à lister : préparez vos propres questions ci-dessus.</p>') +
      '</div>' +
      ecran8TableauSourcesHTML() +
      '<div class="cp-section"><h3>&#9875;&#65039; Garder une piste à approfondir</h3>' +
      '<p class="preparer-detail" style="margin-top:0;">Jamais « piste choisie ». Vous pouvez la garder dans Mes Repères, et copier le récapitulatif pour votre rendez-vous.</p>' +
      '<div class="d-flex gap-2 flex-wrap align-items-center">' +
      (typeof reperesBoutonAncre === 'function' && pistes[0]
        ? reperesBoutonAncre({ libelle: 'Piste à approfondir : ' + pistes.map(function (p) { return p.nom; }).join(' / ') })
        : '') +
      '<button type="button" class="btn btn-outline-secondary btn-sm" data-cp-copier-recap>&#128203; Copier le récapitulatif</button>' +
      '</div></div>' +
      '<p class="text-center preparer-detail" style="border-top:1px solid var(--border);padding-top:1rem;margin-top:1.2rem;">APP part de ce que vous apportez, vous aide à prendre du recul, et vous laisse toujours la décision.</p>' +
      '<p class="text-center mt-2"><button type="button" class="btn btn-outline-secondary btn-sm" data-cp-recommencer>Recommencer avec d’autres pistes</button></p>' +
      '</div>';
  }

  function ecran8Brancher() {
    var racine = document.getElementById('contenuEcranComparer');
    if (!racine) { return; }
    var ta = racine.querySelector('[data-cp-retenir]');
    if (ta) { ta.addEventListener('input', function () { etat.retenirTexte = this.value; }); }
    if (typeof reperesBrancherBoutonAncre === 'function') { reperesBrancherBoutonAncre(); }
    var cp = racine.querySelector('[data-cp-copier-recap]');
    if (cp) {
      cp.addEventListener('click', function () {
        _comparerTrack('comparer_recap_copie');
        var txt = ecran8RecapTexte();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(function () { cp.textContent = '✓ Récapitulatif copié'; }, function () {});
        }
      });
    }
    var rc = racine.querySelector('[data-cp-recommencer]');
    if (rc && typeof confirmerAction === 'function') {
      rc.addEventListener('click', function () {
        confirmerAction('Recommencer', 'Repartir de zéro avec d’autres pistes ? Ce qui n’est pas gardé dans Mes Repères sera perdu.', function () {
          comparerReinitialiser();
          ouvrirComparerPistes();
        });
      });
    } else if (rc) {
      rc.addEventListener('click', function () { comparerReinitialiser(); ouvrirComparerPistes(); });
    }
  }

  // Routage logique entre les ecrans de comparaison (3 -> 4/5/6 -> 7).
  function ecranSuivantLogique(e) {
    var f = etat.formeComparaison;
    if (e === 3) { return (f === 'mixte') ? 4 : (f === 'frise') ? 6 : 5; }
    if (e === 4) { return 6; } // aiguillage : angle conseille = dans le temps
    if (e === 5 || e === 6) {
      if (f === 'mixte') {
        var autre = (e === 5) ? 'frise' : 'superposition';
        if (etat.anglesVus.indexOf(autre) < 0) { return (e === 5) ? 6 : 5; }
      }
      return 7;
    }
    return Math.min(8, e + 1);
  }
  function ecranPrecedentLogique(e) {
    var f = etat.formeComparaison;
    if (e === 7) { return (f === 'mixte') ? 4 : (f === 'frise') ? 6 : 5; }
    if (e === 5 || e === 6) { return (f === 'mixte') ? 4 : 3; }
    if (e === 4) { return 3; }
    return Math.max(0, e - 1);
  }

  // ------------------------------------------------------------------
  // Chrome commun + dispatch par ecran
  // ------------------------------------------------------------------
  function contenuEcran(ecran) {
    if (ecran === 0) { return ecran0HTML(); }
    if (ecran === 1) { return ecran0bisHTML(); }
    if (ecran === 2) { return ecran2HTML(); }
    if (ecran === 3) { return ecran3HTML(); }
    if (ecran === 4) { return ecran4HTML(); }
    if (ecran === 5) { return ecran5HTML(); }
    if (ecran === 6) { return ecran6HTML(); }
    if (ecran === 7) { return ecran7HTML(); }
    if (ecran === 8) { return ecran8HTML(); }
    return '';
  }
  function brancherEcran(ecran) {
    if (ecran === 0) { ecran0Brancher(); }
    if (ecran === 1) { ecran0bisBrancher(); }
    if (ecran === 2) { ecran2Brancher(); }
    if (ecran === 3) { ecran3Brancher(); }
    if (ecran === 4) { ecran4Brancher(); }
    if (ecran === 5) { ecran5Brancher(); }
    if (ecran === 6) { ecran6Brancher(); }
    if (ecran === 7) { ecran7Brancher(); }
    if (ecran === 8) { ecran8Brancher(); }
  }
  function ecranPeutContinuer(ecran) {
    if (ecran === 0) { return ecran0PeutContinuer(); }
    if (ecran === 1) { return ecran0bisPeutContinuer(); }
    if (ecran === 2) { return ecran2PeutContinuer(); }
    if (ecran === 6) { return ecran6PeutContinuer(); }
    return ecran < 8;
  }
  function ecranRaisonBlocage(ecran) {
    if (ecran === 0) { return ecran0RaisonBlocage(); }
    if (ecran === 1) { return ecran0bisRaisonBlocage(); }
    if (ecran === 2) { return ecran2RaisonBlocage(); }
    if (ecran === 6) { return ecran6RaisonBlocage(); }
    return '';
  }

  function _majBoutonContinuer() {
    var btn = document.getElementById('btnSuivantNavigation');
    if (!btn) { return; }
    var ok = ecranPeutContinuer(etat.ecran);
    btn.disabled = !ok;
    var raison = ok ? '' : ecranRaisonBlocage(etat.ecran);
    if (raison) { btn.setAttribute('title', raison); } else { btn.removeAttribute('title'); }
  }

  function afficherEcran(ecran) {
    if (typeof ecran !== 'number' || ecran < 0 || ecran > 8) { ecran = etat.ecran || 0; }
    etat.ecran = ecran;
    _comparerEcranCourant = ecran;
    if (ecran > (etat._ecranMax || 0)) {
      etat._ecranMax = ecran;
      _comparerTrack('comparer_ecran_atteint', { ecran: ecran });
    }
    // TACHE (retour Denis 2026-09-20) : "Je nomme mes pistes" (ecran 0)
    // n'alimente etat.pistes (le MEME tableau que le sac global, voir
    // ecran0bisConstruirePistes() plus haut) qu'au moment de passer a
    // l'ecran suivant -- l'icone globale doit refleter ce changement tout
    // de suite, pas seulement a la prochaine navigation reelle (seul
    // moment ou elle etait rafraichie jusqu'ici, voir
    // _comparerMettreAJourIconePanier()). Appelee a CHAQUE changement
    // d'ecran du module : couvre ce cas et tout futur cas similaire.
    _comparerMettreAJourIconePanier();

    var scrollPrecedent = window.scrollY || window.pageYOffset || 0;
    var titre = COMPARER_TITRES_ECRANS[ecran] || 'Comparer mes pistes';
    var navIndex = _comparerRenduEcran ? _comparerNavIndex(ecran) : -1;

    var _cpNoteHtml = (typeof noteRevoirModuleDejaVue === 'function' && !noteRevoirModuleDejaVue() && !_comparerReprisePendante)
      ? '<div class="note-revoir-module" id="noteRevoirModule" style="margin-left:0;">' +
        '<span>Ce bouton vous ramène à la page qui explique ce module. Vous ne perdez rien.</span>' +
        '<button type="button" aria-label="J’ai compris" data-fermer-note-revoir>&#10005;</button></div>'
      : '';
    var _cpBouton = '<div><button type="button" id="btnComparerRevoirPresentation" class="btn-revoir-module"' +
      (_comparerReprisePendante ? ' disabled' : '') + '>' +
      '<i class="bi bi-signpost-split"></i> Revoir la présentation</button></div>' + _cpNoteHtml;
    var _cpEncart = _comparerReprisePendante
      ? htmlEncartRepriseModule({ idContinuer: 'btnComparerRepriseContinuer', idRecommencer: 'btnComparerRepriseRecommencer', pulse: true })
      : '';

    app.innerHTML =
      '<div class="page-catalogue-contenu comparer-pistes-parcours">' +
      // TACHE (retour utilisateur 2026-09-17, coherence inter-modules) :
      // barre d'etapes AVANT le titre (comme co-lettre/prepa-entretien et
      // tous les autres modules routes, voir htmlPageIntroModuleParcours()),
      // et titre a la taille normale (2.8rem, h1 global) -- le style inline
      // font-size:1.5rem le retrecissait de moitie sur CET ecran alors que
      // la page d'introduction du meme module garde le titre normal, deux
      // incoherences en une : ordre inverse ET taille differente.
      // TACHE (retour Denis 2026-09-18, "barre de navigation trop bas") :
      // le correctif du 2026-09-17 avait mis la barre d'etapes avant le
      // TITRE, mais htmlBandeRepriseModule() (bouton "Revoir la
      // presentation") etait reste avant la barre elle-meme -- meme bug que
      // "Un regard sur mon CV" et "Decouvrir mes competences", meme jour.
      // Ordre correct, identique a ATS/Cohérence transversale : barre
      // d'abord, bande ensuite.
      (typeof barreEtapesModule === 'function'
        ? barreEtapesModule(COMPARER_NAV_ETAPES, navIndex)
        : '') +
      htmlBandeRepriseModule(_cpBouton, _cpEncart) +
      '<div class="text-center"><h1>' +
      '<i class="bi bi-signpost-split"></i> ' + titre + '</h1></div>' +
      '<div id="contenuEcranComparer">' + contenuEcran(ecran) + '</div>' +
      '</div>' +
      // Retour Denis 2026-09-30 (C14-b/c) : plus de ligne « Retour / Continuer » dans la page, uniquement la barre du bas commune.
      // « Retour » revient a l'ecran precedent du module (depuis le premier ecran : presentation, comme avant) ; « Continuer » est
      // dans la barre, grise tant que l'ecran n'est pas complet.
      '<div class="barre-navigation-fixe">' +
      (typeof barreNavigation === 'function'
        ? barreNavigation('cv', ecran >= 8 ? null : 'comparer-suite', null, {
            onclickPrecedent: 'comparerBarreRetour()',
            onclickSuivant: 'comparerBarreContinuer()',
            suivantDesactive: !ecranPeutContinuer(ecran),
            suivantDesactiveMessage: ecranRaisonBlocage(ecran) || 'Complétez cet écran pour continuer.'
          })
        : '') +
      '</div>';

    // Arrivee depuis la page de presentation : toujours en haut (sinon la
    // position du bouton, en bas de la presentation, etait conservee).
    var _arriveeComparer = (typeof consommerArriveeDepuisPresentation === 'function') && consommerArriveeDepuisPresentation();
    window.scrollTo(0, _arriveeComparer ? 0 : scrollPrecedent);

    if (typeof appliquerGelModule === 'function') { appliquerGelModule(_comparerReprisePendante); }

    var btnRevoirCp = document.getElementById('btnComparerRevoirPresentation');
    if (btnRevoirCp) { btnRevoirCp.addEventListener('click', comparerRetourVersPresentation); }
    var btnCpReprC = document.getElementById('btnComparerRepriseContinuer');
    if (btnCpReprC) { btnCpReprC.addEventListener('click', comparerRepriseContinuer); }
    var btnCpReprR = document.getElementById('btnComparerRepriseRecommencer');
    if (btnCpReprR) {
      btnCpReprR.addEventListener('click', function () {
        if (typeof confirmerAction !== 'function') { return; }
        confirmerAction(
          'Recommencer « Comparer mes pistes » ?',
          'Vos pistes et la comparaison en cours seront effacées. Vos autres modules, Mes Repères et Mon Carnet ne sont pas touchés.',
          'Recommencer ce module', 'btn-danger',
          function () { comparerReinitialiser(); ouvrirComparerPistes(); if (typeof naviguerVers === 'function') { naviguerVers('comparer-pistes'); } }
        );
      });
    }
    if (typeof armerFinPulseEncartReprise === 'function') { armerFinPulseEncartReprise(); }

    // Les deux actions de la barre du bas (voir comparerBarreRetour / comparerBarreContinuer, plus haut dans ce fichier).
    _comparerActionsBarre.retour = function () {
      // Ecrans qui envoient un texte a un assistant : « Retour » recule d'abord d'une etape de l'envoi (coller la reponse, puis chez l'assistant) avant de quitter l'ecran.
      if (envoiIARetourArriere()) { return; }
      if (etat.ecran <= 0) { comparerRetour(); return; }
      afficherEcran(_ecranPrecedent(etat.ecran));
    };
    {
      _comparerActionsBarre.continuer = function () {
        if (!ecranPeutContinuer(etat.ecran) || etat.ecran >= 8) { return; }
        // En quittant l'ecran 0 bis : on fige la forme de comparaison
        // (routage deterministe, corrigeable en revenant).
        if (etat.ecran === 1) {
          ecran0bisConstruirePistes();
          var formeAvant = etat.formeComparaison;
          etat.formeComparaison = ecran0bisFormeCourante();
          // Suivi 2/3 : quelle forme de comparaison a ete retenue
          // (cote a cote / dans le temps / mixte / renvoi orientation).
          if (etat.formeComparaison && etat.formeComparaison !== formeAvant) {
            _comparerTrack('comparer_forme', { forme: _comparerFormeLisible(etat.formeComparaison) });
          }
        }
        afficherEcran(_ecranSuivant(etat.ecran));
      };
    }

    brancherEcran(ecran);
    _majBoutonContinuer();

    // (Suivi d'usage « prompt copie » : fait par la brique d'envoi, envoiIAPreparerEtEnvoyer.)
    var zoneC = document.getElementById('contenuEcranComparer');

    if (typeof activerChampsStandardises === 'function') {
      if (zoneC) { activerChampsStandardises(zoneC); }
    }
  }

  function _ecranSuivant(ecran) { return ecranSuivantLogique(ecran); }
  function _ecranPrecedent(ecran) { return ecranPrecedentLogique(ecran); }

  _comparerRenduEcran = afficherEcran;
  _comparerEcranCourant = etat.ecran;

  // L'icone panier est visible sur TOUS les ecrans du module (voir
  // _comparerMettreAJourIconePanier) -- rafraichie ici au cas ou le
  // hashchange n'aurait pas encore ete traite.
  _comparerMettreAJourIconePanier();

  afficherEcran(etat.ecran);
}

// ---- Helpers exposes (utilises par le rendu et par des tests unitaires).
function _comparerTerritoireLibelle(dep) {
  if (dep === '24') { return 'Dordogne (24)'; }
  if (dep === '87') { return 'Haute-Vienne (87)'; }
  if (dep === 'ailleurs') { return 'Hors Dordogne et Haute-Vienne'; }
  return null;
}

// Etiquettes possibles d'une piste (ecran 0 bis). Ordre = ordre d'affichage.
var COMPARER_ETIQUETTES = [
  { id: 'metier', libelle: 'métier' },
  { id: 'formation', libelle: 'formation' },
  { id: 'situation', libelle: 'situation' },
  { id: 'frein_ou_etape', libelle: 'frein / étape' },
  { id: 'idee_a_explorer', libelle: 'idée à explorer' }
];
var COMPARER_ETIQUETTES_IDS = COMPARER_ETIQUETTES.map(function (e) { return e.id; });

// Couleurs par defaut d'une piste : un IDENTIFIANT, jamais une valeur
// (docs/CHANTIER §2.3bis). Toujours accompagnees du nom de la piste a
// l'ecran (daltonisme, mode sombre). Modifiables par la personne.
var COMPARER_PALETTE = ['#2563eb', '#16a34a', '#c2410c'];

// Parser TOLERANT du retour du prompt de detection (prompt 0). Extrait le
// premier objet JSON, en tire des pistes {nom, etiquette, extrait} + le
// champ "ce qui ne rentre pas". Ne jette jamais : renvoie { erreur } si
// rien d'exploitable.
// Lecture d'un bloc JSON colle : d'abord la lecture stricte d'avant (comportement inchange), puis, seulement si elle echoue, l'extracteur
// tolerant partage de l'application (antislashs parasites, guillemets courbes, retours a la ligne dans les valeurs...). Retour Denis
// 2026-09-30 (C14-a) : une reponse avec des « \_ » ou « \[ » (copiee depuis un affichage mis en forme) ne pouvait pas etre lue.
function _comparerLireJSON(tranche, texteComplet) {
  try { return JSON.parse(tranche); }
  catch (e) {
    if (typeof extraireBlocJSONDepuisTexte === 'function') {
      var tolerant = extraireBlocJSONDepuisTexte(texteComplet);
      if (tolerant && typeof tolerant === 'object') { return tolerant; }
    }
    throw e;
  }
}

// Etiquettes de sources ajoutees par un assistant a la fin d'une phrase (« ...apres la 3e.  Onisep », « ...France Travail+1 »). Retirees
// seulement apres un point final suivi d'au moins deux espaces, jamais au milieu d'un texte.
function comparerNettoyerEtiquetteSource(valeur) {
  if (typeof valeur !== 'string') { return valeur; }
  return valeur.replace(/([.!?…)])\s{2,}[A-ZÀ-Ý][A-Za-zÀ-ÿ0-9 .'’\-]{1,40}(?:\+\d+)?\s*$/, '$1').replace(/\s+$/, '');
}

function comparerParserDetection(brut) {
  var texte = String(brut == null ? '' : brut).trim();
  if (!texte) { return { erreur: 'Rien n’a été collé.' }; }
  var debut = texte.indexOf('{');
  var fin = texte.lastIndexOf('}');
  if (debut < 0 || fin <= debut) {
    return { erreur: 'La réponse ne contient pas de texte au format attendu (accolades).' };
  }
  var obj;
  try { obj = _comparerLireJSON(texte.slice(debut, fin + 1), texte); }
  catch (e) { return { erreur: 'La réponse n’a pas pu être lue. Recopiez-la en entier, ou nommez vos pistes vous-même.' }; }
  var pistesBrutes = Array.isArray(obj && obj.pistes) ? obj.pistes : [];
  var pistes = pistesBrutes.map(function (p) {
    p = p || {};
    var et = String(p.etiquette || '').toLowerCase().replace(/[^a-z_]/g, '');
    return {
      nom: String(p.nom || '').trim(),
      etiquette: (COMPARER_ETIQUETTES_IDS.indexOf(et) >= 0) ? et : null,
      extrait: String(p.extrait || '').trim()
    };
  }).filter(function (p) { return p.nom; });
  return {
    pistes: pistes,
    ceQuiNeRentrePas: String((obj && obj.ce_qui_ne_rentre_pas) || '').trim()
  };
}

// Fragments de domaines officiels acceptes (garde-fou de fiabilite du
// retour de collecte). Meme esprit que la liste blanche du repertoire des
// freins (LECONS 9.16) : hors de cette liste = a signaler.
var COMPARER_SOURCES_OFFICIELLES = [
  'service-public.fr', 'francetravail.fr', 'pole-emploi.fr', 'travail-emploi.gouv.fr',
  'moncompteformation.gouv.fr', 'francecompetences.fr', 'france-vae.gouv.fr',
  'legifrance.gouv.fr', 'mesdroitssociaux.gouv.fr', 'onisep.fr', 'insee.fr',
  'dares.travail-emploi.gouv.fr', 'cap-metiers.fr', 'cap-metiers.pro',
  'nouvelle-aquitaine.fr', 'transitionspro-na.fr', 'transitionspro',
  'bpifrance-creation.fr', 'urssaf.fr', 'caf.fr', 'ameli.fr', 'actionlogement.fr',
  'eures.europa.eu', 'agefiph.fr', 'fiphfp.fr', 'monparcourshandicap.gouv.fr',
  'capemploi.fr', 'capemploi-', 'mdph', 'dordogne.fr', 'gesat.org', 'unea.fr',
  'labonneformation.', 'labonneboite.', 'data.francetravail.fr', 'dataemploi.francetravail.fr',
  '.gouv.fr'
];

// Dimensions superposables sur une reglette (une echelle simple). Les
// autres restent en texte dans les fiches.
var COMPARER_DIMENSIONS_REGLETTE = [
  { element: 'duree_formation', label: 'Durée de la formation', unite: 'mois',
    question: 'Est-ce que cet écart de durée change quelque chose pour vous (revenus, organisation, patience) ?' },
  { element: 'periodes_entreprise', label: 'Périodes en entreprise', unite: 'semaines',
    question: 'Ces périodes en entreprise sont-elles compatibles avec votre situation ?' },
  { element: 'cout_total', label: 'Coût total', unite: '€',
    question: 'Le coût vous distingue-t-il les pistes, ou pas ?' },
  { element: 'reste_a_charge', label: 'Reste à charge pour vous', unite: '€',
    question: 'Ce reste à charge est-il tenable pour vous ?' },
  { element: 'remuneration_embauche', label: 'Rémunération à l’embauche', unite: '€',
    question: 'Une rémunération plus élevée n’est pas « mieux » : qu’est-ce qui pèse le plus pour vous ?' },
  // Retour Denis 2026-09-30 (C16) : d'autres lignes a comparer, au choix de la personne (jamais affichees d'office). Les informations sont deja
  // collectees : aucun nouvel appel a l'assistant.
  { element: 'remuneration_apres_qq_annees', label: 'Rémunération après quelques années', unite: '€', optionnelle: true,
    question: 'Ce que vous pourriez gagner plus tard change-t-il votre regard sur le départ ?' },
  { element: 'tension_recrutement', label: 'Besoins de recrutement', unite: '', type: 'texte', optionnelle: true,
    question: 'Est-ce que l’état du marché pèse dans votre choix ?' },
  { element: 'financeurs', label: 'Financeurs possibles', unite: '', type: 'texte', optionnelle: true,
    question: 'Y a-t-il un financement qui rend une piste plus accessible que l’autre ?' },
  { element: 'lieux', label: 'Où c’est proposé', unite: '', type: 'texte', optionnelle: true,
    question: 'Le lieu est-il compatible avec votre organisation (trajet, logement) ?' },
  { element: 'conditions_dispositif', label: 'Conditions du dispositif', unite: '', type: 'texte', optionnelle: true,
    question: 'Remplissez-vous ces conditions aujourd’hui ?' },
  { element: 'revenu_remplacement', label: 'Revenu pendant la transition', unite: '', type: 'texte', optionnelle: true,
    question: 'Pourriez-vous tenir financièrement pendant cette période ?' }
];

// Extrait un intervalle numerique d'une valeur texte ("9", "9 a 24",
// "1 450 à 1 700 €", "environ 9 mois"). Renvoie { min, max } ou null.
function comparerExtraireNombres(valeur) {
  if (valeur === null || valeur === undefined) { return null; }
  var s = String(valeur).replace(/ /g, ' ');
  // Recolle les milliers ecrits "1 450" -> "1450".
  s = s.replace(/(\d)\s+(\d{3}\b)/g, '$1$2');
  var nums = (s.match(/\d+(?:[.,]\d+)?/g) || []).map(function (x) { return parseFloat(x.replace(',', '.')); });
  if (!nums.length) { return null; }
  var min = Math.min.apply(null, nums);
  var max = Math.max.apply(null, nums);
  return { min: min, max: max };
}

// Libelle lisible d'un `element` du bloc "a_verifier".
var COMPARER_ELEMENT_LABELS = {
  duree_formation: 'Durée de la formation',
  periodes_entreprise: 'Périodes en entreprise',
  cout_total: 'Coût total',
  reste_a_charge: 'Reste à charge pour vous',
  financeurs: 'Financeurs possibles',
  lieux: 'Où c’est proposé',
  lieux_en_dordogne: 'Où c’est proposé',
  remuneration_embauche: 'Rémunération à l’embauche',
  remuneration_apres_qq_annees: 'Rémunération après quelques années',
  tension_recrutement: 'Besoins de recrutement',
  conditions_dispositif: 'Conditions du dispositif',
  revenu_remplacement: 'Revenu pendant la transition',
  aides_agefiph: 'Aides AGEFIPH',
  orientation_mdph: 'Orientation MDPH'
};

// Valeur + unite d'une ligne "a_verifier", en texte lisible.
function comparerFormaterValeur(ligne) {
  if (ligne.valeur === null || ligne.valeur === undefined || ligne.valeur === '') { return 'non trouvé'; }
  var v = String(ligne.valeur);
  switch (ligne.unite) {
    case 'mois': return v + (/\bmois\b/.test(v) ? '' : ' mois');
    case 'semaines': return v + (/semaine/.test(v) ? '' : ' semaines');
    case 'euros': return v + (/€|euro/.test(v) ? '' : ' €');
    case 'euros_net_mensuel': return v + (/€|euro/.test(v) ? '' : ' €') + ' net par mois';
    case 'euros_brut_mensuel': return v + (/€|euro/.test(v) ? '' : ' €') + ' brut par mois';
    default: return v;
  }
}

// Couleur de texte lisible (#fff ou #1b2430) sur un fond hexadecimal.
function comparerTexteSurCouleur(hex) {
  var m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) { return '#ffffff'; }
  var n = parseInt(m[1], 16);
  var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  var lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#1b2430' : '#ffffff';
}

// Apparie les dossiers de la collecte aux pistes de la personne (le nom
// peut avoir ete legerement reformule par l'assistant). Renvoie une Map
// { id de piste -> dossier | null }.
function comparerApparierDossiers(pistes, dossiers) {
  var norm = (typeof normaliserTexte === 'function') ? normaliserTexte : function (s) { return String(s).toLowerCase().trim(); };
  var res = {};
  var libres = (dossiers || []).slice();
  (pistes || []).forEach(function (p) {
    var cible = norm(p.nom);
    var idx = -1;
    for (var i = 0; i < libres.length; i++) {
      var dn = norm(libres[i].nom);
      if (dn === cible || dn.indexOf(cible) >= 0 || cible.indexOf(dn) >= 0) { idx = i; break; }
    }
    res[p.id] = (idx >= 0) ? libres.splice(idx, 1)[0] : null;
  });
  return res;
}

// Parser TOLERANT du retour du prompt de collecte. Renvoie
// { territoire, pistes:[{nom, durable, a_verifier:[...], incertitudes:[...]}], cloture }
// ou { erreur } si rien d'exploitable.
function comparerParserCollecte(brut) {
  var texte = String(brut == null ? '' : brut).trim();
  if (!texte) { return { erreur: 'Rien n’a été collé.' }; }
  var debut = texte.indexOf('{');
  var fin = texte.lastIndexOf('}');
  if (debut < 0 || fin <= debut) { return { erreur: 'La réponse ne contient pas de texte au format attendu.' }; }
  var obj;
  try { obj = _comparerLireJSON(texte.slice(debut, fin + 1), texte); }
  catch (e) { return { erreur: 'La réponse n’a pas pu être lue. Recopiez-la en entier depuis l’assistant.' }; }
  var pistesBrutes = Array.isArray(obj && obj.pistes) ? obj.pistes : [];
  if (!pistesBrutes.length) { return { erreur: 'La réponse ne contient aucune piste. Vérifiez que vous avez bien tout copié.' }; }
  var pistes = pistesBrutes.map(function (p) {
    p = p || {};
    var av = Array.isArray(p.a_verifier) ? p.a_verifier : [];
    return {
      nom: String(p.nom || '').trim(),
      durable: (function (d) {
        var propre = {};
        Object.keys(d).forEach(function (k) { propre[k] = comparerNettoyerEtiquetteSource(d[k]); });
        return propre;
      })((p.durable && typeof p.durable === 'object') ? p.durable : {}),
      a_verifier: av.map(function (x) {
        x = x || {};
        var src = (x.source && typeof x.source === 'object') ? x.source : { nom: x.source || null, url: null };
        return {
          element: String(x.element || '').trim(),
          valeur: (x.valeur === null || x.valeur === undefined || x.valeur === 'null') ? null : comparerNettoyerEtiquetteSource(String(x.valeur).trim()),
          unite: x.unite || null,
          portee: x.portee || null,
          source: { nom: src.nom || null, url: src.url || null },
          date_info: x.date_info || null
        };
      }),
      incertitudes: Array.isArray(p.incertitudes) ? p.incertitudes.map(function (u) { return comparerNettoyerEtiquetteSource(String(u)); }) : []
    };
  }).filter(function (p) { return p.nom; });
  return {
    territoire: String((obj && obj.territoire) || '').trim(),
    pistes: pistes,
    cloture: String((obj && obj.cloture) || '').trim()
  };
}

// Parser TOLERANT du retour du prompt "aller plus loin" (prompt 4).
// Renvoie { questions:[...] } ou { erreur }.
function comparerParserAllerPlusLoin(brut) {
  var texte = String(brut == null ? '' : brut).trim();
  if (!texte) { return { erreur: 'Rien n’a été collé.' }; }
  var a = texte.indexOf('{'), b = texte.lastIndexOf('}');
  var questions = [];
  if (a >= 0 && b > a) {
    try {
      var obj = _comparerLireJSON(texte.slice(a, b + 1), texte);
      if (obj && Array.isArray(obj.questions)) {
        questions = obj.questions.map(function (q) { return String(q || '').trim(); }).filter(Boolean);
      }
    } catch (e) { /* on tente le repli ligne a ligne */ }
  }
  if (!questions.length) {
    // Repli : une question par ligne commencant par un tiret ou un chiffre.
    questions = texte.split(/\r?\n/).map(function (l) {
      return l.replace(/^\s*(?:[-*]|\d+[.)])\s*/, '').trim();
    }).filter(function (l) { return l.length > 8 && /\?$/.test(l); });
  }
  if (!questions.length) { return { erreur: 'Aucune question ouverte trouvée dans la réponse.' }; }
  return { questions: questions.slice(0, 8) };
}

// Parser TOLERANT du retour du prompt "dans le temps" (prompt 3).
// Renvoie { colonnes, conditions_a_reunir, impact_sur_les_droits,
// questions_conseiller, incertitudes } ou { erreur }.
function comparerParserFrise(brut) {
  var texte = String(brut == null ? '' : brut).trim();
  if (!texte) { return { erreur: 'Rien n’a été collé.' }; }
  var a = texte.indexOf('{'), b = texte.lastIndexOf('}');
  if (a < 0 || b <= a) { return { erreur: 'La réponse ne contient pas de texte au format attendu.' }; }
  var obj;
  try { obj = _comparerLireJSON(texte.slice(a, b + 1), texte); }
  catch (e) { return { erreur: 'La réponse n’a pas pu être lue. Recopiez-la en entier depuis l’assistant.' }; }
  var colonnes = Array.isArray(obj && obj.colonnes) ? obj.colonnes : [];
  if (!colonnes.length) { return { erreur: 'La réponse ne contient aucune colonne.' }; }
  function txt(x) { return String(x == null ? '' : x).trim(); }
  function srcArr(arr, cleCond) {
    return (Array.isArray(arr) ? arr : []).map(function (x) {
      x = x || {};
      var src = (x.source && typeof x.source === 'object') ? x.source : { nom: x.source || null, url: null };
      return {
        libelle: txt(x[cleCond] || x.condition || x.droit || x.effet),
        regle: txt(x.regle_actuelle || x.effet),
        source: { nom: src.nom || null, url: src.url || null },
        date_info: x.date_info || null
      };
    }).filter(function (x) { return x.libelle; });
  }
  return {
    colonnes: colonnes.map(function (c) {
      c = c || {};
      return {
        nom: txt(c.nom), role: (c.role === 'repere') ? 'repere' : 'depart',
        aujourdhui: txt(c.aujourdhui), pendant: txt(c.pendant), apres: txt(c.apres)
      };
    }).filter(function (c) { return c.nom; }),
    conditions_a_reunir: srcArr(obj.conditions_a_reunir, 'condition'),
    impact_sur_les_droits: srcArr(obj.impact_sur_les_droits, 'droit'),
    questions_conseiller: (Array.isArray(obj.questions_conseiller) ? obj.questions_conseiller : []).map(txt).filter(Boolean),
    incertitudes: (Array.isArray(obj.incertitudes) ? obj.incertitudes : []).map(txt).filter(Boolean)
  };
}

// Garde-fou de fiabilite : la reponse a-t-elle l'air d'avoir ete cherchee
// sur internet ? Renvoie { fiable, alertes:[...] }.
function comparerGardeFouCollecte(parsed, dateDuJour) {
  var alertes = [];
  var jour = dateDuJour || new Date().toISOString().slice(0, 10); // AAAA-MM-JJ
  var jourMois = jour.slice(0, 7); // AAAA-MM
  var toutesLignes = [];
  (parsed && parsed.pistes || []).forEach(function (p) {
    (p.a_verifier || []).forEach(function (l) { toutesLignes.push(l); });
  });

  var avecUrl = toutesLignes.filter(function (l) { return l.source && l.source.url; });
  if (toutesLignes.length && !avecUrl.length) {
    alertes.push('Aucun lien de source. La réponse n’a peut-être pas été cherchée sur internet.');
  }

  var datesRenseignees = toutesLignes
    .map(function (l) { return l.date_info; })
    .filter(function (d) { return d && /^\d{4}(-\d{2}){0,2}$/.test(String(d)); });
  if (datesRenseignees.length && datesRenseignees.every(function (d) {
    return d === jour || d === jourMois;
  })) {
    alertes.push('Toutes les dates sont celles d’aujourd’hui : l’assistant a peut-être répondu de mémoire.');
  }

  var horsListe = avecUrl.filter(function (l) {
    var u = String(l.source.url).toLowerCase();
    return !COMPARER_SOURCES_OFFICIELLES.some(function (frag) { return u.indexOf(frag) >= 0; });
  });
  if (horsListe.length) {
    alertes.push('Une source au moins ne fait pas partie de la liste officielle (' +
      horsListe.slice(0, 2).map(function (l) { return l.source.nom || l.source.url; }).join(', ') + ').');
  }

  return { fiable: alertes.length === 0, alertes: alertes };
}

// Fait correspondre le nom d'une piste "frein / etape" a un code du
// repertoire data/freins.js (via le champ `synonymes`, puis le `titre`).
// Renvoie le code, ou null si rien ne correspond.
function comparerNomVersCodeFrein(nom) {
  if (typeof FREINS_REPERTOIRE === 'undefined' || !FREINS_REPERTOIRE) { return null; }
  var norm = (typeof normaliserTexte === 'function')
    ? normaliserTexte
    : function (s) { return String(s).toLowerCase().trim(); };
  var cible = norm(nom || '');
  if (!cible) { return null; }
  var codes = Object.keys(FREINS_REPERTOIRE);
  for (var i = 0; i < codes.length; i++) {
    var f = FREINS_REPERTOIRE[codes[i]];
    var termes = (f.synonymes || []).concat(f.titre ? [f.titre] : []);
    for (var j = 0; j < termes.length; j++) {
      var t = norm(termes[j]);
      if (t && (cible.indexOf(t) >= 0 || t.indexOf(cible) >= 0)) { return codes[i]; }
    }
  }
  return null;
}

// ---- Bloc B : precisions selon la situation (ecran 0 bis). 11 series, une
// seule affichee, choisie par le CODE (routage deterministe, jamais un
// prompt). 3 questions maximum, tout facultatif, "Je ne sais pas" valide.
var _CP_NSP = 'Je ne sais pas';
function _cpJetons(id, texte, options) {
  return { id: id, texte: texte, type: 'jetons', options: options.concat([_CP_NSP]) };
}
function _cpTexte(id, texte) { return { id: id, texte: texte, type: 'texte' }; }

var COMPARER_BLOC_B = {
  B1: {
    titre: 'En emploi : rester, ou vous former / vous reconvertir',
    questions: [
      _cpJetons('anciennete', 'Depuis combien de temps dans cette entreprise ?', ['Moins d’un an', '1 à 3 ans', '3 ans et plus']),
      _cpJetons('contrat', 'Votre contrat', ['CDI', 'CDD', 'Intérim']),
      _cpJetons('metier_en_tete', 'Un métier précis en tête, ou pas encore ?', ['Un métier précis', 'Pas encore'])
    ]
  },
  B2: {
    titre: 'En emploi : rester, rupture conventionnelle, démission',
    questions: [
      _cpJetons('parle_employeur', 'Pouvez-vous en parler avec votre employeur ?', ['Oui', 'Pas encore', 'Non']),
      _cpJetons('droit_chomage', 'Auriez-vous droit au chômage en partant ?', ['Oui', 'Non', 'À vérifier']),
      _cpJetons('projet_derriere', 'Un projet derrière, ou un départ « pour partir » ?', ['Un projet', 'Pour partir'])
    ]
  },
  B3: {
    titre: 'Sans emploi : reprendre un emploi ou vous former',
    questions: [
      _cpJetons('inscrit_ft', 'Êtes-vous inscrit à France Travail ?', ['Oui', 'Non']),
      _cpJetons('duree_sans_emploi', 'Depuis combien de temps sans emploi ?', ['Moins de 6 mois', '6 mois à 1 an', 'Plus d’un an']),
      _cpJetons('metier_en_tete', 'Un métier précis en tête ?', ['Oui', 'Pas encore'])
    ]
  },
  B4: {
    titre: 'Sans emploi : reprendre vite, ou attendre le bon poste',
    questions: [
      _cpJetons('droits_are', 'Jusqu’à quand vos droits (ARE) courent-ils ?', ['Encore longtemps', 'Bientôt la fin', 'À vérifier']),
      _cpTexte('charges', 'Des charges qui rendent l’attente difficile ? (facultatif)'),
      _cpJetons('poste_realiste', 'Le « bon poste » est-il réaliste à court terme près de chez vous ?', ['Plutôt oui', 'Pas sûr', 'Plutôt non'])
    ]
  },
  B5: {
    titre: 'Se former : quelle voie',
    questions: [
      _cpJetons('mobilite', 'Pouvez-vous être mobile (permis, transport, hébergement) ?', ['Oui', 'En partie', 'Non']),
      _cpJetons('employeur_alternance', 'Un employeur prêt à vous prendre en alternance ?', ['Oui', 'Non', 'Je cherche']),
      _cpJetons('duree_revenu_reduit', 'Combien de temps avec un revenu réduit ?', ['Quelques mois', 'Environ 1 an', '2 ans et plus'])
    ]
  },
  B6: {
    titre: 'Salariat ou indépendance',
    questions: [
      _cpJetons('idee_activite', 'Une idée d’activité précise ?', ['Oui', 'Pas encore']),
      _cpJetons('are', 'Percevez-vous l’ARE ?', ['Oui', 'Non']),
      _cpTexte('filet_securite', 'Un filet de sécurité pour les premiers mois ? (facultatif)')
    ]
  },
  B8: {
    titre: 'Santé, usure, inaptitude',
    questions: [
      _cpJetons('arret_restriction', 'Un arrêt long, une restriction, une inaptitude prononcée ?', ['Oui', 'Non']),
      _cpJetons('medecine_travail', 'Avez-vous vu la médecine du travail ?', ['Oui', 'Pas encore']),
      _cpJetons('mi_temps', 'Un mi-temps thérapeutique serait-il possible ?', ['Peut-être', 'Non', 'À confirmer avec le médecin'])
    ]
  },
  B9: {
    titre: 'Handicap : votre accompagnement',
    questions: [
      _cpJetons('milieu', 'Milieu ordinaire, ou vous vous interrogez sur le milieu protégé / adapté ?', ['Milieu ordinaire', 'Je m’interroge']),
      _cpTexte('amenagement', 'Un besoin d’aménagement identifié ? (facultatif)'),
      _cpJetons('suivi', 'Êtes-vous suivi par Cap emploi, la MDPH, un autre acteur ?', ['Oui', 'Non', 'En cours'])
    ]
  },
  B10: {
    titre: 'Mobilité, projet de vie',
    questions: [
      _cpJetons('demenager', 'Prêt à déménager ?', ['Oui', 'Sous conditions', 'Non']),
      _cpTexte('contrainte_familiale', 'Une contrainte familiale (conjoint, enfants, proche aidé) ? (facultatif)'),
      _cpJetons('ailleurs_justifie', 'À vos yeux, « ailleurs » justifie-t-il le changement ?', ['Oui', 'Pas sûr', 'Non'])
    ]
  },
  B11: {
    titre: 'Vous ne savez pas encore par où commencer',
    questions: [
      _cpTexte('idees_vagues', 'Une ou deux idées de métier ou de secteur, même vagues ? (facultatif)'),
      _cpJetons('bouger_ou_reflechir', 'D’abord bouger (travailler, un stage) ou d’abord réfléchir (bilan, CEP) ?', ['Bouger', 'Réfléchir']),
      _cpJetons('accompagne', 'Êtes-vous accompagné aujourd’hui ?', ['Oui', 'Non'])
    ]
  }
};

// Choisit la serie du bloc B a poser. Deterministe.
function comparerRouterBlocB(etat) {
  etat = etat || {};
  var pistes = (etat.pistes || []).slice(0, 3);
  if (comparerRouterForme(pistes, etat.correctionAngle) === 'orientation-first') { return 'B11'; }
  if (etat.handicap === 'rqth' || etat.handicap === 'besoin') { return 'B9'; }
  var norm = (typeof normaliserTexte === 'function') ? normaliserTexte : function (s) { return String(s).toLowerCase(); };
  var nomsDepart = pistes.map(function (p) { return norm(p.nom || ''); }).join(' ');
  switch (etat.situation) {
    case 'emploi':
      return /demiss|rupture|quitter mon poste|quitter l emploi/.test(nomsDepart) ? 'B2' : 'B1';
    case 'sans-emploi':
      return /attendre le bon|le bon poste|n importe quel/.test(nomsDepart) ? 'B4' : 'B3';
    case 'formation': return 'B5';
    case 'independant': return 'B6';
    case 'arret-sante': return 'B8';
    case 'foyer': return 'B10';
    default: return 'B1';
  }
}

// Routage DETERMINISTE de la forme de comparaison (jamais un prompt).
// pistes : [{ nom, etiquette }]. correctionAngle : 'auto' | 'tout-temps' |
// 'dabord-metiers'. Renvoie 'superposition' | 'frise' | 'mixte' |
// 'orientation-first'.
function comparerRouterForme(pistes, correctionAngle) {
  var reelles = (pistes || []).filter(function (p) {
    return p && p.nom && (p.etiquette === 'metier' || p.etiquette === 'formation' || p.etiquette === 'situation');
  });
  if (reelles.length < 2) { return 'orientation-first'; }
  var metierFormation = reelles.filter(function (p) { return p.etiquette === 'metier' || p.etiquette === 'formation'; });
  var situations = reelles.filter(function (p) { return p.etiquette === 'situation'; });

  var base;
  if (situations.length === 0) { base = 'superposition'; }
  else if (metierFormation.length >= 2) { base = 'mixte'; }
  else { base = 'frise'; }

  // Corrections demandees par la personne a l'ecran 0 bis.
  if (correctionAngle === 'tout-temps') { return 'frise'; }
  if (correctionAngle === 'dabord-metiers' && metierFormation.length >= 2) { return 'superposition'; }
  // Retour Denis 2026-09-30 : « Les deux angles, l'un apres l'autre » = l'enchainement deja prevu pour le cas mixte, propose a toute personne
  // qui a au moins deux metiers ou formations a comparer (sans prompt de plus).
  if (correctionAngle === 'les-deux' && metierFormation.length >= 2) { return 'mixte'; }
  return base;
}
// Petit echappement pour le contenu d'un <textarea> (pas d'attribut).
function echapperTexte(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Exposition Node/navigateur.
if (typeof window !== 'undefined') {
  window.pageComparerPistes = pageComparerPistes;
  window.ouvrirComparerPistes = ouvrirComparerPistes;
  window.comparerRetour = comparerRetour;
  window.comparerRetourVersPresentation = comparerRetourVersPresentation;
  window.comparerReinitialiser = comparerReinitialiser;
  window.comparerPistesExporterEtatPourSauvegarde = comparerPistesExporterEtatPourSauvegarde;
  window.comparerPistesRestaurerEtatDepuisSauvegarde = comparerPistesRestaurerEtatDepuisSauvegarde;
  // Panier de comparaison (point d'entree transversal).
  window.comparerBoutonPanier = comparerBoutonPanier;
  window.comparerPanierAjouter = comparerPanierAjouter;
  window.comparerPanierRetirer = comparerPanierRetirer;
  window.comparerPanierListe = comparerPanierListe;
  window.comparerPanierContient = comparerPanierContient;
  window.comparerPanierVider = comparerPanierVider;
  window.comparerApresNavigation = comparerApresNavigation;
  comparerInstallerHandlerPanier();
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    COMPARER_NAV_ETAPES: COMPARER_NAV_ETAPES,
    COMPARER_SITUATIONS: COMPARER_SITUATIONS,
    COMPARER_ETIQUETTES: COMPARER_ETIQUETTES,
    COMPARER_PALETTE: COMPARER_PALETTE,
    COMPARER_BLOC_B: COMPARER_BLOC_B,
    _comparerNavIndex: _comparerNavIndex,
    _comparerTerritoireLibelle: _comparerTerritoireLibelle,
    comparerPanierAjouter: comparerPanierAjouter,
    comparerPanierRetirer: comparerPanierRetirer,
    comparerPanierContient: comparerPanierContient,
    comparerPanierListe: comparerPanierListe,
    comparerPanierVider: comparerPanierVider,
    comparerParserDetection: comparerParserDetection,
    comparerNettoyerEtiquetteSource: comparerNettoyerEtiquetteSource,
    comparerParserCollecte: comparerParserCollecte,
    comparerParserFrise: comparerParserFrise,
    comparerParserAllerPlusLoin: comparerParserAllerPlusLoin,
    comparerGardeFouCollecte: comparerGardeFouCollecte,
    comparerFormaterValeur: comparerFormaterValeur,
    comparerTexteSurCouleur: comparerTexteSurCouleur,
    comparerApparierDossiers: comparerApparierDossiers,
    comparerExtraireNombres: comparerExtraireNombres,
    COMPARER_DIMENSIONS_REGLETTE: COMPARER_DIMENSIONS_REGLETTE,
    comparerRouterForme: comparerRouterForme,
    comparerRouterBlocB: comparerRouterBlocB,
    comparerNomVersCodeFrein: comparerNomVersCodeFrein,
    comparerDateCourte: comparerDateCourte,
    echapperTexte: echapperTexte
  };
}
