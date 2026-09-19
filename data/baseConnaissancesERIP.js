/* ============================================================
   data/baseConnaissancesERIP.js
   ------------------------------------------------------------
   TACHE 33A : objet federateur "Base de connaissances ERIP".

   Ne copie AUCUNE donnee : chaque propriete reference directement
   un tableau/objet deja existant (baseMetiers, les 4 catalogues).
   "competences" est complete par app.js (categorieCompetence vit dans
   data/competences.js depuis le 2026-09-16, charge avant ce fichier,
   mais l'assignation reste faite par app.js -- voir js/app.js).

   Evolutivite : pour ajouter une nouvelle source de connaissances
   (formations, certifications, logiciels...), ajouter une propriete
   ici et une entree correspondante dans rechercherBaseConnaissances().
   ============================================================ */

var BASE_CONNAISSANCES_ERIP = {
  metiers: baseMetiers,
  actionsProfessionnelles: CATALOGUE_ACTIONS_PRO,
  environnementsProfessionnels: CATALOGUE_PERSONNES_MATERIELS_LIEUX,
  environnementsTravail: CATALOGUE_ENVIRONNEMENTS_TRAVAIL,
  valeursProfessionnelles: CATALOGUE_VALEURS_PROFESSIONNELLES,
  // TACHE 33A : 'competences' (categorieCompetence) et 'certifications'
  // (CATALOGUE_CERTIFICATIONS) sont assignees par app.js (voir js/app.js,
  // BASE_CONNAISSANCES_ERIP.competences = categorieCompetence).
  competences: null,
  certifications: null
};

// Aplati tous les items d'un catalogue groupe ({categorie, icone, items:[...]})
// en un tableau plat d'items.
function aplatirCatalogue(catalogue) {
  var tous = [];
  (catalogue || []).forEach(function (groupe) {
    (groupe.items || []).forEach(function (item) { tous.push(item); });
  });
  return tous;
}

// TACHE (chantier "Reorganisation de la page d'accueil", Bloc 4, 2026-08-31
// -- docs/CHANTIER_ACCUEIL_DECISIONS_2026-08-31.md) : la recherche de
// l'accueil trouve aussi les outils/modules de l'application par leur nom
// ou un synonyme. `cible` est interprete par ouvrirCibleRechercheApp()
// (js/app.js) : 'carte:<id>' ouvre un panneau, 'route:<route>' navigue,
// 'fn:<cle>' appelle le point d'entree du module.
var MODULES_RECHERCHABLES = [
  { titre: 'Créer un nouveau CV', desc: 'L’assistant construit votre CV avec vous, pas à pas.',
    motsCles: ['cv', 'creer un cv', 'nouveau cv', 'faire un cv', 'curriculum', 'curriculum vitae', 'mon cv'], cible: 'carte:mesdocuments' },
  // TACHE (chantier « Reformuler et presenter mon CV », etape 7, 2026-09-07) :
  // 4e parcours de « Mes documents ». cible 'carte:mesdocuments' comme les
  // autres parcours CV -> la personne clique ensuite la tuile (qui remet
  // l'etat a zero proprement).
  { titre: 'Reformuler et présenter mon CV', desc: 'Un CV déjà complet, remis au bon niveau de langage et de vocabulaire pour le poste visé, sans en changer le fond.',
    motsCles: ['reformuler mon cv', 'presenter mon cv', 'mettre en forme mon cv', 'remettre mon cv au propre', 'rendre mon cv presentable', 'cv mal presente', 'cv pas assez professionnel', 'ameliorer la formulation de mon cv', 'meilleure formulation cv', 'vocabulaire de mon cv', 'reformulation cv'], cible: 'carte:mesdocuments' },
  { titre: 'Co-construire ma lettre de motivation', desc: 'Écrire une lettre de motivation avec un assistant, phrase par phrase.',
    motsCles: ['lettre', 'lettre de motivation', 'motivation', 'co-construire ma lettre'], cible: 'route:co-lettre' },
  { titre: 'Préparer un entretien d’embauche', desc: 'S’entraîner aux questions d’un entretien, à l’écrit ou à l’oral.',
    motsCles: ['entretien', 'entretien d embauche', 'preparer un entretien', 'preparation entretien', 'oral'], cible: 'route:prepa-entretien' },
  { titre: 'Découvrir mes compétences', desc: 'Partir de ce que vous avez vécu pour en tirer un CV.',
    motsCles: ['decouverte', 'decouvrir mes competences', 'mes competences', 'competences', 'valoriser'], cible: 'route:decouverte-intro' },
  { titre: 'Analyser ma candidature', desc: 'Un assistant repère ce qui mérite d’être renforcé dans votre CV.',
    motsCles: ['analyser ma candidature', 'bilan', 'bilan de candidature', 'analyse cv', 'analyser mon cv'], cible: 'fn:bilan' },
  { titre: 'Cohérence de mon dossier', desc: 'Vérifier que CV, lettre et entretien racontent la même histoire.',
    motsCles: ['coherence', 'coherence de mon dossier', 'coherence transversale'], cible: 'fn:coherence' },
  { titre: 'Mes Repères', desc: 'Garder les réflexions utiles de votre parcours.',
    motsCles: ['reperes', 'mes reperes', 'garder une reflexion', 'ancre'], cible: 'fn:reperes' },
  { titre: 'Mon Carnet', desc: 'Noter librement ce qui vous passe par la tête.',
    motsCles: ['carnet', 'mon carnet', 'notes', 'bloc-notes', 'bloc notes', 'prendre des notes'], cible: 'fn:carnet' },
  { titre: 'Lexique', desc: 'Les mots du monde du travail, expliqués simplement.',
    motsCles: ['lexique', 'dictionnaire', 'definition', 'definitions', 'vocabulaire', 'mot', 'signification'], cible: 'fn:lexique' },
  { titre: 'ATS', desc: 'Comparer le vocabulaire de votre CV à celui d’un métier.',
    motsCles: ['ats', 'mots cles', 'tri automatique', 'logiciel de recrutement', 'robot recruteur'], cible: 'route:ats-intro' },
  { titre: 'Un regard sur mon CV', desc: 'Anticiper le regard d’un recruteur sur votre dossier.',
    motsCles: ['un regard sur mon cv', 'regard sur mon cv', 'regard recruteur', 'recruteur', 'point de vue recruteur'], cible: 'route:regard-recruteur-intro' },
  { titre: 'Se tenir informé', desc: 'Comprendre le cadre : les repères sur vos droits, aides et démarches (emploi, budget, logement, formation, mobilité, garde d’enfant, justice…), organisés par rayon.',
    motsCles: ['se tenir informe', 'comprendre le cadre', 'actualites', 'actualite', 'informe', 's informer', 'nouveautes', 'veille',
      'mes droits', 'droits', 'aides', 'aide', 'demarches', 'demarche', 'dispositifs', 'dispositif', 'reglementation', 'reglement', 'la loi'], cible: 'route:se-tenir-informe-intro' },
  { titre: 'Comparer mes pistes', desc: 'Mettre 2 ou 3 pistes côte à côte, ou dans le temps, pour mieux comprendre ce que chacune implique.',
    motsCles: ['comparer mes pistes', 'comparer deux metiers', 'comparer des formations', 'orientation', 'aide a la decision', 'hesiter', 'hesitation', 'hesite entre deux metiers', 'choisir un metier', 'quel metier', 's orienter', 'reconversion'], cible: 'route:aide-decision-intro' }
];

// TACHE 33A : recherche simple (debut de mot / correspondance partielle),
// sans encore de score de pertinence (prevu TACHE 33B). Regroupe les
// resultats par categorie. Retourne un tableau de { categorie, icone, resultats }.
// N'inclut que les categories pour lesquelles une donnee reelle existe
// (pas de "Niveau d'etudes" / "Codes ROME" en categories independantes :
// aucune donnee de ce type n'existe aujourd'hui dans la Base de connaissances).
function rechercherBaseConnaissances(texte) {
  var q = normaliserTexte(String(texte || '')).trim();
  if (!q || q.length < 2) { return []; }
  function correspond(libelle) { return normaliserTexte(libelle || '').indexOf(q) !== -1; }

  var resultats = [];

  // TACHE (chantier accueil, Bloc 4) : outils/modules de l'application,
  // trouves par leur nom ou un synonyme. Groupe place EN PREMIER (le plus
  // actionnable). Match : un mot-cle contient la requete, ou la requete
  // contient un mot-cle d'au moins 3 lettres (ex. "je veux un cv" -> "cv").
  var modulesTrouves = MODULES_RECHERCHABLES.filter(function (m) {
    if (correspond(m.titre)) { return true; }
    return (m.motsCles || []).some(function (mc) {
      var s = normaliserTexte(mc);
      if (!s) { return false; }
      if (s.indexOf(q) !== -1) { return true; }
      return s.length >= 3 && q.indexOf(s) !== -1;
    });
  });
  if (modulesTrouves.length) {
    resultats.push({ categorie: 'Dans l\'application', icone: '🧭', resultats: modulesTrouves, type: 'module' });
  }

  // Metiers
  var metiersTrouves = (BASE_CONNAISSANCES_ERIP.metiers || []).filter(function (m) { return correspond(m.nom); });
  if (metiersTrouves.length) { resultats.push({ categorie: 'Metiers', icone: '💼', resultats: metiersTrouves, type: 'metier' }); }

  // Competences (savoir-faire) et Savoir-etre : issues de categorieCompetence
  if (BASE_CONNAISSANCES_ERIP.competences) {
    var savoirFaireTrouves = [];
    var savoirEtreTrouves = [];
    Object.keys(BASE_CONNAISSANCES_ERIP.competences).forEach(function (terme) {
      if (!correspond(terme)) { return; }
      if (BASE_CONNAISSANCES_ERIP.competences[terme] === 'Savoir-faire') { savoirFaireTrouves.push(terme); }
      else if (BASE_CONNAISSANCES_ERIP.competences[terme] === 'Savoir-etre') { savoirEtreTrouves.push(terme); }
    });
    if (savoirFaireTrouves.length) { resultats.push({ categorie: 'Competences', icone: '⚙️', resultats: savoirFaireTrouves, type: 'texte' }); }
    if (savoirEtreTrouves.length) { resultats.push({ categorie: 'Savoir-etre', icone: '🤝', resultats: savoirEtreTrouves, type: 'texte' }); }
  }

  // Savoirs : agreges depuis metiers + actions + environnements (pas de liste dediee)
  var savoirsSet = {};
  var savoirsTrouves = [];
  function collecterSavoirs(liste) {
    (liste || []).forEach(function (s) {
      if (correspond(s) && !savoirsSet[s]) { savoirsSet[s] = true; savoirsTrouves.push(s); }
    });
  }
  (BASE_CONNAISSANCES_ERIP.metiers || []).forEach(function (m) { collecterSavoirs(m.savoirs); });
  aplatirCatalogue(BASE_CONNAISSANCES_ERIP.actionsProfessionnelles).forEach(function (a) { collecterSavoirs(a.savoirs); });
  aplatirCatalogue(BASE_CONNAISSANCES_ERIP.environnementsProfessionnels).forEach(function (a) { collecterSavoirs(a.savoirs); });
  aplatirCatalogue(BASE_CONNAISSANCES_ERIP.environnementsTravail).forEach(function (a) { collecterSavoirs(a.savoirs); });
  if (savoirsTrouves.length) { resultats.push({ categorie: 'Savoirs', icone: '📚', resultats: savoirsTrouves, type: 'texte' }); }

  // Actions professionnelles
  var actionsTrouvees = aplatirCatalogue(BASE_CONNAISSANCES_ERIP.actionsProfessionnelles).filter(function (a) { return correspond(a.label); });
  if (actionsTrouvees.length) { resultats.push({ categorie: 'Actions professionnelles', icone: '🛠', resultats: actionsTrouvees, type: 'item' }); }

  // Environnements professionnels (personnes / materiels / lieux)
  var envProTrouves = aplatirCatalogue(BASE_CONNAISSANCES_ERIP.environnementsProfessionnels).filter(function (a) { return correspond(a.label); });
  if (envProTrouves.length) { resultats.push({ categorie: 'Environnements professionnels', icone: '🌍', resultats: envProTrouves, type: 'item' }); }

  // Environnements de travail
  var envTravailTrouves = aplatirCatalogue(BASE_CONNAISSANCES_ERIP.environnementsTravail).filter(function (a) { return correspond(a.label); });
  if (envTravailTrouves.length) { resultats.push({ categorie: 'Environnements de travail', icone: '🏢', resultats: envTravailTrouves, type: 'item' }); }

  // TACHE (retour utilisateur : recherche allegee) : "Valeurs professionnelles"
  // retiree de la recherche -- chapitre juge trop leger pour etre propose
  // comme categorie de recherche a part entiere (reste utilisable ailleurs,
  // ex. l'etape "Attentes" du parcours guide, via CATALOGUE_VALEURS_PROFESSIONNELLES
  // directement, sans passer par cette fonction).

  // TACHE (retour utilisateur : "domaine d'activite" dans la recherche) :
  // memes valeurs que la banniere "Domaine cible" (secteursDisponibles(),
  // app.js) -- derivees directement de baseMetiers.secteur, aucune
  // nomenclature dupliquee. Regroupe les noms de secteur distincts qui
  // correspondent au texte tape.
  var domainesSet = {};
  var domainesTrouves = [];
  (BASE_CONNAISSANCES_ERIP.metiers || []).forEach(function (m) {
    if (m.secteur && correspond(m.secteur) && !domainesSet[m.secteur]) {
      domainesSet[m.secteur] = true;
      domainesTrouves.push(m.secteur);
    }
  });
  if (domainesTrouves.length) {
    resultats.push({ categorie: 'Domaines d\'activité', icone: '🏭', resultats: domainesTrouves, type: 'domaine' });
  }

  // TACHE (recherche assistant) : certifications, egalement mentionnees dans
  // la demande d'evolution de la recherche.
  if (BASE_CONNAISSANCES_ERIP.certifications) {
    var certifTrouvees = aplatirCatalogue(BASE_CONNAISSANCES_ERIP.certifications).filter(function (a) { return correspond(a); });
    // Les items du catalogue certifications sont de simples chaines (pas des objets {id,label}).
    if (certifTrouvees.length) {
      resultats.push({ categorie: 'Certifications', icone: '🏅', resultats: certifTrouvees, type: 'texte' });
    }
  }

  // TACHE (chantier "repertoire des freins", etape 6, 2026-08-28) : les freins
  // de data/freins.js sont recherchables par leurs `synonymes` (les mots qu'une
  // personne tape vraiment : "voiture", "pas de permis", "dettes"...) et par
  // leur `titre`. FREINS_REPERTOIRE est charge APRES ce fichier (index.html) :
  // reference en direct avec garde `typeof`, jamais dans BASE_CONNAISSANCES_ERIP.
  // Les freins sensibles (violences, addiction) remontent aussi -- c'est la
  // recherche explicite de la personne (decision Denis), la fiche a une
  // formulation prudente. Clic -> regardExterieurOuvrirFicheFrein() (js/app.js).
  if (typeof FREINS_REPERTOIRE !== 'undefined' && FREINS_REPERTOIRE) {
    var freinsTrouves = Object.keys(FREINS_REPERTOIRE).filter(function (code) {
      var f = FREINS_REPERTOIRE[code];
      if (!f) { return false; }
      if (correspond(f.titre)) { return true; }
      return (f.synonymes || []).some(function (syn) {
        var s = normaliserTexte(syn || '');
        if (!s) { return false; }
        // mot tape contenu dans le synonyme ("voiture" -> "pas de voiture")
        if (s.indexOf(q) !== -1) { return true; }
        // synonyme assez long contenu dans une phrase tapee
        // ("je n'ai pas de voiture" -> "voiture") -- seuil >= 4 pour ne pas
        // matcher un synonyme court dans un mot sans rapport ("bus"/"business").
        return s.length >= 4 && q.indexOf(s) !== -1;
      });
    }).map(function (code) {
      return { code: code, titre: FREINS_REPERTOIRE[code].titre || code };
    });
    if (freinsTrouves.length) {
      resultats.push({ categorie: 'Ce qui peut vous freiner', icone: '🚧', resultats: freinsTrouves, type: 'frein' });
    }
  }

  // TACHE (retour Denis 2026-09-06) : les 16 rayons de "Comprendre le cadre"
  // sont trouvables depuis la barre d'accueil -- taper "surendettement",
  // "RQTH", "titre de sejour", "permis annule"... On matche le texte tape
  // contre le titre ET la description courte ("quoi") de chaque rayon.
  // RAYON_LABEL (modules/comprendre-le-cadre/index.js) est la seule source
  // de verite pour ces libelles ; il est charge APRES ce fichier : reference
  // en direct avec garde `typeof`, jamais dans BASE_CONNAISSANCES_ERIP.
  // Clic -> route 'comprendre-le-cadre' : le module s'ouvre a son accueil,
  // la personne choisit le rayon (pas de lien profond en V1 -- il faudrait
  // une modif de js/app.js).
  if (typeof RAYON_LABEL !== 'undefined' && RAYON_LABEL) {
    var rayonsCadreTrouves = Object.keys(RAYON_LABEL).filter(function (rid) {
      var r = RAYON_LABEL[rid];
      return r && correspond((r.titre || '') + ' ' + (r.quoi || ''));
    }).map(function (rid) {
      return {
        titre: 'Comprendre le cadre : ' + RAYON_LABEL[rid].titre,
        desc: RAYON_LABEL[rid].quoi || '',
        cible: 'route:comprendre-le-cadre'
      };
    });
    if (rayonsCadreTrouves.length) {
      resultats.push({ categorie: 'Comprendre le cadre', icone: '🧭', resultats: rayonsCadreTrouves, type: 'module' });
    }
  }

  // TACHE (audit croise Lexique/Cadre/Chiffres, 2026-09-12) : "Comprendre les
  // chiffres" (modules/comprendre-les-chiffres/index.js) n'avait AUCUNE entree
  // de recherche dediee -- seuls les mots-cles generiques de "Se tenir informe"
  // (MODULES_RECHERCHABLES plus haut : "droits", "aides", "veille"...) menaient
  // dessus, aucun ne contient "chomage", "salaire", "creations d'entreprises"...
  // Manquement au non-negociable "brancher la recherche des la creation d'un
  // module" (CLAUDE.md). Corrige ici sur le meme modele que le bloc rayons
  // ci-dessus : on matche le texte tape contre les questions des 5 chiffres
  // cles et les titres/descriptions des blocs du portrait annuel. References
  // en direct avec garde `typeof` (module charge APRES ce fichier).
  if (typeof COMPRENDRE_LES_CHIFFRES_CARTES !== 'undefined' && Array.isArray(COMPRENDRE_LES_CHIFFRES_CARTES)) {
    var chiffresSujets = COMPRENDRE_LES_CHIFFRES_CARTES.map(function (c) { return { t: c.q || '', d: '' }; });
    if (typeof COMPRENDRE_LES_CHIFFRES_PORTRAIT_BLOCS !== 'undefined' && Array.isArray(COMPRENDRE_LES_CHIFFRES_PORTRAIT_BLOCS)) {
      chiffresSujets = chiffresSujets.concat(COMPRENDRE_LES_CHIFFRES_PORTRAIT_BLOCS);
    }
    if (typeof COMPRENDRE_LES_CHIFFRES_METHODE_BLOCS !== 'undefined' && Array.isArray(COMPRENDRE_LES_CHIFFRES_METHODE_BLOCS)) {
      chiffresSujets = chiffresSujets.concat(COMPRENDRE_LES_CHIFFRES_METHODE_BLOCS);
    }
    // TACHE (audit de stabilisation, 2026-09-13, finding 1) : les 4 blocs
    // "professions de sante" (medecins, specialistes, dentistes,
    // pharmaciens) ajoutes le 2026-09-12 sont arrives APRES ce branchement
    // de recherche -- jamais rattaches depuis. "dentiste"/"pharmacien"/
    // "desert medical" ne remontaient donc rien, alors que le contenu
    // existe et est complet.
    if (typeof COMPRENDRE_LES_CHIFFRES_PROFESSIONS_SANTE !== 'undefined' && Array.isArray(COMPRENDRE_LES_CHIFFRES_PROFESSIONS_SANTE)) {
      chiffresSujets = chiffresSujets.concat(COMPRENDRE_LES_CHIFFRES_PROFESSIONS_SANTE.map(function (p) { return { t: p.titre || '', d: '' }; }));
    }
    var chiffresTrouves = chiffresSujets.filter(function (s) {
      return correspond((s.t || '') + ' ' + (s.d || ''));
    }).map(function (s) {
      return { titre: 'Comprendre les chiffres : ' + s.t, desc: s.d || '', cible: 'route:comprendre-les-chiffres' };
    });
    // Doublons possibles (une meme question de bloc apparait rarement deux
    // fois) : ecartes par titre, plafond 5 comme les autres groupes courts.
    var chiffresVus = {};
    chiffresTrouves = chiffresTrouves.filter(function (r) {
      if (chiffresVus[r.titre]) { return false; }
      chiffresVus[r.titre] = true;
      return true;
    }).slice(0, 5);
    if (chiffresTrouves.length) {
      resultats.push({ categorie: 'Comprendre les chiffres', icone: '📊', resultats: chiffresTrouves, type: 'module' });
    }
  }

  // TACHE (chantier "Ressources - 2e moitie", etape 2, 2026-08-29) : les 2
  // fiches Urgences (data/urgences.js, projetees dans LEXIQUE_FICHES,
  // univers "urgences") sont trouvables depuis la barre d'accueil -- taper
  // "urgence", "3114", "115", "expulsion", "coupure electricite"... Clic ->
  // lexiqueOuvrirFiche(id) (js/app.js). Reference LEXIQUE_FICHES en direct
  // (charge apres ce fichier) avec garde `typeof`.
  if (typeof LEXIQUE_FICHES !== 'undefined' && Array.isArray(LEXIQUE_FICHES)) {
    var urgencesTrouvees = LEXIQUE_FICHES.filter(function (f) {
      if (f.univers !== 'urgences') { return false; }
      if (correspond(f.titre)) { return true; }
      return (f.variantesRecherche || []).some(function (v) {
        var s = normaliserTexte(v || '');
        if (!s) { return false; }
        if (s.indexOf(q) !== -1) { return true; }
        return s.length >= 4 && q.indexOf(s) !== -1;
      });
    }).map(function (f) { return { id: f.id, titre: f.titre }; });
    if (urgencesTrouvees.length) {
      resultats.push({ categorie: 'Aide et urgence', icone: '🆘', resultats: urgencesTrouvees, type: 'urgence' });
    }
  }

  // TACHE (chantier "Ressources - 2e moitie", etape 3, 2026-08-29) :
  // "Trouver une structure". Deux choses possibles : (a) une fiche Lexique
  // "type de structure" (_LEXIQUE_FICHES_TYPE_STRUCTURE) qui matche -> carte
  // vers la fiche ; (b) des que le texte evoque une structure ou "ou
  // trouver...", une carte de renvoi vers l'annuaire (DORA / PCGI 87 selon
  // le departement). Regle : la fiche d'abord, le renvoi ensuite -- jamais
  // un renvoi sec (voir docs/CHANTIER_RESSOURCES.md partie 2).
  if (typeof LEXIQUE_FICHES !== 'undefined' && Array.isArray(LEXIQUE_FICHES)) {
    var STRUCTURE_MOTS = [
      'mission locale', 'cap emploi', 'france travail', 'pole emploi', 'ccas',
      'mds', 'maison departementale des solidarites', 'france services',
      'epicerie sociale', 'accueil de jour', 'structure d insertion',
      'chantier d insertion', 'plie', 'caf', 'assistante sociale',
      'ou trouver', 'structure pres de chez', 'ou aller pour', 'quelle structure',
      'annuaire', 'association pres de chez'
    ];
    var motStructure = STRUCTURE_MOTS.some(function (m) {
      var s = normaliserTexte(m);
      return s.indexOf(q) !== -1 || (s.length >= 4 && q.indexOf(s) !== -1);
    });
    var estTypeStructure = function (id) {
      return typeof _LEXIQUE_FICHES_TYPE_STRUCTURE !== 'undefined' && _LEXIQUE_FICHES_TYPE_STRUCTURE[id];
    };
    var fichesStructure = LEXIQUE_FICHES.filter(function (f) {
      if (!estTypeStructure(f.id)) { return false; }
      if (correspond(f.titre)) { return true; }
      return (f.variantesRecherche || []).some(function (v) {
        var s = normaliserTexte(v || '');
        return s && (s.indexOf(q) !== -1 || (s.length >= 4 && q.indexOf(s) !== -1));
      });
    }).map(function (f) { return { kind: 'fiche', id: f.id, titre: f.titre }; });
    var resultatsStruct = fichesStructure.slice();
    if (motStructure || fichesStructure.length) {
      resultatsStruct.push({ kind: 'annuaire', titre: 'Annuaire des structures près de chez vous' });
    }
    if (resultatsStruct.length) {
      resultats.push({ categorie: 'Trouver une structure', icone: '🏢', resultats: resultatsStruct, type: 'annuaire' });
    }
  }

  // TACHE (echange Denis 2026-08-29) : "tout ce qui est dans le Lexique doit
  // ressortir de la barre d'accueil". Les freins, les fiches Urgences et les
  // fiches "type de structure" ont deja leur groupe dedie ci-dessus -- ce
  // bloc couvre le RESTE du corpus Lexique (~130 fiches concept : addictologie,
  // mobilite internationale, CPF, ATS...). Garde-fous decides avec Denis :
  // match sur titre + variantesRecherche seulement (jamais le corps),
  // PLAFOND 5, groupe classe EN DERNIER -> pas de mur de resultats pour un
  // public fragile. Le filet "Chercher dans le Lexique" (rendreResultatsRechercheERIP,
  // js/app.js) reste pour les requetes qui ne matchent vraiment rien.
  if (typeof LEXIQUE_FICHES !== 'undefined' && Array.isArray(LEXIQUE_FICHES)) {
    var dejaVu = function (f) {
      if (f.univers === 'urgences') { return true; }
      if (typeof _LEXIQUE_FICHES_TYPE_STRUCTURE !== 'undefined' && _LEXIQUE_FICHES_TYPE_STRUCTURE[f.id]) { return true; }
      return String(f.id || '').indexOf('freins-') === 0;
    };
    var fichesLexique = LEXIQUE_FICHES.filter(function (f) {
      if (dejaVu(f)) { return false; }
      if (correspond(f.titre)) { return true; }
      return (f.variantesRecherche || []).some(function (v) {
        var s = normaliserTexte(v || '');
        if (!s) { return false; }
        if (s.indexOf(q) !== -1) { return true; }
        return s.length >= 4 && q.indexOf(s) !== -1;
      });
    }).slice(0, 5).map(function (f) { return { id: f.id, titre: f.titre, corps: f.corps || '' }; });
    if (fichesLexique.length) {
      resultats.push({ categorie: 'Dans le Lexique', icone: '📖', resultats: fichesLexique, type: 'lexique' });
    }
  }

  return resultats;
}

// TACHE (recherche assistant) : retrouve, pour une competence/savoir-etre/
// savoir donne, les metiers de la Base de connaissances qui la mentionnent
// (jusqu'a "max" resultats). Reutilise par le panneau "metiers associes"
// declenche depuis la recherche.
function trouverMetiersAssocies(competence, max) {
  max = max || 5;
  return (BASE_CONNAISSANCES_ERIP.metiers || []).filter(function (m) {
    return (m.savoirFaire || []).indexOf(competence) !== -1 ||
      (m.savoirEtre || []).indexOf(competence) !== -1 ||
      (m.savoirs || []).indexOf(competence) !== -1;
  }).slice(0, max);
}

// TACHE (amelioration recherche) : meme principe que trouverMetiersAssocies(),
// mais pour les champs identifies par id (environnement, valeurs) plutot que
// par correspondance de texte (chaque metier possede deja environnement[] et
// valeurs[] : ids des catalogues environnementsTravail/valeursProfessionnelles).
function trouverMetiersParChampId(champ, id, max) {
  max = max || 5;
  return (BASE_CONNAISSANCES_ERIP.metiers || []).filter(function (m) {
    return Array.isArray(m[champ]) && m[champ].indexOf(id) !== -1;
  }).slice(0, max);
}

// TACHE (amelioration recherche) : meme principe, mais pour le domaine
// d'activite (baseMetiers.secteur) -- un champ TEXTE simple sur chaque
// metier, pas un tableau d'ids de catalogue, d'ou une comparaison directe
// plutot qu'un indexOf() dans un tableau.
function trouverMetiersParSecteur(secteurNom, max) {
  max = max || 5;
  return (BASE_CONNAISSANCES_ERIP.metiers || []).filter(function (m) {
    return m.secteur === secteurNom;
  }).slice(0, max);
}
