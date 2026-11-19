/* ============================================================
   Module « Explorer les métiers » : « Ma lecture », ÉCRANS (tâches A9 à A13 de docs/CHANTIER_MA_SYNTHESE_EXPLORER_LES_METIERS_2026-11-18.md ; maquette V10, consignes 468 à 472).
   Charge après syntheseVue.js ; la logique pure est dans syntheseLectureLogique.js (testée sous Node).

   Trois écrans, dans l'ordre :
   - « lecture-demande » : étape 1 sur 2 (choisir l'assistant, relire la demande, elle est copiée) puis étape 2 sur 2 (coller la réponse).
     C'est le passage commun de « Un CV, plusieurs métiers » (passageAssistant.js) : AUCUNE copie, comme « Découvrir mes compétences ».
   - « lecture » : la lecture en neuf parties. L'assistant écrit les textes ; le CODE calcule l'origine de chaque piste, son niveau d'accès,
     le camembert « déjà pratiquées / à construire » et les compétences ; les liens sont des BOUTONS écrits par l'application, jamais par l'assistant.
   - « lecture-offres » : la demande d'offres du chemin « Les emplois en demande » (pmfBlocOffresRecrute), avec les métiers des tests et ceux de la lecture.
   Rien n'est gardé de la lecture dans la disquette (A8) : elle se refait en quelques clics.
   ============================================================ */

var SYN_CLE_PASSAGE = 'lecture';
var SYN_NB_DEMANDE = 6;   // métiers de chaque passage donnés à l'assistant (la demande tient en un seul envoi)
// Les deux sites ouverts depuis « Rencontrer, essayer ». Adresses vérifiées le 19/11/2026 (docs/CHANTIER_MA_SYNTHESE_EXPLORER_LES_METIERS_2026-11-18.md, tâche A12).
var SYN_LIENS_ESSAYER = [
  { cle: 'immersion', nom: 'Immersion facilitée', url: 'https://immersion-facile.beta.gouv.fr', bouton: 'Ouvrir Immersion facilitée' },
  { cle: 'ambassadeurs', nom: 'Ambassadeurs Métiers', url: 'https://www.ambassadeursmetiers.fr', bouton: 'Ouvrir Ambassadeurs Métiers' }
];
var SYN_MESSAGES_ECHEC = {
  vide: 'Le texte collé est vide.',
  coupee: 'La réponse s’arrête avant la fin.',
  illisible: 'Cette réponse n’a pas pu être lue : elle n’a pas la forme demandée.',
  sans_contenu: 'Cette réponse ne contient pas de lecture utilisable.'
};

// Les fiches des métiers (index des compétences, environ 1 Mo) se chargent à la demande : on les demande en arrivant, puis la page est redessinée UNE fois (jamais pendant le collage de la réponse).
function _synChargerFiches() {
  if (typeof pmCharger !== 'function' || (typeof _pmD !== 'undefined' && _pmD)) { return; }
  pmCharger(function (ok) {
    var e = cmvEtat();
    if (ok && ['lecture-demande', 'lecture', 'lecture-offres', 'parcours', 'parcours-fiche'].indexOf(e.vue) !== -1 && !(e.vue === 'lecture-demande' && ucpmPassageVue(e, SYN_CLE_PASSAGE) === 'coller')) { cmvRendre(); }
  });
}
function _synFichesPretes() { return typeof _pmD === 'undefined' || !!_pmD || (typeof _pmChargement !== 'undefined' && _pmChargement === 'echec'); }

function _synDateFr() { return new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
function _synLibNiveau(n) { return (typeof n === 'number' && n >= 2) ? cmlLibelleNiveauAcces(n) : ''; }

/* ---------- Ce que l'application donne à l'assistant (A9) ---------- */
function _synIdxMetier(D, nom) {
  if (!D || !nom) { return -1; }
  var i = _pmfIdxDeNom(D, nom);
  if (i >= 0) { return i; }
  var variantes = [nom, String(nom).split(/\s+ou\s+/i)[0]];
  for (var v = 0; v < variantes.length; v++) {
    var n = _pmdNorm(variantes[v]);
    for (var j = 0; j < D.m.length; j++) { if (D.m[j].n === n) { return j; } }
  }
  var f = (typeof metierParNom === 'function') ? metierParNom(variantes[1]) : null;
  return (f && f.rome && D.idxCode[f.rome] !== undefined) ? D.idxCode[f.rome] : -1;
}
function _synNomsMetiersPasses(D, noms) { return noms.map(function (i) { return D.m[i.i][0]; }); }

// Les compétences principales d'un métier (cœur du métier d'abord), en libellés.
function _synPrincipales(D, r, n) {
  var out = [];
  ['sf', 'sv'].forEach(function (t) {
    var rang = PMC_RANG[t], coeur = r.coeur[t] || {};
    r[rang].slice().sort(function (a, b) { return (coeur[b] ? 1 : 0) - (coeur[a] ? 1 : 0) || a - b; }).forEach(function (id) { if (out.length < n) { out.push(D[t][id].lib); } });
  });
  return out;
}

function synDonneesPourLecture(etat) {
  var s = synEtat(), D = (typeof _pmfD === 'function') ? _pmfD() : null, S = (typeof pmEtat === 'function') ? pmEtat() : null;
  var L = _synListesPassages(etat), q = etat.q && etat.q.resultat, d = {};
  // Passage 1
  var r1 = synRetenu(1);
  if (r1) {
    var f1 = (typeof metierParNom === 'function') ? metierParNom(r1.nom) : null, idx = _synIdxMetier(D, r1.nom);
    d.p1 = { retenu: { nom: r1.nom, secteur: f1 ? f1.secteur : '', niveau: f1 ? _synLibNiveau(cmlNiveauDeMetier(f1)) : '' }, choisies: [], pct: null, principales: [], proches: [], memeSecteur: [] };
    if (D && idx >= 0) {
      var r = D.m[idx], pr = pmcProches(D, idx, _pmfCodesOfficiels(r), 6);
      d.p1.principales = _synPrincipales(D, r, 10);
      d.p1.proches = _synNomsMetiersPasses(D, pr);
      d.p1.memeSecteur = _synNomsMetiersPasses(D, pmcMetiersDuSecteur(D, idx, pr.map(function (p) { return p.i; })).slice(0, 6));
      if (S && S.comp.length) { d.p1.choisies = S.comp.map(function (c) { return D[c.t][c.i].lib; }); d.p1.pct = pmcScorer(D, S, r).pct; }
    }
  }
  // Passage 2
  var N = (typeof _cmaNombreChoix === 'function') ? _cmaNombreChoix(etat) : 0;
  if (N > 0) {
    var r2 = synRetenu(2), f2 = r2 && typeof metierParNom === 'function' ? metierParNom(r2.nom) : null;
    d.p2 = { fait: true, choix: ['actions1', 'actions2', 'actions3'].map(function (v) { var P = CMA_PAGES[v]; return { titre: CMA_RESUME_LIBELLES[P.n - 1], valeurs: etat.choix[P.cle].map(function (id) { return _cmaLibelle(P.cle, id); }) }; }),
      faciles: etat.choix.faciles.map(_cmaLibelleCondition), difficiles: etat.choix.conditions.map(_cmaLibelleCondition),
      metiers: _cmaListeMetiers(etat).slice(0, SYN_NB_DEMANDE).map(function (m) { return { nom: m.nom, pct: m.score, niveau: _synLibNiveau(cmlNiveauDeMetier(m)) }; }),
      retenu: r2 ? { nom: r2.nom, niveau: f2 ? _synLibNiveau(cmlNiveauDeMetier(f2)) : '' } : null,
      nonRetrouves: f2 ? synChoixNonRetrouves(_cmaChoixPourMoteur(etat), f2).map(function (a) { return _cmaLibelle(a.cle, a.id); }) : [] };
  }
  // Passage 3 : seulement des pourcentages, jamais une réponse du questionnaire
  if (q) {
    var r3 = synRetenu(3), f3 = r3 && typeof metierParNom === 'function' ? metierParNom(r3.nom) : null, c = q.calcul;
    var pctLettres = function (p) { var o = {}; CML_LETTRES.forEach(function (l) { if (p && typeof p[l] === 'number') { o[l] = p[l]; } }); return o; };
    d.p3 = { fait: true, code: c.code || [], pourcentages: c.pourcentages || {}, etat: c.etat, partie1: pctLettres(c.parties && c.parties.p1), partie3: pctLettres(c.parties && c.parties.p3),
      metiers: (c.etat === 'peu_reponses') ? [] : _synCalculP3(c).classee.slice(0, SYN_NB_DEMANDE).map(function (x) { return { nom: x.nom, lettres: x.lettres || '', niveau: _synLibNiveau(x.niveau) }; }),
      reponsesDepartage: synTexteReponsesDepartage(s.aff.reponses, s.aff.secteurs),
      retenu: r3 ? { nom: r3.nom, niveau: f3 ? _synLibNiveau(cmlNiveauDeMetier(f3)) : '' } : null };
  }
  // Ce que l'application a déjà recoupé
  var noms = function (liste) { return liste.map(function (x) { return x.nom; }); };
  d.recoupe = { reviennent: synMetiersQuiReviennent({ p1: noms(L.p1), p2: noms(L.p2), p3: noms(L.p3) }).map(function (x) { return x.nom; }),
    communes: (D && S) ? synCompetencesCommunes([S.comp]).map(function (x) { return D[x.competence.t][x.competence.i].lib; }) : [] };
  d.parcours = D ? synpLignesDemande(D, s.parcours) : [];   // étape B : une ligne par métier exercé ; vide = « non donné » dans la demande
  d.situation = synTexteSituation(s);
  d.libre = s.libre || '';
  var dep = (typeof _cmrDep === 'function') ? _cmrDep() : '';
  if (dep && typeof _cmrDepCouvert === 'function' && _cmrDepCouvert(dep)) {
    d.territoire = _cmrNomDep(dep);
    var c2 = _cmrChiffres(dep), pistes = [];
    [1, 2, 3].forEach(function (p) { var r = synRetenu(p); if (r) { pistes.push(r.nom); } });
    d.recrutement = (c2.etat === 'ok' && typeof CMR_FICHES_ENQUETE !== 'undefined')
      ? synPistesDansEnquete(pistes, _synFicheId, CMR_FICHES_ENQUETE, c2.metiers.map(function (o) { return { nom: o.nom, met: o.met, s: o.s }; })).map(function (x) { return x.piste + ' : parmi les plus cités par les employeurs' + (x.enquete.saisonnier ? ', surtout saisonniers' : ''); })
      : [];
  }
  return d;
}

function _synModeleDemande() { return (typeof promptsExternesCharges !== 'undefined' && promptsExternesCharges && promptsExternesCharges['ma-synthese']) || ''; }
function synDemandeComplete(etat) {
  var m = _synModeleDemande();
  return m ? synConstruireDemande(m, synDonneesPourLecture(etat)) : null;
}

/* ---------- Étapes 1 et 2 : le passage avec l'assistant (A10, A11) ---------- */
var SYN_ETAPES_CHOIX = [
  { titre: 'Copie', detail: 'La demande est copiée automatiquement : vos résultats, vos choix et ce que vous avez écrit. Rien à écrire vous-même.' },
  { titre: 'Chez l’assistant', detail: 'Vous collez la demande et vous attendez sa réponse.' },
  { titre: 'Retour ici', detail: 'Vous copiez toute sa réponse et vous la collez dans cette page.' },
  { titre: 'Ma lecture', detail: 'Vous lisez ses pistes de réflexion. Rien n’est gardé sans que vous le décidiez.' }
];

function _synRecapDemande(etat) {
  var dem = synDemandeComplete(etat), n = synNombreSources(etat), s = synEtat();
  var faits = [];
  if (synRetenu(1)) { faits.push('un métier retenu'); }
  if (s.parcours.some(function (e) { return synpNbCoches(e) > 0; })) { faits.push('votre parcours (métiers exercés et compétences cochées)'); }
  if (etat.q && etat.q.resultat) { faits.push('vos six lettres'); }
  if ((typeof _cmaNombreChoix === 'function') && _cmaNombreChoix(etat) > 0) { faits.push('vos envies'); }
  var h = '<div class="cml-encart"><i class="bi bi-send-check" aria-hidden="true"></i><div><p class="mb-1"><b>Ce qui va partir chez l’assistant</b> : ' + (faits.length ? faits.join(', ') : 'rien encore') +
    (s.niveau || (s.suivi && s.suivi.length) || (s.complements && s.complements.length) ? ', votre situation' : '') + (s.libre && s.libre.trim() ? ', vos mots' : '') + '.</p>' +
    '<p class="cml-note mb-0">Ni votre nom, ni votre adresse, ni votre téléphone. Jamais vos réponses au questionnaire : seulement le pourcentage de chaque lettre.' + (n < 3 ? ' Un passage non fait est signalé comme tel : l’assistant ne devine rien.' : '') + '</p></div></div>';
  if (dem) {
    h += '<details class="cml-depli"><summary>Relire la demande avant de l’envoyer</summary><div class="corps">' +
      '<textarea id="synDemandeTexte" class="form-control" rows="14" readonly aria-label="La demande qui sera copiée pour l’assistant">' + cmvE(dem.texte) + '</textarea>' +
      '<p class="cml-note mt-2 mb-0">' + (dem.retires.length ? 'Certaines listes ont été raccourcies pour tenir en un seul envoi. ' : '') + 'Vous pouvez la lire, mais pas la modifier ici : pour changer ce qui part, retournez à votre synthèse.</p></div></details>';
  }
  return h;
}

function _synConfigPassage(etat) {
  return {
    idSuffixe: 'SynLecture',
    rerendre: cmvRendre,
    attrAssistant: 'data-assistant-synlecture',
    idErreur: 'synErreurChoixIA',
    nomSuivi: 'ma_synthese',
    recapHtml: _synRecapDemande(etat),
    etapes: SYN_ETAPES_CHOIX,
    texteConfidentialite: 'Seuls vos résultats et les mots que vous avez choisis partent chez l’assistant : ni votre nom, ni votre adresse, ni votre téléphone.',
    avantEnvoi: function () {
      if (!_synFichesPretes()) { return 'Les fiches des métiers se chargent. Patientez quelques secondes puis réessayez.'; }
      var dem = synDemandeComplete(etat);
      if (!dem) { return 'Les consignes ne sont pas chargées pour le moment. Vérifiez votre connexion, rechargez la page puis réessayez.'; }
      if (dem.tropLong) { return 'Votre demande est trop longue pour un seul envoi. Raccourcissez les mots que vous avez écrits dans « Ce que les tests ne disent pas » puis réessayez.'; }
      return '';
    },
    construireTexte: function () { var d = synDemandeComplete(etat); return d ? d.texte : ''; },
    module: { libelleSuite: 'Voir ma lecture', quoi: 'L’assistant vient de lire vos résultats.', pourquoi: 'Vous découvrez des pistes de réflexion à partir de ce que vous avez fait.',
      verif: 'lisez chaque piste avec attention : ce sont des idées à confirmer ou à changer, jamais une décision.' },
    verifier: function (texte) { return synAnalyserLecture(texte).ok; },
    importer: function (texte) {
      var r = synAnalyserLecture(texte);
      if (!r.ok) { return { succes: false, coupe: r.raison === 'coupee', erreur: SYN_MESSAGES_ECHEC[r.raison] || SYN_MESSAGES_ECHEC.illisible }; }
      r.lecture.date = _synDateFr();
      synEtat().lecture = r.lecture;
      return { succes: true };
    },
    apresSucces: function () { cmvAller('lecture'); }
  };
}

cmvEnregistrerVue('lecture-demande', {
  titre: function (etat) { return ucpmPassageVue(etat, SYN_CLE_PASSAGE) === 'coller' ? 'Rapporter la réponse : étape 2 sur 2' : 'Interpréter ma synthèse : étape 1 sur 2'; },
  barre: function (etat) { return { retour: function () { if (!ucpmPassageRetour(etat, SYN_CLE_PASSAGE, cmvRendre)) { cmvAller('synthese'); } } }; },
  rendre: function (etat) {
    if (synNombreSources(etat) < 1) {
      return _synInvite('Il faut au moins un passage fait pour que l’assistant puisse lire votre synthèse. Retenez un métier, choisissez vos envies ou passez le questionnaire.', 'Retourner à ma synthèse', 'actions').replace('data-cml="synChemin" data-chemin="actions"', 'data-cml="aller" data-vue="synthese"');
    }
    // Un parcours ajouté rend la lecture plus précise : une invitation, jamais une obligation (seulement avant l'envoi).
    var invite = (ucpmPassageVue(etat, SYN_CLE_PASSAGE) !== 'coller' && synpNbTotal(synEtat().parcours) === 0)
      ? '<div class="cml-invite"><i class="bi bi-lightbulb" aria-hidden="true"></i><div><p class="mb-1">Votre parcours n’est pas ajouté. L’ajouter permet à la lecture de dire ce que votre expérience apporte à chaque piste.</p>' +
        '<button type="button" class="btn btn-outline-primary" data-cml="aller" data-vue="parcours"><i class="bi bi-briefcase" aria-hidden="true"></i> Ajouter mon parcours</button></div></div>' : '';
    return invite + ucpmPassageRendre(etat, SYN_CLE_PASSAGE, _synConfigPassage(etat));
  },
  cabler: function (etat) { _synChargerFiches(); if (synNombreSources(etat) >= 1) { ucpmPassageCabler(etat, SYN_CLE_PASSAGE, _synConfigPassage(etat)); } }
});

// Le bloc de la page « Ma synthèse » qui mène à la lecture (placé avant « Garder ma synthèse »).
function _synBlocLecture(etat) {
  var s = synEtat(), n = synNombreSources(etat);
  if (n < 1) { return ''; }
  var h = '<div class="cml-bloc cml-bloc-synthese"><h2><i class="bi bi-chat-square-quote" aria-hidden="true"></i> Faire lire ma synthèse par l’assistant en ligne ' + _synPastilleEtat(!!s.lecture, 'Lecture reçue') + '</h2>';
  h += '<p>L’assistant lit tous vos résultats ensemble : ce qui se retrouve, ce qui diffère, et quelques pistes de métiers à regarder. Ce sont des <b>pistes de réflexion</b>, pas une note, pas un diagnostic, pas une solution. Vous relisez la demande avant qu’elle parte.</p>';
  if (n < 3) { h += cmvEncart('bi-info-circle', 'Il manque ' + (3 - n === 1 ? 'un passage' : (3 - n) + ' passages') + '. La lecture reste possible, mais elle ne voit pas ce qui manque : <b>faire les trois passages donne la lecture la plus fine</b>.'); }
  h += '<div class="boutons-ligne">' + (s.lecture ? '<button type="button" class="btn btn-primary" style="min-height:46px" data-cml="aller" data-vue="lecture"><i class="bi bi-chat-square-quote" aria-hidden="true"></i> Voir ma lecture</button>' : '') +
    '<button type="button" class="btn ' + (s.lecture ? 'btn-outline-primary' : 'btn-primary') + '" style="min-height:46px" data-cml="synDemander"><i class="bi bi-send" aria-hidden="true"></i> ' + (s.lecture ? 'Refaire une lecture' : 'Préparer ma demande à l’assistant') + '</button></div></div>';
  return h;
}
cmvEnregistrerAction('synDemander', function (el, etat) { ucpmPassageReinitialiser(etat, SYN_CLE_PASSAGE); cmvAller('lecture-demande'); return false; });

/* ---------- La lecture (A12) ---------- */
function _synNomsTests(etat) {
  var L = _synListesPassages(etat), t = [];
  [L.p1, L.p2, L.p3].forEach(function (l) { l.forEach(function (x) { t.push(x.nom); }); });
  return t;
}
function _synVoisinsDesRetenus(D) {
  var v = [];
  [1, 2, 3].forEach(function (p) {
    var r = synRetenu(p), i = r ? _synIdxMetier(D, r.nom) : -1;
    if (i < 0) { return; }
    var pr = pmcProches(D, i, _pmfCodesOfficiels(D.m[i]), 6);
    _synNomsMetiersPasses(D, pr).forEach(function (n) { v.push(n); });
    _synNomsMetiersPasses(D, pmcMetiersDuSecteur(D, i, pr.map(function (x) { return x.i; })).slice(0, 6)).forEach(function (n) { v.push(n); });
  });
  return v;
}
function _synCamembert(deja, total) {
  var part = total ? Math.round(100 * deja / total) : 0;
  return '<div class="cml-pie-ligne"><span class="cml-pie" style="--part:' + part + '%" role="img" aria-label="' + deja + ' compétences sur ' + total + ' déjà pratiquées"></span>' +
    '<ul class="cml-pie-leg"><li><span class="pt a" aria-hidden="true"></span>Déjà pratiquées : <b>' + deja + '</b> sur ' + total + '</li><li><span class="pt b" aria-hidden="true"></span>À construire : <b>' + (total - deja) + '</b></li></ul></div>';
}
function _synLibs(D, liste, n) { return liste.slice(0, n).map(function (c) { return cmvE(D[c.t][c.i].lib); }).join(', '); }
function _synLibsTexte(D, liste, n) { return liste.slice(0, n).map(function (c) { return D[c.t][c.i].lib; }).join(', '); }

// Ce que le CODE sait d'une piste (jamais ce que dit l'assistant) : origine, niveau d'accès, comparaison des compétences. UNE seule fonction pour la page et pour la feuille imprimée.
// Ce que la personne a pratiqué, pour le comparer à CHAQUE piste : son parcours (étape B) s'il est rempli, sinon les compétences choisies dans « Par un métier ».
function synSourceComparaison(D, S) {
  var parc = D ? synpBagageIds(D, synEtat().parcours) : [];
  if (parc.length) { return { source: 'parcours', choisies: parc }; }
  return { source: (S && S.comp.length) ? 'tests' : 'aucune', choisies: S ? S.comp : [] };
}
function synInfosPiste(p, D, S, nomsTests, voisins) {
  var idx = _synIdxMetier(D, p.metier), info = { origine: synOrigineDePiste(p.metier, nomsTests, voisins), idx: idx, nom: p.metier, niveau: '', comparaison: null, fiche: null, source: 'aucune' };
  if (idx >= 0) {
    var r = D.m[idx], src = synSourceComparaison(D, S);
    info.fiche = r[0]; info.niveau = cmlLibelleNiveauAcces(r[2] || null); info.source = src.source;
    // les diplômes de la fiche ne sont jamais comptés comme des compétences à acquérir (synpFichePourComparaison)
    info.comparaison = synComparerPiste(src.choisies, synpFichePourComparaison(D, idx));
  }
  return info;
}

function _synBlocPiste(etat, p, num, nomsTests, voisins, D, S) {
  var info = synInfosPiste(p, D, S, nomsTests, voisins), origine = info.origine;
  var h = '<div class="cml-piste"><b>' + num + '. ' + cmvE(p.metier) + '</b><p class="mb-1"><span class="cml-etat ' + (origine === 'conf' ? 'fait' : 'afaire') + '">' + SYN_LIB_ORIGINE[origine] + '</span></p>' +
    (p.fort ? '<p class="mb-1"><i class="bi bi-check2" aria-hidden="true"></i> Va dans le sens de vos résultats : ' + cmvE(p.fort) + '</p>' : '') +
    (p.verifier ? '<p class="cml-note mb-1"><i class="bi bi-question-circle" aria-hidden="true"></i> À vérifier : ' + cmvE(p.verifier) + '</p>' : '');
  if (info.idx < 0) {
    return h + '<p class="cml-note mb-0"><i class="bi bi-info-circle" aria-hidden="true"></i> Je n’ai pas trouvé de fiche de ce métier dans l’application : la comparaison de compétences n’est pas possible. La piste reste à regarder avec un conseiller.</p></div>';
  }
  h += '<p class="cml-note mb-1"><i class="bi bi-mortarboard" aria-hidden="true"></i> Niveau d’accès : ' + info.niveau + '</p>' +
    '<p class="mb-1"><button type="button" class="btn btn-outline-primary btn-sm" data-cml="fiche" data-nom="' + cmvE(info.fiche) + '"><i class="bi bi-arrow-right-circle" aria-hidden="true"></i> Voir la fiche de ce métier</button></p>';
  var c = info.comparaison;
  if (c) {
    h += _synCamembert(c.deja, c.total) + '<p class="cml-note mb-1">Calculé par l’application à partir ' + (info.source === 'parcours' ? 'de ce que vous avez coché dans « Mon parcours »' : 'des compétences que vous avez choisies dans « Par un métier »') + '. Une compétence non cochée n’est pas une compétence que vous n’avez pas, seulement une que vous n’avez pas indiquée. Ce n’est pas une note.</p>' +
      (c.transferables.length ? '<p class="mb-1"><b>Transférables :</b> ' + _synLibs(D, c.transferables, 4) + '.</p>' : '') +
      (c.transversales.length ? '<p class="mb-1"><b>Transversales :</b> ' + _synLibs(D, c.transversales, 4) + '.</p>' : '') +
      (c.aAcquerir.length ? '<p class="mb-0"><b>À acquérir :</b> ' + _synLibs(D, c.aAcquerir, 4) + '.</p>' : '');
  } else {
    h += '<p class="cml-note mb-0"><i class="bi bi-info-circle" aria-hidden="true"></i> Pour comparer vos compétences à celles de cette piste, ajoutez votre parcours (« Mon parcours » sur la page de synthèse) ou choisissez des compétences dans « Par un métier » : sans cela, un dessin serait trompeur.</p>';
  }
  return h + '</div>';
}

function _synBlocLecturePartie(num, icone, titre, corps) {
  return '<div class="cml-bloc"><h2><i class="bi ' + icone + '" aria-hidden="true"></i> <span class="visually-hidden">Partie ' + num + ' : </span>' + titre + '</h2>' + corps + '</div>';
}
function _synListe(liste) { return '<ul class="mb-1">' + liste.map(function (x) { return '<li>' + cmvE(x) + '</li>'; }).join('') + '</ul>'; }
function _synBoutonLien(l) { return '<a class="btn btn-outline-primary" href="' + cmvE(l.url) + '" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right" aria-hidden="true"></i> ' + cmvE(l.bouton) + '</a>'; }

var SYN_ACCOMPAGNEMENT_PAR_SITUATION = {
  oui: 'Parlez de cette lecture à la personne qui vous accompagne : elle peut vous aider à organiser un essai.',
  non: 'Se faire accompagner peut beaucoup aider : un conseiller France Travail, de votre mission locale (avant 26 ans) ou de Cap emploi peut vous recevoir.',
  jamais: 'Vous pouvez demander un rendez-vous à France Travail, à une mission locale (avant 26 ans) ou à Cap emploi : un conseiller peut vous aider à organiser un essai.'
};

function _synHtmlLecture(etat) {
  var s = synEtat(), l = s.lecture;
  if (!l) { return _synInvite('Vous n’avez pas encore de lecture. Elle se prépare en deux étapes : la demande, puis la réponse de l’assistant.', 'Préparer ma demande', 'actions').replace('data-cml="synChemin" data-chemin="actions"', 'data-cml="synDemander"'); }
  var D = (typeof _pmfD === 'function') ? _pmfD() : null, S = (typeof pmEtat === 'function') ? pmEtat() : null, n = synNombreSources(etat);
  var manquants = [];
  if (!synRetenu(1)) { manquants.push('« Chercher un métier »'); }
  if (!((typeof _cmaNombreChoix === 'function') && _cmaNombreChoix(etat) > 0)) { manquants.push('« Par ce que vous aimez faire »'); }
  if (!(etat.q && etat.q.resultat)) { manquants.push('le questionnaire'); }
  var h = '<p class="cml-note">Lecture de l’assistant en ligne, reçue le ' + cmvE(l.date || '') + '.</p>' +
    cmvEncart('bi-info-circle', 'Ce sont des pistes de réflexion, pas une note, pas un diagnostic, pas une solution. Elles montrent une direction et quelques métiers pour l’illustrer, à confirmer ou à changer. Relisez-les avec une personne qui vous accompagne.', true);
  if (l.passages.length) { h += _synBlocLecturePartie(1, 'bi-1-circle', 'Ce que disent mes résultats', _synListe(l.passages)); }
  h += _synBlocLecturePartie(2, 'bi-2-circle', 'Ce qui converge', n < 2 ? '<p class="mb-0">Un seul passage est fait : il n’y a pas encore de convergence à montrer. Chaque passage ajouté rend cette partie plus riche.</p>' : (l.converge ? '<p class="mb-0">' + cmvE(l.converge) + '</p>' : '<p class="mb-0">L’assistant n’a rien dit de précis sur ce point.</p>'));
  h += _synBlocLecturePartie(3, 'bi-3-circle', 'Ce qui diverge, et ce que cela peut vouloir dire', l.diverge.length ? l.diverge.map(function (x) { return '<p class="mb-1">' + (x.constat ? '<b>Diffère :</b> ' + cmvE(x.constat) : '') + '</p>' + (x.hypothese ? '<p class="mb-2">' + cmvE(x.hypothese) + '</p>' : ''); }).join('') : '<p class="mb-0">Rien d’important ne semble différer, ou il n’y a pas assez de passages pour comparer.</p>');
  var ombre = (l.ombre.length ? _synListe(l.ombre) : '') + '<p class="cml-note mb-1">Les tests disent des préférences. Ils ne disent ni ce que vous savez faire aujourd’hui, ni vos contraintes de vie, ni ce que vous ressentirez sur place.</p>';
  ombre += manquants.length
    ? '<div class="cml-invite"><i class="bi bi-info-circle" aria-hidden="true"></i><div><p class="mb-1">Il manque ' + manquants.join(', ') + ' : cette lecture ne les voit pas. <b>Faire les trois passages donne la lecture la plus fine.</b></p><button type="button" class="btn btn-outline-primary btn-sm" data-cml="aller" data-vue="synthese">Retourner à ma synthèse</button></div></div>'
    : '<p class="cml-note mb-0">Vous avez fait les trois passages : c’est ce qui rend cette lecture la plus fine possible.</p>';
  h += _synBlocLecturePartie(4, 'bi-4-circle', 'Ce que mes résultats n’ont pas pu relever', ombre);
  h += _synBlocLecturePartie(5, 'bi-5-circle', 'Première lecture, puis lecture plus approfondie',
    '<div class="cml-quatre"><div class="cml-lecture-mini"><b>Ce qui ressort tout de suite</b><p>' + cmvE(l.premiere || 'Rien de précis.') + '</p></div>' +
    '<div class="cml-lecture-mini"><b>En regardant de plus près</b><p>' + cmvE(l.approfondie || 'Sans parcours ni mots libres, la lecture reste en surface.') + '</p></div></div>');
  // 6 : direction et pistes (origine, niveau d'accès, camembert : tout calculé par l'application)
  var corps6 = l.direction ? '<p class="mb-1"><b>Direction :</b> ' + cmvE(l.direction) + '</p>' : '';
  corps6 += '<p class="cml-note">Les pistes sont des exemples pour illustrer cette direction, pas « le » métier. L’origine de chaque piste est vérifiée par l’application, pas par l’assistant.</p>';
  if (!l.pistes.length) { corps6 += '<p class="mb-0">L’assistant n’a pas proposé de piste précise cette fois.</p>'; }
  else if (!D) { corps6 += l.pistes.map(function (p, i) { return '<div class="cml-piste"><b>' + (i + 1) + '. ' + cmvE(p.metier) + '</b>' + (p.fort ? '<p class="mb-1">' + cmvE(p.fort) + '</p>' : '') + (p.verifier ? '<p class="cml-note mb-0">À vérifier : ' + cmvE(p.verifier) + '</p>' : '') + '</div>'; }).join(''); }
  else {
    var tests = _synNomsTests(etat), voisins = _synVoisinsDesRetenus(D);
    corps6 += '<div class="cml-pistes">' + l.pistes.map(function (p, i) { return _synBlocPiste(etat, p, i + 1, tests, voisins, D, S); }).join('') + '</div>';
    // Niveau d'études : un écart est dit avec douceur, jamais un barrage
    var hauts = l.pistes.filter(function (p) { var i = _synIdxMetier(D, p.metier); return i >= 0 && synEcartNiveau(s.niveau, D.m[i][2]).ecart >= 1; });
    if (s.niveau && hauts.length) {
      corps6 += cmvEncart('bi-mortarboard', 'Votre niveau : ' + cmvE(synLibelleDe(SYN_NIVEAUX, s.niveau)) + '. Pour ' + hauts.map(function (p) { return '« ' + cmvE(p.metier) + ' »'; }).join(' et ') + ', le niveau d’accès est plus haut : un chemin possible passe par une formation. Un organisme de formation ou un conseiller peut vous renseigner sur une remise à niveau. Des offres existent, mais elles supposent souvent ce niveau.', true);
    } else if (s.niveau) {
      corps6 += '<p class="mt-2 mb-0">Votre niveau semble correspondre à celui demandé par ces pistes : vous pouvez regarder des offres.</p>';
    } else {
      corps6 += '<p class="cml-note mt-2 mb-0">Votre niveau d’études n’est pas indiqué : la lecture ne peut pas dire si ces pistes y correspondent. Vous pouvez le préciser dans votre synthèse.</p>';
    }
  }
  h += '<div class="cml-bloc cml-bloc-synthese"><h2><i class="bi bi-6-circle" aria-hidden="true"></i> <span class="visually-hidden">Partie 6 : </span>Une direction et ' + (l.pistes.length > 1 ? l.pistes.length + ' pistes' : 'une piste') + ' à regarder</h2>' + corps6 + '</div>';
  // 7 : ce que l'expérience apporte
  var exp = l.experience;
  h += _synBlocLecturePartie(7, 'bi-7-circle', 'Ce que mon expérience apporte', (exp.transferables.length || exp.transversales.length)
    ? '<div class="cml-quatre">' + (exp.transferables.length ? '<div class="cml-lecture-mini"><b>Transférables</b>' + _synListe(exp.transferables) + '</div>' : '') + (exp.transversales.length ? '<div class="cml-lecture-mini"><b>Transversales</b>' + _synListe(exp.transversales) + '</div>' : '') + '</div>'
    : '<div class="cml-invite"><i class="bi bi-info-circle" aria-hidden="true"></i><div><p class="mb-0">Votre parcours n’est pas ajouté : la lecture ne peut pas dire ce que votre expérience apporte. Il pourra être ajouté dans une prochaine étape.</p></div></div>');
  // 8 : valider mon projet (texte fixe)
  h += _synBlocLecturePartie(8, 'bi-patch-check', 'Valider mon projet : de quoi parle-t-on ?',
    '<p>Valider un projet, c’est vérifier avant de se lancer qu’il est réaliste, faisable et bien connu du terrain. Trois questions :</p><ol class="mb-1">' +
    '<li><b>Est-il réaliste ?</b> Mes compétences se rapprochent-elles de celles attendues ? Sinon, une formation peut réduire l’écart.</li>' +
    '<li><b>Est-il faisable ?</b> Y a-t-il des offres près de chez moi ? Mes contraintes (horaires, déplacements, garde d’enfants) sont-elles compatibles ?</li>' +
    '<li><b>Est-ce que je connais vraiment ce métier ?</b> En rencontrant des professionnels, puis en observant, voire en pratiquant quelques jours sur place : c’est l’immersion. Après cela, vous pouvez mieux savoir si vous vous voyez exercer ce métier.</li></ol>');
  // 9 : rencontrer, essayer, être accompagné (noms en bleu sans lien, boutons dessous)
  var essayer = l.essayer.length ? _synListe(l.essayer) : '';
  h += _synBlocLecturePartie(9, 'bi-compass', 'Rencontrer, essayer, être accompagné', essayer +
    '<ul class="mb-1"><li><b>Rencontrer</b> un professionnel pour poser vos questions : <span class="cml-mot-bleu">Ambassadeurs Métiers</span> (Nouvelle-Aquitaine), <span class="cml-mot-bleu">ExplorJob</span> ou <span class="cml-mot-bleu">My Job Glasses</span> (toute la France).</li>' +
    '<li><b>Essayer</b> par une immersion courte, pour valider votre projet : <span class="cml-mot-bleu">Immersion facilitée</span> (site du gouvernement), avec votre conseiller. Deux ou trois immersions de quelques jours, dans des structures différentes, peuvent donner une vue d’ensemble.</li></ul>' +
    '<div class="boutons-ligne mb-2">' + SYN_LIENS_ESSAYER.map(_synBoutonLien).join('') + '</div>' +
    '<p class="mb-1">' + cmvE(l.accompagnement || SYN_ACCOMPAGNEMENT_PAR_SITUATION[(s.suivi || [])[0]] || SYN_ACCOMPAGNEMENT_PAR_SITUATION.non) + '</p>' +
    '<p class="cml-note mb-0">Les sites et leurs conditions peuvent changer : vérifiez-les avant de vous déplacer.</p>');
  if (l.questions.length) { h += _synBlocLecturePartie(10, 'bi-question-circle', 'Questions pour un conseiller', _synListe(l.questions)); }
  h += '<div class="cml-bloc cml-bloc-synthese"><h2><i class="bi bi-briefcase" aria-hidden="true"></i> Et maintenant ?</h2><div class="boutons-ligne">' +
    '<button type="button" class="btn btn-primary" style="min-height:46px" data-cml="aller" data-vue="lecture-offres"><i class="bi bi-search" aria-hidden="true"></i> Chercher des offres</button>' +
    '<button type="button" class="btn btn-outline-primary" style="min-height:46px" data-cml="synDemander"><i class="bi bi-arrow-repeat" aria-hidden="true"></i> Refaire une lecture</button>' + (typeof synBoutonImprimer === 'function' ? synBoutonImprimer() : '') +
    '<button type="button" class="btn btn-outline-secondary" style="min-height:46px" data-cml="aller" data-vue="synthese">Retour à ma synthèse</button></div>' +
    '<p class="cml-note mt-2 mb-0">Cette lecture n’est pas gardée dans la disquette : elle disparaît quand vous quittez la page. Pour la garder, imprimez-la ou enregistrez-la en PDF : elle est reprise dans la feuille.</p></div>';
  return h;
}

cmvEnregistrerVue('lecture', {
  titre: 'Ma lecture',
  barre: function () { return { retour: 'synthese' }; },
  rendre: _synHtmlLecture,
  cabler: _synChargerFiches
});

/* ---------- Chercher des offres depuis la lecture (A13) ---------- */
function _synGroupesOffres(etat) {
  var s = synEtat(), vus = {}, ajout = function (liste, nom) {
    var n = synNormaliser(nom); if (!n || vus[n]) { return; }
    vus[n] = true;
    var parts = String(nom).split(/\s+ou\s+/i);
    liste.push({ nom: parts[0].trim(), autres: parts.slice(1).map(function (x) { return x.trim(); }).filter(Boolean) });
  };
  var tests = [], lect = [];
  _synNomsTests(etat).forEach(function (n) { ajout(tests, n); });
  if (s.lecture) { s.lecture.pistes.forEach(function (p) { ajout(lect, p.metier); }); }
  var g = [];
  if (tests.length) { g.push({ id: 'tests', titre: 'Les métiers de mes tests', court: 'Mes tests', parties: [{ titre: '', items: tests }] }); }
  if (lect.length) { g.push({ id: 'lecture', titre: 'Les métiers de ma lecture', court: 'Ma lecture', parties: [{ titre: '', items: lect }] }); }
  return g;
}
cmvEnregistrerVue('lecture-offres', {
  titre: 'Chercher des offres',
  barre: function () { return { retour: function () { cmvAller(synEtat().lecture ? 'lecture' : 'synthese'); } }; },
  rendre: function (etat) {
    var s = synEtat(), D = (typeof _pmfD === 'function') ? _pmfD() : null, groupes = _synGroupesOffres(etat);
    var h = '<p class="cml-note">Une demande à part, comme dans « Les emplois en demande » : vous choisissez les métiers, votre territoire, puis vous copiez la demande dans l’assistant en ligne de votre choix.</p>';
    if (s.niveau) {
      var hauts = D ? groupes.reduce(function (n, g) { return n + g.parties[0].items.filter(function (it) { var i = _synIdxMetier(D, it.nom); return i >= 0 && synEcartNiveau(s.niveau, D.m[i][2]).ecart >= 1; }).length; }, 0) : 0;
      h += cmvEncart('bi-mortarboard', 'Votre niveau d’études est rappelé dans la demande' + (hauts ? '. Certains de ces métiers demandent un niveau supérieur au vôtre : la demande précisera aussi la voie par la formation, avec un conseiller.' : '.'), !!hauts);
    }
    var bloc = (typeof pmfBlocOffresRecrute === 'function' && groupes.length) ? pmfBlocOffresRecrute(groupes, s.niveau ? synLibelleDe(SYN_NIVEAUX, s.niveau) : '') : '';
    return h + (bloc || '<p class="mb-0">Il n’y a pas encore de métier à chercher : faites un passage dans « Explorer les métiers », ou patientez quelques secondes que les fiches se chargent.</p>');
  },
  cabler: _synChargerFiches
});
