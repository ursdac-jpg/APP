/* Tests de « l'interprétation d'un chemin » (étape 1, chemin « Chercher un métier » ; consignes 537 et 543) : la demande, la lecture de la réponse, les questions cachées. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const I = require('../modules/comprendre-les-metiers/interpretationLogique.js');
const L = require('../modules/comprendre-les-metiers/syntheseLectureLogique.js');

const BRUT = fs.readFileSync(path.join(__dirname, '../prompts/interpretation-chemin-metier.md'), 'utf8');
const GARDE_FOU = fs.readFileSync(path.join(__dirname, '../prompts/_garde-fou-reponse.md'), 'utf8').trim();
const MODELE = BRUT.replace('{{GARDE_FOU_REPONSE}}', GARDE_FOU);
const PLAFOND = require('../modules/comprendre-les-metiers/syntheseLogique.js').SYN_PLAFONDS.demande;

function donnees() {
  return {
    p1: { retenu: { nom: 'Manutentionnaire', secteur: 'Logistique', niveau: 'Sans diplôme' }, choisies: ['Gérer les stocks', 'Trier'], pct: 55, principales: ['Ranger'], proches: ['Cariste'], memeSecteur: ['Préparateur de commandes'] },
    p1liste: { nbChoix: 5, niveauListe: 'Piste éloignée', plafond: 45, competences: ['Gérer les stocks'], niveau: 'CAP ou BEP', secteurs: ['Logistique'], faciles: ['Le travail en équipe'], difficiles: ['Le bruit'], metiers: [{ nom: 'Manutentionnaire', pct: 40, niveau: 'Sans diplôme' }] },
    p2: { fait: true, choix: [{ titre: 'Avec qui ou quoi', valeurs: ['Des enfants'] }], metiers: [{ nom: 'Animateur', pct: 71, niveau: 'Bac' }] },
    p3: { fait: true, code: ['S'], pourcentages: { S: 70 }, etat: 'normal', metiers: [{ nom: 'Éducateur', lettres: 'S', niveau: 'Bac + 3' }] },
    recoupe: { reviennent: ['Animateur'], communes: ['Écouter'] },
    parcours: ['Agent d’entrepôt (20 ans) : trier, ranger'], situation: 'niveau d’études : CAP ou BEP', libre: 'Je veux rester près de chez moi.',
    territoire: 'Dordogne (24)', recrutement: ['Animateur : parmi les plus cités']
  };
}
function question(sujet, texte, reps) { return { sujet: sujet, texte: texte || 'Question ' + sujet + ' ?', reponses: reps || ['Oui', 'Non', 'Peu importe'], plusieurs: false }; }
function reponse(o) {
  const base = { choix: 'Vos choix tournent autour de l’ordre et du suivi.', parcours: 'Votre parcours va dans le même sens.', limites: 'Il ne dit rien des horaires.',
    metiers: [{ metier: 'Manutentionnaire', sens: 'Va dans le sens de vos choix.', verifier: 'La part de port de charges.' }],
    questions: [question('physique'), question('horaires'), question('secteur'), question('plaisir'), question('essayer')], fin: 'complet' };
  return Object.assign(base, o || {});
}
const bloc = (o) => '```json\n' + JSON.stringify(reponse(o), null, 2) + '\n```';

// ---------------- La demande ----------------
test('la demande ne parle que du chemin 1, du parcours, de la situation et des mots libres', () => {
  const r = I.intConstruireDemande(MODELE, donnees());
  assert.ok(r.texte.includes('PASSAGE 1, « Chercher un métier » : FAIT'));
  assert.ok(r.texte.includes('Manutentionnaire'));
  assert.ok(r.texte.includes('Agent d’entrepôt'));
  assert.ok(r.texte.includes('niveau d’études : CAP ou BEP'));
  assert.ok(r.texte.includes('Je veux rester près de chez moi.'));
  assert.ok(!r.texte.includes('PASSAGE 2'), 'aucun autre passage');
  assert.ok(!r.texte.includes('PASSAGE 3'));
  assert.ok(!r.texte.includes('Animateur'), 'les métiers des autres chemins ne partent pas');
  assert.ok(!r.texte.includes('Social'));
  assert.ok(!r.texte.includes('DÉJÀ RECOUPÉ'));
  assert.ok(!r.texte.includes('TERRITOIRE'));
  assert.ok(!r.texte.includes('{DONNEES}'));
  assert.strictEqual(r.tropLong, false);
});

test('la demande dit « non donné » quand le parcours manque et n’invente rien', () => {
  const d = donnees(); d.parcours = null; d.situation = '';
  const r = I.intConstruireDemande(MODELE, d);
  assert.ok(r.texte.includes('PARCOURS PROFESSIONNEL : non donné'));
  assert.ok(r.texte.includes('SITUATION : non donnée'));
});

test('sans métier retenu, la demande donne les choix et la liste', () => {
  const d = donnees(); d.p1 = null;
  const r = I.intConstruireDemande(MODELE, d);
  assert.ok(r.texte.includes('la personne n’a retenu aucun métier'));
  assert.ok(r.texte.includes('Compétences choisies : Gérer les stocks'));
});

test('la demande de « Ma lecture » reste inchangée : elle porte toujours les trois passages', () => {
  const r = L.synConstruireDemande('{DONNEES}', donnees());
  assert.ok(r.texte.includes('PASSAGE 2') && r.texte.includes('PASSAGE 3') && r.texte.includes('DÉJÀ RECOUPÉ') && r.texte.includes('TERRITOIRE'));
});

test('la demande tient sous le plafond avec le prompt réel', () => {
  const r = I.intConstruireDemande(MODELE, donnees());
  assert.ok(r.longueur <= PLAFOND, 'longueur ' + r.longueur);
});

// ---------------- Le prompt ----------------
test('le prompt : ni tiret long, ni mot IA, ni lien ; marques et fragment présents', () => {
  assert.ok(!/[–—]/.test(MODELE.replace(/\(– ou —\)/, '')), 'tiret long');
  assert.ok(!/\bIA\b/.test(MODELE));
  assert.ok(!/https?:\/\//.test(MODELE));
  assert.ok(BRUT.includes('{DONNEES}'));
  assert.ok(BRUT.includes('{{GARDE_FOU_REPONSE}}'));
  assert.ok(MODELE.includes('"fin": "complet"'));
});

test('le prompt cite exactement les sujets de la liste fermée du code', () => {
  const ligne = BRUT.split('\n').find((l) => l.includes('choisi **uniquement** dans cette liste fermée'));
  assert.ok(ligne, 'ligne des sujets');
  const dansPrompt = Array.from(ligne.matchAll(/`([a-z]+)`/g)).map((m) => m[1]);
  assert.deepStrictEqual(dansPrompt, I.INT_SUJETS);
});

test('le prompt est enregistré dans le chargeur de prompts', () => {
  const app = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  assert.ok(app.includes("'interpretation-chemin-metier': 'prompts/interpretation-chemin-metier.md'"));
  assert.ok(app.includes("'interpretation-chemin-metier': null"));
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert.ok(html.includes('modules/comprendre-les-metiers/interpretationLogique.js'));
  assert.ok(html.includes('modules/comprendre-les-metiers/interpretation.js'));
  assert.ok(html.indexOf('interpretationLogique.js') > html.indexOf('syntheseLectureLogique.js'));
});

// ---------------- La réponse ----------------
test('une réponse complète est lue : textes, métiers et cinq questions', () => {
  const r = I.intAnalyser(bloc());
  assert.strictEqual(r.ok, true);
  const i = r.interpretation;
  assert.ok(i.choix && i.parcours && i.limites);
  assert.strictEqual(i.metiers.length, 1);
  assert.strictEqual(i.questions.length, 5);
  assert.strictEqual(i.questionsInsuffisantes, false);
  assert.deepStrictEqual(i.questions.map((q) => q.sujet), ['physique', 'horaires', 'secteur', 'plaisir', 'essayer']);
});

test('la réponse est lue avec du texte autour, sans clôture de code, avec une virgule en trop', () => {
  const nu = JSON.stringify(reponse(), null, 1).replace(/\n\}$/, ',\n}');
  assert.strictEqual(I.intAnalyser('Voici : ' + nu + ' Bonne journée.').ok, true);
  assert.strictEqual(I.intAnalyser('Voici :\n' + bloc() + '\nVoilà.').ok, true);
});

test('une réponse copiée avec des barres inverses devant le balisage est lue', () => {
  const copie = bloc().replace(/_/g, '\\_').replace(/\[/g, '\\[');
  assert.strictEqual(I.intAnalyser(copie).ok, true);
});

test('réponse vide, coupée, illisible ou sans contenu : jamais une page à moitié fausse', () => {
  assert.strictEqual(I.intAnalyser('').raison, 'vide');
  assert.strictEqual(I.intAnalyser('   ').raison, 'vide');
  assert.strictEqual(I.intAnalyser('Bonjour, je ne peux pas.').raison, 'illisible');
  const coupee = bloc().slice(0, 300);
  assert.strictEqual(I.intAnalyser(coupee).raison, 'coupee');
  assert.strictEqual(I.intAnalyser('{"choix": "a", "fin": "complet" ').raison, 'illisible');
  const sans = JSON.stringify({ choix: '', parcours: '', limites: '', metiers: [], questions: [question('physique')], fin: 'complet' });
  assert.strictEqual(I.intAnalyser(sans).raison, 'sans_contenu');
});

test('une réponse sans la marque de fin est jugée coupée', () => {
  const o = reponse(); delete o.fin;
  assert.strictEqual(I.intAnalyser(JSON.stringify(o)).raison, 'coupee');
});

test('les textes sont nettoyés : aucun lien, aucune balise, aucun tiret long', () => {
  const r = I.intAnalyser(bloc({ choix: 'Voir **ceci** — et <b>cela</b> sur https://exemple.fr ou www.exemple.fr – fin.' }));
  assert.strictEqual(r.ok, true);
  assert.ok(!/https?:|www\.|<|\*\*|[–—]/.test(r.interpretation.choix), r.interpretation.choix);
  assert.ok(r.interpretation.choix.includes('Voir ceci'));
});

test('jamais plus de cinq questions : les suivantes sont ignorées', () => {
  const qs = ['physique', 'horaires', 'secteur', 'plaisir', 'essayer', 'contact', 'collectif'].map((s) => question(s));
  const r = I.intAnalyser(bloc({ questions: qs }));
  assert.strictEqual(r.interpretation.questions.length, 5);
  assert.strictEqual(r.interpretation.questions[4].sujet, 'essayer');
});

test('un sujet inconnu devient « autre » ; « autre » ne se regroupe jamais ; un sujet répété est écarté', () => {
  const r = I.intAnalyser(bloc({ questions: [question('Physique'), question('météo'), question('couleur'), question('physique', 'Autre question physique ?')] }));
  const q = r.interpretation.questions;
  assert.deepStrictEqual(q.map((x) => x.sujet), ['physique', 'autre', 'autre']);
});

test('moins de trois questions : la réponse est gardée et on propose de redemander', () => {
  const r = I.intAnalyser(bloc({ questions: [question('physique'), question('horaires')] }));
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.interpretation.questions.length, 2);
  assert.strictEqual(r.interpretation.questionsInsuffisantes, true);
  const aucune = I.intAnalyser(bloc({ questions: [] }));
  assert.strictEqual(aucune.ok, true);
  assert.strictEqual(aucune.interpretation.questionsInsuffisantes, true);
});

test('exactement trois questions suffisent', () => {
  const r = I.intAnalyser(bloc({ questions: [question('physique'), question('horaires'), question('secteur')] }));
  assert.strictEqual(r.interpretation.questionsInsuffisantes, false);
});

test('une question sans réponse cliquable utilisable est écartée ; les réponses sont nettoyées, uniques et plafonnées à six', () => {
  const r = I.intAnalyser(bloc({ questions: [
    question('physique', 'Sans réponses ?', []),
    question('horaires', 'Une seule ?', ['Oui']),
    question('secteur', 'Beaucoup ?', ['A', 'B', 'B', 'C', 'D', 'E', 'F', 'G', 'H']),
    question('plaisir'), question('essayer'), question('contact')] }));
  const q = r.interpretation.questions;
  assert.strictEqual(q[0].sujet, 'secteur');
  assert.deepStrictEqual(q[0].reponses, ['A', 'B', 'C', 'D', 'E', 'F']);
  assert.strictEqual(q.length, 4);
});

test('« plusieurs » ne vaut vrai que si l’assistant l’écrit en vrai', () => {
  const q = [Object.assign(question('horaires'), { plusieurs: true }), Object.assign(question('physique'), { plusieurs: 'oui' }), question('secteur')];
  const r = I.intAnalyser(bloc({ questions: q }));
  assert.deepStrictEqual(r.interpretation.questions.map((x) => x.plusieurs), [true, false, false]);
});

test('un métier sans nom est écarté ; deux parties lisibles suffisent', () => {
  const r = I.intAnalyser(bloc({ choix: '', parcours: '', metiers: [{ metier: '', sens: 'x' }, { metier: 'Cariste', sens: 'Oui', verifier: '' }] }));
  assert.strictEqual(r.ok, true);
  assert.deepStrictEqual(r.interpretation.metiers.map((m) => m.metier), ['Cariste']);
  assert.strictEqual(I.intNbParties(r.interpretation), 2);
});

test('la réponse de « Ma lecture » en deux messages n’est pas prise pour une interprétation', () => {
  const lecture = JSON.stringify({ partie: 1, passages: ['a'], converge: 'b', diverge: [], ombre: [], premiere: 'c', direction: 'd', pistes: [], accompagnement: 'e', suite: 'f', fin: 'partie1' });
  assert.strictEqual(I.intAnalyser(lecture).ok, false);
});

// ---------------- Étape 2 : questions regroupées, réponses, passages mis de côté ----------------
const MODELE_SYN = fs.readFileSync(path.join(__dirname, '../prompts/ma-synthese.md'), 'utf8').replace('{{GARDE_FOU_REPONSE}}', GARDE_FOU);
function interp(sujets) { return { questions: sujets.map((s) => (typeof s === 'string' ? question(s) : s)) }; }

test('trois chemins de cinq questions : les sujets en commun ne sont posés qu’une fois', () => {
  const i = { metier: interp(['physique', 'horaires', 'secteur', 'plaisir', 'essayer']), actions: interp(['physique', 'horaires', 'contact', 'collectif', 'rythme']), q: interp(['physique', 'plaisir', 'cadre', 'mobilite', 'responsabilite']) };
  const r = I.intRegrouperQuestions(i, [1, 2, 3], []);
  assert.strictEqual(r.brut, 15);
  assert.strictEqual(r.uniques.length, 11);
  assert.strictEqual(r.doublons, 4);
  const phys = r.uniques.find((q) => q.sujet === 'physique');
  assert.deepStrictEqual(phys.chemins, [1, 2, 3]);
});

test('un passage décoché retire ses questions ; « autre » ne se regroupe jamais', () => {
  const i = { metier: interp(['physique', 'autre']), actions: interp(['physique', 'autre']), q: interp(['cadre']) };
  const r = I.intRegrouperQuestions(i, [1, 2], []);
  assert.strictEqual(r.uniques.length, 3);
  assert.ok(!r.uniques.some((q) => q.chemins.includes(3)));
  assert.strictEqual(I.intRegrouperQuestions(i, [], []).uniques.length, 0);
});

test('une question dont la réponse est déjà connue n’est pas reposée', () => {
  const i = { metier: interp(['mobilite', 'secteur', 'horaires']) };
  const r = I.intRegrouperQuestions(i, [1], ['deplacer', 'rester']);
  assert.deepStrictEqual(r.uniques.map((q) => q.sujet), ['horaires']);
  assert.strictEqual(r.connues, 2);
  assert.strictEqual(r.doublons, 0);
});

test('une réponse cliquée : un seul choix, ou plusieurs si la question le permet ; « ne pas répondre » est exclusif', () => {
  const q = question('horaires', 'Horaires ?', ['Jour', 'Nuit']);
  let r = I.intBasculerReponse(null, q, 'Jour');
  r = I.intBasculerReponse(r, q, 'Nuit');
  assert.deepStrictEqual(r.choix, ['Nuit']);
  const qp = Object.assign({}, q, { plusieurs: true });
  r = I.intBasculerReponse(I.intBasculerReponse(null, qp, 'Jour'), qp, 'Nuit');
  assert.deepStrictEqual(r.choix, ['Jour', 'Nuit']);
  r = I.intBasculerReponse(r, qp, I.INT_NON);
  assert.deepStrictEqual(r.choix, [I.INT_NON]);
  r = I.intBasculerReponse(r, qp, 'Jour');
  assert.deepStrictEqual(r.choix, ['Jour']);
  assert.deepStrictEqual(I.intBasculerReponse(null, q, 'Inventée').choix, []);
});

test('les lignes de la demande : jamais « ne pas répondre », jamais une réponse non proposée, mots libres bornés', () => {
  const qs = I.intRegrouperQuestions({ metier: interp(['horaires', 'physique', 'secteur']), actions: interp(['horaires']) }, [1, 2], []).uniques;
  const rep = {
    horaires: { choix: ['Oui'], libre: '' },
    physique: { choix: [I.INT_NON], libre: '' },
    secteur: { choix: ['Inventée'], libre: 'x'.repeat(500) }
  };
  const lignes = I.intLignesReponses(qs, rep);
  assert.strictEqual(lignes.length, 2);
  assert.ok(lignes[0].includes('(passages 1 et 2)') && lignes[0].endsWith(': Oui'));
  assert.ok(!lignes.join('').includes('Inventée') && !lignes.join('').includes('__non'));
  assert.ok(lignes[1].length < I.INT_MAX_LIBRE + 120);
  assert.strictEqual(I.intNbRepondues(qs, rep), 3);   // « ne pas répondre » compte comme répondu
});

test('la demande de « Ma lecture » : passage mis de côté dit tel quel, réponses ajoutées, rien d’une interprétation', () => {
  const d = Object.assign(donnees(), { misDeCote: [2], reponsesQuestions: ['- Les horaires comptent-ils ? (passage 1) : Oui'] });
  const r = L.synConstruireDemande(MODELE_SYN, d);
  assert.ok(r.texte.includes('MIS DE CÔTÉ par la personne'));
  assert.ok(!r.texte.includes('Animateur : 71'));
  assert.ok(r.texte.includes('RÉPONSES DE LA PERSONNE AUX QUESTIONS'));
  assert.ok(r.texte.includes('Les horaires comptent-ils ? (passage 1) : Oui'));
  assert.ok(r.longueur <= PLAFOND);
});

test('sans passage mis de côté ni réponse, la demande de « Ma lecture » est celle d’avant', () => {
  const sans = L.synConstruireDemande(MODELE_SYN, donnees());
  const avec = L.synConstruireDemande(MODELE_SYN, Object.assign(donnees(), { misDeCote: [], reponsesQuestions: [] }));
  assert.strictEqual(avec.texte, sans.texte);
  // La règle du prompt cite « MIS DE CÔTÉ » ; ce qui ne doit pas apparaître, c'est la ligne de données d'un passage mis de côté.
  assert.ok(!sans.texte.includes('MIS DE CÔTÉ par la personne') && !sans.texte.includes('RÉPONSES DE LA PERSONNE AUX QUESTIONS'));
});

// ---------------- Étape 2b : la disquette ----------------
const S = require('../modules/comprendre-les-metiers/syntheseLogique.js');
const interpGardee = () => ({ choix: 'Vos choix.', parcours: '', limites: 'Les limites.', metiers: [{ metier: 'Cariste', sens: 'Va dans le sens.', verifier: 'Le port.' }], questions: [question('physique'), question('horaires'), question('secteur')], questionsInsuffisantes: false, date: '22/11/2026', signature: '[["x"]]' });
const sansResoudre = () => null;

test('la disquette garde les interprétations et les réponses cliquées, jamais les mots libres', () => {
  const etat = { gardee: true, niveau: 3, interpretations: { metier: interpGardee() }, reponsesQ: { physique: { choix: ['Oui'], libre: 'Mes mots secrets' }, horaires: { choix: [I.INT_NON], libre: '' } } };
  const f = JSON.parse(JSON.stringify(S.synPourFichier(etat)));
  assert.deepStrictEqual(Object.keys(f.interpretations.interpretations), ['metier']);
  assert.deepStrictEqual(f.interpretations.reponses, { physique: ['Oui'], horaires: ['__non'] });
  assert.ok(!JSON.stringify(f).includes('Mes mots secrets'));
  assert.ok(!JSON.stringify(f).includes('signature'));
});

test('une synthèse non gardée ne donne rien, interprétations comprises', () => {
  assert.strictEqual(S.synPourFichier({ gardee: false, interpretations: { metier: interpGardee() } }), null);
});

test('sans interprétation, le fichier est celui d’avant (aucune clé en plus)', () => {
  const f = S.synPourFichier({ gardee: true, niveau: 4 });
  assert.ok(!('interpretations' in f));
});

test('relecture : mêmes textes, sans repère de choix, réponses remises ; l’aller-retour est stable', () => {
  const etat = { gardee: true, niveau: 3, interpretations: { metier: interpGardee(), q: interpGardee() }, reponsesQ: { physique: { choix: ['Oui'], libre: '' } } };
  const fichier = JSON.parse(JSON.stringify(S.synPourFichier(etat)));
  const relu = S.synNormaliserDepuisFichier(fichier, sansResoudre);
  assert.strictEqual(relu.interpretations.metier.signature, null);
  assert.strictEqual(relu.interpretations.metier.questions.length, 3);
  assert.deepStrictEqual(relu.reponsesQ.physique, { choix: ['Oui'], libre: '' });
  assert.deepStrictEqual(Object.keys(relu.interpretations).sort(), ['metier', 'q']);
  const encore = JSON.parse(JSON.stringify(S.synPourFichier(relu)));
  assert.deepStrictEqual(encore.interpretations, fichier.interpretations);
});

test('relecture avec méfiance : texte nettoyé, clé inconnue, réponse mal formée et fichier ancien ignorés', () => {
  const fichier = { niveau: 3, interpretations: { version: 1, interpretations: {
    metier: { choix: 'Bon <b>texte</b> https://exemple.fr', parcours: 'Un parcours.', limites: '', metiers: [], questions: [{ sujet: 'physique', texte: 'Q ?', reponses: ['A', 'B'] }, 'x', null], date: '22/11/2026' },
    pirate: interpGardee(), actions: 'pas un objet', q: { choix: '', parcours: '', limites: '', metiers: [], questions: [] } },
  reponses: { physique: ['A', 7, 'A'], 'Cle Inconnue!': ['B'], horaires: 'x' } } };
  const relu = S.synNormaliserDepuisFichier(fichier, sansResoudre);
  assert.deepStrictEqual(Object.keys(relu.interpretations), ['metier']);
  assert.ok(!/<b>|https?:/.test(relu.interpretations.metier.choix));
  assert.strictEqual(relu.interpretations.metier.questions.length, 1);
  assert.deepStrictEqual(Object.keys(relu.reponsesQ), ['physique']);
  assert.deepStrictEqual(relu.reponsesQ.physique.choix, ['A']);
  // un fichier d'avant l'étape 2b : relu comme avant
  const ancien = S.synNormaliserDepuisFichier({ niveau: 3 }, sansResoudre);
  assert.ok(ancien && !('interpretations' in ancien));
});

test('interprétations seules, sans rien d’autre dans la synthèse : fichier vide, comme avant', () => {
  assert.strictEqual(S.synNormaliserDepuisFichier({ interpretations: { version: 1, interpretations: { metier: interpGardee() }, reponses: {} } }, sansResoudre), null);
});

// ---------------- Chemins 2 et 3 (consigne 552) ----------------
const PROMPTS = { actions: 'interpretation-chemin-actions', q: 'interpretation-chemin-q' };
const lirePrompt = (nom) => fs.readFileSync(path.join(__dirname, '../prompts/' + nom + '.md'), 'utf8').replace('{{GARDE_FOU_REPONSE}}', GARDE_FOU);
function donneesTrois() {
  const d = donnees();
  d.p2 = { fait: true, nbChoix: 4, niveauListe: 'Piste éloignée', plafond: 45, minimum: 2, eviter: ['Le bruit'], choix: [{ titre: 'Avec qui ou quoi', valeurs: ['Des enfants'] }], faciles: ['Rester debout'], difficiles: [], metiers: [{ nom: 'Animateur', pct: 40, niveau: 'Bac', evites: ['Le bruit'] }], retenu: null, nonRetrouves: [] };
  d.p3 = { fait: true, code: ['S', 'A'], pourcentages: { S: 70, A: 55 }, etat: 'normal', partie1: { S: 60 }, partie3: { S: 80 }, nbReponses: 30, nbLignes: 40, niveauQuestionnaire: 'Assez stable', metiers: [{ nom: 'Éducateur', lettres: 'SA', niveau: 'Bac + 3' }], egalite: false, reponsesDepartage: '', retenu: null };
  return d;
}

test('les prompts des chemins 2 et 3 citent la liste fermée du code et gardent leurs repères', () => {
  Object.values(PROMPTS).forEach((nom) => {
    const brut = fs.readFileSync(path.join(__dirname, '../prompts/' + nom + '.md'), 'utf8');
    const ligne = brut.split('\n').find((l) => l.includes('choisi **uniquement** dans cette liste fermée'));
    assert.deepStrictEqual([...ligne.matchAll(/`([a-z]+)`/g)].map((m) => m[1]).filter((x) => I.INT_SUJETS.includes(x)), I.INT_SUJETS, nom);
    assert.ok(brut.includes('{DONNEES}') && brut.includes('{{GARDE_FOU_REPONSE}}'), nom);
    assert.ok(brut.includes('"fin": "complet"'), nom);
    assert.ok(!/période d'essai »/.test(brut.replace(/n'écris jamais « période d'essai », qui désigne un temps de contrat/g, '')), nom);
    const app = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
    assert.ok(app.includes("'" + nom + "': 'prompts/" + nom + ".md'") && app.includes("'" + nom + "': null"), nom);
  });
});

test('la demande du chemin 2 ne dit rien des deux autres chemins ; celle du chemin 3 non plus', () => {
  const r2 = I.intConstruireDemande(lirePrompt(PROMPTS.actions), donneesTrois(), 'actions');
  assert.ok(r2.texte.includes('PASSAGE 2, « Partir de vos envies » : FAIT'));
  assert.ok(r2.texte.includes('Ce que la personne veut ÉVITER') && r2.texte.includes('Le bruit'));
  assert.ok(!r2.texte.includes('PASSAGE 1') && !r2.texte.includes('PASSAGE 3') && !r2.texte.includes('NON FAIT'));
  assert.ok(!r2.texte.includes('DÉJÀ RECOUPÉ') && !r2.texte.includes('TERRITOIRE'));
  const r3 = I.intConstruireDemande(lirePrompt(PROMPTS.q), donneesTrois(), 'q');
  assert.ok(r3.texte.includes('PASSAGE 3, six lettres (questionnaire) : FAIT') && r3.texte.includes('Social 70 %'));
  assert.ok(r3.texte.includes('perception d’elle-même'));
  assert.ok(!r3.texte.includes('PASSAGE 1') && !r3.texte.includes('PASSAGE 2') && !r3.texte.includes('NON FAIT'));
  [r2, r3].forEach((r) => { assert.ok(r.longueur <= PLAFOND && !r.tropLong); });
});

test('sans chemin, ou avec un chemin inconnu, la demande reste celle du chemin 1', () => {
  const a = I.intConstruireDemande(MODELE, donnees()), b = I.intConstruireDemande(MODELE, donnees(), 'metier'), c = I.intConstruireDemande(MODELE, donnees(), 'inconnu');
  assert.strictEqual(a.texte, b.texte);
  assert.strictEqual(a.texte, c.texte);
});

test('« Ma lecture » (sans portée) garde ses trois passages', () => {
  const r = L.synConstruireDemande(MODELE_SYN, donneesTrois());
  assert.ok(r.texte.includes('PASSAGE 1') && r.texte.includes('PASSAGE 2, « Partir de vos envies » : FAIT') && r.texte.includes('PASSAGE 3, six lettres'));
});

test('l’empreinte est courte, stable, et change quand les choix changent', () => {
  const a = I.intEmpreinte('["a","b"]');
  assert.strictEqual(a, I.intEmpreinte('["a","b"]'));
  assert.notStrictEqual(a, I.intEmpreinte('["a","c"]'));
  assert.ok(/^h[0-9a-z]{1,10}$/.test(a));
});

test('la disquette garde l’empreinte des chemins 2 et 3, jamais le repère long du chemin 1', () => {
  const etat = { gardee: true, niveau: 3, interpretations: { metier: interpGardee(), actions: Object.assign(interpGardee(), { signature: I.intEmpreinte('x') }), q: Object.assign(interpGardee(), { signature: 'pas valide <b>' }) } };
  const fichier = JSON.parse(JSON.stringify(S.synPourFichier(etat)));
  assert.strictEqual(fichier.interpretations.interpretations.actions.signature, I.intEmpreinte('x'));
  assert.ok(!('signature' in fichier.interpretations.interpretations.metier));
  assert.ok(!('signature' in fichier.interpretations.interpretations.q));
  const relu = S.synNormaliserDepuisFichier(fichier, sansResoudre);
  assert.strictEqual(relu.interpretations.actions.signature, I.intEmpreinte('x'));
  assert.strictEqual(relu.interpretations.metier.signature, null);
  assert.strictEqual(relu.interpretations.q.signature, null);
});

test('l’interprétation par chemin est ouverte au public (25/11/2026) : interrupteur à true et ligne « Nouveautés » pour Explorer les métiers', () => {
  const src = fs.readFileSync(path.join(__dirname, '../modules/comprendre-les-metiers/interpretation.js'), 'utf8');
  assert.match(src, /var INT_OUVERT = true;/);
  const nouv = fs.readFileSync(path.join(__dirname, '../data/nouveautes.js'), 'utf8');
  assert.ok(/titre: 'Explorer les métiers : faire relire vos résultats par un assistant en ligne'/.test(nouv), 'nouveautés : une ligne pour l’interprétation ouverte');
});

test('les trois prompts de chemin portent la règle de vocabulaire (goûts et émotions : liste fermée, verbes de constat, phrase libre citée)', () => {
  ['interpretation-chemin-metier', 'interpretation-chemin-actions', 'interpretation-chemin-q'].forEach((nom) => {
    const brut = fs.readFileSync(path.join(__dirname, '../prompts/' + nom + '.md'), 'utf8');
    assert.ok(/VERSION [23] \(2026-11-25/.test(brut), nom + ' : ligne de version');
    ['aimer', 'apprécier', 'adorer', 'plaisir', 'passion', 'goût pour'].forEach((mot) => assert.ok(brut.includes('« ' + mot + ' »'), nom + ' : mot interdit absent : ' + mot));
    ['vous avez choisi', 'vous avez indiqué', 'vous avez retenu'].forEach((v) => assert.ok(brut.includes('« ' + v + ' »'), nom + ' : verbe de constat absent : ' + v));
    assert.ok(brut.includes('ne la rattache jamais à un choix précis'), nom);
    assert.ok(brut.includes('les cinq questions, elles, peuvent demander ce que la personne fait avec plaisir'), nom + ' : les questions restent libres de demander');
    assert.ok(brut.includes('N\'écris jamais que la personne « aime travailler »'), nom + ' : la règle « aimer travailler » est conservée');
    // Le modèle du champ « limites » ne recopie plus « plaisir » : l'assistant le reprenait tel quel (décision de Denis, 25/11/2026).
    const limites = brut.split('\n').filter((l) => /^\s*"limites":/.test(l)).join('');
    assert.ok(limites.length > 0, nom + ' : modèle du champ limites introuvable');
    assert.ok(!/plaisir|aimer|passion/i.test(limites), nom + ' : mot de goût dans le modèle du champ limites');
  });
  const q = fs.readFileSync(path.join(__dirname, '../prompts/interpretation-chemin-q.md'), 'utf8');
  assert.ok(q.includes('« la lettre … ressort dans vos réponses »'), 'chemin 3 : formule pour les six lettres');
});
