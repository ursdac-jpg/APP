/* ============================================================
   Module « Un CV, plusieurs métiers » : PAGE 6 « Mes lettres de motivation ».
   Quatrième passage avec l'assistant (prompt prompts/ucpm-lettres.md, version 7 NON TESTÉE sur un vrai assistant, la version 6 l'est) : UNE réponse contient une lettre par CV choisi.
   Tout est dans la page (passageAssistant.js) : choix des CV par leur nom (tous cochés au départ, l'objectif de chacun visible), choix de l'assistant, chez l'assistant, collage,
   puis lecture et modification des lettres, une à la fois, avec un sélecteur.
   Ce que l'application impose : la formule d'appel (« Madame Martin, » si le recruteur est connu, sinon « Madame, Monsieur, ») et la signature (prénom et nom de l'identité
   choisie à la page 3) ; l'assistant ne signe pas. Ce qui part : le profil validé du CV de référence (jamais le CV brut, jamais de coordonnées) et, pour chaque CV choisi,
   son titre, sa phrase d'accroche et tout son objectif.
   Les lettres sont gardées dans une liste propre au module (etat.lettres), jamais dans dossier.lettreMotivation qui est unique. Rien n'est supprimé en revenant en arrière.
   ============================================================ */

var UCPM_ETAPES_CHOIX_LETTRES = [
  { titre: 'Copie', detail: 'Votre CV de référence validé et, pour chaque CV choisi, son titre, sa phrase d’accroche et son objectif sont copiés automatiquement. Vos coordonnées ne partent jamais.' },
  { titre: 'Propositions', detail: 'L’assistant écrit une lettre par CV, qui suit l’objectif de ce CV. Il s’appuie seulement sur votre CV et n’invente rien.' },
  { titre: 'Vous collez', detail: 'Vous copiez sa réponse avec son bouton « Copier » et vous la collez ici, en une seule fois.' },
  { titre: 'Vous relisez', detail: 'Vous lisez chaque lettre et vous la modifiez comme vous voulez. Votre nom est ajouté en bas par l’application.' }
];

var UCPM_PLACEHOLDER_LETTRE = 'L’assistant n’a pas écrit de lettre pour ce CV. Vous pouvez écrire la vôtre ici, ou refaire la demande.';

function _ucpmP6Titre(etat, e) { var cv = etat.cvs && etat.cvs[e.id]; return (cv && cv.titre) || ucpmNomMetier(e, etat.sexe); }
// « CV 1 : Peintre applicatrice » : le numero et l'intitule choisi pour ce CV (page 5) ; « CV 1 » seul tant que l'intitule n'est pas choisi (Denis, 24/10/2026).
// Une seule fonction pour toutes les pages du module (a echapper par l'appelant).
function ucpmLibelleCv(etat, e) {
  var cv = etat.cvs && etat.cvs[e.id];
  var titre = cv && typeof cv.titre === 'string' ? cv.titre.trim() : '';
  return 'CV ' + _ucpmP6Numero(etat, e.id) + (titre ? ' : ' + titre : '');
}
function _ucpmP6Accroche(etat, e) { var cv = etat.cvs && etat.cvs[e.id]; return (cv && cv.accroche) || ''; }
function _ucpmP6Numero(etat, id) {
  var liste = ucpmEntreesCochees(etat);
  for (var i = 0; i < liste.length; i++) { if (liste[i].id === id) { return i + 1; } }
  return 0;
}

// Les CV pour lesquels une lettre est demandée : tous les CV, ou ceux que la personne a gardés cochés.
function _ucpmP6Choisies(etat) {
  var cochees = ucpmEntreesCochees(etat);
  if (!Array.isArray(etat.lettresIds)) { return cochees; }
  var gardees = cochees.filter(function (e) { return etat.lettresIds.indexOf(e.id) >= 0; });
  return gardees.length ? gardees : cochees;
}

// Les lettres qui existent (texte non vide) pour un CV encore coché.
function _ucpmP6LettresExistantes(etat) {
  return ucpmEntreesCochees(etat).filter(function (e) { return !!(etat.lettres && String(etat.lettres[e.id] || '').trim()); });
}

function _ucpmP6NomSignature() { var v = ucpmDossierVrai(); return ucpmNomComplet(v && v.identite); }

// ---------------- Choix des CV (dans le récapitulatif du passage) ----------------

function _ucpmP6HtmlChoixCv(etat) {
  var cochees = ucpmEntreesCochees(etat);
  var choisies = _ucpmP6Choisies(etat).map(function (e) { return e.id; });
  return '<div class="cv-section recap-contexte-envoi mb-3">' +
    '<fieldset style="border:0;padding:0;margin:0;"><legend class="mb-1" style="font-size:1rem;font-weight:600;float:none;">&#9993;&#65039; Pour quels CV voulez-vous une lettre ?</legend>' +
    '<p class="small mb-2" style="color:var(--text-muted);">Tous sont cochés. Décochez un CV dont vous n’avez pas besoin de lettre. L’assistant écrit toutes les lettres d’un coup, en suivant l’objectif de chaque CV.</p>' +
    cochees.map(function (e) {
      return '<label style="display:flex;gap:.5rem;align-items:flex-start;cursor:pointer;margin:0 0 .4rem 0;">' +
        '<input type="checkbox" style="margin-top:.3rem;" data-ucpm-lettre-cv="' + e.id + '"' + (choisies.indexOf(e.id) >= 0 ? ' checked' : '') + '>' +
        '<span style="flex:1;min-width:0;"><strong>' + _ucpmEsc(ucpmLibelleCv(etat, e)) + '</strong><br>' +
        '<span class="small" style="color:var(--text-muted);">' + _ucpmEsc(ucpmEtiquetteObjectif(e.objectif)) +
        (etat.lettres && String(etat.lettres[e.id] || '').trim() ? ' &#183; une lettre existe déjà, elle sera remplacée' : '') + '</span></span></label>';
    }).join('') +
    '<p class="small mb-0" id="ucpmP6AvisChoix" style="color:var(--warning-strong);" hidden>Gardez au moins un CV coché.</p></fieldset></div>';
}

function _ucpmP6CablerChoixCv(etat) {
  Array.prototype.forEach.call(document.querySelectorAll('[data-ucpm-lettre-cv]'), function (el) {
    el.addEventListener('change', function () {
      var cases = Array.prototype.slice.call(document.querySelectorAll('[data-ucpm-lettre-cv]'));
      var ids = cases.filter(function (c) { return c.checked; }).map(function (c) { return c.getAttribute('data-ucpm-lettre-cv'); });
      if (!ids.length) {
        el.checked = true;
        var avis = document.getElementById('ucpmP6AvisChoix');
        if (avis) { avis.hidden = false; }
        return;
      }
      var avis2 = document.getElementById('ucpmP6AvisChoix');
      if (avis2) { avis2.hidden = true; }
      etat.lettresIds = ids.length === cases.length ? null : ids;
    });
  });
}

// ---------------- Passage avec l'assistant ----------------

// La lettre de recommandation de référence (la même que pour la lettre seule et le CV, stock commun), à la fin du message ; rien si la personne a dit « Non » ou n'en a pas déposé.
function _ucpmP6SectionRecommandation() {
  var section = (typeof sectionRecommandationPourMessage === 'function') ? sectionRecommandationPourMessage() : '';
  return section ? '\n\n' + section : '';
}

function _ucpmConfigPassageLettres(etat) {
  var entrees = _ucpmP6Choisies(etat);
  return {
    idSuffixe: 'UcpmLettres',
    etapes: UCPM_ETAPES_CHOIX_LETTRES,
    texteConfidentialite: 'Seul le profil de votre CV de référence et les informations de chaque CV choisi sont envoyés : votre nom, votre téléphone et votre adresse ne partent pas.',
    recapHtml: ucpmHtmlStyleEcriture('lettre') + _ucpmP6HtmlChoixCv(etat),
    construireTexte: function () {
      return ucpmChargerPrompt('ucpm-lettres', 'ucpm-lettres.md').then(function (modele) {
        return ucpmConstruirePromptLettres(modele, {
          sexe: etat.sexe,
          profil: ucpmConstruireProfilValide(ucpmDossierVrai()),
          cvs: ucpmBlocCvLettres(entrees.map(function (e) {
            return { titre: _ucpmP6Titre(etat, e), accroche: _ucpmP6Accroche(etat, e), objectif: e.objectif };
          }))
        }) + ucpmConsignesStyle('lettre') + _ucpmP6SectionRecommandation();
      });
    },
    importer: function (texte) {
      var r = ucpmLireReponseLettres(texte, entrees.map(function (e) { return e.id; }));
      if (r.succes) {
        var pretes = ucpmPreparerLettresRecues(r.lettres, entrees, _ucpmP6NomSignature());
        etat.lettres = ucpmFusionnerLettres(etat.lettres, pretes);
        etat.lettresOrigine = ucpmFusionnerLettres(etat.lettresOrigine, pretes);
        etat.lettresManquantes = r.manquants;
        var recues = entrees.filter(function (e) { return !!pretes[e.id]; });
        etat.lettresSig = Object.assign({}, etat.lettresSig, ucpmSignaturesLettres(etat, recues, ucpmConstruireProfilValide(ucpmDossierVrai()), _ucpmP6NomSignature()));
        etat.lettreSel = entrees[0] ? entrees[0].id : '';
        if (typeof trackEvenement === 'function') { trackEvenement('ucpm_lettres_lues', { lettres: Object.keys(r.lettres).length, manquants: r.manquants.length }); }
      }
      return r;
    },
    apresSucces: function () { etat.p6Vue = 'lecture'; ucpmRendrePage(); }
  };
}

// ---------------- Lecture et modification ----------------

function _ucpmP6HtmlSelecteur(etat, cochees) {
  return '<div class="d-flex flex-wrap gap-2 mb-3" role="group" aria-label="Choisir la lettre à lire">' + cochees.map(function (e) {
    var a = !!String((etat.lettres && etat.lettres[e.id]) || '').trim();
    var actif = etat.lettreSel === e.id;
    return '<button type="button" class="btn btn-sm ' + (actif ? 'btn-primary' : 'btn-outline-primary') + '" data-ucpm-lettre-sel="' + e.id + '" data-ucpm-pastille-base="' + _ucpmEsc(ucpmLibelleCv(etat, e)) + '" aria-pressed="' + (actif ? 'true' : 'false') + '">' +
      '' + _ucpmEsc(ucpmLibelleCv(etat, e)) + (a ? '' : ' (à écrire)') + '</button>';
  }).join('') + '</div>';
}

function _ucpmP6HtmlLettre(etat, e) {
  var texte = String((etat.lettres && etat.lettres[e.id]) || '');
  var origine = String((etat.lettresOrigine && etat.lettresOrigine[e.id]) || '');
  var avant = String((etat.lettresAvant && etat.lettresAvant[e.id]) || '');
  var modifiee = !!origine && texte !== origine;
  var mots = ucpmNombreMots(texte);
  var formule = ucpmFormuleAppel(e.objectif).replace(/,$/, '');
  return '<div class="cv-section" data-ucpm-lettre="' + e.id + '">' +
    '<p class="mb-1"><strong>Lettre du ' + _ucpmEsc(ucpmLibelleCv(etat, e)) + '</strong></p>' +
    '<p class="small mb-2" style="color:var(--text-muted);">' + _ucpmEsc(ucpmEtiquetteObjectif(e.objectif)) + ' &#183; adressée à : ' + _ucpmEsc(formule) + (e.objectif && e.objectif.employeur ? ' (' + _ucpmEsc(e.objectif.employeur) + ')' : '') + '</p>' +
    '<label class="visually-hidden" for="ucpmTexteLettre">Texte de la lettre</label>' +
    '<textarea class="form-control" id="ucpmTexteLettre" rows="18" data-ucpm-lettre-texte="' + e.id + '" placeholder="' + UCPM_PLACEHOLDER_LETTRE + '">' + echapperTexteUcpm(texte) + '</textarea>' +
    '<p class="small mt-1 mb-1" style="color:var(--text-muted);"><span id="ucpmP6Mots">' + mots + '</span> mots</p>' +
    '<p class="small mb-2" id="ucpmP6Longue" style="color:var(--warning-strong);"' + (ucpmLettreLongue(texte) ? '' : ' hidden') + '>Cette lettre est longue : elle risque de passer sur deux pages une fois imprimée. Pensez à la raccourcir pour qu’elle tienne sur une page.</p>' +
    '<div class="d-flex flex-wrap gap-2">' +
    (origine ? '<button type="button" class="btn btn-outline-secondary btn-sm" data-ucpm-lettre-origine="' + e.id + '"' + (modifiee ? '' : ' disabled') + '>Remettre la lettre reçue</button>' : '') +
    (avant && avant !== texte ? '<button type="button" class="btn btn-outline-secondary btn-sm" data-ucpm-lettre-avant="' + e.id + '">Revenir à la lettre d’avant</button>' : '') +
    (texte.trim() ? '<button type="button" class="btn btn-primary btn-sm" data-ucpm-lettre-retravail="' + e.id + '">Retravailler cette lettre avec l’assistant</button>' : '') +
    '</div>' +
    (texte.trim() ? '<p class="small mt-2 mb-0" style="color:var(--text-muted);">Vos modifications faites ici partent avec la demande : l’assistant retravaille la lettre que vous voyez.</p>' : '') + '</div>';
}

// ---------------- Modèle de lettre (24/10/2026) : les cinq modèles de la lettre seule, le même pour toutes les lettres, couleur et police de chaque CV ----------------

var UCPM_DESCRIPTIONS_MODELES_LETTRE = {
  g0: 'Classique, tout en noir et blanc. Passe partout.',
  g1: 'Votre nom et un filet dans la couleur de votre CV.',
  g2: 'Vos informations dans une colonne de la couleur de votre CV, pleine hauteur.',
  g3: 'Votre nom et vos informations dans un bandeau de la couleur de votre CV.',
  g4: 'Grand titre, puis vos informations personnelles à côté de la lettre.'
};
var _ucpmP6MinuteurModeles = null;
var _ucpmP6JetonModeles = 0;

function _ucpmP6ModeleActif(etat) { return gabaritLettreCo(etat.modeleLettre).id; }

function _ucpmP6HtmlModeles(etat) {
  var actif = _ucpmP6ModeleActif(etat);
  return '<div class="cv-section" id="ucpmModelesLettre"><h4>&#127912; Modèle de lettre (le même pour toutes vos lettres)</h4>' +
    '<p class="small mb-2" style="color:var(--text-muted);">Chaque lettre prend la couleur et la police de son CV. Vos informations sont mises en valeur dans la colonne, le bandeau ou le titre.</p>' +
    '<div class="d-flex flex-wrap gap-3" role="group" aria-label="Modèle de lettre">' + GABARITS_LETTRE_CO.map(function (g) {
      return '<button type="button" class="ucpm-modele-lettre" data-ucpm-modele="' + g.id + '" aria-pressed="' + (g.id === actif ? 'true' : 'false') + '" ' +
        'style="flex:1 1 11rem;max-width:15rem;text-align:left;font:inherit;color:inherit;background:var(--bg-surface);padding:.5rem;border-radius:10px;cursor:pointer;border:2px solid ' + (g.id === actif ? 'var(--primary)' : 'var(--border)') + ';">' +
        '<div class="ucpm-mini-lettre" data-ucpm-mini="' + g.id + '" style="position:relative;aspect-ratio:210/297;overflow:hidden;border:1px solid var(--border);background:#fff;margin:0 0 .4rem;">' +
        '<span class="small" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#666;">Aperçu en cours…</span></div>' +
        '<strong>' + _ucpmEsc(g.nom) + '</strong><br><span class="small" style="color:var(--text-muted);">' + _ucpmEsc(UCPM_DESCRIPTIONS_MODELES_LETTRE[g.id] || '') + '</span></button>';
    }).join('') + '</div>' +
    '<p class="small mt-2 mb-0" id="ucpmAvisWordModele" style="color:var(--warning-strong);"' + (gabaritLettreCo(actif).wordFidele ? ' hidden' : '') + '>' +
    '&#9888;&#65039; Avec ce modèle, le Word s’écarte du PDF (la colonne colorée ne couvre que la première page) : il est recommandé d’enregistrer en PDF.</p></div>';
}

// Montre une lettre rendue (css + html) dans un compartiment étanche, réduite à la largeur de son cadre (une page A4 fait 794 px de large).
function _ucpmP6MonterApercu(cadre, feuille) {
  var hote = cadre.querySelector('.ucpm-hote-lettre');
  if (!hote) {
    cadre.innerHTML = '<div class="ucpm-hote-lettre" style="position:absolute;left:0;top:0;width:794px;transform-origin:top left;"></div>';
    hote = cadre.querySelector('.ucpm-hote-lettre');
  }
  var racine = hote.shadowRoot || hote.attachShadow({ mode: 'open' });
  racine.innerHTML = '<style>' + feuille.css + '</style>' + feuille.html;
  hote.style.transform = 'scale(' + (cadre.clientWidth / 794) + ')';
}

// Remplit les cinq aperçus avec la lettre en cours de lecture, un modèle après l'autre (le rendu des lettres se fait un à la fois). Un jeton écarte les rendus devenus inutiles.
function _ucpmP6RemplirModeles(etat) {
  var jeton = ++_ucpmP6JetonModeles;
  var cochees = ucpmEntreesCochees(etat);
  var courante = cochees.filter(function (e) { return e.id === etat.lettreSel; })[0];
  if (!courante || !String((etat.lettres && etat.lettres[courante.id]) || '').trim()) { return; }
  var suite = Promise.resolve();
  GABARITS_LETTRE_CO.forEach(function (g) {
    suite = suite.then(function () {
      if (jeton !== _ucpmP6JetonModeles) { return null; }
      return ucpmRendreLettre(etat, courante, g.id).then(function (feuille) {
        var cadre = document.querySelector('[data-ucpm-mini="' + g.id + '"]');
        if (jeton === _ucpmP6JetonModeles && cadre) { _ucpmP6MonterApercu(cadre, feuille); }
      }, function () {
        var cadreErreur = document.querySelector('[data-ucpm-mini="' + g.id + '"]');
        if (jeton === _ucpmP6JetonModeles && cadreErreur) { cadreErreur.innerHTML = '<span class="small" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#666;">Aperçu indisponible</span>'; }
      });
    });
  });
}

function _ucpmP6ProgrammerModeles(etat) {
  clearTimeout(_ucpmP6MinuteurModeles);
  _ucpmP6MinuteurModeles = setTimeout(function () { _ucpmP6RemplirModeles(etat); }, 800);
}

function _ucpmP6CablerModeles(etat) {
  Array.prototype.forEach.call(document.querySelectorAll('[data-ucpm-modele]'), function (el) {
    el.addEventListener('click', function () {
      etat.modeleLettre = el.getAttribute('data-ucpm-modele');
      Array.prototype.forEach.call(document.querySelectorAll('[data-ucpm-modele]'), function (b) {
        var actif = b === el;
        b.setAttribute('aria-pressed', actif ? 'true' : 'false');
        b.style.borderColor = actif ? 'var(--primary)' : 'var(--border)';
      });
      var avis = document.getElementById('ucpmAvisWordModele');
      if (avis) { avis.hidden = gabaritLettreCo(etat.modeleLettre).wordFidele; }
      if (typeof trackEvenement === 'function') { trackEvenement('ucpm_modele_lettre', { modele: etat.modeleLettre }); }
    });
  });
  _ucpmP6RemplirModeles(etat);
}

// ---------------- La suite des lettres (24/10/2026) : l'assistant écrit 5 lettres à la fois ----------------
// Au-delà de 5 CV, il donne d'abord les lettres des CV 1 à 5 puis dit de lui répondre « oui » pour la suite (prompts/ucpm-lettres.md). La personne colle ici chaque nouvelle
// réponse : les lettres reçues s'ajoutent, aucune lettre déjà là (ni modifiée par la personne) n'est remplacée.

// Les CV choisis pour lesquels il n'y a pas encore de lettre, quand la demande a été faite en plusieurs groupes (plus de 5 CV) ; liste vide sinon.
function _ucpmP6EnAttenteDeSuite(etat) {
  var choisies = _ucpmP6Choisies(etat);
  var ids = ucpmIdsEnAttenteDeSuite(choisies.map(function (e) { return e.id; }), etat.lettres);
  return choisies.filter(function (e) { return ids.indexOf(e.id) >= 0; });
}

function _ucpmP6HtmlSuite(etat) {
  var attente = _ucpmP6EnAttenteDeSuite(etat);
  if (!attente.length) { return ''; }
  var choisies = _ucpmP6Choisies(etat);
  var recues = choisies.length - attente.length;
  return '<div class="cv-section" id="ucpmSuiteLettres" role="status" style="border-left:4px solid var(--warning-strong);background:var(--warning-bg-subtle);">' +
    '<p class="mb-1"><strong>&#9888;&#65039; Il y a une suite : ' + recues + ' lettre' + (recues > 1 ? 's' : '') + ' reçue' + (recues > 1 ? 's' : '') + ' sur ' + choisies.length + '. Allez sur la page de l’assistant pour récupérer la suite.</strong></p>' +
    '<p class="small mb-2">L’assistant écrit les lettres par groupes de ' + UCPM_LETTRES_PAR_REPONSE + '. Pour recevoir ' + (attente.length > 1 ? 'les ' + attente.length + ' lettres qui restent' : 'la lettre qui reste') + ' : retournez sur la page de l’assistant, écrivez-lui <strong>oui</strong>, copiez sa réponse avec son bouton « Copier », puis collez-la ci-dessous. Rien de ce que vous avez déjà reçu n’est remplacé. Vous pouvez aussi continuer avec les lettres déjà reçues.</p>' +
    '<label class="visually-hidden" for="ucpmSuiteTexte">Réponse de l’assistant avec la suite des lettres</label>' +
    '<textarea class="form-control mb-2" id="ucpmSuiteTexte" rows="4" placeholder="Collez ici la suite de la réponse de l’assistant"></textarea>' +
    '<p class="small mb-2" id="ucpmSuiteMessage" role="status" style="color:var(--danger);" hidden></p>' +
    '<button type="button" class="btn btn-primary btn-sm" id="btnUcpmSuiteLettres">Récupérer la suite</button></div>';
}

function _ucpmP6CablerSuite(etat) {
  var bouton = document.getElementById('btnUcpmSuiteLettres');
  if (!bouton) { return; }
  bouton.addEventListener('click', function () {
    var message = document.getElementById('ucpmSuiteMessage');
    var entrees = _ucpmP6Choisies(etat);
    var r = ucpmLireReponseLettres(document.getElementById('ucpmSuiteTexte').value, entrees.map(function (e) { return e.id; }));
    if (!r.succes) { message.textContent = r.erreur; message.hidden = false; return; }
    // Seules les lettres des CV qui n'en ont pas encore sont ajoutées.
    var nouvelles = {};
    Object.keys(r.lettres).forEach(function (id) { if (!String((etat.lettres && etat.lettres[id]) || '').trim()) { nouvelles[id] = r.lettres[id]; } });
    if (!Object.keys(nouvelles).length) {
      message.textContent = 'Cette réponse ne contient aucune lettre nouvelle. Vérifiez que vous avez copié la réponse qui suit votre « oui ».';
      message.hidden = false;
      return;
    }
    var pretes = ucpmPreparerLettresRecues(nouvelles, entrees, _ucpmP6NomSignature());
    etat.lettres = ucpmFusionnerLettres(etat.lettres, pretes);
    etat.lettresOrigine = ucpmFusionnerLettres(etat.lettresOrigine, pretes);
    var recues = entrees.filter(function (e) { return !!pretes[e.id]; });
    etat.lettresSig = Object.assign({}, etat.lettresSig, ucpmSignaturesLettres(etat, recues, ucpmConstruireProfilValide(ucpmDossierVrai()), _ucpmP6NomSignature()));
    etat.lettresManquantes = _ucpmP6EnAttenteDeSuite(etat).map(function (e) { return e.id; });
    if (typeof trackEvenement === 'function') { trackEvenement('ucpm_lettres_suite', { lettres: Object.keys(pretes).length, restantes: etat.lettresManquantes.length }); }
    ucpmRendrePage();
  });
}

// Règle de Retour : les lettres dont ce qui avait été envoyé a changé depuis (objectif, identité, titre, phrase d'accroche, CV de référence) sont signalées, sans rien effacer.
function _ucpmP6Perimees(etat) { return ucpmLettresPerimees(etat, ucpmConstruireProfilValide(ucpmDossierVrai()), _ucpmP6NomSignature()); }

function _ucpmP6HtmlPerimees(etat) {
  var p = _ucpmP6Perimees(etat);
  if (!p.length) { return ''; }
  return '<div class="cv-section" style="border-left:4px solid var(--warning-strong);" role="status"><p class="mb-1"><strong>' + (p.length > 1 ? 'Certaines lettres ne correspondent peut-être plus.' : 'Une lettre ne correspond peut-être plus.') + '</strong></p>' +
    '<p class="small mb-1">Vous avez changé quelque chose depuis la demande (objectif, identité, titre ou phrase d’accroche, CV de référence). Lettres concernées : ' +
    p.map(function (e) { return _ucpmEsc(ucpmLibelleCv(etat, e)); }).join(', ') + '.</p>' +
    '<p class="small mb-2">Rien n’est effacé : vos lettres restent telles quelles tant que vous ne refaites pas la demande.</p>' +
    '<button type="button" class="btn btn-outline-primary btn-sm" id="btnUcpmRefairePerimees">Refaire ' + (p.length > 1 ? 'ces lettres' : 'cette lettre') + '</button></div>';
}

function _ucpmP6HtmlLecture(etat) {
  var cochees = ucpmEntreesCochees(etat);
  if (!etat.lettreSel || !cochees.some(function (e) { return e.id === etat.lettreSel; })) { etat.lettreSel = cochees[0] ? cochees[0].id : ''; }
  var courante = cochees.filter(function (e) { return e.id === etat.lettreSel; })[0];
  var sansLettre = cochees.filter(function (e) { return !String((etat.lettres && etat.lettres[e.id]) || '').trim(); });
  return '<div class="cv-section"><p class="mb-1">Voici une lettre par CV. Chacune commence par la formule d’appel et finit par votre nom, ajoutés par l’application.</p>' +
    '<p class="mb-0 small" style="color:var(--text-muted);">Relisez-les et modifiez-les comme vous voulez : ce que vous voyez ici est ce qui sera imprimé. Une lettre doit tenir sur une page.</p></div>' +
    _ucpmP6HtmlPerimees(etat) +
    _ucpmP6HtmlSuite(etat) +
    _ucpmP6HtmlSelecteur(etat, cochees) +
    _ucpmP6HtmlModeles(etat) +
    (courante ? _ucpmP6HtmlLettre(etat, courante) : '') +
    (sansLettre.length && !_ucpmP6EnAttenteDeSuite(etat).length
      ? '<div class="cv-section" style="border-left:4px solid var(--warning-strong);"><p class="mb-0 small">' + sansLettre.length + ' CV ' + (sansLettre.length > 1 ? 'n’ont' : 'n’a') + ' pas de lettre : ' +
        sansLettre.map(function (e) { return _ucpmEsc(ucpmLibelleCv(etat, e)); }).join(', ') + '. Vous pouvez l’écrire vous-même, refaire la demande, ou continuer sans.</p></div>'
      : '') +
    '<div class="mt-3"><button type="button" class="btn btn-outline-secondary" id="btnUcpmRefaireLettres">Refaire la demande</button></div>';
}

function _ucpmP6CablerLecture(etat) {
  var $$ = function (sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); };
  _ucpmP6CablerModeles(etat);
  _ucpmP6CablerSuite(etat);
  $$('[data-ucpm-lettre-sel]', function (el) {
    el.addEventListener('click', function () { etat.lettreSel = el.getAttribute('data-ucpm-lettre-sel'); ucpmRendrePage(); });
  });
  $$('[data-ucpm-lettre-texte]', function (el) {
    var id = el.getAttribute('data-ucpm-lettre-texte');
    el.addEventListener('input', function () {
      etat.lettres = etat.lettres || {};
      etat.lettres[id] = ucpmSansTiretLong(el.value);
      var m = document.getElementById('ucpmP6Mots'); if (m) { m.textContent = ucpmNombreMots(etat.lettres[id]); }
      var l = document.getElementById('ucpmP6Longue'); if (l) { l.hidden = !ucpmLettreLongue(etat.lettres[id]); }
      _ucpmP6ProgrammerModeles(etat);
      var o = document.querySelector('[data-ucpm-lettre-origine="' + id + '"]');
      if (o) { o.disabled = etat.lettres[id] === (etat.lettresOrigine && etat.lettresOrigine[id]); }
      var pastille = document.querySelector('[data-ucpm-lettre-sel="' + id + '"]');
      if (pastille) { pastille.textContent = pastille.getAttribute('data-ucpm-pastille-base') + (String(etat.lettres[id]).trim() ? '' : ' (à écrire)'); }
    });
  });
  $$('[data-ucpm-lettre-origine]', function (el) {
    el.addEventListener('click', function () {
      var id = el.getAttribute('data-ucpm-lettre-origine');
      var faire = function () { etat.lettres[id] = etat.lettresOrigine[id]; ucpmRendrePage(); };
      if (typeof confirmerAction === 'function') {
        confirmerAction('Remettre la lettre reçue ?', 'Vos modifications de cette lettre seront remplacées par le texte reçu de l’assistant.', 'Remettre la lettre reçue', 'btn-primary', faire);
      } else { faire(); }
    });
  });
  $$('[data-ucpm-lettre-retravail]', function (el) {
    el.addEventListener('click', function () {
      if (ucpmPreparerRetravailLettre(etat, el.getAttribute('data-ucpm-lettre-retravail'))) { ucpmRendrePage(); }
    });
  });
  $$('[data-ucpm-lettre-avant]', function (el) {
    el.addEventListener('click', function () {
      var id = el.getAttribute('data-ucpm-lettre-avant');
      var faire = function () {
        var actuelle = etat.lettres[id];
        etat.lettres[id] = etat.lettresAvant[id];
        etat.lettresAvant[id] = actuelle;
        ucpmRendrePage();
      };
      if (typeof confirmerAction === 'function') {
        confirmerAction('Revenir à la lettre d’avant ?', 'La lettre que vous voyez est remplacée par celle d’avant le dernier passage avec l’assistant. Elle est gardée : vous pourrez la retrouver avec le même bouton.', 'Revenir à la lettre d’avant', 'btn-primary', faire);
      } else { faire(); }
    });
  });
  var perimees = document.getElementById('btnUcpmRefairePerimees');
  if (perimees) {
    perimees.addEventListener('click', function () {
      var ids = _ucpmP6Perimees(etat).map(function (e) { return e.id; });
      var faire = function () { etat.lettresIds = ids.length === ucpmEntreesCochees(etat).length ? null : ids; etat.p6Vue = 'passage'; ucpmPassageReinitialiser(etat, 'lettres'); ucpmRendrePage(); };
      if (typeof confirmerAction === 'function') {
        confirmerAction('Refaire la demande ?', 'L’assistant réécrira ' + (ids.length > 1 ? 'ces lettres' : 'cette lettre') + ' avec ce que vous avez changé. Vos modifications ' + (ids.length > 1 ? 'de ces lettres' : 'de cette lettre') + ' seront remplacées au collage ; les autres lettres ne changent pas.', 'Refaire la demande', 'btn-primary', faire);
      } else { faire(); }
    });
  }
  var refaire = document.getElementById('btnUcpmRefaireLettres');
  if (refaire) {
    refaire.addEventListener('click', function () {
      var faire = function () { etat.p6Vue = 'passage'; ucpmPassageReinitialiser(etat, 'lettres'); ucpmRendrePage(); };
      if (typeof confirmerAction === 'function') {
        confirmerAction('Refaire la demande ?', 'Au prochain collage, les lettres des CV choisis seront remplacées par celles de l’assistant, y compris vos modifications. Les lettres des CV que vous décochez ne changent pas.', 'Refaire la demande', 'btn-primary', faire);
      } else { faire(); }
    });
  }
}

// ---------------- Retravailler une lettre avec l'assistant (2026-10-15, plan docs/PLAN_LETTRES_RETRAVAILLEES_ET_PREPARATION_ENTRETIEN_UCPM_2026-10-15.md) ----------------
// Un passage de plus, avec les mêmes briques que les lettres : réglages de style d'écriture, choix de l'assistant, copie, collage. Ce qui part : la lettre actuelle SANS la signature,
// la remarque de la personne, l'objectif et le titre du CV, le profil validé. Au retour, la lettre d'avant est gardée (« Revenir à la lettre d'avant »), rien n'est perdu.

var UCPM_ETAPES_CHOIX_RETRAVAIL = [
  { titre: 'Copie', detail: 'Votre lettre telle que vous la voyez, vos remarques, l’objectif du CV et votre CV de référence validé sont copiés automatiquement. Votre nom, votre téléphone et votre adresse ne partent jamais.' },
  { titre: 'Propositions', detail: 'L’assistant reprend votre lettre, fait ce que vous demandez et l’améliore, sans rien inventer.' },
  { titre: 'Vous collez', detail: 'Vous copiez sa réponse avec son bouton « Copier » et vous la collez ici, en une seule fois.' },
  { titre: 'Vous relisez', detail: 'Vous lisez la lettre et vous la modifiez comme vous voulez. Votre ancienne lettre est gardée : vous pouvez y revenir.' }
];

function _ucpmP6CiblesRetravail(etat) { return ucpmCiblesRetravail(etat.retravail, _ucpmP6LettresExistantes(etat)); }

// Un avis (jamais bloquant) quand le texte semble contenir un téléphone ou un courriel : ils partiraient chez l'assistant.
function _ucpmP6AvisCoordonnees(texte) {
  if (typeof detecterCoordonneesSensibles !== 'function') { return ''; }
  var trouves = [];
  try { trouves = detecterCoordonneesSensibles(String(texte || '')).filter(function (c) { return c.icone === '📞' || c.icone === '📧'; }); } catch (e) { trouves = []; }
  return trouves.length ? 'Votre texte semble contenir un numéro de téléphone ou une adresse de courriel : ils partiraient chez l’assistant. Retirez-les avant de continuer.' : '';
}

function _ucpmP6HtmlRetravail(etat) {
  var r = etat.retravail || {};
  var existantes = _ucpmP6LettresExistantes(etat);
  var cibles = _ucpmP6CiblesRetravail(etat).map(function (e) { return e.id; });
  var avisTexte = _ucpmP6AvisCoordonnees(r.remarque) || cibles.map(function (id) { return _ucpmP6AvisCoordonnees(etat.lettres && etat.lettres[id]); }).filter(Boolean)[0] || '';
  return '<div class="cv-section mb-3" data-ucpm-retravail="choix"><h4>&#9993;&#65039; Quelle lettre retravailler ?</h4>' +
    existantes.map(function (e) {
      return '<label style="display:flex;gap:.5rem;align-items:flex-start;cursor:pointer;margin:0 0 .4rem 0;"><input type="radio" name="ucpmRetravailLettre" style="margin-top:.3rem;" data-ucpm-retravail-id="' + e.id + '"' + (r.id === e.id ? ' checked' : '') + '>' +
        '<span style="flex:1;min-width:0;"><strong>Lettre du ' + _ucpmEsc(ucpmLibelleCv(etat, e)) + '</strong> <span class="small" style="color:var(--text-muted);">(votre texte actuel, avec vos modifications)</span></span></label>';
    }).join('') +
    (existantes.length > 1 ? '<label style="display:flex;gap:.5rem;align-items:flex-start;cursor:pointer;margin:.4rem 0 0 0;"><input type="checkbox" style="margin-top:.3rem;" id="ucpmRetravailToutes"' + (r.toutes ? ' checked' : '') + '><span>Retravailler aussi les autres lettres avec les mêmes remarques</span></label>' : '') +
    '</div>' +
    '<div class="cv-section mb-3"><h4>Ce que vous voulez changer ou ajouter</h4>' +
    '<label class="visually-hidden" for="ucpmRetravailRemarque">Vos remarques pour l’assistant</label>' +
    '<textarea class="form-control" id="ucpmRetravailRemarque" rows="4" placeholder="Exemples : parler de mon stage à l’EHPAD ; faire plus court ; insister sur ma disponibilité en septembre ; un ton plus chaleureux.">' + echapperTexteUcpm(r.remarque || '') + '</textarea>' +
    '<p class="small mt-1 mb-0" style="color:var(--text-muted);">Ne mettez ici ni votre nom, ni votre téléphone, ni votre adresse : ils ne partent pas.</p>' +
    '<p class="small mt-1 mb-0" id="ucpmRetravailAvis" style="color:var(--warning-strong);"' + (avisTexte ? '' : ' hidden') + ' role="status">' + _ucpmEsc(avisTexte) + '</p></div>';
}

function _ucpmP6CablerRetravail(etat) {
  var $$ = function (sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); };
  $$('[data-ucpm-retravail-id]', function (el) {
    el.addEventListener('change', function () { etat.retravail.id = el.getAttribute('data-ucpm-retravail-id'); });
  });
  var toutes = document.getElementById('ucpmRetravailToutes');
  if (toutes) { toutes.addEventListener('change', function () { etat.retravail.toutes = !!toutes.checked; }); }
  var rem = document.getElementById('ucpmRetravailRemarque');
  if (rem) {
    rem.addEventListener('input', function () {
      etat.retravail.remarque = ucpmSansTiretLong(rem.value);
      var avis = document.getElementById('ucpmRetravailAvis');
      if (avis) { var t = _ucpmP6AvisCoordonnees(etat.retravail.remarque); avis.textContent = t; avis.hidden = !t; }
    });
  }
}

function _ucpmConfigPassageRetravail(etat) {
  return {
    idSuffixe: 'UcpmRetravail',
    etapes: UCPM_ETAPES_CHOIX_RETRAVAIL,
    texteConfidentialite: 'Seuls la lettre, vos remarques, l’objectif du CV et le profil de votre CV de référence sont envoyés : votre nom, votre téléphone et votre adresse ne partent pas.',
    recapHtml: _ucpmP6HtmlRetravail(etat) + ucpmHtmlStyleEcriture('lettre'),
    construireTexte: function () {
      var nom = _ucpmP6NomSignature();
      var cibles = _ucpmP6CiblesRetravail(etat);
      return ucpmChargerPrompt('ucpm-lettres-retravail', 'ucpm-lettres-retravail.md').then(function (modele) {
        return ucpmConstruirePromptRetravail(modele, {
          sexe: etat.sexe,
          profil: ucpmConstruireProfilValide(ucpmDossierVrai()),
          lettres: ucpmBlocLettresRetravail(cibles.map(function (e) {
            return { titre: _ucpmP6Titre(etat, e), accroche: _ucpmP6Accroche(etat, e), objectif: e.objectif, lettre: ucpmRetirerSignature(etat.lettres[e.id], nom), remarque: (etat.retravail && etat.retravail.remarque) || '' };
          }))
        }) + ucpmConsignesStyle('lettre');
      });
    },
    importer: function (texte) {
      var nom = _ucpmP6NomSignature();
      var cibles = _ucpmP6CiblesRetravail(etat);
      var r = ucpmLireReponseLettres(texte, cibles.map(function (e) { return e.id; }));
      if (r.succes) {
        var pretes = ucpmPreparerLettresRecues(r.lettres, cibles, nom);
        var recues = cibles.filter(function (e) { return !!pretes[e.id]; });
        etat.lettresAvant = etat.lettresAvant || {};
        recues.forEach(function (e) { etat.lettresAvant[e.id] = (etat.lettres && etat.lettres[e.id]) || ''; });
        etat.lettres = ucpmFusionnerLettres(etat.lettres, pretes);
        etat.lettresOrigine = ucpmFusionnerLettres(etat.lettresOrigine, pretes);
        etat.lettresSig = Object.assign({}, etat.lettresSig, ucpmSignaturesLettres(etat, recues, ucpmConstruireProfilValide(ucpmDossierVrai()), nom));
        etat.lettreSel = recues[0] ? recues[0].id : (cibles[0] ? cibles[0].id : '');
        if (typeof trackEvenement === 'function') { trackEvenement('ucpm_lettres_retravaillees', { lettres: recues.length, manquants: r.manquants.length }); }
      }
      return r;
    },
    apresSucces: function () {
      etat.p6Vue = 'lecture'; etat.retravail = null;
      if (typeof afficherToast === 'function') { afficherToast('Votre lettre a été retravaillée. Votre ancienne lettre est gardée : « Revenir à la lettre d’avant ».', 7000); }
      ucpmRendrePage();
    }
  };
}

// Prépare le passage « Retravailler » pour la lettre d'un CV (depuis la lecture des lettres ou depuis la page 7) ; l'appelant affiche ensuite la page.
function ucpmPreparerRetravailLettre(etat, id) {
  var existantes = _ucpmP6LettresExistantes(etat);
  var choisi = existantes.filter(function (e) { return e.id === id; })[0] || existantes[0];
  if (!choisi) { return false; }
  etat.retravail = { id: choisi.id, toutes: false, remarque: (etat.retravail && etat.retravail.remarque) || '' };
  etat.lettreSel = choisi.id;
  etat.p6Vue = 'retravail';
  ucpmPassageReinitialiser(etat, 'retravail');
  return true;
}

// Le passage « Retravailler » est affiché : sa vue est demandée ET une lettre est choisie (après un rechargement sans choix, on retombe sur la lecture).
function _ucpmP6EnRetravail(etat) {
  if (etat.p6Vue !== 'retravail') { return false; }
  if (!etat.retravail || !_ucpmP6LettresExistantes(etat).length) { etat.p6Vue = etat.lettres ? 'lecture' : 'passage'; etat.retravail = null; return false; }
  return true;
}

ucpmEnregistrerPage(6, {
  rendre: function (etat) {
    var intro = '<div class="cv-section"><p class="mb-0">L’assistant écrit <strong>une lettre de motivation par CV</strong>, en une seule demande. Chaque lettre suit ce que vous cherchez avec ce CV (candidature spontanée, offre, stage, formation…) et s’appuie seulement sur votre CV validé : rien n’est inventé.</p></div>';
    if (_ucpmP6EnRetravail(etat)) {
      return '<div class="cv-section"><p class="mb-0">Vous retravaillez <strong>une lettre avec l’assistant</strong> : il part de votre texte actuel, fait ce que vous demandez et l’améliore, sans rien inventer. Votre ancienne lettre est gardée.</p></div>' +
        ucpmPassageRendre(etat, 'retravail', _ucpmConfigPassageRetravail(etat));
    }
    if (etat.lettres && etat.p6Vue === 'lecture') { return _ucpmP6HtmlLecture(etat); }
    return intro + ucpmPassageRendre(etat, 'lettres', _ucpmConfigPassageLettres(etat));
  },
  cabler: function (etat) {
    if (_ucpmP6EnRetravail(etat)) {
      ucpmPassageCabler(etat, 'retravail', _ucpmConfigPassageRetravail(etat));
      if (ucpmPassageVue(etat, 'retravail') === 'choix') { _ucpmP6CablerRetravail(etat); ucpmCablerStyleEcriture('lettre', ucpmRendrePage); }
      return;
    }
    if (etat.lettres && etat.p6Vue === 'lecture') { _ucpmP6CablerLecture(etat); return; }
    ucpmPassageCabler(etat, 'lettres', _ucpmConfigPassageLettres(etat));
    if (ucpmPassageVue(etat, 'lettres') === 'choix') { _ucpmP6CablerChoixCv(etat); ucpmCablerStyleEcriture('lettre', ucpmRendrePage); }
  },
  libelleContinuer: 'Terminer &#8594;',
  peutContinuer: function (etat) { return !!etat.lettres && etat.p6Vue === 'lecture' && _ucpmP6LettresExistantes(etat).length > 0; },
  raisonBlocage: function (etat) {
    if (_ucpmP6EnRetravail(etat)) { return 'Terminez ou quittez le passage « Retravailler » (bouton « Retour ») pour continuer.'; }
    if (etat.lettres && etat.p6Vue === 'lecture') { return 'Écrivez au moins une lettre, ou refaites la demande à l’assistant, pour continuer.'; }
    return 'Demandez vos lettres à l’assistant et collez sa réponse pour continuer.';
  },
  continuer: function () { ucpmAllerPage(7); },
  // « Retour » : recule d'une vue du passage ; depuis la lecture, ou au début du passage, revient à la page 5 sans rien supprimer.
  retour: function (etat) {
    if (_ucpmP6EnRetravail(etat)) {
      if (ucpmPassageRetour(etat, 'retravail')) { return true; }
      etat.p6Vue = 'lecture'; etat.retravail = null; ucpmRendrePage(); return true;
    }
    if (etat.p6Vue === 'passage' && ucpmPassageRetour(etat, 'lettres')) { return true; }
    if (etat.p6Vue === 'passage' && etat.lettres) { etat.p6Vue = 'lecture'; ucpmRendrePage(); return true; }
    return false;
  }
});
