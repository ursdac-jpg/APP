/* ============================================================
   Module « Explorer les métiers » : INTERPRÉTATION D'UN CHEMIN, ÉTAPE 2 : les questions au moment de la synthèse (consignes 543 et 548 ; maquette validée).
   Charge après interpretation.js (état, passages mis de côté) et interpretationLogique.js (regroupement, réponses : logique pure, testée sous Node).
   Fermé au public tant que INT_OUVERT est faux (intOuvert, interpretation.js).

   Trois choses :
   - le bloc « Quels résultats prendre en compte ? » de la page « Ma synthèse » : la personne coche les passages que l'assistant doit lire ; un passage décoché n'est pas envoyé ;
   - le bloc « Mes réponses aux questions » : le nombre de questions (doublons regroupés) et le bouton qui ouvre l'écran des questions ;
   - l'écran « synthese-questions » : une question à la fois (par défaut) ou toutes sur la page, réponses cliquables, « Je préfère ne pas répondre », « Écrire avec mes mots ».
   Les réponses sont gardées au fil de l'eau (en mémoire) et partent dans la demande de la synthèse (syntheseLectureLogique.js, section « RÉPONSES DE LA PERSONNE »),
   jamais le texte d'une interprétation. Ce sont des informations à lire, jamais des consignes.
   ============================================================ */

function _iqUI() {
  var s = synEtat();
  if (!s.questionsUI || typeof s.questionsUI !== 'object') { s.questionsUI = { mode: 'une', qi: 0, libre: {}, doublons: false }; }
  return s.questionsUI;
}
function _iqNomsTags(chemins) {
  return chemins.map(function (n) {
    var c = INT_CHEMINS.filter(function (x) { return x.n === n; })[0];
    return '<span class="cml-int-tag">Passage ' + n + ' : ' + cmvE(c ? c.nom : '') + '</span>';
  }).join('');
}

/* ---------- Les deux blocs de la page « Ma synthèse » ---------- */
function _iqBlocPrendreEnCompte(etat, interps, qs) {
  var cote = synPassagesMisDeCote(), nbFaits = 0, nbPris = 0;
  var h = '<div class="cml-bloc cml-bloc-synthese"><h2><i class="bi bi-ui-checks" aria-hidden="true"></i> Quels résultats prendre en compte ?</h2>' +
    '<p>Cochez les passages que l’assistant doit lire pour votre synthèse. Un passage mis de côté n’est pas envoyé à l’assistant. Rien n’est obligatoire.</p>';
  INT_CHEMINS.forEach(function (c) {
    var fait = synPassageFait(c.n, etat), interp = interps[c.cle], on = fait && cote.indexOf(c.n) === -1;
    if (fait) { nbFaits++; }
    if (on) { nbPris++; }
    var etatTxt = !fait ? _synPastilleEtat(false)
      : (interp ? _synPastilleEtat(true, 'Interprétation reçue') + ' <span class="cml-note">' + interp.questions.length + ' question' + (interp.questions.length > 1 ? 's' : '') + '</span>' : '<span class="cml-etat afaire">Pas d’interprétation</span>');
    var droite = !fait
      ? '<button type="button" class="btn btn-outline-primary btn-sm" data-cml="synChemin" data-chemin="' + c.cle + '"><i class="bi bi-arrow-right-circle" aria-hidden="true"></i> Faire ce passage</button>'
      : '<button type="button" class="cml-jt' + (on ? ' is-actif' : '') + '" data-cml="intCoche" data-n="' + c.n + '" aria-pressed="' + on + '"><i class="bi bi-check-lg" aria-hidden="true"></i> ' + (on ? 'Pris en compte' : 'Mis de côté') + '</button>';
    var suite = (fait && !interp)
      ? '<br><span class="cml-note">Sans interprétation, ce passage n’a pas de questions. Il est lu quand même avec ses résultats.</span> <button type="button" class="btn btn-outline-primary btn-sm" data-cml="intDemander" data-chemin="' + c.cle + '"><i class="bi bi-chat-square-quote" aria-hidden="true"></i> Faire son interprétation</button>'
      : '';
    h += '<div class="cml-int-ligne"><div><b><i class="bi ' + c.icone + '" aria-hidden="true"></i> ' + cmvE(c.nom) + '</b><br>' + etatTxt + suite + '</div><div>' + droite + '</div></div>';
  });
  if (nbFaits > 0 && nbPris === 0) { h += cmvEncart('bi-exclamation-circle', 'Aucun résultat n’est pris en compte : l’assistant n’aura rien à lire. Cochez au moins un passage pour préparer la demande.', true); }
  return h + '</div>';
}

function _iqBlocReponses(etat, interps, qs) {
  var rep = intNbRepondues(qs.uniques, intReponses()), n = qs.uniques.length;
  var h = '<div class="cml-bloc"><h2><i class="bi bi-patch-question" aria-hidden="true"></i> Mes réponses aux questions ' + (n ? _synPastilleEtat(rep > 0, rep + ' sur ' + n + ' répondues') : '') + '</h2>';
  if (!n) {
    return h + '<p class="mb-0">Cochez au moins un passage qui a une interprétation : ses questions apparaîtront ici.</p></div>';
  }
  var multi = qs.brut > n || qs.doublons > 0;
  h += '<p>' + (multi
    ? 'L’assistant a posé ' + qs.brut + ' questions. ' + (qs.doublons ? qs.doublons + ' se recoupent : elles ne sont posées qu’une fois. ' : '') + (qs.connues ? qs.connues + ' déjà répondue' + (qs.connues > 1 ? 's' : '') + ' dans « Ce que les tests ne disent pas ». ' : '') + 'Il vous reste <b>' + n + ' question' + (n > 1 ? 's' : '') + '</b>.'
    : 'L’assistant a préparé <b>' + n + ' question' + (n > 1 ? 's' : '') + '</b>.') +
    ' Répondre aide l’assistant à moins deviner. Rien n’est obligatoire.</p>' +
    '<div class="boutons-ligne"><button type="button" class="btn btn-primary" style="min-height:46px" data-cml="aller" data-vue="synthese-questions"><i class="bi bi-patch-question" aria-hidden="true"></i> ' + (rep ? 'Continuer mes réponses' : 'Répondre aux questions') + ' (' + n + ')</button></div></div>';
  return h;
}

// Insérés dans « Ma synthèse » avant le bloc qui prépare la demande. Vide tant que l'interprétation est fermée, ou quand aucun passage n'est fait.
function intBlocsSynthese(etat) {
  if (!intOuvert()) { return ''; }
  var faits = INT_CHEMINS.filter(function (c) { return synPassageFait(c.n, etat); });
  if (!faits.length) { return ''; }
  var interps = intInterpretationsParCle(), qs = intQuestionsPourSynthese(etat);
  var aUneInterp = Object.keys(interps).length > 0;
  return _iqBlocPrendreEnCompte(etat, interps, qs) + (aUneInterp ? _iqBlocReponses(etat, interps, qs) : '');
}

cmvEnregistrerAction('intCoche', function (el) {
  var n = parseInt(el.getAttribute('data-n'), 10);
  if (!INT_CHEMINS.some(function (c) { return c.n === n; })) { return false; }
  var x = _intExclus();
  if (x[n]) { delete x[n]; } else { x[n] = true; }
  return true;
});

/* ---------- L'écran des questions ---------- */
function _iqChips(q) {
  var cur = (intReponses()[q.cle] || {}).choix || [];
  var h = q.reponses.map(function (o) {
    var on = cur.indexOf(o) !== -1;
    return '<button type="button" class="cml-jt' + (on ? ' is-actif' : '') + '" data-cml="intRep" data-cle="' + cmvE(q.cle) + '" data-val="' + cmvE(o) + '" aria-pressed="' + on + '"><i class="bi bi-check-lg" aria-hidden="true"></i> ' + cmvE(o) + '</button>';
  }).join('');
  var non = cur.indexOf(INT_NON) !== -1;
  return h + '<button type="button" class="cml-jt' + (non ? ' is-actif' : '') + '" data-cml="intRep" data-cle="' + cmvE(q.cle) + '" data-val="' + INT_NON + '" aria-pressed="' + non + '"><i class="bi bi-check-lg" aria-hidden="true"></i> Je préfère ne pas répondre</button>';
}
function _iqCarte(q, i) {
  var r = intReponses()[q.cle] || {}, libre = r.libre || '', ouvert = !!_iqUI().libre[q.cle] || !!libre.trim();
  return '<div class="cml-int-question"><p class="qt">' + (i + 1) + '. ' + cmvE(q.texte) + '</p>' +
    '<div>' + _iqNomsTags(q.chemins) + (q.plusieurs ? '<span class="cml-int-tag">Plusieurs réponses possibles</span>' : '') + '</div>' +
    '<div class="cml-aff-chips" role="group" aria-label="' + cmvE(q.texte) + '">' + _iqChips(q) + '</div>' +
    (ouvert
      ? '<label class="cml-note mt-2 d-block" for="intLibre' + i + '">Dans mes mots, à compléter si vous le souhaitez</label><textarea id="intLibre' + i + '" class="form-control" rows="2" maxlength="' + INT_MAX_LIBRE + '" data-int-libre="' + cmvE(q.cle) + '" placeholder="Écrivez ici si les réponses proposées ne vous correspondent pas">' + cmvE(libre) + '</textarea>'
      : '<button type="button" class="btn btn-outline-secondary btn-sm mt-2" data-cml="intLibre" data-cle="' + cmvE(q.cle) + '"><i class="bi bi-pencil" aria-hidden="true"></i> Écrire avec mes mots</button>') + '</div>';
}

function _iqHtmlQuestions(etat) {
  var qs = intQuestionsPourSynthese(etat), n = qs.uniques.length, ui = _iqUI();
  if (!n) {
    return cmvEncart('bi-info-circle', 'Aucune question pour l’instant : cochez un passage qui a une interprétation, dans « Ma synthèse ».') +
      '<div class="boutons-ligne"><button type="button" class="btn btn-outline-primary" data-cml="aller" data-vue="synthese">Retour à ma synthèse</button></div>';
  }
  var rep = intNbRepondues(qs.uniques, intReponses()), cheminsActifs = {};
  qs.uniques.forEach(function (q) { q.chemins.forEach(function (c) { cheminsActifs[c] = true; }); });
  var nbChemins = Object.keys(cheminsActifs).length;
  var h = '<div class="cml-bloc"><h2><i class="bi bi-patch-question" aria-hidden="true"></i> ' + n + ' question' + (n > 1 ? 's' : '') + ' <span id="intCompteur" class="cml-etat ' + (rep ? 'fait' : 'afaire') + '">' + (rep ? rep + ' sur ' + n + ' répondues' : 'Pas encore fait') + '</span></h2>' +
    '<p>Ces questions viennent de l’assistant, à partir de vos résultats' + (nbChemins > 1 ? ' (' + nbChemins + ' passages)' : '') + '. Cliquez ce qui vous correspond, ou écrivez avec vos mots. Vous pouvez aussi passer une question.</p>';
  if (qs.doublons > 0 || qs.connues > 0) {
    h += '<p class="cml-note mb-1">' + qs.brut + ' questions posées' + (qs.doublons ? ', ' + qs.doublons + ' se recoupent' : '') + (qs.connues ? ', ' + qs.connues + ' déjà répondue' + (qs.connues > 1 ? 's' : '') + ' dans « Ce que les tests ne disent pas »' : '') + ' : il en reste ' + n + '.' +
      (qs.doublons ? ' <button type="button" class="btn btn-outline-secondary btn-sm" data-cml="intDoublons">' + (ui.doublons ? 'Masquer' : 'Voir') + ' comment elles ont été regroupées</button>' : '') + '</p>';
    if (ui.doublons) {
      var reg = qs.uniques.filter(function (q) { return q.chemins.length > 1; });
      h += '<div class="cml-int-regroupe mb-2"><b>Questions regroupées</b>' + reg.map(function (q) { return '<p>' + cmvE(q.texte) + '<br><span class="cml-note">Posée dans : ' + cmvE(intNomsPassages(q.chemins)) + '</span></p>'; }).join('') + '</div>';
    }
  }
  h += '<div class="cml-aff-chips mb-2" role="group" aria-label="Présentation des questions">' +
    '<button type="button" class="cml-jt' + (ui.mode === 'une' ? ' is-actif' : '') + '" data-cml="intMode" data-val="une" aria-pressed="' + (ui.mode === 'une') + '"><i class="bi bi-check-lg" aria-hidden="true"></i> Une question à la fois</button>' +
    '<button type="button" class="cml-jt' + (ui.mode === 'toutes' ? ' is-actif' : '') + '" data-cml="intMode" data-val="toutes" aria-pressed="' + (ui.mode === 'toutes') + '"><i class="bi bi-check-lg" aria-hidden="true"></i> Toutes sur la page</button></div>';
  h += cmvEncart('bi-shield-exclamation', 'N’écrivez ni nom, ni adresse, ni information de santé. Vos réponses feront partie de la demande, que vous pourrez relire avant de la copier. Les mots que vous écrivez ne sont jamais gardés dans la disquette.', true);
  if (ui.mode === 'une') {
    var i = Math.max(0, Math.min(ui.qi, n - 1)), dernier = i === n - 1;
    ui.qi = i;
    h += '<p class="cml-note mb-1 mt-2">Question ' + (i + 1) + ' sur ' + n + '</p>' +
      '<div class="progress mb-2" role="progressbar" aria-label="Avancement des questions" aria-valuemin="0" aria-valuemax="' + n + '" aria-valuenow="' + (i + 1) + '" style="height:8px"><div class="progress-bar" style="width:' + Math.round((i + 1) * 100 / n) + '%"></div></div>' +
      _iqCarte(qs.uniques[i], i) +
      '<div class="boutons-ligne mt-2">' + (i > 0 ? '<button type="button" class="btn btn-outline-secondary" style="min-height:46px" data-cml="intQi" data-val="-1"><i class="bi bi-arrow-left" aria-hidden="true"></i> Précédente</button>' : '') +
      (dernier ? '<button type="button" class="btn btn-primary" style="min-height:46px" data-cml="aller" data-vue="synthese"><i class="bi bi-check2-circle" aria-hidden="true"></i> Terminer et revenir à ma synthèse</button>'
        : '<button type="button" class="btn btn-primary" style="min-height:46px" data-cml="intQi" data-val="1">Suivante <i class="bi bi-arrow-right" aria-hidden="true"></i></button>') +
      '</div><p class="cml-note mt-2 mb-0">Vous pouvez passer une question sans répondre : « Suivante » suffit. Vos réponses sont gardées au fil de l’eau.</p>';
  } else {
    qs.uniques.forEach(function (q, k) { h += _iqCarte(q, k); });
    h += '<div class="boutons-ligne mt-2"><button type="button" class="btn btn-primary" style="min-height:46px" data-cml="aller" data-vue="synthese"><i class="bi bi-check2-circle" aria-hidden="true"></i> Terminer et revenir à ma synthèse</button>' +
      '<button type="button" class="btn btn-outline-secondary" data-cml="intRaz"' + (rep ? '' : ' disabled') + '>Effacer mes réponses</button></div>';
  }
  return h + '</div>';
}

function _iqQuestionDeCle(etat, cle) {
  return intQuestionsPourSynthese(etat).uniques.filter(function (q) { return q.cle === cle; })[0] || null;
}
cmvEnregistrerAction('intRep', function (el, etat) {
  var cle = el.getAttribute('data-cle'), q = _iqQuestionDeCle(etat, cle);
  if (!q) { return false; }
  intReponses()[cle] = intBasculerReponse(intReponses()[cle], q, el.getAttribute('data-val'));
  return true;
});
cmvEnregistrerAction('intLibre', function (el) { _iqUI().libre[el.getAttribute('data-cle')] = true; return true; });
cmvEnregistrerAction('intMode', function (el) { var v = el.getAttribute('data-val'); _iqUI().mode = v === 'toutes' ? 'toutes' : 'une'; return true; });
cmvEnregistrerAction('intQi', function (el) { var ui = _iqUI(); ui.qi = Math.max(0, ui.qi + (parseInt(el.getAttribute('data-val'), 10) || 0)); window.scrollTo(0, 0); return true; });
cmvEnregistrerAction('intDoublons', function () { var ui = _iqUI(); ui.doublons = !ui.doublons; return true; });
cmvEnregistrerAction('intRaz', function (el, etat) {
  var x = intReponses();
  intQuestionsPourSynthese(etat).uniques.forEach(function (q) { delete x[q.cle]; });
  _iqUI().libre = {};
  return true;
});

cmvEnregistrerVue('synthese-questions', {
  titre: 'Mes réponses aux questions',
  barre: function () { return { retour: 'synthese' }; },
  rendre: function (etat) {
    if (!intOuvert()) { return '<div class="cml-invite"><i class="bi bi-lightbulb" aria-hidden="true"></i><div><p class="mb-1">Cette page n’est pas encore ouverte.</p><button type="button" class="btn btn-primary" data-cml="aller" data-vue="accueil">Retourner à l’accueil</button></div></div>'; }
    return _iqHtmlQuestions(etat);
  },
  // Les mots écrits se gardent au fil de la frappe, sans redessiner la page (le curseur ne saute pas) ; seul le compteur est mis à jour.
  cabler: function (etat) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-int-libre]'), function (t) {
      t.addEventListener('input', function () {
        var cle = t.getAttribute('data-int-libre'), cur = intReponses()[cle] || { choix: [], libre: '' };
        intReponses()[cle] = { choix: cur.choix || [], libre: String(t.value || '').slice(0, INT_MAX_LIBRE) };
        var qs = intQuestionsPourSynthese(etat), n = qs.uniques.length, rep = intNbRepondues(qs.uniques, intReponses()), c = document.getElementById('intCompteur');
        if (c) { c.className = 'cml-etat ' + (rep ? 'fait' : 'afaire'); c.textContent = rep ? rep + ' sur ' + n + ' répondues' : 'Pas encore fait'; }
      });
    });
  }
});
