/* ============================================================
   modules/cv-core/moteurDecisionCV.js
   ------------------------------------------------------------
   MOTEUR DE DECISION DE CANDIDATURE, sorti de js/app.js (C5, 2026-09-26) pour pouvoir etre TESTE en Node (tests/moteurDecisionCV.test.js) :
   la cause A de la perte d'informations du 26/09 (experiences ajoutees a la main absentes du CV) se trouvait dans ce moteur, que
   les tests ne pouvaient pas charger. Le code est deplace TEL QUEL (aucune logique modifiee) ; il reste global (charge par une
   balise <script> AVANT js/app.js, avec les memes noms de fonctions).
   Contenu : fonctions pures de comparaison (normaliserPourComparaison, texteExisteDeja, estDoublonProbable), moteur generique
   (decider...), classement des competences, appliquerMoteurDecisionCV().
   Depend, AU MOMENT DE L'APPEL, de : correspond / normaliserTexte / metierParNom (data/metiers.js), SPECIFICATION_IMPORT (js/app.js),
   et de la variable globale « dossier » (lecture seule, reaffichage des rubriques masquees).
   ============================================================ */

// Compare deux chaines en ignorant casse/espaces superflus -- jamais une
// egalite stricte de chaines brutes, pour eviter des faux "nouveaux"
// evidents (ex. "Excel" vs "excel ").
function normaliserPourComparaison(texte) {
  return (texte || '').toString().trim().toLowerCase();
}

// Un element de liste (dossier.certifications, logiciels...) existe-t-il
// deja, a la casse/espaces pres ?
function texteExisteDeja(liste, texte) {
  var t = normaliserPourComparaison(texte);
  if (!t) { return false; }
  return (liste || []).some(function (e) { return normaliserPourComparaison(e) === t; });
}

// Deux elements structures (une experience, une formation...) sont-ils un
// doublon PROBABLE ? Compare uniquement les champs de rapprochement
// declares dans la specification (jamais tous les champs) -- toujours une
// heuristique, jamais une certitude (voir §9 du document d'architecture).
// Exige qu'au moins un champ compare soit non vide, pour ne jamais
// rapprocher deux elements entierement vides entre eux.
function estDoublonProbable(existant, propose, champsRapprochement) {
  if (!champsRapprochement || champsRapprochement.length === 0) { return false; }
  var auMoinsUnChampNonVide = false;
  var tousCorrespondent = champsRapprochement.every(function (champ) {
    var a = normaliserPourComparaison(existant[champ]);
    var b = normaliserPourComparaison(propose[champ]);
    if (b) { auMoinsUnChampNonVide = true; }
    return a === b;
  });
  return auMoinsUnChampNonVide && tousCorrespondent;
}

// ============================================================
// MOTEUR DE DECISION DE CANDIDATURE (Tache 3, coeur generique)
// ------------------------------------------------------------
// Conforme a docs/ARCHITECTURE_MOTEUR_DECISION_CANDIDATURE.md. Ce moteur
// ne connait AUCUN support de candidature (jamais le mot "CV") -- il ne
// fait que selectionner, ordonner et masquer, a partir de ce qui existe
// deja dans dossier et des recommandations deja produites par l’assistant.
//
// Reutilise deux fonctions deja construites pour le moteur d'import,
// jamais dupliquees :
// - normaliserPourComparaison() : comparaison de texte insensible a la
//   casse/aux espaces (categories 'liste-textes')
// - estDoublonProbable() : rapprochement flou sur les champs declares dans
//   "champsRapprochement" de SPECIFICATION_IMPORT (categories 'liste-objets')
//
// IMPORTANT (Tache 3, construction et tests via donnees synthetiques
// uniquement) : ce moteur ne sait pas, et n'a pas besoin de savoir, que
// "competence" ou "poste"/"entreprise" sont les noms de champs utilises
// par le prompt CV V2. Il attend une forme deja normalisee en entree :
// - pour une categorie 'liste-textes' : [{ texte: "...", justification: "..." }]
// - pour une categorie 'liste-objets' : [{ ...memes champs que champsRapprochement, justification: "..." }]
// La traduction depuis la forme brute de dossier.ia.cv.recommandations
// (avec ses noms de champs propres au CV) est une responsabilite du CV
// (Tache 4), jamais de ce moteur.
// ============================================================

// La rubrique "cle" (ex. 'experiences') est-elle explicitement demandee
// comme masquable par l’assistant ? Recherche insensible a la casse, sur le nom
// de rubrique tel qu'ecrit par l’assistant (dossier.ia.cv.recommandations.rubriquesMasquables).
function rubriqueEstMasquee(rubriquesMasquables, nomCategorie) {
  var cible = normaliserPourComparaison(nomCategorie);
  return (rubriquesMasquables || []).some(function (r) { return normaliserPourComparaison(r.rubrique) === cible; });
}
function explicationMasquageRubrique(rubriquesMasquables, nomCategorie) {
  var cible = normaliserPourComparaison(nomCategorie);
  var trouve = (rubriquesMasquables || []).filter(function (r) { return normaliserPourComparaison(r.rubrique) === cible; })[0];
  return trouve ? trouve.justification : '';
}

// Decision pour une categorie de type 'liste-textes' (ex. competences,
// certifications, logiciels, loisirs, engagements, langues si traitees
// comme telles). Classe (recommandes d'abord, dans l'ordre de l’assistant, puis
// le reste du dossier), deduplique, plafonne -- chaque element, retenu ou
// exclu, porte une explication (§7 de l'architecture).
function deciderListeTextes(elementsDossier, recommandations, capacite) {
  var elementsOrdonnes = [];
  var dejaTraites = [];

  (recommandations || []).forEach(function (reco) {
    var texteReco = normaliserPourComparaison(reco.texte);
    if (!texteReco) { return; }
    var correspondance = (elementsDossier || []).filter(function (e) {
      return normaliserPourComparaison(e) === texteReco && dejaTraites.indexOf(normaliserPourComparaison(e)) === -1;
    })[0];
    if (correspondance !== undefined) {
      elementsOrdonnes.push({ element: correspondance, explication: reco.justification || 'Recommandé par l\'assistant.' });
      dejaTraites.push(normaliserPourComparaison(correspondance));
    }
  });

  (elementsDossier || []).forEach(function (e) {
    var norm = normaliserPourComparaison(e);
    if (dejaTraites.indexOf(norm) === -1) {
      elementsOrdonnes.push({ element: e, explication: 'Présent dans votre dossier, aucune recommandation spécifique de l’assistant.' });
      dejaTraites.push(norm);
    }
  });

  var capaciteEffective = (typeof capacite === 'number') ? capacite : elementsOrdonnes.length;
  var elementsRetenus = elementsOrdonnes.slice(0, capaciteEffective);
  var elementsExclus = elementsOrdonnes.slice(capaciteEffective).map(function (e) {
    return { element: e.element, explication: 'Non retenu par manque de place (capacité atteinte pour cette rubrique).' };
  });

  return { elementsRetenus: elementsRetenus, elementsExclus: elementsExclus };
}

// Meme principe pour une categorie de type 'liste-objets' (ex.
// experiences, formations, langues) -- le rapprochement recommandation
// <-> element du dossier se fait via estDoublonProbable() et
// champsRapprochement, pas via une egalite de texte simple.
function deciderListeObjets(elementsDossier, recommandations, champsRapprochement, capacite) {
  var elementsOrdonnes = [];
  var indicesTraites = [];

  (recommandations || []).forEach(function (reco) {
    var indexTrouve = -1;
    (elementsDossier || []).forEach(function (e, i) {
      if (indexTrouve === -1 && indicesTraites.indexOf(i) === -1 && estDoublonProbable(e, reco, champsRapprochement)) {
        indexTrouve = i;
      }
    });
    if (indexTrouve !== -1) {
      elementsOrdonnes.push({ element: elementsDossier[indexTrouve], explication: reco.justification || 'Recommandé par l\'assistant.' });
      indicesTraites.push(indexTrouve);
    }
  });

  (elementsDossier || []).forEach(function (e, i) {
    if (indicesTraites.indexOf(i) === -1) {
      elementsOrdonnes.push({ element: e, explication: 'Présent dans votre dossier, aucune recommandation spécifique de l’assistant.' });
      indicesTraites.push(i);
    }
  });

  var capaciteEffective = (typeof capacite === 'number') ? capacite : elementsOrdonnes.length;
  var elementsRetenus = elementsOrdonnes.slice(0, capaciteEffective);
  var elementsExclus = elementsOrdonnes.slice(capaciteEffective).map(function (e) {
    return { element: e.element, explication: 'Non retenu par manque de place (capacité atteinte pour cette rubrique).' };
  });

  return { elementsRetenus: elementsRetenus, elementsExclus: elementsExclus };
}

// Point d'entree unique du moteur (interface publique, §12 de l'architecture).
// Fonction PURE : ne modifie jamais dossier, ne lit jamais le DOM, aucun
// effet de bord. Ignore silencieusement toute categorie de
// specificationCategories qui ne serait pas 'liste-textes' ou
// 'liste-objets' (identite, permis, competences en tant
// qu'objet-de-listes-textes... restent hors perimetre, §9 de l'architecture).
function decider(dossier, recommandationsParCategorie, capacites, specificationCategories) {
  var recos = recommandationsParCategorie || {};
  var rubriquesMasquables = recos.rubriquesMasquables || [];
  var resultat = {};

  (specificationCategories || []).forEach(function (spec) {
    if (spec.type !== 'liste-textes' && spec.type !== 'liste-objets') { return; }

    var elementsDossier = (dossier && dossier[spec.cle]) || [];
    var recommandationsCategorie = recos[spec.cle] || [];
    var capaciteCategorie = capacites ? capacites[spec.cle] : undefined;

    var decision = (spec.type === 'liste-textes')
      ? deciderListeTextes(elementsDossier, recommandationsCategorie, capaciteCategorie)
      : deciderListeObjets(elementsDossier, recommandationsCategorie, spec.champsRapprochement, capaciteCategorie);

    decision.rubriqueMasquee = rubriqueEstMasquee(rubriquesMasquables, spec.cle);
    decision.explicationMasquage = decision.rubriqueMasquee ? explicationMasquageRubrique(rubriquesMasquables, spec.cle) : '';

    resultat[spec.cle] = decision;
  });

  return resultat;
}

// ============================================================
// INTEGRATION CV DU MOTEUR DE DECISION (Tache 4)
// ------------------------------------------------------------
// Tout ce qui suit est volontairement CV-specifique (§9 de l'architecture) :
// decider() lui-meme, ci-dessus, ne connait toujours pas le mot "CV". Cette
// couche fait deux choses que le moteur generique ne doit jamais faire :
// 1. Traduire dossier.ia.cv.recommandations (noms de champs propres au
//    prompt CV : "competence", "poste"/"entreprise", "rubrique") vers la
//    forme generique attendue par decider() ({texte, justification} ou
//    {...champsRapprochement, justification}).
// 2. Traiter le cas particulier des competences (savoirFaire/savoirEtre/
//    savoirs), qui n'est pas une simple 'liste-textes' mais un objet de
//    3 listes -- non gere par decider() (hors perimetre, §9). La capacite
//    du modele pour "competences" est traitee comme un budget PARTAGE
//    entre les 3 sous-categories, pas un plafond independant par
//    sous-categorie (sinon "6 competences" pourrait afficher jusqu'a 18
//    elements au total).
// ============================================================

// TACHE (retour utilisateur : plafond de competences) : remplace
// appliquerDecisionCompetences() (budget PARTAGE entre les 3 sous-listes,
// et actif seulement si l’assistant a donne des recommandations). Nouvelle regle
// explicite : 5 maximum PAR categorie (savoirFaire/savoirEtre/savoirs),
// TOUJOURS applique -- avec ou sans recommandation IA. Ordre de priorite :
// 1) recommandations de l’assistant (deja au fait du metier vise) ; 2) a defaut,
// les competences presentes dans baseMetiers pour le metier
// cible (deja existant, aucune donnee inventee) ; 3) le reste, dans l'ordre
// du dossier. Les competences non retenues ne sont pas perdues : elles
// restent dans dossier et continuent d'alimenter texteProfil() (donc l’assistant
// et la lettre de motivation), seule la rubrique "Competences" du CV rendu
// est plafonnee.
function classerCompetencesParPertinence(competencesObjetCV, recommandationsCompetences, metierCible, plafondParCategorie) {
  // TACHE (chantier langue francaise, tolerance accent/sans-accent) :
  // motsEquivalentsSansAccentERIP() (data/toleranceOrthographiqueERIP.js)
  // remplace une comparaison stricte (m.nom === metierCible) -- evite une
  // correspondance manquee si l'un des deux cote est accentue et l'autre
  // pas encore mis a jour.
  var metierRef = ((typeof baseMetiers !== 'undefined' && baseMetiers) || []).filter(function (m) { return motsEquivalentsSansAccentERIP(m.nom, metierCible); })[0] || null;

  function ordonnerCategorie(sousCle) {
    var elements = (competencesObjetCV[sousCle] || []).slice();
    var dejaTraites = [];
    var ordonnes = [];

    (recommandationsCompetences || []).forEach(function (reco) {
      var texteReco = normaliserPourComparaison(reco.texte);
      if (!texteReco) { return; }
      var trouve = elements.filter(function (e) {
        return normaliserPourComparaison(e) === texteReco && dejaTraites.indexOf(normaliserPourComparaison(e)) === -1;
      })[0];
      if (trouve !== undefined) { ordonnes.push(trouve); dejaTraites.push(normaliserPourComparaison(trouve)); }
    });

    if (metierRef && metierRef[sousCle]) {
      var referentielNorm = metierRef[sousCle].map(normaliserPourComparaison);
      elements.forEach(function (e) {
        var norm = normaliserPourComparaison(e);
        if (dejaTraites.indexOf(norm) === -1 && referentielNorm.indexOf(norm) !== -1) {
          ordonnes.push(e); dejaTraites.push(norm);
        }
      });
    }

    elements.forEach(function (e) {
      var norm = normaliserPourComparaison(e);
      if (dejaTraites.indexOf(norm) === -1) { ordonnes.push(e); dejaTraites.push(norm); }
    });

    return ordonnes.slice(0, plafondParCategorie);
  }

  return {
    savoirFaire: ordonnerCategorie('savoirFaire'),
    savoirEtre: ordonnerCategorie('savoirEtre'),
    savoirs: ordonnerCategorie('savoirs')
  };
}

// TACHE (retour utilisateur : une seule categorie "Compétences
// professionnelles", plafond uniforme a 5, tous les modeles sauf Chic) :
// meme principe que classerCompetencesParPertinence() ci-dessus
// (recommandations IA en priorite, puis referentiel du metier vise, puis
// le reste), mais sur un SEUL pool fusionne (savoirFaire+savoirEtre+savoirs)
// au lieu de 3 plafonds separes. Resultat entierement place dans
// savoirFaire (savoirEtre/savoirs vides) : tous les generateurs de CV
// existants concatenent deja les 3 champs a l'affichage (verifie sur les
// 6 gabarits) -- aucune modification necessaire de leur cote, la fusion
// se fait silencieusement en amont.
function unifierEtPlafonnerCompetences(competencesObjetCV, recommandationsCompetences, metierCible, plafondTotal) {
  var metierRef = ((typeof baseMetiers !== 'undefined' && baseMetiers) || []).filter(function (m) { return motsEquivalentsSansAccentERIP(m.nom, metierCible); })[0] || null;
  var pool = []
    .concat((competencesObjetCV && competencesObjetCV.savoirFaire) || [])
    .concat((competencesObjetCV && competencesObjetCV.savoirEtre) || [])
    .concat((competencesObjetCV && competencesObjetCV.savoirs) || []);

  var dejaTraites = [];
  var ordonnes = [];

  (recommandationsCompetences || []).forEach(function (reco) {
    var texteReco = normaliserPourComparaison(reco.texte);
    if (!texteReco) { return; }
    var trouve = pool.filter(function (e) {
      return normaliserPourComparaison(e) === texteReco && dejaTraites.indexOf(normaliserPourComparaison(e)) === -1;
    })[0];
    if (trouve !== undefined) { ordonnes.push(trouve); dejaTraites.push(normaliserPourComparaison(trouve)); }
  });

  if (metierRef) {
    var referentielNorm = []
      .concat(metierRef.savoirFaire || [])
      .concat(metierRef.savoirEtre || [])
      .concat(metierRef.savoirs || [])
      .map(normaliserPourComparaison);
    pool.forEach(function (e) {
      var norm = normaliserPourComparaison(e);
      if (dejaTraites.indexOf(norm) === -1 && referentielNorm.indexOf(norm) !== -1) {
        ordonnes.push(e); dejaTraites.push(norm);
      }
    });
  }

  pool.forEach(function (e) {
    var norm = normaliserPourComparaison(e);
    if (dejaTraites.indexOf(norm) === -1) { ordonnes.push(e); dejaTraites.push(norm); }
  });

  return { savoirFaire: ordonnes.slice(0, plafondTotal), savoirEtre: [], savoirs: [] };
}

// TACHE 4 : point d'entree CV-specifique. Prend l'objet CV DEJA normalise
// (normaliserDonneesCV(dossier)) et retourne un NOUVEL objet, pret pour
// rendreTemplate() -- ne modifie jamais l'objet recu en entree (copie
// defensive), conforme au principe de fonction pure deja suivi partout
// ailleurs dans ce moteur.
// TACHE (ajustement : moteur conditionnel, pas systematique) : distingue
// "l'objet recommandations existe" (toujours vrai, il est scaffolde des
// la creation du dossier -- voir creerDossierIAVide()) de "l’assistant a
// reellement produit quelque chose d'exploitable". Seul ce second cas doit
// declencher le moteur de decision -- sinon, le comportement historique
// (tout afficher, aucune selection automatique) doit rester inchange.
function recommandationsIAPresentes(recommandations) {
  if (!recommandations) { return false; }
  return !!(recommandations.typeCV && recommandations.typeCV.valeur) ||
    (recommandations.experiencesAMettreEnAvant || []).length > 0 ||
    (recommandations.competencesAValoriser || []).length > 0 ||
    (recommandations.rubriquesMasquables || []).length > 0;
}

function appliquerMoteurDecisionCV(objetCV, recommandationsIA, capacitesModele) {
  var reco = recommandationsIA || {};
  var capacites = capacitesModele || {};

  // Traduction des recommandations brutes du CV vers la forme generique.
  var rubriquesMasquables = reco.rubriquesMasquables || [];
  var recommandationsGenerique = {
    experiences: (reco.experiencesAMettreEnAvant || []).map(function (r) {
      return { poste: r.poste, entreprise: r.entreprise, justification: r.justification };
    }),
    rubriquesMasquables: rubriquesMasquables
  };

  // TACHE (aucune anticipation artificielle) : le prompt CV V2 ne produit
  // aujourd'hui de recommandations que pour experiences et competences.
  // formations/langues/certifications/loisirs/engagements passent donc par
  // decider() avec une liste de recommandations vide -- repli honnete
  // (§5 de l'architecture), pas une erreur.
  var specification = [
    { cle: 'experiences', type: 'liste-objets', champsRapprochement: ['poste', 'entreprise'] },
    { cle: 'formations', type: 'liste-objets', champsRapprochement: ['intitule', 'annee'] },
    { cle: 'langues', type: 'liste-objets', champsRapprochement: ['langue'] },
    { cle: 'certifications', type: 'liste-textes' },
    { cle: 'loisirs', type: 'liste-textes' },
    { cle: 'engagements', type: 'liste-textes' }
  ];

  var decisions = decider(objetCV, recommandationsGenerique, capacites, specification);

  // TACHE (retour utilisateur : langues disparaissant du CV alors que
  // saisies) : cause identifiee -- rubriquesMasquables (recommandation IA)
  // pouvait vider entierement "langues" pour une candidature jugee sans
  // rapport, sans aucune trace visible pour la personne. Une langue est
  // une information quasiment toujours valorisable (jamais un handicap) :
  // elle n'est desormais plus jamais masquable par ce moteur, quoi que
  // l’assistant recommande -- seul le plafond normal (capacites.langues) continue
  // de s'appliquer, comme pour toute autre rubrique.
  if (decisions.langues) { decisions.langues.rubriqueMasquee = false; }
  // TACHE (retour utilisateur : "j'ai perdu complètement... LOISIRS" --
  // pas une régression de mes correctifs récents, vérifié, mais un
  // mécanisme réel : l’assistant peut masquer une rubrique entière via
  // rubriquesMasquables. Loisirs n'avait pas la même protection que
  // Langues ("presque toujours un atout") -- ajoutée ici, d'autant plus
  // nécessaire maintenant que les compétences personnelles (plus bas)
  // ont besoin des loisirs comme matière première.
  if (decisions.loisirs) { decisions.loisirs.rubriqueMasquee = false; }

  // Copie defensive : objetCV (deja normalise) n'est jamais modifie.
  var objetDecide = {};
  Object.keys(objetCV).forEach(function (cle) { objetDecide[cle] = objetCV[cle]; });

  // C3 : les rubriques masquees par l'assistant sont listees (avec ce qu'elles contenaient) et la personne peut les reafficher
  // (dossier.rubriquesReaffichees), au lieu de disparaitre sans un mot.
  var reaffichees = (typeof dossier !== 'undefined' && dossier && dossier.rubriquesReaffichees) || [];
  var masqueesParAssistant = [];
  specification.forEach(function (spec) {
    var d = decisions[spec.cle];
    if (!d) { return; }
    var reaffichee = reaffichees.indexOf(spec.cle) !== -1;
    if (d.rubriqueMasquee && (d.elementsRetenus || []).length) {
      masqueesParAssistant.push({ cle: spec.cle, nb: d.elementsRetenus.length, explication: d.explicationMasquage || '', reaffichee: reaffichee });
    }
    objetDecide[spec.cle] = (d.rubriqueMasquee && !reaffichee) ? [] : d.elementsRetenus.map(function (e) { return e.element; });
  });
  objetDecide.rubriquesMasqueesParAssistant = masqueesParAssistant;

  // TACHE (chantier "exp perso", étape 6 ; reprise pour les missions de
  // formation) : jointure d'une liste de missions IA en une seule chaine
  // -- un seul point final exact par mission, jamais de double
  // ponctuation, meme convention que savoirFaireParExperience. Fonction
  // PARTAGEE entre formationRetenue (juste en dessous) et
  // experiencePersonnelleAMettreEnAvant (plus bas) -- jamais deux
  // mecanismes de jointure de missions a maintenir en parallele.
  // TACHE (audit "mise en page", 2026-09-28, bug reel confirme : missions
  // affichees "entassees" en un seul bloc, non selectionnables une par une,
  // meme cause que joindreMissionsImport, js/app.js) : une mission par
  // LIGNE, jamais jointes en un paragraphe -- le panneau de mise en page
  // (cvPdfCartesMaquette.js) et le rendu (_pdfDecouperMissions) font tous
  // les deux confiance a un '\n' entre 2 missions.
  function _joindreMissionsIA(missionsBrutes) {
    var nettoyees = (missionsBrutes || [])
      .map(function (m) { return (m || '').trim().replace(/\.+\s*$/, ''); })
      .filter(Boolean);
    return nettoyees.length ? nettoyees.map(function (m) { return m + '.'; }).join('\n') : '';
  }

  // TACHE (retour utilisateur : "CV Complet" / "CV Optimise") : la reduction
  // a une seule formation (point 11 ci-dessous) et une seule/deux
  // certifications (point 12 plus bas) ne s'applique desormais QUE si la
  // personne a explicitement active "CV Optimise" (dossier.cvOptimiseActif,
  // false par defaut = CV Complet) -- avant ce reglage, ce narrowing etait
  // TOUJOURS applique des qu'une recommandation IA existait, faisant
  // disparaitre silencieusement les formations/certifications non
  // retenues, meme pour qui voulait les garder toutes (ex. un CAP
  // Maconnerie utile pour ses heures de maths, meme vise vers un metier
  // sans rapport). objetDecide.formations/certifications restent donc la
  // liste COMPLETE (deja plafonnee par capacites plus haut) tant que ce
  // reglage n'est pas active.
  // TACHE (retour utilisateur : "si Formations est mis en avant comme
  // point fort, toutes les formations/certifications restent visibles,
  // la plus pertinente est developpee -- meme sans activer CV Optimise")
  // : detection cross-format -- Word expose ce choix dans son systeme
  // "bloc mis en avant" existant (blocMisEnAvant==='formationLangues' en
  // 1 colonne, blocMisEnAvantDroite==='formations' en 2 colonnes -- 2 id
  // differents pour la meme intention, jamais unifies cote Word) ; le PDF
  // n'a AUCUN equivalent generique (verifie), un reglage dedie et cible a
  // donc ete ajoute la-bas (dossier.pdfReglages.regFormationsMisesEnAvant,
  // voir cvPdfPanneauReglages.js) plutot que de cloner tout le systeme
  // Word. Cette mise en avant prend le dessus sur "CV Optimise" des
  // qu'elle est active, quel que soit l'etat de ce dernier (voir les 2
  // usages de cette variable juste plus bas).
  var formationsMisesEnAvant = !!(
    (typeof etatApercuInline !== 'undefined' && etatApercuInline.cv && etatApercuInline.cv.reglagesProjetXXL &&
      (etatApercuInline.cv.reglagesProjetXXL.blocMisEnAvant === 'formationLangues' ||
       etatApercuInline.cv.reglagesProjetXXL.blocMisEnAvantDroite === 'formations')) ||
    (dossier.pdfReglages && dossier.pdfReglages.regFormationsMisesEnAvant)
  );

  // TACHE (cv.md, point 11) : formationRetenue -- ne garde que la
  // formation designee par l’assistant comme la plus elevee, si elle correspond
  // (rapprochement flou sur l'intitule, meme fonction correspond() que
  // pour les experiences) a une formation reelle du dossier. Si l’assistant n'a
  // rien recommande, ou si aucune formation ne correspond, objetDecide.formations
  // reste inchange (deja plafonne par capacites plus haut) -- repli
  // silencieux, jamais un plantage ni une formation inventee.
  var formationRetenue = reco.formationRetenue || {};
  if ((dossier.cvOptimiseActif || formationsMisesEnAvant) && formationRetenue.intitule && objetDecide.formations && objetDecide.formations.length) {
    var formationTrouvee = objetDecide.formations.filter(function (f) {
      return f.intitule && correspond(f.intitule, formationRetenue.intitule);
    })[0];
    if (formationTrouvee) {
      // TACHE (missions de formation) : jusqu'a 10 missions reformulees/
      // deduites par l’assistant (cv.md, point 11), reduites a 5 au maximum par
      // la personne dans l'ecran de revision (voir wireEcranChoixReponseIACV) --
      // injectees dans la formation retenue -- le rendu (composeurRender.js,
      // rubrique 'formations') sait deja afficher f.missions en puces des
      // lors qu'elles existent, TOUJOURS desormais (harmonise avec le PDF,
      // deja inconditionnel), meme convention de ponctuation que le reste
      // (_joindreMissionsIA, partagee avec experiencePersonnelleAMettreEnAvant
      // plus bas).
      var texteMissionsFormationRetenue = _joindreMissionsIA(formationRetenue.missions);
      var formationAvecMissions = formationTrouvee;
      if (texteMissionsFormationRetenue) {
        formationAvecMissions = {};
        Object.keys(formationTrouvee).forEach(function (k) { formationAvecMissions[k] = formationTrouvee[k]; });
        formationAvecMissions.missions = texteMissionsFormationRetenue;
      }
      if (dossier.cvOptimiseActif && !formationsMisesEnAvant) {
        // Mode Optimise "normal" : narrowing habituel, une seule formation.
        objetDecide.formations = [formationAvecMissions];
      } else {
        // TACHE (retour utilisateur) : Formations mis en avant -- jamais de
        // narrowing, la formation retenue est simplement enrichie DANS la
        // liste complete (jamais retiree ni dupliquee), toutes les autres
        // restent visibles telles quelles.
        objetDecide.formations = objetDecide.formations.map(function (f) {
          return f === formationTrouvee ? formationAvecMissions : f;
        });
      }
    }
  }

  // TACHE (retour Denis, chantier "Formations" 2026-09-28 : "je veux que
  // toutes les formations soient visibles et toutes les formations auront
  // des missions", meme comportement que l'experience personnelle/
  // engagements) : cv.md point 18 redige des missions pour CHAQUE formation
  // du profil (pas seulement la plus elevee comme formationRetenue
  // ci-dessus) -- applique ICI, APRES formationRetenue, pour que ce point
  // 18 (plus specifique, dedie a toutes les formations) ait le dernier mot
  // si les deux visent la meme formation. JAMAIS conditionne par
  // dossier.cvOptimiseActif/formationsMisesEnAvant (contrairement au bloc
  // ci-dessus) : Denis veut des missions disponibles par defaut pour
  // toutes les formations, la personne choisit ensuite lesquelles garder
  // et combien de missions dans le panneau (carte "Formations").
  var formationsAvecMissions = reco.formationsAvecMissions || [];
  if (formationsAvecMissions.length && objetDecide.formations && objetDecide.formations.length) {
    objetDecide.formations = objetDecide.formations.map(function (f) {
      var propose = f.intitule && formationsAvecMissions.filter(function (fm) { return fm.intitule && correspond(f.intitule, fm.intitule); })[0];
      var texteMissionsForm = propose && _joindreMissionsIA(propose.missions);
      if (!texteMissionsForm) { return f; }
      var copieForm = {};
      Object.keys(f).forEach(function (k) { copieForm[k] = f[k]; });
      copieForm.missions = texteMissionsForm;
      return copieForm;
    });
  }

  // TACHE (missions de loisir, cv.md point 16 : "un loisir mis en avant --
  // gagné un tournoi, fait le tour du monde -- ça vaut le coup d'être
  // valorisé") : contrairement a formations (objets), objetDecide.loisirs
  // reste un tableau de simples CHAINES (decision explicite et frozen,
  // voir CONFIG_LOISIRS -- jamais restructure, utilise tel quel dans trop
  // d'endroits). Impossible d'accrocher .missions sur une chaine : le
  // loisir retenu est donc expose a PART, sur objetDecide.loisirRetenu
  // (jamais dans objetDecide.loisirs lui-meme, qui reste inchange) --
  // composeurComposition.js/composeurRender.js lisent ce champ separement
  // pour dessiner CE loisir differemment des autres, uniquement quand
  // "Centre d'interet" est le bloc mis en avant (voir leur propre
  // commentaire).
  var loisirRetenu = reco.loisirRetenu || {};
  objetDecide.loisirRetenu = null;
  if (loisirRetenu.intitule && objetDecide.loisirs && objetDecide.loisirs.length) {
    var loisirTrouve = objetDecide.loisirs.filter(function (l) { return l && correspond(l, loisirRetenu.intitule); })[0];
    if (loisirTrouve) {
      var texteMissionsLoisirRetenu = _joindreMissionsIA(loisirRetenu.missions);
      if (texteMissionsLoisirRetenu) {
        objetDecide.loisirRetenu = { intitule: loisirTrouve, missions: texteMissionsLoisirRetenu };
      }
    }
  }

  // TACHE (cv.md, point 12) : certificationsAMettreEnAvant -- meme
  // principe, mais certifications est une liste de simples CHAINES (pas
  // d'objets), donc rapprochement direct texte a texte. Conserve l'ORDRE
  // de la recommandation IA (la plus pertinente en premier), jamais
  // l'ordre du dossier.
  // TACHE (retour utilisateur) : les certifications restent TOUJOURS
  // completes des que "Formations" est mis en avant (formationsMisesEnAvant,
  // calcule plus haut) -- jamais de missions pour elles (aucun mecanisme
  // pour ca, et une certification n'a generalement pas un "programme" a
  // detailler comme une formation), seulement pas de narrowing.
  var certificationsAMettreEnAvant = reco.certificationsAMettreEnAvant || [];
  if (dossier.cvOptimiseActif && !formationsMisesEnAvant && certificationsAMettreEnAvant.length && objetDecide.certifications && objetDecide.certifications.length) {
    var certificationsRetenues = certificationsAMettreEnAvant.map(function (r) {
      return objetDecide.certifications.filter(function (c) { return c && correspond(c, r.certification); })[0];
    }).filter(Boolean);
    if (certificationsRetenues.length) { objetDecide.certifications = certificationsRetenues; }
  }

  // TACHE (cv.md, point 13) : experiencePersonnelleAMettreEnAvant --
  // injecte les 3 missions proposees par l’assistant dans l'experience
  // personnelle correspondante (rapprochement flou sur l'intitule, meme
  // fonction correspond() que pour formations/certifications/experiences
  // pro). Le rendu (composeurRender.js, bloc 'experiencesPersonnelles')
  // sait DEJA afficher experiencesPersonnelles[].missions en puces --
  // construit pour le parcours manuel (catalogue), jamais alimente par
  // l’assistant jusqu'ici. Cette recommandation ne fait qu'alimenter ce meme
  // champ existant, aucun changement de rendu necessaire. Meme
  // convention de ponctuation que savoirFaireParExperience plus haut (un
  // seul point final exact par mission, jamais de double ponctuation).
  var experiencePersonnelleAMettreEnAvant = reco.experiencePersonnelleAMettreEnAvant || {};
  // TACHE (missions de formation) : extraite en fonction partagee
  // (_joindreMissionsIA, definie plus haut) -- reutilisee telle quelle par
  // formationRetenue ci-dessus, jamais un 2e mecanisme de jointure de
  // missions a maintenir en parallele.
  var texteMissionsExpPersoAMettreEnAvant = _joindreMissionsIA(experiencePersonnelleAMettreEnAvant.missions);

  var experiencePersonnelleCibleTrouvee = false;
  if (experiencePersonnelleAMettreEnAvant.intitule && texteMissionsExpPersoAMettreEnAvant && objetDecide.experiencesPersonnelles && objetDecide.experiencesPersonnelles.length) {
    objetDecide.experiencesPersonnelles = objetDecide.experiencesPersonnelles.map(function (e) {
      if (!e.intitule || !correspond(e.intitule, experiencePersonnelleAMettreEnAvant.intitule)) { return e; }
      experiencePersonnelleCibleTrouvee = true;
      var copie = {};
      Object.keys(e).forEach(function (k) { copie[k] = e[k]; });
      copie.missions = texteMissionsExpPersoAMettreEnAvant;
      // TACHE (retour utilisateur : "l'engagement non retenu se retrouve
      // collé après les missions détaillées, sans rapport visible") :
      // marque l'element CHOISI par l’assistant -- composeurComposition.js
      // (Projet XXL, 2 colonnes) l'utilise pour separer ce qui est
      // developpe (reste a droite, avec missions) de ce qui ne l'est pas
      // (part a gauche, sous son propre sous-titre par type). Jamais lu
      // par les 16 modeles classiques ni Sobre/Institutionnel/Moderne
      // (propriete simplement ignoree la, aucun effet).
      copie.retenuMiseEnAvant = true;
      return copie;
    });
  }
  // TACHE (chantier "exp perso", étape 6) : repli sur dossier.engagements
  // si rien n'a matché dans experiencesPersonnelles -- une expérience
  // personnelle mise en avant par l’assistant peut tout aussi bien être un
  // engagement associatif/bénévole (Découverte ou saisie manuelle),
  // jamais uniquement le champ experiencesPersonnelles. Jamais les deux
  // cibles a la fois (experiencePersonnelleCibleTrouvee), pour rester
  // fidele au principe "une seule mise en avant, un seul endroit".
  // Un engagement peut être une simple chaîne (ancien format / saisie
  // manuelle) -- converti ici en objet {texte, missions} pour pouvoir y
  // accrocher les missions, sans jamais inventer de dateDebut/dateFin
  // absentes.
  if (!experiencePersonnelleCibleTrouvee && experiencePersonnelleAMettreEnAvant.intitule && texteMissionsExpPersoAMettreEnAvant && objetDecide.engagements && objetDecide.engagements.length) {
    objetDecide.engagements = objetDecide.engagements.map(function (eng) {
      var texteEng = (typeof eng === 'string') ? eng : ((eng && eng.texte) || '');
      if (!texteEng || !correspond(texteEng, experiencePersonnelleAMettreEnAvant.intitule)) { return eng; }
      var copieEng = (typeof eng === 'string') ? { texte: eng } : (function () {
        var c = {};
        Object.keys(eng).forEach(function (k) { c[k] = eng[k]; });
        return c;
      })();
      copieEng.missions = texteMissionsExpPersoAMettreEnAvant;
      // TACHE : meme marqueur que la branche experiencesPersonnelles
      // juste au-dessus -- voir son commentaire pour le detail.
      copieEng.retenuMiseEnAvant = true;
      return copieEng;
    });
  }

  // TACHE (retour Denis 2026-09-27, chantier "exp perso" : "je veux aussi
  // des missions pour engagement... les deux vont devoir avoir le meme
  // comportement") : cv.md point 17 redige des missions pour CHAQUE
  // engagement du profil (pas un seul choisi comme le repli ci-dessus, qui
  // reste base sur experiencePersonnelleAMettreEnAvant) -- applique ICI,
  // APRES le repli ci-dessus, pour que ce point 17 (plus specifique,
  // dedie aux engagements) ait le dernier mot si les deux visent le meme
  // engagement. Meme rapprochement flou (correspond()) que le reste de ce
  // fichier, jamais une confiance aveugle dans le texte de l’assistant.
  var engagementsAvecMissions = reco.engagementsAvecMissions || [];
  if (engagementsAvecMissions.length && objetDecide.engagements && objetDecide.engagements.length) {
    objetDecide.engagements = objetDecide.engagements.map(function (eng) {
      var texteEng = (typeof eng === 'string') ? eng : ((eng && eng.texte) || '');
      var propose = texteEng && engagementsAvecMissions.filter(function (e) { return e.texte && correspond(texteEng, e.texte); })[0];
      var texteMissionsEng = propose && _joindreMissionsIA(propose.missions);
      if (!texteMissionsEng) { return eng; }
      var copieEng = (typeof eng === 'string') ? { texte: eng } : (function () {
        var c = {};
        Object.keys(eng).forEach(function (k) { c[k] = eng[k]; });
        return c;
      })();
      copieEng.missions = texteMissionsEng;
      return copieEng;
    });
  }

  // TACHE (retour Denis 2026-09-28, chantier "Formations regroupent tout", cv.md point 19) :
  // meme principe EXACT que engagementsAvecMissions juste au-dessus, pour les certifications.
  // objetDecide.certifications RESTE un tableau de simples CHAINES (decision de Denis
  // 2026-09-26, modules/cv-core/certifications.js, jamais restructure) -- impossible d'accrocher
  // .missions directement dessus (meme raison que loisirRetenu plus haut). Les missions vivent
  // donc a PART, sur objetDecide.certificationsAvecMissions ([{ certification, missions }]),
  // lu uniquement au rendu (_pdfFormationDepuisCertification, cvPdfTemplateA4.js) qui rapproche
  // par texte exact.
  // TACHE (J3, 2026-09-28) : 2 sources possibles, fusionnees ici -- reco.certificationsAvecMissions
  // (proposition FRAICHE d'une reformulation IA en cours, prioritaire) ET objetCV.certificationsAvecMissions
  // (PERSISTANT, capte a l'import d'un CV -- extraction-cv.md, voir normaliserDonneesCV.js). reco
  // passe en premier : filter()[0] plus bas prend le premier trouve, donc la proposition IA fraiche
  // l'emporte sur l'ancienne donnee d'import pour une meme certification.
  // Lot N1 (2026-10-04) : une correction de la personne (entree `manuel`, fenetre « Modifier mes certifications ») prime sur tout ; une correction VIDE veut dire « aucune mission ».
  var certifsManuelles = (objetCV.certificationsAvecMissions || []).filter(function (e) { return e && e.manuel; });
  var certificationsAvecMissionsIA = certifsManuelles.concat(reco.certificationsAvecMissions || [], (objetCV.certificationsAvecMissions || []).filter(function (e) { return !(e && e.manuel); }));
  objetDecide.certificationsAvecMissions = certificationsAvecMissionsIA.length && objetDecide.certifications && objetDecide.certifications.length
    ? objetDecide.certifications.map(function (c) {
      var propose = c && certificationsAvecMissionsIA.filter(function (e) { return e.certification && correspond(c, e.certification); })[0];
      var texteMissionsCertif = propose && _joindreMissionsIA(propose.missions);
      return texteMissionsCertif ? { certification: c, missions: texteMissionsCertif } : null;
    }).filter(Boolean)
    : [];

  // TACHE (cv.md, point 15 -- chantier "stratégie 3 branches") : regroupement
  // thematique reel des competences, propose par l’assistant. VALIDATION stricte
  // avant tout affichage : chaque nom cite dans illustrePar doit
  // correspondre a une experience REELLEMENT presente sur ce CV (poste ou
  // entreprise pour le pro, intitule pour le perso) -- jamais une
  // confiance aveugle dans le texte de l’assistant. Un nom qui ne correspond a
  // rien est simplement retire de la liste (mode degrade pour cette seule
  // compétence), jamais un plantage ni un lien invente. Repli
  // automatique : liste vide ici -> composeurComposition.js retombe sur
  // l'ancien decoupage technique/savoir-etre (compatibilite dossiers sans
  // cette recommandation, ex. generes avant ce chantier).
  function nomCorrespondAUneExperience(nom) {
    var matchPro = (objetDecide.experiences || []).some(function (e) {
      return (e.poste && correspond(e.poste, nom)) || (e.entreprise && correspond(e.entreprise, nom));
    });
    if (matchPro) { return true; }
    return (objetDecide.experiencesPersonnelles || []).some(function (e) { return e.intitule && correspond(e.intitule, nom); });
  }
  objetDecide.competencesGroupeesParTheme = (reco.competencesGroupeesParTheme || []).map(function (groupe) {
    return {
      theme: groupe.theme,
      items: (groupe.items || []).map(function (item) {
        return {
          texte: item.texte,
          illustrePar: (item.illustrePar || []).filter(nomCorrespondAUneExperience)
        };
      })
    };
  }).filter(function (g) { return g.theme && g.items && g.items.length; });

  // TACHE (retour utilisateur : "j'ai choisi 2 expériences mais le CV en
  // affiche 4") : deciderListeObjets() (utilisee juste au-dessus via
  // decider()) complete TOUJOURS jusqu'a la capacite avec les experiences
  // NON recommandees ("Présente dans le dossier, aucune recommandation
  // spécifique de l’assistant") -- comportement voulu pour formations/langues
  // (l’assistant ne se prononce jamais dessus, rien a "exclure" a proprement
  // parler), mais faux pour les experiences : depuis l'Écran 3, la
  // personne a deja passe en revue TOUTES ses experiences (voir
  // creerBrouillonChoixIACV(), qui liste desormais systematiquement
  // TOUT dossier.experiences, pas seulement les recommandations de l’assistant)
  // -- experiencesAMettreEnAvant reflete donc un choix complet et
  // volontaire, jamais une liste partielle a completer. Decocher une
  // experience doit l'EXCLURE du CV, pas la laisser remonter par simple
  // "manque de place" comme le ferait deciderListeObjets() pour une
  // rubrique ou l’assistant n'a jamais eu l'occasion de se prononcer sur
  // certains elements.
  if (recommandationsGenerique.experiences.length) {
    var experiencesChoisies = recommandationsGenerique.experiences.map(function (reco) {
      var candidats = objetCV.experiences || [];
      // TACHE (retour utilisateur : "j'ai toujours 0 expérience") : la
      // correspondance stricte (poste+entreprise identiques apres
      // normalisation) echoue silencieusement des que l’assistant reformule un
      // peu le titre du poste -- frequent et normal pour un assistant, meme
      // quand on lui demande d'etre precise. Filet de secours : si aucune
      // correspondance stricte, on retente avec correspond() (metiers.js,
      // deja utilisee partout ailleurs dans l'app pour ce genre de
      // rapprochement flou) sur le seul champ poste -- jamais a la place
      // de la correspondance stricte, seulement quand elle echoue.
      var trouve = candidats.filter(function (e) { return estDoublonProbable(e, reco, ['poste', 'entreprise']); })[0];
      if (!trouve && reco.poste) {
        trouve = candidats.filter(function (e) { return e.poste && correspond(e.poste, reco.poste); })[0];
      }
      return trouve;
    }).filter(Boolean);
    var capaciteExperiences = (typeof capacites.experiences === 'number') ? capacites.experiences : experiencesChoisies.length;
    objetDecide.experiences = experiencesChoisies.slice(0, capaciteExperiences);
    // C1 (Denis, 2026-09-26 : « des experiences ajoutees a la main n'arrivent jamais au CV ») : une experience creee APRES l'ecran de
    // choix n'a jamais ete examinee par la personne : elle n'est pas « decochee », elle est NOUVELLE. Le pool complet enregistre par
    // l'ecran de choix (savoirFaireParExperienceProposees : toutes les experiences examinees, gardees ou non) permet de les distinguer :
    // seules les experiences absentes de ce pool sont ajoutees au CV (a la suite) ; celles que la personne a decochees restent exclues.
    var poolExamine = reco.savoirFaireParExperienceProposees || [];
    if (poolExamine.length) {
      var dejaLa = objetDecide.experiences.slice();
      (objetCV.experiences || []).forEach(function (e) {
        var examinee = poolExamine.some(function (p) {
          return estDoublonProbable(e, p, ['poste', 'entreprise']) || !!(e.poste && p.poste && correspond(e.poste, p.poste));
        });
        if (!examinee && dejaLa.indexOf(e) === -1) { objetDecide.experiences.push(e); dejaLa.push(e); }
      });
    }
    // R8-3 (2026-09-29) : une experience personnelle que la personne a elle-meme choisi de faire figurer en professionnel
    // (normaliserDonneesCV la marque remonteeEnPro) n'a jamais ete « proposee » par l'assistant, mais c'est un choix
    // explicite : elle ne doit jamais disparaitre du CV (ni en professionnel ni en personnel).
    (objetCV.experiences || []).forEach(function (e) {
      if (e && e.remonteeEnPro === true && objetDecide.experiences.indexOf(e) === -1) { objetDecide.experiences.push(e); }
    });
  }

  // TACHE (retour utilisateur : plafond de competences) : n'est plus geree
  // ici -- deplacee vers classerCompetencesParPertinence(), appliquee
  // SYSTEMATIQUEMENT (avec ou sans recommandation IA) aux points d'appel
  // (chargerApercuCVInline/chargerEtAfficherApercuCV), contrairement au
  // reste de cette fonction qui reste conditionne a recommandationsIAPresentes().
  // On respecte neanmoins ici le masquage explicite de la rubrique par l’assistant,
  // s'il existe.
  if (rubriqueEstMasquee(rubriquesMasquables, 'competences')) {
    objetDecide.competences = { savoirFaire: [], savoirEtre: [], savoirs: [] };
  }

  // TACHE (retour utilisateur : vide/sommaire/trop long/bavard, pas
  // seulement vide) : pour chaque experience retenue, si l’assistant a produit une
  // proposition de missions (cv.md, point 6 -- rapprochee par
  // poste/entreprise, meme mecanisme que experiencesAMettreEnAvant), on
  // l'utilise TOUJOURS a la place du texte brut du dossier : c'est l’assistant qui
  // decide, au moment de l'analyse, si une experience merite d'etre
  // completee (vide/sommaire) ou condensee (trop longue) -- le code ne
  // fait aucune supposition sur la longueur ici, il applique simplement ce
  // que l’assistant a juge utile de proposer. Si l’assistant n'a rien propose pour une
  // experience (deja bien ecrite et concise), le texte du dossier reste
  // inchange. Le dossier lui-meme (page Action) n'est JAMAIS modifie :
  // seul le CV Word genere reflete la proposition, toujours modifiable
  // ensuite par la personne.
  var savoirFaireParExperience = reco.savoirFaireParExperience || [];
  if (savoirFaireParExperience.length && objetDecide.experiences && objetDecide.experiences.length) {
    objetDecide.experiences = objetDecide.experiences.map(function (e) {
      // TACHE (retour utilisateur : "les missions retravaillées par l’assistant
      // n'apparaissent jamais dans le CV final") : même bug que celui déjà
      // corrigé pour experiencesAMettreEnAvant, trouvé une 2e fois ici --
      // la correspondance stricte poste+entreprise échoue dès que
      // l'entreprise est vide côté dossier (courant pour le module
      // Découverte) mais que l’assistant écrit un texte de remplacement
      // ("Non renseignée dans le profil") au lieu de laisser vide. Même
      // filet de secours : correspondance floue sur le seul poste si la
      // correspondance stricte échoue.
      var propose = savoirFaireParExperience.filter(function (s) {
        return estDoublonProbable(e, s, ['poste', 'entreprise']);
      })[0];
      if (!propose && e.poste) {
        propose = savoirFaireParExperience.filter(function (s) { return s.poste && correspond(e.poste, s.poste); })[0];
      }
      if (!propose || !propose.missions || !propose.missions.length) { return e; }
      var copie = {};
      Object.keys(e).forEach(function (k) { copie[k] = e[k]; });
      // TACHE (retour utilisateur : "pourquoi j'ai '..' ? Word le
      // détecte et le souligne en bleu" -- bug réel confirmé sur un CV
      // exporté) : chaque mission proposée par l’assistant se termine déjà
      // généralement par un point -- le point final de chaque mission est
      // retiré avant la jointure (jamais avant, seulement au moment
      // d'assembler), un seul point exact par mission, quel que soit ce
      // que l’assistant a fourni (avec ou sans point final).
      // TACHE (audit "mise en page", 2026-09-28, point 6 -- bug reel
      // confirme : missions "entassees" en un seul bloc sur une VRAIE
      // experience professionnelle, meme cause que joindreMissionsImport/
      // _joindreMissionsIA) : une mission par LIGNE, jamais un paragraphe
      // -- le panneau de mise en page et le rendu (_pdfDecouperMissions)
      // font tous les deux confiance a un '\n' entre 2 missions.
      copie.missions = propose.missions
        .map(function (m) { return (m || '').trim().replace(/\.+\s*$/, ''); })
        .filter(Boolean)
        .map(function (m) { return m + '.'; })
        .join('\n');
      return copie;
    });
  }

  // TACHE (retour utilisateur : "s'il y a une question sur les années,
  // pourquoi cette information ne figure pas sur le CV ?") : trouvé --
  // le schéma demandé à l’assistant n'avait jusqu'ici aucun champ de date pour
  // experiencesAMettreEnAvant (cv.md corrigé en parallèle). Même si l’assistant
  // savait la période (transmise via dossier.informationsNonClassees),
  // elle n'avait littéralement aucune case où la renvoyer. Applique ici
  // la date confirmée par l’assistant UNIQUEMENT si l'expérience n'en a aucune
  // (jamais en écrasant une vraie date déjà connue) -- même mécanisme de
  // correspondance floue que pour les missions.
  var experiencesAMettreEnAvant = reco.experiencesAMettreEnAvant || [];
  if (experiencesAMettreEnAvant.length && objetDecide.experiences && objetDecide.experiences.length) {
    objetDecide.experiences = objetDecide.experiences.map(function (e) {
      if (e.dateDebut) { return e; } // une vraie date existe deja, jamais ecrasee
      var propose = experiencesAMettreEnAvant.filter(function (s) {
        return estDoublonProbable(e, s, ['poste', 'entreprise']);
      })[0];
      if (!propose && e.poste) {
        propose = experiencesAMettreEnAvant.filter(function (s) { return s.poste && correspond(e.poste, s.poste); })[0];
      }
      if (!propose || !propose.dateDebut) { return e; }
      var copie = {};
      Object.keys(e).forEach(function (k) { copie[k] = e[k]; });
      copie.dateDebut = propose.dateDebut;
      if (propose.dateFin) { copie.dateFin = propose.dateFin; }
      return copie;
    });
    // TACHE (retour utilisateur : "si les dates ne sont pas citées
    // explicitement pour toutes les expériences, alors la date donnée en
    // réponse à une question soit la date de toutes les expériences pro,
    // à condition qu'il n'y ait pas de dates renseignées") : second
    // passage, après le premier ci-dessus (qui applique une date
    // seulement à l'expérience que l’assistant a explicitement associée).
    // S'il ne reste plus AUCUNE expérience avec une vraie date au
    // dossier avant ce passage (aucune n'était "citée explicitement"),
    // et qu'une seule date a malgré tout été trouvée quelque part
    // (question ciblée ou récit), elle s'applique à toutes les
    // expériences qui en manquent encore -- jamais si au moins une
    // expérience avait déjà sa propre date avant ce mécanisme, pour ne
    // jamais mélanger des périodes distinctes que la personne aurait
    // renseignées elle-même.
    var aucuneDateOriginale = objetCV.experiences.every(function (e) { return !e.dateDebut; });
    if (aucuneDateOriginale) {
      var dateTrouvee = objetDecide.experiences.filter(function (e) { return e.dateDebut; })[0];
      if (dateTrouvee) {
        objetDecide.experiences = objetDecide.experiences.map(function (e) {
          if (e.dateDebut) { return e; }
          var copie = {};
          Object.keys(e).forEach(function (k) { copie[k] = e[k]; });
          copie.dateDebut = dateTrouvee.dateDebut;
          if (dateTrouvee.dateFin) { copie.dateFin = dateTrouvee.dateFin; }
          return copie;
        });
      }
    }
  }

  // TACHE (retour utilisateur : "compétences personnelles" -- bloc
  // additif, extrait des expériences ET des loisirs, jamais un
  // remplacement des loisirs) : le déclenchement (absence de formation +
  // signal de reconversion/peu d'expérience/profil mince) est décidé par
  // l’assistant elle-même (cv.md, point 10) -- cette fonction ne fait que
  // transporter le résultat vers objetDecide, jamais redécider si le
  // bloc doit apparaître. Simple liste vide si l’assistant n'a rien produit
  // (profil avec formation, ou aucun signal déclencheur).
  // TACHE (retour utilisateur : "10 propositions, max 5 à choisir", écran
  // dédié) : la fusion IA + Découverte se fait désormais à l'écran de
  // review (creerBrouillonChoixIACV), où la personne choisit elle-même
  // jusqu'à 5 parmi les 10 -- reco.competencesPersonnelles porte déjà ce
  // choix final au moment où cette fonction s'exécute. Refusionner ici
  // avec dossier.competencesPersonnellesDecouverte réintroduirait des
  // propositions que la personne aurait explicitement décochées : cette
  // fonction ne fait donc plus que transporter, jamais refusionner.
  objetDecide.competencesPersonnelles = (reco.competencesPersonnelles || []).map(function (c) {
    return { competence: c.competence, source: c.source, justification: c.justification };
  });

  // LOT 3.0 : le pool COMPLET proposé par l'assistant (même décoché) reste connu du CV, pour que « Choisir » puisse le proposer.
  objetDecide.competencesPersonnellesProposees = (reco.competencesPersonnellesProposees || []).map(function (c) {
    return { competence: c.competence, source: c.source, justification: c.justification };
  });

  // LOT 3.3 : qualites ATTENDUES POUR LE POSTE VISE (cv.md, point 10 bis). Toutes celles de l'assistant, sauf les entrees sans nom et
  // celles qui doublent le savoir-etre connu, les qualites deja proposees par l'assistant (gardees ou non) ou une autre qualite de cette
  // liste (filet code derriere la consigne du prompt : _cvQualitesSimilaires, normaliserDonneesCV.js).
  var texteQualite = function (c) { return (typeof c === 'string') ? c : ((c && (c.competence || c.texte)) || ''); };
  var qualitesConnues = ((objetCV.competences && objetCV.competences.savoirEtre) || []).map(texteQualite)
    .concat((objetDecide.competencesPersonnelles || []).map(texteQualite), (objetDecide.competencesPersonnellesProposees || []).map(texteQualite))
    .filter(Boolean);
  var similaire = function (a, b) { return (typeof _cvQualitesSimilaires === 'function') ? _cvQualitesSimilaires(a, b) : (String(a).toLowerCase().trim() === String(b).toLowerCase().trim()); };
  objetDecide.competencesAttenduesMetier = [];
  (reco.competencesAttenduesMetier || []).forEach(function (c) {
    var nom = String(texteQualite(c)).trim();
    if (!nom) { return; }
    if (qualitesConnues.some(function (k) { return similaire(nom, k); })) { return; }
    if (objetDecide.competencesAttenduesMetier.some(function (k) { return similaire(nom, k.competence); })) { return; }
    objetDecide.competencesAttenduesMetier.push({ competence: nom, justification: (c && c.justification) || '' });
  });

  // R.7 : secteur rapproche par l'assistant pour un metier absent de la base, simplement transporte ; c'est construireDonneesPdfCV qui
  // verifie que c'est bien l'un des 21 secteurs du referentiel (nom inconnu = ignore).
  objetDecide.secteurProche = String(reco.secteurProche || '').trim();

  return objetDecide;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { appliquerMoteurDecisionCV: appliquerMoteurDecisionCV, decider: decider, estDoublonProbable: estDoublonProbable, texteExisteDeja: texteExisteDeja,
    normaliserPourComparaison: normaliserPourComparaison, classerCompetencesParPertinence: classerCompetencesParPertinence };
}
