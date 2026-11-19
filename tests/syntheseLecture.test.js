/* Tests de « Ma lecture » : la demande à l'assistant, l'analyse de sa réponse, l'origine d'une piste (tâches A9, A11, A12). */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const L = require('../modules/comprendre-les-metiers/syntheseLectureLogique.js');

const BRUT = fs.readFileSync(path.join(__dirname, '../prompts/ma-synthese.md'), 'utf8');
const GARDE_FOU = fs.readFileSync(path.join(__dirname, '../prompts/_garde-fou-reponse.md'), 'utf8').trim();
// Le prompt tel que l'application le charge : le garde-fou commun est inséré à la place de son repère.
const MODELE = BRUT.replace('{{GARDE_FOU_REPONSE}}', GARDE_FOU);
const PLAFOND = require('../modules/comprendre-les-metiers/syntheseLogique.js').SYN_PLAFONDS.demande;

function donneesCompletes() {
  return {
    p1: { retenu: { nom: 'Auxiliaire de puériculture', secteur: 'Santé', niveau: 'CAP ou BEP' }, choisies: ['Écouter', 'Être patient'], pct: 62.4, principales: ['Soigner un enfant'], proches: ['Aide-soignant'], memeSecteur: ['Infirmier'] },
    p2: { fait: true, choix: [{ titre: 'Avec qui ou quoi', valeurs: ['Des enfants', 'Des personnes âgées'] }], faciles: ['Rester debout'], difficiles: ['Le bruit'], metiers: [{ nom: 'Animateur', pct: 71, niveau: 'Bac' }], retenu: { nom: 'Animateur', niveau: 'Bac' }, nonRetrouves: ['Des animaux'] },
    p3: { fait: true, code: ['S', 'A'], pourcentages: { R: 10, I: 20, A: 55, S: 70, E: 30, C: 15 }, etat: 'normal', partie1: { S: 60 }, partie3: { S: 80, A: 40 }, metiers: [{ nom: 'Éducateur de jeunes enfants', lettres: 'SA', niveau: 'Bac + 3' }], reponsesDepartage: 'en équipe', retenu: null },
    recoupe: { reviennent: ['Animateur'], communes: ['Écouter'] },
    parcours: null, situation: 'niveau d’études : CAP ou BEP ; pas accompagné pour l’instant', libre: 'J’aime m’occuper des autres.',
    territoire: 'Dordogne (24)', recrutement: ['Animateur : parmi les plus cités']
  };
}

test('la demande contient tout ce que l’application sait et le prompt', () => {
  const r = L.synConstruireDemande(MODELE, donneesCompletes());
  assert.ok(r.texte.includes('Auxiliaire de puériculture'));
  assert.ok(r.texte.includes('Animateur'));
  assert.ok(r.texte.includes('Social 70 %'));
  assert.ok(r.texte.includes('perception d’elle-même'));
  assert.ok(r.texte.includes('J’aime m’occuper des autres.'));
  assert.ok(r.texte.includes('PARCOURS PROFESSIONNEL : non donné'));
  assert.ok(!r.texte.includes('{DONNEES}'));
  assert.strictEqual(r.tropLong, false);
});

test('la demande reste sous le plafond du plafond avec le prompt réel', () => {
  const r = L.synConstruireDemande(MODELE, donneesCompletes());
  assert.ok(r.longueur <= PLAFOND, 'longueur ' + r.longueur);
  const gros = donneesCompletes();
  gros.p1.proches = new Array(20).fill('Un métier proche très long à écrire en entier');
  gros.p1.memeSecteur = gros.p1.proches.slice();
  gros.p1.principales = new Array(20).fill('Une compétence principale très longue à écrire');
  gros.libre = 'x '.repeat(900);
  const g = L.synConstruireDemande(MODELE, gros);
  assert.ok(g.longueur <= PLAFOND, 'longueur ' + g.longueur);
});

test('un passage non fait est dit « NON FAIT » : l’assistant ne devine rien', () => {
  const r = L.synConstruireDemande(MODELE, { p1: null, p2: null, p3: null, situation: '', libre: '' });
  assert.ok(r.texte.includes('PASSAGE 1, « Par un métier » : NON FAIT'));
  assert.ok(r.texte.includes('PASSAGE 2, « Par ce que vous aimez faire » : NON FAIT'));
  assert.ok(r.texte.includes('PASSAGE 3, six lettres (questionnaire) : NON FAIT'));
  assert.ok(r.texte.includes('SITUATION : non donnée'));
  assert.ok(!r.texte.includes('SES MOTS'));
  assert.ok(!r.texte.includes('TERRITOIRE'));
});

test('quand la demande est trop longue, on retire d’abord les listes les moins utiles', () => {
  const gros = donneesCompletes();
  gros.p1.proches = new Array(8).fill('M'.repeat(300));
  gros.p1.memeSecteur = new Array(8).fill('N'.repeat(300));
  const r = L.synConstruireDemande(MODELE + 'y'.repeat(PLAFOND - MODELE.length - 1500), gros);
  assert.ok(r.retires.length > 0);
  assert.strictEqual(r.retires[0], 'p1proches');
});

test('si même sans rien retirer la demande est trop longue, on le dit', () => {
  const r = L.synConstruireDemande('z'.repeat(PLAFOND + 500), donneesCompletes());
  assert.strictEqual(r.tropLong, true);
});

test('le prompt ne contient ni tiret long, ni mot IA, ni lien', () => {
  assert.ok(!/[–—]/.test(MODELE.replace(/\(– ou —\)/, '')), 'tiret long');
  assert.ok(!/\bIA\b/.test(MODELE));
  assert.ok(!/https?:\/\//.test(MODELE));
  assert.ok(MODELE.includes('{DONNEES}'));
  assert.ok(BRUT.includes('{{GARDE_FOU_REPONSE}}'));
});

const REPONSE = {
  passages: ['Compétences : écouter et expliquer.', 'Envies : enfants et personnes âgées.'],
  converge: 'Le contact avec les personnes revient partout.',
  diverge: [{ constat: 'Créer ne compte pas dans le métier retenu.', hypothese: 'La création compte peut-être au-delà du soin.' }],
  ombre: ['Les tests disent des préférences, pas ce que vous savez faire.'],
  premiere: 'Le soin et l’accompagnement.',
  approfondie: 'Avec vos mots, l’animation semble aussi une piste.',
  direction: 'Accompagner des personnes, avec une part de création.',
  pistes: [{ metier: 'Animateur', origine: 'tests', fort: 'vos lettres', verifier: 'les week-ends' }, { metier: 'Auxiliaire de puériculture', fort: 'revient partout', verifier: 'le rythme' }],
  experience: { transferables: ['Encadrer un groupe'], transversales: ['Avoir l’esprit d’équipe'] },
  essayer: ['Rencontrer un professionnel'], accompagnement: 'Un conseiller peut organiser une immersion.', questions: ['Quelle formation ?'], fin: 'complet'
};

test('une réponse entière est lue, avec ou sans clôtures de code', () => {
  const json = JSON.stringify(REPONSE, null, 2);
  [json, '```json\n' + json + '\n```', 'Voici ma lecture :\n```json\n' + json + '\n```\nBonne chance.'].forEach(t => {
    const r = L.synAnalyserLecture(t);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.lecture.pistes.length, 2);
    assert.strictEqual(r.lecture.direction, 'Accompagner des personnes, avec une part de création.');
  });
});

test('l’origine annoncée par l’assistant est ignorée', () => {
  const r = L.synAnalyserLecture(JSON.stringify(REPONSE));
  assert.strictEqual(r.lecture.pistes[0].origine, undefined);
});

test('une réponse vide, coupée ou mal formée n’ouvre jamais de page', () => {
  assert.deepStrictEqual(L.synAnalyserLecture('').raison, 'vide');
  assert.deepStrictEqual(L.synAnalyserLecture('   \n ').raison, 'vide');
  assert.strictEqual(L.synAnalyserLecture('Je ne peux pas répondre à cela.').raison, 'illisible');
  const coupee = JSON.stringify(REPONSE, null, 2).slice(0, 700);
  assert.strictEqual(L.synAnalyserLecture('```json\n' + coupee).raison, 'coupee');
  const sansFin = Object.assign({}, REPONSE); delete sansFin.fin;
  assert.strictEqual(L.synAnalyserLecture(JSON.stringify(sansFin)).raison, 'coupee');
  assert.strictEqual(L.synAnalyserLecture('{ "fin": "complet" "oups" }').raison, 'illisible');
  assert.strictEqual(L.synAnalyserLecture(JSON.stringify({ fin: 'complet' })).raison, 'sans_contenu');
  assert.strictEqual(L.synAnalyserLecture(JSON.stringify([1, 2])).ok, false);
});

test('une virgule en trop avant l’accolade est pardonnée', () => {
  const t = JSON.stringify(REPONSE).replace(/,"fin":"complet"\}$/, ',"fin":"complet",}');
  assert.strictEqual(L.synAnalyserLecture(t).ok, true);
});

test('les textes reçus sont nettoyés : aucun lien, aucune balise, aucun tiret long', () => {
  const sale = Object.assign({}, REPONSE, { direction: 'Voir https://exemple.fr <b>ceci</b> – et cela — fin www.site.fr' });
  const r = L.synAnalyserLecture(JSON.stringify(sale));
  assert.ok(!/https?:|www\.|<|>|[–—]/.test(r.lecture.direction), r.lecture.direction);
});

test('les listes et les textes sont plafonnés : trois pistes au plus', () => {
  const trop = Object.assign({}, REPONSE, { pistes: new Array(6).fill(0).map((_, i) => ({ metier: 'Métier ' + i, fort: 'x'.repeat(2000), verifier: 'y' })), ombre: new Array(10).fill('a') });
  const r = L.synAnalyserLecture(JSON.stringify(trop));
  assert.strictEqual(r.lecture.pistes.length, 3);
  assert.ok(r.lecture.pistes[0].fort.length <= L.SYN_LIMITES_LECTURE.phrase);
  assert.strictEqual(r.lecture.ombre.length, L.SYN_LIMITES_LECTURE.liste);
});

test('des champs de mauvais type ne font jamais planter l’analyse', () => {
  const bizarre = { passages: 12, converge: { a: 1 }, diverge: 'texte', ombre: null, pistes: [null, 3, { metier: 5 }, { metier: 'Cuisinier' }], experience: 'x', direction: 'Une direction', premiere: 'Une première', fin: 'complet' };
  const r = L.synAnalyserLecture(JSON.stringify(bizarre));
  assert.strictEqual(r.ok, true);
  assert.deepStrictEqual(r.lecture.pistes.map(p => p.metier), ['Cuisinier']);
});

test('l’origine d’une piste est calculée par le code', () => {
  assert.strictEqual(L.synOrigineDePiste('Animateur', ['animateur', 'Cuisinier'], []), 'conf');
  assert.strictEqual(L.synOrigineDePiste('Aide-soignant', ['Animateur'], ['Aide soignant']), 'ajust');
  assert.strictEqual(L.synOrigineDePiste('Pilote de drone', ['Animateur'], ['Aide-soignant']), 'nouv');
  assert.strictEqual(L.synOrigineDePiste('', ['Animateur'], []), 'nouv');
  assert.strictEqual(L.synOrigineDePiste('Aide-soignant ou aide-soignante', ['Aide-soignant'], []), 'conf');
  assert.strictEqual(L.synOrigineDePiste('Infirmier ou infirmière', [], ['Infirmier']), 'ajust');
});

test('comparer une piste : rien à comparer sans compétences choisies, jamais un dessin trompeur', () => {
  assert.strictEqual(L.synComparerPiste([], { se: [1], sf: [2], sv: [] }), null);
  assert.strictEqual(L.synComparerPiste([{ t: 'sf', i: 2 }], null), null);
  assert.strictEqual(L.synComparerPiste([{ t: 'sf', i: 2 }], { se: [], sf: [], sv: [] }), null);
  const c = L.synComparerPiste([{ t: 'sf', i: 2 }, { t: 'se', i: 1 }, { t: 'sv', i: 99 }], { se: [1, 3], sf: [2, 4], sv: [5] });
  assert.strictEqual(c.total, 5);
  assert.strictEqual(c.deja, 2);
  assert.strictEqual(c.transferables.length, 1);
  assert.strictEqual(c.transversales.length, 1);
  assert.strictEqual(c.aAcquerir.length, 3);
});
