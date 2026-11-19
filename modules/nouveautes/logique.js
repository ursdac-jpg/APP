/* ============================================================
   Module « Nouveautés » : logique pure (aucun accès au DOM, testée par `npm test`).
   Chantier : docs/CHANTIER_NOUVEAUTES_2026-10-26.md ; maquette : docs/MAQUETTE_NOUVEAUTES_2026-10-26.html.
   Les nouveautés elles-mêmes sont des DONNEES (data/nouveautes.js) : on y ajoute une ligne à chaque ajout visible par les personnes.
   ============================================================ */

// Une nouveauté porte l'étiquette « Nouveau » pendant ce nombre de jours après sa date.
var NV_JOURS_NOUVEAU = 7;
var NV_MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function _nvDateDepuisIso(iso) {
  var p = String(iso || '').split('-');
  if (p.length !== 3) { return null; }
  var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  return isNaN(d.getTime()) ? null : d;
}
// Nombre de jours entre la date de la nouveauté (AAAA-MM-JJ) et `auj` (un Date) ; null si la date est illisible.
function nvAgeJours(iso, auj) {
  var d = _nvDateDepuisIso(iso);
  if (!d) { return null; }
  var ref = new Date(auj.getFullYear(), auj.getMonth(), auj.getDate());
  return Math.round((ref - d) / 86400000);
}
function nvEstNouveau(n, auj) {
  var a = nvAgeJours(n && n.date, auj);
  return a !== null && a >= 0 && a < NV_JOURS_NOUVEAU;   // 7 jours écoulés : plus nouveau
}
function nvCompterNouveaux(liste, auj) { return (liste || []).filter(function (n) { return nvEstNouveau(n, auj); }).length; }
// Dates affichées en français (jamais « 2026-10-26 » à l'écran) : « 26 octobre 2026 », « 1er novembre 2026 ».
function nvDateFr(iso) {
  var d = _nvDateDepuisIso(iso);
  if (!d) { return ''; }
  return (d.getDate() === 1 ? '1er' : String(d.getDate())) + ' ' + NV_MOIS[d.getMonth()] + ' ' + d.getFullYear();
}
function nvMoisFr(iso) {
  var d = _nvDateDepuisIso(iso);
  return d ? NV_MOIS[d.getMonth()] + ' ' + d.getFullYear() : '';
}
// Les nouveautés visibles (une date lisible, pas dans le futur), du plus récent au plus ancien, rangées par mois : [{ cle: '2026-10', mois: 'octobre 2026', items: [...] }].
function nvGrouperParMois(liste, auj) {
  var valides = (liste || []).filter(function (n) { var a = nvAgeJours(n && n.date, auj); return a !== null && a >= 0; });
  valides = valides.map(function (n, i) { return { n: n, i: i }; }).sort(function (x, y) {
    return x.n.date < y.n.date ? 1 : (x.n.date > y.n.date ? -1 : x.i - y.i);   // à date égale, l'ordre du fichier est gardé
  }).map(function (x) { return x.n; });
  var groupes = [];
  valides.forEach(function (n) {
    var cle = n.date.slice(0, 7), g = groupes[groupes.length - 1];
    if (!g || g.cle !== cle) { g = { cle: cle, mois: nvMoisFr(n.date), items: [] }; groupes.push(g); }
    g.items.push(n);
  });
  return groupes;
}

// Les quatre entrées de la page, dans l'ordre où elles s'affichent (consigne 201, puis consigne 440) : 'appli' (nouveautés de l'application), 'regles' (changements dans les règles),
// 'chiffres' (les chiffres clés qui bougent : prix, salaires, emploi), 'corriges' (problèmes corrigés).
var NV_ENTREES = ['appli', 'regles', 'chiffres', 'corriges'];
function nvEntreeValide(cle) { return NV_ENTREES.indexOf(cle) !== -1 ? cle : 'appli'; }

// Origine d'un problème corrigé : 'personne' (signalé par un utilisateur) ou 'nous' (repéré par nous, aussi le défaut). Les mots affichés vont avec.
function nvOrigine(p) { return p && p.origine === 'personne' ? 'personne' : 'nous'; }
// Seulement « Signalé par un utilisateur » ; un défaut repéré par nous n'affiche rien (décision de Denis, 10/11/2026 : pas prétentieux).
function nvLibelleOrigine(p) { return nvOrigine(p) === 'personne' ? 'Signalé par un utilisateur' : ''; }
function nvLibelleAvant(p) { return nvOrigine(p) === 'personne' ? 'Ce qui avait été signalé' : 'Ce qui avait été constaté'; }

// Nombre affiché sur la pastille du bouton : les nombres des quatre entrées additionnés (un nombre inconnu ou négatif compte zéro ; nChiffres est facultatif).
function nvTotalPastille(nAppli, nRegles, nCorriges, nChiffres) {
  return [nAppli, nRegles, nCorriges, nChiffres].reduce(function (s, n) { return s + (typeof n === 'number' && n > 0 ? n : 0); }, 0);
}

/* ------------------------------------------------------------
   Mémoire du « déjà vu » (consigne 418, décision de Denis 16/11/2026) : ELLE REMPLACE la mémoire par rubrique entière qui ne durait que la session (consigne 332 ter).
   Elle se garde d'une visite à l'autre dans l'appareil (pas de compte), élément par élément : un élément vu n'est plus signalé, un élément ajouté depuis l'est.
   Forme : { v: 2, depart: 'AAAA-MM-JJ', vus: { appli: { clé: 1 }, regles: { … }, chiffres: { … }, corriges: { … } } }.
   `depart` : règle du premier passage. Tout ce qui date de ce jour ou d'avant est considéré comme déjà vu (sinon la pastille afficherait toute l'histoire à la première visite) ;
   il vaut le jour du premier passage moins 7 jours, comme l'étiquette « Nouveau ». Ainsi on ne mémorise que les éléments plus récents.
   Un élément est { date: 'AAAA-MM-JJ', titre, [type: 'fiche' | 'changement', id] } ; sa clé change si sa date change (une fiche remise à jour redevient « pas encore vue »).
   ------------------------------------------------------------ */
var NV_CLE_STOCKAGE = 'aps_nouveautes_vues_v2';

function nvIsoDe(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function nvIsoMoinsJours(iso, n) {
  var d = _nvDateDepuisIso(iso);
  if (!d) { return ''; }
  d.setDate(d.getDate() - n);
  return nvIsoDe(d);
}
// Mémoire vierge : le jour du premier passage (ou une remise à neuf) fixe le départ.
function nvMemoireNeuve(auj) {
  var vus = {};
  NV_ENTREES.forEach(function (c) { vus[c] = {}; });
  return { v: 2, depart: nvIsoMoinsJours(nvIsoDe(auj), NV_JOURS_NOUVEAU), vus: vus };
}
// Relit la mémoire enregistrée (texte JSON) ; tout ce qui n'est pas clair = mémoire vierge (la personne revoit les ajouts récents, jamais d'erreur).
function nvLireMemoire(texte, auj) {
  var obj = null;
  if (typeof texte === 'string' && texte) { try { obj = JSON.parse(texte); } catch (e) { obj = null; } }
  if (!obj || typeof obj !== 'object' || obj.v !== 2 || !/^\d{4}-\d{2}-\d{2}$/.test(obj.depart || '') || !obj.vus || typeof obj.vus !== 'object') { return nvMemoireNeuve(auj); }
  var m = { v: 2, depart: obj.depart, vus: {} };
  NV_ENTREES.forEach(function (c) {
    var src = obj.vus[c], dst = {};
    if (src && typeof src === 'object') { Object.keys(src).forEach(function (k) { if (src[k] === 1) { dst[k] = 1; } }); }
    m.vus[c] = dst;
  });
  return m;
}
function nvEcrireMemoire(m) { return JSON.stringify(m); }

function _nvNormaliser(t) { return String(t === undefined || t === null ? '' : t).toLowerCase().replace(/\s+/g, ' ').trim(); }
// Clé d'un élément : fiche = identifiant + date ; changement officiel, nouveauté ou correction = titre + date.
function nvCleElement(entree, e) {
  var date = e && e.date ? e.date : '';
  if (entree === 'regles' && e && e.type === 'fiche') { return 'f|' + _nvNormaliser(e.id) + '|' + date; }
  return (entree === 'regles' ? 'c|' : '') + _nvNormaliser(e && e.titre) + '|' + date;
}
function nvEstVu(m, entree, e) {
  if (e && e.date && e.date <= m.depart) { return true; }   // règle du premier passage
  return !!(m.vus[entree] && m.vus[entree][nvCleElement(entree, e)]);
}
// Les éléments de la liste que la personne n'a pas encore vus (les dates futures comptent : une nouveauté annoncée est à signaler).
function nvNonVus(m, entree, liste) { return (liste || []).filter(function (e) { return !nvEstVu(m, entree, e); }); }
// Nouvelle mémoire où tous les éléments de la liste sont vus (la mémoire donnée n'est pas modifiée). Les éléments d'avant le départ n'ont pas besoin d'être gardés.
function nvMarquerVus(m, entree, liste) {
  var copie = nvLireMemoire(nvEcrireMemoire(m), new Date());
  (liste || []).forEach(function (e) { if (e && e.date && e.date > copie.depart) { copie.vus[entree][nvCleElement(entree, e)] = 1; } });
  return copie;
}
// Retire de la mémoire les clés des éléments qui n'existent plus ; à n'appeler qu'avec la liste COMPLÈTE de l'entrée.
function nvNettoyer(m, entree, liste) {
  var copie = nvLireMemoire(nvEcrireMemoire(m), new Date()), vivantes = {};
  (liste || []).forEach(function (e) { vivantes[nvCleElement(entree, e)] = 1; });
  Object.keys(copie.vus[entree]).forEach(function (k) { if (!vivantes[k]) { delete copie.vus[entree][k]; } });
  return copie;
}

/* ------------------------------------------------------------
   « Droits et règles » : cadre d'un changement officiel et filtres (consigne 418, lot 3, table validée par Denis le 16/11/2026).
   Les fiches ont un rayon (21 « cadres » de Comprendre le cadre) ; les changements officiels ont un « domaine » écrit à la main dans les fichiers de balayage.
   Cette table range chaque domaine dans UN cadre ; deux cadres n'existent que pour ce filtre (« region », « autres »). Un test échoue si un domaine des fichiers n'y est pas.
   ------------------------------------------------------------ */
var NV_CADRES_A_PART = { region: 'Près de chez vous (région, département)', autres: 'Autres changements' };
// [début du nom du domaine, sans accents ni majuscules, cadre]
var NV_DOMAINE_CADRE = [
  ['emploi et contrats de travail', 'emploi'],
  ['formation, cpf', 'former'],
  ['handicap et emploi', 'handicap'],
  ['logement et aides au logement', 'logement'],
  ['acces aux soins', 'sante'],
  ['sejour et droit au travail', 'etranger'],
  ['mobilite et aides', 'mobilite'],
  ['accompagnement des jeunes', 'jeunes'],
  ['retraite et fin de carriere', 'seniors'],
  ["rsa, prime d'activite", 'budget'],
  ["insertion par l'activite economique", 'accompagnement'],
  ['assurance chomage et france travail', 'accompagnement'],
  ['retraite et parentalite', 'seniors'],
  ['propre a la region', 'region'],
  ['annonce, pas encore en vigueur', 'autres']
];
function nvSansAccents(t) { return String(t === undefined || t === null ? '' : t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/’/g, "'").replace(/\s+/g, ' ').trim(); }
// Cadre d'un domaine de changement officiel ; un domaine inconnu va dans « autres » (le test des fichiers empêche d'en laisser un sans le ranger).
function nvCadreDuDomaine(domaine) {
  var d = nvSansAccents(domaine);
  for (var i = 0; i < NV_DOMAINE_CADRE.length; i++) { if (d.indexOf(NV_DOMAINE_CADRE[i][0]) === 0) { return NV_DOMAINE_CADRE[i][1]; } }
  return 'autres';
}
function nvDomaineConnu(domaine) {
  var d = nvSansAccents(domaine);
  return NV_DOMAINE_CADRE.some(function (l) { return d.indexOf(l[0]) === 0; });
}

function nvJoursEntreIso(debut, fin) {
  var a = String(debut).split('-'), b = String(fin).split('-');
  return Math.round((Date.UTC(+b[0], +b[1] - 1, +b[2]) - Date.UTC(+a[0], +a[1] - 1, +a[2])) / 86400000);
}
function nvReglesAvenir(el, aujIso) { return !!el.date && el.date > aujIso; }
// Période : 'avenir', '7', '30', '60' (jours écoulés, sans l'à venir), 'anciens' (plus de 60 jours), 'tout'.
function nvReglesDansPeriode(el, p, aujIso) {
  if (p === 'tout' || !p) { return true; }
  if (p === 'avenir') { return nvReglesAvenir(el, aujIso); }
  var j = nvJoursEntreIso(el.date, aujIso);
  if (p === 'anciens') { return j >= 60; }
  return j >= 0 && j < Number(p);   // « 7 derniers jours » = aujourd'hui et les 6 jours d'avant, comme l'étiquette « Nouveau »
}
// Texte cherché : titre + nom du cadre + genre, sans accents ni majuscules.
function nvReglesTexteOk(el, q, libelles) {
  if (!q) { return true; }
  var base = nvSansAccents(el.titre + ' ' + (libelles.cadre[el.cadre] || '') + ' ' + (libelles.genre[el.genre] || ''));
  return nvSansAccents(q).split(' ').every(function (mot) { return base.indexOf(mot) !== -1; });
}
/* Filtre la liste de « Droits et règles ». f = { montrer: 'tout' | 'nonvus', genre: '*' | 'nouvelle' | 'maj' | 'officiel', periode, date: '' | 'AAAA-MM-JJ' (un jour précis, prioritaire sur la période), cadre: '*' | clé, q }.
   ctx = { aujIso, estNeuf(el), libelles: { cadre: {clé: nom}, genre: {clé: nom} } }. `sauf` = 'genre' | 'cadre' | 'periode' : ne pas appliquer ce filtre-là (pour compter ses boutons).
   Au départ tout est affiché (consigne 420) ; « pas encore vu » ne garde que ce qui est nouveau pour la personne (consigne 422 : un clic sur « Nouveau » montre seulement ce qui est nouveau). Tri : l'à venir d'abord (le plus proche en premier), puis du plus récent au plus ancien. */
function nvReglesFiltrer(liste, f, ctx, sauf) {
  var out = (liste || []).filter(function (el) {
    if (f.montrer === 'nonvus' && !ctx.estNeuf(el)) { return false; }
    if (!nvReglesTexteOk(el, f.q, ctx.libelles)) { return false; }
    // Un jour précis (clic sur la date d'une carte, consigne 422) remplace la période : c'est l'un ou l'autre.
    if (sauf !== 'periode') {
      if (f.date) { if (el.date !== f.date) { return false; } }
      else if (!nvReglesDansPeriode(el, f.periode, ctx.aujIso)) { return false; }
    }
    if (sauf !== 'genre' && f.genre && f.genre !== '*' && el.genre !== f.genre) { return false; }
    if (sauf !== 'cadre' && f.cadre && f.cadre !== '*' && el.cadre !== f.cadre) { return false; }
    return true;
  });
  return out.sort(function (a, b) {
    var aa = nvReglesAvenir(a, ctx.aujIso), ab = nvReglesAvenir(b, ctx.aujIso);
    if (aa !== ab) { return aa ? -1 : 1; }
    if (a.date === b.date) { return 0; }
    return aa ? (a.date < b.date ? -1 : 1) : (a.date < b.date ? 1 : -1);
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { nvMemoireNeuve: nvMemoireNeuve, nvLireMemoire: nvLireMemoire, nvEcrireMemoire: nvEcrireMemoire, nvCleElement: nvCleElement, nvEstVu: nvEstVu, nvNonVus: nvNonVus, nvMarquerVus: nvMarquerVus, nvNettoyer: nvNettoyer, nvIsoMoinsJours: nvIsoMoinsJours, NV_CLE_STOCKAGE: NV_CLE_STOCKAGE, NV_JOURS_NOUVEAU: NV_JOURS_NOUVEAU, nvAgeJours: nvAgeJours, nvEstNouveau: nvEstNouveau, nvCompterNouveaux: nvCompterNouveaux, nvDateFr: nvDateFr, nvMoisFr: nvMoisFr, nvGrouperParMois: nvGrouperParMois,
    NV_ENTREES: NV_ENTREES, nvEntreeValide: nvEntreeValide, nvOrigine: nvOrigine, nvLibelleOrigine: nvLibelleOrigine, nvLibelleAvant: nvLibelleAvant, nvTotalPastille: nvTotalPastille,
    NV_DOMAINE_CADRE: NV_DOMAINE_CADRE, NV_CADRES_A_PART: NV_CADRES_A_PART, nvCadreDuDomaine: nvCadreDuDomaine, nvDomaineConnu: nvDomaineConnu, nvSansAccents: nvSansAccents, nvReglesFiltrer: nvReglesFiltrer, nvReglesDansPeriode: nvReglesDansPeriode, nvReglesAvenir: nvReglesAvenir, nvJoursEntreIso: nvJoursEntreIso };
}
