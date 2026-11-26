/* ============================================================
   modules/ce-qui-compte/papierEcrans.js
   Espace « Ce qui compte pour moi » : les ÉCRANS du papier de fin « Ce qui revient dans mes cartes » (consignes 569 et 570, maquette validée le 23/11/2026).
   Charge après ecrans.js ; la logique pure est dans papier.js, le document imprimable dans document.js.
   Trois vues de l'espace : 'papier-preparer' (choisir les cartes lues), 'papier-assistant' (le passage commun avec l'assistant, jamais recopié : passageAssistant.js),
   'papier' (lire son papier, l'imprimer ; le joindre à Explorer les métiers se décide dans Ma synthèse seulement).
   Règles : le papier n'est jamais obligatoire ni bloquant ; rien ne part tant que la personne ne le décide pas ; la personne seule choisit de le joindre à Explorer les métiers ;
   le suivi d'usage ne reçoit que des noms d'écran, jamais un texte.
   ============================================================ */

var CQCPM_PAPIER_PASSAGE = 'papier';   // clé du passage commun dans etat.passages (jamais dans la disquette)

function _cqcpmModelePapier() {
  return (typeof promptsExternesCharges !== 'undefined' && promptsExternesCharges && promptsExternesCharges[CQCPM_PAPIER_PROMPT]) || '';
}
function cqcpmDemandePourPapier(etat) { return cqcpmDemandePapier(_cqcpmModelePapier(), etat); }

function _cqcpmNomsCartes(ids) {
  return ids.map(function (id) { var c = cqcpmCarte(id); return c ? _cqcpmEsc(c.nom) : ''; }).filter(Boolean).join(', ');
}
function _cqcpmPluriel(n, un, plusieurs) { return n + ' ' + (n > 1 ? plusieurs : un); }

/* ---------- Le bloc « Mon papier » en bas de l'accueil de l'espace ---------- */
function cqcpmHtmlBlocPapier() {
  var etat = cqcpmEtat(), g = cqcpmNombreGardees(etat), p = cqcpmPapier(etat);
  var h = '<div class="cqcpm-bloc cqcpm-bloc-papier"><h2><span class="cqcpm-ico"><i class="bi bi-file-earmark-text" aria-hidden="true"></i></span> Mon papier : ce qui revient dans mes cartes' +
    (p ? ' <span class="cqcpm-pastille"><i class="bi bi-check-circle-fill" aria-hidden="true"></i> Papier reçu</span>' : '') + '</h2>';
  if (!p && cqcpmPapierRetire(etat)) {
    h += '<div class="cqcpm-alerte"><i class="bi bi-info-circle" aria-hidden="true"></i><span><b>Votre papier a été retiré.</b> Vous avez modifié ou effacé une carte qu’il lisait : il ne correspondait plus à ce que vous avez écrit. Vous pouvez en demander un nouveau quand vous le souhaitez. Il n’est plus joint à « Explorer les métiers ».</span></div>';
  }
  if (g < CQCPM_PAPIER_MIN_CARTES) {
    h += '<p class="mb-1"><b>Il faut au moins deux cartes gardées</b> pour qu’il y ait quelque chose à lire ensemble. ' + (g === 1 ? 'Vous en avez une.' : 'Vous n’en avez encore aucune.') + '</p>' +
      '<div class="cqcpm-actions"><button type="button" class="btn btn-outline-primary" disabled><i class="bi bi-file-earmark-text" aria-hidden="true"></i> Préparer mon papier</button></div>';
  } else if (p) {
    h += '<p class="mb-1">Votre papier a été préparé à partir de ' + _cqcpmPluriel(p.ids.length, 'carte', 'cartes') + '. Vous pouvez le relire, l’imprimer ou le refaire.</p>' +
      '<div class="cqcpm-actions"><button type="button" class="btn btn-primary" data-cqcpm-act="papier-lire"><i class="bi bi-file-earmark-text" aria-hidden="true"></i> Lire mon papier</button>' +
      '<button type="button" class="btn btn-outline-secondary" data-cqcpm-act="papier-preparer">Le refaire</button></div>';
  } else {
    h += '<p class="mb-1">Quand vous avez fait plusieurs cartes, vous pouvez recevoir <b>un papier</b> qui dit ce qui revient dans ce que vous avez écrit. Vous gardez la main : rien ne part tant que vous ne le décidez pas, et ce papier n’est jamais obligatoire.</p>' +
      '<div class="cqcpm-actions"><button type="button" class="btn btn-primary" data-cqcpm-act="papier-preparer"><i class="bi bi-file-earmark-text" aria-hidden="true"></i> Préparer mon papier</button></div>';
  }
  return h + '</div>';
}

/* ---------- Préparer mon papier : les cartes lues ---------- */
function cqcpmHtmlPapierPreparer() {
  var etat = cqcpmEtat(), cartes = cqcpmCartesPourEnvoi(etat);
  if (cartes.length < CQCPM_PAPIER_MIN_CARTES) {
    return '<div class="cqcpm-alerte"><i class="bi bi-info-circle" aria-hidden="true"></i><span>Il faut au moins deux cartes gardées. Reprenez une carte, gardez son résultat, puis revenez ici.</span></div>';
  }
  var n = cartes.filter(function (c) { return c.coche; }).length;
  var h = '<p class="text-center" style="font-size:1.05rem">Choisissez les cartes à lire ensemble. Elles sont cochées d’avance ; décochez celles que vous ne voulez pas inclure.</p><div class="cqcpm-pap-cases">';
  cartes.forEach(function (c) {
    var carte = cqcpmCarte(c.id), g = etat.gardees[c.id], date = g ? cqcpmDateFr(g.date) : '';
    h += '<label class="cqcpm-pap-case' + (c.coche ? ' coche' : '') + '"><input type="checkbox" data-cqcpm-act="papier-cocher" data-v="' + c.id + '"' + (c.coche ? ' checked' : '') + '>' +
      '<span class="cqcpm-ico petit"><i class="bi ' + carte.icone + '" aria-hidden="true"></i></span><span><h3>' + _cqcpmEsc(c.nom) + '</h3>' +
      (carte.envoiParDefaut === false ? '<p class="prive">Carte très personnelle : elle n’est pas cochée d’avance. Cochez-la seulement si vous le souhaitez.</p>' : (date ? '<p>Gardée le ' + date + '.</p>' : '')) + '</span></label>';
  });
  h += '</div><div class="cqcpm-aide"><i class="bi bi-shield-check" aria-hidden="true"></i><span><b>Ce qui va se passer.</b> Les cartes cochées sont écrites dans une demande que vous copiez vous-même dans l’assistant en ligne de votre choix. Rien n’est envoyé par l’application. Vous relirez la demande avant de la copier, et vous pouvez vous arrêter à tout moment.</span></div>' +
    '<div class="cqcpm-actions"><button type="button" class="btn btn-primary"' + (n < CQCPM_PAPIER_MIN_CARTES ? ' disabled' : '') + ' data-cqcpm-act="papier-demande"><i class="bi bi-clipboard" aria-hidden="true"></i> Préparer la demande (' + _cqcpmPluriel(n, 'carte', 'cartes') + ')</button>' +
    '<button type="button" class="btn btn-outline-secondary" data-cqcpm-act="retour-espace">Pas maintenant</button></div>' +
    (n < CQCPM_PAPIER_MIN_CARTES ? '<p class="cqcpm-note">Cochez au moins deux cartes.</p>' : '');
  return h;
}

/* ---------- Le passage commun avec l'assistant ---------- */
function _cqcpmRecapPapier(etat) {
  var ids = cqcpmPapierIds(etat), dem = cqcpmDemandePourPapier(etat);
  var h = '<div class="cqcpm-aide"><i class="bi bi-send-check" aria-hidden="true"></i><span><b>Ce qui va partir chez l’assistant</b> : ' + _cqcpmPluriel(ids.length, 'carte', 'cartes') + ' de « Ce qui compte pour moi » (' + _cqcpmNomsCartes(ids) + '), écrites avec vos mots. Ni votre nom, ni votre adresse, ni votre téléphone. Les cartes non cochées restent chez vous.</span></div>';
  if (dem) {
    h += '<details class="bloc-depli"><summary>Relire la demande avant de l’envoyer</summary><div class="corps">' +
      '<textarea id="cqcpmDemandePapierTexte" class="form-control" rows="12" readonly aria-label="La demande qui sera copiée pour l’assistant">' + _cqcpmEsc(dem.texte) + '</textarea>' +
      '<p class="cqcpm-note mt-2 mb-0">Vous pouvez la lire, mais pas la modifier ici : pour changer ce qui part, revenez à la préparation et changez vos cartes cochées.</p></div></details>';
  }
  return h;
}
var CQCPM_PAPIER_ETAPES = [
  { titre: 'Copie', detail: 'La demande est copiée automatiquement : vos cartes cochées, écrites avec vos mots. Rien à écrire vous-même.' },
  { titre: 'Chez l’assistant', detail: 'Vous collez la demande et vous attendez sa réponse.' },
  { titre: 'Retour ici', detail: 'Vous copiez toute sa réponse et vous la collez dans cette page.' },
  { titre: 'Mon papier', detail: 'Vous lisez ce qui revient dans vos cartes. Rien n’est joint à « Explorer les métiers » sans que vous le décidiez.' }
];
function cqcpmConfigPapier(etat) {
  return {
    idSuffixe: 'CqcpmPapier',
    rerendre: cqcpmRendre,
    attrAssistant: 'data-assistant-cqcpmpapier',
    idErreur: 'cqcpmErreurChoixIA',
    nomSuivi: 'ce_qui_compte_papier',
    recapHtml: _cqcpmRecapPapier(etat),
    etapes: CQCPM_PAPIER_ETAPES,
    texteConfidentialite: 'Seules les cartes que vous avez cochées partent chez l’assistant, avec vos mots : ni votre nom, ni votre adresse, ni votre téléphone.',
    avantEnvoi: function () {
      var dem = cqcpmDemandePourPapier(etat);
      if (!dem) { return _cqcpmModelePapier() ? 'Il faut au moins deux cartes cochées pour préparer votre papier.' : 'Les consignes ne sont pas chargées pour le moment. Vérifiez votre connexion, rechargez la page puis réessayez.'; }
      return '';
    },
    construireTexte: function () { var d = cqcpmDemandePourPapier(etat); return d ? d.texte : ''; },
    module: { libelleSuite: 'Voir mon papier', quoi: 'L’assistant vient de lire vos cartes « Ce qui compte pour moi ».', pourquoi: 'Vous découvrez ce qui revient dans ce que vous avez écrit.',
      verif: 'relisez chaque partie avec attention : c’est une lecture de ce que vous avez écrit, jamais un jugement ni une décision.' },
    verifier: function (texte) { return cqcpmAnalyserPapier(texte).ok; },
    importer: function (texte) {
      var r = cqcpmAnalyserPapier(texte);
      if (!r.ok) { return { succes: false, coupe: r.raison === 'coupee', erreur: CQCPM_PAPIER_MESSAGES_ECHEC[r.raison] || CQCPM_PAPIER_MESSAGES_ECHEC.illisible }; }
      if (!cqcpmPoserPapier(etat, r.parties, cqcpmDateDuJour())) { return { succes: false, erreur: 'Il faut au moins deux cartes cochées pour recevoir un papier.' }; }
      return { succes: true };
    },
    apresSucces: function () { if (typeof trackEvenement === 'function') { trackEvenement('ce_qui_compte_papier_recu'); } cqcpmAllerVue('papier'); }
  };
}
function cqcpmHtmlPapierAssistant() {
  var etat = cqcpmEtat();
  if (!cqcpmPapierPossible(etat)) { return '<div class="cqcpm-alerte"><i class="bi bi-info-circle" aria-hidden="true"></i><span>Il faut au moins deux cartes cochées pour préparer votre papier.</span></div><div class="cqcpm-actions"><button type="button" class="btn btn-primary" data-cqcpm-act="papier-preparer">Choisir mes cartes</button></div>'; }
  return ucpmPassageRendre(etat, CQCPM_PAPIER_PASSAGE, cqcpmConfigPapier(etat));
}
function cqcpmCablerPapierAssistant() {
  var etat = cqcpmEtat();
  if (cqcpmPapierPossible(etat)) { ucpmPassageCabler(etat, CQCPM_PAPIER_PASSAGE, cqcpmConfigPapier(etat)); }
}
// « Retour » de la barre dans le passage : recule d'une vue du passage, puis revient à la préparation.
function cqcpmRetourPapierAssistant() {
  if (!ucpmPassageRetour(cqcpmEtat(), CQCPM_PAPIER_PASSAGE, cqcpmRendre)) { cqcpmAllerVue('papier-preparer'); }
}

/* ---------- Mon papier ---------- */
function _cqcpmHtmlPartiePapier(s) {
  var corps = s.type === 'liste' ? _cqcpmListeHtml(s.valeur) : '<p>' + _cqcpmEsc(s.valeur) + '</p>';
  return '<h3><i class="bi ' + s.icone + '" aria-hidden="true"></i> ' + _cqcpmEsc(s.titre) + '</h3>' + corps;
}
function cqcpmHtmlPapier() {
  var etat = cqcpmEtat(), p = cqcpmPapier(etat), parties = cqcpmPapierSections(etat);
  if (!p || !parties.length) { return '<div class="cqcpm-vide"><p>Vous n’avez pas encore de papier.</p><button type="button" class="btn btn-primary" data-cqcpm-act="retour-espace">Retour aux cartes</button></div>'; }
  var joint = p.joint === true, date = cqcpmDateFr(p.date);
  var h = '<p class="text-center" style="font-size:1.05rem">Voici ce qui revient dans ce que vous avez écrit. C’est une lecture, pas un profil : vous pouvez la garder, la corriger en reprenant vos cartes, ou la laisser de côté.</p>' +
    '<div class="cqcpm-papier"><div class="entete"><span class="cqcpm-ico"><i class="bi bi-file-earmark-text" aria-hidden="true"></i></span><div><h2>' + _cqcpmEsc(CQCPM_PAPIER_TITRE) + '</h2>' +
    '<span class="cqcpm-note">' + (date ? 'Lu le ' + date + ', ' : '') + 'à partir de ' + _cqcpmPluriel(p.ids.length, 'carte', 'cartes') + ' : ' + _cqcpmNomsCartes(p.ids) + '.</span></div></div>' +
    parties.map(_cqcpmHtmlPartiePapier).join('') + '<p class="prudence">' + _cqcpmEsc(CQCPM_PAPIER_PRUDENCE_ECRAN) + '</p></div>';
  // Explorer les métiers : ici on en PARLE seulement (décision de Denis, 23/11/2026). Le papier se joint ou se retire dans « Ma synthèse », jamais depuis cet espace ; un choix de la personne, jamais une obligation.
  var explorer = typeof cmvOuvert === 'function' && cmvOuvert();
  if (explorer) {
    h += '<div class="cqcpm-joint' + (joint ? ' oui' : '') + '"><i class="bi bi-link-45deg" aria-hidden="true"></i><div><b>' + (joint ? 'Ce papier est joint à « Explorer les métiers ».' : 'Ce papier peut servir dans « Explorer les métiers »') + '</b>' +
      '<span>' + (joint ? 'Il apparaît dans « Ma synthèse ». Pour le retirer, ouvrez « Ma synthèse » dans « Explorer les métiers » : c’est là que vous décidez.'
        : 'Dans « Explorer les métiers », à l’étape « Ma synthèse », vous pouvez joindre ce papier : les pistes de métiers pourront alors tenir compte de ce qui compte pour vous. C’est votre choix, il n’est jamais obligatoire, et rien n’est joint sans que vous le décidiez.') + '</span></div></div>';
  }
  h += (typeof htmlRappelSauvegarde === 'function' ? htmlRappelSauvegarde() : '') +
    '<div class="cqcpm-actions"><button type="button" class="btn btn-outline-primary" data-cqcpm-act="papier-imprimer"><i class="bi bi-printer" aria-hidden="true"></i> Imprimer ou enregistrer en PDF</button>' +
    '<button type="button" class="btn btn-outline-secondary" data-cqcpm-act="papier-preparer">Le refaire avec d’autres cartes</button>' +
    '<button type="button" class="btn btn-outline-secondary" data-cqcpm-act="papier-effacer"><i class="bi bi-trash" aria-hidden="true"></i> Effacer ce papier</button></div>' +
    '<div class="cqcpm-aide"><i class="bi bi-floppy" aria-hidden="true"></i><span>Ce papier part avec votre sauvegarde personnelle (la disquette), comme vos cartes gardées. Il n’est jamais enregistré ailleurs. « Imprimer ou enregistrer en PDF » ouvre la fenêtre d’impression de votre appareil.</span></div>';
  return h;
}

function cqcpmImprimerPapier() {
  var html = cqcpmHtmlDocumentPapier(cqcpmEtat());
  if (!html) { if (typeof afficherToast === 'function') { afficherToast('Rien à imprimer pour l’instant : vous n’avez pas de papier.', 5000); } return; }
  if (typeof ucpmImprimerDocument !== 'function') { if (typeof afficherToast === 'function') { afficherToast('L’impression n’est pas disponible pour le moment.', 5000); } return; }
  ucpmImprimerDocument('ce-qui-revient-dans-mes-cartes', html);
  if (typeof trackEvenement === 'function') { trackEvenement('ce_qui_compte_papier_imprime'); }
}
function cqcpmConfirmerEffacerPapier() {
  var faire = function () { cqcpmEffacerPapier(cqcpmEtat()); cqcpmAllerVue('accueil'); };
  if (typeof confirmerAction === 'function') {
    confirmerAction('Effacer ce papier ?', 'Le papier « ' + CQCPM_PAPIER_TITRE + ' » sera effacé, et retiré d’« Explorer les métiers » s’il y était joint. Vos cartes ne sont pas touchées. Vous pourrez en demander un nouveau.', 'Effacer', 'btn-danger', faire, 'Garder mon papier');
  } else { faire(); }
}

// Les clics du papier (appelé par cqcpmClic pour toute action qui commence par « papier »). Retourne vrai si le clic a été traité.
function cqcpmClicPapier(act, b) {
  var etat = cqcpmEtat();
  if (act === 'papier-preparer') { cqcpmPapierAvisVu(etat); cqcpmAllerVue('papier-preparer'); return true; }
  if (act === 'papier-lire') { cqcpmAllerVue('papier'); return true; }
  if (act === 'papier-cocher') {
    var id = b.getAttribute('data-v');
    cqcpmChoisirEnvoi(etat, id, !cqcpmEnvoiCoche(etat, id));
    cqcpmRendre();
    var champ = document.querySelector('[data-cqcpm-act="papier-cocher"][data-v="' + id + '"]');
    if (champ && champ.focus) { champ.focus(); }
    return true;
  }
  if (act === 'papier-demande') {
    if (!cqcpmPapierPossible(etat)) { return true; }
    ucpmPassageReinitialiser(etat, CQCPM_PAPIER_PASSAGE);
    cqcpmAllerVue('papier-assistant');
    return true;
  }
  if (act === 'papier-imprimer') { cqcpmImprimerPapier(); return true; }
  if (act === 'papier-effacer') { cqcpmConfirmerEffacerPapier(); return true; }
  return false;
}
