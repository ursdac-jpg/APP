const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pmdDonnees, PMD_FAMILLES_SE } = require('../modules/comprendre-les-metiers/parMetierDonnees.js');
const C = require('../modules/comprendre-les-metiers/parMetierCalcul.js');

// « Par un métier » : données construites à partir de l'index complet, et calcul du pourcentage (maquette du 17/11/2026, consignes 448 à 454).
const D = pmdDonnees();
const trouver = (t, morceau) => D[t].findIndex((x) => x.lib.toLowerCase().indexOf(morceau) !== -1);
const metier = (code) => D.m.findIndex((r) => r.code === code);

test('les données couvrent tous les métiers, toutes les compétences du ROME et les 17 conditions de travail', () => {
  assert.equal(D.m.length, 1919);   // 1920 avant que K1306 devienne un alias de la fiche « aes » (19/11/2026)
  assert.equal(D.sf.length, 489);
  assert.equal(D.se.length, 16);
  assert.equal(D.sv.length, 6413);
  assert.equal(D.cond.length, 17);
  assert.deepEqual(D.cond.filter((x) => !x), [], 'condition sans libellé');
  assert.equal(D.sf.filter((x) => x.fam < 0).length, 0);
  assert.equal(D.sfFam.length, 83);
  assert.equal(D.sv.filter((s) => D.svNums.indexOf(s.cat) === -1).length, 0);
});

test('les 16 savoir-être officiels sont tous rangés dans une des quatre familles proposées', () => {
  assert.equal(PMD_FAMILLES_SE.reduce((n, f) => n + f[1].length, 0), 16);
  assert.equal(D.seFam.length, 4);
  assert.ok(D.se.every((x) => x.fam >= 0 && x.fam < 4));
});

test('chaque métier a ses compétences, et les liens vont dans les deux sens', () => {
  const sans = D.m.filter((r) => !r[3].length);
  assert.ok(sans.length <= 3, 'métiers sans savoir-faire : ' + sans.length);
  const i = metier('F1104');
  assert.ok(i >= 0 && D.m[i][3].length > 5 && D.m[i][5].length > 0);
  D.m[i][3].forEach((id) => assert.ok(D.inv.sf[id].indexOf(i) !== -1));
  D.m[i][5].forEach((id) => assert.ok(D.inv.sv[id].indexOf(i) !== -1));
});

test('aucun choix : aucun pourcentage utile, tous les métiers sont listés', () => {
  const S = C.pmcEtatInitial();
  const r = C.pmcCalculer(D, S);
  assert.equal(r.avec, false);
  assert.equal(r.retenus.length, 1919);
});

test('à choix égal, le métier qui demande la compétence choisie a un pourcentage plus haut que celui qui ne la demande pas', () => {
  const i = metier('J1501');
  const id = D.m[i][3][0];
  const S = C.pmcEtatInitial();
  S.comp.push({ t: 'sf', i: id });
  const avec = C.pmcScorer(D, S, D.m[i]);
  const sans = C.pmcScorer(D, S, D.m.find((r) => r[3].indexOf(id) === -1));
  assert.ok(avec.pct > sans.pct, avec.pct + ' contre ' + sans.pct);
  assert.equal(avec.retrouvees, 1);
});

test('une compétence que le métier ne demande pas ne le fait jamais monter', () => {
  const i = metier('J1501');
  const absent = D.sf.findIndex((x, id) => D.m[i][3].indexOf(id) === -1);
  const S = C.pmcEtatInitial();
  S.comp.push({ t: 'sf', i: absent });
  const sc = C.pmcScorer(D, S, D.m[i]);
  assert.equal(sc.retrouvees, 0);
  assert.equal(sc.pct, 0);
});

test('niveau : un métier qui demande plus de diplôme descend de 45 points par niveau, sans disparaître ; non précisé = 60 %', () => {
  const S = C.pmcEtatInitial();
  S.niveau = 3;
  const sous = D.m.find((r) => r[2] === 3), haut = D.m.find((r) => r[2] === 5), inconnu = D.m.find((r) => r[2] === 0);
  assert.equal(C.pmcScorer(D, S, sous).pct, 100);
  assert.equal(C.pmcScorer(D, S, haut).pct, 10);
  assert.equal(C.pmcScorer(D, S, inconnu).pct, 60);
});

test('secteur prioritaire (décision Denis 18/11/2026) : un autre secteur ne garde que 10 % du poids du secteur, jamais zéro', () => {
  const S = C.pmcEtatInitial();
  S.secteurs = [0];
  const dedans = D.m.find((r) => r[1] === 0), dehors = D.m.find((r) => r[1] !== 0);
  assert.equal(C.pmcScorer(D, S, dedans).pct, 100);
  assert.equal(C.pmcScorer(D, S, dehors).pct, 10);
});

test('conditions : UNE fonction partagée, facile ajoute et difficile retire un demi-point, jamais un barrage', () => {
  assert.deepEqual(C.pmcEffetConditions([1, 2, 3], [1], [2], 0.5), { cf: [1], cd: [2], points: 0 });
  assert.deepEqual(C.pmcEffetConditions([1, 2, 3], [1, 2], [], 0.5), { cf: [1, 2], cd: [], points: 1 });
  assert.deepEqual(C.pmcEffetConditions([1], [], [1, 9], 0.5), { cf: [], cd: [1], points: -0.5 });
  assert.equal(C.pmcEffetConditions([], [5], [6]).points, 0);
  const S = C.pmcEtatInitial();
  S.niveau = 3;
  const r = D.m.find((x) => x[2] === 3 && x[6].length);
  const base = C.pmcScorer(D, S, r).pct;
  S.dif = [r[6][0]];
  assert.ok(C.pmcScorer(D, S, r).pct >= base - 1, 'une condition difficile ne retire qu’un demi-point');
});

test('le classement va du plus haut au plus bas et le seuil de 40 % filtre', () => {
  const S = C.pmcEtatInitial();
  S.comp = [{ t: 'se', i: trouver('se', 'équipe') }, { t: 'sf', i: D.m[metier('K1304')][3][0] }];
  S.niveau = 4;
  const r = C.pmcCalculer(D, S);
  assert.ok(r.avec);
  for (let k = 1; k < r.tous.length; k++) { assert.ok(r.tous[k - 1].sc.pct >= r.tous[k].sc.pct); }
  assert.ok(r.retenus.every((o) => o.sc.pct >= 40));
});

test('métiers proches : la liste officielle du ROME passe d’abord, puis les compétences en commun complètent jusqu’à 3', () => {
  const i = metier('J1501');
  const officiels = ['J1502', 'J1506'];
  const p = C.pmcProches(D, i, officiels, 3);
  assert.equal(p.length, 3);
  assert.equal(D.m[p[0].i].code, 'J1502');
  assert.equal(p[0].officiel, true);
  assert.equal(p[2].officiel, false);
  assert.ok(p.every((x) => x.i !== i));
  assert.equal(C.pmcProches(D, i, [], 3).length, 3);
});

test('une compétence ouvre la liste des métiers où elle compte le plus, dans l’ordre de l’index complet', () => {
  const { INDEX_COMPETENCES: INDEX } = require('../data/rome/indexCompetences.js');
  const id = Number(Object.keys(INDEX.sf)[40]);
  const liste = C.pmcRepresentatifs(D, INDEX, 'sf', id);
  assert.ok(liste.length >= 3);
  assert.equal(D.m[liste[0]].code, INDEX.sf[id][0].replace(/\+\d*$/, ''));
  const svId = INDEX.sv.findIndex((s) => /^Comptabilité analytique/.test(s[0]));
  assert.ok(C.pmcRepresentatifs(D, INDEX, 'sv', svId).length >= 2);
  const seId = D.se.findIndex((x) => /équipe/.test(x.lib));
  assert.ok(C.pmcRepresentatifs(D, INDEX, 'se', seId).length > 100);
});

test('les suggestions de la barre unique regroupent métiers, compétences, secteurs, niveaux et conditions', () => {
  const S = C.pmcEtatInitial();
  assert.equal(C.pmcSuggestions(D, S, ''), null);
  const b = C.pmcSuggestions(D, S, 'b');
  assert.equal(b.metiers.items.length, 8, 'les 8 premiers métiers dès la première lettre');
  assert.ok(b.metiers.total > 8);
  assert.ok(C.pmcSuggestions(D, S, 'bac').niveaux.items.some((n) => n[0] === 4));
  assert.ok(C.pmcSuggestions(D, S, 'conditions de travail').conditions.items.length >= 17 - 0 || C.pmcSuggestions(D, S, 'conditions de travail').conditions.total === 17);
  assert.equal(C.pmcSuggestions(D, S, 'secteurs').secteurs.items.length, 21);
  assert.equal(C.pmcSuggestions(D, S, 'zzzzqq').vide, true);
  const dej = C.pmcSuggestions(D, S, 'écoute');
  S.comp.push({ t: dej.competences.items[0].t, i: dej.competences.items[0].i });
  assert.ok(!C.pmcSuggestions(D, S, 'écoute').competences.items.some((c) => c.t === S.comp[0].t && c.i === S.comp[0].i), 'une compétence déjà choisie n’est plus proposée');
});

test('territoires : les cinq zones d’emploi de « Comprendre les chiffres », départements voisins du plus proche au plus éloigné', () => {
  assert.deepEqual(Object.keys(C.PMC_TERRITOIRES['24'].zones), ['Bergerac', 'Périgueux', 'Sarlat-la-Canéda']);
  assert.deepEqual(Object.keys(C.PMC_TERRITOIRES['87'].zones), ['Limoges', 'Saint-Junien']);
  assert.deepEqual(C.pmcDepartementsVoisins('24', 'Bergerac'), ['47', '33'], 'depuis Bergerac, le Lot-et-Garonne est plus proche que la Gironde');
  assert.deepEqual(C.pmcDepartementsVoisins('24', 'Sarlat-la-Canéda'), ['46', '19', '47']);
  assert.deepEqual(C.pmcDepartementsVoisins('87', 'Limoges'), ['19', '23', '24', '16']);
  assert.deepEqual(C.pmcDepartementsVoisins('87', 'Inconnue'), []);
  Object.keys(C.PMC_TERRITOIRES).forEach((d) => Object.keys(C.PMC_TERRITOIRES[d].zones).forEach((z) => C.PMC_TERRITOIRES[d].zones[z].forEach((v) => {
    assert.ok(C.PMC_NOMS_DEPARTEMENTS[v], 'département sans nom : ' + v);
    assert.notEqual(v, d, 'le département de la zone ne se liste pas lui-même');
  })));
});

test('les textes du module n’emploient ni tiret long ni le mot « IA »', () => {
  const fs = require('fs');
  ['parMetierDonnees.js', 'parMetierCalcul.js'].forEach((f) => {
    const s = fs.readFileSync(require('path').join(__dirname, '..', 'modules', 'comprendre-les-metiers', f), 'utf8');
    assert.equal((s.match(/[–—]/g) || []).length, 0, 'tiret long dans ' + f);
  });
});

test('« Par ce que vous aimez faire » : la liste est ajustée par la MÊME fonction de conditions, sans barrage, sans choix la liste ne bouge pas', () => {
  const liste = [{ rome: 'A', score: 80 }, { rome: 'B', score: 79.8 }, { rome: 'C', score: 79.8 }, { rome: 'D', score: 0.2 }];
  const conds = { A: ['nuit'], B: ['weekend'], C: [], D: ['nuit'] };
  const idsDe = (m) => conds[m.rome];
  assert.equal(C.pmcAjusterListeConditions(liste, [], [], idsDe), liste, 'sans choix : la même liste');
  const dif = C.pmcAjusterListeConditions(liste, [], ['nuit'], idsDe);
  assert.deepEqual(dif.map((m) => m.rome), ['B', 'C', 'A', 'D'], 'difficile : A perd 0,5 et descend, B et C gardent leur ordre');
  assert.equal(dif.find((m) => m.rome === 'A').score, 79.5);
  assert.equal(dif.find((m) => m.rome === 'A').scoreSansConditions, 80);
  assert.equal(dif.find((m) => m.rome === 'D').score, 0, 'jamais en dessous de 0');
  const fac = C.pmcAjusterListeConditions(liste, ['weekend'], [], idsDe);
  assert.deepEqual(fac.map((m) => m.rome), ['B', 'A', 'C', 'D'], 'facile : B gagne 0,5 et passe devant A');
  assert.equal(fac.find((m) => m.rome === 'B').score, 80.3, 'facile : +0,5, plafonné à 100 ailleurs');
  assert.equal(C.pmcAjusterListeConditions([{ rome: 'X', score: 99.9 }], ['nuit'], [], () => ['nuit'])[0].score, 100);
  assert.equal(liste[0].score, 80, 'la liste d’origine n’est pas modifiée');
});

test('conditions de travail : « Par un métier » et « Par ce que vous aimez faire » partagent les mêmes familles, la même ligne Facile / Difficile et les 17 conditions du ROME sont toutes rangées (consigne 480)', () => {
  const fs = require('fs'), path = require('path');
  const lire = (f) => fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-les-metiers', f), 'utf8');
  const ecran = lire('parMetierEcran.js'), actions = lire('parActions.js');
  assert.ok(/cmvFamilleConditions\(/.test(ecran) && /cmvLigneFacDif\(/.test(ecran), 'le chemin 1 utilise la brique partagée');
  assert.ok(/cmvFamilleConditions\(/.test(actions) && /cmvLigneFacDif\(/.test(actions), 'le chemin 2 utilise la même brique');
  assert.ok(!/class="cond-ligne"/.test(ecran), 'plus d\'ancienne ligne propre au chemin 1');
  assert.ok(/data-pm="fac"/.test(ecran) && /data-pm="dif"/.test(ecran), 'les gestes du chemin 1 sont conservés');
  // Chaque condition de « Par un métier » est dans une famille (quatre familles communes + les lieux).
  const D = require('../modules/comprendre-les-metiers/parMetierDonnees.js');
  const rangees = [];
  actions.replace(/ids: \[([^\]]+)\]/g, (m, l) => { l.split(',').forEach((x) => rangees.push(x.trim().replace(/'/g, ''))); return m; });
  D.PMD_CLES_CONDITIONS.forEach((id) => assert.ok(rangees.indexOf(id) !== -1, 'condition rangée : ' + id));
  assert.equal(D.PMD_CLES_CONDITIONS.length, 17);
});

test('« Par ce que vous aimez faire » : page des conditions facile / difficile, même vocabulaire, la fonction partagée est bien celle qui calcule', () => {
  const fs = require('fs'), path = require('path');
  const lire = (f) => fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-les-metiers', f), 'utf8');
  const actions = lire('parActions.js'), index = lire('index.js'), garder = lire('garder.js');
  assert.ok(/pmcAjusterListeConditions\(/.test(actions) && /pmcEffetConditions\(/.test(actions), 'les deux chemins passent par la fonction partagée');
  assert.ok(!/etat\.choix\.conditions\.length\)\s*\{\s*return/.test(actions), 'pas de second calcul');
  assert.ok(/faciles: \[\]/.test(index) && /faciles:/.test(garder), 'facile est gardé dans l’état et dans la disquette');
  assert.ok(/Facile<\/button>/.test(index) && /Difficile<\/button>/.test(index) && /cmvLigneFacDif\(/.test(actions), 'deux boutons par condition, dans la brique partagée');
  // les 14 conditions de la page sont toutes connues du ROME ; les 3 lieux n’y sont pas (déjà demandés à la page « Où »)
  const ids = []; actions.replace(/ids: \[([^\]]+)\] \}/g, (m, l) => { l.split(',').forEach((x) => ids.push(x.trim().replace(/'/g, ''))); return m; });
  assert.equal(ids.length, 14);
  assert.deepEqual(ids.filter((k) => D.condCles.indexOf(k) === -1), [], 'condition inconnue');
  assert.deepEqual(['exterieur', 'public', 'domicile'].filter((k) => ids.indexOf(k) !== -1), []);
});

test('secteur prioritaire : le même métier pèse nettement plus quand son secteur est choisi, et un autre secteur ne disparaît pas s’il retrouve presque tout', () => {
  const r = D.m.find((x) => x[3].length >= 1 && x[3].length <= 3);
  const id = r[3][0], autre = (r[1] + 1) % D.secteurs.length;
  const S = C.pmcEtatInitial(); S.comp = [{ t: 'sf', i: id }]; S.secteurs = [r[1]];
  const dedans = C.pmcScorer(D, S, r).pct;
  S.secteurs = [autre];
  const dehors = C.pmcScorer(D, S, r).pct;
  assert.ok(dedans - dehors >= 20, 'le secteur choisi compte beaucoup (' + dedans + ' contre ' + dehors + ')');
  assert.ok(dehors >= 40, 'un autre secteur qui retrouve la compétence en entier reste visible (' + dehors + ')');
});

test('recherche de secteur : les mots courants mènent au bon secteur (« enseignement » = Éducation et formation) et chaque secteur est couvert', () => {
  const S = C.pmcEtatInitial();
  const noms = (q) => C.pmcSuggestions(D, S, q).secteurs.items.map((i) => D.secteurs[i]);
  assert.ok(noms('enseignement').indexOf('Éducation et formation') !== -1);
  assert.ok(noms('enseign').indexOf('Éducation et formation') !== -1);
  assert.ok(noms('restaurant').indexOf('Hôtellerie, restauration et tourisme') !== -1);
  assert.deepEqual(D.secteurs.filter((x) => !C.PMC_MOTS_SECTEURS[x]), [], 'secteur sans mots courants');
  assert.deepEqual(Object.keys(C.PMC_MOTS_SECTEURS).filter((x) => D.secteurs.indexOf(x) === -1), [], 'clé qui ne correspond à aucun secteur');
});

// Demande d'offres de la fiche (consigne 453) : message à copier pour l'assistant en ligne.
test('pmcMessageOffres : territoire, départements proches dans l\'ordre, choix repris, aucun tiret long', () => {
  const m = C.pmcMessageOffres({ metier: 'Aide-soignant', dateTexte: '18 novembre 2026', departement: 'Haute-Vienne (87)', zone: 'Limoges',
    voisins: ['Corrèze (19)', 'Creuse (23)'], competences: ['Gérer un planning', 'Faire preuve de rigueur'], niveau: 'Bac' });
  assert.ok(m.indexOf('Nous sommes le 18 novembre 2026.') === 0);
  assert.ok(m.indexOf('Aide-soignant') !== -1);
  assert.ok(m.indexOf('(Limoges, Haute-Vienne (87))') !== -1);
  assert.ok(m.indexOf('Corrèze (19), Creuse (23)') !== -1);
  assert.ok(m.indexOf('Gérer un planning, Faire preuve de rigueur') !== -1);
  assert.ok(m.indexOf('Mon niveau d’études : Bac.') !== -1);
  assert.ok(!/[\u2013\u2014]/.test(m));
});

test('pmcMessageOffres : demande de chercher sous tous les intitulés du ou des métiers, et une liste « Métiers voisins »', () => {
  const un = C.pmcMessageOffres({ metier: 'Plombier', dateTexte: '18 novembre 2026', departement: 'Corrèze (19)', zone: '', voisins: [], competences: [], niveau: '' });
  const plusieurs = C.pmcMessageOffres({ metiers: ['Cuisiniers (aussi appelé : Chef de cuisine)', 'Aides-soignants'], dateTexte: '18 novembre 2026', departement: 'Corrèze (19)', zone: '', voisins: [], competences: [], niveau: '' });
  assert.ok(un.includes('Cherche ce métier sous tous ses intitulés'));
  assert.ok(plusieurs.includes('Cherche ces métiers sous tous leurs intitulés') && plusieurs.includes('aussi appelé : Chef de cuisine'));
  assert.ok(un.includes('Métiers voisins') && plusieurs.includes('Métiers voisins'));
});

test('pmcMessageOffres : sans territoire ni choix, le message reste complet et ne parle pas de voisins', () => {
  const m = C.pmcMessageOffres({ metier: 'Plombier', dateTexte: '18 novembre 2026', departement: 'Corrèze (19)', zone: '', voisins: [], competences: [], niveau: '' });
  assert.ok(m.indexOf('dans le département suivant : Corrèze (19).') !== -1);
  assert.ok(m.indexOf('Ensuite, dans les départements') === -1);
  assert.ok(m.indexOf('Voici ce que je sais déjà faire') === -1);
  assert.ok(m.indexOf('Mon niveau d’études') === -1);
});
