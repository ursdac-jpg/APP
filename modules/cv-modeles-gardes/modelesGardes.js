/* ============================================================
   Module « Mes modèles » : partie navigateur (la logique pure est dans logique.js, testée par `npm test`).
   Chantier : docs/CHANTIER_CREER_CV_SANS_ASSISTANT_2026-10-25.md ; maquette : docs/MAQUETTE_CREER_CV_TROIS_PARCOURS_ET_MODELES_2026-10-25.html.

   Trois temps :
   1. « Créer un nouveau CV » (introduction) : le bloc « Voir nos modèles de CV » (mgHtmlBlocIntro, mgActionsIntro).
   2. L'essai : la page « Vos documents » ouverte sur un CV d'EXEMPLE (dossier vierge prêté à la place du vrai le temps de l'essai, même mécanisme que
      « Un CV, plusieurs métiers » : dossierEchange.js), sans les panneaux de contenu. « Garder ce modèle » (sous l'aperçu) garde le style seul, 5 au plus.
   3. « Vos documents » du vrai CV : le bloc « Mes modèles » (cartes avec le vrai texte de la personne), un clic pose le modèle, « Remodeler » ouvre tous les réglages.

   La liste des modèles gardés vit HORS du dossier (viderContenuCVDossier, au départ de chaque parcours, ne doit pas l'effacer) et ne contient aucune information
   personnelle. Elle est enregistrée avec la disquette (collecterEtatsModulesPourSauvegarde).
   Dépendances (briques existantes, jamais recopiées) : dossierEchange.js (ucpmRendreCopie, ucpmRestaurerDossier, _ucpmDossierReference), page5MesCv.js
   (_ucpmP5MontrerMiniature), pageResultats / construireMiseEnPageCV / _mepRerendre (js/app.js), confirmerAction, barreNavigation.
   ============================================================ */

var _mgListe = [];                    // les modèles gardés : [{ id, nom, style: { pdf, mep } }], 5 au plus
var _mgEssai = null;                  // pendant l'essai : { origine, etatApercu }
var _mgAilleursOuvert = false;        // l'explication « Aucun modèle ne vous plaît ? » est ouverte
var _mgRemodeler = false;             // « Vos documents » : tous les réglages sont montrés (sinon : le choix parmi les modèles gardés)
var _mgRenduEnCours = false;          // les cartes se préparent : le dossier est prêté une carte après l'autre, on n'agit pas entre-temps
var _mgBase = { id: null, sig: null }; // le style tel qu'il s'affiche juste après la pose d'un modèle gardé (le moteur ajuste alors lui-même des espacements au contenu) : sert à savoir si la personne l'a modifié
var _mgApercus = {};                  // id d'un modèle gardé -> { html, css } : sa petite image, prise dans l'aperçu au moment de le garder (perdue au rechargement de la page : un repère de couleur la remplace)
var _mgDernierAjoute = null;
var _mgRendus = {};                   // id d'un modèle gardé -> le rendu de son CV (pour le réafficher à une autre taille sans le refaire)          // le dernier modèle gardé : sa place s'anime une fois
var _mgMinuteurEssai = null;          // pendant l'essai : surveille le style affiché pour tenir à jour « Gardé » / « Garder ce modèle »
var _mgSigAffichee = '';

/* ---------- Mémoire (disquette) ---------- */
function mgExporterEtatPourSauvegarde() { return _mgListe.length ? { liste: JSON.parse(JSON.stringify(_mgListe)) } : null; }
function mgRestaurerEtatDepuisSauvegarde(etat) { _mgListe = mgNormaliserListe(etat && etat.liste); }
function mgReinitialiser() { _mgListe = []; _mgApercus = {}; _mgRendus = {}; _mgDernierAjoute = null; _mgAilleursOuvert = false; _mgRemodeler = false; }

/* ---------- Petits outils ---------- */
function _mgEsc(t) { return (typeof echapperAttribut === 'function') ? echapperAttribut(String(t == null ? '' : t)) : String(t == null ? '' : t); }

// Le nom du modèle affiché (celui de la galerie), d'après la clé « creatif:<id> », « sobre:<variante> » ou « standard ».
function _mgNomModeleCourant() {
  var cle = (typeof _mepCleModeleActuel === 'function') ? _mepCleModeleActuel() : null;
  if (!cle) { return 'Modèle'; }
  if (cle === 'standard') { return 'Standard'; }
  var p = cle.split(':'), l, i;
  if (p[0] === 'creatif' && typeof _MEP_GALERIE_CREATIF !== 'undefined') { for (i = 0; i < _MEP_GALERIE_CREATIF.length; i++) { l = _MEP_GALERIE_CREATIF[i]; if (l[0] === p[1]) { return l[1]; } } }
  if (p[0] === 'sobre' && typeof _MEP_GALERIE_SOBRE !== 'undefined') { for (i = 0; i < _MEP_GALERIE_SOBRE.length; i++) { l = _MEP_GALERIE_SOBRE[i]; if (l[1] === p[1]) { return 'Sobre : ' + l[2]; } } }
  return 'Modèle';
}

// Relit l'état réel des réglages dans l'aperçu (le moteur le range dans dossier.pdfReglages à chaque rafraîchissement : on prend le plus récent).
function _mgCapturerEtat() {
  try {
    var w = document.querySelector('#zonePdfInlineCV iframe').contentWindow;
    if (w && typeof w._pdfCapturerEtatPersistant === 'function') { dossier.pdfReglages = w._pdfCapturerEtatPersistant(); }
  } catch (e) { /* aperçu pas prêt : on garde ce que le dossier contient */ }
}
// `relire` : relit d'abord l'état réel de l'aperçu (jamais pendant qu'une page se refait : l'ancien aperçu écraserait le style qu'on vient de poser).
function _mgStyleCourant(relire) { if (relire) { _mgCapturerEtat(); } return mgExtraireStyle(dossier.pdfReglages, dossier.reglagesMiseEnPageCV); }

// Le nom affiché d'un modèle gardé : si le même nom revient (plusieurs réglages d'un même modèle), un numéro les distingue.
function _mgLibelle(m) {
  var avant = 0, total = 0;
  _mgListe.forEach(function (x) { if (x.nom === m.nom) { total++; if (_mgListe.indexOf(x) < _mgListe.indexOf(m)) { avant++; } } });
  return m.nom + (total > 1 ? ' (' + (avant + 1) + ')' : '');
}
function _mgCouleur(m) { return (m.style && ((m.style.pdf && m.style.pdf.regCouleurDebut) || (m.style.mep && m.style.mep.accent))) || '#2f6690'; }

// Même rafraîchissement que les réglages de « La mise en page » : l'aperçu est conservé quand c'est possible.
function _mgRerendre() {
  if (typeof _mepConserverApercuPendant === 'function') { _mepConserverApercuPendant(3000); }
  if (typeof _mepRerendre === 'function') { _mepRerendre(); } else { pageResultats(); }
}

/* ---------- 1. L'introduction de « Créer un nouveau CV » ---------- */
function _mgPuces(avecRetirer) {
  return '<div class="d-flex flex-wrap gap-2 justify-content-center my-2">' + _mgListe.map(function (m, i) {
    return '<span style="display:inline-flex;align-items:center;gap:.4rem;border:2px solid var(--success);border-radius:999px;padding:.1rem .35rem .1rem .7rem;background:var(--bg-card);font-size:.88rem;">' +
      '<i style="width:12px;height:12px;border-radius:50%;display:inline-block;background:' + _mgEsc(_mgCouleur(m)) + ';" aria-hidden="true"></i>' + (i + 1) + '. ' + _mgEsc(_mgLibelle(m)) +
      (avecRetirer ? ' <button type="button" class="btn btn-outline-secondary btn-sm py-0" id="btnMgRetirer_' + _mgEsc(m.id) + '" data-mg-retirer="' + _mgEsc(m.id) + '">Retirer</button>' : '') + '</span>';
  }).join('') + '</div>';
}

function mgHtmlBlocIntro() {
  var garde = _mgListe.length
    ? '<div class="cv-section" style="border-left:4px solid var(--success);background:var(--success-bg-subtle);max-width:720px;margin:.6rem auto;text-align:left;">' +
      '<p class="mb-1"><strong>&#9989; Mes modèles gardés : ' + _mgListe.length + ' sur ' + MG_MAX + '</strong></p>' + _mgPuces(true) +
      '<p class="small mb-2" style="color:var(--text-muted);">Ils vous seront proposés, avec votre texte, quel que soit le parcours choisi.</p>' +
      '<div class="d-flex flex-wrap gap-2"><button type="button" class="btn btn-outline-primary btn-sm" id="btnMgVoirModeles">En ajouter ou en changer</button> ' +
      '<button type="button" class="btn btn-outline-secondary btn-sm" id="btnMgOublier">Oublier mes modèles</button></div></div>'
    : '<button type="button" class="btn btn-primary" id="btnMgVoirModeles">Regarder nos modèles</button>';
  return '<div class="cv-section text-center" id="blocMgVoirModeles" style="margin-top:1rem;">' +
    '<h2 style="font-size:1.1rem;"><i class="bi bi-grid-1x2" aria-hidden="true"></i> Voir nos modèles de CV</h2>' +
    '<p class="small mb-2" style="color:var(--text-muted);">Regardez ce que donnera votre CV, avant de remplir quoi que ce soit. <strong>Gardez jusqu’à ' + MG_MAX + ' modèles</strong> : vous les retrouverez, avec votre texte, au moment de choisir la mise en page.</p>' +
    garde +
    '<p class="small mt-3 mb-1" style="color:var(--text-muted);">Aucun modèle ne vous plaît ? Vous pouvez faire votre CV ailleurs, puis venir ici pour votre lettre de motivation et la préparation de l’entretien.</p>' +
    '<button type="button" class="btn btn-outline-secondary btn-sm" id="btnMgAilleurs">' + (_mgAilleursOuvert ? 'Fermer' : 'Comment faire ?') + '</button>' +
    (_mgAilleursOuvert
      ? '<div class="cv-section small text-start mt-2" style="max-width:640px;margin-left:auto;margin-right:auto;">Faites votre CV sur la plateforme de votre choix. Ensuite, depuis « Mes documents », « Reprendre mon CV » vous laisse déposer ce CV : l’application s’en sert pour votre lettre de motivation et votre entretien.</div>'
      : '') +
    '</div>';
}

// Les boutons du bloc (câblés par la page d'introduction : chaque { id, action }). `rendre` redessine l'introduction.
function mgActionsIntro(rendre) {
  var actions = [
    { id: 'btnMgVoirModeles', action: function () { mgOuvrirEssai(); } },
    { id: 'btnMgOublier', action: function () { _mgListe = []; rendre(); } },
    { id: 'btnMgAilleurs', action: function () { _mgAilleursOuvert = !_mgAilleursOuvert; rendre(); } }
  ];
  _mgListe.forEach(function (m) {
    actions.push({ id: 'btnMgRetirer_' + m.id, action: function () { _mgListe = mgRetirer(_mgListe, m.id); rendre(); } });
  });
  return actions;
}

/* ---------- 2. L'essai des modèles ---------- */
function mgEssaiActif() { return !!window._modeEssaiModeles; }

// Ouvre la page de mise en page sur un CV d'exemple : un dossier vierge est prêté à la place du vrai jusqu'à la fin de l'essai (ucpmRestaurerDossier le remet).
function mgOuvrirEssai() {
  if (_mgEssai || (typeof _ucpmDossierReference !== 'undefined' && _ucpmDossierReference)) { return; }
  _mgEssai = { origine: pageActuelle || 'creer-cv', etatApercu: JSON.stringify(etatApercuInline.cv) };
  _ucpmDossierReference = window.dossier;
  _ucpmEchangeLong = true;
  viderContenuCVDossier();                       // un dossier vierge prend la place (jamais une copie du vrai : rien de la personne dans l'exemple)
  mgRemplirDossierExemple(window.dossier);
  etatApercuInline.cv.sansAccroche = false;      // l'exemple montre sa phrase d'accroche, quoi que la personne ait fait ailleurs
  _assurerReglagesMiseEnPageCV();
  if (_mgListe.length) {                         // on repart du dernier modèle gardé
    var r = mgAppliquerStyle(dossier.pdfReglages, dossier.reglagesMiseEnPageCV, _mgListe[_mgListe.length - 1].style);
    dossier.pdfReglages = r.pdf; dossier.reglagesMiseEnPageCV = r.mep;
  }
  _mepPileUndo.length = 0; _mepPileRedo.length = 0;
  _mepConserverJusqua = 0;
  window._mepApercuConserve = false;
  window._modeEssaiModeles = true;
  _rectDocOuvert = 'mise-en-page'; _rectDocOuvertPourType = 'cv';
  _mgSigAffichee = '';
  clearInterval(_mgMinuteurEssai);
  _mgMinuteurEssai = setInterval(_mgSurveillerStyle, 700);
  naviguerVers('resultats');
}

// Pendant l'essai : « Gardé » / « Garder ce modèle » suit le style réellement affiché (couleur changée dans l'aperçu, autre modèle...), sans refaire la page.
function _mgSurveillerStyle() {
  if (!_mgEssai || !document.getElementById('mgZoneGarde')) { return; }
  var sig = mgSignature(_mgStyleCourant(true)) + '|' + _mgListe.length;
  if (sig !== _mgSigAffichee) { _mgSigAffichee = sig; mgBrancherEssai(); }
}

// Remet le vrai dossier et tout ce que l'essai a touché. `route` : où aller ensuite (aucune : on reste).
function mgFinEssai(route) {
  if (!_mgEssai) { return; }
  var e = _mgEssai;
  _mgEssai = null;
  clearInterval(_mgMinuteurEssai); _mgMinuteurEssai = null;
  window._modeEssaiModeles = false;
  if (typeof ucpmRestaurerDossier === 'function') { ucpmRestaurerDossier(); }
  try { etatApercuInline.cv = JSON.parse(e.etatApercu); } catch (err) { /* l'état Word se recalcule à l'ouverture suivante */ }
  _mepPileUndo.length = 0; _mepPileRedo.length = 0;
  _mepConserverJusqua = 0;
  var garage = document.getElementById('mepGarageApercu'); if (garage) { garage.remove(); }
  _rectDocOuvert = null; _rectDocOuvertPourType = null;
  if (route) { naviguerVers(route); }
}
function mgFinirEssai() { mgFinEssai(_mgEssai ? _mgEssai.origine : 'creer-cv'); }

// Appelé par naviguerVers : quitter la page autrement que par « J'ai fini de regarder » rend aussi le vrai dossier.
function mgSurNavigation(route) {
  if (route !== 'resultats') {
    if (_mgEssai) { mgFinEssai(null); }
    _mgRemodeler = false;
    _mgRenduEnCours = false;
  }
}

function mgHtmlBandeauEssai() {
  return '<div class="cv-section" id="mgBandeauEssai" role="note" style="border-left:4px solid var(--warning-border);background:var(--warning-bg-subtle);">' +
    '<p class="mb-0" style="color:var(--warning-strong);"><strong><i class="bi bi-clipboard-check" aria-hidden="true"></i> Ceci est un CV d’exemple.</strong> Vos informations ne sont pas encore remplies : vous voyez simplement nos modèles. Gardez ceux qui vous plaisent (jusqu’à ' + MG_MAX + '), vous les retrouverez avec votre texte.</p></div>';
}
function mgBarreEssai() {
  // Sur téléphone la barre n'a pas la place du libellé long : version courte (classes .lib-intro-long / .lib-intro-court, css/style.css).
  return barreNavigation('creer-cv', 'creer-cv', '<span class="lib-intro-long">J’ai fini de regarder &#8594;</span><span class="lib-intro-court">J’ai fini &#8594;</span>', { onclickPrecedent: 'mgFinirEssai()', onclickSuivant: 'mgFinirEssai()' });
}
// Masque ce qui n'a pas de sens sur un exemple : les panneaux de contenu (même règle que « Un CV, plusieurs métiers ») et le résumé avec « Valider le CV ».
function mgCssEssai() {
  return (typeof UCPM_CSS_ASPECT !== 'undefined' ? UCPM_CSS_ASPECT : '') +
    '<style id="styleEssaiModeles">' +
    '#app .bloc-valider-mep,#app #mepCorrections{display:none !important;}' +
    // L'aperçu du CV ne défile jamais dans sa colonne, quel que soit l'écran : la page défile, pas le CV.
    '#app .mep-2col-apercu{max-height:none !important;overflow:visible !important;}' +
    '.mg-zone{margin:.2rem 0 1rem;}' +
    '.mg-zone-ligne{display:flex;flex-wrap:wrap;align-items:center;gap:1rem 1.25rem;}' +
    '.mg-btn-garder{min-height:3.6rem;padding:.75rem 1.5rem;font-size:1.2rem;font-weight:700;display:inline-flex;align-items:center;gap:.6rem;border-radius:14px;}' +
    '.mg-btn-garder .bi{font-size:1.4rem;}' +
    '.mg-slots{display:flex;flex-wrap:wrap;gap:.6rem;align-items:flex-start;}' +
    '.mg-slot{position:relative;width:64px;height:90px;border-radius:6px;overflow:hidden;flex:0 0 64px;}' +
    '.mg-slot-vide{border:2px dashed var(--border-strong);background:var(--bg-subtle);opacity:.65;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-weight:700;}' +
    '.mg-slot-plein{border:2px solid var(--success);background:var(--bg-card);box-shadow:0 1px 4px rgba(0,0,0,.18);}' +
    '.mg-vignette{position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;}' +
    '.mg-slot-num{position:absolute;left:3px;bottom:3px;min-width:1.2rem;text-align:center;background:var(--success);color:#fff;font-size:.72rem;font-weight:700;border-radius:999px;padding:0 .3rem;line-height:1.2rem;}' +
    '.mg-slot-retirer{position:absolute;top:2px;right:2px;width:1.35rem;height:1.35rem;border-radius:50%;border:1px solid var(--border-strong);background:var(--bg-card);color:var(--text-primary,inherit);font-size:.95rem;line-height:1;padding:0;cursor:pointer;}' +
    '.mg-slot-nouveau{animation:mgApparait .4s ease-out;}' +
    '@keyframes mgApparait{from{transform:scale(.55);opacity:0;}to{transform:scale(1);opacity:1;}}' +
    '.mg-phrase{margin:.5rem 0 0;font-size:.92rem;color:var(--text-muted);}' +
    // Petit écran : les cinq places tiennent sur une ligne sous le bouton.
    '@media (max-width:480px){.mg-slot{width:52px;height:73px;flex:0 0 52px;}.mg-slots{gap:.4rem;}.mg-btn-garder{width:100%;justify-content:center;}}' +
    '</style>';
}

// La petite image d'un modèle gardé, prise dans l'aperçu au moment de le garder (le CV d'exemple tel qu'il est affiché).
function _mgCapturerApercu() {
  try {
    var doc = document.querySelector('#zonePdfInlineCV iframe').contentDocument;
    var conteneur = doc && doc.getElementById('conteneurPage');
    if (!conteneur) { return null; }
    var clone = conteneur.cloneNode(true);
    Array.prototype.forEach.call(clone.querySelectorAll('[contenteditable]'), function (el) { el.removeAttribute('contenteditable'); });
    return { html: clone.innerHTML, css: ucpmStylesDuCv(doc) };
  } catch (e) { return null; }
}

// Les cinq places : celles déjà prises montrent le modèle gardé (avec sa croix pour le retirer), les autres attendent, grisées.
function _mgHtmlPlaces() {
  var h = '';
  for (var i = 0; i < MG_MAX; i++) {
    var m = _mgListe[i];
    if (m) {
      h += '<div class="mg-slot mg-slot-plein' + (m.id === _mgDernierAjoute ? ' mg-slot-nouveau' : '') + '" role="listitem" title="' + _mgEsc(_mgLibelle(m)) + '">' +
        '<div class="mg-vignette" data-ucpm-miniature="mgv_' + _mgEsc(m.id) + '"' + (_mgApercus[m.id] ? '' : ' style="background:' + _mgEsc(_mgCouleur(m)) + ';"') + '></div>' +
        '<span class="mg-slot-num">' + (i + 1) + '</span>' +
        '<button type="button" class="mg-slot-retirer" data-mg-retirer="' + _mgEsc(m.id) + '" aria-label="Retirer le modèle ' + (i + 1) + '" title="Retirer ce modèle">&times;</button></div>';
    } else {
      h += '<div class="mg-slot mg-slot-vide" role="listitem" aria-label="Place libre"><span>' + (i + 1) + '</span></div>';
    }
  }
  return '<div class="mg-slots" role="list" aria-label="Mes modèles gardés">' + h + '</div>';
}

function _mgHtmlZoneGarde() {
  var style = _mgStyleCourant(true);
  var gardeDeja = mgTrouverParStyle(_mgListe, style);
  var plein = !gardeDeja && mgListePleine(_mgListe);
  var bouton = gardeDeja
    ? '<button type="button" class="btn btn-outline-success btn-lg mg-btn-garder" id="btnMgGarder"><i class="bi bi-check-circle-fill" aria-hidden="true"></i> Gardé <span style="font-size:.85rem;font-weight:400;">(cliquez pour le retirer)</span></button>'
    : '<button type="button" class="btn btn-primary btn-lg mg-btn-garder" id="btnMgGarder"' + (plein ? ' disabled' : '') + '><i class="bi bi-plus-circle-fill" aria-hidden="true"></i> Garder ce modèle</button>';
  var suite = gardeDeja ? 'Regardez d’autres modèles si vous le souhaitez.'
    : (plein ? 'Vos ' + MG_MAX + ' places sont prises : retirez un modèle gardé (la croix sur sa petite image) pour en garder un autre.'
      : 'Gardez ceux qui vous plaisent, jusqu’à ' + MG_MAX + '.');
  return '<div id="mgZoneGarde" class="mg-zone"><div class="mg-zone-ligne">' + bouton + _mgHtmlPlaces() + '</div>' +
    '<p class="mg-phrase" role="status"><strong>Modèles gardés : ' + _mgListe.length + ' sur ' + MG_MAX + '.</strong> ' + suite + '</p></div>';
}

// Câble l'essai une fois la page dessinée : la zone « Garder » est posée au-dessus des réglages et de l'aperçu, sur toute la largeur (jamais dans la colonne de l'aperçu, qui ne doit pas défiler).
function mgBrancherEssai() {
  var grille = document.querySelector('.mep-2col-grille');
  if (!grille) { return; }
  var ancienne = document.getElementById('mgZoneGarde'); if (ancienne) { ancienne.remove(); }
  grille.insertAdjacentHTML('beforebegin', _mgHtmlZoneGarde());
  var btn = document.getElementById('btnMgGarder');
  if (btn) { btn.addEventListener('click', mgBasculerGarde); }
  Array.prototype.forEach.call(document.querySelectorAll('#mgZoneGarde [data-mg-retirer]'), function (b) {
    b.addEventListener('click', function () { var id = b.getAttribute('data-mg-retirer'); _mgListe = mgRetirer(_mgListe, id); delete _mgApercus[id]; mgBrancherEssai(); });
  });
  _mgListe.forEach(function (m) { if (_mgApercus[m.id] && typeof _ucpmP5MontrerMiniature === 'function') { _ucpmP5MontrerMiniature('mgv_' + m.id, _mgApercus[m.id], window.innerWidth <= 480 ? 52 : 64); } });
  _mgDernierAjoute = null;
}
function mgBasculerGarde() {
  var style = _mgStyleCourant(true);
  var existant = mgTrouverParStyle(_mgListe, style);
  if (existant) { _mgListe = mgRetirer(_mgListe, existant.id); }
  else {
    var r = mgAjouter(_mgListe, _mgNomModeleCourant(), style);
    if (!r.ok) { mgBrancherEssai(); return; }
    _mgListe = r.liste;
    _mgApercus[r.modele.id] = _mgCapturerApercu();
    _mgDernierAjoute = r.modele.id;
  }
  mgBrancherEssai();   // seule la zone « Garder » est redessinée : l'aperçu ne bouge pas
}

/* ---------- 3. « Vos documents » : Mes modèles ---------- */
// Disposition : les modèles gardés sur UNE ligne (cinq au plus), puis, pour le modèle choisi, ses deux actions (« Remodeler », « Garder celui-ci et exporter »)
// et son grand CV (l'aperçu réel, en lecture seule : un clic dessus l'ouvre très grand). Toute modification passe par « Remodeler ce modèle » : une seule source de vérité.
// Choisir un modèle ne redessine pas la page : seuls l'aperçu (sans blanc, avec la photo de l'ancien) et ce bloc changent.

// Les modèles gardés ne concernent que « Créer un nouveau CV » (jamais l'amélioration d'un CV existant).
function _mgConcerne(docActif) {
  return docActif === 'cv' && !window._modeEssaiModeles && !window._modeModuleUcpm && _mgListe.length > 0 &&
    !!(dossier && (dossier.modeCreation === 'nouveau' || dossier.decouverteTerminee));
}
function _mgCarteActive() {
  var id = dossier && dossier.modeleGardeActifId;
  for (var i = 0; i < _mgListe.length; i++) { if (_mgListe[i].id === id) { return _mgListe[i]; } }
  return null;
}
function _mgPoserStyle(m) {
  _assurerReglagesMiseEnPageCV();
  var r = mgAppliquerStyle(dossier.pdfReglages, dossier.reglagesMiseEnPageCV, m.style);
  dossier.pdfReglages = r.pdf; dossier.reglagesMiseEnPageCV = r.mep;
  dossier.modeleGardeActifId = m.id;
  _mgBase = { id: m.id, sig: null };   // relevé quand l'aperçu est prêt (_mgPrendreBase)
}
// Relève le style affiché une fois l'aperçu prêt : les ajustements automatiques du moteur au contenu de la personne n'y comptent pas comme des modifications.
function _mgPrendreBase() {
  var a = _mgCarteActive();
  if (a && (_mgBase.id !== a.id || _mgBase.sig === null)) { _mgBase = { id: a.id, sig: mgSignature(_mgStyleCourant(true)) }; _mgStabiliserBase(); }
}
// Le moteur achève ses ajustements un peu après l'affichage : le point de repère est relevé une seconde fois (tant que la personne n'a encore rien modifié : en choix de modèle, elle ne peut rien modifier), pour ne jamais voir une modification qui n'en est pas une.
function _mgStabiliserBase() {
  var id = _mgBase.id;
  setTimeout(function () {
    if (!_mgRemodeler && _mgBase.id === id && pageActuelle === 'resultats' && dossier.modeleGardeActifId === id) { _mgBase = { id: id, sig: mgSignature(_mgStyleCourant(true)) }; }
  }, 2200);
}
// À l'arrivée sur « Vos documents » : le dernier modèle gardé est déjà posé (une seule fois par CV : ensuite, la personne garde la main).
function mgAppliquerArrivee(docActif) {
  if (!_mgConcerne(docActif) || dossier.modeleGardeActifId !== undefined) { return; }
  _mgPoserStyle(_mgListe[_mgListe.length - 1]);
  _mgRemodeler = false;
}

function _mgEstModifie() {
  var active = _mgCarteActive();
  if (!active || _mgBase.id !== active.id || !_mgBase.sig) { return false; }
  return mgSignature(_mgStyleCourant(false)) !== _mgBase.sig;
}
function _mgToutRendu() { return _mgListe.every(function (m) { return !!_mgRendus[m.id]; }); }

// Les modèles gardés, sur une seule ligne : une petite image du CV entier (titres compris), le numéro, la croix pour retirer.
function _mgHtmlRangee(active, modifie) {
  return '<div class="mg-rangee-modeles" style="display:grid;grid-template-columns:repeat(' + MG_MAX + ',minmax(0,1fr));gap:.5rem;align-items:start;">' + _mgListe.map(function (m, i) {
    var sel = active && active.id === m.id;
    var etiquette = 'Modèle ' + (i + 1) + (sel ? (modifie ? ' : choisi (modifié)' : ' : choisi') : '');
    return '<div class="mg-carte-conteneur" data-mg-id="' + _mgEsc(m.id) + '" style="position:relative;min-width:0;">' +
      '<button type="button" class="carte-version-lettre' + (sel ? ' carte-version-lettre-active' : '') + '" data-mg-carte="' + _mgEsc(m.id) + '" aria-pressed="' + (sel ? 'true' : 'false') + '" style="width:100%;min-width:0;max-width:none;padding:.35rem;text-align:center;"' + (_mgRenduEnCours ? ' disabled' : '') + '>' +
      (_mgRemodeler ? '' : '<div data-ucpm-miniature="mg_' + _mgEsc(m.id) + '" class="mg-miniature" style="width:100%;aspect-ratio:794/1123;margin:0 auto .3rem;border:1px solid var(--border);border-radius:3px;background:var(--bg-card);overflow:hidden;position:relative;"><span style="color:var(--text-muted);padding:.3rem;display:block;font-size:.7rem;">…</span></div>') +
      '<div class="fw-bold" style="font-size:.76rem;line-height:1.2;' + (sel ? 'color:var(--accent);' : '') + '">' + etiquette + '</div></button>' +
      // La croix, en haut à droite de chaque modèle : la personne retire ceux dont elle ne veut plus.
      '<button type="button" class="mg-carte-retirer" data-mg-carte-retirer="' + _mgEsc(m.id) + '" aria-label="Retirer le modèle ' + (i + 1) + '" title="Retirer ce modèle"' + (_mgRenduEnCours ? ' disabled' : '') + ' style="position:absolute;top:.25rem;right:.25rem;width:1.45rem;height:1.45rem;border-radius:50%;border:1px solid var(--border-strong);background:var(--bg-card);color:inherit;font-size:1rem;line-height:1;padding:0;cursor:pointer;z-index:2;">&times;</button></div>';
  }).join('') + '</div>';
}

// Les actions du modèle choisi (sous la ligne, au-dessus de son grand CV). Sans modèle choisi : rien à remodeler, et « Garder celui-ci » reste bloqué.
function _mgHtmlActionsChoix(active) {
  if (!active) {
    // Aucun modèle choisi : aucun bouton d'exportation (un bouton grisé n'apporterait rien), seulement la consigne.
    return '<div class="mg-actions" style="margin-top:.7rem;"><p class="small mb-0" style="color:var(--text-muted);">Choisissez un de vos modèles : il s’affiche en grand en dessous, avec « Remodeler ce modèle » et « Garder celui-ci et exporter ». La croix en haut à droite d’un modèle le retire.</p></div>';
  }
  var n = _mgListe.indexOf(active) + 1;
  return '<div class="mg-actions" style="margin-top:.7rem;"><p class="mb-2"><strong>Modèle ' + n + ' : ' + _mgEsc(_mgLibelle(active)) + '</strong> <span class="small" style="color:var(--text-muted);">(votre texte, tel qu’il sera enregistré)</span></p>' +
    '<div class="d-flex flex-wrap gap-2 mb-2">' +
    '<button type="button" class="btn btn-outline-primary" id="btnMgRemodeler"><i class="bi bi-sliders" aria-hidden="true"></i> Remodeler ce modèle</button>' +
    '<button type="button" class="btn btn-primary" id="btnMgExporter" data-barre-bas="1" data-barre-bas-libelle="Garder celui-ci et exporter &#8594;"' + (_mgRenduEnCours ? ' disabled data-barre-bas-message="Un instant : vos modèles se préparent."' : '') + '>Garder celui-ci et exporter &#8594;</button></div>' +
    '<p class="small mb-0" style="color:var(--text-muted);">Cliquez sur le CV pour le voir très grand (sans pouvoir le modifier). Pour le modifier : « Remodeler ce modèle ».</p></div>';
}

// En mode « Remodeler » : un bandeau bien visible avec les deux actions qui terminent le travail.
function _mgHtmlBandeauRemodeler(active) {
  var n = active ? _mgListe.indexOf(active) + 1 : 0;
  return '<div class="mg-bandeau-remodeler" role="group" aria-label="Terminer le remodelage" style="border:2px solid var(--accent);background:var(--accent-bg-subtle);border-radius:12px;padding:.8rem 1rem;margin-top:.7rem;">' +
    '<p class="mb-2"><strong><i class="bi bi-sliders" aria-hidden="true"></i> Vous remodelez ' + (n ? 'le modèle ' + n : 'ce CV') + '.</strong> Vos modèles gardés ne bougent pas. Quand le CV vous plaît :</p>' +
    '<div class="d-flex flex-wrap gap-2">' +
    '<button type="button" class="btn btn-outline-primary btn-lg" id="btnMgFermerRemodeler"><i class="bi bi-arrow-left-circle" aria-hidden="true"></i> Revenir à mes modèles</button>' +
    (!mgListePleine(_mgListe)
      ? '<button type="button" class="btn btn-primary btn-lg" id="btnMgGarderReglage"><i class="bi bi-plus-circle-fill" aria-hidden="true"></i> Garder ce réglage comme nouveau modèle</button>'
      : '<span class="small align-self-center" style="color:var(--text-muted);">Vos ' + MG_MAX + ' places sont prises : retirez un modèle (sa croix) pour garder ce réglage.</span>') +
    '</div></div>';
}

// Le bloc seul (sans sa feuille de style) : il se remplace sur place quand on choisit ou retire un modèle. `enPlace` : les images sont déjà prêtes, rien à préparer.
function _mgHtmlBloc(docActif, enPlace) {
  if (!_mgConcerne(docActif)) { return ''; }
  var active = _mgCarteActive();
  var modifie = _mgEstModifie();
  if (!_mgRemodeler && !(enPlace && _mgToutRendu())) { _mgRenduEnCours = true; }   // les images se préparent : les boutons restent inactifs jusque-là
  return '<div class="cv-section" id="blocMgMesModeles" style="margin-bottom:.8rem;">' +
    '<h3 style="font-size:1rem;margin:.1rem 0 .5rem;"><i class="bi bi-grid-1x2" aria-hidden="true"></i> Mes modèles <span class="small" style="font-weight:400;color:var(--text-muted);">(votre texte, dans les modèles que vous avez gardés)</span></h3>' +
    _mgHtmlRangee(active, modifie) +
    (_mgRemodeler ? _mgHtmlBandeauRemodeler(active) : _mgHtmlActionsChoix(active)) + '</div>';
}
function mgHtmlMesModeles(docActif) {
  if (!_mgConcerne(docActif)) { return ''; }
  return '<style>' +
    '.mep-mode-choix .mep-2col-reglages,.mep-mode-choix .entete{display:none;}' +
    '.mep-mode-choix .mep-2col-grille{grid-template-columns:minmax(0,1fr) !important;}' +
    // Le grand CV du modèle choisi : lecture seule (un voile transparent reçoit le clic, qui l'ouvre très grand), jamais de défilement dans sa colonne.
    '.mep-mode-choix .mep-2col-apercu{max-width:560px;margin:0 auto;position:relative !important;max-height:none !important;overflow:visible !important;cursor:zoom-in;}' +
    '.mep-mode-choix .mep-2col-apercu::after{content:"";position:absolute;left:0;top:0;right:0;bottom:0;z-index:6;}' +
    '.mep-mode-choix #mepOngletsApercu,.mep-mode-choix #mepPanneauxForme{display:none;}' +
    '.mep-mode-choix.mg-sans-choix .mep-2col-apercu{display:none;}' +
    '</style>' + _mgHtmlBloc(docActif, false);
}
// Avec « Mes modèles », le rectangle « Exporter » encore verrouillé (« s'ouvrira après Valider le CV ») n'apporte rien : « Garder celui-ci et exporter » l'ouvre. Il n'est montré qu'une fois le CV validé.
function mgMasquerExporterVerrouille(docActif) { return _mgConcerne(docActif) && !dossier.cvTermine; }
// Entoure les réglages de la mise en page : en mode « choix », seul l'aperçu du modèle choisi reste (les réglages s'ouvrent avec « Remodeler »).
function mgEnvelopperMiseEnPage(docActif, htmlMiseEnPage) {
  if (!_mgConcerne(docActif)) { return htmlMiseEnPage; }
  return mgHtmlMesModeles(docActif) + '<div class="' + (_mgRemodeler ? '' : 'mep-mode-choix' + (_mgCarteActive() ? '' : ' mg-sans-choix')) + '">' + htmlMiseEnPage + '</div>';
}

// Attend que l'aperçu du CV soit prêt et stable (le moteur écrit alors ses réglages dans le dossier : le dossier ne doit pas être prêté pendant ce temps).
function _mgAttendreApercu(suite, essais) {
  essais = essais || 0;
  var pret = false;
  try {
    var ifr = document.querySelector('#zonePdfInlineCV iframe');
    pret = !!(ifr && ifr.contentDocument && ifr.contentDocument.querySelector('#conteneurPage .cv') && ifr.contentWindow.__cvPdfRemplissagePret !== false);
  } catch (e) { pret = false; }
  if (pageActuelle !== 'resultats') { return; }
  if (pret || essais > 60) { setTimeout(suite, 250); return; }
  setTimeout(function () { _mgAttendreApercu(suite, essais + 1); }, 150);
}

// La copie du vrai dossier avec le style d'un modèle gardé (le contenu est celui de la personne).
function _mgCopiePourModele(m) {
  var copie = JSON.parse(JSON.stringify(window.dossier));
  copie.reglagesMiseEnPageCV = copie.reglagesMiseEnPageCV || _mepReglagesParDefaut();
  var r = mgAppliquerStyle(copie.pdfReglages, copie.reglagesMiseEnPageCV, m.style);
  copie.pdfReglages = r.pdf; copie.reglagesMiseEnPageCV = r.mep;
  return copie;
}

function _mgActiverBoutons() {
  _mgRenduEnCours = false;
  Array.prototype.forEach.call(document.querySelectorAll('#blocMgMesModeles button[disabled]'), function (b) {
    if (b.id === 'btnMgGarderReglage' || b.getAttribute('data-mg-sans-choix') === '1') { return; }
    b.disabled = false; b.removeAttribute('data-barre-bas-message');
  });
}

// Affiche le CV rendu d'une carte à la largeur réelle de sa vignette (toute la page, titres compris).
function _mgAfficherCarte(id) {
  var el = document.querySelector('[data-ucpm-miniature="mg_' + id + '"]');
  if (!el || !_mgRendus[id] || typeof _ucpmP5MontrerMiniature !== 'function') { return; }
  _ucpmP5MontrerMiniature('mg_' + id, _mgRendus[id], Math.round(el.getBoundingClientRect().width) || 130);
}

// Prépare les images une par une (le dossier est prêté à chaque rendu : voir dossierEchange.js).
function _mgRendreCartes() {
  var cartes = _mgListe.slice();
  var chaine = Promise.resolve();
  _mgRenduEnCours = true;
  cartes.forEach(function (m) {
    chaine = chaine.then(function () {
      if (pageActuelle !== 'resultats' || _mgRemodeler || mgEssaiActif()) { return null; }
      return ucpmRendreCopie(_mgCopiePourModele(m), 'mg:' + m.id).then(function (r) { _mgRendus[m.id] = r; _mgAfficherCarte(m.id); }).catch(function () {
        var el = document.querySelector('[data-ucpm-miniature="mg_' + m.id + '"] span');
        if (el) { el.textContent = 'Aperçu indisponible'; }
      });
    });
  });
  return chaine.then(_mgActiverBoutons, _mgActiverBoutons);
}

// Redessine la page entière (entrer dans « Remodeler » ou en sortir) : la photo de l'aperçu reste affichée pendant la reconstruction, jamais de blanc.
function _mgRedessinerPage(viderApercu) {
  var y = window.scrollY;
  _mepConserverJusqua = 0;
  var refaire = function () {
    if (viderApercu) { var zone = document.getElementById('zonePdfInlineCV'); if (zone) { zone.innerHTML = ''; } }   // l'ancien aperçu ne doit pas réécrire l'ancien modèle dans le dossier
    pageResultats();
    window.scrollTo(0, y);
    if (typeof _mepPhotoApercu !== 'undefined' && _mepPhotoApercu) { _mepGelerColonneApercu(); _mepSurveillerNouvelApercu(); }
  };
  if (typeof _mepAvecPhotoApercu === 'function') { _mepAvecPhotoApercu(refaire); } else { refaire(); }
}

// Remplace SEULEMENT l'aperçu du CV (le nouveau modèle posé dans le dossier) : la photo de l'ancien reste affichée jusqu'à ce que le nouveau soit prêt.
function mgRemplacerApercu() {
  _mepConserverJusqua = 0;
  var refaire = function () {
    var zone = document.getElementById('zonePdfInlineCV'); if (zone) { zone.innerHTML = ''; }   // l'ancien aperçu ne doit pas réécrire l'ancien modèle dans le dossier
    _appliquerReglagesMiseEnPageCV();
    if (typeof ouvrirApercuPdfHtml === 'function') { ouvrirApercuPdfHtml('cv', dossier); }
    if (typeof _mepPhotoApercu !== 'undefined' && _mepPhotoApercu) { _mepGelerColonneApercu(); _mepSurveillerNouvelApercu(); }
    _mgAttendreApercu(function () { _mgPrendreBase(); });
  };
  if (typeof _mepAvecPhotoApercu === 'function') { _mepAvecPhotoApercu(refaire); } else { refaire(); }
}

// Remplace le bloc sur place (le reste de la page ne bouge pas) : modèle choisi ou retiré, réglage gardé.
function mgRafraichirBloc() {
  var bloc = document.getElementById('blocMgMesModeles');
  if (!bloc) { return; }
  var tmp = document.createElement('div');
  tmp.innerHTML = _mgHtmlBloc('cv', true);
  var nouveau = tmp.firstElementChild;
  if (!nouveau) { return; }
  bloc.replaceWith(nouveau);
  var enveloppe = document.querySelector('.mep-mode-choix');
  if (enveloppe) { enveloppe.classList.toggle('mg-sans-choix', !_mgCarteActive()); }
  _mgCablerBloc();
  _mgListe.forEach(function (m) { _mgAfficherCarte(m.id); });   // les images viennent du cache : instantané
  if (_mgRenduEnCours) { _mgAttendreApercu(function () { _mgRendreCartes(); }); }
}

function mgChoisirCarte(id) {
  var m = null; _mgListe.forEach(function (x) { if (x.id === id) { m = x; } });
  if (!m || _mgRenduEnCours) { return; }
  // Un clic sur le modèle DÉJÀ choisi : son CV très grand (lecture seule). Un clic sur un autre : on le choisit et son grand CV s'affiche.
  if (!_mgRemodeler && dossier.modeleGardeActifId === id) { mgOuvrirTresGrand(); return; }
  var poser = function () {
    _mgPoserStyle(m);
    if (_mgRemodeler) { _mgRedessinerPage(true); return; }
    mgRafraichirBloc();     // le bloc d'abord (le grand CV doit être visible pour que l'aperçu prenne sa taille)
    mgRemplacerApercu();
  };
  if (_mgEstModifie() && typeof confirmerAction === 'function') {
    confirmerAction('Remplacer votre réglage ?', 'Vos modifications sur ce modèle seront remplacées par le modèle que vous venez de choisir. Vos modèles gardés ne changent pas.', 'Remplacer', 'btn-primary', poser);
  } else { poser(); }
}

// La croix d'un modèle de « Vos documents » : il quitte la liste. S'il était le modèle choisi, plus aucun ne l'est (le CV garde son aspect actuel) : son grand CV et « Remodeler » disparaissent jusqu'à un nouveau choix.
function mgRetirerCarte(id) {
  if (_mgRenduEnCours) { return; }
  var etaitChoisi = dossier.modeleGardeActifId === id;
  _mgListe = mgRetirer(_mgListe, id);
  delete _mgApercus[id]; delete _mgRendus[id];
  if (etaitChoisi) { dossier.modeleGardeActifId = null; _mgBase = { id: null, sig: null }; }   // null, pas undefined : « undefined » reposerait le dernier modèle à l'arrivée
  if (!_mgListe.length) { _mgRemodeler = false; _mgRedessinerPage(false); return; }   // la page reprend sa forme complète
  mgRafraichirBloc();
}

// Le CV du modèle choisi en très grand : lecture seule (aucune modification ici, tout passe par « Remodeler ce modèle »). Un voile sur la page, comme l'aperçu en plein écran.
function mgOuvrirTresGrand() {
  var apercu = _mgCapturerApercu();
  if (!apercu || typeof _ucpmP5MontrerMiniature !== 'function') { return; }
  var ancien = document.getElementById('mgTresGrand'); if (ancien) { ancien.remove(); }
  var larg = Math.max(280, Math.min(window.innerWidth - 32, 900));
  var avant = document.activeElement;
  var voile = document.createElement('div');
  voile.id = 'mgTresGrand';
  voile.setAttribute('role', 'dialog'); voile.setAttribute('aria-modal', 'true'); voile.setAttribute('aria-label', 'Votre CV en très grand');
  voile.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;z-index:100000;background:rgba(0,0,0,.7);overflow:auto;padding:12px;';
  voile.innerHTML = '<div style="width:' + larg + 'px;margin:0 auto;">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:.5rem;color:#fff;"><span style="font-size:.95rem;">Votre CV en très grand : lecture seule. Pour le modifier : « Remodeler ce modèle ».</span>' +
    '<button type="button" class="btn btn-light" id="btnMgFermerTresGrand">Fermer &times;</button></div>' +
    '<div data-ucpm-miniature="mg_tresgrand" style="width:' + larg + 'px;background:#fff;border-radius:4px;overflow:hidden;position:relative;"></div></div>';
  document.body.appendChild(voile);
  var hote = voile.querySelector('[data-ucpm-miniature="mg_tresgrand"]');
  _ucpmP5MontrerMiniature('mg_tresgrand', apercu, larg);
  try { var ech = hote.shadowRoot.querySelector('.ucpm-ech'); hote.style.height = Math.round(ech.offsetHeight * larg / 794) + 'px'; } catch (e) { hote.style.height = Math.round(larg * 1123 / 794) + 'px'; }
  var fermer = function () { document.removeEventListener('keydown', surTouche); voile.remove(); if (avant && avant.focus) { try { avant.focus(); } catch (e2) { /* pas grave */ } } };
  var surTouche = function (e) { if (e.key === 'Escape') { fermer(); } };
  document.addEventListener('keydown', surTouche);
  voile.addEventListener('click', function (e) { if (e.target === voile) { fermer(); } });
  var btn = document.getElementById('btnMgFermerTresGrand');
  if (btn) { btn.addEventListener('click', fermer); btn.focus(); }
}

// Branche les boutons du bloc (ligne de modèles, croix, actions, bandeau « Remodeler »).
function _mgCablerBloc() {
  var bloc = document.getElementById('blocMgMesModeles');
  if (!bloc) { return; }
  Array.prototype.forEach.call(bloc.querySelectorAll('[data-mg-carte]'), function (b) { b.addEventListener('click', function () { mgChoisirCarte(b.getAttribute('data-mg-carte')); }); });
  Array.prototype.forEach.call(bloc.querySelectorAll('[data-mg-carte-retirer]'), function (b) {
    b.addEventListener('click', function (e) { e.stopPropagation(); mgRetirerCarte(b.getAttribute('data-mg-carte-retirer')); });
  });
  var exporter = document.getElementById('btnMgExporter');
  if (exporter) { exporter.addEventListener('click', function () { if (!_mgRenduEnCours) { _mepValiderCVEtExporter(); } }); }
  var remodeler = document.getElementById('btnMgRemodeler');
  if (remodeler) { remodeler.addEventListener('click', function () { if (_mgRenduEnCours) { return; } _mgRemodeler = true; _mgRedessinerPage(false); }); }
  var fermer = document.getElementById('btnMgFermerRemodeler');
  if (fermer) { fermer.addEventListener('click', function () { _mgRemodeler = false; _mgRedessinerPage(false); }); }
  var garderReglage = document.getElementById('btnMgGarderReglage');
  if (garderReglage) {
    garderReglage.addEventListener('click', function () {
      var r = mgAjouter(_mgListe, _mgNomModeleCourant(), _mgStyleCourant(true));
      if (r.ok) { _mgListe = r.liste; dossier.modeleGardeActifId = r.modele.id; _mgBase = { id: r.modele.id, sig: mgSignature(_mgStyleCourant(true)) }; mgRafraichirBloc(); }
    });
  }
}

function mgBrancherMesModeles() {
  var bloc = document.getElementById('blocMgMesModeles');
  if (!bloc) { return; }
  _mgCablerBloc();
  // Le grand CV du modèle choisi est en lecture seule : un clic dessus l'ouvre très grand.
  var grandCv = document.querySelector('.mep-mode-choix .mep-2col-apercu');
  if (grandCv) { grandCv.addEventListener('click', mgOuvrirTresGrand); }
  if (_mgRemodeler) { _mgRenduEnCours = false; return; }
  // Les images se préparent une fois l'aperçu prêt (le dossier n'est prêté que lorsque l'aperçu n'écrit plus rien) ; un rendu déjà à jour revient du cache.
  _mgRenduEnCours = true;
  _mgAttendreApercu(function () { _mgPrendreBase(); _mgRendreCartes(); });
}
