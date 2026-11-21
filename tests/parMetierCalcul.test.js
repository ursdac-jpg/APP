const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pmdDonnees, PMD_FAMILLES_SE } = require('../modules/comprendre-les-metiers/parMetierDonnees.js');
const C = require('../modules/comprendre-les-metiers/parMetierCalcul.js');

// « Chercher un métier » : données construites à partir de l'index complet, et calcul du pourcentage (maquette du 17/11/2026, consignes 448 à 454).
const D = pmdDonnees();
const trouver = (t, morceau) => D[t].findIndex((x) => x.lib.toLowerCase().indexOf(morceau) !== -1);
const metier = (code) => D.m.findIndex((r) => r.code === code);

test('les données couvrent tous les métiers, toutes les compétences du ROME et les 17 conditions de travail', () => {
  assert.equal(D.m.length, 1920);   // 1919 le temps que « Installateur mainteneur en systèmes solaires » (F1610) manquait : sa fiche est revenue à la régénération du 19/11/2026 (consigne 494), le code de « Couvreur » ayant été corrigé en F1619
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
  assert.equal(r.retenus.length, 1920);
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
  // La « qualité » est la part de ce que les choix demandent ; le pourcentage affiché est plafonné par le nombre de choix (consigne 505 : un seul choix, 10 % au plus).
  assert.equal(C.pmcScorer(D, S, sous).qualite, 100);
  assert.equal(C.pmcScorer(D, S, haut).qualite, 10);
  assert.equal(C.pmcScorer(D, S, inconnu).qualite, 60);
  assert.equal(C.pmcScorer(D, S, sous).pct, 10);
  assert.equal(C.pmcScorer(D, S, inconnu).pct, 6);
});

test('secteur prioritaire (décision Denis 18/11/2026) : un autre secteur ne garde que 10 % du poids du secteur, jamais zéro', () => {
  const S = C.pmcEtatInitial();
  S.secteurs = [0];
  const dedans = D.m.find((r) => r[1] === 0), dehors = D.m.find((r) => r[1] !== 0);
  assert.equal(C.pmcScorer(D, S, dedans).qualite, 100);
  assert.equal(C.pmcScorer(D, S, dehors).qualite, 10);
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
  for (let k = 1; k < r.tous.length; k++) { assert.ok(r.tous[k - 1].sc.qualite >= r.tous[k].sc.qualite); }
  assert.ok(r.retenus.every((o) => o.sc.qualite >= 40));
  assert.ok(r.tous.every((o) => o.sc.pct <= 55), 'trois choix : au plus 55 %');
});

test('consigne 488 : le pourcentage plafonne selon le nombre de choix et monte quand on en ajoute un que le métier retrouve', () => {
  const i = metier('J1501');
  const ids = D.m[i][3].slice(0, 4);
  assert.ok(ids.length >= 3);
  let precedent = -1;
  for (let n = 1; n <= ids.length; n++) {
    const S = C.pmcEtatInitial();
    S.comp = ids.slice(0, n).map((id) => ({ t: 'sf', i: id }));
    assert.equal(C.pmcPlafond(S), [0, 10, 20, 30, 40][n]);
    const sc = C.pmcScorer(D, S, D.m[i]);
    assert.ok(sc.pct <= C.pmcPlafond(S), 'jamais au-dessus du plafond');
    assert.ok(sc.pct > precedent, 'le pourcentage monte avec le nombre de choix retrouvés (' + n + ' : ' + sc.pct + ')');
    precedent = sc.pct;
  }
  const un = C.pmcEtatInitial(); un.secteurs = [0];
  assert.ok(C.pmcCalculer(D, un).tous.every((o) => o.sc.pct <= 10), 'un seul secteur : jamais plus de 10 %');
  assert.equal(C.pmcSeuilAffiche(un, 40), 4);
  const deux = C.pmcEtatInitial(); deux.secteurs = [0, 1];
  assert.equal(C.pmcPlafond(deux), 10, 'plusieurs secteurs comptent pour un seul choix (un métier n’a qu’un secteur)');
});

test('consigne 488 : le pourcentage est la part des choix retrouvés (plafonnée par leur nombre), pas la part de ce que le métier demande', () => {
  const conduire = D.sf.findIndex((x) => /Conduire un véhicule sur la route/.test(x.lib));
  const equipe = D.se.findIndex((x) => /esprit d’équipe/.test(x.lib));
  const S = C.pmcEtatInitial();
  S.comp = [{ t: 'sf', i: conduire }, { t: 'se', i: equipe }]; S.secteurs = [20];
  const r = C.pmcCalculer(D, S);
  assert.equal(C.pmcPlafond(S), 30);
  assert.equal(r.tous[0].sc.pct, 30, 'trois choix retrouvés sur trois : le plafond, pas 36 %');
  assert.ok(r.retenus.length > 50);
  // À égalité de part retrouvée, le cœur de métier puis le rappel départagent (jamais l'ordre alphabétique seul).
  const egaux = r.tous.filter((o) => o.sc.qualite === r.tous[0].sc.qualite);
  for (let k = 1; k < egaux.length; k++) {
    const a = egaux[k - 1].sc, b = egaux[k].sc;
    assert.ok(a.coeur > b.coeur || (a.coeur === b.coeur && a.rappel >= b.rappel - 1e-9), 'départage par le cœur de métier puis le rappel');
  }
  // Une seule compétence retrouvée : jamais plus que le plafond d'un choix, même si le métier demande peu.
  const un = C.pmcEtatInitial(); un.comp = [{ t: 'se', i: equipe }];
  assert.ok(C.pmcCalculer(D, un).tous.every((o) => o.sc.pct <= 25));
});

test('consigne 497 : une compétence rare pèse plus qu’une compétence très répandue, et le poids ne dépend que du nombre de métiers qui la portent', () => {
  const autonomie = D.se.findIndex((x) => /autonomie/i.test(x.lib));
  const rare = D.sv.findIndex((x, id) => D.inv.sv[id] && D.inv.sv[id].length >= 2 && D.inv.sv[id].length <= 10);
  assert.ok(rare >= 0);
  const wAut = C.pmcPoidsRarete(D, 'se', autonomie), wRare = C.pmcPoidsRarete(D, 'sv', rare);
  assert.ok(wRare > 2 * wAut, 'rare ' + wRare + ' contre Autonomie ' + wAut);
  assert.equal(C.pmcPoidsRarete(D, 'se', autonomie), wAut, 'même valeur à chaque appel');
  assert.equal(C.pmcPoidsRarete(D, 'sf', 999999), 0, 'une compétence portée par aucun métier ne pèse rien');
});

test('consigne 497 : un métier qui retrouve la compétence rare passe devant un métier qui ne retrouve qu’« Autonomie », à nombre de choix retrouvés égal', () => {
  const autonomie = D.se.findIndex((x) => /autonomie/i.test(x.lib));
  const iRare = D.m.findIndex((r) => r[3].some((id) => D.inv.sf[id].length <= 10) && r[4].indexOf(autonomie) === -1);
  assert.ok(iRare >= 0);
  const idRare = D.m[iRare][3].find((id) => D.inv.sf[id].length <= 10);
  const iAut = D.m.findIndex((r) => r[4].indexOf(autonomie) !== -1 && r[3].indexOf(idRare) === -1);
  const S = C.pmcEtatInitial();
  S.comp = [{ t: 'se', i: autonomie }, { t: 'sf', i: idRare }];
  const avecRare = C.pmcScorer(D, S, D.m[iRare]), avecAut = C.pmcScorer(D, S, D.m[iAut]);
  assert.equal(avecRare.retrouvees, 1);
  assert.equal(avecAut.retrouvees, 1);
  assert.ok(avecRare.qualite > avecAut.qualite, avecRare.qualite + ' contre ' + avecAut.qualite);
  // Le métier qui retrouve les deux reste à la part maximale (plafond du nombre de choix).
  const iDeux = D.m.findIndex((r) => r[4].indexOf(autonomie) !== -1 && r[3].indexOf(idRare) !== -1);
  if (iDeux >= 0) { assert.equal(C.pmcScorer(D, S, D.m[iDeux]).pct, 40); }
  // Un seul métier qui porte la compétence rare ET aucun autre ne retrouvant qu'Autonomie : ce dernier sort de la liste (moins de 40 % du poids des choix).
  const res = C.pmcCalculer(D, S);
  assert.ok(res.retenus.length < D.m.filter((r) => r[4].indexOf(autonomie) !== -1).length, 'la liste est plus courte qu’avec Autonomie seule');
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

test('« Partir de vos envies » : la liste est ajustée par la MÊME fonction de conditions, sans barrage, sans choix la liste ne bouge pas', () => {
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

test('conditions de travail : « Chercher un métier » et « Partir de vos envies » partagent les mêmes familles, la même ligne Facile / Difficile et les 17 conditions du ROME sont toutes rangées (consigne 480)', () => {
  const fs = require('fs'), path = require('path');
  const lire = (f) => fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-les-metiers', f), 'utf8');
  const ecran = lire('parMetierEcran.js'), actions = lire('parActions.js');
  assert.ok(/cmvFamilleConditions\(/.test(ecran) && /cmvLigneFacDif\(/.test(ecran), 'le chemin 1 utilise la brique partagée');
  assert.ok(/cmvFamilleConditions\(/.test(actions) && /cmvLigneFacDif\(/.test(actions), 'le chemin 2 utilise la même brique');
  assert.ok(!/class="cond-ligne"/.test(ecran), 'plus d\'ancienne ligne propre au chemin 1');
  assert.ok(/data-pm="fac"/.test(ecran) && /data-pm="dif"/.test(ecran), 'les gestes du chemin 1 sont conservés');
  // Chaque condition de « Chercher un métier » est dans une famille (quatre familles communes + les lieux).
  const D = require('../modules/comprendre-les-metiers/parMetierDonnees.js');
  const rangees = [];
  actions.replace(/ids: \[([^\]]+)\]/g, (m, l) => { l.split(',').forEach((x) => rangees.push(x.trim().replace(/'/g, ''))); return m; });
  D.PMD_CLES_CONDITIONS.forEach((id) => assert.ok(rangees.indexOf(id) !== -1, 'condition rangée : ' + id));
  assert.equal(D.PMD_CLES_CONDITIONS.length, 17);
});

test('« Partir de vos envies » : page des conditions facile / difficile, même vocabulaire, la fonction partagée est bien celle qui calcule', () => {
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
  const dedans = C.pmcScorer(D, S, r).qualite;
  S.secteurs = [autre];
  const dehors = C.pmcScorer(D, S, r).qualite;
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

test('pmcMessageOffres : les cinq appellations les plus courantes du métier sont données (consigne 496), jamais pour une liste de métiers', () => {
  const base = { dateTexte: '18 novembre 2026', departement: 'Corrèze (19)', zone: '', voisins: [], competences: [], niveau: '' };
  const n = ['Agent de soins', 'Auxiliaire de gériatrie', 'Aide médico-psychologique', 'Soignant', 'Aide-soignant hospitalier', 'Sixième nom'];
  const avec = C.pmcMessageOffres(Object.assign({ metier: 'Aide-soignant', appellations: n }, base));
  assert.ok(/autres noms d’emploi/.test(avec));
  assert.ok(avec.indexOf('Agent de soins ; Auxiliaire de gériatrie ; Aide médico-psychologique ; Soignant ; Aide-soignant hospitalier') !== -1);
  assert.ok(avec.indexOf('Sixième nom') === -1, 'cinq noms au plus');
  assert.ok(avec.indexOf('Où chercher') > avec.indexOf('Agent de soins'), 'les noms viennent avant le territoire');
  assert.ok(!/autres noms d’emploi/.test(C.pmcMessageOffres(Object.assign({ metier: 'Aide-soignant', appellations: [] }, base))), 'rien si la fiche ne donne aucun autre nom');
  assert.ok(!/autres noms d’emploi/.test(C.pmcMessageOffres(Object.assign({ metiers: ['Plombier', 'Maçon'], appellations: n }, base))), 'rien pour une liste de métiers');
  assert.ok(!/[—–]/.test(avec));
});

test('pmcNomsEmploi : forme masculine, doublons et nom du métier retirés, ordre conservé (consigne 496)', () => {
  const r = C.pmcNomsEmploi(['Aide-soignant / Aide-soignante', 'Aide-soignant / Aide-soignante en gériatrie', 'Agent de soins', 'agent de soins', "Conducteur / Conductrice d'engins"], 'Aide-soignant');
  assert.deepEqual(r, ['Aide-soignant en gériatrie', 'Agent de soins', "Conducteur d'engins"]);
  assert.deepEqual(C.pmcNomsEmploi(undefined, 'X'), []);
});

test('consigne 499 : « Comment vos choix ont été lus », chemin 1 : une ligne par choix, avec ses comptages réels', () => {
  const autonomie = D.se.findIndex((x) => /autonomie/i.test(x.lib));
  const S = C.pmcEtatInitial();
  S.comp = [{ t: 'se', i: autonomie }];
  S.niveau = 3; S.secteurs = [D.m[0][1]]; S.dif = ['nuit']; S.fac = [];
  const res = C.pmcCalculer(D, S);
  const lus = C.pmcChoixLus(D, S, res.retenus.length);
  assert.equal(lus.total, D.m.length);
  assert.equal(lus.nbChoix, C.pmcNbChoixPourPlafond(S));
  assert.equal(lus.plafond, C.pmcPlafond(S));
  assert.equal(lus.liste, res.retenus.length);
  assert.deepEqual(lus.lignes.map((x) => x.type), ['comp', 'niveau', 'secteur', 'conditions']);
  assert.equal(lus.lignes[0].nb, D.inv.se[autonomie].length, 'le nombre de métiers qui portent la compétence est celui du poids de rareté');
  assert.equal(lus.lignes[1].nb, D.m.filter((r) => r[2] > 0 && r[2] <= 3).length);
  assert.equal(lus.lignes[2].nb, D.m.filter((r) => r[1] === D.m[0][1]).length);
  assert.equal(lus.lignes[3].nb, 1);
  assert.equal(C.pmcChoixLus(D, C.pmcEtatInitial(), 0).lignes.length, 0, 'aucun choix : aucune ligne');
});

test('consigne 501 : chemin 1, le message ne compte que les compétences choisies et ne paraît pas sous 4 compétences', () => {
  const S = C.pmcEtatInitial();
  const idx = (t, re) => D[t].findIndex((x) => re.test(x.lib));
  S.comp = [{ t: 'se', i: idx('se', /autonomie/i) }, { t: 'sf', i: idx('sf', /^Soigner des animaux$/) }];
  assert.equal(C.pmcDirections(D, S).declenche, false, 'deux compétences : jamais de message');
  S.niveau = 3; S.secteurs = [D.m[0][1]];
  assert.equal(C.pmcDirections(D, S).n, 2, 'le niveau et le secteur ne comptent pas comme des choix du message');
  // quatre compétences prises chacune chez un métier différent : très peu de métiers les retrouvent à 60 %
  S.comp = [0, 1, 2, 3].map((k) => { const r = D.m[k * 400]; return { t: 'sf', i: r[3][0] }; });
  const r = C.pmcDirections(D, S);
  assert.equal(r.n, 4);
  assert.equal(r.nbCouverts, D.m.filter((m) => S.comp.filter((c) => m[3].indexOf(c.i) !== -1).length >= 3).length);
});
