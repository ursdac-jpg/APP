/* ============================================================
   Module « Explorer les métiers » : interface (pages routées), partie commune.
   Charge avant js/app.js (référencé dans l'objet `routes`) ; logique pure dans logique.js, textes dans data/comprendreMetiersTextes.js.
   Fichiers frères : parMetier.js (entrée 1), parActions.js (entrée 2), questionnaire.js (entrée 3). Chacun enregistre ses vues ici
   (cmvEnregistrerVue) et ses gestes (cmvEnregistrerAction) : ce fichier ne connaît que la présentation, l'accueil du module et les petits composants.

   Décisions de Denis (16 et 17/11/2026), à ne pas rouvrir :
   - le module vit dans la carte d'accueil « Vous hésitez encore ? », trois entrées : chercher un métier, partir de vos envies, répondre à un questionnaire ;
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
// Une présentation par chemin (décision de Denis, 18/11/2026) : metier = « Chercher un métier », actions = « Partir de vos envies », q = « Répondre à un questionnaire ».
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
    choix: { activites: [], actions: [], environnement: [], conditions: [], faciles: [], eviter: [] },
    masquerConditions: false, masquerEvites: false, grouper: false, plusRes: false, proches: {}, pont: null, plusPont: false, gardeChoix: null,
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
// Le bloc « Ce que vous y feriez » et « À savoir sur ce métier » (consigne 509, maquette validée le 21/11/2026) : UNE seule présentation pour les cartes des trois chemins
// (cmvCarteMetier ci-dessous pour les chemins 2 et 3, _pmCarte de parMetierEcran.js pour le chemin 1). La règle est dans logique.js (cmlResumeMetier).
var CMV_ICONES_CONDITIONS = { nuit: 'bi-moon', weekend: 'bi-calendar-week', horaires: 'bi-clock', saisonnier: 'bi-sun', deplacements: 'bi-geo-alt', charges: 'bi-box-seam', debout: 'bi-hourglass-split', assis: 'bi-hourglass-split',
  repetitif: 'bi-arrow-repeat', precision: 'bi-bullseye', tenue: 'bi-bag', securite: 'bi-shield-check', bruit: 'bi-volume-up', exterieur: 'bi-cloud-sun', public: 'bi-people', domicile: 'bi-house-door', isole: 'bi-dash-circle', teletravail: 'bi-laptop' };
// opts.sansCompetences : seulement les conditions (la carte montre déjà des repères du métier, par exemple le chemin 1 sans choix).
function cmvResume(code, opts) {
  if (!code || typeof cmlResumeMetier !== 'function' || typeof CONDITIONS_ROME === 'undefined') { return ''; }
  var o = opts || {}, r = cmlResumeMetier(code, CONDITIONS_ROME, typeof COMPETENCES_ROME !== 'undefined' ? COMPETENCES_ROME : null, o.sansCompetences ? 0 : undefined);
  var h = '';
  if (r.competences.length) {
    h += '<div class="res-bloc"><h5><i class="bi bi-hammer" aria-hidden="true"></i> Ce que vous y feriez</h5><ul>' + r.competences.map(function (x) { return '<li><i class="bi bi-check2" aria-hidden="true"></i><span>' + cmvE(x) + '</span></li>'; }).join('') + '</ul>' +
      (r.resteCompetences > 0 ? '<p class="res-suite">et d’autres dans la fiche du métier</p>' : '') + '</div>';
  }
  h += '<div class="res-bloc"><h5><i class="bi bi-info-circle" aria-hidden="true"></i> À savoir sur ce métier</h5>' + (r.conditions.length
    ? '<ul>' + r.conditions.map(function (x) { return '<li><i class="bi ' + (CMV_ICONES_CONDITIONS[x.id] || 'bi-info-circle') + '" aria-hidden="true"></i><span>' + cmvE(x.lib) + '</span></li>'; }).join('') + '</ul>' +
      (r.resteConditions > 0 ? '<p class="res-suite">et ' + r.resteConditions + ' autre' + (r.resteConditions > 1 ? 's' : '') + ' dans la fiche du métier</p>' : '')
    : '<p class="res-vide">Le ROME ne donne pas de condition particulière.</p>') + '</div>';
  return '<div class="cml-resume" data-cml-resume="1">' + h + '</div>';
}
// Les phrases des compétences (data/competencesRome.js, environ 250 Ko) se chargent à la demande : on les demande dès qu'une page du module s'affiche, bien avant les cartes.
// Si elles arrivent alors que des cartes sont déjà à l'écran, la page est redessinée une fois (position conservée) ; si le chargement échoue, les cartes gardent leurs conditions.
function cmvPrechargerCompetences() {
  if (typeof COMPETENCES_ROME !== 'undefined' || typeof _chargerScriptUneFois !== 'function') { return; }
  _chargerScriptUneFois('data/competencesRome.js', function (ok) {
    if (ok && typeof pageActuelle !== 'undefined' && pageActuelle === CMV_ROUTE && document.querySelector('#cmlRacine .metier-carte')) { cmvRendre(); }
  });
}
function cmvCarteMetier(fiche, extraHTML, opts) {
  var nom = fiche.nom, o = opts || {};
  var ancre = (typeof reperesBoutonAncre === 'function') ? reperesBoutonAncre({ libelle: 'Métier : ' + nom }) : '';
  var panier = (typeof comparerBoutonPanier === 'function') ? comparerBoutonPanier(nom) : '';
  return '<div class="metier-carte' + (o.premier ? ' metier-carte-large' : '') + (o.aEviter ? ' cml-carte-ev' : '') + '">' +
    '<div class="metier-carte-haut"><p class="metier-carte-nom">' + (o.etiquette ? '<span class="cml-pill" style="background:var(--accent);color:#fff;border-color:var(--accent)">' + o.etiquette + '</span> ' : '') + cmvE(nom) + '</p></div>' +
    '<div class="metier-carte-sous-titre"><p class="metier-carte-secteur">' + (fiche.secteur ? 'Secteur : ' + cmvE(fiche.secteur) : '') + '</p>' +
    '<a href="' + cmvLienFranceTravail(fiche) + '" target="_blank" rel="noopener" class="btn btn-sm btn-outline-secondary metier-carte-ft" title="Ouvre la fiche de ce métier sur le site de France Travail"><i class="bi bi-box-arrow-up-right" aria-hidden="true"></i> France Travail</a></div>' +
    (extraHTML || '') + (o.sansResume ? '' : cmvResume(fiche.rome)) +
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
// « Comment vos choix ont été lus » (consigne 499, maquette validée le 21/11/2026) : UNE seule présentation pour les trois chemins (BRIQUES_COMMUNES.md).
// Le calcul est ailleurs (logique.js, parMetierCalcul.js) ; ici, seulement le cadre. Une ligne = ce qui est lu (pastille ou lettre + sa famille) et ce que l'application en a fait.
function cmvNombre(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0'); }
function cmvPluriel(n, mot) { return cmvNombre(n) + ' ' + mot + (n > 1 ? 's' : ''); }
// Trois points pleins ou vides + le mot : jamais la seule forme (« un peu », « moyennement », « beaucoup »). 0 = rien à dire.
function cmvAide(n) {
  if (!n) { return ''; }
  return '<span class="cml-aide"><span class="pts" aria-hidden="true">' + [1, 2, 3].map(function (k) { return '<span class="pa' + (k <= n ? ' plein' : '') + '"></span>'; }).join('') + '</span>' + CML_MOTS_AIDE[n] + '</span>';
}
function cmvLigneLue(quiHTML, familleTexte, ditHTML) {
  return '<div class="cml-lu-ligne"><div class="qui">' + quiHTML + (familleTexte ? '<small>' + familleTexte + '</small>' : '') + '</div><div class="dit">' + ditHTML + '</div></div>';
}
function cmvBlocChoixLus(titre, intro, lignesHTML, aSavoirHTML) {
  return '<div class="cml-bloc cml-lu"><h3><i class="bi bi-list-check" aria-hidden="true"></i> ' + titre + '</h3><p class="cml-note intro">' + intro + ' Ce n’est pas une note sur vous.</p>' + lignesHTML +
    (aSavoirHTML ? '<div class="cml-lu-savoir"><i class="bi bi-lightbulb" aria-hidden="true"></i> <b>À savoir.</b> ' + aSavoirHTML + '</div>' : '') + '</div>';
}
// « Vos choix vont dans plusieurs directions » (consigne 501) : UN seul message pour les chemins 1 et 2 (BRIQUES_COMMUNES.md). res = résultat de cmlDirectionsChoix ; libelleRetirer = le choix à retirer, déjà écrit (ou '').
// Un constat sur la base de métiers, jamais sur la personne. Rien n'est dit quand res.declenche est faux.
function cmvMessageDirections(res, libelleRetirer) {
  if (!res || !res.declenche) { return ''; }
  var pct = Math.round(CML_PART_COUVERTURE * 100);
  var constat = res.nbCouverts === 0 ? 'Aucun métier de notre base ne retrouve ensemble la plupart de vos choix.'
    : (res.nbCouverts === 1 ? 'Un seul métier de notre base retrouve au moins ' + pct + ' % de vos choix.' : 'Seulement ' + res.nbCouverts + ' métiers de notre base retrouvent au moins ' + pct + ' % de vos choix.');
  var conseil = (res.retirer && libelleRetirer)
    ? 'Sans « ' + libelleRetirer + ' », ' + cmvPluriel(res.retirer.nb, 'métier') + ' retrouveraient la plupart de vos choix. Vous pouvez essayer de le retirer, la liste change aussitôt.'
    : 'Gardez ce qui compte le plus pour vous : la liste se précisera.';
  return cmvEncart('bi-signpost-split', '<b>Vos choix vont dans plusieurs directions.</b> ' + constat + ' Cela ne dit rien sur vous : chaque métier est décrit avec peu de choix à la fois. ' + conseil, true);
}
// Bandeau d'une page ou d'une partie (maquette validée le 18/11/2026) : le numéro (ou, avec icone, une coche), le titre et un texte. petit = version compacte (titre seul).
function cmvBandeau(numero, titre, texte, options) {
  var o = options || {};
  return '<div class="cml-bandeau' + (o.petit ? ' petit' : '') + '"><span class="cml-num">' + (o.icone ? '<i class="bi ' + o.icone + '" aria-hidden="true"></i>' : numero) + '</span><div><h2>' + titre + '</h2>' + (texte ? '<p>' + texte + '</p>' : '') + '</div></div>';
}

// Niveau d'une liste de pistes (consigne 505, maquette validée le 21/11/2026) : UNE seule présentation pour « Chercher un métier » et « Partir de vos envies » (BRIQUES_COMMUNES.md).
// Le calcul est dans logique.js (cmlInfoNiveauPistes, source unique des noms, des textes et des bornes). Ici, seulement le cadre.
// Jamais la couleur seule : le nom est écrit, les barres et la jauge se comptent, le niveau est dit en toutes lettres (« Niveau 2 sur 4 »).
function cmvChoix(n) { return cmvNombre(n) + ' choix'; }
function cmvBarresNiveau(n) {
  var h = '<span class="cml-barres" role="img" aria-label="Niveau ' + n + ' sur 4">';
  for (var k = 1; k <= 4; k++) { h += '<i class="' + (k <= n ? 'on' : '') + '"></i>'; }
  return h + '</span>';
}
function cmvJaugeNiveau(n) {
  var h = '<span class="cml-niv-jauge" aria-hidden="true">';
  for (var k = 1; k <= 4; k++) { h += '<span class="' + (k <= n ? 'on' : '') + '"></span>'; }
  return h + '</span>';
}
// Le bandeau en haut de la liste. Sous le minimum de choix : « Pas encore de pistes » (aucune liste n'est montrée, voir cmvPasDePistes).
function cmvBandeauNiveau(nbChoix) {
  var i = cmlInfoNiveauPistes(nbChoix);
  if (!i.niveau) {
    return '<div class="cml-niv cml-niv-0 cml-niv-bandeau" role="status"><div class="cml-niv-tete">' + cmvBarresNiveau(0) + '<h2 class="cml-niv-nom">' + i.nom + '</h2></div>' +
      '<p><b>Pourquoi ?</b> ' + (i.nbChoix ? 'Avec ' + cmvChoix(i.nbChoix) + ', des centaines' : 'Sans choix, des milliers') + ' de métiers restent possibles : les classer ne vous aiderait pas. Nous ne proposons des métiers qu’à partir de ' + cmvChoix(i.minimum) + '.</p>' +
      '<div class="cml-niv-suite">' + cmvJaugeNiveau(0) + '<span>Encore <b>' + cmvChoix(i.reste) + '</b> pour voir vos premières pistes.</span></div></div>';
  }
  return '<div class="cml-niv cml-niv-' + i.niveau + ' cml-niv-bandeau" role="status"><div class="cml-niv-tete">' + cmvBarresNiveau(i.niveau) + '<h2 class="cml-niv-nom">' + i.nom + '</h2><span class="cml-niv-num">Niveau ' + i.niveau + ' sur 4</span></div>' +
    '<p><b>Pourquoi ce nom ?</b> ' + cmvChoix(i.nbChoix) + ' : ' + i.texte + '</p>' +
    '<div class="cml-niv-suite">' + cmvJaugeNiveau(i.niveau) + (i.reste
      ? '<span>Encore <b>' + cmvChoix(i.reste) + '</b> pour passer à « ' + i.suivant + ' ».</span>'
      : '<span>C’est le niveau le plus précis. Vous pouvez remplacer un choix pour comparer.</span>') + '</div></div>';
}
// Les quatre niveaux, côte à côte, avec « Vous êtes ici » (la légende : ce que veut dire chaque nom et à partir de combien de choix).
function cmvLegendeNiveaux(nbChoix) {
  var n = cmlNiveauPistes(nbChoix), b = CML_BORNES_NIVEAUX;
  var plage = function (k) {
    if (k === b.length - 1) { return b[k] + ' choix et plus'; }
    var fin = b[k + 1] - 1;
    return fin <= b[k] ? b[k] + ' choix' : 'de ' + b[k] + ' à ' + fin + ' choix';
  };
  return '<div class="cml-bloc"><h3><i class="bi bi-signpost-split" aria-hidden="true"></i> Les quatre niveaux d’une liste</h3>' +
    '<p>Le niveau ne dit pas que vous vous trompez : il dit à quel point la liste est précise, selon le nombre de choix que vous avez faits. En dessous de ' + cmvChoix(b[0]) + ', nous ne proposons pas encore de métiers.</p>' +
    '<div class="cml-niv-liste">' + CML_NIVEAUX_PISTES.map(function (v, k) {
      return '<div class="cml-niv cml-niv-' + (k + 1) + ' cml-niv-ligne' + (n === k + 1 ? ' ici' : '') + '">' + cmvBarresNiveau(k + 1) +
        '<span><b>' + v.nom + '</b> <span class="cml-note">(' + plage(k) + ')</span>' + (n === k + 1 ? '<span class="cml-niv-ici">Vous êtes ici</span>' : '') + '</span><small>' + v.texte + '</small></div>';
    }).join('') + '</div></div>';
}
// Sous le minimum de choix : aucune liste. Le bandeau dit pourquoi et combien de choix il manque ; la légende montre où cela mène.
function cmvPasDePistes(nbChoix, boutonHTML) {
  return cmvBandeauNiveau(nbChoix) + (boutonHTML ? '<p class="mb-3">' + boutonHTML + '</p>' : '') + cmvLegendeNiveaux(nbChoix);
}
// Le niveau du questionnaire de préférences (chemin 3, consigne 508) : même cadre, mêmes noms, même couleur que pour les chemins 1 et 2 ; le niveau vient de la part des lignes répondues (cmlInfoNiveauQuestionnaire, logique.js).
// Les réponses sont effacées après le calcul : la personne ne peut pas « ajouter » des réponses, elle peut refaire le questionnaire (bouton data-cml="refaire-q").
function cmvLignesRepondues(i) { return 'Vous avez répondu à <b>' + cmvNombre(i.nbReponses) + ' lignes sur ' + cmvNombre(i.nbLignes) + '</b> (' + i.pct + ' %).'; }
function cmvBoutonRefaire() {
  return '<button type="button" class="btn btn-recommencer-module" style="min-height:46px" data-cml="refaire-q"><i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i> Refaire le questionnaire</button>';
}
function cmvBandeauQuestionnaire(i) {
  if (!i) { return ''; }
  if (!i.niveau) {
    return '<div class="cml-niv cml-niv-0 cml-niv-bandeau" role="status"><div class="cml-niv-tete">' + cmvBarresNiveau(0) + '<h2 class="cml-niv-nom">' + i.nom + '</h2></div>' +
      '<p>' + cmvLignesRepondues(i) + '</p>' +
      '<p><b>Pourquoi aucune lettre ?</b> Avec si peu de lignes répondues, vos lettres changeraient beaucoup d’un jour à l’autre : les montrer vous donnerait une fausse idée de ce qui vous attire. Les lignes laissées vides comptent pour zéro point, mais aucun point n’est retiré.</p>' +
      '<div class="cml-niv-suite">' + cmvJaugeNiveau(0) + '<span>Pour voir vos premières pistes, répondez à au moins <b>' + cmvNombre(i.minimum) + ' lignes sur ' + cmvNombre(i.nbLignes) + '</b> (40 %). Vous pouvez refaire le questionnaire : il n’y a ni bonne ni mauvaise réponse.</span></div>' +
      '<p class="mt-2 mb-0">' + cmvBoutonRefaire() + '</p></div>';
  }
  return '<div class="cml-niv cml-niv-' + i.niveau + ' cml-niv-bandeau" role="status"><div class="cml-niv-tete">' + cmvBarresNiveau(i.niveau) + '<h2 class="cml-niv-nom">' + i.nom + '</h2><span class="cml-niv-num">Niveau ' + i.niveau + ' sur 4</span></div>' +
    '<p>' + cmvLignesRepondues(i) + '</p>' +
    '<p><b>Pourquoi ce nom ?</b> ' + i.texte + '</p>' +
    '<div class="cml-niv-suite">' + cmvJaugeNiveau(i.niveau) + (i.aRepondre
      ? '<span>Pour passer à « ' + i.suivant + ' », il faudrait avoir répondu à <b>' + cmvNombre(i.aRepondre) + ' lignes sur ' + cmvNombre(i.nbLignes) + '</b>. Vous pouvez refaire le questionnaire pour cela.</span>'
      : '<span>C’est le niveau le plus précis : presque toutes les lignes ont une réponse.</span>') + '</div>' +
    (i.aRepondre ? '<p class="mt-2 mb-0">' + cmvBoutonRefaire() + '</p>' : '') + '</div>';
}
// Les quatre niveaux du questionnaire, avec « Vous êtes ici » (mêmes noms que pour les chemins 1 et 2 ; seuils en part de lignes répondues).
function cmvLegendeNiveauxQuestionnaire(i) {
  if (!i) { return ''; }
  var b = CML_BORNES_NIVEAUX_Q, N = i.nbLignes, ln = function (k) { return Math.ceil(b[k] * N - 1e-9); };
  var plage = function (k) {
    if (k === b.length - 1) { return ln(k) + ' lignes et plus'; }
    return 'de ' + ln(k) + ' à ' + (ln(k + 1) - 1) + ' lignes';
  };
  return '<div class="cml-bloc"><h3><i class="bi bi-signpost-split" aria-hidden="true"></i> Les quatre niveaux d’un résultat</h3>' +
    '<p>Le niveau ne juge pas vos réponses : il dit à quel point vos lettres sont stables, selon le nombre de lignes auxquelles vous avez répondu. Il y a ' + cmvNombre(N) + ' lignes en tout. En dessous de ' + ln(0) + ' lignes répondues, nous ne montrons pas de lettres.</p>' +
    '<div class="cml-niv-liste">' + CML_NIVEAUX_PISTES.map(function (v, k) {
      return '<div class="cml-niv cml-niv-' + (k + 1) + ' cml-niv-ligne' + (i.niveau === k + 1 ? ' ici' : '') + '">' + cmvBarresNiveau(k + 1) +
        '<span><b>' + v.nom + '</b> <span class="cml-note">(' + plage(k) + ')</span>' + (i.niveau === k + 1 ? '<span class="cml-niv-ici">Vous êtes ici</span>' : '') + '</span><small>' + v.texteQ + '</small></div>';
    }).join('') + '</div></div>';
}
// Le pont vers le chemin 3 : les pistes viennent seulement des choix faits ; le questionnaire (plus long) donne une lecture plus complète.
function cmvEncartQuestionnaire() {
  return '<div class="cml-encart"><i class="bi bi-hexagon" aria-hidden="true"></i><p><b>Pour confirmer ces pistes.</b> Elles viennent seulement de vos choix. Le questionnaire de préférences, plus long (' + cmvNombreQuestions() + ' questions), donne une lecture plus complète de ce qui vous attire : il peut les confirmer ou les nuancer. ' +
    '<button type="button" class="btn btn-outline-primary btn-sm" style="min-height:40px" data-cml="aller" data-vue="q-avant">Voir le questionnaire de préférences</button></p></div>';
}
// Raison pour laquelle aucune « Première proposition » n'est mise en avant (trop tôt, ou plusieurs métiers à égalité en tête).
function cmvEncartSansVedette(nbChoix, raison, nbEgalites) {
  return '<div class="cml-encart"><i class="bi bi-signpost-split" aria-hidden="true"></i><p><b>Aucun métier n’est mis en avant pour le moment.</b> ' +
    (raison === 'egalite' ? 'Plusieurs métiers se valent en tête (' + nbEgalites + ' à égalité) : en choisir un comme « première proposition » serait arbitraire.' : 'Avec ' + cmvChoix(nbChoix) + ', ce serait trop tôt pour désigner un métier. Voici des pistes, sans classement fiable entre elles.') + '</p></div>';
}

// Conditions de travail « facile ou difficile » : UNE seule présentation pour « Chercher un métier » et « Partir de vos envies » (consigne 480, 19/11/2026).
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
var CMV_FIL_C2 = ['Avec qui ou quoi', 'Ce que je fais', 'Où', 'Ce que j’évite', 'Facile ou difficile'];
var CMV_FIL_C3 = ['Ce qui me plairait', 'Les domaines', 'Où j’en suis', 'Ma façon d’être'];
// passees = index des parties passées sans réponse (chemin 3, partie 4 : « Passée », tuile non colorée).
function cmvFilParties(noms, courant, cibles, passees) {
  return '<div class="cml-fil' + (noms.length > 4 ? ' n5' : '') + '" role="group" aria-label="Les parties">' + noms.map(function (nom, i) {
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
var CMV_CHEMIN_DE_VUE = { metier: 'metier', competence: 'metier', secteur: 'metier', actions1: 'actions', actions2: 'actions', actions3: 'actions', actionsEviter: 'actions', actions4: 'actions', resultats2: 'actions',
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
  cmvPrechargerCompetences();
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
    // Lecture en petits passages (consigne 513, maquette validée le 21/11/2026) : une question qui dit à qui s'adresse le chemin, puis trois repères (ce que vous faites, ce que vous obtenez, à savoir).
    var repere = function (icone, titre, texte) { return '<li><i class="bi ' + icone + '" aria-hidden="true"></i><span><b>' + titre + '</b>' + texte + '</span></li>'; };
    var carte = function (icone, titre, pour, faites, obtenez, savoir, chemin, libelle) {
      return '<div class="cml-entree"><i class="bi ' + icone + ' ico" aria-hidden="true"></i>' + (typeof htmlRepereTempsChemin === 'function' ? htmlRepereTempsChemin('metiers', chemin) : '') + '<h3>' + titre + '</h3><p class="cml-pour">' + pour + '</p>' +
        (typeof htmlVideoPresentation === 'function' ? htmlVideoPresentation(CMV_PRESENTATIONS[chemin].video) : '') +
        '<ul class="cml-reperes">' + repere('bi-pencil', 'Ce que vous faites', faites) + repere('bi-card-list', 'Ce que vous obtenez', obtenez) + repere('bi-info-circle', 'À savoir', savoir) + '</ul>' +
        '<button type="button" class="btn btn-primary" data-cml="entrer" data-chemin="' + chemin + '">' + libelle + '</button>' +
        '<button type="button" class="btn btn-outline-secondary" data-cml="presenter" data-chemin="' + chemin + '"><i class="bi bi-info-circle" aria-hidden="true"></i> Présentation de ce chemin</button></div>';
    };
    var avecResultat = etat.q && etat.q.resultat;
    var avecChoix = typeof _cmaNombreChoix === 'function' && _cmaNombreChoix(etat) > 0;
    return '<p class="text-center">Trois façons de découvrir des métiers à partir de vous, et un chemin qui part de la demande des employeurs. Vous pouvez en essayer un, puis un autre : rien n’est obligatoire.</p>' +
      '<div class="cml-grille3 cml-grille4">' +
      carte('bi-search', 'Chercher un métier', 'Un métier vous intrigue, ou vous voulez vérifier ce qu’il demande vraiment ?', 'Vous le cherchez par son nom, un autre nom, un sigle (AS, AMP, VRP…) ou un secteur. Vous pouvez aussi partir de ce que vous savez faire.', 'Sa fiche : ce que fait la personne, le niveau pour y entrer, les conditions de travail et des métiers voisins.', 'Vous pouvez passer de fiche en fiche et garder celles qui vous intéressent.', 'metier', 'Chercher un métier') +
      carte('bi-list-check', 'Partir de vos envies', 'Vous ne savez pas encore quel métier viser, mais vous savez ce qui vous attire, et ce dont vous ne voulez pas ?', 'Cinq pages : avec qui ou avec quoi, quelles actions, quels lieux, ce que vous voulez éviter, ce qui serait facile ou difficile pour vous.', 'Des métiers proposés, avec ce que chacun retrouve de vos choix.', 'Plus vous choisissez, plus la liste se précise. Vous pouvez tout modifier ensuite.', 'actions', (avecChoix ? 'Revoir mes choix' : 'Choisir mes envies')) +
      carte('bi-hexagon', 'Répondre à un questionnaire', 'Vous préférez répondre à des questions plutôt que choisir vous-même ?', 'Quatre parties : des activités, des métiers, ce que vous savez faire, votre façon d’être. Il n’y a ni bonne ni mauvaise réponse.', 'Un résultat en lettres, d’après un modèle utilisé depuis une quarantaine d’années, et des métiers qui y correspondent.', cmvNombreQuestions() + ' questions : prévoyez le temps qu’il faut.', 'q', avecResultat ? 'Revoir mon résultat' : 'Commencer le questionnaire') +
      carte('bi-briefcase', CMV_NOM_RECRUTE, 'Vous cherchez surtout un emploi ?', 'Aucune question : vous regardez les métiers que les employeurs de votre département veulent pourvoir, les emplois saisonniers et les employeurs qui recrutent toute l’année.', 'Une demande d’offres prête à copier, et les fiches pour préparer votre candidature.', 'Pour l’instant : la Dordogne et la Haute-Vienne.', 'recrute', 'Voir les emplois en demande') +
      '</div>' +
      (avecResultat ? '<p class="cml-note mt-2">Vous avez un résultat du questionnaire. Vous pouvez le revoir ou refaire le questionnaire depuis la page du résultat.</p>' : '') +
      (avecChoix ? '<p class="cml-note mt-2">Vos choix de « Partir de vos envies » sont conservés tant que vous restez dans l’application. Depuis les métiers proposés, vous pouvez les modifier.</p>' : '') +
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
  var bloc = function (icone, titre, fait, fort, video) {
    return '<div class="cml-bloc"><h3><i class="bi ' + icone + '" aria-hidden="true"></i> ' + titre + '</h3><p><b>Ce qu’il fait :</b> ' + fait + '</p><p><b>Son point fort :</b> ' + fort + '</p>' +
      (video && typeof htmlVideoPresentation === 'function' ? htmlVideoPresentation(video) : '') + '</div>';
  };
  var config = {
    temps: 'metiers',   // repère de temps (data/tempsModules.js, consigne 606)
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
      _introBlocSection('&#127919; À quoi ça sert',
        '<p class="mb-0">Découvrir des métiers que vous ne connaissiez pas, ou comprendre ce que demande vraiment un métier que vous connaissez mal. Vous voyez des pistes : vous ne décidez rien ici.</p>') +
      _introBlocSection('&#128203; Ce qui va se passer',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Vous choisissez un chemin parmi quatre, et vous en essayez un autre si vous le voulez.</li>' +
        '<li>Vous obtenez des fiches de métiers : ce qu’ils demandent, leur niveau d’accès, leurs conditions de travail.</li>' +
        '<li>Si vous le souhaitez, « Ma synthèse » rassemble ce que vous avez fait sur une seule page.</li>' +
        '</ul>') +
      _introBlocSection('&#129517; Quatre chemins',
        '<p>Trois chemins pour explorer et comprendre des métiers à partir de vous, un qui part de la demande des employeurs. Vous pouvez en essayer un, puis un autre.</p>' +
        bloc('bi-search', 'Chercher un métier',
          'vous cherchez un métier précis, par son nom, un autre nom, un sigle ou son secteur, ou vous partez de ce que vous savez faire. Vous lisez sa fiche.',
          'vous voyez ce que le métier demande vraiment, et vous pouvez de là découvrir des métiers proches.', 'chemin-metier') +
        bloc('bi-list-check', 'Partir de vos envies',
          'vous choisissez ce qui vous plaît (avec qui ou avec quoi, quelles actions, quels lieux, ce qui serait facile ou difficile pour vous). Des métiers vous sont proposés.',
          'il part de vous, pas d’un métier. C’est le plus utile quand vous ne savez pas quel métier choisir.', 'chemin-actions') +
        bloc('bi-hexagon', 'Répondre à un questionnaire',
          'vous répondez à ' + cmvNombreQuestions() + ' questions en quatre parties. Votre résultat s’affiche à la fin, avec des métiers qui lui correspondent.',
          'c’est le plus complet. Il repose sur beaucoup de réponses, pour des pistes plus justes.', 'chemin-questionnaire') +
        (typeof CMV_NOM_RECRUTE === 'string' ? bloc('bi-briefcase', CMV_NOM_RECRUTE,
          'vous cherchez surtout un emploi. Aucune question, et ce ne sont pas vos envies qui guident : vous voyez les métiers que les employeurs de votre département disent vouloir pourvoir, les emplois saisonniers et les endroits où l’on recrute en continu, avec les fiches pour candidater.',
          'il va droit au concret. Pour l’instant, il ne couvre que la Dordogne et la Haute-Vienne.', 'chemin-recrute') : '') +
        '<p class="cml-note mb-0 mt-2">Chaque chemin a aussi sa propre page de présentation : vous la trouvez sur la carte du chemin.</p>') +
      _introBlocSection('&#128218; Ce que vous trouvez dans ce module',
        '<p>Des fiches pour ' + cmvPlusDeMetiers() + ' métiers. Une fiche dit ce que fait le métier, ce qu’il demande (savoir-faire, savoir-être, savoirs), le niveau pour y accéder, ses conditions de travail (horaires, effort, environnement, contact avec les autres) et des métiers proches.</p>' +
        '<p class="mb-0">Les mots techniques ont leur explication dans le Lexique de l’application.</p>') +
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
      _introBlocSection('&#9999;&#65039; Ce que vous pourrez faire ensuite',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Garder une fiche comme Repère.</li>' +
        '<li>La comparer avec une autre piste.</li>' +
        '<li>Comprendre un mot dans le Lexique.</li>' +
        '<li>Préparer une candidature.</li>' +
        '</ul>') +
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
  metier: { icone: 'bi-search', titre: 'Chercher un métier', video: 'chemin-metier', corps: 'cmvCorpsPresentationMetier',
    sousTitre: 'Vous avez un métier en tête, ou vous voulez comprendre un métier que vous connaissez mal.' },
  actions: { icone: 'bi-list-check', titre: 'Partir de vos envies', video: 'chemin-actions', corps: 'cmvCorpsPresentationActions',
    sousTitre: 'Vous ne savez pas encore quel métier choisir, mais vous savez ce qui vous plaît.' },
  q: { icone: 'bi-hexagon', titre: 'Répondre à un questionnaire', video: 'chemin-questionnaire', corps: 'cmvCorpsPresentationQuestionnaire',
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
