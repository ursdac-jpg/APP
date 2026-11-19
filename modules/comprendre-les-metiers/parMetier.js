/* ============================================================
   Module « Explorer les métiers » : entrée 1, « Par un métier ».
   Charge après parActions.js.

   Règles tenues ici :
   - la recherche trouve un métier par son nom, par un autre nom (répertoire du ROME, chargé seulement quand on cherche), par un sigle
     (catalogue SIGLES_METIERS) ou par un mot ; un sigle de deux lettres (AS, ES, ME, AP, PE) n'est reconnu que s'il est tout ce qui est tapé ;
   - l'ÉCRAN de la page est dans parMetierEcran.js (barre unique, filtres, pourcentage) ; ici : le moteur de recherche des métiers (cmpRechercher), le catalogue des sigles,
     la page d'explication et les compléments de la fiche ;
   - aucune fiche n'est recopiée : « Voir la fiche » ouvre la fiche en page de l'application (cmvOuvrirFiche).
   ============================================================ */

var CMP_AFFICHAGE_PREMIERS = 12;   // lignes montrées avant « Voir les autres » (page « Pourquoi ils recrutent »)

function _cmpNorm(t) { return typeof normaliserTexte === 'function' ? normaliserTexte(String(t || '')).trim() : String(t || '').toLowerCase().trim(); }
// Les mots tapés doivent tous se retrouver dans le texte (forme féminine tapée essayée aussi au masculin, comme le reste de l'application).
function _cmpContientMots(texteNorm, variantes) {
  return variantes.some(function (v) {
    var mots = v.split(/\s+/).filter(Boolean);
    // Un mot de trois lettres ou moins ne compte qu'en début de mot (« as » ne doit pas trouver « ascensoriste » ni « chaudronnier »).
    var debuts = ' ' + texteNorm.replace(/[-'()]/g, ' ');
    return mots.length && mots.every(function (m) { return m.length <= 3 ? debuts.indexOf(' ' + m) !== -1 : texteNorm.indexOf(m) !== -1; });
  });
}
function _cmpVariantes(texte) {
  var q = _cmpNorm(texte);
  var v = (typeof variantesRechercheMetier === 'function') ? variantesRechercheMetier(texte) : [q];
  return (v && v.length) ? v : [q];
}

function _cmpFicheParNom(nom) { return (typeof metierParNom === 'function') ? metierParNom(nom) : null; }

// Sigles ÉCRITS dans les noms (« Assistant de vie aux familles (ADVF) », « Conseiller d'Insertion et de Probation (CIP) ») : relevés dans les noms des fiches
// et dans les 13 000 autres noms du ROME, sans rien recopier. Un même sigle peut désigner plusieurs métiers (CIP) : tous sont gardés, chacun avec sa signification.
var _cmpSiglesNoms = { etat: '', index: {} };
function _cmpIndexerSigles() {
  var etat = (typeof _repertoireRomeEtat !== 'undefined') ? _repertoireRomeEtat : '';
  if (_cmpSiglesNoms.etat === etat && _cmpSiglesNoms.index) { return _cmpSiglesNoms.index; }
  var index = {};
  function relever(nomBrut, fiche) {
    if (!fiche) { return; }
    var re = /[(\-\u2013]\s*([A-ZÉÈ]{2,8})\s*[)\-\u2013]/g, r;
    while ((r = re.exec(nomBrut))) {
      var cle = _cmpNorm(r[1]);
      var signification = nomBrut.replace(r[0], ' ').replace(/\s{2,}/g, ' ').replace(/\s+([,.;])/g, '$1').trim();
      var liste = index[cle] || (index[cle] = []);
      if (!liste.some(function (x) { return x.fiche.nom === fiche.nom && x.signification === signification; })) { liste.push({ fiche: fiche, signification: signification, sigle: r[1] }); }
    }
  }
  (typeof baseMetiers !== 'undefined' ? baseMetiers : []).forEach(function (m) { relever(m.nom, m); });
  if (etat === 'pret' && typeof _repertoireRomeIndex !== 'undefined' && _repertoireRomeIndex && typeof ficheParCodeRome === 'function') {
    _repertoireRomeIndex.forEach(function (a) { if (/[(\-\u2013]\s*[A-ZÉÈ]{2,8}\s*[)\-\u2013]/.test(a.nom)) { relever(a.nom, ficheParCodeRome(a.rome)); } });
  }
  _cmpSiglesNoms = { etat: etat, index: index };
  return index;
}

// Résultats de la recherche : [{ fiche, rang, raison }], une seule ligne par métier (la meilleure raison).
//   rang 0 sigle exact · 1 le nom commence par le texte · 2 le nom contient les mots · 3 un autre nom · 4 sigle commencé
function cmpRechercher(texte) {
  var q = _cmpNorm(texte);
  if (q.length < 2) { return []; }
  var variantes = _cmpVariantes(texte);
  var base = (typeof baseMetiers !== 'undefined') ? baseMetiers : [];
  var res = {}, ordre = [];
  function poser(fiche, rang, raison) {
    if (!fiche) { return; }
    // Une seule ligne par métier du ROME : la base contient parfois deux fiches pour le même code (« Accompagnant Educatif… » et « Accompagnant éducatif… »).
    var cle = fiche.rome || fiche.nom;
    if (!res[cle]) { res[cle] = { fiche: fiche, rang: rang, raison: raison }; ordre.push(cle); }
    else {
      if (rang < res[cle].rang) { res[cle].rang = rang; res[cle].raison = raison; }
      if (fiche.niveau !== 'rome' && res[cle].fiche.niveau === 'rome') { res[cle].fiche = fiche; }
    }
  }
  // 1. Sigles
  (typeof SIGLES_METIERS !== 'undefined' ? SIGLES_METIERS : []).forEach(function (s) {
    var sn = _cmpNorm(s.sigle);
    var exact = sn === q;
    var debut = !exact && q.length >= 3 && sn.indexOf(q) === 0;
    if (!exact && !debut) { return; }
    s.fiches.forEach(function (nomFiche) {
      poser(_cmpFicheParNom(nomFiche), exact ? 0 : 4, exact ? 'Sigle « ' + s.sigle + ' » : ' + s.signification : 'Sigle : ' + s.sigle);
    });
  });
  var depuisNoms = _cmpIndexerSigles()[q] || [];
  depuisNoms.forEach(function (x) { poser(x.fiche, 0.5, 'Sigle « ' + x.sigle + ' » : ' + x.signification); });
  // Un sigle tapé en entier (AS, ES, VRP…) ne montre que ses métiers : « as » ne doit pas noyer le résultat sous « assurance », « assistant »…
  var sigleExact = ordre.some(function (c) { return res[c].rang < 1; });
  if (sigleExact) { return ordre.map(function (c) { return res[c]; }).sort(function (a, b) { return a.rang - b.rang || a.fiche.nom.localeCompare(b.fiche.nom, 'fr'); }); }
  // 2. Nom du métier
  base.forEach(function (m) {
    var n = _cmpNorm(m.nom);
    if (q.length > 3 && variantes.some(function (v) { return n.indexOf(v) === 0; })) { poser(m, 1, 'Nom du métier'); }
    else if (_cmpContientMots(n, variantes)) { poser(m, 2, 'Nom du métier'); }
  });
  // 3. Autres noms (répertoire du ROME, déjà chargé quand la vue demande la recherche)
  if (typeof rechercherDansRepertoireElargi === 'function') {
    rechercherDansRepertoireElargi(texte, [], 80).forEach(function (a) {
      var f = (typeof ficheParCodeRome === 'function') ? ficheParCodeRome(a.rome) : null;
      if (!f) { return; }
      // Un texte de quatre lettres ou moins ne compte qu'en début de mot (« ash » ne doit pas trouver « flasheur »).
      if (q.length <= 4 && (' ' + _cmpNorm(a.nom).replace(/[-'()]/g, ' ')).indexOf(' ' + q) === -1) { return; }
      poser(f, 3, 'Autre nom : ' + a.nom);
    });
  }
  return ordre.map(function (c) { return res[c]; })
    .sort(function (a, b) { return a.rang - b.rang || a.fiche.nom.localeCompare(b.fiche.nom, 'fr'); });
}

// Une ligne de métier (nom, précision, secteur) avec « Voir la fiche » : page « Pourquoi ils recrutent ».
function _cmpLigneMetier(nom, sous, secteur) {
  return '<div class="cml-ligne"><div><b>' + cmvE(nom) + '</b>' +
    (sous || secteur ? '<div class="sub">' + (sous ? cmvE(sous) : '') + (sous && secteur ? ' · ' : '') + (secteur ? '<span class="cml-pill">' + cmvE(secteur) + '</span>' : '') + '</div>' : '') + '</div>' +
    '<button type="button" class="btn btn-outline-primary" data-cml="fiche" data-nom="' + cmvE(nom) + '"><i class="bi bi-file-earmark-person" aria-hidden="true"></i> Voir la fiche</button></div>';
}

// Catalogue des sigles courants, replié par défaut.
function _cmpHtmlSigles() {
  var liste = (typeof SIGLES_METIERS !== 'undefined') ? SIGLES_METIERS : [];
  var lignes = liste.map(function (s) {
    var fiche = _cmpFicheParNom(s.fiches[0]);
    if (!fiche) { return ''; }
    return '<div class="cml-ligne"><div><b>' + cmvE(s.sigle) + '</b> : ' + cmvE(s.signification) + '</div>' +
      '<button type="button" class="btn btn-outline-primary" data-cml="fiche" data-nom="' + cmvE(fiche.nom) + '">Voir la fiche</button></div>';
  }).join('');
  if (!lignes) { return ''; }
  return '<details class="cml-depli"><summary>Sigles et abréviations courants</summary><div class="corps">' +
    '<p class="cml-note">Beaucoup de métiers sont connus par leur sigle. Voici les plus courants.</p>' + lignes + '</div></details>';
}

// ---------------- Compléments de la fiche du métier (lus par ficheMetierCorpsHTML, js/app.js) ----------------
// « Pourquoi ce métier est proche de vos choix » : seulement quand la fiche s'ouvre depuis les métiers proposés par l'entrée 2.
// « Sigles » : les sigles du catalogue qui désignent cette fiche, ajoutés au bloc « Ce métier s'appelle aussi ».
function cmvFicheComplements(fiche) {
  var res = { pourquoi: '', sigles: '' };
  if (!fiche) { return res; }
  var sigles = (typeof SIGLES_METIERS !== 'undefined' ? SIGLES_METIERS : []).filter(function (s) { return s.fiches.indexOf(fiche.nom) !== -1; });
  if (sigles.length) {
    res.sigles = '<p class="fm-aide"><b>Sigles :</b> ' + sigles.map(function (s) { return cmvE(s.sigle) + ' (' + cmvE(s.signification) + ')'; }).join(' ; ') + '</p>';
  }
  var venueDesPropositions = _cmvFicheContexte && _cmvFicheContexte.depuisActions && _cmvFicheContexte.nom === fiche.nom &&
    typeof pileNavigation !== 'undefined' && pileNavigation[pileNavigation.length - 1] === 'comprendre-les-metiers';
  if (venueDesPropositions && typeof _cmaListeMetiers === 'function') {
    var etat = cmvEtat(), N = _cmaNombreChoix(etat);
    var m = _cmaListeMetiers(etat).filter(function (x) { return x.nom === fiche.nom; })[0];
    if (m && N) {
      var c = m.communes || {};
      var ligne = function (ic, titre, cle, ids) {
        return (ids && ids.length) ? '<p class="mb-1"><i class="bi ' + ic + ' cml-coche" aria-hidden="true"></i> <b>' + titre + ' :</b> ' + ids.map(function (id) { return '<span class="cml-pill">' + cmvE(_cmaLibelle(cle, id)) + '</span>'; }).join(' ') + '</p>' : '';
      };
      var nb = _cmaCommunes(m).length;
      res.pourquoi = nb
        ? '<p>Ce métier retrouve <b>' + nb + ' de vos ' + N + ' choix</b>.</p>' + ligne('bi-people', 'Avec qui ou quoi', 'activites', c.activites) + ligne('bi-hammer', 'Ce que vous aimeriez faire', 'actions', c.actions) + ligne('bi-geo-alt', 'Où', 'environnement', c.environnement)
        : '<p>Ce métier ne retrouve pas directement vos choix : il est proposé parce qu’il ressemble à d’autres métiers de la liste.</p>';
    }
  }
  return res;
}

// ---------------- Ponts depuis la liste « Métiers qui pourraient vous intéresser » (js/app.js, data-mc-act="module") ----------------
//  « Voir les métiers »          (type metiers)     : les métiers qui demandent la compétence touchée ;
//  « Comprendre ces métiers »    (type saisonniers) : les métiers saisonniers et alimentaires, avec une explication ;
//  « Comprendre pourquoi ils recrutent » (type bmo) : la page « Pourquoi ils recrutent » (vue bmo, plus bas), ouverte par CMV_PONT_CHIFFRES_OUVERT.
// « Retour » ramène à la page d'où la personne vient (retourPagePrecedente), jamais à l'accueil du module.
function cmvOuvrirPont(type, detail) {
  if (!cmvOuvert()) { return; }
  var base = (typeof baseMetiers !== 'undefined') ? baseMetiers : [];
  var fiches = [], titre = '', intro = '';
  if (type === 'metiers') {
    fiches = (typeof _cmMetiersAvecCompetence === 'function') ? _cmMetiersAvecCompetence(detail, '') : [];
    titre = 'Métiers qui demandent « ' + detail + ' »';
    intro = 'Cette compétence se retrouve dans ces métiers. Ouvrez une fiche pour lire ce que fait le métier et ce qu’il demande.';
  } else if (type === 'saisonniers') {
    var ids = (typeof METIERS_SAISONNIER_ALIMENTAIRE !== 'undefined') ? METIERS_SAISONNIER_ALIMENTAIRE : [];
    fiches = base.filter(function (m) { return ids.indexOf(m.id) !== -1; });
    titre = 'Métiers saisonniers et alimentaires';
    intro = 'Un métier saisonnier dépend d’une période de l’année : les récoltes, les vendanges, la saison touristique. Le contrat dure quelques semaines ou quelques mois, et le besoin revient chaque année. Un métier de l’alimentaire tourne autour de la nourriture : la cultiver, la transformer, la préparer, la vendre ou la servir.';
  } else if (type === 'bmo') {
    if (!CMV_PONT_CHIFFRES_OUVERT) { return; }
    if (typeof _comprendreLesChiffresChargerBmo === 'function') { _comprendreLesChiffresChargerBmo(); }
    cmvEtat().vue = 'bmo';
    naviguerVers(CMV_ROUTE);
    return;
  } else { return; }
  var noms = fiches.map(function (m) { return m.nom; }).filter(function (n, i, t) { return t.indexOf(n) === i; }).sort(function (a, b) { return a.localeCompare(b, 'fr'); });
  var etat = cmvEtat();
  etat.pont = { type: type, titre: titre, intro: intro, noms: noms };
  etat.plusPont = false;
  etat.vue = 'pont';
  naviguerVers(CMV_ROUTE);
}

cmvEnregistrerAction('plusPont', function (el, etat) { etat.plusPont = true; });
cmvEnregistrerVue('pont', {
  titre: function (etat) { return (etat.pont && etat.pont.titre) || 'Métiers'; },
  barre: function () { return { retour: function (etat) { etat.vue = 'accueil'; etat.pont = null; retourPagePrecedente(); } }; },
  rendre: function (etat) {
    var p = etat.pont;
    if (!p) { return '<p class="cml-note">Rien à afficher.</p>'; }
    var limite = etat.plusPont ? p.noms.length : CMP_AFFICHAGE_PREMIERS;
    var h = '<div class="cml-bloc"><p>' + cmvE(p.intro) + '</p><p class="cml-note mb-0" role="status">' + p.noms.length + ' métier' + (p.noms.length > 1 ? 's' : '') + '.</p></div>';
    h += p.noms.slice(0, limite).map(function (n) {
      var f = _cmpFicheParNom(n);
      return _cmpLigneMetier(n, '', f && f.secteur);
    }).join('');
    if (p.noms.length > limite) {
      h += '<div style="text-align:center;margin-top:.6rem"><button type="button" class="btn btn-outline-secondary" data-cml="plusPont"><i class="bi bi-chevron-down" aria-hidden="true"></i> Voir les ' + (p.noms.length - limite) + ' autres métiers</button></div>';
    }
    return h;
  }
});

// ---------------- « Pourquoi ils recrutent » (phase 5, consigne 427) ----------------
// Trois explications simples (tension, turnover, saisonnier), chacune reliée à sa fiche du Lexique, puis les deux départements côte à côte.
// Les chiffres sont LUS dans la source unique de « Comprendre les chiffres » (bmo-metiers.json, même chargeur, jamais recopiés) :
// si elle est absente ou trop ancienne (treize mois), la page le dit et n'affiche aucun chiffre.
var CMB_EXPLICATIONS = [
  { fiche: 'metier-en-tension', titre: 'Un métier en tension', texte: 'Les employeurs cherchent plus de personnes qu’il n’y en a de disponibles, ou ont du mal à trouver quelqu’un. Un poste reste alors ouvert longtemps. La tension se mesure par métier et par territoire : un même métier peut être en tension dans un département et pas dans un autre.' },
  { fiche: 'turnover', titre: 'Un poste qui revient souvent (turnover)', texte: 'Des salariés partent et sont remplacés : le même poste revient plusieurs fois, sans que l’activité grandisse. Un métier peut donc recruter souvent sans manquer de candidats. Cela vient souvent des contrats courts, des horaires ou d’un travail physique.' },
  { fiche: 'emploi-saisonnier', titre: 'Un emploi saisonnier', texte: 'Le besoin revient chaque année à la même période : vendanges, récoltes, saison touristique. Le métier est très demandé, mais pas toute l’année. Cela pèse beaucoup dans certains départements, et très peu dans d’autres.' }
];
var CMB_NB_PAR_DEPARTEMENT = 5;

function _cmbBoutonLexique(id) {
  return '<button type="button" class="btn btn-outline-secondary btn-sm" data-cml="lexique" data-fiche="' + cmvE(id) + '"><i class="bi bi-book" aria-hidden="true"></i> Lire la fiche du Lexique</button>';
}
function _cmbNombre(n) { return (typeof _comprendreLesChiffresFormatDecimal === 'function') ? _comprendreLesChiffresFormatDecimal(n, 0) : String(n); }
function _cmbLigneMetier(o) {
  var part = o.met > 0 ? Math.round(o.s / o.met * 100) : 0;
  return '<li><b>' + cmvE(o.nom.charAt(0).toUpperCase() + o.nom.slice(1)) + '</b><div class="cml-note mb-0">Au moins ' + _cmbNombre(o.met) + ' projets, dont au moins ' + _cmbNombre(o.s) + ' saisonniers (' + part + ' %).</div></li>';
}
function _cmbBlocDepartements() {
  var D = (typeof _comprendreLesChiffresBmoDonnees !== 'undefined') ? _comprendreLesChiffresBmoDonnees : null;
  var charge = (typeof _comprendreLesChiffresBmoChargement !== 'undefined') ? _comprendreLesChiffresBmoChargement : 'inactif';
  if (!D) {
    return charge === 'erreur'
      ? cmvEncart('bi-info-circle', 'Les chiffres n’ont pas pu être chargés pour le moment. Un conseiller peut vous dire quels métiers recrutent près de chez vous.', true)
      : '<p class="cml-note" role="status" id="cmlBmoAttente">Chargement des chiffres…</p>';
  }
  var etatD = (typeof _comprendreLesChiffresBmoEtat === 'function' && typeof _comprendreLesChiffresAujourdhuiIso === 'function') ? _comprendreLesChiffresBmoEtat(D, _comprendreLesChiffresAujourdhuiIso()) : { aJour: false };
  if (!etatD.aJour) {
    return cmvEncart('bi-info-circle', 'Les résultats de l’enquête ' + cmvE(D.annee) + ' datent de plus d’un an. La nouvelle enquête paraît chaque printemps. En attendant, un conseiller peut vous dire quels métiers recrutent près de chez vous.', true);
  }
  // Le département est le MÊME choix que dans « Comprendre les chiffres » (variable partagée) : une seule information, qui s'adapte.
  var dep = (typeof _comprendreLesChiffresBmoDep !== 'undefined' && _comprendreLesChiffresBmoDep) ||
    ((typeof _comprendreLesChiffresDepartementCourant === 'function' && _comprendreLesChiffresDepartementCourant() === '87') ? '87' : '24');
  if (!D.departements || !D.departements[dep]) { dep = '24'; }
  var d = D.departements[dep];
  var boutons = ['24', '87'].filter(function (c) { return D.departements && D.departements[c]; }).map(function (c) {
    return '<button type="button" class="btn ' + (c === dep ? 'btn-primary' : 'btn-outline-primary') + '" data-cml="bmoDep" data-dep="' + c + '" aria-pressed="' + (c === dep) + '">' + cmvE(D.departements[c].nom) + '</button>';
  }).join(' ');
  var h = '<p>Choisissez votre département. Voici les métiers les plus cités par les employeurs, d’après l’enquête ' + cmvE(D.annee) + ' de France Travail.</p>' +
    '<div role="group" aria-label="Département" style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.6rem">' + boutons + '</div>';
  if (d && d.metiers && d.metiers.length) {
    h += '<div class="cml-bloc"><h3 class="h6">' + cmvE(d.nom) + '</h3><ul class="mb-0">' + d.metiers.slice(0, CMB_NB_PAR_DEPARTEMENT).map(_cmbLigneMetier).join('') + '</ul></div>';
  }
  h += cmvEncart('bi-exclamation-triangle', 'Ce sont des <b>intentions d’employeurs</b>, pas des embauches garanties, et cela ne veut pas dire qu’un employeur précis recrute. Les nombres sont des <b>minimums</b> : France Travail masque les petits nombres.', true);
  return h;
}

cmvEnregistrerAction('lexique', function (el, etat) {
  if (typeof lexiqueOuvrirFiche === 'function') { lexiqueOuvrirFiche(el.getAttribute('data-fiche'), null, CMV_NOM, CMV_ROUTE, cmvRevenirAVue(etat.vue)); }
  return false;
});
cmvEnregistrerAction('bmoDep', function (el) {
  var c = el.getAttribute('data-dep');
  if ((c === '24' || c === '87') && typeof _comprendreLesChiffresBmoDep !== 'undefined') { _comprendreLesChiffresBmoDep = c; }
});
cmvEnregistrerAction('versChiffres', function (el, etat) {
  naviguerVers('comprendre-les-chiffres');
  if (typeof definirRetourModuleExterne === 'function') { definirRetourModuleExterne(CMV_NOM, cmvRevenirAVue(etat.vue), CMV_ROUTE, 'comprendre-les-chiffres'); }
  return false;
});

cmvEnregistrerVue('bmo', {
  titre: function () { return 'Pourquoi ils recrutent'; },
  barre: function () { return { retour: function (etat) { etat.vue = 'accueil'; retourPagePrecedente(); } }; },
  rendre: function () {
    var h = '<div class="cml-bloc"><p class="mb-0">Un métier peut apparaître souvent dans les offres pour trois raisons différentes. Elles ne veulent pas dire la même chose pour vous.</p></div>';
    h += CMB_EXPLICATIONS.map(function (e) {
      return '<div class="cml-bloc"><h3 class="h6">' + cmvE(e.titre) + '</h3><p>' + cmvE(e.texte) + '</p>' + _cmbBoutonLexique(e.fiche) + '</div>';
    }).join('');
    h += '<div id="cmlBmoZone">' + _cmbBlocDepartements() + '</div>';
    h += '<div style="text-align:center;margin-top:.6rem"><button type="button" class="btn btn-primary" data-cml="versChiffres"><i class="bi bi-graph-up" aria-hidden="true"></i> Voir tous les chiffres dans « Comprendre les chiffres »</button></div>';
    return h;
  },
  cabler: function () {
    // Les chiffres se chargent une fois ; la zone se remplit dès qu'ils sont là (une vingtaine d'essais, puis on s'arrête).
    var essais = 0;
    (function attendre() {
      var attente = document.getElementById('cmlBmoAttente'), zone = document.getElementById('cmlBmoZone');
      if (!attente || !zone) { return; }
      var etat = (typeof _comprendreLesChiffresBmoChargement !== 'undefined') ? _comprendreLesChiffresBmoChargement : 'erreur';
      if (etat === 'ok' || etat === 'erreur' || essais > 20) { zone.innerHTML = _cmbBlocDepartements(); return; }
      essais++;
      setTimeout(attendre, 250);
    })();
  }
});

// ---------------- Présentation du chemin « Par un métier » (19/11/2026) : le corps de la page de présentation (index.js, route comprendre-les-metiers-intro-metier) ----------------
function cmvCorpsPresentationMetier() {
  return _introBlocSection('&#127919; À quoi sert ce chemin',
      '<p class="mb-0">Vous avez un métier en tête, ou vous en avez entendu parler et voulez savoir de quoi il s’agit. Ce chemin vous mène à sa fiche, pour que vous lisiez ce que fait le métier avant de décider quoi que ce soit.</p>') +
    _introBlocSection('&#128269; Quatre façons de le trouver', '<ul class="mb-0">' +
      '<li><b>Par son nom</b> : « boulanger », « cariste ».</li>' +
      '<li><b>Par un autre nom</b> : « auxiliaire de vie » ou « aide à domicile » mènent au même métier.</li>' +
      '<li><b>Par un sigle</b> : AS, AMP, VRP… Un même sigle peut désigner deux métiers : la liste vous montre alors les deux, chacun avec son nom complet.</li>' +
      '<li><b>Par un secteur</b> : un clic sur un secteur affiche tous ses métiers.</li></ul>') +
    _introBlocSection('&#129513; Partir de ce que vous savez faire',
      '<p class="mb-0">Vous pouvez aussi choisir des compétences, un niveau d’études, un secteur ou des conditions de travail. La liste des métiers se classe alors avec un pourcentage, qui dit combien de vos choix chaque métier retrouve. Ce pourcentage n’est pas une note sur vous.</p>') +
    _introBlocSection('&#128196; Ce que vous trouvez sur la fiche d’un métier',
      '<p class="mb-0">Ce que fait le métier, ce qu’il demande, le niveau pour y accéder et ses conditions de travail (horaires, effort, environnement, contact avec les autres). Vous voyez aussi des métiers proches et des métiers du même secteur.</p>') +
    _introBlocSection('&#128506;&#65039; Voyager de métier en métier',
      '<p class="mb-0">Sur une fiche, cliquez sur une compétence ou un secteur pour voir d’autres métiers qui la demandent ou qui s’y trouvent. Un fil en haut de page garde votre parcours : vous pouvez revenir en arrière, ou à votre point de départ.</p>') +
    _introBlocSection('&#128188; Chercher des offres et candidater',
      '<p class="mb-0">Depuis la fiche, vous préparez une demande pour trouver les offres du moment près de chez vous, et vous la copiez dans l’assistant en ligne de votre choix. Ce qu’il répond reste chez lui : cette application ne reprend rien. Le bouton « Préparer ma candidature » vous mène ensuite au module Candidater.</p>') +
    _introBlocSection('&#9999;&#65039; Et ensuite',
      '<p class="mb-0">Garder la fiche comme Repère, la comparer avec une autre piste, l’ouvrir sur le site de France Travail, ou comprendre pourquoi certains métiers recrutent souvent dans votre département.</p>') +
    _introBlocEncart('&#8505;&#65039;', 'Un métier qui recrute beaucoup n’est pas forcément un métier fait pour vous. La fiche est là pour vous aider à y voir clair, sans rien décider à votre place.');
}
