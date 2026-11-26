/* ============================================================
   Module « Introduction » : logique pure (aucun accès au DOM, testée par `npm test`).
   La page présente l'application en quelques mots et en images (maquette validée par Denis le 02/11/2026 : docs/MAQUETTE_INTRODUCTION_APPLICATION_2026-11-01.html).
   Ouverture : l'Introduction parle des modules « Employeurs près de chez moi » et « Qui fait quoi ». Elle s'ouvre donc au public en même temps qu'eux
   (interrupteur MT_OUVERT, modules/mon-territoire/logique.js) ; en attendant, elle n'est visible que sur le poste de Denis (localhost) ou en aperçu.
   ============================================================ */

// Les outils du bloc « Comprendre ce qui se passe près de chez vous ». `libelle` = le nom de la tuile sur l'accueil (data/metiers.js, INFOS_CARTE_ACCUEIL) :
// la ligne n'apparaît que si cette tuile existe (donc jamais « Qui fait quoi » ni « Employeurs » tant que le module est fermé). Les phrases sont celles de la maquette validée.
var INTRO_OUTILS_TERRITOIRE = [
  { libelle: 'Comprendre le cadre', icone: 'bi-journal-text', phrase: 'les règles, les aides et les dispositifs de l’emploi et de la formation.', court: 'Les règles, les aides et les dispositifs' },
  { libelle: 'Comprendre les chiffres', icone: 'bi-bar-chart', phrase: 'le chômage, l’emploi et les métiers qui recrutent.', court: 'Le chômage et les métiers qui recrutent' },
  { libelle: 'Qui fait quoi', icone: 'bi-signpost-split', phrase: 'les structures à qui vous adresser, avec leurs coordonnées.', court: 'À qui s’adresser, avec les coordonnées' },
  { libelle: 'Employeurs près de chez moi', icone: 'bi-geo-alt', phrase: 'des employeurs à qui envoyer une candidature spontanée.', court: 'Des employeurs à qui écrire, avec la date de vérification' }
];
// `court` : la version pour le diaporama oral (peu de texte à l'écran), voulue différente de `phrase` ; la liste, elle, reste la seule source des outils ouverts.

// Les deux images du bloc territoire : chacune suit l'ouverture de son outil.
var INTRO_IMAGES_TERRITOIRE = [
  { libelle: 'Comprendre les chiffres', fichier: 'i_chiffres_1_chomage', legende: 'Comprendre les chiffres : le taux de chômage de votre département.' },
  { libelle: 'Employeurs près de chez moi', fichier: 'i_employeurs_2_liste', legende: 'Employeurs près de chez moi : la liste, avec la date de vérification et le lien vers leurs offres.' }
];

// Toutes les images de la page et du diaporama (dossier images/introduction/) : sert au test qui vérifie qu'aucune n'a disparu.
// Les trois images avant la dernière (outil de veille, sas, outil de prospection) ne servent qu'au diaporama.
var INTRO_IMAGES = ['accueil', 'accueil_bas', 'i_cv_1_choix', 'i_cv_2_objectif', 'i_cv_3_parcours', 'i_cv_4_profil', 'modeles_creatifs', 'modele_grand', 'modeles_sobres',
  'i_lettre_1_preparer', 'i_lettre_2_mise_en_page', 'i_entretien_1_resultat', 'i_bilan_2_resultat', 'i_bilan_3_resultat', 'i_chiffres_1_chomage', 'i_employeurs_2_liste',
  'i_veille_1_accueil', 'i_veille_2_sas', 'i_prospection_1_carnet', 'i_metiers_1_chemins',
  'i_mod_reperes', 'i_mod_carnet', 'i_mod_lexique', 'i_mod_competences', 'i_mod_regard', 'i_mod_ats', 'i_mod_coherence', 'i_mod_pistes', 'i_mod_ucpm', 'i_mod_ce_qui_compte', 'i_mod_bien_utiliser_ia', 'i_appareils'];

// Les onze modules présentés par groupes (page et diaporama) : `libelle` = le nom de la tuile sur l'accueil (c'est lui qui décide si le module est ouvert), `fichier` = capture du haut de sa page,
// `court` = légende sous l'image du diaporama. Les noms, icônes et phrases de la page sont LUS sur l'accueil (itemsInfoCarteAccueil), jamais recopiés.
var INTRO_GROUPES_MODULES = [
  { id: 'outils', carte: 'boiteaoutils', titre: 'La boîte à outils', icone: 'bi-briefcase', colonnes: 2,
    intro: 'Quatre outils que vous ouvrez quand vous en avez besoin, sans ordre imposé et sans que rien ne soit noté. Sur l’accueil, ils sont réunis dans la carte « Boîte à outils ».',
    sousTitre: 'Quatre outils à ouvrir quand vous en avez besoin.',
    notes: 'Les quatre outils de la carte « Boîte à outils ». Aucun ordre, aucune note. Chacun a sa vidéo d’une minute sur sa page.',
    modules: [
      { libelle: 'Mes Repères', fichier: 'i_mod_reperes', court: 'Mes Repères : garder une pensée' },
      { libelle: 'Mon Carnet', fichier: 'i_mod_carnet', court: 'Mon Carnet : écrire librement' },
      { libelle: 'Lexique', fichier: 'i_mod_lexique', court: 'Lexique : comprendre un mot' },
      { libelle: 'Découvrir mes compétences', fichier: 'i_mod_competences', court: 'Découvrir mes compétences' }] },
  // Deux outils de plus dans la même carte de l'accueil (ouverts le 25/11/2026), présentés à part pour que chaque image reste lisible. Même source : les noms et les phrases sont lus sur l'accueil.
  { id: 'mots', carte: 'boiteaoutils', titre: 'Pour mettre des mots et mieux demander', icone: 'bi-chat-left-text', colonnes: 2,
    intro: 'Deux outils de plus dans la Boîte à outils : l’un pour dire ce qui compte pour vous, l’autre pour apprendre à écrire une demande claire à un assistant en ligne. Ni test, ni note.',
    sousTitre: 'Mettre des mots sur ce qui compte, bien demander à un assistant.',
    notes: 'Deux outils de plus dans la carte « Boîte à outils ». Le premier aide à dire ce que l’on aimerait et ce qui compte pour soi, sans test ni note ; les résultats gardés peuvent s’imprimer pour un rendez-vous. Le second apprend à écrire une demande claire à un assistant en ligne et à vérifier sa réponse. Chacun a sa vidéo sur sa page.',
    modules: [
      { libelle: 'Ce qui compte pour moi', fichier: 'i_mod_ce_qui_compte', court: 'Ce qui compte pour moi : dire ses envies' },
      { libelle: 'Bien utiliser l’IA', fichier: 'i_mod_bien_utiliser_ia', court: 'Bien utiliser l’IA : demander clairement' }] },
  { id: 'regards', carte: 'analyse', titre: 'D’autres regards sur votre candidature', icone: 'bi-search', colonnes: 3,
    intro: 'En plus de « Analyser ma candidature », ces outils donnent un avis extérieur avant d’envoyer vos documents. Ils demandent un CV déjà prêt.',
    sousTitre: 'Un avis extérieur avant d’envoyer vos documents.',
    notes: 'Trois outils, en plus de « Analyser ma candidature ». Aucun n’est une note ni le verdict d’un vrai recruteur : ce sont des pistes à vérifier.',
    modules: [
      { libelle: 'Un regard sur mon CV', fichier: 'i_mod_regard', court: 'Un regard sur mon CV : ce que voit un recruteur' },
      { libelle: 'Les mots de votre CV (ATS)', fichier: 'i_mod_ats', court: 'Les mots de votre CV : parle-t-il comme l’offre ?' },
      { libelle: 'Cohérence de mon dossier', fichier: 'i_mod_coherence', court: 'Cohérence : mes documents se tiennent-ils ?' }] },
  { id: 'pistes', carte: 'orientation', titre: 'Quand vous avez des pistes', icone: 'bi-signpost-split', colonnes: 2,
    intro: 'Une fois que vous avez une ou plusieurs idées de métier, ces outils vous aident à décider et à préparer vos documents.',
    sousTitre: 'Choisir, puis préparer ses documents.',
    notes: 'Pour celles et ceux qui ont plusieurs idées de métier. La comparaison ne désigne aucune « meilleure » piste.',
    modules: [
      { libelle: 'Comparer mes pistes', fichier: 'i_mod_pistes', court: 'Comparer mes pistes : choisir vous-même' },
      { libelle: 'Un CV, plusieurs métiers', fichier: 'i_mod_ucpm', court: 'Un CV, plusieurs métiers : un CV pour chacun' }] }
];

// Libellés (de la tuile) disponibles = ceux de toutes les cartes de l'accueil. `libellesOuverts` : tableau de textes.
function introFiltrerParOuverture(liste, libellesOuverts) {
  var ouverts = libellesOuverts || [];
  return (liste || []).filter(function (x) { return ouverts.indexOf(x.libelle) !== -1; });
}

// Les boutons du haut présentés dans l'Introduction (demande de Denis, 02/11/2026 : ils facilitent la navigation). Leurs textes ne sont PAS recopiés : ils sont lus,
// par titre, dans l'explication rapide de l'accueil (AIDE_ACCUEIL_HAUT, js/app.js), la source déjà validée. Le Journal et le panier (qui n'apparaissent qu'après usage) n'y figurent pas.
var INTRO_TITRES_BOUTONS_HAUT = ['Affichage', 'Aide (l’ampoule)', 'Sauvegarder ma session', 'Nouveautés', 'Mon Carnet'];
function introChoisirBoutonsHaut(source, titres) {
  var liste = source || [];
  return (titres || []).map(function (t) {
    for (var i = 0; i < liste.length; i++) { if (liste[i] && liste[i].titre === t) { return liste[i]; } }
    return null;
  }).filter(function (x) { return x && x.icone && x.texte; });
}

// Diaporama oral (maquette validée par Denis le 02/11/2026 : docs/MAQUETTE_DIAPORAMA_INTRODUCTION_2026-11-02.html). Les boutons du haut gardent leur icône et leur titre lus à la source
// (AIDE_ACCUEIL_HAUT) ; seule la phrase est raccourcie pour l'écran. Un bouton absent de cette liste garde la phrase de l'explication rapide : jamais une ligne vide.
var INTRO_TITRES_DIAPO_BOUTONS = ['Affichage', 'Aide (l’ampoule)', 'Sauvegarder ma session', 'Nouveautés'];
var INTRO_PHRASES_COURTES_BOUTONS = {
  'Affichage': 'Taille du texte, couleurs',
  'Aide (l’ampoule)': 'Explique la page où vous êtes',
  'Sauvegarder ma session': 'Dans un fichier, chez vous',
  'Nouveautés': 'Ce qui vient d’être ajouté'
};
function introPhraseCourteBouton(bouton) {
  if (!bouton) { return ''; }
  return INTRO_PHRASES_COURTES_BOUTONS[bouton.titre] || bouton.texte || '';
}

// Numéro de diapositive toujours valide (0 à n-1), même après un clavier qui répète ou une liste plus courte qu'avant.
function introBornerDiapo(i, n) {
  var total = Math.max(0, Math.floor(Number(n) || 0));
  if (!total) { return 0; }
  var k = Math.floor(Number(i));
  if (isNaN(k)) { k = 0; }
  return Math.max(0, Math.min(total - 1, k));
}

// « 39 modèles : 13 sobres et 26 créatifs » ; sans les deux nombres (liste illisible), une phrase sans chiffre plutôt qu'un chiffre faux.
function introPhraseModeles(sobres, creatifs) {
  var s = Number(sobres) || 0, c = Number(creatifs) || 0;
  if (!s || !c) { return '<strong>de nombreux modèles</strong>, sobres et créatifs'; }
  return '<strong>' + (s + c) + ' modèles</strong> : ' + s + ' sobres et ' + c + ' créatifs';
}

// Le texte de la vidéo, lu dans son fichier de sous-titres (une seule source, jamais recopié) : les lignes des sous-titres sont jointes, puis coupées en phrases.
function introTexteDepuisVtt(vtt) {
  var texte = String(vtt || '').replace(/\r/g, '').split(/\n\s*\n/).map(function (bloc) {
    return bloc.split('\n').filter(function (l) { return l && l.indexOf('-->') === -1 && l.indexOf('WEBVTT') !== 0 && !/^[0-9]+$/.test(l); }).join(' ');
  }).join(' ').replace(/\s+/g, ' ').trim();
  var phrases = texte.match(/[^.!?]+[.!?]+/g);
  return phrases ? phrases.map(function (p) { return p.trim(); }) : (texte ? [texte] : []);
}

// Vrai si l'Introduction est visible : mêmes conditions que « Qui fait quoi » (ouvert au public, poste local ou aperçu). `mtOuvertFn` : la fonction mtOuvert() ; absente = fermé.
function introEstOuverte(mtOuvertFn) {
  try { return typeof mtOuvertFn === 'function' && !!mtOuvertFn(); } catch (e) { return false; }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INTRO_OUTILS_TERRITOIRE: INTRO_OUTILS_TERRITOIRE, INTRO_IMAGES_TERRITOIRE: INTRO_IMAGES_TERRITOIRE, INTRO_IMAGES: INTRO_IMAGES, INTRO_GROUPES_MODULES: INTRO_GROUPES_MODULES,
    introFiltrerParOuverture: introFiltrerParOuverture, introEstOuverte: introEstOuverte, introPhraseModeles: introPhraseModeles,
    INTRO_TITRES_BOUTONS_HAUT: INTRO_TITRES_BOUTONS_HAUT, introChoisirBoutonsHaut: introChoisirBoutonsHaut,
    INTRO_TITRES_DIAPO_BOUTONS: INTRO_TITRES_DIAPO_BOUTONS, INTRO_PHRASES_COURTES_BOUTONS: INTRO_PHRASES_COURTES_BOUTONS,
    introPhraseCourteBouton: introPhraseCourteBouton, introBornerDiapo: introBornerDiapo, introTexteDepuisVtt: introTexteDepuisVtt };
}
