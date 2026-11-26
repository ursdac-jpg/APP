/* ============================================================
   modules/mon-plan/index.js
   « Mon plan » : la PAGE (route 'mon-plan'), une étape partagée ouverte depuis « Ce qui compte pour moi » et depuis « Ma synthèse » d'« Explorer les métiers »
   (consignes 608, 610, 611, 615, 618 et 619 ; maquette validée docs/maquettes/maquette-mon-plan-2026-11-26.html).
   Charge après logique.js et document.js, après les modules « Ce qui compte pour moi » et « Explorer les métiers » (lus seulement, protégés par typeof).
   Trois vues : 'preparer' (ce qui est repris, trois questions), 'assistant' (le passage commun, jamais recopié : passageAssistant.js), 'plan' (lire, cocher, imprimer).
   Règles : rien n'est redemandé ; rien ne part tant que la personne ne le décide pas ; le plan n'est jamais obligatoire ni bloquant ;
   le suivi d'usage ne reçoit que des noms d'écran, jamais un texte.
   ============================================================ */

// INTERRUPTEUR UNIQUE (même patron que cqcpmOuvert()). OUVERT AU PUBLIC le 26/11/2026 (décision de Denis, après l'essai réel de la demande).
// Pour refermer : repasser à false (le module redevient visible seulement sur localhost).
var MPL_OUVERT = true;
function mplOuvert() {
  if (MPL_OUVERT) { return true; }
  try { return typeof location !== 'undefined' && /^(localhost|127\.0\.0\.1|\[::1\]|[^.]+\.localhost)$/.test(String(location.hostname || '')); } catch (e) { return false; }
}
var MPL_NOM = 'Mon plan';
var MPL_ICONE = 'bi-calendar-check';
var MPL_ROUTE = 'mon-plan';
var MPL_PASSAGE = 'plan';   // clé du passage commun dans etat.passages (jamais dans la disquette)

var _mplEtat = null;
var _mplSessionHistorique = 1;
function mplEtat() { if (!_mplEtat) { _mplEtat = mplEtatInitial(); } return _mplEtat; }
var _mplUi = { vue: 'preparer', depuis: null };
var _mplVueRendue = '';

/* ---------------- Disquette (contrat standard, js/app.js : collecterEtatsModulesPourSauvegarde / restaurerEtatsModules) ---------------- */
function mplExporterEtatPourSauvegarde() { return _mplEtat ? mplPourFichier(_mplEtat) : null; }
function mplRestaurerEtatDepuisSauvegarde(brut) {
  _mplEtat = null; _mplSessionHistorique++; _mplUi = { vue: 'preparer', depuis: null };
  if (brut) { _mplEtat = mplDepuisFichier(brut); }
}

/* ---------------- Les sources, lues dans les deux espaces (jamais modifiées ici) ---------------- */
function _mplSourcePas() {
  if (typeof cqcpmOuvert !== 'function' || !cqcpmOuvert() || typeof cqcpmEtat !== 'function' || typeof cqcpmCarte !== 'function') { return null; }
  var etat = cqcpmEtat(), g = etat.gardees && etat.gardees.pas, carte = cqcpmCarte('pas');
  if (!g || !carte) { return null; }
  var r = g.reponses || {};
  var libs = function (champId) {
    var champ = typeof cqcpmChamp === 'function' ? cqcpmChamp(carte, champId) : null, ids = Array.isArray(r[champId]) ? r[champId] : [];
    if (!champ || typeof cqcpmOptionsChoix !== 'function') { return ids; }
    var l = {}; cqcpmOptionsChoix(champ, r, etat).forEach(function (o) { l[o.id] = o.lib; });
    return ids.map(function (id) { return l[id] || id; });
  };
  var action = libs('action')[0] || (typeof r.autre_action === 'string' ? r.autre_action.trim() : '');
  if (typeof r.autre_action === 'string' && r.autre_action.trim() && !libs('action').length) { action = r.autre_action.trim(); }
  return { action: action || '', qui: libs('qui'), parler: typeof r.question === 'string' ? r.question.trim() : '' };
}
function _mplSourcePapier() {
  if (typeof cqcpmOuvert !== 'function' || !cqcpmOuvert() || typeof cqcpmEtat !== 'function' || typeof cqcpmPapierSections !== 'function') { return null; }
  var etat = cqcpmEtat(), p = typeof cqcpmPapier === 'function' ? cqcpmPapier(etat) : null;
  if (!p) { return null; }
  var lignes = cqcpmPapierSections(etat).filter(function (s) { return !s.pasPourLecture; }).map(function (s) {
    return s.titreFeuille + ' : ' + (s.type === 'liste' ? s.valeur.join(' ; ') : s.valeur);
  });
  return lignes.length ? { date: p.date || '', lignes: lignes } : null;
}
function _mplSourceMetiers() {
  if (typeof cmvOuvert !== 'function' || !cmvOuvert() || typeof synEtat !== 'function' || typeof synPourFichier !== 'function') { return []; }
  var f = synPourFichier(synEtat());
  if (!f) { return []; }
  return [f.retenu1, f.retenu2, f.retenu3].filter(function (r) { return r && r.nom; }).map(function (r) { return r.nom; });
}
function mplSources() { return { pas: _mplSourcePas(), papier: _mplSourcePapier(), metiers: _mplSourceMetiers() }; }

/* ---------------- Entrées depuis les deux espaces ---------------- */
// route = la page d'où la personne vient (« Retour » y ramène). vue = 'plan' ou 'preparer' (par défaut : le plan s'il existe).
function mplOuvrirDepuis(route, vue) {
  _mplUi.depuis = route || null;
  _mplUi.vue = vue || (mplPlan(mplEtat()) ? 'plan' : 'preparer');
  if (typeof naviguerVers === 'function') { naviguerVers(MPL_ROUTE); }
}
// Sans espace d'origine (arrivée par la recherche de l'accueil) : « Retour » ramène à l'accueil.
function _mplRetourVers() { return _mplUi.depuis || 'cv'; }
function _mplLibRetour() {
  var d = _mplRetourVers();
  if (d === 'ce-qui-compte') { return 'Retour à « Ce qui compte pour moi »'; }
  if (typeof CMV_ROUTE !== 'undefined' && d === CMV_ROUTE) { return 'Retour à « Ma synthèse »'; }
  return 'Retour';
}
function mplRetourBarre() {
  if (_mplUi.vue === 'assistant') {
    if (!ucpmPassageRetour(mplEtat(), MPL_PASSAGE, mplRendre)) { _mplUi.vue = 'preparer'; mplRendre(); }
    return;
  }
  if (typeof naviguerVers === 'function') { naviguerVers(_mplRetourVers()); }
}
function mplAllerVue(vue) { _mplUi.vue = vue; mplRendre(); }

/* ---------------- Morceaux ---------------- */
function _mplE(t) { return String(t === undefined || t === null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function _mplAide(icone, html) { return '<div class="cqcpm-aide"><i class="bi ' + icone + '" aria-hidden="true"></i><span>' + html + '</span></div>'; }
function _mplAlerte(html) { return '<div class="cqcpm-alerte"><i class="bi bi-info-circle" aria-hidden="true"></i><span>' + html + '</span></div>'; }
function _mplPastille(lib, ico) { return ' <span class="cqcpm-pastille"><i class="bi ' + (ico || 'bi-check-circle-fill') + '" aria-hidden="true"></i> ' + lib + '</span>'; }
function mplDateDuJour() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function _mplCqcpmDispo() { return typeof cqcpmOuvert === 'function' && cqcpmOuvert(); }
function _mplExplorerDispo() { return typeof cmvOuvert === 'function' && cmvOuvert(); }

/* ---------------- Le bloc « Mon plan » : le MÊME dans les deux espaces (ici = 'ce-qui-compte' ou la route d'Explorer) ---------------- */
function mplHtmlBloc(ici) {
  if (!mplOuvert()) { return ''; }
  var etat = mplEtat(), sources = mplSources(), p = mplPlan(etat), dansSynthese = typeof CMV_ROUTE !== 'undefined' && ici === CMV_ROUTE;
  var h = '<div class="cqcpm-bloc mpl-bloc"><h2><span class="cqcpm-ico"><i class="bi ' + MPL_ICONE + '" aria-hidden="true"></i></span> ' + _mplE(MPL_TITRE) +
    (p ? _mplPastille('Plan reçu') : '') + (p && dansSynthese && mplJoint(etat) ? _mplPastille('Joint à ma synthèse', 'bi-link-45deg') : '') + '</h2>';
  if (!p && !mplAuMoinsUneSource(sources)) {
    return h + '<p class="mb-1">Ce plan reprend ce que vous avez écrit dans « Ce qui compte pour moi » ou dans « Ma synthèse » d’« Explorer les métiers ». Commencez par l’un des deux : rien ne presse, et le plan n’est jamais obligatoire.</p>' +
      '<div class="cqcpm-actions"><button type="button" class="btn btn-outline-primary" disabled><i class="bi ' + MPL_ICONE + '" aria-hidden="true"></i> Préparer mon plan</button></div></div>';
  }
  if (p) {
    h += (mplPlanAChange(etat, sources) ? '<p class="cqcpm-note mb-1"><i class="bi bi-info-circle" aria-hidden="true"></i> Depuis ce plan, vous avez changé une réponse qu’il reprenait. Vous pouvez le garder tel quel ou le refaire.</p>' : '') +
      '<p class="mb-1">' + (p.date ? 'Préparé le ' + _mplE(mplDateCourte(p.date)) + '. ' : '') + 'Vous pouvez cocher ce qui est fait, au fil des semaines.</p>';
    if (dansSynthese) {
      h += (mplJoint(etat) ? '<p class="cml-note">Ce plan est joint à votre synthèse : il figure sur la feuille imprimée. Il n’est pas envoyé à l’assistant, et il ne change rien à « Ma lecture ».</p>'
        : '<p>Ce plan n’est pas joint à votre synthèse. Si vous le joignez, il figure sur la feuille imprimée de « Ma synthèse ». Il n’est jamais envoyé à l’assistant.</p>') +
        '<div class="cqcpm-actions">' + (mplJoint(etat)
          ? '<button type="button" class="btn btn-outline-secondary" data-mpl-bloc="joindre" data-v="0"><i class="bi bi-x-circle" aria-hidden="true"></i> Ne plus joindre ce plan</button>'
          : '<button type="button" class="btn btn-primary" data-mpl-bloc="joindre" data-v="1"><i class="bi bi-link-45deg" aria-hidden="true"></i> Joindre mon plan</button>') +
        '<button type="button" class="btn btn-outline-primary" data-mpl-bloc="ouvrir" data-v="' + _mplE(ici) + '"><i class="bi ' + MPL_ICONE + '" aria-hidden="true"></i> Ouvrir mon plan</button></div>';
    } else {
      h += '<div class="cqcpm-actions"><button type="button" class="btn btn-primary" data-mpl-bloc="ouvrir" data-v="' + _mplE(ici) + '"><i class="bi ' + MPL_ICONE + '" aria-hidden="true"></i> Ouvrir mon plan</button>' +
        '<button type="button" class="btn btn-outline-secondary" data-mpl-bloc="refaire" data-v="' + _mplE(ici) + '">Le refaire</button></div>';
    }
    return h + '</div>';
  }
  return h + '<p class="mb-1">Quatre semaines, quelques petites actions par semaine, et ce que vous ferez si quelque chose vous freine. Le plan reprend ce que vous avez déjà écrit, sans vous le redemander. Il n’est jamais obligatoire.</p>' +
    '<div class="cqcpm-actions"><button type="button" class="btn btn-primary" data-mpl-bloc="refaire" data-v="' + _mplE(ici) + '"><i class="bi ' + MPL_ICONE + '" aria-hidden="true"></i> Préparer mon plan</button></div></div>';
}
// Les clics du bloc (délégués depuis la page de l'espace qui l'affiche). rerendre = la fonction qui redessine cette page. Retourne vrai si le clic est traité.
function mplClicBloc(ev, rerendre) {
  var b = ev.target && ev.target.closest ? ev.target.closest('[data-mpl-bloc]') : null;
  if (!b) { return false; }
  var act = b.getAttribute('data-mpl-bloc'), v = b.getAttribute('data-v');
  if (act === 'ouvrir') { mplOuvrirDepuis(v, 'plan'); return true; }
  if (act === 'refaire') { mplOuvrirDepuis(v, 'preparer'); return true; }
  if (act === 'joindre') { mplJoindre(mplEtat(), v === '1'); if (typeof trackEvenement === 'function') { trackEvenement('mon_plan_joint', { oui: v === '1' }); } if (typeof rerendre === 'function') { rerendre(); } return true; }
  return false;
}

/* ---------------- Préparer mon plan ---------------- */
function _mplLigneSource(etat, sources, id, titre, detail, absent) {
  if (!mplSourcePresente(sources, id)) {
    return '<div class="mpl-source absente"><span class="cqcpm-ico petit"><i class="bi bi-dash-circle" aria-hidden="true"></i></span><span><h3>' + titre + '</h3><p>' + absent + '</p></span></div>';
  }
  var on = mplSourceCochee(etat, id);
  return '<label class="mpl-source' + (on ? ' coche' : '') + '"><input type="checkbox" data-mpl-act="source" data-v="' + id + '"' + (on ? ' checked' : '') + '><span><h3>' + titre + '</h3><p>' + detail + '</p></span></label>';
}
function _mplNotePreparer(prep) { return prep.ok ? '' : (prep.raison === 'source' ? 'Gardez au moins une chose cochée pour continuer.' : 'Écrivez ce que vous visez pour continuer.'); }
function _mplHtmlPreparer() {
  var etat = mplEtat(), sources = mplSources(), q = etat.questions;
  if (!mplAuMoinsUneSource(sources)) {
    return _mplAlerte('Ce plan reprend ce que vous avez écrit dans « Ce qui compte pour moi » ou dans « Ma synthèse ». Commencez par l’un des deux, puis revenez ici.') +
      '<div class="cqcpm-actions">' + (_mplCqcpmDispo() ? '<button type="button" class="btn btn-outline-primary" data-mpl-act="aller" data-v="ce-qui-compte"><i class="bi bi-layers" aria-hidden="true"></i> Ouvrir « Ce qui compte pour moi »</button>' : '') +
      (_mplExplorerDispo() ? '<button type="button" class="btn btn-outline-primary" data-mpl-act="aller" data-v="' + _mplE(CMV_ROUTE) + '"><i class="bi bi-compass" aria-hidden="true"></i> Ouvrir « Explorer les métiers »</button>' : '') + '</div>';
  }
  var s = sources, prep = mplPreparable(etat, sources);
  var pasTxt = s.pas ? '« ' + _mplE(s.pas.action) + ' »' + (s.pas.qui.length ? ', avec l’aide de : ' + _mplE(s.pas.qui.map(function (x) { return x.charAt(0).toLowerCase() + x.slice(1); }).join(', ')) : '') + '. Il devient l’action de la première semaine.' : '';
  var papTxt = s.papier ? 'Ce qui revient dans vos cartes, tel que vous l’avez reçu' + (s.papier.date ? ' le ' + _mplE(mplDateCourte(s.papier.date)) : '') + '.' : '';
  var obst = q.obstacles.map(function (o, i) {
    return '<li><span class="num">' + (i + 1) + '</span><span>' + _mplE(o) + '</span><button type="button" class="btn btn-outline-secondary btn-sm" data-mpl-act="obst-retirer" data-v="' + i + '" aria-label="Retirer cette phrase"><i class="bi bi-x-lg" aria-hidden="true"></i></button></li>';
  }).join('');
  return '<p class="text-center" style="font-size:1.05rem">Votre plan reprend ce que vous avez déjà écrit. Vous n’avez que trois questions à compléter.</p>' +
    '<div class="cqcpm-bloc"><h2><span class="cqcpm-ico"><i class="bi bi-box-arrow-in-down" aria-hidden="true"></i></span> Ce que le plan reprend</h2><p class="cqcpm-note">Tout est coché d’avance ; décochez ce que vous ne voulez pas inclure.</p>' +
      _mplLigneSource(etat, sources, 'pas', 'Mon prochain petit pas', pasTxt, _mplCqcpmDispo() ? 'Pas encore fait. Le plan marche sans lui ; vous pourrez le faire dans « Ce qui compte pour moi ».' : 'Pas encore fait. Le plan marche sans lui.') +
      _mplLigneSource(etat, sources, 'papier', 'Mon papier « Ce qui revient dans mes cartes »', papTxt, 'Pas encore reçu dans « Ce qui compte pour moi ». Le plan marche sans lui.') +
      _mplLigneSource(etat, sources, 'metiers', 'Les métiers que je retiens (Ma synthèse)', s.metiers.map(_mplE).join(' ; ') + '.', 'Pas encore de synthèse gardée dans « Explorer les métiers ». Le plan marche sans elle.') +
    '</div>' +
    '<div class="cqcpm-bloc"><h2><span class="cqcpm-ico"><i class="bi bi-pencil" aria-hidden="true"></i></span> Trois questions</h2>' +
      '<div class="cqcpm-qb"><p class="cqcpm-q">Ce que je vise dans le travail, dans les mois qui viennent <span class="a">(une ou deux phrases, à compléter)</span></p>' +
        '<textarea class="form-control champ-bien-visible cqcpm-champ" id="mplVise" rows="2" maxlength="400" placeholder="Écrivez avec vos mots" aria-label="Ce que je vise dans le travail, dans les mois qui viennent">' + _mplE(q.vise) + '</textarea></div>' +
      '<div class="cqcpm-qb"><p class="cqcpm-q">Ce qui pourrait m’empêcher d’avancer <span class="a">(une à trois choses, à compléter)</span></p>' +
        (obst ? '<ul class="cqcpm-lignes">' + obst + '</ul>' : '') +
        (q.obstacles.length < MPL_MAX_OBSTACLES
          ? '<div class="cqcpm-ajout"><input type="text" class="form-control champ-bien-visible cqcpm-champ" id="mplObst" maxlength="200" placeholder="Écrivez une phrase, puis « Ajouter »" aria-label="Ce qui pourrait m’empêcher d’avancer"><button type="button" class="btn btn-outline-primary" data-mpl-act="obst-ajouter"><i class="bi bi-plus-lg" aria-hidden="true"></i> Ajouter</button></div>'
          : '<p class="cqcpm-note">Trois phrases au plus.</p>') +
        '<p class="cqcpm-note">Écrivez seulement ce que vous voulez bien voir dans le plan. Rien sur votre santé ou votre vie privée n’est demandé.</p></div>' +
      '<div class="cqcpm-qb"><p class="cqcpm-q">Le temps que je peux y consacrer chaque semaine</p><div class="cqcpm-rep" role="group" aria-label="Le temps que je peux y consacrer chaque semaine">' +
        MPL_TEMPS.map(function (t) { var on = q.temps === t.id; return '<button type="button" data-mpl-act="temps" data-v="' + t.id + '" aria-pressed="' + on + '"><i class="bi bi-check-lg coche" aria-hidden="true"></i> ' + _mplE(t.lib) + '</button>'; }).join('') + '</div>' +
        '<p class="cqcpm-note">Une action par semaine, deux, ou trois au plus selon votre choix.</p></div>' +
    '</div>' +
    _mplAide('bi-shield-check', '<b>Ce qui va se passer.</b> Ce qui est coché et vos trois réponses sont écrits dans une demande que vous copiez vous-même dans l’assistant en ligne de votre choix. Rien n’est envoyé par l’application. Ni votre nom, ni votre adresse, ni votre téléphone.') +
    '<div class="cqcpm-actions"><button type="button" class="btn btn-primary" id="mplBtnDemande"' + (prep.ok ? '' : ' disabled') + ' data-mpl-act="demande"><i class="bi bi-clipboard" aria-hidden="true"></i> Préparer la demande</button>' +
      '<button type="button" class="btn btn-outline-secondary" data-mpl-act="retour">Pas maintenant</button></div>' +
    '<p class="cqcpm-note" id="mplNotePreparer">' + _mplNotePreparer(prep) + '</p>';
}

/* ---------------- Le passage commun avec l'assistant ---------------- */
function _mplModele() { return (typeof promptsExternesCharges !== 'undefined' && promptsExternesCharges && promptsExternesCharges[MPL_PROMPT]) || ''; }
function _mplRecap(etat, sources) {
  var ids = mplSourcesRetenues(etat, sources), noms = { pas: '« Mon prochain petit pas »', papier: 'votre papier « Ce qui revient dans mes cartes »', metiers: 'les métiers que vous retenez' };
  var dem = mplDemande(_mplModele(), etat, sources);
  var h = _mplAide('bi-send-check', '<b>Ce qui va partir chez l’assistant</b> : vos trois réponses' + (ids.length ? ', ' + ids.map(function (id) { return noms[id]; }).join(', ') : '') + ', avec vos mots. Ni votre nom, ni votre adresse, ni votre téléphone. Ce qui n’est pas coché reste chez vous.');
  if (dem) {
    h += '<details class="bloc-depli"><summary>Relire la demande avant de l’envoyer</summary><div class="corps">' +
      '<textarea class="form-control" rows="12" readonly aria-label="La demande qui sera copiée pour l’assistant">' + _mplE(dem.texte) + '</textarea>' +
      '<p class="cqcpm-note mt-2 mb-0">Vous pouvez la lire, mais pas la modifier ici : pour changer ce qui part, revenez à la préparation.</p></div></details>';
  }
  return h;
}
var MPL_ETAPES = [
  { titre: 'Copie', detail: 'La demande est copiée automatiquement : ce que vous avez coché et vos trois réponses. Rien à écrire vous-même.' },
  { titre: 'Chez l’assistant', detail: 'Vous collez la demande et vous attendez sa réponse.' },
  { titre: 'Retour ici', detail: 'Vous copiez toute sa réponse et vous la collez dans cette page.' },
  { titre: 'Mon plan', detail: 'Vous lisez votre plan, vous pouvez cocher ce qui est fait et l’imprimer.' }
];
function _mplConfigPassage(etat) {
  var sources = mplSources();
  return {
    idSuffixe: 'MonPlan',
    rerendre: mplRendre,
    attrAssistant: 'data-assistant-monplan',
    idErreur: 'mplErreurChoixIA',
    nomSuivi: 'mon_plan',
    recapHtml: _mplRecap(etat, sources),
    etapes: MPL_ETAPES,
    texteConfidentialite: 'Seuls ce que vous avez coché et vos trois réponses partent chez l’assistant, avec vos mots : ni votre nom, ni votre adresse, ni votre téléphone.',
    avantEnvoi: function () {
      if (mplDemande(_mplModele(), etat, mplSources())) { return ''; }
      return _mplModele() ? 'Il manque ce que vous visez, ou une chose cochée : revenez à la préparation.' : 'Les consignes ne sont pas chargées pour le moment. Vérifiez votre connexion, rechargez la page puis réessayez.';
    },
    construireTexte: function () { var d = mplDemande(_mplModele(), etat, mplSources()); return d ? d.texte : ''; },
    module: { libelleSuite: 'Voir mon plan', quoi: 'L’assistant vient de préparer votre plan à partir de ce que vous avez écrit.', pourquoi: 'Vous découvrez quatre semaines de petites actions, à votre rythme.',
      verif: 'relisez chaque action : c’est une proposition faite à partir de vos mots, jamais une obligation. Vous pourrez le refaire si quelque chose ne vous convient pas.' },
    verifier: function (texte) { return mplAnalyserReponse(texte).ok; },
    importer: function (texte) {
      var r = mplAnalyserReponse(texte);
      if (!r.ok) { return { succes: false, coupe: r.raison === 'coupee', erreur: MPL_MESSAGES_ECHEC[r.raison] || MPL_MESSAGES_ECHEC.illisible }; }
      var joint = mplJoint(etat);
      if (!mplPoserPlan(etat, r.parties, mplSources(), mplDateDuJour())) { return { succes: false, erreur: 'Il manque ce que vous visez, ou une chose cochée : revenez à la préparation.' }; }
      if (joint) { mplJoindre(etat, true); }   // un plan refait reste joint si l'ancien l'était : le choix de la personne ne change pas
      return { succes: true };
    },
    apresSucces: function () { if (typeof trackEvenement === 'function') { trackEvenement('mon_plan_recu'); } mplAllerVue('plan'); }
  };
}

/* ---------------- Mon plan ---------------- */
function _mplFicheFrein(code, ouverte) {
  var f = mplFrein(code);
  if (!f || typeof regardExterieurRenduFicheFrein !== 'function') { return ''; }
  var corps = regardExterieurRenduFicheFrein(code, { sansDefinition: false });
  if (!corps) { return ''; }
  return '<details class="bloc-depli mt-2"' + (ouverte ? ' open' : '') + '><summary><span class="preparer-titre"><i class="bi bi-lightbulb" aria-hidden="true"></i> Se renseigner sur ce point : ' + _mplE(f.titre) + '</span></summary>' +
    '<div class="bloc-depli-corps cp-frein-fiche">' + corps + '</div></details>';
}
function _mplHtmlAvant(p) {
  return mplFreinsAvant(p).map(function (code) {
    var f = mplFrein(code);
    return '<div class="mpl-avant"><h2><span class="cqcpm-ico"><i class="bi bi-signpost" aria-hidden="true"></i></span> Avant votre plan : un point qui passe en premier</h2>' +
      '<p>Une chose que vous avez écrite touche à ce point : « ' + _mplE(f.titre) + ' ». Il compte plus que tout le reste : il est normal de s’en occuper d’abord. Le plan reste là, il attendra.</p>' +
      _mplFicheFrein(code, true) + '</div>';
  }).join('');
}
function _mplHtmlPlan() {
  var etat = mplEtat(), p = mplPlan(etat), sources = mplSources();
  if (!p) { return '<div class="cqcpm-vide"><p>Vous n’avez pas encore de plan.</p><button type="button" class="btn btn-primary" data-mpl-act="refaire">Préparer mon plan</button></div>'; }
  var noms = { pas: '« Mon prochain petit pas »', papier: 'votre papier', metiers: 'les métiers que vous retenez' };
  var avant = mplFreinsAvant(p);
  var h = (mplPlanAChange(etat, sources) ? _mplAlerte('Depuis ce plan, vous avez changé une réponse qu’il reprenait. Vous pouvez le garder tel quel, ou le refaire quand vous le souhaitez.') : '') +
    _mplHtmlAvant(p) +
    '<div class="cqcpm-papier mpl-plan"><div class="entete"><span class="cqcpm-ico"><i class="bi ' + MPL_ICONE + '" aria-hidden="true"></i></span><div><h2>' + _mplE(MPL_TITRE) + '</h2>' +
    '<span class="cqcpm-note">' + (p.date ? 'Préparé le ' + _mplE(mplDateCourte(p.date)) + ', à partir de ' : 'À partir de ') + (p.sources.length ? p.sources.map(function (id) { return noms[id]; }).join(', ') + ' et de vos trois réponses' : 'vos trois réponses') + '. Cochez ce qui est fait, quand vous voulez : rien n’est compté.</span></div></div>';
  if (p.rappel) { h += '<h3><i class="bi bi-chat-square-quote" aria-hidden="true"></i> Ce que vous avez indiqué</h3><p>' + _mplE(p.rappel) + '</p>'; }
  if (p.priorites.length) { h += '<h3><i class="bi bi-list-ol" aria-hidden="true"></i> Mes priorités</h3><ol>' + p.priorites.map(function (x) { return '<li>' + _mplE(x) + '</li>'; }).join('') + '</ol>'; }
  h += '<h3><i class="bi bi-calendar3" aria-hidden="true"></i> Mes quatre semaines</h3>';
  p.semaines.forEach(function (s, i) {
    h += '<div class="mpl-semaine"><h4><i class="bi bi-calendar-week" aria-hidden="true"></i> Semaine ' + (i + 1) + '</h4>' +
      (s.actions.length ? s.actions.map(function (a, j) {
        var fait = mplEstFait(etat, i, j);
        return '<label class="mpl-action' + (fait ? ' fait' : '') + '"><input type="checkbox" data-mpl-act="fait" data-s="' + i + '" data-a="' + j + '"' + (fait ? ' checked' : '') + '>' +
          '<span class="txt">' + _mplE(a.texte) + (a.origine === 'pas' ? ' <span class="mpl-origine">' + _mplE(MPL_ORIGINE_PAS) + '</span>' : '') + '</span></label>';
      }).join('') : '<p class="cqcpm-note mb-0">Une semaine plus légère : rien de prévu.</p>') + '</div>';
  });
  if (p.obstacles.length) {
    h += '<h3><i class="bi bi-signpost-split" aria-hidden="true"></i> Si quelque chose me freine</h3>' + p.obstacles.map(function (o) {
      var vital = avant.indexOf(o.frein) !== -1;
      return '<div class="mpl-si"><p><span class="si">Si</span> ' + _mplE(o.si) + ', <span class="si">alors</span> ' + _mplE(o.alors) + '.</p>' +
        (vital ? '<p class="cqcpm-note mb-0">Les adresses utiles sont en haut de la page.</p>' : _mplFicheFrein(o.frein, false)) + '</div>';
    }).join('');
  }
  h += '<h3><i class="bi bi-arrow-repeat" aria-hidden="true"></i> Mon point de la semaine</h3><p>Une fois par semaine, quand vous voulez, relisez ces questions pour vous-même :</p><ul>' +
    MPL_POINT_SEMAINE.map(function (q) { return '<li>' + _mplE(q) + '</li>'; }).join('') + '</ul>';
  if (p.parler.length) {
    h += '<h3><i class="bi bi-chat-dots" aria-hidden="true"></i> Ce dont j’aimerais parler avec la personne qui m’accompagne</h3><p class="cqcpm-note">Si vous le souhaitez, à votre prochain rendez-vous.</p><ul>' +
      p.parler.map(function (x) { return '<li>' + _mplE(x.texte) + (x.origine === 'pas' ? ' <span class="mpl-origine">' + _mplE(MPL_ORIGINE_PARLER) + '</span>' : '') + '</li>'; }).join('') + '</ul>';
  }
  h += '<p class="prudence">' + _mplE(MPL_PRUDENCE_ECRAN) + '</p></div>';
  // « Ma synthèse » : ici on en PARLE seulement ; le plan se joint ou se retire dans « Ma synthèse » (même règle que le papier, décision du 23/11/2026).
  if (_mplExplorerDispo()) {
    var j = mplJoint(etat);
    h += '<div class="cqcpm-joint' + (j ? ' oui' : '') + '"><i class="bi bi-link-45deg" aria-hidden="true"></i><div><b>' + (j ? 'Ce plan est joint à « Ma synthèse ».' : 'Ce plan peut figurer sur la feuille de « Ma synthèse »') + '</b>' +
      '<span>' + (j ? 'Il figure sur la feuille imprimée de « Ma synthèse ». Pour le retirer, ouvrez « Ma synthèse » dans « Explorer les métiers » : c’est là que vous décidez.'
        : 'Dans « Explorer les métiers », à l’étape « Ma synthèse », vous pouvez joindre ce plan : il figurera sur la feuille imprimée. Il n’est jamais envoyé à l’assistant. C’est votre choix, jamais une obligation.') + '</span></div></div>';
  }
  h += (typeof htmlRappelSauvegarde === 'function' ? htmlRappelSauvegarde() : '') +
    '<div class="cqcpm-actions"><button type="button" class="btn btn-outline-primary" data-mpl-act="imprimer"><i class="bi bi-printer" aria-hidden="true"></i> Imprimer ou enregistrer en PDF</button>' +
    '<button type="button" class="btn btn-outline-secondary" data-mpl-act="refaire">Le refaire</button>' +
    '<button type="button" class="btn btn-outline-secondary" data-mpl-act="effacer"><i class="bi bi-trash" aria-hidden="true"></i> Effacer ce plan</button></div>' +
    _mplAide('bi-floppy', 'Ce plan part avec votre sauvegarde personnelle (la disquette), avec ce que vous avez coché. Il n’est jamais enregistré ailleurs. « Imprimer ou enregistrer en PDF » ouvre la fenêtre d’impression de votre appareil.');
  return h;
}

function mplImprimer() {
  var html = mplHtmlDocument(mplEtat(), typeof SYN_CSS_FEUILLE === 'string' ? SYN_CSS_FEUILLE : '');
  if (!html) { if (typeof afficherToast === 'function') { afficherToast('Rien à imprimer pour l’instant : vous n’avez pas de plan.', 5000); } return; }
  if (typeof ucpmImprimerDocument !== 'function') { if (typeof afficherToast === 'function') { afficherToast('L’impression n’est pas disponible pour le moment.', 5000); } return; }
  ucpmImprimerDocument('mon-plan', html);
  if (typeof trackEvenement === 'function') { trackEvenement('mon_plan_imprime'); }
}
function _mplConfirmerEffacer() {
  var faire = function () { mplEffacerPlan(mplEtat()); _mplUi.vue = 'preparer'; mplRendre(); };
  if (typeof confirmerAction === 'function') {
    confirmerAction('Effacer ce plan ?', 'Votre plan et ce que vous avez coché seront effacés, et le plan sera retiré de « Ma synthèse » s’il y était joint. Vos réponses aux trois questions restent. Vous pourrez en préparer un nouveau.', 'Effacer', 'btn-danger', faire, 'Garder mon plan');
  } else { faire(); }
}

/* ---------------- Clics et saisie ---------------- */
function _mplClic(ev) {
  var b = ev.target && ev.target.closest ? ev.target.closest('[data-mpl-act]') : null;
  if (!b || b.tagName === 'INPUT') { return; }   // les cases passent par « change »
  var act = b.getAttribute('data-mpl-act'), v = b.getAttribute('data-v'), etat = mplEtat();
  if (act === 'temps') { mplChoisirTemps(etat, v); mplRendre(); return; }
  if (act === 'obst-ajouter') { _mplAjouterObstacleSaisi(); return; }
  if (act === 'obst-retirer') { mplRetirerObstacle(etat, parseInt(v, 10)); mplRendre(); var c = document.getElementById('mplObst'); if (c) { c.focus(); } return; }
  if (act === 'demande') { if (!mplPreparable(etat, mplSources()).ok) { return; } ucpmPassageReinitialiser(etat, MPL_PASSAGE); mplAllerVue('assistant'); return; }
  if (act === 'retour') { mplRetourBarre(); return; }
  if (act === 'aller') { if (typeof naviguerVers === 'function') { naviguerVers(v); } return; }
  if (act === 'refaire') { mplAllerVue('preparer'); return; }
  if (act === 'imprimer') { mplImprimer(); return; }
  if (act === 'effacer') { _mplConfirmerEffacer(); return; }
}
function _mplChange(ev) {
  var c = ev.target;
  if (!c || !c.getAttribute) { return; }
  var act = c.getAttribute('data-mpl-act'), etat = mplEtat();
  if (act === 'source') { mplCocherSource(etat, c.getAttribute('data-v'), c.checked); mplRendre(); _mplFocus('[data-mpl-act="source"][data-v="' + c.getAttribute('data-v') + '"]'); return; }
  if (act === 'fait') {
    var s = parseInt(c.getAttribute('data-s'), 10), a = parseInt(c.getAttribute('data-a'), 10);
    mplCocherFait(etat, s, a, c.checked); mplRendre(); _mplFocus('[data-mpl-act="fait"][data-s="' + s + '"][data-a="' + a + '"]');
  }
}
function _mplFocus(sel) { var x = document.querySelector(sel); if (x && x.focus) { x.focus(); } }
function _mplAjouterObstacleSaisi() {
  var c = document.getElementById('mplObst');
  if (!c) { return; }
  if (mplAjouterObstacle(mplEtat(), c.value)) { mplRendre(); _mplFocus('#mplObst'); } else { c.focus(); }
}
// La saisie de « ce que je vise » ne redessine pas la page (le curseur reste en place) : seuls le bouton et sa note suivent.
function _mplSaisie(ev) {
  if (!ev.target || ev.target.id !== 'mplVise') { return; }
  mplPoserVise(mplEtat(), ev.target.value);
  var prep = mplPreparable(mplEtat(), mplSources()), btn = document.getElementById('mplBtnDemande'), note = document.getElementById('mplNotePreparer');
  if (btn) { btn.disabled = !prep.ok; }
  if (note) { note.textContent = _mplNotePreparer(prep); }
}
function _mplTouche(ev) { if (ev.target && ev.target.id === 'mplObst' && ev.key === 'Enter') { ev.preventDefault(); _mplAjouterObstacleSaisi(); } }

/* ---------------- Historique du navigateur (même patron que les autres espaces) ---------------- */
function _mplSynchroniserHistorique() {
  if (typeof historiqueInterneSynchroniser !== 'function') { return; }
  historiqueInterneSynchroniser(MPL_ROUTE, { cle: _mplSessionHistorique + ':' + _mplUi.vue, vue: _mplUi.vue, session: _mplSessionHistorique });
}
function _mplRestaurerHistorique(instantane) {
  if (instantane.session !== _mplSessionHistorique) { return 'sauter'; }
  _mplUi.vue = instantane.vue;
}

/* ---------------- La page ---------------- */
function pageMonPlan() {
  if (!mplOuvert()) { if (typeof naviguerVers === 'function') { naviguerVers('cv'); } return; }
  mplRendre();
}
function mplRendre() {
  if (typeof historiqueInterneBrancher === 'function') { historiqueInterneBrancher(MPL_ROUTE, _mplRestaurerHistorique); }
  var ui = _mplUi, etat = mplEtat(), corps, sousTitre;
  if (ui.vue === 'plan' && !mplPlan(etat)) { ui.vue = 'preparer'; }
  if (ui.vue === 'assistant' && !mplPreparable(etat, mplSources()).ok) { ui.vue = 'preparer'; }
  if (ui.vue === 'plan') { corps = _mplHtmlPlan(); sousTitre = ''; }
  else if (ui.vue === 'assistant') { corps = ucpmPassageRendre(etat, MPL_PASSAGE, _mplConfigPassage(etat)); sousTitre = 'Avec l’assistant en ligne'; }
  else { corps = _mplHtmlPreparer(); sousTitre = 'Préparer mon plan'; }
  var scrollPrecedent = window.scrollY || 0;
  app.innerHTML =
    '<div class="page-catalogue-contenu cqcpm-page mpl-page" id="mplRacine">' +
    htmlTitreEtapeModule(MPL_ICONE, MPL_NOM, sousTitre) +
    '<div class="mb-2"><button type="button" class="btn btn-outline-secondary btn-sm" data-mpl-act="' + (ui.vue === 'assistant' ? 'refaire' : 'retour') + '"><i class="bi bi-arrow-left" aria-hidden="true"></i> ' + (ui.vue === 'assistant' ? 'Retour à la préparation' : _mplLibRetour()) + '</button></div>' +
    '<div id="mplCorps">' + corps + '</div></div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: 'mplRetourBarre()' }) + '</div>';
  _mplSynchroniserHistorique();
  var cle = ui.vue, nouvelle = cle !== _mplVueRendue;
  _mplVueRendue = cle;
  window.scrollTo(0, nouvelle ? 0 : scrollPrecedent);
  if (ui.vue === 'assistant') { ucpmPassageCabler(etat, MPL_PASSAGE, _mplConfigPassage(etat)); }
  var racine = document.getElementById('mplRacine');
  if (racine) { racine.addEventListener('click', _mplClic); racine.addEventListener('change', _mplChange); racine.addEventListener('input', _mplSaisie); racine.addEventListener('keydown', _mplTouche); }
  if (typeof trackEvenement === 'function') { trackEvenement('mon_plan_vue', { vue: ui.vue }); }
}
