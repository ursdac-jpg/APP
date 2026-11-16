/* ============================================================
   Panneau « Ajouter une expérience professionnelle » (lot 2 du plan docs/PLAN_DE_CODAGE_PANNEAU_EXPERIENCES_PRO_2026-11-15.md ;
   consignes 365, 388, 389, 390 ; maquette docs/MAQUETTE_PANNEAU_EXPERIENCES_PRO_2026-11-15.html).
   Le panneau regarde le PASSÉ : la personne indique le maximum de ce qu'elle a fait (métier, missions, compétences, ses mots).
   Le brouillon vit ici ; rien n'entre dans le dossier avant « Je valide » (« Annuler » n'a donc rien à défaire).
   À la validation, tout passe par la brique de l'étape (etape.js) : mêmes missions et mêmes compétences que la page « Vos missions et compétences ».
   Chargé après ui.js (il s'appuie sur ses fonctions) et avant js/app.js, qui l'appelle depuis contenuExperiencesProInline() et wireExperiencesProInline().
   Lot 2 : seulement dans « Vos informations » du parcours « Créer un nouveau CV ». Les autres écrans gardent l'ancien formulaire (lot 3).
   ============================================================ */

var MC_PAN_MISSIONS = { min: 5, max: 8, alerte: 10 };   // propositions de la maquette, à confirmer par Denis à l'essai
var MC_PAN_COMPETENCES = { min: 6, max: 10, alerte: 12 };
var MC_PAN_NB_PROPOSES = 6;
var MC_PAN_MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
var MC_PAN_TYPES = [['sf', 'Savoir-faire', 'ce que vous savez faire'], ['se', 'Savoir-être', 'ce qui vous caractérise au travail'], ['sv', 'Savoirs', 'ce que vous savez']];

// Mémoire de l'écran : le brouillon en cours (jamais enregistré) et la fonction qui redessine le rectangle.
var _mcPan = { brouillon: null, rerender: null };

function _mcPanE(t) { return echapperAttribut(t); }
function _mcPanMaj1(t) { t = String(t || ''); return t.length && t.charAt(0) !== t.charAt(0).toUpperCase() ? t.charAt(0).toUpperCase() + t.slice(1) : t; }

// Le nouveau panneau s'applique dans « Vos informations » de « Créer un nouveau CV » (mode 'nouveau') et de « Corriger mon CV » (mode 'maj', lot 3).
// Aussi à l'étape 9 « Vos expériences » du parcours « à partir de mon récit » (décision de Denis, consigne 396, qui remplace la consigne 393 pour cette étape).
// Jamais : dans la fenêtre ni l'édition en place du Bilan, quand la page est ouverte depuis le Bilan, ni depuis « Un CV, plusieurs métiers ».
function mcPanneauActif() {
  var recit = typeof pageActuelle !== 'undefined' && pageActuelle === 'decouverte' && typeof _decouverteNumeroCourant !== 'undefined' && _decouverteNumeroCourant === 9;
  return typeof MC_OUVERT !== 'undefined' && MC_OUVERT === true && !(typeof mcActifPourCeCv === 'function' && !mcActifPourCeCv()) && typeof dossier !== 'undefined' && !!dossier &&
    (recit || ((dossier.modeCreation === 'nouveau' || dossier.modeCreation === 'maj') && typeof pageActuelle !== 'undefined' && pageActuelle === 'projet')) &&
    !(typeof _depuisBilanVersProjet !== 'undefined' && _depuisBilanVersProjet) &&
    !(typeof _pageOrigineAvantProjet !== 'undefined' && _pageOrigineAvantProjet === 'un-cv-plusieurs-metiers') &&
    !(typeof _blocEditionCvBilanEnCours !== 'undefined' && _blocEditionCvBilanEnCours) && !(typeof _expInlineModeUnique !== 'undefined' && _expInlineModeUnique);
}

// ---------- Dates : année seule, ou « AAAA-MM » quand la personne a coché « mois » (format déjà lu par modules/cv-core/dates.js) ----------
function _mcPanLireDate(valeur) {
  var m = String(valeur || '').match(/^((?:19|20)\d{2})(?:-(\d{2}))?/);
  if (!m) { return { annee: String(valeur || '').replace(/\D/g, '').slice(0, 4), mois: '' }; }
  var n = m[2] ? parseInt(m[2], 10) : 0;
  return { annee: m[1], mois: (n >= 1 && n <= 12) ? MC_PAN_MOIS[n - 1] : '' };
}
function _mcPanEcrireDate(annee, mois, avecMois) {
  var a = String(annee || '').replace(/\D/g, '').slice(0, 4);
  var n = MC_PAN_MOIS.indexOf(mois) + 1;
  return (avecMois && a.length === 4 && n > 0) ? a + '-' + ('0' + n).slice(-2) : a;
}

// ---------- Brouillon ----------
function _mcPanVide() {
  return { index: null, poste: '', metiers: [], secteurIdx: null, choixSecteur: false, panneauOuvert: false, filtre: '', filtreTous: false, deploye: {}, detOuvert: {},
    maxMetiers: 1 + MC_MAX_METIERS_PLUS, missions: [], missionsPerso: [], comp: { sf: [], se: [], sv: [], k: [] }, compPerso: [], kDeploye: false, texteAncien: '',
    entreprise: '', debut: '', fin: '', enPoste: false, avecMois: false, moisDebut: '', moisFin: '' };
}
function _mcPanNomMetier(code) {
  var met = (typeof baseMetiers !== 'undefined') ? mcMetierParCode(baseMetiers, code) : null;
  return (met && met.nom) || code;
}
// Brouillon d'une expérience déjà dans le dossier : ce que la personne y avait écrit et choisi (panneau ou page), rien n'est perdu.
function _mcPanDepuisDossier(index) {
  var e = dossier.experiences[index], b = _mcPanVide();
  b.index = index; b.poste = e.poste || ''; b.entreprise = e.entreprise || '';
  var d = _mcPanLireDate(e.dateDebut), f = _mcPanLireDate(e.dateFin);
  b.debut = d.annee; b.moisDebut = d.mois; b.fin = f.annee; b.moisFin = f.mois; b.enPoste = !e.dateFin; b.avecMois = !!(d.mois || f.mois);
  dossier.etapeMC = mcEtatNormalise(dossier.etapeMC);
  var etat = dossier.etapeMC;
  mcRelier(etat, dossier.experiences);
  var id = e.idEtape;
  b.metiers = mcCodesMetiers(etat, id).map(function (c) { return { code: c, nom: _mcPanNomMetier(c) }; });
  b.missions = (etat.miss[id] || []).slice();
  b.missionsPerso = (etat.perso[id] || []).slice();
  MC_TYPES.forEach(function (t) { b.comp[t] = mcCochees(etat, id, t).slice(); });
  b.compPerso = ((etat.compPerso[id] || {}).sf || []).slice();
  // Le texte d'origine : les lignes que l'étape n'a pas écrites elle-même (jamais touchées, jamais perdues).
  var ajoutees = {};
  ((etat.ajoute.missions || {})[id] || []).forEach(function (l) { ajoutees[mcCleTexte(l)] = true; });
  b.texteAncien = mcLignes(e.missions).filter(function (l) { return !ajoutees[mcCleTexte(l)]; }).join('\n');
  return b;
}
// Le brouillon correspond-il à ce que demandent les drapeaux partagés (_expInlineFormOuvert / _expInlineEditIndex) ?
function _mcPanBrouillon() {
  if (!_expInlineFormOuvert) { _mcPan.brouillon = null; return null; }
  var cible = _expInlineEditIndex;   // null = ajout
  if (_mcPan.brouillon && _mcPan.brouillon.index === cible) { return _mcPan.brouillon; }
  _mcPan.brouillon = (cible !== null && dossier.experiences && dossier.experiences[cible]) ? _mcPanDepuisDossier(cible) : _mcPanVide();
  return _mcPan.brouillon;
}
function _mcPanFermer() { _mcPan.brouillon = null; _expInlineReset(); }

// ---------- Données : le répertoire du ROME et la fiche de chaque métier choisi, à la demande ----------
function _mcPanFiche(code) { return typeof _mcFichePrete === 'function' ? _mcFichePrete(code) : null; }
var _mcPanEchec = {};
function _mcPanCharger(b) {
  if (!b) { return; }
  var index = _fmIndex();
  if (!index && typeof chargerRepertoireElargi === 'function' && !_mcPan.repDemande && (typeof _repertoireRomeEtat === 'undefined' || _repertoireRomeEtat === 'non' || _repertoireRomeEtat === 'encours')) {
    _mcPan.repDemande = true;
    chargerRepertoireElargi(function () { _mcPan.repDemande = false; _mcPanRedessiner(); });
  }
  b.metiers.forEach(function (m) {
    if (_mcPanFiche(m.code) || _mcPanEchec[m.code] || (typeof _mcUi !== 'undefined' && _mcUi.charge[m.code] === 'encours')) { return; }
    if (typeof _mcUi !== 'undefined') { _mcUi.charge[m.code] = 'encours'; }
    chargerFicheRome(m.code, function (f) {
      if (typeof _mcUi !== 'undefined') { _mcUi.charge[m.code] = f ? 'ok' : 'echec'; }
      if (!f) { _mcPanEchec[m.code] = true; }
      _mcPanRedessiner();
    });
  });
}
function _mcPanRedessiner() { if (_mcPan.rerender && _mcPan.brouillon && document.getElementById('mcPanRacine')) { _mcPan.rerender(); } }

// ---------- Suggestions pendant la frappe : la même recherche que la barre de l'accueil ----------
function _mcPanSuggestions(b) {
  if (b.poste.trim().length < 3 || typeof rechercherMetiersPourAjout !== 'function') { return []; }
  var vus = {}, r = [], max = MC_PAN_NB_PROPOSES + 2;
  // 1) la recherche de la barre de l'accueil, 2) pour compléter, les noms du répertoire qui commencent par ce qui est tapé, puis ceux dont chaque mot commence ainsi (comme la maquette).
  (rechercherMetiersPourAjout(b.poste, false) || []).forEach(function (m) {
    var cle = mcNormaliser(m && m.nom);
    if (m && m.rome && m.nom && !vus[cle]) { vus[cle] = true; r.push({ code: m.rome, nom: m.nom }); }
  });
  if (r.length < max && typeof REPERTOIRE_ROME !== 'undefined' && REPERTOIRE_ROME && REPERTOIRE_ROME.metiers && typeof mcNormaliser === 'function') {
    var q = mcNormaliser(b.poste), mots = q.split(' ').filter(Boolean), debut = [], contient = [];
    REPERTOIRE_ROME.metiers.forEach(function (l) {
      var n = mcNormaliser(l[0]);
      if (vus[n]) { return; }
      if (n.indexOf(q) === 0) { vus[n] = true; debut.push({ code: l[1], nom: l[0] }); return; }
      var mn = n.split(' ');
      if (mots.every(function (w) { return mn.some(function (x) { return x.indexOf(w) === 0; }); })) { vus[n] = true; contient.push({ code: l[1], nom: l[0] }); }
    });
    var tri = function (x, y) { return x.nom.length - y.nom.length; };
    r = r.concat(debut.sort(tri), contient.sort(tri));
  }
  return r.slice(0, max);
}
function _mcPanHtmlSuggestions(b) {
  if (b.poste.trim().length < 3) { return '<p class="fm-aide">Tapez les premières lettres : des métiers vous sont proposés.</p>'; }
  var s = _mcPanSuggestions(b), principal = b.metiers[0];
  if (!s.length) {
    return '<p class="fm-aide">Aucun métier ne ressemble à ce que vous avez écrit. Ce n’est pas grave : votre intitulé est gardé tel quel, et vous pouvez choisir un secteur plus bas pour trouver des missions.</p>';
  }
  return '<p class="fm-aide" style="margin-top:.2rem">Cliquez sur le métier qui correspond à votre poste :</p><div class="pastilles">' +
    s.map(function (m) {
      var actif = !!principal && principal.code === m.code && principal.nom === m.nom;
      return '<button type="button" class="jeton jeton--radio jeton--compact' + (actif ? ' is-actif' : '') + '" data-pan-sugg="' + _mcPanE(m.code) + '" data-pan-nom="' + _mcPanE(m.nom) + '" aria-pressed="' + (actif ? 'true' : 'false') + '">' + _mcPanE(m.nom) + '</button>';
    }).join('') + '</div>';
}
function _mcPanMajSuggestions(b) { var z = document.getElementById('mcPanSugg'); if (z) { z.innerHTML = _mcPanHtmlSuggestions(b); } }

// ---------- Métier et secteur ----------
function _mcPanProches(b, index) {
  var p = b.metiers[0];
  if (!p || !index || !index.parCode[p.code]) { return []; }
  var fiche = (typeof FICHES_ROME !== 'undefined') ? FICHES_ROME[p.code] : null;
  var pris = {}; pris[p.code] = true;
  var r = [];
  ((fiche && fiche.p) || []).forEach(function (c) { if (r.length < MC_PAN_NB_PROPOSES && index.parCode[c] && !pris[c]) { pris[c] = true; r.push(index.parCode[c]); } });
  if (r.length < MC_PAN_NB_PROPOSES) {
    Object.keys(index.parCode).forEach(function (c) {
      var m = index.parCode[c];
      if (r.length < MC_PAN_NB_PROPOSES && !pris[c] && m.d === index.parCode[p.code].d && c.slice(0, 3) === p.code.slice(0, 3)) { pris[c] = true; r.push(m); }
    });
  }
  return r;
}
function _mcPanSecteurRef(b, index) {
  // Le secteur de départ : celui du métier principal, sinon celui de la première suggestion.
  var m = b.metiers[0] ? index.parCode[b.metiers[0].code] : null;
  if (!m) { var s = _mcPanSuggestions(b)[0]; m = s ? index.parCode[s.code] : null; }
  return m ? [m] : [];
}
function _mcPanRubriqueMetiers(b) {
  var h = '<div class="fm-choix"><p class="fm-q">Votre métier et son secteur ' + _fmEtiquette('choix') + '</p>';
  var index = _fmIndex();
  if (!index) {
    var echec = (typeof _repertoireRomeEtat !== 'undefined' && _repertoireRomeEtat === 'echec');
    return h + '<p class="fm-aide" style="margin-top:0">' + (echec ? 'Les métiers n’ont pas pu être chargés pour le moment. Vous pouvez décrire avec vos mots ce que vous avez fait, plus bas.' : 'Chargement des métiers...') + '</p></div>';
  }
  var ref = _mcPanSecteurRef(b, index), idx = _fmSecteurCourant(b, ref), prox = _mcPanProches(b, index);
  var texteSecteur;
  if (idx === null) { texteSecteur = 'Aucun secteur pour l’instant. Choisissez-en un pour trouver des métiers et des missions.'; }
  else if (b.secteurIdx === null) { texteSecteur = 'Ce métier fait partie du secteur : <b>' + _mcPanE(index.domaines[idx]) + '</b>'; }
  else { texteSecteur = 'Secteur de recherche : <b>' + _mcPanE(index.domaines[idx]) + '</b>'; }
  h += '<div class="fm-ligne fm-haut"><p class="fm-aide" style="margin:0;flex:1 1 14rem">' + texteSecteur + '</p>' +
    '<button type="button" class="btn btn-sm btn-outline-primary fm-btn-large" data-fm-changer-secteur="1">' + (idx === null ? 'Choisir un secteur' : 'Changer de secteur') + '</button></div>';
  if (b.choixSecteur) { h += _fmHtmlChoixSecteur(b, index, idx); }
  h += '<div class="fm-ligne fm-limite"><p class="fm-aide" style="margin:0;flex:1 1 14rem"><b>Vous pouvez choisir jusqu’à ' + b.maxMetiers + ' métiers.</b> Le premier est votre métier principal, les autres le complètent : certaines de leurs missions peuvent aussi être les vôtres.' +
    (b.metiers.length >= b.maxMetiers ? ' Décochez-en un pour en choisir un autre.' : '') + '</p>' +
    (idx !== null ? '<button type="button" class="btn btn-sm btn-outline-primary fm-btn-large" data-fm-chercher="1" aria-expanded="' + (b.panneauOuvert ? 'true' : 'false') + '">Chercher un autre métier</button>' : '') + '</div>';
  if (b.metiers.length) {
    h += '<p class="fm-aide mb-1">Métiers choisis : <b>' + b.metiers.map(function (m, i) { return _mcPanE(m.nom) + (i === 0 ? ' (principal)' : ''); }).join(' · ') + '</b></p>';
  }
  if (prox.length) {
    h += '<p class="fm-aide mb-1">Métiers proches, dans le même secteur :</p><div class="pastilles mb-1">' + prox.map(function (m) { return _fmJetonMetier(b, m, false, index); }).join('') + '</div>';
  }
  var affiches = {}; prox.forEach(function (m) { affiches[m.code] = true; });
  var supp = b.metiers.filter(function (m, i) { return i > 0 && !affiches[m.code]; });
  if (supp.length && !b.panneauOuvert) {
    h += '<p class="fm-aide mb-1">Autres métiers choisis :</p><div class="pastilles mb-1">' + supp.map(function (m) { return _fmJetonMetier(b, index.parCode[m.code] || { code: m.code, nom: m.nom, d: 0 }, true, index); }).join('') + '</div>';
  }
  if (b.panneauOuvert && idx !== null && !b.choixSecteur) {
    h += '<div class="fm-sous"><div class="fm-ligne"><p class="fm-q" style="margin:0">Chercher un métier dans ce secteur</p>' +
      '<button type="button" class="btn btn-sm btn-outline-secondary" data-fm-fermer-panneau="1">✕ Fermer</button></div>' +
      '<div style="margin:.4rem 0"><input type="text" class="form-control form-control-sm champ-optionnel" id="mcPanFiltre" placeholder="Tapez un mot (ex. : cuisine, caissier, réseau)" value="' + _mcPanE(b.filtre) + '"></div>' +
      '<p class="fm-aide" style="margin-top:0">Ou parcourez les métiers du secteur et cochez ceux qui vous correspondent :</p>' +
      '<div id="mcPanZoneListe">' + _fmHtmlListeSecteur(b, index, prox.concat(b.metiers.map(function (m) { return index.parCode[m.code]; }).filter(Boolean))) + '</div></div>';
  }
  return h + '</div>';
}
function _mcPanMajListeSecteur(b) {
  var z = document.getElementById('mcPanZoneListe'), index = _fmIndex();
  if (!z || !index) { return; }
  var prox = _mcPanProches(b, index);
  z.innerHTML = _fmHtmlListeSecteur(b, index, prox.concat(b.metiers.map(function (m) { return index.parCode[m.code]; }).filter(Boolean)));
}

// ---------- Missions et compétences (propositions des fiches de tous les métiers choisis) ----------
function _mcPanFusion(b) {
  var fiches = b.metiers.map(function (m) { return _mcPanFiche(m.code); });
  return mcFusionnerFiches(fiches);
}
function _mcPanNbComp(b) { return b.comp.sf.length + b.comp.se.length + b.comp.sv.length + b.comp.k.length + b.compPerso.length; }
function _mcPanNbMissions(b) { return b.missions.length + b.missionsPerso.length; }
function _mcPanJeton(attrs, coche, texte) {
  return '<button type="button" class="jeton jeton--compact' + (coche ? ' is-actif' : '') + '" ' + attrs + ' aria-pressed="' + (coche ? 'true' : 'false') + '">' + _mcPanE(texte) + '</button>';
}
function _mcPanGardeFou(nom, n, reglage) {
  var mot = nom === 'missions' ? (n > 1 ? 'missions choisies' : 'mission choisie') : (n > 1 ? 'compétences choisies' : 'compétence choisie');
  var h = '<div class="fm-garde"><b>Il ne faut pas tout cocher.</b> Choisissez les ' + reglage.min + ' à ' + reglage.max + ' ' + nom + ' les plus importantes : ce sont elles qui apparaîtront sur votre CV. Un CV lisible met en valeur peu de choses, bien choisies.</div>' +
    '<p class="fm-compteur' + (n > reglage.alerte ? ' trop' : '') + '" id="mcPanCompteur-' + (nom === 'missions' ? 'm' : 'c') + '">' + n + ' ' + mot + '</p>';
  if (n > reglage.alerte) { h += '<p class="fm-aide" style="margin-top:0;font-weight:700">Au-delà de ' + reglage.max + ', votre CV risque d’être long et vos meilleures ' + nom + ' se perdent. Gardez les plus importantes.</p>'; }
  return h;
}
function _mcPanRubriqueMissions(b) {
  if (!b.metiers.length) { return ''; }
  var h = '<div class="fm-miss"><p class="fm-q">Vos missions ' + _fmEtiquette('miss') + '</p>' +
    '<p class="fm-aide" style="margin-top:0">Cochez seulement ce que vous avez réellement fait dans ce poste.</p>' + _mcPanGardeFou('missions', _mcPanNbMissions(b), MC_PAN_MISSIONS);
  b.metiers.forEach(function (m, i) {
    var f = _mcPanFiche(m.code);
    h += '<details class="fm-det" data-pan-det="' + _mcPanE(m.code) + '"' + ((i === 0 || b.detOuvert[m.code]) ? ' open' : '') + '><summary>Missions du métier : ' + _mcPanE(m.nom) + (i === 0 ? ' (principal)' : '') + '</summary>';
    if (!f) { h += '<p class="fm-aide">' + (_mcPanEchec[m.code] ? 'La fiche de ce métier n’a pas pu être chargée : écrivez vos missions plus bas.' : 'Chargement de la fiche...') + '</p>'; }
    else if (!f.m.length) { h += '<p class="fm-aide">Aucune mission prête pour cette fiche : écrivez les vôtres plus bas.</p>'; }
    else { h += '<div class="pastilles mb-1">' + f.m.map(function (x) { return _mcPanJeton('data-pan-mission="' + _mcPanE(x) + '"', b.missions.indexOf(x) !== -1, x); }).join('') + '</div>'; }
    h += '</details>';
  });
  if (b.texteAncien !== '' || b.index !== null) {
    h += '<div class="fm-gris"><p class="fm-q" style="margin:0 0 .3rem">Ce que vous aviez écrit avant (conservé)</p>' +
      '<textarea class="form-control form-control-sm champ-optionnel" id="mcPanAncien" rows="2" placeholder="Rien d’écrit pour l’instant">' + _mcPanE(b.texteAncien) + '</textarea>' +
      '<p class="fm-aide">Votre texte d’origine n’est jamais perdu : il reste ici, modifiable.</p></div>';
  }
  h += '<p class="fm-fam">Une mission qui n’est pas dans la liste ?</p>' +
    '<div class="fm-ligne" style="justify-content:flex-start;flex-wrap:nowrap"><input type="text" class="form-control form-control-sm champ-optionnel" id="mcPanMissionLibre" placeholder="Écrivez-la avec vos mots (ex. : Préparer 80 couverts par service)" style="flex:1 1 auto">' +
    '<button type="button" class="btn btn-sm btn-outline-primary" data-pan-ajout-mission="1">+ Ajouter</button></div>' +
    (typeof CONSEIL_CHIFFRES_MISSIONS !== 'undefined' ? '<p class="fm-aide">' + CONSEIL_CHIFFRES_MISSIONS + '</p>' : '');
  if (b.missionsPerso.length) {
    h += '<p class="fm-aide mb-1">Vos propres missions :</p><div class="pastilles mb-1">' + b.missionsPerso.map(function (x, i) {
      return '<span class="pastille-mini-conteneur"><span class="pastille-mini-texte">' + _mcPanE(x) + '</span><span class="pastille-mini-croix" data-pan-suppr-mission="' + i + '" title="Retirer">&#10005;</span></span>';
    }).join('') + '</div>';
  }
  return h + '</div>';
}
function _mcPanRubriqueCompetences(b) {
  if (!b.metiers.length) { return ''; }
  var fusion = _mcPanFusion(b) || { sf: [], se: [], sv: [], k: [] };
  var h = '<div class="fm-miss"><p class="fm-q">Vos compétences ' + _fmEtiquette('miss') + '</p>' +
    '<p class="fm-aide" style="margin-top:0">Les compétences liées à votre métier. Une compétence n’apparaît qu’une seule fois, même si plusieurs métiers la partagent.</p>' + _mcPanGardeFou('compétences', _mcPanNbComp(b), MC_PAN_COMPETENCES);
  MC_PAN_TYPES.forEach(function (t) {
    var l = fusion[t[0]] || [];
    h += '<p class="fm-fam">' + t[1] + ' (' + t[2] + ')</p>';
    if (!l.length) { h += '<p class="fm-aide">Aucune proposition pour ce métier : ajoutez les vôtres plus bas.</p>'; }
    else { h += '<div class="pastilles mb-1">' + l.map(function (x) { return _mcPanJeton('data-pan-comp="' + t[0] + '" data-v="' + _mcPanE(x) + '"', b.comp[t[0]].indexOf(x) !== -1, x); }).join('') + '</div>'; }
    if (t[0] === 'sf') {
      var kl = (fusion.k || []).filter(function (x) { return l.indexOf(x) === -1; });
      if (kl.length) {
        if (b.kDeploye) { h += '<p class="fm-aide mb-1">Activités plus précises :</p><div class="pastilles mb-1">' + kl.map(function (x) { return _mcPanJeton('data-pan-comp="k" data-v="' + _mcPanE(x) + '"', b.comp.k.indexOf(x) !== -1, x); }).join('') + '</div>'; }
        else { h += '<button type="button" class="btn btn-sm btn-outline-primary mb-1" data-pan-k="1">Voir les ' + kl.length + ' activités plus précises</button>'; }
      }
    }
  });
  h += '<p class="fm-fam">Une compétence qui n’est pas dans la liste ?</p>' +
    '<div class="fm-ligne" style="justify-content:flex-start;flex-wrap:nowrap"><input type="text" class="form-control form-control-sm champ-optionnel" id="mcPanCompLibre" placeholder="Écrivez-la avec vos mots (ex. : Gérer une file d’attente)" style="flex:1 1 auto">' +
    '<button type="button" class="btn btn-sm btn-outline-primary" data-pan-ajout-comp="1">+ Ajouter</button></div>';
  if (b.compPerso.length) {
    h += '<p class="fm-aide mb-1">Vos propres compétences :</p><div class="pastilles mb-1">' + b.compPerso.map(function (x, i) {
      return '<span class="pastille-mini-conteneur"><span class="pastille-mini-texte">' + _mcPanE(x) + '</span><span class="pastille-mini-croix" data-pan-suppr-comp="' + i + '" title="Retirer">&#10005;</span></span>';
    }).join('') + '</div>';
  }
  return h + '</div>';
}

// ---------- Entreprise, période, mois ----------
function _mcPanRubriqueDates(b) {
  var h = '<div class="fm-gris"><p class="fm-q">Où et quand ?</p>' +
    '<div class="mb-2"><label class="small mb-1" for="mcPanEntreprise">Entreprise ou employeur</label><input type="text" class="form-control form-control-sm champ-optionnel" id="mcPanEntreprise" placeholder="Ex. Boulangerie Martin, Intérim Adecco" value="' + _mcPanE(b.entreprise) + '"></div>' +
    '<div class="row g-2 mb-2"><div class="col-6"><label class="small mb-1" for="mcPanDebut">Année de début</label><input type="text" inputmode="numeric" maxlength="4" class="form-control form-control-sm champ-optionnel" id="mcPanDebut" placeholder="Ex. 2021" value="' + _mcPanE(b.debut) + '"></div>' +
    '<div class="col-6"><label class="small mb-1" for="mcPanFin">Année de fin</label>' + (b.enPoste ? '<div class="form-control form-control-sm bg-light text-muted">En poste actuellement</div>' : '<input type="text" inputmode="numeric" maxlength="4" class="form-control form-control-sm champ-optionnel" id="mcPanFin" placeholder="Ex. 2023" value="' + _mcPanE(b.fin) + '">') + '</div></div>' +
    '<div id="mcPanMsgAnnees"></div>' +
    '<div class="form-check mb-1"><input class="form-check-input" type="checkbox" id="mcPanEnPoste"' + (b.enPoste ? ' checked' : '') + '><label class="form-check-label small" for="mcPanEnPoste">Je suis toujours en poste</label></div>' +
    '<div class="form-check mb-1"><input class="form-check-input" type="checkbox" id="mcPanAvecMois"' + (b.avecMois ? ' checked' : '') + '><label class="form-check-label small" for="mcPanAvecMois">Indiquer aussi le mois sur mon CV</label></div>';
  if (b.avecMois) {
    var opt = function (sel) { return '<option value="">Mois</option>' + MC_PAN_MOIS.map(function (m) { return '<option' + (m === sel ? ' selected' : '') + '>' + m + '</option>'; }).join(''); };
    h += '<div class="row g-2"><div class="col-6"><select class="form-select form-select-sm champ-optionnel" id="mcPanMoisDebut" aria-label="Mois de début">' + opt(b.moisDebut) + '</select></div>' +
      '<div class="col-6">' + (b.enPoste ? '' : '<select class="form-select form-select-sm champ-optionnel" id="mcPanMoisFin" aria-label="Mois de fin">' + opt(b.moisFin) + '</select>') + '</div></div>';
  }
  return h + '</div>';
}

// ---------- Boutons : « Annuler » (rouge) puis « Je valide » (bleu) ----------
function _mcPanAnneesIncoherentes(b) {
  return !b.enPoste && /^\d{4}$/.test(b.debut) && /^\d{4}$/.test(b.fin) && parseInt(b.fin, 10) < parseInt(b.debut, 10);
}
// Nouvelle expérience : intitulé et au moins une compétence. Expérience déjà dans le CV : l'intitulé suffit (décision du 15/11/2026, consigne 389).
function _mcPanPeutValider(b) {
  if (!b.poste.trim() || _mcPanAnneesIncoherentes(b)) { return false; }
  return b.index !== null ? true : _mcPanNbComp(b) >= 1;
}
function _mcPanManque(b) {
  var m = [];
  if (!b.poste.trim()) { m.push('l’intitulé du poste'); }
  if (b.index === null && _mcPanNbComp(b) < 1) { m.push('au moins une compétence'); }
  if (_mcPanAnneesIncoherentes(b)) { m.push('une année de fin qui ne soit pas avant le début'); }
  return m;
}
function _mcPanTexteRecap(b) {
  var nm = _mcPanNbMissions(b), nc = _mcPanNbComp(b);
  return 'Sur votre CV : ' + nm + (nm > 1 ? ' missions' : ' mission') + ', ' + nc + (nc > 1 ? ' compétences' : ' compétence');
}
function _mcPanHtmlBoutons(b) {
  var ok = _mcPanPeutValider(b), estEdit = b.index !== null;
  return '<div class="fm-recap" id="mcPanRecap">' + _mcPanTexteRecap(b) + '</div>' +
    '<div class="mt-2 d-flex gap-2 flex-wrap align-items-center">' +
    '<button type="button" class="btn btn-primary btn-sm fw-bold px-4" id="mcPanValider"' + (ok ? '' : ' style="display:none"') + '>' + (estEdit ? 'Valider ces modifications' : '&#10003; Je valide') + '</button>' +
    '<button type="button" class="btn btn-annuler btn-sm fw-bold px-4" id="mcPanAnnuler"' + ((estEdit || !ok) ? '' : ' style="display:none"') + '>&#10005; Annuler</button></div>' +
    '<p class="fm-aide" id="mcPanAide"' + (ok ? ' style="display:none"' : '') + '>Pour valider, il manque : <b>' + _mcPanManque(b).join(' et ') + '</b>. « Annuler » referme sans rien ajouter.</p>';
}
// Mise à jour des boutons, du compteur et du message sans redessiner (le curseur reste dans le champ en cours de frappe).
function _mcPanMajBoutons(b) {
  var ok = _mcPanPeutValider(b), estEdit = b.index !== null;
  var v = document.getElementById('mcPanValider'), a = document.getElementById('mcPanAnnuler'), aide = document.getElementById('mcPanAide'), rc = document.getElementById('mcPanRecap');
  if (v) { v.style.display = ok ? '' : 'none'; }
  if (a) { a.style.display = (estEdit || !ok) ? '' : 'none'; }
  if (aide) { aide.style.display = ok ? 'none' : ''; aide.innerHTML = 'Pour valider, il manque : <b>' + _mcPanManque(b).join(' et ') + '</b>. « Annuler » referme sans rien ajouter.'; }
  if (rc) { rc.textContent = _mcPanTexteRecap(b); }
  var msg = document.getElementById('mcPanMsgAnnees');
  if (msg) { msg.innerHTML = _mcPanAnneesIncoherentes(b) ? '<p class="small mb-2" role="alert" style="color:var(--danger)">L’année de fin ne peut pas être avant l’année de début. Corrigez l’une des deux années.</p>' : ''; }
}

// ---------- Le contenu du rectangle (appelé par contenuExperiencesProInline) ----------
function mcPanneauHtml(listeHtml) {
  var b = _mcPanBrouillon(), h = '<div class="fm-bloc" id="mcPanRacine">' + listeHtml;
  if (!b) { return h + '<button type="button" class="btn btn-primary btn-sm mt-2" id="btnExpProOuvrir">+ Ajouter une expérience</button></div>'; }
  _mcPanCharger(b);
  h += '<div class="fm-choix"><p class="fm-q">' + (b.index !== null ? 'Modifier cette expérience' : 'Quel poste avez-vous occupé ?') + '</p>' +
    '<input type="text" class="form-control form-control-sm champ-a-completer" id="mcPanPoste" autocomplete="off" placeholder="Ex. Serveur, Agent de production, Aide-soignant" value="' + _mcPanE(b.poste) + '">' +
    '<div id="mcPanSugg">' + _mcPanHtmlSuggestions(b) + '</div>' +
    '<p class="fm-aide">Votre intitulé reste tel que vous l’écrivez : c’est lui qui sera sur votre CV. Le métier choisi sert seulement à vous proposer des missions et des compétences.</p></div>';
  if (b.metiers.length || b.poste.trim().length >= 3) { h += _mcPanRubriqueMetiers(b); }
  h += _mcPanRubriqueMissions(b) + _mcPanRubriqueCompetences(b);
  if (b.poste.trim()) { h += _mcPanRubriqueDates(b); }
  return h + _mcPanHtmlBoutons(b) + '</div>';
}

// ---------- Validation : tout passe par la brique de l'étape ----------
function _mcPanValider() {
  var b = _mcPan.brouillon;
  if (!b || !_mcPanPeutValider(b)) { return false; }
  if (!Array.isArray(dossier.experiences)) { dossier.experiences = []; }
  var objet = {
    poste: b.poste.trim(), entreprise: b.entreprise.trim(), lieu: '',
    dateDebut: _mcPanEcrireDate(b.debut, b.moisDebut, b.avecMois),
    dateFin: b.enPoste ? '' : _mcPanEcrireDate(b.fin, b.moisFin, b.avecMois),
    missions: b.texteAncien.trim()
  };
  var rang;
  if (b.index !== null && dossier.experiences[b.index]) {
    // Modifier une expérience ne doit jamais effacer un champ que ce formulaire ne montre pas (lieu, identifiant d'étape...).
    dossier.experiences[b.index] = Object.assign({}, dossier.experiences[b.index], objet, { lieu: dossier.experiences[b.index].lieu || '' });
    rang = b.index;
  } else { dossier.experiences.push(objet); rang = dossier.experiences.length - 1; }
  var etat = dossier.etapeMC = mcEtatNormalise(dossier.etapeMC);
  mcRelier(etat, dossier.experiences);
  var id = dossier.experiences[rang].idEtape;
  var codes = b.metiers.map(function (m) { return m.code; });
  if (codes.length) {
    var parCode = {};
    codes.forEach(function (c) { var f = _mcPanFiche(c); if (f) { parCode[c] = f; } });
    mcDefinirMetiers(etat, id, codes, parCode);
  } else { delete etat.fiches[id]; delete etat.metiersPlus[id]; }
  etat.miss[id] = b.missions.slice();
  etat.perso[id] = b.missionsPerso.slice();
  var comp = {};
  MC_TYPES.forEach(function (t) { if (b.comp[t].length) { comp[t] = b.comp[t].slice(); } });
  if (b.compPerso.length) { etat.compPerso[id] = { sf: b.compPerso.slice() }; comp.sf = mcSansDoublon((comp.sf || []).concat(b.compPerso)); } else { delete etat.compPerso[id]; }
  etat.comp[id] = comp;
  mcMarquerPanneau(etat, id);
  mcAppliquerAuDossier(etat, dossier, _mcOutils());
  // « Corriger mon CV » : le moteur du CV lit d'abord la réponse de l'assistant ; les missions de l'expérience y sont reportées (comme le faisait « Compléter avec la fiche du métier »).
  if (typeof mcApresValidationExperience === 'function') { mcApresValidationExperience(rang); }
  if (typeof mcValiderReprise === 'function') { mcValiderReprise(); }
  _mcPanFermer();
  return true;
}

// ---------- Câblage (appelé par wireExperiencesProInline) ----------
function mcPanneauBrancher(rerender) {
  _mcPan.rerender = rerender;
  var racine = document.getElementById('mcPanRacine');
  if (!racine) { return; }
  var ouvrir = document.getElementById('btnExpProOuvrir');
  if (ouvrir) { ouvrir.addEventListener('click', function () { _mcPan.brouillon = null; _expInlineFormOuvert = true; _expInlineEditIndex = null; _expInlineBrouillon = null; rerender(); }); }
  var b = _mcPan.brouillon;
  if (!b) { return; }
  racine.addEventListener('toggle', function (e) {
    var d = e.target;
    if (d && d.getAttribute && d.getAttribute('data-pan-det') && _mcPan.brouillon) { _mcPan.brouillon.detOuvert[d.getAttribute('data-pan-det')] = d.open; }
  }, true);
  racine.addEventListener('click', function (e) {
    var cur = _mcPan.brouillon, c = e.target && e.target.closest ? e.target.closest(
      '[data-pan-sugg],[data-fm-metier],[data-fm-secteur-idx],[data-fm-changer-secteur],[data-fm-garder-secteur],[data-fm-chercher],[data-fm-fermer-panneau],[data-fm-deploye],[data-fm-filtre-tous],' +
      '[data-pan-mission],[data-pan-comp],[data-pan-ajout-mission],[data-pan-ajout-comp],[data-pan-suppr-mission],[data-pan-suppr-comp],[data-pan-k],#mcPanValider,#mcPanAnnuler') : null;
    if (!cur || !c || !racine.contains(c)) { return; }
    var index = _fmIndex();
    // Consigne 397 : la page raccourcit quand le panneau se referme ; on revient en haut de la rubrique « Expériences professionnelles », jamais en bas de la page.
    var retourRubrique = function () { if (typeof revenirALaRubrique === 'function') { revenirALaRubrique('#blocERIP-experiences-pro'); } };
    if (c.id === 'mcPanAnnuler') { _mcPanFermer(); rerender(); retourRubrique(); return; }
    if (c.id === 'mcPanValider') { if (_mcPanValider()) { rerender(); retourRubrique(); } return; }
    if (c.hasAttribute('data-pan-sugg')) {
      var code = c.getAttribute('data-pan-sugg'), nom = c.getAttribute('data-pan-nom');
      var autres = cur.metiers.filter(function (m, i) { return i > 0 && m.code !== code; });
      cur.metiers = [{ code: code, nom: nom }].concat(autres).slice(0, cur.maxMetiers);
      cur.poste = nom; cur.secteurIdx = null;
      _mcPanNettoyer(cur); rerender(); return;
    }
    if (c.hasAttribute('data-fm-metier')) {
      var cm = c.getAttribute('data-fm-metier'), rang = -1;
      cur.metiers.forEach(function (m, j) { if (m.code === cm) { rang = j; } });
      if (rang !== -1) { cur.metiers.splice(rang, 1); _mcPanNettoyer(cur); }
      else if (cur.metiers.length < cur.maxMetiers) { cur.metiers.push({ code: cm, nom: (index && index.parCode[cm]) ? index.parCode[cm].nom : _mcPanNomMetier(cm) }); }
      rerender(); return;
    }
    if (c.hasAttribute('data-fm-chercher')) { cur.panneauOuvert = !cur.panneauOuvert; if (cur.panneauOuvert) { cur.choixSecteur = false; } rerender(); return; }
    if (c.hasAttribute('data-fm-fermer-panneau')) { cur.panneauOuvert = false; cur.choixSecteur = false; rerender(); return; }
    if (c.hasAttribute('data-fm-secteur-idx')) { cur.secteurIdx = parseInt(c.getAttribute('data-fm-secteur-idx'), 10); cur.choixSecteur = false; cur.panneauOuvert = true; cur.filtre = ''; cur.filtreTous = false; cur.deploye = {}; rerender(); return; }
    if (c.hasAttribute('data-fm-changer-secteur')) { cur.choixSecteur = !cur.choixSecteur; if (cur.choixSecteur) { cur.panneauOuvert = false; } rerender(); return; }
    if (c.hasAttribute('data-fm-garder-secteur')) { cur.choixSecteur = false; rerender(); return; }
    if (c.hasAttribute('data-fm-deploye')) { cur.deploye[c.getAttribute('data-fm-deploye')] = true; _mcPanMajListeSecteur(cur); return; }
    if (c.hasAttribute('data-fm-filtre-tous')) { cur.filtreTous = true; _mcPanMajListeSecteur(cur); return; }
    if (c.hasAttribute('data-pan-mission')) {
      var mi = c.getAttribute('data-pan-mission'), k = cur.missions.indexOf(mi);
      if (k === -1) { cur.missions.push(mi); } else { cur.missions.splice(k, 1); }
      rerender(); return;
    }
    if (c.hasAttribute('data-pan-comp')) {
      var t = c.getAttribute('data-pan-comp'), v = c.getAttribute('data-v'), j = cur.comp[t].indexOf(v);
      if (j === -1) { cur.comp[t].push(v); } else { cur.comp[t].splice(j, 1); }
      rerender(); return;
    }
    if (c.hasAttribute('data-pan-k')) { cur.kDeploye = true; rerender(); return; }
    if (c.hasAttribute('data-pan-ajout-mission')) { _mcPanAjouterLibre(cur, 'missionsPerso', 'mcPanMissionLibre', rerender); return; }
    if (c.hasAttribute('data-pan-ajout-comp')) { _mcPanAjouterLibre(cur, 'compPerso', 'mcPanCompLibre', rerender); return; }
    if (c.hasAttribute('data-pan-suppr-mission')) { cur.missionsPerso.splice(parseInt(c.getAttribute('data-pan-suppr-mission'), 10), 1); rerender(); return; }
    if (c.hasAttribute('data-pan-suppr-comp')) { cur.compPerso.splice(parseInt(c.getAttribute('data-pan-suppr-comp'), 10), 1); rerender(); return; }
  });
  racine.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || !_mcPan.brouillon) { return; }
    if (e.target.id === 'mcPanMissionLibre') { e.preventDefault(); _mcPanAjouterLibre(_mcPan.brouillon, 'missionsPerso', 'mcPanMissionLibre', rerender); }
    else if (e.target.id === 'mcPanCompLibre') { e.preventDefault(); _mcPanAjouterLibre(_mcPan.brouillon, 'compPerso', 'mcPanCompLibre', rerender); }
  });
  racine.addEventListener('input', function (e) {
    var cur = _mcPan.brouillon, el = e.target, id = el.id;
    if (!cur) { return; }
    if (id === 'mcPanPoste') {
      var v = _mcPanMaj1(el.value);
      if (v !== el.value) { var p0 = el.selectionStart; el.value = v; el.setSelectionRange(p0, p0); }
      var avant = cur.metiers.length > 0 || cur.poste.trim().length >= 3, avaitDates = !!document.getElementById('mcPanEntreprise');
      cur.poste = v;
      var apres = cur.metiers.length > 0 || cur.poste.trim().length >= 3;
      if (avant !== apres || avaitDates !== !!cur.poste.trim()) {
        var pos = el.selectionStart; rerender();
        var n = document.getElementById('mcPanPoste'); if (n) { n.focus(); n.setSelectionRange(pos, pos); }
      } else { _mcPanMajSuggestions(cur); _mcPanCharger(cur); _mcPanMajBoutons(cur); }
      return;
    }
    if (id === 'mcPanFiltre') { cur.filtre = el.value; cur.filtreTous = false; _mcPanMajListeSecteur(cur); return; }
    if (id === 'mcPanEntreprise') {
      var ve = _mcPanMaj1(el.value);
      if (ve !== el.value) { var p1 = el.selectionStart; el.value = ve; el.setSelectionRange(p1, p1); }
      cur.entreprise = ve; return;
    }
    if (id === 'mcPanDebut' || id === 'mcPanFin') {
      el.value = el.value.replace(/\D/g, '').slice(0, 4);
      if (id === 'mcPanDebut') { cur.debut = el.value; } else { cur.fin = el.value; }
      _mcPanMajBoutons(cur); return;
    }
    if (id === 'mcPanAncien') { cur.texteAncien = el.value; }
  });
  racine.addEventListener('change', function (e) {
    var cur = _mcPan.brouillon, id = e.target.id;
    if (!cur) { return; }
    if (id === 'mcPanEnPoste') { cur.enPoste = e.target.checked; if (cur.enPoste) { cur.fin = ''; cur.moisFin = ''; } rerender(); }
    else if (id === 'mcPanAvecMois') { cur.avecMois = e.target.checked; rerender(); }
    else if (id === 'mcPanMoisDebut') { cur.moisDebut = e.target.value; }
    else if (id === 'mcPanMoisFin') { cur.moisFin = e.target.value; }
  });
  _mcPanMajBoutons(b);
}
// Retire du brouillon ce qui n'est plus proposé par aucun des métiers choisis (jamais les mots de la personne). Une fiche pas encore chargée : rien n'est retiré.
function _mcPanNettoyer(b) {
  var fiches = b.metiers.map(function (m) { return _mcPanFiche(m.code); });
  if (fiches.some(function (f) { return !f; })) { return; }
  var fusion = mcFusionnerFiches(fiches) || { m: [], sf: [], se: [], sv: [], k: [] };
  b.missions = b.missions.filter(function (x) { return fusion.m.indexOf(x) !== -1; });
  MC_TYPES.forEach(function (t) { b.comp[t] = b.comp[t].filter(function (x) { return (fusion[t] || []).indexOf(x) !== -1; }); });
}
function _mcPanAjouterLibre(b, cle, idChamp, rerender) {
  var champ = document.getElementById(idChamp), t = champ ? mcPropre(_mcPanMaj1(champ.value)) : '';
  if (!t) { return; }
  if (b[cle].some(function (x) { return mcCleTexte(x) === mcCleTexte(t); })) { champ.value = ''; return; }
  b[cle].push(t);
  rerender();
  var apres = document.getElementById(idChamp); if (apres) { apres.focus(); }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MC_PAN_MISSIONS: MC_PAN_MISSIONS, MC_PAN_COMPETENCES: MC_PAN_COMPETENCES };
}
