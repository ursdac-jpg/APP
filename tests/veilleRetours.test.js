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

// Les réponses ne se perdent pas d'un jour à l'autre (demande de Denis, 09/11/2026 : ramasser pendant plusieurs jours, puis tout donner à Claude).
function essaiJours(fn) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-retours-jours-'));
  let maintenant = new Date(2026, 10, 1, 14, 5);
  try { fn(d, creerRetours(d, { maintenant: () => maintenant }), (x) => { maintenant = x; }); } finally { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) { /* tant pis */ } }
}
const ENTETE = { titre: 'T', categorie: 'Chaque mois', rubrique: 'R' };

test('retours : une réponse du 1er novembre est encore là le 4, déplacée (une seule copie) avec sa date d\'origine', () => {
  essaiJours((d, r, hor) => {
    r.enregistrer(Object.assign({ id: 'balayage-1', reponse: 'réponse du lundi' }, ENTETE));
    hor(new Date(2026, 10, 4, 9, 30));
    const l = r.lister();
    assert.equal(l.reportees, 1);
    assert.equal(l.retours.length, 1);
    assert.equal(l.retours[0].reponse, 'réponse du lundi');
    assert.match(l.retours[0].le, /^2026-11-01 à 14:05$/, 'la date d\'enregistrement d\'origine est gardée');
    assert.ok(fs.existsSync(path.join(d, 'outils', 'retours', '2026-11-04', 'balayage-1.md')));
    assert.ok(!fs.existsSync(path.join(d, 'outils', 'retours', '2026-11-01', 'balayage-1.md')), 'pas de doublon dans l\'ancien dossier');
    assert.match(fs.readFileSync(path.join(d, 'outils', 'retours', '2026-11-04', '_index.md'), 'utf8'), /balayage-1/, 'Claude la voit dans le sommaire du jour');
    assert.equal(r.lister().reportees, 0, 'rien à reprendre la deuxième fois');
  });
});

test('retours : la réponse la plus récente gagne, l\'ancienne copie périmée ne revient pas ; effacer une réponse la supprime pour de bon', () => {
  essaiJours((d, r, hor) => {
    r.enregistrer(Object.assign({ id: 'hebdo', reponse: 'ancienne' }, ENTETE));
    hor(new Date(2026, 10, 2, 10, 0));
    r.enregistrer(Object.assign({ id: 'hebdo', reponse: 'nouvelle' }, ENTETE));
    hor(new Date(2026, 10, 3, 10, 0));
    assert.equal(r.lister().retours[0].reponse, 'nouvelle');
    r.enregistrer({ id: 'hebdo', reponse: '' });
    hor(new Date(2026, 10, 4, 10, 0));
    assert.equal(r.lister().retours.length, 0, 'effacée : elle ne revient pas le lendemain');
  });
});

test('retours : une fois traitées, les réponses sont mises de côté (jamais supprimées) et ne reviennent plus', () => {
  essaiJours((d, r, hor) => {
    r.enregistrer(Object.assign({ id: 'balayage-1', reponse: 'a' }, ENTETE));
    r.enregistrer(Object.assign({ id: 'balayage-2', reponse: 'b' }, ENTETE));
    hor(new Date(2026, 10, 3, 8, 0));
    const a = r.archiver();
    assert.ok(a.ok && a.archivees === 2, a.erreur);
    assert.equal(r.lister().retours.length, 0);
    const dest = path.join(d, 'outils', 'retours', '_traitees');
    const sous = fs.readdirSync(dest);
    assert.equal(sous.length, 1);
    assert.equal(fs.readFileSync(path.join(dest, sous[0], 'balayage-2.md'), 'utf8').split('\n---\n')[1], 'b', 'le contenu est gardé');
    hor(new Date(2026, 10, 9, 8, 0));
    assert.equal(r.lister().retours.length, 0, 'et rien ne revient plus tard');
  });
});

test('retours : une réponse de plus de 90 jours n\'est pas reprise, mais n\'est pas supprimée', () => {
  essaiJours((d, r, hor) => {
    r.enregistrer(Object.assign({ id: 'reseau', reponse: 'très ancienne' }, ENTETE));
    hor(new Date(2027, 2, 1, 8, 0));
    assert.equal(r.lister().retours.length, 0);
    assert.ok(fs.existsSync(path.join(d, 'outils', 'retours', '2026-11-01', 'reseau.md')));
  });
});

test('retours : les réponses des jours d\'avant la mise en service du report (déjà traitées) ne reviennent pas', () => {
  essaiJours((d, r, hor) => {
    const dossier = path.join(d, 'outils', 'retours', '2026-10-28');
    fs.mkdirSync(dossier, { recursive: true });
    fs.writeFileSync(path.join(dossier, 'hebdo.md'), 'titre : T\ncategorie : C\nrubrique : R\nenregistre : 2026-10-28 à 10:00\nqualite : ok\nmotif : \n---\nancienne réponse déjà traitée', 'utf8');
    fs.writeFileSync(path.join(d, 'outils', 'retours', '_report_depuis.txt'), '2026-11-01\n', 'utf8');
    hor(new Date(2026, 10, 3, 10, 0));
    assert.equal(r.lister().retours.length, 0);
    assert.ok(fs.existsSync(path.join(dossier, 'hebdo.md')), 'et elle n\'est pas touchée');
  });
});
