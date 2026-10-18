'use strict';
// Portrait, Europe (documents annuels), fiches méthode et lignes libres du digest : lecture, réécriture à l'identique, modifications, relecture par l'application.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const C = require('../outils/veilleChiffres.js');
require('./_domStub').installerStubDom();
const App = require('../modules/comprendre-les-chiffres/index.js');

const RACINE = path.resolve(__dirname, '..');
const DOSSIER = path.join(RACINE, 'modules', 'comprendre-les-chiffres', 'contenu');
const lire = (f) => fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
const METHODES = fs.readdirSync(path.join(DOSSIER, 'methode')).map((f) => path.join(DOSSIER, 'methode', f))
  .concat(fs.readdirSync(path.join(RACINE, 'modules', 'comprendre-le-cadre', 'contenu', 'methode')).filter((f) => /\.md$/.test(f) && !/^README/.test(f)).map((f) => path.join(RACINE, 'modules', 'comprendre-le-cadre', 'contenu', 'methode', f)));

// ---------- les VRAIS fichiers : réécriture à l'identique ----------
test('annuels : le portrait et l\'Europe se lisent et se réécrivent à l\'identique (tels quels et sous la forme canonique)', () => {
  ['portrait-2026.md', 'ue-2026.md'].forEach((f) => {
    const t = lire(path.join(DOSSIER, f)), l = C.lireAnnuel(t);
    assert.ok(l.ok, f);
    assert.ok(l.puces.length >= 25, f + ' : puces');
    assert.strictEqual(C.annuelEnTexte(l), t, f);
    assert.strictEqual(C.annuelEnTexte(l, { toutCanonique: true }), t, f + ' : forme canonique');
    assert.strictEqual(new Set(l.puces.map((p) => p.ref)).size, l.puces.length, f + ' : références uniques');
  });
});

test('méthode : les 5 fiches méthode (3 chiffres, 2 cadre) se réécrivent à l\'identique', () => {
  assert.strictEqual(METHODES.length, 5);
  METHODES.forEach((f) => {
    const t = lire(f), l = C.lireMethode(t);
    assert.ok(l.ok, path.basename(f) + ' : ' + l.erreur);
    assert.strictEqual(C.methodeEnTexte(l), t);
    assert.strictEqual(C.methodeEnTexte(l, { toutCanonique: true }), t, path.basename(f) + ' : forme canonique');
  });
});

// ---------- jeux d'essai fixes ----------
const ENT = '---\ntype: portrait\nannee: 2026\nverifie_le: 2026-09\nsources:\n  - "INSEE | Comparateur | https://www.insee.fr/fr/statistiques/1405599 | 2026-09"\n  - "DARES | Intérim | https://dares.travail-emploi.gouv.fr/x | 2026-09-12"\n---\n';
const PORTRAIT = ENT + '\n# Portrait\n\n## Population\n\nIntroduction sur deux\nlignes.\n\n- Dordogne (24) : **417 614 habitants**, densité **46,1 habitants par km²** (2023). Source : INSEE, comparateur | https://www.insee.fr/fr/statistiques/1405599\n- Ce sont des départements **peu denses**.\n- Naissances : **2 650** pour **5 830 décès**. Source : INSEE, état civil | https://www.insee.fr/fr/statistiques/1\n  suite indentée\n\n## Emploi\n\n- Intérim : **3 %** de l\'emploi (2025). Source : DARES, intérim | https://dares.travail-emploi.gouv.fr/x\n- Emploi public : élevé. Source : INSEE, emploi public | https://www.insee.fr/fr/statistiques/5039873 (à confirmer)\n';
const AUJ = { aujourdhui: '2026-10-18' };
const REF1 = 'Population | 1 | Dordogne (24) : **417 614 hab';

test('annuel : une puce se lit en texte et en source ; une puce sans source, à source libre ou sur plusieurs lignes est reconnue', () => {
  const l = C.lireAnnuel(PORTRAIT);
  assert.strictEqual(l.puces.length, 5);
  assert.deepStrictEqual(l.puces.map((p) => p.source.type), ['structure', 'aucune', 'structure', 'structure', 'libre']);
  assert.deepStrictEqual(l.puces.map((p) => p.modifiable), [true, true, false, true, true], 'une puce suivie d\'une ligne indentée ne se modifie pas');
  assert.deepStrictEqual(C.gras(l.puces[0].avant), ['417 614 habitants', '46,1 habitants par km²']);
});

test('annuel : changer un chiffre en gras exige la confirmation de la source, date la source de l\'en-tête, et ne touche que cette ligne', () => {
  const texte = 'Dordogne (24) : **420 000 habitants**, densité **46,1 habitants par km²** (2023).';
  const sans = C.modifierAnnuel(PORTRAIT, { ref: C.lireAnnuel(PORTRAIT).puces[0].ref, texte: texte }, AUJ);
  assert.strictEqual(sans.ok, false); assert.match(sans.erreur, /confirmez/);
  const r = C.modifierAnnuel(PORTRAIT, { ref: C.lireAnnuel(PORTRAIT).puces[0].ref, texte: texte, confirmeSource: true }, AUJ);
  assert.ok(r.ok, r.erreur);
  const a = PORTRAIT.split('\n'), b = r.texte.split('\n');
  assert.strictEqual(a.length, b.length);
  const diff = a.map((l, i) => (l === b[i] ? null : b[i])).filter(Boolean);
  assert.deepStrictEqual(diff, [
    '  - "INSEE | Comparateur | https://www.insee.fr/fr/statistiques/1405599 | 2026-10"',
    '- Dordogne (24) : **420 000 habitants**, densité **46,1 habitants par km²** (2023). Source : INSEE, comparateur | https://www.insee.fr/fr/statistiques/1405599'
  ]);
  assert.strictEqual(r.resume.action, 'chiffre modifié');
});

test('annuel : reformuler sans toucher aux chiffres en gras ne demande pas de confirmation ; erreurs de forme refusées', () => {
  const ref = C.lireAnnuel(PORTRAIT).puces[1].ref;
  const r = C.modifierAnnuel(PORTRAIT, { ref: ref, texte: 'Ce sont des départements **peu denses** et étendus.' }, AUJ);
  assert.ok(r.ok, r.erreur); assert.strictEqual(r.resume.action, 'texte modifié');
  assert.ok(r.texte.indexOf('- Ce sont des départements **peu denses** et étendus.\n') !== -1);
  const ko = (texte) => C.modifierAnnuel(PORTRAIT, { ref: ref, texte: texte, confirmeSource: true }, AUJ);
  assert.strictEqual(ko('Un **chiffre non fermé').ok, false);
  assert.strictEqual(ko('Un ' + String.fromCharCode(0x2014) + ' tiret').ok, false);
  assert.strictEqual(ko('Deux\nlignes').ok, false);
  assert.strictEqual(ko('Avec Source : dedans').ok, false);
  assert.strictEqual(ko('   ').ok, false);
  assert.strictEqual(C.modifierAnnuel(PORTRAIT, { ref: 'Inconnu | 1 | x', texte: 'x' }, AUJ).ok, false);
  assert.strictEqual(C.modifierAnnuel(PORTRAIT, { ref: C.lireAnnuel(PORTRAIT).puces[2].ref, texte: 'x' }, AUJ).ok, false, 'puce sur plusieurs lignes');
});

test('annuel : ajouter ou changer la source se fait par nom et adresse https ; la source libre est remplacée par une source structurée', () => {
  const ref = C.lireAnnuel(PORTRAIT).puces[1].ref;
  const r = C.modifierAnnuel(PORTRAIT, { ref: ref, source: { nom: 'DARES, intérim', url: 'https://dares.travail-emploi.gouv.fr/x' }, confirmeSource: true }, AUJ);
  assert.ok(r.ok, r.erreur);
  assert.ok(r.texte.indexOf('- Ce sont des départements **peu denses**. Source : DARES, intérim | https://dares.travail-emploi.gouv.fr/x\n') !== -1);
  assert.ok(r.texte.indexOf('| 2026-10-18"') !== -1, 'la date de la source (AAAA-MM-JJ) est mise à jour');
  assert.strictEqual(C.modifierAnnuel(PORTRAIT, { ref: ref, source: { nom: 'X', url: 'http://pas-https.org' }, confirmeSource: true }, AUJ).ok, false);
  assert.strictEqual(C.modifierAnnuel(PORTRAIT, { ref: ref, source: { nom: 'A | B', url: 'https://a.org' }, confirmeSource: true }, AUJ).ok, false);
  const libre = C.lireAnnuel(PORTRAIT).puces[4].ref;
  assert.ok(C.modifierAnnuel(PORTRAIT, { ref: libre, source: { nom: 'INSEE, emploi public', url: 'https://www.insee.fr/fr/statistiques/5039873' }, confirmeSource: true }, AUJ).ok);
});

test('annuel : la date de vérification se change dans son format (mois seulement ici)', () => {
  const ref = C.lireAnnuel(PORTRAIT).puces[1].ref;
  const r = C.modifierAnnuel(PORTRAIT, { ref: ref, texte: 'Ce sont des départements **peu denses** et vastes.', datation: 'redater' }, AUJ);
  assert.ok(r.ok, r.erreur);
  assert.ok(r.texte.indexOf('verifie_le: 2026-10\n') !== -1);
});

test('méthode : titre, « utile si », mots de recherche et texte se modifient ; identifiant et type verrouillés ; tiret refusé', () => {
  const t = lire(METHODES[0]);
  const r = C.modifierMethode(t, { changes: { titre: 'Un nouveau titre', tags: 'a,  b ,c', corps: 'Premier paragraphe.\n\nSecond paragraphe.' } });
  assert.ok(r.ok, r.erreur);
  const l = C.lireMethode(r.texte);
  assert.strictEqual(l.champs.titre, 'Un nouveau titre'); assert.strictEqual(l.champs.tags, 'a, b, c'); assert.strictEqual(l.corps, 'Premier paragraphe.\n\nSecond paragraphe.');
  assert.strictEqual(l.champs.id, C.lireMethode(t).champs.id);
  assert.strictEqual(C.modifierMethode(t, { changes: { id: 'x' } }).ok, false);
  assert.strictEqual(C.modifierMethode(t, { changes: { type: 'x' } }).ok, false);
  assert.strictEqual(C.modifierMethode(t, { changes: { titre: 'Un ' + String.fromCharCode(0x2013) + ' tiret' } }).ok, false);
  assert.strictEqual(C.modifierMethode(t, { changes: { tags: 'a,,b' } }).ok, false);
  assert.strictEqual(C.modifierMethode(t, { changes: { titre: C.lireMethode(t).champs.titre } }).ok, false, 'une valeur identique ne change rien');
});

test('digest : une ligne sans chiffre en gras (synthèse courte) se remplace par son texte', () => {
  const t = lire(path.join(DOSSIER, '2026-06.md'));
  const g = C.lireDigest(t), libre = g.entrees.filter((e) => !e.entree && e.section === 'Synthèse courte')[0];
  assert.ok(libre, 'une synthèse courte existe');
  const r = C.modifierDigest(t, { ref: libre.ref, changes: { texteLibre: 'Nouvelle phrase de synthèse pour l\'essai.' } }, AUJ);
  assert.ok(r.ok, r.erreur);
  assert.ok(r.texte.indexOf(libre.brutes[0].match(/^- .+? : /)[0] + 'Nouvelle phrase de synthèse pour l\'essai.') !== -1);
  assert.strictEqual(C.modifierDigest(t, { ref: libre.ref, changes: { texteLibre: 'Deux\nlignes' } }, AUJ).ok, false);
});

// ---------- relecture par le lecteur de l'APPLICATION ----------
test('lecteur de l\'application : une puce du portrait modifiée par l\'outil est relue (texte et source), les autres sont relues à l\'identique', () => {
  const t = lire(path.join(DOSSIER, 'portrait-2026.md')), l = C.lireAnnuel(t);
  const p = l.puces.filter((x) => x.source.type === 'structure' && C.gras(x.avant).length)[0];
  const nv = p.avant.replace(/\*\*[^*]+\*\*/, '**999 999**');
  const r = C.modifierAnnuel(t, { ref: p.ref, texte: nv, confirmeSource: true }, AUJ);
  assert.ok(r.ok, r.erreur);
  const avant = App._comprendreLesChiffresParserDocAnnuel(t), apres = App._comprendreLesChiffresParserDocAnnuel(r.texte);
  let changees = 0;
  avant.sections.forEach((s, i) => s.lignes.forEach((x, j) => { const y = apres.sections[i].lignes[j]; if (JSON.stringify(x) !== JSON.stringify(y)) { changees++; assert.ok(y.texte.indexOf('999 999') !== -1); assert.strictEqual(y.sourceUrl, x.sourceUrl); } }));
  assert.strictEqual(changees, 1);
});

test('lecteur de l\'application : une fiche méthode modifiée par l\'outil est relue avec son nouveau titre et son nouveau texte', () => {
  const t = lire(METHODES[0]);
  const r = C.modifierMethode(t, { changes: { titre: 'Titre refait pour l\'essai', corps: 'Texte refait pour l\'essai.' } });
  assert.ok(r.ok, r.erreur);
  const f = App._comprendreLesChiffresParserFiche(r.texte);
  assert.strictEqual(f.titre, 'Titre refait pour l\'essai');
  assert.ok(f.corps.indexOf('Texte refait pour l\'essai.') !== -1);
});

// ---------- paragraphes de texte (introductions et notes), 2026-10-18 ----------
test('annuel : les introductions et les notes se lisent comme des paragraphes (une ou plusieurs lignes), sans toucher aux puces', () => {
  const l = C.lireAnnuel(PORTRAIT);
  assert.strictEqual(l.puces.length, 5, 'les puces sont inchangées');
  const p = l.paragraphes[0];
  assert.strictEqual(p.genre, 'introduction'); assert.strictEqual(p.nbLignes, 2);
  assert.strictEqual(p.avant, 'Introduction sur deux lignes.', 'les lignes sont jointes par une espace, comme dans l\'application');
  ['portrait-2026.md', 'ue-2026.md'].forEach((f) => { const lu = C.lireAnnuel(lire(path.join(DOSSIER, f))); assert.ok(lu.paragraphes.length >= 5, f); lu.paragraphes.forEach((x) => assert.ok(x.avant && x.debut <= x.fin, f)); });
});

test('annuel : un paragraphe modifié est réécrit seul (retours à 80 caractères s\'il avait plusieurs lignes), sans source ni confirmation, et l\'application le relit', () => {
  const t = lire(path.join(DOSSIER, 'portrait-2026.md')), l = C.lireAnnuel(t);
  const p = l.paragraphes.filter((x) => x.nbLignes > 1)[0];
  const nv = p.avant + ' Phrase ajoutée pour l\'essai.';
  const r = C.modifierAnnuel(t, { ref: p.ref, texte: nv }, AUJ);
  assert.ok(r.ok, r.erreur);
  assert.strictEqual(r.resume.action, 'texte modifié');
  const apres = C.lireAnnuel(r.texte);
  assert.strictEqual(apres.paragraphes.length, l.paragraphes.length);
  assert.strictEqual(apres.paragraphes.filter((x) => x.section === p.section && x.rang === p.rang)[0].avant, nv);
  const q = apres.paragraphes.filter((x) => x.section === p.section && x.rang === p.rang)[0];
  assert.ok(q.nbLignes > 1 && apres.lignes.slice(q.debut, q.fin + 1).every((x) => x.length <= 80), 'le paragraphe garde plusieurs lignes courtes');
  assert.deepStrictEqual(apres.puces.map((x) => x.brute), l.puces.map((x) => x.brute), 'aucune puce n\'a changé');
  const a = App._comprendreLesChiffresParserDocAnnuel(t), b = App._comprendreLesChiffresParserDocAnnuel(r.texte);
  const s0 = a.sections.filter((s) => s.titre === p.section)[0], s1 = b.sections.filter((s) => s.titre === p.section)[0];
  assert.ok(s1.intro.concat(s1.apres).indexOf(nv) !== -1, 'l\'application relit le nouveau paragraphe');
  assert.deepStrictEqual(s1.lignes, s0.lignes, 'les lignes chiffrées sont relues à l\'identique');
});

test('annuel : erreurs sur un paragraphe (vide, retour à la ligne, tiret long, gras impair, début de puce, source) et datation sans changement de texte', () => {
  const ref = C.lireAnnuel(PORTRAIT).paragraphes[0].ref;
  const ko = (d) => C.modifierAnnuel(PORTRAIT, Object.assign({ ref: ref }, d), AUJ);
  assert.strictEqual(ko({ texte: '   ' }).ok, false);
  assert.strictEqual(ko({ texte: 'a\nb' }).ok, false);
  assert.strictEqual(ko({ texte: 'a ' + String.fromCharCode(0x2014) + ' b' }).ok, false);
  assert.strictEqual(ko({ texte: 'un **gras' }).ok, false);
  assert.strictEqual(ko({ texte: '- une puce' }).ok, false);
  assert.strictEqual(ko({ source: { nom: 'X', url: 'https://a.org' } }).ok, false);
  assert.strictEqual(ko({ texte: 'Introduction sur deux lignes.' }).ok, false, 'rien ne change');
  const r = ko({ datation: 'redater' });
  assert.ok(r.ok, r.erreur); assert.strictEqual(r.resume.action, 'redaté');
});

test('annuel : couperEnLignes ne coupe qu\'aux espaces et ne dépasse pas la largeur (sauf un mot plus long)', () => {
  const l = C.couperEnLignes('un deux trois quatre cinq six sept huit neuf dix', 12);
  assert.ok(l.every((x) => x.length <= 12)); assert.strictEqual(l.join(' '), 'un deux trois quatre cinq six sept huit neuf dix');
  assert.deepStrictEqual(C.couperEnLignes('supercalifragilistic mot', 5), ['supercalifragilistic', 'mot']);
});
