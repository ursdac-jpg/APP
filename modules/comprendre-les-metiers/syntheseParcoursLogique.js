/* ============================================================
   Module « Explorer les métiers » : « Mon parcours », LOGIQUE PURE (aucun DOM, aucun stockage). Testé par tests/syntheseParcours.test.js.
   Créé le 19/11/2026 (étape B de docs/CHANTIER_MA_SYNTHESE_EXPLORER_LES_METIERS_2026-11-18.md ; maquette docs/MAQUETTE_MON_PARCOURS_EXPLORER_LES_METIERS_V1_2026-11-19.html,
   quatre recommandations validées par Denis le 19/11/2026).

   Ce que fait ce fichier :
   - le PARCOURS : jusqu'à cinq métiers exercés, chacun avec les compétences que la personne dit avoir réellement pratiquées. Une entrée = { rome, nom, sf: [libellés], se: [libellés], sv: [libellés] }.
     Les compétences sont gardées par LIBELLÉ (jamais par numéro : les numéros changent quand le ROME est régénéré). « Autre expérience » (rome vide) = aucun métier de la base,
     seulement des compétences cherchées une à une (petit boulot, bénévolat) : aucune fiche inventée (recommandation 3) ;
   - la FICHE d'un métier exercé, vue « du côté de l'expérience » : savoir-faire, savoir-être, savoirs, le cœur du métier d'abord. Les DIPLÔMES (catégorie 4 des savoirs) sont mis à part :
     jamais à cocher, jamais « à acquérir » (recommandation 4) ;
   - le BAGAGE : tout ce qui est coché, tous métiers confondus, en numéros (le calcul de synComparerPiste, syntheseLectureLogique.js, compare ce bagage à CHAQUE piste) ;
   - le TEXTE de la demande (plafonné : cinq métiers, au plus dix savoir-faire, quatre savoir-être et six savoirs par métier, et au total 2 800 caractères, le cœur du métier d'abord) ;
   - la SAUVEGARDE (disquette) : relue avec méfiance, jamais un texte libre, jamais de date ni d'employeur.
   Données : D = pmdDonnees() (parMetierDonnees.js), passées en paramètre : aucune globale lue ici.
   ============================================================ */

var SYNP_MAX_METIERS = 5;
var SYNP_TYPES = ['sf', 'se', 'sv'];
var SYNP_CAT_DIPLOMES = 4;                 // catégorie des « savoirs » qui sont des diplômes, permis ou habilitations
var SYNP_AUTRE = 'Autre expérience';       // l'entrée sans métier de la base
// Plafonds de saisie par métier (les fiches ont au plus 52 savoir-faire, 5 savoir-être, 59 savoirs : la marge couvre les compétences ajoutées à la main).
var SYNP_PLAFOND_SAISIE = { sf: 80, se: 16, sv: 100 };
// Plafonds de ce qui part dans la demande, par métier (le cœur du métier d'abord).
var SYNP_PLAFOND_DEMANDE = { sf: 10, se: 4, sv: 6 };
// Budget de caractères de TOUTES les lignes du parcours : la consigne seule fait déjà 7 500 caractères et la demande entière est plafonnée (12 000). Quand cinq métiers bien remplis
// dépassent ce budget, les plafonds ci-dessus baissent ensemble (savoirs d'abord, puis savoir-faire, puis savoir-être) jusqu'à tenir, le cœur du métier restant cité en premier.
var SYNP_BUDGET_DEMANDE = 2800;
var SYNP_PLANCHER_DEMANDE = { sf: 3, se: 2, sv: 2 };
var SYNP_LIBELLES_TYPES = { sf: 'savoir-faire', se: 'savoir-être', sv: 'savoirs' };

function _synpNorm(t) { return String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’'-]/g, ' ').replace(/\s+/g, ' ').trim(); }
function _synpRome(r) { return typeof r === 'string' && /^[A-Z]\d{4}$/.test(r.trim().toUpperCase()) ? r.trim().toUpperCase() : ''; }

/* ---------------- Le parcours ---------------- */

function synpEntree(rome, nom) {
  var code = _synpRome(rome);
  return { rome: code, nom: code ? String(nom || '').replace(/\s+/g, ' ').trim().slice(0, 140) : SYNP_AUTRE, sf: [], se: [], sv: [] };
}
function synpEstAutre(entree) { return !entree || !entree.rome; }

// Ajoute un métier (ou « Autre expérience » avec rome vide). Retourne { ok: true } ou { ok: false, raison: 'plein' | 'deja' | 'invalide' }.
function synpAjouterMetier(parcours, rome, nom) {
  if (!Array.isArray(parcours)) { return { ok: false, raison: 'invalide' }; }
  var code = _synpRome(rome);
  if (code && !String(nom || '').trim()) { return { ok: false, raison: 'invalide' }; }
  if (parcours.some(function (e) { return code ? e.rome === code : !e.rome; })) { return { ok: false, raison: 'deja' }; }
  if (parcours.length >= SYNP_MAX_METIERS) { return { ok: false, raison: 'plein' }; }
  parcours.push(synpEntree(code, nom));
  return { ok: true };
}
function synpRetirerMetier(parcours, k) {
  if (!Array.isArray(parcours) || k < 0 || k >= parcours.length) { return false; }
  parcours.splice(k, 1);
  return true;
}
function synpNbCoches(entree) { return entree ? SYNP_TYPES.reduce(function (n, t) { return n + (Array.isArray(entree[t]) ? entree[t].length : 0); }, 0) : 0; }
function synpNbTotal(parcours) { return (Array.isArray(parcours) ? parcours : []).reduce(function (n, e) { return n + synpNbCoches(e); }, 0); }

// Coche ou décoche une compétence (par libellé). Retourne vrai si l'état a changé (jamais au-delà du plafond de saisie).
function synpBasculer(entree, t, lib) {
  if (!entree || SYNP_TYPES.indexOf(t) === -1 || typeof lib !== 'string' || !lib || lib.length > 200) { return false; }
  var liste = entree[t] = Array.isArray(entree[t]) ? entree[t] : [], i = liste.indexOf(lib);
  if (i !== -1) { liste.splice(i, 1); return true; }
  if (liste.length >= SYNP_PLAFOND_SAISIE[t]) { return false; }
  liste.push(lib);
  return true;
}
// Sans liste : décoche tout ce type. Avec une liste (celle de la fiche) : décoche seulement ces libellés, ce que la personne a ajouté à la main reste.
function synpToutDecocher(entree, t, libs) {
  if (!entree || SYNP_TYPES.indexOf(t) === -1 || !(entree[t] || []).length) { return false; }
  var avant = entree[t].length;
  entree[t] = Array.isArray(libs) ? entree[t].filter(function (l) { return libs.indexOf(l) === -1; }) : [];
  return entree[t].length !== avant;
}

/* ---------------- Les fiches ---------------- */

// Index libellé -> numéro, pour chaque type (construit une fois par jeu de données).
function synpIndexLibelles(D) {
  if (D._synpLib) { return D._synpLib; }
  var idx = { sf: {}, se: {}, sv: {} };
  SYNP_TYPES.forEach(function (t) { D[t].forEach(function (x, i) { if (idx[t][x.lib] === undefined) { idx[t][x.lib] = i; } }); });
  D._synpLib = idx;
  return idx;
}
// Numéro du métier dans D.m : par code ROME, sinon par nom ; -1 si inconnu ou « Autre expérience ».
function synpIdxMetier(D, entree) {
  if (!D || !entree) { return -1; }
  if (entree.rome && D.idxCode && D.idxCode[entree.rome] !== undefined) { return D.idxCode[entree.rome]; }
  if (entree.rome && entree.nom) {
    var n = _synpNorm(entree.nom);
    for (var i = 0; i < D.m.length; i++) { if (D.m[i].n === n) { return i; } }
  }
  return -1;
}
function synpNomAffiche(D, entree) {
  var i = synpIdxMetier(D, entree);
  return i >= 0 ? D.m[i][0] : (entree && entree.nom) || SYNP_AUTRE;
}
// La fiche d'un métier exercé : null pour « Autre expérience » ou un métier devenu inconnu.
// Retourne { idx, nom, sf: [{ i, l, c }], se: [{ i, l }], sv: [{ i, l, c }], diplomes: [libellés] } ; c = 1 pour le cœur du métier (cités d'abord).
function synpFiche(D, entree) {
  var idx = synpIdxMetier(D, entree);
  if (idx < 0) { return null; }
  var r = D.m[idx], coeur = r.coeur || { sf: {}, sv: {} };
  var tri = function (a, b) { return b.c - a.c || a.i - b.i; };
  return {
    idx: idx, nom: r[0],
    sf: r[3].map(function (i) { return { i: i, l: D.sf[i].lib, c: coeur.sf[i] ? 1 : 0 }; }).sort(tri),
    se: r[4].map(function (i) { return { i: i, l: D.se[i].lib }; }),
    sv: r[5].filter(function (i) { return D.sv[i].cat !== SYNP_CAT_DIPLOMES; }).map(function (i) { return { i: i, l: D.sv[i].lib, c: coeur.sv[i] ? 1 : 0 }; }).sort(tri),
    diplomes: r[5].filter(function (i) { return D.sv[i].cat === SYNP_CAT_DIPLOMES; }).map(function (i) { return D.sv[i].lib; })
  };
}
// Les ids d'une fiche pour la comparaison à une piste : les diplômes n'y entrent JAMAIS.
function synpFichePourComparaison(D, idx) {
  if (!D || idx < 0 || !D.m[idx]) { return null; }
  var r = D.m[idx];
  return { sf: r[3], se: r[4], sv: r[5].filter(function (i) { return D.sv[i].cat !== SYNP_CAT_DIPLOMES; }) };
}

/* ---------------- Le bagage : tout ce qui est coché, en numéros ---------------- */

// Retourne [{ t, i }] sans doublon (un libellé inconnu des données d'aujourd'hui est ignoré, un diplôme aussi).
function synpBagageIds(D, parcours) {
  var out = [], vus = {};
  if (!D || !Array.isArray(parcours)) { return out; }
  var idx = synpIndexLibelles(D);
  parcours.forEach(function (e) {
    SYNP_TYPES.forEach(function (t) {
      (Array.isArray(e[t]) ? e[t] : []).forEach(function (lib) {
        var i = idx[t][lib];
        if (i === undefined || (t === 'sv' && D.sv[i].cat === SYNP_CAT_DIPLOMES) || vus[t + i]) { return; }
        vus[t + i] = 1; out.push({ t: t, i: i });
      });
    });
  });
  return out;
}

/* ---------------- Le texte de la demande ---------------- */

// Une ligne par métier exercé : « Cuisinier : savoir-faire : ... ; savoir-être : ... ; savoirs : ... ». Tableau vide s'il n'y a rien de coché
// (la demande dit alors « non donné, ne devinez rien »). Le cœur du métier d'abord, plafonné.
function synpLignesDemande(D, parcours, budget) {
  var plaf = { sf: SYNP_PLAFOND_DEMANDE.sf, se: SYNP_PLAFOND_DEMANDE.se, sv: SYNP_PLAFOND_DEMANDE.sv }, max = typeof budget === 'number' ? budget : SYNP_BUDGET_DEMANDE;
  var lignes = _synpLignes(D, parcours, plaf);
  while (lignes.join('\n').length > max) {
    if (plaf.sv > SYNP_PLANCHER_DEMANDE.sv) { plaf.sv--; } else if (plaf.sf > SYNP_PLANCHER_DEMANDE.sf) { plaf.sf--; } else if (plaf.se > SYNP_PLANCHER_DEMANDE.se) { plaf.se--; } else { break; }
    lignes = _synpLignes(D, parcours, plaf);
  }
  return lignes;
}
function _synpLignes(D, parcours, plaf) {
  var lignes = [];
  (Array.isArray(parcours) ? parcours : []).slice(0, SYNP_MAX_METIERS).forEach(function (e) {
    if (!synpNbCoches(e)) { return; }
    var fiche = D ? synpFiche(D, e) : null, ordre = {};
    if (fiche) { SYNP_TYPES.forEach(function (t) { fiche[t].forEach(function (x, k) { ordre[t + '|' + x.l] = k; }); }); }
    var morceaux = [];
    SYNP_TYPES.forEach(function (t) {
      var libs = (Array.isArray(e[t]) ? e[t] : []).filter(function (l) { return typeof l === 'string' && l; });
      // ceux de la fiche dans l'ordre de la fiche (cœur d'abord), puis ceux ajoutés à la main
      libs = libs.map(function (l, k) { return { l: l, o: ordre[t + '|' + l] !== undefined ? ordre[t + '|' + l] : 100000 + k }; }).sort(function (a, b) { return a.o - b.o; }).map(function (x) { return x.l; });
      if (!libs.length) { return; }
      var garde = libs.slice(0, plaf[t]);
      morceaux.push(SYNP_LIBELLES_TYPES[t] + ' : ' + garde.join(', ') + (libs.length > garde.length ? ' (et ' + (libs.length - garde.length) + ' autres)' : ''));
    });
    var nom = synpEstAutre(e) ? SYNP_AUTRE + ' (hors des métiers du répertoire : bénévolat, petits boulots...)' : synpNomAffiche(D, e);
    lignes.push(nom + ' : ' + morceaux.join(' ; '));
  });
  return lignes;
}

/* ---------------- La sauvegarde (disquette) ---------------- */

// Ce qui part dans le fichier : les codes, les noms et les libellés cochés, rien d'autre.
function synpPourFichier(parcours) {
  return (Array.isArray(parcours) ? parcours : []).slice(0, SYNP_MAX_METIERS).map(function (e) {
    var sortie = { rome: _synpRome(e && e.rome), nom: '' };
    sortie.nom = sortie.rome ? String((e && e.nom) || '').replace(/\s+/g, ' ').trim().slice(0, 140) : SYNP_AUTRE;
    SYNP_TYPES.forEach(function (t) {
      sortie[t] = (Array.isArray(e && e[t]) ? e[t] : []).filter(function (l, i, a) { return typeof l === 'string' && l.length > 0 && l.length <= 200 && a.indexOf(l) === i; }).slice(0, SYNP_PLAFOND_SAISIE[t]);
    });
    return sortie;
  }).filter(function (e) { return e.rome ? !!e.nom : true; });
}
// Relit avec méfiance ce qui vient d'un fichier : forme, tailles, doublons. Un libellé devenu inconnu est ignoré plus tard (à l'usage, quand les données sont chargées).
function synpNormaliserDepuisFichier(brut) {
  if (!Array.isArray(brut)) { return []; }
  var vus = {};
  return synpPourFichier(brut.filter(function (e) { return e && typeof e === 'object' && !Array.isArray(e); })).filter(function (e) {
    var cle = e.rome || 'autre';
    if (vus[cle]) { return false; }
    vus[cle] = 1;
    return true;
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SYNP_MAX_METIERS: SYNP_MAX_METIERS, SYNP_AUTRE: SYNP_AUTRE, SYNP_PLAFOND_SAISIE: SYNP_PLAFOND_SAISIE, SYNP_PLAFOND_DEMANDE: SYNP_PLAFOND_DEMANDE, SYNP_BUDGET_DEMANDE: SYNP_BUDGET_DEMANDE, SYNP_CAT_DIPLOMES: SYNP_CAT_DIPLOMES,
    synpEntree: synpEntree, synpEstAutre: synpEstAutre, synpAjouterMetier: synpAjouterMetier, synpRetirerMetier: synpRetirerMetier, synpNbCoches: synpNbCoches, synpNbTotal: synpNbTotal,
    synpBasculer: synpBasculer, synpToutDecocher: synpToutDecocher,
    synpIndexLibelles: synpIndexLibelles, synpIdxMetier: synpIdxMetier, synpNomAffiche: synpNomAffiche, synpFiche: synpFiche, synpFichePourComparaison: synpFichePourComparaison,
    synpBagageIds: synpBagageIds, synpLignesDemande: synpLignesDemande, synpPourFichier: synpPourFichier, synpNormaliserDepuisFichier: synpNormaliserDepuisFichier
  };
}
