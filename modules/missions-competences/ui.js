/* ============================================================
   Étape « Vos missions et compétences » : ÉCRAN (intégration à l'application hôte, js/app.js).
   Seul fichier de ce module qui connaît l'application (app, afficherProgression, barreNavigation, dossier, naviguerVers, chargerFicheRome...).
   Chargé AVANT js/app.js : rien n'est appelé au chargement, seulement dans les fonctions ci-dessous.
   La route 'missions-competences' est branchée dans la table des routes de js/app.js ; elle n'est atteinte que si MC_OUVERT est vrai
   (data/metiers.js : _creerCvRoutes, _creerCvRouteApresParcours, _creerCvRouteAvantProfil).
   La logique (propositions, fusion, écriture dans le dossier) vit dans etape.js ; la recherche de la fiche d'un poste dans rechercheFiche.js.
   Plan : docs/PLAN_DE_CODAGE_MISSIONS_COMPETENCES_2026-11-14.md, lot 3. Maquette : docs/MAQUETTE_MISSIONS_COMPETENCES_PAR_EXPERIENCE_2026-11-14.html.
   Choix de la personne = dossier.etapeMC (état de l'étape) ; le résultat est écrit à chaque clic dans les champs existants du dossier.
   ============================================================ */

// Mémoire de l'écran (jamais enregistrée : tout se recalcule à l'ouverture). exp = expérience affichée, autres = « Ce n'est pas le bon métier ? » ouvert.
var _mcUi = { exp: 0, filtreC: 0, autres: {}, edit: {}, ouvert: {}, rech: {}, noms: {}, fiches: {}, charge: {}, repertoire: 'non', cm: null };

function _mcEtat() { return dossier.etapeMC; }
function _mcT(t) { return echapperAttribut(t); }
function _mcPluriel(n, mot, choisie) { return n + ' ' + mot + (n > 1 ? 's' : '') + (choisie === false ? '' : ' choisie' + (n > 1 ? 's' : '')); }
function _mcSurPage() { return typeof pageActuelle !== 'undefined' && pageActuelle === 'missions-competences'; }

// Les fonctions d'écriture EXISTANTES de l'application (js/app.js) : la brique n'en réécrit aucune.
function _mcOutils() {
  return {
    ajouterSavoirFaire: ajouterSavoirFaireCV, retirerSavoirFaire: retirerSavoirFaireCV,
    ajouterSavoirEtre: ajouterSavoirEtreCV, retirerSavoirEtre: retirerSavoirEtreCV,
    ajouterSavoir: ajouterSavoirCV, retirerSavoir: retirerSavoirCV
  };
}
// Écrit dans le dossier ce que l'étape contient (idempotent) : appelée après chaque clic, pour que le CV soit toujours ce que l'écran montre.
function _mcAppliquer() { mcAppliquerAuDossier(_mcEtat(), dossier, _mcOutils()); }

// ---------- Expériences affichées ----------
// Les expériences professionnelles du dossier qui ont un intitulé (celles de « Vos informations »), avec leur identifiant d'étape.
function _mcExperiences() {
  var r = [];
  (dossier.experiences || []).forEach(function (e) { if (e && mcPropre(e.poste)) { r.push({ exp: e, id: e.idEtape, rang: r.length }); } });
  return r;
}
function _mcPeriode(e) {
  var an = function (t) { var m = String(t || '').match(/\d{4}/); return m ? m[0] : ''; };
  var d = an(e.dateDebut), f = an(e.dateFin);
  if (d && f) { return d === f ? d : d + ' à ' + f; }
  return d ? 'depuis ' + d : (f ? 'jusqu’en ' + f : '');
}

// ---------- Fiches du ROME : chargement à la demande, recherche du poste ----------
function _mcFichePrete(code) {
  if (_mcUi.fiches[code]) { return _mcUi.fiches[code]; }
  if (typeof FICHES_ROME === 'undefined' || !FICHES_ROME[code]) { return null; }
  var f = mcFicheNormalisee(code, FICHES_ROME, baseMetiers, _mcUi.noms[code]);
  if (f) { _mcUi.fiches[code] = f; }
  return f;
}
function _mcRendreSiEncore() { if (_mcSurPage()) { _mcRendre(); } }
// Charge (une seule fois) le fichier de la fiche ; l'écran se redessine à l'arrivée.
function _mcCharger(code) {
  if (!code || _mcFichePrete(code) || _mcUi.charge[code]) { return; }
  _mcUi.charge[code] = 'encours';
  chargerFicheRome(code, function (f) { _mcUi.charge[code] = f ? 'ok' : 'echec'; _mcRendreSiEncore(); });
}
function _mcChargerLesFiches() {
  var etat = _mcEtat();
  _mcExperiences().forEach(function (x) { mcCodesMetiers(etat, x.id).forEach(function (c) { _mcCharger(c); }); });
}
// Lot 4 (consigne 390) : la fiche d'une expérience = celle de son métier principal, complétée par celles des autres métiers choisis dans « Vos informations » (sans doublon,
// le principal d'abord). null tant que le principal ou un autre métier encore en chargement n'est pas arrivé : la liste affichée ne change donc plus entre l'écran et le clic.
function _mcFicheFusionnee(id) {
  var codes = mcCodesMetiers(_mcEtat(), id);
  if (!codes.length) { return null; }
  var fiches = [], attente = false;
  codes.forEach(function (c, i) {
    var f = _mcFichePrete(c);
    if (f) { fiches.push(f); } else if (i === 0 || _mcUi.charge[c] !== 'echec') { attente = true; }
  });
  return attente ? null : mcFusionnerFiches(fiches);
}
function _mcNomsMetiers(id) {
  return mcCodesMetiers(_mcEtat(), id).map(function (c) { var f = _mcFichePrete(c); return f ? f.nom : ''; }).filter(Boolean).join(', ');
}
var _MC_ETIQUETTE_PANNEAU = '<span class="vp-panneau">Choisi dans Vos informations</span>';
// Cherche la fiche de chaque poste (règles validées, rechercheFiche.js). Une fiche reconnue (niveau A) est présélectionnée, jamais cochée pour la personne ;
// les autres niveaux ne présélectionnent rien. Les domaines des postes reconnus servent à ranger les listes des autres postes.
function _mcRechercher() {
  if (typeof REPERTOIRE_ROME === 'undefined') { return; }
  var etat = _mcEtat(), exps = _mcExperiences(), domaines = [];
  exps.forEach(function (x) {
    var r = mcChercherFiche(x.exp.poste, REPERTOIRE_ROME, {});
    _mcUi.rech[x.id] = r;
    if (r.niveau === 'A' && r.preselection && r.preselection.domaine) { domaines.push(r.preselection.domaine); }
  });
  if (domaines.length) {
    exps.forEach(function (x) {
      var r = _mcUi.rech[x.id];
      if (r && (r.niveau === 'B' || r.niveau === 'C')) { _mcUi.rech[x.id] = mcChercherFiche(x.exp.poste, REPERTOIRE_ROME, { secteursPrioritaires: domaines }); }
    });
  }
  exps.forEach(function (x) {
    var r = _mcUi.rech[x.id];
    (r.fiches || []).forEach(function (f) { _mcUi.noms[f.code] = f.nom; });
    if (r.niveau === 'A' && r.preselection && etat.fiches[x.id] === undefined) { mcChoisirFiche(etat, x.id, r.preselection.code); }
  });
}

// ---------- Missions ----------
function _mcPuce(attrs, texte, coche, extra) {
  return '<span class="vp-carte' + (extra ? ' ' + extra : '') + (coche ? ' coche' : '') + '" role="checkbox" aria-checked="' + (coche ? 'true' : 'false') + '" tabindex="0" ' + attrs + '>' + texte + '</span>';
}
function _mcAjoutTexte(id, attrs, placeholder) {
  return '<div class="d-flex gap-2 mt-2"><input type="text" class="form-control" id="' + id + '" placeholder="' + _mcT(placeholder) + '" aria-label="' + _mcT(placeholder) + '">' +
    '<button type="button" class="btn btn-outline-primary text-nowrap" ' + attrs + '>+ Ajouter</button></div>';
}
function _mcHtmlMissionsPerso(id, seul) {
  var h = '';
  (_mcEtat().perso[id] || []).forEach(function (m, k) {
    h += '<div class="vp-ligne">' + _mcPuce('data-mc-perso="' + k + '" data-id="' + _mcT(id) + '"', _mcT(m) + ' <small>(la vôtre)</small>', true, 'vp-longue') + '</div>';
  });
  return h + _mcAjoutTexte('mcAjoutM-' + id, 'data-mc-ajout-m="' + _mcT(id) + '"', seul ? 'Écrivez une mission que vous avez faite' : 'Ajouter une mission qui vous est propre');
}
// Liste de fiches à choisir (niveaux B et C, ou « Ce n'est pas le bon métier ? »), avec toujours « Aucune ne convient ».
function _mcHtmlChoixFiches(id, fiches, codeActuel, sansAucune) {
  var h = '<div class="vp-cartes mb-2">';
  (fiches || []).forEach(function (f) {
    if (f.code !== codeActuel) { h += _mcPuce('data-mc-fiche="' + _mcT(f.code) + '" data-id="' + _mcT(id) + '"', _mcT(f.nom), false); }
  });
  if (!sansAucune) { h += _mcPuce('data-mc-fiche="aucune" data-id="' + _mcT(id) + '"', 'Aucune ne convient : j’écris moi-même', false); }
  return h + '</div>';
}
// Missions rattachées à cette expérience depuis l'onglet « Métier visé » (lot 5, consigne 394) : visibles ici, un clic les retire.
function _mcHtmlMissionsDuMetierVise(id) {
  var l = (_mcEtat().cible || {})[id] || [];
  if (!l.length) { return ''; }
  return '<p class="vp-consigne mb-1 mt-3"><strong>Ajoutées depuis le métier visé :</strong></p>' + l.map(function (m, k) {
    return '<div class="vp-ligne">' + _mcPuce('data-mc-cmx="' + k + '" data-id="' + _mcT(id) + '"', _mcT(m) + ' <small>(métier visé)</small>', true, 'vp-longue') + '</div>';
  }).join('');
}
function _mcHtmlMissions(x) { return _mcHtmlMissionsFiche(x) + _mcHtmlMissionsDuMetierVise(x.id); }
function _mcHtmlMissionsFiche(x) {
  var etat = _mcEtat(), id = x.id, code = etat.fiches[id], r = _mcUi.rech[id], h = '';
  if (code === undefined) {
    if (!r) {
      return _mcUi.repertoire === 'echec'
        ? '<p class="vp-consigne vp-regle">La recherche de la fiche du métier n’a pas pu se faire (connexion). Ce n’est pas un problème : écrivez vos missions vous-même.</p>' + _mcHtmlMissionsPerso(id, true)
        : '<p class="vp-consigne">Recherche de la fiche du métier…</p>' + _mcHtmlMissionsPerso(id, true);
    }
    if (!r.fiches.length) {
      return '<p class="vp-consigne vp-regle">Aucune fiche de métier ne correspond à ce poste. Ce n’est pas un problème : écrivez vos missions vous-même.</p>' + _mcHtmlMissionsPerso(id, true);
    }
    h += '<p class="vp-consigne">' + (r.niveau === 'B'
      ? 'Plusieurs fiches de métier pourraient correspondre à ce poste. Choisissez celle qui ressemble le plus à ce que vous avez fait :'
      : 'Aucune fiche ne correspond exactement à ce poste. Voici des fiches qui pourraient s’en approcher :') + '</p>';
    return h + _mcHtmlChoixFiches(id, r.fiches, null) + _mcHtmlMissionsPerso(id, true);
  }
  if (code === null) {
    h += '<p class="vp-consigne vp-regle">Vous écrivez vos missions vous-même pour cette expérience.</p>';
    if (r && r.fiches.length) {
      h += '<p class="vp-consigne">Vous préférez une fiche de métier ? Voici celles qui pourraient s’en approcher :</p>' + _mcHtmlChoixFiches(id, r.fiches, null, true);
    }
    return h + _mcHtmlMissionsPerso(id, true);
  }
  var f = _mcFicheFusionnee(id);
  if (!f) {
    mcCodesMetiers(etat, id).forEach(function (c) { _mcCharger(c); });
    return _mcUi.charge[code] === 'echec'
      ? '<p class="vp-consigne vp-regle">La fiche du métier n’a pas pu être chargée (connexion). Vous pouvez écrire vos missions vous-même.</p>' + _mcHtmlMissionsPerso(id, true)
      : '<p class="vp-consigne">Chargement de la fiche du métier…</p>' + _mcHtmlMissionsPerso(id, true);
  }
  // Métier déjà choisi par la personne dans « Vos informations » : la page ne le redemande pas (une seule mémoire, une seule destination).
  var viaPanneau = mcViensDuPanneau(etat, id);
  if (viaPanneau) {
    h += '<p class="vp-consigne">Métier choisi dans « Vos informations » : <strong>' + _mcT(_mcNomsMetiers(id)) + '</strong>. Pour le changer, revenez à « Vos informations » (bouton Retour).</p>';
  } else {
    h += '<p class="vp-consigne">Pour cette expérience, nous avons retrouvé la fiche du métier : <strong>' + _mcT(f.nom) + '</strong> ' +
      '<button type="button" class="btn btn-sm btn-nav-erip ms-1" data-mc-autres="' + _mcT(id) + '">Ce n’est pas le bon métier ?</button></p>';
  }
  if (_mcUi.autres[id] && !viaPanneau) {
    var proches = (r && r.fiches) ? r.fiches : [];
    h += '<p class="vp-consigne">Fiches proches :</p>' + _mcHtmlChoixFiches(id, proches, code);
  }
  if (!f.m.length) { h += '<p class="vp-consigne">Cette fiche ne propose pas de mission : écrivez les vôtres ci-dessous.</p>'; }
  var modif = etat.modif[id] || {}, coches = etat.miss[id] || [];
  f.m.forEach(function (m, k) {
    var texte = modif[m] || m, coche = coches.indexOf(m) >= 0;
    if (_mcUi.edit[id + '|' + k]) {
      h += '<div class="vp-ligne"><input type="text" class="form-control" id="mcEdit-' + _mcT(id) + '-' + k + '" value="' + _mcT(texte) + '" aria-label="Modifier la mission">' +
        '<button type="button" class="btn btn-sm btn-primary" data-mc-ok="' + k + '" data-id="' + _mcT(id) + '">Valider</button></div>';
    } else {
      h += '<div class="vp-ligne">' + _mcPuce('data-mc-m="' + k + '" data-id="' + _mcT(id) + '"', _mcT(texte) + (coche && mcOrigineMission(etat, id, m) ? _MC_ETIQUETTE_PANNEAU : ''), coche, 'vp-longue') +
        '<button type="button" class="btn btn-sm btn-nav-erip" data-mc-modifier="' + k + '" data-id="' + _mcT(id) + '">Modifier</button></div>';
    }
  });
  return h + _mcHtmlMissionsPerso(id, false);
}

// ---------- Blocs de l'écran ----------
function _mcDetails(cle, classe, ouvertParDefaut, entete, corps) {
  var ouvert = _mcUi.ouvert[cle] !== undefined ? _mcUi.ouvert[cle] : ouvertParDefaut;
  return '<details class="' + classe + '" data-mc-k="' + cle + '"' + (ouvert ? ' open' : '') + '><summary>' + entete + '</summary>' + corps + '</details>';
}
function _mcOnglets(groupe, items, courant, classes) {
  var h = '<div class="onglets-validation-import" role="tablist">';
  items.forEach(function (it, k) {
    h += '<button type="button" class="onglet-validation-import-btn' + ((classes && classes[k]) ? ' ' + classes[k] : '') + (k === courant ? ' actif' : '') + '" role="tab" aria-selected="' + (k === courant) + '" data-mc-onglet="' + groupe + '" data-v="' + k + '">' + it + '</button>';
  });
  return h + '</div>';
}
function _mcLibOnglet(x, nb) {
  var p = _mcPeriode(x.exp);
  return _mcT(x.exp.poste) + (nb ? '<span class="badge-onglet-nb">' + nb + '</span>' : '') + (p ? '<small class="d-block" style="font-weight:400;font-size:.8rem">' + _mcT(p) + '</small>' : '');
}
// Le métier que la personne vise (choisi à l'étape « Votre objectif »), rappelé en haut : toutes ses expériences servent ce métier.
function _mcHtmlCible(nbExp, cible, fiches) {
  var nom = mcPropre(dossier.metierCible);
  if (!nom) { return ''; }
  var nbV = 0;
  if (cible) { var vue = mcVueCible(_mcEtat(), fiches, cible, null); vue.exp.forEach(function (g) { nbV += g.cartes.length; }); }
  return '<div class="vp-cible"><div class="text-muted small">&#127919; Le métier que vous visez</div><div class="vp-cible-metier">' + _mcT(nom) + '</div>' +
    '<p class="mb-1 mt-1">Votre CV s’appuie sur vos <strong>' + _mcPluriel(nbExp, 'expérience', false) + '</strong> pour raconter un parcours cohérent avec ce métier. Choisissez en priorité ce qui s’en rapproche.' +
    (nbV ? ' Vos expériences proposent déjà <strong>' + nbV + ' compétence' + (nbV > 1 ? 's' : '') + '</strong> que demande ce métier : elles sont signalées « métier visé ».' : '') + '</p>' +
    '<button type="button" class="btn btn-sm btn-nav-erip" data-mc-nav="objectif">Changer de métier</button></div>';
}
function _mcHtmlBlocMissions(exps) {
  var etat = _mcEtat(), i = Math.min(_mcUi.exp, exps.length - 1), x = exps[i], nm = mcNbMissionsTotal(etat), nbI = mcNbMissions(etat, x.id);
  var corps = '<p class="vp-consigne">Cliquez sur une phrase pour la choisir : elle est cochée (✓) et ira dans votre CV. Cliquez de nouveau pour l’enlever. Faites-le expérience par expérience, avec les onglets.</p>';
  corps += nbI > 7
    ? '<div class="encart-limite-missions">' + _mcPluriel(nbI, 'mission') + ' pour cette expérience : un CV se lit mieux avec 4 à 6 missions par expérience.</div>'
    : '<p class="vp-consigne vp-plafond" role="status"><strong>' + _mcPluriel(nbI, 'mission') + '</strong> pour cette expérience (4 à 6 conviennent bien).</p>';
  corps += _mcOnglets('exp', exps.map(function (e) { return _mcLibOnglet(e, mcNbMissions(etat, e.id)); }), i) + _mcHtmlMissions(x);
  return _mcDetails('q1', 'vp-question', true,
    '<span class="vp-qnum">1</span><span class="vp-qtitre">Vos missions</span><span class="vp-qpil ' + (nm ? 'ok' : 'vide') + '">' + (nm ? _mcPluriel(nm, 'mission') : 'à compléter') + '</span>',
    '<div class="vp-qcorps">' + corps + '</div>');
}
// ---------- Métier visé (fiche de référence) ----------
// La fiche du métier visé (dossier.metierCible). Les compétences courtes viennent de la base des métiers et sont disponibles tout de suite ;
// les activités plus précises arrivent avec la fiche du ROME (chargée à la demande), l'écran se redessine alors.
function _mcCible() {
  var nom = mcPropre(dossier.metierCible);
  if (!nom || typeof metierParNom !== 'function') { return null; }
  var entree = metierParNom(nom);
  if (!entree) { return null; }
  var f = entree.rome ? _mcFichePrete(entree.rome) : null;
  if (!f && entree.rome) { _mcCharger(entree.rome); }
  if (f) { return f; }
  return { code: entree.rome || '', nom: entree.nom || nom, m: [], sf: mcSansDoublon(entree.savoirFaire), se: mcSansDoublon(entree.savoirEtre), sv: mcSansDoublon(entree.savoirs), k: [] };
}
// Les fiches des expériences, par identifiant d'étape (null : pas de fiche choisie, ou pas encore chargée).
function _mcFichesActives() {
  var etat = _mcEtat(), r = {};
  _mcExperiences().forEach(function (x) { r[x.id] = _mcFicheFusionnee(x.id); });
  return r;
}
function _mcNomExp(id) { var r = ''; _mcExperiences().forEach(function (x) { if (x.id === id) { r = mcPropre(x.exp.poste); } }); return r; }
function _mcNoms(ids) { return ids.map(_mcNomExp).filter(Boolean).join(', '); }

// ---------- Compétences ----------
var _MC_TYPES_AFFICHES = [['sf', 'Savoir-faire'], ['se', 'Savoir-être'], ['sv', 'Savoirs'], ['k', 'Activités plus précises']];
function _mcLibSources(sources) {
  if (sources.indexOf('g') >= 0) { return 'toutes vos expériences'; }
  var noms = sources.filter(function (s) { return s !== 'h'; }).map(_mcNomExp).filter(Boolean);
  return noms.length > 2 ? noms.length + ' expériences' : noms.join(', ');
}
function _mcPuceComp(attrs, texte, etatCoche, extra) {
  var c = etatCoche === true ? ' coche' : (etatCoche === 'mixte' ? ' mixte' : '');
  return '<span class="vp-carte' + (extra ? ' ' + extra : '') + c + '" role="checkbox" aria-checked="' + (etatCoche === true ? 'true' : (etatCoche === 'mixte' ? 'mixed' : 'false')) + '" tabindex="0" ' + attrs + '>' + texte + '</span>';
}
function _mcFamille(cle, type, nom, items, ouvertParDefaut) {
  var apercu = items.slice(0, 3).map(function (x) { return x.label; }).join(', ') + (items.length > 3 ? ' … (+' + (items.length - 3) + ')' : '');
  var entete = '<span class="vp-fam-nom">' + nom + '</span><span class="vp-fam-nb">' + items.length + ' choix</span><span class="vp-fam-ligne"><span class="vp-apercu">' + _mcT(apercu) + '</span></span>';
  return _mcDetails(cle, 'vp-fam fam-' + type, ouvertParDefaut, entete, '<div class="vp-fam-corps"><div class="vp-cartes">' + items.map(function (x) { return x.html; }).join('') + '</div></div>');
}
// Les familles d'une vue : filtre = null (toutes les expériences) ou l'identifiant d'une expérience.
function _mcHtmlFamilles(fam, filtre, prefixe) {
  var h = '';
  _MC_TYPES_AFFICHES.forEach(function (t) {
    var liste = fam[t[0]];
    if (!liste || !liste.length) { return; }
    h += _mcFamille(prefixe + t[0], t[0] === 'k' ? 'sf' : t[0], t[1], liste.map(function (it) {
      var viaPanneau = it.etat === true && it.sources.some(function (src) { return src !== 'g' && src !== 'h' && mcOrigineCompetence(_mcEtat(), src, t[0], it.v); });
      var texte = _mcT(it.v) + (it.vise ? '<span class="vp-vise">métier visé</span>' : '') + (viaPanneau ? _MC_ETIQUETTE_PANNEAU : '') + '<span class="vp-src">' + _mcT(_mcLibSources(it.sources)) + (it.perso ? ' · la vôtre' : '') + '</span>';
      var attrs = (filtre === null || it.sources.indexOf('g') >= 0)
        ? 'data-mc-g="' + t[0] + '" data-v="' + _mcT(it.v) + '"'
        : 'data-mc-c="' + t[0] + '" data-id="' + _mcT(filtre) + '" data-v="' + _mcT(it.v) + '"';
      return { label: it.v, html: _mcPuceComp(attrs, texte, it.etat, 'avec-src' + (t[0] === 'k' ? ' vp-longue' : '')) };
    }), t[0] !== 'k');
  });
  return h;
}
function _mcAjoutComp(id, placeholder) { return _mcAjoutTexte('mcAjoutC-' + id, 'data-mc-ajout-c="' + _mcT(id) + '"', placeholder); }
// Onglet « Métier visé » : le bilan, puis deux rubriques à place stable, puis les activités plus précises (repliées).
function _mcHtmlBilanCible(b) {
  var couv = b.exp + b.hors, details = [b.exp ? b.exp + ' grâce à vos expériences' : '', b.hors ? b.hors + ' cochée' + (b.hors > 1 ? 's' : '') + ' en dehors de vos expériences listées' : ''].filter(Boolean).join(', ');
  var h = '<div class="vp-cible-bilan"><p class="vp-consigne mb-1">Vous avez déjà choisi <strong>' + couv + ' des ' + b.total + ' compétences</strong> que demande ce métier (' + b.pourcent + '&nbsp;%)' + (details ? ' : ' + details : '') + '.</p>' +
    '<div class="progress mb-1" style="height:.5rem" role="progressbar" aria-label="Part des compétences du métier visé déjà choisies" aria-valuenow="' + b.pourcent + '" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar" style="width:' + b.pourcent + '%"></div></div>';
  if (b.k) { h += '<p class="vp-consigne text-muted small mb-0">Activités plus précises du métier : ' + b.kCouv + ' sur ' + b.k + ' déjà choisies.</p>'; }
  return h + '</div>';
}
function _mcCarteCible(c) {
  var src = '';
  if (c.sources.length) { src = c.choisiePour.length ? 'Choisie pour : ' + _mcNoms(c.choisiePour) : 'Proposée pour : ' + _mcNoms(c.sources) + ' (pas encore choisie)'; }
  else if (c.etat) { src = 'Hors de vos expériences listées'; }
  return _mcPuceComp('data-mc-cible="' + c.type + '" data-v="' + _mcT(c.v) + '"', _mcT(c.v) + (src ? '<span class="vp-src">' + _mcT(src) + '</span>' : ''), c.etat, (src ? 'avec-src' : '') + (c.type === 'k' ? ' vp-longue' : ''));
}
var _MC_NOM_TYPE = { sf: 'Savoir-faire', se: 'Savoir-être', sv: 'Savoirs' };
// ---------- Missions que demande le métier visé (lot 5, consigne 394) ----------
// Une mission déjà faite est rattachée à la ou aux expériences que la personne choisit, jamais automatiquement. « Ailleurs » : pas sur le CV.
function _mcMissionsCibleListe(cible) { return mcSansDoublon((cible && cible.m) || []); }
function _mcHtmlQuestionMissionCible(k, texte) {
  var etat = _mcEtat(), ids = mcExperiencesDeLaMission(etat, texte);
  if (_mcUi.cm && _mcUi.cm.aucune) {
    return '<div class="vp-ou"><p class="mb-1"><strong>Elle ne sera pas écrite sur votre CV.</strong> Un CV raconte des expériences précises : une mission faite en dehors d’un emploi ne peut pas y être rattachée sans l’inventer. ' +
      'Si c’était du bénévolat, une association, un service rendu, vous pouvez la décrire dans « Ce que vous avez appris ailleurs qu’au travail » (étape « Vos informations »).</p>' +
      '<button type="button" class="btn btn-sm btn-outline-primary" data-mc-cm-fermer="1">Compris</button></div>';
  }
  var h = '<div class="vp-ou"><p class="mb-1"><strong>Dans quelle expérience l’avez-vous faite ?</strong> Un clic l’ajoute à cette expérience, un autre clic la retire. Vous pouvez en choisir plusieurs.</p><div class="vp-cartes">';
  _mcExperiences().forEach(function (x) {
    var p = _mcPeriode(x.exp);
    h += _mcPuce('data-mc-cm-e="' + k + '" data-id="' + _mcT(x.id) + '"', _mcT(x.exp.poste) + (x.exp.entreprise ? ' · ' + _mcT(x.exp.entreprise) : '') + (p ? ' <small>(' + _mcT(p) + ')</small>' : ''), ids.indexOf(x.id) >= 0);
  });
  h += '</div><div class="mt-2 d-flex flex-wrap gap-2">';
  if (!ids.length) { h += '<button type="button" class="btn btn-sm btn-outline-secondary" data-mc-cm-aucune="' + k + '">Je l’ai faite ailleurs, pas dans ces expériences</button>'; }
  return h + '<button type="button" class="btn btn-sm btn-primary" data-mc-cm-fermer="1">Terminé</button></div></div>';
}
function _mcHtmlMissionsCible(cible) {
  var liste = _mcMissionsCibleListe(cible);
  if (!liste.length) { return ''; }
  var etat = _mcEtat(), b = mcBilanMissionsCible(etat, liste), h = '';
  h += '<div class="vp-cible-bilan"><p class="vp-consigne mb-1">Vous avez déjà <strong>' + _mcPluriel(b.couv, 'mission', false) + ' sur ' + b.total + '</strong> que demande ce métier (' + b.pourcent + '&nbsp;%).</p>' +
    '<div class="progress" style="height:.5rem" role="progressbar" aria-label="Part des missions du métier visé déjà dans votre CV" aria-valuenow="' + b.pourcent + '" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar" style="width:' + b.pourcent + '%"></div></div></div>';
  h += '<p class="vp-consigne">Voici les missions que demande le métier « <strong>' + _mcT(cible.nom) + '</strong> ». <strong>Cochez seulement ce que vous avez réellement fait.</strong> Pour chaque mission, vous dites dans quelle expérience vous l’avez faite : c’est là qu’elle sera écrite sur votre CV.</p>';
  var ligne = function (c, k) {
    var noms = c.ids.map(_mcNomExp).filter(Boolean).join(' et ');
    var ouvert = _mcUi.cm && _mcUi.cm.k === k;
    return '<div class="vp-ligne">' + _mcPuce('data-mc-cm="' + k + '"', _mcT(c.v) + (c.ids.length ? '<span class="vp-src">Dans : ' + _mcT(noms) + '</span>' : ''), c.ids.length > 0, 'vp-longue' + (c.ids.length ? ' avec-src' : '')) + '</div>' +
      (ouvert ? _mcHtmlQuestionMissionCible(k, c.v) : '');
  };
  [['cm-deja', 'Déjà dans votre CV', 'Avec l’expérience où elle est écrite : un clic pour la changer', true], ['cm-reste', 'À cocher si vous les avez déjà faites', 'Cliquez sur une mission déjà faite, puis dites où', false]].forEach(function (rub) {
    var items = b.cartes.map(function (c, k) { return { c: c, k: k }; }).filter(function (x) { return (x.c.ids.length > 0) === rub[3]; });
    if (!items.length) { return; }
    h += _mcDetails(rub[0], 'vp-fam', true, '<span class="vp-fam-nom">' + rub[1] + '</span><span class="vp-fam-nb">' + _mcPluriel(items.length, 'mission', false) + '</span><span class="vp-fam-ligne"><span class="vp-apercu">' + rub[2] + '</span></span>',
      '<div class="vp-fam-corps">' + items.map(function (x) { return ligne(x.c, x.k); }).join('') + '</div>');
  });
  return h;
}

function _mcHtmlOngletCible(cible, fiches) {
  var etat = _mcEtat(), vue = mcVueCible(etat, fiches, cible, mcFrequences(baseMetiers)), h = _mcHtmlBilanCible(vue.bilan);
  var hm = _mcHtmlMissionsCible(cible);
  if (hm) { h = '<p class="vp-sous-titre" style="font-size:1rem">Les missions du métier</p>' + hm + '<p class="vp-sous-titre" style="font-size:1rem;margin-top:1rem">Les compétences du métier</p>' + h; }
  h += '<p class="vp-consigne">Voici ce que demande le métier « <strong>' + _mcT(cible.nom) + '</strong> » (fiche France Travail). Ce que vos choix couvrent déjà est coché, avec l’expérience d’origine. Pour le reste, <strong>cochez seulement ce que vous avez déjà pratiqué</strong>, même en dehors des expériences listées (autre emploi, bénévolat, vie quotidienne) : cela sera ajouté à votre CV.</p>';
  [['exp', 'Proposées par vos expériences', 'Avec l’expérience d’origine'], ['hors', 'À cocher si vous les avez déjà pratiquées', 'Les plus courantes dans ce métier d’abord']].forEach(function (rub) {
    var groupes = vue[rub[0]], nb = groupes.reduce(function (n, g) { return n + g.cartes.length; }, 0);
    if (!nb) { return; }
    var corps = groupes.map(function (g) {
      return '<p class="vp-sous-titre">' + _MC_NOM_TYPE[g.type] + '</p><div class="vp-cartes">' + g.cartes.map(_mcCarteCible).join('') + '</div>';
    }).join('');
    h += _mcDetails('cv-' + rub[0], 'vp-fam', true, '<span class="vp-fam-nom">' + rub[1] + '</span><span class="vp-fam-nb">' + nb + ' choix</span><span class="vp-fam-ligne"><span class="vp-apercu">' + rub[2] + '</span></span>', '<div class="vp-fam-corps">' + corps + '</div>');
  });
  if (vue.k.length) { h += _mcFamille('cv-k', 'sf', 'Activités plus précises', vue.k.map(function (c) { return { label: c.v, html: _mcCarteCible(c) }; }), false); }
  return h;
}
function _mcHtmlBlocCompetences(exps, cible, fiches) {
  var etat = _mcEtat(), n = mcNbCompetences(etat), nbExp = exps.length, iCible = nbExp + 1, fi = _mcUi.filtreC, h = '';
  if ((!cible && fi === iCible) || fi > iCible) { fi = _mcUi.filtreC = 0; }
  h += '<p class="vp-consigne">Cliquez sur une compétence pour la choisir : elle est cochée (✓) et ira dans votre CV. Cliquez de nouveau pour l’enlever. Sous chaque compétence, une ligne grise indique de quelle expérience elle vient.</p>';
  h += '<p class="vp-consigne text-muted small"><strong>Savoir-faire</strong> : ce que vous savez faire. <strong>Savoir-être</strong> : vos qualités au travail. <strong>Savoirs</strong> : ce que vous connaissez.</p>';
  h += n.total > 12
    ? '<div class="encart-limite-missions">' + _mcPluriel(n.total, 'compétence') + ' : un CV se lit mieux avec 8 à 12 compétences au total.</div>'
    : '<p class="vp-consigne vp-plafond" role="status"><strong>' + _mcPluriel(n.total, 'compétence') + '</strong> au total (8 à 12 conviennent bien).</p>';
  h += '<p class="vp-consigne mb-1"><strong>Afficher les compétences de :</strong></p>';
  var libs = ['&#128450;&#65039; Toutes mes expériences<small class="d-block" style="font-weight:400;font-size:.8rem">vue d’ensemble</small>'];
  exps.forEach(function (x) { libs.push(_mcLibOnglet(x, mcNbCompetencesExperience(etat, x.id))); });
  if (cible) { libs.push('&#127919; Métier visé<span class="badge-onglet-nb">' + mcCompteurCible(mcBilanCible(etat, fiches, cible)) + '</span><small class="d-block" style="font-weight:400;font-size:.8rem">ce qu’il demande</small>'); }
  var btn = function (k, cls) {
    return '<button type="button" class="onglet-validation-import-btn' + (cls ? ' ' + cls : '') + (k === fi ? ' actif' : '') + '" role="tab" aria-selected="' + (k === fi) + '" data-mc-onglet="filtreC" data-v="' + k + '">' + libs[k] + '</button>';
  };
  h += '<div class="onglets-comp"><div class="onglets-validation-import" role="tablist">' + btn(0, 'onglet-global') + (cible ? btn(iCible, 'onglet-vise') : '') + '</div>';
  h += '<p class="vp-consigne mb-1"><strong>Expériences professionnelles :</strong></p><div class="onglets-validation-import derniere" role="tablist">';
  exps.forEach(function (x, k) { h += btn(k + 1, ''); });
  h += '</div></div>';
  if (cible && fi === iCible) {
    h += _mcHtmlOngletCible(cible, fiches);
  } else if (fi === 0) {
    h += '<p class="vp-consigne">Toutes les compétences proposées pour vos expériences, <strong>sans doublon</strong>. Celles qui reviennent dans plusieurs expériences passent en premier : un clic les rattache à chacune d’elles.</p>';
    h += _mcHtmlFamilles(mcFamilles(etat, fiches, cible, null), null, 'ct-') + _mcAjoutComp('g', 'Ajouter une compétence pour toutes mes expériences');
  } else {
    var x = exps[Math.min(fi - 1, nbExp - 1)];
    h += '<p class="vp-consigne text-muted small">Ici, un clic ne concerne que « ' + _mcT(x.exp.poste) + ' ». Pour une compétence qui revient dans plusieurs expériences, passez par « Toutes mes expériences ».</p>';
    if (!fiches[x.id]) { h += '<p class="vp-consigne vp-regle">Pas de fiche de métier pour cette expérience pour le moment : vous pouvez ajouter vos compétences vous-même.</p>'; }
    h += _mcHtmlFamilles(mcFamilles(etat, fiches, cible, x.id), x.id, 'ce-' + x.id + '-') + _mcAjoutComp(x.id, 'Ajouter une compétence propre à ce métier');
  }
  return _mcDetails('q2', 'vp-question', true,
    '<span class="vp-qnum">2</span><span class="vp-qtitre">Vos compétences</span><span class="vp-qpil ' + (n.total ? 'ok' : 'vide') + '">' + (n.total ? _mcPluriel(n.total, 'compétence') : 'à compléter') + '</span>',
    '<div class="vp-qcorps">' + h + '</div>');
}

// Ce que le CV contiendra : les lignes réellement écrites dans le dossier (celles de la personne en « Vos informations » comprises).
function _mcHtmlApercu(exps) {
  var h = '<p class="vp-consigne">Rien ne s’ajoute à votre CV sans votre clic.</p>', nm = 0;
  exps.forEach(function (x) {
    var lignes = mcLignes(x.exp.missions), p = _mcPeriode(x.exp);
    nm += lignes.length;
    h += '<div class="vp-cv-poste">' + _mcT(x.exp.poste) + (p ? ' <span class="text-muted" style="font-weight:400">(' + _mcT(p) + ')</span>' : '') + '</div>';
    h += lignes.length ? '<ul class="vp-cv-liste">' + lignes.map(function (l) { return '<li>' + _mcT(l) + '</li>'; }).join('') + '</ul>' : '<p class="vp-vide">Aucune mission choisie pour le moment.</p>';
  });
  // Compétences : les listes réelles du dossier (savoir-être déjà inclus dans competencesCV, comme partout dans l'application).
  var etre = dossier.savoirEtreCV || [], faire = (dossier.competencesCV || []).filter(function (c) { return etre.indexOf(c) < 0; }), savoirs = dossier.savoirsCV || [];
  var nc = faire.length + etre.length + savoirs.length;
  h += '<div class="vp-cv-poste">Compétences</div>';
  [['Savoir-faire', faire], ['Savoir-être', etre], ['Savoirs', savoirs]].forEach(function (g) {
    if (g[1].length) { h += '<p class="vp-sous-titre">' + g[0] + '</p><ul class="vp-cv-liste">' + g[1].map(function (l) { return '<li>' + _mcT(l) + '</li>'; }).join('') + '</ul>'; }
  });
  if (!nc) { h += '<p class="vp-vide">Aucune compétence choisie pour le moment.</p>'; }
  var nd = mcNbDoublonsCompetences(_mcEtat());
  if (nd) { h += '<p class="vp-consigne text-muted small">' + nd + (nd > 1 ? ' compétences choisies dans plusieurs expériences ne figurent' : ' compétence choisie dans plusieurs expériences ne figure') + ' qu’une seule fois dans votre CV.</p>'; }
  return _mcDetails('cv', 'vp-question', true,
    '<span class="vp-fam-ico" style="font-size:1.5rem">&#128196;</span><span class="vp-qtitre">Votre CV, tel qu’il se construit</span><span class="vp-qpil">' + _mcPluriel(nm, 'mission', false) + ' · ' + _mcPluriel(nc, 'compétence', false) + '</span>',
    '<div class="vp-qcorps">' + h + '</div>');
}

// ---------- Ce qui vient de « Vos informations » (lot 4, consigne 390) ----------
// Missions et compétences encore cochées qui ont été choisies dans le panneau d'expérience (sans doublon pour les compétences).
function _mcResumePanneau(etat, exps) {
  var nm = 0, vus = {}, nc = 0, nbExp = 0;
  exps.forEach(function (x) {
    if (!mcViensDuPanneau(etat, x.id)) { return; }
    nbExp += 1;
    nm += mcMissionsChoisies(etat, x.id).filter(function (m) { return mcOrigineMission(etat, x.id, m); }).length;
    ['sf', 'se', 'sv'].forEach(function (t) {
      mcCochees(etat, x.id, t).forEach(function (v) {
        var c = t + '|' + mcCleTexte(v);
        if (!vus[c] && mcOrigineCompetence(etat, x.id, t, v)) { vus[c] = true; nc += 1; }
      });
    });
  });
  return { nbExp: nbExp, nm: nm, nc: nc };
}
function _mcHtmlRepris(etat, exps) {
  var r = _mcResumePanneau(etat, exps);
  if (!r.nbExp) { return ''; }
  return '<div class="cv-section" style="border-left:3px solid var(--accent);border-radius:8px;"><p class="mb-1"><strong>&#10003; Repris de « Vos informations » :</strong> ' +
    _mcPluriel(r.nm, 'mission', false) + ' et ' + _mcPluriel(r.nc, 'compétence', false) + ', telles que vous les avez choisies.</p>' +
    '<p class="mb-0">Vous n’avez rien à refaire. Ici, vous vérifiez, vous retirez ce qui est en trop, puis vous complétez pour le métier que vous visez : c’est lui qui compte maintenant.</p></div>';
}

// ---------- Page ----------
function _mcRendre() {
  var y = window.scrollY, etat = _mcEtat(), exps = _mcExperiences(), html;
  _mcChargerLesFiches();
  var entete = afficherProgression('missions-competences') + (typeof _creerCvBandeRevoirSurEcran === 'function' ? _creerCvBandeRevoirSurEcran('missions-competences') : '') +
    '<div class="text-center"><h1>&#129520; Vos missions et compétences</h1>' +
    '<p class="sousTitre">' + (_mcResumePanneau(etat, exps).nbExp ? 'Vérifiez ce que vous avez déjà choisi, puis complétez pour le métier que vous visez. Rien ne change sans votre clic.' : 'Cochez ce que vous avez réellement fait. Rien ne s’ajoute à votre CV sans votre clic.') + '</p></div>';
  var contenu, cible = exps.length ? _mcCible() : null, fiches = _mcFichesActives();
  if (!exps.length) {
    contenu = '<div class="cv-section"><p class="mb-0">Vous n’avez pas encore indiqué d’expérience professionnelle : il n’y a rien à choisir ici. Vous pouvez en ajouter à l’étape « Vos informations » (bouton Retour), ou continuer.</p></div>';
  } else {
    contenu = '<div class="cv-section" style="background:var(--accent-bg-subtle);border-left:3px solid var(--accent);border-radius:8px;"><p class="mb-0">&#128073; <strong>Pour choisir, cliquez</strong> sur ce qui correspond à ce que vous avez réellement fait : c’est coché (✓) et cela ira dans votre CV. Cliquez de nouveau pour l’enlever. <strong>Ne cochez que ce que vous avez réellement fait</strong> : tout reste modifiable, et vous pouvez ajouter les vôtres. Les propositions viennent de la fiche officielle de chaque métier (France Travail).</p></div>' +
      _mcHtmlRepris(etat, exps) + _mcHtmlCible(exps.length, cible, fiches) + _mcHtmlBlocMissions(exps) + _mcHtmlBlocCompetences(exps, cible, fiches) + _mcHtmlApercu(exps);
  }
  var fait = mcAFaitDesChoix(etat);
  html = '<div class="page-catalogue-contenu" id="mcRacine">' + _vpStyle() + entete + contenu + '</div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('votre-parcours', 'revelation', fait ? 'Continuer &#8594;' : 'Passer cette étape &#8594;', { libelleExact: true }) + '</div>';
  app.innerHTML = html;
  _mcBrancher();
  window.scrollTo(0, y);
}

// ---------- Clics ----------
function _mcBrancher() {
  var racine = document.getElementById('mcRacine');
  if (!racine) { return; }
  racine.addEventListener('click', function (e) {
    var t = e.target.closest('[data-mc-onglet],[data-mc-autres],[data-mc-fiche],[data-mc-m],[data-mc-modifier],[data-mc-ok],[data-mc-perso],[data-mc-ajout-m],[data-mc-ajout-c],[data-mc-g],[data-mc-c],[data-mc-cible],[data-mc-nav],[data-mc-cm],[data-mc-cm-e],[data-mc-cm-aucune],[data-mc-cm-fermer],[data-mc-cmx]');
    if (t) { _mcAgir(t); }
  });
  racine.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('vp-carte')) { e.preventDefault(); e.target.click(); return; }
    if (e.key === 'Enter' && e.target.id && e.target.id.indexOf('mcAjoutM-') === 0) { e.preventDefault(); var b = racine.querySelector('[data-mc-ajout-m="' + e.target.id.slice(9) + '"]'); if (b) { b.click(); } }
    if (e.key === 'Enter' && e.target.id && e.target.id.indexOf('mcAjoutC-') === 0) { e.preventDefault(); var b2 = racine.querySelector('[data-mc-ajout-c="' + e.target.id.slice(9) + '"]'); if (b2) { b2.click(); } }
  });
  racine.addEventListener('toggle', function (e) { var k = e.target && e.target.getAttribute && e.target.getAttribute('data-mc-k'); if (k) { _mcUi.ouvert[k] = e.target.open; } }, true);
}
function _mcFicheDeLaCarte(id) { return _mcFicheFusionnee(id); }
function _mcAgir(t) {
  var etat = _mcEtat(), id = t.getAttribute('data-id'), exps = _mcExperiences(), fiche;
  if (t.getAttribute('data-mc-nav')) { naviguerVers(t.getAttribute('data-mc-nav')); return; }
  if (t.getAttribute('data-mc-onglet') === 'exp') { _mcUi.exp = parseInt(t.getAttribute('data-v'), 10) || 0; _mcRendre(); return; }
  if (t.hasAttribute('data-mc-autres')) { var a = t.getAttribute('data-mc-autres'); _mcUi.autres[a] = !_mcUi.autres[a]; _mcRendre(); return; }
  if (t.hasAttribute('data-mc-fiche')) {
    mcChoisirFiche(etat, id, t.getAttribute('data-mc-fiche'));
    _mcUi.autres[id] = false;
    _mcAppliquer(); _mcRendre(); return;
  }
  if (t.hasAttribute('data-mc-m')) {
    fiche = _mcFicheDeLaCarte(id);
    if (fiche) { mcBasculerMission(etat, id, fiche.m[parseInt(t.getAttribute('data-mc-m'), 10)]); }
    _mcAppliquer(); _mcRendre(); return;
  }
  if (t.hasAttribute('data-mc-modifier')) { _mcUi.edit[id + '|' + t.getAttribute('data-mc-modifier')] = true; _mcRendre(); return; }
  if (t.hasAttribute('data-mc-ok')) {
    var k = parseInt(t.getAttribute('data-mc-ok'), 10), champ = document.getElementById('mcEdit-' + id + '-' + k);
    fiche = _mcFicheDeLaCarte(id);
    if (fiche && champ) { mcModifierMission(etat, id, fiche.m[k], champ.value); }
    delete _mcUi.edit[id + '|' + k];
    _mcAppliquer(); _mcRendre(); return;
  }
  if (t.hasAttribute('data-mc-perso')) {
    mcRetirerMissionPerso(etat, id, (etat.perso[id] || [])[parseInt(t.getAttribute('data-mc-perso'), 10)]);
    _mcAppliquer(); _mcRendre(); return;
  }
  if (t.hasAttribute('data-mc-onglet') && t.getAttribute('data-mc-onglet') === 'filtreC') { _mcUi.filtreC = parseInt(t.getAttribute('data-v'), 10) || 0; _mcRendre(); return; }
  if (t.hasAttribute('data-mc-g')) {
    var tg = t.getAttribute('data-mc-g');
    mcBasculerCompetenceGlobale(etat, mcOffres(etat, _mcFichesActives()), tg, t.getAttribute('data-v'));
    _mcAppliquer(); _mcRendre(); return;
  }
  if (t.hasAttribute('data-mc-c')) { mcBasculerCompetence(etat, id, t.getAttribute('data-mc-c'), t.getAttribute('data-v')); _mcAppliquer(); _mcRendre(); return; }
  if (t.hasAttribute('data-mc-cm')) {
    var kc = parseInt(t.getAttribute('data-mc-cm'), 10);
    _mcUi.cm = (_mcUi.cm && _mcUi.cm.k === kc) ? null : { k: kc, aucune: false };
    _mcRendre(); return;
  }
  if (t.hasAttribute('data-mc-cm-fermer')) { _mcUi.cm = null; _mcRendre(); return; }
  if (t.hasAttribute('data-mc-cm-aucune')) { _mcUi.cm = { k: parseInt(t.getAttribute('data-mc-cm-aucune'), 10), aucune: true }; _mcRendre(); return; }
  if (t.hasAttribute('data-mc-cm-e')) {
    var texteCm = _mcMissionsCibleListe(_mcCible())[parseInt(t.getAttribute('data-mc-cm-e'), 10)];
    if (texteCm) { mcBasculerMissionCible(etat, _mcFichesActives(), id, texteCm); }
    _mcAppliquer(); _mcRendre(); return;
  }
  if (t.hasAttribute('data-mc-cmx')) {
    mcRetirerMissionCible(etat, id, ((etat.cible || {})[id] || [])[parseInt(t.getAttribute('data-mc-cmx'), 10)]);
    _mcAppliquer(); _mcRendre(); return;
  }
  if (t.hasAttribute('data-mc-cible')) { mcBasculerCarteCible(etat, _mcFichesActives(), t.getAttribute('data-mc-cible'), t.getAttribute('data-v')); _mcAppliquer(); _mcRendre(); return; }
  if (t.hasAttribute('data-mc-ajout-c')) {
    var nc = t.getAttribute('data-mc-ajout-c'), cc = document.getElementById('mcAjoutC-' + nc);
    if (cc) { mcAjouterCompetencePerso(etat, nc, cc.value); }
    _mcAppliquer(); _mcRendre(); return;
  }
  if (t.hasAttribute('data-mc-ajout-m')) {
    var n = t.getAttribute('data-mc-ajout-m'), ch = document.getElementById('mcAjoutM-' + n);
    if (ch) { mcAjouterMissionPerso(etat, n, ch.value); }
    _mcAppliquer(); _mcRendre(); return;
  }
}

// ---------- Entrée dans la page ----------
function pageMissionsCompetences() {
  dossier.etapeMC = mcEtatNormalise(dossier.etapeMC);
  mcRelier(_mcEtat(), dossier.experiences || []);
  var exps = _mcExperiences();
  if (_mcUi.exp >= exps.length) { _mcUi.exp = 0; }
  _mcUi.autres = {}; _mcUi.edit = {}; _mcUi.cm = null;
  _mcRendre();
  // Le répertoire des intitulés du ROME se charge à la demande ; l'écran se complète à son arrivée (jamais un blocage).
  _mcUi.repertoire = 'encours';
  chargerRepertoireElargi(function () {
    _mcUi.repertoire = 'pret';
    if (!_mcSurPage()) { return; }
    _mcRechercher(); _mcAppliquer(); _mcRendre();
  });
  if (typeof _repertoireRomeEtat !== 'undefined' && _repertoireRomeEtat === 'echec') { _mcUi.repertoire = 'echec'; _mcRendre(); }
  setTimeout(function () { if (_mcUi.repertoire === 'encours' && typeof _repertoireRomeEtat !== 'undefined' && _repertoireRomeEtat === 'echec') { _mcUi.repertoire = 'echec'; _mcRendreSiEncore(); } }, 4000);
}

/* ---------- Lot 5 (consigne 311) : voie 1 de la reprise, « Compléter avec la fiche du métier » ----------
   Placé dans le formulaire d'une expérience de « Vos informations » (mode 'maj' avec l'assistant, jamais dans la fenêtre du Bilan), seulement si une fiche
   reconnue (niveau A) existe pour le poste. Les missions déjà présentes restent, cochées et verrouillées ; chaque ajout se fait par un clic de la personne.
   Les écritures passent par la même brique que l'étape (état dossier.etapeMC + mcAppliquerAuDossier), puis le choix est reporté dans la réponse de l'assistant
   pour cette expérience (sinon le moteur du CV la remplacerait par celle de l'assistant). La voie 2 (« Le reformuler ») n'a rien de tout cela. */
var _mcRep = { index: null, ouvert: false, rerender: null, chargeFiche: {}, choisi: {}, redessiner: null };

function _mcRepApplicable(index) {
  if (typeof MC_OUVERT === 'undefined' || MC_OUVERT !== true || (typeof mcActifPourCeCv === 'function' && !mcActifPourCeCv()) || typeof dossier === 'undefined' || !dossier || dossier.modeCreation !== 'maj') { return false; }
  if (typeof _depuisBilanVersProjet !== 'undefined' && _depuisBilanVersProjet) { return false; }
  return index !== null && index !== undefined && !!(dossier.experiences || [])[index] && !!mcPropre(dossier.experiences[index].poste);
}
function _mcRepRedessiner() {
  if (_mcRep.rerender && document.getElementById('blocERIP-experiences-pro')) { _mcRep.rerender(); }
}
// Le répertoire se charge à la demande ; sans lui (ou en cas d'échec) rien ne s'affiche : jamais un blocage, jamais un message d'erreur inutile.
function _mcRepFiche(exp) {
  if (typeof _repertoireRomeEtat === 'undefined' || typeof chargerRepertoireElargi !== 'function') { return null; }
  if (_repertoireRomeEtat !== 'pret') { chargerRepertoireElargi(function () { if (_mcRep.redessiner) { _mcRep.redessiner(); } }); return null; }
  if (typeof REPERTOIRE_ROME === 'undefined') { return null; }
  var r = mcChercherFiche(exp.poste, REPERTOIRE_ROME, {});
  return ((r.niveau === 'A' && r.preselection) || (r.niveau === 'B' && r.fiches.length)) ? r : null;
}
// La fiche retenue : celle reconnue (niveau A) ou, quand plusieurs sont proches (niveau B), celle que la personne a choisie.
function _mcRepSelection(code, r) {
  if (r.niveau === 'A') { return r.preselection; }
  var trouvee = null;
  r.fiches.forEach(function (f) { if (f.code === code) { trouvee = f; } });
  return trouvee;
}
function _mcRepFichePrete(code, nom) {
  _mcUi.noms[code] = nom;
  var f = _mcFichePrete(code);
  if (f) { return f; }
  if (!_mcRep.chargeFiche[code] && typeof chargerFicheRome === 'function') {
    _mcRep.chargeFiche[code] = 'encours';
    chargerFicheRome(code, function (ok) { _mcRep.chargeFiche[code] = ok ? 'ok' : 'echec'; if (_mcRep.redessiner) { _mcRep.redessiner(); } });
  }
  return null;
}
function _mcRepLignesDeLaPersonne(etat, exp) {
  var cles = {};
  ((etat.ajoute.missions || {})[exp.idEtape] || []).forEach(function (l) { cles[mcCleTexte(l)] = true; });
  return mcLignes(exp.missions).filter(function (l) { return !cles[mcCleTexte(l)]; });
}
// Le panneau, commun aux deux voies (« Corriger mon CV » et « Le refaire moi-même ») : il ne connaît pas l'endroit où les choix sont rangés.
//   sel : la fiche retenue (ou null) ; dejaLa : les lignes déjà dans le CV de la personne ; missionCochee(texte) et competenceCochee(type, texte) : l'état des cases ; types : les familles de compétences proposées.
function _mcRepHtmlPanneau(rech, sel, dejaLa, missionCochee, competenceCochee, types) {
  var choix = '';
  if (rech.niveau === 'B') {
    choix = '<p class="small text-muted mb-1">Plusieurs fiches sont proches de votre poste. Choisissez la plus juste.</p><div class="vp-cartes mb-2">';
    rech.fiches.forEach(function (f) { choix += _mcPuce('data-mc-rep-fiche="' + _mcT(f.code) + '"', _mcT(f.nom), !!sel && sel.code === f.code); });
    choix += '</div>';
  }
  if (!sel) { return '<div class="mt-2" id="mcRepPanneau">' + choix + '</div>'; }
  var fiche = _mcRepFichePrete(sel.code, sel.nom);
  if (!fiche) {
    return '<div class="mt-2" role="status">' + choix + '<p class="mb-0 small text-muted">' +
      (_mcRep.chargeFiche[sel.code] === 'echec' ? 'La fiche n’a pas pu être chargée. Vous pouvez continuer sans elle.' : 'Chargement de la fiche du métier…') + '</p></div>';
  }
  var cles = {};
  dejaLa.forEach(function (l) { cles[mcCleTexte(l)] = true; });
  var h = '<div class="mt-2" id="mcRepPanneau">' + choix + '<p class="small text-muted mb-2">Fiche du métier : <strong>' + _mcT(fiche.nom || sel.nom) + '</strong>. Cochez ce que vous avez réellement fait. Rien ne s’ajoute à votre CV sans votre clic.</p>';
  if (dejaLa.length) {
    h += '<p class="fw-bold mb-1">Déjà dans votre CV</p><div class="vp-cartes mb-2">';
    dejaLa.forEach(function (l) { h += '<span class="vp-carte vp-longue coche fixe" aria-disabled="true">' + _mcT(l) + '</span>'; });
    h += '</div>';
  }
  var propositions = '';
  fiche.m.forEach(function (m, k) {
    var cochee = !!missionCochee(m);
    if (cles[mcCleTexte(m)] && !cochee) { return; }
    propositions += '<div class="vp-ligne">' + _mcPuce('data-mc-rep-m="' + k + '"', _mcT(m), cochee, 'vp-longue') + '</div>';
  });
  h += '<p class="fw-bold mb-1">Missions de la fiche à ajouter</p>' + (propositions || '<p class="small text-muted">Votre CV contient déjà toutes les missions de la fiche.</p>');
  var comps = '';
  [['sf', 'Savoir-faire'], ['se', 'Savoir-être'], ['sv', 'Savoirs']].filter(function (p) { return types.indexOf(p[0]) >= 0; }).forEach(function (p) {
    if (!(fiche[p[0]] || []).length) { return; }
    comps += '<p class="small text-muted mb-1 mt-2">' + p[1] + '</p><div class="vp-cartes">';
    fiche[p[0]].forEach(function (v) { comps += _mcPuce('data-mc-rep-c="' + p[0] + '" data-v="' + _mcT(v) + '"', _mcT(v), !!competenceCochee(p[0], v)); });
    comps += '</div>';
  });
  if (comps) { h += '<p class="fw-bold mb-1 mt-3">Compétences de la fiche à ajouter</p>' + comps; }
  return h + '</div>';
}
function _mcRepPanneauReprise(exp, rech) {
  var etat = dossier.etapeMC, id = exp.idEtape, choisies = {};
  (etat.miss[id] || []).forEach(function (m) { choisies[m] = true; });
  return _mcRepHtmlPanneau(rech, _mcRepSelection(_mcRep.choisi[id], rech), _mcRepLignesDeLaPersonne(etat, exp),
    function (m) { return choisies[m]; }, function (type, v) { return mcCochees(etat, id, type).indexOf(v) >= 0; }, ['sf', 'se', 'sv']);
}
// Appelée par le formulaire d'expérience (js/app.js) : renvoie le bouton (et le panneau ouvert), ou rien si aucune fiche reconnue.
function mcHtmlComplementReprise(index) {
  if (!_mcRepApplicable(index)) { return ''; }
  dossier.etapeMC = mcEtatNormalise(dossier.etapeMC);
  mcRelier(dossier.etapeMC, dossier.experiences);
  _mcRep.redessiner = _mcRepRedessiner;
  var exp = dossier.experiences[index], rech = _mcRepFiche(exp);
  if (!rech) { return ''; }
  var ouvert = _mcRep.ouvert && _mcRep.index === index;
  return (typeof _vpStyle === 'function' ? _vpStyle() : '') + '<div class="mt-2 mb-2" id="mcRepZone" data-index="' + index + '">' +
    '<button type="button" class="btn btn-outline-primary btn-sm" data-mc-rep="bascule" aria-expanded="' + (ouvert ? 'true' : 'false') + '">' +
    (ouvert ? 'Fermer la fiche du métier' : 'Compléter avec la fiche du métier') + '</button>' + (ouvert ? _mcRepPanneauReprise(exp, rech) : '') + '</div>';
}
// Reporte les missions de l'expérience dans la réponse de l'assistant (si elle en a une pour cette expérience) : le moteur du CV lit celle-là en premier.
function mcReporterMissionsChezAssistant(exp) {
  var reco = dossier && dossier.ia && dossier.ia.cv && dossier.ia.cv.recommandations;
  if (!reco || !Array.isArray(reco.savoirFaireParExperience) || typeof trouverEntreeExperienceIA !== 'function') { return false; }
  var entree = trouverEntreeExperienceIA(reco.savoirFaireParExperience, exp.poste, exp.entreprise);
  if (!entree) { return false; }
  entree.missions = mcLignes(exp.missions);
  return true;
}
// Ce que la personne a tapé dans le formulaire passe dans le dossier avant tout ajout (jamais perdu), et le formulaire garde son brouillon.
// « Annuler » (dette B.70 n° 2, consigne 340) : une photo du dossier est prise avant le PREMIER clic du panneau pour cette expérience, et rendue si la personne annule ou change d'expérience.
var _mcPhotoReprise = null;
function mcAnnulerReprise() {
  var photo = _mcPhotoReprise;
  _mcPhotoReprise = null;
  if (!photo || typeof dossier === 'undefined' || !dossier) { return false; }
  var rendu = mcRestaurerReprise(dossier, photo);
  _mcRep.ouvert = false;
  return rendu;
}
// « Valider » (ou toute sortie qui garde les changements) : la photo ne sert plus.
function mcValiderReprise() { _mcPhotoReprise = null; }
function _mcRepVerser(index) {
  if (!_mcPhotoReprise || _mcPhotoReprise.index !== index) { _mcPhotoReprise = mcPhotographierReprise(dossier, index); }
  var exp = dossier.experiences[index], brouillon = _expInlineLireDom();
  exp.missions = String(brouillon.missions || '').trim();
  _expInlineBrouillon = brouillon;
  return { exp: exp, brouillon: brouillon };
}
function _mcRepFinir(v) {
  mcAppliquerAuDossier(dossier.etapeMC, dossier, _mcOutils());
  mcReporterMissionsChezAssistant(v.exp);
  v.brouillon.missions = v.exp.missions || '';
  _mcRep.rerender();
}
function mcBrancherComplementReprise(rerender) {
  _mcRep.rerender = rerender;
  var zone = document.getElementById('mcRepZone');
  if (!zone) { return; }
  zone.addEventListener('click', function (e) {
    var t = e.target.closest('[data-mc-rep],[data-mc-rep-fiche],[data-mc-rep-m],[data-mc-rep-c]');
    if (!t) { return; }
    var index = parseInt(zone.getAttribute('data-index'), 10), etat = dossier.etapeMC, v, sel, fiche, id;
    if (t.hasAttribute('data-mc-rep')) {
      _mcRepVerser(index);
      _mcRep.ouvert = !(_mcRep.ouvert && _mcRep.index === index); _mcRep.index = index;
      rerender(); return;
    }
    var rech = _mcRepFiche(dossier.experiences[index]);
    if (!rech) { return; }
    if (t.hasAttribute('data-mc-rep-fiche')) {
      v = _mcRepVerser(index);
      _mcRep.choisi[v.exp.idEtape] = t.getAttribute('data-mc-rep-fiche');
      if (etat.fiches[v.exp.idEtape] && etat.fiches[v.exp.idEtape] !== _mcRep.choisi[v.exp.idEtape]) { mcChoisirFiche(etat, v.exp.idEtape, _mcRep.choisi[v.exp.idEtape]); }
      _mcRepFinir(v); return;
    }
    sel = _mcRepSelection(_mcRep.choisi[dossier.experiences[index].idEtape], rech);
    fiche = sel ? _mcFichePrete(sel.code) : null;
    if (!fiche) { return; }
    v = _mcRepVerser(index); id = v.exp.idEtape;
    if (etat.fiches[id] !== sel.code) { mcChoisirFiche(etat, id, sel.code); }
    if (t.hasAttribute('data-mc-rep-m')) { mcBasculerMission(etat, id, fiche.m[parseInt(t.getAttribute('data-mc-rep-m'), 10)]); }
    else { mcBasculerCompetence(etat, id, t.getAttribute('data-mc-rep-c'), t.getAttribute('data-v')); }
    _mcRepFinir(v);
  });
  zone.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('vp-carte') && !e.target.classList.contains('fixe')) { e.preventDefault(); e.target.click(); }
  });
}
// « Valider ces modifications » : si la personne a utilisé la fiche pour cette expérience, le texte final du formulaire fait foi aussi chez l'assistant.
function mcApresValidationExperience(index) {
  var exp = (dossier.experiences || [])[index];
  if (!exp || !dossier.etapeMC || dossier.modeCreation !== 'maj' || !exp.idEtape) { return; }
  var ajoutees = ((dossier.etapeMC.ajoute || {}).missions || {})[exp.idEtape] || [];
  if (ajoutees.length) { mcReporterMissionsChezAssistant(exp); }
}

/* ---------- Lot 7 (consigne 313) : le message du CV pour le chemin (a) ----------
   Si la personne a fait des choix dans l'étape, le message envoyé à l'assistant devient : instructions du CV (prompts/cv.md, inchangé), puis le bloc
   prompts/cv-choix-personne.md (qui prime sur le point 6 : l'assistant ne réécrit rien, il complète et signale), puis le profil, puis la section
   « CHOIX DE LA PERSONNE ». Sinon (chemin b, module fermé, fichier pas encore chargé) : renvoie '' et le message d'avant part, sans aucun changement. */
function mcMessageCVChemin(profilTexte) {
  if (typeof MC_OUVERT === 'undefined' || MC_OUVERT !== true || (typeof mcActifPourCeCv === 'function' && !mcActifPourCeCv()) || typeof dossier === 'undefined' || !dossier) { return ''; }   // choix « l'assistant » : l'ancien message (prompts/cv.md) part, comme avant
  if (typeof promptsExternesCharges === 'undefined') { return ''; }
  var sansLien = promptsExternesCharges['cv-missions-sans-lien'];
  if (mcCheminAssistant(dossier.etapeMC) !== 'a') {
    // Chemin (b) : cv.md inchangé, plus le complément « expériences sans lien avec le métier visé » (consigne 322).
    return mcAssemblerMessageSansChoix(promptsExternesCharges.cv, sansLien, profilTexte);
  }
  var bloc = mcPropre(promptsExternesCharges['cv-choix-personne']) && mcPropre(sansLien)
    ? promptsExternesCharges['cv-choix-personne'] + '\n\n' + sansLien : '';
  return mcAssemblerMessageChemin(promptsExternesCharges.cv, bloc, profilTexte,
    mcSectionChoixPersonne(dossier.etapeMC, dossier.experiences || []));
}

/* ---------- Lot 6 (consigne 312) : voie 3, « Le refaire moi-même dans un modèle » (modules/cv-sans-assistant/) ----------
   Même bouton et même panneau que la voie 1 (_mcRepHtmlPanneau), sur chaque carte d'expérience de la page « Vérifier mes fiches ».
   Ici les missions sont une LISTE DE TEXTES (fiche.experience[n].missions) et les compétences vont dans les rubriques de la fiche (competences, qualites) :
   la conversion avec le texte à lignes du dossier se fait déjà, en un seul endroit, à la fin du parcours (csaRestituerMissions). Rien n'est reformulé :
   chaque ajout est une ligne de la fiche du métier, cochée par la personne, retirable d'un clic. */
function _mc3Redessiner() {
  if (document.getElementById('csaFiches') && typeof _csaRendreFichesZone === 'function') { _csaRendreFichesZone(); }
}
function _mc3Etat(e) {
  if (!e.ficheMC) { e.ficheMC = { ouvert: false, code: null, ajoute: { m: [], sf: [], se: [] } }; }
  return e.ficheMC;
}
var _MC3_RUBRIQUE = { sf: 'competences', se: 'qualites' };
function _mc3Present(liste, texte) {
  var c = mcCleTexte(texte);
  return (liste || []).some(function (x) { return mcCleTexte(x) === c; });
}
// Appelée par la page « Vérifier mes fiches » : renvoie le bouton (et le panneau ouvert), ou rien si aucune fiche proche (consigne 284).
function mcHtmlComplementVoie3(n, e) {
  if (typeof MC_OUVERT === 'undefined' || MC_OUVERT !== true || (typeof mcActifPourCeCv === 'function' && !mcActifPourCeCv()) || !e || !mcPropre(e.poste)) { return ''; }
  _mcRep.redessiner = _mc3Redessiner;
  var rech = _mcRepFiche(e);
  if (!rech) { return ''; }
  var s = _mc3Etat(e), F = _csaEtat.fiches, h;
  h = (s.ouvert && typeof _vpStyle === 'function' ? _vpStyle() : '') + '<div class="mc3-zone mt-2 mb-2" data-n="' + n + '">' +
    '<button type="button" class="btn btn-sm btn-outline-primary" data-mc3="bascule" aria-expanded="' + (s.ouvert ? 'true' : 'false') + '" style="border-radius:8px;">' +
    (s.ouvert ? 'Fermer la fiche du métier' : 'Compléter avec la fiche du métier') + '</button>';
  if (s.ouvert) {
    h += _mcRepHtmlPanneau(rech, _mcRepSelection(s.code, rech),
      (e.missions || []).filter(function (l) { return !_mc3Present(s.ajoute.m, l); }),
      function (m) { return _mc3Present(s.ajoute.m, m); },
      function (type, v) { return _mc3Present(F[_MC3_RUBRIQUE[type]], v); }, ['sf', 'se']) +
      '<p class="small text-muted mt-2 mb-0">Les compétences cochées s’ajoutent aux rubriques « Compétences professionnelles » et « Compétences comportementales » de votre fiche.</p>';
  }
  return h + '</div>';
}
// Retire de la fiche ce que la fiche du métier y avait ajouté (changement de fiche) : jamais ce que la personne a écrit.
function _mc3RetirerAjouts(F, e, s) {
  e.missions = (e.missions || []).filter(function (l) { return !_mc3Present(s.ajoute.m, l); });
  ['sf', 'se'].forEach(function (t) {
    var rub = _MC3_RUBRIQUE[t];
    F[rub] = (F[rub] || []).filter(function (l) { return !_mc3Present(s.ajoute[t], l); });
  });
  s.ajoute = { m: [], sf: [], se: [] };
}
// Branché sur le clic de la zone des fiches : renvoie vrai si le clic était pour le bouton ou le panneau.
function mcClicComplementVoie3(ev, F, redessiner) {
  var z = ev.target.closest('.mc3-zone');
  if (!z) { return false; }
  var t = ev.target.closest('[data-mc3],[data-mc-rep-fiche],[data-mc-rep-m],[data-mc-rep-c]');
  if (!t) { return true; }
  var e = F.experience[parseInt(z.getAttribute('data-n'), 10)];
  if (!e) { return true; }
  var s = _mc3Etat(e), rech, sel, fiche, r, type;
  if (t.hasAttribute('data-mc3')) { s.ouvert = !s.ouvert; redessiner(); return true; }
  rech = _mcRepFiche(e);
  if (!rech) { return true; }
  if (t.hasAttribute('data-mc-rep-fiche')) {
    var code = t.getAttribute('data-mc-rep-fiche');
    if (s.code !== code) { _mc3RetirerAjouts(F, e, s); s.code = code; }
    redessiner(); return true;
  }
  sel = _mcRepSelection(s.code, rech);
  fiche = sel ? _mcFichePrete(sel.code) : null;
  if (!fiche) { return true; }
  if (t.hasAttribute('data-mc-rep-m')) {
    r = mcBasculerAjout(e.missions, s.ajoute.m, fiche.m[parseInt(t.getAttribute('data-mc-rep-m'), 10)]);
    e.missions = r.liste; s.ajoute.m = r.ajoutes;
  } else {
    type = t.getAttribute('data-mc-rep-c');
    if (_MC3_RUBRIQUE[type]) {
      r = mcBasculerAjout(F[_MC3_RUBRIQUE[type]], s.ajoute[type], t.getAttribute('data-v'));
      F[_MC3_RUBRIQUE[type]] = r.liste; s.ajoute[type] = r.ajoutes;
    }
  }
  redessiner();
  return true;
}
