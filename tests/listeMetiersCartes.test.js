// Liste « Métiers qui pourraient vous intéresser » (consignes 402 et 409, maquette validée le 16/11/2026).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { rechercherMetiers } = require('../data/metiers.js');

const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');

test('le classement dit CE QUI se recoupe, par catégorie, sans changer le score', () => {
  const r = rechercherMetiers({ actions: ['cuisiner', 'servir'], activites: ['clients', 'collegues'] }, 5);
  assert.ok(r.length > 0, 'des métiers ressortent');
  r.forEach((m) => {
    assert.ok(m.communes && typeof m.communes === 'object', m.nom + ' : champ communes absent');
    ['activites', 'actions', 'savoirFaire', 'savoirEtre', 'savoirs', 'environnement'].forEach((cle) => {
      assert.ok(Array.isArray(m.communes[cle]), m.nom + ' : communes.' + cle + ' doit être une liste');
    });
  });
  assert.ok(r.some((m) => m.communes.actions.length > 0), 'au moins un métier partage une action choisie');
});

test('les raisons affichées portent leurs accents', () => {
  const r = rechercherMetiers({ savoirEtre: ['Relation client', 'Écoute'], environnement: ['bureau'] }, 10);
  const toutes = [].concat(...r.map((m) => m.raisons));
  assert.ok(!toutes.some((t) => /Savoir-etre|souhaite :|partagee :/.test(t)), 'aucune raison sans accent');
});

test('la carte de métier : nom jamais cliquable, rubriques dans la carte, trois boutons égaux', () => {
  assert.match(app, /<p class="metier-carte-nom">/, 'le nom est un simple titre');
  assert.ok(!/class="metier-carte-nom"[^>]*(onclick|href|data-metier-cible)/.test(app), 'le nom ne porte aucune action');
  assert.match(app, /Secteur : /, 'le secteur est annoncé comme tel');
  assert.match(app, /data-mc-act="a"/);
  assert.match(app, /data-mc-act="b"/);
  assert.match(app, /metier-carte-actions3/);
  assert.match(css, /\.metier-carte-actions3 > \.btn/, 'les trois boutons ont le même gabarit');
  assert.match(css, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/, 'grille de deux colonnes égales');
});

test('la sous-section « Pourquoi ces métiers ? » a disparu et les métiers saisonniers sont renommés', () => {
  assert.ok(!/id: 'pourquoi', titre: 'Pourquoi ces métiers/.test(app), 'son contenu est dans chaque carte');
  assert.match(app, /titre: 'Métiers saisonniers et alimentaires'/);
  assert.ok(!/titre: 'Jobs saisonniers/.test(app), 'plus de « Jobs »');
});

test('le module « Explorer les métiers » est ouvert au public depuis le 19/11/2026 (décision de Denis) : un seul interrupteur, CMV_OUVERT', () => {
  const mod = fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-les-metiers', 'index.js'), 'utf8');
  assert.match(mod, /var CMV_OUVERT = true;/, 'interrupteur public ouvert');
  assert.match(mod, /var CMV_PONT_CHIFFRES_OUVERT = true;/, 'pont des chiffres ouvert depuis la phase 5, mais derrière l’interrupteur du module (rien de public)');
  assert.ok(mod.includes('^(localhost|127') && mod.includes('location.hostname'), 'repli : ouvert sur localhost même si l’interrupteur repasse à false');
  assert.match(mod, /function pageComprendreLesMetiers\(\) \{ if \(!cmvOuvert\(\)\)/, 'la page se referme si l’interrupteur repasse à false');
  assert.match(mod, /function pageIntroComprendreLesMetiers\(\) \{\s+if \(!cmvOuvert\(\)\)/, 'la présentation se referme si l’interrupteur repasse à false');
  assert.ok(!/MODULE_COMPRENDRE_METIERS_OUVERT/.test(app), 'plus d’interrupteur en double dans js/app.js');
  assert.match(app, /if \(!_cmModuleOuvert\(\) \|\| \(type === 'bmo' && !CMV_PONT_CHIFFRES_OUVERT\)\) \{ return ''; \}/);
});

test('le style de la liste n’utilise aucune couleur en dur (mode sombre)', () => {
  const debut = css.indexOf('/* Liste « Métiers qui pourraient vous intéresser »');
  const fin = css.indexOf('.riasec-lettres', debut);
  const bloc = css.slice(debut, fin);
  const sans = bloc.replace(/color: #fff;/g, '');
  assert.ok(!/#[0-9a-fA-F]{3,6}\b/.test(sans), 'couleurs en dur trouvées : ' + (sans.match(/#[0-9a-fA-F]{3,6}\b/g) || []).join(', '));
});

test('écran Candidater : les choix du CV sont sous la carte « Mon CV », sans troisième bloc (consigne 413)', () => {
  const debut = app.indexOf('function pageCandidaterNouvelle()');
  const fin = app.indexOf('function _candMajNouveau()');
  const code = app.slice(debut, fin);
  assert.ok(!/candPil3|preparer-num">3</.test(code), 'plus de troisième bloc ni de pastille 3');
  assert.match(code, /corps1 \+= '<p class="mt-3 mb-2"><strong>Avez-vous déjà un CV \?<\/strong>/, 'la question est dans le premier bloc');
  const etat = app.slice(app.indexOf('function _candEtatNouveau()'), app.indexOf('function _candCartesHtml('));
  assert.match(etat, /var ok1 = !!p && \(estCv \? ok3 : !!rg\.maniere\);/, 'le premier bloc n’est complété que lorsque les questions du CV ont leur réponse');
});
