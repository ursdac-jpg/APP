/* ============================================================
   Module « Explorer les métiers » : entrée 1, « Chercher un métier » : LA FICHE ENRICHIE, LES PAGES COMPÉTENCE ET SECTEUR, LE FIL DE VOYAGE.
   Charge après parMetierEcran.js. Reprend la maquette validée le 17/11/2026 (docs/MAQUETTE_PAR_UN_METIER_ENRICHI_EXPLORER_LES_METIERS_2026-11-17.html), consigne 453.

   Règles tenues ici :
   - la fiche reste LA page de l'application (route fiche-metier, js/app.js) : ce fichier lui fournit des blocs en plus (cmvFicheComplements, cmvFicheHaut),
     tous lus par ficheMetierCorpsHTML / pageFicheMetier ; rien n'est recopié, tout vient des données générées (parMetierDonnees.js) ;
   - ces blocs n'existent que quand le module est ouvert (cmvOuvert()) et que les données sont chargées : sinon la fiche est celle d'avant, à l'identique ;
   - une compétence ou un secteur cliquable ouvre une page du module (vues « competence » et « secteur ») ; un métier ouvre la fiche ;
   - le fil de voyage garde le chemin parcouru (fiche, compétence, secteur, fiche...) : chaque étape est un bouton, « Retour » remonte d'une étape, et le point de départ est marqué ;
   - les savoirs qui n'apparaissent que dans un seul métier ne sont pas cliquables (consigne 454) ;
   - aucun visage dans les icônes ; seulement des boutons, jamais du texte souligné cliquable.
   Les gestes passent par data-pmf (un seul écouteur sur la page entière : la fiche n'est pas dans le module).
   ============================================================ */

var PMF_ICONES_COND = {
  nuit: 'bi-moon-stars', weekend: 'bi-calendar-week', horaires: 'bi-clock-history', saisonnier: 'bi-calendar-event', deplacements: 'bi-signpost-2',
  charges: 'bi-box-seam', debout: 'bi-hourglass-split', assis: 'bi-display', repetitif: 'bi-arrow-repeat', precision: 'bi-bullseye', tenue: 'bi-shield-check',
  securite: 'bi-exclamation-triangle', bruit: 'bi-volume-up', exterieur: 'bi-cloud-sun', public: 'bi-people', domicile: 'bi-house-door', isole: 'bi-person'
};
var PMF_FAMILLES_COND = [
  ['Horaires', ['nuit', 'weekend', 'horaires', 'saisonnier']],
  ['Effort physique', ['charges', 'debout', 'assis', 'repetitif', 'precision']],
  ['Environnement et sécurité', ['tenue', 'securite', 'bruit', 'exterieur', 'deplacements']],
  ['Contact et lieux de travail', ['public', 'domicile', 'isole']]
];
var PMF_NB_SAVOIRS = 20;      // savoirs montrés sur la fiche avant « Voir les autres savoirs »
var PMF_NB_TOP = 10;          // métiers où une compétence compte le plus
var PMF_NB_SECTEUR = 24;      // métiers montrés d'un coup sur la page d'un secteur
var PMF_NB_PROCHES = 3;
// Phrase d'explication posée une fois au-dessus des cartes de métiers proches (maquette du 21/11/2026) ; vide si les noms d'emploi ne sont pas chargés (D.aNoms).
var PMF_TEXTE_NOMS_CARTES = '<p class="phrase-noms"><i class="bi bi-info-circle" aria-hidden="true"></i> Un même métier peut porter plusieurs noms d’emploi. Ceux qui sont écrits sur les cartes correspondent à la même fiche que le titre.</p>';
var PMF_NOMS_TYPES = { se: 'Savoir-être', sf: 'Savoir-faire', sv: 'Savoirs' };
var PMF_NOMS_TYPES_PLUR = { se: 'Savoir-être', sf: 'Savoir-faire', sv: 'Savoirs' };

/* ---------------- État : le voyage et les pages ---------------- */
// Étapes du voyage : { page: 'accueil' | 'fiche' | 'comp' | 'secteur', nom | t, i | s }. La dernière est la page affichée.
var _pmfVoyage = [];
function pmfEtat() {
  var e = cmvEtat();
  if (!e.pmf) { e.pmf = { comp: null, sec: null, compPlus: 0, secPlus: PMF_NB_SECTEUR, savTous: false, procheTous: false }; }
  return e.pmf;
}
function _pmfD() { return (typeof _pmD !== 'undefined') ? _pmD : null; }
function pmfActif() { return typeof cmvOuvert === 'function' && cmvOuvert() && !!_pmfD(); }
function _pmfIdxDeNom(D, nom) { for (var i = 0; i < D.m.length; i++) { if (D.m[i][0] === nom) { return i; } } return -1; }
function _pmfE(t) { return cmvE(t); }

/* ---------------- Briques d'affichage ---------------- */
function _pmfBoutonSecteur(D, s) {
  return '<button type="button" class="pill-btn" data-pmf="sect" data-v="' + s + '" title="Voir tous les métiers de ce secteur"><i class="bi bi-grid" aria-hidden="true"></i> ' + _pmfE(D.secteurs[s]) + '</button>';
}
// Ligne « Aussi appelé » (consigne 498, maquette validée le 21/11/2026) : trois noms d'emploi courants, puis « (et N autres) ». Rien du tout quand la fiche n'a pas d'autre nom.
// Les noms viennent de D.noms (data/rome/nomsEmploi.js, nettoyés par pmcNomsEmploi) ; le nombre de noms montrés est PMF_NB_NOMS_CARTE.
function _pmfLigneNoms(D, r) {
  var e = D.noms && D.noms[r.code];
  if (!e || !e[0].length) { return ''; }
  var reste = e[1] - e[0].length;
  return '<div class="noms-emploi"><span class="etiq">Aussi appelé :</span> ' + e[0].map(_pmfE).join(' ; ') + (reste > 0 ? ' <span class="plus">(et ' + reste + (reste > 1 ? ' autres' : ' autre') + ')</span>' : '') + '</div>';
}
function _pmfCarteSimple(D, idx, extra) {
  var r = D.m[idx];
  return '<div class="carte-m"><h4>' + _pmfE(r[0]) + '</h4>' + _pmfLigneNoms(D, r) + _pmfBoutonSecteur(D, r[1]) + _pmLigneAcces(r) + (extra || '') +
    '<div class="rang-boutons"><button type="button" class="btn btn-outline-primary b-fiche" data-pmf="fiche" data-v="' + idx + '"><i class="bi bi-file-earmark-person" aria-hidden="true"></i> Voir la fiche</button></div></div>';
}
function _pmfGrille(html) { return '<div class="grille" style="--cols:' + (_pmEstTel() ? 1 : 3) + '">' + html + '</div>'; }
function _pmfEnveloppe(html) { return '<div id="pmRacine" class="pm' + (_pmEstTel() ? ' tel' : '') + '">' + html + '</div>'; }
// Compétences que deux métiers ont en commun, en une ligne (sans lister ce qui manque).
function _pmfExtraCommun(D, a, b) {
  var c = pmcCommunes(D, a, b), n = c.se.length + c.sf.length + c.sv.length;
  return n ? '<div class="retrouve">' + n + (n > 1 ? ' compétences en commun' : ' compétence en commun') + '</div>' : '';
}

/* ---------------- Blocs de la fiche ---------------- */
function _pmfBlocConditions(D, r) {
  var S = pmEtat(), faciles = S.fac.map(function (k) { return D.condCles[k]; }), difficiles = S.dif.map(function (k) { return D.condCles[k]; });
  var cles = r[6].map(function (k) { return D.condCles[k]; }), any = false;
  var h = '<div class="bloc-cond-corps"><p class="legende">À lire avant de candidater : les horaires, l’effort demandé, l’environnement et le contact avec les autres.' +
    ((faciles.length || difficiles.length) ? ' Ce que vous avez marqué facile ou difficile est signalé.' : '') + '</p><div class="cond-familles">';
  PMF_FAMILLES_COND.forEach(function (f) {
    var ks = f[1].filter(function (k) { return cles.indexOf(k) !== -1; });
    if (!ks.length) { return; }
    any = true;
    h += '<div class="cond-fam"><div class="cond-fam-titre">' + f[0] + '</div><div class="cond-tuiles">' + ks.map(function (k) {
      var fac = faciles.indexOf(k) !== -1, dif = difficiles.indexOf(k) !== -1;
      return '<div class="cond-tuile' + (fac ? ' est-facile' : '') + (dif ? ' est-difficile' : '') + '"><i class="bi ' + PMF_ICONES_COND[k] + '" aria-hidden="true"></i><span>' + _pmfE(D.cond[D.condCles.indexOf(k)]) + '</span>' +
        (fac ? '<small>Facile pour vous</small>' : '') + (dif ? '<small>Difficile pour vous</small>' : '') + '</div>';
    }).join('') + '</div></div>';
  });
  h += '</div>';
  if (!any) { h += '<p class="note mb-0">La fiche ne cite pas de condition particulière.</p>'; }
  return h + '</div>';
}
function _pmfPastilles(D, t, liste, max) {
  var S = pmEtat();
  return liste.slice(0, max == null ? liste.length : max).map(function (i) {
    return '<button type="button" class="cp" data-pmf="comp" data-v="' + t + ':' + i + '" title="Voir les métiers qui demandent cette compétence">' + _pmfE(D[t][i].lib) + (pmcEstChoisie(S, t, i) ? ' <i class="bi bi-check2" aria-label="déjà dans vos choix"></i>' : '') + '</button>';
  }).join('');
}
function _pmfBlocCompetences(D, idx) {
  var r = D.m[idx], P = pmfEtat();
  var h = '<div id="pmfCompetences"><p class="legende">Cliquez sur une compétence pour voir les métiers qui la demandent : vous pouvez ainsi voyager de métier en métier.</p>';
  PMC_TYPES.forEach(function (t) {
    var liste = r[PMC_RANG[t]]; if (!liste.length) { return; }
    var max = t === 'sv' && !P.savTous ? PMF_NB_SAVOIRS : liste.length;
    h += '<h4 class="ft">' + PMF_NOMS_TYPES[t] + ' <small>(' + liste.length + ')</small></h4><div class="pastilles">' + _pmfPastilles(D, t, liste, max) + '</div>' +
      (t === 'sv' && liste.length > PMF_NB_SAVOIRS ? '<button type="button" class="btn btn-outline-secondary btn-sm mt-2" data-pmf="savtous">' + (P.savTous ? 'Voir moins de savoirs' : 'Voir les autres savoirs (' + (liste.length - PMF_NB_SAVOIRS) + ')') + '</button>' : '');
  });
  h += '<p class="note mt-3 mb-1">Les savoirs qui ne se trouvent que dans ce métier ne sont pas cliquables : ils restent écrits dans « Outils, techniques et connaissances ».</p>' +
    '<button type="button" class="btn btn-outline-primary mt-1" data-pmf="depart" data-v="' + idx + '"><i class="bi bi-box-arrow-in-right" aria-hidden="true"></i> Utiliser ces compétences comme point de départ</button>';
  return h + '</div>';
}
function _pmfSectionProches(D, idx) {
  var r = D.m[idx], P = pmfEtat();
  var fiche = null;
  var pr = pmcProches(D, idx, _pmfCodesOfficiels(r), P.procheTous ? 10 : PMF_NB_PROCHES);
  if (!pr.length) { return ''; }
  return '<div id="pmfProches"><p class="legende">Ils partagent beaucoup de compétences avec celui-ci.</p>' + (D.aNoms ? PMF_TEXTE_NOMS_CARTES : '') +
    _pmfGrille(pr.map(function (p) { return _pmfCarteSimple(D, p.i, _pmfExtraCommun(D, idx, p.i)); }).join('')) +
    '<div style="text-align:center;margin-top:.8rem"><button type="button" class="btn btn-outline-secondary" data-pmf="procheplus">' + (P.procheTous ? 'Voir moins de métiers proches' : 'Voir d’autres métiers proches') + '</button></div></div>';
}
// Les métiers proches désignés par le ROME lui-même passent en premier (champ p des fiches complètes, déjà chargé par la fiche).
function _pmfCodesOfficiels(r) {
  var f = (typeof window !== 'undefined' && window.FICHES_ROME && window.FICHES_ROME[r.code]) ? window.FICHES_ROME[r.code] : null;
  return f && f.p ? f.p : [];
}
function _pmfSectionSecteur(D, idx) {
  var r = D.m[idx], sec = pmcMetiersDuSecteur(D, idx, []);
  var h = '<div id="pmfSecteur"><p class="legende">' + _pmfE(D.secteurs[r[1]]) + '</p>';
  if (sec.length) {
    h += _pmfGrille(sec.slice(0, 5).map(function (p) { return _pmfCarteSimple(D, p.i, ''); }).join('')) +
      '<div style="text-align:center;margin-top:.8rem"><button type="button" class="btn btn-outline-primary" data-pmf="sect" data-v="' + r[1] + '"><i class="bi bi-grid" aria-hidden="true"></i> Voir tous les métiers de ce secteur (' + D.nbParSecteur[r[1]] + ')</button></div>';
  }
  return h + '</div>';
}
function _pmfVoyagerCorps(D, courant) {
  return '<div class="secteurs">' + D.secteurs.map(function (s, i) { return i === courant ? '' : '<button type="button" data-pmf="sect" data-v="' + i + '">' + _pmfE(s) + '<small>' + D.nbParSecteur[i] + '</small></button>'; }).join('') + '</div>';
}
function _pmfVoyagerSecteurs(D, courant) {
  return '<section class="zone"><h2 class="zone-titre"><i class="bi bi-signpost-split" aria-hidden="true"></i> Voyager vers un autre secteur</h2>' + _pmfVoyagerCorps(D, courant) + '</section>';
}

/* ---------------- Candidater pour ce métier : demande d'offres + passage au module Candidater (consigne 453) ---------------- */
// La demande est préparée ici puis copiée par la personne dans l'assistant en ligne de son choix : rien n'est repris en retour.
// Texte validé par Denis le 18/11/2026 (docs/TEXTES_EXPLORER_LES_METIERS_A_RELIRE_2026-11-17.md, section 8).
var PMF_AVERTISSEMENT_OFFRES = 'L’assistant cherche seulement les offres publiées en ce moment. Beaucoup d’emplois ne sont jamais publiés : il ne les verra pas. Vérifiez toujours une offre sur le site de l’employeur ou de France Travail avant de candidater. Cette application ne garde pas sa réponse : c’est à vous de la lire et de décider.';
// Les deux assistants proposés pour la demande d'offres (choix de Denis, 18/11/2026) : noms et adresses lus dans la liste commune ASSISTANTS_IA (js/app.js).
var PMF_ASSISTANTS_OFFRES = ['chatgpt', 'perplexity'];
function _pmfAssistant(id) {
  var L = (typeof ASSISTANTS_IA !== 'undefined') ? ASSISTANTS_IA : [];
  for (var i = 0; i < L.length; i++) { if (L[i].id === id) { return L[i]; } }
  return null;
}
// Copie la demande puis ouvre l'assistant dans un nouvel onglet. La copie se fait AVANT l'ouverture (l'ouverture déplace le focus et peut faire échouer la copie) :
// d'abord la copie immédiate depuis la zone de texte visible, sans attente ; à défaut, l'API du presse-papiers, puis l'ouverture. Aucune donnée n'est mise dans l'adresse.
function _pmfCopierPuisOuvrir(texte, zone, ouvrir) {
  var copie = false;
  try { zone.focus(); zone.select(); copie = document.execCommand('copy'); zone.setSelectionRange(0, 0); } catch (e) { copie = false; }
  if (copie) { ouvrir(); return; }
  if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(texte).then(ouvrir).catch(ouvrir); } else { ouvrir(); }
}
function _pmfDireOuverture(A, bloque) {
  var p = document.getElementById('pmfOuvert'); if (!p) { return; }
  p.innerHTML = bloque
    ? 'La demande est copiée, mais votre navigateur a bloqué l’ouverture de ' + _pmfE(A.nom) + '. Ouvrez-le avec ce bouton : <a class="btn btn-outline-primary btn-sm" href="' + _pmfE(A.url) + '" target="_blank" rel="noopener">Ouvrir ' + _pmfE(A.nom) + '</a>. Dans sa zone de conversation, faites ensuite <span class="cle-pulse">Ctrl + V</span>, puis appuyez sur <strong>Entrée</strong>.'
    : 'La demande est copiée. ' + _pmfE(A.nom) + ' s’ouvre dans un nouvel onglet : cliquez dans sa zone de conversation, faites <span class="cle-pulse">Ctrl + V</span>, puis appuyez sur <strong>Entrée</strong>. Vous pourrez revenir ici ensuite.';
}
// Le département mémorisé par l'application (le même choix que « Comprendre les chiffres » et « Qui fait quoi ») préremplit la demande : jamais redemandé.
function _pmfDepartementMemorise() {
  var d = (typeof departementRessourcesMemorise === 'function') ? departementRessourcesMemorise() : null;
  return (d && PMC_TERRITOIRES[d]) ? d : (d === 'ailleurs' ? 'libre' : '');
}
function _pmfOffres() {
  var P = pmfEtat();
  if (!P.fo) { P.fo = { dep: _pmfDepartementMemorise(), terr: '', libre: '', voisins: [], inclure: true, pret: false }; }
  return P.fo;
}
function _pmfOffresPret(fo) { return !!fo.dep && (fo.dep === 'libre' ? !!fo.libre.trim() : !!fo.terr); }
function _pmfDateFr() { return new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
// sujet : { metier } (fiche d'un métier) ou { metiers } (chemin « Les emplois en demande ») ; avecChoix : reprendre les compétences et le niveau choisis par la personne (fiche seulement).
function _pmfMessageOffres(sujet, avecChoix) {
  var fo = _pmfOffres(), S = pmEtat(), D = _pmfD();
  var dep = fo.dep === 'libre' ? (fo.libre.trim() || 'mon département') : PMC_TERRITOIRES[fo.dep].nom;
  var reprend = !!avecChoix && fo.inclure && !!D;
  return pmcMessageOffres({
    metier: sujet.metier || '', appellations: sujet.appellations || [], metiers: sujet.metiers || [], dateTexte: _pmfDateFr(), departement: dep, zone: fo.dep === 'libre' ? '' : fo.terr,
    voisins: fo.dep === 'libre' ? [] : fo.voisins.map(function (c) { return PMC_NOMS_DEPARTEMENTS[c]; }),
    competences: reprend ? S.comp.map(function (c) { return D[c.t][c.i].lib; }) : [],
    niveau: reprend && S.niveau ? PMC_LIB_NIVEAU[S.niveau] : (sujet.niveau || ''), voieFormation: !!sujet.niveau
  });
}
// Le formulaire « département, territoire, départements proches, préparer ma demande, copier » : UNE seule fonction, pour la fiche d'un métier et pour le chemin « Les emplois en demande ».
function _pmfFormulaireOffres(sujet, avecChoix) {
  var fo = _pmfOffres(), S = pmEtat(), terr = PMC_TERRITOIRES[fo.dep], h = '';
  h += '<label class="lab" for="pmfSelDep">1. Votre département</label><select id="pmfSelDep" class="form-select" data-pmf-sel="dep"><option value="">Choisir…</option>' +
    Object.keys(PMC_TERRITOIRES).map(function (c) { return '<option value="' + c + '"' + (fo.dep === c ? ' selected' : '') + '>' + _pmfE(PMC_TERRITOIRES[c].nom) + '</option>'; }).join('') +
    '<option value="libre"' + (fo.dep === 'libre' ? ' selected' : '') + '>Un autre département</option></select>';
  if (fo.dep === 'libre') { h += '<label class="lab" for="pmfDepLibre">Le nom de votre département</label><input id="pmfDepLibre" class="form-control" data-pmf-sel="libre" value="' + _pmfE(fo.libre) + '" placeholder="Par exemple : Corrèze (19)">'; }
  if (terr) {
    h += '<label class="lab" for="pmfSelTerr">2. Votre territoire</label><select id="pmfSelTerr" class="form-select" data-pmf-sel="terr"><option value="">Choisir…</option>' +
      Object.keys(terr.zones).map(function (z) { return '<option' + (fo.terr === z ? ' selected' : '') + '>' + _pmfE(z) + '</option>'; }).join('') + '</select>';
    if (fo.terr) {
      h += '<div class="lab">3. Chercher aussi dans les départements proches de ce territoire</div><div class="secteurs" role="group" aria-label="Départements proches">' +
        terr.zones[fo.terr].map(function (c, k) { return '<button type="button" data-pmf="vo" data-v="' + c + '" aria-pressed="' + (fo.voisins.indexOf(c) !== -1) + '">' + _pmfE(PMC_NOMS_DEPARTEMENTS[c]) + (k === 0 ? ' <small>(le plus proche)</small>' : '') + '</button>'; }).join('') + '</div>' +
        '<p class="note mt-1 mb-0">Seuls les départements qui touchent votre territoire sont proposés, du plus proche au plus éloigné. Retirez ceux qui sont trop loin pour vous.</p>';
    }
  }
  if (avecChoix && (S.comp.length || S.niveau)) {
    h += '<label class="lab check"><input type="checkbox" data-pmf-sel="inclure"' + (fo.inclure ? ' checked' : '') + '> Ajouter à la demande mes choix (' + (S.comp.length ? pmcPluriel(S.comp.length, 'compétence') : '') + (S.comp.length && S.niveau ? ' et ' : '') + (S.niveau ? 'mon niveau' : '') + ') pour repérer les offres qui me correspondent</label>';
  }
  var okLieu = _pmfOffresPret(fo), okMetier = !sujet.metiers || sujet.metiers.length > 0, pret = okLieu && okMetier;
  h += '<div class="mt-3"><button type="button" class="btn btn-primary" data-pmf="prep"' + (pret ? '' : ' disabled') + '><i class="bi bi-clipboard-check" aria-hidden="true"></i> Préparer ma demande</button>' +
    (pret ? '' : (okLieu ? ' <span class="note">Cochez d’abord au moins un métier.</span>' : ' <span class="note">Choisissez d’abord votre département' + (fo.dep && fo.dep !== 'libre' ? ' et votre territoire' : '') + '.</span>')) + '</div>';
  if (fo.pret && pret) {
    h += '<div class="demande-boite mt-3"><b>Votre demande</b><textarea id="pmfDemande" readonly rows="12" class="form-control">' + _pmfE(_pmfMessageOffres(sujet, avecChoix)) + '</textarea>' +
      '<p class="note mt-2 mb-0" id="pmfAvertissement">' + PMF_AVERTISSEMENT_OFFRES + '</p>' +
      '<div class="mt-2 d-flex flex-wrap gap-2"><button type="button" class="btn btn-outline-primary" data-pmf="copier"><i class="bi bi-clipboard" aria-hidden="true"></i> Copier la demande</button>' +
      PMF_ASSISTANTS_OFFRES.map(function (id) { var A = _pmfAssistant(id); return A ? '<button type="button" class="btn btn-outline-primary" data-pmf="copierouvrir" data-v="' + id + '"><i class="bi bi-box-arrow-up-right" aria-hidden="true"></i> Copier et ouvrir ' + _pmfE(A.nom) + '</button>' : ''; }).join('') + '</div>' +
      '<p class="note mt-2 mb-0" id="pmfOuvert" role="status" aria-live="polite"></p>' +
      (typeof htmlVideoGeste === 'function' ? htmlVideoGeste('chatgpt-demande') + htmlVideoGeste('perplexity-demande') + htmlVideoGeste('chatgpt-recherche-web') : '') + '</div>';
  }
  return h;
}
// Les cinq appellations les plus courantes du métier (champ n de la fiche du ROME, les plus courantes d'abord), sans le nom déjà donné (consigne 496)
function _pmfAppellations(r) {
  var f = (typeof window !== 'undefined' && window.FICHES_ROME && r && window.FICHES_ROME[r.code]) ? window.FICHES_ROME[r.code] : null;
  return pmcNomsEmploi((f && f.n) || [], r && r[0]).slice(0, 5);
}
function _pmfBlocCandidater(D, idx) {
  var h = '<div id="pmfCandidater"><h4 class="ft" style="margin-top:.2rem">Chercher des offres en ce moment</h4>' +
    '<p class="legende">Votre demande est préparée ici. Vous la collez ensuite dans l’assistant en ligne de votre choix. Ce qu’il vous répond reste chez lui : cette application ne reprend rien.</p>';
  h += _pmfFormulaireOffres({ metier: D.m[idx][0], appellations: _pmfAppellations(D.m[idx]) }, true);
  h += '<h4 class="ft mt-4">Préparer ma candidature</h4><p class="legende">Le CV et la lettre se préparent dans le module Candidater. Le métier y est repris.</p>' +
    '<button type="button" class="btn btn-outline-primary" data-pmf="cand"><i class="bi bi-send" aria-hidden="true"></i> Préparer ma candidature pour ce métier</button>';
  return h + '</div>';
}
// Chemin « Les emplois en demande » (recrute.js) : la même demande, pour les métiers que la personne coche. Les métiers sont rangés par rubrique, comme dans la page :
// Rien n'est coché au départ ; cinq métiers au plus en tout (décision Denis 18/11/2026 : plus il y a de métiers, moins les offres trouvées sont pertinentes). Une rubrique à la fois, en onglets sur une ligne.
// groupes = [{ id, titre, court (nom de l'onglet), parties: [{ titre, items: [{ nom, autres: [noms de fiches proches] }] }] }].
var _pmfRecruteGroupes = [];
var PMF_MAX_METIERS = 5;
function _pmfMetierCoche(g, nom) { var c = _pmfOffres().coches || {}; return !!c[g.id + '|' + nom]; }
function _pmfNbCoches(g) { var n = 0; _pmfRecruteGroupes.forEach(function (x) { if (g && x !== g) { return; } _pmfRecruteItems(x).forEach(function (i) { if (_pmfMetierCoche(x, i.nom)) { n++; } }); }); return n; }
function _pmfRecruteItems(g) { var t = []; g.parties.forEach(function (p) { p.items.forEach(function (i) { t.push(i); }); }); return t; }
// Les métiers cochés, avec leurs noms proches (aide l'assistant à chercher sous les différents intitulés) ; un métier cité dans deux rubriques n'est écrit qu'une fois.
function _pmfRecruteChoisis() {
  var vus = {}, L = [];
  _pmfRecruteGroupes.forEach(function (g) { _pmfRecruteItems(g).forEach(function (i) {
    if (!_pmfMetierCoche(g, i.nom) || vus[i.nom]) { return; }
    vus[i.nom] = true; L.push(i.nom + ((i.autres && i.autres.length) ? ' (aussi appelé : ' + i.autres.join(', ') + ')' : ''));
  }); });
  return L;
}
function _pmfMetiersCochesOk() { var z = document.getElementById('pmfCandidater'); return !(z && z.getAttribute('data-ctx') === 'recrute') || _pmfRecruteChoisis().length > 0; }
function _pmfRecruteChoixHTML() {
  var fo = _pmfOffres(), n = _pmfNbCoches(), plein = n >= PMF_MAX_METIERS, actif = null;
  _pmfRecruteGroupes.forEach(function (g) { if (g.id === fo.ongletMetiers) { actif = g; } });
  if (!actif) { actif = _pmfRecruteGroupes[0]; }
  if (!actif) { return ''; }
  var h = '<div class="pmf-rubrique"><h3 class="pmf-rub-titre"><i class="bi bi-briefcase" aria-hidden="true"></i> Les métiers pour lesquels chercher des offres</h3><p class="note mb-1">Choisissez jusqu’à ' + PMF_MAX_METIERS + ' métiers : au-delà, les offres trouvées sont moins précises. Ils sont rangés par rubrique, comme plus haut dans cette page.</p>' +
    '<div class="onglets" role="tablist" aria-label="Rubriques de métiers">' + _pmfRecruteGroupes.map(function (g) {
      var k = _pmfNbCoches(g);
      return '<button type="button" role="tab" id="pmfOng-' + g.id + '" aria-controls="pmfOngPanneau" data-pmf="metonglet" data-v="' + g.id + '" class="' + (g === actif ? 'actif' : '') + '" aria-selected="' + (g === actif) + '">' + _pmfE(g.court || g.titre) + (k ? ' (' + k + ')' : '') + '</button>';
    }).join('') + '</div>';
  h += '<div id="pmfOngPanneau" role="tabpanel" aria-labelledby="pmfOng-' + actif.id + '"><p class="mt-2 mb-1"><b>' + _pmfE(actif.titre) + '</b></p>';
  actif.parties.forEach(function (p) {
    h += (p.titre ? '<div class="note mt-1"><b>' + _pmfE(p.titre) + '</b></div>' : '') + '<ul class="list-unstyled mb-1 pmf-grille">' + p.items.map(function (i) {
      var coche = _pmfMetierCoche(actif, i.nom);
      return '<li><label class="lab check"><input type="checkbox" data-pmf-sel="metier" data-grp="' + actif.id + '" data-nom="' + _pmfE(i.nom) + '"' + (coche ? ' checked' : (plein ? ' disabled' : '')) + '> <span>' + _pmfE(i.nom) +
        ((i.autres && i.autres.length) ? '<small class="note d-block">(aussi appelé : ' + _pmfE(i.autres.join(', ')) + ')</small>' : '') + '</span></label></li>';
    }).join('') + '</ul>';
  });
  h += '</div><p class="note mt-1" role="status" aria-live="polite">' + (n ? pmcPluriel(n, 'métier coché', 'métiers cochés') + ' sur ' + PMF_MAX_METIERS + ' au plus.' : 'Aucun métier coché pour le moment.') +
    (plein ? ' Vous avez atteint le maximum : décochez un métier pour en choisir un autre.' : '') + '</p>';
  if (n) { h += '<button type="button" class="btn btn-outline-secondary btn-sm" data-pmf="metvider">Tout décocher</button>'; }
  return h + '</div>';
}
var _pmfNiveauOffres = '';   // niveau d'études de la personne, rappelé dans la demande (« Ma lecture », tâche A13) ; vide ailleurs
function _pmfBlocOffresRecrute() {
  return '<div id="pmfCandidater" data-ctx="recrute"><p class="legende">Votre demande est préparée ici. Vous la collez ensuite dans l’assistant en ligne de votre choix. Ce qu’il vous répond reste chez lui : cette application ne reprend rien.</p>' +
    _pmfRecruteChoixHTML() + '<div class="pmf-rubrique"><h3 class="pmf-rub-titre"><i class="bi bi-geo-alt" aria-hidden="true"></i> Où chercher, puis préparer la demande</h3>' +
    _pmfFormulaireOffres({ metiers: _pmfRecruteChoisis(), niveau: _pmfNiveauOffres }, false) + '</div></div>';
}
function pmfBlocOffresRecrute(groupes, niveauTexte) {
  _pmfNiveauOffres = niveauTexte || '';
  _pmfRecruteGroupes = (groupes || []).filter(function (g) { return _pmfRecruteItems(g).length; });
  return pmfActif() ? _pmfEnveloppe(_pmfBlocOffresRecrute()) : '';
}

/* ---------------- Ce que la fiche de l'application lit ---------------- */
// Retourne les blocs à ajouter à la fiche du métier (chaînes vides si le module est fermé ou si les données ne sont pas chargées).
function pmfBlocsFiche(fiche) {
  var vide = { conditions: null, competences: null, candidater: null, proches: null, secteur: null, voyager: null };
  if (!fiche || !pmfActif()) { return vide; }
  var D = _pmfD(), idx = _pmfIdxDeNom(D, fiche.nom);
  if (idx < 0) { return vide; }
  var r = D.m[idx];
  var proches = _pmfSectionProches(D, idx);
  return {
    conditions: { titre: 'Les conditions de travail de ce métier', html: _pmfEnveloppe(_pmfBlocConditions(D, r)) },
    competences: { titre: 'Les compétences de ce métier', html: _pmfEnveloppe(_pmfBlocCompetences(D, idx)) },
    proches: proches ? { titre: 'Des métiers proches de celui-ci', html: _pmfEnveloppe(proches) } : null,
    candidater: { titre: 'Candidater pour ce métier', html: _pmfEnveloppe(_pmfBlocCandidater(D, idx)) },
    secteur: { titre: 'Les métiers du même secteur', html: _pmfEnveloppe(_pmfSectionSecteur(D, idx)) },
    voyager: { titre: 'Voyager vers un autre secteur', html: _pmfEnveloppe(_pmfVoyagerCorps(D, r[1])) }
  };
}
// Le fil de voyage, tout en haut de la fiche, seulement quand la personne voyage (au moins deux étapes).
function cmvFicheHaut(fiche) {
  if (!fiche || !cmvOuvert() || !pmfActif()) { return ''; }
  if (!_pmfCoherent()) { _pmfVoyage = []; }
  if (_pmfVoyage.length < 2) { return ''; }
  return _pmfEnveloppe(_pmfFil());
}

/* ---------------- Le fil de voyage ---------------- */
function _pmfLibEtape(D, et) {
  if (et.page === 'fiche') { return et.nom; }
  if (et.page === 'comp') { return D[et.t][et.i].lib; }
  if (et.page === 'secteur') { return D.secteurs[et.s]; }
  return pmcNbChoix(pmEtat()) ? 'Mes résultats (' + pmcNbChoix(pmEtat()) + ' choix)' : 'La recherche';
}
function _pmfFil() {
  var D = _pmfD(), T = _pmfVoyage, depart = -1, k;
  if (!D || T.length < 2) { return ''; }
  for (k = 0; k < T.length; k++) { if (T[k].page === 'fiche') { depart = k; break; } }
  var h = '<nav class="fil" aria-label="Votre parcours">' + T.map(function (et, n) {
    var ici = n === T.length - 1, lib = (n === depart ? '★ Point de départ : ' : '') + _pmfLibEtape(D, et);
    return (n ? '<span class="sep" aria-hidden="true">&rsaquo;</span>' : '') + (ici ? '<span class="ici" aria-current="page">' + _pmfE(lib) + '</span>' : '<button type="button" data-pmf="fil" data-v="' + n + '">' + _pmfE(lib) + '</button>');
  }).join('') + '</nav>';
  h += '<div class="mb-2 rang-retour"><button type="button" class="btn btn-outline-secondary" data-pmf="retour"><i class="bi bi-arrow-left" aria-hidden="true"></i> Retour</button>';
  if (T[0].page === 'accueil') { h += ' <button type="button" class="btn btn-outline-primary" data-pmf="fil" data-v="0"><i class="bi bi-list-ul" aria-hidden="true"></i> Revenir à ' + (pmcNbChoix(pmEtat()) ? 'mes résultats' : 'la recherche') + '</button>'; }
  if (depart > 0 && depart < T.length - 1) { h += ' <button type="button" class="btn btn-outline-primary" data-pmf="fil" data-v="' + depart + '"><i class="bi bi-flag" aria-hidden="true"></i> Revenir à mon point de départ : ' + _pmfE(_pmfLibEtape(D, T[depart])) + '</button>'; }
  h += '</div>';
  if (T[0].page === 'accueil' && pmcNbChoix(pmEtat())) { h += '<p class="note mb-2">Vous voyagez à partir de vos résultats. Vos ' + pmcNbChoix(pmEtat()) + ' choix sont gardés : vous pouvez y revenir à tout moment.</p>'; }
  return h;
}

/* ---------------- Navigation du voyage ---------------- */
// Ouvre une étape SANS toucher à la pile de navigation de l'application (le voyage a la sienne) ; la dernière étape du voyage est la page affichée.
// UNE SEULE PISTE DE RETOUR (consigne 459, 18/11/2026) : chaque étape du voyage est une vraie entrée de l'historique du navigateur. Le bouton « Retour » du bas, le fil
// et la flèche « Précédent » font donc exactement la même chose, et l'adresse est juste. Les états restent en mémoire (historiqueInterne*, js/app.js) ; après un
// rechargement de la page, le module repart de son accueil, comme pour toutes ses pages.
function pmfVoyageCopie() { return _pmfVoyage.map(function (e) { return JSON.parse(JSON.stringify(e)); }); }
function _pmfHistoriqueDispo() { return typeof historiqueInterneEmpiler === 'function' && typeof historiqueInterneMarquer === 'function' && typeof history !== 'undefined' && !!history.pushState; }
function _pmfInstantaneFiche() {
  return { cle: 'fiche:' + _ficheMetierNom + ':' + _pmfVoyage.length, nom: _ficheMetierNom, voyage: pmfVoyageCopie(), origine: _cmvVueOrigineFiche, depuisActions: !!(_cmvFicheContexte && _cmvFicheContexte.depuisActions) };
}
// Remet une fiche du voyage (appelée par « Précédent » / « Suivant » du navigateur, avant que l'application dessine la page).
function _pmfRestaurerFiche(s) {
  _pmfVoyage = (s.voyage || []).map(function (e) { return JSON.parse(JSON.stringify(e)); });
  _ficheMetierNom = s.nom; _ficheMetierCandidater = false; _ficheMetierChoix = false; _ficheMetierRerender = null; _ficheMetierDepuisCandidater = false;
  _cmvFicheContexte = { nom: s.nom, depuisActions: !!s.depuisActions };
  var P = pmfEtat(); P.savTous = false; P.procheTous = false;
  _cmvVueOrigineFiche = s.origine || null;
  if (s.origine) { cmvEtat().vue = s.origine; }
}
// Remet une page du module (appelée par _cmvRestaurerHistorique) : le voyage de cette page, ou aucun voyage pour les autres pages.
function pmfRestaurerVoyage(s) {
  var P = pmfEtat();
  _pmfVoyage = (s.voyage && s.voyage.length) ? s.voyage.map(function (e) { return JSON.parse(JSON.stringify(e)); }) : [];
  if (s.vue === 'competence' && s.comp) { P.comp = { t: s.comp.t, i: s.comp.i }; P.compPlus = 0; }
  if (s.vue === 'secteur' && s.sec !== null && s.sec !== undefined) { P.sec = s.sec; P.secPlus = PMF_NB_SECTEUR; }
}
// L'entrée courante de l'historique est-elle celle d'une étape de ce voyage, de la même longueur ? Sinon (fiche ouverte autrement), l'ancien retour s'applique.
function _pmfEntreeAJour(n) {
  if (typeof history === 'undefined' || typeof _historiqueEtats === 'undefined' || !history.state || !history.state.interne) { return false; }
  var e = _historiqueEtats[history.state.interne];
  return !!(e && e.voyage && e.voyage.length === n);
}
// Avant de quitter une fiche pour l'étape suivante, la fiche garde son état dans l'historique (sa page est une route de l'application, pas du module).
function _pmfMarquerFicheCourante() {
  if (!_pmfHistoriqueDispo() || pageActuelle !== 'fiche-metier' || _pmfEntreeAJour(_pmfVoyage.length)) { return; }
  historiqueInterneBrancher('fiche-metier', _pmfRestaurerFiche);
  historiqueInterneMarquer('fiche-metier', _pmfInstantaneFiche());
}
function _pmfOuvrirEtape(et, nouvelle) {
  var P = pmfEtat(), etat = cmvEtat();
  if (et.page === 'fiche') {
    if (typeof _ficheMetierNom === 'undefined') { return; }
    _ficheMetierNom = et.nom; _ficheMetierCandidater = false; _ficheMetierChoix = false; _ficheMetierRerender = null; _ficheMetierDepuisCandidater = false;
    _cmvFicheContexte = { nom: et.nom, depuisActions: false };
    P.savTous = false; P.procheTous = false;
    // Sur la fiche de départ, la page du module reste celle d'où la personne est partie : le « Retour » de la fiche y ramène (jamais la page « compétence » ou « secteur » quittée).
    if (_cmvVueOrigineFiche) { etat.vue = _cmvVueOrigineFiche; }
    if (nouvelle && _pmfHistoriqueDispo()) { historiqueInterneBrancher('fiche-metier', _pmfRestaurerFiche); historiqueInterneEmpiler('fiche-metier', _pmfInstantaneFiche()); }
    naviguerVers('fiche-metier', true);
  } else if (et.page === 'comp') {
    P.comp = { t: et.t, i: et.i }; P.compPlus = 0; etat.vue = 'competence';
    if (nouvelle && _pmfHistoriqueDispo() && typeof _cmvInstantane === 'function') { historiqueInterneEmpiler(CMV_ROUTE, _cmvInstantane()); }
    naviguerVers(CMV_ROUTE, true);
  } else if (et.page === 'secteur') {
    P.sec = et.s; P.secPlus = PMF_NB_SECTEUR; etat.vue = 'secteur';
    if (nouvelle && _pmfHistoriqueDispo() && typeof _cmvInstantane === 'function') { historiqueInterneEmpiler(CMV_ROUTE, _cmvInstantane()); }
    naviguerVers(CMV_ROUTE, true);
  } else {
    etat.vue = 'metier'; naviguerVers(CMV_ROUTE, true);
  }
}
// Départ du voyage : depuis les résultats (premier pas = la fiche choisie) ou depuis une fiche ouverte ailleurs dans l'application (le métier devient le point de départ).
function pmfDebuterVoyage(nom, depuisResultats) {
  _pmfVoyage = depuisResultats ? [{ page: 'accueil' }, { page: 'fiche', nom: nom }] : [{ page: 'fiche', nom: nom }];
  var P = pmfEtat(); P.savTous = false; P.procheTous = false;
}
// Le voyage ne vaut que tant que la page affichée est sa dernière étape : sinon (retour à l'accueil, autre module...), il est effacé.
function _pmfCoherent() {
  var T = _pmfVoyage, der = T[T.length - 1];
  if (!der) { return false; }
  var etat = cmvEtat();
  if (pageActuelle === 'fiche-metier') { return der.page === 'fiche' && typeof _ficheMetierNom !== 'undefined' && der.nom === _ficheMetierNom; }
  if (pageActuelle === CMV_ROUTE) {
    if (etat.vue === 'competence') { return der.page === 'comp' && !!pmfEtat().comp && der.t === pmfEtat().comp.t && der.i === pmfEtat().comp.i; }
    if (etat.vue === 'secteur') { return der.page === 'secteur' && der.s === pmfEtat().sec; }
    return der.page === 'accueil';
  }
  return false;
}
function _pmfAvancer(et) {
  if (!_pmfCoherent()) { _pmfVoyage = []; }
  if (!_pmfVoyage.length && typeof _ficheMetierNom !== 'undefined' && _ficheMetierNom) { _pmfVoyage = [{ page: 'fiche', nom: _ficheMetierNom }]; }
  _pmfMarquerFicheCourante();
  _pmfVoyage.push(et);
  _pmfOuvrirEtape(et, true);
}
function _pmfVersEtape(k) {
  if (k < 0 || k >= _pmfVoyage.length) { return; }
  // Reculer de plusieurs étapes d'un coup (le fil) : le même saut que « Précédent » répété.
  var recul = _pmfVoyage.length - 1 - k;
  if (recul > 0 && _pmfEntreeAJour(_pmfVoyage.length)) { history.go(-recul); return; }
  _pmfVoyage = _pmfVoyage.slice(0, k + 1);
  _pmfOuvrirEtape(_pmfVoyage[k]);
}
// « Retour » du voyage : remonte d'une étape. Rend vrai quand le voyage a pris la main ; faux quand la page d'avant est celle d'où l'on est parti (l'application fait alors son retour habituel).
function pmfRetourVoyage() {
  if (!_pmfCoherent()) { _pmfVoyage = []; return false; }
  // « Retour » = « Précédent » du navigateur (une seule piste) : la page d'avant est celle de l'entrée précédente de l'historique.
  if (_pmfVoyage.length >= 2 && _pmfEntreeAJour(_pmfVoyage.length)) { history.back(); return true; }
  if (_pmfVoyage.length > 2 || (_pmfVoyage.length === 2 && _pmfVoyage[0].page === 'fiche')) { _pmfVersEtape(_pmfVoyage.length - 2); return true; }
  if (_pmfVoyage.length === 2) {
    // Fiche ouverte depuis les résultats : retour aux résultats, qui gardent tous les choix.
    _pmfVoyage = [];
    return false;
  }
  _pmfVoyage = [];
  return false;
}
function pmfFinVoyage() { _pmfVoyage = []; }
// Appelée par naviguerVers (js/app.js) : sortir de la fiche et des pages du module met fin au voyage.
function pmfSurNavigation(route) {
  if (route !== 'fiche-metier' && route !== CMV_ROUTE) { _cmvVueOrigineFiche = null; }
  if (_pmfVoyage.length && route !== 'fiche-metier' && route !== CMV_ROUTE) { _pmfVoyage = []; }
}

/* ---------------- Pages « compétence » et « secteur » ---------------- */
function _pmfTeteDePage(D, sur, titre, phrase, boutonChoix) {
  return '<div class="bloc fiche-tete"><div class="note">' + sur + '</div><h1 class="fm-titre">' + _pmfE(titre) + '</h1><p class="mb-2">' + phrase + '</p><div class="fm-actions">' + boutonChoix + '</div></div>';
}
function _pmfRendreCompetence() {
  var D = _pmfD(), P = pmfEtat(), S = pmEtat(), t = P.comp.t, i = P.comp.i;
  var rep = pmcRepresentatifs(D, INDEX_COMPETENCES, t, i), n = rep.length, choisie = pmcEstChoisie(S, t, i);
  var h = _pmfFil() + _pmfTeteDePage(D, PMF_NOMS_TYPES[t], D[t][i].lib, pmcPluriel(n, 'métier') + (n > 1 ? ' demandent' : ' demande') + ' cette compétence.',
    '<button type="button" class="btn ' + (choisie ? 'btn-outline-secondary' : 'btn-primary') + '" data-pmf="togcomp"><i class="bi ' + (choisie ? 'bi-x-circle' : 'bi-plus-circle') + '" aria-hidden="true"></i> ' + (choisie ? 'Retirer de mes choix' : 'Ajouter à mes choix') + '</button>');
  h += '<section class="zone"><h2 class="zone-titre"><i class="bi bi-star" aria-hidden="true"></i> Les ' + Math.min(PMF_NB_TOP, n) + ' métiers où elle compte le plus <span class="zone-sous">Classés selon la place de la compétence dans la fiche du métier.</span></h2>' +
    _pmfGrille(rep.slice(0, PMF_NB_TOP).map(function (m) { return _pmfCarteSimple(D, m, ''); }).join(''));
  if (n > PMF_NB_TOP) {
    var n2 = P.compPlus;
    if (n2) { h += '<h3 class="mt-4" style="font-size:1.05rem;font-weight:800">Tous les autres métiers qui la demandent</h3>' + _pmfGrille(rep.slice(PMF_NB_TOP, PMF_NB_TOP + n2).map(function (m) { return _pmfCarteSimple(D, m, ''); }).join('')); }
    if (PMF_NB_TOP + n2 < n) { h += '<div style="text-align:center;margin-top:.8rem"><button type="button" class="btn btn-outline-secondary" data-pmf="compplus"><i class="bi bi-chevron-down" aria-hidden="true"></i> Voir aussi les autres (' + (n - PMF_NB_TOP - n2) + ')</button></div>'; }
  }
  return h + '</section>';
}
function _pmfRendreSecteur() {
  var D = _pmfD(), P = pmfEtat(), S = pmEtat(), si = P.sec, liste = [];
  D.m.forEach(function (r, i) { if (r[1] === si) { liste.push(i); } });
  var choisi = S.secteurs.indexOf(si) !== -1;
  var h = _pmfFil() + _pmfTeteDePage(D, 'Secteur', D.secteurs[si], pmcPluriel(liste.length, 'métier') + ' dans ce secteur.',
    '<button type="button" class="btn ' + (choisi ? 'btn-outline-secondary' : 'btn-primary') + '" data-pmf="togsec"><i class="bi ' + (choisi ? 'bi-x-circle' : 'bi-plus-circle') + '" aria-hidden="true"></i> ' + (choisi ? 'Retirer de mes choix' : 'Ajouter à mes choix') + '</button>');
  h += '<section class="zone">' + _pmfGrille(liste.slice(0, P.secPlus).map(function (i) { return _pmfCarteSimple(D, i, ''); }).join(''));
  if (liste.length > P.secPlus) { h += '<div style="text-align:center;margin-top:.8rem"><button type="button" class="btn btn-outline-secondary" data-pmf="secplus"><i class="bi bi-chevron-down" aria-hidden="true"></i> Voir les ' + (liste.length - P.secPlus) + ' autres métiers</button></div>'; }
  return h + '</section>' + _pmfVoyagerSecteurs(D, si);
}
function _pmfVueRendre(fonction) {
  return function () {
    if (_pmfD() && pmfEtat().comp !== undefined) { return _pmfEnveloppe(fonction()); }
    return '<div id="pmRacine" class="pm"><p class="cml-note" role="status">Chargement des métiers et des compétences…</p></div>';
  };
}
function _pmfVueCabler(etat) {
  if (_pmfD()) { return; }
  pmCharger(function (ok) { if (ok) { cmvRendre(); } });
}
function _pmfBarreRetour() {
  return { retour: function () { if (!pmfRetourVoyage()) { cmvRetourDeVoyage(); } } };
}
// Sortie du voyage vers les résultats : la page de résultats garde tous les choix.
function cmvRetourDeVoyage() { cmvEtat().vue = _cmvVueOrigineFiche || 'metier'; naviguerVers(CMV_ROUTE, true); }
cmvEnregistrerVue('competence', { titre: 'Une compétence', barre: _pmfBarreRetour, rendre: function (etat) { return pmfEtat().comp ? _pmfVueRendre(_pmfRendreCompetence)() : '<p class="cml-note">Rien à afficher.</p>'; }, cabler: _pmfVueCabler });
cmvEnregistrerVue('secteur', { titre: 'Un secteur', barre: _pmfBarreRetour, rendre: function (etat) { return pmfEtat().sec !== null ? _pmfVueRendre(_pmfRendreSecteur)() : '<p class="cml-note">Rien à afficher.</p>'; }, cabler: _pmfVueCabler });

/* ---------------- Les gestes (un seul écouteur sur la page entière) ---------------- */
function _pmfRedessinerBloc(id, html) { var z = document.getElementById(id); if (z) { var b = z.closest('#pmRacine'); if (b) { b.innerHTML = html; } } }
function _pmfRedessinerOffres(idFocus) {
  var zone = document.getElementById('pmfCandidater');
  if (zone && zone.getAttribute('data-ctx') === 'recrute') { _pmfRedessinerBloc('pmfCandidater', _pmfBlocOffresRecrute()); }
  else {
    var D = _pmfD(), idx = D ? _pmfIdxDeNom(D, _ficheMetierNom) : -1;
    if (idx < 0) { return; }
    _pmfRedessinerBloc('pmfCandidater', _pmfBlocCandidater(D, idx));
  }
  if (idFocus) { var f = document.getElementById(idFocus); if (f) { f.scrollIntoView({ block: 'nearest' }); } }
}
// Les listes déroulantes, le champ libre et la case à cocher du bloc « Candidater pour ce métier ».
function _pmfChoix(ev) {
  var el = ev.target;
  var nom = el && el.getAttribute && el.getAttribute('data-pmf-sel');
  if (!nom || !_pmfD() || (ev.type === 'input' && nom !== 'libre')) { return; }
  var fo = _pmfOffres();
  if (nom === 'libre') {
    fo.libre = el.value; fo.pret = false;
    // Pendant la frappe : on ne redessine pas (le champ garderait mal le curseur), on met seulement le bouton à jour.
    var bp = document.querySelector('#pmfCandidater [data-pmf="prep"]'); if (bp) { bp.disabled = !(_pmfOffresPret(fo) && _pmfMetiersCochesOk()); }
    var dm = document.querySelector('#pmfCandidater .demande-boite'); if (dm) { dm.parentNode.removeChild(dm); }
    return;
  }
  else if (nom === 'dep') { fo.dep = el.value; fo.terr = ''; fo.voisins = []; fo.pret = false; }
  else if (nom === 'terr') { fo.terr = el.value; fo.voisins = el.value ? PMC_TERRITOIRES[fo.dep].zones[el.value].slice() : []; fo.pret = false; }
  else if (nom === 'inclure') { fo.inclure = !!el.checked; fo.pret = false; }
  else if (nom === 'metier') {
    var grp = el.getAttribute('data-grp'), nm = el.getAttribute('data-nom');
    fo.coches = fo.coches || {};
    if (el.checked && _pmfNbCoches() >= PMF_MAX_METIERS) { el.checked = false; return; }
    fo.coches[grp + '|' + nm] = !!el.checked; fo.pret = false;
    _pmfRedessinerOffres();
    var cases = document.querySelectorAll('#pmfCandidater [data-pmf-sel="metier"]');
    for (var q = 0; q < cases.length; q++) { if (cases[q].getAttribute('data-grp') === grp && cases[q].getAttribute('data-nom') === nm) { cases[q].focus(); break; } }
    return;
  }
  _pmfRedessinerOffres();
  var apres = document.querySelector('[data-pmf-sel="' + nom + '"]');
  if (apres && nom !== 'inclure') { apres.focus(); }
}
var PMF_ACTIONS = {
  fiche: function (v) { var D = _pmfD(); _pmfAvancer({ page: 'fiche', nom: D.m[+v][0] }); },
  comp: function (v) { var p = v.split(':'); _pmfAvancer({ page: 'comp', t: p[0], i: +p[1] }); },
  sect: function (v) { _pmfAvancer({ page: 'secteur', s: +v }); },
  // Depuis la pastille de secteur d'une carte des résultats : le voyage part des résultats.
  sectres: function (v) { _pmfVoyage = [{ page: 'accueil' }]; _pmfAvancer({ page: 'secteur', s: +v }); },
  fil: function (v) { _pmfVersEtape(+v); },
  retour: function () { if (!pmfRetourVoyage()) { cmvRetourDeVoyage(); } },
  savtous: function () {
    var P = pmfEtat(); P.savTous = !P.savTous;
    var D = _pmfD(), idx = _pmfIdxDeNom(D, _ficheMetierNom);
    if (idx >= 0) { _pmfRedessinerBloc('pmfCompetences', _pmfBlocCompetences(D, idx)); }
  },
  procheplus: function () {
    var P = pmfEtat(); P.procheTous = !P.procheTous;
    var D = _pmfD(), idx = _pmfIdxDeNom(D, _ficheMetierNom);
    if (idx >= 0) { _pmfRedessinerBloc('pmfProches', _pmfSectionProches(D, idx)); }
  },
  // Candidater pour ce métier : départements proches, préparation et copie de la demande, passage au module Candidater.
  vo: function (c) {
    var fo = _pmfOffres(), k = fo.voisins.indexOf(c);
    if (k === -1) { fo.voisins.push(c); } else { fo.voisins.splice(k, 1); }
    fo.pret = false; _pmfRedessinerOffres();
  },
  // Changer de rubrique (onglet) ; tout décocher.
  metonglet: function (v) { _pmfOffres().ongletMetiers = v; _pmfRedessinerOffres(); },
  metvider: function () { var fo = _pmfOffres(); fo.coches = {}; fo.pret = false; _pmfRedessinerOffres(); },
  prep: function () {
    var fo = _pmfOffres();
    if (_pmfOffresPret(fo) && _pmfMetiersCochesOk()) {
      fo.pret = true; _pmfRedessinerOffres('pmfDemande');
      var z = document.getElementById('pmfCandidater');
      if (typeof trackEvenement === 'function') { trackEvenement('comprendre_metiers_offres_preparees', { chemin: (z && z.getAttribute('data-ctx') === 'recrute') ? 'recrute' : 'fiche' }); }
    }
  },
  copier: function (v, el) { var z = document.getElementById('pmfDemande'); if (z) { copierTexteVersPressePapier(z.value, el); } },
  copierouvrir: function (id) {
    var z = document.getElementById('pmfDemande'), A = _pmfAssistant(id);
    if (!z || !A) { return; }
    _pmfCopierPuisOuvrir(z.value, z, function () { var w = window.open(A.url, '_blank'); if (w) { w.opener = null; } _pmfDireOuverture(A, !w); });
  },
  cand: function () { if (typeof ficheMetierCandidater === 'function') { ficheMetierCandidater(); } },
  compplus: function () { var P = pmfEtat(); P.compPlus = P.compPlus ? P.compPlus + 24 : 24; cmvRendre(); },
  secplus: function () { var P = pmfEtat(); P.secPlus += 24; cmvRendre(); },
  togcomp: function () { var P = pmfEtat(), S = pmEtat(), t = P.comp.t, i = P.comp.i; _pmTogComp(S, t + ':' + i); cmvRendre(); },
  togsec: function () { var P = pmfEtat(), S = pmEtat(), s = P.sec; S.secteurs = S.secteurs.indexOf(s) === -1 ? S.secteurs.concat([s]) : S.secteurs.filter(function (x) { return x !== s; }); cmvRendre(); },
  // « Utiliser ces compétences comme point de départ » : toutes les compétences du métier rejoignent les choix, puis les résultats s'ouvrent.
  depart: function (v) {
    var D = _pmfD(), r = D.m[+v], S = pmEtat();
    PMC_TYPES.forEach(function (t) { r[PMC_RANG[t]].forEach(function (i) { if (!pmcEstChoisie(S, t, i)) { S.comp.push({ t: t, i: i }); } }); });
    S.plus = PM_NB_PREMIERS; S.ecran = 'choix'; S.parcourir = false;
    _pmfVoyage = [];
    cmvEtat().vue = 'metier';
    naviguerVers(CMV_ROUTE);
  }
};
function _pmfClic(ev) {
  var el = ev.target.closest && ev.target.closest('[data-pmf]');
  if (!el || el.disabled) { return; }
  var fn = PMF_ACTIONS[el.getAttribute('data-pmf')];
  if (typeof fn !== 'function' || !_pmfD()) { return; }
  ev.preventDefault();
  fn(el.getAttribute('data-v'), el);
}
if (typeof document !== 'undefined') { document.addEventListener('click', _pmfClic); document.addEventListener('change', _pmfChoix); document.addEventListener('input', _pmfChoix); }
