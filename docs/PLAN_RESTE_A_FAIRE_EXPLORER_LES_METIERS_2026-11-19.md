# Plan de ce qui reste à faire pour « Explorer les métiers » (écrit le 19/11/2026, consigne 485)

> Photo de départ : étape A (synthèse et lecture), étape B (« Mon parcours ») et les six vidéos du module sont codées et vérifiées. Le module est OUVERT au public depuis le 19/11/2026 (`CMV_OUVERT = true`, voir le paragraphe 4). Ce plan dit quoi faire, dans quel ordre, et ce qui revient à Denis. L'état vivant des chantiers reste `docs/ETAT_DES_CHANTIERS.md`.

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

## 4. Ouverture au public : FAITE le 19/11/2026 (consigne 486)

> Les quatre points ci-dessous ont été faits. Pour refermer le module : repasser `CMV_OUVERT` à `false`.

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

## 6. Mise à jour du 21/11/2026 : tout ce qui reste en attente, avec une recommandation par point (demande de Denis)

> Ce paragraphe réunit ce qui était dispersé dans `docs/ETAT_DES_CHANTIERS.md`, l'audit `docs/AUDIT_ATTEIGNABILITE_METIERS_EXPLORER_LES_METIERS_2026-11-21.md` et ce plan. Les modifications du 21/11/2026 (échelle de pistes, niveau du questionnaire, cartes enrichies) sont commitées en local ; elles n'arrivent en ligne que par l'envoi sur GitHub, demandé par Denis.

| # | Point en attente | Qui | Recommandation |
|---|---|---|---|
| 1 | Essais réels de l'échelle de pistes (chemins 1, 2 et 3) et des cartes enrichies (compétences et conditions) | Denis | À faire en premier : le module est ouvert au public. Un seul passage, dans cet ordre : chemin 2 avec six choix, chemin 1 avec un métier connu, questionnaire avec 100 lignes puis 250 lignes. Noter avec « note ça » ce qui surprend. |
| 2 | Essais réels des étapes A et B (« Ma synthèse », « Ma lecture », « Mon parcours »), de la disquette et de la recherche d'offres | Denis | Après le point 1, en une séance séparée : c'est long et ils servent aussi à valider le prompt (point 3). |
| 3 | Prompt `prompts/ma-synthese.md` en version 1 | Denis puis Claude | Se valide avec de vraies réponses collées pendant le point 2. Ajuster une consigne à la fois, jamais deux missions. |
| 4 | Textes à relire (`docs/TEXTES_EXPLORER_LES_METIERS_A_RELIRE_2026-11-17.md`, section 10 du chemin 4) et nom du quatrième chemin « Les emplois en demande » à confirmer (consigne 456) | Denis | Relire par petits paquets, nom du chemin tranché avant de refaire les vidéos. |
| 5 | Fiches à la main « Ouvrier agricole/viticole » et « Ouvrier de chai », niveau F1619 vers le 24/11/2026 | Denis | Prévu à cette date : le faire ce jour-là, pas avant (la source n'est pas à jour). |
| 6 | Métiers jumeaux : 5 fiches du chemin 1 qui partagent un code ROME (Arboriculteur, Agent de tri, Garde d'enfants à domicile, Agent de collecte des déchets, Agent polyvalent de collectivité) et 13 du chemin 2 (médecins spécialistes entre eux, métiers de banque entre eux) | Denis | Laisser en l'état : moins de 1 % des métiers, le voisin apparaît dans la même liste, et le chemin 2 ne peut pas les départager sans précision absente du catalogue. Y revenir seulement si les essais du point 1 tombent dessus. |
| 7 | Liste du chemin 1 trop courte après 3 clics (proposition 2 de l'audit : compléter par des métiers « un peu moins proches ») | Denis | Ne pas le faire : l'échelle de pistes dit déjà « Piste éloignée » ; compléter la liste ajouterait des pistes faibles. Revoir après le point 1. |
| 8 | Compétences des cartes encore imparfaites (feuille de 30 métiers : 11 Bon, 10 Acceptable, 9 À revoir ; la règle ajustée ramène les compétences trompeuses de 25 à 12, il en reste, par exemple « soins du corps et d'esthétique » pour l'aide-soignant) ; un métier sans signature ROME (Installateur mainteneur solaire) | Claude | Pas de correction à la main métier par métier (1 923 fiches). Regarder pendant le point 1 si cela gêne vraiment ; si oui, une petite liste d'écarts pour les 50 métiers les plus consultés. |
| 9 | Vidéos du module (six faites le 19/11/2026) : les écrans ont changé depuis (échelle, niveau, « Comment vos choix ont été lus », « À éviter », appellations, cartes enrichies) ; vidéo d'introduction générale reportée | Denis décide, Claude fabrique | Les refaire UNE fois, à la fin, après les points 1, 2 et 4 (`node fabriquer.js <nom>`, effort bas à moyen), jamais à chaque changement d'écran. |
| 10 | B5 « D'un métier à un autre » ; « Revoir ce que je n'ai pas su dire » ; étape C (personnalité) | Claude | B5 seulement après les essais de l'étape B (consigne 474) ; « Revoir ce que je n'ai pas su dire » plus tard, sans insistance ; étape C quand les modules de personnalité existent. |
| 11 | Générateur de la base ROME qui n'est plus aligné avec les fiches publiées (leçon 9.207 : le relancer réécrit les 14 fichiers `fiche_*.js` avec d'autres champs) | Claude | Séance courte d'éclaircissement (effort moyen), avant que quiconque relance le générateur ; en attendant, toujours comparer avant de garder. |
| 12 | « Essentiels » (juger la qualité des choix et pas seulement leur nombre) | Denis décide | Garder en réserve : à rouvrir seulement si les essais montrent des personnes qui choisissent surtout des choix très généraux (« nettoyer », « bureau »). |
| 13 | Chantiers voisins du plan d'ensemble : accessibilité, puis découpage de `js/app.js`, « Mieux me connaître » | Denis | Après la stabilisation du module (ordre déjà fixé : modules, stabilité, accessibilité, découpage). |

Ordre conseillé : 1, 2 (avec 3), 4, 5 le 24/11, puis 9, en regardant au passage 6, 7 et 8 ; 11 quand une séance courte se libère.
