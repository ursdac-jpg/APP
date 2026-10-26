/* ============================================================
   modules/lettre-core/construireMessageLettreCo.js
   ------------------------------------------------------------
   construireMessageLettreCo(promptEtProfil, cvTexte) : assemble le
   message copie par « Écrire ma lettre avec l'assistant » : le prompt et
   le profil (deja assembles par promptCache(), js/app.js), puis la
   section « CV DE LA PERSONNE » que prompts/lettre-co.md annonce.

   Pourquoi une fonction pure a part : le CV voyage desormais DANS le
   message (plus de second temps « Copier mon CV »), il faut donc que le
   titre de la section reste exactement celui que le prompt cite. Ce
   fichier est testable en Node (tests/lettreCoreMessageLettreCo.test.js),
   contrairement a data/metiers.js.

   Le CV est toujours du texte : une photo ou un scan est lu par OCR puis
   relu par la personne a l'ecran de depot (ouvrirAssistantDepotCV).
   ============================================================ */

var TITRE_SECTION_CV_LETTRE_CO = 'CV DE LA PERSONNE';

// sectionRecommandation (facultatif) : texte deja forme par sectionRecommandationLettreCo(), ajoute apres le CV.
function construireMessageLettreCo(promptEtProfil, cvTexte, sectionRecommandation) {
  var base = String(promptEtProfil || '').replace(/\s+$/, '');
  var cv = String(cvTexte || '').trim();
  var reco = String(sectionRecommandation || '').trim();
  var suite = reco ? '\n\n' + reco : '';
  if (!cv) {
    // Repli : ne devrait pas arriver (le depot impose un texte relu), mais le
    // prompt dit que le CV est present ; on dit la verite a l'assistant.
    return base + '\n\n' + TITRE_SECTION_CV_LETTRE_CO + '\n' +
      'Aucun texte de CV n\'a été transmis avec ce message : demande à la personne de coller le texte de son CV avant ta première question.' + suite;
  }
  return base + '\n\n' + TITRE_SECTION_CV_LETTRE_CO + ' (déjà relu et masqué par elle)\n' + cv + suite;
}

// Export CommonJS protege -- tests/lettreCoreMessageLettreCo.test.js (Node),
// aucun effet sur le chargement navigateur classique (balise <script>).
if (typeof module !== 'undefined') {
  module.exports = { construireMessageLettreCo: construireMessageLettreCo, TITRE_SECTION_CV_LETTRE_CO: TITRE_SECTION_CV_LETTRE_CO };
}
