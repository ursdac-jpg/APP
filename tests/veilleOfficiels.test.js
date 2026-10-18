'use strict';
// Magasins officiels d'une enseigne (fichier local écrit par Claude) : lecture, validation, rapprochement des communes. Aucun accès à Internet.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const O = require('../outils/veilleOfficiels.js');

const COMMUNES = [{ nom: 'Saint-Médard-de-Mussidan', cps: ['24400'] }, { nom: 'Aixe-sur-Vienne', cps: ['87700'] }, { nom: 'Sanilhac', cps: ['24380', '24660', '24750'] }, { nom: 'Limoges', cps: ['87000', '87100'] }, { nom: 'Le Palais-sur-Vienne', cps: ['87410'] }];

function dossierAvec(contenu) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'off-'));
  if (contenu !== undefined) { fs.mkdirSync(path.join(d, 'outils', 'controles'), { recursive: true }); fs.writeFileSync(path.join(d, ...O.CHEMIN), typeof contenu === 'string' ? contenu : JSON.stringify(contenu), 'utf8'); }
  return d;
}

test('cleCommune : les écritures officielles (majuscules, ST, /, « D ») et celles de l\'application donnent la même clé', () => {
  [['ST MEDARD DE MUSSIDAN', 'Saint-Médard-de-Mussidan'], ['AIXE/VIENNE', 'Aixe-sur-Vienne'], ['LE PALAIS SUR VIENNE', 'Le Palais-sur-Vienne'], ['ST MARTIAL D ALBAREDE', 'Saint-Martial-d\'Albarède'], ['CHATEAUNEUF LA FORET', 'Châteauneuf-la-Forêt'], ['SAINTE-FEREOLE', 'Ste Féréole']]
    .forEach(([a, b]) => assert.strictEqual(O.cleCommune(a), O.cleCommune(b), a + ' / ' + b));
  assert.notStrictEqual(O.cleCommune('Saint-Pardoux'), O.cleCommune('Saint-Pardoux-la-Rivière'));
});

test('numero : 10 chiffres bien formés en 05 53 00 00 00, sinon vide (jamais un numéro inventé ou rafistolé)', () => {
  assert.strictEqual(O.numero('05.53.60.93.00'), '05 53 60 93 00');
  assert.strictEqual(O.numero('0555003797'), '05 55 00 37 97');
  assert.strictEqual(O.numero('05 5 5 00 3 7 97'), '05 55 00 37 97', 'espaces mal placés : les 10 chiffres sont gardés');
  assert.strictEqual(O.numero('05 53 60'), '');
  assert.strictEqual(O.numero(''), '');
  assert.strictEqual(O.numero('+33 5 53 60 93 00'), '', 'une forme internationale n\'est pas reprise telle quelle');
});

test('rapprocher : même clé, sinon commune contenue dans le nom officiel ET code postal correspondant, jamais autrement', () => {
  const parCle = {}; COMMUNES.forEach((c) => { parCle[O.cleCommune(c.nom)] = c.nom; });
  assert.strictEqual(O.rapprocher('ST MEDARD DE MUSSIDAN', '24400', COMMUNES, parCle), 'Saint-Médard-de-Mussidan');
  assert.strictEqual(O.rapprocher('NOTRE DAME DE SANILHAC', '24660', COMMUNES, parCle), 'Sanilhac', 'hameau : même code postal');
  assert.strictEqual(O.rapprocher('NOTRE DAME DE SANILHAC', '87000', COMMUNES, parCle), '', 'code postal différent : pas de rapprochement');
  assert.strictEqual(O.rapprocher('NOTRE DAME DE SANILHAC', '', COMMUNES, parCle), '', 'sans code postal : pas de rapprochement');
  assert.strictEqual(O.rapprocher('COMMUNE INCONNUE', '24000', COMMUNES, parCle), '');
});

test('lire : fichier absent = liste vide ; fichier illisible refusé ; entrées invalides ignorées ; séparateurs du registre retirés des adresses ; adresses non https retirées', () => {
  const vide = dossierAvec();
  assert.deepStrictEqual(O.lire(vide, COMMUNES).enseignes, []);
  assert.strictEqual(O.lire(dossierAvec('pas du json'), COMMUNES).enseignes.length, 0, 'illisible : liste vide, jamais une exception');
  assert.strictEqual(O.lire(dossierAvec({ enseignes: 'non' }), COMMUNES).ok, false);
  const d = dossierAvec({
    enseignes: [
      { famille: 'U', marques: ['Super U'], departement: '87', lu_le: '2026-10-18', liste_complete: true, source_annuaire: 'http://pas-https.fr/', magasins: [
        { nom: 'Super U AIXE/VIENNE', adresse: '7 Rue; René:Dumont|X', cp: '87700', commune: 'AIXE/VIENNE', tel: '05.55.06.51.91', url: 'https://www.magasins-u.com/magasin/superu-aixesurvienne' },
        { nom: 'Sans commune', commune: '' }, null,
        { nom: 'Super U SANS NUMERO', adresse: 'Rue A', cp: 'abc', commune: 'LIMOGES', tel: '12', url: 'javascript:alert(1)', a_verifier: 'à ouvrir à la main' }
      ] },
      { famille: 'X', marques: ['X'], departement: 'zz', magasins: [] },
      { famille: 'Y', marques: 'pas une liste', departement: '24', magasins: [] }
    ]
  });
  const r = O.lire(d, COMMUNES);
  assert.strictEqual(r.ok, true); assert.strictEqual(r.enseignes.length, 1, 'département invalide et marques invalides ignorés');
  const e = r.enseignes[0];
  assert.strictEqual(e.sourceAnnuaire, '', 'adresse non https retirée'); assert.strictEqual(e.listeComplete, true); assert.strictEqual(e.luLe, '2026-10-18');
  assert.strictEqual(e.magasins.length, 2, 'magasin sans commune et valeur nulle ignorés');
  const a = e.magasins[0];
  assert.strictEqual(a.adresse, '7 Rue René Dumont X', 'aucun « : », « ; » ni « | » dans une adresse');
  assert.deepStrictEqual({ tel: a.tel, communeApp: a.communeApp, cp: a.cp }, { tel: '05 55 06 51 91', communeApp: 'Aixe-sur-Vienne', cp: '87700' });
  assert.strictEqual(a.marque, '', 'sans champ marque : vide');
  const avecMarque = O.lire(dossierAvec({ enseignes: [{ famille: 'C', marques: ['Carrefour', 'Carrefour Market'], departement: '24', magasins: [{ marque: 'Carrefour Market', nom: 'Carrefour Market Bergerac', commune: 'Limoges', cp: '87000' }] }] }), COMMUNES).enseignes[0].magasins[0];
  assert.strictEqual(avecMarque.marque, 'Carrefour Market', 'la marque exacte est gardée');
  const s = e.magasins[1];
  assert.deepStrictEqual({ tel: s.tel, url: s.url, cp: s.cp, aVerifier: s.aVerifier }, { tel: '', url: '', cp: '', aVerifier: 'à ouvrir à la main' }, 'numéro mal formé, adresse javascript: et code postal invalide retirés');
});

test('le fichier local des magasins officiels est dans un dossier ignoré par Git et la route est en lecture seule', () => {
  const gi = fs.readFileSync(path.resolve(__dirname, '..', '.gitignore'), 'utf8');
  assert.ok(/^outils\/controles\/$/m.test(gi));
  const src = fs.readFileSync(path.resolve(__dirname, '..', 'outils', 'veilleOfficiels.js'), 'utf8');
  assert.ok(!/writeFile|appendFile|mkdirSync|renameSync|unlink/.test(src), 'le module n\'écrit jamais');
});
