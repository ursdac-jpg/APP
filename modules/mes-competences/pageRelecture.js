/* ============================================================
   Module « Découvrir mes compétences » : écran 3, « Je relis mes compétences ».
   Maquette : docs/MAQUETTE_MES_COMPETENCES_2026-10-26.html (écran « Relecture »). Composants communs : .bloc-depli (bd-pret, bd-warn), .cv-section, boutons Bootstrap.
   Trois gestes par ligne (« C’est exact », « En partie exact », « Je retire »), deux pour une envie. Rien n’entre dans le document sans un geste de la personne.
   Une ligne « à préciser » pose une question : la réponse est notée ici, puis le SECOND PASSAGE « lignes seules » (mêmes trois vues que le premier,
   passageAssistant.js) n’envoie que ces lignes. Tout le calcul est dans logique.js et filet.js ; ce fichier ne fait que dessiner et câbler.
   ============================================================ */

var MESCOMP_ICONES_FAMILLES = { savoirFaire: '&#128736;&#65039;', savoirs: '&#128218;', savoirEtre: '&#129309;', envies: '&#127793;' };
var MESCOMP_SOURCES_DIT = { cv: 'Votre CV dit', lettreMotivation: 'Votre lettre de motivation dit', recommandation: 'Votre lettre de recommandation dit', reponse: 'Votre réponse dit' };
var MESCOMP_ETAPES_SECOND = [
  { titre: 'Copie', detail: 'Le message est copié automatiquement : vos documents relus et masqués, les lignes à préciser et vos réponses.' },
  { titre: 'Chez l’assistant', detail: 'Vous collez le message et vous attendez sa réponse. Elle sera plus courte que la première fois.' },
  { titre: 'Retour ici', detail: 'Vous copiez toute sa réponse et vous la collez dans cette page.' },
  { titre: 'Votre relecture', detail: 'Les lignes précisées reviennent ici. Vous décidez de les garder ou non.' }
];

var _mesCompSecondEnCours = false;   // vrai pendant le second passage (les vues du passage remplacent la liste des lignes)
var _mesCompNoteRetour = '';         // phrase montrée une fois, en haut de la liste, au retour du second passage
var _mesCompSousOuverts = {};        // sous-blocs ouverts (« Pour mon CV »...) : ils restent ouverts quand la page est redessinée

function _mcE(t) { return echapperAttribut(t); }

// ---------- Une ligne ----------

function _mesCompEtiquetteLigne(l) {
  if (l.geste === 'ok') { return { texte: '&#10003; Gardée', couleur: 'var(--success-strong)' }; }
  if (l.geste === 'part') { return { texte: '&#10003; Gardée avec vos mots', couleur: 'var(--success-strong)' }; }
  if (l.geste === 'non') { return { texte: 'Retirée', couleur: 'var(--text-muted)' }; }
  if (l.confirmation === 'aPreciser') {
    if (l.passee) { return { texte: 'Passée', couleur: 'var(--text-muted)' }; }
    return (l.id && _mesCompEtat && _mesCompEtat.reponses && _mesCompEtat.reponses[l.id])
      ? { texte: 'Réponse notée', couleur: 'var(--success-strong)' } : { texte: 'À préciser', couleur: '#92720c' };
  }
  if (l.confirmation === 'confirmee') { return { texte: '&#10003; Confirmée par une autre personne', couleur: 'var(--success-strong)' }; }
  return { texte: 'Relevée dans vos documents', couleur: 'var(--accent)' };
}

function _mesCompHtmlPreuves(preuves) {
  return (preuves || []).map(function (p) {
    return '<div class="mc-preuve"><b>' + _mcE(MESCOMP_SOURCES_DIT[p.typeDocument] || 'Vos documents disent') + ' :</b> « ' + _mcE(p.extrait) + ' »</div>';
  }).join('');
}

function _mesCompSous(id, cle, titre, corpsHtml) {
  var ouvert = _mesCompSousOuverts[id + ':' + cle] ? ' open' : '';
  return '<details class="mc-sous" data-mc-sous="' + _mcE(id + ':' + cle) + '"' + ouvert + '><summary>' + titre + '</summary>' + corpsHtml + '</details>';
}

function _mesCompHtmlGestes(l, avecPartiel) {
  function bouton(geste, libelle, classe, classeActive) {
    var actif = l.geste === geste;
    return '<button type="button" class="btn btn-sm ' + (actif ? classeActive + ' active' : classe) + '" data-mc-geste="' + geste + '" data-mc-id="' + _mcE(l.id) + '" aria-pressed="' + actif + '">' + libelle + '</button>';
  }
  return '<div class="mc-gestes">' + bouton('ok', 'C’est exact', 'btn-outline-success', 'btn-success') +
    (avecPartiel ? bouton('part', 'En partie exact', 'btn-outline-primary', 'btn-primary') : '') +
    bouton('non', 'Je retire', 'btn-outline-secondary', 'btn-secondary') + '</div>';
}

function _mesCompHtmlLigneAPreciser(l, etat) {
  var texte = (etat.reponses && etat.reponses[l.id]) || '';
  var corps = (l.enMotsSimples ? '<p class="small mt-2 mb-1">' + _mcE(l.enMotsSimples) + '</p>' : '') + _mesCompHtmlPreuves(l.preuves);
  if (l.passee) {
    return corps + '<p class="small mb-1">Vous avez choisi de passer cette question. Cette ligne n’entrera pas dans votre document.</p>' +
      '<p class="mb-0"><button type="button" class="btn btn-sm btn-outline-secondary" data-mc-reprendre="' + _mcE(l.id) + '">Répondre finalement</button></p>';
  }
  return corps + '<p class="mb-1"><strong>' + _mcE(l.question || 'Pouvez-vous préciser ce que vous faisiez ?') + '</strong></p>' +
    '<label class="small" for="mcRep_' + _mcE(l.id) + '">Votre réponse, en une ou deux phrases :</label>' +
    '<textarea class="form-control form-control-sm" id="mcRep_' + _mcE(l.id) + '" data-mc-reponse="' + _mcE(l.id) + '" rows="2" placeholder="Écrivez avec vos mots. Vous pouvez aussi passer.">' + _mcE(texte) + '</textarea>' +
    '<p class="mt-2 mb-1"><button type="button" class="btn btn-sm btn-primary" data-mc-valider="' + _mcE(l.id) + '">Valider ma réponse</button> ' +
    '<button type="button" class="btn btn-sm btn-outline-secondary" data-mc-passer="' + _mcE(l.id) + '">Je passe</button></p>' +
    '<p class="small mb-0" data-mc-msg="' + _mcE(l.id) + '" role="status" style="color:var(--danger);"></p>';
}

function _mesCompHtmlLigne(l, etat) {
  var et = _mesCompEtiquetteLigne(l);
  var classe = 'bloc-depli mc-comp' + (l.confirmation === 'confirmee' ? ' bd-pret' : '') + (l.confirmation === 'aPreciser' ? ' bd-warn' : '') + (l.geste === 'non' ? ' retire' : '');
  var corps;
  if (l.confirmation === 'aPreciser') {
    corps = _mesCompHtmlLigneAPreciser(l, etat);
  } else {
    corps = (l.enMotsSimples ? '<p class="small mt-2 mb-1">En mots simples : ' + _mcE(l.enMotsSimples) + '</p>' : '') + _mesCompHtmlPreuves(l.preuves) +
      (l.pourLeCV ? _mesCompSous(l.id, 'cv', 'Pour mon CV', '<p class="mb-1">' + _mcE(l.pourLeCV) + '</p>') : '') +
      (l.pourLOral ? _mesCompSous(l.id, 'oral', 'Pour le dire à l’oral', '<p class="mb-1">« ' + _mcE(l.pourLOral) + ' » <button type="button" class="btn btn-sm btn-outline-secondary ms-1" data-mc-copier="' + _mcE(l.id) + '">Copier</button></p>') : '') +
      ((l.synonymes && l.synonymes.length) ? _mesCompSous(l.id, 'syn', 'D’autres façons de le dire', '<p class="mb-1">' + l.synonymes.map(_mcE).join('. ') + '.</p>') : '') +
      (l.pourPreparer ? _mesCompSous(l.id, 'plus', 'Pour aller plus loin', '<p class="mb-1">' + _mcE(l.pourPreparer) + '</p>') : '') +
      _mesCompHtmlGestes(l, true) +
      (l.geste === 'part'
        ? '<div class="mc-corrige"><label class="small" for="mcCorr_' + _mcE(l.id) + '">Écrivez-le avec vos mots :</label>' +
          '<textarea class="form-control form-control-sm" id="mcCorr_' + _mcE(l.id) + '" data-mc-corriger="' + _mcE(l.id) + '" rows="2">' + _mcE(l.texteCorrige) + '</textarea></div>'
        : '');
  }
  return '<details class="' + classe + '" open><summary>' + _mcE(l.libelle) + ' <span class="bloc-depli-etat" style="color:' + et.couleur + '">' + et.texte + '</span></summary>' +
    '<div class="bloc-depli-corps">' + corps + '</div></details>';
}

function _mesCompHtmlEnvie(x) {
  var classe = 'bloc-depli mc-comp' + (x.geste === 'non' ? ' retire' : '');
  var etat = x.geste === 'ok' ? ' <span class="bloc-depli-etat" style="color:var(--success-strong)">&#10003; Gardée</span>' : (x.geste === 'non' ? ' <span class="bloc-depli-etat" style="color:var(--text-muted)">Retirée</span>' : '');
  return '<details class="' + classe + '" open><summary>' + _mcE(x.libelle) + etat + '</summary><div class="bloc-depli-corps">' +
    _mesCompHtmlPreuves([{ typeDocument: x.typeDocument, extrait: x.extrait }]) + _mesCompHtmlGestes(x, false) + '</div></details>';
}

// ---------- Page ----------

function _mesCompHtmlFamille(famille, lignes, etat) {
  var n = lignes.length;
  return '<details class="bloc-depli" open><summary>' + MESCOMP_ICONES_FAMILLES[famille.id] + ' ' + famille.titre + ' <span class="bloc-depli-etat">' + n + ' ligne' + (n > 1 ? 's' : '') + '</span></summary>' +
    '<div class="bloc-depli-corps">' + lignes.map(function (l) { return _mesCompHtmlLigne(l, etat); }).join('') + '</div></details>';
}

function _mesCompHtmlNiveau(etat) {
  var niveau = etat.niveau !== 'auto' ? etat.niveau : etat.niveauPropose;
  var lib = MESCOMP_NIVEAUX_CHOIX.filter(function (n) { return n.id === niveau; })[0];
  if (!lib) { return ''; }
  var choisi = etat.niveau !== 'auto';
  return '<div class="cv-section" style="margin-bottom:1rem;background:var(--accent-bg-subtle);"><p class="mb-0"><strong>Niveau ' + (choisi ? 'choisi' : 'proposé') + ' : ' + _mcE(lib.libelle.toLowerCase()) + '.</strong>' +
    (!choisi && etat.niveauIndices ? ' ' + _mcE(etat.niveauIndices) : '') +
    ' <button type="button" class="btn btn-sm btn-outline-primary ms-1" id="btnMcChangerNiveau">Changer</button></p>' +
    '<p class="small mt-1 mb-0">Changer le niveau se fait à l’étape « Documents », puis l’assistant relit vos documents. Vos gestes actuels sont gardés tant que vous ne collez pas une nouvelle réponse.</p></div>';
}

function _mesCompHtmlReponsesPretes(etat) {
  var prep = mesCompPreparerSecondPassage(etat);
  if (!prep) { return ''; }
  var n = prep.libelles.length;
  return '<div class="cv-section" id="mcReponsesPretes" style="background:var(--success-bg-subtle);"><h4>&#9993;&#65039; ' + (n > 1 ? 'Vos réponses sont prêtes' : 'Votre réponse est prête') + '</h4>' +
    '<p class="mb-2">L’assistant va lire ' + (n > 1 ? 'vos ' + n + ' réponses' : 'votre réponse') + ' et ne repasser que ' + (n > 1 ? 'ces lignes' : 'cette ligne') + ' (le message est plus court qu’au premier passage). La ligne reviendra ici, et vous déciderez de la garder ou non.</p>' +
    '<button type="button" class="btn btn-primary" id="btnMcEnvoyerReponses">Envoyer ' + (n > 1 ? 'mes réponses' : 'ma réponse') + ' à l’assistant</button></div>';
}

function _mesCompHtmlRelecture(etat) {
  if (_mesCompSecondEnCours) {
    return '<div class="text-center"><p class="sousTitre">Deuxième passage : l’assistant ne relit que vos réponses.</p></div>' + ucpmPassageRendre(etat, 'second', _mesCompConfigSecond());
  }
  var familles = MESCOMP_FAMILLES.map(function (f) {
    var lignes = etat.lignes.filter(function (l) { return l.famille === f.id; });
    return lignes.length ? _mesCompHtmlFamille(f, lignes, etat) : '';
  }).join('');
  var envies = etat.envies.length
    ? '<details class="bloc-depli" open><summary>' + MESCOMP_ICONES_FAMILLES.envies + ' ' + MESCOMP_TITRE_ENVIES + ' <span class="bloc-depli-etat">' + etat.envies.length + ' ligne' + (etat.envies.length > 1 ? 's' : '') + ', avec vos mots seulement</span></summary>' +
      '<div class="bloc-depli-corps">' + etat.envies.map(_mesCompHtmlEnvie).join('') + '</div></details>'
    : '';
  var note = _mesCompNoteRetour ? '<div class="cv-section" style="margin-bottom:1rem;background:var(--success-bg-subtle);"><p class="mb-0">' + _mcE(_mesCompNoteRetour) + '</p></div>' : '';
  _mesCompNoteRetour = '';
  return '<div class="text-center"><p class="sousTitre">Voici ce que vos documents montrent. Pour chaque ligne, c’est vous qui décidez.</p></div>' + note +
    _mesCompHtmlNiveau(etat) +
    (etat.nbEcartees ? '<p class="small text-center text-muted">' + etat.nbEcartees + ' ligne' + (etat.nbEcartees > 1 ? 's ont' : ' a') + ' été mise' + (etat.nbEcartees > 1 ? 's' : '') + ' de côté, faute de phrase de vos documents qui la prouve.</p>' : '') +
    (familles || envies ? '' : '<div class="cv-section"><p class="mb-0">Aucune ligne à relire. Revenez à l’étape « Assistant » pour refaire un passage.</p></div>') +
    familles + envies + _mesCompHtmlReponsesPretes(etat) +
    '<p class="text-center small" role="status" id="mcPhraseRelecture" style="color:var(--text-muted);">' + _mcE(mesCompPhraseRelecture(etat)) + '</p>';
}

// ---------- Second passage « lignes seules » ----------

function _mesCompConfigSecond() {
  var etat = mesCompOuvrir();
  function prompt() { return (typeof promptsExternesCharges !== 'undefined' && promptsExternesCharges && promptsExternesCharges.mesCompetences) || ''; }
  function message() {
    var prep = mesCompPreparerSecondPassage(etat);
    if (!prep || !prompt()) { return ''; }
    return mesCompConstruireMessageSecondPassage(mesCompNettoyerPrompt(prompt()), _mesCompDocumentsDEnvoi(etat), etat.niveau, prep.lignesSchema, prep.reponsesTexte);
  }
  var prepNb = (mesCompPreparerSecondPassage(etat) || { libelles: [] }).libelles.length;
  return {
    idSuffixe: 'McSecond',
    rerendre: mesCompRendrePage,
    attrAssistant: 'data-assistant-mc',
    idErreur: 'mcErreurChoixIA',
    nomSuivi: 'mes_competences_precision',
    recapHtml: '<div class="small mb-2" style="background:var(--accent-bg-subtle);border-radius:8px;padding:.5rem .8rem;text-align:left;"><strong>Ce qui va partir</strong> : ' +
      prepNb + ' ligne' + (prepNb > 1 ? 's' : '') + ' à préciser avec ' + (prepNb > 1 ? 'vos réponses' : 'votre réponse') + ', plus vos documents relus et masqués.</div>',
    etapes: MESCOMP_ETAPES_SECOND,
    texteConfidentialite: 'Seuls vos documents relus et masqués et vos réponses partent chez l’assistant : ni votre nom, ni votre adresse, ni votre téléphone.',
    avantEnvoi: function () {
      var m = message();
      return (m && mesCompMessageTropLong(m)) ? 'Vos documents sont trop longs pour un seul envoi. Retirez un document (revenez à « Mes documents ») puis réessayez.' : '';
    },
    construireTexte: function () { var m = message(); return m ? Promise.resolve(m) : Promise.reject(new Error('message absent')); },
    importer: _mesCompImporterSecond,
    apresSucces: function () { _mesCompSecondEnCours = false; mesCompRendrePage(); }
  };
}

function _mesCompImporterSecond(texte) {
  var etat = mesCompOuvrir();
  var prep = mesCompPreparerSecondPassage(etat);
  if (!prep) { return { succes: false, erreur: 'Aucune réponse à envoyer.' }; }
  var f = MesCompFilet.filtrerReponse(texte, _mesCompDocumentsDEnvoi(etat), { secondPassage: true, reponsesPersonne: prep.reponsesTexte, questionsPosees: prep.libelles });
  if (!f.ok) {
    return { succes: false, coupe: f.fatale === 'coupee', erreur: f.fatale === 'coupee' ? 'La réponse s’arrête avant la fin.' : 'Cette réponse n’a pas pu être lue.' };
  }
  var avant = mesCompLignesAPreciser(etat).length;
  var suivant = mesCompIntegrerSecondPassage(etat, f);
  suivant.passages = {};
  suivant.ecran = 'relecture';
  var apres = mesCompLignesAPreciser(suivant).length;
  var change = avant - apres;
  _mesCompEtat = suivant;
  _mesCompNoteRetour = change > 0
    ? (change > 1 ? change + ' lignes ont été précisées. Relisez-les et décidez de les garder ou non.' : 'Une ligne a été précisée. Relisez-la et décidez de la garder ou non.')
    : 'L’assistant n’a pas pu préciser ces lignes avec certitude, rien n’a été ajouté. Vous pouvez réessayer ou passer.';
  return { succes: true };
}

// ---------- Câblage ----------

function _mesCompMajPhrase() {
  var etat = mesCompOuvrir();
  var p = document.getElementById('mcPhraseRelecture');
  if (p) { p.textContent = mesCompPhraseRelecture(etat); }
}

function _mesCompCablerRelecture(etat) {
  if (_mesCompSecondEnCours) { ucpmPassageCabler(etat, 'second', _mesCompConfigSecond()); return; }
  Array.prototype.forEach.call(document.querySelectorAll('[data-mc-geste]'), function (b) {
    b.addEventListener('click', function () {
      _mesCompEtat = mesCompBasculerGeste(mesCompOuvrir(), b.getAttribute('data-mc-id'), b.getAttribute('data-mc-geste'));
      mesCompRendrePage();
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-mc-corriger]'), function (t) {
    t.addEventListener('input', function () { _mesCompEtat = mesCompCorrigerTexte(mesCompOuvrir(), t.getAttribute('data-mc-corriger'), t.value); });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-mc-reponse]'), function (t) {
    t.addEventListener('input', function () { _mesCompEtat = mesCompPoserReponse(mesCompOuvrir(), t.getAttribute('data-mc-reponse'), t.value); });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-mc-valider]'), function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-mc-valider');
      var t = document.getElementById('mcRep_' + id);
      if (!t || !t.value.trim()) {
        var m = document.querySelector('[data-mc-msg="' + id + '"]');
        if (m) { m.textContent = 'Écrivez d’abord votre réponse, ou cliquez sur « Je passe ».'; }
        return;
      }
      _mesCompEtat = mesCompPoserReponse(mesCompOuvrir(), id, t.value);
      mesCompRendrePage();
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-mc-passer]'), function (b) {
    b.addEventListener('click', function () { _mesCompEtat = mesCompPasserLigne(mesCompOuvrir(), b.getAttribute('data-mc-passer')); mesCompRendrePage(); });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-mc-reprendre]'), function (b) {
    b.addEventListener('click', function () { _mesCompEtat = mesCompReprendreLigne(mesCompOuvrir(), b.getAttribute('data-mc-reprendre')); mesCompRendrePage(); });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-mc-copier]'), function (b) {
    b.addEventListener('click', function () {
      var l = mesCompOuvrir().lignes.filter(function (x) { return x.id === b.getAttribute('data-mc-copier'); })[0];
      if (!l || !navigator.clipboard || !navigator.clipboard.writeText) { return; }
      navigator.clipboard.writeText(l.pourLOral).then(function () {
        var avant = b.textContent; b.textContent = 'Copié';
        setTimeout(function () { b.textContent = avant; }, 1200);
      }).catch(function () { /* copie refusée : le texte reste lisible à l’écran */ });
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('details[data-mc-sous]'), function (d) {
    d.addEventListener('toggle', function () { _mesCompSousOuverts[d.getAttribute('data-mc-sous')] = d.open; });
  });
  var ch = document.getElementById('btnMcChangerNiveau');
  if (ch) { ch.addEventListener('click', function () { mesCompAllerEcran('documents'); }); }
  var env = document.getElementById('btnMcEnvoyerReponses');
  if (env) { env.addEventListener('click', function () { _mesCompSecondEnCours = true; mesCompRendrePage(); }); }
  _mesCompMajPhrase();
}

mesCompEnregistrerPage('relecture', {
  rendre: _mesCompHtmlRelecture,
  cabler: _mesCompCablerRelecture,
  retour: function (etat) {
    if (!_mesCompSecondEnCours) { return false; }
    if (ucpmPassageRetour(etat, 'second', mesCompRendrePage)) { return true; }
    _mesCompSecondEnCours = false;
    mesCompRendrePage();
    return true;
  },
  peutContinuer: function (etat) { return !_mesCompSecondEnCours && mesCompPeutContinuerRelecture(etat); },
  raisonBlocage: function (etat) { return _mesCompSecondEnCours ? 'Collez la réponse de l’assistant pour continuer, ou revenez en arrière.' : mesCompPhraseRelecture(etat); },
  libelleContinuer: 'Continuer &#8594;'
});
