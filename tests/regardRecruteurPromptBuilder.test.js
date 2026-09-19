const { test } = require('node:test');
const assert = require('node:assert/strict');

// Module autonome : pas de _domStub, pas de js/app.js.
const {
  regardRecruteurConstruirePrompt,
  regardRecruteurConstruireValeursPlaceholders,
  REGARD_RECRUTEUR_PROMPT_DEFAUT
} = require('../modules/regard-recruteur/promptBuilder.js');

// Le vrai template du depot, pour verifier que tous ses {CLE} sont resolus.
const fs = require('node:fs');
const path = require('node:path');
const TEMPLATE_REEL = fs.readFileSync(path.join(__dirname, '..', 'prompts', 'regard-recruteur.md'), 'utf8');

test('valeurs : mode image -> CV_TEXTE explique que les images sont jointes, SITE=non par defaut', () => {
  const v = regardRecruteurConstruireValeursPlaceholders({ modeAnalyse: 'image' });
  assert.equal(v.MODE_ANALYSE, 'image');
  assert.match(v.CV_TEXTE, /Mode image/);
  assert.equal(v.SITE_ENTREPRISE_FOURNI, 'non');
  assert.match(v.COULEURS_ENTREPRISE, /Sans objet/);
  assert.equal(v.POSTE_VISE, 'Non fourni.');
});

test('valeurs : mode texte -> CV_TEXTE porte le texte colle', () => {
  const v = regardRecruteurConstruireValeursPlaceholders({ modeAnalyse: 'texte', cvTexte: '  Agent d accueil, 3 ans  ' });
  assert.equal(v.MODE_ANALYSE, 'texte');
  assert.equal(v.CV_TEXTE, 'Agent d accueil, 3 ans');
});

test('valeurs : mode texte sans texte -> marqueur clair, jamais un placeholder vide', () => {
  const v = regardRecruteurConstruireValeursPlaceholders({ modeAnalyse: 'texte', cvTexte: '' });
  assert.match(v.CV_TEXTE, /Aucun texte/);
});

test('valeurs : un site fourni bascule SITE_ENTREPRISE_FOURNI a oui', () => {
  const v = regardRecruteurConstruireValeursPlaceholders({ modeAnalyse: 'image', siteEntreprise: 'https://exemple.fr' });
  assert.equal(v.SITE_ENTREPRISE_FOURNI, 'oui');
  assert.match(v.COULEURS_ENTREPRISE, /a observer sur le site/i);
});

test('valeurs : site + couleurs connues -> COULEURS_ENTREPRISE porte les couleurs', () => {
  const v = regardRecruteurConstruireValeursPlaceholders({ modeAnalyse: 'image', siteEntreprise: 'https://exemple.fr', couleursEntreprise: 'bleu marine et gris' });
  assert.equal(v.COULEURS_ENTREPRISE, 'bleu marine et gris');
});

test('valeurs : couleurs ignorees si aucun site (le CV ne contient que le nom)', () => {
  const v = regardRecruteurConstruireValeursPlaceholders({ modeAnalyse: 'image', couleursEntreprise: 'bleu' });
  assert.equal(v.SITE_ENTREPRISE_FOURNI, 'non');
  assert.match(v.COULEURS_ENTREPRISE, /Sans objet/);
});

test('valeurs : contexte complet passe tel quel', () => {
  const v = regardRecruteurConstruireValeursPlaceholders({
    modeAnalyse: 'image',
    posteVise: 'Agent d accueil', entreprise: 'Mairie de Bergerac',
    offre: "Texte de l'offre...", typeStructure: 'Fonction publique territoriale'
  });
  assert.equal(v.POSTE_VISE, 'Agent d accueil');
  assert.equal(v.ENTREPRISE, 'Mairie de Bergerac');
  assert.equal(v.OFFRE, "Texte de l'offre...");
  assert.equal(v.TYPE_STRUCTURE, 'Fonction publique territoriale');
});

test('construire : le template reel du depot est entierement resolu (aucun {CLE} restant)', () => {
  const r = regardRecruteurConstruirePrompt(
    { modeAnalyse: 'image', posteVise: 'Vendeur', siteEntreprise: 'https://x.fr' },
    { template: TEMPLATE_REEL }
  );
  assert.deepEqual(r.placeholdersNonResolus, []);
  assert.equal(/\{[A-Z_]+\}/.test(r.texte), false);
  assert.match(r.texte, /Mode d'analyse :\*\* image/);
  assert.match(r.texte, /Site internet de l'entreprise fourni :\*\* oui/);
});

test('construire : sans template -> repli embarque, resolu lui aussi', () => {
  const r = regardRecruteurConstruirePrompt({ modeAnalyse: 'texte', cvTexte: 'CV court' }, {});
  assert.deepEqual(r.placeholdersNonResolus, []);
  assert.equal(/\{[A-Z_]+\}/.test(r.texte), false);
  assert.match(r.texte, /REGLES ABSOLUES/);
  assert.match(r.texte, /CV court/);
  assert.equal(r.modeAnalyse, 'texte');
});

test('construire : le repli embarque ne contient aucun tiret long', () => {
  assert.equal(/[—–]/.test(REGARD_RECRUTEUR_PROMPT_DEFAUT), false);
});

test('construire : resolveur injecte utilise (compat bilanResoudrePlaceholders)', () => {
  let recu = null;
  const faux = (tpl, val) => { recu = val; return { texte: 'OK', placeholdersNonResolus: [] }; };
  const r = regardRecruteurConstruirePrompt({ modeAnalyse: 'image' }, { template: 'x {MODE_ANALYSE}', resoudrePlaceholders: faux });
  assert.equal(r.texte, 'OK');
  assert.equal(recu.MODE_ANALYSE, 'image');
});
