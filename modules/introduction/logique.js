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
// Les trois dernières (outil de veille, sas, outil de prospection) ne servent qu'au diaporama.
var INTRO_IMAGES = ['accueil', 'accueil_bas', 'i_cv_1_choix', 'i_cv_2_objectif', 'i_cv_3_parcours', 'i_cv_4_profil', 'modeles_creatifs', 'modele_grand', 'modeles_sobres',
  'i_lettre_1_preparer', 'i_lettre_2_mise_en_page', 'i_entretien_1_resultat', 'i_bilan_2_resultat', 'i_bilan_3_resultat', 'i_chiffres_1_chomage', 'i_employeurs_2_liste',
  'i_veille_1_accueil', 'i_veille_2_sas', 'i_prospection_1_carnet'];

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
  module.exports = { INTRO_OUTILS_TERRITOIRE: INTRO_OUTILS_TERRITOIRE, INTRO_IMAGES_TERRITOIRE: INTRO_IMAGES_TERRITOIRE, INTRO_IMAGES: INTRO_IMAGES,
    introFiltrerParOuverture: introFiltrerParOuverture, introEstOuverte: introEstOuverte, introPhraseModeles: introPhraseModeles,
    INTRO_TITRES_BOUTONS_HAUT: INTRO_TITRES_BOUTONS_HAUT, introChoisirBoutonsHaut: introChoisirBoutonsHaut,
    INTRO_TITRES_DIAPO_BOUTONS: INTRO_TITRES_DIAPO_BOUTONS, INTRO_PHRASES_COURTES_BOUTONS: INTRO_PHRASES_COURTES_BOUTONS,
    introPhraseCourteBouton: introPhraseCourteBouton, introBornerDiapo: introBornerDiapo, introTexteDepuisVtt: introTexteDepuisVtt };
}
