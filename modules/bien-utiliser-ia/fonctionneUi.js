/* ============================================================
   modules/bien-utiliser-ia/fonctionneUi.js
   Chemin 4 « Comment fonctionne un assistant » : sept écrans et la fiche « Ce qu'il faut retenir ». Navigateur seulement (pas chargé par les tests Node).
   Logique : fonctionneLogique.js. Textes : data/buiaFonctionne.js. Pièces communes (titre d'écran, bloc dépliable, encart) : comprendreUi.js.
   Maquette validée : docs/maquettes/maquette-bien-utiliser-ia-enrichissement-2026-11-24.html. Rien n'est enregistré : l'état vit en mémoire le temps de la session.
   ============================================================ */

function _buiaC4Plus() { return _buiaUi.c4.niveau === 'plus'; }
function _buiaC4Date() { return '<p><span class="buia-pastille-date">' + _buiaEsc(BUIA_C4_DATE_LIBELLE + BUIA_C4_DATE_MAJ) + '</span></p>'; }

function _buiaC4Ecran1() {
  var t = BUIA_C4_E1;
  var h = _buiaTitreEcran(1, t.titre) + '<p>' + _buiaEsc(t.intro) + '</p>';
  h += '<div class="buia-schema" role="group" aria-label="' + _buiaEsc(t.schemaLibelle) + '">' + t.schema.map(function (b, i) {
    return (i ? '<div class="buia-fleche" aria-hidden="true">&#8594;</div>' : '') + '<div class="buia-boite buia-b' + (i + 1) + '"><strong>' + _buiaEsc(b.titre) + '</strong>' + _buiaEsc(b.texte) + '</div>';
  }).join('') + '</div>';
  h += _buiaEncartC1(t.idee.titre, t.idee.texte);
  if (_buiaC4Plus()) { h += _buiaDepli(t.plus.titre, '<p>' + _buiaEsc(t.plus.texte) + '</p>', '', true); }
  return h;
}

function _buiaC4HtmlMots() {
  var avec = _buiaUi.c4.contexte;
  return '<div class="buia-mots" id="buiaC4Mots">' + buiaC4MotsVraisemblables(avec).map(function (m) { return '<span class="buia-mot">' + _buiaEsc(m.mot) + ' <b>' + m.pct + ' %</b></span>'; }).join('') + '</div>' +
    '<div class="buia-mots"><button type="button" class="buia-choix" data-buia-act="c4-contexte" aria-pressed="' + (avec ? 'true' : 'false') + '">' + _buiaEsc(BUIA_C4_E2.contexteBouton) + '</button></div>' +
    '<div class="buia-petit" id="buiaC4Legende" aria-live="polite">' + _buiaEsc(buiaC4LegendeMots(avec)) + '</div>';
}

function _buiaC4Ecran2() {
  var t = BUIA_C4_E2;
  var h = _buiaTitreEcran(2, t.titre) + '<p>' + _buiaEsc(t.intro) + '</p>';
  h += '<div class="buia-phrase-demo"><strong>' + _buiaEsc(t.exempleTitre) + '</strong> ' + _buiaEsc(t.exempleTexte) + '<div id="buiaC4Zone">' + _buiaC4HtmlMots() + '</div></div>';
  h += '<h3>' + _buiaEsc(t.consigneTitre) + '</h3><p>' + _buiaEsc(t.consigne) + '</p>' + _buiaEncartC1(t.idee.titre, t.idee.texte);
  if (_buiaC4Plus()) { h += _buiaDepli(t.plus.titre, '<p>' + _buiaEsc(t.plus.texte) + '</p>', '', true); }
  return h;
}

function _buiaC4Ecran3() {
  var t = BUIA_C4_E3;
  var h = _buiaTitreEcran(3, t.titre);
  h += '<div class="buia-deux"><div class="buia-sait oui"><h3>' + _buiaEsc(t.oui.titre) + '</h3>' + _buiaLignesListe(t.oui.items) + '</div>' +
    '<div class="buia-sait non"><h3>' + _buiaEsc(t.non.titre) + '</h3>' + _buiaLignesListe(t.non.items) + '</div></div>';
  h += _buiaEncartC1(t.savoir.titre, t.savoir.texte, 'rappel');
  if (_buiaC4Plus()) { h += _buiaDepli(t.plus.titre, '<p>' + _buiaEsc(t.plus.texte) + '</p>', '', true); }
  return h;
}

function _buiaC4Ecran4() {
  var t = BUIA_C4_E4;
  return _buiaTitreEcran(4, t.titre) + '<p>' + _buiaEsc(t.intro) + '</p>' +
    '<h3>' + _buiaEsc(t.activer.titre) + '</h3>' + _buiaLignesListe(t.activer.items) +
    '<h3>' + _buiaEsc(t.inutile.titre) + '</h3>' + _buiaLignesListe(t.inutile.items) +
    _buiaEncartC1(t.verifier.titre, t.verifier.texte, 'rappel') + '<p class="buia-petit">' + _buiaEsc(t.reglage) + '</p>';
}

function _buiaC4Ecran5() {
  var t = BUIA_C4_E5;
  return _buiaTitreEcran(5, t.titre) + _buiaC4Date() + '<p>' + _buiaEsc(t.prudence) + '</p>' +
    '<div class="buia-assistants">' + buiaC4Assistants().map(function (a) {
      return '<div class="buia-assistant" id="buiaAss-' + a.id + '"><h3>' + _buiaEsc(a.nom) + '</h3>' +
        '<p class="buia-petit"><strong>' + _buiaEsc(t.pourLibelle) + '</strong>' + _buiaEsc(a.pour) + '</p>' +
        '<p class="buia-petit mb-0"><strong>' + _buiaEsc(t.savoirLibelle) + '</strong>' + _buiaEsc(a.savoir) + '</p></div>';
    }).join('') + '</div>' + _buiaEncartC1(t.choisir.titre, t.choisir.texte);
}

function _buiaC4Ecran6() {
  var t = BUIA_C4_E6;
  return '<h2>' + _buiaRondNum(6) + _buiaEsc(t.titre) + _buiaPastilleNiveau() + '</h2>' + _buiaC4Date() + '<p>' + _buiaEsc(t.intro) + '</p>' +
    '<div class="buia-deux"><div class="buia-sait oui"><h3>' + _buiaEsc(t.oui.titre) + '</h3>' + _buiaLignesListe(t.oui.items) + '</div>' +
    '<div class="buia-sait non"><h3>' + _buiaEsc(t.non.titre) + '</h3>' + _buiaLignesListe(t.non.items) + '</div></div>' +
    _buiaEncartC1(t.jamais.titre, t.jamais.texte, 'rappel') + _buiaEncartC1(t.temporaire.titre, t.temporaire.texte, '') +
    [t.consignes, t.documents].map(function (g) { return _buiaDepli(g.titre, '<p>' + _buiaEsc(g.texte) + '</p>', '', false); }).join('');
}

function _buiaC4Ecran7() {
  var t = BUIA_C4_E7;
  return _buiaTitreEcran(7, t.titre) + '<p>' + _buiaEsc(t.intro) + '</p>' +
    '<div class="buia-assistants">' + t.cartes.map(function (c) {
      return '<div class="buia-assistant"><h3>' + _buiaEsc(c.titre) + '</h3><p class="buia-petit mb-0">' + _buiaEsc(c.texte) + '</p></div>';
    }).join('') + '</div>' + _buiaEncartC1(t.rappel.titre, t.rappel.texte, 'rappel');
}

function _buiaC4Fiche() {
  var f = BUIA_C4_FICHE;
  return '<div class="buia-conclusion"><h2>' + _buiaEsc(f.titre) + '</h2><div class="buia-fiche">' + _buiaLignesListe(f.points) + '</div>' +
    '<div class="buia-actions">' +
    '<button type="button" class="btn btn-primary" data-buia-act="c4-vers" data-v="modeles">' + _buiaEsc(f.boutons.modeles) + '</button>' +
    '<button type="button" class="btn btn-outline-primary" data-buia-act="c4-vers" data-v="comprendre">' + _buiaEsc(f.boutons.comprendre) + '</button></div></div>';
}

function _buiaC4HtmlEcran() {
  var e = _buiaUi.c4.etape;
  if (e === buiaC4NombreEtapes() - 1) { return _buiaC4Fiche(); }
  var fns = [_buiaC4Ecran1, _buiaC4Ecran2, _buiaC4Ecran3, _buiaC4Ecran4, _buiaC4Ecran5, _buiaC4Ecran6, _buiaC4Ecran7];
  return '<div class="buia-panneau">' + fns[e]() + '</div>';
}

function _buiaC4HtmlNiveaux() {
  var n = BUIA_C1_NIVEAUX, plus = _buiaC4Plus();
  return '<div class="buia-niveaux"><span class="buia-etiq">' + _buiaEsc(n.etiquette) + '</span>' +
    '<button type="button" class="buia-choix" data-buia-act="c4-niveau" data-v="bases" aria-pressed="' + (plus ? 'false' : 'true') + '">' + _buiaEsc(n.bases) + '</button>' +
    '<button type="button" class="buia-choix" data-buia-act="c4-niveau" data-v="plus" aria-pressed="' + (plus ? 'true' : 'false') + '">' + _buiaEsc(n.plus) + '</button></div>';
}

// ---------------- Page ----------------
// Cible de la route 'bien-utiliser-ia-fonctionne'. Fermé au public : retour à l'accueil (sauf sur le poste de Denis).
function pageBienUtiliserIaFonctionne() {
  if (!buiaOuvert()) { if (typeof naviguerVers === 'function') { naviguerVers('cv'); } return; }
  buiaRendreFonctionne();
}

function buiaRendreFonctionne() {
  var c = _buiaUi.c4, dernier = c.etape === buiaC4NombreEtapes() - 1;
  app.innerHTML =
    '<div class="page-catalogue-contenu buia-page" id="buiaRacine">' +
    htmlBandeRepriseModule(htmlBoutonRevoirModule('btnBuiaRevoir', BUIA_ICONE, 'Revoir la présentation', false), '') +
    htmlTitreEtapeModule(BUIA_ICONE, BUIA_NOM, _buiaEsc(BUIA_C4_ROUTE_TITRE), _buiaEsc(BUIA_C4_SOUS_TITRE)) +
    (typeof barreEtapesModule === 'function' ? barreEtapesModule(buiaC4Etapes(), c.etape) : '') +
    '<div id="buiaC4Niveaux">' + _buiaC4HtmlNiveaux() + '</div>' +
    '<div id="buiaC4Corps">' + _buiaC4HtmlEcran() + '</div></div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation(BUIA_ROUTE, dernier ? BUIA_ROUTE : 'x', dernier ? BUIA_C4_FICHE.boutonFin : undefined,
      { onclickPrecedent: 'buiaC4Precedent()', onclickSuivant: 'buiaC4Suivant()', libelleExact: dernier }) + '</div>';
  var btnRevoir = document.getElementById('btnBuiaRevoir');
  if (btnRevoir) { btnRevoir.addEventListener('click', function () { buiaRetourVersPresentation(true, BUIA_ROUTE_FONCTIONNE); }); }
  var racine = document.getElementById('buiaRacine');
  if (racine) { racine.addEventListener('click', buiaClic); }
  if (typeof trackEvenement === 'function') { trackEvenement('bien_utiliser_ia_vue', { vue: 'fonctionne', etape: c.etape + 1 }); }
}

function _buiaC4MajCorps() {
  var corps = document.getElementById('buiaC4Corps'), niv = document.getElementById('buiaC4Niveaux');
  if (corps) { corps.innerHTML = _buiaC4HtmlEcran(); }
  if (niv) { niv.innerHTML = _buiaC4HtmlNiveaux(); }
}

function buiaC4Aller(n) {
  _buiaUi.c4.etape = buiaC4BorneEtape(n);
  buiaRendreFonctionne();
  window.scrollTo(0, 0);
}
function buiaC4Precedent() { if (_buiaUi.c4.etape <= 0) { naviguerVers(BUIA_ROUTE); } else { buiaC4Aller(_buiaUi.c4.etape - 1); } }
function buiaC4Suivant() { if (_buiaUi.c4.etape >= buiaC4NombreEtapes() - 1) { naviguerVers(BUIA_ROUTE); } else { buiaC4Aller(_buiaUi.c4.etape + 1); } }

// Actions de la page du chemin 4 (appelée par buiaClic, index.js).
function buiaC4Clic(act, v) {
  var c = _buiaUi.c4;
  if (act === 'c4-niveau') { c.niveau = (v === 'plus') ? 'plus' : 'bases'; _buiaC4MajCorps(); return true; }
  if (act === 'c4-contexte') { c.contexte = !c.contexte; var z = document.getElementById('buiaC4Zone'); if (z) { z.innerHTML = _buiaC4HtmlMots(); } return true; }
  if (act === 'c4-vers') {
    if (typeof trackEvenement === 'function') { trackEvenement('bien_utiliser_ia_chemin', { chemin: v, depuis: 'fonctionne' }); }
    if (v === 'modeles') { naviguerVers(BUIA_ROUTE_MODELES); return true; }
    if (v === 'comprendre') { naviguerVers(BUIA_ROUTE_COMPRENDRE); return true; }
    return true;
  }
  return false;
}
