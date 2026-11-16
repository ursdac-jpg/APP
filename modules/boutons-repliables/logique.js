/* ============================================================
   Boutons repliables : logique pure (testée par Node, tests/boutonsRepliables.test.js).
   Trois flèches rangent les boutons fixes du haut : « gauche » (roue, ampoule, disquette, nouveautés),
   « intro » (Introduction), « droite » (Carnet, Journal, Pistes de côté). Maquette : docs/MAQUETTE_BOUTONS_REPLIABLES_2026-11-15.html (consignes 332 à 332 sexies).
   Règles : le repli est toujours le choix de la personne (jamais automatique), il dure toute la navigation (la session) ; les boutons se posent par-dessus la page et ne la poussent jamais.
   ============================================================ */

var BR_GROUPES = {
  gauche: { boutons: ['btnPreferencesAffichage', 'btnAide', 'btnSessionTransfert', 'btnNouveautes'], panneaux: ['panneauPreferencesAffichage', 'panneauAide', 'panneauSessionTransfert'],
    fleche: 'flecheBoutonsGauche', classe: 'repli-gauche', libelle: 'les boutons du haut' },
  intro: { boutons: ['btnIntroduction'], panneaux: [], fleche: 'flecheIntroduction', classe: 'repli-intro', libelle: 'Introduction' },
  droite: { boutons: ['btnCarnet', 'btnJournalParcours', 'btnComparerPanier'], panneaux: ['panneauCarnet', 'panneauJournalParcours', 'panneauComparerPanier'],
    fleche: 'flecheBoutonsDroite', classe: 'repli-droite', libelle: 'les boutons de droite' }
};
var BR_NOMS = ['gauche', 'intro', 'droite'];

// Le groupe d'un bouton (par son identifiant), ou null.
function brGroupeDe(idBouton) {
  for (var i = 0; i < BR_NOMS.length; i++) {
    if (BR_GROUPES[BR_NOMS[i]].boutons.indexOf(idBouton) !== -1) { return BR_NOMS[i]; }
  }
  return null;
}

// État de départ : rien n'est replié (première visite exactement comme avant).
function brEtatInitial() { return { gauche: false, intro: false, droite: false }; }

// Relit un état enregistré (texte) ; tout ce qui n'est pas clair redonne l'état de départ.
function brLireEtat(texte) {
  var etat = brEtatInitial();
  if (typeof texte !== 'string' || !texte) { return etat; }
  var obj;
  try { obj = JSON.parse(texte); } catch (e) { return etat; }
  if (!obj || typeof obj !== 'object') { return etat; }
  BR_NOMS.forEach(function (n) { etat[n] = obj[n] === true; });
  return etat;
}

function brEcrireEtat(etat) { return JSON.stringify({ gauche: !!(etat && etat.gauche), intro: !!(etat && etat.intro), droite: !!(etat && etat.droite) }); }

// Replie ou déplie un groupe (nouvel état, l'ancien n'est pas modifié).
function brBasculer(etat, nom) {
  var suite = brLireEtat(brEcrireEtat(etat));
  if (BR_NOMS.indexOf(nom) !== -1) { suite[nom] = !suite[nom]; }
  return suite;
}

// Texte du bouton-flèche (lecteur d'écran et infobulle).
function brLibelleFleche(nom, replie) {
  var g = BR_GROUPES[nom];
  if (!g) { return ''; }
  return (replie ? 'Montrer ' : 'Cacher ') + g.libelle;
}

// Une animation de clignotement d'un bouton rangé doit-elle faire clignoter la flèche ? (le nom d'une animation de pulse contient « pulse »).
function brEstAnimationPulse(nomAnimation) { return typeof nomAnimation === 'string' && /pulse/i.test(nomAnimation); }

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BR_GROUPES: BR_GROUPES, BR_NOMS: BR_NOMS, brGroupeDe: brGroupeDe, brEtatInitial: brEtatInitial, brLireEtat: brLireEtat, brEcrireEtat: brEcrireEtat,
    brBasculer: brBasculer, brLibelleFleche: brLibelleFleche, brEstAnimationPulse: brEstAnimationPulse };
}
