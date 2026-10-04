/* ============================================================
   tests/wordNoyau.test.js  (2026-09-27)
   Noyau de l'export du CV en Word (modules/cv-word/) : unites, couleurs, XML, assemblage du .docx.
   Regles verifiees : XML bien forme, aucun texte dans une forme ou une zone de texte (lisibilite par les logiciels de recrutement),
   ordre de lecture, paragraphe final apres un tableau, fichiers de l'archive.
   ============================================================ */
const test = require('node:test');
const assert = require('node:assert');
const U = require('../modules/cv-word/wordUnites.js');
const C = require('../modules/cv-word/wordCouleurs.js');
const X = require('../modules/cv-word/wordXml.js');
const P = require('../modules/cv-word/wordPaquet.js');
const JSZip = require('../modules/cv-editor/jszip.min.js');

// Controle de bonne formation : balises equilibrees, attributs entre guillemets, pas de < ou & nus dans le texte.
function verifierXml(xml) {
  const sansEntete = xml.replace(/^<\?xml[^>]*\?>\s*/, '');
  const pile = [];
  const re = /<(\/?)([A-Za-z_][\w:.-]*)((?:\s+[\w:.-]+="[^"]*")*)\s*(\/?)>/g;
  let dernier = 0, m;
  while ((m = re.exec(sansEntete)) !== null) {
    const entre = sansEntete.slice(dernier, m.index);
    assert.ok(!/[<]/.test(entre), 'caractere < isole : ' + entre.slice(0, 40));
    assert.ok(!/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/.test(entre), 'esperluette non echappee : ' + entre.slice(0, 40));
    dernier = re.lastIndex;
    if (m[4] === '/') { continue; }
    if (m[1] === '/') { assert.strictEqual(pile.pop(), m[2], 'balise fermante inattendue ' + m[2]); }
    else { pile.push(m[2]); }
  }
  assert.strictEqual(sansEntete.slice(dernier).trim(), '', 'contenu apres la racine');
  assert.strictEqual(pile.length, 0, 'balises non fermees : ' + pile.join(','));
}

const run = (texte, o) => Object.assign({ texte, police: 'Arial', tailleDemiPts: 19, couleur: '1C2430' }, o || {});
const par = (runs, o) => Object.assign({ genre: 'paragraphe', runs, interligneExactPx: 17 }, o || {});
function planMinimal() {
  return {
    version: 1, titre: 'CV', auteur: 'Camille Martin', langue: 'fr-FR',
    page: { largeurPx: 793.7, hauteurPx: 1122.5, margesPx: { haut: 38, bas: 30, gauche: 38, droite: 38 } },
    policeParDefaut: 'Arial', tailleParDefautDemiPts: 19,
    decorsPage: [{ genre: 'rect', xPx: 0, yPx: 0, lPx: 300, hPx: 1122, remplissage: { genre: 'uni', couleur: 'E0E8EE' } }],
    decorsPremierePage: [{ genre: 'polygone', xPx: 0, yPx: 0, lPx: 794, hPx: 150, points: [[0, 0], [794, 0], [794, 110], [0, 150]], remplissage: { genre: 'degrade', couleurs: ['2F6690', '93AAC6'], angleDeg: 0 } }],
    flux: [
      par([run('Camille MARTIN', { gras: true })], { style: 'Titre1' }),
      { genre: 'tableau', largeursPx: [200, 100], lignes: [{ cellules: [{ largeurPx: 200, blocs: [par([run('Gauche')])] }, { largeurPx: 100, blocs: [] }] }] }
    ]
  };
}

test('unites : conversions et arrondi au demi-point', () => {
  assert.strictEqual(U.pxVersTwips(96), 1440);
  assert.strictEqual(U.pxVersEmu(1), 9525);
  assert.strictEqual(U.pxVersDemiPoints(12.5), 19);   // 9,375 pt -> 9,5 pt
  assert.strictEqual(U.pxVersDemiPoints(1), 2);       // plancher : 1 pt
  assert.strictEqual(U.echapper('a & b < "c"'), 'a &amp; b &lt; &quot;c&quot;');
  assert.strictEqual(U.nettoyerTexteXml('a\u0001bé'), 'abé');
});

test('unites : l\'etalonnage d\'une police modifie l\'arrondi', () => {
  U.ETALONNAGE_POLICES.testpolice = { facteurTaille: 1, decalageDemiPts: -1 };
  assert.strictEqual(U.pxVersDemiPoints(12.5, '"TestPolice", Arial'), 18);
  delete U.ETALONNAGE_POLICES.testpolice;
});

test('couleurs : lecture des formes renvoyees par le navigateur', () => {
  assert.deepStrictEqual(C.analyser('rgb(47, 102, 144)'), { r: 47, g: 102, b: 144, a: 1 });
  assert.strictEqual(C.cssVersHex('#2f6690'), '2F6690');
  assert.strictEqual(C.cssVersHex('#fff'), 'FFFFFF');
  assert.strictEqual(C.cssVersHex('rgba(0, 0, 0, 0)'), null);
  assert.strictEqual(C.cssVersHex('transparent'), null);
  assert.strictEqual(C.cssVersHex('color(srgb 0.5 0.5 0.5)'), '808080');
  assert.strictEqual(C.cssVersHex('valeur incomprise'), null);
});

test('couleurs : fond translucide pose sur du blanc, contraste', () => {
  assert.strictEqual(C.versHex(C.surFond({ r: 0, g: 0, b: 0, a: 0.5 })), '808080');
  assert.ok(C.contraste({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }) > 20);
});

test('xml : texte avec tabulation et saut de ligne', () => {
  const x = X.xmlTexte('A\tB\nC');
  assert.ok(x.includes('<w:tab/>') && x.includes('<w:br/>'));
  verifierXml('<r>' + x + '</r>');
});

test('xml : caracteres speciaux echappes, accents conserves', () => {
  const ctx = X.creerContexte();
  const xml = X.xmlParagraphe(par([run('Conseillère & « formation » <2024>')]), ctx);
  assert.ok(xml.includes('Conseillère &amp; « formation » &lt;2024&gt;'));
  verifierXml(xml);
});

test('xml : paragraphe avec tabulation a droite, bordure, retrait suspendu, interligne exact', () => {
  const ctx = X.creerContexte();
  const xml = X.xmlParagraphe(par([run('Poste\t2021 - 2024')], {
    tabulations: [{ posPx: 424, genre: 'droite' }], bordures: { bas: { couleur: 'B9C4D2', epaisseurPx: 1 } },
    retraitGauchePx: 12, retraitPremierPx: -12, apresPx: 2
  }), ctx);
  assert.ok(xml.includes('<w:tab w:val="right" w:leader="none" w:pos="6360"/>'));
  assert.ok(xml.includes('w:lineRule="exact"'));
  assert.ok(xml.includes('w:hanging="180"'));
  assert.ok(xml.includes('<w:bottom w:val="single"'));
  verifierXml(xml);
});

test('xml : l\'ordre des proprietes de paragraphe respecte le schema Word', () => {
  const ctx = X.creerContexte();
  const xml = X.xmlParagraphe(par([run('x')], { style: 'Titre1', garderAvecSuivant: true, bordures: { bas: { couleur: 'AAAAAA', epaisseurPx: 1 } }, ombrage: 'EEEEEE', alignement: 'centre', retraitGauchePx: 10 }), ctx);
  const ordre = ['w:pStyle', 'w:keepNext', 'w:widowControl', 'w:pBdr', 'w:shd', 'w:spacing', 'w:ind', 'w:jc'];
  let pos = -1;
  ordre.forEach((e) => { const p = xml.indexOf('<' + e); assert.ok(p > pos, e + ' mal place'); pos = p; });
});

test('xml : tableau, cellule terminee par un paragraphe, tableaux consecutifs separes', () => {
  const ctx = X.creerContexte();
  const t = { genre: 'tableau', largeursPx: [100, 100], lignes: [{ cellules: [{ largeurPx: 100, blocs: [] }, { largeurPx: 100, blocs: [par([run('a')])] }] }] };
  const xml = X.xmlBlocs([t, t], ctx);
  verifierXml('<r ' + X.NS_RACINE + '>' + xml + '</r>');
  assert.strictEqual((xml.match(/<w:tbl>/g) || []).length, 2);
  assert.ok(/<\/w:tbl><w:p>/.test(xml), 'paragraphe entre deux tableaux');
  assert.ok(/<w:tc><w:tcPr>.*?<\/w:tcPr><w:p>/.test(xml), 'cellule vide : paragraphe present');
});

test('xml : formes (rectangle arrondi, ellipse, polygone, degrade) sans texte', () => {
  const ctx = X.creerContexte();
  const f = { genre: 'rectArrondi', xPx: 10, yPx: 20, lPx: 200, hPx: 60, rayonPx: 12, remplissage: { genre: 'degrade', couleurs: ['2F6690', '93AAC6'], angleDeg: 90 }, contour: { couleur: '2F6690', epaisseurPx: 1.5 } };
  const xml = X.xmlForme(f, ctx, 'page');
  assert.ok(xml.includes('prst="roundRect"') && xml.includes('<a:gradFill') && xml.includes('behindDoc="1"'));
  assert.ok(!xml.includes('txbxContent') && !xml.includes('mc:AlternateContent'));
  const poly = X.xmlForme({ genre: 'polygone', xPx: 0, yPx: 0, lPx: 100, hPx: 50, points: [[0, 0], [100, 0], [100, 40], [0, 50]], remplissage: { genre: 'uni', couleur: '111111' } }, ctx);
  assert.ok(poly.includes('<a:custGeom>') && poly.includes('<a:lnTo>'));
  const ell = X.xmlForme({ genre: 'ellipse', xPx: 0, yPx: 0, lPx: 10, hPx: 10, remplissage: { genre: 'uni', couleur: 'FFFFFF', alpha: 0.5 } }, ctx);
  assert.ok(ell.includes('prst="ellipse"') && ell.includes('<a:alpha val="50000"/>'));
  verifierXml('<r ' + X.NS_RACINE + '>' + xml + poly + ell + '</r>');
});

test('xml : identifiants de dessins uniques', () => {
  const ctx = X.creerContexte();
  const f = { genre: 'rect', xPx: 0, yPx: 0, lPx: 10, hPx: 10, remplissage: { genre: 'uni', couleur: '000000' } };
  const ids = [X.xmlForme(f, ctx), X.xmlForme(f, ctx), X.xmlForme(f, ctx)].map((x) => /<wp:docPr id="(\d+)"/.exec(x)[1]);
  assert.strictEqual(new Set(ids).size, 3);
});

test('paquet : validation du plan (forme avec texte refusee, plan incomplet refuse)', () => {
  assert.deepStrictEqual(P.validerPlan(planMinimal()), []);
  const mauvais = planMinimal();
  mauvais.decorsPage[0].texte = 'Nom';
  assert.ok(P.validerPlan(mauvais).some((e) => /texte/.test(e)));
  assert.ok(P.validerPlan({ version: 2 }).length > 0);
  assert.ok(P.validerPlan(null).length > 0);
});

test('paquet : archive .docx complete et XML bien forme', async () => {
  const octets = await P.ecrireDocx(planMinimal(), JSZip);
  const zip = await JSZip.loadAsync(octets);
  const noms = Object.keys(zip.files);
  ['[Content_Types].xml', '_rels/.rels', 'word/document.xml', 'word/_rels/document.xml.rels', 'word/styles.xml', 'word/settings.xml', 'word/header1.xml', 'word/header2.xml', 'docProps/core.xml'].forEach((n) => assert.ok(noms.includes(n), 'manque ' + n));
  for (const n of noms) { if (/\.(xml|rels)$/.test(n)) { verifierXml(await zip.file(n).async('string')); } }
  const doc = await zip.file('word/document.xml').async('string');
  assert.ok(doc.includes('<w:titlePg/>'), 'en-tete de premiere page declare');
  assert.ok(/<\/w:tbl><w:p>.*<w:sectPr>/.test(doc), 'paragraphe final apres le tableau');
  assert.ok(doc.includes('w:pgSz w:w="11906" w:h="16838"'), 'page A4 exacte');
});

test('paquet : invariants pour les logiciels de recrutement (aucune zone de texte, texte dans l\'ordre)', async () => {
  const plan = planMinimal();
  plan.flux.unshift(par([run('Camille MARTIN')]), par([run('camille@exemple.fr')]));
  plan.flux.push(par([run('EXPÉRIENCE')]));
  const zip = await JSZip.loadAsync(await P.ecrireDocx(plan, JSZip));
  const tout = (await Promise.all(Object.keys(zip.files).filter((n) => /^word\/.*\.xml$/.test(n)).map((n) => zip.file(n).async('string')))).join('');
  assert.ok(!tout.includes('txbxContent'), 'aucune zone de texte');
  assert.ok(!tout.includes('<w:pict'), 'aucun w:pict');
  assert.ok(!tout.includes('mc:AlternateContent'), 'aucun mc:AlternateContent (bloque Word)');
  const doc = await zip.file('word/document.xml').async('string');
  const textes = [...doc.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]);
  assert.deepStrictEqual(textes.slice(0, 3), ['Camille MARTIN', 'camille@exemple.fr', 'Camille MARTIN']);
  assert.strictEqual(textes[textes.length - 1], 'EXPÉRIENCE');
});

test('paquet : image dans l\'en-tete (relation et media enregistres, contenu partage)', async () => {
  const plan = planMinimal();
  const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';
  plan.decorsPage.push({ genre: 'image', xPx: 10, yPx: 10, lPx: 50, hPx: 50, donnees: png, type: 'png', cle: 'photo', geometrie: 'ellipse', alt: 'Photo' });
  plan.flux.push(par([{ image: { lPx: 12, hPx: 12, donnees: png, type: 'png', cle: 'photo', alt: 'icone' } }]));
  const zip = await JSZip.loadAsync(await P.ecrireDocx(plan, JSZip));
  const noms = Object.keys(zip.files);
  assert.ok(noms.includes('word/media/image1.png'));
  assert.strictEqual(noms.filter((n) => /^word\/media\/.+/.test(n)).length, 1, 'meme image partagee');
  assert.ok(noms.includes('word/_rels/header1.xml.rels'));
  verifierXml(await zip.file('word/header1.xml').async('string'));
  const ct = await zip.file('[Content_Types].xml').async('string');
  assert.ok(ct.includes('Extension="png"'));
});

test('xml : cadre de paragraphe sans habillage (texte positionne, toujours du corps du document)', () => {
  const ctx = X.creerContexte();
  const xml = X.xmlParagraphe(par([run('Titre du CV')], { cadre: { xPx: 120, yPx: 40, lPx: 200, hPx: 50, ancrageH: 'page', ancrageV: 'page', wrap: 'none', regleHauteur: 'auMoins' } }), ctx);
  assert.ok(xml.includes('<w:framePr'), 'cadre present');
  assert.ok(xml.includes('w:wrap="none"') && xml.includes('w:hRule="atLeast"'));
  assert.ok(xml.includes('w:x="1800"') && xml.includes('w:y="600"'));
  verifierXml(xml);
});

test('xml : decor ancre a un paragraphe (position relative a la colonne et au paragraphe)', () => {
  const ctx = X.creerContexte();
  const decor = { genre: 'ellipse', xPx: -6, yPx: 3, lPx: 10, hPx: 10, remplissage: { genre: 'uni', couleur: '111111' } };
  const xml = X.xmlParagraphe(par([run('Poste')], { decors: [decor] }), ctx);
  assert.ok(xml.includes('relativeFrom="column"') && xml.includes('relativeFrom="paragraph"'));
  assert.ok(xml.indexOf('<w:drawing>') < xml.indexOf('Poste'), 'le decor precede le texte');
  verifierXml('<r ' + X.NS_RACINE + '>' + xml + '</r>');
});

test('xml : echelle de largeur des caracteres et texte cache', () => {
  const x = X.xmlProprietesCaracteres({ police: 'Arial', tailleDemiPts: 19, echelleLargeurPct: 99, cache: true, couleur: '000000' });
  assert.ok(x.includes('<w:w w:val="99"/>') && x.includes('<w:vanish/>'));
  assert.ok(x.indexOf('<w:vanish/>') < x.indexOf('<w:color'), 'ordre du schema : vanish avant color');
  assert.ok(x.indexOf('<w:w ') < x.indexOf('<w:sz '), 'ordre du schema : w avant sz');
  assert.ok(!X.xmlProprietesCaracteres({ echelleLargeurPct: 100 }).includes('<w:w '), 'pas d\'echelle a 100 %');
});

test('xml : zone de texte vertical (seule exception a la regle sans texte dans une forme) et copie cachee dans le corps', async () => {
  const plan = planMinimal();
  plan.decorsPage.push({ genre: 'texteVertical', xPx: 0, yPx: 0, lPx: 45, hPx: 1000, runs: [run('Camille MARTIN', { couleur: 'FFFFFF' })], remplissage: null });
  plan.flux.unshift({ genre: 'paragraphe', runs: [Object.assign(run('Camille MARTIN'), { cache: true })], marqueCachee: true, interligneExactPx: 1 });
  assert.deepStrictEqual(P.validerPlan(plan), []);
  const zip = await JSZip.loadAsync(await P.ecrireDocx(plan, JSZip));
  const ent = await zip.file('word/header1.xml').async('string');
  verifierXml(ent);
  assert.ok(ent.includes('vert="vert270"') && ent.includes('Camille MARTIN'));
  const doc = await zip.file('word/document.xml').async('string');
  assert.ok(doc.includes('<w:vanish/>') && /<w:t[^>]*>Camille MARTIN<\/w:t>/.test(doc), 'le nom est aussi dans le corps (texte cache)');
});

test('xml : pas de lien « garder avec le suivant » dans une cellule de tableau', () => {
  const ctx = X.creerContexte();
  const t = { genre: 'tableau', largeursPx: [100], lignes: [{ cellules: [{ largeurPx: 100, blocs: [par([run('Titre')], { garderAvecSuivant: true, nePasSeparer: true })] }] }] };
  const xml = X.xmlTableau(t, ctx);
  assert.ok(!xml.includes('<w:keepNext/>') && !xml.includes('<w:keepLines/>'));
  const hors = X.xmlParagraphe(par([run('Titre')], { garderAvecSuivant: true }), ctx);
  assert.ok(hors.includes('<w:keepNext/>'), 'conserve hors tableau');
});

test('xml : tableau flottant et image en decor avec geometrie (rond, losange)', () => {
  const ctx = X.creerContexte();
  const t = { genre: 'tableau', largeursPx: [45], flottant: { xPx: 0, yPx: 300 }, lignes: [{ hauteurPx: 500, regleHauteur: 'exacte', cellules: [{ largeurPx: 45, directionTexte: 'btLr', alignementVertical: 'centre', blocs: [par([run('X')])] }] }] };
  const xml = X.xmlTableau(t, ctx);
  assert.ok(xml.indexOf('<w:tblpPr') < xml.indexOf('<w:tblW'), 'tblpPr avant tblW (ordre du schema)');
  assert.ok(xml.includes('w:textDirection w:val="btLr"') && xml.includes('w:hRule="exact"'));
  const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';
  const im = X.xmlForme({ genre: 'image', xPx: 5, yPx: 5, lPx: 64, hPx: 64, donnees: png, type: 'png', cle: 'p', geometrie: 'losange', rognagePct: { gauche: 5, haut: 0, droite: 5, bas: 0 }, contour: { couleur: 'FFFFFF', epaisseurPx: 3 }, derriereTexte: false }, ctx, 'page');
  assert.ok(im.includes('prst="diamond"') && im.includes('<a:srcRect') && im.includes('behindDoc="0"'));
});

test('unites : une valeur non numerique ne doit jamais produire NaN dans le .docx (Word refuserait le fichier)', () => {
  assert.strictEqual(U.pxVersEmu(NaN), 0);
  assert.strictEqual(U.pxVersEmu(undefined), 0);
  assert.strictEqual(U.pxVersEmu(Infinity), 0);
  assert.strictEqual(U.pxVersTwips(NaN), 0);
  assert.strictEqual(U.pxVersTwips(null), 0);
});

test('xml : un decor a position invalide ne laisse aucun NaN dans le XML', () => {
  const ctx = X.creerContexte();
  const decor = { genre: 'rect', xPx: NaN, yPx: 22.7, lPx: 15, hPx: 11, remplissage: { genre: 'uni', couleur: 'FFFFFF' } };
  const xml = X.xmlParagraphe(par([run('Poste')], { decors: [decor] }), ctx);
  assert.ok(!/NaN|Infinity|undefined/.test(xml), 'aucune valeur non numerique dans le XML');
  assert.ok(xml.includes('<wp:posOffset>0</wp:posOffset>'));
});
