/* ============================================================
   Repère de temps à trois niveaux, par module et par chemin (consignes 605, 606 et 607 ; maquette docs/MAQUETTE_TEMPS_PAR_MODULE_ET_CHEMIN_2026-11-25.html).
   SOURCE UNIQUE des niveaux : jamais recopiés ailleurs. Aucune minute n'est jamais annoncée (consigne 445) :
   1 = Rapide ; 2 = Un peu plus long ; 3 = À prendre à votre rythme.
   Le repère n'existe QUE dans le module : sur sa page de présentation (sous la phrase d'accroche, avec « Temps à prévoir : »)
   et sur les cartes de ses chemins (au-dessus du titre, sans préfixe). JAMAIS sur les tuiles de l'accueil (décision de Denis, 25/11/2026).
   `n` = niveau du module entier ; `chemins` = niveau de chaque chemin, par identifiant. Un module sans `chemins` n'a pas de second repère.
   Pour changer un niveau : modifier ICI, rien d'autre.
   ============================================================ */
var TEMPS_MOTS = { 1: 'Rapide', 2: 'Un peu plus long', 3: 'À prendre à votre rythme' };
var TEMPS_MOTS_LUS = { 1: 'rapide', 2: 'un peu plus long', 3: 'à prendre à votre rythme' };

var TEMPS_MODULES = {
  creer:       { n: 2, chemins: { assistant: 1, recit: 1, main: 3 } },
  reprendre:   { n: 2, chemins: { maj: 1, reformuler: 1, sans: 3 } },
  rapide:      { n: 1, chemins: { lettre: 1, entretien: 1 } },
  lettre:      { n: 2 },
  entretien:   { n: 2 },
  employeurs:  { n: 1 },
  reperes:     { n: 1 },
  carnet:      { n: 1 },
  lexique:     { n: 1 },
  competences: { n: 2 },
  compte:      { n: 3, chemins: { envies: 2, inspirent: 2, journee: 2, valeurs: 2, conditions: 2, experiences: 3, aide: 3, pas: 1 } },
  buia:        { n: 3, chemins: { comprendre: 1, fonctionne: 2, modeles: 2, ecrire: 3 } },
  bilan:       { n: 2 },
  regard:      { n: 2 },
  ats:         { n: 2 },
  coherence:   { n: 2 },
  cadre:       { n: 1 },
  chiffres:    { n: 1 },
  quifaitquoi: { n: 1 },
  pistes:      { n: 2 },
  ucpm:        { n: 2 },
  metiers:     { n: 3, chemins: { metier: 1, actions: 2, q: 3, recrute: 1 } }
};

// Niveau (1, 2 ou 3) d'un module, ou 0 s'il n'en a pas.
function tempsNiveauModule(idModule) {
  var m = TEMPS_MODULES[idModule];
  return m && TEMPS_MOTS[m.n] ? m.n : 0;
}
// Niveau d'un chemin d'un module, ou 0 s'il n'en a pas.
function tempsNiveauChemin(idModule, idChemin) {
  var m = TEMPS_MODULES[idModule], n = m && m.chemins ? m.chemins[idChemin] : 0;
  return TEMPS_MOTS[n] ? n : 0;
}
// Le repère : trois points (autant de pleins que le niveau) et le mot. `avecPrefixe` : « Temps à prévoir : » devant (pages de module seulement).
function htmlRepereTemps(n, avecPrefixe) {
  if (!TEMPS_MOTS[n]) { return ''; }
  return '<span class="repere-temps" data-niveau="' + n + '" role="img" aria-label="Temps à prévoir : ' + TEMPS_MOTS_LUS[n] + '">' +
    '<span class="repere-temps-pts" aria-hidden="true"><i></i><i></i><i></i></span>' +
    (avecPrefixe ? '<span class="repere-temps-pre" aria-hidden="true">Temps à prévoir :</span>' : '') +
    '<span class="repere-temps-mot" aria-hidden="true">' + TEMPS_MOTS[n] + '</span></span>';
}
// Ligne du repère d'un module entier, pour sa page de présentation (rien si le module n'a pas de niveau).
function htmlRepereTempsModule(idModule) {
  var n = tempsNiveauModule(idModule);
  return n ? '<div class="repere-temps-ligne">' + htmlRepereTemps(n, true) + '</div>' : '';
}
// Repère d'une carte de chemin, à poser au-dessus de son titre (rien si le chemin n'a pas de niveau).
// `dansBouton` : la carte est un <button>, qui n'accepte pas de <div> (HTML valide) : la ligne devient alors un <span> en bloc.
function htmlRepereTempsChemin(idModule, idChemin, dansBouton) {
  var n = tempsNiveauChemin(idModule, idChemin), b = dansBouton ? 'span' : 'div';
  return n ? '<' + b + ' class="repere-temps-ligne">' + htmlRepereTemps(n, false) + '</' + b + '>' : '';
}

if (typeof window !== 'undefined') {
  window.TEMPS_MODULES = TEMPS_MODULES;
  window.htmlRepereTempsModule = htmlRepereTempsModule;
  window.htmlRepereTempsChemin = htmlRepereTempsChemin;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TEMPS_MOTS: TEMPS_MOTS, TEMPS_MODULES: TEMPS_MODULES, tempsNiveauModule: tempsNiveauModule, tempsNiveauChemin: tempsNiveauChemin, htmlRepereTemps: htmlRepereTemps, htmlRepereTempsModule: htmlRepereTempsModule, htmlRepereTempsChemin: htmlRepereTempsChemin };
}
