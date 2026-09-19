/* ============================================================
   decouverteParcours.js
   ------------------------------------------------------------
   Module « Découverte et valorisation des compétences ».
   Répond à : document 1 §4 (parcours) et §5 (interface).

   HOMOGÉNÉITÉ (exigée explicitement) : ce fichier ne crée quasiment
   aucun nouveau composant visuel. Il réutilise :
   - le squelette de fenêtre modale à étapes déjà établi par
     ouvrirAssistantDepotCV() (metiers.js) : état partagé unique, fenêtre
     remplacée intégralement à chaque étape (jamais empilée), pied de
     page Retour/Continuer uniforme ;
   - htmlCollageInstantane()/activerCollageInstantane() (app.js) pour
     TOUT échange avec un assistant externe, y compris le raffinement
     (le même composant, avec un simple suffixe différent) ;
   - ASSISTANTS_IA, stylePastilleInline(), le schéma numéroté déjà
     construit pour "Choisissez votre assistant" ;
   - .carte/.carte.active-card pour les choix simples (Oui/Non) ;
   - .reco-item/.reco-rang/.reco-case pour les propositions à choisir
     par fragment (même composant que les 5 accroches du CV) ;
   - ouvrirFenetreERIP()/confirmerAction() pour toute fenêtre secondaire.

   ÉTAPES (consolidées par rapport au document 1, §4) : la "présentation
   de la saisie libre" et la "saisie libre" elle-même sont fusionnées en
   un seul écran (un court texte d'intro au-dessus de la zone de texte,
   plutôt que deux écrans successifs dont le premier n'aurait aucune
   action propre) -- même contenu que le document 1, moins de clics,
   cohérent avec le principe d'accessibilité cognitive (§4 du présent
   fichier, doc1 §3.1 principe 6). De même, "identification des manques"
   (étape 6 du document) n'a jamais d'écran propre : c'est une évaluation
   invisible qui alimente directement l'étape "Questions ciblées",
   absente du parcours si rien ne la déclenche.
   ============================================================ */

// TACHE (retour utilisateur : preuve directe via export JSON du dossier --
// "objectifProfessionnel" valait exactement "Restauration", tapé tel quel
// dans "métier précis" alors que c'est un secteur du référentiel, pas un
// poste précis) : jamais un bug à proprement parler -- "métier précis"
// reprend le texte tel quel comme titre, correct pour un vrai poste
// ("Plaquiste"), mais trompeur pour un secteur générique. Détecte si le
// texte saisi correspond exactement (après normalisation) à un secteur
// connu de secteursDisponibles() (app.js, déjà utilisée pour le mode
// "domaine", jamais dupliquée ici) -- si oui, applique le même préfixe
// "Profil polyvalent —" que ce mode, sans que la personne ait besoin de
// deviner la bonne case à cocher entre "métier précis" et "domaine".
function construireTitreDepuisMetierOuSecteur(texte) {
  if (!texte) { return texte; }
  var secteurs = (typeof secteursDisponibles === 'function') ? secteursDisponibles() : [];
  var correspond = secteurs.some(function (s) {
    return (typeof normaliserTexte === 'function' ? normaliserTexte(s.nom) : s.nom.toLowerCase()) ===
      (typeof normaliserTexte === 'function' ? normaliserTexte(texte) : texte.toLowerCase());
  });
  return correspond ? ('Profil polyvalent - ' + texte) : texte;
}

// TACHE (retour Denis, 2026-08-31) : barre d'etapes visuelle du module.
// Les 8 etapes techniques actuelles (afficherEtape 1..8) sont regroupees
// en 5 reperes lisibles -- alignes sur la proposition de parcours
// consolide (docs/CONSOLIDATION_DECOUVERTE_PROPOSITION_2026-08-31.md et
// docs/MAQUETTE_DECOUVERTE_CONSOLIDE_2026-08-31.html). Rendu via
// barreEtapesModule() (js/app.js), meme composant que "Analyser ma
// candidature".
// TACHE (chantier "2e passage IA obligatoire pour Decouvrir mes
// competences", sous-etape 6/8, docs/CHANTIER_DECOUVERTE_2E_PASSAGE_REDACTION.md) :
// l'ancien repere "Mon CV" (aboutissement du module, atteint seulement sur
// pageResultats) devient "Rediger mon CV" -- il couvre desormais un vrai
// morceau du parcours (etapes 9 a 12, jusque-la provisoirement rattachees
// a "Completer"). Un nouveau 7e repere "Mon CV" le remplace comme
// aboutissement (mise en page/export, deja generique -- pageResultats()
// elle-meme, aucun nouvel ecran). Renommage + ajout, jamais de suppression :
// zero fonction perdue (regle "zero regression").
var DECOUVERTE_NAV_ETAPES = [
  { label: 'Préparer', icone: '&#128221;' },
  { label: 'Assistant', icone: '&#128172;' },
  { label: 'Réponse', icone: '&#128229;' },
  { label: 'Compétences', icone: '&#128161;' },
  { label: 'Compléter', icone: '&#128203;' },
  { label: 'Rédiger mon CV', icone: '&#9999;' },
  // TACHE (retour Denis, 2026-08-31, point 6) : 7e repere (ex-6e), l'aboutissement
  // du module. Visible en gris des le debut du parcours (rassure : "ca
  // mene a un vrai CV"). Devient courant sur pageResultats() quand on
  // vient de Decouverte, puis termine une fois le CV exporte. Le mapping
  // _decouverteNavIndex ci-dessous n'y touche pas (il ne couvre que les
  // etapes du parcours lui-meme) -- l'index 6 reste donc "a venir"
  // pendant tout le parcours.
  { label: 'Mon CV', icone: '&#128196;' }
];
// numero d'etape technique -> index de repere.
//   1 accueil / 2 coordonnees / 3 recit        -> 0 Preparer
//   4 choix assistant                          -> 1 Assistant
//   5 coller la reponse                        -> 2 Reponse
//   6 decouverte / 7 questions ciblees         -> 3 Competences
//   8 vos informations (identite/formations/savoir-faire/complements) -> 4 Completer
//   9 vos experiences / 10 style d'ecriture / 11 choix assistant (redaction) /
//   12 coller reponse (redaction) / 13 relecture -> 5 Rediger mon CV
//   (le repere 6 "Mon CV" n'est atteint que sur pageResultats, hors parcours)
function _decouverteNavIndex(numero) {
  var table = [null, 0, 0, 0, 1, 2, 3, 3, 4, 5, 5, 5, 5, 5];
  var i = table[numero];
  return (typeof i === 'number') ? i : -1;
}

// TACHE (retour Denis, 2026-08-31) : le parcours Decouverte n'est PLUS une
// fenetre modale (#decouverteCompetencesFenetre) mais une VRAIE PAGE
// (route 'decouverte'). Le module ne depose pas de CV -- aucune raison
// d'empiler des fenetres. La machine a etats (etat + afficherEtape + les
// etape*()) reste une closure de ouvrirDecouverteCompetences() ; on
// expose seulement une reference a afficherEtape et le numero courant,
// pour que pageDecouverte() (routeur) redessine la bonne etape apres une
// navigation (ex. aller-retour vers 'resultats', "Revoir la
// presentation"). L'etat n'est jamais reconstruit -- seul recommencer()
// (js/app.js -> fermerDecouverteCompetences) repart de zero.
var _decouverteRenduEtape = null;   // fonction afficherEtape de la session en cours, ou null
// TACHE (retour Denis, 2026-09-18, point 2 de sa liste de corrections :
// "deux boutons retour, c'est incoherent" -- un seul garde, celui de la
// barre du bas avec Accueil, qui reprend le comportement "page arriere"
// de l'ancien bouton dans la page) : reference a la fonction de recul
// (definie dans afficherEtape, portee sur numero/etat courants), reposee
// a CHAQUE rendu -- barreNavigation() ne peut appeler qu'une chaine JS
// globale (onclick="..."), jamais une fonction fermee sur une closure.
var _decouverteAgirRetour = null;
var _decouverteNumeroCourant = 1;   // derniere etape rendue (1..8)
// TACHE (retour Denis, 2026-08-31) : numero de l'etape REELLEMENT peinte
// dans #app. Sert a distinguer un simple re-rendu du meme ecran (clic
// Oui/Non, Valider... -> on garde la position de lecture) d'un vrai
// changement d'ecran ou d'une (re)entree dans le parcours (-> on remonte
// en haut). Remis a null par fermerDecouverteCompetences().
var _decouverteEtapeRendueDom = null;
// TACHE (retour Denis, 2026-08-31) : la zone de saisie du recit pulse en
// vert ~10 s a la PREMIERE arrivee sur l'etape "Preparer" (pas a chaque
// re-rendu declenche par un choix plus bas). Ce drapeau garantit "une
// seule fois par session" -- remis a false par fermerDecouverteCompetences().
var _decouvertePulseRecitVu = false;
// TACHE (retour Denis, 2026-08-31, Chantier 4) : quand on revient a l'etape
// "Preparer" via le bouton "Revenir a mon recit" de l'ecran "saisie
// inexploitable", une petite croix apparait en haut a droite de la zone de
// recit : un clic efface TOUT le texte, pour ne pas avoir a le supprimer a
// la main. Visible seulement dans ce cas ; retiree des que la personne
// touche le recit, quitte la page "Preparer", ou clique la croix.
var _decouverteRecitAEffacer = false;
// TACHE (retour Denis, 2026-09-19, point 4 de sa 2e liste de corrections :
// "j'arrive sur Vos expériences, je veux que le rectangle soit ouvert pour
// voir clairement qu'on peut ajouter une expérience") : ouvre le bloc
// experiences-pro UNE SEULE fois, a la premiere arrivee sur cette etape --
// jamais force a chaque re-rendu (sinon impossible pour la personne de le
// refermer elle-meme apres). Remis a false par fermerDecouverteCompetences().
var _decouverteExperiencesBlocAmorce = false;
// TACHE (retour Denis, 2026-09-19, point 6) : etat d'ouverture par defaut
// des 4 blocs de la nouvelle etape "Vos informations" (Vous/Parcours/
// Experiences perso/Complements), applique UNE seule fois -- jamais
// _vosInfosBlocsInitialises (js/app.js, propre a la VRAIE page "Vos
// informations", pageProjet()). Remis a false par fermerDecouverteCompetences().
var _decouverteInfosBlocsInitialisees = false;
// TACHE (retour Denis, 2026-09-19, point 5 de sa 3e liste de corrections,
// UNIQUEMENT pour Decouverte -- confirme par Denis, jamais applique a la
// VRAIE page "Vos informations") : cascade d'ouverture/fermeture entre
// les 4 blocs de "Vos informations", au-dela de la simple regle
// "pasDeFermetureAuto" deja partagee (verifierTransitionsCompletionBlocs()) :
//   - des qu'on repond a QUOI QUE CE SOIT dans "Formations et diplomes",
//     "Ce que vous avez appris ailleurs" ET "Complements" s'ouvrent tous
//     les deux (pour qu'ils soient visibles sans clic manuel en plus) ;
//   - des qu'on repond dans "Ce que vous avez appris ailleurs", les blocs
//     au-dessus (Vous, Formations) se referment ;
//   - des qu'on repond dans "Complements", le bloc juste au-dessus (Ce
//     que vous avez appris ailleurs) se referme.
// Drapeaux "une seule fois" (edge-triggered), meme principe que
// _decouverteExperiencesBlocAmorce plus haut -- jamais reimpose a chaque
// rendu (sinon impossible de refermer/rouvrir manuellement ensuite).
// Remis a false par fermerDecouverteCompetences().
var _decouverteCascadeParcoursFaite = false;
var _decouverteCascadeExperiencesPersoFaite = false;
var _decouverteCascadeComplementsFaite = false;

// Route 'decouverte' : redessine l'etape courante si une session existe,
// sinon renvoie vers la presentation du module.
function pageDecouverte() {
  if (typeof _decouverteRenduEtape === 'function') {
    _decouverteRenduEtape(_decouverteNumeroCourant || 1);
  } else if (typeof naviguerVers === 'function') {
    naviguerVers('decouverte-intro');
  }
}

// TACHE (chantier "bouton presentation", 2026-09-01, alignement sur
// Coherence) :
//  - _decouverteDetourPresentation : detour de CONSULTATION ("Revoir la
//    presentation" depuis un ecran de travail) -- pas d'encart.
//  - _decouverteReprisePendante : on REVIENT dans le module (accueil /
//    autre module) avec une session en cours -- encart "Continuer /
//    Recommencer" a droite + module gele jusqu'au choix.
var _decouverteDetourPresentation = false;
var _decouverteReprisePendante = false;

// TACHE (correctif boucle Retour, 2026-09-09 -- LECONS section 2,
// "Variante boucle infinie"). "Retour" de la barre du bas (et du bouton
// "Retour" en tete une fois tous les sous-etats epuises) : ouvre la
// presentation en mode NORMAL (jamais detour), dont le propre "Retour"
// enchaine vers l'accueil de la carte (voir pageIntroDecouverte,
// carteRetour). AVANT : "Retour" appelait decouverteRetourVersPresentation()
// (detour) dont le "Retour" revenait a l'ecran de travail -> les deux se
// pointaient l'un l'autre, plus aucun moyen de reculer jusqu'a l'accueil.
function decouverteRetour() {
  _decouverteDetourPresentation = false;
  if (typeof naviguerVers === 'function') { naviguerVers('decouverte-intro'); }
}

// "Revoir la presentation" (bouton contextuel en tete d'ecran) -> page de
// presentation en mode DETOUR de consultation. La session reste vivante
// dans la closure. Reserve a ce seul bouton (voir correctif boucle ci-dessus).
function decouverteRetourVersPresentation() {
  _decouverteDetourPresentation = true;
  if (typeof naviguerVers === 'function') { naviguerVers('decouverte-intro'); }
}

// "Revenir au module" depuis la presentation en detour -> retour exact a
// l'ecran de travail quitte.
function decouverteRevenirDeLaPresentation() {
  _decouverteDetourPresentation = false;
  if (typeof naviguerVers === 'function') { naviguerVers('decouverte'); }
}

// "Continuer" de l'encart de reprise -> leve le gel, garde tout l'etat.
function decouverteRepriseContinuer() {
  _decouverteReprisePendante = false;
  if (typeof naviguerVers === 'function') { naviguerVers('decouverte'); }
}

function fermerDecouverteCompetences() {
  // Vrai depart a zero (recommencer(), js/app.js) : on oublie la session.
  _decouverteRenduEtape = null;
  _decouverteAgirRetour = null;
  _decouverteNumeroCourant = 1;
  _decouverteEtapeRendueDom = null;
  _decouvertePulseRecitVu = false;
  _decouverteRecitAEffacer = false;
  _decouverteExperiencesBlocAmorce = false;
  _decouverteInfosBlocsInitialisees = false;
  _decouverteCascadeParcoursFaite = false;
  _decouverteCascadeExperiencesPersoFaite = false;
  _decouverteCascadeComplementsFaite = false;
  _decouverteDetourPresentation = false;
  _decouverteReprisePendante = false;
  window._decouverteVersResultats = false;
  // TACHE (retour Denis, 2026-08-31, Chantier 2+3) : "recommencer" Decouverte
  // efface aussi le fait persistant -- le nouveau parcours n'est plus "termine"
  // tant qu'il n'a pas re-abouti.
  if (typeof dossier !== 'undefined' && dossier) { dossier.decouverteTerminee = false; }
}

// TACHE (retour utilisateur : bug reel trouve -- le signal
// _decouverteVersResultats etait remis a false des le premier rendu de
// pageResultats(), qui se re-rend pourtant seul a chaque interaction sur
// CETTE MEME page (choix du document, accordeons...) sans jamais rappeler
// naviguerVers -- "Retour" retombait donc sur 'Faire le point' des la
// moindre interaction. Plus profond ensuite : meme corrige, renvoyer vers
// une AUTRE page ('Mon projet') ne correspond pas a la demande -- "Retour"
// doit rouvrir la fenetre "Informations complementaires" elle-meme.
// Solution : ne plus jamais la DETRUIRE a la fin du parcours (route
// normale de fermerDecouverteCompetences ci-dessus), seulement la MASQUER
// (masquerDecouverteCompetences, appelee depuis
// terminerParcoursDecouverte) -- son etat complet (etat, closures,
// contenu deja rendu) reste intact, prete a reapparaitre telle quelle.
// Parcours en PAGE (plus une fenetre) : il n'y a plus rien a masquer.
// L'etat de la session vit dans la closure (voir _decouverteRenduEtape) ;
// l'appelant (terminerParcoursDecouverte) enchaine sur
// naviguerVers('resultats'), qui rafraichit l'affichage. Fonction gardee
// (encore appelee ailleurs) mais devenue sans effet.
function masquerDecouverteCompetences() { /* no-op depuis le passage en page */ }

// Appelee depuis pageResultats() (js/app.js) au clic sur "Retour", tant
// que window._decouverteVersResultats est vrai -- jamais de reconstruction
// de l'etat (voir masquerDecouverteCompetences ci-dessus), juste la meme
// fenetre qui reapparait. No-op silencieux si elle a ete refermee
// entre-temps (croix) : fermerDecouverteCompetences() a alors deja remis
// le signal a false, ce cas ne devrait donc jamais se presenter.
function reafficherDecouverteCompetences() {
  // Appelee depuis pageResultats() (js/app.js) au clic "Retour" tant que
  // window._decouverteVersResultats est vrai. Parcours en page : on
  // renavigue vers la route, pageDecouverte() redessine la derniere etape
  // sans jamais reconstruire l'etat.
  if (_decouverteRenduEtape && typeof naviguerVers === 'function') { naviguerVers('decouverte'); }
}

// TACHE (retour utilisateur : "précisez-moi", raffinement) : question de
// clarification FIXE, la même pour tous les fragments -- notre modèle de
// copier-coller ne permet pas à l’assistant de formuler dynamiquement sa propre
// question sans un aller-retour supplémentaire, ce qui romprait la
// simplicité du parcours. Cette question reste volontairement générale
// et ouverte, jamais orientée vers un vocabulaire professionnel que la
// personne n'a pas (principe n°10, doc1 §3.1).
var DECOUVERTE_QUESTION_RAFFINEMENT_TYPE =
  'Précisez un peu ce que vous faisiez : pour qui, où, avec quel matériel, ou toute autre précision utile.';

// TACHE (retour Denis, 2026-08-31 -- "ce module sera le plus utilise et
// c'est le plus pauvre visuellement, il faut mettre le paquet") :
// helpers de mise en forme pour donner au parcours le meme soin
// d'accompagnement que les autres modules (encarts a filet gauche + icone
// objet, bandeau rassurant, intro "a quoi sert cette etape").
function _decouverteEncart(icone, texteHTML, variante) {
  var fond = variante === 'ok' ? 'var(--success-bg-subtle)' : (variante === 'warn' ? 'var(--warning-bg-subtle)' : 'var(--accent-bg-subtle)');
  var filet = variante === 'ok' ? 'var(--success)' : (variante === 'warn' ? 'var(--warning)' : 'var(--accent)');
  return '<div style="display:flex;gap:0.6rem;align-items:flex-start;background:' + fond +
    ';border-left:3px solid ' + filet + ';border-radius:8px;padding:0.6rem 0.85rem;margin:0.6rem 0;font-size:0.92rem;">' +
    '<span style="flex-shrink:0;">' + icone + '</span><span>' + texteHTML + '</span></div>';
}
function _decouverteBandeau(texteHTML) {
  return '<div class="cv-section" style="margin-bottom:1rem;background:var(--accent-bg-subtle);text-align:center;">' +
    '<p class="mb-0">' + texteHTML + '</p></div>';
}

// TACHE (retour Denis, 2026-08-31, point 5) : filet de securite pour le cas
// "compte perso" -- connecte a son propre compte, l'assistant tend a
// COMMENTER le prompt au lieu de l'appliquer, ou a repondre en texte plutot
// qu'en JSON. On previent avant (ecran choix de l'assistant), on repare
// apres (ecran collage + cas d'echec d'import), avec une phrase toute prete
// a coller dans la conversation. Le mot "IA" n'apparait jamais.
var DECOUVERTE_PHRASE_RELANCE =
  'Applique directement mes instructions et donne-moi le résultat complet demandé, sans commentaire ni question.';
var DECOUVERTE_PHRASE_REDEMANDER_JSON =
  'Renvoie-moi uniquement le bloc JSON complet, dans un bloc de code, sans aucun texte avant ni après, en respectant exactement la structure demandée dans mes instructions de départ.';

// Encart "phrase prete a coller" : intro + la phrase dans un cadre lisible +
// un bouton "Copier". A cabler avec _decouverteBrancherCopiePhrase().
function _decouverteEncartPhrasePrete(idBtn, introHTML, phrase, variante) {
  var fond = variante === 'warn' ? 'var(--warning-bg-subtle)' : 'var(--accent-bg-subtle)';
  var filet = variante === 'warn' ? 'var(--warning)' : 'var(--accent)';
  return '<div style="background:' + fond + ';border-left:3px solid ' + filet +
    ';border-radius:8px;padding:0.7rem 0.9rem;margin:0.7rem 0;font-size:0.92rem;">' +
    '<p class="mb-2">' + introHTML + '</p>' +
    '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:6px;' +
    'padding:0.5rem 0.7rem;font-size:0.9rem;font-style:italic;">' + echapperAttribut(phrase) + '</div>' +
    '<button type="button" id="' + idBtn + '" class="btn btn-sm btn-outline-secondary mt-2">Copier cette phrase</button>' +
    '</div>';
}
function _decouverteBrancherCopiePhrase(idBtn, phrase) {
  var b = document.getElementById(idBtn);
  if (b && typeof copierTexteVersPressePapier === 'function') {
    b.addEventListener('click', function () { copierTexteVersPressePapier(phrase, b); });
  }
}

// TACHE (retour Denis, 2026-08-31, Chantier 5) : a l'echec d'un import,
// l'app affichait DEUX encarts distincts qui disaient presque la meme chose
// (5c "il a seulement commente" + 5d "renvoie le JSON") + on gardait EN PLUS
// l'encart 5c toujours visible au-dessus. Desormais : UN seul bloc, affiche
// seulement a l'echec, avec deux lignes -- une par situation.
function _decouverteLignePhraseEchec(idBtn, labelHTML, phrase) {
  return '<div style="margin:0.5rem 0;">' +
    '<p class="mb-1">' + labelHTML + '</p>' +
    '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:6px;' +
    'padding:0.45rem 0.65rem;font-size:0.9rem;font-style:italic;">' + echapperAttribut(phrase) + '</div>' +
    '<button type="button" id="' + idBtn + '" class="btn btn-sm btn-outline-secondary mt-1">Copier cette phrase</button>' +
    '</div>';
}
function _decouverteBlocEchecImport(messageErreurHTML) {
  return '<div style="background:var(--warning-bg-subtle);border-left:3px solid var(--warning);' +
    'border-radius:8px;padding:0.75rem 0.9rem;margin-top:0.4rem;font-size:0.92rem;">' +
    '<p class="mb-2" style="color:var(--danger);">&#9888; ' + messageErreurHTML + '</p>' +
    '<p class="mb-2">Selon ce que l’assistant a renvoyé, collez <strong>une</strong> de ces deux phrases ' +
    'dans la conversation avec lui, puis renvoyez sa nouvelle réponse ici :</p>' +
    _decouverteLignePhraseEchec('btnEchecImportRelance',
      'S’il a surtout <strong>commenté ou discuté</strong> au lieu de faire l’analyse :',
      DECOUVERTE_PHRASE_RELANCE) +
    _decouverteLignePhraseEchec('btnEchecImportJson',
      'S’il a répondu <strong>mais pas en un seul bloc JSON</strong>, ou en oubliant des éléments :',
      DECOUVERTE_PHRASE_REDEMANDER_JSON) +
    '</div>';
}
function _decouverteBrancherBlocEchecImport() {
  _decouverteBrancherCopiePhrase('btnEchecImportRelance', DECOUVERTE_PHRASE_RELANCE);
  _decouverteBrancherCopiePhrase('btnEchecImportJson', DECOUVERTE_PHRASE_REDEMANDER_JSON);
}

// TACHE (retour Denis, 2026-08-31, Chantier 4) : "saisie inexploitable".
// L'assistant a renvoye analyseImpossible (ou fragments: []). On n'affiche
// PAS l'ecran de validation des fragments : un ecran dedie, bienveillant,
// qui ramene la personne a son recit. Les questionsCiblees (s'il y en a)
// servent de pistes concretes pour reecrire.
function _decouverteBlocSaisieInexploitable(message, questions) {
  var pistes = (Array.isArray(questions) && questions.length)
    ? '<p class="mb-1"><strong>Quelques pistes pour compléter votre récit :</strong></p>' +
      '<ul style="margin:0 0 0.4rem;padding-left:1.15rem;">' +
      questions.slice(0, 5).map(function (q) { return '<li>' + echapperAttribut(q.texte) + '</li>'; }).join('') +
      '</ul>'
    : '<ul style="margin:0 0 0.4rem;padding-left:1.15rem;">' +
      '<li>un métier que vous avez exercé, même il y a longtemps, même quelques mois</li>' +
      '<li>l’aide apportée à un proche, du bénévolat, une association</li>' +
      '<li>quelque chose que vous savez faire de vos mains (bricolage, mécanique, jardinage, cuisine…)</li>' +
      '</ul>';
  return '<div style="background:var(--accent-bg-subtle);border-left:3px solid var(--accent);' +
    'border-radius:8px;padding:0.85rem 1rem;margin-top:0.4rem;font-size:0.95rem;">' +
    '<p class="mb-2"><span style="font-size:1.1rem;">&#127793;</span> <strong>On n’a pas encore réussi à repérer une activité dans votre texte.</strong> ' +
    'Ce n’est pas un souci de copier-coller, et ce n’est pas grave : votre récit était sans doute trop court, ' +
    'trop général, ou il lui manquait un exemple concret.</p>' +
    (message ? '<p class="text-muted mb-2" style="font-style:italic;">' + echapperAttribut(message) + '</p>' : '') +
    '<p class="mb-1">Revenez à votre récit et racontez, même simplement, quelque chose que vous avez fait :</p>' +
    pistes +
    '<div class="text-center mt-2">' +
    '<button type="button" id="btnDecouverteReecrireRecit" class="btn btn-primary">&#8592; Revenir à mon récit</button>' +
    '</div>' +
    '<details class="mt-2"><summary style="cursor:pointer;font-size:0.9rem;">Vous pensez que l’assistant a mal compris la consigne ?</summary>' +
    '<div style="margin-top:0.5rem;">' +
    '<p class="mb-1" style="font-size:0.9rem;">Collez cette phrase dans la conversation avec lui, puis renvoyez sa réponse ici :</p>' +
    '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:6px;padding:0.45rem 0.65rem;' +
    'font-size:0.9rem;font-style:italic;">' + echapperAttribut(DECOUVERTE_PHRASE_RELANCE) + '</div>' +
    '<button type="button" id="btnSaisieInexploitableRelance" class="btn btn-sm btn-outline-secondary mt-1">Copier cette phrase</button>' +
    '</div></details>' +
    '</div>';
}
function _decouverteBrancherBlocSaisieInexploitable(retourRecit) {
  var b = document.getElementById('btnDecouverteReecrireRecit');
  if (b && typeof retourRecit === 'function') { b.addEventListener('click', retourRecit); }
  _decouverteBrancherCopiePhrase('btnSaisieInexploitableRelance', DECOUVERTE_PHRASE_RELANCE);
}

function ouvrirDecouverteCompetences() {
  // TACHE (retour utilisateur : "si je ferme la fenêtre, je veux pouvoir
  // soit réinitialiser et repartir de zéro, soit reprendre le parcours et
  // retomber sur la dernière fenêtre que j'ai complétée") : la croix
  // (voir afficherEtape() plus bas) ne détruit plus la session -- elle la
  // MASQUE seulement (masquerDecouverteCompetences), état et closures
  // intacts. Rouvrir le parcours doit donc d'abord verifier si une session
  // ainsi mise en pause existe déjà et, si oui, se contenter de la
  // réafficher telle quelle -- jamais en reconstruire une nouvelle qui
  // effacerait tout. Seul un vrai "Réinitialiser" (recommencer(), js/app.js)
  // détruit réellement cette session (voir son appel à
  // fermerDecouverteCompetences()).
  // Session Decouverte deja en cours (mise en pause, closure vivante) :
  // on ne reconstruit jamais, on renavigue simplement vers la route --
  // pageDecouverte() redessine la derniere etape.
  if (typeof _decouverteRenduEtape === 'function') {
    // Reprise : on revient dans le module avec une session vivante. On
    // atterrit au dernier ecran, avec l'encart "Continuer / Recommencer"
    // + module gele (aligne sur Coherence / Bilan).
    _decouverteReprisePendante = true;
    _decouverteDetourPresentation = false;
    if (typeof naviguerVers === 'function') { naviguerVers('decouverte'); }
    return;
  }

  // TACHE (retour utilisateur, bug reel trouve : "j'avais deja fait un
  // parcours general avec un metier vise, puis j'ai lance Decouverte --
  // premiere surprise agreable, les infos etaient deja renseignees, mais
  // du coup Decouverte a saute l'etape 1 toute seule et le prompt envoye a
  // l’assistant contenait encore le metier/l'offre du parcours precedent") :
  // dossier.metierCible/objectif/secteurCible/rechercheCandidature sont
  // PARTAGES avec le parcours general (dossier.identite AUSSI, mais reste
  // volontairement pre-rempli ci-dessus -- seule la partie "candidature
  // ciblee" pose probleme ici, jamais l'identite). Reset UNIQUEMENT au
  // demarrage d'une VRAIE nouvelle session (jamais a la reprise d'une
  // session Decouverte en pause, deja filtree par le retour anticipe
  // juste au-dessus) -- sinon Decouverte demarre "a l'aveugle" avec des
  // valeurs perimees d'un tout autre parcours, invisibles pour la
  // personne mais bien presentes dans dossier.
  dossier.metierCible = null;
  dossier.objectif = null;
  dossier.secteurCible = null;
  dossier.rechercheCandidature = { entreprise: '', site: '', lienOffre: '', civiliteRecruteur: '', nomRecruteur: '', mettreEnAvantCouleurEntreprise: false, couleurEntreprise: '' };
  // TACHE (retour utilisateur : "le parcours Decouverte n'a aucun suivi
  // Umami") : suivi minimal (meme philosophie que le reste de l'app --
  // ~14 evenements, jamais en multiplier) -- une VRAIE nouvelle session
  // uniquement, jamais une reprise (deja filtree par le retour anticipe
  // juste au-dessus).
  if (typeof trackEvenement === 'function') { trackEvenement('decouverte_demarree'); }

  var etat = {
    etapeCourante: 1,
    modeRecherche: null, // 'metier' | 'domaine' | 'stage' | null
    stageAvecStructure: null,
    // TACHE (retour utilisateur : "pour le domaine, je veux la même
    // option qu'aujourd'hui, sauf qu'à la place de 'oui une offre
    // précise' je mettrai 'oui une structure précise'") : même principe
    // que stageAvecStructure ci-dessus -- le mode "domaine" n'a jamais de
    // métier/offre précis, donc jamais "objectif" ('offre'/'spontanee')
    // comme pour 'metier', mais une structure ciblée reste possible (ex.
    // une agence d'intérim spécialisée dans le secteur choisi).
    domaineAvecStructure: null,
    identite: {
      civilite: (dossier.identite && dossier.identite.civilite) || null,
      nom: (dossier.identite && dossier.identite.nom) || '',
      prenom: (dossier.identite && dossier.identite.prenom) || '',
      telephone: (dossier.identite && dossier.identite.telephone) || '',
      email: (dossier.identite && dossier.identite.email) || '',
      ville: (dossier.identite && dossier.identite.ville) || '',
      codePostal: (dossier.identite && dossier.identite.codePostal) || ''
    },
    recit: '',
    etatsFragments: [],       // tableau d'etatFragment (decouverteRaffinement.js), une fois l'analyse initiale reçue
    ongletFragmentActif: null,
    fragmentEnRaffinement: null,
    modeRecap: null,
    ongletInfoComplActif: null,   // etape 8 "Informations complementaires" -- onglet Mobilite/Formation/Engagement/Savoir-faire actif
    // TACHE (retour Denis, 2026-09-18, point 4) : modeRecapInfoCompl retire --
    // l'ancien ecran recapitulatif de l'etape 8 n'existe plus, voir
    // avancerOuTerminerInfoCompl()/transmettreEtTerminerInfoCompl().
    // TACHE (retour utilisateur, bug reel trouve : "je clique Modifier sur
    // Niveau d'etudes, ca ne modifie pas -- ca supprime tout, et
    // Certifications se retrouve bloquee") : "Modifier" (palier Formation)
    // remettait le flag actif/certifActif/catalogueActif du palier a null
    // pour le "rouvrir" -- or CE MEME flag sert AUSSI a decider si le
    // palier SUIVANT est deverrouille (voir contenuBlocFormation). Le
    // repasser a null refermait donc en cascade tout ce qui suit, tout en
    // affichant un resume "Aucun diplome" (calcule sur ce meme flag,
    // desormais null) alors que la donnee reelle (d.texte/d.niveau...)
    // n'etait, elle, jamais effacee. formationPalierOuvert est un
    // flag SEPARE, jamais confondu avec la reponse elle-meme : "Modifier"
    // ne fait plus que forcer CE palier a s'afficher deplie (donnees
    // intactes), sans toucher a l'etat des autres paliers.
    formationPalierOuvert: null,
    // TACHE (retour utilisateur : "les certifications choisies ne sont
    // pas évidentes -- je veux une carte verte de confirmation, repliée
    // par défaut, qui s'ouvre au clic pour ajouter l'année/les missions --
    // même logique pour formations, engagement, savoir-faire") : retient
    // quelles cartes sont dépliées, par clé "categorie:index" -- chaque
    // élément garde son propre état d'ouverture, indépendamment des autres.
    detailsPliesOuverts: {},
    reponsesQuestionsCiblees: [],
    questionsCiblees: [],
    strategie: null,
    typeCVChoisi: null
  };

  // TACHE (retour Denis, 2026-08-31) : plus de fenetre modale. afficherEtape()
  // ecrit directement dans #app (page routee 'decouverte').

  function afficherEtape(numero) {
    // TACHE (retour Denis, 2026-08-31, Chantier 4) : la croix "effacer le
    // recit" ne vit que sur la page "Preparer" (etapes 1/2/3). Des qu'on la
    // quitte, on l'oublie.
    if (numero > 3) { _decouverteRecitAEffacer = false; }
    // TACHE (retour Denis, 2026-08-31) : re-rendu du MEME ecran (clic
    // Oui/Non, Valider, choix d'une carte...) -> on garde la position de
    // lecture. Changement d'ecran, ou 1re entree dans le parcours, ou
    // retour depuis 'resultats' -> on remonte EN HAUT. Sans ca, on herite
    // du scroll de l'ecran precedent (ex. bas de la page d'intro apres
    // avoir clique le CTA) et on atterrit au milieu, sous la zone de saisie.
    var memeEcranDejaAffiche = (_decouverteEtapeRendueDom === numero) &&
      !!document.getElementById('contenuEtapeDecouverte');
    _decouverteNumeroCourant = numero;
    // TACHE (chantier "ecran tampon avant l’assistant", volet Decouverte) : coupe
    // systematiquement tout decompte herite d'un rendu precedent AVANT de
    // reconstruire quoi que ce soit -- meme precaution que
    // brancherEvenementsResultats() (js/app.js) pour la page Action. Sans
    // cela, quitter l'etape "Collez la reponse" pendant le decompte (ex.
    // "Retour" vers l'etape precedente) laisserait l'intervalle tourner en
    // fond et declencherait quand meme window.open() 5s plus tard, invisible
    // et hors de propos. Redemarre seulement plus bas (etapeCollerReponse,
    // onAfficher) si les conditions sont toujours reunies apres ce rendu.
    clearInterval(_intervalleDecompteIA);
    etat.etapeCourante = numero;
    var etape = obtenirDefinitionEtape(numero);

    // TACHE (retour utilisateur : "à chaque fois que je valide quelque
    // chose, ça me fait remonter en haut de la fenêtre -- ça donne
    // l'impression que rien n'est validé") : chaque appel remplace
    // ENTIÈREMENT fenetre.innerHTML (voir plus bas), ce qui recrée le
    // conteneur scrollable et perd donc sa position de lecture -- capturée
    // ici avant remplacement, réappliquée juste après (voir fin de
    // fonction), pour qu'un simple clic (Oui/Non, Ajouter, Valider...)
    // ne fasse plus jamais sauter la vue en haut de la fenêtre.
    // (retour Denis 2026-08-31 : uniquement pour un re-rendu du meme ecran --
    // voir memeEcranDejaAffiche plus haut.)
    var scrollPrecedent = memeEcranDejaAffiche ? (window.scrollY || window.pageYOffset || 0) : 0;

    // Bande partagee "bouton + reprise" (chantier "bouton presentation") :
    // "Revoir la presentation" a gauche ; a la reprise (retour dans le
    // module), l'encart "Continuer / Recommencer" a droite + gel.
    var _decNoteHtml = (typeof noteRevoirModuleDejaVue === 'function' && !noteRevoirModuleDejaVue() && !_decouverteReprisePendante)
      ? '<div class="note-revoir-module" id="noteRevoirModule" style="margin-left:0;">' +
        '<span>Ce bouton vous ramène à la page qui explique ce module. Vous ne perdez rien.</span>' +
        '<button type="button" aria-label="J’ai compris" data-fermer-note-revoir>&#10005;</button></div>'
      : '';
    var _decBouton = '<div><button type="button" id="btnDecouverteRevoirPresentation" class="btn-revoir-module"' +
      (_decouverteReprisePendante ? ' disabled' : '') + '>' +
      '<i class="bi bi-stars"></i> Revoir la présentation</button></div>' + _decNoteHtml;
    var _decEncart = _decouverteReprisePendante
      ? htmlEncartRepriseModule({ idContinuer: 'btnDecouverteRepriseContinuer', idRecommencer: 'btnDecouverteRepriseRecommencer', pulse: true })
      : '';

    app.innerHTML =
      '<div class="page-catalogue-contenu decouverte-parcours">' +
      // TACHE (retour Denis, 2026-08-31) : barre d'etapes visuelle du
      // module, meme langage que "Analyser ma candidature" (pastille
      // courante jaune + halo, chevrons bleus). Les 8 etapes actuelles
      // sont regroupees en 5 reperes (voir _decouverteNavIndex) -- premier
      // pas de la consolidation (docs/CONSOLIDATION_DECOUVERTE_PROPOSITION),
      // additif, aucune fonction touchee.
      // TACHE (retour utilisateur 2026-09-17, coherence inter-modules) :
      // barre AVANT le titre (comme co-lettre/prepa-entretien et tous les
      // autres modules routes) -- inversee jusqu'ici. Titre remis a la
      // taille normale (2.8rem, h1 global) : le style inline
      // font-size:1.5rem le retrecissait de moitie sur cet ecran alors que
      // la page d'introduction du meme module garde le titre normal.
      // TACHE (retour Denis 2026-09-18, "barre de navigation trop bas") :
      // htmlBandeRepriseModule() (bouton "Revoir la presentation") passait
      // AVANT la barre d'etapes -- ordre inverse d'ATS/Comparer mes pistes
      // (barre d'abord, bande ensuite), qui pousse tout le contenu plus bas
      // que dans les autres modules routes. Meme bug, meme correctif que
      // "Un regard sur mon CV" le 2026-09-17 (docs/AUDIT_REGARD_RECRUTEUR_2026-09-17.md).
      (typeof barreEtapesModule === 'function'
        ? barreEtapesModule(DECOUVERTE_NAV_ETAPES, _decouverteNavIndex(numero))
        : '') +
      htmlBandeRepriseModule(_decBouton, _decEncart) +
      '<div class="text-center"><h1>' + etape.titre + '</h1></div>' +
      // Une etape simple est posee dans une carte .cv-section (look de
      // l'app). Une etape deja composee de plusieurs cartes (Preparer,
      // Vos competences) demande etape.sansCarte pour ne pas empiler
      // carte dans carte.
      '<div' + (etape.sansCarte ? '' : ' class="cv-section"') + ' id="contenuEtapeDecouverte">' + etape.contenuHTML + '</div>' +
      '<div class="d-flex justify-content-between align-items-center mt-3 pt-3 decouverte-barre-actions">' +
      // TACHE (retour Denis, 2026-09-18, point 2) : l'ancien bouton "Retour"
      // dans la page (id="btnRetourDecouverte") est retire -- il faisait
      // doublon avec celui de la barre du bas (avec Accueil), qui reprend
      // desormais son comportement de recul pas a pas (voir _decouverteAgirRetour
      // plus bas). Span vide pour garder l'alignement a 3 emplacements du
      // flex justify-content-between (milieu / continuer), comme avant.
      '<span></span>' +
      (etape.boutonMilieuHTML || '<span></span>') +
      (etape.masquerContinuer ? '' :
        '<button type="button" id="btnContinuerDecouverte" class="btn btn-primary"' +
        (etape.peutContinuer ? '' : ' disabled') +
        // TACHE (retour utilisateur : "le bouton est désactivé, ce n'est
        // pas clair pourquoi -- un message, ou encore mieux les 2 choix
        // qui pulsent au survol") : title = infobulle native du
        // navigateur (fonctionne même sur un bouton disabled, contrairement
        // à un clic) -- affichée uniquement si le bouton est réellement
        // désactivé ET que l'étape fournit une explication
        // (etape.raisonBlocage, facultatif -- jamais obligatoire pour les
        // étapes qui n'en ont pas besoin, ex. simples champs texte).
        ((!etape.peutContinuer && etape.raisonBlocage) ? ' title="' + echapperAttribut(etape.raisonBlocage) + '"' : '') +
        '>' + (etape.libelleContinuer || 'Continuer &#8594;') + '</button>') +
      '</div>' +
      '</div>' +
      // Barre du bas du module : "Retour" -> recul pas a pas dans le
      // parcours (_decouverteAgirRetour, repose a chaque rendu juste plus
      // bas), jusqu'a la presentation du module en mode NORMAL une fois
      // tous les sous-etats epuises (jamais l'accueil direct : bouton
      // "Accueil" pour ca ; jamais le detour : voir decouverteRetour() /
      // correctif boucle 2026-09-09). TACHE (retour Denis, 2026-09-18,
      // point 2) : seul bouton Retour du module desormais -- l'ancien,
      // dans la page, est retire (voir plus haut).
      '<div class="barre-navigation-fixe">' +
      (typeof barreNavigation === 'function'
        ? barreNavigation('cv', null, null, { onclickPrecedent: '_decouverteAgirRetour()' })
        : '') +
      '</div>';

    window.scrollTo(0, scrollPrecedent);
    _decouverteEtapeRendueDom = numero;

    // Gel du module tant que la reprise n'est pas tranchee (brique
    // partagee) -- l'encart et la barre du bas restent actifs.
    if (typeof appliquerGelModule === 'function') { appliquerGelModule(_decouverteReprisePendante); }

    // Bouton partage "Revoir la presentation" (detour de consultation, non
    // destructif : la session reste vivante dans la closure).
    var btnRevoirDec = document.getElementById('btnDecouverteRevoirPresentation');
    if (btnRevoirDec) { btnRevoirDec.addEventListener('click', decouverteRetourVersPresentation); }
    // Encart de reprise "Continuer / Recommencer".
    var btnDecReprC = document.getElementById('btnDecouverteRepriseContinuer');
    if (btnDecReprC) { btnDecReprC.addEventListener('click', decouverteRepriseContinuer); }
    var btnDecReprR = document.getElementById('btnDecouverteRepriseRecommencer');
    if (btnDecReprR) {
      btnDecReprR.addEventListener('click', function () {
        if (typeof confirmerAction !== 'function') { return; }
        confirmerAction(
          'Recommencer « Découvrir mes compétences » ?',
          'Votre récit et les compétences déjà retenues pour ce parcours seront effacés. Vos autres modules, Mes Repères et Mon Carnet ne sont pas touchés.',
          'Recommencer ce module', 'btn-danger',
          function () {
            fermerDecouverteCompetences();
            if (typeof demarrerDecouverteCompetences === 'function') { demarrerDecouverteCompetences(); }
          }
        );
      });
    }
    if (typeof armerFinPulseEncartReprise === 'function') { armerFinPulseEncartReprise(); }
    // TACHE (retour Denis, 2026-09-18, point 2 : "un seul bouton Retour,
    // celui de la barre du bas, qui reprend le comportement 'page arriere'")
    // : ex-gestionnaire de clic de l'ancien bouton dans la page
    // (btnRetourDecouverte, retire -- voir plus haut). Devient une fonction
    // NOMMEE, reposee sur le global _decouverteAgirRetour a chaque rendu
    // (numero/etat changent a chaque etape) pour que l'onclick inline de
    // barreNavigation() (chaine JS, jamais une fonction fermee) puisse
    // l'atteindre. Logique de recul pas a pas inchangee.
    function agirRetourDecouverte() {
      // TACHE (retour utilisateur : "je me retrouve à 'collez la
      // réponse' au lieu de revenir aux propositions") : le raffinement
      // n'est pas une étape à part (etapeCourante reste 6 pendant tout
      // ce temps, seul fragmentEnRaffinement change) -- le bouton Retour
      // global sautait donc directement à l'étape 5, sans jamais
      // repasser par l'écran "valider / aucune ne correspond". Corrigé :
      // s'il y a un raffinement en cours, Retour l'annule d'abord.
      if (numero === 6 && etat.fragmentEnRaffinement) {
        etat.fragmentEnRaffinement = null;
        afficherEtape(6);
        return;
      }
      // TACHE (retour utilisateur : "le bouton retour de cette page me
      // fait retourner à la page 'collez la réponse de l'assistant' à
      // nouveau") : signalé plusieurs fois -- avec la navigation libre
      // entre onglets, Retour n'a plus besoin de sauter à l'étape 5 dès
      // qu'on est sur l'étape 6 : il recule d'un onglet à la fois,
      // exactement comme "Retour" le ferait dans n'importe quel
      // parcours -- jusqu'au premier onglet, où là seulement il
      // continue vers l'étape précédente. S'il y avait un récapitulatif
      // affiché (toutes validées), Retour y ramène d'abord.
      if (numero === 6) {
        if (!etat.modeRecap && etat.etatsFragments.every(fragmentEstValide) && etat.etatsFragments.length > 1) {
          etat.modeRecap = true;
          afficherEtape(6);
          return;
        }
        var indexActif = etat.etatsFragments.findIndex(function (ef) { return ef.fragmentId === etat.ongletFragmentActif; });
        if (indexActif > 0) {
          etat.ongletFragmentActif = etat.etatsFragments[indexActif - 1].fragmentId;
          etat.modeRecap = false;
          afficherEtape(6);
          return;
        }
      }
      // TACHE (retour utilisateur : "le bouton Retour me fait revenir à
      // la page d'accueil et pas à la page précédente") : même défaut
      // que pour le raffinement (étape 6) -- l'étape 1 a un sous-état
      // interne (l'objectif choisi parmi les 6 cartes partagées, voir
      // etapeAccueil()) qu'un simple "numero - 1" ignore complètement,
      // puisque numero reste 1 pendant tout ce temps. Recule d'abord ce
      // sous-état avant de fermer le module.
      // TACHE (chantier "2e passage IA...", point 1, 2026-09-18) :
      // branches etat.modeRecherche/stageAvecStructure/domaineAvecStructure
      // retirées -- l'ancien système maison à 3 cartes (métier précis/
      // domaine/stage) n'existe plus, remplacé par l'écran partagé "Votre
      // objectif" (6 cartes), qui ne connaît qu'un seul sous-état à
      // défaire : dossier.objectif.
      if (numero === 1) {
        if (dossier.objectif) { dossier.objectif = null; afficherEtape(1); return; }
        // Tous les sous-etats de l'etape 1 sont epuises : "Retour"
        // renvoie a la presentation du module en mode NORMAL (la session
        // reste vivante, "Reprendre" la reaffiche). Jamais
        // fermerDecouverteCompetences() ici -- ce serait detruire le
        // travail en cours. Jamais le detour (correctif boucle 2026-09-09).
        decouverteRetour();
        return;
      }
      if (numero <= 1) { decouverteRetour(); } else { afficherEtape(numero - 1); }
    }
    _decouverteAgirRetour = agirRetourDecouverte;
    if (!etape.masquerContinuer) {
      var boutonContinuerEl = document.getElementById('btnContinuerDecouverte');
      boutonContinuerEl.addEventListener('click', function () {
        if (typeof etape.onContinuer === 'function') { etape.onContinuer(); }
      });
      // TACHE (retour utilisateur : "encore mieux, avoir les 2 choix qui
      // pulsent au survol du bouton Continuer désactivé, pour inciter la
      // personne à en choisir un") : générique -- s'applique à N'IMPORTE
      // QUELLE étape qui identifie son bloc de choix en attente avec
      // l'id #cartesDecisionRequise (voir etapeAccueil() plus bas, seule
      // étape à l'utiliser aujourd'hui) -- jamais un mécanisme propre à
      // une seule étape. Rien ne se passe si l'id est absent (autres
      // étapes, ex. simples champs texte) -- juste un no-op silencieux.
      if (!etape.peutContinuer) {
        boutonContinuerEl.addEventListener('mouseenter', function () {
          var blocEnAttente = document.getElementById('cartesDecisionRequise');
          if (blocEnAttente) { blocEnAttente.classList.add('pulse-attention'); }
        });
        boutonContinuerEl.addEventListener('mouseleave', function () {
          var blocEnAttente = document.getElementById('cartesDecisionRequise');
          if (blocEnAttente) { blocEnAttente.classList.remove('pulse-attention'); }
        });
      }
    }
    if (typeof etape.onCablerBoutonMilieu === 'function') { etape.onCablerBoutonMilieu(); }
    if (typeof etape.onAfficher === 'function') { etape.onAfficher(); }
  }

  // ------------------------------------------------------------
  // Étape 1 — Accueil
  // ------------------------------------------------------------
  // ------------------------------------------------------------
  // Étape 1 — Ce que la personne recherche
  // ------------------------------------------------------------
  // TACHE (retour utilisateur : "le parcours j'ai un CV / j'ai pas de CV
  // est le même, c'est un doublon ?") : confirmé -- cette branche n'avait
  // jamais été construite (l'import d'un CV existant restait à faire,
  // jamais un vrai doublon voulu). Remplacée par une question qui, elle,
  // a un effet réel : réutilise dossier.objectif/dossier.secteurCible,
  // déjà utilisés par le parcours classique (pageObjectif(), app.js) --
  // même vocabulaire, jamais un nouveau concept.
  function capitaliserPremiereLettre(texte) {
    return texte ? texte.charAt(0).toUpperCase() + texte.slice(1) : texte;
  }

  // TACHE (retour Denis, 2026-09-18, point 1 de sa liste de corrections) :
  // remplace entierement l'ancien systeme maison (metier precis / domaine /
  // stage, recherche/pastilles codees a la main dans ce fichier) par
  // l'ecran PARTAGE "Votre objectif" (js/app.js, pageObjectif()) : les 6
  // cartes OBJECTIF_CHOIX_CANDIDATURE (offre/spontanee/reconversion/stage/
  // alternance/pmsmp) + les blocs ERIP CONFIG_BLOC_CANDIDATURE (recherche
  // metier/secteur via contenuModeRecherche(), deja plus riche que
  // l'ancien systeme -- catalogue complet + offre/structure ciblee) et
  // CONFIG_BLOC_PROJET (contrat/temps de travail/disponibilites). Deja
  // reutilise tel quel par Bilan (definirObjectifCandidature -- voir son
  // commentaire js/app.js) ; aucune dependance a dossier.modeCreation dans
  // ces 2 blocs (verifie), donc rien a adapter pour un dossier Decouverte
  // qui ne le renseigne jamais. Ni CONFIG_BLOC_CANDIDATURE ni
  // CONFIG_BLOC_PROJET n'utilisent d'id deja pris par un AUTRE bloc ERIP
  // de Decouverte (aucun ailleurs dans ce fichier) -- pas de risque de
  // collision d'etat d'accordeon avec pageObjectif() elle-meme au-dela du
  // partage volontaire et sans consequence de etatBlocsERIPOuverts['candidature'/'projet'].
  // TACHE (retour Denis, 2026-09-19, point 3 de sa 2e liste de corrections :
  // "sur les 6 cartes, on en garde que 3 -- Répondre à une offre, Candidature
  // spontanée, Stage. Les 3 autres (reconversion, alternance, PMSMP)
  // supposent déjà un CV existant, hors public de ce module") : filtre
  // d'affichage LOCAL a Decouverte -- OBJECTIF_CHOIX_CANDIDATURE (js/app.js)
  // reste la seule source des 6 cartes, utilisee telle quelle par
  // pageObjectif()/Bilan ; seule la LISTE DES ID a montrer ici change, jamais
  // une 2e copie du tableau de cartes.
  var CARTES_OBJECTIF_DECOUVERTE = ['offre', 'spontanee', 'stage'];
  function etapeAccueil() {
    var objectifChoisi = !!dossier.objectif;
    // TACHE : memes classes que pageObjectif() (js/app.js, .grille-objectif/
    // .carte-objectif) -- meme rendu visuel, aucun CSS a dupliquer ici.
    var html = '<p class="text-muted mb-2">Le poste ou le type de démarche que vous visez.</p>' +
      '<div class="grille-objectif">' +
      OBJECTIF_CHOIX_CANDIDATURE.filter(function (o) { return CARTES_OBJECTIF_DECOUVERTE.indexOf(o.id) !== -1; }).map(function (o) {
        return '<button type="button" class="carte-objectif' + (dossier.objectif === o.id ? ' carte-objectif--actif' : '') + '" data-action="objectif-decouverte" data-value="' + o.id + '">' +
          '<i class="bi ' + o.icon + '" aria-hidden="true"></i>' +
          '<span class="carte-objectif-titre">' + o.title + '</span>' +
          '<span class="carte-objectif-desc">' + o.desc + '</span>' +
          '</button>';
      }).join('') +
      '</div>' +
      (objectifChoisi
        ? '<div class="objectif-cadrage" style="margin-top:16px">' +
          blocERIP(CONFIG_BLOC_CANDIDATURE) +
          blocERIP(CONFIG_BLOC_PROJET) +
          resumeObjectifLigne() +
          '</div>'
        : '<p class="sousTitre text-center" style="margin-top:14px">Choisissez un objectif ci-dessus pour préciser votre candidature.</p>');

    return {
      titre: '🔍 Découverte de vos compétences',
      contenuHTML: html,
      onAfficher: function () {
        document.querySelectorAll('[data-action="objectif-decouverte"]').forEach(function (el) {
          el.addEventListener('click', function () {
            definirObjectifCandidature(this.dataset.value);
            // TACHE (retour Denis, 2026-09-19, point 8 de sa 3e liste de
            // corrections : "dès que je choisis candidature spontanée ou
            // stage ou offre d'emploi, je veux que le bloc candidature
            // soit déjà ouvert") : etapeAccueil() (Decouverte) n'avait
            // jamais l'ouverture par defaut que pageObjectif() applique
            // (js/app.js, _objectifBlocsAmorces) -- ajoutee ici,
            // specifiquement au choix d'une carte.
            etatBlocsERIPOuverts.candidature = true;
            afficherEtape(1);
          });
        });
        // TACHE : CONFIG_BLOC_CANDIDATURE/CONFIG_BLOC_PROJET ecrivent deja
        // directement dans dossier a chaque interaction (contenuModeRecherche/
        // wireModeRecherche, contenuCandidature/wireObjectifDetails,
        // wireContratTemps) -- plus besoin d'une fonction "sauvegarder au
        // clic sur Continuer" comme l'ancien systeme maison.
        if (dossier.objectif) {
          wireBlocERIP(CONFIG_BLOC_CANDIDATURE, function () { afficherEtape(1); });
          wireEvidenceMetierCible();
          wireBlocERIP(CONFIG_BLOC_PROJET, function () { afficherEtape(1); });
          wireContratTemps();
        }
      }
    };
  }


  // ------------------------------------------------------------
  // Étape 2 — Civilité (jamais transmise à l’assistant, sauf l’accord de genre)
  // ------------------------------------------------------------
  // TACHE (retour Denis, 2026-09-19, point 6 de sa 2e liste de corrections :
  // "j'enlève les coordonnées de Préparer, mais je garde la civilité --
  // il faut que le texte rédigé soit accorde au bon genre -- je la mets
  // directement dans le premier point") : nom/prénom/téléphone/email/
  // adresse ne sont plus demandés ici -- ils se renseignent désormais sur
  // la nouvelle étape "Vos informations" (bloc "Vous", CONFIG_BLOC_VOUS,
  // voir etapeVosInformationsDecouverte() plus bas), exactement comme pour
  // "Créer un nouveau CV". Seule la civilité reste ici (rejoint la
  // section 1 "Votre parcours" de "Préparer", voir etapePreparer()) : elle
  // pilote l'accord de genre du texte de profil généré par l’assistant dès
  // le 1er passage (masculin par défaut/"Ne pas préciser", féminin
  // uniquement si "Madame", voir texteProfil(), js/app.js, section
  // "CONSIGNES DE RÉDACTION") -- ne peut donc pas attendre la nouvelle
  // étape "Vos informations", atteinte trop tard dans le parcours.
  function etapeIdentite() {
    var civiliteVal = etat.identite.civilite || '';
    return {
      titre: '🪪 Civilité',
      contenuHTML:
        '<label class="form-label small fw-semibold mb-1">Civilité</label>' +
        '<div class="d-flex flex-wrap gap-2 mb-2">' +
        // TACHE (6conv-5, suite) : jetons de la brique commune (choixRadioVosInfos,
        // js/app.js) -- _renduInfosUnifie est vrai pendant tout le parcours
        // Decouverte (obtenirDefinitionEtape). Cablage [data-civilite] inchange.
        choixRadioVosInfos('data-civilite', 'Madame', civiliteVal === 'Madame', 'Madame') +
        choixRadioVosInfos('data-civilite', 'Monsieur', civiliteVal === 'Monsieur', 'Monsieur') +
        choixRadioVosInfos('data-civilite', '', !civiliteVal, 'Ne pas préciser') +
        '</div>',
      // TACHE (point 6) : jamais bloquant -- "Ne pas préciser" est deja un
      // choix complet en lui-meme (comportement inchange).
      peutContinuer: true,
      onAfficher: function () {
        document.querySelectorAll('#contenuEtapeDecouverte [data-civilite]').forEach(function (el) {
          el.addEventListener('click', function () {
            etat.identite.civilite = this.dataset.civilite || null;
            // Re-rend l'ecran courant (etape 2 en solo, ou la page
            // "Preparer" fusionnee -- etat.etapeCourante distingue les deux).
            afficherEtape(etat.etapeCourante);
          });
        });
      },
      onContinuer: function () { afficherEtape(3); }
    };
  }

  // ------------------------------------------------------------
  // Étape 3 — Récit (présentation + saisie libre, fusionnées)
  // ------------------------------------------------------------
  function etapeRecit() {
    return {
      titre: '📝 Racontez votre parcours',
      // NB : le cadrage (intro, idees de sujets, astuce Win+H, encart de
      // reassurance) est fourni par etapePreparer() qui enrobe ce
      // contenuHTML -- on ne garde ici que la zone de saisie elle-meme
      // pour ne rien afficher en double (2026-08-31).
      contenuHTML:
        '<div id="detectionCoordonneesDecouverte" class="mb-2"></div>' +
        '<div style="position:relative;">' +
        // TACHE (retour Denis, 2026-08-31, Chantier 4) : petite croix "tout
        // effacer", visible SEULEMENT au retour depuis l'ecran "saisie
        // inexploitable" -- evite de supprimer un long texte a la main.
        (_decouverteRecitAEffacer
          ? '<button type="button" id="btnDecouverteEffacerRecit" title="Effacer tout le texte" ' +
            'aria-label="Effacer tout le texte" style="position:absolute;top:0.4rem;right:0.4rem;z-index:2;' +
            'border:none;background:var(--danger-bg-subtle);color:var(--danger);border-radius:50%;' +
            'width:1.7rem;height:1.7rem;line-height:1;cursor:pointer;font-weight:700;font-size:0.9rem;">&#10005;</button>'
          : '') +
        // TACHE (retour Denis, 2026-08-31) : hauteur reduite (rows 10 -> 5)
        // pour ne pas depasser ce que montre la capture de reference.
        '<textarea class="form-control decouverte-zone-recit" id="decouverteRecitTexte" rows="5" ' +
        'placeholder="Par exemple : J’ai travaillé plusieurs années sur des chantiers, je tirais des câbles électriques...">' +
        echapperAttribut(etat.recit) + '</textarea>' +
        '</div>',
      peutContinuer: etat.recit.trim().length > 0,
      onAfficher: function () {
        var champ = document.getElementById('decouverteRecitTexte');
        afficherDetectionCoordonneesDecouverte(champ.value);
        function retirerCroixEffacer() {
          _decouverteRecitAEffacer = false;
          var x = document.getElementById('btnDecouverteEffacerRecit');
          if (x) { x.remove(); }
        }
        champ.addEventListener('input', function () {
          etat.recit = this.value;
          retirerCroixEffacer();
          afficherDetectionCoordonneesDecouverte(this.value);
          document.getElementById('btnContinuerDecouverte').disabled = !this.value.trim().length;
        });
        var btnEffRecit = document.getElementById('btnDecouverteEffacerRecit');
        if (btnEffRecit) {
          btnEffRecit.addEventListener('click', function () {
            etat.recit = '';
            var c = document.getElementById('decouverteRecitTexte');
            if (c) { c.value = ''; c.focus(); }
            retirerCroixEffacer();
            afficherDetectionCoordonneesDecouverte('');
            var btnC = document.getElementById('btnContinuerDecouverte');
            if (btnC) { btnC.disabled = true; }
          });
        }
        // TACHE (retour Denis, 2026-08-31) : pulse vert ~10 s sur la zone
        // de recit, une seule fois par session, a la premiere arrivee sur
        // "Preparer" (jamais a chaque re-rendu declenche par un choix plus
        // bas dans la page). prefers-reduced-motion neutralise l'animation
        // (regle globale en fin de style.css).
        if (!_decouvertePulseRecitVu) {
          _decouvertePulseRecitVu = true;
          champ.classList.add('decouverte-zone-recit-pulse');
          setTimeout(function () {
            var c = document.getElementById('decouverteRecitTexte');
            if (c) { c.classList.remove('decouverte-zone-recit-pulse'); }
          }, 11000);
        }
      },
      onContinuer: function () { afficherEtape(4); }
    };
  }

  // ------------------------------------------------------------
  // Étape 4 — Choisir l'assistant (même schéma que le reste d'ERIP)
  // ------------------------------------------------------------
  // TACHE (chantier "alignement Decouverte") : reproduit EXACTEMENT la
  // disposition en 3 lignes horizontales de accordeonChoixIA (js/app.js,
  // page Action) -- sans compte / compte necessaire / ce qui va se passer,
  // avec panneau de detail PARTAGE en dessous. Reutilise ASSISTANTS_SANS_COMPTE_IA/
  // ETAPES_DETAIL_CHOIX_IA/lignePastillesAssistantsIA() (js/app.js, globales
  // depuis ce chantier), seul le HTML/wiring est adapte (data-assistant-decouverte
  // au lieu de data-assistant, fonctions de rendu differentes). Voir
  // docs/CHANTIER_DECOUVERTE_ALIGNEMENT_IA.md, section 1.
  function etapeChoixAssistant() {
    return {
      titre: '💬 Choisissez votre assistant',
      contenuHTML:
        _decouverteBandeau('<strong>Votre récit est prêt à être analysé.</strong> Choisissez un assistant en ligne : l’application lui transmet votre texte à votre place, sans votre nom ni vos coordonnées.') +
        '<p class="text-muted small mb-3">Cliquez sur un assistant ci-dessous. L’application prépare et copie tout pour vous, puis l’ouvre : vous n’avez rien à taper.</p>' +
        _decouverteEncart('&#127793;', 'Les assistants <strong>« Sans compte à créer »</strong> s’utilisent tout de suite, sans inscription. C’est le choix le plus simple si vous découvrez.', 'ok') +
        // TACHE (retour Denis, 2026-08-31, point 4) : reutilise le composant
        // partage modernise du Bilan (htmlChoixAssistantBilanCorps, js/app.js,
        // chantier M2 2026-08-30) au lieu du rendu maison a couleurs codees
        // en dur. Groupes etiquetes, accordeon "ce qui va se passer" + rappel
        // de confidentialite + demo video a l'interieur, tout en jetons de theme.
        htmlChoixAssistantBilanCorps({
          idErreur: 'decouverteErreurChoixIA',
          attrAssistant: 'data-assistant-decouverte',
          etapes: ETAPES_DETAIL_CHOIX_IA,
          texteConfidentialite: 'Votre nom, votre adresse et vos coordonnées ne sont jamais transmis à l’assistant. Seul votre récit part, éventuellement avec le métier ou le domaine que vous visez.'
        }) +
        // TACHE (retour Denis, 2026-08-31, point 5b) : filet de securite
        // "compte perso" -- prevenir avant le depart vers l'assistant.
        _decouverteEncartPhrasePrete('btnCopiePhraseRelanceChoix',
          '<span style="font-size:1.05rem;">&#128273;</span> <strong>Si vous utilisez votre propre compte.</strong> ' +
          'Connecté à votre compte, l’assistant peut se contenter de commenter votre demande au lieu de la faire. ' +
          'Si sa réponse ne contient pas ce qui est attendu, collez cette phrase dans la conversation, puis renvoyez :',
          DECOUVERTE_PHRASE_RELANCE),
      masquerContinuer: true,
      onAfficher: function () {
        _decouverteBrancherCopiePhrase('btnCopiePhraseRelanceChoix', DECOUVERTE_PHRASE_RELANCE);
        document.querySelectorAll('[data-assistant-decouverte]').forEach(function (bouton) {
          bouton.addEventListener('click', function () {
            var assistant = ASSISTANTS_IA.filter(function (a) { return a.id === bouton.dataset.assistantDecouverte; })[0];
            if (!assistant) { return; }
            // TACHE (retour Denis, 2026-09-19, point 3 de sa 3e liste de
            // corrections : "pour le 1er passage, l'ecran tampon n'y est
            // pas -- il va falloir le mettre") : ce clic construisait son
            // PROPRE mecanisme de copie + transition (navigator.clipboard
            // direct, sans jamais passer par ouvrirFenetreAssistantIA()),
            // contrairement au 2e passage (etapeChoisirAssistantCV(), via
            // wireRectangleChoixIA -> wireChoixAssistantIA -> deja cablee
            // sur cet ecran). Reutilise desormais EXACTEMENT le meme
            // composant partage (js/app.js) -- jamais une 2e logique de
            // copie/decompte maintenue en parallele. construireTexteACopier
            // est appelee seulement au clic sur "Je comprends, continuer"
            // (a l'interieur de la fenetre), la construction du texte
            // (instructions + contexte cible + recit) est donc inchangee,
            // simplement deplacee dans ce callback plutot qu'executee
            // immediatement au clic sur la pastille.
            ouvrirFenetreAssistantIA({
              nomAssistant: assistant.nom,
              idAssistant: assistant.id,
              urlAssistant: assistant.url,
              construireTexteACopier: function () {
                var instructions = (typeof promptsExternesCharges !== 'undefined' && promptsExternesCharges.decouverte) ||
                  (typeof promptParDefaut === 'function' ? promptParDefaut('decouverte') : '');
                // TACHE (retour utilisateur : "évidemment, si c'est possible,
                // je trouve ça super important") : le métier/domaine visé,
                // choisi à l'étape précédente, est maintenant réellement
                // transmis -- jusqu'ici seul le récit partait, l’assistant
                // travaillait à l'aveugle sur ce point.
                var contexteCible = '';
                if (dossier.metierCible) { contexteCible = 'Métier visé par la personne : ' + dossier.metierCible + '\n\n'; }
                else if (dossier.secteurCible) { contexteCible = 'Domaine visé par la personne (pas un métier précis) : ' + dossier.secteurCible + '\n\n'; }
                // TACHE (retour utilisateur : "si une offre précise existe,
                // les compétences révélées doivent s'orienter fortement vers
                // ses attentes, sans jamais s'y limiter" -- point de
                // vulnérabilité confirmé : ce texte était saisi à l'étape 1
                // mais jamais transmis jusqu'ici à CETTE analyse -- seul le
                // nom du métier/domaine l'était) : même fonction
                // d'abstraction que le parcours classique
                // (lienOffreCibleActuel(), js/app.js), jamais une 2e lecture
                // directe de dossier.rechercheCandidature qui risquerait de
                // diverger de ce que lit déjà le reste de l'application.
                var offreCibleDecouverte = (typeof lienOffreCibleActuel === 'function') ? lienOffreCibleActuel() : '';
                if (offreCibleDecouverte) { contexteCible += 'Offre précise visée par la personne (texte ou lien) : ' + offreCibleDecouverte + '\n\n'; }
                return instructions + '\n\n' + contexteCible + etat.recit;
              },
              // TACHE (chantier "ecran tampon avant l’assistant", volet
              // Decouverte) : l'URL/le nom voyagent jusqu'a l'etape "Collez
              // la reponse" (etapeCollerReponse), qui decide seule du
              // moment ou window.open() se declenche (decompte de 5s ou
              // clic "Continuer maintenant") -- inchange, seul le point
              // d'entree (ouvrirFenetreAssistantIA, plutot qu'un appel
              // direct) change.
              onApresValidation: function (urlAssistant, nomAssistant) {
                _etatTransitionIA = { urlAssistant: urlAssistant, nomAssistant: nomAssistant, phase: 'decompte', secondesRestantes: 5 };
                afficherEtape(5);
              }
            });
          });
        });
      }
    };
  }

  // ------------------------------------------------------------
  // Étape 5 — Coller la réponse (htmlCollageInstantane, réutilisé tel quel)
  // ------------------------------------------------------------
  // TACHE (chantier "ecran tampon avant l’assistant", volet Decouverte) :
  // banniere decompte/bloque/ouvert (htmlBanniereTransitionIA(), js/app.js,
  // globale) + rond bleu de collage desactive tant que le retour n'est pas
  // confirme -- meme mecanisme que l'accordeon ActionIA
  // (brancherEvenementsResultats(), js/app.js, ~ligne 11421-11501), adapte
  // ici aux ids de htmlCollageInstantane('Decouverte', ...). Voir
  // docs/CHANTIER_DECOUVERTE_ALIGNEMENT_IA.md, section 2.
  function etapeCollerReponse() {
    return {
      titre: '📥 Collez la réponse de l’assistant',
      contenuHTML:
        '<p class="text-muted small mb-2">Vous revenez de ' +
        (_etatTransitionIA ? '<strong>' + echapperAttribut(_etatTransitionIA.nomAssistant) + '</strong>' : 'l’assistant') +
        '. Une fois sa réponse copiée, collez-la ci-dessous.</p>' +
        htmlBanniereTransitionIA() +
        _decouverteEncart('&#128203;', 'Dans l’assistant, sélectionnez toute sa réponse et copiez-la (clic droit puis « Copier », ou <span style="white-space:nowrap;">Ctrl + C</span>). Ici, le bouton bleu la récupère tout seul. Si elle est longue et coupée en plusieurs morceaux, recopiez chaque morceau et recliquez : ils s’ajoutent à la suite.') +
        htmlCollageInstantane('Decouverte',
          '<div class="d-flex gap-2 mb-2 mt-2">' +
          // TACHE (retour utilisateur : "le bouton Importer doit pulser
          // une fois le texte colle, pour ne pas le confondre avec Voir
          // la demonstration") : pulsation permanente
          // (.bouton-incitation-action, css/style.css) -- visible
          // seulement une fois cette zone affichee (apres collage
          // reussi), jamais avant.
          '<button type="button" id="btnImporterDecouverte" class="bouton-incitation-action" style="font-size:1.05rem;font-weight:700;padding:0.65rem 1.5rem;' +
          'background:#0d6efd;color:#FFFFFF;border:none;border-radius:999px;box-shadow:0 4px 14px rgba(13,110,253,.4);">&#128229; Importer</button>' +
          '<button type="button" class="btn btn-outline-secondary btn-sm" id="btnEffacerRecoller">Effacer et recoller</button>' +
          '</div>') +
        '<div id="messageImportDecouverte" class="mt-2 small"></div>',
      // TACHE (retour Denis, 2026-08-31, Chantier 5) : plus d'encart "compte
      // perso" TOUJOURS visible ici -- il faisait doublon avec le message
      // d'echec. Le bloc d'aide (2 phrases, 2 situations) n'apparait plus
      // qu'a l'echec d'un import (voir le handler de #btnImporterDecouverte).
      masquerContinuer: true,
      onAfficher: function () {
        activerCollageInstantane({
          idZoneAuto: 'zoneCollageAutoDecouverte', idZoneApercu: 'zoneApercuCollageDecouverte',
          idTextarea: 'texteCollageDecouverte', idBoutonColler: 'btnCollerAutoDecouverte',
          idBoutonCollerManuel: 'btnCollerManuelDecouverte', idBoutonEffacerRecoller: 'btnEffacerRecoller',
          onSucces: function (texte, estAjout) {
            var msg = document.getElementById('messageImportDecouverte');
            msg.style.color = 'var(--success-strong)';
            msg.textContent = estAjout
              ? '✅ Morceau suivant ajouté à la suite. Copiez le prochain morceau puis recliquez, ou cliquez Importer si c’était le dernier.'
              : '✅ Réponse importée automatiquement depuis le presse-papiers. Si la réponse fait plusieurs morceaux, recliquez ce même bouton après avoir copié le morceau suivant : il s’ajoutera à la suite.';
          },
          onErreur: function (texteErreur) {
            var msg = document.getElementById('messageImportDecouverte');
            msg.style.color = 'var(--danger)'; msg.textContent = '⚠️ ' + texteErreur;
          },
          // TACHE (retour Denis, 2026-08-31) : le message d'erreur (ou l'encart
          // "redemander le JSON") ne doit pas survivre a "Effacer et recoller"
          // ni a un collage manuel.
          onEffacer: function () { var m = document.getElementById('messageImportDecouverte'); if (m) { m.innerHTML = ''; m.style.color = ''; } },
          onCollerManuel: function () { var m = document.getElementById('messageImportDecouverte'); if (m) { m.innerHTML = ''; m.style.color = ''; } }
        });

        // TACHE (chantier "ecran tampon avant l’assistant", volet Decouverte) :
        // etat desactive/actif du rond bleu + decompte/bannieres -- copie
        // adaptee du bloc equivalent de brancherEvenementsResultats()
        // (js/app.js, accordeon ActionIA). btnJeSuisDeRetourIA reprend le
        // MEME id que la page Action : installerEcouteurVisibiliteRetourIA()
        // (deja installe globalement, js/app.js) intensifie donc son pulse
        // au retour de visibilite de l'onglet, sans code supplementaire ici.
        var btnCollerAutoDecouverte = document.getElementById('btnCollerAutoDecouverte');
        var texteBtnCollerAutoDecouverte = document.getElementById('texteBtnCollerAutoDecouverte');
        if (_etatTransitionIA && btnCollerAutoDecouverte) {
          if (_etatTransitionIA.phase === 'revenu') {
            btnCollerAutoDecouverte.disabled = false;
            btnCollerAutoDecouverte.classList.remove('rond-collage-desactive', 'bouton-incitation-action');
            btnCollerAutoDecouverte.classList.add('pulse-collage-retour');
            if (texteBtnCollerAutoDecouverte) { texteBtnCollerAutoDecouverte.textContent = 'Cliquez ici pour coller la réponse copiée.'; }
          } else {
            // decompte ou ouvert : jamais cliquable avant le retour confirme
            // (meme securite UX que la page Action).
            btnCollerAutoDecouverte.disabled = true;
            btnCollerAutoDecouverte.classList.remove('bouton-incitation-action', 'pulse-collage-retour');
            btnCollerAutoDecouverte.classList.add('rond-collage-desactive');
            if (texteBtnCollerAutoDecouverte) { texteBtnCollerAutoDecouverte.textContent = 'Ce bouton s’activera à votre retour.'; }
          }

          // Ouvre reellement l'assistant (window.open repousse jusqu'ici
          // depuis etapeChoixAssistant(), voir passerEnAttenteOuvertureIA
          // plus haut) -- a la fin du decompte OU au clic sur "Continuer
          // maintenant". Phase 'bloque' geree comme cote page Action : un
          // window.open() declenche depuis un minuteur (sans clic direct)
          // est bloque silencieusement par le navigateur (retourne null).
          function ouvrirAssistantDecouverteEnAttente() {
            // TACHE (retour utilisateur : "corriger le meme bug sur Action
            // et Decouverte" -- bug reel trouve en construisant l'ecran
            // tampon pour CV/Lettre/Entretien) : la croix MASQUE seulement
            // ce modal (masquerDecouverteCompetences, display:none),
            // jamais ne le detruit -- sans ce garde-fou, le minuteur du
            // decompte survivrait a la fermeture et ouvrirait quand meme un
            // onglet popup surprise. "Reinitialiser" (recommencer()) le
            // detruit reellement (f.remove()) : verifie aussi que le modal
            // est toujours attache au document.
            // Parcours en page : si on a quitte la route 'decouverte'
            // entre-temps ("Quitter", "Retour"...), le minuteur ne doit
            // plus ouvrir d'onglet surprise.
            if (typeof pageActuelle !== 'undefined' && pageActuelle !== 'decouverte') {
              clearInterval(_intervalleDecompteIA);
              return;
            }
            // TACHE (retour Denis, 2026-09-19, point 4) : voir
            // recopierTexteAssistantPuisOuvrir() (js/app.js) -- meme
            // correctif, tous les parcours.
            recopierTexteAssistantPuisOuvrir(function () {
              var fenetreOuverte = window.open(_etatTransitionIA.urlAssistant, '_blank');
              _etatTransitionIA.phase = fenetreOuverte ? 'ouvert' : 'bloque';
              // TACHE (retour utilisateur : "le parcours Decouverte n'a aucun
              // suivi Umami") : mesure combien de navigateurs bloquent
              // reellement l'ouverture automatique, pour savoir si le repli
              // (bouton "Ouvrir maintenant") est frequemment sollicite.
              if (_etatTransitionIA.phase === 'bloque' && typeof trackEvenement === 'function') { trackEvenement('decouverte_popup_bloque'); }
              afficherEtape(5);
            });
          }

          if (_etatTransitionIA.phase === 'decompte') {
            var btnContinuerMaintenantIA = document.getElementById('btnContinuerMaintenantIA');
            if (btnContinuerMaintenantIA) {
              btnContinuerMaintenantIA.addEventListener('click', function () {
                clearInterval(_intervalleDecompteIA);
                ouvrirAssistantDecouverteEnAttente();
              });
            }
            _intervalleDecompteIA = setInterval(function () {
              _etatTransitionIA.secondesRestantes -= 1;
              var compteurDecompteIA = document.getElementById('compteurDecompteIA');
              if (compteurDecompteIA) { compteurDecompteIA.textContent = _etatTransitionIA.secondesRestantes; }
              if (_etatTransitionIA.secondesRestantes <= 0) {
                clearInterval(_intervalleDecompteIA);
                ouvrirAssistantDecouverteEnAttente();
              }
            }, 1000);
          } else if (_etatTransitionIA.phase === 'bloque') {
            var btnOuvrirBloqueIA = document.getElementById('btnOuvrirBloqueIA');
            if (btnOuvrirBloqueIA) {
              // Clic DIRECT (reaction immediate a l'action de la personne),
              // jamais bloque par le navigateur -- contrairement a l'appel
              // automatique ci-dessus.
              btnOuvrirBloqueIA.addEventListener('click', function () { ouvrirAssistantDecouverteEnAttente(); });
            }
          } else if (_etatTransitionIA.phase === 'ouvert') {
            var btnJeSuisDeRetourIA = document.getElementById('btnJeSuisDeRetourIA');
            if (btnJeSuisDeRetourIA) {
              // TACHE (decision explicite de l'utilisateur, chantier "ecran
              // tampon avant l’assistant") : retour MANUEL uniquement, jamais de
              // detection automatique -- meme regle que la page Action, non
              // renegociee ici.
              btnJeSuisDeRetourIA.addEventListener('click', function () {
                _etatTransitionIA.phase = 'revenu';
                afficherEtape(5);
              });
            }
            // TACHE (bloc 1.5) : "Rouvrir le site de l'assistant" -- meme
            // geste que le bouton de la phase "bloque".
            var btnRouvrirSiteIA = document.getElementById('btnRouvrirSiteIA');
            if (btnRouvrirSiteIA) { btnRouvrirSiteIA.addEventListener('click', function () { ouvrirAssistantDecouverteEnAttente(); }); }
          }
        }

        document.getElementById('btnImporterDecouverte').addEventListener('click', function () {
          var texte = document.getElementById('texteCollageDecouverte').value;
          var resultat = executerAnalyseInitiale(texte);
          var msg = document.getElementById('messageImportDecouverte');
          // TACHE (retour Denis, 2026-08-31) : on repart d'un message vierge a
          // chaque tentative (l'ancien message d'erreur / encart JSON ne doit
          // pas rester quand la nouvelle tentative reussit ou change).
          msg.innerHTML = ''; msg.style.color = '';
          if (!resultat.succes) {
            if (resultat.analyseImpossible) {
              // TACHE (retour Denis, 2026-08-31, Chantier 4) : le texte de
              // depart ne permet rien -> ecran dedie qui ramene au recit,
              // jamais la fenetre de validation des fragments ni un message
              // d'erreur qui blame le collage.
              msg.innerHTML = _decouverteBlocSaisieInexploitable(resultat.message, resultat.questionsCiblees);
              _decouverteBrancherBlocSaisieInexploitable(function () {
                // La croix "tout effacer" apparait a l'arrivee sur "Preparer".
                _decouverteRecitAEffacer = true;
                afficherEtape(1);
              });
              if (typeof trackEvenement === 'function') { trackEvenement('decouverte_saisie_inexploitable'); }
              return;
            }
            // TACHE (retour Denis, 2026-08-31, Chantier 5) : UN seul bloc
            // d'aide (message d'erreur + 2 phrases pretes, une par situation :
            // l'assistant a discute au lieu d'agir / il a repondu hors format).
            msg.innerHTML = _decouverteBlocEchecImport(echapperAttribut(resultat.erreur));
            _decouverteBrancherBlocEchecImport();
            return;
          }
          // TACHE (chantier "ecran tampon avant l’assistant", volet Decouverte) :
          // import reellement termine -- la transition en attente n'a plus
          // lieu d'etre (meme reinitialisation que avancerEtape() pour la
          // page Action, js/app.js), pour eviter qu'un etat 'revenu' perime
          // ne survive a un futur parcours Action ou Decouverte.
          _etatTransitionIA = null;
          // TACHE (retour utilisateur : "le parcours Decouverte beneficie
          // aussi de la disquette des le 1er passage par l’assistant ?") : Decouverte
          // n'ecrit jamais dans dossier.ia (voir declaration du drapeau,
          // js/app.js, pres de dossier.ia) -- ce drapeau, pose ici des le
          // 1er import reussi, est le seul signal que peutExporterSession()
          // peut lire pour ce parcours.
          dossier.decouverteAnalyseRecue = true;
          // Decouverte ne passe jamais par naviguerVers() (fenetre modale
          // independante du routeur principal) -- le pulse habituel de la
          // disquette (declenche depuis naviguerVers(), js/app.js) doit
          // donc etre appele ici explicitement pour signaler tout de suite
          // que sauvegarder est desormais possible.
          if (typeof declencherPulseDisquetteNavigation === 'function') { declencherPulseDisquetteNavigation(); }
          etat.etatsFragments = resultat.valeurs.fragments.map(initialiserEtatFragment);
          // TACHE (retour utilisateur : "ce message ne passe pas sur tous
          // les IA") : conserve la version nettoyée du récit (sans
          // contexte personnel sensible, decouverte-competences.md),
          // utilisée plus tard À LA PLACE du récit brut original -- voir
          // finaliserMappingDossier() plus bas.
          etat.reciteNettoye = resultat.valeurs.reciteNettoye || '';
          // TACHE (chantier "exp perso", Phase 1 : relier chaque question
          // ciblée à un fragment précis) : questionsCiblees passe d'une
          // simple liste de chaînes à des objets {texte, fragmentIndex,
          // type} (decouverte-competences.md, section "Questions
          // ciblées"). Normalisé ici, point d'entrée unique -- accepte
          // encore l'ancien format (chaîne brute) le temps que l’assistant suive
          // pleinement la nouvelle consigne, jamais un plantage si elle
          // ne renvoie pas exactement la forme attendue.
          etat.questionsCiblees = (resultat.valeurs.questionsCiblees || []).map(function (q) {
            if (typeof q === 'string') { return { texte: q, fragmentIndex: null, type: 'texte' }; }
            return {
              texte: q.texte || '',
              fragmentIndex: (typeof q.fragmentIndex === 'number') ? q.fragmentIndex : null,
              type: (q.type === 'date') ? 'date' : 'texte'
            };
          });
          afficherEtape(6);
        });
      }
    };
  }

  // ------------------------------------------------------------
  // Étape 6 — Découverte des compétences (le cœur du module)
  // ------------------------------------------------------------
  function contenuFragment(etatFragment, index, maxCompetences) {
    var enRaffinement = etat.fragmentEnRaffinement === etatFragment.fragmentId;
    // TACHE (retour utilisateur : "je ne peux pas retourner à l'expérience
    // 1, elle est cliquable mais elle ne s'ouvre pas" + "je veux naviguer
    // librement entre validées et non validées") : le résumé figé
    // "✓ Validé" empêchait toute navigation utile une fois l'onglet
    // rouvert -- il n'y avait rien à cliquer dedans. Retiré : un fragment
    // déjà validé affiche désormais EXACTEMENT le même formulaire éditable
    // que les autres, avec ses choix déjà faits pré-sélectionnés (le
    // fragment garde son état "valide" tant que rien n'est reconfirmé --
    // voir plus bas, la re-validation ne se déclenche qu'au clic sur
    // "Je valide").
    var estValide = etatFragment.etat === DECOUVERTE_ETATS_FRAGMENT.VALIDE;

    var html = '<div class="cv-section cv-section-compact mb-3" data-fragment-id="' + etatFragment.fragmentId + '">' +
      '<p class="small text-muted mb-2">« ' + echapperAttribut(etatFragment.texteOriginal) + ' »</p>' +
      (estValide ? '<p class="small mb-2" style="color:var(--success-strong);font-weight:700;">✅ Déjà validée - vous pouvez encore la modifier ci-dessous.</p>' : '');

    if (!enRaffinement) {
      // TACHE : les choix déjà confirmés (s'il y en a) servent directement
      // de référence pour la pré-sélection ET pour savoir si la personne a
      // changé quelque chose depuis -- plus besoin d'un mécanisme séparé
      // ("ancien choix" dupliqué), etatFragment.texteRetenu/competencesValidees
      // portent déjà cette information tant qu'ils n'ont pas été remplacés.
      var texteDejaRetenu = estValide ? etatFragment.texteRetenu : null;
      var competencesDejaRetenues = estValide ? etatFragment.competencesValidees.map(function (c) { return c.texte; }) : [];

      html += '<p class="small fw-semibold mb-2">Étape 1 - Choisissez la formulation qui vous correspond :</p>' +
        etatFragment.propositionsActuelles.map(function (prop, i) {
        var idBase = 'decouverte_prop_' + etatFragment.fragmentId + '_' + i;
        var etaitCoche = texteDejaRetenu ? (prop === texteDejaRetenu) : (i === 0);
        return '<div class="reco-item mb-2">' +
          '<span class="reco-rang">' + (i + 1) + '</span>' +
          '<input type="radio" name="propositions_' + etatFragment.fragmentId + '" class="reco-case" id="' + idBase + '"' + (etaitCoche ? ' checked' : '') + '>' +
          '<div class="reco-corps"><label for="' + idBase + '" class="mb-0">' + echapperAttribut(prop) + '</label></div>' +
          '</div>';
      }).join('');

      if (etatFragment.competencesActuelles.length) {
        html += '<p class="small fw-semibold mt-3 mb-1">Étape 2 - Cette expérience peut aussi révéler des compétences ' +
          'auxquelles vous n’aviez peut-être pas pensé - cochez celles qui vous parlent (' + maxCompetences + ' maximum) :</p>' +
          '<div class="d-flex flex-wrap gap-2 mb-2" data-zone-competences="' + etatFragment.fragmentId + '" data-max-competences="' + maxCompetences + '">' +
          etatFragment.competencesActuelles.map(function (comp, i) {
            var idComp = 'decouverte_comp_' + etatFragment.fragmentId + '_' + i;
            var etaitCochee = competencesDejaRetenues.indexOf(comp.texte) !== -1;
            return '<span><input type="checkbox" class="btn-check" id="' + idComp + '" data-competence-index="' + i + '"' + (etaitCochee ? ' checked' : '') + '>' +
              '<label class="btn btn-outline-primary btn-sm" for="' + idComp + '">' + echapperAttribut(comp.texte) + '</label></span>';
          }).join('') + '</div>' +
          '<p class="small mb-2" id="messageCompetencesRequises_' + etatFragment.fragmentId + '" style="color:var(--danger);display:none;">' +
          'Cochez au moins une compétence ci-dessus avant de valider.</p>';
      }

      // TACHE (retour utilisateur : "si je retourne sur une expérience
      // validée, le bouton ne doit pas pulser -- sauf si je modifie mes
      // choix, alors il se remet à pulser") : calme au premier rendu si
      // déjà validée (rien n'a encore été changé) ; sinon, même logique
      // qu'avant (pulse seulement si le plafond de compétences requis est
      // atteint). Recalculé en JS dès qu'une case ou une formulation
      // change (voir cablerEtapeDecouverte).
      var possedeCompetencesRequises = etatFragment.competencesActuelles.length > 0;
      var satisfaitAuDepart = possedeCompetencesRequises ? (competencesDejaRetenues.length > 0) : true;
      var doitPulserAuDepart = satisfaitAuDepart && !estValide;
      // TACHE (homogeneisation des pulses, 2026-08-28) : anneau standard
      // 0.4 / 8px, aucun grossissement, cadence 1.8s bornee a ~10 s.
      // TACHE (retour Denis, 2026-08-31) : plus de bleu ni de gris codes en
      // dur -- jetons du theme (visible aussi en mode sombre), coherent avec
      // les autres boutons du module.
      html += '<style>@keyframes pulseValiderDecouverte{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb, var(--accent) 40%, transparent);}' +
        '50%{box-shadow:0 0 0 8px color-mix(in srgb, var(--accent) 0%, transparent);}}' +
        '.btn-valider-fragment-actif{animation:pulseValiderDecouverte 1.8s ease-in-out 6;}</style>' +
        '<div style="border-top:1px solid var(--border);padding-top:0.8rem;" class="d-flex gap-2 flex-wrap">' +
        '<button type="button" data-valider-fragment="' + etatFragment.fragmentId + '" ' +
        (possedeCompetencesRequises ? 'data-requiert-competence="1"' : '') +
        ' class="btn-valider-fragment' + (doitPulserAuDepart ? ' btn-valider-fragment-actif' : '') + '" style="font-size:1.05rem;font-weight:700;' +
        'padding:0.65rem 1.5rem;border:none;border-radius:999px;' +
        (doitPulserAuDepart
          ? 'background:var(--accent);color:#FFFFFF;box-shadow:0 4px 14px color-mix(in srgb, var(--accent) 35%, transparent);'
          : 'background:var(--bg-hover);color:var(--text-muted);') +
        '">' + (estValide ? '✅ Choix déjà validés' : '✅ Je valide cette expérience') + '</button>' +
        (!estValide && raffinementEncorePossible(etatFragment)
          ? '<button type="button" class="btn btn-outline-secondary btn-sm" data-raffiner-fragment="' + etatFragment.fragmentId + '">Aucune ne correspond, précisez-moi</button>'
          : (!estValide ? '<button type="button" class="btn btn-outline-secondary btn-sm" data-repli-fragment="' + etatFragment.fragmentId + '">Garder mes mots tels quels</button>' : '')) +
        '</div>';
    } else {
      html += '<p class="small fw-semibold mb-2">' + DECOUVERTE_QUESTION_RAFFINEMENT_TYPE + '</p>' +
        '<textarea class="form-control form-control-sm mb-2" id="precisionRaffinement_' + etatFragment.fragmentId + '" rows="2" placeholder="Votre précision..."></textarea>' +
        '<button type="button" class="btn btn-outline-primary btn-sm mb-2" data-copier-precision="' + etatFragment.fragmentId + '">Copier pour l’assistant</button>' +
        '<div id="collageRaffinement_' + etatFragment.fragmentId + '"></div>';
    }

    html += '</div>';
    return html;
  }

  // TACHE (retour utilisateur : "avoir ce contenu sous forme d'onglets en
  // haut, bien identifiés, avec leur propre carré et une icône") : réutilise
  // exactement le même composant que "Choisissez ce que l’assistant propose pour
  // votre CV" (onglet-validation-import-btn/-panel, app.js) -- un onglet
  // par fragment/expérience, plutôt qu'une longue liste qui s'empile à la
  // suite. Une icône par origine, pour se repérer d'un coup d'œil.
  function iconeOrigineFragment(origine) {
    if (origine === 'proDeclaree' || origine === 'proNonDeclaree') { return '💼'; }
    if (origine === 'personnelleFamiliale') { return '🏠'; }
    if (origine === 'benevoleAssociative') { return '🤝'; }
    return '⭐';
  }

  function etapeDecouverte() {
    var toutesValidees = etat.etatsFragments.every(fragmentEstValide);
    // TACHE (retour utilisateur : navigation libre entre expériences
    // validées et non validées) : le récapitulatif ("modeRecap") n'est
    // plus déduit automatiquement de "tout est validé" -- il devient un
    // état d'affichage à part, activé une fois automatiquement (voir plus
    // bas), mais que la personne peut quitter en cliquant un onglet ou
    // "Modifier", sans jamais faire perdre leur état "validé" aux
    // fragments concernés (ils le restent tant qu'ils ne sont pas
    // réellement reconfirmés avec un nouveau choix).
    if (toutesValidees && etat.modeRecap === null) { etat.modeRecap = true; }
    if (!etat.ongletFragmentActif && etat.etatsFragments.length) {
      var premierNonValide = etat.etatsFragments.filter(function (ef) { return !fragmentEstValide(ef); })[0];
      etat.ongletFragmentActif = (premierNonValide || etat.etatsFragments[0]).fragmentId;
    }

    var maxCompetencesParExperience = 5;

    var boutons = '', panneaux = '';
    etat.etatsFragments.forEach(function (ef, i) {
      var actif = etat.ongletFragmentActif === ef.fragmentId;
      var coche = fragmentEstValide(ef) ? ' &#10003;' : '';
      boutons += '<button type="button" class="onglet-validation-import-btn' + (actif ? ' actif' : '') +
        '" data-onglet-fragment="' + ef.fragmentId + '">' + iconeOrigineFragment(ef.origine) + ' Expérience ' + (i + 1) + coche + '</button>';
      panneaux += '<div class="onglet-validation-import-panel' + (actif ? ' actif' : '') + '" data-panel-fragment="' + ef.fragmentId + '">' +
        contenuFragment(ef, i, maxCompetencesParExperience) + '</div>';
    });

    var contenuPrincipal;
    if (toutesValidees && etat.modeRecap) {
      contenuPrincipal = '<p class="text-muted small mb-3">Voici ce que vous avez validé. Vous pouvez encore modifier une expérience si besoin.</p>' +
        etat.etatsFragments.map(function (ef) {
          return '<div class="cv-section cv-section-compact mb-2">' +
            '<div class="d-flex justify-content-between align-items-start gap-2">' +
            '<div><strong>' + echapperAttribut(ef.texteRetenu) + '</strong>' +
            '<p class="small text-muted mb-1">' + ef.competencesValidees.map(function (c) { return echapperAttribut(c.texte); }).join(', ') + '</p></div>' +
            '<button type="button" style="background:var(--warning-bg-subtle);border:1px solid var(--warning-border);color:var(--warning-strong);font-weight:600;' +
            'border-radius:6px;padding:0.3rem 0.8rem;font-size:0.85rem;" class="flex-shrink-0" data-modifier-fragment="' + ef.fragmentId + '">Modifier</button>' +
            '</div></div>';
        }).join('');
    } else {
      contenuPrincipal = '<div class="onglets-validation-import">' + boutons + '</div>' +
        '<div class="onglets-validation-import-corps">' + panneaux + '</div>';
    }

    return {
      titre: '💡 Découverte de vos compétences',
      // NB : le cadrage ("pour chaque experience, gardez la formulation...")
      // est fourni en encart par etapeCompetences() qui enrobe ce
      // contenuHTML -- on ne le repete pas ici (2026-08-31).
      contenuHTML: contenuPrincipal,
      peutContinuer: toutesValidees,
      libelleContinuer: 'Continuer →',
      onAfficher: function () {
        // TACHE (retour utilisateur : "je veux naviguer librement entre
        // les expériences, validées ou non") : simple changement d'onglet
        // désormais, plus aucun traitement spécial selon l'état validé --
        // contenuFragment() sait déjà afficher le bon formulaire dans les
        // deux cas.
        document.querySelectorAll('[data-onglet-fragment]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            etat.ongletFragmentActif = btn.dataset.ongletFragment;
            etat.modeRecap = false;
            afficherEtape(6);
          });
        });
        document.querySelectorAll('[data-modifier-fragment]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            etat.ongletFragmentActif = btn.dataset.modifierFragment;
            etat.modeRecap = false;
            afficherEtape(6);
          });
        });
        cablerEtapeDecouverte();
      },
      onContinuer: function () {
        afficherEtape(etat.questionsCiblees.length ? 7 : 8);
      }
    };
  }


  function cablerEtapeDecouverte() {
    // TACHE (retour utilisateur : "si je retourne sur une expérience
    // validée, le bouton ne doit pas pulser -- sauf si je modifie mes
    // choix, alors il se remet à pulser") : fonction unique de recalcul,
    // appelée à chaque changement (case à cocher OU formulation) --
    // compare la sélection ACTUELLE à etatFragment.texteRetenu/
    // competencesValidees (le "déjà validé" sert directement de
    // référence, pas besoin d'un mécanisme séparé).
    function recalculerBoutonValider(fragmentId) {
      var ef = etat.etatsFragments.filter(function (x) { return x.fragmentId === fragmentId; })[0];
      if (!ef) { return; }
      var btn = document.querySelector('[data-valider-fragment="' + fragmentId + '"]');
      if (!btn) { return; }
      var zoneComp = document.querySelector('[data-zone-competences="' + fragmentId + '"]');
      var nbCoches = zoneComp ? zoneComp.querySelectorAll('input[type="checkbox"]:checked').length : 0;
      var possedeCompetencesRequises = !!btn.dataset.requiertCompetence;
      var satisfait = possedeCompetencesRequises ? (nbCoches > 0) : true;

      var estValide = ef.etat === DECOUVERTE_ETATS_FRAGMENT.VALIDE;
      var rienNaChange = false;
      if (estValide) {
        var choisi = document.querySelector('input[name="propositions_' + fragmentId + '"]:checked');
        var texteChoisiActuel = choisi ? ef.propositionsActuelles[parseInt(choisi.id.split('_').pop(), 10)] : null;
        var competencesCocheesActuelles = zoneComp
          ? Array.prototype.slice.call(zoneComp.querySelectorAll('input[type="checkbox"]:checked'))
            .map(function (c) { return ef.competencesActuelles[parseInt(c.dataset.competenceIndex, 10)].texte; }).sort()
          : [];
        var competencesValideesTexte = ef.competencesValidees.map(function (c) { return c.texte; }).sort();
        rienNaChange = (texteChoisiActuel === ef.texteRetenu) &&
          (competencesCocheesActuelles.join('|') === competencesValideesTexte.join('|'));
      }

      var doitPulser = satisfait && !rienNaChange;
      btn.textContent = (estValide && rienNaChange) ? '✅ Choix déjà validés' : '✅ Je valide cette expérience';
      if (doitPulser) {
        btn.style.background = 'var(--accent)'; btn.style.color = '#FFFFFF'; btn.style.boxShadow = '0 4px 14px color-mix(in srgb, var(--accent) 35%, transparent)';
        btn.classList.add('btn-valider-fragment-actif');
      } else {
        btn.style.background = 'var(--bg-hover)'; btn.style.color = 'var(--text-muted)'; btn.style.boxShadow = 'none';
        btn.classList.remove('btn-valider-fragment-actif');
      }
      var msg = document.getElementById('messageCompetencesRequises_' + fragmentId);
      if (msg && (nbCoches > 0 || !possedeCompetencesRequises)) { msg.style.display = 'none'; }
    }

    // TACHE (retour utilisateur : "maximum 4 (ou 5) par expérience") :
    // plafond appliqué ici, au clic -- désactive les cases non cochées dès
    // que le plafond (dynamique, voir data-max-competences) est atteint,
    // jamais un message d'erreur après coup qui obligerait à décocher
    // soi-même.
    document.querySelectorAll('[data-zone-competences]').forEach(function (zone) {
      var cases = zone.querySelectorAll('input[type="checkbox"]');
      var plafond = parseInt(zone.dataset.maxCompetences, 10) || 4;
      var fragmentId = zone.dataset.zoneCompetences;
      function appliquerPlafond() {
        var nbCoches = zone.querySelectorAll('input[type="checkbox"]:checked').length;
        cases.forEach(function (c) { c.disabled = !c.checked && nbCoches >= plafond; });
        recalculerBoutonValider(fragmentId);
      }
      cases.forEach(function (c) { c.addEventListener('change', appliquerPlafond); });
    });
    // TACHE : la formulation choisie (Étape 1) fait elle aussi partie de
    // ce qui peut avoir changé depuis la dernière validation -- écouteur
    // ajouté ici, absent jusqu'ici (seules les compétences déclenchaient
    // un recalcul).
    document.querySelectorAll('input[name^="propositions_"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        var fragmentId = this.name.replace('propositions_', '');
        recalculerBoutonValider(fragmentId);
      });
    });

    document.querySelectorAll('[data-valider-fragment]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.validerFragment;
        if (btn.dataset.requiertCompetence) {
          var zoneComp0 = document.querySelector('[data-zone-competences="' + id + '"]');
          var nbCoches0 = zoneComp0 ? zoneComp0.querySelectorAll('input[type="checkbox"]:checked').length : 0;
          if (nbCoches0 === 0) {
            var msg0 = document.getElementById('messageCompetencesRequises_' + id);
            if (msg0) { msg0.style.display = 'block'; }
            return;
          }
        }
        var ef = etat.etatsFragments.filter(function (x) { return x.fragmentId === id; })[0];
        // TACHE (retour utilisateur : navigation libre + reconfirmation
        // transparente) : un fragment déjà validé qu'on revalide (avec ou
        // sans changement) doit repasser légitimement par la machine à
        // états -- reouvrirFragment() est appelé ici, de façon invisible
        // pour la personne, juste avant de revalider.
        if (ef.etat === DECOUVERTE_ETATS_FRAGMENT.VALIDE) { reouvrirFragment(ef); }
        var choisi = document.querySelector('input[name="propositions_' + id + '"]:checked');
        var index = choisi ? parseInt(choisi.id.split('_').pop(), 10) : 0;
        var zoneComp = document.querySelector('[data-zone-competences="' + id + '"]');
        var competencesCochees = zoneComp
          ? Array.prototype.slice.call(zoneComp.querySelectorAll('input[type="checkbox"]:checked'))
            .map(function (c) { return ef.competencesActuelles[parseInt(c.dataset.competenceIndex, 10)]; })
          : [];
        executerValidationFragment(ef, {
          texteChoisi: ef.propositionsActuelles[index],
          competencesRetenues: competencesCochees.length ? competencesCochees : ef.competencesActuelles
        });
        // TACHE (retour utilisateur : "je me retrouve sur la même fenêtre
        // avec 'choix déjà validés', comme si j'avais déjà eu le
        // récapitulatif" -- bug réel) : modeRecap utilisait "null" comme
        // "jamais encore déclenché", mais toute navigation entre onglets
        // ou tout Retour avant la fin le faisait passer à false --
        // définitivement, puisque rien ne le remettait à null ensuite. Le
        // passage automatique au récapitulatif ne se déclenchait donc
        // plus jamais. Corrigé : on détecte ici précisément le moment où
        // CETTE validation vient de compléter l'ensemble, et on force le
        // récapitulatif à ce moment-là, peu importe l'état précédent.
        if (etat.etatsFragments.every(fragmentEstValide)) {
          etat.modeRecap = true;
        } else if (!etat.modeRecap) {
          var suivant = etat.etatsFragments.filter(function (x) { return !fragmentEstValide(x); })[0];
          etat.ongletFragmentActif = suivant ? suivant.fragmentId : id;
        }
        afficherEtape(6);
      });
    });
    document.querySelectorAll('[data-raffiner-fragment]').forEach(function (btn) {
      btn.addEventListener('click', function () { etat.fragmentEnRaffinement = btn.dataset.raffinerFragment; afficherEtape(6); });
    });
    document.querySelectorAll('[data-repli-fragment]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.repliFragment;
        var ef = etat.etatsFragments.filter(function (x) { return x.fragmentId === id; })[0];
        declencherRepli(ef);
        executerValidationFragment(ef, {});
        if (etat.etatsFragments.every(fragmentEstValide)) {
          etat.modeRecap = true;
        } else {
          var suivant = etat.etatsFragments.filter(function (x) { return !fragmentEstValide(x); })[0];
          etat.ongletFragmentActif = suivant ? suivant.fragmentId : id;
        }
        afficherEtape(6);
      });
    });
    document.querySelectorAll('[data-copier-precision]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.copierPrecision;
        var ef = etat.etatsFragments.filter(function (x) { return x.fragmentId === id; })[0];
        var precision = document.getElementById('precisionRaffinement_' + id).value.trim();
        if (!precision) { return; }
        var messageSuite = 'Pour le fragment "' + ef.texteOriginal + '", voici une précision : ' + precision +
          '\n\nPropose une nouvelle série de formulations et de compétences (même format JSON que précédemment, ' +
          'uniquement pour ce fragment) :\n```json\n{"propositions": ["...", "..."], "competencesProposees": [{"texte":"...","categorie":"...","preuve":["..."]}]}\n```';
        // TACHE (meme robustesse que l'ecoute d'assistant plus haut) : pas de
        // window.open() ici, donc pas de course avec le focus -- mais la
        // copie peut quand meme echouer silencieusement (permission
        // refusee...), d'ou le meme repli execCommand('copy') plutot qu'un
        // simple .catch(function(){}) qui laisserait l'ancien contenu du
        // presse-papiers en place sans que la personne ne le sache.
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(messageSuite).catch(function () {
            var zRepli = document.createElement('textarea');
            zRepli.value = messageSuite;
            document.body.appendChild(zRepli);
            zRepli.select();
            document.execCommand('copy');
            zRepli.remove();
          });
        }
        var zone = document.getElementById('collageRaffinement_' + id);
        zone.innerHTML = '<p class="small text-muted mt-2">Collez ce message dans la même conversation, puis collez sa réponse ci-dessous :</p>' +
          htmlCollageInstantane('Raffinement' + id,
            '<button type="button" class="btn btn-primary btn-sm mt-2 bouton-incitation-action" data-importer-raffinement="' + id + '">Importer cette réponse</button>');
        activerCollageInstantane({
          idZoneAuto: 'zoneCollageAutoRaffinement' + id, idZoneApercu: 'zoneApercuCollageRaffinement' + id,
          idTextarea: 'texteCollageRaffinement' + id, idBoutonColler: 'btnCollerAutoRaffinement' + id,
          idBoutonCollerManuel: 'btnCollerManuelRaffinement' + id
        });
        zone.querySelector('[data-importer-raffinement]').addEventListener('click', function () {
          var texteColle = document.getElementById('texteCollageRaffinement' + id).value;
          var resultat = executerRaffinement(ef, texteColle);
          if (!resultat.succes) { alert(resultat.erreur); return; }
          etat.fragmentEnRaffinement = null;
          afficherEtape(6);
        });
      });
    });
  }

  // ------------------------------------------------------------
  // Étape 7 — Questions ciblées (5 à 10, absente si vide -- gérée à l'appel)
  // TACHE (retour utilisateur : "je veux au moins 5 questions, jamais
  // plus de 10" -- decouverte-competences.md, section "Questions
  // ciblées") : plancher relevé de 0 à 5, plafond de 5 à 10. Le titre et
  // le texte d'introduction ci-dessous sont mis à jour en conséquence --
  // "deux ou trois précisions" ne correspondait déjà plus à la réalité
  // (jusqu'à 5 questions étaient déjà possibles avant ce changement).
  // ------------------------------------------------------------
  // TACHE (chantier "exp perso", Phase 2 : champ structuré pour les
  // questions de type "date") : jamais un champ de texte libre pour une
  // date (risque de faute de frappe/interprétation, retour utilisateur) --
  // deux sélecteurs d'année (fin vide = "toujours en cours"), bornés de
  // 1960 à l'année en cours calculée réellement (jamais une année en dur
  // qui deviendrait fausse avec le temps).
  function optionsAnnees(valeurSelectionnee, libellePremiereOption) {
    var anneeCourante = new Date().getFullYear();
    var options = '<option value="">' + libellePremiereOption + '</option>';
    for (var annee = anneeCourante; annee >= 1960; annee--) {
      options += '<option value="' + annee + '"' + (String(annee) === String(valeurSelectionnee) ? ' selected' : '') + '>' + annee + '</option>';
    }
    return options;
  }

  function etapeQuestionsCiblees() {
    return {
      titre: '❓ Quelques précisions',
      contenuHTML:
        '<p class="text-muted small mb-3">Ces quelques précisions nous aident à mieux orienter votre profil.</p>' +
        etat.questionsCiblees.map(function (q, i) {
          // TACHE (chantier "exp perso", Phase 2) : question de type
          // "date" -- deux sélecteurs d'année, jamais un champ de texte
          // libre pour ce cas précis (voir optionsAnnees ci-dessus).
          // Réponse stockée sous forme d'objet {dateDebut, dateFin} dans
          // etat.reponsesQuestionsCiblees[i] -- PAS une chaîne, à la
          // différence des questions de type "texte" ci-dessous (voir
          // finaliserMappingDossier(), qui gère les deux formes).
          if (q.type === 'date') {
            var reponseDate = (etat.reponsesQuestionsCiblees[i] && typeof etat.reponsesQuestionsCiblees[i] === 'object')
              ? etat.reponsesQuestionsCiblees[i] : { dateDebut: '', dateFin: '' };
            return '<div class="mb-3"><label class="form-label small fw-semibold">' + echapperAttribut(q.texte) + '</label>' +
              '<div class="d-flex gap-2 align-items-center flex-wrap">' +
              '<select class="form-select form-select-sm" style="width:auto;" id="reponseCibleeDebut_' + i + '">' +
              optionsAnnees(reponseDate.dateDebut, 'Année de début') + '</select>' +
              '<span class="small text-muted">à</span>' +
              '<select class="form-select form-select-sm" style="width:auto;" id="reponseCibleeFin_' + i + '">' +
              optionsAnnees(reponseDate.dateFin, 'Toujours en cours') + '</select>' +
              '</div></div>';
          }
          // TACHE (retour utilisateur : "pour la formation... indiquer
          // l'année, même format que les questions sur la durée du
          // métier -- pareil pour tout ce qui est associatif, bénévole,
          // expérience personnelle") : formation/engagement combinent
          // désormais un champ texte (l'intitulé/la description, dans
          // les mots de la personne) ET les mêmes 2 sélecteurs d'année
          // que le type "date" -- jamais un champ de texte libre pour la
          // date elle-même. Réponse stockée en {texte, dateDebut,
          // dateFin} (voir finaliserMappingDossier()).
          if (q.type === 'formation' || q.type === 'engagement') {
            var reponseCombinee = (etat.reponsesQuestionsCiblees[i] && typeof etat.reponsesQuestionsCiblees[i] === 'object')
              ? etat.reponsesQuestionsCiblees[i] : { texte: '', dateDebut: '', dateFin: '', niveau: '' };
            // TACHE (retour utilisateur : "on peut aussi rajouter le
            // niveau d'études... si jamais ils ont un niveau bac, cela
            // devrait faire apparition dans le bloc Formation") :
            // UNIQUEMENT pour "formation" (jamais "engagement", qui n'a
            // pas cette notion) -- réutilise NIVEAUX_DIPLOME_SIMPLES
            // (app.js), déjà utilisé par le formulaire Formation
            // classique, jamais une liste dupliquée. Optionnel (aucun
            // niveau présélectionné) -- une pastille de plus à cliquer,
            // pas un champ obligatoire.
            var pastillesNiveauQuestion = (q.type === 'formation')
              ? '<div class="mb-2"><span class="small text-muted d-block mb-1">Niveau (optionnel)</span>' +
                '<div class="pastilles">' + NIVEAUX_DIPLOME_SIMPLES.map(function (n) {
                  var actif = (reponseCombinee.niveau === n.label) ? ' actif' : '';
                  return '<span class="pastille' + actif + '" data-niveau-formation-question="' + echapperAttribut(n.label) + '" data-index-question="' + i + '">' + n.label + '</span>';
                }).join('') + '</div></div>'
              : '';
            return '<div class="mb-3"><label class="form-label small fw-semibold">' + echapperAttribut(q.texte) + '</label>' +
              '<input type="text" class="form-control form-control-sm mb-2" id="reponseCiblee_' + i + '" value="' + echapperAttribut(reponseCombinee.texte || '') + '">' +
              pastillesNiveauQuestion +
              '<div class="d-flex gap-2 align-items-center flex-wrap">' +
              '<select class="form-select form-select-sm" style="width:auto;" id="reponseCibleeDebut_' + i + '">' +
              optionsAnnees(reponseCombinee.dateDebut, 'Année de début') + '</select>' +
              '<span class="small text-muted">à</span>' +
              '<select class="form-select form-select-sm" style="width:auto;" id="reponseCibleeFin_' + i + '">' +
              optionsAnnees(reponseCombinee.dateFin, 'Toujours en cours') + '</select>' +
              '</div></div>';
          }
          return '<div class="mb-3"><label class="form-label small fw-semibold">' + echapperAttribut(q.texte) + '</label>' +
            '<input type="text" class="form-control form-control-sm" id="reponseCiblee_' + i + '" value="' + echapperAttribut(typeof etat.reponsesQuestionsCiblees[i] === 'string' ? etat.reponsesQuestionsCiblees[i] : '') + '"></div>';
        }).join('') +
        // TACHE (retour utilisateur : "la fenêtre Votre stratégie... je
        // n'ai pas besoin de cette fenêtre qui apparaît juste avant de
        // pouvoir personnaliser le CV, j'ai déjà stratégie de contenu
        // sur la page CV") : écran supprimé (voir plus bas, onContinuer
        // enchaîne directement vers les résultats) -- ce simple
        // conteneur d'erreur reprend le rôle de l'ancien
        // "messageErreurGenerationDecouverte" (même id, jamais un
        // deuxième mécanisme d'affichage d'erreur), au cas où la
        // finalisation échouerait : la personne reste alors sur CET
        // écran (étape 7), avec le message ici, plutôt que sur un écran
        // qui n'existe plus.
        '<div id="messageErreurGenerationDecouverte" class="small mt-3"></div>',
      peutContinuer: true,
      onAfficher: function () {
        etat.questionsCiblees.forEach(function (q, i) {
          if (q.type === 'date') {
            var selectDebut = document.getElementById('reponseCibleeDebut_' + i);
            var selectFin = document.getElementById('reponseCibleeFin_' + i);
            function majReponseDate() {
              etat.reponsesQuestionsCiblees[i] = { dateDebut: selectDebut.value, dateFin: selectFin.value };
            }
            selectDebut.addEventListener('change', majReponseDate);
            selectFin.addEventListener('change', majReponseDate);
            return;
          }
          // TACHE (retour utilisateur : "formation/engagement -- même
          // format que les questions de durée") : même principe que
          // "date" ci-dessus, plus le champ texte (intitulé/description).
          if (q.type === 'formation' || q.type === 'engagement') {
            var champTexteCombine = document.getElementById('reponseCiblee_' + i);
            var selectDebutCombine = document.getElementById('reponseCibleeDebut_' + i);
            var selectFinCombine = document.getElementById('reponseCibleeFin_' + i);
            function majReponseCombinee() {
              var precedent = (etat.reponsesQuestionsCiblees[i] && typeof etat.reponsesQuestionsCiblees[i] === 'object')
                ? etat.reponsesQuestionsCiblees[i] : {};
              etat.reponsesQuestionsCiblees[i] = {
                texte: champTexteCombine.value,
                dateDebut: selectDebutCombine.value,
                dateFin: selectFinCombine.value,
                niveau: precedent.niveau || ''
              };
            }
            champTexteCombine.addEventListener('input', majReponseCombinee);
            selectDebutCombine.addEventListener('change', majReponseCombinee);
            selectFinCombine.addEventListener('change', majReponseCombinee);
            // TACHE (retour utilisateur : "aucune trace dans le CV" --
            // piste trouvée en relisant le code : ce champ était le SEUL
            // de cet écran sans gestionnaire de touche Entrée, contrairement
            // à tous les autres (voir plus bas, "quand je tape sur Entrée
            // je passe d'une zone de texte à une autre"). Une touche
            // Entrée non interceptée dans un champ texte peut déclencher
            // une soumission de formulaire native selon le contexte,
            // perdant potentiellement la saisie avant même que
            // majReponseCombinee() n'ait pu la capturer -- même
            // comportement désormais ajouté ici, jamais laissé de côté.
            champTexteCombine.addEventListener('keydown', function (e) {
              if (e.key !== 'Enter') { return; }
              e.preventDefault();
              var suivant = document.getElementById('reponseCiblee_' + (i + 1));
              if (suivant) { suivant.focus(); } else { document.getElementById('btnContinuerDecouverte').click(); }
            });
            // TACHE (retour utilisateur : "niveau d'études") : clic sur
            // une pastille = bascule (reclique la même = désélectionne,
            // jamais un niveau imposé). Uniquement présent pour
            // "formation" (voir le rendu HTML ci-dessus), donc ce
            // sélecteur ne trouve simplement rien pour "engagement".
            document.querySelectorAll('[data-index-question="' + i + '"]').forEach(function (pastille) {
              pastille.addEventListener('click', function () {
                var niveauClique = this.dataset.niveauFormationQuestion;
                var actuel = (etat.reponsesQuestionsCiblees[i] && typeof etat.reponsesQuestionsCiblees[i] === 'object')
                  ? etat.reponsesQuestionsCiblees[i] : { texte: champTexteCombine.value, dateDebut: selectDebutCombine.value, dateFin: selectFinCombine.value, niveau: '' };
                actuel.niveau = (actuel.niveau === niveauClique) ? '' : niveauClique;
                etat.reponsesQuestionsCiblees[i] = actuel;
                // Re-rend l'ecran courant (etape 7 en solo, ou l'ecran
                // "Vos competences" fusionne).
                afficherEtape(etat.etapeCourante);
              });
            });
            return;
          }
          var champ = document.getElementById('reponseCiblee_' + i);
          champ.addEventListener('input', function () { etat.reponsesQuestionsCiblees[i] = this.value; });
          // TACHE (retour utilisateur : "quand je tape sur Entrée je passe
          // d'une zone de texte à une autre, et pour la dernière =
          // continuer") :
          champ.addEventListener('keydown', function (e) {
            if (e.key !== 'Enter') { return; }
            e.preventDefault();
            var suivant = document.getElementById('reponseCiblee_' + (i + 1));
            if (suivant) { suivant.focus(); } else { document.getElementById('btnContinuerDecouverte').click(); }
          });
        });
      },
      // TACHE (retour utilisateur : "l'écran stratégie disparaît, mais
      // pas le calcul lui-même") : calculerStrategieSiBesoin() -- même
      // calcul qu'avant (executerStrategie(), inchangé), toujours
      // silencieux désormais -- alimente encore dossier.
      // typeCVRecommandeDecouverte (chantier délibérément laissé de
      // côté, voir mémoire) sans jamais l'imposer ni le montrer à la
      // personne. finaliserMappingDossier() + terminerParcoursDecouverte()
      // reprennent ensuite, à l'identique, tout ce que faisait l'ancien
      // onContinuer de l'étape 8 (mapping, application au dossier,
      // navigation) -- jamais une seconde logique parallèle.
      onContinuer: function () {
        // TACHE (retour utilisateur : "je n'ai toujours rien du côté
        // formation et engagement associatif malgré les questions...
        // c'est trop aléatoire") : cette étape s'affiche désormais
        // TOUJOURS -- son rôle dépasse largement la seule mobilité
        // (Formations/diplômes/certifications, Engagement associatif,
        // Savoir-faire personnel s'y ajoutent, jamais laissés au hasard
        // d'un assistant qui devrait détecter elle-même le manque). Chaque
        // bloc reste individuellement Oui/Non -- répondre "Non" partout
        // revient à ne rien ajouter, un clic "Continuer" suffit alors à
        // passer à la suite exactement comme avant.
        afficherEtape(8);
      }
    };
  }

  // ------------------------------------------------------------
  // Étape 8 — Vos informations (identité, formations, savoir-faire, compléments)
  // ------------------------------------------------------------
  // TACHE (retour Denis, 2026-09-19, point 6 de sa 2e liste de corrections :
  // "je veux récupérer la page Vos informations du parcours Créer un
  // nouveau CV à la place de Compléter mon CV -- elle est très bien faite,
  // complète, bien réfléchie") : remplace ENTIÈREMENT l'ancien panneau
  // maison à onglets (Mobilité/Formation/Engagement/Savoir-faire,
  // ~1700 lignes retirées avec ce chantier) par les MÊMES blocs ERIP
  // partagés que "Vos informations" (pageProjet(), js/app.js) :
  // CONFIG_BLOC_VOUS (identité/langues/mobilité), CONFIG_BLOC_PARCOURS
  // (formations/certifications), CONFIG_BLOC_EXPERIENCES_PERSO
  // (savoir-faire personnel), CONFIG_BLOC_COMPLEMENTS (loisirs/
  // engagements) -- jamais un fork, jamais une 2e copie de ces
  // composants. CONFIG_BLOC_EXPERIENCES_PRO (expériences
  // professionnelles) est volontairement EXCLU de cette étape : il a
  // déjà sa propre étape dédiée juste après (« Vos expériences », points
  // 5/6 du chantier du 2026-09-18 + point 4 de celui-ci) -- l'inclure
  // ici referait doublon avec elle.
  // TACHE (même point 6, sous-décision tranchée avec Denis) : l'identité
  // (nom/prénom/contact/adresse/photo) n'est plus demandée à "Préparer"
  // (etapeIdentite(), réduite à la seule civilité, voir etapePreparer()
  // plus haut) -- ce bloc "Vous" devient le SEUL endroit où la saisir
  // pour Découverte, exactement comme pour "Créer un nouveau CV". La
  // civilité déjà choisie à "Préparer" (dossier.identite.civilite) y est
  // déjà pré-remplie, jamais redemandée à vide.
  function etapeVosInformationsDecouverte() {
    var configsInfosDecouverte = [CONFIG_BLOC_VOUS, CONFIG_BLOC_PARCOURS, CONFIG_BLOC_EXPERIENCES_PERSO, CONFIG_BLOC_COMPLEMENTS];
    // TACHE : même état d'ouverture par défaut que pageProjet() (Vous et
    // Formations ouverts, Savoir-faire perso et Compléments fermés),
    // appliqué UNE seule fois -- drapeau propre à Découverte
    // (_decouverteInfosBlocsInitialisees, déclaré plus haut), jamais
    // _vosInfosBlocsInitialises (partagé avec la vraie page "Vos
    // informations", aucune raison d'interférer avec son propre état).
    if (!_decouverteInfosBlocsInitialisees) {
      etatBlocsERIPOuverts.vous = true;
      etatBlocsERIPOuverts.parcours = true;
      etatBlocsERIPOuverts['experiences-perso'] = false;
      etatBlocsERIPOuverts.complements = false;
      _decouverteInfosBlocsInitialisees = true;
    }
    // TACHE : même mécanisme que pageProjet() -- referme le bandeau qui
    // vient de se compléter, ouvre le suivant encore incomplet (voir
    // verifierTransitionsCompletionBlocs(), js/app.js).
    verifierTransitionsCompletionBlocs(configsInfosDecouverte, false);
    // TACHE (retour Denis, 2026-09-19, point 5, UNIQUEMENT pour Decouverte
    // -- voir _decouverteCascadeParcoursFaite plus haut pour le detail du
    // comportement demande) : "touche" = au moins une sous-question de ce
    // bloc a deja une reponse (compteurBlocERIP().complet > 0), meme
    // signal que le badge "a completer/complete" deja affiche -- jamais
    // une detection de champ dossier reinventee ici. Edge-triggered (une
    // seule fois) : un manque de re-imposer l'etat a chaque rendu, sinon
    // impossible de refermer/rouvrir manuellement par la suite.
    if (!_decouverteCascadeParcoursFaite && compteurBlocERIP(CONFIG_BLOC_PARCOURS).complet > 0) {
      etatBlocsERIPOuverts['experiences-perso'] = true;
      etatBlocsERIPOuverts.complements = true;
      _decouverteCascadeParcoursFaite = true;
    }
    if (!_decouverteCascadeExperiencesPersoFaite && compteurBlocERIP(CONFIG_BLOC_EXPERIENCES_PERSO).complet > 0) {
      etatBlocsERIPOuverts.vous = false;
      etatBlocsERIPOuverts.parcours = false;
      _decouverteCascadeExperiencesPersoFaite = true;
    }
    if (!_decouverteCascadeComplementsFaite && compteurBlocERIP(CONFIG_BLOC_COMPLEMENTS).complet > 0) {
      etatBlocsERIPOuverts['experiences-perso'] = false;
      _decouverteCascadeComplementsFaite = true;
    }
    return {
      titre: '📋 Vos informations',
      contenuHTML:
        '<p class="text-muted small mb-3">Ces informations complètent votre CV. Seule votre identité (nom, prénom et un moyen de contact) est indispensable : le reste, indiquez-le seulement si vous en avez.</p>' +
        '<div class="mon-projet-plier-tout">' +
        '<button type="button" class="btn btn-sm btn-outline-secondary" data-blocs-tout-decouverte="ouvrir">&#9662; Tout déplier</button>' +
        '<button type="button" class="btn btn-sm btn-outline-secondary" data-blocs-tout-decouverte="fermer">&#9656; Tout replier</button>' +
        '</div>' +
        '<div class="grille-mon-projet">' +
        '<div class="rangee-mon-projet">' + blocERIP(CONFIG_BLOC_VOUS) + '</div>' +
        '<div class="rangee-mon-projet">' + blocERIP(CONFIG_BLOC_PARCOURS) + '</div>' +
        '<div class="rangee-mon-projet">' + blocERIP(CONFIG_BLOC_EXPERIENCES_PERSO) + '</div>' +
        '<div class="rangee-mon-projet">' + blocERIP(CONFIG_BLOC_COMPLEMENTS) + '</div>' +
        '</div>',
      // TACHE (zéro régression fonctionnelle) : "Préparer" exigeait avant
      // nom+prénom pour continuer (etapeIdentite().peutContinuer) -- cette
      // exigence est déplacée ici, sur le même signal que "Créer un
      // nouveau CV" (dossier.identiteEnregistree, posé par le bouton
      // "Enregistrer mon identité" du bloc "Vous"), jamais perdue en
      // route.
      peutContinuer: !!dossier.identiteEnregistree,
      raisonBlocage: !dossier.identiteEnregistree
        ? 'Enregistrez d’abord votre identité, dans le bloc « Vous » (nom, prénom et un moyen de contact).'
        : null,
      onAfficher: function () {
        wireBlocERIP(CONFIG_BLOC_VOUS, function () { afficherEtape(8); });
        wireBlocERIP(CONFIG_BLOC_PARCOURS, function () { afficherEtape(8); });
        wireBlocERIP(CONFIG_BLOC_EXPERIENCES_PERSO, function () { afficherEtape(8); });
        wireBlocERIP(CONFIG_BLOC_COMPLEMENTS, function () { afficherEtape(8); });
        // TACHE : équivalent Découverte de "Tout déplier/replier"
        // (pageProjet(), js/app.js) -- attribut data- propre, jamais
        // partagé avec la vraie page "Vos informations".
        document.querySelectorAll('[data-blocs-tout-decouverte]').forEach(function (b) {
          b.addEventListener('click', function () {
            var ouvrir = this.getAttribute('data-blocs-tout-decouverte') === 'ouvrir';
            ['vous', 'parcours', 'experiences-perso', 'complements'].forEach(function (id) {
              etatBlocsERIPOuverts[id] = ouvrir;
            });
            afficherEtape(8);
          });
        });
      },
      onContinuer: function () { afficherEtape(9); }
    };
  }

  // ------------------------------------------------------------
  // Étape 9 — Vos expériences (dernière occasion avant la rédaction IA)
  // ------------------------------------------------------------
  // TACHE (retour Denis, 2026-09-18, points 5 et 6 de sa liste de
  // corrections : "modifier une expérience doit rester dans la page,
  // jamais une fenêtre" + "ajouter une expérience fait doublon avec la
  // liste déjà affichée") : l'ancien rendu (cartes maison + bouton
  // "Ajouter" ouvrant une fenêtre qui réaffichait TOUTE la liste une 2e
  // fois) est remplacé par le bloc ERIP partagé CONFIG_BLOC_EXPERIENCES_PRO
  // (js/app.js), rendu EN PAGE (blocERIP/wireBlocERIP), jamais dans
  // ouvrirFenetreERIP -- exactement le meme composant que "Vos
  // informations", qui affiche deja liste + modifier + ajouter comme UN
  // SEUL bloc, jamais deux vues dupliquees du meme contenu. Aucune
  // dependance a dossier.modeCreation (verifie), donc rien a adapter pour
  // Decouverte.
  function etapeVosExperiences() {
    // TACHE (retour Denis, 2026-09-19, point 4) : ouvre le bloc une seule
    // fois, a la premiere arrivee sur cette etape (voir _decouverteExperiencesBlocAmorce
    // plus haut) -- un re-rendu ulterieur (ajout/suppression d'une
    // experience) ne force plus rien, la personne garde la main pour le
    // refermer elle-meme ensuite.
    if (!_decouverteExperiencesBlocAmorce) {
      etatBlocsERIPOuverts['experiences-pro'] = true;
      _decouverteExperiencesBlocAmorce = true;
    }
    return {
      titre: '📝 Vos expériences',
      // TACHE (retour Denis, 2026-09-19, point 4, suite : "le bouton Ajouter
      // une expérience, je veux qu'il soit plus grand, en dessous des
      // experiences deja reconnues, ou au milieu du rectangle") : la
      // position (sous la liste) est deja celle de contenuExperiencesProInline()
      // (js/app.js), inchangee -- jamais touchee ici, ce composant est
      // partage avec "Vos informations". Seule la TAILLE/centrage change,
      // via ce wrapper CSS scope (.decouverte-experiences-mise-en-avant,
      // voir style.css) qui cible le bouton par son id existant
      // (#btnExpProOuvrir) -- jamais de fork du composant partage, "Vos
      // informations" garde son bouton standard.
      contenuHTML:
        '<p class="text-muted small mb-3">Dernière occasion de vérifier ou compléter vos expériences avant de passer à la rédaction de votre CV. Ajoutez ce qui manque, corrigez ce qui ne va pas : rien n’est figé.</p>' +
        '<div class="decouverte-experiences-mise-en-avant">' + blocERIP(CONFIG_BLOC_EXPERIENCES_PRO) + '</div>',
      peutContinuer: true,
      onAfficher: function () {
        wireBlocERIP(CONFIG_BLOC_EXPERIENCES_PRO, function () { afficherEtape(9); });
      },
      onContinuer: function () { afficherEtape(10); }
    };
  }

  // ------------------------------------------------------------
  // Étape 10 — Réglez le style d'écriture (rédaction du CV)
  // ------------------------------------------------------------
  // TACHE (retour Denis, 2026-09-18, point 7 de sa liste de corrections :
  // "avant le 2e passage IA, il manque l'écran style d'écriture") :
  // reutilise TEL QUEL le composant partage contenuRectangleStyleCV/
  // wireRectangleStyleCV/appliquerDefautsStyleCV (js/app.js), deja utilise
  // par "Creer un nouveau CV" (pageAssistant) et "Vos documents"
  // (pageResultats) sous le nom "Reglez le style d'ecriture" -- jamais un
  // nouvel ecran maison. masquerBoutonValider=true : pas de bouton
  // "Ces reglages me conviennent" propre au composant (pense pour un
  // accordeon a tiroirs), le bouton "Continuer" du bas de page de CETTE
  // etape suffit, comme pour n'importe quelle autre etape du parcours.
  // situationObligatoire=false : "Votre situation en ce moment" reste
  // facultative ici, comme partout ailleurs (jamais une regle differente
  // pour Decouverte).
  function etapeStyleEcritureCV() {
    appliquerDefautsStyleCV('cv');
    return {
      titre: '🎨 Réglez le style d’écriture',
      contenuHTML:
        _decouverteBandeau('<strong>Dernier réglage avant l’écriture.</strong> Ces choix orientent l’assistant qui va rédiger votre accroche et reformuler vos expériences : gardez les valeurs proposées, ou ajustez-les.') +
        contenuRectangleStyleCV('cv', true, false),
      peutContinuer: true,
      onAfficher: function () {
        wireRectangleStyleCV('cv', function () { afficherEtape(10); });
      },
      onContinuer: function () { afficherEtape(11); }
    };
  }

  // ------------------------------------------------------------
  // Étape 11 — Choisissez votre assistant (rédaction du CV)
  // ------------------------------------------------------------
  // TACHE (chantier "2e passage IA obligatoire pour Decouvrir mes
  // competences", sous-etape 4/8) : 2e et dernier passage assistant du
  // parcours -- reutilise TEL QUEL le pipeline deja ecrit pour "Creer un
  // nouveau CV" (js/app.js : contenuRectangleChoixIA/wireRectangleChoixIA,
  // contenuAccordeonImportIA/wireImportIA, ouvrirRelectureIACV,
  // creerBrouillonChoixIACV, appliquerBrouillonChoixIACV -- jamais
  // recomposes avec du HTML maison). Pontage obligatoire avant tout appel
  // (voir plan, section 1.2) : etatAccordeon/etatAccordeonValide pointes
  // sur le tiroir 'cv' -- sans ca, echec SILENCIEUX (pas de plantage,
  // juste un bouton qui ne repond pas). docActifActuel() resout 'cv' des
  // lors que dossier.dernierDocumentPrepare est vide et
  // dossier.modeCreation !== 'pret' -- toujours vrai pour Decouverte,
  // qui ne renseigne jamais ces 2 champs (verifie par grep).
  function etapeChoisirAssistantCV() {
    etatAccordeon = accordeonPourType('cv');
    etatAccordeonValide = accordeonValidePourType('cv');
    return {
      titre: '💬 Choisissez votre assistant',
      contenuHTML:
        _decouverteBandeau('<strong>Vos expériences et vos compétences sont prêtes.</strong> Voici le 2ᵉ et dernier échange avec un assistant en ligne : il va rédiger votre accroche et reformuler vos expériences pour votre CV.') +
        contenuRectangleChoixIA('cv'),
      masquerContinuer: true,
      onAfficher: function () {
        etatAccordeon = accordeonPourType('cv');
        etatAccordeonValide = accordeonValidePourType('cv');
        // TACHE : la cle de prompt 'decouverteRedaction' (prompts/decouverte-redaction.md)
        // remplace 'cv' (prompts/cv.md) -- seules les INSTRUCTIONS envoyees
        // changent, le PROFIL (texteProfilEffectif('cv')) reste construit
        // exactement comme pour "Creer un nouveau CV". Apres choix de
        // l'assistant, navigue vers l'etape 12 (au lieu du simple
        // re-rendu de cette meme etape, comportement par defaut de
        // wireChoixAssistantIA pour pageResultats()).
        wireRectangleChoixIA('cv', function () { afficherEtape(12); }, 'decouverteRedaction');
      }
    };
  }

  // ------------------------------------------------------------
  // Étape 12 — Collez la réponse (rédaction du CV)
  // ------------------------------------------------------------
  function etapeCollerReponseCV() {
    etatAccordeon = accordeonPourType('cv');
    etatAccordeonValide = accordeonValidePourType('cv');
    return {
      titre: '📥 Collez la réponse de l’assistant',
      contenuHTML: contenuAccordeonImportIA('cv'),
      masquerContinuer: true,
      onAfficher: function () {
        etatAccordeon = accordeonPourType('cv');
        etatAccordeonValide = accordeonValidePourType('cv');
        // TACHE : un seul rerender pour TOUS les points de re-rendu internes
        // a wireImportIA (decompte, bloque/ouvert/revenu, import rate...) --
        // reste sur cette meme etape 12 dans tous ces cas. Seule
        // l'ouverture reussie de l'ecran de relecture (ouvrirRelectureIACV
        // appelee en interne par wireImportIA, avec enPage=true car
        // idEtapeApres === 'relecture-ia') pose etatAccordeon['relecture-ia']
        // a true AVANT d'appeler ce rerender -- c'est ce drapeau qui
        // distingue "rester sur l'import" de "avancer vers la relecture",
        // exactement comme pageResultats() le fait avec ses 2 rectangles
        // (panneauEtapeAction), jamais un mecanisme different.
        wireImportIA('cv', function () {
          afficherEtape(etatAccordeon['relecture-ia'] ? 13 : 12);
        }, 'relecture-ia');
      }
    };
  }

  // ------------------------------------------------------------
  // Étape 13 — Choisir ce qui ira sur votre CV (relecture)
  // ------------------------------------------------------------
  function etapeRelectureCV() {
    return {
      titre: '📋 Choisir ce qui ira sur votre CV',
      contenuHTML: contenuRectangleRelectureIA(),
      masquerContinuer: true,
      onAfficher: function () {
        // TACHE : _onValiderRelectureIACV a deja ete pose par
        // wireImportIA (etape 12), avec un onValider "generique" (celui
        // de pageResultats -- avancerEtape + rerender). Reecrase ici par
        // notre propre finalisation : appliquer le brouillon PUIS terminer
        // reellement le parcours Decouverte -- jamais rester sur cette
        // meme etape apres validation (comportement par defaut pour
        // pageResultats, qui reste sur "Vos documents"). Reassignation
        // directe du global plutot qu'un nouvel appel a ouvrirRelectureIACV
        // (qui re-appelerait avancerEtape + rerender inutilement, et
        // risquerait une recursion si rerender rappelle afficherEtape(13)
        // depuis l'interieur de son propre onAfficher).
        // TACHE (retour Denis, bug reel confirme le 2026-09-18 : "j'ai
        // choisi l'accroche, mais aucune n'apparait sur le CV") : ce bloc
        // ECRASAIT _onValiderRelectureIACV au lieu de l'ENVELOPPER.
        // appliquerBrouillonChoixIACV(brouillonValide) est une fonction
        // PURE -- elle CALCULE et RENVOIE les valeurs finales, elle
        // n'ecrit jamais dans dossier elle-meme (verifie dans son code,
        // js/app.js). C'est l'appelant (ici, le _onValiderRelectureIACV
        // deja pose par wireImportIA a l'import reussi, etape 12 --
        // dossier.titreCV/dossier.ia.cv.*, signatureExpPersoAnalyse,
        // trackEvenement, declencherOptimisationAutomatiqueXXLSiPossible)
        // qui fait reellement ce travail. En le remplacant au lieu de le
        // garder, plus rien n'etait jamais ecrit dans dossier.ia.cv --
        // d'ou l'accroche choisie absente du CV final. Corrige : on
        // capture ce handler DEJA EN PLACE, on le laisse s'executer
        // integralement (il retombe sur ce meme fichier plus haut,
        // wireImportIA), puis on enchaine sur terminerParcoursDecouverte().
        // Son propre rerender interne (afficherEtape(13) via etatAccordeon
        // ['relecture-ia']) redessine une derniere fois cette etape avant
        // que terminerParcoursDecouverte() ne navigue -- invisible pour la
        // personne (tout se joue en synchrone avant le prochain repaint).
        var onValiderDejaPose = _onValiderRelectureIACV;
        _onValiderRelectureIACV = function (brouillonValide) {
          if (typeof onValiderDejaPose === 'function') { onValiderDejaPose(brouillonValide); }
          terminerParcoursDecouverte();
        };
        // TACHE (bug trouve pendant le test navigateur de cette meme
        // sous-etape) : wireRectangleRelectureIA() appelle TOUJOURS son
        // parametre rerender juste apres _onValiderRelectureIACV -- avec
        // afficherEtape(12), ce rerender ecrasait la page "Mon CV" deja
        // affichee par terminerParcoursDecouverte() (naviguerVers('resultats')
        // rend #app de facon synchrone), en redessinant l'ecran de
        // relecture par-dessus juste apres. Aucune autre situation
        // n'appelle ce rerender (verifie : seul le clic sur "Je valide ces
        // choix" le declenche) -- no-op volontaire, la navigation est
        // entierement geree par terminerParcoursDecouverte() ci-dessus.
        wireRectangleRelectureIA(function () {});
      }
    };
  }

  // ------------------------------------------------------------
  // TACHE (retour utilisateur : "je vais l'enlever [l'écran 'Votre
  // stratégie'] parce qu'elle est déjà présente lorsque je fais mon CV...
  // je n'ai pas besoin de cette fenêtre") : l'ancienne étape 8
  // ("Votre stratégie", titre, pistes de métier, choix chronologique/
  // mixte/par compétences) ne s'affiche plus jamais -- seul son calcul
  // de fond est conservé (calculerStrategieSiBesoin ci-dessous, appelé
  // depuis l'étape 7 désormais), sa navigation/finalisation aussi
  // (finaliserMappingDossier / terminerParcoursDecouverte). Les pistes de métier qu'elle
  // affichait (repliées, cachées par défaut) ne sont plus montrées nulle
  // part -- décision explicite, la personne est là pour se valoriser,
  // pas pour chercher un métier à ce stade du parcours.
  // ------------------------------------------------------------
  function calculerStrategieSiBesoin() {
    if (etat.strategie) { return; }
    var competencesValidees = [];
    etat.etatsFragments.forEach(function (ef) { competencesValidees = competencesValidees.concat(ef.competencesValidees || []); });
    var nbPro = etat.etatsFragments.filter(function (ef) { return ef.origine === 'proDeclaree' || ef.origine === 'proNonDeclaree'; }).length;
    var nbPerso = etat.etatsFragments.length - nbPro;
    var resultatStrategie = executerStrategie(competencesValidees, {
      nombreExperiencesProfessionnelles: nbPro,
      nombreExperiencesPersonnelles: nbPerso,
      objectifReconversion: dossier.objectif === 'reconversion'
    });
    // TACHE (gestion centralisée des erreurs) : un échec ici ne bloque
    // jamais le parcours -- la stratégie est un complément utile, pas
    // une condition pour produire un CV (doc1 §10.5 : son absence ne
    // devrait pas empêcher un document par ailleurs valorisable).
    etat.strategie = resultatStrategie.succes
      ? resultatStrategie.valeurs
      : { metiersProposes: [], aucunMetierPertinent: true, typeCVRecommande: { type: DECOUVERTE_TYPES_CV.PAR_COMPETENCES, regle: 'repli-erreur-strategie' } };
    etat.typeCVChoisi = etat.strategie.typeCVRecommande.type;
  }

  // TACHE (chantier "2e passage IA obligatoire pour Decouvrir mes
  // competences", sous-etape 2/8) : ex-finaliserEtNaviguerVersResultats(),
  // scindee en deux -- cette moitie ne fait QUE le mapping fragments ->
  // dossier (experiences/competences/identite/recit/questions ciblees),
  // jamais la navigation. Necessaire pour inserer de nouvelles etapes
  // (experiences, redaction IA) ENTRE le mapping et l'arrivee sur
  // pageResultats() : texteProfil('cv'), lu par le nouveau passage
  // assistant, a besoin que ce mapping ait deja eu lieu (dossier.experiences/
  // formations/etc. deja peuples). Renvoie false si le mapping echoue
  // (erreur affichee a l'ecran) -- l'appelant ne doit alors jamais
  // enchainer sur terminerParcoursDecouverte().
  function finaliserMappingDossier() {
    // TACHE (retour utilisateur : "Retour" doit pouvoir rouvrir cette
    // fenetre puis "Continuer" a nouveau, ex. apres avoir ajoute une
    // formation) : ce bloc (mapping des fragments -> experiences/
    // competences, identite, recit, reponses aux questions ciblees) ne
    // doit jamais s'executer 2 fois -- appliquerMisesAJourDossier()
    // (decouverteMapping.js) CONCATENE dossier.experiences sans aucune
    // deduplication ; un 2e passage dupliquerait purement et simplement
    // chaque experience du CV. Protege par un drapeau pose une seule fois
    // ci-dessous -- les rubriques de l'etape 8 (formation/engagement/
    // savoir-faire), elles, restent volontairement REJOUABLES a chaque
    // "Continuer" (voir plus bas, hors de ce bloc) : ajouter une 2e
    // formation apres un "Retour" doit rester possible.
    if (!etat.decouverteDejaAppliquee) {
    var fragmentsValides = etat.etatsFragments.filter(fragmentEstValide);

    // TACHE (chantier "exp perso", Phase 3 : construire réellement
    // infosComplementairesParFragment, plus jamais {} en dur) : pour
    // chaque question de type "date" avec une réponse renseignée
    // (Phase 2), retrouve le fragment concerné via fragmentIndex ->
    // indexOriginal (transporté depuis decouverteAnalyse.js par
    // initialiserEtatFragment(), voir decouverteRaffinement.js), puis
    // utilise SON fragmentId réel comme clé -- exactement la forme
    // attendue par mapperFragmentsVersDossier() (decouverteMapping.js).
    // Si le fragment référencé n'a en fait jamais été validé par la
    // personne (jamais retenu dans fragmentsValides), l'information est
    // silencieusement ignorée -- rien à raccrocher à un fragment qui
    // n'existe plus dans le résultat final, jamais une exception.
    var infosComplementairesParFragment = {};
    etat.questionsCiblees.forEach(function (question, i) {
      if (question.type !== 'date' || question.fragmentIndex === null) { return; }
      var reponseDate = etat.reponsesQuestionsCiblees[i];
      if (!reponseDate || typeof reponseDate !== 'object' || (!reponseDate.dateDebut && !reponseDate.dateFin)) { return; }
      var fragmentCorrespondant = fragmentsValides.filter(function (ef) { return ef.indexOriginal === question.fragmentIndex; })[0];
      if (!fragmentCorrespondant) { return; }
      infosComplementairesParFragment[fragmentCorrespondant.fragmentId] = {
        dateDebut: reponseDate.dateDebut || '',
        dateFin: reponseDate.dateFin || ''
      };
    });

    // TACHE (defensive, trouve en corrigeant le bug critique 2026-09-19) :
    // ce conteneur d'erreur ne vit QUE dans le contenuHTML de "Quelques
    // precisions" (etapeQuestionsCiblees(), qc), absent quand il n'y a
    // aucune question ciblee (qc === null, etapeCompetences()) -- un
    // getElementById(...).innerHTML direct plantait alors silencieusement
    // (exception JS) au lieu d'afficher le message d'erreur, sur ce cas
    // deja rare (echec de mapping).
    var zoneErreurMapping = document.getElementById('messageErreurGenerationDecouverte');
    var resultatMapping = executerMapping(fragmentsValides, infosComplementairesParFragment);
    if (!resultatMapping.succes) {
      if (zoneErreurMapping) {
        zoneErreurMapping.innerHTML = '<span style="color:var(--danger);">⚠️ ' + resultatMapping.erreur + '</span>';
      }
      return false;
    }
    var resultatApplication = executerApplicationDossier(dossier, resultatMapping.valeurs.misesAJour);
    if (!resultatApplication.succes) {
      if (zoneErreurMapping) {
        zoneErreurMapping.innerHTML = '<span style="color:var(--danger);">⚠️ ' + resultatApplication.erreur + '</span>';
      }
      return false;
    }
    // TACHE (retour Denis, 2026-09-19, point 6) : seule la civilite reste
    // saisie a "Preparer" (etat.identite) -- nom/prenom/telephone/email/
    // ville/codePostal se renseignent desormais sur "Vos informations"
    // (CONFIG_BLOC_VOUS, ecrit directement dans dossier.identite a chaque
    // interaction, jamais via etat.identite) -- plus rien d'autre a copier
    // ici.
    dossier.identite = dossier.identite || {};
    if (etat.identite.civilite) { dossier.identite.civilite = etat.identite.civilite; }
    // TACHE (retour utilisateur : "les réponses à ces questions vont
    // dans l’assistant par la suite ?") : jusqu'ici perdues silencieusement
    // une fois l'étape passée -- transmises désormais via
    // dossier.informationsNonClassees, déjà lu par texteProfil() et
    // donc déjà transmis à l’assistant pour le CV/la lettre/l'entretien,
    // sans avoir besoin d'un nouveau mécanisme.
    dossier.informationsNonClassees = dossier.informationsNonClassees || [];
    // TACHE (chantier "exp perso", Phase 1) : question est désormais un
    // objet {texte, fragmentIndex, type} -- question.texte remplace la
    // concaténation directe (qui aurait produit "[object Object]").
    // TACHE (chantier "exp perso", Phase 3) : une réponse de type "date"
    // a désormais sa vraie place structurée (infosComplementairesParFragment,
    // ci-dessus) -- ne rejoint plus informationsNonClassees.
    // TACHE (retour utilisateur : "j'ai répondu oui à la question
    // formation/engagements... mais ces informations ne remontent pas,
    // rien n'apparaît sur le CV") : bug réel trouvé -- une réponse
    // "oui, formation de 4-5 jours" ne rejoignait QUE le contexte pour
    // l’assistant (informationsNonClassees), jamais dossier.formations lui-même
    // -- la rubrique Formation restait donc vide même après une réponse
    // positive. Même chose pour "je suis investi dans une association" :
    // jamais ajouté à dossier.engagements. Corrigé ici : les réponses de
    // type "formation"/"engagement" sont désormais ajoutées TELLES
    // QUELLES (les mots de la personne, jamais reformulés ni interprétés
    // -- même principe que pour les dates, aucune invention) dans le
    // bon champ structuré, et ne rejoignent donc plus
    // informationsNonClassees (déjà leur vraie place, inutile de
    // dupliquer -- même raisonnement que pour les dates ci-dessus).
    // Seules les réponses de type "texte" (questions plus générales)
    // continuent d'alimenter ce canal, comme avant.
    // TACHE (retour utilisateur : "pour la formation... indiquer
    // l'année, même format que les questions sur la durée du métier --
    // pareil pour l'associatif/bénévole") : la réponse à ces 2 types
    // est désormais un objet {texte, dateDebut, dateFin} (voir
    // etapeQuestionsCiblees ci-dessus), plus une simple chaîne. Pour
    // Formation, dont le schéma (dossier.formations) ne porte qu'un seul
    // champ "annee" (jamais une plage dateDebut/dateFin -- changer ce
    // schéma toucherait bien trop d'endroits, même risque que
    // Certifications/Loisirs) : la période est formatée en une chaîne
    // ("2019 - 2021" ou juste "2021") stockée directement dans ce champ
    // existant, sans avoir besoin d'étendre son schéma. Pour Engagement,
    // dont le schéma supporte déjà dateDebut/dateFin (chantier "exp
    // perso", Phase 4), les deux valeurs sont utilisées telles quelles.
    etat.questionsCiblees.forEach(function (question, i) {
      if (question.type === 'date') { return; }
      var reponseBrute = etat.reponsesQuestionsCiblees[i];
      if (question.type === 'formation') {
        var texteFormation = ((reponseBrute && reponseBrute.texte) || '').trim();
        if (!texteFormation) { return; }
        var anneeFormation = reponseBrute.dateDebut
          ? (reponseBrute.dateDebut + (reponseBrute.dateFin ? ' - ' + reponseBrute.dateFin : ''))
          : (reponseBrute.dateFin || '');
        dossier.formations = dossier.formations || [];
        // TACHE (retour utilisateur : "aucune trace dans le CV" -- bug
        // réel trouvé : normaliserDonneesCV.js filtre TOUTE la ligne
        // Formation dès que niveau === "Sans diplôme", même quand
        // l'intitulé contient une vraie information. Cette règle
        // préexistante avait du sens pour une réponse "Sans diplôme"
        // vide de contenu (un simple constat), mais pas ici : la
        // personne peut très bien avoir suivi une formation courte tout
        // en n'ayant "pas de diplôme" à proprement parler -- l'intitulé
        // reste précieux, jamais à perdre pour cette seule raison.
        // "Sans diplôme" n'est donc jamais transmis comme niveau pour
        // cette question précise (repli sur chaîne vide) -- l'intitulé
        // survit toujours, quel que soit le niveau choisi ou non choisi.
        var niveauFormationQ = (reponseBrute.niveau && reponseBrute.niveau !== 'Sans diplôme') ? reponseBrute.niveau : '';
        dossier.formations.push({ niveau: niveauFormationQ, intitule: texteFormation, annee: anneeFormation, missions: '' });
        return;
      }
      if (question.type === 'engagement') {
        var texteEngagementQ = ((reponseBrute && reponseBrute.texte) || '').trim();
        if (!texteEngagementQ) { return; }
        dossier.engagements = dossier.engagements || [];
        dossier.engagements.push({
          texte: texteEngagementQ,
          dateDebut: (reponseBrute && reponseBrute.dateDebut) || '',
          dateFin: (reponseBrute && reponseBrute.dateFin) || '',
          missions: ''
        });
        return;
      }
      var reponse = (typeof reponseBrute === 'string' ? reponseBrute : '').trim();
      if (!reponse) { return; }
      dossier.informationsNonClassees.push(question.texte + ' - Réponse : ' + reponse);
    });
    // TACHE (retour utilisateur : "je suis sûr qu'il y a plus de
    // contenu et des informations utiles que notre JSON... si on
    // prend directement le texte, comment l'intégrer de façon
    // cohérente ?") : le récit complet est conservé ici, EN PLUS de
    // l'extraction structurée -- jamais à sa place. La structure
    // (expériences/compétences/loisirs) reste la seule à savoir OÙ
    // ranger chaque information dans le CV, de façon fiable et
    // traçable ; le récit brut, lui, apporte la nuance qu'aucune
    // structure ne peut capturer, disponible pour l’assistant au moment de
    // rédiger le CV/la lettre/l'entretien (déjà le même canal
    // vérifié pour les réponses aux questions ciblées ci-dessus).
    // TACHE (retour utilisateur : "ce message ne passe pas sur tous les
    // IA" -- bug réel et sérieux trouvé : etat.recit (le texte ORIGINAL
    // de la personne, jamais filtré) partait ici mot pour mot, avec tout
    // contexte personnel sensible potentiellement présent (détention,
    // maladie...) -- alors que ce même contexte est déjà correctement
    // retiré côté fragments individuels (decouverte-competences.md).
    // Utilise désormais etat.reciteNettoye (même contenu utile, contexte
    // sensible retiré par l’assistant sur l'ENSEMBLE du récit, pas seulement
    // fragment par fragment) -- jamais etat.recit original. Si
    // reciteNettoye est vide (réponse de l’assistant antérieure à ce chantier, ou
    // champ manquant), on ne transmet RIEN plutôt que de retomber sur le
    // texte brut non filtré : mieux vaut perdre la nuance que risquer de
    // relaisser passer un contexte personnel sensible.
    if (etat.reciteNettoye && etat.reciteNettoye.trim()) {
      dossier.informationsNonClassees.push('Récit complet raconté par la personne, pour context et nuances au-delà des éléments déjà extraits ci-dessus : ' + etat.reciteNettoye.trim());
    }
    dossier.typeCVRecommandeDecouverte = etat.typeCVChoisi;
    // TACHE (retour utilisateur : "le parcours Decouverte n'a aucun suivi
    // Umami") : a l'interieur de ce meme garde-fou (jamais 2 fois) --
    // ne compte donc qu'une VRAIE finalisation, jamais un retour ulterieur
    // sur cet ecran (deja filtre par etat.decouverteDejaAppliquee).
    if (typeof trackEvenement === 'function') { trackEvenement('decouverte_terminee'); }
    etat.decouverteDejaAppliquee = true;
    } // fin du if (!etat.decouverteDejaAppliquee)
    return true;
  }

  // TACHE (chantier "2e passage IA obligatoire pour Decouvrir mes
  // competences", sous-etape 2/8) : ex-finaliserEtNaviguerVersResultats(),
  // seconde moitie -- uniquement la navigation finale (jamais le mapping,
  // voir finaliserMappingDossier() juste au-dessus). Appelee seulement
  // apres le mapping (directement pour l'instant, apres validation du
  // brouillon de redaction IA une fois les nouvelles etapes branchees).
  function terminerParcoursDecouverte() {
    // TACHE (retour utilisateur : "Retour" doit rouvrir cette fenetre,
    // pas 'Mon projet' ni 'Faire le point') : masquee, jamais detruite --
    // voir masquerDecouverteCompetences()/reafficherDecouverteCompetences()
    // plus haut dans ce fichier.
    masquerDecouverteCompetences();
    window._decouverteVersResultats = true;
    // TACHE (retour Denis, 2026-08-31, Chantier 2+3) : fait PERSISTANT "ce CV
    // vient du parcours Decouverte, qui est alle jusqu'au bout". Contrairement
    // a window._decouverteVersResultats (transitoire, perdu au moindre
    // aller-retour par l'accueil), ce drapeau survit -> la page Action
    // adaptee ("Creer mon CV", barre du module) s'affiche sur TOUS les
    // chemins d'entree, et la page d'intro peut proposer un vrai "Voir mon
    // CV". Remis a false par fermerDecouverteCompetences() (recommencer) et
    // par le demarrage d'une creation de CV "normale" (voir data/metiers.js).
    dossier.decouverteTerminee = true;
    naviguerVers('resultats');
  }

  // TACHE (retour Denis, 2026-08-31 -- "c'est MOCHE, reduis le nombre
  // d'ecrans") : fusion des ecrans 1+2+3 en UNE page "Preparer". Le
  // contenu et le cablage de chaque section sont ceux des fonctions
  // d'origine (etapeRecit / etapeIdentite / etapeAccueil), non reecrits.
  // TACHE (retour Denis, 2026-09-19, point 6 de sa 2e liste de
  // corrections) : DEUX sections desormais, plus trois -- "Vos
  // coordonnees" disparait en tant que section a part (nom/prenom/contact/
  // adresse se renseignent maintenant sur la nouvelle etape "Vos
  // informations", voir etapeVosInformationsDecouverte()). Seule la
  // civilite (etapeIdentite(), reduite a cette unique question) reste ici,
  // rattachee a la section 1 avec le recit : necessaire des le 1er passage
  // IA pour accorder le texte au bon genre, elle ne peut pas attendre.
  function etapePreparer() {
    var rec = etapeRecit();
    var idn = etapeIdentite();
    var acc = etapeAccueil();
    function section(num, titre, corpsHTML, sousTitre) {
      return '<div class="cv-section" style="margin-bottom:1rem;">' +
        '<h4 style="display:flex;align-items:center;gap:0.55rem;flex-wrap:wrap;margin-bottom:0.6rem;">' +
        '<span style="display:inline-flex;align-items:center;justify-content:center;width:1.7rem;height:1.7rem;' +
        'border-radius:50%;background:var(--accent);color:#fff;font-size:0.9rem;flex-shrink:0;">' + num + '</span>' +
        '<span>' + titre + '</span>' +
        (sousTitre ? '<span class="text-muted" style="font-size:0.8rem;font-weight:500;">· ' + sousTitre + '</span>' : '') +
        '</h4>' +
        corpsHTML + '</div>';
    }
    var recOK = rec.peutContinuer;

    // --- Section 1, enrichie : cadrage rassurant + exemples concrets +
    // civilite (point 6, 2026-09-19) ---
    var recitEnrichi =
      '<p class="mb-2">C’est le cœur de tout. Racontez, avec vos mots, ce que vous avez fait dans votre vie - au travail comme en dehors. Vous n’avez rien à préparer, rien à « bien » écrire.</p>' +
      '<div style="background:var(--bg-subtle);border-radius:8px;padding:0.6rem 0.85rem;margin:0.5rem 0;font-size:0.9rem;">' +
      '<strong>Des idées de choses à raconter :</strong>' +
      '<ul style="margin:0.35rem 0 0;padding-left:1.15rem;">' +
      '<li>un métier que vous avez exercé, même il y a longtemps, même quelques mois</li>' +
      '<li>l’aide que vous avez apportée à un proche : garde d’enfants, soins, démarches, courses</li>' +
      '<li>du bénévolat, une association, un club, une équipe</li>' +
      '<li>ce que vous savez faire de vos mains : bricolage, mécanique, jardinage, cuisine, couture</li>' +
      '<li>un sport, une passion suivie sérieusement</li>' +
      '<li>une responsabilité familiale : gérer un budget, organiser un déménagement, s’occuper de tout à la maison</li>' +
      '</ul></div>' +
      _decouverteEncart('&#128161;', '<strong>Écrivez comme vous le raconteriez à quelqu’un.</strong> Vous pouvez aussi dicter à la voix : appuyez en même temps sur <strong><span style="white-space:nowrap;">Windows + H</span></strong>.') +
      rec.contenuHTML +
      _decouverteEncart('&#128075;', 'Plus vous en dites, plus les propositions seront justes. Mais rien n’est figé : vous pourrez toujours revenir en ajouter.', 'ok') +
      '<div class="mt-3 pt-2" style="border-top:1px solid var(--border);">' +
      _decouverteEncart('&#128274;', 'Votre civilité n’est utilisée que pour accorder le texte rédigé par l’assistant au féminin ou au masculin, jamais transmise ni affichée ailleurs.') +
      idn.contenuHTML +
      '</div>';

    // --- Section 2, enrichie : dire pourquoi, et que c'est vraiment ok de passer ---
    var viseeEnrichi =
      '<p class="mb-2">Si vous avez un métier ou un secteur en tête, indiquez-le : votre CV emploiera alors le bon vocabulaire, et pourra être aligné sur une offre précise.</p>' +
      _decouverteEncart('&#128077;', '<strong>Vous ne savez pas encore quoi viser ?</strong> C’est très fréquent, et ce n’est pas un problème. Laissez cette partie de côté : l’assistant restera général, vous préciserez plus tard.', 'ok') +
      acc.contenuHTML;

    return {
      titre: '📝 Préparer',
      sansCarte: true,
      contenuHTML:
        _decouverteBandeau('<strong>Vous n’avez pas besoin d’un CV pour commencer, ni d’un parcours ordinaire.</strong> Le travail salarié, l’aide à des proches, le bénévolat, une passion suivie longtemps : tout cela contient des compétences. On part de ce que vous racontez, et on le met en forme avec vous.') +
        '<p class="text-muted small mb-3">Tout est sur cette page. Le récit est la seule partie indispensable ; le reste peut rester vide.</p>' +
        section(1, 'Votre parcours', recitEnrichi, 'indispensable') +
        section(2, 'Ce que vous visez', viseeEnrichi, 'facultatif'),
      peutContinuer: recOK,
      raisonBlocage: !recOK ? 'Racontez d’abord votre parcours (partie 1).' : null,
      libelleContinuer: 'Choisir mon assistant →',
      onAfficher: function () {
        rec.onAfficher();
        idn.onAfficher();
        acc.onAfficher();
        // Recalcul combine du bouton "Continuer" (les sous-cablages ne
        // testent chacun que leur propre partie).
        function majContinuer() {
          var b = document.getElementById('btnContinuerDecouverte');
          if (b) { b.disabled = !etat.recit.trim().length; }
        }
        var champRecit = document.getElementById('decouverteRecitTexte');
        if (champRecit) { champRecit.addEventListener('input', majContinuer); }
        majContinuer();
      },
      onContinuer: function () {
        if (typeof acc.sauvegarder === 'function') { acc.sauvegarder(); }
        afficherEtape(4);
      }
    };
  }

  // Fusion des ecrans 6 + 7 : la validation par experience + (quand il y
  // en a) les "Quelques precisions" sur le meme ecran. Plus d'ecran
  // separe quand il n'y a aucune question.
  function etapeCompetences() {
    var dec = etapeDecouverte();
    var qc = (etat.questionsCiblees && etat.questionsCiblees.length) ? etapeQuestionsCiblees() : null;
    var nbExp = (etat.etatsFragments && etat.etatsFragments.length) || 0;
    var bandeau = _decouverteBandeau(
      '<strong>Voici ce que votre récit révèle.</strong> ' +
      (nbExp > 1
        ? 'À partir de vos ' + nbExp + ' expériences, l’assistant a repéré des compétences concrètes. '
        : 'À partir de ce que vous avez raconté, l’assistant a repéré des compétences concrètes. ') +
      'Vous ne partiez pas de rien : regardez tout ce qui ressort.'
    );
    var encartChoix = _decouverteEncart('&#128071;',
      'Pour chaque expérience, gardez la formulation qui vous ressemble le plus. Vous restez maître du mot juste : si aucune ne va, demandez-en d’autres.');
    return {
      titre: dec.titre,
      sansCarte: !!qc,
      contenuHTML: bandeau +
        (qc ? '<div class="cv-section">' + encartChoix + dec.contenuHTML + '</div>' : encartChoix + dec.contenuHTML) +
        (qc
          ? '<div class="cv-section" style="margin-top:1rem;"><h4>&#10067; Quelques précisions</h4>' +
            '<p class="text-muted small">Facultatif - cela aide à mieux orienter votre profil.</p>' +
            qc.contenuHTML + '</div>'
          : ''),
      peutContinuer: dec.peutContinuer,
      libelleContinuer: 'Continuer →',
      onAfficher: function () {
        dec.onAfficher();
        if (qc) { qc.onAfficher(); }
      },
      // TACHE (retour Denis, 2026-09-19, bug critique confirme : "les
      // experiences identifiees n'apparaissent ni sur Vos experiences ni
      // sur le CV final") : calculerStrategieSiBesoin() + finaliserMappingDossier()
      // (mapping fragments -> dossier.experiences/competences/identite/
      // informationsNonClassees) vivaient DANS l'ancien onContinuer de
      // l'etape 8 ("Completer mon CV"), retire lors du remplacement de
      // cette etape par "Vos informations" (point 6, chantier du meme
      // jour) -- l'appel a disparu avec, sans que rien d'autre ne le
      // reprenne : plus aucune experience n'atteignait jamais dossier.experiences.
      // Restaure ici, au meme point logique du parcours (fin de l'etape
      // Competences, juste avant Vos informations) -- jamais un 2e appel
      // ailleurs, finaliserMappingDossier() se protege deja elle-meme
      // contre une double execution (etat.decouverteDejaAppliquee).
      onContinuer: function () {
        calculerStrategieSiBesoin();
        if (finaliserMappingDossier()) { afficherEtape(8); }
      }
    };
  }

  function obtenirDefinitionEtape(numero) {
    // TACHE (6conv-5) : rendu au style unifie pendant tout le parcours
    // Decouverte -- les composants partages avec « Vos informations »
    // (contenuMobilite, contenuMissionsFormationBrouillon) et les jetons
    // propres a Decouverte (choixRadioVosInfos / .jeton) rendent la brique
    // commune. Remis a son etat precedent apres la construction du HTML
    // (le cablage des etapes ne consulte pas ce drapeau).
    var _precRIU = window._renduInfosUnifie;
    window._renduInfosUnifie = true;
    try {
      if (numero === 1) { return etapePreparer(); }
      if (numero === 4) { return etapeChoixAssistant(); }
      if (numero === 5) { return etapeCollerReponse(); }
      if (numero === 6) { return etapeCompetences(); }
      if (numero === 8) { return etapeVosInformationsDecouverte(); }
      if (numero === 9) { return etapeVosExperiences(); }
      if (numero === 10) { return etapeStyleEcritureCV(); }
      if (numero === 11) { return etapeChoisirAssistantCV(); }
      if (numero === 12) { return etapeCollerReponseCV(); }
      if (numero === 13) { return etapeRelectureCV(); }
      // 2, 3, 7 : ecrans fusionnes, plus jamais demandes seuls. Repli sur
      // la page "Preparer" par securite (jamais atteint en usage normal).
      if (numero === 2 || numero === 3) { return etapePreparer(); }
      if (numero === 7) { return etapeCompetences(); }
      return etapeVosInformationsDecouverte();
    } finally {
      window._renduInfosUnifie = _precRIU;
    }
  }

  // TACHE (retour Denis, 2026-08-31) : on n'affiche plus l'etape ici
  // (ce serait ecrit dans #app puis ecrase par le routeur). On expose
  // afficherEtape a la portee module et on navigue vers la route
  // 'decouverte' -- pageDecouverte() appelle alors _decouverteRenduEtape().
  _decouverteRenduEtape = afficherEtape;
  _decouverteNumeroCourant = etat.etapeCourante || 1;
  if (typeof naviguerVers === 'function') { naviguerVers('decouverte'); }
}

// TACHE (retour utilisateur : "je veux le tel/mail en jaune pour les
// trouver plus facilement", réutilisé tel quel depuis l'Étape 2 du wizard
// CV -- même comportement, même composant, homogénéité exigée).
function afficherDetectionCoordonneesDecouverte(texte) {
  var zone = document.getElementById('detectionCoordonneesDecouverte');
  if (!zone) { return; }
  var regexTelephone = /\b0[1-9](?:[\s.\-]?\d{2}){4}\b|\+33[\s.\-]?[1-9](?:[\s.\-]?\d{2}){4}/g;
  var regexEmail = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  var telephones = (texte.match(regexTelephone) || []).filter(function (t, i, arr) { return arr.indexOf(t) === i; });
  var emails = (texte.match(regexEmail) || []).filter(function (t, i, arr) { return arr.indexOf(t) === i; });
  var trouves = telephones.concat(emails);
  if (!trouves.length) { zone.innerHTML = ''; return; }
  zone.innerHTML = '<p class="small text-muted mb-1">Coordonnées détectées - pensez à les retirer si vous ne voulez pas les envoyer :</p>' +
    '<div class="d-flex flex-wrap gap-2">' +
    trouves.map(function (t) {
      return '<span style="background:var(--warning-bg-subtle);color:var(--warning-strong);border:1px solid var(--warning-border);border-radius:6px;padding:0.2rem 0.6rem;font-size:0.85rem;font-weight:600;">' +
        echapperAttribut(t) + '</span>';
    }).join('') + '</div>';
}
