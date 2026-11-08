/* ============================================================
   modules/coherence-transversale/ui.js
   ------------------------------------------------------------
   Integration a l'application hote (js/app.js, data/metiers.js) --
   seul fichier de ce module qui connait l'existence de l'app hote.
   Reprend EXACTEMENT les conventions deja eprouvees du module Bilan de
   candidature (voir js/app.js, fonctions bilan*) : ouvrirFenetreERIP(),
   ouvrirFenetreAssistantIA(), htmlCollageUniquePage()/brancherCollageUniquePage(),
   barreNavigation(), trackEvenement(), accordeons <details>/<summary>,
   meme palette de couleurs (BILAN_COULEURS_RESTITUTION).

   Charge AVANT js/app.js (voir index.html) : les fonctions globales de
   l'app (ouvrirFenetreERIP, trackEvenement, routes...) ne sont donc pas
   encore definies au moment ou CE FICHIER s'execute -- sans consequence,
   elles ne sont appelees qu'a l'interieur de fonctions, jamais au
   chargement. `routes['coherence-transversale']` est branche depuis
   js/app.js lui-meme (un seul point de couplage necessaire), pas ici.
   ============================================================ */

// ---------- Entree depuis la Boite a outils ----------

// TACHE (navigation CV -> Bilan -> retour ici, 2026-08-25, DECISION DE
// DENIS) : meme mecanisme Reprendre/Recommencer que demarrerBilanCandidature()
// (data/metiers.js) -- sans lui, revenir de la redirection vers le Bilan
// forcerait la personne a tout redeposer depuis zero.
// TACHE (page "Vue d'ensemble" evolutive, 2026-08-25, DECISION DE DENIS) :
// ne declenche plus directement la collecte -- navigue vers la route, qui
// affiche desormais un ecran d'explication (ctHtmlExplication()) tant
// qu'aucun dossier n'existe, avec son propre bouton "Je commence".
function ctDemarrer() {
  if (typeof trackEvenement === 'function') { trackEvenement('coherence_transversale_ouvert'); }
  // TACHE (chantier "bouton presentation", 2026-09-01, precisions Denis) :
  // plus de boite de dialogue au clic. Quand on REVIENT dans le module
  // (depuis l'accueil ou depuis un autre module) alors qu'une analyse est
  // engagee, on atterrit sur le dernier ecran, le module est GELE, et un
  // encart "Continuer / Recommencer" apparait (a droite, il pulse ~10 s).
  // Jamais pendant un simple aller-retour "Revoir la presentation" (detour).
  _ctVoirIntro = false;
  _ctReprisePendante = !!(ctObtenirDossier() || ctObtenirDiagnostic());
  naviguerVers('coherence-transversale');
}

// TACHE (transfert Coherence transversale -> Bilan, 2026-08-25, DECISION
// DE DENIS) : ecrit dans dossier.rechercheCandidature (structure partagee
// deja initialisee ailleurs dans l'app -- additif, jamais sa forme
// existante modifiee) -- seul canal par lequel entreprise/offre/site/type
// de structure deviennent retrouvables ailleurs dans l'app, notamment par
// le Bilan (hostDataAdapter.js, lireEntrepriseCiblee()/lireOffreEmploi()/
// lireTypeStructure()). N'ecrit jamais une valeur vide par-dessus une
// valeur deja memorisee.
// CORRECTIF (retour utilisateur, 2026-08-25) : entrepriseCiblee manquait
// ici -- seuls offre/site/type de structure etaient mirroires, le nom de
// l'entreprise saisi/modifie DANS ce module ne remontait jamais vers le
// Bilan (seule la valeur deja connue AVANT d'entrer dans ce module
// apparaissait, via la lecture partagee entrepriseCibleActuelle()).
function ctMemoriserCandidatureAppWide(valeurs) {
  if (typeof dossier === 'undefined') { return; }
  dossier.rechercheCandidature = dossier.rechercheCandidature || {};
  if (valeurs.entrepriseCiblee) { dossier.rechercheCandidature.entreprise = valeurs.entrepriseCiblee; }
  if (valeurs.offreEmploi) { dossier.rechercheCandidature.texteOffre = valeurs.offreEmploi; }
  if (valeurs.siteEntreprise) { dossier.rechercheCandidature.site = valeurs.siteEntreprise; }
  if (valeurs.typeStructure) { dossier.rechercheCandidature.typeStructure = valeurs.typeStructure; }
}

// ---------- Barre d'etapes (informative, jamais cliquable pour l'instant) ----------

// TACHE (barre d'etapes, 2026-08-25, DECISION DE DENIS) : purement
// informative -- aide a estimer "combien de chemin reste-t-il", utile en
// contexte de rendez-vous chronometre (creneau fixe, personne suivante en
// attente). Explicitement PAS un temps estime (trop variable d'une
// personne a l'autre pour etre honnete) -- seulement une position dans le
// parcours. 3 etats visuels : fait (pleine opacite), en cours (pleine
// opacite + accent), a venir (opacite reduite).
// TACHE (correction 2026-09-04, verification de fidelite demandee par
// Denis apres la dette B.4) : "Infos complementaires" retiree -- cette
// fenetre (ctOuvrirCollecteComplement) est une MODALE qui ne montre meme
// pas la barre, et ctEtapeCourante() ne pouvait de toute facon jamais la
// renvoyer comme etape en cours (elle survient tant que ctObtenirDossier()
// est encore faux, donc structurellement confondue avec "documents").
// "Entretien avance" ajoutee : les 3-4 ecrans "Aller plus loin : mon
// entretien" (ctHtmlEntretienAvanceCollecte/ctHtmlEtapeChoixIAEntretienAvance/
// ctHtmlEtapeImportIAEntretienAvance/ctHtmlRapportEntretienAvance, ajoutes le
// 2026-08-25) n'avaient AUCUNE etape correspondante -- la barre restait
// bloquee sur "Rapport" tout du long, comme si la personne n'avait pas
// avance dans une phase pourtant reelle et distincte.
var CT_ETAPES = [
  { id: 'documents', icone: '&#128196;', label: 'Préparer' },
  { id: 'assistant', icone: '&#128172;', label: 'Assistant' },
  { id: 'rapport', icone: '&#9989;', label: 'Résultat' },
  { id: 'entretien_avance', icone: '&#127919;', label: 'Entretien avancé' }
];

// Vrai des que la personne est engagee dans une des 4 ecrans "Aller plus
// loin : mon entretien" -- reprend EXACTEMENT les memes conditions que le
// dispatcher pageCoherenceTransversale() (_ctEtapeEntretienAvance en cours
// de collecte/choix, puis l'objet EntretienAvance du module tant qu'il
// n'est pas complet ou que son propre rapport n'a pas ete remplace par le
// rapport principal) -- jamais une 2e lecture divergente de cet etat.
function ctEnEntretienAvance() {
  if (_ctEtapeEntretienAvance === 'collecte' || _ctEtapeEntretienAvance === 'choix_ia') { return true; }
  var entretienAvance = ctObtenirEntretienAvance();
  if (!entretienAvance) { return false; }
  if (entretienAvance.statut !== 'complete') { return true; }
  return !_ctAfficherRapportPrincipal;
}

function ctEtapeCourante() {
  var dossierExistant = !!ctObtenirDossier();
  var diagnostic = ctObtenirDiagnostic();
  if (!dossierExistant) { return 'documents'; }
  // 28/10/2026 : choisir l'assistant et être chez l'assistant ne font plus qu'un repère, « Assistant » (comme le Bilan, l'ATS et le Regard).
  if (!diagnostic || diagnostic.statut !== 'complete') { return 'assistant'; }
  if (ctEnEntretienAvance()) { return 'entretien_avance'; }
  return 'rapport';
}

// TACHE (dette B.4, BRIQUES_COMMUNES.md, resorption, 2026-09-04) : le rendu
// (boucle etapes/chevrons/pastilles) est remplace par la fonction generique
// barreEtapesModule() (js/app.js), construite le 2026-08-31 a partir de ce
// meme motif visuel -- reprend deja telles quelles les classes
// .pastille-etape-action* / .chevron-etape-action, purement informatif
// (jamais de routeParIndex passe ici, donc jamais cliquable, comme avant --
// DECISION DE DENIS 2026-08-25 inchangee). La classe dediee
// .barre-etapes-bilan (proportions de la maquette validee) remplace le
// simple flex sans classe -- harmonisation voulue par cette dette, jamais
// un effet de bord a corriger.
function ctHtmlBarreEtapes() {
  var indexCourant = CT_ETAPES.map(function (e) { return e.id; }).indexOf(ctEtapeCourante());
  return barreEtapesModule(CT_ETAPES, indexCourant) + ctHtmlBandeReprise();
}

// TACHE (chantier "bouton presentation", 2026-09-01, description Denis) :
// juste SOUS la barre d'etapes (jamais au-dessus), une "bande" :
//  - a GAUCHE, a mi-distance entre la barre et le titre, LE bouton partage.
//    Il change de nom + de fonction : "Revoir la presentation" sur un ecran
//    du module, "Revenir au module" sur la presentation en detour.
//  - a DROITE, seulement quand _ctReprisePendante (on revient dans le
//    module apres etre passe par l'accueil / un autre module) : l'encart
//    "Continuer / Recommencer" qui pulse ~10 s. Jamais le mot "travail".
function ctHtmlBandeReprise() {
  var analyseEngagee = !!ctObtenirDossier() || !!ctObtenirDiagnostic();
  if (!analyseEngagee) { return ''; }
  var libelle = _ctVoirIntro ? 'Revenir au module' : 'Revoir la présentation';
  // Le texte de la note s'adapte au sens du bouton : sur un ecran de
  // travail il annonce le retour vers la presentation, sur la presentation
  // il annonce le retour a l'endroit ou on en etait.
  var texteNote = _ctVoirIntro
    ? 'Ce bouton vous ramène à l’endroit où vous en étiez dans le module. Vous ne perdez rien.'
    : 'Ce bouton vous ramène à la page qui explique ce module. Vous ne perdez rien.';
  // Tant que la reprise n'est pas tranchee, le bouton du haut est gele lui
  // aussi (le seul choix possible est "Continuer" ou "Recommencer").
  var bouton = '<div><button type="button" id="btnCoherenceRevoirPresentation" class="btn-revoir-module"' +
    (_ctReprisePendante ? ' disabled' : '') + '>' +
    '<i class="bi bi-check2-circle"></i> ' + libelle + '</button></div>' +
    ((typeof noteRevoirModuleDejaVue === 'function' && !noteRevoirModuleDejaVue() && !_ctReprisePendante)
      ? '<div class="note-revoir-module" id="noteRevoirModule" style="margin-left:0;">' +
        '<span>' + texteNote + '</span>' +
        '<button type="button" aria-label="J’ai compris" data-fermer-note-revoir>&#10005;</button>' +
        '</div>'
      : '');
  var encart = _ctReprisePendante
    ? htmlEncartRepriseModule({
        idContinuer: 'ctRepriseContinuer',
        idRecommencer: 'ctRepriseRecommencer',
        pulse: true
      })
    : '';
  return htmlBandeRepriseModule(bouton, encart);
}

// ---------- Ecran d'explication (etat 1 de la page "Vue d'ensemble") ----------

// `detour` : true quand on arrive ici par "Revoir la presentation" depuis un
// ecran du module (consultation). Le bouton "Revenir au module" (haut, via
// la bande de ctHtmlBarreEtapes ; bas, ci-dessous) ramene au travail.
// L'encart "Continuer / Recommencer" n'est PAS ici : il vit sur l'ecran de
// travail quand _ctReprisePendante (retour dans le module via l'accueil).
// TACHE (dette B.5, BRIQUES_COMMUNES.md, resorption, 2026-09-04) : le rendu
// est desormais porte par htmlPageIntroModule(config) (js/app.js), commun
// avec htmlBilanIntro() -- ctHtmlExplication() ne fournit plus que son
// texte et son ordre de sections (y compris "Ce qu'on va vous demander",
// propre a Coherence, jamais un emplacement fixe suppose commun aux 2
// modules). Aucune fonction cablee touchee (bouton "Je commence", dispatch
// inchanges).
// TACHE (retour Denis, 2026-09-04) : la barre d'etapes visuelle
// (ctHtmlBarreEtapes) ne s'affiche plus ici -- une page d'introduction
// n'est pas un ecran de travail, elle porte deja assez d'information.
// La bande de reprise (bouton "Revenir au module" + encart "Continuer /
// Recommencer") reste seule : c'est elle qui compte sur cette page,
// jamais la barre.
function ctHtmlExplication(detour) {
  return htmlPageIntroModule({
    boutonHautHTML: ctHtmlBandeReprise(),
    icone: 'bi-check2-circle',
    video: 'coherence',
    titre: 'Cohérence de mon dossier',
    sousTitre: 'Vérifier que votre CV, votre lettre de motivation et votre préparation d’entretien d’embauche racontent la même histoire.',
    sections: [
      { fond: true, centre: true, corpsHTML:
        '<p class="mb-0"><strong>Vos documents ne sont pas mis en concurrence.</strong> Comparer votre CV, votre lettre et votre préparation d’entretien, ce n’est pas chercher une faute : c’est vérifier qu’ils se répondent, et ajuster ce qui mérite de l’être.</p>' },
      { corpsHTML:
        '<h4>&#127919; À quoi ça sert ?</h4>' +
        '<p class="mb-0">Un recruteur lit votre CV, votre lettre, puis vous rencontre en entretien, dans cet ordre ou dans le désordre. Si ces documents se contredisent (un métier différent, une expérience oubliée, un ton qui change), ça peut semer le doute. Ce module compare vos documents entre eux, et avec l’offre visée si vous en avez une, pour repérer ce qui est cohérent et ce qui mérite d’être ajusté.</p>' },
      { corpsHTML:
        '<h4>&#128203; Ce qu’on va vous demander</h4>' +
        '<p class="mb-0">Votre CV et votre lettre de motivation (obligatoires), votre préparation d’entretien d’embauche si vous en avez une (à compléter), et si vous le souhaitez : l’offre visée, l’entreprise, ou une question précise. Chaque document peut être déposé en fichier ou collé directement en texte.</p>' },
      { corpsHTML:
        '<h4>&#128221; Ce qui va se passer</h4>' +
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Vous rassemblez votre CV et votre lettre de motivation, et votre préparation d’entretien d’embauche si vous en avez une. Vous les relisez.</li>' +
        '<li>Vous les copiez et vous les collez sur le site d’un assistant en ligne de votre choix (ChatGPT, Claude, Gemini...). Il les lit ensemble et les compare à l’offre visée si vous en indiquez une.</li>' +
        '<li>Vous rapportez sa réponse ici. L’application vous guide à chaque étape.</li>' +
        '<li>Un rapport s’affiche. Il montre, point par point, ce qui concorde et ce qui diverge, avec une piste concrète pour chaque écart. Il reste modifiable : vous pouvez relancer l’analyse.</li>' +
        '</ul>' +
        '<details style="margin-top:0.6rem;"><summary style="cursor:pointer;">En savoir plus sur ce qui est comparé</summary>' +
        '<p class="text-muted small mt-2 mb-0">Le métier et le projet mis en avant, les expériences citées d’un document à l’autre, les dates et la chronologie, les compétences réellement présentes partout, et le ton employé. Un écart n’est pas une erreur : c’est un endroit où vos documents racontent l’histoire un peu différemment.</p></details>' },
      { corpsHTML:
        '<h4>&#128683; Ce que ce module ne fait pas</h4>' +
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Il ne réécrit pas vos documents à votre place : il signale ce qui accroche, vous gardez la main sur chaque correction.</li>' +
        '<li>Ce n’est pas une note ni un jugement sur votre dossier : on repère des écarts, pas des fautes.</li>' +
        '<li>Il ne juge pas chaque document pris tout seul (l’orthographe de la lettre, la mise en page du CV) : il regarde ce qu’ils disent les uns par rapport aux autres.</li>' +
        '<li>Quand deux documents divergent, il ne décide pas à votre place lequel a raison : c’est vous qui choisissez lequel ajuster.</li>' +
        '</ul>' },
      { corpsHTML:
        '<h4>&#9999;&#65039; Ce que vous pourrez faire ensuite</h4>' +
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Un rapport clair : ce qui concorde, ce qui diverge, et des pistes concrètes pour rapprocher vos documents.</li>' +
        '<li>Vous retrouvez chaque document sur une seule page, <strong>modifiable directement</strong>, à côté de la candidature visée (entreprise, offre, type de structure).</li>' +
        '<li>Vous pouvez <strong>relancer l’analyse</strong> à tout moment sur vos versions corrigées.</li>' +
        '</ul>' },
      { fond: true, corpsHTML:
        '<h4><i class="bi bi-bookmark-star"></i> Mes Repères</h4>' +
        '<p class="mb-0">Depuis le rapport, vous pouvez garder un constat ou une recommandation comme <strong>Repère</strong> : un point mis de côté pour y revenir (une question, un sujet à creuser, quelque chose à discuter avec la personne qui vous accompagne). Vous le retrouvez ensuite dans <strong>Mes Repères</strong>, un espace à vous, jamais jugé, accessible depuis n’importe où dans l’application.</p>' },
      { corpsHTML:
        '<h4>&#128274; Vos informations personnelles</h4>' +
        '<p class="mb-0">Avant l’envoi, vous relisez chaque document et vous <strong>masquez vous-même</strong> ce qui ne doit pas partir (nom, téléphone, courriel). L’analyse se fait sur des documents anonymisés : vos informations personnelles ne sont pas prises en compte.</p>' }
    ],
    // TACHE (chantier "bouton presentation", 2026-09-01) : le bouton du bas
    // change de sens -- 1re visite = "Je commence" ; on est en detour sur la
    // presentation = "Revenir au module" (meme fonction que le bouton du
    // haut et que "Retour").
    boutonBasClasse: 'text-center mt-3',
    boutonBasHTML: (detour || !!ctObtenirDossier() || !!ctObtenirDiagnostic())
      ? '<button type="button" id="ctBoutonRevenirModule" class="btn btn-primary btn-lg">Revenir au module &#8594;</button>'
      : '<button type="button" id="ctBoutonJeCommence" class="btn btn-primary btn-lg">Je commence &#8594;</button>',
    // TACHE (retour Denis, 2026-08-31) : "Retour" de la presentation du
    // module ramene a sa carte de l'accueil ("Outils d'analyse"), jamais a
    // l'accueil nu. TACHE (chantier "bouton presentation", 2026-09-01) :
    // en mode detour (analyse en cours), "Retour" revient au module.
    onclickPrecedent: detour ? 'ctFermerDetourIntro()' : "retourVersCarteAccueil('analyse')"
  });
}

// ---------- Ecran de collecte (remplace la cascade de 4 fenetres) ----------

// TACHE (dette B.1, chantier "elimination des fenetres de depot CV",
// docs/CHANTIER_ELIMINATION_FENETRES_DEPOT_CV.md, module 2 sur 3,
// 2026-09-04) : ctDemarrerCollecte() -> ctOuvrirCollecteComplement()
// enchainait 4 fenetres modales independantes (CV, lettre, entretien
// facultatif, offre/entreprise/questions) avant d'atteindre le vrai
// contenu du module. Remplace par UNE page (meme langage visuel que le
// Bloc 1-4 de la page "Preparer" depliante, .bilan-preparer reutilisee) :
// 4 blocs depliants, chacun rempli independamment. obtenirOuDeposerTexteCV()/
// ctObtenirOuDeposerTexteLettre()/ctObtenirOuDeposerTexteEntretien()
// restent INCHANGEES (elles verifient deja un texte existant avant
// d'ouvrir quoi que ce soit, et n'ouvrent alors qu'UNE SEULE fenetre
// auto-refermee -- ce n'est pas ca le probleme). ouvrirFenetreAssistantIA()
// (choix d'assistant, deja une page) n'est pas concernee par ce module.
var _ctEnCollecte = false;
var _ctCollecteAffichee = false; // vrai tant que le dernier rendu du module etait la collecte
var _ctCollecteEtat = null; // { cv, lettre, entretien: {texte, dejaRelu} | null }

// "Retour" depuis l'ecran de collecte -> revient a la presentation
// (aucun dossier n'existe encore a ce stade, rien d'autre a quoi revenir).
// Non destructif : _ctCollecteEtat n'est jamais efface ici, un "Je
// commence" ulterieur retrouve exactement ce qui etait deja rempli.
function ctRetourDepuisCollecte() {
  _ctEnCollecte = false;
  pageCoherenceTransversale();
}

// Depot EN PAGE (brique htmlDepotCVEnPage, data/metiers.js, consigne 28, 30/10/2026) : le CV, la lettre et la preparation d'entretien ont chacun leur zone
// dans leur bloc (suffixe d'identifiants -cv, -lettre, -entretien). Plus de fenetre de depot ni de fenetre de relecture : un document n'est range
// qu'une fois relu et enregistre (dejaRelu toujours vrai), donc ctDeposerDossier() n'ouvre plus aucune relecture au moment de continuer.
var CT_CLES_DEPOT = ['ctCv', 'ctLettre', 'ctEntretien', 'ctModif'];
function _ctReinitialiserDepots() {
  if (typeof reinitialiserDepotCVEnPage !== 'function') { return; }
  CT_CLES_DEPOT.forEach(function (cle) { reinitialiserDepotCVEnPage(cle); });
}
// Une seule zone a la fois peut etre en lecture ou en relecture (le texte a relire a des identifiants fixes) : si une autre l'etait, elle est abandonnee.
function _ctDepotRerender(cle, rendre) {
  var p = (typeof _depotPages !== 'undefined') ? _depotPages[cle] : null;
  if (p && (p.phase === 'lecture' || p.phase === 'relecture')) {
    CT_CLES_DEPOT.forEach(function (autre) { if (autre !== cle) { reinitialiserDepotCVEnPage(autre); } });
  }
  rendre();
}
function _ctDepotCfg(champ) {
  var etat = _ctCollecteEtat;
  var def = {
    cv: { cle: 'ctCv', suffixeId: '-cv', titreDocument: 'CV', avecIdentite: true, nomARelire: 'CV déjà dans l’application', raccourciLibelle: 'Utiliser mon CV déjà dans l’application' },
    lettre: { cle: 'ctLettre', suffixeId: '-lettre', titreDocument: 'Lettre de motivation', avecIdentite: false, ecrireCV: false, nomARelire: 'lettre déjà dans l’application', raccourciLibelle: 'Utiliser ma lettre déjà dans l’application' },
    entretien: { cle: 'ctEntretien', suffixeId: '-entretien', titreDocument: 'Préparation d’entretien d’embauche', avecIdentite: false, ecrireCV: false, nomARelire: 'préparation déjà dans l’application', raccourciLibelle: 'Utiliser ma préparation d’entretien déjà dans l’application',
      intro: 'Si vous avez déjà préparé un entretien (texte, ou photo d’une synthèse imprimée), déposez-le ici. Sinon, cliquez sur « Je n’en ai pas » : ce n’est pas obligatoire.' }
  }[champ];
  var doc = etat[champ];
  var present = !!(doc && doc.texte);
  var texteApp = '';
  if (!present) {
    if (champ === 'cv') {
      if (typeof cvDisponible === 'function' && cvDisponible()) {
        texteApp = (dossier.experiences && dossier.experiences.length && typeof texteProfilEffectif === 'function') ? texteProfilEffectif('cv') : (dossier.cvTexte || '');
      }
    } else {
      var lecteurs = ctLecteursParDefaut();
      texteApp = champ === 'lettre' ? lecteurs.lireLettreTexte() : lecteurs.lireEntretienTexte();
    }
    texteApp = String(texteApp || '').trim();
  }
  def.fait = present;
  def.nomFait = (doc && doc.nomFichier) || '';
  def.texteFait = present ? doc.texte : '';
  def.raccourciTexte = texteApp;
  def.rerender = function () { _ctDepotRerender(def.cle, ctHtmlCollecte); };
  def.onDocumentPrepare = function (res) {
    if (res && res.type === 'texte' && res.valeur && _ctCollecteEtat) {
      _ctCollecteEtat[champ] = { texte: res.valeur, dejaRelu: true, fichier: res.fichier || null, nomFichier: res.nomFichier || '' };
    }
    ctHtmlCollecte();
  };
  return def;
}

function ctHtmlCollecte() {
  var etat = _ctCollecteEtat;
  var cvPresent = !!(etat.cv && etat.cv.texte);
  var lettrePresente = !!(etat.lettre && etat.lettre.texte);
  var entretienTraite = etat.entretien !== null; // deja depose OU explicitement passe
  var entretienPresent = !!(etat.entretien && etat.entretien.texte);
  var peutContinuer = cvPresent && lettrePresente;

  function blocDocument(numero, id, titre, obligatoire, present, corpsSiVide, corpsSiPresent, ouvert) {
    return '<details class="bloc-depli' + (present ? ' bd-ok' : '') + '" id="' + id + '"' + (ouvert ? ' open' : '') + '>' +
      '<summary><span class="preparer-num">' + numero + '</span><span class="preparer-titre">' + titre + '</span>' +
      (obligatoire ? '' : '<span class="preparer-oblig">à compléter</span>') +
      '<span class="pilule-etat ' + (present ? 'pe-ok">Déposé' : 'pe-attente">À déposer') + '</span></summary>' +
      '<div class="bloc-depli-corps">' + (present ? corpsSiPresent : corpsSiVide) + '</div></details>';
  }

  var htmlDepotCv = typeof htmlDepotCVEnPage === 'function' ? htmlDepotCVEnPage(_ctDepotCfg('cv')) : '';
  var htmlDepotLettre = typeof htmlDepotCVEnPage === 'function' ? htmlDepotCVEnPage(_ctDepotCfg('lettre')) : '';
  var htmlDepotEntretien = typeof htmlDepotCVEnPage === 'function' ? htmlDepotCVEnPage(_ctDepotCfg('entretien')) : '';

  var bloc1 = blocDocument(1, 'ctCollecteBlocCv', 'Votre CV', true, cvPresent, htmlDepotCv, htmlDepotCv,
    ouvertBlocDepliManuel(etat, 'blocCv', !cvPresent));

  var bloc2 = blocDocument(2, 'ctCollecteBlocLettre', 'Votre lettre de motivation', true, lettrePresente, htmlDepotLettre, htmlDepotLettre,
    ouvertBlocDepliManuel(etat, 'blocLettre', cvPresent && !lettrePresente));

  // TACHE (Paquet B, decision de Denis 2026-09-26) : "open" ne se recalcule
  // plus depuis la completion a chaque rendu (fermeture automatique bannie) --
  // voir ouvertBlocDepliManuel()/cablerBlocDepliManuel() (data/metiers.js).
  var bloc3 = '<details class="bloc-depli' + (entretienTraite ? ' bd-ok' : '') + '" id="ctCollecteBlocEntretien"' + (ouvertBlocDepliManuel(etat, 'blocEntretien', cvPresent && lettrePresente && !entretienTraite) ? ' open' : '') + '>' +
    '<summary><span class="preparer-num">3</span><span class="preparer-titre">Votre préparation d’entretien d’embauche</span>' +
    '<span class="preparer-oblig">à compléter</span>' +
    '<span class="pilule-etat ' + (entretienPresent ? 'pe-ok">Déposée' : entretienTraite ? 'pe-info">Non fournie' : 'pe-attente">À déposer') + '</span></summary>' +
    '<div class="bloc-depli-corps">' +
    htmlDepotEntretien +
    // La personne garde la main pour changer d'avis dans les deux sens : une fois « Je n'en ai pas » choisi, ce bouton devient l'option active (plein).
    (entretienPresent ? '' : '<div class="mt-2"><button type="button" id="btnCtCollecteSansEntretien" class="btn btn-sm ' + (entretienTraite ? 'btn-primary' : 'btn-outline-secondary') + '">Je n’en ai pas</button></div>') +
    '</div></details>';

  // TACHE (panneau Candidature partage, 2026-09-29, DECISION DE DENIS) :
  // situation + metier ou domaine vise + offre/entreprise/site/type de
  // structure, avec le MEME panneau que « Votre objectif » (briques
  // partagees de js/app.js), sans « Le poste que vous recherchez » ni
  // civilite/couleur (aucun effet sur cette analyse). Les donnees vont
  // directement dans les champs globaux, relus au lancement par
  // hostDataAdapter.js. Voir docs/CHANTIER_PANNEAU_CANDIDATURE_PAR_MODULE_2026-09-29.md.
  if (typeof amorcerPanneauCandidaturePartage === 'function') { amorcerPanneauCandidaturePartage(etat); }
  var situationConnue = !!(typeof dossier !== 'undefined' && dossier.objectif);
  var bloc4 = '<details class="bloc-depli' + (situationConnue ? ' bd-ok' : '') + '" id="ctCollecteBlocOffre"' + (ouvertBlocDepliManuel(etat, 'blocOffre', true) ? ' open' : '') + '>' +
    '<summary><span class="preparer-num">4</span><span class="preparer-titre">Votre situation et l’offre visée</span>' +
    '<span class="preparer-oblig">à compléter</span>' +
    '<span class="pilule-etat pe-info">À compléter &middot; conseillé si vous l’avez</span></summary>' +
    '<div class="bloc-depli-corps">' +
    '<p>Cela permet de juger vos documents par rapport à ce que vous visez : un changement de métier, par exemple, n’est pas une incohérence. Si vous avez une offre, le métier peut rester vide : l’offre suffit. Sans réponse, l’analyse se fait sur vos seuls documents.</p>' +
    htmlCartesSituationPartagees('data-ct-situation') +
    '<p class="preparer-detail">Cette information est réutilisée ailleurs dans l’application (elle a pu être renseignée pendant un autre parcours).</p>' +
    '<div class="mt-3 pt-3" style="border-top:1px solid var(--border);">' +
    // Lot 4a (25/10/2026) : le composant « Votre candidature » de la lettre, tel quel (sans civilite ni couleur, que l'analyse ne lit pas).
    (dossier.objectif && typeof htmlCandidatureComposant === 'function' ? '<div id="ctComposantCandidature">' + htmlCandidatureComposant({ sansCiviliteCouleur: true }) + '</div>' : '') +
    '</div>' +
    '<p class="small text-muted mb-3">&#128247; Vous avez seulement une photo de l’offre ? Envoyez-la directement à votre assistant habituel (il sait lire une image), demandez-lui de vous en recopier le texte, puis collez ce texte ici.</p>' +
    '<h4 class="h6">&#128172; Une question ou une demande précise ? <span class="text-muted small">(à compléter)</span></h4>' +
    '<p class="text-muted small mb-2">Par exemple : « Ai-je assez insisté sur mon autonomie ? », « J’aimerais plus d’ambition dans mes phrases », « Où pourrais-je mettre en avant mes résultats ? ».</p>' +
    '<textarea id="ctChampQuestions" class="form-control mb-2" rows="3" placeholder="Vos questions ou demandes, une par ligne...">' + (etat.questionsPersonne ? echapperAttribut(etat.questionsPersonne) : '') + '</textarea>' +
    htmlAstuceDictee('encart', '&#127908; <strong>Aide à la rédaction</strong> : vous pouvez dicter ce texte au lieu de le taper.') +
    '</div></details>';

  var html = htmlTitreEtapeModule('bi-check2-circle', 'Cohérence de mon dossier', 'Collecter les informations', 'CV et lettre de motivation sont obligatoires, le reste est à compléter.') +
    '<div id="ctErreurCollecte" class="small mb-3" style="display:none;color:var(--danger);"></div>' +
    bloc1 + (typeof htmlLiaisonBlocs === 'function' ? htmlLiaisonBlocs('L’analyse compare vos documents entre eux : ce que dit le CV doit se retrouver dans la lettre. Vous déposez donc maintenant la lettre.') : '') +
    bloc2 + (typeof htmlLiaisonBlocs === 'function' ? htmlLiaisonBlocs('Si vous avez déjà préparé votre entretien, l’analyse vérifie aussi que ce que vous comptez dire à l’oral va dans le même sens que vos documents.') : '') +
    bloc3 + (typeof htmlLiaisonBlocs === 'function' ? htmlLiaisonBlocs('Il reste à dire ce que vous visez, puis vous pourrez lancer l’analyse.') : '') +
    bloc4 +
    '<div class="text-center" style="margin-top:1.4rem;" data-barre-bas-zone>' +
    '<button type="button" id="btnCtCollecteContinuer" class="btn btn-primary btn-lg" data-barre-bas="1" data-barre-bas-message="Déposez d’abord votre CV et votre lettre pour lancer l’analyse."' + (peutContinuer ? '' : ' disabled') + '>Continuer &#8594;</button>' +
    '<p class="preparer-detail" style="margin-top:.5rem;">Ce bouton s’active une fois votre CV et votre lettre déposés.</p>' +
    '</div>';

  // TACHE (retour Denis 2026-09-18, "aucune barre de navigation") : cet
  // ecran (le tout premier du module, etape 'documents' de CT_ETAPES) etait
  // le seul de tout le module a ne jamais appeler ctHtmlBarreEtapes() -
  // tous les autres ecrans (choix IA, chez l'assistant, rapport...) l'ont
  // deja. Ajoutee ici, meme position (juste apres l'ouverture du conteneur)
  // et meme ordre que partout ailleurs dans l'app depuis la correction du
  // 2026-09-17/18 (barre d'etapes d'abord, bande de reprise ensuite -
  // ctHtmlBarreEtapes() les combine deja dans cet ordre).
  app.innerHTML = '<div class="page-catalogue-contenu bilan-preparer coherence-collecte">' +
    ctHtmlBarreEtapes() + html + '</div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: 'ctRetourDepuisCollecte()' }) + '</div>';
  ctBrancherCollecte();
  if (typeof trackEvenement === 'function') { trackEvenement('coherence_transversale_collecte_affichee'); }
}

function ctRendreCollecte() {
  if (!_ctCollecteEtat) { _ctCollecteEtat = { cv: null, lettre: null, entretien: null, questionsPersonne: null }; }
  ctHtmlCollecte();
}

function ctBrancherCollecte() {
  var etat = _ctCollecteEtat;

  // TACHE (Paquet B) : memorise tout clic manuel sur les 4 blocs numerotes.
  cablerBlocDepliManuel(etat, 'blocCv', 'ctCollecteBlocCv');
  cablerBlocDepliManuel(etat, 'blocLettre', 'ctCollecteBlocLettre');
  cablerBlocDepliManuel(etat, 'blocEntretien', 'ctCollecteBlocEntretien');
  cablerBlocDepliManuel(etat, 'blocOffre', 'ctCollecteBlocOffre');
  // Tant que le CV n'est pas depose et valide, les autres points sont
  // desactives (decision Denis 2026-09-29).
  // Deverrouillage progressif (Lot 5, 25/10/2026) : chaque partie reste visible mais grisee (regle de Denis du 30/10/2026) et s'active quand la precedente est remplie.
  // Partie 2 (lettre) : CV depose. Partie 3 (entretien) : lettre deposee. Partie 4 (situation) : entretien depose ou « je n'en ai pas ».
  var _cvOk = !!(etat.cv && etat.cv.texte);
  var _lettreOk = _cvOk && !!(etat.lettre && etat.lettre.texte);
  var _entretienFait = _lettreOk && !!etat.entretien;
  appliquerVerrouBlocs([
    { id: 'ctCollecteBlocLettre', actif: _cvOk, message: MSG_VERROU_CV_A_DEPOSER },
    { id: 'ctCollecteBlocEntretien', actif: _lettreOk, message: 'Déposez d’abord votre lettre de motivation (partie 2) : ce point s’active ensuite.' },
    { id: 'ctCollecteBlocOffre', actif: _entretienFait, message: 'Déposez d’abord votre préparation d’entretien, ou dites que vous n’en avez pas (partie 3) : ce point s’active ensuite.' }
  ]);

  // Les trois zones de depot (CV, lettre, preparation d'entretien) : depot, relecture et masquage EN PAGE.
  if (typeof cablerDepotCVEnPage === 'function') {
    cablerDepotCVEnPage(_ctDepotCfg('cv'));
    cablerDepotCVEnPage(_ctDepotCfg('lettre'));
    cablerDepotCVEnPage(_ctDepotCfg('entretien'));
  }

  var btnSansEntretien = document.getElementById('btnCtCollecteSansEntretien');
  if (btnSansEntretien) {
    btnSansEntretien.addEventListener('click', function () { etat.entretien = { texte: null, dejaRelu: false }; ctHtmlCollecte(); });
  }

  // Panneau Candidature partage (situation, metier/domaine, offre...) : ecrit
  // directement dans les champs globaux, aucune lecture a faire au lancement.
  if (typeof wireCartesSituationPartagees === 'function') {
    var objectifAvantCt = null;
    wireCartesSituationPartagees('data-ct-situation', etat, ctHtmlCollecte, function () {
      // Changer de carte entre offre, spontanee et changer de metier remet a zero la candidature saisie (meme regle que la lettre).
      if (changementCarteEffaceLettreCo(objectifAvantCt, dossier.objectif)) { _coLettreEffacerCandidature(); }
    }, function () { objectifAvantCt = dossier.objectif; });
    if (dossier.objectif) { wireCandidatureComposant(ctHtmlCollecte, 'ctComposantCandidature'); }
    else if (typeof invitationCartesObjectif === 'function') { invitationCartesObjectif(); }
  }
  var champQuestions = document.getElementById('ctChampQuestions');
  if (champQuestions) {
    champQuestions.addEventListener('input', function () { etat.questionsPersonne = champQuestions.value; });
  }

  var btnContinuer = document.getElementById('btnCtCollecteContinuer');
  if (btnContinuer) {
    btnContinuer.addEventListener('click', function () {
      if (btnContinuer.disabled || !etat.cv || !etat.lettre) { return; }
      // Offre, entreprise, site, type de structure, situation et cible visee :
      // relus dans les champs globaux du panneau par hostDataAdapter.js
      // (ctLireDonneesBrutes), jamais dans le DOM.
      var saisieLibre = {
        cv: etat.cv.texte,
        lettre: etat.lettre.texte,
        preparationEntretien: etat.entretien ? etat.entretien.texte : null,
        questionsPersonne: (champQuestions && champQuestions.value.trim()) || null
      };

      // (Memorisation app-wide de l'offre, de l'entreprise, du site et du type
      // de structure : plus necessaire ici, le panneau partage les ecrit deja
      // directement dans dossier.rechercheCandidature a chaque saisie.)

      if (typeof trackEvenement === 'function') { trackEvenement('coherence_transversale_depose'); }

      // ctDeposerDossier() ouvre lui-meme, en interne, les ecrans de
      // relecture confidentialite restants (jamais les documents deja
      // relus via le depot, voir dejaRelu ci-dessous) -- UNE seule fenetre
      // ponctuelle si besoin, jamais une cascade.
      ctDeposerDossier(saisieLibre, {
        collecte: {
          dejaRelu: { cv: etat.cv.dejaRelu, lettre: etat.lettre.dejaRelu, preparationEntretien: etat.entretien ? etat.entretien.dejaRelu : false }
        }
      }).then(function () {
        _ctEnCollecte = false;
        _ctCollecteEtat = null;
        _ctReinitialiserDepots();
        naviguerVers('coherence-transversale');
      }).catch(function (erreur) {
        // TACHE (comportement ameliore : l'ancienne fenetre se refermait
        // AVANT cet appel, une RelectureAnnulee laissait alors la
        // personne sur l'ecran precedent sans explication. Une page ne se
        // "ferme" jamais : on y reste simplement, rien a re-ouvrir.)
        if (erreur && erreur.code === 'RelectureAnnulee') { return; }
        var zoneErreur = document.getElementById('ctErreurCollecte');
        if (zoneErreur) {
          zoneErreur.style.display = 'block';
          zoneErreur.textContent = '⚠️ Une erreur est survenue, merci de réessayer.';
        }
      });
    });
  }
}

// ---------- Route (dispatcher, meme principe que pageBilanCandidature) ----------

// TACHE (entretien avance, Pass B, 2026-08-25, DECISION DE DENIS) : 3
// branches ajoutees, toujours APRES que le diagnostic principal soit
// complet -- l'entretien avance n'existe jamais avant ce point. Ordre de
// priorite : collecte/choix_ia (etat d'ecran local, voir plus haut) avant
// l'objet EntretienAvance du module (genere/complete), lui-meme avant le
// rapport principal par defaut.
function pageCoherenceTransversale() {
  var dossierExistant = !!ctObtenirDossier();
  var diagnostic = ctObtenirDiagnostic();
  var entretienAvance = ctObtenirEntretienAvance();
  var html;
  // TACHE (correctif boucle Retour, 2026-09-09) : "Retour" depuis
  // "Choisissez votre assistant" / le rapport -> presentation en mode
  // NORMAL (ctHtmlExplication(false), dont le "Retour" va a la carte
  // d'accueil). Consomme ici, une seule fois, avant meme le detour.
  var versAccueilNormal = _ctRetourAccueil;
  _ctRetourAccueil = false;
  if (versAccueilNormal) {
    app.innerHTML = ctHtmlExplication(false);
    ctBrancherEvenements(diagnostic, dossierExistant, entretienAvance);
    return;
  }
  // TACHE (chantier "bouton presentation", 2026-09-01) : detour "Revoir la
  // presentation" -- on affiche la page de presentation par-dessus le
  // travail en cours (non destructif). Le bandeau "Continuer / Recommencer"
  // de ctHtmlExplication() prend le relais.
  if (_ctVoirIntro && (dossierExistant || diagnostic)) {
    app.innerHTML = ctHtmlExplication(true);
    ctBrancherEvenements(diagnostic, dossierExistant, entretienAvance);
    return;
  }
  // TACHE (chantier "elimination des fenetres de depot CV", module 2/3,
  // 2026-09-04) : ecran de collecte (remplace ctDemarrerCollecte() /
  // ctOuvrirCollecteComplement()) -- ne peut exister qu'avant qu'un
  // dossier soit depose, jamais en meme temps qu'un diagnostic.
  // Auto-suffisant (mount + cablage), meme style que le detour ci-dessus.
  if (_ctEnCollecte && !dossierExistant && !diagnostic) {
    // Arrivee sur la collecte depuis la presentation : on repart en HAUT de
    // page. Depuis que les 4 blocs sont ouverts des l'arrivee, la page est
    // longue et gardait la position du bouton « Je commence » (en bas de la
    // presentation). Un re-rendu de la collecte elle-meme garde sa position.
    var _arriveeCollecte = !_ctCollecteAffichee;
    _ctCollecteAffichee = true;
    ctRendreCollecte();
    if (_arriveeCollecte) { window.scrollTo(0, 0); }
    return;
  }
  _ctCollecteAffichee = false;
  if (!dossierExistant && !diagnostic) {
    html = ctHtmlExplication(false);
  } else if (!diagnostic) {
    html = ctHtmlEtapeChoixIA();
  } else if (diagnostic.statut !== 'complete') {
    html = ctHtmlEtapeImportIA(diagnostic);
  } else if (_ctEtapeEntretienAvance === 'collecte') {
    html = ctHtmlEntretienAvanceCollecte();
  } else if (_ctEtapeEntretienAvance === 'choix_ia') {
    html = ctHtmlEtapeChoixIAEntretienAvance();
  } else if (entretienAvance && entretienAvance.statut !== 'complete') {
    html = ctHtmlEtapeImportIAEntretienAvance(entretienAvance);
  } else if (entretienAvance && entretienAvance.statut === 'complete' && !_ctAfficherRapportPrincipal) {
    html = ctHtmlRapportEntretienAvance(entretienAvance, diagnostic);
  } else {
    html = ctHtmlRapport(diagnostic);
  }
  app.innerHTML = html;
  // TACHE (chantier "bouton presentation", 2026-09-01) : quand on revient
  // dans le module avec une analyse en cours, tout est GELE tant que la
  // personne n'a pas tranche "Continuer / Recommencer" -- sauf l'encart
  // lui-meme et la barre du bas. Brique partagee (js/app.js).
  appliquerGelModule(_ctReprisePendante);
  ctBrancherEvenements(diagnostic, dossierExistant, entretienAvance);
}

// ---------- Ecran "Choisir l'assistant" ----------

// TACHE (dette B.2, BRIQUES_COMMUNES.md, resorption, 2026-09-04) : le rendu
// maison a couleurs codees en dur est remplace par le composant partage
// deja modernise du Bilan (htmlChoixAssistantBilanCorps(), js/app.js,
// meme fonction que Decouverte depuis le 2026-08-31). Corrige au passage
// un vrai bug de mode sombre (hex en dur). L'ancien systeme de clic pour
// reveler "Ce qui va se passer" disparait avec (les 4 temps sont deja
// tous visibles dans l'accordeon du composant partage) -- le cablage
// [data-etape-choixia-coherence] correspondant est retire plus bas
// (ctBrancherEvenements), plus aucun element ne le declenche.
function ctHtmlEtapeChoixIA() {
  return '<div class="page-catalogue-contenu">' +
    ctHtmlBarreEtapes() +
    htmlTitreEtapeModule('bi-check2-circle', 'Cohérence de mon dossier', 'Choisir l’assistant', 'Une analyse de l’ensemble de votre candidature par un assistant de votre choix.') +
    '<div class="cv-section coherence-etape-choix-ia">' +
    '<h4>&#128172; Choisissez votre assistant</h4>' +
    '<p class="text-muted small mb-3">Cliquez sur un assistant ci-dessous. L’application prépare et copie tout pour vous, puis ouvre l’assistant.</p>' +
    htmlChoixAssistantBilanCorps({
      idErreur: 'ctErreurChoixIA', attrAssistant: 'data-assistant-coherence',
      recapContexte: ['situation', 'cible', 'offre', 'entreprise', 'structure'],
      etapes: ETAPES_DETAIL_CHOIX_IA,
      texteConfidentialite: 'Rien n’est envoyé avant que vous ayez relu et validé vos documents.'
    }) +
    '</div></div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: 'ctRetour()' }) + '</div>';
}

// ---------- Ecran "Coller la reponse" ----------

function ctHtmlEtapeImportIA(diagnostic) {
  return '<div class="page-catalogue-contenu">' +
    ctHtmlBarreEtapes() +
    '<div id="ctEtapeImportIAAncre"></div>' +
    htmlTitreEtapeModule('bi-check2-circle', 'Cohérence de mon dossier', 'Coller la réponse') +
    '<div class="cv-section coherence-etape-import-ia">' +
    // Fenetre unique « Collez la reponse » (dette B.17, etape C, 2026-10-28) : voir htmlCollageUniquePage() (js/app.js).
    htmlCollageUniquePage('CoherenceTransversale') +
    '</div></div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: 'ctRevenirAuChoixIA()' }) + '</div>';
}

// TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS -- "le bouton
// retour m'envoie a l'accueil") : abandonne le diagnostic en cours
// (ctAnnulerDiagnostic() ne touche jamais un diagnostic deja complet, ni
// le dossier) et la transition en cours -- l'assistant a peut-etre deja
// ete ouvert dans un autre onglet, sans consequence, rien n'a encore ete
// importe. Revient au choix d'assistant, jamais l'accueil.
function ctRevenirAuChoixIA() {
  ctAnnulerDiagnostic();
  _etatTransitionIA = null;
  if (typeof _intervalleDecompteIA !== 'undefined' && _intervalleDecompteIA) { clearInterval(_intervalleDecompteIA); }
  pageCoherenceTransversale();
}

// ---------- Rapport ----------

// Meme palette que le Bilan (var(--success-*)/var(--danger-*), theme-aware
// mode sombre/daltonisme -- voir js/app.js, BILAN_COULEURS_RESTITUTION) --
// jamais une nouvelle palette inventee pour ce module (docs/LECONS_A_NE_PAS_REPRODUIRE.md).
var CT_COULEURS_NATURE = {
  force: { label: 'Point fort', bg: 'var(--success-bg-subtle)', border: 'var(--success-strong)', texte: 'var(--success-strong)' },
  alignement: { label: 'Bien aligné', bg: 'var(--success-bg-subtle)', border: 'var(--success-strong)', texte: 'var(--success-strong)' },
  // TACHE (audit robustesse, 2026-09-11) : couleurs codees en dur,
  // invisibles en mode sombre -- remplacees par les variables warning
  // deja theme-aware (css/style.css), meme principe que force/alignement
  // ci-dessus.
  absence: { label: 'À enrichir', bg: 'var(--warning-bg-subtle)', border: 'var(--warning-border)', texte: 'var(--warning-strong)' },
  incoherence: { label: 'Incohérence', bg: 'var(--danger-bg-subtle)', border: 'var(--danger)', texte: 'var(--danger)' },
  contradiction: { label: 'Contradiction', bg: 'var(--danger-bg-subtle)', border: 'var(--danger)', texte: 'var(--danger)' },
  duplication: { label: 'Duplication', bg: 'var(--danger-bg-subtle)', border: 'var(--danger)', texte: 'var(--danger)' }
};

function ctCouleurNature(nature) {
  return CT_COULEURS_NATURE[nature] || { label: nature || '', bg: 'var(--bg-subtle)', border: 'var(--border)', texte: 'var(--text-muted)' };
}

function ctBadgeCouleur(couleur) {
  return '<span class="badge" style="background:' + couleur.bg + ';color:' + couleur.texte +
    ';border:1px solid ' + couleur.border + ';font-weight:600;">' + echapperAttribut(couleur.label) + '</span>';
}

// TACHE (retour utilisateur, 2026-08-25 : "formulation" avec un f
// minuscule) : la dimension vient de l’assistant en texte libre, jamais garanti
// majuscule -- corrige a l'affichage plutot que de compter sur le prompt.
function ctMajusculePremiereLettre(texte) {
  if (!texte) { return texte; }
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

// TACHE (retour utilisateur, 2026-08-25 : "on ne sait pas quel document
// est concerne par un constat a corriger") : deduit du prefixe de chaque
// entree d'ancrage (ex. "cv.experience[0]" -> "cv"), jamais un nouveau
// champ demande a l’assistant -- ancrage existe deja pour ca.
function ctDocumentsDepuisAncrage(ancrage) {
  var labels = { cv: 'CV', lettre: 'Lettre de motivation', entretien: 'Préparation d’entretien d’embauche' };
  var trouves = [];
  (ancrage || []).forEach(function (a) {
    var prefixe = (a || '').split('.')[0];
    if (labels[prefixe] && trouves.indexOf(labels[prefixe]) === -1) { trouves.push(labels[prefixe]); }
  });
  return trouves;
}

// TACHE (repartition Recommandations lettre/CV + reperes, 2026-08-25,
// DECISION DE DENIS) : seule definition de "applicable ICI" (bouton
// "Appliquer a ma lettre de motivation") -- reutilisee par la carte de
// recommandation ET par la carte de constat (pour savoir si le repere
// est encore utile, voir plus bas), jamais deux definitions paralleles.
// TACHE (retour utilisateur, 2026-08-25 : "cliquez pour en savoir plus"
// manquant sur les accordeons de la rubrique "Ce que l'analyse montre"/
// "Recommandations") : meme motif EXACT que "Garder comme repere"/"Vos
// documents relus" (ces deux rectangles ont ete retires depuis, classe
// bilan-accordeon-invite partagee) -- jamais une variante.
// TACHE (retour utilisateur, 2026-08-25 : "ce n'est pas beau, les deux
// invites se retrouvent collees l'une a l'autre") : quand plusieurs
// details voisinent sur une meme ligne (buckets "Ce que l'analyse
// montre", flex-wrap), l'invite alignee a droite via margin-left:auto
// (motif de "Garder comme repere") se retrouve visuellement au milieu de
// la ligne, entre les deux titres -- illisible. Invite placee EN DESSOUS
// du titre a la place, jamais a droite, pour rester lisible quel que
// soit le nombre de details cote a cote.
// TACHE (retour utilisateur, 2026-08-25, rapport de l'entretien avance :
// "toutes ces rubriques vont etre fermees, mais ils vont avoir leur
// texte descriptif") : description optionnelle, affichee ENTRE le titre
// et l'invite -- retro-compatible avec tous les appels existants
// (2 arguments, aucune description) qui ne l'utilisent pas.
function ctHtmlEnTeteAccordeon(icone, titre, description) {
  return '<summary class="ct-resume-accordeon" style="cursor:pointer;">' +
    '<p class="fw-bold mb-0">' + icone + ' ' + titre + '</p>' +
    (description ? '<p class="text-muted small mb-1 mt-1">' + description + '</p>' : '') +
    '<p class="mb-1"><span class="bilan-accordeon-invite" style="font-weight:600;">Cliquez pour en savoir plus</span></p>' +
    '</summary>';
}

function ctRecommandationEstApplicableIci(reco) {
  return !!((reco.documentCible === 'lettre' || reco.documentCible === 'plusieurs') && reco.modeApplication !== 'conseil' && reco.textePropose);
}

// Bouton, jamais une ligne de texte cliquable (docs/LECONS_A_NE_PAS_REPRODUIRE.md) --
// carte non repliable individuellement (l'accordeon parent, par nature,
// suffit deja au controle de la quantite d'information affichee).
// aRecommandationApplicable : DECISION DE DENIS 2026-08-25 -- si ce
// constat a deja une recommandation actionnable liee, "Garder comme
// Repere" devient redondant (l'action elle-meme fait deja office de
// suivi) -- remplace par un message qui pointe vers la recommandation.
// Repere garde tout son sens sinon (constat sans correction possible ici,
// ex. un point fort).
function ctRendreCarteConstat(constat, aRecommandationApplicable) {
  var couleur = ctCouleurNature(constat.nature);
  var documents = ctDocumentsDepuisAncrage(constat.ancrage);
  var enTete = '<strong>' + echapperAttribut(ctMajusculePremiereLettre(constat.dimension) || 'Constat') + '</strong>' + ctBadgeCouleur(couleur);
  var corps = (documents.length ? '<p class="text-muted small mb-1 mt-2">' + documents.map(echapperAttribut).join(' + ') + '</p>' : '') +
    '<p class="mb-1' + (documents.length ? '' : ' mt-2') + '">' + echapperAttribut(constat.message) + '</p>' +
    (constat.preuve && constat.preuve.length
      ? '<p class="text-muted small mb-0">Extrait(s) concerné(s) : « ' + constat.preuve.map(echapperAttribut).join(' » / « ') + ' »</p>'
      : '') +
    (aRecommandationApplicable
      ? '<p class="text-muted small mb-0 mt-1">&#128161; Ce constat peut être amélioré grâce à la recommandation ci-dessous.</p>'
      : '');
  var actions = (!aRecommandationApplicable && typeof reperesBoutonAncre === 'function')
    ? reperesBoutonAncre({ libelle: 'Constat : ' + (constat.dimension || '') + ' (' + couleur.label + ')' })
    : '';
  return '<div style="border:1px solid ' + couleur.border + ';border-radius:10px;padding:0.75rem 1rem;margin-bottom:0.75rem;background:' + couleur.bg + ';">' +
    '<div class="d-flex justify-content-between align-items-center flex-wrap gap-2">' + enTete + '</div>' +
    corps +
    (actions ? '<div class="d-flex gap-2 flex-wrap mt-2">' + actions + '</div>' : '') +
    '</div>';
}

function ctLibelleDocumentCible(documentCible) {
  var labels = { cv: 'CV', lettre: 'Lettre de motivation', entretien: 'Préparation d’entretien d’embauche', plusieurs: 'Plusieurs documents' };
  return labels[documentCible] || documentCible;
}

// TACHE (correction directe CV/lettre, 2026-08-25, DECISION DE DENIS) :
// - CV -> ne corrige jamais directement ici (ce module n'ecrit jamais dans
//   les donnees du CV) : bouton vers le Bilan, avec le message de
//   persistance explicite (dossier reste en memoire, jamais rechargee sans
//   sauvegarde -- voir docs/CHANTIER_COHERENCE_TRANSVERSALE_SYNTHESE.md).
// - Lettre -> corrige reellement, en ecrivant dans dossier.ia.lettre (voir
//   ctAppliquerCorrectionLettre() plus bas), seul endroit ou ce texte est
//   deja lu par le reste de l'application.
// - Entretien -> conseil affiche seul, aucune action (chantier "entretien
//   avance", volontairement differe -- voir synthese).
// - 'plusieurs' -> montre les 2 actions pertinentes (CV et lettre), jamais
//   une tentative de fusion (decision de Denis : "plus simple, pas de
//   vraie perte").
function ctRendreCarteRecommandation(reco) {
  var peutCorrigerLettre = ctRecommandationEstApplicableIci(reco);
  var peutCorrigerCv = (reco.documentCible === 'cv' || reco.documentCible === 'plusieurs');

  var actions = '';
  if (peutCorrigerLettre) {
    actions += '<button type="button" class="btn btn-primary btn-sm" data-ct-appliquer-lettre="' + echapperAttribut(reco.id) + '">&#9997; Appliquer à ma lettre de motivation</button>';
  }
  if (peutCorrigerCv) {
    actions += '<button type="button" class="btn btn-outline-primary btn-sm" data-ct-corriger-cv="' + echapperAttribut(reco.id) + '">&#128202; Corriger dans l’analyse de candidature</button>';
  }
  // TACHE (reperes, 2026-08-25, DECISION DE DENIS) : repere UNIQUEMENT si
  // rien n'est directement actionnable ICI (peutCorrigerLettre false) --
  // sinon redondant, l'action elle-meme fait deja office de suivi. Une
  // recommandation CV (jamais actionnable ici, toujours envoyee vers le
  // Bilan) garde donc systematiquement son repere.
  if (!peutCorrigerLettre && typeof reperesBoutonAncre === 'function') {
    actions += reperesBoutonAncre({ libelle: 'Recommandation : ' + (reco.contenu || '') });
  }

  return '<div id="ct-reco-' + echapperAttribut(reco.id) + '" style="border:1px solid var(--accent);border-radius:10px;padding:0.75rem 1rem;margin-bottom:0.75rem;background:var(--accent-bg-subtle);">' +
    '<div class="d-flex justify-content-between align-items-center flex-wrap gap-2">' +
    '<span class="text-muted small">' + echapperAttribut(ctLibelleDocumentCible(reco.documentCible)) + '</span>' +
    '</div>' +
    '<p class="mb-1 mt-2">' + echapperAttribut(reco.contenu) + '</p>' +
    (reco.texteAncre ? '<p class="text-muted small mb-0">Passage concerné : « ' + echapperAttribut(reco.texteAncre) + ' »</p>' : '') +
    // TACHE (retour utilisateur, 2026-08-25 : "pourquoi certaines
    // recommandations affichent une Proposition sans bouton pour
    // l'appliquer") : le texte "Proposition :" ne doit JAMAIS s'afficher
    // pour une recommandation modeApplication='conseil' -- meme condition
    // que le bouton lui-meme (peutCorrigerLettre ci-dessus), pour ne
    // jamais montrer une proposition sans action possible. Cote prompt
    // (prompts/coherence-transversale.md), l’assistant est desormais instruite
    // de laisser textePropose vide pour un conseil -- ce garde-fou cote
    // affichage protege quand meme contre une reponse qui l'ignorerait.
    (reco.textePropose && reco.modeApplication !== 'conseil' ? '<p class="mb-0 mt-1"><strong>Proposition :</strong> ' + echapperAttribut(reco.textePropose) + '</p>' : '') +
    (actions ? '<div class="d-flex gap-2 flex-wrap mt-2" id="ct-reco-actions-' + echapperAttribut(reco.id) + '">' + actions + '</div>' : '') +
    (peutCorrigerCv
      ? '<p class="text-muted small mb-0 mt-2">&#128274; En allant dans l’analyse de candidature, vous quittez cette analyse de cohérence. Pour revenir : Boîte à outils → Cohérence de mon dossier → Reprendre mon analyse (tant que vous ne rechargez pas la page - sauvegardez votre session, icône disquette, si vous comptez revenir un autre jour).</p>'
      : '') +
    '</div>';
}

// Ecrit la correction dans dossier.ia.lettre.lettre.texte (et dans la
// version active de dossier.ia.lettre.versions si presente, pour rester
// coherent avec l'ecran "Co-construire ma lettre" qui les lit) -- SEUL
// endroit du module qui ecrit dans les donnees de l'app hote (toutes les
// autres fonctions de ui.js ne font que lire). Remplacement (texteAncre
// trouve tel quel dans le texte actuel) ou ajout (textePropose ajoute en
// fin de lettre) selon reco.modeApplication.
// TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS -- bug reel
// trouve et prouve en test : personne venue de l'exterieur, jamais cree
// sa lettre DANS l'application avant Coherence transversale) :
// dossier.ia.lettre.lettre.texte (le document reellement imprimable,
// app-wide) peut rester totalement vide meme quand DossierTransversal.lettre
// (la copie propre a ce module, deposee pour l'analyse) contient le
// texte complet -- les deux ne sont jamais synchronises ailleurs. Sans
// ce repli, "Appliquer" ecrasait le document imprimable avec UNIQUEMENT
// la phrase ajoutee, perdant tout le reste du texte reel de la personne.
// Ne comble QUE si le document imprimable est vide -- ne touche jamais a
// un texte deja existant (jamais un ecrasement d'un contenu reel par une
// copie potentiellement moins a jour).
function ctAppliquerCorrectionLettre(reco) {
  if (typeof dossier === 'undefined' || !dossier.ia || !dossier.ia.lettre || !dossier.ia.lettre.lettre) { return false; }
  var texteActuel = dossier.ia.lettre.lettre.texte || '';
  if (!texteActuel) {
    var dossierTransversal = typeof ctObtenirDossier === 'function' ? ctObtenirDossier() : null;
    texteActuel = (dossierTransversal && dossierTransversal.lettre) || '';
  }
  var nouveauTexte;
  if (reco.modeApplication === 'remplacement' && reco.texteAncre && texteActuel.indexOf(reco.texteAncre) !== -1) {
    nouveauTexte = texteActuel.replace(reco.texteAncre, reco.textePropose);
  } else {
    // ajout, ou remplacement dont le passage exact n'est plus retrouve
    // (texte deja modifie entre-temps) -- jamais une erreur bloquante,
    // meme principe de repli que la resilience deja prevue pour les
    // Constats (voir synthese du chantier).
    nouveauTexte = texteActuel.replace(/\s+$/, '') + '\n\n' + reco.textePropose;
  }
  dossier.ia.lettre.lettre.texte = nouveauTexte;
  if (dossier.ia.lettre.versions && dossier.ia.lettre.versions.length && typeof dossier.ia.lettre.versionActive === 'number') {
    var versionActive = dossier.ia.lettre.versions[dossier.ia.lettre.versionActive];
    if (versionActive) { versionActive.texte = nouveauTexte; }
  }
  return true;
}

// Chapitres/sous-chapitres en accordeons, ouverture au clic, personne
// libre de l'ordre de lecture (docs/LECONS_A_NE_PAS_REPRODUIRE.md,
// section 1) -- jamais un bloc de texte qui tombe d'un coup.
function ctHtmlRapport(diagnostic) {
  var resultat = diagnostic.resultat;
  var buckets = [
    { natures: ['force', 'alignement'], icone: '&#128994;', titre: 'Points forts' },
    { natures: ['absence'], icone: '&#128993;', titre: 'À enrichir' },
    { natures: ['incoherence', 'contradiction', 'duplication'], icone: '&#128308;', titre: 'À corriger' }
  ];

  var toutesRecommandations = resultat.recommandations || [];

  var htmlConstats = '<div class="cv-section" style="margin-bottom:1rem;">' +
    '<h4 class="mb-2">&#128203; Ce que l’analyse montre</h4>' +
    '<p class="text-muted small mb-3">Cliquez sur une catégorie pour voir le détail. Commencez par où vous préférez.</p>' +
    '<div style="display:flex;gap:1rem;flex-wrap:wrap;">' +
    buckets.map(function (bucket) {
      var constatsBucket = (resultat.constats || []).filter(function (c) { return bucket.natures.indexOf(c.nature) !== -1; });
      if (!constatsBucket.length) { return ''; }
      return '<details class="mb-2" style="flex:1 1 260px;min-width:220px;">' +
        ctHtmlEnTeteAccordeon(bucket.icone, bucket.titre + ' (' + constatsBucket.length + ')') +
        '<div class="mt-2">' + constatsBucket.map(function (constat) {
          var aRecommandationApplicable = toutesRecommandations.some(function (r) {
            return r.constatsLies && r.constatsLies.indexOf(constat.id) !== -1 && ctRecommandationEstApplicableIci(r);
          });
          return ctRendreCarteConstat(constat, aRecommandationApplicable);
        }).join('') + '</div></details>';
    }).join('') +
    '</div></div>';

  // TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS) : 2 rubriques
  // separees plutot qu'une liste unique -- "pour la lettre" ne garde QUE
  // les recommandations reellement actionnables ici (bouton "Appliquer"),
  // les conseils generaux non actionnables (ex. "mettre en avant son
  // autonomie") disparaissent entierement pour l'instant : ils n'ont nulle
  // part ou aller tant que le futur module "entretien avance" n'existe pas
  // (jamais case ailleurs artificiellement). "pour le CV" garde TOUTES les
  // recommandations visant le CV, y compris generales -- jamais corrigees
  // ici de toute facon (toujours envoyees en contexte vers le Bilan), donc
  // aucune raison de filtrer.
  var recommandationsLettre = toutesRecommandations.filter(function (r) { return ctRecommandationEstApplicableIci(r); });
  var recommandationsCv = toutesRecommandations.filter(function (r) { return r.documentCible === 'cv' || r.documentCible === 'plusieurs'; });

  var htmlRecommandations =
    (recommandationsLettre.length
      ? '<div class="cv-section" style="margin-bottom:1rem;"><details>' +
        ctHtmlEnTeteAccordeon('&#128161;', 'Recommandations pour la Lettre de Motivation (' + recommandationsLettre.length + ')') +
        '<div class="mt-2">' + recommandationsLettre.map(ctRendreCarteRecommandation).join('') + '</div></details>' +
        '</div>'
      : '') +
    (recommandationsCv.length
      ? '<div class="cv-section" style="margin-bottom:1rem;"><details>' +
        ctHtmlEnTeteAccordeon('&#128202;', 'Recommandations pour le CV (' + recommandationsCv.length + ')') +
        '<div class="mt-2">' + recommandationsCv.map(ctRendreCarteRecommandation).join('') + '</div></details>' +
        '</div>'
      : '');

  return '<div class="page-catalogue-contenu">' +
    ctHtmlBarreEtapes() +
    htmlTitreEtapeModule('bi-check2-circle', 'Cohérence de mon dossier', 'Résultat') +
    ctHtmlSynthese(resultat) +
    htmlConstats + htmlRecommandations +
    // Consigne 69 : les résultats d'abord ; le bloc qui permet de modifier ses documents et de relancer l'analyse vient après
    '<h4 class="mt-4 mb-1">&#9999;&#65039; Modifier et relancer</h4>' +
    '<p class="text-muted small mb-2">Si vous changez un document ou ce que vous visez, vous pouvez relancer l’analyse pour voir si le résultat change.</p>' +
    ctHtmlTableauDeBord(diagnostic) +
    ctHtmlRappelSauvegarde() +
    '</div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: 'ctRetour()', terminerParcours: true, onclickTerminer: 'terminerParcoursSansFenetre()' }) + '</div>';
}

// TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS -- disquette) :
// ce module garde son travail hors de `dossier` (voir ctExporterEtatPourSauvegarde/
// ctRestaurerEtatDepuisSauvegarde) -- un parcours long ici, sans rappel de
// sauvegarde, se perdrait a la fermeture du navigateur. Meme icone que le
// bouton "Sauvegarder ma session" (&#128190;, id="btnSessionTransfert",
// index.html) - jamais une nouvelle icone pour la meme intention.
function ctHtmlRappelSauvegarde() {
  return htmlRappelSauvegarde();   // brique commune (consigne 49)
}

// ---------- Entretien avance (2e prompt, DECISION DE DENIS 2026-08-25) ----------

// Scope volontairement limite aux recommandations pour la LETTRE DE
// MOTIVATION (celles avec un bouton "Appliquer", voir
// ctRecommandationEstApplicableIci) -- les recommandations pour le CV
// sont redirigees vers le Bilan (ctBrancherActionsRecommandations plus
// bas) sans jamais renvoyer de signal d'application : impossible de
// savoir de facon fiable si elles ont ete suivies, donc jamais comptees
// ici (limite technique discutee avec Denis avant d'ecrire ce code).
function ctEtatRecommandationsLettre(diagnostic) {
  var toutes = (diagnostic && diagnostic.resultat && diagnostic.resultat.recommandations) || [];
  var recommandationsLettre = toutes.filter(ctRecommandationEstApplicableIci);
  var appliquees = recommandationsLettre.filter(function (r) { return !!_ctRecommandationsLettreAppliquees[r.id]; });
  var nonAppliquees = recommandationsLettre.filter(function (r) { return !_ctRecommandationsLettreAppliquees[r.id]; });
  return { appliquees: appliquees, nonAppliquees: nonAppliquees };
}

// TACHE (2026-08-25, DECISION DE DENIS) : avant de lancer l'entretien
// avance, avertit si des recommandations pour la lettre restent non
// appliquees -- jamais bloquant (la personne choisit de continuer quand
// meme), mais jamais silencieux non plus. Accord singulier/pluriel
// EXPLICITEMENT demande, meme principe que ctRaisonsRelance().
function ctVerifierRecommandationsAvantEntretienAvance() {
  var diagnostic = ctObtenirDiagnostic();
  var etat = ctEtatRecommandationsLettre(diagnostic);
  if (etat.nonAppliquees.length === 0) {
    ctOuvrirEntretienAvance();
    return;
  }
  var message = (etat.nonAppliquees.length === 1
    ? 'Il vous reste une recommandation qui n’a pas encore été appliquée à votre lettre de motivation.'
    : 'Il vous reste plusieurs recommandations qui n’ont pas encore été appliquées à votre lettre de motivation.') +
    ' Ces recommandations ne sont pas arbitraires : elles visent à renforcer votre candidature. Voulez-vous les appliquer avant de continuer, ou lancer l’entretien avec vos documents tels qu’ils sont actuellement ?';
  confirmerAction(
    'Des recommandations n’ont pas encore été appliquées',
    message,
    'Appliquer les recommandations', 'btn-primary',
    function () {},
    'Continuer quand même', function () { ctOuvrirEntretienAvance(); },
    'btn-outline-secondary'
  );
}

// TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS -- "pas la
// peine de reposer les memes questions") : si un entretien avance COMPLET
// existe deja, il porte forcement sur les MEMES questions legeres que
// celles qu'on s'appreterait a reposer -- invariant garanti par le store
// (_ctEntretienAvanceActif est efface des qu'un nouveau dossier est
// depose, voir ctStoreDefinirDossier, donc son existence prouve que le
// diagnostic n'a pas change depuis). Propose alors de reprendre les
// reponses telles quelles (saute directement au choix d'assistant) ou de
// les modifier (rouvre la collecte, PRE-REMPLIE). Sinon (1ere fois, ou
// apres une relance qui a efface l'entretien avance precedent), collecte
// vierge comme avant.
function ctOuvrirEntretienAvance() {
  var entretienAvanceExistant = ctObtenirEntretienAvance();
  if (entretienAvanceExistant && entretienAvanceExistant.statut === 'complete') {
    confirmerAction(
      'Reprendre vos réponses précédentes ?',
      'Vous avez déjà répondu à ces questions lors d’un précédent passage. Voulez-vous les modifier, ou continuer directement avec les réponses données la dernière fois ?',
      'Modifier mes réponses', 'btn-primary',
      function () { ctDemarrerCollecteEntretienAvance(entretienAvanceExistant.questionsReponses); },
      'Continuer directement', function () { ctContinuerAvecReponsesPrecedentes(entretienAvanceExistant.questionsReponses); },
      'btn-outline-secondary'
    );
    return;
  }
  ctDemarrerCollecteEntretienAvance(null);
}

function ctDemarrerCollecteEntretienAvance(reponsesPrecedentes) {
  var diagnostic = ctObtenirDiagnostic();
  var questions = (diagnostic && diagnostic.resultat && diagnostic.resultat.questionsEntretien) || [];
  _ctReponsesEntretienAvance = questions.map(function (q) {
    var precedente = (reponsesPrecedentes || []).filter(function (r) { return r.question === q; })[0];
    return { question: q, reponse: precedente ? precedente.reponse : '' };
  });
  _ctEtapeEntretienAvance = 'collecte';
  _ctAfficherRapportPrincipal = false;
  if (typeof trackEvenement === 'function') { trackEvenement('coherence_transversale_entretien_avance_ouvert'); }
  pageCoherenceTransversale();
}

function ctContinuerAvecReponsesPrecedentes(reponsesPrecedentes) {
  _ctReponsesEntretienAvance = reponsesPrecedentes;
  _ctEtapeEntretienAvance = 'choix_ia';
  _ctAfficherRapportPrincipal = false;
  if (typeof trackEvenement === 'function') { trackEvenement('coherence_transversale_entretien_avance_reponses_reutilisees'); }
  pageCoherenceTransversale();
}

// TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS -- "le bouton
// retour m'envoie a l'accueil, ce n'est pas normal") : Retour depuis
// l'ecran "Choisissez votre assistant" (entretien avance) doit revenir a
// la collecte des reponses, PRE-REMPLIE avec ce qui a deja ete saisi --
// jamais l'accueil de l'application.
function ctRevenirALaCollecteEntretienAvance() {
  ctDemarrerCollecteEntretienAvance(_ctReponsesEntretienAvance);
}

// TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS) : ramene au
// rapport principal SANS jamais effacer l'entretien avance deja termine
// (juste un choix d'affichage, voir _ctAfficherRapportPrincipal plus
// haut) -- permet de modifier un document/relancer l'analyse ou
// d'appliquer une recommandation, puis de revenir a l'entretien avance
// si besoin (via "Aller plus loin" ou "Refaire l'entretien avance").
function ctRevenirAuRapportPrincipal() {
  _ctAfficherRapportPrincipal = true;
  pageCoherenceTransversale();
}

function ctAnnulerEntretienAvance() {
  _ctReponsesEntretienAvance = null;
  _ctEtapeEntretienAvance = null;
  pageCoherenceTransversale();
}

// Enregistre les reponses saisies (lues dans le DOM de l'ecran de
// collecte), puis passe a l'ecran de choix d'assistant -- l'entretien
// avance n'est reellement demarre (ctDemarrerEntretienAvance) qu'une
// fois l'assistant choisi, voir ctBrancherEntretienAvanceChoixIA plus bas.
function ctValiderReponsesEntretienAvance() {
  var questions = _ctReponsesEntretienAvance || [];
  questions.forEach(function (item, index) {
    var champ = document.getElementById('ctReponseEntretien' + index);
    if (champ) { item.reponse = champ.value; }
  });
  _ctEtapeEntretienAvance = 'choix_ia';
  if (typeof trackEvenement === 'function') { trackEvenement('coherence_transversale_entretien_avance_reponses_validees'); }
  pageCoherenceTransversale();
}

function ctHtmlEntretienAvanceCollecte() {
  var questions = _ctReponsesEntretienAvance || [];
  var corps = questions.length
    ? questions.map(function (item, index) {
      return '<div class="mb-3">' +
        '<label class="form-label fw-bold small" for="ctReponseEntretien' + index + '">' + (index + 1) + '. ' + echapperAttribut(item.question) + '</label>' +
        '<textarea class="form-control" id="ctReponseEntretien' + index + '" rows="2">' + echapperAttribut(item.reponse) + '</textarea>' +
        '</div>';
    }).join('')
    : '<p class="text-muted">Aucune question complémentaire cette fois-ci - vous pouvez continuer directement.</p>';

  return '<div class="page-catalogue-contenu">' +
    ctHtmlBarreEtapes() +
    htmlTitreEtapeModule('bi-check2-circle', 'Cohérence de mon dossier', 'Aller plus loin : mon entretien') +
    '<div class="cv-section" style="margin-bottom:1rem;">' +
    '<p class="text-muted small mb-3">Quelques questions courtes pour mieux comprendre votre candidature, avant de préparer un entretien plus approfondi avec un assistant. Vous pouvez répondre au clavier, ou à la voix si c’est plus simple pour vous.</p>' +
    htmlAstuceDictee('ligne', 'Pour répondre à la voix :') +
    corps +
    '</div></div>' +
    // Consigne 66 (D45) : « Valider » est dans la barre du bas, plus de « Retour au rapport » dans la page (le « Retour » de la barre y ramene).
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', 'cv', 'Valider', { onclickPrecedent: 'ctAnnulerEntretienAvance()', onclickSuivant: 'ctValiderReponsesEntretienAvance()' }) + '</div>';
}

// TACHE (2026-08-25, DECISION DE DENIS) : rappel du micro meme sans
// lecture a voix haute de l'assistant + mention de la conversation
// vocale continue, aujourd'hui propre a ChatGPT.
function ctHtmlEtapeChoixIAEntretienAvance() {
  return '<div class="page-catalogue-contenu">' +
    ctHtmlBarreEtapes() +
    htmlTitreEtapeModule('bi-check2-circle', 'Cohérence de mon dossier', 'Aller plus loin : mon entretien', 'Choisissez l’assistant avec qui vous allez faire cet entretien.') +
    '<div class="cv-section coherence-etape-choix-ia">' +
    '<h4>&#128172; Choisissez votre assistant</h4>' +
    '<p class="text-muted small mb-3">Cliquez sur un assistant ci-dessous. L’application prépare et copie tout pour vous, puis ouvre l’assistant.</p>' +
    htmlChoixAssistantBilanCorps({
      idErreur: 'ctErreurChoixIAEntretienAvance', attrAssistant: 'data-assistant-entretien-avance',
      etapes: ETAPES_DETAIL_CHOIX_IA,
      texteConfidentialite: 'Rien n’est envoyé avant que vous ayez validé vos réponses.'
    }) +
    '<div class="small text-secondary mt-3" style="background:var(--bg-subtle);border-radius:8px;padding:0.6rem 0.85rem;">' +
    '&#127908; Même si l’assistant choisi n’a pas la capacité de lire les questions à <strong>voix haute</strong>, vous pouvez <strong>répondre par la voix</strong> en activant le micro présent dans sa zone de réponse. ChatGPT propose aujourd’hui une vraie conversation vocale continue (l’assistant pose les questions à voix haute, vous répondez de vive voix) ; les autres assistants pourront proposer cette fonction à l’avenir.' +
    '</div>' +
    '</div></div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: 'ctRevenirALaCollecteEntretienAvance()' }) + '</div>';
}

function ctHtmlEtapeImportIAEntretienAvance(entretienAvance) {
  return '<div class="page-catalogue-contenu">' +
    ctHtmlBarreEtapes() +
    '<div id="ctEtapeImportIAAncre"></div>' +
    htmlTitreEtapeModule('bi-check2-circle', 'Cohérence de mon dossier', 'Aller plus loin : mon entretien') +
    '<div class="cv-section coherence-etape-import-ia">' +
    // Fenetre unique « Collez la reponse » (dette B.17, etape C, 2026-10-28) : voir htmlCollageUniquePage() (js/app.js).
    htmlCollageUniquePage('CoherenceEntretienAvance') +
    '</div></div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: 'ctRevenirAuChoixIAEntretienAvance()' }) + '</div>';
}

// TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS -- "le bouton
// retour m'envoie a l'accueil") : abandonne la transition en cours
// (l'assistant a peut-etre deja ete ouvert dans un autre onglet, sans
// consequence -- rien n'a encore ete importe) et revient au choix
// d'assistant, jamais l'accueil de l'application.
function ctRevenirAuChoixIAEntretienAvance() {
  _etatTransitionIA = null;
  if (typeof _intervalleDecompteIA !== 'undefined' && _intervalleDecompteIA) { clearInterval(_intervalleDecompteIA); }
  _ctEtapeEntretienAvance = 'choix_ia';
  pageCoherenceTransversale();
}

// TACHE (bouton Imprimer, Pass C, 2026-08-25, DECISION DE DENIS) :
// document HTML autonome (doctype complet), destine A ETRE ECRIT DANS
// UN IFRAME (srcdoc) puis imprime via iframe.contentWindow.print() --
// jamais window.print() direct sur la page hote, qui imprimerait toute
// l'appli. Contenu volontairement simple (pas de gabarit CV) : ce
// module n'a pas besoin du moteur PDF lourd de cv-pdf-html/, un rapport
// texte structure suffit.
function ctHtmlDocumentImprimableEntretienAvance(entretienAvance) {
  var resultat = entretienAvance.resultat;
  function htmlListe(items, texteVide) {
    return (items && items.length)
      ? '<ul>' + items.map(function (i) { return '<li>' + echapperAttribut(i) + '</li>'; }).join('') + '</ul>'
      : '<p class="muted">' + texteVide + '</p>';
  }
  var htmlParQuestion = (resultat.parQuestion || []).map(function (pq, index) {
    return '<div class="question">' +
      '<h3>' + (index + 1) + '. ' + echapperAttribut(pq.question) + '</h3>' +
      (pq.resumeReponse ? '<p><strong>Votre réponse (résumé) :</strong> ' + echapperAttribut(pq.resumeReponse) + '</p>' : '') +
      (pq.attentesEmployeur ? '<p class="attentes"><strong>Ce que le recruteur cherche à évaluer :</strong> ' + echapperAttribut(pq.attentesEmployeur) + '</p>' : '') +
      '</div>';
  }).join('');

  return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Mon entretien avancé</title>' +
    '<style>' +
    'body{font-family:"Segoe UI",Arial,sans-serif;color:#1F2937;max-width:760px;margin:2rem auto;padding:0 1.5rem;line-height:1.5;}' +
    'h1{font-size:1.6rem;margin-bottom:0.25rem;}' +
    'h2{font-size:1.15rem;margin-top:2rem;border-bottom:2px solid #E5E7EB;padding-bottom:0.25rem;}' +
    'h3{font-size:1rem;margin-bottom:0.25rem;}' +
    '.muted{color:#6B7280;font-style:italic;}' +
    '.question{margin-bottom:1.1rem;padding-bottom:0.75rem;border-bottom:1px solid #E5E7EB;}' +
    '.attentes{color:#4B5563;}' +
    'ul{margin:0.25rem 0 0.75rem 0;padding-left:1.3rem;}' +
    '@media print{body{margin:0;padding:1rem;}}' +
    '</style></head><body>' +
    '<h1>🎯 Mon entretien avancé</h1>' +
    '<p class="muted">Document généré à partir de votre entretien de préparation avancé.</p>' +
    '<h2>Synthèse</h2><p>' + echapperAttribut(resultat.synthese) + '</p>' +
    '<h2>Points forts</h2>' + htmlListe(resultat.pointsForts, 'Aucun point fort particulier signalé.') +
    '<h2>Axes d’amélioration</h2>' + htmlListe(resultat.axesAmelioration, 'Aucun axe d’amélioration particulier signalé.') +
    (htmlParQuestion ? '<h2>Détail des questions posées</h2>' + htmlParQuestion : '') +
    '<h2>Recommandations</h2>' + htmlListe(resultat.recommandations, 'Aucune recommandation particulière.') +
    '</body></html>';
}

// Panneau plein ecran leger (jamais le moteur PDF de cv-pdf-html/,
// disproportionne pour un rapport texte) -- meme principe "aperçu avant
// impression, jamais une impression directe" que ouvrirGrandApercuPdf()
// (js/app.js), en beaucoup plus simple : iframe + srcdoc (ecriture
// synchrone, pas de contentDocument.write), bouton Imprimer qui appelle
// iframe.contentWindow.print() -- jamais window.print() sur la page
// hote, qui imprimerait toute l'appli.
function ctOuvrirApercuImpressionEntretienAvance(entretienAvance) {
  var panneau = document.getElementById('ctPanneauApercuImpression');
  if (!panneau) {
    panneau = document.createElement('div');
    panneau.id = 'ctPanneauApercuImpression';
    panneau.style.cssText = 'position:fixed;inset:0;background:#e9e9e9;z-index:99999;display:flex;flex-direction:column;font-family:"Segoe UI",Roboto,system-ui,sans-serif;';
    panneau.innerHTML =
      '<div style="flex-shrink:0;padding:0.5rem 1rem;background:#111827;display:flex;align-items:center;justify-content:flex-end;gap:0.6rem;">' +
      '<span style="color:#FFFFFF;margin-right:auto;font-weight:600;font-size:0.9rem;">Aperçu avant impression</span>' +
      '<button type="button" id="btnImprimerApercuEntretienAvance" style="font-size:0.95rem;font-weight:700;padding:0.5rem 1.2rem;' +
      'background:#0d6efd;color:#FFFFFF;border:none;border-radius:999px;cursor:pointer;">&#128424; Imprimer</button>' +
      '<button type="button" id="btnFermerApercuImpressionEntretienAvance" style="font-size:0.95rem;font-weight:700;padding:0.5rem 1.2rem;' +
      'background:#374151;color:#FFFFFF;border:none;border-radius:999px;cursor:pointer;">✕ Fermer</button>' +
      '</div>' +
      '<iframe id="iframeApercuImpressionEntretienAvance" title="Aperçu avant impression - Mon entretien avancé" style="flex:1;width:100%;border:none;background:#FFFFFF;"></iframe>';
    document.body.appendChild(panneau);

    document.getElementById('btnFermerApercuImpressionEntretienAvance').addEventListener('click', function () { panneau.remove(); });
    document.getElementById('btnImprimerApercuEntretienAvance').addEventListener('click', function () {
      var iframe = document.getElementById('iframeApercuImpressionEntretienAvance');
      if (iframe && iframe.contentWindow) { iframe.contentWindow.print(); }
    });
  }
  document.getElementById('iframeApercuImpressionEntretienAvance').srcdoc = ctHtmlDocumentImprimableEntretienAvance(entretienAvance);
  if (typeof trackEvenement === 'function') { trackEvenement('coherence_transversale_entretien_avance_apercu_impression'); }
}

// TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS) : les 5
// rubriques repliees par defaut, meme motif "texte descriptif + Cliquez
// pour en savoir plus" que "Détail des questions posées" (deja en place)
// -- jamais un contenu affiche d'emblee, jamais une rubrique qui deroge
// au motif des autres. Rien de modifiable ici : ni les recommandations,
// ni le detail par question, uniquement consultable puis imprimable.
function ctHtmlRapportEntretienAvance(entretienAvance) {
  var resultat = entretienAvance.resultat;
  var htmlPointsForts = resultat.pointsForts.length
    ? '<ul class="mb-0">' + resultat.pointsForts.map(function (p) { return '<li>' + echapperAttribut(p) + '</li>'; }).join('') + '</ul>'
    : '<p class="text-muted small mb-0">Aucun point fort particulier signalé.</p>';
  var htmlAxes = resultat.axesAmelioration.length
    ? '<ul class="mb-0">' + resultat.axesAmelioration.map(function (a) { return '<li>' + echapperAttribut(a) + '</li>'; }).join('') + '</ul>'
    : '<p class="text-muted small mb-0">Aucun axe d’amélioration particulier signalé.</p>';
  var htmlRecommandations = resultat.recommandations.length
    ? '<ul class="mb-0">' + resultat.recommandations.map(function (r) { return '<li>' + echapperAttribut(r) + '</li>'; }).join('') + '</ul>'
    : '<p class="text-muted small mb-0">Aucune recommandation particulière.</p>';
  var htmlParQuestion = resultat.parQuestion.length
    ? resultat.parQuestion.map(function (pq) {
      return '<div class="mb-3 pb-2" style="border-bottom:1px solid var(--border);">' +
        '<p class="fw-bold mb-1">' + echapperAttribut(pq.question) + '</p>' +
        (pq.resumeReponse ? '<p class="mb-1 small"><strong>Votre réponse (résumé) :</strong> ' + echapperAttribut(pq.resumeReponse) + '</p>' : '') +
        (pq.attentesEmployeur ? '<p class="mb-0 small text-muted"><strong>Ce que le recruteur cherche à évaluer :</strong> ' + echapperAttribut(pq.attentesEmployeur) + '</p>' : '') +
        '</div>';
    }).join('')
    : '<p class="text-muted small mb-0">Aucune question particulière signalée.</p>';

  // TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS) : pulse
  // borne CSS (voir declaration de la variable plus haut) -- seulement au
  // 1er affichage de ce rapport dans la session, pour laisser le temps de
  // remarquer le bouton apres avoir lu les rubriques.
  var classePulseApercu = _ctPulseApercuImpressionMontre ? '' : ' ct-bouton-apercu-impression-pulse';
  _ctPulseApercuImpressionMontre = true;

  return '<div class="page-catalogue-contenu">' +
    ctHtmlBarreEtapes() +
    '<div class="text-center"><h1><i class="bi bi-check2-circle"></i> Cohérence de mon dossier</h1><p class="sousTitre"><strong>Aller plus loin : mon entretien</strong></p>' +
    '<div class="d-flex flex-wrap justify-content-center gap-2 mt-2">' +
    '<button type="button" id="ctBoutonRetourRapportPrincipal" class="btn btn-outline-secondary btn-sm">&#11013; Retour au rapport</button>' +
    '<button type="button" id="ctBoutonApercuImpressionEntretienAvance" class="btn btn-outline-primary btn-sm' + classePulseApercu + '">&#128424; Aperçu avant impression</button>' +
    '</div>' +
    '</div>' +
    '<div class="cv-section" style="margin-bottom:1rem;"><details>' +
    ctHtmlEnTeteAccordeon('&#128269;', 'Synthèse', 'Un retour global sur la façon dont l’entretien s’est déroulé.') +
    '<p class="mb-0 mt-2">' + echapperAttribut(resultat.synthese) + '</p>' +
    '</details></div>' +
    '<div class="row g-2" style="margin-bottom:1rem;">' +
    '<div class="col-md-6"><div class="cv-section h-100"><details>' +
    ctHtmlEnTeteAccordeon('&#128994;', 'Points forts', 'Ce que vous avez particulièrement bien exprimé pendant cet entretien.') +
    '<div class="mt-2">' + htmlPointsForts + '</div></details></div></div>' +
    '<div class="col-md-6"><div class="cv-section h-100"><details>' +
    ctHtmlEnTeteAccordeon('&#128993;', 'Axes d’amélioration', 'Ce que vous pourriez retravailler avant un vrai entretien.') +
    '<div class="mt-2">' + htmlAxes + '</div></details></div></div>' +
    '</div>' +
    '<div class="cv-section" style="margin-bottom:1rem;"><details>' +
    ctHtmlEnTeteAccordeon('&#128172;', 'Détail des questions posées (' + resultat.parQuestion.length + ')', 'Le résumé de vos réponses, et ce que le recruteur cherche à évaluer, question par question.') +
    '<div class="mt-2">' + htmlParQuestion + '</div></details></div>' +
    '<div class="cv-section" style="margin-bottom:1rem;"><details>' +
    ctHtmlEnTeteAccordeon('&#128161;', 'Recommandations', 'Des conseils à garder pour la suite - à consulter ou à imprimer, pas de correction automatique ici.') +
    '<div class="mt-2">' + htmlRecommandations + '</div></details></div>' +
    // TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS : "refaire
    // ou reanalyser... avec les memes informations, la personne va pouvoir
    // mieux se presenter et voir si ca change la synthese") : reutilise le
    // meme cycle que "Aller plus loin" (memes questions legeres tant que
    // l'analyse principale n'a pas ete relancee), meme avertissement sur
    // les recommandations non appliquees pour rester coherent.
    '<div class="text-center mb-3"><button type="button" id="ctBoutonRefaireEntretienAvance" class="btn btn-outline-primary">&#128260; Refaire l’entretien avancé</button></div>' +
    '</div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: 'ctRevenirAuRapportPrincipal()', terminerParcours: true, onclickTerminer: 'terminerParcoursSansFenetre()' }) + '</div>';
}

// ---------- Synthese (titre + fond colore selon la coherence globale) ----------

// TACHE (couleur de la synthese, 2026-08-25, DECISION DE DENIS suite a
// un bug reel constate en test : fond rouge affiche alors que le texte
// disait la candidature "coherente") -- niveau demande EXPLICITEMENT a
// l’assistant (resultat.niveau, meme reponse que syntheseGenerale, voir
// responseParser.js), PLUS JAMAIS deduit par l'application a partir des
// constats : un 1er essai heuristique cote application (compter les
// natures de constats) a produit exactement cette contradiction, un seul
// constat mineur suffisant a declencher le rouge malgre une synthese
// globalement positive. Texte et couleur viennent desormais de la MEME
// source, jamais plus de contradiction possible. resultat.niveau absent/
// invalide (IA qui ignore la consigne) => habillage neutre, jamais une
// couleur devinee a la place.
var CT_NIVEAUX_COHERENCE = {
  coherent: { bg: 'var(--success-bg-subtle)', border: 'var(--success-strong)' },
  // TACHE (audit robustesse, 2026-09-11) : couleur codee en dur, invisible
  // en mode sombre -- remplacee par les variables warning theme-aware.
  incoherences_mineures: { bg: 'var(--warning-bg-subtle)', border: 'var(--warning-border)' },
  incoherences_majeures: { bg: 'var(--danger-bg-subtle)', border: 'var(--danger)' }
};
var CT_NIVEAU_NEUTRE = { bg: 'var(--bg-subtle)', border: 'var(--border)' };

// TACHE (synthese narrative globale, 2026-08-25, DECISION DE DENIS) :
// rubrique desormais depliable, meme motif que les autres accordeons
// (Cliquez pour en savoir plus, classe bilan-accordeon-invite) -- le
// verdict de coherence (syntheseGenerale) reste TOUJOURS visible (fait
// partie du <summary>, jamais cache), seule la synthese narrative
// (constat plus large, jamais un jugement, voir prompt) est reservee au
// clic. Absente/vide (IA qui n'a pas produit ce champ optionnel) => la
// rubrique reste simplement repliable sans rien de plus a l'interieur,
// jamais une erreur ni un vide brut.
function ctHtmlSynthese(resultat) {
  var couleur = CT_NIVEAUX_COHERENCE[resultat.niveau] || CT_NIVEAU_NEUTRE;
  var htmlNarratif = resultat.syntheseNarrative
    ? '<p class="mb-0 mt-2">' + echapperAttribut(resultat.syntheseNarrative) + '</p>'
    : '<p class="text-muted small mb-0 mt-2">Pas de synthèse plus détaillée disponible pour cette analyse.</p>';
  return '<div class="cv-section" style="margin-bottom:1rem;background:' + couleur.bg + ';border:1px solid ' + couleur.border + ';">' +
    '<details>' +
    '<summary class="ct-resume-accordeon" style="cursor:pointer;">' +
    '<p class="fw-bold mb-1 d-flex align-items-center">' +
    '<span>&#128269; Synthèse</span>' +
    '<span class="bilan-accordeon-invite" style="margin-left:auto;font-weight:600;">Cliquez pour en savoir plus</span>' +
    '</p>' +
    '<p class="mb-0">' + echapperAttribut(resultat.syntheseGenerale) + '</p>' +
    '</summary>' +
    htmlNarratif +
    '</details>' +
    '</div>';
}

// ---------- Tableau de bord (etat 2 de la page "Vue d'ensemble") ----------

// TACHE (tableau de bord modifiable, 2026-08-25, DECISION DE DENIS) :
// documents/informations en attente de modification, PAS encore appliques
// (la personne peut modifier plusieurs champs avant de relancer, un seul
// aller-retour de relecture confidentialite plutot qu'un par champ) --
// remis a zero uniquement apres un "Relancer l'analyse" reussi. Cle =
// champ du DossierTransversal (cv/lettre/preparationEntretien).
var _ctModificationsEnAttente = {};
var _ctModifEnCours = null;   // document en cours de remplacement dans le rapport (zone de depot affichee en page) : 'cv' | 'lettre' | 'preparationEntretien'

// TACHE (entretien avance, Pass B, 2026-08-25, DECISION DE DENIS) : etat
// PROPRE A L'ECRAN (pas au module -- _ctReponsesEntretienAvance n'existe
// que le temps de l'ecran de collecte/choix d'assistant, jamais persiste
// dans le store du module). _ctEtapeEntretienAvance distingue les 2
// ecrans intermediaires ('collecte' = questions/reponses en cours de
// saisie, 'choix_ia' = reponses validees, en attente du choix d'assistant) --
// une fois l'entretien avance reellement demarre (ctDemarrerEntretienAvance),
// cette variable redevient null : le dispatcher retombe alors sur l'objet
// EntretienAvance du module (genere/complete), source de verite unique.
var _ctReponsesEntretienAvance = null;
var _ctEtapeEntretienAvance = null;

// TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS -- "je me
// demande si on ne mettra pas ici le bouton de revenir a la page
// precedente") : sans ce drapeau, une fois l'entretien avance complet,
// aucun chemin ne ramenait au rapport principal (tableau de bord,
// "Relancer l'analyse", corrections lettre) -- l'objet EntretienAvance
// complet dans le store faisait basculer le dispatcher dessus en
// permanence, meme apres "Reprendre" depuis l'accueil du module. Bascule
// SANS jamais effacer l'entretien avance (juste un choix d'affichage) --
// remis a false des qu'on relance l'entretien avance (ctOuvrirEntretienAvance),
// pour que le prochain rendu montre a nouveau son propre parcours.
var _ctAfficherRapportPrincipal = false;

// TACHE (chantier "bouton presentation", 2026-09-01) :
//  - _ctVoirIntro : detour de CONSULTATION ("Revoir la presentation" depuis
//    un ecran du module). On affiche la presentation par-dessus le travail,
//    sans encart. Retour via "Revenir au module" (haut, bas, "Retour").
//  - _ctReprisePendante : on REVIENT dans le module (accueil / autre module)
//    alors qu'une analyse est engagee. Encart "Continuer / Recommencer" a
//    droite (pulse ~10 s), module GELE tant que le choix n'est pas fait.
var _ctVoirIntro = false;
var _ctReprisePendante = false;
// TACHE (correctif boucle Retour, 2026-09-09 -- LECONS section 2,
// "Variante boucle infinie"). Drapeau distinct de _ctVoirIntro : "reculer
// d'un cran" depuis "Choisissez votre assistant" / le rapport vers la
// presentation, mais en mode NORMAL (dont le "Retour" enchaine vers
// l'accueil de la carte). _ctVoirIntro (detour) reste reserve au bouton
// "Revoir la presentation" -- lui, son "Retour" revient dans le module.
// Consomme une seule fois par pageCoherenceTransversale().
var _ctRetourAccueil = false;
function ctRetour() { _ctVoirIntro = false; _ctRetourAccueil = true; pageCoherenceTransversale(); }
function ctFermerDetourIntro() { _ctVoirIntro = false; pageCoherenceTransversale(); }
// TACHE (RC-03, correctif "Retour" confondu avec "Accueil", audit
// 2026-09-04) : "Retour" depuis "Choisissez votre assistant" et depuis le
// rapport principal (ctHtmlEtapeChoixIA/ctHtmlRapport) passait encore
// precedent='cv' sans onclickPrecedent -- Retour = Accueil, mot pour mot.
// L'ecran precedent reel de ces 2 etapes est la presentation du module.
// TACHE (correctif boucle Retour, 2026-09-09) : ces 2 "Retour" appellent
// desormais ctRetour() (presentation en mode NORMAL), plus
// ctRevenirALaPresentation() (detour) qui bouclait avec le "Retour" de la
// presentation. ctRevenirALaPresentation() n'est plus cablee nulle part --
// gardee comme reference du mecanisme detour (_ctVoirIntro = true), a
// n'utiliser QUE pour un bouton "Revoir la presentation", jamais un "Retour".
function ctRevenirALaPresentation() { _ctVoirIntro = true; pageCoherenceTransversale(); }
function ctRepriseContinuer() { _ctReprisePendante = false; pageCoherenceTransversale(); }
function ctRecommencerDepuisIntro() {
  if (typeof ctStoreReinitialiser === 'function') { ctStoreReinitialiser(); }
  _ctModificationsEnAttente = {};
  _ctModifEnCours = null;
  _ctReinitialiserDepots();
  _ctRecommandationsLettreAppliquees = {};
  _ctReponsesEntretienAvance = null;
  _ctEtapeEntretienAvance = null;
  _ctAfficherRapportPrincipal = false;
  _ctVoirIntro = false;
  _ctReprisePendante = false;
  pageCoherenceTransversale();
}

// TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS) : pulse le
// bouton "Apercu avant impression" seulement au 1er affichage du rapport
// (dans cette session) -- jamais repete a chaque re-rendu/re-ouverture,
// meme principe que _pulseGrandApercuWordJusquA/_pulseExperiencesJusquA
// (js/app.js). Borne par CSS (.ct-bouton-apercu-impression-pulse,
// animation-iteration-count fini) -- pas de minuterie JS necessaire.
var _ctPulseApercuImpressionMontre = false;

// TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS) : meme
// principe que _ctPulseApercuImpressionMontre ci-dessus, pour le bouton
// "Voir/imprimer votre lettre" du tableau de bord.
var _ctPulseVoirLettreMontre = false;

// TACHE (relancer l'analyse aussi apres une recommandation appliquee,
// 2026-08-25, DECISION DE DENIS) : "Appliquer a ma lettre de motivation"
// change reellement le contenu envoye a l’assistant en cas de relance -- doit
// donc, comme _ctModificationsEnAttente, activer "Relancer l'analyse".
// Cle = id de la recommandation appliquee (jamais un simple booleen) :
// necessaire pour accorder singulier/pluriel dans le message contextuel
// (une recommandation appliquee vs plusieurs, DECISION DE DENIS). Remis a
// {} uniquement apres une relance reussie (meme cycle de vie que
// _ctModificationsEnAttente).
var _ctRecommandationsLettreAppliquees = {};

// TACHE (titre/resume par document, 2026-08-25, DECISION DE DENIS) :
// demandes EXPLICITEMENT a l’assistant (prompts/coherence-transversale.md,
// parDocument) plutot que devines par l'application depuis un texte
// libre -- jamais fiable, et le titre retrouve PAR DOCUMENT est en plus
// un signal de coherence utile en lui-meme (CV et lettre qui visent 2
// postes differents = deja une incoherence reelle a montrer telle
// quelle, jamais harmonisee artificiellement).
var CT_CHAMP_VERS_CLE_PARDOCUMENT = { cv: 'cv', lettre: 'lettre', preparationEntretien: 'entretien' };
var CT_LABELS_DOCUMENT_MODIFIE = { cv: 'Nouveau CV', lettre: 'Nouvelle lettre de motivation', preparationEntretien: 'Nouvelle préparation d’entretien d’embauche' };

// Portee des modifications tranchee par Denis 2026-08-25 : reste LOCALE a
// ce module (dossierTransversal), ne touche jamais le CV/la lettre
// "officiels" de l'app (Bilan, export...) -- seuls "Appliquer a ma
// lettre"/"Corriger dans le Bilan" (deja existants) ecrivent dans les
// vraies donnees.
function ctRendreCarteDocument(champ, titreCarte, dossierAffiche, diagnostic, optionnel) {
  var valeur = dossierAffiche[champ];
  var present = !!(valeur && valeur.trim());
  var modifie = _ctModificationsEnAttente[champ] !== undefined;
  var cleParDoc = CT_CHAMP_VERS_CLE_PARDOCUMENT[champ];
  // Jamais le titre/resume d'un ANCIEN rapport si le document a change
  // depuis (modifie => plus aucun rapport ne correspond a ce contenu).
  var infosIA = (!modifie && diagnostic && diagnostic.statut === 'complete' && diagnostic.resultat && diagnostic.resultat.parDocument)
    ? diagnostic.resultat.parDocument[cleParDoc] : null;

  var sousTitre = modifie ? CT_LABELS_DOCUMENT_MODIFIE[champ] : (infosIA ? infosIA.titre : '');

  var badge;
  if (modifie) { badge = { texte: 'Modifié, pas encore relancé', bg: 'var(--accent-bg-subtle)', couleur: 'var(--accent)' }; }
  else if (present) { badge = { texte: 'Enregistré' + (champ === 'lettre' ? 'e' : ''), bg: 'var(--success-bg-subtle)', couleur: 'var(--success-strong)' }; }
  else if (optionnel) { badge = { texte: 'À compléter', bg: 'var(--bg-subtle)', couleur: 'var(--text-muted)' }; }
  else { badge = { texte: 'Manquant', bg: 'var(--danger-bg-subtle)', couleur: 'var(--danger)' }; }

  // Consigne 82 (maquette validee par Denis, 31/10/2026) : UNE LIGNE par
  // document (nom + pastille d'etat a gauche, boutons a droite), plus une
  // carte haute avec des vides. Sans resume produit par l'analyse, aucun
  // bouton n'est affiche (plus de « Resume indisponible » grise). Meme icone
  // que « Ce que l'analyse montre » et fond accent : le resume remonte de la
  // meme analyse.
  var boutonResume = (infosIA && (infosIA.pointsForts.length || infosIA.pointsFaibles.length))
    ? '<button type="button" class="btn btn-sm" style="background:var(--accent-bg-subtle);color:var(--accent);border:1px solid var(--accent);font-weight:600;" data-ct-voir-resume="' + champ + '">&#128203; Voir le résumé</button>'
    : '';

  var boutonAnnuler = modifie
    ? '<button type="button" class="btn btn-outline-secondary btn-sm" data-ct-annuler-modification="' + champ + '">Annuler</button>'
    : '';

  // « Changer ce document » : remplace entierement le document (fond ambre,
  // distinct du bleu du resume) ; « Ajouter » quand il n'y en a pas.
  var boutonPrincipal = present
    ? '<button type="button" class="btn btn-sm" style="background:var(--warning-bg-subtle);color:var(--warning-strong);border:1px solid var(--warning-border);font-weight:600;" data-ct-modifier-document="' + champ + '">&#9999; Changer ce document</button>'
    : '<button type="button" class="btn btn-primary btn-sm" data-ct-modifier-document="' + champ + '">&#10133; Ajouter</button>';

  var htmlResume = infosIA
    ? '<div id="ct-resume-' + champ + '" style="display:none;" class="ct-resume-doc small">' +
      (infosIA.pointsForts.length ? '<p><strong>&#128994; Points forts :</strong> ' + infosIA.pointsForts.map(echapperAttribut).join(' ; ') + '</p>' : '') +
      (infosIA.pointsFaibles.length ? '<p><strong>&#128993; À enrichir :</strong> ' + infosIA.pointsFaibles.map(echapperAttribut).join(' ; ') + '</p>' : '') +
      '</div>'
    : '';

  return '<div class="ct-ligne-doc">' +
    '<div class="ct-ligne-doc-info">' +
    '<span class="fw-bold">' + echapperAttribut(titreCarte) + '</span>' +
    '<span class="badge ms-2" style="background:' + badge.bg + ';color:' + badge.couleur + ';font-weight:600;">' + badge.texte + '</span>' +
    (sousTitre ? '<div class="text-muted small">' + echapperAttribut(sousTitre) + '</div>' : '') +
    '</div>' +
    '<div class="ct-ligne-doc-actions">' + boutonResume + boutonAnnuler + boutonPrincipal + '</div>' +
    htmlResume +
    '</div>';
}

function ctHtmlTableauDeBord(diagnostic) {
  var dossierBase = ctObtenirDossier() || {};
  var dossierAffiche = Object.assign({}, dossierBase, _ctModificationsEnAttente);

  // La zone de depot s'ouvre juste sous la ligne du document concerne.
  var lignesDocuments = [
    ['cv', 'Votre CV', false],
    ['lettre', 'Votre lettre de motivation', false],
    ['preparationEntretien', 'Préparation d’entretien d’embauche', true]
  ].map(function (d) {
    return ctRendreCarteDocument(d[0], d[1], dossierAffiche, diagnostic, d[2]) +
      (_ctModifEnCours === d[0] && typeof htmlDepotCVEnPage === 'function'
        ? '<div id="ctDepotModif" class="cv-section mt-2 mb-2"><h4 class="h6">Changer : ' + echapperAttribut(CT_DEPOT_MODIF_TITRES[_ctModifEnCours]) + '</h4>' + htmlDepotCVEnPage(_ctDepotModifCfg()) + '</div>'
        : '');
  }).join('');

  var carteCandidature = '<div class="ct-bloc ct-bloc-visee">' +
    '<div class="fw-bold mt-2 mb-1">&#128188; Ce que vous visez</div>' +
    '<p class="small text-muted mb-2">Ces informations aident l’analyse à juger si vos documents correspondent à ce poste.</p>' +
    '<div class="ct-visee">' +
    '<div><label for="ctChampEntrepriseTdb">Entreprise</label>' +
    '<input type="text" id="ctChampEntrepriseTdb" class="form-control form-control-sm" value="' + echapperAttribut(dossierAffiche.entrepriseCiblee || '') + '" placeholder="À compléter"></div>' +
    '<div><label for="ctChampSiteTdb">Son site internet</label>' +
    '<input type="text" id="ctChampSiteTdb" class="form-control form-control-sm" value="' + echapperAttribut(dossierAffiche.siteEntreprise || '') + '" placeholder="À compléter"></div>' +
    '<div class="plein"><label for="ctChampTypeStructureTdb">Type d’entreprise</label>' +
    '<select id="ctChampTypeStructureTdb" class="form-select select-type-structure">' +
    '<option value="">À compléter</option>' +
    (typeof BILAN_TYPES_STRUCTURE !== 'undefined' ? BILAN_TYPES_STRUCTURE.map(function (t) {
      return '<option value="' + echapperAttribut(t) + '"' + (dossierAffiche.typeStructure === t ? ' selected' : '') + '>' + echapperAttribut(t) + '</option>';
    }).join('') : '') +
    '</select></div>' +
    '<div class="plein"><label for="ctChampOffreTdb">L’offre d’emploi</label>' +
    '<textarea id="ctChampOffreTdb" class="form-control form-control-sm" rows="3" placeholder="À compléter">' + echapperAttribut(dossierAffiche.offreEmploi || '') + '</textarea></div>' +
    '</div></div>';

  return '<div class="cv-section" style="margin-bottom:1rem;">' +
    '<div class="ct-bloc ct-bloc-docs">' + lignesDocuments + '</div>' +
    carteCandidature +
    '<div id="ctErreurTableauDeBord" class="small mt-2" style="display:none;color:var(--danger);"></div>' +
    // TACHE (message contextuel avant "Relancer l'analyse", 2026-08-25,
    // DECISION DE DENIS) : rempli/affiche dynamiquement par
    // ctActualiserBoutonRelancer() -- vide au premier rendu, jamais un
    // texte fixe (la raison varie : document modifie, recommandation
    // appliquee, candidature modifiee, ou plusieurs a la fois).
    '<div id="ctMessageRelancer" class="small mt-3 mb-2 text-center" style="display:none;color:var(--accent);font-weight:600;"></div>' +
    '<div class="ct-actions-tdb text-center d-flex flex-wrap justify-content-center gap-2">' +
    // TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS) : place
    // AVANT "Relancer l'analyse" pour rester visible - desactive/
    // transparent tant qu'aucune recommandation n'a ete appliquee a la
    // lettre de motivation, piloté par ctActualiserBoutonRelancer() (meme
    // etat _ctRecommandationsLettreAppliquees). Style inline (opacity),
    // pas une nouvelle classe CSS pour un etat aussi simple.
    '<div class="ct-bouton-et-phrase"><button type="button" id="ctBoutonVoirLettre" class="btn btn-outline-secondary" disabled style="opacity:0.45;">&#128196; Voir/imprimer votre lettre</button>' +
    '<div id="ctPhraseVoirLettre" class="small text-muted mt-1">Disponible dès que vous appliquez une recommandation à votre lettre.</div></div>' +
    '<div class="ct-bouton-et-phrase"><button type="button" id="ctBoutonRelancerAnalyse" class="btn btn-primary" disabled>&#128260; Relancer l’analyse</button>' +
    '<div id="ctPhraseRelancer" class="small text-muted mt-1">Disponible dès que vous modifiez un document ou appliquez une recommandation.</div></div>' +
    '<button type="button" id="ctBoutonEntretienAvance" class="btn btn-outline-primary">&#127919; Aller plus loin : mon entretien</button>' +
    '</div>' +
    // TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS -- "il doit
    // y avoir une coherence entre les documents saisis et les
    // recommandations faites par rapport a ces documents") : rempli/
    // affiche dynamiquement par ctActualiserBoutonRelancer(), meme
    // principe que ctMessageRelancer juste au-dessus -- vide au premier
    // rendu, visible uniquement quand le bouton "Aller plus loin" est
    // desactive (memes raisons EXACTES que "Relancer l'analyse").
    '<div id="ctMessageEntretienAvanceIndisponible" class="small mt-2 mb-2 text-center text-muted" style="display:none;"></div>' +
    '</div>';
}

// Ouvre, EN PAGE sous les cartes, la meme zone de depot que la 1ere collecte (fichier ou
// texte colle, relecture et masquage compris, voir data/metiers.js) -- ecrit dans _ctModificationsEnAttente
// UNIQUEMENT (jamais applique tant que "Relancer l'analyse" n'a pas ete
// cliquee), puis rafraichit l'affichage pour montrer "modifie, pas encore
// relance".
var CT_DEPOT_MODIF_TITRES = { cv: 'CV', lettre: 'Lettre de motivation', preparationEntretien: 'Préparation d’entretien d’embauche' };
function _ctDepotModifCfg() {
  var champ = _ctModifEnCours;
  return {
    cle: 'ctModif',
    titreDocument: CT_DEPOT_MODIF_TITRES[champ] || 'CV',
    avecIdentite: false,
    ecrireCV: false,
    fait: false,
    rerender: pageCoherenceTransversale,
    libelleFermer: 'Annuler',
    onFermer: function () { _ctModifEnCours = null; reinitialiserDepotCVEnPage('ctModif'); pageCoherenceTransversale(); },
    onDocumentPrepare: function (res) {
      if (res && res.type === 'texte' && res.valeur && champ) { _ctModificationsEnAttente[champ] = res.valeur; }
      _ctModifEnCours = null;
      reinitialiserDepotCVEnPage('ctModif');
      pageCoherenceTransversale();
    }
  };
}
function ctModifierDocument(champ) {
  if (!CT_DEPOT_MODIF_TITRES[champ]) { return; }
  reinitialiserDepotCVEnPage('ctModif');
  _ctModifEnCours = champ;
  pageCoherenceTransversale();
}

// TACHE (2026-08-25, DECISION DE DENIS) : revenir sur une modification en
// attente sans la relancer -- reprend le document tel qu'il est dans le
// dossier actif (celui du rapport actuellement affiche), rien n'est
// jamais perdu (le document remplace reste le meme objet dossier, non
// modifie tant que "Relancer l'analyse" n'a pas ete cliquee).
function ctAnnulerModificationDocument(champ) {
  var labels = { cv: 'votre CV', lettre: 'votre lettre de motivation', preparationEntretien: 'votre préparation d’entretien d’embauche' };
  confirmerAction(
    'Annuler cette modification ?',
    'Vous allez reprendre ' + (labels[champ] || 'ce document') + ' tel qu’il était dans le rapport actuel. Rien n’est perdu, vous pourrez modifier à nouveau plus tard si besoin.',
    'Non, garder ma modification', 'btn-primary',
    function () {},
    'Oui, annuler la modification',
    function () {
      delete _ctModificationsEnAttente[champ];
      pageCoherenceTransversale();
    },
    'btn-outline-danger'
  );
}

// Reconstruit un dossier a partir du dossier actif + des modifications en
// attente, puis relance le cycle (retour au choix de l'assistant) --
// reutilise ctDeposerDossier tel quel (meme mecanisme que la 1ere
// collecte), qui remet automatiquement le diagnostic a zero
// (ctStoreDefinirDossier, diagnosticStore.js) sans jamais toucher au
// dossier lui-meme si rien n'echoue avant. Relecture confidentialite
// demandee UNIQUEMENT pour les champs modifies (dejaRelu:true pour tout
// le reste, deja relu avant).
function ctRelancerAnalyse() {
  var dossierActuel = ctObtenirDossier();
  if (!dossierActuel) { return; }

  var champOffre = document.getElementById('ctChampOffreTdb').value.trim() || null;
  var champEntreprise = document.getElementById('ctChampEntrepriseTdb').value.trim() || null;
  var champSite = document.getElementById('ctChampSiteTdb').value.trim() || null;
  var champTypeStructure = document.getElementById('ctChampTypeStructureTdb').value || null;

  // Meme principe que ctOuvrirCollecteComplement() : entreprise/offre/
  // site/type de structure restent memorises app-wide, pas seulement dans
  // ce module.
  ctMemoriserCandidatureAppWide({ entrepriseCiblee: champEntreprise, offreEmploi: champOffre, siteEntreprise: champSite, typeStructure: champTypeStructure });

  var saisieLibre = {
    cv: _ctModificationsEnAttente.cv !== undefined ? _ctModificationsEnAttente.cv : dossierActuel.cv,
    lettre: _ctModificationsEnAttente.lettre !== undefined ? _ctModificationsEnAttente.lettre : dossierActuel.lettre,
    preparationEntretien: _ctModificationsEnAttente.preparationEntretien !== undefined ? _ctModificationsEnAttente.preparationEntretien : dossierActuel.preparationEntretien,
    offreEmploi: champOffre,
    entrepriseCiblee: champEntreprise,
    siteEntreprise: champSite,
    typeStructure: champTypeStructure,
    questionsPersonne: dossierActuel.questionsPersonne
  };
  // Un document modifie vient de la zone de depot en page : deja relu et masque par la personne, aucune relecture a rouvrir.
  var dejaRelu = { cv: true, lettre: true, preparationEntretien: true };

  if (typeof trackEvenement === 'function') { trackEvenement('coherence_transversale_relance'); }

  ctDeposerDossier(saisieLibre, { collecte: { dejaRelu: dejaRelu } }).then(function () {
    _ctModificationsEnAttente = {};
    _ctRecommandationsLettreAppliquees = {};
    _ctReponsesEntretienAvance = null;
    _ctEtapeEntretienAvance = null;
    _ctAfficherRapportPrincipal = false;
    naviguerVers('coherence-transversale');
  }).catch(function (erreur) {
    if (erreur && erreur.code === 'RelectureAnnulee') { return; }
    var zoneErreur = document.getElementById('ctErreurTableauDeBord');
    if (zoneErreur) {
      zoneErreur.style.display = 'block';
      zoneErreur.textContent = '⚠️ Une erreur est survenue, merci de réessayer.';
    }
  });
}

// TACHE (retour utilisateur, 2026-08-25 : "relancer l'analyse ne sert a
// rien si rien n'a change, le resultat serait identique") : actif
// UNIQUEMENT si un document est en attente de modification OU si un
// champ de la carte "Votre candidature" differe de ce qui est
// actuellement dans le dossier actif -- jamais actif par defaut.
function ctCandidatureModifiee(dossierActuel) {
  var champOffre = document.getElementById('ctChampOffreTdb');
  var champEntreprise = document.getElementById('ctChampEntrepriseTdb');
  var champSite = document.getElementById('ctChampSiteTdb');
  var champTypeStructure = document.getElementById('ctChampTypeStructureTdb');
  if (!champOffre || !champEntreprise || !champSite || !champTypeStructure) { return false; }
  return (champOffre.value.trim() || null) !== (dossierActuel.offreEmploi || null) ||
    (champEntreprise.value.trim() || null) !== (dossierActuel.entrepriseCiblee || null) ||
    (champSite.value.trim() || null) !== (dossierActuel.siteEntreprise || null) ||
    (champTypeStructure.value || null) !== (dossierActuel.typeStructure || null);
}

// TACHE (message contextuel, 2026-08-25, DECISION DE DENIS) : liste
// toutes les raisons actives (jamais une seule au hasard) -- la personne
// voit exactement ce qui a change avant de relancer. Accord singulier/
// pluriel EXPLICITEMENT demande par Denis : jamais "la recommandation"
// s'il y en a plusieurs, jamais "vos documents" s'il n'y en a qu'un.
function ctRaisonsRelance(dossierActuel) {
  var raisons = [];
  var nbDocuments = Object.keys(_ctModificationsEnAttente).length;
  var nbRecommandations = Object.keys(_ctRecommandationsLettreAppliquees).length;
  if (nbDocuments === 1) { raisons.push('votre document modifié'); }
  else if (nbDocuments > 1) { raisons.push('vos documents modifiés'); }
  if (nbRecommandations === 1) { raisons.push('la recommandation appliquée à votre lettre de motivation'); }
  else if (nbRecommandations > 1) { raisons.push('les recommandations appliquées à votre lettre de motivation'); }
  if (ctCandidatureModifiee(dossierActuel)) { raisons.push('les informations de votre candidature modifiées'); }
  return raisons;
}

// TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS) : "Aller plus
// loin" doit rester indisponible tant que des changements en attente
// (document modifie, recommandation lettre appliquee, candidature
// modifiee) n'ont pas ete pris en compte par une relance -- sinon
// l'entretien avance travaillerait sur des documents/recommandations
// perimes par rapport a ce que la personne voit a l'ecran. MEME
// condition EXACTE que "Relancer l'analyse" (ctRaisonsRelance), jamais
// une 2e regle parallele qui pourrait diverger.
// TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS) : retire puis
// rajoute la classe (au lieu d'un simple classList.add) -- une classe
// deja posee dont l'animation bornee est deja terminee ne rejouerait pas
// sinon. Le retrait force un reflow (lecture de offsetWidth) avant de la
// reposer, seule facon fiable de relancer une animation CSS deja jouee.
// classe (optionnel) : quelle classe de pulse rejouer -- 'ct-pulse-dix-secondes'
// par defaut (Relancer l'analyse/Aller plus loin, ~10s), reutilisable
// avec 'case-a-cocher-pulse' (~5s, ex. Copier le texte de la lettre) sans
// dupliquer cette fonction.
function ctDeclencherPulseBouton(bouton, classe) {
  if (!bouton) { return; }
  classe = classe || 'ct-pulse-dix-secondes';
  bouton.classList.remove(classe);
  void bouton.offsetWidth;
  bouton.classList.add(classe);
}

// TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS) : "Aller plus
// loin" doit rester indisponible tant que des changements en attente
// (document modifie, recommandation lettre appliquee, candidature
// modifiee) n'ont pas ete pris en compte par une relance -- sinon
// l'entretien avance travaillerait sur des documents/recommandations
// perimes par rapport a ce que la personne voit a l'ecran. MEME
// condition EXACTE que "Relancer l'analyse" (ctRaisonsRelance), jamais
// une 2e regle parallele qui pourrait diverger.
//
// pulserEntretienAvanceSiActif (optionnel, DECISION DE DENIS) : les 2
// boutons pulsent pour des raisons DIFFERENTES, jamais confondues.
// "Relancer l'analyse" pulse au moment ou une action de la personne le
// rend actionnable (detecte en comparant son etat disabled AVANT/APRES
// ce meme appel -- fiable ici car chaque re-rendu complet repart du
// disabled="true" code en dur dans le HTML, jamais un etat perime).
// "Aller plus loin" pulse quand on ARRIVE sur cette page alors qu'il est
// deja disponible ("revient ici" - DECISION DE DENIS) -- ce bouton
// demarre SANS attribut disabled, donc la meme comparaison avant/apres
// ne detecterait jamais rien : seul ctBrancherTableauDeBord() (montage
// complet de l'ecran) passe true ici, jamais les appels incrementaux
// (saisie en direct, correction appliquee) ou le bouton vient au
// contraire souvent de se desactiver.
function ctActualiserBoutonRelancer(pulserEntretienAvanceSiActif) {
  var dossierActuel = ctObtenirDossier();
  var btn = document.getElementById('ctBoutonRelancerAnalyse');
  var zoneMessage = document.getElementById('ctMessageRelancer');
  var btnEntretienAvance = document.getElementById('ctBoutonEntretienAvance');
  var zoneMessageEntretienAvance = document.getElementById('ctMessageEntretienAvanceIndisponible');
  if (!btn || !dossierActuel) { return; }
  var raisons = ctRaisonsRelance(dossierActuel);
  var relancerEtaitDesactive = btn.disabled;
  btn.disabled = raisons.length === 0;
  if (relancerEtaitDesactive && !btn.disabled) { ctDeclencherPulseBouton(btn); }
  var phraseRelancer = document.getElementById('ctPhraseRelancer');
  if (phraseRelancer) { phraseRelancer.style.display = raisons.length ? 'none' : 'block'; }
  if (zoneMessage) {
    zoneMessage.style.display = raisons.length ? 'block' : 'none';
    zoneMessage.textContent = raisons.length ? 'L’analyse sera relancée avec ' + raisons.join(' et ') + '.' : '';
  }
  if (btnEntretienAvance) {
    btnEntretienAvance.disabled = raisons.length > 0;
    if (pulserEntretienAvanceSiActif && !btnEntretienAvance.disabled) { ctDeclencherPulseBouton(btnEntretienAvance); }
  }
  if (zoneMessageEntretienAvance) {
    zoneMessageEntretienAvance.style.display = raisons.length ? 'block' : 'none';
    zoneMessageEntretienAvance.textContent = raisons.length ? 'Relancez d’abord l’analyse pour que l’entretien avancé tienne compte de ' + raisons.join(' et ') + '.' : '';
  }

  // TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS) : "Voir/
  // imprimer votre lettre" s'active des qu'au moins une recommandation a
  // ete appliquee a la lettre de motivation - pulse en bleu ~5 secondes
  // (reutilise .case-a-cocher-pulse, deja borne par CSS) UNE SEULE FOIS
  // par session, au moment ou il devient disponible pour la 1ere fois,
  // jamais a chaque re-rendu.
  var btnVoirLettre = document.getElementById('ctBoutonVoirLettre');
  if (btnVoirLettre) {
    var lettreImprimable = Object.keys(_ctRecommandationsLettreAppliquees).length > 0;
    btnVoirLettre.disabled = !lettreImprimable;
    btnVoirLettre.style.opacity = lettreImprimable ? '1' : '0.45';
    var phraseLettre = document.getElementById('ctPhraseVoirLettre');
    if (phraseLettre) { phraseLettre.style.display = lettreImprimable ? 'none' : 'block'; }
    if (lettreImprimable && !_ctPulseVoirLettreMontre) {
      btnVoirLettre.classList.add('case-a-cocher-pulse');
      _ctPulseVoirLettreMontre = true;
    }
  }
}

// TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS) : reutilise
// l'ecran/export deja existant du module Lettre (dossier.dernierDocumentPrepare
// + naviguerVers('resultats'), meme convention que partout ailleurs dans
// l'app) -- jamais un nouveau systeme d'impression construit pour ce
// module, celui-ci existe deja.
// TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS -- "je ne veux
// pas me retrouver sur la page Action, ce n'est pas possible") : jamais
// naviguerVers('resultats') (parcours complet, 3 versions de lettre,
// barre de navigation totalement differente -- desorientant pour qui n'a
// jamais fait ce parcours). Fenetre dediee et legere, meme famille que
// ctOuvrirApercuImpressionEntretienAvance() : imprimer + copier le
// texte, plus un formulaire pour les coordonnees (expediteur ET
// destinataire), jamais construites ailleurs pour une lettre deposee
// seulement via ce module.
var _ctApercuLettreValeurs = null;
var _ctApercuLettreDonneesDetectees = false;

// Detection SIMPLE (motifs email/telephone), jamais un assistant pour ca --
// fiable techniquement (un motif correspond ou non), pas de risque
// d'invention contrairement a une extraction par IA. Sert uniquement a
// distinguer "vérifiez vos informations" (motif trouve, probablement pas
// anonymise) de "ajoutez vos informations" (rien trouve, probablement
// anonymise ou jamais fourni) -- jamais a extraire un nom, impossible a
// detecter de façon fiable par un motif.
function ctDetecterCoordonneesDansTexte(texte) {
  texte = texte || '';
  var email = (texte.match(/[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/) || [])[0] || '';
  var telephone = (texte.match(/0[1-9](?:[\s.-]?\d{2}){4}/) || [])[0] || '';
  return { email: email, telephone: telephone };
}

function ctVoirImprimerLettre() {
  if (typeof trackEvenement === 'function') { trackEvenement('coherence_transversale_voir_lettre'); }
  var dossierTransversal = ctObtenirDossier();
  var texteLettreCT = (dossierTransversal && dossierTransversal.lettre) || '';
  var texteLettreActuel = (typeof dossier !== 'undefined' && dossier.ia && dossier.ia.lettre && dossier.ia.lettre.lettre && dossier.ia.lettre.lettre.texte) || texteLettreCT;
  var identite = (typeof dossier !== 'undefined' && dossier.identite) || {};
  var rc = (typeof dossier !== 'undefined' && dossier.rechercheCandidature) || {};
  var detection = ctDetecterCoordonneesDansTexte(texteLettreActuel);
  // TACHE (version courte pour un email, 2026-08-25, DECISION DE DENIS) :
  // decorative -- absente si le diagnostic n'a pas encore ete regenere
  // avec ce champ, le bouton correspondant reste alors simplement absent
  // du panneau (voir ctOuvrirPanneauApercuLettre).
  var diagnostic = ctObtenirDiagnostic();
  var texteLettreCourte = (diagnostic && diagnostic.resultat && diagnostic.resultat.lettreVersionCourte) || null;

  _ctApercuLettreDonneesDetectees = !!(identite.email || identite.telephone || detection.email || detection.telephone);
  _ctApercuLettreValeurs = {
    nom: identite.nom || '',
    prenom: identite.prenom || '',
    telephone: identite.telephone || detection.telephone,
    email: identite.email || detection.email,
    adresse: identite.adresse || '',
    entreprise: rc.entreprise || '',
    civiliteRecruteur: rc.civiliteRecruteur || '',
    nomRecruteur: rc.nomRecruteur || '',
    adresseEntreprise: '',
    objet: ''
  };
  ctOuvrirPanneauApercuLettre(texteLettreActuel, texteLettreCourte);
}

function ctHtmlDocumentImprimableLettre(valeurs, texteLettre) {
  var expediteur = [
    (valeurs.prenom || valeurs.nom) ? (valeurs.prenom + ' ' + valeurs.nom).trim() : '',
    valeurs.adresse, valeurs.telephone, valeurs.email
  ].filter(Boolean).map(echapperAttribut).join('<br>');
  var destinataireNom = [valeurs.civiliteRecruteur, valeurs.nomRecruteur].filter(Boolean).join(' ');
  var destinataire = [
    valeurs.entreprise,
    destinataireNom ? ('À l’attention de ' + destinataireNom) : '',
    valeurs.adresseEntreprise
  ].filter(Boolean).map(echapperAttribut).join('<br>');

  return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Lettre de motivation</title>' +
    '<style>' +
    'body{font-family:"Segoe UI",Arial,sans-serif;color:#1F2937;max-width:700px;margin:2rem auto;padding:0 1.5rem;line-height:1.6;}' +
    '.ct-lettre-entete{display:flex;justify-content:space-between;gap:1rem;margin-bottom:2rem;flex-wrap:wrap;}' +
    '.ct-lettre-destinataire{text-align:right;}' +
    '.ct-lettre-objet{font-weight:700;margin-bottom:1.5rem;}' +
    // TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS -- "je ne
    // veux pas d'un texte modifiable ET un aperçu separe, ca fait double
    // emploi, c'est perturbant") : contenteditable DIRECTEMENT sur le
    // corps affiche, jamais une 2e zone de texte a cote qui montrerait la
    // meme chose deux fois. Coordonnees/destinataire restent modifiables
    // UNIQUEMENT via le formulaire de gauche (jamais editables ici,
    // sinon 2 sources de verite pour la meme information).
    '.ct-lettre-corps{white-space:pre-wrap;outline:none;}' +
    '.ct-lettre-corps:focus{background:#FFFDF0;}' +
    '@media print{body{margin:0;padding:1rem;} .ct-lettre-corps:focus{background:transparent;}}' +
    '</style></head><body>' +
    '<div class="ct-lettre-entete"><div>' + (expediteur || '<span style="color:#9CA3AF;">Vos coordonnées apparaîtront ici</span>') + '</div>' +
    '<div class="ct-lettre-destinataire">' + destinataire + '</div></div>' +
    (valeurs.objet ? '<p class="ct-lettre-objet">Objet : ' + echapperAttribut(valeurs.objet) + '</p>' : '') +
    '<div class="ct-lettre-corps" contenteditable="true" spellcheck="false">' + echapperAttribut(texteLettre || '') + '</div>' +
    '</body></html>';
}

// TACHE (version courte pour un email, 2026-08-25, DECISION DE DENIS) :
// jamais d'en-tete/destinataire ici -- ce texte est destine a etre colle
// TEL QUEL dans le corps d'un email, pas imprime comme une lettre.
// contenteditable directement ici aussi, meme principe que la version
// longue -- un seul texte visible, jamais une copie modifiable a part.
function ctHtmlDocumentCourtLettre(texteCourt) {
  return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Version courte - email</title>' +
    '<style>body{font-family:"Segoe UI",Arial,sans-serif;color:#1F2937;max-width:700px;margin:2rem auto;padding:0 1.5rem;line-height:1.6;}' +
    '.ct-lettre-corps{white-space:pre-wrap;outline:none;}' +
    '.ct-lettre-corps:focus{background:#FFFDF0;}</style>' +
    '</head><body><div class="ct-lettre-corps" contenteditable="true" spellcheck="false">' + echapperAttribut(texteCourt || '') + '</div></body></html>';
}

function ctRafraichirApercuLettre() {
  var iframe = document.getElementById('iframeApercuLettre');
  if (!iframe) { return; }
  if (_ctApercuLettreModeCourtActif) {
    iframe.srcdoc = ctHtmlDocumentCourtLettre(_ctApercuLettreTexteCourt);
  } else if (_ctApercuLettreValeurs) {
    iframe.srcdoc = ctHtmlDocumentImprimableLettre(_ctApercuLettreValeurs, _ctApercuLettreTexteActuel);
  }
}

// TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS) : appelee a
// chaque (re)chargement de l'iframe (evenement 'load', jamais une seule
// fois -- ctRafraichirApercuLettre() remplace tout le document a chaque
// changement de coordonnees/destinataire/objet, ce qui detruit et
// recree le noeud contenteditable a chaque fois). Lit .innerText (texte
// simple, jamais innerHTML) pour rester coherent avec le stockage texte
// brut utilise partout ailleurs (impression, copie).
function ctBrancherEditionCorpsLettre() {
  var iframe = document.getElementById('iframeApercuLettre');
  var corps = iframe && iframe.contentDocument && iframe.contentDocument.querySelector('.ct-lettre-corps');
  if (!corps) { return; }
  corps.addEventListener('input', function () {
    if (_ctApercuLettreModeCourtActif) { _ctApercuLettreTexteCourt = corps.innerText; } else { _ctApercuLettreTexteActuel = corps.innerText; }
  });
}

// TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS) : bascule
// entre la lettre complete (imprimable, avec en-tete) et la version
// courte pour un email (copie uniquement, jamais imprimable -- elle n'a
// pas vocation a etre un document autonome). Pulse "Copier le texte" en
// bleu ~5s (reutilise .case-a-cocher-pulse) pour attirer l'oeil des
// qu'on bascule sur ce mode, ou la copie devient l'action attendue.
function ctBasculerModeCourtLettre() {
  _ctApercuLettreModeCourtActif = !_ctApercuLettreModeCourtActif;
  var btnToggle = document.getElementById('ctBoutonVersionCourteLettre');
  var btnImprimer = document.getElementById('btnImprimerApercuLettre');
  var btnCopier = document.getElementById('btnCopierApercuLettre');
  if (btnToggle) { btnToggle.textContent = _ctApercuLettreModeCourtActif ? '↩ Revenir à la lettre complète' : '✉ Utiliser la version courte pour un email'; }
  if (btnImprimer) {
    btnImprimer.disabled = _ctApercuLettreModeCourtActif;
    btnImprimer.style.opacity = _ctApercuLettreModeCourtActif ? '0.45' : '1';
  }
  if (_ctApercuLettreModeCourtActif && btnCopier) { ctDeclencherPulseBouton(btnCopier, 'case-a-cocher-pulse'); }
  var indicateurMode = document.getElementById('ctApercuLettreModeIndicateur');
  if (indicateurMode) {
    indicateurMode.textContent = _ctApercuLettreModeCourtActif
      ? 'Vous modifiez la version courte (pour un email) - cliquez directement dans le texte pour le modifier.'
      : 'Vous modifiez la lettre complète - cliquez directement dans le texte pour le modifier.';
  }
  ctRafraichirApercuLettre();
  if (typeof trackEvenement === 'function') { trackEvenement('coherence_transversale_lettre_version_courte', { actif: _ctApercuLettreModeCourtActif }); }
}

// Panneau plein ecran leger, meme shell que ctOuvrirApercuImpressionEntretienAvance() --
// mais avec un vrai formulaire (pas seulement une lecture) pour les
// coordonnees, mis a jour en direct dans l'apercu a chaque saisie.
var _ctApercuLettreTexteActuel = '';
var _ctApercuLettreTexteCourt = null;
var _ctApercuLettreModeCourtActif = false;
function ctOuvrirPanneauApercuLettre(texteLettreActuel, texteLettreCourte) {
  _ctApercuLettreTexteActuel = texteLettreActuel;
  _ctApercuLettreTexteCourt = texteLettreCourte;
  _ctApercuLettreModeCourtActif = false;
  var v = _ctApercuLettreValeurs;
  var texteInvitePerso = _ctApercuLettreDonneesDetectees
    ? '&#128269; Nous avons retrouvé des informations dans votre lettre - vérifiez qu’elles sont correctes.'
    : '&#9997; Vos coordonnées ne sont pas encore renseignées (peut-être anonymisées volontairement avant l’analyse) - ajoutez-les si vous voulez qu’elles apparaissent sur le document.';

  var panneau = document.getElementById('ctPanneauApercuLettre');
  if (panneau) { panneau.remove(); }
  panneau = document.createElement('div');
  panneau.id = 'ctPanneauApercuLettre';
  panneau.style.cssText = 'position:fixed;inset:0;background:#e9e9e9;z-index:99999;display:flex;flex-direction:column;font-family:"Segoe UI",Roboto,system-ui,sans-serif;';
  panneau.innerHTML =
    '<div style="flex-shrink:0;padding:0.5rem 1rem;background:#111827;display:flex;align-items:center;justify-content:flex-end;gap:0.6rem;flex-wrap:wrap;">' +
    '<span style="color:#FFFFFF;margin-right:auto;font-weight:600;font-size:0.9rem;">Votre lettre de motivation</span>' +
    '<button type="button" id="btnCopierApercuLettre" style="font-size:0.9rem;font-weight:700;padding:0.5rem 1.1rem;background:#374151;color:#FFFFFF;border:none;border-radius:999px;cursor:pointer;">&#128203; Copier le texte</button>' +
    '<button type="button" id="btnImprimerApercuLettre" style="font-size:0.9rem;font-weight:700;padding:0.5rem 1.1rem;background:#0d6efd;color:#FFFFFF;border:none;border-radius:999px;cursor:pointer;">&#128424; Imprimer</button>' +
    '<button type="button" id="btnFermerApercuLettre" style="font-size:0.9rem;font-weight:700;padding:0.5rem 1.1rem;background:#374151;color:#FFFFFF;border:none;border-radius:999px;cursor:pointer;">✕ Fermer</button>' +
    '</div>' +
    '<div style="flex:1;display:flex;flex-wrap:wrap;overflow:auto;">' +
    '<div style="flex:1 1 320px;min-width:280px;max-width:420px;background:#FFFFFF;padding:1rem;overflow:auto;border-right:1px solid #E5E7EB;">' +
    '<h4 class="small" style="font-weight:700;margin-bottom:0.25rem;">&#128100; Vos coordonnées</h4>' +
    '<p class="text-muted small mb-2">' + texteInvitePerso + '</p>' +
    '<input type="text" id="ctApercuLettrePrenom" class="form-control form-control-sm mb-2" placeholder="Prénom" value="' + echapperAttribut(v.prenom) + '">' +
    '<input type="text" id="ctApercuLettreNom" class="form-control form-control-sm mb-2" placeholder="Nom" value="' + echapperAttribut(v.nom) + '">' +
    '<input type="text" id="ctApercuLettreAdresse" class="form-control form-control-sm mb-2" placeholder="Adresse" value="' + echapperAttribut(v.adresse) + '">' +
    '<input type="text" id="ctApercuLettreTelephone" class="form-control form-control-sm mb-2" placeholder="Téléphone" value="' + echapperAttribut(v.telephone) + '">' +
    '<input type="text" id="ctApercuLettreEmail" class="form-control form-control-sm mb-3" placeholder="Email" value="' + echapperAttribut(v.email) + '">' +
    '<h4 class="small" style="font-weight:700;margin-bottom:0.25rem;">&#127970; Destinataire</h4>' +
    '<p class="text-muted small mb-2">À compléter si vous les connaissez.</p>' +
    '<input type="text" id="ctApercuLettreEntreprise" class="form-control form-control-sm mb-2" placeholder="Nom de l’entreprise" value="' + echapperAttribut(v.entreprise) + '">' +
    '<input type="text" id="ctApercuLettreCiviliteRecruteur" class="form-control form-control-sm mb-2" placeholder="Civilité (Madame, Monsieur...)" value="' + echapperAttribut(v.civiliteRecruteur) + '">' +
    '<input type="text" id="ctApercuLettreNomRecruteur" class="form-control form-control-sm mb-2" placeholder="Nom du destinataire" value="' + echapperAttribut(v.nomRecruteur) + '">' +
    '<input type="text" id="ctApercuLettreAdresseEntreprise" class="form-control form-control-sm mb-2" placeholder="Adresse de l’entreprise" value="' + echapperAttribut(v.adresseEntreprise) + '">' +
    '<input type="text" id="ctApercuLettreObjet" class="form-control form-control-sm mb-2" placeholder="Objet (ex. Candidature au poste de...)" value="' + echapperAttribut(v.objet) + '">' +
    // TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS) : sous
    // "Destinataire", ou il restait beaucoup de place - absent entierement
    // si le diagnostic n'a pas encore ete regenere avec ce champ (jamais
    // un bouton qui ne ferait rien).
    (texteLettreCourte
      ? '<div class="mt-3 pt-3" style="border-top:1px solid #E5E7EB;">' +
        '<h4 class="small" style="font-weight:700;margin-bottom:0.25rem;">&#9993; Version courte pour un email</h4>' +
        '<p class="text-muted small mb-2">Cette version courte remplace la lettre de motivation quand vous envoyez votre candidature par email : elle prend directement place dans le corps du message, votre CV restant la seule pièce jointe - inutile alors d’écrire un email d’accompagnement en plus d’une lettre séparée.</p>' +
        '<button type="button" id="ctBoutonVersionCourteLettre" class="btn btn-outline-secondary btn-sm w-100">✉ Utiliser la version courte pour un email</button>' +
        '</div>'
      : '') +
    '</div>' +
    // TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS -- "pas de
    // texte modifiable ET un aperçu separe, c'est perturbant, je veux
    // modifier le meme texte que je vois") : plus de zone de texte a
    // part -- juste un bandeau indicatif au-dessus de l'apercu (jamais
    // une 2e zone editable), le texte reellement modifiable vit
    // directement DANS l'apercu (contenteditable, voir ctHtmlDocumentImprimableLettre/
    // ctHtmlDocumentCourtLettre).
    '<div style="flex:2 1 400px;min-width:280px;display:flex;flex-direction:column;">' +
    '<div id="ctApercuLettreModeIndicateur" style="padding:0.4rem 1rem;background:#F9FAFB;border-bottom:1px solid #E5E7EB;font-size:0.8rem;color:#6B7280;">Vous modifiez la lettre complète - cliquez directement dans le texte pour le modifier.</div>' +
    '<iframe id="iframeApercuLettre" title="Aperçu de votre lettre de motivation" style="flex:1;min-height:200px;border:none;background:#FFFFFF;"></iframe>' +
    '</div>' +
    '</div>';
  document.body.appendChild(panneau);

  document.getElementById('btnFermerApercuLettre').addEventListener('click', function () { panneau.remove(); });
  document.getElementById('btnImprimerApercuLettre').addEventListener('click', function () {
    var iframe = document.getElementById('iframeApercuLettre');
    if (iframe && iframe.contentWindow) { iframe.contentWindow.print(); }
  });
  document.getElementById('btnCopierApercuLettre').addEventListener('click', function (evt) {
    var texteACopier = _ctApercuLettreModeCourtActif ? _ctApercuLettreTexteCourt : _ctApercuLettreTexteActuel;
    if (typeof copierTexteVersPressePapier === 'function') { copierTexteVersPressePapier(texteACopier || '', evt.currentTarget); }
  });
  var btnVersionCourteLettre = document.getElementById('ctBoutonVersionCourteLettre');
  if (btnVersionCourteLettre) { btnVersionCourteLettre.addEventListener('click', ctBasculerModeCourtLettre); }
  // TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS) : rebranche
  // l'edition du corps a CHAQUE chargement de l'iframe (evenement natif
  // 'load', jamais un seul branchement -- srcdoc recree tout le document
  // a chaque rafraichissement, voir ctRafraichirApercuLettre()).
  document.getElementById('iframeApercuLettre').addEventListener('load', ctBrancherEditionCorpsLettre);

  var champs = ['Prenom', 'Nom', 'Adresse', 'Telephone', 'Email', 'Entreprise', 'CiviliteRecruteur', 'NomRecruteur', 'AdresseEntreprise', 'Objet'];
  var cleParChamp = { Prenom: 'prenom', Nom: 'nom', Adresse: 'adresse', Telephone: 'telephone', Email: 'email', Entreprise: 'entreprise', CiviliteRecruteur: 'civiliteRecruteur', NomRecruteur: 'nomRecruteur', AdresseEntreprise: 'adresseEntreprise', Objet: 'objet' };
  champs.forEach(function (champ) {
    var input = document.getElementById('ctApercuLettre' + champ);
    if (input) {
      input.addEventListener('input', function () {
        _ctApercuLettreValeurs[cleParChamp[champ]] = input.value;
        ctRafraichirApercuLettre();
      });
    }
  });

  ctRafraichirApercuLettre();
  if (typeof trackEvenement === 'function') { trackEvenement('coherence_transversale_lettre_apercu_ouvert'); }
}

function ctBrancherTableauDeBord() {
  if (_ctModifEnCours && typeof cablerDepotCVEnPage === 'function') { cablerDepotCVEnPage(_ctDepotModifCfg()); }
  document.querySelectorAll('[data-ct-modifier-document]').forEach(function (bouton) {
    bouton.addEventListener('click', function () { ctModifierDocument(bouton.dataset.ctModifierDocument); });
  });
  document.querySelectorAll('[data-ct-annuler-modification]').forEach(function (bouton) {
    bouton.addEventListener('click', function () { ctAnnulerModificationDocument(bouton.dataset.ctAnnulerModification); });
  });
  document.querySelectorAll('[data-ct-voir-resume]').forEach(function (bouton) {
    bouton.addEventListener('click', function () {
      var zone = document.getElementById('ct-resume-' + bouton.dataset.ctVoirResume);
      if (!zone) { return; }
      var visible = zone.style.display !== 'none';
      zone.style.display = visible ? 'none' : 'block';
      bouton.innerHTML = visible ? '&#128203; Voir le résumé' : '&#128203; Masquer le résumé';
    });
  });
  var btnRelancer = document.getElementById('ctBoutonRelancerAnalyse');
  if (btnRelancer) { btnRelancer.addEventListener('click', ctRelancerAnalyse); }

  var btnEntretienAvance = document.getElementById('ctBoutonEntretienAvance');
  if (btnEntretienAvance) { btnEntretienAvance.addEventListener('click', ctVerifierRecommandationsAvantEntretienAvance); }

  var btnVoirLettre = document.getElementById('ctBoutonVoirLettre');
  if (btnVoirLettre) { btnVoirLettre.addEventListener('click', ctVoirImprimerLettre); }

  ctActualiserBoutonRelancer(true);
  // TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS -- pulse
  // "Aller plus loin" seulement au montage) : jamais passer directement
  // ctActualiserBoutonRelancer comme gestionnaire d'evenement -- addEventListener
  // fournirait l'objet Event en 1er argument (toujours "truthy"), ce qui
  // declencherait le pulse a chaque frappe sans le vouloir.
  var ctReagirSaisieCandidature = function () { ctActualiserBoutonRelancer(); };
  ['ctChampOffreTdb', 'ctChampEntrepriseTdb', 'ctChampSiteTdb', 'ctChampTypeStructureTdb'].forEach(function (id) {
    var champ = document.getElementById(id);
    if (champ) { champ.addEventListener('input', ctReagirSaisieCandidature); champ.addEventListener('change', ctReagirSaisieCandidature); }
  });
}

// ---------- Branchement des evenements -- entretien avance ----------

function ctBrancherEntretienAvanceCollecte() {
  var btnAnnuler = document.getElementById('btnAnnulerEntretienAvance');
  if (btnAnnuler) { btnAnnuler.addEventListener('click', ctAnnulerEntretienAvance); }
  var btnValider = document.getElementById('btnValiderEntretienAvance');
  if (btnValider) { btnValider.addEventListener('click', ctValiderReponsesEntretienAvance); }
}

function ctBrancherEntretienAvanceChoixIA() {
  // TACHE (dette B.2, 2026-09-04) : le bloc "Ce qui va se passer" a clic
  // pour reveler a disparu avec le passage a htmlChoixAssistantBilanCorps()
  // (ctHtmlEtapeChoixIAEntretienAvance ci-dessus) -- les 4 temps sont deja
  // tous visibles dans l'accordeon du composant partage, plus rien a cabler
  // ici pour ce bloc.
  document.querySelectorAll('[data-assistant-entretien-avance]').forEach(function (bouton) {
    bouton.addEventListener('click', function () {
      var assistant = ASSISTANTS_IA.filter(function (a) { return a.id === bouton.dataset.assistantEntretienAvance; })[0];
      if (!assistant) { return; }
      if (typeof trackEvenement === 'function') { trackEvenement('coherence_transversale_entretien_avance_assistant_choisi', { assistant: assistant.id }); }

      var diagnostic = ctObtenirDiagnostic();
      var etat = ctEtatRecommandationsLettre(diagnostic);
      ctDemarrerEntretienAvance(_ctReponsesEntretienAvance || [], etat.appliquees, etat.nonAppliquees, {}).then(function (entretienAvanceGenere) {
        _ctEtapeEntretienAvance = null;
        if (typeof trackEvenement === 'function') { trackEvenement('coherence_transversale_entretien_avance_lance'); }
        ouvrirFenetreAssistantIA({
          nomAssistant: assistant.nom,
          idAssistant: assistant.id,
          urlAssistant: assistant.url,
          etapes: ETAPES_ASSISTANT_IA_TEXTE,
          construireTexteACopier: function () { return entretienAvanceGenere.promptTexte; },
          onApresValidation: function (urlAssistant, nomAssistant) {
            _etatTransitionIA = { urlAssistant: urlAssistant, nomAssistant: nomAssistant, phase: 'decompte', secondesRestantes: DUREE_DECOMPTE_IA_SECONDES };
            pageCoherenceTransversale();
          }
        });
      }).catch(function () {
        var zoneErreur = document.getElementById('ctErreurChoixIAEntretienAvance');
        if (zoneErreur) { zoneErreur.style.display = 'block'; zoneErreur.textContent = '⚠️ Une erreur est survenue, merci de réessayer.'; }
      });
    });
  });
}

// Duplique volontairement le mecanisme _etatTransitionIA/
// htmlBanniereTransitionIA()/_intervalleDecompteIA du 1er prompt
// (ctBrancherEvenements plus bas) : ce bloc vit dans la branche
// "diagnostic principal complet", jamais atteinte par le bloc equivalent
// du 1er prompt (qui suppose le diagnostic principal PAS complet). Meme
// id d'ancre (ctEtapeImportIAAncre) -- sans risque, un seul ecran de
// transition rendu a la fois (application mono-page).
function ctBrancherEntretienAvanceImportIA() {
  // Fenetre unique « Collez la reponse » (dette B.17, etape C, 2026-10-28) : « Coller la reponse » lit et verifie (analyseur pur) ; l'enregistrement a lieu au clic sur « Continuer ».
  var controleurEntretienAvance = brancherCollageUniquePage({
    suffixe: 'CoherenceEntretienAvance', idAncre: 'ctEtapeImportIAAncre', rerendre: pageCoherenceTransversale, evenementBloque: 'coherence_transversale_entretien_avance_popup_bloque',
    echecInitial: !!(typeof ctObtenirEntretienAvance === 'function' && ctObtenirEntretienAvance() && ctObtenirEntretienAvance().statut === 'echec_parsing'),
    module: {
      libelleSuite: 'Voir mon retour',
      quoi: 'L’assistant vient d’analyser vos réponses aux questions d’entretien : points forts, axes d’amélioration et recommandations.',
      pourquoi: 'Vous voyez ce qui est déjà solide et ce qui mérite d’être retravaillé avant le vrai entretien.',
      verif: 'ces conseils n’abordent que certains aspects de votre parcours : le recruteur pourra toujours poser d’autres questions et explorer d’autres dimensions de votre vie professionnelle. Gardez ce qui vous aide.'
    },
    verifier: function (texte) {
      try { ctParserReponseEntretienAvance(texte); return { ok: true }; } catch (erreur) { return { ok: false }; }
    },
    onChangerAssistant: function () { ctRevenirAuChoixIAEntretienAvance(); },
    onContinuer: function (texte) {
      try {
        ctSoumettreReponseEntretienAvance(texte, {});
        _etatTransitionIA = null;
        if (typeof trackEvenement === 'function') { trackEvenement('coherence_transversale_entretien_avance_complete'); }
        pageCoherenceTransversale();
      } catch (erreur) {
        if (controleurEntretienAvance) { controleurEntretienAvance.aller('echec'); }
      }
    }
  });
}

// Retour Denis 2026-09-30 (C9) : les rectangles explicatifs « Garder comme repere » et « Vos documents relus avant l'analyse » sont retires de cet
// ecran (ils repetaient la page de presentation du module). Les boutons « Garder comme Repere » de chaque carte restent.

// ---------- Branchement des evenements ----------

function ctBrancherEvenements(diagnostic, dossierExistant, entretienAvance) {
  // TACHE (chantier "bouton presentation", 2026-09-01) : bouton "Revoir la
  // presentation" (present sur tous les ecrans de travail) + bandeau
  // "Continuer / Recommencer" de la page de presentation. Cables ici, en
  // tete, null-guarde -- un seul point de re-rendu (pageCoherenceTransversale).
  var btnRevoirPres = document.getElementById('btnCoherenceRevoirPresentation');
  if (btnRevoirPres) {
    // Meme bouton, fonction inversee selon l'endroit : sur un ecran de
    // travail -> ouvre le detour vers la presentation ; sur la presentation
    // en detour -> revient au module (identique au "Retour" de la barre du bas).
    btnRevoirPres.addEventListener('click', function () {
      if (_ctVoirIntro) { ctFermerDetourIntro(); }
      else { _ctVoirIntro = true; pageCoherenceTransversale(); }
    });
  }
  // Bouton du bas de la presentation en detour ("Revenir au module") : meme
  // fonction que le bouton du haut et que le "Retour" de la barre du bas.
  var btnRevenirBas = document.getElementById('ctBoutonRevenirModule');
  if (btnRevenirBas) { btnRevenirBas.addEventListener('click', ctFermerDetourIntro); }

  // Encart "Continuer / Recommencer" (affiche a droite quand on revient dans
  // le module avec une analyse en cours -- _ctReprisePendante). Le module
  // reste gele tant que la personne n'a pas tranche.
  var btnRepriseContinuer = document.getElementById('ctRepriseContinuer');
  if (btnRepriseContinuer) { btnRepriseContinuer.addEventListener('click', ctRepriseContinuer); }
  var btnRepriseRecommencer = document.getElementById('ctRepriseRecommencer');
  if (btnRepriseRecommencer) {
    btnRepriseRecommencer.addEventListener('click', function () {
      confirmerAction(
        'Recommencer « Cohérence de mon dossier » ?',
        'Vous allez repartir du début sur ce module : l’analyse en cours et les documents déposés pour cette analyse seront effacés. Vos autres modules, Mes Repères et Mon Carnet ne sont pas touchés.',
        'Recommencer ce module', 'btn-danger', ctRecommencerDepuisIntro
      );
    });
  }
  // La pulsation de l'encart signale "une decision est attendue" ~10 s,
  // puis s'arrete (brique partagee, js/app.js).
  armerFinPulseEncartReprise();

  if (!dossierExistant && !diagnostic) {
    var btnJeCommence = document.getElementById('ctBoutonJeCommence');
    if (btnJeCommence) {
      btnJeCommence.addEventListener('click', function () {
        if (typeof trackEvenement === 'function') { trackEvenement('coherence_transversale_je_commence'); }
        _ctEnCollecte = true;
        pageCoherenceTransversale();
      });
    }
    return;
  }

  if (!diagnostic) {
    // TACHE (dette B.2, 2026-09-04) : le bloc "Ce qui va se passer" a clic
    // pour reveler a disparu avec htmlChoixAssistantBilanCorps()
    // (ctHtmlEtapeChoixIA ci-dessus) -- les 4 temps sont deja tous visibles
    // dans l'accordeon du composant partage, plus rien a cabler ici.
    document.querySelectorAll('[data-assistant-coherence]').forEach(function (bouton) {
      bouton.addEventListener('click', function () {
        var assistant = ASSISTANTS_IA.filter(function (a) { return a.id === bouton.dataset.assistantCoherence; })[0];
        if (!assistant) { return; }
        if (typeof trackEvenement === 'function') { trackEvenement('coherence_transversale_assistant_choisi', { assistant: assistant.id }); }

        ctDemarrerDiagnostic({}).then(function (diagnosticGenere) {
          if (typeof trackEvenement === 'function') { trackEvenement('coherence_transversale_diagnostic_lance'); }
          ouvrirFenetreAssistantIA({
            nomAssistant: assistant.nom,
            idAssistant: assistant.id,
            urlAssistant: assistant.url,
            etapes: ETAPES_ASSISTANT_IA_TEXTE,
            construireTexteACopier: function () { return diagnosticGenere.promptTexte; },
            onApresValidation: function (urlAssistant, nomAssistant) {
              _etatTransitionIA = { urlAssistant: urlAssistant, nomAssistant: nomAssistant, phase: 'decompte', secondesRestantes: DUREE_DECOMPTE_IA_SECONDES };
              pageCoherenceTransversale();
            }
          });
        }).catch(function () {
          var zoneErreur = document.getElementById('ctErreurChoixIA');
          if (!zoneErreur) { return; }
          zoneErreur.style.display = 'block';
          zoneErreur.textContent = '⚠️ Une erreur est survenue, merci de réessayer.';
        });
      });
    });
    return;
  }

  if (diagnostic.statut === 'complete') {
    // TACHE (entretien avance, Pass B, 2026-08-25, DECISION DE DENIS) :
    // ces 3 branches interceptent AVANT le rapport principal -- une fois
    // le diagnostic principal complet, tout le reste du parcours possible
    // (collecte/choix_ia/import/rapport de l'entretien avance) reste dans
    // cette meme branche "diagnostic.statut === 'complete'".
    if (_ctEtapeEntretienAvance === 'collecte') { ctBrancherEntretienAvanceCollecte(); return; }
    if (_ctEtapeEntretienAvance === 'choix_ia') { ctBrancherEntretienAvanceChoixIA(); return; }
    if (entretienAvance && entretienAvance.statut !== 'complete') { ctBrancherEntretienAvanceImportIA(); return; }
    if (entretienAvance && entretienAvance.statut === 'complete' && !_ctAfficherRapportPrincipal) {
      var btnApercuImpression = document.getElementById('ctBoutonApercuImpressionEntretienAvance');
      if (btnApercuImpression) { btnApercuImpression.addEventListener('click', function () { ctOuvrirApercuImpressionEntretienAvance(entretienAvance); }); }
      var btnRetourRapportPrincipal = document.getElementById('ctBoutonRetourRapportPrincipal');
      if (btnRetourRapportPrincipal) { btnRetourRapportPrincipal.addEventListener('click', ctRevenirAuRapportPrincipal); }
      var btnRefaireEntretienAvance = document.getElementById('ctBoutonRefaireEntretienAvance');
      if (btnRefaireEntretienAvance) { btnRefaireEntretienAvance.addEventListener('click', ctVerifierRecommandationsAvantEntretienAvance); }
      return;
    }

    if (typeof reperesBrancherBoutonAncre === 'function') { reperesBrancherBoutonAncre(); }
    ctBrancherActionsRecommandations(diagnostic);
    ctBrancherTableauDeBord();
    return;
  }

  // ---------- Ecran « Collez la reponse » (fenetre unique, dette B.17, etape C, 2026-10-28) ----------
  // « Coller la reponse » lit et verifie (analyseur pur) sans rien enregistrer ; l'enregistrement a lieu au clic sur « Continuer » (barre du bas).
  var controleurCoherence = brancherCollageUniquePage({
    suffixe: 'CoherenceTransversale', idAncre: 'ctEtapeImportIAAncre', rerendre: pageCoherenceTransversale, evenementBloque: 'coherence_transversale_popup_bloque',
    echecInitial: !!(diagnostic && diagnostic.statut === 'echec_parsing'),
    module: {
      libelleSuite: 'Voir mon rapport',
      quoi: 'L’assistant vient de comparer vos documents : il repère ce qui se tient bien et ce qui se contredit.',
      pourquoi: 'Un recruteur remarque vite les écarts entre un CV et une lettre : mieux vaut les repérer vous-même avant lui.',
      verif: 'regardez que les remarques correspondent bien à vos documents.'
    },
    verifier: function (texte) {
      try {
        ctParserReponseDiagnostic(texte);
        return { ok: true };
      } catch (erreur) {
        // TACHE (retour Denis, 2026-08-31, Chantier 4) : l'assistant a repondu que les pieces fournies ne permettent aucune analyse de coherence
        // -> explication dans la fenetre qui ramene au depot, jamais un message d'echec de format ni un rapport vide.
        if (erreur && erreur.code === 'SaisieInexploitable') {
          return { ok: false, personnalise: {
            texte: '<strong>Les pièces analysées ne sont pas exploitables.</strong> Ce n’est pas un souci de copier-coller : le CV ou la lettre transmis étaient vides, trop courts, ou illisibles.' +
              (erreur.message ? '<br><em>' + echapperAttribut(erreur.message) + '</em><br>' : ' ') + 'Revenez au dépôt et fournissez un CV et une lettre lisibles.',
            bouton: { libelle: 'Revenir au dépôt' }
          } };
        }
        return { ok: false };
      }
    },
    onEchecAction: function () {
      // Le dossier/diagnostic inexploitables sont effaces (comme avant), puis on atterrit directement sur l'ecran de collecte (page).
      if (typeof ctStoreReinitialiser === 'function') { ctStoreReinitialiser(); }
      _ctCollecteEtat = null;
      _ctReinitialiserDepots();
      _ctEnCollecte = true;
      pageCoherenceTransversale();
    },
    onChangerAssistant: function () { ctRevenirAuChoixIA(); },
    onContinuer: function (texte) {
      try {
        ctSoumettreReponseDiagnostic(texte, {});
        _etatTransitionIA = null;
        if (typeof trackEvenement === 'function') { trackEvenement('coherence_transversale_diagnostic_complete'); }
        pageCoherenceTransversale();
      } catch (erreur) {
        if (controleurCoherence) { controleurCoherence.aller('echec'); }
      }
    }
  });
}

// ---------- Actions des recommandations (rapport termine) ----------

// Met a jour UNIQUEMENT la carte concernee (jamais ctHtmlRapport() dans son
// ensemble, qui refermerait tous les accordeons deja ouverts -- meme
// principe que bilanRafraichirCarteIgnorable(), js/app.js).
function ctBrancherActionsRecommandations(diagnostic) {
  var recommandations = (diagnostic.resultat && diagnostic.resultat.recommandations) || [];

  document.querySelectorAll('[data-ct-appliquer-lettre]').forEach(function (bouton) {
    bouton.addEventListener('click', function () {
      var idReco = bouton.dataset.ctAppliquerLettre;
      var reco = recommandations.filter(function (r) { return r.id === idReco; })[0];
      if (!reco) {
        // Retour Denis 2026-09-30 (C7) : jamais un clic sans réaction. Deuxième chance sur le diagnostic enregistré, sinon un message visible.
        var diagnosticEnregistre = (typeof ctObtenirDiagnostic === 'function') ? ctObtenirDiagnostic() : null;
        var autres = (diagnosticEnregistre && diagnosticEnregistre.resultat && diagnosticEnregistre.resultat.recommandations) || [];
        reco = autres.filter(function (r) { return r.id === idReco; })[0];
      }
      if (!reco) {
        var zoneSansReco = document.getElementById('ct-reco-actions-' + idReco);
        if (zoneSansReco) { zoneSansReco.innerHTML = '<span class="text-muted small">Cette recommandation n’est plus disponible. Relancez l’analyse pour la retrouver.</span>'; }
        return;
      }
      var succes = ctAppliquerCorrectionLettre(reco);
      if (typeof trackEvenement === 'function') { trackEvenement('coherence_transversale_correction_appliquee', { document: 'lettre', succes: succes }); }
      var zoneActions = document.getElementById('ct-reco-actions-' + reco.id);
      if (zoneActions) {
        // TACHE (retour utilisateur, 2026-08-25 : "je ne sais pas ou cette
        // information va, comment je vois que ca a ete fait") : le nouveau
        // texte est reaffiche ICI MEME, immediatement -- jamais un renvoi
        // vers un autre ecran (verifie : "Co-construire ma lettre" rouvre
        // un nouvel assistant de depot, pas un simple apercu du texte
        // actuel -- y renvoyer n'aurait rien montre d'utile).
        zoneActions.innerHTML = succes
          ? '<div style="color:var(--success-strong);"><strong>&#10003; Appliqué à votre lettre de motivation :</strong><br>' +
            '<span class="small">« ' + echapperAttribut(reco.textePropose || '') + ' »</span>' +
            // TACHE (retour utilisateur, 2026-08-25, DECISION DE DENIS) :
            // signale au moment meme ou ca devient vrai - le bouton "Voir/
            // imprimer votre lettre" (tableau de bord) vient de s'activer.
            '<p class="text-muted small mb-0 mt-1">Vous pouvez maintenant consulter et imprimer votre lettre de motivation à jour, via le bouton « Voir/imprimer votre lettre » en haut de cette page.</p>' +
            '</div>'
          : '<span class="text-muted small">Aucune lettre à modifier n’a été trouvée.</span>';
      }
      if (succes) {
        _ctRecommandationsLettreAppliquees[reco.id] = true;
        ctActualiserBoutonRelancer();
        // Retour Denis 2026-09-30 (C7) : « Appliquer à ma lettre » ne semblait rien faire. La personne arrive maintenant directement sur
        // l'écran de sa lettre, à jour, où elle peut la relire et la modifier.
        ctVoirImprimerLettre();
      }
    });
  });

  document.querySelectorAll('[data-ct-corriger-cv]').forEach(function (bouton) {
    bouton.addEventListener('click', function () {
      if (typeof trackEvenement === 'function') { trackEvenement('coherence_transversale_vers_bilan'); }
      // TACHE (transfert Coherence transversale -> Bilan, 2026-08-25,
      // DECISION DE DENIS) : recommandations visant le CV transmises en
      // contexte (global transitoire _ctElementsPourBilan, lue et effacee
      // au depot final dans brancherEvenementsBilanPreparer(), js/app.js)
      // + appel du VRAI point d'entree du Bilan
      // (demarrerBilanCandidatureAvecDepot() -> ecran "Preparer", pas un
      // simple naviguerVers('bilan') qui laissait la personne face a un
      // ecran de choix d'assistant sans aucune candidature deposee si elle
      // n'avait jamais utilise le Bilan auparavant).
      var elements = ctConstruireElementsPourBilan(recommandations);
      if (elements && typeof window !== 'undefined') { window._ctElementsPourBilan = elements; }
      if (typeof demarrerBilanCandidatureAvecDepot === 'function') {
        // Le CV est le meme que celui deja depose, relu et masque pour cette analyse : il est repris, sans le faire revalider.
        var dossierCT = (typeof ctObtenirDossier === 'function') ? ctObtenirDossier() : null;
        demarrerBilanCandidatureAvecDepot({ cvDejaRelu: (dossierCT && typeof dossierCT.cv === 'string') ? dossierCT.cv : undefined });
      } else {
        naviguerVers('bilan');
      }
    });
  });
}

// Recommandations visant le CV (documentCible cv/plusieurs), formatees en
// texte libre lisible pour le Prompt 1 du Bilan (voir prompts/bilan-v1.md,
// placeholder ELEMENTS_DEJA_IDENTIFIES_OU_NON_FOURNIS) -- null si aucune,
// jamais un bloc vide transmis.
function ctConstruireElementsPourBilan(recommandations) {
  var pertinentes = (recommandations || []).filter(function (r) { return r.documentCible === 'cv' || r.documentCible === 'plusieurs'; });
  if (!pertinentes.length) { return null; }
  return pertinentes.map(function (r) {
    return '- ' + r.contenu + (r.textePropose ? ' (' + r.textePropose + ')' : '');
  }).join('\n');
}
