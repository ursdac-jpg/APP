// BLOC « Quelques passages à préciser » EN PAGE : logique pure, sans DOM (testée sous Node, tests/passagesAPreciser.test.js).
// Maquette validée par Denis le 01/11/2026 : docs/MAQUETTE_RELECTURE_EN_PAGE_2026-11-01.html. Plan : docs/CHANTIER_RELECTURE_EN_PAGE_2026-11-01.md (étape 1).
// Décision de Denis : les réponses restent modifiables jusqu'à la validation de la page qui suit. Or une réponse est appliquée tout de suite (la fonction `appliquer` du module remplace
// un texte, corrige des dates...). Pour pouvoir la changer, on garde un JOURNAL : avant et après chaque application, une photo des objets touchés ; la différence (quelques
// valeurs) est mémorisée ; changer la réponse défait d'abord cette différence. Si la personne a retouché à la main la même valeur entre-temps, on n'y touche pas et on le dit.
// Aucune fonction `appliquer` n'a besoin de changer : le module continue de passer la sienne (même signature qu'avant : appliquer(extrait, valeur, point) -> true/false).
// Usage : var etat = passagesCreerEtat(points, { appliquer: fn, cibles: function () { return [objetModifie, ...]; } });
//         passagesDefinirReponse(etat, i, 'repondu', '2021') ; passagesDefinirReponse(etat, i, 'passe') ; passagesBilan(etat) ; passagesFinaliser(etat, dossier).

var PASSAGES_MARQUEUR_RETIRER = '__retirer__';   // même valeur que PRECISION_RETIRER (data/metiers.js), repassée en option par le module qui l'utilise

function _passagesNorm(t) { return String(t == null ? '' : t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim(); }
function _passagesCopie(x) { return x === undefined ? undefined : JSON.parse(JSON.stringify(x)); }
function _passagesEgal(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ---------------- Regroupements (repris tels quels de la fenêtre d'origine) ----------------

// Certifications rangées sous la même formation : une année pour toutes d'un seul clic. Renvoie [{ nom, indices, annees }] pour les groupes d'au moins 2 questions.
function passagesGroupesAnnees(points) {
  var groupes = {}, ordre = [];
  (points || []).forEach(function (p, i) {
    if (p && p.groupe && p.suggestions && p.suggestions.length) {
      if (!groupes[p.groupe]) { groupes[p.groupe] = { nom: p.groupe, indices: [], annees: p.suggestions }; ordre.push(p.groupe); }
      groupes[p.groupe].indices.push(i);
    }
  });
  return ordre.map(function (g) { return groupes[g]; }).filter(function (g) { return g.indices.length >= 2; });
}

// Un sujet par certification (toutes les questions qui la concernent au même endroit) ; les autres points sont réunis dans « Autres passages ».
function passagesSujets(points) {
  var sujets = [];
  (points || []).forEach(function (p, i) {
    var estCertif = !!p && (p.titre === 'Année de certification' || p.titre === 'Certification à vérifier') && !!p.extrait;
    var cle = estCertif ? 'c:' + _passagesNorm(p.extrait) : 'autres';
    var k = -1;
    sujets.forEach(function (su, idx) { if (su.cle === cle) { k = idx; } });
    if (k === -1) { sujets.push({ cle: cle, nom: estCertif ? String(p.extrait).replace(/\s*\([^()]*\)\s*$/, '') : 'Autres passages', indices: [] }); k = sujets.length - 1; }
    sujets[k].indices.push(i);
  });
  return sujets;
}

// ---------------- Journal : photo, différence, annulation ----------------

function _passagesEstObjet(x) { return !!x && typeof x === 'object' && !Array.isArray(x); }
function _passagesTousPrimitifs(l) { return l.every(function (x) { return x === null || typeof x !== 'object'; }); }

// Différence entre deux photos d'un même objet : liste d'opérations { chemin, type, ... }.
function passagesDifference(avant, apres, chemin, ops) {
  chemin = chemin || []; ops = ops || [];
  if (_passagesEgal(avant, apres)) { return ops; }
  if (Array.isArray(avant) && Array.isArray(apres)) {
    if (_passagesTousPrimitifs(avant) && _passagesTousPrimitifs(apres)) {
      var restants = apres.slice(), retires = [];
      avant.forEach(function (v, idx) {
        var k = restants.indexOf(v);
        if (k === -1) { retires.push({ index: idx, valeur: v }); } else { restants.splice(k, 1); }
      });
      ops.push({ type: 'liste', chemin: chemin, retires: retires, ajoutes: restants });
      return ops;
    }
    if (avant.length === apres.length) {
      avant.forEach(function (v, idx) { passagesDifference(v, apres[idx], chemin.concat([idx]), ops); });
      return ops;
    }
  } else if (_passagesEstObjet(avant) && _passagesEstObjet(apres)) {
    var cles = Object.keys(avant);
    Object.keys(apres).forEach(function (k) { if (cles.indexOf(k) === -1) { cles.push(k); } });
    cles.forEach(function (k) { passagesDifference(avant[k], apres[k], chemin.concat([k]), ops); });
    return ops;
  }
  ops.push({ type: 'valeur', chemin: chemin, avant: _passagesCopie(avant), apres: _passagesCopie(apres) });
  return ops;
}

// Suit un chemin dans un objet ; renvoie { parent, cle } (le parent contient la cle) ou null si le chemin n'existe plus.
function _passagesAtteindre(racine, chemin) {
  var parent = racine;
  for (var i = 0; i < chemin.length - 1; i++) {
    if (parent === null || typeof parent !== 'object' || !(chemin[i] in parent)) { return null; }
    parent = parent[chemin[i]];
  }
  if (parent === null || typeof parent !== 'object') { return null; }
  return { parent: parent, cle: chemin[chemin.length - 1] };
}

// Défait une liste d'opérations sur `cibles` (tableau d'objets). Renvoie { annulees, ignorees } : une opération est ignorée si la valeur a changé depuis (retouchée à la main).
function passagesAnnulerOps(cibles, ops) {
  var annulees = 0, ignorees = 0;
  (ops || []).slice().reverse().forEach(function (op) {
    var racine = cibles[op.cible];
    if (racine === undefined) { ignorees++; return; }
    if (op.type === 'liste') {
      var liste = op.chemin.length ? (function () { var a = _passagesAtteindre(racine, op.chemin); return a ? a.parent[a.cle] : null; }()) : racine;
      if (!Array.isArray(liste)) { ignorees++; return; }
      // Tout ce qui avait été ajouté doit encore être là, sinon la personne a retouché la liste : on n'y touche pas (jamais de doublon).
      var reste = liste.slice();
      var toutLa = op.ajoutes.every(function (v) {
        var k = reste.indexOf(v);
        if (k === -1) { return false; }
        reste.splice(k, 1);
        return true;
      });
      if (!toutLa) { ignorees++; return; }
      op.ajoutes.forEach(function (v) { liste.splice(liste.indexOf(v), 1); });
      op.retires.slice().sort(function (a, b) { return a.index - b.index; }).forEach(function (r) { liste.splice(Math.min(r.index, liste.length), 0, r.valeur); });
      annulees++;
      return;
    }
    var a = _passagesAtteindre(racine, op.chemin);
    if (!a || !_passagesEgal(a.parent[a.cle], op.apres)) { ignorees++; return; }
    if (op.avant === undefined) { if (Array.isArray(a.parent)) { a.parent.splice(a.cle, 1); } else { delete a.parent[a.cle]; } } else { a.parent[a.cle] = _passagesCopie(op.avant); }
    annulees++;
  });
  return { annulees: annulees, ignorees: ignorees };
}

// ---------------- État des réponses ----------------

// options.appliquer(extrait, valeur, point) -> true si la réponse a remplacé l'élément cité (comme avant) ; options.cibles() -> objets que `appliquer` peut modifier (pour le journal) ;
// options.marqueurRetirer : valeur envoyée à `appliquer` pour « retirer cet élément » ;
// options.differe : les réponses sont seulement gardées, rien n'est appliqué au fil de l'eau (écran de validation du Bilan : la liste affichée ne doit pas bouger sous les cases cochées) ;
// la page les applique d'un coup à la validation avec passagesAppliquerSurObjet().
// options.rejoue : comme `differe` (les réponses sont seulement gardées), mais c'est la page qui les REJOUE à chaque lecture de ses données et qui montre tout de suite leur effet (Reformuler : la réponse de l'assistant est relue à chaque affichage).
// options.dossierInfos : si fourni, une réponse qui n'a remplacé aucun élément est rangée TOUT DE SUITE dans dossierInfos.informationsNonClassees (et retirée si la réponse change), jamais perdue même si la
// personne quitte la page sans la valider.
function passagesCreerEtat(points, options) {
  options = options || {};
  var liste = (points || []).filter(function (p) { return p && p.question; });
  return {
    points: liste,
    reponses: liste.map(function () { return { statut: 'attente', valeur: '' }; }),   // statut : attente | repondu | passe | retire
    journal: liste.map(function () { return null; }),                                   // opérations à défaire, par question
    appliquer: typeof options.appliquer === 'function' ? options.appliquer : null,
    cibles: typeof options.cibles === 'function' ? options.cibles : function () { return []; },
    marqueurRetirer: options.marqueurRetirer || PASSAGES_MARQUEUR_RETIRER,
    dossierInfos: options.dossierInfos || null,
    differe: !!(options.differe || options.rejoue),
    rejoue: !!options.rejoue,
    entreesInfos: liste.map(function () { return null; }),                              // ligne rangée dans les informations non classées, par question
    ouvert: true,        // le bloc est déplié ; « Terminé » le replie sur une ligne
    finalise: false      // vrai quand la page qui suit est validée : plus aucune modification
  };
}

function _passagesPhoto(etat) { return etat.cibles().map(_passagesCopie); }

function _passagesDefaire(etat, i) {
  var ops = etat.journal[i];
  etat.journal[i] = null;
  if (!ops || !ops.length) { return { annulees: 0, ignorees: 0 }; }
  return passagesAnnulerOps(etat.cibles(), ops);
}

// Change la réponse à la question i. statut : 'repondu' (avec valeur) | 'retire' | 'passe' | 'attente'. Renvoie { applique, ignorees } (ignorees > 0 : une valeur retouchée à la main n'a pas été touchée).
function passagesDefinirReponse(etat, i, statut, valeur) {
  var r = etat.reponses[i], p = etat.points[i];
  if (!r || !p || etat.finalise) { return { applique: false, ignorees: 0 }; }
  var texte = (statut === 'repondu') ? String(valeur == null ? '' : valeur).trim() : '';
  if (statut === 'repondu' && !texte) { statut = 'attente'; }
  if (etat.differe) {   // rien à appliquer ni à défaire maintenant : la page applique tout à la validation
    r.statut = statut;
    r.valeur = (statut === 'retire') ? etat.marqueurRetirer : texte;
    return { applique: false, ignorees: 0 };
  }
  var defait = _passagesDefaire(etat, i);
  r.statut = statut;
  r.valeur = (statut === 'retire') ? etat.marqueurRetirer : texte;
  var applique = false;
  if ((statut === 'repondu' || statut === 'retire') && etat.appliquer && p.extrait) {
    var avant = _passagesPhoto(etat);
    try { applique = !!etat.appliquer(p.extrait, r.valeur, p); } catch (e) { applique = false; }
    if (applique) {
      // chaque opération sait sur quel objet de `cibles` elle porte : la différence est faite objet par objet
      var ops = [];
      var apres = _passagesPhoto(etat);
      avant.forEach(function (photo, c) {
        var part = [];
        passagesDifference(photo, apres[c], [], part);
        part.forEach(function (op) { op.cible = c; ops.push(op); });
      });
      etat.journal[i] = ops;
    }
  }
  _passagesRangerNonAppliquee(etat, i, applique);
  return { applique: applique, ignorees: defait.ignorees };
}

// Range (ou retire) la réponse dans les informations non classées du dossier quand elle n'a remplacé aucun élément.
function _passagesRangerNonAppliquee(etat, i, applique) {
  if (!etat.dossierInfos) { return; }
  var d = etat.dossierInfos, liste = d.informationsNonClassees || [];
  var ancienne = etat.entreesInfos[i];
  if (ancienne) {
    var k = liste.indexOf(ancienne);
    if (k !== -1) { liste.splice(k, 1); }
    etat.entreesInfos[i] = null;
  }
  var r = etat.reponses[i], p = etat.points[i];
  if (r.statut === 'repondu' && r.valeur && !applique) {
    var ligne = (p.titre || 'Précision') + ' : ' + r.valeur;
    liste.push(ligne);
    etat.entreesInfos[i] = ligne;
  }
  if (liste.length || d.informationsNonClassees) { d.informationsNonClassees = liste; }
}

function passagesStatut(etat, i) { return etat.reponses[i] ? etat.reponses[i].statut : 'attente'; }

// Chiffres du bloc : total, traitées (répondues, passées ou retirées), restantes.
function passagesBilan(etat) {
  var b = { total: etat.points.length, repondues: 0, passees: 0, retirees: 0, restantes: 0, traitees: 0 };
  etat.reponses.forEach(function (r) {
    if (r.statut === 'repondu') { b.repondues++; } else if (r.statut === 'passe') { b.passees++; } else if (r.statut === 'retire') { b.retirees++; } else { b.restantes++; }
  });
  b.traitees = b.total - b.restantes;
  return b;
}

function _passagesPluriel(n, un, plusieurs) { return n + ' ' + (n > 1 ? plusieurs : un); }

// Texte du compteur sous les questions.
function passagesTexteCompteur(etat) {
  var b = passagesBilan(etat);
  return b.traitees + ' question' + (b.traitees > 1 ? 's' : '') + ' sur ' + b.total + ' traitée' + (b.traitees > 1 ? 's' : '');
}

// Ligne du bloc replié (après « Terminé »).
function passagesTexteResume(etat) {
  var b = passagesBilan(etat), m = [];
  if (b.repondues) { m.push(_passagesPluriel(b.repondues, 'précisé', 'précisés')); }
  if (b.retirees) { m.push(b.retirees + ' à retirer'); }
  if (b.passees) { m.push(_passagesPluriel(b.passees, 'passé', 'passés')); }
  if (b.restantes) { m.push(_passagesPluriel(b.restantes, 'laissé sans réponse', 'laissés sans réponse')); }
  return 'Passages à préciser : ' + (m.join(', ') || 'aucune réponse') + '.';
}

// Réponses qui n'ont remplacé aucun élément (rien trouvé à remplacer) : elles vont dans « informations non classées », comme avant.
function passagesReponsesNonAppliquees(etat) {
  var sortie = [];
  etat.points.forEach(function (p, i) {
    var r = etat.reponses[i];
    if (r.statut !== 'repondu' || !r.valeur || (etat.journal[i] && etat.journal[i].length)) { return; }
    sortie.push((p.titre || 'Précision') + ' : ' + r.valeur);
  });
  return sortie;
}

// Mode « différé » : applique d'un coup toutes les réponses sur `objet` (copie de travail de la page) avec `appliquer(extrait, valeur, point)`. Renvoie les lignes des réponses qui n'ont rien remplacé
// (« Titre : réponse »), à ranger dans les informations non classées. Une réponse « retirer » qui ne trouve rien est simplement oubliée.
function passagesAppliquerSurObjet(etat, objet, appliquer) {
  var non = [];
  etat.points.forEach(function (p, i) {
    var r = etat.reponses[i];
    if ((r.statut !== 'repondu' && r.statut !== 'retire') || !r.valeur) { return; }
    var ok = false;
    if (typeof appliquer === 'function' && p.extrait) { try { ok = !!appliquer(p.extrait, r.valeur, p); } catch (e) { ok = false; } }
    if (!ok && r.statut === 'repondu') { non.push((p.titre || 'Précision') + ' : ' + r.valeur); }
  });
  return non;
}

// À appeler UNE fois, quand la page qui suit est validée : range les réponses non appliquées dans dossier.informationsNonClassees puis fige le bloc. Renvoie ce qui a été rangé.
function passagesFinaliser(etat, dossierCible) {
  if (etat.finalise) { return []; }
  var reponses = passagesReponsesNonAppliquees(etat);
  if (etat.dossierInfos) { reponses = []; }   // déjà rangées au fil des réponses
  if (reponses.length && dossierCible) { dossierCible.informationsNonClassees = (dossierCible.informationsNonClassees || []).concat(reponses); }
  etat.finalise = true;
  return reponses;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PASSAGES_MARQUEUR_RETIRER: PASSAGES_MARQUEUR_RETIRER,
    passagesGroupesAnnees: passagesGroupesAnnees,
    passagesSujets: passagesSujets,
    passagesDifference: passagesDifference,
    passagesAnnulerOps: passagesAnnulerOps,
    passagesCreerEtat: passagesCreerEtat,
    passagesDefinirReponse: passagesDefinirReponse,
    passagesStatut: passagesStatut,
    passagesBilan: passagesBilan,
    passagesTexteCompteur: passagesTexteCompteur,
    passagesTexteResume: passagesTexteResume,
    passagesReponsesNonAppliquees: passagesReponsesNonAppliquees,
    passagesFinaliser: passagesFinaliser,
    passagesAppliquerSurObjet: passagesAppliquerSurObjet
  };
}
