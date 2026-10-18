const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { analyser, lister, appliquer, usagesDesLiens, adresseValide } = require('../outils/veilleLiens.js');

const FICHIER = [
  '# Registre des adresses',
  '#  FORMAT : nom-court | adresse | date | portee',
  '',
  'legifrance | https://www.legifrance.gouv.fr/ | 2026-09-06 | national',
  'service-public | https://www.service-public.gouv.fr/ | 2026-09-06 | national',
  'asso-locale-24 | https://asso24.example.org/ |  | 24',
  'region-na | https://region.example.org/aide | 2025-01-10 | region',
  ''
].join('\n');
const AUJ = '2026-10-07';
const lignesDe = (t) => t.split('\n');

test('liens : lecture du registre (adresses, dates vides, portees), commentaires ignores', () => {
  const l = lister(FICHIER, { legifrance: ['emploi-cesu', 'emploi-csp'] });
  assert.strictEqual(l.length, 4);
  assert.deepStrictEqual(l[0], { nom: 'legifrance', adresse: 'https://www.legifrance.gouv.fr/', date: '2026-09-06', portee: 'national', nbFiches: 2, fiches: ['emploi-cesu', 'emploi-csp'] });
  assert.strictEqual(l[2].date, '');
  assert.strictEqual(l[2].portee, '24');
});

test('liens : valider met la date du jour et ne change QUE cette ligne', () => {
  const r = appliquer(FICHIER, [{ op: 'valider', nom: 'asso-locale-24' }], AUJ, {});
  assert.ok(r.ok, JSON.stringify(r));
  const a = lignesDe(FICHIER), b = lignesDe(r.texte);
  assert.strictEqual(b.length, a.length);
  const diff = a.map((x, i) => [x, b[i]]).filter(([x, y]) => x !== y);
  assert.strictEqual(diff.length, 1);
  assert.strictEqual(diff[0][1], 'asso-locale-24 | https://asso24.example.org/ | 2026-10-07 | 24');
  assert.deepStrictEqual(r.resume, { valides: 1, modifies: 0, supprimes: 0, ajoutes: 0 });
});

test('liens : modifier change l\'adresse (et date du jour par defaut), la portee reste si non precisee', () => {
  const r = appliquer(FICHIER, [{ op: 'modifier', nom: 'region-na', adresse: 'https://nouvelle-region.example.org/aides' }], AUJ, {});
  assert.ok(r.ok);
  assert.ok(lignesDe(r.texte).indexOf('region-na | https://nouvelle-region.example.org/aides | 2026-10-07 | region') !== -1);
  const r2 = appliquer(FICHIER, [{ op: 'modifier', nom: 'region-na', adresse: 'https://x.example.org/', portee: '87', dater: false }], AUJ, {});
  assert.ok(lignesDe(r2.texte).indexOf('region-na | https://x.example.org/ |  | 87') !== -1, 'dater:false laisse la date vide');
});

test('liens : supprimer retire la ligne ; refuse si une fiche utilise l\'adresse', () => {
  const r = appliquer(FICHIER, [{ op: 'supprimer', nom: 'asso-locale-24' }], AUJ, { legifrance: ['emploi-cesu'] });
  assert.ok(r.ok);
  assert.strictEqual(lignesDe(r.texte).length, lignesDe(FICHIER).length - 1);
  assert.ok(r.texte.indexOf('asso-locale-24') === -1);
  const refus = appliquer(FICHIER, [{ op: 'supprimer', nom: 'legifrance' }], AUJ, { legifrance: ['emploi-cesu', 'emploi-csp'] });
  assert.ok(!refus.ok);
  assert.match(refus.erreur, /utilisee par 2 fiches \(emploi-cesu, emploi-csp\)/);
});

test('liens : ajouter place la nouvelle adresse apres la derniere ligne d\'adresse, non datee d\'office', () => {
  const r = appliquer(FICHIER, [{ op: 'ajouter', nom: 'nouveau-site', adresse: 'https://nouveau.example.org/page', portee: '87' }], AUJ, {});
  assert.ok(r.ok);
  const l = lignesDe(r.texte);
  assert.strictEqual(l[l.indexOf('region-na | https://region.example.org/aide | 2025-01-10 | region') + 1], 'nouveau-site | https://nouveau.example.org/page |  | 87');
  assert.strictEqual(l[l.length - 1], '', 'le fichier finit toujours par un retour a la ligne');
  const r2 = appliquer(FICHIER, [{ op: 'ajouter', nom: 'nouveau-site', adresse: 'https://nouveau.example.org/', portee: 'national', dater: true }], AUJ, {});
  assert.ok(r2.texte.indexOf('nouveau-site | https://nouveau.example.org/ | 2026-10-07 | national') !== -1);
});

test('liens : plusieurs actions d\'un coup ; les commentaires et l\'ordre sont conserves', () => {
  const r = appliquer(FICHIER, [
    { op: 'valider', nom: 'legifrance' }, { op: 'modifier', nom: 'service-public', adresse: 'https://www.service-public.fr/' },
    { op: 'supprimer', nom: 'asso-locale-24' }, { op: 'ajouter', nom: 'autre', adresse: 'https://autre.example.org/', portee: 'national' }
  ], AUJ, {});
  assert.ok(r.ok, JSON.stringify(r));
  const l = lignesDe(r.texte);
  assert.strictEqual(l[0], '# Registre des adresses');
  assert.strictEqual(l[1], '#  FORMAT : nom-court | adresse | date | portee');
  assert.strictEqual(l[3], 'legifrance | https://www.legifrance.gouv.fr/ | 2026-10-07 | national');
  assert.strictEqual(l[4], 'service-public | https://www.service-public.fr/ | 2026-10-07 | national');
  assert.deepStrictEqual(r.resume, { valides: 1, modifies: 1, supprimes: 1, ajoutes: 1 });
});

test('liens : refus des actions invalides (nom, adresse, portee, doublons, inconnu, trop nombreuses)', () => {
  const mal = (ac) => appliquer(FICHIER, [].concat(ac), AUJ, {});
  assert.ok(!mal({ op: 'valider', nom: 'inconnu' }).ok);
  assert.ok(!mal({ op: 'valider', nom: 'Majuscule' }).ok);
  assert.ok(!mal({ op: 'valider', nom: '../x' }).ok);
  assert.ok(!mal({ op: 'valider', nom: 'a b' }).ok);
  assert.ok(!mal({ op: 'detruire', nom: 'legifrance' }).ok);
  assert.ok(!mal({ op: 'ajouter', nom: 'legifrance', adresse: 'https://x.example.org/', portee: 'national' }).ok, 'nom deja pris');
  for (const adresse of ['javascript:alert(1)', 'ftp://x.example.org/', 'https://x y.example.org/', 'https://x.example.org/a|b', 'x.example.org', '', 'https://' + 'a'.repeat(700) + '.org/']) {
    assert.ok(!mal({ op: 'ajouter', nom: 'nouveau', adresse, portee: 'national' }).ok, adresse.slice(0, 40));
    assert.ok(!mal({ op: 'modifier', nom: 'legifrance', adresse }).ok, adresse.slice(0, 40));
  }
  assert.ok(!mal({ op: 'ajouter', nom: 'nouveau', adresse: 'https://x.example.org/', portee: 'mars' }).ok);
  assert.ok(!mal([{ op: 'valider', nom: 'legifrance' }, { op: 'modifier', nom: 'legifrance', adresse: 'https://x.example.org/' }]).ok, 'deux actions sur la meme adresse');
  assert.ok(!appliquer(FICHIER, [], AUJ, {}).ok);
  assert.ok(!appliquer(FICHIER, new Array(201).fill({ op: 'valider', nom: 'legifrance' }), AUJ, {}).ok);
  assert.ok(!appliquer(FICHIER, [{ op: 'valider', nom: 'legifrance' }], 'hier', {}).ok);
  assert.ok(adresseValide('https://www.service-public.gouv.fr/particuliers/vosdroits/N19775'));
});

test('liens : les fins de ligne du fichier (CRLF) et un fichier sans retour final sont conserves', () => {
  const crlf = FICHIER.replace(/\n/g, '\r\n');
  const r = appliquer(crlf, [{ op: 'valider', nom: 'asso-locale-24' }], AUJ, {});
  assert.ok(r.ok && r.texte.indexOf('\r\n') !== -1 && !/[^\r]\n/.test(r.texte));
  const sansFin = FICHIER.replace(/\n$/, '');
  const r2 = appliquer(sansFin, [{ op: 'valider', nom: 'asso-locale-24' }], AUJ, {});
  assert.ok(!/\n$/.test(r2.texte));
});

test('liens : usages = adresses citees dans les listes « sources » et « structures » des fiches', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-liens-'));
  try {
    const dossier = path.join(d, 'modules', 'comprendre-le-cadre', 'contenu', 'emploi');
    fs.mkdirSync(dossier, { recursive: true });
    fs.writeFileSync(path.join(dossier, 'emploi-un.md'), '---\nid: emploi-un\nsources:\n  - legifrance\n  - service-public\nstructures:\n  - asso-locale-24\nvoir_aussi_lexique:\n  - cesu\n---\nCorps\n');
    fs.writeFileSync(path.join(dossier, 'emploi-deux.md'), '---\nid: emploi-deux\nsources:\n  - legifrance\n---\nCorps\n');
    fs.writeFileSync(path.join(dossier, 'emploi.collecte.md'), '---\nsources:\n  - ne-compte-pas\n---\n');
    fs.writeFileSync(path.join(dossier, 'README.md'), 'ne compte pas');
    const u = usagesDesLiens(d);
    assert.deepStrictEqual(u.legifrance.sort(), ['emploi-deux', 'emploi-un']);
    assert.deepStrictEqual(u['asso-locale-24'], ['emploi-un']);
    assert.ok(!u.cesu && !u['ne-compte-pas']);
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
});

test('liens : sur le VRAI registre, valider une adresse ne change que sa ligne ; tout le fichier se relit', () => {
  const reel = fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-le-cadre', 'liens-verifies.txt'), 'utf8');
  const l = lister(reel, {});
  assert.ok(l.length > 100, 'le vrai registre doit se lire (le nombre de lignes evolue : des adresses migrent vers le repertoire de Qui fait quoi)');
  const nom = l[10].nom;
  const r = appliquer(reel, [{ op: 'valider', nom }], AUJ, {});
  assert.ok(r.ok);
  const a = reel.split('\n'), b = r.texte.split('\n');
  assert.strictEqual(a.length, b.length);
  assert.ok(a.filter((x, i) => x !== b[i]).length <= 1);
  // aucune modification : le fichier se reecrit a l'identique quand on valide deja a la meme date
  assert.strictEqual(lister(r.texte, {}).length, l.length);
});
