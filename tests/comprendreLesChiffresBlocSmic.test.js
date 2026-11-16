const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Bloc du Smic sur écran d'ordinateur (maquette validée par Denis le 10/11/2026, consigne 238) :
// la rubrique « Salaire moyen et salaire médian » à droite du Smic, lue dans les cartes salaires (jamais recopiée),
// chaque chiffre avec sa source au survol (consigne 237), et pas de boutons « Lire … dans le Lexique » (le bouton « Mots de cette page » les donne).
require('./_domStub').installerStubDom();

const M = require('../modules/comprendre-les-chiffres/index.js');
const DOSSIER = path.join(__dirname, '../modules/comprendre-les-chiffres');
const lire = (f) => fs.readFileSync(path.join(DOSSIER, f), 'utf8').replace(/\r\n/g, '\n');
const D = JSON.parse(lire('donnees/smic-inflation.json'));
const SALAIRES = M._comprendreLesChiffresParserFiches(lire('contenu/salaires-insee.md'));
const POUVOIR = M._comprendreLesChiffresParserFiches(lire('contenu/pouvoir-achat-insee.md'));
const ETAT_OK = { smicAJour: true, inflationAJour: true };
const sansSource = (h) => (h.match(/<span class="chiffre"(?! data-source=")/g) || []).length;

function rubrique(niveau, departement, etat, doc) {
  global.departementRessourcesMemorise = () => departement;
  M._comprendreLesChiffresEtat.niveau = niveau;
  M._comprendreLesChiffresFiches.salaires = doc === undefined ? SALAIRES : doc;
  M._comprendreLesChiffresFichesEtat.salaires = doc === null ? 'vide' : 'ok';
  // Les montants s'écrivent avec des espaces insécables : on les lit comme des espaces ordinaires.
  return M._comprendreLesChiffresRubriqueSalaires(D, etat || ETAT_OK).replace(/[\u00a0\u202f]/g, ' ');
}

test('Rubrique salaires, département : médiane France, moyenne France, moyenne du département et Smic net, du plus bas au plus haut', () => {
  const h = rubrique('dep', '24');
  assert.ok(h.includes('Salaire moyen et salaire médian'), 'titre');
  assert.ok(h.includes('Médiane : la moitié gagne moins de'));
  assert.ok(h.includes('Salaire moyen en France'));
  assert.ok(h.includes('Salaire moyen dans la Dordogne'));
  assert.ok(h.includes('Le Smic net, à titre indicatif'));
  const places = ['Le Smic net', 'Médiane : la moitié', 'Salaire moyen dans la Dordogne', 'Salaire moyen en France'].map((t) => h.indexOf(t));
  assert.deepEqual(places.slice().sort((a, b) => a - b), places, 'ordre croissant des montants');
  assert.ok(!h.includes('Haute-Vienne'), 'jamais l’autre département');
});

test('Rubrique salaires : les chiffres sont ceux du fichier de l’Insee (jamais écrits à la main) et chacun garde sa source', () => {
  const h = rubrique('dep', '24');
  assert.ok(h.includes('2 190 €') && h.includes('2 733 €') && h.includes('2 194 €'), 'médiane France, moyenne France, moyenne Dordogne');
  assert.ok(h.includes('1 478 €'), 'Smic net arrondi à l’euro');
  assert.equal(sansSource(h), 0, 'aucun chiffre sans source au survol');
  assert.ok(/data-source="[^"]*salaire net mensuel médian, France"/.test(h), 'source de la médiane');
  assert.ok(/data-source="[^"]*salaire net mensuel moyen, Dordogne"/.test(h), 'source de la moyenne du département');
  assert.ok(/data-source="Service-public\.gouv\.fr, Smic mensuel net, donné à titre indicatif - vérifié le /.test(h), 'source du Smic net');
});

test('Rubrique salaires : le texte « Ce que cela veut dire » est calculé à partir des chiffres affichés', () => {
  const h = rubrique('dep', '24');
  assert.ok(h.includes('Ce que cela veut dire, concrètement'));
  assert.ok(/la moyenne \(<span[^>]*>2 733 €<\/span>\) est plus haute que la médiane \(<span[^>]*>2 190 €<\/span>\), de <span[^>]*>543 €<\/span>/.test(h), 'moyenne contre médiane : 543 €');
  assert.ok(/Dans la Dordogne, la moyenne est inférieure de <span[^>]*>539 €<\/span> à celle de la France/.test(h), 'Dordogne contre France : 539 €');
  assert.ok(/data-source="Calcul : 2 733 € moins 2 190 €, à partir des chiffres de l’Insee"/.test(h), 'le calcul garde sa source');
});

test('Rubrique salaires : la mise en garde dit que le Smic et les salaires ne sont pas de la même année', () => {
  const h = rubrique('dep', '24');
  assert.ok(/Attention :<\/b> le Smic est celui de 2026, les salaires sont ceux de 2024/.test(h));
  assert.ok(h.includes('pas pour calculer un écart exact'));
});

test('Rubrique salaires : région = moyenne de la Nouvelle-Aquitaine ; France entière = pas de ligne de territoire', () => {
  const na = rubrique('na', '24');
  assert.ok(na.includes('Salaire moyen dans la Nouvelle-Aquitaine'));
  assert.ok(/Dans la Nouvelle-Aquitaine, la moyenne est (inférieure|supérieure) de/.test(na));
  const fr = rubrique('fr', '24');
  assert.ok(!/Salaire moyen dans /.test(fr), 'rien à comparer à la France elle-même');
  assert.ok(!/Dans la France/.test(fr));
  assert.ok(fr.includes('Médiane : la moitié gagne moins de') && fr.includes('Salaire moyen en France'));
  const ue = rubrique('ue', '24');
  assert.ok(!/Salaire moyen dans /.test(ue), 'Union européenne : seuls les chiffres de la France');
});

test('Rubrique salaires : Smic non vérifié = pas de Smic net, pas de mise en garde sur les années ; fichier absent ou sans médiane = rien', () => {
  const h = rubrique('dep', '87', { smicAJour: false, inflationAJour: true });
  assert.ok(!h.includes('Smic net'));
  assert.ok(!h.includes('Attention :'));
  assert.ok(h.includes('Salaire moyen dans la Haute-Vienne'));
  assert.ok(!h.includes('Dordogne'));
  assert.equal(rubrique('dep', '24', null, null), '');
  const sansMediane = M._comprendreLesChiffresParserFiches(lire('contenu/salaires-insee.md').replace(/^salaire_mediane:.*\n/m, ''));
  assert.equal(rubrique('dep', '24', null, sansMediane), '');
});

test('Rubrique salaires : s’ouvre en barres (lecture validée), « Chiffres » reste au choix, la valeur d’une autre année est marquée', () => {
  const h = rubrique('dep', '24');
  assert.ok(/data-comprendre-les-chiffres-panneau="barres"><div/.test(h) || /data-comprendre-les-chiffres-panneau="barres">/.test(h));
  assert.ok(!/data-comprendre-les-chiffres-panneau="barres" hidden/.test(h), 'barres ouvertes d’abord');
  assert.ok(/data-comprendre-les-chiffres-panneau="chiffres" hidden/.test(h), 'chiffres disponibles');
  assert.ok(/comprendre-les-chiffres-zone-ligne fort autre|comprendre-les-chiffres-zone-ligne autre/.test(h), 'barre du Smic net marquée « autre période »');
});

test('Rubrique salaires : aucun bouton « Lire … dans le Lexique » (décision de Denis, consigne 238)', () => {
  const h = rubrique('dep', '24');
  assert.ok(!/dans le Lexique/.test(h));
  assert.ok(!/data-comprendre-les-chiffres-fiche-lexique/.test(h));
});

test('Carte du pouvoir d’achat : plus de boutons « Lire … dans le Lexique » (le bouton « Mots de cette page » les donne)', () => {
  const h = M._comprendreLesChiffresPouvoirAchatCarte(POUVOIR);
  assert.ok(h.includes('Comment lire ce chiffre ?'), 'le dépliant d’explication reste');
  assert.ok(h.includes('Le pouvoir d’achat, c’est ce que les revenus'));
  assert.ok(!/dans le Lexique/.test(h));
  assert.ok(!/data-comprendre-les-chiffres-fiche-lexique/.test(h));
});

test('Aucune invitation à lire un mot du Lexique dans tout le module (consigne 240) : le bouton « Mots de cette page » les donne', () => {
  const code = lire('index.js');
  assert.ok(!/data-comprendre-les-chiffres-fiche-lexique/.test(code), 'plus aucun bouton qui ouvre une fiche du Lexique');
  assert.ok(!/dans le Lexique<|dans le Lexique'/.test(code), 'plus aucun libellé « Lire … dans le Lexique »');
  assert.ok(!/À lire avec : le mot|le mot « (Smic|Inflation) » du Lexique/.test(code), 'plus de « À lire avec : le mot … »');
  const smic = M._comprendreLesChiffresRenduCarteSmic(D, ETAT_OK);
  assert.ok(smic.includes('Combien vaut le Smic aujourd’hui ?'));
  assert.ok(!/Lexique/.test(smic));
  assert.ok(!/Lexique/.test(M._comprendreLesChiffresRenduCarteInflation(D, ETAT_OK)));
});

test('Carte du Smic : « Ce que cela veut dire, concrètement » est calculé à partir des montants, chaque chiffre avec sa source', () => {
  const h = M._comprendreLesChiffresRenduCarteSmic(D, ETAT_OK).replace(/[\u00a0\u202f]/g, ' ');
  assert.ok(h.includes('Ce que cela veut dire, concrètement'));
  assert.ok(/Ce que la hausse change :<\/b> <span[^>]*>0,29 €<\/span> de plus de l’heure, soit <span[^>]*>43,99 €<\/span> brut de plus par mois/.test(h), 'hausse : 12,31 − 12,02 et 1 867,02 − 1 823,03');
  assert.ok(/<span[^>]*>22 404,24 €<\/span> brut, soit <span[^>]*>17 735,16 €<\/span> net/.test(h), 'douze mois');
  assert.ok(/À mi-temps \(17 h 30 par semaine\) :<\/b> environ <span[^>]*>933,51 €<\/span>/.test(h), 'mi-temps');
  assert.ok(/Une heure de travail au Smic<\/b> laisse environ <span[^>]*>9,74 €<\/span> net/.test(h), 'net par heure');
  assert.ok(/data-source="Calcul : 1 867,02 € moins 1 823,03 €, à partir des montants de Service-public\.gouv\.fr/.test(h), 'le calcul garde sa source');
  assert.equal(sansSource(h), 0, 'aucun chiffre sans source');
  // montant manquant : la ligne n'est pas écrite
  const E = JSON.parse(JSON.stringify(D.smic.en_vigueur)); delete E.horaire_net_indicatif;
  const sans = M._comprendreLesChiffresSmicLecture(E, D.smic.precedent, 'vérifié le 5 novembre 2026');
  assert.ok(!sans.includes('Une heure de travail au Smic'));
  assert.ok(sans.includes('Ce que la hausse change'));
  assert.equal(M._comprendreLesChiffresSmicLecture({}, null, 'x'), '');
});

test('Carte « salariés concernés » : « Ce que cela veut dire, concrètement » est calculé à partir des chiffres de la Dares, chaque chiffre avec sa source', () => {
  const DARES = M._comprendreLesChiffresParserFiches(lire('contenu/smic-dares.md'));
  const h = M._comprendreLesChiffresSmicCarteBeneficiaires(DARES).replace(/[\u00a0\u202f]/g, ' ');
  assert.ok(h.includes('Ce que cela veut dire, concrètement'));
  assert.ok(/environ <span[^>]*>1 sur 8<\/span> des salariés du privé est concerné/.test(h), '100 / 11,8 arrondi');
  assert.ok(/environ <span[^>]*>1 sur 4<\/span> à temps partiel \(<span[^>]*>25,6 %<\/span>\), contre environ <span[^>]*>1 sur 11<\/span> à temps complet \(<span[^>]*>8,8 %<\/span>\)/.test(h), 'temps de travail');
  assert.ok(/environ <span[^>]*>1 sur 5<\/span> dans une entreprise de 1 à 9 salariés/.test(h), 'petites entreprises');
  assert.ok(/<span[^>]*>59,6 %<\/span> des salariés concernés sont des femmes, alors qu’elles sont <span[^>]*>45,2 %<\/span> des salariés du privé/.test(h), 'les femmes');
  assert.ok(/data-source="Calcul : 100 divisé par 25,6 %, arrondi, à partir des chiffres de /.test(h), 'le calcul garde sa source');
  assert.equal(sansSource(h), 0, 'aucun chiffre sans source');
  assert.equal((h.match(/sont des femmes/g) || []).length, 1, 'la phrase sur les femmes n’est écrite qu’une fois');
  const sans = M._comprendreLesChiffresParserFiches(lire('contenu/smic-dares.md').replace(/^part_femmes_beneficiaires_smic: .*\n/m, ''));
  const h2 = M._comprendreLesChiffresSmicCarteBeneficiaires(sans);
  assert.ok(h2.includes('Selon le temps de travail') && !h2.includes('Les femmes :'), 'une ligne sans ses chiffres n’est pas écrite');
});

test('Lignes du bloc : deux cartes = deux colonnes sur écran large ; une seule = pleine largeur ; aucune = rien', () => {
  const deux = M._comprendreLesChiffresCartesCoteACoteHTML('<div>A</div>', '<div>B</div>');
  assert.ok(deux.includes('comprendre-les-chiffres-cartes-ligne--deux'));
  assert.ok(deux.indexOf('A') < deux.indexOf('B'), 'même ordre qu’avant sur téléphone');
  const seule = M._comprendreLesChiffresCartesCoteACoteHTML('<div>A</div>', '');
  assert.ok(seule.includes('comprendre-les-chiffres-cartes-ligne') && !seule.includes('--deux'));
  assert.equal(M._comprendreLesChiffresCartesCoteACoteHTML('', ''), '');
});

test('Feuille de style : deux colonnes à partir de 1000 px seulement, carte à moitié de largeur en une colonne, barre hachurée, mode sombre par les variables', () => {
  const css = lire('comprendre-les-chiffres.css');
  const bloc = css.slice(css.indexOf('.comprendre-les-chiffres-cartes-ligne {'));
  assert.ok(/@media \(min-width: 1000px\) \{\s*\.comprendre-les-chiffres-cartes-ligne--deux \{ grid-template-columns: minmax\(0, 1fr\) minmax\(0, 1fr\)/.test(bloc), 'deux colonnes seulement sur écran large');
  assert.ok(/cartes-ligne--deux > \.comprendre-les-chiffres-indic:has\(> \.comprendre-les-chiffres-indic-valeur\) \{ display: block; \}/.test(bloc));
  assert.ok(/zone-ligne\.autre \.comprendre-les-chiffres-zone-remplissage \{ background: repeating-linear-gradient/.test(css));
  assert.ok(!/smic-deux/.test(css), 'ancienne règle retirée');
  assert.ok(!/#[0-9a-fA-F]{3,6}\b/.test(bloc.slice(0, bloc.indexOf('/* ---- Métiers'))), 'aucune couleur en dur dans le bloc du Smic');
});

test('Entreprises : les deux cartes (procédures, ventes) sont rendues dans la même ligne côte à côte', () => {
  const src = lire('index.js');
  const debut = src.indexOf('function _comprendreLesChiffresRenduEntreprises()');
  const corps = src.slice(debut, src.indexOf('COMPRENDRE_LES_CHIFFRES_ENTREPRISES_BLOC.t', debut));
  assert.ok(/_comprendreLesChiffresCartesCoteACoteHTML\(carteOuvertures, carteVentes\)/.test(corps));
  assert.ok(corps.indexOf('carteOuvertures') < corps.indexOf('carteVentes'), 'procédures à gauche, ventes à droite');
});

test('Portrait : six repères en trois colonnes, groupes seuls côte à côte, seulement sur écran large et dans les cartes du portrait', () => {
  const css = lire('comprendre-les-chiffres.css');
  const media = css.slice(css.indexOf('@media (min-width: 1000px)'));
  assert.ok(/\[id\^="comprendre-les-chiffres-carte-portrait"\] \.comprendre-les-chiffres-lignes:has\(> :nth-child\(6\)\):not\(:has\(> :nth-child\(7\)\)\)[^{]*\{ grid-template-columns: repeat\(3, minmax\(0, 1fr\)\); \}/.test(media));
  assert.ok(/\.comprendre-les-chiffres-indic:has\(> \.comprendre-les-chiffres-vues-groupe ~ \.comprendre-les-chiffres-vues-groupe\) \{ display: grid; grid-template-columns: minmax\(0, 1fr\) minmax\(0, 1fr\)/.test(media));
  const avant = css.slice(0, css.indexOf('[id^="comprendre-les-chiffres-carte-portrait"] .comprendre-les-chiffres-lignes:has'));
  assert.ok(avant.lastIndexOf('@media (min-width: 1000px)') > avant.lastIndexOf('\n}'), 'règles placées dans le bloc des écrans larges');
});

test('Métier exercé : texte « Ce que cela veut dire » calculé, chaque chiffre avec sa source, rien si un seul groupe', () => {
  const src = { titre: 'Insee, salaires' };
  const v = (n, nom) => ({ n, nom, src });
  const lus = [
    { nom: 'Cadres', lu: v(3547, 'Dordogne'), fr: v(4629, 'France') },
    { nom: 'Employés', lu: v(1863, 'Dordogne'), fr: v(1941, 'France') },
    { nom: 'Ouvriers', lu: v(1958, 'Dordogne'), fr: v(1958, 'France') }
  ];
  const h = M._comprendreLesChiffresSalaireLectureMetiers(lus, { n: 3547, nom: 'Cadres', v: lus[0].lu }, { n: 1863, nom: 'Employés', v: lus[1].lu }, 'la Dordogne');
  const t = h.replace(/<[^>]*>/g, '').replace(/[\u00a0\u202f]/g, ' ');
  assert.ok(t.includes('dans la Dordogne, les cadres gagnent en moyenne 1 684 € de plus par mois que les employés'));
  assert.ok(t.includes('soit environ 1,9 fois plus'));
  assert.ok(t.includes('les cadres : 1 082 € de moins') && t.includes('les ouvriers : le même niveau'));
  const chiffres = h.match(/<span class="chiffre"/g) || [];
  assert.equal(chiffres.length, (h.match(/<span class="chiffre" data-source="[^"]+"/g) || []).length, 'chaque chiffre a sa source');
  assert.ok(!/[–—]/.test(h));
  assert.equal(M._comprendreLesChiffresSalaireLectureMetiers(lus.slice(0, 1), { n: 3547, nom: 'Cadres', v: lus[0].lu }, { n: 3547, nom: 'Cadres', v: lus[0].lu }, 'la Dordogne'), '');
});

test('Hommes et femmes : texte « Ce que cela veut dire » calculé, chaque chiffre avec sa source, règles d’écran large limitées à cette carte', () => {
  const src = { titre: 'Insee, salaires' };
  const v = (n, nom) => ({ n, nom, src });
  const h = M._comprendreLesChiffresSalaireLectureSexes(v(2277, 'Dordogne'), v(2087, 'Dordogne'), v(2891, 'France'), v(2514, 'France'), 'la Dordogne');
  const t = h.replace(/<[^>]*>/g, '').replace(/[\u00a0\u202f]/g, ' ');
  assert.ok(t.includes('dans la Dordogne, les hommes gagnent en moyenne 190 € de plus que les femmes (2 277 € contre 2 087 €), soit environ 2 280 € sur une année'));
  assert.ok(t.includes('l’écart y est de 377 € par mois, plus grand qu’ici'));
  assert.equal((h.match(/<span class="chiffre"/g) || []).length, (h.match(/<span class="chiffre" data-source="[^"]+"/g) || []).length);
  assert.ok(!/[–—]/.test(h));
  const egal = M._comprendreLesChiffresSalaireLectureSexes(v(2000, 'X'), v(2000, 'X'), v(2891, 'France'), v(2514, 'France'), 'X').replace(/<[^>]*>/g, '');
  assert.ok(egal.includes('au même niveau') && !egal.includes('Face à la France'));
  const css = lire('comprendre-les-chiffres.css');
  assert.ok(/:is\(#comprendre-les-chiffres-carte-sal-sexes-dep, #comprendre-les-chiffres-carte-sal-sexes-na\)[^{]*\{ grid-row: 2 \/ span 9; align-self: stretch;/.test(css));
});
