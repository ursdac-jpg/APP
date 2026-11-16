// Consignes 401 et 408 : qui choisit les missions et les compétences ? Le choix « assistant » éteint les fonctions de « Vos missions et compétences » pour CE CV.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

function charger(dossier, extra) {
  const code = readFileSync('modules/missions-competences/logique.js', 'utf8') + '\n' + readFileSync('modules/missions-competences/choix.js', 'utf8');
  const ctx = Object.assign({ dossier, module: undefined }, extra || {});
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return ctx;
}

test('sans choix ou avec « moi », les fonctions sont actives ; avec « assistant », elles sont éteintes', () => {
  assert.equal(charger({}).mcActifPourCeCv(), true);
  assert.equal(charger({ missionsChoisiesPar: 'moi' }).mcActifPourCeCv(), true);
  assert.equal(charger({ missionsChoisiesPar: 'assistant' }).mcActifPourCeCv(), false);
});

test('la question n\u2019est posee que pour « Creer un nouveau CV » avec l\u2019assistant, une seule fois, sans experience deja saisie', () => {
  assert.equal(charger({ modeCreation: 'nouveau', creationSansAssistant: false, experiences: [] }).missionsChoixAPoser(), true);
  assert.equal(charger({ modeCreation: 'nouveau', creationSansAssistant: true, experiences: [] }).missionsChoixAPoser(), false, 'a la main : jamais');
  assert.equal(charger({ modeCreation: 'nouveau', creationSansAssistant: false, missionsChoisiesPar: 'moi', experiences: [] }).missionsChoixAPoser(), false, 'deja repondu : irrevocable');
  assert.equal(charger({ modeCreation: 'nouveau', creationSansAssistant: false, experiences: [{ poste: 'Cuisinier' }] }).missionsChoixAPoser(), false, 'session deja commencee');
  assert.equal(charger({ modeCreation: 'maj', experiences: [] }).missionsChoixAPoser(), false, 'les autres parcours viendront aux lots suivants');
});

test('la route de depart d\u2019un nouveau CV avec l\u2019assistant est la question, puis « Votre objectif »', () => {
  assert.equal(charger({ modeCreation: 'nouveau', creationSansAssistant: false, experiences: [] })._creerCvRouteDepart(), 'choix-missions');
  assert.equal(charger({ modeCreation: 'nouveau', creationSansAssistant: true, experiences: [] })._creerCvRouteDepart(), 'objectif');
});

test('l\u2019ecran « Candidater » de l\u2019accueil pose aussi la question avant « Votre objectif » (lot 2)', () => {
  const app = readFileSync('js/app.js', 'utf8');
  const debut = app.indexOf("if (rg.cvExiste === 'non') {");
  const fin = app.indexOf("// rg.cvExiste === 'oui' -> import obligatoire");
  assert.ok(debut > 0 && fin > debut, 'bloc de l\u2019ancien ecran retrouve');
  const bloc = app.slice(debut, fin);
  assert.match(bloc, /missionsChoisiesPar = null/, 'un nouveau CV repose la question');
  assert.match(bloc, /creationSansAssistant = false/, 'cet ecran ne propose pas « a la main »');
  assert.match(bloc, /_creerCvRouteDepart\(\)/, 'la route de depart est la question');
});

test('lot 3 : la question est posee a l\u2019entree de la voie 1 de « Reprendre mon CV », jamais pour les autres voies', () => {
  const voie1 = { _prepLEMode: 'maj', _reprendreCvActif: false, _prepLEEcran: 'depot' };
  assert.equal(charger({ modeCreation: 'maj', experiences: [] }, voie1).missionsChoixAPoserReprise(), true);
  assert.equal(charger({ modeCreation: 'maj', experiences: [] }, Object.assign({}, voie1, { _prepLEMode: 'reformuler' })).missionsChoixAPoserReprise(), false, 'voie 2 : jamais');
  assert.equal(charger({ modeCreation: 'maj', experiences: [] }, Object.assign({}, voie1, { _reprendreCvActif: true })).missionsChoixAPoserReprise(), false, 'sur la page des trois voies : pas encore');
  assert.equal(charger({ modeCreation: 'maj', missionsChoisiesPar: 'moi', missionsChoisiesVoie: 'maj', experiences: [] }, voie1).missionsChoixAPoserReprise(), false, 'deja repondu pour ce parcours');
  assert.equal(charger({ modeCreation: 'maj', missionsChoisiesPar: 'assistant', missionsChoisiesVoie: 'nouveau', experiences: [] }, voie1).missionsChoixAPoserReprise(), true, 'un choix fait pour un autre parcours ne compte pas ici');
  assert.equal(charger({ modeCreation: 'maj', _modeCreationVia: 'maj', experiences: [{ poste: 'Cuisinier' }] }, voie1).missionsChoixAPoserReprise(), false, 'experiences deja extraites par ce parcours');
});

test('lot 3 : un choix « assistant » n\u2019eteint que le parcours pour lequel il a ete fait', () => {
  assert.equal(charger({ missionsChoisiesPar: 'assistant', missionsChoisiesVoie: 'maj', modeCreation: 'maj', _modeCreationVia: 'maj' }).mcActifPourCeCv(), false, 'voie 1 choisie : eteint');
  assert.equal(charger({ missionsChoisiesPar: 'assistant', missionsChoisiesVoie: 'maj', modeCreation: 'maj', _modeCreationVia: 'sans' }).mcActifPourCeCv(), true, 'voie 3 : jamais eteint');
  assert.equal(charger({ missionsChoisiesPar: 'assistant', missionsChoisiesVoie: 'nouveau', modeCreation: 'maj', _modeCreationVia: 'maj' }).mcActifPourCeCv(), true, 'autre parcours : actif');
  assert.equal(charger({ missionsChoisiesPar: 'assistant', modeCreation: 'nouveau' }).mcActifPourCeCv(), false, 'session d\u2019avant : vaut partout, comme avant');
});

test('lot 3 : la voie 3 (sans assistant) engagee n\u2019est jamais eteinte, meme si son depot est celui de la voie 1', () => {
  const d = { missionsChoisiesPar: 'assistant', missionsChoisiesVoie: 'maj', modeCreation: 'maj', _modeCreationVia: 'maj' };
  assert.equal(charger(d, { csaVoieEngagee: () => true }).mcActifPourCeCv(), true);
  assert.equal(charger(d, { csaVoieEngagee: () => false }).mcActifPourCeCv(), false);
});

test('lot 4 : le recit pose la question avant de demarrer, et recommence a zero a chaque nouvelle session', () => {
  let navigue = null;
  const ctx = charger({ missionsChoisiesPar: 'moi', missionsChoisiesVoie: 'recit', experiences: [] }, { MC_OUVERT_FORCE: 1, naviguerVers: (r) => { navigue = r; } });
  let demarre = 0;
  assert.equal(ctx.missionsChoixPourRecit(() => { demarre++; }), true);
  assert.equal(navigue, 'choix-missions');
  assert.equal(ctx.dossier.missionsChoisiesPar, null, 'une reponse restee d\u2019un CV d\u2019avant ne compte plus');
  assert.equal(demarre, 0, 'la session ne demarre pas avant la reponse');
  ctx.cmDemarrerRecit();
  assert.equal(demarre, 1, 'elle demarre apres la reponse, une seule fois');
  ctx.cmDemarrerRecit();
  assert.equal(demarre, 1);
});

test('lot 4 : la voie « recit » est reconnue, et seul le choix « moi » demande les metiers a l\u2019assistant', () => {
  assert.equal(charger({ modeCreation: null, decouverteTerminee: true }).mcVoieDuChoix(), 'recit');
  assert.equal(charger({ modeCreation: null }, { _decouverteRenduEtape: () => {} }).mcVoieDuChoix(), 'recit');
  assert.equal(charger({ modeCreation: null }).mcVoieDuChoix(), null);
  assert.equal(charger({ missionsChoisiesPar: 'assistant', missionsChoisiesVoie: 'recit', modeCreation: null }, { _decouverteRenduEtape: () => {} }).mcActifPourCeCv(), false, 'recit + assistant : eteint');
  assert.equal(charger({ missionsChoisiesPar: 'moi', missionsChoisiesVoie: 'recit' }).mcRecitDemandeLesMetiers(), true);
  assert.equal(charger({ missionsChoisiesPar: 'assistant', missionsChoisiesVoie: 'recit' }).mcRecitDemandeLesMetiers(), false);
  assert.equal(charger({ missionsChoisiesPar: 'moi', missionsChoisiesVoie: 'nouveau' }).mcRecitDemandeLesMetiers(), false);
});

test('lot 4 : les metiers proposes relient les experiences sans jamais ecraser un choix de la personne', () => {
  const etape = require('../modules/missions-competences/etape.js');
  const trouver = (t) => ({ 'Aide-cuisinier': 'G1602', 'Plongeur en restauration': 'G1605', 'Serveur': 'G1803', 'Inconnu': null })[t] || null;
  const etat = etape.mcEtatVide();
  const exps = [
    { poste: 'Travail en cuisine', entreprise: 'A', metiersProches: ['Aide-cuisinier', 'Plongeur en restauration', 'Inconnu', 'Aide-cuisinier'] },
    { poste: 'Service en salle', entreprise: 'B', metiersProches: ['Inconnu'] },
    { poste: 'Plonge', entreprise: 'D', metiersProches: ['Inconnu', 'Serveur'] },
    { poste: 'Autre', entreprise: 'C' }
  ];
  assert.equal(etape.mcRattacherMetiersProposes(etat, exps, trouver), 1);
  assert.equal(etat.fiches[exps[0].idEtape], 'G1602');
  assert.deepEqual(etat.metiersPlus[exps[0].idEtape], ['G1605']);
  assert.equal(etat.fiches[exps[1].idEtape], undefined, 'aucun metier reconnu : rien n\u2019est devine');
  assert.equal(etat.fiches[exps[2].idEtape], undefined, 'le premier propose n’est pas reconnu : on ne prend pas un voisin comme principal');
  // un choix de la personne (y compris « aucune fiche ne convient ») n\u2019est jamais ecrase
  const etat2 = etape.mcEtatVide();
  const exps2 = [{ poste: 'Travail en cuisine', entreprise: 'A', metiersProches: ['Serveur'] }];
  etape.mcRelier(etat2, exps2); etat2.fiches[exps2[0].idEtape] = null;
  assert.equal(etape.mcRattacherMetiersProposes(etat2, exps2, trouver), 0);
  assert.equal(etat2.fiches[exps2[0].idEtape], null);
});

test('lot 4 : le prompt complementaire est charge par l\u2019application et n\u2019est ajoute qu\u2019avec le choix « moi »', () => {
  const app = readFileSync('js/app.js', 'utf8');
  assert.ok(app.includes("'decouverte-metiers': 'prompts/decouverte-metiers.md'"));
  assert.ok(app.includes("'decouverte-metiers': null"));
  const parcours = readFileSync('modules/decouverte-competences/decouverteParcours.js', 'utf8');
  assert.match(parcours, /mcRecitDemandeLesMetiers\(\)[\s\S]{0,200}promptsExternesCharges\['decouverte-metiers'\]/);
  const prompt = readFileSync('prompts/decouverte-metiers.md', 'utf8');
  assert.ok(prompt.includes('metiersProches') && !/[\u2013\u2014]/.test(prompt));
});
