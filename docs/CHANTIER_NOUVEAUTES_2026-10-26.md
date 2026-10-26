# Chantier « Nouveautés » : un bouton toujours visible et un historique (décisions de Denis, 26/10/2026)

Statut : **CODÉ ET VÉRIFIÉ le 26/10/2026** (maquette validée par Denis : `docs/MAQUETTE_NOUVEAUTES_2026-10-26.html`). Bouton `#btnNouveautes` (4e icône de la ligne du haut), page `nouveautes`, données `data/nouveautes.js` (7 premières lignes tirées de la liste partenaires), recherche de l'accueil, brique B.54. Pour ajouter une nouveauté : une ligne dans `data/nouveautes.js`. Reste : essai réel de Denis, et l'envoi sur GitHub pour que les partenaires la voient.

## Décisions
1. **Un bouton « Nouveautés » accessible et visible à tout moment** (pas seulement à la première visite, pas seulement pour les partenaires). Il reste affiché en continu.
2. **Les ajouts récents portent la marque « Nouveau »** (une étiquette sur chaque ligne récente, pendant une durée à fixer, par exemple 30 jours) : la personne voit d'un coup d'oeil ce qui vient d'arriver.
3. **Un historique de tout ce qui s'est passé**, daté en français, du plus récent au plus ancien, rangé par mois.
4. **Premier contenu** : le parcours et tout ce qui a été ajouté depuis la version précédente, tiré de `docs/NOUVEAUTES_POUR_LES_PARTENAIRES_2026-10-26.md` (la version détaillée). Les nouveautés suivantes se rédigent ensuite avec Denis, une ligne à chaque fois.
5. **Le courriel mensuel aux partenaires** est la copie de la liste du mois : un seul texte à écrire pour les deux usages.

## À trancher à la maquette
- Où mettre le bouton pour qu'il reste visible partout (accueil seulement, ou aussi dans l'en-tête de chaque page).
- Durée de l'étiquette « Nouveau ».
- Ne lister que ce qui est ouvert au public (jamais une fonction encore fermée, comme « Mon territoire »).

## Ce qui est prévu côté technique
- Un fichier de données, une ligne par nouveauté : date, titre court, une ou deux phrases simples, étiquette éventuelle, lien vers le module.
- Une page simple (modèle des pages existantes), recherche de l'accueil et mode sombre branchés dès la création.
- Visible pour les partenaires seulement après l'envoi sur GitHub.
