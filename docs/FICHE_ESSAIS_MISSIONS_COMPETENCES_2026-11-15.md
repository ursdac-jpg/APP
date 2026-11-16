# Fiche d'essais : « Vos missions et compétences » (15/11/2026)

Pour Denis. Objectif : voir une vraie réponse d'un assistant en ligne avec le chemin (a), et vérifier les quatre parcours avant d'ouvrir le module au public. Chaque essai se note en trois mots : **OK**, **Bizarre** (à me décrire) ou **Bloqué**.

## 0. Préparer (une fois)

1. Ouvrez l'application sur le serveur de test (port 8123), page d'accueil.
2. Ouvrez la console du navigateur (touche F12, onglet « Console »), collez cette ligne puis Entrée :

```
MC_OUVERT = true
```

3. Attention : un rechargement de la page (F5) referme le module. Si vous rechargez, recollez la ligne.
4. Rien n'est modifié dans le dépôt : c'est seulement dans votre fenêtre.
5. Préparez un faux CV simple (2 expériences dont un métier de soin ou de vente, avec une ligne de mission très longue, et deux lignes qui disent presque la même chose dans une des expériences).

## Essai 1 : Créer avec assistant, chemin (a) (le plus important)

1. « Créer un nouveau CV », parcours avec assistant. La barre doit montrer 6 repères dont « Vos missions et compétences » entre « Votre parcours » et « Votre profil ».
2. Dans cette étape, pour chaque expérience : cochez 3 à 4 missions de la fiche du métier, ajoutez une mission écrite par vous (avec une très longue phrase pour une expérience), cochez 2 compétences.
3. À l'étape « Assistant », copiez le message avec le bouton de copie, collez-le dans ChatGPT (ou autre).
4. **À regarder dans le message copié** : il doit contenir une section « CHOIX DE LA PERSONNE » à la fin, avec vos lignes. Notez si elle est absente.
5. **À regarder dans la réponse de l'assistant** :
   - vos lignes sont-elles recopiées mot pour mot, dans le même ordre ?
   - 0 à 3 missions en plus seulement, sans rien d'inventé ?
   - la réponse est-elle un seul bloc de données (pas de texte autour) ?
6. Collez la réponse dans l'application (« Coller la réponse »).
7. Allez dans « La mise en page » (Vos documents), carte « Expériences » :
   - le bloc « Doublons de sens » apparaît-il pour vos deux lignes proches ? Les trois boutons (Garder les deux, seulement la première, seulement la seconde) changent-ils bien l'aperçu ? « Revenir en arrière » fonctionne-t-il ?
   - « Utiliser cette version » (version plus courte) change-t-il la ligne dans l'aperçu, et la phrase d'origine reste-t-elle visible dans la carte ?
   - carte « Compétences » : le bloc « Propositions de l'assistant en plus » avec « Pourquoi » ; cocher ajoute au CV, décocher retire ?
8. Si un bloc manque, copiez-moi la réponse de l'assistant : c'est probablement lui qui n'a pas renvoyé le champ.

## Essai 2 : Créer sans assistant

1. « Créer un nouveau CV », option « à la main, sans assistant ». Barre à 5 repères, avec « Vos missions et compétences ».
2. Même choix de missions et de compétences que l'essai 1.
3. Vos documents : le CV porte-t-il exactement vos missions (une par ligne) et vos compétences ?
4. Attendu : aucun bloc de compléments de l'assistant (normal).

## Essai 3 : Reprendre, voie 1 « Le garder et le compléter » (point à confirmer)

1. Importez un CV existant, voie 1, avec l'assistant jusqu'à la réponse.
2. Dans « Corriger mon CV », ouvrez une expérience : le bouton « Compléter avec la fiche du métier » apparaît (seulement si une fiche proche existe).
3. Ajoutez une mission de la fiche, validez.
4. **Question à trancher** : cette mission figure-t-elle bien dans le CV final, et n'est-elle pas écrasée par la réponse de l'assistant ?
5. Attendu : pas de doublons de sens ni de versions courtes ici (l'assistant a répondu avant votre choix). Dites-moi si vous le regrettez.

## Essai 4 : Reprendre, voie 3 « Le refaire moi-même »

1. Déposez un CV, voie 3. Page « Vérifier mes fiches » : bouton « Compléter avec la fiche du métier » sur chaque expérience.
2. Cochez des missions, puis retirez-en une : vos propres lignes ne bougent jamais.
3. Vérifiez le CV final. (Les savoirs ne sont pas proposés : limite connue.)

## Essai 5 : Voie 2 « Le reformuler et le présenter »

1. Aucun bouton « fiche du métier » ne doit apparaître. Attendu : rien de nouveau.

## Essai 6 : Le récit après des choix (cas non testé)

1. Dans la même session, faites l'essai 1 jusqu'à l'étape missions (avec des choix), SANS « Recommencer ».
2. Lancez « Créer mon CV à partir de mon récit » et allez jusqu'au CV.
3. Au moment de copier le message du CV : contient-il une section « CHOIX DE LA PERSONNE » ? **Attendu : non.** Si oui, notez-le : c'est un défaut à corriger.
4. Refaites le récit seul, après « Recommencer » : le comportement doit être celui d'avant.

## Essai 7 : Sans le module (contrôle)

1. Rechargez la page (F5), sans la ligne de la console. Créer un CV : l'étape « Vos missions et compétences » ne doit pas apparaître, le parcours est celui d'avant.

## Ce que vous me rapportez

Pour chaque essai : OK, Bizarre ou Bloqué, une phrase, et pour l'essai 1 la réponse brute de l'assistant si un champ manque. Pensez aussi à regarder le mode sombre et un écran de téléphone (fenêtre étroite) sur l'étape et sur les blocs de « La mise en page ».

## Après les essais

Relecture des phrases raccourcies (`docs/RELECTURE_LOT8_PHRASES_2026-11-14.md`), contrôle des vidéos de présentation, puis votre signal pour passer `MC_OUVERT` à `true` et ajouter la ligne « Nouveautés ».
