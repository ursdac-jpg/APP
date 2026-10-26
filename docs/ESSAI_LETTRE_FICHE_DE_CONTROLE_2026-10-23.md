# Fiche de contrôle de l'essai : lettre avec l'assistant (23 octobre 2026)

À utiliser avec `docs/ESSAI_LETTRE_MESSAGE_A_COLLER_2026-10-23.txt`. Avant : compléter les trois lignes `A COMPLETER` (site, offre, entreprise). Coller tout le contenu du fichier en un seul message dans une nouvelle conversation.

## Essai A : sans abonnement (écrit seulement)

- [ ] Le message passe en un seul collage (pas de coupure, pas de refus pour taille).
- [ ] L'assistant ne redemande pas le CV.
- [ ] Avant la première question, il rappelle les choix du profil (offre, poste, structure, langage, ton, longueur, niveau du poste, adaptation) sans inventer, sans CV ni coordonnées, et dit comment il va écrire.
- [ ] Il cherche les valeurs de l'entreprise (si le site ou l'offre est fourni) et les rapproche du parcours ; sinon il dit qu'il ne peut pas ouvrir le lien et demande le texte de l'offre.
- [ ] Chaque question est écrite en italique, seule sur sa ligne, une seule par message ; le reste du message est en texte normal.
- [ ] Sous chaque question : l'invitation avec **je veux bien** en gras, en texte normal (« (pour en recevoir, répondez : je veux bien) »).
- [ ] En répondant « je veux bien » : la phrase d'introduction, puis 5 suggestions numérotées, classées de la plus à la moins pertinente.
- [ ] Il propose un paragraphe à la fois et attend ton accord.
- [ ] Le texte sonne humain (mots simples, pas de formules d'assistant, des faits concrets de ton CV).
- [ ] À la fin : la lettre complète et le bloc JSON à copier, avec la consigne de revenir sur l'application.

## Essai B : avec abonnement et voix

Coller le message par écrit, puis lancer la voix depuis la même conversation.

- [ ] La voix a bien le message en mémoire (elle ne repart pas de zéro).
- [ ] Le rappel des choix se dit en deux ou trois phrases, pas en liste.
- [ ] Une seule question à la fois ; tes réponses orales sont comprises, ses messages restent simples.
- [ ] Tu dis « je veux bien » : les 5 suggestions sont dites une par une, avec leur numéro, en annonçant qu'elles sont classées.
- [ ] Chaque paragraphe proposé est lu, puis il demande ce que tu gardes.
- [ ] La lettre finale et le bloc à copier ne sont pas lus : ils s'écrivent à l'écran (ou il demande de repasser en mode écrit).

## Cohérence offre / pas d'offre

Le profil d'essai est une **candidature spontanée** (aucune offre). Pour tester la règle de cohérence, refaire l'essai avec ces deux variantes du début du profil :
- [ ] **« Offre » sans offre** : remplacer par `- Objectif : offre` et supprimer les lignes « Démarche » et « Offre visée ». Attendu : l'assistant n'invente aucune offre, traite la lettre comme une candidature spontanée et le dit dans le rappel des choix.
- [ ] **Offre réelle** : `- Objectif : offre` et ajouter la ligne `- Offre visée (lien ou texte) : ` suivie du texte d'une vraie offre. Attendu : le VOUS repose sur les exigences de l'offre.
- [ ] **Ni offre, ni entreprise, ni site** : supprimer ces lignes. Attendu : candidature générale, « Madame, Monsieur, », question sur ce qui attire dans le secteur, aucune prétention à connaître l'entreprise.

## Variantes à refaire une fois chacune (écrit)

Dans le profil d'essai, changer les lignes « Objectif » et « Type de structure visée » : candidature spontanée, stage, immersion, formation ; association, mairie, artisan. Vérifier que les questions et le style suivent, et que la lettre change vraiment.

## À noter pour chaque essai

Assistant utilisé, avec ou sans compte, ce qui a marché, ce qui a dérapé (phrase exacte si possible).
