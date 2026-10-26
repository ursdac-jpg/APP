'use strict';
// COMPOSITIONS du CV (modules/cv-pdf-html/cvPdfCompositions.js) : les parties pures (liste, couleurs, calcul des zones) se testent sans navigateur.
// Ce que garantit ce test : un identifiant inconnu n'est jamais retenu, le texte se lit toujours (contraste suffisant, quelle que soit la couleur du CV),
// aucun decor ne recouvre le corps du CV (debord limite a la place mesuree), l'equerre du bas n'est jamais dessinee sur un CV qui remplit la page.

const test = require('node:test');
const assert = require('node:assert');
const c = require('../modules/cv-pdf-html/cvPdfCompositions.js');

const MESURES = { pageL: 794, pageH: 1123, H: 225, gauche: 235, droite: 300, droiteMetier: 740, topCorps: 250, bordG: 38, bordD: 756, basCorps: 930, couleur: '#2f6690' };

test('huit compositions pour une colonne, dont l\'équerre ; ruban et quarts de cercle n\'existent qu\'à une colonne', () => {
  const une = c._compoListePour(1).map((s) => s.id);
  assert.deepStrictEqual(une, ['equerre', 'plaque', 'diagonale', 'l', 'volets', 'etiquette', 'ruban', 'quart']);
  const deux = c._compoListePour(2).map((s) => s.id);
  assert.ok(deux.indexOf('equerre') !== -1 && deux.indexOf('ruban') === -1 && deux.indexOf('quart') === -1);
});

test('un identifiant inconnu devient « comme aujourd\'hui », jamais une exception', () => {
  assert.strictEqual(c._compoNormaliser('plaque'), 'plaque');
  assert.strictEqual(c._compoNormaliser('n\'importe quoi'), '');
  assert.strictEqual(c._compoNormaliser(null), '');
  assert.strictEqual(c._compoNormaliser(12), '');
  assert.strictEqual(c._compoCalculer('inconnue', MESURES), null);
});

test('les modèles sans en-tête horizontal sont exclus', () => {
  ['creatif:frise', 'creatif:bandeauVertical', 'sobre:mq-rectangles', 'sobre:mq-photo'].forEach((cle) => assert.ok(c._compoModeleExclu(cle), cle));
  assert.ok(!c._compoModeleExclu('sobre:mq-technique'));
});

test('couleurs : mélange avec du blanc, jamais de transparence ; le texte choisi se lit', () => {
  assert.strictEqual(c._compoMelanger('#000000', 1), '#ffffff');
  assert.strictEqual(c._compoMelanger('#000000', 0), '#000000');
  assert.strictEqual(c._compoMelanger('#2f6690', 0.5).length, 7);
  // un ton moyen (rouge vif, gris) ne donne ni avec le blanc ni avec le sombre un contraste suffisant : la couleur est ajustee juste ce qu'il faut
  ['#000000', '#ffffff', '#2f6690', '#ffd400', '#e63946', '#1e3a5f', '#cccccc', '#808080'].forEach((brut) => {
    const fond = c._compoLisible(brut);
    assert.ok(c._compoContraste(c._compoCouleurTexte(fond), fond) >= 4.5, 'texte illisible sur ' + brut);
  });
  assert.strictEqual(c._compoLisible('#2f6690'), '#2f6690', 'une couleur déjà lisible ne change pas');
});

test('quelle que soit la couleur du CV, le texte posé sur chaque zone se lit (contraste d\'au moins 4,5)', () => {
  ['#000000', '#ffffff', '#2f6690', '#ffd400', '#e63946', '#1e3a5f', '#7a7a7a'].forEach((couleur) => {
    ['plaque', 'diagonale', 'l', 'volets', 'etiquette', 'quart'].forEach((id) => {
      const d = c._compoCalculer(id, Object.assign({}, MESURES, { couleur }));
      d.zones.filter((z) => z.texte).forEach((z) => {
        assert.ok(c._compoContraste(c._compoCouleurTexte(z.fill), z.fill) >= 4.5, id + ' sur ' + couleur + ' : texte illisible sur ' + z.fill);
      });
    });
  });
});

test('le nom et les coordonnées sont du côté clair de la diagonale, le métier du côté foncé', () => {
  const d = c._compoCalculer('diagonale', MESURES);
  const fond = (x, y) => c._compoFondEn(d.zones, x, y);
  [20, 100, 200].forEach((y) => assert.strictEqual(fond(235, y), c._compoMelanger('#2f6690', 0.85), 'nom à y=' + y));
  [20, 100, 200].forEach((y) => assert.strictEqual(fond(300, y), '#2f6690', 'métier à y=' + y));
});

test('même avec un nom très long, la diagonale ne coupe jamais le texte du nom : elle se pousse vers la droite', () => {
  const d = c._compoCalculer('diagonale', Object.assign({}, MESURES, { gauche: 290, droite: 320 }));
  const fond = (x, y) => c._compoFondEn(d.zones, x, y);
  [10, 110, 220].forEach((y) => assert.strictEqual(fond(290, y), c._compoMelanger('#2f6690', 0.85), 'bord du nom à y=' + y));
});

test('aucun décor ne recouvre le corps du CV : le débord sous l\'en-tête est limité à la place mesurée', () => {
  // Modèle Technique : le premier élément du corps commence à 10 px sous l'en-tête
  const serre = Object.assign({}, MESURES, { H: 225, topCorps: 235 });
  ['etiquette', 'ruban', 'volets'].forEach((id) => {
    const d = c._compoCalculer(id, serre);
    d.zones.forEach((z) => {
      const m = /height:(\d+)px/.exec(z.css), top = /top:(\d+)px/.exec(z.css);
      if (m && top && /clip-path|border-radius:0 0 22px|height/.test(z.css) && !/width:794px/.test(z.css)) { assert.ok(Number(top[1]) + Number(m[1]) <= 235 - 3, id + ' dépasse sur le corps : ' + z.css); }
    });
  });
  // Place large : le débord est plafonné
  const large = c._compoCalculer('etiquette', Object.assign({}, MESURES, { topCorps: 400 }));
  assert.ok(/height:(\d+)px/.exec(large.zones[1].css)[1] <= 225 + 16);
});

test('quarts de cercle : jamais plus grands que l\'en-tête plus la place libre', () => {
  const d = c._compoCalculer('quart', Object.assign({}, MESURES, { topCorps: 232 }));
  const l = Number(/width:(\d+)px/.exec(d.zones[0].css)[1]);
  assert.ok(l <= 225 + 34 && l <= 240);
});

test('équerre : la barre du bas n\'est dessinée que si le corps du CV la laisse libre', () => {
  assert.strictEqual(c._compoCalculer('equerre', MESURES).zones.length, 2);
  assert.strictEqual(c._compoCalculer('equerre', Object.assign({}, MESURES, { basCorps: 1100 })).zones.length, 1);
});

test('équerre : l\'épaisseur des barres suit la marge réelle du texte (jamais sur le texte)', () => {
  const d = c._compoCalculer('equerre', Object.assign({}, MESURES, { bordG: 20, bordD: 780 }));
  assert.ok(/border-left:(\d+)px/.exec(d.zones[0].css)[1] <= 12);
  assert.ok(/border-top:(\d+)px/.exec(d.zones[0].css)[1] === /border-left:(\d+)px/.exec(d.zones[0].css)[1], 'les deux barres du coin ont la même épaisseur');
});

test('ruban : le titre du métier est raccourci pour ne jamais toucher le ruban', () => {
  const d = c._compoCalculer('ruban', MESURES);
  assert.ok(d.largeurMetier && 300 + d.largeurMetier <= 668 - 10);
  assert.strictEqual(c._compoCalculer('ruban', Object.assign({}, MESURES, { droiteMetier: 500 })).largeurMetier, null);
});

test('mesures absentes : des valeurs sûres, jamais d\'exception', () => {
  c._compoListePour(1).forEach((s) => assert.ok(c._compoCalculer(s.id, {}), s.id));
});

test('L mince : le coin arrondi reste dans la marge, il ne touche jamais le texte du corps', () => {
  const d = c._compoCalculer('l', MESURES);
  const coin = d.zones[2], gauche = Number(/left:(\d+)px/.exec(coin.css)[1]), largeur = Number(/width:(\d+)px/.exec(coin.css)[1]);
  assert.ok(gauche + largeur <= MESURES.bordG, 'le coin dépasse dans le texte : ' + coin.css);
  const serre = c._compoCalculer('l', Object.assign({}, MESURES, { bordG: 24 }));
  assert.ok(Number(/left:(\d+)px/.exec(serre.zones[2].css)[1]) + Number(/width:(\d+)px/.exec(serre.zones[2].css)[1]) <= 24 + 12, 'marge serrée');
});

// ---- CV a DEUX colonnes (phase 3, 2026-10-22) ----
const M2 = Object.assign({}, MESURES, { H: 259, topCorps: 267, basGauche: 235, col: { W: 304, mainLeft: 312 } });

test('sept compositions à deux colonnes : la carte n’existe qu’à deux colonnes, le ruban et les quarts de cercle qu’à une colonne', () => {
  assert.deepStrictEqual(c._compoListePour(2).map((x) => x.id), ['equerre', 'plaque', 'diagonale', 'l', 'volets', 'etiquette', 'carte']);
  assert.ok(c._compoListePour(1).every((x) => x.id !== 'carte'));
  assert.strictEqual(c._compoCalculer('ruban', M2), null, 'pas de ruban à deux colonnes');
  assert.strictEqual(c._compoCalculer('quart', M2), null);
  assert.strictEqual(c._compoCalculer('carte', MESURES), null, 'pas de carte à une colonne');
});

test('deux colonnes : le fond de la colonne est dessiné par la composition et couvre toute sa hauteur (plaque, L, volets, étiquette)', () => {
  ['plaque', 'l', 'volets'].forEach((id) => {
    const d = c._compoCalculer(id, M2);
    const col = d.zones.filter((z) => z.forme && z.forme.w === 304 && z.forme.h === 1123);
    assert.strictEqual(col.length, 1, id);
  });
  const e = c._compoCalculer('etiquette', M2).zones[1];
  assert.ok(e.forme.w + e.forme.x === 304 && e.forme.h > 1000);
});

test('deux colonnes : le texte posé sur chaque zone se lit, quelle que soit la couleur du CV', () => {
  ['#000000', '#ffffff', '#2f6690', '#ffd400', '#e63946', '#7a7a7a'].forEach((couleur) => {
    c._compoListePour(2).forEach((st) => {
      const d = c._compoCalculer(st.id, Object.assign({}, M2, { couleur }));
      d.zones.filter((z) => z.texte).forEach((z) => assert.ok(c._compoContraste(c._compoCouleurTexte(z.fill), z.fill) >= 4.5, st.id + ' sur ' + couleur + ' : ' + z.fill));
    });
  });
});

test('deux colonnes : le titre du métier est déplacé seulement quand il toucherait la colonne ou un décor', () => {
  assert.deepStrictEqual(c._compoCalculer('plaque', Object.assign({}, M2, { droite: 300 })).blocs.metier, { left: 356, width: 390 });
  assert.strictEqual(c._compoCalculer('plaque', Object.assign({}, M2, { droite: 400 })).blocs.metier, undefined, 'déjà assez à droite');
  const diag = c._compoCalculer('diagonale', Object.assign({}, M2, { droite: 300 }));
  assert.ok(diag.blocs.metier.left >= 304 + 96 + 30 - 1);
});

test('deux colonnes : la diagonale garde la colonne verticale (jamais de teinte sous le texte de la grande colonne)', () => {
  const d = c._compoCalculer('diagonale', M2), fond = (x, y) => c._compoFondEn(d.zones, x, y);
  assert.strictEqual(fond(250, 700), c._compoTeinte('#2f6690', 0.85), 'la colonne est claire');
  assert.strictEqual(fond(320, 700), '#ffffff', 'la grande colonne reste sur le papier');
  assert.strictEqual(fond(500, 100), '#2f6690', 'le métier est sur la couleur');
});

test('deux colonnes : le coin du L est limité par la place libre ; sans place, il est droit (aucun coin dessiné)', () => {
  assert.strictEqual(c._compoCalculer('l', Object.assign({}, M2, { topCorps: 262, col: { W: 304, mainLeft: 308 } })).zones.length, 2);
  const grand = c._compoCalculer('l', Object.assign({}, M2, { topCorps: 330, col: { W: 304, mainLeft: 360 } }));
  assert.strictEqual(grand.zones.length, 3);
  const coin = grand.zones[2], larg = Number(/width:(\d+)px/.exec(coin.css)[1]);
  assert.ok(larg <= 62 && 304 + larg - 2 <= 360, 'le coin ne dépasse pas sur le texte');
});

test('deux colonnes : la carte démarre sous les coordonnées (elle ne les recouvre jamais)', () => {
  const d = c._compoCalculer('carte', Object.assign({}, M2, { basGauche: 250 }));
  const carte = d.zones.filter((z) => z.texte).pop();
  assert.ok(carte.forme.y >= 250 + 8 - 1 || carte.forme.y >= 259 - 4 - 1);
  const haute = c._compoCalculer('carte', Object.assign({}, M2, { basGauche: 100 }));
  assert.strictEqual(haute.zones.filter((z) => z.texte).pop().forme.y, 259 - 34, 'carte à sa place habituelle quand il y a de la place');
});

test('le trait sous l’en-tête n’a jamais la couleur du bandeau : gris sous un bandeau foncé, couleur du CV sous un bandeau clair', () => {
  assert.strictEqual(c._compoCouleurTrait('#2f6690', '#2f6690'), '#b8bdc7');
  assert.strictEqual(c._compoCouleurTrait('#1f2a44', '#1f2a44'), '#b8bdc7');
  assert.strictEqual(c._compoCouleurTrait('#dde4f0', '#2f6690'), '#2f6690');
  assert.strictEqual(c._compoCssVersHex('rgb(47, 102, 144)'), '#2f6690');
  assert.strictEqual(c._compoCssVersHex('rgba(0, 0, 0, 0)'), '#000000');
  assert.strictEqual(c._compoCssVersHex('transparent'), null);
  // le gris se voit sur le bandeau foncé ET sur le papier
  assert.ok(c._compoContraste('#b8bdc7', '#2f6690') > 2.2 && c._compoContraste('#b8bdc7', '#ffffff') > 1.7);
});

test('un fond translucide se compose sur la couleur du dessous : une carte claire sur une colonne foncée reste claire (jamais du texte blanc dessus)', () => {
  assert.strictEqual(c._compoComposer('#2f6690', 'rgba(255, 255, 255, 1)'), '#ffffff');
  assert.strictEqual(c._compoComposer('#2f6690', 'rgba(0, 0, 0, 0)'), '#2f6690', 'fond transparent');
  assert.strictEqual(c._compoComposer('#2f6690', 'transparent'), '#2f6690');
  assert.strictEqual(c._compoComposer('#000000', 'rgba(255, 255, 255, 0.5)'), '#808080');
  const carte = c._compoComposer('#1f2a44', 'rgba(255, 255, 255, 0.85)');
  assert.ok(c._compoLuminance(carte) > 0.5, 'la carte est claire : ' + carte);
  assert.strictEqual(c._compoCouleurTexte(carte), '#1f2933', 'texte sombre sur la carte claire');
  // une pastille translucide claire sur fond foncé reste foncée : texte blanc
  assert.strictEqual(c._compoCouleurTexte(c._compoComposer('#1f2a44', 'rgba(255, 255, 255, 0.18)')), '#ffffff');
});

test('le navigateur donne un mélange de couleurs en color(srgb ...) : il est lu comme les autres (carte claire de la grille : texte sombre, jamais blanc)', () => {
  assert.deepStrictEqual(c._compoCssRgba('rgb(47, 102, 144)'), [47, 102, 144, 1]);
  assert.deepStrictEqual(c._compoCssRgba('rgba(0, 0, 0, 0.5)'), [0, 0, 0, 0.5]);
  const carte = c._compoCssRgba('color(srgb 0.885804 0.916 0.939059)');
  assert.ok(carte && Math.round(carte[0]) === 226 && Math.round(carte[1]) === 234 && carte[3] === 1);
  assert.strictEqual(c._compoCssVersHex('color(srgb 1 1 1)'), '#ffffff');
  const surColonne = c._compoComposer('#2f6690', 'color(srgb 0.885804 0.916 0.939059)');
  assert.ok(c._compoLuminance(surColonne) > 0.7);
  assert.strictEqual(c._compoCouleurTexte(surColonne), '#1f2933');
  assert.strictEqual(c._compoCssRgba('transparent'), null);
});

// ---- Croisement du bandeau et de la colonne ----
const MC = { pageL: 794, pageH: 1123, H: 259, W: 304, mainLeft: 312, topCorps: 267, bandeauHex: '#1f2a44', bandeauCss: 'rgb(31, 42, 68)', colonneHex: '#dde4f0', colonneCss: 'rgb(221, 228, 240)', rayon: '0px', pale: false };

test('croisement : sans aucun choix, rien n’est modifié (jamais de régression)', () => {
  assert.strictEqual(c._croisementActif({}), false);
  assert.strictEqual(c._croisementActif(null), false);
  assert.strictEqual(c._croisementActif({ meme: 'non', devant: 'bandeau', angle: 'droit', lisere: false }), false);
  assert.deepStrictEqual(c._croisementNormaliser({ meme: 'oui', devant: 'x', angle: 'biseau', lisere: 'oui', autre: 1 }), { meme: 'oui' }, 'le biseau n’existe plus ; valeurs inconnues ignorées');
  assert.deepStrictEqual(c._croisementNormaliser({ devant: 'colonne', angle: 'arrondi', lisere: true }), { devant: 'colonne', angle: 'arrondi', lisere: true });
});

test('croisement : même couleur — la colonne prend la couleur du bandeau ; « devant » n’a alors plus de sens', () => {
  const d = c._croisementCalculer({ meme: 'oui', devant: 'colonne' }, MC);
  assert.ok(/col-vague-g::before[^}]*background:rgb\(31, 42, 68\) !important/.test(d.style));
  assert.ok(!/z-index:1 !important/.test(d.style), 'jamais « colonne devant » quand c’est la même couleur');
  assert.strictEqual(d.zonesTexte[0].fill, '#1f2a44', 'le texte de la colonne se règle sur le fond du bandeau');
});

test('croisement : colonne devant — la colonne passe au-dessus du bandeau et son texte se règle sur elle', () => {
  const d = c._croisementCalculer({ devant: 'colonne' }, MC);
  assert.ok(/z-index:1 !important/.test(d.style));
  assert.ok(/tete-fond::before\{content:"";position:absolute;inset:0;z-index:0;background:rgb\(31, 42, 68\)/.test(d.style), 'le fond du bandeau passe derrière');
  assert.strictEqual(d.zonesTexte[d.zonesTexte.length - 1].fill, '#dde4f0', 'la colonne est dessinée en dernier (au-dessus)');
  const pale = c._croisementCalculer({ devant: 'colonne' }, Object.assign({}, MC, { pale: true }));
  assert.ok(!/tete-fond::before/.test(pale.style), 'un bandeau pâle a déjà son fond en pseudo-élément');
});

test('croisement : angle arrondi — un seul rayon pour tous, limité par la place libre ; sans place, aucun coin', () => {
  const d = c._croisementCalculer({ angle: 'arrondi' }, Object.assign({}, MC, { mainLeft: 340, topCorps: 300 }));
  assert.strictEqual(d.zones.length, 1);
  assert.ok(d.coin >= 8 && d.coin <= 28, 'rayon ' + d.coin);
  assert.ok(304 + d.coin <= 340, 'le coin ne touche pas le texte');
  assert.strictEqual(c._croisementCalculer({ angle: 'arrondi' }, MC).zones.length, 0, 'marge de 8 px : pas de coin (trop petit pour se voir)');
  assert.strictEqual(c._croisementCalculer({}, MC).zones.length, 0);
});

test('croisement : le liseré blanc suit celui qui est devant', () => {
  const dessus = c._croisementCalculer({ lisere: true }, MC).zones[0].css, cote = c._croisementCalculer({ lisere: true, devant: 'colonne' }, MC).zones[0].css;
  assert.ok(/top:256px;width:304px;height:3px/.test(dessus), 'bandeau devant : filet horizontal sous le bandeau');
  assert.ok(/left:301px;top:0;width:3px;height:259px/.test(cote), 'colonne devant : filet vertical au bord de la colonne');
});

// ---- CV a deux colonnes, colonne a DROITE (modeles chronologiques, editorial large, colonnes inversees) ----
const MD = Object.assign({}, MESURES, { H: 293, topCorps: 293, basGauche: 274, gauche: 276, droite: 300, droiteMetier: 721, col: { droite: true, x0: 490, W: 304, mainRight: 482 } });

test('colonne à droite : les sept compositions existent, le fond de la colonne est à droite', () => {
  c._compoListePour(2).forEach((st) => assert.ok(c._compoCalculer(st.id, MD), st.id));
  const d = c._compoCalculer('l', MD);
  assert.ok(d.zones.some((z) => z.forme && z.forme.x === 490 && z.forme.w === 304 && z.forme.h === 1123), 'colonne pleine hauteur à droite');
  assert.deepStrictEqual(d.blocs, {}, 'aucun bloc de l’en-tête n’est déplacé');
});

test('colonne à droite : le titre du métier, même s’il passe au-dessus de la colonne, reste sur UN seul fond', () => {
  ['plaque', 'diagonale', 'etiquette', 'l', 'carte'].forEach((id) => {
    const d = c._compoCalculer(id, MD), fond = (x, y) => c._compoFondEn(d.zones, x, y);
    [300, 420, 500, 600, 720].forEach((x) => assert.strictEqual(fond(x, 60), fond(300, 60), id + ' : fond différent à x=' + x));
  });
});

test('colonne à droite : le texte posé sur chaque zone se lit, quelle que soit la couleur du CV', () => {
  ['#000000', '#ffffff', '#2f6690', '#ffd400', '#e63946', '#7a7a7a'].forEach((couleur) => {
    c._compoListePour(2).forEach((st) => {
      c._compoCalculer(st.id, Object.assign({}, MD, { couleur })).zones.filter((z) => z.texte).forEach((z) => assert.ok(c._compoContraste(c._compoCouleurTexte(z.fill), z.fill) >= 4.5, st.id + ' sur ' + couleur));
    });
  });
});

test('colonne à droite : la diagonale est un bandeau à bord oblique qui ne coupe jamais le texte du nom ni des coordonnées', () => {
  const d = c._compoCalculer('diagonale', MD), fond = (x, y) => c._compoFondEn(d.zones, x, y);
  assert.strictEqual(fond(100, 274), '#2f6690', 'le dernier texte à gauche reste sur la couleur');
  assert.strictEqual(fond(600, 600), c._compoTeinte('#2f6690', 0.85), 'la colonne est claire sous le bandeau');
});

test('colonne à droite : la diagonale passe sous le BAS du titre du métier, jusqu’à l’endroit où il se termine (essai d’impression, éditorial large)', () => {
  const M = Object.assign({}, MD, { H: 140, basGauche: 60, metierHaut: 80, metierBas: 118, droiteMetier: 420 });
  const d = c._compoCalculer('diagonale', M), fond = (x, y) => c._compoFondEn(d.zones, x, y);
  [100, 250, 400, 420].forEach((x) => assert.strictEqual(fond(x, 118), '#2f6690', 'le bas du titre reste sur la couleur à x=' + x));
});

test('colonne à droite : les volets sont trois teintes claires, le texte sombre se lit sur chacune', () => {
  const d = c._compoCalculer('volets', MD);
  [300, 600, 720].forEach((x) => assert.ok(c._compoContraste('#1f2933', c._compoFondEn(d.zones, x, 60)) >= 4.5));
});

// ---- Décor ajouté par-dessus le modèle (équerre, ruban, quarts de cercle, plaque) ----
const MX = Object.assign({}, MESURES, { H: 259, topCorps: 267, metierHaut: 40, metierBas: 150 });

test('décor ajouté : quatre décors, trois couleurs ; un choix inconnu ne pose rien', () => {
  assert.deepStrictEqual(c._DECORS.LISTE.map((d) => d.id), ['equerre', 'ruban', 'quarts', 'plaque']);
  assert.deepStrictEqual(c._DECORS.COULEURS.map((d) => d.id), ['', 'cv', 'gris']);
  assert.deepStrictEqual(c._decorNormaliser({ id: 'étoile', couleur: 'cv' }), {});
  assert.deepStrictEqual(c._decorNormaliser({ id: 'ruban', couleur: 'rouge' }), { id: 'ruban' });
  assert.deepStrictEqual(c._decorNormaliser({ id: 'ruban', couleur: 'gris' }), { id: 'ruban', couleur: 'gris' });
  assert.strictEqual(c._decorActif({}), false);
  assert.strictEqual(c._decorCalculer({}, MX), null);
});

test('décor ajouté : la couleur automatique n’est jamais celle du bandeau derrière, et se voit sur le foncé comme sur le blanc', () => {
  const D = c._decorCouleur('', '#2f6690', '#2f6690');
  assert.ok(c._compoContraste(D, '#2f6690') >= 1.6, 'visible sur un bandeau de la couleur du CV : ' + D);
  const auto = c._decorCouleur('', '#1f2a44', '#1f2a44');
  assert.ok(c._compoContraste(auto, '#1f2a44') >= 1.6 && c._compoContraste(auto, '#ffffff') >= 1.3, auto);
  assert.strictEqual(c._decorCouleur('cv', '#2f6690', '#2f6690'), '#2f6690', 'un choix explicite est respecté');
  assert.strictEqual(c._decorCouleur('gris', '#2f6690'), '#b8bdc7');
});

test('décor ajouté : les quarts de cercle s’arrêtent avant le texte de l’en-tête, et ne se posent pas s’il n’y a pas la place (essai d’impression : blanc sur gris clair)', () => {
  assert.strictEqual(Math.round(c._decorRayonLibre([{ l: 500, t: 20, r: 700, b: 60 }], 794)), 88, 'distance du coin haut droit au texte, moins 8 px');
  assert.strictEqual(c._decorRayonLibre([], 794), 240, 'sans texte, le rayon maximal');
  const libre = c._decorCalculer({ id: 'quarts' }, Object.assign({}, MX, { gMax: 100 }));
  assert.ok(libre && libre.zones[0].css.indexOf('width:100px') !== -1, 'le grand cercle est limité par la place libre');
  assert.strictEqual(c._decorCalculer({ id: 'quarts' }, Object.assign({}, MX, { gMax: 30 })), null, 'pas assez de place : pas de décor');
});

test('décor ajouté : l’équerre du bas n’est dessinée que si le corps la laisse libre ; les barres restent dans la marge', () => {
  assert.strictEqual(c._decorCalculer({ id: 'equerre' }, MX).zones.length, 2);
  assert.strictEqual(c._decorCalculer({ id: 'equerre' }, Object.assign({}, MX, { basCorps: 1100 })).zones.length, 1);
  const serre = c._decorCalculer({ id: 'equerre' }, Object.assign({}, MX, { bordG: 20, bordD: 780 }));
  assert.ok(/border-left:(\d+)px/.exec(serre.zones[0].css)[1] <= 12);
});

test('décor ajouté : le ruban ne dépasse jamais sur le corps du CV et raccourcit le titre du métier s’il le touchait', () => {
  const d = c._decorCalculer({ id: 'ruban' }, Object.assign({}, MX, { topCorps: 269 }));
  assert.ok(/height:(\d+)px/.exec(d.zones[0].css)[1] <= 269 - 3);
  assert.ok(d.largeurMetier && 300 + d.largeurMetier <= 668 - 10);
  assert.strictEqual(c._decorCalculer({ id: 'ruban' }, Object.assign({}, MX, { droiteMetier: 500 })).largeurMetier, null);
});

test('décor ajouté : les quarts de cercle restent dans l’en-tête et la plaque entoure le titre du métier (sans titre : pas de plaque)', () => {
  const q = c._decorCalculer({ id: 'quarts' }, MX);
  assert.strictEqual(q.zones.length, 2);
  assert.ok(Number(/width:(\d+)px/.exec(q.zones[0].css)[1]) <= 259 + 34);
  const p = c._decorCalculer({ id: 'plaque' }, MX);
  assert.ok(p.plaque.x <= 300 - 24 + 1 && p.plaque.x + p.plaque.w >= 721 - 1 && p.plaque.y <= 40 && p.plaque.y + p.plaque.h >= 150);
  assert.strictEqual(c._decorCalculer({ id: 'plaque' }, { pageL: 794, pageH: 1123, H: 200, couleur: '#2f6690' }), null);
});
