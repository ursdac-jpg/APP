/* ============================================================
   Module « Nouveautés » : interface (pas de test Node : test navigateur obligatoire).
   Le bouton en haut à gauche (#btnNouveautes, index.html) est visible sur toutes les pages ; la pastille dit combien de nouveautés datent de moins de 30 jours.
   La page (route 'nouveautes') liste tout l'historique par mois. Données : data/nouveautes.js ; logique pure : logique.js.
   Chantier : docs/CHANTIER_NOUVEAUTES_2026-10-26.md.
   ============================================================ */

function _nvEchap(t) {
  return String(t === undefined || t === null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Pastille du bouton : nombre de nouveautés des 30 derniers jours (cachée à zéro).
function nvMajPastille() {
  var p = document.getElementById('nvPastille'), b = document.getElementById('btnNouveautes');
  if (!p || !b || typeof NOUVEAUTES === 'undefined') { return; }
  var n = nvCompterNouveaux(NOUVEAUTES, new Date());
  p.textContent = n ? String(n) : '';
  p.hidden = !n;
  b.setAttribute('aria-label', n ? 'Nouveautés : ' + n + ' ajout' + (n > 1 ? 's' : '') + ' récent' + (n > 1 ? 's' : '') : 'Nouveautés : voir ce qui a été ajouté');
}

function nvOuvrirPage() {
  if (typeof naviguerVers === 'function') { naviguerVers('nouveautes'); }
}

function nvEssayer(route) {
  if (route && typeof naviguerVers === 'function') { naviguerVers(route); }
}

function pageNouveautes() {
  var auj = new Date();
  var groupes = nvGrouperParMois(typeof NOUVEAUTES !== 'undefined' ? NOUVEAUTES : [], auj);
  var corps = groupes.map(function (g) {
    return '<h2 class="nv-mois">' + _nvEchap(g.mois) + '</h2>' + g.items.map(function (n) {
      return '<div class="nv-carte"><div class="nv-tete"><span class="nv-date">' + _nvEchap(nvDateFr(n.date)) + '</span>' +
        (nvEstNouveau(n, auj) ? '<span class="nv-nouveau">Nouveau</span>' : '') + '</div>' +
        '<div class="nv-titre">' + _nvEchap(n.titre) + '</div><p class="mb-2">' + _nvEchap(n.texte) + '</p>' +
        (n.route ? '<button type="button" class="btn btn-sm btn-outline-primary" data-nv-route="' + _nvEchap(n.route) + '">' + (n.icone ? '<i class="bi ' + _nvEchap(n.icone) + '" aria-hidden="true"></i> ' : '') + 'Essayer : ' + _nvEchap(n.module || 'ouvrir') + '</button>' : '') + '</div>';
    }).join('');
  }).join('');
  app.innerHTML = '<div class="page-catalogue-contenu nv-page">' +
    '<div class="text-center"><h1><i class="bi bi-megaphone" aria-hidden="true"></i> Nouveautés</h1>' +
    '<p class="sousTitre">Ce qui a été ajouté à l’application, du plus récent au plus ancien. Les ajouts des 30 derniers jours portent la mention « Nouveau ».</p></div>' +
    '<div class="text-center mb-2"><button type="button" class="btn btn-sm btn-outline-secondary" data-signaler-probleme="1"><i class="bi bi-exclamation-triangle" aria-hidden="true"></i> Un problème avec une nouveauté ? Signalez-le</button></div>' +
    (corps || '<p class="text-center text-muted">Rien à signaler pour l’instant.</p>') + '</div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null) + '</div>';
  app.querySelectorAll('[data-nv-route]').forEach(function (b) {
    b.addEventListener('click', function () { nvEssayer(b.getAttribute('data-nv-route')); });
  });
  if (typeof trackEvenement === 'function') { trackEvenement('nouveautes_ouvert'); }
}

function _nvInitialiser() {
  var b = document.getElementById('btnNouveautes');
  if (b && !b.__nvBranche) { b.__nvBranche = true; b.addEventListener('click', nvOuvrirPage); }
  nvMajPastille();
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _nvInitialiser); } else { _nvInitialiser(); }
}
