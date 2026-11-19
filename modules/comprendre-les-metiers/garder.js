/* ============================================================
   Module « Explorer les métiers » : « Garder mon résultat » et la disquette.
   Charge après parMetier.js ; lu par collecterEtatsModulesPourSauvegarde / restaurerEtatsModules (js/app.js).

   Règles tenues ici (décisions de Denis, 16/11/2026) :
   - la disquette ne reçoit QUE ce que la personne a choisi de garder (bouton « Garder mon résultat »), jamais d'office ;
   - elle reçoit le RÉSULTAT, jamais une réponse : pour le questionnaire, les pourcentages par partie ; pour « Par ce que vous aimez faire »,
     les identifiants des choix (les métiers proposés se recalculent) ;
   - la structure est EXTENSIBLE : { version, tests: { riasec, ... }, parActions } : un autre test s'ajoute sous `tests` sans rien défaire ;
   - tout ce qui vient d'un fichier est relu avec méfiance (identifiants connus, tailles limitées).
   ============================================================ */

var CMV_VERSION_SAUVEGARDE = 1;

function _cmgCopie(x) { return JSON.parse(JSON.stringify(x)); }

// ---------------- Garder / ne plus garder ----------------
function cmvGarderResultat() {
  var etat = cmvEtat();
  if (!etat.q || !etat.q.resultat) { return false; }
  etat.q.garde = !etat.q.garde;
  return true;
}
function cmvGarderChoix() {
  var etat = cmvEtat();
  if (etat.gardeChoix) { etat.gardeChoix = null; return true; }
  etat.gardeChoix = { date: _cmqvDateDuJour(), choix: _cmgCopie(etat.choix) };
  return true;
}

// ---------------- Vers la disquette ----------------
function cmvExporterEtatPourSauvegarde() {
  var etat = (typeof _cmvEtat !== 'undefined') ? _cmvEtat : null;
  if (!etat) { return null; }
  var tests = {}, riasec = null, parActions = null;
  if (etat.q && etat.q.garde && etat.q.resultat) {
    riasec = cmqResultatAGarder(etat.q.resultat.calcul, etat.q.resultat.date);
    tests.riasec = riasec;
  }
  if (etat.gardeChoix && etat.gardeChoix.choix) {
    parActions = { version: 1, date: etat.gardeChoix.date, choix: _cmgCopie(etat.gardeChoix.choix) };
  }
  // « Ma synthèse » : seulement si la personne l'a gardée (métiers retenus, niveau, suivi, compléments), jamais le texte libre ni la lecture.
  var synthese = (typeof synPourFichier === 'function') ? synPourFichier(etat.synthese) : null;
  if (!riasec && !parActions && !synthese) { return null; }
  return { version: CMV_VERSION_SAUVEGARDE, tests: tests, parActions: parActions, synthese: synthese };
}

// Identifiants de choix relus : seulement ceux qui existent dans les catalogues de l'application, sans doublon, dans la limite de chaque page.
function _cmgIdentifiantsConnus(cle, brut, limite) {
  if (!Array.isArray(brut)) { return []; }
  var connus = {};
  _cmaCatalogue(cle).forEach(function (g) { (g.items || []).forEach(function (it) { connus[it.id] = true; }); });
  return brut.filter(function (id, i, t) { return typeof id === 'string' && connus[id] && t.indexOf(id) === i; }).slice(0, limite);
}
function _cmgConditionsConnues(brut) {
  if (!Array.isArray(brut) || typeof CONDITIONS_ROME === 'undefined') { return []; }
  return brut.filter(function (id, i, t) { return typeof id === 'string' && CONDITIONS_ROME.libelles[id] && t.indexOf(id) === i; }).slice(0, 20);
}

// ---------------- Depuis la disquette ----------------
function cmvRestaurerEtatDepuisSauvegarde(brut) {
  cmvReinitialiser();   // nouvelle session : l'historique du navigateur ne rejoue pas l'ancien travail
  if (!brut || typeof brut !== 'object') { return; }
  var etat = cmvEtat();
  var r = brut.tests && brut.tests.riasec ? cmqNormaliserResultatGarde(brut.tests.riasec) : null;
  var calcul = r ? cmqCalculDepuisGarde(r) : null;
  if (calcul) {
    etat.q.resultat = { calcul: calcul, date: r.date };
    etat.q.terminee = true;
    etat.q.garde = true;
  }
  var pa = brut.parActions;
  if (pa && typeof pa === 'object' && pa.choix && typeof pa.choix === 'object') {
    var choix = {
      activites: _cmgIdentifiantsConnus('activites', pa.choix.activites, CML_MAX_CHOIX.activites),
      actions: _cmgIdentifiantsConnus('actions', pa.choix.actions, CML_MAX_CHOIX.actions),
      environnement: _cmgIdentifiantsConnus('environnement', pa.choix.environnement, CML_MAX_CHOIX.environnement),
      conditions: _cmgConditionsConnues(pa.choix.conditions),
      faciles: _cmgConditionsConnues(pa.choix.faciles).filter(function (id) { return _cmgConditionsConnues(pa.choix.conditions).indexOf(id) === -1; })
    };
    if (choix.activites.length + choix.actions.length + choix.environnement.length) {
      etat.choix = _cmgCopie(choix);
      etat.gardeChoix = { date: typeof pa.date === 'string' ? pa.date.slice(0, 40) : '', choix: _cmgCopie(choix) };
    }
  }
  // Un nom de métier inconnu aujourd'hui est ignoré ; un nom écrit autrement (accents corrigés...) est retrouvé et remis comme dans la base.
  if (typeof synNormaliserDepuisFichier === 'function') {
    var syn = synNormaliserDepuisFichier(brut.synthese, function (nom, rome) {
      // Même nom pour deux codes ROME : le code gardé départage ; sinon on retrouve le métier par son nom.
      var f = null;
      if (rome && typeof baseMetiers !== 'undefined') {
        f = baseMetiers.filter(function (m) { return m.rome === rome && normaliserTexte(m.nom) === normaliserTexte(nom); })[0] || null;
      }
      if (!f && typeof metierParNom === 'function') { f = metierParNom(nom); }
      return f ? { nom: f.nom, rome: f.rome } : null;
    });
    if (syn) { etat.synthese = syn; }
  }
}
