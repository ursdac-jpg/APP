/* ============================================================
   Étape « Vos missions et compétences » : BRIQUE PURE (lot 1, aucun DOM, aucun accès à js/app.js).
   Reproduit la logique de la maquette validée (docs/MAQUETTE_MISSIONS_COMPETENCES_PAR_EXPERIENCE_2026-11-14.html) :
   propositions issues des fiches, fusion sans doublon entre expériences, bilan du métier visé, écriture dans le dossier.
   Testée par tests/missionsCompetencesEtape.test.js (Node). Style ES5, comme le reste de l'application.
   Plan de codage : docs/PLAN_DE_CODAGE_MISSIONS_COMPETENCES_2026-11-14.md, lot 1.

   Vocabulaire :
   - fiche normalisée : { code, nom, m: [missions], sf: [savoir-faire], se: [savoir-être], sv: [savoirs], k: [activités plus précises] }
   - type de compétence : 'sf' (savoir-faire), 'se' (savoir-être), 'sv' (savoirs), 'k' (activités plus précises)
   - identifiant d'expérience : celui que l'étape pose sur chaque expérience (champ idEtape) ; deux identifiants réservés :
     'g' = ajouté pour toutes les expériences, 'h' = coché dans « Métier visé » mais hors des expériences listées.
   - état de l'étape : un objet simple (sérialisable), voir mcEtatVide().
   ============================================================ */

var MC_TYPES = ['sf', 'se', 'sv', 'k'];

// Un métier principal plus quatre autres : cinq au plus par expérience (décision de Denis, consigne 388).
var MC_MAX_METIERS_PLUS = 4;

// Réutilise la normalisation du lot 2 (rechercheFiche.js, chargé avant) pour juger qu'une phrase est un doublon.
var mcNormaliserEtape = (typeof mcNormaliser === 'function') ? mcNormaliser
  : ((typeof require === 'function') ? require('./rechercheFiche.js').mcNormaliser : function (t) { return String(t || '').toLowerCase().trim(); });

// Clé de comparaison d'une phrase : sans accents, sans majuscules, sans ponctuation finale ni espaces en trop.
function mcCleTexte(texte) { return mcNormaliserEtape(texte); }

function mcPropre(texte) { return String(texte === undefined || texte === null ? '' : texte).replace(/\s+/g, ' ').trim(); }

function mcSansDoublon(liste) {
  var vus = {}, r = [];
  (liste || []).forEach(function (t) {
    var p = mcPropre(t), c = mcCleTexte(p);
    if (p && !vus[c]) { vus[c] = true; r.push(p); }
  });
  return r;
}

// ---------- État de l'étape ----------
function mcEtatVide() {
  return {
    version: 1,
    ordre: [],            // identifiants des expériences, dans l'ordre du dossier
    experiences: {},      // id -> { poste, entreprise } (pour retrouver l'expérience si l'identifiant se perd)
    fiches: {},           // id -> code de fiche choisi ; null = « aucune ne convient » ; absent = pas encore choisi
    miss: {},             // id -> missions de la fiche cochées (texte d'origine de la fiche)
    modif: {},            // id -> { texte d'origine: texte modifié par la personne }
    perso: {},            // id -> missions écrites par la personne
    comp: {},             // id | 'g' | 'h' -> { sf: [], se: [], sv: [], k: [] } cochées
    compPerso: {},        // id | 'g' -> { sf: [] } ajoutées par la personne
    metiersPlus: {},      // id -> codes des AUTRES métiers choisis pour cette expérience (quatre au plus, en plus du métier principal de fiches[id]) : consigne 388
    cible: {},            // id -> missions du MÉTIER VISÉ que la personne dit avoir faites dans cette expérience (consigne 394) : texte de la fiche du métier visé
    panneau: {},          // id -> { miss: [...], comp: { sf: [], ... } } ce que la personne a choisi dans le panneau d'expérience (« Vos informations ») : traçabilité, consigne 390
    ajoute: { missions: {}, sf: [], se: [], sv: [] } // ce que l'étape a écrit dans le dossier (jamais retiré autre chose)
  };
}

function mcListeTexte(x) { return Array.isArray(x) ? x.filter(function (t) { return typeof t === 'string'; }) : []; }

// Remet en forme un état lu d'un fichier (disquette) ou du navigateur : jamais d'erreur si le contenu est incomplet ou ancien.
function mcEtatNormalise(brut) {
  var e = mcEtatVide();
  if (!brut || typeof brut !== 'object') { return e; }
  e.ordre = mcListeTexte(brut.ordre);
  Object.keys(brut.experiences || {}).forEach(function (id) {
    var x = brut.experiences[id] || {};
    e.experiences[id] = { poste: String(x.poste || ''), entreprise: String(x.entreprise || '') };
  });
  Object.keys(brut.fiches || {}).forEach(function (id) { var c = brut.fiches[id]; if (c === null || typeof c === 'string') { e.fiches[id] = c; } });
  ['miss', 'perso'].forEach(function (cle) { Object.keys(brut[cle] || {}).forEach(function (id) { e[cle][id] = mcListeTexte(brut[cle][id]); }); });
  Object.keys(brut.modif || {}).forEach(function (id) {
    e.modif[id] = {};
    Object.keys(brut.modif[id] || {}).forEach(function (o) { if (typeof brut.modif[id][o] === 'string') { e.modif[id][o] = brut.modif[id][o]; } });
  });
  ['comp', 'compPerso'].forEach(function (cle) {
    Object.keys(brut[cle] || {}).forEach(function (id) {
      e[cle][id] = {};
      MC_TYPES.forEach(function (t) { var l = mcListeTexte((brut[cle][id] || {})[t]); if (l.length) { e[cle][id][t] = l; } });
    });
  });
  Object.keys(brut.cible || {}).forEach(function (id) { var l = mcSansDoublon(mcListeTexte(brut.cible[id])); if (l.length) { e.cible[id] = l; } });
  Object.keys(brut.metiersPlus || {}).forEach(function (id) {
    var l = mcListeTexte(brut.metiersPlus[id]).filter(function (c, k, t) { return c && t.indexOf(c) === k; }).slice(0, MC_MAX_METIERS_PLUS);
    if (l.length) { e.metiersPlus[id] = l; }
  });
  Object.keys(brut.panneau || {}).forEach(function (id) {
    var x = brut.panneau[id];
    if (!x || typeof x !== 'object') { return; }
    var p = { miss: mcListeTexte(x.miss), comp: {} };
    MC_TYPES.forEach(function (t) { var l = mcListeTexte((x.comp || {})[t]); if (l.length) { p.comp[t] = l; } });
    e.panneau[id] = p;
  });
  var a = brut.ajoute || {};
  Object.keys(a.missions || {}).forEach(function (id) { e.ajoute.missions[id] = mcListeTexte(a.missions[id]); });
  ['sf', 'se', 'sv'].forEach(function (t) { e.ajoute[t] = mcListeTexte(a[t]); });
  return e;
}

// La personne a-t-elle fait au moins un choix dans l'étape ? (décide le chemin avec ou sans le nouveau prompt, lot 4)
function mcAFaitDesChoix(etat) {
  if (!etat) { return false; }
  var plein = function (table) { return Object.keys(table || {}).some(function (id) { return (table[id] || []).length > 0; }); };
  var pleinComp = function (table) {
    return Object.keys(table || {}).some(function (id) { return MC_TYPES.some(function (t) { return ((table[id] || {})[t] || []).length > 0; }); });
  };
  return plein(etat.miss) || plein(etat.perso) || plein(etat.cible) || pleinComp(etat.comp);
}

// Chemin avec l'assistant (consigne 299) : 'a' = la personne a fait des choix dans l'étape (nouveau prompt, lot 7) ; 'b' = comme avant (cv.md intact).
function mcCheminAssistant(etat) { return mcAFaitDesChoix(etat) ? 'a' : 'b'; }

// Missions de la personne pour une expérience du dossier : les lignes réellement écrites dans le dossier (celles de l'étape et celles
// qu'elle avait déjà), seulement si elle a fait des choix pour cette expérience dans l'étape. Sinon rien : l'assistant garde son rôle d'avant.
function mcMissionsPersonne(etat, exp) {
  if (!etat || !exp || !exp.idEtape || mcNbMissions(etat, exp.idEtape) === 0) { return []; }
  return mcLignes(exp.missions);
}

// Lot 7 (consigne 313) : la section « CHOIX DE LA PERSONNE » ajoutée à la fin du profil dans le chemin (a). Pour chaque expérience où la personne a fait
// des choix : ses lignes, telles qu'écrites dans le dossier ; puis ses compétences choisies (les activités précises rangées avec les savoir-faire,
// comme à l'écriture dans le dossier). Vide si rien : jamais un titre suivi de rien.
function mcSectionChoixPersonne(etat, experiences) {
  if (!etat || !mcAFaitDesChoix(etat)) { return ''; }
  var texte = '';
  (experiences || []).forEach(function (e) {
    var lignes = mcMissionsPersonne(etat, e);
    if (!lignes.length) { return; }
    texte += 'Expérience : ' + mcPropre(e.poste) + (mcPropre(e.entreprise) ? ', ' + mcPropre(e.entreprise) : '') + '\n';
    lignes.forEach(function (l) { texte += '- ' + l + '\n'; });
  });
  var c = mcCompetencesChoisies(etat), comp = '';
  [['Savoir-faire', c.sf.concat(c.k)], ['Savoir-être', c.se], ['Savoirs', c.sv]].forEach(function (p) {
    var liste = mcSansDoublon(p[1]);
    if (liste.length) { comp += p[0] + ' : ' + liste.join(' ; ') + '\n'; }
  });
  if (comp) { texte += 'Compétences choisies par la personne :\n' + comp; }
  return texte ? 'CHOIX DE LA PERSONNE (à ne pas modifier)\n' + texte : '';
}

// Le message complet du chemin (a) : instructions du CV, puis le bloc du lot 7 (qui prime sur le point 6), puis le profil, puis la section des choix.
// Renvoie '' si une pièce manque (le message normal prend alors le relais : les choix restent protégés par le code, lot 4).
function mcAssemblerMessageChemin(instructionsCV, bloc, profil, section) {
  if (!mcPropre(instructionsCV) || !mcPropre(bloc) || !mcPropre(section)) { return ''; }
  return instructionsCV + '\n\n' + bloc + '\n\n' + profil + '\n\n' + section;
}

// Chemin (b), la personne n'a rien choisi : instructions du CV (inchangées), complément « expériences sans lien », profil. Une pièce manquante : '' (message d'avant).
function mcAssemblerMessageSansChoix(instructionsCV, complement, profil) {
  if (!mcPropre(instructionsCV) || !mcPropre(complement)) { return ''; }
  return instructionsCV + '\n\n' + complement + '\n\n' + profil;
}

// Missions d'une expérience quand la personne a fait des choix : { choix : ses lignes, jamais retouchées ;
// complements : ce que l'assistant propose en plus, sans doublon avec ses lignes ni entre elles }.
function mcFusionnerMissionsAssistant(lignesPersonne, missionsAssistant) {
  var vus = {}, choix = [], complements = [];
  (lignesPersonne || []).forEach(function (l) { var p = mcPropre(l), c = mcCleTexte(p); if (p && !vus[c]) { vus[c] = true; choix.push(p); } });
  (missionsAssistant || []).forEach(function (m) { var p = mcPropre(m), c = mcCleTexte(p); if (p && !vus[c]) { vus[c] = true; complements.push(p); } });
  return { choix: choix, complements: complements };
}

// « La mise en page » : les propositions de l'assistant en plus des choix de la personne, pour UNE expérience.
// missionsPool = tout ce que l'assistant a proposé ; missionsGardees = ce qui est retenu dans le CV. Renvoie [{ texte, coche }] :
// seulement ce qui n'est pas déjà dans les lignes de la personne (ponctuation et casse ignorées).
function mcComplementsAssistant(lignesPersonne, missionsPool, missionsGardees) {
  var gardees = {};
  (missionsGardees || []).forEach(function (m) { gardees[mcCleTexte(mcPropre(m))] = true; });
  return mcFusionnerMissionsAssistant(lignesPersonne, missionsPool).complements.map(function (t) { return { texte: t, coche: !!gardees[mcCleTexte(t)] }; });
}
// La liste des missions retenues d'une expérience après avoir ajouté (voulu) ou retiré une proposition de l'assistant.
// Sans liste retenue (l'assistant n'avait rien gardé pour cette expérience), on part des lignes de la personne : elles ne sont jamais perdues.
function mcReglerComplement(missionsGardees, lignesPersonne, texte, voulu) {
  var base = (missionsGardees && missionsGardees.length) ? missionsGardees.slice() : (lignesPersonne || []).map(mcPropre).filter(Boolean);
  var cle = mcCleTexte(mcPropre(texte)), pos = -1;
  base.forEach(function (m, k) { if (pos < 0 && mcCleTexte(mcPropre(m)) === cle) { pos = k; } });
  if (voulu && pos < 0) { base.push(mcPropre(texte)); }
  if (!voulu && pos >= 0) { base.splice(pos, 1); }
  return base;
}

// ---------- Compléments de l'assistant (consigne 318) : doublons de sens, versions plus courtes, compétences en plus ----------
// Les trois champs de la réponse (reco.doublonsMissions, reco.missionsPlusCourtes, reco.competencesEnPlus) sont montrés dans « La mise en page ».
// Rien n'est jamais appliqué sans un clic de la personne, et ses choix ne sont jamais réécrits. Logique pure ici ; l'affichage est dans cvPdfCartesMaquette.js.

// Rang (position dans la liste des missions affichées) de la ligne qui a ce texte, ponctuation et casse ignorées ; -1 si absente.
function mcRangDeLigne(segments, texte) {
  var cle = mcCleTexte(mcPropre(texte)), rang = -1;
  (segments || []).forEach(function (s, k) { if (rang < 0 && cle && mcCleTexte(mcPropre(s)) === cle) { rang = k; } });
  return rang;
}
// Les deux lignes d'un doublon de sens, retrouvées dans les missions de l'expérience : [rangDeLaPremiere, rangDeLaSeconde], ou null si l'une manque
// (l'assistant a pu reformuler une ligne : sans correspondance exacte, rien n'est montré plutôt qu'une action sur la mauvaise ligne).
function mcRangsDoublon(entree, segments) {
  var lignes = (entree && entree.lignes) || [];
  if (lignes.length < 2) { return null; }
  var a = mcRangDeLigne(segments, lignes[0]), b = mcRangDeLigne(segments, lignes[1]);
  return (a < 0 || b < 0 || a === b) ? null : [a, b];
}
// Les lignes à retirer de l'affichage pour un choix : 'premiere' = garder la première (retire la seconde), 'seconde' = l'inverse, 'deux' = rien.
function mcRangsARetirer(decision, rangs) {
  if (!rangs) { return []; }
  if (decision === 'premiere') { return [rangs[1]]; }
  if (decision === 'seconde') { return [rangs[0]]; }
  return [];
}
// Famille de la carte Compétences pour un type de la réponse : savoir-faire = professionnelles ('pro'), savoir-être = comportementales ('comp').
function mcFamilleCompetenceEnPlus(type) { return type === 'savoirEtre' ? 'comp' : 'pro'; }
// Les compétences proposées en plus, prêtes à afficher : sans nom écartées, sans doublon, et sans celles que la personne a déjà dans sa liste
// (poolPro / poolComp = toutes les compétences connues de la famille, ajoutees = { pro, comp } celles déjà ajoutées par un clic, qui restent affichées et cochées).
// Renvoie { pro: [{ nom, pourquoi, ajoutee }], comp: [...] }.
// Les noms de compétences que l'assistant a DÉJÀ cités ailleurs dans sa réponse (à valoriser, personnelles, avec leurs listes complètes) : une compétence « en plus »
// qui y figure ne propose rien de nouveau. L'assistant propose, le code garantit : la consigne du prompt ne suffit pas (essais du 15/11/2026, consigne 320).
function mcNomsDejaCites(reco) {
  var r = [];
  ['competencesAValoriser', 'competencesAValoriserProposees', 'competencesPersonnelles', 'competencesPersonnellesProposees'].forEach(function (cle) {
    ((reco && reco[cle]) || []).forEach(function (x) { r.push(typeof x === 'string' ? x : (x && x.competence)); });
  });
  return r.filter(function (x) { return typeof x === 'string' && mcPropre(x); });
}
// dejaCitees (facultatif) : noms déjà cités par l'assistant ailleurs dans sa réponse (voir mcNomsDejaCites) ; écartés sauf si la personne les a ajoutés elle-même.
function mcCompetencesEnPlusAffichables(entrees, poolPro, poolComp, ajoutees, dejaCitees) {
  var sortie = { pro: [], comp: [] }, vus = {};
  var cles = function (l) { return (l || []).map(function (x) { return mcCleTexte(mcPropre(x)); }); };
  var pools = { pro: cles(poolPro), comp: cles(poolComp) };
  var aj = { pro: cles(ajoutees && ajoutees.pro), comp: cles(ajoutees && ajoutees.comp) };
  var citees = cles(dejaCitees);
  (entrees || []).forEach(function (c) {
    var nom = mcPropre(c && c.competence), cle = mcCleTexte(nom), fam = mcFamilleCompetenceEnPlus(c && c.type);
    if (!nom || vus[fam + '|' + cle]) { return; }
    vus[fam + '|' + cle] = true;
    var ajoutee = aj[fam].indexOf(cle) !== -1;
    if (!ajoutee && (pools[fam].indexOf(cle) !== -1 || citees.indexOf(cle) !== -1)) { return; }
    sortie[fam].push({ nom: nom, pourquoi: mcPropre(c.justification), ajoutee: ajoutee });
  });
  return sortie;
}
// Versions plus courtes d'une expérience, rangées par ligne de la liste « Missions ».
// entrees = reco.missionsPlusCourtes de CETTE expérience, segments = missions affichées (la version courte y figure à la place de la ligne quand elle est utilisée).
// Renvoie { rang : { origine, courte, utilisee, entree } } : le texte montré dans la liste est toujours celui de la personne (origine).
function mcVersionsCourtesParRang(entrees, segments) {
  var parRang = {};
  (entrees || []).forEach(function (e) {
    var origine = mcPropre(e && e.ligne), courte = mcPropre(e && e.plusCourte);
    if (!origine || !courte) { return; }
    var rO = mcRangDeLigne(segments, origine), rC = mcRangDeLigne(segments, courte);
    if (rO >= 0 && !parRang[rO]) { parRang[rO] = { origine: origine, courte: courte, utilisee: false, entree: e }; }
    else if (rC >= 0 && !parRang[rC]) { parRang[rC] = { origine: origine, courte: courte, utilisee: true, entree: e }; }
  });
  return parRang;
}

// ---------- Identifiant d'étape des expériences ----------
function mcNumeroId(id) { var m = /^x(\d+)$/.exec(String(id || '')); return m ? parseInt(m[1], 10) : 0; }

// Pose un identifiant stable sur chaque expérience qui n'en a pas (ou qui en partage un avec une autre). Renvoie le nombre posé.
function mcAssurerIds(experiences) {
  var max = 0, vus = {}, n = 0;
  (experiences || []).forEach(function (e) { max = Math.max(max, mcNumeroId(e && e.idEtape)); });
  (experiences || []).forEach(function (e) {
    if (!e || typeof e !== 'object') { return; }
    if (!e.idEtape || vus[e.idEtape]) { max++; e.idEtape = 'x' + max; n++; }
    vus[e.idEtape] = true;
  });
  return n;
}

function mcCleExperience(e) { return mcCleTexte(e && e.poste) + '|' + mcCleTexte(e && e.entreprise); }

function mcSupprimerExperience(etat, id) {
  ['experiences', 'fiches', 'miss', 'modif', 'perso', 'comp', 'compPerso', 'metiersPlus', 'panneau', 'cible'].forEach(function (cle) { if (etat[cle]) { delete etat[cle][id]; } });
  delete etat.ajoute.missions[id];
  etat.ordre = etat.ordre.filter(function (x) { return x !== id; });
}

// Relie l'état aux expériences actuelles du dossier : retrouve celles dont l'identifiant a disparu (même poste et même employeur),
// crée l'entrée des nouvelles, oublie celles qui ont été supprimées. Renvoie la liste des identifiants dans l'ordre du dossier.
function mcRelier(etat, experiences) {
  var exps = (experiences || []).filter(function (e) { return e && typeof e === 'object'; });
  var reclames = {}, ids = [];
  exps.forEach(function (e) { if (e.idEtape && etat.experiences[e.idEtape] && !reclames[e.idEtape]) { reclames[e.idEtape] = true; } else { e._mcAReprendre = true; } });
  exps.forEach(function (e) {
    if (!e._mcAReprendre) { return; }
    delete e._mcAReprendre;
    var cle = mcCleExperience(e), trouve = null;
    etat.ordre.concat(Object.keys(etat.experiences)).forEach(function (id) {
      if (!trouve && !reclames[id] && etat.experiences[id] && mcCleExperience(etat.experiences[id]) === cle) { trouve = id; }
    });
    if (trouve) { e.idEtape = trouve; reclames[trouve] = true; } else { e.idEtape = ''; }
  });
  // Les entrées que plus aucune expérience ne réclame sont oubliées AVANT de poser de nouveaux identifiants : un nouvel identifiant ne reprend jamais les choix d'une expérience supprimée.
  Object.keys(etat.experiences).forEach(function (id) { if (!reclames[id]) { mcSupprimerExperience(etat, id); } });
  mcAssurerIds(exps);
  exps.forEach(function (e) {
    ids.push(e.idEtape);
    etat.experiences[e.idEtape] = { poste: String(e.poste || ''), entreprise: String(e.entreprise || '') };
  });
  etat.ordre = ids.slice();
  return ids;
}

// ---------- Fiches normalisées ----------
// « metiers » = la base des métiers de l'application (baseMetiers de data/metiers.js : les fiches écrites à la main d'abord, puis les fiches
// générées du ROME). Même règle que ficheParCodeRome : la première fiche portant le code gagne. Les compétences courtes (savoir-faire,
// savoir-être, savoirs) viennent de là ; les missions (mi) et les activités précises (k) viennent des fiches du ROME (FICHES_ROME).
var _mcIndexMetiers = { source: null, parCode: {} };
function mcMetierParCode(metiers, code) {
  if (!metiers) { return null; }
  if (_mcIndexMetiers.source !== metiers) {
    var idx = {};
    metiers.forEach(function (m) { if (m && m.rome && !idx[m.rome]) { idx[m.rome] = m; } });
    _mcIndexMetiers = { source: metiers, parCode: idx };
  }
  var trouve = _mcIndexMetiers.parCode[code];
  if (trouve) { return trouve; }
  // Un code du ROME devenu alias d'une autre fiche (même nom, ex. K1306 -> « aes ») : on prend les compétences de cette fiche.
  var alias = (typeof METIERS_ROME_ALIAS !== 'undefined' && METIERS_ROME_ALIAS) ? METIERS_ROME_ALIAS[code] : '';
  if (alias) { for (var i = 0; i < metiers.length; i++) { if (metiers[i] && metiers[i].id === alias) { return metiers[i]; } } }
  return null;
}

// Fiche prête pour l'étape : missions (mi), compétences courtes (base des métiers), activités plus précises (k, les tâches du cœur d'abord).
function mcFicheNormalisee(code, fichesRome, metiers, nom) {
  var f = fichesRome && fichesRome[code];
  if (!f) { return null; }
  var met = mcMetierParCode(metiers, code);
  var groupes = (f.k || []).slice(), coeur = groupes.filter(function (g) { return g[1] > 0; }), autres = groupes.filter(function (g) { return !(g[1] > 0); }), k = [];
  coeur.concat(autres).forEach(function (g) { k = k.concat(g[2] || []); });
  return {
    code: code,
    nom: nom || (met && met.nom) || '',
    m: mcSansDoublon(f.mi),
    sf: mcSansDoublon(met && met.savoirFaire),
    se: mcSansDoublon(met && met.savoirEtre),
    sv: mcSansDoublon(met && met.savoirs),
    k: mcSansDoublon(k)
  };
}

// Combien de fiches portent chaque compétence (sert à présenter les plus courantes d'abord dans « Métier visé »). Calculé une fois ;
// un code du ROME n'est compté qu'une fois (la fiche écrite à la main, qui passe en premier).
var _mcFrequences = { source: null, valeur: null };
function mcFrequences(metiers) {
  if (_mcFrequences.source === metiers && _mcFrequences.valeur) { return _mcFrequences.valeur; }
  var f = { sf: {}, se: {}, sv: {} }, codes = {};
  (metiers || []).forEach(function (m) {
    if (m.rome) { if (codes[m.rome]) { return; } codes[m.rome] = true; }
    [['sf', 'savoirFaire'], ['se', 'savoirEtre'], ['sv', 'savoirs']].forEach(function (p) {
      (m[p[1]] || []).forEach(function (v) { f[p[0]][v] = (f[p[0]][v] || 0) + 1; });
    });
  });
  _mcFrequences = { source: metiers, valeur: f };
  return f;
}

// ---------- Choix de la fiche et des missions ----------
function mcChoisirFiche(etat, id, code) {
  etat.fiches[id] = (code === 'aucune' || code === undefined) ? null : code;
  // Changer de métier principal repart de zéro : les autres métiers et la trace « choisi dans Vos informations » ne valent plus (lot 4, consigne 390).
  delete etat.metiersPlus[id];
  delete etat.panneau[id];
  etat.miss[id] = [];
  etat.modif[id] = {};
  // Les compétences cochées pour cette expérience repartent de ce que la personne a ajouté elle-même.
  var perso = etat.compPerso[id] || {}, comp = {};
  Object.keys(perso).forEach(function (t) { comp[t] = (perso[t] || []).slice(); });
  etat.comp[id] = comp;
}

// ---------- Plusieurs métiers par expérience (consigne 388) ----------
// Les codes de métier d'une expérience : le principal (fiches[id]) puis les autres. Vide si aucun métier choisi ou « aucune ne convient ».
function mcCodesMetiers(etat, id) {
  var principal = etat.fiches[id];
  return principal ? [principal].concat(etat.metiersPlus[id] || []) : [];
}

// Une seule fiche « fusionnée » pour proposer missions et compétences de tous les métiers d'une expérience, sans doublon, le métier principal d'abord.
// fiches : fiches normalisées (mcFicheNormalisee), dans l'ordre des métiers. Renvoie null s'il n'y en a aucune.
function mcFusionnerFiches(fiches) {
  var liste = (fiches || []).filter(Boolean);
  if (!liste.length) { return null; }
  var r = { code: liste[0].code, nom: liste[0].nom, codes: liste.map(function (f) { return f.code; }).filter(function (c, k, t) { return t.indexOf(c) === k; }) };
  ['m'].concat(MC_TYPES).forEach(function (t) {
    var tout = [];
    liste.forEach(function (f) { tout = tout.concat(f[t] || []); });
    r[t] = mcSansDoublon(tout);
  });
  return r;
}

// Par identifiant d'expérience : la fiche fusionnée de ses métiers (ou null). ficheParCode : { code: fiche normalisée } déjà chargées.
// Une fiche pas encore chargée est simplement absente de la fusion : l'écran se redessine quand elle arrive.
function mcFichesParExperience(etat, ficheParCode) {
  var r = {};
  etat.ordre.forEach(function (id) {
    r[id] = mcFusionnerFiches(mcCodesMetiers(etat, id).map(function (c) { return (ficheParCode || {})[c]; }));
  });
  return r;
}

// Retire ce qui était coché pour l'expérience mais n'est plus proposé par aucun de ses métiers. Ce que la personne a écrit elle-même ne bouge jamais,
// ni ce qui est coché « hors expériences » (h) ou pour toutes (g).
function mcNettoyerChoix(etat, id, fusion) {
  var offre = {};
  ['m'].concat(MC_TYPES).forEach(function (t) { offre[t] = {}; ((fusion && fusion[t]) || []).forEach(function (v) { offre[t][v] = true; }); });
  etat.miss[id] = (etat.miss[id] || []).filter(function (o) { return offre.m[o]; });
  var modif = etat.modif[id] || {};
  Object.keys(modif).forEach(function (o) { if (!offre.m[o]) { delete modif[o]; } });
  var perso = etat.compPerso[id] || {}, comp = etat.comp[id] || {};
  MC_TYPES.forEach(function (t) {
    if (!comp[t]) { return; }
    var propres = perso[t] || [];
    comp[t] = comp[t].filter(function (v) { return offre[t][v] || propres.indexOf(v) >= 0; });
    if (!comp[t].length) { delete comp[t]; }
  });
  etat.comp[id] = comp;
}

// Définit les métiers d'une expérience (le premier est le principal, cinq au plus, sans doublon). Les choix encore proposés par les nouveaux métiers
// sont gardés (contrairement à mcChoisirFiche, qui repart de zéro). ficheParCode : fiches normalisées chargées ; si l'une d'elles manque, rien n'est
// retiré (on ne peut pas juger) et la fonction renvoie false. Liste vide : « aucun métier », les choix venus des fiches sont retirés.
function mcDefinirMetiers(etat, id, codes, ficheParCode) {
  var propres = [];
  (codes || []).forEach(function (c) { if (typeof c === 'string' && c && propres.indexOf(c) < 0) { propres.push(c); } });
  propres = propres.slice(0, 1 + MC_MAX_METIERS_PLUS);
  etat.fiches[id] = propres.length ? propres[0] : null;
  if (propres.length > 1) { etat.metiersPlus[id] = propres.slice(1); } else { delete etat.metiersPlus[id]; }
  var fiches = propres.map(function (c) { return (ficheParCode || {})[c]; });
  if (fiches.some(function (f) { return !f; })) { return false; }
  mcNettoyerChoix(etat, id, mcFusionnerFiches(fiches));
  return true;
}

// ---------- Traçabilité : ce qui vient du panneau d'expérience (consigne 390) ----------
// Photographie de ce que la personne a choisi pour l'expérience, à la validation du panneau.
function mcMarquerPanneau(etat, id) {
  var comp = {};
  MC_TYPES.forEach(function (t) { var l = mcCochees(etat, id, t); if (l.length) { comp[t] = l.slice(); } });
  etat.panneau[id] = { miss: mcMissionsChoisies(etat, id).slice(), comp: comp };
}
function mcViensDuPanneau(etat, id) { return !!(etat.panneau && etat.panneau[id]); }
function mcOrigineMission(etat, id, texte) {
  var p = etat.panneau && etat.panneau[id];
  return !!p && p.miss.some(function (x) { return mcCleTexte(x) === mcCleTexte(texte); });
}
function mcOrigineCompetence(etat, id, type, valeur) {
  var p = etat.panneau && etat.panneau[id];
  return !!p && ((p.comp || {})[type] || []).some(function (x) { return mcCleTexte(x) === mcCleTexte(valeur); });
}

function mcBasculerDans(table, id, valeur, sousCle) {
  var liste;
  if (sousCle) { table[id] = table[id] || {}; liste = table[id][sousCle] = table[id][sousCle] || []; }
  else { liste = table[id] = table[id] || []; }
  var k = liste.indexOf(valeur);
  if (k >= 0) { liste.splice(k, 1); } else { liste.push(valeur); }
}

function mcBasculerMission(etat, id, texteFiche) { mcBasculerDans(etat.miss, id, texteFiche); }

function mcModifierMission(etat, id, texteFiche, nouveauTexte) {
  var t = mcPropre(nouveauTexte);
  etat.modif[id] = etat.modif[id] || {};
  if (!t || t === texteFiche) { delete etat.modif[id][texteFiche]; } else { etat.modif[id][texteFiche] = t; }
}

function mcAjouterMissionPerso(etat, id, texte) {
  var t = mcPropre(texte);
  if (!t) { return false; }
  etat.perso[id] = etat.perso[id] || [];
  if (etat.perso[id].some(function (x) { return mcCleTexte(x) === mcCleTexte(t); })) { return false; }
  etat.perso[id].push(t);
  return true;
}

function mcRetirerMissionPerso(etat, id, texte) {
  etat.perso[id] = (etat.perso[id] || []).filter(function (x) { return x !== texte; });
}

// Missions retenues pour une expérience, dans l'ordre : celles de la fiche (texte modifié si la personne l'a changé), puis les siennes. Sans doublon.
function mcMissionsChoisies(etat, id) {
  var modif = etat.modif[id] || {};
  return mcSansDoublon((etat.miss[id] || []).map(function (o) { return modif[o] || o; }).concat((etat.cible || {})[id] || [], etat.perso[id] || []));
}

// ---------- Missions du métier visé (lot 5, consigne 394) ----------
// Identifiants des expériences où cette mission est déjà dans le CV (cochée dans la fiche, écrite par la personne ou rattachée depuis le métier visé).
function mcExperiencesDeLaMission(etat, texte) {
  var c = mcCleTexte(texte);
  return etat.ordre.filter(function (id) { return mcMissionsChoisies(etat, id).some(function (x) { return mcCleTexte(x) === c; }); });
}
// Rattache (ou détache) une mission du métier visé à UNE expérience choisie par la personne, jamais automatiquement.
// fiches : fiches fusionnées par identifiant (celles de l'écran) : si la fiche de l'expérience propose déjà cette mission, c'est sa case qui est cochée.
function mcBasculerMissionCible(etat, fiches, id, texte) {
  var c = mcCleTexte(texte);
  if (!etat.cible) { etat.cible = {}; }
  if (!c || etat.ordre.indexOf(id) < 0) { return false; }
  var presente = mcMissionsChoisies(etat, id).some(function (x) { return mcCleTexte(x) === c; });
  var delaFiche = (((fiches || {})[id] || {}).m || []).filter(function (o) { return mcCleTexte(o) === c; })[0];
  if (presente) {
    etat.miss[id] = (etat.miss[id] || []).filter(function (o) { return mcCleTexte(o) !== c && mcCleTexte((etat.modif[id] || {})[o] || '') !== c; });
    etat.cible[id] = (etat.cible[id] || []).filter(function (x) { return mcCleTexte(x) !== c; });
    etat.perso[id] = (etat.perso[id] || []).filter(function (x) { return mcCleTexte(x) !== c; });
    return false;
  }
  if (delaFiche) { etat.miss[id] = (etat.miss[id] || []).concat([delaFiche]); }
  else { etat.cible[id] = (etat.cible[id] || []).concat([mcPropre(texte)]); }
  return true;
}
function mcRetirerMissionCible(etat, id, texte) {
  var c = mcCleTexte(texte);
  etat.cible[id] = (etat.cible[id] || []).filter(function (x) { return mcCleTexte(x) !== c; });
}
// Bilan des missions du métier visé : combien sont déjà dans le CV, et pour chacune les expériences concernées. cibleM : les missions de la fiche du métier visé.
function mcBilanMissionsCible(etat, cibleM) {
  var liste = mcSansDoublon(cibleM || []), cartes = liste.map(function (t) { return { v: t, ids: mcExperiencesDeLaMission(etat, t) }; });
  var n = cartes.filter(function (x) { return x.ids.length; }).length;
  return { total: liste.length, couv: n, pourcent: liste.length ? Math.round(100 * n / liste.length) : 0, cartes: cartes };
}

function mcNbMissions(etat, id) { return mcMissionsChoisies(etat, id).length; }
function mcNbMissionsTotal(etat) { return etat.ordre.reduce(function (n, id) { return n + mcNbMissions(etat, id); }, 0); }

// ---------- Compétences : propositions, fusion sans doublon, rangement ----------
function mcCochees(etat, id, type) { return ((etat.comp[id] || {})[type]) || []; }

function mcIdsComp(etat) { return etat.ordre.concat(['g', 'h']); }

// valeur -> identifiants des expériences dont la fiche (ou l'ajout de la personne) la propose. fiches : { id: fiche normalisée | null }.
function mcOffres(etat, fiches) {
  var o = { sf: {}, se: {}, sv: {}, k: {} };
  function ajouter(t, v, id) { o[t][v] = o[t][v] || []; if (o[t][v].indexOf(id) < 0) { o[t][v].push(id); } }
  etat.ordre.forEach(function (id) { var f = fiches && fiches[id]; if (f) { MC_TYPES.forEach(function (t) { (f[t] || []).forEach(function (v) { ajouter(t, v, id); }); }); } });
  mcIdsComp(etat).forEach(function (id) { var p = etat.compPerso[id] || {}; Object.keys(p).forEach(function (t) { (p[t] || []).forEach(function (v) { ajouter(t, v, id); }); }); });
  return o;
}

// « Commune » = proposée par au moins deux expériences, ou ajoutée pour toutes. Jugé sur ce que les fiches proposent, jamais sur les coches.
function mcEstCommun(o, type, v) {
  var ix = o[type][v] || [];
  return ix.indexOf('g') >= 0 || ix.filter(function (x) { return x !== 'g'; }).length >= 2;
}

function mcEstVise(cible, type, v) { return !!cible && (cible[type] || []).indexOf(v) >= 0; }

// Ordre : le métier visé d'abord, puis ce qui revient dans plusieurs expériences, puis le reste (ordre de la fiche conservé).
function mcRanger(o, type, valeurs, cible) {
  return valeurs.map(function (v, k) { return { v: v, r: mcEstVise(cible, type, v) ? 0 : (mcEstCommun(o, type, v) ? 1 : 2), k: k }; })
    .sort(function (a, b) { return a.r - b.r || a.k - b.k; }).map(function (x) { return x.v; });
}

// État d'une pastille proposée par plusieurs expériences : true (toutes cochées), false (aucune), 'mixte'.
function mcEtatPuce(etat, ix, type, v) {
  var nb = ix.filter(function (id) { return mcCochees(etat, id, type).indexOf(v) >= 0; }).length;
  return nb === 0 ? false : (nb === ix.length ? true : 'mixte');
}

// Ce que l'écran affiche pour une vue : filtre = null (« Toutes mes expériences ») ou l'identifiant d'une expérience.
// Renvoie, par type non vide : [{ v, sources: [ids], vise, commun, perso, etat }]
function mcFamilles(etat, fiches, cible, filtre) {
  var o = mcOffres(etat, fiches), r = {};
  MC_TYPES.forEach(function (t) {
    var vals = Object.keys(o[t]).filter(function (v) { var ix = o[t][v]; return filtre === null || ix.indexOf(filtre) >= 0 || ix.indexOf('g') >= 0; });
    if (!vals.length) { return; }
    r[t] = mcRanger(o, t, vals, cible).map(function (v) {
      var ix = o[t][v];
      var seul = filtre !== null && ix.indexOf('g') < 0;
      return {
        v: v, sources: ix, vise: mcEstVise(cible, t, v), commun: mcEstCommun(o, t, v),
        perso: mcIdsComp(etat).some(function (id) { return ((etat.compPerso[id] || {})[t] || []).indexOf(v) >= 0; }),
        etat: seul ? (mcCochees(etat, filtre, t).indexOf(v) >= 0) : mcEtatPuce(etat, ix, t, v)
      };
    });
  });
  return r;
}

function mcBasculerCompetence(etat, id, type, v) { mcBasculerDans(etat.comp, id, v, type); }

// Clic en vue d'ensemble : coche pour toutes les expériences qui la proposent, ou décoche pour toutes si elles l'avaient déjà toutes.
function mcBasculerCompetenceGlobale(etat, o, type, v) {
  var ix = o[type][v] || [];
  var toutes = ix.every(function (id) { return mcCochees(etat, id, type).indexOf(v) >= 0; });
  ix.forEach(function (id) { var deja = mcCochees(etat, id, type).indexOf(v) >= 0; if (toutes === deja) { mcBasculerDans(etat.comp, id, v, type); } });
}

// Compétence cochée « hors des expériences listées » (onglet Métier visé).
function mcBasculerHors(etat, type, v) { mcBasculerDans(etat.comp, 'h', v, type); }

// Compétence écrite par la personne : id = identifiant d'une expérience ou 'g' (toutes). Rangée en savoir-faire, cochée d'office.
function mcAjouterCompetencePerso(etat, id, texte) {
  var t = mcPropre(texte);
  if (!t) { return false; }
  etat.compPerso[id] = etat.compPerso[id] || {};
  var liste = etat.compPerso[id].sf = etat.compPerso[id].sf || [];
  if (liste.some(function (x) { return mcCleTexte(x) === mcCleTexte(t); })) { return false; }
  liste.push(t);
  if (mcCochees(etat, id, 'sf').indexOf(t) < 0) { mcBasculerDans(etat.comp, id, t, 'sf'); }
  return true;
}

// Toutes les compétences cochées, sans doublon, par type.
function mcCompetencesChoisies(etat) {
  var r = { sf: [], se: [], sv: [], k: [] }, vus = { sf: {}, se: {}, sv: {}, k: {} };
  mcIdsComp(etat).forEach(function (id) {
    MC_TYPES.forEach(function (t) {
      mcCochees(etat, id, t).forEach(function (v) { var c = mcCleTexte(v); if (!vus[t][c]) { vus[t][c] = true; r[t].push(v); } });
    });
  });
  return r;
}

// Compétences choisies dans plusieurs expériences : elles n'apparaissent qu'une fois dans le CV. Renvoie combien de fois elles ont été retirées (lot 4, « doublons retirés »).
// Savoir-faire, savoir-être et savoirs seulement (comme le total de l'écran).
function mcNbDoublonsCompetences(etat) {
  var choix = 0;
  mcIdsComp(etat).forEach(function (id) { ['sf', 'se', 'sv'].forEach(function (t) { choix += mcCochees(etat, id, t).length; }); });
  return Math.max(0, choix - mcNbCompetences(etat).total);
}

// Comptes de l'écran. Les activités plus précises ne comptent pas dans le « 8 à 12 compétences » (décision du plan, point 2).
function mcNbCompetences(etat) {
  var c = mcCompetencesChoisies(etat);
  return { sf: c.sf.length, se: c.se.length, sv: c.sv.length, k: c.k.length, total: c.sf.length + c.se.length + c.sv.length };
}

function mcNbCompetencesExperience(etat, id) {
  return MC_TYPES.reduce(function (n, t) { return n + mcCochees(etat, id, t).length; }, 0);
}

// ---------- Métier visé ----------
// État d'une compétence du métier visé : choisie pour des expériences, cochée hors expériences, proposée mais pas choisie.
function mcEtatCible(etat, o, type, v) {
  var ix = (o[type][v] || []).filter(function (x) { return x !== 'g' && x !== 'h'; });
  var ex = ix.filter(function (id) { return mcCochees(etat, id, type).indexOf(v) >= 0; });
  var hors = mcCochees(etat, 'h', type).indexOf(v) >= 0 || mcCochees(etat, 'g', type).indexOf(v) >= 0;
  return { ix: ix, ex: ex, hors: hors, couverte: ex.length > 0 || hors };
}

// Bilan : combien des compétences du métier visé la personne a déjà choisies (savoir-faire, savoir-être, savoirs), et activités précises.
function mcBilanCible(etat, fiches, cible) {
  var b = { total: 0, exp: 0, hors: 0, k: 0, kCouv: 0, manque: [], pourcent: 0 };
  if (!cible) { return b; }
  var o = mcOffres(etat, fiches);
  MC_TYPES.forEach(function (t) {
    (cible[t] || []).forEach(function (v) {
      var e = mcEtatCible(etat, o, t, v);
      if (t === 'k') { b.k++; if (e.couverte) { b.kCouv++; } return; }
      b.total++;
      if (e.ex.length) { b.exp++; } else if (e.hors) { b.hors++; } else { b.manque.push(v); }
    });
  });
  b.pourcent = b.total ? Math.round(100 * (b.exp + b.hors) / b.total) : 0;
  return b;
}

// Compteur de l'onglet « Métier visé » : « 9/16 ».
function mcCompteurCible(bilan) { return (bilan.exp + bilan.hors) + '/' + bilan.total; }

// Contenu de l'onglet « Métier visé » : deux rubriques à place stable (une compétence cochée ne change jamais de rubrique),
// chacune rangée par type ; dans « hors expériences », les plus courantes d'abord (freq = mcFrequences). Activités précises à part,
// celles déjà couvertes en premier.
function mcVueCible(etat, fiches, cible, freq) {
  if (!cible) { return null; }
  var o = mcOffres(etat, fiches), f = freq || { sf: {}, se: {}, sv: {} };
  function carte(t, v) {
    var e = mcEtatCible(etat, o, t, v), deLExp = e.ix.length > 0;
    return { v: v, type: t, deLExp: deLExp, sources: e.ix, choisiePour: e.ex, couverte: e.couverte,
      etat: deLExp ? mcEtatPuce(etat, e.ix, t, v) : mcCochees(etat, 'h', t).indexOf(v) >= 0 };
  }
  var vue = { exp: [], hors: [], k: [], bilan: mcBilanCible(etat, fiches, cible) };
  ['sf', 'se', 'sv'].forEach(function (t) {
    var cartes = (cible[t] || []).map(function (v) { return carte(t, v); });
    var deExp = cartes.filter(function (c) { return c.deLExp; });
    var hors = cartes.filter(function (c) { return !c.deLExp; }).map(function (c, k) { return { c: c, k: k }; })
      .sort(function (a, b) { return ((f[t] || {})[b.c.v] || 0) - ((f[t] || {})[a.c.v] || 0) || a.k - b.k; }).map(function (x) { return x.c; });
    if (deExp.length) { vue.exp.push({ type: t, cartes: deExp }); }
    if (hors.length) { vue.hors.push({ type: t, cartes: hors }); }
  });
  var k = (cible.k || []).map(function (v) { return carte('k', v); });
  vue.k = k.filter(function (c) { return c.couverte; }).concat(k.filter(function (c) { return !c.couverte; }));
  return vue;
}

// Clic sur une carte de l'onglet « Métier visé » : comme en vue d'ensemble si une expérience la propose, sinon « hors expériences ».
function mcBasculerCarteCible(etat, fiches, type, v) {
  var o = mcOffres(etat, fiches), e = mcEtatCible(etat, o, type, v);
  if (e.ix.length) { mcBasculerCompetenceGlobale(etat, o, type, v); } else { mcBasculerHors(etat, type, v); }
}

// ---------- Écriture dans le dossier ----------
function mcLignes(texte) {
  var t = Array.isArray(texte) ? texte.join('\n') : String(texte || '');
  return t.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
}

// Voie 3 (« Le refaire moi-même », lot 6) : bascule d'une ligne dans une liste de textes, SANS toucher à ce que la personne a écrit.
// liste : les lignes de la personne ; ajoutes : celles que la fiche y a ajoutées. Un clic ajoute (si la ligne n'y est pas déjà) ou retire (si c'est la fiche qui l'avait ajoutée).
function mcBasculerAjout(liste, ajoutes, texte) {
  var c = mcCleTexte(texte), l = (liste || []).slice(), a = (ajoutes || []).slice();
  if (!c) { return { liste: l, ajoutes: a, ajoute: false }; }
  if (a.some(function (x) { return mcCleTexte(x) === c; })) {
    return { liste: l.filter(function (x) { return mcCleTexte(x) !== c; }), ajoutes: a.filter(function (x) { return mcCleTexte(x) !== c; }), ajoute: false };
  }
  if (l.some(function (x) { return mcCleTexte(x) === c; })) { return { liste: l, ajoutes: a, ajoute: false }; }
  var propre = mcPropre(texte);
  return { liste: l.concat([propre]), ajoutes: a.concat([propre]), ajoute: true };
}

// Écrit le résultat de l'étape dans le dossier : missions de chaque expérience (une par ligne) et compétences (champs existants).
// outils : fonctions d'écriture existantes de l'application, passées en paramètre (aucune ne vit ici) :
//   { ajouterSavoirFaire, retirerSavoirFaire, ajouterSavoirEtre, retirerSavoirEtre, ajouterSavoir, retirerSavoir }
// Règle : l'étape ne retire que ce qu'elle a elle-même ajouté (etat.ajoute) ; ce que la personne avait déjà, ou a ajouté ailleurs, n'est jamais touché.
// Idempotent : appliquer deux fois de suite ne change rien.
function mcAppliquerAuDossier(etat, dossier, outils) {
  var bilan = { missionsAjoutees: 0, missionsRetirees: 0, competencesAjoutees: [], competencesRetirees: [] };
  var exps = dossier.experiences || [];
  mcRelier(etat, exps);

  // Missions : par expérience, retire les lignes que l'étape avait écrites, puis écrit les lignes voulues (sans doublon avec ce qui reste).
  exps.forEach(function (e) {
    var id = e.idEtape, anciennes = etat.ajoute.missions[id] || [], voulues = mcMissionsChoisies(etat, id);
    if (!anciennes.length && !voulues.length) { return; }
    var cles = {};
    anciennes.forEach(function (l) { cles[mcCleTexte(l)] = true; });
    var lignes = mcLignes(e.missions), gardees = lignes.filter(function (l) { return !cles[mcCleTexte(l)]; });
    bilan.missionsRetirees += lignes.length - gardees.length;
    var presentes = {};
    gardees.forEach(function (l) { presentes[mcCleTexte(l)] = true; });
    var nouvelles = voulues.filter(function (l) { return !presentes[mcCleTexte(l)]; });
    bilan.missionsAjoutees += nouvelles.length;
    e.missions = gardees.concat(nouvelles).join('\n');
    etat.ajoute.missions[id] = nouvelles;
  });

  // Compétences : savoir-faire, savoir-être, savoirs, puis activités plus précises (rangées avec les savoir-faire, après les autres).
  var c = mcCompetencesChoisies(etat);
  var presente = {
    sf: function (v) { return (dossier.competencesCV || []).indexOf(v) >= 0; },
    se: function (v) { return (dossier.savoirEtreCV || []).indexOf(v) >= 0 || (dossier.competencesCV || []).indexOf(v) >= 0; },
    sv: function (v) { return (dossier.savoirsCV || []).indexOf(v) >= 0; }
  };
  var voulues = { sf: c.sf.concat(c.k), se: c.se, sv: c.sv };
  var retire = { sf: outils.retirerSavoirFaire, se: outils.retirerSavoirEtre, sv: outils.retirerSavoir };
  var ajoute = { sf: outils.ajouterSavoirFaire, se: outils.ajouterSavoirEtre, sv: outils.ajouterSavoir };
  ['sf', 'se', 'sv'].forEach(function (t) {
    var cles = {};
    voulues[t].forEach(function (v) { cles[mcCleTexte(v)] = true; });
    etat.ajoute[t] = etat.ajoute[t].filter(function (v) {
      if (cles[mcCleTexte(v)]) { return true; }
      retire[t](v); bilan.competencesRetirees.push(v); return false;
    });
  });
  var ordreEcriture = [['sf', c.sf], ['se', c.se], ['sv', c.sv], ['sf', c.k]];
  ordreEcriture.forEach(function (p) {
    var t = p[0];
    p[1].forEach(function (v) {
      var deja = etat.ajoute[t].some(function (x) { return mcCleTexte(x) === mcCleTexte(v); });
      if (deja || presente[t](v)) { return; }
      ajoute[t](v); etat.ajoute[t].push(v); bilan.competencesAjoutees.push(v);
    });
  });
  return bilan;
}

/* ---------- « Annuler » de la voie 1 de la reprise (dette B.70 n° 2, consigne 340) ----------
   Dans le formulaire d'une expérience de « Corriger mon CV », chaque clic du panneau « fiche du métier » écrit aussitôt dans le dossier (texte du formulaire, missions, compétences).
   « Annuler » doit tout remettre comme avant l'ouverture : on prend donc une photo de ce que ces clics peuvent toucher, avant le premier, et on la rend à « Annuler ».
   Touchés : les missions et l'identifiant d'étape de chaque expérience, dossier.etapeMC, les trois listes de compétences du CV, et les missions reportées chez l'assistant. */
function mcCopieSure(v) { return v === undefined ? undefined : JSON.parse(JSON.stringify(v)); }
function mcPhotographierReprise(dossier, index) {
  var reco = dossier && dossier.ia && dossier.ia.cv && dossier.ia.cv.recommandations;
  return {
    index: index,
    etapeMC: mcCopieSure(dossier.etapeMC),
    competencesCV: mcCopieSure(dossier.competencesCV), savoirEtreCV: mcCopieSure(dossier.savoirEtreCV), savoirsCV: mcCopieSure(dossier.savoirsCV),
    experiences: (dossier.experiences || []).map(function (e) { return { idEtape: e ? e.idEtape : undefined, missions: e ? e.missions : undefined }; }),
    reco: reco && Array.isArray(reco.savoirFaireParExperience) ? mcCopieSure(reco.savoirFaireParExperience) : null
  };
}
function mcRestaurerReprise(dossier, photo) {
  if (!dossier || !photo) { return false; }
  ['etapeMC', 'competencesCV', 'savoirEtreCV', 'savoirsCV'].forEach(function (cle) {
    if (photo[cle] === undefined) { delete dossier[cle]; } else { dossier[cle] = mcCopieSure(photo[cle]); }
  });
  (dossier.experiences || []).forEach(function (e, i) {
    var avant = photo.experiences[i];
    if (!e || !avant) { return; }   // une expérience ajoutée depuis la photo n'a rien à retrouver
    if (avant.missions === undefined) { delete e.missions; } else { e.missions = avant.missions; }
    if (avant.idEtape === undefined) { delete e.idEtape; } else { e.idEtape = avant.idEtape; }
  });
  var reco = dossier.ia && dossier.ia.cv && dossier.ia.cv.recommandations;
  if (reco && photo.reco) { reco.savoirFaireParExperience = mcCopieSure(photo.reco); }
  return true;
}

// Lot 4 (consigne 408, « À partir de mon récit ») : l'assistant a proposé des intitulés de métier usuels pour chaque expérience (experience.metiersProches) ;
// on les rapproche du répertoire (trouverCode(intitulé) renvoie un code de fiche ou null) et on pré-relie l'expérience : le premier métier devient le principal,
// les suivants les autres (quatre au plus) ; si le premier n'est pas reconnu, l'expérience n'est pas reliée. Jamais d'écrasement : une expérience déjà reliée par la personne (une fiche ou « aucune ne convient ») n'est pas touchée.
// Renvoie le nombre d'expériences reliées. Rien n'est coché : seuls les métiers sont proposés, la personne choisit ensuite ses missions et ses compétences.
function mcRattacherMetiersProposes(etat, experiences, trouverCode) {
  if (!etat || typeof trouverCode !== 'function') { return 0; }
  mcRelier(etat, experiences);
  var n = 0;
  (experiences || []).forEach(function (e) {
    var id = e && e.idEtape;
    if (!id || !Array.isArray(e.metiersProches) || !e.metiersProches.length || etat.fiches[id] !== undefined) { return; }
    // Le métier principal est TOUJOURS le premier proposé (celui que l'assistant juge le plus proche) : s'il n'est pas reconnu, on ne devine pas avec un voisin.
    var premier = trouverCode(e.metiersProches[0]);
    if (!premier) { return; }
    var codes = [premier];
    e.metiersProches.slice(1).forEach(function (t) { var c = trouverCode(t); if (c && codes.indexOf(c) === -1) { codes.push(c); } });
    etat.fiches[id] = codes[0];
    if (codes.length > 1) { etat.metiersPlus[id] = codes.slice(1, 1 + MC_MAX_METIERS_PLUS); }
    n++;
  });
  return n;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    mcRattacherMetiersProposes: mcRattacherMetiersProposes,
    mcPhotographierReprise: mcPhotographierReprise, mcRestaurerReprise: mcRestaurerReprise,
    MC_TYPES: MC_TYPES, mcCleTexte: mcCleTexte, mcSansDoublon: mcSansDoublon,
    mcEtatVide: mcEtatVide, mcEtatNormalise: mcEtatNormalise, mcAFaitDesChoix: mcAFaitDesChoix,
    mcCheminAssistant: mcCheminAssistant, mcSectionChoixPersonne: mcSectionChoixPersonne, mcAssemblerMessageChemin: mcAssemblerMessageChemin, mcAssemblerMessageSansChoix: mcAssemblerMessageSansChoix, mcMissionsPersonne: mcMissionsPersonne, mcFusionnerMissionsAssistant: mcFusionnerMissionsAssistant,
    mcComplementsAssistant: mcComplementsAssistant, mcReglerComplement: mcReglerComplement,
    mcAssurerIds: mcAssurerIds, mcRelier: mcRelier, mcSupprimerExperience: mcSupprimerExperience,
    mcFicheNormalisee: mcFicheNormalisee, mcFrequences: mcFrequences,
    mcChoisirFiche: mcChoisirFiche, mcBasculerMission: mcBasculerMission, mcModifierMission: mcModifierMission,
    mcAjouterMissionPerso: mcAjouterMissionPerso, mcRetirerMissionPerso: mcRetirerMissionPerso,
    mcMissionsChoisies: mcMissionsChoisies, mcNbMissions: mcNbMissions, mcNbMissionsTotal: mcNbMissionsTotal,
    mcOffres: mcOffres, mcEstCommun: mcEstCommun, mcRanger: mcRanger, mcFamilles: mcFamilles,
    mcBasculerCompetence: mcBasculerCompetence, mcBasculerCompetenceGlobale: mcBasculerCompetenceGlobale, mcBasculerHors: mcBasculerHors,
    mcAjouterCompetencePerso: mcAjouterCompetencePerso, mcCompetencesChoisies: mcCompetencesChoisies,
    mcNbCompetences: mcNbCompetences, mcNbCompetencesExperience: mcNbCompetencesExperience,
    mcBilanCible: mcBilanCible, mcCompteurCible: mcCompteurCible, mcVueCible: mcVueCible, mcBasculerCarteCible: mcBasculerCarteCible,
    mcAppliquerAuDossier: mcAppliquerAuDossier,
    mcLignes: mcLignes,
    mcBasculerAjout: mcBasculerAjout,
    mcRangDeLigne: mcRangDeLigne, mcRangsDoublon: mcRangsDoublon, mcRangsARetirer: mcRangsARetirer,
    mcFamilleCompetenceEnPlus: mcFamilleCompetenceEnPlus, mcCompetencesEnPlusAffichables: mcCompetencesEnPlusAffichables, mcNomsDejaCites: mcNomsDejaCites,
    mcVersionsCourtesParRang: mcVersionsCourtesParRang,
    MC_MAX_METIERS_PLUS: MC_MAX_METIERS_PLUS, mcCodesMetiers: mcCodesMetiers, mcFusionnerFiches: mcFusionnerFiches, mcFichesParExperience: mcFichesParExperience,
    mcNettoyerChoix: mcNettoyerChoix, mcDefinirMetiers: mcDefinirMetiers,
    mcNbDoublonsCompetences: mcNbDoublonsCompetences,
    mcExperiencesDeLaMission: mcExperiencesDeLaMission, mcBasculerMissionCible: mcBasculerMissionCible, mcRetirerMissionCible: mcRetirerMissionCible, mcBilanMissionsCible: mcBilanMissionsCible,
    mcMarquerPanneau: mcMarquerPanneau, mcViensDuPanneau: mcViensDuPanneau, mcOrigineMission: mcOrigineMission, mcOrigineCompetence: mcOrigineCompetence
  };
}
