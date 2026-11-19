// FLÈCHE « REMONTER » COMMUNE (consigne 423, 17/11/2026, choix de Denis : « une flèche pour tout »).
// Un seul bouton, créé une fois, pour TOUTES les pages : il apparaît dès que la personne a dépassé les trois quarts du premier écran, et ramène en haut.
// Une page peut lui donner une CIBLE (remonterDefinirCible) : la flèche ramène alors à cet élément (les filtres de Nouveautés) et s'affiche quand
// il est sorti de l'écran par le haut. Naviguer vers une autre page efface la cible (remonterSurNavigation, appelée par naviguerVers).
// Ne jamais recopier cette flèche dans un module : la configurer ici. Style : .fleche-remonter (css/style.css).

var REMONTER_SEUIL_ECRANS = 0.75;   // Denis, 17/11/2026 : dès que l’on a dépassé les trois quarts du premier écran
var REMONTER_ROUTES_SANS_FLECHE = ['introduction-diaporama'];   // une seule vue : aucune flèche utile
var _remonterCible = null;   // { selecteur, focus } ou null

// Logique pure (testée sous Node). hautCible = position du bas de l'élément cible dans l'écran, ou null s'il n'y a pas de cible (ou si elle est absente).
function remonterDoitEtreVisible(defilement, hauteurFenetre, hautCible, route) {
  if (REMONTER_ROUTES_SANS_FLECHE.indexOf(route) !== -1) { return false; }
  if (typeof hautCible === 'number') { return hautCible <= 40; }
  return defilement > REMONTER_SEUIL_ECRANS * hauteurFenetre;
}

function remonterDefinirCible(selecteur, selecteurFocus) {
  _remonterCible = selecteur ? { selecteur: selecteur, focus: selecteurFocus || '' } : null;
  remonterMettreAJour();
}

function remonterSurNavigation() { _remonterCible = null; remonterMettreAJour(); }

function remonterMettreAJour() {
  var f = document.getElementById('flecheRemonter');
  if (!f) { return; }
  var el = _remonterCible ? document.querySelector(_remonterCible.selecteur) : null;
  var route = document.documentElement.getAttribute('data-route') || '';
  f.hidden = !remonterDoitEtreVisible(window.pageYOffset || 0, window.innerHeight || 0, el ? el.getBoundingClientRect().bottom : null, route);
  f.setAttribute('aria-label', el ? 'Remonter aux filtres' : 'Remonter en haut de la page');
  f.title = f.getAttribute('aria-label');
}

function remonterAller() {
  var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var comportement = reduit ? 'auto' : 'smooth';
  var el = _remonterCible ? document.querySelector(_remonterCible.selecteur) : null;
  if (el) {
    el.scrollIntoView({ behavior: comportement, block: 'start' });
    var b = _remonterCible.focus ? el.querySelector(_remonterCible.focus) : null;
    if (b) { b.focus({ preventScroll: true }); }
    return;
  }
  window.scrollTo({ top: 0, behavior: comportement });
  var titre = document.querySelector('h1');
  if (titre) { if (!titre.hasAttribute('tabindex')) { titre.setAttribute('tabindex', '-1'); } titre.focus({ preventScroll: true }); }
}

function remonterInstaller() {
  if (typeof document === 'undefined' || document.getElementById('flecheRemonter')) { return; }
  var b = document.createElement('button');
  b.type = 'button'; b.id = 'flecheRemonter'; b.className = 'fleche-remonter'; b.hidden = true;
  b.setAttribute('aria-label', 'Remonter en haut de la page'); b.title = 'Remonter en haut de la page';
  b.innerHTML = '<i class="bi bi-arrow-up" aria-hidden="true"></i>';
  b.addEventListener('click', remonterAller);
  document.body.appendChild(b);
  window.addEventListener('scroll', remonterMettreAJour, { passive: true });
  window.addEventListener('resize', remonterMettreAJour);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', remonterInstaller); } else { remonterInstaller(); }
}
if (typeof module !== 'undefined' && module.exports) { module.exports = { remonterDoitEtreVisible: remonterDoitEtreVisible, REMONTER_SEUIL_ECRANS: REMONTER_SEUIL_ECRANS, REMONTER_ROUTES_SANS_FLECHE: REMONTER_ROUTES_SANS_FLECHE }; }
