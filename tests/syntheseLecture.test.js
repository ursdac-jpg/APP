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
    parcours: null, situation: 'niveau d’études : CAP ou BEP ; pas d’accompagnement pour l’instant', libre: 'J’aime m’occuper des autres.',
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
  assert.ok(r.texte.includes('PASSAGE 1, « Chercher un métier » : NON FAIT'));
  assert.ok(r.texte.includes('PASSAGE 2, « Partir de vos envies » : NON FAIT'));
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

test('aucune limite : un très long texte et de longues listes sont gardés en entier (consigne 528)', () => {
  const long = 'Une phrase utile. '.repeat(900).trim();
  const beaucoup = Object.assign({}, REPONSE, {
    approfondie: long,
    pistes: new Array(6).fill(0).map((_, i) => ({ metier: 'Métier ' + i, fort: long, verifier: 'y' })),
    ombre: new Array(10).fill('a'),
    passages: new Array(8).fill('p'),
    diverge: new Array(6).fill(0).map(() => ({ constat: 'c', hypothese: 'h' })),
    essayer: new Array(9).fill('e'),
    questions: new Array(7).fill('q'),
    experience: { transferables: new Array(12).fill('t'), transversales: new Array(12).fill('v') }
  });
  const r = L.synAnalyserLecture(JSON.stringify(beaucoup));
  assert.strictEqual(r.ok, true);
  const l = r.lecture;
  assert.strictEqual(l.approfondie, long);
  assert.strictEqual(l.pistes.length, 6);
  assert.strictEqual(l.pistes[0].fort, long);
  assert.strictEqual(l.ombre.length, 10);
  assert.strictEqual(l.passages.length, 8);
  assert.strictEqual(l.diverge.length, 6);
  assert.strictEqual(l.essayer.length, 9);
  assert.strictEqual(l.questions.length, 7);
  assert.strictEqual(l.experience.transferables.length, 12);
  assert.strictEqual(l.experience.transversales.length, 12);
});

test('le prompt de Ma synthèse demande deux messages, sans plafond de signes ni [SUITE]', () => {
  const p = fs.readFileSync(path.join(__dirname, '..', 'prompts', 'ma-synthese.md'), 'utf8');
  assert.ok(!/7 000|5 000|jamais plus de/.test(p));
  assert.ok(/en DEUX messages/.test(p));
  assert.ok(/"fin": "partie1"/.test(p) && /"fin": "complet"/.test(p));
  assert.ok(/"partie": 1/.test(p) && /"partie": 2/.test(p));
  assert.ok(/N'utilise pas `\[SUITE\]`/.test(p));
  // chaque champ attendu est demandé une fois, dans l'un des deux messages
  L.SYN_CHAMPS_PARTIE1.concat(L.SYN_CHAMPS_PARTIE2).forEach((k) => assert.ok(p.indexOf('"' + k + '"') !== -1, k));
  assert.strictEqual(L.SYN_CHAMPS_PARTIE1.concat(L.SYN_CHAMPS_PARTIE2).slice().sort().join(), L.SYN_CHAMPS_LECTURE.slice().sort().join());
});

// Consigne 529 : la réponse arrive en deux messages (l'essentiel, puis « suite »).
const PARTIE1 = { partie: 1, passages: ['Le premier passage retient un métier.'], converge: 'Le contact.', diverge: [{ constat: 'c', hypothese: 'h' }], ombre: ['Les horaires.'], premiere: 'Un contact humain.', direction: 'Aider.', pistes: [{ metier: 'Cuisinier', fort: 'f', verifier: 'v' }], accompagnement: 'Un conseiller peut aider.', fin: 'partie1' };
const PARTIE2 = { partie: 2, approfondie: 'En regardant de plus près.', experience: { transferables: ['Conseiller'], transversales: ['Rigueur'] }, essayer: ['Rencontrer un cuisinier.'], questions: ['Quelle formation ?'], fin: 'complet' };

test('la première partie est lue seule et annonce que la suite est attendue', () => {
  const r = L.synAnalyserLecture(JSON.stringify(PARTIE1));
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.partie, 1);
  assert.strictEqual(r.lecture.suiteAttendue, true);
  assert.strictEqual(r.lecture.approfondie, '');
  assert.strictEqual(r.lecture.pistes.length, 1);
});

test('la deuxième partie est reconnue, avec ou sans son numéro', () => {
  const a = L.synAnalyserLecture(JSON.stringify(PARTIE2));
  assert.strictEqual(a.ok, true);
  assert.strictEqual(a.partie, 2);
  const sansNumero = Object.assign({}, PARTIE2); delete sansNumero.partie;
  assert.strictEqual(L.synAnalyserLecture(JSON.stringify(sansNumero)).partie, 2);
});

test('la deuxième partie complète la première sans la modifier', () => {
  const l1 = L.synAnalyserLecture(JSON.stringify(PARTIE1)).lecture;
  const l2 = L.synAnalyserLecture(JSON.stringify(PARTIE2)).lecture;
  const f = L.synFusionnerSuite(l1, l2);
  assert.strictEqual(f.suiteAttendue, false);
  assert.strictEqual(f.approfondie, 'En regardant de plus près.');
  assert.deepStrictEqual(f.essayer, ['Rencontrer un cuisinier.']);
  assert.deepStrictEqual(f.questions, ['Quelle formation ?']);
  assert.strictEqual(f.experience.transferables[0], 'Conseiller');
  assert.strictEqual(f.converge, 'Le contact.');
  assert.deepStrictEqual(f.pistes.map((x) => x.metier), ['Cuisinier']);
});

test('une réponse complète en un seul bloc reste acceptée et n’attend pas de suite', () => {
  const r = L.synAnalyserLecture(JSON.stringify(REPONSE));
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.partie, 0);
  assert.strictEqual(r.lecture.suiteAttendue, false);
});

test('une première partie coupée avant sa marque de fin est signalée coupée', () => {
  const coupee = JSON.stringify(PARTIE1).replace(/,"fin":"partie1"\}$/, '').slice(0, -20);
  assert.strictEqual(L.synAnalyserLecture('```json\n' + coupee).raison, 'coupee');
  const sansFin = Object.assign({}, PARTIE1); delete sansFin.fin;
  assert.strictEqual(L.synAnalyserLecture(JSON.stringify(sansFin)).raison, 'coupee');
});

test('une deuxième partie vide n’est pas une lecture', () => {
  assert.strictEqual(L.synAnalyserLecture(JSON.stringify({ partie: 2, fin: 'complet' })).raison, 'sans_contenu');
});

test('la marque « partie 1 » avec une espace est tolérée', () => {
  const t = JSON.stringify(PARTIE1).replace('"partie1"', '"partie 1"');
  assert.strictEqual(L.synAnalyserLecture(t).partie, 1);
});

// Consigne 535 : l'annonce de la deuxième partie est dans le bloc (champ « suite ») ET, en filet de sécurité, dans une phrase hors du bloc.
test('le prompt demande le champ « suite », une phrase hors du bloc et le mot « oui »', () => {
  const p = fs.readFileSync(path.join(__dirname, '..', 'prompts', 'ma-synthese.md'), 'utf8');
  assert.ok(/"suite": "/.test(p));
  assert.ok(/en dehors du bloc/.test(p));
  assert.ok(/écris « oui »|écrire « oui »|écrivez « oui »/.test(p));
  assert.ok(/deuxième partie/i.test(p));
});

const INVIT = 'Une deuxième partie existe : un regard plus approfondi et des façons d’essayer. Écrivez « oui » pour la recevoir.';
const PHRASE_HORS = 'La deuxième partie de la lecture (un regard plus approfondi, des façons d’essayer) est prête : écrivez « oui » pour la recevoir.';

test('le champ « suite » du bloc donne la phrase d’invitation', () => {
  const r = L.synAnalyserLecture(JSON.stringify(Object.assign({}, PARTIE1, { suite: INVIT })));
  assert.strictEqual(r.partie, 1);
  assert.strictEqual(r.lecture.suiteAttendue, true);
  assert.strictEqual(r.lecture.suiteTexte, INVIT);
});

test('la phrase écrite hors du bloc est retrouvée, avec ou sans clôtures, même sans champ « suite »', () => {
  const bloc = JSON.stringify(PARTIE1);
  const avecCloture = 'Voici la première partie.\n```json\n' + bloc + '\n```\n' + PHRASE_HORS;
  const sansCloture = bloc + '\n\n' + PHRASE_HORS;
  [avecCloture, sansCloture].forEach((t) => {
    const r = L.synAnalyserLecture(t);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.partie, 1);
    assert.strictEqual(r.lecture.suiteTexte, PHRASE_HORS);
  });
});

test('le champ « suite » du bloc passe avant la phrase hors du bloc', () => {
  const t = JSON.stringify(Object.assign({}, PARTIE1, { suite: INVIT })) + '\n' + PHRASE_HORS;
  assert.strictEqual(L.synAnalyserLecture(t).lecture.suiteTexte, INVIT);
});

test('un bloc marqué « complet » sans numéro, qui annonce une deuxième partie, est la première partie', () => {
  const o = Object.assign({}, PARTIE1, { suite: INVIT, fin: 'complet' }); delete o.partie;
  const r = L.synAnalyserLecture(JSON.stringify(o));
  assert.strictEqual(r.partie, 1);
  assert.strictEqual(r.lecture.suiteAttendue, true);
});

test('une phrase sur la deuxième partie ne change rien à une réponse complète en un seul bloc', () => {
  const r = L.synAnalyserLecture(JSON.stringify(REPONSE) + '\n' + PHRASE_HORS);
  assert.strictEqual(r.partie, 0);
  assert.strictEqual(r.lecture.suiteAttendue, false);
  assert.strictEqual(r.lecture.suiteTexte, '');
});

test('une fois la deuxième partie ajoutée, la phrase d’invitation disparaît', () => {
  const l1 = L.synAnalyserLecture(JSON.stringify(Object.assign({}, PARTIE1, { suite: INVIT }))).lecture;
  const f = L.synFusionnerSuite(l1, L.synAnalyserLecture(JSON.stringify(PARTIE2)).lecture);
  assert.strictEqual(f.suiteTexte, '');
  assert.strictEqual(f.suiteAttendue, false);
});

test('des barres inverses de copie dans la réponse ne gênent pas la lecture de l’invitation', () => {
  const copie = JSON.stringify(PARTIE1, null, 1).replace(/\[/g, '\\[').replace(/\]/g, '\\]') + '\n' + PHRASE_HORS;
  const r = L.synAnalyserLecture(copie);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.lecture.suiteTexte, PHRASE_HORS);
});

// Consigne 536 : le regard approfondi est découpé en petits paragraphes, sans rien perdre.
test('un long texte est découpé en paragraphes sans aucune perte', () => {
  const phrases = [];
  for (let i = 1; i <= 14; i++) { phrases.push('Ceci est la phrase numéro ' + i + ' du regard approfondi, avec un peu de contenu pour la lecture' + (i % 5 === 0 ? ' ?' : '.')); }
  const texte = phrases.join(' ');
  const p = L.synParagraphes(texte);
  assert.ok(p.length >= 3 && p.length <= 8, 'paragraphes : ' + p.length);
  assert.strictEqual(p.join(' '), texte);
  p.forEach((x) => assert.ok(x.length >= 120, 'paragraphe trop court : ' + x.length));
});

test('un texte court, vide ou sans ponctuation reste d’un seul tenant', () => {
  assert.deepStrictEqual(L.synParagraphes('Une phrase courte.'), ['Une phrase courte.']);
  assert.deepStrictEqual(L.synParagraphes(''), []);
  assert.deepStrictEqual(L.synParagraphes(null), []);
  const long = 'mot '.repeat(150).trim();
  assert.deepStrictEqual(L.synParagraphes(long), [long]);
});

test('le découpage garde les chiffres, les guillemets et la ponctuation intacts', () => {
  const t = 'Vous avez répondu à 120 lignes sur 300. Le niveau « Bac + 2 » est indiqué (voir la fiche). '.repeat(6).trim();
  assert.strictEqual(L.synParagraphes(t).join(' '), t.replace(/\s+/g, ' '));
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

/* ---------- Consigne 525 (22/11/2026) : tout ce que la personne a fait part vers l'assistant ---------- */
test('consigne 525 : ce que la personne veut éviter, le nombre de choix et le niveau de la liste partent avec le passage 2', () => {
  const d = donneesCompletes();
  d.p2.nbChoix = 6; d.p2.niveauListe = 'Piste à explorer'; d.p2.plafond = 60; d.p2.minimum = 3; d.p2.eviter = ['Travailler la nuit', 'Porter des charges'];
  d.p2.metiers = [{ nom: 'Animateur', pct: 32, niveau: 'Bac', evites: ['Travailler la nuit'] }, { nom: 'Vendeur', pct: 24, niveau: '', evites: [] }];
  const t = L.synConstruireDemande(MODELE, d).texte;
  assert.ok(t.includes('veut ÉVITER dans son travail : Travailler la nuit ; Porter des charges'));
  assert.ok(t.includes('Choix faits à ce passage : 6 (niveau de la liste : Piste à explorer)'));
  assert.ok(t.includes('ne dépasse jamais 60 %'));
  assert.ok(t.includes('retrouve au moins 3 choix sur 6'));
  assert.ok(t.includes('Animateur (32 %), niveau d’accès : Bac, à vérifier car il peut demander ce qu’elle veut éviter : Travailler la nuit'));
  assert.ok(t.includes('Vendeur (24 %)') && !t.includes('Vendeur (24 %), à vérifier'));
});

test('consigne 525 : sans rien à éviter, aucune ligne « éviter » ni « à vérifier » n’est écrite', () => {
  const t = L.synConstruireDemande(MODELE, donneesCompletes()).texte;
  assert.ok(!t.includes('veut ÉVITER dans son travail'));
  assert.ok(!t.includes('à vérifier car il peut demander'));
});

test('consigne 525 : le passage 1 sans métier retenu n’est plus « NON FAIT » quand des choix ont été faits', () => {
  const d = donneesCompletes();
  d.p1 = null;
  d.p1liste = { nbChoix: 4, niveauListe: 'Piste à explorer', plafond: 40, competences: ['Écouter', 'Conseiller'], niveau: 'Bac', secteurs: ['Santé'], faciles: ['Travailler assis'], difficiles: ['Travailler la nuit'], metiers: [{ nom: 'Conseiller en insertion', pct: 31, niveau: 'Bac + 3' }] };
  const t = L.synConstruireDemande(MODELE, d).texte;
  assert.ok(t.includes('PASSAGE 1, « Chercher un métier » : FAIT, mais la personne n’a retenu aucun métier'));
  assert.ok(!t.includes('PASSAGE 1, « Chercher un métier » : NON FAIT'));
  assert.ok(t.includes('Compétences choisies : Écouter ; Conseiller'));
  assert.ok(t.includes('Niveau d’études choisi : Bac') && t.includes('Secteurs choisis : Santé'));
  assert.ok(t.includes('faciles : Travailler assis') && t.includes('difficiles : Travailler la nuit'));
  assert.ok(t.includes('Métiers que cette liste place en tête : Conseiller en insertion (31 %), niveau d’accès : Bac + 3'));
});

test('consigne 525 : trop peu de choix au passage 1, l’assistant est prévenu de ne rien conclure', () => {
  const d = donneesCompletes();
  d.p1 = null; d.p1liste = { nbChoix: 2, niveauListe: 'Pas encore de pistes', plafond: 20, competences: ['Écouter'], niveau: '', secteurs: [], faciles: [], difficiles: [], metiers: [] };
  const t = L.synConstruireDemande(MODELE, d).texte;
  assert.ok(t.includes('ne tirez aucune conclusion de ce passage'));
});

test('consigne 525 : avec un métier retenu, les choix du passage 1 sont ajoutés sans répéter les compétences', () => {
  const d = donneesCompletes();
  d.p1liste = { nbChoix: 3, niveauListe: 'Piste à explorer', plafond: 30, competences: ['Écouter', 'Être patient'], niveau: 'Bac', secteurs: [], faciles: [], difficiles: [], metiers: [] };
  const t = L.synConstruireDemande(MODELE, d).texte;
  assert.ok(t.includes('Choix faits à ce passage : 3 (niveau de la liste : Piste à explorer)'));
  assert.ok(t.includes('Niveau d’études choisi : Bac'));
  assert.strictEqual(t.split('Compétences choisies :').length - 1, 0);
  assert.strictEqual(t.split('Compétences que la personne a choisies :').length - 1, 1);
});

test('consigne 525 : les parties 2 et 4, le niveau du questionnaire et l’égalité des métiers partent avec le passage 3', () => {
  const d = donneesCompletes();
  d.p3.partie2 = { S: 65, E: 50 }; d.p3.partie4 = { S: 55, A: 45 };
  d.p3.nbReponses = 200; d.p3.nbLignes = 300; d.p3.niveauQuestionnaire = 'Piste à explorer'; d.p3.egalite = true;
  const t = L.synConstruireDemande(MODELE, d).texte;
  assert.ok(t.includes('Partie « les domaines de métiers qui l’attirent », par lettre : Social 65 %'));
  assert.ok(t.includes('Partie « sa façon d’être »'));
  assert.ok(t.includes('Elle a répondu à 200 lignes sur 300 (niveau du résultat : Piste à explorer)'));
  assert.ok(t.includes('à ÉGALITÉ : ils sont écrits dans l’ordre alphabétique'));
  const sans = L.synConstruireDemande(MODELE, donneesCompletes()).texte;
  assert.ok(!sans.includes('à ÉGALITÉ') && !sans.includes('Elle a répondu à'));
});

test('consigne 525 : le prompt (version 2) dit de respecter ce qui est évité et de lire le poids des résultats', () => {
  assert.ok(BRUT.includes('VERSION 2'));
  assert.ok(BRUT.includes('Ce que la personne veut éviter'));
  assert.ok(BRUT.includes('Le poids de chaque résultat'));
  assert.ok(BRUT.includes('« à égalité »'));
  assert.ok(BRUT.includes('Premier passage sans métier retenu'));
});

test('consigne 525 : la demande la plus chargée reste sous le plafond, et les choix du passage 1 ne sont jamais retirés', () => {
  const d = donneesCompletes();
  d.p1liste = { nbChoix: 6, niveauListe: 'Piste à explorer', plafond: 60, competences: ['Écouter'], niveau: 'Bac', secteurs: ['Santé'], faciles: [], difficiles: [], metiers: new Array(8).fill({ nom: 'Un métier de la liste', pct: 30, niveau: 'Bac' }) };
  d.p2.eviter = ['Travailler la nuit']; d.p2.nbChoix = 6; d.p2.niveauListe = 'Piste à explorer'; d.p2.plafond = 60; d.p2.minimum = 3;
  d.p3.partie2 = { S: 65 }; d.p3.partie4 = { S: 55 }; d.p3.nbReponses = 250; d.p3.nbLignes = 300; d.p3.niveauQuestionnaire = 'Piste précise'; d.p3.egalite = true;
  d.parcours = new Array(5).fill('Un métier exercé pendant plusieurs années, avec beaucoup de compétences cochées et décrites en détail pour remplir la ligne');
  const r = L.synConstruireDemande(MODELE, d);
  assert.ok(r.longueur <= PLAFOND, 'longueur ' + r.longueur);
  assert.ok(r.texte.includes('Choix faits à ce passage : 6'));
  assert.ok(r.texte.includes('veut ÉVITER dans son travail'));
});

/* ---------- Consigne 527 (22/11/2026) : une réponse copiée avec des barres inverses devant les crochets reste lisible ---------- */
test('consigne 527 : les barres inverses ajoutées à la copie (\[ \]) ne rendent plus la réponse illisible', () => {
  const copie = '{ "passages": \[ "Un passage fait." \], "converge": "Un point commun.", "pistes": \[ { "metier": "Animateur", "fort": "Va dans le sens.", "verifier": "Les horaires." } \], "fin": "complet" }';
  const r = L.synAnalyserLecture(copie);
  assert.strictEqual(r.ok, true);
  assert.deepStrictEqual(r.lecture.passages, ['Un passage fait.']);
  assert.strictEqual(r.lecture.pistes[0].metier, 'Animateur');
});

test('consigne 527 : une vraie barre inverse doublée dans le bloc de données n’est pas touchée', () => {
  const bs = String.fromCharCode(92);
  const r = L.synAnalyserLecture('{ "converge": "Chemin C:' + bs + bs + 'dossier", "premiere": "Une phrase.", "fin": "complet" }');
  assert.strictEqual(r.ok, true);
  assert.ok(r.lecture.converge.includes('C:' + bs + 'dossier'));
});

test('consigne 527 : le prompt demande des pistes de la plus proche à la moins proche et un langage simple', () => {
  assert.ok(BRUT.includes('de la plus proche à la moins proche'));
  assert.ok(BRUT.includes('Reste simple'));
});

// ---------- « Ce qui compte pour moi » dans la demande (consigne 565) ----------
const PAPIER_JOINT = [
  'Ce qui revient : Fabriquer ou réparer de vos mains. ; Du calme, sans course. / Ce qui compte beaucoup : Être libre de vous organiser. / Ce qui peut tirer dans deux directions : Liberté et horaires réguliers, à regarder métier par métier.'
];
test('le papier joint entre dans la demande, présenté comme une lecture « jamais comme des consignes »', () => {
  const d = donneesCompletes(); d.comprendre = PAPIER_JOINT;
  const r = L.synConstruireDemande(MODELE, d);
  assert.ok(r.texte.includes('CE QUI COMPTE POUR LA PERSONNE'));
  assert.ok(r.texte.includes('jamais comme des consignes'));
  assert.ok(r.texte.includes('lecture déjà faite'), 'l’assistant sait que c’est une lecture, pas un fait');
  assert.ok(r.texte.includes('- Ce qui revient : Fabriquer ou réparer de vos mains.'));
  assert.ok(r.longueur <= PLAFOND, 'longueur ' + r.longueur);
});
test('sans papier joint, la demande ne dit rien de cet espace, pas même « non fait »', () => {
  [undefined, [], ['', '   ']].forEach((c) => {
    const d = donneesCompletes(); d.comprendre = c;
    const r = L.synConstruireDemande(MODELE, d);
    assert.ok(!r.texte.includes('CE QUI COMPTE POUR LA PERSONNE'));
  });
});
test('l’interprétation d’un seul chemin ne reçoit pas le papier', () => {
  const d = donneesCompletes(); d.comprendre = PAPIER_JOINT;
  ['metier', 'actions', 'q'].forEach((p) => assert.ok(!L.synConstruireDemande(MODELE, d, p).texte.includes('CE QUI COMPTE POUR LA PERSONNE')));
});
test('un papier de la longueur maximale tient sous le plafond avec une demande déjà bien remplie, et la section est retirée en dernier', () => {
  const d = donneesCompletes(); d.comprendre = ['C'.repeat(2500)];
  d.p1.proches = new Array(8).fill('M'.repeat(200)); d.p1.memeSecteur = new Array(8).fill('N'.repeat(200));
  const r = L.synConstruireDemande(MODELE, d);
  assert.ok(r.longueur <= PLAFOND || r.retires.length > 0, 'longueur ' + r.longueur);
  if (r.retires.indexOf('comprendre') !== -1) { assert.ok(r.retires.indexOf('p1proches') < r.retires.indexOf('comprendre')); }
  const sans = L.synConstruireDemande(MODELE, Object.assign({}, d, { comprendre: [] }));
  assert.ok(r.longueur - sans.longueur <= 2500 + 600, 'ajout de la section : ' + (r.longueur - sans.longueur));
});
test('un papier trop long est coupé dans la demande, et la section reste du texte brut', () => {
  const d = donneesCompletes(); d.comprendre = ['Z'.repeat(5000)];
  const r = L.synConstruireDemande(MODELE, d);
  assert.ok(!r.texte.includes('Z'.repeat(3000)));
});

test('une copie qui double la barre inverse d’un retour à la ligne ne laisse pas « \n\n » dans le texte lu', () => {
  const texte = '{ "partie": 2, "approfondie": "Un premier paragraphe complet.\\n\\nUn second paragraphe complet.", "essayer": ["Une piste."], "questions": ["Une question ?"], "fin": "complet" }';
  const r = L.synAnalyserLecture(texte);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.lecture.approfondie, 'Un premier paragraphe complet. Un second paragraphe complet.');
  assert.strictEqual(L.synNettoyerTexteLecture('Une ligne.\r\nUne autre.'), 'Une ligne. Une autre.');
});

test('le prompt de Ma lecture : la règle « aucun goût ni émotion » est une liste fermée de mots, avec des verbes de constat à la place (version 3 septies)', () => {
  assert.ok(/VERSION 3 septies \(2026-11-25/.test(BRUT));
  ['aimer', 'apprécier', 'adorer', 'plaisir', 'passion', 'goût pour'].forEach((mot) => assert.ok(BRUT.includes('« ' + mot + ' »'), 'mot interdit absent de la règle : ' + mot));
  ['vous avez choisi', 'vous avez indiqué', 'vous avez retenu'].forEach((v) => assert.ok(BRUT.includes('« ' + v + ' »'), 'verbe de constat absent : ' + v));
  assert.ok(BRUT.includes('Ne rattache jamais cette phrase à un choix précis'), 'la phrase libre ne doit pas être rattachée à un choix');
  assert.ok(BRUT.includes('« accepter » ou « s\'adapter » ne deviennent jamais « aimer »'));
  assert.ok(!BRUT.includes('Aucun goût ni aucune émotion que la personne n\'a pas écrits.'), 'l\'ancienne formulation doit avoir disparu');
});

/* Garde-fou « passage mis de côté » : toute phrase de la réponse qui parle d’un passage mis de côté est retirée par le code (25/11/2026, essai réel où l’assistant recommandait le questionnaire). */
function reponseAvecMention(extra) {
  return JSON.stringify(Object.assign({
    partie: 1,
    passages: ['Le passage « Chercher un métier » est fait. Vous avez retenu un métier.', 'Le questionnaire de six lettres donne un code.'],
    converge: 'Le contact avec les autres revient. Le troisième passage le confirme.',
    diverge: [{ constat: 'Le premier passage et le questionnaire ne disent pas la même chose.', hypothese: 'Cela peut venir du questionnaire.' }, { constat: 'Les métiers diffèrent.', hypothese: 'Ils ont un point commun.' }],
    ombre: ['Le résultat de 62 % ne signifie pas que le métier vous correspond mal. Vous pourriez compléter cette lecture par le passage consacré au questionnaire de six lettres, si vous souhaitez un autre éclairage.', 'Votre expérience n’est pas renseignée.'],
    premiere: 'Une direction ressort.', direction: 'Le contact et l’accompagnement.',
    pistes: [{ metier: 'Animateur', fort: 'Il revient dans plusieurs résultats. Le questionnaire le cite aussi.', verifier: 'Le niveau d’accès.' }],
    accompagnement: 'Vous pouvez vous adresser à France Travail.', suite: 'Écrivez « oui ».', fin: 'partie1'
  }, extra || {}));
}

test('passage 3 mis de côté : les phrases qui parlent du questionnaire sont retirées, le reste reste', () => {
  const r = L.synAnalyserLecture(reponseAvecMention(), [3]);
  assert.ok(r.ok);
  const l = r.lecture, tout = JSON.stringify(l);
  assert.ok(!/questionnaire|six lettres|troisième passage/i.test(tout), 'une mention du passage mis de côté reste : ' + tout);
  assert.deepStrictEqual(l.passages, ['Le passage « Chercher un métier » est fait. Vous avez retenu un métier.']);
  assert.strictEqual(l.converge, 'Le contact avec les autres revient.');
  assert.deepStrictEqual(l.ombre, ['Le résultat de 62 % ne signifie pas que le métier vous correspond mal.', 'Votre expérience n’est pas renseignée.']);
  assert.strictEqual(l.diverge.length, 1, 'une divergence dont le constat parle du passage est retirée avec son hypothèse');
  assert.strictEqual(l.diverge[0].constat, 'Les métiers diffèrent.');
  assert.strictEqual(l.pistes[0].fort, 'Il revient dans plusieurs résultats.');
  assert.strictEqual(l.pistes[0].verifier, 'Le niveau d’accès.');
  assert.ok(r.retires >= 6, 'nombre de phrases retirées : ' + r.retires);
});

test('passage 3 mis de côté : rien n’est retiré quand rien n’est mis de côté, ou quand c’est un autre passage', () => {
  const sans = L.synAnalyserLecture(reponseAvecMention(), []);
  assert.ok(/questionnaire/.test(JSON.stringify(sans.lecture)));
  assert.strictEqual(sans.retires, 0);
  const autre = L.synAnalyserLecture(reponseAvecMention(), [2]);
  assert.ok(/questionnaire/.test(JSON.stringify(autre.lecture)), 'le passage 2 mis de côté ne retire pas le questionnaire');
});

test('passage 1 ou 2 mis de côté : leur nom ou leur rang sont reconnus', () => {
  const r1 = L.synAnalyserLecture(reponseAvecMention(), [1]);
  assert.ok(!/Chercher un métier|premier passage/i.test(JSON.stringify(r1.lecture)));
  const r2 = L.synAnalyserLecture(reponseAvecMention({ premiere: 'Le deuxième passage, « Partir de vos envies », est clair. Une direction ressort.' }), [2]);
  assert.strictEqual(r2.lecture.premiere, 'Une direction ressort.');
});

test('garde-fou : une réponse où tout parle du passage mis de côté reste lisible (pas d’erreur), les champs sont simplement vides', () => {
  const r = L.synAnalyserLecture(JSON.stringify({ partie: 2, approfondie: 'Le questionnaire dit beaucoup.', essayer: ['Refaire le questionnaire.'], questions: ['Que dit le questionnaire ?'], experience: { transferables: [], transversales: [] }, fin: 'complet' }), [3]);
  assert.ok(r.ok);
  assert.strictEqual(r.lecture.approfondie, '');
  assert.deepStrictEqual(r.lecture.essayer, []);
});

test('la réponse réelle de l’essai du 25/11/2026 (phrase d’« ombre » qui recommandait le questionnaire) est nettoyée', () => {
  const brute = JSON.stringify({ partie: 1, passages: ['Le premier passage est fait.'], converge: 'Le contact revient.', diverge: [], ombre: ['Vous pourriez compléter cette lecture par le passage consacré au questionnaire de six lettres, si vous souhaitez disposer d’un autre éclairage.'], premiere: 'Une direction.', direction: 'Le contact.', pistes: [{ metier: 'Animateur', fort: 'x.', verifier: 'y.' }], accompagnement: 'z.', suite: 'oui', fin: 'partie1' });
  const r = L.synAnalyserLecture(brute, [3]);
  assert.deepStrictEqual(r.lecture.ombre, []);
  assert.strictEqual(r.retires, 1);
});

test('le prompt de Ma lecture : la règle du passage mis de côté vaut pour toutes les phrases (version 3 octies)', () => {
  assert.ok(/VERSION 3 octies \(2026-11-25/.test(BRUT));
  assert.ok(BRUT.includes('Cela vaut pour **toutes** les phrases de ta réponse'));
  assert.ok(BRUT.includes('aucune phrase ne renvoie vers ce passage, ni par son nom, ni par son rang'));
});
