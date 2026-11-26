/* ============================================================
   Module « Explorer les métiers » : INTERPRÉTATION D'UN CHEMIN, ÉCRANS, les trois chemins par la table INT_DEFS, chemins 2 et 3 le 22/11/2026 (consignes 552,  537 et 543 ; maquette docs/MAQUETTE_INTERPRETATION_PAR_CHEMIN_ET_QUESTIONS_EXPLORER_LES_METIERS_2026-11-22.html, validée).
   Charge après syntheseLecture.js ; la logique pure est dans interpretationLogique.js (testée sous Node).
   ÉTAPE 1 : le chemin « Chercher un métier » seulement. Fermé au public tant que INT_OUVERT est faux (visible sur localhost seulement), car les questions ne servent
   qu'à l'étape 2 (synthèse globale : cases à cocher, réponses, repérage des doublons).

   Deux écrans :
   - « interpretation-metier » : le passage avec l'assistant (choisir l'assistant, relire la demande qui est copiée, coller la réponse). C'est le passage commun
     (passageAssistant.js) : AUCUNE copie, comme « Ma lecture » ;
   - « interpretation-metier-lecture » : l'interprétation (quatre parties). Les questions de l'assistant sont GARDÉES DE CÔTÉ et jamais montrées ici : seulement leur nombre.
   Règles tenues :
   - l'interprétation et ses questions ne servent qu'à la personne et à sa synthèse ; elles restent en mémoire (jamais dans la disquette à cette étape) ;
   - quand la personne change ses choix dans « Chercher un métier », l'interprétation ne correspond plus : elle est retirée, avec un message doux (décision de Denis, consigne 543, point 5) ;
   - la demande vient de la même collecte que « Ma lecture » (synDonneesPourLecture), limitée au chemin (portée 'metier' de synConstruireDemande).
   ============================================================ */

// INTERRUPTEUR de l'interprétation par chemin. OUVERT AU PUBLIC le 25/11/2026 (décision de Denis). Pour refermer : repasser à false (elle redevient visible seulement sur localhost, avec le volet « Pour les essais »).
var INT_OUVERT = true;
function intOuvert() {
  if (INT_OUVERT) { return true; }
  try { return typeof location !== 'undefined' && /^(localhost|127\.0\.0\.1|\[::1\]|[^.]+\.localhost)$/.test(String(location.hostname || '')); } catch (e) { return false; }
}

var INT_CLE_PASSAGE_METIER = 'interpretation-metier';
var INT_MESSAGES_ECHEC = {
  vide: 'Le texte collé est vide.',
  coupee: 'La réponse s’arrête avant la fin, ou ce n’est pas la réponse attendue.',
  illisible: 'Cette réponse n’a pas pu être lue : elle n’a pas la forme demandée.',
  sans_contenu: 'Cette réponse ne contient pas d’interprétation utilisable.'
};

/* ---------- Ce que l'application garde (en mémoire seulement) ---------- */
function _intMemoire() {
  var s = synEtat();
  if (!s.interpretations || typeof s.interpretations !== 'object') { s.interpretations = {}; }
  return s.interpretations;
}
// L'interprétation reçue pour un chemin ('metier' pour l'instant), ou null.
function intInterpretation(chemin) { return _intMemoire()[chemin] || null; }

// Ce qui rend l'interprétation du chemin 1 « vraie » : les choix de la personne et le métier retenu. S'ils changent, elle ne correspond plus.
function _intSignatureMetier() {
  var S = (typeof pmEtat === 'function') ? pmEtat() : null, r = (typeof synRetenu === 'function') ? synRetenu(1) : null;
  if (!S) { return ''; }
  try { return JSON.stringify([S.comp, S.niveau, S.secteurs, S.fac, S.dif, r ? r.nom : '']); } catch (e) { return ''; }
}
// Chemins 2 et 3 : une empreinte courte de ce que l'interprétation a lu (les choix du chemin 2 ; le code et la date du résultat du chemin 3). Vide quand le passage n'est plus fait.
function _intSignature(cle) {
  if (cle === 'metier') { return _intSignatureMetier(); }
  var e = cmvEtat();
  try {
    if (cle === 'actions') {
      var c = e.choix || {}, r2 = (typeof synRetenu === 'function') ? synRetenu(2) : null;
      return intEmpreinte(JSON.stringify([c.activites, c.actions, c.environnement, c.conditions, c.faciles, c.eviter, r2 ? r2.nom : '']));
    }
    var res = e.q && e.q.resultat, r3 = (typeof synRetenu === 'function') ? synRetenu(3) : null;
    return res && res.calcul ? intEmpreinte(JSON.stringify([res.calcul.code, res.date, r3 ? r3.nom : ''])) : '';
  } catch (x) { return ''; }
}
// Retire l'interprétation qui ne correspond plus aux choix. Retourne vrai si elle vient d'être retirée (pour le dire à la personne).
function intVerifierPeremption(chemin) {
  var i = intInterpretation(chemin);
  if (!i) { return false; }
  // Chemin 1 : une interprétation relue depuis la disquette n'a pas de repère (les choix du chemin n'y sont pas gardés) : elle reste valable jusqu'à ce que la personne refasse des choix dans ce chemin.
  // Chemins 2 et 3 : l'empreinte est gardée avec l'interprétation ; sans empreinte, on ne peut rien affirmer : elle est retirée.
  var perimee = chemin === 'metier' ? (i.signature ? i.signature !== _intSignatureMetier() : _intChoixFaitsMetier()) : (i.signature ? i.signature !== _intSignature(chemin) : true);
  if (perimee) { delete _intMemoire()[chemin]; synEtat().interpRetiree = chemin; return true; }
  return false;
}
function _intAvisRetiree(chemin) { return synEtat().interpRetiree === chemin; }
function _intChoixFaitsMetier() {
  var S = (typeof pmEtat === 'function') ? pmEtat() : null;
  return !!(S && ((S.comp && S.comp.length) || S.niveau || (S.secteurs && S.secteurs.length) || (S.fac && S.fac.length) || (S.dif && S.dif.length)));
}

/* ---------- Les passages pris en compte et les réponses aux questions (étape 2, consigne 543) ---------- */
function _intExclus() { var s = synEtat(); if (!s.exclus || typeof s.exclus !== 'object') { s.exclus = {}; } return s.exclus; }
function intReponses() { var s = synEtat(); if (!s.reponsesQ || typeof s.reponsesQ !== 'object') { s.reponsesQ = {}; } return s.reponsesQ; }

// Le passage n est-il fait ? (1 : un métier retenu ou des choix ; 2 : des choix ; 3 : un résultat du questionnaire.)
function synPassageFait(n, etat) {
  var e = etat || cmvEtat();
  if (n === 1) { return !!synRetenu(1) || !!(typeof pmEtat === 'function' && typeof pmcNbChoix === 'function' && pmcNbChoix(pmEtat()) > 0); }
  if (n === 2) { return (typeof _cmaNombreChoix === 'function') && _cmaNombreChoix(e) > 0; }
  return !!(e.q && e.q.resultat);
}
// Les passages que la personne a mis de côté : l'assistant ne les lit pas. Rien tant que l'interprétation est fermée au public.
function synPassagesMisDeCote() {
  if (!intOuvert()) { return []; }
  var e = cmvEtat(), x = _intExclus();
  return [1, 2, 3].filter(function (n) { return x[n] && synPassageFait(n, e); });
}
// Toutes les interprétations reçues, par clé de chemin (une interprétation périmée est retirée avant).
function intInterpretationsParCle() {
  INT_CHEMINS.forEach(function (c) { intVerifierPeremption(c.cle); });
  var o = {};
  INT_CHEMINS.forEach(function (c) { var i = intInterpretation(c.cle); if (i) { o[c.cle] = i; } });
  return o;
}
// Les questions à poser maintenant : celles des passages faits ET pris en compte, doublons regroupés.
function intQuestionsPourSynthese(etat) {
  var cote = synPassagesMisDeCote();
  var actifs = INT_CHEMINS.filter(function (c) { return cote.indexOf(c.n) === -1 && synPassageFait(c.n, etat); }).map(function (c) { return c.n; });
  return intRegrouperQuestions(intInterpretationsParCle(), actifs, synEtat().complements);
}
// Les lignes ajoutées à la demande de la synthèse (lues par synDonneesPourLecture).
function intLignesPourDemande(etat) {
  if (!intOuvert()) { return []; }
  return intLignesReponses(intQuestionsPourSynthese(etat).uniques, intReponses());
}

/* ---------- La demande ---------- */
// Les trois chemins : tout ce qui change d'un chemin à l'autre est dans cette table (les mots, l'écran d'où l'on part, le prompt). Le reste du code est commun.
var INT_DEFS = {
  metier: {
    nom: '« Chercher un métier »', prompt: 'interpretation-chemin-metier', retour: 'metier', n: 1,
    idSuffixe: 'IntMetier', attr: 'data-assistant-intmetier', idErreur: 'intErreurChoixIA', suivi: 'interpretation_metier',
    lit: 'les choix que vous avez faits ici, et votre parcours si vous l’avez ajouté',
    ceQueDit: 'ce que vos choix disent, ce qu’ils ne peuvent pas dire, quelques métiers à regarder de plus près',
    copie: 'La demande est copiée automatiquement : vos choix de « Chercher un métier », votre parcours si vous l’avez ajouté, et ce que vous avez écrit. Rien à écrire vous-même.',
    confid: 'Seuls vos choix de « Chercher un métier » et les mots que vous avez écrits partent chez l’assistant : ni votre nom, ni votre adresse, ni votre téléphone.',
    quoi: 'L’assistant vient de lire vos choix de « Chercher un métier ».', pourquoi: 'Vous découvrez des pistes de réflexion à partir de ce que vous avez choisi.',
    titrePartie1: 'Ce que disent mes choix', sensDe: 'vos choix', changement: 'Vous avez changé vos choix',
    sansSource: 'Il faut d’abord faire des choix dans « Chercher un métier » : l’assistant n’a rien à interpréter pour l’instant.', retourSource: 'Retourner à « Chercher un métier »',
    raccourcir: 'Raccourcissez les mots que vous avez écrits dans « Ce que les tests ne disent pas » puis réessayez.'
  },
  actions: {
    nom: '« Partir de vos envies »', prompt: 'interpretation-chemin-actions', retour: 'resultats2', n: 2,
    idSuffixe: 'IntActions', attr: 'data-assistant-intactions', idErreur: 'intErreurActionsIA', suivi: 'interpretation_actions',
    lit: 'les envies que vous avez choisies ici, et votre parcours si vous l’avez ajouté',
    ceQueDit: 'ce que vos envies disent, ce qu’elles ne peuvent pas dire, quelques métiers à regarder de plus près',
    copie: 'La demande est copiée automatiquement : vos envies de « Partir de vos envies », ce que vous voulez éviter, votre parcours si vous l’avez ajouté, et ce que vous avez écrit. Rien à écrire vous-même.',
    confid: 'Seuls vos choix de « Partir de vos envies » et les mots que vous avez écrits partent chez l’assistant : ni votre nom, ni votre adresse, ni votre téléphone.',
    quoi: 'L’assistant vient de lire vos choix de « Partir de vos envies ».', pourquoi: 'Vous découvrez des pistes de réflexion à partir de ce que vous avez choisi.',
    titrePartie1: 'Ce que disent mes envies', sensDe: 'vos choix', changement: 'Vous avez changé vos choix',
    sansSource: 'Il faut d’abord faire des choix dans « Partir de vos envies » : l’assistant n’a rien à interpréter pour l’instant.', retourSource: 'Choisir mes envies',
    raccourcir: 'Raccourcissez les mots que vous avez écrits dans « Ce que les tests ne disent pas » puis réessayez.'
  },
  q: {
    nom: '« Le questionnaire de préférences »', prompt: 'interpretation-chemin-q', retour: 'resultat', n: 3,
    idSuffixe: 'IntQ', attr: 'data-assistant-intq', idErreur: 'intErreurQIA', suivi: 'interpretation_q',
    lit: 'le résultat de votre questionnaire (vos six lettres), jamais vos réponses une à une, et votre parcours si vous l’avez ajouté',
    ceQueDit: 'ce que vos lettres disent, ce qu’elles ne peuvent pas dire, quelques métiers à regarder de plus près',
    copie: 'La demande est copiée automatiquement : le résultat de votre questionnaire (un pourcentage par lettre, jamais vos réponses), votre parcours si vous l’avez ajouté, et ce que vous avez écrit. Rien à écrire vous-même.',
    confid: 'Seul le résultat de votre questionnaire (un pourcentage par lettre) et les mots que vous avez écrits partent chez l’assistant, jamais vos réponses : ni votre nom, ni votre adresse, ni votre téléphone.',
    quoi: 'L’assistant vient de lire le résultat de votre questionnaire.', pourquoi: 'Vous découvrez des pistes de réflexion à partir de vos six lettres.',
    titrePartie1: 'Ce que disent mes lettres', sensDe: 'vos lettres', changement: 'Vous avez refait le questionnaire',
    sansSource: 'Il faut d’abord un résultat du questionnaire avec assez de réponses : l’assistant n’a rien à interpréter pour l’instant.', retourSource: 'Voir le questionnaire',
    raccourcir: 'Raccourcissez les mots que vous avez écrits dans « Ce que les tests ne disent pas » puis réessayez.'
  }
};
function _intCle(c) { return INT_DEFS[c] ? c : 'metier'; }
function _intPassage(cle) { return 'interpretation-' + cle; }
function _intVueLecture(cle) { return 'interpretation-' + cle + '-lecture'; }
var INT_CLE_PASSAGE_METIER = _intPassage('metier');

function _intModele(cle) { return (typeof promptsExternesCharges !== 'undefined' && promptsExternesCharges && promptsExternesCharges[INT_DEFS[_intCle(cle)].prompt]) || ''; }
function intDemande(cle, etat) {
  var m = _intModele(cle);
  return m ? intConstruireDemande(m, synDonneesPourLecture(etat, true), _intCle(cle)) : null;
}
function intDemandeMetier(etat) { return intDemande('metier', etat); }
// Le chemin a-t-il quelque chose à interpréter ?
function _intSources(cle, etat) {
  var d = synDonneesPourLecture(etat, true), q = etat.q && etat.q.resultat && etat.q.resultat.calcul;
  if (cle === 'actions') { return !!d.p2; }
  if (cle === 'q') { return !!(d.p3 && q && q.etat !== 'peu_reponses' && !q.peuDeLignes); }
  return !!(d.p1 || d.p1liste);
}
function _intSourcesMetier(etat) { return _intSources('metier', etat); }

function _intChargerFiches() {
  if (typeof pmCharger !== 'function' || (typeof _pmD !== 'undefined' && _pmD)) { return; }
  pmCharger(function (ok) {
    var e = cmvEtat(), m = /^interpretation-(metier|actions|q)$/.exec(e.vue);
    if (ok && m && ucpmPassageVue(e, e.vue) !== 'coller') { cmvRendre(); }
  });
}

function _intEtapes(cle) {
  return [
    { titre: 'Copie', detail: INT_DEFS[cle].copie },
    { titre: 'Chez l’assistant', detail: 'Vous collez la demande et vous attendez sa réponse.' },
    { titre: 'Retour ici', detail: 'Vous copiez toute sa réponse et vous la collez dans cette page.' },
    { titre: 'Mon interprétation', detail: 'Vous lisez ses pistes de réflexion. Les questions qu’il a préparées vous seront posées plus tard, au moment de votre synthèse.' }
  ];
}

function _intRecap(cle, etat) {
  var dem = intDemande(cle, etat), d = synDonneesPourLecture(etat, true), s = synEtat(), def = INT_DEFS[cle];
  var faits = [];
  if (cle === 'metier') {
    if (d.p1liste) { faits.push('vos choix de « Chercher un métier » (' + d.p1liste.nbChoix + ')'); }
    if (d.p1 && d.p1.retenu) { faits.push('le métier retenu'); }
  } else if (cle === 'actions') {
    if (d.p2) { faits.push('vos choix de « Partir de vos envies » (' + d.p2.nbChoix + ')'); }
    if (d.p2 && d.p2.eviter && d.p2.eviter.length) { faits.push('ce que vous voulez éviter'); }
    if (d.p2 && d.p2.retenu) { faits.push('le métier retenu'); }
  } else if (d.p3) {
    faits.push('le résultat de votre questionnaire (un pourcentage par lettre)');
    if (d.p3.retenu) { faits.push('le métier retenu'); }
  }
  if (s.parcours.some(function (e) { return synpNbCoches(e) > 0; })) { faits.push('votre parcours (métiers exercés et compétences cochées)'); }
  var h = '<div class="cml-encart"><i class="bi bi-send-check" aria-hidden="true"></i><div><p class="mb-1"><b>Ce qui va partir chez l’assistant</b> : ' + (faits.length ? faits.join(', ') : 'rien encore') +
    (s.niveau || (s.suivi && s.suivi.length) || (s.complements && s.complements.length) ? ', votre situation' : '') + (s.libre && s.libre.trim() ? ', vos mots' : '') + '.</p>' +
    '<p class="cml-note mb-0">Ni votre nom, ni votre adresse, ni votre téléphone. Rien des deux autres chemins : seulement ce passage.</p></div></div>';
  if (dem) {
    var tid = 'intDemandeTexte' + def.idSuffixe;
    h += '<details class="cml-depli"><summary>Relire la demande avant de l’envoyer</summary><div class="corps">' +
      '<textarea id="' + tid + '" class="form-control" rows="14" readonly aria-label="La demande qui sera copiée pour l’assistant">' + cmvE(dem.texte) + '</textarea>' +
      '<p class="cml-note mt-2 mb-0">' + (dem.retires.length ? 'Certaines listes ont été raccourcies pour tenir en un seul envoi. ' : '') + 'Vous pouvez la lire, mais pas la modifier ici : pour changer ce qui part, retournez à ' + def.nom + '.</p></div></details>';
  }
  return h;
}

function _intConfig(cle, etat) {
  var def = INT_DEFS[cle];
  return {
    idSuffixe: def.idSuffixe,
    rerendre: cmvRendre,
    attrAssistant: def.attr,
    idErreur: def.idErreur,
    nomSuivi: def.suivi,
    recapHtml: _intRecap(cle, etat),
    etapes: _intEtapes(cle),
    texteConfidentialite: def.confid,
    avantEnvoi: function () {
      if (!_synFichesPretes()) { return 'Les fiches des métiers se chargent. Patientez quelques secondes puis réessayez.'; }
      var dem = intDemande(cle, etat);
      if (!dem) { return 'Les consignes ne sont pas chargées pour le moment. Vérifiez votre connexion, rechargez la page puis réessayez.'; }
      if (dem.tropLong) { return 'Votre demande est trop longue pour un seul envoi. ' + def.raccourcir; }
      return '';
    },
    construireTexte: function () { var d = intDemande(cle, etat); return d ? d.texte : ''; },
    module: { libelleSuite: 'Voir mon interprétation', quoi: def.quoi, pourquoi: def.pourquoi,
      verif: 'lisez chaque piste avec attention : ce sont des idées à confirmer ou à changer, jamais une décision.' },
    verifier: function (texte) { return intAnalyser(texte).ok; },
    importer: function (texte) {
      var r = intAnalyser(texte);
      if (!r.ok) { return { succes: false, coupe: r.raison === 'coupee', erreur: INT_MESSAGES_ECHEC[r.raison] || INT_MESSAGES_ECHEC.illisible }; }
      r.interpretation.date = _synDateFr();
      r.interpretation.signature = _intSignature(cle);
      _intMemoire()[cle] = r.interpretation; if (synEtat().interpRetiree === cle) { delete synEtat().interpRetiree; }
      return { succes: true };
    },
    apresSucces: function () { cmvAller(_intVueLecture(cle)); }
  };
}

/* ---------- Le bloc de la page du chemin ---------- */
// Placé en bas des résultats du chemin (parMetierEcran.js, parActions.js, questionnaire.js) ; vide tant que l'interprétation est fermée.
function intBloc(cle) {
  cle = _intCle(cle);
  if (!intOuvert()) { return ''; }
  intVerifierPeremption(cle);
  var def = INT_DEFS[cle], i = intInterpretation(cle);
  var h = '<div class="cml-bloc cml-bloc-synthese"><h2><i class="bi bi-chat-square-quote" aria-hidden="true"></i> Faire interpréter ce passage par l’assistant en ligne ' + _synPastilleEtat(!!i, 'Interprétation reçue') + '</h2>' +
    '<p>L’assistant lit ' + def.lit + '. Il vous propose une interprétation de <b>ce passage seulement</b> : ' + def.ceQueDit + '. Ce sont des <b>pistes de réflexion</b>, pas une note, pas un diagnostic, pas une solution.</p>' +
    '<p class="cml-note">Un seul passage fait suffit. Vous relisez la demande avant qu’elle parte.</p>';
  if (_intAvisRetiree(cle) && !i) {
    h += cmvEncart('bi-info-circle', def.changement + ' : l’interprétation précédente ne correspondait plus, elle a été retirée. Vous pouvez en demander une nouvelle.');
  }
  h += '<div class="boutons-ligne">' +
    (i ? '<button type="button" class="btn btn-primary" style="min-height:46px" data-cml="aller" data-vue="' + _intVueLecture(cle) + '"><i class="bi bi-chat-square-quote" aria-hidden="true"></i> Voir mon interprétation</button>' : '') +
    '<button type="button" class="btn ' + (i ? 'btn-outline-primary' : 'btn-primary') + '" style="min-height:46px" data-cml="intDemander" data-chemin="' + cle + '"><i class="bi bi-send" aria-hidden="true"></i> ' + (i ? 'Refaire l’interprétation' : 'Préparer ma demande à l’assistant') + '</button></div></div>';
  return h;
}
function intBlocMetier() { return intBloc('metier'); }
cmvEnregistrerAction('intDemander', function (el, etat) {
  var cle = el.getAttribute('data-chemin');
  if (!INT_DEFS[cle]) { return false; }
  ucpmPassageReinitialiser(etat, _intPassage(cle));
  cmvAller(_intPassage(cle));
  return false;
});

var _INT_PAGE_FERMEE = '<div class="cml-invite"><i class="bi bi-lightbulb" aria-hidden="true"></i><div><p class="mb-1">Cette page n’est pas encore ouverte.</p><button type="button" class="btn btn-primary" data-cml="aller" data-vue="accueil">Retourner à l’accueil</button></div></div>';

/* ---------- Écran 1 : le passage avec l'assistant ---------- */
function _intEnregistrerPassage(cle) {
  var def = INT_DEFS[cle], pk = _intPassage(cle);
  cmvEnregistrerVue(pk, {
    titre: function (etat) { return ucpmPassageVue(etat, pk) === 'coller' ? 'Rapporter la réponse : étape 2 sur 2' : 'Interpréter ' + def.nom + ' : étape 1 sur 2'; },
    barre: function (etat) { return { retour: function () { if (!ucpmPassageRetour(etat, pk, cmvRendre)) { cmvAller(def.retour); } } }; },
    rendre: function (etat) {
      if (!intOuvert()) { return _INT_PAGE_FERMEE; }
      if (!_intSources(cle, etat)) {
        return '<div class="cml-invite"><i class="bi bi-lightbulb" aria-hidden="true"></i><div><p class="mb-1">' + def.sansSource + '</p>' +
          '<button type="button" class="btn btn-primary" data-cml="aller" data-vue="' + def.retour + '">' + def.retourSource + '</button></div></div>';
      }
      return ucpmPassageRendre(etat, pk, _intConfig(cle, etat));
    },
    cabler: function (etat) { if (!intOuvert()) { return; } _intChargerFiches(); if (_intSources(cle, etat)) { ucpmPassageCabler(etat, pk, _intConfig(cle, etat)); } }
  });
}

/* ---------- Écran 2 : mon interprétation ---------- */
function _intNiveauMetier(nom) {
  if (typeof metierParNom !== 'function') { return null; }
  // « Aide-soignant ou aide-soignante » : la fiche se retrouve aussi par la première forme du nom.
  var f = metierParNom(nom) || metierParNom(String(nom).split(/\s+ou\s+/i)[0]);
  return f ? { fiche: f.nom, niveau: _synLibNiveau(cmlNiveauDeMetier(f)) } : null;
}
function _intBlocMetierPiste(m, num, cle) {
  var info = _intNiveauMetier(m.metier), sensDe = INT_DEFS[_intCle(cle)].sensDe;
  return '<div class="cml-piste"><b>' + num + '. ' + cmvE(m.metier) + '</b>' +
    (m.sens ? _synParas(m.sens, 'mb-1', '<i class="bi bi-check2" aria-hidden="true"></i> Va dans le sens de ' + sensDe + ' : ') : '') +
    (m.verifier ? _synParas(m.verifier, 'cml-note mb-1', '<i class="bi bi-question-circle" aria-hidden="true"></i> À vérifier : ') : '') +
    (info && info.niveau ? '<p class="cml-note mb-1"><i class="bi bi-mortarboard" aria-hidden="true"></i> Niveau d’accès : ' + cmvE(info.niveau) + '</p>' : '') +
    (info ? '<p class="mb-0"><button type="button" class="btn btn-outline-primary btn-sm" data-cml="fiche" data-nom="' + cmvE(info.fiche) + '"><i class="bi bi-arrow-right-circle" aria-hidden="true"></i> Voir la fiche de ce métier</button></p>' : '') +
    '</div>';
}
function _intPartie(icone, titre, corps) {
  return '<div class="cml-bloc"><h2><i class="bi ' + icone + '" aria-hidden="true"></i> ' + titre + '</h2>' + corps + '</div>';
}

// Les questions préparées par l'assistant, montrées SEULEMENT pendant les essais (interrupteur fermé), pour que Denis juge le prompt. Jamais au public.
function _intQuestionsPourEssais(i) {
  if (INT_OUVERT || !i.questions.length) { return ''; }
  return '<details class="cml-depli"><summary>Pour les essais : voir les questions préparées par l’assistant</summary><div class="corps">' +
    '<p class="cml-note">Visible seulement pendant les essais. La personne ne verra ces questions qu’au moment de sa synthèse.</p><ol class="mb-0">' +
    i.questions.map(function (q) { return '<li><b>' + cmvE(q.texte) + '</b> <span class="cml-note">(sujet : ' + cmvE(q.sujet) + (q.plusieurs ? ', plusieurs réponses' : '') + ')</span><br>' + q.reponses.map(cmvE).join(' · ') + '</li>'; }).join('') + '</ol></div></details>';
}

function _intHtmlLecture(cle) {
  var def = INT_DEFS[cle], retiree = intVerifierPeremption(cle), i = intInterpretation(cle);
  if (!i) {
    return '<div class="cml-invite"><i class="bi bi-lightbulb" aria-hidden="true"></i><div><p class="mb-1">' +
      (retiree ? def.changement + ' : l’interprétation précédente ne correspondait plus, elle a été retirée.' : 'Vous n’avez pas encore d’interprétation de ' + def.nom + '.') +
      '</p><button type="button" class="btn btn-primary" data-cml="intDemander" data-chemin="' + cle + '"><i class="bi bi-send" aria-hidden="true"></i> Préparer ma demande à l’assistant</button></div></div>';
  }
  var h = '<p class="cml-note">Interprétation de l’assistant en ligne, reçue le ' + cmvE(i.date || '') + '. Elle porte seulement sur le passage ' + def.nom + '.</p>' +
    cmvEncart('bi-info-circle', 'Ce sont des pistes de réflexion, pas une note, pas un diagnostic, pas une solution. Relisez-les avec une personne qui vous accompagne.', true);
  if (i.choix) { h += _intPartie('bi-1-circle', def.titrePartie1, _synParas(i.choix, 'mb-0', '')); }
  if (i.parcours) { h += _intPartie('bi-2-circle', 'Ce que mon parcours ajoute', _synParas(i.parcours, 'mb-0', '')); }
  if (i.limites) { h += _intPartie('bi-3-circle', 'Ce que ce résultat ne peut pas dire', _synParas(i.limites, 'mb-0', '')); }
  if (i.metiers.length) { h += _intPartie('bi-4-circle', 'Des métiers à regarder de plus près', '<div class="cml-pistes">' + i.metiers.map(function (m, k) { return _intBlocMetierPiste(m, k + 1, cle); }).join('') + '</div>'); }
  var n = i.questions.length;
  if (i.questionsInsuffisantes) {
    h += cmvEncart('bi-info-circle', 'L’assistant a préparé ' + (n ? 'seulement ' + n + ' question' + (n > 1 ? 's' : '') : 'aucune question') + ' : c’est trop peu pour affiner votre synthèse. Vous pouvez refaire l’interprétation.', true) +
      '<div class="boutons-ligne"><button type="button" class="btn btn-outline-primary" style="min-height:46px" data-cml="intDemander" data-chemin="' + cle + '"><i class="bi bi-send" aria-hidden="true"></i> Refaire l’interprétation</button></div>';
  } else {
    h += '<div class="cml-invite"><i class="bi bi-patch-question" aria-hidden="true"></i><div><p class="mb-1"><b>' + (n === 5 ? 'Cinq' : n) + ' questions pour affiner cette interprétation.</b> L’assistant en a préparé pour ce passage. Vous les verrez au moment de faire votre synthèse : vous pourrez y répondre en cliquant ou avec vos mots.</p>' +
      '<button type="button" class="btn btn-primary" data-cml="aller" data-vue="synthese"><i class="bi bi-diagram-3" aria-hidden="true"></i> Aller à ma synthèse</button></div></div>';
  }
  return h + _intQuestionsPourEssais(i);
}

function _intEnregistrerLecture(cle) {
  var def = INT_DEFS[cle];
  cmvEnregistrerVue(_intVueLecture(cle), {
    titre: 'Mon interprétation : ' + def.nom.replace(/[«»]\s?|\s?»/g, ''),
    barre: function () { return { retour: def.retour }; },
    rendre: function () { return intOuvert() ? _intHtmlLecture(cle) : _INT_PAGE_FERMEE; },
    cabler: function () { /* aucun geste propre : les boutons passent par data-cml */ }
  });
}

Object.keys(INT_DEFS).forEach(function (cle) { _intEnregistrerPassage(cle); _intEnregistrerLecture(cle); });
