/* Mesure « téléphone » partagée (audit du 24/11/2026, docs/AUDIT_TELEPHONE_2026-11-24.md) : UNE SEULE source pour le balayage des routes
   (scripts/rendu/balayageTelephone.js) et pour le protocole des parcours à 375 px (scripts/parcours/protocole/outils.js, écran par écran).
   `mesurer` est exécutée DANS la page (p.evaluate) : elle ne dépend d'aucune variable de ce fichier. Jamais chargée par l'application. */

const SEUIL_CIBLE = 44;
// Cibles encore trop petites et connues. Vide = tout est conforme. Un élément de cette liste qui devient conforme n'est pas un défaut.
// Cibles volontairement gardées sous 44 px, avec la raison (chaque entrée est le début du nom mesuré, suivi d'un espace ou d'un crochet).
const TOLEREES = [
  'b.chiffre',                    // idem, chiffre en gras
  'span.chiffre',                 // chiffre cliquable au milieu d'une phrase : zone agrandie par marge intérieure et marge négative, une ligne de texte ne peut pas faire 44 px
  'button.pastille-couleur-cv',   // pastilles de couleur côte à côte (26 px, écart de 6 px) : une zone de 44 px chevaucherait la voisine
];
// Un téléphone simulé : écran tactile, 375 x 812 par défaut.
function optionsTelephone(largeur) { return { viewport: { width: largeur, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }; }

// Mesure exécutée dans la page. Ne dépend que du DOM : aucune donnée de la personne.
function mesurer(args) {
  const W = innerWidth, seuil = args.seuil;
  const vis = (e) => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0'; };
  const nom = (e) => (e.id ? '#' + e.id : e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/)[0] : '') + (e.id ? '' : (Array.from(e.attributes).filter((a) => /^data-/.test(a.name))[0] ? '[' + Array.from(e.attributes).filter((a) => /^data-/.test(a.name))[0].name + ']' : '')));
  const sortants = [];
  document.querySelectorAll('body *').forEach((e) => {
    if (!vis(e)) { return; }
    const r = e.getBoundingClientRect();
    if (r.right <= W + 1 && r.left >= -1) { return; }
    // Un contenu qui défile voulu (conteneur dont le bord reste dans l'écran) n'est pas un défaut.
    let p = e.parentElement, defile = false;
    while (p && p !== document.body) {
      const o = getComputedStyle(p).overflowX;
      if ((o === 'auto' || o === 'scroll' || o === 'hidden') && p.getBoundingClientRect().right <= W + 1) { defile = true; break; }
      p = p.parentElement;
    }
    if (!defile) { sortants.push(nom(e) + ' (bord droit ' + Math.round(r.right) + ' px)'); }
  });
  // Contenu COUPÉ : un élément qui dépasse le bord d'un conteneur à débordement masqué (overflow: hidden) est caché à la personne (texte ou bouton coupé à droite).
  // Un conteneur qui défile (auto ou scroll) n'est pas un défaut. Cas trouvé le 24/11/2026 : « Votre parcours », colonnes de 26 rem (416 px) dans un cadre de 343 px.
  const coupes = [];
  document.querySelectorAll('body *').forEach((e) => {
    if (!vis(e)) { return; }
    const r = e.getBoundingClientRect();
    if (r.width < 8 || r.height < 8 || getComputedStyle(e).position === 'fixed') { return; }
    for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.position === 'fixed') { break; }
      if (cs.overflowX === 'auto' || cs.overflowX === 'scroll') { break; }
      if (cs.overflowX === 'hidden' || cs.overflowX === 'clip') {
        const ar = a.getBoundingClientRect();
        if (ar.width > 0 && (r.right > ar.right + 2 || r.left < ar.left - 2)) { coupes.push(nom(e) + ' coupé par ' + nom(a) + ' (dépasse de ' + Math.round(Math.max(r.right - ar.right, ar.left - r.left)) + ' px)'); }
        break;
      }
    }
  });
  const petites = [];
  document.querySelectorAll('button, a[href], [role=button], input:not([type=hidden]):not([type=file]), select, textarea, summary').forEach((e) => {
    if (!vis(e)) { return; }
    const r = e.getBoundingClientRect();
    if (r.height < 10 || r.width < 10) { return; }              // filet décoratif ou champ caché
    // Zone à toucher réelle : le bouton lui-même, ou le cadre invisible (::before / ::after posé autour) quand il est plus grand.
    let w = r.width, h = r.height;
    // Case à cocher ou rond : on touche son étiquette, qui la contient ou la désigne (for), pas la petite case elle-même.
    if (e.tagName === 'INPUT' && (e.type === 'checkbox' || e.type === 'radio')) {
      const et = e.closest('label') || (e.id && document.querySelector('label[for="' + e.id + '"]'));
      if (et) { const q = et.getBoundingClientRect(); w = Math.max(w, q.width); h = Math.max(h, q.height); }
    }
    ['::before', '::after'].forEach((pseudo) => {
      const ps = getComputedStyle(e, pseudo);
      // Seul un cadre vide (content: "") posé en position absolue compte comme zone à toucher ; un texte ajouté (flèche « → ») n'en est pas un.
      if (ps.content === '""' && (ps.position === 'absolute' || ps.position === 'fixed') && ps.pointerEvents !== 'none') {
        w = Math.max(w, parseFloat(ps.width) || 0);
        h = Math.max(h, parseFloat(ps.height) || 0);
      }
    });
    // Seuils particuliers, dits clairement : une flèche collée au bord de l'écran ne peut pas dépasser 24 px de large (le bord et le bouton voisin la bornent).
    const seuilLarg = e.classList.contains('fleche-bouton') ? 24 : seuil;
    if (h < seuil || w < seuilLarg) { petites.push(nom(e) + ' ' + Math.round(w) + 'x' + Math.round(h)); }
  });
  // Champs de saisie en dessous de 16 px : un iPhone (Safari) zoome tout seul sur la page à l'ouverture du clavier, et la personne ne sait plus revenir (audit du 25/11/2026).
  const champsPetits = [];
  document.querySelectorAll('input:not([type=hidden]):not([type=file]):not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]):not([type=button]):not([type=submit]), select, textarea').forEach((e) => {
    if (!vis(e)) { return; }
    const px = parseFloat(getComputedStyle(e).fontSize);
    if (px < 16) { champsPetits.push(nom(e) + ' ' + px + ' px'); }
  });
  return { largeurPage: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth), sortants, coupes, petites, champsPetits, titre: ((document.querySelector('h1,h2') || {}).textContent || '').trim().slice(0, 50) };
}

// Anomalies lisibles d'une mesure (une phrase par défaut). `larg` : largeur de l'écran mesuré.
function anomalies(m, larg) {
  const l = [];
  if (m.largeurPage > larg) { l.push('la page fait ' + m.largeurPage + ' px de large pour un écran de ' + larg + ' px'); }
  if (m.sortants.length) { l.push(m.sortants.length + " élément(s) sortent de l'écran, par exemple " + m.sortants.slice(0, 3).join(', ')); }
  if (m.coupes.length) { l.push(m.coupes.length + ' élément(s) coupé(s) à droite, par exemple ' + m.coupes.slice(0, 3).join(', ')); }
  const petites = m.petites.filter((t) => !estToleree(t));
  if (petites.length) {
    // Regroupées par sorte (même sélecteur, même taille) : « 300 x button.chiffre 28x24 » se lit mieux que trois exemples au hasard.
    const g = {};
    petites.forEach((t) => { g[t] = (g[t] || 0) + 1; });
    const top = Object.keys(g).sort((a, b) => g[b] - g[a]).slice(0, 4).map((t) => g[t] + ' x ' + t);
    l.push(petites.length + ' cible(s) de moins de ' + SEUIL_CIBLE + ' px : ' + top.join(' ; '));
  }
  if (m.champsPetits && m.champsPetits.length) { l.push(m.champsPetits.length + ' champ(s) de saisie en dessous de 16 px (un iPhone zoomerait sur la page) : ' + m.champsPetits.slice(0, 4).join(' ; ')); }
  return l;
}

// Essai avec saisies (25/11/2026) : fonctions exécutées dans la page, partagées par le balayage des modules (--saisies) et le protocole des parcours.
// --saisies : remplit les champs visibles (seulement ceux qui sont vides), coche les cases, choisit la deuxième ligne des listes. Ne décoche jamais rien.
function remplirChamps() {
  const vis = (e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const court = 'Exemple de saisie pour le contrôle';
  const long = 'Voici un texte plus long écrit pour le contrôle du téléphone. Il contient plusieurs phrases, une adresse https://exemple.fr/une/adresse/tres/longue/qui/ne/se/coupe/pas/facilement/du/tout et un mot très long : anticonstitutionnellementanticonstitutionnellementanticonstitutionnellement. Le texte continue encore un peu pour occuper plusieurs lignes à l\'écran.';
  let n = 0;
  document.querySelectorAll('#app input, #app textarea, #app select').forEach((e) => {
    if (e.disabled || e.readOnly || e.type === 'file' || e.type === 'hidden' || e.type === 'range' || e.type === 'color' || e.type === 'button' || e.type === 'submit') { return; }
    if (e.type !== 'checkbox' && e.type !== 'radio' && !vis(e)) { return; }
    if (e.type === 'checkbox') { if (!e.checked) { e.click(); n++; } return; }
    if (e.type === 'radio') { return; }
    if (e.tagName === 'SELECT') { if (e.selectedIndex <= 0 && e.options.length > 1) { e.selectedIndex = 1; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); n++; } return; }
    if (e.value) { return; }
    const proto = e.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    let v = e.tagName === 'TEXTAREA' ? long : court;
    if (e.type === 'email') { v = 'exemple@exemple.fr'; } else if (e.type === 'number') { v = '3'; } else if (e.type === 'tel') { v = '0555000000'; } else if (e.type === 'url') { v = 'https://exemple.fr'; } else if (e.type === 'date') { v = '2026-01-15'; }
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(e, v);
    e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); n++;
  });
  return n;
}
// Clavier ouvert (écran réduit en hauteur par le test) : pour chaque champ de texte visible, le fait défiler au centre, puis vérifie qu'il est bien dans l'écran et qu'aucun élément fixe (barre du bas, bouton) ne le couvre.
function controleClavier() {
  const vis = (e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const nom = (e) => (e.id ? '#' + e.id : e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/)[0] : ''));
  const champs = [].slice.call(document.querySelectorAll('#app input, #app textarea')).filter((e) => !e.disabled && !e.readOnly && ['checkbox', 'radio', 'file', 'hidden', 'range', 'color', 'button', 'submit'].indexOf(e.type) === -1 && vis(e));
  const defauts = [];
  champs.slice(0, 6).forEach((e) => {
    e.scrollIntoView({ block: 'center' });
    const r = e.getBoundingClientRect();
    const H = innerHeight;
    const haut = Math.min(r.height, H - 20);
    // trois points du champ (haut, milieu, bas visible) : le dessus doit être le champ lui-même (ou l'un de ses parents)
    const pts = [r.top + 6, r.top + Math.min(r.height, H) / 2, Math.min(r.bottom, H) - 6];
    const couvert = pts.filter((y) => { if (y < 0 || y > H) { return false; } const t = document.elementFromPoint(r.left + Math.min(20, r.width / 2), y); return t && t !== e && !e.contains(t) && !t.contains(e) && !(t.tagName === 'LABEL' && t.control === e); });
    if (r.width > 0 && (r.left < -1 || r.right > innerWidth + 1)) { defauts.push(nom(e) + ' sort de l\'écran (' + Math.round(r.left) + ' à ' + Math.round(r.right) + ')'); }
    else if (couvert.length) { const t = document.elementFromPoint(r.left + Math.min(20, r.width / 2), couvert[0]); defauts.push(nom(e) + ' est couvert par ' + (t ? nom(t) : '?') + ' quand le clavier est ouvert'); }
    else if (haut < Math.min(r.height, 60)) { defauts.push(nom(e) + ' reste trop peu visible'); }
  });
  return defauts;
}
const estToleree = (t) => TOLEREES.some((x) => t.indexOf(x + ' ') === 0 || t.indexOf(x + '[') === 0);
module.exports = { estToleree, mesurer, anomalies, remplirChamps, controleClavier, optionsTelephone, SEUIL_CIBLE, TOLEREES };
