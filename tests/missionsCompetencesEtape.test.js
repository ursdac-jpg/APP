const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Brique pure de l'étape « Vos missions et compétences » (lot 1, consigne 302). Essayée sur les fiches réelles du ROME.
const m = require('../modules/missions-competences/etape.js');
const racine = path.join(__dirname, '..');
const ctx = {}; vm.createContext(ctx);
fs.readdirSync(path.join(racine, 'data', 'rome')).filter((f) => /^fiche_[A-N]\.js$/.test(f))
  .forEach((f) => vm.runInContext(fs.readFileSync(path.join(racine, 'data', 'rome', f), 'utf8'), ctx));
vm.runInContext(fs.readFileSync(path.join(racine, 'data', 'metiersRome.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(racine, 'data', 'metiers.js'), 'utf8') + ';this.F=FICHES_ROME;this.M=baseMetiers;', ctx);
const FICHES = ctx.F, METIERS = ctx.M; // METIERS = baseMetiers : fiches écrites à la main d'abord, puis fiches générées du ROME
const fiche = (code) => m.mcFicheNormalisee(code, FICHES, METIERS);
global.METIERS_ROME_ALIAS = ctx.METIERS_ROME_ALIAS; // comme dans le navigateur : un code devenu alias (K1306 -> « aes ») reprend les compétences de la fiche

// Écriture dans le dossier : mêmes règles que js/app.js (un savoir-être reste AUSSI dans competencesCV).
function nouveauDossier(extra) {
  const d = Object.assign({ experiences: [], competencesCV: [], savoirEtreCV: [], savoirsCV: [] }, extra || {});
  const outils = {
    ajouterSavoirFaire: (t) => { if (!d.competencesCV.includes(t)) d.competencesCV.push(t); },
    retirerSavoirFaire: (t) => { d.competencesCV = d.competencesCV.filter((c) => c !== t); },
    ajouterSavoirEtre: (t) => { if (!d.competencesCV.includes(t)) d.competencesCV.push(t); if (!d.savoirEtreCV.includes(t)) d.savoirEtreCV.push(t); },
    retirerSavoirEtre: (t) => { d.competencesCV = d.competencesCV.filter((c) => c !== t); d.savoirEtreCV = d.savoirEtreCV.filter((c) => c !== t); },
    ajouterSavoir: (t) => { if (!d.savoirsCV.includes(t)) d.savoirsCV.push(t); },
    retirerSavoir: (t) => { d.savoirsCV = d.savoirsCV.filter((c) => c !== t); }
  };
  return { d, outils };
}
const deuxExperiences = () => [
  { poste: 'Auxiliaire de vie', entreprise: 'Association', missions: 'Courses et ménage chez les personnes' },
  { poste: 'Aide-soignante', entreprise: 'Clinique', missions: '' }
];
// Cas de référence : deux expériences du secteur du soin, fiches choisies à la main (K1302 et J1501), métier visé K1306.
function cas() {
  const { d, outils } = nouveauDossier({ experiences: deuxExperiences() });
  const etat = m.mcEtatVide();
  const ids = m.mcRelier(etat, d.experiences);
  const fiches = { [ids[0]]: fiche('K1302'), [ids[1]]: fiche('J1501') };
  ids.forEach((id, i) => m.mcChoisirFiche(etat, id, ['K1302', 'J1501'][i]));
  return { d, outils, etat, ids, fiches, cible: fiche('K1306') };
}

test('une fiche réelle est normalisée : missions, compétences courtes, activités précises sans doublon', () => {
  const f = fiche('K1306');
  assert.equal(f.code, 'K1306');
  assert.deepEqual(f.sf.slice(0, 3), ['Soins', 'Transmission', 'Accompagnement']);   // K1306 est un alias de la fiche « aes » : ses compétences, avec les missions et tâches propres à K1306
  assert.ok(f.se.includes('Écoute') && f.sv.length > 0);
  assert.ok(f.m.length >= 3 && f.m.every((x) => typeof x === 'string' && x.length > 0));
  assert.equal(new Set(f.k.map(m.mcCleTexte)).size, f.k.length);
  // les tâches du cœur du métier passent en premier (« Veiller à l'hygiène corporelle » est dans la première famille du cœur)
  assert.ok(/hygi/i.test(f.k[0]));
  assert.equal(fiche('Z9999'), null);
});

test('toutes les fiches réelles se normalisent sans doublon', () => {
  const codes = Object.keys(FICHES);
  assert.ok(codes.length > 1900);
  codes.forEach((code) => {
    const f = fiche(code);
    ['m', 'sf', 'se', 'sv', 'k'].forEach((t) => assert.equal(new Set(f[t].map(m.mcCleTexte)).size, f[t].length, code + ' ' + t));
  });
});

test('doublons : une compétence proposée par deux expériences n\'apparaît qu\'une fois, avec ses deux sources', () => {
  const { etat, ids, fiches, cible } = cas();
  const fam = m.mcFamilles(etat, fiches, cible, null);
  ['sf', 'se', 'sv', 'k'].forEach((t) => {
    const vals = (fam[t] || []).map((x) => m.mcCleTexte(x.v));
    assert.equal(new Set(vals).size, vals.length, 'type ' + t);
  });
  const communes = (fam.se || []).concat(fam.sf || []).filter((x) => x.sources.length >= 2);
  assert.ok(communes.length > 0, 'au moins une compétence commune aux deux fiches');
  communes.forEach((x) => { assert.ok(x.commun); assert.deepEqual(x.sources.slice().sort(), ids.slice().sort()); });
});

test('rangement : le métier visé d\'abord, puis ce qui revient dans plusieurs expériences, puis le reste dans l\'ordre de la fiche', () => {
  const { etat, fiches, cible } = cas();
  ['sf', 'se', 'sv'].forEach((t) => {
    const liste = m.mcFamilles(etat, fiches, cible, null)[t] || [];
    const rang = (x) => (x.vise ? 0 : (x.commun ? 1 : 2));
    for (let i = 1; i < liste.length; i++) assert.ok(rang(liste[i - 1]) <= rang(liste[i]), t + ' : ' + liste[i - 1].v + ' avant ' + liste[i].v);
  });
});

test('vue d\'ensemble : un clic coche pour toutes les expériences qui la proposent, puis décoche pour toutes ; état mixte', () => {
  const { etat, ids, fiches, cible } = cas();
  const o = m.mcOffres(etat, fiches);
  const v = Object.keys(o.se).find((x) => o.se[x].length === 2);
  assert.ok(v, 'un savoir-être commun existe');
  m.mcBasculerCompetenceGlobale(etat, o, 'se', v);
  ids.forEach((id) => assert.ok(etat.comp[id].se.includes(v)));
  assert.equal(m.mcFamilles(etat, fiches, cible, null).se.find((x) => x.v === v).etat, true);
  m.mcBasculerCompetence(etat, ids[0], 'se', v); // coché pour une seule des deux
  assert.equal(m.mcFamilles(etat, fiches, cible, null).se.find((x) => x.v === v).etat, 'mixte');
  m.mcBasculerCompetenceGlobale(etat, o, 'se', v); // pas toutes cochées : le clic coche le reste
  ids.forEach((id) => assert.ok(etat.comp[id].se.includes(v)));
  m.mcBasculerCompetenceGlobale(etat, o, 'se', v);
  ids.forEach((id) => assert.ok(!etat.comp[id].se.includes(v)));
  assert.deepEqual(m.mcCompetencesChoisies(etat).se, []);
});

test('une compétence cochée pour deux expériences ne compte qu\'une fois', () => {
  const { etat, ids, fiches } = cas();
  const o = m.mcOffres(etat, fiches);
  const v = Object.keys(o.se).find((x) => o.se[x].length === 2);
  m.mcBasculerCompetenceGlobale(etat, o, 'se', v);
  assert.equal(m.mcNbCompetences(etat).se, 1);
  assert.equal(m.mcNbCompetences(etat).total, 1);
  assert.equal(m.mcNbCompetencesExperience(etat, ids[0]), 1);
});

test('compétence écrite par la personne : pour une expérience ou pour toutes, cochée d\'office, sans doublon', () => {
  const { etat, ids, fiches, cible } = cas();
  assert.ok(m.mcAjouterCompetencePerso(etat, ids[0], 'Aide aux transferts'));
  assert.ok(!m.mcAjouterCompetencePerso(etat, ids[0], '  aide aux transferts  '));
  assert.ok(!m.mcAjouterCompetencePerso(etat, ids[0], '   '));
  assert.ok(m.mcAjouterCompetencePerso(etat, 'g', 'Ponctualité'));
  const fam = m.mcFamilles(etat, fiches, cible, ids[1]);
  assert.ok(fam.sf.some((x) => x.v === 'Ponctualité' && x.perso), 'ajoutée pour toutes : visible dans l\'autre expérience');
  assert.ok(!fam.sf.some((x) => x.v === 'Aide aux transferts'));
  assert.deepEqual(m.mcCompetencesChoisies(etat).sf.sort(), ['Aide aux transferts', 'Ponctualité']);
});

test('changer de fiche repart des compétences ajoutées par la personne, pas de celles de l\'ancienne fiche', () => {
  const { etat, ids, fiches } = cas();
  m.mcAjouterCompetencePerso(etat, ids[0], 'Aide aux transferts');
  const o = m.mcOffres(etat, fiches);
  const v = Object.keys(o.sv).find((x) => o.sv[x].length === 1 && o.sv[x][0] === ids[0]);
  m.mcBasculerCompetence(etat, ids[0], 'sv', v);
  m.mcBasculerMission(etat, ids[0], fiches[ids[0]].m[0]);
  m.mcChoisirFiche(etat, ids[0], 'K1306');
  assert.deepEqual(etat.comp[ids[0]], { sf: ['Aide aux transferts'] });
  assert.deepEqual(etat.miss[ids[0]], []);
  m.mcChoisirFiche(etat, ids[0], 'aucune');
  assert.equal(etat.fiches[ids[0]], null);
});

test('missions : cochées, modifiées, écrites par la personne ; sans doublon', () => {
  const { etat, ids, fiches } = cas();
  const [a, b] = fiches[ids[0]].m;
  m.mcBasculerMission(etat, ids[0], a);
  m.mcBasculerMission(etat, ids[0], b);
  m.mcModifierMission(etat, ids[0], a, '  Aider au lever et aux repas ');
  assert.ok(m.mcAjouterMissionPerso(etat, ids[0], 'Courses pour les personnes'));
  assert.ok(!m.mcAjouterMissionPerso(etat, ids[0], 'courses pour les personnes.'));
  assert.deepEqual(m.mcMissionsChoisies(etat, ids[0]), ['Aider au lever et aux repas', b, 'Courses pour les personnes']);
  m.mcModifierMission(etat, ids[0], a, a); // revenir au texte d'origine
  assert.deepEqual(m.mcMissionsChoisies(etat, ids[0]), [a, b, 'Courses pour les personnes']);
  m.mcBasculerMission(etat, ids[0], a);
  m.mcRetirerMissionPerso(etat, ids[0], 'Courses pour les personnes');
  assert.deepEqual(m.mcMissionsChoisies(etat, ids[0]), [b]);
  assert.equal(m.mcNbMissionsTotal(etat), 1);
});

test('bilan du métier visé : compté sur savoir-faire, savoir-être et savoirs ; les activités précises à part', () => {
  const { etat, ids, fiches, cible } = cas();
  let b = m.mcBilanCible(etat, fiches, cible);
  assert.equal(b.total, cible.sf.length + cible.se.length + cible.sv.length);
  assert.equal(b.k, cible.k.length);
  assert.equal(b.exp + b.hors, 0);
  assert.equal(b.manque.length, b.total);
  assert.equal(m.mcCompteurCible(b), '0/' + b.total);
  // « Écoute » est à la fois dans le métier visé et dans la fiche K1302 : cochée pour l'expérience, elle est comptée « grâce aux expériences »
  const o = m.mcOffres(etat, fiches);
  assert.ok(cible.se.includes('Écoute') && o.se['Écoute']);
  m.mcBasculerCarteCible(etat, fiches, 'se', 'Écoute');
  b = m.mcBilanCible(etat, fiches, cible);
  assert.equal(b.exp, 1); assert.equal(b.hors, 0);
  // une compétence du métier visé qu'aucune fiche choisie ne propose se coche « hors expériences »
  const horsExp = cible.sf.find((v) => !o.sf[v]);
  assert.ok(horsExp, 'le métier visé a une compétence absente des fiches choisies');
  m.mcBasculerCarteCible(etat, fiches, 'sf', horsExp);
  b = m.mcBilanCible(etat, fiches, cible);
  assert.equal(b.hors, 1);
  assert.deepEqual(etat.comp.h.sf, [horsExp]);
  assert.equal(b.pourcent, Math.round(100 * 2 / b.total));
  assert.equal(m.mcCompteurCible(b), '2/' + b.total);
  m.mcBasculerCarteCible(etat, fiches, 'sf', horsExp);
  assert.equal(m.mcBilanCible(etat, fiches, cible).hors, 0);
  assert.deepEqual(m.mcBilanCible(etat, fiches, null), { total: 0, exp: 0, hors: 0, k: 0, kCouv: 0, manque: [], pourcent: 0 });
});

test('onglet « Métier visé » : deux rubriques à place stable, les plus courantes d\'abord en dehors des expériences', () => {
  const { etat, fiches, cible } = cas();
  const freq = m.mcFrequences(METIERS);
  const avant = m.mcVueCible(etat, fiches, cible, freq);
  const ensemble = (vue, rub) => vue[rub].reduce((s, g) => s.concat(g.cartes.map((c) => c.type + ':' + c.v)), []);
  m.mcBasculerCarteCible(etat, fiches, 'se', 'Écoute');
  m.mcBasculerCarteCible(etat, fiches, 'sf', cible.sf.find((v) => !m.mcOffres(etat, fiches).sf[v]));
  const apres = m.mcVueCible(etat, fiches, cible, freq);
  assert.deepEqual(ensemble(apres, 'exp'), ensemble(avant, 'exp'), 'une carte cochée ne change pas de rubrique');
  assert.deepEqual(ensemble(apres, 'hors').slice().sort(), ensemble(avant, 'hors').slice().sort());
  avant.hors.forEach((g) => {
    if (g.type === 'k') return;
    for (let i = 1; i < g.cartes.length; i++) assert.ok((freq[g.type][g.cartes[i - 1].v] || 0) >= (freq[g.type][g.cartes[i].v] || 0), g.type);
  });
  assert.equal(apres.k.length, cible.k.length);
  assert.equal(avant.bilan.total, apres.bilan.total);
});

test('activités précises : comptées à part, jamais dans le « 8 à 12 compétences »', () => {
  const { etat, ids, fiches } = cas();
  const o = m.mcOffres(etat, fiches);
  const k = Object.keys(o.k)[0];
  m.mcBasculerCompetenceGlobale(etat, o, 'k', k);
  const n = m.mcNbCompetences(etat);
  assert.equal(n.k, 1); assert.equal(n.total, 0);
});

test('écriture dans le dossier : missions en lignes, compétences dans les champs existants, activités précises en dernier', () => {
  const { d, outils, etat, ids, fiches } = cas();
  const [a, b] = fiches[ids[0]].m;
  m.mcBasculerMission(etat, ids[0], a);
  m.mcBasculerMission(etat, ids[0], b);
  const o = m.mcOffres(etat, fiches);
  m.mcBasculerCompetenceGlobale(etat, o, 'se', 'Écoute');
  m.mcBasculerCompetenceGlobale(etat, o, 'sf', fiches[ids[0]].sf[0]);
  m.mcBasculerCompetenceGlobale(etat, o, 'sv', fiches[ids[0]].sv[0]);
  const k = fiches[ids[0]].k[0];
  m.mcBasculerCompetenceGlobale(etat, o, 'k', k);
  const bilan = m.mcAppliquerAuDossier(etat, d, outils);
  assert.deepEqual(d.experiences[0].missions.split('\n'), ['Courses et ménage chez les personnes', a, b]);
  assert.equal(d.experiences[1].missions, '', 'une expérience sans choix n\'est pas touchée');
  assert.ok(d.savoirEtreCV.includes('Écoute') && d.competencesCV.includes('Écoute'));
  assert.ok(d.savoirsCV.includes(fiches[ids[0]].sv[0]));
  assert.equal(d.competencesCV[d.competencesCV.length - 1], k, 'les activités précises passent après les autres compétences');
  assert.equal(bilan.missionsAjoutees, 2);
  assert.equal(bilan.competencesAjoutees.length, 4);
});

test('retrait : l\'étape ne retire que ce qu\'elle a écrit, jamais ce que la personne avait ou a ajouté ailleurs', () => {
  const { d, outils, etat, ids, fiches } = cas();
  d.competencesCV.push('Écoute', 'Ponctualité'); d.savoirEtreCV.push('Écoute'); // la personne avait déjà « Écoute » (savoir-être)
  const [a] = fiches[ids[0]].m;
  const premierSf = fiches[ids[0]].sf[0];
  const o = m.mcOffres(etat, fiches);
  m.mcBasculerMission(etat, ids[0], a);
  m.mcBasculerCompetenceGlobale(etat, o, 'se', 'Écoute');
  m.mcBasculerCompetenceGlobale(etat, o, 'sf', premierSf);
  m.mcAppliquerAuDossier(etat, d, outils);
  assert.ok(d.competencesCV.includes(premierSf));
  assert.ok(!etat.ajoute.se.includes('Écoute'), 'déjà présente avant l\'étape : non suivie');
  // la personne ajoute ailleurs une compétence identique à une autre proposée par la fiche
  d.competencesCV.push('Rigueur'); d.savoirEtreCV.push('Rigueur');
  // décocher tout dans l'étape
  m.mcBasculerCompetenceGlobale(etat, o, 'se', 'Écoute');
  m.mcBasculerCompetenceGlobale(etat, o, 'sf', premierSf);
  m.mcBasculerMission(etat, ids[0], a);
  const bilan = m.mcAppliquerAuDossier(etat, d, outils);
  assert.ok(d.competencesCV.includes('Écoute') && d.savoirEtreCV.includes('Écoute'), 'celle de la personne reste');
  assert.ok(d.competencesCV.includes('Ponctualité') && d.competencesCV.includes('Rigueur'));
  assert.ok(!d.competencesCV.includes(premierSf), 'celle de l\'étape est retirée');
  assert.equal(d.experiences[0].missions, 'Courses et ménage chez les personnes', 'la mission écrite par la personne reste, celle de l\'étape part');
  assert.deepEqual(bilan.competencesRetirees, [premierSf]);
  assert.equal(bilan.missionsRetirees, 1);
});

test('écrire deux fois de suite ne change rien (idempotent), et une mission déjà présente n\'est pas dupliquée', () => {
  const { d, outils, etat, ids, fiches } = cas();
  const [a] = fiches[ids[0]].m;
  d.experiences[0].missions = 'Courses et ménage chez les personnes\n' + a.toUpperCase() + '.';
  m.mcBasculerMission(etat, ids[0], a);
  m.mcAjouterMissionPerso(etat, ids[0], 'Aide à la toilette');
  const o = m.mcOffres(etat, fiches);
  m.mcBasculerCompetenceGlobale(etat, o, 'se', 'Écoute');
  m.mcAppliquerAuDossier(etat, d, outils);
  const photo = JSON.stringify([d, etat]);
  m.mcAppliquerAuDossier(etat, d, outils);
  m.mcAppliquerAuDossier(etat, d, outils);
  assert.equal(JSON.stringify([d, etat]), photo);
  assert.equal(d.experiences[0].missions.split('\n').length, 3, 'la mission déjà écrite à la main (casse et point différents) n\'est pas dupliquée');
});

test('l\'identifiant d\'étape : posé sur chaque expérience, jamais deux fois le même', () => {
  const exps = [{ poste: 'A' }, { poste: 'B', idEtape: 'x7' }, { poste: 'C', idEtape: 'x7' }, { poste: 'D' }];
  assert.equal(m.mcAssurerIds(exps), 3);
  const ids = exps.map((e) => e.idEtape);
  assert.equal(new Set(ids).size, 4);
  assert.equal(exps[1].idEtape, 'x7');
  assert.equal(m.mcAssurerIds(exps), 0);
});

test('expérience renommée : le lien avec les choix est gardé (l\'identifiant suit)', () => {
  const { d, outils, etat, ids, fiches } = cas();
  m.mcBasculerMission(etat, ids[0], fiches[ids[0]].m[0]);
  m.mcAppliquerAuDossier(etat, d, outils);
  d.experiences[0].poste = 'Assistante de vie aux familles';
  m.mcAppliquerAuDossier(etat, d, outils);
  assert.equal(d.experiences[0].idEtape, ids[0]);
  assert.equal(etat.experiences[ids[0]].poste, 'Assistante de vie aux familles');
  assert.deepEqual(etat.miss[ids[0]], [fiches[ids[0]].m[0]]);
});

test('identifiant perdu (copie du dossier sans le champ) : l\'expérience est retrouvée par poste et employeur', () => {
  const { d, outils, etat, ids, fiches } = cas();
  m.mcBasculerMission(etat, ids[1], fiches[ids[1]].m[0]);
  m.mcAppliquerAuDossier(etat, d, outils);
  const copie = JSON.parse(JSON.stringify(d));
  copie.experiences.forEach((e) => { delete e.idEtape; });
  copie.experiences.reverse(); // l'ordre a même changé
  const etat2 = JSON.parse(JSON.stringify(etat));
  m.mcRelier(etat2, copie.experiences);
  assert.equal(copie.experiences[0].idEtape, ids[1]);
  assert.equal(copie.experiences[1].idEtape, ids[0]);
  assert.deepEqual(etat2.miss[ids[1]], [fiches[ids[1]].m[0]]);
  assert.deepEqual(etat2.ordre, [ids[1], ids[0]]);
});

test('expérience supprimée : ses choix sont oubliés, ses compétences retirées, et une nouvelle expérience n\'en hérite pas', () => {
  const { d, outils, etat, ids, fiches } = cas();
  const o = m.mcOffres(etat, fiches);
  const propreA = Object.keys(o.sv).find((v) => o.sv[v].length === 1 && o.sv[v][0] === ids[0]);
  m.mcBasculerCompetence(etat, ids[0], 'sv', propreA);
  m.mcBasculerMission(etat, ids[0], fiches[ids[0]].m[0]);
  m.mcAppliquerAuDossier(etat, d, outils);
  assert.ok(d.savoirsCV.includes(propreA));
  d.experiences.shift();
  d.experiences.push({ poste: 'Nouvelle expérience', entreprise: 'Ailleurs', missions: '' });
  const bilan = m.mcAppliquerAuDossier(etat, d, outils);
  assert.ok(!d.savoirsCV.includes(propreA));
  assert.deepEqual(bilan.competencesRetirees, [propreA]);
  const idNouvelle = d.experiences[1].idEtape;
  assert.notEqual(idNouvelle, ids[0], 'un nouvel identifiant ne reprend jamais celui d\'une expérience supprimée');
  assert.deepEqual(etat.miss[idNouvelle] || [], []);
  assert.equal(d.experiences[1].missions, '');
  assert.ok(!etat.experiences[ids[0]]);
});

test('compétence choisie pour deux expériences : elle reste tant qu\'une des deux la garde', () => {
  const { d, outils, etat, ids, fiches } = cas();
  const o = m.mcOffres(etat, fiches);
  m.mcBasculerCompetenceGlobale(etat, o, 'se', 'Écoute');
  m.mcAppliquerAuDossier(etat, d, outils);
  m.mcBasculerCompetence(etat, ids[0], 'se', 'Écoute');
  m.mcAppliquerAuDossier(etat, d, outils);
  assert.ok(d.savoirEtreCV.includes('Écoute'));
  m.mcBasculerCompetence(etat, ids[1], 'se', 'Écoute');
  m.mcAppliquerAuDossier(etat, d, outils);
  assert.ok(!d.savoirEtreCV.includes('Écoute') && !d.competencesCV.includes('Écoute'));
});

test('un état abîmé ou ancien est remis en forme sans erreur ; le choix « a fait des choix » se lit sur l\'état', () => {
  assert.deepEqual(m.mcEtatNormalise(null), m.mcEtatVide());
  assert.deepEqual(m.mcEtatNormalise('n\'importe quoi'), m.mcEtatVide());
  const e = m.mcEtatNormalise({ ordre: ['x1', 5], fiches: { x1: 'K1302', x2: 12 }, miss: { x1: ['a', 3] }, comp: { x1: { sf: ['b'], zz: ['c'] } }, ajoute: { sf: ['d', 9] } });
  assert.deepEqual(e.ordre, ['x1']);
  assert.deepEqual(e.fiches, { x1: 'K1302' });
  assert.deepEqual(e.miss.x1, ['a']);
  assert.deepEqual(e.comp.x1, { sf: ['b'] });
  assert.deepEqual(e.ajoute.sf, ['d']);
  assert.equal(m.mcAFaitDesChoix(m.mcEtatVide()), false);
  assert.equal(m.mcAFaitDesChoix(e), true);
  const seulementFiche = m.mcEtatVide(); m.mcChoisirFiche(seulementFiche, 'x1', 'K1302');
  assert.equal(m.mcAFaitDesChoix(seulementFiche), false, 'choisir une fiche sans rien cocher n\'est pas un choix');
  assert.equal(JSON.stringify(m.mcEtatNormalise(JSON.parse(JSON.stringify(cas().etat)))), JSON.stringify(cas().etat));
});

test('le fichier de la brique est chargé par la page d\'accueil, après la recherche et avant js/app.js', () => {
  const index = fs.readFileSync(path.join(racine, 'index.html'), 'utf8');
  const p1 = index.indexOf('modules/missions-competences/rechercheFiche.js'), p2 = index.indexOf('modules/missions-competences/etape.js');
  assert.ok(p1 > 0 && p2 > p1 && p2 < index.indexOf('<script src="js/app.js"'));
});
