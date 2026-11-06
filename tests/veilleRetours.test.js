const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { creerRetours } = require('../outils/veilleRetours.js');

// Les réponses collées dans l'onglet « Travailler avec Claude » : un fichier par réponse, dans un dossier privé du jour.
const JOUR = new Date(2026, 10, 1, 14, 5);   // 01/11/2026 à 14 h 05 (heure de l'ordinateur)
function essai(fn) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-retours-'));
  try { fn(d, creerRetours(d, { maintenant: () => JOUR })); } finally { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) { /* tant pis */ } }
}

test('retours : une réponse s\'écrit dans le dossier du jour, avec son en-tête et un sommaire', () => {
  essai((d, r) => {
    const x = r.enregistrer({ id: 'balayage-1', titre: 'Message 1 | emploi', categorie: 'Chaque mois', rubrique: 'Comprendre le cadre', reponse: '[BALAYAGE]\r\ndomaine: Emploi\r\n[/BALAYAGE]' });
    assert.ok(x.ok, x.erreur);
    const f = path.join(d, 'outils', 'retours', '2026-11-01', 'balayage-1.md');
    const t = fs.readFileSync(f, 'utf8');
    assert.match(t, /^titre : Message 1 \/ emploi\ncategorie : Chaque mois\nrubrique : Comprendre le cadre\nenregistre : 2026-11-01 à 14:05\nqualite : ok\nmotif : \n---\n\[BALAYAGE\]\ndomaine: Emploi/);
    assert.ok(!/\r/.test(t), 'fins de ligne normalisées');
    const idx = fs.readFileSync(path.join(d, 'outils', 'retours', '2026-11-01', '_index.md'), 'utf8');
    assert.match(idx, /- balayage-1 \| Chaque mois \| Comprendre le cadre \| Message 1 \/ emploi \| 2026-11-01 à 14:05/);
    const l = r.lister();
    assert.equal(l.dossier, 'outils/retours/2026-11-01');
    assert.equal(l.retours.length, 1);
    assert.match(l.retours[0].reponse, /^\[BALAYAGE\]/);
  });
});

test('retours : une nouvelle réponse remplace l\'ancienne ; une réponse vide efface le fichier et la ligne du sommaire', () => {
  essai((d, r) => {
    r.enregistrer({ id: 'hebdo', titre: 'Veille', categorie: 'Chaque semaine', rubrique: 'Fiches', reponse: 'première' });
    r.enregistrer({ id: 'hebdo', titre: 'Veille', categorie: 'Chaque semaine', rubrique: 'Fiches', reponse: 'seconde' });
    assert.equal(r.lister().retours.length, 1);
    assert.match(r.lister().retours[0].reponse, /^seconde$/);
    const e = r.enregistrer({ id: 'hebdo', reponse: '   ' });
    assert.ok(e.ok && e.effacee);
    assert.equal(r.lister().retours.length, 0);
    assert.ok(!/hebdo/.test(fs.readFileSync(path.join(d, 'outils', 'retours', '2026-11-01', '_index.md'), 'utf8')));
  });
});

test('retours : un identifiant invalide (chemin, majuscules, vide) est refusé et rien n\'est écrit', () => {
  essai((d, r) => {
    ['../fuite', 'a/b', 'A', '', '.md', '_index', 'x'.repeat(61)].forEach((id) => assert.equal(r.enregistrer({ id: id, reponse: 'texte' }).ok, false, id));
    assert.ok(!fs.existsSync(path.join(d, 'outils', 'retours')));
  });
});

test('retours : une réponse trop longue est refusée ; le nombre de fichiers par jour est borné', () => {
  essai((d, r) => {
    assert.equal(r.enregistrer({ id: 'long', reponse: 'a'.repeat(400 * 1024 + 1) }).ok, false);
    for (let i = 0; i < 80; i++) { assert.ok(r.enregistrer({ id: 'r-' + i, reponse: 'x' }).ok); }
    assert.equal(r.enregistrer({ id: 'de-trop', reponse: 'x' }).ok, false);
    assert.ok(r.enregistrer({ id: 'r-3', reponse: 'remplacée' }).ok, 'une réponse existante peut toujours être remplacée');
  });
});

test('retours : le serveur expose les deux routes et ne sert aucun fichier du dossier des retours', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'outils', 'serveur_veille.js'), 'utf8');
  assert.match(src, /case '\/api\/retours\/lister'/);
  assert.match(src, /case '\/api\/retours\/enregistrer'/);
  assert.match(fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8'), /^outils\/retours\/$/m);
});
