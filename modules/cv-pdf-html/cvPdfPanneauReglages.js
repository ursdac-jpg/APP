/* ============================================================
   cvPdfPanneauReglages.js
   ------------------------------------------------------------
   Moteur "CV design (PDF)" -- construit le document INTERACTIF ecrit
   dans l'iframe integree ouverte par cvPdfExport.js (#zonePdfInlineCV,
   js/app.js) : un panneau de reglages a gauche (toutes les options
   portees depuis le Word) + un apercu du CV a droite, mis a jour EN
   DIRECT a chaque changement.

   Fonctionnement : ce document, une fois ecrit dans l'iframe, n'a PAS sa
   propre copie de la logique de rendu -- il rappelle les fonctions de la
   page qui l'heberge (`window.parent`, jamais `window.opener` -- une
   iframe n'est pas une fenetre ouverte par window.open) :
     - window.parent.construireDonneesPdfCV(dossierSource, formatPage, bandeauDisponibilite)
       -- reconstruit les DONNEES a chaque changement (necessaire car
       bandeauDisponibilite influence une vraie decision de contenu du
       moteur partage, pas juste le rendu -- voir cvPdfDonnees.js).
     - window.parent._pdfConstruireStyleEtPage(objetCV, composition, options)
       -- reconstruit le CSS + le HTML de la page (cvPdfTemplateA4.js).
   Jamais une 2e logique de rendu/decision ecrite ici : ce fichier ne
   contient que le panneau (controles + orchestration), zero logique
   metier propre.
   ============================================================ */

// Construit le document HTML complet du panneau interactif.
// `dossierSource` est stocke sur la fenetre ouverte par cvPdfExport.js
// (window.__cvPdfDossierSource) AVANT l'ecriture de ce document -- ce
// fichier suppose seulement que cette variable existera au chargement.
// TACHE (bouton "Mettre en avant + regrouper", port depuis le Word) :
// `dossierSource` en 2e parametre (uniquement pour decider, ICI, a la
// CONSTRUCTION du panneau, si la checkbox "regRegroupementActif" a un
// sens a proposer -- meme condition que le Word, js/app.js:16494-16498)
// -- jamais utilise pour le contenu du CV lui-meme, deja gere par
// window.__cvPdfDossierSource/construireDonneesPdfCV plus bas.
function construirePageInteractivePdfA4(nomComplet, dossierSource) {
  var recoRegroupement = (dossierSource && dossierSource.ia && dossierSource.ia.cv && dossierSource.ia.cv.recommandations && dossierSource.ia.cv.recommandations.regroupementExperiences) || {};
  // TACHE (chantier "experiencesRetenues") : meme regle que le Word
  // (js/app.js) -- au moins une experience retenue valide, jamais un objet
  // unique.
  var experiencesRetenuesRegroupement = recoRegroupement.experiencesRetenues || [];
  var aUneRetenueRegroupement = experiencesRetenuesRegroupement.some(function (e) {
    return (e.type === 'professionnelle' && e.poste) || (e.type === 'personnelle' && e.intitule);
  });
  var aDesGroupesRegroupement = (recoRegroupement.groupes || []).length > 0;
  var regroupementUtilisable = !!(aUneRetenueRegroupement || aDesGroupesRegroupement);
  return '<!DOCTYPE html>' +
'<html lang="fr"><head><meta charset="UTF-8"><title>CV design (PDF) - ' + _pdfEscaperHtml(nomComplet) + '</title>' +
'<style id="styleChrome">' +
'  * { box-sizing: border-box; }' +
'  body { margin: 0; font-family: "Segoe UI", Arial, sans-serif; background: #e9e9e9; display: flex; height: 100vh; overflow: hidden; }' +
// TACHE (retour utilisateur : "les options sur le cote, pas au-dessus du
// CV -- ca le retrecit trop, je ne peux pas voir l'ensemble... reprendre
// exactement le meme positionnement que cote Word") : les cartes (avant
// dans une rangee pleine largeur AU-DESSUS de tout, .barre-outils-pdf)
// rejoignent desormais .panneau-reglages, tout en haut -- meme colonne
// que le Word (js/app.js:15949-16054, cartes + ATS + format directement
// dans la colonne de reglages, jamais au-dessus de l'apercu). Body est
// directement la rangee panneau-reglages/zone-apercu, .corps-pdf n'a plus
// de raison d'etre (plus de rangee superieure a placer avant elle).
// TACHE (retour utilisateur 2026-09-14, "j'ai le panneau des options en
// double pour le PDF") : ce panneau (.panneau-reglages) restait toujours
// affiche, meme dans le petit apercu embarque de "Creer mon CV" -- qui a
// pourtant deja SON PROPRE panneau de reglages, cote parent (le nouveau
// commutateur Simple/Je debute/Je veux tout regler, construireMiseEnPageCV(),
// js/app.js). Les 2 panneaux de reglages cote a cote pour la meme action
// n'avaient aucun sens. Masque par defaut ; seul le grand apercu plein
// ecran (body.mode-grand-apercu, ci-dessous) le reaffiche -- c'est le SEUL
// contexte ou ce panneau est encore la vraie interface de reglages, le
// petit apercu n'etant plus qu'un apercu pilote depuis l'exterieur.
// Elements gardes dans le DOM (juste caches, jamais retires) : le
// commutateur parent pilote certains boutons d'ici par un clic
// programmatique (_mepClicMoteur(), js/app.js) qui a besoin qu'ils
// existent toujours, meme invisibles.
'  .panneau-reglages { display: none; width: 300px; flex-shrink: 0; background: #222; color: #fff; padding: 16px; overflow-y: auto; flex-direction: column; }' +
'  body.mode-grand-apercu .panneau-reglages { display: flex; }' +
// TACHE (retour utilisateur : "ce n'est pas tres joyeux sur un fond noir,
// je veux que ca ressemble exactement au cote Word") : cartes blanches a
// bordure fine (equivalent visuel de btn-outline-secondary Bootstrap,
// jamais charge dans cette iframe -- CSS maison reproduisant le meme
// rendu), icone en grand au-dessus du libelle, meme esprit que les cartes
// Word (js/app.js:15949-16054) -- 2 par ligne ici (grille, pas 1 rangee
// pleine largeur) : la colonne ne fait que 300px, contrairement a la
// pleine largeur de page dont dispose le Word.
'  .rangee-cartes-pdf { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; flex-shrink: 0; }' +
'  .carte-outil-pdf { flex: 1 1 calc(50% - 4px); min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.15rem; ' +
'padding: 0.7rem 0.4rem; border: 1px solid #555; border-radius: 12px; background: #333; color: #fff; font-size: 0.72rem; font-weight: 700; cursor: pointer; text-align: center; white-space: nowrap; }' +
'  .carte-outil-pdf:hover { background: #3d3d3d; border-color: #777; }' +
'  .carte-outil-pdf .icone-outil { font-size: 1.4rem; line-height: 1; }' +
'  .carte-outil-pdf.aleatoire { border: none; background: linear-gradient(135deg, #7c3aed, #db2777); color: #fff; }' +
'  .carte-outil-pdf.aleatoire:hover { filter: brightness(1.1); }' +
// TACHE (retour utilisateur : "reduis la place de la pipette") : partage
// desormais sa rangee avec le nouveau bouton CV Complet/Optimise --
// flex-basis reduit (35% au lieu de 50%) pour lui laisser plus de place,
// son libelle etant plus court ("Pipette couleur" vs "CV Optimisé ✓").
'  .carte-outil-pdf-etroite { flex: 0 1 35%; }' +
// TACHE (bouton "CV Complet"/"CV Optimise") : meme convention EXACTE que
// .sobre-actif (bleu plein = actif), classe dediee pour rester lisible
// malgre la couleur partagee.
'  .carte-outil-pdf.cv-optimise-actif { background: #0d6efd; border-color: #0d6efd; color: #fff; }' +
'  .carte-outil-pdf.cv-optimise-actif:hover { background: #0b5ed7; }' +
// TACHE (bouton "CV Sobre" cote PDF) : meme convention que
// .bouton-format-pdf-active (accent visible sur fond sombre), couleur
// distincte pour ne jamais se confondre avec les boutons de format --
// bleu plein, meme codage que btn-primary cote Word (js/app.js:16204).
'  .carte-outil-pdf.sobre-actif { background: #0d6efd; border-color: #0d6efd; color: #fff; }' +
'  .carte-outil-pdf.sobre-actif:hover { background: #0b5ed7; }' +
// TACHE (bouton "CV Créatif") : degrade violet/or -- rappelle la vraie
// palette de la maquette validee (sidebar #3B2E5C, anneau photo #B7791F),
// jamais une couleur choisie au hasard, pour que le bouton donne un vrai
// apercu du style qu'il applique.
'  .carte-outil-pdf.creatif-actif { border: none; background: linear-gradient(135deg, #3B2E5C, #B7791F); color: #fff; }' +
'  .carte-outil-pdf.creatif-actif:hover { filter: brightness(1.1); }' +
// TACHE (retour utilisateur : "je veux aussi avec les memes details pour
// la ATS") : meme texte que le Word (js/app.js:16122-16125), adapte au
// panneau sombre (texte clair, jamais le gris fonce sur fond blanc de
// l'original -- illisible ici).
'  .texte-ats-pdf { font-size: 11px; line-height: 1.4; color: #cbd5e1; margin: 0 0 14px 0; flex-shrink: 0; }' +
'  .texte-ats-pdf strong { color: #fff; }' +
// TACHE (retour utilisateur : "les boutons en haut n'ont pas d'explication,
// je n'ai pas le guide d'aide contextuelle ici (fenetre iframe separee)") :
// court texte introductif, en blanc (contrairement a .texte-ats-pdf, plus
// discret) pour bien attirer l'oeil vers les boutons juste en dessous.
'  .texte-intro-reglages-pdf { font-size: 12px; line-height: 1.4; color: #fff; margin: 0 0 12px 0; flex-shrink: 0; }' +
// TACHE (retour utilisateur : "parler des formats... qu'on puisse faire
// clic ici") : raccourcis visibles en permanence -- pilotent le VRAI
// select #regFormatCV (section "Format du CV" de Personnaliser, deja
// existant), jamais un 2e etat (meme principe que le raccourci Missions,
// voir _pdfAfficherBarreOutilsRubrique).
'  .rangee-format-pdf { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; flex-shrink: 0; }' +
'  .bouton-format-pdf { border: 1px solid #555; background: #333; color: #fff; border-radius: 999px; padding: 5px 10px; font-size: 11px; cursor: pointer; }' +
'  .bouton-format-pdf:hover { background: #3d3d3d; }' +
'  .bouton-format-pdf-active { background: #f5a623; border-color: #f5a623; color: #1a1a1a; }' +
// TACHE (retour utilisateur : "grand apercu en bouton separe, en bas du
// CV") : meme habillage que le bouton "Ouvrir le grand aperçu" cote Word
// (js/app.js:8481 -- pilule bleue, ombre portee), pour rester coherent
// entre les 2 panneaux.
'  .bouton-grand-apercu-pdf { display: none; margin: 20px auto 0 auto; font-size: 1.05rem; font-weight: 700; padding: 0.7rem 1.6rem; ' +
'background: #0d6efd; color: #fff; border: none; border-radius: 999px; box-shadow: 0 4px 14px rgba(13,110,253,.4); cursor: pointer; white-space: nowrap; }' +
'  .bouton-grand-apercu-pdf:hover { filter: brightness(1.08); }' +
// TACHE (retour utilisateur : "le nom de chaque bandeau, je veux le voir
// plus clairement") : opacite 0.7 rendait les titres de section trop
// discrets -- pleine opacite, plus gras, couleur d'accent (jamais liee a
// var(--degrade-debut), qui n'existe que dans le CSS de l'APERCU genere,
// pas ici dans le chrome du panneau) + une bordure basse pour separer
// visuellement chaque section, plutot qu'un simple espacement.
// TACHE (retour utilisateur : "j'ai du mal a les differentier, une couleur
// plus visible sans agresser les yeux, pas la meme que le bouton aleatoire")
// : le bleu clair precedent (#7cb0f5) se distinguait mal des autres
// couleurs deja presentes (boutons, selecteurs de couleur par defaut, tous
// bleus) -- un ambre chaud tranche nettement sur ce panneau majoritairement
// bleu/gris fonce, sans etre le violet/rose du bouton "Style aleatoire"
// (qui doit rester le SEUL a cette couleur, jamais dilue ailleurs).
'  .panneau-reglages h3 { font-size: 13.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; opacity: 1; color: #f5a623; ' +
'margin: 20px 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #3a3a3a; ' +
// TACHE (retour utilisateur : "accordeon, gagner de la place") : chaque
// titre de section devient cliquable (voir _pdfActiverAccordeons plus
// bas) -- chevron via ::after, jamais un span supplementaire dans le
// texte (le pseudo-element devient un 2e "enfant" flex automatiquement).
'cursor: pointer; user-select: none; display: flex; justify-content: space-between; align-items: center; }' +
'  .panneau-reglages h3::after { content: "▾"; font-size: 11px; opacity: 0.7; }' +
'  .panneau-reglages h3.section-fermee::after { content: "▸"; }' +
'  .panneau-reglages h3:first-child { margin-top: 0; }' +
'  .champ-reglage { margin-bottom: 10px; font-size: 12.5px; }' +
'  .champ-reglage label { display: block; margin-bottom: 3px; }' +
'  .champ-reglage select { width: 100%; padding: 5px; border-radius: 4px; border: 1px solid #555; background: #333; color: #fff; }' +
'  .champ-reglage.case { display: flex; align-items: center; gap: 8px; }' +
'  .texte-note-pdf { font-size: 11px; line-height: 1.4; color: #cbd5e1; margin: 2px 0 6px 0; }' +
'  .champ-reglage input[type="color"] { width: 100%; height: 28px; border: none; border-radius: 4px; padding: 0; background: none; }' +
'  .ligne-couleurs { display: flex; gap: 8px; }' +
'  .ligne-couleurs .champ-reglage { flex: 1; }' +
'  .bouton-imprimer { width: 100%; margin-top: 16px; padding: 10px; border: none; border-radius: 6px; background: #2f6690; color: #fff; font-size: 14px; cursor: pointer; }' +
'  .bouton-imprimer:hover { filter: brightness(1.15); }' +
'  .bouton-mise-en-page { width: 100%; padding: 9px; border: 1px solid #555; border-radius: 6px; background: #333; color: #fff; font-size: 13px; cursor: pointer; }' +
'  .bouton-mise-en-page:hover { background: #3d3d3d; }' +
// TACHE (retour utilisateur : "le message est noye entre l'ATS et les
// options, je veux un rectangle bien visible, avec une couleur
// differente, qui s'adapte au contenu -- c'est un point fort, mettez-le
// bien en avant") : boite dediee, couleur d'accent distincte de tout le
// reste du panneau (ambre chaud, deja reservee ailleurs aux titres de
// section -- jamais le violet/rose du bouton aleatoire ni le bleu des
// autres controles), bordure a gauche marquante, icone en tete. Vide par
// defaut (display:none, jamais un cadre visible sans contenu) --
// _pdfAjusterMiseEnPage()/les remises a zero (format, reinitialiser,
// aleatoire) pilotent la classe .visible en plus du texte, voir plus bas.
'  .message-mise-en-page { display: none; font-size: 12px; line-height: 1.45; color: #fff; background: rgba(245,166,35,0.14); ' +
'border-left: 3px solid #f5a623; border-radius: 6px; padding: 10px 12px; margin: 0 0 14px 0; flex-shrink: 0; }' +
'  .message-mise-en-page.visible { display: block; }' +
'  .message-mise-en-page strong { color: #f5a623; }' +
// TACHE (retour utilisateur : "je ne veux pas Style aleatoire/
// Personnaliser sur la colonne de reglages... detaches, un peu comme cote
// Word") : le panneau reste toujours visible par defaut (comme avant),
// seule sa POSITION change -- voir .carte-outil-pdf/.barre-outils-pdf plus
// haut, jamais un panneau deja ouvert au chargement.
'  .zone-reglages-personnalisation { display: none; }' +
'  .zone-reglages-personnalisation.ouverte { display: block; }' +
// TACHE (retour utilisateur : "dans le grand aperçu, je ne dois pas avoir
// tout sur une colonne... deux, meme trois colonnes, il y a de la place --
// je scrolle sans arret pour chercher un reglage") : le grand apercu
// (body.mode-grand-apercu, drapeau __cvPdfModeGrandApercu pose plus bas)
// dispose d'un ecran plein contrairement au petit apercu embarque
// (300px fixes, JAMAIS touche ici -- il reste tel quel, la largeur
// n'y a pas de place a gagner). Chaque section (h3 + .contenu-accordeon)
// n'est PAS un bloc unique dans le DOM -- 2 elements freres consecutifs
// (voir _pdfActiverAccordeons, titre.nextElementSibling) -- d'ou
// break-after sur le h3 plutot qu'un wrapper, pour eviter qu'une colonne
// ne se termine juste apres un titre, orphelin de son contenu.
'  body.mode-grand-apercu .panneau-reglages { width: 460px; }' +
'  body.mode-grand-apercu .zone-reglages-personnalisation.ouverte { column-count: 2; column-gap: 24px; }' +
'  body.mode-grand-apercu .panneau-reglages h3 { break-after: avoid-column; break-inside: avoid-column; margin-top: 16px; }' +
'  body.mode-grand-apercu .panneau-reglages h3:first-child { margin-top: 0; }' +
'  body.mode-grand-apercu .contenu-accordeon { break-inside: avoid-column; }' +
'  @media (min-width: 1500px) {' +
'    body.mode-grand-apercu .panneau-reglages { width: 680px; }' +
'    body.mode-grand-apercu .zone-reglages-personnalisation.ouverte { column-count: 3; } ' +
'  }' +
// TACHE (retour utilisateur 2026-09-14, "je veux ces boutons a gauche,
// visibles, pas tout en bas apres avoir defile tout le CV") : ce bouton
// (.bouton-grand-apercu-pdf) reste dans le DOM (jamais retire : le grand
// apercu plein ecran le pilote a distance, voir btnMepGrandImprimer,
// js/app.js) mais n'est plus jamais affiche ici -- l'equivalent visible
// vit desormais dans la colonne de gauche du commutateur parent
// (construireMiseEnPageCV, js/app.js), toujours accessible sans defiler.
'  body.mode-grand-apercu .bouton-grand-apercu-pdf { display: none; }' +
'  .bouton-mise-en-page:disabled { opacity: 0.4; cursor: default; }' +
'  .zone-apercu { flex: 1; overflow: auto; padding: 24px; }' +
// TACHE (agrandissement par rubrique, clic -> mini-barre flottante) :
// position:fixed + coordonnees calculees au clic (voir
// _pdfAfficherBarreOutilsRubrique plus bas) -- jamais positionnee en CSS
// pur, sa position depend du bloc cliqué a cet instant precis.
'  .barre-outils-rubrique { position: fixed; z-index: 1000; background: #1a1a1a; color: #fff; border: 1px solid #444; ' +
'border-radius: 8px; padding: 10px 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.4); font-size: 12.5px; width: 220px; display: none; }' +
'  .barre-outils-rubrique .titre-barre { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-weight: 600; }' +
'  .barre-outils-rubrique .titre-barre button { background: none; border: none; color: #aaa; cursor: pointer; font-size: 14px; padding: 0 4px; }' +
'  .barre-outils-rubrique .titre-barre button:hover { color: #fff; }' +
'  .barre-outils-rubrique input[type="range"] { width: 100%; }' +
'  .barre-outils-rubrique .ligne-valeur { display: flex; justify-content: space-between; font-size: 11px; color: #cbd5e1; margin-top: 2px; }' +
'  .barre-outils-rubrique .bouton-reset-rubrique { width: 100%; margin-top: 8px; padding: 5px; border: 1px solid #555; border-radius: 4px; background: #2a2a2a; color: #fff; font-size: 11px; cursor: pointer; }' +
'  .barre-outils-rubrique .bouton-reset-rubrique:hover { background: #3a3a3a; }' +
// TACHE (retour utilisateur : "les boutons doivent etre en contact ou sur
// le fond noir -- je les veux la haute sur la barre de ferme") : l'ampoule
// et la main/stylo VISIBLES vivent desormais dans la barre sombre du haut
// (js/app.js, ouvrirGrandApercuPdf() -- fenetre PARENTE, hors de cette
// iframe) -- l'ancien bouton "aide" flottant entre panneau/apercu est
// entierement retire (plus besoin d'une 2e copie du texte d'aide ici,
// desormais purement statique cote parent). #btnEditionTextePdf ci-dessous
// reste en revanche PRESENT (juste invisible, display:none inconditionnel)
// : toute la logique du mode d'edition (contenteditable, persistance des
// textes edites...) reste ici, cote iframe -- seul le DECLENCHEUR visible
// se trouve desormais dans la barre parente, qui appelle
// iframeGrandApercuPdf.contentWindow.document.getElementById("btnEditionTextePdf").click()
// pour la piloter a distance -- jamais une 2e logique de bascule dupliquee.
'  .bouton-edition-pdf { display: none; }' +
// TACHE (mode edition de texte) : indices visuels UNIQUEMENT quand le mode
// est actif (classe posee sur <body>, jamais en permanence -- le petit
// apercu/mode normal ne doivent jamais afficher ce curseur/contour). Pas
// de style de curseur "grab"/drag ici (deja neutralise en ne branchant
// plus _pdfActiverGlisserDeposer du tout dans ce mode, voir _pdfRafraichir()).
'  body.mode-edition-texte #conteneurPage [data-edit-id] { cursor: text; }' +
'  body.mode-edition-texte #conteneurPage [data-edit-id]:hover { outline: 1px dashed rgba(47,102,144,0.6); outline-offset: 2px; }' +
'  body.mode-edition-texte #conteneurPage [data-edit-id][contenteditable="true"] { outline: 2px solid var(--degrade-debut, #2f6690); outline-offset: 2px; background: rgba(47,102,144,0.06); }' +
'  .barre-format-texte { position: fixed; z-index: 1001; display: none; gap: 4px; background: #1a1a1a; border: 1px solid #444; border-radius: 6px; padding: 4px; box-shadow: 0 4px 14px rgba(0,0,0,0.4); }' +
'  .barre-format-texte button { width: 28px; height: 28px; border: none; border-radius: 4px; background: #2a2a2a; color: #fff; cursor: pointer; font-size: 13px; }' +
'  .barre-format-texte button:hover, .barre-format-texte button.actif { background: var(--degrade-debut, #2f6690); }' +
'  @media print {' +
'    body { display: block; height: auto; overflow: visible; background: #fff; }' +
'    .panneau-reglages { display: none; }' +
'    .bouton-edition-pdf, .barre-format-texte { display: none; }' +
'    .zone-apercu { padding: 0; overflow: visible; }' +
// TACHE (retour utilisateur, bug reel confirme en comparant apercu vs PDF
// exporte : "j'ai une 2e page quasi vide avec juste le bouton dessus") :
// #btnImprimerSousApercuPdf vit dans .zone-apercu (jamais masquee, voir
// juste au-dessus -- seul .panneau-reglages l\'etait) -- le bouton
// s\'imprimait donc lui-meme, en dessous du CV, debordant sur une 2e page
// quasi vide. Masque desormais explicitement a l\'impression, comme
// .panneau-reglages.
'    .bouton-grand-apercu-pdf { display: none; }' +
// TACHE (retour utilisateur, bug reel confirme par capture d'ecran : "les
// bords qui permettent de tirer le texte sortent aussi a l'impression --
// ces 2 petites barres verticales sur l'accroche/le metier") : les
// poignees de redimensionnement (poignee-redim-accroche/-metier, voir
// cvPdfTemplateA4.js) vivent DANS .zone-apercu (jamais masquee ci-dessus,
// contrairement a .panneau-reglages) -- restaient donc visibles a
// l'impression comme le reste du CV. Masquees ici explicitement, meme
// principe que .bouton-grand-apercu-pdf juste au-dessus.
// TACHE (point 19, meme bug anticipe pour la nouvelle poignee de hauteur
// d'en-tete) : meme raisonnement exact que ci-dessus -- vit aussi DANS
// .zone-apercu, doit donc etre masquee explicitement ici elle aussi.
'    .poignee-redim-accroche, .poignee-redim-metier, .poignee-redim-hauteur-entete { display: none; }' +
// TACHE (retour utilisateur 2026-09-15, meme raisonnement exact que
// juste au-dessus pour la nouvelle poignee de largeur de colonnes) :
// meme classe qui vit dans .zone-apercu.
'    .poignee-redim-largeur-colonnes { display: none; }' +
'  }' +
'</style>' +
'<style id="styleCv"></style>' +
// TACHE (format A5) : @page ne peut pas etre pilote par une simple classe
// CSS (regle globale au document) -- balise dediee, reecrite a chaque
// rafraichissement selon `taillePage`, plutot qu'une valeur figee au
// chargement du panneau (qui ne verrait alors jamais le format A5).
'<style id="stylePage">@page { size: 210mm 297mm; margin: 0; }</style>' +
'</head><body>' +

'<div class="panneau-reglages">' +

// TACHE (retour utilisateur : "les boutons ici n'ont pas d'explication --
// je n'ai pas le guide d'aide contextuelle sur cette fenetre de grand
// apercu (fenetre separee, hors de portee du bouton d'aide de
// l'application, voir project_scopes_js_cv_pdf") : court texte introductif
// avant les boutons, pour signaler que le CV est personnalisable et que
// ces boutons servent a ca -- seul moyen d'expliquer leur presence sur
// cette fenetre precise.
'<p class="texte-intro-reglages-pdf">✏️ Votre CV est personnalisable : couleurs, mise en page et contenu, avec les boutons ci-dessous.</p>' +

// TACHE (retour utilisateur : "les options sur le cote, pas au-dessus du
// CV -- ca le retrecit trop... reprendre exactement le meme
// positionnement que cote Word") : rangee de cartes DANS la colonne de
// reglages (jamais plus au-dessus de tout, .barre-outils-pdf retiree) --
// meme esprit que la rangee Word (js/app.js:15948), juste en grille 2x2
// vu la largeur reduite de cette colonne (300px, contre pleine page cote
// Word). Grand apercu, lui, vit toujours SOUS l'apercu (retour
// utilisateur precedent : "en bouton separe, en bas du CV"), voir
// .zone-apercu, inchange par ce chantier.
'<div class="rangee-cartes-pdf">' +
'<button type="button" class="carte-outil-pdf aleatoire" id="btnStyleAleatoire"><span class="icone-outil">🎲</span><span>Style aléatoire</span></button>' +
'<button type="button" class="carte-outil-pdf" id="btnPersonnaliserPdf"><span class="icone-outil">✏️</span><span>Personnaliser</span></button>' +
'</div>' +
// TACHE (retour utilisateur : "reduis la place de la pipette, mets le
// nouveau bouton CV Complet/Optimise sur la meme ligne qu'elle") : la
// pipette rejoint desormais une rangee dediee avec le nouveau bouton
// (etroite -- classe carte-outil-pdf-etroite, flex-basis reduit) plutot
// que de rester dans la 1ere rangee (qui ne contenait plus alors que 2
// boutons pleine largeur, Style aleatoire + Personnaliser).
'<div class="rangee-cartes-pdf">' +
'<button type="button" class="carte-outil-pdf carte-outil-pdf-etroite" id="btnPipetteLibrePdf" title="Récupérez une couleur précise que vous avez en tête, où qu’elle apparaisse à l’écran."><span class="icone-outil">💧</span><span>Pipette couleur</span></button>' +
// TACHE (retour utilisateur : "CV Complet" / "CV Optimise", meme reglage
// EXACT que btnCvOptimiseXXL cote Word (js/app.js) -- un seul booleen
// partage (window.parent.dossier.cvOptimiseActif), lu directement par
// appliquerMoteurDecisionCV() quel que soit le format. Jamais un miroir
// dossier.pdfReglages separe (contrairement a Sobre/Creatif) : ce n'est
// pas une recette de style a synchroniser, juste un booleen lu depuis la
// meme source partout.
'<button type="button" class="carte-outil-pdf" id="btnCvOptimisePdf" title="Formations et certifications : basculez entre toutes les garder, ou ne garder que les plus pertinentes pour le poste visé."><span class="icone-outil">🎓</span><span id="libelleCvOptimisePdf">CV Complet</span></button>' +
'</div>' +
// TACHE (retour utilisateur : "l'ideal c'est de mettre CV Sobre et CV
// Creatif sur la meme ligne, Mise en page seul en bas") : rangee dediee
// (2 boutons = exactement une ligne pleine avec .carte-outil-pdf, jamais
// besoin d'un 3e element qui casserait la paire) -- "Mise en page" sort
// de cette rangee vers la sienne, plus bas, seul.
'<div class="rangee-cartes-pdf">' +
// TACHE (retour utilisateur : "je vais avoir aussi le même bouton avec
// les mêmes fonctions que j'ai côté Word, l'avoir aussi en PDF") : meme
// bascule que btnSobreXXL (js/app.js) mais reappliquee ICI directement
// sur les VRAIS controles du panneau PDF (jamais une 2e copie des
// reglages a part -- _pdfLireOptions() les relit deja tous depuis le
// DOM). "regSobreActif" est une case a cocher CACHEE (jamais montree a
// la personne) uniquement pour beneficier gratuitement de la
// persistance/capture generique deja en place (_pdfCapturerEtat/
// _pdfAppliquerEtat parcourent tous les select/checkbox de
// .panneau-reglages), jamais une 3e mecanique de sauvegarde ecrite a la main.
'<button type="button" class="carte-outil-pdf" id="btnSobrePdf" title="Retire pastilles, dégradés, icônes et couleurs flashy -- un CV minimaliste et professionnel, souvent préféré par les recruteurs."><span class="icone-outil">🎩</span><span id="libelleSobrePdf">CV Sobre</span></button>' +
'<input type="checkbox" id="regSobreActif" style="display:none">' +
// TACHE (chantier "CV Créatif", oppose de "CV Sobre" -- plan/maquettes
// valides avec l'utilisateur avant le codage) : meme mecanique exacte que
// btnSobrePdf ci-dessus (case cachee + override render-time dans
// _pdfLireOptions(), jamais un chemin de rendu a part) mais avec des
// valeurs OPPOSEES (icones/pastilles/formes/couleurs actives au lieu de
// retirees). Mutuellement exclusif avec Sobre (voir les 2 handlers plus
// bas) -- les 2 visent des effets contraires, aucun sens a les cumuler.
'<button type="button" class="carte-outil-pdf" id="btnCreatifPdf" title="Colonne colorée en bande, formes arrondies, icônes et pastilles -- un CV plus visuel, pensé pour les secteurs créatifs/communication."><span class="icone-outil">🎨</span><span id="libelleCreatifPdf">CV Créatif</span></button>' +
'<input type="checkbox" id="regCreatifActif" style="display:none">' +
'</div>' +
// TACHE (retour utilisateur : "Mise en page seul en bas") : rangee
// dediee, un seul bouton -- .carte-outil-pdf grandit tout seul jusqu'a
// 100% de la largeur (flex-grow:1 deja sur cette classe, voir plus haut),
// jamais besoin d'une classe/regle CSS separee pour ca.
'<div class="rangee-cartes-pdf">' +
'<button type="button" class="carte-outil-pdf" id="btnMiseEnPage" title="Ajuste automatiquement la mise en page pour tenir sur 1 page en gardant un maximum d’informations lisibles."><span class="icone-outil">🪄</span><span id="libelleMiseEnPage">Mise en page (1 page)</span></button>' +
'</div>' +
'<p id="messageMiseEnPage" class="message-mise-en-page"></p>' +

// TACHE (retour utilisateur : "je veux aussi avec les memes details pour
// la ATS") : meme texte que le Word (js/app.js:16122-16125), copie a
// l'identique -- jamais un 2e texte redige a part, meme information des
// 2 cotes.
'<p class="texte-ats-pdf">' +
  '💡 <strong>ATS</strong> (Applicant Tracking System, "logiciel de suivi des candidatures") : beaucoup d’entreprises trient les CV automatiquement avant qu’un recruteur ne les lise. Ces logiciels lisent parfois mal un CV à 2 colonnes. ' +
  '<strong>1 colonne</strong> est donc recommandé pour une candidature en ligne (site carrière, France Travail, LinkedIn...) - <strong>2 colonnes</strong> convient bien pour un envoi direct par email ou à emporter en entretien.' +
'</p>' +

// TACHE (retour utilisateur : "parler des formats... qu'on puisse faire
// clic ici") : raccourcis toujours visibles -- pilotent le VRAI select
// #regFormatCV (section "Format du CV" ci-dessous, deja existant), jamais
// un 2e etat.
// TACHE (retour utilisateur : "il me manque la possibilite de choisir
// entre paysage et portrait" pour le Mini CV A5) : Portrait et Paysage
// avaient chacun leur option dans le select complet (Personnaliser), mais
// seul Portrait etait remonte ici en raccourci -- Paysage restait invisible
// tant qu'on n'ouvrait pas Personnaliser. 2 boutons cote a cote desormais,
// comme A4 Detaille/Essentiel/Integral juste a cote.
'<div class="rangee-format-pdf" id="rangeeFormatPdf">' +
'<button type="button" class="bouton-format-pdf" data-format-raccourci="A4-detaille">A4 Détaillé</button>' +
'<button type="button" class="bouton-format-pdf" data-format-raccourci="A4-essentiel">A4 Essentiel</button>' +
'<button type="button" class="bouton-format-pdf" data-format-raccourci="A5-portrait">Mini CV (A5) Portrait</button>' +
'<button type="button" class="bouton-format-pdf" data-format-raccourci="A5-paysage">Mini CV (A5) Paysage</button>' +
'<button type="button" class="bouton-format-pdf" data-format-raccourci="A4-integral">CV Intégral</button>' +
'</div>' +

'<div class="zone-reglages-personnalisation" id="zoneReglagesPdfPersonnalisation">' +

'<h3>Format du CV</h3>' +
'<div class="contenu-accordeon">' +
'<div class="champ-reglage"><label>Format</label><select id="regFormatCV">' +
'<option value="A4-detaille">A4 Détaillé</option>' +
'<option value="A4-essentiel">A4 Essentiel</option>' +
'<option value="A4-integral">A4 Intégral</option>' +
'<option value="A5-portrait">Mini CV A5 - Portrait</option>' +
'<option value="A5-paysage">Mini CV A5 - Paysage</option>' +
'</select></div>' +
'</div>' +

'<h3>Contenu</h3>' +
'<div class="contenu-accordeon">' +
'<div class="champ-reglage case"><input type="checkbox" id="regSansAccroche"><label for="regSansAccroche">Sans phrase d\'accroche (profil)</label></div>' +
// TACHE (retour utilisateur : "Une lettre de motivation accompagne ce
// CV ? Si oui, la phrase d'accroche est retirée automatiquement -- comme
// sur le modele Word") : port EXACT du toggle Word (js/app.js:16458-16461,
// theme.lettreJointe) -- ici, pas de theme a resoudre : `sansAccroche`
// effectif se contente d\'un OR avec ce checkbox au moment de lire les
// options (_pdfLireOptions plus bas), meme regle que composeurMoteur.js:77.
// A4 uniquement (comme le Word) -- voir _PDF_SECTIONS_A4_SEULEMENT.
'<div id="sectionA4SeulementLettreJointe">' +
'<div class="champ-reglage case" style="margin-top:8px;"><input type="checkbox" id="regLettreJointe"><label for="regLettreJointe">Une lettre de motivation accompagne ce CV ?</label></div>' +
'<p class="texte-note-pdf">Si oui, la phrase d\'accroche est retirée automatiquement.</p>' +
// TACHE (bouton "Mettre en avant + regrouper", port depuis le Word,
// point 14 cv.md) : reutilise EN LECTURE SEULE composeurAppliquerRegroupementExperiences
// (composeurMoteur.js), appliquee cote donnees (cvPdfDonnees.js) --
// n'affiche ce reglage que si l'IA a propose quelque chose d'exploitable
// (regroupementUtilisable, calcule a la construction du panneau, voir
// plus haut) -- jamais un bouton sans effet visible, meme condition que
// le Word (js/app.js:16494-16498). Checkbox TOUJOURS presente dans le DOM
// (juste masquee si inutilisable) : _pdfLireOptions() la lit
// inconditionnellement, jamais un acces a un element absent.
(regroupementUtilisable
  ? '<div class="champ-reglage case" style="margin-top:8px;"><input type="checkbox" id="regRegroupementActif"><label for="regRegroupementActif">Mettre en avant l\'expérience la plus pertinente et regrouper les autres</label></div>' +
    '<p class="texte-note-pdf">Propose une expérience en avant (5 missions) et condense les autres expériences par domaine de métier.</p>'
  : '<input type="checkbox" id="regRegroupementActif" style="display:none;">') +
'</div>' +
// TACHE (retour utilisateur : "je veux pouvoir choisir l'ordre
// d'affichage, par date ou par poste... si une experience est en lien
// avec le poste vise mais n'est pas la plus recente, pouvoir la mettre en
// avant") : "Pertinence" (defaut) ne trie PAS -- garde l\'ordre deja
// decide par le moteur partage (recommandations IA / choix manuels de la
// personne a l\'ecran de revision), qui EST deja la reponse au besoin
// "mettre en avant une experience pertinente meme si pas la plus
// recente". Date/Poste appliquent un VRAI tri, voir cvPdfTemplateA4.js.
// Actif en A4 ET en A5 (le tri ne depend pas de l\'espace disponible).
'<div class="champ-reglage" style="margin-top:10px;"><label>Ordre d\'affichage des expériences</label><select id="regOrdreExperiences">' +
'<option value="pertinence">Pertinence (ordre recommandé)</option>' +
'<option value="date-desc">Date (plus récent d\'abord)</option>' +
'<option value="date-asc">Date (plus ancien d\'abord)</option>' +
'<option value="poste-asc">Intitulé de poste (A→Z)</option>' +
'<option value="poste-desc">Intitulé de poste (Z→A)</option>' +
'</select></div>' +
// TACHE (retour utilisateur : "je puisse facilement identifier le poste,
// la date et l'entreprise -- lisible et clair") : 2e forme d\'affichage,
// entierement optionnelle -- "Standard" (defaut, comportement inchange)
// garde le format actuel deja lisible (poste/entreprise en gras, date en
// fin de ligne) ; "Amélioré" met l\'entreprise en couleur d\'accent et la
// date alignee a droite (voir _pdfBlocExperiences, cvPdfTemplateA4.js).
// A4 uniquement -- l\'A5 garde son propre format compact 1 ligne, jamais
// concerne par ce reglage.
'<div id="sectionA4SeulementFormatExperiences">' +
'<div class="champ-reglage"><label>Mise en forme des expériences</label><select id="regFormatExperiences">' +
'<option value="standard">Standard (Poste - Entreprise : période)</option>' +
'<option value="ameliore">Amélioré (entreprise en couleur, date à droite)</option>' +
'</select></div>' +
'</div>' +
'</div>' +

'<h3>Mise en page</h3>' +
'<div class="contenu-accordeon">' +
'<div id="sectionA4SeulementMiseEnPage">' +
'<div class="champ-reglage"><label>Colonnes</label><select id="regColonnes"><option value="2">2 colonnes</option><option value="1">1 colonne</option></select></div>' +
// TACHE (retour utilisateur : "si la personne met en avant la rubrique
// Formation comme point fort, toutes les formations/certifications
// restent visibles, la plus pertinente est developpee -- meme sans
// activer CV Optimise") : equivalent PDF du "bloc mis en avant" Word
// (qui n'existe pas du tout cote PDF, verifie -- jamais un systeme
// generique a choix multiple clone ici, uniquement ce reglage dedie et
// cible). Case independante de "CV Complet"/"CV Optimise" -- son effet
// (dans appliquerMoteurDecisionCV(), js/app.js) prend le dessus sur ce
// dernier des qu'elle est cochee, quel que soit son propre etat.
'<div class="champ-reglage case"><input type="checkbox" id="regFormationsMisesEnAvant"' +
  ((dossierSource && dossierSource.pdfReglages && dossierSource.pdfReglages.regFormationsMisesEnAvant) ? ' checked' : '') +
  '><label for="regFormationsMisesEnAvant">Mettre en avant les formations</label></div>' +
// TACHE (retour utilisateur, bug reel confirme : "colonnes inversees,
// largeur colonne gauche, forme des colonnes... pour une seule colonne, ca
// n'a rien a faire la-dedans") : les 3 n'ont de sens qu'a 2 colonnes --
// "Forme des colonnes" (diagonale) n'est meme QUE VISUELLEMENT actif que
// si colonnes===2 (voir diagonaleColonnesActive, cvPdfTemplateA4.js),
// jamais un effet reel en 1 colonne, confirmant le constat "je faisais
// clic, rien ne changeait". Masques ensemble ici (id dedie, visibilite
// pilotee par _pdfAppliquerVisibiliteFormat), jamais juste sur le format
// A4/A5 comme le wrapper parent.
'<div id="sectionDeuxColonnesSeulement">' +
'<div class="champ-reglage case"><input type="checkbox" id="regColonnesInversees"><label for="regColonnesInversees">Colonnes inversées</label></div>' +
'<div class="champ-reglage"><label>Largeur colonne gauche (<span id="valeurLargeurColonnes">35%</span>)</label><input type="range" id="regLargeurColonneGauche" min="30" max="70" step="5" value="35" style="width:100%;"></div>' +
'<div class="champ-reglage"><label>Forme des colonnes</label><select id="regFormeColonnes"><option value="rectangle">Rectangle</option><option value="diagonale">Diagonale</option></select></div>' +
'</div>' +
'</div>' +
// Partage A4/A5 (colonnes toujours 2 en A5 -- reste pertinent) : jamais
// enferme dans le wrapper masque par format ci-dessus (specifique A4),
// mais reste a l'interieur du meme .contenu-accordeon (se replie donc
// avec le reste de "Mise en page", les 2 mecanismes sont independants).
'<div class="champ-reglage case"><input type="checkbox" id="regSeparateurColonnes"><label for="regSeparateurColonnes">Séparateur entre colonnes</label></div>' +
'</div>' +

'<h3>Couleurs</h3>' +
'<div class="contenu-accordeon">' +
'<div class="ligne-couleurs">' +
'<div class="champ-reglage"><label>Accent</label><input type="color" id="regCouleurDebut" value="#2f6690"></div>' +
'<div class="champ-reglage" id="sectionA4SeulementCouleurFin"><label>Accent (clair)</label><input type="color" id="regCouleurFin" value="#d9e8f2"></div>' +
'</div>' +
'<div id="sectionA4SeulementFondColonnes">' +
'<div class="champ-reglage"><label>Fond des colonnes</label><select id="regFondColonnes"><option value="droite">Droite</option><option value="gauche">Gauche</option><option value="lesDeux">Les deux</option><option value="aucun">Aucun</option></select></div>' +
'<div class="champ-reglage"><label>Effet du fond des colonnes</label><select id="regFondColonnesEffet"><option value="fondSeul">Fond plein</option><option value="titres">Titres seulement</option></select></div>' +
'<div class="champ-reglage"><label>Dégradé des colonnes</label><select id="regDegradeColonnes"><option value="fonce-clair">Foncé → clair</option><option value="clair-fonce">Clair → foncé</option><option value="aucun">Couleur unie</option></select></div>' +
// TACHE (retour utilisateur : "le fond de colonne, sa couleur, je veux
// pouvoir l'avoir du haut de la page jusqu'en bas -- pouvoir mettre les
// coordonnees ou la photo dessus") : bande laterale independante du fond
// de colonne habituel (limite au corps) -- desactivee si le bandeau
// d'en-tete colore est actif (choix explicite : les 2 sont mutuellement
// exclusifs, voir cvPdfTemplateA4.js pour le pourquoi).
'<div class="champ-reglage case"><input type="checkbox" id="regFondColonnePleineHauteur"><label for="regFondColonnePleineHauteur">Fond de colonne pleine hauteur (du haut de la page -- sans bandeau d\'en-tête coloré)</label></div>' +
'</div>' +
'</div>' +

'<div id="sectionA5Seulement">' +
'<h3>Mini CV A5</h3>' +
'<div class="contenu-accordeon">' +
'<div class="champ-reglage"><label>Fond des colonnes</label><select id="regFondColonnesA5">' +
'<option value="droite">Droite</option><option value="gauche">Gauche</option><option value="lesDeux">Les deux</option>' +
'<option value="milieu">Milieu (Paysage uniquement)</option><option value="aucun">Aucun</option></select></div>' +
'<div class="champ-reglage case"><input type="checkbox" id="regEnteteInverseeA5"><label for="regEnteteInverseeA5">En-tête inversée (Portrait uniquement)</label></div>' +
// TACHE (retour utilisateur : "gaspillage des feuilles" -- economie de
// papier) : 2 exemplaires IDENTIQUES du Mini CV sur la meme feuille A4,
// empiles en Paysage / cote a cote en Portrait (seule facon dont l'A5
// tient exactement 2 fois dans une A4, voir cvPdfTemplateA5.js) -- ligne
// pointillee + reperes ciseaux entre les 2, prets a decouper.
'<div class="champ-reglage case"><input type="checkbox" id="regRemplirPageA5"><label for="regRemplirPageA5">Remplir la page (2 CV identiques par feuille A4, à découper)</label></div>' +
// TACHE (retour utilisateur : "le bouton Mise en page doit aussi
// fonctionner pour le Mini CV A5") : jusque-la, ce bouton (comme le
// curseur manuel "Taille du texte") etait entierement MASQUE en A5 --
// section A4-only, voir sectionA4SeulementMiseEnPage plus haut. Version
// dediee ici, plus simple que celle de l'A4 (pas de croissance separee
// en-tete/corps -- l'A5 n'a pas ce systeme de position libre) : un seul
// curseur d'echelle globale (regEchelleA5, meme convention 9-14 ~ 11 que
// regEchelle) + un bouton qui mesure la VRAIE hauteur rendue de .page-a5
// (voir _pdfAjusterMiseEnPageA5 plus bas) et l'ajuste automatiquement.
// TACHE (bug reel confirme en testant) : min/max ALIGNES sur
// _PDF_ECHELLE_MIN/_PDF_ECHELLE_MAX (9/11 a 14/11, cvPdfPanneauReglages.js
// -- memes bornes EXACTES que le curseur A4, regEchelle plus haut) --
// un min/max invente different (8-13 au 1er essai) faisait que
// _pdfAjusterMiseEnPageA5 pouvait pousser _cvPdfEchelle au-dela du max
// du curseur : la valeur ecrite (14) etait alors silencieusement
// ecretee a 13 par le navigateur, desynchronisant l'etiquette affichee
// du message ("taille 14px" vs curseur bloque a "13").
'<div class="champ-reglage"><label>Taille du texte (<span id="valeurEchelleA5">11</span>)</label><input type="range" id="regEchelleA5" min="9" max="14" step="0.5" value="11" style="width:100%;"></div>' +
'<button type="button" class="carte-outil-pdf" id="btnMiseEnPageA5" style="width:100%;margin-top:6px;" title="Ajuste automatiquement la taille du texte pour bien remplir le Mini CV A5, sans déborder."><span class="icone-outil">🪄</span><span>Mise en page (A5)</span></button>' +
'<div id="messageMiseEnPageA5" style="font-size:0.8rem;margin-top:4px;"></div>' +
'</div>' +
'</div>' +

'<h3>En-tête</h3>' +
'<div class="contenu-accordeon">' +
'<div id="sectionA4SeulementEnTete">' +
'<div class="champ-reglage case"><input type="checkbox" id="regBandeauEnTete" checked><label for="regBandeauEnTete">Bandeau en-tête coloré</label></div>' +
'<div class="champ-reglage"><label>Forme de l\'en-tête</label><select id="regFormeEnTete"><option value="rectangle">Rectangle</option><option value="diagonale">Diagonale</option></select></div>' +
'<div class="champ-reglage"><label>Dégradé du bandeau</label><select id="regDegradeBandeau"><option value="fonce-clair">Foncé → clair</option><option value="clair-fonce">Clair → foncé</option><option value="aucun">Couleur unie</option></select></div>' +
'<div class="champ-reglage case"><input type="checkbox" id="regBandeauDisponibilite"><label for="regBandeauDisponibilite">Bandeau coordonnées à part</label></div>' +
// TACHE (retour utilisateur : "si en arrivant sur la page personnalisation
// les informations sont deja comme demande cote a cote, l'option nom et
// metier cote a cote n'a plus lieu d'etre, on peut l'enlever") : "Position
// libre du bandeau" (nouveaux emplacements par defaut -- nom+coordonnees a
// gauche, metier en haut au centre en grand, accroche plus bas a droite,
// voir _PDF_POSITIONS_LIBRES_DEFAUT, cvPdfTemplateA4.js) couvre desormais
// ce besoin EN MIEUX (place librement, pas seulement gauche/droite) --
// checkbox "Nom et metier cote a cote" retiree, jamais 2 mecanismes
// concurrents pour le meme resultat.
// TACHE (retour utilisateur : "je ne veux pas les rubriques empilees en
// arrivant sur le CV, mais bien cote a cote") : coche PAR DEFAUT
// desormais (checked). Decocher NE revient plus a un mode empile -- voir
// cvPdfTemplateA4.js, branche `else` de `positionLibreEntete` : la
// disposition FIXE (non decochable en pratique, juste non-deplacable a la
// souris) reprend la MEME repartition 3 colonnes (nom+coordonnees a
// gauche, metier au centre en grand, accroche a droite), jamais
// l'ancien empilement.
// TACHE (retour utilisateur : "peut-etre que ca peut etre une tres bonne
// idee d'avoir aussi l'option 2 colonnes -- a gauche nom et coordonnees,
// a droite le metier en haut et l'accroche plus bas sur la meme colonne
// -- plus coherent si le nom de metier est tres grand, on est sur que le
// metier ET l'accroche vont rentrer") : 2e disposition, choisissable ici,
// active dans LES 2 modes (position libre ET disposition fixe -- voir
// cvPdfTemplateA4.js, dispositionEntete). En position libre, metier et
// accroche restent 2 blocs INDEPENDANTS, toujours deplacables separement
// -- seules leurs positions de DEPART changent selon la disposition
// choisie ici.
'<div class="champ-reglage"><label>Disposition de l\'en-tête</label><select id="regDispositionEntete">' +
'<option value="3colonnes">3 colonnes (nom / métier / accroche)</option>' +
'<option value="2colonnes">2 colonnes (nom / métier + accroche)</option>' +
'</select></div>' +
'<div class="champ-reglage case"><input type="checkbox" id="regPositionLibreEntete" checked><label for="regPositionLibreEntete">Position libre du bandeau (glisser les blocs)</label></div>' +
// TACHE (retour utilisateur : "pouvoir etirer le rectangle de l'accroche
// en largeur, pour que le texte soit moins comprimé et remplisse mieux le
// vide" + "le meme rectangle... pour le metier, parce que parfois le
// titre d'un metier peut etre beaucoup plus long") : meme mecanisme que
// "Largeur colonne gauche" (regLargeurColonneGauche, section Mise en
// page) -- simple curseur en %, jamais un 2e systeme de redimensionnement
// invente. Actifs dans LES 2 dispositions (position libre ET disposition
// fixe par defaut, voir cvPdfTemplateA4.js) -- jamais reserves a la seule
// position libre.
'<div class="champ-reglage"><label>Largeur du rectangle d\'accroche (<span id="valeurLargeurAccroche">30%</span>)</label><input type="range" id="regLargeurAccrocheLibre" min="30" max="90" step="5" value="30" style="width:100%;"></div>' +
'<div class="champ-reglage"><label>Largeur du rectangle "métier visé" (<span id="valeurLargeurMetier">32%</span>)</label><input type="range" id="regLargeurMetierLibre" min="20" max="60" step="5" value="32" style="width:100%;"></div>' +
'</div>' +
// Partage A4/A5 (utilise par le bandeau en-tete A4 ET le bloc identite
// A5) : reste dans le meme .contenu-accordeon que ci-dessus (voir
// commentaire "Separateur" plus haut, meme principe).
'<div class="champ-reglage case"><input type="checkbox" id="regAnneauPhoto"><label for="regAnneauPhoto">Anneau décalé derrière la photo</label></div>' +
'</div>' +

'<h3>Style</h3>' +
'<div class="contenu-accordeon">' +
'<div id="sectionA4SeulementStyle">' +
'<div class="champ-reglage"><label>Titres de rubrique</label><select id="regStyleTitres"><option value="souligne">Soulignés</option><option value="aucun">Aucun</option><option value="bandeau">Bandeau coloré</option><option value="pastille">Pastille (icône dans un rond)</option></select></div>' +
'<div class="champ-reglage case"><input type="checkbox" id="regLectureGuidee"><label for="regLectureGuidee">Lecture guidée (nom assorti au métier visé)</label></div>' +
// TACHE (retour utilisateur : "avoir les missions detaillees, deux
// options d'affichage exactement comme dans le Word -- epure ou
// condense") : port EXACT du reglage Word (theme.styleProfessionnel/
// stylePersonnel) -- "Epure" (defaut) garde 1 mission par ligne, "Condense"
// fusionne toutes les missions d'une experience en 1 seule ligne, separees
// par un gros point « · », jamais de point final (voir cvPdfTemplateA4.js).
'<div class="champ-reglage"><label>Missions (Expériences)</label><select id="regStyleProfessionnel"><option value="epure">Épuré (1 mission par ligne)</option><option value="condense">Condensé (missions à la suite)</option></select></div>' +
'<div class="champ-reglage"><label>Missions (Expérience personnelle)</label><select id="regStylePersonnel"><option value="epure">Épuré (1 mission par ligne)</option><option value="condense">Condensé (missions à la suite)</option></select></div>' +
// TACHE (retour utilisateur : "souligner le poste, les dates,
// l'entreprise... et pareil pour l'italique") : 3 reglages GLOBAUX
// (jamais par item individuel -- les experiences n'ont pas d'identifiant
// stable) partages entre experiences pro, experience personnelle et
// formations (poste<->intitule diplome, entreprise<->etablissement,
// dates<->annee, voir cvPdfTemplateA4.js/_pdfSpanStylePartie) -- des
// qu'un type est souligne/italique, il l'est PARTOUT ou il apparait,
// jamais un sous-ensemble incoherent. Souligne/italique independants
// (les 2 combinables), les 3 lignes independantes entre elles (0 a 3
// simultanement).
'<div class="champ-reglage" style="margin-top:10px;"><label>Mise en évidence -- Poste / intitulé</label>' +
'<div style="display:flex;gap:14px;">' +
'<span style="display:flex;align-items:center;gap:5px;"><input type="checkbox" id="regSoulignerPoste"><label for="regSoulignerPoste" style="margin:0;">Souligné</label></span>' +
'<span style="display:flex;align-items:center;gap:5px;"><input type="checkbox" id="regItaliquePoste"><label for="regItaliquePoste" style="margin:0;">Italique</label></span>' +
'</div></div>' +
'<div class="champ-reglage"><label>Mise en évidence -- Dates / années</label>' +
'<div style="display:flex;gap:14px;">' +
'<span style="display:flex;align-items:center;gap:5px;"><input type="checkbox" id="regSoulignerDates"><label for="regSoulignerDates" style="margin:0;">Souligné</label></span>' +
'<span style="display:flex;align-items:center;gap:5px;"><input type="checkbox" id="regItaliqueDates"><label for="regItaliqueDates" style="margin:0;">Italique</label></span>' +
'</div></div>' +
'<div class="champ-reglage"><label>Mise en évidence -- Entreprise / établissement</label>' +
'<div style="display:flex;gap:14px;">' +
'<span style="display:flex;align-items:center;gap:5px;"><input type="checkbox" id="regSoulignerEntreprise"><label for="regSoulignerEntreprise" style="margin:0;">Souligné</label></span>' +
'<span style="display:flex;align-items:center;gap:5px;"><input type="checkbox" id="regItaliqueEntreprise"><label for="regItaliqueEntreprise" style="margin:0;">Italique</label></span>' +
'</div></div>' +
'<div class="champ-reglage"><label>Bordures</label><select id="regStyleBordures"><option value="fine">Fines</option><option value="epaisse">Épaisses</option></select></div>' +
'<div class="champ-reglage"><label>Style des compétences</label><select id="regStyleCompetences"><option value="pastille">Pastille</option><option value="rectangle">Rectangle</option><option value="texte">Texte seul</option></select></div>' +
'<div class="ligne-couleurs">' +
'<div class="champ-reglage" id="sectionPastilleCouleurFond"><label>Couleur des pastilles</label><input type="color" id="regCouleurFondCompetences" value="#e9e9e9"></div>' +
'<div class="champ-reglage"><label>Couleur du texte</label><input type="color" id="regCouleurTextePuces" value="#1b1b1b"></div>' +
'</div>' +
'</div>' +
// TACHE (retour utilisateur : "je veux une icone a cote de cette option
// pour la reperer d'un coup d'oeil, sans devoir lire chaque ligne") :
// emoji directement dans le libelle, meme convention que le Word
// (js/app.js).
'<div class="champ-reglage case"><input type="checkbox" id="regIcones"><label for="regIcones">🔖 Icônes rubriques</label></div>' +
// TACHE (retour utilisateur explicite : "je veux avoir deux types
// d'icônes... icône coordonnées et icône rubrique") : reglage INDEPENDANT
// du precedent (activable seul, avec l'autre, ou aucun des 2) -- meme
// famille visuelle (_PDF_ICONES_SVG, cvPdfTemplateA4.js) garantit deja la
// coherence de style/couleur quand les 2 sont actifs en meme temps, jamais
// besoin d'un reglage de coordination supplementaire ici.
'<div class="champ-reglage case"><input type="checkbox" id="regIconesCoordonnees"><label for="regIconesCoordonnees">✉️ Icônes coordonnées</label></div>' +
'<div class="champ-reglage"><label>Police</label><select id="regPolice">' +
'<option value="segoe">Segoe UI (par défaut)</option>' +
'<option value="arial">Arial</option>' +
'<option value="calibri">Calibri</option>' +
'<option value="tahoma">Tahoma</option>' +
'<option value="trebuchet">Trebuchet MS</option>' +
'<option value="georgia">Georgia</option>' +
'<option value="times">Times New Roman</option>' +
'<option value="garamond">Garamond</option>' +
'<option value="palatino">Book Antiqua</option>' +
'<option value="verdana">Verdana</option>' +
'<option value="artistique">Artistique (manuscrite)</option>' +
'</select></div>' +
'<div class="champ-reglage"><label>Texte sur fond coloré</label><select id="regTexteFondColonnes"><option value="blanc">Blanc</option><option value="noir">Noir</option></select></div>' +
'<div id="sectionA4SeulementStyle2">' +
'<div class="champ-reglage case"><input type="checkbox" id="regBandeauCompetencesCles"><label for="regBandeauCompetencesCles">Bandeau "Compétences clés" (remplace la rubrique)</label></div>' +
'<div class="champ-reglage case"><input type="checkbox" id="regCoinsArrondis"><label for="regCoinsArrondis">Coins arrondis (colonnes + bandeaux)</label></div>' +
'</div>' +
'</div>' +

'<div id="sectionA4SeulementAjustement">' +
'<h3>Ajustement automatique</h3>' +
'<div class="contenu-accordeon">' +
// TACHE (retour utilisateur : "la police du CV, minimum 11, pas moins,
// sinon ce n'est pas confortable pour la lecture -- les variations entre
// 9 au minimum et 14 au maximum") : curseur exprime desormais directement
// la taille du corps de texte en px (9-14, defaut 11), plus un pourcentage
// abstrait (75-115%) -- _cvPdfEchelle reste un multiplicateur en interne
// (1 = 11px, meme convention qu'avant, juste reetalonnee -- voir
// _pdfCalculerTaillesRubrique, cvPdfTemplateA4.js), seule la CONVERSION
// affichage/valeur du curseur change (voir listener plus bas).
'<div class="champ-reglage"><label>Taille du texte (<span id="valeurEchelle">11</span>)</label><input type="range" id="regEchelle" min="9" max="14" step="0.5" value="11" style="width:100%;"></div>' +
'</div>' +
'</div>' +

'<h3>Actions</h3>' +
'<div class="contenu-accordeon">' +
'<div style="display:flex;gap:8px;">' +
'<button type="button" class="bouton-mise-en-page" id="btnReinitialiser" style="flex:1;">↺ Réinitialiser</button>' +
'<button type="button" class="bouton-mise-en-page" id="btnAnnulerAleatoire" style="flex:1;" disabled>↩ Annuler la dernière action</button>' +
'</div>' +
'</div>' +

'</div>' +

// TACHE (retour utilisateur : "si le CV a ete telecharge, Word ou PDF, je
// dois avoir le bouton merci bien j'ai fini") : marquerDocumentEnregistre()
// n'etait appele QUE par le chemin Word -- ce bouton PDF ne posait jamais
// dossier.documentsEnregistres.cv, le bouton de fin de parcours (gate sur
// ce flag, js/app.js) n'apparaissait donc jamais pour un CV fini en PDF.
// marquerDocumentEnregistre() rafraichit DEJA elle-meme .barre-navigation
// a chaque appel (voir son propre commentaire dans app.js) -- pas besoin
// d'un window.parent.pageResultats() en plus, qui rebatirait inutilement
// toute la page en dessous de cette fenetre plein ecran.
'<button type="button" class="bouton-imprimer" onclick="if(window.parent&&window.parent.trackEvenement){window.parent.trackEvenement(\'cv_telecharge\',{format:\'pdf\'});} if(window.parent&&window.parent.marquerDocumentEnregistre){window.parent.marquerDocumentEnregistre(\'cv\');} window.print();">Imprimer / Enregistrer en PDF</button>' +
'</div>' +

// TACHE (retour utilisateur : "les boutons doivent etre en contact ou sur
// le fond noir -- je les veux la haute sur la barre de ferme") : le
// declencheur visible ("main + stylo") vit desormais dans la barre du
// haut (js/app.js, ouvrirGrandApercuPdf(), fenetre parente) -- cet element
// reste PRESENT ici (invisible, .bouton-edition-pdf: display:none) car
// TOUTE la logique du mode d'edition reste cote iframe (contenteditable,
// persistance des textes edites) -- seul point d'entree distant, jamais
// une 2e logique de bascule dupliquee cote parent. Mini-barre de mise en
// forme (gras/italique) : reste ici aussi, opere directement sur la
// selection de texte DANS cette iframe.
'<button type="button" class="bouton-edition-pdf" id="btnEditionTextePdf" aria-label="Modifier le texte" title="Activer/désactiver la modification directe du texte">✍️</button>' +
'<div class="barre-format-texte" id="barreFormatTexte">' +
'<button type="button" data-cmd="bold" title="Gras"><b>G</b></button>' +
'<button type="button" data-cmd="italic" title="Italique"><i>I</i></button>' +
'</div>' +

// TACHE (retour utilisateur : "le grand apercu, je veux l'avoir en bouton
// separement et que ca soit en bas du CV") : retire de la rangee de
// cartes du haut -- bouton dedie, pleine visibilite, juste sous l'apercu,
// meme esprit que "Ouvrir le grand apercu" cote Word (js/app.js:8481,
// bouton bleu en pilule directement sous le mini apercu).
'<div class="zone-apercu"><div id="conteneurPage"></div>' +
'<button type="button" class="bouton-grand-apercu-pdf" id="btnImprimerSousApercuPdf">🖨️ Imprimer / Enregistrer en PDF</button>' +
'</div>' +

// TACHE (agrandissement par rubrique) : mini-barre flottante, UNIQUE
// (jamais une par rubrique -- repositionnee/reutilisee a chaque clic,
// voir _pdfAfficherBarreOutilsRubrique). Masquee par defaut (display:none
// dans le CSS ci-dessus), affichee/positionnee uniquement au clic.
'<div class="barre-outils-rubrique" id="barreOutilsRubrique">' +
'<div class="titre-barre"><span id="titreBarreRubrique"></span><button type="button" id="btnFermerBarreRubrique">✕</button></div>' +
'<label>Taille de cette rubrique</label>' +
'<input type="range" id="regEchelleRubrique" min="75" max="140" step="5" value="100">' +
'<div class="ligne-valeur"><span id="valeurEchelleRubrique">100%</span></div>' +
'<button type="button" class="bouton-reset-rubrique" id="btnResetRubrique">↺ Taille normale</button>' +
// TACHE (retour utilisateur : "corps de texte de la rubrique, meme
// police ou une autre au choix") : le <select> est vide ici -- rempli
// UNE FOIS au chargement (voir _pdfActiverAccordeons/init plus bas) en
// clonant les options de #regPolice, jamais une 2e liste de polices
// dupliquee a la main.
'<div class="champ-reglage case" style="margin-top:10px;"><input type="checkbox" id="regPoliceRubriqueActive"><label for="regPoliceRubriqueActive">Police différente pour cette rubrique</label></div>' +
'<select id="regPoliceRubrique" style="display:none;"></select>' +
// TACHE (retour utilisateur : "cliquer sur les competences/bandeau
// coordonnees pour choisir pastille/rectangle/texte + leur couleur juste
// pour CETTE rubrique") : masque par defaut, affiche uniquement pour les
// rubriques a puces (voir _PDF_RUBRIQUES_AVEC_PUCES/_pdfAfficherBarreOutilsRubrique) --
// meme principe checkbox-active + controles reveles que la police ci-dessus.
'<div id="zoneStylePuceRubrique" style="display:none;margin-top:10px;border-top:1px solid #333;padding-top:10px;">' +
'<div class="champ-reglage case"><input type="checkbox" id="regStylePuceRubriqueActive"><label for="regStylePuceRubriqueActive">Style personnalisé pour cette rubrique</label></div>' +
'<div id="blocStylePuceRubrique" style="display:none;">' +
'<div class="champ-reglage"><label>Style</label><select id="regStylePuceRubrique"><option value="pastille">Pastille</option><option value="rectangle">Rectangle</option><option value="texte">Texte seul</option></select></div>' +
'<div class="ligne-couleurs">' +
'<div class="champ-reglage"><label>Couleur de fond</label><input type="color" id="regCouleurFondPuceRubrique" value="#e9e9e9"></div>' +
'<div class="champ-reglage"><label>Couleur du texte</label><input type="color" id="regCouleurTextePuceRubrique" value="#1b1b1b"></div>' +
'</div>' +
'</div>' +
// TACHE (retour utilisateur, bug reel confirme apres plusieurs allers-
// retours -- "Missions n'apparait jamais", "je n'ai pas les options de
// couleur/gras/italique sur le nom") : il manquait CETTE fermeture --
// zoneStyleTexteEntete et zoneStyleMissionsRubrique (plus bas) se
// retrouvaient IMBRIQUES a l'interieur de zoneStylePuceRubrique au lieu
// d'etre ses freres, donc invisibles des que celui-ci restait
// display:none (systematiquement, sauf pour les 4 rubriques a puces --
// jamais le cas de Experiences/Engagements/Nom/Metier/Accroche). Bug
// invisible a la simple lecture du JS (chaque section gere bien SON
// PROPRE display), seulement detectable en DOM reel (parentElement).
'</div>' +
// TACHE (retour utilisateur : "cliquer sur le nom/metier/texte de
// profil... lui mettre la couleur si je veux, changer la police, changer
// le style") : meme principe checkbox-active que les 2 zones ci-dessus --
// masque par defaut, affiche uniquement pour les 4 blocs d'en-tete (voir
// _PDF_BLOCS_TEXTE_ENTETE/_pdfAfficherBarreOutilsRubrique).
'<div id="zoneStyleTexteEntete" style="display:none;margin-top:10px;border-top:1px solid #333;padding-top:10px;">' +
'<div class="champ-reglage case"><input type="checkbox" id="regStyleTexteEnteteActive"><label for="regStyleTexteEnteteActive">Couleur/style personnalisé pour ce texte</label></div>' +
'<div id="blocStyleTexteEntete" style="display:none;">' +
'<div class="champ-reglage"><label>Couleur du texte</label><input type="color" id="regCouleurTexteEntete" value="#1b1b1b"></div>' +
'<div class="champ-reglage case"><input type="checkbox" id="regTexteEnteteGras"><label for="regTexteEnteteGras">Gras</label></div>' +
'<div class="champ-reglage case"><input type="checkbox" id="regTexteEnteteItalique"><label for="regTexteEnteteItalique">Italique</label></div>' +
'</div>' +
'</div>' +
// TACHE (retour utilisateur : "quand je fais clic sur Expérience
// professionnelle/personnelle, je veux avoir l'option épuré/condensé
// direct, sans aller la chercher dans le panneau Personnaliser") : raccourci
// direct vers les selects globaux regStyleProfessionnel/regStylePersonnel
// (Style > Missions) -- jamais un 2e etat, juste un miroir qui pilote le
// select existant (data-cible), coherent avec "un seul reglage global par
// rubrique-type", pas un reglage par experience individuelle.
'<div id="zoneStyleMissionsRubrique" style="display:none;margin-top:10px;border-top:1px solid #333;padding-top:10px;">' +
'<div class="champ-reglage"><label>Missions</label><select id="regStyleMissionsRubrique"><option value="epure">Épuré (1 mission par ligne)</option><option value="condense">Condensé (missions à la suite)</option></select></div>' +
'</div>' +
'</div>' +
'</div>' +

'<script>' +
// TACHE (retour utilisateur : grand apercu en 2-3 colonnes) : drapeau deja
// pose par ouvrirGrandApercuPdf()/ouvrirApercuPdfHtml() (js/app.js,
// cvPdfExport.js) AVANT l'ecriture de ce document -- seule cette classe
// distingue les 2 contextes cote CSS (voir body.mode-grand-apercu plus
// haut), jamais un 2e document construit a part.
// TACHE (retour utilisateur : "j'arrive sur le grand apercu, mais le
// panneau personnalise est ferme") : le SEUL appelant de ouvrirGrandApercuPdf()
// est le clic sur "Personnaliser" du petit apercu embarque (voir
// btnPersonnaliserPdf plus bas) -- arriver ici EST donc toujours une
// intention explicite de personnaliser, jamais une simple consultation.
// Ouvrir la zone directement evite un 2e clic sur "Personnaliser" une fois
// arrive (avant ce correctif, ce 2e clic etait le SEUL moyen de la
// deplier, voir ce meme bouton plus bas -- deroutant, rien ne signalait
// que le panneau existait encore a deplier).
'if (window.__cvPdfModeGrandApercu) {' +
'  document.body.classList.add("mode-grand-apercu");' +
'  document.getElementById("zoneReglagesPdfPersonnalisation").classList.add("ouverte");' +
'}' +
'var _cvPdfEchelle = 1;' +
// TACHE (retour utilisateur, bug reel confirme : "le bouton Mise en page
// freeze" -- cause diagnostiquee precisement) : _pdfAjusterMiseEnPage()/
// _pdfAjusterMiseEnPageA5() (plus bas) enchainent une vingtaine de
// regenerations completes de #conteneurPage + mesures DOM forcees (chaque
// mesure oblige le navigateur a calculer le layout reel, operation lente
// repetee en boucle) -- TOUT en synchrone, sans le moindre point de
// reprise pour le thread principal. Un reclic pendant ce calcul (le
// bouton reste visuellement inerte, l\'utilisateur insiste) ne se perd
// jamais : il s\'empile dans la file d\'evenements et relance un calcul
// COMPLET des que le premier se termine, cumulant les delais au lieu de
// les ignorer -- c\'est ce cumul, pas une boucle infinie, qui donne
// l\'impression d\'un gel definitif. _cvPdfMiseEnPageEnCours (utilise par
// les 2 fonctions plus bas) empeche ce cumul en desactivant reellement le
// bouton AVANT tout calcul (un bouton disabled ne redeclenche jamais de
// clic, meme empile) -- jamais un simple flag JS relu en cours de route,
// qui ne changerait rien vu que les appels restent strictement
// sequentiels (JS mono-thread, aucun chevauchement reel possible).' +
'var _cvPdfMiseEnPageEnCours = false;' +
// Meme garde, dediee au bouton Mini CV A5 (_pdfAjusterMiseEnPageA5 plus
// bas) -- flag distinct plutot que reutiliser le precedent : les 2
// boutons ne sont jamais visibles/cliquables en meme temps (formats A4/A5
// mutuellement exclusifs), mais rien n\'empeche de garder cette garantie
// explicite plutot que de la deduire indirectement de l\'UI.
'var _cvPdfMiseEnPageA5EnCours = false;' +
// TACHE (glisser-deposer des rubriques) : etat PERSISTANT (survit aux
// re-rendus complets de #conteneurPage, meme principe que _cvPdfEchelle
// ci-dessus) -- null = ordre automatique (comportement inchange), sinon
// { gauche: string[], droite: string[] } lu par cvPdfTemplateA4.js
// (options.ordrePersonnalise) pour remplacer entierement la repartition
// automatique. Jamais touche par le style aleatoire (c'est un choix de
// CONTENU, pas un style visuel) -- seul "Reinitialiser" le remet a null.
'var _cvPdfOrdrePersonnalise = null;' +
'var _cvPdfElementGlisse = null;' +
// TACHE (agrandissement par rubrique) : { cle: echelle } (defaut {}) --
// persiste comme _cvPdfOrdrePersonnalise ci-dessus, jamais touche par le
// style aleatoire, efface uniquement par "Reinitialiser".
'var _cvPdfEchellesRubriques = {};' +
// TACHE (retour utilisateur : "corps de texte de la rubrique, meme police
// ou une autre au choix") : { cle: idPolice } (defaut {}) -- meme
// convention persistante que _cvPdfEchellesRubriques ci-dessus.
'var _cvPdfPolicesRubriques = {};' +
// TACHE (retour utilisateur : "cliquer sur les competences/bandeau
// coordonnees pour choisir pastille/rectangle/texte + couleurs juste pour
// CETTE rubrique") : { cle: {style, couleurFond, couleurTexte} } (defaut
// {}) -- meme convention persistante que _cvPdfEchellesRubriques/
// _cvPdfPolicesRubriques ci-dessus, uniquement pour les rubriques a puces
// (voir _PDF_RUBRIQUES_AVEC_PUCES plus bas).
'var _cvPdfStylesPuceRubriques = {};' +
// TACHE (retour utilisateur, bug reel confirme en capture d'ecran : "je
// desactive Sobre, rien ne revient a part la bande de coordonnees") :
// snapshot des VRAIS controles ecrases par _pdfAppliquerSobrePdf() (plus
// bas), pris juste avant de les ecraser -- restaure integralement a la
// desactivation (voir le handler de btnSobrePdf plus bas), jamais
// simplement abandonne. null = aucune activation Sobre en cours.
'var _cvPdfReglagesAvantSobre = null;' +
// TACHE (retour utilisateur : "Sobre ne veut pas dire zero couleur -- une
// couleur pale sur le bandeau ou sur la colonne, jamais les 2, jamais les
// 2 a zero si le CV est sur 2 colonnes") : 'colonne'|'bandeau'|'aucune',
// tiree au hasard par _pdfTirerVarianteSobre() (voir plus bas) -- UNE SEULE
// FOIS a l'activation de Sobre (ou a un nouveau tirage "Style aleatoire"
// pendant que Sobre reste actif), jamais re-tiree a chaque _pdfRafraichir()
// (curseur deplace, case cochee...) pour eviter un scintillement de couleur
// a chaque interaction. Consommee dans _pdfLireOptions() plus bas.
'var _cvPdfSobreVariante = null;' +
// TACHE (chantier "CV Créatif") : meme role exact que les 2 variables
// Sobre juste au-dessus, jamais fusionnees avec elles (Sobre et Créatif
// sont mutuellement exclusifs mais chacun garde son propre snapshot --
// activer Créatif puis Sobre juste apres ne doit jamais melanger les 2
// etats "avant").
'var _cvPdfReglagesAvantCreatif = null;' +
'var _cvPdfCreatifVariante = null;' +
// TACHE (retour utilisateur explicite : "on ne va pas melanger les
// elements des CV créatifs entre -- il n'y a pas de lien et ca va etre
// tres complique d'avoir quelque chose de coherent. Chaque modele de CV
// créatif... sera un modele unique") : CHAQUE variante est un objet
// COMPLET et FIGE couvrant tous les champs qui influencent le rendu visuel
// (formes, couleurs, police, alignements...) -- jamais un sous-ensemble
// partiel qu\'on laisserait "Style aleatoire" completer au hasard, ce qui
// recreerait exactement le risque de cocktail que cette regle interdit.
// Ajouter une 3e variante = ajouter une 3e entree ici, jamais toucher au
// code qui les consomme plus bas (_pdfLireOptions/_pdfAppliquerRecetteCreatifDOM).
'var _PDF_CREATIF_RECETTES = {' +
'  sidebarVague: {' +
'    icones: false, iconesCoordonnees: false, styleCompetences: "pastille", coinsArrondis: true, styleTitres: "bandeau",' +
'    lectureGuidee: false, anneauPhoto: true, formatExperiences: "ameliore", pilluleExperiences: true,' +
'    separateurColonnes: false, bandeauEnTete: false, formeEnTete: "rectangle", degradeBandeau: "aucun",' +
'    fondColonnePleineHauteur: true, fondColonnes: "gauche", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "vague", colonnes: 2, largeurColonneGauche: 35,' +
'    colonnesInversees: false, dispositionEntete: "2colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    police: "verdana", couleurDebut: "#3B2E5C", couleurFin: "#8172B0", texteFondColonnes: "blanc"' +
'  },' +
'  rubanDiagonal: {' +
'    icones: false, iconesCoordonnees: false, styleCompetences: "pastille", coinsArrondis: true, styleTitres: "bandeau",' +
'    lectureGuidee: false, anneauPhoto: true, formatExperiences: "ameliore", pilluleExperiences: true,' +
'    separateurColonnes: false, bandeauEnTete: true, formeEnTete: "diagonale", degradeBandeau: "fonce-clair",' +
'    fondColonnePleineHauteur: false, fondColonnes: "aucun", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "rectangle", colonnes: 2, largeurColonneGauche: 50,' +
'    colonnesInversees: false, dispositionEntete: "3colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    police: "segoe", couleurDebut: "#0F6E56", couleurFin: "#5DCAA5", texteFondColonnes: "blanc"' +
'  },' +
// TACHE (chantier "10 nouveaux modeles Créatif", retour utilisateur : "je
// prends tout, mais j'en veux encore -- au moins une bonne dizaine") : 7
// nouvelles recettes, inspirees des 2 CV personnels de l'utilisateur et
// des captures d'ecran fournies -- chacune reutilise au maximum les
// champs deja existants (memes lecons que sidebarVague/rubanDiagonal),
// n'ajoute que les 5 nouveaux champs partages construits pour ce chantier
// (photoForme, blocsCompetencesEncadres, cadrePage, enteteCentree,
// nomVertical -- voir cvPdfTemplateA4.js). Formes non reproductibles
// (textures, illustrations, ruban diagonal complet suivant le contenu)
// volontairement absentes -- voir echange avec l\'utilisateur, gardees
// pour un chantier separe plus tard.
'  duoOvale: {' +
'    icones: false, iconesCoordonnees: false, styleCompetences: "texte", coinsArrondis: true, styleTitres: "bandeau",' +
'    lectureGuidee: false, anneauPhoto: true, formatExperiences: "standard", pilluleExperiences: false,' +
'    separateurColonnes: false, bandeauEnTete: true, formeEnTete: "rectangle", degradeBandeau: "aucun",' +
'    fondColonnePleineHauteur: false, fondColonnes: "aucun", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "rectangle", colonnes: 2, largeurColonneGauche: 50,' +
'    colonnesInversees: false, dispositionEntete: "2colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    police: "segoe", couleurDebut: "#2f6690", couleurFin: "#6fa3c7", texteFondColonnes: "blanc",' +
'    photoForme: "rond", blocsCompetencesEncadres: true, cadrePage: false, enteteCentree: false, nomVertical: false, filetHaut: false, photoMedaillon: false' +
'  },' +
'  cadreBarre: {' +
'    icones: false, iconesCoordonnees: false, styleCompetences: "pastille", coinsArrondis: false, styleTitres: "bandeau",' +
'    lectureGuidee: false, anneauPhoto: true, formatExperiences: "ameliore", pilluleExperiences: true,' +
'    separateurColonnes: true, bandeauEnTete: false, formeEnTete: "rectangle", degradeBandeau: "aucun",' +
'    fondColonnePleineHauteur: false, fondColonnes: "aucun", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "rectangle", colonnes: 2, largeurColonneGauche: 36,' +
'    colonnesInversees: false, dispositionEntete: "2colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    police: "segoe", couleurDebut: "#1c3d52", couleurFin: "#3d6a8a", texteFondColonnes: "blanc",' +
'    photoForme: "rond", blocsCompetencesEncadres: false, cadrePage: true, enteteCentree: true, nomVertical: false, filetHaut: false, photoMedaillon: false' +
'  },' +
'  bandeauVertical: {' +
'    icones: false, iconesCoordonnees: false, styleCompetences: "pastille", coinsArrondis: false, styleTitres: "bandeau",' +
'    lectureGuidee: false, anneauPhoto: false, formatExperiences: "ameliore", pilluleExperiences: true,' +
'    separateurColonnes: false, bandeauEnTete: true, formeEnTete: "rectangle", degradeBandeau: "aucun",' +
'    fondColonnePleineHauteur: false, fondColonnes: "aucun", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "rectangle", colonnes: 2, largeurColonneGauche: 40,' +
'    colonnesInversees: false, dispositionEntete: "2colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    police: "segoe", couleurDebut: "#1c1c1c", couleurFin: "#333333", texteFondColonnes: "blanc",' +
'    photoForme: "rond", blocsCompetencesEncadres: false, cadrePage: false, enteteCentree: false, nomVertical: true, filetHaut: false, photoMedaillon: false' +
'  },' +
'  triangleSavoir: {' +
'    icones: false, iconesCoordonnees: false, styleCompetences: "rectangle", coinsArrondis: false, styleTitres: "souligne",' +
'    lectureGuidee: false, anneauPhoto: true, formatExperiences: "ameliore", pilluleExperiences: false,' +
'    separateurColonnes: false, bandeauEnTete: true, formeEnTete: "coin", degradeBandeau: "aucun",' +
'    fondColonnePleineHauteur: false, fondColonnes: "aucun", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "rectangle", colonnes: 2, largeurColonneGauche: 36,' +
'    colonnesInversees: false, dispositionEntete: "2colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    police: "segoe", couleurDebut: "#0b5c47", couleurFin: "#3f9478", texteFondColonnes: "blanc",' +
'    photoForme: "rond", blocsCompetencesEncadres: false, cadrePage: false, enteteCentree: false, nomVertical: false, filetHaut: false, photoMedaillon: false' +
'  },' +
'  vagueMarine: {' +
'    icones: false, iconesCoordonnees: false, styleCompetences: "pastille", coinsArrondis: true, styleTitres: "bandeau",' +
'    lectureGuidee: false, anneauPhoto: true, formatExperiences: "ameliore", pilluleExperiences: true,' +
'    separateurColonnes: false, bandeauEnTete: true, formeEnTete: "vague", degradeBandeau: "aucun",' +
'    fondColonnePleineHauteur: false, fondColonnes: "aucun", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "rectangle", colonnes: 2, largeurColonneGauche: 50,' +
'    colonnesInversees: false, dispositionEntete: "2colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    police: "segoe", couleurDebut: "#1c3d52", couleurFin: "#3d6a8a", texteFondColonnes: "blanc",' +
'    photoForme: "rond", blocsCompetencesEncadres: false, cadrePage: false, enteteCentree: false, nomVertical: false, filetHaut: false, photoMedaillon: false' +
'  },' +
'  diagonalesContrastees: {' +
'    icones: false, iconesCoordonnees: false, styleCompetences: "pastille", coinsArrondis: false, styleTitres: "bandeau",' +
'    lectureGuidee: false, anneauPhoto: true, formatExperiences: "ameliore", pilluleExperiences: false,' +
'    separateurColonnes: false, bandeauEnTete: true, formeEnTete: "diagonale", degradeBandeau: "fonce-clair",' +
'    fondColonnePleineHauteur: false, fondColonnes: "aucun", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "rectangle", colonnes: 2, largeurColonneGauche: 50,' +
'    colonnesInversees: false, dispositionEntete: "2colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    police: "segoe", couleurDebut: "#111111", couleurFin: "#F2B705", texteFondColonnes: "blanc",' +
'    photoForme: "rond", blocsCompetencesEncadres: false, cadrePage: false, enteteCentree: false, nomVertical: false, filetHaut: false, photoMedaillon: false' +
'  },' +
'  losangeVert: {' +
'    icones: false, iconesCoordonnees: false, styleCompetences: "barre", coinsArrondis: false, styleTitres: "souligne",' +
'    lectureGuidee: false, anneauPhoto: false, formatExperiences: "ameliore", pilluleExperiences: false,' +
'    separateurColonnes: false, bandeauEnTete: false, formeEnTete: "rectangle", degradeBandeau: "aucun",' +
'    fondColonnePleineHauteur: false, fondColonnes: "aucun", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "rectangle", colonnes: 2, largeurColonneGauche: 36,' +
'    colonnesInversees: false, dispositionEntete: "2colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    police: "segoe", couleurDebut: "#3d6b2c", couleurFin: "#7fae3f", texteFondColonnes: "blanc",' +
'    photoForme: "losange", blocsCompetencesEncadres: false, cadrePage: false, enteteCentree: false, nomVertical: false, filetHaut: false, photoMedaillon: false' +
'  },' +
// TACHE (retour utilisateur : "va chercher sur internet des CV qui se
// differencient... si techniquement je ne suis pas capable de le
// reproduire, dis-le") : 2 modeles trouves en parcourant des galeries de
// templates (Kickresume), REDESSINES a la main (jamais copies tels quels,
// jamais de texture/illustration -- meme filtre de faisabilite que le
// chantier precedent), maquette validee par l'utilisateur avant ce code
// (artifact HTML, 2 apercus A4). "Pastille" introduit un titre de
// rubrique inedit (icone dans un rond colore, styleTitres:"pastille",
// cvPdfTemplateA4.js) ; "Médaillon" fait chevaucher la photo sur le bord
// bas du bandeau d'en-tete (photoMedaillon, meme fichier). Icones
// ACTIVEES pour les 2 (retour utilisateur explicite : la contrainte
// "Créatif reste pauvre en icônes" du chantier precedent est levee des
// que le rendu s'y prete).
'  pastille: {' +
'    icones: true, iconesCoordonnees: true, styleCompetences: "pastille", coinsArrondis: true, styleTitres: "pastille",' +
'    lectureGuidee: false, anneauPhoto: false, formatExperiences: "ameliore", pilluleExperiences: false,' +
'    separateurColonnes: false, bandeauEnTete: false, formeEnTete: "rectangle", degradeBandeau: "aucun",' +
'    fondColonnePleineHauteur: false, fondColonnes: "aucun", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "rectangle", colonnes: 2, largeurColonneGauche: 33,' +
'    colonnesInversees: false, dispositionEntete: "2colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    police: "trebuchet", couleurDebut: "#7d2e43", couleurFin: "#c98a9a", texteFondColonnes: "blanc",' +
'    photoForme: "rond", blocsCompetencesEncadres: false, cadrePage: false, enteteCentree: false, nomVertical: false, filetHaut: true, photoMedaillon: false' +
'  },' +
'  medaillon: {' +
'    icones: true, iconesCoordonnees: true, styleCompetences: "pastille", coinsArrondis: true, styleTitres: "souligne",' +
'    lectureGuidee: false, anneauPhoto: false, formatExperiences: "ameliore", pilluleExperiences: false,' +
'    separateurColonnes: false, bandeauEnTete: true, formeEnTete: "rectangle", degradeBandeau: "aucun",' +
'    fondColonnePleineHauteur: false, fondColonnes: "aucun", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "rectangle", colonnes: 2, largeurColonneGauche: 32,' +
'    colonnesInversees: false, dispositionEntete: "2colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    police: "georgia", couleurDebut: "#33475b", couleurFin: "#6f88a3", texteFondColonnes: "blanc",' +
'    photoForme: "rond", blocsCompetencesEncadres: false, cadrePage: false, enteteCentree: false, nomVertical: false, filetHaut: false, photoMedaillon: true' +
'  }' +
'};' +
// TACHE (memes 7 recettes) : les recettes deja existantes (sidebarVague/
// rubanDiagonal) n\'avaient pas encore les 5 nouveaux champs partages --
// ajoutes ici a la valeur neutre (identique au comportement d\'avant ce
// chantier) pour que le snapshot generique (qui iterait deja sur
// Object.keys(sidebarVague), voir plus bas) les couvre aussi pour TOUTES
// les recettes, jamais seulement les 7 nouvelles.
'_PDF_CREATIF_RECETTES.sidebarVague.photoForme = "rond";' +
'_PDF_CREATIF_RECETTES.sidebarVague.blocsCompetencesEncadres = false;' +
'_PDF_CREATIF_RECETTES.sidebarVague.cadrePage = false;' +
'_PDF_CREATIF_RECETTES.sidebarVague.enteteCentree = false;' +
'_PDF_CREATIF_RECETTES.sidebarVague.nomVertical = false;' +
'_PDF_CREATIF_RECETTES.sidebarVague.filetHaut = false;' +
'_PDF_CREATIF_RECETTES.sidebarVague.photoMedaillon = false;' +
'_PDF_CREATIF_RECETTES.rubanDiagonal.photoForme = "rond";' +
'_PDF_CREATIF_RECETTES.rubanDiagonal.blocsCompetencesEncadres = false;' +
'_PDF_CREATIF_RECETTES.rubanDiagonal.cadrePage = false;' +
'_PDF_CREATIF_RECETTES.rubanDiagonal.enteteCentree = false;' +
'_PDF_CREATIF_RECETTES.rubanDiagonal.nomVertical = false;' +
'_PDF_CREATIF_RECETTES.rubanDiagonal.filetHaut = false;' +
'_PDF_CREATIF_RECETTES.rubanDiagonal.photoMedaillon = false;' +
// TACHE (meme regle) : conversion generique nomDuChamp -> id de controle DOM
// ("couleurDebut" -> "regCouleurDebut") -- tous les champs des recettes
// suivent cette convention SAUF pilluleExperiences (n\'existe pas comme
// controle DOM, uniquement lu via `opts` par _pdfLireOptions ci-dessous) et
// ordrePersonnalise (etat hors-DOM, _cvPdfOrdrePersonnalise). Une seule
// fonction generique plutot que 3 listages manuels des memes champs
// (_pdfAppliquerCreatifPdf/_pdfAnnulerCreatifPdf/le reroll du de) --
// risque reel sinon qu\'un champ ajoute a une recette soit oublie dans un
// des 3 listages et cree silencieusement un cocktail partiel.
'function _pdfIdControlePour(champ) { return "reg" + champ.charAt(0).toUpperCase() + champ.slice(1); }' +
'function _pdfAppliquerRecetteCreatifDOM(variante) {' +
'  var recette = _PDF_CREATIF_RECETTES[variante] || _PDF_CREATIF_RECETTES.sidebarVague;' +
'  Object.keys(recette).forEach(function (champ) {' +
'    if (champ === "pilluleExperiences") { return; }' +
'    var el = document.getElementById(_pdfIdControlePour(champ));' +
'    if (!el) { return; }' +
'    if (el.type === "checkbox") { el.checked = recette[champ]; } else { el.value = recette[champ]; }' +
'  });' +
// TACHE (meme bug que documente plus bas pour sidebarVague) : ordrePersonnalise
// n\'est PAS un champ de recette generique (structure {gauche,droite}, pas
// une simple valeur de controle) -- reste gere a part, par variante.
'  if (variante === "sidebarVague") {' +
'    _cvPdfOrdrePersonnalise = { gauche: ["competences", "competencesComportementales", "langues", "loisirs"], droite: ["experiences", "formations", "engagements", "certifications"] };' +
'  } else {' +
'    _cvPdfOrdrePersonnalise = null;' +
'  }' +
// TACHE (modele "Médaillon") : meme principe exact que ordrePersonnalise
// juste au-dessus -- positionsEntete (glisser-depose nom/metier/accroche)
// n\'est pas non plus un simple champ de recette generique (structure
// {cle:{x,y}}), reste gere a part. Sans ceci, nom/metier resteraient sur
// leurs positions par defaut (_PDF_POSITIONS_LIBRES_DEFAUT, cvPdfTemplateA4.js),
// qui ne laissent pas de place a une photo posee a cheval sur le bandeau.
// TACHE (point 19, retour utilisateur : coordonnees devenu un bloc
// independant) : sans son propre x/y ici, coordonnees serait tombee sur
// _PDF_POSITIONS_LIBRES_DEFAUT.coordonnees (x:2, y bien plus bas) --
// jamais pense pour le medaillon, ni aligne avec le nom (x:34) ni juste en
// dessous de lui (y:10) comme visuellement attendu. Meme x que nom, y+12
// (meme ecart que le defaut generique) pour rester juste sous le nom.
'  if (variante === "medaillon") {' +
'    _cvPdfPositionsEntete = { nom: { x: 34, y: 10 }, coordonnees: { x: 34, y: 22 }, metier: { x: 34, y: 34 } };' +
'  } else {' +
'    _cvPdfPositionsEntete = {};' +
'  }' +
'}' +
// TACHE (retour utilisateur : "pouvoir modifier le texte directement,
// recuperer la police/taille/style tel qu'il est actuellement") : mode
// dedie -- actif, le glisser-depose/redimensionnement/mini-barre par
// rubrique sont TOUS desactives (voir la branche _pdfRafraichir() plus
// bas), remplaces par un simple clic-pour-editer sur chaque texte
// (contenteditable, herite naturellement le style de l'element cible,
// jamais une 2e mise en forme a gerer separement). _cvPdfTextesEdites :
// { idEdition: htmlEdite } -- idEdition genere par
// _pdfAssignerIdentifiantsEdition() (position dans sa rubrique, stable
// d'un rafraichissement a l'autre tant que le CONTENU source ne change
// pas), jamais un identifiant invente ici. Reapplique apres CHAQUE
// re-rendu (le html genere depuis dossier/opts est toujours la source de
// verite -- ces overrides sont une couche par-dessus, jamais une 2e copie
// des donnees).
'var _cvPdfModeEditionTexte = false;' +
'var _cvPdfTextesEdites = {};' +
'var _PDF_RUBRIQUES_AVEC_PUCES = ["competences", "competencesComportementales", "bandeauDisponibilite", "competencesCles"];' +
// TACHE (retour utilisateur : "lui mettre la couleur si je veux, changer
// le style" -- nom/metier/accroche) : rubriques d'en-tete pour lesquelles
// la mini-barre flottante propose couleur + gras/italique, en plus de la
// taille/police deja disponibles pour toutes (voir _PDF_NOMS_RUBRIQUES).
'var _PDF_BLOCS_TEXTE_ENTETE = ["entete-nom", "entete-metier", "entete-accroche", "entete-coordonnees"];' +
'var _cvPdfStylesTexteEntete = {};' +
// TACHE (retour utilisateur : "position libre... sur les axes x/y") :
// { cle: {x, y} } (defaut {}) -- x/y en % de .entete-libre, cle in
// ('nom','accroche','metier'). Meme convention persistante que les etats
// par-rubrique ci-dessus.
'var _cvPdfPositionsEntete = {};' +
// TACHE (point 19, retour utilisateur : "rendre la hauteur de la zone
// d'en-tete redimensionnable a la souris") : hauteur en px de .entete-libre
// (defaut null = 210px, la valeur fixe d'origine, voir cvPdfTemplateA4.js)
// -- meme convention persistante que les etats par-rubrique ci-dessus.
'var _cvPdfHauteurEntete = null;' +
// TACHE (retour utilisateur, bug reel confirme : "l'experience
// professionnelle toujours seule dans une colonne, l'autre a tout le
// reste") : { cle: 'gauche'|'droite' } (defaut {}) -- rubriques
// deplacees par le reequilibrage automatique par mesure DOM
// (_pdfEssayerRequilibrageColonnes plus bas), jamais un choix manuel de
// la personne (glisser-depose, _cvPdfOrdrePersonnalise, reste prioritaire
// -- voir cvPdfTemplateA4.js). Meme convention persistante que les etats
// par-rubrique ci-dessus.
'var _cvPdfRubriquesForceesColonne = {};' +
'var _cvPdfRubriqueSelectionnee = null;' +
'var _PDF_NOMS_RUBRIQUES = {' +
'  profil: "Profil", experiences: "Expériences", formations: "Formations", competences: "Compétences professionnelles",' +
'  competencesComportementales: "Compétences comportementales",' +
'  langues: "Langues", loisirs: "Centres d\'intérêt", engagements: "Expérience personnelle", certifications: "Certifications",' +
// TACHE (rubrique « Logiciels et outils » dédiée, décision Denis 2026-08-28) :
// libellé de la mini-barre flottante quand la rubrique est sélectionnée
// (sinon la clé brute "logiciels" s'afficherait comme titre).
'  logiciels: "Logiciels et outils",' +
'  "entete-nom": "Nom", "entete-metier": "Métier visé", "entete-accroche": "Accroche", "entete-coordonnees": "Coordonnées", bandeauDisponibilite: "Bandeau coordonnées",' +
'  competencesCles: "Compétences clés",' +
// TACHE (retour utilisateur : "les mêmes options que l'A4 sur le Mini CV
// A5") : seule cle propre a l'A5 (cvPdfTemplateA5.js), absente jusqu'ici
// de ce dictionnaire -- la mini-barre flottante affichait la cle brute
// "competencesPersonnelles" comme titre, jamais un vrai libelle.
'  competencesPersonnelles: "Compétences comportementales"' +
'};' +
'function _pdfLireOptions() {' +
'  var opts = {' +
'    echelleContenu: _cvPdfEchelle,' +
'    ordrePersonnalise: _cvPdfOrdrePersonnalise,' +
'    echellesRubriques: _cvPdfEchellesRubriques,' +
'    policesRubriques: _cvPdfPolicesRubriques,' +
'    stylesPuceRubriques: _cvPdfStylesPuceRubriques,' +
'    positionLibreEntete: document.getElementById("regPositionLibreEntete").checked,' +
'    dispositionEntete: document.getElementById("regDispositionEntete").value,' +
'    largeurAccrocheLibre: parseInt(document.getElementById("regLargeurAccrocheLibre").value, 10),' +
'    largeurMetierLibre: parseInt(document.getElementById("regLargeurMetierLibre").value, 10),' +
'    positionsEntete: _cvPdfPositionsEntete,' +
'    hauteurEntete: _cvPdfHauteurEntete,' +
'    stylesTexteEntete: _cvPdfStylesTexteEntete,' +
'    rubriquesForceesColonne: _cvPdfRubriquesForceesColonne,' +
'    formeEnTete: document.getElementById("regFormeEnTete").value,' +
'    colonnes: parseInt(document.getElementById("regColonnes").value, 10),' +
'    colonnesInversees: document.getElementById("regColonnesInversees").checked,' +
'    largeurColonneGauche: parseInt(document.getElementById("regLargeurColonneGauche").value, 10),' +
'    separateurColonnes: document.getElementById("regSeparateurColonnes").checked,' +
'    formeColonnes: document.getElementById("regFormeColonnes").value,' +
'    anneauPhoto: document.getElementById("regAnneauPhoto").checked,' +
'    couleurDebut: document.getElementById("regCouleurDebut").value,' +
'    couleurFin: document.getElementById("regCouleurFin").value,' +
'    fondColonnes: document.getElementById("regFondColonnes").value,' +
'    fondColonnesEffet: document.getElementById("regFondColonnesEffet").value,' +
'    degradeColonnes: document.getElementById("regDegradeColonnes").value,' +
'    fondColonnePleineHauteur: document.getElementById("regFondColonnePleineHauteur").checked,' +
'    bandeauEnTete: document.getElementById("regBandeauEnTete").checked,' +
'    degradeBandeau: document.getElementById("regDegradeBandeau").value,' +
'    bandeauDisponibilite: document.getElementById("regBandeauDisponibilite").checked,' +
'    styleTitres: document.getElementById("regStyleTitres").value,' +
'    lectureGuidee: document.getElementById("regLectureGuidee").checked,' +
'    styleProfessionnel: document.getElementById("regStyleProfessionnel").value,' +
'    stylePersonnel: document.getElementById("regStylePersonnel").value,' +
'    soulignerPoste: document.getElementById("regSoulignerPoste").checked,' +
'    italiquePoste: document.getElementById("regItaliquePoste").checked,' +
'    soulignerDates: document.getElementById("regSoulignerDates").checked,' +
'    italiqueDates: document.getElementById("regItaliqueDates").checked,' +
'    soulignerEntreprise: document.getElementById("regSoulignerEntreprise").checked,' +
'    italiqueEntreprise: document.getElementById("regItaliqueEntreprise").checked,' +
'    styleBordures: document.getElementById("regStyleBordures").value,' +
'    iconesRubriques: document.getElementById("regIcones").checked,' +
'    iconesCoordonnees: document.getElementById("regIconesCoordonnees").checked,' +
'    police: document.getElementById("regPolice").value,' +
'    texteFondColonnes: document.getElementById("regTexteFondColonnes").value,' +
'    styleCompetences: document.getElementById("regStyleCompetences").value,' +
'    couleurFondCompetences: document.getElementById("regCouleurFondCompetences").value,' +
'    couleurTextePuces: document.getElementById("regCouleurTextePuces").value,' +
'    bandeauCompetencesCles: document.getElementById("regBandeauCompetencesCles").checked,' +
'    coinsArrondis: document.getElementById("regCoinsArrondis").checked,' +
'    fondColonnesA5: document.getElementById("regFondColonnesA5").value,' +
'    enteteInverseeA5: document.getElementById("regEnteteInverseeA5").checked,' +
'    remplirPageA5: document.getElementById("regRemplirPageA5").checked,' +
// TACHE (retour utilisateur : "Une lettre de motivation accompagne ce
// CV ? Si oui, la phrase d'accroche est retirée automatiquement") : meme
// regle que composeurMoteur.js:77 (Word) -- sansAccroche effectif = case
// manuelle OU lettre jointe, jamais 2 logiques paralleles de retrait.
'    sansAccroche: document.getElementById("regSansAccroche").checked || document.getElementById("regLettreJointe").checked,' +
// TACHE (bouton "Mettre en avant + regrouper") : lu ici comme les autres
// reglages, mais consomme a part par _pdfRafraichir (passe a
// construireDonneesPdfCV -- decision de CONTENU, pas juste de style, voir
// cvPdfDonnees.js), jamais transmis tel quel a _pdfConstruireStyleEtPage.
'    regroupementActif: document.getElementById("regRegroupementActif").checked,' +
'    ordreExperiences: document.getElementById("regOrdreExperiences").value,' +
'    formatExperiences: document.getElementById("regFormatExperiences").value' +
'  };' +
// TACHE (retour utilisateur, repete plusieurs fois : "peu importe les
// modes que je vais avoir, le mode Sobre doit les faire disparaitre ou
// sauter TOUS -- pas de couleur flashy, pas d'icone, pas de pastille, pas
// de rectangle") : jusqu'ici, _pdfAppliquerSobrePdf() ne faisait que
// POUSSER ces valeurs une seule fois, au clic -- n'importe quel reglage
// individuel change ENSUITE (case a cocher, select, et surtout "Style
// aleatoire" qui retire ses propres valeurs sur TOUS les controles)
// pouvait donc faire reapparaitre icones/pastilles/couleurs sans jamais
// decocher visuellement le bouton "CV Sobre". Applique desormais ICI, au
// point de lecture UNIQUE consomme par _pdfRafraichir() -- aucun autre
// reglage ne peut plus jamais passer au travers tant que la case cachee
// regSobreActif reste cochee, quelle que soit sa provenance (tirage
// aleatoire, mini-barre flottante par rubrique, changement manuel...).
// stylesPuceRubriques force a {} (pas juste ignore) : un override PAR
// RUBRIQUE pose AVANT l\'activation de Sobre primerait sinon toujours sur
// styleCompetences ci-dessous (_pdfStylePuceEffectif, cvPdfTemplateA4.js).
'  if (document.getElementById("regSobreActif").checked) {' +
'    opts.iconesRubriques = false;' +
'    opts.iconesCoordonnees = false;' +
'    opts.styleCompetences = "texte";' +
'    opts.stylesPuceRubriques = {};' +
'    opts.coinsArrondis = false;' +
'    opts.styleTitres = "souligne";' +
'    opts.lectureGuidee = false;' +
'    opts.fondColonnePleineHauteur = false;' +
'    opts.formeColonnes = "rectangle";' +
'    opts.formeEnTete = "rectangle";' +
'    opts.styleBordures = "fine";' +
// TACHE (retour utilisateur : "Sobre ne veut pas dire zero couleur -- une
// couleur pale sur le bandeau ou sur la colonne") : contrairement aux
// champs ci-dessus (toujours forces a "eteint"), fondColonnes/bandeauEnTete
// dependent desormais de _cvPdfSobreVariante (tiree par
// _pdfTirerVarianteSobre(), voir plus bas) -- exactement UN SEUL des 2 peut
// rester actif (jamais les 2 ensemble, jamais les 2 a "aucun" si le CV est
// sur 2 colonnes). opts.sobreActif/opts.sobreVariante transmis tels quels a
// _pdfConstruireStyleEtPage (cvPdfTemplateA4.js, fenetre parente) qui
// calcule la teinte PALE reelle via _pdfMelangerHex -- jamais la couleur
// d\'accent brute, jamais recalcule ici (utilitaire absent du scope iframe).
'    opts.sobreActif = true;' +
'    opts.sobreVariante = _cvPdfSobreVariante || "aucune";' +
'    opts.fondColonnes = (opts.sobreVariante === "colonne") ? (document.getElementById("regFondColonnes").value === "aucun" ? "lesDeux" : document.getElementById("regFondColonnes").value) : "aucun";' +
'    opts.fondColonnesEffet = "fondSeul";' +
// TACHE (bug reel trouve en relisant cvPdfTemplateA4.js : "Couleur unie"
// (degradeColonnes==="aucun") ne rend PAS un fond plat -- ca retire
// entierement la classe .degrade-actif, donc AUCUN fond du tout, voir
// gaucheAvecFondPlein/droiteAvecFondPlein) : force "aucun" ici aurait donc
// rendu la variante 'colonne' invisible. Garde une vraie valeur de degrade
// pour que le fond s'affiche -- l'aspect "couleur unie" vient a la place du
// couleurDebut/couleurFin PALES et quasi identiques calcules cote
// _pdfConstruireStyleEtPage (cvPdfTemplateA4.js), jamais de ce reglage.
'    opts.degradeColonnes = (opts.sobreVariante === "colonne") ? "fonce-clair" : "aucun";' +
'    opts.bandeauEnTete = (opts.sobreVariante === "bandeau");' +
'    opts.degradeBandeau = "aucun";' +
// TACHE (retour utilisateur : "si jamais compétences pro/comportementales
// sont fusionnees en competences cles, on les voit en haut... ca reste
// valable en mode Sobre") : bandeauCompetencesCles n\'est PAS force ici
// (contrairement aux champs "flashy" ci-dessus) -- variante de CONTENU
// valide en Sobre, deja rendue sans pastille grace a styleCompetences/
// stylesPuceRubriques ci-dessus (_pdfStylePuceEffectif, cvPdfTemplateA4.js).
// TACHE (retour utilisateur : "le mode Sobre s'applique-t-il aussi au Mini
// CV A5 ?") : reponse trouvee en verifiant -- NON jusqu'ici, sur 2 points.
// fondColonnesA5 (reglage A5-SEULEMENT, cvPdfTemplateA5.js -- distinct de
// fondColonnes ci-dessus, jamais lu par le rendu A4) a une couleur active
// PAR DEFAUT ("droite") et n\'etait jamais touche par ce garde-fou -- une
// colonne A5 restait coloree meme en Sobre. Force ici, simplement "aucun"
// (jamais la nuance "variante palee" du A4 ci-dessus : systeme de couleur
// distinct --a5-accent/--a5-texte-fond, jamais branche sur _pdfMelangerHex).
'    opts.fondColonnesA5 = "aucun";' +
'  }' +
// TACHE (chantier "CV Créatif") : au choix/tirage d\'un modele,
// _pdfAppliquerRecetteCreatifDOM (plus haut) ecrit deja la recette
// COMPLETE sur les vrais controles DOM (couleurs, mise en page, styles...)
// -- ce bloc ne fait donc PLUS que completer `opts` avec les quelques
// champs de recette qui n\'ont AUCUN controle DOM correspondant
// (pilluleExperiences, photoForme, blocsCompetencesEncadres, cadrePage,
// enteteCentree, nomVertical -- purement decoratifs, jamais exposes dans
// le panneau), sans quoi ils resteraient undefined a chaque lecture.
// TACHE (retour utilisateur explicite : "je veux pouvoir tout modifier a
// l'interieur, deplacer des choses exactement comme dans un CV ordinaire
// -- la seule chose qui doit se passer au clic sur CV créatif c'est le
// style qui change, pas les possibilites de modifier") : avant cette
// correction, TOUS les champs de la recette (couleurs, colonnes, largeur,
// disposition, police...) etaient re-copies dans `opts` a CHAQUE lecture
// (donc a chaque _pdfRafraichir()), ecrasant systematiquement toute
// retouche manuelle faite sur les vrais controles juste apres le tirage.
// Devenu inutile depuis que le de, en mode Créatif, ne fait plus que
// rappeler _pdfAppliquerRecetteCreatifDOM (jamais un champ randomise au
// hasard, voir plus bas) : plus aucun risque de "cocktail" a s\'en
// premunir en forcant la lecture -- seuls les champs sans controle DOM
// (donc jamais modifiables a la main de toute facon) doivent encore etre
// forces ici.
'  if (document.getElementById("regCreatifActif").checked) {' +
'    opts.creatifActif = true;' +
'    var _creatifVar = _cvPdfCreatifVariante || "sidebarVague";' +
'    opts.creatifVariante = _creatifVar;' +
'    var _creatifRecette = _PDF_CREATIF_RECETTES[_creatifVar] || _PDF_CREATIF_RECETTES.sidebarVague;' +
'    Object.keys(_creatifRecette).forEach(function (champ) { if (!document.getElementById(_pdfIdControlePour(champ))) { opts[champ] = _creatifRecette[champ]; } });' +
'  }' +
'  return opts;' +
'}' +
// TACHE (extension Essentiel/Integral/A5) : bascule l'affichage des
// sections de reglages selon le format choisi -- certains reglages n'ont
// aucun sens hors A4 (colonnes 1/2, formes diagonales, bandeau
// competences cles/disponibilite, coins arrondis, Mise en page/echelle)
// ou hors A5 (fond des colonnes Mini CV, en-tete inversee A5). Jamais un
// 2e panneau distinct : un seul DOM, visibilite conditionnelle.
// TACHE (retour utilisateur : "le modèle A5 doit profiter de la richesse
// des autres modèles") : sectionA4SeulementStyle retiree de cette liste --
// styleTitres/styleBordures/lectureGuidee/couleurs de pastille viennent
// d'etre branches cote A5 (cvPdfTemplateA5.js) et styleCompetences/
// styleParties (soulignerPoste etc., meme section) y etaient DEJA lus
// sans jamais etre accessibles a l'ecran, controles invisibles pour rien.
// sectionA4SeulementStyle2 (Compétences clés/coins arrondis) RESTE
// masquee : aucun equivalent A5 pour ces 2 reglages (rubrique bandeau et
// rayon de colonnes n'existent pas dans ce format).
'var _PDF_SECTIONS_A4_SEULEMENT = ["sectionA4SeulementMiseEnPage", "sectionA4SeulementCouleurFin", "sectionA4SeulementFondColonnes", "sectionA4SeulementEnTete", "sectionA4SeulementStyle2", "sectionA4SeulementAjustement", "btnMiseEnPage", "sectionA4SeulementLettreJointe", "sectionA4SeulementFormatExperiences"];' +
'function _pdfAppliquerVisibiliteFormat() {' +
'  var format = document.getElementById("regFormatCV").value;' +
'  var estA5 = format.indexOf("A5") === 0;' +
'  _PDF_SECTIONS_A4_SEULEMENT.forEach(function (id) { document.getElementById(id).style.display = estA5 ? "none" : ""; });' +
'  document.getElementById("sectionA5Seulement").style.display = estA5 ? "" : "none";' +
// TACHE (retour utilisateur : "colonnes inversees/largeur colonne gauche/
// forme des colonnes n'ont rien a faire la en 1 colonne") : masques des
// que "Colonnes" passe a 1 -- appelee a chaque rafraichissement (deja le
// cas pour cette fonction), donc reagit immediatement au changement de
// #regColonnes comme au reste.
'  document.getElementById("sectionDeuxColonnesSeulement").style.display = (document.getElementById("regColonnes").value === "1") ? "none" : "";' +
'  document.getElementById("libelleMiseEnPage").textContent = (format === "A4-integral") ? "Mise en page (jusqu\'à 2 pages)" : "Mise en page (1 page)";' +
// TACHE (retour utilisateur : "parler des formats... qu'on puisse faire
// clic ici") : synchronise l'etat actif des raccourcis de format avec le
// VRAI select #regFormatCV -- appelee a chaque changement de format (deja
// le cas pour cette fonction), donc toujours a jour, y compris apres un
// tirage aleatoire ou un chargement de session (jamais desynchronisee).
'  Array.prototype.forEach.call(document.querySelectorAll(".bouton-format-pdf"), function (b) {' +
'    b.classList.toggle("bouton-format-pdf-active", b.getAttribute("data-format-raccourci") === format);' +
'  });' +
'}' +
// TACHE (extension Essentiel/Integral/A5) : construireDonneesPdfCV()
// acceptait deja `formatPage` mais recevait toujours "A4-detaille" en dur
// -- desormais le format vient du selecteur, et le rendu bascule vers le
// moteur A5 (cvPdfTemplateA5.js) des que composeurComposer() route vers
// composeurComposerA5Portrait() (formatPage 'A5-portrait'/'A5-paysage',
// voir composeurComposition.js) -- jamais une 2e logique de decision de
// contenu ecrite ici, uniquement le choix du moteur de RENDU.
'function _pdfRafraichir() {' +
// TACHE (retour utilisateur, bug reel confirme en testant : "je change de
// format et le message de mise en page reste affiche, perime") : le
// message reflete un etat PRECIS (taille de police calculee pour LE
// contenu/format d'alors) -- invalide des que quoi que ce soit change.
// Efface ICI, au tout debut, avant tout autre changement -- seul
// _pdfAjusterMiseEnPage() le re-remplit ensuite, apres son propre appel a
// _pdfRafraichir() (les appels intermediaires de sa boucle de reglage
// n'ecrivent jamais de message, rien a effacer en trop).
'  _pdfAfficherMessageMiseEnPage("");' +
'  _pdfAppliquerVisibiliteFormat();' +
// TACHE (retour utilisateur : "pastille, rectangle, texte") : la couleur
// de fond des puces n\'a aucun sens en style "texte" (aucun fond) --
// masquee dans ce cas uniquement, jamais supprimee (reapparait aussitot
// qu\'on repasse sur pastille/rectangle, valeur deja choisie conservee).
'  document.getElementById("sectionPastilleCouleurFond").style.display = (document.getElementById("regStyleCompetences").value === "texte") ? "none" : "";' +
'  var format = document.getElementById("regFormatCV").value;' +
'  var opts = _pdfLireOptions();' +
'  var donnees = window.parent.construireDonneesPdfCV(window.__cvPdfDossierSource, format, opts.bandeauDisponibilite, opts.regroupementActif);' +
'  var resultat;' +
'  if (format === "A5-portrait" || format === "A5-paysage") {' +
'    resultat = window.parent._pdfConstruireStyleEtPageA5(donnees.objetCV, donnees.composition, opts);' +
'  } else {' +
'    opts.competencesCles = donnees.competencesCles;' +
'    opts.competencesProfessionnelles = donnees.competencesProfessionnelles;' +
'    opts.competencesComportementales = donnees.competencesComportementales;' +
'    resultat = window.parent._pdfConstruireStyleEtPage(donnees.objetCV, donnees.composition, opts);' +
'  }' +
'  document.getElementById("styleCv").textContent = resultat.css;' +
'  document.getElementById("conteneurPage").innerHTML = resultat.pageHtml;' +
'  document.getElementById("stylePage").textContent = "@page { size: " + resultat.largeurPage + " " + resultat.hauteurPage + "; margin: 0; }";' +
'  document.getElementById("valeurEchelle").textContent = Math.round(_cvPdfEchelle * 11 * 10) / 10;' +
'  document.getElementById("regEchelle").value = Math.round(_cvPdfEchelle * 11 * 10) / 10;' +
'  document.getElementById("valeurEchelleA5").textContent = Math.round(_cvPdfEchelle * 11 * 10) / 10;' +
'  document.getElementById("regEchelleA5").value = Math.round(_cvPdfEchelle * 11 * 10) / 10;' +
// TACHE (largeur des colonnes ajustable) : resynchronise l'etiquette
// meme quand la valeur du curseur a ete changee PROGRAMMATIQUEMENT
// (Reinitialiser/style aleatoire, qui ne declenchent pas l'evenement
// "input" du curseur) -- meme convention que valeurEchelle ci-dessus.
'  document.getElementById("valeurLargeurColonnes").textContent = document.getElementById("regLargeurColonneGauche").value + "%";' +
'  document.getElementById("valeurLargeurAccroche").textContent = document.getElementById("regLargeurAccrocheLibre").value + "%";' +
'  document.getElementById("valeurLargeurMetier").textContent = document.getElementById("regLargeurMetierLibre").value + "%";' +
// TACHE (auto-ajustement du bandeau, voir _pdfAutoAjusterBandeauSiDebordement
// plus bas) : verifie/corrige AVANT de cabler les listeners de glisser-
// depose ci-dessous (inutile de les poser sur un DOM sur le point d\'etre
// remplace par le rafraichissement recursif) -- return immediat, le
// rafraichissement recursif se charge lui-meme de la suite (listeners,
// repositionnement barre d\'outils, persistance).' +
'  if (_pdfAutoAjusterBandeauSiDebordement()) { _pdfRafraichir(); return; }' +
// TACHE (glisser-deposer des rubriques) : #conteneurPage vient d\'etre
// entierement remplace (innerHTML ci-dessus, qui detache au passage tout
// listener pose sur l\'ancien contenu) -- reattache systematiquement a
// chaque rafraichissement, jamais une seule fois au chargement.
// TACHE (retour utilisateur : "dans le petit apercu, on ne doit pas etre
// en capacite de faire des modifications -- si quelqu'un fait une fausse
// manipulation, ca change l'ordre de tout... on ne doit voir QUE le
// modele genere -- Personnaliser, c'est la qu'on modifie reellement") :
// tout le cablage clic/glisser (reordonner les rubriques, deplacer/
// redimensionner l'en-tete, ouvrir la mini-barre flottante) reserve au
// grand apercu (window.__cvPdfModeGrandApercu, deja pose par
// ouvrirGrandApercuPdf()/ouvrirApercuPdfHtml() avant l\'ecriture de ce
// document) -- le petit apercu embarque redevient un apercu PUREMENT
// visuel, "Personnaliser" restant l\'unique porte vers l\'edition (deja le
// cas pour le panneau de reglages complet, desormais vrai aussi pour les
// interactions directement sur le contenu du CV).
// TACHE (mode edition de texte) : identifiants + reapplication des
// overrides de texte AVANT le cablage des interactions -- l'edition doit
// pouvoir cibler des elements qui portent deja le bon contenu edite,
// jamais le contenu "frais" genere depuis dossier/opts un instant avant
// de le remplacer sous les yeux de la personne (flash visuel).
'  _pdfAssignerIdentifiantsEdition();' +
'  _pdfReappliquerTextesEdites();' +
'  if (window.__cvPdfModeGrandApercu) {' +
'    if (_cvPdfModeEditionTexte) {' +
'      _pdfActiverEditionTexte();' +
'    } else {' +
'      _pdfActiverGlisserDeposer();' +
'      _pdfActiverGlisserEnTete();' +
'      _pdfActiverGlisserLibreEntete();' +
'      _pdfActiverRedimensionnementBlocLibre("data-poignee-accroche", "regLargeurAccrocheLibre", "valeurLargeurAccroche");' +
'      _pdfActiverRedimensionnementBlocLibre("data-poignee-metier", "regLargeurMetierLibre", "valeurLargeurMetier");' +
'      _pdfActiverRedimensionnementHauteurEntete();' +
'      _pdfActiverRedimensionnementLargeurColonnes();' +
'      _pdfActiverClicBandeaux();' +
'    }' +
'  }' +
// TACHE (agrandissement par rubrique) : l\'element cible de la barre
// flottante (s\'il y en a une ouverte) vient lui aussi d\'etre remplace --
// la repositionner sur le NOUVEL element (meme cle data-rubrique), ou la
// fermer si cette rubrique a disparu (changement de format par exemple).
'  _pdfRepositionnerBarreOutilsRubriqueApresRendu();' +
// TACHE (retour utilisateur : "garder en memoire la mise en forme PDF
// pour pouvoir revenir dessus") : ecriture SYSTEMATIQUE a chaque
// rafraichissement (pas de bouton dedie) -- dossier.pdfReglages est un
// simple objet plat JSON-serialisable, deja inclus automatiquement dans
// sauvegarderSession()/exporterSessionFichier() (js/app.js), aucune
// modification necessaire de ces fonctions.
'  _pdfPersisterReglages();' +
'}' +
// TACHE (retour utilisateur, bug reel confirme : "chevauchement de texte
// quand je passe de 3 colonnes a 2 colonnes en en-tete") : positionsEntete
// (_cvPdfPositionsEntete, deplacement manuel du bloc metier/accroche)
// prime TOUJOURS sur les positions par defaut de la disposition
// (_pdfStylePositionLibre, cvPdfTemplateA4.js) -- une position figee en 3
// colonnes chevauche donc le nouveau layout des qu\'on repasse en 2
// colonnes (ou l\'inverse). Le tirage aleatoire connaissait deja ce
// correctif (_pdfGenererStyleAleatoire vide _cvPdfPositionsEntete avant
// de tirer), mais jamais un changement MANUEL de disposition -- branche
// AVANT le listener generique juste en dessous (meme element, 2 listeners
// "change" : celui-ci reinitialise l\'etat, le generique rafraichit
// ensuite avec cet etat deja propre).
// TACHE (retour utilisateur, meme bug reel confirme sur une 2e capture :
// "la colonne de droite quand elle passe a gauche... la-haut il y a
// quelque chose que je ne suis pas") : le chevauchement ne vient pas
// SEULEMENT du changement de disposition 2/3 colonnes -- toute
// modification qui change le cote/la presence de la bande pleine hauteur
// (regFondColonnes, regFondColonnePleineHauteur, regColonnesInversees,
// regLargeurColonneGauche) invalide EXACTEMENT de la meme facon les
// positions figees dans _cvPdfPositionsEntete (le calcul "position de
// depart apres la bande", cvPdfTemplateA4.js ~1596-1603, n\'est utilise
// QUE si aucun override manuel n\'existe deja -- voir _pdfStylePositionLibre).
// Fonction commune, branchee sur tous ces controles.
'function _pdfReinitialiserPositionsEnteteSiStructureChange() {' +
'  _cvPdfPositionsEntete = {};' +
'  document.getElementById("regLargeurAccrocheLibre").value = "30";' +
'  document.getElementById("regLargeurMetierLibre").value = "32";' +
'  if (document.getElementById("valeurLargeurAccroche")) { document.getElementById("valeurLargeurAccroche").textContent = "30%"; }' +
'  if (document.getElementById("valeurLargeurMetier")) { document.getElementById("valeurLargeurMetier").textContent = "32%"; }' +
'}' +
'[' +
'  "regDispositionEntete", "regFondColonnes", "regFondColonnePleineHauteur", "regColonnesInversees", "regLargeurColonneGauche"' +
'].forEach(function (id) {' +
'  var el = document.getElementById(id);' +
'  if (el) { el.addEventListener("change", _pdfReinitialiserPositionsEnteteSiStructureChange); }' +
'});' +
'Array.prototype.forEach.call(document.querySelectorAll(".panneau-reglages select, .panneau-reglages input"), function (el) {' +
'  el.addEventListener("change", _pdfRafraichir);' +
'});' +
// TACHE (glisser-deposer des rubriques) : HTML5 drag-and-drop natif, sans
// librairie (coherent avec le reste du module -- l\'appli n\'a pas de
// serveur pour en servir une). N\'existe que sur les blocs `.groupe-rubrique`
// (A4 uniquement -- l\'A5 ne produit aucun element de cette classe, la
// requete ci-dessous renvoie alors simplement une liste vide, sans erreur).
// _pdfTrouverReferenceDepot() determine, a partir de la position verticale
// du curseur, DEVANT quel bloc existant inserer (ou fin de colonne si
// aucun) -- meme algorithme qu\'une liste triable classique, jamais un
// calcul de collision plus complique.
'function _pdfTrouverReferenceDepot(colonneEl, y) {' +
'  var items = Array.prototype.filter.call(colonneEl.children, function (el) {' +
'    return el.classList.contains("groupe-rubrique") && el !== _cvPdfElementGlisse;' +
'  });' +
'  for (var i = 0; i < items.length; i++) {' +
'    var rect = items[i].getBoundingClientRect();' +
'    if (y < rect.top + rect.height / 2) { return items[i]; }' +
'  }' +
'  return null;' +
'}' +
'function _pdfNettoyerIndicateursDepot() {' +
'  Array.prototype.forEach.call(document.querySelectorAll("#conteneurPage .zone-depot-active"), function (el) { el.classList.remove("zone-depot-active"); });' +
'  Array.prototype.forEach.call(document.querySelectorAll("#conteneurPage .indicateur-depot-avant, #conteneurPage .indicateur-depot-apres"), function (el) {' +
'    el.classList.remove("indicateur-depot-avant", "indicateur-depot-apres");' +
'  });' +
'}' +
// TACHE (glisser-deposer des rubriques) : relit l\'ordre REEL du DOM apres
// une insertion optimiste (colonne.insertBefore() dans le gestionnaire de
// "drop" ci-dessous) -- source de verite unique, jamais une reconstruction
// manuelle paralleles des 2 tableaux qui pourrait diverger du DOM affiche.
'function _pdfCalculerOrdreColonnes() {' +
// TACHE (retour utilisateur : "les mêmes options que l'A4 sur le Mini CV
// A5" -- glisser-deposer des rubriques) : .colonne-a5 (cvPdfTemplateA5.js)
// ajoute ici EN PLUS de .colonne (A4) -- meme fonction reutilisee pour
// les 2 formats, jamais une 2e copie ecrite pour l'A5 (un seul format
// rendu a la fois dans #conteneurPage, aucun risque de melanger les 2).
'  var cols = document.querySelectorAll("#conteneurPage .colonne, #conteneurPage .colonne-a5");' +
'  function lireCles(col) {' +
'    return col ? Array.prototype.filter.call(col.children, function (el) { return el.classList.contains("groupe-rubrique"); })' +
'      .map(function (el) { return el.getAttribute("data-rubrique"); }) : [];' +
'  }' +
'  return { gauche: lireCles(cols[0]), droite: lireCles(cols[1]) };' +
'}' +
// TACHE (retour utilisateur : "cliquer sur le bandeau coordonnees pour
// choisir pastille/rectangle/texte + couleurs") : ce bandeau n\'est PAS
// un .groupe-rubrique (pas glissable, pleine largeur, hors colonnes) --
// wiring de clic dedie, meme mini-barre flottante que le reste
// (_pdfAfficherBarreOutilsRubrique), jamais une 2e UI. Competences/
// competencesComportementales restent couvertes par _pdfActiverGlisserDeposer
// ci-dessous (ce sont de vraies .groupe-rubrique).
// TACHE (retour utilisateur : "pouvoir modifier le texte directement,
// recuperer la police/taille/style tel qu'il est actuellement, dans la
// continuite du mot ou de la phrase") : identifie chaque element de texte
// EDITABLE (titre de rubrique, ligne d'item, mission, pastille de
// competence, blocs d'en-tete...) avec un id STABLE d'un rafraichissement
// a l'autre -- base sur sa POSITION dans sa rubrique/son bloc d'en-tete
// (data-rubrique/data-entete-bloc, deja poses par cvPdfTemplateA4.js),
// jamais un identifiant invente cote generateur (aucune modification de
// cvPdfTemplateA4.js necessaire -- entierement post-traite ici, cote
// iframe, generique a TOUTE rubrique presente ou future). Les elements
// imbriques (ex. un span de mise en forme a l'interieur d'un .item) sont
// exclus via la verification "ne contient aucun autre element editable" --
// seul le PLUS PETIT element pertinent recoit l'id, jamais un ancetre et
// son enfant tous les deux (double edition confuse sinon).
// TACHE (retour utilisateur : "je ne peux pas modifier le titre d'une
// formation/experience des qu'il y a des missions -- incoherent") : bug
// reel confirme -- .titre-item-avec-detail (cvPdfTemplateA4.js, sur les
// formations/experiences/experience personnelle qui bundlent titre+missions
// dans le meme .item) ajoutee ici, pour que le titre garde SON PROPRE id
// d'edition au lieu de dependre du .item englobant (disqualifie des qu'il
// contient une .ligne-mission, regle "seul le plus petit element compte"
// juste en dessous).
'var _PDF_SELECTEUR_EDITABLE = "h1, h2, .item, .ligne-mission, .puce-competence, .texte-competences, .metier-vise, .accroche-entete, .texte-profil, .entreprise-experience, .poste-experience, .periode-experience, .titre-item-avec-detail";' +
'function _pdfAssignerIdentifiantsEdition() {' +
'  Array.prototype.forEach.call(document.querySelectorAll("#conteneurPage [data-rubrique], #conteneurPage [data-entete-bloc]"), function (groupe) {' +
'    var cle = groupe.getAttribute("data-rubrique") || groupe.getAttribute("data-entete-bloc");' +
'    var compteurs = {};' +
'    Array.prototype.forEach.call(groupe.querySelectorAll(_PDF_SELECTEUR_EDITABLE), function (el) {' +
'      if (el.closest("[data-edit-id]") && el.closest("[data-edit-id]") !== el) { return; }' +
'      if (el.querySelector(_PDF_SELECTEUR_EDITABLE)) { return; }' +
'      var type = el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(" ")[0] : "");' +
'      compteurs[type] = (compteurs[type] || 0) + 1;' +
'      el.setAttribute("data-edit-id", cle + "__" + type + "__" + compteurs[type]);' +
'    });' +
'  });' +
'}' +
// TACHE (meme retour utilisateur) : reapplique le HTML edite par la
// personne par-dessus le rendu FRAIS (toujours regenere depuis
// dossier/opts a chaque reglage touche, meme quand ce reglage n'a rien a
// voir avec le texte) -- ces overrides sont une couche de PRESENTATION
// par-dessus la source de verite, jamais une 2e copie du contenu qui
// pourrait diverger. Element introuvable (rubrique retiree entre-temps,
// changement de format...) : override silencieusement ignore, jamais
// d'erreur ni de resurrection d'un bloc disparu.
'function _pdfReappliquerTextesEdites() {' +
'  Object.keys(_cvPdfTextesEdites).forEach(function (id) {' +
'    var el = document.querySelector(\'#conteneurPage [data-edit-id="\' + id + \'"]\');' +
'    if (el) { el.innerHTML = _cvPdfTextesEdites[id]; }' +
'  });' +
'}' +
// TACHE (mode edition de texte) : SEUL cablage actif sur #conteneurPage
// quand _cvPdfModeEditionTexte est vrai (voir _pdfRafraichir(), qui ne
// branche alors plus jamais _pdfActiverGlisserDeposer/_pdfActiverClicBandeaux/
// etc. -- 2 modes mutuellement exclusifs, jamais les 2 cables en meme
// temps). contenteditable pose au clic (jamais en permanence -- clic
// EN DEHORS pour valider/fermer, voir le listener "blur"), retire au blur.
// input (pas juste blur) : capture a CHAQUE frappe, simple ecriture
// d'objet sans re-rendu -- jamais de perte si la personne ferme le mode
// ou l'onglet sans avoir quitte le champ au clavier (Echap, clic sur le
// bouton editer...).
'function _pdfActiverEditionTexte() {' +
// TACHE (retour utilisateur : "on n'a plus la possibilite de bouger les
// rectangles") : draggable="false" en plus de ne pas cabler dragstart/drop
// (voir _pdfRafraichir()) -- sans ca, le navigateur affiche quand meme une
// image fantome au survol/glisser (aucun deplacement reel ne se produit,
// mais visuellement trompeur). Purement cosmetique -- retire au prochain
// rafraichissement hors mode edition (regenere depuis zero par
// _pdfEnvelopperRubriqueDrag, cvPdfTemplateA4.js, jamais modifie ici de
// facon permanente).' +
'  Array.prototype.forEach.call(document.querySelectorAll("#conteneurPage .groupe-rubrique"), function (bloc) { bloc.setAttribute("draggable", "false"); });' +
'  Array.prototype.forEach.call(document.querySelectorAll("#conteneurPage [data-edit-id]"), function (el) {' +
'    el.addEventListener("click", function (evt) {' +
'      evt.stopPropagation();' +
'      if (el.getAttribute("contenteditable") === "true") { return; }' +
'      el.setAttribute("contenteditable", "true");' +
'      el.focus();' +
'      _pdfAfficherBarreFormatTexte(el);' +
'    });' +
'    el.addEventListener("input", function () {' +
'      _cvPdfTextesEdites[el.getAttribute("data-edit-id")] = el.innerHTML;' +
'    });' +
'    el.addEventListener("blur", function () {' +
'      _cvPdfTextesEdites[el.getAttribute("data-edit-id")] = el.innerHTML;' +
'      el.removeAttribute("contenteditable");' +
'      _pdfFermerBarreFormatTexte();' +
'    });' +
'  });' +
'}' +
// TACHE (retour utilisateur : "quelques options simples -- style
// d'ecriture italique ou pas, des choses comme ca") : gras/italique
// via document.execCommand (encore largement supporte par tous les
// moteurs de rendu utilises ici, simplicite avant tout pour ce besoin
// ponctuel -- jamais une librairie d'edition riche pour 2 boutons).
// mousedown + preventDefault (jamais "click") : empeche le navigateur de
// deplacer le focus sur le bouton AVANT l\'execution de la commande, ce
// qui perdrait la selection de texte en cours dans le champ edite.
'function _pdfAfficherBarreFormatTexte(el) {' +
'  var barre = document.getElementById("barreFormatTexte");' +
'  var rect = el.getBoundingClientRect();' +
'  barre.style.display = "flex";' +
'  barre.style.top = Math.max(8, rect.top - 40) + "px";' +
'  barre.style.left = rect.left + "px";' +
'}' +
'function _pdfFermerBarreFormatTexte() {' +
'  var barre = document.getElementById("barreFormatTexte");' +
'  if (barre) { barre.style.display = "none"; }' +
'}' +
'Array.prototype.forEach.call(document.querySelectorAll("#barreFormatTexte button[data-cmd]"), function (btn) {' +
'  btn.addEventListener("mousedown", function (evt) {' +
'    evt.preventDefault();' +
'    document.execCommand(btn.getAttribute("data-cmd"));' +
'  });' +
'});' +
// TACHE (retour utilisateur : "on n'a plus la possibilite de bouger les
// rectangles... on vient avec la souris, on fait clic et on peut ecrire")
// : bascule le mode -- _pdfRafraichir() lit _cvPdfModeEditionTexte a
// chaque appel pour choisir quel cablage brancher (voir plus haut),
// jamais besoin de decabler/recabler manuellement ici, un simple
// rafraichissement suffit. Ferme aussi la mini-barre par rubrique
// (n\'a plus de sens pendant l\'edition de texte, les 2 UI ne cohabitent
// jamais) et la barre de mise en forme (plus rien a mettre en forme des
// que le mode se referme).
'document.getElementById("btnEditionTextePdf").addEventListener("click", function () {' +
'  _cvPdfModeEditionTexte = !_cvPdfModeEditionTexte;' +
'  document.getElementById("btnEditionTextePdf").classList.toggle("actif", _cvPdfModeEditionTexte);' +
'  document.body.classList.toggle("mode-edition-texte", _cvPdfModeEditionTexte);' +
'  _pdfFermerBarreOutilsRubrique();' +
'  _pdfFermerBarreFormatTexte();' +
'  _pdfRafraichir();' +
'});' +
'function _pdfActiverClicBandeaux() {' +
'  Array.prototype.forEach.call(document.querySelectorAll("#conteneurPage .bandeau-cliquable[data-rubrique]"), function (bloc) {' +
'    bloc.addEventListener("click", function (evt) {' +
'      evt.stopPropagation();' +
'      _pdfAfficherBarreOutilsRubrique(bloc.getAttribute("data-rubrique"), bloc);' +
'    });' +
'  });' +
'}' +
'function _pdfActiverGlisserDeposer() {' +
'  Array.prototype.forEach.call(document.querySelectorAll("#conteneurPage .groupe-rubrique"), function (bloc) {' +
'    bloc.addEventListener("dragstart", function (evt) {' +
'      _cvPdfElementGlisse = bloc;' +
'      bloc.classList.add("en-glissement");' +
'      evt.dataTransfer.effectAllowed = "move";' +
'      evt.dataTransfer.setData("text/plain", bloc.getAttribute("data-rubrique") || "");' +
'    });' +
'    bloc.addEventListener("dragend", function () {' +
'      bloc.classList.remove("en-glissement");' +
'      _cvPdfElementGlisse = null;' +
'      _pdfNettoyerIndicateursDepot();' +
'    });' +
// TACHE (agrandissement par rubrique) : un clic SANS glissement (aucun
// dragstart n\'a eu lieu entre-temps) ouvre la mini-barre flottante pour
// CE bloc -- coexiste sans conflit avec le glisser-depose ci-dessus (un
// clic simple ne declenche jamais dragstart, un vrai glissement ne
// declenche jamais cet evenement "click").
'    bloc.addEventListener("click", function (evt) {' +
'      evt.stopPropagation();' +
'      _pdfAfficherBarreOutilsRubrique(bloc.getAttribute("data-rubrique"), bloc);' +
'    });' +
'  });' +
// TACHE (meme retour utilisateur -- glisser-deposer sur le Mini CV A5) :
// .colonne-a5 ajoute ici EN PLUS de .colonne, meme raison qu'a
// _pdfCalculerOrdreColonnes() juste au-dessus.
'  Array.prototype.forEach.call(document.querySelectorAll("#conteneurPage .colonne, #conteneurPage .colonne-a5"), function (colonne) {' +
'    colonne.addEventListener("dragover", function (evt) {' +
'      if (!_cvPdfElementGlisse) { return; }' +
'      evt.preventDefault();' +
'      _pdfNettoyerIndicateursDepot();' +
'      colonne.classList.add("zone-depot-active");' +
'      var reference = _pdfTrouverReferenceDepot(colonne, evt.clientY);' +
'      if (reference) {' +
'        reference.classList.add("indicateur-depot-avant");' +
'      } else {' +
'        var derniers = Array.prototype.filter.call(colonne.children, function (el) { return el.classList.contains("groupe-rubrique") && el !== _cvPdfElementGlisse; });' +
'        if (derniers.length) { derniers[derniers.length - 1].classList.add("indicateur-depot-apres"); }' +
'      }' +
'    });' +
'    colonne.addEventListener("drop", function (evt) {' +
'      if (!_cvPdfElementGlisse) { return; }' +
'      evt.preventDefault();' +
'      var reference = _pdfTrouverReferenceDepot(colonne, evt.clientY);' +
'      colonne.insertBefore(_cvPdfElementGlisse, reference);' +
'      _pdfNettoyerIndicateursDepot();' +
'      _cvPdfOrdrePersonnalise = _pdfCalculerOrdreColonnes();' +
'      _cvPdfElementGlisse = null;' +
'      _pdfRafraichir();' +
'    });' +
'  });' +
'}' +
// TACHE (retour utilisateur, bug reel confirme : "quand je decoche
// Position libre, les rubriques sont empilees a gauche") : la
// permutation nom/metier par glisser-depose est retiree (n'avait de sens
// que dans l'ancienne disposition empilee, jamais dans la disposition 3
// colonnes desormais fixe par defaut -- voir cvPdfTemplateA4.js). Seul un
// clic SANS mouvement ouvre encore la mini-barre flottante d'options
// (taille/police/couleur) pour ces blocs -- meme seuil de 3px que
// _pdfActiverGlisserLibreEntete plus bas pour distinguer un clic d'un
// debut de selection de texte a la souris.
'function _pdfActiverGlisserEnTete() {' +
// TACHE (retour utilisateur : "position libre") : les blocs ".bloc-libre"
// (mode position libre actif) ont leur PROPRE gestion de glisser + clic
// (voir _pdfActiverGlisserLibreEntete plus bas) -- exclus ici pour ne
// jamais cabler 2 mecanismes concurrents sur le meme element.
'  Array.prototype.forEach.call(document.querySelectorAll("#conteneurPage .entete-bloc-texte:not(.bloc-libre)"), function (bloc) {' +
'    bloc.addEventListener("mousedown", function (evtDown) {' +
// TACHE (retour utilisateur, bug reel confirme : "clic droit, j'ai le
// menu Windows ET notre panneau qui apparait derriere") : le clic droit
// (button=2) declenche aussi "mousedown"/"mouseup" -- sans ce garde-fou,
// aBouge restait false (aucun mouvement entre les 2, meme sequence qu'un
// clic gauche simple) et ouvrait donc AUSSI la mini-barre flottante, en
// plus du menu contextuel natif du systeme.
'      if (evtDown.button !== 0) { return; }' +
'      evtDown.preventDefault();' +
'      evtDown.stopPropagation();' +
'      var startX = evtDown.clientX, startY = evtDown.clientY;' +
'      var aBouge = false;' +
'      function onMove(evtMove) {' +
'        var dx = evtMove.clientX - startX, dy = evtMove.clientY - startY;' +
'        if (!aBouge && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) { aBouge = true; }' +
'      }' +
'      function onUp() {' +
'        document.removeEventListener("mousemove", onMove);' +
'        document.removeEventListener("mouseup", onUp);' +
'        if (!aBouge) {' +
'          var cleRubrique = bloc.getAttribute("data-rubrique");' +
'          if (cleRubrique) { _pdfAfficherBarreOutilsRubrique(cleRubrique, bloc); }' +
'        }' +
'      }' +
'      document.addEventListener("mousemove", onMove);' +
'      document.addEventListener("mouseup", onUp);' +
'    });' +
// TACHE (retour utilisateur, bug reel confirme : "je peux les bouger, mais
// je n\'ai pas les options") : le "click" natif du navigateur se declenche
// TOUJOURS apres mousedown+mouseup sur le meme element (evenement A PART,
// jamais empeche par le stopPropagation() pose sur mousedown ci-dessus) --
// il remontait donc jusqu\'au listener document-level qui ferme la
// mini-barre des qu\'un clic a lieu EN DEHORS d\'elle (voir plus bas, pres
// de _pdfFermerBarreOutilsRubrique), la refermant AUSSITOT apres l\'avoir
// ouverte dans onUp() ci-dessus. Meme garde-fou que .groupe-rubrique/
// .bandeau-cliquable (qui l\'avaient deja, jamais soumis a ce bug).
'    bloc.addEventListener("click", function (evt) { evt.stopPropagation(); });' +
'  });' +
'}' +
// TACHE (retour utilisateur : "l'ideal... que mon nom, le texte de
// profil et le metier puissent etre en libre, sur les axes x/y... si ca
// depasse, le cadre devient rouge") : glisser-depose SOURIS continu
// (mousedown/mousemove/mouseup, pas le drag HTML5 utilise pour
// l\'echange d\'ordre empile/cote-a-cote) -- position stockee en % de
// .entete-libre (_cvPdfPositionsEntete), robuste a un changement de
// taille de page. Un clic SANS deplacement (aBouge=false) ouvre quand
// meme la mini-barre flottante (taille/police) -- meme UX que le mode
// empile, juste sans le glisser-depose HTML5 concurrent.
'function _pdfVerifierDebordementBlocLibre(bloc, entete) {' +
'  var br = bloc.getBoundingClientRect();' +
'  var er = entete.getBoundingClientRect();' +
'  var deborde = br.left < er.left - 0.5 || br.top < er.top - 0.5 || br.right > er.right + 0.5 || br.bottom > er.bottom + 0.5;' +
'  bloc.classList.toggle("hors-cadre", deborde);' +
'}' +
// TACHE (retour utilisateur, bug reel confirme : "le texte a depasse le
// bandeau autorise... le code doit ajuster la taille du texte pour que ca
// rentre") : contrairement au reste de l\'en-tete (voir commentaire plus
// haut : "le texte ne deborde jamais horizontalement, il retombe sur
// plusieurs lignes"), un texte metier/accroche TRES long peut retomber
// sur assez de lignes pour depasser VERTICALEMENT (ou HORIZONTALEMENT si
// deplace pres du bord) le cadre de l\'en-tete -- jamais corrige
// auparavant, seul un cadre rouge (hors-cadre) le signalait. Reutilise
// l\'echelle locale PAR RUBRIQUE deja existante (_cvPdfEchellesRubriques,
// meme mecanisme que la mini-barre flottante manuelle) plutot qu\'une 2e
// notion de taille. Ne regarde QUE bottom/right (jamais top/left) : un
// deplacement manuel qui sort par le haut/la gauche est un choix de
// POSITION de la personne (deja signale par le cadre rouge), jamais un
// probleme de taille de texte a corriger tout seul a sa place.
'var _PDF_ECHELLE_LOCALE_MIN_AUTOFIT = 0.7;' +
// TACHE (retour utilisateur, bug reel confirme sur un PDF reellement
// telecharge : le metier vise, replie sur 3 lignes -- largeur de bloc
// etroite, texte plus long que prevu -- chevauchait le paragraphe
// d'accroche juste a cote, alors qu'AUCUN des deux blocs ne depassait le
// cadre de l'en-tete lui-meme) : le seul controle precedent (bottom/right
// vs le cadre .entete-libre) etait aveugle a CE cas -- metier et accroche
// sont 2 blocs positionnes INDEPENDAMMENT (position:absolute, jamais un
// flux CSS qui les empilerait proprement tout seul), aucun des deux ne
// "sait" ou s'arrete l'autre. Detecte donc EN PLUS un chevauchement
// reel entre les 2 rectangles (intersection non vide), qui peut survenir
// meme quand chacun reste, pris isolement, dans les limites du cadre.
'function _pdfRectanglesSeChevauchent(a, b) {' +
'  return !(a.right <= b.left + 0.5 || a.left >= b.right - 0.5 || a.bottom <= b.top + 0.5 || a.top >= b.bottom - 0.5);' +
'}' +
// Un seul ajustement (d\'un seul bloc) par appel -- volontaire : la
// recursion deja en place dans _pdfRafraichir() (voir plus bas, "if
// (_pdfAutoAjusterBandeauSiDebordement()) { _pdfRafraichir(); return; }")
// re-mesure entierement apres CHAQUE changement, jamais sur des rectangles
// perimes -- essaie toujours "metier" en premier (le plus souvent
// responsable : titre court en apparence mais qui replie sur plusieurs
// lignes des qu'il est repositionne/retreci), "accroche" seulement si
// metier est deja au plancher et que le probleme persiste malgre tout.
// TACHE (meme retour utilisateur, cas plus rare mais rencontre en testant
// -- "nom" chevauchant occasionnellement "metier") : le nom (x fixe a
// gauche, jamais deplace automatiquement -- voir positionsLibresDefaut)
// n\'est jamais retreci ici (une personne ne veut jamais voir SON PROPRE
// nom rapetisser tout seul), mais un chevauchement AVEC lui declenche
// quand meme un retrecissement de metier/accroche -- c\'est generalement
// leur boite, pas celle du nom, qui s\'est etendue jusqu\'a le toucher.
'function _pdfAutoAjusterBandeauSiDebordement() {' +
'  var entete = document.querySelector("#conteneurPage .entete-libre");' +
'  if (!entete) { return false; }' +
'  var er = entete.getBoundingClientRect();' +
'  var blocNom = document.querySelector("#conteneurPage .entete-libre .bloc-libre[data-entete-bloc=\\"nom\\"]");' +
'  var blocMetier = document.querySelector("#conteneurPage .entete-libre .bloc-libre[data-entete-bloc=\\"metier\\"]");' +
'  var blocAccroche = document.querySelector("#conteneurPage .entete-libre .bloc-libre[data-entete-bloc=\\"accroche\\"]");' +
// TACHE (point 19) : coordonnees, comme nom, n'est jamais retreci ici
// (candidats plus bas reste limite a metier/accroche) mais un
// chevauchement AVEC lui doit quand meme declencher un retrecissement --
// meme raisonnement exact que pour nom (voir le commentaire du haut de
// cette fonction).
'  var blocCoordonnees = document.querySelector("#conteneurPage .entete-libre .bloc-libre[data-entete-bloc=\\"coordonnees\\"]");' +
'  function seChevauchentSiPresents(a, b) { return (a && b) ? _pdfRectanglesSeChevauchent(a.getBoundingClientRect(), b.getBoundingClientRect()) : false; }' +
'  var chevauchement = seChevauchentSiPresents(blocMetier, blocAccroche) || seChevauchentSiPresents(blocNom, blocMetier) || seChevauchentSiPresents(blocNom, blocAccroche) ||' +
'    seChevauchentSiPresents(blocCoordonnees, blocMetier) || seChevauchentSiPresents(blocCoordonnees, blocAccroche) || seChevauchentSiPresents(blocNom, blocCoordonnees);' +
'  var candidats = [["metier", blocMetier], ["accroche", blocAccroche]];' +
'  for (var i = 0; i < candidats.length; i++) {' +
'    var cle = candidats[i][0];' +
'    var bloc = candidats[i][1];' +
'    if (!bloc) { continue; }' +
'    var br = bloc.getBoundingClientRect();' +
'    var deborde = br.bottom > er.bottom + 0.5 || br.right > er.right + 0.5;' +
'    if (!deborde && !chevauchement) { continue; }' +
'    var cleEchelle = "entete-" + cle;' +
'    var actuelle = _cvPdfEchellesRubriques[cleEchelle] || 1;' +
'    if (actuelle <= _PDF_ECHELLE_LOCALE_MIN_AUTOFIT) { continue; }' +
'    _cvPdfEchellesRubriques[cleEchelle] = Math.max(_PDF_ECHELLE_LOCALE_MIN_AUTOFIT, Math.round((actuelle - 0.05) * 100) / 100);' +
'    return true;' +
'  }' +
'  return false;' +
'}' +
'function _pdfActiverGlisserLibreEntete() {' +
'  var entete = document.querySelector("#conteneurPage .entete-libre");' +
'  if (!entete) { return; }' +
'  Array.prototype.forEach.call(document.querySelectorAll("#conteneurPage .entete-libre .bloc-libre"), function (bloc) {' +
'    _pdfVerifierDebordementBlocLibre(bloc, entete);' +
'    bloc.addEventListener("mousedown", function (evtDown) {' +
// TACHE (retour utilisateur, meme bug que _pdfActiverGlisserEnTete
// ci-dessus : "clic droit, j'ai le menu Windows ET notre panneau
// derriere") : le clic droit n'a jamais rien a faire ici non plus.
'      if (evtDown.button !== 0) { return; }' +
'      evtDown.preventDefault();' +
'      evtDown.stopPropagation();' +
'      var enteteRect = entete.getBoundingClientRect();' +
'      var blocRect = bloc.getBoundingClientRect();' +
'      var startX = evtDown.clientX, startY = evtDown.clientY;' +
'      var startLeftPct = ((blocRect.left - enteteRect.left) / enteteRect.width) * 100;' +
'      var startTopPct = ((blocRect.top - enteteRect.top) / enteteRect.height) * 100;' +
'      var aBouge = false;' +
'      function onMove(evtMove) {' +
'        var dx = evtMove.clientX - startX, dy = evtMove.clientY - startY;' +
'        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) { aBouge = true; }' +
'        bloc.style.left = (startLeftPct + (dx / enteteRect.width) * 100) + "%";' +
'        bloc.style.top = (startTopPct + (dy / enteteRect.height) * 100) + "%";' +
'        _pdfVerifierDebordementBlocLibre(bloc, entete);' +
'      }' +
'      function onUp() {' +
'        document.removeEventListener("mousemove", onMove);' +
'        document.removeEventListener("mouseup", onUp);' +
'        if (aBouge) {' +
'          var cle = bloc.getAttribute("data-entete-bloc");' +
'          var enteteRectFinale = entete.getBoundingClientRect();' +
'          var blocRectFinal = bloc.getBoundingClientRect();' +
'          _cvPdfPositionsEntete[cle] = {' +
'            x: Math.round(((blocRectFinal.left - enteteRectFinale.left) / enteteRectFinale.width) * 1000) / 10,' +
'            y: Math.round(((blocRectFinal.top - enteteRectFinale.top) / enteteRectFinale.height) * 1000) / 10' +
'          };' +
'          _pdfRafraichir();' +
'        } else {' +
'          var cleRubrique = bloc.getAttribute("data-rubrique");' +
'          if (cleRubrique) { _pdfAfficherBarreOutilsRubrique(cleRubrique, bloc); }' +
'        }' +
'      }' +
'      document.addEventListener("mousemove", onMove);' +
'      document.addEventListener("mouseup", onUp);' +
'    });' +
// TACHE (retour utilisateur, meme bug que _pdfActiverGlisserEnTete
// ci-dessus : le "click" natif qui suit mousedown+mouseup remonte jusqu'au
// listener document-level de fermeture -- meme garde-fou.
'    bloc.addEventListener("click", function (evt) { evt.stopPropagation(); });' +
'  });' +
'}' +
// TACHE (retour utilisateur : "je puisse avec la souris modifier la
// taille de ce rectangle... le retrecir, l'agrandir -- le texte a
// l'interieur doit s'adapter") : poignee dediee (data-poignee-accroche,
// bord droit du rectangle, voir cvPdfTemplateA4.js) -- glisser-depose
// souris independant de celui du bloc parent (deplacement). Manipule le
// style DIRECTEMENT pendant le glisser (jamais _pdfRafraichir() a chaque
// mousemove -- trop lourd, et re-ouvrirait le meme bug de tremblement
// que la mini-barre flottante, voir _pdfAfficherBarreOutilsRubrique) :
// le reflow du texte (largeur du conteneur -> retour a la ligne) se fait
// deja tout seul, purement CSS. Un seul _pdfRafraichir() au relachement,
// pour persister la valeur (regLargeurAccrocheLibre) et resynchroniser
// le reste (curseur, etiquette %, mini-barre si ouverte).
// TACHE (retour utilisateur : "je veux la meme possibilite pour le
// titre [metier vise]") : generalisee (attribut de la poignee cible +
// id du curseur/etiquette a resynchroniser) pour servir a la fois
// l'accroche et le metier -- memes min/max que le curseur DEDIE lui-meme
// (lus directement sur l'element input, jamais une 2e paire de bornes en
// dur qui risquerait de diverger de regLargeurAccrocheLibre/
// regLargeurMetierLibre).
'function _pdfActiverRedimensionnementBlocLibre(attributPoignee, idSlider, idLabel) {' +
'  var poignee = document.querySelector("#conteneurPage [" + attributPoignee + "]");' +
'  if (!poignee) { return; }' +
'  var bloc = poignee.closest(".bloc-libre");' +
'  var entete = document.querySelector("#conteneurPage .entete-libre");' +
'  var slider = document.getElementById(idSlider);' +
'  if (!bloc || !entete || !slider) { return; }' +
'  var largeurMin = parseInt(slider.min, 10) || 20;' +
'  var largeurMax = parseInt(slider.max, 10) || 90;' +
'  poignee.addEventListener("mousedown", function (evtDown) {' +
'    if (evtDown.button !== 0) { return; }' +
'    evtDown.preventDefault();' +
'    evtDown.stopPropagation();' +
'    var enteteRect = entete.getBoundingClientRect();' +
'    var blocRectDepart = bloc.getBoundingClientRect();' +
'    var startX = evtDown.clientX;' +
'    var largeurDepartPct = (blocRectDepart.width / enteteRect.width) * 100;' +
'    function onMove(evtMove) {' +
'      var dx = evtMove.clientX - startX;' +
'      var largeur = Math.round(largeurDepartPct + (dx / enteteRect.width) * 100);' +
'      largeur = Math.min(largeurMax, Math.max(largeurMin, largeur));' +
'      bloc.style.width = largeur + "%";' +
'      bloc.style.maxWidth = largeur + "%";' +
'      slider.value = largeur;' +
'      document.getElementById(idLabel).textContent = largeur + "%";' +
'      _pdfVerifierDebordementBlocLibre(bloc, entete);' +
'    }' +
'    function onUp() {' +
'      document.removeEventListener("mousemove", onMove);' +
'      document.removeEventListener("mouseup", onUp);' +
'      _pdfRafraichir();' +
'    }' +
'    document.addEventListener("mousemove", onMove);' +
'    document.addEventListener("mouseup", onUp);' +
'  });' +
'  poignee.addEventListener("click", function (evt) { evt.stopPropagation(); });' +
'}' +
// TACHE (point 19, retour utilisateur : "rendre la hauteur de la zone
// d'en-tete redimensionnable a la souris") : meme mecanisme EXACT que
// _pdfActiverRedimensionnementBlocLibre juste au-dessus (poignee dediee,
// glisser-depose souris, valeur live pendant le drag, persistee au
// relachement) -- ici sur la hauteur de .entete-libre elle-meme plutot que
// la largeur d\'un bloc. Bornes en px (jamais % : la hauteur ne depend pas
// de la largeur de page comme les largeurs de blocs) choisies pour rester
// coherentes avec le defaut de 210px (cvPdfTemplateA4.js) et la hauteur
// totale d\'une page A4 (HAUTEUR_CIBLE_PX, ~1122px) -- jamais un en-tete
// plus petit qu\'un nom+coordonnees lisibles, ni plus grand qu\'une bonne
// moitie de page.
'function _pdfActiverRedimensionnementHauteurEntete() {' +
'  var poignee = document.querySelector("#conteneurPage [data-poignee-hauteur-entete]");' +
'  var entete = document.querySelector("#conteneurPage .entete-libre");' +
'  if (!poignee || !entete) { return; }' +
'  var hauteurMin = 120, hauteurMax = 450;' +
'  poignee.addEventListener("mousedown", function (evtDown) {' +
'    if (evtDown.button !== 0) { return; }' +
'    evtDown.preventDefault();' +
'    evtDown.stopPropagation();' +
'    var hauteurDepart = entete.getBoundingClientRect().height;' +
'    var startY = evtDown.clientY;' +
'    function onMove(evtMove) {' +
'      var dy = evtMove.clientY - startY;' +
'      var hauteur = Math.round(Math.min(hauteurMax, Math.max(hauteurMin, hauteurDepart + dy)));' +
'      entete.style.minHeight = hauteur + "px";' +
'    }' +
'    function onUp() {' +
'      document.removeEventListener("mousemove", onMove);' +
'      document.removeEventListener("mouseup", onUp);' +
'      _cvPdfHauteurEntete = parseInt(entete.style.minHeight, 10) || null;' +
'      _pdfRafraichir();' +
'    }' +
'    document.addEventListener("mousemove", onMove);' +
'    document.addEventListener("mouseup", onUp);' +
'  });' +
'  poignee.addEventListener("click", function (evt) { evt.stopPropagation(); });' +
'}' +
// TACHE (retour utilisateur 2026-09-15, "manipulation directe" sur les
// colonnes) : meme mecanique EXACTE que _pdfActiverRedimensionnementHauteurEntete
// juste au-dessus, mais sur la largeur (regLargeurColonneGauche, deja un
// vrai curseur du panneau -- jamais une 2e source de verite, ce curseur
// EST mis a jour pendant le glisser, _pdfRafraichir() le relit ensuite
// normalement). Pendant le glisser, applique directement la largeur en %
// aux 2 <div class="colonne"> (jamais le calc(X% - gap/2) exact du rendu
// serveur -- une approximation negligeable le temps du glisser, corrigee
// au relachement par _pdfRafraichir()) pour eviter de reconstruire tout
// le HTML a chaque mousemove.
'function _pdfActiverRedimensionnementLargeurColonnes() {' +
'  var poignee = document.querySelector("#conteneurPage [data-poignee-largeur-colonnes]");' +
'  var corps = document.querySelector("#conteneurPage .corps");' +
'  var slider = document.getElementById("regLargeurColonneGauche");' +
'  if (!poignee || !corps || !slider) { return; }' +
'  var largeurMin = parseInt(slider.min, 10) || 30, largeurMax = parseInt(slider.max, 10) || 70;' +
'  function positionnerPoignee(largeur) {' +
'    poignee.style.left = "calc(14mm + (100% - 28mm) * " + (largeur / 100) + ")";' +
'  }' +
'  poignee.addEventListener("mousedown", function (evtDown) {' +
'    if (evtDown.button !== 0) { return; }' +
'    evtDown.preventDefault();' +
'    evtDown.stopPropagation();' +
'    var corpsRect = corps.getBoundingClientRect();' +
'    var startX = evtDown.clientX;' +
'    var largeurDepart = parseInt(slider.value, 10) || 50;' +
'    var gauche = corps.children[0];' +
'    var droite = corps.children[1];' +
'    function onMove(evtMove) {' +
'      var dx = evtMove.clientX - startX;' +
'      var largeur = Math.round(largeurDepart + (dx / corpsRect.width) * 100);' +
'      largeur = Math.min(largeurMax, Math.max(largeurMin, largeur));' +
'      slider.value = largeur;' +
'      var label = document.getElementById("valeurLargeurColonnes");' +
'      if (label) { label.textContent = largeur + "%"; }' +
'      if (gauche) { gauche.style.flexBasis = largeur + "%"; }' +
'      if (droite) { droite.style.flexBasis = (100 - largeur) + "%"; }' +
'      positionnerPoignee(largeur);' +
'    }' +
'    function onUp() {' +
'      document.removeEventListener("mousemove", onMove);' +
'      document.removeEventListener("mouseup", onUp);' +
'      _pdfRafraichir();' +
'    }' +
'    document.addEventListener("mousemove", onMove);' +
'    document.addEventListener("mouseup", onUp);' +
'  });' +
'  poignee.addEventListener("click", function (evt) { evt.stopPropagation(); });' +
'}' +
// TACHE (agrandissement par rubrique) : positionne la mini-barre flottante
// pres du bloc cible (a droite, ou a gauche si pas assez de place) et
// synchronise le curseur sur l\'echelle DEJA memorisee pour cette rubrique
// (1 = normal, jamais devinee -- toujours lue depuis l\'etat partage).
'function _pdfAfficherBarreOutilsRubrique(cle, targetEl) {' +
'  if (!cle || !targetEl) { return; }' +
// TACHE (retour utilisateur, bug reel confirme : "quand j'agrandis la
// taille, la fenetre d'origine bouge -- ca fait trembler l'ecran") :
// changer un reglage (ex. le curseur "Taille de cette rubrique")
// declenche _pdfRafraichir(), qui rappelle CETTE fonction pour la MEME
// rubrique deja ouverte -- avant ce correctif, la position (top/left)
// etait recalculee a chaque fois d'apres targetEl.getBoundingClientRect(),
// qui a justement change de taille/position suite au reglage, faisant
// sauter le panneau a chaque ajustement. Nouvelle regle : re-centrer sur
// la cible SEULEMENT a l'ouverture d'une NOUVELLE rubrique (detectee ici,
// avant d'ecraser _cvPdfRubriqueSelectionnee) -- une fois ouvert pour une
// rubrique donnee, la position reste fixe (deplacable a la souris via le
// titre, voir plus bas) jusqu'a la fermeture ou un changement de cible.
'  var nouvelleRubrique = (cle !== _cvPdfRubriqueSelectionnee);' +
'  _cvPdfRubriqueSelectionnee = cle;' +
'  document.getElementById("titreBarreRubrique").textContent = _PDF_NOMS_RUBRIQUES[cle] || cle;' +
'  var echelleActuelle = Math.round((_cvPdfEchellesRubriques[cle] || 1) * 100);' +
'  document.getElementById("regEchelleRubrique").value = echelleActuelle;' +
'  document.getElementById("valeurEchelleRubrique").textContent = echelleActuelle + "%";' +
// TACHE (retour utilisateur : police par rubrique) : synchronise la case
// + le select sur l\'etat DEJA memorise pour cette rubrique (absence de
// cle = case decochee, select masque -- suit la police globale).
'  var policeActuelle = _cvPdfPolicesRubriques[cle];' +
'  document.getElementById("regPoliceRubriqueActive").checked = !!policeActuelle;' +
'  document.getElementById("regPoliceRubrique").style.display = policeActuelle ? "" : "none";' +
'  if (policeActuelle) { document.getElementById("regPoliceRubrique").value = policeActuelle; }' +
// TACHE (retour utilisateur : "cliquer sur les competences/bandeau
// coordonnees pour choisir pastille/rectangle/texte + leur couleur juste
// pour CETTE rubrique") : meme principe que la police ci-dessus -- masque
// entierement pour les rubriques qui n\'ont pas de rendu a puces (aucun
// sens sur Experiences/Formations/...).
'  var estRubriqueAvecPuces = _PDF_RUBRIQUES_AVEC_PUCES.indexOf(cle) !== -1;' +
'  document.getElementById("zoneStylePuceRubrique").style.display = estRubriqueAvecPuces ? "" : "none";' +
'  if (estRubriqueAvecPuces) {' +
'    var overridePuce = _cvPdfStylesPuceRubriques[cle];' +
'    document.getElementById("regStylePuceRubriqueActive").checked = !!overridePuce;' +
'    document.getElementById("blocStylePuceRubrique").style.display = overridePuce ? "" : "none";' +
'    document.getElementById("regStylePuceRubrique").value = (overridePuce && overridePuce.style) || document.getElementById("regStyleCompetences").value;' +
'    document.getElementById("regCouleurFondPuceRubrique").value = (overridePuce && overridePuce.couleurFond) || document.getElementById("regCouleurFondCompetences").value;' +
'    document.getElementById("regCouleurTextePuceRubrique").value = (overridePuce && overridePuce.couleurTexte) || document.getElementById("regCouleurTextePuces").value;' +
'  }' +
// TACHE (retour utilisateur : "lui mettre la couleur si je veux, changer
// le style" -- nom/metier/accroche) : meme principe checkbox-active,
// masque entierement hors des 4 blocs d\'en-tete concernes.
'  var estBlocTexteEntete = _PDF_BLOCS_TEXTE_ENTETE.indexOf(cle) !== -1;' +
'  document.getElementById("zoneStyleTexteEntete").style.display = estBlocTexteEntete ? "" : "none";' +
'  if (estBlocTexteEntete) {' +
'    var overrideTexte = _cvPdfStylesTexteEntete[cle];' +
'    document.getElementById("regStyleTexteEnteteActive").checked = !!overrideTexte;' +
'    document.getElementById("blocStyleTexteEntete").style.display = overrideTexte ? "" : "none";' +
'    document.getElementById("regCouleurTexteEntete").value = (overrideTexte && overrideTexte.couleur) || "#1b1b1b";' +
'    document.getElementById("regTexteEnteteGras").checked = !!(overrideTexte && overrideTexte.gras);' +
'    document.getElementById("regTexteEnteteItalique").checked = !!(overrideTexte && overrideTexte.italique);' +
'  }' +
// TACHE (retour utilisateur : "épuré/condensé direct au clic sur
// Expérience professionnelle/personnelle") : miroir du select global
// concerné (experiences -> regStyleProfessionnel, engagements ->
// regStylePersonnel), jamais un 2e etat a synchroniser.
'  var estRubriqueAvecMissions = (cle === "experiences" || cle === "engagements");' +
'  document.getElementById("zoneStyleMissionsRubrique").style.display = estRubriqueAvecMissions ? "" : "none";' +
'  if (estRubriqueAvecMissions) {' +
'    var idSelectGlobalMissions = (cle === "experiences") ? "regStyleProfessionnel" : "regStylePersonnel";' +
'    document.getElementById("regStyleMissionsRubrique").value = document.getElementById(idSelectGlobalMissions).value;' +
'    document.getElementById("regStyleMissionsRubrique").setAttribute("data-cible", idSelectGlobalMissions);' +
'  }' +
'  var barre = document.getElementById("barreOutilsRubrique");' +
'  barre.style.display = "block";' +
'  if (!nouvelleRubrique) { return; }' +
'  var rect = targetEl.getBoundingClientRect();' +
'  var largeurBarre = 220;' +
'  var gauche = rect.right + 10;' +
'  if (gauche + largeurBarre > window.innerWidth) { gauche = Math.max(8, rect.left - largeurBarre - 10); }' +
// TACHE (retour utilisateur, bug reel confirme apres plusieurs allers-
// retours -- "Missions n'apparait jamais au clic sur Experience
// professionnelle/personnelle") : `top` etait cale UNIQUEMENT sur
// rect.top (le haut de la rubrique cliquee), jamais verifie contre la
// hauteur du panneau lui-meme -- pour une rubrique en bas de page (le cas
// typique d'Experience personnelle, une des dernieres rubriques), le
// panneau debordait alors SOUS le bas visible de l'iframe (position:fixed
// = relatif au viewport DE L\'IFRAME, qui le decoupe purement et
// simplement, invisible sans jamais etre display:none -- indetectable en
// lisant le DOM). Meme logique de clamp que la largeur juste au-dessus,
// appliquee cette fois a la hauteur : mesuree APRES avoir rempli le
// contenu (display:block deja pose), donc deja a sa vraie taille finale.
'  var hauteurBarre = barre.getBoundingClientRect().height;' +
'  var haut = Math.max(8, Math.min(rect.top, window.innerHeight - hauteurBarre - 8));' +
'  barre.style.top = haut + "px";' +
'  barre.style.left = gauche + "px";' +
'}' +
'function _pdfFermerBarreOutilsRubrique() {' +
'  _cvPdfRubriqueSelectionnee = null;' +
'  document.getElementById("barreOutilsRubrique").style.display = "none";' +
'}' +
// TACHE (agrandissement par rubrique) : appelee a CHAQUE rafraichissement
// -- l\'element cible d\'un clic precedent est detache du DOM des que
// #conteneurPage est remplace (voir _pdfRafraichir()), la reference doit
// donc etre retrouvee via data-rubrique, jamais reutilisee telle quelle.
'function _pdfRepositionnerBarreOutilsRubriqueApresRendu() {' +
'  if (!_cvPdfRubriqueSelectionnee) { return; }' +
'  var el = document.querySelector(\'#conteneurPage [data-rubrique="\' + _cvPdfRubriqueSelectionnee + \'"]\');' +
'  if (!el) { _pdfFermerBarreOutilsRubrique(); return; }' +
'  _pdfAfficherBarreOutilsRubrique(_cvPdfRubriqueSelectionnee, el);' +
'}' +
'document.getElementById("regEchelleRubrique").addEventListener("input", function () {' +
'  if (!_cvPdfRubriqueSelectionnee) { return; }' +
'  _cvPdfEchellesRubriques[_cvPdfRubriqueSelectionnee] = parseInt(this.value, 10) / 100;' +
'  document.getElementById("valeurEchelleRubrique").textContent = this.value + "%";' +
'  _pdfRafraichir();' +
'});' +
'document.getElementById("btnResetRubrique").addEventListener("click", function () {' +
'  if (!_cvPdfRubriqueSelectionnee) { return; }' +
'  delete _cvPdfEchellesRubriques[_cvPdfRubriqueSelectionnee];' +
'  document.getElementById("regEchelleRubrique").value = 100;' +
'  document.getElementById("valeurEchelleRubrique").textContent = "100%";' +
'  _pdfRafraichir();' +
'});' +
// TACHE (retour utilisateur : "corps de texte de la rubrique, meme
// police ou une autre au choix") : la case decide SI une police propre
// s\'applique, le select laquelle -- coherent avec l\'etat REGLE/DEREGLE
// binaire attendu (jamais de police "vide" ambigue).
'document.getElementById("regPoliceRubrique").innerHTML = document.getElementById("regPolice").innerHTML;' +
'document.getElementById("regPoliceRubriqueActive").addEventListener("change", function () {' +
'  if (!_cvPdfRubriqueSelectionnee) { return; }' +
'  var selectPolice = document.getElementById("regPoliceRubrique");' +
'  if (this.checked) {' +
'    selectPolice.style.display = "";' +
'    _cvPdfPolicesRubriques[_cvPdfRubriqueSelectionnee] = selectPolice.value;' +
'  } else {' +
'    selectPolice.style.display = "none";' +
'    delete _cvPdfPolicesRubriques[_cvPdfRubriqueSelectionnee];' +
'  }' +
'  _pdfRafraichir();' +
'});' +
'document.getElementById("regPoliceRubrique").addEventListener("change", function () {' +
'  if (!_cvPdfRubriqueSelectionnee || !document.getElementById("regPoliceRubriqueActive").checked) { return; }' +
'  _cvPdfPolicesRubriques[_cvPdfRubriqueSelectionnee] = this.value;' +
'  _pdfRafraichir();' +
'});' +
// TACHE (retour utilisateur : "cliquer sur les competences/bandeau
// coordonnees pour choisir pastille/rectangle/texte + leur couleur juste
// pour CETTE rubrique") : meme principe checkbox-active que la police
// ci-dessus -- un seul override {style, couleurFond, couleurTexte} par
// rubrique, jamais 3 etats independants a synchroniser separement.
'function _pdfMettreAJourStylePuceRubrique() {' +
'  if (!_cvPdfRubriqueSelectionnee || !document.getElementById("regStylePuceRubriqueActive").checked) { return; }' +
'  _cvPdfStylesPuceRubriques[_cvPdfRubriqueSelectionnee] = {' +
'    style: document.getElementById("regStylePuceRubrique").value,' +
'    couleurFond: document.getElementById("regCouleurFondPuceRubrique").value,' +
'    couleurTexte: document.getElementById("regCouleurTextePuceRubrique").value' +
'  };' +
'  _pdfRafraichir();' +
'}' +
'document.getElementById("regStylePuceRubriqueActive").addEventListener("change", function () {' +
'  if (!_cvPdfRubriqueSelectionnee) { return; }' +
'  var blocStyle = document.getElementById("blocStylePuceRubrique");' +
'  if (this.checked) {' +
'    blocStyle.style.display = "";' +
'    _pdfMettreAJourStylePuceRubrique();' +
'  } else {' +
'    blocStyle.style.display = "none";' +
'    delete _cvPdfStylesPuceRubriques[_cvPdfRubriqueSelectionnee];' +
'    _pdfRafraichir();' +
'  }' +
'});' +
'document.getElementById("regStylePuceRubrique").addEventListener("change", _pdfMettreAJourStylePuceRubrique);' +
'document.getElementById("regCouleurFondPuceRubrique").addEventListener("input", _pdfMettreAJourStylePuceRubrique);' +
'document.getElementById("regCouleurTextePuceRubrique").addEventListener("input", _pdfMettreAJourStylePuceRubrique);' +
// TACHE (retour utilisateur : "lui mettre la couleur si je veux, changer
// le style" -- nom/metier/accroche) : meme principe checkbox-active que
// _pdfMettreAJourStylePuceRubrique ci-dessus.
'function _pdfMettreAJourStyleTexteEntete() {' +
'  if (!_cvPdfRubriqueSelectionnee || !document.getElementById("regStyleTexteEnteteActive").checked) { return; }' +
'  _cvPdfStylesTexteEntete[_cvPdfRubriqueSelectionnee] = {' +
'    couleur: document.getElementById("regCouleurTexteEntete").value,' +
'    gras: document.getElementById("regTexteEnteteGras").checked,' +
'    italique: document.getElementById("regTexteEnteteItalique").checked' +
'  };' +
'  _pdfRafraichir();' +
'}' +
'document.getElementById("regStyleTexteEnteteActive").addEventListener("change", function () {' +
'  if (!_cvPdfRubriqueSelectionnee) { return; }' +
'  var bloc = document.getElementById("blocStyleTexteEntete");' +
'  if (this.checked) {' +
'    bloc.style.display = "";' +
'    _pdfMettreAJourStyleTexteEntete();' +
'  } else {' +
'    bloc.style.display = "none";' +
'    delete _cvPdfStylesTexteEntete[_cvPdfRubriqueSelectionnee];' +
'    _pdfRafraichir();' +
'  }' +
'});' +
'document.getElementById("regCouleurTexteEntete").addEventListener("input", _pdfMettreAJourStyleTexteEntete);' +
'document.getElementById("regTexteEnteteGras").addEventListener("change", _pdfMettreAJourStyleTexteEntete);' +
'document.getElementById("regTexteEnteteItalique").addEventListener("change", _pdfMettreAJourStyleTexteEntete);' +
// TACHE (retour utilisateur : "épuré/condensé direct au clic sur
// Expérience professionnelle/personnelle") : repercute sur le VRAI select
// global (data-cible) puis declenche son propre "change" -- reutilise le
// listener generique deja pose sur tous les selects de .panneau-reglages
// (_pdfRafraichir), jamais une 2e logique de rafraichissement dupliquee.
'document.getElementById("regStyleMissionsRubrique").addEventListener("change", function () {' +
'  var idCible = this.getAttribute("data-cible");' +
'  if (!idCible) { return; }' +
'  var selectCible = document.getElementById(idCible);' +
'  selectCible.value = this.value;' +
'  selectCible.dispatchEvent(new Event("change"));' +
'});' +
'document.getElementById("btnFermerBarreRubrique").addEventListener("click", _pdfFermerBarreOutilsRubrique);' +
// TACHE (retour utilisateur : "je veux la possibilite de pouvoir bouger
// les fenetres qui font apparition") : glisser-depose souris sur le
// titre (jamais sur le bouton ✕, qui doit fermer normalement) -- pose UNE
// SEULE FOIS au chargement (le titre-barre, comme tout #barreOutilsRubrique,
// n'est jamais recree par _pdfRafraichir()). Coordonnees en PIXELS (pas
// en %, contrairement aux blocs d'en-tete) : #barreOutilsRubrique est deja
// position:fixed avec top/left en px, voir _pdfAfficherBarreOutilsRubrique.
'(function () {' +
'  var titre = document.querySelector("#barreOutilsRubrique .titre-barre");' +
'  var barre = document.getElementById("barreOutilsRubrique");' +
'  titre.addEventListener("mousedown", function (evtDown) {' +
'    if (evtDown.button !== 0 || evtDown.target.id === "btnFermerBarreRubrique") { return; }' +
'    evtDown.preventDefault();' +
'    var startX = evtDown.clientX, startY = evtDown.clientY;' +
'    var rectDepart = barre.getBoundingClientRect();' +
'    function onMove(evtMove) {' +
'      var dx = evtMove.clientX - startX, dy = evtMove.clientY - startY;' +
'      barre.style.left = Math.max(0, rectDepart.left + dx) + "px";' +
'      barre.style.top = Math.max(0, rectDepart.top + dy) + "px";' +
'    }' +
'    function onUp() {' +
'      document.removeEventListener("mousemove", onMove);' +
'      document.removeEventListener("mouseup", onUp);' +
'    }' +
'    document.addEventListener("mousemove", onMove);' +
'    document.addEventListener("mouseup", onUp);' +
'  });' +
'})();' +
// TACHE (fermer la barre au clic ailleurs) : le clic sur une rubrique
// (voir _pdfActiverGlisserDeposer) appelle evt.stopPropagation(), donc ne
// remonte JAMAIS jusqu\'ici -- seul un clic en dehors de toute rubrique ET
// en dehors de la barre elle-meme la ferme.
'document.addEventListener("click", function (evt) {' +
'  var barre = document.getElementById("barreOutilsRubrique");' +
'  if (barre.style.display === "none" || barre.contains(evt.target)) { return; }' +
'  _pdfFermerBarreOutilsRubrique();' +
'});' +
// TACHE (reglage manuel de la taille du texte, en plus du bouton auto) :
// le curseur pilote directement `_cvPdfEchelle` (la MEME variable que
// "Mise en page") -- un seul etat partage, jamais 2 mecanismes paralleles
// qui pourraient se desynchroniser.
'document.getElementById("regEchelle").addEventListener("input", function () {' +
'  _cvPdfEchelle = parseFloat(this.value) / 11;' +
'  _pdfAfficherMessageMiseEnPage("");' +
'  _pdfRafraichir();' +
'});' +
// TACHE (retour utilisateur : "Mise en page doit marcher pour l'A5 aussi")
// : meme _cvPdfEchelle PARTAGE avec le curseur A4 juste au-dessus (jamais
// une 2e variable d'echelle -- un seul format est actif/rendu a la fois
// dans ce panneau, aucun risque de collision reelle) -- seul le curseur
// visible/le label different (regEchelleA5/valeurEchelleA5).
'document.getElementById("regEchelleA5").addEventListener("input", function () {' +
'  _cvPdfEchelle = parseFloat(this.value) / 11;' +
'  document.getElementById("valeurEchelleA5").textContent = this.value;' +
'  document.getElementById("messageMiseEnPageA5").textContent = "";' +
'  _pdfRafraichir();' +
'});' +
// TACHE (largeur des colonnes ajustable) : rafraichissement EN DIRECT
// pendant le glisser du curseur (evenement "input"), pas seulement au
// relachement (evenement "change" deja branche generiquement plus haut
// -- les 2 coexistent, meme convention que regEchelle ci-dessus).
'document.getElementById("regLargeurColonneGauche").addEventListener("input", function () {' +
'  document.getElementById("valeurLargeurColonnes").textContent = this.value + "%";' +
'  _pdfRafraichir();' +
'});' +
// TACHE (largeur du rectangle d'accroche ajustable) : meme convention
// "input" en direct que la largeur de colonne ci-dessus.
'document.getElementById("regLargeurAccrocheLibre").addEventListener("input", function () {' +
'  document.getElementById("valeurLargeurAccroche").textContent = this.value + "%";' +
'  _pdfRafraichir();' +
'});' +
'document.getElementById("regLargeurMetierLibre").addEventListener("input", function () {' +
'  document.getElementById("valeurLargeurMetier").textContent = this.value + "%";' +
'  _pdfRafraichir();' +
'});' +
// TACHE ("Mise en page", port du Word) : contrairement au Word (qui ne
// peut qu'ESTIMER un nombre de lignes, docx.js ne mesurant jamais le
// rendu reel), on mesure ICI la VRAIE hauteur DOM de la page rendue
// (getBoundingClientRect) et on ajuste `_cvPdfEchelle` iterativement --
// jamais une estimation indirecte. Jamais de re-decision de contenu :
// uniquement la densite visuelle (police/espacements du corps, voir
// cvPdfTemplateA4.js), l'en-tete ne bouge jamais.
'var PX_PAR_MM = 96 / 25.4;' +
'var HAUTEUR_CIBLE_PX = 297 * PX_PAR_MM;' +
// TACHE (bug trouve en testant) : `.page-a4` porte un `min-height: 297mm`
// (necessaire pour l'impression -- une page trop courte serait quand meme
// imprimee en 297mm de haut) -- mesurer directement `getBoundingClientRect()`
// ne peut donc JAMAIS renvoyer moins que la cible, meme avec tres peu de
// contenu, rendant la detection "page trop vide" structurellement
// impossible. Neutralise temporairement ce min-height (style inline, restaure
// juste apres la mesure) pour obtenir la VRAIE hauteur du contenu.
'function _pdfMesurerHauteurPage() {' +
'  var page = document.querySelector("#conteneurPage .page-a4");' +
'  if (!page) { return 0; }' +
'  var minHeightOriginal = page.style.minHeight;' +
'  page.style.minHeight = "0";' +
'  var hauteur = page.getBoundingClientRect().height;' +
'  page.style.minHeight = minHeightOriginal;' +
'  return hauteur;' +
'}' +
'function _pdfRafraichirEtMesurer() {' +
'  _pdfRafraichir();' +
'  return _pdfMesurerHauteurPage();' +
'}' +
// TACHE (A4 Integral, port du Word "maxPagesAcceptable/Requilibrage",
// js/app.js:13922/14021/14334) : Integral accepte 2 pages au lieu d'1 --
// seul le seuil "trop haut" est multiplie par ce nombre de pages ; le
// seuil "trop vide" reste juge sur 1 page (Integral n'a jamais vocation a
// pousser artificiellement le contenu a remplir 2 pages completes).
'function _pdfMaxPagesAcceptable() {' +
'  return (document.getElementById("regFormatCV").value === "A4-integral") ? 2 : 1;' +
'}' +
// TACHE (retour utilisateur : "la police du CV, minimum 11, pas moins --
// les variations entre 9 et 14") : bornes 0.75/1.15 (echelle) -> 9/11 et
// 14/11 -- l'ajustement automatique ne descend/monte plus jamais en
// dehors de la meme plage 9-14px que le curseur manuel (voir plus haut),
// jamais un 2e plafond invente ici.
'var _PDF_ECHELLE_MIN = 9 / 11, _PDF_ECHELLE_MAX = 14 / 11;' +
'function _pdfAfficherTaillePx(echelle) { return Math.round(echelle * 11 * 10) / 10; }' +
// TACHE (retour utilisateur : "je veux que les deux [en-tete et corps]
// grandissent ensemble, mais en commencant toujours par l'en-tete... et
// si jamais il faut gagner de la place, on sait par quoi commencer" --
// "je prefere avoir les deux qui restent a peu pres equivalentes, peut-
// etre la tete un peu plus grande que le corps de texte") : borne haute
// alignee sur le max deja autorise par le curseur manuel de la mini-barre
// flottante (regEchelleRubrique, 75%-140%) -- jamais un 2e plafond
// invente ici. Plancher : reutilise _PDF_ECHELLE_LOCALE_MIN_AUTOFIT
// (deja definie plus haut, meme convention que le reste de l'auto-fit
// d'en-tete).
'var _PDF_ECHELLE_ENTETE_MAX = 1.4;' +
// TACHE (meme retour utilisateur) : fait varier ENSEMBLE les 3 echelles
// de l\'en-tete (nom/metier/accroche restent toujours egales entre elles
// tant que seul ce mecanisme les pilote -- la mini-barre manuelle reste
// libre de les redecoupler ensuite au clic, comportement inchange).
'function _pdfAjusterEchelleEnteteEnsemble(delta) {' +
'  var actuelle = _cvPdfEchellesRubriques["entete-nom"] || 1;' +
'  var cible = Math.max(_PDF_ECHELLE_LOCALE_MIN_AUTOFIT, Math.min(_PDF_ECHELLE_ENTETE_MAX, Math.round((actuelle + delta) * 100) / 100));' +
'  if (cible === actuelle) { return false; }' +
'  ["entete-nom", "entete-metier", "entete-accroche", "entete-coordonnees"].forEach(function (cle) { _cvPdfEchellesRubriques[cle] = cible; });' +
'  return true;' +
'}' +
// TACHE (meme retour utilisateur, bug reel confirme en testant : compare
// contre la taille ACTUELLE du corps a chaque pas de la phase 1 (en-tete
// seul) bloquait la reduction des le tout 1er pas -- au tout debut de la
// phase de reduction, le corps est encore a sa taille neutre (11px), donc
// quasiment n\'importe quelle reduction de l\'accroche (11.5px de base)
// passait sous cette valeur et se faisait refuser, empechant l\'en-tete de
// "redonner de la place en premier" comme demande) : verification
// REPOUSSEE en fin de fonction plutot qu\'a chaque pas -- une fois les 2
// phases terminees (en-tete puis corps, dans cet ordre), si l\'accroche
// (le plus petit des 3 elements d\'en-tete) finit malgre tout plus petite
// que le corps, la remonte au minimum necessaire pour rester au moins
// egale -- jamais l\'inverse affiche a l\'ecran.
// TACHE (meme retour utilisateur) : le rattrapage ci-dessous peut aussi
// intervenir apres la phase de CROISSANCE (corps ayant grandi plus vite
// que l'en-tete, arrete tot a cause d'un chevauchement) -- jamais sans
// revalider le chevauchement dans ce cas precis : mieux vaut garder un
// en-tete legerement plus petit que le corps que de re-provoquer le bug
// de superposition tout juste corrige.
'function _pdfGarantirEnteteAuMoinsAussiGrandeQueCorps() {' +
'  var echelleEnteteActuelle = _cvPdfEchellesRubriques["entete-nom"] || 1;' +
'  var accrochePx = 11.5 * echelleEnteteActuelle;' +
'  var corpsPx = 11 * _cvPdfEchelle;' +
'  if (accrochePx >= corpsPx - 0.01) { return; }' +
'  var echelleAvant = echelleEnteteActuelle;' +
'  var echelleMinimale = Math.min(_PDF_ECHELLE_ENTETE_MAX, corpsPx / 11.5);' +
'  ["entete-nom", "entete-metier", "entete-accroche", "entete-coordonnees"].forEach(function (cle) { _cvPdfEchellesRubriques[cle] = echelleMinimale; });' +
'  _pdfRafraichir();' +
'  if (echelleMinimale > echelleAvant && _pdfEnteteProblematiqueApresCroissance()) {' +
'    ["entete-nom", "entete-metier", "entete-accroche", "entete-coordonnees"].forEach(function (cle) { _cvPdfEchellesRubriques[cle] = echelleAvant; });' +
'    _pdfRafraichir();' +
'  }' +
'}' +
// TACHE (meme retour utilisateur) : signal "l\'en-tete a un probleme"
// utilise UNIQUEMENT pendant la croissance automatique (jamais pendant la
// reduction, qui ne peut pas creer de nouveau chevauchement) -- meme
// detection que _pdfAutoAjusterBandeauSiDebordement plus haut (debordement
// de cadre OU chevauchement entre blocs), etendue ici aux 3 paires
// possibles (nom/metier/accroche), reutilisee ici pour arreter la
// croissance de l\'en-tete AVANT qu\'un chevauchement n\'apparaisse a
// l\'ecran plutot que de le corriger apres coup.
'function _pdfEnteteProblematiqueApresCroissance() {' +
'  var entete = document.querySelector("#conteneurPage .entete-libre");' +
'  if (!entete) { return false; }' +
'  var er = entete.getBoundingClientRect();' +
'  var blocs = {' +
'    nom: document.querySelector("#conteneurPage .entete-libre .bloc-libre[data-entete-bloc=\\"nom\\"]"),' +
'    metier: document.querySelector("#conteneurPage .entete-libre .bloc-libre[data-entete-bloc=\\"metier\\"]"),' +
'    accroche: document.querySelector("#conteneurPage .entete-libre .bloc-libre[data-entete-bloc=\\"accroche\\"]"),' +
// TACHE (point 19) : coordonnees ajoute a la meme detection -- 4e bloc
// independant, doit lui aussi pouvoir arreter la croissance de l\'en-tete
// s\'il se retrouve chevauche.
'    coordonnees: document.querySelector("#conteneurPage .entete-libre .bloc-libre[data-entete-bloc=\\"coordonnees\\"]")' +
'  };' +
'  function deborde(bloc) { if (!bloc) { return false; } var br = bloc.getBoundingClientRect(); return br.bottom > er.bottom + 0.5 || br.right > er.right + 0.5; }' +
'  function chevauche(a, b) { return (a && b) ? _pdfRectanglesSeChevauchent(a.getBoundingClientRect(), b.getBoundingClientRect()) : false; }' +
'  return deborde(blocs.nom) || deborde(blocs.metier) || deborde(blocs.accroche) || deborde(blocs.coordonnees) ||' +
'    chevauche(blocs.metier, blocs.accroche) || chevauche(blocs.nom, blocs.metier) || chevauche(blocs.nom, blocs.accroche) ||' +
'    chevauche(blocs.coordonnees, blocs.metier) || chevauche(blocs.coordonnees, blocs.accroche) || chevauche(blocs.nom, blocs.coordonnees);' +
'}' +
// TACHE (retour utilisateur : "le message est noye entre l'ATS et les
// options, je veux un rectangle bien visible... qui s'adapte au
// contenu") : point d'entree UNIQUE pour ecrire/effacer ce message --
// jamais un textContent direct eparpille dans ce fichier (5 autres
// endroits remettaient messageMiseEnPage a vide sans jamais gerer la
// classe .visible, avant ce chantier -- corrige en meme temps, voir plus
// bas). Prefixe icone+"Mise en page :" commun a TOUS les messages, jamais
// re-tape a chaque appel.
'function _pdfAfficherMessageMiseEnPage(texte) {' +
'  var el = document.getElementById("messageMiseEnPage");' +
'  if (!texte) { el.classList.remove("visible"); el.innerHTML = ""; return; }' +
'  el.innerHTML = "🪄 <strong>Mise en page :</strong> " + texte;' +
'  el.classList.add("visible");' +
'}' +
// TACHE (retour utilisateur, bug reel confirme sur plusieurs captures :
// "je constate que l'experience professionnelle, elle est toujours seule
// dans une colonne"/"trop d'informations d'un cote, trop peu de l'autre")
// : port du mecanisme deja eprouve cote Word (mesurerHauteursColonnesXXL/
// essayerRequilibrageLateralAutomatique, js/app.js) -- mesure la VRAIE
// hauteur DOM de chaque colonne (jamais le proxy "longueur du HTML",
// cvPdfTemplateA4.js:966-1030, qui reste le tri INITIAL, cette fonction ne
// fait qu'ajuster ensuite par-dessus). Contrairement au Word (docx rendu
// de facon asynchrone), le PDF est du HTML/CSS synchrone : pas besoin de
// machine a etats en plusieurs rendus, une simple boucle suffit.
// TACHE (bug reel confirme en testant : les 2 valeurs mesurees restaient
// TOUJOURS strictement egales, quel que soit le contenu reel de chaque
// colonne) : ".corps" est un flex container SANS align-items explicite --
// "stretch" (la valeur par defaut CSS) etire donc chaque ".colonne" a la
// hauteur de la PLUS HAUTE des deux, exactement le meme piege deja
// rencontre et corrige cote Word avec les <td> (mesurerHauteursColonnesXXL,
// js/app.js -- "un <td> s'etire TOUJOURS a la hauteur de la ligne entiere").
// Mesure donc, comme le Word, la position reelle du DERNIER enfant de
// chaque colonne (son "bottom" moins le "top" de la colonne), qui reflete
// la hauteur reellement occupee par le contenu, jamais celle -- etiree -- de
// la colonne elle-meme.
'function _pdfHauteurContenuReelleColonne(colonne) {' +
'  var enfants = colonne.children;' +
'  if (!enfants.length) { return 0; }' +
'  var dernier = enfants[enfants.length - 1];' +
'  return dernier.getBoundingClientRect().bottom - colonne.getBoundingClientRect().top;' +
'}' +
'function _pdfMesurerHauteursColonnes() {' +
'  var colonnesEl = document.querySelectorAll("#conteneurPage .corps > .colonne");' +
'  if (colonnesEl.length < 2) { return null; }' +
'  return { gauche: _pdfHauteurContenuReelleColonne(colonnesEl[0]), droite: _pdfHauteurContenuReelleColonne(colonnesEl[1]) };' +
'}' +
// TACHE (meme retour utilisateur) : jamais "experiences"/"competences"
// juges trop volumineux pour bouger sans risque (voir aussi le garde-fou
// dans cvPdfTemplateA4.js qui les traite deja comme rubriques ancres) --
// "competences" reste neanmoins un DERNIER recours ici (comme cote Word,
// CANDIDATS_LATERAL_VERS_DROITE_XXL, qui l'inclut aussi en 2e position),
// jamais "experiences".
'var _PDF_CANDIDATS_REEQUILIBRAGE_COLONNES = ["formations", "certifications", "engagements", "competencesComportementales", "langues", "loisirs", "competences"];' +
'function _pdfEssayerRequilibrageColonnes() {' +
// Aucune repartition automatique a corriger si la personne a deja
// glisse-depose ses rubriques a la main, ou si on est en 1 seule
// colonne (rien a equilibrer) -- memes conditions que le tri initial
// cote cvPdfTemplateA4.js.
'  if (_cvPdfOrdrePersonnalise) { return; }' +
'  if (parseInt(document.getElementById("regColonnes").value, 10) !== 2) { return; }' +
'  var hauteurs = _pdfMesurerHauteursColonnes();' +
'  if (!hauteurs || !hauteurs.gauche || !hauteurs.droite) { return; }' +
'  var ratio = Math.max(hauteurs.gauche, hauteurs.droite) / Math.min(hauteurs.gauche, hauteurs.droite);' +
'  if (ratio < 1.3) { return; }' +
'  var meilleurRatio = ratio;' +
'  var essais = 0;' +
'  while (essais < _PDF_CANDIDATS_REEQUILIBRAGE_COLONNES.length && essais < 4) {' +
'    var coteLourd = hauteurs.gauche > hauteurs.droite ? "gauche" : "droite";' +
'    var coteLeger = coteLourd === "gauche" ? "droite" : "gauche";' +
// Ne retente jamais un candidat deja force du BON cote (deja fait, ou
// deja essaye et refuse) -- le premier candidat non force (ou force de
// l\'AUTRE cote, ex. tirage aleatoire precedent) devient le prochain essai.
'    var candidat = _PDF_CANDIDATS_REEQUILIBRAGE_COLONNES.filter(function (cle) { return _cvPdfRubriquesForceesColonne[cle] !== coteLeger; })[essais];' +
'    if (!candidat) { break; }' +
'    essais++;' +
'    var forcageAvant = _cvPdfRubriquesForceesColonne[candidat];' +
'    _cvPdfRubriquesForceesColonne[candidat] = coteLeger;' +
'    _pdfRafraichir();' +
'    var hauteursApres = _pdfMesurerHauteursColonnes();' +
'    var ratioApres = (hauteursApres && hauteursApres.gauche && hauteursApres.droite)' +
'      ? Math.max(hauteursApres.gauche, hauteursApres.droite) / Math.min(hauteursApres.gauche, hauteursApres.droite) : Infinity;' +
'    if (ratioApres < meilleurRatio) {' +
'      meilleurRatio = ratioApres;' +
'      hauteurs = hauteursApres;' +
'      if (meilleurRatio < 1.15) { break; }' +
'    } else {' +
// Ce candidat n'ameliore pas l'ecart -- annule (restaure son etat
// d'avant essai, jamais force a rester) et essaie le candidat suivant.
'      if (forcageAvant === undefined) { delete _cvPdfRubriquesForceesColonne[candidat]; } else { _cvPdfRubriquesForceesColonne[candidat] = forcageAvant; }' +
'      _pdfRafraichir();' +
'    }' +
'  }' +
'}' +
// Point d\'entree reel du clic (voir l\'addEventListener plus bas) --
// _pdfAjusterMiseEnPageCalcul() (juste apres) porte tout le calcul
// existant, inchange. Cette fonction se contente de desactiver le bouton
// et d\'afficher un message immediat AVANT de lancer le calcul (differe
// d\'un setTimeout pour laisser le navigateur peindre ce changement --
// sinon, etant donne que tout le reste est synchrone, rien ne s\'afficherait
// avant la toute fin), puis de le reactiver une fois termine. Cf. le
// commentaire de _cvPdfMiseEnPageEnCours plus haut pour le detail du bug
// que ceci corrige.
'function _pdfAjusterMiseEnPage() {' +
'  if (_cvPdfMiseEnPageEnCours) { return; }' +
'  _cvPdfMiseEnPageEnCours = true;' +
'  var boutonMEP = document.getElementById("btnMiseEnPage");' +
'  boutonMEP.disabled = true;' +
'  _pdfAfficherMessageMiseEnPage("Calcul en cours...");' +
'  setTimeout(function () {' +
'    try {' +
'      _pdfAjusterMiseEnPageCalcul();' +
'    } finally {' +
'      boutonMEP.disabled = false;' +
'      _cvPdfMiseEnPageEnCours = false;' +
'    }' +
'  }, 10);' +
'}' +
// TACHE (chantier "remplissage automatique par defaut", Partie C) : PREMIER
// levier de contenu reel cote PDF (bonus de capacites par rubrique --
// loisirs/certifications/formations/langues/engagements/competences
// comportementales) -- le PDF n\'avait jusqu\'ici AUCUNE capacite d\'ajout de
// contenu, seulement une mise a l\'echelle cosmetique (police/colonnes,
// voir plus haut). Reutilise directement reglagesProjetXXL.bonusCapacites
// (window.parent.etatApercuInline.cv, le MEME etat que le Word -- voir
// cvPdfDonnees.js:58-67, qui le lit deja pour construire le CV) : mutation
// PARTAGEE entre PDF et Word par conception deja existante de l\'appli
// ("le contenu doit etre identique entre Word et PDF", cvPdfDonnees.js),
// jamais un risque nouveau. Meme principe EXACT que
// essayerBonusCapaciteRubriqueSiPossible (js/app.js) -- incremente UNE
// rubrique a la fois, mesure REELLEMENT (comme le reste du PDF, synchrone,
// aucun aller-retour asynchrone necessaire ici contrairement au Word),
// verifie que le contenu affiche a VRAIMENT change (jamais un "succes"
// fictif qui ne revele rien de plus), revert immediat si ca deborde ou si
// rien de nouveau n\'apparait. Construit et teste un levier a la fois
// (approche incrementale) -- voir _pdfEssayerMissionsSupplementaires()
// juste en dessous (2e levier) et le recours au regroupement d\'experiences
// (3e levier, Partie A) dans _pdfAjusterMiseEnPageCalcul() plus bas.
'function _pdfEssayerCroissanceContenu() {' +
'  var win = window.parent;' +
'  var etatCv = win.etatApercuInline && win.etatApercuInline.cv;' +
'  if (!etatCv || !etatCv.reglagesProjetXXL || typeof win.capaciteBaseXXLPourFormat !== "function") { return []; }' +
'  var reglages = etatCv.reglagesProjetXXL;' +
'  var formatPage = document.getElementById("regFormatCV").value;' +
// TACHE (meme raison que Word, js/app.js essayerToutesRubriquesBonusSiPossible) :
// A4 Integral n\'a PAS de plafond sur ces rubriques (deja illimitees par
// defaut, composeurComposition.js) -- tenter ce bonus ici REMPLACERAIT cet
// "illimite" par un plafond artificiellement bas, jamais l\'inverse.
'  if (formatPage === "A4-integral") { return []; }' +
'  var dossierReel = win.dossier || {};' +
'  var estEssentiel = (formatPage === "A4-essentiel");' +
'  var totalCompetencesPersonnelles = estEssentiel' +
'    ? ((typeof win.savoirFaireActuels === "function" ? win.savoirFaireActuels().length : 0) +' +
'       (typeof win.savoirEtreActuels === "function" ? win.savoirEtreActuels().length : 0) +' +
'       (typeof win.obtenirSavoirs === "function" ? win.obtenirSavoirs().length : 0) +' +
'       (dossierReel.competencesPersonnelles || []).length)' +
'    : (dossierReel.competencesPersonnelles || []).length;' +
'  var rubriques = [' +
'    ["competencesPersonnelles", totalCompetencesPersonnelles],' +
'    ["loisirs", (dossierReel.loisirs || []).length],' +
'    ["certifications", (dossierReel.certifications || []).length],' +
'    ["formations", (dossierReel.formations || []).length],' +
'    ["langues", (dossierReel.langues || []).length],' +
'    ["engagements", (dossierReel.engagements || []).length]' +
'  ];' +
'  var labels = {' +
'    competencesPersonnelles: "compétence(s) comportementale(s)", loisirs: "loisir(s)",' +
'    certifications: "certification(s)", formations: "formation(s)", langues: "langue(s)", engagements: "engagement(s)"' +
'  };' +
'  var hauteurCible = HAUTEUR_CIBLE_PX * _pdfMaxPagesAcceptable();' +
'  var messages = [];' +
'  rubriques.forEach(function (paire) {' +
'    var cle = paire[0], totalDisponible = paire[1];' +
'    var base = win.capaciteBaseXXLPourFormat(formatPage, cle) || 0;' +
'    reglages.bonusCapacites[cle] = 0;' +
'    while (base + reglages.bonusCapacites[cle] < totalDisponible) {' +
'      var conteneur = document.getElementById("conteneurPage");' +
'      var contenuAvant = conteneur ? conteneur.innerHTML : null;' +
'      var candidat = reglages.bonusCapacites[cle] + 1;' +
'      reglages.bonusCapacites[cle] = candidat;' +
'      var hauteurCandidate = _pdfRafraichirEtMesurer();' +
'      var conteneurApres = document.getElementById("conteneurPage");' +
'      var contenuApres = conteneurApres ? conteneurApres.innerHTML : null;' +
'      if (hauteurCandidate > hauteurCible + 2 || (contenuAvant !== null && contenuApres !== null && contenuApres === contenuAvant)) {' +
'        reglages.bonusCapacites[cle] = candidat - 1;' +
'        _pdfRafraichirEtMesurer();' +
'        break;' +
'      }' +
'    }' +
'    if (reglages.bonusCapacites[cle] > 0) {' +
'      messages.push(reglages.bonusCapacites[cle] + " " + (labels[cle] || cle) + " supplémentaire(s) affichée(s)");' +
'    }' +
'  });' +
'  return messages;' +
'}' +
// TACHE (chantier "remplissage automatique par defaut", Partie C -- 2e
// levier) : meme principe EXACT que essayerMissionsSupplementairesSiPossible
// (js/app.js) -- augmente reglagesProjetXXL.missionsBonus (le plafond de
// lignes de mission affichees par experience, composeurComposition.js) UNE
// unite a la fois, jusqu\'a 5 maximum, avec mesure REELLE + verification
// que le contenu affiche a VRAIMENT change a chaque pas (jamais un "succes"
// fictif). Sans effet en A4 Integral (plafond deja fixe a 10, jamais
// ajuste par ce bonus -- meme exclusion que le Word), inutile de le
// tenter dans ce cas.
'function _pdfEssayerMissionsSupplementaires() {' +
'  var win = window.parent;' +
'  var etatCv = win.etatApercuInline && win.etatApercuInline.cv;' +
'  if (!etatCv || !etatCv.reglagesProjetXXL) { return []; }' +
'  var reglages = etatCv.reglagesProjetXXL;' +
'  var formatPage = document.getElementById("regFormatCV").value;' +
'  if (formatPage === "A4-integral") { return []; }' +
'  reglages.missionsBonus = 0;' +
'  var hauteurCible = HAUTEUR_CIBLE_PX * _pdfMaxPagesAcceptable();' +
'  while (reglages.missionsBonus < 5) {' +
'    var conteneur = document.getElementById("conteneurPage");' +
'    var contenuAvant = conteneur ? conteneur.innerHTML : null;' +
'    var candidat = reglages.missionsBonus + 1;' +
'    reglages.missionsBonus = candidat;' +
'    var hauteurCandidate = _pdfRafraichirEtMesurer();' +
'    var conteneurApres = document.getElementById("conteneurPage");' +
'    var contenuApres = conteneurApres ? conteneurApres.innerHTML : null;' +
'    if (hauteurCandidate > hauteurCible + 2 || (contenuAvant !== null && contenuApres !== null && contenuApres === contenuAvant)) {' +
'      reglages.missionsBonus = candidat - 1;' +
'      _pdfRafraichirEtMesurer();' +
'      break;' +
'    }' +
'  }' +
'  return reglages.missionsBonus > 0 ? [reglages.missionsBonus + " ligne(s) de mission en plus"] : [];' +
'}' +
// TACHE (chantier "remplissage automatique par defaut", Partie C -- 3e et
// dernier levier, reutilise la Partie A/"experiencesRetenues") : active la
// case "Mettre en avant + regrouper" (#regRegroupementActif) SEULEMENT si
// elle n\'est pas deja cochee -- jamais touchee si elle l\'est deja (choix
// manuel de la personne, jamais ecrase, meme philosophie EXACTE que
// _regroupementChoisiManuellement cote Word). Comme elle demarre forcement
// a false ici (garde ci-dessous), la repasser a false en cas d\'echec ne
// fait que restaurer l\'etat de depart, jamais un choix manuel efface.
'function _pdfEssayerRegroupementExperiences() {' +
'  var win = window.parent;' +
'  var checkbox = document.getElementById("regRegroupementActif");' +
'  if (!checkbox || checkbox.checked) { return []; }' +
'  var recoReg = (win.dossier && win.dossier.ia && win.dossier.ia.cv && win.dossier.ia.cv.recommandations && win.dossier.ia.cv.recommandations.regroupementExperiences) || {};' +
'  var experiencesRetenues = recoReg.experiencesRetenues || [];' +
'  var utilisable = experiencesRetenues.some(function (e) { return (e.type === "professionnelle" && e.poste) || (e.type === "personnelle" && e.intitule); }) || (recoReg.groupes || []).length > 0;' +
'  if (!utilisable) { return []; }' +
'  var hauteurCible = HAUTEUR_CIBLE_PX * _pdfMaxPagesAcceptable();' +
'  var conteneur = document.getElementById("conteneurPage");' +
'  var contenuAvant = conteneur ? conteneur.innerHTML : null;' +
'  checkbox.checked = true;' +
'  var hauteurCandidate = _pdfRafraichirEtMesurer();' +
'  var conteneurApres = document.getElementById("conteneurPage");' +
'  var contenuApres = conteneurApres ? conteneurApres.innerHTML : null;' +
'  if (hauteurCandidate > hauteurCible + 2 || (contenuAvant !== null && contenuApres !== null && contenuApres === contenuAvant)) {' +
'    checkbox.checked = false;' +
'    _pdfRafraichirEtMesurer();' +
'    return [];' +
'  }' +
'  return ["regroupement des expériences appliqué"];' +
'}' +
'function _pdfAjusterMiseEnPageCalcul() {' +
// TACHE (chantier "remplissage automatique par defaut", Partie C -- meme
// raisonnement EXACT que le Word, js/app.js activerMiseEnFormeUltimeXXL,
// qui remet ses bonus a zero INCONDITIONNELLEMENT en tout debut de
// cascade) : jamais un bonus de capacite laisse actif d\'un clic precedent
// si CE clic-ci part sur un contenu/reglage differents (ex. la page
// deborde desormais alors qu\'un bonus avait ete ajoute lors d\'un clic
// precedent ou elle etait encore vide) -- _pdfEssayerCroissanceContenu()
// (plus haut) ne reinitialise chaque cle QUE si elle est effectivement
// retentee, jamais si la branche "trop de contenu" est empruntee cette
// fois-ci -- reset EXPLICITE ici, avant meme la mesure, pour ne jamais
// dependre de la branche empruntee.' +
'  if (window.parent && window.parent.etatApercuInline && window.parent.etatApercuInline.cv && window.parent.etatApercuInline.cv.reglagesProjetXXL) {' +
'    var _reglagesPdf = window.parent.etatApercuInline.cv.reglagesProjetXXL;' +
'    if (_reglagesPdf.bonusCapacites) { Object.keys(_reglagesPdf.bonusCapacites).forEach(function (cle) { _reglagesPdf.bonusCapacites[cle] = 0; }); }' +
'    _reglagesPdf.missionsBonus = 0;' +
'  }' +
'  _cvPdfEchelle = 1;' +
// TACHE (retour utilisateur : "les deux [en-tete et corps] grandissent
// ensemble, mais en commencant toujours par l'en-tete") : repart d'un
// etat neutre pour l'en-tete aussi a chaque clic (meme logique que
// _cvPdfEchelle = 1 juste au-dessus) -- jamais un agrandissement qui se
// cumule silencieusement d'un clic "Mise en page" a l'autre.
'  ["entete-nom", "entete-metier", "entete-accroche", "entete-coordonnees"].forEach(function (cle) { delete _cvPdfEchellesRubriques[cle]; });' +
// TACHE (retour utilisateur explicite : "d'abord on va equilibrer,
// agrandir, voir si ca tient, et apres on retrecit si necessaire, mais on
// ne va jamais commencer par retrecir") : reequilibrage des colonnes
// AVANT toute mesure/reduction de police -- la reduction globale
// (boucle ci-dessous) ne doit intervenir qu\'en dernier recours, une fois
// le contenu deja reparti au mieux entre les 2 colonnes.
'  _pdfRafraichir();' +
'  _pdfEssayerRequilibrageColonnes();' +
'  var hauteurCible = HAUTEUR_CIBLE_PX * _pdfMaxPagesAcceptable();' +
'  var hauteur = _pdfRafraichirEtMesurer();' +
'  var message;' +
'  if (hauteur > hauteurCible + 2) {' +
// TACHE (retour utilisateur : "si jamais il faut gagner de la place, on
// sait par quoi commencer" -- l'en-tete redonne D'ABORD ce qu'il a
// eventuellement gagne, avant que le corps ne descende sous sa taille
// normale) : phase 1, en-tete seul. Reduire ne peut jamais CREER de
// chevauchement (un texte plus petit ne deborde jamais plus qu'un texte
// plus grand) -- aucune verification supplementaire necessaire ici,
// contrairement a la phase de croissance plus bas.
'    while (_pdfAjusterEchelleEnteteEnsemble(-0.05) && hauteur > hauteurCible + 2) {' +
'      hauteur = _pdfRafraichirEtMesurer();' +
'    }' +
'    while (_cvPdfEchelle > _PDF_ECHELLE_MIN && hauteur > hauteurCible + 2) {' +
'      _cvPdfEchelle = Math.max(_PDF_ECHELLE_MIN, Math.round((_cvPdfEchelle - 0.05) * 100) / 100);' +
'      hauteur = _pdfRafraichirEtMesurer();' +
'    }' +
'    _pdfGarantirEnteteAuMoinsAussiGrandeQueCorps();' +
'    message = (hauteur > hauteurCible + 2)' +
'      ? "Resserré au maximum (en-tête et corps, taille " + _pdfAfficherTaillePx(_cvPdfEchelle) + "px) mais dépasse encore un peu la page -- essayez de réduire le contenu."' +
'      : "Ajusté pour tenir (corps " + _pdfAfficherTaillePx(_cvPdfEchelle) + "px).";' +
'  } else if (hauteur < HAUTEUR_CIBLE_PX * 0.82) {' +
// TACHE (retour utilisateur : "on commence par l'en-tete pour grandir et
// apres par le corps de texte" + "je prefere avoir les deux qui restent a
// peu pres equivalentes, peut-etre la tete un peu plus grande") : phase 1,
// en-tete seul -- s'arrete des que la cible est atteinte, que le plafond
// 1.4 est atteint (_pdfAjusterEchelleEnteteEnsemble renvoie alors false),
// ou qu'un chevauchement/debordement apparaitrait (revert immediat de CE
// seul pas, jamais laisse a l'ecran).' +
'    var enteteEncoreDisponible = true;' +
'    while (enteteEncoreDisponible && hauteur < HAUTEUR_CIBLE_PX * 0.82) {' +
'      var avantEntete = _cvPdfEchellesRubriques["entete-nom"] || 1;' +
'      enteteEncoreDisponible = _pdfAjusterEchelleEnteteEnsemble(0.05);' +
'      if (!enteteEncoreDisponible) { break; }' +
'      hauteur = _pdfRafraichirEtMesurer();' +
'      if (hauteur > HAUTEUR_CIBLE_PX + 2 || _pdfEnteteProblematiqueApresCroissance()) {' +
'        ["entete-nom", "entete-metier", "entete-accroche", "entete-coordonnees"].forEach(function (cle) { _cvPdfEchellesRubriques[cle] = avantEntete; });' +
'        hauteur = _pdfRafraichirEtMesurer();' +
'        break;' +
'      }' +
'    }' +
// Phase 2, corps -- ne prend le relais que si l'en-tete etait deja a son
// plafond (ou a du s'arreter pour eviter un chevauchement) et que la
// page a encore besoin d'etre remplie. Jamais plafonne artificiellement
// par la taille de l'en-tete ici (remplir la page reste prioritaire sur
// la preference esthetique) -- si le corps finit par depasser l'en-tete,
// _pdfGarantirEnteteAuMoinsAussiGrandeQueCorps() ci-dessous tentera de
// rattraper l'en-tete apres coup, en toute securite (verifie a nouveau
// le chevauchement avant de garder ce rattrapage).
'    var precedenteCorps = _cvPdfEchelle;' +
'    while (_cvPdfEchelle < _PDF_ECHELLE_MAX && hauteur < HAUTEUR_CIBLE_PX * 0.82) {' +
'      precedenteCorps = _cvPdfEchelle;' +
'      _cvPdfEchelle = Math.min(_PDF_ECHELLE_MAX, Math.round((_cvPdfEchelle + 0.05) * 100) / 100);' +
'      hauteur = _pdfRafraichirEtMesurer();' +
'      if (hauteur > HAUTEUR_CIBLE_PX + 2) { _cvPdfEchelle = precedenteCorps; _pdfRafraichirEtMesurer(); break; }' +
'      if (_cvPdfEchelle >= _PDF_ECHELLE_MAX) { break; }' +
'    }' +
    // TACHE (retour utilisateur, bug reel confirme en testant avec un CV
    // tres court : "j'ai le message me disant que ca a ete fait pour que
    // le contenu tienne sur une page" -- mais RIEN ne signalait que la
    // page restait tres incomplete meme apres avoir agrandi au maximum
    // (14px), contrairement a la branche "trop de contenu" ci-dessus qui,
    // elle, avait deja ses 2 messages distincts reussite/echec). Meme
    // seuil (0.82) que celui qui a fait entrer dans cette branche --
    // toujours pas atteint apres agrandissement max = echec honnete,
    // jamais un message de succes trompeur.
'    _pdfGarantirEnteteAuMoinsAussiGrandeQueCorps();' +
// TACHE (point 19, "remplissage automatique par defaut", Partie C -- le
// PDF n'avait jusqu\'ici aucune capacite d\'ajout de CONTENU, seulement une
// mise a l\'echelle cosmetique) : une fois la police/en-tete deja au
// plafond sans remplir la cible, tente d\'ajouter du contenu REEL, dans le
// MEME ordre que le Word (js/app.js, essayerPalier) -- missions
// supplementaires d\'abord (revele du contenu deja ecrit mais tronque),
// bonus de capacites par rubrique ensuite (loisirs/certifications/
// formations/langues/engagements/competences comportementales) -- jamais
// tente avant que la croissance cosmetique n\'ait deja fait tout ce
// qu\'elle pouvait, pour rester un ajout additif au mecanisme deja teste,
// jamais une reecriture de son ordre existant. Chaque levier re-mesure
// avant de decider si le suivant est encore necessaire.' +
'    var messagesContenuAjoute = [];' +
'    if (hauteur < HAUTEUR_CIBLE_PX * 0.82) {' +
'      messagesContenuAjoute = messagesContenuAjoute.concat(_pdfEssayerMissionsSupplementaires());' +
'      hauteur = _pdfRafraichirEtMesurer();' +
'    }' +
'    if (hauteur < HAUTEUR_CIBLE_PX * 0.82) {' +
'      messagesContenuAjoute = messagesContenuAjoute.concat(_pdfEssayerCroissanceContenu());' +
'      hauteur = _pdfRafraichirEtMesurer();' +
'    }' +
'    if (hauteur < HAUTEUR_CIBLE_PX * 0.82) {' +
'      messagesContenuAjoute = messagesContenuAjoute.concat(_pdfEssayerRegroupementExperiences());' +
'      hauteur = _pdfRafraichirEtMesurer();' +
'    }' +
'    message = (hauteur < HAUTEUR_CIBLE_PX * 0.82)' +
'      ? "Agrandi au maximum (en-tête et corps, taille " + _pdfAfficherTaillePx(_cvPdfEchelle) + "px" + (messagesContenuAjoute.length ? (", " + messagesContenuAjoute.join(", ")) : "") + ") mais la page reste incomplète -- ajoutez du contenu (missions, rubriques) pour mieux la remplir."' +
'      : (messagesContenuAjoute.length' +
'        ? "Élargi pour mieux remplir la page (" + messagesContenuAjoute.join(", ") + ")."' +
'        : "Élargi pour mieux remplir la page (en-tête et corps).");' +
'  } else {' +
'    message = "La mise en page actuelle tient déjà bien sur 1 page.";' +
'  }' +
'  _pdfAfficherMessageMiseEnPage(message);' +
'}' +
'document.getElementById("btnMiseEnPage").addEventListener("click", _pdfAjusterMiseEnPage);' +
// TACHE (retour utilisateur : "le bouton Mise en page doit aussi marcher
// pour le Mini CV A5") : version DEDIEE, plus simple que _pdfAjusterMiseEnPage
// ci-dessus (pas de croissance separee en-tete/corps -- l'A5 n'a pas de
// systeme de position libre pour l'en-tete, juste un unique bloc identite
// fixe) -- un seul palier de croissance/reduction sur TOUTE la page,
// meme principe de mesure REELLE (neutralise min-height, mesure, restaure)
// que _pdfMesurerHauteurPage (A4) juste au-dessus dans ce fichier.
// TACHE (2 orientations, 2 hauteurs cibles differentes) : .page-a5 est
// 210mm de haut en Portrait, 148mm en Paysage (cvPdfTemplateA5.js,
// hauteurPage) -- jamais une seule constante comme HAUTEUR_CIBLE_PX (A4,
// toujours 297mm) : lue ici sur le format actuellement selectionne.
'function _pdfMesurerHauteurPageA5() {' +
'  var page = document.querySelector("#conteneurPage .page-a5");' +
'  if (!page) { return 0; }' +
'  var minHeightOriginal = page.style.minHeight;' +
'  page.style.minHeight = "0";' +
'  var hauteur = page.getBoundingClientRect().height;' +
'  page.style.minHeight = minHeightOriginal;' +
'  return hauteur;' +
'}' +
'function _pdfHauteurCibleA5Px() {' +
'  var paysage = document.getElementById("regFormatCV").value === "A5-paysage";' +
'  return (paysage ? 148 : 210) * PX_PAR_MM;' +
'}' +
// Meme garde disabled+differe que _pdfAjusterMiseEnPage() plus haut (voir
// son commentaire pour le detail du bug corrige).
'function _pdfAjusterMiseEnPageA5() {' +
'  if (_cvPdfMiseEnPageA5EnCours) { return; }' +
'  _cvPdfMiseEnPageA5EnCours = true;' +
'  var boutonMEPA5 = document.getElementById("btnMiseEnPageA5");' +
'  boutonMEPA5.disabled = true;' +
'  document.getElementById("messageMiseEnPageA5").textContent = "Calcul en cours...";' +
'  setTimeout(function () {' +
'    try {' +
'      _pdfAjusterMiseEnPageA5Calcul();' +
'    } finally {' +
'      boutonMEPA5.disabled = false;' +
'      _cvPdfMiseEnPageA5EnCours = false;' +
'    }' +
'  }, 10);' +
'}' +
'function _pdfAjusterMiseEnPageA5Calcul() {' +
'  _cvPdfEchelle = 1;' +
'  _pdfRafraichir();' +
'  var hauteurCibleA5 = _pdfHauteurCibleA5Px();' +
'  var hauteur = _pdfMesurerHauteurPageA5();' +
'  var message;' +
'  if (hauteur > hauteurCibleA5 + 2) {' +
'    while (_cvPdfEchelle > _PDF_ECHELLE_MIN && hauteur > hauteurCibleA5 + 2) {' +
'      _cvPdfEchelle = Math.max(_PDF_ECHELLE_MIN, Math.round((_cvPdfEchelle - 0.05) * 100) / 100);' +
'      _pdfRafraichir();' +
'      hauteur = _pdfMesurerHauteurPageA5();' +
'    }' +
'    message = (hauteur > hauteurCibleA5 + 2)' +
'      ? "Resserré au maximum (taille " + _pdfAfficherTaillePx(_cvPdfEchelle) + "px) mais dépasse encore un peu -- réduisez le contenu."' +
'      : "Resserré pour tenir (taille " + _pdfAfficherTaillePx(_cvPdfEchelle) + "px).";' +
'  } else if (hauteur < hauteurCibleA5 * 0.82) {' +
'    while (_cvPdfEchelle < _PDF_ECHELLE_MAX && hauteur < hauteurCibleA5 * 0.97) {' +
'      var precedente = _cvPdfEchelle;' +
'      _cvPdfEchelle = Math.min(_PDF_ECHELLE_MAX, Math.round((_cvPdfEchelle + 0.05) * 100) / 100);' +
'      _pdfRafraichir();' +
'      hauteur = _pdfMesurerHauteurPageA5();' +
'      if (hauteur > hauteurCibleA5 + 2) { _cvPdfEchelle = precedente; _pdfRafraichir(); break; }' +
'    }' +
'    message = (hauteur < hauteurCibleA5 * 0.82)' +
'      ? "Agrandi au maximum (taille " + _pdfAfficherTaillePx(_cvPdfEchelle) + "px) mais la page reste incomplète -- ajoutez du contenu pour mieux la remplir."' +
'      : "Agrandi pour mieux remplir la page (taille " + _pdfAfficherTaillePx(_cvPdfEchelle) + "px).";' +
'  } else {' +
'    message = "La mise en page actuelle tient déjà bien.";' +
'  }' +
'  document.getElementById("messageMiseEnPageA5").textContent = message;' +
'}' +
'document.getElementById("btnMiseEnPageA5").addEventListener("click", _pdfAjusterMiseEnPageA5);' +
// TACHE (retour utilisateur : bouton "CV Sobre" cote PDF, meme
// comportement que appliquerSobreXXL() cote Word js/app.js:17049-17079)
// : force les VRAIS controles du panneau (relus ensuite normalement par
// _pdfLireOptions()/_pdfRafraichir(), jamais un chemin de rendu a part).
// Uniquement les valeurs -- ne coche/decoche jamais regSobreActif
// lui-meme (fait par l\'appelant juste apres, seul endroit qui decide de
// l\'etat actif/inactif).
'function _pdfAppliquerSobrePdf() {' +
// TACHE (retour utilisateur, bug reel confirme : "je desactive Sobre, le
// CV ne redevient pas comme avant") : capture ICI, avant tout ecrasement,
// les valeurs REELLES des controles sur le point d'etre forces -- sans
// ce snapshot, elles etaient definitivement perdues (checked/value
// ecrases directement sur les elements DOM, jamais recuperables ensuite).
// Uniquement si aucune activation Sobre n'est deja en cours (jamais
// ecrase un snapshot "avant Sobre" par un snapshot pris... pendant Sobre).
'  if (!_cvPdfReglagesAvantSobre) {' +
'    _cvPdfReglagesAvantSobre = {' +
'      icones: document.getElementById("regIcones").checked,' +
'      styleCompetences: document.getElementById("regStyleCompetences").value,' +
'      coinsArrondis: document.getElementById("regCoinsArrondis").checked,' +
'      styleTitres: document.getElementById("regStyleTitres").value,' +
'      fondColonnes: document.getElementById("regFondColonnes").value,' +
'      degradeColonnes: document.getElementById("regDegradeColonnes").value,' +
'      degradeBandeau: document.getElementById("regDegradeBandeau").value,' +
'      bandeauEnTete: document.getElementById("regBandeauEnTete").checked,' +
'      formeColonnes: document.getElementById("regFormeColonnes").value,' +
'      formeEnTete: document.getElementById("regFormeEnTete").value,' +
'      styleBordures: document.getElementById("regStyleBordures").value,' +
'      bandeauCompetencesCles: document.getElementById("regBandeauCompetencesCles").checked,' +
'      lectureGuidee: document.getElementById("regLectureGuidee").checked' +
'    };' +
'  }' +
'  document.getElementById("regIcones").checked = false;' +
'  document.getElementById("regStyleCompetences").value = "texte";' +
'  document.getElementById("regCoinsArrondis").checked = false;' +
'  document.getElementById("regStyleTitres").value = "souligne";' +
'  document.getElementById("regDegradeBandeau").value = "aucun";' +
'  document.getElementById("regFormeColonnes").value = "rectangle";' +
'  document.getElementById("regFormeEnTete").value = "rectangle";' +
'  document.getElementById("regStyleBordures").value = "fine";' +
'  document.getElementById("regBandeauCompetencesCles").checked = false;' +
'  document.getElementById("regLectureGuidee").checked = false;' +
// TACHE (retour utilisateur, repete plusieurs fois : "la structure ne
// change pas, tout ce qui change c'est le style -- si c'est 2 colonnes et
// j'active Sobre, ca reste 2 colonnes") : regColonnes/_cvPdfOrdrePersonnalise
// ne sont PLUS touches ici (ancien comportement : force a 1 colonne + ordre
// "recruteur" aplati -- voir git blame pour l'ancienne logique, retiree sur
// demande explicite). _pdfTirerVarianteSobre() choisit seulement OU la
// couleur pale ira (colonne/bandeau/aucune), jamais le nombre de colonnes.
'  _pdfTirerVarianteSobre();' +
  // TACHE (meme retour utilisateur : "je ne veux pas voir du tout des
  // pastilles") : un override PAR RUBRIQUE (bandeauDisponibilite/
  // competencesCles) prime toujours sur regStyleCompetences ci-dessus
  // (voir _pdfStylePuceEffectif, cvPdfTemplateA4.js) -- jamais reinitialise
  // par les lignes precedentes seules, meme correctif que cote Word.
'  _cvPdfStylesPuceRubriques = {};' +
'}' +
// TACHE (retour utilisateur : "Sobre ne veut pas dire zero couleur") :
// tiree UNE SEULE FOIS a l'activation (_pdfAppliquerSobrePdf ci-dessus) et
// a chaque nouveau tirage "Style aleatoire" pendant que Sobre reste actif
// (_pdfGenererStyleAleatoire plus bas) -- jamais a chaque _pdfRafraichir(),
// qui ferait clignoter la couleur a chaque reglage touche. 2 colonnes :
// jamais "aucune" (retour utilisateur explicite : pas de CV entierement
// sans couleur des qu'il y a 2 colonnes). 1 colonne : bandeau ou rien.
'function _pdfTirerVarianteSobre() {' +
'  var deuxColonnes = document.getElementById("regColonnes").value !== "1";' +
'  _cvPdfSobreVariante = deuxColonnes ? _pdfChoixAleatoire(["colonne", "bandeau"]) : _pdfChoixAleatoire(["bandeau", "aucune"]);' +
'}' +
// TACHE (retour utilisateur, bug reel confirme : "je desactive Sobre, le
// CV ne redevient pas comme avant") : restaure le snapshot pris par
// _pdfAppliquerSobrePdf() (plus haut) -- jamais l\'ordre des rubriques
// (_cvPdfOrdrePersonnalise/regColonnes), qui ne sont plus touches par
// Sobre du tout (voir plus haut), rien a restaurer sur ces 2 champs.
'function _pdfAnnulerSobrePdf() {' +
'  if (!_cvPdfReglagesAvantSobre) { return; }' +
'  var s = _cvPdfReglagesAvantSobre;' +
'  document.getElementById("regIcones").checked = s.icones;' +
'  document.getElementById("regStyleCompetences").value = s.styleCompetences;' +
'  document.getElementById("regCoinsArrondis").checked = s.coinsArrondis;' +
'  document.getElementById("regStyleTitres").value = s.styleTitres;' +
'  document.getElementById("regFondColonnes").value = s.fondColonnes;' +
'  document.getElementById("regDegradeColonnes").value = s.degradeColonnes;' +
'  document.getElementById("regDegradeBandeau").value = s.degradeBandeau;' +
'  document.getElementById("regBandeauEnTete").checked = s.bandeauEnTete;' +
'  document.getElementById("regFormeColonnes").value = s.formeColonnes;' +
'  document.getElementById("regFormeEnTete").value = s.formeEnTete;' +
'  document.getElementById("regStyleBordures").value = s.styleBordures;' +
'  document.getElementById("regBandeauCompetencesCles").checked = s.bandeauCompetencesCles;' +
'  document.getElementById("regLectureGuidee").checked = s.lectureGuidee;' +
'  _cvPdfSobreVariante = null;' +
'  _cvPdfReglagesAvantSobre = null;' +
'}' +
'function _pdfMettreAJourBoutonSobre() {' +
'  var actif = document.getElementById("regSobreActif").checked;' +
'  document.getElementById("btnSobrePdf").classList.toggle("sobre-actif", actif);' +
'  document.getElementById("libelleSobrePdf").textContent = actif ? "CV Sobre ✓" : "CV Sobre";' +
'}' +
'document.getElementById("btnSobrePdf").addEventListener("click", function () {' +
'  var caseSobre = document.getElementById("regSobreActif");' +
'  caseSobre.checked = !caseSobre.checked;' +
// TACHE (chantier "CV Créatif", exclusivite mutuelle decidee avec
// l\'utilisateur) : activer Sobre alors que Créatif est deja actif
// desactive Créatif D\'ABORD (restauration complete de son snapshot) --
// jamais les 2 filtres actifs en meme temps, jamais un simple ecrasement
// silencieux de l\'un par l\'autre au rendu.
'  if (caseSobre.checked && document.getElementById("regCreatifActif").checked) {' +
'    document.getElementById("regCreatifActif").checked = false;' +
'    _pdfAnnulerCreatifPdf();' +
'    _pdfMettreAJourBoutonCreatif();' +
'  }' +
'  if (caseSobre.checked) { _pdfAppliquerSobrePdf(); } else { _pdfAnnulerSobrePdf(); }' +
'  _pdfMettreAJourBoutonSobre();' +
'  _pdfRafraichir();' +
'});' +
// TACHE (chantier "CV Créatif") : oppose exact de btnSobrePdf juste
// au-dessus, meme structure (capture snapshot -> ecrase les VRAIS
// controles -> restaure a la desactivation), jamais un chemin de rendu a
// part -- _pdfLireOptions() relit toujours les memes controles ensuite.
// TACHE (retour utilisateur explicite : "quand j\'active CV Créatif, il
// reste active -- je ne veux pas qu\'il change tout seul") : le tirage
// n\'a lieu qu\'a la toute PREMIERE activation (variante encore nulle) --
// desactiver/reactiver ou re-cliquer Créatif ne re-tire plus rien, le
// modele choisi reste stable jusqu\'a une desactivation explicite ou un
// clic sur "Style aleatoire" (voir _pdfProposerAutreModeleCreatif plus
// bas, seul chemin autorise pour changer de modele une fois actif).
'function _pdfAppliquerCreatifPdf() {' +
'  if (!_cvPdfReglagesAvantCreatif) {' +
'    var _etatAvant = {};' +
'    Object.keys(_PDF_CREATIF_RECETTES.sidebarVague).forEach(function (champ) {' +
'      if (champ === "pilluleExperiences") { return; }' +
'      var el = document.getElementById(_pdfIdControlePour(champ));' +
'      if (!el) { return; }' +
'      _etatAvant[champ] = (el.type === "checkbox") ? el.checked : el.value;' +
'    });' +
'    _etatAvant.ordrePersonnalise = _cvPdfOrdrePersonnalise;' +
'    _cvPdfReglagesAvantCreatif = _etatAvant;' +
'  }' +
'  _cvPdfCreatifVariante = _cvPdfCreatifVariante || _pdfChoixAleatoire(Object.keys(_PDF_CREATIF_RECETTES));' +
'  _pdfAppliquerRecetteCreatifDOM(_cvPdfCreatifVariante);' +
'}' +
// TACHE (meme retour utilisateur) : seul chemin qui change de modele une
// fois Créatif deja actif -- jamais un champ a la fois, toujours la
// recette COMPLETE d\'un AUTRE modele (exclu le modele actuel pour que
// chaque clic propose vraiment quelque chose de different, tant qu\'il
// existe au moins 2 modeles). Snapshot deja pris par _pdfAppliquerCreatifPdf(),
// jamais repris ici (on reste dans "Créatif actif", pas de retour a
// l\'etat d\'avant).
'function _pdfProposerAutreModeleCreatif() {' +
'  var variantes = Object.keys(_PDF_CREATIF_RECETTES);' +
'  var autres = variantes.filter(function (v) { return v !== _cvPdfCreatifVariante; });' +
'  _cvPdfCreatifVariante = _pdfChoixAleatoire(autres.length ? autres : variantes);' +
'  _pdfAppliquerRecetteCreatifDOM(_cvPdfCreatifVariante);' +
'  _pdfAfficherMessageMiseEnPage("");' +
'  _pdfRafraichir();' +
'  _pdfEssayerRequilibrageColonnes();' +
'}' +
'function _pdfAnnulerCreatifPdf() {' +
'  if (!_cvPdfReglagesAvantCreatif) { return; }' +
'  var s = _cvPdfReglagesAvantCreatif;' +
'  Object.keys(s).forEach(function (champ) {' +
'    if (champ === "ordrePersonnalise") { return; }' +
'    var el = document.getElementById(_pdfIdControlePour(champ));' +
'    if (!el) { return; }' +
'    if (el.type === "checkbox") { el.checked = s[champ]; } else { el.value = s[champ]; }' +
'  });' +
'  _cvPdfOrdrePersonnalise = s.ordrePersonnalise;' +
'  _cvPdfCreatifVariante = null;' +
'  _cvPdfReglagesAvantCreatif = null;' +
'}' +
'function _pdfMettreAJourBoutonCreatif() {' +
'  var actif = document.getElementById("regCreatifActif").checked;' +
'  document.getElementById("btnCreatifPdf").classList.toggle("creatif-actif", actif);' +
'  document.getElementById("libelleCreatifPdf").textContent = actif ? "CV Créatif ✓" : "CV Créatif";' +
'}' +
'document.getElementById("btnCreatifPdf").addEventListener("click", function () {' +
'  var caseCreatif = document.getElementById("regCreatifActif");' +
'  caseCreatif.checked = !caseCreatif.checked;' +
'  if (caseCreatif.checked && document.getElementById("regSobreActif").checked) {' +
'    document.getElementById("regSobreActif").checked = false;' +
'    _pdfAnnulerSobrePdf();' +
'    _pdfMettreAJourBoutonSobre();' +
'  }' +
'  if (caseCreatif.checked) { _pdfAppliquerCreatifPdf(); } else { _pdfAnnulerCreatifPdf(); }' +
'  _pdfMettreAJourBoutonCreatif();' +
'  _pdfRafraichir();' +
'});' +
// TACHE (retour utilisateur : "CV Complet" / "CV Optimise") : contrairement
// a Sobre/Creatif (recettes de style, persistees via une case a cocher
// cachee dans .panneau-reglages), ce reglage vit directement sur
// window.parent.dossier.cvOptimiseActif -- source UNIQUE et partagee avec
// le Word (voir btnCvOptimiseXXL, js/app.js), jamais une 2e case a cocher
// locale qui pourrait se desynchroniser. _pdfMettreAJourBoutonCvOptimise()
// lit donc cet etat PARENT a chaque appel (jamais une copie locale) --
// appelee ici au clic, et aussi a la construction initiale du panneau
// (voir plus bas, meme endroit que _pdfMettreAJourBoutonCreatif/Sobre au
// premier rendu) pour refleter un etat deja actif si la personne revient
// sur cette page.
'function _pdfMettreAJourBoutonCvOptimise() {' +
'  var actif = !!(window.parent && window.parent.dossier && window.parent.dossier.cvOptimiseActif);' +
'  document.getElementById("btnCvOptimisePdf").classList.toggle("cv-optimise-actif", actif);' +
'  document.getElementById("libelleCvOptimisePdf").textContent = actif ? "CV Optimisé ✓" : "CV Complet";' +
'}' +
'document.getElementById("btnCvOptimisePdf").addEventListener("click", function () {' +
'  if (window.parent && window.parent.dossier) {' +
'    window.parent.dossier.cvOptimiseActif = !window.parent.dossier.cvOptimiseActif;' +
'  }' +
'  _pdfMettreAJourBoutonCvOptimise();' +
'  _pdfRafraichir();' +
'});' +
'_pdfMettreAJourBoutonCvOptimise();' +
// TACHE (retour utilisateur : "Mettre en avant les formations" -- meme
// principe que btnCvOptimisePdf juste au-dessus : etat de reference vit
// sur window.parent.dossier.pdfReglages.regFormationsMisesEnAvant (deja
// initialise a la construction du panneau, voir plus haut), jamais dans
// une variable locale a l\'iframe qui pourrait diverger.
'document.getElementById("regFormationsMisesEnAvant").addEventListener("change", function () {' +
'  if (window.parent && window.parent.dossier) {' +
'    if (!window.parent.dossier.pdfReglages) { window.parent.dossier.pdfReglages = {}; }' +
'    window.parent.dossier.pdfReglages.regFormationsMisesEnAvant = this.checked;' +
'  }' +
'  _pdfRafraichir();' +
'});' +
// TACHE ("Reinitialiser"/"Annuler le dernier tirage 🎲", conforts d\'usage) :
// _pdfCapturerEtat()/_pdfAppliquerEtat() lisent/ecrivent TOUS les controles
// du panneau (selects, cases, couleurs) + `_cvPdfEchelle` -- reutilisees a
// la fois pour l\'annulation (avant randomisation) et pourraient l\'etre
// pour d\'autres futurs historiques, jamais une 2e logique de lecture des
// controles (deja `_pdfLireOptions()` pour le rendu, celle-ci pour la
// sauvegarde/restauration d\'etat).
'function _pdfCapturerEtat() {' +
'  var etat = { echelle: _cvPdfEchelle };' +
'  Array.prototype.forEach.call(document.querySelectorAll(".panneau-reglages select, .panneau-reglages input[type=checkbox], .panneau-reglages input[type=color]"), function (el) {' +
'    etat[el.id] = (el.type === "checkbox") ? el.checked : el.value;' +
'  });' +
'  return etat;' +
'}' +
'function _pdfAppliquerEtat(etat) {' +
'  _cvPdfEchelle = etat.echelle;' +
'  Object.keys(etat).forEach(function (id) {' +
'    if (id === "echelle") { return; }' +
'    var el = document.getElementById(id);' +
'    if (!el) { return; }' +
'    if (el.type === "checkbox") { el.checked = etat[id]; } else { el.value = etat[id]; }' +
'  });' +
'}' +
// TACHE (retour utilisateur : "garder en memoire la mise en forme PDF") :
// variantes ETENDUES de _pdfCapturerEtat/_pdfAppliquerEtat ci-dessus,
// qui couvrent EN PLUS les 4 etats persistants hors-DOM (ordre glisse-
// depose, echelles/polices par rubrique, en-tete inversee) -- jamais
// inclus dans _pdfCapturerEtat/_pdfAppliquerEtat (reserves a "Annuler
// le dernier tirage 🎲", qui ne touche jamais a ces 4-la). Reutilisees
// pour la persistance complete sur dossier.pdfReglages (_pdfPersisterReglages
// plus bas + application au chargement de l\'iframe, fin de ce fichier).
'function _pdfCapturerEtatPersistant() {' +
'  var etat = _pdfCapturerEtat();' +
'  etat.ordrePersonnalise = _cvPdfOrdrePersonnalise;' +
// TACHE (2e modele Word Créatif) : sans ceci, rouvrir le PDF apres avoir
// active Créatif cote Word retombait TOUJOURS sur "sidebarVague" par
// defaut (_cvPdfCreatifVariante jamais persiste, donc toujours reparti de
// zero dans l\'iframe fraichement chargee) -- meme si le modele Word
// choisi correspondait au modele PDF "rubanDiagonal". Persiste desormais
// EXPLICITEMENT laquelle des 2 recettes est active, pour que les 2
// formats restent le meme modele visuel coherent (voir appliquerCreatifXXL(),
// js/app.js, qui ecrit ce meme champ dans dossier.pdfReglages).
'  etat.creatifVariante = _cvPdfCreatifVariante;' +
'  etat.echellesRubriques = _cvPdfEchellesRubriques;' +
'  etat.policesRubriques = _cvPdfPolicesRubriques;' +
'  etat.stylesPuceRubriques = _cvPdfStylesPuceRubriques;' +
'  etat.positionsEntete = _cvPdfPositionsEntete;' +
'  etat.hauteurEntete = _cvPdfHauteurEntete;' +
'  etat.stylesTexteEntete = _cvPdfStylesTexteEntete;' +
'  etat.rubriquesForceesColonne = _cvPdfRubriquesForceesColonne;' +
'  etat.textesEdites = _cvPdfTextesEdites;' +
'  return etat;' +
'}' +
'function _pdfAppliquerEtatPersistant(etat) {' +
'  _pdfAppliquerEtat(etat);' +
'  _cvPdfOrdrePersonnalise = etat.ordrePersonnalise || null;' +
'  _cvPdfCreatifVariante = etat.creatifVariante || null;' +
'  _cvPdfEchellesRubriques = etat.echellesRubriques || {};' +
'  _cvPdfPolicesRubriques = etat.policesRubriques || {};' +
'  _cvPdfStylesPuceRubriques = etat.stylesPuceRubriques || {};' +
'  _cvPdfPositionsEntete = etat.positionsEntete || {};' +
'  _cvPdfHauteurEntete = etat.hauteurEntete || null;' +
'  _cvPdfStylesTexteEntete = etat.stylesTexteEntete || {};' +
'  _cvPdfRubriquesForceesColonne = etat.rubriquesForceesColonne || {};' +
'  _cvPdfTextesEdites = etat.textesEdites || {};' +
'}' +
// window.parent.dossier (jamais window.__cvPdfDossierSource) : robuste
// a un "Recommencer" survenu cote fenetre principale pendant que cette
// iframe etait ouverte (meme raisonnement que le reste de ce fichier,
// qui appelle deja window.parent pour tout le reste).
'function _pdfPersisterReglages() {' +
'  if (window.parent && window.parent.dossier) {' +
'    window.parent.dossier.pdfReglages = _pdfCapturerEtatPersistant();' +
'  }' +
'}' +
'var _PDF_ETAT_DEFAUT = {' +
'  regFormatCV: "A4-detaille",' +
// TACHE (retour utilisateur 2026-09-15) : 35 au lieu de 50 -- la colonne
// GAUCHE recoit par convention (voir cheminPhysiqueColonneUn,
// cvPdfTemplateA4.js, decision du jour) la colonne la plus LEGERE
// (Formations/Langues/Centres d'interet...), la colonne DROITE la plus
// LOURDE ("Experience professionnelle" en general). 50/50 ignorait cette
// convention et ecrasait la colonne lourde a egalite avec la legere --
// desormais alignee des l'arrivee sur la page, sans qu'il soit necessaire
// de toucher au curseur (30-70 toujours disponible pour qui veut un autre
// equilibre).
'  regColonnes: "2", regColonnesInversees: false, regSeparateurColonnes: false, regFormeColonnes: "rectangle", regLargeurColonneGauche: "35",' +
'  regCouleurDebut: "#2f6690", regCouleurFin: "#d9e8f2", regFondColonnes: "droite", regFondColonnesEffet: "fondSeul", regDegradeColonnes: "fonce-clair",' +
'  regBandeauEnTete: true, regFormeEnTete: "rectangle", regDegradeBandeau: "fonce-clair", regBandeauDisponibilite: false, regAnneauPhoto: false,' +
'  regStyleTitres: "souligne", regLectureGuidee: false, regStyleProfessionnel: "epure", regStylePersonnel: "epure", regStyleBordures: "fine", regIcones: false, regIconesCoordonnees: false, regPolice: "segoe", regTexteFondColonnes: "blanc", regBandeauCompetencesCles: false,' +
'  regStyleCompetences: "pastille", regCouleurFondCompetences: "#e9e9e9", regCouleurTextePuces: "#1b1b1b",' +
'  regCoinsArrondis: false, regFondColonnesA5: "droite", regEnteteInverseeA5: false, regRemplirPageA5: false, regSansAccroche: false, regPositionLibreEntete: true, regLargeurAccrocheLibre: "30", regLargeurMetierLibre: "32", regFondColonnePleineHauteur: false,' +
'  regLettreJointe: false, regRegroupementActif: false, regOrdreExperiences: "pertinence", regFormatExperiences: "standard", regDispositionEntete: "3colonnes",' +
'  regSoulignerPoste: false, regItaliquePoste: false, regSoulignerDates: false, regItaliqueDates: false, regSoulignerEntreprise: false, regItaliqueEntreprise: false,' +
'  regSobreActif: false' +
'};' +
// TACHE (audit robustesse, 2026-09-11, defaut reel trouve) : "Reinitialiser"
// effacait tout le travail de mise en forme sans confirmation ni retour
// arriere possible, contrairement a "Style aleatoire" qui capture deja
// l\'etat d\'avant et propose "Annuler" -- meme filet applique ici, meme
// mecanisme reutilise (_cvPdfEtatAvantAleatoire/_pdfAnnulerAleatoire),
// jamais un 2e systeme d\'annulation parallele.
'function _pdfReinitialiser() {' +
'  _cvPdfEtatAvantAleatoire = _pdfCapturerEtatPersistant();' +
'  document.getElementById("btnAnnulerAleatoire").disabled = false;' +
'  Object.keys(_PDF_ETAT_DEFAUT).forEach(function (id) {' +
'    var el = document.getElementById(id);' +
'    if (!el) { return; }' +
'    if (typeof _PDF_ETAT_DEFAUT[id] === "boolean") { el.checked = _PDF_ETAT_DEFAUT[id]; } else { el.value = _PDF_ETAT_DEFAUT[id]; }' +
'  });' +
'  _cvPdfEchelle = 1;' +
// TACHE (glisser-deposer des rubriques) : "Reinitialiser" restaure aussi
// l\'ordre AUTOMATIQUE (efface tout glisser-depose precedent) -- seul
// endroit qui touche a cet etat en dehors du drop lui-meme.
'  _cvPdfOrdrePersonnalise = null;' +
// TACHE (agrandissement par rubrique) : meme principe -- "Reinitialiser"
// remet aussi ces etats a zero, seul endroit en dehors de leurs propres
// interactions (curseur/glisser).
'  _cvPdfEchellesRubriques = {};' +
'  _cvPdfPolicesRubriques = {};' +
'  _cvPdfStylesPuceRubriques = {};' +
'  _cvPdfPositionsEntete = {};' +
'  _cvPdfHauteurEntete = null;' +
'  _cvPdfStylesTexteEntete = {};' +
'  _cvPdfRubriquesForceesColonne = {};' +
'  _pdfFermerBarreOutilsRubrique();' +
'  _pdfAfficherMessageMiseEnPage("");' +
'  _pdfRafraichir();' +
'}' +
'document.getElementById("btnReinitialiser").addEventListener("click", _pdfReinitialiser);' +
'var _cvPdfEtatAvantAleatoire = null;' +
// TACHE (retour utilisateur, bug reel confirme : "tout ce que j'ai
// modifie a la main, ca reste modifie -- je m'attends a ce que ca
// redemarre a zero a chaque tirage") : _pdfAppliquerEtat (simple) ne
// restaurait que les select/checkbox/color du panneau -- jamais les 4
// etats "manuels" (echelles/polices/styles par rubrique, positions
// libres d\'en-tete...) que _pdfGenererStyleAleatoire remet desormais a
// zero (voir plus bas). _pdfAppliquerEtatPersistant restaure ces 4 EN
// PLUS -- l\'annulation redonne donc bien EXACTEMENT l\'etat manuel
// d\'avant, symetrique du reset.
'function _pdfAnnulerAleatoire() {' +
'  if (!_cvPdfEtatAvantAleatoire) { return; }' +
'  _pdfAppliquerEtatPersistant(_cvPdfEtatAvantAleatoire);' +
'  _cvPdfEtatAvantAleatoire = null;' +
'  document.getElementById("btnAnnulerAleatoire").disabled = true;' +
'  _pdfAfficherMessageMiseEnPage("");' +
'  _pdfFermerBarreOutilsRubrique();' +
'  _pdfRafraichir();' +
'}' +
'document.getElementById("btnAnnulerAleatoire").addEventListener("click", _pdfAnnulerAleatoire);' +
// TACHE ("Generer des CV aleatoires", port du Word -- 🎲) : contrairement
// a une couleur RGB totalement aleatoire (risque reel de couleur moche ou
// illisible), la palette est CURATED (paires foncee/claire choisies a la
// main) -- seul le CHOIX parmi ces paires est aleatoire. La lisibilite du
// texte (blanc/noir) n'est elle-meme jamais devinee : calculee par la
// vraie luminance perceptuelle de la couleur choisie (formule standard
// W3C), pour ne jamais generer un style illisible quelle que soit la
// paire tiree. Le CONTENU ne change jamais ici -- uniquement les options
// de style deja existantes (les memes que celles pilotables a la main).
// TACHE (retour utilisateur, bug reel confirme : "les titres de rubrique,
// je le vois a peine... en mode aleatoire on ne doit pas proposer des
// couleurs quasiment invisibles") : "debut" sert aussi de couleur de
// TEXTE directe pour les titres de rubrique (.rubrique h2 { color:
// var(--degrade-debut) } sur fond blanc, cvPdfTemplateA4.js) -- un cas
// JAMAIS couvert par le filet de securite blanc/noir mentionne ci-dessus
// (qui protege le texte SUR un fond colore, pas un texte colore SUR fond
// blanc). Verifie : #c99a2e (moutarde) donnait un contraste ~2.6:1 sur
// blanc (bien en dessous du minimum WCAG AA 4.5:1) -- remplace par un
// moutarde plus fonce (~5:1), seule entree corrigee, les 7 autres
// controlees et deja suffisamment sombres.
'var _PDF_PALETTE_ALEATOIRE = [' +
'  { debut: "#2f6690", fin: "#d9e8f2" },' +
'  { debut: "#2f6b4f", fin: "#dcefe3" },' +
'  { debut: "#7a2e3b", fin: "#f3dde1" },' +
'  { debut: "#4b3f72", fin: "#e6e0f5" },' +
'  { debut: "#33383d", fin: "#e8eaed" },' +
'  { debut: "#b5553a", fin: "#fbe7de" },' +
'  { debut: "#8a6a1e", fin: "#fdf3d9" },' +
'  { debut: "#1f7a72", fin: "#dcf2ef" },' +
// TACHE (retour utilisateur : "plus de couleurs dans la palette", pour
// varier "Style aleatoire" sans le compromis noir/blanc ecarte -- voir
// echange precedent) : 8 paires supplementaires, meme methode de
// verification que les 8 ci-dessus (luminance de "debut" calculee,
// toutes ici entre 0.21 et 0.33 -- largement sous le seuil 0.6, donc
// aussi lisibles en texte de titre sur fond blanc qu'en degrade colonne).
'  { debut: "#1e3a5f", fin: "#dde5ee" },' +
'  { debut: "#8f3a5c", fin: "#f5dfe6" },' +
'  { debut: "#4f5b23", fin: "#e8edd9" },' +
'  { debut: "#3d4f5d", fin: "#dfe6ea" },' +
'  { debut: "#5c2a5e", fin: "#ecdcee" },' +
'  { debut: "#7a3b1e", fin: "#f3e0d2" },' +
'  { debut: "#1f4d3a", fin: "#dbeee2" },' +
'  { debut: "#3a3a7a", fin: "#dedef0" }' +
'];' +
'function _pdfLuminanceHex(hex) {' +
'  var h = hex.replace("#", "");' +
'  var r = parseInt(h.substr(0, 2), 16) / 255, g = parseInt(h.substr(2, 2), 16) / 255, b = parseInt(h.substr(4, 2), 16) / 255;' +
'  return 0.2126 * r + 0.7152 * g + 0.0722 * b;' +
'}' +
'function _pdfChoixAleatoire(liste) { return liste[Math.floor(Math.random() * liste.length)]; }' +
// TACHE (retour utilisateur : "je tombe 3-4 fois sur le meme modele, il
// n'y a que la couleur qui change, je veux plus de variete") : les champs
// les plus visibles (colonnes, bandeau en-tete, forme colonnes, style
// titres, degrade colonnes) sont regroupes ici et re-tires en boucle
// (bornee) tant que le nouveau tirage reste trop proche du precedent --
// jamais un simple tirage unique aveugle a ce qui vient d'etre affiche.
// regBandeauEnTete rééquilibré à 50% (etait 75% ON : l'element le plus
// visible de la page restait donc identique ~3 tirages sur 4).
// TACHE (retour utilisateur : "il y a plus une colonne qui me ressort que
// deux -- je veux un systeme ou une fois sur deux je vais avoir 2
// colonnes ou 1") : le tirage ci-dessous restait deja 50/50 par tirage,
// mais rien n\'empechait plusieurs tirages consecutifs de retomber sur la
// meme valeur par pur hasard -- verifie en testant : sur des series de 25
// a 40 tirages, la repartition restait globalement equilibree, mais nettement
// moins convaincante localement. Compteur de repetitions : force
// desormais une alternance des que la MEME valeur sortirait une 3e fois
// de suite, sans casser le cote aleatoire des tirages "normaux".
'var _cvPdfDernieresColonnes = null;' +
'var _cvPdfRepetitionsColonnes = 0;' +
'function _pdfTirerColonnes() {' +
'  var valeur = _pdfChoixAleatoire(["1", "2"]);' +
'  if (valeur === _cvPdfDernieresColonnes && _cvPdfRepetitionsColonnes >= 2) { valeur = (valeur === "1") ? "2" : "1"; }' +
'  if (valeur === _cvPdfDernieresColonnes) { _cvPdfRepetitionsColonnes++; } else { _cvPdfRepetitionsColonnes = 0; }' +
'  _cvPdfDernieresColonnes = valeur;' +
'  return valeur;' +
'}' +
// TACHE (retour utilisateur : "fond de colonne pleine hauteur -- sur une
// vingtaine de tirages, je ne suis tombe sur aucun de ces modeles") :
// bug reel confirme -- regFondColonnePleineHauteur (checkbox) n\'etait
// JAMAIS incluse dans le tirage aleatoire (absente de toute cette
// fonction), impossible a obtenir au hasard. `fondPleineHauteurActif`
// (decide une seule fois par tirage complet, cf _pdfGenererStyleAleatoire
// plus bas -- jamais re-tire a chaque iteration de la boucle do/while
// ci-dessous) coordonne ICI les 2 reglages dont l\'EFFET VISIBLE depend
// reellement (bandeauEnTete doit etre desactive, degradeColonnes ne doit
// pas etre "aucun" -- voir pleineHauteurGauche/Droite, cvPdfTemplateA4.js)
// -- sans cette coordination, le simple fait de cocher la case au hasard
// aurait eu ~94% de chances de ne produire AUCUN effet visible (5
// reglages independants a aligner). fondColonnes/fondColonnesEffet/la
// case elle-meme sont coordonnes plus bas dans _pdfGenererStyleAleatoire
// (pas des champs "structurels" au sens de cette fonction).
'function _pdfTirerChampsStructurels(fondPleineHauteurActif) {' +
'  document.getElementById("regColonnes").value = fondPleineHauteurActif ? "2" : _pdfTirerColonnes();' +
'  document.getElementById("regBandeauEnTete").checked = fondPleineHauteurActif ? false : (Math.random() < 0.5);' +
'  document.getElementById("regFormeColonnes").value = _pdfChoixAleatoire(["rectangle", "diagonale"]);' +
'  document.getElementById("regStyleTitres").value = _pdfChoixAleatoire(["souligne", "aucun", "bandeau"]);' +
'  document.getElementById("regDegradeColonnes").value = fondPleineHauteurActif' +
'    ? _pdfChoixAleatoire(["fonce-clair", "clair-fonce"])' +
'    : _pdfChoixAleatoire(["fonce-clair", "clair-fonce", "aucun"]);' +
'}' +
'function _pdfSignatureTirageStructurel() {' +
'  return {' +
'    colonnes: document.getElementById("regColonnes").value,' +
'    bandeauEnTete: document.getElementById("regBandeauEnTete").checked,' +
'    formeColonnes: document.getElementById("regFormeColonnes").value,' +
'    styleTitres: document.getElementById("regStyleTitres").value,' +
'    degradeColonnes: document.getElementById("regDegradeColonnes").value' +
'  };' +
'}' +
'var _cvPdfDernierTirageAleatoire = null;' +
'function _pdfGenererStyleAleatoire() {' +
'  _cvPdfEtatAvantAleatoire = _pdfCapturerEtatPersistant();' +
'  document.getElementById("btnAnnulerAleatoire").disabled = false;' +
// TACHE (retour utilisateur, bug reel confirme : "tout ce que j'ai
// modifie a la main reste modifie -- ca devrait redemarrer a zero a
// chaque tirage") : "Style aleatoire" ne touchait jusqu'ici QUE les
// select/checkbox/color du panneau, jamais les personnalisations
// manuelles par rubrique (agrandissement, police, couleur des pastilles,
// couleur/gras/italique du nom-metier-accroche, position libre glissee,
// ordre glisse-depose, permutation nom/objectif) -- CHOIX D\'ORIGINE
// (voir plus haut, "jamais un 2e etat a synchroniser") desormais inverse
// sur demande explicite : un tirage aleatoire repart d\'une ardoise
// vierge, meme reset que "Reinitialiser" (_pdfReinitialiser plus haut),
// jamais une 2e copie de cette liste.
'  _cvPdfEchelle = 1;' +
'  _cvPdfOrdrePersonnalise = null;' +
'  _cvPdfEchellesRubriques = {};' +
'  _cvPdfPolicesRubriques = {};' +
'  _cvPdfStylesPuceRubriques = {};' +
'  _cvPdfPositionsEntete = {};' +
'  _cvPdfHauteurEntete = null;' +
'  _cvPdfStylesTexteEntete = {};' +
'  _cvPdfRubriquesForceesColonne = {};' +
// TACHE (retour utilisateur : "la phrase d'accroche passe sur
// l'intitule, le rectangle est deja en rouge" -- bug reel confirme) :
// _cvPdfPositionsEntete est bien remis a zero (position automatique)
// juste au-dessus, mais les LARGEURS des rectangles accroche/metier
// (regLargeurAccrocheLibre/regLargeurMetierLibre, ex. elargies a la main
// lors d'une session precedente) ne l'etaient jamais -- un rectangle
// laisse a 90% de large associe a une disposition "3colonnes" tiree au
// hasard juste apres (1/3 de la largeur allouee) deborde alors forcement
// sur le bloc voisin. Memes valeurs par defaut que _PDF_ETAT_DEFAUT
// (regReinitialiser, plus haut), jamais une 2e paire de constantes.
'  document.getElementById("regLargeurAccrocheLibre").value = "30";' +
'  document.getElementById("regLargeurMetierLibre").value = "32";' +
'  _pdfFermerBarreOutilsRubrique();' +
'  var couleurs = _pdfChoixAleatoire(_PDF_PALETTE_ALEATOIRE);' +
'  document.getElementById("regCouleurDebut").value = couleurs.debut;' +
'  document.getElementById("regCouleurFin").value = couleurs.fin;' +
'  document.getElementById("regTexteFondColonnes").value = (_pdfLuminanceHex(couleurs.debut) > 0.6) ? "noir" : "blanc";' +
// TACHE (retour utilisateur : "fond de colonne pleine hauteur") : decide
// UNE SEULE FOIS par tirage complet (jamais re-tire a chaque iteration du
// do/while ci-dessous, qui ne fait que re-piocher les champs "structurels"
// en cas de trop grande ressemblance avec le tirage precedent) --
// coordonne colonnes/bandeauEnTete/degradeColonnes (_pdfTirerChampsStructurels)
// PUIS fondColonnes/fondColonnesEffet/la case elle-meme plus bas, pour
// garantir un effet reellement visible des que la case sort a true.
'  var fondPleineHauteurActif = Math.random() < 0.35;' +
'  var _tentativesTirage = 0;' +
'  var _signatureTirage;' +
'  do {' +
'    _pdfTirerChampsStructurels(fondPleineHauteurActif);' +
'    _signatureTirage = _pdfSignatureTirageStructurel();' +
'    _tentativesTirage++;' +
'  } while (_cvPdfDernierTirageAleatoire && _tentativesTirage < 6 &&' +
'    Object.keys(_signatureTirage).filter(function (cle) { return _signatureTirage[cle] === _cvPdfDernierTirageAleatoire[cle]; }).length >= 4);' +
'  _cvPdfDernierTirageAleatoire = _signatureTirage;' +
// TACHE (retour utilisateur 2026-09-15, "on enlève ça des fonctions
// aleatoires") : regColonnesInversees n'est plus tire ici -- inverser les
// 2 colonnes redevient une decision UNIQUEMENT manuelle (bouton dedie,
// voir _pdfActiverInversionColonnes), jamais touchee par "Style au
// hasard". regLargeurColonneGauche (la LARGEUR, differente de l'ORDRE
// des colonnes) reste, elle, tiree normalement -- non concernee par
// cette demande.
// TACHE (retour utilisateur 2026-09-15, bug reel confirme par capture
// d'ecran : "atroce, vraiment pourri") : le curseur du panneau autorise
// 30-70% (extremes utiles pour un reglage manuel, volontaire), mais le
// tirage ALEATOIRE piochait dans cette meme plage complete SYMETRIQUE
// autour de 50 -- un tirage a 70% de LARGEUR POUR LA COLONNE GAUCHE (la
// plus legere par convention, voir cheminPhysiqueColonneUn plus haut)
// ecrasait alors la colonne DROITE (la plus lourde, "Experience
// professionnelle" en general) dans a peine 30% de la largeur, texte
// tasse, resultat illisible. Repris en asymetrique, coherent avec le
// nouveau defaut 35 ci-dessus : la colonne gauche (legere) ne depasse
// plus jamais 40%, la colonne droite (lourde) ne descend donc jamais
// sous 60%. Le curseur manuel garde ses bornes 30-70 completes,
// inchangees, pour qui veut vraiment inverser ce rapport.
'  document.getElementById("regLargeurColonneGauche").value = _pdfChoixAleatoire(["30", "35", "40"]);' +
'  document.getElementById("regSeparateurColonnes").checked = Math.random() < 0.4;' +
// TACHE (retour utilisateur 2026-09-15, meme principe exact que
// regColonnesInversees juste au-dessus) : "lesDeux" (les 2 colonnes
// colorees) est le plus intense visuellement des 4 choix -- les 3 autres
// gardent toujours au moins une colonne blanche. Un rendu qui change
// autant l'energie du CV merite d'etre choisi expres, jamais subi par un
// clic sur "Style au hasard" -- retire du tirage, reste choisissable a
// la main (select "Fond des colonnes" du panneau).
'  document.getElementById("regFondColonnes").value = fondPleineHauteurActif' +
'    ? _pdfChoixAleatoire(["gauche", "droite"])' +
'    : _pdfChoixAleatoire(["aucun", "gauche", "droite"]);' +
'  document.getElementById("regFondColonnesEffet").value = fondPleineHauteurActif ? "fondSeul" : _pdfChoixAleatoire(["fondSeul", "titres"]);' +
'  document.getElementById("regFondColonnePleineHauteur").checked = fondPleineHauteurActif;' +
'  document.getElementById("regFormeEnTete").value = _pdfChoixAleatoire(["rectangle", "diagonale"]);' +
'  document.getElementById("regDegradeBandeau").value = _pdfChoixAleatoire(["fonce-clair", "clair-fonce", "aucun"]);' +
'  document.getElementById("regBandeauDisponibilite").checked = Math.random() < 0.3;' +
// TACHE (retour utilisateur : "je veux que 2 colonnes ou 3 colonnes
// soient aussi disponibles pour le tirage au sort aleatoire, a condition
// que le titre le permette -- si le titre est trop grand et que ca ne
// rentre pas sur 3 colonnes, il sera genere automatiquement en 2
// colonnes") : seuil de longueur simple sur le texte BRUT du poste vise
// (titreCV, dossier source -- jamais mesure reellement en pixels, le
// rendu n'existe pas encore a ce stade du tirage) -- au-dela, 3 colonnes
// est retiree du tirage (jamais choisie), 2 colonnes s'applique
// automatiquement ; en dessous, 50/50 comme les autres champs structurels.
'  var _cvPdfTitreViseTexte = (window.__cvPdfDossierSource && window.__cvPdfDossierSource.titreCV) || "";' +
'  document.getElementById("regDispositionEntete").value = (_cvPdfTitreViseTexte.length > 42) ? "2colonnes" : _pdfChoixAleatoire(["3colonnes", "2colonnes"]);' +
'  document.getElementById("regAnneauPhoto").checked = Math.random() < 0.4;' +
'  document.getElementById("regLectureGuidee").checked = Math.random() < 0.45;' +
'  document.getElementById("regStyleProfessionnel").value = _pdfChoixAleatoire(["epure", "condense"]);' +
'  document.getElementById("regStylePersonnel").value = _pdfChoixAleatoire(["epure", "condense"]);' +
// TACHE (retour utilisateur : "souligner le poste, les dates,
// l'entreprise... et pareil pour l'italique -- je veux ca aussi dans le
// mode aleatoire") : 6 tirages INDEPENDANTS (jamais un seul "profil"
// impose) -- probabilite moderee pour eviter qu'un CV tire au hasard
// souligne/italique TOUT en meme temps (surcharge visuelle), tout en
// restant assez frequent pour varier reellement les CV proposes.
'  document.getElementById("regSoulignerPoste").checked = Math.random() < 0.3;' +
'  document.getElementById("regItaliquePoste").checked = Math.random() < 0.2;' +
'  document.getElementById("regSoulignerDates").checked = Math.random() < 0.3;' +
'  document.getElementById("regItaliqueDates").checked = Math.random() < 0.2;' +
'  document.getElementById("regSoulignerEntreprise").checked = Math.random() < 0.3;' +
'  document.getElementById("regItaliqueEntreprise").checked = Math.random() < 0.2;' +
'  document.getElementById("regStyleBordures").value = _pdfChoixAleatoire(["fine", "epaisse"]);' +
// TACHE (retour utilisateur : "je veux que toutes ces options qui on est
// en train de construire apparaissent dans l'option aleatoire") : options
// purement VISUELLES uniquement (tri/mise en forme des experiences) --
// lettre jointe et regroupement restent volontairement hors du tirage
// (choix editorial de contenu, jamais declenche par surprise -- reponse
// explicite de l'utilisateur, meme principe que le Word qui ne les
// randomise jamais non plus). Reste modifiable a la main ensuite, comme
// tout le reste de ce panneau.
'  document.getElementById("regOrdreExperiences").value = _pdfChoixAleatoire(["pertinence", "pertinence", "date-desc", "date-asc", "poste-asc"]);' +
'  document.getElementById("regFormatExperiences").value = _pdfChoixAleatoire(["standard", "ameliore"]);' +
'  document.getElementById("regIcones").checked = Math.random() < 0.5;' +
'  document.getElementById("regIconesCoordonnees").checked = Math.random() < 0.5;' +
// TACHE (retour utilisateur : polices supplementaires) : "artistique"
// (manuscrite) exclue du tirage aleatoire -- adaptee a un usage ponctuel
// (nom/accroche/1 rubrique via la mini-barre flottante), jamais a tout
// le corps d'un CV, y compris tire au hasard.
'  document.getElementById("regPolice").value = _pdfChoixAleatoire(["segoe", "georgia", "verdana", "garamond", "arial", "calibri", "tahoma", "trebuchet", "times", "palatino"]);' +
'  document.getElementById("regBandeauCompetencesCles").checked = Math.random() < 0.4;' +
// TACHE (retour utilisateur : "adapter le PDF au Word -- le dé du Word
// randomise déjà 'bloc mis en avant', qui peut tomber sur Formations")
// : contrairement a lettre jointe/regroupement (choix de contenu
// exclus du tirage), celui-ci est inclus VOLONTAIREMENT sur demande
// explicite -- l'utilisateur veut que le hasard puisse parfois reveler
// toutes les formations + la plus pertinente developpee, pour "eveiller
// des idees" a la personne. Probabilite moderee (35%, comme
// fondPleineHauteurActif plus haut) -- pas systematique, garde de la
// variete dans les tirages.
'  document.getElementById("regFormationsMisesEnAvant").checked = Math.random() < 0.35;' +
// Couleurs des puces (couleurFondCompetences/couleurTextePuces) jamais
// randomisees -- pas de logique de contraste calculee pour cette paire
// independante (contrairement a couleurDebut/Fin, deja gerees juste
// au-dessus), risque reel de combinaison illisible sinon. Seule la FORME
// (toujours lisible quelle qu'elle soit) est tiree.
'  document.getElementById("regStyleCompetences").value = _pdfChoixAleatoire(["pastille", "rectangle", "texte"]);' +
'  document.getElementById("regCoinsArrondis").checked = Math.random() < 0.4;' +
// Format lui-meme jamais randomise (reste sur celui deja choisi par
// l'utilisateur) -- seuls les reglages A5 (utiles uniquement si l'A5 est
// deja actif) sont tires, harmless si masques.
// TACHE (retour utilisateur 2026-09-15) : meme oubli que regFondColonnes
// (A4) corrige plus haut -- "lesDeux" retire ici aussi, meme raisonnement
// exact (rendu le plus intense, merite un choix expres). "Milieu"
// (colonne centrale identite) reste, mecanisme different, non concerne.
'  document.getElementById("regFondColonnesA5").value = _pdfChoixAleatoire(["aucun", "gauche", "droite", "milieu"]);' +
'  document.getElementById("regEnteteInverseeA5").checked = Math.random() < 0.5;' +
'  _cvPdfEchelle = 1;' +
// TACHE (retour utilisateur : "Sobre ne veut pas dire zero couleur") : un
// tirage "Style aleatoire" pendant que Sobre reste actif re-tire aussi OU
// va la couleur pale (colonne/bandeau/aucune) -- coherent avec le reste du
// tirage (tout le reste des champs "flashy" est deja re-tire/re-force par
// _pdfLireOptions() a chaque rafraichissement tant que Sobre est coche,
// voir plus haut). Apres _pdfTirerChampsStructurels ci-dessus (regColonnes
// peut avoir change), jamais avant.
'  if (document.getElementById("regSobreActif").checked) { _pdfTirerVarianteSobre(); }' +
'  _pdfAfficherMessageMiseEnPage("");' +
'  _pdfRafraichir();' +
// TACHE (retour utilisateur, bug reel confirme : "trop de fois quand
// j'appuie sur le mode aleatoire... l'experience professionnelle seule et
// de l'autre cote toutes les autres agglomerees") : le tirage aleatoire ne
// pilote jamais lui-meme la repartition des rubriques (deleguee au tri
// initial + reequilibrage, voir cvPdfTemplateA4.js/_pdfEssayerRequilibrageColonnes
// plus haut) -- appele ici en dernier, apres le rendu du tirage complet,
// pour que chaque tirage herite du meme reequilibrage que "Mise en page".' +
'  _pdfEssayerRequilibrageColonnes();' +
'}' +
// TACHE (retour utilisateur explicite : "quand je fais aleatoire, je vais
// avoir des propositions de CV créatifs tout faits et pas des elements de
// CV créatifs qui vont se melanger") : pendant que Créatif est actif, "Style
// aleatoire" ne lance plus sa randomisation champ par champ habituelle
// (_pdfGenererStyleAleatoire, ci-dessus -- c\'est exactement ce
// mecanisme-la qui creerait un cocktail) mais propose un AUTRE modele
// Créatif complet (_pdfProposerAutreModeleCreatif). Comportement inchange
// hors Créatif (y compris sous Sobre, deja gere par ce dernier lui-meme).
'document.getElementById("btnStyleAleatoire").addEventListener("click", function () {' +
'  if (document.getElementById("regCreatifActif").checked) { _pdfProposerAutreModeleCreatif(); } else { _pdfGenererStyleAleatoire(); }' +
'});' +
// TACHE (retour utilisateur : "accordeon, gagner de la place") : chaque
// h3 de .panneau-reglages replie/deplie le .contenu-accordeon qui le suit
// IMMEDIATEMENT (voir restructuration HTML plus haut -- chaque section
// suit desormais cette forme h3 + UN SEUL .contenu-accordeon). Cablee
// UNE SEULE FOIS au chargement (contrairement a _pdfActiverGlisserDeposer
// etc.) : .panneau-reglages n\'est JAMAIS reconstruit par _pdfRafraichir()
// (seul #conteneurPage, l\'apercu, l\'est) -- ces noeuds restent stables.
'function _pdfActiverAccordeons() {' +
'  Array.prototype.forEach.call(document.querySelectorAll(".panneau-reglages h3"), function (titre) {' +
'    titre.addEventListener("click", function () {' +
'      var contenu = titre.nextElementSibling;' +
'      if (!contenu || !contenu.classList.contains("contenu-accordeon")) { return; }' +
'      var estFerme = contenu.style.display === "none";' +
'      contenu.style.display = estFerme ? "" : "none";' +
'      titre.classList.toggle("section-fermee", !estFerme);' +
'    });' +
'  });' +
'}' +
'_pdfActiverAccordeons();' +
// TACHE (retour utilisateur : panneau ferme par defaut) : bascule simple
// display/classe sur la zone des reglages -- jamais reconstruite par
// _pdfRafraichir() (comme .panneau-reglages lui-meme), un seul listener
// suffit, pose une fois au chargement.
// TACHE (retour utilisateur : "lorsque j'appuie sur personnaliser, je vais
// directement aller dans le grand aperçu -- le CV a droite, les options a
// gauche") : depuis le petit apercu embarque (75vh, __cvPdfModeGrandApercu
// false), Personnaliser ouvre desormais directement le grand apercu
// plein ecran AU LIEU de deplier le panneau sur place -- meme panneau
// complet (deja construit par ouvrirGrandApercuPdf, js/app.js), jamais un
// 2e panneau simplifie. Depuis le grand apercu lui-meme (deja "la ou on
// veut etre"), comportement INCHANGE : deplie/replie sur place.
'document.getElementById("btnPersonnaliserPdf").addEventListener("click", function () {' +
'  if (!window.__cvPdfModeGrandApercu && window.parent && typeof window.parent.ouvrirGrandApercuPdf === "function") {' +
'    window.parent.ouvrirGrandApercuPdf(window.__cvPdfDossierSource);' +
'    return;' +
'  }' +
'  document.getElementById("zoneReglagesPdfPersonnalisation").classList.toggle("ouverte");' +
'});' +
// TACHE (retour utilisateur : "la pipette pour choisir n'importe quelle
// couleur, en raccourci exterieur") : port EXACT du meme circuit que
// btnPipetteLibreXXL cote Word (js/app.js, window.EyeDropper) -- applique
// le hex obtenu a l'accent principal (regCouleurDebut), recalcule le
// contraste texte comme le fait deja _pdfGenererStyleAleatoire, jamais un
// 2e mecanisme de couleur libre. Repli window.prompt si EyeDropper
// indisponible (Firefox/Safari), meme filet que cote Word.
'document.getElementById("btnPipetteLibrePdf").addEventListener("click", function () {' +
'  function appliquerHexPipette(hex) {' +
'    document.getElementById("regCouleurDebut").value = hex;' +
'    document.getElementById("regTexteFondColonnes").value = (_pdfLuminanceHex(hex) > 0.6) ? "noir" : "blanc";' +
'    _pdfRafraichir();' +
'  }' +
'  if (typeof window.EyeDropper !== "function") {' +
'    var choix = window.prompt("Votre navigateur ne propose pas d\'outil pipette. Indiquez le code couleur hexadécimal (ex. #2563EB) :", "#2f6690");' +
'    if (choix && /^#?[0-9a-fA-F]{6}$/.test(choix.trim())) { appliquerHexPipette(choix.trim().indexOf("#") === 0 ? choix.trim() : ("#" + choix.trim())); }' +
'    return;' +
'  }' +
'  new window.EyeDropper().open().then(function (resultat) { appliquerHexPipette(resultat.sRGBHex); }).catch(function () {});' +
'});' +
// TACHE (retour utilisateur : "le bouton d'aujourd'hui ouvrir le grand
// aperçu, ça va se transformer en imprimé -- la personne tombee sur un
// bon resultat au de veut l'imprimer direct") : "Personnaliser" est
// desormais l'unique porte vers le grand apercu (voir btnPersonnaliserPdf
// plus haut) -- ce bouton-ci devient une impression DIRECTE (jamais de
// confirmation intermediaire, retour utilisateur explicite), identique a
// .bouton-imprimer deja present dans la colonne de reglages (meme
// window.print(), qui n'imprime que le contenu de CETTE iframe -- jamais
// le reste de la page hote).
'document.getElementById("btnImprimerSousApercuPdf").addEventListener("click", function () {' +
'  if (window.parent && window.parent.trackEvenement) { window.parent.trackEvenement("cv_telecharge", {format:"pdf"}); }' +
'  window.print();' +
'});' +
// TACHE (retour utilisateur : "parler des formats... qu'on puisse faire
// clic ici") : pilote le VRAI select #regFormatCV -- reutilise le
// listener "change" generique deja pose sur tous les selects de
// .panneau-reglages (_pdfRafraichir), jamais une 2e logique de rendu.
'Array.prototype.forEach.call(document.querySelectorAll(".bouton-format-pdf"), function (bouton) {' +
'  bouton.addEventListener("click", function () {' +
'    var val = this.getAttribute("data-format-raccourci");' +
'    var sel = document.getElementById("regFormatCV");' +
'    if (sel.value === val) { return; }' +
'    sel.value = val;' +
'    sel.dispatchEvent(new Event("change"));' +
'  });' +
'});' +
// TACHE (retour utilisateur : "garder en memoire la mise en forme PDF
// pour pouvoir revenir dessus") : applique les reglages deja sauvegardes
// (dossier.pdfReglages, ecrit par _pdfPersisterReglages a chaque
// changement) AVANT le tout premier rendu -- sinon (premiere utilisation,
// aucun reglage sauvegarde), _PDF_ETAT_DEFAUT deja present sur les
// elements HTML (valeurs par defaut ecrites dans le markup) reste
// inchange, comportement identique a avant ce chantier.
'if (window.__cvPdfDossierSource && window.__cvPdfDossierSource.pdfReglages) {' +
'  _pdfAppliquerEtatPersistant(window.__cvPdfDossierSource.pdfReglages);' +
  // TACHE (bouton "CV Sobre" cote PDF) : reflete l\'etat actif/inactif
  // restaure (ex. active depuis le Word, dossier.pdfReglages.regSobreActif)
  // sur ce bouton des l\'ouverture -- sans ca, la case cachee serait bien
  // cochee mais le bouton resterait visuellement inactif.
'  _pdfMettreAJourBoutonSobre();' +
'  _pdfMettreAJourBoutonCreatif();' +
'}' +
'_pdfRafraichir();' +
'</' + 'script>' +
'</body></html>';
}
