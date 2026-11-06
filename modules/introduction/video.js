/* ============================================================
   Module « Introduction » : page de la vidéo de présentation (interface ; pas de test Node : test navigateur obligatoire).
   Route 'introduction-video' ; fermée au public avec l'Introduction.
   Fichiers : video/presentation.mp4 (image et voix), video/presentation.vtt (sous-titres, AUSSI source du texte affiché sous le lecteur : jamais recopié).
   Fabrication et refonte : docs/video_presentation/LISEZMOI.md. Texte de la voix : docs/SCENARIO_VIDEO_PRESENTATION_2026-11-02.md.
   ============================================================ */

var INTRO_VIDEO_MP4 = 'video/presentation.mp4';
var INTRO_VIDEO_VTT = 'video/presentation.vtt';

function pageVideoIntroduction() {
  if (!_introOuverte()) { naviguerVers('cv'); return; }
  var html = '<div class="page-catalogue-contenu ip-page">' +
    '<div class="text-center"><h1><i class="bi bi-play-circle" aria-hidden="true"></i> La vidéo de présentation</h1>' +
    '<p class="sousTitre">L’application en quelques minutes, avec la voix et les sous-titres.</p></div>' +
    '<div class="ip-video-cadre" id="ipVideoCadre">' +
      '<video id="ipVideo" controls preload="metadata" playsinline>' +
        '<source src="' + INTRO_VIDEO_MP4 + '" type="video/mp4">' +
        '<track kind="subtitles" srclang="fr" label="Français" src="' + INTRO_VIDEO_VTT + '" default>' +
        'Votre navigateur ne sait pas lire cette vidéo.' +
      '</video>' +
    '</div>' +
    '<div class="cv-section" id="ipVideoTexteBloc" hidden><h4><i class="bi bi-card-text" aria-hidden="true"></i> Le texte de la vidéo</h4>' +
      '<div class="ip-video-texte" id="ipVideoTexte"></div></div>' +
    '</div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('introduction', null, null, { sansAccueil: true }) + '</div>';
  app.innerHTML = html;

  var video = document.getElementById('ipVideo');
  var source = video ? video.querySelector('source') : null;
  if (source) {
    source.addEventListener('error', function () {
      var cadre = document.getElementById('ipVideoCadre');
      if (cadre) { cadre.innerHTML = '<p class="ip-video-absente mb-0">La vidéo n’est pas disponible sur cet appareil pour le moment. Le texte ci-dessous la raconte.</p>'; }
    });
  }
  if (video) {
    video.addEventListener('play', function () { if (typeof trackEvenement === 'function') { trackEvenement('introduction_video_lue'); } }, { once: true });
  }
  // Le texte sous le lecteur vient du fichier de sous-titres : une seule source.
  if (typeof fetch === 'function') {
    fetch(INTRO_VIDEO_VTT).then(function (r) { return r.ok ? r.text() : ''; }).then(function (vtt) {
      var phrases = introTexteDepuisVtt(vtt);
      var zone = document.getElementById('ipVideoTexte'), bloc = document.getElementById('ipVideoTexteBloc');
      if (!zone || !bloc || !phrases.length) { return; }
      zone.innerHTML = phrases.map(function (p) { return '<p>' + _introEchapper(p) + '</p>'; }).join('');
      bloc.hidden = false;
    }).catch(function () { /* sans le fichier, le texte n'est simplement pas affiché */ });
  }
  if (typeof trackEvenement === 'function') { trackEvenement('introduction_video_ouverte'); }
}
