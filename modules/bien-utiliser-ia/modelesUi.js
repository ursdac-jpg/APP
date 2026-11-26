/* ============================================================
   modules/bien-utiliser-ia/modelesUi.js
   Chemin 2 « J'ai un papier ou une situation » : écrans Choisir, Compléter, Après la réponse. Navigateur seulement (pas chargé par les tests Node).
   Logique : modelesLogique.js (repérage), papierLogique.js (masquage, dates, alerte), modeleLogique.js (assemblage). Textes : data/buiaModelesTextes.js.
   Phrases du modèle : prompts/bien-utiliser-modele-N.md, lues par buiaChargerBlocsModele (index.js). Maquette validée : docs/maquettes/maquette-bien-utiliser-ia-mes-modeles-2026-11-23.html.
   Rien n'est enregistré : tout vit en mémoire le temps de la session. Le texte du papier ne quitte jamais l'appareil.
   ============================================================ */

function _buiaC2() { return _buiaUi.c2; }
function _buiaMaintenant() { return new Date(); }
function _buiaById(id) { return document.getElementById(id); }
function _buiaRondNum2(n) { return '<span class="buia-rond-num" aria-hidden="true">' + n + '</span>'; }
function _buiaBoutonChoix(libelle, attrs, presse) { return '<button type="button" class="buia-choix" ' + attrs + ' aria-pressed="' + (presse ? 'true' : 'false') + '">' + _buiaEsc(libelle) + '</button>'; }

// Le champ d'un modèle qui reçoit le papier ou le texte déjà collé à l'étape 1 (le courrier, le message reçu, le texte...). Chaîne vide s'il n'y en a pas.
function _buiaC2ChampPapier(id) {
  var def = buiaDefModele(id), ch = def ? def.champs.filter(function (x) { return x.papier; })[0] : null;
  return ch ? ch.id : '';
}
// Le texte analysé pour l'alerte : le papier à l'étape 1, le courrier du modèle à l'étape 2 (seulement pour les modèles qui parlent d'un courrier : `alerteDates`).
function _buiaC2TexteAlerte() {
  var c = _buiaC2(), def = c.modele ? buiaDefModele(c.modele) : null;
  if (c.etape === 1 && c.saisie) { return def && def.alerteDates ? (c.saisie.champs[_buiaC2ChampPapier(c.modele)] || '') : ''; }
  return c.papier || '';
}
function _buiaC2Alerte() { return buiaAlerteDates(_buiaC2TexteAlerte(), _buiaMaintenant()); }

// ---------------- Alerte de date (faite par le code) ----------------
// type 'vu' : sous le papier et à l'étape 2 (case « Je l'ai vu ») ; type 'reprise' : avant « Copier » (case « Ajouter cette date à ma demande »).
function _buiaC2HtmlAlerte(alerte, type) {
  if (!alerte || !alerte.proches.length) { return ''; }
  var c = _buiaC2(), t = BUIA_C2_ALERTE;
  var h = buiaPhrasesProches(alerte).map(function (p) {
    return '<div><strong>' + _buiaEsc(p.titre) + '</strong> <span>' + _buiaEsc(p.conseil) + '</span><span class="buia-phrase-courrier">' + _buiaEsc(p.phrase) + '</span></div>';
  }).join('');
  var reprise = type === 'reprise';
  h += '<label class="buia-choix-alerte"><input type="checkbox" data-buia-act="' + (reprise ? 'reprise' : 'vu') + '"' + ((reprise ? c.reprise : c.vu) ? ' checked' : '') + '> ' + _buiaEsc(reprise ? t.reprise : t.vu) + '</label>';
  return '<div class="buia-alerte' + (!reprise && c.vu ? ' calme' : '') + '" role="status">' + h + '</div>';
}
function _buiaC2HtmlAlerteDouce(alerte) {
  var t = buiaTexteAlerteDouce(alerte);
  return t ? '<div class="buia-alerte douce" role="status">' + _buiaEsc(t) + '</div>' : '';
}
function _buiaC2MajAlertes() {
  var a = _buiaC2Alerte(), z;
  if ((z = _buiaById('buiaAlerte'))) { z.innerHTML = _buiaC2HtmlAlerte(a, 'vu'); }
  if ((z = _buiaById('buiaAlerteDelai'))) { z.innerHTML = _buiaC2HtmlAlerteDouce(a); }
  if ((z = _buiaById('buiaAlerte2'))) { z.innerHTML = _buiaC2HtmlAlerte(a, 'vu'); }
  // La case « Ajouter cette date à ma demande » n'existe que pour un modèle qui a une ligne de reprise de la date (le modèle 5 traite lui-même le délai proche, dans ses règles).
  var def = buiaDefModele(_buiaC2().modele);
  if ((z = _buiaById('buiaAlerteCopie'))) { z.innerHTML = (def && def.ordre.some(function (o) { return o.code === 'repriseDate'; })) ? _buiaC2HtmlAlerte(a, 'reprise') : ''; }
}

// ---------------- Écran 1 : choisir ----------------
function _buiaC2HtmlResultats() {
  var c = _buiaC2(), t = BUIA_C2_E1.resultats;
  if (!c.resultats) { return ''; }
  var h = '<div class="buia-panneau"><h2>' + _buiaEsc(t.titre) + '</h2><p class="mb-1">' + _buiaEsc(c.resultats.source === 'papier' ? t.chapoPapier : t.chapoMots) + '</p><div class="buia-sugg">';
  c.resultats.liste.forEach(function (r, i) {
    var dispo = buiaModeleDisponible(r.id);
    h += '<div class="buia-prop' + (i === 0 ? ' premier' : '') + '"><h3>' + _buiaEsc(r.nom) + (dispo ? '' : ' <span class="buia-pastille-niveau">' + _buiaEsc(BUIA_C2_BIENTOT_PASTILLE) + '</span>') + '</h3>' +
      '<div class="buia-fam">' + _buiaEsc(r.famille) + '</div><div class="buia-pourquoi">' + _buiaEsc(t.motsReperes) +
      r.mots.slice(0, 4).map(function (k) { return '<span class="buia-pill">« ' + _buiaEsc(k) + ' »</span>'; }).join('') + '</div>' +
      '<button type="button" class="btn btn-primary" data-buia-act="modele" data-v="' + r.id + '">' + _buiaEsc(t.choisir) + '</button></div>';
  });
  h += '</div>' + (c.resultats.liste.length ? '' : '<div class="buia-encart">' + _buiaEsc(t.aucun) + '</div>') + '<p class="buia-petit buia-discret mb-0">' + _buiaEsc(t.prudence) + '</p></div>';
  return h;
}
function _buiaC2MajResultats() { var z = _buiaById('buiaZoneResultats'); if (z) { z.innerHTML = _buiaC2HtmlResultats(); } }

// La famille « Mes demandes » : les demandes que la personne a gardées sur sa disquette (visible seulement quand il y en a).
function _buiaC2HtmlMesDemandes() {
  var T = BUIA_GARDE_T, c = _buiaC2();
  if (!_buiaGarde.demandes.length) { return ''; }
  return '<details class="bloc-depli"' + (c.famille === T.familleTitre ? ' open' : '') + '><summary>' + _buiaEsc(T.familleTitre) + '</summary><div class="bloc-depli-corps">' + _buiaGHtmlListe(true) + _buiaPHtmlEnvoi() + '</div></details>';
}

// ---------------- Partager ses demandes avec un collègue (P13, décision de Denis du 25/11/2026) ----------------
// Un fichier à part, jamais la disquette. Envoi : cases dans « Mes demandes », étape « Ce qui va partir » dans la page (jamais dans une fenêtre), case « J'ai relu ».
// Réception : dans « Pour les professionnels », le contenu est lu AVANT tout ajout. Logique pure et testée : gardeLogique.js (buiaPartage*). Textes : BUIA_PARTAGE_T.
function _buiaPartageUi() { return _buiaUi.c2.partage; }
function _buiaPIds() { var p = _buiaPartageUi(); return _buiaGarde.demandes.filter(function (d) { return p.choisies[d.id]; }).map(function (d) { return d.id; }); }
function _buiaPFocus(id) { var z = _buiaById(id); if (z && z.focus) { z.focus(); } }
function _buiaPTypeDemande(d) { var T = BUIA_GARDE_T, m = d.type === 'modele' ? buiaModele(d.modele) : null; return d.type === 'modele' ? T.typeModele(m ? m.nom : '') : T.typeLibre; }
// Une demande telle qu'elle est écrite : son nom, son type, puis chaque texte de la personne (jamais un réglage caché, tout ce qui est lisible est montré).
function _buiaPHtmlFiche(d, pastille) {
  var T = BUIA_PARTAGE_T.envoi, libs = { but: T.libBut, situation: T.libSituation, exemple: T.libExemple, precision: T.libPrecision };
  var lignes = buiaPartageLignes(d);
  return '<div class="buia-p-fiche"><strong>' + _buiaEsc(d.nom) + '</strong><span class="buia-var">' + _buiaEsc(_buiaPTypeDemande(d)) + (pastille ? ' · ' + _buiaEsc(pastille) : '') + '</span>' +
    (lignes.length ? '<dl>' + lignes.map(function (l) { return '<dt>' + _buiaEsc(l.cle === 'champ' ? l.lib : libs[l.cle]) + '</dt><dd>' + _buiaEsc(l.texte) + '</dd>'; }).join('') + '</dl>' : '<p class="buia-petit buia-discret mb-0">' + _buiaEsc(T.rienEcrit) + '</p>') + '</div>';
}

function _buiaPHtmlEnvoi() {
  var T = BUIA_PARTAGE_T.envoi, n = _buiaPIds().length;
  return '<h3 class="h6 fw-bold mt-3">' + _buiaEsc(T.titre) + '</h3><p class="mb-1">' + _buiaEsc(T.intro) + '</p>' +
    '<div class="fw-bold my-2" id="buiaPCompteur" role="status" aria-live="polite">' + _buiaEsc(n ? T.choisies(n) : T.aucune) + '</div>' +
    '<div class="buia-actions mt-0"><button type="button" class="btn btn-primary" id="buiaPPreparer" data-buia-act="p-preparer"' + (n ? '' : ' disabled') + '>' + _buiaEsc(T.preparer) + '</button></div>' +
    '<div id="buiaPEnvoi">' + _buiaPHtmlEnvoiZone() + '</div>';
}
function _buiaPHtmlEnvoiZone() {
  var T = BUIA_PARTAGE_T.envoi, p = _buiaPartageUi(), ids = _buiaPIds(), h = '';
  if (!ids.length) { p.prepa = false; }
  if (p.prepa) {
    var f = buiaPartageExporter(_buiaGarde, ids);
    h += '<h3 class="h6 fw-bold mt-3" tabindex="-1" id="buiaPPrepaTitre">' + _buiaEsc(T.prepaTitre) + '</h3><p class="mb-1">' + _buiaEsc(T.prepaIntro) + '</p>' +
      (f ? f.demandes : []).map(function (d) { return _buiaPHtmlFiche(d, ''); }).join('') +
      _buiaEncartC1(T.verifier.titre, T.verifier.texte, 'rappel') +
      '<label class="buia-p-relu" for="buiaPRelu"><input type="checkbox" id="buiaPRelu" data-buia-act="p-relu"' + (p.relu ? ' checked' : '') + '><span>' + _buiaEsc(T.relu) + '</span></label>' +
      '<div class="buia-actions"><button type="button" class="btn btn-primary" id="buiaPEnregistrer" data-buia-act="p-enregistrer"' + (p.relu ? '' : ' disabled') + '>' + _buiaEsc(T.enregistrer) + '</button>' +
      '<button type="button" class="btn btn-outline-primary" data-buia-act="p-retour">' + _buiaEsc(T.retour) + '</button></div>';
  }
  if (p.msgEnvoi) { h += '<div class="buia-encart ok" role="status">' + _buiaEsc(p.msgEnvoi) + '</div>'; }
  return h;
}
function _buiaPMajEnvoi() {
  var T = BUIA_PARTAGE_T.envoi, n = _buiaPIds().length, c = _buiaById('buiaPCompteur'), b = _buiaById('buiaPPreparer'), z = _buiaById('buiaPEnvoi');
  if (c) { c.textContent = n ? T.choisies(n) : T.aucune; }
  if (b) { b.disabled = !n; }
  if (z) { z.innerHTML = _buiaPHtmlEnvoiZone(); }
}

function _buiaPHtmlReceptionZone() {
  var T = BUIA_PARTAGE_T.reception, p = _buiaPartageUi(), r = p.reception, h = '';
  if (r) {
    var place = Math.max(0, BUIA_GARDE_MAX - buiaGardeNombre(_buiaGarde)), aAjouter = Math.min(place, r.bonnes.length);
    h += '<h3 class="h6 fw-bold mt-3" tabindex="-1" id="buiaPContenuTitre">' + _buiaEsc(T.contenuTitre) + '</h3><p class="mb-1">' + _buiaEsc(T.resume(r.lues, r.bonnes.length, r.ecartees.length)) + '</p>' +
      _buiaEncartC1('', T.tiers, 'rappel') +
      r.bonnes.map(function (d) { return _buiaPHtmlFiche(d, ''); }).join('') +
      r.ecartees.map(function (d) { return '<div class="buia-p-fiche"><strong>' + _buiaEsc(d.nom) + '</strong><span class="buia-var">' + _buiaEsc(T.ecartee) + '</span><p class="buia-petit mb-0">' + _buiaEsc(T.raisonLibelle + T.raisons[d.raison] + '.') + '</p></div>'; }).join('');
    if (r.bonnes.length && aAjouter === 0) { h += _buiaEncartC1('', T.pleine(BUIA_GARDE_MAX), 'rappel'); }
    else if (aAjouter < r.bonnes.length) { h += _buiaEncartC1('', T.partielle(BUIA_GARDE_MAX, aAjouter), 'rappel'); }
    h += '<div class="buia-actions"><button type="button" class="btn btn-primary" data-buia-act="p-ajouter"' + (aAjouter ? '' : ' disabled') + '>' + _buiaEsc(T.ajouter) + '</button>' +
      '<button type="button" class="btn btn-outline-primary" data-buia-act="p-annuler">' + _buiaEsc(T.annuler) + '</button></div>';
  }
  if (p.msgReception) { h += '<div class="buia-encart ' + _buiaEsc(p.msgReception.classe) + '" role="status">' + _buiaEsc(p.msgReception.texte) + '</div>'; }
  return h;
}
function _buiaPMajReception() { var z = _buiaById('buiaPReception'); if (z) { z.innerHTML = _buiaPHtmlReceptionZone(); } }

// Lecture du fichier choisi par la personne (événement « change » du champ caché, branché dans buiaRendreModeles).
function buiaPartageFichierChoisi(e) {
  var champ = e && e.target;
  if (!champ || champ.id !== 'buiaPFichier') { return; }
  var fichier = champ.files && champ.files[0], p = _buiaPartageUi(), T = BUIA_PARTAGE_T.reception;
  champ.value = '';   // permet de choisir le même fichier une seconde fois
  if (!fichier) { return; }
  _buiaC2().famille = 'Pour les professionnels';
  function montrer(r) {
    if (r.erreur) { p.reception = null; p.msgReception = { texte: T.erreurs[r.erreur], classe: 'rappel' }; }
    else { p.reception = r; p.msgReception = null; }
    _buiaPMajReception(); _buiaPFocus(r.erreur ? 'buiaPReception' : 'buiaPContenuTitre');
  }
  if (fichier.size > BUIA_PARTAGE_TEXTE_MAX) { montrer({ erreur: 'illisible' }); return; }
  var lecteur = new FileReader();
  lecteur.onload = function () { montrer(buiaPartageAnalyser(String(lecteur.result), _buiaGarde)); };
  lecteur.onerror = function () { montrer({ erreur: 'illisible' }); };
  lecteur.readAsText(fichier);
}

// Actions « p-… » (appelées par buiaC2Clic). Retourne true si l'action est reconnue.
function _buiaPClic(act, v, el) {
  var p = _buiaPartageUi(), c = _buiaC2(), T = BUIA_PARTAGE_T;
  if (act === 'p-coche') { p.choisies[v] = !!(el && el.checked); p.prepa = false; p.relu = false; p.msgEnvoi = ''; c.famille = BUIA_GARDE_T.familleTitre; _buiaPMajEnvoi(); return true; }
  if (act === 'p-preparer') {
    if (!_buiaPIds().length) { return true; }
    p.prepa = true; p.relu = false; p.msgEnvoi = ''; c.famille = BUIA_GARDE_T.familleTitre; _buiaPMajEnvoi(); _buiaPFocus('buiaPPrepaTitre'); return true;
  }
  if (act === 'p-relu') { p.relu = !!(el && el.checked); var b = _buiaById('buiaPEnregistrer'); if (b) { b.disabled = !p.relu; } return true; }
  if (act === 'p-retour') { p.prepa = false; p.relu = false; _buiaPMajEnvoi(); _buiaPFocus('buiaPPreparer'); return true; }
  if (act === 'p-enregistrer') {
    var ids = _buiaPIds(), f = ids.length && p.relu ? buiaPartageExporter(_buiaGarde, ids) : null;
    if (!f || typeof telechargerFichierTexte !== 'function') { return true; }
    var nom = buiaPartageNomFichier(dateFichierFr(new Date()));   // la date en français, jour-mois-année (une seule source : modules/cv-core/dates.js)
    telechargerFichierTexte(nom, JSON.stringify(f, null, 2), 'application/json;charset=utf-8');
    p.msgEnvoi = T.envoi.enregistre(f.demandes.length, nom); p.prepa = false; p.relu = false; _buiaPMajEnvoi(); return true;
  }
  if (act === 'p-choisir') { var champ = _buiaById('buiaPFichier'); if (champ) { champ.click(); } return true; }
  if (act === 'p-ajouter') {
    if (!p.reception) { return true; }
    var res = buiaPartageAjouter(_buiaGarde, p.reception.bonnes);
    _buiaGarde = res.etat; p.reception = null;
    p.msgReception = { texte: T.reception.ajoutees(res.ajoutees) + (res.restantes ? ' ' + T.reception.nonAjoutees(res.restantes, BUIA_GARDE_MAX) : ''), classe: 'ok' };
    c.famille = 'Pour les professionnels';
    _buiaGMajListe(); return true;
  }
  if (act === 'p-annuler') { p.reception = null; p.msgReception = { texte: T.reception.rien, classe: '' }; _buiaPMajReception(); return true; }
  return false;
}
function _buiaC2HtmlFamilles() {
  var t = BUIA_C2_E1.liste, c = _buiaC2();
  return _buiaC2HtmlMesDemandes() + buiaFamilles().map(function (f) {
    var pro = f === 'Pour les professionnels';
    return '<details class="bloc-depli"' + (f === c.famille ? ' open' : '') + '><summary>' + _buiaEsc(f) + '</summary><div class="bloc-depli-corps">' +
      (pro ? '<div class="buia-encart rappel">' + _buiaEsc(BUIA_RAPPEL_PRO) + '</div>' : '') +
      buiaModelesParFamille(f).map(function (m) {
        return '<div class="buia-modele-ligne"><div class="buia-nom-modele">' + _buiaEsc(m.nom) + (buiaModeleDisponible(m.id) ? '' : ' <span class="buia-pastille-niveau">' + _buiaEsc(BUIA_C2_BIENTOT_PASTILLE) + '</span>') +
          '<span class="buia-var">' + _buiaEsc(t.variantes + m.variantes) + '</span></div>' +
          '<button type="button" class="btn btn-outline-primary" data-buia-act="modele" data-v="' + m.id + '">' + _buiaEsc(t.choisir) + '</button></div>';
      }).join('') + (pro ? _buiaC2HtmlPro() : '') + '</div></details>';
  }).join('');
}

// Familles « Pour les professionnels » : questions à poser à sa structure (P11) et grille d'essai (P12). Aucun envoi, rien d'enregistré.
function _buiaC2HtmlPro() {
  var q = BUIA_C2_E1.pro.questions, g = BUIA_C2_E1.pro.grille;
  function depli(titre, corps, ouvert) { return '<details class="bloc-depli"' + (ouvert ? ' open' : '') + '><summary>' + _buiaEsc(titre) + '</summary><div class="bloc-depli-corps">' + corps + '</div></details>'; }
  var R = BUIA_PARTAGE_T.reception, pp = _buiaPartageUi();
  function liste(items) { return '<ul>' + items.map(function (x) { return '<li>' + _buiaEsc(x) + '</li>'; }).join('') + '</ul>'; }
  return depli(q.titre, '<p>' + _buiaEsc(q.intro) + '</p>' + liste(q.liste) + '<div class="buia-encart"><strong>' + _buiaEsc(q.attente.titre) + '</strong> ' + _buiaEsc(q.attente.texte) + '</div>') +
    depli(g.titre, '<p>' + _buiaEsc(g.intro) + '</p><p><strong>' + _buiaEsc(g.casTitre) + '</strong> ' + _buiaEsc(g.cas) + '</p>' +
      '<p class="mb-1"><strong>' + _buiaEsc(g.relectureTitre) + '</strong></p>' + liste(g.relecture) +
      '<p><strong>' + _buiaEsc(g.noterTitre) + '</strong> ' + _buiaEsc(g.noter) + '</p><p class="buia-petit buia-discret mb-0">' + _buiaEsc(g.reserve) + '</p>') +
    // Recevoir des demandes d'un collègue (P13) : visible même sans aucune demande gardée ; ouvert tant qu'un fichier lu attend ou qu'un message est affiché.
    depli(R.titre, '<p>' + _buiaEsc(R.intro) + '</p><div class="buia-actions mt-0"><button type="button" class="btn btn-primary" data-buia-act="p-choisir">' + _buiaEsc(R.choisir) + '</button>' +
      '<input type="file" id="buiaPFichier" accept=".json,application/json" class="visually-hidden" tabindex="-1" aria-hidden="true"></div>' +
      '<div id="buiaPReception" tabindex="-1" aria-live="polite">' + _buiaPHtmlReceptionZone() + '</div>', !!(pp.reception || pp.msgReception));
}

function _buiaC2Ecran1() {
  var c = _buiaC2(), p = BUIA_C2_E1.papier, m = BUIA_C2_E1.mots, a = BUIA_C2_E1.aucunConvient;
  var h = '<div class="buia-panneau"><h2>' + _buiaRondNum2(1) + _buiaEsc(p.titre) + '</h2>' +
    '<div class="buia-encart rappel"><strong>' + _buiaEsc(p.rappel.titre) + '</strong> ' + _buiaEsc(p.rappel.texte) + '</div>' +
    '<div class="buia-champ"><label class="buia-lib" for="buiaPapier">' + _buiaEsc(p.label) + '</label>' +
    '<textarea id="buiaPapier" rows="6" data-buia-champ="papier" placeholder="' + _buiaEsc(p.placeholder) + '">' + _buiaEsc(c.papier) + '</textarea></div>' +
    '<div class="buia-actions"><button type="button" class="btn btn-primary" data-buia-act="reperer">' + _buiaEsc(p.boutons.reperer) + '</button>' +
    '<button type="button" class="btn btn-outline-primary" data-buia-act="masquer">' + _buiaEsc(p.boutons.masquer) + '</button>' +
    '<button type="button" class="btn btn-outline-primary" data-buia-act="effacer">' + _buiaEsc(p.boutons.effacer) + '</button>' +
    '<span class="buia-msg" id="buiaMsgMasque" aria-live="polite">' + _buiaEsc(c.msgMasque) + '</span></div>' +
    '<div class="buia-aide-ch">' + _buiaEsc(p.essai) + '</div><div class="buia-actions mt-0">' +
    ['B', 'A', 'C'].map(function (k) { return '<button type="button" class="btn btn-outline-primary" data-buia-act="fictif" data-v="' + k + '">' + _buiaEsc(BUIA_COURRIERS_FICTIFS[k].bouton) + '</button>'; }).join('') + '</div>' +
    '<div id="buiaAlerte">' + _buiaC2HtmlAlerte(_buiaC2Alerte(), 'vu') + '</div><div id="buiaAlerteDelai">' + _buiaC2HtmlAlerteDouce(_buiaC2Alerte()) + '</div></div>';
  h += '<div class="buia-panneau"><h2>' + _buiaRondNum2(2) + _buiaEsc(m.titre) + '</h2><div class="buia-champ"><label class="buia-lib" for="buiaMots">' + _buiaEsc(m.label) + '</label>' +
    '<div class="buia-aide-ch">' + _buiaEsc(m.aide) + '</div><input type="text" id="buiaMots" data-buia-champ="mots" value="' + _buiaEsc(c.mots) + '" placeholder="' + _buiaEsc(m.placeholder) + '" autocomplete="off"></div>' +
    '<div class="buia-aide-ch">' + _buiaEsc(m.exemplesTitre) + '</div><div class="buia-seg">' +
    m.exemples.map(function (e, i) { return '<button type="button" class="buia-choix" data-buia-act="exemple" data-v="' + i + '" aria-pressed="false">' + _buiaEsc(e) + '</button>'; }).join('') + '</div></div>';
  h += '<div id="buiaZoneResultats" aria-live="polite">' + _buiaC2HtmlResultats() + '</div>';
  h += '<div class="buia-panneau"><h2>' + _buiaRondNum2(3) + _buiaEsc(BUIA_C2_E1.liste.titre) + '</h2><div id="buiaFamilles">' + _buiaC2HtmlFamilles() + '</div>' +
    '<div class="buia-encart" id="buiaMsgChoix" role="status" hidden></div></div>';
  h += '<div class="buia-panneau"><h2>' + _buiaEsc(a.titre) + '</h2><p>' + _buiaEsc(a.texte) + '</p><div class="buia-actions">' +
    '<button type="button" class="btn btn-outline-primary" data-buia-act="aucun" data-v="ecrire">' + _buiaEsc(a.ecrire) + '</button></div></div>';
  return h;
}

// ---------------- Écran 2 : compléter ----------------
function _buiaC2HtmlGroupe(g, saisie) {
  return '<div class="buia-champ"><div class="buia-lib">' + _buiaEsc(g.titre) + '</div><div class="buia-seg" role="group" aria-label="' + _buiaEsc(g.titre) + '">' +
    g.choix.map(function (x) { return _buiaBoutonChoix(x.lib, 'data-buia-act="choix" data-g="' + g.id + '" data-v="' + x.v + '"', saisie.choix[g.id] === x.v); }).join('') + '</div></div>';
}

function _buiaC2Groupe(def, id) { return def.groupes.filter(function (g) { return g.id === id; })[0]; }
function _buiaC2HtmlChamp(ch, s) {
  // `masquer: true` : un champ qui peut contenir un numéro ou un courriel (un CV) porte le même bouton « Masquer » que le papier de l'étape 1.
  var masque = ch.masquer ? '<div class="buia-actions mt-1 mb-0"><button type="button" class="btn btn-outline-primary" data-buia-act="masquer-champ" data-v="' + ch.id + '">' + _buiaEsc(BUIA_C2_E1.papier.boutons.masquer) + '</button>' +
    '<span class="buia-msg" id="buiaMsgMasque-' + ch.id + '" aria-live="polite"></span></div>' : '';
  return '<div class="buia-champ"><label class="buia-lib" for="buiaCh-' + ch.id + '">' + _buiaEsc(ch.lib) + '</label><div class="buia-aide-ch">' + _buiaEsc(ch.aide) + '</div>' +
    '<textarea id="buiaCh-' + ch.id + '" rows="' + ch.lignes + '" data-buia-champ="' + ch.id + '" placeholder="' + _buiaEsc(ch.exemple) + '">' + _buiaEsc(s.champs[ch.id]) + '</textarea>' + masque + '</div>';
}

function _buiaC2Ecran2() {
  var c = _buiaC2(), id = c.modele, m = buiaModele(id), t = BUIA_C2_E2;
  if (!m) { return ''; }
  if (!buiaModeleDisponible(id)) {
    return '<div class="buia-panneau"><h2>' + _buiaRondNum2(2) + _buiaEsc(m.nom) + '</h2><div class="buia-encart">' + _buiaEsc(BUIA_C2_BIENTOT) + '</div>' +
      '<div class="buia-actions"><button type="button" class="btn btn-outline-primary" data-buia-act="autre">' + _buiaEsc(t.autreModele) + '</button></div></div>';
  }
  var etat = buiaEtatBlocsModele(id).etat;
  var tete = '<div class="buia-panneau"><h2>' + _buiaRondNum2(2) + _buiaEsc(m.nom) + '</h2><p class="mb-1">' + _buiaEsc(t.famille + m.famille + '.') + '</p>';
  if (etat !== 'ok') {
    var msg = etat === 'erreur' ? t.indisponible : t.chargement;
    return tete + '<div class="buia-encart' + (etat === 'erreur' ? ' rappel' : '') + '" role="status">' + _buiaEsc(msg) + '</div><div class="buia-actions">' +
      (etat === 'erreur' ? '<button type="button" class="btn btn-primary" data-buia-act="reessayer">' + _buiaEsc(t.reessayer) + '</button>' : '') +
      '<button type="button" class="btn btn-outline-primary" data-buia-act="autre">' + _buiaEsc(t.autreModele) + '</button></div></div>';
  }
  var def = buiaDefModele(id), s = c.saisie, gauche = '<div id="buiaAlerte2">' + _buiaC2HtmlAlerte(_buiaC2Alerte(), 'vu') + '</div>';
  // Les modèles pour les professionnels (`confirmation`) rappellent d'écrire sans noms, puis demandent une case cochée avant de pouvoir copier.
  if (def.confirmation) { gauche += '<div class="buia-encart rappel">' + _buiaEsc(BUIA_RAPPEL_PRO) + '</div>'; }
  // L'ordre des champs et des choix vient du modèle (`ecran`) : le même écran sert à tous les modèles.
  def.ecran.forEach(function (e) {
    if (e.groupe) { gauche += _buiaC2HtmlGroupe(_buiaC2Groupe(def, e.groupe), s); }
    else if (e.champ) {
      var ch = def.champs.filter(function (x) { return x.id === e.champ; })[0];
      // Un champ qui n'est pas utile dans ce cas (le courrier quand la conversation continue) n'est pas montré : il serait ignoré.
      if (!(ch.facultatifSi && s.choix[ch.facultatifSi.groupe] === ch.facultatifSi.v)) { gauche += _buiaC2HtmlChamp(ch, s); }
    }
    else if (e.groupes) {
      gauche += '<div class="buia-champ">' + e.groupes.map(function (gid, k) {
        var g = _buiaC2Groupe(def, gid);
        return '<div class="buia-lib' + (k ? ' mt-2' : '') + '">' + _buiaEsc(g.titre) + '</div><div class="buia-seg" role="group" aria-label="' + _buiaEsc(g.titre) + '">' +
          g.choix.map(function (x) { return _buiaBoutonChoix(x.lib, 'data-buia-act="choix" data-g="' + g.id + '" data-v="' + x.v + '"', s.choix[g.id] === x.v); }).join('') + '</div>';
      }).join('') + '</div>';
    }
  });
  if (def.confirmation) { gauche += '<div class="buia-champ"><label class="buia-choix-alerte"><input type="checkbox" id="buiaConfirme" data-buia-act="confirme"' + (s.confirme === true ? ' checked' : '') + '> ' + _buiaEsc(def.confirmation.lib) + '</label></div>'; }
  gauche += '<div class="buia-encart ok"><strong>' + _buiaEsc(t.dateAuto.titre) + '</strong> ' + _buiaEsc(t.dateAuto.texte) + '</div>';
  var droite = '<div class="buia-apercu"><h3 class="h6 fw-bold">' + _buiaEsc(t.apercuTitre) + '</h3><div class="buia-demande-texte" id="buiaApercu" aria-live="polite"></div>' +
    '<div id="buiaAlerteCopie"></div><div class="buia-actions"><button type="button" class="btn btn-primary" id="buiaBtnCopier" data-buia-act="copier">' + _buiaEsc(t.copier) + '</button>' +
    '<span class="buia-msg" id="buiaMsgCopie" aria-live="polite"></span></div><p class="buia-petit buia-discret mb-1" id="buiaRaisonCopie" role="status"></p>' +
    '<p class="buia-petit buia-discret mb-1">' + _buiaEsc(t.note) + '</p><button type="button" class="btn btn-outline-primary" data-buia-act="pourquoi">' + _buiaEsc(t.pourquoi) + '</button></div>';
  return tete + '<div class="buia-deux-col"><div>' + gauche + '</div>' + droite + '</div></div>';
}

// Recompose la demande et met à jour, sur place, l'aperçu, le bouton « Copier » (fermé tant qu'un champ est vide) et les alertes.
function _buiaC2Assembler() {
  var c = _buiaC2(), e = buiaEtatBlocsModele(c.modele);
  if (e.etat !== 'ok' || !c.saisie) { return null; }
  return buiaAssemblerModele(c.modele, e.blocs, c.saisie, { aujourdhui: _buiaMaintenant(), alerte: _buiaC2Alerte(), reprise: c.reprise });
}
// Le texte collé a changé (frappe, bouton « Masquer ») : la case « noms retirés » est décochée, la personne la recoche après relecture.
function _buiaC2DecocherConfirmation(def, champ) {
  var ch = def && def.confirmation ? def.champs.filter(function (x) { return x.id === champ && x.gardee === false; })[0] : null;
  if (!ch || !_buiaC2().saisie || _buiaC2().saisie.confirme !== true) { return; }
  _buiaC2().saisie.confirme = false;
  var cb = _buiaById('buiaConfirme'); if (cb) { cb.checked = false; }
}
function _buiaC2MajApercu() {
  var r = _buiaC2Assembler(), z = _buiaById('buiaApercu');
  if (!r || !z) { return; }
  z.innerHTML = r.lignes.map(function (l, i) { return (i && l.saut ? '\n' : '') + (i ? '\n' : '') + '<span class="buia-seg-couleur buia-e' + l.element + '">' + _buiaEsc(l.texte) + '</span>'; }).join('');
  var b = _buiaById('buiaBtnCopier'); if (b) { b.disabled = r.aCompleter; }
  var m = _buiaById('buiaRaisonCopie'); if (m) { m.textContent = buiaMessageACompleter(r.manque); }
  _buiaC2MajAlertes();
}

// ---------------- Écran 3 : après la réponse ----------------
function _buiaC2Ecran3() {
  var t = BUIA_C2_E3, c = _buiaC2();
  return '<div class="buia-panneau"><h2>' + _buiaRondNum2(3) + _buiaEsc(t.titre) + '</h2>' +
    '<div class="buia-encart rappel"><strong>' + _buiaEsc(t.relisez.titre) + '</strong> ' + _buiaEsc(t.relisez.texte) + '</div>' +
    '<div class="buia-encart"><strong>' + _buiaEsc(t.verifier.titre) + '</strong> ' + _buiaEsc(t.verifierModele[c.modele] || t.verifier.texte) + '</div>' +
    '<p class="fw-bold mb-1">' + _buiaEsc(t.maintenant) + '</p><div class="buia-actions">' +
    // Les suites proposées viennent du modèle (`suite`) : un modèle ne se propose pas lui-même, et les modèles qui ne parlent pas d'un courrier n'en proposent aucune.
    ((buiaDefModele(c.modele).suite || []).map(function (s, i) { return '<button type="button" class="btn ' + (i === 0 ? 'btn-primary' : 'btn-outline-primary') + '" data-buia-act="apres" data-v="' + s + '">' + _buiaEsc(t.boutons[s]) + '</button>'; }).join('')) +
    '<button type="button" class="btn btn-outline-primary" data-buia-act="apres" data-v="garder">' + _buiaEsc(t.boutons.garder) + '</button></div>' +
    '<div class="buia-encart" id="buiaMsgApres" role="status"' + (c.msgApres ? '' : ' hidden') + '>' + _buiaEsc(c.msgApres) + '</div>' +
    (c.garderOuvert ? _buiaC2HtmlGarder() : '') + '</div>';
}

// « Garder cette demande » : un nom, puis « Ajouter à ma disquette ». Le courrier n'est jamais gardé.
function _buiaC2HtmlGarder() {
  var T = BUIA_GARDE_T, c = _buiaC2();
  return '<div class="buia-encart" id="buiaGarderModele"><strong>' + _buiaEsc(T.modele.titre) + '.</strong> ' + _buiaEsc(T.modele.texte) +
    '<div class="buia-champ mt-2"><label class="buia-lib" for="buiaC2Nom">' + _buiaEsc(T.nomLabel) + '</label><input type="text" id="buiaC2Nom" data-buia-champ="c2-nom" maxlength="' + BUIA_GARDE_NOM_MAX + '" value="' + _buiaEsc(c.nomGarde) + '" placeholder="' + _buiaEsc(T.modele.nomExemple) + '" autocomplete="off"></div>' +
    '<div class="buia-actions"><button type="button" class="btn btn-primary" data-buia-act="garder-modele">' + _buiaEsc(T.bouton) + '</button>' +
    '<span class="buia-msg" id="buiaMsgGardeModele" role="status">' + _buiaEsc(c.msgGardeModele) + '</span></div>' +
    (typeof htmlRappelSauvegarde === 'function' ? htmlRappelSauvegarde() : '') + '</div>';
}

// ---------------- Page ----------------
function pageBienUtiliserIaModeles() {
  if (!buiaOuvert()) { if (typeof naviguerVers === 'function') { naviguerVers('cv'); } return; }
  buiaRendreModeles();
  _buiaC2ChargerSiBesoin();
}
// Les phrases du modèle se lisent à l'arrivée sur l'écran « Compléter » (aussi quand la personne rouvre une demande gardée) ; l'écran se redessine quand elles sont là.
function _buiaC2ChargerSiBesoin() {
  var c = _buiaC2();
  if (c.etape === 1 && buiaModeleDisponible(c.modele) && buiaEtatBlocsModele(c.modele).etat !== 'ok') {
    var id = c.modele;
    buiaChargerBlocsModele(id).then(function () { if (_buiaUi.c2.etape === 1 && _buiaUi.c2.modele === id && pageActuelle === BUIA_ROUTE_MODELES) { buiaRendreModeles(); } });
  }
}

function _buiaC2HtmlEcran() {
  var e = _buiaC2().etape;
  return e === 0 ? _buiaC2Ecran1() : (e === 1 ? _buiaC2Ecran2() : _buiaC2Ecran3());
}

function buiaRendreModeles() {
  var c = _buiaC2(), dernier = c.etape === BUIA_C2_ETAPES.length - 1;
  app.innerHTML =
    '<div class="page-catalogue-contenu buia-page" id="buiaRacine">' +
    htmlBandeRepriseModule(htmlBoutonRevoirModule('btnBuiaRevoir', BUIA_ICONE, 'Revoir la présentation', false), '') +
    htmlTitreEtapeModule(BUIA_ICONE, BUIA_NOM, _buiaEsc(BUIA_C2_TITRE), _buiaEsc(BUIA_C2_SOUS_TITRE)) +
    (typeof barreEtapesModule === 'function' ? barreEtapesModule(BUIA_C2_ETAPES, c.etape) : '') +
    '<div id="buiaC2Corps">' + _buiaC2HtmlEcran() + '</div></div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation(BUIA_ROUTE, dernier ? BUIA_ROUTE : 'x', dernier ? 'Choisir un chemin' : (c.etape === 1 ? 'J’ai la réponse &#8594;' : undefined),
      { onclickPrecedent: 'buiaC2Precedent()', onclickSuivant: 'buiaC2Suivant()', libelleExact: dernier || c.etape === 1 }) + '</div>';
  var btnRevoir = _buiaById('btnBuiaRevoir');
  if (btnRevoir) { btnRevoir.addEventListener('click', function () { buiaRetourVersPresentation(true, BUIA_ROUTE_MODELES); }); }
  var racine = _buiaById('buiaRacine');
  if (racine) { racine.addEventListener('click', buiaClic); racine.addEventListener('input', buiaSaisie); racine.addEventListener('change', buiaPartageFichierChoisi); }
  if (c.etape === 1 && buiaModeleDisponible(c.modele)) { _buiaC2MajApercu(); }
  if (typeof trackEvenement === 'function') { trackEvenement('bien_utiliser_ia_vue', { vue: 'modeles', etape: c.etape + 1 }); }
}

function buiaC2Aller(n) {
  var c = _buiaC2();
  c.etape = Math.max(0, Math.min(BUIA_C2_ETAPES.length - 1, n));
  c.copie = '';
  buiaRendreModeles();
  window.scrollTo(0, 0);
  _buiaC2ChargerSiBesoin();
}
function buiaC2Precedent() { if (_buiaC2().etape <= 0) { naviguerVers(BUIA_ROUTE); } else { buiaC2Aller(_buiaC2().etape - 1); } }
function buiaC2Suivant() {
  var c = _buiaC2();
  if (c.etape >= BUIA_C2_ETAPES.length - 1) { naviguerVers(BUIA_ROUTE); return; }
  if (c.etape === 0 && !c.modele) { _buiaC2Message('buiaMsgChoix', BUIA_C2_E1.liste.choisirD); return; }
  buiaC2Aller(c.etape + 1);
}

// « Préparer ma réponse » : passe au modèle suivant en gardant le courrier déjà collé (jamais de double collage). Le courrier reste en mémoire le temps de la session, comme partout.
function _buiaC2EnchainerVers(id) {
  var c = _buiaC2(), avant = c.modele ? _buiaC2ChampPapier(c.modele) : '', courrier = avant && c.saisie && c.saisie.champs ? c.saisie.champs[avant] : '', apres = _buiaC2ChampPapier(id);
  c.modele = id; c.saisie = buiaSaisieParDefaut(id);
  if (courrier && apres) { c.saisie.champs[apres] = courrier; }
  c.reprise = false; c.vu = false; c.garderOuvert = false; c.nomGarde = ''; c.msgGardeModele = ''; c.msgApres = '';
  if (typeof trackEvenement === 'function') { trackEvenement('bien_utiliser_ia_modele', { modele: id, depuis: 'enchainement' }); }
  buiaC2Aller(1);
}

function _buiaC2ChoisirModele(id) {
  var c = _buiaC2();
  if (c.modele !== id || !c.saisie) { c.saisie = buiaSaisieParDefaut(id); }
  c.modele = id;
  // Le papier déjà collé passe dans le champ du modèle prévu pour lui (le courrier, le message reçu, le texte) sans second collage.
  var champPapier = buiaModeleDisponible(id) ? _buiaC2ChampPapier(id) : '';
  if (champPapier && !String(c.saisie.champs[champPapier]).trim() && String(c.papier).trim()) { c.saisie.champs[champPapier] = c.papier.trim(); }
  if (typeof trackEvenement === 'function') { trackEvenement('bien_utiliser_ia_modele', { modele: id }); }
  buiaC2Aller(1);
}

// Saisie dans un champ : mise à jour sur place, sans redessiner la page (le curseur reste où il est).
function buiaC2Saisie(champ, valeur) {
  var c = _buiaC2();
  if (champ === 'papier') { c.papier = valeur; _buiaC2MajAlertes(); return; }
  if (champ === 'mots') {
    c.mots = valeur;
    c.resultats = valeur.trim().length < 3 ? null : { source: 'mots', liste: buiaReperer(valeur, false, { redigesSeulement: !BUIA_C2_PROPOSER_NON_REDIGES }) };
    _buiaC2MajResultats(); return;
  }
  if (c.saisie && Object.prototype.hasOwnProperty.call(c.saisie.champs, champ)) { c.saisie.champs[champ] = valeur; _buiaC2DecocherConfirmation(buiaDefModele(c.modele), champ); _buiaC2MajApercu(); }
}

function _buiaC2Message(id, texte) { var z = _buiaById(id); if (z) { z.textContent = texte; z.hidden = !texte; } }
function _buiaC2Reperer(source) {
  var c = _buiaC2(), texte = source === 'papier' ? c.papier : c.mots;
  c.resultats = { source: source, liste: buiaReperer(texte, source === 'papier', { redigesSeulement: !BUIA_C2_PROPOSER_NON_REDIGES }) };
  _buiaC2MajResultats();
  var z = _buiaById('buiaZoneResultats'); if (z && z.scrollIntoView) { z.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
}

// Actions de la page du chemin 2 (appelée par buiaClic, index.js). Retourne true si l'action est reconnue.
function buiaC2Clic(act, v, el) {
  var c = _buiaC2();
  if (act.indexOf('p-') === 0) { return _buiaPClic(act, v, el); }
  if (act === 'reperer') {
    if (!c.papier.trim()) { c.msgMasque = BUIA_C2_E1.papier.videAvertissement; _buiaC2Message('buiaMsgMasque', c.msgMasque); return true; }
    c.msgMasque = ''; _buiaC2Message('buiaMsgMasque', ''); _buiaC2MajAlertes(); _buiaC2Reperer('papier'); return true;
  }
  if (act === 'masquer') {
    var r = buiaMasquer(c.papier); c.papier = r.texte; c.msgMasque = buiaMessageMasquage(r);
    var ta = _buiaById('buiaPapier'); if (ta) { ta.value = c.papier; }
    _buiaC2Message('buiaMsgMasque', c.msgMasque); _buiaC2MajAlertes(); return true;
  }
  if (act === 'masquer-champ') {
    var def = c.saisie ? buiaDefModele(c.modele) : null, chp = def ? def.champs.filter(function (x) { return x.id === v && x.masquer; })[0] : null;
    if (!chp) { return true; }
    var rm = buiaMasquer(c.saisie.champs[v]); c.saisie.champs[v] = rm.texte; _buiaC2DecocherConfirmation(def, v);
    var tm = _buiaById('buiaCh-' + v); if (tm) { tm.value = rm.texte; }
    _buiaC2Message('buiaMsgMasque-' + v, buiaMessageMasquage(rm)); _buiaC2MajApercu(); return true;
  }
  if (act === 'effacer') {
    c.papier = ''; c.msgMasque = ''; c.resultats = null;
    var ta2 = _buiaById('buiaPapier'); if (ta2) { ta2.value = ''; }
    _buiaC2Message('buiaMsgMasque', ''); _buiaC2MajResultats(); _buiaC2MajAlertes(); return true;
  }
  if (act === 'fictif') {
    var f = BUIA_COURRIERS_FICTIFS[v]; if (!f) { return true; }
    c.papier = f.texte; c.msgMasque = BUIA_C2_E1.papier.fictifColle;
    var ta3 = _buiaById('buiaPapier'); if (ta3) { ta3.value = c.papier; }
    _buiaC2Message('buiaMsgMasque', c.msgMasque); _buiaC2MajAlertes(); _buiaC2Reperer('papier'); return true;
  }
  if (act === 'exemple') {
    var ex = BUIA_C2_E1.mots.exemples[+v]; if (ex === undefined) { return true; }
    c.mots = ex; var im = _buiaById('buiaMots'); if (im) { im.value = ex; }
    _buiaC2Reperer('mots'); return true;
  }
  if (act === 'modele') { _buiaC2ChoisirModele(+v); return true; }
  if (act === 'aucun') { naviguerVers(BUIA_ROUTE_LIBRE); return true; }
  if (act === 'vu') { c.vu = !!(el && el.checked); _buiaC2MajAlertes(); return true; }
  if (act === 'confirme') { if (c.saisie) { c.saisie.confirme = !!(el && el.checked); } _buiaC2MajApercu(); return true; }
  if (act === 'reprise') { c.reprise = !!(el && el.checked); _buiaC2MajApercu(); return true; }
  if (act === 'choix') {
    var g = el.getAttribute('data-g');
    if (c.saisie && Object.prototype.hasOwnProperty.call(c.saisie.choix, g)) {
      c.saisie.choix[g] = v;
      Array.prototype.forEach.call(document.querySelectorAll('[data-buia-act="choix"][data-g="' + g + '"]'), function (b) { b.setAttribute('aria-pressed', String(b === el)); });
      // Un choix qui retire ou rend un champ facultatif (« même conversation » : plus de courrier à coller) redessine l'écran ; la saisie est gardée en mémoire.
      if (buiaDefModele(c.modele).champs.some(function (x) { return x.facultatifSi && x.facultatifSi.groupe === g; })) { buiaRendreModeles(); return true; }
      _buiaC2MajApercu();
    }
    return true;
  }
  if (act === 'copier') {
    var res = _buiaC2Assembler();
    if (!res || res.aCompleter) { return true; }
    if (typeof copierTexteVersPressePapier === 'function') { copierTexteVersPressePapier(res.texte, null); }
    c.copie = BUIA_C2_E2.copiee; _buiaC2Message('buiaMsgCopie', c.copie);
    if (typeof trackEvenement === 'function') { trackEvenement('bien_utiliser_ia_copie', { modele: c.modele }); }
    return true;
  }
  if (act === 'pourquoi') { _buiaUi.c1.etape = 2; naviguerVers(BUIA_ROUTE_COMPRENDRE); return true; }
  if (act === 'autre') { buiaC2Aller(0); return true; }
  if (act === 'reessayer') { var id = c.modele; buiaChargerBlocsModele(id, true).then(function () { if (_buiaUi.c2.etape === 1 && _buiaUi.c2.modele === id) { buiaRendreModeles(); } }); return true; }
  if (act === 'apres') {
    var t = BUIA_C2_E3;
    if (v === 'garder') { c.garderOuvert = true; c.msgApres = ''; buiaRendreModeles(); var zg = _buiaById('buiaGarderModele'); if (zg && zg.scrollIntoView) { zg.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } return true; }
    var cible = v === 'repondre' ? 5 : 9;
    if (buiaModeleDisponible(cible)) { _buiaC2EnchainerVers(cible); return true; }
    c.msgApres = v === 'repondre' ? t.repondreBientot : t.rendezvousBientot;
    _buiaC2Message('buiaMsgApres', c.msgApres); return true;
  }
  if (act === 'garder-modele') {
    var T = BUIA_GARDE_T, res = buiaGardeAjouterModele(_buiaGarde, c.nomGarde, c.modele, c.saisie);
    if (res.refuse === 'modele') { c.msgGardeModele = T.modeleIndisponible; } else if (res.refuse) { c.msgGardeModele = T.plein; }
    else {
      _buiaGarde = res.etat; c.msgGardeModele = (res.remplace ? T.remplacee : T.ajoutee)(buiaGardeTrouver(_buiaGarde, res.id).nom);
      if (typeof trackEvenement === 'function') { trackEvenement('bien_utiliser_ia_demande_gardee', { type: 'modele', modele: c.modele }); }
    }
    _buiaC2Message('buiaMsgGardeModele', c.msgGardeModele); if (typeof rafraichirRappelsSauvegarde === 'function') { rafraichirRappelsSauvegarde(); }
    return true;
  }
  return false;
}
