/* ============================================================
   Module « Découvrir mes compétences » : écran 2, « L'assistant en ligne », et écrans 3 et 4 (séance C : relecture et document, ici seulement leur état d'attente).
   Le passage avec l'assistant (choisir, « chez l'assistant », coller la réponse) est celui de modules/un-cv-plusieurs-metiers/passageAssistant.js,
   généralisé le 26/10/2026 (options rerendre, attrAssistant, idErreur, nomSuivi) : AUCUNE copie. La réponse n'est jamais montrée : elle passe par le filet (filet.js).
   ============================================================ */

var MESCOMP_ETAPES_CHOIX = [
  { titre: 'Copie', detail: 'Le message est copié automatiquement : vos documents relus et la consigne de l’outil. Rien à écrire vous-même.' },
  { titre: 'Chez l’assistant', detail: 'Vous collez le message et vous attendez sa réponse.' },
  { titre: 'Retour ici', detail: 'Vous copiez toute sa réponse et vous la collez dans cette page.' },
  { titre: 'Votre relecture', detail: 'Vous relisez chaque ligne. Rien n’est gardé avant que vous le décidiez.' }
];

function _mesCompRecapEnvoi(etat) {
  var c = mesCompDocumentsCompter(etat.documents);
  var morceaux = [];
  if (c.cv) { morceaux.push(c.cv + (c.cv > 1 ? ' CV' : ' CV')); }
  if (c.lettreMotivation) { morceaux.push(c.lettreMotivation + ' lettre' + (c.lettreMotivation > 1 ? 's' : '') + ' de motivation'); }
  if (c.recommandation) { morceaux.push(c.recommandation + ' lettre' + (c.recommandation > 1 ? 's' : '') + ' de recommandation'); }
  var niveau = etat.niveau === 'auto' ? 'l’outil propose' : MESCOMP_NIVEAUX_CHOIX.filter(function (n) { return n.id === etat.niveau; })[0].libelle.toLowerCase();
  return '<div class="small mb-2" style="background:var(--accent-bg-subtle);border-radius:8px;padding:.5rem .8rem;text-align:left;"><strong>Ce qui va partir</strong> : ' +
    morceaux.join(', ') + ' (relus et masqués par vous). Niveau du poste : ' + niveau + '.</div>';
}

function _mesCompDocumentsDEnvoi(etat) { return mesCompDocumentsPourEnvoi(etat.documents); }

// Le prompt chargé (voix humaine déjà insérée par l'application) devient le message à copier.
function _mesCompConstruireTexte() {
  var etat = mesCompOuvrir();
  var prompt = (typeof promptsExternesCharges !== 'undefined' && promptsExternesCharges && promptsExternesCharges.mesCompetences) || '';
  if (!prompt) { return Promise.reject(new Error('prompt absent')); }
  return Promise.resolve(mesCompConstruireMessage(mesCompNettoyerPrompt(prompt), _mesCompDocumentsDEnvoi(etat), etat.niveau));
}

// Lecture de la réponse collée : jamais affichée telle quelle, seul le filet décide de ce qui est gardé.
function _mesCompImporter(texte) {
  var etat = mesCompOuvrir();
  var f = MesCompFilet.filtrerReponse(texte, _mesCompDocumentsDEnvoi(etat));
  if (!f.ok) {
    return { succes: false, coupe: f.fatale === 'coupee', erreur: f.fatale === 'coupee' ? 'La réponse s’arrête avant la fin.' : 'Cette réponse n’a pas pu être lue.' };
  }
  if (f.vide) { return { succes: false, erreur: 'Ces documents ne permettent pas encore de relever une compétence. Essayez avec un autre document, ou « À partir de mon récit ».' }; }
  if (!f.competences.length) { return { succes: false, erreur: 'Aucune ligne n’a pu être gardée avec certitude.' }; }
  var suivant = mesCompIntegrerPremierPassage(etat, f);
  suivant.passages = {};
  _mesCompEtat = suivant;
  return { succes: true };
}

function _mesCompConfigPassage() {
  var etat = mesCompOuvrir();
  return {
    idSuffixe: 'McPremier',
    rerendre: mesCompRendrePage,
    attrAssistant: 'data-assistant-mc',
    idErreur: 'mcErreurChoixIA',
    nomSuivi: 'mes_competences',
    recapHtml: _mesCompRecapEnvoi(etat),
    etapes: MESCOMP_ETAPES_CHOIX,
    texteConfidentialite: 'Seuls vos documents relus et masqués partent chez l’assistant : ni votre nom, ni votre adresse, ni votre téléphone.',
    avantEnvoi: function () {
      var prompt = (typeof promptsExternesCharges !== 'undefined' && promptsExternesCharges && promptsExternesCharges.mesCompetences) || '';
      if (!prompt) { return ''; }
      return mesCompMessageTropLong(mesCompConstruireMessage(mesCompNettoyerPrompt(prompt), _mesCompDocumentsDEnvoi(etat), etat.niveau))
        ? 'Vos documents sont trop longs pour un seul envoi. Retirez un document (revenez à « Mes documents ») puis réessayez.' : '';
    },
    construireTexte: _mesCompConstruireTexte,
    importer: _mesCompImporter,
    apresSucces: function () { mesCompAllerEcran('relecture'); }
  };
}

mesCompEnregistrerPage('assistant', {
  rendre: function (etat) { return ucpmPassageRendre(etat, 'premier', _mesCompConfigPassage()); },
  cabler: function (etat) { ucpmPassageCabler(etat, 'premier', _mesCompConfigPassage()); },
  retour: function (etat) { return ucpmPassageRetour(etat, 'premier', mesCompRendrePage); },
  peutContinuer: function (etat) { return etat.lignes.length > 0; },
  raisonBlocage: function () { return 'Collez la réponse de l’assistant pour continuer.'; },
  libelleContinuer: 'Continuer &#8594;'
});

// ---- Écrans 3 et 4 : l'état d'attente (construits à la séance C) ----
function _mesCompHtmlAttente(etat) {
  return '<div class="cv-section"><p class="mb-1"><strong>Nous avons lu ' + etat.lignes.length + ' compétence' + (etat.lignes.length > 1 ? 's' : '') + '.</strong>' +
    (etat.nbEcartees ? ' ' + etat.nbEcartees + ' ligne' + (etat.nbEcartees > 1 ? 's ont' : ' a') + ' été mise' + (etat.nbEcartees > 1 ? 's' : '') + ' de côté pour être sûrs de ne rien inventer.' : '') + '</p>' +
    '<p class="mb-0 text-muted">Cette page est en cours de construction.</p></div>';
}
mesCompEnregistrerPage('relecture', { rendre: _mesCompHtmlAttente, peutContinuer: function () { return false; }, raisonBlocage: function () { return 'Cette page est en cours de construction.'; } });
mesCompEnregistrerPage('document', { rendre: _mesCompHtmlAttente, peutContinuer: function () { return false; } });
