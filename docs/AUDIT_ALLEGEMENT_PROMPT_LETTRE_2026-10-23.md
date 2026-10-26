# Audit d'allègement du prompt de la lettre (23 octobre 2026)

Demande de Denis : nettoyer le prompt sans changer son comportement (répétitions, contradictions, inutilités, fusions), alléger en déplaçant des consignes vers le JavaScript, protéger les prompts. Audit fait sur `docs/PROMPT_LETTRE_COMPACT_2026-10-23.md` (51 430 caractères, 222 règles contrôlées par `scripts/lettreInventaire/verifier.js`). Le prompt actuellement en production (`prompts/lettre-co.md`) fait 20 950 caractères : le nouveau fait deux fois et demie la taille.

## 1. Constat chiffré

| Section | Caractères |
|---|---|
| 5. Les questions | 11 869 |
| 7. Écrire la lettre | 9 038 |
| 3. Ce que les choix de la personne changent | 7 649 |
| 10. Fin de séance et format de sortie | 4 298 |
| 8. Contrôle avant de livrer | 3 323 |
| 4. Les valeurs de l'entreprise | 2 500 |
| 6. Les suggestions | 2 292 |
| 2. Début de séance | 2 448 |
| 1. Ce que tu reçois | 1 876 |
| 9. Voix | 1 420 |
| Règles absolues, e-mail, rappel, ouverture | 3 280 |

Le mot « jamais » apparaît 79 fois, « recommandation » 22 fois, « numérot » 24 fois. Les essais montrent que la lettre se raccourcit à mesure que les consignes s'accumulent (276, 262, 300 mots retenus pour une cible de 330 à 420) : c'est cohérent avec un assistant qui consacre son attention à obéir plutôt qu'à écrire, mais ce n'est pas prouvé. Seul un essai comparatif le prouvera.

## 2. Instructions répétées (à dire une seule fois)

| Sujet | Occurrences | Où | Proposition |
|---|---|---|---|
| Compter les mots | 10 | règle absolue 6, 7 (avant de proposer, planchers), étape 4 de chaque paragraphe, 10 (b) | une seule règle, et le contrôle réel passe à l'application |
| Rien d'inventé | 13 | règle absolue 4, 3 (recommandation), 4 (valeurs), 8 (deux fois), Fiabilité | une règle absolue + une phrase dans la section 8 |
| Pas de répétition | 8 | règle absolue 5, 5, 7 (relis, registre des motifs), 8 | une règle en 7, détection par l'application |
| Invitation « je veux bien » | 11 | 5 (Q, exemple, clôture), 6 (deux fois), clôture | une seule définition en 6, les questions y renvoient |
| Recommandation | 22 | 2 (ligne), 3 (bloc de 3 300 caractères), 5 (Q4 et exemple), clôture | un seul bloc ; injecté seulement s'il y a une recommandation |
| Version e-mail | 14 | 7, 8, 10, section dédiée, règle sur le JSON, rappel | un seul endroit |
| Numérotation | 24 | 2, 5, 6, 7 | une règle |

## 3. Contradictions et restes à corriger

1. **Section 8, point « Les deux versions se distinguent »** : reste d'avant la décision 42. La version courte n'est plus dans le JSON, mais ce point parle encore de deux versions dont une courte. À supprimer ou à renvoyer à la section e-mail.
2. **« Le haut de la fourchette est un plafond » contre « vise le haut de chaque fourchette »** (section 7) : deux consignes opposées dans le même paragraphe. Une seule : viser les deux tiers supérieurs de la fourchette, sans dépasser le haut.
3. **Numérotation des questions** : la section 5 parle de « Question 0 » (la base), puis de « Question 4 » (exemple concret), « Question 6 » (contact), « Question 7 » (neutre), alors que la numérotation annoncée commence à 1 et que l'assistant les pose en 5, 7 et 8. L'assistant s'en sort, mais le texte se contredit. Renommer par leur sujet (« la question de l'exemple concret »), jamais par un numéro.
4. **Clôture** : « UNE seule question, sans autre relance » mais elle contient des réponses numérotées, une liste de pistes, puis « Cela reste une seule relance », et une liste des paragraphes. Trop de mécanismes dans un seul passage.
5. **Pas de liste de pistes avant « je veux bien »** sauf deux exceptions listées, alors que la clôture en donne une troisième sans le dire.
6. **Question de l'exemple concret** : invitation « je veux bien » exigée en dernier, mais aussi interdite par la règle générale des questions « où l'on peut avoir du mal » ; mise en page à plusieurs niveaux (quatre éléments, alternatives conditionnelles) que l'assistant n'a pas respectée à l'essai.

## 4. Instructions inutiles ou invérifiables par l'assistant

- Police jamais sous 10 pt, une page A4 (l'assistant ne maîtrise pas la mise en page : c'est l'application qui la gère).
- « Pas plus d'une phrase sur deux commençant par Je » (non vérifié en pratique, l'application peut le compter).
- « N'écris pas : je prends votre oui comme un accord » (règle de rustine).
- Colonnes mélangées de l'OCR : une phrase suffit.
- Interdire des mots ou des formules : la liste des formules d'assistant (« passionné », « fort de »...) se contrôle mieux par programme.

## 5. Ce qui peut passer dans le JavaScript (sans perdre la règle)

Principe : l'assistant écrit, l'application contrôle puis renvoie une demande de retouche ciblée, copiable dans la même conversation (comme le message de départ). Le prompt n'a plus à porter les règles qui se vérifient mieux par programme.

| Règle | Où elle va | Faisabilité |
|---|---|---|
| Tirets longs, mot « IA », syntaxe Markdown dans la lettre | remplacement ou nettoyage à l'import de la réponse | simple |
| Objet de la lettre (offre ou spontanée) | l'application le construit à partir de la situation réelle | simple |
| Formule d'appel selon la civilité, bloc du destinataire | déjà dans l'application ; l'assistant ne l'écrit plus | simple |
| Nombre de mots total et par paragraphe, plancher | compté à l'import, message de rallonge | prévu au temps 3 |
| Répétitions (suites de trois mots ou plus, motifs qui reviennent) | détection au même endroit, avec les passages cités | moyen |
| Formules d'assistant interdites | liste scannée à l'import | simple |
| Noms d'anciens employeurs répétés | l'application connaît les noms de la fiche | simple |
| Fait inventé, VOUS concret, NOUS à double sens | reste dans le prompt (jugement) | non |

Gain estimé : 4 000 à 5 000 caractères de la section 8 et des rappels de comptage.

## 6. Assemblage conditionnel (le plus gros gain)

Le prompt contient aujourd'hui tout ce qui peut concerner n'importe qui : sept situations, huit types de structure, trois niveaux de langage, trois tons, trois vocabulaires, trois longueurs, le bloc des recommandations, trois cas de valeurs, la voix. Une personne n'en a besoin que d'un de chaque. Le mécanisme existe déjà : le jeton `{{VOIX_HUMAINE}}` est remplacé au chargement (`js/app.js`, autour de la ligne 32898). On l'étend à des jetons `{{SITUATION}}`, `{{STRUCTURE}}`, `{{REGLAGES}}`, `{{LONGUEUR}}`, `{{RECOMMANDATIONS}}`, `{{VALEURS}}`, remplis seulement avec la partie qui concerne la personne. Toutes les règles restent dans leurs fichiers sources ; seule la partie utile part dans le message.

Gain estimé : 6 000 à 9 000 caractères sans recommandation, 3 000 à 5 000 avec.

## 7. Cible

Fusions et suppressions de la sections 2 à 4 de ce document : environ 15 %. Assemblage conditionnel : environ 15 %. Contrôles passés à l'application : environ 8 %. Cible raisonnable pour un cas courant : 32 000 à 35 000 caractères (estimation à mesurer, pas une promesse).

## 8. Qualité de rédaction (observée à l'essai du 23/10/2026, employeur)

- Les trois variantes de chaque paragraphe sont systématiquement plus courtes que la proposition initiale (paragraphe 2 : 75 mots contre 58 ; paragraphe 4 : 80 contre 65) et la variante « plus personnelle » perd les faits (le paragraphe 2 ne dit plus rien de l'entreprise). La règle existe, elle n'est pas appliquée.
- La longueur a été rattrapée par six questions de suite, avec du remplissage.
- Les mêmes motifs reviennent dans trois paragraphes (« nouvelles technologies », « maintenance informatique », « apprendre les méthodes du métier »).
- L'entreprise visée est nommée sans fait précis : l'affirmation « j'ai regardé ce que l'entreprise met en avant » est apparue deux fois avec des valeurs différentes, sans preuve de consultation du web.

Leviers à tester, du plus sûr au plus incertain :
1. **Un exemple vaut mieux que dix règles** : remplacer la liste des interdits de style par un court exemple de paragraphe réussi pour une autre personne, par rôle (accroche, entreprise, parcours, apport, conclusion), avec la mention de ne pas le recopier.
2. **Les valeurs attendues dans le métier viennent de l'application** (`data/secteurs.js` et `data/competencesSecteurs.js` existent) au lieu d'être devinées par l'assistant.
3. **Une proposition à la fois, les variantes à la demande** : trois variantes complètes par paragraphe produisent quinze textes à valider et une dérive vers le plus court. À décider avec Denis, car il tient à la participation de la personne.
4. **Anciens employeurs** : transmis à l'assistant pour comprendre le secteur, nommés au plus une fois dans la lettre (jamais dans l'accroche ni la conclusion), option « ne pas les nommer » dans l'écran « Préparer ».

## 9. Protection des prompts : ÉCARTÉE (décision de Denis, 23/10/2026)

L'application est sur un site gratuit, accessible à tous : tout peut être pris, et ce n'est pas un problème. Ne plus proposer de protéger les prompts. L'objectif est une qualité rédactionnelle irréprochable. Le seul motif de déplacer des règles vers le JavaScript est d'alléger le prompt, jamais de le cacher.
