/* ============================================================
   cvPdfExport.js
   ------------------------------------------------------------
   Moteur "CV design (PDF)" -- point d'entree appele depuis l'onglet PDF
   de l'etape "Apercu et finalisation" (js/app.js). Construit le panneau
   de reglages interactif (cvPdfPanneauReglages.js) dans une IFRAME
   integree a la page (#zonePdfInlineCV) -- jamais une fenetre/onglet a
   part (retour utilisateur : deroutant pour le public vise). Une iframe
   a son propre document (meme mecanisme d'isolation qu'une popup : CSS
   propre, iframe.contentWindow.print() n'imprime que son contenu, jamais
   le reste de la page) sans jamais faire quitter l'application.

   `dossierSource` est stocke sur la fenetre de l'iframe
   (iframe.contentWindow.__cvPdfDossierSource) AVANT l'ecriture du
   document, pour que son propre script (execute dans son propre
   contexte) puisse rappeler window.parent.construireDonneesPdfCV()
   a chaque changement de reglage (necessaire pour le bandeau de
   disponibilite, qui influence une vraie decision de contenu -- voir
   cvPdfDonnees.js). window.parent (pas window.opener) car une iframe
   expose sa page hote via `parent`, jamais `opener` (reserve aux
   fenetres ouvertes par window.open).
   ============================================================ */

// TACHE (Denis, 2026-09-23 : "le CV doit etre bien plus grand, il ne
// remplit pas la partie de la page qu'il devrait remplir") : bug reel
// confirme -- l'echelle etait calculee sur LARGEUR *ET* HAUTEUR
// (Math.min(dispoL/pageL, dispoH/pageH, 1)) contre un conteneur a hauteur
// FIXE (75vh, voir ouvrirApercuPdfHtml plus bas), alors que la maquette
// (ajusterEchelle(), MAQUETTE_MISE_EN_PAGE_PDF_2026-09-21.html) ne
// contraint QUE la largeur (k = Math.min(1, larg/794)) -- la hauteur suit
// librement, la colonne entiere reste visible via position:sticky (pas un
// conteneur a hauteur limitee). Meme calcul repris ici a l'identique :
// plus de dependance a `conteneurVisible` pour la hauteur.
// TACHE (Denis, 2026-09-23 : "une barre de navigation horizontale, une
// verticale, dans une fenetre qui a deja une barre de navigation... c'est
// moche comme pas possible") : cause reelle trouvee -- .zone-apercu
// (cvPdfPanneauReglages.js) a "overflow: auto; padding: 24px" ; l'iframe
// n'etait dimensionnee QUE sur la taille de .page-a4 (sans les 24px de
// marge tout autour), donc systematiquement 48px trop petite dans les 2
// sens -- .zone-apercu debordait alors de son propre conteneur et
// affichait ses PROPRES scrollbars natives (visibles, reduites par le
// meme transform:scale() que le reste). Mesure desormais .zone-apercu
// elle-meme (scrollWidth/scrollHeight, qui inclut son padding), jamais
// seulement .page-a4.
function _pdfInlineAjusterEchelle(iframe, scaleWrap, conteneurVisible) {
  if (!iframe || !scaleWrap || !conteneurVisible || !iframe.contentDocument) { return; }
  var PAGE_L = 794;
  iframe.style.transform = 'none';
  iframe.style.width = PAGE_L + 'px';
  iframe.style.height = '4000px';
  var page = iframe.contentDocument.querySelector('.page-a4');
  var zoneApercu = iframe.contentDocument.querySelector('.zone-apercu');
  if (!page) { return; }
  var pageH = page.offsetHeight;
  if (!pageH) { return; }
  var pageL = zoneApercu ? zoneApercu.scrollWidth : PAGE_L;
  var pageHTotal = zoneApercu ? zoneApercu.scrollHeight : pageH;
  // Un CV court : la zone remplit toute la hauteur provisoire de l'iframe (4000 px) ; on ne garde que la hauteur reellement occupee
  // (bas de la derniere page + la marge de 24 px), sinon le CV d'une page serait reduit comme s'il en faisait quatre.
  var pagesCV = iframe.contentDocument.querySelectorAll('.page-a4');
  if (pagesCV.length) {
    var dernierePage = pagesCV[pagesCV.length - 1];
    var basUtile = dernierePage.getBoundingClientRect().bottom + (iframe.contentWindow.pageYOffset || 0) + 6;
    if (basUtile > 0 && basUtile < pageHTotal) { pageHTotal = Math.ceil(basUtile); }
  }
  iframe.style.width = pageL + 'px';
  iframe.style.height = pageHTotal + 'px';
  var dispoL = conteneurVisible.clientWidth - 8;
  var echelle = Math.max(0.05, Math.min(dispoL / pageL, 1));
  // Le CV doit tenir EN ENTIER dans l'ecran (hauteur comprise) : la colonne du CV reste collee (sticky) et la personne le voit en entier
  // pendant qu'elle defile dans les reglages, sans barre de defilement propre (2026-09-26). Un CV de deux pages est reduit en consequence
  // (jusqu'a 30 % : en dessous, il devient illisible et garde l'echelle de la largeur, avec un defilement interne).
  if (window.innerHeight > 300) {
    // Place reellement disponible : la colonne collee (max-height 100vh - 6,5rem) moins ce qu'elle contient hors du CV (legende, info-page...).
    var colonneApercu = conteneurVisible.closest ? conteneurVisible.closest('.mep-2col-apercu') : null;
    var horsCV = colonneApercu ? Math.max(0, colonneApercu.scrollHeight - scaleWrap.offsetHeight) : 0;
    var placeCV = colonneApercu ? (window.innerHeight - 104 - horsCV - 6) : (window.innerHeight - 150);
    var echelleHauteur = placeCV / pageHTotal;
    if (echelleHauteur >= 0.3) { echelle = Math.max(0.05, Math.min(echelle, echelleHauteur)); }
  }
  iframe.style.transform = 'scale(' + echelle + ')';
  iframe.style.transformOrigin = 'top left';
  scaleWrap.style.width = (pageL * echelle) + 'px';
  scaleWrap.style.height = (pageHTotal * echelle) + 'px';
}

function ouvrirApercuPdfHtml(type, dossierSource) {
  // TACHE (premier modele demo) : uniquement le CV pour l'instant --
  // Lettre/Entretien restent exclusivement sur le Composeur Word.
  if (type !== 'cv') { return; }
  // Rien a faire si l'onglet PDF n'est pas actuellement affiche (le
  // conteneur ne vit dans le DOM que si etatApercuInline.cv.ongletApercu
  // === 'pdf', voir js/app.js) -- jamais une erreur, simple no-op.
  var conteneur = document.getElementById('zonePdfInlineCV');
  if (!conteneur) { return; }

  var donnees = construireDonneesPdfCV(dossierSource, 'A4-detaille', false);
  var identite = donnees.objetCV.identite || {};
  var nomComplet = [identite.prenom, identite.nom].filter(Boolean).join(' ');
  var html = construirePageInteractivePdfA4(nomComplet, dossierSource);

  // Reconstruit une iframe neuve a chaque appel (meme convention que le
  // reste de l'appli : pageResultats() reconstruit tout le HTML de la
  // page a chaque interaction, ce conteneur est donc de toute facon vide
  // a chaque rerender -- jamais de reutilisation partielle ici).
  // TACHE (retour utilisateur 2026-09-15) : conteneur visible (hauteur/
  // bordure fixes) + un wrap interne (overflow:hidden, redimensionne a la
  // taille reelle du CV a l'echelle -- voir _pdfInlineAjusterEchelle) --
  // meme structure a 2 niveaux que mepGrandColonneCv/mepGrandCvScaleWrap
  // (js/app.js), necessaire pour la meme raison : transform:scale() sur
  // l'iframe ne change jamais sa boite de mise en page reelle, seul son
  // rendu visuel retrecit, un wrap dimensionne a la taille reduite evite
  // donc un debordement scrollable parasite autour d'un CV deja entier.
  // TACHE (Denis, 2026-09-23) : plus de hauteur FIXE (75vh) -- comme la
  // maquette (.cadre-cv, jamais de hauteur imposee), la hauteur suit
  // librement celle du CV a l'echelle calculee ; la colonne entiere reste
  // visible en defilant grace a position:sticky sur .mep-2col-apercu
  // (js/app.js, construireMiseEnPageCV), jamais un conteneur qui coupe/
  // reduit le CV pour tenir dans un cadre trop petit.
  var conteneurVisible = document.createElement('div');
  conteneurVisible.style.cssText = 'width:100%;overflow:hidden;display:flex;align-items:flex-start;justify-content:center;' +
    'border:1px solid var(--border);border-radius:8px;background:var(--bg-subtle);padding:4px;';
  var scaleWrap = document.createElement('div');
  // TACHE (retour utilisateur 2026-09-15, bug reel confirme : "une image
  // de CV en grand format apparait une microseconde puis retrecit") :
  // avant que _pdfInlineAjusterEchelle() calcule et applique l'echelle
  // (delai ci-dessous), l'iframe existe deja a sa taille NATURELLE
  // (794x1123px, non reduite) -- visible une fraction de seconde a
  // pleine taille dans le conteneur avant de retrecir a la bonne echelle.
  // Cache visuellement (visibility, jamais display:none -- l'iframe doit
  // quand meme se mettre en page normalement pour que la mesure de
  // hauteur reste juste) le temps de ce calcul, revele juste apres.
  scaleWrap.style.cssText = 'flex:0 0 auto;overflow:hidden;visibility:hidden;';
  var iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'Aperçu CV design (PDF)');
  // TACHE (retour utilisateur 2026-09-13, LECONS 9.1) : bordure/fond fixes
  // (#E5E7EB / #e9e9e9) jamais adaptes au mode sombre -- l'iframe est un
  // element du document PARENT (celui de js/app.js), les variables de
  // theme de style.css s'y appliquent normalement, meme motif deja
  // utilise pour le cadre de #zoneApercuInline (apercu Word).
  iframe.style.cssText = 'border:none;background:#fff;width:794px;height:1123px;';
  scaleWrap.appendChild(iframe);
  conteneurVisible.appendChild(scaleWrap);
  conteneur.innerHTML = '';
  conteneur.appendChild(conteneurVisible);
  iframe.contentWindow.__cvPdfDossierSource = dossierSource;
  // TACHE (retour utilisateur : "Personnaliser doit m'emmener direct dans
  // le grand aperçu -- le petit aperçu embarqué reste juste un aperçu")
  // : drapeau lu par cvPdfPanneauReglages.js (btnPersonnaliserPdf) pour
  // distinguer cette instance embarquée (75vh) de celle ouverte en plein
  // écran par ouvrirGrandApercuPdf() (js/app.js, meme HTML reutilise tel
  // quel) -- jamais une 2e copie du panneau a maintenir pour ca.
  iframe.contentWindow.__cvPdfModeGrandApercu = false;
  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();
  // Apercu integre : aucune barre de defilement dans le cadre (le CV est mis a l'echelle pour tenir), marge reduite autour de la feuille
  // pour que le CV occupe toute la place disponible (2026-09-26, demande de Denis).
  try {
    var styleApercuIntegre = iframe.contentDocument.createElement('style');
    styleApercuIntegre.textContent = 'html,body{overflow:hidden !important;} .zone-apercu{padding:6px !important;overflow:hidden !important;}';
    iframe.contentDocument.head.appendChild(styleApercuIntegre);
  } catch (e) { /* l'apercu reste utilisable avec ses marges d'origine */ }
  // TACHE (retour utilisateur 2026-09-15) : delai court, le temps que
  // l'iframe applique sa propre mise en page (meme delai que
  // _mepGrandAjusterEchelleCv, js/app.js) -- une mesure immediate peut
  // encore lire une hauteur non stabilisee. La revelation (visibility)
  // est TOUJOURS executee juste apres, meme si _pdfInlineAjusterEchelle
  // s'arrete plus tot (page introuvable...) -- jamais un apercu qui
  // resterait invisible pour de bon.
  setTimeout(function () {
    _pdfInlineAjusterEchelle(iframe, scaleWrap, conteneurVisible);
    scaleWrap.style.visibility = 'visible';
  }, 30);
  // Quand la fenetre change de taille apres l'affichage (fenetre redimensionnee, panneau elargi), le CV est re-mis a l'echelle :
  // avant, il gardait l'echelle du moment de l'ouverture et depassait sur les cotes (2026-09-26).
  window._pdfInlineDerniersElements = { iframe: iframe, scaleWrap: scaleWrap, conteneurVisible: conteneurVisible };
  if (!window._pdfInlineResizeCable) {
    window._pdfInlineResizeCable = true;
    window.addEventListener('resize', function () {
      clearTimeout(window._pdfInlineResizeMinuteur);
      window._pdfInlineResizeMinuteur = setTimeout(function () {
        var e = window._pdfInlineDerniersElements;
        if (e && e.iframe && e.iframe.isConnected) { _pdfInlineAjusterEchelle(e.iframe, e.scaleWrap, e.conteneurVisible); }
      }, 150);
    });
  }
}
