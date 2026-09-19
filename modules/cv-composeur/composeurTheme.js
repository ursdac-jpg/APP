/* ============================================================
   composeurTheme.js
   ------------------------------------------------------------
   Moteur "Composeur (Bêta)" — Couche ④ : Theme Engine.
   Voir architecture-moteur-cv.md §2 (couche ④) et
   composeur-theme-engine-conception.md (cadre de conception).

   Un thème est un objet de configuration SANS AUCUNE LOGIQUE -- couleurs,
   police, style de titres, bordures, icônes, séparateurs, nombre de
   colonnes. Il ne contient jamais une taille de police en dur decidee
   pour le rendu, un choix de composant, une regle conditionnelle, ou une
   repartition de rubriques : tout cela vit dans composeurComposition.js
   (③) / composeurRegles.js (②).

   Étape B (composeur-theme-engine-conception.md) : 3 thèmes réels,
   chacun une véritable identité visuelle, pas une simple variation de
   couleur. Tous en 1 colonne pour l'instant -- décision explicite,
   distincte du chantier "2 colonnes" (mise en page, pas identité
   visuelle, traité séparément côté Composition Engine). "Moderne" n'est
   pas défini comme "le thème 2 colonnes" : son identité s'exprime
   aujourd'hui en 1 colonne par capacité disponible, elle pourra
   naturellement en exploiter 2 plus tard sans changer de personnalité.
   ============================================================ */

// TACHE (retour utilisateur : "les titres de section deviennent
// illisibles, même couleur que le fond -- il faut du noir sur fond clair,
// du blanc sur fond sombre") : calcul de contraste WCAG (ratio de
// luminance relative), extrait ici pour être réutilisé à la fois par le
// garde-fou du style "bandeau" juste plus bas ET par titreSection()
// (composeurRender.js, chargé après ce fichier -- même portée globale,
// scripts classiques dans index.html, jamais un module séparé) pour le
// style de titre par défaut ("souligné"), qui n'avait jusqu'ici AUCUNE
// protection de ce type -- bug confirmé sur un export réel ("EXPÉRIENCE
// PERSONNELLE" en E2C6CC, rose quasi invisible sur fond blanc, dès qu'une
// couleur personnalisée très claire est choisie -- voir couleurPrimaireForcee
// plus bas, qui force alors PRIMAIRE comme couleur de texte direct).
function contrasteWCAG(hex1, hex2) {
  function luminanceRelative(hex) {
    var h = String(hex || '').replace(/^#/, '');
    if (!/^[0-9A-Fa-f]{6}$/.test(h)) { return null; }
    var r = parseInt(h.substr(0, 2), 16) / 255;
    var g = parseInt(h.substr(2, 2), 16) / 255;
    var b = parseInt(h.substr(4, 2), 16) / 255;
    function canalLineaire(c) { return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
    return 0.2126 * canalLineaire(r) + 0.7152 * canalLineaire(g) + 0.0722 * canalLineaire(b);
  }
  var l1 = luminanceRelative(hex1);
  var l2 = luminanceRelative(hex2);
  if (l1 === null || l2 === null) { return null; }
  var plusClaire = Math.max(l1, l2);
  var plusSombre = Math.min(l1, l2);
  return (plusClaire + 0.05) / (plusSombre + 0.05);
}

var COMPOSEUR_THEME_DEFAUT = {
  id: 'sobre',
  nom: 'Sobre',
  description: 'Le choix sûr, adapté à tout contexte -- gris neutre, structure classique.',
  couleurs: { primaire: '1F2937', secondaire: '4B5563', texte: '1F2937', fond: 'FFFFFF' },
  police: { titres: 'Calibri', corps: 'Calibri' },
  styleTitres: 'souligne',
  styleBordures: 'fine',
  iconesRubriques: false, iconesCoordonnees: false,
  separateurs: 'ligne',
  colonnes: 1
};

// TACHE (étape B) : pensé pour les candidatures administratives, publiques,
// ou tout contexte où la sobriété inspire confiance -- jamais de couleur
// vive, aucune icône, la structure la plus classique possible.
var COMPOSEUR_THEME_INSTITUTIONNEL = {
  id: 'institutionnel',
  nom: 'Institutionnel',
  description: 'Sobriété et rigueur -- pour les candidatures administratives, publiques, ou tout contexte où la retenue inspire confiance.',
  couleurs: { primaire: '1E3A5F', secondaire: '5B6B7C', texte: '1F2937', fond: 'FFFFFF' },
  police: { titres: 'Calibri', corps: 'Calibri' },
  styleTitres: 'souligne',
  styleBordures: 'fine',
  iconesRubriques: false, iconesCoordonnees: false,
  separateurs: 'ligne',
  colonnes: 1
};

// TACHE (étape B) : pensé pour des secteurs plus dynamiques (commerce,
// communication, jeunes diplômés) sans jamais devenir négligé -- titres
// en bandeau plutôt que soulignés, icônes activées, une couleur plus
// affirmée. Identité visuelle, pas "le thème 2 colonnes" (voir en-tête
// de fichier) -- reste en 1 colonne tant que le chantier correspondant
// n'est pas ouvert côté Composition Engine.
var COMPOSEUR_THEME_MODERNE = {
  id: 'moderne',
  nom: 'Moderne',
  description: 'Une identité plus affirmée et contemporaine -- pour les secteurs dynamiques, sans jamais devenir négligé.',
  couleurs: { primaire: '0F766E', secondaire: '78716C', texte: '1F2937', fond: 'FFFFFF' },
  police: { titres: 'Calibri', corps: 'Calibri' },
  styleTitres: 'bandeau',
  styleBordures: 'epaisse',
  iconesRubriques: true, iconesCoordonnees: true,
  separateurs: 'ligne',
  colonnes: 1
};

// ============================================================
// TACHE (Projet XXL, document de reprise) : nouveau thème unique qui
// fusionne et dépasse Institutionnel + Moderne (leur seule vraie
// différence, titres soulignés vs bandeau coloré, devient une simple
// option À L'INTÉRIEUR de ce thème). RÈGLE ABSOLUE du document : zéro
// régression -- ce thème vit dans SON PROPRE objet, aucune ligne des 3
// thèmes ci-dessus n'est modifiée pour le faire exister.
//
// Ces valeurs sont les valeurs PAR DÉFAUT (thème "nu", avant réglages
// personnels) -- composeurAppliquerReglagesProjetXXL() ci-dessous les
// personnalise ensuite selon les choix de la personne, sans jamais
// modifier cet objet d'origine (copie défensive, même principe que
// composeurObtenirTheme()).
//
// Champs additionnels par rapport aux 3 thèmes historiques (coloration,
// nuanceCouleur, blocMisEnAvant, lettreJointe, optionDebordement) :
// n'existent QUE sur ce thème -- toute condition qui les lit ailleurs
// (composeurComposition.js, composeurRender.js) est donc sans effet sur
// Sobre/Institutionnel/Moderne, qui ne les ont jamais.
//
// NOTE DE CONCEPTION (à signaler explicitement, pas une omission
// silencieuse) : le document de reprise liste aussi "formatPage:
// 'A4-detaille'" parmi les valeurs par défaut du thème. Ce champ n'est
// PAS repris ici : formatPage reste exclusivement le paramètre dédié de
// genererDocxComposeur()/composeurComposer(), déjà existant et déjà la
// source de vérité unique pour ce réglage sur les 3 autres thèmes --
// lui donner une deuxième existence sur l'objet thème créerait deux
// sources de vérité pour la même information. Le panneau d'interface
// devra donc transmettre le format de page via ce paramètre dédié,
// jamais via reglages.formatPage.
// ============================================================
var COMPOSEUR_THEME_PROJETXXL = {
  id: 'projetxxl',
  nom: 'Projet XXL',
  description: 'Le CV modulable : structure, style et mise en avant entièrement personnalisables -- fusionne et dépasse Institutionnel et Moderne.',
  couleurs: { primaire: '2563EB', secondaire: '4B5563', texte: '1F2937', fond: 'FFFFFF' },
  police: { titres: 'Arial', corps: 'Arial' },
  styleTitres: 'simple', // 'simple' (texte souligné) | 'bandeau'
  styleBordures: 'fine',
  // TACHE (retour utilisateur explicite : "je veux avoir deux types
  // d'icônes... icône coordonnées et icône rubrique") : 2 champs
  // INDEPENDANTS au lieu d'un seul `icones` -- meme scission que cote PDF
  // (cvPdfTemplateA4.js, opts.iconesRubriques/opts.iconesCoordonnees).
  iconesRubriques: false, iconesCoordonnees: false,
  separateurs: 'ligne',
  colonnes: 2,
  // TACHE (retour utilisateur : "on va supprimer complètement fond
  // coloré, je vais l'intégrer dans lecture guidée") : "Fond coloré"
  // n'existe plus comme choix indépendant -- absorbé dans "Lecture
  // guidée" (2 variantes internes, voir lectureGuideeVariante plus bas).
  // "Texte coloré" redéfini : ne colore plus les titres (uniquement le
  // rôle de "Lecture guidée -- par titre" désormais) -- colore
  // maintenant tout le CONTENU des blocs (compétences, missions, centres
  // d'intérêt...), jamais les titres, jamais l'accroche, jamais les
  // coordonnées de l'en-tête. Fonctionne SEUL, sans avoir besoin d'un
  // fond de colonne actif (contrairement à l'ancien "Fond des colonnes
  // -> Texte du contenu", retiré -- voir fondColonnesEffet plus bas).
  coloration: 'aucune',       // 'aucune' | 'texteColore' | 'lectureGuidee'
  // TACHE : portée du "Texte coloré" -- en 2 colonnes, laquelle(s)
  // colorer ; en 1 colonne, ignoré (tout le contenu est colore, pas de
  // notion de gauche/droite -- voir composeurRender.js).
  texteColorePortee: 'lesDeux',  // 'gauche' | 'droite' | 'lesDeux'
  // TACHE : "Lecture guidée -- par titre" reprend l'ancien "texte
  // coloré" (titre souligné coloré) ; "-- par rectangle" reprend
  // l'ancien "fond coloré" (rectangle plein derrière le titre). Les deux
  // variantes colorent le nom et le poste visé de l'en-tête (propriété
  // historique de "lecture guidée", inchangée).
  lectureGuideeVariante: 'titre', // 'titre' | 'rectangle'
  nuanceCouleur: 6,           // 1-10, voir PALETTES_COULEURS_CV
  // TACHE (retour utilisateur : "en fond coloré [désormais Lecture
  // guidée -- par rectangle], je veux choisir le texte en blanc ou en
  // noir") : n'a de sens qu'en mode 'lectureGuidee' + variante
  // 'rectangle' -- ignore silencieusement dans les autres modes, jamais
  // une erreur.
  texteBandeau: 'blanc',      // 'blanc' | 'noir' -- uniquement pertinent si coloration === 'lectureGuidee' && lectureGuideeVariante === 'rectangle'
  // TACHE (retour utilisateur : "possibilité de mettre un fond comme
  // Aquarelle sur la colonne de gauche, avec choix couleur/nuance, et 3
  // possibilités") : "Fond des colonnes" -- DISTINCT de "coloration"
  // ci-dessus (qui pilote le style des titres de section). Réutilise la
  // MEME couleur/nuance déjà choisie pour le thème (couleurs.primaire) --
  // jamais un second sélecteur de couleur, un seul accent par thème.
  fondColonnes: 'aucun',        // 'aucun' | 'gauche' | 'droite' | 'lesDeux'
  // 'fondSeul' : rien d'autre coloré.
  // 'titres' : poste visé, nom, et titres de blocs (des 2 colonnes)
  //   prennent la couleur du fond.
  // TACHE (retour utilisateur : "le seul problème, pour accéder au
  // texte coloré de fond de colonne, il faut choisir une colonne...
  // alors que texte coloré est simple, pas besoin de colonnes") :
  // l'ancien effet 'texteContenu' est retiré -- il faisait exactement
  // ce que fait déjà "Coloration -> Texte coloré" (ci-dessus), en plus
  // détourné (obligeait à activer un fond pour l'obtenir). Mutuellement
  // exclusif avec "coloration" (voir composeurRender.js) -- les deux ne
  // pilotent jamais les titres en même temps.
  fondColonnesEffet: 'fondSeul', // 'fondSeul' | 'titres'
  // TACHE : utilisé pour la collision "titre posé sur le fond de sa
  // propre couleur" (effet 'titres' ci-dessus) -- remplace la couleur
  // exacte par du blanc/noir pour rester lisible.
  texteFondColonnes: 'blanc',    // 'blanc' | 'noir'
  // TACHE (retour utilisateur : "modèle Ruban -- ligne pour séparer les
  // colonnes, ligne horizontale sous le titre du cv, souligner chaque
  // bloc de la même couleur") : réutilise la MEME technique que le
  // modèle Ruban (bordure de cellule, exportDocxNatifCV.js -- jamais
  // réinventée) et la MEME couleur/nuance déjà choisie pour le thème
  // (couleurs.primaire, comme "Fond des colonnes" et "Coloration" --
  // jamais un 3e sélecteur de couleur). DÉCOUPLÉ de la couleur du texte
  // des titres de bloc (theme.coloration / theme.fondColonnesEffet) --
  // le soulignement prend cette couleur, le TEXTE du titre garde la
  // sienne, indépendamment. "Je ne veux pas que le séparateur ait la
  // même couleur que les titres, sauf si la personne le fait exprès" :
  // décision explicite de ne PAS forcer d'exclusion mutuelle ici (à la
  // différence de "Coloration"/"Fond des colonnes -> titres", qui
  // s'excluent) -- une coïncidence de couleur reste possible si la
  // personne combine volontairement les deux réglages, jamais empêchée.
  separateurColonnes: false,    // true | false
  nomVertical: false,    // true | false -- chantier "10 nouveaux modeles Créatif"
  cadrePage: false,    // true | false -- chantier "10 nouveaux modeles Créatif"
  // TACHE (retour utilisateur : "est-ce que le séparateur peut avoir une
  // autre couleur ?... je suis plutôt favorable, on limite ça
  // intelligemment") : indépendant de couleurs.primaire -- null par
  // défaut (= garde l'accent principal, comportement inchangé), une
  // couleur/nuance dédiée uniquement si la personne le choisit
  // explicitement. Jamais de plancher de lisibilité nécessaire ici
  // (une ligne fine reste visible à n'importe quelle nuance,
  // contrairement à du texte) -- toute la plage 1-10 reste disponible.
  separateurCouleurBase: null,   // id de couleur (ex. 'vert') ou null
  separateurNuance: 6,           // 1-10, ignoré si separateurCouleurBase est null
  // TACHE (retour utilisateur : "Condensé/Épuré -- pas pour réduire le
  // nombre de missions [déjà géré par le mécanisme de débordement A/B],
  // c'est le modèle qu'on a déjà avec les points, la continuité d'une
  // mission sur la ligne de la précédente") : "epure" = mise en page
  // normale actuelle (une mission par ligne, INCHANGÉE -- confirmé par
  // comparaison de deux CV réels fournis par l'utilisateur, paragraphe
  // par paragraphe) ; "condense" = toutes les missions d'une même
  // expérience fusionnées en un seul paragraphe continu, séparées par
  // "·", jamais de nouvelle ligne. Un seul réglage par portée (pas 2
  // cases indépendantes) : les 2 valeurs s'excluent naturellement,
  // jamais besoin d'une logique d'exclusion mutuelle séparée.
  styleProfessionnel: 'epure',   // 'epure' | 'condense'
  stylePersonnel: 'epure',       // 'epure' | 'condense'
  // TACHE (retour utilisateur : "récupérer de Trajectoire l'idée d'avoir
  // les dates avant le poste... l'entreprise n'est jamais la chose
  // centrale, toujours une annexe, dans les deux cas") : 'posteAvant'
  // (défaut, comportement historique) = Poste — Entreprise [tabulation]
  // dates ; 'dateAvant' = dates [tabulation] Poste — Entreprise. Dans
  // les deux cas, l'entreprise est désormais toujours affichée en
  // couleur secondaire, jamais fusionnée en gras avec le poste (avant ce
  // réglage, "Poste — Entreprise" formait un seul bloc en gras).
  ordreDatesPoste: 'posteAvant', // 'posteAvant' | 'dateAvant'
  // TACHE (retour utilisateur : "je veux pouvoir choisir si la phrase
  // d'accroche est en italique ou pas") : true par défaut (comportement
  // identique à avant ce réglage).
  accrocheItalique: true,        // true | false
  // TACHE (retour utilisateur : "bandeau de disponibilité -- permis,
  // langues, téléphone bien en évidence en haut du CV") : false par
  // défaut. Retire permis (en-tête) et langues (colonne/bloc habituel)
  // de leur emplacement normal quand actif -- jamais un doublon (voir
  // composeurComposition.js/composeurRender.js). Désactivable/grisé côté
  // panneau si la personne n'a pas le permis (app.js) -- pas de
  // vérification ici, ce fichier ne connaît pas encore le contenu réel.
  bandeauDisponibilite: false,   // true | false
  blocMisEnAvant: null,       // id de rubrique (ex. 'experiences', 'formations') ou null -- UNIQUEMENT utilisé en 1 colonne (voir composeurComposition.js)
  // TACHE (retour utilisateur : "je ne pense pas que remonter le bloc
  // compétences comportementales soit une bonne idée... la chose la plus
  // simple c'est d'avoir la possibilité de mettre en avant les blocs
  // souhaités sur les DEUX colonnes") : remplace la traversée
  // systématique vers la colonne principale -- UNIQUEMENT utilisés en 2
  // colonnes (voir composeurComposition.js), chacun ne réordonne qu'à
  // l'intérieur de SA PROPRE colonne, plus jamais de traversée.
  blocMisEnAvantGauche: null,  // 'competences' | 'competencesPersonnelles' | 'loisirsEngagements' | null
  blocMisEnAvantDroite: null,  // 'experiences' | 'formations' | 'experiencesPersonnelles' | null
  // TACHE (retour utilisateur : "certaines informations courtes de la
  // colonne de droite puissent passer à gauche, pour un visuel plus
  // équilibré") : booléen, jamais exposé dans le panneau "Personnaliser"
  // -- volontairement PAS un réglage libre comme blocMisEnAvantGauche/
  // Droite ci-dessus (qui réordonnent DANS une colonne, jamais entre les
  // 2) -- celui-ci déplace réellement "Formations et diplômes" de la
  // colonne principale vers la latérale. Piloté UNIQUEMENT par
  // activerMiseEnFormeUltimeXXL() (app.js, bouton "1 page, lisible"),
  // après une vraie mesure de hauteur des 2 colonnes -- jamais un choix
  // manuel, jamais deviné à l'avance (Formations reste presque toujours
  // court, mais pas garanti sur tous les profils).
  // TACHE (retour utilisateur : "formation, certification, engagements --
  // les petites rubriques de la colonne de droite doivent pouvoir passer
  // a gauche, pas seulement Formations") : generalise en une chaine
  // (candidat unique a la fois, jamais plusieurs simultanement), meme
  // principe EXACT que blocLateralDeplaceDroite plus bas (mecanisme
  // symetrique, deja une liste de candidats) -- null = aucun deplacement.
  blocDroiteDeplaceGauche: null,
  // TACHE (chantier Mini CV A5 -- rajustement automatique) : equivalent
  // de blocDroiteDeplaceGauche/blocLateralDeplaceDroite ci-dessus, mais
  // pour l'A5 (2 colonnes en Portrait, colonnes gauche/droite autour de
  // la colonne centrale identite en Paysage) -- lu par
  // composeurComposerA5Portrait (composeurComposition.js), jamais par la
  // branche A4. Piloté par essayerRequilibrageA5Automatique/
  // activerMiseEnFormeUltimeXXL (app.js), apres mesure REELLE du rendu.
  blocA5DeplaceGauche: null,
  blocA5DeplaceDroite: null,
  lettreJointe: false,        // pilote le retrait automatique de l'accroche
  optionDebordement: null,    // 'A' (police) | 'B' (missions) | null -- reponse au mecanisme A/B/C
  // TACHE (Projet XXL, doc de conception : "Garder l'existant du Composeur
  // tel quel -- Auto/Chronologique/Mixte/Par competences, rien de neuf a
  // construire, juste a integrer dans le panneau de reglages") : override
  // MANUEL de la strategie normalement choisie automatiquement par R005
  // (composeurStrategies.js/composeurComposition.js). null = 'Auto' (R005
  // decide seule, comportement inchange pour les 3 autres themes qui
  // n'ont jamais ce champ) ; sinon un id de STRATEGIES_CV
  // ('chronologique'|'mixte'|'parCompetences') impose par la personne --
  // le moteur continue de CONSEILLER (R005 reste calculee et tracee, voir
  // composeurComposition.js), la personne garde toujours la main.
  strategieForcee: null
};

var COMPOSEUR_THEMES_DISPONIBLES = {
  sobre: COMPOSEUR_THEME_DEFAUT,
  institutionnel: COMPOSEUR_THEME_INSTITUTIONNEL,
  moderne: COMPOSEUR_THEME_MODERNE,
  projetxxl: COMPOSEUR_THEME_PROJETXXL
};

// TACHE (retour utilisateur : "je veux intégrer les palettes de
// couleurs... dans ce modèle") : réutilise PALETTES_COULEURS_CV_BASE
// (coloriationDocxNatifCV.js, déjà utilisée par les 16 modèles
// classiques) -- jamais une nouvelle palette inventée pour le Composeur.
// Une couleur personnalise uniquement l'accent principal (couleurs.
// primaire) d'un thème déjà choisi : elle ne change jamais son identité
// structurelle (styleTitres, icônes, bordures) -- seul le Theme Engine
// décide de la forme, la couleur reste une simple teinte par-dessus,
// cohérent avec le test d'architecture posé à la conception (§0).
function composeurCouleursDisponibles() {
  return (typeof PALETTES_COULEURS_CV_BASE !== 'undefined') ? PALETTES_COULEURS_CV_BASE : {};
}

// TACHE (retour utilisateur : "je n'ai pas les nuances que j'ai dans les
// autres modèles, je veux 6 couleurs et 10 nuances par couleur, uniformisé
// pour tous les modèles") : PALETTES_COULEURS_CV (coloriationDocxNatifCV.js)
// est la table COMPLETE déjà construite pour les 16 modèles classiques (6
// couleurs de base + 10 nuances chacune, 60 entrées, plus 6 alias vers la
// nuance 10/10) -- réutilisée telle quelle, jamais reconstruite ici.
function composeurResoudreCouleur(idCouleur) {
  var table = (typeof PALETTES_COULEURS_CV !== 'undefined') ? PALETTES_COULEURS_CV : {};
  var entree = table[idCouleur];
  // TACHE : deux formes de hex selon la source (PALETTES_COULEURS_CV_BASE
  // utilise .hex, les nuances de PALETTES_COULEURS_CV utilisent .primaire)
  // -- normalisé ici, point d'accès unique, jamais dupliqué ailleurs.
  return entree ? { nom: entree.nom, hex: entree.hex || entree.primaire } : null;
}

// TACHE (retour utilisateur : "je vais pouvoir choisir si c'est une
// colonne ou double colonne ? faisons le test avec Moderne") : le nombre
// de colonnes reste une propriété du thème (composeur-theme-engine-
// conception.md §0 : "s'applique à l'identique quel que soit le
// contenu"), mais devient ICI un choix indépendant de la couleur -- un
// marqueur "_2col"/"_1col" en fin d'id composé, séparateur distinct du
// tiret (déjà utilisé par les nuances, "bleu-7") pour ne jamais les
// confondre. Un thème dont colonnes vaut déjà 2 par défaut peut recevoir
// "_1col" pour revenir à 1, et inversement.
var COMPOSEUR_SUFFIXE_COLONNES = { '_1col': 1, '_2col': 2 };

// Point d'accès unique (jamais une lecture directe de COMPOSEUR_THEME_DEFAUT
// ou COMPOSEUR_THEMES_DISPONIBLES ailleurs) -- repli sur le thème par
// défaut si l'id demandé n'existe pas (encore), jamais une exception.
// idTheme accepte : un id de thème seul ("moderne"), composé avec une
// couleur/nuance ("moderne-bleu", "moderne-bleu-7"), un choix de colonnes
// ("moderne_2col"), ou les deux combinés ("moderne-bleu-7_2col").
//
// TACHE (Projet XXL) : cette fonction n'est PAS modifiée pour Projet XXL
// -- appelée avec l'id texte "projetxxl", elle retourne simplement
// COMPOSEUR_THEME_PROJETXXL tel quel (thème "nu", sans réglages
// personnalisés), utile comme filet de sécurité ou pour un aperçu par
// défaut. La vraie personnalisation passe exclusivement par
// composeurAppliquerReglagesProjetXXL() ci-dessous, une fonction
// ENTIÈREMENT SÉPARÉE, comme actée dans le document de reprise.
function composeurObtenirTheme(idTheme) {
  if (!idTheme) { return COMPOSEUR_THEME_DEFAUT; }

  // Etape 1 : detecter et retirer un eventuel suffixe de colonnes, avant
  // toute autre analyse -- jamais melange avec le decoupage des couleurs.
  var colonnesForcees = null;
  var idSansColonnes = idTheme;
  Object.keys(COMPOSEUR_SUFFIXE_COLONNES).forEach(function (suffixe) {
    if (idTheme.slice(-suffixe.length) === suffixe) {
      colonnesForcees = COMPOSEUR_SUFFIXE_COLONNES[suffixe];
      idSansColonnes = idTheme.slice(0, -suffixe.length);
    }
  });

  function appliquerColonnesForcees(themeResultat) {
    if (colonnesForcees === null || themeResultat.colonnes === colonnesForcees) { return themeResultat; }
    var copie = {};
    Object.keys(themeResultat).forEach(function (cle) { copie[cle] = themeResultat[cle]; });
    copie.colonnes = colonnesForcees;
    copie.id = idTheme;
    return copie;
  }

  if (COMPOSEUR_THEMES_DISPONIBLES[idSansColonnes]) {
    return appliquerColonnesForcees(COMPOSEUR_THEMES_DISPONIBLES[idSansColonnes]);
  }

  var tiret = idSansColonnes.indexOf('-');
  if (tiret === -1) { return appliquerColonnesForcees(COMPOSEUR_THEME_DEFAUT); }
  var idThemeBase = idSansColonnes.slice(0, tiret);
  var idCouleur = idSansColonnes.slice(tiret + 1);
  var themeBase = COMPOSEUR_THEMES_DISPONIBLES[idThemeBase];
  var couleur = composeurResoudreCouleur(idCouleur);
  if (!themeBase || !couleur) { return appliquerColonnesForcees(COMPOSEUR_THEME_DEFAUT); }

  // Copie defensive : ne modifie jamais l'objet thème d'origine (partagé,
  // relu à chaque génération) -- seule la couleur primaire change.
  var themePersonnalise = {};
  Object.keys(themeBase).forEach(function (cle) { themePersonnalise[cle] = themeBase[cle]; });
  themePersonnalise.couleurs = {};
  Object.keys(themeBase.couleurs).forEach(function (cle) { themePersonnalise.couleurs[cle] = themeBase.couleurs[cle]; });
  themePersonnalise.couleurs.primaire = couleur.hex;
  themePersonnalise.id = idTheme;
  themePersonnalise.nom = themeBase.nom + ' - ' + couleur.nom;
  return appliquerColonnesForcees(themePersonnalise);
}

// ============================================================
// TACHE (Projet XXL, fondation technique actée dans le document de
// reprise) : fonction ENTIÈREMENT SÉPARÉE de composeurObtenirTheme()
// ci-dessus -- ne l'appelle jamais, n'est jamais appelée par elle. Vu le
// nombre de nouvelles dimensions (colonnes, style, coloration, nuance,
// police, icônes, bloc mis en avant, lettre jointe, option de
// débordement), un objet de réglages structuré plutôt qu'un texte
// composé supplémentaire à décoder.
//
// reglages = {
//   colonnes: 1|2,
//   styleTitres: 'bandeau'|'simple' (voir garde-fou de pairage ci-dessous),
//   iconesRubriques: bool,
//   iconesCoordonnees: bool,
//   police: une valeur de POLICES_PROJETXXL_DISPONIBLES,
//   coloration: 'aucune'|'fondColore'|'texteColore'|'lectureGuidee',
//   couleurBase: un id de PALETTES_COULEURS_CV_BASE (ex. 'bleu'),
//   nuanceCouleur: 1-10,
//   blocMisEnAvant: id de rubrique ou null,
//   lettreJointe: bool,
//   optionDebordement: 'A'|'B'|null
// }
//
// Retourne TOUJOURS un thème valide, copie defensive -- jamais l'objet
// COMPOSEUR_THEME_PROJETXXL d'origine modifié en place.
// ============================================================
var POLICES_PROJETXXL_DISPONIBLES = ['Arial', 'Calibri', 'Georgia', 'Garamond', 'Century Gothic'];

function composeurAppliquerReglagesProjetXXL(themeBase, reglages) {
  themeBase = themeBase || COMPOSEUR_THEME_PROJETXXL;
  reglages = reglages || {};

  var theme = {};
  Object.keys(themeBase).forEach(function (cle) { theme[cle] = themeBase[cle]; });
  theme.couleurs = {};
  Object.keys(themeBase.couleurs).forEach(function (cle) { theme.couleurs[cle] = themeBase.couleurs[cle]; });

  theme.colonnes = (reglages.colonnes === 1 || reglages.colonnes === 2) ? reglages.colonnes : themeBase.colonnes;
  theme.iconesRubriques = (reglages.iconesRubriques !== undefined) ? !!reglages.iconesRubriques : themeBase.iconesRubriques;
  theme.iconesCoordonnees = (reglages.iconesCoordonnees !== undefined) ? !!reglages.iconesCoordonnees : themeBase.iconesCoordonnees;
  // TACHE (modele Créatif "Pastille", chantier "2 nouveaux modeles
  // Créatif") : simple pass-through booleen, JAMAIS mele au garde-fou
  // coloration/lectureGuideeVariante -> styleTitres juste en dessous (qui
  // reste "jamais contournable", inchange) -- titresPastille est un
  // decorateur INDEPENDANT, applique par titreSection() (composeurRender.js)
  // PAR-DESSUS le styleTitres deja resolu, jamais une 3e valeur ajoutee a
  // ce champ deja verrouille.
  theme.titresPastille = !!reglages.titresPastille;

  var policeChoisie = (POLICES_PROJETXXL_DISPONIBLES.indexOf(reglages.police) !== -1) ? reglages.police : themeBase.police.titres;
  theme.police = { titres: policeChoisie, corps: policeChoisie };

  // ---- Densite (Aere / Normal / Compact -- chantier "La mise en page",
  // lot moteur sous-lot 1) : multiplicateur applique aux espacements
  // verticaux du corps. Passe a composeurComposer() -> espacementExtra ->
  // consomme A LA FOIS par composeurRender (Word) ET par cvPdfTemplateA4
  // (PDF, via composition.espacementExtra). N'affecte PAS la police
  // (levier separe -- "Taille du texte").
  theme.densiteEspacementUtilisateur =
    reglages.densite === 'aere' ? 1.22 :
      (reglages.densite === 'compact' ? 0.82 : 1);

  // ---- Alignement du corps (gauche / justifie -- lot moteur sous-lot 3).
  // Consomme par composeurRender (Word, alignment des paragraphes de corps)
  // ET cvPdfTemplateA4 (PDF, text-align via composition.alignementCorps).
  theme.alignementCorps = (reglages.alignement === 'justifie') ? 'justifie' : 'gauche';

  // ---- Veuves / orphelines (lot moteur sous-lot 6) : eviter un titre seul
  // en bas de page. Defaut = comportement AUTO (decisions.controleVeuvesOrphelines).
  // Seul un choix EXPLICITE "non" (reglages.veuves === false) le desactive ;
  // undefined / true laissent l'auto decider (voir composeurComposer).
  theme.veuvesUtilisateur = (reglages.veuves === false) ? false : undefined;

  // ---- Interligne / Espacement des paragraphes / Marges de page (lot moteur
  // sous-lot 2) : reglages FINS de "Tout regler > La page > Details", separes
  // du curseur coarse "Densite". Transmis via composeurComposer() ->
  // composition.interligneCorps / .espacementParasMult / .margesTwips /
  // .margeLateralePdf -> consommes par composeurRender (Word : line spacing +
  // marges de section) ET cvPdfTemplateA4 (PDF : line-height + padding lateral
  // des conteneurs). 'normal' / 'normales' = neutre (multiplicateur 1).
  theme.interligneCorps =
    reglages.interligne === 'serre' ? 0.9 :
      (reglages.interligne === 'aere' ? 1.15 : 1);
  theme.espacementParasMult =
    reglages.espacementParas === 'serre' ? 0.8 :
      (reglages.espacementParas === 'large' ? 1.25 : 1);
  theme.margesTwips =
    reglages.marges === 'etroites' ? 400 :
      (reglages.marges === 'larges' ? 800 : 560);
  theme.margeLateralePdf =
    reglages.marges === 'etroites' ? '10mm' :
      (reglages.marges === 'larges' ? '20mm' : '14mm');

  // ---- Rubriques a afficher / masquer (lot moteur sous-lot 4) : liste
  // unique centralisee (l'inclusion etait eparpillee). reglages.rubriques
  // est une map { cle: bool } (true = visible, defaut). On construit
  // l'ensemble des MASQUEES : composeurComposer vide la liste correspondante
  // dans contenuRetenu ("vide = jamais affiche", contrat deja partout), les
  // 2 moteurs lisent contenuRetenu. Le permis est dans l'en-tete (lit
  // objetCV.permis directement) -> flag dedie theme.permisMasque.
  theme.rubriquesMasquees = {};
  var _rubVisibilite = reglages.rubriques || {};
  ['langues', 'certifications', 'logiciels', 'experiencesPersonnelles', 'loisirs', 'engagements', 'permis'].forEach(function (k) {
    if (_rubVisibilite[k] === false) { theme.rubriquesMasquees[k] = true; }
  });
  theme.permisMasque = (_rubVisibilite.permis === false);

  // ---- Coloration + style des titres : "Lecture guidée -- par
  // rectangle" s'associe à "Bandeau" (rectangle plein, ex-"Fond coloré",
  // absorbé ici) ; tout le reste ("Lecture guidée -- par titre" et
  // "Texte coloré", qui ne touche plus les titres du tout) s'associe à
  // "Simple". Garde-fou côté moteur, jamais contournable même en cas
  // d'appel direct hors interface.
  var coloration = ['aucune', 'texteColore', 'lectureGuidee'].indexOf(reglages.coloration) !== -1
    ? reglages.coloration : (themeBase.coloration || 'aucune');
  var lectureGuideeVariante = ['titre', 'rectangle'].indexOf(reglages.lectureGuideeVariante) !== -1
    ? reglages.lectureGuideeVariante : (themeBase.lectureGuideeVariante || 'titre');
  theme.coloration = coloration;
  theme.lectureGuideeVariante = lectureGuideeVariante;
  theme.styleTitres = (coloration === 'lectureGuidee' && lectureGuideeVariante === 'rectangle') ? 'bandeau' : 'simple';

  // ---- Portée de "Texte coloré" : en 2 colonnes, laquelle(s) colorer ;
  // sans effet en 1 colonne (tout le contenu est colore, voir
  // composeurRender.js).
  theme.texteColorePortee = ['gauche', 'droite', 'lesDeux'].indexOf(reglages.texteColorePortee) !== -1
    ? reglages.texteColorePortee : (themeBase.texteColorePortee || 'lesDeux');

  // ---- Texte du bandeau (blanc/noir) : uniquement significatif en mode
  // 'lectureGuidee' + variante 'rectangle' -- transporte quand meme la
  // valeur dans les autres modes (jamais lue par composeurRender.js hors
  // ce cas précis, donc sans effet), plutot que de la forcer a une
  // valeur arbitraire qui masquerait un choix deja fait par la personne
  // si elle revient ensuite sur cette variante.
  theme.texteBandeau = (reglages.texteBandeau === 'noir' || reglages.texteBandeau === 'blanc')
    ? reglages.texteBandeau : (themeBase.texteBandeau || 'blanc');

  // ---- Fond des colonnes : DISTINCT de "coloration" ci-dessus -- réutilise
  // la même couleur/nuance (theme.couleurs.primaire, résolue plus bas),
  // jamais un second accent. Mutuellement exclusif avec "coloration" côté
  // titres : les deux ne pilotent jamais le même texte en même temps
  // (garde-fou ici, rend l'état incohérent impossible même en cas
  // d'appel direct hors interface, pas seulement via les boutons du
  // panneau qui l'empêchent déjà normalement).
  // TACHE (retour utilisateur : "fond des colonnes... +1 pour format
  // paysage le bouton milieu") : 5e valeur, exclusive au Mini CV A5
  // Paysage (colonne centrale) -- structurellement sans effet pour
  // Portrait/A4 (aucune colonne "milieu" n'existe dans ces mises en
  // page, voir composeurRender.js -- FOND_MILIEU_A5 n'y est calculé que
  // dans la branche A5-paysage).
  var fondColonnes = ['aucun', 'gauche', 'droite', 'lesDeux', 'milieu'].indexOf(reglages.fondColonnes) !== -1
    ? reglages.fondColonnes : (themeBase.fondColonnes || 'aucun');
  // TACHE (retour utilisateur : "le seul problème, pour accéder au texte
  // coloré de fond de colonne, il faut choisir une colonne... texte
  // coloré est plus simple, pas besoin de colonnes") : effet
  // 'texteContenu' retiré -- doublon exact de "Coloration -> Texte
  // coloré" (ci-dessus), qui fonctionne seul, sans fond. Ne reste que
  // 'fondSeul' et 'titres'.
  var fondColonnesEffet = ['fondSeul', 'titres'].indexOf(reglages.fondColonnesEffet) !== -1
    ? reglages.fondColonnesEffet : (themeBase.fondColonnesEffet || 'fondSeul');
  // TACHE : si "coloration" (titres via lecture guidée) ET "fond des
  // colonnes" (effet 'titres') demandent chacun de piloter les titres en
  // même temps -- ne devrait jamais arriver via le panneau (boutons
  // mutuellement exclusifs, voir app.js), mais un appel direct pourrait
  // le provoquer -- "coloration" l'emporte, "fond des colonnes" retombe
  // sur 'fondSeul' (choix arbitraire mais déterministe).
  // TACHE (retour utilisateur : "texte coloré ne colore plus les titres
  // du tout") : l'exclusion ne concerne plus que "lectureGuidee" -- seul
  // ce mode touche encore les titres/l'identité de l'en-tête. "Texte
  // coloré" ne rentre plus en collision avec "Fond des colonnes ->
  // Titres" (les deux peuvent désormais coexister sans conflit, puisque
  // "texte coloré" ne touche jamais les titres).
  if (coloration === 'lectureGuidee' && fondColonnesEffet === 'titres') { fondColonnesEffet = 'fondSeul'; }
  if (fondColonnes === 'aucun') { fondColonnesEffet = 'fondSeul'; } // sans fond, aucun effet n'a de sens
  theme.fondColonnes = fondColonnes;
  theme.fondColonnesEffet = fondColonnesEffet;
  theme.texteFondColonnes = (reglages.texteFondColonnes === 'noir' || reglages.texteFondColonnes === 'blanc')
    ? reglages.texteFondColonnes : (themeBase.texteFondColonnes || 'blanc');

  // TACHE (retour utilisateur : "je veux 3 zones colorables -- En-tête,
  // Corps du CV, toute la page -- avec les mêmes options que les
  // colonnes") : nouvelle zone, INDÉPENDANTE de "Fond des colonnes"
  // ci-dessus -- colore l'en-tête (nom/coordonnées/accroche) séparément
  // du corps. Se combine librement en 1 colonne (les 2 activées = "toute
  // la page", déjà le sens voulu) ; en 2 colonnes, la personne a
  // explicitement demandé qu'on ne puisse JAMAIS avoir en-tête + les
  // deux colonnes en même temps (équivaudrait à "toute la page", réservé
  // au mode 1 colonne) -- résolu ici de façon déterministe (comme la
  // collision coloration/fondColonnesEffet juste au-dessus) au cas où un
  // appel direct (tirage aléatoire, etc.) produirait cette combinaison :
  // "Fond des colonnes -> Les deux" l'emporte, l'en-tête retombe à
  // désactivé -- jamais un état incohérent affiché.
  var fondTeteDemandee = !!reglages.fondTete;
  theme.fondTete = (theme.colonnes === 2 && fondTeteDemandee && fondColonnes === 'lesDeux') ? false : fondTeteDemandee;

  // ---- Séparateur (inspiré du modèle Ruban) : simple booléen, pas de
  // choix de côté (contrairement à "Fond des colonnes") -- une seule
  // ligne verticale entre les 2 colonnes, jamais partielle.
  theme.separateurColonnes = (reglages.separateurColonnes !== undefined)
    ? !!reglages.separateurColonnes : !!themeBase.separateurColonnes;

  // TACHE (chantier "10 nouveaux modeles Créatif") : 2 nouveaux booleens
  // simples, meme patron EXACT que separateurColonnes juste au-dessus --
  // consommes par composeurRender.js (nomVertical : bande laterale nom
  // pivote via TextDirection ; cadrePage : pgBorders plein autour de la
  // page). Jamais de choix de cote/couleur pour l\'un ou l\'autre, contrairement
  // au separateur -- toujours actif/inactif tel quel.
  theme.nomVertical = (reglages.nomVertical !== undefined) ? !!reglages.nomVertical : !!themeBase.nomVertical;
  theme.cadrePage = (reglages.cadrePage !== undefined) ? !!reglages.cadrePage : !!themeBase.cadrePage;

  // ---- Couleur indépendante du séparateur : null = garde l'accent
  // principal (comportement inchangé, resolu par composeurRender.js via
  // theme.separateurCouleurHex || PRIMAIRE). Réutilise la MEME table de
  // nuances (PALETTES_COULEURS_CV, composeurResoudreCouleur()) -- jamais
  // une nouvelle palette, jamais de plancher de lisibilité imposé (une
  // ligne fine reste visible à n'importe quelle nuance).
  var separateurCouleurBase = reglages.separateurCouleurBase !== undefined
    ? reglages.separateurCouleurBase : themeBase.separateurCouleurBase;
  var separateurNuance = (reglages.separateurNuance >= 1 && reglages.separateurNuance <= 10)
    ? reglages.separateurNuance : (themeBase.separateurNuance || 6);
  theme.separateurCouleurBase = separateurCouleurBase || null;
  theme.separateurNuance = separateurNuance;
  var separateurCouleurResolue = separateurCouleurBase ? composeurResoudreCouleur(separateurCouleurBase + '-' + separateurNuance) : null;
  theme.separateurCouleurHex = separateurCouleurResolue ? separateurCouleurResolue.hex : null;

  // ---- Condensé/Épuré, par portée (professionnel/personnel) : un seul
  // réglage par portée, jamais 2 cases indépendantes à exclure entre
  // elles -- "epure" (défaut) reste le rendu normal actuel, inchangé.
  theme.styleProfessionnel = (reglages.styleProfessionnel === 'condense') ? 'condense'
    : (reglages.styleProfessionnel === 'epure' ? 'epure' : (themeBase.styleProfessionnel || 'epure'));
  theme.stylePersonnel = (reglages.stylePersonnel === 'condense') ? 'condense'
    : (reglages.stylePersonnel === 'epure' ? 'epure' : (themeBase.stylePersonnel || 'epure'));

  // ---- Ordre dates/poste dans la ligne d'expérience : 'posteAvant' par défaut.
  theme.ordreDatesPoste = (reglages.ordreDatesPoste === 'dateAvant') ? 'dateAvant'
    : (reglages.ordreDatesPoste === 'posteAvant' ? 'posteAvant' : (themeBase.ordreDatesPoste || 'posteAvant'));

  // ---- Phrase d'accroche en italique ou non : true par défaut.
  theme.accrocheItalique = (reglages.accrocheItalique !== undefined)
    ? !!reglages.accrocheItalique : (themeBase.accrocheItalique !== false);

  // ---- Souligner/italique poste, dates, entreprise (port du Word depuis
  // le PDF, meme retour utilisateur que ci-dessus) : 3 reglages GLOBAUX
  // (jamais par item individuel, meme regle que cvPdfTemplateA4.js/
  // _pdfSpanStylePartie -- des qu'un type est souligne/italique, il l'est
  // PARTOUT ou il apparait, experiences ET formations), false par defaut.
  theme.soulignerPoste = !!reglages.soulignerPoste;
  theme.italiquePoste = !!reglages.italiquePoste;
  theme.soulignerDates = !!reglages.soulignerDates;
  theme.italiqueDates = !!reglages.italiqueDates;
  theme.soulignerEntreprise = !!reglages.soulignerEntreprise;
  theme.italiqueEntreprise = !!reglages.italiqueEntreprise;

  // ---- Bandeau de disponibilité : false par défaut.
  theme.bandeauDisponibilite = (reglages.bandeauDisponibilite !== undefined)
    ? !!reglages.bandeauDisponibilite : !!themeBase.bandeauDisponibilite;

  // TACHE (retour utilisateur : "je veux garder le bandeau coordonnées,
  // mais avec du texte uniquement, pas de pilules/pastilles") : simple
  // passe-plat, jamais lu ailleurs que par le bandeau coordonnées
  // (composeurRender.js) pour choisir entre badges à fond plein (défaut)
  // et texte simple séparé par des points -- même principe que
  // theme.bandeauDisponibilite juste au-dessus.
  theme.sobreActif = !!reglages.sobreActif;

  // ---- Nuance : réutilise intégralement PALETTES_COULEURS_CV (jamais
  // une nouvelle palette, voir composeurResoudreCouleur() ci-dessus).
  // Restriction testée et confirmée : en "Texte coloré" (colore tout le
  // contenu des blocs désormais, pas seulement les titres -- le risque
  // de lisibilité concerne donc encore plus de texte qu'avant, plancher
  // maintenu et même renforcé dans son utilité) et "Lecture guidée"
  // (les 2 variantes, le nom/poste visé de l'en-tête restent du texte
  // plat sur fond blanc quelle que soit la variante), la nuance ne
  // descend jamais sous 4/10. "Fond des colonnes -> Titres" partage le
  // même risque (titres en texte plat sur fond blanc du côté sans
  // fond) -- même plancher. "Fond seul" n'a pas ce risque (le fond
  // lui-même reste lisible même pâle, comme le modèle Aquarelle).
  var nuance = (reglages.nuanceCouleur >= 1 && reglages.nuanceCouleur <= 10) ? reglages.nuanceCouleur : (themeBase.nuanceCouleur || 6);
  var nuancePlancher = (coloration === 'texteColore' || coloration === 'lectureGuidee' || fondColonnesEffet === 'titres') ? 4 : 1;
  if (nuance < nuancePlancher) { nuance = nuancePlancher; }
  theme.nuanceCouleur = nuance;

  var couleurBase = reglages.couleurBase || 'bleu';
  var couleurResolue = composeurResoudreCouleur(couleurBase + '-' + nuance);
  if (couleurResolue) { theme.couleurs.primaire = couleurResolue.hex; }
  // TACHE (retour utilisateur : "récupérer la couleur dominante de
  // l'entreprise -- ex. RATP, vert turquoise") : seul point d'entrée pour
  // un hex LIBRE (pas un id de palette fermée comme couleurBase/nuance
  // ci-dessus) -- écrase volontairement la résolution de palette
  // au-dessus, jamais l'inverse. reglages.couleurPersonnalisee vient de
  // dossier.rechercheCandidature.couleurEntreprise (js/app.js,
  // composeurResoudreThemeGeneration()), jamais construit ici -- ce
  // fichier ne fait que l'appliquer, comme pour toute autre valeur de
  // reglages.
  if (reglages.couleurPersonnalisee) { theme.couleurs.primaire = reglages.couleurPersonnalisee; }
  // TACHE (retour utilisateur : "j'ai activé la couleur entreprise mais
  // mon CV reste tout blanc/noir, aucune couleur nulle part" -- bug reel
  // confirme) : reglages.couleurPersonnalisee (couleur d'entreprise OU
  // pipette libre) n'avait jusqu'ici AUCUN effet visuel propre -- il ne
  // faisait qu'ecraser la valeur de theme.couleurs.primaire, qui reste
  // elle-meme invisible sur les titres/en-tete tant que "Coloration"
  // (reglages.coloration) est sur "aucune"/"texteColore" (voir
  // composeurRender.js, couleurAccentEnTete/estColorationSansTitre) --
  // reglage totalement independant que la personne n'a aucune raison de
  // connaitre pour ce cas precis. Un choix EXPLICITE de couleur (jamais
  // un simple defaut de palette) doit toujours rester visible quelque
  // part, quel que soit le reglage general de Coloration -- ce drapeau
  // sert uniquement a lever cette suppression, jamais a changer la
  // couleur elle-meme (deja geree juste au-dessus).
  theme.couleurPrimaireForcee = !!reglages.couleurPersonnalisee;

  // TACHE (retour utilisateur, bug reel confirme par capture d'ecran :
  // "EXPERIENCE PROFESSIONNELLE" quasi invisible sur un CV genere en mode
  // aleatoire, texte souligne pour pouvoir le montrer) : theme.texteBandeau
  // (ligne ~454 plus haut) est decide AVANT que theme.couleurs.primaire
  // n'ait sa valeur VRAIMENT finale (couleurPersonnalisee ci-dessus peut
  // encore l'ecraser) -- un decalage temporel qui peut rendre le choix
  // blanc/noir fait plus haut obsolete au moment ou le titre en bandeau
  // colore (styleTitres==='bandeau') est effectivement dessine. Filet de
  // securite ICI, sur la couleur REELLEMENT finale : ne change RIEN si le
  // choix (manuel ou automatique) reste lisible, ne corrige que le cas ou
  // il ne l'est vraiment plus (contraste WCAG < 3:1, seuil du texte large/
  // gras utilise pour ces titres) -- jamais un ecrasement systematique
  // d'un choix valide.
  if (theme.styleTitres === 'bandeau') {
    var _contrasteAvecNoir = contrasteWCAG(theme.couleurs.primaire, '000000');
    var _contrasteAvecBlanc = contrasteWCAG(theme.couleurs.primaire, 'FFFFFF');
    if (_contrasteAvecNoir !== null && _contrasteAvecBlanc !== null) {
      var _contrasteChoixActuel = theme.texteBandeau === 'noir' ? _contrasteAvecNoir : _contrasteAvecBlanc;
      if (_contrasteChoixActuel < 3) {
        theme.texteBandeau = _contrasteAvecNoir > _contrasteAvecBlanc ? 'noir' : 'blanc';
      }
    }
  }

  // ---- Bloc mis en avant : transporté tel quel -- le garde-fou "un
  // bloc vide ne peut pas être choisi" se vérifie plus loin, dans
  // composeurComposition.js (à ce stade, le contenu réel du CV n'est pas
  // encore connu ici, seul le thème est construit).
  theme.blocMisEnAvant = reglages.blocMisEnAvant || null;
  // TACHE (retour utilisateur : "mise en avant sur les 2 colonnes,
  // chacune la sienne") : mêmes principes -- transportés tel quel, le
  // garde-fou (contenu réel + appartenance à la bonne colonne) vit dans
  // composeurComposition.js.
  theme.blocMisEnAvantGauche = reglages.blocMisEnAvantGauche || null;
  theme.blocMisEnAvantDroite = reglages.blocMisEnAvantDroite || null;
  // TACHE (retour utilisateur : generalisation formations -> liste de
  // candidats) : transporte tel quel (chaine ou null), le garde-fou
  // (rubrique reellement presente en principale) vit dans
  // composeurComposition.js.
  theme.blocDroiteDeplaceGauche = reglages.blocDroiteDeplaceGauche || null;
  // TACHE (retour utilisateur : mecanisme inverse de blocDroiteDeplaceGauche,
  // colonne laterale trop dense) : transporte tel quel, meme principe --
  // le garde-fou (rubrique reellement presente en laterale) vit dans
  // composeurComposition.js.
  theme.blocLateralDeplaceDroite = reglages.blocLateralDeplaceDroite || null;
  // TACHE (chantier Mini CV A5 -- rajustement automatique) : transportes
  // tel quel, meme principe -- le garde-fou (rubrique reellement presente
  // dans la colonne source) vit dans composeurComposerA5Portrait
  // (composeurComposition.js), jamais ici.
  theme.blocA5DeplaceGauche = reglages.blocA5DeplaceGauche || null;
  theme.blocA5DeplaceDroite = reglages.blocA5DeplaceDroite || null;

  // ---- Lettre jointe : pilote le retrait de l'accroche -- consommé par
  // genererDocxComposeur() (composeurMoteur.js) comme repli du paramètre
  // sansAccroche déjà existant, jamais une seconde logique de retrait.
  theme.lettreJointe = !!reglages.lettreJointe;

  // ---- Mécanisme A/B/C : réponse de la personne au constat de
  // dépassement (C), consommée par composeurComposition.js -- sans effet
  // pour le format 'A4-integral' (aucune réduction n'y a de sens, doc
  // Projet XXL).
  theme.optionDebordement = (reglages.optionDebordement === 'A' || reglages.optionDebordement === 'B' || reglages.optionDebordement === 'AB') ? reglages.optionDebordement : null;

  // ---- Strategie forcee (voir garde-fou dans composeurComposition.js,
  // qui verifie que l'id demande existe reellement via strategieParId()
  // avant de jamais imposer une strategie inexistante).
  var STRATEGIES_VALIDES_XXL = ['chronologique', 'mixte', 'parCompetences'];
  theme.strategieForcee = (STRATEGIES_VALIDES_XXL.indexOf(reglages.strategieForcee) !== -1) ? reglages.strategieForcee : null;

  // ---- Bouton "Mettre en avant l'experience la plus pertinente et
  // regrouper les autres" (cv.md, point 14) : consomme par
  // genererDocxComposeur() (composeurMoteur.js), meme circuit que
  // lettreJointe/optionDebordement ci-dessus -- transporte tel quel,
  // jamais reinterprete ici (le garde-fou "y a-t-il quelque chose
  // d'exploitable" vit deja dans composeurMoteur.js/app.js).
  theme.regroupementActif = !!reglages.regroupementActif;

  // ---- Bouton ultime "1 page, lisible", levier "plus d'informations" :
  // meme circuit que regroupementActif juste au-dessus -- transporte tel
  // quel, jamais reinterprete ici (le test-et-repli "est-ce que ca tient
  // toujours sur 1 page avec ce bonus" vit dans app.js, pas ici).
  theme.tailleBonus = !!reglages.tailleBonus;
  // TACHE (remplissage de page, port du chantier PDF) : meme circuit
  // exact que tailleBonus juste au-dessus -- teste-et-replie lui aussi
  // dans app.js, jamais reinterprete ici.
  theme.enteteBonus = !!reglages.enteteBonus;

  // ---- Bouton ultime, leviers "expériences supplémentaires" et
  // "développer les missions tronquées" (chantier dédié) : memes
  // principes que tailleBonus juste au-dessus -- des nombres entiers
  // positifs, valides et bornes ici pour ne jamais laisser passer une
  // valeur aberrante, mais jamais reinterpretes (le test-et-repli "est-ce
  // que ca tient toujours sur 1 page avec ce bonus" vit dans app.js).
  var capaciteBonus = parseInt(reglages.capaciteExperiencesBonus, 10);
  theme.capaciteExperiencesBonus = (isFinite(capaciteBonus) && capaciteBonus > 0) ? Math.min(capaciteBonus, 10) : 0;
  var missionsBonusBrut = parseInt(reglages.missionsBonus, 10);
  theme.missionsBonus = (isFinite(missionsBonusBrut) && missionsBonusBrut > 0) ? Math.min(missionsBonusBrut, 5) : 0;

  // TACHE (retour utilisateur : "priorité à développer du contenu réel
  // non affiché -- missions, savoir-être, et ce qui n'a pas été marqué --
  // avant de toucher au style") : même principe que capaciteExperiencesBonus
  // juste au-dessus, généralisé à plusieurs rubriques plutôt que dupliqué
  // en 6 champs plats -- un seul objet { rubrique: bonus }, jamais
  // réinterprété ici (l'application réelle à la capacité vit dans
  // composeurComposition.js, le test-et-repli vit dans app.js).
  var RUBRIQUES_BONUS_CONTENU_XXL = ['competencesPersonnelles', 'loisirs', 'certifications', 'formations', 'langues', 'engagements'];
  theme.bonusCapacites = {};
  RUBRIQUES_BONUS_CONTENU_XXL.forEach(function (cle) {
    var brut = parseInt(reglages.bonusCapacites && reglages.bonusCapacites[cle], 10);
    theme.bonusCapacites[cle] = (isFinite(brut) && brut > 0) ? Math.min(brut, 10) : 0;
  });
  // TACHE (retour utilisateur : "je ne veux pas que l'épuré passe avant
  // le fait de mettre plus de contenu") : levier DÉDIÉ à la stratégie
  // "Par compétences" (contrat §3 : "jamais de puces de missions
  // détaillées", voir composeurRender.js) -- distinct de styleProfessionnel
  // (condense/epure), qui ne s'applique jamais à cette stratégie (mode
  // compact prioritaire sur ce réglage). Activé UNIQUEMENT en dernier
  // recours par activerMiseEnFormeUltimeXXL() (app.js), après tous les
  // bonus de contenu ci-dessus -- jamais par défaut.
  theme.detailForceParCompetences = !!reglages.detailForceParCompetences;

  theme.id = 'projetxxl';
  theme.nom = 'Projet XXL';
  return theme;
}

// TACHE (chantier tests) : export CommonJS protege -- n'existe que sous
// Node (node:test), aucun effet sur le chargement navigateur classique
// (balise <script>, ou `module` n'est jamais defini).
if (typeof module !== 'undefined') {
  module.exports = {
    composeurAppliquerReglagesProjetXXL: composeurAppliquerReglagesProjetXXL,
    COMPOSEUR_THEME_DEFAUT: COMPOSEUR_THEME_DEFAUT,
    COMPOSEUR_THEME_PROJETXXL: COMPOSEUR_THEME_PROJETXXL,
    POLICES_PROJETXXL_DISPONIBLES: POLICES_PROJETXXL_DISPONIBLES
  };
}
