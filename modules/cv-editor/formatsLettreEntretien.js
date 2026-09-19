// ============================================================
// formatsLettreEntretien.js
// ------------------------------------------------------------
// TACHE (couleurs + 3 formats pour la lettre et l'entretien, comme pour
// le CV) : reutilise les 6 memes couleurs (PALETTES_COULEURS_CV, deja
// definies dans coloriationDocxNatifCV.js, charge avant ce fichier) et
// les memes principes que formatA5CV.js -- un seul modele existant pour
// chacun ("sobre"/"clair"), mais deja pret pour couleur + format.
//
// Contrairement au CV, il n'existe pas de moteur de decision IA pour
// choisir QUOI garder (la lettre/l'entretien sont deja des textes
// entierement rediges par l'IA, pas des listes d'elements a trier) --
// "Essentiel"/"Mini" tronquent donc le texte/les listes deja fournies,
// sans logique de pertinence supplementaire. Troncature "propre" (coupe
// au dernier espace), voir _dnTronquerTexte() (formatA5CV.js, deja charge).
// ============================================================

var MODELES_AVEC_COULEURS_LETTRE = ['sobre'];
var MODELES_AVEC_COULEURS_ENTRETIEN = ['clair'];

function modeleLettreSupporteCouleurs(modeleId) { return MODELES_AVEC_COULEURS_LETTRE.indexOf(modeleId) !== -1; }
function modeleEntretienSupporteCouleurs(modeleId) { return MODELES_AVEC_COULEURS_ENTRETIEN.indexOf(modeleId) !== -1; }

// ============================================================
// LETTRE
// ============================================================
var LONGUEURS_TEXTE_LETTRE = {
  'A4-essentiel': 900,
  'A5': 350
};

function construireObjetLettrePourExportFormat(formatPage) {
  var objetLettre = normaliserDonneesLettre(dossier);
  var limite = LONGUEURS_TEXTE_LETTRE[formatPage];
  if (!limite) { return objetLettre; } // 'A4' (Détaillé) ou absent : texte complet, inchange
  var objetTronque = {};
  Object.keys(objetLettre).forEach(function (cle) { objetTronque[cle] = objetLettre[cle]; });
  // TACHE (retour utilisateur : "je veux qu'on demande à l'IA une vraie
  // version courte, pas une coupure de la version longue") : utilise
  // objetLettre.texteCourt (rédigé séparément par l'IA, voir lettre.md)
  // quand il existe -- jamais une coupure dans ce cas. Ne retombe sur la
  // troncature (coupe propre, voir _dnTronquerTexte) que si aucun texte
  // court n'a été fourni (réponse IA antérieure à ce champ, ou lettre
  // "Co-construire" qui ne passe pas par ce schéma).
  objetTronque.texte = objetLettre.texteCourt
    ? objetLettre.texteCourt
    : _dnTronquerTexte(objetLettre.texte, limite);
  return objetTronque;
}

function _dnOptsCouleurLettre(couleurId) {
  var palette = (couleurId && typeof PALETTES_COULEURS_CV !== 'undefined') ? PALETTES_COULEURS_CV[couleurId] : null;
  return palette ? { primaire: palette.primaire } : {};
}

// Point d'entree public -- couleurId/formatPage optionnels, comportement
// inchange si absents (comme genererDocxNatifCVColore()/Format()).
// TACHE (retour utilisateur 2026-09-15, generalisation) : applique
// desormais le meme ajustement automatique de taille de police que le
// bouton d'export direct de Co-construire ma lettre
// (_dnAjusterLettrePourUnePage(), exportDocxNatifLettre.js, charge avant
// ce fichier -- voir index.html) -- avant, seul ce chemin direct
// garantissait "tient sur une page" pour un texte long ; "Vos documents"
// (tous les autres parcours) generait sans jamais reduire la police.
function genererDocxNatifLettreFormat(modeleId, couleurId, formatPage) {
  var objetLettre = construireObjetLettrePourExportFormat(formatPage);
  return chargerLibrairieDocxNatif().then(function (docx) {
    var opts = _fusionnerOptsLettreEntretien(_dnOptsCouleurLettre(couleurId), { formatPage: formatPage });
    var ajuste = (typeof _dnAjusterLettrePourUnePage === 'function')
      ? _dnAjusterLettrePourUnePage(objetLettre, opts)
      : { objetLettre: objetLettre, opts: opts };
    var generateur = GENERATEURS_DOCX_NATIFS_LETTRE[modeleId];
    if (!generateur) { throw new Error('Pas de generateur Word natif pour ce modele de lettre.'); }
    return docx.Packer.toBlob(generateur(docx, ajuste.objetLettre, ajuste.opts));
  });
}

// ============================================================
// ENTRETIEN
// ============================================================
// TACHE (retour utilisateur 2026-09-15, decision) : contrairement a la
// lettre, la fiche d'entretien n'est jamais transmise a un tiers -- une
// feuille de route personnelle pour le beneficiaire. Aucune consigne du
// prompt entretien.md ne garantit une tenue sur une page (contrairement a
// lettre.md) : "A4 Essentiel" coupait donc mecaniquement des elements de
// preparation sans certitude que la version complete deborde reellement
// d'une page. Decision Denis : mieux vaut le contenu complet, quitte a
// deborder sur une 2e page, qu'un essentiel qui retire quelque chose
// d'utile. Le choix de format est retire cote UI (js/app.js,
// construireContenuApercuFinalisation) ; cette fonction ignore desormais
// systematiquement formatPage pour l'entretien, y compris pour un dossier
// sauvegarde avant ce changement dont formatPage vaudrait encore
// 'A4-essentiel'.
function construireObjetEntretienPourExportFormat() {
  return normaliserDonneesEntretien(dossier);
}

function _dnOptsCouleurEntretien(couleurId) {
  var palette = (couleurId && typeof PALETTES_COULEURS_CV !== 'undefined') ? PALETTES_COULEURS_CV[couleurId] : null;
  return palette ? { primaire: palette.primaire, teinte: palette.teinte, secondaire: palette.secondaire } : {};
}

function genererDocxNatifEntretienFormat(modeleId, couleurId, formatPage) {
  var objetEntretien = construireObjetEntretienPourExportFormat(formatPage);
  return chargerLibrairieDocxNatif().then(function (docx) {
    var opts = _fusionnerOptsLettreEntretien(_dnOptsCouleurEntretien(couleurId), { formatPage: formatPage });
    var generateur = GENERATEURS_DOCX_NATIFS_ENTRETIEN[modeleId];
    if (!generateur) { throw new Error('Pas de generateur Word natif pour ce modele de fiche entretien.'); }
    return docx.Packer.toBlob(generateur(docx, objetEntretien, opts));
  });
}

function _fusionnerOptsLettreEntretien() {
  var resultat = {};
  for (var i = 0; i < arguments.length; i++) {
    var o = arguments[i] || {};
    Object.keys(o).forEach(function (cle) { resultat[cle] = o[cle]; });
  }
  return resultat;
}
