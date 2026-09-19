// ============================================================
// miniCvA5.js
// ------------------------------------------------------------
// TACHE (nettoyage, retour utilisateur : "miniCvA5.js, ca vaut le coup de
// le garder ?") : ce fichier construisait a l'origine le Mini CV (A5) via
// son propre pipeline (_dnConstruireMiniCV/_dnConstruireMiniCVPaysage),
// AVANT que le chantier "Mini CV A5 rejoint le Composeur" (voir
// genererDocxNatifCVFormat, formatA5CV.js) ne migre le VRAI rendu A5
// (apercu ET telechargement) vers composeurRender.js (branche
// formatPage==='A5-portrait'/'A5-paysage'). Confirme CODE MORT par
// instrumentation runtime (fonctions monkey-patchees, rendu + telechargement
// A5 reels declenches : seul genererDocxComposeur a ete appele) --
// _dnConstruireMiniCV/_dnConstruireMiniCVPaysage/_dnTaillePageA5Paysage/
// _dnFormaterVille retires en consequence.
//
// Les 2 fonctions restantes ci-dessous, elles, restent REELLEMENT utilisees
// par plusieurs autres generateurs Word (composeurRender.js pour Projet
// XXL, exportDocxNatifCV*.js pour les 16 modeles classiques) -- jamais
// dupliquees ailleurs, ce fichier reste leur seul point de definition,
// charge globalement comme les autres modules cv-editor/.
// ============================================================

// ---- Conversion d'une image en base64 (dossier.photo.url) vers les
// octets bruts attendus par docx.ImageRun -- atob() est une fonction
// navigateur standard, disponible partout ou ce fichier s'execute
// reellement (aucune dependance supplementaire). ----
function _dnDataUrlVersOctets(dataUrl) {
  if (!dataUrl || dataUrl.indexOf('base64,') === -1) { return null; }
  try {
    var base64 = dataUrl.slice(dataUrl.indexOf('base64,') + 7);
    var binaire = atob(base64);
    var octets = new Uint8Array(binaire.length);
    for (var i = 0; i < binaire.length; i++) { octets[i] = binaire.charCodeAt(i); }
    return octets;
  } catch (e) { return null; }
}
function _dnTypeImagePhoto(dataUrl) {
  return (dataUrl && dataUrl.indexOf('image/png') !== -1) ? 'png' : 'jpg';
}
