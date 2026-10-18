'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const C = require('../outils/veilleChiffres.js');

const DOSSIER = path.resolve(__dirname, '..', 'modules', 'comprendre-les-chiffres', 'contenu');
const FICHIERS_TERRITOIRE = fs.readdirSync(DOSSIER).filter((f) => /(departements-region|regions-france|zones-emploi|medecins|dentistes|pharmaciens|specialistes)/.test(f));

// ---------- essai de réécriture à l'identique sur les VRAIS fichiers (ne dépend ni de leur contenu précis ni de leurs fins de ligne) ----------
test('chiffres : les 11 fichiers de territoire se lisent et se réécrivent à l\'identique (tels quels, et sous la forme canonique)', () => {
  assert.strictEqual(FICHIERS_TERRITOIRE.length, 11);
  FICHIERS_TERRITOIRE.forEach((f) => {
    const t = fs.readFileSync(path.join(DOSSIER, f), 'utf8').replace(/\r\n/g, '\n');
    const l = C.lireTerritoire(t);
    assert.ok(l.ok, f + ' : ' + l.erreur);
    assert.ok(l.blocs.length >= 3, f + ' : lieux');
    assert.strictEqual(C.territoireEnTexte(l), t, f + ' : réécriture sans changement différente');
    assert.strictEqual(C.territoireEnTexte(l, { toutCanonique: true }), t, f + ' : la forme canonique ne redonne pas le fichier');
  });
});

test('chiffres : le digest se réécrit à l\'identique ; les entrées de chiffres (30 sur 36) sont toutes lisibles et canoniques', () => {
  const t = fs.readFileSync(path.join(DOSSIER, '2026-06.md'), 'utf8').replace(/\r\n/g, '\n');
  const g = C.lireDigest(t);
  assert.ok(g.ok);
  assert.strictEqual(C.digestEnTexte(g), t);
  assert.strictEqual(C.digestEnTexte(g, { toutCanonique: true }), t);
  assert.ok(g.entrees.filter((e) => e.entree).length >= 28, 'les entrées de chiffres se lisent');
  assert.strictEqual(new Set(g.entrees.map((e) => e.ref)).size, g.entrees.length, 'chaque entrée a une référence unique');
});

// ---------- jeux d'essai fixes ----------
const ENT_Z = '---\nperiode: 1er trimestre 2026\nverifie_le: 2026-09\nsources:\n  - "src-a | Source A | https://exemple.org/a | 2026-09-12"\n  - "src-b | Source B | https://exemple.org/b | 2026-09"\n  - "src-c | Source C | https://exemple.org/c | "\n---\n';
const ZONES = ENT_Z + '\n# 24\n\n## Bergerac\nvaleur: 8,5 %\nsources: src-a, src-b\nniveau_vie_median: 23 700 €\nsecteur_principal: Agriculture\n\nPremier paragraphe sur Bergerac.\n\n## Périgueux\nvaleur: 7,5 %\nsources: src-a\n\nParagraphe sur Périgueux.\n\n# 87\n\n## Limoges\nvaleur: 7,1 %\nsources: src-b\n\nParagraphe sur Limoges.\n';
const AUJ = { aujourdhui: '2026-10-18' };

test('territoire : un chiffre exige la confirmation de la source ; avec elle, seule la ligne change et les sources du lieu sont datées dans le format de leur date', () => {
  const sans = C.modifierTerritoire(ZONES, { lieu: 'Bergerac', champs: { valeur: '8,9 %' } }, AUJ);
  assert.strictEqual(sans.ok, false); assert.match(sans.erreur, /confirmez/);
  const r = C.modifierTerritoire(ZONES, { lieu: 'Bergerac', champs: { valeur: '8,9 %' }, confirmeSource: true }, AUJ);
  assert.ok(r.ok, r.erreur);
  const a = ZONES.split('\n'), b = r.texte.split('\n');
  const diff = a.map((l, i) => (l === b[i] ? null : [l, b[i]])).filter(Boolean);
  assert.deepStrictEqual(diff.map((x) => x[1]), [
    '  - "src-a | Source A | https://exemple.org/a | 2026-10-18"', '  - "src-b | Source B | https://exemple.org/b | 2026-10"', 'valeur: 8,9 %'
  ]);
  assert.strictEqual(a.length, b.length);
  assert.strictEqual(r.resume.action, 'chiffre modifié');
});

test('territoire : forme refusée (virgule, unité), champ inconnu, lieu inconnu, tiret long, paragraphe vide ou avec un titre', () => {
  const m = (champs, plus) => C.modifierTerritoire(ZONES, Object.assign({ lieu: 'Bergerac', champs: champs, confirmeSource: true }, plus || {}), AUJ);
  assert.strictEqual(m({ valeur: '8.5 %' }).ok, false);
  assert.strictEqual(m({ niveau_vie_median: '23700' }).ok, false);
  assert.strictEqual(m({ fantaisie: 'x' }).ok, false);
  assert.strictEqual(m({ secteur_principal: 'Un ' + String.fromCharCode(0x2014) + ' tiret' }).ok, false);
  assert.strictEqual(m({}, { prose: '   ' }).ok, false);
  assert.strictEqual(m({}, { prose: 'Texte\n## Titre' }).ok, false);
  assert.strictEqual(C.modifierTerritoire(ZONES, { lieu: 'Nulle part', champs: { valeur: '1 %' }, confirmeSource: true }, AUJ).ok, false);
  assert.strictEqual(m({ valeur: '8,5 %' }).ok, false, 'une valeur identique ne change rien');
});

test('territoire : le paragraphe, les sources (de l\'en-tête seulement) et la date de vérification (même format) se modifient sans toucher aux autres lieux', () => {
  const r = C.modifierTerritoire(ZONES, { lieu: 'Bergerac', prose: 'Nouveau paragraphe.', sources: ['src-a', 'src-c'], datation: 'redater' }, AUJ);
  assert.ok(r.ok, r.erreur);
  assert.ok(r.texte.indexOf('verifie_le: 2026-10\n') !== -1, 'la date du fichier garde son format AAAA-MM');
  assert.ok(r.texte.indexOf('sources: src-a, src-c\n') !== -1);
  assert.ok(r.texte.indexOf('Nouveau paragraphe.\n\n## Périgueux') !== -1);
  assert.ok(r.texte.indexOf('Paragraphe sur Limoges.\n') !== -1);
  assert.strictEqual(r.resume.action, 'texte modifié');
  assert.strictEqual(C.modifierTerritoire(ZONES, { lieu: 'Bergerac', sources: ['src-inconnue'] }, AUJ).ok, false);
});

test('territoire : un même nom de lieu dans deux groupes demande le groupe', () => {
  const t = ENT_Z + '\n# na\n\n## Dordogne\nvaleur: 7,8 %\nsources: src-a\n\nUn.\n\n# fr\n\n## Dordogne\nvaleur: 7,0 %\nsources: src-a\n\nDeux.\n';
  assert.strictEqual(C.modifierTerritoire(t, { lieu: 'Dordogne', champs: { valeur: '7,9 %' }, confirmeSource: true }, AUJ).ok, false);
  const r = C.modifierTerritoire(t, { lieu: 'Dordogne', groupe: 'fr', champs: { valeur: '7,1 %' }, confirmeSource: true }, AUJ);
  assert.ok(r.ok, r.erreur);
  assert.ok(r.texte.indexOf('valeur: 7,8 %') !== -1 && r.texte.indexOf('valeur: 7,1 %') !== -1);
});

const ENT_D = '---\nperiode: "avril à juin 2026"\nverifie_le: 2026-10-13\nsources:\n  - "INSEE | Taux localisés | https://www.insee.fr/fr/statistiques/2012804 | 2026-10-05"\n  - "Eurostat | Chômage | https://ec.europa.eu/eurostat/x | 2026-09"\n---\n';
const DIGEST = ENT_D + '\n# Les chiffres\n\n## Taux de chômage localisé\n\nIntroduction.\n\n- Dordogne (24) : **7,9 %** (2e trimestre 2026, provisoire) ; précédent : 7,8 % ; il y a un an : 7,1 %. Source : INSEE, taux localisés | https://www.insee.fr/fr/statistiques/2012804\n  serie: T2 2025: 7,1 % ; T3 2025: 7,4 % ; T4 2025: 7,6 % ; T1 2026: 7,8 % ; T2 2026: 7,9 %\n  histo: haut: 10,9 % (2015) ; bas: 5,7 % (1982)\n  repere: Un peu en dessous de la moyenne française.\n- Haute-Vienne (87) : **7,6 %** (2e trimestre 2026) ; précédent : 7,4 %. Source : INSEE, taux localisés | https://www.insee.fr/fr/statistiques/2012804\n  serie: T1 2026: 7,4 % ; T2 2026: 7,6 %\n\n## Offres\n\n- Dordogne (24) : **environ 50 400 offres** (fin du 2e trimestre 2026) ; environ 51 000 le trimestre précédent. Source : France Travail | https://dataemploi.francetravail.fr/x\n';
const REF = 'Taux de chômage localisé | Dordogne (24)';

test('digest : changer le dernier point et la valeur ne change que ces lignes ; la source et le fichier sont datés ; la phrase « précédent » est recopiée', () => {
  const sans = C.modifierDigest(DIGEST, { ref: REF, changes: { valeur: '8,3 %', serie: [{ p: 'T2 2025', v: '7,1 %' }, { p: 'T3 2025', v: '7,4 %' }, { p: 'T4 2025', v: '7,6 %' }, { p: 'T1 2026', v: '7,8 %' }, { p: 'T2 2026', v: '8,3 %' }] } }, AUJ);
  assert.strictEqual(sans.ok, false); assert.match(sans.erreur, /confirmez/);
  const r = C.modifierDigest(DIGEST, { ref: REF, changes: { valeur: '8,3 %', serie: [{ p: 'T2 2025', v: '7,1 %' }, { p: 'T3 2025', v: '7,4 %' }, { p: 'T4 2025', v: '7,6 %' }, { p: 'T1 2026', v: '7,8 %' }, { p: 'T2 2026', v: '8,3 %' }] }, confirmeSource: true, datation: 'redater' }, AUJ);
  assert.ok(r.ok, r.erreur);
  const a = DIGEST.split('\n'), b = r.texte.split('\n');
  assert.strictEqual(a.length, b.length);
  const diff = a.map((l, i) => (l === b[i] ? null : b[i])).filter(Boolean);
  assert.deepStrictEqual(diff, [
    'verifie_le: 2026-10-18',
    '  - "INSEE | Taux localisés | https://www.insee.fr/fr/statistiques/2012804 | 2026-10-18"',
    '- Dordogne (24) : **8,3 %** (2e trimestre 2026, provisoire) ; précédent : 7,8 % ; il y a un an : 7,1 %. Source : INSEE, taux localisés | https://www.insee.fr/fr/statistiques/2012804',
    '  serie: T2 2025: 7,1 % ; T3 2025: 7,4 % ; T4 2025: 7,6 % ; T1 2026: 7,8 % ; T2 2026: 8,3 %'
  ]);
  assert.deepStrictEqual(r.resume.alertes, [], 'valeur et dernier point concordent');
});

test('digest : les alertes (valeur différente du dernier point, précédent faux) n\'empêchent pas d\'enregistrer ; les erreurs de forme, si', () => {
  const r = C.modifierDigest(DIGEST, { ref: REF, changes: { valeur: '8,3 %', precedent: '7,0 %' }, confirmeSource: true }, AUJ);
  assert.ok(r.ok, r.erreur);
  assert.strictEqual(r.resume.alertes.length, 2);
  assert.ok(r.texte.indexOf('précédent : 7,0 %') !== -1);
  const ko = (changes) => C.modifierDigest(DIGEST, { ref: REF, changes: changes, confirmeSource: true }, AUJ);
  assert.strictEqual(ko({ valeur: '7.9 %' }).ok, false);
  assert.strictEqual(ko({ serie: [{ p: 'T1 2026', v: 'abc' }] }).ok, false);
  assert.strictEqual(ko({ serie: [{ p: 'T1 2026', v: '7,8 %' }, { p: 'T1 2026', v: '7,9 %' }] }).ok, false);
  assert.strictEqual(ko({ serie: [{ p: 'T1 2026', v: '7,8 %' }, { p: 'T2 2026', v: '12' }] }).ok, false);
  assert.strictEqual(ko({ repere: 'Un ' + String.fromCharCode(0x2013) + ' tiret' }).ok, false);
  assert.strictEqual(ko({ sourceUrl: 'http://pas-https.org' }).ok, false);
  assert.strictEqual(ko({ fantaisie: 'x' }).ok, false);
  assert.strictEqual(ko({ valeur: '7,9 %' }).ok, false, 'une valeur identique ne change rien');
});

test('digest : une entrée sans précédent, série ou repère n\'en gagne pas ; une entrée inconnue est refusée', () => {
  const ref = 'Offres | Dordogne (24)';
  assert.strictEqual(C.modifierDigest(DIGEST, { ref: ref, changes: { precedent: '1 %' }, confirmeSource: true }, AUJ).ok, false);
  assert.strictEqual(C.modifierDigest(DIGEST, { ref: ref, changes: { serie: [{ p: 'T1 2026', v: '1' }] }, confirmeSource: true }, AUJ).ok, false);
  assert.strictEqual(C.modifierDigest(DIGEST, { ref: ref, changes: { repere: 'x' }, confirmeSource: true }, AUJ).ok, false);
  const r = C.modifierDigest(DIGEST, { ref: ref, changes: { valeur: 'environ 50 900 offres' }, confirmeSource: true }, AUJ);
  assert.ok(r.ok, r.erreur);
  assert.strictEqual(C.modifierDigest(DIGEST, { ref: 'Offres | Nulle part', changes: { valeur: '1' }, confirmeSource: true }, AUJ).ok, false);
});

test('digest : un changement de source vers une autre adresse de l\'en-tête date cette source ; une valeur de texte seule ne demande pas de confirmation', () => {
  const r = C.modifierDigest(DIGEST, { ref: REF, changes: { repere: 'Nouvelle phrase de lecture.' } }, AUJ);
  assert.ok(r.ok, r.erreur);
  assert.strictEqual(r.resume.action, 'modifié');
  assert.ok(r.texte.indexOf('2026-10-05') !== -1, 'aucune source datée sans chiffre modifié');
  const r2 = C.modifierDigest(DIGEST, { ref: REF, changes: { sourceUrl: 'https://ec.europa.eu/eurostat/x', sourceNom: 'Eurostat, chômage', valeur: '8,0 %' }, confirmeSource: true }, AUJ);
  assert.ok(r2.ok, r2.erreur);
  assert.ok(r2.texte.indexOf('"Eurostat | Chômage | https://ec.europa.eu/eurostat/x | 2026-10"') !== -1, 'date au format AAAA-MM de la source');
});
