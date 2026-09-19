/* ============================================================
   modules/bilan-candidature/modeles/elementsAnonymises.js
   ------------------------------------------------------------
   Regle metier centralisee (retour utilisateur, 2026-08-10) : une donnee
   volontairement retiree du CV avant son envoi a l’assistant -- pour proteger la
   confidentialite de la personne -- ne peut jamais devenir un critere
   negatif dans l'analyse. prompts/bilan-v1.md (section 1) donne deja
   cette consigne a l’assistant, mais un prompt n'est jamais une garantie
   mecanique : ce fichier fournit le filet de securite cote application.

   Volontairement GENERIQUE : ne code pas "coordonnees" en dur, mais un
   catalogue des elements concernes (nom, prenom, photo, telephone,
   e-mail, adresse, coordonnees/contact). Ajouter un futur element
   anonymise (ex. date de naissance) se fait UNIQUEMENT en completant
   BILAN_ELEMENTS_ANONYMISES ci-dessous -- jamais en touchant au parseur
   qui le consomme (diagnostic/diagnosticResponseParser.js).

   Design du detecteur : concept (le mot qui designe l'element : "photo",
   "telephone"...) ET negation/absence ("absent", "aucun", "ne mentionne
   pas"...) doivent TOUS LES DEUX apparaitre dans le MEME texte pour
   declencher une correspondance. Fiable sur des textes courts et
   phrases uniques (un point fort/faible, une recommandation) : le risque
   de faux positif (ex. "les coordonnees de l'entreprise ciblee", sans
   negation a proximite) reste faible. N'est PAS concu pour un paragraphe
   entier melangeant plusieurs idees -- voir l'appelant pour la distinction
   liste (filtree) / prose libre (seulement signalee, jamais modifiee).

   Fonction pure, aucune dependance DOM ni etat externe -- testable seule.
   ============================================================ */

var BILAN_ELEMENTS_ANONYMISES = [
  { id: 'nom', regexConcept: /\bpr[ée]noms?\b|\bnoms?\s+(du|de la|des)\s+candidat/i },
  { id: 'photo', regexConcept: /\bphotos?\b/i },
  { id: 'telephone', regexConcept: /\bt[ée]l[ée]phones?\b|\bnum[ée]ro(s)?\s+de\s+t[ée]l/i },
  { id: 'email', regexConcept: /\be-?mails?\b|\bcourriels?\b|\badresse(s)?\s+mail/i },
  { id: 'adresse', regexConcept: /\badresse(s)?\s+(postale|personnelle|du candidat)/i },
  { id: 'coordonnees', regexConcept: /\bcoordonn[ée]es\b|\binformations?\s+de\s+contact\b|\bmoyen(s)?\s+de\s+(vous\s+)?contacter\b/i }
];

var BILAN_REGEX_NEGATION_ABSENCE = /\b(absente?s?|manquante?s?|manque|aucun|aucune|non\s+renseign|non\s+fourni|non\s+communiqu|non\s+pr[ée]cis|pas\s+de\b|ne\s+mentionne\s+pas|ne\s+permet\s+pas|impossible\s+de|sans\b)/i;

// Retourne l'id de l'element anonymise mentionne (ex. 'coordonnees'), ou
// null si le texte n'evoque ni concept ni negation lies a ce catalogue.
// texte : chaine courte (un point fort, une recommandation...) -- voir
// en-tete pour les limites de cette approche sur un paragraphe long.
function bilanElementAnonymiseMentionne(texte) {
  if (!texte || typeof texte !== 'string') { return null; }
  if (!BILAN_REGEX_NEGATION_ABSENCE.test(texte)) { return null; }
  for (var i = 0; i < BILAN_ELEMENTS_ANONYMISES.length; i += 1) {
    if (BILAN_ELEMENTS_ANONYMISES[i].regexConcept.test(texte)) {
      return BILAN_ELEMENTS_ANONYMISES[i].id;
    }
  }
  return null;
}

if (typeof module !== 'undefined') {
  module.exports = {
    BILAN_ELEMENTS_ANONYMISES: BILAN_ELEMENTS_ANONYMISES,
    bilanElementAnonymiseMentionne: bilanElementAnonymiseMentionne
  };
}
