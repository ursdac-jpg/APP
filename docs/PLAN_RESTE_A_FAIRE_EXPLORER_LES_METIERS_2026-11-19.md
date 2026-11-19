# Plan de ce qui reste à faire pour « Explorer les métiers » (écrit le 19/11/2026, consigne 485)

> Photo de départ : étape A (synthèse et lecture), étape B (« Mon parcours ») et les six vidéos du module sont codées et vérifiées. Le module est toujours fermé au public (`CMV_OUVERT = false`, ouvert seulement sur `localhost`). Ce plan dit quoi faire, dans quel ordre, et ce qui revient à Denis. L'état vivant des chantiers reste `docs/ETAT_DES_CHANTIERS.md`.

## 1. Les essais réels de Denis (rien d'autre ne peut les remplacer)

À faire par Denis, sur le site local, avec de vraies saisies. Je note ce qui est à regarder, pas des résultats attendus.

- **Étape A, « Ma synthèse » et « Ma lecture »** : faire un passage (au moins le passage 1 avec un métier retenu), ouvrir « Ma synthèse », demander la lecture à l'assistant en ligne de son choix, coller la réponse, lire les neuf parties de « Ma lecture ». Regarder surtout : la demande est-elle lisible avant d'être envoyée ? la lecture dit-elle d'où vient chaque piste (résultats, ajustée, nouvelle) ? aucun ton de verdict ?
- **Étape B, « Mon parcours »** : ajouter un ou deux métiers vraiment exercés, cocher ce qui a été pratiqué, ajouter une compétence que la fiche ne cite pas, essayer « Autre expérience ». Regarder : les noms des rubriques (« Mes savoir-faire », « Mes qualités professionnelles », « Mes connaissances ») conviennent-ils ? les chiffres « déjà pratiquées », « à construire » sont-ils compris sans explication ?
- **Disquette** : garder la synthèse (parcours compris), recharger la page, importer le fichier, vérifier que tout revient.
- **Chercher des offres** (depuis « Ma lecture » et depuis « Les emplois en demande ») : le nouvel agencement en deux rubriques et en tuiles, les vidéos de gestes qui se déplient à côté de la demande.
- **Les six vidéos** : une fois par vidéo, le son, les sous-titres, le rythme, l'exactitude de ce qui est dit.

Ce que Denis note pendant ces essais : dans le chat, avec « note ça » ; je l'inscris au registre (`docs/CONSIGNES_DE_DENIS_A_SUIVRE.md`) avant de coder, comme d'habitude.

## 2. Validation du prompt de lecture

- `prompts/ma-synthese.md` est en **version 1 à valider aux essais réels** (plan de l'étape A). À partir des vraies réponses des assistants collées pendant les essais : repérer les dérives (note déguisée, diagnostic, piste inventée, conseil « parlez-en à un conseiller » seul), puis ajuster le prompt une consigne à la fois (règle : une consigne à appliquer, jamais à commenter).
- Un seul passage à la fois, jamais deux missions dans un prompt (leçon sur `bilan-v1.md`).

## 3. Tâches de code restantes, dans l'ordre

| # | Tâche | Effort | Condition |
|---|---|---|---|
| 1 | Corrections issues des essais de Denis (A et B) | à chiffrer après les essais | essais faits |
| 2 | **B5** : raccourci « D'un métier à un autre » (une carte sur l'accueil du module qui ouvre le bloc « Mon parcours » puis la demande, sans les trois passages) | moyen | seulement après les essais de l'étape B (consigne 474) |
| 3 | **Étape C** : personnalité (Big Five, exercices du bilan de compétences) | haut | quand ces modules existent ; la clé `tests` de la disquette est prête à les accueillir |
| 4 | « Revoir ce que je n'ai pas su dire » en fin de questionnaire (consigne 468) | bas | à tester plus tard, sans aucune insistance |
| 5 | Mise à jour des vidéos si un écran change après les essais | bas à moyen | une vidéo = un scénario rejouable (`docs/video_presentation/court/scenarios/`), `node fabriquer.js <nom>` |

## 4. Ouverture au public (dernière étape, décision de Denis)

Rien n'est fait tant que Denis n'a pas dit « on ouvre ». Quand il le dit :

1. Passer `CMV_OUVERT` à `true` (`modules/comprendre-les-metiers/index.js`, une seule ligne : c'est l'interrupteur unique).
2. Ajouter, dans le même commit, la ligne de `data/nouveautes.js` (date système réelle, titre court, une ou deux phrases simples, `route`, `icone`, `module`, `carte` = la carte « Vous hésitez encore ? »).
3. `npm test`, `node scripts/checkLexique.js`, contrôle au navigateur sur une adresse qui n'est pas `localhost` (la tuile du module doit apparaître sans l'exception locale).
4. Envoi sur GitHub (voie « mets-le sur Git »), en sachant que le garde-fou de l'outil de veille refuse seulement un envoi qui OUVRIRAIT un module fermé en ligne : vérifier l'état en ligne avant.

## 5. Points de vigilance connus

- **Vidéo d'introduction générale** : volontairement reportée (consigne 484) ; elle viendra avec le bouton « Introduction », après l'autre module en conception.
- **K1306** : devenu alias de la fiche « aes » (consigne 483). Si le paquet CSV du ROME est un jour disponible, relancer le générateur doit donner le même résultat (leçon 9.200).
- **Les vidéos de gestes réutilisées** (ChatGPT, Perplexity, coller la réponse, disquette) montrent des écrans de sites tiers qui peuvent changer : les refaire si un de ces sites change (leçon 9.129).
- **Compteurs de l'étape B** : plafonds de la demande 10 / 4 / 6 par métier avec un budget total de 2 800 signes ; ne pas les relever sans retester la taille totale de la demande (plafond 12 000).
- **Modules voisins** : la maintenance de la veille et de la prospection reste hors de ce plan.
