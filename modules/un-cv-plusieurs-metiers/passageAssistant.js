/* ============================================================
   Module « Un CV, plusieurs métiers » : PASSAGE AVEC L'ASSISTANT (une seule implémentation pour les quatre passages du module).
   Règle de Denis (2026-10-08) : AUCUNE nouvelle fenêtre. On assemble ici les composants existants, jamais recopiés :
   htmlChoixAssistantBilanCorps + ouvrirFenetreAssistantIA (choix et copie), htmlBanniereTransitionIA + _etatTransitionIA (« chez l'assistant »),
   htmlCollageUniquePage + brancherCollageUniquePage (décompte, aperçu de la fenêtre du retour et collage de la réponse : la fenêtre commune, dette B.17), recopierTexteAssistantPuisOuvrir.

   Un passage a deux vues, dans l'ordre : 'choix' (choisir l'assistant, le texte est copié) -> 'coller' (décompte puis assistant ouvert, la page reste ouverte ;
   au retour on colle la réponse, « Continuer » en bas). L'ancienne vue 'chez' n'existe plus (2026-10-28) : une session reprise dessus va sur 'coller'.
   Son état vit dans etat.passages[cle] = { vue, assistant } (donnée pure, part dans la disquette).

   config d'un passage :
     titre            titre de la page quand la vue est 'choix' (ex. « Choisir l'assistant »)
     idSuffixe        suffixe des identifiants du collage (ex. 'UcpmMetiers')
     etapes           les quatre temps affichés dans le choix (tableau { titre, detail })
     texteConfidentialite   rappel de ce qui ne part pas
     recapHtml        (à compléter) HTML d'un récapitulatif de ce qui va être envoyé
     construireTexte  function () -> Promise<string> ou string : le texte à copier
     importer         function (texteColle) -> { succes, erreur } : lit la réponse ; si succes, le module enregistre lui-même le résultat
     verifier         (à compléter) function (texteColle) -> booléen : lecture SANS rien enregistrer, pour dire tout de suite si la réponse est lisible (sinon l'échec n'apparaît qu'à « Continuer »)
     module           (à compléter) { libelleSuite, quoi, verif, conseil } : les mots de la fenêtre commune propres au passage
     apresSucces      function () : suite quand la réponse est lue (en général aller à la page suivante)
     nomAssistant     (à compléter) function (assistant) -> texte d'alerte propre à ce passage
     avantEnvoi       (à compléter) function () -> texte : si non vide, la demande n'est pas préparée et ce texte est montré à la place (ex. trop de métiers pour une seule réponse)

   OPTIONS FACULTATIVES (étape 4a de « Découvrir mes compétences », 2026-10-26) : ce passage sert aussi à un autre module. Chacune a pour défaut la valeur
   d'avant, donc les quatre passages de « Un CV, plusieurs métiers » n'ont rien changé :
     rerendre         function () : redessine la page du module (défaut : ucpmRendrePage)
     attrAssistant    attribut des pastilles d'assistant (défaut : data-assistant-ucpm)
     idErreur         identifiant de la zone d'erreur du choix (défaut : ucpmErreurChoixIA)
     nomSuivi         nom du module dans le suivi d'usage (défaut : ucpm)
   Le nom « ucpm » des fonctions reste (renommage = dette notée dans docs/BRIQUES_COMMUNES.md, B.10 / B.17).
   ============================================================ */

// Redessine la page du module qui porte le passage (par défaut celle de « Un CV, plusieurs métiers »).
function _ucpmRerendre(config) {
  if (config && typeof config.rerendre === 'function') { config.rerendre(); return; }
  ucpmRendrePage();
}
function _ucpmOptAttr(config) { return (config && config.attrAssistant) || 'data-assistant-ucpm'; }
function _ucpmOptIdErreur(config) { return (config && config.idErreur) || 'ucpmErreurChoixIA'; }
function _ucpmOptSuivi(config) { return (config && config.nomSuivi) || 'ucpm'; }

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
  clearInterval(_intervalleDecompteIA);
}

// Vue courante. Une session reprise sur l'ancienne vue 'chez' va sur 'coller' ; après un rechargement l'ouverture de l'assistant est perdue,
// mais 'coller' sait s'afficher sans elle (la fenêtre est alors prête à recevoir la réponse).
function ucpmPassageVue(etat, cle) {
  var p = _ucpmEtatPassage(etat, cle);
  if (p.vue === 'chez') { p.vue = 'coller'; }
  return p.vue;
}

// Bouton « Retour » : recule d'une vue du passage ; renvoie true si c'est fait, false quand on est déjà au début du passage.
function ucpmPassageRetour(etat, cle, rerendre) {
  var p = _ucpmEtatPassage(etat, cle);
  clearInterval(_intervalleDecompteIA);
  if (p.vue === 'coller' || p.vue === 'chez') { p.vue = 'choix'; if (typeof _etatTransitionIA !== 'undefined') { _etatTransitionIA = null; } _ucpmRerendre({ rerendre: rerendre }); return true; }
  return false;
}

function ucpmPassageRendre(etat, cle, config) {
  var vue = ucpmPassageVue(etat, cle);
  if (vue === 'coller') { return _ucpmPassageHtmlColler(config); }
  return _ucpmPassageHtmlChoix(config);
}

function ucpmPassageCabler(etat, cle, config) {
  var vue = ucpmPassageVue(etat, cle);
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
      idErreur: _ucpmOptIdErreur(config),
      attrAssistant: _ucpmOptAttr(config),
      etapes: config.etapes,
      texteConfidentialite: config.texteConfidentialite
    }) +
    '</div>';
}

function _ucpmPassageCablerChoix(etat, cle, config) {
  // Revenir sur le choix annule une ouverture en cours.
  if (typeof _etatTransitionIA !== 'undefined' && _etatTransitionIA) { _etatTransitionIA = null; }
  clearInterval(_intervalleDecompteIA);
  Array.prototype.forEach.call(document.querySelectorAll('[' + _ucpmOptAttr(config) + ']'), function (el) {
    el.addEventListener('click', function () {
      var id = el.getAttribute(_ucpmOptAttr(config));
      var assistant = (typeof ASSISTANTS_IA !== 'undefined') ? ASSISTANTS_IA.filter(function (a) { return a.id === id; })[0] : null;
      if (!assistant) { return; }
      if (typeof config.avantEnvoi === 'function') {
        var avis = config.avantEnvoi();
        if (avis) { var za = document.getElementById(_ucpmOptIdErreur(config)); if (za) { za.style.display = 'block'; za.textContent = '⚠️ ' + avis; } return; }
      }
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
            _etatTransitionIA = { urlAssistant: urlAssistant, nomAssistant: nomAssistant, phase: 'decompte', secondesRestantes: DUREE_DECOMPTE_IA_SECONDES };
            p.vue = 'coller';
            _ucpmRerendre(config);
          }
        });
      }).catch(function () {
        var z = document.getElementById(_ucpmOptIdErreur(config));
        if (z) { z.style.display = 'block'; z.textContent = '⚠️ L’application n’a pas pu préparer la demande. Merci de réessayer dans un instant.'; }
      });
    });
  });
}

// ---------- Vue 'coller' (fenetre commune : decompte avec apercu, assistant ouvert, collage de la reponse) ----------

function _ucpmPassageHtmlColler(config) {
  return '<div data-ucpm-vue="coller">' + htmlCollageUniquePage(config.idSuffixe) + '</div>';
}

function _ucpmPassageCablerColler(etat, cle, config) {
  var s = config.idSuffixe;
  var p = _ucpmEtatPassage(etat, cle);
  var module = config.module || {
    libelleSuite: 'Continuer',
    quoi: 'L’assistant vient de répondre à la demande que vous lui avez envoyée.',
    pourquoi: 'Vous gardez la main : rien n’est enregistré sans que vous l’ayez relu.',
    verif: 'relisez ce que l’application a retenu à l’étape suivante : rien n’est définitif, vous pouvez corriger.'
  };
  var controleur = brancherCollageUniquePage({
    suffixe: s, idAncre: 'fcRacine' + s, rerendre: function () { _ucpmRerendre(config); }, evenementBloque: _ucpmOptSuivi(config) + '_popup_bloque',
    module: module,
    verifier: function (texte) {
      // Lecture sans rien enregistrer quand le module sait la faire ; sinon la lecture a lieu à « Continuer ».
      if (typeof config.verifier === 'function') { return { ok: !!config.verifier(texte) }; }
      return { ok: true };
    },
    onChangerAssistant: function () {
      clearInterval(_intervalleDecompteIA);
      if (typeof _etatTransitionIA !== 'undefined') { _etatTransitionIA = null; }
      p.vue = 'choix';
      _ucpmRerendre(config);
    },
    onContinuer: function (texte) {
      if (!String(texte || '').trim()) { return; }
      var r = config.importer(texte);
      if (!r || !r.succes) {
        if (typeof trackEvenement === 'function') { trackEvenement('erreur_import', { document: _ucpmOptSuivi(config), raison: (r && r.coupe) ? 'coupee' : 'illisible' }); }
        var racine = document.getElementById('fcRacine' + s);
        if (racine && racine.__collage) { racine.__collage.aller('echec'); }
        return;
      }
      if (typeof _etatTransitionIA !== 'undefined') { _etatTransitionIA = null; }
      clearInterval(_intervalleDecompteIA);
      delete etat.passages[cle];
      config.apresSucces();
    }
  });
  return controleur;
}
