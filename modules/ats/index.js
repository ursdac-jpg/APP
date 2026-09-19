/* ============================================================
   modules/ats/index.js
   ------------------------------------------------------------
   Module « Les mots de votre CV » (anciennement « ATS »).

   Compare le VOCABULAIRE du CV avec celui d'une reference (offre ou
   fiche metier). Jamais un score, jamais une analyse d'adequation :
   ca, c'est « Analyser ma candidature », un module separe.

   Maquette de reference (a suivre a la lettre) :
     docs/MAQUETTE_ATS_PARCOURS_2026-09-03.html
   Conception : docs/CHANTIER_ATS.md. Plan : docs/PLAN_ATS_2026-09-03.md.

   PAGE ROUTEE, meme patron que « Comparer mes pistes » / « Decouvrir mes
   competences » : l'etat de session vit dans la closure (_atsEtat) ;
   pageAts() (route 'ats', js/app.js) redessine l'ecran courant, ou
   renvoie a la presentation (route 'ats-intro') si aucune session.
   Point d'entree : le CTA de pageIntroAts (data/metiers.js) -> ouvrirAts()
   + naviguerVers('ats').

   FAMILLE 2 (depot de document + passage assistant, LANGAGE_VISUEL_COMMUN
   5bis) : bouton « Revoir la presentation » + note ; encart « Continuer /
   Recommencer » + gel + pulse a la reprise ; « Retour » ne saute jamais
   la presentation.

   Briques partagees appelees, jamais recopiees :
     ouvrirAssistantDepotCV, htmlVerificationDocument, bilanCorpsCiblageOffreHTML,
     htmlChoixAssistantBilanCorps, htmlBanniereTransitionIA, htmlCollageInstantane,
     reperesBoutonAncre, htmlEncartRepriseModule / appliquerGelModule,
     barreEtapesModule, barreNavigation, extraireBlocJSONDepuisTexte.
   Logique pure (testee) : modules/ats/detectionTexteCache.js,
   modules/ats/resultatParser.js.
   ============================================================ */

// -- Suivi d'usage (compteurs et libelles d'etape seulement, jamais de
// contenu personnel). Silencieux si le traqueur est absent.
function _atsTrack(nom, props) {
  if (typeof trackEvenement === 'function') {
    try { trackEvenement(nom, props || undefined); } catch (e) { /* jamais bloquant */ }
  }
}

// -- Les 4 « temps » decrits sur l'ecran « Choisir l'assistant » (brique
// partagee htmlChoixAssistantBilanCorps). Propres a ce module.
var ATS_ETAPES_CHOIX_IA = [
  { titre: 'Copie', detail: 'Le texte de votre CV anonymisé et les mots-clés de la référence sont copiés automatiquement, rien à écrire.' },
  { titre: 'Comparaison', detail: 'L’assistant repère les mots de la référence déjà présents dans votre CV, et ceux qui pourraient y être formulés autrement.' },
  { titre: 'Quatre listes', detail: 'Vous recevez quatre listes de même importance, plus quelques changements précis à faire vous-même.' },
  { titre: 'Votre choix', detail: 'Rien n’est appliqué : vous décidez quels mots reprendre, à partir de votre expérience réelle.' }
];

// -- Barre d'etapes : 4 pastilles (maquette).
var ATS_ETAPES = [
  { id: 'preparer', icone: '&#128221;', label: 'Préparer' },
  { id: 'envoyer', icone: '&#128228;&#65039;', label: 'Envoyer' },
  { id: 'resultat', icone: '&#128196;', label: 'Résultat' },
  { id: 'fiche', icone: '&#128206;', label: 'Ma fiche' }
];
// Ecran de session -> index d'etape dans ATS_ETAPES. « Relire et masquer »
// n'est pas un ecran a part : la brique ouvrirAssistantDepotCV l'inclut
// dans le depot du CV (decision Denis 2026-09-08, option B).
var ATS_ECRAN_VERS_ETAPE = {
  preparer: 0,
  'choix-assistant': 1, chez: 1, coller: 1,
  resultat: 2,
  emporter: 3
};

// -- Etat de session. Objet de donnees pures, serialisable tel quel
// (pont disquette, LECONS 7ter). null = aucune comparaison en cours.
var _atsEtat = null;

function atsEtatNeuf() {
  return {
    ecran: 'preparer',
    cvTexte: '',             // texte du CV, deja relu et masque (sortie de ouvrirAssistantDepotCV)
    cvNom: '',               // nom de fichier affiche, si depot fichier
    cvRelu: false,           // le wizard de depot (qui inclut relire / masquer) a ete mene a son terme
    modeReference: 'offre',  // 'offre' | 'metier'
    ciblage: null,           // sortie de bilanLireCiblageOffre (mode offre)
    metier: null,            // { nom, rome, vocabulaire } (mode metier)
    assistant: null,         // id de l'assistant choisi
    reponseCollee: '',       // texte brut colle par la personne
    resultat: null,          // sortie de parserResultatAts
    detectionLocale: null,   // sortie de detecterTexteCache (au collage)
    fiche: {}                // cases cochees de "Ma fiche"
  };
}

// FAMILLE 2 : detour de consultation (pas d'encart) vs reprise (encart +
// gel jusqu'au choix). Memes noms que Coherence / Comparer.
var _atsDetourPresentation = false;
var _atsReprisePendante = false;

// -- Route 'ats'. Le session persiste : on rouvre des qu'elle existe.
function pageAts() {
  if (_atsEtat) { ouvrirAts(); return; }
  if (typeof naviguerVers === 'function') { naviguerVers('ats-intro'); }
}

// « Revoir la presentation » / « Retour » d'un ecran de travail ->
// presentation du module, jamais l'accueil. Non destructif.
function atsRetourVersPresentation() {
  _atsDetourPresentation = true;
  if (typeof naviguerVers === 'function') { naviguerVers('ats-intro'); }
}
// « Revenir au module » depuis la presentation en detour.
function atsRevenirDeLaPresentation() {
  _atsDetourPresentation = false;
  if (typeof naviguerVers === 'function') { naviguerVers('ats'); }
}
// « Continuer » de l'encart de reprise -> leve le gel, garde tout l'etat.
function atsRepriseContinuer() {
  _atsReprisePendante = false;
  if (typeof naviguerVers === 'function') { naviguerVers('ats'); }
}
// « Recommencer » : detruit la comparaison (seul endroit qui remet a null).
function atsReinitialiser() {
  _atsEtat = null;
  _atsDetourPresentation = false;
  _atsReprisePendante = false;
}
// Appele par le CTA de pageIntroAts quand on revient dans le module
// depuis l'accueil / un autre module alors qu'une comparaison existe.
function atsMarquerReprisePendante() {
  if (_atsEtat) { _atsReprisePendante = true; }
}

// -- Pont disquette. _atsEtat EST l'etat a sauvegarder.
function atsExporterEtatPourSauvegarde() {
  if (!_atsEtat) { return null; }
  var e = _atsEtat;
  var vide = !(e.cvTexte || '').trim() && !e.resultat && !e.reponseCollee;
  if (vide) { return null; }
  try { return JSON.parse(JSON.stringify(e)); } catch (err) { return null; }
}
function atsRestaurerEtatDepuisSauvegarde(snap) {
  if (snap && typeof snap === 'object' && typeof snap.ecran === 'string') {
    _atsEtat = Object.assign(atsEtatNeuf(), snap);
  } else {
    _atsEtat = null;
  }
  _atsReprisePendante = false;
  _atsDetourPresentation = false;
}

// ============================================================
//  RENDU
// ============================================================

function ouvrirAts() {
  // Coupe un eventuel decompte en cours : naviguer ailleurs ne doit jamais
  // laisser le minuteur ouvrir un onglet surprise (meme garde-fou que le Bilan).
  if (_atsIntervalleDecompte) { clearInterval(_atsIntervalleDecompte); _atsIntervalleDecompte = null; }

  var premiereFois = !_atsEtat;
  if (premiereFois) { _atsEtat = atsEtatNeuf(); _atsTrack('ats_session_demarree'); }
  var app = document.getElementById('app');
  if (!app) { return; }

  var ecran = _atsEtat.ecran || 'preparer';
  var rendu = ({
    preparer: _atsRendrePreparer,
    'choix-assistant': _atsRendreChoixAssistant,
    chez: _atsRendreChezAssistant,
    coller: _atsRendreColler,
    resultat: _atsRendreResultat,
    emporter: _atsRendreEmporter
  })[ecran] || _atsRendrePreparer;

  app.innerHTML =
    '<div class="page-catalogue-contenu ats-module">' +
    barreEtapesModule(ATS_ETAPES, ATS_ECRAN_VERS_ETAPE[ecran]) +
    _atsBandeReprise() +
    '<div class="ats-ecran" data-ats-ecran="' + ecran + '">' + rendu() + '</div>' +
    '</div>' +
    '<div class="barre-navigation-fixe">' +
    barreNavigation('cv', null, null, { onclickPrecedent: _atsCibleRetour(ecran) }) +
    '</div>';

  _atsBrancherCommun();
  var brancher = ({
    preparer: _atsBrancherPreparer,
    'choix-assistant': _atsBrancherChoixAssistant,
    chez: _atsBrancherChezAssistant,
    coller: _atsBrancherColler,
    resultat: _atsBrancherResultat,
    emporter: _atsBrancherEmporter
  })[ecran];
  if (typeof brancher === 'function') { brancher(); }

  if (typeof appliquerGelModule === 'function') { appliquerGelModule(_atsReprisePendante); }
  if (typeof armerFinPulseEncartReprise === 'function') { armerFinPulseEncartReprise(); }
  if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// « Retour » de la barre du bas : vers l'ecran REELLEMENT precedent
// (jamais sauter la presentation, jamais l'accueil nu).
function _atsCibleRetour(ecran) {
  var map = {
    preparer: "naviguerVers('ats-intro')",
    'choix-assistant': "atsAllerA('preparer')",
    chez: "atsAllerA('choix-assistant')",
    coller: "atsAllerA('chez')",
    resultat: "atsAllerA('coller')",
    emporter: "atsAllerA('resultat')"
  };
  return map[ecran] || "naviguerVers('ats-intro')";
}

// Change d'ecran dans la session et redessine.
function atsAllerA(ecran) {
  if (!_atsEtat) { _atsEtat = atsEtatNeuf(); }
  _atsEtat.ecran = ecran;
  ouvrirAts();
}

// -- Bande sous la barre d'etapes : bouton partage a gauche, encart de
// reprise a droite (seulement si _atsReprisePendante). Meme forme que
// Coherence / Comparer.
function _atsBandeReprise() {
  var libelle = _atsDetourPresentation ? 'Revenir au module' : 'Revoir la présentation';
  var texteNote = _atsDetourPresentation
    ? 'Ce bouton vous ramène à l’endroit où vous en étiez dans le module. Vous ne perdez rien.'
    : 'Ce bouton vous ramène à la page qui explique ce module. Vous ne perdez rien.';
  var noteVue = (typeof noteRevoirModuleDejaVue === 'function') ? noteRevoirModuleDejaVue() : true;
  var bouton = '<div><button type="button" id="btnAtsRevoirPresentation" class="btn-revoir-module"' +
    (_atsReprisePendante ? ' disabled' : '') + '>' +
    '<i class="bi bi-card-checklist"></i> ' + libelle + '</button></div>' +
    ((!noteVue && !_atsReprisePendante)
      ? '<div class="note-revoir-module" id="noteRevoirModule" style="margin-left:0;">' +
        '<span>' + texteNote + '</span>' +
        '<button type="button" aria-label="J’ai compris" data-fermer-note-revoir>&#10005;</button>' +
        '</div>'
      : '');
  var encart = _atsReprisePendante
    ? htmlEncartRepriseModule({
        texte: 'Vous avez une comparaison en cours sur ce module.',
        idContinuer: 'btnAtsRepriseContinuer',
        idRecommencer: 'btnAtsRepriseRecommencer',
        pulse: true
      })
    : '';
  return htmlBandeRepriseModule(bouton, encart);
}

function _atsBrancherCommun() {
  var b = document.getElementById('btnAtsRevoirPresentation');
  if (b) {
    b.addEventListener('click', _atsDetourPresentation ? atsRevenirDeLaPresentation : atsRetourVersPresentation);
  }
  var c = document.getElementById('btnAtsRepriseContinuer');
  if (c) { c.addEventListener('click', atsRepriseContinuer); }
  var r = document.getElementById('btnAtsRepriseRecommencer');
  if (r) { r.addEventListener('click', _atsConfirmerRecommencer); }
}

function _atsConfirmerRecommencer() {
  var faire = function () { atsReinitialiser(); if (typeof naviguerVers === 'function') { naviguerVers('ats-intro'); } };
  if (typeof confirmerAction === 'function') {
    confirmerAction(
      'Recommencer une comparaison ?',
      'La comparaison en cours sera effacée. Ce que vous avez gardé dans Mes Repères ne bouge pas. Cette action ne s’annule pas.',
      faire, { texteConfirmer: 'Recommencer', danger: true }
    );
  } else { faire(); }
}

// ============================================================
//  ECRAN 2 -- PREPARER (page depliante : CV, reference, relire et masquer)
//  Option B (Denis 2026-09-08) : la brique ouvrirAssistantDepotCV fait
//  depot + extraction + relire/masquer d'un bloc. Le bloc 3 en est donc
//  le RECAP (« C'est fait, revoir si besoin »), pas une etape a refaire.
// ============================================================

function _atsRendrePreparer() {
  var e = _atsEtat;
  var cvOk = !!(e.cvTexte || '').trim();
  var refOk = e.modeReference === 'offre'
    ? !!(e.ciblage && (e.ciblage.saisieLibre || '').trim())
    : !!(e.metier && e.metier.nom);
  var actif = cvOk && refOk && e.cvRelu;

  // TACHE (retour utilisateur 2026-09-17, coherence inter-modules) : titre
  // centre comme partout ailleurs (co-lettre, prepa-entretien...) -- ce
  // module utilisait un <h1> sans <div class="text-center">, seule
  // divergence trouvee (la taille, elle, etait deja la bonne : 2.8rem
  // global, aucun style inline ici contrairement a d'autres modules).
  return '<div class="text-center"><h1>Préparer</h1>' +
    '<p class="sousTitre">On rassemble ici ce dont la comparaison a besoin. La relecture de votre CV, où vous masquez votre nom et vos coordonnées, se fait au moment du dépôt (partie 1).</p></div>' +

    // -- Bloc 1 : votre CV (depot + relecture, brique partagee)
    _atsDetails('atsDep1', '1', 'Votre CV', 'déposer, puis relire et masquer', cvOk ? 'Fait' : '', true,
      '<p>Déposez votre CV, sous la forme que vous avez : PDF, Word, .txt, une photo ou une capture d’écran. Il est lu directement dans votre navigateur. Vous le relisez ensuite à l’écran et vous <strong>masquez vous-même</strong> ce que vous ne voulez pas transmettre (nom, adresse, téléphone) : rien n’est masqué à votre place.</p>' +
      '<button type="button" class="btn btn-primary btn-sm" id="btnAtsDeposerCV">' + (cvOk ? 'Changer de CV' : 'Déposer mon CV') + '</button>' +
      (cvOk
        ? '<div class="cv-section" style="background:var(--success-bg-subtle);margin-top:.6rem;"><strong>&#9989; Déposé et relu</strong> ' +
          (e.cvNom ? echapperAttribut(e.cvNom) : 'texte collé') + '</div>'
        : '') +
      '<p style="color:var(--text-muted);font-size:.9rem;margin-top:.5rem;">Vous n’avez pas encore de CV ? ' +
      '<button type="button" class="btn btn-link btn-sm p-0 align-baseline" id="btnAtsCreerCV">Le créer d’abord avec « Créer un CV »</button></p>') +

    // -- Bloc 2 : la reference
    // TACHE (audit de stabilisation, 2026-09-13, finding 7) : "ouvert" ne
    // doit plus etre fige a false -- l'ecran entier est reconstruit a
    // chaque choix (data-ats-ref, fiche metier), un bloc toujours ferme
    // cachait le bouton qui venait d'apparaitre juste apres le clic qui
    // l'affichait. Reste ouvert des qu'on a commence a y repondre.
    _atsDetails('atsDep2', '2', 'La référence', 'à quoi comparer votre vocabulaire', refOk ? 'Choisie' : 'À choisir', refOk || !!e.blocReferenceOuvert,
      '<div class="d-flex gap-2 flex-wrap mb-2">' +
      '<button type="button" class="btn btn-sm ' + (e.modeReference === 'offre' ? 'btn-primary' : 'btn-outline-secondary') + '" data-ats-ref="offre">J’ai une offre</button>' +
      '<button type="button" class="btn btn-sm ' + (e.modeReference === 'metier' ? 'btn-primary' : 'btn-outline-secondary') + '" data-ats-ref="metier">Je n’ai pas d’offre</button>' +
      '</div>' +
      (e.modeReference === 'offre'
        ? '<p style="color:var(--text-muted);font-size:.9rem;">Les mots-clés seront extraits <strong>strictement</strong> du texte de l’offre.</p>' +
          '<div id="atsCiblageHote">' + (typeof bilanCorpsCiblageOffreHTML === 'function' ? bilanCorpsCiblageOffreHTML() : '') + '</div>' +
          '<p style="color:var(--text-muted);font-size:.85rem;margin-top:.4rem;">Le type de structure sert à l’assistant : une association et une entreprise privée n’emploient pas toujours les mêmes mots. Facultatif.</p>'
        : '<p>Sans offre, on part d’une <strong>fiche métier officielle</strong>.</p>' +
          '<button type="button" class="btn btn-primary btn-sm" id="btnAtsChoisirMetier">Choisir une fiche métier</button>' +
          (e.metier && e.metier.nom
            ? '<div class="cv-section" style="background:var(--accent-bg-subtle);margin-top:.5rem;"><strong>Fiche retenue :</strong> ' + echapperAttribut(e.metier.nom) + '</div>'
            : '') +
          '<p style="color:var(--text-muted);font-size:.85rem;margin-top:.4rem;">L’objectif devient : employer le vocabulaire du métier, et clarifier votre projet. Ces termes proviennent d’une fiche générale et peuvent varier selon les employeurs.</p>')) +

    // -- Bloc 3 : recap de la relecture (faite au depot, option B)
    _atsDetails('atsDep3', '3', 'Relire et masquer', 'fait au moment du dépôt', e.cvRelu ? 'Fait' : 'À faire', false,
      (e.cvRelu
        ? '<p>&#9989; Vous avez relu votre CV et masqué ce que vous ne vouliez pas transmettre, au moment du dépôt. L’analyse se fera sur ce texte anonymisé.</p>' +
          '<button type="button" class="btn btn-outline-secondary btn-sm" id="btnAtsRevoirRelecture">Revoir la relecture</button>'
        : '<p>Cette vérification se fait juste après le dépôt de votre CV (partie 1) : vous relisez le texte à l’écran et vous masquez vous-même votre nom, votre adresse et votre téléphone. Rien n’est masqué à votre place.</p>' +
          (cvOk ? '' : '<p style="color:var(--text-muted);font-size:.85rem;">Déposez d’abord votre CV (partie 1).</p>'))) +

    '<div class="text-center" style="margin-top:1.25rem;">' +
    '<button type="button" id="btnAtsVersAssistant" class="btn btn-primary btn-lg"' + (actif ? '' : ' disabled') + '>Choisir mon assistant &#8594;</button>' +
    '<p style="margin:.55rem 0 0;color:var(--text-muted);font-size:.9rem;">Actif une fois votre CV déposé (et relu) et la référence choisie.</p>' +
    '</div>';
}

// details/summary a la mode de l'app (bloc-depli n'existe pas partout :
// on rend un <details> simple, style cv-section).
function _atsDetails(id, num, titre, gloss, etat, ouvert, corpsHTML) {
  return '<details class="cv-section ats-depli"' + (ouvert ? ' open' : '') + ' id="' + id + '">' +
    '<summary style="cursor:pointer;font-weight:600;list-style:none;">' +
    '<span class="ats-num">' + num + '</span> ' + titre +
    (gloss ? ' <span style="font-weight:400;color:var(--text-muted);font-size:.9rem;">(' + gloss + ')</span>' : '') +
    (etat ? ' <span class="badge bg-secondary" style="float:right;">' + etat + '</span>' : '') +
    '</summary>' +
    '<div style="margin-top:.6rem;">' + corpsHTML + '</div>' +
    '</details>';
}

// Ouvre le wizard partage de depot (depot + extraction + relire/masquer)
// et recupere le texte final anonymise via onDocumentPrepare.
function _atsOuvrirDepotCV() {
  if (typeof ouvrirAssistantDepotCV !== 'function') { return; }
  ouvrirAssistantDepotCV('maj', {
    titreDocument: 'CV',
    onDocumentPrepare: function (res) {
      var valeur = res && (res.valeur != null ? res.valeur : res.texte);
      if (typeof valeur === 'string' && valeur.trim()) {
        _atsEtat.cvTexte = valeur;
        _atsEtat.cvNom = (res && res.nomFichier) ? String(res.nomFichier) : '';
        _atsEtat.cvRelu = true;
        _atsTrack('ats_cv_depose');
      }
      ouvrirAts();
    }
  });
}

function _atsBrancherPreparer() {
  var e = _atsEtat;

  var dep = document.getElementById('btnAtsDeposerCV');
  if (dep) { dep.addEventListener('click', _atsOuvrirDepotCV); }
  var rev = document.getElementById('btnAtsRevoirRelecture');
  if (rev) { rev.addEventListener('click', _atsOuvrirDepotCV); }

  var creer = document.getElementById('btnAtsCreerCV');
  if (creer) { creer.addEventListener('click', function () { if (typeof naviguerVers === 'function') { naviguerVers('creer-cv'); } }); }

  Array.prototype.forEach.call(document.querySelectorAll('[data-ats-ref]'), function (btn) {
    btn.addEventListener('click', function () {
      _atsEtat.modeReference = btn.getAttribute('data-ats-ref');
      _atsEtat.blocReferenceOuvert = true;
      ouvrirAts();
    });
  });

  if (e.modeReference === 'offre' && typeof bilanCablerCiblageOffre === 'function') {
    var hote = document.getElementById('atsCiblageHote');
    if (hote) {
      bilanCablerCiblageOffre(hote, function () {
        if (typeof bilanLireCiblageOffre === 'function') {
          _atsEtat.ciblage = bilanLireCiblageOffre(hote);
        }
      });
      // pre-remplissage depuis un ciblage deja saisi ailleurs
      if (!e.ciblage && typeof dossier !== 'undefined' && dossier && dossier.rechercheCandidature) {
        _atsEtat.ciblage = null; // le composant lira dossier.rechercheCandidature de lui-meme si branche pour
      }
    }
  }

  var met = document.getElementById('btnAtsChoisirMetier');
  if (met) { met.addEventListener('click', _atsOuvrirFenetreMetier); }

  var suite = document.getElementById('btnAtsVersAssistant');
  if (suite && !suite.disabled) { suite.addEventListener('click', function () { atsAllerA('choix-assistant'); }); }
}

// Note : « Relire et masquer » n'est pas un ecran a part. La brique
// ouvrirAssistantDepotCV le fait a l'interieur du depot du CV
// (_atsOuvrirDepotCV, ecran « Preparer »). Decision Denis 2026-09-08.

// ============================================================
//  ECRAN 2c -- CHOISIR L'ASSISTANT (brique partagee htmlChoixAssistantBilanCorps)
// ============================================================

function _atsRendreChoixAssistant() {
  var e = _atsEtat;
  var metierLibelle = e.modeReference === 'metier' && e.metier ? e.metier.nom : (e.ciblage && e.ciblage.metierCible) || 'le métier visé';
  return '<div class="text-center"><h1>Choisir l’assistant</h1></div>' +
    '<div class="cv-section">' +
    '<p class="mb-1"><strong>&#128203; Ce qui va être envoyé</strong></p>' +
    '<ul class="mb-1" style="padding-left:1.25rem;">' +
    '<li>Le texte de votre CV, <strong>une fois anonymisé</strong>.</li>' +
    '<li>Les mots-clés de la référence pour « ' + echapperAttribut(metierLibelle) + ' ».</li>' +
    '</ul>' +
    '<p style="color:var(--text-muted);font-size:.9rem;margin:.3rem 0 0;">Ne partent pas : votre nom, votre téléphone, votre adresse. L’assistant ne sait pas qui vous êtes ; rien n’est conservé.</p>' +
    '</div>' +
    '<div class="cv-section ats-choix-ia">' +
    '<h4 class="mb-1">&#128172; Choisissez votre assistant</h4>' +
    '<p style="color:var(--text-muted);font-size:.9rem;" class="mb-2">Cliquez sur un assistant. L’application prépare et copie tout, puis l’ouvre dans un nouvel onglet : <strong>cette page reste ouverte</strong>, vous n’avez rien à taper.</p>' +
    (typeof htmlChoixAssistantBilanCorps === 'function'
      ? htmlChoixAssistantBilanCorps({
          idErreur: 'atsErreurChoixIA',
          attrAssistant: 'data-assistant-ats',
          etapes: ATS_ETAPES_CHOIX_IA,
          texteConfidentialite: 'Rien n’est envoyé avant que vous ayez relu et masqué votre CV. Votre nom et vos coordonnées ne partent pas.'
        })
      : '<p style="color:var(--text-muted);">Choix de l’assistant (composant partagé).</p>') +
    '</div>';
}

function _atsBrancherChoixAssistant() {
  // Revenir sur le choix de l'assistant annule une transition en cours.
  if (typeof _etatTransitionIA !== 'undefined' && _etatTransitionIA) { _etatTransitionIA = null; }
  Array.prototype.forEach.call(document.querySelectorAll('[data-assistant-ats]'), function (el) {
    el.addEventListener('click', function () {
      var id = el.getAttribute('data-assistant-ats');
      _atsPreparerEtEnvoyer(id);
    });
  });
}

// -- Assemble le texte a copier (prompts/ats.md rempli) et lance la brique
// partagee « Avant de continuer vers [assistant] ».
function _atsConstruirePrompt(template, etat) {
  var e = etat || _atsEtat || {};
  var mode = e.modeReference === 'metier' ? 'metier' : 'offre';
  var ciblage = e.ciblage || {};
  var valeurs = {
    MODE_REFERENCE: mode,
    CV: (e.cvTexte || '').trim() || 'Non fourni',
    METIER_VISE: mode === 'metier'
      ? ((e.metier && e.metier.nom) || 'Non précisé')
      : (ciblage.metierCible || ciblage.metier || 'Non précisé'),
    CODE_ROME: (mode === 'metier' && e.metier && e.metier.rome) ? e.metier.rome : 'Non fourni',
    VOCABULAIRE_FICHE_METIER: (mode === 'metier' && e.metier && e.metier.vocabulaire) ? e.metier.vocabulaire : 'Non fournie',
    OFFRE_EMPLOI_OU_NON_FOURNIE: mode === 'offre'
      ? ((ciblage.saisieLibre || ciblage.offre || ciblage.texteOffre || '').trim() || 'Non fournie')
      : 'Non fournie',
    ENTREPRISE_CIBLEE_OU_NON_FOURNIE: (ciblage.entreprise || '').trim() || 'Non fournie',
    SITE_ENTREPRISE_OU_NON_FOURNI: (ciblage.site || ciblage.siteEntreprise || '').trim() || 'Non fourni',
    TYPE_STRUCTURE_OU_NON_FOURNI: (ciblage.typeStructure || '').trim() || 'Non fourni'
  };
  if (typeof ctResoudrePlaceholders === 'function') {
    return ctResoudrePlaceholders(template, valeurs).texte;
  }
  // Repli : remplacement direct.
  return String(template || '').replace(/\{([A-Z_]+)\}/g, function (m, nom) {
    return Object.prototype.hasOwnProperty.call(valeurs, nom) ? String(valeurs[nom]) : m;
  });
}

function _atsPreparerEtEnvoyer(assistantId) {
  var assistant = (typeof ASSISTANTS_IA !== 'undefined')
    ? ASSISTANTS_IA.filter(function (a) { return a.id === assistantId; })[0]
    : null;
  if (!assistant) { return; }
  _atsEtat.assistant = assistant.id;
  _atsTrack('ats_assistant_choisi', { assistant: assistant.id });

  var charger = (typeof ctChargerTemplate === 'function')
    ? ctChargerTemplate('prompts/ats.md')
    : (typeof fetch === 'function'
        ? fetch('prompts/ats.md', { cache: 'no-cache' }).then(function (r) { return r.text(); })
        : Promise.reject(new Error('chargement du prompt indisponible')));

  charger.then(function (template) {
    var texte = _atsConstruirePrompt(template);
    if (typeof ouvrirFenetreAssistantIA === 'function') {
      ouvrirFenetreAssistantIA({
        nomAssistant: assistant.nom,
        idAssistant: assistant.id,
        urlAssistant: assistant.url,
        etapes: (typeof ETAPES_ASSISTANT_IA_TEXTE !== 'undefined') ? ETAPES_ASSISTANT_IA_TEXTE : undefined,
        construireTexteACopier: function () { return texte; },
        onApresValidation: function (urlAssistant, nomAssistant) {
          _etatTransitionIA = { urlAssistant: urlAssistant, nomAssistant: nomAssistant, phase: 'decompte', secondesRestantes: 5 };
          _atsTrack('ats_prompt_envoye');
          atsAllerA('chez');
        }
      });
    }
  }).catch(function () {
    var z = document.getElementById('atsErreurChoixIA');
    if (z) { z.style.display = 'block'; z.textContent = '⚠️ Une erreur est survenue, merci de réessayer.'; }
  });
}

// ============================================================
//  ECRAN 2d -- CHEZ L'ASSISTANT (brique partagee htmlBanniereTransitionIA)
//  Meme sequence que le Bilan / la page Action (etat global _etatTransitionIA,
//  phases decompte -> ouvert/bloque -> revenu). Le rerender = ouvrirAts().
// ============================================================

var _atsIntervalleDecompte = null;

function _atsRendreChezAssistant() {
  var nom = (_etatTransitionIA && _etatTransitionIA.nomAssistant) || 'l’assistant';
  return '<div class="text-center"><h1>Chez ' + echapperAttribut(nom) + '</h1>' +
    '<p class="sousTitre">Le texte est déjà copié. L’onglet s’ouvre tout seul ; <strong>cette page reste ouverte</strong>, c’est ici que vous reviendrez.</p></div>' +
    (typeof htmlBanniereTransitionIA === 'function' ? htmlBanniereTransitionIA() : '') +
    '<div class="cv-section" style="margin-top:.8rem;">' +
    '<p class="mb-1"><strong>&#128278; Ce que vous retrouverez ici</strong></p>' +
    '<p class="mb-0" style="color:var(--text-muted);font-size:.9rem;">De retour de l’assistant : cliquez sur <strong>« Je suis de retour »</strong> ci-dessus, puis sur <strong>« Coller la réponse »</strong>, puis sur <strong>« Importer »</strong>.</p>' +
    '</div>';
}

function _atsBrancherChezAssistant() {
  if (!_etatTransitionIA) { atsAllerA('choix-assistant'); return; }
  // TACHE (audit robustesse ATS, 2026-09-11) : retour en arriere depuis
  // « Coller la reponse » (bouton Retour de la barre du bas,
  // _atsCibleRetour) alors que la phase est deja 'revenu' (posee au clic
  // sur « Je suis de retour ») -- htmlBanniereTransitionIA() ne sait rien
  // afficher pour cette phase (bandeau vide) et le texte de cet ecran
  // promet un bouton absent : ecran sans aucune action possible. On
  // ramene la phase a 'ouvert', l'etat coherent pour cet ecran -- l'assistant
  // est deja ouvert dans un autre onglet, on peut y retourner ou re-cliquer
  // « Je suis de retour ».
  if (_etatTransitionIA.phase !== 'decompte' && _etatTransitionIA.phase !== 'bloque' && _etatTransitionIA.phase !== 'ouvert') {
    _etatTransitionIA.phase = 'ouvert';
    ouvrirAts();
    return;
  }

  function rerender() { ouvrirAts(); }

  function ouvrirAssistantEnAttente() {
    if (!document.querySelector('[data-ats-ecran="chez"]')) { clearInterval(_atsIntervalleDecompte); return; }
    // TACHE (retour Denis, 2026-09-19, point 4) : voir recopierTexteAssistantPuisOuvrir()
    // (js/app.js) -- meme correctif, tous les parcours.
    recopierTexteAssistantPuisOuvrir(function () {
      var fen = window.open(_etatTransitionIA.urlAssistant, '_blank');
      _etatTransitionIA.phase = fen ? 'ouvert' : 'bloque';
      if (_etatTransitionIA.phase === 'bloque') { _atsTrack('ats_popup_bloque'); }
      rerender();
    });
  }

  if (_etatTransitionIA.phase === 'decompte') {
    var cont = document.getElementById('btnContinuerMaintenantIA');
    if (cont) { cont.addEventListener('click', function () { clearInterval(_atsIntervalleDecompte); ouvrirAssistantEnAttente(); }); }
    _atsIntervalleDecompte = setInterval(function () {
      _etatTransitionIA.secondesRestantes -= 1;
      var c = document.getElementById('compteurDecompteIA');
      if (c) { c.textContent = _etatTransitionIA.secondesRestantes; }
      if (_etatTransitionIA.secondesRestantes <= 0) { clearInterval(_atsIntervalleDecompte); ouvrirAssistantEnAttente(); }
    }, 1000);
  } else if (_etatTransitionIA.phase === 'bloque') {
    var bl = document.getElementById('btnOuvrirBloqueIA');
    if (bl) { bl.addEventListener('click', ouvrirAssistantEnAttente); }
  } else if (_etatTransitionIA.phase === 'ouvert') {
    var ret = document.getElementById('btnJeSuisDeRetourIA');
    if (ret) { ret.addEventListener('click', function () { _etatTransitionIA.phase = 'revenu'; atsAllerA('coller'); }); }
    var rouvrir = document.getElementById('btnRouvrirSiteIA');
    if (rouvrir) { rouvrir.addEventListener('click', ouvrirAssistantEnAttente); }
  }
}

// ============================================================
//  ECRAN 2e -- COLLER LA REPONSE (brique partagee htmlCollageInstantane)
// ============================================================

function _atsRendreColler() {
  var nom = (_etatTransitionIA && _etatTransitionIA.nomAssistant) || 'l’assistant';
  return '<div class="text-center"><h1>De retour : coller la réponse</h1>' +
    '<p class="sousTitre">Vous revenez de <strong>' + echapperAttribut(nom) + '</strong>. Sa réponse est dans votre presse-papiers : le texte reste caché, vous n’avez rien à relire.</p></div>' +
    (typeof htmlCollageInstantane === 'function' ? htmlCollageInstantane('Ats') : '<p style="color:var(--text-muted);">Collage (composant partagé).</p>') +
    '<div id="atsMessageImport" class="small text-center mt-2"></div>' +
    '<div class="text-center" style="margin-top:1rem;">' +
    '<button type="button" id="btnAtsImporter" class="btn btn-primary btn-lg bouton-incitation-action">&#128229; Importer</button>' +
    '</div>';
}

function _atsBrancherColler() {
  var msg = document.getElementById('atsMessageImport');
  if (typeof activerCollageInstantane === 'function') {
    activerCollageInstantane({
      idZoneAuto: 'zoneCollageAutoAts',
      idZoneApercu: 'zoneApercuCollageAts',
      idTextarea: 'texteCollageAts',
      idBoutonColler: 'btnCollerAutoAts',
      idBoutonCollerManuel: 'btnCollerManuelAts',
      idBoutonEffacerRecoller: 'btnEffacerRecollerAts',
      idBoutonImporter: 'btnAtsImporter',
      onSucces: function (texte) {
        _atsEtat.reponseCollee = String(texte || '');
        if (msg) { msg.style.color = 'var(--success)'; msg.textContent = '✅ Réponse collée. Cliquez sur « Importer ».'; }
      },
      onErreur: function (m) { if (msg) { msg.style.color = 'var(--danger)'; msg.textContent = '⚠️ ' + m; } },
      onEffacer: function () { _atsEtat.reponseCollee = ''; if (msg) { msg.textContent = ''; } },
      onCollerManuel: function () { if (msg) { msg.textContent = ''; } }
    });
  }
  var imp = document.getElementById('btnAtsImporter');
  if (imp) {
    imp.addEventListener('click', function () {
      // Repli : si le collage manuel est utilise, lire le textarea directement.
      if (!(_atsEtat.reponseCollee || '').trim()) {
        var ta = document.getElementById('texteCollageAts');
        if (ta && ta.value.trim()) { _atsEtat.reponseCollee = ta.value; }
      }
      if (!(_atsEtat.reponseCollee || '').trim()) {
        if (msg) { msg.style.color = 'var(--danger)'; msg.textContent = '⚠️ Collez d’abord la réponse de l’assistant.'; }
        return;
      }
      _atsImporterReponse();
    });
  }
}

// Lit la reponse collee -> parseur + detection locale -> ecran resultat.
function _atsImporterReponse() {
  var e = _atsEtat;
  var deps = (typeof extraireBlocJSONDepuisTexte === 'function') ? { extraireJSON: extraireBlocJSONDepuisTexte } : {};
  e.resultat = (typeof parserResultatAts === 'function')
    ? parserResultatAts(e.reponseCollee || '', e.cvTexte || '', deps, e.modeReference)
    : null;
  e.detectionLocale = (typeof detecterTexteCache === 'function')
    ? detecterTexteCache(e.cvTexte || '')
    : { suspect: false, extraits: [] };
  _atsTrack('ats_resultat_importe', {
    lisible: !!(e.resultat && e.resultat.lisible),
    triche: !!((e.resultat && e.resultat.texteCache && e.resultat.texteCache.suspect) || (e.detectionLocale && e.detectionLocale.suspect))
  });
  atsAllerA('resultat');
}

// ============================================================
//  ECRAN 3 -- LE RESULTAT  (nouvel ecran, coeur du module)
//  Rendu detaille : etape 7. Ici, structure + branchement des donnees.
// ============================================================

function _atsRendreResultat() {
  var e = _atsEtat;
  var r = e.resultat;

  if (!r || !r.lisible) {
    return '<div class="text-center"><h1>Le résultat</h1></div>' +
      '<div class="cv-section" style="border-left:4px solid var(--warning);">' +
      '<p><strong>La réponse n’a pas pu être lue.</strong> Recopiez-la en entier depuis l’assistant, sans rien ajouter avant ni après.</p>' +
      '<button type="button" class="btn btn-outline-secondary btn-sm" id="btnAtsRecoller">Revenir coller la réponse</button>' +
      '</div>';
  }
  if (r.analyseImpossible) {
    return '<div class="text-center"><h1>Le résultat</h1></div>' +
      '<div class="cv-section">' +
      '<p>' + echapperAttribut(r.messageImpossible || 'La comparaison n’a pas pu se faire.') + '</p>' +
      '<p style="color:var(--text-muted);font-size:.9rem;">Vérifiez que c’est bien le texte de votre CV qui a été envoyé, puis recommencez.</p>' +
      '<button type="button" class="btn btn-outline-secondary btn-sm" id="btnAtsRecoller">Revenir coller la réponse</button>' +
      '</div>';
  }

  var texteCacheSuspect = (r.texteCache && r.texteCache.suspect) || (e.detectionLocale && e.detectionLocale.suspect);
  var extraitsTriche = (r.texteCache && r.texteCache.extraits && r.texteCache.extraits.length)
    ? r.texteCache.extraits
    : ((e.detectionLocale && e.detectionLocale.extraits) || []);

  return '<div class="text-center"><h1>Le résultat</h1></div>' +
    _atsEncart('&#9878;&#65039;', '<strong>Ni un test ni une note.</strong> Ce module n’est pas un logiciel de tri : il en imite la vérification pour vous montrer, en clair, quels mots attendus sont présents dans votre CV et lesquels faire ressortir. Ce sont des pistes, si vous le souhaitez.', 'ok') +
    (texteCacheSuspect ? _atsEncartTriche(extraitsTriche, r.texteCache && r.texteCache.explication) : '') +
    (r.sansOffre ? _atsBlocSansOffre(r.sansOffre) : _atsBlocMotsReference(r)) +
    _atsBlocsResultat(r) +
    _atsBlocChangements(r.changementsPrioritaires) +
    _atsBonASavoir(r) +
    '<div class="cv-section" style="background:var(--accent-bg-subtle);border-left:4px solid var(--accent);">' +
    '<p class="mb-1"><strong>&#10145;&#65039; Et maintenant ?</strong></p>' +
    '<p class="mb-0">Choisissez <strong>2 ou 3 mots</strong> à travailler, pas plus. La page suivante en fait une fiche à emporter, avec des questions pour votre conseiller.</p>' +
    '</div>' +
    '<div class="text-center" style="margin-top:1rem;">' +
    '<button type="button" id="btnAtsVersFiche" class="btn btn-primary btn-lg">Voir ma fiche &#8594;</button>' +
    '</div>';
}

function _atsEncart(icone, corpsHTML, variante) {
  var couleur = variante === 'ok' ? 'var(--success)' : (variante === 'warn' ? 'var(--warning)' : 'var(--accent)');
  var fond = variante === 'ok' ? 'var(--success-bg-subtle)' : (variante === 'warn' ? 'var(--warning-bg-subtle)' : 'var(--accent-bg-subtle)');
  return '<div class="cv-section" style="display:flex;gap:.6rem;background:' + fond + ';border-left:4px solid ' + couleur + ';">' +
    '<span>' + icone + '</span><div>' + corpsHTML + '</div></div>';
}

function _atsEncartTriche(extraits, explication) {
  var ex = extraits && extraits[0] ? extraits[0] : null;
  return _atsEncart('&#9888;&#65039;',
    '<p class="mb-1"><strong>Ceci n’est pas une accusation.</strong> Le texte fourni contient un passage qui ressemble à une liste de mots-clés sans contexte :</p>' +
    (ex
      ? '<p style="font-family:monospace;font-size:.85rem;background:var(--bg-subtle);padding:.5rem .7rem;border-radius:6px;margin:.4rem 0;">' +
        (ex.avant ? '<span style="color:var(--text-muted);">' + echapperAttribut(ex.avant) + ' </span>' : '') +
        echapperAttribut(ex.bloc) +
        (ex.apres ? '<span style="color:var(--text-muted);"> ' + echapperAttribut(ex.apres) + '</span>' : '') +
        '</p>'
      : '') +
    '<p class="mb-1">' + (explication ? echapperAttribut(explication) + ' ' : '') +
    'Cela peut venir d’une mise en forme perdue lors du copier / coller, ou d’une technique destinée à influencer un logiciel de tri. Si des mots invisibles ont été ajoutés volontairement, nous vous le déconseillons : cela peut entraîner un rejet, ou un doute sur l’ensemble du CV.</p>' +
    '<p style="color:var(--text-muted);font-size:.85rem;margin:.3rem 0 0;">Repéré par un test au collage et signalé par l’assistant. La couleur et la taille sont perdues au copier / coller : cette vérification reste partielle. Rien n’est bloqué : vous jugez.</p>',
    'warn');
}

// Les 4 blocs qualitatifs, ordre fige (D2).
function _atsBlocsResultat(r) {
  var blocs = [
    { titre: 'Déjà exprimé dans votre CV', gloss: 'ces mots sont déjà là. Rien à faire.', liste: r.dejaExprime, rendreItem: function (it) { return echapperAttribut(it.terme) + _atsSrc(it.origine); } },
    { titre: 'Peut être formulé autrement', gloss: 'vous l’avez sûrement fait, mais avec d’autres mots. Une piste par mot.', liste: r.peutEtreFormuleAutrement, rendreItem: function (it) {
      return '<strong>' + echapperAttribut(it.terme) + '</strong>' + _atsSrc(it.origine) +
        '<br><span style="color:var(--text-muted);">Votre CV dit : « ' + echapperAttribut(it.extraitCV) + ' ».</span>' +
        '<br>' + echapperAttribut(it.piste) +
        _atsBoutonRepere('reformulation : ' + it.terme);
    } },
    { titre: 'Pas retrouvé dans le texte fourni', gloss: 'pas vu dans le texte. À n’ajouter que si ça correspond à votre expérience.', liste: r.pasRetrouve, rendreItem: function (it) {
      return echapperAttribut(it.terme) + _atsSrc(it.origine) + (it.note ? '<br><span style="color:var(--text-muted);font-size:.9rem;">' + echapperAttribut(it.note) + '</span>' : '');
    } },
    { titre: 'À vérifier', gloss: 'l’assistant hésite. À vous de confirmer.', liste: r.aVerifier, rendreItem: function (it) {
      return '« ' + echapperAttribut(it.termeReference) + ' »' + (it.termeCV ? ' et « ' + echapperAttribut(it.termeCV) + ' »' : '') +
        (it.note ? '<br><span style="color:var(--text-muted);font-size:.9rem;">' + echapperAttribut(it.note) + '</span>' : '') +
        _atsBoutonRepere('à vérifier : ' + it.termeReference);
    } }
  ];
  return blocs.map(function (b) {
    var liste = Array.isArray(b.liste) ? b.liste : [];
    var corps = liste.length
      ? '<ul style="padding-left:1.1rem;">' + liste.map(function (it) { return '<li style="margin:.4rem 0;">' + b.rendreItem(it) + '</li>'; }).join('') + '</ul>'
      : '<p style="color:var(--text-muted);">Rien dans cette liste.</p>';
    return '<details class="cv-section ats-depli"' + (b === blocs[0] ? ' open' : '') + '>' +
      '<summary style="cursor:pointer;list-style:none;"><strong>' + b.titre + '</strong>' +
      '<br><span style="font-weight:400;color:var(--text-muted);font-size:.9rem;">' + b.gloss + '</span></summary>' +
      '<div style="margin-top:.5rem;">' + corps + '</div></details>';
  }).join('');
}

function _atsSrc(origine) {
  if (origine === 'offre') { return ' <span style="color:var(--text-muted);font-size:.85rem;">· mot de l’offre</span>'; }
  if (origine === 'fiche-metier') { return ' <span style="color:var(--text-muted);font-size:.85rem;">· fiche métier</span>'; }
  if (origine === 'web') { return ' <span style="color:var(--text-muted);font-size:.85rem;">· source en ligne</span>'; }
  return '';
}

// Geste ancre partage (docs/CONTRAT_ANCRAGE_ERIP.md) : `libelle` decrit le
// MOMENT (« Les mots de mon CV -- ... »), la personne ecrit son texte dans
// le picker. Jamais un contenu deja redige.
function _atsBoutonRepere(libelle) {
  if (typeof reperesBoutonAncre !== 'function') { return ''; }
  try {
    var html = reperesBoutonAncre({ libelle: 'Les mots de mon CV : ' + libelle });
    return html ? '<div style="margin-top:.4rem;">' + html + '</div>' : '';
  } catch (e) { return ''; }
}

// « Les mots que l'offre met en avant » : la reunion des termes des 4
// listes, une liste neutre (jamais une case a cocher ni un compteur).
function _atsBlocMotsReference(r) {
  var termes = [];
  ['dejaExprime', 'peutEtreFormuleAutrement', 'pasRetrouve'].forEach(function (k) {
    (r[k] || []).forEach(function (it) { if (it.terme && termes.indexOf(it.terme) === -1) { termes.push(it.terme); } });
  });
  (r.aVerifier || []).forEach(function (it) { if (it.termeReference && termes.indexOf(it.termeReference) === -1) { termes.push(it.termeReference); } });
  if (!termes.length) { return ''; }
  return '<details class="cv-section ats-depli">' +
    '<summary style="cursor:pointer;list-style:none;font-weight:600;">&#128278; Les mots que l’offre met en avant</summary>' +
    '<div style="margin-top:.5rem;">' +
    '<p style="color:var(--text-muted);font-size:.9rem;">Ce n’est pas une liste à cocher, ni une note. C’est le vocabulaire de l’offre : ce que ce recruteur attend, et souvent ce que son logiciel de tri cherche. Les blocs ci-dessous vous disent, pour chacun, où vous en êtes.</p>' +
    '<p>' + termes.map(function (t) { return '<span class="badge bg-secondary" style="margin:.15rem;font-weight:400;">' + echapperAttribut(t) + '</span>'; }).join('') + '</p>' +
    '<p style="color:var(--text-muted);font-size:.9rem;margin-bottom:0;">Répondre à une offre, c’est reprendre ces mots <strong>quand ils correspondent vraiment à ce que vous avez fait</strong> : dans vos expériences, votre phrase d’accroche, et votre lettre de motivation.</p>' +
    '</div></details>';
}

function _atsBlocSansOffre(so) {
  return '<div class="cv-section" style="background:var(--accent-bg-subtle);border-left:4px solid var(--accent);">' +
    '<p class="mb-1"><strong>&#127919; Sans offre précise</strong></p>' +
    (so.clarificationProjet ? '<p class="mb-1">' + echapperAttribut(so.clarificationProjet) + '</p>' : '') +
    (so.motsPrioritaires && so.motsPrioritaires.length
      ? '<p class="mb-0">Trois mots-clés prioritaires à travailler : ' +
        so.motsPrioritaires.map(function (m) { return '<strong>' + echapperAttribut(m) + '</strong>'; }).join(', ') + '.</p>'
      : '') +
    '</div>';
}

function _atsBlocChangements(liste) {
  liste = Array.isArray(liste) ? liste : [];
  if (!liste.length) { return ''; }
  return '<div class="cv-section" style="border-left:4px solid var(--accent);">' +
    '<p class="mb-1"><strong>&#127919; Vos changements prioritaires</strong></p>' +
    '<p style="color:var(--text-muted);font-size:.9rem;">Des changements précis, à faire vous-même. Ils ne garantissent rien : ils rapprochent le vocabulaire de votre CV de celui de la référence. On garde le sens et la vérité de ce que vous avez fait.</p>' +
    '<ol style="padding-left:1.2rem;">' +
    liste.map(function (c) {
      return '<li style="margin:.4rem 0;">Dans « ' + echapperAttribut(c.experienceConcernee || 'votre expérience') + ' », écrire <strong>« ' + echapperAttribut(c.motReference) + ' »</strong> là où vous avez mis « ' + echapperAttribut(c.phraseCV) + ' »' + (c.condition ? ', ' + echapperAttribut(c.condition) : '') + '.</li>';
    }).join('') +
    '</ol>' +
    _atsBoutonRepere('changements prioritaires') +
    '</div>';
}

function _atsBonASavoir(r) {
  return '<details class="cv-section ats-depli">' +
    '<summary style="cursor:pointer;list-style:none;"><strong>&#9989; Bon à savoir sur ce résultat</strong></summary>' +
    '<div style="margin-top:.5rem;">' +
    '<p>L’analyse porte sur le CV que vous avez <strong>anonymisé</strong>. L’absence de nom, de téléphone ou d’adresse est normale : elle n’est <strong>jamais</strong> comptée comme un manque.</p>' +
    '<p>Il n’y a pas de bon ou de mauvais CV. Peu d’entreprises utilisent un logiciel de tri, surtout quand on postule <strong>en ligne</strong>. Ces changements restent utiles même sans logiciel : ils rendent votre CV plus clair pour un recruteur.</p>' +
    (r.referenceFaible ? '<p style="color:var(--text-muted);">La référence fournie était courte : la comparaison est moins précise, on s’en est tenu aux mots réellement présents.</p>' : '') +
    (r.cvPeuFourni ? '<p style="color:var(--text-muted);">Votre CV contient peu de texte : voyez ces mots comme des pistes pour décrire ce que vous avez fait.</p>' : '') +
    '<div class="d-flex gap-2 flex-wrap">' +
    '<button type="button" class="btn btn-outline-secondary btn-sm" id="btnAtsFenetreForme">&#128196; Mise en forme et logiciels de tri</button>' +
    '<button type="button" class="btn btn-outline-secondary btn-sm" id="btnAtsFenetreFaq">&#8505;&#65039; Comprendre les logiciels de tri (ATS)</button>' +
    '</div></div></details>';
}

function _atsBrancherResultat() {
  var re = document.getElementById('btnAtsRecoller');
  if (re) { re.addEventListener('click', function () { atsAllerA('coller'); }); }
  var f = document.getElementById('btnAtsVersFiche');
  if (f) { f.addEventListener('click', function () { atsAllerA('emporter'); }); }
  var ff = document.getElementById('btnAtsFenetreForme');
  if (ff) { ff.addEventListener('click', _atsOuvrirFenetreForme); }
  var fq = document.getElementById('btnAtsFenetreFaq');
  if (fq) { fq.addEventListener('click', _atsOuvrirFenetreFaq); }
  if (typeof reperesBrancherBoutonAncre === 'function') {
    try { reperesBrancherBoutonAncre(); } catch (e) { /* no-op */ }
  }
}

// ============================================================
//  ECRAN 4 -- MA FICHE  (nouvel ecran)
// ============================================================

function _atsRendreEmporter() {
  var r = _atsEtat.resultat || {};
  var mots = (Array.isArray(r.peutEtreFormuleAutrement) ? r.peutEtreFormuleAutrement.map(function (x) { return x.terme; }) : [])
    .concat(Array.isArray(r.changementsPrioritaires) ? r.changementsPrioritaires.map(function (x) { return x.motReference; }) : []);
  var motsUniques = [];
  mots.forEach(function (m) { if (m && motsUniques.indexOf(m) === -1) { motsUniques.push(m); } });

  return '<div class="text-center"><h1>Ce que vous emportez</h1>' +
    '<p class="sousTitre">Des éléments de travail à relire, jamais un résultat figé. Aucun enregistrement automatique.</p></div>' +
    '<div class="cv-section">' +
    '<p class="mb-1"><strong>&#128203; Votre aide-mémoire « Vocabulaire et CV »</strong></p>' +
    '<p style="color:var(--text-muted);font-size:.9rem;">Cochez les mots que vous voulez retenir. Il n’est pas nécessaire de tous les utiliser. Vous les remplacez ensuite vous-même dans votre CV.</p>' +
    (motsUniques.length
      ? '<ul style="list-style:none;padding-left:0;">' + motsUniques.map(function (m, i) {
          return '<li><label><input type="checkbox" data-ats-fiche-mot="' + echapperAttribut(m) + '"' + (_atsEtat.fiche[m] ? ' checked' : '') + '> « ' + echapperAttribut(m) + ' »</label></li>';
        }).join('') + '</ul>'
      : '<p style="color:var(--text-muted);">Rien à cocher : la comparaison n’a pas dégagé de mot à travailler.</p>') +
    '<div class="d-flex gap-2 flex-wrap">' +
    '<button type="button" class="btn btn-primary btn-sm" id="btnAtsCopierFiche">&#128203; Copier ma fiche</button>' +
    '<button type="button" class="btn btn-outline-secondary btn-sm" id="btnAtsImprimerFiche">&#128424;&#65039; Imprimer</button>' +
    '</div>' +
    '<p style="color:var(--text-muted);font-size:.85rem;margin-top:.4rem;">Le texte est copié : vous pouvez le coller dans un mail, un document, ou le garder.</p>' +
    '</div>' +

    _atsBlocQuestionsConseiller(r) +

    '<div class="cv-section">' +
    '<p class="mb-1"><strong>&#9999;&#65039; Votre phrase d’accroche et votre lettre</strong></p>' +
    '<p>La phrase d’accroche (le titre ou le court résumé en haut du CV) est l’endroit idéal pour montrer que vous avez compris l’offre : reprenez-y les mots forts de l’annonce, quand ils décrivent vraiment ce que vous savez faire. Votre lettre de motivation gagne à aller dans le même sens.</p>' +
    '<div class="d-flex gap-2 flex-wrap">' +
    '<button type="button" class="btn btn-outline-secondary btn-sm" id="btnAtsEditeurCV">Ouvrir l’éditeur de mon CV</button>' +
    '<button type="button" class="btn btn-outline-secondary btn-sm" id="btnAtsLettre">Ouvrir « Coécrire ma lettre de motivation »</button>' +
    '</div>' +
    '<p style="color:var(--text-muted);font-size:.85rem;margin-top:.4rem;">L’application ne réécrit pas votre accroche à votre place : vous gardez la main sur chaque mot. Votre comparaison reste, vous pourrez y revenir.</p>' +
    '</div>' +

    _atsEncart('&#9875;&#65039;', 'Aucun enregistrement automatique. Si un mot ou une reformulation compte pour la suite, gardez-le dans Mes Repères, votre espace de notes personnel, accessible partout dans l’application.') +

    '<div class="cv-section">' +
    '<button type="button" class="btn btn-primary btn-sm" id="btnAtsRefaire">Refaire la comparaison pour une autre offre</button>' +
    '<p style="color:var(--text-muted);font-size:.85rem;margin-top:.3rem;">Cela remplace la comparaison actuelle. Ce que vous avez gardé dans Mes Repères ne bouge pas.</p>' +
    '</div>' +

    '<div class="cv-section">' +
    '<p style="color:var(--text-muted);font-size:.9rem;margin:0 0 .3rem;">Pour aller plus loin, si vous le souhaitez</p>' +
    '<p class="mb-1">Cet outil regarde les <strong>mots</strong>. Pour un regard sur le <strong>fond</strong> de votre candidature, ouvrez « Analyser ma candidature ».</p>' +
    '<button type="button" class="btn btn-outline-secondary btn-sm" id="btnAtsBilan">Ouvrir « Analyser ma candidature »</button>' +
    '</div>' +

    '<div class="text-center" style="margin-top:1rem;">' +
    '<button type="button" id="btnAtsTerminer" class="btn btn-primary btn-lg">Terminer</button>' +
    '</div>';
}

// Questions a poser au conseiller, derivees du resultat (les « a verifier »
// et les termes non retrouves : c'est la que la personne a besoin d'un avis).
function _atsQuestionsConseiller(r) {
  r = r || {};
  var questions = [];
  (r.aVerifier || []).slice(0, 3).forEach(function (it) {
    questions.push('Est-ce que « ' + it.termeReference + ' » décrit bien ce que je faisais' + (it.termeCV ? ' quand j’écris « ' + it.termeCV + ' »' : '') + ' ?');
  });
  (r.pasRetrouve || []).slice(0, 2).forEach(function (it) {
    questions.push('Ai-je vraiment fait quelque chose qui correspond à « ' + it.terme + ' » ?');
  });
  (r.changementsPrioritaires || []).slice(0, 2).forEach(function (c) {
    questions.push('Puis-je écrire « ' + c.motReference + ' » pour mon expérience « ' + (c.experienceConcernee || 'ce poste') + ' » ?');
  });
  var uniques = [];
  questions.forEach(function (q) { if (uniques.indexOf(q) === -1) { uniques.push(q); } });
  return uniques.slice(0, 4);
}

function _atsBlocQuestionsConseiller(r) {
  var qs = _atsQuestionsConseiller(r);
  if (!qs.length) { return ''; }
  return '<div class="cv-section">' +
    '<p class="mb-1"><strong>&#10067; Questions à poser à votre conseiller</strong></p>' +
    '<ul style="padding-left:1.2rem;">' + qs.map(function (q) { return '<li>' + echapperAttribut(q) + '</li>'; }).join('') + '</ul>' +
    '<p style="color:var(--text-muted);font-size:.85rem;margin-bottom:0;">Ces questions se copient avec la fiche.</p>' +
    '</div>';
}

function _atsBrancherEmporter() {
  Array.prototype.forEach.call(document.querySelectorAll('[data-ats-fiche-mot]'), function (cb) {
    cb.addEventListener('change', function () { _atsEtat.fiche[cb.getAttribute('data-ats-fiche-mot')] = cb.checked; });
  });
  var cop = document.getElementById('btnAtsCopierFiche');
  if (cop) { cop.addEventListener('click', _atsCopierFiche); }
  var imp = document.getElementById('btnAtsImprimerFiche');
  if (imp) { imp.addEventListener('click', function () { if (typeof window !== 'undefined' && window.print) { window.print(); } }); }
  var ed = document.getElementById('btnAtsEditeurCV');
  if (ed) { ed.addEventListener('click', function () { if (typeof ouvrirAtelierCV === 'function') { ouvrirAtelierCV(); } else if (typeof naviguerVers === 'function') { naviguerVers('cv'); } }); }
  var le = document.getElementById('btnAtsLettre');
  if (le) { le.addEventListener('click', function () { if (typeof naviguerVers === 'function') { naviguerVers('co-lettre'); } }); }
  var bi = document.getElementById('btnAtsBilan');
  if (bi) { bi.addEventListener('click', function () { if (typeof naviguerVers === 'function') { naviguerVers('bilan'); } }); }
  var rf = document.getElementById('btnAtsRefaire');
  if (rf) { rf.addEventListener('click', function () { _atsEtat.resultat = null; _atsEtat.reponseCollee = ''; atsAllerA('preparer'); }); }
  var t = document.getElementById('btnAtsTerminer');
  if (t) { t.addEventListener('click', function () { if (typeof naviguerVers === 'function') { naviguerVers('ats-intro'); } }); }
}

function _atsFicheTexte() {
  var r = _atsEtat.resultat || {};
  var lignes = ['Aide-mémoire : les mots de mon CV', ''];
  var choisis = Object.keys(_atsEtat.fiche).filter(function (k) { return _atsEtat.fiche[k]; });
  if (choisis.length) {
    lignes.push('Mots à reprendre dans mon CV :');
    choisis.forEach(function (m) { lignes.push('- ' + m); });
    lignes.push('');
  }
  if (Array.isArray(r.changementsPrioritaires) && r.changementsPrioritaires.length) {
    lignes.push('Changements précis :');
    r.changementsPrioritaires.forEach(function (c) {
      lignes.push('- « ' + c.motReference +' » à la place de « ' + c.phraseCV + ' » (' + (c.experienceConcernee || '') + ')' + (c.condition ? ', ' + c.condition : ''));
    });
    lignes.push('');
  }
  var qs = _atsQuestionsConseiller(r);
  if (qs.length) {
    lignes.push('Questions pour mon conseiller :');
    qs.forEach(function (q) { lignes.push('- ' + q); });
    lignes.push('');
  }
  lignes.push('Il n’est pas nécessaire de tous les utiliser.');
  return lignes.join('\n');
}

function _atsCopierFiche() {
  var texte = _atsFicheTexte();
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texte).then(function () {
      if (typeof afficherToast === 'function') { afficherToast('Fiche copiée.'); }
    }, function () { /* silencieux */ });
  }
}

// ============================================================
//  FENETRES
// ============================================================

// FAQ des 9 questions -- propre au module (D10 revisee). La 1re reutilise
// le corps de la fiche Lexique « ats » (une seule source pour la definition).
function _atsFaqDefinition() {
  if (typeof LEXIQUE_FICHES !== 'undefined' && Array.isArray(LEXIQUE_FICHES)) {
    var f = LEXIQUE_FICHES.filter(function (x) { return x.id === 'ats'; })[0];
    if (f && f.corps) { return f.corps; }
  }
  return 'Un ATS (Applicant Tracking System, logiciel de suivi des candidatures) est un outil utilisé par de nombreux recruteurs pour trier automatiquement les CV reçus, souvent avant qu’une personne ne les lise.';
}

function _atsFaq() {
  return [
    { q: 'Qu’est-ce qu’un logiciel de tri ?', r: _atsFaqDefinition() },
    { q: 'Ce module est-il un logiciel de tri ?', r: 'Non. Ce module n’est pas un logiciel de tri et n’a aucun accès à celui d’un employeur. Il en reproduit la vérification principale : il regarde, comme le ferait un logiciel de tri, si les mots attendus pour le poste sont présents dans votre CV, et vous montre en clair lesquels vous pourriez faire ressortir. Il ne classe rien, il ne note rien.' },
    { q: 'Est-ce qu’il rejette mon CV tout seul ?', r: 'Non. Il classe les candidatures pour que le recruteur regarde d’abord les plus proches du poste. C’est une personne qui décide. L’idée qu’un robot rejette 75 % des CV vient d’un argument commercial de 2012, jamais vérifié.' },
    { q: 'Comment savoir si l’entreprise en utilise un ?', r: 'On ne peut pas le savoir à coup sûr. Indice : si vous postulez en remplissant un formulaire en ligne, il y a plus de chances qu’un logiciel de tri soit derrière. Par courriel ou en main propre, c’est rare. Dans le doute, un CV clair avec les bons mots est utile de toute façon.' },
    { q: 'L’offre d’emploi est déjà pleine de mots-clés', r: 'Quand il y a une annonce, elle contient presque toujours les mots que le logiciel de tri va chercher : l’intitulé du poste, les compétences demandées, les outils, le vocabulaire du métier. Répondre à cette offre, c’est faire en sorte que votre CV parle la même langue, quand ces mots décrivent ce que vous avez réellement fait.' },
    { q: 'Comment lit-il mon CV ?', r: 'Il range le texte dans des cases : nom, coordonnées, expériences, formations, compétences, dates. Il ne comprend pas les phrases. Repères utiles : des titres de rubriques classiques, les sigles écrits en entier une fois, des dates lisibles.' },
    { q: 'Les mots-clés, les « quotas »', r: 'Le logiciel compare les mots de l’offre avec ceux de votre CV et fait remonter les CV les plus proches. Ce n’est pas un quota à atteindre : c’est un classement. Un recruteur peut aussi chercher un mot précis ; si le mot n’est nulle part dans votre CV, votre CV ne ressort pas de cette recherche.' },
    { q: 'Les questions éliminatoires au moment de postuler', r: 'Beaucoup de formulaires posent des questions fermées : autorisation de travailler, permis obligatoire, années d’expérience, mobilité. Une réponse « non » à une question obligatoire peut écarter la candidature automatiquement. Ce n’est pas votre CV, c’est le formulaire. Répondez honnêtement ; notez toute condition floue comme question pour votre conseiller.' },
    { q: 'Et les techniques pour « tromper » le logiciel ?', r: 'Écrire des mots-clés en blanc, en tout petit, dans les marges, ou remplir le CV d’une liste de mots : ça se voit. Le logiciel lit le texte blanc comme le texte noir, et beaucoup d’outils montrent au recruteur le contenu extrait à côté du CV. Une candidature repérée ainsi est souvent écartée. La seule chose qui aide vraiment : décrire vos expériences réelles avec les bons mots.' },
    { q: 'Pourquoi ce module ne donne pas de score', r: 'Les « scores de compatibilité » affichés par certains sites sont des estimations faites par ces sites, que le recruteur ne voit jamais. Un score rassure ou inquiète pour rien. Ici, on vous montre du vocabulaire à ajuster, pas une note.' }
  ];
}

function _atsOuvrirFenetreFaq() {
  var corps = '<p style="color:var(--text-muted);">Quelques repères, en langage simple. Ouvrez seulement ce qui vous intéresse.</p>' +
    _atsFaq().map(function (item) {
      return '<details class="cv-section ats-depli"><summary style="cursor:pointer;list-style:none;font-weight:600;">' +
        echapperAttribut(item.q) + '</summary><p style="margin-top:.5rem;">' + echapperAttribut(item.r) + '</p></details>';
    }).join('') +
    '<p style="color:var(--text-muted);font-size:.85rem;">Sources : France Travail, APEC, guides publics. À revérifier tous les 6 à 12 mois.</p>';
  _atsOuvrirFenetre('Comprendre les logiciels de tri (ATS)', corps);
}

function _atsOuvrirFenetreForme() {
  var corps = '<p>Le module ne voit que le <strong>texte</strong> de votre CV, pas sa mise en page. Voici des repères généraux, valables pour la plupart des logiciels de tri :</p>' +
    '<ul style="padding-left:1.25rem;">' +
    '<li>Un texte sélectionnable (pas une image de CV).</li>' +
    '<li>Éviter les tableaux complexes et les colonnes multiples, qui cassent l’ordre de lecture.</li>' +
    '<li>Éviter les images qui contiennent du texte.</li>' +
    '<li>Éviter de mettre une information importante dans l’en-tête ou le pied de page.</li>' +
    '<li>Une police classique.</li>' +
    '<li>Vérifier le rendu après l’export en PDF.</li>' +
    '</ul>' +
    _atsEncart('&#128161;', '<strong>Test simple :</strong> si votre texte apparaît mélangé ou incompréhensible quand vous le collez dans la comparaison, le logiciel du recruteur le lira de la même façon.') +
    '<p style="color:var(--text-muted);font-size:.85rem;">Guides utiles (vous quittez l’application) : la page de France Travail sur la lecture des CV par les logiciels. Ces liens sont vérifiés tous les 6 à 12 mois.</p>';
  _atsOuvrirFenetre('Mise en forme et logiciels de tri', corps);
}

function _atsOuvrirFenetreMetier() {
  var metiers = _atsMetiersBase();
  var corps = '<p style="color:var(--text-muted);">Ces fiches viennent du référentiel officiel des métiers (France Travail).</p>' +
    '<input type="text" class="form-control mb-2" id="atsMetierRecherche" placeholder="Chercher un métier (accueil, vente, aide à domicile...)">' +
    '<div id="atsMetierListe">' +
    metiers.map(function (m) {
      return '<button type="button" class="btn btn-outline-secondary btn-sm d-block w-100 text-start mb-1" data-ats-metier="' + echapperAttribut(m.id) + '">' + echapperAttribut(m.nom) + '</button>';
    }).join('') +
    '</div>';
  _atsOuvrirFenetre('Choisir une fiche métier', corps);
  var champ = document.getElementById('atsMetierRecherche');
  if (champ) {
    champ.addEventListener('input', function () {
      var q = champ.value.toLowerCase();
      Array.prototype.forEach.call(document.querySelectorAll('#atsMetierListe [data-ats-metier]'), function (b) {
        b.style.display = b.textContent.toLowerCase().indexOf(q) === -1 ? 'none' : '';
      });
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll('#atsMetierListe [data-ats-metier]'), function (b) {
    b.addEventListener('click', function () {
      var m = metiers.filter(function (x) { return x.id === b.getAttribute('data-ats-metier'); })[0];
      if (m) {
        _atsEtat.metier = { nom: m.nom, rome: m.rome, vocabulaire: m.vocabulaire };
      }
      if (typeof fermerFenetreERIP === 'function') { fermerFenetreERIP(); }
      ouvrirAts();
    });
  });
}

// Amorce de vocabulaire tiree de data/metiers.js (baseMetiers). Pas de
// duplication : on lit la base existante.
function _atsMetiersBase() {
  if (typeof baseMetiers === 'undefined' || !Array.isArray(baseMetiers)) { return []; }
  return baseMetiers.map(function (m) {
    var voc = [].concat(m.savoirFaire || [], m.savoirEtre || [], m.savoirs || []);
    return { id: m.id, nom: m.nom, rome: m.rome || '', vocabulaire: voc.join(', ') };
  });
}

function _atsOuvrirFenetre(titre, corpsHTML) {
  if (typeof ouvrirFenetreERIP === 'function') {
    ouvrirFenetreERIP({ titre: titre, contenuHTML: corpsHTML });
  }
}

// ============================================================
//  ENREGISTREMENT DES FONCTIONS GLOBALES
// ============================================================

if (typeof window !== 'undefined') {
  window.pageAts = pageAts;
  window.ouvrirAts = ouvrirAts;
  window.atsAllerA = atsAllerA;
  window.atsRetourVersPresentation = atsRetourVersPresentation;
  window.atsRevenirDeLaPresentation = atsRevenirDeLaPresentation;
  window.atsRepriseContinuer = atsRepriseContinuer;
  window.atsReinitialiser = atsReinitialiser;
  window.atsMarquerReprisePendante = atsMarquerReprisePendante;
  window.atsExporterEtatPourSauvegarde = atsExporterEtatPourSauvegarde;
  window.atsRestaurerEtatDepuisSauvegarde = atsRestaurerEtatDepuisSauvegarde;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    atsEtatNeuf: atsEtatNeuf,
    _atsFaq: _atsFaq,
    _atsMetiersBase: _atsMetiersBase,
    _atsConstruirePrompt: _atsConstruirePrompt,
    ATS_ETAPES: ATS_ETAPES
  };
}
