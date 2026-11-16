const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Recherche de la fiche d'un poste (lot 2, règles validées par Denis le 14/11/2026, consigne 301). Essayée sur le répertoire réel du ROME.
const m = require('../modules/missions-competences/rechercheFiche.js');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', 'repertoireRome.js'), 'utf8') + ';this.REP=REPERTOIRE_ROME;', ctx);
const REP = ctx.REP;
const cherche = (poste, options) => m.mcChercherFiche(poste, REP, options);
const codes = (r) => r.fiches.map((f) => f.code);

test('les formes d\'un même mot se rapprochent, sans couper les mots', () => {
  assert.equal(m.mcRacine('serveuse'), m.mcRacine('serveur'));
  assert.equal(m.mcRacine('caissiere'), m.mcRacine('caissier'));
  assert.equal(m.mcRacine('chevaux'), m.mcRacine('cheval'));
  assert.equal(m.mcRacine('maternelle'), m.mcRacine('maternel'));
  assert.equal(m.mcRacine('employee'), m.mcRacine('employe'));
  assert.notEqual(m.mcRacine('interim'), m.mcRacine('interieur'));
  assert.notEqual(m.mcRacine('commercant'), m.mcRacine('commercial'));
});

test('niveau A : un poste reconnu donne une seule fiche présélectionnée', () => {
  [['Serveuse', 'G1803'], ['Cariste', 'N1101'], ['Aide-soignante', 'J1501'], ['Caissière', 'D1505'], ['Éboueur', 'K2303'], ['Femme de chambre', 'G1501'],
   ['Assistante maternelle', 'K1310'], ['Mécanicien automobile', 'I1604'], ['Distribution de prospectus', 'M1615']].forEach(([poste, code]) => {
    const r = cherche(poste);
    assert.equal(r.niveau, 'A', poste);
    assert.equal(r.preselection.code, code, poste);
    assert.equal(r.fiches.length, 1, poste);
  });
});

test('niveau B : plusieurs fiches presque à égalité, aucune présélectionnée, cinq au plus', () => {
  const r = cherche('Auxiliaire de vie');
  assert.equal(r.niveau, 'B');
  assert.equal(r.preselection, null);
  assert.ok(codes(r).includes('K1306') && codes(r).length >= 3);
  const e = cherche('Agent d\'entretien');
  assert.equal(e.niveau, 'B');
  assert.ok(e.fiches.length <= m.MC_NB_MAX_LISTE);
});

test('niveau C : fiches approchantes, avec priorité au secteur des autres expériences', () => {
  const r = cherche('Soins aux chevaux d\'un voisin');
  assert.equal(r.niveau, 'C');
  assert.equal(r.preselection, null);
  assert.ok(codes(r).includes('A1439'));
  const prio = cherche('Soins aux chevaux d\'un voisin', { secteursPrioritaires: ['Commerce et vente'] });
  assert.equal(prio.niveau, 'C', 'la priorité range la liste, elle ne change jamais le niveau');
  assert.equal(prio.fiches[0].code, 'D1116');
});

test('niveau D : un intitulé vague ou introuvable ne donne aucune fiche et aucun secteur affirmé', () => {
  ['Petits boulots', 'Intérim', 'Missions diverses', 'Travail saisonnier', 'Job étudiant', 'Bénévolat', 'Aide aux devoirs', '', '   '].forEach((poste) => {
    const r = cherche(poste);
    assert.equal(r.niveau, 'D', poste);
    assert.deepEqual(r.fiches, [], poste);
    assert.equal(r.preselection, null, poste);
    assert.deepEqual(r.secteurs, [], poste);
  });
});

test('mieux vaut rien qu\'une fausse fiche : les fausses rencontres mesurées sont écartées', () => {
  assert.ok(!cherche('Intérim').fiches.some((f) => /int[ée]rieur/i.test(f.nom)));
  assert.notEqual(cherche('Commerçant').niveau, 'A');
  assert.ok(!cherche('Enseignante du primaire').fiches.some((f) => /enseigniste/i.test(f.nom)));
  assert.ok(!cherche('Serveuse').fiches.some((f) => /administrateur/i.test(f.nom)), 'une fiche présélectionnée est seule');
});

test('les mots vagues autour d\'un vrai métier sont ignorés', () => {
  const r = cherche('Travail saisonnier en vendanges');
  assert.ok(r.fiches.length > 0);
  assert.ok(codes(r).includes('A1401'));
});

test('les seuils validés sont ceux du plan', () => {
  assert.equal(m.MC_SEUIL_TROUVEE, 0.85);
  assert.equal(m.MC_ECART_MINI, 0.10);
  assert.equal(m.MC_SEUIL_PROCHES, 0.75);
  assert.equal(m.MC_SEUIL_APPROCHANTES, 0.5);
});

test('le fichier de recherche est chargé par la page d\'accueil, avant js/app.js', () => {
  const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const pos = index.indexOf('modules/missions-competences/rechercheFiche.js');
  assert.ok(pos > 0 && pos < index.indexOf('<script src="js/app.js"'));
});
