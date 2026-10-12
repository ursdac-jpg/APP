/* ============================================================
   Module « Un CV, plusieurs métiers » : PASSAGE AVEC L'ASSISTANT (une seule implémentation pour les quatre passages du module).
   Règle de Denis (2026-10-08) : AUCUNE nouvelle fenêtre. On assemble ici les composants existants, jamais recopiés :
   htmlChoixAssistantBilanCorps + ouvrirFenetreAssistantIA (choix et copie), htmlBanniereTransitionIA + _etatTransitionIA (« chez l'assistant »),
   htmlCollageInstantane + activerCollageInstantane (collage de la réponse), recopierTexteAssistantPuisOuvrir.

   Un passage a trois vues, dans l'ordre : 'choix' (choisir l'assistant, le texte est copié) -> 'chez' (l'assistant est ouvert, la page reste ouverte)
   -> 'coller' (coller la réponse, « Importer »). Son état vit dans etat.passages[cle] = { vue, assistant } (donnée pure, part dans la disquette).

   config d'un passage :
     titre            titre de la page quand la vue est 'choix' (ex. « Choisir l'assistant »)
     idSuffixe        suffixe des identifiants du collage (ex. 'UcpmMetiers')
     etapes           les quatre temps affichés dans le choix (tableau { titre, detail })
     texteConfidentialite   rappel de ce qui ne part pas
     recapHtml        (facultatif) HTML d'un récapitulatif de ce qui va être envoyé
     construireTexte  function () -> Promise<string> ou string : le texte à copier
     importer         function (texteColle) -> { succes, erreur } : lit la réponse ; si succes, le module enregistre lui-même le résultat
     apresSucces      function () : suite quand la réponse est lue (en général aller à la page suivante)
     nomAssistant     (facultatif) function (assistant) -> texte d'alerte propre à ce passage
   ============================================================ */

var _ucpmIntervalleDecompte = null;

// ---------- Style d'écriture avant chaque passage où l'assistant écrit (retours 12 et 17 de Denis, 2026-10-10) ----------
// Le panneau de réglages de l'application (niveau de langage, ton, longueur, vocabulaire du métier, situation) : mêmes fonctions que la page « Assistant »
// (contenuRectangleStyleCV / wireRectangleStyleCV), jamais recopiées. type : 'cv' (CV complet, accroches) ou 'lettre' (lettres).
function ucpmHtmlStyleEcriture(type) {
  if (typeof contenuRectangleStyleCV !== 'function') { return ''; }
  if (typeof appliquerDefautsStyleCV === 'function') { appliquerDefautsStyleCV(type); }
  return '<div class="cv-section mb-3" id="ucpmStyleEcriture"><h4>&#127898;&#65039; Réglez le style d’écriture</h4>' +
    '<p class="small mb-2" style="color:var(--text-muted);">Ces choix partent avec la demande : l’assistant écrit selon le niveau de langage, le ton et la longueur que vous choisissez.</p>' +
    contenuRectangleStyleCV(type, true) + '</div>';
}
function ucpmCablerStyleEcriture(type, rerender) {
  if (typeof wireRectangleStyleCV === 'function' && document.getElementById('ucpmStyleEcriture')) { wireRectangleStyleCV(type, rerender); }
}
// Les choix de style sous forme de consignes ajoutées à la fin de la demande (mêmes mots que les autres parcours : LABELS_PREFERENCES_IA).
function ucpmConsignesStyle(type) {
  var NL = String.fromCharCode(10);
  var prefs = (typeof dossier !== 'undefined' && dossier.preferencesIAParType && dossier.preferencesIAParType[type]) || {};
  var L = (typeof LABELS_PREFERENCES_IA !== 'undefined') ? LABELS_PREFERENCES_IA : {};
  var lib = function (champ) { return (L[champ] && L[champ][prefs[champ]]) || prefs[champ]; };
  var lignes = [];
  if (prefs.niveauPoste) { lignes.push('- Niveau du poste recherché : ' + lib('niveauPoste')); }
  if (prefs.niveauLangage) { lignes.push('- Niveau de langage souhaité : ' + lib('niveauLangage')); }
  if (prefs.adaptationMetier) { lignes.push('- Adaptation au vocabulaire du métier : ' + lib('adaptationMetier')); }
  if (prefs.ton) { lignes.push('- Ton souhaité : ' + lib('ton')); }
  if (prefs.longueur) { lignes.push('- Longueur souhaitée : ' + lib('longueur')); }
  if (typeof dossier !== 'undefined' && dossier.situationActuelle && dossier.situationActuelle !== 'non_precise' && typeof LABELS_SITUATION_ACTUELLE !== 'undefined') {
    lignes.push('- Situation de la personne en ce moment (contexte pour la présenter au mieux, jamais un jugement) : ' + (LABELS_SITUATION_ACTUELLE[dossier.situationActuelle] || dossier.situationActuelle));
  }
  return lignes.length ? NL + NL + 'CONSIGNES DE RÉDACTION' + NL + lignes.join(NL) : '';
}

// Les quatre temps expliqués dans le choix de l'assistant, propres à chaque passage (le texte vient de la config).
function _ucpmEtatPassage(etat, cle) {
  if (!etat.passages) { etat.passages = {}; }
  if (!etat.passages[cle]) { etat.passages[cle] = { vue: 'choix', assistant: '' }; }
  return etat.passages[cle];
}

// Remet un passage à son tout début (nouveau CV déposé, nouvelle demande...).
function ucpmPassageReinitialiser(etat, cle) {
  if (etat && etat.passages) { delete etat.passages[cle]; }
  if (typeof _etatTransitionIA !== 'undefined') { _etatTransitionIA = null; }
  clearInterval(_ucpmIntervalleDecompte);
}

// Vue courante, ramenée à 'choix' si elle ne peut plus s'afficher (après un rechargement : l'ouverture de l'assistant est perdue).
function ucpmPassageVue(etat, cle) {
  var p = _ucpmEtatPassage(etat, cle);
  if (p.vue === 'chez' && (typeof _etatTransitionIA === 'undefined' || !_etatTransitionIA)) { p.vue = 'choix'; }
  return p.vue;
}

// Bouton « Retour » : recule d'une vue du passage ; renvoie true si c'est fait, false quand on est déjà au début du passage.
function ucpmPassageRetour(etat, cle) {
  var p = _ucpmEtatPassage(etat, cle);
  clearInterval(_ucpmIntervalleDecompte);
  if (p.vue === 'coller') { p.vue = 'choix'; if (typeof _etatTransitionIA !== 'undefined') { _etatTransitionIA = null; } ucpmRendrePage(); return true; }
  if (p.vue === 'chez') { p.vue = 'choix'; if (typeof _etatTransitionIA !== 'undefined') { _etatTransitionIA = null; } ucpmRendrePage(); return true; }
  return false;
}

function ucpmPassageRendre(etat, cle, config) {
  var vue = ucpmPassageVue(etat, cle);
  if (vue === 'chez') { return _ucpmPassageHtmlChez(); }
  if (vue === 'coller') { return _ucpmPassageHtmlColler(config); }
  return _ucpmPassageHtmlChoix(config);
}

function ucpmPassageCabler(etat, cle, config) {
  var vue = ucpmPassageVue(etat, cle);
  if (vue === 'chez') { _ucpmPassageCablerChez(etat, cle); return; }
  if (vue === 'coller') { _ucpmPassageCablerColler(etat, cle, config); return; }
  _ucpmPassageCablerChoix(etat, cle, config);
}

// ---------- Vue 'choix' ----------

function _ucpmPassageHtmlChoix(config) {
  return '<div class="cv-section ucpm-choix-ia" data-ucpm-vue="choix">' +
    (config.recapHtml || '') +
    '<h4 class="mb-1">&#128172; Choisissez votre assistant</h4>' +
    '<p style="color:var(--text-muted);font-size:.9rem;" class="mb-2">Cliquez sur un assistant. L’application prépare et copie tout, puis l’ouvre dans un nouvel onglet : <strong>cette page reste ouverte</strong>, c’est ici que vous reviendrez.</p>' +
    htmlChoixAssistantBilanCorps({
      idErreur: 'ucpmErreurChoixIA',
      attrAssistant: 'data-assistant-ucpm',
      etapes: config.etapes,
      texteConfidentialite: config.texteConfidentialite
    }) +
    '</div>';
}

function _ucpmPassageCablerChoix(etat, cle, config) {
  // Revenir sur le choix annule une ouverture en cours.
  if (typeof _etatTransitionIA !== 'undefined' && _etatTransitionIA) { _etatTransitionIA = null; }
  clearInterval(_ucpmIntervalleDecompte);
  Array.prototype.forEach.call(document.querySelectorAll('[data-assistant-ucpm]'), function (el) {
    el.addEventListener('click', function () {
      var id = el.getAttribute('data-assistant-ucpm');
      var assistant = (typeof ASSISTANTS_IA !== 'undefined') ? ASSISTANTS_IA.filter(function (a) { return a.id === id; })[0] : null;
      if (!assistant) { return; }
      var p = _ucpmEtatPassage(etat, cle);
      p.assistant = assistant.id;
      var depart = Promise.resolve(typeof config.construireTexte === 'function' ? config.construireTexte() : '');
      depart.then(function (texte) {
        if (!String(texte || '').trim()) { throw new Error('texte vide'); }
        ouvrirFenetreAssistantIA({
          nomAssistant: assistant.nom,
          idAssistant: assistant.id,
          urlAssistant: assistant.url,
          etapes: (typeof ETAPES_ASSISTANT_IA_TEXTE !== 'undefined') ? ETAPES_ASSISTANT_IA_TEXTE : undefined,
          construireTexteACopier: function () { return texte; },
          onApresValidation: function (urlAssistant, nomAssistant) {
            _etatTransitionIA = { urlAssistant: urlAssistant, nomAssistant: nomAssistant, phase: 'decompte', secondesRestantes: 5 };
            p.vue = 'chez';
            ucpmRendrePage();
          }
        });
      }).catch(function () {
        var z = document.getElementById('ucpmErreurChoixIA');
        if (z) { z.style.display = 'block'; z.textContent = '⚠️ L’application n’a pas pu préparer la demande. Merci de réessayer dans un instant.'; }
      });
    });
  });
}

// ---------- Vue 'chez' (meme sequence que le Bilan, les autres modules et la page Action : decompte, ouvert ou bloque, revenu) ----------

function _ucpmPassageHtmlChez() {
  var nom = (typeof _etatTransitionIA !== 'undefined' && _etatTransitionIA && _etatTransitionIA.nomAssistant) || 'l’assistant';
  return '<div data-ucpm-vue="chez">' +
    '<div class="text-center"><h2>Chez ' + echapperAttribut(nom) + '</h2>' +
    '<p class="sousTitre">Le texte est déjà copié. L’onglet s’ouvre tout seul ; <strong>cette page reste ouverte</strong>, c’est ici que vous reviendrez.</p></div>' +
    (typeof htmlBanniereTransitionIA === 'function' ? htmlBanniereTransitionIA() : '') +
    '<div class="cv-section" style="margin-top:.8rem;">' +
    '<p class="mb-1"><strong>&#128278; Ce que vous retrouverez ici</strong></p>' +
    '<p class="mb-0" style="color:var(--text-muted);font-size:.9rem;">De retour de l’assistant : cliquez sur <strong>« Je suis de retour »</strong> ci-dessus, puis collez sa réponse.</p>' +
    '</div></div>';
}

function _ucpmPassageCablerChez(etat, cle) {
  var p = _ucpmEtatPassage(etat, cle);
  if (typeof _etatTransitionIA === 'undefined' || !_etatTransitionIA) { p.vue = 'choix'; ucpmRendrePage(); return; }
  // Retour en arrière depuis « Coller la réponse » alors que la phase est déjà 'revenu' : l'assistant est déjà ouvert, on revient à 'ouvert'.
  if (_etatTransitionIA.phase !== 'decompte' && _etatTransitionIA.phase !== 'bloque' && _etatTransitionIA.phase !== 'ouvert') {
    _etatTransitionIA.phase = 'ouvert';
    ucpmRendrePage();
    return;
  }
  function ouvrirAssistantEnAttente() {
    if (!document.querySelector('[data-ucpm-vue="chez"]')) { clearInterval(_ucpmIntervalleDecompte); return; }
    // Recopie le texte avant chaque ouverture (voir recopierTexteAssistantPuisOuvrir, js/app.js) : une seule fonction pour tous les parcours.
    recopierTexteAssistantPuisOuvrir(function () {
      var fen = window.open(_etatTransitionIA.urlAssistant, '_blank');
      _etatTransitionIA.phase = fen ? 'ouvert' : 'bloque';
      if (_etatTransitionIA.phase === 'bloque' && typeof trackEvenement === 'function') { trackEvenement('ucpm_popup_bloque'); }
      ucpmRendrePage();
    });
  }
  if (_etatTransitionIA.phase === 'decompte') {
    var cont = document.getElementById('btnContinuerMaintenantIA');
    if (cont) { cont.addEventListener('click', function () { clearInterval(_ucpmIntervalleDecompte); ouvrirAssistantEnAttente(); }); }
    clearInterval(_ucpmIntervalleDecompte);
    _ucpmIntervalleDecompte = setInterval(function () {
      _etatTransitionIA.secondesRestantes -= 1;
      var c = document.getElementById('compteurDecompteIA');
      if (c) { c.textContent = _etatTransitionIA.secondesRestantes; }
      if (_etatTransitionIA.secondesRestantes <= 0) { clearInterval(_ucpmIntervalleDecompte); ouvrirAssistantEnAttente(); }
    }, 1000);
  } else if (_etatTransitionIA.phase === 'bloque') {
    var bl = document.getElementById('btnOuvrirBloqueIA');
    if (bl) { bl.addEventListener('click', ouvrirAssistantEnAttente); }
  } else if (_etatTransitionIA.phase === 'ouvert') {
    var ret = document.getElementById('btnJeSuisDeRetourIA');
    if (ret) { ret.addEventListener('click', function () { _etatTransitionIA.phase = 'revenu'; p.vue = 'coller'; ucpmRendrePage(); }); }
    var rouvrir = document.getElementById('btnRouvrirSiteIA');
    if (rouvrir) { rouvrir.addEventListener('click', ouvrirAssistantEnAttente); }
  }
}

// ---------- Vue 'coller' ----------

function _ucpmPassageHtmlColler(config) {
  var nom = (typeof _etatTransitionIA !== 'undefined' && _etatTransitionIA && _etatTransitionIA.nomAssistant) || 'l’assistant';
  return '<div class="cv-section bilan-etape-import-ia" data-ucpm-vue="coller">' +
    '<h4>&#128229; De retour : collez la réponse</h4>' +
    '<p class="text-muted small mb-2">Vous revenez de <strong>' + echapperAttribut(nom) + '</strong>. Sa réponse est dans votre presse-papiers : collez-la ci-dessous, puis <strong>Importer</strong>.</p>' +
    '<div class="bilan-zone-collage">' +
    (typeof htmlCollageInstantane === 'function' ? htmlCollageInstantane(config.idSuffixe, {}) : '<p style="color:var(--text-muted);">Collage (composant partagé).</p>') +
    '</div></div>';
}

function _ucpmPassageCablerColler(etat, cle, config) {
  var s = config.idSuffixe;
  if (typeof activerCollageInstantane === 'function') {
    activerCollageInstantane({
      idZoneAuto: 'zoneCollageAuto' + s, idZoneApercu: 'zoneApercuCollage' + s,
      idTextarea: 'texteCollage' + s, idBoutonColler: 'btnCollerAuto' + s
    });
  }
  var imp = document.getElementById('btnImporter' + s);
  if (!imp) { return; }
  imp.addEventListener('click', function () {
    var msg = document.getElementById('messageImport' + s);
    if (msg) { msg.textContent = ''; msg.style.color = ''; }
    var ta = document.getElementById('texteCollage' + s);
    var texte = ta ? String(ta.value || '') : '';
    if (!texte.trim()) {
      if (msg) { msg.style.color = 'var(--danger)'; msg.textContent = '⚠️ Collez d’abord la réponse de l’assistant.'; }
      return;
    }
    var r = config.importer(texte);
    if (!r || !r.succes) {
      if (typeof trackEvenement === 'function') { trackEvenement('erreur_import', { document: 'ucpm', raison: (r && r.coupe) ? 'coupee' : 'illisible' }); }
      if (msg) {
        msg.style.color = 'var(--danger)';
        msg.textContent = '⚠️ ' + ((r && r.erreur) || 'La réponse n’a pas pu être lue.') + ' Effacez, retournez chez l’assistant, redemandez sa réponse, copiez-la, puis recollez-la ici avant de recliquer sur « Importer ».';
      }
      return;
    }
    if (typeof _etatTransitionIA !== 'undefined') { _etatTransitionIA = null; }
    clearInterval(_ucpmIntervalleDecompte);
    delete etat.passages[cle];
    config.apresSucces();
  });
}
