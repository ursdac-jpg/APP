// Module « Bien utiliser l'IA » : modèle 13 « Préparer un atelier » (famille « Pour les professionnels »), ajouté le 25/11/2026 (sélection validée par Denis).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const M = require('../data/buiaModeles.js');
const T = require('../data/buiaModelesTextes.js');
const B = require('../modules/bien-utiliser-ia/blocs.js');
const L = require('../modules/bien-utiliser-ia/modeleLogique.js');

const racine = path.join(__dirname, '..');
const lire = (p) => fs.readFileSync(path.join(racine, p), 'utf8');
const jour = new Date(2026, 10, 25, 10, 0, 0);
const def = L.buiaDefModele(13);
const charge = () => B.buiaLireBlocs(lire(def.fichier));
const assembler = (champs, choix, confirme) => {
  const s = L.buiaSaisieParDefaut(13);
  Object.assign(s.champs, champs || {}); Object.assign(s.choix, choix || {});
  if (confirme !== false) { s.confirme = true; }
  return L.buiaAssemblerModele(13, charge().blocs, s, { aujourdhui: jour, alerte: null, reprise: false });
};
const ATELIER = { theme: 'écrire une lettre de motivation', public: 'huit personnes en recherche d’emploi, qui lisent peu le français', objectif: 'écrire les trois premières phrases de leur lettre' };

test('modèle 13 : disponible, rédigé, pour les professionnels, fichier valide', () => {
  assert.equal(L.buiaModeleDisponible(13), true);
  const m = M.BUIA_MODELES.filter((x) => x.id === 13)[0];
  assert.equal(m.nom, 'Préparer un atelier');
  assert.equal(m.redige, true); assert.equal(m.pro, true); assert.equal(m.famille, 'Pour les professionnels');
  assert.ok(m.mots.length >= 4 && m.mots.includes('atelier'));
  assert.deepEqual(L.buiaVerifierBlocsModele(13, charge()), []);
});

test('modèle 13 : l’écran cite tous les champs et tous les groupes ; aucune suite ; aucun champ ne reçoit de papier collé', () => {
  const vus = new Set();
  def.ecran.forEach((e) => { if (e.groupe) { vus.add('g:' + e.groupe); } if (e.champ) { vus.add('c:' + e.champ); } (e.groupes || []).forEach((g) => vus.add('g:' + g)); });
  def.champs.forEach((c) => assert.ok(vus.has('c:' + c.id), 'champ ' + c.id));
  def.groupes.forEach((g) => assert.ok(vus.has('g:' + g.id), 'groupe ' + g.id));
  assert.deepEqual(def.suite, []);
  assert.ok(!def.alerteDates);
  assert.equal(def.champs.filter((c) => c.papier).length, 0);
});

test('modèle 13 : la case « noms retirés » est exigée comme pour les autres modèles pour les professionnels', () => {
  assert.ok(def.confirmation && /noms/.test(def.confirmation.lib) && /données nominatives/.test(def.confirmation.lib));
  const sans = assembler(ATELIER, {}, false);
  assert.equal(sans.aCompleter, true);
  assert.ok(sans.manque.includes(def.confirmation.court));
  assert.equal(assembler(ATELIER).aCompleter, false);
});

test('modèle 13 : textes affichés sans tiret long, sans « facultatif », sans mot IA, apostrophes typographiques, texte de vérification présent', () => {
  const textes = [def.confirmation.lib, def.confirmation.court];
  def.champs.forEach((c) => textes.push(c.lib, c.aide, c.exemple, c.court));
  def.groupes.forEach((g) => { textes.push(g.titre); g.choix.forEach((x) => textes.push(x.lib)); });
  textes.forEach((x) => { assert.ok(!/[–—]/.test(x), x); assert.ok(!/facultatif/i.test(x), x); assert.ok(!/\bIA\b/.test(x), x); assert.ok(!/\w'\w/.test(x), 'apostrophe droite : ' + x); });
  const v = T.BUIA_C2_E3.verifierModele[13];
  assert.ok(v && !/courrier/.test(v) && !/[–—]/.test(v) && !/\w'\w/.test(v) && !v.includes(' : '), 'texte de vérification');
});

test('modèle 13 : règles de socle présentes, aucun résultat promis, aucun nom recopié, rien d’inventé', () => {
  const regles = charge().blocs.regles;
  ['français impeccable', 'tiret long ni demi-long', 'N’emploie pas le mot « on »', 'avec « vous »', 'N’invente rien', 'N’écris aucun nom', 'Ne promets aucun résultat', 'Ne donne aucun avis juridique', 'liste de ce que je dois préparer'].forEach((x) => assert.ok(regles.includes(x), x));
  assert.ok(!/[–—]/.test(lire(def.fichier)), 'tiret long dans le fichier');
});

test('modèle 13 : un champ vide bloque la copie ; la salle et le matériel restent à votre choix ; aucun crochet ni accolade n’est envoyé', () => {
  assert.equal(assembler({}).aCompleter, true);
  assert.deepEqual(assembler({ theme: ATELIER.theme }).manque, ['le public', 'ce que les participants sauront faire']);
  const r = assembler(ATELIER);
  assert.equal(r.aCompleter, false);
  assert.ok(!/[{}\[\]]/.test(r.texte), r.texte);
  assert.ok(!/\n\n\n/.test(r.texte));
});

test('modèle 13 : le thème, le public et l’objectif sont envoyés ; le matériel seulement s’il est rempli', () => {
  const sans = assembler(ATELIER).texte, avec = assembler(Object.assign({ materiel: 'une salle avec cinq ordinateurs' }, ATELIER)).texte;
  assert.ok(sans.includes('Thème de l’atelier : écrire une lettre de motivation.'));
  assert.ok(sans.includes('Public : huit personnes en recherche d’emploi, qui lisent peu le français.'));
  assert.ok(sans.includes('seront capables de : écrire les trois premières phrases de leur lettre.'));
  assert.ok(!sans.includes('Salle et matériel disponibles'));
  assert.ok(avec.includes('Salle et matériel disponibles : une salle avec cinq ordinateurs. N’utilise rien d’autre.'));
});

test('modèle 13 : un seul bloc par groupe (type, durée, questions)', () => {
  const dep = assembler(ATELIER, { type: 'deroule' }).texte, exe = assembler(ATELIER, { type: 'exercices' }).texte;
  assert.ok(dep.includes('Écris le déroulé de l’atelier.') && !dep.includes('Propose des exercices'));
  assert.ok(exe.includes('Propose des exercices à faire en groupe.') && !exe.includes('Écris le déroulé'));
  [['1h', 'dure une heure'], ['2h', 'dure deux heures'], ['demi', 'dure une demi-journée']].forEach(([v, phrase]) => {
    const t = assembler(ATELIER, { duree: v }).texte;
    assert.ok(t.includes(phrase), v);
    assert.equal(['dure une heure', 'dure deux heures', 'dure une demi-journée'].filter((x) => t.includes(x)).length, 1, v);
  });
  assert.ok(assembler(ATELIER, { questions: 'oui' }).texte.includes('pose-moi tes questions avant de répondre'));
  assert.ok(assembler(ATELIER, { questions: 'non' }).texte.includes('Pose-moi une question seulement'));
});

test('modèle 13 : les participants ne sont ni jugés ni supposés, les exemples utilisent des personnages inventés', () => {
  const t = assembler(ATELIER).texte;
  assert.ok(t.includes('Ne juge pas les participants'));
  assert.ok(t.includes('personnages inventés'));
  assert.ok(t.indexOf('Je suis professionnel de l’accompagnement') === 0);
});
