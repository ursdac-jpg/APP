/* ============================================================
   matrice_options.js  --  INVENTAIRE « bouton x modele » du panneau « La mise en page » (outil de developpement)
   ------------------------------------------------------------
   Demande de Denis (2026-09-29) : « verifier impérativement toutes les options rapides et tous les modeles : des boutons sont cliquables
   mais il ne se passe rien ». Pour CHAQUE modele (Standard, Sobre x5, Creatif x19) et CHAQUE controle de bouton / case des cartes, ce banc
   clique, attend que l'apercu soit stable, mesure si le CV a REELLEMENT change (empreinte du HTML de la page), puis remet l'etat.

   Utilisation (navigateur, page rechargee) :
     eval(await (await fetch('/scripts/word/banc_b7.js')).text());          // fournit __preparer et __fnv
     eval(await (await fetch('/scripts/word/matrice_options.js')).text());
     window.__lancerMatrice();          // long (30 a 60 min) : suivre window.__matProgres, lire window.__mat a la fin
   Resultat : window.__mat[modele][carte|controle] = 'effet' | 'sans-effet' | 'grise' | 'deja-actif' | 'absent' | 'derive'
   ============================================================ */
(function () {
  var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
  var pause = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function hashPage() {
    var c = W().document.getElementById('conteneurPage');
    if (!c) { return 'aucune-page'; }
    // La feuille de style COMPTE : coins arrondis, bordures, interligne, espacement... ne changent que le CSS, jamais le contenu de la page.
    var css = Array.prototype.map.call(W().document.querySelectorAll('style'), function (s) { return s.textContent; }).join('');
    return __fnv(c.innerHTML + css) + ':' + c.innerHTML.length + ':' + css.length;
  }
  // attend que l'apercu ne bouge plus (la page peut etre reconstruite apres un clic)
  async function stable() {
    var dernier = null, n = 0;
    for (var i = 0; i < 40; i++) {
      var h; try { h = hashPage(); } catch (e) { h = 'err'; }
      if (h === dernier) { n++; if (n >= 2) { return h; } } else { n = 0; dernier = h; }
      await pause(90);
    }
    return dernier;
  }
  // controles exclus : navigation, ouverture de fenetres, saisie de texte, listes par element, et boutons sans lien avec le rendu
  var LISTE_NOIRE = /versgrand|modifier|choisie|choisir|missions-(moins|plus)|missions-global|exp-editer|^pick|info-|select-|titre-|accroche-|sans-accroche|ordre|exp-tout|formations-tout|expperso-tout|expperso-mode|expperso-masquer|rg-|police|entete-fixe|largeurgauche|coulcomp|coulpuces|format-simple|org-standard|org-perso|rubrique=|^base|accent|degrade-simple|comp-.*-(moins|plus)|form-espacement|cible-taille|mois-affiches|liste-2col|espacement/;
  function collecter() {
    var res = [], vus = {};
    document.querySelectorAll('details.mep-carte').forEach(function (carte) {
      carte.querySelectorAll('input[type=checkbox],button').forEach(function (el) {
        var a = Array.prototype.filter.call(el.attributes, function (x) { return /^data-mep-/.test(x.name); })[0];
        if (!a) { return; }
        var cle = a.name.slice(9) + (a.value ? '=' + a.value : '');
        if (LISTE_NOIRE.test(cle)) { return; }
        var id = (carte.id || '?') + '|' + cle;
        vus[id] = (vus[id] || 0) + 1;
        res.push({ id: id + (vus[id] > 1 ? '#' + vus[id] : ''), carte: carte.id, cle: cle, n: vus[id], el: el });
      });
    });
    return res;
  }
  function retrouver(id) { return collecter().filter(function (c) { return c.id === id; })[0]; }

  async function tester(id, mode) {
    var vraiPageResultats = window.pageResultats;
    if (mode === 'rapide') { window.pageResultats = function () {}; }
    try { return await testerBrut(id); } finally { window.pageResultats = vraiPageResultats; }
  }
  async function testerBrut(id) {
    var c = retrouver(id); if (!c) { return 'absent'; }
    var el = c.el;
    if (el.disabled || el.closest('.sans-objet') || /sans effet/i.test((el.parentElement && el.parentElement.textContent) || '')) { return 'grise'; }
    var estBouton = el.tagName === 'BUTTON';
    if (estBouton && el.classList.contains('on')) { return 'deja-actif'; }
    var base = await stable();
    var coche = el.type === 'checkbox' ? el.checked : null;
    var voisinOn = estBouton ? Array.prototype.filter.call(el.parentElement.children, function (b) { return b !== el && b.classList && b.classList.contains('on'); })[0] : null;
    var idVoisin = null;
    if (voisinOn) { var v = Array.prototype.filter.call(collecter(), function (x) { return x.el === voisinOn; })[0]; idVoisin = v && v.id; }
    el.click();
    var apres = await stable();
    var change = apres !== base;
    // remise en etat : meme case, ou bouton voisin qui etait actif
    var c2 = retrouver(id);
    if (c2 && coche !== null && c2.el.checked !== coche) { c2.el.click(); }
    else if (idVoisin) { var v2 = retrouver(idVoisin); if (v2) { v2.el.click(); } }
    var retour = await stable();
    if (retour !== base) { return (change ? 'effet' : 'sans-effet') + '+derive'; }
    return change ? 'effet' : 'sans-effet';
  }

  // Jeu de donnees du banc + ce qu'il faut pour que chaque reglage ait quelque chose a changer (lieu des formations, logiciels, certifications...).
  async function preparerMatrice() {
    await __preparer();
    dossier.formations.forEach(function (f) { f.lieu = f.lieu || 'Limoges'; });
    dossier.logiciels = dossier.logiciels && dossier.logiciels.length ? dossier.logiciels : ['Word', 'Excel'];
    dossier.certifications = dossier.certifications || 'SST (Sauveteur secouriste du travail) ; Habilitation electrique B0H0V';
    dossier.informationsComplementaires = dossier.informationsComplementaires && dossier.informationsComplementaires.length ? dossier.informationsComplementaires : ['Permis B, vehicule personnel'];
    window.pageResultats(); await pause(2500);
  }
  async function appliquerModele(m) {
    await preparerMatrice();
    await pause(1200);
    var clic = function (sel) { var b = document.querySelector(sel); if (b) { b.click(); return true; } return false; };
    if (m.type === 'standard') { clic('[data-mep-allure="defaut"]'); await pause(2200); return true; }
    var allure = m.type === 'sobre' ? 'sobre' : 'creatif';
    clic('[data-mep-allure="' + allure + '"]'); await pause(2600);
    var ok = clic(m.type === 'sobre' ? '[data-mep-galerie-sobre="' + m.id + '"]' : '[data-mep-galerie-creatif="' + m.id + '"]');
    await pause(2600);
    return ok;
  }

  window.__typeLent = window.__typeLent || {}; window.__sansEffetConfirme = window.__sansEffetConfirme || {};
  window.__matModeles = function () {
    var l = [{ type: 'standard', id: 'standard' }];
    ['mq-bandeau', 'mq-fond', 'mq-epure', 'mq-photo', 'mq-rectangles'].forEach(function (v) { l.push({ type: 'sobre', id: v }); });
    ['mqBandeau', 'mqDiagonale', 'mqColonne', 'mqCadre', 'mqPicto', 'frise', 'photoFrise', 'rectangles', 'sidebarVague', 'rubanDiagonal', 'duoOvale', 'cadreBarre', 'bandeauVertical', 'triangleSavoir', 'vagueMarine', 'diagonalesContrastees', 'losangeVert', 'pastille', 'medaillon'].forEach(function (i) { l.push({ type: 'creatif', id: i }); });
    return l;
  };

  // Un modele : renvoie { controle: etat }
  var instantane = null;
  async function prendreInstantane() { instantane = { pdf: JSON.stringify(dossier.pdfReglages || null), canon: JSON.stringify(dossier.reglagesMiseEnPageCV || null) }; }
  async function restaurerInstantane() {
    dossier.pdfReglages = JSON.parse(instantane.pdf); dossier.reglagesMiseEnPageCV = JSON.parse(instantane.canon);
    window.pageResultats(); await pause(2500); await stable();
  }
  window.__matUnModele = async function (m) {
    var cleModele = m.type + ':' + m.id;
    window.__mat = window.__mat || {};
    if (!(await appliquerModele(m))) { window.__mat[cleModele] = { erreur: 'modele introuvable' }; return; }
    await prendreInstantane();
    var res = {}, ids = collecter().map(function (c) { return c.id; });
    // Relance ciblee : window.__matSeulement = { 'creatif:frise': ['cTexte|interligne=aere', ...] } (seulement ces controles).
    if (window.__matSeulement && window.__matSeulement[cleModele]) { ids = ids.filter(function (i) { return window.__matSeulement[cleModele].indexOf(i) !== -1; }); }
    for (var i = 0; i < ids.length; i++) {
      window.__matProgres = cleModele + ' ' + (i + 1) + '/' + ids.length;
      try {
        var cc = ids[i], r;
        if (window.__typeLent[cc]) { r = await tester(cc, 'lent'); }
        else {
          r = await tester(cc, 'rapide');
          if (/^sans-effet/.test(r) && !window.__sansEffetConfirme[cc]) {
            var r2 = await tester(cc, 'lent');
            if (/^effet/.test(r2)) { window.__typeLent[cc] = true; r = r2 + '(reconstruction)'; }
            else { window.__sansEffetConfirme[cc] = true; r = r2; }
          }
        }
        res[cc] = r;
      } catch (e) { res[ids[i]] = 'erreur ' + e.message; }
      if (/derive/.test(res[ids[i]])) { await restaurerInstantane(); } // l'etat a derive : retour a l'instantane du modele
    }
    window.__mat[cleModele] = res;
  };

  window.__lancerMatrice = async function (liste) {
    window.__mat = window.__mat || {}; window.__matFini = false;
    var modeles = liste || window.__matModeles();
    for (var i = 0; i < modeles.length; i++) { await window.__matUnModele(modeles[i]); }
    window.__matFini = true; window.__matProgres = 'fini';
  };
})();
