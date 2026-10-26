'use strict';
// FORMES DECORATIVES du CV (modules/cv-pdf-html/cvPdfFormesDeco.js, tache A2) : les parties pures (nettoyage, geometrie, HTML) se testent sans navigateur.
// Ce que garantit ce test : jamais plus de quatre formes, jamais une valeur inconnue, jamais de forme hors de la page sans que la personne l'ait voulu,
// jamais de page modifiee quand il n'y a aucune forme, une transparence toujours plafonnee (le texte reste lisible).

const test = require('node:test');
const assert = require('node:assert');
const m = require('../modules/cv-pdf-html/cvPdfFormesDeco.js');
const D = m._FORMES_DECO;

test('sans forme, le calque est vide : une page sans forme n\'est jamais modifiée', () => {
  assert.strictEqual(m._formesDecoHtml([], { pageL: 794, pageH: 1123 }), '');
  assert.strictEqual(m._formesDecoHtml(null), '');
  assert.strictEqual(m._formesDecoHtml('n\'importe quoi'), '');
});

test('au plus sept formes, et les valeurs inconnues sont remplacées par des valeurs sûres', () => {
  const dix = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(() => m._formesDecoParDefaut());
  assert.strictEqual(m._formesDecoNormaliser(dix).length, D.MAX);
  assert.strictEqual(D.MAX, 7);
  const sale = m._formesDecoNormaliser([{ forme: 'étoile', zone: 'ailleurs', taille: 'énorme', transp: 'opaque', couleur: 'rouge', teinte: 'rouge vif', flip: 'oui' }, null, 'texte', 12])[0];
  assert.deepStrictEqual([sale.forme, sale.zone, sale.taille, sale.transp, sale.couleur, sale.teinte, sale.flip], ['rond', 'hd', 'M', 'leger', 'cv', '#9db8d9', true]);
});

test('placement libre : les nombres sont bornés, la taille passe en « perso »', () => {
  const f = m._formesDecoNormaliser([{ forme: 'anneau', zone: 'libre', taille: 'M', fx: 99, fy: -99, fw: 50 }])[0];
  assert.strictEqual(f.taille, 'perso');
  assert.ok(f.fx <= 1.2 && f.fy >= -1 && f.fw <= 1.3, JSON.stringify(f));
  const g = m._formesDecoNormaliser([{ forme: 'rond', zone: 'libre', fx: 'abc', fy: null, fw: undefined }])[0];
  assert.ok(Number.isFinite(g.fx) && Number.isFinite(g.fy) && Number.isFinite(g.fw), 'une valeur illisible reçoit une valeur de départ');
});

test('géométrie : chaque zone a une position, la taille suit le choix, le A5 réduit tout dans la même proportion', () => {
  D.ZONES.forEach((z) => {
    const g = m._formesDecoGeometrie({ forme: 'rond', zone: z.id, taille: 'M' }, { pageL: 794, pageH: 1123, enteteBas: 200 });
    assert.ok(/left:|right:/.test(g.pos) && /top:|bottom:/.test(g.pos), z.id + ' : position incomplète (' + g.pos + ')');
    assert.strictEqual(g.w, 250);
  });
  const a4 = m._formesDecoGeometrie({ forme: 'rond', zone: 'hd', taille: 'L' }, { pageL: 794, pageH: 1123 });
  const a5 = m._formesDecoGeometrie({ forme: 'rond', zone: 'hd', taille: 'L' }, { pageL: 397, pageH: 561 });
  assert.strictEqual(a4.w, 380);
  assert.strictEqual(a5.w, 190);
  D.TAILLES.forEach((t) => { assert.ok(m._formesDecoGeometrie({ forme: 'rond', zone: 'hg', taille: t.id }).w <= 794); });
});

test('géométrie : « sous l\'en-tête » suit le bas de l\'en-tête mesuré, « derrière le nom » reste dans l\'en-tête', () => {
  const sous = m._formesDecoGeometrie({ forme: 'lame', zone: 'sous', taille: 'L' }, { pageL: 794, pageH: 1123, enteteBas: 300 });
  assert.ok(/top:292px/.test(sous.pos), sous.pos);
  const nom = m._formesDecoGeometrie({ forme: 'rond', zone: 'nom', taille: 'S' }, { pageL: 794, pageH: 1123, enteteBas: 300 });
  const top = parseInt(/top:(\d+)px/.exec(nom.pos)[1], 10);
  assert.ok(top >= 24 && top + nom.h <= 300 + 80, nom.pos);
  // sans mesure, une valeur de départ raisonnable
  assert.ok(/top:\d+px/.test(m._formesDecoGeometrie({ forme: 'lame', zone: 'sous', taille: 'M' }, {}).pos));
});

test('les formes orientées se retournent dans les zones de droite, et « Retourner la forme » inverse le sens', () => {
  const gauche = m._formesDecoGeometrie({ forme: 'triangle', zone: 'hg', taille: 'M' }, {});
  const droite = m._formesDecoGeometrie({ forme: 'triangle', zone: 'hd', taille: 'M' }, {});
  assert.strictEqual(gauche.miroir, false);
  assert.strictEqual(droite.miroir, true);
  assert.strictEqual(m._formesDecoGeometrie({ forme: 'triangle', zone: 'hd', taille: 'M', flip: true }, {}).miroir, false);
  assert.strictEqual(m._formesDecoGeometrie({ forme: 'rond', zone: 'hd', taille: 'M' }, {}).miroir, false, 'un rond n\'a pas de sens');
});

test('le calque ne capte aucun clic, ne crée pas de pile d\'empilement (le mélange agit sur le CV) et plafonne la transparence', () => {
  const liste = m._formesDecoNormaliser([m._formesDecoParDefaut(), m._formesDecoSuivante(1), m._formesDecoSuivante(2), m._formesDecoSuivante(3)]);
  const html = m._formesDecoHtml(liste, { pageL: 794, pageH: 1123, enteteBas: 200 });
  assert.ok(/^<div class="formes-deco" aria-hidden="true" style="position:absolute;[^"]*overflow:hidden;pointer-events:none;">/.test(html), 'enveloppe positionnée, qui coupe ce qui dépasse, sans clic');
  assert.ok(!/class="formes-deco"[^>]*z-index/.test(html), 'l\'enveloppe ne porte pas de z-index (sinon le mélange ne verrait pas le CV)');
  assert.strictEqual((html.match(/class="forme-deco"/g) || []).length, 4);
  assert.strictEqual((html.match(/pointer-events:none/g) || []).length, 5);
  (html.match(/opacity:([0-9.]+)/g) || []).forEach((o) => { assert.ok(parseFloat(o.slice(8)) <= 0.5, 'transparence trop forte : ' + o); });
  assert.ok(/mix-blend-mode:multiply/.test(html));
});

test('couleurs : couleur du CV (variable du gabarit), couleur claire choisie, gris', () => {
  assert.ok(/var\(--cv/.test(m._formesDecoCouleurCss({ couleur: 'cv' })));
  assert.strictEqual(m._formesDecoCouleurCss({ couleur: 'claire', teinte: '#f0b4a8' }), '#f0b4a8');
  assert.strictEqual(m._formesDecoCouleurCss({ couleur: 'claire' }), '#9db8d9');
  assert.strictEqual(m._formesDecoCouleurCss({ couleur: 'gris' }), '#8a8f98');
});

test('les formes qui suivent la première sont différentes et réparties sur la page (elles ne s\'empilent pas), jusqu\'à sept', () => {
  const liste = [m._formesDecoParDefaut()];
  for (let i = 1; i < D.MAX; i++) { liste.push(m._formesDecoSuivante(i, liste)); }
  const l = m._formesDecoNormaliser(liste);
  assert.strictEqual(l.length, 7);
  assert.strictEqual(new Set(l.map((f) => f.zone)).size, 7, 'sept zones différentes');
  assert.strictEqual(new Set(l.map((f) => f.forme)).size, 7, 'sept formes différentes');
});

test('le catalogue : chaque forme a un nom, une petite image et un dessin (svg ou css) ; les formes étirables sont celles qu\'on peut déformer', () => {
  const ids = D.FORMES.map((f) => f.id);
  ['rond', 'anneau', 'demi', 'triangle', 'lame', 'bande', 'ovale', 'pilule', 'rectarrondi', 'losange', 'hexagone', 'points', 'hachures'].forEach((id) => assert.ok(ids.includes(id), 'forme absente : ' + id));
  assert.strictEqual(new Set(ids).size, ids.length, 'identifiants en double');
  D.FORMES.forEach((f) => {
    assert.ok(f.nom && f.ico, f.id + ' : nom ou petite image manquants');
    assert.ok(f.svg || f.css, f.id + ' : aucun dessin');
    assert.ok(f.w > 0 && f.ratio > 0, f.id + ' : proportions invalides');
  });
  ['ovale', 'pilule', 'rectarrondi', 'losange', 'hexagone', 'points', 'hachures'].forEach((id) => assert.ok(D.FORMES.find((f) => f.id === id).etirable, id + ' doit être étirable'));
  ['rond', 'anneau', 'demi', 'triangle', 'lame'].forEach((id) => assert.ok(!D.FORMES.find((f) => f.id === id).etirable, id + ' ne s\'étire pas'));
});

test('une forme étirable garde les proportions que la personne a réglées, les autres les ignorent', () => {
  const ovale = m._formesDecoNormaliser([{ forme: 'ovale', zone: 'libre', fx: 0.2, fy: 0.1, fw: 0.5, fr: 0.2 }])[0];
  assert.strictEqual(ovale.fr, 0.2);
  assert.strictEqual(m._formesDecoGeometrie(ovale, { pageL: 794, pageH: 1123 }).h, Math.round(Math.round(0.5 * 794) * 0.2));
  const rond = m._formesDecoNormaliser([{ forme: 'rond', zone: 'libre', fx: 0.2, fy: 0.1, fw: 0.5, fr: 0.2 }])[0];
  assert.strictEqual(rond.fr, undefined, 'un rond reste rond');
  const borne = m._formesDecoNormaliser([{ forme: 'pilule', zone: 'libre', fw: 0.4, fr: 999 }])[0];
  assert.ok(borne.fr <= 3, 'proportions bornées');
});

test('« Autour du métier » : une forme étirable entoure le titre, les autres se centrent dessus, sans titre on retombe derrière le nom', () => {
  const ctx = { pageL: 794, pageH: 1123, enteteBas: 200, metier: { x: 300, y: 120, w: 200, h: 24 } };
  const ovale = m._formesDecoGeometrie({ forme: 'ovale', zone: 'metier', taille: 'M' }, ctx);
  assert.ok(ovale.w > 200 && ovale.h > 24, 'l\'ovale est plus grand que le texte');
  const g = /left:(-?\d+)px;top:(-?\d+)px/.exec(ovale.pos);
  assert.ok(parseInt(g[1], 10) < 300 && parseInt(g[2], 10) < 120, 'l\'ovale commence avant le texte : ' + ovale.pos);
  assert.ok(parseInt(g[1], 10) + ovale.w > 500, 'et finit après lui');
  const rond = m._formesDecoGeometrie({ forme: 'rond', zone: 'metier', taille: 'S' }, ctx);
  assert.strictEqual(rond.w, 160);
  const cx = /left:(-?\d+)px/.exec(rond.pos)[1];
  assert.ok(Math.abs(parseInt(cx, 10) + rond.w / 2 - 400) <= 1, 'centré sur le titre');
  const sans = m._formesDecoGeometrie({ forme: 'ovale', zone: 'metier', taille: 'M' }, { pageL: 794, pageH: 1123, enteteBas: 200 });
  assert.ok(/left:70px/.test(sans.pos), 'sans titre de métier : derrière le nom (' + sans.pos + ')');
});

test('les formes en css (pilule, rectangle arrondi, points, hachures) n\'ont pas de dessin svg et gardent le même calque', () => {
  const html = m._formesDecoHtml([{ forme: 'pilule', zone: 'hd', taille: 'M' }, { forme: 'points', zone: 'bas', taille: 'M' }, { forme: 'ovale', zone: 'mil', taille: 'S' }], { pageL: 794, pageH: 1123 });
  assert.ok(/border-radius:9999px/.test(html) && /radial-gradient/.test(html));
  assert.strictEqual((html.match(/<svg/g) || []).length, 1, 'seule l\'ovale est un dessin');
  assert.strictEqual((html.match(/class="forme-deco"/g) || []).length, 3);
});

test('la forme ajoutée évite les zones déjà prises, même quand la personne a déplacé les précédentes', () => {
  // la première forme est déjà « autour du métier » : l'ajout ne retombe pas dessus
  const liste = [{ forme: 'ovale', zone: 'metier', taille: 'M', transp: 'leger', couleur: 'cv' }];
  const zones = [liste[0].zone];
  for (let i = 1; i < D.MAX; i++) { const f = m._formesDecoSuivante(i, liste); assert.ok(!zones.includes(f.zone), 'zone déjà prise : ' + f.zone); zones.push(f.zone); liste.push(f); }
  assert.strictEqual(new Set(zones).size, 7);
  // sans liste (ancien appel), une proposition valable
  assert.ok(m._formesDecoSuivante(1) && m._formesDecoSuivante(1).zone);
});

test('remplissage : plein (couleur transparente en relief), vide (boîte transparente, fenêtre masquée dessous : jamais de texte caché), contour (trait) ; un motif n\'a pas de contour', () => {
  const ctx = { pageL: 794, pageH: 1123, papier: 'rgb(250, 248, 240)' };
  const plein = m._formesDecoHtml([{ forme: 'ovale', zone: 'hd', taille: 'M' }], ctx);
  assert.ok(/mix-blend-mode:multiply/.test(plein) && /opacity:0\.28/.test(plein) && /data-style="plein"/.test(plein));
  const vide = m._formesDecoHtml([{ forme: 'ovale', zone: 'hd', taille: 'M', style: 'vide', transp: 'moyen', couleur: 'gris' }], ctx);
  assert.ok(/data-style="vide"/.test(vide) && !/mix-blend-mode/.test(vide) && /color:transparent/.test(vide) && !/<svg/.test(vide) && !/background:currentColor/.test(vide), 'la boîte d\u2019une forme vide ne dessine rien (ni couleur, ni papier) : ' + vide.slice(0, 300));
  const contour = m._formesDecoHtml([{ forme: 'ovale', zone: 'hd', taille: 'M', style: 'contour' }, { forme: 'pilule', zone: 'mil', taille: 'M', style: 'contour' }], ctx);
  assert.ok(/data-style="contour"/.test(contour) && /color:transparent/.test(contour) && !/<svg/.test(contour) && !/border:3px/.test(contour) && !/mix-blend-mode/.test(contour), 'la boîte d\u2019un contour ne dessine rien : le trait vient de la fenêtre masquée : ' + contour.slice(0, 200));
  const ov = m._FORMES_DECO.FORMES.find((x) => x.id === 'ovale');
  const anneauMasque = m._formesDecoMasqueContour(ov, { rot: 30 }, { x: 10, y: 20, w: 200, h: 90 }, 794, 1123, false, []);
  assert.ok(/<mask/.test(anneauMasque) && /stroke="#fff"/.test(anneauMasque) && /rotate\(30\)/.test(anneauMasque) && /vector-effect="non-scaling-stroke"/.test(anneauMasque) && !/currentColor/.test(anneauMasque), 'le masque du contour est un anneau tourné avec la forme');
  const coupe = m._formesDecoMasqueContour(ov, {}, { x: 10, y: 20, w: 200, h: 90 }, 794, 1123, false, [{ x: 50, y: 60, w: 80, h: 12 }]);
  assert.ok(/<rect x="48" y="59" width="84" height="14" fill="#000"\/>/.test(coupe), 'une ligne de texte croisée devient un vide dans le trait');
  assert.strictEqual(m._formesDecoNormaliser([{ forme: 'rond', style: 'contour', croise: 'coupe' }])[0].croise, 'coupe');
  assert.strictEqual(m._formesDecoNormaliser([{ forme: 'rond', style: 'contour' }])[0].croise, undefined, 'par defaut le trait reste entier et les lettres changent de couleur');
  assert.strictEqual(m._formesDecoNormaliser([{ forme: 'anneau', zone: 'hd', style: 'contour' }, { forme: 'lame', zone: 'hd', style: 'contour' }]).map((x) => x.style).join(), 'plein,plein', 'un anneau ou une lame effilée n\u2019a pas de contour');
  const motif = m._formesDecoNormaliser([{ forme: 'points', zone: 'hd', style: 'contour' }, { forme: 'hachures', zone: 'hd', style: 'vide' }]);
  assert.strictEqual(motif[0].style, 'plein', 'un motif ne se met pas en contour');
  assert.strictEqual(motif[1].style, 'vide', 'une forme vide en motif est possible');
  const ovale = m._FORMES_DECO.FORMES.find((x) => x.id === 'ovale'), pil = m._FORMES_DECO.FORMES.find((x) => x.id === 'pilule'), pts = m._FORMES_DECO.FORMES.find((x) => x.id === 'points');
  const masque = m._formesDecoMasqueSvg(ovale, { rot: 90 }, { x: 100, y: 50, w: 200, h: 90 }, 794, 1123, false);
  assert.ok(/<svg/.test(masque) && /rotate\(90\)/.test(masque) && /fill="#000"/.test(masque) && !/currentColor/.test(masque) && /viewBox="0 0 794 1123"/.test(masque), 'le masque porte la forme, sa place et sa rotation : ' + masque.slice(0, 200));
  assert.ok(/scale\(-1 1\)/.test(m._formesDecoMasqueSvg(ovale, {}, { x: 0, y: 0, w: 10, h: 10 }, 794, 1123, true)), 'une forme retournée a un masque retourné');
  assert.ok(/rx="45"/.test(m._formesDecoMasqueSvg(pil, {}, { x: 0, y: 0, w: 200, h: 90 }, 794, 1123, false)) && /<pattern/.test(m._formesDecoMasqueSvg(pts, {}, { x: 0, y: 0, w: 200, h: 90 }, 794, 1123, false)), 'pilule arrondie, points en motif');
  assert.strictEqual(m._formesDecoNormaliser([{ forme: 'rond', style: 'vide', traits: false }])[0].traits, false);
  assert.strictEqual(m._formesDecoNormaliser([{ forme: 'rond', style: 'vide' }])[0].traits, undefined, 'les zones colorees restent visibles par defaut');
  assert.strictEqual(m._formesDecoNormaliser([{ forme: 'rond', style: 'inconnu' }])[0].style, 'plein');
});

test('formes decoratives : l\u2019orientation (rotation 2D) est nettoyee, gardee seulement si elle n\u2019est pas nulle, et posee dans le calque', () => {
  const m = require('../modules/cv-pdf-html/cvPdfFormesDeco.js');
  const l = m._formesDecoNormaliser([{ forme: 'ovale', zone: 'hd', rot: 90 }, { forme: 'rond', zone: 'hd', rot: 400 }, { forme: 'losange', zone: 'hd', rot: 'beaucoup' }, { forme: 'ovale', zone: 'hd', rot: 0 }, { forme: 'ovale', zone: 'hd', rot: -45 }]);
  assert.deepStrictEqual(l.map((f) => f.rot), [90, 40, undefined, undefined, -45]);
  assert.strictEqual(m._formesDecoGeometrie(l[0], {}).rot, 90);
  assert.ok(/transform:rotate\(90deg\)/.test(m._formesDecoHtml([l[0]], {})));
  assert.ok(/transform:rotate\(-45deg\) scaleX\(-1\)/.test(m._formesDecoHtml([Object.assign({}, l[4], { flip: true })], {})));
  assert.ok(!/rotate/.test(m._formesDecoHtml([l[3]], {})));
});

// ---- Style aléatoire des formes (Denis, 2026-10-20) : 100 tirages ----
test('style aléatoire : 100 tirages, 1 à 2 formes, entières dans la page, sans se chevaucher ni se toucher, jamais sur la photo ni le nom', () => {
  const m = require('../modules/cv-pdf-html/cvPdfFormesDeco.js');
  let graine = 7; const rnd = () => { graine = (graine * 16807) % 2147483647; return (graine - 1) / 2147483646; };
  const interdits = [{ x: 30, y: 30, w: 140, h: 160 }, { x: 200, y: 60, w: 300, h: 70 }];
  const vus = {};
  for (let t = 0; t < 100; t++) {
    const liste = m._formesDecoAuHasard({ pageL: 794, pageH: 1123, interdits }, rnd);
    assert.ok(liste.length >= 1 && liste.length <= 2, 'nombre de formes : ' + liste.length);
    vus[liste.length] = true;
    const boites = liste.map((f) => {
      assert.strictEqual(f.zone, 'libre');
      const g = m._formesDecoGeometrie(f, { pageL: 794, pageH: 1123 }), rad = (f.rot || 0) * Math.PI / 180;
      const bw = Math.abs(g.w * Math.cos(rad)) + Math.abs(g.h * Math.sin(rad)), bh = Math.abs(g.w * Math.sin(rad)) + Math.abs(g.h * Math.cos(rad));
      const cx = f.fx * 794 + g.w / 2, cy = f.fy * 1123 + g.h / 2;
      return { x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh };
    });
    boites.forEach((b, i) => {
      assert.ok(b.x >= -3 && b.y >= -3 && b.x + b.w <= 794 + 3 && b.y + b.h <= 1123 + 3, 'forme hors de la page');
      interdits.forEach((z) => assert.ok(!(b.x < z.x + z.w && b.x + b.w > z.x && b.y < z.y + z.h && b.y + b.h > z.y), 'forme sur la photo ou le nom'));
      boites.slice(i + 1).forEach((c) => assert.ok(!(b.x < c.x + c.w + 8 && b.x + b.w + 8 > c.x && b.y < c.y + c.h + 8 && b.y + b.h + 8 > c.y), 'deux formes se touchent'));
    });
  }
  assert.deepStrictEqual(Object.keys(vus).sort(), ['1', '2'], 'les deux nombres de formes sortent');
});

// ---- Impression : le moteur d'impression de Chrome et d'Edge ignore les masques, les formes vide et contour sont redessinees en vectoriel (essai d'impression reel, 2026-10-21) ----
const trouver = (id) => D.FORMES.filter((F) => F.id === id)[0];

test('impression : chaque forme dessinable a un contour en points, les motifs n\'en ont pas', () => {
  D.FORMES.forEach((F) => {
    const an = m._formesDecoAnneauxLocaux(F, 200, 100);
    if (F.id === 'points' || F.id === 'hachures') { assert.strictEqual(an, null, F.id + ' : un motif n\'a pas de contour'); return; }
    assert.ok(Array.isArray(an) && an.length >= 1 && an[0].length >= 3, F.id + ' : contour attendu');
    an.forEach((a) => a.forEach((p) => assert.ok(isFinite(p[0]) && isFinite(p[1]), F.id + ' : point fini')));
  });
  assert.strictEqual(m._formesDecoAnneauxLocaux(trouver('anneau'), 100, 100).length, 2, 'un anneau a un trou');
});

test('impression : le triangle garde ses trois sommets, a sa place, avec rotation et miroir', () => {
  const T = trouver('triangle');
  const sans = m._formesDecoAnneauxPage(T, { rot: 0 }, { x: 100, y: 50, w: 200, h: 200 }, false)[0];
  assert.deepStrictEqual(sans, [[100, 50], [300, 50], [100, 250]]);
  const miroir = m._formesDecoAnneauxPage(T, { rot: 0 }, { x: 100, y: 50, w: 200, h: 200 }, true)[0];
  assert.deepStrictEqual(miroir, [[300, 50], [100, 50], [300, 250]]);
  const tourne = m._formesDecoAnneauxPage(T, { rot: 90 }, { x: 100, y: 50, w: 200, h: 200 }, false)[0];
  assert.deepStrictEqual(tourne.map((p) => p.map(Math.round)), [[300, 50], [300, 250], [100, 50]]);
});

test('impression : le chemin est un contour ferme par anneau (evenodd), prêt pour clip-path:path()', () => {
  const an = m._formesDecoAnneauxPage(trouver('anneau'), { rot: 0 }, { x: 0, y: 0, w: 100, h: 100 }, false);
  const chemin = m._formesDecoCheminAnneaux(an);
  assert.strictEqual((chemin.match(/M/g) || []).length, 2);
  assert.strictEqual((chemin.match(/Z/g) || []).length, 2);
  assert.ok(/^M[\d. \-L]+Z/.test(chemin));
});
