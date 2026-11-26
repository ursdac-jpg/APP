// « Mon plan » : la logique pure (consignes 608, 610, 611, 615, 618 et 619). Voir modules/mon-plan/logique.js.
const test = require('node:test');
const assert = require('node:assert');
const L = require('../modules/mon-plan/logique.js');

const SOURCES = {
  pas: { action: 'Appeler un atelier près de chez moi', qui: ['Mon conseiller', 'Un proche'], parler: 'J’aimerais parler des façons d’essayer un métier manuel.' },
  papier: { lignes: ['Ce qui revient : fabriquer de ses mains', 'Ce qui compte beaucoup : le calme'] },
  metiers: ['Menuisier ou menuisière', 'Agent ou agente de maintenance des bâtiments']
};
function etatPret() {
  const e = L.mplEtatInitial();
  L.mplPoserVise(e, 'Un travail manuel près de chez moi.');
  L.mplAjouterObstacle(e, 'Je n’ai pas de voiture.');
  return e;
}
const MODELE = 'Consigne.\n\n{DONNEES}';
function reponse(obj) { return 'Voici votre plan.\n```json\n' + JSON.stringify(obj) + '\n```'; }
const REP = {
  plan: 1, fin: 'complet', rappel: 'Vous avez indiqué viser un travail manuel.',
  priorites: ['Voir un atelier', 'Se déplacer', 'Se présenter', 'Une quatrième de trop'],
  semaines: [['Appeler un atelier près de chez moi', 'Noter ce que je sais faire', 'En trop'], ['Lire une fiche', 'Chercher un bus'], ['Dire mes phrases'], ['Relire mes notes']],
  obstacles: [{ si: 'Si je n’ai pas de voiture,', alors: 'alors je demande les aides.', frein: 'mobilite' }, { si: 'je perds mon logement', alors: 'j’appelle le 115', frein: 'hebergement' }, { si: 'x', alors: 'y', frein: 'inventé' }],
  parler: ['J’aimerais parler des aides pour me déplacer.', 'Pouvez-vous me dire quelles formations existent ?', 'J’aimerais parler des façons d’essayer un métier manuel.']
};

test('trois réponses : obstacles plafonnés à trois, sans doublon ni phrase vide ; temps connu seulement', () => {
  const e = L.mplEtatInitial();
  assert.equal(e.questions.temps, 'moment');
  assert.ok(L.mplAjouterObstacle(e, 'Un'));
  assert.ok(!L.mplAjouterObstacle(e, ' un '), 'doublon');
  assert.ok(!L.mplAjouterObstacle(e, '   '), 'vide');
  L.mplAjouterObstacle(e, 'Deux'); L.mplAjouterObstacle(e, 'Trois');
  assert.ok(!L.mplAjouterObstacle(e, 'Quatre'));
  assert.equal(e.questions.obstacles.length, 3);
  assert.ok(L.mplRetirerObstacle(e, 0));
  assert.deepEqual(e.questions.obstacles, ['Deux', 'Trois']);
  assert.ok(!L.mplChoisirTemps(e, 'beaucoup'));
  assert.ok(L.mplChoisirTemps(e, 'peu'));
  assert.equal(L.mplActionsParSemaine('peu'), 1);
  assert.equal(L.mplActionsParSemaine('plusieurs'), 3);
  assert.ok(L.MPL_TEMPS.every((t) => !/minute|heure/i.test(t.lib)), 'jamais de durée');
});

test('sources : cochées d’avance, absentes ignorées, au moins une et « ce que je vise » pour préparer', () => {
  const e = L.mplEtatInitial();
  assert.deepEqual(L.mplSourcesRetenues(e, SOURCES), ['pas', 'papier', 'metiers']);
  assert.deepEqual(L.mplPreparable(e, SOURCES), { ok: false, raison: 'vise' });
  L.mplPoserVise(e, 'Viser');
  assert.ok(L.mplPreparable(e, SOURCES).ok);
  ['pas', 'papier', 'metiers'].forEach((id) => L.mplCocherSource(e, id, false));
  assert.deepEqual(L.mplPreparable(e, SOURCES), { ok: false, raison: 'source' });
  L.mplCocherSource(e, 'metiers', true);
  assert.deepEqual(L.mplSourcesRetenues(e, SOURCES), ['metiers']);
  assert.ok(!L.mplAuMoinsUneSource({ pas: null, papier: null, metiers: [] }));
  assert.ok(!L.mplAuMoinsUneSource(null));
  assert.ok(L.mplAuMoinsUneSource({ metiers: ['Cuisinier'] }));
  assert.deepEqual(L.mplSourcesRetenues(L.mplEtatInitial(), { pas: { action: '  ' }, metiers: ['A'] }), ['metiers'], 'un petit pas vide ne compte pas');
});

test('demande : ce qui est coché, les trois réponses, le petit pas déjà placé, la liste fermée des freins ; rien de décoché', () => {
  const e = etatPret();
  L.mplCocherSource(e, 'papier', false);
  const d = L.mplDemande(MODELE, e, SOURCES);
  assert.ok(d && d.texte.startsWith('Consigne.'));
  assert.match(d.texte, /« Un travail manuel près de chez moi\. »/);
  assert.match(d.texte, /1\. « Je n’ai pas de voiture\. »/);
  assert.match(d.texte, /Nombre d’actions par semaine : 2\./);
  assert.match(d.texte, /Appeler un atelier près de chez moi.*ne le réécris pas, écris seulement 1 autre action pour la semaine 1/);
  assert.match(d.texte, /Menuisier ou menuisière/);
  assert.ok(!/Ce qui revient : fabriquer/.test(d.texte), 'le papier décoché ne part pas');
  assert.match(d.texte, /- mobilite : Se déplacer/);
  assert.match(d.texte, /- hebergement : /);
  assert.ok(!/\{DONNEES\}/.test(d.texte));
  assert.equal(L.mplDemande('', e, SOURCES), null, 'sans modèle');
  assert.equal(L.mplDemande(MODELE, L.mplEtatInitial(), SOURCES), null, 'sans « ce que je vise »');
  L.mplChoisirTemps(e, 'peu');
  assert.match(L.mplDemande(MODELE, e, SOURCES).texte, /aucune autre action pour la semaine 1/);
  const sansPas = L.mplDemande(MODELE, e, { metiers: ['A'] }).texte;
  assert.match(sansPas, /Pas de petit pas choisi : écris 1 action pour la semaine 1 aussi\./);
  assert.ok(!/[–—]/.test(L.mplDemande(MODELE, etatPret(), SOURCES).texte), 'aucun tiret long');
});

test('réponse : bloc lu, priorités plafonnées, « Si » et « alors » retirés, frein inconnu vidé, aucune question dans « parler »', () => {
  const r = L.mplAnalyserReponse(reponse(REP));
  assert.ok(r.ok, r.raison);
  assert.equal(r.parties.priorites.length, 3);
  assert.equal(r.parties.semaines.length, 4);
  assert.deepEqual(r.parties.obstacles[0], { si: 'je n’ai pas de voiture', alors: 'je demande les aides', frein: 'mobilite' });
  assert.equal(r.parties.obstacles[2].frein, '');
  assert.ok(r.parties.parler.every((p) => !/\?$/.test(p)));
  assert.equal(r.parties.parler.length, 2);
});

test('réponse : vide, coupée, illisible ou sans assez d’actions est refusée avec la bonne raison', () => {
  assert.equal(L.mplAnalyserReponse('').raison, 'vide');
  assert.equal(L.mplAnalyserReponse('Bonjour, je ne peux pas.').raison, 'illisible');
  assert.equal(L.mplAnalyserReponse(reponse(Object.assign({}, REP, { fin: '' }))).raison, 'coupee');
  assert.equal(L.mplAnalyserReponse('```json\n{"plan":1,"semaines":[["a"]\n```').raison, 'coupee');
  assert.equal(L.mplAnalyserReponse(reponse({ plan: 1, fin: 'complet', semaines: [['Une seule'], [], [], []] })).raison, 'sans_contenu');
  assert.ok(L.mplAnalyserReponse(reponse({ plan: 1, fin: 'complet', semaines: [{ actions: ['a'] }, { actions: ['b'] }] })).ok, 'semaines écrites comme objets');
});

test('plan : le petit pas en tête de la semaine 1 sans doublon, plafond par semaine, sujets de la personne en tête', () => {
  const e = etatPret();
  const r = L.mplAnalyserReponse(reponse(REP));
  assert.ok(L.mplPoserPlan(e, r.parties, SOURCES, '2026-11-26'));
  const p = L.mplPlan(e);
  assert.deepEqual(p.semaines[0].actions, [{ texte: 'Appeler un atelier près de chez moi', origine: 'pas' }, { texte: 'Noter ce que je sais faire', origine: '' }]);
  assert.ok(p.semaines.every((s) => s.actions.length <= 2));
  assert.equal(p.parler[0].origine, 'pas');
  assert.equal(p.parler.length, 2, 'le sujet déjà écrit par la personne n’est pas répété');
  assert.equal(p.joint, false);
  assert.deepEqual(p.sources, ['pas', 'papier', 'metiers']);
  assert.deepEqual(L.mplFreinsAvant(p), ['hebergement']);
  assert.equal(L.mplFrein('mobilite').titre, 'Se déplacer');
  assert.equal(L.mplFrein('inconnu'), null);
});

test('cases « Fait » et « Joindre » : seulement sur une action qui existe ; effacer retire tout', () => {
  const e = etatPret();
  L.mplPoserPlan(e, L.mplAnalyserReponse(reponse(REP)).parties, SOURCES, '2026-11-26');
  assert.ok(L.mplCocherFait(e, 0, 1, true));
  assert.ok(L.mplEstFait(e, 0, 1));
  assert.ok(!L.mplCocherFait(e, 0, 5, true));
  assert.ok(!L.mplCocherFait(e, 9, 0, true));
  L.mplCocherFait(e, 0, 1, false);
  assert.ok(!L.mplEstFait(e, 0, 1));
  assert.ok(L.mplJoindre(e, true));
  assert.ok(L.mplJoint(e));
  assert.ok(L.mplEffacerPlan(e));
  assert.equal(L.mplPlan(e), null);
  assert.ok(!L.mplJoindre(e, true));
});

test('une réponse reprise change : le plan est GARDÉ, un repère le dit (consigne 619)', () => {
  const e = etatPret();
  L.mplPoserPlan(e, L.mplAnalyserReponse(reponse(REP)).parties, SOURCES, '2026-11-26');
  assert.ok(!L.mplPlanAChange(e, SOURCES));
  const autre = JSON.parse(JSON.stringify(SOURCES)); autre.pas.action = 'Autre chose';
  assert.ok(L.mplPlanAChange(e, autre));
  assert.ok(L.mplPlan(e), 'le plan reste');
  const sansPapier = JSON.parse(JSON.stringify(SOURCES)); sansPapier.papier = null;
  assert.ok(L.mplPlanAChange(e, sansPapier));
  L.mplCocherSource(e, 'metiers', false);
  assert.ok(!L.mplPlanAChange(e, SOURCES), 'décocher après coup ne change pas ce que le plan a lu');
});

test('disquette : aller-retour identique, fichier abîmé relu avec méfiance, rien à garder = null', () => {
  assert.equal(L.mplPourFichier(L.mplEtatInitial()), null);
  const e = etatPret();
  L.mplCocherSource(e, 'papier', false);
  L.mplPoserPlan(e, L.mplAnalyserReponse(reponse(REP)).parties, SOURCES, '2026-11-26');
  L.mplCocherFait(e, 1, 0, true); L.mplJoindre(e, true);
  const f = L.mplPourFichier(e);
  const relu = L.mplDepuisFichier(JSON.parse(JSON.stringify(f)));
  assert.deepEqual(L.mplPourFichier(relu), f);
  const abime = L.mplDepuisFichier({ questions: { vise: 3, obstacles: ['a', 'a', 'b', 'c', 'd'], temps: 'beaucoup' }, coches: { papier: false, autre: false },
    plan: { date: 'hier', temps: 'x', sources: ['pas', 'pas', 'inconnu'], semaines: [{ actions: [{ texte: 'a' }, null, { texte: '' }] }, 'x'], obstacles: [{ si: 's', alors: 'a', frein: 'inventé' }], parler: ['texte nu'], faits: { '0-0': true, '0-5': true, '7-0': true, 'x': true } } });
  assert.equal(abime.questions.vise, '');
  assert.deepEqual(abime.questions.obstacles, ['a', 'b', 'c']);
  assert.equal(abime.questions.temps, 'moment');
  assert.deepEqual(abime.coches, { papier: false });
  assert.deepEqual(abime.plan.sources, ['pas']);
  assert.equal(abime.plan.date, '');
  assert.deepEqual(abime.plan.semaines[0].actions, [{ texte: 'a', origine: '' }]);
  assert.equal(abime.plan.obstacles[0].frein, '');
  assert.deepEqual(abime.plan.parler, []);
  assert.deepEqual(abime.plan.faits, { '0-0': true });
  assert.equal(L.mplDepuisFichier({ plan: { semaines: [] } }).plan, null, 'un plan sans action est laissé de côté');
  assert.ok(L.mplDepuisFichier(null).questions, 'toujours un état utilisable');
});

test('la vraie demande (prompts/mon-plan.md) : repère {DONNEES}, champs lus par le code, notes jamais envoyées, aucun tiret long hors de la règle', () => {
  const fs = require('node:fs');
  const modele = fs.readFileSync(require('node:path').join(__dirname, '..', 'prompts', 'mon-plan.md'), 'utf8');
  assert.match(modele, /\{DONNEES\}/);
  ['"plan"', '"rappel"', '"priorites"', '"semaines"', '"obstacles"', '"si"', '"alors"', '"frein"', '"parler"', '"fin"', '"complet"'].forEach((c) => assert.ok(modele.includes(c), c));
  const d = L.mplDemande(modele, etatPret(), SOURCES).texte;
  assert.ok(!/<!--|-->|consigne 532/.test(d), 'les notes du fichier ne partent pas');
  assert.equal((d.match(/[–—]/g) || []).length, 2, 'seulement les deux tirets cités dans la règle « jamais de tiret long »');
  assert.match(d, /Ce qu’elle vise dans le travail/);
});

test('textes fixes : français sans tiret long, point de la semaine en trois questions ouvertes', () => {
  assert.equal(L.MPL_POINT_SEMAINE.length, 3);
  assert.ok(L.MPL_POINT_SEMAINE.every((q) => /\?$/.test(q)));
  const tous = [L.MPL_TITRE, L.MPL_PRUDENCE, L.MPL_PRUDENCE_ECRAN, L.MPL_ORIGINE_PAS, L.MPL_ORIGINE_PARLER].concat(L.MPL_POINT_SEMAINE, Object.values(L.MPL_MESSAGES_ECHEC), L.MPL_TEMPS.map((t) => t.lib));
  tous.forEach((t) => { assert.ok(!/[–—]/.test(t), t); assert.ok(!/\bIA\b|\bon\b|bravo/i.test(t), t); });
});

test('réponse réelle de ChatGPT (essai du 26/11/2026) : « Si Je… » devient « si je… », un mot qui commence par « si » n’est jamais coupé', () => {
  const r = L.mplAnalyserReponse(reponse({
    plan: 1, rappel: 'Vous visez un travail.', priorites: ['Voir'], semaines: [['A'], ['B'], ['C'], ['D']], fin: 'complet', parler: [],
    obstacles: [
      { si: 'Je n\'ai pas le permis et le bus passe peu.', alors: 'Je demande à mon conseiller de m\'aider.', frein: 'mobilite' },
      { si: 'Simplement je doute', alors: 'Alors, J’en parle à un proche.', frein: '' },
      { si: 'Pôle de santé fermé', alors: 'SMS à un proche', frein: '' }
    ]
  }));
  assert.ok(r.ok);
  assert.deepEqual(r.parties.obstacles.map((o) => [o.si, o.alors]), [
    ['je n\'ai pas le permis et le bus passe peu', 'je demande à mon conseiller de m\'aider'],
    ['Simplement je doute', 'j’en parle à un proche'],
    ['Pôle de santé fermé', 'SMS à un proche']
  ]);
});

test('demande : le temps choisi est écrit en minuscule au milieu de la phrase, pour les trois choix', () => {
  ['peu', 'moment', 'plusieurs'].forEach((id) => {
    const e = etatPret(); L.mplChoisirTemps(e, id);
    const d = L.mplDemande(MODELE, e, SOURCES);
    assert.ok(d.texte.includes('y consacrer : ' + L.mplTemps(id).lib.charAt(0).toLowerCase() + L.mplTemps(id).lib.slice(1) + '.'), id);
  });
});

test('aucune fonction déclarée deux fois dans les fichiers de « Mon plan » (la seconde écraserait la première sans prévenir)', () => {
  const fs = require('node:fs'), path = require('node:path');
  ['logique.js', 'document.js', 'index.js'].forEach((f) => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'modules', 'mon-plan', f), 'utf8');
    const noms = [...src.matchAll(/^function (\w+)/gm)].map((m) => m[1]);
    const doublons = noms.filter((n, i) => noms.indexOf(n) !== i);
    assert.deepEqual(doublons, [], f);
  });
});
