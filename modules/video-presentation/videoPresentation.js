/* Vidéos de présentation des modules et des parcours (lot E, consigne 178, décision de Denis le 08/11/2026).
   UN SEUL composant, partout le même geste : un bouton-ligne avec une vignette tirée de la vraie vidéo ; un clic déplie le lecteur à la même place, un clic sur le même bouton le referme.
   Règles : jamais de lecteur ouvert d'office, jamais de lecture automatique (le son ne démarre jamais tout seul), jamais de passage obligatoire, aucune mémoire « déjà vue » (pas de compte, navigation privée possible) :
   deux états seulement, fermé / ouvert. Aucune fenêtre. Pages concernées : voir VIDEOS_PRESENTATION ci-dessous (clé = nom du fichier dans videos/modules/).
   Deuxième forme, pour les petits passages explicatifs À L'INTÉRIEUR d'un module (masquer, coller la réponse, PDF, Word...) : htmlVideoGeste('<clé>'), une « ligne à filet » sans vignette (consigne 179, choisie par Denis le 08/11/2026),
   même geste (un clic déplie, un clic referme). Les anciennes vidéos et leur fenêtre sont retirées.
   Source unique de la table : ce fichier. Les pages appellent htmlVideoPresentation('<clé>') ; le clic est géré par UN écouteur sur le document (aucun câblage page par page). */
(function (racine) {
  'use strict';

  // Une entrée par vidéo. fichier et vignette : chemins relatifs à la racine du site. libelle / sous : textes du bouton fermé (facultatifs).
  var VIDEOS_PRESENTATION = {
    carnet:               { titre: 'Mon Carnet' },
    lexique:              { titre: 'Le Lexique' },
    reperes:              { titre: 'Mes Repères' },
    competences:          { titre: 'Découvrir mes compétences' },
    regard:               { titre: 'Un regard sur mon CV' },
    ats:                  { titre: 'Les mots de votre CV' },
    bilan:                { titre: 'Analyser ma candidature' },
    coherence:            { titre: 'Cohérence de mon dossier' },
    lettre:               { titre: 'Écrire ma lettre avec l’assistant' },
    entretien:            { titre: 'M’entraîner à un entretien' },
    employeurs:           { titre: 'Employeurs près de chez moi' },
    cadre:                { titre: 'Comprendre le cadre' },
    chiffres:             { titre: 'Comprendre les chiffres' },
    quifaitquoi:          { titre: 'Qui fait quoi' },
    pistes:               { titre: 'Comparer mes pistes' },
    ucpm:                 { titre: 'Un CV, plusieurs métiers' },
    'creer-main':         { titre: 'Créer mon CV à la main', libelle: 'Voir ce parcours en vidéo' },
    'creer-assistant':    { titre: 'Créer mon CV avec l’assistant', libelle: 'Voir ce parcours en vidéo' },
    'creer-recit':        { titre: 'Créer mon CV à partir de mon récit', libelle: 'Voir ce parcours en vidéo' },
    'reprendre-garder':   { titre: 'Reprendre mon CV : le garder et le compléter', libelle: 'Voir cette voie en vidéo' },
    'reprendre-reformuler': { titre: 'Reprendre mon CV : le reformuler et le présenter', libelle: 'Voir cette voie en vidéo' },
    'reprendre-sans':     { titre: 'Reprendre mon CV : le refaire moi-même', libelle: 'Voir cette voie en vidéo' },
    'pret-lettre':        { titre: 'Ma lettre de motivation rapide', libelle: 'Voir ce parcours en vidéo' },
    'pret-entretien':     { titre: 'Ma fiche de préparation à l’entretien', libelle: 'Voir ce parcours en vidéo' }
  };
  // Les petits passages à l'intérieur d'un module : fichier = chemin relatif à la racine du site ; libelle = ce qu'on va voir ; duree = durée affichée.
  var VIDEOS_GESTES = {
    'masquer-texte': { fichier: 'videos/gestes/masquer-texte.mp4', libelle: 'Voir comment masquer un texte', duree: '27 s' },
    'masquer-image': { fichier: 'videos/pilotes/masquer-image.mp4', libelle: 'Voir comment masquer sur une image', duree: '30 s' },
    'coller-reponse': { fichier: 'videos/gestes/coller-reponse.mp4', libelle: 'Voir comment coller la réponse', duree: '25 s' },
    'cv-pdf': { fichier: 'videos/gestes/cv-pdf.mp4', libelle: 'Voir comment enregistrer en PDF', duree: '26 s' },
    'cv-word': { fichier: 'videos/gestes/cv-word.mp4', libelle: 'Voir comment télécharger en Word', duree: '24 s' },
    'importer-cv': { fichier: 'videos/gestes/importer-cv.mp4', libelle: 'Voir comment importer son CV', duree: '27 s' },
    'affichage': { fichier: 'videos/gestes/affichage.mp4', libelle: 'Voir comment régler l’affichage', duree: '25 s' },
    'aide': { fichier: 'videos/gestes/aide.mp4', libelle: 'Voir comment fonctionne l’aide', duree: '18 s' },
    'deuxieme-regard': { fichier: 'videos/gestes/deuxieme-regard.mp4', libelle: 'Voir comment demander un deuxième regard', duree: '25 s' },
    'lexique-recherche': { fichier: 'videos/gestes/lexique.mp4', libelle: 'Voir comment chercher un mot', duree: '23 s' },
    'chatgpt-demande': { fichier: 'videos/gestes/chatgpt-demande.mp4', libelle: 'Voir comment faire sur ChatGPT', duree: '33 s' },
    'perplexity-demande': { fichier: 'videos/gestes/perplexity-demande.mp4', libelle: 'Voir comment faire sur Perplexity', duree: '31 s' },
    'modele': { fichier: 'videos/gestes/modele.mp4', libelle: 'Voir comment choisir un modèle', duree: '22 s' },
    'mise-en-page': { fichier: 'videos/gestes/mise-en-page.mp4', libelle: 'Voir comment régler la mise en page', duree: '28 s' },
    'rubriques': { fichier: 'videos/gestes/rubriques.mp4', libelle: 'Voir comment choisir ses rubriques', duree: '25 s' },
    'disquette': { fichier: 'videos/pilotes/disquette.mp4', libelle: 'Voir à quoi sert la disquette', duree: '25 s' },
    'projet': { fichier: 'videos/gestes/projet.mp4', libelle: 'Voir comment remplir cette page', duree: '28 s' }
  };
  var LIBELLE_PAR_DEFAUT = 'Voir la présentation en vidéo';
  var SOUS_PAR_DEFAUT = 'En images, avec des sous-titres.';
  var LIBELLE_OUVERT = 'Fermer la vidéo';

  function echapper(t) {
    return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fichierVideo(id) { return 'videos/modules/' + id + '.mp4'; }
  function fichierVignette(id) { return 'videos/modules/vignettes/' + id + '.jpg'; }

  // Le bouton FERMÉ (le lecteur se déplie au clic, voir l'écouteur plus bas). Chaîne vide si la clé est inconnue : aucun lien mort.
  function htmlVideoPresentation(id) {
    var v = VIDEOS_PRESENTATION[id];
    if (!v) { return ''; }
    var libelle = v.libelle || LIBELLE_PAR_DEFAUT;
    var sous = v.sous || SOUS_PAR_DEFAUT;
    return '<div class="vp" data-video-presentation="' + echapper(id) + '" data-vp-fichier="' + fichierVideo(id) + '">' +
      '<button type="button" class="vp-bouton" data-vp-bouton aria-expanded="false" ' +
        'data-vp-libelle="' + echapper(libelle) + '" data-vp-sous="' + echapper(sous) + '" aria-label="' + echapper(libelle + ' : ' + v.titre) + '">' +
        '<span class="vp-vignette"><img src="' + fichierVignette(id) + '" alt="" loading="lazy" decoding="async">' +
        '<span class="vp-icone" aria-hidden="true">&#9654;</span></span>' +
        '<span class="vp-texte"><strong data-vp-titre>' + echapper(libelle) + '</strong><span data-vp-soustexte>' + echapper(sous) + '</span></span>' +
        '<span class="vp-duree" data-vp-duree>1 min</span>' +
        '<span class="vp-chevron" aria-hidden="true">&#9662;</span>' +
      '</button></div>';
  }

  // Le petit passage d'un module : la ligne à filet, sans vignette. Chaîne vide si la clé est inconnue. `libelle` (facultatif) remplace le texte du bouton.
  function htmlVideoGeste(id, libelle) {
    var v = VIDEOS_GESTES[id];
    if (!v) { return ''; }
    var texte = libelle || v.libelle;
    return '<div class="vm" data-video-presentation="' + echapper(id) + '" data-vp-fichier="' + echapper(v.fichier) + '">' +
      '<button type="button" class="vm-bouton" data-vp-bouton aria-expanded="false" data-vp-libelle="' + echapper(texte) + '">' +
        '<span class="vm-icone" aria-hidden="true">&#9654;</span>' +
        '<span class="vm-texte"><strong data-vp-titre>' + echapper(texte) + '</strong></span>' +
        '<span class="vm-duree" data-vp-duree>' + echapper(v.duree) + '</span>' +
        '<span class="vm-chevron" aria-hidden="true">&#9662;</span>' +
      '</button></div>';
  }

  // Bascule d'une zone (fermé <-> ouvert), sans rien retenir : le lecteur est créé à l'ouverture et retiré à la fermeture.
  function basculerVideoPresentation(zone) {
    if (!zone || typeof document === 'undefined') { return; }
    var fichier = zone.getAttribute('data-vp-fichier');
    var bouton = zone.querySelector('[data-vp-bouton]');
    if (!fichier || !bouton) { return; }
    var titre = bouton.querySelector('[data-vp-titre]');
    var sous = bouton.querySelector('[data-vp-soustexte]');
    var duree = bouton.querySelector('[data-vp-duree]');
    var lecteur = zone.querySelector('.vp-lecteur');
    if (lecteur) {
      // Fermeture : on arrête la lecture avant de retirer le lecteur.
      var ancienne = lecteur.querySelector('video');
      if (ancienne) { try { ancienne.pause(); ancienne.removeAttribute('src'); ancienne.load(); } catch (e) { /* rien à faire */ } }
      lecteur.parentNode.removeChild(lecteur);
      zone.classList.remove('ouvert');
      bouton.setAttribute('aria-expanded', 'false');
      if (titre) { titre.textContent = bouton.getAttribute('data-vp-libelle'); }
      if (sous) { sous.textContent = bouton.getAttribute('data-vp-sous'); sous.style.display = ''; }
      if (duree) { duree.style.display = ''; }
      return;
    }
    // Ouverture : le lecteur apparaît sous le bouton. Pas d'autoplay, pas de « muted » : la personne lance elle-même la lecture.
    var bloc = document.createElement('div');
    bloc.className = 'vp-lecteur';
    var video = document.createElement('video');
    video.setAttribute('controls', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('preload', 'metadata');
    video.setAttribute('src', fichier);
    var note = document.createElement('p');
    note.className = 'vp-note';
    note.textContent = 'Les sous-titres sont dans l’image. Le son est celui de la voix : il ne démarre jamais tout seul.';
    video.addEventListener('error', function () {
      note.textContent = 'Cette vidéo n’a pas pu être chargée. Vous pouvez continuer sans elle : tout ce qu’elle montre est expliqué sur cette page.';
    });
    bloc.appendChild(video);
    bloc.appendChild(note);
    zone.appendChild(bloc);
    zone.classList.add('ouvert');
    bouton.setAttribute('aria-expanded', 'true');
    if (titre) { titre.textContent = LIBELLE_OUVERT; }
    if (sous) { sous.style.display = 'none'; }
    if (duree) { duree.style.display = 'none'; }
  }

  // Les deux panneaux flottants écrits dans index.html (Affichage, Besoin d'aide) : la ligne est (re)posée à chaque ouverture ou fermeture du panneau,
  // donc elle est toujours fermée à l'arrivée et la vidéo s'arrête quand le panneau se ferme (l'élément <video> est détruit).
  function brancherVideoGestePanneau(idPanneau, idZone, cle) {
    var panneau = document.getElementById(idPanneau);
    var zone = document.getElementById(idZone);
    if (!panneau || !zone) { return; }
    var poser = function () { zone.innerHTML = htmlVideoGeste(cle); };
    poser();
    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(poser).observe(panneau, { attributes: true, attributeFilter: ['hidden'] });
    }
  }
  function brancherPanneaux() {
    brancherVideoGestePanneau('panneauPreferencesAffichage', 'zoneVideoAffichage', 'affichage');
    brancherVideoGestePanneau('panneauAide', 'zoneVideoAide', 'aide');
    brancherVideoGestePanneau('panneauSessionTransfert', 'zoneVideoSession', 'disquette');
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', brancherPanneaux); } else { brancherPanneaux(); }
  }

  // Un seul écouteur pour toute l'application (un seul écouteur, aucun câblage page par page) : fonctionne quel que soit l'écran qui a rendu le bouton.
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('click', function (e) {
      var bouton = e.target && e.target.closest ? e.target.closest('[data-vp-bouton]') : null;
      if (!bouton) { return; }
      basculerVideoPresentation(bouton.closest('[data-video-presentation]'));
    });
  }

  racine.VIDEOS_PRESENTATION = VIDEOS_PRESENTATION;
  racine.VIDEOS_GESTES = VIDEOS_GESTES;
  racine.htmlVideoPresentation = htmlVideoPresentation;
  racine.htmlVideoGeste = htmlVideoGeste;
  racine.basculerVideoPresentation = basculerVideoPresentation;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VIDEOS_PRESENTATION: VIDEOS_PRESENTATION, VIDEOS_GESTES: VIDEOS_GESTES, htmlVideoPresentation: htmlVideoPresentation, htmlVideoGeste: htmlVideoGeste, fichierVideo: fichierVideo, fichierVignette: fichierVignette };
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
