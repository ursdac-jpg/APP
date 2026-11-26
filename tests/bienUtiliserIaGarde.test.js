// Module « Bien utiliser l'IA », commit 6 : « Mes demandes », ce que la personne garde sur sa disquette (gardeLogique.js).
// Aller-retour export puis import, limites, revérification de tout ce qui revient d'un fichier, et jamais de texte à traiter ni de courrier.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const B = require('../modules/bien-utiliser-ia/blocs.js');
const L = require('../modules/bien-utiliser-ia/libreLogique.js');
const M = require('../modules/bien-utiliser-ia/modeleLogique.js');
const G = require('../modules/bien-utiliser-ia/gardeLogique.js');

const blocs = B.buiaLireBlocs(fs.readFileSync(path.join(__dirname, '..', B.BUIA_FICHIER_BLOCS), 'utf8')).blocs;
const blocs4 = B.buiaLireBlocs(fs.readFileSync(path.join(__dirname, '..', M.buiaDefModele(4).fichier), 'utf8')).blocs;
const jour = new Date(2026, 10, 24, 10, 0, 0);
const libre = (o) => Object.assign(L.buiaLibreSaisieVide(), { but: 'écrire un mot pour l’école', situation: 'mon fils est absent jeudi' }, o || {});
const modele = (o) => { const s = M.buiaSaisieParDefaut(4); s.champs.situation = 'Je ne comprends pas ce courrier'; s.champs.courrier = 'Courrier avec mon adresse et mon numéro 0612345678'; return Object.assign(s, o || {}); };

test('état vide : rien à exporter, aucun travail à sauvegarder', () => {
  assert.equal(G.buiaGardeNombre(G.buiaGardeVide()), 0);
  assert.equal(G.buiaGardeExporter(G.buiaGardeVide()), null);
  assert.equal(G.buiaGardeExporter(null), null);
  assert.equal(G.buiaGardeExporter(undefined), null);
  assert.deepEqual(G.buiaGardeImporter(null), G.buiaGardeVide());
  assert.deepEqual(G.buiaGardeImporter('texte'), G.buiaGardeVide());
  assert.deepEqual(G.buiaGardeImporter({ demandes: 'x' }), G.buiaGardeVide());
});

test('garder une demande libre : nom nettoyé, identifiant, rien d’autre', () => {
  const r = G.buiaGardeAjouterLibre(G.buiaGardeVide(), '  Mot   pour l’école  ', libre());
  assert.equal(r.remplace, false); assert.equal(r.id, 'd1');
  assert.equal(r.etat.demandes.length, 1);
  const d = r.etat.demandes[0];
  assert.equal(d.nom, 'Mot pour l’école'); assert.equal(d.type, 'libre'); assert.equal(d.saisie.but, 'écrire un mot pour l’école');
  assert.equal(G.buiaGardeTrouver(r.etat, 'd1').nom, 'Mot pour l’école');
  assert.equal(G.buiaGardeTrouver(r.etat, 'd9'), null);
});

test('nom vide : « Ma demande » ; nom trop long : coupé à 60 caractères', () => {
  assert.equal(G.buiaGardeNom(''), 'Ma demande'); assert.equal(G.buiaGardeNom(null), 'Ma demande'); assert.equal(G.buiaGardeNom('   '), 'Ma demande');
  assert.equal(G.buiaGardeNom('x'.repeat(200)).length, 60);
});

test('jamais le texte à traiter ni le courrier sur la disquette', () => {
  const r1 = G.buiaGardeAjouterLibre(G.buiaGardeVide(), 'a', libre({ texte: 'Mon adresse : 12 rue des Lilas' }));
  assert.equal(r1.etat.demandes[0].saisie.texte, '');
  const r2 = G.buiaGardeAjouterModele(r1.etat, 'b', 4, modele());
  const d = r2.etat.demandes[1];
  assert.equal(d.saisie.champs.courrier, ''); assert.equal(d.saisie.champs.situation, 'Je ne comprends pas ce courrier');
  const brut = JSON.stringify(G.buiaGardeExporter(r2.etat));
  assert.ok(!brut.includes('rue des Lilas') && !brut.includes('0612345678'));
});

test('une demande vide ou un modèle inconnu est refusé', () => {
  assert.equal(G.buiaGardeAjouterLibre(G.buiaGardeVide(), 'x', L.buiaLibreSaisieVide()).refuse, 'vide');
  assert.equal(G.buiaGardeAjouterLibre(G.buiaGardeVide(), 'x', libre({ but: '', situation: '', texte: 'seulement un texte' })).refuse, 'vide');
  assert.equal(G.buiaGardeAjouterModele(G.buiaGardeVide(), 'x', 99, modele()).refuse, 'modele');
  assert.equal(G.buiaGardeAjouterModele(G.buiaGardeVide(), 'x', 999, modele()).refuse, 'modele');
  assert.equal(G.buiaGardeNombre(G.buiaGardeAjouterLibre(G.buiaGardeVide(), 'x', L.buiaLibreSaisieVide()).etat), 0);
});

test('le même nom (majuscules ignorées) remplace la demande, sans doublon ni nouvel identifiant', () => {
  let e = G.buiaGardeAjouterLibre(G.buiaGardeVide(), 'Mot école', libre()).etat;
  const r = G.buiaGardeAjouterLibre(e, 'MOT ÉCOLE'.toLowerCase().replace('é', 'é'), libre({ but: 'un autre but' }));
  assert.equal(r.remplace, true); assert.equal(r.id, 'd1'); assert.equal(r.etat.demandes.length, 1);
  assert.equal(r.etat.demandes[0].saisie.but, 'un autre but');
  const r2 = G.buiaGardeAjouterLibre(r.etat, 'Mot école différent', libre());
  assert.equal(r2.remplace, false); assert.equal(r2.id, 'd2');
});

test('supprimer une demande ; les identifiants ne sont jamais réutilisés tant qu’il en reste de plus grands', () => {
  let e = G.buiaGardeVide();
  ['a', 'b', 'c'].forEach((n) => { e = G.buiaGardeAjouterLibre(e, n, libre()).etat; });
  e = G.buiaGardeSupprimer(e, 'd2');
  assert.deepEqual(e.demandes.map((d) => d.id), ['d1', 'd3']);
  assert.equal(G.buiaGardeAjouterLibre(e, 'd', libre()).id, 'd4');
  assert.equal(G.buiaGardeSupprimer(e, 'inconnu').demandes.length, 2);
});

test('limite de 20 demandes : la 21e est refusée, mais on peut remplacer une demande existante', () => {
  let e = G.buiaGardeVide();
  for (let i = 1; i <= G.BUIA_GARDE_MAX; i++) { e = G.buiaGardeAjouterLibre(e, 'demande ' + i, libre()).etat; }
  assert.equal(e.demandes.length, 20);
  const r = G.buiaGardeAjouterLibre(e, 'une de trop', libre());
  assert.equal(r.refuse, 'plein'); assert.equal(r.etat.demandes.length, 20);
  assert.equal(G.buiaGardeAjouterLibre(e, 'demande 3', libre({ but: 'changé' })).remplace, true);
});

test('ALLER-RETOUR : ce qui part sur la disquette revient à l’identique, et l’assemblage donne le même texte', () => {
  let e = G.buiaGardeAjouterLibre(G.buiaGardeVide(), 'Mot école', libre({ longueur: 'court', langage: 'soigne', exemple: 'Bonjour Madame.', interrupteurs: { inventer: true, juridique: true, suppose: false, questions: true } })).etat;
  e = G.buiaGardeAjouterLibre(e, 'Avec précision', L.buiaLibreAjouter(libre(), 'but', 'un but plus net')).etat;
  const s4 = modele(); s4.choix.longueur = 'court'; s4.choix.droits = 'oui';
  e = G.buiaGardeAjouterModele(e, 'Courrier de la caisse', 4, s4).etat;
  const exporte = G.buiaGardeExporter(e);
  assert.equal(exporte.version, 1);
  const fichier = JSON.parse(JSON.stringify(exporte));          // ce qui passe par le fichier de disquette
  const retour = G.buiaGardeImporter(fichier);
  assert.deepEqual(retour, e);
  assert.deepEqual(G.buiaGardeExporter(retour), exporte);
  // la demande libre revenue donne exactement le même texte qu'avant
  [['plus', 0], ['bases', 0], ['bases', 1]].forEach(([niveau, i]) => {
    const avant = L.buiaLibreAssembler(blocs, e.demandes[i].saisie, { aujourdhui: jour, niveau }).texte;
    const apres = L.buiaLibreAssembler(blocs, retour.demandes[i].saisie, { aujourdhui: jour, niveau }).texte;
    assert.equal(apres, avant);
  });
  // la demande modèle revenue : mêmes choix, courrier à recoller
  const m = retour.demandes[2];
  assert.equal(m.type, 'modele'); assert.equal(m.modele, 4); assert.equal(m.saisie.choix.longueur, 'court'); assert.equal(m.saisie.choix.droits, 'oui'); assert.equal(m.saisie.champs.courrier, '');
  const r = M.buiaAssemblerModele(4, blocs4, m.saisie, { aujourdhui: jour, alerte: null, reprise: false });
  assert.equal(r.aCompleter, true); assert.deepEqual(r.manque, ['le courrier']);
});

test('un fichier abîmé ou malveillant est nettoyé : types, balises, identifiants, modèles, champs inconnus', () => {
  const brut = { version: 99, demandes: [
    null, 5, 'x', [], { type: 'inconnu', nom: 'a' },
    { id: 'd7', nom: '<img src=x onerror=alert(1)>', type: 'libre', saisie: { but: 'ok', situation: 'ok', texte: 'secret', longueur: 'énorme', pirate: 'oui', ajouts: [{ id: 'but', valeur: '' }, { id: 'inconnue', valeur: 'x' }] } },
    { id: 'd7', nom: 'doublon d’identifiant', type: 'libre', saisie: { but: 'deux' } },
    { id: '../../x', nom: 123, type: 'libre', saisie: { situation: 'trois' } },
    { id: 'd9', nom: 'sans rien', type: 'libre', saisie: { but: '  ', situation: '' } },
    { id: 'd10', nom: 'modèle absent', type: 'modele', modele: 99, saisie: {} },
    { id: 'd11', nom: 'modèle texte', type: 'modele', modele: '4', saisie: {} },
    { id: 'd12', nom: 'modèle 4', type: 'modele', modele: 4, saisie: { champs: { situation: 'sit', courrier: 'secret', inconnu: 'x' }, choix: { longueur: 'énorme', droits: 'oui' } } }
  ] };
  const e = G.buiaGardeImporter(brut);
  assert.equal(e.demandes.length, 4);
  const ids = e.demandes.map((d) => d.id);
  assert.equal(new Set(ids).size, ids.length, 'identifiants uniques');
  ids.forEach((id) => assert.match(id, /^d\d+$/));
  assert.equal(e.demandes[0].saisie.texte, ''); assert.equal(e.demandes[0].saisie.longueur, 'moyen'); assert.equal(e.demandes[0].saisie.pirate, undefined); assert.deepEqual(e.demandes[0].saisie.ajouts, []);
  assert.equal(e.demandes[0].nom, '<img src=x onerror=alert(1)>', 'le nom reste du texte : c’est l’affichage qui l’échappe');
  assert.equal(e.demandes[2].nom, 'Ma demande');
  const m = e.demandes[3];
  assert.equal(m.saisie.champs.courrier, ''); assert.equal(m.saisie.champs.inconnu, undefined); assert.equal(m.saisie.choix.longueur, 'moyen'); assert.equal(m.saisie.choix.droits, 'oui');
});

test('un fichier trop long est coupé à 20 demandes', () => {
  const demandes = []; for (let i = 1; i <= 50; i++) { demandes.push({ id: 'd' + i, nom: 'n' + i, type: 'libre', saisie: { but: 'x' } }); }
  assert.equal(G.buiaGardeImporter({ demandes }).demandes.length, 20);
});

test('l’import ne modifie jamais l’objet reçu et l’export est une copie indépendante', () => {
  const brut = { demandes: [{ id: 'd1', nom: 'a', type: 'libre', saisie: { but: 'x', texte: 'garde-moi' } }] };
  const copie = JSON.parse(JSON.stringify(brut));
  G.buiaGardeImporter(brut);
  assert.deepEqual(brut, copie);
  const e = G.buiaGardeAjouterLibre(G.buiaGardeVide(), 'a', libre()).etat;
  const x = G.buiaGardeExporter(e); x.demandes[0].nom = 'modifié';
  assert.equal(e.demandes[0].nom, 'a');
});

test('le contrat de la disquette est branché dans js/app.js, comme pour « Ce qui compte pour moi »', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  assert.match(app, /bienUtiliserIa: typeof buiaExporterEtatPourSauvegarde/);
  assert.match(app, /buiaRestaurerEtatDepuisSauvegarde\(modulesEtat\.bienUtiliserIa/);
});
