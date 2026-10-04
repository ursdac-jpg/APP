# Lot « Comparer mes pistes » : C14, C15, C16 (plan du 2026-09-30, Mode A)

Sources : les retours de Denis notés dans `docs/CHANTIER_CORRECTIONS_PARCOURS_2026-09-30.md` (C14 à C16). Audit du code réel fait le 2026-09-30, aucun code modifié.

## Constats de l'audit (code réel)

1. **Réponse illisible (C14-a).** Les quatre analyseurs du module (`comparerParserDetection/Collecte/Frise/AllerPlusLoin`, `modules/comparer-pistes/index.js`) font un `JSON.parse` direct. L'application a déjà un extracteur **tolérant** partagé (`extraireBlocJSONDepuisTexte`, `js/app.js` ~31565 : antislashs parasites devant `_`, `[`, `]`, guillemets courbes, retours à la ligne dans les valeurs, virgules en trop) que ce module **n'utilise pas**. Les antislashs de la réponse de Denis feraient donc échouer la lecture. Le « null » écrit en texte est déjà toléré. Les étiquettes de sources collées dans les phrases (« Onisep », « France Travail+1 ») ne cassent pas la lecture mais salissent les textes affichés.
2. **Barre en double (C14-b/c).** Chaque écran dessine sa propre ligne « Retour / Continuer » dans la page, **en plus** de la barre du bas de l'application. Le « Retour » de la barre du bas appelle `comparerRetour()`, qui renvoie à la présentation puis à l'accueil (correctif de boucle infinie du 2026-09-09, à ne pas défaire). Le module sait déjà revenir à l'écran précédent (`_ecranPrecedent`), mais seulement avec son bouton dans la page.
3. **« Accueil » décentré (C14-d).** Cause dans le composant partagé `barreNavigation()` (`js/app.js` ~4383) : trois éléments en `justify-content: space-between`. Quand « Retour » et « Continuer » n'ont pas la même largeur, « Accueil » n'est pas au milieu. Le défaut existe donc **partout** dans l'application.
4. **Deux angles, un prompt par angle (C16).** « Les critères » de Denis sont les **deux angles de comparaison** : « côte à côte » (prompt `comparer-meme-categorie.md`) et « dans le temps » (`comparer-situations.md`). Les informations viennent d'un troisième prompt, `comparer-collecte.md` (avec recherche en ligne). Un quatrième, `comparer-aller-plus-loin.md`, est facultatif. Le cas « Mixte » enchaîne déjà les deux angles l'un après l'autre.
5. **Envoi et retour de l'assistant (C14-e).** Le module affiche le prompt (`<pre class="cp-prompt">`) avec un bouton « Copier le texte », et n'utilise pas le choix d'assistant commun. Ses cinq zones de collage utilisent l'**ancien rendu** du composant partagé (dette B.17).
6. **Boutons (C15-a).** Le module utilise `btn-sm` presque partout (45 boutons) ; les boutons du reste de l'application ont été agrandis.

## Solutions étudiées

- **« Tout regarder ensemble » (C16)** : (A) proposer « Les deux angles, l'un après l'autre » en réutilisant l'enchaînement qui existe déjà : aucun nouveau prompt, aucun nouvel analyseur, risque faible. (B) créer un prompt unique qui fait les deux angles : nouveau prompt, nouvel analyseur, nouvel écran de résultat, à retester sur toutes les combinaisons : lourd et risqué. **Recommandation : A.**
- **« Plus de critères » (C16)** : les informations déjà collectées contiennent bien plus que deux dimensions (durée, périodes en entreprise, financeurs, lieux, rémunération, tension du recrutement, conditions, revenu de remplacement). Plutôt que d'ajouter des prompts, proposer à la personne de **choisir les lignes qu'elle veut comparer** dans le tableau côte à côte. Aucun nouvel appel à l'assistant. **Recommandation : cette solution.**
- **Barre du bas (C14-c)** : « Retour » = écran précédent du module (`_ecranPrecedent`), et depuis le premier écran, comportement actuel conservé (présentation, puis accueil). « Continuer » dans la barre via l'option `suivant` de `barreNavigation`, activé ou grisé comme aujourd'hui.
- **« Accueil » centré (C14-d)** : passer `barreNavigation()` en trois colonnes (`1fr auto 1fr`) : un seul changement pour toutes les pages. Vérifié à faire : clair et sombre, largeur téléphone, pages avec et sans « Continuer ».
- **Lecture des réponses (C14-a)** : brancher les quatre analyseurs sur l'extracteur tolérant partagé, garder l'ancien comportement en dernier recours, nettoyer les étiquettes de sources en fin de phrase, et ajouter au prompt de collecte la consigne « aucune étiquette de source dans les textes ». Test avec la vraie réponse de Denis (CAP plomberie et CAP électricité).

## Plan en trois lots

### Lot A : `medium`, reprise de l'existant, risque faible
- [ ] A1. C14-a : analyseurs sur l'extracteur tolérant + nettoyage des étiquettes de sources + consigne dans `comparer-collecte.md` + tests avec la réponse réelle de Denis.
- [ ] A2. C14-b et C14-c : retirer la ligne Retour/Continuer de la page ; « Retour » (écran précédent) et « Continuer » dans la barre du bas.
- [ ] A3. C14-d : « Accueil » centré dans `barreNavigation()` (toutes les pages), vérification clair, sombre, téléphone.
- [ ] A4. C15-a : boutons du module à la taille des boutons du reste de l'application.
- [ ] A5. C15-b : rectangles ouverts à l'arrivée sauf celui à l'ampoule.

### Lot B : `high`, décisions de Denis nécessaires
- [ ] B1. C16 : rectangle « Voici comment on vous propose de regarder » : texte, taille, boutons de choix, option « Les deux angles, l'un après l'autre », choix des lignes à comparer.
- [ ] B2. C14-e sur l'écran de collecte (celui qui a servi) : choix de l'assistant commun (Perplexity recommandé pour la collecte, seule étape qui demande la recherche en ligne), prompt copié sans être affiché, étape « Coller la réponse » commune.
- [ ] B3. C14-e sur les autres écrans (détection, côte à côte, dans le temps, aller plus loin), un par un, un commit chacun.

### Lot C : test réel par Denis et relecture `high` des lots A et B.

## Verdict Mode Nuit
**NON APTE** : les décisions du lot B (critères, lignes à comparer, écran par écran) ne sont pas tranchées. Le lot A est apte à être fait en une passe.

## Lot B : fait le 2026-09-30 (feu vert de Denis, avec mes recommandations D1 à D5)

- [x] **B1 / C16, rectangle des angles** `e0e912dc` : titre « Voici comment on vous propose de regarder vos pistes », texte plus grand, la phrase « Pas d'accord avec ce découpage ? » est remplacée par « Vous préférez regarder autrement ? » avec de vrais boutons : « Tout regarder dans le temps », « Voir d'abord seulement les métiers », **« Les deux angles, l'un après l'autre »** (réutilise l'enchaînement « mixte » déjà prévu, aucun nouveau prompt, proposé dès deux métiers ou formations), « Revenir à la proposition ». Vérifié dans le navigateur.
- [x] **B1 / C16, plus de critères** : sur l'écran « côte à côte », une zone **« Ce que je compare »** : une case par ligne pour laquelle des informations ont été trouvées. Les cinq lignes habituelles sont cochées d'office (rien ne change par défaut) ; six lignes de plus sont proposées : rémunération après quelques années, besoins de recrutement, financeurs possibles, où c'est proposé, conditions du dispositif, revenu pendant la transition. Aucune nouvelle recherche : les informations sont déjà collectées. Vérifié : cocher ajoute, décocher retire.
- [x] **B2 / C14-e, écran « Collecter les informations »** : le texte n'est plus affiché et le bouton « Copier le texte » disparaît. Parcours commun : (1) choix de l'assistant avec le composant partagé (nouvelle ligne facultative « recommandé pour cette étape » : **Perplexity**, avec rappel de mettre la recherche web en marche pour les autres) ; (2) la fenêtre de confirmation habituelle, le texte est copié automatiquement ; (3) « Chez l'assistant » (décompte, onglet, « Je suis de retour ») ; (4) « De retour : collez la réponse » avec le bloc commun du Bilan. « Retour » de la barre du bas recule d'abord d'une étape de l'envoi. « Je n'ai pas d'assistant en ligne » est conservé. Vérifié : chaque étape, import vide, import illisible (message), import correct, retours.
- [ ] **B3 : les autres écrans à prompt** (détection, côte à côte affiné, dans le temps, aller plus loin) affichent encore leur texte et l'ancien collage. À traiter un par un, un commit chacun, sur demande de Denis. Dette B.17 de `docs/BRIQUES_COMMUNES.md` : il n'en reste que ces quatre pour ce module.
