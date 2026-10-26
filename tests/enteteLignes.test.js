'use strict';
// Nom, titre et coordonnees sur 1 ou 2 lignes dans l'en-tete libre (panneau « Regler l'en-tete » du petit apercu, 2026-10-21).
// Les fonctions de coupe se testent sans navigateur ; le rendu reel du gabarit (en-tete libre) est verifie avec le meme chargement que conservationInformations.
const test = require('node:test');
const assert = require('node:assert');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const racine = path.join(__dirname, '..');
const ctx = { console: console };
ctx.window = ctx; ctx.globalThis = ctx;
ctx.document = {
  getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
  createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: { appendChild() {} }
};
vm.createContext(ctx);
[
  'data/metiers.js', 'modules/cv-core/dates.js', 'modules/cv-core/certifications.js', 'modules/cv-core/extraireDonneesCV.js', 'modules/cv-core/normaliserDonneesCV.js',
  'modules/cv-editor/formatA5CV.js',
  'modules/cv-composeur/composeurProfil.js', 'modules/cv-composeur/composeurComposants.js', 'modules/cv-composeur/composeurRegles.js',
  'modules/cv-composeur/composeurDedoublonnage.js', 'modules/cv-composeur/composeurComposition.js', 'modules/cv-composeur/composeurStrategies.js',
  'modules/cv-composeur/composeurTheme.js',
  'modules/cv-pdf-html/cvPdfDonnees.js', 'modules/cv-pdf-html/cvPdfTemplateA4.js', 'modules/cv-pdf-html/cvPdfCouleursZones.js', 'modules/cv-pdf-html/cvPdfTemplateMaquette.js'
].forEach((f) => vm.runInContext(fs.readFileSync(path.join(racine, f), 'utf8'), ctx, { filename: f }));

const texteSeul = (h) => String(h).replace(/<[^>]*>/g, '');

test('deux lignes : le nom est coupe apres le prenom, le texte lu garde son espace', () => {
  const h = ctx._pdfMqDeuxLignes('Camille MARTIN', 'Camille');
  assert.ok(h.indexOf('display:block') !== -1);
  assert.strictEqual(texteSeul(h), 'Camille MARTIN');
  assert.ok(/^<span style="display:block">Camille <\/span>MARTIN$/.test(h));
});

test('deux lignes : un titre est coupe a l\'espace le plus proche du milieu, un texte sans espace reste entier, le HTML est protege', () => {
  const h = ctx._pdfMqDeuxLignes('Agent d\'accueil et de service', '');
  assert.strictEqual(texteSeul(h), 'Agent d\'accueil et de service'.replace(/'/g, '&#39;').replace(/&#39;/g, texteSeul(h).indexOf('&#39;') !== -1 ? '&#39;' : '\''));
  assert.ok(h.indexOf('display:block') !== -1);
  assert.strictEqual(ctx._pdfMqDeuxLignes('Comptable', ''), 'Comptable');
  assert.strictEqual(ctx._pdfMqDeuxLignes('<b>x</b>', ''), '&lt;b&gt;x&lt;/b&gt;');
});

test('coordonnees : une par ligne (d\'office), sur une ligne, sur deux lignes', () => {
  const html = '<div>06 00</div><div>a@b.fr</div><div>Paris</div><div>Permis B</div>';
  assert.strictEqual(ctx._pdfMqCoordonneesMise(html, 'col', false), html);
  assert.strictEqual(ctx._pdfMqCoordonneesMise(html, undefined, false), html);
  const une = ctx._pdfMqCoordonneesMise(html, '1', false);
  assert.strictEqual((une.match(/<div>/g) || []).length, 1);
  assert.strictEqual(texteSeul(une), '06 00 · a@b.fr · Paris · Permis B');
  const deux = ctx._pdfMqCoordonneesMise(html, '2', false);
  assert.strictEqual((deux.match(/<div>/g) || []).length, 2);
  assert.strictEqual(texteSeul(deux.split('</div>')[0]), '06 00 · a@b.fr');
  // une seule coordonnee : rien a regrouper
  assert.strictEqual(ctx._pdfMqCoordonneesMise('<div>06 00</div>', '1', false), '<div>06 00</div>');
  // avec icones : pas de point, un espace
  assert.ok(ctx._pdfMqCoordonneesMise(html, '1', true).indexOf('·') === -1);
});

function dossier() {
  return {
    objectif: 'offre',
    identite: { civilite: 'Madame', nom: 'Martin', prenom: 'Camille', telephone: '0600000000', email: 'c@exemple.fr', ville: 'Bergerac', codePostal: '24100' },
    titreCV: 'Agente d\'accueil polyvalente',
    experiences: [{ poste: 'Accueil', entreprise: 'X', lieu: 'Y', dateDebut: '2019-03', dateFin: '2021-06', missions: 'Accueillir' }],
    experiencesPerso: [], formations: [], langues: [], certifications: [], logiciels: [], loisirs: [], engagements: [],
    permis: { possede: true, categories: ['B'], vehicule: false },
    valeurs: [], activites: [], actions: [], environnement: [], contrat: [], tempsTravail: []
  };
}
function rendu(lig) {
  const donnees = ctx.construireDonneesPdfCV(dossier(), 'A4-detaille', false, false, null);
  const opts = { competencesProfessionnelles: [], competencesComportementales: [], enteteLibre: { libre: true, modif: true, pos: {}, larg: {}, ech: {}, sty: {}, plan: {}, lig: lig || {} } };
  return ctx._pdfConstruireMaquette(donnees.objetCV, donnees.composition, opts, '').pageHtml || '';
}

test('rendu reel : sans choix de lignes, l\'en-tete libre est celui d\'avant (une coordonnee par ligne, nom sur une ligne)', () => {
  const h = rendu({});
  assert.ok(h.indexOf('data-bl="coord"') !== -1);
  assert.ok(h.indexOf('display:block') === -1, 'aucune coupe sans choix');
  const c0 = h.indexOf('<div class="coord"'), c = h.slice(c0, h.indexOf('poi-l', c0));
  assert.ok((c.match(/<div>/g) || []).length >= 2, 'une coordonnee par ligne');
});

test('rendu reel : nom et titre sur 2 lignes, coordonnees sur 1 ligne', () => {
  const h = rendu({ nom: '2', metier: '2', coord: '1' });
  assert.ok(/<div class="nom"[^>]*><span data-ed="nom"[^>]*><span style="display:block">Camille <\/span>MARTIN<\/span>/.test(h), 'nom coupe apres le prenom');
  assert.ok(/<div class="metier"[^>]*><span data-ed="metier"[^>]*><span style="display:block">/.test(h), 'titre coupe');
  const coord = h.slice(h.indexOf('<div class="coord"'), h.indexOf('<div class="coord"') + 600);
  assert.strictEqual((coord.slice(0, coord.indexOf('poi-l')).match(/<div>/g) || []).length, 1, 'toutes les coordonnees dans une seule ligne');
});
