/* ============================================================
   Module « Introduction » : diaporama oral (interface ; pas de test Node : test navigateur obligatoire).
   Sert à Denis devant un groupe : peu de texte, grosses images, une idée par écran. Maquette validée le 02/11/2026 : docs/MAQUETTE_DIAPORAMA_INTRODUCTION_2026-11-02.html.
   Même matière que la page Introduction (index.js) : mêmes images (images/introduction/), nombre de modèles, boutons du haut et outils du territoire LUS à la source,
   diapositives « près de chez vous » et « professionnels » adaptées à ce qui est ouvert. Les textes courts, eux, sont propres au diaporama (voulu : un écran se lit en un coup d'œil).
   Route 'introduction-diaporama' ; fermé au public avec l'Introduction.
   ============================================================ */

var _idpIndex = 0;
var _idpDiapos = [];

function _idpImg(fichier, alt) {
  return '<img class="idp-image" src="' + INTRO_DOSSIER_IMAGES + fichier + '.png" alt="' + _introEchapper(alt) + '">';
}
function _idpFig(fichier, alt, legende) {
  return '<figure class="idp-figure">' + _idpImg(fichier, alt) + (legende ? '<figcaption>' + legende + '</figcaption>' : '') + '</figure>';
}
// La barre des étapes de la création du CV ; `actifs` : les numéros (0 à 4) des étapes montrées sur la diapositive.
function _idpBarreEtapes(actifs) {
  var noms = ['Votre objectif', 'Vos informations', 'Votre parcours', 'Votre profil', 'Vos documents'];
  return '<div class="idp-etapes-barre">' + noms.map(function (n, i) { return '<span' + (actifs.indexOf(i) !== -1 ? ' class="actif"' : '') + '>' + n + '</span>'; }).join('') + '</div>';
}
function _idpLigne(icone, texte) {
  return '<li><i class="bi ' + icone + '" aria-hidden="true"></i><span>' + texte + '</span></li>';
}
function _idpCentre(icone, titre, phrase) {
  return '<div class="idp-centre-bloc"><i class="bi ' + icone + ' idp-icone-geante" aria-hidden="true"></i>' + titre + phrase + '</div>';
}

// La liste des diapositives, recalculée à chaque ouverture : elle suit ce qui est ouvert et le nombre de modèles du moment.
function _idpConstruireDiapos() {
  var ouverts = _introLibellesOuverts();
  var territoire = introFiltrerParOuverture(INTRO_OUTILS_TERRITOIRE, ouverts);
  var imagesTerritoire = introFiltrerParOuverture(INTRO_IMAGES_TERRITOIRE, ouverts);
  var avecAnnuaire = ouverts.indexOf('Qui fait quoi') !== -1 && ouverts.indexOf('Employeurs près de chez moi') !== -1;
  var boutons = introChoisirBoutonsHaut(typeof AIDE_ACCUEIL_HAUT !== 'undefined' ? AIDE_ACCUEIL_HAUT : [], INTRO_TITRES_DIAPO_BOUTONS);
  var d = [];

  d.push({ notes: 'Accueillir. Dire en une phrase ce que c’est : une application pour avancer dans sa recherche d’emploi, à son rythme.',
    html: _idpCentre('bi-compass', '<h2 class="idp-titre-grand">APP</h2>', '<p class="idp-grand">Accompagnement de Parcours Professionnel</p><p class="idp-sous">À votre rythme. Sans jugement.</p>') });

  d.push({ notes: 'Partir de la difficulté réelle : chercher un emploi est dur, et l’informatique ajoute de la peur. Insister : personne n’est jugé.',
    html: '<h2>Chercher un emploi, ce n’est pas facile</h2><p class="idp-grand">Cette application s’adapte à chacun, à l’aise avec l’informatique ou non.</p>' +
      '<div class="idp-encart"><i class="bi bi-hand-thumbs-up" aria-hidden="true"></i><p><strong>Elle vous accompagne, à votre rythme.</strong> Personne ne vous juge, rien n’est obligatoire.</p></div>' });

  d.push({ notes: 'Les quatre grands services. Ne pas détailler : chacun a sa diapositive plus loin.',
    html: '<h2><i class="bi bi-bullseye" aria-hidden="true"></i>À quoi ça sert</h2><ul class="idp-liste">' +
      _idpLigne('bi-file-earmark-person', 'Écrire ou améliorer votre CV et votre lettre de motivation') +
      _idpLigne('bi-chat-dots', 'Vous entraîner à l’entretien') +
      _idpLigne('bi-graph-up', 'Mieux comprendre le monde du travail') +
      _idpLigne('bi-signpost-split', 'Réfléchir à la direction à prendre') + '</ul>' });

  d.push({ notes: 'Montrer l’écran d’accueil réel. Le message : de grandes cartes, on choisit celle qui nous parle. Rien n’est imposé.',
    html: '<h2>Un point de départ à choisir</h2><div class="idp-colonnes idp-egal"><p class="idp-grand">De grandes cartes.<br>Vous choisissez par laquelle commencer.</p>' +
      _idpFig('accueil', 'Capture de l’accueil de l’application', '') + '</div>' });

  d.push({ notes: 'Le fonctionnement en trois temps. Bien dire que la demande est copiée par la personne : elle garde la main.',
    html: '<h2><i class="bi bi-list-ol" aria-hidden="true"></i>Comment ça se passe</h2><ul class="idp-liste">' +
      '<li><span class="idp-rond">1</span><span><strong>Vous choisissez</strong> un point de départ sur l’accueil.</span></li>' +
      '<li><span class="idp-rond">2</span><span><strong>L’application prépare une demande toute prête.</strong> Vous la collez chez l’assistant en ligne de votre choix.</span></li>' +
      '<li><span class="idp-rond">3</span><span><strong>Vous revenez coller sa réponse.</strong> Vous relisez, vous modifiez, vous téléchargez.</span></li></ul>' });

  d.push({ notes: 'Phrase clé à dire lentement. C’est la réponse à la peur de « l’ordinateur qui décide ».',
    html: _idpCentre('bi-hand-index-thumb', '<h2>Vous gardez toujours la main</h2>', '<p class="idp-grand">Rien ne se décide sans vous.<br>Rien n’est envoyé sans votre geste.</p>') });

  if (boutons.length) {
    d.push({ notes: 'Montrer du doigt les boutons en haut de l’écran sur le vrai écran si possible. Ils facilitent beaucoup la navigation.',
      html: '<h2>Les boutons du haut de l’écran</h2><ul class="idp-liste">' + boutons.map(function (b) {
        return '<li><span class="idp-pastille"><i class="bi ' + b.icone + '" aria-hidden="true"></i></span><span><strong>' + b.titre.replace(/ \(l’ampoule\)/, '') + '</strong> : ' + introPhraseCourteBouton(b) + '</span></li>';
      }).join('') +
      '<li><span class="idp-pastille"><i class="bi bi-compass" aria-hidden="true"></i></span><span><strong>Introduction</strong> : cette présentation, quand vous voulez</span></li></ul>' });
  }

  d.push({ notes: 'Camille est un personnage inventé. Premier écran : trois façons de commencer. Deuxième écran : elle dit ce qu’elle cherche. La barre du haut dit toujours où l’on en est.',
    html: '<h2><i class="bi bi-file-earmark-person" aria-hidden="true"></i>Camille crée son CV (1/2)</h2>' + _idpBarreEtapes([0]) +
      '<div class="idp-images idp-n2">' + _idpFig('i_cv_1_choix', 'Capture : choisir comment commencer', 'Elle choisit comment commencer') +
      _idpFig('i_cv_2_objectif', 'Capture : dire ce que l’on cherche', 'Elle dit ce qu’elle cherche') + '</div>' });

  d.push({ notes: 'Troisième écran : des propositions déjà prêtes à cocher : la personne choisit celles qui lui ressemblent. Quatrième écran : son profil, ses compétences repérées et des métiers à regarder.',
    html: '<h2><i class="bi bi-file-earmark-person" aria-hidden="true"></i>Camille crée son CV (2/2)</h2>' + _idpBarreEtapes([2, 3]) +
      '<div class="idp-images idp-n2">' + _idpFig('i_cv_3_parcours', 'Capture : choisir ce qui compte', 'Elle choisit ce qui compte pour elle') +
      _idpFig('i_cv_4_profil', 'Capture : découvrir son profil', 'Elle découvre son profil') + '</div>' });

  d.push({ notes: 'Dire le chiffre, il est lu dans l’application et suit chaque modèle ajouté. Le texte ne change jamais, seule la présentation change.',
    html: '<h2><i class="bi bi-palette" aria-hidden="true"></i>Un CV qui vous ressemble</h2><div class="idp-colonnes"><div><p class="idp-grand">' + _introPhraseModeles() + '.</p>' +
      '<p style="margin-top:1.2cqw">Vous choisissez couleurs, formes et mise en page. Votre texte ne change jamais.</p></div>' +
      '<div class="idp-images idp-n2">' + _idpFig('modeles_creatifs', 'Modèles de CV créatifs', '') + _idpFig('modele_grand', 'Un modèle de CV en grand', '') + '</div></div>' });

  d.push({ notes: 'La lettre se construit avec l’assistant, phrase par phrase. Rappeler que les réponses montrées sont des exemples.',
    html: '<h2><i class="bi bi-envelope-paper" aria-hidden="true"></i>Votre lettre de motivation</h2><p class="idp-sous">Écrite avec un assistant, phrase par phrase, en prenant le temps.</p>' +
      '<div class="idp-images idp-n2">' + _idpFig('i_lettre_1_preparer', 'Capture : préparer la lettre', 'Vous déposez votre CV et dites à qui vous écrivez') +
      _idpFig('i_lettre_2_mise_en_page', 'Capture : mise en page de la lettre', 'La lettre mise en page : modèle, couleur, police') + '</div>' });

  d.push({ notes: 'On peut répondre à l’écrit ou à voix haute. L’assistant réagit, sans note ni jugement.',
    html: '<h2><i class="bi bi-chat-dots" aria-hidden="true"></i>S’entraîner à l’entretien</h2><div class="idp-colonnes"><p class="idp-grand">Vous répondez à des questions d’entretien, à l’écrit ou à voix haute. L’assistant réagit à vos réponses.</p>' +
      _idpFig('i_entretien_1_resultat', 'Capture : résultat de la préparation', 'Votre préparation est enregistrée et mise en page') + '</div>' });

  d.push({ notes: 'Avant de postuler : un regard sur le CV. Ce qui est solide, ce qui peut faire hésiter, des pistes concrètes. Évoquer en une phrase les autres outils (regard recruteur, comparaison avec une offre, cohérence).',
    html: '<h2><i class="bi bi-search" aria-hidden="true"></i>Vérifier la solidité de votre candidature</h2><p class="idp-sous">Ce qui est solide, ce qui peut faire hésiter, des pistes pour renforcer.</p>' +
      '<div class="idp-images idp-n2">' + _idpFig('i_bilan_2_resultat', 'Capture : résultat de l’analyse', 'Un résultat clair') +
      _idpFig('i_bilan_3_resultat', 'Capture : pistes concrètes', 'Des pistes, de la plus importante à la moindre') + '</div>' });

  if (territoire.length) {
    d.push({ notes: 'Des repères sur le département, expliqués simplement et datés. Pour les employeurs et les structures : adresses vérifiées avec leur date.',
      html: '<h2><i class="bi bi-geo-alt" aria-hidden="true"></i>Comprendre ce qui se passe près de chez vous</h2><div class="idp-colonnes idp-egal"><ul class="idp-liste">' +
        territoire.map(function (o) { return _idpLigne(o.icone, o.court || o.libelle); }).join('') + '</ul>' +
        (imagesTerritoire.length ? '<div class="idp-images ' + (imagesTerritoire.length === 2 ? 'idp-n2' : 'idp-n1') + '">' +
          imagesTerritoire.map(function (im) { return _idpFig(im.fichier, 'Capture dans l’outil « ' + im.libelle + ' »', ''); }).join('') + '</div>' : '') + '</div>' });
  }

  d.push({ notes: 'Deux mots seulement : la boîte à outils et l’aide à l’hésitation. Pas de détail.',
    html: '<h2><i class="bi bi-plus-circle" aria-hidden="true"></i>Et aussi</h2><ul class="idp-liste">' +
      _idpLigne('bi-briefcase', '<strong>Une boîte à outils</strong> : garder vos réflexions, noter librement, chercher un mot, découvrir vos compétences') +
      _idpLigne('bi-signpost-split', '<strong>Si vous hésitez</strong> : comparer vos pistes de métier') + '</ul>' });

  d.push({ notes: 'Les quatre principes. C’est la diapositive sur laquelle on peut prendre le plus de temps avec un groupe de professionnels.',
    html: '<h2><i class="bi bi-lightbulb" aria-hidden="true"></i>Ce qui guide cette application</h2><ul class="idp-liste">' +
      _idpLigne('bi-clock', '<strong>Votre rythme</strong> : aucune obligation, aucun délai') +
      _idpLigne('bi-slash-circle', '<strong>Pas de note, pas de comparaison</strong>') +
      _idpLigne('bi-door-open', '<strong>Simple d’accès</strong> : pas de compte, rien à installer') +
      _idpLigne('bi-person-check', '<strong>Vous restez l’auteur</strong> : l’assistant propose, vous décidez') + '</ul>' });

  d.push({ notes: 'Question qui revient toujours. Réponse simple : tout reste sur l’appareil, rien n’est gardé. La disquette sert à retrouver son travail.',
    html: '<h2><i class="bi bi-shield-lock" aria-hidden="true"></i>Vos informations</h2><ul class="idp-liste">' +
      _idpLigne('bi-laptop', 'Elles restent <strong>sur votre appareil</strong>, tant que la page est ouverte') +
      _idpLigne('bi-floppy', 'La <strong>disquette</strong> les enregistre dans un fichier, chez vous') +
      _idpLigne('bi-eye-slash', 'Vous pouvez <strong>masquer</strong> votre nom, votre téléphone et votre e-mail avant d’écrire à l’assistant') + '</ul>' });

  d.push({ notes: 'Pour un public de conseillers uniquement. À passer si la salle est composée de personnes accompagnées.',
    html: '<h2><i class="bi bi-people" aria-hidden="true"></i>Pour les professionnels de l’accompagnement</h2><ul class="idp-liste">' +
      _idpLigne('bi-check2', 'Seul ou <strong>pendant un rendez-vous</strong>') +
      _idpLigne('bi-check2', '<strong>Aucun compte</strong>, aucun serveur qui garde les données') +
      _idpLigne('bi-check2', 'La personne <strong>choisit</strong> ce qu’elle garde ou aborde avec son conseiller') +
      (avecAnnuaire ? _idpLigne('bi-check2', 'Des adresses utiles, <strong>datées</strong>, pour préparer un rendez-vous') : '') + '</ul>' });

  d.push({ notes: 'Pour un public de professionnels, à passer sinon. Répondre à la question « d’où viennent ces informations ? » : elles ne sont pas inventées. Un outil que je garde pour moi surveille les sources officielles ; chaque changement attend dans un sas, où je le relis avant de le publier. Ce sont de vrais écrans de l’outil (les dates de la barre de suivi sont des exemples).',
    html: '<h2><i class="bi bi-patch-check" aria-hidden="true"></i>Rien n’est inventé</h2><p class="idp-sous">Derrière l’application, un outil de veille et un sas de validation.</p>' +
      '<div class="idp-images idp-n2">' + _idpFig('i_veille_1_accueil', 'Capture : la première page de l’outil de veille', 'La veille : ce qu’il y a à vérifier, et quand') +
      _idpFig('i_veille_2_sas', 'Capture : le sas des propositions en attente', 'Le sas : rien n’est public avant d’être relu') + '</div>' });

  d.push({ notes: 'Pour un public de professionnels, à passer sinon. Dire : je m’en sers moi aussi. C’est un second outil, privé, pour repérer les entreprises à contacter, les trier en trois temps, garder mes notes. L’écran montré est un exemple, aucune vraie entreprise n’y figure.',
    html: '<h2><i class="bi bi-building" aria-hidden="true"></i>Repérer les employeurs</h2><div class="idp-colonnes"><p class="idp-grand">Un second outil, privé : repérer les entreprises à contacter, les trier en trois temps et garder ses notes.</p>' +
      _idpFig('i_prospection_1_carnet', 'Capture : le carnet de l’outil de prospection', 'Écran d’exemple : aucune vraie entreprise n’est montrée') + '</div>' });

  d.push({ notes: 'Conclure. Ouvrir l’application devant le groupe et faire cliquer sur une carte de l’accueil.',
    html: _idpCentre('bi-compass', '<h2>À vous de jouer</h2>', '<p class="idp-grand">Choisissez un point de départ.<br>Rien n’est obligatoire, vous pouvez vous arrêter et revenir.</p>') });
  return d;
}

function _idpAfficher(i) {
  var cadre = document.getElementById('idpCadre');
  if (!cadre) { return; }
  _idpIndex = introBornerDiapo(i, _idpDiapos.length);
  var diapo = _idpDiapos[_idpIndex];
  document.getElementById('idpDiapo').innerHTML = diapo.html;
  document.getElementById('idpNotesTexte').innerHTML = '<strong>Notes de l’orateur (diapositive ' + (_idpIndex + 1) + ') :</strong> ' + diapo.notes;
  var points = document.getElementById('idpPoints').children;
  for (var k = 0; k < points.length; k++) {
    points[k].classList.toggle('actif', k === _idpIndex);
    if (k === _idpIndex) { points[k].setAttribute('aria-current', 'true'); } else { points[k].removeAttribute('aria-current'); }
  }
  document.getElementById('idpCompteur').textContent = (_idpIndex + 1) + ' / ' + _idpDiapos.length;
  document.getElementById('idpPrec').disabled = _idpIndex === 0;
  document.getElementById('idpSuiv').disabled = _idpIndex === _idpDiapos.length - 1;
}

function _idpBasculerPleinEcran() {
  var cadre = document.getElementById('idpCadre');
  if (!cadre) { return; }
  if (document.fullscreenElement) { if (document.exitFullscreen) { document.exitFullscreen(); } }
  else if (cadre.requestFullscreen) {
    // Un navigateur ou un vidéoprojecteur qui refuse le plein écran : le diaporama reste simplement affiché dans la page.
    var essai = cadre.requestFullscreen();
    if (essai && essai.catch) { essai.catch(function () {}); }
  }
}

function pageDiaporamaIntroduction() {
  if (!_introOuverte()) { naviguerVers('cv'); return; }
  _idpDiapos = _idpConstruireDiapos();
  _idpIndex = 0;
  var html = '<div class="page-catalogue-contenu idp-page">' +
    '<div class="idp-haut"><button type="button" class="btn btn-outline-primary btn-sm" id="idpBasculeNotes" aria-expanded="false"><i class="bi bi-card-text" aria-hidden="true"></i> Notes de l’orateur</button>' +
    '<span class="idp-aide-clavier">Flèches du clavier pour avancer · F pour le plein écran · Échap pour en sortir</span></div>' +
    '<div class="idp-cadre" id="idpCadre" role="region" aria-label="Diaporama de présentation de l’application">' +
      '<button type="button" class="idp-plein-ecran" id="idpPlein" title="Plein écran (touche F)"><i class="bi bi-arrows-fullscreen" aria-hidden="true"></i> Plein écran</button>' +
      '<div class="idp-diapo" id="idpDiapo" aria-live="polite"></div>' +
      '<div class="idp-pied">' +
        '<button type="button" class="idp-btn" id="idpPrec"><i class="bi bi-arrow-left" aria-hidden="true"></i> Précédent</button>' +
        '<div class="idp-points" id="idpPoints">' + _idpDiapos.map(function (d, k) { return '<button type="button" data-diapo="' + k + '" aria-label="Aller à la diapositive ' + (k + 1) + '"></button>'; }).join('') + '</div>' +
        '<span class="idp-compteur" id="idpCompteur"></span>' +
        '<button type="button" class="idp-btn idp-btn-plein" id="idpSuiv">Suivant <i class="bi bi-arrow-right" aria-hidden="true"></i></button>' +
      '</div>' +
    '</div>' +
    '<div class="idp-notes" id="idpNotesTexte" hidden></div>' +
    '</div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('introduction', null, null, { sansAccueil: true }) + '</div>';
  app.innerHTML = html;

  document.getElementById('idpPrec').addEventListener('click', function () { _idpAfficher(_idpIndex - 1); });
  document.getElementById('idpSuiv').addEventListener('click', function () { _idpAfficher(_idpIndex + 1); });
  document.getElementById('idpPlein').addEventListener('click', _idpBasculerPleinEcran);
  document.getElementById('idpPoints').addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('button[data-diapo]') : null;
    if (b) { _idpAfficher(Number(b.getAttribute('data-diapo'))); }
  });
  var bNotes = document.getElementById('idpBasculeNotes');
  bNotes.addEventListener('click', function () {
    var zone = document.getElementById('idpNotesTexte');
    zone.hidden = !zone.hidden;
    bNotes.setAttribute('aria-expanded', zone.hidden ? 'false' : 'true');
  });
  _idpAfficher(0);
  if (typeof trackEvenement === 'function') { trackEvenement('introduction_diaporama_ouvert'); }
}

// Le clavier : une seule écoute pour toute la session, qui ne fait rien tant que le diaporama n'est pas à l'écran (ni dans un champ de saisie).
function _idpClavier(ev) {
  if (!document.getElementById('idpCadre')) { return; }
  var cible = ev.target && ev.target.tagName ? ev.target.tagName.toLowerCase() : '';
  if (cible === 'input' || cible === 'textarea' || cible === 'select' || ev.ctrlKey || ev.metaKey || ev.altKey) { return; }
  if (ev.key === 'ArrowRight' || ev.key === 'PageDown') { ev.preventDefault(); _idpAfficher(_idpIndex + 1); }
  else if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') { ev.preventDefault(); _idpAfficher(_idpIndex - 1); }
  else if (ev.key === 'f' || ev.key === 'F') { ev.preventDefault(); _idpBasculerPleinEcran(); }
}
if (typeof document !== 'undefined') { document.addEventListener('keydown', _idpClavier); }
