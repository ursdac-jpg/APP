const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const PCV = require('../scripts/importRome/phrasesCV.js');

// Phrases prêtes à cocher pour le CV (consigne 285) : missions à l'infinitif (champ mi) et activités remises en forme (champ k).
// Une phrase doit passer le détecteur OU avoir été relue et corrigée à la main (scripts/importRome/phrasesCorrigees.json).

const dossier = path.join(__dirname, '..', 'data', 'rome');
const fiches = {};
fs.readdirSync(dossier).filter((f) => /^fiche_[A-N]\.js$/.test(f)).forEach((f) => { Object.assign(fiches, require('../data/rome/' + f).FICHES_ROME_LETTRE); });
const corrections = JSON.parse(fs.readFileSync(PCV.FICHIER_CORRECTIONS, 'utf8'));
const valeursRelues = new Set();
Object.keys(corrections).forEach((k) => { [].concat(corrections[k]).forEach((v) => valeursRelues.add(PCV.orthographe(v))); });

const missions = [], activites = [];
Object.keys(fiches).forEach((c) => { (fiches[c].m || []).forEach((m) => missions.push(m)); (fiches[c].k || []).forEach((g) => g[2].forEach((l) => activites.push(l))); });
PCV.preparer(missions, activites);

test('le fichier des corrections écrites à la main est bien formé', () => {
  const mauvais = [];
  Object.keys(corrections).forEach((k) => {
    const v = corrections[k];
    const liste = Array.isArray(v) ? v : [v];
    if (typeof v !== 'string' && !Array.isArray(v)) { mauvais.push(k.slice(0, 50) + ' : ni texte ni liste'); }
    liste.forEach((ph) => {
      if (typeof ph !== 'string' || !ph.trim()) { mauvais.push(k.slice(0, 50) + ' : phrase vide'); return; }
      if (/[—–]/.test(ph)) { mauvais.push(ph.slice(0, 50) + ' : tiret long'); }
      if (/\s{2,}/.test(ph) || ph !== ph.trim()) { mauvais.push(ph.slice(0, 50) + ' : espaces'); }
      if (ph.length > 260) { mauvais.push(ph.slice(0, 50) + ' : trop longue'); }
      if (!/^[A-ZÀ-Ý]/.test(ph)) { mauvais.push(ph.slice(0, 50) + ' : sans majuscule'); }
    });
  });
  assert.deepEqual(mauvais.slice(0, 10), []);
});

test('chaque fiche qui a des missions a ses missions CV (mi), sans doublon', () => {
  const mauvais = [];
  Object.keys(fiches).forEach((c) => {
    const f = fiches[c];
    if (!f.m) { return; }
    if (!Array.isArray(f.mi) || !f.mi.length) { mauvais.push(c + ' sans mi'); return; }
    if (new Set(f.mi).size !== f.mi.length) { mauvais.push(c + ' doublon'); }
  });
  assert.deepEqual(mauvais.slice(0, 10), []);
});

test('chaque mission CV (mi) est à l’infinitif et bien formée, ou relue à la main', () => {
  const mauvais = [];
  Object.keys(fiches).forEach((c) => {
    (fiches[c].mi || []).forEach((ph) => {
      if (valeursRelues.has(ph)) { return; }
      // « équipe » et « manœuvre » sont des noms (« l’équipe technique ») : seuls autres mots signalés « à vérifier » comptent
      const r = PCV.raisons(ph).filter((x) => !/à vérifier : (équipe|manœuvre)$/.test(x));
      if (r.length) { mauvais.push(c + ' : ' + ph.slice(0, 80) + ' (' + r.join(', ') + ')'); }
    });
  });
  assert.deepEqual(mauvais.slice(0, 10), [], mauvais.length + ' mission(s) mal formée(s)');
});

test('chaque activité détaillée (k) est à l’infinitif et bien formée, ou relue à la main', () => {
  const mauvais = [];
  Object.keys(fiches).forEach((c) => {
    (fiches[c].k || []).forEach((g) => g[2].forEach((l) => {
      if (valeursRelues.has(l)) { return; }
      const r = PCV.raisonsActivite(l);
      if (r.length) { mauvais.push(c + ' : ' + l.slice(0, 80) + ' (' + r.join(', ') + ')'); }
    }));
  });
  assert.deepEqual(mauvais.slice(0, 10), [], mauvais.length + ' activité(s) mal formée(s)');
});

test('les phrases stockées sont celles que produisent le convertisseur et les corrections (relancer ajouterPhrasesCV.js sinon)', () => {
  const ecarts = [];
  Object.keys(fiches).forEach((c) => {
    const copie = JSON.parse(JSON.stringify({ m: fiches[c].m, k: fiches[c].k }));
    if (!copie.m) { return; }
    PCV.enrichirFiche(copie);
    if (JSON.stringify(copie.mi) !== JSON.stringify(fiches[c].mi)) { ecarts.push(c + ' : mi différent'); }
    if (JSON.stringify(copie.k) !== JSON.stringify(fiches[c].k)) { ecarts.push(c + ' : k différent'); }
  });
  assert.deepEqual(ecarts.slice(0, 10), [], 'node scripts/importRome/ajouterPhrasesCV.js à relancer');
});

test('les missions d’origine (champ m) restent à la 3e personne telles que le ROME les donne', () => {
  // m n'est jamais modifié : la page « fiche d'un métier » continue de l'afficher tel quel
  let verbes3 = 0, total = 0;
  Object.keys(fiches).forEach((c) => { (fiches[c].m || []).forEach((m) => { total++; if (!/^(Se |S’)?[A-Za-zÀ-ÿœŒ]+(er|ir|oir)\b/.test(m)) { verbes3++; } }); });
  assert.ok(total > 10000);
  assert.ok(verbes3 / total > 0.8, 'la plupart des missions d’origine sont conjuguées (3e personne) : ' + verbes3 + ' sur ' + total);
});

test('exemples de conversion automatique', () => {
  assert.equal(PCV.convertir('Assure l’accueil des clients et gère les stocks').texte, 'Assurer l’accueil des clients et gérer les stocks');
  assert.equal(PCV.convertir('Peut collaborer avec des designers').texte, 'Collaborer avec des designers');
  assert.equal(PCV.convertir('Prépare, cuit et ouvre les coquillages').texte, 'Préparer, cuire et ouvrir les coquillages');
  assert.equal(PCV.convertir('Met en place le plan et en assure le suivi').texte, 'Mettre en place le plan et en assurer le suivi');
  assert.equal(PCV.convertir('S’assure de la qualité du travail').texte, 'S’assurer de la qualité du travail');
  assert.equal(PCV.convertir('Également participer à l’animation').ok, true);
});

test('les verbes déjà à l’infinitif en « -re » ne reçoivent pas de « r » en trop (Inscrirer, Convaincrer, Reproduirer)', () => {
  ['Inscrire des élèves aux examens', 'Convaincre de la pertinence des produits', 'Reproduire une œuvre d’art', 'Transcrire des messages vocaux en texte', 'Reconnaître le terrain', 'Extraire le miel des cadres', 'Décrire un problème', 'Enduire le support', 'Relire et corriger l’épreuve'].forEach((p) => {
    assert.equal(PCV.phraseActivite(p), p);
  });
  assert.equal(PCV.infinitifDe('inscrire'), null);
});

test('l’orthographe ancienne du ROME est remise en forme (œuvre, maîtriser, entraîner, chaîne, etc.)', () => {
  assert.equal(PCV.orthographe('Mettre en oeuvre et maitriser une chaine de production'), 'Mettre en œuvre et maîtriser une chaîne de production');
  assert.equal(PCV.orthographe('Entrainer des chiens (agility, ...)'), 'Entraîner des chiens (agility, etc.)');
  assert.equal(PCV.orthographe('Communiquer à l’oral et a l’écrit'), 'Communiquer à l’oral et à l’écrit');
  assert.equal(PCV.orthographe('Ecouter les besoins'), 'Écouter les besoins');
});

test('le détecteur refuse « leur » sans antécédent et les statuts (Se spécialiser, Être spécialisé) et accepte les phrases correctes', () => {
  assert.ok(PCV.raisons('Vérifier leur disponibilité').some((x) => /leur sans antécédent/.test(x)));
  assert.ok(PCV.raisons('Se spécialiser dans le droit').some((x) => /statut ou évolution/.test(x)));
  assert.ok(PCV.raisons('Être spécialisé dans le combat terrestre').some((x) => /statut ou évolution/.test(x)));
  assert.deepEqual(PCV.raisons('Accompagner les personnes dans la mise en œuvre de leurs projets de vie'), []);
  assert.deepEqual(PCV.raisons('Gérer le personnel du laboratoire, en assurant leur formation'), []);
});

test('les phrases corrigées avec Denis le 14/11/2026 sont en place (L1311, K2111 et leurs voisines)', () => {
  const l1311 = fiches.L1311.mi;
  assert.ok(l1311.includes('Coordonner les interventions des artistes et des techniciens'));
  assert.ok(l1311.some((p) => /^Négocier et organiser les plannings des artistes et des techniciens, ainsi que leur accueil/.test(p)));
  assert.ok(fiches.K2111.mi.includes('Animer des formations dans des domaines particuliers, comme les langues, le secourisme ou l’informatique'));
  const toutes = [];
  Object.keys(fiches).forEach((c) => { (fiches[c].mi || []).forEach((p) => { if (/^(Se |S’)spécialis|^Être spécialis/.test(p)) { toutes.push(c + ' : ' + p.slice(0, 70)); } }); });
  assert.deepEqual(toutes, [], 'aucune mission ne commence par « Se spécialiser » ou « Être spécialisé »');
});

test('aucune phrase ne contient de verbe inventé par la conversion (mot absent du ROME d’origine en « -rer », « -ttrer », « -uirer »…)', () => {
  const impossibles = [];
  const rx = /\b[a-zà-ÿœ’-]*(ttrer|îtrer|uirer|crirer|aincrer|oudrer|mettrer|suivrer)\b/i;
  Object.keys(fiches).forEach((c) => {
    (fiches[c].mi || []).forEach((p) => { if (rx.test(p)) { impossibles.push(c + ' : ' + p.slice(0, 70)); } });
    (fiches[c].k || []).forEach((g) => g[2].forEach((p) => { if (rx.test(p)) { impossibles.push(c + ' : ' + p.slice(0, 70)); } }));
  });
  assert.deepEqual(impossibles.slice(0, 10), []);
});

// Lot 8 « Vos missions et compétences » (consigne 314) : aucune phrase cochable ne dépasse 25 mots (les plus longues ont été réécrites à la main dans phrasesCorrigees.json).
test('aucune mission CV (mi) ni activité (k) ne dépasse 25 mots', () => {
  const mots = (t) => String(t).trim().split(/\s+/).length;
  const trop = [];
  Object.keys(fiches).forEach((c) => {
    (fiches[c].mi || []).forEach((p) => { if (mots(p) > 25) { trop.push(c + ' : ' + mots(p) + ' mots : ' + p.slice(0, 70)); } });
    (fiches[c].k || []).forEach((g) => g[2].forEach((p) => { if (mots(p) > 25) { trop.push(c + ' : ' + mots(p) + ' mots : ' + p.slice(0, 70)); } }));
  });
  assert.deepEqual(trop.slice(0, 10), []);
});
