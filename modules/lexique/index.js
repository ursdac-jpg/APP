/* ============================================================
   modules/lexique/index.js
   ------------------------------------------------------------
   Module Lexique (nom provisoire, voir docs/MAQUETTE_LEXIQUE.md).
   Voir modules/lexique/ARCHITECTURE_TECHNIQUE.md pour la cartographie
   complete : app.js reste l'orchestrateur, toute la logique du
   module vit ici. Donnees reelles : data/lexique.js.

   ETAPE 11 (bibliotheque contextuelle) : sur une fiche, la ligne
   univers/registres (ex. "Contrats et statuts d'emploi · langage RH,
   langage juridique") devient du texte cliquable -- jamais des boutons,
   demande explicite de Denis -- qui ouvre la liste de toutes les fiches
   partageant ce meme univers ou ce meme registre. Mecanisme entierement
   generique : filtre LEXIQUE_FICHES par f.univers ou f.registres,
   aucune logique specifique a une valeur precise. Fonctionne donc sans
   modification pour tout univers/registre ajoute plus tard, du moment
   qu'il a une entree dans _LEXIQUE_LIBELLES_UNIVERS/_REGISTRES (deja
   necessaire pour que quoi que ce soit s'affiche). Retour contextuel
   vers la fiche d'origine, meme patron que Mode Livre/Favoris (etapes
   6/7) : _lexiqueAfficherFiche(id, retour).
   Variantes de recherche deliberement non affichees : ce sont des
   aides de recherche internes, pas un contenu destine a la lecture.
   ============================================================ */

// ============================================================
// LIBELLES (univers, registres, gabarits -- slug vers texte affiche)
// ============================================================

var _LEXIQUE_LIBELLES_UNIVERS = {
  'accompagnement-insertion': 'Accompagnement et insertion',
  'emploi-recrutement': 'Emploi et recrutement',
  'ressources-humaines': 'Ressources humaines',
  'organisation-travail-management': 'Organisation du travail et management',
  'droit-travail': 'Droit du travail',
  'contrats-statuts-emploi': "Contrats et statuts d'emploi",
  formation: 'Formation',
  'bulletin-salaire': 'Bulletin de salaire',
  'protection-sociale': 'Protection sociale',
  'sante-travail': 'Santé au travail',
  'structures-organismes': 'Structures et organismes',
  dispositifs: 'Dispositifs',
  'mobilite-budget': "Mobilité et budget lié à l'emploi",
  'entrepreneuriat-independance': 'Entrepreneuriat et indépendance',
  'demarches-administratives': 'Démarches administratives et numériques',
  'conditions-travail': 'Conditions de travail',
  'acces-aux-soins': 'Accès aux soins',
  // TACHE (chantier "repertoire des freins", etape 8, 2026-08-28) : les
  // fiches de cet univers ne sont PAS ecrites dans data/lexique.js -- elles
  // sont generees a partir de data/freins.js (source unique) et ajoutees a
  // LEXIQUE_FICHES au chargement (voir la fin de data/freins.js). Le detail
  // d'une de ces fiches affiche en plus, sous la definition, les pistes et
  // ressources A JOUR (regardExterieurRenduFicheFrein, voir _lexiqueRenduFiche).
  'freins-parcours': 'Ce qui peut freiner un parcours',
  // TACHE (chantier "Ressources - 2e moitie", etape 2, 2026-08-29) : idem,
  // 2 fiches generees depuis data/urgences.js (numeros nationaux + portes
  // besoins vitaux). Rendu special dans _lexiqueRenduFiche via le marqueur
  // `_urgence`.
  'urgences': 'Numéros d\'aide et d\'urgence'
};

var _LEXIQUE_LIBELLES_REGISTRES = {
  'langage-cip': 'langage CIP',
  'langage-rh': 'langage RH',
  'langage-juridique': 'langage juridique',
  'langage-employeur': 'langage employeur',
  'langage-administratif': 'langage administratif',
  'langage-france-travail': 'langage France Travail'
};

// TACHE (chantier "Ressources - 2e moitie", etape 3, 2026-08-29) : fiches
// qui decrivent un TYPE de structure qu'une personne peut vouloir trouver
// pres de chez elle. Leur detail affiche un encart "pour en trouver une
// pres de chez vous -> annuaire" (ouvrirRenvoiAnnuaire, js/app.js). Liste
// centralisee ici plutot que dispersee dans data/lexique.js (meme choix
// que _FREINS_LEXIQUE_VOIR_AUSSI). A completer si de nouvelles fiches de
// structure sont ecrites (CCAS, MDS, France Services...).
var _LEXIQUE_FICHES_TYPE_STRUCTURE = {
  'france-travail': 1, 'mission-locale': 1, 'cap-emploi': 1, 'plie': 1,
  'caf': 1, 'siae': 1, 'iae': 1
};

// TACHE (echange Denis 2026-08-29) : renvoi LOCAL par fiche, plus precis
// que l'annuaire generique. Deux formes :
//  - type 'structure' (plie, mission-locale) : REMPLACE l'encart annuaire
//    generique. Pour le 24 -> le lien direct de la structure du
//    Bergeracois (URL verifiees le 2026-08-29) ; 87 -> l'annuaire (PCGI
//    87) ; ailleurs -> une porte nommee, jamais une recherche libre pour
//    une structure a homonymes.
//  - type 'atelier' (fiches theme) : encart AJOUTE. Pour le 24 -> l'ERIP
//    du Bergeracois, qui propose CHAQUE MOIS des ateliers gratuits sur ces
//    sujets (dates variables -> jamais de date annoncee, on renvoie vers
//    le programme) ; 87 -> l'annuaire ; ailleurs -> l'annuaire generique.
var _LEXIQUE_ERIP_BERGERACOIS_URL = 'https://www.missionlocaledubergeracois.com/erip';
var _LEXIQUE_RENVOI_LOCAL_PAR_FICHE = {
  'plie': {
    type: 'structure',
    '24': { url: 'https://www.missionlocaledubergeracois.com/le-plie', texte: 'En Dordogne, dans le Bergeracois, le PLIE est porté par la Mission Locale du Bergeracois.' },
    '87': 'annuaire',
    'ailleurs': { texteAvantAnnuaire: 'Le PLIE dépend de votre agglomération : la mairie ou France Travail vous orientent vers celui de votre territoire.' }
  },
  'mission-locale': {
    type: 'structure',
    '24': { url: 'https://www.missionlocaledubergeracois.com/', texte: 'Dans le Bergeracois : la Mission Locale du Bergeracois.' },
    '87': 'annuaire',
    'ailleurs': 'annuaire'
  },
  'freins-mobilite': { type: 'atelier', sujet: 'la mobilité et le permis' },
  'freins-handicap': { type: 'atelier', sujet: 'les droits en situation de maladie ou de handicap' },
  'freins-formation': { type: 'atelier', sujet: 'le droit et l\'accès à la formation' },
  'cv-lecture-recruteur': { type: 'atelier', sujet: 'la rédaction du CV et de la lettre de motivation' },
  'lettre-motivation': { type: 'atelier', sujet: 'la rédaction du CV et de la lettre de motivation' },
  'illectronisme': { type: 'atelier', sujet: 'l\'identité numérique et les démarches en ligne' },
  'visite-entreprise': { type: 'atelier', sujet: 'la découverte des métiers et les visites d\'entreprise' },
  'atelier-thematique': { type: 'atelier', sujet: 'ces sujets' },
  'mobilite-internationale': { type: 'atelier', sujet: 'la mobilité à l\'étranger' }
};

var _LEXIQUE_LIBELLES_GABARITS = {
  explication: 'explication',
  comparatif: 'comparatif',
  decryptage: 'décryptage',
  'grille-lecture': 'grille de lecture',
  'deroule-demarche': 'déroulé de démarche',
  role: 'rôle'
};

// ============================================================
// STOCKAGE
// ============================================================

// Accesseur unique de dossier.lexiqueFavoris -- initialise le tableau
// s'il est absent, a chaque appel. Meme patron que _reperesListe()
// (modules/reperes/index.js) : app.js n'a jamais besoin de savoir
// comment cette donnee doit etre amorcee.
function _lexiqueFavoris() {
  if (!dossier.lexiqueFavoris) { dossier.lexiqueFavoris = []; }
  return dossier.lexiqueFavoris;
}

function _lexiqueEstFavori(id) {
  return _lexiqueFavoris().indexOf(id) !== -1;
}

// Seule ecriture du module dans dossier (voir ARCHITECTURE_TECHNIQUE.md,
// "Ce que le module ecrit"). Aucun appel de sauvegarde explicite : meme
// garantie que Repères, dossier est serialise dans son ensemble par
// sauvegarderSession() (js/app.js), sans code specifique par module.
function _lexiqueBasculerFavori(id) {
  var liste = _lexiqueFavoris();
  var index = liste.indexOf(id);
  if (index === -1) { liste.push(id); } else { liste.splice(index, 1); }
}

// ============================================================
// MODELE
// ============================================================

function _lexiqueTrouverFiche(id) {
  return LEXIQUE_FICHES.filter(function (f) { return f.id === id; })[0] || null;
}

function _lexiqueTrouverCollection(id) {
  return LEXIQUE_COLLECTIONS.filter(function (c) { return c.id === id; })[0] || null;
}

function _lexiqueTrouverSecondNiveau(id) {
  return LEXIQUE_SECOND_NIVEAU.filter(function (a) { return a.id === id; })[0] || null;
}

// Etape 11 -- generique par construction : aucune valeur d'univers ou
// de registre en dur, fonctionne pour toute valeur presente dans le
// corpus, aujourd'hui comme demain.
function _lexiqueFichesParUnivers(univers) {
  return LEXIQUE_FICHES.filter(function (f) { return f.univers === univers; });
}

function _lexiqueFichesParRegistre(registre) {
  return LEXIQUE_FICHES.filter(function (f) { return (f.registres || []).indexOf(registre) !== -1; });
}

// Recherche sur le titre et les variantes de recherche uniquement --
// perimetre explicitement fixe pour cette etape (le corps, l'univers,
// le titre de tri viendront plus tard si un besoin reel le justifie).
// normaliserTexte() (data/metiers.js) : minuscule, accents retires,
// deja la fonction utilisee par la recherche existante d'ERIP -- pas
// reinventee ici.
function _lexiqueRechercher(texte) {
  var cible = normaliserTexte(texte);
  if (!cible) { return []; }
  return LEXIQUE_FICHES.filter(function (f) {
    if (normaliserTexte(f.titre).indexOf(cible) !== -1) { return true; }
    return (f.variantesRecherche || []).some(function (v) { return normaliserTexte(v).indexOf(cible) !== -1; });
  });
}

// ============================================================
// INDEX DES RELATIONS (calcule, jamais ecrit dans data/lexique.js)
// ============================================================

// Construite une seule fois, a la premiere lecture, jamais persistee.
// Ne modifie jamais LEXIQUE_FICHES ni data/lexique.js : les donnees
// restent l'unique source de verite, cet index n'est qu'une lecture
// enrichie, entierement reconstruisible. Fusionne, pour chaque fiche,
// les relations qu'elle declare ET celles que toute autre fiche
// declare vers elle -- dedupliquees par identifiant cible (voir
// ARCHITECTURE_TECHNIQUE.md, "Robustesse a la declaration redondante") :
// une paire declaree des deux cotes ne compte qu'une fois.
var _lexiqueIndexRelations = null;

function _lexiqueConstruireIndexRelations() {
  var index = {};
  function entree(id) {
    if (!index[id]) { index[id] = { 'voir-aussi': {}, 'a-ne-pas-confondre': {} }; }
    return index[id];
  }
  LEXIQUE_FICHES.forEach(function (f) {
    entree(f.id);
    (f.relations || []).forEach(function (r) {
      if (r.type !== 'voir-aussi' && r.type !== 'a-ne-pas-confondre') { return; }
      entree(f.id)[r.type][r.ficheId] = true;
      entree(r.ficheId)[r.type][f.id] = true;
    });
  });
  return index;
}

function _lexiqueIndex() {
  if (!_lexiqueIndexRelations) { _lexiqueIndexRelations = _lexiqueConstruireIndexRelations(); }
  return _lexiqueIndexRelations;
}

// Retourne les identifiants de fiches lies a "id" pour le type donne,
// sans plafond -- le plafond de densite porte sur ce qu'un redacteur
// ecrit dans data/lexique.js, jamais sur ce total calcule (decision
// actee en fin de chantier editorial).
function _lexiqueRelationsDe(id, type) {
  var e = _lexiqueIndex()[id];
  return e ? Object.keys(e[type]) : [];
}

// ============================================================
// INDEX DES COLLECTIONS (calcule, jamais ecrit sur une fiche)
// ============================================================

// Une fiche ne sait pas a quelles collections elle appartient (voir
// docs/MAQUETTE_LEXIQUE.md section 3) : l'appartenance se deduit en
// cherchant, dans chaque collection, qui cite son id. Construit une
// seule fois, jamais persiste, jamais ecrit dans data/lexique.js.
var _lexiqueIndexCollections = null;

function _lexiqueConstruireIndexCollections() {
  var index = {};
  LEXIQUE_COLLECTIONS.forEach(function (c) {
    (c.fichesOrdonnees || []).forEach(function (ficheId) {
      if (!index[ficheId]) { index[ficheId] = []; }
      index[ficheId].push(c.id);
    });
  });
  return index;
}

function _lexiqueIndexCollectionsAcces() {
  if (!_lexiqueIndexCollections) { _lexiqueIndexCollections = _lexiqueConstruireIndexCollections(); }
  return _lexiqueIndexCollections;
}

// Retourne les objets collection/parcours (pas seulement leurs ids)
// qui citent cette fiche, pour un affichage direct.
function _lexiqueCollectionsDe(ficheId) {
  var ids = _lexiqueIndexCollectionsAcces()[ficheId] || [];
  return ids.map(_lexiqueTrouverCollection).filter(Boolean);
}

// ============================================================
// INDEX DU SECOND NIVEAU (etape 10, calcule, jamais ecrit sur une
// fiche) -- meme patron exact que l'index des collections ci-dessus :
// une entree de second niveau declare ses fiches d'entree
// (fichesEntree), jamais l'inverse.
// ============================================================

var _lexiqueIndexSecondNiveau = null;

function _lexiqueConstruireIndexSecondNiveau() {
  var index = {};
  LEXIQUE_SECOND_NIVEAU.forEach(function (a) {
    (a.fichesEntree || []).forEach(function (ficheId) {
      if (!index[ficheId]) { index[ficheId] = []; }
      index[ficheId].push(a.id);
    });
  });
  return index;
}

function _lexiqueIndexSecondNiveauAcces() {
  if (!_lexiqueIndexSecondNiveau) { _lexiqueIndexSecondNiveau = _lexiqueConstruireIndexSecondNiveau(); }
  return _lexiqueIndexSecondNiveau;
}

// Retourne les entrees de second niveau accessibles depuis cette fiche
// -- tableau vide tant qu'aucune n'existe dans data/lexique.js (etape
// 10 : infrastructure seule, LEXIQUE_SECOND_NIVEAU reste vide).
function _lexiqueSecondNiveauDe(ficheId) {
  var ids = _lexiqueIndexSecondNiveauAcces()[ficheId] || [];
  return ids.map(_lexiqueTrouverSecondNiveau).filter(Boolean);
}

// ============================================================
// ETAT DE NAVIGATION (Mode Livre) -- ephemere, en memoire uniquement
// ============================================================

// _lexiqueRetourFiche : fonction a appeler par le bouton "Retour" d'une
// fiche quand elle a ete ouverte depuis un ecran qui a besoin de
// retrouver sa position (le Mode Livre) -- null (comportement par
// defaut) ramene a la recherche, comme aux etapes precedentes.
// _lexiqueModeLivrePosition : derniere position de defilement du Mode
// Livre, capturee juste avant d'ouvrir une fiche depuis cet ecran.
// Aucune des deux variables n'est ecrite dans dossier ni dans les
// donnees -- un simple confort de navigation, reconstruit a chaque
// chargement de page.
var _lexiqueRetourFiche = null;
var _lexiqueModeLivrePosition = 0;

// _lexiqueBibliothequeFicheOrigine (etape 11) : identifiant de la fiche
// depuis laquelle une bibliotheque contextuelle (univers/registre) a
// ete ouverte, pour que son bouton "Retour" ramene a la bonne fiche --
// meme logique ephemere que les deux variables ci-dessus.
var _lexiqueBibliothequeFicheOrigine = null;
// _lexiqueBibliothequeRetour (refonte accueil 2026-09-09) : fonction de
// retour personnalisee quand la bibliotheque est ouverte AUTREMENT que
// depuis une fiche -- aujourd'hui depuis "Parcourir par domaine" (retour
// vers la liste des domaines). null = comportement d'origine (retour a la
// fiche _lexiqueBibliothequeFicheOrigine).
var _lexiqueBibliothequeRetour = null;
// _lexiqueCollectionRetour (audit robustesse, 2026-09-11) : meme principe
// que _lexiqueBibliothequeRetour ci-dessus -- une collection/parcours peut
// s'ouvrir directement depuis une carte theme de l'accueil, pas seulement
// depuis la liste "Collections et parcours". null = comportement d'origine
// (retour a cette liste).
var _lexiqueCollectionRetour = null;

// ============================================================
// ACCUEIL "VIVANT" -- refonte 2026-09-09
// (docs/MAQUETTE_LEXIQUE_ACCUEIL_2026-09-09.html, decisions Denis)
// 6 themes + une ligne d'exemples, tires au sort a CHAQUE arrivee sur
// l'ecran de recherche. La rotation douce toutes les 10 s est ajoutee
// dans une etape suivante (variables _lexiqueMinuteur*).
// ============================================================

var _LEXIQUE_ACCUEIL_NB_THEMES = 6;
// Termes verifies presents dans data/lexique.js (un clic lance la
// recherche interne sur ce mot).
var _LEXIQUE_ACCUEIL_EXEMPLES = [
  'CDI', 'CDD', 'Intérim', 'Alternance', "Période d'essai", 'Rupture conventionnelle',
  'Prélèvement à la source', 'Solde de tout compte', 'Salaire brut', 'PMSMP', 'RQTH',
  'Abandon de poste', "Prime d'activité"
];
var _lexiqueAccueilThemes = [];    // sous-ensemble de LEXIQUE_COLLECTIONS
var _lexiqueAccueilExemples = [];  // sous-ensemble de _LEXIQUE_ACCUEIL_EXEMPLES

// Melange de Fisher-Yates sur une COPIE (jamais le tableau source).
function _lexiqueMelange(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

// Retire les 2 derniers tires pour eviter de reproposer exactement la
// meme rangee deux fois de suite (agrement, pas une garantie forte).
function _lexiqueTirerAccueil() {
  var deja = _lexiqueAccueilThemes.map(function (c) { return c.id; });
  var pool = LEXIQUE_COLLECTIONS.filter(function (c) { return deja.indexOf(c.id) === -1; });
  if (pool.length < _LEXIQUE_ACCUEIL_NB_THEMES) { pool = LEXIQUE_COLLECTIONS.slice(); }
  _lexiqueAccueilThemes = _lexiqueMelange(pool).slice(0, _LEXIQUE_ACCUEIL_NB_THEMES);
  _lexiqueAccueilExemples = _lexiqueMelange(_LEXIQUE_ACCUEIL_EXEMPLES).slice(0, 6);
}

function _lexiqueRenduAccueilThemeCartes() {
  return _lexiqueAccueilThemes.map(function (c) {
    return '<button type="button" class="lexique-accueil-carte" data-lexique-collection="' + echapperAttribut(c.id) + '">' +
      '<span class="lexique-accueil-carte-ico" aria-hidden="true">' + c.icone + '</span>' +
      '<span class="lexique-accueil-carte-txt">' +
        '<span class="lexique-accueil-carte-nom">' + echapperAttribut(c.titre) + '</span>' +
        '<span class="lexique-accueil-carte-nb">' + (c.fichesOrdonnees || []).length + ' fiches</span>' +
      '</span></button>';
  }).join('');
}

function _lexiqueRenduAccueilExemplesChips() {
  return _lexiqueAccueilExemples.map(function (m) {
    return '<button type="button" class="lexique-accueil-exemple" data-lexique-exemple="' + echapperAttribut(m) + '">' +
      echapperAttribut(m) + '</button>';
  }).join('');
}

// La ligne d'exemples reste sur UNE SEULE ligne (decision Denis) : on
// re-rend tous les mots tires, puis on retire ceux du bout qui debordent.
function _lexiqueAjusterExemples() {
  var zone = document.getElementById('lexiqueAccueilExemples');
  var lot = document.getElementById('lexiqueAccueilExemplesLot');
  if (!zone || !lot) { return; }
  lot.innerHTML = _lexiqueRenduAccueilExemplesChips();
  if (!zone.clientWidth) { return; }
  while (lot.children.length > 1 && zone.scrollWidth > zone.clientWidth) {
    lot.removeChild(lot.lastElementChild);
  }
}
// Handler nomme + reattache a chaque rendu (removeEventListener avant
// addEventListener) : jamais d'accumulation d'ecouteurs (LECONS 9.7).
function _lexiqueAccueilSurResize() { _lexiqueAjusterExemples(); }

// -- "Page vivante" : un seul compte a rebours de 10 s ; a l'echeance, les
// exemples ET les themes se renouvellent EN MEME TEMPS (fondu doux). Le
// compteur se remet a zero + se met en pause des que la souris survole
// l'un des deux blocs. Aucune rotation en "animations reduites".
// setInterval (pas requestAnimationFrame) : un onglet en arriere-plan met
// le rAF en pause, ce qui empechait le minuteur de demarrer selon l'ordre
// d'affichage. setInterval est ralenti en arriere-plan mais reprend seul,
// et personne ne regarde l'ecran a ce moment-la. La boucle s'auto-arrete
// des que l'ecran de recherche a ete quitte (#lexiqueAccueilThemes
// disparu) -- rien a nettoyer ailleurs (LECONS 9.7).
var _LEXIQUE_MINUTEUR_DUREE = 10000;
var _LEXIQUE_MINUTEUR_PAS = 250;
var _lexiqueMinuteurInterval = null;
var _lexiqueMinuteurEcoule = 0;
var _lexiqueMinuteurPause = false;

function _lexiqueMinuteurStop() {
  if (_lexiqueMinuteurInterval) { clearInterval(_lexiqueMinuteurInterval); _lexiqueMinuteurInterval = null; }
  _lexiqueMinuteurEcoule = 0;
  _lexiqueMinuteurPause = false;
}
// Remet la jauge a zero SANS animation (sinon on la verrait glisser de
// 100 % a 0 %) puis rend la transition pour la suite.
function _lexiqueMinuteurJaugeAZero() {
  var j = document.querySelector('#lexiqueAccueilMinuteur > i');
  if (!j) { return; }
  j.style.transition = 'none';
  j.style.width = '0%';
  void j.offsetWidth; // force le reflow
  j.style.transition = '';
}
function _lexiqueMinuteurSurvolEntre() {
  _lexiqueMinuteurPause = true;
  _lexiqueMinuteurEcoule = 0;
  _lexiqueMinuteurJaugeAZero();
}
function _lexiqueMinuteurSurvolSort() { _lexiqueMinuteurPause = false; }

function _lexiqueRenouvelerAccueil() {
  var zt = document.getElementById('lexiqueAccueilThemes');
  var zx = document.getElementById('lexiqueAccueilExemplesLot');
  if (!zt || !zx) { return; }
  _lexiqueTirerAccueil();
  zt.classList.add('lexique-accueil-fond');
  zx.classList.add('lexique-accueil-fond');
  setTimeout(function () {
    var t = document.getElementById('lexiqueAccueilThemes');
    var x = document.getElementById('lexiqueAccueilExemplesLot');
    if (t) { t.innerHTML = _lexiqueRenduAccueilThemeCartes(); t.classList.remove('lexique-accueil-fond'); }
    if (x) { _lexiqueAjusterExemples(); x.classList.remove('lexique-accueil-fond'); }
  }, 320);
}

function _lexiqueMinuteurPas() {
  var zone = document.getElementById('lexiqueAccueilThemes');
  if (!zone) { _lexiqueMinuteurStop(); return; } // ecran quitte : auto-stop
  if (!_lexiqueMinuteurPause) { _lexiqueMinuteurEcoule += _LEXIQUE_MINUTEUR_PAS; }
  var jauge = document.querySelector('#lexiqueAccueilMinuteur > i');
  if (jauge) {
    jauge.style.width = Math.min(_lexiqueMinuteurEcoule / _LEXIQUE_MINUTEUR_DUREE * 100, 100) + '%';
  }
  if (_lexiqueMinuteurEcoule >= _LEXIQUE_MINUTEUR_DUREE) {
    _lexiqueMinuteurEcoule = 0;
    _lexiqueMinuteurJaugeAZero();
    _lexiqueRenouvelerAccueil();
  }
}

// Demarre (ou pas) la rotation apres un rendu de l'ecran de recherche.
function _lexiqueDemarrerAccueilVivant() {
  _lexiqueMinuteurStop();
  var reduit = typeof window !== 'undefined' && window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var minuteurEl = document.getElementById('lexiqueAccueilMinuteur');
  if (reduit || !minuteurEl) { return; }
  minuteurEl.hidden = false;
  [document.getElementById('lexiqueAccueilThemes'), document.getElementById('lexiqueAccueilExemples')].forEach(function (b) {
    if (!b) { return; }
    b.addEventListener('mouseenter', _lexiqueMinuteurSurvolEntre);
    b.addEventListener('mouseleave', _lexiqueMinuteurSurvolSort);
    b.addEventListener('focusin', _lexiqueMinuteurSurvolEntre);
    b.addEventListener('focusout', _lexiqueMinuteurSurvolSort);
  });
  _lexiqueMinuteurInterval = setInterval(_lexiqueMinuteurPas, _LEXIQUE_MINUTEUR_PAS);
}

// ============================================================
// RENDU
// ============================================================

// TACHE (refonte accueil du Lexique, 2026-09-09,
// docs/MAQUETTE_LEXIQUE_ACCUEIL_2026-09-09.html). L'ecran d'arrivee du
// module en 3 niveaux :
//   Niveau 1 -- comprendre / apprendre : titre + accroche + recherche mise
//     en valeur + une ligne d'exemples cliquables (une seule ligne).
//   Niveau 2 -- comprendre un sujet : 6 themes tires au sort (parmi les 36
//     collections/parcours) + "Voir tous les themes".
//   Niveau 3 -- explorer : Parcourir par domaine / Mode Livre / Mes favoris.
// Aucun chiffre global affiche (le corpus evolue) ; le nombre de fiches PAR
// theme est conserve. Gabarit page-catalogue-contenu + barre-navigation-fixe
// comme tous les modules. id "lexiqueRechercheEcran" pour que lexique.css
// ([id^="lexique"]) couvre l'ecran.
function _lexiqueRenduEcran() {
  return '<div class="page-catalogue-contenu" id="lexiqueRechercheEcran">' +
    (typeof htmlBoutonRevoirModule === 'function'
      ? htmlBoutonRevoirModule('btnLexiqueRevoirIntro', 'bi-book', 'Revoir la présentation')
      : '') +

    // ---------- Niveau 1 : comprendre / apprendre ----------
    // Titre + accroche centres et au meme gabarit que les autres modules
    // (bloc .text-center + <h1> nu + .sousTitre partagee -- retour Denis
    // 2026-09-09).
    '<div class="text-center">' +
      '<h1><i class="bi bi-book"></i> Lexique</h1>' +
      '<p class="sousTitre">Les mots du travail, expliqués simplement. ' +
      'Cherchez celui que vous voulez comprendre, ou parcourez les sujets.</p>' +
    '</div>' +
    '<input type="text" class="form-control lexique-accueil-recherche" id="lexiqueRechercheInput" ' +
    'placeholder="Un mot, un sigle, une question…" autocomplete="off">' +
    '<div id="lexiqueResultats"></div>' +
    '<div class="lexique-accueil-exemples" id="lexiqueAccueilExemples">' +
      '<span class="lexique-accueil-exemples-lib">Par exemple :</span>' +
      '<span class="lexique-accueil-exemples-lot" id="lexiqueAccueilExemplesLot">' +
        _lexiqueRenduAccueilExemplesChips() +
      '</span>' +
    '</div>' +

    // ---------- Niveau 2 : comprendre un sujet ----------
    '<section class="lexique-accueil-bloc">' +
      '<h2 class="lexique-accueil-bloc-titre">Comprendre un sujet</h2>' +
      '<div class="lexique-accueil-themes" id="lexiqueAccueilThemes">' +
        _lexiqueRenduAccueilThemeCartes() +
      '</div>' +
      '<div class="lexique-accueil-minuteur" id="lexiqueAccueilMinuteur" hidden><i></i></div>' +
      '<button type="button" class="lexique-accueil-tous" id="lexiqueVoirCollections">' +
        'Voir tous les thèmes &#8594;</button>' +
    '</section>' +

    // ---------- Niveau 3 : explorer ----------
    '<section class="lexique-accueil-bloc">' +
      '<h2 class="lexique-accueil-bloc-titre">Explorer</h2>' +
      '<div class="lexique-accueil-explorer">' +
        '<button type="button" class="lexique-accueil-ligne" id="lexiqueVoirDomaines">' +
          '<span class="lexique-accueil-ligne-ico" aria-hidden="true">&#128451;&#65039;</span>' +
          '<span>Parcourir par domaine</span>' +
          '<span class="lexique-accueil-ligne-fleche" aria-hidden="true">&#8594;</span></button>' +
        '<button type="button" class="lexique-accueil-ligne" id="lexiqueVoirModeLivre">' +
          '<span class="lexique-accueil-ligne-ico" aria-hidden="true">&#128214;</span>' +
          '<span>Mode Livre : toutes les fiches, de A à Z</span>' +
          '<span class="lexique-accueil-ligne-fleche" aria-hidden="true">&#8594;</span></button>' +
        '<button type="button" class="lexique-accueil-ligne" id="lexiqueVoirFavoris">' +
          '<span class="lexique-accueil-ligne-ico" aria-hidden="true">&#9733;</span>' +
          '<span>Mes favoris</span>' +
          '<span class="lexique-accueil-ligne-fleche" aria-hidden="true">&#8594;</span></button>' +
      '</div>' +
    '</section>' +

    '</div>' +
    // TACHE (correctif boucle Retour, 2026-09-09 -- LECONS section 2) :
    // "Retour" ouvre la presentation en mode NORMAL (pas detour), pour
    // qu'elle enchaine ensuite vers la Boite a outils.
    '<div class="barre-navigation-fixe">' +
    barreNavigation('cv', null, null, { onclickPrecedent: 'lexiqueRetour()' }) +
    '</div>';
}

// TACHE (generalisation du patron "page d'introduction de module",
// demande Denis 2026-08-31, d'apres docs/MAQUETTE_INTRO_LEXIQUE.html et
// docs/LANGAGE_VISUEL_COMMUN.md). Affichee a l'entree par la tuile Boite a
// outils ; jamais quand on arrive par un lien profond (barre de recherche
// de l'accueil -> lexiqueOuvrirFiche / lexiqueOuvrirRecherche).
function _lexiqueRenduIntro() {
  return '<div class="page-catalogue-contenu lexique-intro">' +
    (_lexiqueIntroDetour && typeof htmlBoutonRevoirModule === 'function'
      ? htmlBoutonRevoirModule('btnLexiqueRevenirModule', 'bi-book', 'Revenir au module', true)
      : '') +
    '<div class="text-center"><h1><i class="bi bi-book"></i> Lexique</h1>' +
    '<p class="sousTitre">Comprendre un mot du monde du travail au moment où il vous bloque, puis repartir.</p></div>' +

    '<div class="cv-section" style="margin-bottom:1rem;background:var(--accent-bg-subtle);text-align:center;">' +
    '<p class="mb-0"><strong>Vous n’avez pas besoin de connaître ces mots d’avance.</strong> Personne ne vous les a jamais expliqués. C’est justement le rôle de cette page.</p>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;">' +
    '<h4>&#127919; À quoi ça sert</h4>' +
    '<p class="mb-0">Le monde du travail est plein de mots qu’on est censé connaître sans nous les avoir jamais expliqués : contrats, dispositifs, sigles, phrases entendues en entretien. Le Lexique les explique simplement, sans jargon, sans supposer que vous savez déjà. Chaque fiche éclaire <strong>pourquoi</strong> un mot ou une attente existe, jamais comment vous y conformer.</p>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;">' +
    '<h4>&#128218; Plusieurs domaines de vocabulaire</h4>' +
    '<p class="mb-2">Le Lexique ne se limite pas au CV et à l’entretien. Il explique le vocabulaire de tout le parcours :</p>' +
    '<ul class="mb-2" style="padding-left:1.25rem;">' +
    '<li>le droit du travail, les contrats et statuts d’emploi ;</li>' +
    '<li>le bulletin de salaire, les ressources humaines, la vie en poste ;</li>' +
    '<li>la formation, la protection sociale, la santé au travail ;</li>' +
    '<li>les structures et les dispositifs, les démarches administratives ;</li>' +
    '<li>et les mots de l’accompagnement lui-même, ceux que votre conseiller emploie.</li>' +
    '</ul>' +
    '<p class="mb-0">Le <strong>Mode Livre</strong> réunit toutes les fiches en une seule liste, de A à Z ; <strong>Parcourir par domaine</strong> les regroupe par thème ; des <strong>parcours guidés</strong> vous font suivre un sujet fiche après fiche, dans l’ordre.</p>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;">' +
    '<h4>&#128203; Ce qui va se passer</h4>' +
    '<ul class="mb-0" style="padding-left:1.25rem;">' +
    '<li>Vous cherchez un mot (CDI, période d’essai, rupture conventionnelle, prélèvement à la source...) ou vous parcourez les fiches par domaine.</li>' +
    '<li>Vous pouvez aussi taper ce mot dans la barre de recherche de l’accueil : elle ouvre directement la fiche du Lexique.</li>' +
    '<li>Chaque fiche donne une définition courte et claire, un exemple concret quand c’est utile, et un « En savoir plus » si vous voulez creuser.</li>' +
    '<li>Une fiche renvoie vers les fiches voisines : « Voir aussi » et « À ne pas confondre avec ».</li>' +
    '</ul>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;">' +
    '<h4>&#128683; Ce que ce module ne fait pas</h4>' +
    '<ul class="mb-0" style="padding-left:1.25rem;">' +
    '<li>Ce n’est pas un cours à suivre du début à la fin, ni une liste à apprendre par cœur. Vous venez chercher un mot, vous repartez. Il n’y a rien à terminer.</li>' +
    '<li>Ce n’est pas un site d’actualité. Les fiches expliquent des notions qui durent, jamais un montant ou un délai qui change souvent.</li>' +
    '<li>Rien n’est rédigé sur le moment par un assistant en ligne. Tout est écrit à l’avance et relu.</li>' +
    '<li>Le Lexique ne vous dit jamais quoi penser ni quoi faire. Même pour les questions d’entretien, il explique pourquoi la question se pose, sans vous souffler la réponse.</li>' +
    '</ul>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;">' +
    '<h4>&#9999;&#65039; Ce que vous pourrez faire ensuite</h4>' +
    '<ul class="mb-0" style="padding-left:1.25rem;">' +
    '<li>Depuis une fiche, ouvrir une ressource concrète quand il y en a une : l’annuaire des structures près de chez vous, les pistes liées à un frein, les numéros d’aide.</li>' +
    '<li>Ces renvois tiennent compte de votre département.</li>' +
    '<li>Marquer une fiche d’une étoile pour la retrouver vite dans « Mes favoris ».</li>' +
    '</ul>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;background:var(--accent-bg-subtle);">' +
    '<h4><i class="bi bi-bookmark-star"></i> Mes Repères</h4>' +
    '<p class="mb-0">Sur une fiche, le bouton <strong>« Garder comme Repère »</strong> met cette fiche de côté dans <strong>Mes Repères</strong>, votre espace personnel de réflexions. C’est un geste différent des favoris : un favori sert à <strong>retrouver vite</strong> une fiche, un Repère sert à <strong>y repenser</strong> plus tard.</p>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;">' +
    '<h4>&#128221; Comment ces fiches sont faites</h4>' +
    '<p class="mb-0">Chaque fiche est écrite à l’avance par une personne, en langage simple, puis relue. Le Lexique ne fait appel à aucun assistant en ligne et ne compose aucune réponse sur le moment : ce que vous lisez reste stable jusqu’à ce qu’une personne le mette à jour. La recherche comprend les sigles, les formulations courantes et les questions posées avec vos mots.</p>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;">' +
    '<h4>&#9989; Bon à savoir</h4>' +
    '<div class="cv-section" style="margin-bottom:0.5rem;background:var(--success-bg-subtle);border-left:3px solid var(--success);"><p class="mb-0 small">&#128274; Le Lexique ne contient aucune information sur vous. Vos recherches ne sont pas enregistrées.</p></div>' +
    '<div class="cv-section" style="margin-bottom:0;background:var(--accent-bg-subtle);border-left:3px solid var(--accent);"><p class="mb-0 small">&#128190; Les fiches que vous mettez en favori sont gardées avec le reste de votre dossier : pensez à cliquer sur l’icône disquette avant de fermer la page, sinon elles seront perdues.</p></div>' +
    '</div>' +

    (typeof htmlEncartMultilingue === 'function' ? htmlEncartMultilingue(true) : '') +

    '<div class="text-center" style="margin-top:1.25rem;">' +
    (_lexiqueIntroDetour
      ? '<button type="button" id="btnLexiqueIntroRevenir" class="btn btn-primary btn-lg">Revenir au module &#8594;</button>'
      : '<button type="button" id="btnLexiqueIntroOuvrir" class="btn btn-primary btn-lg">Ouvrir le Lexique &#8594;</button>') +
    '</div>' +
    '</div>' +
    // TACHE (retour Denis, 2026-08-31) : "Retour" de la presentation a froid
    // ramene au menu de la Boite a outils. En detour, "Retour" revient a l'ecran.
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null,
      { onclickPrecedent: (_lexiqueIntroDetour ? 'lexiqueRevenirDeLaPresentation()' : 'retourVersBoiteAOutils()') }) + '</div>';
}
function _lexiqueBrancherIntro() {
  var btn = document.getElementById('btnLexiqueIntroOuvrir');
  if (btn) {
    btn.addEventListener('click', function () {
      _lexiqueEcranIntro = false;
      _lexiqueAfficherRecherche();
      if (typeof trackEvenement === 'function') { trackEvenement('lexique_ouvert'); }
    });
  }
  var btnRevenir = document.getElementById('btnLexiqueIntroRevenir');
  if (btnRevenir) { btnRevenir.addEventListener('click', lexiqueRevenirDeLaPresentation); }
  var btnRevenirHaut = document.getElementById('btnLexiqueRevenirModule');
  if (btnRevenirHaut) { btnRevenirHaut.addEventListener('click', lexiqueRevenirDeLaPresentation); }
}

// Affichage continu de tout le corpus, regroupe par univers (ordre de
// _LEXIQUE_LIBELLES_UNIVERS, groupes vides omis), trie par titreDeTri
// dans chaque groupe -- une vue de plus sur les memes fiches, jamais
// une donnee ni un tri propres au Mode Livre. Reutilise le meme
// data-lexique-fiche que partout ailleurs : aucun rendu de fiche
// specifique a cet ecran.
function _lexiqueRenduModeLivre() {
  // TACHE (refonte accueil 2026-09-09, decision Denis) : le Mode Livre se
  // lit "comme un livre" -> UNE SEULE liste de A a Z de toutes les fiches,
  // plus de regroupement par domaine (celui-ci reste dispo dans "Parcourir
  // par domaine"). Tri sur titreDeTri || titre (meme cle qu'avant).
  var fiches = LEXIQUE_FICHES.slice().sort(function (a, b) {
    return (a.titreDeTri || a.titre).localeCompare(b.titreDeTri || b.titre, 'fr');
  });
  var contenu = '<div class="list-group">' + fiches.map(function (f) {
    return '<button type="button" class="list-group-item list-group-item-action" data-lexique-fiche="' + f.id + '">' +
      echapperAttribut(f.titre) + '</button>';
  }).join('') + '</div>';

  return '<div class="page-catalogue-contenu" id="lexiqueModeLivreEcran">' +
    '<button type="button" class="btn btn-outline-secondary btn-sm mb-3" id="lexiqueRetourRechercheModeLivre">&larr; Retour à la recherche</button>' +
    '<h1 class="h4 mb-1">Mode Livre</h1>' +
    '<p class="small text-muted mb-3">Toutes les fiches, de A à Z.</p>' +
    '<button type="button" class="btn btn-outline-secondary btn-famille-explorer btn-sm mb-4" id="lexiqueModeLivreVoirCollections">' +
    'Voir tous les thèmes</button>' +
    contenu +
    '</div>' +
    // TACHE (RC-03, correctif Retour absent, audit 2026-09-04) : appel sans
    // argument -> aucun bouton Retour n'etait rendu dans la barre fixe (pas
    // mal dirige : absent). Meme destination que le bouton "Retour a la
    // recherche" deja dans la page (_lexiqueBrancherModeLivre()).
    // TACHE (2026-09-09) : bandeau fixe comme les autres modules.
    '<div class="barre-navigation-fixe">' +
    barreNavigation('cv', null, null, { onclickPrecedent: '_lexiqueAfficherRecherche()' }) +
    '</div>';
}

function _lexiqueRenduResultats(texte) {
  var cible = (texte || '').trim();
  if (cible.length < 2) { return ''; }
  var resultats = _lexiqueRechercher(cible);
  if (!resultats.length) {
    return '<p class="text-muted small">Aucun résultat pour « ' + echapperAttribut(cible) + ' ».</p>';
  }
  return '<div class="list-group">' +
    resultats.map(function (f) {
      return '<button type="button" class="list-group-item list-group-item-action" data-lexique-fiche="' + f.id + '">' +
        '<strong>' + echapperAttribut(f.titre) + '</strong>' +
        '</button>';
    }).join('') +
    '</div>';
}

// Rendu complet d'une fiche : titre, type/gabarit, univers, registres,
// contenu, "a ne pas confondre avec" et "voir aussi" (renvois calcules,
// voir index des relations plus haut), appartenance aux collections,
// bouton favori. Le bouton d'ancrage vers Repères n'est jamais rendu
// ici : voir entete de fichier et js/app.js (initAncrageLexiqueReperes()).
// TACHE (chantier "Ressources - 2e moitie", etape 2, 2026-08-29) : rendu
// du contenu d'une fiche "urgences" (data/urgences.js). `kind` vaut
// 'numeros', 'portes', ou une valeur inconnue -> chaine vide. Toujours
// suivi d'un bouton "Ressources locales de mon territoire" : au clic il
// demande le departement (une fois, via demanderDepartementSiInconnu) puis
// renvoie -- 87 vers PCGI 87, ailleurs vers les interlocuteurs generiques.
function _lexiqueRenduBlocUrgence(kind) {
  if (kind === 'numeros' && typeof URGENCES_NUMEROS !== 'undefined') {
    var lignes = URGENCES_NUMEROS.map(function (u) {
      return '<div class="lexique-urgence-item">' +
        '<a class="lexique-urgence-num" href="tel:' + echapperAttribut(u.numero) + '">' + echapperAttribut(u.numero) + '</a>' +
        '<div class="lexique-urgence-txt">' +
          '<p class="lexique-urgence-libelle mb-0"><strong>' + echapperAttribut(u.libelle) + '</strong></p>' +
          '<p class="small mb-0">' + echapperAttribut(u.detail) + '</p>' +
          '<p class="small text-muted mb-0">' + echapperAttribut(u.dispo) + '</p>' +
        '</div>' +
      '</div>';
    }).join('');
    return '<div class="lexique-urgence-bloc">' + lignes + _lexiqueBoutonRessourcesLocales() + '</div>';
  }
  if (kind === 'portes' && typeof URGENCES_PORTES !== 'undefined') {
    var portes = URGENCES_PORTES.map(function (p) {
      return '<div class="lexique-urgence-porte">' +
        '<p class="mb-1"><strong>' + echapperAttribut(p.situation) + '</strong></p>' +
        '<p class="small mb-1">Vers qui : ' + echapperAttribut(p.versQui) + '</p>' +
        '<p class="small text-muted mb-0">' + echapperAttribut(p.commentFaire) + '</p>' +
      '</div>';
    }).join('');
    return '<div class="lexique-urgence-bloc">' + portes + _lexiqueBoutonRessourcesLocales() + '</div>';
  }
  return '';
}

function _lexiqueBoutonRessourcesLocales() {
  return '<div class="lexique-urgence-local">' +
    '<button type="button" class="btn btn-outline-secondary btn-sm" data-lexique-urgence-local>' +
    '&#128205; Ressources locales de mon territoire</button>' +
    '</div>';
}

function _lexiqueRenduFiche(id) {
  var fiche = _lexiqueTrouverFiche(id);
  if (!fiche) { return '<p class="text-muted">Fiche introuvable.</p>'; }

  var libelleType = fiche.type === 'notion'
    ? 'Notion' + (_LEXIQUE_LIBELLES_GABARITS[fiche.gabarit] ? ' · ' + _LEXIQUE_LIBELLES_GABARITS[fiche.gabarit] : '')
    : 'Terme';
  var lienUnivers = '<button type="button" class="btn lien-famille-explorer align-baseline" ' +
    'data-lexique-bibliotheque-type="univers" data-lexique-bibliotheque-valeur="' + echapperAttribut(fiche.univers) + '">' +
    echapperAttribut(_LEXIQUE_LIBELLES_UNIVERS[fiche.univers] || fiche.univers) + '</button>';
  var lienRegistres = (fiche.registres || []).map(function (r) {
    return '<button type="button" class="btn lien-famille-explorer align-baseline" ' +
      'data-lexique-bibliotheque-type="registre" data-lexique-bibliotheque-valeur="' + echapperAttribut(r) + '">' +
      echapperAttribut(_LEXIQUE_LIBELLES_REGISTRES[r] || r) + '</button>';
  }).join(', ');

  var aNePasConfondre = _lexiqueRelationsDe(fiche.id, 'a-ne-pas-confondre');
  var voirAussi = _lexiqueRelationsDe(fiche.id, 'voir-aussi');

  // TACHE (chantier "repertoire des freins", etape 8) : une fiche generee
  // depuis data/freins.js (marqueur _freinCode) affiche, sous la
  // definition, les pistes + ressources A JOUR du frein (comment lever, qui
  // voir, ressources cliquables, ligne d'urgence si vital) -- re-rendues a
  // chaque affichage depuis data/freins.js, jamais figees [[LECONS 9.13]].
  // Degrade en silence (rien de plus que la definition) si le module Regard
  // exterieur n'est pas charge.
  var blocFrein = (fiche._freinCode && typeof regardExterieurRenduFicheFrein === 'function')
    ? regardExterieurRenduFicheFrein(fiche._freinCode, { sansDefinition: true })
    : '';

  // TACHE (chantier "Ressources - 2e moitie", etape 2) : fiche generee
  // depuis data/urgences.js (marqueur _urgence). "numeros" -> la liste des
  // numeros nationaux, chacun cliquable `tel:` ; "portes" -> le tableau
  // "situation -> a qui s'adresser". Degrade en silence si data/urgences.js
  // n'est pas charge.
  var blocUrgence = _lexiqueRenduBlocUrgence(fiche._urgence);

  // TACHE (chantier "Ressources - 2e moitie", etape 3) : encart de renvoi
  // annuaire sous une fiche "type de structure" -- la fiche d'abord, le
  // renvoi ensuite (jamais un renvoi sec). Le clic demande le departement
  // une fois puis ouvre l'annuaire (ouvrirRenvoiAnnuaire, js/app.js).
  var encartAnnuaire = _LEXIQUE_FICHES_TYPE_STRUCTURE[fiche.id]
    ? '<div class="lexique-encart-annuaire">' +
        '<p class="mb-1">Vous cherchez une structure de ce type près de chez vous ?</p>' +
        '<button type="button" class="btn btn-outline-secondary btn-sm" data-lexique-annuaire>&#128218; Voir l’annuaire des structures</button>' +
      '</div>'
    : '';

  // TACHE (echange Denis 2026-08-29) : renvoi local par fiche. Pour une
  // fiche "structure" -> remplace l'encart annuaire generique. Pour une
  // fiche "theme" -> encart ajoute (ateliers de l'ERIP en Dordogne).
  var renvoiLocal = _LEXIQUE_RENVOI_LOCAL_PAR_FICHE[fiche.id];
  var encartLocal = '';
  if (renvoiLocal) {
    if (renvoiLocal.type === 'structure') {
      encartAnnuaire = '';
      encartLocal = '<div class="lexique-encart-annuaire">' +
        '<p class="mb-1">Cette structure près de chez vous :</p>' +
        '<button type="button" class="btn btn-outline-secondary btn-sm" data-lexique-renvoi-local="' + echapperAttribut(fiche.id) + '">&#128205; Voir cette structure près de chez moi</button>' +
        '</div>';
    } else if (renvoiLocal.type === 'atelier') {
      encartLocal = '<div class="lexique-encart-annuaire">' +
        '<p class="mb-1">Des ateliers près de chez vous sur ' + echapperAttribut(renvoiLocal.sujet || 'ce sujet') + ' ?</p>' +
        '<button type="button" class="btn btn-outline-secondary btn-sm" data-lexique-renvoi-local="' + echapperAttribut(fiche.id) + '">&#128197; Voir les ateliers près de chez moi</button>' +
        '</div>';
    }
  }

  // TACHE (audit croise Cadre/Lexique/Chiffres, 2026-09-13) : meme principe
  // que voir_aussi_chiffres cote Comprendre le cadre (2026-09-12), mais
  // cote Lexique -- un seul bouton generique vers l'accueil de Comprendre
  // les chiffres (ce module n'a pas de fiche individuelle adressable),
  // avec la phrase du champ `voirAussiChiffres` de data/lexique.js comme
  // etiquette. Vide par defaut, jamais devine. Le clic est branche dans
  // _lexiqueBrancherFiche().
  var encartVoirAussiChiffres = fiche.voirAussiChiffres
    ? '<div class="lexique-encart-annuaire">' +
        '<p class="mb-1">Comprendre les chiffres montre, pour votre territoire, les chiffres réels derrière ce mot.</p>' +
        '<button type="button" class="btn btn-outline-secondary btn-sm" data-lexique-voir-aussi-chiffres="1">' +
          '<i class="bi bi-bar-chart"></i> ' + echapperAttribut(fiche.voirAussiChiffres) + ' (Comprendre les chiffres)</button>' +
      '</div>'
    : '';

  // TACHE (liens bidirectionnels, item 14 de TACHES_VALIDEES.md, decide
  // par Denis le 2026-09-13) : sens inverse du lien Cadre -> Lexique
  // (voir_aussi_lexique: sur les fiches Cadre). LEXIQUE_RENVOIS_CADRE
  // (data/lexique-renvois-cadre.js) est genere depuis ces memes fiches,
  // jamais saisi a la main ici -- une seule source de verite. Une fiche
  // Lexique peut etre citee par plusieurs fiches Cadre : un bouton par
  // fiche. Le clic est branche dans _lexiqueBrancherFiche().
  var renvoisCadre = (typeof LEXIQUE_RENVOIS_CADRE !== 'undefined' && LEXIQUE_RENVOIS_CADRE[fiche.id]) || [];
  var encartVoirAussiCadre = renvoisCadre.length
    ? '<div class="lexique-encart-annuaire">' +
        '<p class="mb-1">' + (renvoisCadre.length > 1
          ? 'Comprendre le cadre en parle dans plusieurs fiches :'
          : 'Comprendre le cadre en parle ici :') + '</p>' +
        renvoisCadre.map(function (r) {
          return '<button type="button" class="btn btn-outline-secondary btn-sm mb-1 me-1" ' +
            'data-lexique-voir-aussi-cadre-rayon="' + echapperAttribut(r.rayon) + '" ' +
            'data-lexique-voir-aussi-cadre-fiche="' + echapperAttribut(r.ficheId) + '">' +
            '<i class="bi bi-signpost-split"></i> ' + echapperAttribut(r.titre) + '</button>';
        }).join('') +
      '</div>'
    : '';

  // TACHE (refonte de la fiche, 2026-09-09,
  // docs/MAQUETTE_LEXIQUE_FICHE_2026-09-09.html) : la definition respire,
  // les renvois passent en petites pilules regroupees apres un filet fin,
  // favori + "Garder comme Repère" (insere par js/app.js) atterrissent
  // dans une barre d'actions encadree en bas (#lexiqueFicheActions).
  var renvoisHTML =
    _lexiqueRenduListeRelations('À ne pas confondre avec', aNePasConfondre) +
    _lexiqueRenduListeRelations('Voir aussi', voirAussi) +
    _lexiqueRenduAppartenanceCollections(fiche.id);
  var blocRenvois = renvoisHTML
    ? '<hr class="lexique-fiche-sep"><div class="lexique-fiche-renvois">' + renvoisHTML + '</div>'
    : '';

  return '<div class="page-catalogue-contenu" id="lexiqueFicheEcran" data-lexique-fiche-id="' + echapperAttribut(fiche.id) + '">' +
    '<button type="button" class="lexique-fiche-retour" id="lexiqueRetourRecherche">&larr; Retour à la recherche</button>' +
    '<p class="small text-muted mb-1">' + lienUnivers + (lienRegistres ? ' · ' + lienRegistres : '') + '</p>' +
    '<h1 class="h4 mb-1">' + echapperAttribut(fiche.titre) + '</h1>' +
    '<p class="small text-muted mb-2">' + libelleType + '</p>' +
    '<p class="lexique-fiche-def">' + echapperAttribut(fiche.corps) + '</p>' +
    (blocFrein ? '<div class="lexique-fiche-frein">' + blocFrein + '</div>' : '') +
    blocUrgence +
    encartAnnuaire +
    encartLocal +
    encartVoirAussiChiffres +
    encartVoirAussiCadre +
    _lexiqueRenduBoutonsSecondNiveau(fiche.id) +
    blocRenvois +
    '<div class="lexique-fiche-actions" id="lexiqueFicheActions">' + _lexiqueRenduBoutonFavori(fiche.id) + '</div>' +
    '</div>' +
    // TACHE (RC-03, correctif Retour absent, audit 2026-09-04) : meme
    // destination que le bouton "Retour a la recherche" deja dans la page
    // (_lexiqueBrancherFiche()) -- respecte le rappel personnalise
    // _lexiqueRetourFiche quand une origine precise a ete memorisee.
    // TACHE (2026-09-09) : bandeau fixe comme les autres modules.
    '<div class="barre-navigation-fixe">' +
    barreNavigation('cv', null, null, { onclickPrecedent: '(_lexiqueRetourFiche ? _lexiqueRetourFiche() : _lexiqueAfficherRecherche())' }) +
    '</div>';
}

// Etape 13 (ergonomie) : accordeon integre a la fiche -- plus d'ecran
// separe (revu par Denis apres usage reel de la version ecran de
// l'etape 10, voir ARCHITECTURE_TECHNIQUE.md). Le contenu reste sous les
// yeux, replie par defaut (aria-expanded="false", contenu "hidden"),
// jamais de re-rendu de la fiche au clic -- juste une bascule locale
// (voir _lexiqueBrancherFiche), pour ne perdre ni la position de
// lecture ni le contexte de retour deja construit aux etapes 6/7.
// Libelle simple si une seule cible ("En savoir plus"), differencie par
// titre si une fiche donne acces a plusieurs entrees (cas rare).
// TACHE (refonte de la fiche, 2026-09-09,
// docs/MAQUETTE_LEXIQUE_FICHE_2026-09-09.html) : "En savoir plus" devient
// un declencheur texte discret (chevron + libelle, sans cadre), le contenu
// s'ouvre dans un bloc legerement teinte. La bascule reste geree par
// _lexiqueBrancherFiche (data-lexique-accordion-toggle) -- on garde l'<i>
// chevron pour ne rien changer a ce cablage.
function _lexiqueRenduBoutonsSecondNiveau(ficheId) {
  var cibles = _lexiqueSecondNiveauDe(ficheId);
  if (!cibles.length) { return ''; }
  var unique = cibles.length === 1;
  var blocs = cibles.map(function (a) {
    return '<div class="lexique-fiche-plus">' +
      '<button type="button" class="lexique-fiche-plus-toggle" data-lexique-accordion-toggle="' + a.id + '" ' +
      'aria-expanded="false" aria-controls="lexiqueAccordion-' + a.id + '">' +
      '<i class="bi bi-chevron-right"></i> ' + (unique ? 'En savoir plus' : 'En savoir plus : ' + echapperAttribut(a.titre)) +
      '</button>' +
      '<div class="lexique-fiche-plus-corps" id="lexiqueAccordion-' + a.id + '" hidden><p class="mb-0">' + echapperAttribut(a.corps) + '</p></div>' +
      '</div>';
  }).join('');
  return '<div class="lexique-fiche-plus-zone">' + blocs + '</div>';
}

// Bouton etoile, mis a jour localement au clic (voir _lexiqueBrancherFiche)
// sans re-rendu complet de la fiche -- garde le contexte de retour
// (Mode Livre, Favoris...) intact. Depuis la refonte de la fiche
// (2026-09-09) : pilule compacte dans la barre d'actions du bas.
function _lexiqueRenduBoutonFavori(id) {
  var favori = _lexiqueEstFavori(id);
  return '<button type="button" class="lexique-fiche-action lexique-fiche-action-favori" id="lexiqueBoutonFavori" ' +
    'data-lexique-fiche-id="' + echapperAttribut(id) + '" aria-pressed="' + (favori ? 'true' : 'false') + '">' +
    _lexiqueContenuBoutonFavori(favori) + '</button>';
}

function _lexiqueContenuBoutonFavori(favori) {
  return '<i class="bi ' + (favori ? 'bi-star-fill' : 'bi-star') + '"></i> ' +
    (favori ? 'Dans mes favoris' : 'Ajouter aux favoris');
}

// Une liste de boutons cliquables vers d'autres fiches (reutilise la
// meme navigation interne que les resultats de recherche). N'affiche
// rien si la liste est vide -- jamais un titre de rubrique sans contenu.
// Prend directement une liste d'identifiants (sortie de
// _lexiqueRelationsDe()), plus une liste d'objets {ficheId} depuis
// l'etape 3.
// TACHE (refonte de la fiche, 2026-09-09) : une rangee de liste de
// definition -- le libelle a gauche, des petites pilules a droite -- au
// lieu de gros boutons bordes qui pesaient plus lourd que la definition.
// Chaque pilule garde data-lexique-fiche : la navigation ne change pas.
function _lexiqueRenduListeRelations(titre, idsCibles) {
  if (!idsCibles.length) { return ''; }
  var pastilles = idsCibles.map(function (id) {
    var cible = _lexiqueTrouverFiche(id);
    if (!cible) { return ''; }
    return '<button type="button" class="lexique-fiche-lien" data-lexique-fiche="' + cible.id + '">' +
      echapperAttribut(cible.titre) + '</button>';
  }).join('');
  if (!pastilles) { return ''; }
  return '<div class="lexique-fiche-renvoi">' +
    '<span class="lexique-fiche-renvoi-lib">' + titre + '</span>' +
    '<span class="lexique-fiche-renvoi-pastilles">' + pastilles + '</span>' +
    '</div>';
}

// Rappel, sur la fiche, des collections/parcours qui la citent --
// jamais l'inverse (voir _lexiqueCollectionsDe). N'affiche rien si la
// fiche n'appartient a aucune collection.
function _lexiqueRenduAppartenanceCollections(ficheId) {
  var collections = _lexiqueCollectionsDe(ficheId);
  if (!collections.length) { return ''; }
  var pastilles = collections.map(function (c) {
    return '<button type="button" class="lexique-fiche-lien" data-lexique-collection="' + c.id + '">' +
      c.icone + ' ' + echapperAttribut(c.titre) + '</button>';
  }).join('');
  // TACHE (refonte de la fiche, 2026-09-09) : meme rangee de liste de
  // definition que les relations ; libelle raccourci en "Dans le theme".
  return '<div class="lexique-fiche-renvoi">' +
    '<span class="lexique-fiche-renvoi-lib">Dans le thème</span>' +
    '<span class="lexique-fiche-renvoi-pastilles">' + pastilles + '</span>' +
    '</div>';
}

// Liste des 2 collections/parcours ecrits a ce jour. Simple porte
// d'entree vers _lexiqueRenduCollection() -- aucun contenu propre.
function _lexiqueRenduListeCollections() {
  var items = LEXIQUE_COLLECTIONS.map(function (c) {
    return '<button type="button" class="list-group-item list-group-item-action" data-lexique-collection="' + c.id + '">' +
      '<span class="me-2">' + c.icone + '</span><strong>' + echapperAttribut(c.titre) + '</strong>' +
      '</button>';
  }).join('');
  return '<div class="page-catalogue-contenu" id="lexiqueCollectionsEcran">' +
    '<button type="button" class="btn btn-outline-secondary btn-sm mb-3" id="lexiqueRetourRechercheCollections">&larr; Retour à la recherche</button>' +
    '<h1 class="h4 mb-3">Collections et parcours</h1>' +
    '<div class="list-group">' + items + '</div>' +
    '</div>' +
    // TACHE (RC-03, correctif Retour absent, audit 2026-09-04) : meme
    // destination que le bouton "Retour a la recherche" deja dans la page.
    // TACHE (2026-09-09) : bandeau fixe comme les autres modules.
    '<div class="barre-navigation-fixe">' +
    barreNavigation('cv', null, null, { onclickPrecedent: '_lexiqueAfficherRecherche()' }) +
    '</div>';
}

// Rendu d'une collection ou d'un parcours : meme structure de donnees,
// seul l'affichage change selon "mode" (docs/MAQUETTE_LEXIQUE.md
// section 3). Parcours : accroche + ordre numerote. Collection :
// simple liste, l'ordre n'a pas de valeur de lecture. Aucune donnee
// propre au-dela du titre/icone/accroche/ordre -- le contenu affiche
// vient entierement des fiches deja ecrites.
function _lexiqueRenduCollection(id) {
  var collection = _lexiqueTrouverCollection(id);
  if (!collection) { return '<p class="text-muted">Introuvable.</p>'; }
  var estParcours = collection.mode === 'parcours';
  var fiches = (collection.fichesOrdonnees || []).map(_lexiqueTrouverFiche).filter(Boolean);
  var items = fiches.map(function (f, i) {
    var prefixe = estParcours ? (i + 1) + '. ' : '';
    return '<button type="button" class="list-group-item list-group-item-action" data-lexique-fiche="' + f.id + '">' +
      prefixe + echapperAttribut(f.titre) + '</button>';
  }).join('');
  // TACHE (audit robustesse, 2026-09-11) : ouverte directement depuis une
  // carte theme de l'accueil (_lexiqueCollectionRetour pose), le bouton
  // "Retour" ne doit pas ramener a la liste "Collections et parcours" --
  // un ecran jamais visite dans ce chemin -- mais a l'accueil. Meme
  // principe que _lexiqueBibliothequeRetour pour la Bibliotheque.
  var retourVersAccueil = typeof _lexiqueCollectionRetour === 'function';
  var retourLabelCollection = retourVersAccueil ? '&larr; Retour' : '&larr; Retour aux collections et parcours';
  return '<div class="page-catalogue-contenu" id="lexiqueCollectionEcran">' +
    '<button type="button" class="btn btn-outline-secondary btn-sm mb-3" id="lexiqueRetourListeCollections">' + retourLabelCollection + '</button>' +
    '<h1 class="h4 mb-1">' + collection.icone + ' ' + echapperAttribut(collection.titre) + '</h1>' +
    (estParcours && collection.accroche ? '<p class="text-muted mb-3">' + echapperAttribut(collection.accroche) + '</p>' : '') +
    '<div class="list-group">' + items + '</div>' +
    '</div>' +
    // TACHE (RC-03, correctif Retour absent, audit 2026-09-04) : meme
    // destination que le bouton "Retour aux collections et parcours" deja
    // dans la page.
    // TACHE (2026-09-09) : bandeau fixe comme les autres modules.
    '<div class="barre-navigation-fixe">' +
    barreNavigation('cv', null, null, { onclickPrecedent: '_lexiqueCollectionRetourAppel()' }) +
    '</div>';
}

// Appelee depuis onclickPrecedent (chaine, portee globale) -- delegue au
// retour personnalise si present, sinon au comportement d'origine.
function _lexiqueCollectionRetourAppel() {
  if (typeof _lexiqueCollectionRetour === 'function') { _lexiqueCollectionRetour(); }
  else { _lexiqueAfficherListeCollections(); }
}

// Liste des fiches marquees favorites, plus recentes en premier
// (l'ordre de stockage n'est jamais modifie, seul l'affichage inverse).
// Distinct de l'ancrage vers Repères -- doctrine, principe 9 : retrouver
// une fiche rapidement, jamais nourrir une reflexion personnelle.
function _lexiqueRenduFavoris() {
  var fiches = _lexiqueFavoris().map(_lexiqueTrouverFiche).filter(Boolean).reverse();
  var contenu = fiches.length
    ? '<div class="list-group">' + fiches.map(function (f) {
      return '<button type="button" class="list-group-item list-group-item-action" data-lexique-fiche="' + f.id + '">' +
        echapperAttribut(f.titre) + '</button>';
    }).join('') + '</div>'
    : '<p class="text-muted">Aucune fiche en favoris pour le moment. Cliquez sur l’étoile d’une fiche pour la retrouver ici.</p>';
  return '<div class="page-catalogue-contenu" id="lexiqueFavorisEcran">' +
    '<button type="button" class="btn btn-outline-secondary btn-sm mb-3" id="lexiqueRetourRechercheFavoris">&larr; Retour à la recherche</button>' +
    '<h1 class="h4 mb-3">Mes favoris</h1>' +
    contenu +
    '</div>' +
    // TACHE (RC-03, correctif Retour absent, audit 2026-09-04) : meme
    // destination que le bouton "Retour a la recherche" deja dans la page.
    // TACHE (2026-09-09) : bandeau fixe comme les autres modules.
    '<div class="barre-navigation-fixe">' +
    barreNavigation('cv', null, null, { onclickPrecedent: '_lexiqueAfficherRecherche()' }) +
    '</div>';
}

// Etape 11 -- liste generique de toutes les fiches partageant un meme
// univers ou un meme registre. "type" vaut 'univers' ou 'registre',
// "valeur" est le slug -- aucune valeur en dur, fonctionne pour tout
// univers/registre present dans le corpus. Triee par titreDeTri, meme
// convention que le Mode Livre.
function _lexiqueRenduBibliotheque(type, valeur) {
  var estUnivers = type === 'univers';
  var libelle = estUnivers ? (_LEXIQUE_LIBELLES_UNIVERS[valeur] || valeur) : (_LEXIQUE_LIBELLES_REGISTRES[valeur] || valeur);
  var fiches = (estUnivers ? _lexiqueFichesParUnivers(valeur) : _lexiqueFichesParRegistre(valeur)).slice().sort(function (a, b) {
    return (a.titreDeTri || a.titre).localeCompare(b.titreDeTri || b.titre);
  });
  var items = fiches.map(function (f) {
    return '<button type="button" class="list-group-item list-group-item-action" data-lexique-fiche="' + f.id + '">' +
      echapperAttribut(f.titre) + '</button>';
  }).join('');
  // TACHE (refonte accueil 2026-09-09) : quand la bibliotheque est ouverte
  // depuis "Parcourir par domaine" (_lexiqueBibliothequeRetour pose), le
  // bouton "Retour" ramene a la liste des domaines, pas a une fiche.
  var retourVersDomaines = typeof _lexiqueBibliothequeRetour === 'function';
  var retourLabel = retourVersDomaines ? '&larr; Retour aux domaines' : '&larr; Retour à la fiche';
  var retourExpr = retourVersDomaines
    ? '_lexiqueBibliothequeRetourAppel()'
    : '_lexiqueAfficherFiche(_lexiqueBibliothequeFicheOrigine)';
  return '<div class="page-catalogue-contenu" id="lexiqueBibliothequeEcran" ' +
    'data-lexique-bibliotheque-type="' + echapperAttribut(type) + '" data-lexique-bibliotheque-valeur="' + echapperAttribut(valeur) + '">' +
    '<button type="button" class="btn btn-outline-secondary btn-sm mb-3" id="lexiqueRetourFicheBibliotheque">' + retourLabel + '</button>' +
    '<p class="small text-muted mb-1">' + (estUnivers ? 'Domaine' : 'Registre') + '</p>' +
    '<h1 class="h4 mb-3">' + echapperAttribut(libelle) + '</h1>' +
    '<div class="list-group">' + items + '</div>' +
    '</div>' +
    // TACHE (RC-03, correctif Retour absent, audit 2026-09-04) : meme
    // destination que le bouton en haut de page (_lexiqueBrancherBibliotheque()).
    // TACHE (2026-09-09) : bandeau fixe comme les autres modules.
    '<div class="barre-navigation-fixe">' +
    barreNavigation('cv', null, null, { onclickPrecedent: retourExpr }) +
    '</div>';
}

// Appelee depuis onclickPrecedent (chaine, portee globale) -- delegue au
// retour personnalise si present, sinon au comportement d'origine.
function _lexiqueBibliothequeRetourAppel() {
  if (typeof _lexiqueBibliothequeRetour === 'function') { _lexiqueBibliothequeRetour(); }
  else { _lexiqueAfficherFiche(_lexiqueBibliothequeFicheOrigine); }
}

// TACHE (refonte accueil 2026-09-09) : "Parcourir par domaine". Liste des
// domaines (univers) du corpus dans l'ORDRE ALPHABETIQUE (les urgences
// tombent a leur lettre, jamais epinglees -- decision Denis). N'affiche
// que les domaines qui ont au moins une fiche. Chaque domaine ouvre la
// bibliotheque deja existante (etape 11) filtree sur cet univers, avec un
// Retour vers cette liste.
function _lexiqueRenduDomaines() {
  var items = Object.keys(_LEXIQUE_LIBELLES_UNIVERS)
    .filter(function (slug) { return _lexiqueFichesParUnivers(slug).length > 0; })
    .map(function (slug) { return { slug: slug, libelle: _LEXIQUE_LIBELLES_UNIVERS[slug] }; })
    .sort(function (a, b) { return a.libelle.localeCompare(b.libelle, 'fr'); })
    .map(function (d) {
      return '<button type="button" class="list-group-item list-group-item-action" ' +
        'data-lexique-domaine="' + echapperAttribut(d.slug) + '">' + echapperAttribut(d.libelle) + '</button>';
    }).join('');
  return '<div class="page-catalogue-contenu" id="lexiqueDomainesEcran">' +
    '<button type="button" class="btn btn-outline-secondary btn-sm mb-3" id="lexiqueRetourRechercheDomaines">' +
      '&larr; Retour à la recherche</button>' +
    '<h1 class="h4 mb-3">Parcourir par domaine</h1>' +
    '<div class="list-group">' + items + '</div>' +
    '</div>' +
    '<div class="barre-navigation-fixe">' +
    barreNavigation('cv', null, null, { onclickPrecedent: '_lexiqueAfficherRecherche()' }) +
    '</div>';
}
function _lexiqueAfficherDomaines() {
  app.innerHTML = _lexiqueRenduDomaines();
  _lexiqueBrancherDomaines();
  window.scrollTo(0, 0);
}
function _lexiqueBrancherDomaines() {
  var zone = document.getElementById('lexiqueDomainesEcran');
  if (!zone) { return; }
  zone.addEventListener('click', function (e) {
    if (e.target.closest('#lexiqueRetourRechercheDomaines')) { _lexiqueAfficherRecherche(); return; }
    var bouton = e.target.closest('[data-lexique-domaine]');
    if (bouton) {
      _lexiqueAfficherBibliotheque('univers', bouton.dataset.lexiqueDomaine, null, _lexiqueAfficherDomaines);
    }
  });
}

// ============================================================
// EVENEMENTS
// ============================================================

function _lexiqueBrancherRecherche() {
  var champ = document.getElementById('lexiqueRechercheInput');
  var zone = document.getElementById('lexiqueResultats');
  var boutonCollections = document.getElementById('lexiqueVoirCollections');
  var boutonModeLivre = document.getElementById('lexiqueVoirModeLivre');
  var boutonFavoris = document.getElementById('lexiqueVoirFavoris');
  // TACHE (patron page d'introduction, 2026-08-31) : bouton permanent
  // "Revoir la presentation du module".
  var boutonRevoirIntro = document.getElementById('btnLexiqueRevoirIntro');
  if (boutonRevoirIntro) { boutonRevoirIntro.addEventListener('click', lexiqueRevoirPresentation); }
  if (!champ || !zone) { return; }
  // Suivi debounce (600ms apres la derniere frappe, seuil de 2 caracteres),
  // meme discipline que rechercheERIPInput (js/app.js, TACHE 33A) : jamais
  // un evenement par caractere tape. Evenements distincts de
  // recherche_utilisee/recherche_sans_resultat (recherche metiers) pour ne
  // pas melanger deux signaux differents -- voir ARCHITECTURE_TECHNIQUE.md.
  var minuteurTrackRechercheLexique = null;
  champ.addEventListener('input', function () {
    zone.innerHTML = _lexiqueRenduResultats(champ.value);
    var texteRecherche = champ.value;
    if (minuteurTrackRechercheLexique) { clearTimeout(minuteurTrackRechercheLexique); }
    minuteurTrackRechercheLexique = setTimeout(function () {
      minuteurTrackRechercheLexique = null;
      if (!texteRecherche || normaliserTexte(texteRecherche).trim().length < 2) { return; }
      if (typeof trackEvenement !== 'function') { return; }
      var texteTronque = texteRecherche.slice(0, 100);
      trackEvenement('lexique_recherche_utilisee', { texte: texteTronque });
      if (_lexiqueRechercher(texteRecherche).length === 0) {
        trackEvenement('lexique_recherche_sans_resultat', { texte: texteTronque });
      }
    }, 600);
  });
  zone.addEventListener('click', function (e) {
    var bouton = e.target.closest('[data-lexique-fiche]');
    if (!bouton) { return; }
    _lexiqueAfficherFiche(bouton.dataset.lexiqueFiche);
  });
  if (boutonCollections) {
    boutonCollections.addEventListener('click', _lexiqueAfficherListeCollections);
  }
  if (boutonModeLivre) {
    boutonModeLivre.addEventListener('click', function () {
      _lexiqueModeLivrePosition = 0;
      _lexiqueAfficherModeLivre();
    });
  }
  if (boutonFavoris) {
    boutonFavoris.addEventListener('click', _lexiqueAfficherFavoris);
  }

  // ---------- Refonte accueil 2026-09-09 ----------
  var boutonDomaines = document.getElementById('lexiqueVoirDomaines');
  if (boutonDomaines) { boutonDomaines.addEventListener('click', _lexiqueAfficherDomaines); }

  // Niveau 2 : une carte de theme -> la collection / le parcours.
  var zoneThemes = document.getElementById('lexiqueAccueilThemes');
  if (zoneThemes) {
    zoneThemes.addEventListener('click', function (e) {
      var carte = e.target.closest('[data-lexique-collection]');
      // TACHE (audit robustesse, 2026-09-11) : ouverte depuis l'accueil,
      // pas depuis la liste "Collections et parcours" -- le bouton Retour
      // doit ramener ici, jamais vers un ecran jamais visite.
      if (carte) { _lexiqueAfficherCollection(carte.dataset.lexiqueCollection, _lexiqueAfficherRecherche); }
    });
  }

  // Niveau 1 : un exemple -> pre-remplit la recherche et affiche les
  // resultats, exactement comme lexiqueOuvrirRecherche() depuis l'accueil.
  var zoneExemples = document.getElementById('lexiqueAccueilExemplesLot');
  if (zoneExemples && champ && zone) {
    zoneExemples.addEventListener('click', function (e) {
      var pastille = e.target.closest('[data-lexique-exemple]');
      if (!pastille) { return; }
      var mot = pastille.getAttribute('data-lexique-exemple') || '';
      champ.value = mot;
      zone.innerHTML = _lexiqueRenduResultats(mot);
      champ.focus();
    });
  }

  // La ligne d'exemples ne descend jamais sur 2 lignes : on l'ajuste apres
  // que la mise en page soit calculee (requestAnimationFrame -- sinon
  // clientWidth n'est pas encore fiable juste apres innerHTML), et a chaque
  // redimensionnement (handler nomme, reattache proprement -- LECONS 9.7).
  // Ajustement de la ligne d'exemples : differe le temps que la mise en
  // page soit calculee (clientWidth pas fiable juste apres innerHTML).
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(function () { requestAnimationFrame(_lexiqueAjusterExemples); });
  } else {
    setTimeout(_lexiqueAjusterExemples, 0);
  }
  // La rotation "page vivante" demarre tout de suite (setInterval, jamais
  // dependant du rAF -- voir _lexiqueDemarrerAccueilVivant).
  _lexiqueDemarrerAccueilVivant();
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', _lexiqueAccueilSurResize);
    window.addEventListener('resize', _lexiqueAccueilSurResize);
  }
}

function _lexiqueBrancherFiche() {
  var zone = document.getElementById('lexiqueFicheEcran');
  if (!zone) { return; }
  zone.addEventListener('click', function (e) {
    if (e.target.closest('#lexiqueRetourRecherche')) {
      if (_lexiqueRetourFiche) { _lexiqueRetourFiche(); } else { _lexiqueAfficherRecherche(); }
      return;
    }
    var boutonFavori = e.target.closest('#lexiqueBoutonFavori');
    if (boutonFavori) {
      _lexiqueBasculerFavori(boutonFavori.dataset.lexiqueFicheId);
      boutonFavori.setAttribute('aria-pressed', _lexiqueEstFavori(boutonFavori.dataset.lexiqueFicheId) ? 'true' : 'false');
      boutonFavori.innerHTML = _lexiqueContenuBoutonFavori(_lexiqueEstFavori(boutonFavori.dataset.lexiqueFicheId));
      return;
    }
    var boutonCollection = e.target.closest('[data-lexique-collection]');
    if (boutonCollection) { _lexiqueAfficherCollection(boutonCollection.dataset.lexiqueCollection); return; }
    var boutonBibliotheque = e.target.closest('[data-lexique-bibliotheque-type]');
    if (boutonBibliotheque) {
      _lexiqueAfficherBibliotheque(boutonBibliotheque.dataset.lexiqueBibliothequeType, boutonBibliotheque.dataset.lexiqueBibliothequeValeur, zone.dataset.lexiqueFicheId);
      return;
    }
    var boutonAccordion = e.target.closest('[data-lexique-accordion-toggle]');
    if (boutonAccordion) {
      var contenu = document.getElementById('lexiqueAccordion-' + boutonAccordion.dataset.lexiqueAccordionToggle);
      if (contenu) {
        var ouvert = contenu.hidden === false;
        contenu.hidden = ouvert;
        boutonAccordion.setAttribute('aria-expanded', ouvert ? 'false' : 'true');
        boutonAccordion.querySelector('i').className = ouvert ? 'bi bi-chevron-right' : 'bi bi-chevron-down';
      }
      return;
    }
    // TACHE (chantier "Ressources - 2e moitie", etape 2) : "Ressources
    // locales de mon territoire" sur une fiche Urgences -- demande le
    // departement une fois puis renvoie (87 -> PCGI 87 ; ailleurs ->
    // interlocuteurs generiques, jamais une adresse inventee).
    if (e.target.closest('[data-lexique-urgence-local]')) {
      if (typeof demanderDepartementSiInconnu === 'function') {
        demanderDepartementSiInconnu(_lexiqueRenvoiRessourcesLocales);
      }
      return;
    }
    // TACHE (chantier "Ressources - 2e moitie", etape 3) : encart annuaire
    // d'une fiche "type de structure".
    if (e.target.closest('[data-lexique-annuaire]')) {
      if (typeof ouvrirRenvoiAnnuaire === 'function') {
        ouvrirRenvoiAnnuaire('Pour trouver « ' + (_lexiqueTrouverFiche(zone.dataset.lexiqueFicheId) || {}).titre + ' » près de chez vous :');
      }
      return;
    }
    // TACHE (audit croise Cadre/Lexique/Chiffres, 2026-09-13) : meme
    // principe que le lien voir_aussi_chiffres de Comprendre le cadre,
    // mais vers l'accueil de Comprendre les chiffres (pas de fiche
    // individuelle adressable dans ce module).
    if (e.target.closest('[data-lexique-voir-aussi-chiffres]')) {
      var ficheIdActuelle = zone.dataset.lexiqueFicheId;
      var retourActuel = _lexiqueRetourFiche;
      naviguerVers('comprendre-les-chiffres');
      if (typeof definirRetourModuleExterne === 'function') {
        definirRetourModuleExterne('Lexique', function () {
          naviguerVers('lexique');
          _lexiqueAfficherFiche(ficheIdActuelle, retourActuel);
        }, 'lexique', 'comprendre-les-chiffres');
      }
      return;
    }
    // TACHE (liens bidirectionnels, item 14 de TACHES_VALIDEES.md, decide
    // par Denis le 2026-09-13) : sens inverse de voir_aussi_lexique, vers
    // UNE fiche precise de Comprendre le cadre (contrairement au lien
    // Chiffres ci-dessus, ce module a bien des fiches individuelles
    // adressables). Meme mecanique de "retour" que voir-aussi-chiffres.
    var btnVoirAussiCadre = e.target.closest('[data-lexique-voir-aussi-cadre-fiche]');
    if (btnVoirAussiCadre) {
      var ficheIdActuelleCadre = zone.dataset.lexiqueFicheId;
      var retourActuelCadre = _lexiqueRetourFiche;
      if (typeof comprendreLeCadreOuvrirFiche === 'function') {
        comprendreLeCadreOuvrirFiche(
          btnVoirAussiCadre.dataset.lexiqueVoirAussiCadreRayon,
          btnVoirAussiCadre.dataset.lexiqueVoirAussiCadreFiche,
          'Lexique', 'lexique', function () {
            naviguerVers('lexique');
            _lexiqueAfficherFiche(ficheIdActuelleCadre, retourActuelCadre);
          });
      }
      return;
    }
    // TACHE (echange Denis 2026-08-29) : renvoi local par fiche (lien direct
    // de la structure pour le 24, ateliers de l'ERIP du Bergeracois...).
    var btnLocal = e.target.closest('[data-lexique-renvoi-local]');
    if (btnLocal) {
      _lexiqueRenvoiLocalParFiche(btnLocal.getAttribute('data-lexique-renvoi-local'));
      return;
    }
    // TACHE (chantier "Ressources - 2e moitie", etape 6b) : "Des structures
    // pres de chez vous" au bas d'une fiche frein (rendue par
    // regardExterieurRenduFicheFrein dans .lexique-fiche-frein).
    var btnStruct = e.target.closest('[data-frein-structures-locales]');
    if (btnStruct) {
      if (typeof ouvrirRenvoiAnnuaire === 'function') {
        ouvrirRenvoiAnnuaire('Pour « ' + btnStruct.getAttribute('data-frein-structures-locales') + ' », des structures près de chez vous :');
      }
      return;
    }
    var bouton = e.target.closest('[data-lexique-fiche]');
    if (bouton) { _lexiqueAfficherFiche(bouton.dataset.lexiqueFiche); }
  });
}

// Renvoi apres choix du departement (voir _lexiqueBoutonRessourcesLocales).
// 87 -> le site PCGI 87 (RESSOURCES_DEPARTEMENTS, js/app.js), qui a sa
// propre page Urgences a jour. Ailleurs -> une petite fenetre qui redit
// les interlocuteurs de proximite (CCAS / MDS), jamais un lien local
// invente.
function _lexiqueRenvoiRessourcesLocales(dep) {
  if (dep === '87' && typeof RESSOURCES_DEPARTEMENTS !== 'undefined'
      && RESSOURCES_DEPARTEMENTS['87'] && RESSOURCES_DEPARTEMENTS['87'].lien) {
    window.open(RESSOURCES_DEPARTEMENTS['87'].lien.url, '_blank', 'noopener');
    return;
  }
  if (typeof ouvrirFenetreERIP === 'function') {
    var lienChanger = (typeof htmlLienChangerDepartement === 'function') ? htmlLienChangerDepartement() : '';
    var overlay = ouvrirFenetreERIP({
      titre: '&#128205; Vos interlocuteurs de proximité',
      aideContexte: 'ressources-locales',
      contenuHTML:
        '<p>Où que vous soyez, deux portes existent près de chez vous :</p>' +
        '<ul>' +
        '<li>Le <strong>CCAS</strong> (Centre Communal d\'Action Sociale) de votre mairie.</li>' +
        '<li>La <strong>Maison Départementale des Solidarités (MDS)</strong> de votre secteur.</li>' +
        '</ul>' +
        '<p class="small text-muted mb-0">Ils peuvent débloquer une aide d\'urgence et vous orienter vers les bons dispositifs de votre département.</p>' +
        lienChanger
    });
    var b = overlay && overlay.querySelector('[data-changer-departement]');
    if (b) {
      b.addEventListener('click', function () {
        if (typeof oublierDepartementRessources === 'function') { oublierDepartementRessources(); }
        fermerFenetreERIP();
        if (typeof demanderDepartementSiInconnu === 'function') {
          demanderDepartementSiInconnu(_lexiqueRenvoiRessourcesLocales);
        }
      });
    }
  }
}

// TACHE (echange Denis 2026-08-29) : renvoi local par fiche. Demande le
// departement une fois, puis :
//  - fiche 'structure' : 24 -> le lien direct de la structure du
//    Bergeracois ; 87 / ailleurs -> l'annuaire (ouvrirRenvoiAnnuaire) ou,
//    pour "ailleurs" avec un texte, ce texte puis l'annuaire.
//  - fiche 'atelier' : 24 -> l'ERIP du Bergeracois (ateliers mensuels
//    gratuits, dates variables -> on renvoie vers le programme, jamais une
//    date) ; 87 / ailleurs -> l'annuaire.
function _lexiqueRenvoiLocalParFiche(ficheId) {
  var conf = _LEXIQUE_RENVOI_LOCAL_PAR_FICHE[ficheId];
  if (!conf || typeof demanderDepartementSiInconnu !== 'function') { return; }
  var fiche = _lexiqueTrouverFiche(ficheId) || {};
  var titre = fiche.titre || 'ce sujet';
  // Ouvre une fenetre ERIP + le lien "changer de departement" en pied,
  // cable pour rouvrir CETTE meme fenetre (retour Denis 2026-08-29).
  function ouvrirAvecChangerDep(titreFenetre, corpsHTML) {
    var lienChanger = (typeof htmlLienChangerDepartement === 'function') ? htmlLienChangerDepartement() : '';
    var overlay = ouvrirFenetreERIP({
      titre: titreFenetre,
      aideContexte: 'renvoi-annuaire',
      contenuHTML: corpsHTML + lienChanger
    });
    var b = overlay && overlay.querySelector('[data-changer-departement]');
    if (b) {
      b.addEventListener('click', function () {
        if (typeof oublierDepartementRessources === 'function') { oublierDepartementRessources(); }
        fermerFenetreERIP();
        _lexiqueRenvoiLocalParFiche(ficheId);
      });
    }
  }
  demanderDepartementSiInconnu(function (dep) {
    if (conf.type === 'atelier') {
      if (dep === '24' && typeof ouvrirFenetreERIP === 'function') {
        ouvrirAvecChangerDep('&#128205; Des ateliers en Dordogne',
          '<p class="small mb-3">En Dordogne, l’ERIP du Bergeracois (porté par la Mission Locale) propose <strong>chaque mois</strong> des ateliers gratuits, notamment sur ' + echapperAttribut(conf.sujet || 'ce sujet') + '. Les dates changent d’un mois à l’autre : consultez le programme et inscrivez-vous en ligne.</p>' +
          '<a class="btn btn-outline-secondary text-start" href="' + echapperAttribut(_LEXIQUE_ERIP_BERGERACOIS_URL) + '" target="_blank" rel="noopener noreferrer"><strong>ERIP du Bergeracois - programme et inscription</strong> &#8599;</a>' +
          '<p class="small text-muted mt-3 mb-0">&#8599; Ouvre un autre site dans un nouvel onglet. Vous pouvez revenir ici à tout moment.</p>');
        return;
      }
      if (typeof ouvrirRenvoiAnnuaire === 'function') {
        ouvrirRenvoiAnnuaire('Pour « ' + titre + ' », des structures et des ateliers près de chez vous :');
      }
      return;
    }
    // type 'structure'
    var lien = conf[dep];
    if (!lien || lien === 'annuaire') {
      if (typeof ouvrirRenvoiAnnuaire === 'function') {
        ouvrirRenvoiAnnuaire('Pour « ' + titre + ' » près de chez vous :');
      }
      return;
    }
    if (lien.texteAvantAnnuaire) {
      if (typeof ouvrirRenvoiAnnuaire === 'function') {
        ouvrirRenvoiAnnuaire(lien.texteAvantAnnuaire + ' Sinon, un annuaire national :');
      }
      return;
    }
    if (typeof ouvrirFenetreERIP === 'function') {
      ouvrirAvecChangerDep('&#128205; ' + echapperAttribut(titre),
        (lien.texte ? '<p class="small mb-3">' + echapperAttribut(lien.texte) + '</p>' : '') +
        (lien.url
          ? '<a class="btn btn-outline-secondary text-start" href="' + echapperAttribut(lien.url) + '" target="_blank" rel="noopener noreferrer"><strong>' + echapperAttribut(titre) + '</strong> &#8599;</a>'
          : '') +
        '<p class="small text-muted mt-3 mb-0">&#8599; Ouvre un autre site dans un nouvel onglet. Vous pouvez revenir ici à tout moment.</p>');
    }
  });
}

function _lexiqueBrancherBibliotheque() {
  var zone = document.getElementById('lexiqueBibliothequeEcran');
  if (!zone) { return; }
  zone.addEventListener('click', function (e) {
    if (e.target.closest('#lexiqueRetourFicheBibliotheque')) {
      _lexiqueBibliothequeRetourAppel();
      return;
    }
    var bouton = e.target.closest('[data-lexique-fiche]');
    if (bouton) {
      var type = zone.dataset.lexiqueBibliothequeType;
      var valeur = zone.dataset.lexiqueBibliothequeValeur;
      var origine = _lexiqueBibliothequeFicheOrigine;
      // Refonte accueil 2026-09-09 : on garde le retour personnalise
      // (liste des domaines) quand on ouvre puis referme une fiche.
      var retourPerso = _lexiqueBibliothequeRetour;
      _lexiqueAfficherFiche(bouton.dataset.lexiqueFiche, function () {
        _lexiqueAfficherBibliotheque(type, valeur, origine, retourPerso);
      });
    }
  });
}

function _lexiqueBrancherModeLivre() {
  var zone = document.getElementById('lexiqueModeLivreEcran');
  if (!zone) { return; }
  var boutonCollections = document.getElementById('lexiqueModeLivreVoirCollections');
  zone.addEventListener('click', function (e) {
    if (e.target.closest('#lexiqueRetourRechercheModeLivre')) { _lexiqueAfficherRecherche(); return; }
    var bouton = e.target.closest('[data-lexique-fiche]');
    if (bouton) {
      _lexiqueModeLivrePosition = window.scrollY;
      _lexiqueAfficherFiche(bouton.dataset.lexiqueFiche, _lexiqueAfficherModeLivre);
    }
  });
  if (boutonCollections) {
    boutonCollections.addEventListener('click', _lexiqueAfficherListeCollections);
  }
}

function _lexiqueBrancherListeCollections() {
  var zone = document.getElementById('lexiqueCollectionsEcran');
  if (!zone) { return; }
  zone.addEventListener('click', function (e) {
    if (e.target.closest('#lexiqueRetourRechercheCollections')) { _lexiqueAfficherRecherche(); return; }
    var bouton = e.target.closest('[data-lexique-collection]');
    if (bouton) { _lexiqueAfficherCollection(bouton.dataset.lexiqueCollection); }
  });
}

function _lexiqueBrancherCollection() {
  var zone = document.getElementById('lexiqueCollectionEcran');
  if (!zone) { return; }
  zone.addEventListener('click', function (e) {
    // TACHE (audit robustesse, 2026-09-11) : meme correctif que le bouton
    // du bandeau fixe (barreNavigation) -- ce bouton en haut de page
    // ignorait encore _lexiqueCollectionRetour.
    if (e.target.closest('#lexiqueRetourListeCollections')) { _lexiqueCollectionRetourAppel(); return; }
    var bouton = e.target.closest('[data-lexique-fiche]');
    if (bouton) { _lexiqueAfficherFiche(bouton.dataset.lexiqueFiche); }
  });
}

function _lexiqueBrancherFavoris() {
  var zone = document.getElementById('lexiqueFavorisEcran');
  if (!zone) { return; }
  zone.addEventListener('click', function (e) {
    if (e.target.closest('#lexiqueRetourRechercheFavoris')) { _lexiqueAfficherRecherche(); return; }
    var bouton = e.target.closest('[data-lexique-fiche]');
    if (bouton) { _lexiqueAfficherFiche(bouton.dataset.lexiqueFiche, _lexiqueAfficherFavoris); }
  });
}

// ============================================================
// NAVIGATION INTERNE (reste sur la route 'lexique', jamais naviguerVers())
// ============================================================

function _lexiqueAfficherRecherche() {
  // Refonte accueil 2026-09-09 : nouveau tirage au sort des 6 themes et de
  // la ligne d'exemples a CHAQUE arrivee sur l'ecran (Retour compris).
  _lexiqueTirerAccueil();
  app.innerHTML = _lexiqueRenduEcran();
  _lexiqueBrancherRecherche();
  window.scrollTo(0, 0);
}

// "retour" est optionnel : une fonction a appeler par le bouton "Retour"
// de la fiche. Absent (comportement des etapes precedentes, tous les
// autres appels du fichier), le bouton ramene a la recherche.
function _lexiqueAfficherFiche(id, retour) {
  _lexiqueRetourFiche = retour || null;
  app.innerHTML = _lexiqueRenduFiche(id);
  _lexiqueBrancherFiche();
  window.scrollTo(0, 0);
}

function _lexiqueAfficherModeLivre() {
  app.innerHTML = _lexiqueRenduModeLivre();
  _lexiqueBrancherModeLivre();
  // "instant" (pas le defilement fluide global du site) : on restaure
  // une position exacte, on ne joue pas une animation -- et un
  // window.scrollTo() fluide juste apres un remplacement de innerHTML
  // se desynchronise pendant que la mise en page se stabilise.
  window.scrollTo({ top: _lexiqueModeLivrePosition, left: 0, behavior: 'instant' });
}

function _lexiqueAfficherListeCollections() {
  app.innerHTML = _lexiqueRenduListeCollections();
  _lexiqueBrancherListeCollections();
  window.scrollTo(0, 0);
}

function _lexiqueAfficherCollection(id, retourPerso) {
  _lexiqueCollectionRetour = (typeof retourPerso === 'function') ? retourPerso : null;
  app.innerHTML = _lexiqueRenduCollection(id);
  _lexiqueBrancherCollection();
  window.scrollTo(0, 0);
}

function _lexiqueAfficherFavoris() {
  app.innerHTML = _lexiqueRenduFavoris();
  _lexiqueBrancherFavoris();
  window.scrollTo(0, 0);
}

// retourPerso (refonte accueil 2026-09-09) : fonction de retour quand la
// bibliotheque n'est PAS ouverte depuis une fiche (ex. "Parcourir par
// domaine" -> retour vers la liste des domaines). null = retour a la
// fiche d'origine, comme a l'etape 11.
function _lexiqueAfficherBibliotheque(type, valeur, ficheOrigineId, retourPerso) {
  _lexiqueBibliothequeFicheOrigine = ficheOrigineId;
  _lexiqueBibliothequeRetour = (typeof retourPerso === 'function') ? retourPerso : null;
  app.innerHTML = _lexiqueRenduBibliotheque(type, valeur);
  _lexiqueBrancherBibliotheque();
  window.scrollTo(0, 0);
}

// ============================================================
// FACADE PUBLIQUE
// ============================================================

// TACHE (patron page d'introduction, 2026-08-31) : true = afficher la
// page de presentation du module. Posee par lexiqueDemarrer() (tuile
// Boite a outils), effacee par le CTA "Ouvrir le Lexique" et par les
// liens profonds de la barre de recherche de l'accueil.
var _lexiqueEcranIntro = false;

function pageLexique() {
  if (_lexiqueEcranIntro) {
    app.innerHTML = _lexiqueRenduIntro();
    _lexiqueBrancherIntro();
    if (typeof trackEvenement === 'function') { trackEvenement('lexique_intro_affichee'); }
    return;
  }
  _lexiqueAfficherRecherche();
}

// "Retour" d'un ecran de travail et bouton permanent "Revoir la
// presentation" -- ramenent a la presentation du module. C'est le
// "Retour" de la presentation qui va a l'accueil.
// TACHE (chantier "bouton presentation", 2026-09-01, propagation depuis
// Coherence) : _lexiqueIntroDetour distingue la presentation vue EN DETOUR
// (bouton "Revenir au module", "Retour" et CTA reviennent a l'ecran) de la
// presentation a froid (CTA "Ouvrir le Lexique", "Retour" -> Boite a outils).
var _lexiqueIntroDetour = false;
// TACHE (correctif boucle Retour, 2026-09-09 -- LECONS section 2,
// "Variante boucle infinie"). "Retour" de la barre du bas de l'ecran de
// travail : ouvre la presentation en mode NORMAL (jamais detour), pour
// que son propre "Retour" enchaine ensuite vers la Boite a outils
// (retourVersBoiteAOutils, voir _lexiqueRenduIntro). AVANT ce correctif,
// "Retour" appelait lexiqueRevoirPresentation() (detour) dont le "Retour"
// revenait a l'ecran de travail -> les deux boutons se pointaient l'un
// l'autre, plus aucun moyen de reculer jusqu'a l'accueil. Meme distinction
// que regardRecruteurRetour() / regardRecruteurRetourVersPresentation().
function lexiqueRetour() {
  _lexiqueEcranIntro = true;
  _lexiqueIntroDetour = false;
  naviguerVers('lexique');
}
// Reserve au SEUL bouton "Revoir la presentation" (detour de consultation).
function lexiqueRevoirPresentation() {
  _lexiqueEcranIntro = true;
  _lexiqueIntroDetour = true;
  naviguerVers('lexique');
}
function lexiqueRevenirDeLaPresentation() {
  _lexiqueEcranIntro = false;
  _lexiqueIntroDetour = false;
  naviguerVers('lexique');
}

// Appelee par la tuile Boite a outils (data/metiers.js).
function lexiqueDemarrer() {
  _lexiqueEcranIntro = true;
  _lexiqueIntroDetour = false;
  naviguerVers('lexique');
}

// Donnee brute uniquement -- jamais un libelle deja forme, jamais de HTML,
// aucune notion d'ancrage dans son vocabulaire (voir
// ARCHITECTURE_TECHNIQUE.md, "Principe directeur" : Lexique ignore
// totalement l'existence de Repères, c'est app.js seul qui construit un
// contratSource a partir de cette donnee et appelle reperesBoutonAncre()).
function lexiqueFicheParId(id) {
  var fiche = _lexiqueTrouverFiche(id);
  return fiche ? { titre: fiche.titre, type: fiche.type } : null;
}

// TACHE (chantier "Ressources - 2e moitie", etape 2, 2026-08-29) : point
// d'entree pour la barre de recherche de l'accueil -- navigue vers le
// Lexique ET ouvre directement la fiche `id`. Le "Retour" de la fiche
// ramene a la recherche du Lexique (comme un clic depuis la recherche
// interne). Renvoie false si l'id est inconnu (l'appelant n'ouvre rien).
// DEMO (2026-09-12, corrige suite au retour de Denis : "Retour a la
// recherche" et le nouveau bouton colle faisaient exactement la meme
// chose sur la 1ere fiche -- deux boutons, une seule action, jamais bon)
// : `retour` et la provenance sont maintenant INDEPENDANTS. `retour`
// (rarement fourni) ne concerne QUE le "Retour" local de LA fiche
// ouverte -- laisse a null depuis un lien externe, il garde son
// comportement HABITUEL (retour a la recherche du Lexique), exactement
// comme n'importe quel autre lien profond du Lexique (ex. depuis
// l'accueil). `provenanceLabel`/`provenanceRoute`/`provenanceRetour`,
// s'ils sont fournis, posent EN PLUS le bouton qui "colle" a la personne
// (definirRetourModuleExterne(), app.js) : lui seul ramene vers le module
// d'origine, et lui seul survit a la navigation vers d'autres fiches du
// Lexique. Retrocompatible : tous les appels existants (sans ces
// arguments) gardent exactement le comportement d'avant.
function lexiqueOuvrirFiche(id, retour, provenanceLabel, provenanceRoute, provenanceRetour) {
  if (!_lexiqueTrouverFiche(id)) { return false; }
  // Lien profond : la personne cherche un mot precis, on ne l'arrete pas
  // sur la page de presentation.
  _lexiqueEcranIntro = false;
  _lexiqueIntroDetour = false;
  naviguerVers('lexique');
  _lexiqueAfficherFiche(id, retour || _lexiqueAfficherRecherche);
  if (provenanceLabel && typeof definirRetourModuleExterne === 'function') {
    definirRetourModuleExterne(provenanceLabel, provenanceRetour || retour, provenanceRoute);
  }
  return true;
}

// TACHE (echange Denis 2026-08-29) : filet de la barre de recherche de
// l'accueil -- quand elle ne trouve rien, elle propose d'ouvrir le
// Lexique AVEC le mot deja saisi (un clic, pas une nouvelle frappe).
// Ouvre l'ecran de recherche du Lexique, pre-remplit le champ et affiche
// les resultats correspondants. Toujours vrai (aucune precondition).
function lexiqueOuvrirRecherche(texte) {
  _lexiqueEcranIntro = false;
  _lexiqueIntroDetour = false;
  naviguerVers('lexique');
  _lexiqueAfficherRecherche();
  var champ = document.getElementById('lexiqueRechercheInput');
  var zone = document.getElementById('lexiqueResultats');
  if (champ) { champ.value = texte || ''; }
  if (zone) { zone.innerHTML = _lexiqueRenduResultats(texte || ''); }
  if (champ) { champ.focus(); }
  return true;
}

// Export CommonJS protege -- tests/lexiqueLogique.test.js (Node), aucun
// effet sur le chargement navigateur classique (balise <script>, ou
// `module` n'est jamais defini). Logique PURE seulement (aucun DOM) ;
// s'appuie sur les globales LEXIQUE_FICHES/LEXIQUE_COLLECTIONS/
// LEXIQUE_SECOND_NIVEAU/normaliserTexte, a fournir par l'appelant (voir
// le test, qui pose un petit jeu de fiches plutot que le vrai corpus).
if (typeof module !== 'undefined') {
  module.exports = {
    _lexiqueRechercher: _lexiqueRechercher,
    _lexiqueConstruireIndexRelations: _lexiqueConstruireIndexRelations,
    _lexiqueConstruireIndexCollections: _lexiqueConstruireIndexCollections,
    _lexiqueConstruireIndexSecondNiveau: _lexiqueConstruireIndexSecondNiveau
  };
}
