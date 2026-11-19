/* ============================================================
   Module « Explorer les métiers » : entrée 1, « Par un métier » : CALCUL (aucun DOM, aucun stockage). Testé par tests/parMetierCalcul.test.js.
   Charge après parMetierDonnees.js. Reprend le calcul de la maquette validée par Denis (docs/MAQUETTE_PAR_UN_METIER_ENRICHI_EXPLORER_LES_METIERS_2026-11-17.html),
   sur les compétences COMPLÈTES du ROME (index complet) au lieu des listes courtes.

   Règles :
   - le pourcentage d'un métier part de ce que la personne a choisi : compétences (savoir-être, savoir-faire, savoirs : pour chaque type, la racine carrée de
     « part de ce que le métier demande qui est retrouvée » fois « part des choix de la personne qui est retrouvée », puis la moyenne des types), niveau d'accès,
     secteur ; poids par défaut 60 / 25 / 10 ; une condition de travail facile ou difficile ajoute ou retire un demi-point (jamais un barrage) ;
   - « ce que le métier demande » est plafonné (savoir-être 4, savoir-faire 6, savoirs 6) : une fiche qui cite 74 savoirs ne doit pas rendre invisible
     chacun d'eux ; on garde ainsi l'ordre de grandeur validé sur les listes courtes ;
   - niveau d'accès plus haut que celui de la personne : moins 45 points par niveau d'écart (jamais exclu) ; niveau non précisé : 60 % ; autre secteur : 25 % ;
   - les conditions de travail facile / difficile passent par UNE seule fonction (pmcEffetConditions), partagée par les deux chemins du module ;
   - jamais de « ce qui manque » : la partie vide d'un pourcentage n'est jamais détaillée (consignes 448 et 451).
   ============================================================ */

var PMC_TYPES = ['se', 'sf', 'sv'];                                    // ordre voulu par Denis : savoir-être, savoir-faire, savoirs
var PMC_RANG = { se: 4, sf: 3, sv: 5 };                                // colonne de la ligne d'un métier
var PMC_NOMS_TYPES = { se: 'Savoir-être', sf: 'Savoir-faire', sv: 'Savoirs' };
var PMC_PLAFOND_RAPPEL = { se: 4, sf: 6, sv: 6 };
var PMC_REGLAGES = { poids: { comp: 60, niv: 25, sec: 30 }, unite: 0.5, seuil: 40, niveauInconnu: 0.6, secteurAutre: 0.1, perteParNiveau: 0.45 };
var PMC_NIVEAUX = [[2, 'Sans diplôme'], [3, 'CAP ou BEP'], [4, 'Bac'], [5, 'Bac + 2'], [6, 'Bac + 3'], [7, 'Bac + 5'], [8, 'Études longues']];
var PMC_LIB_NIVEAU = { 0: 'Niveau d’accès non précisé', 2: 'Sans diplôme', 3: 'CAP ou BEP', 4: 'Bac', 5: 'Bac + 2', 6: 'Bac + 3', 7: 'Bac + 5', 8: 'Études longues' };
// Mots que la personne peut taper pour un niveau d'études.
var PMC_ALIAS_NIVEAU = [[2, ['sans diplome', 'aucun diplome', 'brevet']], [3, ['cap', 'bep', 'niveau 3']], [4, ['bac', 'baccalaureat', 'bac pro', 'niveau 4']],
  [5, ['bts', 'dut', 'but', 'bac+2', 'bac 2', 'niveau 5']], [6, ['licence', 'bac+3', 'bac 3', 'niveau 6']],
  [7, ['master', 'bac+5', 'bac 5', 'ingenieur', 'niveau 7']], [8, ['doctorat', 'bac+8', 'etudes longues', 'niveau 8']]];

// Territoires : les zones d'emploi de « Comprendre les chiffres » (modules/comprendre-les-chiffres/contenu/zones-emploi.md), avec les départements qui les
// touchent, du PLUS PROCHE au plus éloigné de la zone (validé par Denis le 18/11/2026).
var PMC_NOMS_DEPARTEMENTS = { '16': 'Charente (16)', '19': 'Corrèze (19)', '23': 'Creuse (23)', '24': 'Dordogne (24)', '33': 'Gironde (33)', '46': 'Lot (46)', '47': 'Lot-et-Garonne (47)', '86': 'Vienne (86)', '87': 'Haute-Vienne (87)' };
var PMC_TERRITOIRES = {
  '24': { nom: 'Dordogne (24)', zones: { 'Bergerac': ['47', '33'], 'Périgueux': ['16', '87', '19', '33'], 'Sarlat-la-Canéda': ['46', '19', '47'] } },
  '87': { nom: 'Haute-Vienne (87)', zones: { 'Limoges': ['19', '23', '24', '16'], 'Saint-Junien': ['16', '24', '86', '23'] } }
};
function pmcDepartementsVoisins(departement, zone) {
  var d = PMC_TERRITOIRES[departement];
  return d && d.zones[zone] ? d.zones[zone].slice() : [];
}

// La demande d'offres à coller dans l'assistant en ligne (maquette validée du 17/11/2026, lignes 607 à 629). Rien n'est repris en retour dans l'application.
// o : { metier, dateTexte, departement (nom), zone, voisins (noms, du plus proche au plus éloigné), competences (libellés), niveau (libellé) }
function pmcMessageOffres(o) {
  var voisins = (o.voisins || []).filter(Boolean), L = [];
  // Un seul métier (fiche d'un métier) ou une liste de métiers (chemin « Les emplois en demande » : les métiers qui recrutent le plus dans le département).
  var unSeul = !!o.metier, ceMetier = unSeul ? 'ce métier' : 'ces métiers';
  L.push('Nous sommes le ' + o.dateTexte + '. Je cherche des offres d’emploi en ce moment ' + (unSeul ? 'pour le métier suivant : ' + o.metier : 'dans les métiers suivants' + ((o.metiers || []).length ? ' : ' + o.metiers.join(' ; ') : '')) + '. Utilise la recherche sur Internet. Cherche ' + (unSeul ? 'ce métier' : 'ces métiers') + ' sous tous ' + (unSeul ? 'ses' : 'leurs') + ' intitulés, pas seulement sous ' + (unSeul ? 'le nom écrit ici' : 'les noms écrits ici') + ' : autres appellations, noms usuels, anciens noms. Pour chaque offre, dis-moi sous quel intitulé elle est publiée.');
  L.push('');
  L.push('Où chercher : d’abord dans mon territoire' + (o.zone ? ' (' + o.zone + ', ' + o.departement + ')' : ', dans le département suivant : ' + o.departement) + '.' +
    (voisins.length ? ' Ensuite, dans les départements qui touchent ce territoire, du plus proche au plus éloigné de chez moi : ' + voisins.join(', ') + '. Écris toujours clairement dans quel département et quelle ville se trouve chaque offre, et présente d’abord les offres de mon territoire.' : ''));
  if (o.competences && o.competences.length) { L.push(''); L.push('Voici ce que je sais déjà faire, pour repérer les offres qui me correspondent : ' + o.competences.slice(0, 40).join(', ') + '.'); }
  if (o.niveau) { L.push('Mon niveau d’études : ' + o.niveau + '.'); }
  if (o.niveau && o.voieFormation) { L.push('Si l’un de ces métiers demande un niveau plus élevé que le mien, dis-le et indique aussi les formations qui y mènent.'); }
  L.push('');
  L.push('Réponds en français simple, clair et facile à comprendre, sans jargon, pour que tout le monde puisse suivre : explique brièvement les sigles et les mots techniques.');
  L.push('');
  L.push('Donne le plus d’informations utiles possible :');
  L.push('- D’ABORD, les offres actuellement publiées pour ' + ceMetier + ', avec leurs liens et leurs dates. Si une offre semble récente mais que sa date ou son état n’est pas certain, ne l’écarte pas : place-la dans une petite liste « Offres à vérifier » en disant ce qui manque ;');
  L.push('- ENSUITE, si tu n’as trouvé aucune offre, ou en complément, les structures du territoire à contacter : leur nom, leur ville et comment candidater (formulaire, adresse, lien) ;');
  L.push('- les autres appellations ' + (unSeul ? 'du métier' : 'de ces métiers') + ' réellement vues dans des annonces ;');
  L.push('- à part, dans une petite liste « Métiers voisins », les offres de métiers très proches que tu as croisées en cherchant, sans choisir à ma place ;');
  L.push('- ce qui est demandé en général pour ' + ceMetier + ' (diplôme, habilitation, permis), si tu le trouves, avec la source.');
  L.push('');
  L.push('Sources : privilégie France Travail, les sites des employeurs et des collectivités, l’Onisep, les centres de formation. Indique pour chaque information sa source et sa date. Ne compte jamais une offre dont l’année est inconnue ou dont la date est dépassée. Si tu ne trouves pas, écris « non trouvé » : n’invente rien.');
  L.push('Tu peux me proposer des pistes de réflexion, mais ne choisis pas à ma place.');
  L.push('Présentation : un petit récapitulatif simple au début, puis les offres, puis les structures à contacter. Termine par une courte rubrique sur les limites de la recherche : ce que tu n’as pas pu vérifier. Réponds en français.');
  return L.join('\n');
}

function pmcEtatInitial() {
  return { q: '', comp: [], niveau: 0, secteurs: [], dif: [], fac: [], panneau: null, plus: 12, parcourir: false, w: { comp: 60, niv: 25, sec: 30 }, unite: 0.5, seuil: 40 };
}
function pmcNbChoix(S) { return S.comp.length + (S.niveau ? 1 : 0) + S.secteurs.length + S.dif.length + S.fac.length; }
function pmcPluriel(n, s, p) { return n + ' ' + (n > 1 ? (p || s + 's') : s); }
function pmcEstChoisie(S, t, i) { return S.comp.some(function (c) { return c.t === t && c.i === i; }); }

// UNE seule fonction pour l'effet des conditions de travail, partagée par « Par un métier » et « Par ce que vous aimez faire » (consigne 453).
// ids : conditions du métier ; faciles, difficiles : choix de la personne ; unite : points par condition (0,5 par défaut). Jamais un barrage.
function pmcEffetConditions(ids, faciles, difficiles, unite) {
  var cf = (faciles || []).filter(function (k) { return ids.indexOf(k) !== -1; });
  var cd = (difficiles || []).filter(function (k) { return ids.indexOf(k) !== -1; });
  var u = unite === undefined ? PMC_REGLAGES.unite : unite;
  return { cf: cf, cd: cd, points: u * (cf.length - cd.length) };
}

// Applique cette même fonction à la liste du chemin « Par ce que vous aimez faire » (liste de { score, rome, ... }, déjà classée) :
// ajoute les points à chaque score (entre 0 et 100), puis reclasse du plus haut au plus bas en gardant l'ordre d'origine à égalité. Sans choix, la liste est rendue telle quelle.
// idsDe(m) : les conditions du métier ; chaque élément rendu garde son score d'origine dans scoreSansConditions.
function pmcAjusterListeConditions(liste, faciles, difficiles, idsDe, unite) {
  if (!(faciles && faciles.length) && !(difficiles && difficiles.length)) { return liste; }
  return liste.map(function (m, rang) {
    var eff = pmcEffetConditions(idsDe(m) || [], faciles, difficiles, unite);
    var copie = {};
    Object.keys(m).forEach(function (k) { copie[k] = m[k]; });
    copie.scoreSansConditions = m.score;
    copie.score = Math.max(0, Math.min(100, (m.score || 0) + eff.points));
    copie.conditionsFaciles = eff.cf; copie.conditionsDifficiles = eff.cd;
    copie._rang = rang;
    return copie;
  }).sort(function (a, b) { return (b.score - a.score) || (a._rang - b._rang); }).map(function (m) { delete m._rang; return m; });
}

/* ---------------- Le pourcentage d'un métier ---------------- */
function pmcScorer(D, S, r) {
  var parts = [], poids = [], retrouvees = 0, tcomp = [], coeur = 0;
  PMC_TYPES.forEach(function (t) {
    var choisies = S.comp.filter(function (c) { return c.t === t; });
    if (!choisies.length) { return; }
    var fiche = r[PMC_RANG[t]], n = 0;
    choisies.forEach(function (c) {
      if (fiche.indexOf(c.i) !== -1) { n++; if (r.coeur[t] && r.coeur[t][c.i]) { coeur++; } }
    });
    retrouvees += n;
    var attendu = Math.min(fiche.length, PMC_PLAFOND_RAPPEL[t]);
    var rappel = attendu ? Math.min(1, n / attendu) : 0, precision = n / choisies.length;
    tcomp.push(Math.sqrt(rappel * precision));
  });
  if (tcomp.length) { parts.push(tcomp.reduce(function (a, b) { return a + b; }, 0) / tcomp.length); poids.push(S.w.comp); }
  if (S.niveau) {
    var sn = r[2] === 0 ? PMC_REGLAGES.niveauInconnu : (r[2] <= S.niveau ? 1 : Math.max(0, 1 - PMC_REGLAGES.perteParNiveau * (r[2] - S.niveau)));
    parts.push(sn); poids.push(S.w.niv);
  }
  if (S.secteurs.length) { parts.push(S.secteurs.indexOf(r[1]) !== -1 ? 1 : PMC_REGLAGES.secteurAutre); poids.push(S.w.sec); }
  var base = 50;
  if (parts.length) { var tot = 0, ps = 0; parts.forEach(function (p, k) { tot += p * poids[k]; ps += poids[k]; }); base = ps ? 100 * tot / ps : 50; }
  var eff = pmcEffetConditions(r[6], S.fac, S.dif, S.unite);
  var pct = Math.max(0, Math.min(100, base + eff.points));
  return { pct: Math.round(pct), retrouvees: retrouvees, cd: eff.cd, cf: eff.cf, coeur: coeur };
}
// Tous les métiers, classés ; « retenus » = ceux qui atteignent le seuil (ou tous quand il n'y a aucun choix).
function pmcCalculer(D, S) {
  var avec = pmcNbChoix(S) > 0, out = [];
  D.m.forEach(function (r, idx) { out.push({ i: idx, sc: pmcScorer(D, S, r) }); });
  if (avec) { out.sort(function (a, b) { return b.sc.pct - a.sc.pct || b.sc.coeur - a.sc.coeur || a.i - b.i; }); }
  return { tous: out, avec: avec, retenus: avec ? out.filter(function (o) { return o.sc.pct >= S.seuil; }) : out };
}

/* ---------------- Métiers proches, compétences en commun, métiers du même secteur ---------------- */
function pmcSimil(D, a, b) {
  var ra = D.m[a], rb = D.m[b], parts = [];
  PMC_TYPES.forEach(function (t) {
    var fa = ra[PMC_RANG[t]], fb = rb[PMC_RANG[t]]; if (!fa.length) { return; }
    var n = 0; fa.forEach(function (c) { if (fb.indexOf(c) !== -1) { n++; } });
    var attendu = Math.min(fa.length, PMC_PLAFOND_RAPPEL[t] * 3), attenduB = Math.min(fb.length, PMC_PLAFOND_RAPPEL[t] * 3);
    parts.push(Math.sqrt(Math.min(1, n / attendu) * (attenduB ? Math.min(1, n / attenduB) : 0)));
  });
  return parts.length ? parts.reduce(function (x, y) { return x + y; }, 0) / parts.length : 0;
}
var _pmcCacheProches = {};
function _pmcSimilaires(D, idx) {
  var cle = D.m.length + ':' + idx;
  if (_pmcCacheProches[cle]) { return _pmcCacheProches[cle]; }
  var out = [];
  for (var j = 0; j < D.m.length; j++) { if (j === idx || D.m[j][0] === D.m[idx][0]) { continue; } var s = pmcSimil(D, idx, j); if (s > 0) { out.push({ i: j, s: s }); } }
  out.sort(function (x, y) { return y.s - x.s || x.i - y.i; });
  return (_pmcCacheProches[cle] = out);
}
// Métiers proches : d'abord la liste officielle du ROME (codes, dans l'ordre du ROME), puis complétée par les compétences en commun. Jamais moins de 3 quand c'est possible.
function pmcProches(D, idx, codesOfficiels, nombre) {
  var n = nombre || 3, out = [], vus = {};
  vus[idx] = 1;
  (codesOfficiels || []).forEach(function (c) { var i = D.idxCode[c]; if (i !== undefined && !vus[i] && D.m[i][0] !== D.m[idx][0] && out.length < n) { vus[i] = 1; out.push({ i: i, s: pmcSimil(D, idx, i), officiel: true }); } });
  _pmcSimilaires(D, idx).forEach(function (p) { if (out.length < n && !vus[p.i]) { vus[p.i] = 1; out.push({ i: p.i, s: p.s, officiel: false }); } });
  return out;
}
function pmcCommunes(D, a, b) {
  var res = {};
  PMC_TYPES.forEach(function (t) { var fb = D.m[b][PMC_RANG[t]]; res[t] = D.m[a][PMC_RANG[t]].filter(function (c) { return fb.indexOf(c) !== -1; }); });
  return res;
}
// Les métiers du même secteur (hors le métier lui-même et hors ceux déjà montrés), les plus proches d'abord.
function pmcMetiersDuSecteur(D, idx, exclus) {
  var sec = D.m[idx][1], vus = {}; (exclus || []).forEach(function (i) { vus[i] = 1; });
  var out = [];
  D.m.forEach(function (r, j) { if (r[1] === sec && j !== idx && !vus[j] && r[0] !== D.m[idx][0]) { out.push({ i: j, s: pmcSimil(D, idx, j) }); } });
  out.sort(function (x, y) { return y.s - x.s || x.i - y.i; });
  return out;
}
// « Les métiers où la compétence compte le plus » : l'ordre de l'index complet (cœur de métier du ROME d'abord). index = INDEX_COMPETENCES.
function pmcRepresentatifs(D, index, t, id) {
  var codeDe = function (s) { return s.replace(/\+\d*$/, ''); };
  var codes;
  if (t === 'sf') { codes = (index.sf[id] || []).map(codeDe); }
  else if (t === 'sv') { codes = index.sv[id] ? index.sv[id][2].map(codeDe) : []; }
  else { codes = (D.inv.se[id] || []).map(function (i) { return D.m[i].code; }); }
  var out = [];
  codes.forEach(function (c) { var i = D.idxCode[c]; if (i !== undefined) { out.push(i); } });
  if (t === 'se') { out.sort(function (a, b) { return D.m[a][4].length - D.m[b][4].length || a - b; }); }
  return out;
}

/* ---------------- La barre de recherche unique ---------------- */
// Mots courants qui mènent à un secteur (on dit « enseignement », le secteur s'appelle « Éducation et formation »). Clé = nom exact du secteur dans baseMetiers.
var PMC_MOTS_SECTEURS = {
  'Administration, gestion et bureau': 'secrétariat comptabilité administratif bureau gestionnaire',
  'Agriculture, nature et espaces verts': 'agricole agriculteur jardinage jardinier forêt paysagiste viticulture élevage culture',
  'Artisanat et création': 'artisan couture création atelier',
  'Banque, assurance et immobilier': 'finance banquier assureur agent immobilier crédit',
  'Bâtiment et travaux publics': 'construction maçon maçonnerie chantier btp plomberie électricité peintre',
  'Coiffure et esthétique': 'coiffeur coiffeuse beauté esthéticienne maquillage',
  'Commerce et vente': 'magasin vendeur vendeuse caisse commerçant distribution',
  'Communication, culture et événementiel': 'spectacle événement journalisme marketing artiste musée',
  'Éducation et formation': 'enseignement enseigner enseignant professeur instituteur école scolaire pédagogie formateur formateurs éducation',
  'Hôtellerie, restauration et tourisme': 'restaurant restauration cuisine cuisinier hôtel serveur voyage',
  'Industrie, production et énergie': 'usine fabrication opérateur atelier énergie production',
  'Informatique et numérique': 'ordinateur développeur informaticien réseau web numérique',
  'Mécanique et automobile': 'garage mécanicien automobile voiture réparation',
  'Métiers animaliers': 'animaux animal vétérinaire chien cheval',
  'Métiers de bouche (artisanat)': 'boulanger pâtissier boucher charcutier cuisinier alimentation',
  'Propreté et gestion des déchets': 'nettoyage ménage déchets entretien',
  'Santé et soins': 'infirmier infirmière hôpital médical paramédical médecin soignant',
  'Sécurité': 'gardiennage surveillance pompier agent de sécurité police',
  'Social et services à la personne': 'aide à domicile éducateur accompagnement petite enfance handicap social',
  'Sport, animation et loisirs': 'sportif animateur loisirs éducateur sportif',
  'Transport et logistique': 'chauffeur conducteur livraison entrepôt cariste routier'
};
// Retourne les groupes de suggestions ; l'écran les dessine. opts : { plusMetiers, plusCompetences }.
function pmcSuggestions(D, S, texte, opts) {
  var o = opts || {};
  var qn = D.norm ? D.norm(texte) : String(texte).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’'-]/g, ' ').replace(/\s+/g, ' ').trim();
  if (qn.length < 1) { return null; }
  var mots = qn.split(' ').filter(Boolean);
  // Un mot de trois lettres ou moins ne compte qu'en début de mot (« as » ne doit pas trouver « classe » ni « passion »), comme dans la recherche de métiers.
  var tous = function (n) { var d = ' ' + n; return mots.every(function (w) { return w.length <= 3 ? d.indexOf(' ' + w) !== -1 : n.indexOf(w) !== -1; }); };
  var rang = function (n) { return n.indexOf(qn) === 0 ? 0 : ((' ' + n).indexOf(' ' + qn) !== -1 ? 1 : 2); };
  var norm = function (t) { return String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’'-]/g, ' ').replace(/\s+/g, ' ').trim(); };
  var res = {};
  var ms = []; D.m.forEach(function (r, i) { if (tous(r.n)) { ms.push({ i: i, g: rang(r.n) }); } });
  ms.sort(function (a, b) { return a.g - b.g || a.i - b.i; });
  var limM = o.plusMetiers ? 60 : 8;
  res.metiers = { total: ms.length, items: ms.slice(0, limM).map(function (x) { return x.i; }), limite: limM };
  var cs = [];
  PMC_TYPES.forEach(function (t) {
    D[t].forEach(function (x, i) {
      if (tous(norm(x.lib)) && !pmcEstChoisie(S, t, i)) { cs.push({ t: t, i: i, n: (D.inv[t][i] || []).length, g: rang(norm(x.lib)) }); }
    });
  });
  cs.sort(function (a, b) { return a.g - b.g || b.n - a.n || a.i - b.i; });
  var limC = o.plusCompetences ? 40 : 5;
  res.competences = { total: cs.length, items: cs.slice(0, limC), limite: limC };
  var catSec = qn.length >= 3 && 'secteurs'.indexOf(qn) === 0;
  var ss = []; D.secteurs.forEach(function (s, i) { if ((catSec || tous(norm(s)) || tous(norm(s + ' ' + (PMC_MOTS_SECTEURS[s] || '')))) && S.secteurs.indexOf(i) === -1) { ss.push(i); } });
  res.secteurs = { total: ss.length, items: ss.slice(0, catSec ? 30 : 4) };
  var catNiv = qn.length >= 3 && ('niveau d etudes'.indexOf(qn) === 0 || 'diplome'.indexOf(qn) === 0 || 'niveaux'.indexOf(qn) === 0);
  res.niveaux = { items: PMC_NIVEAUX.filter(function (n) {
    var al = PMC_ALIAS_NIVEAU.filter(function (a) { return a[0] === n[0]; })[0][1];
    return catNiv || norm(n[1]).indexOf(qn) !== -1 || al.some(function (x) { return x.indexOf(qn) !== -1; });
  }) };
  var catCond = qn.length >= 3 && 'conditions de travail'.indexOf(qn) === 0;
  var cdn = []; D.cond.forEach(function (l, k) { if (catCond || tous(norm(l))) { cdn.push(k); } });
  res.conditions = { total: cdn.length, items: cdn.slice(0, catCond ? 30 : 4) };
  res.vide = !res.metiers.total && !res.competences.total && !res.secteurs.items.length && !res.niveaux.items.length && !res.conditions.items.length;
  return res;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PMC_TYPES: PMC_TYPES, PMC_RANG: PMC_RANG, PMC_NOMS_TYPES: PMC_NOMS_TYPES, PMC_PLAFOND_RAPPEL: PMC_PLAFOND_RAPPEL, PMC_REGLAGES: PMC_REGLAGES, PMC_MOTS_SECTEURS: PMC_MOTS_SECTEURS,
    PMC_NIVEAUX: PMC_NIVEAUX, PMC_LIB_NIVEAU: PMC_LIB_NIVEAU, PMC_ALIAS_NIVEAU: PMC_ALIAS_NIVEAU, PMC_TERRITOIRES: PMC_TERRITOIRES, PMC_NOMS_DEPARTEMENTS: PMC_NOMS_DEPARTEMENTS,
    pmcDepartementsVoisins: pmcDepartementsVoisins, pmcMessageOffres: pmcMessageOffres, pmcEtatInitial: pmcEtatInitial, pmcNbChoix: pmcNbChoix, pmcPluriel: pmcPluriel, pmcEstChoisie: pmcEstChoisie,
    pmcEffetConditions: pmcEffetConditions, pmcAjusterListeConditions: pmcAjusterListeConditions, pmcScorer: pmcScorer, pmcCalculer: pmcCalculer, pmcSimil: pmcSimil, pmcProches: pmcProches, pmcCommunes: pmcCommunes,
    pmcMetiersDuSecteur: pmcMetiersDuSecteur, pmcRepresentatifs: pmcRepresentatifs, pmcSuggestions: pmcSuggestions
  };
}
