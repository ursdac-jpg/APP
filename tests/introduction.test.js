// Page « Introduction » : logique pure (modules/introduction/logique.js), images, branchements (bouton, route, aide, recherche) et règles de texte.
// L'interface (modules/introduction/index.js) n'est pas chargée par les tests Node : son rendu est vérifié dans le navigateur.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const L = require('../modules/introduction/logique.js');

const RACINE = path.join(__dirname, '..');
const lire = (f) => fs.readFileSync(path.join(RACINE, f), 'utf8');

test('introEstOuverte : suit mtOuvert(), fermée si la fonction manque ou plante', () => {
  assert.strictEqual(L.introEstOuverte(() => true), true);
  assert.strictEqual(L.introEstOuverte(() => false), false);
  assert.strictEqual(L.introEstOuverte(null), false);
  assert.strictEqual(L.introEstOuverte(() => { throw new Error('x'); }), false);
});

test('introFiltrerParOuverture : Qui fait quoi et Employeurs disparaissent tant que leurs tuiles sont absentes', () => {
  const fermes = ['Comprendre le cadre', 'Comprendre les chiffres', 'Mes Repères'];
  const lignes = L.introFiltrerParOuverture(L.INTRO_OUTILS_TERRITOIRE, fermes).map((o) => o.libelle);
  assert.deepStrictEqual(lignes, ['Comprendre le cadre', 'Comprendre les chiffres']);
  const images = L.introFiltrerParOuverture(L.INTRO_IMAGES_TERRITOIRE, fermes).map((o) => o.libelle);
  assert.deepStrictEqual(images, ['Comprendre les chiffres']);
  const ouverts = fermes.concat(['Qui fait quoi', 'Employeurs près de chez moi']);
  assert.strictEqual(L.introFiltrerParOuverture(L.INTRO_OUTILS_TERRITOIRE, ouverts).length, 4);
  assert.strictEqual(L.introFiltrerParOuverture(L.INTRO_IMAGES_TERRITOIRE, ouverts).length, 2);
  assert.deepStrictEqual(L.introFiltrerParOuverture(null, null), []);
});

test('introPhraseModeles : le total est la somme, jamais un chiffre faux quand une liste manque', () => {
  assert.strictEqual(L.introPhraseModeles(13, 26), '<strong>39 modèles</strong> : 13 sobres et 26 créatifs');
  assert.ok(/de nombreux modèles/.test(L.introPhraseModeles(0, 26)));
  assert.ok(/de nombreux modèles/.test(L.introPhraseModeles(undefined, undefined)));
});

test('les 19 images de la page et du diaporama existent dans images/introduction/, et le dossier ne contient rien d’autre', () => {
  assert.strictEqual(L.INTRO_IMAGES.length, 19);
  L.INTRO_IMAGES.forEach((n) => { assert.ok(fs.existsSync(path.join(RACINE, 'images', 'introduction', n + '.png')), 'image manquante : ' + n); });
  const presentes = fs.readdirSync(path.join(RACINE, 'images', 'introduction')).map((f) => f.replace(/\.png$/, '')).sort();
  assert.deepStrictEqual(presentes, L.INTRO_IMAGES.slice().sort());
});

test('toutes les images citées dans la page sont déclarées dans INTRO_IMAGES', () => {
  const src = lire('modules/introduction/index.js') + lire('modules/introduction/logique.js') + lire('modules/introduction/diaporama.js');
  const citees = new Set();
  (src.match(/'(accueil|accueil_bas|modeles_creatifs|modele_grand|modeles_sobres|i_[a-z0-9_]+)'/g) || []).forEach((m) => citees.add(m.replace(/'/g, '')));
  citees.forEach((n) => { assert.ok(L.INTRO_IMAGES.indexOf(n) !== -1, 'image non déclarée : ' + n); });
  L.INTRO_IMAGES.forEach((n) => { assert.ok(citees.has(n), 'image déclarée mais jamais affichée : ' + n); });
});

test('branchements : bouton caché au départ, scripts avant app.js, route, aide, aide de l’accueil, recherche', () => {
  const html = lire('index.html');
  assert.ok(/<button[^>]*id="btnIntroduction"[^>]*\shidden[\s>]/.test(html), 'le bouton existe et est caché au départ');
  assert.ok(html.indexOf('modules/introduction/logique.js') < html.indexOf('modules/introduction/index.js'), 'logique avant interface');
  assert.ok(html.indexOf('modules/introduction/index.js') < html.indexOf('<script src="js/app.js"'), 'interface avant app.js');
  assert.ok(html.indexOf('modules/mon-territoire/logique.js') < html.indexOf('modules/introduction/index.js'), 'mtOuvert chargé avant');
  const app = lire('js/app.js');
  assert.ok(/'introduction':\s*typeof pageIntroduction === 'function'/.test(app), 'route introduction');
  assert.ok(/^\s*introduction: \[/m.test(app), 'aide de la page (ampoule)');
  assert.ok(/cible: 'bouton:btnIntroduction'/.test(app), 'ligne du bouton dans l’explication rapide de l’accueil');
  const base = lire('data/baseConnaissancesERIP.js');
  assert.ok(/route:introduction', ouvertSi: 'INTRO_OUVERTE'/.test(base), 'recherche de l’accueil, fermée avec le module');
  const ui = lire('modules/introduction/index.js');
  assert.ok(/function pageIntroduction\(\) \{\s*if \(!_introOuverte\(\)\) \{ naviguerVers\('cv'\); return; \}/.test(ui), 'page fermée : retour à l’accueil');
  assert.ok(/INTRO_OUVERTE/.test(ui), 'indicateur lu par la recherche');
});

test('le bouton est rectangulaire, a un état sombre, et la barre du haut lui laisse la place', () => {
  const css = lire('css/style.css');
  const m = css.match(/#btnIntroduction \{[^}]*\}/);
  assert.ok(m, 'règle du bouton');
  assert.ok(/border-radius: 8px/.test(m[0]) && !/border-radius: 50%/.test(m[0]), 'rectangulaire, jamais rond');
  assert.ok(/\[data-theme="sombre"\] #btnIntroduction/.test(css), 'mode sombre');
  assert.ok(/min-width: 769px\) \{ \.progression \{ padding-right: 200px/.test(css), 'place réservée dans la barre des étapes');
});

test('règles de texte : pas de tiret long, pas de mot « IA », pas de « facultatif », accents des mots courants', () => {
  ['modules/introduction/index.js', 'modules/introduction/logique.js', 'modules/introduction/diaporama.js'].forEach((f) => {
    const t = lire(f);
    assert.ok(!/[—–]/.test(t), 'tiret long dans ' + f);
    assert.ok(!/\bIA\b/.test(t), 'mot IA dans ' + f);
    assert.ok(!/facultatif/i.test(t), 'facultatif dans ' + f);
  });
  const t = lire('modules/introduction/index.js');
  ['Accompagnement de Parcours Professionnel', 'Un CV qui vous ressemble', 'Vérifier la solidité de votre candidature', 'Pour les professionnels de l’accompagnement'].forEach((s) => {
    assert.ok(t.indexOf(s) !== -1, 'texte attendu : ' + s);
  });
});

test('colonne de droite sur ordinateur : Introduction, puis Carnet, Journal et Panier de haut en bas, sans se recouvrir', () => {
  const haut = (css, id) => { const m = css.match(new RegExp('(?:^|\\n)#' + id + ' \\{[^}]*?top: (\\d+)px')); assert.ok(m, 'top de ' + id); return Number(m[1]); };
  const style = lire('css/style.css');
  const carnet = haut(lire('modules/carnet/carnet.css'), 'btnCarnet');
  const journal = haut(lire('modules/reperes/reperes.css'), 'btnJournalParcours');
  const panier = haut(style, 'btnComparerPanier');
  const intro = haut(style, 'btnIntroduction');
  assert.ok(intro + 44 < carnet, 'le Carnet est sous le bouton Introduction');
  assert.ok(carnet + 52 < journal, 'le Journal est sous le Carnet');
  assert.ok(journal + 52 < panier, 'le Panier est sous le Journal');
  assert.ok(panier + 52 < haut(style, 'panneauComparerPanier'), 'le panneau du panier s’ouvre sous son bouton');
  // consigne de Denis (02/11/2026) : l’écart sous Introduction est plus grand que celui entre les trois boutons, qui eux-mêmes sont espacés pareil
  const ecartIntro = carnet - (intro + 44), ecartCarnet = journal - (carnet + 52), ecartJournal = panier - (journal + 52);
  assert.strictEqual(ecartCarnet, ecartJournal, 'les trois boutons sont espacés pareil');
  assert.ok(ecartIntro > ecartCarnet, 'l’écart sous Introduction est plus grand que celui entre les trois boutons');
});

test('les trois boutons de la colonne de droite ont la même taille (ordinateur et téléphone)', () => {
  const NL = String.fromCharCode(10);
  const taille = (css, id, media) => {
    const re = new RegExp(NL + (media ? '  ' : '') + '#' + id + ' [{][^}]*?width: ([0-9]+)px[^}]*?height: ([0-9]+)px');
    const m = css.match(re); assert.ok(m, 'taille de ' + id + (media ? ' (téléphone)' : '')); return m[1] + 'x' + m[2];
  };
  const sources = [['modules/carnet/carnet.css', 'btnCarnet'], ['modules/reperes/reperes.css', 'btnJournalParcours'], ['css/style.css', 'btnComparerPanier']];
  [false, true].forEach((media) => {
    const tailles = sources.map(([f, id]) => taille(lire(f), id, media));
    assert.strictEqual(new Set(tailles).size, 1, 'tailles différentes ' + (media ? 'sur téléphone' : 'sur ordinateur') + ' : ' + tailles.join(', '));
  });
});

test('image agrandie : la barre du bas passe au-dessus du fond gris, Retour ferme l’image, Commencer ferme puis mène à l’accueil', () => {
  const index = lire('modules/introduction/index.js');
  assert.ok(index.indexOf('ip-barre-fixe') !== -1 && index.indexOf('introClicBarre') !== -1, 'barre repérée et écoutée');
  const fonction = index.slice(index.indexOf('function introClicBarre'), index.indexOf('function introOuvrirPage'));
  assert.ok(fonction.indexOf('fermerFenetreERIP()') !== -1, 'ferme la fenêtre commune');
  assert.ok(fonction.indexOf("btnIntroCommencer") !== -1 && fonction.indexOf('stopPropagation') !== -1, 'Commencer garde son action, Retour est arrêté');
  assert.ok(lire('css/style.css').indexOf('#fenetreERIP.visible) .ip-barre-fixe { z-index: 2100; }') !== -1, 'la barre passe au-dessus du fond gris');
});

test('vidéo : le texte sous le lecteur est lu dans le fichier de sous-titres, une phrase par ligne', () => {
  const vtt = 'WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nVoici APP, l\'Accompagnement\nde Parcours Professionnel.\n\n00:00:04.000 --> 00:00:06.000\nUne application qui s\'adapte à chacun,\nà l\'aise avec l\'informatique ou non.\n';
  assert.deepStrictEqual(L.introTexteDepuisVtt(vtt), ['Voici APP, l\'Accompagnement de Parcours Professionnel.', 'Une application qui s\'adapte à chacun, à l\'aise avec l\'informatique ou non.']);
  assert.deepStrictEqual(L.introTexteDepuisVtt(''), []);
  assert.deepStrictEqual(L.introTexteDepuisVtt(null), []);
  assert.deepStrictEqual(L.introTexteDepuisVtt('WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nSans point final'), ['Sans point final']);
});

test('vidéo : page, route, aide, recherche, deux boutons de même poids sur la page Introduction', () => {
  const html = lire('index.html');
  assert.ok(html.indexOf('modules/introduction/video.js') !== -1 && html.indexOf('modules/introduction/video.js') < html.indexOf('<script src="js/app.js"'), 'video.js avant app.js');
  const app = lire('js/app.js');
  assert.ok(/'introduction-video':\s*typeof pageVideoIntroduction === 'function'/.test(app), 'route');
  assert.ok(/^\s*'introduction-video': \[/m.test(app), 'aide de la page (ampoule)');
  assert.ok(/route:introduction-video', ouvertSi: 'INTRO_OUVERTE'/.test(lire('data/baseConnaissancesERIP.js')), 'recherche de l’accueil, fermée avec l’Introduction');
  const ui = lire('modules/introduction/video.js');
  assert.ok(/function pageVideoIntroduction\(\) \{\s*if \(!_introOuverte\(\)\) \{ naviguerVers\('cv'\); return; \}/.test(ui), 'fermée comme l’Introduction');
  assert.strictEqual((ui.match(/INTRO_VIDEO_VTT/g) || []).length >= 3, true, 'le même fichier de sous-titres alimente la piste et le texte');
  assert.ok(/barreNavigation\('introduction', null, null/.test(ui), 'Retour ramène à l’Introduction');
  const page = lire('modules/introduction/index.js');
  assert.ok(/id="btnIntroVideo"/.test(page) && /naviguerVers\('introduction-video'\)/.test(page), 'bouton vidéo sur la page Introduction');
  const m1 = page.match(/class="ip-voie" id="btnIntroDiaporama"/), m2 = page.match(/class="ip-voie" id="btnIntroVideo"/);
  assert.ok(m1 && m2, 'les deux boutons ont la même classe, donc le même poids');
  assert.ok(lire('css/style.css').indexOf('.ip-voies-deux { display: grid; grid-template-columns: 1fr 1fr;') !== -1, 'côte à côte');
});

test('textes : jamais de phrase qui désigne une difficulté de la personne (écrire), ni dans la page ni dans le diaporama ni dans le scénario', () => {
  ['modules/introduction/index.js', 'modules/introduction/diaporama.js'].forEach((f) => {
    assert.ok(lire(f).indexOf('pas à l’aise') === -1, 'accroche sans « pas à l’aise » : ' + f);
  });
  ['modules/introduction/index.js', 'modules/introduction/diaporama.js', 'docs/SCENARIO_VIDEO_PRESENTATION_2026-11-02.md'].forEach((f) => {
    const t = lire(f);
    assert.ok(t.indexOf('savoir bien écrire') === -1, f);
  });
});

test('boutons du haut : lus par titre dans l’explication rapide de l’accueil, jamais recopiés', () => {
  const source = [{ titre: 'Affichage', icone: 'bi-gear', texte: 'a' }, { titre: 'Nouveautés', icone: 'bi-megaphone', texte: 'b' }, { titre: 'Autre', icone: 'bi-x', texte: 'c' }];
  assert.deepStrictEqual(L.introChoisirBoutonsHaut(source, ['Nouveautés', 'Affichage', 'Absent']).map((b) => b.titre), ['Nouveautés', 'Affichage']);
  assert.deepStrictEqual(L.introChoisirBoutonsHaut(null, null), []);
  const app = lire('js/app.js');
  const bloc = app.slice(app.indexOf('var AIDE_ACCUEIL_HAUT = ['), app.indexOf('var AIDE_ACCUEIL_RECHERCHE'));
  L.INTRO_TITRES_BOUTONS_HAUT.forEach((t) => { assert.ok(bloc.indexOf("titre: '" + t + "'") !== -1, 'titre absent de AIDE_ACCUEIL_HAUT : ' + t); });
  const ui = lire('modules/introduction/index.js');
  assert.ok(ui.indexOf('AIDE_ACCUEIL_HAUT') !== -1 && ui.indexOf('Les boutons du haut de l’écran') !== -1, 'le bloc existe et lit la source');
});

test('agrandir une image : dans la fenêtre commune (croix et Échap), jamais un nouvel onglet', () => {
  const ui = lire('modules/introduction/index.js');
  assert.ok(ui.indexOf('target="_blank"') === -1, 'plus de lien vers un nouvel onglet');
  assert.ok(/function introAgrandirImage\(lien\)/.test(ui) && /ouvrirFenetreERIP\(\{/.test(ui), 'fenêtre commune');
  assert.ok(/querySelectorAll\('\.ip-page figure a'\)/.test(ui) && /ev\.preventDefault\(\)/.test(ui), 'chaque image intercepte son clic');
});

test('la barre fixe du bas n’a que « Retour » et « Commencer » (« Accueil » ferait doublon), plus de bouton en bas de la page', () => {
  const ui = lire('modules/introduction/index.js');
  assert.ok(/barreNavigation\('cv', 'cv', '<span class="lib-intro-long">Commencer<\/span>[^']*', \{ idSuivant: 'btnIntroCommencer', sansAccueil: true \}\)/.test(ui), 'Retour + Commencer dans la barre du bas, sans Accueil');
  assert.ok(ui.indexOf('id="btnIntroCommencer"') === -1, 'plus de bouton Commencer dans le corps de la page');
});

test('le nombre de modèles annoncé compte comme la galerie : les modèles « à photo » ne comptent que si la personne a une photo', () => {
  const ui = lire('modules/introduction/index.js');
  assert.ok(/_mepModeleVisible\(m\[0\]\)/.test(ui), 'même règle de visibilité que la galerie');
  assert.ok(/_introCompterModeles\(_MEP_GALERIE_SOBRE\)/.test(ui) && /_introCompterModeles\(_MEP_GALERIE_CREATIF\)/.test(ui), 'les deux listes passent par le même compte');
  const app = lire('js/app.js');
  assert.ok(/function _mepModeleVisible\(id\)/.test(app), 'la règle existe toujours dans la galerie');
});

test('introBornerDiapo : toujours un numéro valide, même avec une valeur absurde ou une liste vide', () => {
  assert.strictEqual(L.introBornerDiapo(-3, 19), 0);
  assert.strictEqual(L.introBornerDiapo(25, 19), 18);
  assert.strictEqual(L.introBornerDiapo(7, 19), 7);
  assert.strictEqual(L.introBornerDiapo('x', 19), 0);
  assert.strictEqual(L.introBornerDiapo(undefined, 19), 0);
  assert.strictEqual(L.introBornerDiapo(3, 0), 0);
  assert.strictEqual(L.introBornerDiapo(3, null), 0);
});

test('introPhraseCourteBouton : la phrase courte du diaporama, sinon celle de l’explication rapide, jamais une ligne vide', () => {
  assert.strictEqual(L.introPhraseCourteBouton({ titre: 'Affichage', texte: 'longue' }), 'Taille du texte, couleurs');
  assert.strictEqual(L.introPhraseCourteBouton({ titre: 'Autre bouton', texte: 'phrase de la source' }), 'phrase de la source');
  assert.strictEqual(L.introPhraseCourteBouton(null), '');
});

test('diaporama : les 4 boutons du haut sont lus dans AIDE_ACCUEIL_HAUT, et chaque outil du territoire a sa version courte', () => {
  const app = lire('js/app.js');
  const bloc = app.slice(app.indexOf('var AIDE_ACCUEIL_HAUT = ['), app.indexOf('var AIDE_ACCUEIL_RECHERCHE'));
  L.INTRO_TITRES_DIAPO_BOUTONS.forEach((t) => {
    assert.ok(bloc.indexOf("titre: '" + t + "'") !== -1, 'titre absent de AIDE_ACCUEIL_HAUT : ' + t);
    assert.ok(L.INTRO_PHRASES_COURTES_BOUTONS[t], 'phrase courte manquante : ' + t);
  });
  L.INTRO_OUTILS_TERRITOIRE.forEach((o) => { assert.ok(o.court && o.court.length < o.phrase.length + 40, 'version courte de ' + o.libelle); });
});

test('diaporama : script chargé, route, aide, bouton sur la page, écoute du clavier unique, retour à l’Introduction', () => {
  const html = lire('index.html');
  assert.ok(html.indexOf('modules/introduction/index.js') < html.indexOf('modules/introduction/diaporama.js'), 'diaporama après la page (il réutilise ses fonctions)');
  assert.ok(html.indexOf('modules/introduction/diaporama.js') < html.indexOf('<script src="js/app.js"'), 'diaporama avant app.js');
  const app = lire('js/app.js');
  assert.ok(/'introduction-diaporama':\s*typeof pageDiaporamaIntroduction === 'function'/.test(app), 'route');
  assert.ok(/route:introduction-diaporama', ouvertSi: 'INTRO_OUVERTE'/.test(lire('data/baseConnaissancesERIP.js')), 'recherche de l’accueil, fermée avec l’Introduction');
  assert.ok(/^\s*'introduction-diaporama': \[/m.test(app), 'aide de la page (ampoule)');
  const page = lire('modules/introduction/index.js');
  assert.ok(/id="btnIntroDiaporama"/.test(page) && /naviguerVers\('introduction-diaporama'\)/.test(page), 'bouton Présenter en diaporama sur la page Introduction');
  const ui = lire('modules/introduction/diaporama.js');
  assert.ok(/function pageDiaporamaIntroduction\(\) \{\s*if \(!_introOuverte\(\)\) \{ naviguerVers\('cv'\); return; \}/.test(ui), 'fermé comme l’Introduction');
  assert.strictEqual((ui.match(/addEventListener\('keydown'/g) || []).length, 1, 'une seule écoute du clavier');
  assert.ok(/barreNavigation\('introduction', null, null/.test(ui), 'Retour ramène à l’Introduction');
  assert.ok(/INTRO_TITRES_DIAPO_BOUTONS/.test(ui) && /AIDE_ACCUEIL_HAUT/.test(ui) && /_introPhraseModeles\(\)/.test(ui), 'boutons du haut et nombre de modèles lus à la source');
  assert.ok(/introFiltrerParOuverture\(INTRO_OUTILS_TERRITOIRE, ouverts\)/.test(ui), 'diapositive territoire filtrée par ouverture');
});

test('diaporama : style en unités qui suivent le cadre, mode sombre par les variables, téléphone', () => {
  const css = lire('css/style.css');
  assert.ok(/\.idp-cadre \{[^}]*container-type: inline-size[^}]*aspect-ratio: 16 \/ 9/.test(css), 'cadre 16/9 qui sert de référence aux tailles');
  const bloc = css.slice(css.indexOf('Introduction : diaporama oral'));
  assert.ok(!/#[0-9a-fA-F]{3,6}\b(?!.*\/\*)/.test(bloc.replace(/background: #fff;/g, '').replace(/color: #fff;/g, '')), 'aucune couleur en dur hors le blanc du fond des captures');
  assert.ok(/@media \(max-width: 700px\) \{\s*\.idp-cadre \{ aspect-ratio: auto/.test(bloc), 'téléphone : diapositives empilées');
});

test('diaporama : deux diapositives sur les outils privés (veille et sas, prospection), avec leurs captures et une mention d’exemple', () => {
  const ui = lire('modules/introduction/diaporama.js');
  ['i_veille_1_accueil', 'i_veille_2_sas', 'i_prospection_1_carnet'].forEach((n) => {
    assert.ok(ui.indexOf("'" + n + "'") !== -1, 'capture citée : ' + n);
    assert.ok(fs.statSync(path.join(RACINE, 'images', 'introduction', n + '.png')).size > 10000, 'capture non vide : ' + n);
  });
  assert.ok(/Rien n’est inventé/.test(ui), 'diapositive de la veille');
  assert.ok(/Écran d’exemple : aucune vraie entreprise n’est montrée/.test(ui), 'la prospection est montrée comme un exemple');
  assert.ok(/je m’en sers moi aussi/.test(ui), 'la note dit que l’outil sert aussi à l’orateur');
  assert.ok(ui.indexOf('Rien n’est inventé') < ui.indexOf('Un second outil') && ui.indexOf('Un second outil') < ui.indexOf('À vous de jouer'), 'ordre : veille, prospection, puis conclusion');
});
