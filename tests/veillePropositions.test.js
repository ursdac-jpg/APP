const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { creerRetours } = require('../outils/veilleRetours.js');

// Lot 4a : Claude dépose ses propositions dans outils/retours/<jour>/propositions/ ; l'onglet les lit (lecture seule) et les verse dans les sas qui existent déjà.
const NL = String.fromCharCode(10);
function essai(f) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-prop-'));
  try { f(d, creerRetours(d, { maintenant: () => new Date(2026, 10, 1, 14, 5) })); } finally { fs.rmSync(d, { recursive: true, force: true }); }
}
function deposer(d, nom, texte) {
  const dossier = path.join(d, 'outils', 'retours', '2026-11-01', 'propositions');
  fs.mkdirSync(dossier, { recursive: true }); fs.writeFileSync(path.join(dossier, nom), texte, 'utf8');
}

test('propositions : rien déposé = liste vide, sans erreur', () => {
  essai((d, r) => { const x = r.propositions(); assert.ok(x.ok); assert.deepStrictEqual(x.propositions, []); assert.strictEqual(x.dossier, 'outils/retours/2026-11-01/propositions'); });
});

test('propositions : balayage.json est lu en lignes (champs connus seulement, texte seulement), les fiches en texte', () => {
  essai((d, r) => {
    deposer(d, 'balayage.json', JSON.stringify([{ mois: '2026-10', intitule: 'Un changement', source_url: 'https://x.fr', inconnu: 'ignoré', domaine: 12 }, 'pas un objet']));
    deposer(d, 'fiches-rayon-emploi.md', '[FICHE]' + NL + 'id: a' + NL + '[/FICHE]');
    deposer(d, 'fiches-hebdo.md', '[RETRAIT]' + NL + 'fiche: b' + NL + '[/RETRAIT]');
    const x = r.propositions().propositions;
    assert.deepStrictEqual(x.map((p) => p.id), ['balayage', 'fiches-hebdo', 'fiches-rayon-emploi']);
    const b = x[0]; assert.strictEqual(b.type, 'changements'); assert.strictEqual(b.lignes.length, 1);
    assert.strictEqual(b.lignes[0].intitule, 'Un changement'); assert.strictEqual(b.lignes[0].domaine, ''); assert.strictEqual(b.lignes[0].inconnu, undefined);
    assert.strictEqual(x[2].type, 'fiches'); assert.match(x[2].texte, /^\[FICHE\]/);
  });
});

test('propositions : un nom de fichier hors liste est ignoré, un JSON abîmé donne une erreur lisible', () => {
  essai((d, r) => {
    deposer(d, 'n-importe-quoi.md', 'x'); deposer(d, 'fiches-..-evil.md', 'x'); deposer(d, 'balayage.json', '{pas du json');
    const x = r.propositions().propositions;
    assert.strictEqual(x.length, 1); assert.strictEqual(x[0].id, 'balayage'); assert.match(x[0].erreur, /illisible/);
  });
});

test('le script de contrôle sait afficher ses gabarits, et l’onglet appelle les routes et les lecteurs existants', () => {
  const r = spawnSync(process.execPath, [path.join(__dirname, '..', 'scripts', 'veilleProposer.js'), 'gabarit'], { encoding: 'utf8' });
  assert.strictEqual(r.status, 0); assert.match(r.stdout, /balayage\.json/); assert.match(r.stdout, /\[FICHE\]/);
  const html = fs.readFileSync(path.join(__dirname, '..', 'outils', 'veille.html'), 'utf8');
  ['/api/propositions/lister', 'window.fcAPI.lire(p.texte', 'window.fcAPI.importer(choisis', "type: 'changements', actions: [{ op: 'importer'", "'chgOuvrir'"].forEach((s) => assert.ok(html.includes(s), s));
  const srv = fs.readFileSync(path.join(__dirname, '..', 'outils', 'serveur_veille.js'), 'utf8');
  assert.ok(srv.includes("case '/api/propositions/lister'"));
  const cmd = fs.readFileSync(path.join(__dirname, '..', '.claude', 'commands', 'veille.md'), 'utf8');
  assert.match(cmd, /propositions\//); assert.match(cmd, /veilleProposer\.js controler/);
});

// Lot 4b : chiffres.md, reseau.md, lexique.md sont du texte pour l'écran existant (type « ecran »), lu par les lecteurs de la page.
test('propositions : chiffres.md, reseau.md et lexique.md sont rendus en texte de type ecran', () => {
  essai((d, r) => {
    deposer(d, 'chiffres.md', '[CHIFFRES periode: T1]' + NL + 'indicateur: a' + NL + '[/CHIFFRES]');
    deposer(d, 'reseau.md', '[CONFRONTER periode: T1]' + NL + 'signal: s' + NL + '[/CONFRONTER]');
    deposer(d, 'lexique.md', '[LEXIQUE-BRUT]' + NL + 'id: x' + NL + '[/LEXIQUE-BRUT]');
    deposer(d, 'profil-decoupes.md', 'hors liste');
    const x = r.propositions().propositions;
    assert.deepStrictEqual(x.map((p) => p.id), ['chiffres', 'lexique', 'reseau']);
    x.forEach((p) => { assert.strictEqual(p.type, 'ecran'); assert.ok(p.texte.length > 5); });
  });
});

test('le contrôle des écrans repère un bloc absent, un champ manquant et une preuve sans adresse', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-prop-ctl-'));
  try {
    const dos = path.join(d, 'outils', 'retours', '2026-11-01', 'propositions'); fs.mkdirSync(dos, { recursive: true });
    fs.writeFileSync(path.join(dos, 'reseau.md'), '[CONFRONTER periode: T1]' + NL + 'signal: s' + NL + 'confrontation: c' + NL + 'statut: EN PARTIE' + NL + 'preuve: aucune' + NL + '[/CONFRONTER]', 'utf8');
    fs.writeFileSync(path.join(dos, 'lexique.md'), '[LEXIQUE-BRUT]' + NL + 'id: x' + NL + 'titre: Mot', 'utf8');
    const r = spawnSync(process.execPath, [path.join(__dirname, '..', 'scripts', 'veilleProposer.js'), 'controler', '2026-11-01'], { encoding: 'utf8', env: Object.assign({}, process.env, { VEILLE_RACINE: d }) });
    assert.strictEqual(r.status, 1);
    assert.match(r.stdout, /reseau : 1 entrée/); assert.match(r.stdout, /preuve à écrire/);
    assert.match(r.stdout, /lexique : ERREUR : le bloc \[LEXIQUE-BRUT/);
    fs.writeFileSync(path.join(dos, 'reseau.md'), '[CONFRONTER periode: T1]' + NL + 'signal: s' + NL + 'confrontation: c' + NL + 'statut: EN PARTIE' + NL + 'preuve: https://x.fr/a | 02/10/2026 | délai moyen de douze jours' + NL + '[/CONFRONTER]', 'utf8');
    fs.rmSync(path.join(dos, 'lexique.md'));
    const r2 = spawnSync(process.execPath, [path.join(__dirname, '..', 'scripts', 'veilleProposer.js'), 'controler', '2026-11-01'], { encoding: 'utf8', env: Object.assign({}, process.env, { VEILLE_RACINE: d }) });
    assert.strictEqual(r2.status, 0, r2.stdout); assert.match(r2.stdout, /Rien à corriger/);
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
});

test('l’onglet prérempli les écrans existants avec leurs lecteurs, sans rien publier lui-même', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'outils', 'veille.html'), 'utf8');
  ['entrerFocusChiffres(); $(\'reponseChi\').value = e.texte; lireChiffres()', 'entrerFocusConfronter(); $(\'reponseConf\').value = e.texte; lireConfronter()', 'window.lexPrerempli(e.texte)', 'window.lexPrerempli = function (texte)', 'lxLireReponse(); return true;'].forEach((s) => assert.ok(html.includes(s), s));
});

// Lot 4c : portrait.md et ue.md (fichiers annuels complets) préremplissent les écrans existants ; le contrôle exige l'en-tête que le Dépôt exige.
test('propositions : portrait.md et ue.md sont de type ecran', () => {
  essai((d, r) => {
    deposer(d, 'portrait.md', '---' + NL + 'type: portrait' + NL + 'annee: 2027' + NL + '---' + NL + '## Une section');
    deposer(d, 'ue.md', '---' + NL + 'type: chiffres-ue' + NL + 'annee: 2027' + NL + '---' + NL + '## Une section');
    const x = r.propositions().propositions;
    assert.deepStrictEqual(x.map((p) => p.id), ['portrait', 'ue']); x.forEach((p) => assert.strictEqual(p.type, 'ecran'));
  });
});

test('le contrôle des fichiers annuels repère l’en-tête manquant ou le mauvais type, et accepte un fichier correct', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-prop-an-'));
  try {
    const dos = path.join(d, 'outils', 'retours', '2026-11-01', 'propositions'); fs.mkdirSync(dos, { recursive: true });
    const lancer = () => spawnSync(process.execPath, [path.join(__dirname, '..', 'scripts', 'veilleProposer.js'), 'controler', '2026-11-01'], { encoding: 'utf8', env: Object.assign({}, process.env, { VEILLE_RACINE: d }) });
    fs.writeFileSync(path.join(dos, 'portrait.md'), '## Une section' + NL + 'texte', 'utf8');
    fs.writeFileSync(path.join(dos, 'ue.md'), '---' + NL + 'type: portrait' + NL + 'annee: 2027' + NL + '---' + NL + '## S', 'utf8');
    const r = lancer(); assert.strictEqual(r.status, 1); assert.match(r.stdout, /en-tête manquant/); assert.match(r.stdout, /type: devrait valoir chiffres-ue/);
    fs.writeFileSync(path.join(dos, 'portrait.md'), '---' + NL + 'type: portrait' + NL + 'annee: 2027' + NL + '---' + NL + '## Une section' + NL + 'texte', 'utf8');
    fs.writeFileSync(path.join(dos, 'ue.md'), '---' + NL + 'type: chiffres-ue' + NL + 'annee: 2027' + NL + '---' + NL + '## S', 'utf8');
    const r2 = lancer(); assert.strictEqual(r2.status, 0, r2.stdout);
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
});

test('l’onglet préremplit les écrans du portrait et de l’Europe avec leurs vérifications, et propose « Relancer »', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'outils', 'veille.html'), 'utf8');
  ['entrerFocusPortrait(); $(\'reponsePor\').value = e.texte', 'analyserTexteCollePor()', 'entrerFocusChiffresUe(); $(\'reponseUe\').value = e.texte', 'analyserTexteColleUe()', 'data-tc="relancer"', "act === 'relancer'", 'id="tc_main_groupe"'].forEach((s) => assert.ok(html.includes(s), s));
});
