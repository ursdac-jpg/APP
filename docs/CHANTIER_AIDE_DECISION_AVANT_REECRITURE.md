# Aide à la décision avant réécriture — document de conception

> Nom de travail volontairement provisoire, jamais « simulation » dans ce document ni ailleurs — ce mot suggère une fiabilité prédictive que le mécanisme ne peut pas tenir.

## 1. But

Répondre à une question précise que se posent de nombreuses personnes hésitantes après un diagnostic du Bilan de candidature : *« Si j'investis du temps à appliquer ces recommandations, est-ce que ça semble suffisamment prometteur pour que l'effort en vaille la peine ? »*

Une aide à la décision, jamais une prédiction du futur CV.

## 2. Principe de fonctionnement

1. Après le diagnostic, toutes les recommandations sont cochées par défaut.
2. La personne décoche librement celles qu'elle ne souhaite pas ou ne peut pas appliquer.
3. Elle déclenche une analyse hypothétique sur la sélection retenue.
4. L'IA raisonne en supposant les recommandations sélectionnées correctement appliquées, et produit un diagnostic hypothétique — mêmes axes, même vocabulaire qualitatif que le diagnostic réel — accompagné d'une courte explication des hypothèses de raisonnement retenues.

## 3. Ce que la fonctionnalité ne fait pas

- Ne modifie jamais le CV réel.
- Ne produit aucune réécriture ni aucun fragment de texte prêt à copier.
- Ne classe pas les recommandations entre elles — évalue uniquement l'ensemble sélectionné, comme un tout.
- Ne remplace jamais le parcours de correction existant ni le cycle Prompt 2.
- Ne modifie ni Prompt 1, ni Prompt 2, ni le contrat de données existant, ni aucun module déjà en place.

## 4. Principes de conception

- **La personne contrôle entièrement l'hypothèse testée.** Toutes les recommandations sont cochées par défaut, elle peut en décocher autant qu'elle le souhaite, et tester autant de combinaisons qu'elle le désire. ERIP ne suggère jamais la « meilleure combinaison » et ne décide jamais à sa place.
- **Le résultat est toujours présenté comme une hypothèse, jamais comme une prédiction.** Une aide à la réflexion, pas une garantie du résultat réel après réécriture.
- **Les hypothèses de raisonnement retenues par l'IA sont toujours visibles**, pour que la personne comprenne sur quoi repose le diagnostic.
- **Le diagnostic hypothétique ne modifie jamais le diagnostic réel ni le CV.**

## 5. Indépendance et réversibilité

**La contrainte de conception la plus importante : aucune régression, aucun impact sur l'existant.** Un module autonome et entièrement optionnel, qui se branche sur le Bilan de candidature sans modifier son fonctionnement actuel.

- Ne modifie jamais le diagnostic réel.
- Ne modifie jamais les recommandations existantes.
- Ne modifie jamais le CV.
- Ne modifie jamais le parcours de correction actuel.
- N'ajoute aucune dépendance sur les fonctions déjà en place — se branche sur l'existant, jamais l'inverse.
- Repose sur un prompt dédié et un état temporaire séparé, jamais mêlé à l'état existant.
- Retrait propre : le point d'entrée, le prompt et le rendu doivent pouvoir être retirés sans toucher au reste du module.

## 6. Prochaine étape

Un prototype réel : écrire le prompt, le tester via le cycle copier-coller ERIP sur un cas concret, avant toute construction d'écran.
