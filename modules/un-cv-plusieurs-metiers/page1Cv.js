/* ============================================================
   Module « Un CV, plusieurs métiers » : PAGE 1 « Mon CV ».
   Déposer le CV avec la fenêtre commune de l'application (ouvrirAssistantDepotCV, la même que « Reformuler mon CV » : dépôt, lecture, relecture et masquage
   s'ouvrent d'eux-mêmes, jamais recopiés), puis premier passage avec l'assistant : les métiers proches (prompt prompts/ucpm-metiers.md, version 5, testée).
   Règle de Denis (2026-10-10, précisée le jour même) : une fenêtre pour déposer et vérifier le CV, comme dans les autres parcours, qui s'ouvre automatiquement ;
   le reste se fait dans la page. Si la personne change de CV sans valider le nouveau, le dernier CV validé reste en place (l'état n'est changé qu'à la validation).
   La page se termine quand la réponse est lue : on passe à la page 2 (la synthèse et le choix des métiers).
   Composants communs réutilisés : voir passageAssistant.js.
   ============================================================ */

// Les quatre temps expliqués dans le choix de l'assistant, pour ce passage.
var UCPM_ETAPES_CHOIX_METIERS = [
  { titre: 'Copie', detail: 'Le texte de votre CV, une fois masqué, est copié automatiquement avec la demande. Vous n’avez rien à écrire.' },
  { titre: 'Propositions', detail: 'L’assistant résume votre CV, propose d’autres noms pour votre métier et d’autres métiers qui utilisent les mêmes compétences.' },
  { titre: 'Vous collez', detail: 'Vous copiez sa réponse avec son bouton « Copier » et vous la collez ici, en une seule fois.' },
  { titre: 'Votre choix', detail: 'Vous cochez les métiers qui vous intéressent. Rien n’est ajouté à votre CV : ce sont seulement des pistes.' }
];

// Charge un des prompts du module : celui que l'application a déjà chargé au démarrage, sinon un chargement direct (ouverture rapide de la page).
function ucpmChargerPrompt(cle, fichier) {
  var deja = (typeof promptsExternesCharges !== 'undefined' && promptsExternesCharges) ? promptsExternesCharges[cle] : null;
  if (deja) { return Promise.resolve(deja); }
  if (typeof fetch !== 'function') { return Promise.reject(new Error('chargement du prompt indisponible')); }
  return fetch('prompts/' + fichier, { cache: 'no-cache' }).then(function (r) {
    if (!r.ok) { throw new Error('prompt introuvable : ' + fichier); }
    return r.text();
  }).then(function (t) {
    var texte = String(t || '').trim();
    if (!texte) { throw new Error('prompt vide : ' + fichier); }
    if (texte.indexOf('{{VOIX_HUMAINE}}') === -1) { return texte; }
    // Fragment commun « voix humaine » (prompts/_voix-humaine.md) : celui déjà chargé par l'application, sinon chargé ici ; s'il manque, le repère disparaît.
    var fragment = (typeof promptsExternesCharges !== 'undefined' && promptsExternesCharges) ? promptsExternesCharges['voix-humaine'] : '';
    var pret = fragment ? Promise.resolve(fragment) : fetch('prompts/_voix-humaine.md', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; });
    return pret.then(function (f) { return texte.replace(/\{\{VOIX_HUMAINE\}\}/g, function () { return String(f || '').trim(); }); });
  });
}

// Configuration du premier passage (passageAssistant.js).
function _ucpmConfigPassageMetiers(etat) {
  return {
    idSuffixe: 'UcpmMetiers',
    etapes: UCPM_ETAPES_CHOIX_METIERS,
    texteConfidentialite: 'Seul le texte de votre CV, une fois masqué, est envoyé : votre nom, votre téléphone et votre adresse ne partent pas.',
    recapHtml:
      '<div class="cv-section recap-contexte-envoi mb-3">' +
      '<p class="mb-1"><strong>&#128203; Ce qui va être envoyé</strong></p>' +
      '<ul class="mb-0" style="padding-left:1.25rem;"><li>Le texte de votre CV, <strong>relu et masqué</strong>.</li>' +
      '<li>La demande : résumer votre CV et proposer d’autres noms pour votre métier et d’autres métiers proches.</li></ul></div>',
    construireTexte: function () {
      return ucpmChargerPrompt('ucpm-metiers', 'ucpm-metiers.md').then(function (modele) {
        return ucpmConstruirePromptMetiers(modele, { cv: etat.texteCV });
      });
    },
    importer: function (texte) {
      var r = ucpmLireReponseMetiers(texte);
      if (r.succes) {
        etat.reponseMetiers = r.valeurs;
        etat.intitules = null;   // les colonnes de la page 2 sont reconstruites à partir de cette nouvelle réponse
        etat.autres = null;
        if (typeof trackEvenement === 'function') {
          trackEvenement('ucpm_metiers_lus', { intitules: r.valeurs.intitulesMemeMetier.length, metiers: r.valeurs.autresMetiers.length });
        }
      }
      return r;
    },
    apresSucces: function () { etat.p1Vue = 'depot'; ucpmAllerPage(2); }
  };
}

// Échappement du contenu d'un <textarea> (pas d'attribut).
function echapperTexteUcpm(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Ouvre la fenêtre commune de dépôt (dépôt + relecture + masquage automatiques) et ne garde le texte qu'une fois relu et validé : tant que la personne n'a pas validé,
// le CV précédent reste en place avec tout ce qui en découle.
function _ucpmOuvrirDepotCV(etat) {
  if (typeof ouvrirAssistantDepotCV !== 'function') { return; }
  ouvrirAssistantDepotCV('maj', {
    titreDocument: 'CV',
    onDocumentPrepare: function (res) {
      var valeur = res && (res.valeur != null ? res.valeur : res.texte);
      if (typeof valeur === 'string' && valeur.trim()) {
        var change = valeur !== etat.texteCV;
        etat.texteCV = valeur;
        etat.cvNom = (res && res.nomFichier) ? String(res.nomFichier) : '';
        etat.cvRelu = true;
        // Un autre texte rend périmé ce qui venait de l'ancien : on repart du premier passage.
        if (change) {
          etat.reponseMetiers = null;
          etat.intitules = null;
          etat.autres = null;
          ucpmPassageReinitialiser(etat, 'metiers');
        }
        if (typeof trackEvenement === 'function') { trackEvenement('ucpm_cv_depose'); }
      }
      ucpmRendrePage();
    }
  });
}

// ---------------- Vue 'depot' : les deux cartes ----------------

function _ucpmHtmlP1Depot(etat) {
  var pret = !!(etat.cvRelu && String(etat.texteCV || '').trim());
  var carte1;
  if (pret) {
    carte1 = '<p class="mb-2"><strong>&#9989; Votre CV est prêt</strong> (relu et masqué' + (etat.cvNom ? ' : ' + echapperAttribut(etat.cvNom) : '') + ').</p>' +
      '<details class="mt-2"><summary style="cursor:pointer;">Voir le texte qui sera envoyé à l’assistant</summary>' +
      '<textarea class="form-control mt-2" rows="8" readonly aria-label="Texte du CV relu et masqué">' + echapperTexteUcpm(etat.texteCV) + '</textarea></details>' +
      '<div class="mt-2"><button type="button" class="btn btn-outline-secondary" id="btnUcpmDeposerAutre">Déposer un autre CV</button></div>';
  } else {
    carte1 = '<p>Déposez votre CV (PDF, Word, texte ou photo). Une fenêtre s’ouvre pour le déposer, puis pour le relire et masquer votre nom, votre adresse et vos coordonnées : rien de personnel n’est envoyé à l’assistant en ligne.</p>' +
      '<button type="button" class="btn btn-primary" id="btnUcpmDeposer">Déposer mon CV</button>';
  }
  var recu = !!etat.reponseMetiers;
  var carte2 =
    '<p>L’assistant lit votre CV masqué. Il vous propose d’autres noms pour votre métier, et d’autres métiers qui utilisent les mêmes compétences. Vous choisirez ensuite : il ne décide rien à votre place.</p>' +
    (recu
      ? '<p class="mb-2"><strong>&#9989; Les métiers sont reçus.</strong> Cliquez sur « Continuer » en bas de page, ou refaites la demande.</p>' +
        '<button type="button" class="btn btn-outline-secondary" id="btnUcpmRefaireMetiers">Refaire la demande</button>'
      : '<button type="button" class="btn btn-primary" id="btnUcpmVersAssistant"' + (pret ? '' : ' disabled title="Déposez d’abord votre CV."') + '>Choisir mon assistant &#8594;</button>');
  return '<div class="cv-section"><h4>&#128196; 1. Déposer mon CV</h4>' + carte1 + '</div>' +
    '<div class="cv-section"><h4>&#129517; 2. Demander à l’assistant les métiers proches</h4>' + carte2 + '</div>';
}

ucpmEnregistrerPage(1, {
  rendre: function (etat) {
    if (etat.p1Vue === 'passage') { return ucpmPassageRendre(etat, 'metiers', _ucpmConfigPassageMetiers(etat)); }
    return _ucpmHtmlP1Depot(etat);
  },
  cabler: function (etat) {
    if (etat.p1Vue === 'passage') { ucpmPassageCabler(etat, 'metiers', _ucpmConfigPassageMetiers(etat)); return; }
    var dep = document.getElementById('btnUcpmDeposer');
    if (dep) { dep.addEventListener('click', function () { _ucpmOuvrirDepotCV(etat); }); }
    var autre = document.getElementById('btnUcpmDeposerAutre');
    if (autre) {
      autre.addEventListener('click', function () {
        var ouvrir = function () { _ucpmOuvrirDepotCV(etat); };
        if (etat.reponseMetiers && typeof confirmerAction === 'function') {
          confirmerAction('Déposer un autre CV ?', 'Si vous validez un autre CV, les métiers proposés pour votre CV actuel seront effacés : vous les redemanderez pour le nouveau CV. Tant que vous ne validez pas, votre CV actuel reste en place.', 'Déposer un autre CV', 'btn-primary', ouvrir);
        } else { ouvrir(); }
      });
    }
    var vers = document.getElementById('btnUcpmVersAssistant');
    if (vers && !vers.disabled) { vers.addEventListener('click', function () { etat.p1Vue = 'passage'; ucpmPassageReinitialiser(etat, 'metiers'); ucpmRendrePage(); }); }
    var refaire = document.getElementById('btnUcpmRefaireMetiers');
    if (refaire) {
      refaire.addEventListener('click', function () {
        var faire = function () { etat.reponseMetiers = null; etat.intitules = null; etat.autres = null; etat.p1Vue = 'passage'; ucpmPassageReinitialiser(etat, 'metiers'); ucpmRendrePage(); };
        if (typeof confirmerAction === 'function') {
          confirmerAction('Refaire la demande ?', 'Les métiers déjà reçus seront remplacés par la nouvelle réponse de l’assistant. Vos choix des pages suivantes seront à vérifier.', 'Refaire la demande', 'btn-primary', faire);
        } else { faire(); }
      });
    }
  },
  // « Retour » : recule d'une vue du passage ; au début du passage, revient au dépôt ; au dépôt, quitte vers la présentation (géré par index.js).
  retour: function (etat) {
    if (etat.p1Vue !== 'passage') { return false; }
    if (ucpmPassageRetour(etat, 'metiers')) { return true; }
    etat.p1Vue = 'depot';
    ucpmRendrePage();
    return true;
  },
  peutContinuer: function (etat) { return etat.p1Vue === 'depot' && !!etat.reponseMetiers; },
  raisonBlocage: function (etat) {
    if (!etat.cvRelu) { return 'Déposez votre CV, puis demandez les métiers à l’assistant pour continuer.'; }
    return 'Demandez les métiers à l’assistant et collez sa réponse pour continuer.';
  },
  continuer: function () { ucpmAllerPage(2); }
});
