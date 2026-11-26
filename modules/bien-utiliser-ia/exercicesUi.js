/* ============================================================
   modules/bien-utiliser-ia/exercicesUi.js
   Chemin 1 : les trois exercices « Réparer une demande » (écran 3), « Voir la différence » (écran 4) et « Repérer ce qui se vérifie » (écran 6). Navigateur seulement (pas chargé par les tests Node).
   Logique : exercicesLogique.js. Textes : data/buiaExercices.js. Pièces communes (bloc dépliable, encart) : comprendreUi.js.
   Rien n'est envoyé ni enregistré : l'état vit en mémoire le temps de la session (_buiaUi.c1.ex). Aucun score, aucune note.
   Le clavier reste utilisable : après chaque action, le focus est remis sur l'élément qui vient d'agir ou sur le résultat.
   ============================================================ */

function _buiaExEtat() { return _buiaUi.c1.ex; }
function _buiaExFocus(id) { var el = id ? document.getElementById(id) : null; if (el && typeof el.focus === 'function') { el.focus(); } }

// ---------------- Exercice 1 : réparer une demande ----------------
function _buiaEx1Interieur() {
  var t = BUIA_EX1, s = _buiaExEtat().ex1, cas = buiaEx1Cas(s.cas), lignes = buiaEx1Lignes(s.cas, s.coches, s.corrige);
  var h = '<div class="buia-encart">' + _buiaEsc(cas.histoire) + '</div>' +
    '<div class="buia-ex-demande"><span class="buia-petit buia-discret">' + _buiaEsc(t.demandeEtiquette) + '</span> ' + _buiaEsc('« ' + cas.demande + ' »') + '</div>';
  if (!s.corrige) { h += '<p class="fw-bold mb-1">' + _buiaEsc(t.consigne) + '</p>'; }
  h += '<div class="buia-ex-cases" id="buiaEx1Lignes" tabindex="-1" role="group" aria-label="' + _buiaEsc(s.corrige ? t.resultatTitre : t.consigne) + '">' + lignes.map(function (l) {
    return '<label class="buia-ex-case buia-e' + l.n + ' ' + l.etat + '" for="buiaEx1Case-' + l.id + '">' +
      '<input type="checkbox" id="buiaEx1Case-' + l.id + '" data-buia-act="ex1-coche" data-v="' + l.id + '"' + (l.cochee ? ' checked' : '') + (s.corrige ? ' disabled' : '') + '>' +
      '<span><span class="buia-ex-nom">' + l.n + '. ' + _buiaEsc(l.nom) + '</span><span class="buia-ex-q">' + _buiaEsc(l.question) + '</span>' +
      (s.corrige ? '<span class="buia-ex-verdict"><b class="buia-ex-etat ' + l.etat + '">' + _buiaEsc(t.etats[l.etat]) + '</b> ' + _buiaEsc(l.raison) + '</span>' : '') + '</span></label>';
  }).join('') + '</div>';
  h += '<div class="buia-actions">';
  if (!s.corrige) { h += '<button type="button" class="btn btn-primary" id="buiaEx1Corriger" data-buia-act="ex1-corriger">' + _buiaEsc(t.boutons.corriger) + '</button>'; }
  else {
    if (!s.repare) { h += '<button type="button" class="btn btn-primary" id="buiaEx1Reparer" data-buia-act="ex1-reparer">' + _buiaEsc(t.boutons.reparer) + '</button>'; }
    h += '<button type="button" class="btn btn-outline-primary" data-buia-act="ex1-recommencer">' + _buiaEsc(t.boutons.recommencer) + '</button>';
    if (buiaEx1NombreCas() > 1) { h += '<button type="button" class="btn btn-outline-primary" data-buia-act="ex1-autre">' + _buiaEsc(t.boutons.autre) + '</button>'; }
  }
  h += '</div>';
  if (s.corrige && s.repare) {
    h += '<h3 class="mt-3">' + _buiaEsc(t.repareeTitre) + '</h3><div class="buia-demande-texte" id="buiaEx1Reparee" tabindex="-1">' +
      buiaEx1Reparee(s.cas).map(function (b) { return '<span class="buia-seg-couleur buia-e' + b.n + '">' + _buiaEsc(b.phrase) + '</span>\n'; }).join('') + '</div>' +
      _buiaEncartC1(t.rappel.titre, t.rappel.texte, 'rappel');
  }
  return h;
}
function _buiaEx1Bloc() { return '<div class="buia-ex" id="buiaEx1">' + _buiaEx1Interieur() + '</div>'; }
function _buiaEx1Maj(focusId) { var z = document.getElementById('buiaEx1'); if (z) { z.innerHTML = _buiaEx1Interieur(); } _buiaExFocus(focusId); }

// ---------------- Exercice 2 : repérer ce qui se vérifie ----------------
function _buiaEx2Interieur() {
  var t = BUIA_EX2, s = _buiaExEtat().ex2, cas = buiaEx2Cas(s.cas), phrases = buiaEx2Phrases(s.cas, s.sel, s.corrige);
  var h = '<div class="buia-encart">' + _buiaEsc(cas.histoire) + '</div>';
  if (!s.corrige) { h += '<p class="fw-bold mb-1">' + _buiaEsc(t.consigne) + '</p>'; }
  h += '<div class="buia-ex-reponse" id="buiaEx2Phrases" tabindex="-1" role="group" aria-label="' + _buiaEsc(t.reponseEtiquette) + '">' + phrases.map(function (p) {
    return '<button type="button" class="buia-ex-phrase ' + p.etat + '" id="buiaEx2P-' + p.i + '" data-buia-act="ex2-phrase" data-v="' + p.i + '" aria-pressed="' + (p.choisie ? 'true' : 'false') + '"' + (s.corrige ? ' disabled' : '') + '>' +
      _buiaEsc(p.texte) + (s.corrige ? '<span class="buia-ex-tag">' + _buiaEsc(p.tag) + '</span>' : '') + '</button>';
  }).join('') + '</div>';
  h += '<div class="buia-actions">';
  if (!s.corrige) { h += '<button type="button" class="btn btn-primary" id="buiaEx2Corriger" data-buia-act="ex2-corriger">' + _buiaEsc(t.boutons.corriger) + '</button>'; }
  else {
    h += '<button type="button" class="btn btn-outline-primary" data-buia-act="ex2-recommencer">' + _buiaEsc(t.boutons.recommencer) + '</button>';
    if (buiaEx2NombreCas() > 1) { h += '<button type="button" class="btn btn-outline-primary" data-buia-act="ex2-autre">' + _buiaEsc(t.boutons.autre) + '</button>'; }
  }
  h += '</div>';
  if (s.corrige) { h += _buiaEncartC1(t.bilanTitre, t.bilanTexte, 'rappel') + '<p class="mt-2"><strong>' + _buiaEsc(t.astuceTitre) + '</strong> <em>' + _buiaEsc(t.astuceTexte) + '</em></p>'; }
  return h;
}
function _buiaEx2Bloc() { return '<div class="buia-ex" id="buiaEx2">' + _buiaEx2Interieur() + '</div>'; }
function _buiaEx2Maj(focusId) { var z = document.getElementById('buiaEx2'); if (z) { z.innerHTML = _buiaEx2Interieur(); } _buiaExFocus(focusId); }

// ---------------- Exercice 3 : voir la différence (avant et après) ----------------
function _buiaEx3Interieur() {
  var t = BUIA_EX3, s = _buiaExEtat().ex3, a = buiaEx3Affichage(s.cas, s.vue);
  var h = '<div class="buia-encart">' + _buiaEsc(a.histoire) + '</div><p class="fw-bold mb-1">' + _buiaEsc(t.consigne) + '</p>' +
    '<div class="buia-seg" role="group" aria-label="' + _buiaEsc(t.consigne) + '">' + ['vague', 'precise'].map(function (k) {
      return '<button type="button" class="buia-choix" id="buiaEx3-' + k + '" data-buia-act="ex3-vue" data-v="' + k + '" aria-pressed="' + (a.vue === k ? 'true' : 'false') + '">' + _buiaEsc(t.boutons[k]) + '</button>';
    }).join('') + '</div>';
  h += '<div class="buia-ex-deux" id="buiaEx3Resultat"><div><strong>' + _buiaEsc(t.demandeTitre) + '</strong><div class="buia-ex-demande">' + a.demande.map(function (m) {
    return m.n ? '<span class="buia-seg-couleur buia-e' + m.n + '" title="' + _buiaEsc(m.nom) + '">' + _buiaEsc(m.texte) + '</span> ' : _buiaEsc('« ' + m.texte + ' »');
  }).join('') + '</div>' + (a.vue === 'precise' ? '<p class="buia-petit buia-discret mb-0">' + _buiaEsc(t.legende) + '</p>' : '') + '</div>' +
    '<div><strong>' + _buiaEsc(t.reponseTitre) + '</strong><div class="buia-ex-reponse">' + a.reponse.map(function (l) { return _buiaEsc(l); }).join('<br>') + '</div></div></div>' +
    '<div class="buia-encart rappel" role="status" aria-live="polite">' + _buiaEsc(a.note) + '</div>' +
    '<p class="buia-petit buia-discret"><strong>' + _buiaEsc(t.exemple.titre) + '</strong> ' + _buiaEsc(t.exemple.texte) + '</p>';
  if (buiaEx3NombreCas() > 1) { h += '<div class="buia-actions"><button type="button" class="btn btn-outline-primary" data-buia-act="ex3-autre">' + _buiaEsc(t.autre) + '</button></div>'; }
  return h;
}
function _buiaEx3Bloc() { return '<div class="buia-ex" id="buiaEx3">' + _buiaEx3Interieur() + '</div>'; }
function _buiaEx3Maj(focusId) { var z = document.getElementById('buiaEx3'); if (z) { z.innerHTML = _buiaEx3Interieur(); } _buiaExFocus(focusId); }

// ---------------- Actions (appelée par buiaClic, index.js) ----------------
function buiaExClic(act, v) {
  var ex = _buiaExEtat(), a, b;
  if (!ex) { return false; }
  if (act === 'ex1-coche') { a = ex.ex1; if (!a.corrige) { if (a.coches[v]) { delete a.coches[v]; } else { a.coches[v] = true; } } _buiaEx1Maj('buiaEx1Case-' + v); return true; }
  if (act === 'ex1-corriger') { ex.ex1.corrige = true; _buiaEx1Maj('buiaEx1Lignes'); return true; }
  if (act === 'ex1-reparer') { ex.ex1.repare = true; _buiaEx1Maj('buiaEx1Reparee'); return true; }
  if (act === 'ex1-recommencer' || act === 'ex1-autre') {
    a = ex.ex1; if (act === 'ex1-autre') { a.cas = buiaEx1CasSuivant(a.cas); }
    a.coches = {}; a.corrige = false; a.repare = false; _buiaEx1Maj('buiaEx1Case-' + _buiaExPremierId()); return true;
  }
  if (act === 'ex3-vue') { ex.ex3.vue = buiaEx3Vue(v); _buiaEx3Maj('buiaEx3-' + ex.ex3.vue); return true; }
  if (act === 'ex3-autre') { ex.ex3.cas = buiaEx3CasSuivant(ex.ex3.cas); ex.ex3.vue = 'vague'; _buiaEx3Maj('buiaEx3-vague'); return true; }
  if (act === 'ex2-phrase') { b = ex.ex2; if (!b.corrige) { if (b.sel[v]) { delete b.sel[v]; } else { b.sel[v] = true; } } _buiaEx2Maj('buiaEx2P-' + v); return true; }
  if (act === 'ex2-corriger') { ex.ex2.corrige = true; _buiaEx2Maj('buiaEx2Phrases'); return true; }
  if (act === 'ex2-recommencer' || act === 'ex2-autre') {
    b = ex.ex2; if (act === 'ex2-autre') { b.cas = buiaEx2CasSuivant(b.cas); }
    b.sel = {}; b.corrige = false; _buiaEx2Maj('buiaEx2P-0'); return true;
  }
  return false;
}
// Identifiant du premier élément de la liste (le focus y revient au « Recommencer »).
function _buiaExPremierId() { return BUIA_ELEMENTS[0].id; }
