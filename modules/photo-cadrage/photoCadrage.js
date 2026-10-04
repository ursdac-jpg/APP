/* ============================================================
   photoCadrage.js  --  RECADRAGE DE LA PHOTO DU CV (zoom + deplacement)
   ------------------------------------------------------------
   Chantier "photo" (option A, DECISION DE DENIS 2026-09-29), maquette validee :
   docs/MAQUETTE_RECADRAGE_PHOTO_2026-09-29.html.

   - Partie PURE (geometrie du cadre) : testee sous Node (tests/photoCadrage.test.js).
   - Partie fenetre (photoCadrageOuvrir) : DOM, navigateur seulement, construite sur
     la primitive partagee ouvrirFenetreERIP (js/app.js) -- aucun overlay recopie.
   - Point d'entree unique dans l'application : ajouterPhotoAuDossier() (js/app.js), qui sert
     les 4 chemins (ecran Identite, reglages du CV, Atelier CV, page Vos documents).

   Sortie identique a l'ancien comportement : un carre PHOTO_CADRAGE_SORTIE x PHOTO_CADRAGE_SORTIE
   en JPEG (dossier.photo.url). Le CV n'affiche que ce carre (rond, losange, medaillon = habillage).
   ============================================================ */

var PHOTO_CADRAGE_ZONE = 320;      // cote de la zone de cadrage a l'ecran (px)
var PHOTO_CADRAGE_SORTIE = 400;    // cote de la photo finale du CV (px)
var PHOTO_CADRAGE_ZOOM_MAX = 4;    // zoom maximum, en multiples du plein cadre
var PHOTO_CADRAGE_ORIGINAL_MAX = 1000; // cote max de l'original garde pour "Ajuster le cadrage"

/* ---------------- geometrie pure ---------------- */

// Etat de depart : photo entiere qui remplit le cadre, centree. larg/haut = taille de la photo d'origine.
function photoCadrageEtatInitial(larg, haut, zone) {
  zone = zone || PHOTO_CADRAGE_ZONE;
  var kmin = zone / Math.min(larg, haut);
  var etat = { larg: larg, haut: haut, zone: zone, kmin: kmin, k: kmin, ox: 0, oy: 0 };
  etat.ox = (zone - larg * kmin) / 2;
  etat.oy = (zone - haut * kmin) / 2;
  return photoCadrageBorner(etat);
}

// La photo ne doit jamais laisser de vide dans le cadre.
function photoCadrageBorner(etat) {
  var wk = etat.larg * etat.k, hk = etat.haut * etat.k;
  etat.ox = Math.min(0, Math.max(etat.zone - wk, etat.ox));
  etat.oy = Math.min(0, Math.max(etat.zone - hk, etat.oy));
  return etat;
}

// Zoom autour du centre du cadre (le point au milieu reste au milieu).
function photoCadrageZoomer(etat, nouveauK) {
  nouveauK = Math.max(etat.kmin, Math.min(etat.kmin * PHOTO_CADRAGE_ZOOM_MAX, nouveauK));
  var cx = (etat.zone / 2 - etat.ox) / etat.k, cy = (etat.zone / 2 - etat.oy) / etat.k;
  etat.k = nouveauK;
  etat.ox = etat.zone / 2 - cx * etat.k;
  etat.oy = etat.zone / 2 - cy * etat.k;
  return photoCadrageBorner(etat);
}

function photoCadrageDeplacer(etat, dx, dy) {
  etat.ox += dx; etat.oy += dy;
  return photoCadrageBorner(etat);
}

// Partie de la photo d'origine actuellement dans le cadre (carre).
function photoCadrageRegion(etat) {
  return { sx: -etat.ox / etat.k, sy: -etat.oy / etat.k, cote: etat.zone / etat.k };
}

// Zoom en pourcentage du plein cadre (100 a 400).
function photoCadragePourcent(etat) { return Math.round(etat.k / etat.kmin * 100); }

// Vrai si la partie gardee est trop petite pour rester nette dans la photo finale.
function photoCadrageEstFloue(etat, sortie) {
  return photoCadrageRegion(etat).cote < (sortie || PHOTO_CADRAGE_SORTIE) * 0.75;
}

// Restaure un cadrage memorise ({ k, ox, oy }) en le rendant valide pour la photo courante.
function photoCadrageRestaurer(etat, cadrage) {
  if (cadrage && typeof cadrage.k === 'number' && typeof cadrage.ox === 'number' && typeof cadrage.oy === 'number') {
    etat.k = Math.max(etat.kmin, Math.min(etat.kmin * PHOTO_CADRAGE_ZOOM_MAX, cadrage.k));
    etat.ox = cadrage.ox; etat.oy = cadrage.oy;
    photoCadrageBorner(etat);
  }
  return etat;
}

/* ---------------- fenetre de cadrage (navigateur) ---------------- */

var _PHOTO_CADRAGE_SVG_GUIDE =
  '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><defs><mask id="photoCadrageTrou"><rect width="100" height="100" fill="#fff"/>' +
  '<circle cx="50" cy="50" r="50" fill="#000"/></mask></defs>' +
  '<rect width="100" height="100" fill="rgba(0,0,0,.35)" mask="url(#photoCadrageTrou)"/>' +
  '<circle cx="50" cy="50" r="49.6" fill="none" stroke="#fff" stroke-width=".8" stroke-dasharray="3 2"/>' +
  '<rect x=".4" y=".4" width="99.2" height="99.2" fill="none" stroke="#fff" stroke-width=".8"/></svg>';

// config : { source: dataURL de la photo d'origine (reduite), cadrage?: { k, ox, oy },
//            onValider(urlCarree, cadrage), onAutre?() }
// Fermer la fenetre (croix, Echap) = annuler : rien n'est modifie.
function photoCadrageOuvrir(config) {
  if (typeof document === 'undefined' || typeof ouvrirFenetreERIP !== 'function') { return; }
  var img = new Image();
  img.onload = function () {
    var etat = photoCadrageEtatInitial(img.naturalWidth, img.naturalHeight);
    photoCadrageRestaurer(etat, config.cadrage);

    var contenu =
      '<p class="text-muted small mb-2">Faites glisser la photo pour placer ce que vous voulez garder dans le cadre, puis agrandissez ou r&eacute;duisez si besoin. Vous pouvez aussi utiliser les fl&egrave;ches du clavier.</p>' +
      '<div class="photo-cadrage-corps">' +
        '<div>' +
          '<div class="photo-cadrage-zone" id="photoCadrageZone" tabindex="0" aria-label="Zone de cadrage. Fl&egrave;ches pour d&eacute;placer, plus et moins pour zoomer.">' +
            '<img id="photoCadrageImg" alt="" style="width:' + etat.larg + 'px;height:' + etat.haut + 'px">' +
            '<div class="photo-cadrage-guide" aria-hidden="true">' + _PHOTO_CADRAGE_SVG_GUIDE + '</div>' +
          '</div>' +
          '<div class="photo-cadrage-zoom">' +
            '<button type="button" class="btn btn-sm btn-outline-secondary" id="photoCadrageMoins" aria-label="R&eacute;duire">&minus;</button>' +
            '<input type="range" id="photoCadrageCurseur" min="100" max="' + (PHOTO_CADRAGE_ZOOM_MAX * 100) + '" step="1" value="100" aria-label="Niveau de zoom">' +
            '<button type="button" class="btn btn-sm btn-outline-secondary" id="photoCadragePlus" aria-label="Agrandir">+</button>' +
          '</div>' +
          '<button type="button" class="btn btn-sm btn-outline-secondary mt-2" id="photoCadrageRecentrer">Recentrer</button>' +
        '</div>' +
        '<div>' +
          '<p class="fw-semibold mb-1">Ce que verra le CV</p>' +
          '<div class="photo-cadrage-apercus">' +
            '<figure><canvas id="photoCadrageApCarre" width="96" height="96"></canvas>Photo carr&eacute;e</figure>' +
            '<figure><canvas id="photoCadrageApRond" width="96" height="96"></canvas>Photo ronde</figure>' +
          '</div>' +
          '<div class="photo-cadrage-encart">Sur un CV avec photo <b>ronde</b>, seule la partie dans le cercle (trait pointill&eacute;) reste visible. Le carr&eacute; est utilis&eacute; tel quel par les autres mod&egrave;les.</div>' +
          '<div class="photo-cadrage-encart photo-cadrage-encart-alerte" id="photoCadrageFlou" style="display:none"><b>Photo un peu floue.</b> R&eacute;duisez le zoom ou choisissez une photo plus grande pour un rendu net.</div>' +
          '<p class="text-muted small mt-2 mb-0" id="photoCadrageInfo"></p>' +
        '</div>' +
      '</div>' +
      '<div class="photo-cadrage-pied">' +
        (config.onAutre ? '<button type="button" class="btn btn-outline-secondary" id="photoCadrageAutre">Choisir une autre photo</button>' : '<span></span>') +
        '<span class="photo-cadrage-pied-droite">' +
          '<button type="button" class="btn btn-outline-secondary" id="photoCadrageAnnuler">Annuler</button>' +
          '<button type="button" class="btn btn-primary" id="photoCadrageValider">Valider le cadrage</button>' +
        '</span>' +
      '</div>';

    ouvrirFenetreERIP({ titre: 'Cadrer ma photo', contenuHTML: contenu, taille: 'large' });

    var $ = function (id) { return document.getElementById(id); };
    var zone = $('photoCadrageZone'), imEl = $('photoCadrageImg');
    imEl.src = config.source;

    function dessiner(canvas, rond) {
      var r = photoCadrageRegion(etat), ctx = canvas.getContext('2d'), t = canvas.width;
      ctx.clearRect(0, 0, t, t); ctx.save();
      if (rond) { ctx.beginPath(); ctx.arc(t / 2, t / 2, t / 2, 0, Math.PI * 2); ctx.clip(); }
      ctx.drawImage(img, r.sx, r.sy, r.cote, r.cote, 0, 0, t, t);
      ctx.restore();
    }
    function appliquer() {
      imEl.style.transform = 'translate(' + etat.ox + 'px,' + etat.oy + 'px) scale(' + etat.k + ')';
      $('photoCadrageCurseur').value = photoCadragePourcent(etat);
      dessiner($('photoCadrageApCarre'), false);
      dessiner($('photoCadrageApRond'), true);
      $('photoCadrageFlou').style.display = photoCadrageEstFloue(etat) ? '' : 'none';
      var r = photoCadrageRegion(etat);
      $('photoCadrageInfo').textContent = 'Zoom ' + photoCadragePourcent(etat) + ' %. Partie gardée : ' + Math.round(r.cote) + ' x ' + Math.round(r.cote) + ' points de la photo d’origine.';
    }

    var pris = null;
    zone.addEventListener('pointerdown', function (e) {
      pris = { x: e.clientX, y: e.clientY, ox: etat.ox, oy: etat.oy };
      zone.setPointerCapture(e.pointerId); zone.classList.add('prise');
    });
    zone.addEventListener('pointermove', function (e) {
      if (!pris) { return; }
      etat.ox = pris.ox + (e.clientX - pris.x); etat.oy = pris.oy + (e.clientY - pris.y);
      photoCadrageBorner(etat); appliquer();
    });
    var lacher = function () { pris = null; zone.classList.remove('prise'); };
    zone.addEventListener('pointerup', lacher);
    zone.addEventListener('pointercancel', lacher);
    zone.addEventListener('wheel', function (e) {
      e.preventDefault();
      photoCadrageZoomer(etat, etat.k * (e.deltaY < 0 ? 1.08 : 1 / 1.08)); appliquer();
    }, { passive: false });
    zone.addEventListener('keydown', function (e) {
      var pas = e.shiftKey ? 30 : 10, ok = true;
      if (e.key === 'ArrowLeft') { photoCadrageDeplacer(etat, pas, 0); }
      else if (e.key === 'ArrowRight') { photoCadrageDeplacer(etat, -pas, 0); }
      else if (e.key === 'ArrowUp') { photoCadrageDeplacer(etat, 0, pas); }
      else if (e.key === 'ArrowDown') { photoCadrageDeplacer(etat, 0, -pas); }
      else if (e.key === '+' || e.key === '=') { photoCadrageZoomer(etat, etat.k * 1.1); }
      else if (e.key === '-') { photoCadrageZoomer(etat, etat.k / 1.1); }
      else { ok = false; }
      if (ok) { e.preventDefault(); appliquer(); }
    });
    $('photoCadrageCurseur').addEventListener('input', function () { photoCadrageZoomer(etat, etat.kmin * this.value / 100); appliquer(); });
    $('photoCadragePlus').addEventListener('click', function () { photoCadrageZoomer(etat, etat.k * 1.15); appliquer(); });
    $('photoCadrageMoins').addEventListener('click', function () { photoCadrageZoomer(etat, etat.k / 1.15); appliquer(); });
    $('photoCadrageRecentrer').addEventListener('click', function () {
      var neuf = photoCadrageEtatInitial(etat.larg, etat.haut);
      etat.k = neuf.k; etat.ox = neuf.ox; etat.oy = neuf.oy; appliquer();
    });
    $('photoCadrageAnnuler').addEventListener('click', function () { fermerFenetreERIP(); });
    if (config.onAutre) {
      $('photoCadrageAutre').addEventListener('click', function () { fermerFenetreERIP(); config.onAutre(); });
    }
    $('photoCadrageValider').addEventListener('click', function () {
      var c = document.createElement('canvas'); c.width = PHOTO_CADRAGE_SORTIE; c.height = PHOTO_CADRAGE_SORTIE;
      var r = photoCadrageRegion(etat);
      c.getContext('2d').drawImage(img, r.sx, r.sy, r.cote, r.cote, 0, 0, PHOTO_CADRAGE_SORTIE, PHOTO_CADRAGE_SORTIE);
      var url = c.toDataURL('image/jpeg', 0.85);
      fermerFenetreERIP();
      config.onValider(url, { k: etat.k, ox: etat.ox, oy: etat.oy });
    });

    appliquer();
    zone.focus();
  };
  img.onerror = function () { if (config.onErreur) { config.onErreur('Impossible de lire cette image, essayez-en une autre.'); } };
  img.src = config.source;
}

// Reduit la photo d'origine (garde pour "Ajuster le cadrage" plus tard) : cote max PHOTO_CADRAGE_ORIGINAL_MAX.
function photoCadrageReduireOriginal(img) {
  var r = Math.min(1, PHOTO_CADRAGE_ORIGINAL_MAX / Math.max(img.naturalWidth, img.naturalHeight));
  var c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * r); c.height = Math.round(img.naturalHeight * r);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.85);
}

if (typeof window !== 'undefined') {
  window.photoCadrageOuvrir = photoCadrageOuvrir;
  window.photoCadrageReduireOriginal = photoCadrageReduireOriginal;
}

if (typeof module !== 'undefined') {
  module.exports = {
    PHOTO_CADRAGE_ZONE: PHOTO_CADRAGE_ZONE, PHOTO_CADRAGE_SORTIE: PHOTO_CADRAGE_SORTIE, PHOTO_CADRAGE_ZOOM_MAX: PHOTO_CADRAGE_ZOOM_MAX,
    photoCadrageEtatInitial: photoCadrageEtatInitial, photoCadrageBorner: photoCadrageBorner,
    photoCadrageZoomer: photoCadrageZoomer, photoCadrageDeplacer: photoCadrageDeplacer,
    photoCadrageRegion: photoCadrageRegion, photoCadragePourcent: photoCadragePourcent,
    photoCadrageEstFloue: photoCadrageEstFloue, photoCadrageRestaurer: photoCadrageRestaurer
  };
}
