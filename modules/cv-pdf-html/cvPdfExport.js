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

// TACHE (retour utilisateur 2026-09-15) : "juste apres avoir choisi le
// format PDF, je veux voir le CV en integralite -- dans l'apercu a taille
// reelle c'est le cas, pourquoi pas ici ?" -- meme mecanique de mise a
// l'echelle que _mepGrandAjusterEchelleCv (js/app.js, grand apercu PDF) :
// mesure la hauteur reelle de .page-a4 (min-height, grandit avec le
// contenu) en 2 temps (iframe agrandie a une hauteur genereuse d'abord,
// jamais une mesure faussee par la taille d'un rendu precedent), puis
// transform:scale() pour faire tenir la page entiere dans le conteneur,
// jamais un CV coupe qu'il faudrait faire defiler pour voir le bas.
function _pdfInlineAjusterEchelle(iframe, scaleWrap, conteneurVisible) {
  if (!iframe || !scaleWrap || !conteneurVisible || !iframe.contentDocument) { return; }
  var PAGE_L = 794;
  iframe.style.transform = 'none';
  iframe.style.width = PAGE_L + 'px';
  iframe.style.height = '4000px';
  var page = iframe.contentDocument.querySelector('.page-a4');
  if (!page) { return; }
  var pageL = PAGE_L, pageH = page.offsetHeight;
  if (!pageH) { return; }
  iframe.style.width = pageL + 'px';
  iframe.style.height = pageH + 'px';
  var dispoL = conteneurVisible.clientWidth - 16, dispoH = conteneurVisible.clientHeight - 16;
  var echelle = Math.max(0.05, Math.min(dispoL / pageL, dispoH / pageH, 1));
  iframe.style.transform = 'scale(' + echelle + ')';
  iframe.style.transformOrigin = 'top left';
  scaleWrap.style.width = (pageL * echelle) + 'px';
  scaleWrap.style.height = (pageH * echelle) + 'px';
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
  var conteneurVisible = document.createElement('div');
  conteneurVisible.style.cssText = 'width:100%;height:75vh;min-height:480px;overflow:hidden;display:flex;align-items:flex-start;justify-content:center;' +
    'border:1px solid var(--border);border-radius:8px;background:var(--bg-subtle);';
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
}
