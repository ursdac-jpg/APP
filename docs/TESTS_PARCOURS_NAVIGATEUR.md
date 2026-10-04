# Essais de parcours rejouables (navigateur intégré)

Écrit le 2026-09-30. Outil de développement : **Claude le lance lui-même avant de livrer une correction**, pour que Denis n'ait plus à rejouer à la main les mêmes parcours.

## Lancer

Serveur de dev démarré (`site-v2-python-server`), page fraîchement rechargée, dans le navigateur intégré :

```js
eval(await (await fetch('/scripts/parcours/parcours_smoke.js')).text());
window.__fin = null; window.__parcours().then(r => window.__fin = r);   // ~40 s, attend seul que l'application soit chargée
// puis lire window.__fin : { ok, nbOk, nbEchecs, echecs, tout }
```

Un seul parcours : `window.__parcours(['bilan'])` (identifiants : `bilan`, `comparer`, `decouverte`, `prompts`).

## Ce qui est couvert (70 vérifications au 2026-09-30)

- **Bilan, écran « Préparer »** : plus de bloc « Relire et masquer », un texte collé ouvre la relecture, validation, annulation, CV de l'application non relu, CV déjà relu venant de Cohérence.
- **Comparer mes pistes** : les cinq envois (Collecter, Détection, Côte à côte affiné, Dans le temps, Aller plus loin) avec assistant simulé : choix, confirmation, « chez l'assistant », retour, collage, réponse invalide puis valide, « Retour » pas à pas, bouton Perplexity.
- **Découverte** : l'import applique les propositions et termine le parcours.
- **Prompts** : ligne directrice des 7 situations dans le profil (CV, lettre, entretien) et dans Reformuler ; fragment « voix humaine » chargé partout.

## Ce qui n'est PAS couvert (reste à un vrai essai)

Le vrai presse-papiers, la vraie ouverture de l'assistant, le contenu réel des réponses, le rendu à l'œil (CV, mode sombre), la vraie souris dans le grand aperçu.

## Règles

- Les parcours **modifient le dossier en cours** (données de test) : jamais sur une vraie session de Denis.
- **Un défaut corrigé = un essai ajouté** dans `scripts/parcours/parcours_smoke.js` (fonction `cas(nom, condition, détail)`), dans le même commit.
- Pour le rendu du CV, le banc `scripts/word/banc_b7.js` reste l'outil de non-régression (référence : `scripts/word/banc_b7_reference.json`).

## Banc de rendu du CV : un piège (2026-10-01)

Les empreintes **Word** du banc (`scripts/word/banc_b7.js`) dépendent de la **largeur de la fenêtre du navigateur intégré** : après un `resize_window`, ou si la fenêtre a changé de taille, tous les modèles changent côté Word alors que les empreintes PDF restent identiques. Toujours comparer **dans la même taille de fenêtre** ; en cas de doute, comparer le plan Word d'un modèle avant et après (`git stash`) sur une page neuve, avec la même suite d'actions (l'état d'un modèle précédent se propage sinon).

## Inventaire « bouton x modèle » du panneau « La mise en page » : rejoué le 2026-10-01

Rejoué sur 25 modèles, 2 259 réglages cliqués (`scripts/word/matrice_options.js`, ~100 minutes) : **0 erreur JavaScript**, taux de « dérive » identique à celui du 2026-09-29 (25 %, artefact de mesure : un deuxième clic ne remet pas toujours la page à l'octet près). 19 réglages cliquables sans effet trouvés, tous **grisés depuis** (`cvPdfOptionsParModele.js`) : « Blocs courts » sur les 12 modèles à deux colonnes propres, « Dates à la même place » sur 5 modèles qui placent eux-mêmes leurs dates, « Couleur du texte » et « Dégradé du bandeau » sur Sobre Rectangles. Résultat brut : `scripts/word/resultats_matrice/matrice_2026-10-01.json`.
Un inventaire fait APRÈS le grisage ne voit plus les réglages déjà grisés : le fichier de données ne se régénère donc plus depuis zéro, il se **fusionne** (`node scripts/word/matrice_fusion.js <nouveau.js>`).
Vérifiés aussi le même jour : retour au modèle de départ (7 modèles, revient à l'octet près), aller-retour sauvegarde puis restauration d'une session (4 modèles, identique), mode sombre (393 textes, 0 contraste insuffisant), largeur de téléphone (aucun débordement du panneau).
