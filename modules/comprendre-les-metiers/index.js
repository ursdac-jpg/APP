/* ============================================================
   Module « Explorer les métiers » : interface (pages routées), partie commune.
   Charge avant js/app.js (référencé dans l'objet `routes`) ; logique pure dans logique.js, textes dans data/comprendreMetiersTextes.js.
   Fichiers frères : parMetier.js (entrée 1), parActions.js (entrée 2), questionnaire.js (entrée 3). Chacun enregistre ses vues ici
   (cmvEnregistrerVue) et ses gestes (cmvEnregistrerAction) : ce fichier ne connaît que la présentation, l'accueil du module et les petits composants.

   Décisions de Denis (16 et 17/11/2026), à ne pas rouvrir :
   - le module vit dans la carte d'accueil « Vous hésitez encore ? », trois entrées : par un métier, par ce que l'on aime faire, par un questionnaire ;
   - aucune fenêtre, sauf l'avertissement quand on quitte le questionnaire en cours ;
   - les lettres RIASEC décrivent des métiers (France Travail) et des préférences d'aujourd'hui, jamais la personne : jamais un diagnostic ;
   - le suivi d'usage ne reçoit que des noms d'événements, jamais une réponse.
   Plan : docs/PLAN_CLOTURE_COMPRENDRE_LES_METIERS_2026-11-16.md. Maquette : docs/MAQUETTE_COMPRENDRE_LES_METIERS_V2_2026-11-16.html.
   ============================================================ */

// INTERRUPTEUR UNIQUE du module (16/11/2026 : fermé, ouvert seulement sur le poste de Denis ; ouvert au public le 19/11/2026 sur sa décision).
// Ouvert : CMV_OUVERT à true, avec sa ligne dans data/nouveautes.js (décision D5, faite le 19/11/2026).
var CMV_OUVERT = true;   // OUVERT AU PUBLIC le 19/11/2026 (décision de Denis). Pour refermer : repasser à false (le module redevient visible seulement sur localhost).
var CMV_PONT_CHIFFRES_OUVERT = true;    // bouton « Comprendre pourquoi ils recrutent » : page « Pourquoi ils recrutent » (phase 5, consigne 427)
function cmvOuvert() {
  if (CMV_OUVERT) { return true; }
  try { return typeof location !== 'undefined' && /^(localhost|127\.0\.0\.1|\[::1\]|[^.]+\.localhost)$/.test(String(location.hostname || '')); } catch (e) { return false; }
}
// Phrase sur l'origine du test (17/11/2026, consigne 434) : une seule source, lue par la présentation et par l'ouverture du questionnaire.
var CMV_TEXTE_ORIGINE = 'Ce questionnaire reprend un modèle connu, que France Travail utilise pour décrire les métiers. Il a été rendu plus simple à lire et à remplir. Il donne des pistes de réflexion, pas une orientation : pour un choix de direction professionnelle, un conseiller ou un professionnel de l’accompagnement reste le meilleur appui.';
var CMV_NOM = 'Explorer les métiers';
var CMV_ICONE = 'bi-compass';
var CMV_ROUTE = 'comprendre-les-metiers';
var CMV_ROUTE_INTRO = 'comprendre-les-metiers-intro';
// Une présentation par chemin (décision de Denis, 18/11/2026) : metier = « Par un métier », actions = « Par ce que vous aimez faire », q = « Par un questionnaire de préférences ».
var CMV_ROUTES_CHEMINS = { metier: 'comprendre-les-metiers-intro-metier', actions: 'comprendre-les-metiers-intro-actions', q: 'comprendre-les-metiers-intro-q', recrute: 'comprendre-les-metiers-intro-recrute' };
function cmvEstRouteIntro(route) { return route === CMV_ROUTE_INTRO || route === CMV_ROUTES_CHEMINS.metier || route === CMV_ROUTES_CHEMINS.actions || route === CMV_ROUTES_CHEMINS.q || route === CMV_ROUTES_CHEMINS.recrute; }
var CMV_NOMS_LETTRES = { R: 'Réaliste', I: 'Investigateur', A: 'Artistique', S: 'Social', E: 'Entreprenant', C: 'Conventionnel' };
var CMV_OPPOSE = { R: 'S', S: 'R', I: 'E', E: 'I', A: 'C', C: 'A' };

var _cmvEtat = null;
var _cmvDetourPresentation = false;   // « Revoir la présentation » depuis une page de travail
var _cmvDetourChemin = '';            // présentation affichée : '' = la générale, sinon 'metier' | 'actions' | 'q' | 'recrute'
var _cmvSession = 1;                  // change quand le travail est effacé : les entrées d'historique d'avant n'ont plus de sens
var _cmvVues = {};                    // nom de vue -> { titre, rendre(etat) -> html, cabler(etat), barre(etat) -> options }
var _cmvActions = {};                 // nom de geste -> function (element, etat) ; renvoyer false = ne pas redessiner
var _cmvVueRendue = '';

function cmvEnregistrerVue(nom, def) { _cmvVues[nom] = def; }
function cmvEnregistrerAction(nom, fn) { _cmvActions[nom] = fn; }

function cmvEtatInitial() {
  return {
    vue: 'accueil',
    // entrée 1
    secteur: null, depuis: 'metier',
    // entrée 2 : identifiants des catalogues de l'application (activites = personnes, matériels, animaux ; actions ; environnement)
    choix: { activites: [], actions: [], environnement: [], conditions: [], faciles: [] },
    masquerConditions: false, grouper: false, plusRes: false, proches: {}, pont: null, plusPont: false, gardeChoix: null,
    // entrée 3
    q: { p1: {}, p2: {}, p3: {}, p4: {}, partie4Passee: false, partie: 1, page: { p1: 0, p2: 0, p3: 0, p4: 0 }, graine: 0, ordre: null, resultat: null, terminee: false, garde: false },
    // « Ma synthèse » (chantier du 18/11/2026) : jamais une réponse du questionnaire. retenu1, retenu2, retenu3 = le métier que la personne a retenu à chaque passage
    // ({ nom, rome } ou null, facultatif) ; niveau = niveau d'études de la personne (2 à 8 comme le ROME, ou null) ; suivi et complements = identifiants cochés ;
    // libre = texte libre plafonné ; lecture = réponse de l'assistant analysée ; gardee = la personne a choisi de garder sa synthèse dans la disquette.
    synthese: { retenu1: null, retenu2: null, retenu3: null, niveau: null, suivi: [], complements: [], parcours: [], libre: '', lecture: null, gardee: false, formation: 'tous', voirMasques: {},
      // aff = réponses aux questions « Affiner mes métiers » (passage 3) : { cle: idOption } et secteurs choisis ; jamais envoyées à la disquette (elles se refont en quelques clics)
      aff: { reponses: {}, secteurs: [] } }
  };
}
function cmvEtat() { if (!_cmvEtat) { _cmvEtat = cmvEtatInitial(); } return _cmvEtat; }
function cmvReinitialiser() { _cmvEtat = null; _cmvSession++; _cmvDetourPresentation = false; _cmvDetourChemin = ''; _cmvVueRendue = ''; }

// ---------------- Petits composants communs ----------------
function cmvE(s) { return typeof echapperAttribut === 'function' ? echapperAttribut(String(s)) : String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function cmvPastille(l, gros) { return '<span class="cml-p cml-ri-' + l + (gros ? ' gros' : '') + '" aria-hidden="true">' + l + '</span>'; }
function cmvLettres(s) { return String(s || '').split('').filter(function (l) { return CMV_NOMS_LETTRES[l]; }).map(function (l) { return cmvPastille(l); }).join('');
}
// Nombre de questions du questionnaire, calculé depuis les données (jamais écrit en dur). Aucune durée n'est annoncée (consigne 445, 17/11/2026).
function cmvNombreQuestions() { return CMQ_PARTIES.reduce(function (n, p) { return n + cmqEnonces(p).length; }, 0); }
function cmvMinuscule1(s) { return s.charAt(0).toLowerCase() + s.slice(1); }

// Hexagone des six types : les types opposés sont face à face. profil = { R: 0..100, ... } ou null (hexagone vide, pour la présentation).
function cmvHexagone(profil, avecOpposes) {
  var ORDRE = CML_LETTRES, cx = 290, cy = 212, R = 118;
  var ang = { R: -90, I: -30, A: 30, S: 90, E: 150, C: 210 };
  function pt(l, r) { var a = ang[l] * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
  var poly = ORDRE.map(function (l) { return pt(l, R).join(','); }).join(' ');
  var axes = ORDRE.map(function (l) { var p = pt(l, R); return '<line class="cml-hex-axe" x1="' + cx + '" y1="' + cy + '" x2="' + p[0] + '" y2="' + p[1] + '"/>'; }).join('');
  var opp = avecOpposes ? [['R', 'S'], ['I', 'E'], ['A', 'C']].map(function (o) {
    var a = pt(o[0], R), b = pt(o[1], R);
    return '<line class="cml-hex-opp" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"/>';
  }).join('') : '';
  var radar = '', desc = '';
  if (profil) {
    radar = '<polygon class="cml-hex-profil" points="' + ORDRE.map(function (l) { return pt(l, R * profil[l] / 100).join(','); }).join(' ') + '"/>' +
      ORDRE.map(function (l) { var p = pt(l, R * profil[l] / 100); return '<circle class="cml-hex-pt" cx="' + p[0] + '" cy="' + p[1] + '" r="5"/>'; }).join('');
    desc = ' Niveaux : ' + ORDRE.map(function (l) { return CMV_NOMS_LETTRES[l] + ' ' + Math.round(profil[l]) + ' pour cent'; }).join(', ') + '.';
  }
  var marques = ORDRE.map(function (l) {
    var p = pt(l, R + 34), t = pt(l, R + 66), ancre = (l === 'R' || l === 'S') ? 'middle' : (l === 'I' || l === 'A' ? 'start' : 'end');
    var ty = t[1] + (l === 'R' ? -4 : (l === 'S' ? 14 : 4));
    return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="19" style="fill:var(--ri-' + l + ')"/><text x="' + p[0] + '" y="' + (p[1] + 7) + '" text-anchor="middle" font-size="20" font-weight="800" style="fill:var(--ri-txt)">' + l + '</text>' +
      '<text x="' + (l === 'R' || l === 'S' ? t[0] : (ancre === 'start' ? p[0] + 24 : p[0] - 24)) + '" y="' + (l === 'R' || l === 'S' ? ty : p[1] + 5) + '" text-anchor="' + ancre + '" font-size="18" font-weight="700">' + CMV_NOMS_LETTRES[l] + '</text>';
  }).join('');
  return '<svg viewBox="0 0 580 440" role="img" aria-label="Hexagone des six types. Les types opposés sont face à face : réaliste et social, investigateur et entreprenant, artistique et conventionnel.' + cmvE(desc) + '">' +
    '<polygon class="cml-hex-fond" points="' + poly + '"/>' + axes + opp + radar + marques + '</svg>';
}

// Les lettres expliquées une à une (repliées). Les mots viennent de data/comprendreMetiersTextes.js.
function cmvFichesLettres(liste, premierOuvert) {
  return liste.map(function (l, i) {
    var d = TEXTES_LETTRES_RIASEC[l];
    return '<details class="cml-depli"' + (premierOuvert && i === 0 ? ' open' : '') + '><summary>' + cmvPastille(l) + ' <span>' + CMV_NOMS_LETTRES[l] + ' <span class="cml-note" style="font-weight:400">: ' + d.court + '</span></span></summary><div class="corps">' +
      '<p><b>En bref.</b> ' + d.bref + '</p>' +
      '<p><b>Ce qui vous attire souvent.</b> ' + d.attire + '</p>' +
      '<p><b>Points forts fréquents.</b> ' + d.forts + '</p>' +
      '<p><b>Ce qui demande parfois un peu d’attention.</b> ' + d.attention + '</p>' +
      '<p><b>Univers de travail qui conviennent souvent.</b> ' + d.univers + '</p>' +
      '<p><b>Métiers fréquents.</b> ' + d.metiers + '</p>' +
      '<p class="cml-note mb-0">Face à face sur l’hexagone : ' + cmvPastille(CMV_OPPOSE[l]) + ' ' + CMV_NOMS_LETTRES[CMV_OPPOSE[l]] + '.</p></div></details>';
  }).join('') + '<p class="cml-note">Ce sont des tendances observées chez des groupes de personnes, pas votre portrait. Tout le monde porte un peu de chaque type.</p>';
}

// Carte d'un métier : mêmes classes que la liste « Métiers qui pourraient vous intéresser » de « Votre profil » (css/style.css, .metier-carte*) et mêmes boutons communs
// (« Garder comme Repère », « Comparer »). extraHTML : ce que la carte dit en plus (pourcentage, lettres, niveau d'accès...).
function cmvLienFranceTravail(fiche) {
  return (fiche.rome && typeof lienFicheROME === 'function') ? lienFicheROME(fiche) : 'https://candidat.francetravail.fr/metierscope/recherche?motscles=' + encodeURIComponent(fiche.nom);
}
function cmvCarteMetier(fiche, extraHTML, opts) {
  var nom = fiche.nom, o = opts || {};
  var ancre = (typeof reperesBoutonAncre === 'function') ? reperesBoutonAncre({ libelle: 'Métier : ' + nom }) : '';
  var panier = (typeof comparerBoutonPanier === 'function') ? comparerBoutonPanier(nom) : '';
  return '<div class="metier-carte' + (o.premier ? ' metier-carte-large' : '') + '">' +
    '<div class="metier-carte-haut"><p class="metier-carte-nom">' + (o.etiquette ? '<span class="cml-pill" style="background:var(--accent);color:#fff;border-color:var(--accent)">' + o.etiquette + '</span> ' : '') + cmvE(nom) + '</p></div>' +
    '<div class="metier-carte-sous-titre"><p class="metier-carte-secteur">' + (fiche.secteur ? 'Secteur : ' + cmvE(fiche.secteur) : '') + '</p>' +
    '<a href="' + cmvLienFranceTravail(fiche) + '" target="_blank" rel="noopener" class="btn btn-sm btn-outline-secondary metier-carte-ft" title="Ouvre la fiche de ce métier sur le site de France Travail"><i class="bi bi-box-arrow-up-right" aria-hidden="true"></i> France Travail</a></div>' +
    (extraHTML || '') +
    '<div class="metier-carte-actions metier-carte-actions3">' +
    (fiche.rome ? '<button type="button" class="btn btn-outline-secondary" data-cml="fiche" data-nom="' + cmvE(nom) + '"><i class="bi bi-file-earmark-person" aria-hidden="true"></i> Fiche du métier</button>' : '') +
    ancre + (panier || '') + '</div>' + (o.retenir && typeof synBoutonRetenir === 'function' ? synBoutonRetenir(o.retenir, nom, fiche.rome) : '') + '</div>';
}
// Ouvre la fiche EN PAGE de l'application (route 'fiche-metier', js/app.js) : jamais « Choisir ce métier » ni « Candidater » ici ; « Retour » ramène à ce module, état intact.
var _cmvFicheContexte = null;   // { nom, depuisActions } : lu par la fiche pour ajouter « Pourquoi ce métier est proche de vos choix »
// La page du module d'où la personne est partie ouvrir une fiche : le voyage de fiche en fiche y ramène toujours (jamais une page périmée).
var _cmvVueOrigineFiche = null;
// « Revenir à Explorer les métiers » (standard de l'application, definirRetourModuleExterne) : rouvre la page du module d'où la personne est partie.
function cmvRevenirAVue(vue) { return function () { cmvEtat().vue = vue; if (typeof naviguerVers === 'function') { naviguerVers(CMV_ROUTE); } }; }
function cmvOuvrirFiche(nom, depuisActions) {
  if (typeof _ficheMetierNom === 'undefined') { return; }
  _cmvVueOrigineFiche = cmvEtat().vue;
  _ficheMetierNom = nom; _ficheMetierCandidater = false; _ficheMetierChoix = false; _ficheMetierRerender = null; _ficheMetierDepuisCandidater = false;
  _cmvFicheContexte = { nom: nom, depuisActions: !!depuisActions };
  if (typeof trackEvenement === 'function') { trackEvenement('metier_consulte', { metier: nom }); }
  naviguerVers('fiche-metier');
}
cmvEnregistrerAction('fiche', function (el, etat) {
  cmvOuvrirFiche(el.getAttribute('data-nom'), etat.vue === 'resultats2');
  return false;
});

function cmvEncart(icone, htmlTexte, avertissement) {
  return '<div class="cml-encart' + (avertissement ? ' warn' : '') + '"><i class="bi ' + icone + '" aria-hidden="true"></i><p>' + htmlTexte + '</p></div>';
}
// Bandeau d'une page ou d'une partie (maquette validée le 18/11/2026) : le numéro (ou, avec icone, une coche), le titre et un texte. petit = version compacte (titre seul).
function cmvBandeau(numero, titre, texte, options) {
  var o = options || {};
  return '<div class="cml-bandeau' + (o.petit ? ' petit' : '') + '"><span class="cml-num">' + (o.icone ? '<i class="bi ' + o.icone + '" aria-hidden="true"></i>' : numero) + '</span><div><h2>' + titre + '</h2>' + (texte ? '<p>' + texte + '</p>' : '') + '</div></div>';
}

// Conditions de travail « facile ou difficile » : UNE seule présentation pour « Par un métier » et « Par ce que vous aimez faire » (consigne 480, 19/11/2026).
// Une famille = icône, titre, nombre de choix, une phrase d'aide, puis une ligne par condition. Facile en vert, Difficile en ambre, l'état est aussi écrit (coche, aria-pressed) : jamais la couleur seule.
// attrFac / attrDif : les attributs de gestes propres à chaque chemin (data-cml... ou data-pm...), déjà échappés.
function cmvLigneFacDif(lib, fac, dif, attrFac, attrDif) {
  var l = cmvE(lib);
  return '<div class="cml-cond-ligne"><b>' + l + '</b><span class="cml-fd" role="group" aria-label="' + l + '">' +
    '<button type="button" class="fac' + (fac ? ' is-actif' : '') + '" ' + attrFac + ' aria-pressed="' + !!fac + '" aria-label="' + l + ' : facile pour moi"><i class="bi bi-check-lg" aria-hidden="true"></i>Facile</button>' +
    '<button type="button" class="dif' + (dif ? ' is-actif' : '') + '" ' + attrDif + ' aria-pressed="' + !!dif + '" aria-label="' + l + ' : difficile pour moi"><i class="bi bi-check-lg" aria-hidden="true"></i>Difficile</button></span></div>';
}
function cmvFamilleConditions(icone, titre, aide, nbChoisies, nbTotal, lignesHTML) {
  return '<div class="cml-famille"><div class="tete"><span class="ico"><i class="bi ' + icone + '" aria-hidden="true"></i></span><h3>' + titre + '</h3>' +
    '<span class="compte' + (nbChoisies ? ' a' : '') + '">' + nbChoisies + (nbChoisies > 1 ? ' choisies' : ' choisie') + ' sur ' + nbTotal + '</span></div><p class="cml-note expl">' + aide + '</p>' + lignesHTML + '</div>';
}

// Fil des parties (chemins 2 et 3, maquette validée le 18/11/2026, consigne 479) : quatre tuiles numérotées. courant = index de la partie en cours (0 à 3), -1 = toutes faites.
// cibles = vues où mène chaque tuile FAITE (chemin 2 : on peut revenir sur une page déjà faite) ; sans cibles, les tuiles ne sont pas cliquables (chemin 3 : questionnaire d'une traite).
// Le numéro et l'état (Fait, En cours, À venir) sont écrits : jamais la couleur seule. Tout est à l'accent choisi par la personne.
var CMV_FIL_C2 = ['Avec qui ou quoi', 'Ce que je fais', 'Où', 'Facile ou difficile'];
var CMV_FIL_C3 = ['Ce qui me plairait', 'Les domaines', 'Où j’en suis', 'Ma façon d’être'];
// passees = index des parties passées sans réponse (chemin 3, partie 4 : « Passée », tuile non colorée).
function cmvFilParties(noms, courant, cibles, passees) {
  return '<div class="cml-fil" role="group" aria-label="Les parties">' + noms.map(function (nom, i) {
    var passee = !!(passees && passees.indexOf(i) !== -1);
    var etat = passee ? 'avenir' : ((courant < 0 || i < courant) ? 'fait' : (i === courant ? 'encours' : 'avenir'));
    var clic = !!(cibles && cibles[i] && etat === 'fait');
    var libelle = passee ? 'Passée' : (etat === 'fait' ? 'Fait' : (etat === 'encours' ? 'En cours' : 'À venir'));
    return '<' + (clic ? 'button type="button" data-cml="aller" data-vue="' + cibles[i] + '"' : 'div') + ' class="cml-fil-t ' + etat + '"' + (etat === 'encours' ? ' aria-current="step"' : '') + '>' +
      '<span class="cml-num">' + (etat === 'fait' ? '<i class="bi bi-check-lg" aria-hidden="true"></i><span class="visually-hidden">' + (i + 1) + '</span>' : (i + 1)) + '</span>' +
      '<span>' + cmvE(nom) + '<small>' + libelle + '</small></span></' + (clic ? 'button' : 'div') + '>';
  }).join('') + '</div>';
}

// ---------------- Navigation ----------------
function pageComprendreLesMetiers() { if (!cmvOuvert()) { naviguerVers('cv'); return; } cmvRendre(); }

function cmvAller(vue) {
  cmvEtat().vue = vue;
  cmvRendre();
}

function cmvRetourBarre() {
  var etat = cmvEtat(), def = _cmvVues[etat.vue];
  var barre = def && typeof def.barre === 'function' ? def.barre(etat) : null;
  var retour = barre && barre.retour;
  if (typeof retour === 'function') { retour(etat); return; }
  if (typeof retour === 'string') { cmvAller(retour); return; }
  cmvRetourVersPresentation(false);
}
function cmvContinuerBarre() {
  var etat = cmvEtat(), def = _cmvVues[etat.vue];
  var barre = def && typeof def.barre === 'function' ? def.barre(etat) : null;
  if (barre && barre.suivant && !barre.suivant.desactive && typeof barre.suivant.action === 'function') { barre.suivant.action(etat); }
}
// « Retour » depuis l'accueil du module : la présentation. Avec detour = vrai : en consultation seulement (l'état du travail reste intact).
// chemin : la présentation du chemin où la personne se trouve ('metier' | 'actions' | 'q' | 'recrute') ; vide = la présentation générale.
function cmvRetourVersPresentation(detour, chemin) {
  _cmvDetourPresentation = !!detour;
  _cmvDetourChemin = chemin || '';
  if (typeof naviguerVers === 'function') { naviguerVers(_cmvDetourChemin ? CMV_ROUTES_CHEMINS[_cmvDetourChemin] : CMV_ROUTE_INTRO); }
}
// Le chemin auquel appartient chaque écran de travail (l'accueil du module, les ponts et « Pourquoi ils recrutent » relèvent de la présentation générale).
var CMV_CHEMIN_DE_VUE = { metier: 'metier', competence: 'metier', secteur: 'metier', actions1: 'actions', actions2: 'actions', actions3: 'actions', actions4: 'actions', resultats2: 'actions',
  'q-avant': 'q', 'q-ouverture': 'q', 'q-page': 'q', 'q-fin': 'q', resultat: 'q', recrute: 'recrute' };
function cmvCheminDeVue(vue) { return CMV_CHEMIN_DE_VUE[vue] || ''; }
// Entrée directe dans un chemin (sans page d'introduction) : l'écran où la personne commence, ou retrouve son travail.
function cmvEntrerDansChemin(chemin) {
  var etat = cmvEtat();
  if (chemin === 'metier') { etat.vue = 'metier'; }
  else if (chemin === 'actions') { etat.vue = (typeof _cmaNombreChoix === 'function' && _cmaNombreChoix(etat) > 0) ? 'resultats2' : 'actions1'; }
  else if (chemin === 'q') { if (etat.q && etat.q.resultat) { etat.vue = 'resultat'; } else if (typeof cmqvCommencer === 'function') { cmqvCommencer(etat); } }
  else if (chemin === 'recrute') { etat.vue = 'recrute'; }
}
function cmvRevenirDeLaPresentation() {
  _cmvDetourPresentation = false;
  _cmvDetourChemin = '';
  if (typeof naviguerVers === 'function') { naviguerVers(CMV_ROUTE); }
}

// Avertissement quand on quitte le questionnaire en cours (seule fenêtre du module) : appelé par naviguerVers() (js/app.js) avant tout changement de page.
function cmvQuestionnaireEnCours() {
  var etat = _cmvEtat;
  if (!etat || !/^(q-ouverture|q-page|q-fin)$/.test(etat.vue) || !etat.q.ordre) { return false; }
  return typeof cmqNombreReponses === 'function' && (etat.q.partie > 1 || CMQ_PARTIES.some(function (p) { return cmqNombreReponses(etat.q, p) > 0; }));
}
function cmvGardeSortie(route) {
  if (pageActuelle !== CMV_ROUTE || route === CMV_ROUTE || route === 'fiche-metier' || cmvEstRouteIntro(route)) { return false; }
  if (!cmvQuestionnaireEnCours()) { return false; }
  var quitter = function () {
    var etat = cmvEtat();
    etat.q = cmvEtatInitial().q; etat.vue = 'accueil';
    if (typeof naviguerVers === 'function') { naviguerVers(route); }
  };
  if (typeof confirmerAction === 'function') {
    confirmerAction('Quitter le questionnaire ?',
      'Si vous quittez maintenant, vos réponses ne seront pas gardées. Vous reprendrez au début.',
      'Quitter', 'btn-danger', quitter, 'Continuer le questionnaire');
  } else { quitter(); }
  return true;
}

// Flèche « Précédent » du navigateur (brique B.24) : chaque changement de vue est une entrée de l'historique ; le travail ne recule jamais.
function _cmvEstVueQuestionnaireEnCours(vue) { return vue === 'q-ouverture' || vue === 'q-page' || vue === 'q-fin'; }
function _cmvCleHistorique(etat) {
  var q = etat.q, v = etat.vue;
  var P = (typeof pmfEtat === 'function') ? pmfEtat() : null;
  // Chaque compétence et chaque secteur du voyage de fiche en fiche est une page à part : « Précédent » les retrouve une à une.
  var voyage = (v === 'competence' && P && P.comp) ? ':c' + P.comp.t + P.comp.i : ((v === 'secteur' && P) ? ':s' + P.sec : '');
  return _cmvSession + ':' + v + (_cmvEstVueQuestionnaireEnCours(v) ? ':' + q.partie + ':' + (q.page['p' + q.partie] || 0) : '') + (etat.secteur ? ':' + etat.secteur : '') + voyage;
}
// L'instantané d'une page du module pour l'historique du navigateur ; sur une page du voyage de fiche en fiche (compétence, secteur), il porte aussi le voyage.
function _cmvInstantane() {
  var q = _cmvEtat.q, v = _cmvEtat.vue, enVoyage = (v === 'competence' || v === 'secteur') && typeof pmfVoyageCopie === 'function', P = enVoyage ? pmfEtat() : null;
  return { cle: _cmvCleHistorique(_cmvEtat), vue: v, session: _cmvSession, secteur: _cmvEtat.secteur, partie: q.partie, page: q.page['p' + q.partie] || 0,
    voyage: enVoyage ? pmfVoyageCopie() : null, comp: P && P.comp ? { t: P.comp.t, i: P.comp.i } : null, sec: P ? P.sec : null };
}
function _cmvSynchroniserHistorique() {
  if (typeof historiqueInterneSynchroniser !== 'function' || !_cmvEtat) { return; }
  historiqueInterneSynchroniser(CMV_ROUTE, _cmvInstantane());
}
function _cmvRestaurerHistorique(instantane) {
  if (!_cmvEtat || instantane.session !== _cmvSession) { return 'sauter'; }
  if (!_cmvVues[instantane.vue]) { return 'sauter'; }
  // Les écrans du questionnaire en cours n'existent plus une fois le résultat calculé (les réponses sont effacées) : « Précédent » les dépasse.
  if (_cmvEstVueQuestionnaireEnCours(instantane.vue) && !_cmvEtat.q.ordre) { return 'sauter'; }
  if (instantane.vue === 'resultat' && !_cmvEtat.q.resultat) { return 'sauter'; }
  if (instantane.vue === 'pont' && !_cmvEtat.pont) { return 'sauter'; }
  if (typeof pmfRestaurerVoyage === 'function') { pmfRestaurerVoyage(instantane); }
  _cmvEtat.vue = instantane.vue;
  _cmvEtat.secteur = instantane.secteur || null;
  if (_cmvEstVueQuestionnaireEnCours(instantane.vue)) { _cmvEtat.q.partie = instantane.partie || 1; _cmvEtat.q.page['p' + _cmvEtat.q.partie] = instantane.page || 0; }
  _cmvDetourPresentation = false; _cmvDetourChemin = '';
}
function _cmvInscrireHistorique() {
  if (typeof historiqueInterneBrancher === 'function') { historiqueInterneBrancher(CMV_ROUTE, _cmvRestaurerHistorique); }
}

// ---------------- Dessin d'une vue ----------------
function cmvRendre() {
  _cmvInscrireHistorique();
  var etat = cmvEtat();
  if (!_cmvVues[etat.vue]) { etat.vue = 'accueil'; }
  var def = _cmvVues[etat.vue];
  var scrollPrecedent = window.scrollY || 0;
  var bouton = htmlBoutonRevoirModule('btnCmlRevoir', CMV_ICONE, 'Revoir la présentation', false);
  var barre = (typeof def.barre === 'function' ? def.barre(etat) : null) || {};
  var suivant = barre.suivant || null;
  var optionsBarre = { onclickPrecedent: 'cmvRetourBarre()' };
  if (suivant) {
    optionsBarre.onclickSuivant = 'cmvContinuerBarre()';
    if (suivant.desactive) { optionsBarre.suivantDesactive = true; optionsBarre.suivantDesactiveMessage = suivant.message || 'Complétez cette page pour continuer.'; }
    if (suivant.libelleExact) { optionsBarre.libelleExact = true; }
  }
  var titre = typeof def.titre === 'function' ? def.titre(etat) : (def.titre || '');
  app.innerHTML =
    '<div class="page-catalogue-contenu cml-page" id="cmlRacine">' +
    htmlBandeRepriseModule(bouton, '') +
    htmlTitreEtapeModule(CMV_ICONE, CMV_NOM, titre) +
    '<div id="cmlCorps">' + def.rendre(etat) + '</div>' +
    '</div>' +
    '<div class="barre-navigation-fixe">' +
    barreNavigation('cv', suivant ? 'cv' : null, suivant ? suivant.libelle : null, optionsBarre) +
    '</div>';
  _cmvSynchroniserHistorique();
  var arrivee = (typeof consommerArriveeDepuisPresentation === 'function') && consommerArriveeDepuisPresentation();
  var nouvelle = (etat.vue + ':' + (etat.secteur || '')) !== _cmvVueRendue;
  _cmvVueRendue = etat.vue + ':' + (etat.secteur || '');
  window.scrollTo(0, (arrivee || nouvelle) ? 0 : scrollPrecedent);
  var btnRevoir = document.getElementById('btnCmlRevoir');
  if (btnRevoir) { btnRevoir.addEventListener('click', function () { cmvRetourVersPresentation(true, cmvCheminDeVue(etat.vue)); }); }
  var racine = document.getElementById('cmlRacine');
  if (racine) { racine.addEventListener('click', _cmvClic); racine.addEventListener('input', _cmvSaisie); }
  if (typeof def.cabler === 'function') { def.cabler(etat); }
  if (typeof reperesBrancherBoutonAncre === 'function' && racine && racine.querySelector('[data-repere-trigger]')) { reperesBrancherBoutonAncre(); }
  if (typeof trackEvenement === 'function') { trackEvenement('comprendre_metiers_vue', { vue: etat.vue }); }
}

function _cmvClic(ev) {
  var el = ev.target.closest && ev.target.closest('[data-cml]');
  if (!el || el.disabled) { return; }
  var nom = el.getAttribute('data-cml'), fn = _cmvActions[nom];
  if (typeof fn !== 'function') { return; }
  if (fn(el, cmvEtat(), ev) !== false) { cmvRendre(); }
}
// Champs de saisie : les vues les branchent elles-mêmes (cabler) pour ne pas perdre le curseur en redessinant toute la page.
function _cmvSaisie() { /* réservé */ }

cmvEnregistrerAction('aller', function (el) { cmvAller(el.getAttribute('data-vue')); return false; });
cmvEnregistrerAction('entrer', function (el) { cmvEntrerDansChemin(el.getAttribute('data-chemin')); });
cmvEnregistrerAction('presenter', function (el) { cmvRetourVersPresentation(false, el.getAttribute('data-chemin')); return false; });
// « Voir les autres » (listes de métiers : résultat du questionnaire, métiers proposés par l'entrée 2) : tout s'affiche, le même geste pour les deux.
cmvEnregistrerAction('plusRes', function (el, etat) { etat.plusRes = true; });

// ---------------- Accueil du module : les trois entrées ----------------
cmvEnregistrerVue('accueil', {
  titre: 'Par où voulez-vous commencer ?',
  barre: function () { return { retour: function () { cmvRetourVersPresentation(false); } }; },
  rendre: function (etat) {
    // Deux boutons par carte : le premier entre directement dans le chemin, le second ouvre la présentation de ce chemin (avec sa vidéo).
    var carte = function (icone, titre, texte, chemin, libelle) {
      return '<div class="cml-entree"><i class="bi ' + icone + ' ico" aria-hidden="true"></i><h3>' + titre + '</h3><p>' + texte + '</p>' +
        '<button type="button" class="btn btn-primary" data-cml="entrer" data-chemin="' + chemin + '">' + libelle + '</button>' +
        '<button type="button" class="btn btn-outline-secondary" data-cml="presenter" data-chemin="' + chemin + '"><i class="bi bi-info-circle" aria-hidden="true"></i> Présentation de ce chemin</button></div>';
    };
    var avecResultat = etat.q && etat.q.resultat;
    var avecChoix = typeof _cmaNombreChoix === 'function' && _cmaNombreChoix(etat) > 0;
    return '<p class="text-center">Trois façons de découvrir des métiers à partir de vous, et un chemin qui part de la demande des employeurs. Vous pouvez en essayer un, puis un autre : rien n’est obligatoire.</p>' +
      '<div class="cml-grille3 cml-grille4">' +
      carte('bi-search', 'Par un métier', 'Vous avez déjà un métier en tête ? Cherchez-le par son nom, un autre nom, un sigle (AS, AMP, VRP…) ou son secteur, puis lisez sa fiche.', 'metier', 'Chercher un métier') +
      carte('bi-list-check', 'Par ce que vous aimez faire', 'Quatre pages : avec qui ou avec quoi, ce que vous aimeriez faire, où, et ce qui serait facile ou difficile pour vous. Des métiers vous sont proposés d’après vos goûts.', 'actions', (avecChoix ? 'Revoir mes choix' : 'Choisir mes envies')) +
      carte('bi-hexagon', 'Par un questionnaire de préférences', 'Un questionnaire de ' + cmvNombreQuestions() + ' questions en quatre parties, utilisé depuis une quarantaine d’années pour décrire les goûts professionnels. Il y en a beaucoup, pour que les métiers proposés vous correspondent mieux : prévoyez le temps qu’il faut.', 'q', avecResultat ? 'Revoir mon résultat' : 'Commencer le questionnaire') +
      carte('bi-briefcase', CMV_NOM_RECRUTE, 'Vous cherchez surtout un emploi ? Ici, aucune question, et ce ne sont pas vos envies qui guident : vous voyez les métiers que les employeurs de votre département disent vouloir pourvoir, les emplois saisonniers et les endroits où l’on recrute en continu.', 'recrute', 'Voir les emplois en demande') +
      '</div>' +
      (avecResultat ? '<p class="cml-note mt-2">Vous avez un résultat du questionnaire. Vous pouvez le revoir ou refaire le questionnaire depuis la page du résultat.</p>' : '') +
      (avecChoix ? '<p class="cml-note mt-2">Vos choix de « Par ce que vous aimez faire » sont conservés tant que vous restez dans l’application. Depuis les métiers proposés, vous pouvez les modifier.</p>' : '') +
      _cmvBlocSynthese(etat);
  }
});

// Bloc « Ma synthèse » de l'accueil (tâche A15) : seulement s'il y a au moins un résultat (fait ici ou revenu de la disquette).
function _cmvBlocSynthese(etat) {
  var n = typeof synNombreSources === 'function' ? synNombreSources(etat) : 0;
  if (n < 1) { return ''; }
  return '<div class="cml-bloc cml-bloc-synthese"><h2><i class="bi bi-clipboard-check" aria-hidden="true"></i> Ma synthèse</h2>' +
    '<p>Vous avez déjà ' + (n === 1 ? 'un résultat' : n + ' résultats') + ' : voyez-' + (n === 1 ? 'le' : 'les') + ' sur une seule page et demandez, si vous le souhaitez, une lecture d’ensemble.</p>' +
    '<div style="display:flex;gap:.6rem;flex-wrap:wrap"><button type="button" class="btn btn-primary" style="min-height:46px" data-cml="aller" data-vue="synthese"><i class="bi bi-clipboard-check" aria-hidden="true"></i> Voir ma synthèse</button>' +
    '<button type="button" class="btn btn-outline-secondary" style="min-height:46px" data-cml="refaireTout"><i class="bi bi-arrow-repeat" aria-hidden="true"></i> Refaire tout le chemin</button></div></div>';
}
// « Refaire tout le chemin » : efface tout le travail de cet écran (choix, questionnaire, métiers retenus), après confirmation. Ce qui est déjà dans la disquette enregistrée n'est pas touché.
cmvEnregistrerAction('refaireTout', function () {
  var recommencer = function () { cmvReinitialiser(); cmvEtat().vue = 'accueil'; cmvRendre(); };
  if (typeof confirmerAction === 'function') {
    confirmerAction('Refaire tout le chemin ?',
      'Vos choix, votre résultat du questionnaire, vos métiers retenus et votre parcours seront effacés de cet écran. Ce que vous avez déjà enregistré dans un fichier de session n’est pas touché. Si vous voulez le conserver, enregistrez votre session avant.',
      'Tout effacer', 'btn-danger', recommencer, 'Garder mon travail');
  } else { recommencer(); }
  return false;
});

// ---------------- Page de présentation générale (allégée puis enrichie le 18/11/2026 : les quatre chemins distingués, ce qui fait le module, comment les informations sont présentées, leurs sources ; le détail d'un chemin et le RIASEC vivent dans la présentation du chemin) ----------------
// Nombre de métiers du module, lu dans la base de l'application (jamais écrit en dur), arrondi à la centaine inférieure : « plus de 1 900 ».
function cmvPlusDeMetiers() {
  var n = (typeof baseMetiers !== 'undefined' && baseMetiers.length) ? baseMetiers.length : 0, c = Math.floor(n / 100) * 100;
  return c >= 100 ? 'plus de ' + String(c).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') : 'de nombreux';
}
function pageIntroComprendreLesMetiers() {
  if (!cmvOuvert()) { naviguerVers('cv'); return; }
  var bloc = function (icone, titre, fait, fort) {
    return '<div class="cml-bloc"><h3><i class="bi ' + icone + '" aria-hidden="true"></i> ' + titre + '</h3><p><b>Ce qu’il fait :</b> ' + fait + '</p><p class="mb-0"><b>Son point fort :</b> ' + fort + '</p></div>';
  };
  var config = {
    carteRetour: 'orientation',
    detour: _cmvDetourPresentation && !_cmvDetourChemin,
    detourLogo: CMV_ICONE,
    detourBoutonId: 'btnCmlRevenirModuleHaut',
    detourCtaId: 'btnCmlRevenirModuleBas',
    onRevenir: cmvRevenirDeLaPresentation,
    onRevenirExpr: 'cmvRevenirDeLaPresentation()',
    titre: '<i class="bi ' + CMV_ICONE + '"></i> ' + CMV_NOM,
    sousTitre: 'Pour découvrir des métiers, ou mieux comprendre ceux que vous connaissez mal. Il n’y a rien d’obligatoire et aucune réponse n’est mauvaise.',
    video: 'metiers',
    ctaId: 'btnCmlCommencer',
    ctaLabel: 'Commencer &#8594;',
    onCta: function () {
      var etat = cmvEtat();
      etat.vue = 'accueil';
      if (typeof naviguerVers === 'function') { naviguerVers(CMV_ROUTE); }
    },
    blocsHTML:
      _introBlocAccroche('<strong>Ce module ne choisit rien à votre place.</strong> Il vous donne des pistes à explorer, à votre rythme.') +
      _introBlocSection('&#129517; Quatre chemins',
        '<p>Trois chemins pour explorer et comprendre des métiers à partir de vous, un qui part de la demande des employeurs. Vous pouvez en essayer un, puis un autre.</p>' +
        bloc('bi-search', 'Par un métier',
          'vous cherchez un métier précis, par son nom, un autre nom, un sigle ou son secteur, ou vous partez de ce que vous savez faire. Vous lisez sa fiche.',
          'vous voyez ce que le métier demande vraiment, et vous pouvez de là découvrir des métiers proches.') +
        bloc('bi-list-check', 'Par ce que vous aimez faire',
          'vous choisissez ce qui vous plaît (avec qui ou avec quoi, quelles actions, quels lieux, ce qui serait facile ou difficile pour vous). Des métiers vous sont proposés.',
          'il part de vous, pas d’un métier. C’est le plus utile quand vous ne savez pas quel métier choisir.') +
        bloc('bi-hexagon', 'Par un questionnaire de préférences',
          'vous répondez à ' + cmvNombreQuestions() + ' questions en quatre parties. Votre résultat s’affiche à la fin, avec des métiers qui lui correspondent.',
          'c’est le plus complet. Il repose sur beaucoup de réponses, pour des pistes plus justes.') +
        (typeof CMV_NOM_RECRUTE === 'string' ? bloc('bi-briefcase', CMV_NOM_RECRUTE,
          'vous cherchez surtout un emploi. Aucune question, et ce ne sont pas vos envies qui guident : vous voyez les métiers que les employeurs de votre département disent vouloir pourvoir, les emplois saisonniers et les endroits où l’on recrute en continu, avec les fiches pour candidater.',
          'il va droit au concret. Pour l’instant, il ne couvre que la Dordogne et la Haute-Vienne.') : '') +
        '<p class="cml-note mb-0 mt-2">Chaque chemin a sa propre présentation, avec une vidéo. Vous la trouvez sur la carte du chemin.</p>') +
      _introBlocSection('&#128218; Ce que vous trouvez dans ce module',
        '<p>Des fiches pour ' + cmvPlusDeMetiers() + ' métiers. Une fiche dit ce que fait le métier, ce qu’il demande (savoir-faire, savoir-être, savoirs), le niveau pour y accéder, ses conditions de travail (horaires, effort, environnement, contact avec les autres) et des métiers proches.</p>' +
        '<p class="mb-0">À partir d’une fiche, vous pouvez la garder comme Repère, la comparer avec une autre piste, comprendre un mot dans le Lexique, ou préparer une candidature. Les mots techniques ont leur explication dans le Lexique de l’application.</p>') +
      _introBlocSection('&#129517; Ma synthèse',
        (typeof htmlVideoPresentation === 'function' ? htmlVideoPresentation('synthese') : '') +
        '<p>Quand vous avez fait un ou plusieurs passages, « Ma synthèse » les rassemble sur une seule page : le métier que vous avez retenu, vos envies, vos six lettres, ce qui revient d’un passage à l’autre. Vous pouvez y ajouter ce que les tests ne disent pas (votre niveau d’études, un accompagnement, vos mots) et « Mon parcours » : les métiers que vous avez déjà exercés, avec ce que vous y avez vraiment pratiqué. L’application en déduit ce qui vous servirait déjà pour une piste et ce qui resterait à construire.</p>' +
        '<p class="mb-0">Vous pouvez ensuite demander à l’assistant en ligne de lire l’ensemble : il propose des pistes de réflexion et des façons d’essayer un métier (rencontrer un professionnel, faire une immersion). Jamais une note, jamais un diagnostic. Vous relisez la demande avant qu’elle parte, et vous pouvez garder ou imprimer votre synthèse.</p>') +
      _introBlocSection('&#128209; Comment les informations sont présentées',
        '<ul class="mb-0">' +
        '<li>Un <b>pourcentage</b> dit combien de vos choix un métier retrouve. Il ne dit jamais si vous êtes fait pour ce métier.</li>' +
        '<li>Un choix de conditions de travail modifie le classement, mais n’écarte jamais un métier : vous voyez toujours la liste complète.</li>' +
        '<li>Le <b>niveau d’accès</b> est celui à partir duquel un métier s’ouvre. Beaucoup d’employeurs demandent plus, et l’expérience ou la motivation peuvent parfois compenser.</li>' +
        '<li>Les <b>nombres d’emplois</b> sont des minimums et des intentions d’employeurs, jamais des embauches garanties.</li>' +
        '</ul>') +
      _introBlocSection('&#128270; D’où viennent les informations',
        '<ul class="mb-0">' +
        '<li><b>Les fiches métiers, les compétences et les conditions de travail</b> viennent surtout du ROME, le répertoire officiel des métiers de France Travail. Les fiches de quelques métiers très courants ont été rédigées pour cette application.</li>' +
        '<li><b>Le questionnaire de préférences</b> repose sur un modèle connu, que France Travail utilise pour décrire les métiers.</li>' +
        '<li><b>Les nombres de projets de recrutement</b> viennent de l’enquête Besoins en main-d’œuvre de France Travail, par département.</li>' +
        '<li><b>Les employeurs et leurs adresses</b> viennent d’un repérage fait pour cette application. Il est encore en cours.</li>' +
        '</ul>') +
      _introBlocSection('&#128683; Ce que ce module ne fait pas',
        '<p class="mb-0">Il ne dit pas si vous êtes « fait pour » un métier, ne juge pas vos capacités et ne donne aucun verdict. Un conseiller peut compléter ce que vous découvrez ici.</p>') +
      _introBlocEncart('&#128190;', 'Rien n’est conservé sans votre accord. Pour garder votre résultat ou votre synthèse, utilisez la disquette de l’application. Vos réponses restent sur cet appareil : personne ne les reçoit.')
  };
  app.innerHTML = htmlPageIntroModuleParcours(config);
  brancherPageIntroModuleParcours(config);
  if (typeof trackEvenement === 'function') { trackEvenement('comprendre_metiers_intro_affichee'); }
}

// ---------------- Présentation d'un chemin (une vraie page de présentation, comme les parcours de « Créer mon CV ») ----------------
// Ouverte par le second bouton de la carte du chemin, ou par « Revoir la présentation » depuis l'intérieur du chemin (en détour : « Revenir au module » ramène exactement où la personne était).
// Le contenu de chaque chemin vit dans son fichier (cmvCorpsPresentationMetier / Actions / Questionnaire), jamais ici.
var CMV_PRESENTATIONS = {
  metier: { icone: 'bi-search', titre: 'Par un métier', video: 'chemin-metier', corps: 'cmvCorpsPresentationMetier',
    sousTitre: 'Vous avez un métier en tête, ou vous voulez comprendre un métier que vous connaissez mal.' },
  actions: { icone: 'bi-list-check', titre: 'Par ce que vous aimez faire', video: 'chemin-actions', corps: 'cmvCorpsPresentationActions',
    sousTitre: 'Vous ne savez pas encore quel métier choisir, mais vous savez ce qui vous plaît.' },
  q: { icone: 'bi-hexagon', titre: 'Par un questionnaire de préférences', video: 'chemin-questionnaire', corps: 'cmvCorpsPresentationQuestionnaire',
    sousTitre: 'Un questionnaire pour voir quels univers de métiers vous attirent.' },
  recrute: { icone: 'bi-briefcase', titre: 'Les emplois en demande', video: 'chemin-recrute', corps: 'cmvCorpsPresentationRecrute',
    sousTitre: 'Ici, ce sont les besoins des employeurs qui guident, pas vos envies : voici ce qui recrute près de chez vous.' }
};
function _cmvPageIntroChemin(chemin) {
  return function () {
    if (!cmvOuvert()) { naviguerVers('cv'); return; }
    var d = CMV_PRESENTATIONS[chemin], fabrique = (typeof window !== 'undefined') ? window[d.corps] : null;
    var config = {
      routeRetour: CMV_ROUTE,
      detour: _cmvDetourPresentation && _cmvDetourChemin === chemin,
      detourLogo: CMV_ICONE,
      detourBoutonId: 'btnCmlRevenirModuleHaut',
      detourCtaId: 'btnCmlRevenirModuleBas',
      onRevenir: cmvRevenirDeLaPresentation,
      onRevenirExpr: 'cmvRevenirDeLaPresentation()',
      titre: '<i class="bi ' + d.icone + '"></i> ' + d.titre,
      sousTitre: d.sousTitre,
      video: d.video,
      ctaId: 'btnCmlCommencerChemin',
      ctaLabel: 'Commencer &#8594;',
      onCta: function () { cmvEntrerDansChemin(chemin); if (typeof naviguerVers === 'function') { naviguerVers(CMV_ROUTE); } },
      blocsHTML: typeof fabrique === 'function' ? fabrique() : ''
    };
    app.innerHTML = htmlPageIntroModuleParcours(config);
    brancherPageIntroModuleParcours(config);
    if (typeof trackEvenement === 'function') { trackEvenement('comprendre_metiers_intro_chemin_affichee', { chemin: chemin }); }
  };
}
var pageIntroCmvMetier = _cmvPageIntroChemin('metier');
var pageIntroCmvActions = _cmvPageIntroChemin('actions');
var pageIntroCmvQuestionnaire = _cmvPageIntroChemin('q');
var pageIntroCmvRecrute = _cmvPageIntroChemin('recrute');

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CMV_NOMS_LETTRES: CMV_NOMS_LETTRES, CMV_OPPOSE: CMV_OPPOSE };
}
