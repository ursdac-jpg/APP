# Questionnaire : textes d'ouverture, de fin de partie et de boutons (document de travail, à valider par Denis)

Créé le 16/11/2026, chantier « Comprendre les métiers » (voir `docs/CHANTIER_COMPRENDRE_LES_METIERS_2026-11-16.md`). **Rien n'est codé.** Tous les textes sont au vouvoiement, en phrases courtes, sans mot technique, sans mot « IA », sans « bravo ».

## Règles

1. **Une idée par phrase**, quatre à six lignes au plus par écran.
2. **Jamais de note, jamais de jugement** : aucune réponse n'est « bonne ».
3. **Dire clairement ce qui se passe** : durée, tout ou rien (rien n'est gardé si la personne quitte), pas de résultat avant la fin.
4. **Dire d'où viennent les lettres** : celles de France Travail pour chaque métier.
5. **Les lettres ne sont jamais affichées pendant les réponses.**

## 1. Écran d'accueil du questionnaire (avant la partie 1)

**Titre** : Découvrir mes préférences de métier

> Ce questionnaire vous aide à voir quels univers de métiers vous attirent.
>
> Il comporte quatre parties : des activités, des métiers, ce que vous savez faire aujourd'hui, et votre façon d'être.
>
> Il n'y a pas de bonne ou de mauvaise réponse. Ce n'est pas un examen.
>
> Prévoyez environ une demi-heure, dans un endroit calme. Les quatre parties se font d'une traite : si vous quittez avant la fin, vos réponses ne sont pas gardées, et vous reprendrez au début.
>
> Votre résultat n'apparaît qu'à la fin, pour qu'il ne change pas vos réponses en cours de route.

**Bouton** : Commencer

**Petit texte sous le bouton** : Les lettres du résultat sont celles que France Travail a données à chaque métier de son répertoire.

## 2. Partie 1 : les activités

**Titre** : Partie 1 sur 4 : ce qui vous plairait de faire

> Imaginez que vous n'avez aucune contrainte : ni argent, ni diplôme, ni distance. Pour chaque activité, dites si elle vous plairait.
>
> Si vous ne l'avez jamais essayée, « Je ne sais pas » est une bonne réponse.

**Question affichée** : Ça me plairait de : [activité]

**Réponses** : Ça me plairait · Ça ne me plairait pas · Je ne sais pas

**Bouton** : Commencer la partie 1

## 3. Partie 2 : les métiers

**Titre** : Partie 2 sur 4 : les domaines de métiers

> Chaque ligne décrit un domaine de métiers, avec quelques exemples. Ces exemples vont du métier accessible sans diplôme à celui qui demande de longues études.
>
> Pensez à l'activité, pas au niveau d'études ni à votre âge. Dites seulement si cette façon de travailler vous attire.
>
> Ce ne sont pas des métiers à choisir : c'est pour voir vers quoi vous avez envie d'aller.

**Question affichée** : Ça me plairait de : [intitulé de la ligne]

**Réponses** : Ça me plairait · Ça ne me plairait pas · Je ne sais pas

**Bouton** : Commencer la partie 2

## 4. Partie 3 : ce que vous savez faire

**Titre** : Partie 3 sur 4 : où vous en êtes aujourd'hui

> Pour chaque point, dites où vous en êtes aujourd'hui.
>
> Pensez à toute votre vie : à la maison, avec des amis, en association, en stage ou au travail. Tout compte, même ce que vous avez appris sans diplôme.
>
> « Pas encore » ne veut pas dire « jamais » : cela veut seulement dire que vous n'y êtes pas encore.

**Question affichée** : Où en êtes-vous pour : [aptitude] ?

**Réponses** : Pas encore · En progrès · À l'aise

**Bouton** : Commencer la partie 3

## 5. Partie 4 : votre façon d'être

**Titre** : Partie 4 sur 4 : votre façon d'être

> Cette dernière partie est à compléter : vous pouvez aussi la passer, et votre résultat sera calculé avec les trois autres parties.
>
> Pour chaque phrase, dites si elle vous ressemble en général. Il n'y a ni qualité ni défaut : chacun est différent.

**Question affichée** : Cette phrase vous ressemble-t-elle ? [phrase]

**Réponses** : Ça me ressemble · Un peu · Pas vraiment

**Boutons** : Commencer la partie 4 · Passer cette partie

## 6. Fin de partie (jamais de résultat)

**Après la partie 1** :

> Partie 1 terminée. Il en reste trois.
>
> Votre résultat apparaîtra à la fin des quatre parties.

**Bouton** : Partie suivante

**Après la partie 2** : « Partie 2 terminée. Il en reste deux. » (même texte)

**Après la partie 3** : « Partie 3 terminée. Il en reste une. » (même texte)

**Après la partie 4** :

> Les quatre parties sont terminées. Merci d'avoir pris ce temps.

**Bouton** : Voir mon résultat

**Si la partie 4 a été passée** :

> Vous avez passé la dernière partie : votre résultat sera calculé avec les trois autres.

**Bouton** : Voir mon résultat

## 7. Pendant les réponses

- **Avancement** : « Activité 12 sur 90 », « Métier 12 sur 90 », « Point 12 sur 60 », « Phrase 12 sur 60 ». Pas de barre de couleur qui évoque une note.
- **Bouton** : « Revenir à la réponse précédente », pour corriger sans perdre le reste de la partie.
- **Jamais de minuteur** : le temps de réflexion n'est pas compté.

## 8. Si la personne quitte avant la fin

**Fenêtre d'avertissement** (seul cas de fenêtre autorisé) :

> Si vous quittez maintenant, vos réponses ne seront pas gardées. Vous reprendrez au début.

**Boutons** : Continuer le questionnaire · Quitter

## 9. En tête de la page de résultat

> Voici ce que vos réponses montrent aujourd'hui.
>
> Ce n'est pas un diagnostic, ni une note : ce sont des directions qui vous attirent. Ce résultat peut changer, et vous pouvez le refaire plus tard.

À la suite : la phrase d'explication commune des barres (« Une préférence peu marquée n'est pas une note... »), les textes des trois lettres, puis le bouton « Garder mon résultat » (disquette).

## À vérifier avant le code

1. **Durée « environ une demi-heure »** : estimation à confirmer par un essai chronométré (Denis).
2. **Phrase sur la confidentialité** : vérifiée le 17/11/2026 dans le code (le suivi d'usage envoie seulement des noms d'événements, jamais le contenu des champs). Phrase proposée pour l'écran d'accueil, à valider par Denis : « Vos réponses restent sur cet appareil : personne ne les reçoit. Seul votre résultat peut être gardé, dans la disquette, si vous le décidez. » Elle n'est vraie que si le module n'envoie aucune réponse au suivi d'usage (test Node prévu). Détail : `docs/CATALOGUE_SIGLES_ET_EXPLICATIONS_2026-11-17.md`, section 3.
3. **Titre « Découvrir mes préférences de métier »** : proposition, à confirmer par Denis (le nom du questionnaire dans les trois entrées du module reste à fixer).
4. **Aide de la personne en difficulté de lecture** : un texte lu à voix haute est une piste (chantier accessibilité), pas prévu ici.
