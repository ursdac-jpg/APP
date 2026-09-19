/* ============================================================
   modules/bilan-candidature/assistance/resolutionChampExperience.js
   ------------------------------------------------------------
   TACHE (chantier "Assistance a la finalisation du CV", brique 4bis,
   2026-08-11) : interface manquante, trouvee en concevant la brique 5
   (orchestrateur) -- la brique 1 avait juge la resolution pour
   'experiences' "triviale" et l'avait renvoyee a la brique 4, qui s'est
   averee volontairement aveugle a toute resolution. Aucun resolveur
   n'existait donc pour cette cible.

   Vocabulaire de resultat repris de resolutionChampNiveau2.js (brique 1,
   candidature), qui existait au moment de la conception de ce fichier --
   retire depuis (2026-08-11, plus aucun consommateur reel, voir
   ARCHITECTURE_NIVEAU2_BILAN_CANDIDATURE.md) : meme forme de resultat
   conservee ici pour rester coherente avec le reste du chantier, jamais
   un second vocabulaire invente pour la meme idee.

   REGLE V1, PAS UN POSTULAT DEFINITIF SUR LES AXES (decision explicite,
   2026-08-11) : `champ` vaut toujours 'missions'. Les 6 axes concernes
   par le Niveau 2 sans extrait (credibilite, risques, impact, coherence,
   differenciation, posture) portent aujourd'hui tous sur le contenu
   d'une experience, jamais sur l'intitulé du poste -- mais ce fichier ne
   code pas cette observation comme une verite immuable sur les axes,
   seulement comme le comportement de la V1. Si un jour un axe devait
   cibler `poste` plutot que `missions`, ce fichier est le seul a changer,
   l'orchestrateur n'a jamais besoin de le savoir.

   Forme du resultat :
     { type: 'unique', destination: { index, champ: 'missions' } }
       -- une seule experience existe, aucune ambiguite.
     { type: 'selection', destinations: [{ index, champ: 'missions' }, ...] }
       -- plusieurs experiences existent, laquelle est concernee reste
       ambigu. Pour la V1, ce cas n'est pas automatise (pas de selecteur
       humain construit encore, voir ARCHITECTURE_NIVEAU2, section 5.3) :
       l'orchestrateur ne doit jamais deviner, seulement s'abstenir ou
       rediriger vers le parcours manuel existant.
     { type: 'indisponible' } -- dossier.experiences vide, cas limite.
   ============================================================ */

// TACHE (chantier "enrichissement CV legers via experiencesPerso",
// 2026-08-22) : `experiences` est desormais la liste COMBINEE deja
// construite par hostDataAdapter.lireExperiencesTexte() (experiences +
// experiencesPerso), chaque element portant son propre `liste`/`index`
// -- ce fichier ne fait plus l'hypothese que la position dans le tableau
// EST l'index d'ecriture (vrai uniquement quand un seul tableau existait).
// Comportement inchange pour le RESTE de la logique (unique/selection/
// indisponible, toujours 'missions') : seule la PROVENANCE de index/liste
// change, jamais la regle metier.
function bilanResoudreChampExperience(experiences) {
  var liste = experiences || [];
  if (liste.length === 0) { return { type: 'indisponible' }; }
  // Defense en profondeur : si un appelant fournit un element sans son
  // propre `index` (ancien contrat, position dans le tableau = index),
  // retombe sur la position -- jamais un `undefined` silencieux.
  var destinationDe = function (item, position) {
    return { liste: item.liste || 'experiences', index: typeof item.index === 'number' ? item.index : position, champ: 'missions' };
  };
  if (liste.length === 1) { return { type: 'unique', destination: destinationDe(liste[0], 0) }; }
  return { type: 'selection', destinations: liste.map(destinationDe) };
}

if (typeof module !== 'undefined') {
  module.exports = {
    bilanResoudreChampExperience: bilanResoudreChampExperience
  };
}
