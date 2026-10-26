# Journal des changements visibles (trace brute, à condenser ensuite en « Nouveautés »)

**Pourquoi ce fichier** : dès qu'un module reçoit une amélioration, un ajout ou une nouvelle fonction que les personnes verront, on note UNE ligne ici, tout de suite, dans le même commit. On n'écrit pas le détail : on garde une trace. Plus tard, les lignes d'un même module se condensent en une ligne de `data/nouveautes.js` (la page « Nouveautés » de l'application), en quelques mots.

**Lien avec les Nouveautés** : ce journal est la matière brute ; `data/nouveautes.js` est la version propre, lue par les personnes. Rien n'est affiché au public tant que ce n'est pas passé dans `data/nouveautes.js`.

## Format d'une ligne (une ligne par changement, la plus récente en haut)
`AAAA-MM-JJ | module | ce qui change, en une phrase simple | à condenser` (remplacer « à condenser » par « fait le AAAA-MM-JJ » une fois passé dans les Nouveautés ; « interne » si les personnes ne le verront pas ; « fermé » si le module n'est pas ouvert au public)

## À faire au moment de condenser (une fois par mois, avant le courriel aux partenaires, ou quand Denis le demande)
1. Regrouper les lignes « à condenser » par module.
2. Pour chaque module : une ligne dans `data/nouveautes.js` (titre court, une ou deux phrases, route), en français simple, sans jargon ni correctif, jamais une fonction fermée au public.
3. Marquer les lignes du journal « fait le ... ».
4. `npm test` (le test des nouveautés contrôle les routes et les tirets longs), puis envoi sur GitHub à la demande de Denis.

## Journal
2026-10-26 | Nouveautés | bouton toujours visible (4e icône), pastille, page d'historique par mois, étiquette « Nouveau » | fait le 2026-10-26
2026-10-26 | Reprendre mon CV | voie 3 « le refaire moi-même dans un modèle », sans assistant, mode fidèle, titres d'origine repris | fait le 2026-10-26
2026-10-26 | Entretien | fiche rapide enrichie, entraînement complet qui joue le recruteur et complète la fiche | fait le 2026-10-26
2026-10-26 | Créer un nouveau CV | « Vos appuis » (lettres de recommandation) n'est plus proposé en création à la main, sans assistant | à condenser
