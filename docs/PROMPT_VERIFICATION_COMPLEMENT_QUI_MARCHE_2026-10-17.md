# Complément de prompt qui MARCHE pour faire vérifier une liste de pages sur les sites officiels (2026-10-17)

> Constaté par Denis le 2026-10-17 sur les agences d'intérim : avec ce complément, le second assistant traite toute la liste sans s'arrêter après quelques lignes et sans commentaires inutiles. **À réutiliser chaque fois qu'on fait vérifier des lignes** (agences d'intérim, pages de recrutement, structures, employeurs). On le colle **avant** la liste, à la place des consignes générales du prompt de vérification. Adapter seulement le mot « agences d'intérim » et le format de la réponse au contenu à vérifier.
> Réglage utile : lancer l'assistant avec l'outil « Recherche sur le Web » activé (le texte commence par `@Recherche sur le Web`).

```
@Recherche sur le Web

Je vais te donner une liste d'agences d'intérim.

Tu dois vérifier UNIQUEMENT sur les sites OFFICIELS des réseaux d'intérim.

Tu peux traiter autant d'agences que possible en une réponse, mais tu privilégies toujours la fiabilité plutôt que la quantité.

Pour chaque agence :

1. Ouvre le site officiel du réseau.
2. Ouvre la page officielle de CETTE agence (ou le localisateur officiel si la page agence n'existe pas).
3. Lis uniquement ce qui est affiché sur cette page.
4. N'utilise aucun annuaire, comparateur, France Travail, Indeed, PagesJaunes, etc.
5. N'invente jamais une information.
6. Si tu ne peux pas ouvrir la page officielle, indique "non vérifiable".
7. Si le réseau n'a plus cette agence, indique "fermée ou absente".
8. Si l'adresse ou le téléphone diffèrent, indique "corrigé" et remplace uniquement par les valeurs lues sur la page officielle.
9. Si tout correspond exactement, indique "confirmé".
10. Si tu constates que le téléphone ou l'adresse correspondent en réalité à une autre agence d'un autre réseau, indique-le dans la dernière colonne.

Réponds uniquement sous cette forme, une ligne par agence :

réseau | nom de l'agence | commune | code postal | adresse | téléphone | URL de la page officielle de cette agence | statut | ce que tu as lu

Ne fais aucun commentaire.

Si toutes les agences ne tiennent pas dans une réponse, continue automatiquement avec PARTIE 2, PARTIE 3, etc., jusqu'à avoir traité toute la liste.

Ne t'arrête jamais après quelques agences simplement parce qu'elles appartiennent à des réseaux différents. Continue jusqu'à la limite de la réponse.
```

## Pourquoi il marche (ce qui le distingue de nos premiers prompts)
- Il fixe une **règle de décision par cas** (non vérifiable, fermée ou absente, corrigé, confirmé) et une règle pour les numéros ou adresses empruntés à un autre réseau.
- Il **interdit nommément les annuaires et sites d'offres**, que l'assistant utilisait comme source.
- Il demande de **continuer en PARTIE 2, 3...** au lieu de s'arrêter, et de **ne faire aucun commentaire** (les commentaires mélangeaient excuses et résultats).
- Il garde la fiabilité avant la quantité : l'assistant dit « non vérifiable » au lieu de deviner.
