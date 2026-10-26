'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const P = require('../outils/veillePont.js');
const { creerDepot } = require('../outils/veilleDepot.js');
const { creerServeur } = require('../outils/serveur_veille.js');
const http = require('node:http');

// Le pont depuis l'outil de prospection : lecture SEULE, chemin fixe, noms fixes, 1 Mo au plus ; les lignes deja connues ne sont pas rechargees.
const RACINE = path.resolve(__dirname, '..');
function dossierPont(contenus) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'pontveille-'));
  Object.keys(contenus).forEach(function (n) { fs.writeFileSync(path.join(d, n), typeof contenus[n] === 'string' ? contenus[n] : JSON.stringify(contenus[n])); });
  return d;
}
const LIGNE = 'essai-pont-bergerac-24 | local | Essai du pont | btp | Bergerac:1 rue de l\'Essai | | https://essai-pont.example.org/ | | non-indique | Via prospection ; essai |';

test('Pont : le dossier est le voisin PROSPECTION/donnees/pont du dépôt, à chemin fixe', () => {
  assert.strictEqual(P.dossierDuPont(path.join('C:', 'x', 'Site_V2')), path.join('C:', 'x', 'PROSPECTION', 'donnees', 'pont'));
  assert.deepStrictEqual(Object.keys(P.FICHIERS).sort(), ['employeurs', 'lieux', 'offres']);
});

test('Pont : lecture normale, fichier absent, abîmé, trop gros, mauvais format, destination refusée', () => {
  const ok = P.creerPont(RACINE, { dossier: dossierPont({ 'employeurs.json': { version: 1, fichier: 'employeurs', deposeLe: '2026-10-20T10:00:00.000Z', lignes: [LIGNE, 12, 'a\nb', ''] } }) });
  const r = ok.lire('employeurs');
  assert.ok(r.ok); assert.deepStrictEqual(r.lignes, [LIGNE]); assert.strictEqual(r.deposeLe, '2026-10-20T10:00:00.000Z');
  assert.strictEqual(ok.lire('offres').absent, true);
  assert.strictEqual(ok.lire('../carnet').ok, false);
  assert.strictEqual(ok.lire('constructor').ok, false);
  assert.strictEqual(ok.lire('__proto__').ok, false);
  const mauvais = P.creerPont(RACINE, { dossier: dossierPont({ 'employeurs.json': '{pas du json', 'offres.json': { fichier: 'employeurs', lignes: [LIGNE] }, 'lieux.json': 'x'.repeat(P.TAILLE_MAX + 1) }) });
  assert.match(mauvais.lire('employeurs').erreur, /abîmé/);
  assert.match(mauvais.lire('offres').erreur, /bon format/);
  assert.match(mauvais.lire('lieux').erreur, /trop gros/);
});

test('Pont : un dossier nommé comme un fichier n\'est pas lu', () => {
  const d = dossierPont({}); fs.mkdirSync(path.join(d, 'employeurs.json'));
  assert.strictEqual(P.creerPont(RACINE, { dossier: d }).lire('employeurs').absent, true);
});

test('Pont : lirePont rend les lignes nouvelles et compte celles que la veille connaît déjà (vrai dépôt, lecture seule)', () => {
  const premiere = fs.readFileSync(path.join(RACINE, 'modules', 'mon-territoire', 'contenu', 'employeurs.txt'), 'utf8').split(/\r?\n/).filter((l) => l.trim() && l.charAt(0) !== '#')[0];
  const connue = premiere.split('|').slice(0, 10).join('|') + '|'; // même identifiant : connue
  const pont = P.creerPont(RACINE, { dossier: dossierPont({ 'employeurs.json': { version: 1, fichier: 'employeurs', lignes: [LIGNE, connue] } }) });
  const depot = creerDepot(RACINE, { pont: pont });
  const r = depot.lirePont('employeurs');
  assert.ok(r.ok);
  assert.strictEqual(r.total, 2); assert.strictEqual(r.connues, 1); assert.deepStrictEqual(r.lignes, [LIGNE]); assert.strictEqual(r.restantes, 0);
  assert.strictEqual(depot.etatPont().nouvelles.employeurs, 1);
  assert.strictEqual(depot.etatPont().nouvelles.offres, 0);
  assert.strictEqual(depot.lirePont('complements').ok, false);
  assert.strictEqual(depot.lirePont('offres').absent, true);
});

test('Pont : plafond de 100 lignes par import, le reste est annoncé', () => {
  const lignes = []; for (let i = 0; i < 130; i++) { lignes.push('essai-pont-' + i + ' | local | Essai ' + i + ' | btp | Bergerac:1 rue ' + i + ' | | | | non-indique | Via prospection ; essai |'); }
  const depot = creerDepot(RACINE, { pont: P.creerPont(RACINE, { dossier: dossierPont({ 'employeurs.json': { fichier: 'employeurs', lignes: lignes } }) }) });
  const r = depot.lirePont('employeurs');
  assert.strictEqual(r.lignes.length, 100); assert.strictEqual(r.restantes, 30);
});

function appel(port, chemin, jeton, corps) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port: port, path: chemin, method: 'POST', headers: { 'Content-Type': 'application/json', 'x-veille-jeton': jeton } }, (res) => {
      let d = ''; res.on('data', (c) => { d += c; }); res.on('end', () => { let j = null; try { j = JSON.parse(d); } catch (e) { /* pas du json */ } resolve({ code: res.statusCode, json: j }); });
    });
    req.on('error', reject); req.write(corps || '{}'); req.end();
  });
}

test('Pont : points d\'entrée du serveur de la veille (jeton exigé, lecture seule)', async () => {
  const pont = P.creerPont(RACINE, { dossier: dossierPont({ 'employeurs.json': { fichier: 'employeurs', lignes: [LIGNE] } }) });
  const serveur = creerServeur({ depot: creerDepot(RACINE, { pont: pont }), jeton: 'v'.repeat(48) });
  await new Promise((r) => serveur.listen(0, '127.0.0.1', r));
  try {
    const port = serveur.address().port;
    assert.strictEqual((await appel(port, '/api/pont/etat', 'mauvais')).code, 403);
    const e = await appel(port, '/api/pont/etat', 'v'.repeat(48));
    assert.strictEqual(e.json.nouvelles.employeurs, 1);
    const l = await appel(port, '/api/pont/lire', 'v'.repeat(48), JSON.stringify({ fichier: 'employeurs' }));
    assert.deepStrictEqual(l.json.lignes, [LIGNE]);
    assert.strictEqual((await appel(port, '/api/pont/lire', 'v'.repeat(48), JSON.stringify({ fichier: '../../x' }))).json.ok, false);
  } finally { serveur.close(); }
});
