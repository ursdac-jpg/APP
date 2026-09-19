/* ============================================================
   modules/cv-editor/modelesDisponibles.js
   ------------------------------------------------------------
   Liste centrale des modeles de CV disponibles (id du dossier dans
   modules/cv-editor/templates/, + nom affiche dans le selecteur).

   SEUL endroit a modifier pour ajouter un futur modele a la liste
   deroulante : ajouter une ligne ici (en plus de creer le dossier
   modules/cv-editor/templates/<id>/ avec template.html, style.css et
   <id>.json, comme les modeles existants). Aucune autre modification
   de code n'est necessaire -- ouvrirApercuCV() et
   chargerEtAfficherApercuCV() (js/app.js) lisent cette liste de facon
   generique, sans jamais nommer un modele en dur.
   ============================================================ */

// TACHE (retour utilisateur, chantier audit UX point 18 : "seul Composeur/
// Projet XXL doit rester propose pour le CV") : les 15 anciens modeles
// classiques sont retires de cette liste -- verifie avant suppression que
// plus aucun chemin reel ne peut les atteindre pour le CV :
// initialiserApercuInlineSiOuvert() (js/app.js) force deja
// etatApercuInline.cv.modele = 'composeur' a chaque ouverture de l'apercu,
// et genererBlobDocumentActif()/genererDocxNatifCVFormat() retombent sur ce
// meme defaut 'composeur' si jamais l'apercu n'a pas ete ouvert -- aucun
// des 2 seuls generateurs reels (PDF, Word) ne peut donc plus jamais
// recevoir un id classique pour le CV. Lettre/Entretien ne sont pas
// concernes : ils gardent leurs propres listes (MODELES_LETTRE_DISPONIBLES/
// MODELES_ENTRETIEN_DISPONIBLES), inchangees.
var MODELES_CV_DISPONIBLES = [
  { id: 'composeur', nom: 'Composeur' },
];
