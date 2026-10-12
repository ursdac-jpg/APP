/* ============================================================
   Module « Un CV, plusieurs métiers » : PAGE 3 « Mon CV de référence ».
   Un vrai CV complet, avec l'éditeur de CV de l'application ; les autres CV en découlent (même modèle, même corps, seuls le titre, l'accroche et
   l'aspect changent). Le CV de référence EST le dossier de l'application (le vrai) : rien n'est copié ici.

   Quatre vues, dans l'ordre :
     'choix'      3a : quel métier sert de référence (par défaut celui du CV) ; ce qui part vers l'assistant ;
     'structurer' le CV est rangé en rubriques, DANS LA PAGE (choix de l'assistant, collage, puis vue 'validation' : « Vérifiez les informations importées »), seulement si besoin ;
     'assistant'  3b et 3c : les composants communs de la page « Assistant » (choix de l'assistant, import de la réponse, choix de ce qui va sur le CV),
                  avec le prompt existant cv.md, NON MODIFIÉ ;
     'editeur'    3d : l'éditeur de CV de l'application (la page « Vos documents »), ouvert depuis ce module ; on y revient par « Ce CV me convient ».
   Réutilisé tel quel (jamais recopié) : rectangleAssistant, contenuRectangleChoixIA, contenuAccordeonImportIA, contenuRectangleRelectureIA,
   wireRectanglesAssistant, wireRectangleChoixIA, wireImportIA, wireRectangleRelectureIA, analyserReponseImport, genererEcranValidationImport, fusionnerDonnees (js/app.js).
   Écart assumé avec « module indépendant » : cette page passe par l'éditeur commun de CV (route 'resultats'), comme le Bilan le fait déjà.
   ============================================================ */

// ---------------- Navigateur : poser l'objectif du métier de référence dans le dossier de l'application ----------------
// Le prompt cv.md lit le dossier (texteProfil) : métier visé, démarche, fiche de la démarche. On y écrit seulement ce que le panneau d'objectif du module a
// recueilli, jamais de coordonnées. Ne change aucun autre parcours : chacun repose ses propres champs à son entrée.

function ucpmPoserObjectifDansDossier(etat, entree) {
  var o = ucpmNormaliserObjectif(entree.objectif);
  if (!o) { return; }
  var nom = ucpmNomMetier(entree, etat.sexe);
  var type = o.typeStructure === 'Autre' && o.typeStructureAutre ? o.typeStructureAutre : o.typeStructure;
  dossier.metierCible = nom;
  dossier.typeCV = 'specifique';
  dossier.objectif = o.demarche;
  if (typeof assurerDetailsObjectifs === 'function') { assurerDetailsObjectifs(); }
  var dispo = o.disponibleA ? [o.disponibleA] : [];
  if (o.demarche === 'offre' || o.demarche === 'spontanee' || o.demarche === 'reconversion') {
    dossier[o.demarche] = { lien: '', poste: o.posteOffre || nom, structure: o.employeur, type: type, dispo: dispo };
    if (o.demarche === 'reconversion' && o.ancienValeur) { dossier.reconversion.ancien = (o.ancienType === 'secteur' ? 'secteur d’activité : ' : 'métier : ') + o.ancienValeur; }
    dossier.rechercheCandidature = Object.assign({}, dossier.rechercheCandidature || {}, {
      entreprise: o.employeur, site: '', lienOffre: '', texteOffre: o.texteOffre,
      civiliteRecruteur: o.civiliteRecruteur, nomRecruteur: o.nomRecruteur, typeStructure: type
    });
    dossier.contrat = o.contrat.slice();
    dossier.tempsTravail = o.tempsTravail.slice();
  } else {
    var cle = (typeof CLE_DETAILS !== 'undefined' && CLE_DETAILS[o.demarche]) || o.demarche;
    var duree = o.dureeQuantite ? o.dureeQuantite + (o.dureeUnite ? ' ' + o.dureeUnite : '') : '';
    var dates = [o.dateDebut ? 'début ' + o.dateDebut : '', o.dateFin ? 'fin ' + o.dateFin : ''].filter(Boolean).join(', ');
    dossier[cle] = {
      structure: o.employeur, poste: o.demarche === 'formation' ? (o.formationVisee || nom) : nom, lien: '', duree: duree, dates: dates, heures: o.heures,
      type: type, dispo: dispo, dureeQuantite: o.dureeQuantite, dureeUnite: o.dureeUnite || null, dateDebut: o.dateDebut, dateFin: o.dateFin
    };
    // Seul l'objectif de CE CV de reference part dans sa demande (jamais ceux des autres metiers).
    if (o.organisme) { dossier[cle].organisme = o.organisme; }
    var objPm = o.objectifsPmsmp.concat(o.objectifPmsmpAutre ? [o.objectifPmsmpAutre] : []);
    if (o.demarche === 'pmsmp' && objPm.length) { dossier[cle].precisions = 'objectif de l’immersion : ' + objPm.join(' ; '); }
  }
  // Le module travaille le CV (jamais la lettre ni l'entretien) : c'est la page « Vos documents » du CV qui sert d'éditeur.
  dossier.dernierDocumentPrepare = 'cv';
  dossier.modeCreation = 'maj';
  dossier.formatCV = 'pdf';
}

// ---------------- Vue 'choix' (3a) ----------------

function _ucpmP3HtmlChoix(etat) {
  var cochees = ucpmEntreesCochees(etat);
  var ref = ucpmRefCourante(etat);
  // Deux blocs, comme a la page 2 (retour de Denis, 2026-10-10) : mon metier appele autrement, puis les metiers qui utilisent mes competences.
  var unRadio = function (e) {
    return '<label style="display:flex;gap:.55rem;align-items:flex-start;margin:0 0 .4rem;cursor:pointer;"><input type="radio" name="ucpmRef" style="margin-top:.3rem;" value="' + e.id + '"' + (ref && ref.id === e.id ? ' checked' : '') + '> ' +
      '<span><strong>' + _ucpmEsc(ucpmNomMetier(e, etat.sexe)) + '</strong><br><span class="small" style="color:var(--text-muted);">Objectif : ' + _ucpmEsc(ucpmEtiquetteObjectif(e.objectif)) + '</span></span></label>';
  };
  var dansGauche = cochees.filter(function (e) { return etat.intitules.indexOf(e) !== -1; });
  var dansDroite = cochees.filter(function (e) { return etat.intitules.indexOf(e) === -1; });
  var radios = '<div class="ucpm-deux-colonnes"><div>' + (dansGauche.length ? '<p class="mb-1"><strong>&#128221; Mon métier, appelé autrement</strong></p>' + dansGauche.map(unRadio).join('') : '') + '</div>' +
    '<div>' + (dansDroite.length ? '<p class="mb-1"><strong>&#129517; D’autres métiers qui utilisent mes compétences</strong></p>' + dansDroite.map(unRadio).join('') : '') + '</div></div>';
  return '<div class="cv-section"><p class="mb-0">Vous faites ici un vrai CV complet, avec tous les réglages de l’application. Une fois qu’il vous convient, les autres CV en découlent : même modèle, même corps, seuls le titre, la phrase d’accroche et, si vous le voulez, l’aspect changent.</p></div>' +
    '<div class="cv-section"><h4>&#9999;&#65039; 1. Quel CV sert de référence ?</h4>' +
    '<p class="mb-2">Vous pouvez prendre n’importe lequel : le corps du CV est le même pour tous. Par défaut, le métier de votre CV.</p>' + radios + '</div>' +
    '<div class="cv-section"><h4>&#128190; 2. Ce qui va se passer</h4><ul class="mb-0" style="padding-left:1.25rem;">' +
    '<li>L’application range votre CV en rubriques (expériences, formations…), avec l’assistant en ligne, si ce n’est pas déjà fait.</li>' +
    '<li>Elle lui demande ensuite votre CV complet pour le métier de référence et son objectif. Elle n’envoie jamais vos coordonnées.</li>' +
    '<li>Vous réglez votre CV avec l’éditeur de CV, comme dans le reste de l’application. Ici, vous gardez le CV sur une seule page.</li></ul></div>' +
    '<div class="text-center"><button type="button" class="btn btn-primary btn-lg" id="btnUcpmPreparerRef"' + (ref ? '' : ' disabled') + '>Préparer mon CV complet &#8594;</button></div>';
}

// ---------------- Vue 'structurer' : ranger le CV en rubriques, dans la page (pas de fenêtre) ----------------
// Même chemin que « Analyser ma candidature » (Organiser mon CV) : choix de l'assistant, chez l'assistant, collage de la réponse, puis « Vérifiez les informations
// importées » EN PAGE. Prompt extraction-cv (promptCache), lecture analyserReponseImport / SPECIFICATION_IMPORT, validation genererEcranValidationImport.

var UCPM_ETAPES_CHOIX_EXTRACTION = [
  { titre: 'Copie', detail: 'Le texte de votre CV, une fois masqué, est copié automatiquement avec la demande.' },
  { titre: 'Rangement', detail: 'L’assistant range votre CV en rubriques : expériences, formations, compétences… Il ne change rien à ce que vous avez écrit.' },
  { titre: 'Vous collez', detail: 'Vous copiez sa réponse et vous la collez ici.' },
  { titre: 'Votre choix', detail: 'Vous décochez ce que vous ne voulez pas garder et vous corrigez si besoin. Rien n’est écrit avant que vous validiez.' }
];

function _ucpmConfigPassageExtraction(etat) {
  return {
    idSuffixe: 'UcpmExtraction',
    etapes: UCPM_ETAPES_CHOIX_EXTRACTION,
    texteConfidentialite: 'Seul le texte de votre CV, une fois masqué, est envoyé : votre nom, votre téléphone et votre adresse ne partent pas.',
    recapHtml:
      '<div class="cv-section recap-contexte-envoi mb-3">' +
      '<p class="mb-1"><strong>&#128221; Ranger mon CV en rubriques</strong></p>' +
      '<p class="mb-0">Pour construire votre CV complet, l’application doit d’abord ranger votre CV en rubriques : vos expériences, vos formations, vos compétences… Cette étape passe par l’assistant en ligne et ne dure que quelques instants. Vous relirez le résultat avant de continuer.</p></div>',
    construireTexte: function () { return promptCache('extraction-cv', etat.texteCV); },
    importer: function (texte) {
      var r = analyserReponseImport(texte, SPECIFICATION_IMPORT);
      if (!r.succes) { return { succes: false, erreur: r.erreur || 'Cette réponse n’a pas pu être lue. Vérifiez qu’elle contient bien tout le bloc renvoyé par l’assistant.' }; }
      dossier.imports = dossier.imports || {};
      dossier.imports.courant = { schemaVersion: 1, typeSource: 'un_cv_plusieurs_metiers', date: new Date().toISOString(), donnees: r.valeurs };
      if (typeof trackEvenement === 'function') { trackEvenement('ucpm_extraction_importee'); }
      return { succes: true };
    },
    // Retours 20 et 23 de Denis : le panneau « Quelques passages à préciser » de « Reformuler mon CV » (le même, afficherClarificationPointsAVerifier) pose ses questions sur ce qui est
    // peu clair dans le CV (SST mal écrit, certification sans année...) AVANT que cela passe sur le CV ; saute tout seul s'il n'y a rien à préciser.
    apresSucces: function () {
      var valeurs = dossier.imports && dossier.imports.courant && dossier.imports.courant.donnees;
      var suite = function () { _ucpmP3AppliquerImportEtOuvrirInfos(etat); };
      if (valeurs && typeof afficherClarificationPointsAVerifier === 'function') {
        try { if (typeof _incoh === 'function') { _incoh().suggererAnnees(valeurs.pointsAVerifier, [valeurs], etat.texteCV); } } catch (e) { /* les suggestions d'années sont facultatives */ }
        afficherClarificationPointsAVerifier(valeurs.pointsAVerifier, suite, { appliquer: appliquerPrecisionSurValeurs(valeurs) });
      } else { suite(); }
    }
  };
}

// ---------------- « Vos informations » : l'écran de l'application, tel quel (retour 11 de Denis, 2026-10-10) ----------------
// Après le rangement du CV et les questions sur les points peu clairs, tout ce qui a été repéré est rangé dans le dossier (toutes les propositions retenues par défaut, comme
// quand on coche tout) et la personne arrive sur la page « Vos informations » (route 'projet', pageProjet) : les blocs Vous, Parcours, Expériences, Compléments, avec ce qui a
// été repéré dans son CV, qu'elle modifie ou complète. Même écran que dans « Reformuler mon CV » et « Créer un nouveau CV » : jamais recopié.
// Les mêmes fonctions que l'ancien écran de choix sont utilisées (comparerDonnees, genererEcranValidationImport, lireDecisionsValidationImport, fusionnerDonnees), l'écran est
// seulement construit hors de la vue pour lire les cases cochées par défaut.
function _ucpmP3AppliquerImportEtOuvrirInfos(etat) {
  if (dossier.imports && dossier.imports.courant) {
    var comparaison = comparerDonnees(dossier, dossier.imports.courant.donnees, SPECIFICATION_IMPORT);
    var cache = document.createElement('div');
    cache.style.display = 'none';
    cache.innerHTML = genererEcranValidationImport(comparaison, SPECIFICATION_IMPORT);
    document.body.appendChild(cache);
    try {
      var decisions = lireDecisionsValidationImport(comparaison, SPECIFICATION_IMPORT);
      fusionnerDonnees(dossier, decisions, SPECIFICATION_IMPORT);
    } finally { cache.remove(); }
    dossier.imports.courant = null;
  }
  etat.p3Extrait = true;
  etat.p3Vue = 'infos';
  ucpmOuvrirInfos();
}

function ucpmOuvrirInfos() {
  var etat = ouvrirUnCvPlusieursMetiers();
  var ref = ucpmRefCourante(etat);
  if (ref) { ucpmPoserObjectifDansDossier(etat, ref); }
  naviguerVers('projet');
}

// Barre d'étapes et barre du bas de « Vos informations » quand la page est ouverte depuis le module (appelées par pageProjet, js/app.js).
function ucpmBarreEtapesInfos() { return barreEtapesModule(UCPM_NAV_ETAPES, 2); }
function ucpmBarreDepuisInfos() {
  return barreNavigation('un-cv-plusieurs-metiers', 'un-cv-plusieurs-metiers', 'Continuer : style d’écriture et assistant &#8594;', {
    onclickPrecedent: 'ucpmRetourDepuisInfos()',
    onclickSuivant: 'ucpmContinuerDepuisInfos()'
  });
}
function ucpmRetourDepuisInfos() {
  var etat = ouvrirUnCvPlusieursMetiers();
  etat.page = 3; etat.p3Vue = 'choix';
  naviguerVers('un-cv-plusieurs-metiers');
}
function ucpmContinuerDepuisInfos() {
  var etat = ouvrirUnCvPlusieursMetiers();
  etat.page = 3; etat.p3Vue = 'assistant';
  _ucpmP3AmorcerAssistant(etat);
  naviguerVers('un-cv-plusieurs-metiers');
}

// ---------------- Vue 'assistant' : les rectangles de la page « Assistant » (mêmes fonctions) ----------------

// Prépare l'état commun que lit pageAssistant (accordéons du CV, réglages de style par défaut). Une seule fois à l'arrivée sur cette vue.
function _ucpmP3AmorcerAssistant(etat) {
  if (typeof etatAccordeonParType === 'undefined') { return; }
  dossier.dernierDocumentPrepare = 'cv';
  if (!etatAccordeonParType.cv) { etatAccordeonParType.cv = { 'adaptation-metier': true }; }
  etatAccordeon = etatAccordeonParType.cv;
  if (!etatAccordeonValideParType.cv) { etatAccordeonValideParType.cv = {}; }
  etatAccordeonValide = etatAccordeonValideParType.cv;
  if (typeof appliquerDefautsStyleCV === 'function') { appliquerDefautsStyleCV('cv'); }
  // Un seul rectangle ouvert à la fois : le style d'écriture reste replié (valeurs par défaut), on part sur le choix de l'assistant.
  var dejaImporte = (typeof reponseIAImportee === 'function') && reponseIAImportee('cv');
  RECTANGLES_ASSISTANT.forEach(function (id) { etatAccordeon[id] = false; });
  // Réponse déjà importée : « Ce que l'assistant a préparé » reste ouvert, même après validation (retours de Denis du 2026-10-10 : la personne doit voir de quoi il s'agit,
  // et en revenant d'une étape suivante elle retrouve ce qu'elle avait sous les yeux, jamais un écran de départ).
  if (dejaImporte) { etatAccordeon['relecture-ia'] = true; }
  else if (!_relectureIAValideeParType.cv) { etatAccordeon[etatAccordeonValide['adaptation-metier'] ? 'choix-ia' : 'adaptation-metier'] = true; }   // le style d'écriture d'abord, une fois
  if (dejaImporte && !_relectureIAValideeParType.cv && typeof _dossierIaContientDesChoix === 'function' && _dossierIaContientDesChoix('cv')) { _relectureIAValideeParType.cv = true; }
}

function _ucpmP3HtmlAssistant() {
  var importee = reponseIAImportee('cv');
  return (typeof htmlBanniereComplementCV === 'function' ? htmlBanniereComplementCV() : '') + '<div class="cv-section"><p class="mb-0">L’application a préparé la demande de votre CV complet. Choisissez un assistant : elle copie tout, ouvre l’assistant, puis vous revenez coller sa réponse.</p></div>' +
    rectangleAssistant('adaptation-metier', '&#127898;&#65039;', 'Réglez le style d’écriture', resumeRectangleStyleCV('cv'), contenuRectangleStyleCV('cv')) +
    rectangleAssistant('choix-ia', '&#128172;', 'Choisissez votre assistant', '', contenuRectangleChoixIA('cv')) +
    rectangleAssistant('import-ia', '&#128229;', 'Importer la réponse', importee ? 'réponse importée' : '', contenuAccordeonImportIA('cv')) +
    (importee ? rectangleAssistant('relecture-ia', '&#128209;', 'Ce que l’assistant a préparé', _relectureIAValideeParType.cv ? 'choix validés' : '', contenuRectangleRelectureIA()) : '') +
    (importee ? rectangleComplementCV() : '');
}

function _ucpmP3CablerAssistant() {
  var rerender = ucpmRendrePage;
  // Après un import ou une validation, le rectangle « Ce que l'assistant a préparé » reste ouvert (la fonction commune le refermerait sinon).
  var rerenderRelectureOuverte = function () {
    if (typeof reponseIAImportee === 'function' && reponseIAImportee('cv') && typeof etatAccordeon !== 'undefined') { etatAccordeon['relecture-ia'] = true; }
    ucpmRendrePage();
  };
  wireRectanglesAssistant(rerender);
  if (typeof wireComplementCV === 'function') { wireComplementCV(rerender); }
  wireRectangleStyleCV('cv', rerender);
  wireRectangleChoixIA('cv', rerender);
  wireImportIA('cv', rerenderRelectureOuverte, 'relecture-ia');
  wireRectangleRelectureIA(rerenderRelectureOuverte);
  if (typeof _barreAdopterBoutonEtape === 'function') { _barreAdopterBoutonEtape(); }
}

// ---------------- Vue 'editeur' (3d) ----------------

function _ucpmP3HtmlEditeur(etat) {
  var ref = ucpmRefCourante(etat);
  return '<div class="cv-section"><h4>&#9989; Votre CV complet est prêt</h4>' +
    '<p>Pour le métier de référence <strong>' + _ucpmEsc(ref ? ucpmNomMetier(ref, etat.sexe) : '') + '</strong>' + (ref && ucpmEtiquetteObjectif(ref.objectif) ? ' (' + _ucpmEsc(ucpmEtiquetteObjectif(ref.objectif)) + ')' : '') + '.</p>' +
    '<p class="mb-2">Vous allez le régler avec l’éditeur de CV de l’application : modèle, couleurs, rubriques, titre, phrase d’accroche, coordonnées. C’est le même éditeur que dans le reste de l’application. Ici, le CV doit tenir sur une page.</p>' +
    (etat.refPret ? '<p class="mb-2"><strong>&#9989; Réglage terminé.</strong> Vous pouvez le reprendre ou continuer.</p>' : '') +
    '<p class="mb-0">Le bouton en bas de l’écran vous y emmène.</p></div>';
}

// Les étapes de l'assistant (style, choix, import, relecture) sont faites à ce stade du module : l'éditeur s'ouvre sur les réglages du CV, jamais sur elles.
function ucpmPreparerEtatEditeur() {
  if (typeof etatAccordeonParType === 'undefined') { return; }
  etatAccordeonParType.cv = etatAccordeonParType.cv || {};
  etatAccordeonValideParType.cv = etatAccordeonValideParType.cv || {};
  RECTANGLES_ASSISTANT.forEach(function (id) { etatAccordeonParType.cv[id] = false; etatAccordeonValideParType.cv[id] = true; });
  _relectureIAValideeParType.cv = true;
}

// Ouvre l'éditeur commun (page « Vos documents ») : la navigation capture 'un-cv-plusieurs-metiers' comme origine, ce qui active le mode module.
function ucpmOuvrirEditeur() {
  var etat = ouvrirUnCvPlusieursMetiers();
  var ref = ucpmRefCourante(etat);
  if (ref) { ucpmPoserObjectifDansDossier(etat, ref); }
  ucpmPreparerEtatEditeur();
  naviguerVers('resultats');
}

// Barre du bas de l'éditeur : « Retour » ramène à cette page, « Ce CV me convient » passe à la page 4.
function ucpmBarreDepuisEditeur() {
  if (window._modeAspectUcpm && typeof ucpmBarreAspect === 'function') { return ucpmBarreAspect(); }
  return barreNavigation('un-cv-plusieurs-metiers', 'un-cv-plusieurs-metiers', 'Ce CV me convient : créer les autres &#8594;', {
    onclickPrecedent: 'ucpmRetourDepuisEditeur()',
    onclickSuivant: 'ucpmContinuerDepuisEditeur()'
  });
}
function ucpmRetourDepuisEditeur() {
  var etat = ouvrirUnCvPlusieursMetiers();
  var retour = etat.retourEditeur || 0;
  etat.retourEditeur = 0;
  if (retour) { etat.page = retour; } else { etat.page = 3; etat.p3Vue = 'editeur'; }
  window._modeModuleUcpm = false;
  naviguerVers('un-cv-plusieurs-metiers');
}

// Nombre de pages du CV réglé, mesuré dans l'aperçu de l'éditeur (0 si l'aperçu n'est pas là).
function _ucpmP3NombrePages() {
  try {
    var ifr = document.querySelector('#zonePdfInlineCV iframe');
    return ifr && ifr.contentDocument ? ifr.contentDocument.querySelectorAll('.page-a4').length : 0;
  } catch (e) { return 0; }
}

function ucpmContinuerDepuisEditeur() {
  var etat = ouvrirUnCvPlusieursMetiers();
  var terminer = function () {
    var civ = String((dossier.identite && dossier.identite.civilite) || '').trim().toLowerCase();
    etat.sexe = (civ === 'madame' || civ === 'mme') ? 'f' : ((civ === 'monsieur' || civ === 'm.' || civ === 'm') ? 'm' : '');
    etat.refPret = true;
    etat.refTitre = String(dossier.titreCV || '').trim();
    window._modeModuleUcpm = false;
    var retour = etat.retourEditeur || 0;
    etat.retourEditeur = 0;
    etat.page = retour || 4; etat.pageMax = Math.max(etat.pageMax || 1, etat.page);
    naviguerVers('un-cv-plusieurs-metiers');
  };
  var pages = _ucpmP3NombrePages();
  var libre = null;
  try { var ifrLibre = document.querySelector('#zonePdfInlineCV iframe'); libre = ifrLibre && ifrLibre.contentDocument ? ucpmEspaceLibreDocument(ifrLibre.contentDocument) : null; } catch (e) { libre = null; }
  if (pages === 1 && ucpmCvTresRempli(libre, pages) && typeof confirmerAction === 'function') {
    // Information, jamais un blocage : le CV tient sur une page à l'écran mais presque sans marge, il peut déborder à l'impression.
    confirmerAction('Ce CV est très rempli', 'Il tient sur une page à l’écran, mais presque sans marge en bas : à l’impression, il risque de passer sur deux pages. Vous pouvez revenir au réglage pour raccourcir un texte ou changer de modèle, ou continuer tel quel.',
      'Continuer tel quel', 'btn-primary', terminer, 'Revenir au réglage', null, 'btn-outline-secondary');
    return;
  }
  if (pages > 1 && typeof confirmerAction === 'function') {
    // Information, jamais un blocage : le CV déborde sur la page suivante (modèle trop riche pour une page).
    confirmerAction('Ce CV passe sur ' + pages + ' pages', 'Dans ce module, chaque CV est prévu sur une seule page. Vous pouvez revenir au réglage pour raccourcir un texte ou changer de modèle, ou continuer tel quel : le fichier final aura alors ' + pages + ' pages pour ce CV.',
      'Continuer tel quel', 'btn-primary', terminer, 'Revenir au réglage', null, 'btn-outline-secondary');
    return;
  }
  terminer();
}

// ---------------- Page ----------------

ucpmEnregistrerPage(3, {
  rendre: function (etat) {
    if (!etat.p3Vue) { etat.p3Vue = 'choix'; }
    if (etat.p3Vue === 'structurer') { return ucpmPassageRendre(etat, 'extraction', _ucpmConfigPassageExtraction(etat)); }
    if (etat.p3Vue === 'infos') { return '<div class="cv-section"><h4>&#128203; Vos informations</h4><p class="mb-2">Votre CV a été rangé en rubriques. Vérifiez et complétez vos informations : expériences, formations, compétences, coordonnées.</p><button type="button" class="btn btn-primary btn-lg" id="btnUcpmOuvrirInfos">Voir mes informations &#8594;</button></div>'; }
    if (etat.p3Vue === 'assistant') { return _ucpmP3HtmlAssistant(); }
    if (etat.p3Vue === 'editeur') { return _ucpmP3HtmlEditeur(etat); }
    return _ucpmP3HtmlChoix(etat);
  },
  cabler: function (etat) {
    var $ = function (sel) { return document.querySelector(sel); };
    Array.prototype.forEach.call(document.querySelectorAll('input[name="ucpmRef"]'), function (el) {
      el.addEventListener('change', function () { etat.refId = el.value; });
    });
    var preparer = $('#btnUcpmPreparerRef');
    if (preparer && !preparer.disabled) {
      preparer.addEventListener('click', function () {
        var ref = ucpmRefCourante(etat);
        if (!ref) { return; }
        etat.refId = ref.id;
        ucpmPoserObjectifDansDossier(etat, ref);
        var dejaRange = (typeof dossierAStructureExperiences === 'function') && dossierAStructureExperiences();
        etat.p3Vue = dejaRange || etat.p3Extrait ? 'assistant' : 'structurer';
        if (etat.p3Vue === 'assistant') { _ucpmP3AmorcerAssistant(etat); } else { ucpmPassageReinitialiser(etat, 'extraction'); }
        ucpmRendrePage();
      });
    }
    if (etat.p3Vue === 'structurer') { ucpmPassageCabler(etat, 'extraction', _ucpmConfigPassageExtraction(etat)); }
    var infos = $('#btnUcpmOuvrirInfos');
    if (infos) { infos.addEventListener('click', ucpmOuvrirInfos); }
    if (etat.p3Vue === 'assistant') { _ucpmP3CablerAssistant(); }
  },
  libelleContinuer: function () { return (typeof libelleContinuerComplementCV === 'function') ? libelleContinuerComplementCV('Régler mon CV &#8594;') : 'Régler mon CV &#8594;'; },
  peutContinuer: function (etat) {
    if (etat.p3Vue === 'editeur' || etat.p3Vue === 'infos') { return true; }
    if (etat.p3Vue === 'assistant') { return !!(typeof _relectureIAValideeParType !== 'undefined' && _relectureIAValideeParType.cv); }
    return false;
  },
  raisonBlocage: function (etat) {
    if (etat.p3Vue === 'assistant') { return 'Importez la réponse de l’assistant, puis validez ce qu’il a préparé, pour continuer.'; }
    if (etat.p3Vue === 'structurer') { return 'Choisissez un assistant et collez sa réponse pour continuer.'; }
    return 'Choisissez le métier de référence, puis cliquez sur « Préparer mon CV complet ».';
  },
  continuer: function (etat) {
    if (etat.p3Vue === 'infos') { ucpmOuvrirInfos(); return; }
    if (etat.p3Vue === 'assistant') { etat.p3Vue = 'editeur'; ucpmRendrePage(); return; }
    ucpmOuvrirEditeur();
  },
  // « Retour » : recule d'une vue, sans rien supprimer ; depuis le premier choix, la page 2.
  retour: function (etat) {
    var v = etat.p3Vue || 'choix';
    if (v === 'choix') { return false; }
    if (v === 'structurer') { if (ucpmPassageRetour(etat, 'extraction')) { return true; } etat.p3Vue = 'choix'; }
    else if (v === 'editeur') { etat.p3Vue = 'assistant'; _ucpmP3AmorcerAssistant(etat); }
    else if (etat.p3Extrait) { etat.p3Vue = 'infos'; ucpmOuvrirInfos(); return true; }   // la page d'avant : « Vos informations », avec tout ce qui y a été saisi
    else { etat.p3Vue = 'structurer'; }
    ucpmRendrePage();
    return true;
  }
});
