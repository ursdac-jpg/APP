// Chemin « Les emplois en demande » du module « Explorer les métiers » (modules/comprendre-les-metiers/recrute.js, consigne 456, 18/11/2026).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const racine = path.join(__dirname, '..');
const lire = (f) => fs.readFileSync(path.join(racine, f), 'utf8');
const recrute = lire('modules/comprendre-les-metiers/recrute.js');
const metiers = lire('data/metiers.js');
const metiersRome = lire('data/metiersRome.js');

// Lit un tableau ou un objet littéral du fichier source (même technique que les autres tests de ce module : pas de navigateur).
function extraire(nom) {
  const debut = recrute.indexOf('var ' + nom + ' =');
  assert.ok(debut >= 0, nom + ' introuvable');
  let i = recrute.indexOf('=', debut) + 1, prof = 0, j = i;
  for (; j < recrute.length; j++) {
    const c = recrute[j];
    if (c === '[' || c === '{') prof++;
    else if (c === ']' || c === '}') { prof--; if (prof === 0) { j++; break; } }
  }
  return new Function('return (' + recrute.slice(i, j) + ');')();
}

const existe = (id) => /^rome_/.test(id) ? metiersRome.includes('"id":"' + id + '"') : new RegExp('id: *["\']' + id + '["\']').test(metiers);

test('toutes les fiches citées par le chemin existent dans la base de l’application', () => {
  const enquete = extraire('CMR_FICHES_ENQUETE'), familles = extraire('CMR_FAMILLES_SAISONNIERS'), commerce = extraire('CMR_FAMILLE_COMMERCE');
  const ids = [].concat(...Object.values(enquete), ...familles.map((f) => f.ids), commerce);
  assert.ok(ids.length > 40);
  ids.forEach((id) => assert.ok(existe(id), 'fiche absente de la base : ' + id));
});

test('chaque métier de l’enquête (les deux départements) a ses fiches, aucune ligne sans bouton', () => {
  const enquete = extraire('CMR_FICHES_ENQUETE');
  const bmo = JSON.parse(lire('modules/comprendre-les-chiffres/donnees/bmo-metiers.json'));
  Object.keys(bmo.departements).forEach((dep) => bmo.departements[dep].metiers.forEach((m) => {
    const nom = m.nom.replace(/’/g, '\'').replace(/^./, (c) => c.toUpperCase());
    assert.ok(enquete[nom] && enquete[nom].length, 'métier de l’enquête sans fiche : ' + nom + ' (' + dep + ')');
  }));
});

test('les familles de métiers saisonniers couvrent la liste commune METIERS_SAISONNIER_ALIMENTAIRE, sauf l’arboriculteur (fiche sans conditions de travail)', () => {
  const liste = new Function(metiers.slice(metiers.indexOf('var METIERS_SAISONNIER_ALIMENTAIRE'), metiers.indexOf('];', metiers.indexOf('var METIERS_SAISONNIER_ALIMENTAIRE')) + 2) + '; return METIERS_SAISONNIER_ALIMENTAIRE;')();
  const familles = [].concat(...extraire('CMR_FAMILLES_SAISONNIERS').map((f) => f.ids));
  liste.filter((id) => id !== 'arboriculteur').forEach((id) => assert.ok(familles.includes(id), 'saisonnier oublié : ' + id));
});

test('le chemin est branché : route, présentation, aide, accueil, page de chargement', () => {
  const index = lire('modules/comprendre-les-metiers/index.js'), app = lire('js/app.js'), html = lire('index.html');
  assert.ok(index.includes("recrute: 'comprendre-les-metiers-intro-recrute'"));
  assert.ok(app.includes("'comprendre-les-metiers-intro-recrute':") && app.includes("AIDE_PAGES['comprendre-les-metiers-intro-recrute']"));
  assert.ok(html.includes('comprendre-les-metiers/recrute.js'));
  assert.ok(index.includes('data-chemin="\' + chemin') || index.includes("'recrute', 'Voir où ça recrute'"));
  assert.ok(/recrute: 'recrute' \};/.test(index), 'Revoir la présentation renvoie à la présentation de ce chemin');
  assert.ok(index.includes("chemin === 'recrute'"));
});

test('la présentation générale parle des quatre chemins, de ce que contient le module, de la façon dont les informations sont présentées et de leurs sources', () => {
  const index = lire('modules/comprendre-les-metiers/index.js');
  ['Quatre chemins', 'Ce que vous trouvez dans ce module', 'Comment les informations sont présentées', 'D’où viennent les informations', 'CMV_NOM_RECRUTE'].forEach((m) => assert.ok(index.includes(m), m));
  assert.ok(index.includes('function cmvPlusDeMetiers()') && index.includes('baseMetiers.length'), 'le nombre de métiers est lu dans la base, jamais écrit en dur');
  assert.ok(!/Des fiches pour \d/.test(index));
  assert.ok(index.includes('ROME') && index.includes('Besoins en main-d’œuvre'));
});

test('les graphiques des employeurs : sur demande, même composant de lecture que « Comprendre les chiffres » (une seule source), juste avant les fiches', () => {
  assert.ok(recrute.includes('_comprendreLesChiffresVuesAssembler(') && recrute.includes('_comprendreLesChiffresBrancherVues()'), 'chiffres, barres, camembert viennent de Comprendre les chiffres');
  assert.ok(recrute.includes("cmvEnregistrerAction('recruteGraphique'") && recrute.includes('Voir les graphiques') && recrute.includes('Masquer les graphiques'));
  assert.ok(recrute.indexOf('_cmrGraphique(c) : \'\'') < recrute.indexOf('Les fiches de ces métiers'), 'le graphique précède les fiches');
  assert.ok(recrute.includes('cmvEtat().cmrGraphique !== false'), 'les graphiques sont affichés d’office, masqués seulement à la demande');
  assert.ok(recrute.includes('aria-expanded'));
});

test('le département vient du choix mémorisé par l’application, jamais redemandé ; hors 24 et 87 un message honnête, rien d’inventé', () => {
  assert.ok(recrute.includes('departementRessourcesMemorise') && recrute.includes('memoriserDepartementRessources') && recrute.includes('oublierDepartementRessources'));
  assert.ok(recrute.includes('ne sont pas encore là pour votre département'));
  assert.ok(recrute.includes('Ce repérage ne couvre que <b>votre département</b>'), 'limite des employeurs dite clairement');
  assert.ok(recrute.includes('Le repérage complet est encore en cours'));
});

test('la demande d’offres est la même fonction que celle de la fiche (une seule source), avec la liste des métiers du département', () => {
  const fiche = lire('modules/comprendre-les-metiers/parMetierFiche.js'), calcul = lire('modules/comprendre-les-metiers/parMetierCalcul.js');
  assert.ok(fiche.includes('function _pmfFormulaireOffres(') && (fiche.match(/_pmfFormulaireOffres\(/g) || []).length >= 3);
  assert.ok(fiche.includes('function pmfBlocOffresRecrute('));
  assert.ok(calcul.includes('dans les métiers suivants'));
});

test('la pastille « surtout saisonnier » n’apparaît que sur les métiers surtout saisonniers (jamais « pas surtout saisonnier »)', () => {
  const ch = lire('modules/comprendre-les-chiffres/index.js');
  assert.ok(!ch.includes('pas surtout saisonnier'));
  assert.ok(ch.includes('surtout saisonnier</span>'));
});

test('les offres : les métiers se cochent, rangés par rubrique (enquête, saisonniers, commerce), avec les noms proches des fiches ; au moins un métier est exigé', () => {
  const fiche = lire('modules/comprendre-les-metiers/parMetierFiche.js');
  assert.ok(recrute.includes('function _cmrGroupesOffres(') && recrute.includes("id: 'saison'") && recrute.includes("id: 'commerce'") && recrute.includes("id: 'enquete'"));
  assert.ok(fiche.includes('function _pmfRecruteChoixHTML(') && fiche.includes('data-pmf="metonglet"') && fiche.includes('data-pmf-sel="metier"'), 'onglets par rubrique');
  assert.ok(fiche.includes('var PMF_MAX_METIERS = 5;') && fiche.includes('_pmfNbCoches() >= PMF_MAX_METIERS'), 'cinq métiers au plus');
  assert.ok(!recrute.includes('defaut: true'), 'rien n’est coché d’office');
  assert.ok(fiche.includes('Cochez d’abord au moins un métier') && fiche.includes('_pmfMetiersCochesOk()'));
  assert.ok(fiche.includes('aussi appelé'));
});

test('suivi d’usage et aides du quatrième chemin : événements sans réponse, aide propre à la page, recherche de l’accueil, retour vers la page d’origine', () => {
  const app = lire('js/app.js'), index = lire('modules/comprendre-les-metiers/index.js'), met = lire('modules/comprendre-les-metiers/parMetier.js'), base = lire('data/baseConnaissancesERIP.js'), fiche = lire('modules/comprendre-les-metiers/parMetierFiche.js');
  assert.ok(recrute.includes("trackEvenement('comprendre_metiers_graphiques_ouverts')") && fiche.includes('comprendre_metiers_offres_preparees'));
  assert.ok(/recrute: 'Aucune question ici/.test(app), 'aide de la page du quatrième chemin');
  assert.ok(base.includes('emplois en demande') && base.includes('metiers saisonniers'), 'recherche de l’accueil');
  assert.ok(met.includes('cmvRevenirAVue(etat.vue)') && index.includes('function cmvRevenirAVue('), 'Lexique et Comprendre les chiffres ramènent à la page d’origine');
  assert.ok(fiche.includes('_cmvVueOrigineFiche'), 'le voyage de fiche en fiche revient à la page d’origine');
});

test('retour de fiche en fiche : une seule piste, chaque étape est une entrée de l’historique (Retour du bas, fil et Précédent du navigateur identiques)', () => {
  const fiche = lire('modules/comprendre-les-metiers/parMetierFiche.js'), index = lire('modules/comprendre-les-metiers/index.js');
  assert.ok(fiche.includes("historiqueInterneEmpiler('fiche-metier'") && fiche.includes("historiqueInterneBrancher('fiche-metier', _pmfRestaurerFiche)"), 'les fiches du voyage ont leur entrée et leur restauration');
  assert.ok(fiche.includes('history.back(); return true;') && fiche.includes('history.go(-recul)'), 'Retour et fil passent par l’historique');
  assert.ok(fiche.includes('function pmfRestaurerVoyage(') && index.includes('pmfRestaurerVoyage(instantane)') && index.includes('function _cmvInstantane('), 'les pages compétence et secteur portent le voyage');
  assert.ok(index.includes("':c' + P.comp.t + P.comp.i"), 'chaque compétence est une page distincte de l’historique');
});

test('textes du chemin : pas de tiret long, pas de « IA », pas de durée, pas de « on »', () => {
  assert.ok(!recrute.includes(String.fromCharCode(8211)) && !recrute.includes(String.fromCharCode(8212)), 'tiret cadratin ou demi-cadratin');
  const textes = recrute.split('\n').filter((l) => !/^\s*(\/\/|\/\*)/.test(l)).join('\n');
  assert.ok(!/\bIA\b/.test(textes), 'le mot IA');
  assert.ok(!/\b\d+ ?(minutes?|min|heures?)\b/i.test(textes), 'durée annoncée');
  assert.ok(!/[«\s’']on (peut|a|sait|doit|attend|va|voit)\b/i.test(textes), 'formule en « on »');
});
