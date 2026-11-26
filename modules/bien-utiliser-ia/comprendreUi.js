/* ============================================================
   modules/bien-utiliser-ia/comprendreUi.js
   Chemin 1 « Comprendre comment demander » : les sept écrans et la fiche « Ce qu'il faut retenir ». Navigateur seulement (pas chargé par les tests Node).
   Logique : comprendreLogique.js. Textes : data/buiaComprendre.js. Six éléments : data/buiaDemande.js. Maquette validée : docs/maquettes/maquette-bien-utiliser-ia-comprendre-2026-11-23.html.
   Rien n'est enregistré : l'état (étape, niveau, sujet) vit en mémoire le temps de la session, comme le reste du module.
   ============================================================ */

// ---------------- Pièces communes aux écrans ----------------
function _buiaRondNum(n) { return '<span class="buia-rond-num" aria-hidden="true">' + n + '</span>'; }
function _buiaTitreEcran(n, titre) { return '<h2>' + _buiaRondNum(n) + _buiaEsc(titre) + '</h2>'; }
function _buiaPastilleNiveau() { return ' <span class="buia-pastille-niveau">' + _buiaEsc(BUIA_C1_NIVEAUX.pastille) + '</span>'; }
// Bloc dépliable du langage commun de l'application (.bloc-depli). `classe` : '' | 'bd-warn' | 'bd-pret'. Toujours ouvert d'avance (décision de Denis : jamais de contenu caché).
function _buiaDepli(titre, corpsHTML, classe, plus) {
  return '<details class="bloc-depli ' + (classe || '') + '" open><summary>' + _buiaEsc(titre) + (plus ? _buiaPastilleNiveau() : '') + '</summary>' +
    '<div class="bloc-depli-corps">' + corpsHTML + '</div></details>';
}
function _buiaEncartC1(titre, texte, classe) {
  return '<div class="buia-encart' + (classe ? ' ' + classe : '') + '">' + (titre ? '<strong>' + _buiaEsc(titre) + '</strong> ' : '') + _buiaEsc(texte) + '</div>';
}
function _buiaChoixSujets(courant, act) {
  return '<div class="buia-seg" role="group" aria-label="Sujet">' + buiaC1Sujets().map(function (s) {
    return '<button type="button" class="buia-choix" data-buia-act="' + act + '" data-v="' + s.id + '" aria-pressed="' + (s.id === courant ? 'true' : 'false') + '">' + _buiaEsc(s.nom) + '</button>';
  }).join('') + '</div>';
}
function _buiaLignesListe(items) { return '<ul class="buia-liste">' + items.map(function (t) { return '<li>' + _buiaEsc(t) + '</li>'; }).join('') + '</ul>'; }
function _buiaPlus() { return _buiaUi.c1.niveau === 'plus'; }

// ---------------- Les huit écrans ----------------
// La vidéo d'un chemin n'est plus ici : elle est sur la tuile du chemin (écran d'entrée, index.js), comme dans tous les modules (décision de Denis du 25/11/2026).

function _buiaC1Ecran1() {
  var t = BUIA_C1_E1;
  var h = _buiaTitreEcran(1, t.titre);
  h += '<div class="buia-deux"><div class="buia-sait oui"><h3>' + _buiaEsc(t.oui.titre) + '</h3>' + _buiaLignesListe(t.oui.items) + '</div>' +
    '<div class="buia-sait non"><h3>' + _buiaEsc(t.non.titre) + '</h3>' + _buiaLignesListe(t.non.items) + '</div></div>';
  h += '<div class="buia-schema" role="group" aria-label="' + _buiaEsc(t.schemaLibelle) + '">' + t.schema.map(function (b, i) {
    return (i ? '<div class="buia-fleche" aria-hidden="true">&#8594;</div>' : '') + '<div class="buia-boite buia-b' + (i + 1) + '"><strong>' + _buiaEsc(b.titre) + '</strong>' + _buiaEsc(b.texte) + '</div>';
  }).join('') + '</div>';
  h += _buiaEncartC1(t.idee.titre, t.idee.texte);
  if (_buiaPlus()) { h += _buiaDepli(t.plus.titre, t.plus.paragraphes.map(function (p) { return '<p>' + _buiaEsc(p) + '</p>'; }).join(''), '', true); }
  return h + _buiaEncartC1('', t.rappel, 'rappel');
}

function _buiaC1Ecran2() {
  var t = BUIA_C1_E2, c = _buiaUi.c1, aa = buiaC1AvantApres(c.sujet);
  return _buiaTitreEcran(2, t.titre) + t.intro.map(function (p) { return '<p>' + _buiaEsc(p) + '</p>'; }).join('') +
    '<p class="fw-bold mb-1">' + _buiaEsc(t.consigneSujet) + '</p>' + _buiaChoixSujets(c.sujet, 'sujet') +
    '<div class="buia-deux"><div class="buia-demande pauvre"><div class="buia-tete">' + _buiaEsc(t.pauvre.tete) + '</div><div>' + _buiaEsc(aa.avant) + '</div><p class="buia-petit mb-0 mt-2">' + _buiaEsc(t.pauvre.note) + '</p></div>' +
    '<div class="buia-demande riche"><div class="buia-tete">' + _buiaEsc(t.riche.tete) + '</div><div>' + _buiaEsc(aa.apres) + '</div><p class="buia-petit mb-0 mt-2">' + _buiaEsc(t.riche.note) + '</p></div></div>' +
    '<p class="buia-petit buia-discret mt-2">' + _buiaEsc(t.prudence) + '</p>';
}

function _buiaC1Ecran3() {
  var t = BUIA_C1_E3, c = _buiaUi.c1, el = buiaC1Elements(c.sujet);
  var h = _buiaTitreEcran(3, t.titre) + '<p>' + _buiaEsc(t.intro) + '</p>' + _buiaChoixSujets(c.sujet, 'sujet') + '<div class="buia-pile">';
  el.forEach(function (e, i) {
    h += '<button type="button" class="buia-rang buia-e' + e.n + '" data-buia-act="rang" data-v="' + i + '" aria-expanded="' + (c.rang === i ? 'true' : 'false') + '">' +
      '<span class="buia-nom"><span class="buia-n" aria-hidden="true">' + e.n + '</span><span>' + _buiaEsc(e.nom) + '</span></span><span class="buia-phrase">' + _buiaEsc(e.ligne) + '</span></button>' +
      '<div class="buia-rang-raison buia-e' + e.n + '"' + (c.rang === i ? '' : ' hidden') + '>' + _buiaEsc(e.raison) +
      (e.aide ? '<div class="buia-aide-q"><strong>' + _buiaEsc(t.aideLibelle) + '</strong> ' + _buiaEsc(e.aide) + '</div>' : '') + '</div>';
  });
  h += '</div>';
  h += _buiaDepli(t.assembleeTitre, '<div class="buia-demande-texte">' + buiaC1Assemblee(c.sujet).map(function (s) { return '<span class="buia-seg-couleur buia-e' + s.n + '">' + _buiaEsc(s.texte) + '</span>\n'; }).join('') + '</div>', 'bd-pret', false);
  h += _buiaDepli(BUIA_EX1.titre, _buiaEx1Bloc(), '', false);
  if (_buiaPlus()) {
    [t.plus, t.techniques].forEach(function (g) {
      h += _buiaDepli(g.titre, g.blocs.map(function (b) { return '<p><strong>' + _buiaEsc(b.titre) + '</strong> ' + _buiaEsc(b.texte) + '</p>'; }).join(''), '', true);
    });
  }
  return h;
}

function _buiaC1Ecran4() {
  var t = BUIA_C1_E4;
  var h = _buiaTitreEcran(4, t.titre) + '<p>' + _buiaEsc(t.intro) + '</p>';
  t.blocs.forEach(function (b) { h += _buiaDepli(b.titre, '<p>' + _buiaEsc(b.texte) + '</p>', '', false); });
  h += _buiaEncartC1(t.reflexe.titre, t.reflexe.texte);
  h += _buiaDepli(BUIA_EX3.titre, _buiaEx3Bloc(), '', false);
  if (_buiaPlus()) { h += _buiaDepli(t.plus.titre, '<p>' + _buiaEsc(t.plus.texte) + '</p>', '', true); }
  return h;
}

function _buiaC1Ecran5() {
  var t = BUIA_C1_E5, h = _buiaTitreEcran(5, t.titre);
  t.blocs.forEach(function (b) { h += _buiaDepli(b.titre, '<p>' + _buiaEsc(b.texte) + '</p>', 'bd-warn', false); });
  if (_buiaPlus()) { h += _buiaDepli(t.plus.titre, '<p>' + _buiaEsc(t.plus.texte) + '</p>', '', true); }
  return h;
}

function _buiaC1Ecran6() {
  var t = BUIA_C1_E6, c = _buiaUi.c1, r = buiaC1Risque(c.risque);
  var h = _buiaTitreEcran(6, t.titre) + '<p>' + _buiaEsc(t.intro) + '</p>';
  h += '<div class="buia-boucle" role="group" aria-label="' + _buiaEsc(t.boucleLibelle) + '">' + t.boucle.map(function (p, i) {
    return (i ? '<span aria-hidden="true">&#8594;</span>' : '') + '<span class="buia-pas"><span class="buia-n" aria-hidden="true">' + (i + 1) + '</span>' + _buiaEsc(p) + '</span>';
  }).join('') + '<span class="buia-retour">' + _buiaEsc(t.boucleRetour) + '</span></div>';
  h += _buiaEncartC1(t.reflexes.titre, t.reflexes.texte);
  h += '<p class="fw-bold mb-1">' + _buiaEsc(t.consigneRisque) + '</p><div class="buia-seg" role="group" aria-label="Sujet à vérifier">' + buiaC1Risques().map(function (x) {
    return '<button type="button" class="buia-choix" data-buia-act="risque" data-v="' + x.id + '" aria-pressed="' + (x.id === r.id ? 'true' : 'false') + '">' + _buiaEsc(x.nom) + '</button>';
  }).join('') + '</div>';
  h += '<div class="buia-encart ok" role="status" aria-live="polite">' + _buiaEsc(r.texte) + '</div>';
  h += _buiaDepli(BUIA_EX2.titre, _buiaEx2Bloc(), '', false);
  if (_buiaPlus()) { [t.plus, t.plus2, t.plus3].forEach(function (g) { h += _buiaDepli(g.titre, '<p>' + _buiaEsc(g.texte) + '</p>', '', true); }); }
  return h;
}

function _buiaC1Ecran7() {
  var t = BUIA_C1_E7, h = _buiaTitreEcran(7, t.titre) + '<p>' + _buiaEsc(t.intro) + '</p>' + _buiaEncartC1(t.regle.titre, t.regle.texte);
  t.blocs.forEach(function (b) { h += _buiaDepli(b.titre, '<p>' + _buiaEsc(b.texte) + '</p>', '', false); });
  if (_buiaPlus()) { [t.plus, t.plus2].forEach(function (g) { h += _buiaDepli(g.titre, '<p>' + _buiaEsc(g.texte) + '</p>', '', true); }); }
  return h;
}

// Écran 8 « Ses questions d'abord » (consignes 609, 612, 613) : le conseil clé en tête, dans le cadre accentué de la fiche finale, aux deux niveaux de lecture.
// L'exemple est lu dans son fichier (buiaChargerExempleC1, index.js) ; tant qu'il n'est pas lu, un message calme le remplace.
function _buiaC1Message(id, texte) {
  return '<div class="buia-encart ok" id="' + id + '" role="status" aria-live="polite"' + (texte ? '' : ' hidden') + '>' + _buiaEsc(texte) + '</div>';
}
function _buiaC1Exemple() {
  var t = BUIA_C1_E8, ex = buiaEtatExempleC1(), c = _buiaUi.c1;
  if (ex.etat === 'ok') {
    return '<div class="buia-apercu"><div class="buia-demande-texte" id="buiaC1TexteExemple">' + _buiaEsc(ex.texte) + '</div></div>' +
      '<div class="buia-actions"><button type="button" class="btn btn-primary" data-buia-act="c1-copier-exemple">' + _buiaEsc(t.copier) + '</button></div>' +
      _buiaC1Message('buiaC1MsgExemple', c.copieExemple);
  }
  return '<div class="buia-encart" role="status">' + _buiaEsc(ex.etat === 'erreur' ? t.indisponible : t.chargement) + '</div>';
}
function _buiaC1Ecran8() {
  var t = BUIA_C1_E8, c = _buiaUi.c1;
  var h = _buiaTitreEcran(8, t.titre);
  h += '<div class="buia-conclusion buia-cle"><h3 class="buia-cle-titre"><i class="bi bi-key" aria-hidden="true"></i> ' + _buiaEsc(t.cleTitre) + '</h3>' +
    '<p class="buia-cle-texte">' + _buiaEsc(t.cle) + '</p>' +
    '<p class="fw-bold mb-1">' + _buiaEsc(t.phraseTitre) + '</p><div class="buia-demande-texte">' + _buiaEsc(t.phrase) + '</div>' +
    '<div class="buia-actions"><button type="button" class="btn btn-outline-primary" data-buia-act="c1-copier-phrase">' + _buiaEsc(t.copierPhrase) + '</button></div>' +
    _buiaC1Message('buiaC1MsgPhrase', c.copiePhrase) + '</div>';
  h += '<p>' + _buiaEsc(t.intro) + '</p><p class="fw-bold mb-1">' + _buiaEsc(t.reconnaitreTitre) + '</p>' + _buiaLignesListe(t.reconnaitre);
  h += _buiaDepli(t.exempleTitre, '<p>' + _buiaEsc(t.exempleIntro) + '</p>' + _buiaDepli(t.avantTitre, _buiaLignesListe(t.avant), 'bd-warn', false) +
    '<div id="buiaC1Exemple">' + _buiaC1Exemple() + '</div>', 'bd-pret', false);
  // Lecture du fichier à la première visite ; l'exemple s'affiche sur place une fois lu, si la personne est toujours sur cet écran.
  if (buiaEtatExempleC1().etat !== 'ok') {
    buiaChargerExempleC1().then(function () {
      var z = document.getElementById('buiaC1Exemple');
      if (z && _buiaUi.c1.etape === 7) { z.innerHTML = _buiaC1Exemple(); }
    });
  }
  return h;
}

// Fiche finale : pas de rond numéroté, cadre accentué (maquette validée). Aucun bouton d'impression.
function _buiaC1Fiche() {
  var f = BUIA_C1_FICHE;
  return '<div class="buia-conclusion"><h2>' + _buiaEsc(f.titre) + '</h2><div class="buia-fiche">' +
    '<h3>' + _buiaEsc(f.elementsTitre) + '</h3><ul class="buia-six">' + buiaC1LignesFiche().map(function (l) { return '<li class="buia-e' + l.n + '">' + _buiaEsc(l.texte) + '</li>'; }).join('') + '</ul>' +
    '<h3>' + _buiaEsc(f.methodeTitre) + '</h3><p class="mb-1">' + _buiaEsc(f.methode) + '</p>' +
    '<h3>' + _buiaEsc(f.avantTitre) + '</h3>' + _buiaLignesListe(f.avant) +
    '<h3>' + _buiaEsc(f.apresTitre) + '</h3>' + _buiaLignesListe(f.apres) +
    '<h3><i class="bi bi-key" aria-hidden="true"></i> ' + _buiaEsc(f.cleTitre) + '</h3><p class="mb-1">' + _buiaEsc(f.cle) + '</p></div>' +
    '<div class="buia-actions">' +
    '<button type="button" class="btn btn-primary" data-buia-act="vers" data-v="modeles">' + _buiaEsc(f.boutons.modeles) + '</button>' +
    '<button type="button" class="btn btn-outline-primary" data-buia-act="vers" data-v="ecrire">' + _buiaEsc(f.boutons.ecrire) + '</button></div>' +
    '<div class="buia-encart buia-construction" id="buiaMsgVers" role="status" hidden>' + _buiaEsc(typeof BUIA_EN_CONSTRUCTION !== 'undefined' ? BUIA_EN_CONSTRUCTION : '') + '</div></div>';
}

function _buiaC1HtmlEcran() {
  var e = _buiaUi.c1.etape;
  if (e === buiaC1NombreEtapes() - 1) { return _buiaC1Fiche(); }
  var fns = [_buiaC1Ecran1, _buiaC1Ecran2, _buiaC1Ecran3, _buiaC1Ecran4, _buiaC1Ecran5, _buiaC1Ecran6, _buiaC1Ecran7, _buiaC1Ecran8];
  return '<div class="buia-panneau">' + fns[e]() + '</div>';
}

function _buiaC1HtmlNiveaux() {
  var n = BUIA_C1_NIVEAUX, plus = _buiaPlus();
  return '<div class="buia-niveaux"><span class="buia-etiq">' + _buiaEsc(n.etiquette) + '</span>' +
    '<button type="button" class="buia-choix" data-buia-act="niveau" data-v="bases" aria-pressed="' + (plus ? 'false' : 'true') + '">' + _buiaEsc(n.bases) + '</button>' +
    '<button type="button" class="buia-choix" data-buia-act="niveau" data-v="plus" aria-pressed="' + (plus ? 'true' : 'false') + '">' + _buiaEsc(n.plus) + '</button></div>';
}

// ---------------- Page ----------------
// Cible de la route 'bien-utiliser-ia-comprendre'. Fermé au public : retour à l'accueil (sauf sur le poste de Denis).
function pageBienUtiliserIaComprendre() {
  if (!buiaOuvert()) { if (typeof naviguerVers === 'function') { naviguerVers('cv'); } return; }
  buiaRendreComprendre();
}

function buiaRendreComprendre() {
  var c = _buiaUi.c1, dernier = c.etape === buiaC1NombreEtapes() - 1;
  app.innerHTML =
    '<div class="page-catalogue-contenu buia-page" id="buiaRacine">' +
    htmlBandeRepriseModule(htmlBoutonRevoirModule('btnBuiaRevoir', BUIA_ICONE, 'Revoir la présentation', false), '') +
    htmlTitreEtapeModule(BUIA_ICONE, BUIA_NOM, _buiaEsc(BUIA_C1_ROUTE_TITRE), _buiaEsc(BUIA_C1_SOUS_TITRE)) +
    (typeof barreEtapesModule === 'function' ? barreEtapesModule(buiaC1Etapes(), c.etape) : '') +
    '<div id="buiaC1Niveaux">' + _buiaC1HtmlNiveaux() + '</div>' +
    '<div id="buiaC1Corps">' + _buiaC1HtmlEcran() + '</div></div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation(BUIA_ROUTE, dernier ? BUIA_ROUTE : 'x', dernier ? BUIA_C1_FICHE.boutonFin : undefined,
      { onclickPrecedent: 'buiaC1Precedent()', onclickSuivant: 'buiaC1Suivant()', libelleExact: dernier }) + '</div>';
  var btnRevoir = document.getElementById('btnBuiaRevoir');
  if (btnRevoir) { btnRevoir.addEventListener('click', function () { buiaRetourVersPresentation(true, BUIA_ROUTE_COMPRENDRE); }); }
  var racine = document.getElementById('buiaRacine');
  if (racine) { racine.addEventListener('click', buiaClic); }
  if (typeof trackEvenement === 'function') { trackEvenement('bien_utiliser_ia_vue', { vue: 'comprendre', etape: c.etape + 1 }); }
}

// Mise à jour sur place (niveau, sujet, ligne ouverte, sujet de vérification) : la barre et la page ne bougent pas.
function _buiaC1MajCorps() {
  var corps = document.getElementById('buiaC1Corps'), niv = document.getElementById('buiaC1Niveaux');
  if (corps) { corps.innerHTML = _buiaC1HtmlEcran(); }
  if (niv) { niv.innerHTML = _buiaC1HtmlNiveaux(); }
}

function buiaC1Aller(n) {
  _buiaUi.c1.etape = buiaC1BorneEtape(n);
  _buiaUi.c1.copiePhrase = ''; _buiaUi.c1.copieExemple = '';
  buiaRendreComprendre();
  window.scrollTo(0, 0);
}
function buiaC1Precedent() { if (_buiaUi.c1.etape <= 0) { naviguerVers(BUIA_ROUTE); } else { buiaC1Aller(_buiaUi.c1.etape - 1); } }
function buiaC1Suivant() { if (_buiaUi.c1.etape >= buiaC1NombreEtapes() - 1) { naviguerVers(BUIA_ROUTE); } else { buiaC1Aller(_buiaUi.c1.etape + 1); } }

// Actions de la page du chemin 1 (appelée par buiaClic, index.js).
function buiaC1Clic(act, v) {
  var c = _buiaUi.c1;
  if (act === 'niveau') { c.niveau = (v === 'plus') ? 'plus' : 'bases'; _buiaC1MajCorps(); return true; }
  if (act === 'sujet') { c.sujet = buiaC1Sujet(v).id; _buiaC1MajCorps(); return true; }
  if (act === 'rang') { var i = +v; c.rang = (c.rang === i) ? -1 : i; _buiaC1MajCorps(); return true; }
  if (act === 'risque') { c.risque = buiaC1Risque(v).id; _buiaC1MajCorps(); return true; }
  // Écran 8 : copier la phrase clé, ou l'exemple complet. Le message reste affiché sur place, sans redessiner l'écran.
  if (act === 'c1-copier-phrase' || act === 'c1-copier-exemple') {
    var phrase = act === 'c1-copier-phrase', ex = buiaEtatExempleC1();
    var texte = phrase ? BUIA_C1_E8.phrase : (ex.etat === 'ok' ? ex.texte : '');
    if (!texte) { return true; }
    if (typeof copierTexteVersPressePapier === 'function') { copierTexteVersPressePapier(texte, null); }
    var msg = phrase ? BUIA_C1_E8.copieeLaPhrase : BUIA_C1_E8.copiee;
    if (phrase) { c.copiePhrase = msg; } else { c.copieExemple = msg; }
    var m = document.getElementById(phrase ? 'buiaC1MsgPhrase' : 'buiaC1MsgExemple'); if (m) { m.textContent = msg; m.hidden = false; }
    if (typeof trackEvenement === 'function') { trackEvenement('bien_utiliser_ia_copie', { modele: phrase ? 'c1-phrase-cle' : 'c1-exemple-questions' }); }
    return true;
  }
  if (act === 'vers') {
    if (typeof trackEvenement === 'function') { trackEvenement('bien_utiliser_ia_chemin', { chemin: v, depuis: 'comprendre' }); }
    if (v === 'modeles') { naviguerVers(BUIA_ROUTE_MODELES); return true; }
    if (v === 'ecrire') { naviguerVers(BUIA_ROUTE_LIBRE); return true; }
    var m = document.getElementById('buiaMsgVers'); if (m) { m.hidden = false; }
    return true;
  }
  return false;
}
