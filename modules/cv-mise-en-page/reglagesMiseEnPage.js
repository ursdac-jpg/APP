/* ============================================================
   reglagesMiseEnPage.js  --  MODELE DE REGLAGES CANONIQUE
   ------------------------------------------------------------
   Chantier "La mise en page du CV" (docs/CADRAGE_MISE_EN_PAGE_2026-09-03.md,
   sous-etape 1). Approche "B allege" : UN modele de reglages unique, traduit
   ENSUITE vers chaque moteur de rendu existant (PDF iframe, Word Composeur)
   par reglagesTraducteurs.js -- les deux moteurs ne sont PAS fusionnes.

   Ce fichier ne fait RIEN tout seul : il declare le schema + fabrique l'objet
   par defaut + fusionne proprement un patch. Aucune UI, aucun rendu, aucune
   dependance. Branche a l'UI a partir de la sous-etape 4.

   Perimetre : reglages de NIVEAU MENU (Simple / Je debute / Tout regler).
   NE SONT PAS ici, volontairement :
   - l'etat de manipulation directe du grand apercu PDF (_cvPdf* : positions
     libres d'en-tete, echelles/polices/puces PAR RUBRIQUE, texte edite sur
     place, ordre glisse...) -- il reste dans l'iframe, "garde, rhabille,
     jamais reecrit" (INVENTAIRE_ZERO_REGRESSION_MISE_EN_PAGE.md sect. 6) ;
   - l'inclusion de la photo -- reste `dossier.photo.inclure` (une seule
     source de verite, LECONS regle 13). Ici on ne pilote que l'anneau photo,
     qui est un reglage de style.

   Valeurs par defaut : reprises A L'IDENTIQUE de _PDF_ETAT_DEFAUT
   (cvPdfPanneauReglages.js) + des defauts Word + des defauts A5, verifiees
   dans INVENTAIRE_REGLAGES_CV_2026-09-02.md sect. J.4 / J.6. Les jetons de
   valeur restent proches de ceux du PDF (moteur le plus riche : 67 reglages
   contre 29) pour que le traducteur -> PDF soit quasi 1:1 ; c'est le
   traducteur -> Word qui porte la traduction avec perte.
   ============================================================ */

/* ------------------------------------------------------------
   Schema declaratif : une entree par reglage.
   { type, valeurs?, min?, max?, pas?, defaut, word }
   - type   : 'enum' | 'bool' | 'hex' | 'nombre' | 'liste' | 'map'
   - word   : true            -> Word sait le faire
              false           -> PDF uniquement (l'UI le montre + explique,
                                  jamais masque en silence)
              'note: ...'     -> Word le fait autrement / partiellement
   - section: rangement maquette v6 (indicatif, l'UI s'en resservira)
   ------------------------------------------------------------ */
var REGLAGES_MISE_EN_PAGE_CHAMPS = {

  /* ----- La page ----- */
  format:            { type: 'enum', valeurs: ['a4-detaille', 'a4-essentiel', 'a4-integral', 'a5-portrait', 'a5-paysage'], defaut: 'a4-detaille', word: true, section: 'page' },
  colonnes:          { type: 'enum', valeurs: ['1', '2'], defaut: '2', word: true, section: 'page' },
  taille:            { type: 'nombre', min: 9, max: 14, pas: 0.5, defaut: 11, word: 'note: via la mise en forme', section: 'page' },
  densite:           { type: 'enum', valeurs: ['aere', 'normal', 'compact'], defaut: 'normal', word: true, section: 'page' },
  interligne:        { type: 'enum', valeurs: ['serre', 'normal', 'aere'], defaut: 'normal', word: true, section: 'page' },
  espacementParas:   { type: 'enum', valeurs: ['serre', 'normal', 'large'], defaut: 'normal', word: true, section: 'page' },
  marges:            { type: 'enum', valeurs: ['etroites', 'normales', 'larges'], defaut: 'normales', word: true, section: 'page' },
  alignement:        { type: 'enum', valeurs: ['gauche', 'justifie'], defaut: 'gauche', word: true, section: 'page' },
  pages:             { type: 'enum', valeurs: ['1page', '2pages'], defaut: '1page', word: 'note: constat A/B/C', section: 'page' },
  colonnesInversees: { type: 'bool', defaut: false, word: true, section: 'page' },
  // TACHE (retour utilisateur 2026-09-15, bug reel confirme : "atroce,
  // vraiment pourri", capture d'ecran) : 35 au lieu de 50, EXACTEMENT
  // aligne sur _PDF_ETAT_DEFAUT (cvPdfPanneauReglages.js), deja corrige --
  // ce fichier se veut sa copie A L'IDENTIQUE (voir l'entete du fichier),
  // jamais une 2e valeur qui diverge. La colonne gauche recoit par
  // convention la rubrique la plus LEGERE, la droite la plus LOURDE
  // (Experience professionnelle en general) -- 50/50 les ecrasait a
  // egalite.
  largeurColonneGauche: { type: 'nombre', min: 30, max: 70, pas: 5, defaut: 35, word: false, section: 'page' },
  formeColonnes:     { type: 'enum', valeurs: ['rectangle', 'diagonale'], defaut: 'rectangle', word: false, section: 'page' },
  separateurColonnes: { type: 'bool', defaut: false, word: true, section: 'page' },
  separateurCouleur: { type: 'hex', defaut: null, word: true, section: 'page' },

  /* ----- La page / Mini CV A5 (PDF uniquement pour les reglages fins) ----- */
  fondColonnesA5:    { type: 'enum', valeurs: ['droite', 'gauche', 'lesDeux', 'milieu', 'aucun'], defaut: 'droite', word: false, section: 'page' },
  enteteInverseeA5:  { type: 'bool', defaut: false, word: false, section: 'page' },
  remplirPageA5:     { type: 'bool', defaut: false, word: false, section: 'page' },
  echelleA5:         { type: 'nombre', min: 9, max: 14, pas: 0.5, defaut: 11, word: false, section: 'page' },

  /* ----- Les couleurs ----- */
  accent:            { type: 'hex', defaut: '#2f6690', word: true, section: 'couleurs' },
  accentClair:       { type: 'hex', defaut: '#d9e8f2', word: false, section: 'couleurs' },
  nuance:            { type: 'nombre', min: 4, max: 10, pas: 1, defaut: 10, word: true, section: 'couleurs' },
  couleurEntrepriseActive: { type: 'bool', defaut: false, word: true, section: 'couleurs' },
  fondColonnes:      { type: 'enum', valeurs: ['aucun', 'gauche', 'droite', 'lesDeux'], defaut: 'droite', word: true, section: 'couleurs' },
  fondColonnesEffet: { type: 'enum', valeurs: ['fondSeul', 'titres'], defaut: 'fondSeul', word: true, section: 'couleurs' },
  fondColonnePleineHauteur: { type: 'bool', defaut: false, word: true, section: 'couleurs' },
  degradeColonnes:   { type: 'enum', valeurs: ['fonce-clair', 'clair-fonce', 'uni'], defaut: 'fonce-clair', word: 'note: via coloration', section: 'couleurs' },
  texteFondColonnes: { type: 'enum', valeurs: ['blanc', 'noir'], defaut: 'blanc', word: true, section: 'couleurs' },
  couleurFondCompetences: { type: 'hex', defaut: '#e9e9e9', word: 'note: via coloration', section: 'couleurs' },
  couleurTextePuces: { type: 'hex', defaut: '#1b1b1b', word: false, section: 'couleurs' },

  /* ----- Le haut de la page ----- */
  bandeauEnTete:     { type: 'bool', defaut: true, word: true, section: 'haut' },
  formeEnTete:       { type: 'enum', valeurs: ['rectangle', 'diagonale'], defaut: 'rectangle', word: false, section: 'haut' },
  degradeBandeau:    { type: 'enum', valeurs: ['fonce-clair', 'clair-fonce', 'uni'], defaut: 'fonce-clair', word: 'note: via texte du bandeau', section: 'haut' },
  bandeauDisponibilite: { type: 'bool', defaut: false, word: true, section: 'haut' },
  dispositionEntete: { type: 'enum', valeurs: ['3colonnes', '2colonnes'], defaut: '3colonnes', word: false, section: 'haut' },
  anneauPhoto:       { type: 'bool', defaut: false, word: true, section: 'haut' },
  positionLibreEntete: { type: 'bool', defaut: true, word: false, section: 'haut' },
  largeurAccrocheLibre: { type: 'nombre', min: 30, max: 90, pas: 5, defaut: 30, word: false, section: 'haut' },
  largeurMetierLibre: { type: 'nombre', min: 20, max: 60, pas: 1, defaut: 32, word: false, section: 'haut' },

  /* ----- Le texte ----- */
  police:            { type: 'enum', valeurs: ['segoe', 'georgia', 'verdana', 'garamond', 'arial', 'calibri', 'tahoma', 'trebuchet', 'times', 'palatino'], defaut: 'segoe', word: 'note: 4 polices en Word', section: 'texte' },
  styleTitres:       { type: 'enum', valeurs: ['sans-decor', 'souligne', 'bandeau', 'pastille'], defaut: 'souligne', word: 'note: via style', section: 'texte' },
  lectureGuidee:     { type: 'bool', defaut: false, word: true, section: 'texte' },
  styleCompetences:  { type: 'enum', valeurs: ['pastille', 'rectangle', 'texte-seul'], defaut: 'pastille', word: 'note: via style', section: 'texte' },
  icones:            { type: 'bool', defaut: false, word: true, section: 'texte' },
  iconesCoordonnees: { type: 'bool', defaut: false, word: true, section: 'texte' },
  styleBordures:     { type: 'enum', valeurs: ['fine', 'epaisse'], defaut: 'fine', word: false, section: 'texte' },
  styleProfessionnel: { type: 'enum', valeurs: ['epure', 'condense'], defaut: 'epure', word: true, section: 'texte' },
  stylePersonnel:    { type: 'enum', valeurs: ['epure', 'condense'], defaut: 'epure', word: true, section: 'texte' },
  bandeauCompetencesCles: { type: 'bool', defaut: false, word: false, section: 'texte' },
  coinsArrondis:     { type: 'bool', defaut: false, word: false, section: 'texte' },
  // "Mettre en evidence" : les 6 vraies cases du code (souligne + italique
  // x poste / dates / entreprise). Le libelle "gras" de la maquette v6 est
  // une erreur de maquette (INVENTAIRE_ZERO_REGRESSION sect. 8 point 5).
  souligner:         { type: 'map', clefs: ['poste', 'dates', 'entreprise'], defaut: { poste: false, dates: false, entreprise: false }, word: 'note: partiel', section: 'texte' },
  italique:          { type: 'map', clefs: ['poste', 'dates', 'entreprise'], defaut: { poste: false, dates: false, entreprise: false }, word: 'note: partiel', section: 'texte' },

  /* ----- Ce qui s'affiche ----- */
  ordreExperiences:  { type: 'enum', valeurs: ['pertinence', 'recentes', 'anciennes', 'poste-az'], defaut: 'pertinence', word: true, section: 'affiche' },
  // Defauts alignes sur le COMPORTEMENT REEL actuel du Word (verifie en
  // sous-etape 2 : ordreDatesPoste effectif = 'posteAvant', accroche non
  // italique -- reglagesProjetXXL.accrocheItalique = null -> !!null = false).
  ordreDatesPoste:   { type: 'enum', valeurs: ['dates', 'poste'], defaut: 'poste', word: true, section: 'affiche' },
  accrocheItalique:  { type: 'bool', defaut: false, word: true, section: 'affiche' },
  sansAccroche:      { type: 'bool', defaut: false, word: true, section: 'affiche' },
  lettreJointe:      { type: 'bool', defaut: false, word: true, section: 'affiche' },
  regroupement:      { type: 'bool', defaut: false, word: true, section: 'affiche' },
  formatExperiences: { type: 'enum', valeurs: ['standard', 'ameliore'], defaut: 'standard', word: false, section: 'affiche' },
  formationsMisesEnAvant: { type: 'bool', defaut: false, word: 'note: via Complet/Optimise', section: 'affiche' },
  veuves:            { type: 'bool', defaut: true, word: true, section: 'affiche' },
  // NOUVEAU (maquette) : liste unique afficher/masquer. Aujourd'hui eparpille
  // dans le code ; ici on centralise. Defaut : tout visible.
  rubriques:         { type: 'map', clefs: ['langues', 'certifications', 'logiciels', 'experiencesPersonnelles', 'loisirs', 'engagements', 'permis'],
                       defaut: { langues: true, certifications: true, logiciels: true, experiencesPersonnelles: true, loisirs: true, engagements: true, permis: true },
                       word: true, section: 'affiche' },
  // NOUVEAU (maquette) : ordre des rubriques. [] = ordre automatique du
  // moteur (composeurStrategies) -- on ne fige jamais un ordre en dur ici.
  ordreRubriques:    { type: 'liste', defaut: [], word: true, section: 'affiche' },
  // Word uniquement (asymetrie assumee, REVUE_CRITIQUE 1.2).
  blocMisEnAvant:       { type: 'enum', valeurs: ['competences', 'formations', 'langues', ''], defaut: '', word: true, section: 'affiche' },
  blocMisEnAvantGauche: { type: 'enum', valeurs: ['competences', 'formations', 'langues', ''], defaut: '', word: true, section: 'affiche' },
  blocMisEnAvantDroite: { type: 'enum', valeurs: ['competences', 'formations', 'langues', ''], defaut: '', word: true, section: 'affiche' },

  /* ----- Simple (transformations rapides) ----- */
  // "Allure generale" : remplace regSobreActif + regCreatifActif (fusion).
  allure:            { type: 'enum', valeurs: ['sobre', 'defaut', 'creatif'], defaut: 'defaut', word: true, section: 'simple' },
  // "Quelles formations montrer" : booleen partage dossier.cvOptimiseActif
  // (false = Complet). Reflete ici pour l'UI ; la source reste ce booleen.
  formations:        { type: 'enum', valeurs: ['complet', 'optimise'], defaut: 'complet', word: true, section: 'simple' }
};

/* ------------------------------------------------------------
   reglagesMiseEnPageParDefaut() -- objet neuf, derive du schema (les
   defauts ne peuvent pas diverger d'une liste ecrite a la main).
   ------------------------------------------------------------ */
function reglagesMiseEnPageParDefaut() {
  var o = {};
  Object.keys(REGLAGES_MISE_EN_PAGE_CHAMPS).forEach(function (cle) {
    var d = REGLAGES_MISE_EN_PAGE_CHAMPS[cle].defaut;
    if (d && typeof d === 'object') {
      o[cle] = Array.isArray(d) ? d.slice() : JSON.parse(JSON.stringify(d));
    } else {
      o[cle] = d;
    }
  });
  return o;
}

/* ------------------------------------------------------------
   reglageMiseEnPageValide(cle, valeur) -- true si `valeur` est acceptable
   pour ce champ d'apres le schema. Sert au merge et aux tests.
   ------------------------------------------------------------ */
function reglageMiseEnPageValide(cle, valeur) {
  var champ = REGLAGES_MISE_EN_PAGE_CHAMPS[cle];
  if (!champ) { return false; }
  switch (champ.type) {
    case 'bool':
      return typeof valeur === 'boolean';
    case 'hex':
      return valeur === null || (typeof valeur === 'string' && /^#[0-9a-fA-F]{6}$/.test(valeur));
    case 'enum':
      return champ.valeurs.indexOf(valeur) !== -1;
    case 'nombre':
      return typeof valeur === 'number' && valeur >= champ.min && valeur <= champ.max;
    case 'liste':
      return Array.isArray(valeur);
    case 'map':
      if (!valeur || typeof valeur !== 'object' || Array.isArray(valeur)) { return false; }
      return Object.keys(valeur).every(function (k) {
        return champ.clefs.indexOf(k) !== -1 && typeof valeur[k] === 'boolean';
      });
    default:
      return false;
  }
}

/* ------------------------------------------------------------
   fusionnerReglagesMiseEnPage(base, patch) -- merge sur (le sous-ensemble
   du) schema. Toute cle inconnue ou toute valeur invalide est IGNOREE
   (jamais une exception : un patch abime ne doit pas casser l'ecran).
   Les `map` sont fusionnees clef par clef. Renvoie un objet neuf.
   ------------------------------------------------------------ */
function fusionnerReglagesMiseEnPage(base, patch) {
  var out = {};
  var socle = base || reglagesMiseEnPageParDefaut();
  Object.keys(socle).forEach(function (cle) {
    var v = socle[cle];
    out[cle] = (v && typeof v === 'object') ? (Array.isArray(v) ? v.slice() : JSON.parse(JSON.stringify(v))) : v;
  });
  if (!patch || typeof patch !== 'object') { return out; }
  Object.keys(patch).forEach(function (cle) {
    var champ = REGLAGES_MISE_EN_PAGE_CHAMPS[cle];
    if (!champ) { return; }
    if (champ.type === 'map') {
      var courant = (out[cle] && typeof out[cle] === 'object') ? out[cle] : {};
      var propose = patch[cle];
      if (propose && typeof propose === 'object' && !Array.isArray(propose)) {
        Object.keys(propose).forEach(function (k) {
          if (champ.clefs.indexOf(k) !== -1 && typeof propose[k] === 'boolean') { courant[k] = propose[k]; }
        });
        out[cle] = courant;
      }
      return;
    }
    if (reglageMiseEnPageValide(cle, patch[cle])) { out[cle] = patch[cle]; }
  });
  return out;
}

/* ------------------------------------------------------------
   Expose sur le scope global (pas de bundler -- meme convention que le
   reste du projet).
   ------------------------------------------------------------ */
if (typeof window !== 'undefined') {
  window.REGLAGES_MISE_EN_PAGE_CHAMPS = REGLAGES_MISE_EN_PAGE_CHAMPS;
  window.reglagesMiseEnPageParDefaut = reglagesMiseEnPageParDefaut;
  window.reglageMiseEnPageValide = reglageMiseEnPageValide;
  window.fusionnerReglagesMiseEnPage = fusionnerReglagesMiseEnPage;
}

// TACHE (chantier tests) : export CommonJS protege -- n'existe que sous
// Node (node:test), aucun effet en <script> navigateur.
if (typeof module !== 'undefined') {
  module.exports = {
    REGLAGES_MISE_EN_PAGE_CHAMPS: REGLAGES_MISE_EN_PAGE_CHAMPS,
    reglagesMiseEnPageParDefaut: reglagesMiseEnPageParDefaut,
    reglageMiseEnPageValide: reglageMiseEnPageValide,
    fusionnerReglagesMiseEnPage: fusionnerReglagesMiseEnPage
  };
}
