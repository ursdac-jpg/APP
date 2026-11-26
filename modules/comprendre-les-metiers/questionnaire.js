/* ============================================================
   Module « Explorer les métiers » : entrée 3, le questionnaire « Découvrir mes préférences de métier ».
   Charge après index.js (vues et gestes enregistrés auprès de lui). Calcul : logique.js (cmq*), textes : docs/TEXTES_OUVERTURE_QUESTIONNAIRE_RIASEC_2026-11-16.md
   et docs/REGLE_DE_CALCUL_RIASEC_2026-11-16.md (validés par Denis le 16/11/2026).

   Règles tenues ici :
   - tout ou rien : aucun résultat avant la fin de la partie 4 (ou de son passage), aucun résultat en cours de route, jamais une lettre pendant les réponses ;
   - les réponses ne vivent qu'en mémoire de la page ; elles sont effacées dès que le résultat est calculé ; seul le résultat peut être gardé (disquette) ;
   - une seule fenêtre : l'avertissement quand on quitte en cours (cmvGardeSortie, index.js) ;
   - jamais de minuteur, jamais de note : les pourcentages sont des places occupées dans les choix, pas des notes.
   ============================================================ */

var CMQV_PAR_PAGE = 10;

var CMQV_PARTIES = {
  1: {
    cle: 'p1', titre: 'Partie 1 sur 4 : ce qui vous plairait de faire', court: 'ce qui vous plairait de faire', nom: 'Activité',
    consigne: ['Imaginez que vous n’avez aucune contrainte : ni argent, ni diplôme, ni distance. Pour chaque activité, dites si elle vous plairait.',
      'Si vous ne l’avez jamais essayée, « Je ne sais pas » est une bonne réponse.'],
    bouton: 'Commencer la partie 1', prefixe: 'Ça me plairait de : '
  },
  2: {
    cle: 'p2', titre: 'Partie 2 sur 4 : les domaines de métiers', court: 'les domaines de métiers', nom: 'Domaine',
    consigne: ['Chaque ligne décrit un domaine de métiers, avec quelques exemples. Ces exemples vont du métier accessible sans diplôme à celui qui demande de longues études.',
      'Pensez à l’activité, pas au niveau d’études ni à votre âge. Dites seulement si cette façon de travailler vous attire.',
      'Ce ne sont pas des métiers à choisir : c’est pour voir vers quoi vous avez envie d’aller.'],
    bouton: 'Commencer la partie 2', prefixe: 'Ça me plairait de : '
  },
  3: {
    cle: 'p3', titre: 'Partie 3 sur 4 : où vous en êtes aujourd’hui', court: 'où vous en êtes aujourd’hui', nom: 'Point',
    consigne: ['Pour chaque point, dites où vous en êtes aujourd’hui.',
      'Pensez à toute votre vie : à la maison, avec des amis, en association, en stage ou au travail. Tout compte, même ce que vous avez appris sans diplôme.',
      '« Pas encore » ne veut pas dire « jamais » : cela veut seulement dire que vous n’y êtes pas encore.'],
    bouton: 'Commencer la partie 3', prefixe: 'Où en êtes-vous pour : ', suffixe: ' ?'
  },
  4: {
    cle: 'p4', titre: 'Partie 4 sur 4 : votre façon d’être', court: 'votre façon d’être', nom: 'Phrase',
    consigne: ['Cette dernière partie est à compléter : vous pouvez aussi la passer, et votre résultat sera calculé avec les trois autres.',
      'Pour chaque phrase, dites si elle vous ressemble en général. Il n’y a ni qualité ni défaut : chacun est différent.'],
    bouton: 'Commencer la partie 4', prefixe: ''
  }
};

function _cmqvPartie(n) { return CMQV_PARTIES[n]; }
function _cmqvEnoncesOrdonnes(etat, n) {
  var cle = 'p' + n, ordre = etat.q.ordre[cle], parId = {};
  cmqEnonces(cle).forEach(function (e) { parId[e.id] = e; });
  return ordre.map(function (id) { return parId[id]; });
}
function _cmqvNbPages(n) { return Math.ceil(cmqEnonces('p' + n).length / CMQV_PAR_PAGE); }

function _cmqvDemarrer(etat) {
  var q = etat.q;
  if (q.ordre) { return; }
  q.graine = Math.floor(Math.random() * 4294967295) + 1;
  q.ordre = { p1: cmqOrdreMelange('p1', q.graine), p2: cmqOrdreMelange('p2', q.graine + 1), p3: cmqOrdreMelange('p3', q.graine + 2), p4: cmqOrdreMelange('p4', q.graine + 3) };
}
function _cmqvEffacer(etat) {
  etat.q = cmvEtatInitial().q;
  etat.q.ordre = null;
}

function _cmqvDateDuJour() {
  var d = new Date();
  return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();
}

// ---------------- Présentation du chemin « Répondre à un questionnaire » (19/11/2026) : le corps de la page de présentation (index.js, route comprendre-les-metiers-intro-q) ----------------
// Le RIASEC, déplacé ici depuis la présentation générale (décision de Denis, 18/11/2026) : les mots sont ceux déjà validés le 16/11/2026.
function cmvCorpsPresentationQuestionnaire() {
  var six = CML_LETTRES.map(function (l) { return [l, CMV_NOMS_LETTRES[l], TEXTES_LETTRES_RIASEC[l].court]; });
  return _introBlocSection('&#11042; Six façons de travailler',
      '<div class="cml-hex-zone"><div>' + cmvHexagone(null, true) + '</div><div>' +
      '<p>Ce questionnaire vous aide à voir quels univers de métiers vous attirent. Il repose sur le modèle du psychologue John Holland, qui range les métiers en six types, selon l’activité qui y tient le plus de place.</p>' +
      '<p class="cml-note mb-0">Les types opposés sont face à face sur l’hexagone : réaliste et social, investigateur et entreprenant, artistique et conventionnel. Une même personne les aime rarement tous les deux au même degré.</p></div></div>') +
    _introBlocEncart('&#127970;', CMV_TEXTE_ORIGINE + ' Les lettres du résultat sont celles que France Travail a données à chaque métier de son répertoire.') +
    _introBlocSection('&#128203; Comment ça se passe', '<ol class="mb-0">' +
      '<li><b>Quatre parties</b> : des activités, des métiers, ce que vous savez faire aujourd’hui, votre façon d’être.</li>' +
      '<li>Il n’y a pas de bonne ou de mauvaise réponse. Ce n’est pas un examen. Il y a <b>' + cmvNombreQuestions() + ' questions</b> : c’est beaucoup, parce que plus vos réponses sont nombreuses, plus les métiers qui vous sont proposés vous correspondent. Prévoyez le temps qu’il faut, dans un endroit calme.</li>' +
      '<li>Les quatre parties se font d’une traite : si vous quittez avant la fin, vos réponses ne sont pas gardées, et vous reprendrez au début.</li>' +
      '<li>Votre résultat n’apparaît qu’à la fin, pour qu’il ne change pas vos réponses en cours de route.</li></ol>') +
    _introBlocSection('&#128683; Ce que ce questionnaire n’est pas',
      '<p class="mb-0">Ce n’est pas un test de capacités, ni un verdict, ni une étiquette. Ce que vous répondez décrit vos goûts d’aujourd’hui : ils peuvent changer avec l’expérience.</p>') +
    '<div class="cv-section" style="margin-bottom:0.9rem;"><h4>&#128288; Le RIASEC, le modèle du questionnaire</h4>' +
      '<p>Le RIASEC est une façon de décrire un métier selon l’activité qui y tient le plus de place. Il y a six types, et chaque lettre est l’initiale d’un type :</p>' +
      '<div class="cml-six">' + six.map(function (x) { return '<div>' + cmvPastille(x[0]) + '<span><b>' + x[1] + '</b> : ' + x[2] + '</span></div>'; }).join('') + '</div>' +
      '<p class="mt-2">France Travail donne à chaque métier de son répertoire une ou deux de ces lettres.</p>' +
      '<p class="cml-note">Les six types en détail : ouvrez un type pour le découvrir. Rien à retenir par cœur, ce sont des repères.</p>' + cmvFichesLettres(CML_LETTRES, false) + '</div>' +
    _introBlocEncart('&#128737;&#65039;', 'Vos réponses restent sur cet appareil : personne ne les reçoit. Seul votre résultat peut être gardé, dans la disquette, si vous le décidez.');
}
// Début direct du questionnaire (premier bouton de la carte, « Commencer » de la présentation, « Refaire le questionnaire ») : prépare l'ordre des questions puis ouvre la partie 1.
function cmqvCommencer(etat) { _cmqvDemarrer(etat); etat.q.partie = 1; etat.vue = 'q-avant'; }

// ---------------- Avant de commencer (maquette validée le 18/11/2026) : trois rassurances, les quatre parties avec leur nombre réel d'énoncés, l'avertissement des 300 questions. Aucune durée annoncée. ----------------
var CMQV_NOMS_PLURIEL = { p1: 'activités', p2: 'domaines', p3: 'points', p4: 'phrases' };
function _cmqvMaj1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
cmvEnregistrerVue('q-avant', {
  titre: 'Avant de commencer',
  barre: function (etat) {
    return {
      retour: function () { cmvAller('accueil'); },
      suivant: { libelle: CMQV_PARTIES[1].bouton + ' &#8594;', libelleExact: true, action: function () { etat.q.partie = 1; etat.vue = 'q-ouverture'; cmvRendre(); } }
    };
  },
  rendre: function () {
    var rassure = [
      ['bi-signpost-split', 'Ni bonne ni mauvaise réponse', 'Vos réponses disent vos goûts, pas votre valeur.'],
      ['bi-skip-forward', 'Aucune réponse n’est obligatoire', 'Si vous ne savez pas, laissez la ligne vide et continuez.'],
      ['bi-pause-circle', 'Pas de minuteur', 'Prenez le temps qu’il faut.']
    ];
    var nombres = CMQ_PARTIES.map(function (cle) { return cmqEnonces(cle).length; });
    return '<div class="cml-rassure">' + rassure.map(function (r) {
        return '<div class="r"><span class="ico"><i class="bi ' + r[0] + '" aria-hidden="true"></i></span><div><b>' + r[1] + '</b><span class="t">' + r[2] + '</span></div></div>';
      }).join('') + '</div>' +
      '<div class="cml-bloc"><h2>Les quatre parties</h2><div class="cml-parties">' + [1, 2, 3, 4].map(function (n) {
        var P = _cmqvPartie(n);
        return '<div class="cml-partie-t"><span class="cml-num">' + n + '</span><div><b>' + cmvE(_cmqvMaj1(P.court)) + '</b><span class="t">' + nombres[n - 1] + ' ' + CMQV_NOMS_PLURIEL[P.cle] + (n === 4 ? ' · à compléter, vous pouvez la passer' : '') + '</span></div></div>';
      }).join('') + '</div><p class="cml-note mt-2 mb-0">' + nombres.join(' + ') + ' : ' + cmvNombreQuestions() + ' énoncés en tout, par pages de dix.</p></div>' +
      cmvEncart('bi-exclamation-triangle', 'Il y a <b>' + cmvNombreQuestions() + ' questions</b>, en quatre parties. Les quatre parties se font d’une traite : si vous quittez avant la fin, vos réponses ne sont pas gardées, et vous reprendrez au début. Votre résultat n’apparaît qu’à la fin.', true);
  }
});

// ---------------- Ouverture d'une partie ----------------
cmvEnregistrerVue('q-ouverture', {
  titre: function (etat) { return _cmqvPartie(etat.q.partie).titre; },
  barre: function (etat) {
    var n = etat.q.partie;
    return {
      retour: function () {
        if (n === 1) { etat.vue = 'q-avant'; cmvRendre(); return; }
        etat.q.partie = n - 1; etat.q.page['p' + (n - 1)] = _cmqvNbPages(n - 1) - 1; etat.vue = 'q-page'; cmvRendre();
      },
      suivant: { libelle: _cmqvPartie(n).bouton + ' &#8594;', libelleExact: true, action: function () { etat.q.page['p' + n] = 0; etat.vue = 'q-page'; cmvRendre(); } }
    };
  },
  rendre: function (etat) {
    var n = etat.q.partie, p = _cmqvPartie(n);
    var exemples = CMQ_REPONSES[p.cle].map(function (r) { return '<span class="cml-rep' + (r.id === 'nsp' ? ' nsp' : '') + '">' + r.libelle + '</span>'; }).join('');
    return cmvFilParties(CMV_FIL_C3, n - 1, null) +
      cmvBandeau(n, p.titre, cmqEnonces(p.cle).length + ' ' + (n === 2 ? 'lignes' : 'énoncés') + ', par pages de dix. Aucun minuteur : prenez le temps qu’il faut.') +
      '<div class="cml-bloc">' + p.consigne.map(function (t) { return '<p>' + t + '</p>'; }).join('') +
      cmvEncart('bi-signpost-split', '<b>Ni bonne ni mauvaise réponse.</b> Aucune réponse n’est obligatoire : laissez vide la ligne dont vous ne savez pas quoi dire.') +
      '<p class="mb-1"><b>Vous répondrez avec :</b></p><div class="cml-reps-exemple" aria-hidden="true">' + exemples + '</div></div>' +
      (n === 4 ? '<div class="cml-bloc"><p class="mb-2">Vous préférez ne pas répondre à cette partie ?</p><button type="button" class="btn btn-outline-secondary" data-cml="passer4"><i class="bi bi-skip-forward" aria-hidden="true"></i> Passer cette partie</button></div>' : '');
  }
});
cmvEnregistrerAction('passer4', function (el, etat) {
  etat.q.partie4Passee = true; etat.q.p4 = {}; etat.vue = 'q-fin';
});

// ---------------- Une page de dix énoncés ----------------
function _cmqvReponsesPage(etat, n) {
  var cle = 'p' + n, p = etat.q.page[cle] || 0;
  return _cmqvEnoncesOrdonnes(etat, n).slice(p * CMQV_PAR_PAGE, (p + 1) * CMQV_PAR_PAGE);
}
cmvEnregistrerVue('q-page', {
  titre: function (etat) { return _cmqvPartie(etat.q.partie).titre; },
  barre: function (etat) {
    var n = etat.q.partie, cle = 'p' + n, p = etat.q.page[cle] || 0, derniere = p >= _cmqvNbPages(n) - 1;
    return {
      retour: function () { if (p > 0) { etat.q.page[cle] = p - 1; cmvRendre(); } else { etat.vue = 'q-ouverture'; cmvRendre(); } },
      suivant: {
        libelle: derniere ? 'Terminer la partie &#8594;' : 'Continuer &#8594;', libelleExact: derniere,
        action: function () { if (derniere) { etat.vue = 'q-fin'; } else { etat.q.page[cle] = p + 1; } cmvRendre(); }
      }
    };
  },
  rendre: function (etat) {
    var n = etat.q.partie, cle = 'p' + n, P = _cmqvPartie(n), p = etat.q.page[cle] || 0, total = cmqEnonces(cle).length;
    var enonces = _cmqvReponsesPage(etat, n), debut = p * CMQV_PAR_PAGE + 1, fin = debut + enonces.length - 1;
    var choix = CMQ_REPONSES[cle];
    var lignes = enonces.map(function (e, i) {
      var texte = cle === 'p2' ? e.ligne : e.texte, v = etat.q[cle][e.id] || '';
      var html = '';
      if (cle === 'p4') { html = '<span class="ex">Cette phrase vous ressemble-t-elle ?</span>' + cmvE(texte); }
      else { html = cmvE(P.prefixe + cmvMinuscule1(texte).replace(/[.]$/, '') + (P.suffixe || '')); }
      if (cle === 'p2' && e.exemples && e.exemples.length) { html += '<span class="ex">Par exemple : ' + cmvE(e.exemples.join(', ')) + '.</span>'; }
      var boutons = choix.map(function (c) {
        return '<button type="button" class="cml-rep' + (c.id === 'nsp' ? ' nsp' : '') + (v === c.id ? ' is-actif' : '') + '" data-cml="rep" data-id="' + cmvE(e.id) + '" data-rep="' + c.id + '" aria-pressed="' + (v === c.id) + '"><i class="bi bi-check-lg" aria-hidden="true"></i>' + c.libelle + '</button>';
      }).join('');
      var numero = p * CMQV_PAR_PAGE + i + 1;
      return '<div class="cml-q' + (v ? ' fait' : '') + '"><span class="cml-num" aria-label="' + P.nom + ' ' + numero + '">' + numero + '</span><div class="txt">' + html + '</div><div class="reps" role="group" aria-label="Votre réponse">' + boutons + '</div></div>';
    }).join('');
    var repondues = enonces.filter(function (e) { return !!etat.q[cle][e.id]; }).length, vides = enonces.length - repondues;
    var nsp = (cle === 'p1' || cle === 'p2') ? ' comme « Je ne sais pas »' : '';
    var segments = enonces.map(function (e) { return '<i' + (etat.q[cle][e.id] ? ' class="r"' : '') + '></i>'; }).join('');
    return cmvFilParties(CMV_FIL_C3, n - 1, null) +
      cmvBandeau(n, cmvE(_cmqvMaj1(P.court)), '', { petit: true }) +
      '<div class="cml-avancee"><span><b>Page ' + (p + 1) + ' sur ' + _cmqvNbPages(n) + '</b> · ' + P.nom + 's ' + debut + ' à ' + fin + ' sur ' + total + '</span><span>' + repondues + ' réponse' + (repondues > 1 ? 's' : '') + ' sur ' + enonces.length + '</span></div>' +
      '<div class="cml-segments" aria-hidden="true">' + segments + '</div>' +
      (p === 0
        ? cmvEncart('bi-signpost-split', '<b>Ni bonne ni mauvaise réponse.</b> ' + P.consigne[0] + ' Vous pouvez laisser une ligne vide.')
        : cmvEncart('bi-signpost-split', '<b>Ni bonne ni mauvaise réponse.</b> Vous pouvez laisser une ligne vide.')) +
      lignes +
      '<div class="cml-etat-page" role="status"><i class="bi ' + (vides ? 'bi-info-circle' : 'bi-check2-circle') + '" aria-hidden="true"></i> ' +
        (vides === 0 ? 'Toutes les lignes de cette page ont une réponse.'
          : vides + (vides > 1 ? ' lignes sans réponse. Elles comptent' : ' ligne sans réponse. Elle compte') + ' pour zéro point' + nsp + ' : aucun point n’est retiré. Vous pouvez y répondre, ou continuer.') + '</div>';
  }
});
// Un second clic sur la réponse choisie la retire : aucune réponse n'est obligatoire, la ligne peut redevenir vide.
cmvEnregistrerAction('rep', function (el, etat) {
  var n = etat.q.partie, cle = 'p' + n, id = el.getAttribute('data-id'), rep = el.getAttribute('data-rep');
  if (etat.q[cle][id] === rep) { delete etat.q[cle][id]; } else { etat.q[cle][id] = rep; }
});

// ---------------- Fin de partie : jamais de résultat ----------------
cmvEnregistrerVue('q-fin', {
  titre: function (etat) { return etat.q.partie === 4 ? 'Les quatre parties sont terminées' : 'Partie ' + etat.q.partie + ' terminée'; },
  barre: function (etat) {
    var n = etat.q.partie;
    return {
      retour: function () {
        if (n === 4 && etat.q.partie4Passee) { etat.q.partie4Passee = false; etat.vue = 'q-ouverture'; cmvRendre(); return; }
        etat.q.page['p' + n] = _cmqvNbPages(n) - 1; etat.vue = 'q-page'; cmvRendre();
      },
      suivant: n < 4
        ? { libelle: 'Partie suivante &#8594;', libelleExact: true, action: function () { etat.q.partie = n + 1; etat.vue = 'q-ouverture'; cmvRendre(); } }
        : { libelle: 'Voir mon résultat &#8594;', libelleExact: true, action: function () { cmqvCalculerResultat(etat); cmvRendre(); } }
    };
  },
  rendre: function (etat) {
    var n = etat.q.partie, reste = 4 - n;
    var mots = ['', 'trois', 'deux', 'une'];
    var phrase = n < 4
      ? 'Partie ' + n + ' terminée. Il en reste ' + mots[n] + '.'
      : (etat.q.partie4Passee ? 'Vous avez passé la dernière partie : votre résultat sera calculé avec les trois autres.' : 'Les quatre parties sont terminées. Merci d’avoir pris ce temps.');
    var passee = n === 4 && !!etat.q.partie4Passee, cle = 'p' + n, coup = '';
    if (!passee) {
      var total = cmqEnonces(cle).length, repondues = cmqNombreReponses(etat.q, cle), vides = total - repondues;
      var nsp = (cle === 'p1' || cle === 'p2') ? ', comme « Je ne sais pas »' : '';
      coup = '<div class="cml-bloc"><h3>Votre partie en un coup d’œil</h3><p class="mb-0">Vous avez répondu à <b>' + repondues + ' ' + CMQV_NOMS_PLURIEL[cle] + ' sur ' + total + '</b>.' +
        (vides ? (vides > 1 ? ' Les ' + vides + ' lignes laissées vides comptent' : ' La ligne laissée vide compte') + ' pour zéro point' + nsp + ' : aucun point n’est retiré, et vous pouvez les compléter en revenant en arrière.' : '') + '</p></div>';
    }
    return cmvFilParties(CMV_FIL_C3, n - 0.5, null, passee ? [3] : []) +
      cmvBandeau(0, phrase, n < 4 ? 'Votre résultat apparaîtra à la fin des quatre parties. Rien n’est montré avant, pour que vos réponses restent libres.' : 'Cliquez sur « Voir mon résultat » pour le découvrir.', { icone: 'bi-check-lg' }) +
      coup +
      (reste > 0 ? '<p class="cml-note">Si vous vous arrêtez ici, aucun résultat ne sera affiché ni gardé.</p>' : '');
  }
});

// Calcule le résultat, garde seulement ce résultat et efface les réponses de la page.
function cmqvCalculerResultat(etat) {
  var calcul = cmqCalculer(etat.q);
  etat.q = cmvEtatInitial().q;
  etat.q.ordre = null;
  etat.q.resultat = { calcul: calcul, date: _cmqvDateDuJour() };
  etat.q.terminee = true;
  etat.plusRes = false;
  etat.vue = 'resultat';
  if (typeof trackEvenement === 'function') { trackEvenement('comprendre_metiers_questionnaire_termine', { etat: calcul.etat }); }
}

// ---------------- Résultat ----------------
// classes (facultatif) : le classement visuel de « Ma synthèse » (synClasserLettres : fort, moyen, discret). Sans lui, les lettres du code sont mises en avant comme avant.
function _cmqvBarresHTML(calcul, classes) {
  var code = calcul.code || [];
  return CML_LETTRES.map(function (l) {
    var v = calcul.pourcentages[l], niveau = calcul.niveaux[l];
    return '<div class="cml-barre-l cml-ri-' + l + (classes ? ' ' + classes[l] + (classes[l] === 'fort' ? ' haut' : '') : (code.indexOf(l) >= 0 ? ' haut' : '')) + '">' + cmvPastille(l) +
      '<div class="piste" role="img" aria-label="' + CMV_NOMS_LETTRES[l] + ' : ' + v + ' pour cent. ' + cmqLibelleNiveau(niveau) + '"><span style="width:' + v + '%"></span></div>' +
      '<div class="nom">' + CMV_NOMS_LETTRES[l] + ' : <b>' + v + ' %</b> (' + cmqLibelleNiveau(niveau).replace(/^Une préférence /, '') + ')</div></div>';
  }).join('');
}

function cmvCartesMetiersLettres(lettres, etat) {
  var liste = cmlMetiersPourLettres(lettres);
  var vus = etat.plusRes ? liste : liste.slice(0, 6);
  var html = '<div class="metier-cartes-grille">' + vus.map(function (x) {
    var niv = x.niveau ? '<p class="cml-note mb-0"><i class="bi bi-mortarboard" aria-hidden="true"></i> Accès : ' + cmlLibelleNiveauAcces(x.niveau) + '</p>' : '';
    var lettresMetier = (x.lettres || '');
    return cmvCarteMetier(x.metier, '<div class="cml-let">' + cmvLettres(lettresMetier) + '</div>' + niv, { retenir: 3 });
  }).join('') + '</div>';
  if (!etat.plusRes && liste.length > 6) {
    html += '<div class="metier-voir-reste"><button type="button" class="btn btn-outline-primary" data-cml="plusRes"><i class="bi bi-chevron-down" aria-hidden="true"></i> Voir les ' + (liste.length - 6) + ' autres</button></div>';
  }
  return html;
}
// « Comment vos réponses ont été lues » (consigne 499) : une ligne par lettre du code. Comptages : cmlChoixLus3 (logique.js). Jamais un jugement : chaque lettre est un goût de travail.
function _cmqvBlocLu(lettres) {
  var lus = cmlChoixLus3(lettres);
  if (!lus) { return ''; }
  var rangs = ['première', 'deuxième', 'troisième'];
  var lignes = lus.lettres.slice(0, 3).map(function (x) {
    var court = (typeof TEXTES_LETTRES_RIASEC !== 'undefined' && TEXTES_LETTRES_RIASEC[x.l]) ? TEXTES_LETTRES_RIASEC[x.l].court : '';
    return cmvLigneLue(cmvPastille(x.l, true) + ' ' + rangs[x.rang - 1] + ' lettre', '',
      '<p><b>' + CMV_NOMS_LETTRES[x.l] + '</b>' + (court ? ' : ' + court : '') + '</p><p class="cml-note mb-0">' + cmvPluriel(x.nbMajeure, 'métier') + (x.nbMajeure > 1 ? ' ont' : ' a') + ' ' + x.l + ' comme lettre principale.</p>');
  }).join('');
  return cmvBlocChoixLus('Comment vos réponses ont été lues', 'Vos réponses au questionnaire donnent un code de trois lettres, de la plus marquée à la moins marquée. Chaque lettre est un goût de travail, pas un jugement. Les métiers sont proposés quand leurs lettres sont les vôtres.', lignes,
    cmvPluriel(lus.liste, 'métier') + ' sur ' + cmvNombre(lus.total) + (lus.liste > 1 ? ' ont' : ' a') + ' au moins une de vos lettres. Ceux qui ont vos lettres dans le même ordre passent en premier.');
}
cmvEnregistrerVue('resultat', {
  titre: 'Votre résultat',
  barre: function () { return { retour: 'accueil' }; },
  rendre: function (etat) {
    var r = etat.q.resultat;
    if (!r) { return '<p>Vous n’avez pas encore de résultat. <button type="button" class="btn btn-primary" data-cml="q-commencer">Commencer le questionnaire</button></p>'; }
    var c = r.calcul, code = c.code;
    var h = cmvFilParties(CMV_FIL_C3, -1, null, c.partie4Passee ? [3] : []) +
      (c.peuDeLignes ? '' : cmvEncart('bi-compass', 'Voici ce que vos réponses montrent <b>aujourd’hui</b> (questionnaire passé le ' + r.date + '). Ce n’est pas un diagnostic, ni une note : ce sont des directions qui vous attirent. Ce résultat peut changer, et vous pouvez le refaire plus tard. Tout le monde a un peu de chaque lettre.'));
    if (c.partie4Passee) { h += '<p class="cml-note">' + CMQ_TEXTES.sansPartie4 + '</p>'; }
    // Niveau du résultat (consigne 508) : selon la part des lignes répondues. Résultat gardé avant cette règle : nombre de lignes inconnu, aucun niveau.
    var niv = cmlInfoNiveauQuestionnaire(c.nbReponses, c.nbLignes);
    if (c.peuDeLignes) {
      // Trop de lignes laissées vides : aucune lettre, ni barres ni hexagone ni métiers (le code serait fragile).
      h += cmvBandeauQuestionnaire(niv) + cmvLegendeNiveauxQuestionnaire(niv);
    } else if (c.etat === 'peu_reponses') {
      h += cmvEncart('bi-info-circle', CMQ_TEXTES.peuReponses, true);
    } else {
      h += cmvBandeauQuestionnaire(niv);
      h += '<div class="cml-bloc"><h2>' + (code.length === 1 ? 'Votre lettre' : (code.length === 2 ? 'Vos deux lettres' : 'Vos trois lettres')) + '</h2><div style="display:flex;gap:.8rem 1.4rem;align-items:center;flex-wrap:wrap">' +
        code.map(function (l) { return '<div style="display:flex;gap:.5rem;align-items:center">' + cmvPastille(l, true) + '<b>' + CMV_NOMS_LETTRES[l] + '</b></div>'; }).join('') + '</div>' +
        (code.length < 3 ? '<p class="mt-2 mb-0">' + CMQ_TEXTES.sousSeuil + '</p>' : '') +
        (c.etat === 'reparties' ? '<p class="mt-2 mb-0">' + CMQ_TEXTES.reparties + '</p>' : '') +
        (c.procheFrontiere ? '<p class="mt-2 mb-0">' + CMQ_TEXTES.frontiere + '</p>' : '') + '</div>';
    }
    if (!c.peuDeLignes) {
      h += '<div class="cml-bloc"><div class="cml-hex-zone"><div>' + cmvHexagone(c.pourcentages, true) + '</div><div><h2>Vos réponses sur l’hexagone</h2>' +
        '<div role="group" aria-label="Vos six lettres">' + _cmqvBarresHTML(c) + '</div>' +
        '<p class="cml-note mt-2 mb-0">' + CMQ_TEXTES.explicationBarres + '</p></div></div></div>';
    }
    var axes = [c.axes && c.axes.personnes && c.axes.personnes.phrase, c.axes && c.axes.idees && c.axes.idees.phrase].filter(function (x) { return !!x; });
    if (axes.length && c.etat !== 'peu_reponses') {
      h += '<div class="cml-bloc"><h2>Votre orientation</h2>' + axes.map(function (t) { return '<p class="mb-1">' + t + '</p>'; }).join('') + '</div>';
    }
    if (code && c.etat !== 'peu_reponses') {
      h += (typeof _synLigneRetenu === 'function' ? _synLigneRetenu(3) : '') +
        '<div class="cml-bloc"><h2>Ce que veulent dire vos lettres</h2>' + cmvFichesLettres(code, true) + '</div>' +
        '<div class="cml-bloc"><h2>Des métiers qui partagent vos lettres</h2>' +
        cmvEncart('bi-building', 'France Travail donne à chaque métier de son répertoire une ou deux lettres. Ces métiers portent les vôtres : ce sont des pistes qui ressemblent à ce que vous aimez, pas une liste de métiers « faits pour vous ».') +
        cmvCartesMetiersLettres(c.lettresPourMetiers, etat) + '</div>' +
        _cmqvBlocLu(c.lettresPourMetiers) + cmvLegendeNiveauxQuestionnaire(niv) +
        (typeof intBloc === 'function' ? intBloc('q') : '');
    }
    h += cmvEncart('bi-people', 'Parler de ce résultat avec un conseiller ou un professionnel complète utilement cette exploration.') +
      '<div class="cml-bloc"><div style="display:flex;gap:.6rem;flex-wrap:wrap">' +
      (etat.q.garde
        ? '<button type="button" class="btn btn-outline-primary" style="min-height:46px" data-cml="garder-resultat"><i class="bi bi-x-circle" aria-hidden="true"></i> Ne plus garder mon résultat</button>'
        : '<button type="button" class="btn btn-outline-primary" style="min-height:46px" data-cml="garder-resultat"><i class="bi bi-save" aria-hidden="true"></i> Garder mon résultat</button>') +
      '<button type="button" class="btn btn-recommencer-module" style="min-height:46px" data-cml="refaire-q"><i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i> Refaire le questionnaire</button></div>' +
      (etat.q.garde ? cmvEncart('bi-check2-circle', '<b>Résultat gardé.</b> Il sera dans la disquette quand vous l’enregistrerez : seul le résultat est gardé, jamais vos réponses.') : '') +
      '<p class="cml-note mt-2 mb-0">« Refaire le questionnaire » efface ce résultat de cet écran. Gardez-le d’abord dans la disquette si vous voulez le conserver.</p></div>';
    return h;
  }
});
cmvEnregistrerAction('refaire-q', function (el, etat) { _cmqvEffacer(etat); cmqvCommencer(etat); });
cmvEnregistrerAction('q-commencer', function (el, etat) { cmqvCommencer(etat); });
cmvEnregistrerAction('garder-resultat', function () {
  if (typeof cmvGarderResultat === 'function') { return cmvGarderResultat(); }
  if (typeof afficherToast === 'function') { afficherToast('La sauvegarde dans la disquette arrive bientôt.'); }
  return false;
});
