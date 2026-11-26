/* ============================================================
   Module « Explorer les métiers » : entrée 1, « Chercher un métier » : L'ÉCRAN (barre unique, quatre boutons de filtre, métiers classés avec leur pourcentage).
   Charge après parMetier.js (recherche par nom, autre nom et sigle) et parMetierCalcul.js. Reprend la maquette validée par Denis le 17/11/2026
   (docs/MAQUETTE_PAR_UN_METIER_ENRICHI_EXPLORER_LES_METIERS_2026-11-17.html), consignes 448 à 454.

   Règles tenues ici :
   - UNE seule barre : elle cherche dans les métiers (par nom, autre nom ou sigle : même moteur que l'ancienne page, cmpRechercher), les compétences, les secteurs,
     les niveaux d'études et les conditions de travail. Un métier choisi ouvre sa fiche ; tout le reste s'ajoute aux choix et classe les métiers ;
   - aucune limite de choix ; « Tout décocher » en tête de la zone des choix ; jamais de pourcentage pour un métier tapé directement ;
   - le pourcentage est écrit DANS la barre ; au survol (ou à l'appui), seulement ce qui l'explique : jamais ce qui manque (consignes 448 et 451) ;
   - les compétences viennent de l'index complet du ROME (data/rome/indexCompetences.js, chargé à la demande) ;
   - aucune fiche n'est recopiée : « Voir la fiche » ouvre la fiche en page de l'application (cmvOuvrirFiche).
   Tout est dessiné dans #pmRacine (style limité à ce bloc, css/style.css) ; les gestes passent par data-pm, sans toucher au reste du module.
   ============================================================ */

var PM_NB_PREMIERS = 12;
var PM_ONGLETS_NOMS = { se: 'Savoir-être', sf: 'Savoir-faire', sv: 'Savoirs' };
var PM_AIDES = {
  se: 'La manière d’être au travail : avec les autres, face à l’effort, dans sa façon de s’organiser.',
  sf: 'Ce que vous savez faire : les gestes, les tâches, les techniques.',
  sv: 'Ce qu’il faut connaître : une règle, une technique, un domaine. Tapez un mot pour trouver les autres.'
};
var PM_NOTE_NIVEAU = 'Le niveau indiqué est celui à partir duquel un métier s’ouvre. Beaucoup d’employeurs demandent plus. Un stage, de l’expérience ou une vraie motivation peuvent parfois compenser : cela dépend de chaque recruteur.';

var _pmD = null;                // données construites (parMetierDonnees.js), une fois l'index chargé
var _pmChargement = '';         // '', 'en cours', 'pret', 'echec'
function pmEtat() {
  var e = cmvEtat();
  if (!e.pm) { e.pm = pmcEtatInitial(); e.pm.onglet = 'se'; e.pm.ouverte = {}; e.pm.ecran = 'choix'; e.pm.sugM = false; e.pm.sugC = false; }
  return e.pm;
}
function _pmEstTel() { return (window.innerWidth || 1024) <= 700; }

// Chargement à la demande : l'index complet (≈ 1 Mo) puis les données construites à partir de lui.
var _pmAttente = [];
function pmCharger(rappel) {
  if (_pmD) { rappel(true); return; }
  _pmAttente.push(rappel);
  if (_pmChargement === 'en cours') { return; }
  _pmChargement = 'en cours';
  var fin = function (ok) {
    if (ok && typeof INDEX_COMPETENCES !== 'undefined') { _pmD = pmdConstruire(pmdSources()); _pmChargement = 'pret'; } else { _pmChargement = 'echec'; }
    _pmAttente.splice(0).forEach(function (r) { r(!!_pmD); });
  };
  // Les noms d'emploi (data/rome/nomsEmploi.js, environ 180 Ko, consigne 498) sont facultatifs : s'ils manquent, les cartes n'ont pas la ligne « Aussi appelé », rien d'autre ne change.
  var go = function () {
    if (typeof _chargerScriptUneFois !== 'function') { fin(false); return; }
    _chargerScriptUneFois('data/rome/indexCompetences.js', function (ok) {
      if (!ok) { fin(false); return; }
      _chargerScriptUneFois('data/rome/nomsEmploi.js', function () { fin(true); });
    });
  };
  // Les noms des compétences (data/competencesRome.js) sont chargés par la fiche ; on les demande ici aussi.
  if (typeof COMPETENCES_ROME === 'undefined' && typeof _chargerScriptUneFois === 'function') { _chargerScriptUneFois('data/competencesRome.js', function (ok) { if (ok) { go(); } else { fin(false); } }); } else { go(); }
}

function _pmLib(D, t, i) { return D[t][i].lib; }
function _pmLibC(D, c) { return _pmLib(D, c.t, c.i); }
function _pmSecteurPill(D, r) { return '<button type="button" class="pill-btn" data-pmf="sectres" data-v="' + r[1] + '" title="Voir tous les métiers de ce secteur"><i class="bi bi-grid" aria-hidden="true"></i> ' + cmvE(D.secteurs[r[1]]) + '</button>'; }
function _pmLigneAcces(r) { return '<div class="acces"><i class="bi bi-mortarboard" aria-hidden="true"></i> ' + (r[2] ? 'Accès : ' + PMC_LIB_NIVEAU[r[2]] : PMC_LIB_NIVEAU[0]) + '</div>'; }

/* ---------------- Cartes de métiers ---------------- */
// Titre de la barre de pourcentage (décision Denis 18/11/2026) : il COMPLÈTE la carte au lieu de la répéter. La carte dit lesquelles de vos compétences le métier retrouve ;
// la barre dit combien de compétences le métier en demande au total, et combien de vos choix s'y trouvent. Jamais lesquelles.
var PM_NOMS_TYPES_TITRE = { se: ['savoir-être', 'savoir-être'], sf: ['savoir-faire', 'savoir-faire'], sv: ['savoir', 'savoirs'] };
function _pmTitreJauge(S, r, sc) {
  var p = [];
  PMC_TYPES.forEach(function (t) {
    var choisies = S.comp.filter(function (c) { return c.t === t; });
    if (!choisies.length) { return; }
    var fiche = r[PMC_RANG[t]], n = choisies.filter(function (c) { return fiche.indexOf(c.i) !== -1; }).length, tot = fiche.length;
    p.push((n === 0 ? 'aucun' : n) + ' des ' + tot + ' ' + PM_NOMS_TYPES_TITRE[t][tot > 1 ? 1 : 0] + ' de ce métier');
  });
  if (p.length) { return 'Vous avez choisi : ' + p.join(', ') + '.'; }
  var q = [];
  if (S.niveau && r[2] !== 0 && r[2] <= S.niveau) { q.push('le niveau choisi suffit'); }
  if (S.secteurs.length && S.secteurs.indexOf(r[1]) !== -1) { q.push('un secteur choisi'); }
  if (sc.cf.length) { q.push(sc.cf.length > 1 ? sc.cf.length + ' conditions faciles pour vous' : 'une condition facile pour vous'); }
  return q.length ? 'Ce métier retrouve : ' + q.join(', ') + '.' : 'Peu de vos choix se retrouvent dans ce métier.';
}
function _pmJauge(D, S, idx, sc, r) {
  var p = sc.pct, titre = cmvE(_pmTitreJauge(S, r, sc));
  return '<div class="jauge-zone"><div class="jauge" role="img" title="' + titre + '" aria-label="Ressemblance avec vos choix : ' + p + ' pour cent. ' + titre + '">' +
    '<span class="j-plein' + (p >= 100 ? ' tout' : '') + '" style="width:' + p + '%"></span>' +
    '<span class="j-vide' + (p <= 0 ? ' rien' : '') + '" style="width:' + (100 - p) + '%"></span>' +
    '<span class="j-pct ' + (p >= 18 ? 'dedans' : 'dehors') + '" style="' + (p >= 18 ? 'left:.7rem' : 'left:calc(' + p + '% + .6rem)') + '">' + p + ' %</span></div></div>' +
    '<p class="j-titre">' + titre + '</p>';
}
// Deux repères de chaque type pour une carte sans choix : d'abord ceux qui sont « cœur de métier » dans le ROME.
function _pmApercu(D, r, t) {
  var ids = r[PMC_RANG[t]].slice(), cle = t === 'se' ? null : t;
  if (cle) { ids.sort(function (a, b) { return ((r.coeur[cle] && r.coeur[cle][b]) ? 1 : 0) - ((r.coeur[cle] && r.coeur[cle][a]) ? 1 : 0); }); }
  return ids.slice(0, 2);
}
function _pmCarte(D, S, o, vedette) {
  var idx = o.i, r = D.m[idx], sc = o.sc, avec = pmcNbChoix(S) > 0;
  var h = '<div class="carte-m' + (vedette ? ' cml-vedette-c1' : '') + '">' + (vedette ? '<span class="cml-pill" style="background:var(--accent);color:#fff;border-color:var(--accent);align-self:flex-start">Première proposition</span>' : '') + '<h4>' + cmvE(r[0]) + '</h4>' + _pmSecteurPill(D, r) + _pmLigneAcces(r);
  if (avec) {
    h += _pmJauge(D, S, idx, sc, r);
    if (S.comp.length) {
      var ret = S.comp.filter(function (c) { return r[PMC_RANG[c.t]].indexOf(c.i) !== -1; });
      h += '<div class="retrouve">Retrouve ' + ret.length + ' de vos ' + S.comp.length + ' compétences' + (ret.length ? ' : ' + ret.slice(0, 4).map(function (c) { return '<span>' + cmvE(_pmLibC(D, c)) + '</span>'; }).join('') + (ret.length > 4 ? ' <span>+' + (ret.length - 4) + '</span>' : '') : '') + '</div>';
    }
  } else {
    h += '<div class="retrouve">' + PMC_TYPES.map(function (t) { return _pmApercu(D, r, t).map(function (c) { return '<span>' + cmvE(_pmLib(D, t, c)) + '</span>'; }).join(''); }).join('') + '</div>';
  }
  // Bloc commun des cartes (cmvResume, index.js) : sans choix, la carte montre déjà des repères du métier ci-dessus, donc seulement les conditions.
  h += cmvResume(r.code, { sansCompetences: !avec });
  return h + '<div class="rang-boutons"><button type="button" class="btn btn-outline-primary b-fiche" data-pm="fiche" data-v="' + idx + '"><i class="bi bi-file-earmark-person" aria-hidden="true"></i> Voir la fiche</button></div>' +
    (typeof synBoutonRetenir === 'function' ? synBoutonRetenir(1, r[0], r.code, 'data-pm="retenir" data-v="' + idx + '"') : '') + '</div>';
}

/* ---------------- La barre de recherche unique ---------------- */
function _pmSuggestions(D, S) {
  var res = pmcSuggestions(D, S, S.q, { plusMetiers: S.sugM, plusCompetences: S.sugC });
  if (!res) { return ''; }
  var h = '';
  // Métiers : le moteur de l'ancienne page (nom, autre nom du ROME, sigle) dès deux lettres ; avant, le début du nom.
  var metiers = res.metiers, raisons = {};
  if (_cmpNorm(S.q).length >= 2 && typeof cmpRechercher === 'function') {
    var liste = [], qn = _cmpNorm(S.q), tri = {};
    cmpRechercher(S.q).forEach(function (x) {
      var i = D.idxCode[x.fiche.rome];
      if (i === undefined || liste.indexOf(i) !== -1) { return; }
      liste.push(i);
      if (x.rang < 1) { tri[i] = -1; } else { var n = D.m[i].n; tri[i] = n.indexOf(qn) === 0 ? 0 : ((' ' + n).indexOf(' ' + qn) !== -1 ? 1 : 2); }
      if (x.rang >= 3 || x.rang === 0 || x.rang === 0.5) { raisons[i] = x.raison; }
    });
    // Un sigle exact d'abord, puis les noms qui commencent par ce qui est tapé, puis ceux qui le contiennent (ordre alphabétique conservé dans chaque groupe).
    liste = liste.map(function (i, k) { return { i: i, k: k }; }).sort(function (a, b) { return tri[a.i] - tri[b.i] || a.k - b.k; }).map(function (o) { return o.i; });
    var lim = S.sugM ? 60 : 8;
    metiers = { total: liste.length, items: liste.slice(0, lim), limite: lim };
  }
  if (metiers.total) {
    h += '<div class="sg-groupe"><div class="sg-titre"><i class="bi bi-briefcase" aria-hidden="true"></i> Métiers <small>' + pmcPluriel(metiers.total, 'métier') + '</small></div>' +
      metiers.items.map(function (i) { return '<button type="button" class="sg" data-pm="sgm" data-v="' + i + '"><span><b>' + cmvE(D.m[i][0]) + '</b> <small>' + cmvE(raisons[i] || D.secteurs[D.m[i][1]]) + '</small></span><span class="note">Ouvrir la fiche</span></button>'; }).join('') +
      (metiers.total > metiers.limite ? '<button type="button" class="sg plus" data-pm="sugplus" data-v="m">' + (metiers.total <= 60 ? 'Voir les ' + metiers.total + ' métiers' : 'Voir les 60 premiers métiers parmi les ' + metiers.total) + '</button>' : '') +
      (S.sugM && metiers.total > 60 ? '<div class="note" style="padding:.4rem .8rem">Ajoutez une lettre pour réduire la liste.</div>' : '') + '</div>';
  }
  if (res.competences.total) {
    h += '<div class="sg-groupe"><div class="sg-titre"><i class="bi bi-puzzle" aria-hidden="true"></i> Compétences <small>' + pmcPluriel(res.competences.total, 'compétence') + '</small></div>' +
      res.competences.items.map(function (s) { return '<button type="button" class="sg" data-pm="add" data-v="' + s.t + ':' + s.i + '"><span>' + cmvE(_pmLib(D, s.t, s.i)) + ' <small>' + PMC_NOMS_TYPES[s.t] + '</small></span><span class="note">Ajouter à mes choix</span></button>'; }).join('') +
      (res.competences.total > res.competences.limite ? '<button type="button" class="sg plus" data-pm="sugplus" data-v="c">' + (res.competences.total <= 40 ? 'Voir les ' + res.competences.total + ' compétences' : 'Voir les 40 premières compétences parmi les ' + res.competences.total) + '</button>' : '') + '</div>';
  }
  if (res.secteurs.items.length) {
    h += '<div class="sg-groupe"><div class="sg-titre"><i class="bi bi-diagram-3" aria-hidden="true"></i> Secteurs</div>' +
      res.secteurs.items.map(function (i) { return '<button type="button" class="sg" data-pm="sgs" data-v="' + i + '"><span>' + cmvE(D.secteurs[i]) + ' <small>' + pmcPluriel(D.nbParSecteur[i], 'métier') + '</small></span><span class="note">Ajouter à mes choix</span></button>'; }).join('') + '</div>';
  }
  if (res.niveaux.items.length) {
    h += '<div class="sg-groupe"><div class="sg-titre"><i class="bi bi-mortarboard" aria-hidden="true"></i> Niveaux d’études</div>' +
      res.niveaux.items.map(function (n) { return '<button type="button" class="sg" data-pm="sgn" data-v="' + n[0] + '"><span>' + n[1] + '</span><span class="note">' + (S.niveau === n[0] ? 'Déjà choisi' : 'Choisir ce niveau') + '</span></button>'; }).join('') + '</div>';
  }
  if (res.conditions.items.length) {
    h += '<div class="sg-groupe"><div class="sg-titre"><i class="bi bi-sliders2" aria-hidden="true"></i> Conditions de travail</div>' +
      res.conditions.items.map(function (k) { return '<div class="sg sg-cond"><span>' + cmvE(D.cond[k]) + '</span><span class="duo"><button type="button" class="fac" data-pm="sgf" data-v="' + k + '" aria-pressed="' + (S.fac.indexOf(k) !== -1) + '">Facile pour moi</button><button type="button" class="dif" data-pm="sgd" data-v="' + k + '" aria-pressed="' + (S.dif.indexOf(k) !== -1) + '">Difficile pour moi</button></span></div>'; }).join('') + '</div>';
  }
  if (!h) { h = '<div class="sg-vide note">Rien ne correspond à « ' + cmvE(S.q) + ' ». Essayez un autre mot, ou utilisez les quatre boutons ci-dessous.</div>'; }
  return '<div class="suggestions" role="region" aria-label="Suggestions">' + h + '</div>';
}

/* ---------------- Les quatre boutons de filtre ---------------- */
// Bouton « Fermer » en haut à droite de chaque panneau de filtres (Compétences, Niveau, Secteur, Conditions) : plus besoin de redeviner qu'il faut cliquer sur le bouton d'ouverture.
function _pmFermer(pan) { return '<button type="button" class="btn btn-outline-secondary btn-sm pm-fermer" data-pm="fermer" data-v="' + pan + '"><i class="bi bi-x-lg" aria-hidden="true"></i> Fermer</button>'; }
function _pmBlocCompetences(D, S) {
  var t = S.onglet;
  var h = '<div class="bloc"><h3><i class="bi bi-puzzle"></i> Choisir des compétences' + _pmFermer('comp') + '</h3>' +
    '<p class="legende">Cochez ce que vous savez déjà faire aujourd’hui. Il n’y a aucune limite : plus vous faites de choix, plus les pourcentages des métiers deviennent justes. Chaque compétence pèse un petit peu.</p>' +
    '<div class="onglets" role="tablist">' + PMC_TYPES.map(function (x) { var n = S.comp.filter(function (c) { return c.t === x; }).length; return '<button type="button" role="tab" data-pm="onglet" data-v="' + x + '" class="' + (x === t ? 'actif' : '') + '" aria-selected="' + (x === t) + '">' + PM_ONGLETS_NOMS[x] + (n ? ' (' + n + ')' : '') + '</button>'; }).join('') + '</div>' +
    '<p class="legende">' + PM_AIDES[t] + '</p>';
  var groupes = [];
  if (t === 'sv') {
    D.svNums.forEach(function (n) { groupes.push({ nom: D.svCats[n], items: D.sv.map(function (x, i) { return { x: x, i: i }; }).filter(function (o) { return o.x.cat === n; }) }); });
  } else {
    (t === 'sf' ? D.sfFam : D.seFam).forEach(function (nom, f) { groupes.push({ nom: nom, items: D[t].map(function (x, i) { return { x: x, i: i }; }).filter(function (o) { return o.x.fam === f; }) }); });
  }
  h += groupes.map(function (g, gi) {
    var items = g.items.map(function (o) { return { x: o.x, i: o.i, n: (D.inv[t][o.i] || []).length }; }).sort(function (a, b) { return b.n - a.n || a.x.lib.localeCompare(b.x.lib, 'fr'); });
    var vus = t === 'sv' ? items.filter(function (o, k) { return k < 10 || pmcEstChoisie(S, 'sv', o.i); }) : items;
    var nch = items.filter(function (o) { return pmcEstChoisie(S, t, o.i); }).length, cle = t + ':' + gi, ouvert = S.ouverte[cle] || nch > 0;
    return '<details class="fam" data-cle="' + cle + '"' + (ouvert ? ' open' : '') + '><summary>' + cmvE(g.nom) + '<span class="pm-nb">' + (nch ? nch + ' choisie' + (nch > 1 ? 's' : '') + ' sur ' : '') + items.length + ' compétence' + (items.length > 1 ? 's' : '') + '</span></summary><div class="pm-corps">' +
      vus.map(function (o) { var ch = pmcEstChoisie(S, t, o.i); return '<button type="button" class="cp" data-pm="tog" data-v="' + t + ':' + o.i + '" aria-pressed="' + ch + '">' + cmvE(o.x.lib) + ' <small>' + o.n + '</small></button>'; }).join('') + '</div></details>';
  }).join('');
  h += '<p class="note mt-2 mb-0">Le petit nombre à côté d’une compétence dit dans combien de métiers elle apparaît.' + (t === 'sv' ? ' Les savoirs sont très précis : seuls les plus répandus sont listés ici. Tapez un mot dans la barre de recherche pour trouver les autres.' : '') + '</p>';
  return h + '</div>';
}
function _pmBlocNiveau(D, S, nbSansNiveau) {
  return '<div class="bloc"><h3><i class="bi bi-mortarboard"></i> Niveau d’études' + _pmFermer('niv') + '</h3><p class="legende">Quel est votre niveau ? Les métiers qui demandent plus de diplôme descendent dans la liste, ils ne disparaissent pas.</p>' +
    '<div class="niveaux" role="group" aria-label="Niveau d’études">' + PMC_NIVEAUX.map(function (n) { return '<button type="button" data-pm="niv" data-v="' + n[0] + '" aria-pressed="' + (S.niveau === n[0]) + '">' + n[1] + '</button>'; }).join('') + '</div>' +
    '<p class="note mt-2 mb-1">' + PM_NOTE_NIVEAU + '</p>' +
    '<p class="note mb-0">Pour ' + nbSansNiveau + ' métiers sur ' + D.m.length + ', la fiche officielle ne donne pas de diplôme (elle cite par exemple un permis, un certificat ou de l’expérience) : leur niveau est dit « non précisé ».</p></div>';
}
function _pmBlocSecteur(D, S) {
  return '<div class="bloc"><h3><i class="bi bi-diagram-3"></i> Secteur' + _pmFermer('sec') + '</h3><p class="legende">Choisissez un ou plusieurs secteurs. Le secteur choisi passe en priorité : les métiers des autres secteurs descendent nettement dans la liste et n’apparaissent que s’ils retrouvent presque tout le reste de vos choix.</p><div class="secteurs" role="group" aria-label="Secteurs">' +
    D.secteurs.map(function (s, i) { return '<button type="button" data-pm="sec" data-v="' + i + '" aria-pressed="' + (S.secteurs.indexOf(i) !== -1) + '">' + cmvE(s) + '<small>' + D.nbParSecteur[i] + '</small></button>'; }).join('') + '</div></div>';
}
function _pmBlocConditions(D, S) {
  return '<div class="bloc"><h3><i class="bi bi-sliders2"></i> Conditions de travail' + _pmFermer('cond') + '</h3>' +
    '<p class="legende">Pour chaque condition de travail, dites si elle serait facile ou difficile pour vous. Cela pèse peu dans le pourcentage : c’est une nuance, jamais un barrage.</p>' +
    // Mêmes familles, mêmes lignes et mêmes couleurs que la page « Facile ou difficile » de « Partir de vos envies » (consigne 480) : briques cmvFamilleConditions et cmvLigneFacDif.
    _pmFamillesConditions(D).map(function (g) {
      var ks = g.ids.map(function (id) { return D.condCles.indexOf(id); }).filter(function (k) { return k >= 0; });
      var nbg = ks.filter(function (k) { return S.fac.indexOf(k) !== -1 || S.dif.indexOf(k) !== -1; }).length;
      return cmvFamilleConditions(g.icone, g.titre, g.aide, nbg, ks.length, ks.map(function (k) {
        return cmvLigneFacDif(D.cond[k], S.fac.indexOf(k) !== -1, S.dif.indexOf(k) !== -1, 'data-pm="fac" data-v="' + k + '"', 'data-pm="dif" data-v="' + k + '"');
      }).join(''));
    }).join('') + '</div>';
}
// Les familles de conditions de « Partir de vos envies » plus la famille des lieux ; toute condition connue qui n'est dans aucune famille est rangée dans une dernière famille, pour qu'aucune ne disparaisse.
function _pmFamillesConditions(D) {
  var icones = (typeof CMA_ICONES_CONDITIONS !== 'undefined') ? CMA_ICONES_CONDITIONS : [];
  var familles = CMA_CONDITIONS_GROUPES.map(function (g, i) { return { titre: g.titre, aide: g.aide, ids: g.ids, icone: icones[i] || 'bi-sliders2' }; });
  familles.push(CMA_CONDITIONS_LIEUX);
  var rangees = {};
  familles.forEach(function (g) { g.ids.forEach(function (id) { rangees[id] = true; }); });
  var autres = D.condCles.filter(function (id) { return !rangees[id]; });
  if (autres.length) { familles.push({ titre: 'Autres conditions', aide: 'Ce que le travail peut aussi demander.', ids: autres, icone: 'bi-sliders2' }); }
  return familles;
}

// Le niveau de la liste et le plafond du pourcentage comptent les secteurs pour UN seul choix et les conditions de travail pour UN seul choix (pmcNbChoixPourPlafond) : quand cela change le total, l'écran le dit.
function _pmNoteChoixComptes(S, nb) {
  var nbP = pmcNbChoixPourPlafond(S);
  if (nbP === nb) { return ''; }
  var nbC = S.dif.length + S.fac.length, qui = [];
  if (S.secteurs.length > 1) { qui.push('vos ' + S.secteurs.length + ' secteurs comptent pour un seul choix'); }
  if (nbC > 1) { qui.push('vos ' + nbC + ' conditions de travail comptent pour un seul choix'); }
  return '<p class="note mt-2 mb-0">Pour le niveau de la liste et le pourcentage maximal, ' + qui.join(' et ') + ' : cela fait ' + nbP + ' choix comptés sur ' + nb + '.</p>';
}

/* ---------------- Zone 1 : Vos choix ---------------- */
function _pmZoneChoix(D, S, nbRes) {
  var nb = pmcNbChoix(S), nbN = S.niveau ? 1 : 0, nbS = S.secteurs.length, nbC = S.dif.length + S.fac.length;
  var nbSansNiveau = D.m.filter(function (r) { return r[2] === 0; }).length;
  var h = '<section class="zone zone-choix" aria-labelledby="zChoix"><h2 id="zChoix" class="zone-titre"><span class="num">1</span> Vos choix <span class="zone-sous">Plus vous faites de choix, plus la liste se précise.</span>' +
    (nb ? '<button type="button" class="btn btn-outline-secondary tout-decocher" data-pm="tout"><i class="bi bi-x-circle" aria-hidden="true"></i> Tout décocher (' + nb + ')</button>' : '') + '</h2>';
  h += '<div class="recherche"><label for="pmQ"><i class="bi bi-search" aria-hidden="true"></i> Un métier, une compétence, un secteur…</label><input id="pmQ" type="search" autocomplete="off" value="' + cmvE(S.q) + '" placeholder="Tapez une lettre, un mot ou un sigle : cariste, écoute, bâtiment, travail de nuit">' +
    '<p class="note mt-1 mb-0">Les suggestions apparaissent dès la première lettre. Un métier choisi ouvre sa fiche. Tout le reste s’ajoute à vos choix.</p></div><div id="pmSuggestions">' + _pmSuggestions(D, S) + '</div>';
  function fb(pan, icone, titre, sous, n) { return '<button type="button" class="fb ' + (S.panneau === pan ? 'actif' : '') + '" data-pm="pan" data-v="' + pan + '" aria-expanded="' + (S.panneau === pan) + '"><i class="bi ' + icone + '" aria-hidden="true"></i><span><b>' + titre + '</b><small>' + sous + '</small></span>' + (n ? '<span class="pm-pastille">' + n + '</span>' : '') + '</button>'; }
  h += '<p class="note mt-3 mb-1">Vous ne savez pas quoi taper ? Parcourez les choix :</p><div class="filtres-boutons">' + fb('comp', 'bi-puzzle', 'Compétences', 'Ce que je sais faire', S.comp.length) + fb('niv', 'bi-mortarboard', 'Niveau d’études', 'Mon diplôme', nbN) + fb('sec', 'bi-diagram-3', 'Secteur', 'Où je veux travailler', nbS) + fb('cond', 'bi-sliders2', 'Conditions de travail', 'Facile ou difficile pour moi', nbC) + '</div>';
  if (S.panneau === 'comp') { h += _pmBlocCompetences(D, S); }
  if (S.panneau === 'niv') { h += _pmBlocNiveau(D, S, nbSansNiveau); }
  if (S.panneau === 'sec') { h += _pmBlocSecteur(D, S); }
  if (S.panneau === 'cond') { h += _pmBlocConditions(D, S); }
  if (nb) {
    var chips = S.comp.map(function (c, k) { return '<span class="chip"><span class="t">' + ({ se: 'être', sf: 'faire', sv: 'savoir' })[c.t] + '</span> ' + cmvE(_pmLibC(D, c)) + '<button type="button" data-pm="ret" data-v="' + k + '" aria-label="Retirer ' + cmvE(_pmLibC(D, c)) + '">&times;</button></span>'; }).join('') +
      (S.niveau ? '<span class="chip"><span class="t">niveau</span> ' + PMC_LIB_NIVEAU[S.niveau] + '<button type="button" data-pm="retniv" data-v="1" aria-label="Retirer le niveau">&times;</button></span>' : '') +
      S.secteurs.map(function (s) { return '<span class="chip"><span class="t">secteur</span> ' + cmvE(D.secteurs[s]) + '<button type="button" data-pm="retsec" data-v="' + s + '" aria-label="Retirer ' + cmvE(D.secteurs[s]) + '">&times;</button></span>'; }).join('') +
      S.dif.map(function (k) { return '<span class="chip"><span class="t">difficile</span> ' + cmvE(D.cond[k]) + '<button type="button" data-pm="retdif" data-v="' + k + '" aria-label="Retirer">&times;</button></span>'; }).join('') +
      S.fac.map(function (k) { return '<span class="chip"><span class="t">facile</span> ' + cmvE(D.cond[k]) + '<button type="button" data-pm="retfac" data-v="' + k + '" aria-label="Retirer">&times;</button></span>'; }).join('');
    h += '<details class="mes-choix" ' + (nb <= 12 ? 'open' : '') + '><summary><b>Mes choix (' + nb + ')</b></summary><div class="mes-filtres">' + chips + '</div>' + _pmNoteChoixComptes(S, nb) + '</details>';
  }
  if (!_pmEstTel() && nb) {
    // Sans aucun choix, ce bouton n'a pas de sens : c'est « Parcourir tous les métiers » (zone 2, en bleu) qui montre la liste. Le bouton dit combien de métiers la liste contient : sinon, quand la liste est déjà à l'écran, on a l'impression qu'il ne se passe rien.
    var libRes = nbRes > 0 ? 'Voir les ' + pmcPluriel(nbRes, 'métier') + ' à ' + pmcSeuilAffiche(S, S.seuil) + ' % ou plus' : 'Voir la liste : aucun métier ne retrouve assez de vos choix pour l’instant';
    h += '<div class="aller-res"><a class="btn btn-primary" href="#zRes" data-pm="allerres"><i class="bi bi-arrow-down" aria-hidden="true"></i> ' + libRes + '</a></div>';
  }
  return h + '</section>';
}

/* ---------------- Zone 2 : les métiers ---------------- */
function _pmEntonnoir(S, res) {
  var t = res.tous, n = t.length;
  function nb(s) { return t.filter(function (o) { return o.sc.qualite >= s; }).length; }
  var bandes = [['Tous les métiers', n], ['À ' + pmcSeuilAffiche(S, S.seuil) + ' % ou plus', nb(S.seuil)]];
  [60, 80].forEach(function (s) { if (s > S.seuil) { bandes.push(['À ' + pmcSeuilAffiche(S, s) + ' % ou plus', nb(s)]); } });
  return '<div class="entonnoir" aria-label="Combien de métiers par pourcentage">' + bandes.map(function (b) { return '<div class="bande"><span class="lib">' + b[0] + '</span><span class="barre-e"><span style="width:' + Math.max(2, Math.round(100 * Math.sqrt(b[1] / n))) + '%"></span></span><b>' + b[1] + '</b></div>'; }).join('') + '</div>';
}
// « Comment vos choix ont été lus » (consigne 499) : ce que l'application fait de chacun des choix pour classer les métiers. Les comptages viennent de pmcChoixLus (parMetierCalcul.js), rien n'est recalculé ici.
function _pmBlocChoixLus(D, S, res) {
  var lus = pmcChoixLus(D, S, res.retenus.length);
  if (!lus.lignes.length) { return ''; }
  var lignes = lus.lignes.map(function (x) {
    var qui, famille, dit;
    if (x.type === 'comp') {
      var n = cmlNiveauAide(x.nb, lus.total);
      qui = _pmLib(D, x.t, x.i); famille = 'Compétence';
      dit = n ? '<p>Portée par <b>' + pmcPluriel(x.nb, 'métier') + '</b> sur ' + cmvNombre(lus.total) + '. Aide à distinguer : ' + cmvAide(n) + '</p>' : '<p>Notre base ne reconnaît cette compétence chez aucun métier : elle n’a pas compté dans le classement.</p>';
    } else if (x.type === 'niveau') {
      qui = PMC_LIB_NIVEAU[x.niveau]; famille = 'Niveau d’études';
      dit = '<p><b>' + pmcPluriel(x.nb, 'métier') + '</b> y mènent directement. Les métiers qui demandent un niveau plus haut descendent dans la liste, sans disparaître.</p>';
    } else if (x.type === 'secteur') {
      qui = D.secteurs[x.secteur]; famille = 'Secteur';
      dit = '<p><b>' + pmcPluriel(x.nb, 'métier') + '</b> dans ce secteur. Les métiers des autres secteurs gardent très peu de poids : ils n’apparaissent que s’ils retrouvent presque tout le reste.</p>';
    } else {
      qui = 'Conditions de travail'; famille = pmcPluriel(x.nb, 'condition') + ' signalée' + (x.nb > 1 ? 's' : '');
      dit = '<p>Elles décalent un peu le classement : une nuance, jamais un barrage. Chaque fiche vous dit si le métier peut les demander.</p>';
    }
    return cmvLigneLue('<span class="cml-pill pc">' + cmvE(qui) + '</span>', famille, dit);
  }).join('');
  var savoir = 'Avec ' + lus.nbChoix + ' choix, le pourcentage ne dépasse pas ' + lus.plafond + ' %. ' +
    (lus.liste ? pmcPluriel(lus.liste, 'métier') + (lus.liste > 1 ? ' sont' : ' est') + ' à ' + lus.seuil + ' % ou plus.' : 'Aucun métier n’est à ' + lus.seuil + ' % ou plus.');
  return cmvBlocChoixLus('Comment vos choix ont été lus', 'Voici ce que l’application fait de chacun de vos choix pour classer les métiers. Une compétence portée par peu de métiers compte plus qu’une compétence très répandue.', lignes, savoir);
}
function _pmZoneResultats(D, S) {
  var res = pmcCalculer(D, S), avec = res.avec, R = res.retenus;
  var nbP = pmcNbChoixPourPlafond(S), info = cmlInfoNiveauPistes(nbP), sansListe = avec && !info.niveau;   // consigne 505 : sous le minimum de choix, aucune liste
  var h = '<section class="zone zone-res" id="zRes" aria-labelledby="zResT"><h2 id="zResT" class="zone-titre"><span class="num">2</span> Les métiers <span class="zone-sous">' + (avec ? 'Classés selon le pourcentage de chaque métier.' : 'Faites des choix : ils apparaîtront ici, classés.') + '</span>' + (!avec && S.parcourir ? '<button type="button" class="btn btn-outline-secondary tout-decocher" data-pm="parcourir" data-v="0"><i class="bi bi-x-circle" aria-hidden="true"></i> Fermer la liste</button>' : '') + '</h2>';
  if (sansListe) { return h + cmvPasDePistes(nbP) + _pmBlocChoixLus(D, S, res) + '<p class="note mt-3">' + PM_NOTE_NIVEAU + '</p></section>'; }
  if (avec) { var dir = pmcDirections(D, S); h += cmvBandeauNiveau(nbP) + _pmEntonnoir(S, res) + cmvMessageDirections(dir, dir.retirer ? _pmLibC(D, dir.retirer.comp) : ''); }
  h += '<div class="compteur" role="status">' + pmcPluriel(R.length, 'métier') + (avec ? ' à ' + pmcSeuilAffiche(S, S.seuil) + ' % ou plus' : ' au total') + '</div>';
  if (avec) { h += '<details class="comment"><summary>Comment est calculé le pourcentage ?</summary><p>Chaque métier reçoit un pourcentage. Il monte quand le métier demande ce que vous avez choisi : plus la fiche du métier retrouve de vos compétences, plus il monte. <b>Il dépend aussi du nombre de choix que vous avez faits : nous ne proposons pas de métiers avant trois choix, il ne dépasse pas 30 % avec trois choix, 60 % avec six, 90 % avec neuf, et jamais 95 %.</b> Il baisse un peu quand le niveau d’accès est plus haut que votre niveau, quand le secteur est différent, ou quand une condition de travail vous est difficile. Aucun choix ne décide tout seul. Ce n’est pas une note sur vous : c’est une façon de classer des pistes. <b>Passez la souris sur la barre d’un métier (ou appuyez dessus) pour voir ce qui compte dans son pourcentage.</b></p></details>'; }
  if (!R.length) {
    h += '<div class="vide"><p class="mb-1"><b>Avec ces choix, notre base ne reconnaît aucun métier.</b></p><p class="note mb-2">Cela ne veut pas dire qu’il n’existe pas : seulement que nous ne le connaissons pas. Vous pouvez retirer un choix ou en changer, puis regarder à nouveau.</p>' +
      (S.comp.length ? '<button type="button" class="btn btn-outline-primary" data-pm="ret" data-v="' + (S.comp.length - 1) + '">Retirer « ' + cmvE(_pmLibC(D, S.comp[S.comp.length - 1])) + ' »</button>' : '') + '</div>';
  } else if (!avec && !S.parcourir) {
    h += '<div class="vide"><p class="mb-1"><b>Faites un choix ou tapez un métier.</b></p><p class="note mb-2">Il y a ' + D.m.length + ' métiers dans cette liste : vos choix les classent au fur et à mesure.</p><button type="button" class="btn btn-primary" data-pm="parcourir" data-v="1"><i class="bi bi-list-ul" aria-hidden="true"></i> Parcourir tous les métiers</button></div>';
  } else {
    var vedette = avec ? cmlVedetteAutorisee(nbP, cmlEgalitesEnTete(R.map(function (o) { return o.sc.pct; }))) : { oui: false, raison: '' };
    var enveloppe = avec ? '<div class="cml-niv cml-niv-' + info.niveau + ' cml-niv-cartes">' : '<div>';
    if (avec && !vedette.oui) { h += cmvEncartSansVedette(nbP, vedette.raison, cmlEgalitesEnTete(R.map(function (o) { return o.sc.pct; }))); }
    h += enveloppe + (vedette.oui ? '<div class="grille" style="--cols:1">' + _pmCarte(D, S, R[0], true) + '</div>' : '') +
      '<div class="grille c3">' + R.slice(vedette.oui ? 1 : 0, S.plus).map(function (o) { return _pmCarte(D, S, o); }).join('') + '</div></div>';
    if (R.length > S.plus) { h += '<div style="text-align:center;margin-top:.8rem"><button type="button" class="btn btn-outline-secondary" data-pm="plus" style="min-height:44px"><i class="bi bi-chevron-down"></i> Voir les ' + (R.length - S.plus) + ' autres métiers</button></div>'; }
  }
  if (avec && R.length) { h += cmvEncartQuestionnaire() + cmvLegendeNiveaux(nbP); }
  if (avec) { h += _pmBlocChoixLus(D, S, res); }
  // L'interprétation de ce chemin par l'assistant (consigne 543) : le bloc est vide tant qu'elle est fermée (interpretation.js, chargé plus tard : appelé seulement à l'affichage).
  if (avec && typeof intBlocMetier === 'function') { h += intBlocMetier(); }
  h += '<p class="note mt-3">' + PM_NOTE_NIVEAU + '</p>';
  return h + '</section>';
}

function _pmContenu(D, S) {
  var tel = _pmEstTel();
  var h = '<p class="sous-titre">Cherchez un métier, ou faites autant de choix que vous voulez : compétences, niveau, secteur, conditions de travail. Les métiers se classent au fur et à mesure.</p>';
  var n = pmcCalculer(D, S).retenus.length;
  if (tel) {
    h += S.ecran === 'choix' ? _pmZoneChoix(D, S) : '<div class="mb-2"><button type="button" class="btn btn-outline-secondary" data-pm="ecran" data-v="choix"><i class="bi bi-arrow-left"></i> Modifier mes choix</button></div>' + _pmZoneResultats(D, S);
    h += '<div class="bouton-fixe-tel">' + (S.ecran === 'choix'
      ? '<button type="button" class="btn btn-primary btn-lg" data-pm="ecran" data-v="res"><i class="bi bi-list-ul" aria-hidden="true"></i> Voir les métiers (' + n + ')</button>'
      : '<button type="button" class="btn btn-primary btn-lg" data-pm="ecran" data-v="choix"><i class="bi bi-arrow-left" aria-hidden="true"></i> Modifier mes choix</button>') + '</div>';
  } else { h += _pmZoneChoix(D, S, n) + _pmZoneResultats(D, S); }
  return h + _cmpHtmlSigles();
}

/* ---------------- Gestes ---------------- */
function _pmBascule(liste, k) { var x = liste.indexOf(k); if (x >= 0) { liste.splice(x, 1); } else { liste.push(k); } }
function _pmTogComp(S, v) {
  var p = v.split(':'), i = +p[1], tp = p[0], k = S.comp.findIndex(function (c) { return c.t === tp && c.i === i; });
  if (k >= 0) { S.comp.splice(k, 1); } else { S.comp.push({ t: tp, i: i }); }
  S.plus = PM_NB_PREMIERS;
}
var PM_ACTIONS = {
  pan: function (S, v) { S.panneau = S.panneau === v ? null : v; },
  onglet: function (S, v) { S.onglet = v; },
  fermer: function (S, v) { S.panneau = null; setTimeout(function () { var b = document.querySelector('#pmRacine [data-pm="pan"][data-v="' + v + '"]'); if (b) { b.focus(); } }, 0); },
  tog: function (S, v) { _pmTogComp(S, v); },
  add: function (S, v) { var p = v.split(':'); if (!pmcEstChoisie(S, p[0], +p[1])) { S.comp.push({ t: p[0], i: +p[1] }); } S.q = ''; S.sugM = false; S.sugC = false; S.plus = PM_NB_PREMIERS; },
  ret: function (S, v) { S.comp.splice(+v, 1); S.plus = PM_NB_PREMIERS; },
  retniv: function (S) { S.niveau = 0; S.plus = PM_NB_PREMIERS; },
  retsec: function (S, v) { S.secteurs = S.secteurs.filter(function (x) { return x !== +v; }); S.plus = PM_NB_PREMIERS; },
  retdif: function (S, v) { S.dif = S.dif.filter(function (x) { return x !== +v; }); },
  retfac: function (S, v) { S.fac = S.fac.filter(function (x) { return x !== +v; }); },
  dif: function (S, v) { var k = +v; S.fac = S.fac.filter(function (x) { return x !== k; }); _pmBascule(S.dif, k); S.plus = PM_NB_PREMIERS; },
  fac: function (S, v) { var k = +v; S.dif = S.dif.filter(function (x) { return x !== k; }); _pmBascule(S.fac, k); S.plus = PM_NB_PREMIERS; },
  sgd: function (S, v) { PM_ACTIONS.dif(S, v); },
  sgf: function (S, v) { PM_ACTIONS.fac(S, v); },
  sgm: function (S, v) { S.q = ''; S.sugM = false; S.sugC = false; return { fiche: +v }; },
  sgs: function (S, v) { if (S.secteurs.indexOf(+v) === -1) { S.secteurs.push(+v); } S.q = ''; S.plus = PM_NB_PREMIERS; },
  sgn: function (S, v) { S.niveau = +v; S.q = ''; S.plus = PM_NB_PREMIERS; },
  sugplus: function (S, v) { if (v === 'm') { S.sugM = true; } else { S.sugC = true; } },
  tout: function (S) { S.comp = []; S.niveau = 0; S.secteurs = []; S.dif = []; S.fac = []; S.q = ''; S.sugM = false; S.sugC = false; S.panneau = null; S.parcourir = false; S.plus = PM_NB_PREMIERS; },
  niv: function (S, v) { S.niveau = S.niveau === +v ? 0 : +v; S.plus = PM_NB_PREMIERS; },
  sec: function (S, v) { var s = +v; S.secteurs = S.secteurs.indexOf(s) === -1 ? S.secteurs.concat([s]) : S.secteurs.filter(function (x) { return x !== s; }); S.plus = PM_NB_PREMIERS; },
  plus: function (S) { S.plus += 24; },
  fiche: function (S, v) { return { fiche: +v }; },
  retenir: function (S, v) { var r = _pmD.m[+v]; synBasculerRetenu(1, r[0], r.code); },
  parcourir: function (S, v) { S.parcourir = v !== '0'; if (!S.parcourir) { S.plus = PM_NB_PREMIERS; } },
  ecran: function (S, v) { S.ecran = v; window.scrollTo(0, 0); },
  allerres: function () {
    var z = document.getElementById('zRes');
    if (z && z.scrollIntoView) { z.scrollIntoView(); }
    // Un court encadrement et le focus sur le titre montrent où l'on arrive, même quand la liste était déjà presque à l'écran.
    if (z) { var t = document.getElementById('zResT'); if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); } z.classList.add('pm-flash'); setTimeout(function () { z.classList.remove('pm-flash'); }, 1600); }
    return { sansDessin: true };
  }
};

function pmRendre(garderFocus) {
  var racine = document.getElementById('pmRacine');
  if (!racine || !_pmD) { return; }
  var S = pmEtat();
  var actif = document.activeElement, idA = actif && actif.id, pos = actif && actif.selectionStart;
  racine.className = 'pm' + (_pmEstTel() ? ' tel' : '');
  racine.innerHTML = _pmContenu(_pmD, S);
  if (garderFocus && idA) { var n = document.getElementById(idA); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) { /* champ sans sélection */ } } }
}
function _pmClic(ev) {
  var el = ev.target.closest && ev.target.closest('[data-pm]');
  if (!el || !_pmD) { return; }
  var nom = el.getAttribute('data-pm'), fn = PM_ACTIONS[nom];
  if (typeof fn !== 'function') { return; }
  if (nom === 'allerres') { ev.preventDefault(); }
  var r = fn(pmEtat(), el.getAttribute('data-v'), el);
  if (r && r.fiche !== undefined) { if (typeof pmfDebuterVoyage === 'function') { pmfDebuterVoyage(_pmD.m[r.fiche][0], true); } cmvOuvrirFiche(_pmD.m[r.fiche][0], false); return; }
  if (r && r.sansDessin) { return; }
  pmRendre(false);
}
function _pmCabler() {
  var racine = document.getElementById('pmRacine');
  if (!racine) { return; }
  racine.addEventListener('click', _pmClic);
  racine.addEventListener('input', function (ev) {
    if (ev.target.id !== 'pmQ') { return; }
    var S = pmEtat();
    S.q = ev.target.value; S.sugM = false; S.sugC = false;
    // Les autres noms viennent du répertoire du ROME, chargé la première fois qu'on cherche (≈ 13 000 intitulés).
    if (_cmpNorm(S.q).length >= 2 && typeof chargerRepertoireElargi === 'function') { chargerRepertoireElargi(function () { var z = document.getElementById('pmSuggestions'); if (z && document.getElementById('pmQ') && _cmpNorm(pmEtat().q).length >= 2) { z.innerHTML = _pmSuggestions(_pmD, pmEtat()); } }); }
    var z = document.getElementById('pmSuggestions'); if (z) { z.innerHTML = _pmSuggestions(_pmD, S); }
  });
  racine.addEventListener('toggle', function (ev) { var d = ev.target; if (d.tagName === 'DETAILS' && d.getAttribute('data-cle')) { pmEtat().ouverte[d.getAttribute('data-cle')] = d.open; } }, true);
}

cmvEnregistrerVue('metier', {
  titre: 'Chercher un métier',
  barre: function () { return { retour: 'accueil' }; },
  rendre: function () {
    if (_pmD) { return '<div id="pmRacine" class="pm' + (_pmEstTel() ? ' tel' : '') + '">' + _pmContenu(_pmD, pmEtat()) + '</div>'; }
    return '<div id="pmRacine" class="pm"><p class="cml-note" role="status">' + (_pmChargement === 'echec' ? 'Les compétences ne se sont pas chargées. Vérifiez votre connexion, puis revenez sur cette page.' : 'Chargement des métiers et des compétences…') + '</p></div>';
  },
  cabler: function () {
    if (!_pmD) {
      var etatAvant = _pmChargement;
      pmCharger(function (ok) { if (ok && document.getElementById('pmRacine')) { pmRendre(false); _pmCabler(); } else if (document.getElementById('pmRacine')) { cmvRendre(); } });
      if (etatAvant === 'echec') { _pmChargement = ''; }
      return;
    }
    _pmCabler();
  }
});
