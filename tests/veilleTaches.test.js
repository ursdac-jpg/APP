const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { creerTaches, statut, promptDe, dateReelle } = require('../outils/veilleTaches.js');

const RACINE = path.resolve(__dirname, '..');
function neuf(jour, contenu) {
  const racine = fs.mkdtempSync(path.join(os.tmpdir(), 'taches-'));
  fs.mkdirSync(path.join(racine, 'outils'));
  if (contenu !== undefined) { fs.writeFileSync(path.join(racine, 'outils', 'taches_programmees.json'), contenu, 'utf8'); }
  return { racine, t: creerTaches(racine, { maintenant: () => new Date((jour || '2026-11-10') + 'T12:00:00') }) };
}
const BASE = { id: 'essai', titre: 'Essai', date: '2026-11-20', estimee: false, pourquoi: 'Parce que.', quoi: 'Un chiffre.', fichiers: ['a.md'], sources: [{ nom: 'Insee', url: 'https://www.insee.fr/x' }], faite: null };

test('tâches : sans fichier, la liste est vide', () => {
  const { t } = neuf();
  const r = t.lire();
  assert.strictEqual(r.ok, true);
  assert.deepStrictEqual(r.taches, []);
});

test('tâches : l\'état dépend du jour (à venir, à faire, en retard, faite)', () => {
  assert.strictEqual(statut(BASE, '2026-11-10').cle, 'avenir');
  assert.strictEqual(statut(BASE, '2026-11-10').texte, 'À venir, dans 10 jours');
  assert.strictEqual(statut(BASE, '2026-11-20').texte, 'À faire aujourd’hui');
  assert.strictEqual(statut(BASE, '2026-11-21').texte, 'À faire (depuis 1 jour)');
  assert.strictEqual(statut(BASE, '2026-11-27').cle, 'afaire');
  assert.strictEqual(statut(BASE, '2026-11-28').texte, 'En retard de 8 jours');
  assert.strictEqual(statut(Object.assign({}, BASE, { faite: '2026-11-22' }), '2026-12-30').texte, 'Faite le 22/11/2026');
});

test('tâches : ajouter, confirmer, reporter, fait, remettre à faire, avec écriture dans le fichier', () => {
  const { t } = neuf('2026-11-10');
  let r = t.agir({ op: 'ajouter', titre: 'Indice de décembre', date: '2026-12-18', estimee: true, quoi: 'Inflation sur un an', source: 'https://www.insee.fr/y' });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.taches.length, 1);
  const id = r.taches[0].id;
  assert.strictEqual(r.taches[0].estimee, true);
  assert.strictEqual(r.taches[0].dateFr, '18/12/2026');
  assert.strictEqual(r.compte.avenir, 1);
  r = t.agir({ op: 'confirmer', id });
  assert.strictEqual(r.taches[0].estimee, false);
  r = t.agir({ op: 'reporter', id, date: '2026-12-20' });
  assert.strictEqual(r.taches[0].date, '2026-12-20');
  r = t.agir({ op: 'fait', id });
  assert.strictEqual(r.taches[0].etat, 'faite');
  assert.strictEqual(r.taches[0].faite, '2026-11-10');
  assert.strictEqual(r.compte.faite, 1);
  r = t.agir({ op: 'rouvrir', id });
  assert.strictEqual(r.taches[0].faite, null);
  const texte = fs.readFileSync(t.fichier, 'utf8');
  assert.strictEqual(JSON.parse(texte).taches.length, 1);
  assert.match(texte, /\n$/);
});

test('tâches : données invalides refusées, rien n\'est écrit', () => {
  const { t } = neuf();
  assert.strictEqual(t.agir({ op: 'ajouter', titre: '', date: '2026-12-18', quoi: 'x' }).ok, false);
  assert.strictEqual(t.agir({ op: 'ajouter', titre: 'T', date: '2026-13-40', quoi: 'x' }).ok, false);
  assert.strictEqual(t.agir({ op: 'ajouter', titre: 'T', date: '2026-12-18', quoi: 'x', source: 'http://insee.fr' }).ok, false, 'https seulement');
  assert.strictEqual(t.agir({ op: 'ajouter', titre: 'T', date: '2026-12-18', quoi: 'x', source: 'javascript:alert(1)' }).ok, false);
  assert.strictEqual(t.agir({ op: 'fait', id: 'inconnue' }).ok, false);
  assert.strictEqual(t.agir({ op: 'detruire', id: 'x' }).ok, false);
  assert.strictEqual(fs.existsSync(t.fichier), false, 'aucun fichier créé par des demandes refusées');
});

test('tâches : un fichier illisible n\'est jamais écrasé', () => {
  const { t } = neuf('2026-11-10', '{ pas du json');
  const r = t.agir({ op: 'ajouter', titre: 'T', date: '2026-12-18', quoi: 'x' });
  assert.strictEqual(r.ok, false);
  assert.match(r.erreur, /illisible/);
  assert.strictEqual(fs.readFileSync(t.fichier, 'utf8'), '{ pas du json');
  assert.strictEqual(t.lire().ok, false);
});

test('tâches : le prompt du cloud donne les règles, les sources et la section « À OUVRIR PAR MOI » ; la reprise donne la phrase', () => {
  const p = promptDe(BASE, '2026-11-20');
  assert.match(p, /Nous sommes le 20\/11\/2026/);
  assert.match(p, /https:\/\/www\.insee\.fr\/x/);
  assert.match(p, /jamais de mémoire/);
  assert.match(p, /À OUVRIR PAR MOI/);
  assert.match(p, /Ne modifie aucun fichier/);
  const r = promptDe(Object.assign({}, BASE, { reprise: { phrase: 'Reprendre à la deuxième étape', contexte: 'Point de reprise : ...' } }), '2026-11-20');
  assert.ok(r.startsWith('Reprendre à la deuxième étape\n\n'));
  assert.ok(!/À OUVRIR PAR MOI/.test(r));
});

test('tâches : les plus urgentes passent d\'abord et le compte « à faire » inclut les retards', () => {
  const liste = [
    Object.assign({}, BASE, { id: 'b', date: '2026-12-15' }),
    Object.assign({}, BASE, { id: 'a', date: '2026-11-13' }),
    Object.assign({}, BASE, { id: 'c', date: '2027-01-28' }),
    Object.assign({}, BASE, { id: 'd', date: '2026-12-01', faite: '2026-12-02' })
  ];
  const { t } = neuf('2026-12-16', JSON.stringify({ taches: liste }));
  const r = t.lire();
  assert.deepStrictEqual(r.taches.map((x) => x.id), ['a', 'd', 'b', 'c']);
  assert.deepStrictEqual(r.compte, { afaire: 2, avenir: 1, faite: 1 });
});

test('tâches : le fichier livré est valide, ses dates sont réelles, ses sources en https, et la reprise de l\'étape 2 y figure', () => {
  const texte = fs.readFileSync(path.join(RACINE, 'outils', 'taches_programmees.json'), 'utf8');
  const brut = JSON.parse(texte);
  assert.ok(brut.taches.length >= 8);
  const ids = {};
  brut.taches.forEach((x) => {
    assert.ok(!ids[x.id], 'identifiant en double : ' + x.id);
    ids[x.id] = 1;
    assert.ok(dateReelle(x.date), x.id + ' : date');
    x.sources.forEach((s) => assert.match(s.url, /^https:\/\//, x.id + ' : source en https'));
    assert.ok(x.titre && x.pourquoi && x.quoi, x.id + ' : titre, pourquoi et quoi');
  });
  const e2 = brut.taches.filter((x) => x.id === 'ecarts-etape2')[0];
  assert.ok(e2 && e2.reprise && e2.reprise.phrase === 'Reprendre à la deuxième étape');
  const { t } = neuf('2026-11-10', texte);
  assert.strictEqual(t.lire().taches.length, brut.taches.length, 'aucune tâche écartée à la lecture');
  assert.ok(!/[–—]/.test(texte), 'aucun tiret long dans le fichier');
  assert.ok(!/[–—]/.test(fs.readFileSync(path.join(RACINE, 'outils', 'veilleTaches.js'), 'utf8')), 'aucun tiret long dans le module');
});

test('tâches : l\'écran a son bouton en bas à gauche, ses actions câblées, et la réponse du cloud passe par les retards existants', () => {
  const html = fs.readFileSync(path.join(RACINE, 'outils', 'veille.html'), 'utf8');
  assert.ok(/id="tpBouton"/.test(html) && /#tpBouton \{ position:fixed; left:14px; bottom:14px/.test(html), 'bouton fixé en bas à gauche');
  ['ouvrir', 'prompt', 'coller', 'confirmer', 'reporter', 'reporter-ok', 'fait', 'rouvrir', 'copier', 'enregistrer', 'replier'].forEach((a) => assert.ok(html.includes("a === '" + a + "'"), 'action câblée : ' + a));
  assert.ok(/\/api\/taches\/lire/.test(html) && /\/api\/taches\/agir/.test(html));
  assert.ok(/id: 'tache-' \+ id/.test(html), 'la réponse du cloud passe par le module des retours');
  const serveur = fs.readFileSync(path.join(RACINE, 'outils', 'serveur_veille.js'), 'utf8');
  assert.ok(/case '\/api\/taches\/lire'/.test(serveur) && /case '\/api\/taches\/agir'/.test(serveur));
});

test('tâches : /app les lit au démarrage, /veille traite les réponses « tache-* » à part et marque la tâche faite', () => {
  const app = fs.readFileSync(path.join(RACINE, '.claude', 'commands', 'app.md'), 'utf8');
  const veille = fs.readFileSync(path.join(RACINE, '.claude', 'commands', 'veille.md'), 'utf8');
  assert.ok(/outils\/taches_programmees\.json/.test(app), '/app lit la liste des tâches');
  assert.ok(/tache-<identifiant>\.md/.test(veille) && /ne sont PAS de la veille/.test(veille), '/veille ne mélange pas les réponses de tâches avec la veille');
  assert.ok(/Marquer faite/.test(veille) && /`faite`/.test(veille), '/veille dit de marquer la tâche faite');
  assert.ok(/Tâche à rythme/.test(veille), 'les tâches à rythme (inflation) ont leur suite');
  const doc = fs.readFileSync(path.join(RACINE, 'docs', 'VERIFICATIONS_A_DATE_FIXE.md'), 'utf8');
  assert.ok(/taches_programmees\.json/.test(doc), 'le document des échéances renvoie à l\'outil (une seule liste de dates)');
  [app, veille, doc].forEach((t) => assert.ok(!/[\u2013\u2014]/.test(t), 'aucun tiret long'));
});

test('tâches : chaque tâche livrée dit quel module et quelles rubriques son résultat doit nourrir, et la consigne pour Claude réclame la mise à jour puis les Nouveautés', () => {
  const { consigneClaude } = require('../outils/veilleTaches.js');
  const brut = JSON.parse(fs.readFileSync(path.join(RACINE, 'outils', 'taches_programmees.json'), 'utf8'));
  brut.taches.forEach((x) => {
    assert.ok(x.miseAJour && x.miseAJour.module, x.id + ' : module à nourrir');
    assert.ok(Array.isArray(x.miseAJour.rubriques) && x.miseAJour.rubriques.length >= 1, x.id + ' : rubriques à mettre à jour ou à créer');
    assert.ok(x.miseAJour.nouveaute, x.id + ' : consigne sur les Nouveautés');
    assert.ok(!/[–—]/.test(JSON.stringify(x.miseAJour)), x.id + ' : aucun tiret long');
  });
  const t = brut.taches.filter((x) => x.id === 'smic-annonce')[0];
  const c = consigneClaude(t);
  assert.match(c, /Module à nourrir : Comprendre les chiffres/);
  assert.match(c, /mettre à jour ou à créer/);
  assert.match(c, /data\/nouveautes\.js/);
  assert.match(c, /docs\/JOURNAL_DES_CHANGEMENTS\.md/);
  assert.match(c, /taches_programmees\.json/);
  assert.ok(!/[–—]/.test(c));
  const { t: outil } = neuf('2026-12-02', JSON.stringify({ taches: brut.taches }));
  const vue = outil.lire().taches;
  assert.ok(vue.filter((x) => x.genre === 'releve').every((x) => x.consigneClaude.includes(x.titre)), 'consigne présente pour chaque relevé');
  const reprise = vue.filter((x) => x.id === 'ecarts-etape2')[0];
  assert.ok(reprise.texteACopier.startsWith('Reprendre à la deuxième étape') && reprise.texteACopier.includes('MISE À JOUR DE L’APPLICATION'), 'la phrase de reprise embarque la consigne de mise à jour');
  const manuelle = outil.agir({ op: 'ajouter', titre: 'Essai', date: '2027-03-01', quoi: 'Un chiffre' }).taches.filter((x) => x.id.startsWith('perso-'))[0];
  assert.match(manuelle.consigneClaude, /à préciser avec Denis/, 'une tâche ajoutée à la main demande de préciser le module');
  const html = fs.readFileSync(path.join(RACINE, 'outils', 'veille.html'), 'utf8');
  ['consigne', 'copier-consigne'].forEach((a) => assert.ok(html.includes("a === '" + a + "'"), 'action câblée : ' + a));
  const veille = fs.readFileSync(path.join(RACINE, '.claude', 'commands', 'veille.md'), 'utf8');
  assert.ok(/miseAJour/.test(veille) && /data\/nouveautes\.js/.test(veille), '/veille applique la mise à jour du module et les Nouveautés');
});
