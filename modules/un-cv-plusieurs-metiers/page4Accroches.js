/* ============================================================
   Module « Un CV, plusieurs métiers » : PAGE 4 « Mes phrases d'accroche ».
   Troisième passage avec l'assistant (prompt prompts/ucpm-accroches.md, version 3, testée au féminin, au masculin et sans sexe) : pour chaque métier coché AUTRE QUE
   le CV de référence, deux accroches COURTES. Le titre est le métier choisi par la personne (modifiable à la page 5), l'assistant ne fournit que les accroches.
   Tout est dans la page : choix de l'assistant, chez l'assistant, collage (passageAssistant.js). Aucun écran de choix des phrases ici : la personne choisit,
   modifie ou écrit la sienne carte par carte, à la page 5.
   Ce qui part : le profil validé du CV de référence (jamais le CV brut, jamais de coordonnées), chaque métier avec son objectif complet, le sexe (accords).
   ============================================================ */

var UCPM_ETAPES_CHOIX_ACCROCHES = [
  { titre: 'Copie', detail: 'Votre CV de référence validé et la liste de vos métiers, chacun avec son objectif, sont copiés automatiquement. Vos coordonnées ne partent jamais.' },
  { titre: 'Propositions', detail: 'L’assistant écrit deux phrases d’accroche courtes par métier, en s’appuyant seulement sur votre CV. Il n’ajoute aucune expérience ni qualité.' },
  { titre: 'Vous collez', detail: 'Vous copiez sa réponse avec son bouton « Copier » et vous la collez ici, en une seule fois.' },
  { titre: 'Votre choix', detail: 'À la page suivante, vous choisissez, modifiez ou écrivez vous-même la phrase de chaque CV.' }
];

function _ucpmP4Entrees(etat) { return ucpmEntreesPourAccroches(etat); }

function _ucpmConfigPassageAccroches(etat) {
  var entrees = _ucpmP4Entrees(etat);
  return {
    idSuffixe: 'UcpmAccroches',
    etapes: UCPM_ETAPES_CHOIX_ACCROCHES,
    texteConfidentialite: 'Seul le profil de votre CV de référence et la liste de vos métiers sont envoyés : votre nom, votre téléphone et votre adresse ne partent pas.',
    recapHtml:
      ucpmHtmlStyleEcriture('cv') +
      '<div class="cv-section recap-contexte-envoi mb-3">' +
      '<p class="mb-1"><strong>&#128203; Ce qui va être envoyé</strong></p>' +
      '<ul class="mb-1" style="padding-left:1.25rem;"><li>Votre <strong>CV de référence validé</strong> (titre, accroche, compétences, expériences, formations), sans vos coordonnées.</li>' +
      '<li>Vos <strong>' + entrees.length + ' autres métiers</strong>, chacun avec son objectif :</li></ul>' +
      '<ul class="small" style="padding-left:2.25rem;">' + entrees.map(function (e) {
        return '<li>' + _ucpmEsc(ucpmNomMetier(e, etat.sexe)) + ' : ' + _ucpmEsc(ucpmEtiquetteObjectif(e.objectif)) + '</li>';
      }).join('') + '</ul></div>',
    construireTexte: function () {
      return ucpmChargerPrompt('ucpm-accroches', 'ucpm-accroches.md').then(function (modele) {
        return ucpmConstruirePromptAccroches(modele, {
          sexe: etat.sexe,
          profil: ucpmConstruireProfilValide(dossier),
          metiers: ucpmBlocMetiersAccroches(entrees, etat.sexe)
        }) + ucpmConsignesStyle('cv');
      });
    },
    importer: function (texte) {
      var r = ucpmLireReponseAccroches(texte, entrees.map(function (e) { return e.id; }));
      if (r.succes) {
        etat.accroches = r.accroches;
        etat.accrochesManquantes = r.manquants;
        etat.accrochesSig = ucpmSignaturesAccroches(etat, ucpmConstruireProfilValide(ucpmDossierVrai()));
        if (typeof trackEvenement === 'function') { trackEvenement('ucpm_accroches_lues', { metiers: Object.keys(r.accroches).length, manquants: r.manquants.length }); }
      }
      return r;
    },
    apresSucces: function () { etat.p4Vue = 'recu'; ucpmAllerPage(5); }
  };
}

// Règle de Retour : ce que la personne a changé depuis la demande est dit ici, sans rien effacer.
function _ucpmP4HtmlPerimees(etat) {
  var p = ucpmAccrochesPerimees(etat, ucpmConstruireProfilValide(ucpmDossierVrai()));
  if (!p.perimees.length && !p.nouveaux.length) { return ''; }
  var noms = function (liste) { return liste.map(function (e) { return _ucpmEsc(ucpmNomMetier(e, etat.sexe)); }).join(', '); };
  return '<div class="cv-section" style="border-left:4px solid var(--warning-strong);" role="status"><p class="mb-1"><strong>Certaines phrases ne correspondent peut-être plus.</strong></p>' +
    (p.perimees.length ? '<p class="small mb-1">Vous avez changé quelque chose (objectif, identité ou CV de référence) depuis la demande. Phrases concernées : ' + noms(p.perimees) + '.</p>' : '') +
    (p.nouveaux.length ? '<p class="small mb-1">Métiers ajoutés depuis la demande, sans phrase : ' + noms(p.nouveaux) + '. Vous pourrez écrire la vôtre à la page suivante.</p>' : '') +
    '<p class="small mb-0">Rien n’est effacé. Pour des phrases à jour, cliquez sur « Refaire la demande » ci-dessous ; sinon, continuez avec celles-ci.</p></div>';
}

function _ucpmP4HtmlRecu(etat) {
  var n = Object.keys(etat.accroches || {}).length;
  var manque = (etat.accrochesManquantes || []).length;
  return '<div class="cv-section"><h4>&#9989; Les phrases d’accroche sont reçues</h4>' +
    '<p class="mb-2">L’assistant a proposé deux phrases courtes pour ' + n + ' métier' + (n > 1 ? 's' : '') + '.' +
    (manque ? ' Pour ' + manque + ' métier' + (manque > 1 ? 's' : '') + ', il n’en a pas proposé : vous pourrez écrire la vôtre à la page suivante.' : '') + '</p>' +
    '<p class="mb-2">Cliquez sur « Continuer » en bas de page pour les voir sur vos CV, ou refaites la demande.</p>' +
    '<button type="button" class="btn btn-outline-secondary" id="btnUcpmRefaireAccroches">Refaire la demande</button></div>';
}

ucpmEnregistrerPage(4, {
  rendre: function (etat) {
    var intro = '<div class="cv-section"><p class="mb-0">Votre CV de référence est validé : il garde son titre et son accroche. Pour chacun de vos autres métiers, l’assistant propose <strong>deux phrases d’accroche courtes</strong>, d’après votre CV validé et l’objectif de chaque métier. Rien n’est inventé : il n’a que votre CV. Le corps de vos CV reste le même.</p></div>';
    if (etat.accroches && etat.p4Vue !== 'passage') { return intro + _ucpmP4HtmlPerimees(etat) + _ucpmP4HtmlRecu(etat); }
    return intro + ucpmPassageRendre(etat, 'accroches', _ucpmConfigPassageAccroches(etat));
  },
  cabler: function (etat) {
    if (etat.accroches && etat.p4Vue !== 'passage') {
      var refaire = document.getElementById('btnUcpmRefaireAccroches');
      if (refaire) {
        refaire.addEventListener('click', function () {
          var faire = function () { etat.p4Vue = 'passage'; ucpmPassageReinitialiser(etat, 'accroches'); ucpmRendrePage(); };
          if (typeof confirmerAction === 'function') {
            confirmerAction('Refaire la demande ?', 'Les phrases déjà reçues seront remplacées par la nouvelle réponse de l’assistant. Les phrases que vous avez choisies ou écrites à la page suivante seront à vérifier.', 'Refaire la demande', 'btn-primary', faire);
          } else { faire(); }
        });
      }
      return;
    }
    ucpmPassageCabler(etat, 'accroches', _ucpmConfigPassageAccroches(etat));
    ucpmCablerStyleEcriture('cv', ucpmRendrePage);
  },
  peutContinuer: function (etat) { return !!etat.accroches && etat.p4Vue !== 'passage'; },
  raisonBlocage: function () { return 'Demandez les phrases d’accroche à l’assistant et collez sa réponse pour continuer.'; },
  continuer: function () { ucpmAllerPage(5); },
  // « Retour » : recule d'une vue du passage ; au début, revient à la page 3 (CV de référence, vue de l'éditeur).
  retour: function (etat) {
    if (etat.p4Vue === 'passage' && ucpmPassageRetour(etat, 'accroches')) { return true; }
    if (etat.p4Vue === 'passage' && etat.accroches) { etat.p4Vue = 'recu'; ucpmRendrePage(); return true; }
    etat.p3Vue = 'editeur';
    return false;
  }
});
