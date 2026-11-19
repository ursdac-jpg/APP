// Nouveautés (17/11/2026) : deux niveaux de lecture à deux boutons différents, texte complet des changements annoncés (Ircantec, inflation à venir),
// pulse des quatre pastilles à tour de rôle, et chiffres qui n'ont rien à faire dans « Droits et règles ».
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
require('./_domStub').installerStubDom();

const R = (...p) => path.join(__dirname, '..', ...p);
const lire = (...p) => fs.readFileSync(R(...p), 'utf8');

test('pulse : quatre pastilles, un quart de cycle chacune, jamais deux en même temps', () => {
  const css = lire('css', 'style.css');
  const cycle = parseFloat((css.match(/\.nv-pulse \.nv-entree \{ animation: nvPulseFond ([\d.]+)s/) || [])[1]);
  const d = {};
  ['bleu', 'jaune', 'turquoise', 'vert'].forEach((c) => { d[c] = parseFloat((css.match(new RegExp('\\.nv-pulse \\.nv-entree--' + c + ' \\{ animation-delay: ([\\d.]+)s')) || [])[1]); });
  assert.ok(cycle > 0, 'la durée du cycle est écrite');
  const ordre = ['bleu', 'jaune', 'turquoise', 'vert'];
  ordre.forEach((c, i) => assert.ok(Math.abs(d[c] - i * cycle / 4) < 1e-9, c + ' démarre au ' + (i + 1) + 'e quart du cycle'));
  const logique = lire('modules', 'nouveautes', 'logique.js');
  assert.ok(/NV_ENTREES = \['appli', 'regles', 'chiffres', 'corriges'\]/.test(logique), 'même ordre que les couleurs : bleu, jaune, turquoise, vert');
});

test('deux niveaux : le bouton du haut replie la suite, celui du bas replie toute la fiche', () => {
  const cc = lire('modules', 'comprendre-le-cadre', 'index.js');
  const f = cc.slice(cc.indexOf('function _comprendreLeCadreBrancherReplier'), cc.indexOf('// Carte d\'un changement dans la vue'));
  assert.ok(f.indexOf("aria-expanded') === 'true') { boutonOuvrir.click(); }") !== -1, 'le second niveau est refermé avant la fiche');
  assert.ok(f.indexOf("r.closest('details')") !== -1 && f.indexOf('fiche.open = false') !== -1, 'puis toute la fiche se ferme');
  assert.ok(f.indexOf("scrollIntoView({ block: 'start' })") !== -1 && lire('css', 'style.css').indexOf('.comprendre-le-cadre-chg { scroll-margin-top') !== -1, 'l’écran remonte sur le titre de la fiche repliée, sous la barre du haut');
  assert.ok(f.indexOf('boutonOuvrir &&') !== -1, 'une fiche à un seul niveau n’a pas de bouton du haut');
  assert.ok(cc.indexOf("ouvrir ? 'Revenir au résumé' : 'Lire la fiche en entier'") !== -1, 'bouton du haut : il ne fait que revenir au résumé');
  assert.ok(cc.indexOf("ouvrir ? 'Replier le texte' : 'Lire plus d’informations'") !== -1, 'changement sans fiche : le bouton du haut replie le texte');
  assert.ok(cc.indexOf("ouvrir ? 'Replier la fiche' : 'Lire la fiche en entier'") === -1, '« Replier la fiche » n’est plus que le bouton du bas');
  const nv = lire('modules', 'nouveautes', 'index.js');
  assert.ok(nv.indexOf("ouvrir ? 'Replier la fiche'") === -1 && nv.indexOf("etaitOuverte ? 'Replier la fiche'") === -1);
  assert.ok(nv.indexOf('_nvLibLire(lire, ouvrir)') !== -1 && nv.indexOf('_nvLibLire(cl, etaitOuverte)') !== -1, 'les deux endroits qui basculent disent la même chose');
  assert.ok(nv.indexOf('comprendreLeCadreBrancherReplier(bloc, null)') !== -1, 'fiche à un seul niveau : « Replier la fiche » ferme la carte');
});

test('Ircantec : texte complet du changement annoncé (retraite complémentaire à venir)', () => {
  const md = lire('modules', 'comprendre-le-cadre', 'contenu', 'balayage', '2026-10.md').replace(/\r/g, '');
  const debut = md.indexOf('### Retraite complémentaire des agents non titulaires');
  const bloc = md.slice(debut).split('\n');
  const details = bloc.filter((l) => /^Détail :/.test(l));
  assert.ok(details.length >= 10, 'le texte complet est écrit');
  assert.ok(details.some((l) => /^Détail : # Que faire d'ici là/.test(l)) && details.some((l) => /^Détail : > Part de l'agent en 2028 = 2,30 %/.test(l)));
  assert.ok(!bloc.some((l) => /^Fiche liée :/.test(l)), 'pas de fiche liée : le texte complet tient lieu de lecture');
  assert.ok(!/[—–]/.test(details.join('\n')) && !/\bIA\b/.test(details.join('\n')));
});

test('inflation à venir : second niveau « Lire plus d’informations » (définition, situation d’aujourd’hui, source)', () => {
  const M = require('../modules/comprendre-les-chiffres/index.js');
  const sm = JSON.parse(lire('modules', 'comprendre-les-chiffres', 'donnees', 'smic-inflation.json'));
  const fiches = M.comprendreLesChiffresConstruireFiches({ smic: sm }, '2026-11-17');
  const f = fiches.filter((x) => x.id === 'inflation-prochaine')[0];
  assert.ok(f && f.genre === 'avenir', 'la fiche à venir existe');
  const p = f.par.tous;
  assert.ok(p.plus.length >= 2 && p.plusTitre && p.rows.length >= 3, 'texte de lecture, titre et tableau d’aujourd’hui');
  assert.ok(p.sources.length >= 1 && p.sources[0].url, 'source cliquable');
  assert.ok(!/[—–]/.test(p.plus.join(' ')) && !/\bIA\b/.test(p.plus.join(' ')));
  const nv = lire('modules', 'nouveautes', 'index.js');
  assert.ok(nv.indexOf('data-nv-lib-ferme="Lire plus d’informations"') !== -1 && nv.indexOf('(avenir && !(p.plus && p.plus.length))') !== -1, 'une fiche à venir sans texte de lecture reste à un seul niveau');
});

test('Droits et règles : aucun chiffre statistique du marché du travail dans le balayage (sa place est dans Comprendre les chiffres)', () => {
  const dossier = R('modules', 'comprendre-le-cadre', 'contenu', 'balayage');
  fs.readdirSync(dossier).filter((f) => /\.md$/.test(f)).forEach((f) => {
    const md = fs.readFileSync(path.join(dossier, f), 'utf8');
    assert.ok(!/^### Données emploi en /m.test(md), f + ' : « Données emploi » est un chiffre, il vit dans Comprendre les chiffres');
    assert.ok(!/publication statistique/i.test(md), f + ' : une publication statistique va dans Comprendre les chiffres');
  });
});

test('recherche : la quatrième entrée « Chiffres » est trouvable depuis l’accueil', () => {
  const base = lire('data', 'baseConnaissancesERIP.js');
  assert.ok(base.indexOf('fn:nouveautes-chiffres') !== -1);
  assert.ok(/Chiffres : ce qui bouge/.test(base));
});
