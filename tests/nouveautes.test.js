// Page « Nouveautés » : logique pure (modules/nouveautes/logique.js) et données (data/nouveautes.js).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const L = require('../modules/nouveautes/logique.js');

const AUJ = new Date(2026, 9, 26);   // 26 octobre 2026

test('nvAgeJours et étiquette « Nouveau » : 7 jours, jamais une date future ni illisible', () => {
  assert.strictEqual(L.nvAgeJours('2026-10-26', AUJ), 0);
  assert.strictEqual(L.nvAgeJours('2026-10-19', AUJ), 7);
  assert.strictEqual(L.nvEstNouveau({ date: '2026-10-20' }, AUJ), true);
  assert.strictEqual(L.nvEstNouveau({ date: '2026-10-19' }, AUJ), false);
  assert.strictEqual(L.nvEstNouveau({ date: '2026-10-27' }, AUJ), false);
  assert.strictEqual(L.nvAgeJours('pas une date', AUJ), null);
  assert.strictEqual(L.nvEstNouveau({}, AUJ), false);
});

test('dates affichées en français, jamais en AAAA-MM-JJ', () => {
  assert.strictEqual(L.nvDateFr('2026-10-26'), '26 octobre 2026');
  assert.strictEqual(L.nvDateFr('2026-11-01'), '1er novembre 2026');
  assert.strictEqual(L.nvMoisFr('2026-02-03'), 'février 2026');
  assert.strictEqual(L.nvDateFr('x'), '');
});

test('nvGrouperParMois : du plus récent au plus ancien, par mois, sans les dates futures ni illisibles', () => {
  const g = L.nvGrouperParMois([
    { date: '2026-09-15', titre: 'a' }, { date: '2026-10-20', titre: 'b' }, { date: '2026-10-26', titre: 'c1' }, { date: '2026-10-26', titre: 'c2' },
    { date: '2027-01-01', titre: 'futur' }, { date: 'zzz', titre: 'illisible' }
  ], AUJ);
  assert.deepStrictEqual(g.map((x) => x.mois), ['octobre 2026', 'septembre 2026']);
  assert.deepStrictEqual(g[0].items.map((x) => x.titre), ['c1', 'c2', 'b']);
  assert.strictEqual(L.nvCompterNouveaux([{ date: '2026-10-26' }, { date: '2026-01-01' }], AUJ), 1);
});

test('les données : chaque ligne a une date, un titre, un texte, un lien connu ; aucun tiret long ni mot « IA » ; jamais « Mon territoire »', () => {
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', 'nouveautes.js'), 'utf8') + '\nthis.NOUV = NOUVEAUTES;', ctx);
  const liste = ctx.NOUV;
  assert.ok(liste.length > 0);
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  const CARTES = ['Mes documents', 'Me préparer à candidater', 'Boîte à outils', 'Outils d’analyse', 'Se tenir informé', 'Vous hésitez encore ?'];
  liste.forEach((n) => {
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(n.date), n.titre);
    assert.ok(n.titre && n.texte, n.date);
    assert.ok(!n.route || app.indexOf("'" + n.route + "':") !== -1, 'route inconnue : ' + n.route);
    assert.ok(!n.route || /^bi-[a-z0-9-]+$/.test(n.icone || ''), 'icône manquante : ' + n.titre);
    const t = n.titre + ' ' + n.texte + ' ' + (n.module || '');
    // Seule exception au mot « IA » : le nom du module « Bien utiliser l’IA » (dérogation de Denis du 22/11/2026), cité tel quel.
    const sansNomModule = t.split('Bien utiliser l’IA').join('');
    assert.ok(!/[–—]/.test(t) && !/\bIA\b/.test(sansNomModule), 'tiret long ou « IA » : ' + n.titre);
    assert.ok(!/territoire/i.test(t), 'fonction fermée au public : ' + n.titre);
    assert.ok(n.carte ? CARTES.indexOf(n.carte) !== -1 : !!n.lieu, 'carte de l’accueil inconnue (ou lieu manquant) : ' + n.titre);
  });
});

test('les quatre entrées : entrée connue sinon « appli », origine par défaut « nous », mots affichés, total de la pastille', () => {
  assert.deepStrictEqual(L.NV_ENTREES, ['appli', 'regles', 'chiffres', 'corriges'], 'l’ordre est celui du pulse et de l’écran (consigne 440)');
  assert.strictEqual(L.nvEntreeValide('chiffres'), 'chiffres');
  assert.strictEqual(L.nvTotalPastille(2, 3, 4, 5), 14, 'les quatre entrées s’additionnent');
  assert.strictEqual(L.nvTotalPastille(2, 3, 4, null), 9, 'les chiffres inconnus comptent zéro');
  ['appli', 'regles', 'chiffres', 'corriges'].forEach((c) => assert.ok(L.nvMemoireNeuve(new Date()).vus[c], 'la mémoire neuve a une case pour ' + c));
  assert.ok(L.nvLireMemoire(JSON.stringify({ v: 2, depart: '2026-11-01', vus: { appli: {}, regles: {}, corriges: {} } }), new Date()).vus.chiffres, 'une ancienne mémoire (sans chiffres) est complétée');
  assert.strictEqual(L.nvEntreeValide('regles'), 'regles');
  assert.strictEqual(L.nvEntreeValide('n importe quoi'), 'appli');
  assert.strictEqual(L.nvEntreeValide(undefined), 'appli');
  assert.strictEqual(L.nvOrigine({ origine: 'personne' }), 'personne');
  assert.strictEqual(L.nvOrigine({}), 'nous');
  assert.strictEqual(L.nvLibelleOrigine({ origine: 'personne' }), 'Signalé par un utilisateur');
  assert.strictEqual(L.nvLibelleOrigine({ origine: 'nous' }), '', 'rien d affiché pour un défaut repéré par nous');
  assert.strictEqual(L.nvLibelleOrigine({}), '');
  assert.strictEqual(L.nvLibelleAvant({ origine: 'personne' }), 'Ce qui avait été signalé');
  assert.strictEqual(L.nvLibelleAvant({ origine: 'nous' }), 'Ce qui avait été constaté');
  assert.strictEqual(L.nvTotalPastille(2, 3, 4), 9);
  assert.strictEqual(L.nvTotalPastille(2, null, 4), 6, 'le nombre des règles est inconnu tant que le module n a pas été lu');
  assert.strictEqual(L.nvTotalPastille(-1, undefined, 0), 0);
});

test('les problèmes corrigés : date, titre, deux phrases, origine connue ; aucun tiret long ni mot « IA » ; textes simples', () => {
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', 'problemesCorriges.js'), 'utf8') + '\nthis.PC = PROBLEMES_CORRIGES;', ctx);
  const liste = ctx.PC;
  assert.ok(liste.length > 0);
  liste.forEach((p) => {
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(p.date), p.titre);
    assert.ok(p.titre && p.signale && p.corrige, p.date);
    assert.ok(p.origine === 'personne' || p.origine === 'nous', 'origine inconnue : ' + p.titre);
    const t = p.titre + ' ' + p.signale + ' ' + p.corrige;
    assert.ok(!/[–—]/.test(t) && !/\bIA\b/.test(t), 'tiret long ou « IA » : ' + p.titre);
    assert.ok(!/territoire/i.test(t), 'fonction fermée au public : ' + p.titre);
  });
  assert.strictEqual(L.nvCompterNouveaux(liste, new Date(2026, 10, 10)), liste.filter((p) => p.date >= '2026-11-04' && p.date <= '2026-11-10').length);   // date de référence fixe : une ligne plus récente (ajoutée plus tard) ne compte pas
});

test('la page est branchée : script chargé, recherche de l accueil pour les trois entrées, cible gérée par app.js', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.ok(html.indexOf('data/problemesCorriges.js') !== -1);
  assert.ok(html.indexOf('data/problemesCorriges.js') < html.indexOf('modules/nouveautes/index.js'), 'les données avant l interface');
  const base = fs.readFileSync(path.join(__dirname, '..', 'data', 'baseConnaissancesERIP.js'), 'utf8');
  ['fn:nouveautes-appli', 'fn:nouveautes-regles', 'fn:nouveautes-chiffres', 'fn:nouveautes-corriges'].forEach((c) => assert.ok(base.indexOf(c) !== -1, c));
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  assert.ok(app.indexOf("val.indexOf('nouveautes-') === 0") !== -1);
});

// ---- Mémoire du « déjà vu » (consigne 418, 16/11/2026) ----
const AUJ_VU = new Date(2026, 10, 16);   // 16 novembre 2026

test('mémoire du déjà vu : premier passage = tout ce qui a 7 jours ou plus est déjà vu, les 6 derniers jours sont nouveaux', () => {
  const m = L.nvMemoireNeuve(AUJ_VU);
  assert.strictEqual(m.depart, '2026-11-09');
  const liste = [{ date: '2026-11-16', titre: 'aujourd hui' }, { date: '2026-11-10', titre: 'récent' }, { date: '2026-11-09', titre: 'limite' }, { date: '2026-06-01', titre: 'ancien' }];
  assert.deepStrictEqual(L.nvNonVus(m, 'appli', liste).map((e) => e.titre), ['aujourd hui', 'récent']);
  assert.strictEqual(L.nvNonVus(m, 'appli', [{ date: '2026-12-01', titre: 'annoncé' }]).length, 1, 'une date future reste à signaler');
});

test('mémoire du déjà vu : marquer vu, ne pas toucher à la mémoire donnée, une nouveauté ajoutée ensuite apparaît', () => {
  const m0 = L.nvMemoireNeuve(AUJ_VU);
  const liste = [{ date: '2026-11-15', titre: 'A' }];
  const m1 = L.nvMarquerVus(m0, 'appli', liste);
  assert.strictEqual(L.nvNonVus(m0, 'appli', liste).length, 1, 'la mémoire de départ n a pas changé');
  assert.strictEqual(L.nvNonVus(m1, 'appli', liste).length, 0);
  const apres = liste.concat([{ date: '2026-11-16', titre: 'B' }]);
  assert.deepStrictEqual(L.nvNonVus(m1, 'appli', apres).map((e) => e.titre), ['B']);
  assert.strictEqual(L.nvNonVus(m1, 'corriges', liste).length, 1, 'chaque entrée a sa propre mémoire');
});

test('mémoire du déjà vu : une fiche remise à jour (autre date) redevient non vue, un changement se reconnaît à son titre', () => {
  let m = L.nvMemoireNeuve(AUJ_VU);
  const fiche = { type: 'fiche', id: 'logement-apl', titre: 'APL', date: '2026-11-12' };
  m = L.nvMarquerVus(m, 'regles', [fiche]);
  assert.strictEqual(L.nvEstVu(m, 'regles', fiche), true);
  assert.strictEqual(L.nvEstVu(m, 'regles', { type: 'fiche', id: 'logement-apl', titre: 'APL (titre changé)', date: '2026-11-12' }), true, 'une fiche se reconnaît à son identifiant');
  assert.strictEqual(L.nvEstVu(m, 'regles', { type: 'fiche', id: 'logement-apl', titre: 'APL', date: '2026-11-16' }), false, 'mise à jour : à revoir');
  const chg = { type: 'changement', titre: 'Hausse du  Smic ', date: '2026-12-01' };
  m = L.nvMarquerVus(m, 'regles', [chg]);
  assert.strictEqual(L.nvEstVu(m, 'regles', { type: 'changement', titre: 'hausse du smic', date: '2026-12-01' }), true, 'espaces et majuscules ignorés');
});

test('mémoire du déjà vu : écriture puis relecture à l identique, texte abîmé = mémoire vierge, nettoyage des éléments disparus', () => {
  let m = L.nvMarquerVus(L.nvMemoireNeuve(AUJ_VU), 'appli', [{ date: '2026-11-15', titre: 'A' }, { date: '2026-11-14', titre: 'B' }]);
  const relue = L.nvLireMemoire(L.nvEcrireMemoire(m), AUJ_VU);
  assert.deepStrictEqual(relue, m);
  ['', 'null', '{"v":1}', '{"v":2,"depart":"pas une date","vus":{}}', '[1,2]', '{"v":2,"depart":"2026-11-09"}'].forEach((t) => {
    assert.deepStrictEqual(L.nvLireMemoire(t, AUJ_VU), L.nvMemoireNeuve(AUJ_VU), 'texte : ' + t);
  });
  const nettoyee = L.nvNettoyer(m, 'appli', [{ date: '2026-11-15', titre: 'A' }]);
  assert.strictEqual(Object.keys(nettoyee.vus.appli).length, 1, 'l élément B n existe plus : sa clé est retirée');
  assert.strictEqual(Object.keys(m.vus.appli).length, 2, 'la mémoire donnée n est pas modifiée');
});

test('mémoire du déjà vu : jamais de sessionStorage, la clé de stockage est celle de l appareil', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'modules', 'nouveautes', 'index.js'), 'utf8');
  assert.ok(src.indexOf('localStorage.getItem(NV_CLE_STOCKAGE)') !== -1 && src.indexOf('localStorage.setItem(NV_CLE_STOCKAGE') !== -1);
  assert.ok(src.indexOf('sessionStorage') === -1, 'l ancienne mémoire de session est remplacée');
  assert.strictEqual(L.NV_CLE_STOCKAGE, 'aps_nouveautes_vues_v2');
});

test('filtres de l entrée application (consigne 418, lot 2) : barre repliable, filtres jamais mémorisés, style présent', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'modules', 'nouveautes', 'index.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  ["_nvBoutonFiltre('montrer'", "_nvBoutonFiltre('periode'", "_nvBoutonFiltre('carte'", 'id="nvPlier"', 'aria-expanded', 'id="nvReinit"', 'Tout l’historique', 'Ce que je n’ai pas encore vu'].forEach((t) => assert.ok(src.indexOf(t) !== -1, t));
  assert.ok(!/localStorage\.setItem\([^)]*_nvFiltres/.test(src) && src.indexOf('_nvFiltres') !== -1, 'les filtres ne durent que pendant la visite');
  ['.nv-filtres', '.nv-f-btn', '.nv-f-plier', '.nv-vu-badge', '.nv-vide'].forEach((c) => assert.ok(css.indexOf(c + ' ') !== -1 || css.indexOf(c + '[') !== -1 || css.indexOf(c + '.') !== -1, c));
  assert.ok(!/[–—]/.test(src.slice(src.indexOf('// Entrée 1'), src.indexOf('// Entrée 2'))), 'aucun tiret long dans les textes de l entrée');
});

// ---- Consigne 418, lot 3 : « Droits et règles » (table des cadres validée par Denis le 16/11/2026, filtres, recherche) ----
test('table domaine vers cadre : tous les domaines des fichiers de balayage sont rangés, vers un cadre qui existe', () => {
  const dossier = path.join(__dirname, '..', 'modules', 'comprendre-le-cadre', 'contenu', 'balayage');
  const domaines = new Set();
  fs.readdirSync(dossier).filter((f) => /\.md$/.test(f)).forEach((f) => {
    fs.readFileSync(path.join(dossier, f), 'utf8').split(/\r?\n/).forEach((l) => { const m = l.match(/^##\s+(.+)$/); if (m) { domaines.add(m[1].trim()); } });
  });
  assert.ok(domaines.size >= 10, 'les fichiers de balayage sont lus');
  domaines.forEach((d) => assert.ok(L.nvDomaineConnu(d), 'domaine non rangé dans NV_DOMAINE_CADRE : ' + d));
  const src = fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-le-cadre', 'index.js'), 'utf8');
  const bloc = src.slice(src.indexOf('var RAYON_LABEL = {'), src.indexOf('var RAYON_LABEL = {') + 12000);
  const rayons = (bloc.match(/^  (\w+): \{ icone/gm) || []).map((l) => l.trim().split(':')[0]);
  assert.ok(rayons.length >= 15, 'les rayons sont lus');
  L.NV_DOMAINE_CADRE.forEach((l) => assert.ok(rayons.indexOf(l[1]) !== -1 || L.NV_CADRES_A_PART[l[1]], 'cadre inconnu : ' + l[1]));
  assert.strictEqual(L.nvCadreDuDomaine('Propre à la région Nouvelle-Aquitaine ou au département de la Dordogne (24)'), 'region');
  assert.strictEqual(L.nvCadreDuDomaine('Annoncé, pas encore en vigueur'), 'autres');
  assert.strictEqual(L.nvCadreDuDomaine('Un domaine tout neuf'), 'autres');
  assert.strictEqual(L.nvCadreDuDomaine("RSA, prime d'activité, AAH et leurs cumuls"), 'budget');
});

test('filtres de « Droits et règles » : tout par défaut, à venir en tête, période, genre, cadre, recherche sans accents', () => {
  const aujIso = '2026-11-16';
  const els = [
    { titre: 'Revalorisation de la prime d’activité', date: '2026-12-01', genre: 'officiel', cadre: 'budget' },
    { titre: 'Prime de Noël', date: '2026-11-15', genre: 'nouvelle', cadre: 'budget' },
    { titre: 'Découvert bancaire', date: '2026-11-10', genre: 'maj', cadre: 'budget' },
    { titre: 'Permis de conduire', date: '2026-10-01', genre: 'officiel', cadre: 'mobilite' },
    { titre: 'Aide au logement', date: '2026-06-01', genre: 'officiel', cadre: 'logement' }
  ];
  const vus = { 'Prime de Noël': true };   // seul « Prime de Noël » est neuf
  const ctx = { aujIso, estNeuf: (e) => !!vus[e.titre], libelles: { cadre: { budget: 'Budget, dettes, droits sociaux', mobilite: 'Mobilité', logement: 'Logement' }, genre: { nouvelle: 'Nouvelle fiche', maj: 'Fiche mise à jour', officiel: 'Changement officiel' } } };
  const f = (o) => Object.assign({ montrer: 'tout', genre: '*', periode: 'tout', cadre: '*', q: '' }, o || {});
  const titres = (o, sauf) => L.nvReglesFiltrer(els, f(o), ctx, sauf).map((e) => e.titre);
  assert.strictEqual(titres().length, 5, 'rien n’est masqué par défaut (consigne 420)');
  assert.strictEqual(titres()[0], 'Revalorisation de la prime d’activité', 'l’à venir est en tête');
  assert.ok(titres()[0].indexOf('Revalorisation') === 0);
  assert.deepStrictEqual(titres({ montrer: 'nonvus' }), ['Prime de Noël'], '« pas encore vu » ne garde que ce qui est nouveau');
  assert.deepStrictEqual(titres({ periode: 'avenir' }), ['Revalorisation de la prime d’activité']);
  assert.deepStrictEqual(titres({ periode: '7' }), ['Prime de Noël', 'Découvert bancaire'], '7 jours : le 15 et le 10 novembre, jamais l’à venir');
  assert.deepStrictEqual(titres({ periode: '30' }), ['Prime de Noël', 'Découvert bancaire']);
assert.deepStrictEqual(titres({ periode: '60' }), ['Prime de Noël', 'Découvert bancaire', 'Permis de conduire']);
  assert.deepStrictEqual(titres({ periode: 'anciens' }), ['Aide au logement'], 'plus de 60 jours');
  assert.deepStrictEqual(titres({ genre: 'maj' }), ['Découvert bancaire']);
  assert.deepStrictEqual(titres({ cadre: 'mobilite' }), ['Permis de conduire']);
  assert.deepStrictEqual(titres({ q: 'MOBILITE' }), ['Permis de conduire'], 'la recherche porte aussi sur le nom du cadre, sans accents ni majuscules');
  assert.deepStrictEqual(titres({ q: 'prime activite' }), ['Revalorisation de la prime d’activité'], 'plusieurs mots, apostrophe typographique');
  assert.deepStrictEqual(titres({ q: 'zzz' }), []);
  assert.strictEqual(titres({ cadre: 'mobilite' }, 'cadre').length, 5, 'sauf : sert à compter les boutons d’un groupe');
});

test('entrée « Droits et règles » (lot 3) : barre repliable, recherche, lecture 20 par 20, mois anciens, un seul rendu des cartes', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'modules', 'nouveautes', 'index.js'), 'utf8');
  const bloc = src.slice(src.indexOf('// Entrée 2'), src.indexOf('// Entrée 3'));
  ['id="nvQ"', 'id="nvPlier"', 'id="nvReinit"', 'id="nvPlus"', 'id="nvTousCadres"', "_nvBoutonFiltre('periode'", "_nvBoutonFiltre('cadre'", "_nvBoutonFiltre('genre'", 'comprendreLeCadreRenduElement', ', true);'].forEach((t) => assert.ok(bloc.indexOf(t) !== -1, t));
  assert.ok(!/localStorage/.test(bloc), 'les filtres ne sont jamais mémorisés');
  assert.ok(!/[–—]/.test(bloc), 'aucun tiret long dans les textes');
  assert.ok(src.indexOf('_nvMarquerRegles') === -1, 'plus de marquage séparé : il se fait avant l’affichage');
  const cadre = fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-le-cadre', 'index.js'), 'utf8');
  assert.ok(cadre.indexOf('function comprendreLeCadreLireTout') !== -1 && cadre.indexOf('function _comprendreLeCadreRenduCarteFiche') !== -1);
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  assert.ok(css.indexOf('.nv-f-recherche ') !== -1 && css.indexOf('.nv-f-effacer ') !== -1);
});

test('téléphone (consigne 418, lot 4) : trois pastilles seules, nom lu par les lecteurs d écran, nom de l entrée écrit au-dessus', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'modules', 'nouveautes', 'index.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  assert.ok(src.indexOf('<span class="nv-entree-lib">') !== -1, 'le nom reste dans la page (caché à l écran sur téléphone, lu par les lecteurs d écran)');
  assert.ok(src.indexOf('id="nvTitreEntree"') !== -1 && src.indexOf('function _nvMajTitreEntree') !== -1);
  const media = css.slice(css.indexOf('Téléphone (consigne 418, lot 4'));
  ['width: 68px', 'height: 68px', 'border-radius: 50%', '.nv-entree .nv-entree-lib', '.nv-entree .nv-compte', '.nv-titre-entree { display: block; }', '@media (max-width: 600px)'].forEach((t) => assert.ok(media.indexOf(t) !== -1, t));
});

test('« Droits et règles » : la recherche garde sa place au milieu, bouton « Tout réinitialiser » présent ou non (consigne de Denis, 16/11/2026)', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'modules', 'nouveautes', 'index.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  assert.ok(src.indexOf('nv-f-resultat nv-f-resultat--3') !== -1);
  assert.ok(css.indexOf('.nv-f-resultat--3 { display: grid; grid-template-columns: 1fr minmax(12rem, 24rem) 1fr;') !== -1, 'trois colonnes : la recherche est toujours celle du milieu');
  assert.ok(css.indexOf('.nv-f-resultat--3 .nv-f-reinit[hidden] { display: inline-block; visibility: hidden; }') !== -1, 'le bouton absent garde sa place');
});

test('filtres figés et flèche de retour (consigne 422, étape A) : plus de barre collante, une flèche quand on a dépassé le filtre', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'modules', 'nouveautes', 'index.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  const regle = css.slice(css.indexOf('.nv-filtres {'), css.indexOf('.nv-filtres {') + 160);
  assert.ok(regle.indexOf('sticky') === -1, 'la barre de filtres ne suit plus le défilement');
  assert.ok(css.indexOf('.nv-filtres.nv-plie { position: sticky; }') === -1);
  assert.ok(src.indexOf("remonterDefinirCible('.nv-filtres', '#nvPlier')") !== -1 && src.indexOf('nvVersFiltre') === -1, 'la flèche de Nouveautés est le composant commun, avec les filtres pour cible');
  assert.ok(css.indexOf('.fleche-remonter {') !== -1 && css.indexOf('.fleche-remonter[hidden]') !== -1 && css.indexOf('.nv-vers-filtre') === -1);
});

test('fiche lue sur place (consigne 422, étape B) : carte repliable, rendu sans écran autour, deux boutons choisis par la personne', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-le-cadre', 'index.js'), 'utf8');
  const nv = fs.readFileSync(path.join(__dirname, '..', 'modules', 'nouveautes', 'index.js'), 'utf8');
  assert.ok(src.indexOf('function _comprendreLeCadreRenduFiche(f, enLigne)') !== -1);
  assert.ok(src.indexOf('function _comprendreLeCadreResoudreSources') !== -1 && src.indexOf('function _comprendreLeCadreChargerUneFiche') !== -1);
  assert.ok(src.indexOf('data-cc-vers-fiche') !== -1 && src.indexOf('data-cc-vers-rayon') !== -1);
  assert.ok(src.indexOf('window.comprendreLeCadreBrancherElements') !== -1);
  assert.ok(nv.indexOf("comprendreLeCadreBrancherElements(zone, { label: 'Nouveautés'") !== -1, 'la page Nouveautés branche la lecture sur place avec un retour');
  assert.ok(nv.indexOf('comprendreLeCadreBrancherRecent();') === -1, 'plus de bouton qui piège dans le module');
});

test('ouverture des cartes (consigne 524) : une seule carte ouverte, un clic dans une carte au premier niveau la ferme, jamais au second niveau', () => {
  const nv = fs.readFileSync(path.join(__dirname, '..', 'modules', 'nouveautes', 'index.js'), 'utf8');
  assert.ok(nv.indexOf('function _nvBrancherOuvertureCartes(zone)') !== -1 && nv.indexOf('_nvBrancherOuvertureCartes(zone);') !== -1, 'les deux entrées à cartes branchent l ouverture');
  const i = nv.indexOf('function _nvBrancherOuvertureCartes(zone)');
  const corps = nv.slice(i, nv.indexOf('function _nvBrancherCorpsRegles(zone)'));
  assert.ok(corps.indexOf('c.open = false') !== -1, 'ouvrir une carte ferme les autres');
  assert.ok(corps.indexOf('_nvCarteAuPremierNiveau(d)') !== -1 && corps.indexOf('getSelection') !== -1, 'un clic ferme seulement au premier niveau, jamais en fin de sélection');
  assert.ok(corps.indexOf("'pointer'") !== -1, 'le doigt reste visible sur toute la carte ouverte au premier niveau');
  assert.ok(corps.indexOf('button, a, input, select, textarea, label, summary') !== -1 && corps.indexOf('[data-pastille]') !== -1, 'boutons, liens, champs et pastilles-filtres ne ferment pas');
});

test('filtrer un jour précis (consigne 422, étape C) : le jour remplace la période, un deuxième clic le retire', () => {
  const L = require('../modules/nouveautes/logique.js');
  const els = [
    { type: 'changement', genre: 'officiel', titre: 'A', date: '2026-12-01', cadre: 'emploi' },
    { type: 'changement', genre: 'officiel', titre: 'B', date: '2026-12-01', cadre: 'logement' },
    { type: 'fiche', genre: 'nouvelle', titre: 'C', date: '2026-11-10', cadre: 'emploi' }
  ];
  const ctx = { aujIso: '2026-11-16', estNeuf: () => true, libelles: { cadre: {}, genre: {} } };
  const base = { montrer: 'tout', genre: '*', periode: 'tout', date: '', cadre: '*', q: '' };
  const titres = (f) => L.nvReglesFiltrer(els, Object.assign({}, base, f), ctx).map((e) => e.titre).sort();
  assert.deepStrictEqual(titres({ date: '2026-12-01' }), ['A', 'B'], 'tout ce qui porte cette date');
  assert.deepStrictEqual(titres({ date: '2026-12-01', cadre: 'emploi' }), ['A'], 'jour et cadre se cumulent');
  assert.deepStrictEqual(titres({ date: '2026-12-01', periode: '7' }), ['A', 'B'], 'le jour précis remplace la période');
  assert.deepStrictEqual(titres({ date: '' }), ['A', 'B', 'C'], 'sans jour, tout est affiché');
  assert.deepStrictEqual(titres({ cadre: 'emploi' }), ['A', 'C'], 'un clic sur un cadre : tout ce cadre');
});

test('pastilles qui filtrent (consigne 422, étape C) : repères dans le module, branchement dans la page', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-le-cadre', 'index.js'), 'utf8');
  const nv = fs.readFileSync(path.join(__dirname, '..', 'modules', 'nouveautes', 'index.js'), 'utf8');
  ['date', 'domaine', 'genre', 'rayon'].forEach((t) => assert.ok(src.indexOf('data-pastille=\"' + t + '\"') !== -1, 'pastille ' + t));
  assert.ok(nv.indexOf('data-pastille=\"nouveau\"') !== -1 && nv.indexOf('function _nvBrancherPastilles') !== -1 && nv.indexOf('_nvBrancherPastilles(zone);') !== -1);
  assert.ok(nv.indexOf('e.stopPropagation()') !== -1, 'un clic sur une pastille ne plie pas la carte');
});

test('fiche lue sur place en deux temps (consigne 422, précision de Denis) : résumé d’abord, texte entier sur demande', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-le-cadre', 'index.js'), 'utf8');
  assert.ok(src.indexOf('function _comprendreLeCadreRenduResumeFiche(f, dateCarte, nouvelle)') !== -1);
  assert.ok(src.indexOf('data-cc-lire-tout') !== -1 && src.indexOf('data-cc-fiche-entiere') !== -1, 'un bouton ouvre le texte entier');
  assert.ok(src.indexOf('Lire la fiche en entier') !== -1 && src.indexOf('Replier la fiche') !== -1);
  assert.ok(src.indexOf("(!enLigne && f.pour_qui") !== -1, 'pas de doublon du « Utile si » dans le texte entier');
});

test('boutons de fin de fiche bien distincts (consigne 422) : signaler à droite et ambre, boutons vers le module pleins', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-le-cadre', 'index.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-le-cadre', 'comprendre-le-cadre.css'), 'utf8');
  assert.ok(src.indexOf('btn btn-sm comprendre-le-cadre-signaler-btn') !== -1);
  assert.ok(src.indexOf('btn btn-primary btn-sm me-2 mb-2" data-cc-vers-fiche') !== -1 && src.indexOf('btn btn-primary btn-sm mb-2" data-cc-vers-rayon') !== -1);
  assert.ok(css.indexOf('.comprendre-le-cadre-signaler-btn { margin-left: auto;') !== -1 && css.indexOf('var(--warning-bg-subtle)') !== -1);
});

test('fiche mise à jour : « Ce qui change » (champ maj_resume), fiche nouvelle : « En bref » (consigne 422, précisions de Denis)', () => {
  require('./_domStub').installerStubDom();
  const M = require('../modules/comprendre-le-cadre/index.js');
  const f = { pour_qui: 'Utile si vous travaillez.', phrase_generale: 'Une phrase de synthèse.', maj_resume: '2026-11-09 : La revalorisation du 1er octobre est ajoutée.', verifie_le: '2026-11-09' };
  assert.strictEqual(M._comprendreLeCadreTexteCeQuiChange(f, '2026-11-09'), 'La revalorisation du 1er octobre est ajoutée.');
  assert.strictEqual(M._comprendreLeCadreTexteCeQuiChange(f, '2026-11-10'), '', 'un changement décrit pour une autre date n’est pas montré');
  const maj = M._comprendreLeCadreRenduResumeFiche(f, '2026-11-09', false);
  assert.ok(maj.indexOf('Ce qui a changé.') !== -1 && maj.indexOf('En bref') === -1 && maj.indexOf('Utile si') !== -1);
  const nouvelle = M._comprendreLeCadreRenduResumeFiche(f, '2026-11-09', true);
  assert.ok(nouvelle.indexOf('En bref') !== -1 && nouvelle.indexOf('Ce qui a changé.') === -1, 'une fiche nouvelle montre « En bref »');
  const sans = M._comprendreLeCadreRenduResumeFiche({ pour_qui: 'Utile si.', phrase_generale: 'Synthèse.' }, '2026-11-09', false);
  assert.ok(sans.indexOf('En bref') !== -1, 'sans changement décrit : « En bref », rien d’inventé');
});

test('les champs maj_resume des fiches sont bien formés : date, texte, ni tiret long ni mot « IA » ni nom d’outil', () => {
  const racine = path.join(__dirname, '..', 'modules', 'comprendre-le-cadre', 'contenu');
  let n = 0;
  fs.readdirSync(racine).forEach((r) => {
    const d = path.join(racine, r);
    if (!fs.statSync(d).isDirectory()) { return; }
    fs.readdirSync(d).filter((x) => /\.md$/.test(x)).forEach((x) => {
      const m = /^maj_resume:\s*"(.*)"\s*$/m.exec(fs.readFileSync(path.join(d, x), 'utf8').replace(/\r\n/g, '\n'));
      if (!m) { return; }
      n++;
      assert.ok(/^\d{4}-\d{2}-\d{2} : .{20,}/.test(m[1]), x + ' : « AAAA-MM-JJ : texte »');
      assert.ok(!/[—–]/.test(m[1]) && !/\bIA\b|ChatGPT|Perplexity/.test(m[1]), x + ' : mots interdits');
    });
  });
  assert.ok(n >= 1);
});

test('« En bref » en bandeau vert (consigne 422) : même forme que « Ce qui change », autre couleur', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-le-cadre', 'comprendre-le-cadre.css'), 'utf8');
  const src = fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-le-cadre', 'index.js'), 'utf8');
  assert.ok(src.indexOf('comprendre-le-cadre-digest-cle comprendre-le-cadre-digest-cle--bref') !== -1);
  assert.ok(/digest-cle--bref \{[^}]*--success-bg-subtle/.test(css) && /digest-cle--bref strong \{[^}]*--success-strong/.test(css));
});

test('consigne 424 : on reste où l’on est, filtres repliés à l’arrivée, flèche partout, bouton Signaler uniforme', () => {
  const nv = fs.readFileSync(path.join(__dirname, '..', 'modules', 'nouveautes', 'index.js'), 'utf8');
  const cc = fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-le-cadre', 'index.js'), 'utf8');
  assert.ok((nv.match(/window\.scrollTo\(0, y\)/g) || []).length >= 3, 'chaque redessin garde la position de défilement');
  assert.ok(nv.indexOf('focus()') === -1 || nv.split('focus()').length === 1, 'aucun focus() qui fait défiler vers le haut');
  assert.ok(nv.indexOf('plie: true } };') !== -1 && nv.indexOf('_nvReplierFiltres();') !== -1, 'filtres repliés à l’arrivée');
  assert.ok(nv.indexOf("nvOuvrirEntree('regles')") !== -1 && nv.indexOf("nvOuvrirEntree('regles', true)") === -1, 'le retour depuis une fiche replie aussi les filtres (consigne 431)');
  assert.ok(/function pageNouveautes\(\) \{\n  _nvReplierFiltres\(\);/.test(nv), 'la page replie les deux filtres à chaque affichage (consigne 431)');
  assert.ok(/function nvOuvrirEntree\(cle\) \{\n  _nvReplierFiltres\(\);/.test(nv), 'plus d’exception à l’arrivée');
  assert.strictEqual((nv.match(/data-signaler-probleme/g) || []).length, 1, 'un seul bouton Signaler, celui qui reprend la forme des fiches');
  assert.strictEqual((nv.match(/_nvSignaler\('/g) || []).length, 5, 'un bouton en haut de chacune des quatre entrées, plus celui du pied d’une fiche Chiffres');
  assert.ok(cc.indexOf('function comprendreLeCadreRenduBoutonSignaler') !== -1 && cc.indexOf('comprendre-le-cadre-signaler--haut') !== -1);
  assert.ok(fs.readFileSync(path.join(__dirname, '..', 'modules', 'remonter', 'index.js'), 'utf8').indexOf('window.scrollTo({ top: 0') !== -1, 'la flèche existe aussi sans filtres (composant commun)');
  assert.ok(cc.indexOf('comprendre-le-cadre-pastille comprendre-le-cadre-pastille--v"><i class="bi bi-patch-check-fill"></i> Vérifié') === -1, 'la pastille Vérifié n’est plus verte');
});

test('consigne 425 : « Fiche liée » donne un second niveau de lecture aux changements officiels, seulement quand la fiche existe', () => {
  require('./_domStub').installerStubDom();
  const M = require('../modules/comprendre-le-cadre/index.js');
  const dossier = path.join(__dirname, '..', 'modules', 'comprendre-le-cadre', 'contenu');
  const bal = path.join(dossier, 'balayage');
  let nb = 0;
  fs.readdirSync(bal).filter((n) => /^\d{4}-\d{2}\.md$/.test(n)).forEach((n) => {
    fs.readFileSync(path.join(bal, n), 'utf8').split(/\r?\n/).forEach((l) => {
      const m = l.match(/^Fiche liée\s*:\s*(.+)$/);
      if (!m) { return; }
      nb++;
      assert.ok(/^[a-z0-9-]+\/[a-z0-9-]+$/.test(m[1].trim()), n + ' : forme rayon/identifiant attendue : ' + l);
      assert.ok(fs.existsSync(path.join(dossier, m[1].trim() + '.md')), n + ' : fiche liée introuvable : ' + m[1]);
    });
  });
  assert.ok(nb >= 1);
  assert.deepStrictEqual(M._comprendreLeCadreFicheLiee('emploi/emploi-arret-maladie'), { rayon: 'emploi', id: 'emploi-arret-maladie' });
  assert.strictEqual(M._comprendreLeCadreFicheLiee(''), null);
  assert.strictEqual(M._comprendreLeCadreFicheLiee('n’importe quoi'), null);
  const c = { domaine: 'D', titre: 'T', blocs: [{ type: 'texte', texte: 'Ce qui change : x' }, { type: 'texte', texte: 'Fiche liée : emploi/emploi-arret-maladie' }], date: '2026-12-01', ficheLiee: { rayon: 'emploi', id: 'emploi-arret-maladie' } };
  const avec = M._comprendreLeCadreRenduCarteChangement(c, '2026-11-17', '', true);
  assert.ok(avec.indexOf('data-cc-fiche-liee="emploi/emploi-arret-maladie"') !== -1 && avec.indexOf('Lire la fiche en entier') !== -1);
  assert.strictEqual(avec.indexOf('Fiche liée'), -1, 'la ligne de liaison ne s’affiche jamais telle quelle');
  assert.strictEqual(M._comprendreLeCadreRenduCarteChangement(c, '2026-11-17').indexOf('data-cc-fiche-liee'), -1, 'hors page Nouveautés : pas de bouton');
  assert.strictEqual(M._comprendreLeCadreRenduCarteChangement(Object.assign({}, c, { ficheLiee: null }), '2026-11-17', '', true).indexOf('data-cc-fiche-liee'), -1);
});

test('consigne 426 : texte complet d\'un changement sans fiche (« Lire plus d\'informations »), bandeau seulement quand la règle n\'est pas encore en vigueur', () => {
  require('./_domStub').installerStubDom();
  const M = require('../modules/comprendre-le-cadre/index.js');
  const blocs = [
    { type: 'paragraphe', texte: 'Ce qui change : x' },
    { type: 'paragraphe', texte: 'Détail : # Ce qui est annoncé' },
    { type: 'paragraphe', texte: 'Détail : Un paragraphe.' },
    { type: 'paragraphe', texte: 'Détail : > Smic horaire brut = 12,31 euros' },
    { type: 'paragraphe', texte: 'Détail : > Dernière hausse = 2,41 %' },
    { type: 'paragraphe', texte: 'Détail : ! Situation vérifiée le 17 novembre 2026.' }
  ];
  const det = M._comprendreLeCadreDetailsDuChangement({ blocs: blocs });
  assert.deepStrictEqual(det.map((d) => d.t), ['h', 'p', 'r', 'r', 'n']);
  assert.strictEqual(det[2].libelle, 'Smic horaire brut');
  assert.strictEqual(det[2].valeur, '12,31 euros');
  const html = M._comprendreLeCadreRenduDetail(det);
  assert.ok(html.indexOf('<h3>Ce qui est annoncé</h3>') !== -1 && html.indexOf('<dt>Smic horaire brut</dt><dd>12,31 euros</dd>') !== -1);
  assert.strictEqual((html.match(/comprendre-le-cadre-rappel/g) || []).length, 1, 'les deux lignes de rappel forment un seul encadré');
  assert.ok(html.indexOf('Situation vérifiée le 17 novembre 2026.') !== -1, 'la note datée est dans l\'encadré');
  const c = { domaine: 'D', titre: 'T', blocs: blocs, date: '2026-12-01', ficheLiee: null, detail: det };
  const futur = M._comprendreLeCadreRenduCarteChangement(c, '2026-11-17', '', true);
  assert.ok(futur.indexOf('data-cc-lire-detail') !== -1 && futur.indexOf('Lire plus d’informations') !== -1);
  assert.ok(futur.indexOf('pas encore en vigueur') !== -1, 'bandeau jaune quand la date est dans le futur');
  assert.strictEqual(futur.indexOf('Détail'), -1, 'la ligne « Détail » ne s\'affiche jamais telle quelle');
  const passe = M._comprendreLeCadreRenduCarteChangement(Object.assign({}, c, { date: '2026-06-01' }), '2026-11-17', '', true);
  assert.ok(passe.indexOf('data-cc-lire-detail') !== -1 && passe.indexOf('pas encore en vigueur') === -1, 'règle déjà en vigueur : pas de bandeau');
  assert.strictEqual(M._comprendreLeCadreRenduCarteChangement(c, '2026-11-17').indexOf('data-cc-lire-detail'), -1, 'hors page Nouveautés : pas de bouton');
  assert.strictEqual(M._comprendreLeCadreRenduCarteChangement(Object.assign({}, c, { detail: [] }), '2026-11-17', '', true).indexOf('data-cc-lire-detail'), -1, 'sans texte complet : pas de bouton');
  const avecFiche = M._comprendreLeCadreRenduCarteChangement(Object.assign({}, c, { ficheLiee: { rayon: 'emploi', id: 'emploi-arret-maladie' } }), '2026-11-17', '', true);
  assert.ok(avecFiche.indexOf('data-cc-fiche-liee') !== -1 && avecFiche.indexOf('data-cc-lire-detail') === -1, 'la fiche liée passe avant le texte complet');
});
test('consigne 426 : le changement du Smic annoncé a son texte complet dans le balayage, avec le rappel daté', () => {
  const t = fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-le-cadre', 'contenu', 'balayage', '2026-11.md'), 'utf8').split(/\r?\n/);
  const i = t.findIndex((l) => /^### Hausse du Smic de 1,6 %/.test(l));
  assert.ok(i >= 0);
  const bloc = [];
  for (let j = i + 1; j < t.length && !/^###? /.test(t[j]); j++) { bloc.push(t[j]); }
  const details = bloc.filter((l) => /^Détail :/.test(l));
  assert.ok(details.length >= 8, 'texte complet présent');
  assert.ok(details.some((l) => /^Détail : > Smic horaire brut = 12,31 euros/.test(l)), 'rappel du Smic d\'aujourd\'hui');
  assert.ok(details.some((l) => /^Détail : ! Situation vérifiée le /.test(l)), 'note datée du rappel');
  assert.ok(!bloc.some((l) => /^Fiche liée :/.test(l)), 'pas de fiche liée : le texte complet tient lieu de lecture');
  assert.ok(!/[\u2014\u2013]/.test(details.join('\n')) && !/\bIA\b/.test(details.join('\n')));
});
test('consigne 438 : Signaler et Replier au pied de chaque texte lu sur place (à venir compris)', () => {
  const cc = fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-le-cadre', 'index.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-le-cadre', 'comprendre-le-cadre.css'), 'utf8');
  const debut = cc.indexOf('data-cc-detail-corps hidden');
  const bloc = cc.slice(debut, cc.indexOf("'</div></div>'", debut) + 20);
  assert.ok(bloc.indexOf('_comprendreLeCadreRenduBoutonSignaler(') !== -1, 'le texte complet (à venir ou non) a son bouton Signaler');
  assert.ok(bloc.indexOf("_comprendreLeCadreBoutonReplierHtml('Replier la fiche')") !== -1, 'et son bouton Replier en bas');
  assert.strictEqual((cc.match(/_comprendreLeCadreBoutonReplierHtml\('Replier la fiche'\)/g) || []).length, 3, 'détail, fiche liée et fiche entière');
  assert.strictEqual((cc.match(/_comprendreLeCadreBrancherReplier\(/g) || []).length, 5, 'défini une fois, branché trois fois, plus la façade publique des fiches Chiffres');
  assert.ok(css.indexOf('.comprendre-le-cadre-replier-rangee') !== -1);
  assert.ok(!/replace\(\/\*\*\//.test(cc), 'jamais « /**/ » : c’est un commentaire, pas une expression');
});
