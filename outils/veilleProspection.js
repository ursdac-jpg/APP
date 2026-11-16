/* ============================================================
   veilleProspection.js : l'onglet « Prospection des structures » de l'outil de veille (consigne 270, 12/11/2026)
   ------------------------------------------------------------
   Le travail lui-même est dans scripts/prospectionStructures.js (le même que celui du fichier « Chercher de nouvelles structures.bat »).
   Ici : un petit état d'avancement pour la fenêtre, et la lecture du dernier résultat.
   EXCEPTION ASSUMÉE au serveur local (voir son en-tête) : après un clic et avec le jeton, la recherche ouvre, en lecture, DEUX sites publics fixes (data.gouv.fr sert les deux fichiers ouverts : data.inclusion et FINESS) :
     - www.data.gouv.fr / static.data.gouv.fr (le fichier ouvert data.inclusion, adresse prise dans la réponse de data.gouv.fr et refusée si elle n'est pas sur static.data.gouv.fr) ;
     - recherche-entreprises.api.gouv.fr (la base officielle des entreprises, un SIRET de 14 chiffres par demande).
   Aucune adresse, aucun nom de fichier ni aucune option ne vient de la page, à part « chercher quand même » (force). Seul dossier écrit : outils/prospection_structures/
   (ignoré par Git) : le résultat, le cache et decisions.json (fiches écartées ou tranchées par la personne, contrôlées par le script). Le registre « Qui fait quoi » et le sas ne sont JAMAIS écrits ici : les lignes passent par la zone de collage du sas, puis par « C'est bon ».
   ============================================================ */
'use strict';
const path = require('path');
const prospection = require('../scripts/prospectionStructures.js');

function creerProspection(racine, options) {
  const opt = options || {};
  const dossier = path.join(racine, 'outils', 'prospection_structures');
  const lancer = opt.lancer || prospection.lancer;
  let etat = { enCours: false, etape: '', pourcent: 0, termine: false, erreur: '', pasDeNouveau: false, fichierDu: '' };

  // Lance la recherche en arrière-plan ; la fenêtre interroge ensuite etat() toutes les secondes.
  function chercher(donnees) {
    if (etat.enCours) { return { ok: false, erreur: 'Une recherche est déjà en cours.' }; }
    etat = { enCours: true, etape: 'Démarrage...', pourcent: 1, termine: false, erreur: '', pasDeNouveau: false, fichierDu: '' };
    const force = !!(donnees && donnees.force === true);
    lancer({
      racine: racine, dossier: dossier, force: force, finess: opt.finess !== false, fetch: opt.fetch || fetch, pause: opt.pause, pauseLimite: opt.pauseLimite,
      surProgres: function (t, p) { etat.etape = t; etat.pourcent = p; }
    }).then(function (r) {
      etat.enCours = false; etat.termine = true; etat.pourcent = 100;
      etat.pasDeNouveau = !!(r && r.pasDeNouveau); etat.fichierDu = (r && r.fichierDu) || '';
    }, function (e) {
      etat.enCours = false; etat.termine = true; etat.erreur = (e && e.message) || 'La recherche a échoué.';
    });
    return { ok: true };
  }
  function lireEtat() { return Object.assign({ ok: true }, etat); }
  function lire() { return prospection.lireResultat({ racine: racine, dossier: dossier }); }
  // Les décisions de la personne (écarter, trancher, remettre en jeu) : écrites seulement dans decisions.json, après contrôle par le script.
  function decider(donnees) {
    const d = donnees || {};
    const t = function (x) { return typeof x === 'string' && x.length <= 300 ? x : ''; };
    return prospection.decider({ racine: racine, dossier: dossier }, { op: t(d.op), id: t(d.id), cle: t(d.cle), raison: t(d.raison), texte: t(d.texte), choix: t(d.choix), regId: t(d.regId) });
  }
  // Le verrou avant le sas : rend les lignes des fiches contrôlées, ou ce qui reste à trancher.
  function verifier(donnees) {
    const ids = donnees && Array.isArray(donnees.ids) ? donnees.ids.filter(function (x) { return typeof x === 'string' && x.length <= 200; }).slice(0, 200) : [];
    return prospection.verifier({ racine: racine, dossier: dossier }, ids);
  }
  return { chercher: chercher, etat: lireEtat, lire: lire, decider: decider, verifier: verifier, dossier: dossier };
}

module.exports = { creerProspection: creerProspection };
