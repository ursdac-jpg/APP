# Lien à préparer entre « Mieux se comprendre » et « Ma synthèse » d'Explorer les métiers

> Noté le 22/11/2026 sur demande de Denis (consigne 526). **Rien n'est codé** : le format de sortie du futur module « Mieux se comprendre » (une fiche, un résumé, un export, autre) n'est pas encore connu. Ce document dit ce qu'il faudra faire le jour où il le sera.

## Ce que Denis veut
Le résultat de « Mieux se comprendre » devra être **reçu par l'assistant de Ma synthèse**, au même titre que les trois passages d'Explorer les métiers, le parcours professionnel, la situation et les mots libres. La personne n'aura rien à recopier : le résultat s'ajoute à la demande, et la lecture peut le croiser avec le reste.

## Précisions de Denis du 22/11/2026 (consigne 528)
- **Personnalité et valeurs de la personne** viendront de « Mieux se comprendre » et devront être **mises en lien** avec le métier, le secteur et leurs valeurs : coïncident-elles ou non ? La lecture ne doit donc **pas être limitée** : ni en longueur de réponse (déjà retirée : l'application garde tout ce que l'assistant écrit, et le prompt n'impose plus de limite), ni en profondeur d'interprétation.
- **Réponse en deux messages** (consigne 531) : le test réel a montré le point critique, la réponse est maintenant l'essentiel puis « suite » (prompt version 3). Une personnalité et des valeurs en plus risquent d'allonger encore : prévoir où elles se logent (premier message : lien avec les valeurs ; deuxième : détail) sans dépasser la taille d'un message.
- **Réserve de faisabilité (à dire à Denis)** : l'application ne contient aujourd'hui aucune donnée structurée sur les **valeurs d'un métier ou d'un secteur** (ni dans `data/metiers.js` ni dans `data/secteurs.js`, vérifié). Le lien « valeurs de la personne / valeurs du métier » ne pourrait donc reposer, au départ, que sur ce que l'assistant en sait de façon générale, donc sur une source non vérifiée par le code. Soit on ajoute un jour des repères de valeurs par métier ou secteur (travail de contenu important, à décider), soit la lecture formule seulement des hypothèses prudentes à vérifier avec un professionnel.
- **Taille de la demande** : la demande envoyée à l'assistant est plafonnée à 22 000 signes (20 000 avant la consigne 535, 16 000 avant la consigne 529). Une fiche de personnalité et de valeurs s'y ajoutera : mesurer, puis rouvrir ce plafond (le prompt seul en prend environ 9 400).

## Pourquoi on ne le prépare pas aujourd'hui
Sans le format de sortie, tout ajout serait deviné : une ligne de prompt qui attend un contenu inconnu, ou une section vide dans la demande, risquerait de faire inventer l'assistant. On attend donc le module.

## À faire le jour où le format est connu (dans l'ordre)
1. **Choisir la forme du résultat** à transmettre (texte court de quelques lignes plutôt que tout le détail) et son budget en signes : la demande tient aujourd'hui en 16 000 signes (`SYN_PLAFONDS.demande`, `syntheseLogique.js`), dont environ 9 400 pour le prompt seul. Prévoir une section retirable en dernier recours, jamais la première coupée.
2. **Lire le résultat** dans l'état du module et l'ajouter dans `synDonneesPourLecture` (`syntheseLecture.js`), comme `d.parcours` ou `d.situation` (une clé `d.comprendre`, par exemple).
3. **Écrire sa section** dans `_synlSections` (`syntheseLectureLogique.js`), avec le même modèle que les autres : « NON FAIT, ne devinez rien » quand le module n'a pas été fait, aucun nom, seulement ce qui est utile.
4. **Ajouter une ligne dans le prompt** `prompts/ma-synthese.md` (version 4) : ce que ce résultat veut dire, comment s'en servir (croiser avec les passages, dire ce qui diffère), et la précaution habituelle (jamais un diagnostic, jamais une note, une perception de soi n'est pas une preuve). Adapter aussi la phrase « trois outils » du rôle et le champ `passages` du bloc de réponse.
5. **Décider si c'est un quatrième « passage »** de la page de synthèse (pastille Fait, bouton « Retenir » sans objet ici) ou un bloc à part ; le compte `synNombreSources` et l'invitation « faire les trois passages » en dépendent.
6. **Reprendre le résultat ailleurs** : la feuille imprimée (`syntheseFeuille.js`), la page « Ma lecture » (`syntheseLecture.js`), la disquette (`synPourFichier`, `syntheseLogique.js`, avec l'accord de la personne) et la recherche de l'accueil.
7. **Tests** (`tests/syntheseLecture.test.js`), contrôle dans l'application, vidéo « Ma synthèse » à refaire si un écran change, ligne dans le journal.

## Règle de passation
Quand le chantier « Mieux se comprendre » définit son export, il doit renvoyer à ce document (même commit) et dire : où est stocké le résultat, sous quelle forme, quel texte court de lui part vers l'assistant. Leçon 9.210 : un champ ajouté à un module n'arrive pas tout seul dans la synthèse.

## FAIT le 22/11/2026 (consigne 565, chantier `docs/CHANTIER_LIEN_CE_QUI_COMPTE_ET_MA_SYNTHESE_2026-11-22.md`)
Le format de sortie est connu : les cartes gardées de « Ce qui compte pour moi ». Côté code, le lien est fait et vérifié au navigateur (espace et Explorer toujours fermés au public) : section « CE QUI COMPTE POUR LA PERSONNE » de la demande, cases de l'écran d'envoi, bloc de la page de synthèse, aide guidée. Restent, à la décision de Denis : le **prompt** `prompts/ma-synthese.md` (étape 4 ci-dessus, à lui seul, consigne 532), la feuille imprimée (non touchée : ses neuf rubriques seraient à renuméroter), la page « Ma lecture », la recherche de l'accueil, la vidéo de Ma synthèse si un écran change.
