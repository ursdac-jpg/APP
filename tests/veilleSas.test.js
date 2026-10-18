const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const S = require('../outils/veilleSas.js');
const { creerDepot } = require('../outils/veilleDepot.js');

// Le sas du module « Qui fait quoi » : fiches PROPOSEES (par un assistant), jamais lues par l'application, publiees une a une apres verification.
// Les essais travaillent sur des registres FIGES (jamais sur les vrais fichiers, qui evoluent).

const AUJ = '2026-10-12';
const ENTETE_LIEUX = '# Registre des structures\n# FORMAT : id | type | nom | description | commune | zone | telephone | site | portee | rayons | source | date\n#\n';
const LIEUX = ENTETE_LIEUX +
  'ccas-demo-24 | ccas | CCAS de Demo | aide sociale, domiciliation | Perigueux | | | https://ccas-demo.example.org/ | 24 | logement | Source de depart | 2026-10-01\n' +
  'asso-udaf-87 | budget-endettement | UDAF de la Haute-Vienne | point conseil budget | Limoges | | | https://udaf87.example.org/ | 87 | budget | Source de depart | 2026-10-01\n';
const EMPLOYEURS = '# Registre des employeurs\n#\naldi | enseigne | Aldi | commerce-vente | Bergerac:124 avenue de Gaulle | | https://www.aldi.example.fr/ | | non-indique | Source | 2026-10-01\n';
const REG = { lieux: LIEUX, employeurs: EMPLOYEURS };
const CTX = {
  aujourdhui: AUJ, secteurs: ['commerce-vente', 'btp'], secteursLibelles: [{ cle: 'commerce-vente', libelle: 'Commerce et vente' }, { cle: 'btp', libelle: 'Bâtiment et travaux publics' }],
  communes: ['perigueux', 'bergerac', 'limoges', 'saint junien'], communesNoms: ['Périgueux', 'Bergerac', 'Limoges', 'Saint-Junien']
};
const L12 = (id, extra) => Object.assign({ id: id, type: 'ccas', nom: 'Nom ' + id, desc: 'une phrase', commune: 'Limoges', zone: '', tel: '', site: 'https://' + id + '.example.org/', portee: '87', rayons: 'logement', source: 'https://src.example.org/page', date: '' }, extra || {});
const ligne = (o) => [o.id, o.type, o.nom, o.desc, o.commune, o.zone, o.tel, o.site, o.portee, o.rayons, o.source, o.date].join(' | ');

// ---------- nettoyage du texte colle ----------
test('nettoyer : retire blocs de code, numeros, puces, barres de tableau, titres et phrases ; compte et montre ce qui est ignore', () => {
  const colle = [
    'Voici votre tableau :', '```', 'id | type | nom | description | commune | zone | telephone | site | portee | rayons | source | date',
    '1. ' + ligne(L12('a-87')), '- ' + ligne(L12('b-87')), '| ' + ligne(L12('c-87')) + ' |', '|---|---|---|', '', '```', 'Sources consultées :', '- https://exemple.org'
  ].join('\n');
  const r = S.nettoyer(colle, 12);
  assert.deepStrictEqual(r.lignes.map((l) => l.brut.split(' | ')[0]), ['a-87', 'b-87', 'c-87']);
  assert.ok(r.ignorees >= 3 && r.ignoreesListe.indexOf('Voici votre tableau :') !== -1);
});

test('nettoyer : une ligne de donnees abimee (peu de colonnes) est comptee comme ignoree, jamais perdue en silence', () => {
  const r = S.nettoyer('x | y\n' + ligne(L12('ok-87')), 12);
  assert.strictEqual(r.lignes.length, 1);
  assert.deepStrictEqual(r.ignoreesListe, ['x | y']);
});

// ---------- corrections de forme ----------
test('corrigerForme : http, tiret long, numero, listes fermees, date ; jamais le sens', () => {
  const cols = S.COLONNES.lieux;
  const v = { id: 'Mission Locale 87', type: 'Mission_Locale', nom: 'Mission locale ' + String.fromCharCode(0x2014) + ' Limoges', description: 'x', commune: 'Limoges', zone: '', telephone: '05.55.00.00.00', site: 'http://exemple.org', portee: '87', rayons: 'Jeunes, accompagnement', source: 's', date: '2026-01-01' };
  const r = S.corrigerForme(v, cols, CTX);
  assert.strictEqual(r.valeurs.id, 'mission-locale-87');
  assert.strictEqual(r.valeurs.type, 'mission-locale');
  assert.strictEqual(r.valeurs.nom, 'Mission locale - Limoges');
  assert.strictEqual(r.valeurs.telephone, '05 55 00 00 00');
  assert.strictEqual(r.valeurs.site, 'https://exemple.org');
  assert.strictEqual(r.valeurs.rayons, 'jeunes,accompagnement');
  assert.strictEqual(r.valeurs.date, '', 'la date est celle de la verification de Denis');
  assert.strictEqual(r.valeurs.commune, 'Limoges');
  assert.ok(r.corrections.length >= 6);
});

test('formatTelephone : formats courants, refuse ce qui n\'est pas un numero francais a 10 chiffres', () => {
  assert.strictEqual(S.formatTelephone('0555000000'), '05 55 00 00 00');
  assert.strictEqual(S.formatTelephone('+33 5 55 00 00 00'), '05 55 00 00 00');
  assert.strictEqual(S.formatTelephone('05-55-00-00-00'), '05 55 00 00 00');
  assert.strictEqual(S.formatTelephone('555'), null);
});

// ---------- analyse d'un lot (structures) ----------
test('analyserLot (structures) : prete, deja connue (identifiant, nom, site), a corriger avec suggestion, doublon dans le lot', () => {
  const colle = [
    ligne(L12('mission-locale-limoges-87', { type: 'mission_locale', site: 'http://ml.example.org/', tel: '05.55.00.00.00' })),   // prete (corrigee)
    ligne(L12('asso-udaf-87')),                                                                                                 // deja connue : identifiant
    ligne(L12('autre-id-87', { nom: 'CCAS de Demo', portee: '24', commune: 'Perigueux' })),                                    // deja connue : nom
    ligne(L12('copie-site-87', { nom: 'UDAF 87 (copie)', site: 'https://udaf87.example.org' })),                                                        // deja connue : meme site
    ligne(L12('ccas-saint-junnien-87', { commune: 'Saint-Junnien' })),                                                          // a corriger : commune
    ligne(L12('mission-locale-limoges-87-bis', { nom: 'Nom mission-locale-limoges-87', site: 'https://autre.example.org/' })),     // deja dans le lot (meme nom)
    'trop | peu | de colonnes | ici | la | ligne | casse'
  ].join('\n');
  const r = S.analyserLot('lieux', colle, REG, '', CTX, AUJ);
  assert.ok(r.ok);
  const par = (id) => r.lignes.filter((l) => (l.valeurs && l.valeurs.id) === id)[0];
  assert.strictEqual(par('mission-locale-limoges-87').statut, 'prete');
  assert.strictEqual(par('mission-locale-limoges-87').valeurs.type, 'mission-locale');
  assert.strictEqual(par('mission-locale-limoges-87').valeurs.telephone, '05 55 00 00 00');
  assert.strictEqual(par('asso-udaf-87').statut, 'connue');
  assert.strictEqual(par('asso-udaf-87').connue.raison, 'identifiant');
  assert.strictEqual(par('autre-id-87').connue.raison, 'nom');
  assert.strictEqual(par('copie-site-87').connue.raison, 'site');
  const c = par('ccas-saint-junnien-87');
  assert.strictEqual(c.statut, 'corriger');
  assert.ok(c.problemes[0].suggestions.some((s) => s.vers.indexOf('Saint-Junien') !== -1));
  assert.strictEqual(par('mission-locale-limoges-87-bis').statut, 'connue');
  assert.strictEqual(par('mission-locale-limoges-87-bis').connue.ou, 'lot');
  assert.deepStrictEqual([r.resume.pretes, r.resume.connues, r.resume.acorriger], [1, 4, 1]);
});

test('analyserLot : la ligne a corriger ne bloque pas les autres, et le texte explique en francais', () => {
  const r = S.analyserLot('lieux', ligne(L12('x-87', { type: 'mision-locale', portee: 'Haute-Vienne', source: '' })) + '\n' + ligne(L12('y-87')), REG, '', CTX, AUJ);
  const x = r.lignes[0];
  assert.strictEqual(x.statut, 'corriger');
  const textes = x.problemes.map((p) => p.message).join(' ');
  assert.ok(/type « mision-locale »/.test(textes) && /portée « Haute-Vienne »/.test(textes));
  assert.ok(x.corrections.some((c) => c.champ === 'source'), 'une source absente est complétée honnêtement, pas refusée');
  assert.ok(x.problemes.filter((p) => p.champ === 'type')[0].suggestions.some((s) => /mission-locale/.test(s.vers)));
  assert.ok(x.problemes.filter((p) => p.champ === 'portee')[0].suggestions.some((s) => /87/.test(s.vers)));
  assert.strictEqual(r.lignes[1].statut, 'prete');
});

test('analyserLot : colonne manquante (date absente) acceptee ; mauvais nombre de colonnes explique', () => {
  const sansDate = ligne(L12('z-87')).replace(/ \| $/, '');
  const r = S.analyserLot('lieux', sansDate + '\n' + ligne(L12('t-87')).split(' | ').slice(0, 8).join(' | ') + ' | a | b | c | d | e', REG, '', CTX, AUJ);
  assert.strictEqual(r.lignes[0].statut, 'prete');
  assert.strictEqual(r.lignes[1].statut, 'corriger');
  assert.ok(/colonnes au lieu de 12/.test(r.lignes[1].problemes[0].message));
});

test('analyserLot : limite de 100 lignes, aucun texte reconnu', () => {
  assert.ok(!S.analyserLot('lieux', 'bonjour', REG, '', CTX, AUJ).ok);
  const beaucoup = Array.from({ length: 101 }, (_, i) => ligne(L12('n' + i + '-87'))).join('\n');
  assert.ok(/100 au plus/.test(S.analyserLot('lieux', beaucoup, REG, '', CTX, AUJ).erreur));
  assert.ok(!S.analyserLot('inconnu', 'a | b | c', REG, '', CTX, AUJ).ok);
});

// ---------- la vraie réponse de ChatGPT (essai de Denis, 2026-10-12) : ses défauts réels sont des cas de test ----------
const CTX_REEL = Object.assign({}, CTX, {
  communes: ['perigueux', 'bergerac', 'limoges', 'saint junien', 'panazol', 'sainte foy de beles'],
  communesNoms: ['Périgueux', 'Bergerac', 'Limoges', 'Saint-Junien', 'Panazol'],
  communesCodes: { perigueux: '24322', bergerac: '24037', limoges: '87085', 'saint junien': '87187', panazol: '87114' }
});
const ligneBot = (o) => ligne(Object.assign(L12('x-87'), o));

test('nettoyer : retire les marques de l\'interface de ChatGPT (entity[...], références de contenu, utm_source) et les cartes du plan', () => {
  const colle = [
    'Use two fingers to move the map', 'Association Marianes5,0•Centre d\'accueil pour sans-abris', '4,1', 'PARTIE 2/3', '```',
    ligneBot({ id: 'a-87', source: 'PDALHPD Dordogne 2025-2030 ; entity["turn0business0","Association Périgourdine d\'Action"]' }),
    ligneBot({ id: 'b-87', source: 'https://exemple.org/page.pdf :chatgpt-content-reference{index="4"}' }),
    ligneBot({ id: 'c-87', source: 'https://exemple.org/page?utm_source=chatgpt.com' }), '```', 'PARTIE 2/3 TERMINÉE. Répondez OUI pour la suite.'
  ].join('\n');
  const r = S.nettoyer(colle, 12);
  assert.strictEqual(r.lignes.length, 3);
  assert.ok(r.lignes.every((l) => l.brut.indexOf('entity[') === -1 && l.brut.indexOf('chatgpt') === -1));
  assert.ok(r.lignes[0].brut.indexOf('PDALHPD Dordogne 2025-2030 ; ') === -1 || /PDALHPD Dordogne 2025-2030 \|/.test(r.lignes[0].brut) || /PDALHPD Dordogne 2025-2030 ;/.test(r.lignes[0].brut));
  assert.ok(r.ignorees >= 5);
});

test('analyserLot : aucune source donnee = mention honnete ajoutee (rien d\'invente) ; la commune du siege d\'une structure nationale ou regionale est videe', () => {
  const r = S.analyserLot('lieux', [
    ligneBot({ id: 'sans-source-87', source: 'entity["turn0business12","Habitat et Humanisme Dordogne"]' }),
    ligneBot({ id: 'visale-national', nom: 'Visale', commune: 'Paris', portee: 'national', site: 'https://www.visale.example.fr' }),
    ligneBot({ id: 'croix-rouge-region', nom: 'Croix-Rouge', commune: 'Bordeaux', portee: 'region', site: 'https://www.croix-rouge.example.fr' })
  ].join('\n'), REG, '', CTX_REEL, AUJ);
  assert.deepStrictEqual(r.lignes.map((l) => l.statut), ['prete', 'prete', 'prete']);
  assert.strictEqual(r.lignes[0].valeurs.source, 'proposée par un assistant, source non donnée');
  assert.strictEqual(r.lignes[1].valeurs.commune, '');
  assert.ok(r.lignes[1].corrections.some((c) => c.champ === 'commune' && /siège/.test(c.raison)));
  assert.strictEqual(r.lignes[2].valeurs.commune, '');
});

test('analyserLot : plusieurs services d\'un meme organisme sur une seule page = avertissement, pas un doublon ; mais l\'adresse d\'une fiche DEJA publiee reste un doublon', () => {
  const page = 'https://arsl.example.org/hebergement/';
  const r = S.analyserLot('lieux', [
    ligneBot({ id: 'arsl-un-87', nom: 'ARSL Hébergement', site: page }),
    ligneBot({ id: 'arsl-deux-87', nom: 'CHRS Augustin Gartempe', site: page }),
    ligneBot({ id: 'copie-udaf-87', nom: 'Une autre UDAF', site: 'https://udaf87.example.org' })
  ].join('\n'), REG, '', CTX_REEL, AUJ);
  assert.strictEqual(r.lignes[0].statut, 'prete');
  assert.strictEqual(r.lignes[1].statut, 'prete');
  assert.ok(r.lignes[1].avertissements.some((w) => /Même adresse/.test(w)));
  assert.strictEqual(r.lignes[2].statut, 'connue');
  assert.strictEqual(r.lignes[2].connue.raison, 'site');
});

test('analyserLot : une commune de l\'autre departement est une erreur ; un nom qui cite un departement avec une portee regionale est signale', () => {
  const r = S.analyserLot('lieux', [
    ligneBot({ id: 'melange-87', commune: 'Bergerac', portee: '87' }),
    ligneBot({ id: 'fsl-region', nom: 'Fonds de solidarité pour le logement de la Haute-Vienne', commune: 'Limoges', portee: 'region' })
  ].join('\n'), REG, '', CTX_REEL, AUJ);
  assert.strictEqual(r.lignes[0].statut, 'corriger');
  assert.ok(/est en Dordogne, mais la portée indiquée est 87 \(Haute-Vienne\)/.test(r.lignes[0].problemes[0].message), r.lignes[0].problemes[0].message);
  assert.strictEqual(r.lignes[1].statut, 'prete');
  assert.ok(r.lignes[1].avertissements.some((w) => /Haute-Vienne/.test(w) && /region/.test(w)));
});

test('analyserLot : defauts vus dans les vraies reponses : liste de rayons separee par des espaces, type ecrit dans les rayons (suggestion), source Google Maps', () => {
  const r = S.analyserLot('lieux', [
    ligneBot({ id: 'espaces-87', rayons: 'former accompagnement' }),
    ligneBot({ id: 'type-87', nom: 'CAF de test', site: 'https://caf-test.example.org', rayons: 'garde,budget,soutien-aux-familles' }),
    ligneBot({ id: 'carte-87', nom: 'Micro-creche de test', site: '', source: 'https://www.google.com/maps' })
  ].join('\n'), REG, '', CTX_REEL, AUJ);
  assert.strictEqual(r.lignes[0].statut, 'prete');
  assert.strictEqual(r.lignes[0].valeurs.rayons, 'former,accompagnement');
  const t = r.lignes[1];
  assert.strictEqual(t.statut, 'corriger');
  assert.ok(/TYPE de structure, pas un rayon/.test(t.problemes[0].message));
  const sg = t.problemes[0].suggestions.filter((x) => /^retirer/.test(x.libelle))[0];
  assert.ok(sg, 'proposition de retirer le mot');
  const corrigee = S.analyserLot('lieux', t.ligneFinale.replace(sg.de, sg.vers), REG, '', CTX_REEL, AUJ).lignes[0];
  assert.strictEqual(corrigee.statut, 'prete');
  assert.strictEqual(corrigee.valeurs.rayons, 'garde,budget');
  assert.strictEqual(r.lignes[2].valeurs.source, 'proposée par un assistant, source non donnée');
});

// ---------- employeurs ----------
test('analyserLot (employeurs) : etablissements controles, mode et secteur', () => {
  const emp = (o) => [o.id, o.nature, o.nom, o.secteur, o.etab, o.tel, o.site, o.rec, o.modes, o.source, ''].join(' | ');
  const bon = { id: 'lidl-limoges', nature: 'enseigne', nom: 'Lidl', secteur: 'commerce-vente', etab: 'Limoges:1 rue A ; Saint-Junien:2 rue B', tel: '', site: 'https://www.lidl.example.fr/', rec: '', modes: 'portail', source: 'https://src.example.fr' };
  const r = S.analyserLot('employeurs', [emp(bon), emp(Object.assign({}, bon, { id: 'btp-x', nom: 'Entreprise X', site: '', secteur: 'batiment', etab: 'Limoges:1 rue A', modes: 'candidature' }))].join('\n'), REG, '', CTX, AUJ);
  assert.strictEqual(r.lignes[0].statut, 'prete');
  assert.strictEqual(r.lignes[1].statut, 'corriger');
  const t = r.lignes[1].problemes.map((p) => p.message).join(' ');
  assert.ok(/secteur « batiment »/.test(t) && /mode de candidature « candidature »/.test(t));
  assert.ok(r.lignes[1].problemes.filter((p) => p.champ === 'secteur')[0].suggestions.some((s) => /btp/.test(s.vers)));
});

// ---------- complements (telephones) ----------
test('analyserLot (complements) : fiche reconnue, nom proche, introuvable, rien trouve, deja le meme numero', () => {
  const regTel = { lieux: LIEUX.replace('| | | https://ccas-demo.example.org/', '| | 05 53 00 00 00 | https://ccas-demo.example.org/'), employeurs: EMPLOYEURS };
  const colle = [
    'nom | telephone | page | a verifier',
    'UDAF de la Haute-Vienne | 05 55 12 34 56 | https://udaf87.example.org/contact | non',
    'UDAF de la haute vienne | 0555123456 | https://udaf87.example.org/contact | non',
    'CCAS de Demo | 05 53 00 00 00 | https://ccas-demo.example.org/ | non',
    'Aldi | non trouvé | | oui',
    'Centre Inconnu | 05 55 00 00 01 | https://x.example.org | non',
    'UDAF de la Haute-Vienn | 05 55 12 34 57 | https://udaf87.example.org/contact | non',
    'Aldi | 05 53 99 99 99 |  | non'
  ].join('\n');
  const r = S.analyserLot('complements', colle, regTel, '', CTX, AUJ);
  assert.ok(r.ok);
  assert.strictEqual(r.lignes[0].statut, 'prete');
  assert.strictEqual(r.lignes[0].valeurs.cible, 'asso-udaf-87');
  assert.strictEqual(r.lignes[0].valeurs.registre, 'lieux');
  assert.strictEqual(r.lignes[1].statut, 'connue', 'meme fiche deja dans ce lot');
  assert.strictEqual(r.lignes[2].statut, 'rien', 'deja ce numero');
  assert.strictEqual(r.lignes[3].statut, 'rien', 'non trouve');
  assert.strictEqual(r.lignes[4].statut, 'corriger');
  assert.ok(/Aucune fiche/.test(r.lignes[4].problemes[0].message));
  assert.strictEqual(r.lignes[5].statut, 'corriger');
  assert.ok(r.lignes[5].problemes[0].suggestions.some((s) => s.vers === 'UDAF de la Haute-Vienne'));
  assert.strictEqual(r.lignes[6].statut, 'corriger', 'sans la page ou le numero figure : impossible a verifier');
});

// ---------- le sas lui-meme ----------
test('appliquer : importer ne garde que des lignes pretes ; retirer ; modifier ; rien n\'est ecrit si une action est refusee', () => {
  const pretes = [ligne(L12('a-87')), ligne(L12('b-87'))];
  const r1 = S.appliquer('lieux', '', [{ op: 'importer', lignes: pretes }], REG, CTX, AUJ);
  assert.ok(r1.ok, r1.erreur);
  assert.ok(/L'application NE LIT PAS/.test(r1.texte), 'en-tete du sas');
  assert.strictEqual(S.lister('lieux', r1.texte, REG).lignes.length, 2);
  assert.strictEqual(r1.resume.importes, 2);
  // refus : une ligne pas prete (connue) arrete tout
  const r2 = S.appliquer('lieux', r1.texte, [{ op: 'importer', lignes: [ligne(L12('c-87')), ligne(L12('a-87'))] }], REG, CTX, AUJ);
  assert.ok(!r2.ok && /pas prête/.test(r2.erreur));
  // retirer, modifier
  const r3 = S.appliquer('lieux', r1.texte, [{ op: 'retirer', id: 'a-87' }, { op: 'modifier', id: 'b-87', ligne: ligne(L12('b-87', { desc: 'phrase corrigee' })) }], REG, CTX, AUJ);
  assert.ok(r3.ok, r3.erreur);
  const apres = S.lister('lieux', r3.texte, REG).lignes;
  assert.deepStrictEqual(apres.map((l) => l.id), ['b-87']);
  assert.strictEqual(apres[0].valeurs.description, 'phrase corrigee');
  assert.strictEqual(apres[0].valeurs.date, '', 'jamais de date dans le sas');
  assert.ok(!S.appliquer('lieux', r1.texte, [{ op: 'retirer', id: 'inconnu-87' }], REG, CTX, AUJ).ok);
  assert.ok(!S.appliquer('lieux', r1.texte, [{ op: 'detruire', id: 'a-87' }], REG, CTX, AUJ).ok);
  assert.ok(!S.appliquer('lieux', r1.texte, [], REG, CTX, AUJ).ok);
});

test('appliquer (complements) : le sas range cible | registre | telephone | source', () => {
  const r = S.appliquer('complements', '', [{ op: 'importer', lignes: ['UDAF de la Haute-Vienne | 05 55 12 34 56 | https://udaf87.example.org/contact | non'] }], REG, CTX, AUJ);
  assert.ok(r.ok, r.erreur);
  const l = S.lister('complements', r.texte, REG).lignes;
  assert.deepStrictEqual(l[0].valeurs, { cible: 'asso-udaf-87', registre: 'lieux', telephone: '05 55 12 34 56', source: 'https://udaf87.example.org/contact' });
  assert.strictEqual(l[0].nom, 'UDAF de la Haute-Vienne');
  assert.ok(!S.appliquer('complements', r.texte, [{ op: 'modifier', id: 'asso-udaf-87', ligne: 'x | y | z' }], REG, CTX, AUJ).ok);
});

// ---------- de bout en bout, sur un depot jetable ----------
function git(dossier, ...args) { const r = spawnSync('git', args, { cwd: dossier, encoding: 'utf8' }); return { code: r.status, sortie: String(r.stdout || '') + String(r.stderr || '') }; }
function ecrire(dossier, chemin, texte) { const p = path.join(dossier, chemin); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, texte, 'utf8'); }
function depotJetable() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-sas-'));
  git(d, 'init', '-q', '-b', 'master'); git(d, 'config', 'user.email', 'essai@example.org'); git(d, 'config', 'user.name', 'Essai'); git(d, 'config', 'commit.gpgsign', 'false'); git(d, 'config', 'core.autocrlf', 'false');
  ecrire(d, 'modules/mon-territoire/contenu/lieux.txt', LIEUX);
  ecrire(d, 'modules/mon-territoire/contenu/employeurs.txt', EMPLOYEURS);
  ecrire(d, 'outils/veille.html', '<html></html>\n');   // le dossier outils/ existe, pas outils/sas/ (git avertit alors : ce n'est pas du travail en cours)
  ecrire(d, 'tests/ok.test.js', "const t=require('node:test');t('essai',()=>{});\n");
  ecrire(d, 'package.json', '{"name":"essai","private":true}\n');
  git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'depart');
  return d;
}
const nettoyerDepot = (d) => { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) { /* tant pis */ } };

test('depot : importer dans le sas ecrit le fichier du sas, le commite, ne touche NI le registre public NI les tests ; annuler le defait', () => {
  const d = depotJetable();
  try {
    const depot = creerDepot(d, { aujourdhui: () => AUJ });
    const analyse = depot.analyserLot('lieux', ligne(L12('mission-locale-limoges-87')) + '\n' + ligne(L12('asso-udaf-87')));
    assert.ok(analyse.ok);
    assert.deepStrictEqual([analyse.resume.pretes, analyse.resume.connues], [1, 1]);
    const pretes = analyse.lignes.filter((l) => l.statut === 'prete').map((l) => l.ligneFinale);
    const r = depot.publier([{ type: 'sas', fichier: 'lieux', actions: [{ op: 'importer', lignes: pretes }] }]);
    assert.ok(r.ok, r.erreur);
    assert.deepStrictEqual(r.fichiers, ['outils/sas/lieux.sas.txt']);
    assert.strictEqual(r.resumeSas.importes, 1);
    assert.ok(fs.readFileSync(path.join(d, 'outils/sas/lieux.sas.txt'), 'utf8').indexOf('mission-locale-limoges-87') !== -1);
    assert.strictEqual(fs.readFileSync(path.join(d, 'modules/mon-territoire/contenu/lieux.txt'), 'utf8'), LIEUX, 'le registre public n\'a pas bouge');
    assert.strictEqual(depot.listerSas('lieux').lignes.length, 1);
    // le meme lot, reessaye : plus rien de prete
    assert.strictEqual(depot.analyserLot('lieux', pretes.join('\n')).resume.pretes, 0);
    assert.ok(depot.annuler().ok);
    assert.strictEqual(depot.listerSas('lieux').lignes.length, 0);
  } finally { nettoyerDepot(d); }
});

test('depot : « C\'est bon » = une seule publication qui ajoute la fiche au registre public avec la date du jour ET la retire du sas', () => {
  const d = depotJetable();
  try {
    const depot = creerDepot(d, { aujourdhui: () => AUJ });
    const a = depot.analyserLot('lieux', ligne(L12('mission-locale-limoges-87', { tel: '05 55 00 00 00' })));
    assert.ok(depot.publier([{ type: 'sas', fichier: 'lieux', actions: [{ op: 'importer', lignes: [a.lignes[0].ligneFinale] }] }]).ok);
    const v = a.lignes[0].valeurs;
    const valeurs = Object.assign({}, v); delete valeurs.id; delete valeurs.date;
    const r = depot.publier([
      { type: 'territoire', fichier: 'lieux', actions: [{ op: 'ajouter', id: v.id, valeurs: valeurs, dater: true }] },
      { type: 'sas', fichier: 'lieux', actions: [{ op: 'retirer', id: v.id }] }
    ]);
    assert.ok(r.ok, r.erreur);
    const registre = fs.readFileSync(path.join(d, 'modules/mon-territoire/contenu/lieux.txt'), 'utf8');
    assert.ok(registre.indexOf('mission-locale-limoges-87') !== -1 && registre.indexOf('| ' + AUJ) !== -1, 'ajoutee et datee du jour');
    assert.strictEqual(depot.listerSas('lieux').lignes.length, 0, 'sortie du sas');
  } finally { nettoyerDepot(d); }
});

test('depot : un numero du sas complete la fiche publiee (telephone + date du jour) et sort du sas', () => {
  const d = depotJetable();
  try {
    const depot = creerDepot(d, { aujourdhui: () => AUJ, maintenant: () => AUJ + ' 14:32' });
    const a = depot.analyserLot('complements', 'UDAF de la Haute-Vienne | 05 55 12 34 56 | https://udaf87.example.org/contact | non');
    assert.strictEqual(a.lignes[0].statut, 'prete');
    assert.ok(depot.publier([{ type: 'sas', fichier: 'complements', actions: [{ op: 'importer', lignes: [a.lignes[0].ligneFinale] }] }]).ok);
    const r = depot.publier([
      { type: 'territoire', fichier: 'lieux', actions: [{ op: 'modifier', id: 'asso-udaf-87', valeurs: { telephone: '05 55 12 34 56' }, dater: true }] },
      { type: 'sas', fichier: 'complements', actions: [{ op: 'retirer', id: 'asso-udaf-87' }] }
    ]);
    assert.ok(r.ok, r.erreur);
    assert.ok(/asso-udaf-87 \|.*\| 05 55 12 34 56 \|.*\| 2026-10-12/.test(fs.readFileSync(path.join(d, 'modules/mon-territoire/contenu/lieux.txt'), 'utf8')));
    assert.strictEqual(depot.listerSas('complements').lignes.filter(function (l) { return !l.generee; }).length, 0, 'plus aucun numéro proposé en attente (les fiches sans numéro, générées, restent listées)');
    // Journal : date ET heure de la fiche modifiée, relues par la liste du registre.
    assert.ok(/2026-10-12 14:32 \| lieux \| asso-udaf-87 \| modifiée/.test(fs.readFileSync(path.join(d, 'outils/journal_modifications.txt'), 'utf8')));
    assert.strictEqual(depot.listerTerritoire('lieux').lignes.filter(function (l) { return l.id === 'asso-udaf-87'; })[0].modifieLe, AUJ + ' 14:32');
  } finally { nettoyerDepot(d); }
});

test('depot : sas inconnu, texte vide, action vide', () => {
  const d = depotJetable();
  try {
    const depot = creerDepot(d, { aujourdhui: () => AUJ });
    assert.ok(!depot.analyserLot('inconnu', 'a | b | c').ok);
    assert.ok(!depot.analyserLot('lieux', '   ').ok);
    assert.ok(!depot.listerSas('inconnu').ok);
    assert.ok(!depot.publier([{ type: 'sas', fichier: 'inconnu', actions: [{ op: 'retirer', id: 'a-87' }] }]).ok);
    assert.ok(!depot.publier([{ type: 'sas', fichier: 'lieux', actions: [] }]).ok);
  } finally { nettoyerDepot(d); }
});

test('analyserLot : meme nom ou meme site dans des communes differentes = deux etablissements (jamais un doublon) ; dans la meme commune = doublon', () => {
  // employeurs : l'enseigne Aldi est deja connue a Bergerac
  const emp = (id, etab) => [id, 'enseigne', 'Aldi', 'commerce-vente', etab, '', 'https://www.aldi.example.fr/', '', 'portail', 'https://www.aldi.example.fr/', ''].join(' | ');
  const r = S.analyserLot('employeurs', [emp('aldi-limoges', 'Limoges:1 rue de la Gare'), emp('aldi-bis', 'Bergerac:2 rue Neuve')].join('\n'), REG, '', CTX, AUJ);
  assert.strictEqual(r.lignes[0].statut, 'prete', 'Aldi de Limoges n\'est pas Aldi de Bergerac');
  assert.strictEqual(r.lignes[1].statut, 'connue', 'Aldi de Bergerac y est deja');
  assert.strictEqual(r.lignes[1].connue.raison, 'nom');
  // structures : deux antennes de meme nom et de meme site dans deux communes
  const l = (id, commune) => ligne(L12(id, { nom: 'ASFEL antenne', commune: commune, site: 'https://asfel.example.org/', portee: '87' }));
  const r2 = S.analyserLot('lieux', [l('asfel-limoges-87', 'Limoges'), l('asfel-saint-junien-87', 'Saint-Junien'), l('asfel-autre-87', 'Limoges')].join('\n'), REG, '', CTX, AUJ);
  assert.strictEqual(r2.lignes[0].statut, 'prete');
  assert.strictEqual(r2.lignes[1].statut, 'prete', 'autre commune : une autre antenne');
  assert.strictEqual(r2.lignes[2].statut, 'connue', 'meme nom, meme commune : doublon');
});

test('nettoyer : retire aussi les marques « citeturn0business0 » (la marque ChatGPT une fois collee sans ses caracteres speciaux)', () => {
  const r = S.nettoyer('x-24 | local | X | commerce-vente | Bergerac: | | https://x.example.fr | | spontanee | https://x.example.fr citeturn0business18 |');
  assert.ok(r.lignes.length === 1 && !/citeturn/.test(r.lignes[0]), r.lignes[0]);
});

test('depot : les fiches publiées sans numéro sont listées dans le sas des numéros ; « sans numéro » est mémorisé avec la date du jour et les retire de la liste', () => {
  const d = depotJetable();
  try {
    const depot = creerDepot(d, { aujourdhui: () => AUJ, maintenant: () => AUJ + ' 14:32' });
    const avant = depot.listerSas('complements').lignes.filter(function (l) { return l.generee; });
    const cible = avant.filter(function (l) { return l.valeurs.cible === 'asso-udaf-87'; })[0];
    if (!cible) { return; }   // la fiche d'essai a déjà un numéro dans ce jeu de données
    assert.strictEqual(cible.valeurs.registre, 'lieux');
    const r = depot.publier([{ type: 'sans-numero', actions: [{ op: 'ajouter', registre: 'lieux', id: 'asso-udaf-87' }] }]);
    assert.ok(r.ok, r.erreur);
    assert.ok(new RegExp('lieux \| asso-udaf-87 \| ' + AUJ).test(fs.readFileSync(path.join(d, 'modules/mon-territoire/contenu/sans-numero.txt'), 'utf8')));
    assert.strictEqual(depot.listerSas('complements').lignes.filter(function (l) { return l.valeurs.cible === 'asso-udaf-87'; }).length, 0);
    assert.strictEqual(depot.publier([{ type: 'sans-numero', actions: [{ op: 'ajouter', registre: 'lieux', id: 'fiche-inconnue' }] }]).ok, false);
  } finally { nettoyerDepot(d); }
});
