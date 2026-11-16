const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const etape = require('../modules/missions-competences/etape.js');

// Lot 7 (consigne 313) : le message du CV pour le chemin (a) = instructions du CV + bloc « choix de la personne » + profil + section des choix.
const racine = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(racine, 'js', 'app.js'), 'utf8');
const ui = fs.readFileSync(path.join(racine, 'modules', 'missions-competences', 'ui.js'), 'utf8');
const bloc = fs.readFileSync(path.join(racine, 'prompts', 'cv-choix-personne.md'), 'utf8');

function etatAvec(miss, perso, comp) {
  const e = etape.mcEtatVide();
  e.ordre = ['x1', 'x2'];
  e.miss = miss || {}; e.perso = perso || {}; e.comp = comp || {};
  return e;
}
const experiences = [
  { idEtape: 'x1', poste: 'Caissier', entreprise: 'Super U', missions: 'Tenir la caisse\nAccueillir le public' },
  { idEtape: 'x2', poste: 'Livreur', entreprise: '', missions: 'Conduire un camion' }
];

test('la section des choix liste les lignes de la personne par expérience, et seulement celles où elle a choisi', () => {
  const etat = etatAvec({ x1: ['Accueillir le public'] }, {}, { x1: { sf: ['Soins'], se: ['Patience'] } });
  const s = etape.mcSectionChoixPersonne(etat, experiences);
  assert.ok(s.startsWith('CHOIX DE LA PERSONNE (à ne pas modifier)\n'));
  assert.ok(s.includes('Expérience : Caissier, Super U\n- Tenir la caisse\n- Accueillir le public\n'));
  assert.ok(!s.includes('Livreur'), "aucun choix pour cette expérience : elle n'apparaît pas");
  assert.ok(s.includes('Savoir-faire : Soins') && s.includes('Savoir-être : Patience'));
  assert.ok(!s.includes('Savoirs :'), 'jamais une rubrique vide');
});

test('la section des choix : vide sans choix (jamais un titre suivi de rien), activités précises rangées avec les savoir-faire', () => {
  assert.equal(etape.mcSectionChoixPersonne(etape.mcEtatVide(), experiences), '');
  assert.equal(etape.mcSectionChoixPersonne(null, experiences), '');
  const etat = etatAvec({}, {}, { x1: { sf: ['Soins'], k: ['Aider à la toilette'] } });
  const s = etape.mcSectionChoixPersonne(etat, experiences);
  assert.ok(s.includes('Savoir-faire : Soins ; Aider à la toilette'));
  assert.ok(!s.includes('Expérience :'), 'des compétences seules : pas de bloc missions');
});

test('assemblage : instructions, bloc, profil, section, dans cet ordre ; une pièce manquante donne le message normal', () => {
  const m = etape.mcAssemblerMessageChemin('INSTR', 'BLOC', 'PROFIL', 'SECTION');
  assert.ok(m.indexOf('INSTR') < m.indexOf('BLOC') && m.indexOf('BLOC') < m.indexOf('PROFIL') && m.indexOf('PROFIL') < m.indexOf('SECTION'));
  assert.equal(etape.mcAssemblerMessageChemin(null, 'BLOC', 'PROFIL', 'SECTION'), '');
  assert.equal(etape.mcAssemblerMessageChemin('INSTR', '  ', 'PROFIL', 'SECTION'), '', 'bloc pas encore chargé');
  assert.equal(etape.mcAssemblerMessageChemin('INSTR', 'BLOC', 'PROFIL', ''), '');
});

test('le bloc de consignes : les cinq règles, les trois champs, la priorité sur le point 6, rien de interdit', () => {
  assert.ok(bloc.includes('priment sur le point 6'));
  assert.ok(bloc.includes('Ne modifie jamais une ligne choisie'));
  ['doublonsMissions', 'competencesEnPlus', 'missionsPlusCourtes', 'missionsEnAvant', 'savoirFaireParExperience'].forEach((c) => assert.ok(bloc.includes('`' + c + '`') || bloc.includes('"' + c + '"'), c));
  assert.ok(!bloc.includes(String.fromCharCode(0x2013)) && !bloc.includes(String.fromCharCode(0x2014)), 'jamais de tiret long');
  assert.ok(!/\bIA\b/.test(bloc), 'jamais le mot IA');
  assert.ok(bloc.includes('Accord grammatical'));
});

test('le bloc est enregistré et chargé comme les autres prompts, et le message du CV passe par la brique seulement dans le chemin (a)', () => {
  assert.ok(app.includes("'cv-choix-personne': 'prompts/cv-choix-personne.md'"));
  assert.ok(app.includes("'cv-choix-personne': null"));
  assert.ok(app.includes("type === 'cv' && !clePromptOverride && typeof mcMessageCVChemin === 'function' && mcMessageCVChemin(texteProfilEffectif(type))"));
  assert.ok(app.includes('promptCache(cleP, texteProfilEffectif(type))'), 'le message d\'avant reste le repli');
  const corps = ui.slice(ui.indexOf('function mcMessageCVChemin'));
  assert.ok(corps.includes("MC_OUVERT !== true") && corps.includes("mcCheminAssistant(dossier.etapeMC) !== 'a'"));
  assert.ok(corps.includes("promptsExternesCharges['cv-choix-personne']"));
});

const sansLien = fs.readFileSync(path.join(racine, 'prompts', 'cv-missions-sans-lien.md'), 'utf8');

test('missions sans lien (consigne 322) : complément séparé, utilisé dans les deux chemins, jamais d\'invention, jamais de tiret long', () => {
  assert.ok(sansLien.includes('savoirFaireParExperience') && sansLien.includes('2 à 4 missions') && sansLien.includes('N’invente jamais'));
  assert.ok(!sansLien.includes(String.fromCharCode(0x2013)) && !sansLien.includes(String.fromCharCode(0x2014)) && !/\bIA\b/.test(sansLien));
  assert.ok(!bloc.includes('Expériences non listées'), 'la règle vit à un seul endroit');
  assert.ok(app.includes("'cv-missions-sans-lien': 'prompts/cv-missions-sans-lien.md'") && app.includes("'cv-missions-sans-lien': null"));
  const corps = ui.slice(ui.indexOf('function mcMessageCVChemin'), ui.indexOf('Lot 6 (consigne 312)'));
  assert.ok(corps.includes("promptsExternesCharges['cv-missions-sans-lien']") && corps.includes('mcAssemblerMessageSansChoix('));
  const m = etape.mcAssemblerMessageSansChoix('INSTR', 'COMPL', 'PROFIL');
  assert.ok(m.indexOf('INSTR') < m.indexOf('COMPL') && m.indexOf('COMPL') < m.indexOf('PROFIL'));
  assert.equal(etape.mcAssemblerMessageSansChoix('INSTR', ' ', 'PROFIL'), '', 'complément pas encore chargé : le message d\'avant');
  assert.equal(etape.mcAssemblerMessageSansChoix(null, 'COMPL', 'PROFIL'), '');
});

test('cv.md n\'est pas touché : le chemin (b) garde exactement son prompt de base', () => {
  const cv = fs.readFileSync(path.join(racine, 'prompts', 'cv.md'), 'utf8');
  assert.ok(!cv.includes('doublonsMissions') && !cv.includes('CHOIX DE LA PERSONNE'));
});

// Lecture des trois nouveaux champs de la réponse.
const src = app.slice(app.indexOf('function _retirerMarkdownIA'), app.indexOf('function normaliserQuestionAnticipeeIA'));
const src2 = app.slice(app.indexOf('function normaliserDoublonsMissionsIA'), app.indexOf('function normaliserEngagementsAvecMissionsIA'));
const lire = new Function(src + '\n' + src2 + '; return { d: normaliserDoublonsMissionsIA, c: normaliserCompetencesEnPlusIA, m: normaliserMissionsPlusCourtesIA, a: normaliserMissionsEnAvantIA };')();

test('doublons : une paire au moins, lignes nettoyées ; le reste est écarté sans erreur', () => {
  assert.deepEqual(lire.d([{ poste: 'Caissier', entreprise: 'Super U', lignes: ['Accueillir', ' Recevoir les clients '] }]),
    [{ poste: 'Caissier', entreprise: 'Super U', lignes: ['Accueillir', 'Recevoir les clients'] }]);
  assert.deepEqual(lire.d([{ poste: 'X', lignes: ['Une seule'] }, null, 'texte']), []);
  assert.deepEqual(lire.d(undefined), []);
});

test('compétences en plus : type limité à savoirFaire / savoirEtre, sans nom elles sont écartées', () => {
  const r = lire.c([{ competence: 'Patience', type: 'savoirEtre', justification: 'Vu au bénévolat.' }, { competence: 'Soins', type: 'autre' }, { type: 'savoirFaire' }, null]);
  assert.equal(r.length, 2);
  assert.equal(r[0].type, 'savoirEtre');
  assert.equal(r[1].type, 'savoirFaire', 'un type inconnu retombe sur savoir-faire');
  assert.deepEqual(lire.c('n\'importe quoi'), []);
});

test('versions plus courtes : il faut la ligne d\'origine ET une version différente', () => {
  const r = lire.m([
    { poste: 'A', ligne: 'Une très longue phrase.', plusCourte: 'Une phrase.' },
    { poste: 'B', ligne: 'Même texte', plusCourte: 'Même texte' },
    { poste: 'C', ligne: 'Sans version' },
    { poste: 'D', plusCourte: 'Sans origine' }
  ]);
  assert.equal(r.length, 1);
  assert.equal(r[0].plusCourte, 'Une phrase.');
});

test('les trois champs sont lus, attendus, gardés à part et repris au « Je valide »', () => {
  ['doublonsMissions', 'competencesEnPlus', 'missionsPlusCourtes', 'missionsEnAvant'].forEach((c) => {
    assert.ok(app.includes(c + ': normaliser'), 'lu dans la réponse : ' + c);
    assert.ok(app.includes("'" + c + "'"), 'attendu : ' + c);
    assert.ok(app.includes(c + ': reco.' + c + ' || []'), 'brouillon : ' + c);
    assert.ok(app.includes(c + ': brouillon.' + c + ' || []'), 'au « Je valide » : ' + c);
  });
});
