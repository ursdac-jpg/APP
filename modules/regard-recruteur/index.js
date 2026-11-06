/* ============================================================
   modules/regard-recruteur/index.js
   ------------------------------------------------------------
   Module « Un regard sur mon CV » : une lecture de CV comme un recruteur peut
   la voir. UNIQUEMENT DU CONSEIL, ne modifie jamais le CV (decision Denis
   2026-09-03, cl`ture option A).

   Maquette de reference (figee) :
     docs/MAQUETTE_REGARD_RECRUTEUR_PARCOURS_2026-09-03.html
   Schema de sortie (fige) :
     docs/CHANTIER_REGARD_RECRUTEUR_SCHEMA_SORTIE_2026-09-03.md
   Prompt : prompts/regard-recruteur.md

   Meme patron que « Comparer mes pistes » / « A partir de mon recit » :
   PAGE routee (jamais une fenetre modale). L'etat de la session vit dans
   la closure de ouvrirRegardRecruteur() ; pageRegardRecruteur() (route
   'regard-recruteur', js/app.js) redessine l'ecran courant, ou renvoie a
   la presentation du module (route 'regard-recruteur-intro') si aucune
   session n'est en cours.

   Famille 2 (depot d'un document + passage assistant) : bouton « Revoir la
   presentation » sur tous les ecrans de travail, encart « Continuer /
   Recommencer » + gel a la reprise (LANGAGE_VISUEL_COMMUN section 5bis).

   Briques partagees reutilisees telles quelles (jamais recopiees) :
   - barreEtapesModule, barreNavigation, htmlBandeRepriseModule,
     htmlEncartRepriseModule, appliquerGelModule, armerFinPulseEncartReprise,
     noteRevoirModuleDejaVue (js/app.js)
   - htmlChoixAssistantBilanCorps, ASSISTANTS_IA, ETAPES_DETAIL_CHOIX_IA (js/app.js)
   - ouvrirFenetreAssistantIA + recopierTexteAssistantPuisOuvrir (js/app.js)
   - htmlBanniereTransitionIA + _etatTransitionIA + _intervalleDecompteIA (js/app.js)
   - htmlCollageUniquePage / brancherCollageUniquePage (js/app.js)
   - bilanCorpsCiblageOffreHTML / bilanCablerCiblageOffre / bilanLireCiblageOffre (data/metiers.js)
   - htmlVerificationDocument / cablerVerificationDocument (data/metiers.js, mode texte)
   - reperesBoutonAncre / reperesBrancherBoutonAncre (modules/reperes/index.js)
   - confirmerAction, echapperAttribut, copierTexteVersPressePapier,
     trackEvenement, htmlDeclencheurDemoVideo (js/app.js)

   Le contenu metier (interpretation de la reponse, prompt) est dans deux
   fichiers autonomes, deja committes et testes :
     modules/regard-recruteur/rapportResponseParser.js
     modules/regard-recruteur/promptBuilder.js
   ============================================================ */

// Suivi d'usage (Umami) : jamais de contenu personnel, seulement des
// compteurs et des libelles d'etape. Silencieux si absent.
function _rrTrack(nom, props) {
  if (typeof trackEvenement === 'function') {
    try { trackEvenement(nom, props || undefined); } catch (e) { /* jamais bloquant */ }
  }
}

// Echappement du contenu d'un <textarea> (pas d'attribut).
function _rrEchapTexte(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function _rrEchapAttr(s) {
  return (typeof echapperAttribut === 'function')
    ? echapperAttribut(s)
    : String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 4 pastilles (famille 2, depot + assistant, PAS d'etape de correction).
var RR_ETAPES = [
  { label: 'Préparer', icone: '&#128221;' },
  { label: 'Assistant', icone: '&#128228;&#65039;' },
  { label: 'Résultat', icone: '&#128196;' },
  { label: 'Terminé', icone: '&#9989;' }
];

// Toutes les vues du parcours. 'masquer' est un detour de 'preparer'
// (meme etape) ; 'coller' / 'erreur-lecture' partagent l'etape
// « Assistant » avec 'choix-assistant'. L'ancienne vue 'chez' n'existe plus (decompte et
// apercu de la fenetre sont sur 'coller', 2026-10-28) : une session reprise dessus va sur 'coller'.
var RR_VUES = ['preparer', 'masquer', 'choix-assistant', 'coller', 'erreur-lecture', 'regard', 'fiche'];

function _rrEtapeIndex(vue) {
  if (vue === 'preparer' || vue === 'masquer') { return 0; }
  if (vue === 'choix-assistant' || vue === 'coller' || vue === 'erreur-lecture') { return 1; }
  if (vue === 'regard') { return 2; }
  if (vue === 'fiche') { return 3; }
  return -1;
}

var RR_TITRES = {
  'preparer': 'Préparer',
  'masquer': 'Masquer ce qui est personnel',
  'choix-assistant': 'Choisir l’assistant',
  'coller': 'De retour : coller la réponse',
  'erreur-lecture': 'On n’a pas réussi à lire cette réponse',
  'regard': 'Ce qu’on voit sur votre CV',
  'fiche': 'Votre fiche de préparation'
};

// Retour (bouton « Retour » de chaque vue) -> vue precedente, ou null =
// retour vers la presentation du module.
var RR_VUE_RETOUR = {
  'preparer': null,
  'masquer': 'preparer',
  'choix-assistant': 'preparer',
  'coller': 'choix-assistant',
  'erreur-lecture': 'coller',
  'regard': 'coller',
  'fiche': 'regard'
};

// 5 questions generales FIXES, ancrees dans le code (maquette Q1bis,
// bloc 1). Toujours affichees, pertinentes quel que soit le CV.
var RR_QUESTIONS_GENERALES = [
  {
    q: 'Parlez-moi de vos défauts.',
    cherche: 'Pas la liste de vos défauts. Il regarde si vous savez vous connaître, et si vous avez trouvé des façons de faire avec.',
    repondre: 'Choisir un point réel, sans gravité pour le poste, et dire ce que vous mettez en place pour le gérer.'
  },
  {
    q: 'Pourquoi vous, et pas quelqu’un d’autre ?',
    cherche: 'Si vous avez compris le poste, et ce que vous apportez de concret.',
    repondre: 'Deux ou trois éléments de votre parcours qui répondent directement à ce que l’offre demande.'
  },
  {
    q: 'Parlez-moi de l’expérience qui vous a le plus marqué.',
    cherche: 'Ce qui compte pour vous dans le travail, et votre façon de raconter une situation concrète.',
    repondre: 'Une situation précise : le contexte, ce que vous avez fait, ce que ça a donné, ce que vous en gardez.'
  },
  {
    q: 'Avez-vous déjà géré une situation de tension ou de conflit ?',
    cherche: 'Votre sang-froid, votre façon d’écouter, et si vous cherchez une solution plutôt qu’un coupable.',
    repondre: 'Un exemple réel et factuel. Si vous n’en avez pas vécu, le dire, et expliquer comment vous vous y prendriez.'
  },
  {
    q: 'Quelles sont vos qualités ?',
    cherche: 'Des qualités utiles pour CE poste, et si vous pouvez les illustrer. Sur cette question, un recruteur regarde parfois votre CV pour voir si vous récitez ce qui y est écrit : mieux vaut un exemple vécu que la liste de votre rubrique « qualités ».',
    repondre: 'Deux ou trois qualités, chacune avec un exemple court tiré de votre parcours.'
  }
];

// Metadonnees d'affichage des 6 axes (ordre canonique = celui du parser).
var RR_AXES_META = {
  'positif': { icone: '&#128077;', titre: 'Ce qui attire l’attention de façon positive', ouvert: true, style: 'liste' },
  'coherence': { icone: '&#128279;', titre: 'La cohérence d’ensemble', ouvert: true, prioritaire: 'warn', style: 'cartes' },
  'message': { icone: '&#127919;', titre: 'Le message que votre CV envoie', ouvert: false, prioritaire: 'accent', style: 'cartes' },
  'premiere-lecture': { icone: '&#9201;&#65039;', titre: 'Ce qui saute aux yeux (les 5 à 10 premières secondes)', ouvert: false, style: 'trois-temps' },
  // TACHE (retour Denis 2026-09-17) : cet axe peut avoir jusqu'a 6 points
  // (mise en page, densite, hierarchie, longueur, police...) - en style
  // 'trois-temps' ils s'enchainaient sans separation ni titre visible
  // (le titre de chaque point n'est affiche qu'en style 'cartes'). Passe
  // en 'cartes', comme coherence/message/couleurs : chaque point devient
  // un encadre distinct avec son titre, plus lisible des que l'axe a
  // plusieurs points.
  'presentation': { icone: '&#128208;', titre: 'Présentation visuelle', ouvert: false, style: 'cartes' },
  'couleurs': { icone: '&#127912;', titre: 'Les couleurs de votre CV', ouvert: false, style: 'cartes' }
};

var RR_MAX_IMAGES = 3;

// L'objet neuf. Sorti de ouvrirRegardRecruteur() pour persister entre
// deux entrees et etre serialisable tel quel (pont disquette).
function regardRecruteurEtatNeuf() {
  return {
    vue: 'preparer',
    modeTexte: false,
    modeChoisi: false,       // true des que la personne a clique sur l'une des deux cartes (consigne 75 : aucune cochee au depart)
    images: [],              // [{ nom, dataUrl, masquee }] -- dataUrl = image en base64,
                             //   jamais transmise a personne ; sert a l'outil de masquage
                             //   (rectangles dans le navigateur) et a la reprise disquette.
    _imgMasquageIdx: 0,      // image en cours de masquage (transitoire)
    cvTexte: '',             // mode texte : le texte relu
    texteRelu: false,
    ciblage: { entrepriseCiblee: null, siteEntreprise: null, offreEmploi: null, typeStructure: null, typeStructureAutre: null },
    assistantChoisi: null,
    promptTexte: '',
    reponseBrut: '',
    rapport: null,           // RapportRegardRecruteur (rapportResponseParser.js)
    erreurLecture: '',
    reponsesQuestions: {}     // { 'g0'..'g4', 'cv0'..'cvN' } : reponses ecrites facultatives
  };
}

var _regardRecruteurEtat = null;
var _regardRecruteurRenduVue = null;
var _regardRecruteurDetourPresentation = false;
var _regardRecruteurReprisePendante = false;
// TACHE (retour Denis 2026-09-19, point 1 -- bouton "Masquer mes images" trop
// discret pour une etape obligatoire) : meme principe que
// _pulseGrandApercuWordJusquA/_pulseExperiencesJusquA (js/app.js) -- horodatage
// fige a la toute premiere apparition du bouton dans la session (des qu'une
// image est ajoutee et pas encore masquee), jamais reinitialise ensuite.
var _rrPulseMasquerJusquA = null;

// ---- Route + presentation ------------------------------------------------

// ------------------------------------------------------------
// Fleche « Precedent » du navigateur (retour Denis 2026-10-16, brique B.24 de docs/BRIQUES_COMMUNES.md).
// Les vues du module (preparer, ..., regard, fiche) se deduisent de _regardRecruteurEtat.vue et sont toutes dessinees par afficherVue() : chaque dessin appelle
// _regardRecruteurSynchroniserHistorique(), chaque changement de vue devient une entree de l'historique. Le travail (images, texte, lecture recue) ne recule
// jamais : seul le nom de la vue est remis.
// ------------------------------------------------------------
// Numero de la session en cours : il change quand elle est effacee (« Recommencer ») ou remplacee (restauration de la disquette).
var _regardRecruteurSessionHistorique = 1;

function _regardRecruteurSynchroniserHistorique() {
  if (typeof historiqueInterneSynchroniser !== 'function' || !_regardRecruteurEtat) { return; }
  historiqueInterneSynchroniser('regard-recruteur', { cle: _regardRecruteurSessionHistorique + ':' + _regardRecruteurEtat.vue, vue: _regardRecruteurEtat.vue, session: _regardRecruteurSessionHistorique });
}

function _regardRecruteurRestaurerHistorique(instantane) {
  // La session a ete effacee ou remplacee depuis : ces vues n'ont plus de sens, « Precedent » les depasse.
  if (!_regardRecruteurEtat || instantane.session !== _regardRecruteurSessionHistorique) { return 'sauter'; }
  _regardRecruteurEtat.vue = instantane.vue;
  _regardRecruteurDetourPresentation = false;
}

// js/app.js est charge APRES ce fichier : le module s'inscrit au premier dessin de la page, pas au chargement.
function _regardRecruteurInscrireHistorique() {
  if (typeof historiqueInterneBrancher === 'function') { historiqueInterneBrancher('regard-recruteur', _regardRecruteurRestaurerHistorique); }
}


function pageRegardRecruteur() {
  if (_regardRecruteurEtat || typeof _regardRecruteurRenduVue === 'function') {
    ouvrirRegardRecruteur();
    return;
  }
  if (typeof naviguerVers === 'function') { naviguerVers('regard-recruteur-intro'); }
}

// « Revoir la presentation » (bouton dedie, en tete de chaque ecran de
// travail) : DETOUR de consultation -> presentation en mode detour, d'ou
// « Revenir au module » ramene pile a l'ecran quitte. Non destructif.
// N'est JAMAIS le bouton « Retour » (voir regardRecruteurRetour).
function regardRecruteurRetourVersPresentation() {
  _regardRecruteurDetourPresentation = true;
  if (typeof naviguerVers === 'function') { naviguerVers('regard-recruteur-intro'); }
}
// « Revenir au module » depuis la presentation en detour.
function regardRecruteurRevenirDeLaPresentation() {
  _regardRecruteurDetourPresentation = false;
  if (typeof naviguerVers === 'function') { naviguerVers('regard-recruteur'); }
}
// « Retour » (barre fixe du bas) : UN cran en arriere a la fois, jamais un
// ecran fixe par defaut (LECONS 10, point « bouton Retour »). Depuis le
// tout premier ecran de travail (« Preparer ») -> la presentation en mode
// NORMAL (pas detour), pour que le « Retour » de la presentation continue
// ensuite vers l'accueil de la carte -- sinon boucle infinie presentation
// <-> module (meme bug que co-lettre, corrige 2026-09-07).
function regardRecruteurRetour() {
  var vue = _regardRecruteurEtat && _regardRecruteurEtat.vue;
  var prec = vue ? RR_VUE_RETOUR[vue] : null;
  if (prec && typeof _regardRecruteurRenduVue === 'function') {
    _regardRecruteurRenduVue(prec);
    return;
  }
  _regardRecruteurDetourPresentation = false;
  if (typeof naviguerVers === 'function') { naviguerVers('regard-recruteur-intro'); }
}
// « Continuer » de l'encart de reprise : leve le gel, garde tout l'etat.
function regardRecruteurRepriseContinuer() {
  _regardRecruteurReprisePendante = false;
  if (typeof naviguerVers === 'function') { naviguerVers('regard-recruteur'); }
}

// Detruit la session (seul endroit qui remet l'etat a null).
function regardRecruteurReinitialiser() {
  if (typeof reinitialiserDepotCVEnPage === 'function') { reinitialiserDepotCVEnPage('regard-recruteur'); }
  _regardRecruteurSessionHistorique++;
  _regardRecruteurEtat = null;
  _regardRecruteurRenduVue = null;
  _regardRecruteurDetourPresentation = false;
  _regardRecruteurReprisePendante = false;
  _rrPulseMasquerJusquA = null;
  if (typeof _intervalleDecompteIA !== 'undefined' && _intervalleDecompteIA) {
    clearInterval(_intervalleDecompteIA);
  }
}

// ---- Pont disquette (LECONS 7ter) : l'etat est un objet de donnees pures.
function regardRecruteurExporterEtatPourSauvegarde() {
  if (!_regardRecruteurEtat) { return null; }
  var e = _regardRecruteurEtat;
  var vide = !(
    (e.images && e.images.length) || (e.cvTexte || '').trim() ||
    e.rapport || (e.reponseBrut || '').trim() ||
    (e.ciblage && (e.ciblage.entrepriseCiblee || e.ciblage.offreEmploi))
  );
  if (vide) { return null; }
  try { return JSON.parse(JSON.stringify(e)); } catch (err) { return null; }
}
function regardRecruteurRestaurerEtatDepuisSauvegarde(snap) {
  if (snap && typeof snap === 'object' && snap.vue === 'chez') { snap.vue = 'coller'; }
  if (snap && typeof snap === 'object' && typeof snap.vue === 'string' && RR_VUES.indexOf(snap.vue) !== -1) {
    _regardRecruteurSessionHistorique++;
    _regardRecruteurEtat = snap;
    _regardRecruteurEtat.images = _regardRecruteurEtat.images || [];
    _regardRecruteurEtat.ciblage = _regardRecruteurEtat.ciblage || {};
    _regardRecruteurEtat.reponsesQuestions = _regardRecruteurEtat.reponsesQuestions || {};
    _regardRecruteurRenduVue = null;
  } else {
    _regardRecruteurEtat = null;
    _regardRecruteurRenduVue = null;
  }
}

// ============================================================
//  OUVERTURE DU MODULE
// ============================================================
function ouvrirRegardRecruteur() {
  var premiereFois = !_regardRecruteurEtat;
  if (premiereFois) { _rrTrack('regard_recruteur_session_demarree'); }
  var etat = _regardRecruteurEtat || (_regardRecruteurEtat = regardRecruteurEtatNeuf());
  var app = document.getElementById('app');
  if (!app) { return; }

  // -- helpers d'etat ----------------------------------------------------

  function imagesToutesMasquees() {
    return etat.images.length > 0 && etat.images.every(function (i) { return i.masquee === true; });
  }
  // Message du dernier ajout d'image (PDF trop long, fichier Word, PDF illisible) : affiche dans la partie 1, efface a l'ajout suivant.
  var _rrMessageDepotImage = '';
  // Depot du texte du CV EN PAGE pour le Mode texte (brique htmlDepotCVEnPage, data/metiers.js : texte / PDF / Word / photo lue par la lecture
  // automatique, relecture et masquage dans le point 1, plus aucune fenetre, consigne 28). Une photo deposee ici est lue en texte ; l'outil de masquage
  // d'images du module reste reserve au Mode image.
  function _rrDepotCfg() {
    return {
      cle: 'regard-recruteur',
      titreDocument: 'CV',
      avecIdentite: true,
      fait: !!(etat.texteRelu && String(etat.cvTexte || '').trim()),
      nomFait: etat.cvNom || '',
      rerender: function () { afficherVue('preparer'); },
      onDocumentPrepare: function (res) {
        if (res && res.type === 'texte' && (res.valeur || '').trim()) {
          etat.cvTexte = res.valeur;
          etat.cvNom = res.nomFichier ? String(res.nomFichier) : '';
          etat.texteRelu = true;
          _rrTrack('regard_recruteur_texte_depose');
        }
        afficherVue('preparer');
      }
    };
  }
  // Un mode est « choisi » si la personne a clique une carte, ou si une session reprise (disquette) a deja une image ou un texte.
  function _rrModeChoisi() {
    return etat.modeChoisi === true || !!etat.modeTexte || etat.images.length > 0 || !!etat.texteRelu || !!String(etat.cvTexte || '').trim();
  }
  function prepImagePrete() {
    if (!_rrModeChoisi()) { return false; }
    if (etat.modeTexte) { return (etat.cvTexte || '').trim().length > 0 && etat.texteRelu; }
    return imagesToutesMasquees();
  }
  // TACHE (retour Denis 2026-09-19, point 3) : raison du blocage du bouton
  // "Choisir mon assistant", affichee au survol (attribut title, meme
  // principe que #btnSuivantNavigation/#btnEnregistrerIdentite, js/app.js).
  // Chaine vide si le bouton n'est pas bloque.
  function texteBlocageAssistant() {
    if (prepImagePrete()) { return ''; }
    if (!_rrModeChoisi()) { return 'Choisissez d’abord comment faire lire votre CV (les deux cartes en haut de page).'; }
    if (etat.modeTexte) { return 'Déposez et relisez le texte de votre CV (partie 1) pour continuer.'; }
    if (!etat.images.length) { return 'Ajoutez une image de votre CV (partie 1), ou passez en Mode texte, pour continuer.'; }
    return 'Masquez toutes vos images (partie 2) pour continuer.';
  }
  function passerModeTexte() {
    etat.modeTexte = true;
    etat.modeChoisi = true;
    _rrTrack('regard_recruteur_mode_texte');
    afficherVue('preparer');
  }
  function quitterModeTexte() {
    etat.modeTexte = false;
    etat.modeChoisi = true;
    afficherVue('preparer');
  }

  // Consigne 76 (Denis, 30/10/2026) : une image, un PDF (page par page, code existant pagesEnImagesRecommandation de data/metiers.js) ou une capture
  // collee arrivent tous en etat.images, puis passent par le meme outil de masquage.
  function _rrAjouterFichiers(liste) {
    var messages = [];
    var place = RR_MAX_IMAGES - etat.images.length;
    var taches = [];
    liste.forEach(function (f) {
      var type = String(f.type || ''), nom = String(f.name || 'image');
      var base = nom.replace(/\.[a-z0-9]+$/i, '');
      if (/^image\//.test(type)) {
        taches.push(new Promise(function (res) {
          var lecteur = new FileReader();
          lecteur.onload = function () { res([{ nom: nom, dataUrl: lecteur.result, masquee: false }]); };
          lecteur.onerror = function () { res([]); };
          lecteur.readAsDataURL(f);
        }));
      } else if (type === 'application/pdf' || /\.pdf$/i.test(nom)) {
        if (typeof pagesEnImagesRecommandation !== 'function') {
          messages.push('Ce PDF n’a pas pu être transformé en image. Faites plutôt une capture d’écran de votre CV.');
          return;
        }
        taches.push(pagesEnImagesRecommandation(f).then(function (urls) {
          return urls.map(function (u, i) { return { nom: base + ' (page ' + (i + 1) + ')', dataUrl: u, masquee: false }; });
        }).catch(function () {
          messages.push('Ce PDF n’a pas pu être transformé en image (une connexion internet est nécessaire). Faites plutôt une capture d’écran de votre CV.');
          return [];
        }));
      } else if (/\.docx?$/i.test(nom)) {
        messages.push('Un fichier Word ne peut pas être transformé en image ici : enregistrez-le d’abord en PDF (Fichier, puis Enregistrer sous, puis le type PDF), puis ajoutez ce PDF.');
      } else {
        messages.push('« ' + nom + ' » n’est ni une image ni un PDF : il n’a pas été ajouté.');
      }
    });
    return Promise.all(taches).then(function (groupes) {
      var ajouts = [].concat.apply([], groupes);
      if (place <= 0 && liste.length) {
        messages.push('Trois images au plus : retirez-en une pour en ajouter une autre.');
        ajouts = [];
      } else if (ajouts.length > place) {
        messages.push('Trois images au plus : ' + (place === 1 ? 'seule la première page a été gardée.' : 'seules les ' + place + ' premières pages ont été gardées.'));
        ajouts = ajouts.slice(0, place);
      }
      ajouts.forEach(function (x) { etat.images.push(x); });
      _rrMessageDepotImage = messages.join(' ');
      if (ajouts.length) { _rrTrack('regard_recruteur_image_ajoutee', { total: etat.images.length }); }
      afficherVue('preparer');
    });
  }

  // Capture collee avec Ctrl + V (la capture Windows + Maj + S est dans le presse-papiers, pas dans un fichier). Seulement sur « Preparer », en mode
  // image, hors d'un champ de saisie. Un seul ecouteur a la fois : le precedent est retire a chaque affichage.
  function _rrCollerCapture(evenement) {
    if (!_regardRecruteurEtat || _regardRecruteurEtat.vue !== 'preparer' || !document.getElementById('rrBloc1')) { return; }
    if (etat.modeTexte || !_rrModeChoisi()) { return; }
    var cible = evenement.target;
    if (cible && (cible.tagName === 'TEXTAREA' || cible.tagName === 'INPUT' || cible.isContentEditable)) { return; }
    var fichiers = Array.prototype.slice.call((evenement.clipboardData && evenement.clipboardData.files) || []).filter(function (f) { return /^image\//.test(f.type); });
    if (!fichiers.length) { return; }
    evenement.preventDefault();
    _rrAjouterFichiers(fichiers.map(function (f, i) {
      return new File([f], 'capture collée ' + (etat.images.length + i + 1) + '.png', { type: f.type });
    }));
  }

  // dataUrl -> HTMLImageElement (l'outil de masquage travaille sur un canvas).
  function _rrChargerImage(dataUrl) {
    return new Promise(function (resoudre, rejeter) {
      var img = new Image();
      img.onload = function () { resoudre(img); };
      img.onerror = function () { rejeter(new Error('Impossible de charger cette image.')); };
      img.src = dataUrl;
    });
  }
  function _rrNomMasque(nom) {
    return String(nom || 'cv').replace(/\.[a-z0-9]+$/i, '') + '-masque.png';
  }

  // Bloc numerote toujours ouvert a l'arrivee, seul un clic de la personne le
  // referme (decision Denis 2026-09-29, ouvertBlocDepliManuel dans data/metiers.js).
  function _rrOuvert(cle) {
    var ouvert = (typeof ouvertBlocDepliManuel === 'function') ? ouvertBlocDepliManuel(etat, cle, true) : true;
    return ouvert ? ' open' : '';
  }

  // Panneau Candidature partage (2026-09-29) : metier ou domaine, offre,
  // entreprise, site et type de structure vivent dans les champs globaux ;
  // on les recopie dans etat.ciblage (sauvegarde disquette, prompt).
  function _rrLireCiblageGlobal() {
    var rc = (typeof dossier !== 'undefined' && dossier && dossier.rechercheCandidature) || {};
    etat.ciblage = etat.ciblage || {};
    // « Domaine visé (pas un métier précis) : X » quand la personne vise un domaine
    // sans métier (voir contexteCandidaturePourAnalyse dans js/app.js).
    var cible = (typeof contexteCandidaturePourAnalyse === 'function') ? (contexteCandidaturePourAnalyse().cible || '') : '';
    etat.ciblage.posteVise = cible.replace(/^Métier visé : /, '');
    etat.ciblage.entrepriseCiblee = (typeof entrepriseCibleActuelle === 'function' ? entrepriseCibleActuelle() : '') || null;
    etat.ciblage.siteEntreprise = (typeof siteCibleActuel === 'function' ? siteCibleActuel() : '') || null;
    etat.ciblage.offreEmploi = rc.texteOffre || rc.lienOffre || null;
    etat.ciblage.typeStructure = rc.typeStructure || null;
    etat.ciblage.typeStructureAutre = null;
  }

  // Construit le texte du prompt a partir du contexte courant.
  function construireTexteAssistant() {
    _rrLireCiblageGlobal();
    var dep = {};
    if (typeof promptsExternesCharges !== 'undefined' && promptsExternesCharges['regard-recruteur']) {
      dep.template = promptsExternesCharges['regard-recruteur'];
    }
    if (typeof bilanResoudrePlaceholders === 'function') { dep.resoudrePlaceholders = bilanResoudrePlaceholders; }
    var c = etat.ciblage || {};
    var res = regardRecruteurConstruirePrompt({
      modeAnalyse: etat.modeTexte ? 'texte' : 'image',
      cvTexte: etat.cvTexte,
      posteVise: c.posteVise || c.metierVise || '',
      entreprise: c.entrepriseCiblee || '',
      offre: c.offreEmploi || '',
      typeStructure: (c.typeStructure === 'Autre' && c.typeStructureAutre) ? c.typeStructureAutre : (c.typeStructure || ''),
      siteEntreprise: c.siteEntreprise || ''
    }, dep);
    return res.texte;
  }

  // Interprete la reponse collee -> etat.rapport, ou bascule sur
  // 'erreur-lecture'.
  function traiterReponseCollee(texte) {
    etat.reponseBrut = texte || '';
    var contexte = {
      modeAnalyse: etat.modeTexte ? 'texte' : 'image',
      siteEntrepriseFourni: !!(etat.ciblage && etat.ciblage.siteEntreprise)
    };
    var dep = {};
    if (typeof extraireBlocJSONDepuisTexte === 'function') { dep.extraireJSON = extraireBlocJSONDepuisTexte; }
    try {
      etat.rapport = regardRecruteurParserRapport(texte, contexte, dep);
      etat.erreurLecture = '';
      if (typeof _etatTransitionIA !== 'undefined') { _etatTransitionIA = null; }
      _rrTrack('regard_recruteur_rapport_lu', {
        mode: contexte.modeAnalyse,
        impossible: etat.rapport.analyseImpossible ? 1 : 0,
        court: etat.rapport.cvCourt ? 1 : 0
      });
      afficherVue('regard');
    } catch (e) {
      etat.rapport = null;
      etat.erreurLecture = (e && e.code) || 'reponse_illisible';
      _rrTrack('regard_recruteur_reponse_illisible');
      afficherVue('erreur-lecture');
    }
  }

  // ------------------------------------------------------------------
  // VUE « Préparer »
  // ------------------------------------------------------------------
  // Petites maquettes de CV (dessin simple, jamais un visage) : avec du visuel pour l'image, seulement des lignes de texte pour le contenu.
  var RR_MINI_CV_IMAGE = '<svg viewBox="0 0 34 44" aria-hidden="true"><rect width="34" height="44" fill="#fff"/><rect width="34" height="12" fill="#2f6bff"/><rect x="3" y="3" width="6" height="6" rx="1" fill="#fff" opacity=".85"/><rect x="12" y="4" width="14" height="2" fill="#fff"/><rect x="12" y="8" width="9" height="1.5" fill="#fff" opacity=".8"/><rect x="0" y="12" width="11" height="32" fill="#dfe8ff"/><rect x="2" y="16" width="7" height="1.5" fill="#2f6bff"/><rect x="2" y="20" width="6" height="1.5" fill="#2f6bff" opacity=".7"/><rect x="2" y="24" width="7" height="1.5" fill="#2f6bff" opacity=".7"/><rect x="14" y="16" width="16" height="2" fill="#9aa6bd"/><rect x="14" y="21" width="17" height="1.5" fill="#c3cad8"/><rect x="14" y="25" width="15" height="1.5" fill="#c3cad8"/><rect x="14" y="31" width="16" height="2" fill="#9aa6bd"/><rect x="14" y="36" width="17" height="1.5" fill="#c3cad8"/></svg>';
  var RR_MINI_CV_TEXTE = '<svg viewBox="0 0 34 44" aria-hidden="true"><rect width="34" height="44" fill="#fff"/><rect x="4" y="5" width="16" height="2.4" fill="#4a5568"/><rect x="4" y="11" width="26" height="1.5" fill="#a0a8b8"/><rect x="4" y="15" width="24" height="1.5" fill="#a0a8b8"/><rect x="4" y="19" width="26" height="1.5" fill="#a0a8b8"/><rect x="4" y="25" width="14" height="2.4" fill="#4a5568"/><rect x="4" y="31" width="25" height="1.5" fill="#a0a8b8"/><rect x="4" y="35" width="26" height="1.5" fill="#a0a8b8"/><rect x="4" y="39" width="20" height="1.5" fill="#a0a8b8"/></svg>';

  function _rrCartesModeHTML() {
    var carte = function (mode, titre, obtenez, dessin) {
      var choisie = _rrModeChoisi() && (mode === 'texte') === !!etat.modeTexte;
      return '<button type="button" class="rr-carte-mode' + (choisie ? ' choisie' : '') + '" data-rr-mode="' + mode + '" aria-pressed="' + (choisie ? 'true' : 'false') + '">' +
        '<span class="rr-mini-cv">' + dessin + '</span><span class="rr-carte-texte">' +
        '<span class="rr-carte-titre"><span class="rr-coche">' + (choisie ? '&#10003;' : '') + '</span>' + titre + '</span>' +
        '<span class="rr-carte-obtenez"><strong>Vous obtenez :</strong> ' + obtenez + '</span></span></button>';
    };
    return '<p class="rr-accroche rr-choix-mode-titre"><strong>Comment voulez-vous faire lire votre CV&nbsp;?</strong> Vous pouvez changer à tout moment.</p>' +
      '<div class="rr-choix-mode">' +
      carte('image', 'Lire aussi la présentation', 'les 6 parties, dont la mise en page, les couleurs et l’aération.', RR_MINI_CV_IMAGE) +
      carte('texte', 'Lire le contenu seul', '4 parties : la première impression, le message de votre CV, les questions d’entretien. Pas d’avis sur la présentation ni les couleurs.', RR_MINI_CV_TEXTE) +
      '</div>';
  }

  function vuePreparerHTML() {
    var img = etat.images;
    var listeImages = img.length
      ? '<div class="rr-carte-ok"><strong>&#9989; ' + img.length + ' image' + (img.length > 1 ? 's' : '') + ' ajoutée' + (img.length > 1 ? 's' : '') + '</strong>' +
        '<ul class="rr-liste-fine">' +
        img.map(function (f, i) {
          return '<li>' + _rrEchapTexte(f.nom) +
            (f.masquee ? ' <span class="rr-etat ok" style="margin-left:0;">&#9989; masquée</span>' : ' <span class="rr-pilule warn">à masquer</span>') +
            ' <button type="button" class="btn btn-outline-secondary btn-sm rr-btn-fin" data-rr-retirer-image="' + i + '">Retirer</button></li>';
        }).join('') +
        '</ul></div>'
      : '';

    var bloc1 =
      '<details class="rr-bloc" id="rrBloc1"' + _rrOuvert('rrBloc1') + '>' +
      '<summary><span class="rr-num">1</span> L’image de votre CV</summary>' +
      '<div class="rr-bloc-corps">' +
      '<p>Un regard sur mon CV s’appuie sur une <strong>image</strong> de votre CV, pas seulement le texte : c’est ce qui permet de parler de la mise en page, des couleurs, de l’aération.</p>' +
      '<div class="rr-boutons">' +
      '<label class="btn btn-primary btn-sm rr-label-fichier">Ajouter une image ou un PDF' +
      '<input type="file" accept="image/*,application/pdf,.pdf" multiple data-rr-ajouter-images hidden></label>' +
      '</div>' +
      '<p class="rr-detail">Votre CV en <strong>PDF</strong> (l’application le transforme en images), ou une <strong>capture d’écran</strong> nette par page (mieux qu’une photo prise au téléphone). <strong>Si votre CV fait deux pages, ajoutez les deux</strong> (jusqu’à trois images). Vous pouvez aussi <strong>coller</strong> une capture avec Ctrl + V.</p>' +
      (_rrMessageDepotImage ? '<div class="rr-encart warn"><span>&#9888;&#65039;</span><span>' + _rrEchapTexte(_rrMessageDepotImage) + '</span></div>' : '') +
      listeImages +
      '<details class="rr-repli"><summary>&#128161; Astuce : comment obtenir l’image de mon CV ?</summary>' +
      '<div class="rr-detail"><ul class="rr-liste-fine">' +
      '<li><strong>Mon CV est un PDF :</strong> ajoutez-le tel quel avec le bouton ci-dessus, l’application en fait des images (trois pages au plus).</li>' +
      '<li><strong>Mon CV est un fichier Word :</strong> enregistrez-le d’abord en PDF (dans Word : Fichier, puis Enregistrer sous, puis choisissez le type PDF), puis ajoutez ce PDF.</li>' +
      '<li><strong>Je préfère faire une capture d’écran :</strong> ouvrez votre CV à l’écran, puis' +
      '<ul class="rr-liste-fine">' +
      '<li>sur un ordinateur Windows : touches Windows + Maj + S, dessinez un cadre autour du CV, puis revenez ici et faites Ctrl + V pour la coller ;</li>' +
      '<li>sur un Mac : touches Commande + Maj + 4, dessinez le cadre ; la capture est enregistrée sur le bureau, ajoutez-la avec le bouton ci-dessus ;</li>' +
      '<li>sur un téléphone : utilisez les boutons de capture d’écran du téléphone (en général marche et volume bas sur Android, marche et volume haut sur iPhone), puis « Ajouter une image » et choisissez la capture dans la galerie.</li>' +
      '</ul></li></ul></div></details>' +
      '</div></details>';

    var bloc1Texte =
      '<details class="rr-bloc" id="rrBloc1"' + _rrOuvert('rrBloc1') + '>' +
      '<summary><span class="rr-num">1</span> Le texte de votre CV <span class="rr-pilule bleu">Mode texte</span></summary>' +
      '<div class="rr-bloc-corps">' +
      (typeof htmlDepotCVEnPage === 'function' ? htmlDepotCVEnPage(_rrDepotCfg()) : '') +
      (etat.texteRelu
        ? '<div class="rr-boutons mt-2"><button type="button" class="btn btn-outline-secondary btn-sm" data-rr-aller="masquer">Revoir ou corriger le texte</button></div>'
        : '') +
      '</div></details>';

    var toutesMasq = imagesToutesMasquees();
    // TACHE (retour Denis 2026-09-19, point 1) : a la toute premiere
    // apparition du bouton "Masquer mes images" (une image vient d'etre
    // ajoutee, rien n'est encore masque), on fige un horodatage de 10s --
    // pendant cette fenetre le bouton est plus grand et pulse en couleur
    // accent (pulseAccentPersistant, decision Denis 2026-08-31), pour
    // rendre visible cette etape obligatoire. Jamais reaffiche ensuite
    // (meme principe que .btn-ouvrir-experiences/_pulseExperiencesJusquA).
    if (img.length && !toutesMasq && _rrPulseMasquerJusquA === null) {
      _rrPulseMasquerJusquA = Date.now() + 10000;
      setTimeout(function () {
        if (document.getElementById('rrBtnMasquerImages')) { afficherVue('preparer'); }
      }, 10000);
    }
    if (typeof amorcerPanneauCandidaturePartage === 'function') { amorcerPanneauCandidaturePartage(etat); }
    var pulseMasquerActif = !toutesMasq && _rrPulseMasquerJusquA !== null && Date.now() < _rrPulseMasquerJusquA;
    var bloc2Image =
      '<details class="rr-bloc" id="rrBloc2"' + _rrOuvert('rrBloc2') + '>' +
      '<summary><span class="rr-num">2</span> Masquer ce qui est personnel <span class="rr-pilule bleu">Obligatoire</span>' +
      (toutesMasq ? '<span class="rr-etat ok">Fait</span>' : '') + '</summary>' +
      '<div class="rr-bloc-corps">' +
      '<p><strong>Pourquoi :</strong> votre <strong>nom</strong>, votre <strong>photo</strong> et vos <strong>coordonnées</strong> ne partent jamais chez l’assistant. Vous les cachez vous-même sur <strong>chaque image</strong>, avec des rectangles pleins, grâce à un outil dans cette page ; l’image d’origine n’est jamais modifiée sur votre ordinateur, vous téléchargez une copie masquée.</p>' +
      (img.length
        ? '<div class="rr-boutons">' +
          '<button type="button" class="btn btn-primary' + (pulseMasquerActif ? ' rr-btn-masquer-attention' : ' btn-sm') + '" id="rrBtnMasquerImages" data-rr-aller="masquer">' + (toutesMasq ? 'Revoir le masquage' : 'Masquer mes images') + '</button>' +
          '</div>'
        : '<p class="rr-detail">Ajoutez d’abord une image à la partie 1.</p>') +
      '<label class="rr-case"><input type="checkbox" data-rr-images-masquees-manuel' + (toutesMasq ? ' checked' : '') + (img.length ? '' : ' disabled') + '> ' +
      'Je les ai déjà masquées moi-même (Paint, Photos, Aperçu...).</label>' +
      '</div></details>';

    var bloc3 =
      '<details class="rr-bloc" id="rrBloc3"' + _rrOuvert('rrBloc3') + '>' +
      '<summary><span class="rr-num">' + (etat.modeTexte ? 2 : 3) + '</span> Le poste, l’entreprise, son site <span class="rr-pilule bleu">À compléter · conseillé</span></summary>' +
      '<div class="rr-bloc-corps">' +
      '<p>Le métier visé et l’offre aident l’assistant à repérer ce qu’un recruteur de <strong>ce</strong> poste regarderait en premier. Si vous avez une offre, le métier peut rester vide : l’assistant le déduit de l’offre.</p>' +
      // Panneau Candidature partage (2026-09-29, DECISION DE DENIS) : metier ou
      // domaine, offre, entreprise, site, type de structure ; ecrit dans les
      // champs globaux, relus par _rrLireCiblageGlobal().
      '<div id="rrBlocCiblage">' + (typeof htmlPanneauCandidaturePartage === 'function'
        ? htmlPanneauCandidaturePartage({ projet: false, sansCiviliteCouleur: true, sansSituation: true }) : '') + '</div>' +
      '<div class="rr-carte-plat">' +
      '<strong>&#127912; Le site internet de l’entreprise</strong>' +
      '<p class="rr-detail" style="margin-top:.3rem;">Votre CV ne contient que le nom de l’entreprise. Si vous ajoutez son <strong>site internet</strong> (champ ci-dessus), l’assistant peut y voir ses couleurs dominantes et vous dire si votre CV les reprend. <strong>Sans le site, pas d’avis sur ce point.</strong> Ce n’est jamais une obligation.</p>' +
      '</div>' +
      '</div></details>';

    // Consigne 74 (Denis, 30/10/2026) : deux cartes de choix en tete (aucune n'est conseillee), puis les parties, avec entre elles la rubrique
    // « Ce qui se passe ensuite » (brique htmlLiaisonBlocs).
    var liaison = function (texte) { return (typeof htmlLiaisonBlocs === 'function') ? htmlLiaisonBlocs(texte) : ''; };
    var partiesImage = liaison('Trois parties vous attendent, dans l’ordre : votre image, ce que vous cachez dessus, puis le poste visé. Les suivantes se débloquent au fur et à mesure.') +
      bloc1 +
      liaison('Dès qu’une image est ajoutée, le bouton « Masquer mes images » apparaît : un outil s’ouvre, puis vous revenez ici.') +
      bloc2Image +
      liaison('Une fois l’image masquée, il reste à dire quel poste vous visez. C’est à compléter, sans obligation : vous pouvez laisser vide.') +
      bloc3;
    var partiesTexte = liaison('Deux parties vous attendent, dans l’ordre : votre texte, puis le poste visé. La deuxième se débloque quand la première est faite.') +
      bloc1Texte +
      liaison('Après le dépôt, le texte s’affiche : vous le relisez et vous masquez ce qui est personnel, puis vous revenez ici.') +
      bloc3;
    // Aucune carte cochee au depart : seule la partie 1 est montree, grisee, avec le message qui dit quoi faire d'abord.
    var partiesAttente = liaison('Choisissez l’une des deux cartes : les parties à remplir se placent ensuite ici.') +
      '<details class="rr-bloc" id="rrBloc1" open><summary><span class="rr-num">1</span> Votre CV</summary>' +
      '<div class="rr-bloc-corps"><p>Une fois votre choix fait, c’est ici que vous ajoutez l’image de votre CV, ou que vous déposez son texte.</p></div></details>';
    return '<div class="regard-recruteur-preparer">' +
      _rrCartesModeHTML() +
      (!_rrModeChoisi() ? partiesAttente : (etat.modeTexte ? partiesTexte : partiesImage)) +
      '<div class="rr-pied-actions" data-barre-bas-zone><span></span>' +
      '<button type="button" class="btn btn-primary" id="rrBtnVersAssistant" data-barre-bas="1"' + (prepImagePrete() ? '' : ' disabled title="' + _rrEchapAttr(texteBlocageAssistant()) + '"') + '>Continuer &#8594;</button>' +
      '</div>' +
      '<p class="rr-detail" style="text-align:center;">Actif une fois ' +
      (!_rrModeChoisi() ? 'votre choix fait et votre CV prêt' : (etat.modeTexte ? 'le texte relu et masqué' : 'l’image ajoutée et masquée')) + '. Le poste et l’offre peuvent rester vides.</p>' +
      '</div>';
  }

  function vuePreparerBrancher() {
    var z = document.getElementById('rrContenu');
    if (!z) { return; }

    // Point 3 desactive tant que l'image (ou le texte) du CV n'est pas prete
    // (decision Denis 2026-09-29) ; le masquage (point 2) l'est tant qu'il n'y
    // a pas d'image.
    if (typeof appliquerVerrouBlocs === 'function') {
      appliquerVerrouBlocs([
        { id: 'rrBloc1', actif: _rrModeChoisi(), message: 'Choisissez d’abord l’une des deux cartes ci-dessus : ce point s’active ensuite.' },
        { id: 'rrBloc2', actif: etat.images.length > 0, message: 'Ajoutez d’abord une image de votre CV (partie 1) : ce point s’active ensuite.' },
        { id: 'rrBloc3', actif: prepImagePrete(), message: etat.modeTexte
          ? 'Déposez, relisez et enregistrez d’abord le texte de votre CV (partie 1) : ce point s’active ensuite.'
          : 'Ajoutez d’abord votre CV en image et masquez ce qui est personnel (parties 1 et 2) : ce point s’active ensuite.' }
      ]);
    }
    var champFichier = z.querySelector('[data-rr-ajouter-images]');
    if (champFichier) {
      champFichier.addEventListener('change', function () {
        _rrAjouterFichiers(Array.prototype.slice.call(this.files || []));
      });
    }
    if (window.__rrEcouteurCollage) { document.removeEventListener('paste', window.__rrEcouteurCollage); }
    window.__rrEcouteurCollage = _rrCollerCapture;
    document.addEventListener('paste', _rrCollerCapture);
    z.querySelectorAll('[data-rr-retirer-image]').forEach(function (b) {
      b.addEventListener('click', function () {
        etat.images.splice(parseInt(this.dataset.rrRetirerImage, 10), 1);
        _rrMessageDepotImage = '';
        afficherVue('preparer');
      });
    });
    var caseMasq = z.querySelector('[data-rr-images-masquees-manuel]');
    if (caseMasq) {
      caseMasq.addEventListener('change', function () {
        var coche = this.checked;
        etat.images.forEach(function (i) { i.masquee = coche; });
        afficherVue('preparer');
      });
    }
    z.querySelectorAll('[data-rr-mode]').forEach(function (b) {
      b.addEventListener('click', function () {
        var versTexte = this.dataset.rrMode === 'texte';
        if (_rrModeChoisi() && versTexte === !!etat.modeTexte) { return; }
        if (versTexte) { passerModeTexte(); } else { quitterModeTexte(); }
      });
    });
    if (etat.modeTexte && typeof cablerDepotCVEnPage === 'function') { cablerDepotCVEnPage(_rrDepotCfg()); }

    z.querySelectorAll('[data-rr-aller]').forEach(function (b) {
      b.addEventListener('click', function () { afficherVue(this.dataset.rrAller); });
    });

    // Panneau Candidature partage : les donnees sont dans les champs globaux
    // (aucun champ a relire dans le DOM), recopiees dans etat.ciblage au clic.
    if (typeof wirePanneauCandidaturePartage === 'function') {
      wirePanneauCandidaturePartage(function () { afficherVue('preparer'); }, { projet: false, sansSituation: true });
    }
    ['rrBloc1', 'rrBloc2', 'rrBloc3'].forEach(function (idBloc) {
      if (typeof cablerBlocDepliManuel === 'function') { cablerBlocDepliManuel(etat, idBloc, idBloc); }
    });

    var btnAssistant = document.getElementById('rrBtnVersAssistant');
    if (btnAssistant) {
      btnAssistant.addEventListener('click', function () {
        if (!prepImagePrete()) { return; }
        _rrLireCiblageGlobal();
        afficherVue('choix-assistant');
      });
    }
  }

  // ------------------------------------------------------------------
  // VUE « Masquer »
  // ------------------------------------------------------------------
  function vueMasquerHTML() {
    if (etat.modeTexte) {
      var texteInit = etat.cvTexte ||
        ((typeof genererBlocsTexteCV === 'function' && typeof dossier !== 'undefined' && dossier && dossier.cv)
          ? (function () { try { return genererBlocsTexteCV(dossier.cv) || ''; } catch (e) { return ''; } })()
          : '');
      etat._texteMasquerInit = texteInit;
      return '<div class="regard-recruteur-masquer">' +
        '<p class="rr-accroche">L’assistant n’a pas besoin de votre identité pour lire votre CV. Vous collez le texte, vous le relisez, et vous masquez vous-même ce qui ne doit pas partir.</p>' +
        (typeof htmlVerificationDocument === 'function'
          ? htmlVerificationDocument({ mode: 'texte', etapeLabel: 'Un regard sur mon CV', titre: 'Relire et masquer le texte de mon CV' })
          : '<p>Composant de vérification indisponible.</p>') +
        '<div class="rr-pied-actions" data-barre-bas-zone><span></span>' +
        '<button type="button" class="btn btn-primary" data-barre-bas="1" data-barre-bas-message="Relisez et masquez d’abord le texte de votre CV." data-rr-aller="preparer"' + (etat.texteRelu ? '' : ' disabled') + ' id="rrBtnTexteRelu">C’est relu, continuer &#8594;</button>' +
        '</div>' +
        '</div>';
    }

    if (!etat.images.length) {
      return '<div class="regard-recruteur-masquer">' +
        '<div class="rr-encart"><span>&#128172;</span><span>Ajoutez d’abord une image de votre CV à l’étape « Préparer ».</span></div>' +
        '<div class="rr-pied-actions" data-barre-bas-zone><span></span><button type="button" class="btn btn-primary" data-barre-bas="1" data-rr-aller="preparer">Revenir à « Préparer » &#8594;</button></div>' +
        '</div>';
    }

    var idx = Math.min(Math.max(etat._imgMasquageIdx || 0, 0), etat.images.length - 1);
    etat._imgMasquageIdx = idx;
    var n = etat.images.length;
    var toutes = imagesToutesMasquees();

    var nav = (n > 1)
      ? '<div class="rr-bandeau">Image <strong>' + (idx + 1) + '</strong> sur ' + n + '. ' +
        etat.images.map(function (im, i) {
          return '<button type="button" class="btn btn-outline-secondary btn-sm rr-btn-fin" data-rr-img-onglet="' + i + '"' + (i === idx ? ' disabled' : '') + '>' +
            (i + 1) + (im.masquee ? ' &#9989;' : '') + '</button>';
        }).join(' ') + '</div>'
      : '';

    return '<div class="regard-recruteur-masquer">' +
      '<p class="rr-accroche">Dessinez un rectangle plein sur chaque information personnelle : <strong>nom, photo, adresse, téléphone, e-mail</strong>. Cliquez-glissez sur l’image ; cliquez un rectangle pour l’enlever. « Enregistrer » télécharge une copie masquée que vous joindrez à l’assistant. <strong>Votre image d’origine n’est pas modifiée.</strong></p>' +
      nav +
      '<div id="rrZoneEditeurImage" class="rr-carte plat"><p class="rr-detail">Chargement de l’image...</p></div>' +
      '<details class="rr-repli"><summary>Je préfère masquer moi-même, ou je n’y arrive pas</summary>' +
      '<div class="rr-detail">' +
      '<p>Vous pouvez masquer dans un autre outil (Paint, l’application Photos, Aperçu sur Mac), puis revenir à « Préparer » et cocher « Je les ai déjà masquées moi-même ». En dernier recours : imprimez, masquez au feutre noir, photographiez.</p>' +
      '<p>Ou passez en <strong>Mode texte</strong> : l’assistant lit alors le contenu de votre CV, pas sa présentation.</p>' +
      '<div class="rr-boutons"><button type="button" class="btn btn-outline-secondary btn-sm" data-rr-mode-texte>Passer en Mode texte seul</button></div>' +
      '</div></details>' +
      '<div class="rr-pied-actions"><span></span>' +
      '<button type="button" class="btn btn-primary" data-rr-aller="preparer" id="rrBtnImagesMasquees"' + (toutes ? '' : ' disabled') + '>' +
      (toutes ? 'Toutes mes images sont masquées, continuer &#8594;' : 'Masquez chaque image pour continuer') + '</button>' +
      '</div>' +
      '</div>';
  }

  function vueMasquerBrancher() {
    var z = document.getElementById('rrContenu');
    if (!z) { return; }
    if (etat.modeTexte && typeof cablerVerificationDocument === 'function') {
      cablerVerificationDocument({
        mode: 'texte',
        texteInitial: etat._texteMasquerInit || '',
        _dejaEnregistre: etat.texteRelu,
        onModification: function (v) { etat.cvTexte = v; },
        onEnregistre: function (r) {
          etat.cvTexte = r.texte || '';
          etat.texteRelu = true;
          var btn = document.getElementById('rrBtnTexteRelu');
          if (btn) { btn.disabled = false; }
          _rrTrack('regard_recruteur_texte_relu');
        }
      });
    }
    z.querySelectorAll('[data-rr-aller]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (this.disabled) { return; }
        afficherVue(this.dataset.rrAller);
      });
    });
    var btnModeTexte = z.querySelector('[data-rr-mode-texte]');
    if (btnModeTexte) { btnModeTexte.addEventListener('click', passerModeTexte); }

    // -- masquage image : outil de rectangles (brique htmlVerificationDocument) --
    if (!etat.modeTexte && etat.images.length) {
      z.querySelectorAll('[data-rr-img-onglet]').forEach(function (b) {
        b.addEventListener('click', function () {
          etat._imgMasquageIdx = parseInt(this.dataset.rrImgOnglet, 10);
          afficherVue('masquer');
        });
      });

      var idx = Math.min(Math.max(etat._imgMasquageIdx || 0, 0), etat.images.length - 1);
      var entree = etat.images[idx];
      var zone = document.getElementById('rrZoneEditeurImage');
      if (zone && typeof htmlVerificationDocument === 'function' && typeof cablerVerificationDocument === 'function') {
        _rrChargerImage(entree.dataUrl).then(function (img) {
          var etatPartage = { rotationDegres: 0, rectangles: [], echelleAffichageEditeur: undefined };
          var cfg = {
            mode: 'image',
            etapeLabel: 'Un regard sur mon CV',
            titre: (etat.images.length > 1 ? 'Masquer l’image ' + (idx + 1) + ' sur ' + etat.images.length : 'Masquer votre CV'),
            titreDocument: 'CV',
            img: img,
            etatPartage: etatPartage,
            nomFichierTelecharge: _rrNomMasque(entree.nom),
            avecEtapeSuivante: false,
            _dejaEnregistre: false,
            // TACHE (retour Denis 2026-09-17) : le rectangle dessine n'etait
            // jusque-la conserve QUE dans le fichier telecharge - l'image
            // gardee dans la page (etat.images[i].dataUrl, revue au
            // reaffichage de cet ecran, incluse telle quelle dans la
            // disquette) restait l'ORIGINALE non masquee. Coute que coute,
            // la version en memoire doit devenir la version masquee : plus
            // aucun doute possible sur ce qui est reellement garde, et plus
            // aucune coordonnee en clair dans une sauvegarde de session.
            onEnregistre: function (resultat) {
              entree.masquee = true;
              if (resultat && resultat.blob) {
                var lecteur = new FileReader();
                lecteur.onload = function () {
                  entree.dataUrl = lecteur.result;
                  _rrTrack('regard_recruteur_image_masquee', { total: etat.images.length });
                  var suivante = -1;
                  for (var k = 0; k < etat.images.length; k++) {
                    if (!etat.images[k].masquee) { suivante = k; break; }
                  }
                  etat._imgMasquageIdx = (suivante !== -1) ? suivante : etat._imgMasquageIdx;
                  afficherVue('masquer');
                };
                lecteur.readAsDataURL(resultat.blob);
                return;
              }
              _rrTrack('regard_recruteur_image_masquee', { total: etat.images.length });
              afficherVue('masquer');
            }
          };
          zone.innerHTML = htmlVerificationDocument(cfg);
          cablerVerificationDocument(cfg);
        }).catch(function () {
          zone.innerHTML = '<div class="rr-encart warn"><span>&#9888;&#65039;</span><span>Impossible de charger cette image. Retirez-la à l’étape « Préparer » et ajoutez-en une autre.</span></div>';
        });
      }
    }
  }

  // ------------------------------------------------------------------
  // VUE « Choisir l'assistant »
  // ------------------------------------------------------------------
  function vueChoixAssistantHTML() {
    var etapes = (typeof ETAPES_DETAIL_CHOIX_IA !== 'undefined') ? ETAPES_DETAIL_CHOIX_IA : [];
    return '<div class="regard-recruteur-choix">' +
      '<p class="rr-accroche">Dernière étape avant l’envoi : avec quel assistant en ligne faire lire votre CV&nbsp;? <strong>Cliquer sur un assistant prépare et copie tout, puis l’ouvre</strong> : vous n’avez rien à taper.</p>' +
      // Les gestes a faire chez l'assistant se disent ICI, sur l'ecran d'avant, ou la personne lit tranquillement : l'ecran du retour reste libre (decision Denis 2026-10-28, consigne 35).
      (etat.modeTexte
        ? '<div class="rr-encart"><span>&#128221;</span><span>Vous êtes en <strong>Mode texte</strong> : le texte de votre CV part avec la consigne. Vous n’avez pas d’image à joindre. <strong>Une fois chez l’assistant</strong>, collez le texte (déjà copié), puis envoyez. Revenez ensuite ici coller la réponse.</span></div>'
        : '<div class="rr-encart"><span>&#128444;&#65039;</span><span><strong>Une fois chez l’assistant, deux gestes, dans cet ordre&nbsp;:</strong>' +
          '<ol class="fc-etapes"><li><strong>Joignez d’abord votre image masquée</strong> au message (glissez-la, ou utilisez le trombone de l’assistant).</li>' +
          '<li>Collez ensuite le texte (déjà copié) <strong>dans ce même message</strong>, puis envoyez.</li></ol></span></div>' +
          '<div class="rr-encart warn"><span>&#9888;&#65039;</span><span>Envoyer le texte seul, sans l’image déjà jointe, donne toujours « nous n’avons pas réussi à lire ce CV » : l’assistant ne reçoit alors rien à analyser.</span></div>') +
      (typeof htmlChoixAssistantBilanCorps === 'function'
        ? htmlChoixAssistantBilanCorps({
          idErreur: 'rrErreurChoixIA',
          attrAssistant: 'data-assistant-regard-recruteur',
          recapContexte: ['cible', 'offre', 'entreprise', 'structure'],
          etapes: etapes,
          texteConfidentialite: 'Vous avez masqué vous-même votre nom, votre photo et vos coordonnées' + (etat.modeTexte ? ' dans le texte' : ' sur l’image') + '. Rien d’autre n’est envoyé.'
        })
        : '') +
      '<details class="rr-repli"><summary>Si vous utilisez votre propre compte (connecté)</summary>' +
      '<div class="rr-detail"><p>Sur un compte auquel vous êtes déjà connecté, l’assistant peut donner son avis sur la consigne au lieu de faire la lecture. Si ça arrive, collez-lui : <em>« Applique la consigne directement et entièrement, sans commentaire ni introduction. »</em></p></div></details>' +
      '</div>';
  }

  function vueChoixAssistantBrancher() {
    var z = document.getElementById('rrContenu');
    if (!z) { return; }

    z.querySelectorAll('[data-assistant-regard-recruteur]').forEach(function (bouton) {
      bouton.addEventListener('click', function () {
        var id = bouton.dataset.assistantRegardRecruteur;
        var assistant = (typeof ASSISTANTS_IA !== 'undefined') ? ASSISTANTS_IA.filter(function (a) { return a.id === id; })[0] : null;
        if (!assistant) { return; }
        _rrTrack('regard_recruteur_assistant_choisi', { assistant: assistant.id });

        // TACHE (retour Denis 2026-09-19, point 4) : il manquait l'ecran
        // tampon "Avant de continuer vers X" (consignes + Ctrl+V), deja en
        // place partout ailleurs (Decouverte, Bilan...) -- ce module
        // reimplementait sa propre copie+transition sans jamais l'ouvrir.
        // Reutilise ouvrirFenetreAssistantIA() telle quelle, meme patron
        // que wireChoixAssistantIA()/etapeChoixAssistant() (js/app.js,
        // decouverteParcours.js) : construction du texte + copie
        // seulement au clic sur "Je comprends, continuer".
        if (typeof ouvrirFenetreAssistantIA !== 'function') { return; }
        ouvrirFenetreAssistantIA({
          nomAssistant: assistant.nom,
          idAssistant: assistant.id,
          urlAssistant: assistant.url,
          construireTexteACopier: function () {
            var texte = construireTexteAssistant();
            etat.promptTexte = texte;
            etat.assistantChoisi = { id: assistant.id, nom: assistant.nom, url: assistant.url };
            return texte;
          },
          onApresValidation: function (urlAssistant, nomAssistant) {
            if (typeof _etatTransitionIA !== 'undefined') {
              _etatTransitionIA = { urlAssistant: urlAssistant, nomAssistant: nomAssistant, phase: 'decompte', secondesRestantes: DUREE_DECOMPTE_IA_SECONDES };
            }
            afficherVue('coller');
          }
        });
      });
    });
  }

  // ------------------------------------------------------------------
  // VUE « Coller la réponse »
  // ------------------------------------------------------------------
  // Fenetre unique « Collez la reponse » EN PAGE (dette B.17, etape C, 2026-10-28) : voir htmlCollageUniquePage() (js/app.js).
  // La vue 'erreur-lecture' (reponse illisible, ou session restauree sur cette vue) affiche la meme fenetre, deja en echec.
  // « Coller la reponse » lit et verifie (analyseur pur) sans rien enregistrer ; « Continuer » (barre du bas) construit le regard.
  var RR_PHRASE_RELANCE = 'Reprends ta lecture de mon CV et donne-la uniquement dans le format demandé au début, sans commentaire ni introduction.';

  // Echec de lecture : explication rassurante + phrase de relance a recopier chez l'assistant (le bouton la copie).
  function _rrEchecRelance() {
    return {
      texte: '<strong>Ce n’est pas de votre faute.</strong> L’assistant n’a pas répondu dans la forme attendue, ou la réponse est arrivée incomplète. Rien n’est perdu : votre image et vos réponses restent là. Retournez sur l’assistant et collez-lui cette phrase, puis rapportez sa nouvelle réponse : <em>« ' + _rrEchapTexte(RR_PHRASE_RELANCE) + ' »</em>',
      bouton: { libelle: 'Copier cette phrase', sansFleche: true }
    };
  }

  function vueCollerHTML() {
    return '<div class="regard-recruteur-coller">' + htmlCollageUniquePage('RegardRecruteur') + '</div>';
  }

  function vueCollerBrancher() {
    brancherCollageUniquePage({
      suffixe: 'RegardRecruteur', idAncre: 'rrContenu', rerendre: function () { afficherVue('coller'); }, evenementBloque: 'regard_recruteur_popup_bloque',
      echecInitial: etat.vue === 'erreur-lecture',
      module: {
        libelleSuite: 'Voir mon regard',
        quoi: 'L’assistant vient de lire votre CV comme le ferait un recruteur : première impression, contenu, lisibilité.',
        pourquoi: 'Vous savez ce qu’un recruteur retient en quelques secondes et ce que vous pouvez améliorer.',
        verif: 'regardez que ce qu’il dit voir sur votre CV correspond bien à ce qui y est écrit. Ce sont des pistes, pas des vérités : un autre recruteur pourrait le lire autrement.',
        conseil: 'Si l’assistant a donné son avis sur la consigne au lieu de faire la lecture (ça arrive sur un compte connecté), collez-lui : <em>« Applique la consigne directement et entièrement, sans commentaire. »</em> puis rapportez sa nouvelle réponse.'
      },
      echecParDefaut: _rrEchecRelance(),
      verifier: function (texte) {
        try {
          regardRecruteurParserRapport(texte, { modeAnalyse: etat.modeTexte ? 'texte' : 'image', siteEntrepriseFourni: !!(etat.ciblage && etat.ciblage.siteEntreprise) },
            (typeof extraireBlocJSONDepuisTexte === 'function') ? { extraireJSON: extraireBlocJSONDepuisTexte } : {});
          return { ok: true };
        } catch (e) {
          return { ok: false, personnalise: _rrEchecRelance() };
        }
      },
      onEchecAction: function () {
        var bouton = document.querySelector('#fcRacineRegardRecruteur [data-fc=echecAction]');
        if (typeof copierTexteVersPressePapier === 'function') { copierTexteVersPressePapier(RR_PHRASE_RELANCE, bouton); }
      },
      onChangerAssistant: function () {
        if (typeof _intervalleDecompteIA !== 'undefined' && _intervalleDecompteIA) { clearInterval(_intervalleDecompteIA); }
        if (typeof _etatTransitionIA !== 'undefined') { _etatTransitionIA = null; }
        afficherVue('choix-assistant');
      },
      onContinuer: function (texte) { traiterReponseCollee(texte); }
    });
  }

  // ------------------------------------------------------------------
  // VUE « Le regard » (le rapport)
  // ------------------------------------------------------------------
  function _rrPointHTML(p, style) {
    if (style === 'liste') { return '<li>' + _rrEchapTexte(p.constat) + '</li>'; }
    var h = '';
    if (style === 'cartes' && p.titre) { h += '<h4>' + _rrEchapTexte(p.titre) + '</h4>'; }
    // TACHE (retour Denis 2026-09-19, point 6 -- "on ne comprend pas trop
    // comment et pourquoi" a l'interieur d'une rubrique) : le constat
    // n'avait aucune etiquette, contrairement a "Comment un recruteur peut
    // le lire" et "Une piste" juste apres -- rien ne signalait que cette
    // 1re phrase est un FAIT (ce qui est ecrit sur le CV), avant les 2
    // phrases d'interpretation qui suivent. Meme classe .rr-tt/.rr-lab
    // (coherence visuelle), fond neutre en plus pour marquer la 1re etape
    // d'une progression fait -> lecture -> piste (voir CSS .rr-tt.constat).
    if (p.constat) { h += '<div class="rr-tt constat"><span class="rr-lab">Sur votre CV</span><span>' + _rrEchapTexte(p.constat) + '</span></div>'; }
    var tt = '';
    if (p.lecture) { tt += '<div class="rr-tt"><span class="rr-lab">Comment un recruteur peut le lire</span><span>' + _rrEchapTexte(p.lecture) + '</span></div>'; }
    if (p.piste) { tt += '<div class="rr-tt verif"><span class="rr-lab">Une piste</span><span>' + _rrEchapTexte(p.piste) + '</span></div>'; }
    if (tt) { h += '<div class="rr-trois-temps">' + tt + '</div>'; }
    if (style === 'cartes') { return '<div class="rr-carte-plat">' + h + '</div>'; }
    return h;
  }

  // Consigne 72 (Denis, 30/10/2026) : l'assistant dit seulement oui ou non au fond de couleur, c'est l'application qui ecrit le message
  // (toujours complet, trois usages). oui : message au present ; non : rien ; pas de reponse nette : meme texte, en « Si... ».
  function _rrFondCouleurHTML(fond) {
    if (fond === false) { return ''; }
    var entree = (fond === true)
      ? '<strong>Votre CV a un fond de couleur.</strong> Selon la façon dont vous l’envoyez, cela ne compte pas pareil :'
      : '<strong>Si votre CV a un fond de couleur</strong>, voici ce qui compte selon la façon dont vous l’envoyez :';
    return '<div class="rr-encart rr-fond-couleur"><span>&#127912;</span><span>' + entree +
      '<ul class="rr-liste">' +
      '<li><strong>Par une plateforme de recrutement</strong> : le logiciel qui lit les CV peut ne pas lire tout le texte sur un fond de couleur. Votre CV peut alors être pénalisé.</li>' +
      '<li><strong>Par mail</strong> : beaucoup de recruteurs impriment les CV en noir et blanc. Un fond foncé devient alors difficile à lire.</li>' +
      '<li><strong>Remis en main propre</strong> : aucun risque.</li>' +
      '</ul><span class="rr-detail">Rien n’est obligatoire : c’est vous qui choisissez la version à envoyer selon le cas.</span></span></div>';
  }

  function _rrAxeHTML(axe) {
    var meta = RR_AXES_META[axe.id] || { icone: '', titre: axe.id, style: 'trois-temps' };
    var corps;
    if (meta.style === 'liste') {
      corps = '<ul class="rr-liste">' + axe.points.map(function (p) { return _rrPointHTML(p, 'liste'); }).join('') + '</ul>';
    } else {
      corps = axe.points.map(function (p) { return _rrPointHTML(p, meta.style === 'cartes' ? 'cartes' : 'trois-temps'); }).join('');
    }
    var pilule = meta.prioritaire ? '<span class="rr-pilule ' + (meta.prioritaire === 'warn' ? 'warn' : 'bleu') + '">prioritaire</span>' : '';
    var ancre = (typeof reperesBoutonAncre === 'function')
      ? '<div class="rr-boutons" style="margin-top:.6rem;">' + reperesBoutonAncre({ libelle: 'Un regard sur mon CV : ' + _rrTexteBrut(meta.titre) }) + '</div>'
      : '';
    return '<details class="rr-bloc rr-axe rr-axe-' + axe.id + '"' + (meta.ouvert ? ' open' : '') + '>' +
      '<summary><span class="rr-num-emoji">' + meta.icone + '</span> ' + _rrEchapTexte(_rrTexteBrut(meta.titre)) + ' ' + pilule + '</summary>' +
      '<div class="rr-bloc-corps">' + corps + (axe.id === 'couleurs' && etat.rapport ? _rrFondCouleurHTML(etat.rapport.fondDeCouleur) : '') + ancre + '</div>' +
      '</details>';
  }

  function _rrQuestionHTML(o, cle, avecReponse) {
    var rep = etat.reponsesQuestions[cle] || '';
    var champ = avecReponse
      ? '<details class="rr-repli rr-repli-imbrique"><summary>&#9997;&#65039; Écrire ma réponse (à compléter)</summary>' +
        '<div><p class="rr-detail">C’est vous qui décidez d’écrire, ou non. Vous n’obtiendrez pas de correction ici.</p>' +
        '<textarea class="form-control form-control-sm" data-rr-reponse="' + cle + '" rows="3" placeholder="Votre réponse">' + _rrEchapTexte(rep) + '</textarea></div></details>'
      : '';
    return '<details class="rr-repli"><summary>« ' + _rrEchapTexte(o.q) + ' »</summary>' +
      '<div class="rr-detail">' +
      '<p><strong>Ce que le recruteur cherche :</strong> ' + _rrEchapTexte(o.cherche) + '</p>' +
      '<p><strong>Comment y répondre :</strong> ' + _rrEchapTexte(o.repondre) + '</p>' +
      champ +
      '</div></details>';
  }

  function vueRegardHTML() {
    var r = etat.rapport;
    if (!r) { return '<p>Aucune lecture disponible. <button type="button" class="btn btn-outline-secondary btn-sm" data-rr-aller="coller">Coller une réponse</button></p>'; }

    if (r.analyseImpossible) {
      var conseilsImpossible = etat.modeTexte
        ? '<li>Vérifiez que le texte collé est bien complet, et qu’il correspond bien au contenu d’un CV.</li>' +
          '<li>Recopiez-le à nouveau si une partie a pu être coupée au moment du collage.</li>' +
          '<li>Si le texte est refusé une seconde fois, essayez avec une <strong>image</strong> de votre CV à la place : l’assistant a alors plus d’éléments pour juger.</li>'
        : '<li>Reprenez une capture plus nette, bien lisible, sans reflet ni flou.</li>' +
          '<li>Vérifiez que l’image montre bien un CV complet, pas une autre page ou un document coupé.</li>' +
          '<li>Si l’image est refusée une seconde fois, essayez le <strong>Mode texte</strong> : collez le contenu de votre CV à la place.</li>';
      return '<div class="regard-recruteur-regard">' +
        '<p class="rr-accroche">Ce n’est pas de votre faute. L’assistant nous dit ne pas être arrivé à lire votre CV.</p>' +
        '<div class="rr-carte">' +
        '<div class="rr-encart warn"><span>&#9888;&#65039;</span><span>' + _rrEchapTexte(r.messageAnalyseImpossible) + '</span></div>' +
        '<h4>&#128260; Ce que vous pouvez faire</h4>' +
        '<ul class="rr-liste">' + conseilsImpossible + '</ul>' +
        '</div>' +
        '<div class="rr-pied-actions">' +
        '<button type="button" class="btn btn-outline-secondary" data-rr-aller="coller">Coller une autre réponse</button>' +
        '<button type="button" class="btn btn-primary" data-rr-aller="preparer">' + (etat.modeTexte ? 'Reprendre mon texte' : 'Reprendre mon image') + ' &#8594;</button>' +
        '</div>' +
        '<div class="rr-encart"><span>&#128172;</span><span>Rien n’est perdu : votre image et vos réponses restent là. Vous pouvez aussi <strong>sauvegarder</strong> (icône disquette) et revenir plus tard.</span></div>' +
        '</div>';
    }

    var bandeauMode = etat.modeTexte
      ? '<div class="rr-bandeau">Lecture sur le texte seul : <strong>4 parties</strong>. La présentation et les couleurs demandent une image.</div>'
      : '<div class="rr-bandeau">Vous avez envoyé une image de votre CV : les <strong>6 parties</strong> sont disponibles.</div>';

    var synthese = '<div class="rr-carte rr-synthese">' +
      '<p style="margin:0;font-size:1.02rem;">' + _rrEchapTexte(r.syntheseOuverture) + '</p>' +
      '<p class="rr-detail" style="margin:.5rem 0 0;">Notre lecture est limitée : on part de ce que vous nous montrez, pas de votre CV complet en main. Et tous les recruteurs ne réagissent pas de la même façon. Ce sont des pistes, pas des vérités.</p>' +
      '</div>';

    var bandeauCourt = r.cvCourt
      ? '<div class="rr-encart warn"><span>&#128196;</span><span>' + _rrEchapTexte(r.messageCvCourt) + '</span></div>'
      : '';

    var axesHTML = r.axes.filter(function (a) { return a.afficher; }).map(_rrAxeHTML).join('');

    // Décoder les questions d'un recruteur (accordéon replié).
    var qGen = RR_QUESTIONS_GENERALES.map(function (o, i) { return _rrQuestionHTML(o, 'g' + i, true); }).join('');
    var qCv = (r.questionsLieesAuCv && r.questionsLieesAuCv.length)
      ? '<div class="rr-carte-plat"><p><strong>2. Questions liées à votre CV</strong> <span class="rr-detail">· proposées par l’assistant</span></p>' +
        r.questionsLieesAuCv.map(function (q, i) {
          return _rrQuestionHTML({ q: q.question, cherche: q.ceQueLeRecruteurCherche || q.origine, repondre: q.commentYRepondre || '' }, 'cv' + i, true);
        }).join('') +
        '</div>'
      : '';

    var decoder = '<details class="rr-bloc rr-decoder">' +
      '<summary><span class="rr-num-emoji">&#128173;</span> Décoder les questions d’un recruteur <span class="rr-pilule bleu">si vous préparez l’entretien</span></summary>' +
      '<div class="rr-bloc-corps">' +
      '<p class="rr-detail">Ce bloc n’est pas une des parties ci-dessus : c’est une aide pour préparer l’entretien. Ouvrez-le seulement si ça vous intéresse. Une question posée cache souvent une autre attente.</p>' +
      '<div class="rr-encart"><span>&#128173;</span><span>Au-delà de la réponse, un recruteur observe si vous vous êtes <strong>approprié votre CV</strong> : pouvez-vous parler de votre parcours en le regardant, plutôt qu’en lisant une feuille&nbsp;? Préparer vos réponses à l’avance, c’est ce qui vous permet d’en parler librement le jour J.</span></div>' +
      '<div class="rr-carte-plat"><p><strong>1. Questions générales</strong> <span class="rr-detail">· toujours présentes</span></p>' + qGen + '</div>' +
      qCv +
      '<div class="rr-encart"><span>&#128172;</span><span>La bibliothèque complète des questions d’entretien vivra dans le module <strong>M’entraîner à un entretien</strong>. Ici : de quoi anticiper à partir de votre CV.</span></div>' +
      '</div></details>';

    var imageAnalysee = etat.modeTexte ? '' :
      '<details class="rr-bloc"><summary><span class="rr-num-emoji">&#128274;</span> L’image analysée</summary>' +
      '<div class="rr-bloc-corps"><p style="margin:0;">Vous avez masqué nom, photo et coordonnées avant l’envoi : <strong>c’est une bonne pratique, jamais un défaut</strong>, et la lecture n’en tient pas compte. Sur le CV que vous enverrez, pensez à remettre nom, prénom, code postal et ville, et vos moyens de contact (rappel dans votre fiche en fin de parcours).</p></div></details>';

    return '<div class="regard-recruteur-regard">' +
      '<p class="rr-accroche">Une lecture, pas un échange. Chaque partie est repliée : ouvrez ce que vous voulez, à votre rythme.</p>' +
      bandeauMode + synthese + bandeauCourt +
      '<p class="rr-detail">Les parties les plus importantes pour votre candidature sont en premier.</p>' +
      axesHTML +
      decoder +
      imageAnalysee +
      '<div class="rr-carte rr-fin-lecture"><h3 style="margin-top:.2rem;">Cette lecture est terminée.</h3>' +
      '<p style="margin:.3rem 0 0;">Elle vous montre des points à vérifier et à préparer, jamais une note sur vous.</p></div>' +
      '<div class="rr-pied-actions" data-barre-bas-zone><span></span>' +
      '<button type="button" class="btn btn-primary" data-barre-bas="1" data-rr-aller="fiche">Préparer ma fiche à garder &#8594;</button>' +
      '</div>' +
      '</div>';
  }

  function vueRegardBrancher() {
    var z = document.getElementById('rrContenu');
    if (!z) { return; }
    z.querySelectorAll('[data-rr-aller]').forEach(function (b) {
      b.addEventListener('click', function () { afficherVue(this.dataset.rrAller); });
    });
    z.querySelectorAll('[data-rr-reponse]').forEach(function (t) {
      t.addEventListener('input', function () { etat.reponsesQuestions[this.dataset.rrReponse] = this.value; });
    });
    if (typeof reperesBrancherBoutonAncre === 'function') { reperesBrancherBoutonAncre(); }
  }

  // ------------------------------------------------------------------
  // VUE « Ma fiche à garder » (clôture)
  // ------------------------------------------------------------------
  function _rrPointsAVerifier() {
    var r = etat.rapport;
    if (!r) { return []; }
    var out = [];
    r.axes.forEach(function (a) {
      if (!a.afficher) { return; }
      a.points.forEach(function (p) { if (p.piste) { out.push(p.piste); } });
    });
    return out;
  }

  function vueFicheHTML() {
    var r = etat.rapport || regardRecruteurEtatNeuf().rapport;
    var aRetenir = (r && r.pointsARetenir) ? r.pointsARetenir : [];
    var qCv = (r && r.questionsLieesAuCv) ? r.questionsLieesAuCv : [];

    var listeGen = RR_QUESTIONS_GENERALES.map(function (o, i) {
      var rep = etat.reponsesQuestions['g' + i];
      return '<li><strong>' + _rrEchapTexte(o.q) + '</strong> <span class="rr-detail">(il cherche : ' + _rrEchapTexte(o.cherche) + ')</span>' +
        (rep ? '<br><em>votre réponse : ' + _rrEchapTexte(rep) + '</em>' : '<br><em>votre réponse : ...</em>') + '</li>';
    }).join('');

    var listeCv = qCv.length
      ? '<p style="margin:.5rem 0 .2rem;"><strong>Questions liées à votre CV</strong> <span class="rr-detail">(proposées par l’assistant)</span></p><ul class="rr-liste-fine">' +
        qCv.map(function (q, i) {
          var rep = etat.reponsesQuestions['cv' + i];
          return '<li><strong>' + _rrEchapTexte(q.question) + '</strong> <span class="rr-detail">(il cherche : ' + _rrEchapTexte(q.ceQueLeRecruteurCherche || q.origine) + ')</span>' +
            (rep ? '<br><em>votre réponse : ' + _rrEchapTexte(rep) + '</em>' : '<br><em>votre réponse : ...</em>') + '</li>';
        }).join('') + '</ul>'
      : '';

    var aRetenirHTML = aRetenir.length
      ? '<ul class="rr-liste-fine">' + aRetenir.map(function (p) { return '<li>' + _rrEchapTexte(p) + '</li>'; }).join('') + '</ul>'
      : '<p class="rr-detail">Rien d’urgent à changer d’après cette lecture.</p>';

    var pointsVerif = _rrPointsAVerifier();
    var ancresPoints = (typeof reperesBoutonAncre === 'function' && pointsVerif.length)
      ? pointsVerif.slice(0, 8).map(function (p) {
        return '<li>' + _rrEchapTexte(p) + ' ' + reperesBoutonAncre({ libelle: 'Un regard sur mon CV : ' + _rrTexteBrut(p) }) + '</li>';
      }).join('')
      : '';

    return '<div class="regard-recruteur-fiche">' +
      '<p class="rr-accroche">De quoi retravailler votre CV plus tard, sur APP ou ailleurs, et préparer un entretien.</p>' +

      '<div class="rr-carte">' +
      '<h3>&#128221; Vos questions d’entretien à préparer</h3>' +
      '<p style="margin:.5rem 0 .2rem;"><strong>Questions générales</strong></p>' +
      '<ul class="rr-liste-fine">' + listeGen + '</ul>' +
      listeCv +
      '</div>' +

      '<div class="rr-carte">' +
      '<h3>&#128204; À retenir pour votre prochain CV</h3>' +
      '<p>Vous ne modifiez pas votre CV ici. Mais vous pourrez tenir compte de ces points la prochaine fois que vous le travaillerez, <strong>sur APP ou ailleurs</strong> :</p>' +
      aRetenirHTML +
      '</div>' +

      '<div class="rr-carte">' +
      '<h3>&#128231; Vos coordonnées sur le CV que vous enverrez</h3>' +
      '<p>Vous avez masqué votre identité pour cette lecture : <strong>c’est une bonne pratique, jamais un défaut.</strong> Sur le CV que vous enverrez vraiment, pensez à remettre :</p>' +
      '<ul class="rr-liste-fine">' +
      '<li><strong>Nom et prénom</strong>, <strong>code postal et ville</strong>, <strong>téléphone</strong>, <strong>e-mail</strong>.</li>' +
      '<li><strong>L’adresse complète</strong> : seulement si c’est un atout (vous habitez tout près, vous êtes disponible rapidement). Sinon, code postal et ville suffisent.</li>' +
      '</ul>' +
      '</div>' +

      '<div class="rr-encart"><span>&#128084;</span><span>Le jour de l’entretien : une tenue sobre et adaptée au métier visé va dans le même sens que ce que dit votre CV. Rien d’obligatoire, juste de la cohérence.</span></div>' +

      '<div class="rr-carte rr-garder">' +
      '<h3>&#128190; Garder ces conseils</h3>' +
      '<p class="rr-detail">Aucun compte, rien n’est conservé automatiquement : imprimez, téléchargez ou copiez si vous voulez garder cette fiche.</p>' +
      '<div class="rr-boutons">' +
      '<button type="button" class="btn btn-primary btn-sm" id="rrBtnImprimer">&#128424;&#65039; Imprimer mes conseils</button>' +
      '<button type="button" class="btn btn-outline-secondary btn-sm" id="rrBtnTelecharger">&#128190; Télécharger (.doc)</button>' +
      '<button type="button" class="btn btn-outline-secondary btn-sm" id="rrBtnCopier">&#128203; Copier le texte (pour un e-mail)</button>' +
      '</div>' +
      '</div>' +
      htmlRappelSauvegarde() +   // brique commune (consigne 49)

      (ancresPoints
        ? '<div class="rr-carte rr-garder">' +
          '<h3>&#9875;&#65039; Garder des points comme Repères</h3>' +
          '<p>Pour chaque point utile, le bouton « Garder comme Repère » le met de côté dans « Mes repères ». Vous choisissez ensuite son type (Question, Idée, À approfondir, À discuter).</p>' +
          '<ul class="rr-liste-fine rr-liste-ancres">' + ancresPoints + '</ul>' +
          '</div>'
        : '') +
      '</div>';
  }

  function _rrTexteFiche() {
    var r = etat.rapport;
    var lignes = ['REGARD RECRUTEUR : MA FICHE DE PRÉPARATION', ''];
    if (r && r.syntheseOuverture) { lignes.push(r.syntheseOuverture, ''); }
    lignes.push('VOS QUESTIONS D’ENTRETIEN À PRÉPARER', '');
    lignes.push('Questions générales :');
    RR_QUESTIONS_GENERALES.forEach(function (o, i) {
      lignes.push('- ' + o.q);
      lignes.push('  Ce que le recruteur cherche : ' + o.cherche);
      lignes.push('  Comment y répondre : ' + o.repondre);
      var rep = etat.reponsesQuestions['g' + i];
      if (rep) { lignes.push('  Votre réponse : ' + rep); }
      lignes.push('');
    });
    if (r && r.questionsLieesAuCv && r.questionsLieesAuCv.length) {
      lignes.push('Questions liées à votre CV :');
      r.questionsLieesAuCv.forEach(function (q, i) {
        lignes.push('- ' + q.question);
        if (q.ceQueLeRecruteurCherche) { lignes.push('  Ce que le recruteur cherche : ' + q.ceQueLeRecruteurCherche); }
        if (q.commentYRepondre) { lignes.push('  Comment y répondre : ' + q.commentYRepondre); }
        var rep = etat.reponsesQuestions['cv' + i];
        if (rep) { lignes.push('  Votre réponse : ' + rep); }
        lignes.push('');
      });
    }
    lignes.push('À RETENIR POUR VOTRE PROCHAIN CV', '');
    ((r && r.pointsARetenir) || []).forEach(function (p) { lignes.push('- ' + p); });
    lignes.push('');
    lignes.push('VOS COORDONNÉES SUR LE CV QUE VOUS ENVERREZ', '');
    lignes.push('- Nom et prénom, code postal et ville, téléphone, e-mail.');
    lignes.push('- L’adresse complète : seulement si c’est un atout. Sinon, code postal et ville suffisent.');
    lignes.push('');
    lignes.push('Le jour de l’entretien : une tenue sobre et adaptée au métier visé va dans le même sens que ce que dit votre CV.');
    return lignes.join('\n');
  }

  function vueFicheBrancher() {
    var z = document.getElementById('rrContenu');
    if (!z) { return; }
    z.querySelectorAll('[data-rr-aller]').forEach(function (b) {
      b.addEventListener('click', function () { afficherVue(this.dataset.rrAller); });
    });
    if (typeof reperesBrancherBoutonAncre === 'function') { reperesBrancherBoutonAncre(); }

    var btnImprimer = document.getElementById('rrBtnImprimer');
    if (btnImprimer) {
      btnImprimer.addEventListener('click', function () {
        _rrTrack('regard_recruteur_fiche_imprimee');
        window.print();
      });
    }
    var btnCopier = document.getElementById('rrBtnCopier');
    if (btnCopier && typeof copierTexteVersPressePapier === 'function') {
      btnCopier.addEventListener('click', function () {
        _rrTrack('regard_recruteur_fiche_copiee');
        copierTexteVersPressePapier(_rrTexteFiche(), btnCopier);
      });
    }
    var btnTel = document.getElementById('rrBtnTelecharger');
    if (btnTel) {
      btnTel.addEventListener('click', function () {
        _rrTrack('regard_recruteur_fiche_telechargee');
        var corps = _rrEchapTexte(_rrTexteFiche()).replace(/\n/g, '<br>');
        var html = '<html><head><meta charset="utf-8"><title>Un regard sur mon CV : ma fiche</title></head><body style="font-family:Calibri,Arial,sans-serif;font-size:12pt;">' + corps + '</body></html>';
        var blob = new Blob(['﻿', html], { type: 'application/msword' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'regard-recruteur-ma-fiche.doc';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      });
    }
  }

  // ------------------------------------------------------------------
  // Chrome commun + dispatch
  // ------------------------------------------------------------------
  function contenuVue(vue) {
    switch (vue) {
      case 'preparer': return vuePreparerHTML();
      case 'masquer': return vueMasquerHTML();
      case 'choix-assistant': return vueChoixAssistantHTML();
      case 'coller': return vueCollerHTML();
      case 'erreur-lecture': return vueCollerHTML();
      case 'regard': return vueRegardHTML();
      case 'fiche': return vueFicheHTML();
      default: return '';
    }
  }
  function brancherVue(vue) {
    switch (vue) {
      case 'preparer': return vuePreparerBrancher();
      case 'masquer': return vueMasquerBrancher();
      case 'choix-assistant': return vueChoixAssistantBrancher();
      case 'coller': return vueCollerBrancher();
      case 'erreur-lecture': return vueCollerBrancher();
      case 'regard': return vueRegardBrancher();
      case 'fiche': return vueFicheBrancher();
    }
  }

  var _vueRendue = null;

  function afficherVue(vue) {
    if (vue === 'chez') { vue = 'coller'; }
    _regardRecruteurInscrireHistorique();
    if (RR_VUES.indexOf(vue) === -1) { vue = etat.vue || 'preparer'; }
    var memeVue = (vue === _vueRendue);
    _vueRendue = vue;
    etat.vue = vue;

    // Re-rendu de la meme vue (ajout d'image, case cochee...) : on garde la
    // position. Vraie navigation entre vues : on remonte en haut.
    var scrollCible = memeVue ? (window.scrollY || window.pageYOffset || 0) : 0;
    var idxEtape = _regardRecruteurRenduVue ? _rrEtapeIndex(vue) : -1;
    var reprise = _regardRecruteurReprisePendante;

    var noteHtml = (typeof noteRevoirModuleDejaVue === 'function' && !noteRevoirModuleDejaVue() && !reprise)
      ? '<div class="note-revoir-module" id="noteRevoirModule" style="margin-left:0;">' +
        '<span>Ce bouton vous ramène à la page qui explique ce module. Vous ne perdez rien.</span>' +
        '<button type="button" aria-label="J’ai compris" data-fermer-note-revoir>&#10005;</button></div>'
      : '';
    var bouton = '<div><button type="button" id="rrBtnRevoirPresentation" class="btn-revoir-module"' +
      (reprise ? ' disabled' : '') + '><i class="bi bi-image"></i> Revoir la présentation</button></div>' + noteHtml;
    var encart = reprise
      ? htmlEncartRepriseModule({ idContinuer: 'rrBtnRepriseContinuer', idRecommencer: 'rrBtnRepriseRecommencer', pulse: true, texte: 'Vous avez une lecture en cours sur ce module.' })
      : '';

    // TACHE (retour utilisateur 2026-09-17, coherence inter-modules) : barre
    // d'etapes AVANT le titre (comme co-lettre/prepa-entretien et tous les
    // autres modules routes) -- inversee jusqu'ici. Titre remis a la taille
    // normale (2.8rem, h1 global) : le style inline font-size:1.5rem le
    // retrecissait de moitie sur cet ecran alors que la page d'introduction
    // du meme module garde le titre normal.
    app.innerHTML =
      '<div class="page-catalogue-contenu regard-recruteur-parcours">' +
      (typeof barreEtapesModule === 'function' ? barreEtapesModule(RR_ETAPES, idxEtape) : '') +
      (typeof htmlBandeRepriseModule === 'function' ? htmlBandeRepriseModule(bouton, encart) : bouton + encart) +
      htmlTitreEtapeModule('bi-image', 'Un regard sur mon CV', RR_TITRES[vue] || '') +
      '<div id="rrContenu">' + contenuVue(vue) + '</div>' +
      '</div>' +
      '<div class="barre-navigation-fixe">' +
      (typeof barreNavigation === 'function' ? barreNavigation('cv', null, null, { onclickPrecedent: 'regardRecruteurRetour()', terminerParcours: vue === 'fiche', onclickTerminer: 'terminerParcoursSansFenetre()' }) : '') +
      '</div>';

    // La fleche « Precedent » du navigateur retrouve cette vue (brique B.24).
    _regardRecruteurSynchroniserHistorique();

    window.scrollTo(0, scrollCible);

    if (typeof appliquerGelModule === 'function') { appliquerGelModule(reprise); }

    var btnRevoir = document.getElementById('rrBtnRevoirPresentation');
    if (btnRevoir) { btnRevoir.addEventListener('click', regardRecruteurRetourVersPresentation); }
    var btnReprC = document.getElementById('rrBtnRepriseContinuer');
    if (btnReprC) { btnReprC.addEventListener('click', regardRecruteurRepriseContinuer); }
    var btnReprR = document.getElementById('rrBtnRepriseRecommencer');
    if (btnReprR) {
      btnReprR.addEventListener('click', function () {
        if (typeof confirmerAction !== 'function') { return; }
        confirmerAction(
          'Recommencer « Un regard sur mon CV »&nbsp;?',
          'Votre image, la lecture reçue et vos réponses seront effacées. Vos autres modules et Mes Repères ne sont pas touchés.',
          'Recommencer ce module', 'btn-danger',
          function () {
            regardRecruteurReinitialiser();
            ouvrirRegardRecruteur();
            if (typeof naviguerVers === 'function') { naviguerVers('regard-recruteur'); }
          }
        );
      });
    }
    if (typeof armerFinPulseEncartReprise === 'function') { armerFinPulseEncartReprise(); }

    brancherVue(vue);

    if (typeof activerChampsStandardises === 'function') {
      var zc = document.getElementById('rrContenu');
      if (zc) { activerChampsStandardises(zc); }
    }
  }

  _regardRecruteurRenduVue = afficherVue;
  afficherVue(etat.vue);
}

// « Un regard sur mon CV : ... » sans balises pour les libelles de Repère /
// suivi d'usage.
function _rrTexteBrut(s) {
  return String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

// ---- Exposition Node / navigateur ------------------------------------
if (typeof window !== 'undefined') {
  window.pageRegardRecruteur = pageRegardRecruteur;
  window.ouvrirRegardRecruteur = ouvrirRegardRecruteur;
  window.regardRecruteurRetourVersPresentation = regardRecruteurRetourVersPresentation;
  window.regardRecruteurRetour = regardRecruteurRetour;
  window.regardRecruteurRevenirDeLaPresentation = regardRecruteurRevenirDeLaPresentation;
  window.regardRecruteurRepriseContinuer = regardRecruteurRepriseContinuer;
  window.regardRecruteurReinitialiser = regardRecruteurReinitialiser;
  window.regardRecruteurExporterEtatPourSauvegarde = regardRecruteurExporterEtatPourSauvegarde;
  window.regardRecruteurRestaurerEtatDepuisSauvegarde = regardRecruteurRestaurerEtatDepuisSauvegarde;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RR_ETAPES: RR_ETAPES,
    RR_VUES: RR_VUES,
    RR_QUESTIONS_GENERALES: RR_QUESTIONS_GENERALES,
    _rrEtapeIndex: _rrEtapeIndex,
    regardRecruteurEtatNeuf: regardRecruteurEtatNeuf,
    regardRecruteurExporterEtatPourSauvegarde: regardRecruteurExporterEtatPourSauvegarde,
    regardRecruteurRestaurerEtatDepuisSauvegarde: regardRecruteurRestaurerEtatDepuisSauvegarde,
    _rrTexteBrut: _rrTexteBrut
  };
}
