/* ============================================================
   modules/bien-utiliser-ia/libreUi.js
   Chemin 3 « Écrire ma propre demande » : écrans Écrire, Améliorer, Garder. Et les actions de « Mes demandes » (disquette), partagées avec le chemin 2.
   Navigateur seulement (pas chargé par les tests Node). Logique : libreLogique.js, gardeLogique.js, blocs.js. Textes : data/buiaLibreTextes.js. Réglages : data/buiaDemande.js.
   Phrases : prompts/bien-utiliser-blocs.md, lues par buiaChargerBlocs (index.js). Maquette validée : docs/maquettes/maquette-bien-utiliser-ia-ecrire-ma-demande-2026-11-23.html.
   Les actes de ce chemin commencent par « l- » (libre) ou « g- » (garde) : aucune collision avec ceux des chemins 1 et 2.
   Rien n'est enregistré sur l'appareil : tout vit en mémoire ; seule la disquette garde ce que la personne y ajoute.
   ============================================================ */

function _buiaC3() { return _buiaUi.c3; }
function _buiaC3Niveau() { return _buiaUi.c1.niveau === 'plus' ? 'plus' : 'bases'; }
function _buiaC3Contexte() { return { aujourdhui: new Date(), niveau: _buiaC3Niveau() }; }
function _buiaC3Assembler() {
  var e = buiaEtatBlocs();
  if (e.etat !== 'ok' || !_buiaC3().saisie) { return null; }
  return buiaLibreAssembler(e.blocs, _buiaC3().saisie, _buiaC3Contexte());
}
function _buiaC3Pressed(b, v) { return '<button type="button" class="buia-choix" ' + b + ' aria-pressed="' + (v ? 'true' : 'false') + '">'; }

// ---------------- Niveau de lecture (le même que celui du chemin « Comprendre ») ----------------
function _buiaC3HtmlNiveaux() {
  var n = BUIA_C1_NIVEAUX, plus = _buiaC3Niveau() === 'plus';
  return '<div class="buia-niveaux"><span class="buia-etiq">' + _buiaEsc(n.etiquette) + '</span>' +
    '<button type="button" class="buia-choix" data-buia-act="l-niveau" data-v="bases" aria-pressed="' + (plus ? 'false' : 'true') + '">' + _buiaEsc(n.bases) + '</button>' +
    '<button type="button" class="buia-choix" data-buia-act="l-niveau" data-v="plus" aria-pressed="' + (plus ? 'true' : 'false') + '">' + _buiaEsc(n.plus) + '</button></div>';
}
function _buiaC3Pastille() { return ' <span class="buia-pastille-niveau">' + _buiaEsc(BUIA_C1_NIVEAUX.pastille) + '</span>'; }

// ---------------- Écran 1 : écrire ----------------
function _buiaC3HtmlChamp(id) {
  var t = BUIA_C3_E1.champs[id], s = _buiaC3().saisie, plus = id === 'exemple', q = buiaLibreAideQuestions(id);
  return '<div class="buia-champ"><label class="buia-lib" for="buiaL-' + id + '">' + _buiaEsc(t.lib) + (plus ? _buiaPastilleNiveauLibre() : '') + '</label><div class="buia-aide-ch">' + _buiaEsc(t.aide) + '</div>' +
    (q ? '<div class="buia-aide-ch buia-aide-q" id="buiaLAide-' + id + '">' + _buiaEsc(q) + '</div>' : '') +
    '<textarea id="buiaL-' + id + '" rows="' + t.lignes + '" data-buia-champ="l-' + id + '" placeholder="' + _buiaEsc(t.exemple) + '">' + _buiaEsc(s[id]) + '</textarea></div>';
}
function _buiaPastilleNiveauLibre() { return _buiaC3Pastille(); }

function _buiaC3HtmlReglages() {
  var s = _buiaC3().saisie, h = '<div class="buia-champ"><div class="buia-lib">' + _buiaEsc(BUIA_C3_E1.attente) + '</div>';
  BUIA_REGLAGES.forEach(function (g, i) {
    h += '<div class="buia-aide-ch' + (i ? ' mt-2' : '') + '">' + _buiaEsc(g.titre) + '</div><div class="buia-seg" role="group" aria-label="' + _buiaEsc(g.titre) + '">' +
      g.choix.map(function (x) { return _buiaC3Pressed('data-buia-act="l-choix" data-g="' + g.groupe + '" data-v="' + x.v + '"', s[g.groupe] === x.v) + _buiaEsc(x.lib) + '</button>'; }).join('') + '</div>';
  });
  h += '</div><div class="buia-champ"><div class="buia-lib">' + _buiaEsc(BUIA_C3_E1.interdit) + '</div><div class="buia-seg" role="group" aria-label="' + _buiaEsc(BUIA_C3_E1.interdit) + '">' +
    BUIA_INTERRUPTEURS.filter(function (i) { return i.niveau !== 'plus' || _buiaC3Niveau() === 'plus'; }).map(function (i) {
      return _buiaC3Pressed('data-buia-act="l-interrupteur" data-v="' + i.id + '"', s.interrupteurs[i.id]) + _buiaEsc(i.lib) + '</button>';
    }).join('') + '</div></div>';
  return h;
}

function _buiaC3Ecran1() {
  var c = _buiaC3(), t = BUIA_C3_E1, e = buiaEtatBlocs(), plus = _buiaC3Niveau() === 'plus';
  var tete = '<div class="buia-panneau"><h2>' + _buiaRondNum2(1) + _buiaEsc(t.titre) + '</h2>' +
    '<div class="buia-encart rappel"><strong>' + _buiaEsc(t.rappel.titre) + '</strong> ' + _buiaEsc(t.rappel.texte) + '</div>' +
    '<div class="buia-encart"><strong>' + _buiaEsc(t.libre.titre) + '</strong> ' + _buiaEsc(t.libre.texte) + '</div>';
  if (e.etat !== 'ok') {
    var erreur = e.etat === 'erreur';
    return tete + '<div class="buia-encart' + (erreur ? ' rappel' : '') + '" role="status">' + _buiaEsc(erreur ? t.indisponible : t.chargement) + '</div>' +
      (erreur ? '<div class="buia-actions"><button type="button" class="btn btn-primary" data-buia-act="l-reessayer">' + _buiaEsc(t.reessayer) + '</button></div>' : '') + '</div>';
  }
  var gauche = '<div class="buia-actions mt-0"><button type="button" class="btn btn-outline-primary" data-buia-act="l-exemple">' + _buiaEsc(t.exemple.bouton) + '</button></div>' +
    _buiaC3HtmlChamp('but') + _buiaC3HtmlChamp('situation') + _buiaC3HtmlChamp('texte') + _buiaC3HtmlReglages() + (plus ? _buiaC3HtmlChamp('exemple') : '') +
    '<div class="buia-encart ok"><strong>' + _buiaEsc(t.date.titre) + '</strong> ' + _buiaEsc(t.date.texte) + '</div>' +
    (plus ? '<details class="bloc-depli" open><summary>' + _buiaEsc(t.conversations.titre) + _buiaC3Pastille() + '</summary><div class="bloc-depli-corps">' + _buiaEsc(t.conversations.texte) + '</div></details>' : '');
  var a = t.apercu;
  var droite = '<div class="buia-apercu"><h3 class="h6 fw-bold">' + _buiaEsc(a.titre) + '</h3><div class="buia-demande-texte" id="buiaLApercu" aria-live="polite"></div>' +
    '<div class="buia-actions"><button type="button" class="btn btn-primary" id="buiaLBtnCopier" data-buia-act="l-copier">' + _buiaEsc(a.copier) + '</button>' +
    '<span class="buia-msg" id="buiaLMsgCopie" aria-live="polite">' + _buiaEsc(c.msgCopie) + '</span></div><p class="buia-petit buia-discret mb-1" id="buiaLRaison" role="status"></p>' +
    '<p class="buia-petit buia-discret mb-1">' + _buiaEsc(a.note) + '</p>' +
    '<p class="buia-petit mb-1"><strong>' + _buiaEsc(a.ajoutees.titre) + '</strong> ' + _buiaEsc(a.ajoutees.texte) + '</p>' +
    '<div class="buia-encart rappel"><strong>' + _buiaEsc(a.recours.titre) + '</strong> ' + _buiaEsc(a.recours.texte) + '</div></div>';
  return tete + '<div class="buia-deux-col"><div>' + gauche + '</div>' + droite + '</div></div>';
}

// Recompose la demande et met à jour, sur place, l'aperçu et le bouton « Copier » (fermé tant que le but ou la situation reste à compléter).
function _buiaC3MajApercu() {
  var r = _buiaC3Assembler(), z = document.getElementById('buiaLApercu');
  if (!r || !z) { return; }
  z.innerHTML = r.lignes.map(function (l, i) { return (i && l.saut ? '\n' : '') + (i ? '\n' : '') + '<span class="buia-seg-couleur buia-e' + l.element + '">' + _buiaEsc(l.texte) + '</span>'; }).join('');
  var b = document.getElementById('buiaLBtnCopier'); if (b) { b.disabled = r.aCompleter; }
  var m = document.getElementById('buiaLRaison'); if (m) { m.textContent = buiaLibreMessageACompleter(r.manque); }
}

// ---------------- Écran 2 : améliorer ----------------
function _buiaC3LigneTest(t) {
  var c = _buiaC3(), E = BUIA_C3_E2, def = buiaLibreAmeliorations().filter(function (a) { return a.id === t.id; })[0];
  var present = c.saisie.ajouts.some(function (a) { return a.id === t.id; }), coche = !!c.coches[t.id];
  var h = '<div class="buia-ligne-test"><input type="checkbox" id="buiaT-' + t.id + '" data-buia-act="l-coche" data-v="' + t.id + '"' + (coche ? ' checked' : '') + '><div class="buia-ligne-corps">' +
    '<label for="buiaT-' + t.id + '">' + _buiaEsc(t.q) + '</label>' +
    '<div class="buia-encart buia-essai" id="buiaEssai-' + t.id + '"' + (coche ? '' : ' hidden') + '><div>' + _buiaEsc(E.essai + t.essai) + '</div>';
  if (def && def.champ && t.precision) {
    h += '<div class="buia-champ mt-2 mb-1"><label class="buia-lib" for="buiaP-' + t.id + '">' + _buiaEsc(t.precision.lib) + '</label>' +
      '<input type="text" id="buiaP-' + t.id + '" data-buia-champ="l-p-' + t.id + '" value="' + _buiaEsc(c.precisions[t.id] || '') + '" placeholder="' + _buiaEsc(t.precision.exemple) + '" autocomplete="off"></div>';
  }
  h += '<div class="buia-actions mt-2"><button type="button" class="btn btn-outline-primary" data-buia-act="l-ajouter" data-v="' + t.id + '">' + _buiaEsc(E.ajouter) + '</button>' +
    (present ? '<button type="button" class="btn btn-outline-primary" data-buia-act="l-retirer" data-v="' + t.id + '">' + _buiaEsc(E.retirer) + '</button>' : '') +
    '<span class="buia-msg" role="status">' + _buiaEsc(c.msgTests[t.id] || '') + '</span></div></div></div></div>';
  return h;
}

function _buiaC3Ecran2() {
  var E = BUIA_C3_E2, plus = _buiaC3Niveau() === 'plus';
  return '<div class="buia-panneau"><h2>' + _buiaRondNum2(2) + _buiaEsc(E.titre) + '</h2><p>' + _buiaEsc(E.intro) + '</p>' +
    '<div class="buia-encart rappel"><strong>' + _buiaEsc(E.rappel.titre) + '</strong> ' + _buiaEsc(E.rappel.texte) + '</div>' +
    E.tests.map(_buiaC3LigneTest).join('') +
    (plus ? '<details class="bloc-depli bd-pret" open><summary>' + _buiaEsc(E.garder.titre) + _buiaC3Pastille() + '</summary><div class="bloc-depli-corps">' + _buiaEsc(E.garder.texte) + '</div></details>' : '') + '</div>';
}

// ---------------- Écran 3 : garder ----------------
// avecCases : dans la famille « Mes demandes » du chemin 2, une case devant chaque demande pour la partager avec un collègue (modelesUi.js, « p-coche »).
function _buiaGHtmlListe(avecCases) {
  var T = BUIA_GARDE_T, liste = _buiaGarde.demandes;
  if (!liste.length) { return '<p class="buia-petit buia-discret mb-0">' + _buiaEsc(T.listeVide) + '</p>'; }
  return liste.map(function (d) {
    var m = d.type === 'modele' ? buiaModele(d.modele) : null;
    var intitule = _buiaEsc(d.nom) + '<span class="buia-var">' + _buiaEsc(d.type === 'modele' ? T.typeModele(m ? m.nom : '') : T.typeLibre) + '</span>';
    var nom = avecCases
      ? '<label class="buia-nom-modele buia-p-case"><input type="checkbox" data-buia-act="p-coche" data-v="' + _buiaEsc(d.id) + '"' + (_buiaUi.c2.partage.choisies[d.id] ? ' checked' : '') + '><span>' + intitule + '</span></label>'
      : '<div class="buia-nom-modele">' + intitule + '</div>';
    return '<div class="buia-modele-ligne">' + nom +
      '<div class="buia-actions mt-0 mb-0"><button type="button" class="btn btn-outline-primary" data-buia-act="g-ouvrir" data-v="' + _buiaEsc(d.id) + '">' + _buiaEsc(T.ouvrir) + '</button>' +
      '<button type="button" class="btn btn-outline-primary" data-buia-act="g-supprimer" data-v="' + _buiaEsc(d.id) + '">' + _buiaEsc(T.supprimer) + '</button></div></div>';
  }).join('');
}
function _buiaGMajListe() {
  var z = document.getElementById('buiaGListe'); if (z) { z.innerHTML = _buiaGHtmlListe(); }
  var f = document.getElementById('buiaFamilles'); if (f && typeof _buiaC2HtmlFamilles === 'function') { f.innerHTML = _buiaC2HtmlFamilles(); }
  if (typeof rafraichirRappelsSauvegarde === 'function') { rafraichirRappelsSauvegarde(); }
}

function _buiaC3Ecran3() {
  var c = _buiaC3(), T = BUIA_GARDE_T, E = BUIA_C3_E3;
  return '<div class="buia-panneau"><h2>' + _buiaRondNum2(3) + _buiaEsc(E.titre) + '</h2><p>' + _buiaEsc(E.intro) + '</p>' +
    '<div class="buia-champ"><label class="buia-lib" for="buiaLNom">' + _buiaEsc(T.nomLabel) + '</label><input type="text" id="buiaLNom" data-buia-champ="l-nom" maxlength="' + BUIA_GARDE_NOM_MAX + '" value="' + _buiaEsc(c.nom) + '" placeholder="' + _buiaEsc(T.nomExemple) + '" autocomplete="off"></div>' +
    '<div class="buia-actions"><button type="button" class="btn btn-primary" data-buia-act="l-garder">' + _buiaEsc(T.bouton) + '</button>' +
    '<span class="buia-msg" id="buiaLMsgGarde" role="status">' + _buiaEsc(c.msgGarde) + '</span></div>' +
    '<div class="buia-encart">' + _buiaEsc(T.encart) + ' ' + _buiaEsc(T.pasLeTexte) + '</div>' +
    (typeof htmlRappelSauvegarde === 'function' ? htmlRappelSauvegarde() : '') +
    '<h3 class="h6 fw-bold mt-3">' + _buiaEsc(T.listeTitre) + '</h3><div id="buiaGListe">' + _buiaGHtmlListe() + '</div>' +
    '<div class="mt-3"><button type="button" class="btn btn-outline-primary" data-buia-act="l-recommencer">' + _buiaEsc(E.recommencer) + '</button></div></div>';
}

// ---------------- Page ----------------
function pageBienUtiliserIaEcrire() {
  if (!buiaOuvert()) { if (typeof naviguerVers === 'function') { naviguerVers('cv'); } return; }
  buiaRendreLibre();
  _buiaC3ChargerSiBesoin();
}
function _buiaC3ChargerSiBesoin() {
  if (buiaEtatBlocs().etat === 'attente' || buiaEtatBlocs().etat === 'chargement') {
    buiaChargerBlocs().then(function () { if (typeof pageActuelle !== 'undefined' && pageActuelle === BUIA_ROUTE_LIBRE) { _buiaC3MajCorps(); } });
  }
}
function _buiaC3HtmlEcran() {
  var e = _buiaC3().etape;
  return e === 0 ? _buiaC3Ecran1() : (e === 1 ? _buiaC3Ecran2() : _buiaC3Ecran3());
}
function _buiaC3MajCorps() {
  var corps = document.getElementById('buiaC3Corps'), niv = document.getElementById('buiaC3Niveaux');
  if (corps) { corps.innerHTML = _buiaC3HtmlEcran(); }
  if (niv) { niv.innerHTML = _buiaC3HtmlNiveaux(); }
  if (_buiaC3().etape === 0) { _buiaC3MajApercu(); }
}

function buiaRendreLibre() {
  var c = _buiaC3(), dernier = c.etape === BUIA_C3_ETAPES.length - 1;
  app.innerHTML =
    '<div class="page-catalogue-contenu buia-page" id="buiaRacine">' +
    htmlBandeRepriseModule(htmlBoutonRevoirModule('btnBuiaRevoir', BUIA_ICONE, 'Revoir la présentation', false), '') +
    htmlTitreEtapeModule(BUIA_ICONE, BUIA_NOM, _buiaEsc(BUIA_C3_TITRE), _buiaEsc(BUIA_C3_SOUS_TITRE)) +
    (typeof barreEtapesModule === 'function' ? barreEtapesModule(BUIA_C3_ETAPES, c.etape) : '') +
    '<div id="buiaC3Niveaux">' + _buiaC3HtmlNiveaux() + '</div><div id="buiaC3Corps">' + _buiaC3HtmlEcran() + '</div></div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation(BUIA_ROUTE, dernier ? BUIA_ROUTE : 'x', dernier ? 'Choisir un chemin' : undefined,
      { onclickPrecedent: 'buiaC3Precedent()', onclickSuivant: 'buiaC3Suivant()', libelleExact: dernier }) + '</div>';
  var btnRevoir = document.getElementById('btnBuiaRevoir');
  if (btnRevoir) { btnRevoir.addEventListener('click', function () { buiaRetourVersPresentation(true, BUIA_ROUTE_LIBRE); }); }
  var racine = document.getElementById('buiaRacine');
  if (racine) { racine.addEventListener('click', buiaClic); racine.addEventListener('input', buiaSaisie); }
  if (c.etape === 0) { _buiaC3MajApercu(); }
  if (typeof trackEvenement === 'function') { trackEvenement('bien_utiliser_ia_vue', { vue: 'ecrire', etape: c.etape + 1 }); }
}

function buiaC3Aller(n) {
  var c = _buiaC3();
  c.etape = Math.max(0, Math.min(BUIA_C3_ETAPES.length - 1, n));
  c.msgCopie = '';
  buiaRendreLibre();
  _buiaC3ChargerSiBesoin();
  window.scrollTo(0, 0);
}
function buiaC3Precedent() { if (_buiaC3().etape <= 0) { naviguerVers(BUIA_ROUTE); } else { buiaC3Aller(_buiaC3().etape - 1); } }
function buiaC3Suivant() { if (_buiaC3().etape >= BUIA_C3_ETAPES.length - 1) { naviguerVers(BUIA_ROUTE); } else { buiaC3Aller(_buiaC3().etape + 1); } }

// Saisie dans un champ : mise à jour sur place, sans redessiner la page (le curseur reste où il est).
function buiaC3Saisie(champ, valeur) {
  var c = _buiaC3();
  if (champ === 'l-nom') { c.nom = valeur; return; }
  if (champ.indexOf('l-p-') === 0) { c.precisions[champ.slice(4)] = valeur; return; }
  var id = champ.slice(2);
  if (Object.prototype.hasOwnProperty.call(c.saisie, id) && typeof c.saisie[id] === 'string') {
    var def = buiaLibreChamps().filter(function (x) { return x.id === id; })[0];
    c.saisie[id] = def ? valeur.slice(0, def.max) : valeur;
    _buiaC3MajApercu();
  }
}

function _buiaC3Msg(id, texte) { var z = document.getElementById(id); if (z) { z.textContent = texte; if (z.hidden !== undefined && z.tagName === 'DIV') { z.hidden = !texte; } } }

// Ouvre une demande gardée : une demande libre dans l'écran Écrire, une demande de modèle dans l'écran Compléter du chemin 2 (le courrier est à recoller).
function buiaGOuvrir(id) {
  var d = buiaGardeTrouver(_buiaGarde, id);
  if (!d) { return; }
  if (typeof trackEvenement === 'function') { trackEvenement('bien_utiliser_ia_demande_ouverte', { type: d.type }); }
  if (d.type === 'libre') {
    var c3 = _buiaC3();
    c3.saisie = buiaLibreNettoyer(d.saisie); c3.etape = 0; c3.nom = d.nom; c3.coches = {}; c3.precisions = {}; c3.msgTests = {}; c3.msgCopie = ''; c3.msgGarde = '';
    if (typeof pageActuelle !== 'undefined' && pageActuelle === BUIA_ROUTE_LIBRE) { buiaRendreLibre(); window.scrollTo(0, 0); } else { naviguerVers(BUIA_ROUTE_LIBRE); }
    return;
  }
  var c2 = _buiaUi.c2;
  c2.modele = d.modele; c2.saisie = buiaNettoyerSaisie(d.modele, d.saisie); c2.reprise = false; c2.vu = false; c2.nomGarde = d.nom; c2.msgGardeModele = ''; c2.garderOuvert = false; c2.msgApres = ''; c2.copie = '';
  if (typeof pageActuelle !== 'undefined' && pageActuelle === BUIA_ROUTE_MODELES) { buiaC2Aller(1); } else { c2.etape = 1; naviguerVers(BUIA_ROUTE_MODELES); }
}

// Actions du chemin 3 et de « Mes demandes » (appelée par buiaClic, index.js). Retourne true si l'action est reconnue.
function buiaC3Clic(act, v, el) {
  var c = _buiaC3(), s = c.saisie;
  if (act === 'l-niveau') { _buiaUi.c1.niveau = (v === 'plus') ? 'plus' : 'bases'; _buiaC3MajCorps(); return true; }
  if (act === 'l-reessayer') { buiaChargerBlocs(true).then(function () { _buiaC3MajCorps(); }); _buiaC3MajCorps(); return true; }
  if (act === 'l-exemple') {
    var ex = BUIA_C3_E1.exemple;
    s.but = ex.but; s.situation = ex.situation; s.texte = '';
    ['but', 'situation', 'texte'].forEach(function (k) { var z = document.getElementById('buiaL-' + k); if (z) { z.value = s[k]; } });
    _buiaC3MajApercu(); return true;
  }
  if (act === 'l-choix') {
    var net = buiaLibreNettoyer(Object.assign({}, s, (function (o) { o[el.getAttribute('data-g')] = v; return o; })({})));
    s.longueur = net.longueur; s.langage = net.langage;
    Array.prototype.forEach.call(document.querySelectorAll('[data-buia-act="l-choix"][data-g="' + el.getAttribute('data-g') + '"]'), function (b) { b.setAttribute('aria-pressed', String(b === el)); });
    _buiaC3MajApercu(); return true;
  }
  if (act === 'l-interrupteur') {
    if (Object.prototype.hasOwnProperty.call(s.interrupteurs, v)) {
      s.interrupteurs[v] = !s.interrupteurs[v]; el.setAttribute('aria-pressed', String(s.interrupteurs[v])); _buiaC3MajApercu();
    }
    return true;
  }
  if (act === 'l-copier') {
    var r = _buiaC3Assembler();
    if (!r || r.aCompleter) { return true; }
    if (typeof copierTexteVersPressePapier === 'function') { copierTexteVersPressePapier(r.texte, null); }
    c.msgCopie = BUIA_C3_E1.apercu.copiee; _buiaC3Msg('buiaLMsgCopie', c.msgCopie);
    if (typeof trackEvenement === 'function') { trackEvenement('bien_utiliser_ia_copie', { chemin: 'ecrire' }); }
    return true;
  }
  if (act === 'l-coche') {
    c.coches[v] = !!(el && el.checked);
    var z = document.getElementById('buiaEssai-' + v); if (z) { z.hidden = !c.coches[v]; }
    return true;
  }
  if (act === 'l-ajouter') {
    var E = BUIA_C3_E2, def = buiaLibreAmeliorations().filter(function (a) { return a.id === v; })[0], e = buiaEtatBlocs();
    if (!def || e.etat !== 'ok') { return true; }
    if (def.champ && !String(c.precisions[v] || '').trim()) { c.msgTests[v] = E.precisionVide; _buiaC3MajCorps(); return true; }
    if (buiaLibreAjoutDejaPresent(e.blocs, s, v, _buiaC3Contexte())) { c.msgTests[v] = E.dejaLa; _buiaC3MajCorps(); return true; }
    var neuve = buiaLibreAjouter(s, v, c.precisions[v]);
    if (neuve) { c.saisie = neuve; c.msgTests[v] = E.ajoutee; }
    _buiaC3MajCorps(); return true;
  }
  if (act === 'l-retirer') { c.saisie = buiaLibreRetirer(s, v); c.msgTests[v] = BUIA_C3_E2.retiree; _buiaC3MajCorps(); return true; }
  if (act === 'l-garder') {
    var T = BUIA_GARDE_T, res = buiaGardeAjouterLibre(_buiaGarde, c.nom, s);
    if (res.refuse === 'vide') { c.msgGarde = T.vide; } else if (res.refuse) { c.msgGarde = T.plein; }
    else {
      _buiaGarde = res.etat; c.msgGarde = (res.remplace ? T.remplacee : T.ajoutee)(buiaGardeTrouver(_buiaGarde, res.id).nom);
      if (typeof trackEvenement === 'function') { trackEvenement('bien_utiliser_ia_demande_gardee', { type: 'libre' }); }
    }
    _buiaC3Msg('buiaLMsgGarde', c.msgGarde); _buiaGMajListe(); return true;
  }
  if (act === 'l-recommencer') { _buiaUi.c3 = _buiaC3Vierge(); buiaC3Aller(0); return true; }
  if (act === 'g-ouvrir') { buiaGOuvrir(v); return true; }
  if (act === 'g-supprimer') {
    var d = buiaGardeTrouver(_buiaGarde, v);
    if (d) {
      _buiaGarde = buiaGardeSupprimer(_buiaGarde, v);
      delete _buiaUi.c2.partage.choisies[v];   // une demande supprimée n'est plus à partager (son identifiant peut resservir)
      var msg = BUIA_GARDE_T.supprimee(d.nom);
      if (_buiaC3().etape === 2 && document.getElementById('buiaLMsgGarde')) { _buiaC3().msgGarde = msg; _buiaC3Msg('buiaLMsgGarde', msg); }
      _buiaGMajListe();
    }
    return true;
  }
  return false;
}
