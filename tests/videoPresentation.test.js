const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { VIDEOS_PRESENTATION, VIDEOS_GESTES, htmlVideoPresentation, htmlVideoGeste, fichierVideo, fichierVignette } = require('../modules/video-presentation/videoPresentation.js');

const RACINE = path.join(__dirname, '..');

test('vidéos de présentation : chaque entrée a sa vidéo et sa vignette sur le disque', () => {
  Object.keys(VIDEOS_PRESENTATION).forEach((id) => {
    assert.ok(fs.existsSync(path.join(RACINE, fichierVideo(id))), 'vidéo manquante : ' + id);
    assert.ok(fs.existsSync(path.join(RACINE, fichierVignette(id))), 'vignette manquante : ' + id);
  });
});

test('vidéos de présentation : aucune vidéo du dossier n’est oubliée dans la table', () => {
  const sur_disque = fs.readdirSync(path.join(RACINE, 'videos', 'modules')).filter((f) => f.endsWith('.mp4')).map((f) => f.replace(/\.mp4$/, ''));
  sur_disque.forEach((id) => assert.ok(VIDEOS_PRESENTATION[id], 'vidéo sans entrée dans la table : ' + id));
  assert.equal(Object.keys(VIDEOS_PRESENTATION).length, sur_disque.length);
});

test('vidéos de présentation : le bouton est fermé au départ (aucun lecteur, aucun autoplay)', () => {
  const html = htmlVideoPresentation('chiffres');
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /data-video-presentation="chiffres"/);
  assert.match(html, /<button type="button" class="vp-bouton"/);
  assert.doesNotMatch(html, /<video/);
  assert.doesNotMatch(html, /autoplay/);
});

test('vidéos de présentation : clé inconnue -> rien (jamais de lien mort)', () => {
  assert.equal(htmlVideoPresentation('nexiste-pas'), '');
  assert.equal(htmlVideoPresentation(undefined), '');
});

test('vidéos de présentation : les textes affichés n’ont ni tiret long ni le mot IA', () => {
  const tout = JSON.stringify(VIDEOS_PRESENTATION) + htmlVideoPresentation('lettre');
  assert.doesNotMatch(tout, new RegExp('[' + String.fromCharCode(0x2013, 0x2014) + ']'));
  assert.doesNotMatch(tout, /\bIA\b/);
});

test('petits passages : chaque geste a son fichier vidéo sur le disque', () => {
  Object.keys(VIDEOS_GESTES).forEach((id) => assert.ok(fs.existsSync(path.join(RACINE, VIDEOS_GESTES[id].fichier)), 'vidéo manquante : ' + id));
});

test('petits passages : ligne fermée au départ, sans vignette ni lecture automatique ; clé inconnue -> rien', () => {
  const html = htmlVideoGeste('masquer-texte');
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /data-vp-fichier="videos\/gestes\/masquer-texte\.mp4"/);
  assert.doesNotMatch(html, /<video|<img|autoplay/);
  assert.equal(htmlVideoGeste('nexiste-pas'), '');
  assert.match(htmlVideoGeste('cv-pdf', 'Un autre texte'), /Un autre texte/);
});

test('plus aucun appel à l’ancien mécanisme de vidéos (fenêtre et bouton gris)', () => {
  const cherches = ['js/app.js', 'data/metiers.js', 'modules/cv-editor/apercuDocxIntegre.js', 'modules/collage-reponse/fenetre.js', 'modules/comparer-pistes/index.js'];
  cherches.forEach((f) => {
    const t = fs.readFileSync(path.join(RACINE, f), 'utf8');
    assert.doesNotMatch(t, /htmlDeclencheurDemoVideo\(|ouvrirDemoVideo\(|DEMOS_VIDEO_ERIP\s*=/, f);
  });
});

test('petits passages : chaque vidéo de la table est posée quelque part dans l’application', () => {
  const sources = ['js/app.js', 'data/metiers.js', 'modules/cv-editor/apercuDocxIntegre.js', 'modules/collage-reponse/fenetre.js', 'modules/collage-reponse/logique.js', 'modules/lexique/index.js',
    'modules/reperes/index.js', 'modules/cv-modeles-gardes/modelesGardes.js', 'modules/video-presentation/videoPresentation.js'].map((f) => fs.readFileSync(path.join(RACINE, f), 'utf8')).join('\n');
  Object.keys(VIDEOS_GESTES).forEach((id) => assert.ok(sources.indexOf("'" + id + "'") !== -1, 'vidéo jamais posée : ' + id));
});

test('index.html : les zones des deux panneaux existent (affichage, aide)', () => {
  const html = fs.readFileSync(path.join(RACINE, 'index.html'), 'utf8');
  assert.match(html, /id="zoneVideoAffichage"/);
  assert.match(html, /id="zoneVideoAide"/);
});

test('fenêtre de collage : la vidéo de l’assistant ne s’affiche que pour ChatGPT ou Perplexity, quand l’assistant est ouvert', () => {
  const { modeleFenetreCollage } = require('../modules/collage-reponse/logique.js');
  assert.equal(modeleFenetreCollage({ etat: 'ouvert', nomAssistant: 'ChatGPT' }).videoAssistant, 'chatgpt-demande');
  assert.equal(modeleFenetreCollage({ etat: 'ouvert', nomAssistant: 'Perplexity' }).videoAssistant, 'perplexity-demande');
  assert.equal(modeleFenetreCollage({ etat: 'ouvert', nomAssistant: 'Gemini' }).videoAssistant, '');
  assert.equal(modeleFenetreCollage({ etat: 'pret', nomAssistant: 'ChatGPT' }).videoAssistant, '');
  assert.ok(VIDEOS_GESTES['chatgpt-demande'] && VIDEOS_GESTES['perplexity-demande']);
});
