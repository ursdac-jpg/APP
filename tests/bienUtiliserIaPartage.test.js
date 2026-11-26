// Module « Bien utiliser l'IA » : partager ses demandes avec un collègue (P13, décision de Denis du 25/11/2026).
// Un fichier à part, jamais la disquette : export des demandes cochées, lecture d'un fichier reçu avec tout revérifié, jamais d'écrasement, plafond de 20.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const L = require('../modules/bien-utiliser-ia/libreLogique.js');
const M = require('../modules/bien-utiliser-ia/modeleLogique.js');
const G = require('../modules/bien-utiliser-ia/gardeLogique.js');
const TXT = require('../data/buiaLibreTextes.js');
const Dates = require('../modules/cv-core/dates.js');

const racine = path.join(__dirname, '..');
const lire = (p) => fs.readFileSync(path.join(racine, p), 'utf8');
const libre = (o) => Object.assign(L.buiaLibreSaisieVide(), { but: 'écrire un mot pour l’école', situation: 'mon fils est absent jeudi' }, o || {});
const modele = (o) => { const s = M.buiaSaisieParDefaut(1); s.champs.poste = 'caissier'; s.champs.offre = 'OFFRE COLLÉE À NE JAMAIS GARDER'; return Object.assign(s, o || {}); };

// Trois demandes : d1 libre, d2 modèle, d3 libre avec un texte à traiter qui ne doit jamais partir.
function etatDepart() {
  let e = G.buiaGardeVide();
  e = G.buiaGardeAjouterLibre(e, 'Mot pour l’école', libre()).etat;
  e = G.buiaGardeAjouterModele(e, 'Mail de candidature', 1, modele()).etat;
  e = G.buiaGardeAjouterLibre(e, 'Compte rendu', libre({ but: 'résumer un entretien', texte: 'TEXTE À TRAITER SECRET' })).etat;
  return e;
}

test('nom du fichier : demandes-partagees puis la date en français jour-mois-année, sans date si elle n’est pas valable', () => {
  assert.equal(G.buiaPartageNomFichier('25-11-2026'), 'demandes-partagees-25-11-2026.json');
  assert.equal(G.buiaPartageNomFichier(Dates.dateFichierFr(new Date(2026, 10, 25, 9, 30))), 'demandes-partagees-25-11-2026.json');
  // l'ancien format année-mois-jour n'est plus accepté : jamais de date à l'américaine, même dans un nom de fichier
  ['', 'demain', '25/11/2026', '2026-11-25', '2026-11-25-09h30', null, undefined, 20261125].forEach((x) => assert.equal(G.buiaPartageNomFichier(x), 'demandes-partagees.json', String(x)));
});

test('export : seulement les demandes cochées, dans l’ordre de la disquette, jamais la disquette ni le texte à traiter ni l’offre collée', () => {
  const f = G.buiaPartageExporter(etatDepart(), ['d3', 'd1']);
  assert.equal(f.type, 'demandes-partagees'); assert.equal(f.version, 1);
  assert.deepEqual(f.demandes.map((d) => d.nom), ['Mot pour l’école', 'Compte rendu']);
  assert.ok(!('dossier' in f) && !('modulesEtat' in f));
  const texte = JSON.stringify(f);
  assert.ok(!/TEXTE À TRAITER SECRET/.test(texte), 'le texte à traiter ne part jamais');
  const avecModele = JSON.stringify(G.buiaPartageExporter(etatDepart(), ['d2']));
  assert.ok(!/OFFRE COLLÉE/.test(avecModele), 'l’offre collée ne part jamais');
  assert.match(avecModele, /caissier/);
  f.demandes.forEach((d) => assert.ok(!('id' in d), 'aucun identifiant dans le fichier'));
});

test('export : rien de coché, identifiants inconnus ou entrée invalide donnent null', () => {
  assert.equal(G.buiaPartageExporter(etatDepart(), []), null);
  assert.equal(G.buiaPartageExporter(etatDepart(), ['d99']), null);
  assert.equal(G.buiaPartageExporter(etatDepart(), null), null);
  assert.equal(G.buiaPartageExporter(null, ['d1']), null);
});

test('aller-retour : le fichier d’un collègue se relit, les demandes valides sont gardées, rien n’est écrasé (nom déjà pris = « (reçue) »)', () => {
  const colleague = G.buiaPartageExporter(etatDepart(), ['d1', 'd2']);
  const monEtat = G.buiaGardeAjouterLibre(G.buiaGardeVide(), 'mot pour l’école', libre({ but: 'ma version' })).etat;
  const a = G.buiaPartageAnalyser(JSON.stringify(colleague), monEtat);
  assert.equal(a.lues, 2); assert.equal(a.ecartees.length, 0);
  assert.deepEqual(a.bonnes.map((d) => d.nom), ['Mot pour l’école (reçue)', 'Mail de candidature']);
  const r = G.buiaPartageAjouter(monEtat, a.bonnes);
  assert.equal(r.ajoutees, 2); assert.equal(r.restantes, 0);
  assert.deepEqual(r.etat.demandes.map((d) => d.id), ['d1', 'd2', 'd3']);
  assert.equal(r.etat.demandes[0].saisie.but, 'ma version', 'ma demande n’est pas remplacée');
  assert.equal(r.etat.demandes[2].modele, 1);
});

test('un même fichier reçu deux fois ne remplace rien : « (reçue) » puis « (reçue 2) », jamais plus de 60 caractères', () => {
  let e = G.buiaGardeAjouterLibre(G.buiaGardeVide(), 'Mot', libre()).etat;
  const f = JSON.stringify(G.buiaPartageExporter(e, ['d1']));
  for (let i = 0; i < 2; i++) { e = G.buiaPartageAjouter(e, G.buiaPartageAnalyser(f, e).bonnes).etat; }
  assert.deepEqual(e.demandes.map((d) => d.nom), ['Mot', 'Mot (reçue)', 'Mot (reçue 2)']);
  const long = 'x'.repeat(60);
  let e2 = G.buiaGardeAjouterLibre(G.buiaGardeVide(), long, libre()).etat;
  const f2 = JSON.stringify(G.buiaPartageExporter(e2, ['d1']));
  e2 = G.buiaPartageAjouter(e2, G.buiaPartageAnalyser(f2, e2).bonnes).etat;
  assert.ok(e2.demandes[1].nom.length <= 60 && /\(reçue\)$/.test(e2.demandes[1].nom), e2.demandes[1].nom);
});

test('deux demandes du même nom dans le fichier reçu : la seconde devient « (reçue) » aussi', () => {
  const brut = { type: 'demandes-partagees', version: 1, demandes: [
    { nom: 'Même nom', type: 'libre', saisie: { but: 'un' } }, { nom: 'même NOM', type: 'libre', saisie: { but: 'deux' } }] };
  const a = G.buiaPartageAnalyser(JSON.stringify(brut), G.buiaGardeVide());
  assert.deepEqual(a.bonnes.map((d) => d.nom), ['Même nom', 'même NOM (reçue)']);
});

test('lecture d’un fichier reçu : les demandes invalides sont écartées avec leur raison, tout est revérifié, rien n’est cru sur parole', () => {
  const brut = { type: 'demandes-partagees', version: 1, demandes: [
    { nom: 'Bonne', type: 'libre', saisie: { but: 'ok', texte: 'À NE PAS GARDER', but2: 'x' } },
    { nom: 'Modèle absent', type: 'modele', modele: 999, saisie: {} },
    { nom: 'Vide', type: 'libre', saisie: {} },
    { nom: 'Type inconnu', type: 'autre', saisie: { but: 'x' } },
    'texte', null, 42] };
  const a = G.buiaPartageAnalyser(JSON.stringify(brut), G.buiaGardeVide());
  assert.equal(a.lues, 7); assert.equal(a.bonnes.length, 1);
  assert.equal(a.bonnes[0].saisie.texte, '', 'le texte à traiter reçu est vidé');
  assert.deepEqual(a.ecartees.map((d) => d.raison), ['modele', 'vide', 'inconnue', 'inconnue', 'inconnue', 'inconnue']);
  assert.equal(a.ecartees[0].nom, 'Modèle absent');
});

test('lecture d’un fichier reçu : champs trop longs coupés, nom limité, aucune clé inconnue conservée', () => {
  const brut = { type: 'demandes-partagees', version: 1, demandes: [{ nom: 'n'.repeat(500), type: 'libre', saisie: { but: 'b'.repeat(5000), situation: 's', maison: '<script>' }, id: 'd77', extra: 1 }] };
  const a = G.buiaPartageAnalyser(JSON.stringify(brut), G.buiaGardeVide());
  const d = a.bonnes[0];
  assert.ok(d.nom.length <= 60); assert.ok(d.saisie.but.length <= 600);
  assert.ok(!('extra' in d) && !('maison' in d.saisie));
});

test('fichier qui n’est pas un fichier de demandes : illisible, disquette complète, autre ; rien n’est lu', () => {
  const vide = G.buiaGardeVide();
  assert.deepEqual(G.buiaPartageAnalyser('{ pas du json', vide), { erreur: 'illisible' });
  assert.deepEqual(G.buiaPartageAnalyser('[1,2]', vide), { erreur: 'illisible' });
  assert.deepEqual(G.buiaPartageAnalyser('"texte"', vide), { erreur: 'illisible' });
  assert.deepEqual(G.buiaPartageAnalyser(null, vide), { erreur: 'illisible' });
  assert.deepEqual(G.buiaPartageAnalyser('x'.repeat(2000001), vide), { erreur: 'illisible' });
  assert.deepEqual(G.buiaPartageAnalyser(JSON.stringify({ dossier: {}, modulesEtat: {} }), vide), { erreur: 'disquette' });
  assert.deepEqual(G.buiaPartageAnalyser(JSON.stringify({ modulesEtat: {} }), vide), { erreur: 'disquette' });
  assert.deepEqual(G.buiaPartageAnalyser(JSON.stringify({ a: 1 }), vide), { erreur: 'autre' });
  assert.deepEqual(G.buiaPartageAnalyser(JSON.stringify({ type: 'demandes-partagees', demandes: 'x' }), vide), { erreur: 'autre' });
  // le fichier de la disquette du module (sans type) n'est pas un fichier de partage non plus
  assert.deepEqual(G.buiaPartageAnalyser(JSON.stringify(G.buiaGardeExporter(etatDepart())), vide), { erreur: 'autre' });
});

test('plafond : au plus 20 demandes, les premières sont ajoutées, les autres sont comptées ; disquette pleine : rien n’est ajouté', () => {
  const demandes = []; for (let i = 1; i <= 19; i++) { demandes.push({ nom: 'Demande ' + i, type: 'libre', saisie: { but: 'but ' + i } }); }
  const f = JSON.stringify({ type: 'demandes-partagees', version: 1, demandes });
  let e = etatDepart();                        // 3 demandes
  const a = G.buiaPartageAnalyser(f, e);
  assert.equal(a.bonnes.length, 19);
  const r = G.buiaPartageAjouter(e, a.bonnes);
  assert.equal(r.ajoutees, 17); assert.equal(r.restantes, 2); assert.equal(G.buiaGardeNombre(r.etat), 20);
  const r2 = G.buiaPartageAjouter(r.etat, a.bonnes);
  assert.equal(r2.ajoutees, 0); assert.equal(r2.restantes, 19); assert.equal(G.buiaGardeNombre(r2.etat), 20);
  const ids = r.etat.demandes.map((d) => d.id); assert.equal(new Set(ids).size, 20, 'identifiants tous différents');
});

test('trop de demandes dans un fichier : celles au-delà de 100 sont écartées (raison « trop »)', () => {
  const demandes = []; for (let i = 1; i <= 105; i++) { demandes.push({ nom: 'N' + i, type: 'libre', saisie: { but: 'b' } }); }
  const a = G.buiaPartageAnalyser(JSON.stringify({ type: 'demandes-partagees', version: 1, demandes }), G.buiaGardeVide());
  assert.equal(a.lues, 105); assert.equal(a.bonnes.length, 100); assert.equal(a.ecartees.length, 5);
  assert.ok(a.ecartees.every((d) => d.raison === 'trop'));
});

test('à l’ajout, les noms sont revérifiés : la liste a pu changer entre la lecture et le clic', () => {
  const f = JSON.stringify({ type: 'demandes-partagees', version: 1, demandes: [{ nom: 'Nouveau', type: 'libre', saisie: { but: 'x' } }] });
  const a = G.buiaPartageAnalyser(f, G.buiaGardeVide());
  const entre = G.buiaGardeAjouterLibre(G.buiaGardeVide(), 'Nouveau', libre()).etat;   // la personne l'a créée entre-temps
  const r = G.buiaPartageAjouter(entre, a.bonnes);
  assert.deepEqual(r.etat.demandes.map((d) => d.nom), ['Nouveau', 'Nouveau (reçue)']);
});

test('ajout : une entrée invalide ou une liste absente ne casse rien et n’ajoute rien', () => {
  const e = etatDepart();
  [null, undefined, 'x', [null, 5, {}]].forEach((x) => { const r = G.buiaPartageAjouter(e, x); assert.equal(r.ajoutees, 0); assert.equal(G.buiaGardeNombre(r.etat), 3); });
});

test('ce qui part, ligne par ligne : les textes de la personne, y compris les précisions d’une demande libre et les champs d’un modèle ; jamais le texte à traiter', () => {
  const e = etatDepart();
  const l = G.buiaPartageLignes(e.demandes[0]);
  assert.deepEqual(l.map((x) => x.cle), ['but', 'situation']);
  const avecPrecision = G.buiaGardeAjouterLibre(G.buiaGardeVide(), 'P', libre({ ajouts: [{ id: 'but', valeur: 'plus court' }] })).etat;
  assert.ok(G.buiaPartageLignes(avecPrecision.demandes[0]).some((x) => x.cle === 'precision' && x.texte === 'plus court'));
  const m = G.buiaPartageLignes(e.demandes[1]);
  assert.ok(m.some((x) => x.cle === 'champ' && x.lib === 'Le poste visé' && x.texte === 'caissier'));
  assert.ok(!JSON.stringify(m).includes('OFFRE COLLÉE'));
  assert.ok(!JSON.stringify(G.buiaPartageLignes(e.demandes[2])).includes('TEXTE À TRAITER'));
  assert.deepEqual(G.buiaPartageLignes(null), []);
  assert.deepEqual(G.buiaPartageLignes({ type: 'modele', modele: 999 }), []);
});

test('la lecture de la disquette est inchangée par la refonte de _buiaGPropre : même résultat qu’avant', () => {
  const e = etatDepart();
  const x = G.buiaGardeExporter(e);
  assert.deepEqual(G.buiaGardeImporter(JSON.parse(JSON.stringify(x))), e);
  const mauvais = { demandes: [{ id: 'd1', nom: 'a', type: 'modele', modele: '1', saisie: {} }, { id: 'd2', nom: 'b', type: 'libre', saisie: {} }, null, { id: 'd3', nom: 'c', type: 'libre', saisie: { but: 'ok' } }] };
  assert.deepEqual(G.buiaGardeImporter(mauvais).demandes.map((d) => d.nom), ['c']);
});

function tousLesTextes(o, sortie) {
  Object.keys(o).forEach((k) => {
    const v = o[k];
    if (typeof v === 'string') { sortie.push(v); }
    else if (typeof v === 'function') { sortie.push(String(v(3, 'demandes-partagees-2026-11-25.json', 20)), String(v(1, 20)), String(v(20, 5)), String(v(0, 20))); }
    else if (v && typeof v === 'object') { tousLesTextes(v, sortie); }
  });
  return sortie;
}

test('textes du partage : français soigné, pas de tiret long, pas de « on », pas de « facultatif », pas de « prompt », apostrophes typographiques', () => {
  const textes = tousLesTextes(TXT.BUIA_PARTAGE_T, []);
  assert.ok(textes.length > 40);
  textes.forEach((t) => {
    assert.ok(!/[–—]/.test(t), 'tiret long : ' + t);
    assert.ok(!/(^|[^\p{L}])[Oo]n([^\p{L}]|$)/u.test(t), 'mot « on » : ' + t);
    assert.ok(!/facultatif/i.test(t), 'facultatif : ' + t);
    assert.ok(!/prompt/i.test(t), 'prompt : ' + t);
    assert.ok(!/bravo|félicitations/i.test(t), 'félicitations : ' + t);
    assert.ok(!/'/.test(t), 'apostrophe droite : ' + t);
  });
});

test('textes du partage : les garde-fous sont écrits (relire, rien de personnel, jamais la disquette ni le texte collé, texte venu d’une autre personne)', () => {
  const E = TXT.BUIA_PARTAGE_T.envoi, R = TXT.BUIA_PARTAGE_T.reception;
  assert.match(E.intro, /jamais votre disquette/); assert.match(E.intro, /jamais le texte ou le courrier/);
  assert.match(E.verifier.texte, /aucun nom/); assert.match(E.verifier.texte, /ne peut pas le vérifier/);
  assert.match(E.relu, /rien de personnel/);
  assert.match(E.enregistre(2, 'f.json'), /Ce n’est pas votre disquette/); assert.match(E.enregistre(2, 'f.json'), /clé USB/);
  assert.match(R.tiers, /Lisez-le avant de vous en servir/); assert.match(R.tiers, /rien n’est envoyé à un assistant/);
  assert.match(R.erreurs.disquette, /Ouvrir ma disquette/); Object.values(R.erreurs).forEach((t) => assert.match(t, /Rien n’a été changé/));
  assert.match(R.pleine(20), /20 demandes/); assert.match(R.partielle(20, 16), /16 premières/);
  assert.equal(E.choisies(1), '1 demande choisie.'); assert.equal(E.choisies(2), '2 demandes choisies.');
  assert.equal(R.resume(3, 2, 1), '3 demandes lues : 2 sont valides, 1 est écartée.');
  ['modele', 'vide', 'inconnue', 'trop'].forEach((k) => assert.ok(R.raisons[k] && R.raisons[k].length > 10, k));
});

test('interface : cases dans « Mes demandes », bouton de réception dans « Pour les professionnels », étape dans la page sans fenêtre, tout échappé, rien d’enregistré sur l’appareil', () => {
  const ui = lire('modules/bien-utiliser-ia/modelesUi.js'), liste = lire('modules/bien-utiliser-ia/libreUi.js');
  assert.match(ui, /_buiaGHtmlListe\(true\) \+ _buiaPHtmlEnvoi\(\)/);
  assert.match(liste, /data-buia-act="p-coche"/);
  assert.match(ui, /data-buia-act="p-preparer"/); assert.match(ui, /data-buia-act="p-enregistrer"/); assert.match(ui, /data-buia-act="p-choisir"/);
  assert.match(ui, /data-buia-act="p-ajouter"/); assert.match(ui, /data-buia-act="p-annuler"/); assert.match(ui, /data-buia-act="p-relu"/); assert.match(ui, /data-buia-act="p-retour"/);
  assert.match(ui, /if \(act\.indexOf\('p-'\) === 0\) \{ return _buiaPClic\(act, v, el\); \}/);
  assert.match(ui, /racine\.addEventListener\('change', buiaPartageFichierChoisi\)/);
  assert.match(ui, /depli\(R\.titre/, 'la réception est un bloc de la famille « Pour les professionnels »');
  assert.ok(!/ouvrirFenetreERIP|confirmerAction|alert\(/.test(ui.slice(ui.indexOf('Partager ses demandes avec un collègue'), ui.indexOf('function _buiaC2HtmlFamilles'))), 'aucune fenêtre');
  assert.ok(!/localStorage|sessionStorage/.test(ui) && !/localStorage|sessionStorage/.test(liste));
  // le bouton « Enregistrer » ne s'active que si la case « J'ai relu » est cochée, et le fichier n'est écrit que dans ce cas
  assert.match(ui, /p\.relu \? buiaPartageExporter\(_buiaGarde, ids\) : null/);
  // tout ce qui vient d'un fichier reçu est échappé avant d'être affiché
  const fiche = ui.slice(ui.indexOf('function _buiaPHtmlFiche'), ui.indexOf('function _buiaPHtmlEnvoi()'));
  assert.match(fiche, /_buiaEsc\(d\.nom\)/); assert.match(fiche, /_buiaEsc\(l\.texte\)/);
});

test('la disquette et js/app.js ne sont pas touchés : le partage est un fichier à part (aucun appel à la sauvegarde de session)', () => {
  const ui = lire('modules/bien-utiliser-ia/modelesUi.js');
  const bloc = ui.slice(ui.indexOf('Partager ses demandes avec un collègue'), ui.indexOf('function _buiaC2HtmlFamilles'));
  assert.ok(!/sauvegarderSession|exporterSessionFichier|restaurerEtatsModules|importerSessionFichierSelectionne/.test(bloc));
  assert.match(bloc, /telechargerFichierTexte/);
  assert.match(bloc, /buiaPartageNomFichier\(dateFichierFr\(new Date\(\)\)\)/, 'la date du nom de fichier vient de la source unique, en français');
  assert.ok(!/toISOString/.test(bloc), 'jamais de date année-mois-jour');
});

test('sélection : supprimer une demande la retire des demandes à partager, restaurer une disquette décoche tout, état vierge sans sélection', () => {
  assert.match(lire('modules/bien-utiliser-ia/libreUi.js'), /delete _buiaUi\.c2\.partage\.choisies\[v\]/);
  const idx = lire('modules/bien-utiliser-ia/index.js');
  assert.match(idx, /partage: \{ choisies: \{\}, prepa: false, relu: false, msgEnvoi: '', reception: null, msgReception: null \}/);
  assert.match(idx, /p\.choisies = \{\}; p\.prepa = false/);
});

test('style : les nouvelles classes existent et n’introduisent aucune couleur en dur', () => {
  const css = lire('modules/bien-utiliser-ia/bienUtiliserIa.css');
  ['.buia-p-case', '.buia-p-fiche', '.buia-p-relu'].forEach((c) => assert.ok(css.includes(c), c));
  const bloc = css.slice(css.indexOf('/* Partager ses demandes avec un collègue'), css.indexOf('.buia-p-relu {') + 300);
  assert.ok(!/#[0-9a-f]{3,6}\b/i.test(bloc), 'couleur en dur');
});
