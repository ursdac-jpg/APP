const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Lot 1 du panneau « Vos expériences professionnelles » (consignes 388 et 390) : plusieurs métiers par expérience et traçabilité
// de ce qui vient du panneau. Plan : docs/PLAN_DE_CODAGE_PANNEAU_EXPERIENCES_PRO_2026-11-15.md. Essayé sur les fiches réelles du ROME.
const m = require('../modules/missions-competences/etape.js');
const racine = path.join(__dirname, '..');
const ctx = {}; vm.createContext(ctx);
fs.readdirSync(path.join(racine, 'data', 'rome')).filter((f) => /^fiche_[A-N]\.js$/.test(f))
  .forEach((f) => vm.runInContext(fs.readFileSync(path.join(racine, 'data', 'rome', f), 'utf8'), ctx));
vm.runInContext(fs.readFileSync(path.join(racine, 'data', 'metiersRome.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(racine, 'data', 'metiers.js'), 'utf8') + ';this.F=FICHES_ROME;this.M=baseMetiers;', ctx);
const FICHES = ctx.F, METIERS = ctx.M;
const fiche = (code) => m.mcFicheNormalisee(code, FICHES, METIERS);
const CODES = ['G1803', 'G1602', 'G1601', 'G1802', 'G1804', 'G1805'];
const PAR_CODE = {}; CODES.forEach((c) => { PAR_CODE[c] = fiche(c); });

function nouvelEtat() {
  const etat = m.mcEtatVide();
  const ids = m.mcRelier(etat, [{ poste: 'Serveur', entreprise: 'Brasserie' }, { poste: 'Aide cuisinier', entreprise: 'Restaurant' }]);
  return { etat, ids };
}

test('les fiches de référence existent et ont des missions et des compétences', () => {
  CODES.forEach((c) => { assert.ok(PAR_CODE[c], c); assert.ok(PAR_CODE[c].m.length > 0, c + ' missions'); });
  assert.ok(PAR_CODE.G1803.sf.length + PAR_CODE.G1803.se.length + PAR_CODE.G1803.sv.length > 0);
});

test('état vide et ancien dossier : les nouveaux champs existent, vides, sans rien casser', () => {
  const vide = m.mcEtatVide();
  assert.deepEqual(vide.metiersPlus, {});
  assert.deepEqual(vide.panneau, {});
  const ancien = m.mcEtatNormalise({ version: 1, ordre: ['x1'], experiences: { x1: { poste: 'A', entreprise: 'B' } }, fiches: { x1: 'G1803' }, miss: { x1: ['u'] } });
  assert.deepEqual(ancien.metiersPlus, {});
  assert.deepEqual(ancien.panneau, {});
  assert.equal(ancien.fiches.x1, 'G1803');
  assert.deepEqual(m.mcCodesMetiers(ancien, 'x1'), ['G1803']);
});

test('normalisation : au plus quatre autres métiers, sans doublon, valeurs abîmées ignorées', () => {
  const e = m.mcEtatNormalise({ metiersPlus: { x1: ['A', 'A', 'B', 'C', 'D', 'E', 'F', 3, null], x2: 'pas une liste', x3: [] }, panneau: { x1: { miss: ['a', 7], comp: { sf: ['b'], zz: ['c'] } }, x2: 5 } });
  assert.deepEqual(e.metiersPlus.x1, ['A', 'B', 'C', 'D']);
  assert.equal(e.metiersPlus.x2, undefined);
  assert.equal(e.metiersPlus.x3, undefined);
  assert.deepEqual(e.panneau.x1, { miss: ['a'], comp: { sf: ['b'] } });
  assert.equal(e.panneau.x2, undefined);
});

test('mcFusionnerFiches : le métier principal d\'abord, aucun doublon, null si rien', () => {
  assert.equal(m.mcFusionnerFiches([]), null);
  assert.equal(m.mcFusionnerFiches([null, undefined]), null);
  const f = m.mcFusionnerFiches([PAR_CODE.G1803, PAR_CODE.G1602, PAR_CODE.G1803]);
  assert.equal(f.code, 'G1803');
  assert.deepEqual(f.codes, ['G1803', 'G1602']);
  ['m', 'sf', 'se', 'sv', 'k'].forEach((t) => {
    assert.equal(new Set(f[t].map(m.mcCleTexte)).size, f[t].length, 'doublon dans ' + t);
  });
  assert.deepEqual(f.m.slice(0, PAR_CODE.G1803.m.length), PAR_CODE.G1803.m);
  assert.ok(f.m.length >= PAR_CODE.G1803.m.length);
});

test('mcDefinirMetiers : principal et autres, cinq au plus, sans doublon', () => {
  const { etat, ids } = nouvelEtat();
  assert.equal(m.mcDefinirMetiers(etat, ids[0], ['G1803', 'G1602', 'G1803', 'G1601', 'G1802', 'G1804', 'G1805'], PAR_CODE), true);
  assert.equal(etat.fiches[ids[0]], 'G1803');
  assert.deepEqual(etat.metiersPlus[ids[0]], ['G1602', 'G1601', 'G1802', 'G1804']);
  assert.deepEqual(m.mcCodesMetiers(etat, ids[0]), ['G1803', 'G1602', 'G1601', 'G1802', 'G1804']);
  assert.equal(m.mcCodesMetiers(etat, ids[1]).length, 0);
});

test('mcDefinirMetiers : un seul métier retire la liste des autres ; liste vide = aucun métier', () => {
  const { etat, ids } = nouvelEtat();
  m.mcDefinirMetiers(etat, ids[0], ['G1803', 'G1602'], PAR_CODE);
  m.mcDefinirMetiers(etat, ids[0], ['G1803'], PAR_CODE);
  assert.equal(etat.metiersPlus[ids[0]], undefined);
  m.mcDefinirMetiers(etat, ids[0], [], PAR_CODE);
  assert.equal(etat.fiches[ids[0]], null);
  assert.deepEqual(m.mcCodesMetiers(etat, ids[0]), []);
});

test('changer de métiers garde ce qui est encore proposé, retire le reste, ne touche jamais aux mots de la personne', () => {
  const { etat, ids } = nouvelEtat(), id = ids[0];
  m.mcDefinirMetiers(etat, id, ['G1803', 'G1602'], PAR_CODE);
  const missServeur = PAR_CODE.G1803.m[0];
  const missCuisine = PAR_CODE.G1602.m.find((x) => !PAR_CODE.G1803.m.includes(x));
  assert.ok(missCuisine);
  m.mcBasculerMission(etat, id, missServeur);
  m.mcBasculerMission(etat, id, missCuisine);
  m.mcAjouterMissionPerso(etat, id, 'Préparer 80 couverts par service');
  m.mcAjouterCompetencePerso(etat, id, 'Gérer une file d’attente');
  const sfCuisine = PAR_CODE.G1602.sf.find((x) => !PAR_CODE.G1803.sf.includes(x));
  if (sfCuisine) { m.mcBasculerCompetence(etat, id, 'sf', sfCuisine); }
  // on retire le métier de cuisine : ses missions cochées disparaissent, celles du serveur et les mots de la personne restent
  assert.equal(m.mcDefinirMetiers(etat, id, ['G1803'], PAR_CODE), true);
  assert.ok(etat.miss[id].includes(missServeur));
  assert.ok(!etat.miss[id].includes(missCuisine));
  assert.ok(etat.perso[id].includes('Préparer 80 couverts par service'));
  assert.ok((etat.comp[id].sf || []).includes('Gérer une file d’attente'));
  if (sfCuisine) { assert.ok(!(etat.comp[id].sf || []).includes(sfCuisine)); }
});

test('une fiche pas encore chargée : rien n\'est retiré et la fonction le dit', () => {
  const { etat, ids } = nouvelEtat(), id = ids[0];
  m.mcDefinirMetiers(etat, id, ['G1803'], PAR_CODE);
  m.mcBasculerMission(etat, id, PAR_CODE.G1803.m[0]);
  const avant = JSON.stringify(etat.miss[id]);
  assert.equal(m.mcDefinirMetiers(etat, id, ['G1602', 'G1803'], { G1803: PAR_CODE.G1803 }), false);
  assert.equal(JSON.stringify(etat.miss[id]), avant);
  assert.deepEqual(m.mcCodesMetiers(etat, id), ['G1602', 'G1803']);
});

test('mcFichesParExperience : une fiche fusionnée par expérience, null sans métier', () => {
  const { etat, ids } = nouvelEtat();
  m.mcDefinirMetiers(etat, ids[0], ['G1803', 'G1602'], PAR_CODE);
  const r = m.mcFichesParExperience(etat, PAR_CODE);
  assert.ok(r[ids[0]] && r[ids[0]].m.length >= PAR_CODE.G1803.m.length);
  assert.equal(r[ids[1]], null);
  // les propositions des deux métiers arrivent bien dans l'offre de l'expérience
  const o = m.mcOffres(etat, r);
  const unique = PAR_CODE.G1602.sf.find((x) => !PAR_CODE.G1803.sf.includes(x));
  if (unique) { assert.deepEqual(o.sf[unique], [ids[0]]); }
});

test('traçabilité : photographie du panneau, origine d\'une mission et d\'une compétence, effacée avec l\'expérience', () => {
  const { etat, ids } = nouvelEtat(), id = ids[0];
  assert.equal(m.mcViensDuPanneau(etat, id), false);
  m.mcDefinirMetiers(etat, id, ['G1803'], PAR_CODE);
  const miss = PAR_CODE.G1803.m[0], sf = PAR_CODE.G1803.sf[0];
  m.mcBasculerMission(etat, id, miss);
  if (sf) { m.mcBasculerCompetence(etat, id, 'sf', sf); }
  m.mcMarquerPanneau(etat, id);
  assert.equal(m.mcViensDuPanneau(etat, id), true);
  assert.equal(m.mcViensDuPanneau(etat, ids[1]), false);
  assert.equal(m.mcOrigineMission(etat, id, miss), true);
  assert.equal(m.mcOrigineMission(etat, id, PAR_CODE.G1803.m[1] || 'autre'), false);
  if (sf) { assert.equal(m.mcOrigineCompetence(etat, id, 'sf', sf), true); }
  // un choix fait plus tard, sur la page, n'est pas « du panneau »
  const autre = PAR_CODE.G1803.m[1];
  if (autre) { m.mcBasculerMission(etat, id, autre); assert.equal(m.mcOrigineMission(etat, id, autre), false); }
  m.mcSupprimerExperience(etat, id);
  assert.equal(m.mcViensDuPanneau(etat, id), false);
  assert.equal(etat.metiersPlus[id], undefined);
});

test('l\'état survit à l\'enregistrement du dossier (JSON) avec métiers et traçabilité', () => {
  const { etat, ids } = nouvelEtat(), id = ids[0];
  m.mcDefinirMetiers(etat, id, ['G1803', 'G1602'], PAR_CODE);
  m.mcBasculerMission(etat, id, PAR_CODE.G1803.m[0]);
  m.mcMarquerPanneau(etat, id);
  const relu = m.mcEtatNormalise(JSON.parse(JSON.stringify(etat)));
  assert.deepEqual(relu.metiersPlus, etat.metiersPlus);
  assert.deepEqual(relu.panneau, etat.panneau);
  assert.deepEqual(m.mcCodesMetiers(relu, id), ['G1803', 'G1602']);
});

test('l\'écriture dans le dossier ne change pas : les missions de plusieurs métiers sont écrites, une fois chacune', () => {
  const dossier = { experiences: [{ poste: 'Serveur', entreprise: 'Brasserie', missions: '' }], competencesCV: [], savoirEtreCV: [], savoirsCV: [] };
  const outils = {
    ajouterSavoirFaire: (t) => { if (!dossier.competencesCV.includes(t)) dossier.competencesCV.push(t); },
    retirerSavoirFaire: () => {}, ajouterSavoirEtre: () => {}, retirerSavoirEtre: () => {}, ajouterSavoir: () => {}, retirerSavoir: () => {}
  };
  const etat = m.mcEtatVide();
  const ids = m.mcRelier(etat, dossier.experiences);
  m.mcDefinirMetiers(etat, ids[0], ['G1803', 'G1602'], PAR_CODE);
  const a = PAR_CODE.G1803.m[0], b = PAR_CODE.G1602.m.find((x) => !PAR_CODE.G1803.m.includes(x));
  m.mcBasculerMission(etat, ids[0], a);
  m.mcBasculerMission(etat, ids[0], b);
  m.mcAppliquerAuDossier(etat, dossier, outils);
  assert.deepEqual(dossier.experiences[0].missions.split('\n'), [a, b]);
  m.mcAppliquerAuDossier(etat, dossier, outils);
  assert.deepEqual(dossier.experiences[0].missions.split('\n'), [a, b], 'idempotent');
});

// Lot 4 : changer de métier principal sur la page repart de zéro (autres métiers et trace du panneau comprises) ; doublons de compétences comptés.
test('mcChoisirFiche : change de métier principal, efface les autres métiers et la trace du panneau', () => {
  const { etat, ids } = nouvelEtat();
  m.mcDefinirMetiers(etat, ids[0], ['G1803', 'G1602'], PAR_CODE);
  m.mcBasculerMission(etat, ids[0], PAR_CODE.G1803.m[0]);
  m.mcMarquerPanneau(etat, ids[0]);
  assert.ok(m.mcViensDuPanneau(etat, ids[0]));
  m.mcChoisirFiche(etat, ids[0], 'G1601');
  assert.equal(etat.fiches[ids[0]], 'G1601');
  assert.deepEqual(m.mcCodesMetiers(etat, ids[0]), ['G1601']);
  assert.equal(m.mcViensDuPanneau(etat, ids[0]), false);
  assert.deepEqual(etat.miss[ids[0]], []);
});

test('mcNbDoublonsCompetences : une compétence choisie dans deux expériences compte une fois, le doublon est annoncé', () => {
  const { etat, ids } = nouvelEtat();
  const v = PAR_CODE.G1803.sf[0];
  m.mcDefinirMetiers(etat, ids[0], ['G1803'], PAR_CODE);
  m.mcDefinirMetiers(etat, ids[1], ['G1803'], PAR_CODE);
  assert.equal(m.mcNbDoublonsCompetences(etat), 0);
  m.mcBasculerCompetence(etat, ids[0], 'sf', v);
  assert.equal(m.mcNbDoublonsCompetences(etat), 0);
  m.mcBasculerCompetence(etat, ids[1], 'sf', v);
  assert.equal(m.mcNbCompetences(etat).total, 1);
  assert.equal(m.mcNbDoublonsCompetences(etat), 1);
});

// Lot 5 (consigne 394) : missions du métier visé rattachées par la personne à l'expérience qu'elle choisit.
test('mcBasculerMissionCible : rattache à l’expérience choisie (jamais aux autres), retire au second clic, écrit dans le CV', () => {
  const { etat, ids } = nouvelEtat();
  const cibleM = PAR_CODE.G1803.m;
  const t = cibleM[1];
  const fiches = {}; // aucune expérience n'a de fiche : la mission va dans « cible »
  assert.equal(m.mcBasculerMissionCible(etat, fiches, ids[1], t), true);
  assert.deepEqual(etat.cible[ids[1]], [t]);
  assert.deepEqual(m.mcExperiencesDeLaMission(etat, t), [ids[1]]);
  assert.deepEqual(m.mcMissionsChoisies(etat, ids[0]), []);
  assert.equal(m.mcAFaitDesChoix(etat), true);
  const dossier = { experiences: [{ poste: 'Serveur', entreprise: 'Brasserie' }, { poste: 'Aide cuisinier', entreprise: 'Restaurant' }], competencesCV: [] };
  const outils = { ajouterSavoirFaire: () => {}, retirerSavoirFaire: () => {}, ajouterSavoirEtre: () => {}, retirerSavoirEtre: () => {}, ajouterSavoir: () => {}, retirerSavoir: () => {} };
  const e2 = m.mcEtatVide(); const i2 = m.mcRelier(e2, dossier.experiences);
  m.mcBasculerMissionCible(e2, {}, i2[1], t);
  m.mcAppliquerAuDossier(e2, dossier, outils);
  assert.equal(dossier.experiences[0].missions || '', '');
  assert.equal(dossier.experiences[1].missions, t);
  assert.equal(m.mcBasculerMissionCible(etat, fiches, ids[1], t), false, 'second clic : retire');
  assert.deepEqual(m.mcExperiencesDeLaMission(etat, t), []);
});

test('mcBasculerMissionCible : si la fiche de l’expérience propose déjà la mission, sa case est cochée (pas de doublon dans « cible »)', () => {
  const { etat, ids } = nouvelEtat();
  m.mcDefinirMetiers(etat, ids[0], ['G1803'], PAR_CODE);
  const t = PAR_CODE.G1803.m[0];
  m.mcBasculerMissionCible(etat, { [ids[0]]: PAR_CODE.G1803 }, ids[0], t);
  assert.deepEqual(etat.miss[ids[0]], [t]);
  assert.equal((etat.cible[ids[0]] || []).length, 0);
});

test('mcBilanMissionsCible : compte les missions du métier visé déjà dans le CV, avec leurs expériences', () => {
  const { etat, ids } = nouvelEtat();
  const cibleM = PAR_CODE.G1803.m;
  let b = m.mcBilanMissionsCible(etat, cibleM);
  assert.equal(b.couv, 0); assert.equal(b.total, cibleM.length);
  m.mcBasculerMissionCible(etat, {}, ids[0], cibleM[0]);
  m.mcBasculerMissionCible(etat, {}, ids[1], cibleM[0]);
  m.mcAjouterMissionPerso(etat, ids[1], cibleM[2]);
  b = m.mcBilanMissionsCible(etat, cibleM);
  assert.equal(b.couv, 2);
  assert.deepEqual(b.cartes[0].ids, ids);
  assert.equal(b.pourcent, Math.round(100 * 2 / cibleM.length));
});

test('l’état normalisé garde « cible » et supprimer une expérience l’efface', () => {
  const { etat, ids } = nouvelEtat();
  m.mcBasculerMissionCible(etat, {}, ids[0], PAR_CODE.G1803.m[0]);
  const relu = m.mcEtatNormalise(JSON.parse(JSON.stringify(etat)));
  assert.deepEqual(relu.cible[ids[0]], [PAR_CODE.G1803.m[0]]);
  m.mcSupprimerExperience(relu, ids[0]);
  assert.equal(relu.cible[ids[0]], undefined);
  assert.deepEqual(m.mcEtatNormalise(null).cible, {});
});
