/* ============================================================
   Module « Introduction » : interface (pas de test Node : test navigateur obligatoire).
   Le bouton « Introduction » (#btnIntroduction, index.html) est tout à droite de la ligne du haut, sur la même ligne que les quatre icônes rondes ; il est visible sur toutes les pages.
   La page (route 'introduction') présente l'application en quelques mots et en images. Logique pure : logique.js. Images : images/introduction/.
   Fermée au public tant que « Qui fait quoi » et « Employeurs » le sont (voir logique.js, introEstOuverte). Maquette : docs/MAQUETTE_INTRODUCTION_APPLICATION_2026-11-01.html.
   ============================================================ */

var INTRO_DOSSIER_IMAGES = 'images/introduction/';

function _introOuverte() {
  return introEstOuverte(typeof mtOuvert === 'function' ? mtOuvert : null);
}

// Les noms des tuiles présentes sur l'accueil (une seule source : data/metiers.js), pour ne parler que des outils réellement ouverts.
function _introLibellesOuverts() {
  var libelles = [];
  if (typeof itemsInfoCarteAccueil !== 'function') { return libelles; }
  ['mesdocuments', 'preparer', 'boiteaoutils', 'analyse', 'informe', 'orientation'].forEach(function (id) {
    itemsInfoCarteAccueil(id).forEach(function (it) { libelles.push(it[0]); });
  });
  return libelles;
}

// Le nombre de modèles de CV est LU dans les deux listes de la galerie (js/app.js), jamais écrit en dur : il suit chaque modèle ajouté.
// Il compte comme la galerie elle-même (« Sobre 12 modèles », « Créatif 25 modèles ») : les deux modèles construits autour d'une photo ne comptent que si la personne a une photo
// (_mepModeleVisible), sinon l'Introduction annoncerait 39 modèles quand la galerie en montre 37.
function _introCompterModeles(liste) {
  if (typeof liste === 'undefined') { return 0; }
  return liste.filter(function (m) { return typeof _mepModeleVisible !== 'function' || _mepModeleVisible(m[0]); }).length;
}
function _introPhraseModeles() {
  var s = typeof _MEP_GALERIE_SOBRE !== 'undefined' ? _introCompterModeles(_MEP_GALERIE_SOBRE) : 0;
  var c = typeof _MEP_GALERIE_CREATIF !== 'undefined' ? _introCompterModeles(_MEP_GALERIE_CREATIF) : 0;
  return introPhraseModeles(s, c);
}

function _introFigure(fichier, alt, legende) {
  var src = INTRO_DOSSIER_IMAGES + fichier + '.png';
  return '<figure class="ip-figure"><a href="' + src + '"><img loading="lazy" src="' + src + '" alt="' + alt + '"></a>' +
    (legende ? '<figcaption>' + legende + '</figcaption>' : '') + '</figure>';
}

// Un outil en images : titre, phrase, une ou plusieurs captures prises dans l'outil (personnage inventé).
function _introOutil(titre, phrase, images) {
  return '<div class="ip-outil"><strong>' + titre + '</strong><span>' + phrase + '</span><div class="ip-outil-images">' + images.map(function (im) {
    var src = INTRO_DOSSIER_IMAGES + im[0] + '.png';
    return '<figure><a href="' + src + '"><img loading="lazy" src="' + src + '" alt="Capture dans l’outil « ' + titre + ' » : ' + im[1] + '"></a><figcaption>' + im[1] + '</figcaption></figure>';
  }).join('') + '</div></div>';
}

function _introPas(numero, texte, fichier, alt) {
  return '<div class="ip-pas-ligne"><span class="ip-rond">' + numero + '</span><div><p>' + texte + '</p>' + _introFigure(fichier, alt, '') + '</div></div>';
}

// Le bloc « Les boutons du haut de l'écran » : une pastille ronde (comme à l'écran) + le nom + la phrase de l'explication rapide de l'accueil.
function _introBlocBoutonsHaut() {
  var boutons = introChoisirBoutonsHaut(typeof AIDE_ACCUEIL_HAUT !== 'undefined' ? AIDE_ACCUEIL_HAUT : [], INTRO_TITRES_BOUTONS_HAUT);
  if (!boutons.length) { return ''; }
  return '<div class="cv-section"><h4>&#129517; Les boutons du haut de l’écran</h4>' +
    '<p>En haut de l’écran, sur toutes les pages, quelques boutons vous aident à vous repérer et à circuler dans l’application. Les connaître facilite beaucoup la navigation.</p>' +
    '<ul class="ip-liste ip-liste-boutons">' + boutons.map(function (b) {
      return '<li><span class="ip-bouton-haut" aria-hidden="true"><i class="bi ' + b.icone + '"></i></span><span><strong>' + b.titre.replace(/ \(l’ampoule\)/, '') + '</strong> : ' + b.texte + '</span></li>';
    }).join('') + '</ul>' +
    '<div class="ip-encart"><i class="bi bi-compass" aria-hidden="true"></i><span>Et tout à droite, le bouton <strong>Introduction</strong> vous ramène à cette page, quand vous voulez.</span></div></div>';
}

function pageIntroduction() {
  if (!_introOuverte()) { naviguerVers('cv'); return; }
  var ouverts = _introLibellesOuverts();
  var territoire = introFiltrerParOuverture(INTRO_OUTILS_TERRITOIRE, ouverts);
  var imagesTerritoire = introFiltrerParOuverture(INTRO_IMAGES_TERRITOIRE, ouverts);
  var avecAnnuaire = ouverts.indexOf('Qui fait quoi') !== -1 && ouverts.indexOf('Employeurs près de chez moi') !== -1;

  var html = '<div class="page-catalogue-contenu ip-page">' +
    '<div class="text-center"><h1><i class="bi bi-compass" aria-hidden="true"></i> Introduction</h1>' +
    '<p class="sousTitre">Cette application, en quelques mots et en images.</p></div>' +

    '<div class="cv-section ip-accroche"><p class="mb-0">Chercher un emploi, ce n’est pas facile. <strong>Cette application s’adapte à chacun</strong>, que l’on soit à l’aise avec l’informatique ou non : elle vous accompagne, à votre rythme. Personne ne vous juge et rien n’est obligatoire.</p></div>' +
    '<div class="cv-section ip-voies"><h4>&#127916; Deux façons de la découvrir</h4>' +
      '<div class="ip-voies-deux">' +
        '<button type="button" class="ip-voie" id="btnIntroDiaporama"><i class="bi bi-easel" aria-hidden="true"></i><strong>En diaporama</strong><span>Pour la présenter à plusieurs, ou avancer image par image.</span></button>' +
        '<button type="button" class="ip-voie" id="btnIntroVideo"><i class="bi bi-play-circle" aria-hidden="true"></i><strong>En vidéo</strong><span>Pour la regarder seul, avec la voix et les sous-titres.</span></button>' +
      '</div></div>' +

    '<div class="cv-section"><h4>&#127919; À quoi ça sert</h4>' +
      '<p><strong>APP</strong> veut dire « Accompagnement de Parcours Professionnel ». Elle vous aide à avancer : écrire ou améliorer votre CV et votre lettre de motivation, vous entraîner à l’entretien, mieux comprendre le monde du travail, ou simplement réfléchir à la direction à prendre.</p>' +
      (avecAnnuaire ? '<p>Elle vous aide aussi à trouver, près de chez vous, <strong>les employeurs à qui écrire</strong> et <strong>les structures à qui vous adresser</strong>, avec leurs coordonnées vérifiées et datées.</p>' : '') +
      '<p>Vous choisissez ce qui vous est utile. <strong>Rien n’est obligatoire</strong>, et vous pouvez vous arrêter et revenir quand vous voulez.</p>' +
      '<div class="ip-figures-deux">' +
        _introFigure('accueil', 'Capture de l’accueil de l’application : les premières cartes pour choisir son point de départ', 'L’accueil : des grandes cartes, vous choisissez par laquelle commencer.') +
        _introFigure('accueil_bas', 'Capture de l’accueil, suite : les outils d’analyse, Se tenir informé, Vous hésitez encore', 'Et la suite de l’accueil.') +
      '</div></div>' +

    '<div class="cv-section"><h4>&#128203; Comment ça se passe</h4>' +
      '<ol class="ip-etapes">' +
        '<li><span class="ip-rond">1</span><span><b>Vous choisissez un point de départ</b> sur l’accueil, par exemple « Créer un nouveau CV ».</span></li>' +
        '<li><span class="ip-rond">2</span><span><b>L’application prépare pour vous une demande toute prête.</b> Vous la copiez, puis vous la collez chez l’assistant en ligne de votre choix.</span></li>' +
        '<li><span class="ip-rond">3</span><span><b>Vous revenez coller sa réponse.</b> L’application la remet en forme. Vous relisez, vous modifiez ce que vous voulez, puis vous téléchargez votre document.</span></li>' +
      '</ol>' +
      '<div class="ip-encart"><i class="bi bi-hand-index-thumb" aria-hidden="true"></i><span><strong>Vous gardez toujours la main.</strong> Rien ne se décide sans vous, et rien n’est envoyé sans votre geste.</span></div></div>' +

    _introBlocBoutonsHaut() +

    '<div class="cv-section"><h4>&#128221; Un exemple pas à pas : Camille crée son CV</h4>' +
      '<p>Camille est un personnage inventé, pour l’exemple. Voici ce qu’elle voit à chaque étape. La barre en haut de l’écran vous montre toujours où vous en êtes :</p>' +
      '<div class="ip-etapes-barre"><span>Votre objectif</span><span>Vos informations</span><span>Votre parcours</span><span>Votre profil</span><span>Vos documents</span></div>' +
      '<div class="ip-pas">' +
        _introPas(1, '<strong>Elle choisit comment commencer.</strong> Trois façons de faire, selon qu’elle a déjà un CV ou non.', 'i_cv_1_choix', 'Capture : choix entre créer un CV avec un assistant, à la main, ou à partir de son récit') +
        _introPas(2, '<strong>Elle dit ce qu’elle cherche.</strong> Un métier précis, une présentation générale : quelques clics, pas de page blanche.', 'i_cv_2_objectif', 'Capture : l’étape Votre objectif, avec des choix à cocher') +
        _introPas(3, '<strong>Elle choisit ce qui compte pour elle.</strong> Des propositions déjà prêtes à cocher : elle garde celles qui lui ressemblent.', 'i_cv_3_parcours', 'Capture : l’étape Votre parcours, avec des choix comme Bon équilibre vie professionnelle et personnelle') +
        _introPas(4, '<strong>Elle découvre son profil.</strong> Un coup d’œil sur ce qu’elle a saisi, ses compétences repérées et des métiers à regarder.', 'i_cv_4_profil', 'Capture : l’étape Votre profil') +
      '</div></div>' +

    '<div class="cv-section"><h4>&#127912; Un CV qui vous ressemble</h4>' +
      '<p>Votre CV existe en ' + _introPhraseModeles() + '. Vous choisissez les couleurs, les formes et la mise en page. Votre texte, lui, ne change jamais. Vous le téléchargez en PDF ou en Word.</p>' +
      '<div class="ip-modeles">' +
        _introFigure('modeles_creatifs', 'Huit modèles de CV créatifs', 'Quelques modèles créatifs.') +
        _introFigure('modele_grand', 'Un modèle de CV en grand : colonne foncée', 'Un modèle en grand. Le CV d’exemple est inventé.') +
      '</div>' +
      _introFigure('modeles_sobres', 'Huit modèles de CV sobres', 'Quelques modèles sobres, pour un style plus classique.') +
    '</div>' +

    '<div class="cv-section"><h4>&#9993;&#65039; Votre lettre et votre entretien</h4>' +
      '<p>Avec le même personnage inventé, voici deux autres documents que l’application vous aide à préparer. Les réponses de l’assistant en ligne sont des exemples. Cliquez sur une image pour l’agrandir.</p>' +
      _introOutil('Écrire ma lettre de motivation', 'Vous écrivez la lettre avec un assistant, phrase par phrase, en prenant le temps. Puis vous choisissez la mise en page.',
        [['i_lettre_1_preparer', 'Vous déposez votre CV et dites à qui vous écrivez.'], ['i_lettre_2_mise_en_page', 'La lettre mise en page : modèle, couleur, police, aperçu.']]) +
      _introOutil('M’entraîner à un entretien', 'Une séance d’entraînement : vous répondez à des questions d’entretien, à l’écrit ou à voix haute, et l’assistant réagit à vos réponses.',
        [['i_entretien_1_resultat', 'Votre préparation est enregistrée et mise en page.']]) +
    '</div>' +

    '<div class="cv-section"><h4>&#128269; Vérifier la solidité de votre candidature</h4>' +
      '<p>Avant de postuler, vous pouvez demander un regard sur votre CV : ce qui est solide, ce qui peut faire hésiter, et des pistes concrètes pour le renforcer.</p>' +
      _introOutil('Analyser ma candidature', 'Mon CV est-il solide ? Un assistant repère ce qui mérite d’être renforcé.',
        [['i_bilan_2_resultat', 'Un résultat clair : ce qui est solide, ce qui peut faire hésiter.'], ['i_bilan_3_resultat', 'Des pistes concrètes, de la plus importante à la moindre.']]) +
      '<p class="mb-0">D’autres outils regardent votre CV avec les yeux d’un recruteur, comparent ses mots à ceux d’une offre, ou vérifient que votre CV, votre lettre et votre entretien racontent la même histoire.</p>' +
    '</div>';

  if (territoire.length) {
    html += '<div class="cv-section"><h4>&#128506;&#65039; Comprendre ce qui se passe près de chez vous</h4>' +
      '<p>Pour savoir où vous en êtes et à qui vous adresser, l’application met à votre portée des repères sur votre département, expliqués simplement et datés.</p>' +
      '<ul class="ip-liste">' + territoire.map(function (o) {
        return '<li><i class="bi ' + o.icone + '" aria-hidden="true"></i><span><strong>' + o.libelle + '</strong> : ' + o.phrase + '</span></li>';
      }).join('') + '</ul>' +
      (imagesTerritoire.length ? '<div style="margin-top:.8rem"><div class="ip-outil"><strong>En images</strong><span>' +
        (imagesTerritoire.length === 2 ? 'Le chômage de votre département, expliqué ; et des employeurs à qui écrire, avec leur date de vérification.' : 'Un exemple pris dans l’outil.') +
        '</span><div class="ip-outil-images">' + imagesTerritoire.map(function (im) {
          var src = INTRO_DOSSIER_IMAGES + im.fichier + '.png';
          return '<figure><a href="' + src + '"><img loading="lazy" src="' + src + '" alt="Capture dans l’outil « ' + im.libelle + ' » : ' + im.legende + '"></a><figcaption>' + im.legende + '</figcaption></figure>';
        }).join('') + '</div></div></div>' : '') +
    '</div>';
  }

  html += '<div class="cv-section"><h4>&#129520; Et aussi</h4>' +
      '<ul class="ip-liste">' +
        '<li><i class="bi bi-briefcase" aria-hidden="true"></i><span><strong>Une boîte à outils</strong> pour garder vos réflexions (Mes Repères), noter librement (Mon Carnet), chercher un mot (Lexique) et découvrir vos compétences.</span></li>' +
        '<li><i class="bi bi-signpost-split" aria-hidden="true"></i><span><strong>Si vous hésitez sur la direction</strong> : comparer vos pistes de métier, ou préparer un seul CV pour plusieurs métiers.</span></li>' +
      '</ul></div>' +

    '<div class="cv-section"><h4>&#128161; Ce qui guide cette application</h4>' +
      '<ul class="ip-liste">' +
        '<li><i class="bi bi-clock" aria-hidden="true"></i><span><strong>Votre rythme.</strong> Aucune obligation, aucun rappel, aucun délai.</span></li>' +
        '<li><i class="bi bi-slash-circle" aria-hidden="true"></i><span><strong>Pas de note, pas de comparaison.</strong> L’application ne vous juge pas et ne dit rien de vous : elle vous aide à mettre en forme ce que vous savez déjà faire.</span></li>' +
        '<li><i class="bi bi-door-open" aria-hidden="true"></i><span><strong>Simple d’accès.</strong> Pas de compte à créer, rien à installer : elle s’ouvre dans votre navigateur.</span></li>' +
        '<li><i class="bi bi-person-check" aria-hidden="true"></i><span><strong>Vous restez l’auteur.</strong> Vos textes, vos choix, votre voix. L’assistant en ligne propose, vous décidez.</span></li>' +
      '</ul></div>' +

    '<div class="cv-section"><h4>&#128274; Vos informations</h4>' +
      '<p>Ce que vous écrivez reste sur votre appareil, tant que la page est ouverte. Quand vous fermez ou rechargez la page, tout disparaît : l’application ne garde rien de façon permanente.</p>' +
      '<p>Pour retrouver votre travail plus tard, la <strong>disquette</strong> en haut à gauche l’enregistre dans un fichier, chez vous. Vous choisissez où.</p>' +
      '<p>Si vous utilisez un assistant en ligne, c’est vous qui copiez ce qu’il reçoit. Des outils vous permettent de masquer votre nom, votre téléphone et votre e-mail avant de l’envoyer.</p>' +
      '<div class="ip-pied" style="justify-content:flex-start;margin:.8rem 0 0"><button type="button" class="btn btn-outline-primary btn-sm" id="btnIntroConfidentialite"><i class="bi bi-shield-check" aria-hidden="true"></i> Confidentialité de vos données</button></div></div>' +

    '<div class="cv-section"><h4>&#129309; Pour les professionnels de l’accompagnement</h4>' +
      '<ul class="ip-liste">' +
        '<li><i class="bi bi-check2" aria-hidden="true"></i><span>Utilisable <strong>seul ou pendant un rendez-vous</strong> : la personne avance sans que le conseiller ait besoin d’être présent.</span></li>' +
        '<li><i class="bi bi-check2" aria-hidden="true"></i><span><strong>Aucun compte, aucun serveur qui garde les données</strong> : les informations restent sur l’appareil de la personne.</span></li>' +
        '<li><i class="bi bi-check2" aria-hidden="true"></i><span>Avec « Mes Repères », la personne <strong>choisit elle-même</strong> ce qu’elle veut garder pour elle ou aborder avec son conseiller.</span></li>' +
        (avecAnnuaire ? '<li><i class="bi bi-check2" aria-hidden="true"></i><span>« Qui fait quoi » et « Employeurs près de chez moi » donnent, pour le département, des <strong>adresses utiles avec leur date de vérification</strong> : un appui pour préparer un rendez-vous.</span></li>' : '') +
      '</ul></div>' +

    '</div>' +
    '<div class="barre-navigation-fixe ip-barre-fixe">' + barreNavigation('cv', 'cv', '<span class="lib-intro-long">Commencer</span><span class="lib-intro-court">Commencer</span>', { idSuivant: 'btnIntroCommencer', sansAccueil: true }) + '</div>';

  app.innerHTML = html;
  var barreBas = app.querySelector('.ip-barre-fixe');
  if (barreBas) { barreBas.addEventListener('click', introClicBarre, true); }
  app.querySelectorAll('.ip-page figure a').forEach(function (lien) {
    lien.addEventListener('click', function (ev) { ev.preventDefault(); introAgrandirImage(lien); });
  });
  var bD = document.getElementById('btnIntroDiaporama');
  if (bD) { bD.addEventListener('click', function () { naviguerVers('introduction-diaporama'); }); }
  var bV = document.getElementById('btnIntroVideo');
  if (bV) { bV.addEventListener('click', function () { naviguerVers('introduction-video'); }); }
  var bP = document.getElementById('btnIntroConfidentialite');
  if (bP) { bP.addEventListener('click', function () { if (typeof ouvrirModaleConfidentialite === 'function') { ouvrirModaleConfidentialite(); } }); }
  if (typeof trackEvenement === 'function') { trackEvenement('introduction_ouverte'); }
}

// Agrandir une image : la fenêtre commune de l'application (croix en haut à droite, touche Échap), jamais un nouvel onglet ni l'image seule plein écran.
function _introEchapper(t) {
  return String(t === undefined || t === null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function introAgrandirImage(lien) {
  var img = lien && lien.querySelector ? lien.querySelector('img') : null;
  if (!img || typeof ouvrirFenetreERIP !== 'function') { return; }
  var legende = lien.parentNode ? lien.parentNode.querySelector('figcaption') : null;
  var titre = legende ? legende.textContent : String(img.getAttribute('alt') || '').replace(/^Capture( dans l’outil)? ?:? ?/, '');
  ouvrirFenetreERIP({
    titre: '<i class="bi bi-image titre-icone-accent" aria-hidden="true"></i> ' + _introEchapper(titre),
    taille: 'tresLarge',
    contenuHTML: '<img class="ip-image-agrandie" src="' + _introEchapper(img.getAttribute('src')) + '" alt="' + _introEchapper(img.getAttribute('alt')) + '">'
  });
}

// Image agrandie : la barre du bas reste cliquable au-dessus du fond gris (css/style.css). Retour ferme l'image, comme la croix ; Commencer ferme l'image puis mène à l'accueil, son action habituelle.
function introClicBarre(ev) {
  if (!document.querySelector('#fenetreERIP.visible') || typeof fermerFenetreERIP !== 'function') { return; }
  var bouton = ev.target && ev.target.closest ? ev.target.closest('button') : null;
  if (!bouton) { return; }
  fermerFenetreERIP();
  if (bouton.id !== 'btnIntroCommencer') { ev.stopPropagation(); ev.preventDefault(); }
}

function introOuvrirPage() {
  if (typeof naviguerVers === 'function') { naviguerVers('introduction'); }
}

// Le bouton reste caché tant que l'Introduction est fermée au public.
function introMajBouton() {
  var b = document.getElementById('btnIntroduction');
  if (b) { b.hidden = !_introOuverte(); }
}

// La recherche de l'accueil (data/baseConnaissancesERIP.js, `ouvertSi`) lit un indicateur de la fenêtre : celui-ci suit l'ouverture réelle, à chaque lecture.
if (typeof window !== 'undefined') {
  try { Object.defineProperty(window, 'INTRO_OUVERTE', { get: _introOuverte, configurable: true }); } catch (e) { /* sans indicateur, la recherche ne propose simplement pas l'Introduction */ }
}

function _introInitialiser() {
  var b = document.getElementById('btnIntroduction');
  if (b && !b.__introBranche) { b.__introBranche = true; b.addEventListener('click', introOuvrirPage); }
  introMajBouton();
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _introInitialiser); } else { _introInitialiser(); }
}
