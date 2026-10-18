/* ============================================================
   Module « Qui fait quoi » : LOGIQUE PURE (aucun DOM).
   Chargé avant modules/mon-territoire/index.js. Testé par
   tests/monTerritoire.test.js (Node), qui vérifie aussi les fichiers de
   données réels (contenu/*.txt) : un fichier de données invalide fait
   échouer `npm test`.
   Plan : docs/PLAN_MON_TERRITOIRE_PREMICES_2026-10-12.md ; audit :
   docs/AUDIT_MON_TERRITOIRE_AVANT_CODE_2026-10-12.md ; seconde passe :
   docs/SECONDE_PASSE_CRITIQUE_MON_TERRITOIRE_2026-10-12.md.

   Règles propres à ce module (décisions de Denis, 2026-10-12) :
   - un seul répertoire local, plusieurs domaines ; branche « Emploi » = les employeurs ;
   - une coordonnée n'est affichée que si sa ligne est datée de moins de 12 mois ;
   - jamais le nom d'une personne, seulement des coordonnées d'organisme ;
   - aucun appel en ligne à l'usage : tout vient de fichiers texte statiques.
   ============================================================ */

// Interrupteur d'ouverture du module au public (décision D11) : tant qu'il est faux, la tuile et la recherche de l'accueil le cachent.
// Pour l'essayer sans l'ouvrir au public : dans la console du navigateur, localStorage.setItem('erip_mon_territoire_apercu', '1') puis recharger.
// FERMÉ au public (décision de Denis, 2026-10-18, avant l'envoi vers GitHub) : le module reste visible sur son poste (localhost, voir mtEstEnLocal ci-dessous) et caché partout ailleurs.
// Pour l'ouvrir au public : le passer à true (voir docs/LISTE_CONTROLE_OUVERTURE_MON_TERRITOIRE_2026-10-12.md) et adapter tests/monTerritoire.test.js.
var MT_OUVERT = false;
var MT_CLE_APERCU = 'erip_mon_territoire_apercu';
var MT_CLE_COMMUNE = 'erip_mon_territoire_commune';
var MT_CLE_COMMUNE_INFO = 'erip_mon_territoire_commune_info';   // { code, nom, epci } : la commune choisie, lisible par les autres modules sans recharger les 503 communes
var MT_VALIDITE_MOIS = 12;
var MT_PAGE_TAILLE = 12;   // 12 se range en 1, 2, 3 ou 4 colonnes sans dernière ligne incomplète

// Décision de Denis (2026-10-16) : il travaille sur son serveur interne (localhost, VS Code) et ne met rien en ligne avant que tout soit au point.
// Le module est donc visible sur cette machine (localhost, 127.0.0.1, [::1], *.localhost) pour voir le rendu, et reste FERME partout ailleurs
// (site en ligne, partenaire) tant que MT_OUVERT est faux : mettre le dossier en ligne n'ouvre pas le module au public.
function mtEstEnLocal() {
  try { return typeof location !== 'undefined' && /^(localhost|127\.0\.0\.1|\[::1\]|[^.]+\.localhost)$/.test(String(location.hostname || '')); } catch (e) { return false; }
}
function mtOuvert() {
  if (MT_OUVERT || mtEstEnLocal()) { return true; }
  try { return typeof localStorage !== 'undefined' && localStorage.getItem(MT_CLE_APERCU) === '1'; } catch (e) { return false; }
}

// Les étapes visibles de la barre (seulement visuelle).
var MT_ETAPES = [
  { label: 'Accueil', icone: '&#127968;' },
  { label: 'Un domaine', icone: '&#128203;' },
  { label: 'Une fiche', icone: '&#128205;' }
];

// Types de structure (liste fermée, 28). Les six premiers reprennent les identifiants du Lexique. On ajoute, on ne renomme jamais.
var MT_TYPES = {
  'france-travail': 'France Travail', 'mission-locale': 'Mission locale', 'cap-emploi': 'Cap emploi', 'plie': 'Plan local pour l’insertion et l’emploi',
  'siae': 'Insertion par l’activité économique', 'caf': 'Caisse d’allocations familiales', 'caisse-assurance-maladie-retraite': 'Assurance maladie et retraite',
  'ccas': 'Centre communal d’action sociale', 'service-social-secteur': 'Service social de secteur', 'france-services': 'France Services',
  'inclusion-numerique': 'Aide au numérique', 'creation-activite': 'Création d’activité', 'formation-orientation': 'Formation et orientation',
  'formation-jeunes': 'Formation pour les jeunes', 'logement-hebergement': 'Logement et hébergement', 'mobilite-solidaire': 'Mobilité solidaire',
  'aide-alimentaire-materielle': 'Aide alimentaire et matérielle', 'budget-endettement': 'Budget et endettement', 'acces-au-droit': 'Accès au droit',
  'justice-insertion': 'Justice et insertion', 'handicap': 'Handicap', 'sante-soins-addictions': 'Santé, soins et addictions',
  'soutien-aux-familles': 'Soutien aux familles', 'petite-enfance': 'Petite enfance', 'accueil-etrangers': 'Accueil des étrangers',
  'francais-langue': 'Apprendre le français', 'appui-aux-employeurs': 'Appui aux employeurs', 'collectivite-etat': 'Collectivités et État'
};

// Modes de candidature d'un employeur (pastilles d'information, jamais des cases à cocher).
var MT_MODES = {
  'spontanee': 'Candidature spontanée',
  'concours': 'Concours',
  'portail': 'Portail du recruteur',
  'interim': 'Intérim',
  'prescripteur': 'Par un conseiller',
  'non-indique': 'Non indiqué par l’entreprise'
};

// Icône (Bootstrap Icons, objet concret, jamais un visage) et exemples de métiers de chaque secteur. Les clés sont celles de data/secteurs.js.
var MT_SECTEURS_AFFICHAGE = {
  'commerce-vente': { icone: 'bi-cart3', exemples: 'caissier, vendeur, employé libre-service' },
  'btp': { icone: 'bi-bricks', exemples: 'maçon, électricien, plombier' },
  'industrie': { icone: 'bi-gear-wide-connected', exemples: 'opérateur, soudeur, cariste' },
  'hotellerie-restauration': { icone: 'bi-cup-hot', exemples: 'serveur, cuisinier, employé d’étage' },
  'agriculture-nature': { icone: 'bi-flower2', exemples: 'ouvrier agricole, jardinier, paysagiste' },
  'transport-logistique': { icone: 'bi-truck', exemples: 'chauffeur, préparateur de commandes' },
  'sante': { icone: 'bi-heart-pulse', exemples: 'aide-soignant, infirmier, ambulancier' },
  'social-personne': { icone: 'bi-house-heart', exemples: 'aide à domicile, auxiliaire de vie' },
  'administration': { icone: 'bi-folder2', exemples: 'secrétaire, agent d’accueil, comptable' },
  'communication-culture': { icone: 'bi-megaphone', exemples: 'chargé de communication, technicien son' },
  'animalier': { icone: 'bi-feather', exemples: 'soigneur, toiletteur, éleveur' },
  'proprete': { icone: 'bi-recycle', exemples: 'agent d’entretien, agent de collecte' },
  'sport-animation': { icone: 'bi-trophy', exemples: 'animateur, éducateur sportif' },
  'numerique': { icone: 'bi-laptop', exemples: 'développeur, technicien de maintenance' },
  'banque-assurance-immobilier': { icone: 'bi-piggy-bank', exemples: 'conseiller clientèle, agent immobilier' },
  'artisanat': { icone: 'bi-tools', exemples: 'menuisier, couturier, céramiste' },
  'artisanat-bouche': { icone: 'bi-egg-fried', exemples: 'boulanger, boucher, pâtissier' },
  'education-formation': { icone: 'bi-book', exemples: 'formateur, assistant d’éducation' },
  'automobile': { icone: 'bi-wrench', exemples: 'mécanicien, carrossier' },
  'securite': { icone: 'bi-shield-check', exemples: 'agent de sécurité, télésurveillance' },
  'coiffure-esthetique': { icone: 'bi-scissors', exemples: 'coiffeur, esthéticien' }
};

// Colonnes des fichiers de données.
var MT_COLONNES_EMPLOYEURS = ['id', 'nature', 'nom', 'secteur', 'etablissements', 'telephone', 'site', 'recrutement', 'modes', 'source', 'date'];
var MT_COLONNES_ZONES = ['zone', 'libelle', 'contenu', 'source', 'date'];
var MT_COLONNES_LIEUX = ['id', 'type', 'nom', 'description', 'commune', 'zone', 'telephone', 'site', 'portee', 'rayons', 'source', 'date'];

// Les 17 rayons de « Comprendre le cadre » (identifiants des dossiers modules/comprendre-le-cadre/contenu/<rayon>/).
var MT_RAYONS = ['accompagnement', 'budget', 'creer', 'emploi', 'employeurs', 'etranger', 'former', 'francais', 'garde', 'handicap', 'jeunes', 'juridique', 'justice', 'logement', 'mobilite', 'sante', 'seniors'];
// Rayons dont les structures de la Dordogne sont lues dans contenu/lieux.txt (migration un rayon à la fois, décision de Denis 2026-10-12). Les autres départements
// et les autres rayons gardent la lecture d'origine (collecte du rayon) jusqu'à leur propre migration.
var MT_RAYONS_MIGRES = ['logement', 'accompagnement', 'mobilite', 'budget', 'jeunes', 'garde', 'handicap', 'former', 'emploi', 'juridique', 'justice', 'sante', 'seniors', 'creer', 'francais', 'etranger', 'employeurs'];
var MT_PORTEES = ['national', 'region', '24', '87'];

// LES DÉPARTEMENTS DU MODULE : la SEULE source de leurs noms et de leurs formes grammaticales. Aucun texte de l'interface n'écrit « Dordogne » ou « Haute-Vienne » en dur :
// tout est construit à partir de cette table et du département choisi par la personne. Ajouter un département = ajouter une ligne ici, un fichier communes-XX.txt et ses structures.
//   nom : le nom ; code : le numéro ; le : « la Dordogne » ; en : « en Dordogne » (titres, messages) ; dans : « dans la Dordogne » (phrases) ; exemple : un exemple pour le champ commune ;
//   communes : le fichier de ses communes ; ouvert : false tant que ses listes ne sont pas prêtes (la personne voit alors la phrase « pas encore de liste », qui dit où elles existent).
var MT_DEPARTEMENTS = {
  '24': { code: '24', nom: 'Dordogne', le: 'la Dordogne', en: 'en Dordogne', dans: 'dans la Dordogne', exemple: 'Bergerac ou 24100', communes: 'communes-24.txt', ouvert: true },
  '87': { code: '87', nom: 'Haute-Vienne', le: 'la Haute-Vienne', en: 'dans la Haute-Vienne', dans: 'dans la Haute-Vienne', exemple: 'Limoges ou 87000', communes: 'communes-87.txt', ouvert: true }
};
var MT_DEPARTEMENT_PAR_DEFAUT = '24';

function mtDepartement(dep) { return MT_DEPARTEMENTS[dep] || null; }
function mtDepartementOuvert(dep) { var d = mtDepartement(dep); return !!(d && d.ouvert); }
// Par ordre alphabétique des noms (jamais selon l'ordre des numéros : une liste ne doit pas avoir l'air d'un classement).
function mtDepartementsOuverts() { return Object.keys(MT_DEPARTEMENTS).map(function (k) { return MT_DEPARTEMENTS[k]; }).filter(function (d) { return d.ouvert; }).sort(function (x, y) { return x.nom.localeCompare(y.nom, 'fr'); }); }
function mtMajuscule(t) { t = String(t || ''); return t.charAt(0).toUpperCase() + t.slice(1); }
// « la Dordogne », « la Dordogne et la Haute-Vienne », « la Dordogne, la Haute-Vienne et la Creuse ».
function mtNomsDesDepartementsOuverts() {
  var l = mtDepartementsOuverts().map(function (d) { return d.le; });
  return l.length > 1 ? l.slice(0, -1).join(', ') + ' et ' + l[l.length - 1] : (l[0] || '');
}
// Ce que voit une personne dont le département n'a pas (encore) de liste : jamais une impasse, toujours où les listes existent.
function mtPhraseTerritoireNonCouvert(dep) {
  var d = mtDepartement(dep), ou = mtNomsDesDepartementsOuverts();
  return 'Nous n’avons pas encore de liste pour ' + (d ? d.le : 'votre territoire') + '.' + (ou ? ' Elle existe pour ' + ou + ', et s’étend petit à petit.' : ' Elle s’étend petit à petit.');
}
// Une commune appartient au département dont le numéro commence son code INSEE.
function mtCommunesDuDepartement(communes, dep) {
  return communes.filter(function (c) { return String(c.code || '').indexOf(String(dep)) === 0; });
}
// Les employeurs qui ont au moins un établissement dans ce département, avec SEULEMENT leurs établissements de ce département (une enseigne présente dans deux départements
// apparaît dans les deux listes, avec les communes de chacun). Une commune est retrouvée par son nom (aucun nom n'est commun aux départements du module : un test le vérifie).
function mtEmployeursDuDepartement(employeurs, communes, dep) {
  var dans = {};
  mtCommunesDuDepartement(communes, dep).forEach(function (c) { dans[c.cle] = true; });
  var sortie = [];
  employeurs.forEach(function (e) {
    var ici = e.etablissementsListe.filter(function (x) { return dans[mtNormaliser(x.commune)]; });
    if (ici.length) { var copie = Object.assign({}, e); copie.etablissementsListe = ici; sortie.push(copie); }
  });
  return sortie;
}

// Sous-branches de « Social » dans le module (chacune lit les structures d'un rayon de « Comprendre le cadre »).
var MT_SOUS_BRANCHES = {
  social: [
    { id: 'logement', libelle: 'Logement', icone: 'bi-house', rayon: 'logement', sousTitre: 'Hébergement, aides, garanties' },
    { id: 'mobilite', libelle: 'Mobilité', icone: 'bi-car-front', rayon: 'mobilite', sousTitre: 'Permis, garage solidaire, transports' },
    { id: 'accompagnement', libelle: 'Accompagnement', icone: 'bi-signpost-split', rayon: 'accompagnement', sousTitre: 'France Travail, Mission locale, insertion' },
    { id: 'budget', libelle: 'Budget et aides', icone: 'bi-cash-coin', rayon: 'budget', sousTitre: 'Dettes, droits, aide alimentaire' },
    { id: 'handicap', libelle: 'Handicap', icone: 'bi-universal-access-circle', rayon: 'handicap', sousTitre: 'MDPH, Cap emploi, aides' },
    { id: 'emploi', libelle: 'Contrats et droit du travail', icone: 'bi-briefcase', rayon: 'emploi', sousTitre: 'Inspection du travail, prud’hommes' }
  ],
  formation: [
    { id: 'former', libelle: 'Se former et se reconvertir', icone: 'bi-mortarboard', rayon: 'former', sousTitre: 'Conseil, VAE, formations pour adultes' },
    { id: 'jeunes', libelle: 'Moins de 26 ans', icone: 'bi-backpack2', rayon: 'jeunes', sousTitre: 'Écoles, parcours, information jeunesse' }
  ],
  'accueil-langue': [
    { id: 'francais', libelle: 'Apprendre le français', icone: 'bi-chat-left-text', rayon: 'francais', sousTitre: 'Ateliers, cours, savoirs de base' },
    { id: 'etranger', libelle: 'Venir de l\u2019étranger', icone: 'bi-file-earmark-person', rayon: 'etranger', sousTitre: 'Titre de séjour, asile, diplômes' }
  ],
  'appui-employeurs': [
    { id: 'employeurs', libelle: 'Appui aux employeurs', icone: 'bi-building', rayon: 'employeurs', sousTitre: 'Cotisations, santé au travail, aides à l\u2019embauche' }
  ],
  creer: [
    { id: 'creer', libelle: 'Créer son activité', icone: 'bi-rocket-takeoff', rayon: 'creer', sousTitre: 'Chambres consulaires, microcrédit, coopératives' }
  ],
  'droits-justice': [
    { id: 'juridique', libelle: 'Questions juridiques', icone: 'bi-file-earmark-text', rayon: 'juridique', sousTitre: 'Accès au droit, avocats, victimes' },
    { id: 'justice', libelle: 'Sortie de détention et justice', icone: 'bi-door-open', rayon: 'justice', sousTitre: 'SPIP, casier, hébergement' }
  ],
  'vie-pratique': [
    { id: 'garde', libelle: 'Garde d\u2019enfant', icone: 'bi-balloon', rayon: 'garde', sousTitre: 'Crèches, PMI, aides à la garde' },
    { id: 'sante', libelle: 'Santé', icone: 'bi-bandaid', rayon: 'sante', sousTitre: 'Assurance maladie, médecin traitant' },
    { id: 'seniors', libelle: 'Retraite et seniors', icone: 'bi-sunset', rayon: 'seniors', sousTitre: 'Relevé de carrière, demande de retraite' }
  ]
};

// ------------------------------------------------------------
// Texte et dates
// ------------------------------------------------------------

function mtNormaliser(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

var MT_RE_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// Nombre de mois entiers écoulés entre deux dates AAAA-MM-JJ (null si l'une est invalide).
function mtMoisEcoules(dateIso, aujourdhuiIso) {
  if (!MT_RE_DATE.test(dateIso || '') || !MT_RE_DATE.test(aujourdhuiIso || '')) { return null; }
  var a = dateIso.split('-').map(Number), b = aujourdhuiIso.split('-').map(Number);
  var mois = (b[0] - a[0]) * 12 + (b[1] - a[1]);
  if (b[2] < a[2]) { mois -= 1; }
  return mois;
}

// 'sans-date' | 'recente' | 'a-reverifier' (plus de 12 mois) | 'future' (date après aujourd'hui : donnée invalide)
function mtFraicheur(dateIso, aujourdhuiIso) {
  var m = mtMoisEcoules(dateIso, aujourdhuiIso);
  if (m === null) { return 'sans-date'; }
  if (m < 0) { return 'future'; }
  return (m >= MT_VALIDITE_MOIS) ? 'a-reverifier' : 'recente';
}

// Un site cliquable et un téléphone ne s'affichent que si la ligne est datée de moins de 12 mois.
function mtContactAffichable(ligne, aujourdhuiIso) {
  var ok = mtFraicheur(ligne && ligne.date, aujourdhuiIso) === 'recente';
  return { site: ok && !!(ligne && ligne.site), telephone: ok && !!(ligne && ligne.telephone), recrutement: ok && !!(ligne && ligne.recrutement) };
}

// ------------------------------------------------------------
// Lecture des fichiers texte (une ligne = une fiche, colonnes séparées par « | », commentaires « # »)
// ------------------------------------------------------------

function mtParserRegistre(texte, colonnes) {
  var lignes = [], erreurs = [];
  String(texte || '').split(/\r?\n/).forEach(function (brut, i) {
    var l = brut.trim();
    if (!l || l.charAt(0) === '#') { return; }
    // Une colonne vide s'écrit « | | » ; la dernière colonne peut aussi rester vide (« ... | »).
    var parts = l.split(/\s*\|\s*/).map(function (p) { return p.trim(); });
    if (parts.length !== colonnes.length) {
      erreurs.push('ligne ' + (i + 1) + ' : ' + parts.length + ' colonnes au lieu de ' + colonnes.length);
      return;
    }
    var o = { _ligne: i + 1 };
    colonnes.forEach(function (c, k) { o[c] = parts[k]; });
    lignes.push(o);
  });
  return { lignes: lignes, erreurs: erreurs };
}

// Établissements d'un employeur : « Commune:adresse ; Commune:adresse », chacun avec un numéro facultatif à la fin : « Commune:adresse:05 53 00 00 00 ».
// Le dernier morceau après un « : » est un numéro quand il ne contient que des chiffres, des espaces, des points ou un « + » ; sinon il fait partie de l'adresse.
var MT_RE_TELEPHONE_BRUT = /^\+?\d[\d .]*$/;
function mtParserEtablissements(champ) {
  return String(champ || '').split(';').map(function (x) { return x.trim(); }).filter(Boolean).map(function (x) {
    var k = x.indexOf(':');
    if (k < 0) { return { commune: x, adresse: '', telephone: '' }; }
    var commune = x.slice(0, k).trim(), reste = x.slice(k + 1), telephone = '', dernier = reste.lastIndexOf(':');
    if (dernier >= 0 && MT_RE_TELEPHONE_BRUT.test(reste.slice(dernier + 1).trim())) { telephone = reste.slice(dernier + 1).trim(); reste = reste.slice(0, dernier); }
    return { commune: commune, adresse: reste.trim(), telephone: telephone };
  });
}
// L'inverse : la liste d'établissements ({ commune, adresse, telephone }) écrite comme dans le fichier.
function mtEtablissementsEnTexte(liste) {
  return (liste || []).map(function (e) { return e.commune + ':' + (e.adresse || '') + (e.telephone ? ':' + e.telephone : ''); }).join(' ; ');
}

function mtParserModes(champ) {
  return String(champ || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
}

function mtParserEmployeurs(texte) {
  var r = mtParserRegistre(texte, MT_COLONNES_EMPLOYEURS);
  r.lignes.forEach(function (e) { e.etablissementsListe = mtParserEtablissements(e.etablissements); e.modesListe = mtParserModes(e.modes); });
  return r;
}

// Fichier des communes : « code INSEE | commune | codes postaux | code intercommunalité | intercommunalité ».
function mtParserCommunes(texte) {
  var r = mtParserRegistre(texte, ['code', 'nom', 'cp', 'epci', 'epciNom']);
  r.lignes.forEach(function (c) { c.codesPostaux = c.cp.split(/\s+/).filter(Boolean); c.cle = mtNormaliser(c.nom); });
  return r;
}

// ------------------------------------------------------------
// Commune de la personne (décision D9 : un champ sur la page, jamais une fenêtre)
// ------------------------------------------------------------

// Cherche une commune par son nom (sans accents ni majuscules) ou par un code postal. Rend { statut: 'trouvee' | 'plusieurs' | 'inconnue', communes }.
function mtTrouverCommune(communes, saisie) {
  var q = mtNormaliser(saisie);
  if (!q) { return { statut: 'inconnue', communes: [] }; }
  var exactes = communes.filter(function (c) { return c.cle === q; });
  if (exactes.length === 1) { return { statut: 'trouvee', communes: exactes }; }
  if (/^\d{5}$/.test(q)) {
    var parCp = communes.filter(function (c) { return c.codesPostaux.indexOf(q) !== -1; });
    if (parCp.length === 1) { return { statut: 'trouvee', communes: parCp }; }
    if (parCp.length > 1) { return { statut: 'plusieurs', communes: parCp }; }
    return { statut: 'inconnue', communes: [] };
  }
  var debut = communes.filter(function (c) { return c.cle.indexOf(q) === 0; });
  if (debut.length === 1) { return { statut: 'trouvee', communes: debut }; }
  if (debut.length > 1 && debut.length <= 8) { return { statut: 'plusieurs', communes: debut }; }
  return { statut: 'inconnue', communes: [] };
}

// Vrai si l'un des établissements de l'employeur est dans la même intercommunalité que la personne (information, jamais un classement).
function mtDansMonIntercommunalite(employeur, communes, communePersonne) {
  if (!communePersonne || !communePersonne.epci) { return false; }
  return employeur.etablissementsListe.some(function (e) {
    var c = communes.filter(function (x) { return x.cle === mtNormaliser(e.commune); })[0];
    return !!c && c.epci === communePersonne.epci;
  });
}

// ------------------------------------------------------------
// Listes et recherche
// ------------------------------------------------------------

// Tri alphabétique (jamais un classement implicite).
function mtTrierAlphabetique(employeurs) {
  return employeurs.slice().sort(function (a, b) { return a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }); });
}

function mtEmployeursDuSecteur(employeurs, cleSecteur, nature) {
  return mtTrierAlphabetique(employeurs.filter(function (e) {
    return e.secteur === cleSecteur && (!nature || e.nature === nature);
  }));
}

function mtCompterParSecteur(employeurs) {
  var n = {};
  employeurs.forEach(function (e) { n[e.secteur] = (n[e.secteur] || 0) + 1; });
  return n;
}

// Pagination simple : { page: lignes affichées, total, restants } ; « Afficher les 10 suivants » seulement si restants > 0.
function mtPaginer(liste, nbAffiches) {
  var n = Math.max(MT_PAGE_TAILLE, nbAffiches || MT_PAGE_TAILLE);
  return { page: liste.slice(0, n), total: liste.length, restants: Math.max(0, liste.length - n), nbAffiches: Math.min(n, liste.length) };
}

// Recherche : nom de l'employeur, libellé du secteur, exemples de métiers, communes d'établissement. `secteurs` = [{cle, libelle}].
function mtRechercherEmployeurs(employeurs, secteurs, requete) {
  var q = mtNormaliser(requete);
  if (q.length < 2) { return []; }
  var libelle = {};
  secteurs.forEach(function (s) { libelle[s.cle] = s.libelle; });
  return mtTrierAlphabetique(employeurs.filter(function (e) {
    var affich = MT_SECTEURS_AFFICHAGE[e.secteur] || {};
    var champs = [e.nom, libelle[e.secteur], affich.exemples].concat(e.etablissementsListe.map(function (x) { return x.commune; }));
    return champs.some(function (c) { return mtNormaliser(c).indexOf(q) !== -1; });
  }));
}

// Secteurs dont le libellé ou les exemples de métiers correspondent à la requête (pour « Un secteur ou un métier »).
function mtRechercherSecteurs(secteurs, requete) {
  var q = mtNormaliser(requete);
  if (q.length < 2) { return []; }
  return secteurs.filter(function (s) {
    var affich = MT_SECTEURS_AFFICHAGE[s.cle] || {};
    return mtNormaliser(s.libelle).indexOf(q) !== -1 || mtNormaliser(affich.exemples).indexOf(q) !== -1;
  });
}

// ------------------------------------------------------------
// Structures (lieux) : « id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date »
// ------------------------------------------------------------

function mtParserLieux(texte) {
  var r = mtParserRegistre(texte, MT_COLONNES_LIEUX);
  r.lignes.forEach(function (l) { l.rayonsListe = String(l.rayons || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean); });
  return r;
}

function mtRayonMigre(rayon) { return MT_RAYONS_MIGRES.indexOf(rayon) !== -1; }

// Les structures qu'affiche un rayon de « Comprendre le cadre » (tri alphabétique par nom : jamais un classement).
function mtLieuxDuRayon(lieux, rayon) {
  return lieux.filter(function (l) { return l.rayonsListe.indexOf(rayon) !== -1; })
    .sort(function (a, b) { return a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }); });
}

// Même forme que les structures lues dans la collecte d'un rayon : { titre, detail, url, verifie, date, portee }. Le lien n'est cliquable que si la ligne est datée de moins de 12 mois.
function mtLieuEnStructure(lieu, aujourdhuiIso, commune) {
  var ok = mtFraicheur(lieu.date, aujourdhuiIso) === 'recente';
  return { id: lieu.id, titre: lieu.nom, detail: lieu.description, url: (ok && lieu.site) ? lieu.site : '', verifie: ok && !!lieu.site, date: ok ? lieu.date : '', portee: lieu.portee, type: lieu.type, couvre: mtZoneCouvre(lieu.zone, commune) };
}

// ------------------------------------------------------------
// Zones (décision D12) : « epci:200070647 ; commune:Bergerac ». Vide = zone pas encore relevée : on ne devine JAMAIS.
// ------------------------------------------------------------

function mtParserZone(zone) {
  return String(zone || '').split(';').map(function (x) { return x.trim(); }).filter(Boolean).map(function (x) {
    var k = x.indexOf(':');
    return k < 0 ? { genre: '', valeur: x } : { genre: x.slice(0, k).trim().toLowerCase(), valeur: x.slice(k + 1).trim() };
  });
}

// true / false si la zone est connue et que la commune est connue ; null sinon (zone pas relevée, ou commune pas indiquée).
function mtZoneCouvre(zone, commune) {
  var z = mtParserZone(zone);
  if (!z.length || !commune) { return null; }
  return z.some(function (x) { return x.genre === 'epci' ? String(x.valeur) === String(commune.epci) : mtNormaliser(x.valeur) === (commune.cle || mtNormaliser(commune.nom)); });
}

// Le domaine (« social », « formation ») dont une sous-branche affiche les structures de ce rayon ; chaîne vide si aucun.
function mtDomaineDuRayon(rayon) {
  var domaines = Object.keys(MT_SOUS_BRANCHES);
  for (var i = 0; i < domaines.length; i++) {
    if (MT_SOUS_BRANCHES[domaines[i]].some(function (b) { return b.rayon === rayon; })) { return domaines[i]; }
  }
  return '';
}

// Types de structure qui dépendent de la commune de résidence : plusieurs guichets possibles dans un même département.
var MT_TYPES_SELON_COMMUNE = ['mission-locale', 'plie'];

// Place en premier les structures dont la zone couvre la commune de la personne (sans en retirer aucune). Rend la même liste réordonnée.
function mtOrdonnerParCommune(structures) {
  return structures.map(function (s, i) { return { s: s, i: i }; }).sort(function (a, b) {
    var ra = a.s.couvre === true ? 0 : 1, rb = b.s.couvre === true ? 0 : 1;
    return ra !== rb ? ra - rb : a.i - b.i;
  }).map(function (x) { return x.s; });
}

// Phrases « laquelle est la vôtre dépend de votre commune » : une par type concerné, seulement s'il y a plusieurs structures de ce type
// et qu'aucune n'est reconnue comme couvrant la commune de la personne (option C : jamais un mauvais guichet affirmé).
function mtNotesSelonCommune(structures) {
  // UN seul message pour tous les types concernés (missions locales, PLIE...), jamais le même texte répété une fois par type.
  var NOMS = { 'mission-locale': ['mission locale', 'missions locales'], 'plie': ['structure « PLIE »', 'structures « PLIE »'] };
  var morceaux = [];
  MT_TYPES_SELON_COMMUNE.forEach(function (t) {
    var duType = structures.filter(function (s) { return s.type === t && s.portee !== 'national' && s.portee !== 'region'; });
    if (duType.length >= 2 && !duType.some(function (s) { return s.couvre === true; })) { morceaux.push((NOMS[t] || ['structure', 'structures'])[1] + ' (' + duType.length + ')'); }
  });
  if (!morceaux.length) { return []; }
  return ['Plusieurs ' + morceaux.join(' et plusieurs ') + ' existent dans le département : celle qui vous concerne dépend de votre commune de résidence. Appelez-les ou ouvrez leur site pour le confirmer.'];
}

// La commune choisie dans « Qui fait quoi », lue par les autres modules ({ code, nom, cle, epci } ou null).
function mtCommuneInfoMemorisee() {
  try {
    var t = typeof localStorage !== 'undefined' ? localStorage.getItem(MT_CLE_COMMUNE_INFO) : null;
    var o = t ? JSON.parse(t) : null;
    return (o && o.code && o.epci) ? { code: o.code, nom: o.nom, cle: mtNormaliser(o.nom), epci: o.epci } : null;
  } catch (e) { return null; }
}


// Recherche : nom, description, libellé du type. Deux lettres minimum.
// Vrai si les mots tapés sont ceux d'un frein SENSIBLE (violences, addiction) : la recherche ne propose alors aucune structure, même si le mot figure dans la description d'une fiche.
function mtRequeteSensible(freins, requete) {
  var q = mtNormaliser(requete);
  if (q.length < 4) { return false; }
  return Object.keys(freins || {}).some(function (code) {
    var f = freins[code];
    if (!f || f.sensible !== true) { return false; }
    return [f.titre].concat(f.synonymes || []).some(function (m) {
      var t = mtNormaliser(m);
      return !!t && (t.indexOf(q) !== -1 || (t.length >= 4 && q.indexOf(t) !== -1));
    });
  });
}

// Les structures qu'une personne peut voir : celles de toute la France, de toute la région et de SON département. Jamais celles d'un autre département (la Haute-Vienne ne s'affiche pas
// à une personne de la Dordogne, ni l'inverse). Un département non renseigné, fermé ou inconnu est traité comme le département par défaut (le premier territoire du module).
function mtLieuxVisibles(lieux, dep) {
  var d = mtDepartementOuvert(dep) ? dep : MT_DEPARTEMENT_PAR_DEFAUT;
  return lieux.filter(function (l) { return l.portee === 'national' || l.portee === 'region' || l.portee === d; });
}

function mtRechercherLieux(lieux, requete, freins) {
  var q = mtNormaliser(requete);
  if (q.length < 2 || (freins && mtRequeteSensible(freins, requete))) { return []; }
  return lieux.filter(function (l) {
    return [l.nom, l.description, MT_TYPES[l.type]].some(function (c) { return mtNormaliser(c).indexOf(q) !== -1; });
  }).sort(function (a, b) { return a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }); });
}

// ------------------------------------------------------------
// Freins et types : les structures du répertoire liées à un frein (data/freins.js : champs `types` et `rayons`)
// ------------------------------------------------------------

// Les freins SENSIBLES (violences, addiction) ne sont jamais proposés ici : mêmes règles que dans le fichier des freins.
function mtFreinsCorrespondants(freins, requete) {
  var q = mtNormaliser(requete);
  if (q.length < 2) { return []; }
  return Object.keys(freins || {}).filter(function (code) {
    var f = freins[code];
    if (!f || f.sensible === true) { return false; }
    if (mtNormaliser(f.titre).indexOf(q) !== -1) { return true; }
    return (f.synonymes || []).some(function (syn) {
      var s = mtNormaliser(syn);
      if (!s) { return false; }
      return s.indexOf(q) !== -1 || (s.length >= 4 && q.indexOf(s) !== -1);
    });
  }).map(function (code) { return { code: code, titre: freins[code].titre || code }; });
}

function mtFreinParTitre(freins, titre) {
  var codes = Object.keys(freins || {});
  for (var i = 0; i < codes.length; i++) { if (freins[codes[i]] && freins[codes[i]].titre === titre) { return { code: codes[i], frein: freins[codes[i]] }; } }
  return null;
}

// Les structures d'un frein : type listé OU rayon listé. Jamais pour un frein sensible.
function mtLieuxPourFrein(lieux, frein) {
  if (!frein || frein.sensible === true) { return []; }
  var types = frein.types || [], rayons = frein.rayons || [];
  return lieux.filter(function (l) {
    return types.indexOf(l.type) !== -1 || l.rayonsListe.some(function (r) { return rayons.indexOf(r) !== -1; });
  }).sort(function (a, b) { return a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }); });
}

// Fiches « type de structure » du Lexique : mêmes identifiants que les types du répertoire (iae est l'autre nom de siae).
function mtTypeDeFicheLexique(idFiche) {
  var t = idFiche === 'iae' ? 'siae' : idFiche;
  return MT_TYPES[t] ? t : '';
}

function mtLieuxDuType(lieux, type) {
  return lieux.filter(function (l) { return l.type === type; }).sort(function (a, b) { return a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }); });
}

// ------------------------------------------------------------
// Vérificateur de données (appelé par tests/monTerritoire.test.js sur les fichiers réels)
// ------------------------------------------------------------

var MT_RE_TELEPHONE = /^(0\d( ?\d\d){4}|\+33 ?[1-9]( ?\d\d){4})$/;
// Numéros COURTS nationaux (urgences, écoute, aide) : 15, 17, 18, trois chiffres commençant par 1 (112, 115, 119...), « 116 006 » (six chiffres), « 3919 » (quatre chiffres commençant par 3).
var MT_RE_TELEPHONE_COURT = /^(1[578]|1\d\d|116 \d{3}|3\d{3})$/;
function mtTelephoneValide(t) { return MT_RE_TELEPHONE.test(t) || MT_RE_TELEPHONE_COURT.test(t); }
// Met un numéro à la forme attendue : « 05 53 00 00 00 » (10 chiffres, ou +33), « 116 006 », « 3919 », « 115 » ; null si ce n'est aucun de ces formats.
function mtFormaterTelephone(x) {
  var t = String(x || '').replace(/[().\-\s]/g, '');
  if (/^(\+33|0033)/.test(t)) { t = '0' + t.replace(/^(\+33|0033)0?/, ''); }
  if (/^116\d{3}$/.test(t)) { return t.replace(/^(\d{3})(\d{3})$/, '$1 $2'); }
  if (/^(1[578]|1\d\d|3\d{3})$/.test(t)) { return t; }
  if (/^0[1-9]\d{8}$/.test(t)) { return t.replace(/^(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, '$1 $2 $3 $4 $5'); }
  return null;
}
var MT_RE_ID = /^[a-z0-9][a-z0-9-]{1,80}$/;
var MT_RE_TIRET_LONG = new RegExp(String.fromCharCode(0x2013) + '|' + String.fromCharCode(0x2014));
// Sites d'intermédiaires, d'agrégateurs et d'agences d'intérim : jamais dans la rubrique (règle de Denis, 2026-10-16).
var MT_ADRESSES_INTERDITES_OFFRES = /^https:\/\/([a-z0-9-]+\.)*(indeed|jobijoba|hellowork|regionsjob|monster|meteojob|linkedin|glassdoor|jooble|adzuna|optioncarriere|cadremploi|apec|francetravail|pole-emploi|adecco|manpower|randstad|synergie|crit-job|proman|samsic|supplay|partnaire)\./i;

// Rend la liste des erreurs (vide = données valides). `contexte` = { secteurs: [cles], communes: [cle normalisée], aujourdhui: 'AAAA-MM-JJ' }.
function mtVerifierEmployeurs(texte, contexte) {
  var r = mtParserEmployeurs(texte);
  var erreurs = r.erreurs.slice();
  var vus = {};
  r.lignes.forEach(function (e) {
    var ou = 'ligne ' + e._ligne + ' (' + e.id + ') : ';
    if (!MT_RE_ID.test(e.id)) { erreurs.push(ou + 'identifiant invalide'); }
    if (vus[e.id]) { erreurs.push(ou + 'identifiant en double'); }
    vus[e.id] = true;
    if (e.nature !== 'enseigne' && e.nature !== 'local' && e.nature !== 'interim') { erreurs.push(ou + 'nature inconnue (enseigne, local ou interim)'); }
    if (!e.nom) { erreurs.push(ou + 'nom vide'); }
    if (/^(m\.|mme|monsieur|madame|mlle)\b/i.test(e.nom)) { erreurs.push(ou + 'le nom ressemble à celui d’une personne : seulement des organismes'); }
    // Une agence d'intérim (nature « interim ») n'a pas de secteur : elle recrute dans tous. Les autres natures ont un des 21 secteurs.
    if (contexte.secteurs && !(e.nature === 'interim' && !e.secteur) && contexte.secteurs.indexOf(e.secteur) === -1) { erreurs.push(ou + 'secteur inconnu : ' + e.secteur); }
    if (!e.etablissementsListe.length) { erreurs.push(ou + 'au moins un établissement (Commune:adresse)'); }
    e.etablissementsListe.forEach(function (x) {
      if (contexte.communes && contexte.communes.indexOf(mtNormaliser(x.commune)) === -1) { erreurs.push(ou + 'commune inconnue : ' + x.commune); }
      if (x.telephone && !mtTelephoneValide(x.telephone)) { erreurs.push(ou + 'téléphone mal écrit pour le magasin de ' + x.commune); }
    });
    var telsMagasins = e.etablissementsListe.some(function (x) { return x.telephone; });
    if (!e.modesListe.length) { erreurs.push(ou + 'modes de candidature vides (utiliser non-indique)'); }
    e.modesListe.forEach(function (m) { if (!MT_MODES[m]) { erreurs.push(ou + 'mode inconnu : ' + m); } });
    if (e.date && !MT_RE_DATE.test(e.date)) { erreurs.push(ou + 'date invalide (AAAA-MM-JJ)'); }
    if (e.date && contexte.aujourdhui && mtFraicheur(e.date, contexte.aujourdhui) === 'future') { erreurs.push(ou + 'date dans le futur'); }
    if ((e.telephone || telsMagasins || e.site || e.recrutement) && !e.date) { erreurs.push(ou + 'téléphone, site ou page de recrutement sans date de vérification'); }
    if (e.telephone && !mtTelephoneValide(e.telephone)) { erreurs.push(ou + 'téléphone mal écrit'); }
    if (e.site && !/^https:\/\/\S+$/.test(e.site)) { erreurs.push(ou + 'site : une adresse https est attendue'); }
    if (e.recrutement && !/^https:\/\/\S+$/.test(e.recrutement)) { erreurs.push(ou + 'page de recrutement : une adresse https est attendue'); }
    if (!e.source) { erreurs.push(ou + 'source vide'); }
    MT_COLONNES_EMPLOYEURS.forEach(function (c) { if (MT_RE_TIRET_LONG.test(e[c] || '')) { erreurs.push(ou + 'tiret long interdit (' + c + ')'); } });
  });
  return erreurs;
}

// Rend la liste des erreurs (vide = données valides). `contexte` = { aujourdhui: 'AAAA-MM-JJ', communes: [clés normalisées] }.
function mtVerifierLieux(texte, contexte) {
  var r = mtParserLieux(texte);
  var erreurs = r.erreurs.slice();
  var vus = {};
  r.lignes.forEach(function (l) {
    var ou = 'ligne ' + l._ligne + ' (' + l.id + ') : ';
    if (!MT_RE_ID.test(l.id)) { erreurs.push(ou + 'identifiant invalide'); }
    if (vus[l.id]) { erreurs.push(ou + 'identifiant en double'); }
    vus[l.id] = true;
    if (!MT_TYPES[l.type]) { erreurs.push(ou + 'type inconnu : ' + l.type); }
    if (!l.nom) { erreurs.push(ou + 'nom vide'); }
    if (/^(m\.|mme|monsieur|madame|mlle)\b/i.test(l.nom)) { erreurs.push(ou + 'le nom ressemble à celui d’une personne : seulement des organismes'); }
    if (MT_PORTEES.indexOf(l.portee) === -1) { erreurs.push(ou + 'portée inconnue : ' + l.portee); }
    if (!l.rayonsListe.length) { erreurs.push(ou + 'au moins un rayon'); }
    l.rayonsListe.forEach(function (x) { if (MT_RAYONS.indexOf(x) === -1) { erreurs.push(ou + 'rayon inconnu : ' + x); } });
    if (l.commune && contexte.communes && contexte.communes.indexOf(mtNormaliser(l.commune)) === -1) { erreurs.push(ou + 'commune inconnue : ' + l.commune); }
    if (l.date && !MT_RE_DATE.test(l.date)) { erreurs.push(ou + 'date invalide (AAAA-MM-JJ)'); }
    if (l.date && contexte.aujourdhui && mtFraicheur(l.date, contexte.aujourdhui) === 'future') { erreurs.push(ou + 'date dans le futur'); }
    if ((l.telephone || l.site) && !l.date) { erreurs.push(ou + 'téléphone ou site sans date de vérification'); }
    if (l.telephone && !mtTelephoneValide(l.telephone)) { erreurs.push(ou + 'téléphone mal écrit'); }
    if (l.site && !/^https:\/\/\S+$/.test(l.site)) { erreurs.push(ou + 'site : une adresse https est attendue'); }
    if (l.zone) {
      mtParserZone(l.zone).forEach(function (x) {
        if (x.genre === 'epci') { if (contexte.epci && contexte.epci.indexOf(x.valeur) === -1) { erreurs.push(ou + 'intercommunalité inconnue dans la zone : ' + x.valeur); } }
        else if (x.genre === 'commune') { if (contexte.communes && contexte.communes.indexOf(mtNormaliser(x.valeur)) === -1) { erreurs.push(ou + 'commune inconnue dans la zone : ' + x.valeur); } }
        else { erreurs.push(ou + 'zone mal écrite (epci:code ou commune:nom) : ' + x.valeur); }
      });
    }
    if (!l.source) { erreurs.push(ou + 'source vide'); }
    MT_COLONNES_LIEUX.forEach(function (c) { if (MT_RE_TIRET_LONG.test(l[c] || '')) { erreurs.push(ou + 'tiret long interdit (' + c + ')'); } });
  });
  return erreurs;
}

// ------------------------------------------------------------
// Rubrique « Employeurs qui publient leurs offres » (contenu/offres.txt) : l'adresse de la page où l'employeur publie lui-même ses offres.
// Jamais une offre recopiée. Une ligne sans date de vérification à la main n'existe pas pour la personne.
// ------------------------------------------------------------

var MT_COLONNES_OFFRES = ['id', 'famille', 'nom', 'secteur', 'territoire', 'page', 'employeur', 'source', 'date', 'controle', 'stages'];
var MT_FAMILLES_OFFRES = ['employeur', 'portail-officiel', 'groupement', 'federation'];
var MT_TERRITOIRES_OFFRES = ['24', '87', 'region', 'national'];
// Une page vérifiée à la main depuis moins de 6 mois porte la pastille « Vérifié le » ; de 6 à 12 mois elle reste visible « à revérifier » ; au-delà elle disparaît.
var MT_VALIDITE_OFFRES_MOIS = 6;
// Les quatre groupes de l'écran, dans l'ordre d'affichage (décision de Denis, 2026-10-17).
var MT_GROUPES_OFFRES = ['pres', 'grands', 'public', 'groupements'];

function mtParserOffres(texte) { return mtParserRegistre(texte, MT_COLONNES_OFFRES); }

// 'recente' | 'a-reverifier' | 'masquee' (sans date, date future, ou plus de 12 mois)
function mtFraicheurOffre(dateIso, aujourdhuiIso) {
  var m = mtMoisEcoules(dateIso, aujourdhuiIso);
  if (m === null || m < 0 || m >= MT_VALIDITE_MOIS) { return 'masquee'; }
  return m >= MT_VALIDITE_OFFRES_MOIS ? 'a-reverifier' : 'recente';
}

// Le groupe d'une page d'après sa famille (le code lit la famille notée dans le fichier, il ne devine pas).
function mtGroupeOffre(o) {
  if (o.famille === 'portail-officiel') { return 'public'; }
  if (o.famille === 'groupement' || o.famille === 'federation') { return 'groupements'; }
  return (o.territoire === '24' || o.territoire === '87') ? 'pres' : 'grands';
}

// Les pages visibles pour un département : celles de ce département, de la région et de toute la France, datées et pas trop anciennes.
function mtOffresVisibles(offres, dep, aujourdhuiIso) {
  return offres.filter(function (o) {
    return (o.territoire === String(dep) || o.territoire === 'region' || o.territoire === 'national') && mtFraicheurOffre(o.date, aujourdhuiIso) !== 'masquee';
  });
}

// { pres: [...], grands: [...], public: [...], groupements: [...] }, chaque groupe par ordre alphabétique ; un secteur peut réduire la liste.
function mtOffresParGroupe(offres, dep, aujourdhuiIso, cleSecteur) {
  var r = { pres: [], grands: [], public: [], groupements: [] };
  mtOffresVisibles(offres, dep, aujourdhuiIso).forEach(function (o) {
    if (!cleSecteur || o.secteur === cleSecteur) { r[mtGroupeOffre(o)].push(o); }
  });
  MT_GROUPES_OFFRES.forEach(function (g) { r[g] = mtTrierAlphabetique(r[g]); });
  return r;
}

// La page d'offres d'un employeur qui a une fiche (bouton « Ses offres publiées »), ou null.
function mtOffreDeLEmployeur(offres, idEmployeur, aujourdhuiIso) {
  var l = offres.filter(function (o) { return o.employeur === idEmployeur && mtFraicheurOffre(o.date, aujourdhuiIso) !== 'masquee'; });
  return l.length ? l[0] : null;
}

// Les liens de l'écran « Insertion par l'activité économique » vivent dans le registre des adresses (modules/comprendre-le-cadre/liens-verifies.txt, « nom | adresse | date | portée ») :
// UNE source, revérifiée par l'outil de veille. Un lien ne s'affiche que si sa ligne est datée de moins de 12 mois.
function mtLiensDepuisRegistre(texte) {
  var liens = {};
  String(texte || '').split(/\r?\n/).forEach(function (l) {
    if (!l.trim() || l.trim().charAt(0) === '#') { return; }
    var c = l.split('|').map(function (x) { return x.trim(); });
    if (c.length >= 3 && c[0] && /^https:\/\/\S+$/.test(c[1])) { liens[c[0]] = { adresse: c[1], date: c[2] }; }
  });
  return liens;
}
function mtLienAffichable(liens, nom, aujourdhuiIso) {
  var l = liens && liens[nom];
  return (l && mtFraicheur(l.date, aujourdhuiIso) === 'recente') ? l.adresse : '';
}

// Recherche de l'accueil : un mot comme « offres » ou « recrutement » (motCle) propose la rubrique ; le nom d'un employeur de la liste (trois lettres au moins) aussi.
var MT_MOTS_OFFRES = ['offre', 'offres', 'recrutement', 'recrute', 'recruter', 'annonce', 'annonces'];
function mtRechercherOffres(offres, dep, aujourdhuiIso, requete) {
  var q = mtNormaliser(requete);
  if (q.length < 3) { return { motCle: false, pages: [] }; }
  var motCle = q.split(' ').some(function (m) { return MT_MOTS_OFFRES.indexOf(m) !== -1; });
  var pages = mtTrierAlphabetique(mtOffresVisibles(offres, dep, aujourdhuiIso).filter(function (o) { return mtNormaliser(o.nom).indexOf(q) !== -1; }));
  return { motCle: motCle, pages: pages };
}

// Rend la liste des erreurs. `contexte` = { secteurs: [cles], aujourdhui: 'AAAA-MM-JJ', employeurs: [identifiants des fiches] }.
function mtVerifierOffres(texte, contexte) {
  var r = mtParserOffres(texte);
  var erreurs = r.erreurs.slice();
  var vus = {};
  r.lignes.forEach(function (o) {
    var ou = 'ligne ' + o._ligne + ' (' + o.id + ') : ';
    if (!MT_RE_ID.test(o.id)) { erreurs.push(ou + 'identifiant invalide'); }
    if (vus[o.id]) { erreurs.push(ou + 'identifiant en double'); }
    vus[o.id] = true;
    if (MT_FAMILLES_OFFRES.indexOf(o.famille) === -1) { erreurs.push(ou + 'famille inconnue : ' + o.famille); }
    if (!o.nom) { erreurs.push(ou + 'nom vide'); }
    if (/^(m\.|mme|monsieur|madame|mlle)\b/i.test(o.nom)) { erreurs.push(ou + 'le nom ressemble à celui d’une personne : seulement des organismes'); }
    if (contexte.secteurs && contexte.secteurs.indexOf(o.secteur) === -1) { erreurs.push(ou + 'secteur inconnu : ' + o.secteur); }
    if (MT_TERRITOIRES_OFFRES.indexOf(o.territoire) === -1) { erreurs.push(ou + 'territoire inconnu : ' + o.territoire); }
    if (!/^https:\/\/\S+$/.test(o.page)) { erreurs.push(ou + 'page : une adresse https est attendue'); }
    if (MT_ADRESSES_INTERDITES_OFFRES.test(o.page)) { erreurs.push(ou + 'page d’un intermédiaire ou d’un site qui recopie des offres : interdit'); }
    if (o.employeur && contexte.employeurs && contexte.employeurs.indexOf(o.employeur) === -1) { erreurs.push(ou + 'fiche d’employeur inconnue : ' + o.employeur); }
    if (!o.date) { erreurs.push(ou + 'sans date de vérification à la main : la ligne ne doit pas exister'); }
    else if (!MT_RE_DATE.test(o.date)) { erreurs.push(ou + 'date invalide (AAAA-MM-JJ)'); }
    else if (contexte.aujourdhui && mtFraicheur(o.date, contexte.aujourdhui) === 'future') { erreurs.push(ou + 'date dans le futur'); }
    if (o.controle && !MT_RE_DATE.test(o.controle)) { erreurs.push(ou + 'date de contrôle invalide (AAAA-MM-JJ)'); }
    if (!o.source) { erreurs.push(ou + 'source vide'); }
    MT_COLONNES_OFFRES.forEach(function (c) { if (MT_RE_TIRET_LONG.test(o[c] || '')) { erreurs.push(ou + 'tiret long interdit (' + c + ')'); } });
  });
  return erreurs;
}

if (typeof module !== 'undefined') {
  module.exports = {
    MT_OUVERT: MT_OUVERT, mtOuvert: mtOuvert, mtEstEnLocal: mtEstEnLocal, MT_TYPES: MT_TYPES, MT_MODES: MT_MODES, MT_SECTEURS_AFFICHAGE: MT_SECTEURS_AFFICHAGE, MT_COLONNES_EMPLOYEURS: MT_COLONNES_EMPLOYEURS,
    MT_VALIDITE_MOIS: MT_VALIDITE_MOIS, MT_PAGE_TAILLE: MT_PAGE_TAILLE,
    mtNormaliser: mtNormaliser, mtMoisEcoules: mtMoisEcoules, mtFraicheur: mtFraicheur, mtContactAffichable: mtContactAffichable,
    mtParserRegistre: mtParserRegistre, mtParserEtablissements: mtParserEtablissements, mtEtablissementsEnTexte: mtEtablissementsEnTexte, mtParserModes: mtParserModes, mtParserEmployeurs: mtParserEmployeurs,
    mtParserCommunes: mtParserCommunes, mtTrouverCommune: mtTrouverCommune, mtDansMonIntercommunalite: mtDansMonIntercommunalite,
    mtTrierAlphabetique: mtTrierAlphabetique, mtEmployeursDuSecteur: mtEmployeursDuSecteur, mtCompterParSecteur: mtCompterParSecteur, mtPaginer: mtPaginer,
    MT_RAYONS: MT_RAYONS, MT_PORTEES: MT_PORTEES, MT_RAYONS_MIGRES: MT_RAYONS_MIGRES, MT_SOUS_BRANCHES: MT_SOUS_BRANCHES, MT_COLONNES_LIEUX: MT_COLONNES_LIEUX,
    mtDomaineDuRayon: mtDomaineDuRayon, MT_TYPES_SELON_COMMUNE: MT_TYPES_SELON_COMMUNE, MT_CLE_COMMUNE_INFO: MT_CLE_COMMUNE_INFO, mtParserZone: mtParserZone, mtZoneCouvre: mtZoneCouvre, mtOrdonnerParCommune: mtOrdonnerParCommune, mtNotesSelonCommune: mtNotesSelonCommune, mtCommuneInfoMemorisee: mtCommuneInfoMemorisee,
    mtParserLieux: mtParserLieux, mtRayonMigre: mtRayonMigre, mtLieuxDuRayon: mtLieuxDuRayon, mtLieuEnStructure: mtLieuEnStructure, mtRechercherLieux: mtRechercherLieux, mtLieuxVisibles: mtLieuxVisibles, MT_DEPARTEMENTS: MT_DEPARTEMENTS, MT_DEPARTEMENT_PAR_DEFAUT: MT_DEPARTEMENT_PAR_DEFAUT, mtDepartement: mtDepartement, mtDepartementOuvert: mtDepartementOuvert, mtDepartementsOuverts: mtDepartementsOuverts, mtMajuscule: mtMajuscule, mtNomsDesDepartementsOuverts: mtNomsDesDepartementsOuverts, mtPhraseTerritoireNonCouvert: mtPhraseTerritoireNonCouvert, mtCommunesDuDepartement: mtCommunesDuDepartement, mtEmployeursDuDepartement: mtEmployeursDuDepartement, mtRequeteSensible: mtRequeteSensible, mtVerifierLieux: mtVerifierLieux,
    mtFreinsCorrespondants: mtFreinsCorrespondants, mtFreinParTitre: mtFreinParTitre, mtLieuxPourFrein: mtLieuxPourFrein, mtTypeDeFicheLexique: mtTypeDeFicheLexique, mtLieuxDuType: mtLieuxDuType,
    mtRechercherEmployeurs: mtRechercherEmployeurs, mtRechercherSecteurs: mtRechercherSecteurs, mtVerifierEmployeurs: mtVerifierEmployeurs,
    MT_COLONNES_OFFRES: MT_COLONNES_OFFRES, MT_GROUPES_OFFRES: MT_GROUPES_OFFRES, MT_VALIDITE_OFFRES_MOIS: MT_VALIDITE_OFFRES_MOIS, mtParserOffres: mtParserOffres, mtFraicheurOffre: mtFraicheurOffre, mtGroupeOffre: mtGroupeOffre,
    mtOffresVisibles: mtOffresVisibles, mtOffresParGroupe: mtOffresParGroupe, mtOffreDeLEmployeur: mtOffreDeLEmployeur, mtVerifierOffres: mtVerifierOffres, mtRechercherOffres: mtRechercherOffres, mtTelephoneValide: mtTelephoneValide, mtFormaterTelephone: mtFormaterTelephone, mtLiensDepuisRegistre: mtLiensDepuisRegistre, mtLienAffichable: mtLienAffichable
  };
}
