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
  // TACHE (phase 5.2, galerie de modeles) : les 5 modeles Creatif reels
  // (sur les 11 de _PDF_CREATIF_RECETTES) retenus pour la galerie visible,
  // decision Denis (RECOMMANDATIONS_PHASE1_MISE_EN_PAGE_PDF_2026-09-21.md
  // § 5 bis). "Colonne et frise" (le 6e, construit le 2026-09-23 -- voir
  // _pdfConstruireFrise(), cvPdfTemplateA4.js) rejoint desormais les 5
  // autres. Les 5 modeles reels restants restent atteignables par "Un
  // autre modele" (tirage aleatoire existant, _pdfProposerAutreModeleCreatif),
  // jamais retires du code.
  // TACHE (Denis, 2026-09-25, tranche 2) : TOUS les modeles (maquette + application) ont leur bouton cache.
  var _PDF_GALERIE_CREATIF_IDS = ['mqBandeau', 'mqDiagonale', 'mqColonne', 'mqCadre', 'mqPicto', 'frise', 'photoFrise', 'rectangles', 'sidebarVague', 'rubanDiagonal', 'duoOvale', 'cadreBarre', 'pastille', 'bandeauVertical', 'triangleSavoir', 'vagueMarine', 'diagonalesContrastees', 'losangeVert', 'medaillon'];
  return '<!DOCTYPE html>' +
// Le titre de la page devient le nom propose a l'enregistrement en PDF : « NOM_poste » (retour Denis 2026-10-01, cv-core/identiteFormat.js).
'<html lang="fr"><head><meta charset="UTF-8"><title>' + _pdfEscaperHtml((typeof nomFichierCV === 'function') ? nomFichierCV(dossierSource) : ('CV design (PDF) - ' + nomComplet)) + '</title>' +
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
// TACHE (chantier refonte "La mise en page" du CV, phase 5.1, cahier
// docs/CHANTIER_REFONTE_MISE_EN_PAGE_PDF_2026-09-21.md § 4 "Panneau et
// exportation" -- "Imprimer / Enregistrer en PDF" retire du panneau,
// l'enregistrement se fait desormais a "Valider le CV > Exporter") :
// bouton masque (jamais retire du DOM -- Exporter le cible encore par
// .querySelector('.bouton-imprimer') puis .click(), js/app.js).
'  .bouton-imprimer { display: none; width: 100%; margin-top: 16px; padding: 10px; border: none; border-radius: 6px; background: #2f6690; color: #fff; font-size: 14px; cursor: pointer; }' +
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
'  #conteneurPage [data-vide] { display: none !important; }' +
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
// TACHE (retour Denis 2026-09-21 : une barre grise verticale apparaissait
// entre les colonnes dans le PDF enregistre, bug reel confirme) : cause =
// specificite CSS. cvPdfTemplateA4.js pose `body.mode-grand-apercu
// .poignee-redim-largeur-colonnes { display: block }` (specificite 0,2,1)
// pour montrer la poignee dans le grand apercu ; la regle d'impression
// ci-dessus (`.poignee-redim-largeur-colonnes`, specificite 0,1,0) perdait
// donc toujours, et la poignee etait imprimee quand on enregistrait depuis
// le grand apercu. Les 3 autres poignees n'ont pas cette regle plus
// specifique, d'ou le seul cas de la largeur de colonnes. !important +
// selecteur au moins aussi specifique : impossible a battre en impression.
'    body .poignee-redim-largeur-colonnes, body.mode-grand-apercu .poignee-redim-largeur-colonnes { display: none !important; }' +
'    body.mode-edition-texte #conteneurPage [data-edit-id], body.mode-edition-texte #conteneurPage [contenteditable] { outline: none !important; background: none !important; }' +
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
// TACHE (chantier refonte "La mise en page", phase 5.2, galerie de
// modeles reels -- docs/CHANTIER_REFONTE_MISE_EN_PAGE_PDF_2026-09-21.md
// § 6, docs/RECOMMANDATIONS_PHASE1_MISE_EN_PAGE_PDF_2026-09-21.md § 5 bis
// "Proposition de galerie", validee par Denis) : boutons CACHES (jamais
// montres a la personne -- memes convention exacte que regSobreActif/
// regCreatifActif juste au-dessus), un par modele de la galerie, pour
// que le panneau parent (construireMiseEnPageCV(), js/app.js) puisse
// choisir un modele PRECIS par programme (meme mecanisme _mepClicMoteur
// deja utilise partout ailleurs pour parler a cette iframe -- jamais un
// 2e canal de communication invente). _pdfChoisirModeleCreatif()/
// _pdfChoisirVarianteSobre() (plus bas) font le vrai travail.
_PDF_GALERIE_CREATIF_IDS.map(function (id) {
  return '<button type="button" id="pdfChoisirCreatif_' + id + '" style="display:none" onclick="_pdfChoisirModeleCreatif(\'' + id + '\')"></button>';
}).join('') +
['mq-bandeau', 'mq-fond', 'mq-epure', 'mq-photo', 'mq-rectangles'].map(function (v) {
  return '<button type="button" id="pdfChoisirSobre_' + v + '" style="display:none" onclick="_pdfChoisirVarianteSobre(\'' + v + '\')"></button>';
}).join('') +
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
'<option value="date-desc" selected>Date (plus récent d\'abord)</option>' +
'<option value="date-asc">Date (plus ancien d\'abord)</option>' +
'<option value="poste-asc">Intitulé de poste (A→Z)</option>' +
'<option value="poste-desc">Intitulé de poste (Z→A)</option>' +
'<option value="mien">Mon ordre</option>' +
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
'<div class="champ-reglage"><label>Colonnes</label><select id="regColonnes"><option value="2">2 colonnes</option><option value="1" selected>1 colonne</option></select></div>' +
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
'<div class="champ-reglage"><label>Fond des colonnes</label><select id="regFondColonnes"><option value="droite">Droite</option><option value="gauche">Gauche</option><option value="lesDeux">Les deux</option><option value="aucun" selected>Aucun</option></select></div>' +
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
'<div class="champ-reglage case"><input type="checkbox" id="regBandeauEnTete"><label for="regBandeauEnTete">Bandeau en-tête coloré</label></div>' +
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
'<div class="champ-reglage"><label>Missions (Formations)</label><select id="regStyleFormations"><option value="epure">Épuré (1 mission par ligne)</option><option value="condense">Condensé (missions à la suite)</option></select></div>' +
'<div class="champ-reglage"><label>Signe entre les missions condensées</label><select id="regSeparateurMissions"><option value="pointvirgule">Point-virgule ;</option><option value="pointmedian">Point médian ·</option><option value="rond">Rond ●</option><option value="carre">Carré ■</option><option value="losange">Losange ◆</option><option value="barre">Barre |</option></select></div>' +
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
'<option value="segoe">Segoe UI</option>' +
'<option value="arial" selected>Arial (recommandée)</option>' +
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
'<button type="button" class="bouton-imprimer" onclick="if(window.parent&&window.parent.trackEvenement){window.parent.trackEvenement(\'cv_telecharge\',{format:\'pdf\'});} if(window.parent&&window.parent.marquerDocumentEnregistre){window.parent.marquerDocumentEnregistre(\'cv\');} _pdfImprimerAvecNom();">Imprimer / Enregistrer en PDF</button>' +
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
// TACHE (chantier refonte "La mise en page", phase 5.4 -- carte
// "Experiences professionnelles" de la maquette, Denis 2026-09-23 : "il
// fallait l'implementer aussi") : le vrai moteur (composeurComposition.js)
// decidait JUSQU'ICI seul, en automatique, quelles experiences et
// combien de missions montrer -- aucun controle manuel n'existait. Ces
// variables portent les choix manuels de la personne, jamais touchees
// par le style aleatoire (ce sont des choix de CONTENU, pas de style --
// meme regle que _cvPdfOrdrePersonnalise juste au-dessus). null/vide =
// comportement automatique inchange (zero regression pour qui ne touche
// a rien).
// - _cvPdfModePresentation : 'A' (chronologique, defaut) | 'B' (mixte,
//   competences groupees + historique complet) | 'C' (par competences
//   seul) -- memes 3 valeurs EXACTES que la maquette (S.presentation).
'var _cvPdfModePresentation = "A";' +
// - _cvPdfExperiencesTout : null (jamais touche -- comportement
//   AUTOMATIQUE inchange, le moteur garde sa propre decision) | 'toutes'
//   | 'pertinentes'. PAS "toutes" par defaut (meme si c'est la valeur
//   pre-cochee dans la maquette) : remplacer contenu.experiences (deja
//   decide par le moteur) par objetCV.experiences (brut) pourrait
//   differer subtilement (ordre, cas limites) meme quand le resultat
//   VISIBLE est cense etre identique -- reserve donc a un choix
//   EXPLICITE de la personne, jamais applique en silence a qui n\'a
//   jamais ouvert cette carte.
'var _cvPdfExperiencesTout = "toutes";' +
// - _cvPdfExperiencesChoisies : Set d'index (dans objetCV.experiences,
//   la liste BRUTE complete -- jamais contenu.experiences, deja tronquee
//   par le moteur) choisis par la personne quand "pertinentes" est actif.
//   null = pas encore initialise (rempli au 1er passage avec les plus
//   pertinentes, meme logique que S.sel de la maquette).
'var _cvPdfExperiencesChoisies = null;' +
// - _cvPdfMissionsParExperience : { index: nombre } -- nombre de missions
//   VOULU pour CETTE experience, ecrase le nombre global (voir plus bas)
//   pour cette experience seulement. Absent = suit le nombre global.
'var _cvPdfMissionsParExperience = {};' +
// - _cvPdfMissionsChoisies : { index: [indices de missions] } -- quand la
//   personne choisit des missions PRECISES (pas juste un nombre) pour une
//   experience, via "Choisir" dans le panneau. Absent = les N premieres
//   missions (par pertinence) sont prises, pas un choix precis.
'var _cvPdfMissionsChoisies = {};' +
// - _cvPdfMissionsGlobal : nombre de missions VOULU pour toutes les
//   experiences sans reglage individuel (1 a 10, meme plage que la
//   maquette S.missions). null = jamais touche -- comportement
//   AUTOMATIQUE inchange (le moteur garde sa propre troncature), zero
//   regression pour qui ne touche jamais a ce reglage. Ne devient un
//   nombre reel (4 par defaut, comme la maquette) qu\'au 1er clic sur
//   +/-, voir _pdfDefinirMissionsGlobal plus bas.
'var _cvPdfMissionsGlobal = null;' +
// - _cvPdfAfficherLieu / _cvPdfStyleLieu : le lieu d\'une experience
//   (e.lieu) est deja TOUJOURS affiche aujourd\'hui des qu\'il existe, en
//   texte SANS style particulier (_pdfEntrepriseAvecLieu, cvPdfTemplateA4.js,
//   aucun reglage) -- ajoute ici la possibilite de le masquer et de
//   choisir son style, comme la maquette (S.lieu/S.lieuStyle). Defaut
//   "normal" (PAS "italique" comme la maquette) : zero regression pour
//   qui ne touche jamais a ce reglage -- le style italique par defaut de
//   la maquette est un choix VISUEL neuf, a activer soi-meme.
'var _cvPdfAfficherLieu = true;' +
// LOT 3.5 : qualites attendues pour le poste visé (assistant) : COCHE par defaut ; decocher les retire du CV et de « Choisir ».
'var _cvPdfQualitesMetierActives = true;' +
// Cases « Afficher les competences professionnelles / comportementales » : cochees par defaut, decochees = rubrique retiree du CV.
'var _cvPdfAfficherCompPro = true;' +
'var _cvPdfAfficherCompComp = true;' +
'var _cvPdfStyleLieu = "italique";' +
// - _cvPdfPositionDates : 'droite' (defaut, comportement actuel) | 'sous'
//   | 'avant' -- meme 3 valeurs que la maquette (S.dates).
'var _cvPdfPositionDates = "droite";' +
'var _cvPdfPositionDatesChoisie = false;' +
// Retour Denis 2026-09-30 : position des dates des formations et de l'experience personnelle. Par defaut (alignees) elles suivent celle des
// experiences professionnelles ; dissociees, chaque rubrique a la sienne ("" = celle du modele, comme avant).
'var _cvPdfDatesAlignees = true;' +
'var _cvPdfPositionDatesFormations = "";' +
'var _cvPdfPositionDatesPerso = "";' +
// TACHE (chantier "Experience personnelle", 2026-09-27, DECISION DE DENIS :
// "meme comportement, aucune distinction de source" entre savoir-faire
// personnel (objetCV.experiencesPersonnelles) et engagements
// (objetCV.engagements) -- memes 3 variables EXACTES que les experiences
// pro juste au-dessus (_cvPdfExperiencesTout/Choisies/MissionsPar...), mais
// la CLE n\'est pas un index (2 tableaux sources distincts, jamais un
// index commun) -- c\'est le texte normalise de l\'item (intitule ou texte,
// voir _pdfCleExpPerso, cvPdfTemplateA4.js), stable tant que la personne ne
// modifie pas l\'intitule dans "Vos informations". Synchronisee AVEC
// Expériences professionnelles pour la presentation (dates/missions/lieu) :
// aucune variable de style dediee ici, cette carte reutilise directement
// _cvPdfPositionDates/_cvPdfStyleLieu/etc. ci-dessus (decision de Denis
// 2026-09-27 : pas de bouton synchroniser/dissocier, toujours pareil).
'var _cvPdfExpPersoTout = "toutes";' +
'var _cvPdfExpPersoChoisies = null;' +
// { cle: nombre } -- 0 = explicitement "sans mission" (presentation breve),
// distinct de absent/null (comportement automatique du moteur).
'var _cvPdfExpPersoMissionsParItem = {};' +
// TACHE (retour Denis 2026-09-28, point 13 -- "je dois pouvoir choisir
// laquelle mission je garde, pas juste combien") : meme mecanisme EXACT
// que _cvPdfMissionsChoisies (experiences) plus haut, cle = texte normalise
// de l\'item -- un choix PRECIS prime toujours sur le simple compteur.
'var _cvPdfExpPersoMissionsChoisies = {};' +
// TACHE (retour Denis 2026-09-28 : "je dois pouvoir changer l'intitule de
// l'experience et ses missions, ajouter des missions a la main") : { cle:
// { titre, missions } } -- ecrase l'affichage sur le CV UNIQUEMENT, ne
// touche jamais dossier.experiencesPerso/engagements (source, "Vos
// informations"). Quand "missions" est rempli, il remplace le texte ET le
// plafond du curseur (l'utilisateur reprend la main a la place du curseur
// automatique). Champ absent ou vide = comportement automatique inchange.
'var _cvPdfExpPersoTexteParItem = {};' +
// TACHE (retour Denis 2026-09-28, point 12, chantier "Citer / Developper") : "developper"
// (comportement actuel, zero regression) ou "citer" (une simple enumeration des titres, jamais
// les missions -- voir blocEngagements(), cvPdfTemplateMaquette.js).
'var _cvPdfExpPersoModeAffichage = "citer";' +
// TACHE (phase 5.3, carte "Formations" -- oFormMissions/rgEspForm) :
// meme convention "jamais touche = comportement actuel" que
// _cvPdfMissionsGlobal ci-dessus. Missions de formation : AUCUN reglage
// n\'existait avant (toujours masquees, cvPdfTemplateA4.js) -- false est
// donc a la fois le defaut de la maquette (oFormMissions decoche) ET le
// comportement actuel, aucune divergence a gerer. Espacement : 4px
// (valeur de depart de rgEspForm), deja la valeur codee en dur cote
// gabarit -- 4 n\'est PAS traite comme "jamais touche" ici (deja un
// nombre reel, pas de sentinelle null necessaire).
// TACHE (P10, retour Denis 2026-09-28 : developper davantage les missions de
// formation pour combler le vide du mode Mixte) : null = "jamais touche" --
// l'affichage effectif suit alors le mode (active automatiquement en Mixte,
// desactive dans les 2 autres, voir _pdfLireOptions ci-dessous) ; true/false
// = choix EXPLICITE de la personne (bascule ou reglage d\'un compteur de
// missions), qui prime alors sur le mode quel qu\'il soit.
'var _cvPdfAfficherMissionsFormation = null;' +
'var _cvPdfEspacementFormations = 4;' +
// TACHE (chantier "Formations", 2026-09-28, DECISION DE DENIS : "toutes les
// formations seront visibles et toutes les formations auront des missions",
// meme comportement que la carte "Experience personnelle") : memes 3
// variables EXACTES que _cvPdfExpPersoTout/Choisies/MissionsParItem, cle =
// texte normalise de l\'intitule (_pdfCleFormation, cvPdfTemplateA4.js).
'var _cvPdfFormationsTout = "toutes";' +
'var _cvPdfFormationsChoisies = null;' +
// { cle: nombre } -- 0 = explicitement "sans mission" (presentation breve).
'var _cvPdfFormationsMissionsParItem = {};' +
// TACHE (retour Denis 2026-09-28, point 13) : meme mecanisme EXACT que
// _cvPdfExpPersoMissionsChoisies juste au-dessus, pour les formations.
'var _cvPdfFormationsMissionsChoisies = {};' +
// TACHE (retour Denis 2026-09-28) : meme mecanisme EXACT que
// _cvPdfExpPersoTexteParItem ci-dessus, pour les formations.
'var _cvPdfFormationsTexteParItem = {};' +
// TACHE (phase 5.3, carte "Elements supplementaires" -- pasPro/pasComp) :
// meme convention "jamais touche = comportement automatique inchange"
// que _cvPdfMissionsGlobal (voir plus haut).
'var _cvPdfCompetencesProMax = null;' +
'var _cvPdfCompetencesComportementalesMax = null;' +
// TACHE (phase 5.4, carte "Organisation du CV", cOrg -- Denis, 2026-09-23 :
// "tout a ete deja cadre... reproduis a l'identique"). Defauts a false :
// AUCUN de ces reglages n'existait avant ce jour (verifie par grep) --
// false = comportement actuel exact (ordre par defaut inchange), jamais
// le defaut propre de la maquette (qui, lui, part de "Competences en
// haut" coche) -- meme regle que partout ailleurs dans ce chantier.
// TACHE (Denis, 2026-09-25, tranche 2) : TROIS etats -- null = « comme le modele » (oui pour
// les modeles de la maquette, non pour les anciens), true / false = choix explicite de la
// personne. _pdfCompetencesEnHautEffectif() donne la valeur reellement appliquee.
'var _cvPdfCompetencesEnHaut = null;' +
// Colonnes choisies AVANT un modele « 2 colonnes seulement » (null = aucun modele de ce genre actif), pour les retrouver en le quittant.
'var _cvPdfColonnesAvantModele = null;' +
// TACHE (Denis, 2026-09-25, tranche 4 « plein ecran de la maquette ») : etat propre au plein ecran de la maquette.
// Competences retirees de CE CV (noms), « Mon ordre » des experiences (indices dans la liste brute), reglages d'UNE
// rubrique (taille, interligne, par titre), en-tete libre (positions, largeurs, hauteur, styles), textes corriges.
'var _cvPdfCompetencesRetirees = [];' +
// TACHE (J4, 2026-09-28, "Retirer une rubrique ou une mission") : memes principes que
// _cvPdfCompetencesRetirees juste au-dessus -- rubriquesRetirees (intitules complets, ex.
// "Formations") et missionsRetirees (cles data-ed, ex. "fm:0:1", memes cles que "Modifier le
// texte"). _cvPdfHistoriqueRetraits (ordre chronologique, {type, valeur}) sert UNIQUEMENT aux 2
// fleches d'annulation (dernier retrait / tout remettre) -- jamais lu par le rendu du CV lui-meme.
'var _cvPdfRubriquesRetirees = [];' +
'var _cvPdfMissionsRetirees = [];' +
'var _cvPdfHistoriqueRetraits = [];' +
'var _cvPdfOrdreExperiencesMien = null;' +
// Retour Denis 2026-09-30 : « Mon ordre » pour les formations (liste des cles de formation, meme cle que le choix des formations).
'var _cvPdfOrdreFormationsMien = null;' +
'var _cvPdfOrdreFormations = "pertinence";' +
'var _cvPdfOrdreExpPersoMien = null;' +
'var _cvPdfOrdreExpPerso = "pertinence";' +
'var _cvPdfCertifsRubrique = null;' +
'var _cvPdfOrdreMissionsMq = {};' +
'var _cvPdfReglagesRubriquesMq = {};' +
// TACHE (P11, audit "La mise en page" 2026-09-28, retour Denis : "pouvoir
// poser rectangle sur rectangle mais sans cacher le texte -- il faut
// rajouter seulement quel est le plan, 1er, 2e ou 3e") : "plan" (uniquement
// pour le modele "Rectangles arrondis", { b1: 1|2|3, ... }) -- z-index
// choisi par la personne pour chaque rectangle de competences, remplace le
// z-index fixe (b1=1, b2=2, b3=3, cvPdfTemplateMaquette.js) des qu'elle
// clique "1er/2e/3e plan" en plein ecran.
'var _cvPdfEnteteLibreMq = { libre: false, modif: false, disp: null, pos: {}, larg: {}, haut: null, ech: {}, sty: {}, plan: {} };' +
'var _cvPdfEnteteParModele = {};' +
'var _cvPdfCleModeleEntete = null;' +
'var _cvPdfFormatPrecedent = null;' +
'var _cvPdfAvantA5 = null;' +
'var _cvPdfTextesEditesMq = {};' +
// TACHE (Denis, 2026-09-25, tranche 3 « les 7 cartes de la maquette ») : « sac » des choix de la maquette qui n'avaient
// pas encore de variable dediee (Blocs courts, marges en mm, taille des titres, style du titre des formations G/I/S,
// petits carres devant les coordonnees, choix des competences une par une, titre du CV et accroche choisis...). Une cle =
// une option lue telle quelle par le rendu (cvPdfTemplateMaquette.js) ; valeur absente = comportement de la maquette.
// Enregistre avec le CV (dossier.pdfReglages.choixMq) et efface par « Revenir au modele de depart ».
'var _cvPdfChoixMq = {};' +
// TACHE (Denis, 2026-09-25, tranche 6 -- « Niveau de detail : Automatique » de la maquette, C36 / C45) : nombre de missions
// AUTOMATIQUEMENT ramene a n pour certaines experiences afin que le CV tienne sur une page (index de l'experience dans la liste du
// moteur -> n). Recalcule a chaque rafraichissement, jamais enregistre.
'var _cvPdfMissionsAuto = {};' +
// Par competences, niveau Automatique : nombre de missions retirees EN BAS de la liste des competences pour que le CV tienne sur une page (calcule a chaque rendu, jamais enregistre).
'var _cvPdfCompCoupe = 0;' +
// TACHE (P10-bis, retour Denis 2026-09-28, "Proposition B" validee) : cle de la rubrique renvoyee en pleine
// largeur par _pdfEquilibrerColonnes ci-dessous ('perso'/'form'/'certifs'/'centres') ou null -- jamais
// persistee (dossier.pdfReglages), recalculee a zero a chaque rafraichissement, meme principe que
// _cvPdfMissionsAuto juste au-dessus.
'var _cvPdfRubriquePleineLargeurAuto = null;' +
// Denis, 2026-09-29 : meme principe (jamais persistee, recalculee a chaque rafraichissement) -- competences PROFESSIONNELLES en tete de la
// colonne de droite quand il y a de la place (2 colonnes, disposition d'office seulement).
'var _cvPdfCompProDroiteAuto = false;' +
'var _cvPdfPersoGaucheAuto = false;' +
'var _cvPdfFormationsAvantExp = false;' +
'var _cvPdfTitresAgrandis = false;' +
'var _cvPdfOrganisationPerso = false;' +
'var _cvPdfOrdrePersoRubriques = null;' +
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
// TACHE (retour Denis 2026-09-27, decision explicite) : les recettes
// ci-dessous portaient chacune leur propre `police` (verdana/segoe/
// trebuchet/georgia/times selon le modele) -- retiree partout. _pdfEcrireRecetteDOM()
// n'ecrit QUE les champs presents sur l'objet recette (Object.keys) : sans
// ce champ, #regPolice n'est plus jamais touche par un choix de modele
// (manuel ou "Un autre modele"), quel que soit le modele affiche -- seule
// la personne la change, via le select #regPolice. Ne JAMAIS reintroduire
// `police` dans une recette de ce catalogue.
'var _PDF_CREATIF_RECETTES = {' +
// TACHE (Denis, 2026-09-25, tranche 2 « feuille et modeles ») : les 5 modeles Créatif de la MAQUETTE
// (rendu cvPdfTemplateMaquette.js, `gabaritMaquette`). Ils n'ecrivent que ce que fait appliquerGabarit()
// de la maquette (fond, pastilles, icones, colonnes pour « Colonne colorée », couleur de depart) +
// la remise a neutre des reglages de l'ancien rendu, pour qu'aucun reste d'une ancienne recette ne
// s'y melange. « respecteCouleur » : la couleur choisie par la personne n'est JAMAIS ecrasee.
'  mqBandeau: { gabaritMaquette: "bandeau", respecteCouleur: true, icones: true, styleCompetences: "pastille", fondColonnes: "aucun", coinsArrondis: false, styleTitres: "souligne", lectureGuidee: false, anneauPhoto: false, formatExperiences: "standard", bandeauEnTete: false, formeEnTete: "rectangle", degradeBandeau: "fonce-clair", fondColonnePleineHauteur: false, fondColonnesEffet: "fondSeul", degradeColonnes: "fonce-clair", formeColonnes: "rectangle", largeurColonneGauche: 35, colonnesInversees: false, dispositionEntete: "3colonnes", bandeauDisponibilite: false, styleBordures: "fine", couleurDebut: "#2f6690", couleurFin: "#d9e8f2", texteFondColonnes: "blanc" },' +
'  mqDiagonale: { gabaritMaquette: "diagonale", respecteCouleur: true, icones: true, styleCompetences: "pastille", fondColonnes: "aucun", coinsArrondis: false, styleTitres: "souligne", lectureGuidee: false, anneauPhoto: false, formatExperiences: "standard", bandeauEnTete: false, formeEnTete: "rectangle", degradeBandeau: "fonce-clair", fondColonnePleineHauteur: false, fondColonnesEffet: "fondSeul", degradeColonnes: "fonce-clair", formeColonnes: "rectangle", largeurColonneGauche: 35, colonnesInversees: false, dispositionEntete: "3colonnes", bandeauDisponibilite: false, styleBordures: "fine", couleurDebut: "#2f6690", couleurFin: "#d9e8f2", texteFondColonnes: "blanc" },' +
'  mqColonne: { gabaritMaquette: "colonne", respecteCouleur: true, icones: true, styleCompetences: "pastille", fondColonnes: "droite", colonnes: 2, coinsArrondis: false, styleTitres: "souligne", lectureGuidee: false, anneauPhoto: false, formatExperiences: "standard", bandeauEnTete: false, formeEnTete: "rectangle", degradeBandeau: "fonce-clair", fondColonnePleineHauteur: false, fondColonnesEffet: "fondSeul", degradeColonnes: "fonce-clair", formeColonnes: "rectangle", largeurColonneGauche: 35, colonnesInversees: false, dispositionEntete: "3colonnes", bandeauDisponibilite: false, styleBordures: "fine", couleurDebut: "#2f6690", couleurFin: "#d9e8f2", texteFondColonnes: "blanc" },' +
'  mqCadre: { gabaritMaquette: "cadre", respecteCouleur: true, icones: true, styleCompetences: "pastille", fondColonnes: "aucun", coinsArrondis: false, styleTitres: "souligne", lectureGuidee: false, anneauPhoto: false, formatExperiences: "standard", bandeauEnTete: false, formeEnTete: "rectangle", degradeBandeau: "fonce-clair", fondColonnePleineHauteur: false, fondColonnesEffet: "fondSeul", degradeColonnes: "fonce-clair", formeColonnes: "rectangle", largeurColonneGauche: 35, colonnesInversees: false, dispositionEntete: "3colonnes", bandeauDisponibilite: false, styleBordures: "fine", couleurDebut: "#1c3d52", couleurFin: "#dbe4ea", texteFondColonnes: "blanc" },' +
'  mqPicto: { gabaritMaquette: "picto", respecteCouleur: true, icones: true, styleCompetences: "pastille", fondColonnes: "aucun", coinsArrondis: false, styleTitres: "souligne", lectureGuidee: false, anneauPhoto: false, formatExperiences: "standard", bandeauEnTete: false, formeEnTete: "rectangle", degradeBandeau: "fonce-clair", fondColonnePleineHauteur: false, fondColonnesEffet: "fondSeul", degradeColonnes: "fonce-clair", formeColonnes: "rectangle", largeurColonneGauche: 35, colonnesInversees: false, dispositionEntete: "3colonnes", bandeauDisponibilite: false, styleBordures: "fine", couleurDebut: "#7d2e43", couleurFin: "#f0dde2", texteFondColonnes: "blanc" },' +
'  sidebarVague: {' +
'    gabaritMaquette: "lateral", colonneVague: true,' +
'    icones: false, iconesCoordonnees: false, styleCompetences: "pastille", coinsArrondis: true, styleTitres: "bandeau",' +
'    lectureGuidee: false, anneauPhoto: true, formatExperiences: "ameliore", pilluleExperiences: true,' +
'    separateurColonnes: false, bandeauEnTete: false, formeEnTete: "rectangle", degradeBandeau: "aucun",' +
'    fondColonnePleineHauteur: true, fondColonnes: "gauche", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "rectangle", colonnes: 2, largeurColonneGauche: 35,' +
'    colonnesInversees: false, dispositionEntete: "2colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    couleurDebut: "#3B2E5C", couleurFin: "#8172B0", texteFondColonnes: "blanc"' +
'  },' +
'  rubanDiagonal: {' +
'    gabaritMaquette: "diagonale",' +
'    icones: false, iconesCoordonnees: false, styleCompetences: "pastille", coinsArrondis: true, styleTitres: "bandeau",' +
'    lectureGuidee: false, anneauPhoto: true, formatExperiences: "ameliore", pilluleExperiences: true,' +
'    separateurColonnes: false, bandeauEnTete: true, formeEnTete: "diagonale", degradeBandeau: "fonce-clair",' +
'    fondColonnePleineHauteur: false, fondColonnes: "aucun", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "rectangle", colonnes: 2, largeurColonneGauche: 50,' +
'    colonnesInversees: false, dispositionEntete: "3colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    couleurDebut: "#0F6E56", couleurFin: "#5DCAA5", texteFondColonnes: "blanc"' +
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
'    gabaritMaquette: "bandeau",' +
'    icones: false, iconesCoordonnees: false, styleCompetences: "texte", coinsArrondis: true, styleTitres: "bandeau",' +
'    lectureGuidee: false, anneauPhoto: true, formatExperiences: "standard", pilluleExperiences: false,' +
'    separateurColonnes: false, bandeauEnTete: true, formeEnTete: "rectangle", degradeBandeau: "aucun",' +
'    fondColonnePleineHauteur: false, fondColonnes: "aucun", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "rectangle", colonnes: 2, largeurColonneGauche: 50,' +
'    colonnesInversees: false, dispositionEntete: "2colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    couleurDebut: "#2f6690", couleurFin: "#6fa3c7", texteFondColonnes: "blanc",' +
'    photoForme: "rond", blocsCompetencesEncadres: true, cadrePage: false, enteteCentree: false, nomVertical: false, filetHaut: false, photoMedaillon: false' +
'  },' +
'  cadreBarre: {' +
'    gabaritMaquette: "cadre",' +
'    icones: false, iconesCoordonnees: false, styleCompetences: "pastille", coinsArrondis: false, styleTitres: "bandeau",' +
'    lectureGuidee: false, anneauPhoto: true, formatExperiences: "ameliore", pilluleExperiences: true,' +
'    separateurColonnes: true, bandeauEnTete: false, formeEnTete: "rectangle", degradeBandeau: "aucun",' +
'    fondColonnePleineHauteur: false, fondColonnes: "aucun", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "rectangle", colonnes: 2, largeurColonneGauche: 36,' +
'    colonnesInversees: false, dispositionEntete: "2colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    couleurDebut: "#1c3d52", couleurFin: "#3d6a8a", texteFondColonnes: "blanc",' +
'    photoForme: "rond", blocsCompetencesEncadres: false, cadrePage: true, enteteCentree: true, nomVertical: false, filetHaut: false, photoMedaillon: false' +
'  },' +
'  bandeauVertical: {' +
'    gabaritMaquette: "bandeau",' +
'    icones: false, iconesCoordonnees: false, styleCompetences: "pastille", coinsArrondis: false, styleTitres: "bandeau",' +
'    lectureGuidee: false, anneauPhoto: false, formatExperiences: "ameliore", pilluleExperiences: true,' +
'    separateurColonnes: false, bandeauEnTete: true, formeEnTete: "rectangle", degradeBandeau: "aucun",' +
'    fondColonnePleineHauteur: false, fondColonnes: "aucun", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "rectangle", colonnes: 2, largeurColonneGauche: 40,' +
'    colonnesInversees: false, dispositionEntete: "2colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    couleurDebut: "#1c1c1c", couleurFin: "#333333", texteFondColonnes: "blanc",' +
'    photoForme: "rond", blocsCompetencesEncadres: false, cadrePage: false, enteteCentree: false, nomVertical: true, filetHaut: false, photoMedaillon: false' +
'  },' +
'  triangleSavoir: {' +
'    gabaritMaquette: "bandeau",' +
'    icones: false, iconesCoordonnees: false, styleCompetences: "rectangle", coinsArrondis: false, styleTitres: "souligne",' +
'    lectureGuidee: false, anneauPhoto: true, formatExperiences: "ameliore", pilluleExperiences: false,' +
'    separateurColonnes: false, bandeauEnTete: true, formeEnTete: "coin", degradeBandeau: "aucun",' +
'    fondColonnePleineHauteur: false, fondColonnes: "aucun", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "rectangle", colonnes: 2, largeurColonneGauche: 36,' +
'    colonnesInversees: false, dispositionEntete: "2colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    couleurDebut: "#0b5c47", couleurFin: "#3f9478", texteFondColonnes: "blanc",' +
'    photoForme: "rond", blocsCompetencesEncadres: false, cadrePage: false, enteteCentree: false, nomVertical: false, filetHaut: false, photoMedaillon: false' +
'  },' +
'  vagueMarine: {' +
'    gabaritMaquette: "bandeau", enteteVague: true,' +
'    icones: false, iconesCoordonnees: false, styleCompetences: "pastille", coinsArrondis: true, styleTitres: "bandeau",' +
'    lectureGuidee: false, anneauPhoto: true, formatExperiences: "ameliore", pilluleExperiences: true,' +
'    separateurColonnes: false, bandeauEnTete: true, formeEnTete: "rectangle", degradeBandeau: "aucun",' +
'    fondColonnePleineHauteur: false, fondColonnes: "aucun", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "rectangle", colonnes: 2, largeurColonneGauche: 50,' +
'    colonnesInversees: false, dispositionEntete: "2colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    couleurDebut: "#1c3d52", couleurFin: "#3d6a8a", texteFondColonnes: "blanc",' +
'    photoForme: "rond", blocsCompetencesEncadres: false, cadrePage: false, enteteCentree: false, nomVertical: false, filetHaut: false, photoMedaillon: false' +
'  },' +
'  diagonalesContrastees: {' +
'    gabaritMaquette: "diagonale",' +
'    icones: false, iconesCoordonnees: false, styleCompetences: "pastille", coinsArrondis: false, styleTitres: "bandeau",' +
'    lectureGuidee: false, anneauPhoto: true, formatExperiences: "ameliore", pilluleExperiences: false,' +
'    separateurColonnes: false, bandeauEnTete: true, formeEnTete: "diagonale", degradeBandeau: "fonce-clair",' +
'    fondColonnePleineHauteur: false, fondColonnes: "aucun", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "rectangle", colonnes: 2, largeurColonneGauche: 50,' +
'    colonnesInversees: false, dispositionEntete: "2colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    couleurDebut: "#111111", couleurFin: "#F2B705", texteFondColonnes: "blanc",' +
'    photoForme: "rond", blocsCompetencesEncadres: false, cadrePage: false, enteteCentree: false, nomVertical: false, filetHaut: false, photoMedaillon: false' +
'  },' +
'  losangeVert: {' +
'    gabaritMaquette: "neutre",' +
'    icones: false, iconesCoordonnees: false, styleCompetences: "barre", coinsArrondis: false, styleTitres: "souligne",' +
'    lectureGuidee: false, anneauPhoto: false, formatExperiences: "ameliore", pilluleExperiences: false,' +
'    separateurColonnes: false, bandeauEnTete: false, formeEnTete: "rectangle", degradeBandeau: "aucun",' +
'    fondColonnePleineHauteur: false, fondColonnes: "aucun", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "rectangle", colonnes: 2, largeurColonneGauche: 36,' +
'    colonnesInversees: false, dispositionEntete: "2colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    couleurDebut: "#3d6b2c", couleurFin: "#7fae3f", texteFondColonnes: "blanc",' +
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
'    gabaritMaquette: "picto",' +
'    icones: true, iconesCoordonnees: true, styleCompetences: "pastille", coinsArrondis: true, styleTitres: "pastille",' +
'    lectureGuidee: false, anneauPhoto: false, formatExperiences: "ameliore", pilluleExperiences: false,' +
'    separateurColonnes: false, bandeauEnTete: false, formeEnTete: "rectangle", degradeBandeau: "aucun",' +
'    fondColonnePleineHauteur: false, fondColonnes: "aucun", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "rectangle", colonnes: 2, largeurColonneGauche: 33,' +
'    colonnesInversees: false, dispositionEntete: "2colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    couleurDebut: "#7d2e43", couleurFin: "#c98a9a", texteFondColonnes: "blanc",' +
'    photoForme: "rond", blocsCompetencesEncadres: false, cadrePage: false, enteteCentree: false, nomVertical: false, filetHaut: true, photoMedaillon: false' +
'  },' +
'  medaillon: {' +
'    gabaritMaquette: "bandeau",' +
'    icones: true, iconesCoordonnees: true, styleCompetences: "pastille", coinsArrondis: true, styleTitres: "souligne",' +
'    lectureGuidee: false, anneauPhoto: false, formatExperiences: "ameliore", pilluleExperiences: false,' +
'    separateurColonnes: false, bandeauEnTete: true, formeEnTete: "rectangle", degradeBandeau: "aucun",' +
'    fondColonnePleineHauteur: false, fondColonnes: "aucun", fondColonnesEffet: "fondSeul",' +
'    degradeColonnes: "fonce-clair", formeColonnes: "rectangle", colonnes: 2, largeurColonneGauche: 32,' +
'    colonnesInversees: false, dispositionEntete: "2colonnes", bandeauDisponibilite: false,' +
'    styleProfessionnel: "epure", stylePersonnel: "epure", styleBordures: "fine",' +
'    soulignerPoste: false, italiquePoste: false, soulignerDates: false, italiqueDates: false,' +
'    soulignerEntreprise: false, italiqueEntreprise: false, ordreExperiences: "pertinence",' +
'    couleurDebut: "#33475b", couleurFin: "#6f88a3", texteFondColonnes: "blanc",' +
'    photoForme: "rond", blocsCompetencesEncadres: false, cadrePage: false, enteteCentree: false, nomVertical: false, filetHaut: false, photoMedaillon: true' +
'  },' +
// TACHE (phase 5.2, 6e modele de la galerie, port de la maquette) :
// recette MINIMALE -- contrairement aux 10 autres, "frise" ne passe pas
// par le rendu standard de _pdfConstruireStyleEtPage (dispatch immediat
// vers _pdfConstruireFrise(), voir cvPdfTemplateA4.js) : la plupart des
// champs de recette habituels (colonnes, bandeauEnTete, styleTitres...)
// n\'ont donc aucun sens ici, jamais lus. Seule la couleur de depart
// compte reellement (meme teinte chaude "orange" que MODEL_COULEUR.frise
// de la maquette, C46/§2.5 du cahier : "le modele Colonne et frise garde
// son orange de depart"), reprise par _pdfConstruireFrise via opts.couleurDebut
// (deja lu normalement, un controle DOM existe bien : regCouleurDebut).
'  rectangles: { gabaritMaquette: "rectangles", respecteCouleur: true, icones: false, iconesCoordonnees: false, colonnes: 1, couleurDebut: "#2f5597", couleurFin: "#8faadc", texteFondColonnes: "blanc" },' +
'  photoFrise: { gabaritMaquette: "photo", respecteCouleur: true, icones: true, iconesCoordonnees: true, colonnes: 2, couleurDebut: "#1f4e9c", couleurFin: "#5b83c4", texteFondColonnes: "blanc" },' +
'  frise: { respecteCouleur: true, couleurDebut: "#d4974f", couleurFin: "#e8bf8f", texteFondColonnes: "blanc" }' +
'};' +
// TACHE (Denis, 2026-09-23 : "ok pour 1" -- suite au constat que 6 des 12
// modeles reels etaient devenus injoignables, ni galerie ni de, des que
// le de s'est mis a cycler sur la seule galerie de 6 au lieu des 11
// recettes reelles) : _PDF_GALERIE_CREATIF_IDS (qui ne servait plus qu'a
// ca cote iframe) est retiree d'ici -- _pdfProposerAutreModeleCreatif()
// (plus bas) cycle desormais directement sur Object.keys(_PDF_CREATIF_RECETTES),
// les 12 modeles reels, jamais une liste separee a synchroniser a la
// main. La galerie de vignettes cliquables (6 modeles, cote PARENT --
// js/app.js, _MEP_GALERIE_CREATIF -- et sa propre _PDF_GALERIE_CREATIF_IDS
// qui fabrique les boutons caches juste en haut de ce fichier) reste,
// elle, inchangee : la vitrine montre 6 modeles, le de les atteint TOUS.
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
'function _pdfCouleurChoisieParLaPersonne() {' +
'  try { return !!window.parent.dossier.reglagesMiseEnPageCV._couleurChoisie; } catch (e) { return false; }' +
'}' +
'function _pdfIdControlePour(champ) { return "reg" + champ.charAt(0).toUpperCase() + champ.slice(1); }' +
'function _pdfEcrireRecetteDOM(recette) {' +
'  Object.keys(recette).forEach(function (champ) {' +
'    if (champ === "pilluleExperiences") { return; }' +
'    if (recette.respecteCouleur && (champ === "couleurDebut" || champ === "couleurFin") && _pdfCouleurChoisieParLaPersonne()) { return; }' +
'    var el = document.getElementById(_pdfIdControlePour(champ));' +
'    if (!el) { return; }' +
'    if (el.type === "checkbox") { el.checked = recette[champ]; } else { el.value = recette[champ]; }' +
'  });' +
'}' +
// TACHE (Denis, 2026-09-25, tranche 2) : retour au STANDARD de la maquette (appliquerGabarit() sans modele : fond
// aucun, pastilles, sans icones, couleur de depart si la personne n\'en a pas choisi une). Sert quand le retour
// depuis Sobre / Créatif n\'a plus son instantane « avant » (le panneau est reconstruit a chaque changement) : sans
// cela, les icones, le fond ou les reglages d\'un modele restaient sur le Standard.
'var _PDF_RECETTE_STANDARD_MAQUETTE = { respecteCouleur: true, icones: false, styleCompetences: "pastille", fondColonnes: "aucun", coinsArrondis: false, styleTitres: "souligne", lectureGuidee: false, anneauPhoto: false, formatExperiences: "standard", bandeauEnTete: false, formeEnTete: "rectangle", degradeBandeau: "fonce-clair", fondColonnePleineHauteur: false, fondColonnesEffet: "fondSeul", degradeColonnes: "fonce-clair", formeColonnes: "rectangle", largeurColonneGauche: 35, colonnesInversees: false, dispositionEntete: "3colonnes", bandeauDisponibilite: false, styleBordures: "fine", couleurDebut: "#2f6690", couleurFin: "#d9e8f2" };' +
'function _pdfAppliquerStandardMaquetteDOM() {' +
'  _pdfEcrireRecetteDOM(_PDF_RECETTE_STANDARD_MAQUETTE);' +
'  _cvPdfOrdrePersonnalise = null;' +
'  _cvPdfPositionsEntete = {};' +
'}' +
'function _pdfAppliquerRecetteCreatifDOM(variante) {' +
'  var recette = _PDF_CREATIF_RECETTES[variante] || _PDF_CREATIF_RECETTES.sidebarVague;' +
'  _pdfEcrireRecetteDOM(recette);' +
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
'  langues: "Langues", loisirs: "Centres d\'intérêt", engagements: "Expérience personnelle", infos: "Informations complémentaires", certifications: "Certifications",' +
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
'    styleFormations: document.getElementById("regStyleFormations").value,' +
'    separateurMissions: document.getElementById("regSeparateurMissions").value,' +
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
'    formatExperiences: document.getElementById("regFormatExperiences").value,' +
// TACHE (phase 5.4, carte "Experiences professionnelles") : nouveaux
// champs, tous des variables hors-DOM (voir leur declaration plus haut,
// meme convention que _cvPdfOrdrePersonnalise -- pas de controle DOM
// dedie ici, la carte elle-meme vit dans le panneau PARENT, js/app.js,
// pas dans cette iframe -- _mepClicMoteur()/appels directs pilotent ces
// variables a distance).
'    modePresentation: _cvPdfModePresentation,' +
'    experiencesTout: _cvPdfExperiencesTout,' +
'    experiencesChoisies: _cvPdfExperiencesChoisies,' +
'    missionsParExperience: _cvPdfMissionsParExperience,' +
'    missionsChoisies: _cvPdfMissionsChoisies,' +
'    missionsGlobal: _cvPdfMissionsGlobal,' +
'    afficherLieu: _cvPdfAfficherLieu,' +
'    qualitesMetierActives: _cvPdfQualitesMetierActives,' +
'    afficherCompetencesPro: _cvPdfAfficherCompPro,' +
'    afficherCompetencesComportementales: _cvPdfAfficherCompComp,' +
'    styleLieu: _cvPdfStyleLieu,' +
'    positionDates: _cvPdfPositionDates,' +
// TACHE (chantier "Experience personnelle", 2026-09-27) : meme convention
// que les 3 champs juste au-dessus (experiencesTout/Choisies/missionsParExperience).
'    experiencePersoTout: _cvPdfExpPersoTout,' +
'    experiencePersoChoisies: _cvPdfExpPersoChoisies,' +
'    missionsParExpPerso: _cvPdfExpPersoMissionsParItem,' +
'    missionsChoisiesExpPerso: _cvPdfExpPersoMissionsChoisies,' +
'    texteParExpPerso: _cvPdfExpPersoTexteParItem,' +
'    expPersoModeAffichage: _cvPdfExpPersoModeAffichage,' +
'    formationsTout: _cvPdfFormationsTout,' +
'    formationsChoisies: _cvPdfFormationsChoisies,' +
'    missionsParFormation: _cvPdfFormationsMissionsParItem,' +
'    missionsChoisiesFormation: _cvPdfFormationsMissionsChoisies,' +
'    texteParFormation: _cvPdfFormationsTexteParItem,' +
// TACHE (P10-bis, retour Denis 2026-09-28) : jamais persistee (voir _pdfEquilibrerColonnes), juste
// transmise au gabarit pour la construction EN COURS.
'    rubriquePleineLargeur: _cvPdfRubriquePleineLargeurAuto,' +
'    compProDroiteAuto: _cvPdfCompProDroiteAuto,' +
'    persoGaucheAuto: _cvPdfPersoGaucheAuto,' +
'    positionDatesChoisie: _cvPdfPositionDatesChoisie,' +
'    datesAlignees: _cvPdfDatesAlignees,' +
'    positionDatesFormations: _pdfPositionDatesRubrique("formations"),' +
'    positionDatesPerso: _pdfPositionDatesRubrique("perso"),' +
// TACHE (P10, retour Denis 2026-09-28) : valeur EFFECTIVE transmise au gabarit --
// null (jamais touche) suit le mode de presentation (actif par defaut en Mixte),
// sinon le choix explicite de la personne prime toujours.
'    afficherMissionsFormation: (_cvPdfAfficherMissionsFormation === null || _cvPdfAfficherMissionsFormation === undefined) ? (_cvPdfModePresentation === "B") : !!_cvPdfAfficherMissionsFormation,' +
'    espacementFormations: _cvPdfEspacementFormations,' +
'    competencesProfessionnellesMax: _cvPdfCompetencesProMax,' +
'    competencesComportementalesMax: _cvPdfCompetencesComportementalesMax,' +
'    competencesEnHaut: _cvPdfCompetencesEnHaut,' +
'    formationsAvantExp: _cvPdfFormationsAvantExp,' +
'    titresAgrandis: _cvPdfTitresAgrandis,' +
'    organisationPerso: _cvPdfOrganisationPerso,' +
'    ordrePersoRubriques: _cvPdfOrdrePersoRubriques,' +
'    missionsAuto: _cvPdfMissionsAuto,' +
'    niveauDetail: _pdfNiveauDetail(),' +
'    compCoupe: _cvPdfCompCoupe,' +
'    missionsDefaut: _pdfMissionsDefautNb()' +
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
'    opts.sobreVariante = _pdfMigrerVarianteSobre(_cvPdfSobreVariante) || "mq-bandeau";' +
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
// TACHE (Denis, 2026-09-25, tranche 2) : modele Sobre de la MAQUETTE : le rendu est celui de la maquette
// (gabaritMaquette) et les reglages restent ceux de la PERSONNE (lus des controles), pas ceux forces
// pour les anciennes variantes ci-dessus.
'    if ((opts.sobreVariante || "").indexOf("mq-") === 0) {' +
'      opts.gabaritMaquette = "sobre-" + opts.sobreVariante.slice(3);' +
'      opts.iconesRubriques = document.getElementById("regIcones").checked;' +
'      opts.iconesCoordonnees = document.getElementById("regIconesCoordonnees").checked;' +
'      opts.styleCompetences = document.getElementById("regStyleCompetences").value;' +
'      opts.coinsArrondis = document.getElementById("regCoinsArrondis").checked;' +
'      opts.styleTitres = document.getElementById("regStyleTitres").value;' +
'      opts.lectureGuidee = document.getElementById("regLectureGuidee").checked;' +
'      opts.fondColonnePleineHauteur = document.getElementById("regFondColonnePleineHauteur").checked;' +
'      opts.formeColonnes = document.getElementById("regFormeColonnes").value;' +
'      opts.formeEnTete = document.getElementById("regFormeEnTete").value;' +
'      opts.styleBordures = document.getElementById("regStyleBordures").value;' +
'      opts.fondColonnes = document.getElementById("regFondColonnes").value;' +
'      opts.fondColonnesEffet = document.getElementById("regFondColonnesEffet").value;' +
'      opts.degradeColonnes = document.getElementById("regDegradeColonnes").value;' +
'      opts.bandeauEnTete = document.getElementById("regBandeauEnTete").checked;' +
'      opts.degradeBandeau = document.getElementById("regDegradeBandeau").value;' +
'    }' +
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
// TACHE (phase 5.2, modele "Colonne et frise") : seul le gabarit "frise"
// a une STRUCTURE differente (grille propre, jamais le systeme standard
// 1/2 colonnes) -- ce simple indicateur suffit a _pdfConstruireStyleEtPage
// (cvPdfTemplateA4.js) pour dispatcher tout au debut, voir sa propre
// note. Les autres champs de la recette "frise" (couleurDebut...) restent
// lus normalement par la boucle juste au-dessus.
'    opts.gabaritCreatif = (_creatifVar === "frise") ? "frise" : "";' +
'  }' +
// TACHE (Denis, 2026-09-25) : valeur EFFECTIVE de « Competences en haut » (null = comme le modele).
'  opts.competencesEnHaut = (_cvPdfCompetencesEnHaut === null || _cvPdfCompetencesEnHaut === undefined) ? window.parent._pdfCompetencesEnHautParDefaut(opts) : !!_cvPdfCompetencesEnHaut;' +
'  opts.competencesRetirees = _cvPdfCompetencesRetirees;' +
'  opts.rubriquesRetirees = _cvPdfRubriquesRetirees;' +
'  opts.missionsRetirees = _cvPdfMissionsRetirees;' +
'  opts.ordreExperiencesMien = _cvPdfOrdreExperiencesMien;' +
'  opts.ordreFormationsMien = _cvPdfOrdreFormationsMien;' +
'  opts.ordreFormations = _cvPdfOrdreFormations;' +
'  opts.ordreExpPersoMien = _cvPdfOrdreExpPersoMien;' +
'  opts.ordreExpPerso = _cvPdfOrdreExpPerso;' +
'  opts.certifsRubrique = _cvPdfCertifsRubrique;' +
'  opts.ordreMissions = _cvPdfOrdreMissionsMq;' +
'  opts.reglagesRubriques = _cvPdfReglagesRubriquesMq;' +
'  opts.enteteLibre = _cvPdfEnteteLibreMq;' +
'  opts.textesEdites = _cvPdfTextesEditesMq;' +
'  Object.keys(_cvPdfChoixMq).forEach(function (k) { opts[k] = _cvPdfChoixMq[k]; });' +
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
// TACHE (Denis, 2026-09-25, tranche 4) : construit { css, pageHtml, ... } SANS toucher au DOM de ce panneau. Partage
// par _pdfRafraichir (petit apercu) et par le plein ecran de la maquette (js/app.js -> _pdfMqResultat).
'function _pdfConstruireResultatCourant(format, opts) {' +
'  var donnees = window.parent.construireDonneesPdfCV(window.__cvPdfDossierSource, format, opts.bandeauDisponibilite, opts.regroupementActif, (opts.modePresentation === "B" || opts.modePresentation === "C") ? "parCompetences" : null, (opts.modePresentation === "B" || opts.modePresentation === "C") ? opts.modePresentation : null);' +
'  window.parent._mepExperiencesMoteur = donnees.objetCV.experiences || [];' +
'  window.parent._mepQualitesMetier = donnees.qualitesAttenduesMetier || [];' +
'  window.parent._mepProAttendues = donnees.competencesProAttendues || [];' +
'  window.parent._mepSecteurReferentiel = donnees.secteurReferentiel || null;' +
// TACHE (chantier "Experience personnelle", 2026-09-27) : meme principe que
// la ligne juste au-dessus, pour la carte "Experience personnelle" -- liste
// FUSIONNEE (savoir-faire perso + engagements), ordre du moteur.
'  window.parent._mepExperiencePersoMoteur = (donnees.objetCV.experiencesPersonnelles || []).concat(donnees.objetCV.engagements || []);' +
// TACHE (retour Denis 2026-09-28, chantier "Formations regroupent tout") : meme principe EXACT
// que les 2 lignes juste au-dessus -- SANS ce miroir, le panneau lisait dossier.formations BRUT
// (jamais enrichi des missions IA de formationsAvecMissions/certificationsAvecMissions,
// moteurDecisionCV.js, appliquees seulement au rendu) -- bug reel, meme famille que les autres
// "trous" de captation deja corriges aujourd'hui. _pdfFormationsEtCertifications (cvPdfTemplateA4.js)
// fusionne aussi les certifications, meme liste que ce que le rendu affiche reellement.
// TACHE (bug reel trouve en verifiant : cvPdfTemplateA4.js/cvPdfTemplateMaquette.js ne sont
// PAS dans le script de cette iframe -- window.parent.construireDonneesPdfCV juste au-dessus le
// prouve deja -- un appel BARE a _pdfFormationsEtCertifications echouait donc silencieusement
// (undefined) et retombait toujours sur le repli. Prefixe window.parent., comme le reste de
// cette fonction.
'  window.parent._mepFormationsMoteur = (typeof window.parent._pdfFormationsEtCertifications === "function") ? window.parent._pdfFormationsEtCertifications(donnees.objetCV) : (donnees.objetCV.formations || []);' +
'  var resultat;' +
'  if (format === "A5-portrait" || format === "A5-paysage") {' +
'    resultat = window.parent._pdfConstruireStyleEtPageA5(donnees.objetCV, donnees.composition, opts);' +
'  } else {' +
'    opts.competencesCles = donnees.competencesCles;' +
'    opts.competencesProfessionnelles = donnees.competencesProfessionnelles;' +
'    opts.competencesComportementales = donnees.competencesComportementales;' +
'    opts.qualitesAttenduesMetier = donnees.qualitesAttenduesMetier;' +
'    opts.placesQualitesMetier = donnees.placesQualitesMetier;' +
'    opts.reservoirCompetences = donnees.reservoirCompetences;' +
'    window.__cvPdfCompetencesInfo = { autoPro: opts.competencesProfessionnelles, autoComp: opts.competencesComportementales, pool: donnees.reservoirCompetences };' +
'    resultat = window.parent._pdfConstruireStyleEtPage(donnees.objetCV, donnees.composition, opts);' +
'  }' +
'  return resultat;' +
'}' +
'function _pdfMqResultat() {' +
'  var opts = _pdfLireOptions();' +
'  return { resultat: _pdfConstruireResultatCourant(document.getElementById("regFormatCV").value, opts), opts: opts };' +
'}' +
'function _pdfInjecterResultat(resultat) {' +
'  document.getElementById("styleCv").textContent = resultat.css;' +
'  document.getElementById("conteneurPage").innerHTML = resultat.pageHtml;' +
'}' +
// « Automatique » (maquette) : seulement en A4 sur une page, mode chronologique, et tant que la personne n'a choisi ni « Complet »
// (10) ni « Resume » (1). Le nombre de missions par defaut (ou choisi avec − / +) est un MAXIMUM.
// LIM-4 : nombre de missions montrees par defaut par experience (2 si le CV compte 3 experiences ou plus, sinon 3) ; regle unique
// dans modules/cv-core/normaliserDonneesCV.js, jamais un chiffre ecrit ici.
'function _pdfMissionsDefautNb() {' +
'  var n = ((typeof window.parent._mepListeExperiencesMoteur === "function") ? window.parent._mepListeExperiencesMoteur() : (window.parent._mepExperiencesMoteur || [])).length;' +
'  return (typeof window.parent._cvMissionsParDefaut === "function") ? window.parent._cvMissionsParDefaut(n) : 3;' +
'}' +
// Niveau de detail (« Automatique » / « Complet » / « Resume »), meme regle que la carte Experiences (cvPdfCartesMaquette.js) : 1 = Resume ; le maximum reel de
// missions d\'une experience (ou plus) = Complet ; sinon Automatique. Valable pour TOUS les modes de presentation (retour Denis 2026-10-02).
'function _pdfNiveauDetail() {' +
'  if (_cvPdfMissionsGlobal === 1) { return "resume"; }' +
'  var liste = (typeof window.parent._mepListeExperiencesMoteur === "function") ? window.parent._mepListeExperiencesMoteur() : (window.parent._mepExperiencesMoteur || []);' +
'  var max = 1; liste.forEach(function (e) { max = Math.max(max, window.parent._pdfDecouperMissions(e.missions || "").length); });' +
'  return (_cvPdfMissionsGlobal !== null && _cvPdfMissionsGlobal !== undefined && _cvPdfMissionsGlobal >= max) ? "complet" : "auto";' +
'}' +
// Automatique : chronologique ET mixte (les missions des experiences raccourcissent d\'abord les moins pertinentes) ; « Complet » ne raccourcit jamais (avant : seul un
// reglage a exactement 10 etait reconnu, un « Complet » a 4 missions pouvait encore etre raccourci).
'function _pdfAutoActif(format) {' +
'  return format === "A4-detaille" && (_cvPdfModePresentation === "A" || _cvPdfModePresentation === "B") && _pdfNiveauDetail() === "auto";' +
'}' +
// Candidate : l'experience la MOINS pertinente (la derniere de la liste du moteur) qui a encore plus d'une mission et dont la personne
// n\'a fixe ni le nombre ni le choix. Jamais une experience retiree : au minimum une mission.
'function _pdfAutoCandidat() {' +
'  var liste = window.parent._mepExperiencesMoteur || [];' +
'  var plafond = _cvPdfMissionsGlobal || _pdfMissionsDefautNb();' +
'  var candidat = null;' +
'  for (var i = 0; i < liste.length; i++) {' +
'    if (_cvPdfExperiencesTout === "pertinentes" && _cvPdfExperiencesChoisies && _cvPdfExperiencesChoisies.indexOf(i) === -1) { continue; }' +
'    if (_cvPdfMissionsParExperience[i] != null || _cvPdfMissionsChoisies[i]) { continue; }' +
'    var total = window.parent._pdfDecouperMissions(liste[i].missions).length;' +
'    var n = (_cvPdfMissionsAuto[i] != null) ? _cvPdfMissionsAuto[i] : Math.min(total, plafond);' +
'    if (n > 1) { candidat = { idx: i, n: n }; }' +
'  }' +
'  return candidat;' +
'}' +
// Par competences, niveau Automatique (retour Denis 2026-10-02) : autant de missions que la page peut en contenir ; si le CV deborde, on retire d\'abord les DERNIERES
// missions de la liste (les plus importantes sont en haut), une par une, en mesurant, avant de toucher a quoi que ce soit d\'autre.
'function _pdfRaccourcirCompetencesAuto(format, resultat) {' +
'  _cvPdfCompCoupe = 0;' +
'  if (format !== "A4-detaille" || _cvPdfModePresentation !== "C" || _pdfNiveauDetail() !== "auto") { return resultat; }' +
'  _pdfInjecterResultat(resultat);' +
'  var essais = 0;' +
'  while (_pdfMesurerHauteurPage() > 1125 && essais < 60) {' +
'    essais++;' +
'    var nb = 0; (window.parent._mepGroupesCompTous || []).forEach(function (g) { g.items.forEach(function (it) { if (it.affichee) { nb++; } }); });' +
'    if (nb <= 1) { break; }' +
'    _cvPdfCompCoupe++;' +
'    resultat = _pdfConstruireResultatCourant(format, _pdfLireOptions());' +
'    _pdfInjecterResultat(resultat);' +
'  }' +
'  return resultat;' +
'}' +
'function _pdfRaccourcirAutomatiquement(format, resultat) {' +
'  _cvPdfMissionsAuto = {};' +
'  window.parent._mepMissionsAuto = _cvPdfMissionsAuto;' +
'  window.parent._mepAutoRaccourcies = 0;' +
'  _cvPdfCompCoupe = 0;' +
'  if (!_pdfAutoActif(format)) { return _pdfRaccourcirCompetencesAuto(format, resultat); }' +
'  _pdfInjecterResultat(resultat);' +
'  var essais = 0;' +
'  while (_pdfMesurerHauteurPage() > 1125 && essais < 90) {' +
'    essais++;' +
'    var c = _pdfAutoCandidat();' +
'    if (!c) { break; }' +
'    _cvPdfMissionsAuto[c.idx] = c.n - 1;' +
'    resultat = _pdfConstruireResultatCourant(format, _pdfLireOptions());' +
'    _pdfInjecterResultat(resultat);' +
'  }' +
'  window.parent._mepAutoRaccourcies = Object.keys(_cvPdfMissionsAuto).length;' +
'  return resultat;' +
'}' +
// TACHE (P10-bis, retour Denis 2026-09-28, "Quand je choisis 2 colonnes et que j'ai les competences perso
// developpe, alors cette rubrique sera toujours dans la colonne de droite" -- maquette
// docs/MAQUETTE_RUBRIQUES_DEBORDANTES_2026-09-28.html, "Proposition B" validee) : mesure REELLEMENT la
// hauteur des 2 colonnes (meme principe que _pdfRaccourcirAutomatiquement -- injecter, mesurer, ajuster,
// re-injecter), et si l\'ecart depasse le seuil, fait passer la rubrique responsable en pleine largeur sous
// les 2 colonnes (jamais une case a cocher, recalcule a chaque rafraichissement). Rubriques candidates :
// Expérience personnelle, Formations, Certifications, Centres d\'interet (jamais Experience professionnelle,
// toujours a droite par regle deja actee, ni les blocs de competences, deja regles a part par P10). Priorite
// donnee a la rubrique la plus recemment developpee (perso, cf. le cas concret signale par Denis) en cas de
// plusieurs candidates presentes a la fois dans la colonne la plus longue.
// TACHE (retour Denis 2026-09-28, point 14) : "centres" retire (Langues + Centres d'interet
// toujours en pleine largeur en bas de page desormais, jamais equilibrees ici -- voir
// cvPdfTemplateMaquette.js, _PDF_RUBRIQUES_PLEINE_LARGEUR).
'var _PDF_RUBRIQUES_PL_NOMS = { perso: "Expérience personnelle", form: "Formations", certifs: "Certifications" };' +
'var _PDF_RUBRIQUES_PL_ORDRE = ["perso", "form", "certifs"];' +
'var _PDF_SEUIL_EQUILIBRE_COLONNES_PX = 56;' +
// Denis, 2026-09-29 (deux colonnes, disposition d'office) : « si jamais il y a de la place pour mettre les competences professionnelles avant les
// experiences professionnelles, on le fait ; sinon elles restent en tete de la colonne de gauche ». Essai puis MESURE : gardees a droite seulement si
// la page tient toujours (meme cible que « Mise en page »). Jamais si la personne a personnalise l'ordre (Personnaliser) ou refuse (compProDroite false).
'function _pdfEssayerCompProDroite(format, resultat) {' +
'  if (["A4-detaille", "A4-integral", "A4-essentiel"].indexOf(format) === -1) { return resultat; }' +
'  if (_cvPdfChoixMq.compProDroite === false) { return resultat; }' +
'  if (_pdfLireOptions().organisationPerso || _cvPdfChoixMq.ordreColonnes || _cvPdfOrdrePersoRubriques) { return resultat; }' +
'  _pdfInjecterResultat(resultat);' +
'  var corps = document.querySelector("#conteneurPage .corps.deux");' +
'  if (!corps || corps.children.length < 2) { return resultat; }' +
'  var pro = document.querySelector("#conteneurPage [data-rub=\\"" + window.parent._PDF_INTITULES.competencesPro + "\\"]");' +
'  if (!pro || !corps.children[0].contains(pro)) { return resultat; }' +
'  var cible = HAUTEUR_CIBLE_PX * _pdfMaxPagesAcceptable();' +
'  if (_pdfMesurerHauteurPage() > cible + 2) { return resultat; }' +
'  _cvPdfCompProDroiteAuto = true;' +
'  var essai = _pdfConstruireResultatCourant(format, _pdfLireOptions());' +
'  _pdfInjecterResultat(essai);' +
// Gardee a droite si la page tient. Dans ce cas _pdfEquilibrerColonnes() ne touche plus a rien : l'experience personnelle reste dans la colonne de droite,
// apres les formations (Denis : jamais envoyee en pleine largeur en bas de page).
'  if (_pdfMesurerHauteurPage() <= cible + 2) { return essai; }' +
'  _cvPdfCompProDroiteAuto = false;' +
'  _pdfInjecterResultat(resultat);' +
'  return resultat;' +
'}' +
'function _pdfEquilibrerColonnes(format, resultat) {' +
'  if (["A4-detaille", "A4-integral", "A4-essentiel"].indexOf(format) === -1) { return resultat; }' +
'  if (_cvPdfCompProDroiteAuto) { return resultat; }' +
'  _pdfInjecterResultat(resultat);' +
'  var corps = document.querySelector("#conteneurPage .corps.deux");' +
'  if (!corps || corps.children.length < 2) { return resultat; }' +
'  var hG = corps.children[0].getBoundingClientRect().height;' +
'  var hD = corps.children[1].getBoundingClientRect().height;' +
'  if (Math.abs(hG - hD) <= _PDF_SEUIL_EQUILIBRE_COLONNES_PX) { return resultat; }' +
'  var pluslongue = (hG > hD) ? corps.children[0] : corps.children[1];' +
'  var candidat = null;' +
'  for (var i = 0; i < _PDF_RUBRIQUES_PL_ORDRE.length; i++) {' +
'    var cle = _PDF_RUBRIQUES_PL_ORDRE[i];' +
'    if (pluslongue.querySelector("[data-rub=\\"" + _PDF_RUBRIQUES_PL_NOMS[cle] + "\\"]")) { candidat = cle; break; }' +
'  }' +
'  if (!candidat) { return resultat; }' +
// Denis, 2026-09-29 : l'experience personnelle, faute de place apres les formations, passe ENTIEREMENT dans la colonne de gauche (jamais en pleine largeur).
'  if (candidat === "perso" && pluslongue === corps.children[1]) { _cvPdfPersoGaucheAuto = true; }' +
'  else { _cvPdfRubriquePleineLargeurAuto = candidat; }' +
'  resultat = _pdfConstruireResultatCourant(format, _pdfLireOptions());' +
'  _pdfInjecterResultat(resultat);' +
'  return resultat;' +
'}' +
// Impression depuis l\'iframe : Chrome propose pour le PDF le titre de la PAGE PRINCIPALE, pas celui de l\'iframe (retour Denis 2026-10-02 : le PDF n\'avait pas
// « NOM_poste »). Le titre de la page principale est donc posé le temps de l\'impression, puis rétabli.
'function _pdfImprimerAvecNom() {' +
'  var pageHote = null, titreAvant = "";' +
'  try {' +
'    if (window.parent && window.parent !== window && typeof window.parent.nomFichierCV === "function") {' +
'      pageHote = window.parent.document; titreAvant = pageHote.title;' +
'      pageHote.title = window.parent.nomFichierCV(window.__cvPdfDossierSource || window.parent.dossier);' +
'    }' +
'  } catch (e) { pageHote = null; }' +
'  try { window.print(); } finally { if (pageHote) { try { pageHote.title = titreAvant; } catch (e2) { /* rien */ } } }' +
'}' +
'function _pdfRafraichir() {' +
// Nom propose a l'enregistrement en PDF = titre de la page : « NOM_poste » (retour Denis 2026-10-01), tenu a jour si l\'identite ou le metier change.
'  try { if (window.parent && typeof window.parent.nomFichierCV === "function") { document.title = window.parent.nomFichierCV(window.__cvPdfDossierSource || window.parent.dossier); } } catch (e) { /* titre inchange */ }' +
'  _pdfEchangerReglagesSiFormatChange();' +
'  _pdfEchangerEnteteSiModeleChange();' +
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
// TACHE (P10-bis, retour Denis 2026-09-28) : reinitialise a CHAQUE rafraichissement, jamais une valeur qui
// reste collee d'un reglage a l'autre -- _pdfEquilibrerColonnes() ci-dessous la recalcule a partir de zero.
'  _cvPdfRubriquePleineLargeurAuto = null;' +
'  _cvPdfCompProDroiteAuto = false;' +
'  _cvPdfPersoGaucheAuto = false;' +
'  var opts = _pdfLireOptions();' +
'  var resultat = _pdfConstruireResultatCourant(format, opts);' +
'  resultat = _pdfRaccourcirAutomatiquement(format, resultat);' +
'  resultat = _pdfEssayerCompProDroite(format, resultat);' +
'  resultat = _pdfEquilibrerColonnes(format, resultat);' +
'  _pdfInjecterResultat(resultat);' +
// TACHE (Denis, 2026-09-25, cadre commun) : previent la page hote (ecran « La mise en page ») que le CV vient
// de changer, pour mettre a jour « n experiences affichees / le CV tient sur 1 page » et le message de depassement.
'  if (window.parent && typeof window.parent._pdfMqApresRendu === "function") { window.parent._pdfMqApresRendu(document.querySelector("#conteneurPage .cv")); }' +
'  setTimeout(function () { if (window.parent && typeof window.parent._mepMajInfoPage === "function") { window.parent._mepMajInfoPage(); } }, 0);' +
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
// TACHE (retour Denis 2026-09-19, 5e vague, decision ferme de Denis :
// "si ca retrecit, c'est parce que c'est moi qui decide, pas parce que le
// programme me le fait a ma place") : l'ancien garde-fou automatique
// (_pdfAutoAjusterBandeauSiDebordement(), qui reduisait la taille toute
// seule a chaque rafraichissement des que le metier/l'accroche depassait
// ou chevauchait) est retire d'ici -- retrecissait silencieusement TOUTE
// augmentation manuelle (curseur ou glisser-depose), meme deliberee.
// Seul le cadre rouge visuel (.hors-cadre, voir _pdfVerifierDebordementBlocLibre()
// plus bas, desormais etendu au chevauchement entre blocs) signale encore
// le probleme -- jamais de correction automatique de la taille en dehors
// du bouton explicite "Mise en page" (_pdfAjusterMiseEnPageCalcul(),
// mecanisme separe, inchange, jamais declenche sans clic).' +
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
'    if (el) { el.innerHTML = _cvPdfTextesEdites[id]; _pdfMasquerSiVide(el); }' +
'  });' +
'}' +
// Retour Denis 2026-10-02 : un texte entièrement effacé laissait sa puce (rond, carré...) seule devant rien. Un élément vide est donc retiré de la page
// (avec son <li> s'il est seul dedans) ; la puce est dessinée par l\'élément ou son <li>. Appliqué à la sortie du champ, jamais pendant la frappe.
'function _pdfMasquerSiVide(el) {' +
'  var li = el.closest("li");' +
'  var cible = (li && li.querySelectorAll(_PDF_SELECTEUR_EDITABLE).length <= 1) ? li : el;' +
'  var vide = el.textContent.replace(/[\\u200b\\s]/g, "") === "";' +
'  if (vide) { cible.setAttribute("data-vide", "1"); } else { cible.removeAttribute("data-vide"); if (cible !== el) { el.removeAttribute("data-vide"); } }' +
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
'      _pdfMasquerSiVide(el);' +
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
// TACHE (retour Denis 2026-09-19, 5e vague) : verifie desormais AUSSI le
// chevauchement avec les AUTRES blocs de l'en-tete (pas seulement les
// limites du cadre .entete-libre) -- meme geometrie que l'ancienne
// _pdfAutoAjusterBandeauSiDebordement() (retiree, voir plus haut), mais
// ici pour ALLUMER le cadre rouge, jamais pour corriger la taille a la
// place de la personne (decision Denis : "si ca retrecit, c'est moi qui
// decide"). _pdfRectanglesSeChevauchent() deja definie plus haut, jamais
// une 2e version.
'function _pdfVerifierDebordementBlocLibre(bloc, entete) {' +
'  var br = bloc.getBoundingClientRect();' +
'  var er = entete.getBoundingClientRect();' +
'  var deborde = br.left < er.left - 0.5 || br.top < er.top - 0.5 || br.right > er.right + 0.5 || br.bottom > er.bottom + 0.5;' +
'  var chevauche = false;' +
'  if (!deborde) {' +
'    Array.prototype.forEach.call(entete.querySelectorAll(".bloc-libre"), function (autre) {' +
'      if (autre !== bloc && _pdfRectanglesSeChevauchent(br, autre.getBoundingClientRect())) { chevauche = true; }' +
'    });' +
'  }' +
'  bloc.classList.toggle("hors-cadre", deborde || chevauche);' +
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
// TACHE (retour Denis 2026-09-19, 5e vague, decision ferme de Denis) :
// _pdfAutoAjusterBandeauSiDebordement() (retrecissement automatique et
// silencieux du metier/de l'accroche a chaque rafraichissement) est
// retiree d'ici -- son seul appelant (_pdfRafraichir()) ne la declenche
// plus. Le signalement visuel (cadre rouge) reste seul, voir
// _pdfVerifierDebordementBlocLibre() plus bas, desormais etendue au
// chevauchement entre blocs (elle ne verifiait jusqu'ici que les limites
// du cadre de l'en-tete).' +
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
// TACHE (retour Denis 2026-09-19, 5e vague, decision ferme de Denis) :
// _pdfRafraichir() simple -- plus de garde-fou automatique a sauter (voir
// son commentaire), la taille choisie ici est toujours respectee telle
// quelle. Le cadre rouge (_pdfVerifierDebordementBlocLibre(), rebranche a
// chaque rafraichissement par _pdfActiverGlisserLibreEntete()) signale
// seul un depassement/chevauchement eventuel.
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
'  if (texte.indexOf("Calcul en cours") === -1 && window.parent && typeof window.parent._mepMessageMEPRecu === "function") { window.parent._mepMessageMEPRecu(texte); }' +
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
'function _pdfLireTheme(cle, defaut) {' +
'  var c = (window.parent.dossier && window.parent.dossier.reglagesMiseEnPageCV) || {};' +
'  return c[cle] || defaut;' +
'}' +
'function _pdfPoserTheme(cle, val) {' +
'  var p = window.parent;' +
'  p._assurerReglagesMiseEnPageCV();' +
'  p.dossier.reglagesMiseEnPageCV[cle] = val;' +
'  if (p.etatApercuInline && p.etatApercuInline.cv) {' +
'    if (!p.etatApercuInline.cv.reglagesProjetXXL) { p.etatApercuInline.cv.reglagesProjetXXL = {}; }' +
'    p.etatApercuInline.cv.reglagesProjetXXL[cle] = val;' +
'  }' +
'}' +
'function _pdfInstantaneMEP() {' +
'  return {' +
'    echelle: _cvPdfEchelle,' +
'    entete: _cvPdfEchellesRubriques["entete-nom"] || 1,' +
'    interligne: _pdfLireTheme("interligne", "normal"),' +
'    espParas: _pdfLireTheme("espacementParas", "normal"),' +
'    marge: (typeof _cvPdfChoixMq.margePage === "number") ? _cvPdfChoixMq.margePage : 10,' +
'    espForm: _cvPdfEspacementFormations' +
'  };' +
'}' +
'function _pdfLeviersEspaces() {' +
'  var pas = function (cle, ordre, sens, poser) {' +
'    return function () {' +
'      var i = ordre.indexOf(_pdfLireTheme(cle, "normal"));' +
'      var j = i + sens;' +
'      if (i === -1 || j < 0 || j >= ordre.length) { return null; }' +
'      var avant = ordre[i];' +
'      _pdfPoserTheme(cle, ordre[j]);' +
'      return function () { _pdfPoserTheme(cle, avant); };' +
'    };' +
'  };' +
'  return {' +
'    interligne: function (sens) { return pas("interligne", ["serre", "normal", "aere"], sens)(); },' +
'    espParas: function (sens) { return pas("espacementParas", ["serre", "normal", "large"], sens)(); },' +
'    marge: function (sens) {' +
'      var m = (typeof _cvPdfChoixMq.margePage === "number") ? _cvPdfChoixMq.margePage : 10;' +
'      var liste = [6, 8, 10, 14];' +
'      var i = liste.indexOf(m);' +
'      if (i === -1) { return null; }' +
'      var j = i + sens;' +
'      if (j < 0 || j >= liste.length) { return null; }' +
'      _pdfMqChoix("margePage", liste[j]);' +
'      return function () { _pdfMqChoix("margePage", m); };' +
'    },' +
'    espForm: function (sens) {' +
'      var e = _cvPdfEspacementFormations;' +
'      var cible = sens < 0 ? Math.max(2, e - 2) : Math.min(8, e + 2);' +
'      if (cible === e) { return null; }' +
'      _cvPdfEspacementFormations = cible;' +
'      return function () { _cvPdfEspacementFormations = e; };' +
'    },' +
// TACHE (retour Denis 2026-09-28, tard : "je pense qu'il peut nous apporter
// des gros benefices") : "Style des missions" (Epurees = 1 par ligne /
// Condensees = a la suite) -- condense prend nettement moins de hauteur.
// POINT CORRIGE APRES VERIFICATION EN DIRECT (le premier essai, via
// _pdfLireTheme/_pdfPoserTheme comme interligne/espParas, N\'AVAIT AUCUN EFFET
// VISUEL -- teste et confirme : _pdfLireOptions() lit ces 2 champs depuis les
// <select> caches regStyleProfessionnel/regStylePersonnel de CET iframe
// (document.getElementById), jamais depuis dossier.reglagesMiseEnPageCV en
// direct pendant _pdfRafraichir(). interligne/espacementParas semblent
// partager ce meme gap (a verifier separement, hors scope de ce soir) --
// mais PAS suppose ici, verifie precisement pour ces 2 champs avant de
// committer). Corrige : ecrit sur le <select> cache (effet immediat, ce que
// _pdfRafraichir() lit reellement) ET sur dossier.reglagesMiseEnPageCV
// (persistance, canal normalement synchronise par le clic reel sur le
// segmente du panneau) -- les 2, jamais un seul.
'    missionsPro: function (sens) {' +
'      var el = document.getElementById("regStyleProfessionnel");' +
'      var actuel = el.value || "epure";' +
'      if (sens < 0 && actuel !== "condense") {' +
'        el.value = "condense"; _pdfPoserTheme("styleProfessionnel", "condense");' +
'        return function () { el.value = actuel; _pdfPoserTheme("styleProfessionnel", actuel); };' +
'      }' +
'      if (sens > 0 && actuel === "condense") {' +
'        el.value = "epure"; _pdfPoserTheme("styleProfessionnel", "epure");' +
'        return function () { el.value = actuel; _pdfPoserTheme("styleProfessionnel", actuel); };' +
'      }' +
'      return null;' +
'    },' +
// TACHE (chantier "style des missions etendu", 2026-09-29) : le rendu de la galerie lit desormais stylePersonnel
// et styleFormations (cvPdfTemplateMaquette.js) -- ces 2 leviers sont donc actifs, comme missionsPro.
'    missionsPerso: function (sens) {' +
'      var el = document.getElementById("regStylePersonnel");' +
'      var actuel = el.value || "epure";' +
'      if (sens < 0 && actuel !== "condense") {' +
'        el.value = "condense"; _pdfPoserTheme("stylePersonnel", "condense");' +
'        return function () { el.value = actuel; _pdfPoserTheme("stylePersonnel", actuel); };' +
'      }' +
'      if (sens > 0 && actuel === "condense") {' +
'        el.value = "epure"; _pdfPoserTheme("stylePersonnel", "epure");' +
'        return function () { el.value = actuel; _pdfPoserTheme("stylePersonnel", actuel); };' +
'      }' +
'      return null;' +
'    },' +
'    missionsFormations: function (sens) {' +
'      var el = document.getElementById("regStyleFormations");' +
'      var actuel = el.value || "epure";' +
'      if (sens < 0 && actuel !== "condense") {' +
'        el.value = "condense"; _pdfPoserTheme("styleFormations", "condense");' +
'        return function () { el.value = actuel; _pdfPoserTheme("styleFormations", actuel); };' +
'      }' +
'      if (sens > 0 && actuel === "condense") {' +
'        el.value = "epure"; _pdfPoserTheme("styleFormations", "epure");' +
'        return function () { el.value = actuel; _pdfPoserTheme("styleFormations", actuel); };' +
'      }' +
'      return null;' +
'    },' +
// TACHE (K5, 2026-09-28, retour Denis : "un texte prend moins de place qu'une
// pastille, ca pourrait etre un levier") : bascule vers "texte" (le plus
// compact, sans pastille/rectangle decoratifs) pour tasser ; bascule vers
// "pastille" pour aerer. Convention interne "texte" (jamais "texte-seul",
// reserve au champ canonique dossier.reglagesMiseEnPageCV -- traduit par
// modules/cv-mise-en-page/reglagesTraducteurs.js, verifie non un decalage).
'    styleCompetences: function (sens) {' +
'      var actuel = _cvPdfChoixMq.styleCompetences || "pastille";' +
'      if (sens < 0 && actuel !== "texte") {' +
'        _pdfMqChoix("styleCompetences", "texte");' +
'        return function () { _pdfMqChoix("styleCompetences", actuel); };' +
'      }' +
'      if (sens > 0 && actuel === "texte") {' +
'        _pdfMqChoix("styleCompetences", "pastille");' +
'        return function () { _pdfMqChoix("styleCompetences", actuel); };' +
'      }' +
'      return null;' +
'    }' +
'  };' +
'}' +
'function _pdfEssayerTasserEspaces(hauteur, cible) {' +
'  var leviers = _pdfLeviersEspaces();' +
'  var noms = ["interligne", "espParas", "marge", "espForm", "missionsPro", "missionsPerso", "missionsFormations", "styleCompetences"];' +
'  var progres = true;' +
'  while (progres && hauteur > cible + 2) {' +
'    progres = false;' +
'    for (var k = 0; k < noms.length && hauteur > cible + 2; k++) {' +
'      if (leviers[noms[k]](-1)) { hauteur = _pdfRafraichirEtMesurer(); progres = true; }' +
'    }' +
'  }' +
'  return hauteur;' +
'}' +
'function _pdfEssayerAererEspaces(hauteur) {' +
'  var leviers = _pdfLeviersEspaces();' +
'  var noms = ["espForm", "interligne", "espParas", "marge", "missionsPro", "missionsPerso", "missionsFormations", "styleCompetences"];' +
'  var progres = true;' +
'  while (progres && hauteur < HAUTEUR_CIBLE_PX * 0.82) {' +
'    progres = false;' +
'    for (var k = 0; k < noms.length && hauteur < HAUTEUR_CIBLE_PX * 0.82; k++) {' +
'      var annuler = leviers[noms[k]](1);' +
'      if (!annuler) { continue; }' +
'      var apres = _pdfRafraichirEtMesurer();' +
'      if (apres > HAUTEUR_CIBLE_PX + 2) { annuler(); _pdfRafraichirEtMesurer(); continue; }' +
'      hauteur = apres; progres = true;' +
'    }' +
'  }' +
'  return hauteur;' +
'}' +
'function _pdfCompteRenduMEP(avant, cas) {' +
'  var apres = _pdfInstantaneMEP();' +
'  var noms = { serre: "serrés", normal: "normaux", aere: "aérés" };' +
'  var nomsEsp = { serre: "serré", normal: "normal", large: "large" };' +
'  var l = [];' +
'  if (isFinite(avant.echelle) && isFinite(apres.echelle) && avant.echelle !== apres.echelle) { l.push("Texte : " + _pdfAfficherTaillePx(avant.echelle) + " px → " + _pdfAfficherTaillePx(apres.echelle) + " px"); }' +
'  if (Math.abs(avant.entete - apres.entete) > 0.001) { l.push("En-tête : " + (apres.entete > avant.entete ? "agrandi" : "réduit") + " de " + Math.round(Math.abs(apres.entete - avant.entete) / avant.entete * 100) + " %"); }' +
'  if (avant.interligne !== apres.interligne) { l.push("Interlignes : " + noms[avant.interligne] + " → " + noms[apres.interligne]); }' +
'  if (avant.espParas !== apres.espParas) { l.push("Espace entre les blocs : " + nomsEsp[avant.espParas] + " → " + nomsEsp[apres.espParas]); }' +
'  if (avant.marge !== apres.marge) { l.push("Marges : " + avant.marge + " mm → " + apres.marge + " mm"); }' +
'  if (avant.espForm !== apres.espForm) { l.push("Espace entre les formations : " + avant.espForm + " px → " + apres.espForm + " px"); }' +
'  if (cas === "tient") { l.push("Le CV tient maintenant sur une page."); }' +
'  else if (cas === "depasse") { l.push("Même resserré au maximum, le CV dépasse encore un peu la page : essayez « Résumé » ou les suggestions ci-dessous."); }' +
'  else if (cas === "rempli") { l.push("La page est mieux remplie."); }' +
'  else if (cas === "incomplet") { l.push("La page reste incomplète : vous pouvez ajouter des informations ou consulter les suggestions."); }' +
'  else if (!l.length) { l.push("Rien à ajuster : la mise en page tient déjà bien sur une page."); }' +
'  l.push("Aucune information n’a été retirée ni ajoutée.");' +
'  return l.join("<br>");' +
'}' +
'function _pdfNbLignesRubrique(titre) {' +
'  var secs = document.querySelectorAll(".page-a4 [data-rub]");' +
'  for (var i = 0; i < secs.length; i++) {' +
'    if (secs[i].getAttribute("data-rub") === titre) {' +
'      var pills = secs[i].querySelectorAll(".pill").length;' +
'      return pills || secs[i].querySelectorAll(":scope > div > div").length || secs[i].querySelectorAll("li").length;' +
'    }' +
'  }' +
'  return 0;' +
'}' +
'function _pdfCandidatsSuggestions(sens) {' +
'  var l = [];' +
'  var deja = _cvPdfChoixMq.listesDeuxColonnes || [];' +
'  var styleComp = document.getElementById("regStyleCompetences").value;' +
'  if (sens === "gagner") {' +
// Retour Denis 2026-09-30 (C4) : aucune suggestion ne fait repasser en presentation chronologique. La personne a choisi son mode
// (Mixte, Par competences) : les suggestions s'adaptent a ce choix, elles ne le changent jamais.
'    if (styleComp !== "texte") {' +
'      l.push({ id: "texte", titre: "Compétences en texte, sans pastilles", detail: "Les compétences ne sont plus dans des pastilles mais écrites simplement, à la suite : elles prennent moins de place.", picto: "une", changes: [{ cle: "__reg", id: "regStyleCompetences", valeur: "texte", canon: "texte-seul" }] });' +
'    }' +
'    var titres = ["Compétences professionnelles", "Savoirs", "Logiciels et outils", "Langues", "Certifications", "Centres d’intérêt"];' +
'    var eligibles = [];' +
'    for (var k = 0; k < titres.length; k++) {' +
'      if (deja.indexOf(titres[k]) === -1 && _pdfNbLignesRubrique(titres[k]) >= 2) {' +
'        eligibles.push(titres[k]);' +
'        l.push({ id: "col2-" + k, titre: "« " + _pdfNA(titres[k]) + " » sur 2 colonnes", detail: "La rubrique « " + _pdfNA(titres[k]) + " » passe de une à deux colonnes : deux éléments par ligne, moins de hauteur (au moins une ligne gagnée). Le contenu ne change pas.", picto: "deux", changes: [{ cle: "listesDeuxColonnes", valeur: deja.concat([titres[k]]) }] });' +
'      }' +
'    }' +
'    if (eligibles.length >= 2) {' +
'      l.push({ id: "col2-toutes", titre: "Toutes les listes courtes sur 2 colonnes", detail: "Les rubriques « " + eligibles.map(_pdfNA).join(" », « ") + " » passent toutes sur deux colonnes en une seule fois, pour gagner un maximum de lignes. Le contenu ne change pas.", picto: "deux", changes: [{ cle: "listesDeuxColonnes", valeur: deja.concat(eligibles) }] });' +
'    }' +
'    var uneColonne = document.getElementById("regColonnes").value === "1";' +
'    var modeleLibre = !document.getElementById("regCreatifActif").checked && !document.getElementById("regSobreActif").checked;' +
'    if (uneColonne && _cvPdfChoixMq.blocsCourts === "dessous") {' +
'      l.push({ id: "cote", titre: "Blocs courts côte à côte", detail: "Compétences, logiciels, langues et certifications se placent deux par deux, côte à côte : moins de hauteur. Le contenu ne change pas.", picto: "deux", changes: [{ cle: "blocsCourts", valeur: null }] });' +
'    }' +
'    if (uneColonne && modeleLibre && _cvPdfChoixMq.blocsCourts !== "dessous" && !_cvPdfChoixMq.petitesUneLigne && !document.querySelector(".paire.trois")) {' +
'      l.push({ id: "petites-ligne", titre: _pdfNA("Logiciels et outils") + ", " + _pdfNA("Langues") + " et " + _pdfNA("Centres d’intérêt") + " sur une ligne", detail: "Les trois petites rubriques se placent côte à côte, sur une seule ligne, au lieu d’être sur deux lignes : moins de hauteur. Le contenu ne change pas.", picto: "deux", changes: [{ cle: "petitesUneLigne", valeur: true }] });' +
'    }' +
'    if (uneColonne && modeleLibre && !_cvPdfChoixMq.logicielsAcoteFormations && !document.querySelector(".paire.trois") && document.querySelector(\'[data-rub="Logiciels et outils"]\') && document.querySelector(\'[data-rub="Formations"]\')) {' +
'      l.push({ id: "logi-form", titre: "« " + _pdfNA("Logiciels et outils") + " » à côté de « " + _pdfNA("Formations") + " »", detail: "La rubrique « " + _pdfNA("Logiciels et outils") + " » se place à droite de « " + _pdfNA("Formations") + " », dans la place libre : moins de hauteur. Le contenu ne change pas.", picto: "deux", changes: [{ cle: "logicielsAcoteFormations", valeur: true }] });' +
'    }' +
'    if (uneColonne && modeleLibre && !_cvPdfChoixMq.formCertifsCoteACote && document.querySelector(\'[data-rub="Formations"]\') && document.querySelector(\'[data-rub="Certifications"]\')) {' +
'      l.push({ id: "dates-apres", titre: "Dates juste après le titre : « " + _pdfNA("Formations") + " » et « " + _pdfNA("Certifications") + " » côte à côte", detail: "Pour ces deux rubriques, la date s’écrit juste après le titre (au lieu d’être à droite) et elles se placent côte à côte : une rangée de moins. Les autres rubriques gardent leurs dates comme elles sont. Aucune information n’est retirée.", picto: "deux", changes: [{ cle: "datesApresTitre", valeur: ["Formations", "Certifications"] }, { cle: "formCertifsCoteACote", valeur: true }] });' +
'    }' +
'    if (uneColonne && modeleLibre) {' +
'      l.push({ id: "deuxcol", titre: "Passer en 2 colonnes", detail: "Le CV passe sur deux colonnes : les compétences, langues et autres rubriques courtes à gauche, les expériences et formations à droite. Le contenu ne change pas.", picto: "deux", changes: [{ cle: "__reg", id: "regColonnes", valeur: "2" }] });' +
'    }' +
'    if (!_pdfDispositionPropre()) {' +
'      var enHaut = _pdfCompetencesEnHautEffectif();' +
'      l.push({ id: "comphaut", titre: enHaut ? "Compétences en bas de page" : "Compétences en haut de page", detail: enHaut ? "Le bloc des compétences descend après les expériences et les formations : la page peut mieux se répartir. Le contenu ne change pas." : "Le bloc des compétences monte tout en haut, sous l’en-tête. Le contenu ne change pas.", picto: "une", changes: [{ cle: "__comp_haut", valeur: !enHaut }] });' +
'    }' +
'    if (_cvPdfChoixMq.formationsLigne !== "ligne" && _pdfNbLignesRubrique("Formations") >= 3) {' +
'      l.push({ id: "formligne", titre: "« " + _pdfNA("Formations") + " » sur une seule ligne chacune", detail: "Pour chaque formation, l’année, le diplôme, le centre et le lieu sont écrits sur la même ligne quand ils tiennent.", picto: "une", changes: [{ cle: "formationsLigne", valeur: "ligne" }] });' +
'    }' +
'    if (document.getElementById("regColonnes").value === "2" && !_cvPdfChoixMq.formationsAGauche && _pdfNbLignesRubrique("Formations") >= 1) {' +
'      l.push({ id: "formgauche", titre: "« " + _pdfNA("Formations") + " » dans la colonne de gauche", detail: "Le bloc « " + _pdfNA("Formations") + " » passe dans la colonne de gauche : les deux colonnes sont mieux équilibrées.", picto: "deux", changes: [{ cle: "formationsAGauche", valeur: true }] });' +
'    }' +
// Retour Denis 2026-10-01 : les reglages de mise en forme DEJA existants qui gagnent de la place sans rien retirer. Chaque candidat est mesure comme les autres
// (une suggestion n'apparait que si elle gagne vraiment des lignes), la personne reste libre de l\'accepter ou non.
'    var elMisPro = document.getElementById("regStyleProfessionnel"), elMisForm = document.getElementById("regStyleFormations"), elMisPerso = document.getElementById("regStylePersonnel");' +
'    if (elMisPro && elMisPro.value !== "condense") {' +
'      l.push({ id: "mis-condense", titre: "Missions des expériences à la suite", detail: "Les missions de chaque expérience s’écrivent à la suite, séparées par des points-virgules, au lieu d’une par ligne : moins de hauteur. Rien n’est retiré.", picto: "une", changes: [{ cle: "__reg", id: "regStyleProfessionnel", valeur: "condense" }] });' +
'    }' +
'    if (elMisForm && elMisForm.value !== "condense") {' +
'      l.push({ id: "mis-form-condense", titre: "Missions des formations à la suite", detail: "Les missions de chaque formation s’écrivent à la suite, au lieu d’une par ligne : moins de hauteur. Rien n’est retiré.", picto: "une", changes: [{ cle: "__reg", id: "regStyleFormations", valeur: "condense" }] });' +
'    }' +
'    if (elMisPerso && elMisPerso.value !== "condense") {' +
'      l.push({ id: "mis-perso-condense", titre: "Missions de l’expérience personnelle à la suite", detail: "Les missions de l’expérience personnelle s’écrivent à la suite, au lieu d’une par ligne : moins de hauteur. Rien n’est retiré.", picto: "une", changes: [{ cle: "__reg", id: "regStylePersonnel", valeur: "condense" }] });' +
'    }' +
'    if (_cvPdfPositionDates !== "droite") {' +
'      l.push({ id: "dates-droite", titre: "Dates à droite des intitulés", detail: "Les dates passent sur la ligne de l’intitulé, à droite, au lieu d’une ligne à part : moins de hauteur. Rien n’est retiré.", picto: "une", changes: [{ cle: "__dates", valeur: "droite" }] });' +
'    }' +
'    if (_cvPdfTitresAgrandis) {' +
'      l.push({ id: "titres-normaux", titre: "Titres de rubriques à leur taille normale", detail: "Les titres des rubriques reprennent leur taille de départ : un peu moins de hauteur. Rien n’est retiré.", picto: "une", changes: [{ cle: "__titres", valeur: false }] });' +
'    }' +
'    _pdfCandidatsExpACote().forEach(function (c) { l.push(c); });' +
'    _pdfCandidatsTroisLigne().forEach(function (c) { l.push(c); });' +
'  } else {' +
'    if (styleComp === "texte") {' +
'      l.push({ id: "pastille", titre: "Compétences en pastilles", detail: "Les compétences sont mises dans des pastilles : plus lisibles et plus aérées, elles remplissent mieux la page.", picto: "une", changes: [{ cle: "__reg", id: "regStyleCompetences", valeur: "pastille", canon: "pastille" }] });' +
'    }' +
'    var uneColonneR = document.getElementById("regColonnes").value === "1";' +
'    var modeleLibreR = !document.getElementById("regCreatifActif").checked && !document.getElementById("regSobreActif").checked;' +
'    if (uneColonneR && _cvPdfChoixMq.blocsCourts !== "dessous") {' +
'      l.push({ id: "dessous", titre: "Blocs courts l’un sous l’autre", detail: "Compétences, logiciels, langues et certifications ne sont plus côte à côte mais l’un sous l’autre : plus aéré, la page se remplit mieux. Le contenu ne change pas.", picto: "une", changes: [{ cle: "blocsCourts", valeur: "dessous" }] });' +
'    }' +
'    if (!uneColonneR && modeleLibreR) {' +
'      l.push({ id: "unecol", titre: "Passer en 1 colonne", detail: "Le CV passe sur une seule colonne : plus aéré, la page se remplit mieux. Le contenu ne change pas.", picto: "une", changes: [{ cle: "__reg", id: "regColonnes", valeur: "1" }] });' +
'    }' +
'    if (!_pdfDispositionPropre()) {' +
'      var enHautR = _pdfCompetencesEnHautEffectif();' +
'      l.push({ id: "comphaut", titre: enHautR ? "Compétences en bas de page" : "Compétences en haut de page", detail: enHautR ? "Le bloc des compétences descend après les expériences et les formations. Le contenu ne change pas." : "Le bloc des compétences monte tout en haut, sous l’en-tête. Le contenu ne change pas.", picto: "une", changes: [{ cle: "__comp_haut", valeur: !enHautR }] });' +
'    }' +
'    if (deja.length) {' +
'      l.push({ id: "raz2col", titre: "Remettre les listes sur une colonne", detail: "Les listes passent de deux colonnes à une : plus aérées, elles remplissent mieux la page.", picto: "une", changes: [{ cle: "listesDeuxColonnes", valeur: null }] });' +
'    }' +
// Retour Denis 2026-10-01 : « Espacer les rubriques » (meme calcul que le bouton du grand apercu) : les rubriques s\'ecartent pour mieux remplir la page.
'    if (document.querySelectorAll(".page-a4 .rub-sec[data-rub]").length > 2 && !Object.keys(_cvPdfReglagesRubriquesMq || {}).some(function (k) { return _cvPdfReglagesRubriquesMq[k] && _cvPdfReglagesRubriquesMq[k].esp > 0; })) {' +
'      l.push({ id: "espacer", titre: "Espacer les rubriques", detail: "Les rubriques s’écartent un peu les unes des autres pour mieux remplir la page, sans jamais la dépasser. À deux colonnes, la disposition actuelle est gardée. Le contenu ne change pas.", picto: "une", changes: [{ cle: "__espacer", valeur: "toutes" }] });' +
'    }' +
'    if (_cvPdfChoixMq.formationsLigne !== "dessous" && _pdfNbLignesRubrique("Formations") >= 2) {' +
'      l.push({ id: "formdessous", titre: "« " + _pdfNA("Formations") + " » sur deux lignes", detail: "Pour chaque formation, le diplôme est sur une ligne et le centre, le lieu et l’année en dessous : plus aéré.", picto: "une", changes: [{ cle: "formationsLigne", valeur: "dessous" }] });' +
'    }' +
// Retour Denis 2026-10-01 : le contraire des suggestions « gagner », avec les memes reglages deja existants.
'    var elMisProR = document.getElementById("regStyleProfessionnel");' +
'    if (elMisProR && elMisProR.value === "condense") {' +
'      l.push({ id: "mis-epure", titre: "Missions des expériences une par ligne", detail: "Les missions de chaque expérience passent chacune sur sa ligne, au lieu d’être à la suite : plus lisible, la page se remplit mieux. Rien n’est ajouté.", picto: "une", changes: [{ cle: "__reg", id: "regStyleProfessionnel", valeur: "epure" }] });' +
'    }' +
'    if (_cvPdfPositionDates === "droite") {' +
'      l.push({ id: "dates-sous", titre: "Dates sous les intitulés", detail: "Les dates passent sur une ligne à part, sous l’intitulé : plus aéré, la page se remplit mieux. Rien n’est ajouté.", picto: "une", changes: [{ cle: "__dates", valeur: "sous" }] });' +
'    }' +
'    if (!_cvPdfTitresAgrandis) {' +
'      l.push({ id: "titres-grands", titre: "Agrandir les titres des rubriques", detail: "Les titres des rubriques sont un peu plus grands : plus lisibles, la page se remplit mieux. Rien n’est ajouté.", picto: "une", changes: [{ cle: "__titres", valeur: true }] });' +
'    }' +
'  }' +
'  return l;' +
'}' +
// Retour Denis 2026-10-01 : a UNE colonne, quand les experiences sont legeres (peu de missions, courtes), l\'Experience professionnelle peut partager sa ligne avec UNE
// rubrique courte (Certifications, Logiciels, Langues, Centres d\'interet, Informations) : l\'experience a gauche (60 %), la rubrique a droite (40 %). Proposition
// mesuree comme les autres (elle n\'apparait que si elle gagne des lignes) ; la personne peut aussi le faire a la main dans le grand apercu (« Regler le corps du CV »).
// Retour Denis 2026-10-03 : a UNE colonne, quand trois rubriques COURTES (sans missions : certifications, langues, logiciels, centres d\'interet, formations ou experience personnelle sans
// missions) sont chacune seule sur sa ligne, les mettre toutes les trois sur la meme ligne, avec la date juste apres le titre (Formations, Certifications) pour tenir dans la largeur.
// Proposition mesuree comme les autres (elle n\'apparait que si elle gagne des lignes), jamais appliquee d\'office.
'function _pdfCandidatsTroisLigne() {' +
'  var l = [];' +
'  try {' +
'    if (document.getElementById("regColonnes").value !== "1" || !window.parent || typeof window.parent._mqUnitesRubriques !== "function") { return l; }' +
'    var feuille = document.querySelector(".page-a4"); if (!feuille) { return l; }' +
'    var info = window.parent._mqUnitesRubriques(feuille);' +
'    if (info.deux || !info.colonnes.length) { return l; }' +
'    var rangs = info.colonnes[0].rangs, seules = [];' +
'    rangs.forEach(function (r, i) { if (r.length === 1 && window.parent._mqClasseRubrique(r[0]) === "court") { seules.push(i); } });' +
'    if (seules.length < 3) { return l; }' +
'    var tr = seules.slice(0, 3), TC = window.parent._MEP_TITRES_COLONNES, IN = window.parent._PDF_INTITULES;' +
'    var cles = tr.map(function (i) { return rangs[i][0].cle; });' +
'    var rows = [];' +
'    rangs.forEach(function (r, i) {' +
'      if (i === tr[0]) { rows.push(cles); }' +
'      else if (tr.indexOf(i) === -1) { rows.push(r.map(function (x) { return x.cle; })); }' +
'    });' +
'    var titresDates = [];' +
'    cles.forEach(function (k) { if (k === "form" || k === "certifs") { titresDates.push(IN[TC[k]]); } });' +
'    var deja = _cvPdfChoixMq.datesApresTitre || [];' +
'    var changes = [{ cle: "__lignes1col", valeur: rows }];' +
'    if (titresDates.length) { changes.unshift({ cle: "datesApresTitre", valeur: deja.concat(titresDates.filter(function (t) { return deja.indexOf(t) === -1; })) }); }' +
'    var noms = cles.map(function (k) { return "« " + _pdfNA(IN[TC[k]]) + " »"; });' +
'    l.push({ id: "trois-ligne", titre: "Trois rubriques sur une ligne : " + noms.join(", "), detail: "Ces trois rubriques courtes se placent côte à côte sur une seule ligne" + (titresDates.length ? ", avec la date juste après le titre pour tenir dans la largeur" : "") + " : deux rangées de moins. Rien n’est retiré.", picto: "deux", changes: changes });' +
'  } catch (e) { l = []; }' +
'  return l;' +
'}' +
'function _pdfCandidatsExpACote() {' +
'  var l = [];' +
'  try {' +
'    if (document.getElementById("regColonnes").value !== "1" || !window.parent || typeof window.parent._mqUnitesRubriques !== "function") { return l; }' +
'    var feuille = document.querySelector(".page-a4"); if (!feuille) { return l; }' +
'    var info = window.parent._mqUnitesRubriques(feuille);' +
'    if (info.deux || !info.colonnes.length) { return l; }' +
'    var rangs = info.colonnes[0].rangs, iExp = -1;' +
'    rangs.forEach(function (r, i) { if (r.length === 1 && r[0].cle === "exp") { iExp = i; } });' +
'    if (iExp === -1) { return l; }' +
'    var lis = rangs[iExp][0].el.querySelectorAll("li"), nbExp = Math.max(1, rangs[iExp][0].el.querySelectorAll(".item").length), longues = 0;' +
'    for (var k = 0; k < lis.length; k++) { if ((lis[k].textContent || "").length > 85) { longues++; } }' +
'    if (longues > 0 || lis.length > 2 * nbExp) { return l; }' +
'    var noms = { certifs: _pdfNA("Certifications"), logi: _pdfNA("Logiciels et outils"), langues: _pdfNA("Langues"), centres: _pdfNA("Centres d’intérêt"), infos: _pdfNA("Informations complémentaires") };' +
'    var cles = ["certifs", "logi", "langues", "centres", "infos"];' +
'    rangs.forEach(function (r) {' +
'      r.forEach(function (u) {' +
'        if (cles.indexOf(u.cle) === -1) { return; }' +
'        var rows = [];' +
'        rangs.forEach(function (r2, i2) {' +
'          var ks = r2.map(function (x) { return x.cle; }).filter(function (c) { return c !== u.cle; });' +
'          if (i2 === iExp) { ks = ["exp", u.cle]; }' +
'          if (ks.length) { rows.push(ks); }' +
'        });' +
'        l.push({ id: "exp-cote-" + u.cle, titre: "Expériences à côté de « " + noms[u.cle] + " »", detail: "Les expériences, peu chargées, se placent à gauche (60 % de la largeur) et la rubrique « " + noms[u.cle] + " » à leur droite : moins de hauteur. Le contenu ne change pas. À deux colonnes ou avec beaucoup de missions, cette suggestion ne vous est pas proposée.", picto: "deux", changes: [{ cle: "__lignes1col", valeur: rows }] });' +
'      });' +
'    });' +
'  } catch (e) { l = []; }' +
'  return l.slice(0, 3);' +
'}' +
'function _pdfAppliquerChangementsSuggestion(changes) {' +
'  var avant = { choix: _cvPdfChoixMq, mode: _cvPdfModePresentation, regs: {}, proMax: _cvPdfCompetencesProMax, compMax: _cvPdfCompetencesComportementalesMax, compHaut: _cvPdfCompetencesEnHaut,' +
'    rub: JSON.parse(JSON.stringify(_cvPdfReglagesRubriquesMq || {})), perso: _cvPdfOrganisationPerso, ordrePerso: _cvPdfOrdrePersoRubriques, dates: _cvPdfPositionDates, titres: _cvPdfTitresAgrandis };' +
'  var copie = {}, espacer = null;' +
'  Object.keys(_cvPdfChoixMq).forEach(function (k) { copie[k] = _cvPdfChoixMq[k]; });' +
'  changes.forEach(function (c) {' +
'    if (c.cle === "__espacer") { espacer = c.valeur; }' +
'    else if (c.cle === "__dates") { _cvPdfPositionDates = c.valeur; }' +
'    else if (c.cle === "__titres") { _cvPdfTitresAgrandis = !!c.valeur; }' +
'    else if (c.cle === "__lignes1col") { _cvPdfOrganisationPerso = true; if (!_cvPdfOrdrePersoRubriques) { _cvPdfOrdrePersoRubriques = ["comp", "exp", "form", "bas"]; } copie.lignesUneColonne = c.valeur; }' +
'    else if (c.cle === "__mode") { _cvPdfModePresentation = c.valeur; }' +
'    else if (c.cle === "__reg") { var el = document.getElementById(c.id); avant.regs[c.id] = el.value; el.value = c.valeur; }' +
'    else if (c.cle === "__comp") { if (c.quoi === "pro") { _cvPdfCompetencesProMax = c.valeur; } else { _cvPdfCompetencesComportementalesMax = c.valeur; } }' +
'    else if (c.cle === "__comp_haut") { _cvPdfCompetencesEnHaut = c.valeur; }' +
'    else if (c.cle === "__ouvrirChoix") { c.valeur = c.valeur; }' +
'    else if (c.valeur === null) { delete copie[c.cle]; }' +
'    else { copie[c.cle] = c.valeur; }' +
'  });' +
'  _cvPdfChoixMq = copie;' +
// « Espacer les rubriques » (retour Denis 2026-10-01) : meme calcul que le bouton du grand apercu (cvPdfPleinEcranMaquette.js, _mqEspacerRubriques),
// execute sur la page du panneau ; il reecrit l\'apercu lui-meme a chaque reglage, d\'ou sa place APRES l\'application des autres changements.
'  if (espacer && window.parent && typeof window.parent._mqEspacerRubriques === "function") {' +
'    window.parent._mqEspacerRubriques({ portee: espacer, panneau: window, feuille: function () { return document.querySelector(".page-a4"); }, rendre: function () {} });' +
'  }' +
'  return avant;' +
'}' +
'function _pdfRestaurerChangementsSuggestion(avant) {' +
'  if (avant.rub) { _cvPdfReglagesRubriquesMq = avant.rub; }' +
'  if (avant.perso !== undefined) { _cvPdfOrganisationPerso = avant.perso; _cvPdfOrdrePersoRubriques = avant.ordrePerso; }' +
'  if (avant.dates !== undefined) { _cvPdfPositionDates = avant.dates; }' +
'  if (avant.titres !== undefined) { _cvPdfTitresAgrandis = avant.titres; }' +
'  _cvPdfChoixMq = avant.choix;' +
'  _cvPdfModePresentation = avant.mode;' +
'  _cvPdfCompetencesProMax = avant.proMax;' +
'  _cvPdfCompetencesComportementalesMax = avant.compMax;' +
'  _cvPdfCompetencesEnHaut = avant.compHaut;' +
'  Object.keys(avant.regs).forEach(function (id) { document.getElementById(id).value = avant.regs[id]; });' +
'}' +
'function _pdfHauteurContenuRub(sec) {' +
'  var haut = sec.getBoundingClientRect().top, bas = haut;' +
'  var els = sec.querySelectorAll("*");' +
'  for (var i = 0; i < els.length; i++) { var b = els[i].getBoundingClientRect().bottom; if (b > bas) { bas = b; } }' +
'  return bas - haut;' +
'}' +
'function _pdfEquilibreCompetences() {' +
'  if (document.querySelector(".page-a4.cv-rect")) { return null; }' +
'  var tt = window.parent._PDF_INTITULES || {};' +
'  var sp = null, sc = null;' +
'  var secs = document.querySelectorAll(".page-a4 [data-rub]");' +
'  for (var i = 0; i < secs.length; i++) {' +
'    if (secs[i].tagName === "H2") { continue; }' +
'    var t = secs[i].getAttribute("data-rub");' +
'    if (t === tt.competencesPro) { sp = secs[i]; } else if (t === tt.competencesComp) { sc = secs[i]; }' +
'  }' +
'  if (!sp || !sc) { return null; }' +
'  var rp = sp.getBoundingClientRect(), rc = sc.getBoundingClientRect();' +
'  var cote = Math.abs(rp.top - rc.top) < 24 && (rp.right <= rc.left + 4 || rc.right <= rp.left + 4);' +
'  if (!cote) { return null; }' +
'  return { hPro: _pdfHauteurContenuRub(sp), hComp: _pdfHauteurContenuRub(sc) };' +
'}' +
'function _pdfCandidatsEquilibre() {' +
'  var l = [];' +
'  var eq = _pdfEquilibreCompetences();' +
'  if (!eq) { return l; }' +
'  var ecart = eq.hPro - eq.hComp;' +
'  if (Math.abs(ecart) < 45) { return l; }' +
'  var aff = window.parent._mepCompetencesAffichees || {};' +
'  var nPro = (aff.pro || []).length, nComp = (aff.comp || []).length, poolComp = (aff.poolComp || []).length;' +
'  var proAvant = _cvPdfCompetencesProMax, compAvant = _cvPdfCompetencesComportementalesMax, choixAvant = _cvPdfChoixMq;' +
'  try {' +
'    if (ecart >= 45) {' +
'    if (!_cvPdfChoixMq.competencesCompChoisies && poolComp > nComp) {' +
'      var n = nComp;' +
'      while (n < poolComp) {' +
'        n++;' +
'        _cvPdfCompetencesComportementalesMax = n;' +
'        _pdfRafraichir();' +
'        var e2 = _pdfEquilibreCompetences();' +
'        if (!e2 || e2.hPro - e2.hComp < 20) { break; }' +
'      }' +
'      if (n > nComp) {' +
'        l.push({ id: "eq-plus-comp", equilibre: true, libelle: "Équilibre : " + nComp + " compétences comportementales deviennent " + n,' +
'          titre: "Ajouter " + (n - nComp) + (n - nComp > 1 ? " compétences comportementales" : " compétence comportementale"),' +
'          detail: "Affiche " + (n - nComp) + (n - nComp > 1 ? " compétences comportementales de plus" : " compétence comportementale de plus") + ", tirées de votre dossier, pour que les deux blocs de compétences aient à peu près la même hauteur. Aucune compétence n’est inventée.",' +
'          picto: "deux", changes: [{ cle: "__comp", quoi: "comp", valeur: n }] });' +
'      }' +
'      _cvPdfCompetencesComportementalesMax = compAvant;' +
'      _pdfRafraichir();' +
'    }' +
'    if (!_cvPdfChoixMq.competencesProChoisies && nPro > 4) {' +
'      var plancher = Math.max(4, Math.ceil(nPro / 2));' +
'      var m = nPro;' +
'      while (m > plancher) {' +
'        m--;' +
'        _cvPdfCompetencesProMax = m;' +
'        _pdfRafraichir();' +
'        var e3 = _pdfEquilibreCompetences();' +
'        if (!e3 || e3.hPro - e3.hComp < 20) { break; }' +
'      }' +
'      if (m < nPro) {' +
'        l.push({ id: "eq-moins-pro", equilibre: true, libelle: "Équilibre : " + nPro + " compétences professionnelles deviennent " + m,' +
'          titre: "Garder les " + m + " compétences professionnelles les plus pertinentes",' +
'          detail: "Le bloc des compétences professionnelles passe de " + nPro + " à " + m + " compétences (les mieux classées restent). Les autres restent dans votre dossier et dans « " + _pdfNA("Compétences") + " > Les montrer et les choisir » : rien n’est supprimé.",' +
'          picto: "deux", changes: [{ cle: "__comp", quoi: "pro", valeur: m }] });' +
'      }' +
'      _cvPdfCompetencesProMax = proAvant;' +
'      _pdfRafraichir();' +
'    }' +
'    if (!_cvPdfChoixMq.competencesProChoisies && nPro >= 5) {' +
'      l.push({ id: "eq-choisir", equilibre: true, libelle: "Équilibre : c’est vous qui choisissez",' +
'        titre: "Choisir moi-même mes compétences professionnelles",' +
'        detail: "Ouvre la liste « Les montrer et les choisir » de la carte « " + _pdfNA("Compétences") + " » : cochez les compétences professionnelles à garder. Les autres sont considérées comme secondaires et restent dans votre dossier.",' +
'        picto: "deux", changes: [{ cle: "__ouvrirChoix", valeur: "pro" }] });' +
'    }' +
// TACHE (J5, 2026-09-28, regle de priorite donnee par Denis) : sens inverse, jamais traite avant
// -- competences comportementales trop hautes par rapport aux pro. "Motivation"/"Apprentissage"
// (repli par defaut, js/app.js ~3511, ne s'affiche QUE si la personne n'a renseigne aucune vraie
// competence comportementale) doivent toujours partir EN PREMIER, jamais une competence reellement
// saisie -- on retrie la liste affichee pour les mettre en dernier, la reduction par compte (meme
// principe que eq-moins-pro) les coupe alors en priorite via competencesCompChoisies (liste
// explicite), pas un simple maximum (l'ordre naturel de la liste les met en tete, pas en queue).
'    } else if (!_cvPdfChoixMq.competencesCompChoisies && nComp > 2) {' +
'      var compActuels = (aff.comp || []).slice();' +
'      var resteComp = compActuels.filter(function (x) { return x !== "Motivation" && x !== "Apprentissage"; });' +
'      var sacrificesComp = compActuels.filter(function (x) { return x === "Motivation" || x === "Apprentissage"; });' +
'      var cibleOrdre = resteComp.concat(sacrificesComp);' +
'      var plancherComp = Math.max(2, Math.ceil(nComp / 2));' +
'      var mc = nComp;' +
'      while (mc > plancherComp) {' +
'        mc--;' +
'        var copieTest = {};' +
'        Object.keys(choixAvant).forEach(function (k) { copieTest[k] = choixAvant[k]; });' +
'        copieTest.competencesCompChoisies = cibleOrdre.slice(0, mc);' +
'        _cvPdfChoixMq = copieTest;' +
'        _pdfRafraichir();' +
'        var e4 = _pdfEquilibreCompetences();' +
'        if (!e4 || e4.hComp - e4.hPro < 20) { break; }' +
'      }' +
'      if (mc < nComp) {' +
'        l.push({ id: "eq-moins-comp", equilibre: true, libelle: "Équilibre : " + nComp + " compétences comportementales deviennent " + mc,' +
'          titre: "Garder les " + mc + " compétences comportementales les plus pertinentes",' +
'          detail: "Le bloc des compétences comportementales passe de " + nComp + " à " + mc + " compétences" + (sacrificesComp.length ? " (« Motivation »/« Apprentissage », ajoutées par défaut, partent en premier)" : "") + ". Les autres restent dans votre dossier et dans « " + _pdfNA("Compétences") + " > Les montrer et les choisir » : rien n’est supprimé.",' +
'          picto: "deux", changes: [{ cle: "competencesCompChoisies", valeur: cibleOrdre.slice(0, mc) }] });' +
'      }' +
'      _cvPdfChoixMq = choixAvant;' +
'      _pdfRafraichir();' +
'    }' +
'  } catch (e) { l = []; }' +
'  _cvPdfCompetencesProMax = proAvant;' +
'  _cvPdfCompetencesComportementalesMax = compAvant;' +
'  _cvPdfChoixMq = choixAvant;' +
'  _pdfRafraichir();' +
'  return l;' +
'}' +
'function _pdfDefinirCompetencesMaxAbsolu(quoi, n) {' +
'  if (quoi === "pro") { _cvPdfCompetencesProMax = n; } else { _cvPdfCompetencesComportementalesMax = n; }' +
'  _pdfMqChoix(quoi === "pro" ? "competencesProChoisies" : "competencesCompChoisies", null);' +
'}' +
'function _pdfRecalculerSuggestions(sens) {' +
'  var liste = [];' +
'  try { _pdfRafraichir(); liste = _pdfCalculerSuggestions(_pdfMesurerHauteurPage(), sens || undefined); } catch (e) { liste = []; }' +
'  if (window.parent && typeof window.parent._mepSuggestionsRecues === "function") { window.parent._mepSuggestionsRecues(liste, true); }' +
'}' +
'function _pdfNA(origine) { try { return window.parent._mepIntitule(origine) || origine; } catch (e) { return origine; } }' +
'function _pdfCalculerSuggestions(hauteurBase, sensImpose) {' +
'  var resultat = [];' +
'  try {' +
'    var sens = sensImpose || ((hauteurBase < HAUTEUR_CIBLE_PX * 0.82) ? "remplir" : "gagner");' +
'    _pdfCandidatsEquilibre().forEach(function (c) { c.gain = 0; c.sens = sens; resultat.push(c); });' +
'    var candidats = _pdfCandidatsSuggestions(sens);' +
'    for (var i = 0; i < candidats.length; i++) {' +
'      var avant = _pdfAppliquerChangementsSuggestion(candidats[i].changes);' +
'      var h = _pdfRafraichirEtMesurer();' +
'      _pdfRestaurerChangementsSuggestion(avant);' +
'      var ecartPx = (sens === "gagner") ? (hauteurBase - h) : (h - hauteurBase);' +
'      var gain = Math.round(ecartPx / 17);' +
'      var listeCourte = String(candidats[i].id).indexOf("col2-") === 0;' +
'      if (listeCourte && gain < 1 && ecartPx >= 8) { gain = 1; }' +
'      if (gain >= (listeCourte ? 1 : 2) && (sens === "gagner" || h <= HAUTEUR_CIBLE_PX + 2)) { candidats[i].gain = gain; candidats[i].sens = sens; resultat.push(candidats[i]); }' +
'    }' +
'    _pdfRafraichir();' +
'  } catch (e) { resultat = []; }' +
'  resultat.sort(function (a, b) { return ((b.equilibre ? 1 : 0) - (a.equilibre ? 1 : 0)) || (b.gain - a.gain); });' +
'  return resultat.slice(0, 9);' +
'}' +
'function _pdfEssayerEquilibreCompetencesAuto(hauteurCible) {' +
'  var eq = _pdfEquilibreCompetences();' +
'  if (!eq || eq.hPro - eq.hComp < 45) { return ""; }' +
'  var titrePro = window.parent._PDF_INTITULES.competencesPro;' +
'  var deja = _cvPdfChoixMq.listesDeuxColonnes || [];' +
'  var hAvant = _pdfMesurerHauteurPage();' +
'  var ecart = eq.hPro - eq.hComp;' +
'  var essais = [];' +
'  if (deja.indexOf(titrePro) === -1) { essais.push({ cle: "listesDeuxColonnes", valeur: deja.concat([titrePro]), texte: "« " + _pdfNA("Compétences professionnelles") + " » sur 2 colonnes, pour équilibrer les deux blocs de compétences." }); }' +
'  if (_cvPdfChoixMq.blocsCourts !== "dessous") { essais.push({ cle: "blocsCourts", valeur: "dessous", texte: "Blocs courts (compétences, logiciels, langues...) placés l’un sous l’autre, pour équilibrer les deux blocs de compétences." }); }' +
'  var notes = [];' +
'  for (var i = 0; i < essais.length; i++) {' +
'    var avant = _cvPdfChoixMq;' +
'    _pdfMqChoix(essais[i].cle, essais[i].valeur);' +
'    var e2 = _pdfEquilibreCompetences();' +
'    var h2 = _pdfMesurerHauteurPage();' +
'    var ecart2 = e2 ? (e2.hPro - e2.hComp) : 0;' +
'    var mieux = !e2 || ecart2 < ecart - 30;' +
'    var tient = h2 <= Math.max(hAvant, hauteurCible) + 2;' +
'    if (mieux && tient) {' +
'      notes.push(essais[i].texte);' +
'      ecart = ecart2;' +
'      hAvant = h2;' +
'      if (ecart2 < 45) { break; }' +
'    } else {' +
'      _cvPdfChoixMq = avant;' +
'      _pdfRafraichir();' +
'    }' +
'  }' +
'  return notes.join("<br>");' +
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
'  var avantMEP = _pdfInstantaneMEP();' +
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
'    hauteur = _pdfEssayerTasserEspaces(hauteur, hauteurCible);' +
'    while (_pdfAjusterEchelleEnteteEnsemble(-0.05) && hauteur > hauteurCible + 2) {' +
'      hauteur = _pdfRafraichirEtMesurer();' +
'    }' +
'    while (_cvPdfEchelle > _PDF_ECHELLE_MIN && hauteur > hauteurCible + 2) {' +
'      _cvPdfEchelle = Math.max(_PDF_ECHELLE_MIN, Math.round((_cvPdfEchelle - 0.05) * 100) / 100);' +
'      hauteur = _pdfRafraichirEtMesurer();' +
'    }' +
'    _pdfGarantirEnteteAuMoinsAussiGrandeQueCorps();' +
'    message = _pdfCompteRenduMEP(avantMEP, hauteur > hauteurCible + 2 ? "depasse" : "tient");' +
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
// Le bouton ne fait plus que la PRESENTATION (decision de Denis, 2026-09-26) : jamais de missions, de loisirs, de certifications,
// de formations ou de langues ajoutes automatiquement, ni de regroupement des experiences. Les changements de STRUCTURE seront
// PROPOSES (lot « Mise en page : propositions »), jamais appliques d'office.
'    hauteur = _pdfEssayerAererEspaces(hauteur);' +
'    message = _pdfCompteRenduMEP(avantMEP, hauteur < HAUTEUR_CIBLE_PX * 0.82 ? "incomplet" : "rempli");' +
'  } else {' +
'    message = _pdfCompteRenduMEP(avantMEP, "deja");' +
'  }' +
'  var noteEq = _pdfEssayerEquilibreCompetencesAuto(hauteurCible);' +
'  if (noteEq) { var lignesMsg = message.split("<br>"); lignesMsg.splice(lignesMsg.length - 1, 0, noteEq); message = lignesMsg.join("<br>"); }' +
'  _pdfAfficherMessageMiseEnPage(message);' +
'  var suggestionsMEP = _pdfCalculerSuggestions(_pdfMesurerHauteurPage());' +
'  if (window.parent && typeof window.parent._mepSuggestionsRecues === "function") { window.parent._mepSuggestionsRecues(suggestionsMEP); }' +
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
'  _cvPdfSobreVariante = "mq-bandeau";' +
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
// Les 3 anciens modeles Sobre de l'application (Bandeau fin, Colonne pale, Sans couleur) ont ete retires le 2026-09-26 : doublons
// des modeles Sobre de la maquette. Un dossier enregistre avec l'un d'eux bascule sur son equivalent.
'function _pdfMigrerVarianteSobre(v) {' +
'  return ({ bandeau: "mq-bandeau", colonne: "mq-fond", aucune: "mq-epure" })[v] || v || null;' +
'}' +
'function _pdfTirerVarianteSobre() {' +
'  _cvPdfSobreVariante = _pdfChoixAleatoire(["mq-bandeau", "mq-fond", "mq-epure"]);' +
'  _pdfColonnesPourVarianteSobre(_cvPdfSobreVariante);' +
'}' +
// TACHE (retour utilisateur, bug reel confirme : "je desactive Sobre, le
// CV ne redevient pas comme avant") : restaure le snapshot pris par
// _pdfAppliquerSobrePdf() (plus haut) -- jamais l\'ordre des rubriques
// (_cvPdfOrdrePersonnalise/regColonnes), qui ne sont plus touches par
// Sobre du tout (voir plus haut), rien a restaurer sur ces 2 champs.
'function _pdfAnnulerSobrePdf() {' +
'  if (_cvPdfColonnesAvantModele !== null) { document.getElementById("regColonnes").value = _cvPdfColonnesAvantModele; _cvPdfColonnesAvantModele = null; }' +
'  if (!_cvPdfReglagesAvantSobre) { _pdfAppliquerStandardMaquetteDOM(); _cvPdfSobreVariante = null; return; }' +
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
'  _pdfAppliquerModeleCreatifComplet(_cvPdfCreatifVariante || "mqBandeau");' +
'}' +
// TACHE (chantier refonte "La mise en page", phase 5.2, cahier § 6 --
// Denis, 2026-09-23 : "tout a ete tranche, tu suis la maquette") : ce
// bouton, une fois Créatif deja actif, ne tire PLUS au hasard -- il
// CYCLE, dans l\'ORDRE, exactement comme tirer() de la maquette
// (docs/MAQUETTE_MISE_EN_PAGE_PDF_2026-09-21.html, "S.gabarit = ids[(i +
// 1) % ids.length]") -- jamais un simple exclu-le-courant-au-hasard
// comme avant. Snapshot deja pris par _pdfAppliquerCreatifPdf(), jamais
// repris ici (on reste dans "Créatif actif", pas de retour a l\'etat
// d\'avant).
// TACHE (Denis, 2026-09-23, "ok pour 1") : cycle sur Object.keys(_PDF_CREATIF_RECETTES),
// les 12 modeles REELS (pas seulement les 6 de la galerie visible) --
// premiere version restreinte a la galerie, 6 des 11 modeles d\'origine
// (bandeauVertical, triangleSavoir, vagueMarine, diagonalesContrastees,
// losangeVert, medaillon) etaient devenus injoignables (ni vignette, ni
// de plus aucun chemin), contredisant une decision deja actee avant
// cette nuit (RECOMMANDATIONS_PHASE1_MISE_EN_PAGE_PDF_2026-09-21.md :
// "ecartes de la vitrine, mais atteignables par Un autre modele"). La
// vitrine (6 vignettes cliquables) reste inchangee -- seul le CYCLE du
// de s\'etend desormais a la liste complete, toujours dans l\'ordre,
// jamais au hasard.
// TACHE (Denis, 2026-09-25, tranche 2) : ordre de la galerie ET du de = les modeles de la maquette
// d'abord (Bandeau entier, Bandeau diagonal, Colonne colorée, Cadre de page, Titres a pictogrammes,
// Colonne et frise), puis ceux de l'application. Meme liste cote parent (js/app.js) : lue ici en
// direct, jamais deux listes a synchroniser.
'var _PDF_ORDRE_MAQUETTE_CREATIF = ["mqBandeau", "mqDiagonale", "mqColonne", "mqCadre", "mqPicto", "frise"];' +
'function _pdfIdsModelesCreatif() {' +
'  var autres = Object.keys(_PDF_CREATIF_RECETTES).filter(function (id) { return _PDF_ORDRE_MAQUETTE_CREATIF.indexOf(id) === -1; });' +
'  return _PDF_ORDRE_MAQUETTE_CREATIF.concat(autres);' +
'}' +
'function _pdfModeleUneColonneSeulement(id) {' +
'  var r = _PDF_CREATIF_RECETTES[id];' +
'  return !!(r && r.gabaritMaquette === "rectangles");' +
'}' +
'function _pdfModeleDeuxColonnesSeulement(id) {' +
'  var r = _PDF_CREATIF_RECETTES[id];' +
'  return id === "frise" || !!(r && (r.gabaritMaquette === "colonne" || r.gabaritMaquette === "photo"));' +
'}' +
// « Colonne colorée » et « Colonne et frise » n'existent que par leur colonne : les choisir passe en 2
// colonnes, les quitter retrouve le choix d'avant (comme quitterFrise() de la maquette).
'function _pdfAppliquerModeleCreatifComplet(id) {' +
'  var sel = document.getElementById("regColonnes");' +
'  if (_pdfModeleDeuxColonnesSeulement(id) || _pdfModeleUneColonneSeulement(id)) {' +
'    if (_cvPdfColonnesAvantModele === null) { _cvPdfColonnesAvantModele = sel.value; }' +
'    sel.value = _pdfModeleUneColonneSeulement(id) ? "1" : "2";' +
'  } else if (_cvPdfColonnesAvantModele !== null) {' +
'    sel.value = _cvPdfColonnesAvantModele;' +
'    _cvPdfColonnesAvantModele = null;' +
'  }' +
'  _cvPdfCreatifVariante = id;' +
'  _pdfAppliquerRecetteCreatifDOM(id);' +
'}' +
// La personne change « Deux colonnes » a la main pendant qu'un modele 2 colonnes est actif : son choix
// devient la valeur a retrouver en quittant le modele.
'function _pdfNotifierColonnesManuelles(valeur) {' +
'  if (_cvPdfColonnesAvantModele !== null) { _cvPdfColonnesAvantModele = valeur; }' +
'}' +
'function _pdfProposerAutreModeleCreatif() {' +
'  var ids = _pdfIdsModelesCreatif();' +
'  var i = ids.indexOf(_cvPdfCreatifVariante);' +
'  _pdfAppliquerModeleCreatifComplet(ids[(i + 1) % ids.length]);' +
'  _pdfAfficherMessageMiseEnPage("");' +
'  _pdfRafraichir();' +
'  _pdfEssayerRequilibrageColonnes();' +
'}' +
// TACHE (meme decision, cote Sobre) : meme principe exact -- cycle DANS
// L\'ORDRE sur les variantes reelles valides pour le nombre de colonnes
// actuel (2 colonnes : bandeau/colonne ; 1 colonne : bandeau/aucune,
// meme contrainte que _pdfChoisirVarianteSobre), jamais un tirage au
// hasard comme _pdfTirerVarianteSobre() (qui reste utilisee, elle,
// seulement a la 1re activation de Sobre -- voir _pdfAppliquerSobrePdf).
// TACHE (Denis, 2026-09-25, tranche 2) : les 3 modeles Sobre de la maquette d'abord, puis les 2 variantes
// de l'application compatibles avec le nombre de colonnes (jamais une combinaison invalide).
'function _pdfIdsVariantesSobre() {' +
'  var deuxColonnes = document.getElementById("regColonnes").value !== "1";' +
'  return ["mq-bandeau", "mq-fond", "mq-epure"].concat(deuxColonnes ? ["mq-photo"] : ["mq-rectangles"]);' +
'}' +
// « Photo et frise » (Sobre) n'existe qu'en 2 colonnes : le choisir passe en 2 colonnes, le quitter retrouve le choix d'avant
// (meme regle que les modeles Créatif « 2 colonnes seulement »).
'function _pdfColonnesPourVarianteSobre(variante) {' +
'  var sel = document.getElementById("regColonnes");' +
'  if (variante === "mq-photo" || variante === "mq-rectangles") {' +
'    if (_cvPdfColonnesAvantModele === null) { _cvPdfColonnesAvantModele = sel.value; }' +
'    sel.value = (variante === "mq-photo") ? "2" : "1";' +
'  } else if (_cvPdfColonnesAvantModele !== null) {' +
'    sel.value = _cvPdfColonnesAvantModele;' +
'    _cvPdfColonnesAvantModele = null;' +
'  }' +
'}' +
'function _pdfProposerVarianteSobreSuivante() {' +
'  var ids = _pdfIdsVariantesSobre();' +
'  var i = ids.indexOf(_cvPdfSobreVariante);' +
'  _cvPdfSobreVariante = ids[(i + 1) % ids.length];' +
'  _pdfColonnesPourVarianteSobre(_cvPdfSobreVariante);' +
'  _pdfRafraichir();' +
'}' +
'function _pdfAnnulerCreatifPdf() {' +
'  if (_cvPdfColonnesAvantModele !== null) { document.getElementById("regColonnes").value = _cvPdfColonnesAvantModele; _cvPdfColonnesAvantModele = null; }' +
'  if (!_cvPdfReglagesAvantCreatif) { _pdfAppliquerStandardMaquetteDOM(); _cvPdfCreatifVariante = null; return; }' +
'  var s = _cvPdfReglagesAvantCreatif;' +
'  Object.keys(s).forEach(function (champ) {' +
'    if (champ === "ordrePersonnalise") { return; }' +
'    var el = document.getElementById(_pdfIdControlePour(champ));' +
'    if (!el) { return; }' +
'    if (el.type === "checkbox") { el.checked = s[champ]; } else { el.value = s[champ]; }' +
'  });' +
'  _cvPdfOrdrePersonnalise = s.ordrePersonnalise;' +
'  _cvPdfCreatifVariante = null;' +
'  _cvPdfColonnesAvantModele = null;' +
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
// TACHE (phase 5.2, galerie de modeles) : jusqu'ici, un modele Sobre/
// Creatif precis ne pouvait etre obtenu qu'au hasard
// (_pdfTirerVarianteSobre/_pdfProposerAutreModeleCreatif, tirage
// aleatoire uniquement -- aucun moyen de CHOISIR). Ces 2 fonctions
// permettent de choisir un modele PRECIS (vignette cliquee dans la
// galerie du panneau parent) -- reutilisent EXACTEMENT le meme chemin
// d\'activation que les boutons Sobre/Creatif existants (le bouton reel
// est clique par programme s\'il n\'est pas deja actif, jamais une 2e
// logique d\'activation ecrite a part) puis imposent le modele demande a
// la place d\'un tirage.
'function _pdfChoisirModeleCreatif(id) {' +
'  if (!_PDF_CREATIF_RECETTES[id]) { return; }' +
'  if (!document.getElementById("regCreatifActif").checked) { document.getElementById("btnCreatifPdf").click(); }' +
'  _pdfAppliquerModeleCreatifComplet(id);' +
'  _pdfAfficherMessageMiseEnPage("");' +
'  _pdfRafraichir();' +
'  _pdfEssayerRequilibrageColonnes();' +
'}' +
// TACHE (meme principe) : "colonne" n\'a de sens qu\'en 2 colonnes,
// "aucune" (epure) qu\'en 1 colonne (meme contrainte reelle que
// _pdfTirerVarianteSobre plus haut -- jamais une combinaison invalide) ;
// le panneau parent ne propose deja que les variantes valides pour le
// nombre de colonnes actuel (voir la galerie, construireMiseEnPageCV()),
// ce repli reste le filet de securite final si jamais appele autrement.
'function _pdfChoisirVarianteSobre(variante) {' +
'  variante = _pdfMigrerVarianteSobre(variante);' +
'  if (["mq-bandeau", "mq-fond", "mq-epure", "mq-photo", "mq-rectangles"].indexOf(variante) === -1) { return; }' +
'  if (!document.getElementById("regSobreActif").checked) { document.getElementById("btnSobrePdf").click(); }' +
'  _cvPdfSobreVariante = variante;' +
'  _pdfColonnesPourVarianteSobre(variante);' +
'  _pdfRafraichir();' +
'}' +
// TACHE (phase 5.4, carte "Experiences professionnelles") : fonctions
// appelees DIRECTEMENT depuis le panneau parent (js/app.js) via
// iframe.contentWindow._pdfXxx(...) -- meme principe que _mepClicMoteur
// ailleurs (parler a cette iframe depuis l\'exterieur), mais appel de
// fonction direct plutot qu\'un bouton cache : ces reglages prennent des
// PARAMETRES (index, delta, valeur precise), pas juste un declenchement,
// un bouton cache par valeur possible serait ingerable (jusqu\'a 10 x
// nombre d\'experiences pour le seul compteur de missions).
'function _pdfDefinirModePresentation(mode) {' +
'  if (["A", "B", "C"].indexOf(mode) === -1) { return; }' +
'  _cvPdfModePresentation = mode;' +
'  _pdfRafraichir();' +
'}' +
// TACHE (meme carte) : au 1er passage vers "pertinentes", jamais de
// retrait silencieux -- tout reste coche (la personne decoche elle-meme
// ce qu\'elle ne veut pas), plutot que de deviner une pertinence qui
// pourrait retirer une experience a l\'insu de la personne (regle du
// chantier, § "rien ne doit passer silencieusement").
'function _pdfDefinirExperiencesTout(valeur, nbExperiences) {' +
'  if (["toutes", "pertinentes"].indexOf(valeur) === -1) { return; }' +
'  _cvPdfExperiencesTout = valeur;' +
'  if (valeur === "pertinentes" && !_cvPdfExperiencesChoisies) {' +
'    _cvPdfExperiencesChoisies = [];' +
'    for (var i = 0; i < nbExperiences; i++) { _cvPdfExperiencesChoisies.push(i); }' +
'  }' +
'  _pdfRafraichir();' +
'}' +
'function _pdfBasculerExperienceChoisie(index) {' +
'  if (!_cvPdfExperiencesChoisies) { return; }' +
'  var pos = _cvPdfExperiencesChoisies.indexOf(index);' +
'  if (pos === -1) { _cvPdfExperiencesChoisies.push(index); } else { _cvPdfExperiencesChoisies.splice(pos, 1); }' +
'  _pdfRafraichir();' +
'}' +
// TACHE (meme carte) : compteur "Missions par experience" -- reprend
// EXACTEMENT le geste de la maquette (boutons -/+, plage 1 a 10, "pas"),
// par experience (index) si fourni, sinon le reglage GLOBAL par defaut.
// TACHE (audit "La mise en page" 2026-09-27, P8/P12 -- bug reel confirme et
// reproduit en direct) : "actuelAffiche" (3e argument, transmis par
// data-mep-exp-missions-n depuis la carte, js/app.js) est le compteur
// REELLEMENT affiche sur cette experience -- deja plafonne par son nombre
// reel de missions, contrairement a l\'ancienne base (_cvPdfMissionsGlobal
// || 4) qui ignorait ce plafond. Sans lui, une experience avec moins de
// missions que le reglage global voyait son 1er clic sur "-" ne rien
// changer (ex. 4-1=3, deja la valeur affichee) -- corrige en repartant de
// la valeur reellement affichee quand elle est connue.
'function _pdfDefinirMissionsExperience(index, delta, actuelAffiche) {' +
'  var actuel = (actuelAffiche != null && !isNaN(actuelAffiche)) ? actuelAffiche : ((_cvPdfMissionsParExperience[index] != null) ? _cvPdfMissionsParExperience[index] : (_cvPdfMissionsGlobal || _pdfMissionsDefautNb()));' +
'  _cvPdfMissionsParExperience[index] = Math.max(1, Math.min(10, actuel + delta));' +
'  delete _cvPdfMissionsChoisies[index];' +
'  _pdfRafraichir();' +
'}' +
'function _pdfReinitialiserMissionsExperience(index) {' +
'  delete _cvPdfMissionsParExperience[index];' +
'  delete _cvPdfMissionsChoisies[index];' +
'  _pdfRafraichir();' +
'}' +
// TACHE (chantier "Experience personnelle", 2026-09-27) : memes 3 fonctions
// EXACTES que _pdfDefinirExperiencesTout/_pdfBasculerExperienceChoisie/
// _pdfDefinirMissionsExperience ci-dessus, mais avec une cle TEXTE (pas un
// index) -- 2 tableaux sources distincts (experiencesPersonnelles/engagements),
// jamais un index commun. "cles" = la liste ordonnee de toutes les cles
// possibles (transmise par la carte, comme "nbExperiences" pour les pros).
// TACHE (retour Denis 2026-09-28, point 12) : bascule "Citer seulement" / "Developper".
'function _pdfDefinirExpPersoModeAffichage(valeur) {' +
'  if (["citer", "developper"].indexOf(valeur) === -1) { return; }' +
'  _cvPdfExpPersoModeAffichage = valeur;' +
'  _pdfRafraichir();' +
'}' +
'function _pdfDefinirExpPersoTout(valeur, cles) {' +
'  if (["toutes", "pertinentes"].indexOf(valeur) === -1) { return; }' +
'  _cvPdfExpPersoTout = valeur;' +
'  if (valeur === "pertinentes" && !_cvPdfExpPersoChoisies) { _cvPdfExpPersoChoisies = (cles || []).slice(); }' +
'  _pdfRafraichir();' +
'}' +
'function _pdfBasculerExpPersoChoisie(cle) {' +
'  if (!_cvPdfExpPersoChoisies) { return; }' +
'  var pos = _cvPdfExpPersoChoisies.indexOf(cle);' +
'  if (pos === -1) { _cvPdfExpPersoChoisies.push(cle); } else { _cvPdfExpPersoChoisies.splice(pos, 1); }' +
'  _pdfRafraichir();' +
'}' +
// TACHE (retour Denis 2026-09-28, bouton "Afficher sur mon CV") : coche
// d\'un coup TOUTES les cles d\'une source (savoir-faire perso OU engagements)
// -- remplace l\'ancien bouton "Modifier dans Vos informations" (navigation,
// risquait de perimer les missions deja generees). Sans effet en mode
// "toutes" (_cvPdfExpPersoChoisies est alors null : rien a cocher, tout est
// deja affiche) -- le bouton est de toute facon desactive dans ce cas.
'function _pdfAfficherSourceExpPerso(cles) {' +
'  if (!_cvPdfExpPersoChoisies) { return; }' +
'  (cles || []).forEach(function (c) { if (_cvPdfExpPersoChoisies.indexOf(c) === -1) { _cvPdfExpPersoChoisies.push(c); } });' +
'  _pdfRafraichir();' +
'}' +
// TACHE (retour Denis 2026-09-28 : "cacher sur le cv" -- bascule inverse de
// _pdfAfficherSourceExpPerso ci-dessus) : decoche d\'un coup toutes les cles
// d\'une source. En mode "toutes" (_cvPdfExpPersoChoisies encore null), on
// bascule d\'abord sur "pertinentes" en partant de la liste complete, sinon
// rien n\'existerait a decocher.
'function _pdfMasquerSourceExpPerso(cles, toutesLesCles) {' +
// Defaut corrige le 2026-10-02 : en mode « Toutes » avec une ancienne selection encore en memoire (apres un passage par « Les plus pertinentes »), « Cacher sur le CV »
// ne faisait rien (la selection oubliee etait filtree sans changer de mode). Le mode « Toutes » repart toujours de la liste complete.
'  if (!_cvPdfExpPersoChoisies || _cvPdfExpPersoTout !== "pertinentes") { _cvPdfExpPersoTout = "pertinentes"; _cvPdfExpPersoChoisies = (toutesLesCles || []).slice(); }' +
'  _cvPdfExpPersoChoisies = _cvPdfExpPersoChoisies.filter(function (c) { return (cles || []).indexOf(c) === -1; });' +
'  _pdfRafraichir();' +
'}' +
'function _pdfDefinirMissionsExpPerso(cle, delta, actuelAffiche) {' +
'  var actuel = (actuelAffiche != null && !isNaN(actuelAffiche)) ? actuelAffiche : ((_cvPdfExpPersoMissionsParItem[cle] != null) ? _cvPdfExpPersoMissionsParItem[cle] : 4);' +
'  _cvPdfExpPersoMissionsParItem[cle] = Math.max(0, Math.min(10, actuel + delta));' +
'  _pdfRafraichir();' +
'}' +
// TACHE (retour Denis 2026-09-28 : bouton "Modifier", changer l\'intitule
// et les missions, en ajouter a la main) : ecrase l\'affichage CV pour cet
// item. Champ vide (titre ET missions) = on efface le forcage, retour au
// comportement automatique (texte d\'origine + curseur).
// Lot N1 (2026-10-04) : champs supplementaires modifiables POUR CE CV SEULEMENT (dates, structure, lieu...). `champs` ne contient que ce que la personne a CHANGE
// par rapport au dossier (un champ absent = valeur du dossier) ; une valeur vide est un choix (rien d'ecrit).
'function _pdfChampsPropresEdition(champs, noms) {' +
'  var sortie = null;' +
'  (noms || []).forEach(function (n) { if (champs && typeof champs[n] === "string") { if (!sortie) { sortie = {}; } sortie[n] = champs[n].trim(); } });' +
'  return sortie;' +
'}' +
'function _pdfDefinirTexteExpPerso(cle, titre, missionsTexte, champs) {' +
'  var t = (titre || "").trim(); var m = (missionsTexte || "").trim(); var ex = _pdfChampsPropresEdition(champs, ["dateDebut", "dateFin", "entreprise", "lieu"]);' +
'  if (!t && !m && !ex) { delete _cvPdfExpPersoTexteParItem[cle]; } else { var o = { titre: t, missions: m }; if (ex) { Object.keys(ex).forEach(function (k) { o[k] = ex[k]; }); } _cvPdfExpPersoTexteParItem[cle] = o; }' +
'  _pdfRafraichir();' +
'}' +
// TACHE (chantier "Formations", 2026-09-28) : memes 3 fonctions EXACTES que
// les 3 juste au-dessus (Experience personnelle), pour dossier.formations.
'function _pdfDefinirFormationsTout(valeur, cles) {' +
'  if (["toutes", "pertinentes"].indexOf(valeur) === -1) { return; }' +
'  _cvPdfFormationsTout = valeur;' +
'  if (valeur === "pertinentes" && !_cvPdfFormationsChoisies) { _cvPdfFormationsChoisies = (cles || []).slice(); }' +
'  _pdfRafraichir();' +
'}' +
'function _pdfBasculerFormationChoisie(cle) {' +
'  if (!_cvPdfFormationsChoisies) { return; }' +
'  var pos = _cvPdfFormationsChoisies.indexOf(cle);' +
'  if (pos === -1) { _cvPdfFormationsChoisies.push(cle); } else { _cvPdfFormationsChoisies.splice(pos, 1); }' +
'  _pdfRafraichir();' +
'}' +
// TACHE (retour Denis : "je veux que le curseur soit le seul controle,
// jamais un 2e bouton separe pour afficher/masquer les missions") : ce
// reglage touche desormais aussi _cvPdfAfficherMissionsFormation -- des que
// la personne regle un compteur de missions pour une formation precise,
// les missions deviennent visibles sans qu\'elle ait besoin de cocher une
// case separee ("Afficher les missions de la formation", restee inchangee
// par ailleurs pour qui ne touche jamais ce nouveau reglage).
'function _pdfDefinirMissionsFormationItem(cle, delta, actuelAffiche) {' +
'  var actuel = (actuelAffiche != null && !isNaN(actuelAffiche)) ? actuelAffiche : ((_cvPdfFormationsMissionsParItem[cle] != null) ? _cvPdfFormationsMissionsParItem[cle] : 4);' +
'  _cvPdfFormationsMissionsParItem[cle] = Math.max(0, Math.min(10, actuel + delta));' +
'  _cvPdfAfficherMissionsFormation = true;' +
'  _pdfRafraichir();' +
'}' +
// TACHE (retour Denis 2026-09-28) : meme fonction EXACTE que
// _pdfDefinirTexteExpPerso ci-dessus, pour les formations.
'function _pdfDefinirTexteFormation(cle, titre, missionsTexte, champs) {' +
'  var t = (titre || "").trim(); var m = (missionsTexte || "").trim(); var ex = _pdfChampsPropresEdition(champs, ["niveau", "annee", "etablissement", "lieu"]);' +
'  if (!t && !m && !ex) { delete _cvPdfFormationsTexteParItem[cle]; } else { var o = { titre: t, missions: m }; if (ex) { Object.keys(ex).forEach(function (k) { o[k] = ex[k]; }); } _cvPdfFormationsTexteParItem[cle] = o; }' +
'  if (m) { _cvPdfAfficherMissionsFormation = true; }' +
'  _pdfRafraichir();' +
'}' +
// TACHE (retour Denis 2026-09-28) : plafond desormais le maximum REEL de missions parmi les
// experiences du dossier (transmis par le panneau, data-mep-missions-max), plus le 10 fixe --
// au-dela, cliquer sur "+" ne changeait deja plus rien a l'affichage (chaque experience
// re-plafonne de toute facon a son propre nombre de missions), seul le chiffre affiche montait.
'function _pdfDefinirMissionsGlobal(delta, maxReel) {' +
'  var plafond = (typeof maxReel === "number" && maxReel > 0) ? maxReel : 10;' +
'  _cvPdfMissionsGlobal = Math.max(1, Math.min(plafond, (_cvPdfMissionsGlobal || _pdfMissionsDefautNb()) + delta));' +
'  _pdfRafraichir();' +
'}' +
// TACHE (meme carte) : choix PRECIS des missions d\'une experience
// (panneau "Choisir", coche/decoche chaque mission une par une) --
// distinct du simple COMPTEUR ci-dessus (qui garde les N premieres par
// pertinence) : des qu\'une personne choisit une mission precise, ce
// choix devient la source de verite pour cette experience.
'function _pdfBasculerMissionChoisie(indexExp, indexMission, nbMissionsTotal) {' +
'  var liste = _cvPdfMissionsChoisies[indexExp];' +
'  if (!liste) {' +
'    var n = (_cvPdfMissionsParExperience[indexExp] != null) ? _cvPdfMissionsParExperience[indexExp] : (_cvPdfMissionsGlobal || _pdfMissionsDefautNb());' +
'    liste = [];' +
'    for (var i = 0; i < Math.min(n, nbMissionsTotal); i++) { liste.push(i); }' +
'  }' +
'  var pos = liste.indexOf(indexMission);' +
'  if (pos === -1) { liste.push(indexMission); } else { liste.splice(pos, 1); }' +
'  liste.sort(function (a, b) { return a - b; });' +
'  _cvPdfMissionsChoisies[indexExp] = liste;' +
'  _pdfRafraichir();' +
'}' +
'function _pdfPositionDatesRubrique(rub) {' +
'  if (_cvPdfDatesAlignees) { return _cvPdfPositionDatesChoisie ? _cvPdfPositionDates : ""; }' +
'  return (rub === "formations" ? _cvPdfPositionDatesFormations : _cvPdfPositionDatesPerso) || "";' +
'}' +
'function _pdfDefinirDatesAlignees(oui) {' +
'  _cvPdfDatesAlignees = !!oui;' +
'  _pdfRafraichir();' +
'}' +
'function _pdfDefinirPositionDatesRubrique(rub, valeur) {' +
'  var v = (valeur === "droite" || valeur === "sous" || valeur === "avant") ? valeur : "";' +
'  if (rub === "formations") { _cvPdfPositionDatesFormations = v; } else if (rub === "perso") { _cvPdfPositionDatesPerso = v; } else { return; }' +
'  _pdfRafraichir();' +
'}' +
'function _pdfDefinirPositionDates(valeur) {' +
'  if (["droite", "sous", "avant", "apres"].indexOf(valeur) === -1) { return; }' +
'  _cvPdfPositionDates = valeur;' +
'  _cvPdfPositionDatesChoisie = true;' +
'  _pdfRafraichir();' +
'}' +
'function _pdfBasculerAfficherComp(cle) {' +
'  if (cle === "pro") { _cvPdfAfficherCompPro = !_cvPdfAfficherCompPro; } else if (cle === "comp") { _cvPdfAfficherCompComp = !_cvPdfAfficherCompComp; } else { return; }' +
'  _pdfRafraichir();' +
'}' +
'function _pdfBasculerQualitesMetier() {' +
'  _cvPdfQualitesMetierActives = !_cvPdfQualitesMetierActives;' +
'  _pdfRafraichir();' +
'}' +
'function _pdfBasculerAfficherLieu() {' +
'  _cvPdfAfficherLieu = !_cvPdfAfficherLieu;' +
'  _pdfRafraichir();' +
'}' +
'function _pdfDefinirStyleLieu(valeur) {' +
'  if (["normal", "italique", "gris"].indexOf(valeur) === -1) { return; }' +
'  _cvPdfStyleLieu = valeur;' +
'  _pdfRafraichir();' +
'}' +
// TACHE (phase 5.3, carte "Formations") : memes fonctions simples que
// _pdfBasculerAfficherLieu/_pdfDefinirStyleLieu juste au-dessus.
// TACHE (P10, retour Denis 2026-09-28) : bascule sur la valeur EFFECTIVE (pas
// la valeur brute, qui peut valoir null = "jamais touche, suit le mode") --
// sinon un premier clic en Mixte (deja coche par defaut) n\'aurait aucun
// effet visible (!null vaut true, deja la valeur affichee).
'function _pdfBasculerAfficherMissionsFormation() {' +
'  var effectif = (_cvPdfAfficherMissionsFormation === null || _cvPdfAfficherMissionsFormation === undefined) ? (_cvPdfModePresentation === "B") : !!_cvPdfAfficherMissionsFormation;' +
'  _cvPdfAfficherMissionsFormation = !effectif;' +
'  _pdfRafraichir();' +
'}' +
'function _pdfMqDefinirMissionsChoisies(indexExp, liste) {' +
'  _cvPdfMissionsChoisies[indexExp] = liste;' +
'}' +
// TACHE (retour Denis 2026-09-28, point 13) : meme mecanique EXACTE que
// _pdfBasculerMissionChoisie (experiences) juste en dessous, cle texte au
// lieu d\'index -- Formations et Experience personnelle partagent la meme
// fonction, seul le nom de la variable change (2e argument).
'function _pdfBasculerMissionChoisieParCle(varChoisies, varParItem, cle, indexMission, nbMissionsTotal) {' +
'  var liste = varChoisies[cle];' +
'  if (!liste) {' +
'    var n = (varParItem[cle] != null) ? varParItem[cle] : 4;' +
'    liste = [];' +
'    for (var i = 0; i < Math.min(n, nbMissionsTotal); i++) { liste.push(i); }' +
'  }' +
'  var pos = liste.indexOf(indexMission);' +
'  if (pos === -1) { liste.push(indexMission); } else { liste.splice(pos, 1); }' +
'  liste.sort(function (a, b) { return a - b; });' +
'  varChoisies[cle] = liste;' +
'  _pdfRafraichir();' +
'}' +
'function _pdfBasculerMissionChoisieFormation(cle, indexMission, nbMissionsTotal) {' +
'  _pdfBasculerMissionChoisieParCle(_cvPdfFormationsMissionsChoisies, _cvPdfFormationsMissionsParItem, cle, indexMission, nbMissionsTotal);' +
'}' +
'function _pdfBasculerMissionChoisieExpPerso(cle, indexMission, nbMissionsTotal) {' +
'  _pdfBasculerMissionChoisieParCle(_cvPdfExpPersoMissionsChoisies, _cvPdfExpPersoMissionsParItem, cle, indexMission, nbMissionsTotal);' +
'}' +
'function _pdfMqRemettrePremieresMissionsFormation(cle) {' +
'  delete _cvPdfFormationsMissionsChoisies[cle];' +
'  _pdfRafraichir();' +
'}' +
'function _pdfMqRemettrePremieresMissionsExpPerso(cle) {' +
'  delete _cvPdfExpPersoMissionsChoisies[cle];' +
'  _pdfRafraichir();' +
'}' +
'function _pdfDefinirEspacementFormations(valeur) {' +
'  var n = parseInt(valeur, 10);' +
'  if (isNaN(n)) { return; }' +
'  _cvPdfEspacementFormations = Math.max(0, Math.min(32, n));' +
'  _pdfRafraichir();' +
'}' +
// TACHE (phase 5.3, carte "Elements supplementaires") : meme mecanique
// de compteur que _pdfDefinirMissionsGlobal (voir plus haut) -- defaut
// affiche 8 (pro) / 6 (comportementales), comme la maquette, seulement
// au 1er clic (avant ca, null = automatique, jamais touche).
// TACHE (Denis, 2026-09-25, tranche 3, maquette « pas(...) ») : de 3 au nombre de competences du dossier ; part du nombre
// AFFICHE (jamais d'un 8 ou 6 invente) ; un clic sur − / + abandonne le choix personnel (comme la maquette : S.selPro = null).
'function _pdfDefinirCompetencesProMax(delta) {' +
'  var info = window.__cvPdfCompetencesInfo || {};' +
// Defaut = le nombre REELLEMENT affiche (retour Denis 2026-10-02 : avec les qualites attendues ajoutees, 9 comportementales etaient affichees et le premier « − » tombait a 3, car le depart
// etait la liste de l'assistant seule) ; a defaut de donnees, l'ancienne base.
'  var affPro = (window.parent._mepCompetencesAffichees || {}).pro;' +
'  var actuel = (_cvPdfCompetencesProMax !== null && _cvPdfCompetencesProMax !== undefined) ? _cvPdfCompetencesProMax : (affPro ? affPro.length : (info.autoPro ? info.autoPro.length : 8));' +
'  var plafond = (info.pool && info.pool.pro.length > 3) ? info.pool.pro.length : 3;' +
'  _cvPdfCompetencesProMax = Math.max(3, Math.min(plafond, actuel + delta));' +
'  _pdfMqChoixCompetences("competencesProChoisies", null, (window.parent._mepCompetencesAffichees || {}).poolPro);' +
'}' +
'function _pdfDefinirCompetencesComportementalesMax(delta) {' +
'  var info = window.__cvPdfCompetencesInfo || {};' +
'  var affComp = (window.parent._mepCompetencesAffichees || {}).comp;' +
'  var actuel = (_cvPdfCompetencesComportementalesMax !== null && _cvPdfCompetencesComportementalesMax !== undefined) ? _cvPdfCompetencesComportementalesMax : (affComp ? affComp.length : (info.autoComp ? info.autoComp.length : 6));' +
'  var plafond = (info.pool && info.pool.comportementales.length > 3) ? info.pool.comportementales.length : 3;' +
'  _cvPdfCompetencesComportementalesMax = Math.max(3, Math.min(plafond, actuel + delta));' +
'  _pdfMqChoixCompetences("competencesCompChoisies", null, (window.parent._mepCompetencesAffichees || {}).poolComp);' +
'}' +
// TACHE (phase 5.4, carte "Organisation du CV") : cases simples --
// basculent juste un booleen, meme convention que _pdfBasculerAfficherLieu.
'function _pdfModeleMaquetteDe(opts) {' +
'  try { return window.parent._pdfGabaritMaquette(opts) !== null; } catch (e) { return false; }' +
'}' +
// Le modele place lui-meme les dates (barre, frise, colonne de dates) : « Position des dates » n'a alors rien a regler.
'function _pdfPositionDatesEffective() {' +
'  try {' +
'    var o = _pdfLireOptions();' +
'    if (o.positionDatesChoisie) { return o.positionDates || "droite"; }' +
'    if (["photo", "sobre-photo", "rectangles", "sobre-rectangles"].indexOf(o.gabaritMaquette) !== -1) { return "avant"; }' +
'    return o.gabaritCreatif === "frise" ? "sous" : "droite";' +
'  } catch (e) { return "droite"; }' +
'}' +
'function _pdfDatesPlaceesParModele() {' +
'  try {' +
'    var o = _pdfLireOptions();' +
'    return o.formatExperiences === "ameliore" || o.gabaritCreatif === "frise" || ["photo", "sobre-photo", "rectangles", "sobre-rectangles"].indexOf(o.gabaritMaquette) !== -1;' +
'  } catch (e) { return false; }' +
'}' +
'function _pdfListesDeuxColonnesPossibles() {' +
'  try {' +
'    var o = _pdfLireOptions();' +
'    return !_pdfDispositionPropre() || ["rectangles", "sobre-rectangles"].indexOf(o.gabaritMaquette) !== -1;' +
'  } catch (e) { return true; }' +
'}' +
'function _pdfDispositionPropre() {' +
'  try {' +
'    var o = _pdfLireOptions();' +
'    return o.gabaritCreatif === "frise" || ["photo", "sobre-photo", "rectangles", "sobre-rectangles"].indexOf(o.gabaritMaquette) !== -1;' +
'  } catch (e) { return false; }' +
'}' +
'function _pdfModeleMaquetteActif() {' +
'  return _pdfModeleMaquetteDe(_pdfLireOptions());' +
'}' +
'function _pdfCompetencesEnHautEffectif() {' +
'  return (_cvPdfCompetencesEnHaut === null || _cvPdfCompetencesEnHaut === undefined) ? window.parent._pdfCompetencesEnHautParDefaut(_pdfLireOptions()) : !!_cvPdfCompetencesEnHaut;' +
'}' +
'function _pdfBasculerCompetencesEnHaut() {' +
'  _cvPdfCompetencesEnHaut = !_pdfCompetencesEnHautEffectif();' +
'  _pdfRafraichir();' +
'}' +
'function _pdfBasculerFormationsAvantExp() {' +
'  _cvPdfFormationsAvantExp = !_cvPdfFormationsAvantExp;' +
'  _pdfRafraichir();' +
'}' +
'function _pdfBasculerTitresAgrandis() {' +
'  _cvPdfTitresAgrandis = !_cvPdfTitresAgrandis;' +
'  _pdfRafraichir();' +
'}' +
// TACHE (retour Denis 2026-09-27, P7, bug reel confirme : "je n\'appuie
// que sur Standard/Personnaliser et la mise en forme change completement,
// ce n\'est pas normal") : "Standard" ecrasait jusqu\'ici Competences en
// haut/Formations avant a un defaut fige (compHaut=true, formAvant=false),
// MEME quand la personne avait deja choisi autre chose via les cases a
// cocher de la carte -- un simple aller-retour Standard <-> Personnaliser
// suffisait a perdre ce choix sans le demander. "Standard" ne fait plus
// que masquer le panneau de reordonnancement manuel ; il ne touche plus
// jamais ces 2 reglages, qui restent ce que la personne a deja choisi.
'function _pdfDefinirOrganisationStandard() {' +
'  _cvPdfOrganisationPerso = false;' +
'  _pdfRafraichir();' +
'}' +
// Denis, 2026-09-29 : deplacer les rubriques a la SOURIS dans le grand aperçu (cahier CHANTIER_DISPOSITION_PAR_DEFAUT). Un geste = passage en ordre PERSONNALISE
// (les automatismes ne recalculent plus rien) ; l'etat d'avant est memorise cote plein ecran pour « Annuler le dernier deplacement ».
'function _pdfMqEtatDisposition() {' +
'  return { perso: !!_cvPdfOrganisationPerso, ordreColonnes: _cvPdfChoixMq.ordreColonnes ? JSON.parse(JSON.stringify(_cvPdfChoixMq.ordreColonnes)) : null,' +
'    ordreGroupes: _cvPdfOrdrePersoRubriques ? _cvPdfOrdrePersoRubriques.slice() : null,' +
'    lignes1col: _cvPdfChoixMq.lignesUneColonne ? JSON.parse(JSON.stringify(_cvPdfChoixMq.lignesUneColonne)) : null,' +
// les espaces entre rubriques (retour Denis 2026-10-01) reviennent aussi avec « Annuler le dernier deplacement »
'    rub: JSON.parse(JSON.stringify(_cvPdfReglagesRubriquesMq || {})) };' +
'}' +
'function _pdfMqRestaurerDisposition(e) {' +
'  if (e.rub) { _cvPdfReglagesRubriquesMq = JSON.parse(JSON.stringify(e.rub)); }' +
'  _cvPdfOrganisationPerso = !!e.perso;' +
'  _cvPdfOrdrePersoRubriques = e.ordreGroupes ? e.ordreGroupes.slice() : null;' +
'  _cvPdfChoixMq = Object.assign({}, _cvPdfChoixMq); if (e.lignes1col) { _cvPdfChoixMq.lignesUneColonne = e.lignes1col; } else { delete _cvPdfChoixMq.lignesUneColonne; }' +
'  _pdfMqChoix("ordreColonnes", e.ordreColonnes);' +
'}' +
'function _pdfMqDefinirDispositionColonnes(dispo) {' +
'  _cvPdfOrganisationPerso = true;' +
'  _pdfMqChoix("ordreColonnes", dispo);' +
'}' +
// Une colonne, 2e version : lignes composees a la souris (1 a 3 rubriques par ligne) ; l'ordre par groupes n'est plus lu (le rendu suit les lignes).
'function _pdfMqDefinirLignes1Col(lignes) {' +
'  _cvPdfOrganisationPerso = true;' +
'  if (!_cvPdfOrdrePersoRubriques) { _cvPdfOrdrePersoRubriques = ["comp", "exp", "form", "bas"]; }' +
'  _pdfMqChoix("lignesUneColonne", lignes);' +
'}' +
// Fige la disposition AFFICHEE a deux colonnes (retour Denis 2026-10-01) : a deux colonnes, la mise en page automatique replace des rubriques d'une colonne
// a l'autre quand les hauteurs changent ; avant d'espacer les rubriques, on garde donc exactement ce que la personne voit (meme principe que « Personnaliser »).
// Renvoie true si la disposition a ete figee. Sans effet a une colonne ou si la disposition est deja choisie.
'function _pdfMqFigerDisposition() {' +
'  var corpsD = document.querySelector("#conteneurPage .corps.deux");' +
'  if (!corpsD || corpsD.children.length < 2 || _cvPdfChoixMq.ordreColonnes || !window.parent._MEP_TITRES_COLONNES) { return false; }' +
'  var inv = {}; var TC = window.parent._MEP_TITRES_COLONNES, IN = window.parent._PDF_INTITULES;' +
'  Object.keys(TC).forEach(function (k) { inv[IN[TC[k]]] = k; });' +
'  var lire = function (col) { var l = []; col.querySelectorAll("[data-rub]").forEach(function (s) { var k = inv[s.getAttribute("data-rub")]; if (k && !l.some(function (x) { return x[0] === k; })) { l.push([k]); } }); return l; };' +
'  var g0 = lire(corpsD.children[0]), d0 = lire(corpsD.children[1]);' +
'  if (!d0.some(function (x) { return x[0] === "exp"; }) && !g0.some(function (x) { return x[0] === "exp"; })) { return false; }' +
'  var droite = d0.some(function (x) { return x[0] === "exp"; }) ? d0 : g0, gauche = droite === d0 ? g0 : d0;' +
'  _cvPdfOrganisationPerso = true;' +
'  _cvPdfChoixMq = Object.assign({}, _cvPdfChoixMq, { ordreColonnes: { gauche: gauche, droite: droite } });' +
'  return true;' +
'}' +
'function _pdfMqDefinirOrdreGroupes(ordre) {' +
'  _cvPdfOrganisationPerso = true;' +
'  _cvPdfOrdrePersoRubriques = ordre.slice();' +
'  _pdfRafraichir();' +
'}' +
// TACHE (meme retour, meme bug) : l\'ordre initial de "Personnaliser"
// etait fige a ["comp","exp","form","bas"], quel que soit l\'etat REEL des
// 2 cases au moment du clic -- un saut visuel immediat des que compHaut
// ou formAvant valait autre chose. Reprend exactement le meme calcul que
// l\'ordre "Standard" (cvPdfTemplateMaquette.js, ~ligne 1102-1103) : la
// personne entre dans Personnaliser depuis EXACTEMENT ce qu\'elle voit
// deja, jamais un ordre neutre impose.
'function _pdfDefinirOrganisationPerso() {' +
// Denis, 2026-09-29 : a 2 colonnes, « Personnaliser » demarre EXACTEMENT sur la disposition affichee (competences professionnelles a droite quand la place le permet,
// etc.) : rien ne bouge au clic. La disposition affichee est relue dans le rendu, avant de passer en mode personnalise.
'  var corpsD = document.querySelector("#conteneurPage .corps.deux");' +
'  if (corpsD && corpsD.children.length >= 2 && !_cvPdfChoixMq.ordreColonnes && window.parent._MEP_TITRES_COLONNES) {' +
'    var inv = {}; var TC = window.parent._MEP_TITRES_COLONNES, IN = window.parent._PDF_INTITULES;' +
'    Object.keys(TC).forEach(function (k) { inv[IN[TC[k]]] = k; });' +
'    var lire = function (col) { var l = []; col.querySelectorAll("[data-rub]").forEach(function (s) { var k = inv[s.getAttribute("data-rub")]; if (k && !l.some(function (x) { return x[0] === k; })) { l.push([k]); } }); return l; };' +
'    var g0 = lire(corpsD.children[0]), d0 = lire(corpsD.children[1]);' +
'    if (d0.some(function (x) { return x[0] === "exp"; })) { _cvPdfChoixMq = Object.assign({}, _cvPdfChoixMq, { ordreColonnes: { gauche: g0, droite: d0 } }); }' +
'  }' +
// Retour Denis 2026-10-02 : meme principe a UNE colonne. Avant, « Personnaliser » rangeait l'experience personnelle et les petites rubriques autrement que
// l'affichage « Standard » (la page changeait au clic). L'affichage est donc relu dans le rendu : une ligne par bloc (ou par rangee de rubriques cote a cote).
'  var corps1 = document.querySelector("#conteneurPage .corps:not(.deux)");' +
'  if (corps1 && !_cvPdfChoixMq.lignesUneColonne && window.parent._MEP_TITRES_COLONNES) {' +
'    var inv1 = {}; var TC1 = window.parent._MEP_TITRES_COLONNES, IN1 = window.parent._PDF_INTITULES;' +
'    Object.keys(TC1).forEach(function (k) { inv1[IN1[TC1[k]]] = k; });' +
'    var lignes = [], vus = {};' +
'    Array.prototype.forEach.call(corps1.children, function (groupe) {' +
'      Array.prototype.forEach.call(groupe.children, function (bloc) {' +
'        var ks = [];' +
'        bloc.querySelectorAll("[data-rub]").forEach(function (t) { var k = inv1[t.getAttribute("data-rub")]; if (k && !vus[k] && ks.indexOf(k) === -1) { ks.push(k); } });' +
'        ks.forEach(function (k) { vus[k] = true; });' +
'        if (ks.length === 1 || (ks.length >= 2 && ks.length <= 3 && bloc.classList.contains("paire"))) { lignes.push(ks); }' +
'        else { ks.forEach(function (k) { lignes.push([k]); }); }' +
'      });' +
'    });' +
'    if (lignes.some(function (l) { return l[0] === "exp"; })) { _cvPdfChoixMq = Object.assign({}, _cvPdfChoixMq, { lignesUneColonne: lignes }); }' +
'  }' +
'  _cvPdfOrganisationPerso = true;' +
'  if (!_cvPdfOrdrePersoRubriques) {' +
'    var ordre = _pdfCompetencesEnHautEffectif() ? ["comp", "exp", "form", "bas"] : ["exp", "form", "comp", "bas"];' +
'    if (_cvPdfFormationsAvantExp) { ordre = ordre.filter(function (k) { return k !== "form"; }); ordre.splice(ordre.indexOf("exp"), 0, "form"); }' +
'    _cvPdfOrdrePersoRubriques = ordre;' +
'  }' +
'  _pdfRafraichir();' +
'}' +
'function _pdfDeplacerGroupePerso(index, delta) {' +
'  if (!_cvPdfOrdrePersoRubriques) { _cvPdfOrdrePersoRubriques = ["comp", "exp", "form", "bas"]; }' +
'  var i = index, j = index + delta;' +
'  if (j < 0 || j >= _cvPdfOrdrePersoRubriques.length) { return; }' +
'  var arr = _cvPdfOrdrePersoRubriques.slice();' +
'  arr.splice(j, 0, arr.splice(i, 1)[0]);' +
'  _cvPdfOrdrePersoRubriques = arr;' +
// les anciennes fleches de « Personnaliser » reprennent la main : les lignes composees a la souris sont abandonnees
'  if (_cvPdfChoixMq.lignesUneColonne) { var cc = Object.assign({}, _cvPdfChoixMq); delete cc.lignesUneColonne; _cvPdfChoixMq = cc; }' +
'  _pdfRafraichir();' +
'}' +
// TACHE (Reinitialiser / Style au hasard) : ces choix de CONTENU (jamais
// de style) doivent revenir a l\'automatique par ces 2 chemins, meme
// regle que _cvPdfOrdrePersonnalise (voir sa propre note plus haut) --
// sinon un choix precis fait un jour resterait fige pour toujours, y
// compris apres "Style au hasard" ou une remise a zero complete.
'function _pdfReinitialiserChoixExperiences() {' +
'  _cvPdfModePresentation = "A";' +
'  _cvPdfExperiencesTout = "toutes";' +
'  _cvPdfExperiencesChoisies = null;' +
'  _cvPdfMissionsParExperience = {};' +
'  _cvPdfMissionsChoisies = {};' +
'  _cvPdfMissionsGlobal = null;' +
'  _cvPdfAfficherLieu = true;' +
'  _cvPdfQualitesMetierActives = true;' +
'  _cvPdfAfficherCompPro = true;' +
'  _cvPdfAfficherCompComp = true;' +
'  _cvPdfStyleLieu = "italique";' +
'  _cvPdfPositionDates = "droite";' +
'  _cvPdfPositionDatesChoisie = false;' +
'  _cvPdfDatesAlignees = true;' +
'  _cvPdfPositionDatesFormations = "";' +
'  _cvPdfPositionDatesPerso = "";' +
'  _cvPdfAfficherMissionsFormation = null;' +
'  _cvPdfEspacementFormations = 4;' +
'  _cvPdfCompetencesProMax = null;' +
'  _cvPdfCompetencesComportementalesMax = null;' +
'  _cvPdfCompetencesEnHaut = null;' +
'  _cvPdfFormationsAvantExp = false;' +
'  _cvPdfTitresAgrandis = false;' +
'  _cvPdfOrganisationPerso = false;' +
'  _cvPdfOrdrePersoRubriques = null;' +
'  _cvPdfExpPersoTout = "toutes";' +
'  _cvPdfExpPersoChoisies = null;' +
'  _cvPdfExpPersoMissionsParItem = {};' +
'  _cvPdfExpPersoTexteParItem = {};' +
'  _cvPdfFormationsTout = "toutes";' +
'  _cvPdfFormationsChoisies = null;' +
'  _cvPdfFormationsMissionsParItem = {};' +
'  _cvPdfFormationsTexteParItem = {};' +
'}' +
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
// TACHE (Denis, 2026-09-25, tranche 2) : le modele Sobre choisi survit lui aussi a la reconstruction du panneau.
'  etat.sobreVariante = _cvPdfSobreVariante;' +
'  etat.echellesRubriques = _cvPdfEchellesRubriques;' +
'  etat.policesRubriques = _cvPdfPolicesRubriques;' +
'  etat.stylesPuceRubriques = _cvPdfStylesPuceRubriques;' +
'  etat.positionsEntete = _cvPdfPositionsEntete;' +
'  etat.hauteurEntete = _cvPdfHauteurEntete;' +
'  etat.stylesTexteEntete = _cvPdfStylesTexteEntete;' +
'  etat.rubriquesForceesColonne = _cvPdfRubriquesForceesColonne;' +
'  etat.textesEdites = _cvPdfTextesEdites;' +
// TACHE (Denis, 2026-09-23 : "le panneau experience est catastrophique,
// il ne fait que bugger... je ne peux pas choisir le nombre
// d'experiences... il n'y a rien" -- bug reel confirme, cause racine
// trouvee) : TOUS les etats des phases 5.3/5.4 (cartes Experiences/
// Formations/Elements supplementaires/Organisation) etaient des variables
// UNIQUEMENT locales a cette iframe -- jamais capturees ici. Or
// pageResultats() reconstruit une iframe NEUVE a CHAQUE interaction (voir
// ouvrirApercuPdfHtml, cvPdfExport.js) : chaque reglage revenait donc a
// son defaut a la fin du MEME clic qui venait de le changer (le setter
// appelle _pdfRafraichir() -> _pdfPersisterReglages() -> ce depart, qui
// ne les connaissait pas). Ajoutes ici, memes noms que les variables
// elles-memes, meme convention que tout le reste de cette fonction.
'  etat.modePresentation = _cvPdfModePresentation;' +
'  etat.experiencesTout = _cvPdfExperiencesTout;' +
'  etat.experiencesChoisies = _cvPdfExperiencesChoisies;' +
'  etat.missionsParExperience = _cvPdfMissionsParExperience;' +
'  etat.missionsChoisies = _cvPdfMissionsChoisies;' +
'  etat.missionsGlobal = _cvPdfMissionsGlobal;' +
'  etat.afficherLieuExp = _cvPdfAfficherLieu;' +
'  etat.qualitesMetierActives = _cvPdfQualitesMetierActives;' +
'  etat.afficherCompPro = _cvPdfAfficherCompPro;' +
'  etat.afficherCompComp = _cvPdfAfficherCompComp;' +
'  etat.styleLieuExp = _cvPdfStyleLieu;' +
'  etat.positionDatesExp = _cvPdfPositionDates;' +
'  etat.positionDatesChoisie = _cvPdfPositionDatesChoisie;' +
'  etat.datesAlignees = _cvPdfDatesAlignees;' +
'  etat.positionDatesFormations = _cvPdfPositionDatesFormations;' +
'  etat.positionDatesPerso = _cvPdfPositionDatesPerso;' +
'  etat.afficherMissionsFormation = _cvPdfAfficherMissionsFormation;' +
'  etat.espacementFormations = _cvPdfEspacementFormations;' +
'  etat.competencesProMax = _cvPdfCompetencesProMax;' +
'  etat.competencesComportementalesMax = _cvPdfCompetencesComportementalesMax;' +
'  etat.competencesEnHaut = _cvPdfCompetencesEnHaut;' +
'  etat.colonnesAvantModele = _cvPdfColonnesAvantModele;' +
'  etat.competencesRetirees = _cvPdfCompetencesRetirees;' +
'  etat.rubriquesRetirees = _cvPdfRubriquesRetirees;' +
'  etat.missionsRetirees = _cvPdfMissionsRetirees;' +
'  etat.historiqueRetraits = _cvPdfHistoriqueRetraits;' +
'  etat.ordreExperiencesMien = _cvPdfOrdreExperiencesMien;' +
'  etat.ordreFormationsMien = _cvPdfOrdreFormationsMien;' +
'  etat.ordreFormations = _cvPdfOrdreFormations;' +
'  etat.ordreExpPersoMien = _cvPdfOrdreExpPersoMien;' +
'  etat.ordreExpPerso = _cvPdfOrdreExpPerso;' +
'  etat.certifsRubrique = _cvPdfCertifsRubrique;' +
'  etat.ordreMissions = _cvPdfOrdreMissionsMq;' +
'  etat.reglagesRubriquesMq = _cvPdfReglagesRubriquesMq;' +
'  etat.enteteLibreMq = _cvPdfEnteteLibreMq;' +
'  etat.enteteParModele = _cvPdfEnteteParModele;' +
'  etat.cleModeleEntete = _cvPdfCleModeleEntete;' +
'  etat.avantA5 = _cvPdfAvantA5;' +
'  etat.formatPrecedent = _cvPdfFormatPrecedent;' +
'  etat.textesEditesMq = _cvPdfTextesEditesMq;' +
'  etat.choixMq = _cvPdfChoixMq;' +
'  etat.formationsAvantExp = _cvPdfFormationsAvantExp;' +
'  etat.titresAgrandis = _cvPdfTitresAgrandis;' +
'  etat.organisationPerso = _cvPdfOrganisationPerso;' +
'  etat.ordrePersoRubriques = _cvPdfOrdrePersoRubriques;' +
// TACHE (chantier "Experience personnelle", 2026-09-27) : meme convention
// que experiencesTout/experiencesChoisies/missionsParExperience plus haut.
'  etat.experiencePersoTout = _cvPdfExpPersoTout;' +
'  etat.experiencePersoChoisies = _cvPdfExpPersoChoisies;' +
'  etat.missionsParExpPerso = _cvPdfExpPersoMissionsParItem;' +
'  etat.missionsChoisiesExpPerso = _cvPdfExpPersoMissionsChoisies;' +
'  etat.texteParExpPerso = _cvPdfExpPersoTexteParItem;' +
'  etat.expPersoModeAffichage = _cvPdfExpPersoModeAffichage;' +
'  etat.formationsTout = _cvPdfFormationsTout;' +
'  etat.formationsChoisies = _cvPdfFormationsChoisies;' +
'  etat.missionsParFormation = _cvPdfFormationsMissionsParItem;' +
'  etat.missionsChoisiesFormation = _cvPdfFormationsMissionsChoisies;' +
'  etat.texteParFormation = _cvPdfFormationsTexteParItem;' +
'  return etat;' +
'}' +
'function _pdfAppliquerEtatPersistant(etat) {' +
'  _pdfAppliquerEtat(etat);' +
'  _cvPdfOrdrePersonnalise = etat.ordrePersonnalise || null;' +
'  _cvPdfCreatifVariante = etat.creatifVariante || null;' +
'  _cvPdfSobreVariante = _pdfMigrerVarianteSobre(etat.sobreVariante);' +
'  _cvPdfEchellesRubriques = etat.echellesRubriques || {};' +
'  _cvPdfPolicesRubriques = etat.policesRubriques || {};' +
'  _cvPdfStylesPuceRubriques = etat.stylesPuceRubriques || {};' +
'  _cvPdfPositionsEntete = etat.positionsEntete || {};' +
'  _cvPdfHauteurEntete = etat.hauteurEntete || null;' +
'  _cvPdfStylesTexteEntete = etat.stylesTexteEntete || {};' +
'  _cvPdfRubriquesForceesColonne = etat.rubriquesForceesColonne || {};' +
'  _cvPdfTextesEdites = etat.textesEdites || {};' +
'  _cvPdfModePresentation = etat.modePresentation || "A";' +
'  _cvPdfExperiencesTout = etat.experiencesTout || "toutes";' +
'  _cvPdfExperiencesChoisies = etat.experiencesChoisies || null;' +
'  _cvPdfMissionsParExperience = etat.missionsParExperience || {};' +
'  _cvPdfMissionsChoisies = etat.missionsChoisies || {};' +
'  _cvPdfMissionsGlobal = (typeof etat.missionsGlobal === "number") ? etat.missionsGlobal : null;' +
'  _cvPdfExpPersoTout = etat.experiencePersoTout || "toutes";' +
'  _cvPdfExpPersoChoisies = etat.experiencePersoChoisies || null;' +
'  _cvPdfExpPersoMissionsParItem = etat.missionsParExpPerso || {};' +
'  _cvPdfExpPersoMissionsChoisies = etat.missionsChoisiesExpPerso || {};' +
'  _cvPdfExpPersoTexteParItem = etat.texteParExpPerso || {};' +
'  _cvPdfExpPersoModeAffichage = (etat.expPersoModeAffichage === "developper") ? "developper" : "citer";' +
'  _cvPdfFormationsTout = etat.formationsTout || "toutes";' +
'  _cvPdfFormationsChoisies = etat.formationsChoisies || null;' +
'  _cvPdfFormationsMissionsParItem = etat.missionsParFormation || {};' +
'  _cvPdfFormationsMissionsChoisies = etat.missionsChoisiesFormation || {};' +
'  _cvPdfFormationsTexteParItem = etat.texteParFormation || {};' +
'  _cvPdfAfficherLieu = (etat.afficherLieuExp !== false);' +
'  _cvPdfQualitesMetierActives = (etat.qualitesMetierActives !== false);' +
'  _cvPdfAfficherCompPro = (etat.afficherCompPro !== false);' +
'  _cvPdfAfficherCompComp = (etat.afficherCompComp !== false);' +
'  _cvPdfStyleLieu = etat.styleLieuExp || "normal";' +
'  _cvPdfPositionDates = etat.positionDatesExp || "droite";' +
'  _cvPdfPositionDatesChoisie = !!etat.positionDatesChoisie;' +
'  _cvPdfDatesAlignees = (etat.datesAlignees === undefined) ? true : !!etat.datesAlignees;' +
'  _cvPdfPositionDatesFormations = etat.positionDatesFormations || "";' +
'  _cvPdfPositionDatesPerso = etat.positionDatesPerso || "";' +
'  _cvPdfAfficherMissionsFormation = (typeof etat.afficherMissionsFormation === "boolean") ? etat.afficherMissionsFormation : null;' +
'  _cvPdfEspacementFormations = (typeof etat.espacementFormations === "number") ? etat.espacementFormations : 4;' +
'  _cvPdfCompetencesProMax = (typeof etat.competencesProMax === "number") ? etat.competencesProMax : null;' +
'  _cvPdfCompetencesComportementalesMax = (typeof etat.competencesComportementalesMax === "number") ? etat.competencesComportementalesMax : null;' +
'  _cvPdfCompetencesEnHaut = (etat.competencesEnHaut === null || etat.competencesEnHaut === undefined) ? null : !!etat.competencesEnHaut;' +
'  _cvPdfColonnesAvantModele = (etat.colonnesAvantModele === undefined) ? null : etat.colonnesAvantModele;' +
'  _cvPdfCompetencesRetirees = etat.competencesRetirees || [];' +
'  _cvPdfRubriquesRetirees = etat.rubriquesRetirees || [];' +
'  _cvPdfMissionsRetirees = etat.missionsRetirees || [];' +
'  _cvPdfHistoriqueRetraits = etat.historiqueRetraits || [];' +
'  _cvPdfOrdreExperiencesMien = etat.ordreExperiencesMien || null;' +
'  _cvPdfOrdreFormationsMien = etat.ordreFormationsMien || null;' +
'  _cvPdfOrdreFormations = etat.ordreFormations || (etat.ordreFormationsMien ? "mien" : "pertinence");' +
'  _cvPdfOrdreExpPersoMien = etat.ordreExpPersoMien || null;' +
'  _cvPdfOrdreExpPerso = etat.ordreExpPerso || (etat.ordreExpPersoMien ? "mien" : "pertinence");' +
'  _cvPdfCertifsRubrique = (etat.certifsRubrique === true || etat.certifsRubrique === false) ? etat.certifsRubrique : (etat.certifsUneParUne ? false : null);' +
'  _cvPdfOrdreMissionsMq = etat.ordreMissions || {};' +
'  _cvPdfReglagesRubriquesMq = etat.reglagesRubriquesMq || {};' +
'  _cvPdfEnteteLibreMq = etat.enteteLibreMq || { libre: false, modif: false, disp: null, pos: {}, larg: {}, haut: null, ech: {}, sty: {}, plan: {} };' +
'  _cvPdfEnteteParModele = etat.enteteParModele || {};' +
'  _cvPdfCleModeleEntete = etat.cleModeleEntete || null;' +
'  _cvPdfAvantA5 = etat.avantA5 || null;' +
'  _cvPdfFormatPrecedent = etat.formatPrecedent || null;' +
'  _cvPdfTextesEditesMq = etat.textesEditesMq || {};' +
'  _cvPdfChoixMq = etat.choixMq || {};' +
'  _cvPdfFormationsAvantExp = !!etat.formationsAvantExp;' +
'  _cvPdfTitresAgrandis = !!etat.titresAgrandis;' +
'  _cvPdfOrganisationPerso = !!etat.organisationPerso;' +
'  _cvPdfOrdrePersoRubriques = etat.ordrePersoRubriques || null;' +
'}' +
// window.parent.dossier (jamais window.__cvPdfDossierSource) : robuste
// a un "Recommencer" survenu cote fenetre principale pendant que cette
// iframe etait ouverte (meme raisonnement que le reste de ce fichier,
// qui appelle deja window.parent pour tout le reste).
// TACHE (Denis, 2026-09-25, tranche 4) : API du plein ecran de la maquette. Le parent (js/app.js) parle a ce panneau par
// ces fonctions, jamais en ecrivant directement dans ses variables.
// Remet une competence retiree (case recochee dans « Modifier mes competences et leurs missions », carte Experiences). Retire aussi la ligne de l\'historique.
'function _pdfMqRemettreCompetence(nom) {' +
'  _cvPdfCompetencesRetirees = _cvPdfCompetencesRetirees.filter(function (x) { return x !== nom; });' +
'  _cvPdfHistoriqueRetraits = _cvPdfHistoriqueRetraits.filter(function (h) { return !(h.type === "competence" && h.valeur === nom); });' +
'  _pdfRafraichir();' +
'}' +
'function _pdfMqRetirerCompetence(nom) {' +
'  if (_cvPdfCompetencesRetirees.indexOf(nom) === -1) { _cvPdfCompetencesRetirees = _cvPdfCompetencesRetirees.concat([nom]); _cvPdfHistoriqueRetraits = _cvPdfHistoriqueRetraits.concat([{ type: "competence", valeur: nom }]); }' +
'  _pdfRafraichir();' +
'}' +
// TACHE (J4, 2026-09-28) : memes principes que _pdfMqRetirerCompetence juste au-dessus, pour une
// rubrique entiere (rub = intitule complet, ex. "Formations") et pour une mission precise (cle =
// meme cle data-ed que "Modifier le texte", ex. "fm:0:1") -- 3 mecanismes de retrait paralleles,
// un seul historique commun pour les 2 fleches d'annulation ci-dessous.
'function _pdfMqRetirerRubrique(rub) {' +
'  if (_cvPdfRubriquesRetirees.indexOf(rub) === -1) { _cvPdfRubriquesRetirees = _cvPdfRubriquesRetirees.concat([rub]); _cvPdfHistoriqueRetraits = _cvPdfHistoriqueRetraits.concat([{ type: "rubrique", valeur: rub }]); }' +
'  _pdfRafraichir();' +
'}' +
// TACHE (Denis, 2026-09-29, inventaire « bouton x modele ») : les cases « afficher / masquer une rubrique » des cartes n'ecrivaient que dans un reglage lu par
// l'ancien moteur Word ; le PDF (et donc le Word) masque les rubriques par CETTE liste (meme que « Retirer une rubrique » du plein ecran). rub = intitule complet.
'function _pdfMqRubriqueVisible(rub, visible) {' +
'  var dedans = _cvPdfRubriquesRetirees.indexOf(rub) !== -1;' +
'  if (visible && dedans) {' +
'    _cvPdfRubriquesRetirees = _cvPdfRubriquesRetirees.filter(function (x) { return x !== rub; });' +
'    _cvPdfHistoriqueRetraits = _cvPdfHistoriqueRetraits.filter(function (h) { return !(h.type === "rubrique" && h.valeur === rub); });' +
'  } else if (!visible && !dedans) {' +
'    _cvPdfRubriquesRetirees = _cvPdfRubriquesRetirees.concat([rub]);' +
'    _cvPdfHistoriqueRetraits = _cvPdfHistoriqueRetraits.concat([{ type: "rubrique", valeur: rub }]);' +
'  }' +
'  _pdfRafraichir();' +
'}' +
'function _pdfMqRetirerMission(cle) {' +
'  if (_cvPdfMissionsRetirees.indexOf(cle) === -1) { _cvPdfMissionsRetirees = _cvPdfMissionsRetirees.concat([cle]); _cvPdfHistoriqueRetraits = _cvPdfHistoriqueRetraits.concat([{ type: "mission", valeur: cle }]); }' +
'  _pdfRafraichir();' +
'}' +
// Annulation : une fleche simple (dernier retrait seulement, tous mecanismes confondus, dans
// l\'ordre chronologique reel) et une double fleche (tout remettre). Retourne un booleen (simple)
// pour que l\'appelant sache s\'il y avait bien quelque chose a annuler (bouton grise sinon).
'function _pdfMqAnnulerDernierRetrait() {' +
'  if (!_cvPdfHistoriqueRetraits.length) { return false; }' +
'  var dernier = _cvPdfHistoriqueRetraits[_cvPdfHistoriqueRetraits.length - 1];' +
'  _cvPdfHistoriqueRetraits = _cvPdfHistoriqueRetraits.slice(0, -1);' +
'  if (dernier.type === "competence") { _cvPdfCompetencesRetirees = _cvPdfCompetencesRetirees.filter(function (x) { return x !== dernier.valeur; }); }' +
'  else if (dernier.type === "rubrique") { _cvPdfRubriquesRetirees = _cvPdfRubriquesRetirees.filter(function (x) { return x !== dernier.valeur; }); }' +
'  else if (dernier.type === "mission") { _cvPdfMissionsRetirees = _cvPdfMissionsRetirees.filter(function (x) { return x !== dernier.valeur; }); }' +
'  _pdfRafraichir();' +
'  return true;' +
'}' +
'function _pdfMqToutRemettreRetraits() {' +
'  var yAvaitQqchose = !!(_cvPdfCompetencesRetirees.length || _cvPdfRubriquesRetirees.length || _cvPdfMissionsRetirees.length);' +
'  _cvPdfCompetencesRetirees = []; _cvPdfRubriquesRetirees = []; _cvPdfMissionsRetirees = []; _cvPdfHistoriqueRetraits = [];' +
'  _pdfRafraichir();' +
'  return yAvaitQqchose;' +
'}' +
'function _pdfMqDefinirOrdreMissions(prefixe, textes) {' +
'  var copie = {};' +
'  Object.keys(_cvPdfOrdreMissionsMq).forEach(function (k) { copie[k] = _cvPdfOrdreMissionsMq[k]; });' +
'  if (textes && textes.length) { copie[prefixe] = textes; } else { delete copie[prefixe]; }' +
'  _cvPdfOrdreMissionsMq = copie;' +
'  _pdfRafraichir();' +
'}' +
'function _pdfMqDefinirCritereFormations(critere) {' +
'  _cvPdfOrdreFormations = (critere === "date-desc" || critere === "date-asc" || critere === "mien") ? critere : "pertinence";' +
'  _pdfRafraichir();' +
'}' +
'function _pdfMqDefinirCertifsRubrique(v) {' +
'  _cvPdfCertifsRubrique = (v === true || v === false) ? v : null;' +
'  _pdfRafraichir();' +
'}' +
'function _pdfMqDefinirCritereExpPerso(critere) {' +
'  _cvPdfOrdreExpPerso = (critere === "date-desc" || critere === "date-asc" || critere === "mien") ? critere : "pertinence";' +
'  _pdfRafraichir();' +
'}' +
'function _pdfMqDefinirOrdreExpPerso(ordre) {' +
'  _cvPdfOrdreExpPersoMien = (ordre && ordre.length) ? ordre : null;' +
'  _cvPdfOrdreExpPerso = _cvPdfOrdreExpPersoMien ? "mien" : "pertinence";' +
'  _pdfRafraichir();' +
'}' +
'function _pdfMqDefinirOrdreFormations(ordre) {' +
'  _cvPdfOrdreFormationsMien = (ordre && ordre.length) ? ordre : null;' +
'  _cvPdfOrdreFormations = _cvPdfOrdreFormationsMien ? "mien" : "pertinence";' +
'  _pdfRafraichir();' +
'}' +
'function _pdfMqDefinirOrdreExperiences(ordre) {' +
'  _cvPdfOrdreExperiencesMien = ordre;' +
'  document.getElementById("regOrdreExperiences").value = "mien";' +
'  _pdfRafraichir();' +
'}' +
'function _pdfMqStyleRubrique(cle, style) {' +
'  var copie = {};' +
'  Object.keys(_cvPdfReglagesRubriquesMq).forEach(function (k) { copie[k] = _cvPdfReglagesRubriquesMq[k]; });' +
'  if (style) { copie[cle] = style; } else { delete copie[cle]; }' +
'  _cvPdfReglagesRubriquesMq = copie;' +
'  _pdfRafraichir();' +
'}' +
// Espace AU-DESSUS de chaque rubrique (retour Denis 2026-10-01) : « Espacer les rubriques » (automatique) et crans a la main. map = { titre de rubrique : px }
// (0 ou absent = retire l'espace) ; une seule actualisation pour tout le lot. Les autres reglages de la rubrique (taille, interligne) sont conserves.
'function _pdfMqEspacesRubriques(map) {' +
'  var copie = {};' +
'  Object.keys(_cvPdfReglagesRubriquesMq).forEach(function (k) { copie[k] = Object.assign({}, _cvPdfReglagesRubriquesMq[k]); });' +
'  Object.keys(map || {}).forEach(function (cle) {' +
'    var px = Math.max(0, Math.min(80, Math.round(+map[cle] || 0)));' +
'    var st = copie[cle] || {};' +
'    if (px > 0) { st.esp = px; } else { delete st.esp; }' +
'    if (Object.keys(st).length) { copie[cle] = st; } else { delete copie[cle]; }' +
'  });' +
'  _cvPdfReglagesRubriquesMq = copie;' +
'  _pdfRafraichir();' +
'}' +
'function _pdfMqDefinirEntete(etat) {' +
'  _cvPdfEnteteLibreMq = etat;' +
'  _pdfRafraichir();' +
'}' +
// « Revenir aux valeurs par defaut » des competences (2026-10-04) : efface toutes les corrections de texte des competences (cles « k:... »), qu'elles viennent du panneau ou du plein ecran.
'function _pdfMqRemettreTextesCompetences() {' +
'  var copie = {};' +
'  Object.keys(_cvPdfTextesEditesMq).forEach(function (k) { if (k.indexOf("k:") !== 0) { copie[k] = _cvPdfTextesEditesMq[k]; } });' +
'  _cvPdfTextesEditesMq = copie;' +
'  _pdfPersisterReglages();' +
'  _pdfRafraichir();' +
'}' +
'function _pdfMqTexteEdite(ed, original, nouveau) {' +
'  var copie = {};' +
'  Object.keys(_cvPdfTextesEditesMq).forEach(function (k) { copie[k] = _cvPdfTextesEditesMq[k]; });' +
'  if (nouveau === original) { delete copie[ed]; } else { copie[ed] = { t: original, x: nouveau }; }' +
'  _cvPdfTextesEditesMq = copie;' +
'  _pdfPersisterReglages();' +
'}' +
// « Revenir au modele de depart » (maquette : S = DEFAUT) : tout ce qui est propre au plein ecran est efface.
'function _pdfCleModeleEntete() {' +
'  var cre = document.getElementById("regCreatifActif"), sob = document.getElementById("regSobreActif");' +
'  if (cre && cre.checked) { return "creatif:" + _cvPdfCreatifVariante; }' +
'  if (sob && sob.checked) { return "sobre:" + _cvPdfSobreVariante; }' +
'  return "standard";' +
'}' +
'function _pdfEnteteVierge() {' +
'  return { libre: false, modif: false, disp: null, pos: {}, larg: {}, haut: null, ech: {}, sty: {}, plan: {} };' +
'}' +
'function _pdfEchangerReglagesSiFormatChange() {' +
'  var fmt = String(document.getElementById("regFormatCV").value);' +
'  var estA5 = fmt.indexOf("A5") === 0;' +
'  if (_cvPdfFormatPrecedent === null) { _cvPdfFormatPrecedent = fmt; return; }' +
'  var etaitA5 = _cvPdfFormatPrecedent.indexOf("A5") === 0;' +
'  _cvPdfFormatPrecedent = fmt;' +
'  if (estA5 === etaitA5) { return; }' +
'  if (estA5) {' +
'    _cvPdfAvantA5 = { tout: _cvPdfExperiencesTout, choisies: _cvPdfExperiencesChoisies, missions: _cvPdfMissionsGlobal };' +
'    var cap = ((window.parent && window.parent.CAPACITES_A5_PORTRAIT_CV) || {}).experiences || 2;' +
'    var capMissions = ((window.parent && window.parent.CAPACITES_A5_PORTRAIT_CV) || {}).missionsParExperience || 2;' +
'    var nb = ((window.parent && window.parent._mepExperiencesMoteur) || []).length;' +
'    if (_cvPdfExperiencesTout === "toutes" && !_cvPdfExperiencesChoisies) {' +
'      _cvPdfExperiencesTout = "pertinentes";' +
'      _cvPdfExperiencesChoisies = [];' +
'      for (var i = 0; i < Math.min(cap, nb || cap); i++) { _cvPdfExperiencesChoisies.push(i); }' +
'    }' +
'    if (_cvPdfMissionsGlobal === null || _cvPdfMissionsGlobal === undefined) { _cvPdfMissionsGlobal = capMissions; }' +
'  } else if (_cvPdfAvantA5) {' +
'    _cvPdfExperiencesTout = _cvPdfAvantA5.tout;' +
'    _cvPdfExperiencesChoisies = _cvPdfAvantA5.choisies;' +
'    _cvPdfMissionsGlobal = _cvPdfAvantA5.missions;' +
'    _cvPdfAvantA5 = null;' +
'  }' +
'}' +
'function _pdfEchangerEnteteSiModeleChange() {' +
'  var cle = _pdfCleModeleEntete();' +
'  if (_cvPdfCleModeleEntete === null) { _cvPdfCleModeleEntete = cle; return; }' +
'  if (cle === _cvPdfCleModeleEntete) { return; }' +
'  var copie = {};' +
'  Object.keys(_cvPdfEnteteParModele).forEach(function (k) { copie[k] = _cvPdfEnteteParModele[k]; });' +
'  copie[_cvPdfCleModeleEntete] = JSON.parse(JSON.stringify(_cvPdfEnteteLibreMq));' +
'  _cvPdfEnteteParModele = copie;' +
'  _cvPdfEnteteLibreMq = _cvPdfEnteteParModele[cle] ? JSON.parse(JSON.stringify(_cvPdfEnteteParModele[cle])) : _pdfEnteteVierge();' +
'  _cvPdfCleModeleEntete = cle;' +
'}' +
'function _pdfMqChoix(cle, valeur) {' +
'  var copie = {};' +
'  Object.keys(_cvPdfChoixMq).forEach(function (k) { copie[k] = _cvPdfChoixMq[k]; });' +
'  if (valeur === null || valeur === undefined) { delete copie[cle]; } else { copie[cle] = valeur; }' +
'  _cvPdfChoixMq = copie;' +
'  _pdfRafraichir();' +
'}' +
// Competences choisies une par une (« Choisir ») : la liste vient du parent ; les croix du plein ecran de CETTE categorie
// (competences retirees) sont effacees puisque la liste choisie les exclut deja.
'function _pdfMqChoixCompetences(cleChoix, liste, poolNoms) {' +
'  var pool = poolNoms || [];' +
'  _cvPdfCompetencesRetirees = _cvPdfCompetencesRetirees.filter(function (x) { return pool.indexOf(x) === -1; });' +
'  _pdfMqChoix(cleChoix, liste);' +
'}' +
// « Remettre les premieres » (maquette : delete S.mSel[id]) : le nombre de missions reste, seul le choix a la carte est efface.
'function _pdfMqRemettrePremieresMissions(index) {' +
'  delete _cvPdfMissionsChoisies[index];' +
'  _pdfRafraichir();' +
'}' +
// « Taille de : Texte » (maquette : curseur en px, 12,5 par defaut = echelle 1 du rendu).
'function _pdfMqTailleTexte(px) {' +
'  var v = parseFloat(px);' +
'  if (isNaN(v)) { return; }' +
'  _cvPdfEchelle = Math.max(0.5, Math.min(1.6, v / 12.5));' +
'  _pdfRafraichir();' +
'}' +
'function _pdfMqToutRemettre() {' +
'  _cvPdfCompetencesRetirees = [];' +
'  _cvPdfRubriquesRetirees = [];' +
'  _cvPdfMissionsRetirees = [];' +
'  _cvPdfHistoriqueRetraits = [];' +
'  _cvPdfOrdreExperiencesMien = null;' +
'  _cvPdfOrdreFormationsMien = null;' +
'  _cvPdfOrdreFormations = "pertinence";' +
'  _cvPdfOrdreExpPersoMien = null;' +
'  _cvPdfOrdreExpPerso = "pertinence";' +
'  _cvPdfCertifsRubrique = null;' +
'  _cvPdfOrdreMissionsMq = {};' +
'  _cvPdfReglagesRubriquesMq = {};' +
'  _cvPdfEnteteLibreMq = { libre: false, modif: false, disp: null, pos: {}, larg: {}, haut: null, ech: {}, sty: {}, plan: {} };' +
'  _cvPdfEnteteParModele = {};' +
'  _cvPdfTextesEditesMq = {};' +
'  var intitulesGardes = _cvPdfChoixMq.intitulesPerso;' +
'  _cvPdfChoixMq = intitulesGardes ? { intitulesPerso: intitulesGardes } : {};' +
'  document.getElementById("regOrdreExperiences").value = "date-desc";' +
'  _pdfPersisterReglages();' +
'}' +
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
'  regColonnes: "1", regColonnesInversees: false, regSeparateurColonnes: false, regFormeColonnes: "rectangle", regLargeurColonneGauche: "35",' +
'  regCouleurDebut: "#2f6690", regCouleurFin: "#d9e8f2", regFondColonnes: "aucun", regFondColonnesEffet: "fondSeul", regDegradeColonnes: "fonce-clair",' +
'  regBandeauEnTete: false, regFormeEnTete: "rectangle", regDegradeBandeau: "fonce-clair", regBandeauDisponibilite: false, regAnneauPhoto: false,' +
'  regStyleTitres: "souligne", regLectureGuidee: false, regStyleProfessionnel: "epure", regStylePersonnel: "epure", regStyleFormations: "epure", regSeparateurMissions: "pointvirgule", regStyleBordures: "fine", regIcones: false, regIconesCoordonnees: false, regPolice: "arial", regTexteFondColonnes: "blanc", regBandeauCompetencesCles: false,' +
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
// TACHE (phase 5.4, carte "Experiences professionnelles") : "Reinitialiser"
// remet aussi ces choix de CONTENU a l\'automatique (meme principe exact
// que _cvPdfOrdrePersonnalise juste au-dessus).
'  _pdfReinitialiserChoixExperiences();' +
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
// TACHE (Denis, 2026-09-23 : "a une condition tres importante, que tous
// les reglages qui seront dans un panneau separe ne vont pas interferer
// et ne seront pas integres dans le mode aleatoire... a une epoque il y
// en avait beaucoup qui etaient integres, aujourd'hui je ne le veux
// pas") : tous les reglages PDF reels SANS equivalent dans les 8 blocs
// de la maquette (carte "Reglages supplementaires", js/app.js) --
// jusqu'ici encore re-tires par "Style au hasard" comme le reste. Fige
// leur valeur juste avant le tirage, la restaure juste apres (avant le
// rafraichissement) : desormais strictement manuels, jamais touches par
// le de, quel que soit ce que le tirage a pu leur assigner au passage.
'var _PDF_CHAMPS_HORS_MAQUETTE_JAMAIS_ALEATOIRES = ["regAnneauPhoto", "regBandeauCompetencesCles", "regBandeauDisponibilite", "regCoinsArrondis", "regDegradeBandeau", "regDispositionEntete", "regEnteteInverseeA5", "regFondColonnePleineHauteur", "regFondColonnesA5", "regFondColonnesEffet", "regFormatExperiences", "regFormeColonnes", "regFormeEnTete", "regItaliqueDates", "regItaliqueEntreprise", "regItaliquePoste", "regSoulignerDates", "regSoulignerEntreprise", "regSoulignerPoste", "regLargeurAccrocheLibre", "regLargeurMetierLibre", "regLargeurColonneGauche", "regLectureGuidee", "regStyleBordures", "regStylePersonnel", "regStyleProfessionnel", "regStyleTitres", "regTexteFondColonnes"];' +
'function _pdfFigerChampsHorsMaquette() {' +
'  var etat = {};' +
'  _PDF_CHAMPS_HORS_MAQUETTE_JAMAIS_ALEATOIRES.forEach(function (id) {' +
'    var el = document.getElementById(id);' +
'    if (el) { etat[id] = (el.type === "checkbox") ? el.checked : el.value; }' +
'  });' +
'  return etat;' +
'}' +
'function _pdfRestaurerChampsHorsMaquette(etat) {' +
'  Object.keys(etat).forEach(function (id) {' +
'    var el = document.getElementById(id);' +
'    if (!el) { return; }' +
'    if (el.type === "checkbox") { el.checked = etat[id]; } else { el.value = etat[id]; }' +
'  });' +
'}' +
'function _pdfGenererStyleAleatoire() {' +
'  _cvPdfEtatAvantAleatoire = _pdfCapturerEtatPersistant();' +
'  var _etatHorsMaquetteAvant = _pdfFigerChampsHorsMaquette();' +
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
// CORRECTIF (chantier refonte mise en page PDF, phase 3.6, 2026-09-22 --
// Denis : "c'etait une mauvaise idee de mettre a zero l'ordre glisse-
// depose des rubriques dans le style au hasard, je ne veux pas conserver
// ce comportement, ni ici ni dans la maquette") : la ligne "_cvPdfOrdrePersonnalise
// = null" du 2026-09-15 (voir commentaire juste au-dessus, "ardoise
// vierge a chaque tirage") est ANNULEE ici pour ce seul reglage --
// l'ordre des rubriques, glisse-depose a la main, n'est PLUS jamais
// touche par "Style au hasard" (C2/C20 du cahier de chantier). Les autres
// personnalisations manuelles listees dans ce meme commentaire (echelle,
// police, position libre de l'en-tete...) restent, elles, reinitialisees
// -- decision du 2026-09-15 non remise en cause pour elles.
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
'  document.getElementById("regStyleFormations").value = _pdfChoixAleatoire(["epure", "condense"]);' +
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
// purement VISUELLES uniquement (mise en forme des experiences) --
// lettre jointe et regroupement restent volontairement hors du tirage
// (choix editorial de contenu, jamais declenche par surprise -- reponse
// explicite de l'utilisateur, meme principe que le Word qui ne les
// randomise jamais non plus). Reste modifiable a la main ensuite, comme
// tout le reste de ce panneau.
// CORRECTIF (chantier refonte mise en page PDF, phase 3.6, 2026-09-22 --
// bug reel de Denis : "j'ai essaye de changer l'ordre sans succes, y
// compris en modifiant le code") : regOrdreExperiences n'etait PAS un
// reglage "purement visuel" contrairement a ce que disait le commentaire
// ci-dessus -- trier par date ou par poste change reellement la POSITION
// de chaque experience, ecrasant silencieusement l'ordre choisi a la main
// sur l'ecran de relecture (fleches ▲▼) des que "Style au hasard" tombait
// sur autre chose que "pertinence" (3 chances sur 5). Retire du tirage :
// reste sur la valeur deja choisie par la personne, jamais ecrase par
// surprise (C2/C20 du cahier de chantier : "le hasard ne melange plus
// rien d'autre que le style").
'  document.getElementById("regFormatExperiences").value = _pdfChoixAleatoire(["standard", "ameliore"]);' +
'  document.getElementById("regIcones").checked = Math.random() < 0.5;' +
'  document.getElementById("regIconesCoordonnees").checked = Math.random() < 0.5;' +
// TACHE (retour Denis 2026-09-27) : la police n'est plus tiree au hasard,
// ni ici ni via un modele (Sobre/Creatif, voir CREATIF_MODELES_XXL,
// js/app.js) -- seule la personne la choisit explicitement (select #regPolice),
// quel que soit le modele affiche. Reste donc a la valeur deja en place,
// jamais ecrasee par ce tirage.
'  document.getElementById("regBandeauCompetencesCles").checked = Math.random() < 0.4;' +
// TACHE (retour utilisateur historique : "adapter le PDF au Word -- le de
// du Word randomise deja 'bloc mis en avant'") : ce reglage etait inclus
// volontairement dans le tirage -- DECISION ANNULEE (chantier refonte
// mise en page PDF, phase 3.6, 2026-09-22, Denis : "c'etait une mauvaise
// idee, je ne veux pas conserver ce comportement, ni ici ni dans la
// maquette"). "Mettre en avant les formations" choisit CE QUI est montre
// (toutes les formations ou seulement la plus pertinente developpee) --
// un choix de CONTENU, jamais du style : retire du tirage, comme
// regOrdreExperiences juste au-dessus (C2/C20 du cahier de chantier).
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
'  _pdfRestaurerChampsHorsMaquette(_etatHorsMaquetteAvant);' +
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
// TACHE (phase 5.2, Denis 2026-09-23) : le Sobre actif n\'etait pas du
// tout distingue ici -- un clic tombait tout droit dans le tirage
// complet (_pdfGenererStyleAleatoire), qui re-tire bien la variante
// Sobre au passage (voir son propre commentaire) mais aussi tout le
// reste (couleurs...), jamais coherent avec "Un autre modele (n sur N)"
// qui ne doit changer QUE le modele. Meme branchement que Creatif
// desormais.
'document.getElementById("btnStyleAleatoire").addEventListener("click", function () {' +
'  if (document.getElementById("regCreatifActif").checked) { _pdfProposerAutreModeleCreatif(); }' +
'  else if (document.getElementById("regSobreActif").checked) { _pdfProposerVarianteSobreSuivante(); }' +
'  else { _pdfGenererStyleAleatoire(); }' +
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
