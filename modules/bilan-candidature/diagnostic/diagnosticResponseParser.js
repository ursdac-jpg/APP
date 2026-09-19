/* ============================================================
   modules/bilan-candidature/diagnostic/diagnosticResponseParser.js
   ------------------------------------------------------------
   Interprete le texte colle par l'utilisateur (reponse du Prompt 1) en
   DiagnosticResultat. Reutilise extraireBlocJSONDepuisTexte() (js/app.js,
   deja eprouvee en production sur CV/lettre/entretien) pour l'extraction
   JSON -- jamais une reimplementation.

   PARSER TOLERANT, JAMAIS TOUT-OU-RIEN (decision du 2026-08-08) :
   - Si aucun JSON n'est identifiable dans le texte -> ReponseIllisible
     (rien a reconstruire, echec reel).
   - Si le JSON est valide mais que syntheseGenerale est absente/invalide
     -> ReponseIncomplete (pas de synthese = rien de presentable au
     candidat, echec reel).
   - Pour tout le reste (axes[], recommandations[], alertesPrioritaires[],
     dimensionsNonEvaluables[]) : CHAQUE ENTREE est reconstruite
     independamment. Une entree invalide est ECARTEE et consignee comme
     Anomalie -- jamais un throw qui jetterait le reste d'une reponse
     par ailleurs exploitable.

   ANOMALIES = OUTIL DE DIAGNOSTIC TECHNIQUE, JAMAIS UNE SOURCE DE
   DONNEES (voir modeles/anomalie.js). Aucun composant en aval de ce
   parser ne doit lire anomalies[] pour fonctionner -- uniquement
   resultat, le DiagnosticResultat reconstruit.

   INDEPENDANT DU PROMPT 2 : ne reconstruit que ce que le Prompt 1
   produit. Aucun champ ajoute par anticipation d'un besoin futur
   d'amelioration/ (voir modeles/demandeAmelioration.js, qui vit
   ailleurs et n'est jamais reference ici).

   TACHE (retour utilisateur : filet de securite anonymisation, 2026-08-10) :
   filet de securite applicatif, en complement de la consigne du prompt
   (jamais un remplacement) -- une donnee volontairement retiree du CV
   (modeles/elementsAnonymises.js) ne doit jamais devenir un critere
   negatif. Deux traitements distincts, jamais melanges :
     - LISTES (pointsForts/pointsFaibles/incoherences/risques,
       recommandations[].contenu) : chaque entree est un texte court et
       isole -- une correspondance est FILTREE (retiree), sans risque de
       casser une phrase voisine. Consignee en anomalie pour rester
       observable (meme principe que le reste de ce fichier).
     - PROSE LIBRE (resumeNarratif, premiereImpression/ceQuiDonneEnvie/
       ceQuiPeutFreiner/syntheseProjectionRecruteur.texte,
       observationsArgumentees[].texte) : jamais modifiee (reecrire un
       paragraphe genere risquerait de casser sa grammaire ou son sens) --
       seulement SIGNALEE en anomalie, pour mesurer dans le temps si le
       cas se presente reellement malgre la consigne du prompt.
   ============================================================ */

if (typeof require !== 'undefined') {
  var _bilanEnumsDRP = require('../modeles/enums.js');
  var BILAN_RESTITUTION_QUALITATIVE = _bilanEnumsDRP.BILAN_RESTITUTION_QUALITATIVE;
  var BILAN_PRIORITE_RECOMMANDATION = _bilanEnumsDRP.BILAN_PRIORITE_RECOMMANDATION;
  var BILAN_STATUT_PREPARATION = _bilanEnumsDRP.BILAN_STATUT_PREPARATION;
  var BILAN_TYPE_ALERTE = _bilanEnumsDRP.BILAN_TYPE_ALERTE;
  var bilanEnumEstValide = _bilanEnumsDRP.bilanEnumEstValide;

  var _bilanUtilDRP = require('../modeles/utilitaires.js');
  var bilanCreerErreurMetier = _bilanUtilDRP.bilanCreerErreurMetier;
  var bilanGenererId = _bilanUtilDRP.bilanGenererId;
  var bilanAssainirTypographieProfond = _bilanUtilDRP.bilanAssainirTypographieProfond;

  var _bilanAnomalieDRP = require('../modeles/anomalie.js');
  var bilanCreerAnomalie = _bilanAnomalieDRP.bilanCreerAnomalie;

  var _bilanObsDRP = require('../modeles/observation.js');
  var bilanCreerObservationArgumentee = _bilanObsDRP.bilanCreerObservationArgumentee;

  var _bilanAttenteDRP = require('../modeles/attente.js');
  var bilanCreerAttente = _bilanAttenteDRP.bilanCreerAttente;

  var _bilanRecoDRP = require('../modeles/recommandation.js');
  var bilanCreerRecommandation = _bilanRecoDRP.bilanCreerRecommandation;
  var bilanRecommandationEstValide = _bilanRecoDRP.bilanRecommandationEstValide;

  var _bilanDRDRP = require('../modeles/diagnosticResultat.js');
  var bilanCreerResultatAxe = _bilanDRDRP.bilanCreerResultatAxe;
  var bilanResultatAxeEstValide = _bilanDRDRP.bilanResultatAxeEstValide;
  var bilanCreerAlertePrioritaire = _bilanDRDRP.bilanCreerAlertePrioritaire;
  var bilanAlertePrioritaireEstValide = _bilanDRDRP.bilanAlertePrioritaireEstValide;
  var bilanCreerDiagnosticResultat = _bilanDRDRP.bilanCreerDiagnosticResultat;

  var _bilanElemAnonDRP = require('../modeles/elementsAnonymises.js');
  var bilanElementAnonymiseMentionne = _bilanElemAnonDRP.bilanElementAnonymiseMentionne;
}

// ---- Filet de securite anonymisation (voir en-tete de fichier) ----

// LISTES : retire chaque entree mentionnant un element anonymise, ajoute
// une anomalie par entree retiree. Ne touche jamais aux entrees saines.
function bilanFiltrerListeAnonymisee(liste, chemin, anomalies) {
  return liste.filter(function (item) {
    var elementId = bilanElementAnonymiseMentionne(item);
    if (!elementId) { return true; }
    anomalies.push(bilanCreerAnomalie({
      type: 'MentionElementAnonymiseFiltree',
      chemin: chemin,
      detail: 'Entrée retirée : fait référence à "' + elementId + '", volontairement absent du CV envoyé à l’assistant.',
      valeurRecue: item
    }));
    return false;
  });
}

// PROSE LIBRE : jamais modifiee, seulement signalee (voir en-tete).
function bilanSignalerSiMentionAnonymisee(texte, chemin, anomalies) {
  var elementId = bilanElementAnonymiseMentionne(texte);
  if (!elementId) { return; }
  anomalies.push(bilanCreerAnomalie({
    type: 'MentionElementAnonymiseDetectee',
    chemin: chemin,
    detail: 'Texte libre non modifié (risque de casser la formulation) : fait référence à "' + elementId + '", volontairement absent du CV envoyé à l’assistant.',
    valeurRecue: texte
  }));
}

function bilanListeDeChaines(valeur) {
  if (!Array.isArray(valeur)) { return []; }
  return valeur.filter(function (v) { return typeof v === 'string' && v.trim().length > 0; });
}

// ---- Resolution texte -> id pour les attentes (docs/CHANTIER_PROMPT1_ATTENTES.md, 1.3) ----

// L'IA ne connait jamais l'id genere d'une observation argumentee (voir
// bilanGenererIdObservationArgumentee ci-dessus) : attentes[].observationsLiees
// contient donc le TEXTE de l'observation, recopie a l'identique, jamais
// un id invente. Resout ce texte vers le veritable id, par correspondance
// exacte au sein des observations DEJA RECONSTRUITES du meme axe.
// Regle deterministe actee (docs/CHANTIER_PROMPT1_ATTENTES.md, 1.3, 3e
// point technique) : si plusieurs observations partagent exactement le
// meme texte, la premiere rencontree (index le plus bas) est retenue --
// jamais un choix aleatoire. null si aucune correspondance.
function bilanResoudreObservationParTexte(texte, observationsDejaReconstruites) {
  for (var i = 0; i < observationsDejaReconstruites.length; i += 1) {
    if (observationsDejaReconstruites[i].contenu === texte) {
      return observationsDejaReconstruites[i].id;
    }
  }
  return null;
}

// ---- Reconstruction des attentes d'un axe ----

// observations : les observationsArgumentees DEJA reconstruites de ce
// meme axe (jamais les observations d'un autre axe -- une Attente ne
// reference que des preuves de son propre axe, docs/CHANTIER_CARTE_CORRESPONDANCE.md,
// section 5). Generique, jamais restreint a l'axe 'adequation' ici : si
// l’assistant en produit ailleurs malgre la consigne du prompt, elles sont
// reconstruites comme les autres, simplement jamais lues par la Carte de
// correspondance (qui ne consulte que l'axe adequation).
function bilanReconstruireAttentes(attentesBrutes, chemin, axeId, observations, anomalies) {
  var attentes = [];
  (Array.isArray(attentesBrutes) ? attentesBrutes : []).forEach(function (attenteBrute, attenteIndex) {
    var cheminAttente = chemin + '.attentes[' + attenteIndex + ']';
    if (!attenteBrute || !attenteBrute.contenu) {
      anomalies.push(bilanCreerAnomalie({ type: 'ChampManquant', chemin: cheminAttente + '.contenu', detail: 'contenu manquant, attente ignorée.' }));
      return;
    }
    // Entree courte et isolee (comme pointsForts/pointsFaibles, voir
    // en-tete de fichier) : filtrage automatique sans risque plutot que
    // signalement seul -- meme si une attente decrit le poste, pas la
    // personne, et ne devrait donc quasiment jamais declencher ce filtre.
    var elementAnonymiseAttente = bilanElementAnonymiseMentionne(attenteBrute.contenu);
    if (elementAnonymiseAttente) {
      anomalies.push(bilanCreerAnomalie({
        type: 'MentionElementAnonymiseFiltree',
        chemin: cheminAttente + '.contenu',
        detail: 'Attente écartée : fait référence à "' + elementAnonymiseAttente + '", volontairement absent du CV envoyé à l’assistant.',
        valeurRecue: attenteBrute.contenu
      }));
      return;
    }

    var observationsResolues = [];
    bilanListeDeChaines(attenteBrute.observationsLiees).forEach(function (texteObs) {
      var idResolu = bilanResoudreObservationParTexte(texteObs, observations);
      if (idResolu) {
        observationsResolues.push(idResolu);
      } else {
        anomalies.push(bilanCreerAnomalie({
          type: 'ReferenceInconnue',
          chemin: cheminAttente + '.observationsLiees',
          detail: 'Aucune observation argumentée de ce même axe ne correspond exactement à ce texte.',
          valeurRecue: texteObs
        }));
      }
    });

    attentes.push(bilanCreerAttente({
      contenu: attenteBrute.contenu,
      axeLie: axeId,
      observationsLiees: observationsResolues
    }, attenteIndex));
  });
  return attentes;
}

// ---- Reconstruction d'un axe ----
function bilanReconstruireAxe(axeBrut, index, idsAxesConnus) {
  var chemin = 'axes[' + index + ']';
  var anomalies = [];

  if (!axeBrut || typeof axeBrut !== 'object') {
    return { axe: null, anomalies: [bilanCreerAnomalie({ type: 'ValeurInvalide', chemin: chemin, detail: 'Entrée d\'axe absente ou non-objet.', valeurRecue: axeBrut })] };
  }
  if (!axeBrut.id) {
    return { axe: null, anomalies: [bilanCreerAnomalie({ type: 'ChampManquant', chemin: chemin + '.id', detail: 'id d\'axe manquant.' })] };
  }
  if (idsAxesConnus.indexOf(axeBrut.id) === -1) {
    return { axe: null, anomalies: [bilanCreerAnomalie({ type: 'ReferenceInconnue', chemin: chemin + '.id', detail: 'id d\'axe inconnu du catalogue.', valeurRecue: axeBrut.id })] };
  }
  if (!bilanEnumEstValide(BILAN_RESTITUTION_QUALITATIVE, axeBrut.restitutionQualitative)) {
    return { axe: null, anomalies: [bilanCreerAnomalie({ type: 'ValeurInvalide', chemin: chemin + '.restitutionQualitative', detail: 'Valeur hors énumération.', valeurRecue: axeBrut.restitutionQualitative })] };
  }

  // observationsArgumentees : reconstruites une a une -- une entree mal
  // formee est ecartee, jamais tout l'axe. Texte libre argumente (cite
  // des observations factuelles) : jamais filtre automatiquement, voir
  // bilanSignalerSiMentionAnonymisee() -- seulement signale.
  var observations = [];
  (Array.isArray(axeBrut.observationsArgumentees) ? axeBrut.observationsArgumentees : []).forEach(function (obsBrute, obsIndex) {
    var cheminObs = chemin + '.observationsArgumentees[' + obsIndex + ']';
    if (!obsBrute || !obsBrute.texte) {
      anomalies.push(bilanCreerAnomalie({ type: 'ChampManquant', chemin: cheminObs + '.texte', detail: 'texte manquant, observation ignorée.' }));
      return;
    }
    bilanSignalerSiMentionAnonymisee(obsBrute.texte, cheminObs + '.texte', anomalies);
    observations.push(bilanCreerObservationArgumentee({
      contenu: obsBrute.texte,
      axeLie: axeBrut.id,
      observationsFactuellesLiees: bilanListeDeChaines(obsBrute.observationsFactuellesLiees)
    }, obsIndex));
  });

  // pointsForts/pointsFaibles/incoherences/risques : entrees courtes et
  // isolees -- filtrage automatique sans risque (voir en-tete de fichier).
  // attentes : reconstruites apres coup, une fois observations ci-dessus
  // disponible (necessaire a la resolution texte -> id, voir
  // bilanReconstruireAttentes ci-dessus).
  var axe = bilanCreerResultatAxe({
    axeId: axeBrut.id,
    restitutionQualitative: axeBrut.restitutionQualitative,
    observationsArgumentees: observations,
    pointsForts: bilanFiltrerListeAnonymisee(bilanListeDeChaines(axeBrut.pointsForts), chemin + '.pointsForts', anomalies),
    pointsFaibles: bilanFiltrerListeAnonymisee(bilanListeDeChaines(axeBrut.pointsFaibles), chemin + '.pointsFaibles', anomalies),
    incoherences: bilanFiltrerListeAnonymisee(bilanListeDeChaines(axeBrut.incoherences), chemin + '.incoherences', anomalies),
    risques: bilanFiltrerListeAnonymisee(bilanListeDeChaines(axeBrut.risques), chemin + '.risques', anomalies),
    attentes: bilanReconstruireAttentes(axeBrut.attentes, chemin, axeBrut.id, observations, anomalies)
  });

  // Garde-fou final : reverifie via le validateur de modeles/, defense
  // en profondeur (meme principe que confidentialiteValidee, verifie a
  // la fois par l'orchestrateur et par diagnosticPromptBuilder).
  if (!bilanResultatAxeEstValide(axe)) {
    anomalies.push(bilanCreerAnomalie({ type: 'ValeurInvalide', chemin: chemin, detail: 'Axe reconstruit invalide malgré les vérifications préalables.' }));
    return { axe: null, anomalies: anomalies };
  }

  return { axe: axe, anomalies: anomalies };
}

// ---- Reconstruction d'une recommandation ----
// observationsResolubles : toutes les observations DEJA RECONSTRUITES
// disponibles pour resolution texte -> id (factuelles + argumentees de
// TOUS les axes, jamais restreint a un seul axe -- une recommandation
// peut porter sur plusieurs dimensions via dimensionsLiees, contrairement
// a une Attente qui reste dans son propre axe). Meme raisonnement que
// bilanResoudreObservationParTexte ci-dessus, meme fonction reutilisee :
// CORRECTION (bug reel trouve : "Une erreur est survenue, merci de
// réessayer" systematique sur "Ameliorer cette recommandation", quel que
// soit l'assistant IA choisi) -- avant ce correctif, recoBrute.observationsLiees
// etait stocke tel quel (bilanListeDeChaines, aucune resolution), alors
// que l’assistant ne recoit JAMAIS les id generes des observations (ni dans le
// schema du Prompt 1, ni dans bilanFormaterObservationsDeterministes qui
// n'envoie que obs.contenu) : le texte brut ecrit par l’assistant n'y
// correspondait donc jamais, et bilanConstruireDemandeAmelioration()
// (selectionAmeliorationManager.js) rejetait ensuite systematiquement la
// demande via RecommandationInexistante, avant meme d'appeler l’assistant du
// Prompt 2 -- d'ou l'echec identique quel que soit l'assistant choisi la.
function bilanReconstruireRecommandation(recoBrute, index, observationsResolubles) {
  var chemin = 'recommandations[' + index + ']';
  var anomalies = [];

  if (!recoBrute || typeof recoBrute !== 'object') {
    return { recommandation: null, anomalies: [bilanCreerAnomalie({ type: 'ValeurInvalide', chemin: chemin, detail: 'Entrée de recommandation absente ou non-objet.', valeurRecue: recoBrute })] };
  }
  if (!recoBrute.contenu) {
    return { recommandation: null, anomalies: [bilanCreerAnomalie({ type: 'ChampManquant', chemin: chemin + '.contenu', detail: 'contenu manquant.' })] };
  }
  // Recommandation courte et isolee (comme les listes, voir en-tete de
  // fichier) : une mention d'un element anonymise ecarte toute la
  // recommandation, jamais une reecriture partielle.
  var elementAnonymiseReco = bilanElementAnonymiseMentionne(recoBrute.contenu);
  if (elementAnonymiseReco) {
    return {
      recommandation: null,
      anomalies: [bilanCreerAnomalie({
        type: 'MentionElementAnonymiseFiltree',
        chemin: chemin + '.contenu',
        detail: 'Recommandation écartée : fait référence à "' + elementAnonymiseReco + '", volontairement absent du CV envoyé à l’assistant.',
        valeurRecue: recoBrute.contenu
      })]
    };
  }
  var dimensionsLiees = bilanListeDeChaines(recoBrute.dimensionsLiees);
  if (dimensionsLiees.length === 0) {
    return { recommandation: null, anomalies: [bilanCreerAnomalie({ type: 'ChampManquant', chemin: chemin + '.dimensionsLiees', detail: 'aucune dimension liée (invariant : jamais orpheline).' })] };
  }

  var observationsLiees = [];
  bilanListeDeChaines(recoBrute.observationsLiees).forEach(function (texteObs) {
    var idResolu = bilanResoudreObservationParTexte(texteObs, observationsResolubles);
    if (idResolu) {
      observationsLiees.push(idResolu);
    } else {
      anomalies.push(bilanCreerAnomalie({
        type: 'ReferenceInconnue',
        chemin: chemin + '.observationsLiees',
        detail: 'Aucune observation (factuelle ou argumentée, tous axes confondus) ne correspond exactement à ce texte.',
        valeurRecue: texteObs
      }));
    }
  });
  if (observationsLiees.length === 0) {
    anomalies.push(bilanCreerAnomalie({ type: 'ChampManquant', chemin: chemin + '.observationsLiees', detail: 'aucune observation liée résolue (invariant : jamais orpheline).' }));
    return { recommandation: null, anomalies: anomalies };
  }
  if (!bilanEnumEstValide(BILAN_PRIORITE_RECOMMANDATION, recoBrute.priorite)) {
    anomalies.push(bilanCreerAnomalie({ type: 'ValeurInvalide', chemin: chemin + '.priorite', detail: 'Valeur hors énumération.', valeurRecue: recoBrute.priorite }));
    return { recommandation: null, anomalies: anomalies };
  }

  var recommandation = bilanCreerRecommandation({
    id: (typeof recoBrute.id === 'string' && recoBrute.id) || bilanGenererId('reco'),
    contenu: recoBrute.contenu,
    dimensionsLiees: dimensionsLiees,
    priorite: recoBrute.priorite,
    extraitConcerne: (typeof recoBrute.extraitConcerne === 'string' && recoBrute.extraitConcerne) || null,
    observationsLiees: observationsLiees,
    // TACHE (Carte 3, ecran de preparation, 2026-08-28) : champ optionnel,
    // jamais requis -- une recommandation sans phrase a chiffrer reste valide.
    phraseAChiffrer: (typeof recoBrute.phraseAChiffrer === 'string' && recoBrute.phraseAChiffrer) || null
  });

  if (!bilanRecommandationEstValide(recommandation)) {
    anomalies.push(bilanCreerAnomalie({ type: 'ValeurInvalide', chemin: chemin, detail: 'Recommandation reconstruite invalide malgré les vérifications préalables.' }));
    return { recommandation: null, anomalies: anomalies };
  }

  return { recommandation: recommandation, anomalies: anomalies };
}

// ---- Reconstruction d'une alerte prioritaire ----
function bilanReconstruireAlerte(alerteBrute, index) {
  var chemin = 'alertesPrioritaires[' + index + ']';

  if (!alerteBrute || typeof alerteBrute !== 'object') {
    return { alerte: null, anomalies: [bilanCreerAnomalie({ type: 'ValeurInvalide', chemin: chemin, detail: 'Entrée d\'alerte absente ou non-objet.', valeurRecue: alerteBrute })] };
  }
  if (!alerteBrute.description) {
    return { alerte: null, anomalies: [bilanCreerAnomalie({ type: 'ChampManquant', chemin: chemin + '.description', detail: 'description manquante.' })] };
  }
  if (!bilanEnumEstValide(BILAN_TYPE_ALERTE, alerteBrute.type)) {
    return { alerte: null, anomalies: [bilanCreerAnomalie({ type: 'ValeurInvalide', chemin: chemin + '.type', detail: 'Type d\'alerte hors énumération.', valeurRecue: alerteBrute.type })] };
  }

  var alerte = bilanCreerAlertePrioritaire({
    id: (typeof alerteBrute.id === 'string' && alerteBrute.id) || undefined,
    type: alerteBrute.type,
    description: alerteBrute.description,
    dimensionLiee: (typeof alerteBrute.dimensionLiee === 'string' && alerteBrute.dimensionLiee) || null
  });

  if (!bilanAlertePrioritaireEstValide(alerte)) {
    return { alerte: null, anomalies: [bilanCreerAnomalie({ type: 'ValeurInvalide', chemin: chemin, detail: 'Alerte reconstruite invalide malgré les vérifications préalables.' })] };
  }

  return { alerte: alerte, anomalies: [] };
}

// ---- Reconstruction d'une dimension non évaluable ----
function bilanReconstruireDimensionNonEvaluable(dimBrute, index, idsAxesConnus) {
  var chemin = 'metaDiagnostic.dimensionsNonEvaluables[' + index + ']';

  if (!dimBrute || typeof dimBrute !== 'object' || !dimBrute.dimension || !dimBrute.donneeManquante) {
    return { dimension: null, anomalies: [bilanCreerAnomalie({ type: 'ChampManquant', chemin: chemin, detail: 'dimension ou donneeManquante manquante.', valeurRecue: dimBrute })] };
  }
  if (idsAxesConnus.indexOf(dimBrute.dimension) === -1) {
    return { dimension: null, anomalies: [bilanCreerAnomalie({ type: 'ReferenceInconnue', chemin: chemin + '.dimension', detail: 'id d\'axe inconnu du catalogue.', valeurRecue: dimBrute.dimension })] };
  }
  return { dimension: { dimension: dimBrute.dimension, donneeManquante: dimBrute.donneeManquante }, anomalies: [] };
}

// contexte : { catalogueAxes: Axe[], niveauEnvoye: number } -- niveauEnvoye
// sert a corriger silencieusement metaDiagnostic.niveauAnalyse : on ne
// fait jamais confiance a l’assistant pour reechoer une valeur qu'on connait deja
// avec certitude (voir CONTRATS.md, DiagnosticResultat).
// dependances : { extraireJSON } -- injectable, defaut = extraireBlocJSONDepuisTexte (js/app.js).
// Retourne { resultat: DiagnosticResultat, anomalies: Anomalie[] }.
// Leve ReponseIllisible ou ReponseIncomplete uniquement si RIEN
// d'exploitable ne peut etre reconstruit.
function bilanParserReponseDiagnostic(texteColle, contexte, dependances) {
  contexte = contexte || {};
  dependances = dependances || {};
  var catalogueAxes = contexte.catalogueAxes || [];
  var idsAxesConnus = catalogueAxes.map(function (axe) { return axe.id; });
  var extraireJSON = dependances.extraireJSON || (typeof extraireBlocJSONDepuisTexte === 'function' ? extraireBlocJSONDepuisTexte : null);

  if (typeof extraireJSON !== 'function') {
    throw bilanCreerErreurMetier('ReponseIllisible', 'Aucune fonction d\'extraction JSON disponible (ni injectée, ni globale).');
  }

  var extraction = extraireJSON(texteColle);
  if (!extraction) {
    throw bilanCreerErreurMetier('ReponseIllisible', 'Aucun bloc JSON identifiable dans le texte collé.');
  }

  // TACHE (retour Denis, 2026-08-31) : les assistants glissent des tirets
  // cadratins malgre la consigne du prompt -- filet de securite applicatif
  // (jamais un remplacement de la consigne), sur TOUT le texte reconstruit
  // ci-dessous. Applique avant toute reconstruction : chaque leaf est deja
  // propre. N'altere jamais la forme du JSON.
  extraction = bilanAssainirTypographieProfond(extraction);

  // TACHE (retour Denis, 2026-08-31, Chantier 4) : sortie de secours du prompt
  // quand le texte fourni n'est pas un CV analysable. Erreur metier dediee ->
  // l'appelant (app.js, handler d'import) affiche un ecran "ce texte ne
  // ressemble pas a un CV", jamais un message d'echec de format ni un rapport
  // vide.
  if (extraction.analyseImpossible === true) {
    throw bilanCreerErreurMetier('SaisieInexploitable',
      (typeof extraction.message === 'string' && extraction.message.trim())
        ? extraction.message.trim()
        : 'Le texte fourni ne permet pas de faire une analyse de candidature.',
      { analyseImpossible: true });
  }

  var syntheseValide = extraction.syntheseGenerale
    && typeof extraction.syntheseGenerale.resumeNarratif === 'string' && extraction.syntheseGenerale.resumeNarratif.trim()
    && bilanEnumEstValide(BILAN_STATUT_PREPARATION, extraction.syntheseGenerale.statutPreparation);
  if (!syntheseValide) {
    throw bilanCreerErreurMetier('ReponseIncomplete', 'syntheseGenerale absente ou invalide : rien d\'exploitable à présenter au candidat.', { syntheseGenerale: extraction.syntheseGenerale });
  }

  var anomalies = [];

  var axes = [];
  (Array.isArray(extraction.axes) ? extraction.axes : []).forEach(function (axeBrut, index) {
    var reconstruction = bilanReconstruireAxe(axeBrut, index, idsAxesConnus);
    if (reconstruction.axe) { axes.push(reconstruction.axe); }
    anomalies = anomalies.concat(reconstruction.anomalies);
  });

  // TACHE (correction bug "observationsLiees jamais resolues") : pool de
  // resolution texte -> id pour les recommandations, construit APRES les
  // axes (id reels deja generes) -- factuelles + argumentees de TOUS les
  // axes, meme combinaison que bilanRassemblerToutesLesObservations()
  // (amelioration/selectionAmeliorationManager.js) qui relira ces memes
  // id plus tard : les deux DOIVENT s'accorder, sinon le bug reapparait.
  var observationsResolubles = (contexte.observationsFactuelles || []).slice();
  axes.forEach(function (axe) {
    observationsResolubles = observationsResolubles.concat(axe.observationsArgumentees || []);
  });

  var recommandations = [];
  (Array.isArray(extraction.recommandations) ? extraction.recommandations : []).forEach(function (recoBrute, index) {
    var reconstruction = bilanReconstruireRecommandation(recoBrute, index, observationsResolubles);
    if (reconstruction.recommandation) { recommandations.push(reconstruction.recommandation); }
    anomalies = anomalies.concat(reconstruction.anomalies);
  });

  var alertesPrioritaires = [];
  (Array.isArray(extraction.alertesPrioritaires) ? extraction.alertesPrioritaires : []).forEach(function (alerteBrute, index) {
    var reconstruction = bilanReconstruireAlerte(alerteBrute, index);
    if (reconstruction.alerte) { alertesPrioritaires.push(reconstruction.alerte); }
    anomalies = anomalies.concat(reconstruction.anomalies);
  });

  var dimensionsNonEvaluables = [];
  var dimBrutes = (extraction.metaDiagnostic && Array.isArray(extraction.metaDiagnostic.dimensionsNonEvaluables)) ? extraction.metaDiagnostic.dimensionsNonEvaluables : [];
  dimBrutes.forEach(function (dimBrute, index) {
    var reconstruction = bilanReconstruireDimensionNonEvaluable(dimBrute, index, idsAxesConnus);
    if (reconstruction.dimension) { dimensionsNonEvaluables.push(reconstruction.dimension); }
    anomalies = anomalies.concat(reconstruction.anomalies);
  });

  // planAction : ne conserve que les id de recommandations reellement
  // reconstruites -- une reference vers une recommandation ecartee ne
  // doit jamais survivre silencieusement.
  var idsRecommandationsSurvivantes = recommandations.map(function (r) { return r.id; });
  var planAction = [];
  bilanListeDeChaines(extraction.planAction).forEach(function (id) {
    if (idsRecommandationsSurvivantes.indexOf(id) !== -1) {
      planAction.push(id);
    } else {
      anomalies.push(bilanCreerAnomalie({ type: 'ReferenceInconnue', chemin: 'planAction', detail: 'référence une recommandation absente ou écartée.', valeurRecue: id }));
    }
  });

  // niveauAnalyse : jamais la valeur echoee par l’assistant -- toujours celle
  // reellement envoyee, connue avec certitude cote application.
  if (contexte.niveauEnvoye !== undefined && extraction.metaDiagnostic && extraction.metaDiagnostic.niveauAnalyse !== contexte.niveauEnvoye) {
    anomalies.push(bilanCreerAnomalie({ type: 'ValeurInvalide', chemin: 'metaDiagnostic.niveauAnalyse', detail: 'Niveau annoncé par l’assistant différent du niveau réellement transmis ; valeur connue conservée.', valeurRecue: extraction.metaDiagnostic && extraction.metaDiagnostic.niveauAnalyse }));
  }

  // Invariant 7 (CONTRATS.md) : jamais 'pret' si une alerte prioritaire
  // survit la reconstruction. Ne jamais presenter un statut optimiste
  // contradictoire au candidat -- corrige vers le plus prudent des deux
  // (a_retravailler), jamais l'inverse, et consigne l'anomalie plutot
  // que de la laisser passer silencieusement.
  var statutPreparationFinal = extraction.syntheseGenerale.statutPreparation;
  if (statutPreparationFinal === 'pret' && alertesPrioritaires.length > 0) {
    anomalies.push(bilanCreerAnomalie({ type: 'ValeurInvalide', chemin: 'syntheseGenerale.statutPreparation', detail: 'Annoncé "pret" alors que des alertes prioritaires existent (invariant 7) ; corrigé en "a_retravailler".', valeurRecue: 'pret' }));
    statutPreparationFinal = 'a_retravailler';
  }

  // Prose libre (voir en-tete de fichier) : jamais modifiee, seulement
  // signalee -- mesure la frequence reelle du cas malgre la consigne du
  // prompt, sans jamais risquer d'abimer un paragraphe par ailleurs sain.
  var texteResumeNarratif = extraction.syntheseGenerale.resumeNarratif;
  var textePremiereImpression = (extraction.premiereImpression && extraction.premiereImpression.texte) || '';
  var texteCeQuiDonneEnvie = (extraction.ceQuiDonneEnvie && extraction.ceQuiDonneEnvie.texte) || '';
  var texteCeQuiPeutFreiner = (extraction.ceQuiPeutFreiner && extraction.ceQuiPeutFreiner.texte) || '';
  var texteProjectionRecruteur = (extraction.syntheseProjectionRecruteur && extraction.syntheseProjectionRecruteur.texte) || '';
  bilanSignalerSiMentionAnonymisee(texteResumeNarratif, 'syntheseGenerale.resumeNarratif', anomalies);
  bilanSignalerSiMentionAnonymisee(textePremiereImpression, 'premiereImpression.texte', anomalies);
  bilanSignalerSiMentionAnonymisee(texteCeQuiDonneEnvie, 'ceQuiDonneEnvie.texte', anomalies);
  bilanSignalerSiMentionAnonymisee(texteCeQuiPeutFreiner, 'ceQuiPeutFreiner.texte', anomalies);
  bilanSignalerSiMentionAnonymisee(texteProjectionRecruteur, 'syntheseProjectionRecruteur.texte', anomalies);

  var resultat = bilanCreerDiagnosticResultat({
    metaDiagnostic: {
      niveauAnalyse: contexte.niveauEnvoye !== undefined ? contexte.niveauEnvoye : (extraction.metaDiagnostic && extraction.metaDiagnostic.niveauAnalyse),
      dimensionsNonEvaluables: dimensionsNonEvaluables
    },
    alertesPrioritaires: alertesPrioritaires,
    syntheseGenerale: {
      statutPreparation: statutPreparationFinal,
      resumeNarratif: texteResumeNarratif
    },
    premiereImpression: { texte: textePremiereImpression },
    ceQuiDonneEnvie: { texte: texteCeQuiDonneEnvie },
    ceQuiPeutFreiner: { texte: texteCeQuiPeutFreiner },
    axes: axes,
    recommandations: recommandations,
    planAction: planAction,
    syntheseProjectionRecruteur: { texte: texteProjectionRecruteur }
  });

  return { resultat: resultat, anomalies: anomalies };
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanParserReponseDiagnostic: bilanParserReponseDiagnostic,
    bilanReconstruireAxe: bilanReconstruireAxe,
    bilanReconstruireAttentes: bilanReconstruireAttentes,
    bilanResoudreObservationParTexte: bilanResoudreObservationParTexte,
    bilanReconstruireRecommandation: bilanReconstruireRecommandation,
    bilanReconstruireAlerte: bilanReconstruireAlerte,
    bilanReconstruireDimensionNonEvaluable: bilanReconstruireDimensionNonEvaluable,
    bilanFiltrerListeAnonymisee: bilanFiltrerListeAnonymisee,
    bilanSignalerSiMentionAnonymisee: bilanSignalerSiMentionAnonymisee
  };
}
