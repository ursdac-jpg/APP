const test = require('node:test');
const assert = require('node:assert');
const mots = require('../outils/veilleMots.js');
const idees = require('../outils/veilleIdees.js');
const { analyserCandidatsLexique } = require('../outils/veilleDepot.js');

const BASE = { id: 'forfait-jours', titre: 'Forfait jours', titreDeTri: 'Forfait jours', type: 'terme', gabarit: '', univers: 'droit-travail', registres: ['langage-rh'], variantes: ['cadre au forfait'], corps: 'Une façon de décompter le temps de travail en jours. Elle concerne certains cadres.', relations: [] };

test('mot neuf : une notion exige un gabarit connu, un mot simple n\'en a pas', () => {
  const sans = mots.verifierMot(Object.assign({}, BASE, { type: 'notion', gabarit: '' }), [], { nouveau: true });
  assert.ok(sans.erreurs.some((e) => /présentation/i.test(e)));
  const faux = mots.verifierMot(Object.assign({}, BASE, { type: 'notion', gabarit: 'inconnu' }), [], { nouveau: true });
  assert.ok(faux.erreurs.some((e) => /présentation/i.test(e)));
  const bon = mots.verifierMot(Object.assign({}, BASE, { type: 'notion', gabarit: 'comparatif' }), [], { nouveau: true });
  assert.ok(!bon.erreurs.some((e) => /présentation/i.test(e)));
  const simpleAvecGabarit = mots.verifierMot(Object.assign({}, BASE, { gabarit: 'comparatif' }), [], { nouveau: true });
  assert.ok(simpleAvecGabarit.erreurs.some((e) => /présentation/i.test(e)));
});

test('mot neuf : une notion s\'ecrit avec sa ligne gabarit, lisible par l\'insertion ; un mot simple n\'en a pas', () => {
  const notion = mots.lignesPourInsertion(Object.assign({}, BASE, { type: 'notion', gabarit: 'role' }));
  assert.ok(notion.some((l) => l === "  gabarit: 'role',"));
  assert.ok(notion.some((l) => /type: 'notion',$/.test(l)));
  const a = analyserCandidatsLexique(notion.join('\n') + '\n');
  assert.ok(a.ok, a.erreur);
  const simple = mots.lignesPourInsertion(BASE);
  assert.ok(!simple.some((l) => /gabarit/.test(l)));
  assert.ok(analyserCandidatsLexique(simple.join('\n') + '\n').ok);
});

test('Ma liste : type et gabarit d\'un brouillon sont gardes, et une ancienne ligne a 15 colonnes reste lisible', () => {
  const r = idees.appliquer('', [{ op: 'ajouter', mot: 'Ma notion', porte: 'saisie' }], { existants: [], aujourdhui: '2026-10-20' });
  const k = idees.parser(r.texte)[0].k;
  const r2 = idees.appliquer(r.texte, [{ op: 'brouillon', k: k, champs: { type: 'notion', gabarit: 'role', titre: 'Ma notion', titreDeTri: 'Ma notion', univers: 'dispositifs', registres: ['langage-cip'], variantes: [], corps: 'x', relations: [] } }], { existants: [], aujourdhui: '2026-10-20' });
  const o = idees.parser(r2.texte).map(idees.versObjet)[0];
  assert.strictEqual(o.brouillon.type, 'notion');
  assert.strictEqual(o.brouillon.gabarit, 'role');
  const ancienne = 'ia1 | trier | Ancien | saisie | o | m | | 2026-10-01 | | | | | | | ';
  const lues = idees.parser(ancienne).map(idees.versObjet);
  assert.strictEqual(lues.length, 1);
  assert.strictEqual(lues[0].brouillon.type, 'terme');
});

// ---------- changer le type d'une fiche existante (ecriture ciblee) ----------
const fs = require('node:fs');
const lex = require('../outils/veilleLexique.js');
const CONTENU = fs.readFileSync(require('node:path').join(__dirname, '..', 'data', 'lexique.js'), 'utf8');
const TOUS = lex.lireMots(CONTENU);
const UN_MOT = TOUS.filter((m) => m.type === 'terme')[0], UNE_NOTION = TOUS.filter((m) => m.type === 'notion')[0];
const lignesChangees = (a, b) => { const x = a.split('\n'), y = b.split('\n'); return Math.abs(x.length - y.length) + x.filter((l, i) => l !== y[i]).length; };

test('type : un mot devient une notion (type et gabarit sur la meme ligne), seules ces proprietes changent, relu par le lecteur', () => {
  const r = lex.remplacerChamps(CONTENU, UN_MOT.id, { type: 'notion', gabarit: 'comparatif' });
  assert.ok(r.ok, r.erreur);
  const relu = lex.lireMots(r.texte).filter((m) => m.id === UN_MOT.id)[0];
  assert.strictEqual(relu.type, 'notion');
  assert.strictEqual(relu.gabarit, 'comparatif');
  assert.strictEqual(relu.corps, UN_MOT.corps);
  assert.strictEqual(lex.lireMots(r.texte).length, TOUS.length);
  assert.ok(lignesChangees(CONTENU, r.texte) <= 2, 'au plus une ligne touchee');
  const retour = lex.remplacerChamps(r.texte, UN_MOT.id, { type: 'terme', gabarit: '' });
  assert.ok(retour.ok, retour.erreur);
  assert.strictEqual(retour.texte, CONTENU, 'aller-retour : le fichier redevient identique octet pour octet');
});

test('type : une notion devient un mot (le gabarit disparait) ; changer seulement le gabarit ne touche que lui', () => {
  const r = lex.remplacerChamps(CONTENU, UNE_NOTION.id, { type: 'terme', gabarit: '' });
  assert.ok(r.ok, r.erreur);
  const relu = lex.lireMots(r.texte).filter((m) => m.id === UNE_NOTION.id)[0];
  assert.strictEqual(relu.type, 'terme');
  assert.ok(!relu.gabarit);
  assert.strictEqual(relu.univers, UNE_NOTION.univers);
  assert.deepStrictEqual(relu.registres, UNE_NOTION.registres);
  const autre = ['explication', 'comparatif', 'decryptage', 'grille-lecture', 'deroule-demarche', 'role'].filter((g) => g !== UNE_NOTION.gabarit)[0];
  const g = lex.remplacerChamps(CONTENU, UNE_NOTION.id, { gabarit: autre });
  assert.ok(g.ok, g.erreur);
  assert.strictEqual(lex.lireMots(g.texte).filter((m) => m.id === UNE_NOTION.id)[0].gabarit, autre);
  assert.ok(lignesChangees(CONTENU, g.texte) <= 1);
});

test('type : une notion sans gabarit valide est refusee ; le controle d\'un mot signale le changement de type', () => {
  assert.strictEqual(lex.remplacerChamps(CONTENU, UN_MOT.id, { type: 'notion', gabarit: '' }).ok, false);
  const v = mots.verifierMot(Object.assign({}, UN_MOT, { type: 'notion', gabarit: 'role' }), TOUS.filter((x) => x.id !== UN_MOT.id), { original: UN_MOT, phrase: 'type change' });
  assert.deepStrictEqual(v.erreurs, []);
  assert.ok(v.avertissements.some((a) => /type de la fiche/.test(a)));
  assert.ok(v.modifies.indexOf('type') !== -1 && v.modifies.indexOf('gabarit') !== -1);
});

// ---------- porte B : les recherches sans resultat collees depuis Umami ----------
test('porte B : liste simple avec ou sans nombre, regroupee, seuil de 2, vie privee (chiffre, arobase, phrase longue) ecartee sans etre montree', () => {
  const existants = [{ id: 'cdi', titre: 'CDI', variantes: ['contrat fixe'] }];
  const brut = ['forfait jours\t3', 'Forfait jours', 'rupture conventionnelle', 'cdi', 'contrat fixe	4', 'jean.dupont@mail.fr', 'mon numéro 0612345678', 'je cherche un travail dans la région de limoges svp', 'portage salarial', 'portage salarial'].join('\n');
  const r = idees.lireRecherches(brut, existants, ['rupture conventionnelle'], {});
  assert.strictEqual(r.ok, true);
  assert.deepStrictEqual(r.idees.map((i) => [i.mot, i.nb]), [['forfait jours', 4], ['portage salarial', 2]]);
  assert.ok(!JSON.stringify(r).includes('dupont') && !JSON.stringify(r).includes('0612345678'), 'aucun texte pouvant identifier une personne n\'est renvoye');
  assert.strictEqual(r.ecartees.vieprivee, 3);
  assert.strictEqual(r.ecartees.existe, 2);
  assert.strictEqual(r.ecartees.dejaVu, 1);
});

test('porte B : un export CSV avec la colonne du nom d\'evenement ne garde que les recherches sans resultat', () => {
  const csv = ['event_name,texte', 'lexique_recherche_sans_resultat,portage salarial', 'lexique_recherche_utilisee,cdi', 'lexique_recherche_sans_resultat,"portage salarial"', 'lexique_recherche_sans_resultat,autre mot'].join('\n');
  const r = idees.lireRecherches(csv, [], [], {});
  assert.deepStrictEqual(r.idees.map((i) => [i.mot, i.nb]), [['portage salarial', 2]]);
  assert.strictEqual(r.ecartees.rare, 1);
  assert.strictEqual(idees.lireRecherches('', [], [], {}).idees.length, 0);
});
