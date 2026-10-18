/* ============================================================
   inventaire_aide.js  --  INVENTAIRE DU BOUTON AIDE (outil de developpement, jamais charge par l'application)
   ------------------------------------------------------------
   Pour chaque page routee : l'aide existe-t-elle, combien d'etapes de la visite guidee survivent au filtre des selecteurs,
   quels selecteurs sont morts. Pour les fenetres : entrees AIDE_FENETRES et leurs selecteurs (non verifiables sans ouvrir la fenetre).

   Utilisation (navigateur integre, serveur de dev lance, page fraichement rechargee) :
     eval(await (await fetch('/scripts/parcours/inventaire_aide.js')).text());
     var r = await window.__inventaireAide();   // renvoie { pages, fenetres }
   ATTENTION : navigue entre les pages, modifie l'ecran en cours. Ne jamais lancer sur une vraie session de Denis.
   ============================================================ */
(function () {
  var attente = function (ms) { return new Promise(function (r) { setTimeout(r, ms || 500); }); };
  window.__inventaireAide = async function () {
    var pages = [];
    var noms = Object.keys(routes);
    for (var i = 0; i < noms.length; i++) {
      var nom = noms[i], erreur = '';
      try { naviguerVers(nom, true); } catch (e) { erreur = String(e && e.message || e); }
      await attente(700);
      var entrees = AIDE_PAGES[nom] || [];
      var vivantes = [], mortes = [];
      entrees.forEach(function (e) {
        if (!e.selecteur) { mortes.push('(sans selecteur) ' + e.titre); return; }
        var ok = false; try { ok = !!document.querySelector(e.selecteur); } catch (x) { ok = false; }
        (ok ? vivantes : mortes).push(ok ? e.titre : e.selecteur + '  <- ' + e.titre);
      });
      pages.push({ route: nom, atteinte: pageActuelle === nom, erreur: erreur, aide: entrees.length, vivantes: vivantes.length, mortes: mortes });
    }
    var fenetres = Object.keys(AIDE_FENETRES).map(function (k) {
      return { contexte: k, etapes: AIDE_FENETRES[k].length, selecteurs: AIDE_FENETRES[k].map(function (e) { return e.selecteur || '(aucun)'; }) };
    });
    return { pages: pages, fenetres: fenetres };
  };
})();
