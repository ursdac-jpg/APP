# Brouillon du texte du prompt : « missions en action regroupées » (lot N3, étape 2, 2026-10-03)

**Statut : VALIDÉ par Denis le 2026-10-04 (« OK à tout »), ACTIVÉ le 2026-10-04.** Le texte est dans `prompts/cv.md` (point 20, champ `missionsEnActionProposees`, étiquette `competence` gardée, nom du champ laissé au choix de Claude). Le code lit, garde et affiche les phrases (voir plan de la nuit, lot N3). Ce document est conservé comme trace.

## 1. À quoi sert ce nouveau champ

En mode « Par compétences », le bloc « Compétences en action » du CV montre aujourd'hui les premières missions (3 / 2 / 1 par expérience liée au métier, au moins 2), prises telles quelles dans les expériences. L'assistant peut faire mieux : **proposer des phrases qui regroupent plusieurs missions proches de plusieurs expériences en lien avec le métier visé**, sans doublon, et **en proposer plusieurs pour que la personne choisisse**. Ces phrases viendraient **en tête de la liste « en réserve »** du panneau, et celles que la personne coche remplacent des missions du bloc. Si l'assistant n'en propose pas (ou pas assez), **rien ne change** : le repli déjà codé reste le filet de sécurité.

## 2. Nouveau champ JSON (dans `recommandations`, juste après `competencesGroupeesParTheme`)

```json
"missionsEnActionProposees": [
  {
    "texte": "...",
    "illustrePar": ["...", "..."],
    "competence": "..."
  }
]
```

- `texte` : une phrase de mission (voir règles ci-dessous).
- `illustrePar` : les postes et/ou entreprises du profil qui fondent cette phrase, **exactement comme écrits dans le profil**.
- `competence` : intitulé court (2 à 5 mots) de ce que la phrase démontre. **Facultatif** (sert d'étiquette dans la liste du panneau).

## 3. TEXTE PROPOSÉ à ajouter à `prompts/cv.md` (nouveau point 20)

> 20. Propose, dans `missionsEnActionProposees`, des phrases de missions « en action » pour le bloc « Compétences en action » du CV, **uniquement lorsque le profil contient assez de matière réelle en lien avec le métier visé**. Chaque phrase se construit **à partir des missions déjà présentes dans le profil** (ou de celles que tu as rédigées aux points 5 et 6 pour les expériences retenues), jamais d'un fait nouveau.
>
> - **Regrouper** : une phrase peut réunir plusieurs missions proches, y compris venant de plusieurs expériences, quand elles montrent réellement la même compétence (par exemple une même activité exercée dans deux postes). Elle ne réunit jamais deux métiers ou deux secteurs différents, et ne nomme jamais un chiffre, un outil, un lieu ou un employeur absent du profil.
> - **Style** : une seule phrase par proposition, avec un verbe d'action, dans la formulation du point 6 (professionnelle, concrète, vingt mots au plus). Ne recopie jamais une mission mot pour mot : reformule et resserre.
> - **Aucun doublon** : deux propositions ne disent jamais la même chose, même avec d'autres mots, et une proposition ne répète pas une mission déjà donnée telle quelle pour une expérience retenue.
> - **Lien avec le métier visé** : ne propose que des phrases utiles pour le poste visé. Une expérience sans rapport avec le métier visé ne fournit aucune phrase. **Classe les propositions de la plus déterminante à la moins déterminante** pour cette candidature.
> - **Nombre** : propose de 6 à 10 phrases quand le profil le permet. S'il n'y a pas assez de matière réelle, propose-en moins ; **une liste vide est un résultat normal, jamais une erreur à éviter à tout prix**. Ne remplis jamais pour atteindre un nombre.
> - **Prudence** : dans le doute sur le lien entre une phrase et une expérience, ne mets pas cette expérience dans `illustrePar` (liste vide acceptée). Jamais une expérience absente du profil.
>
> Pour `missionsEnActionProposees` : `illustrePar` reprend les postes et/ou entreprises tels qu'ils figurent dans le profil, jamais un texte libre ; `competence` est un intitulé court et facultatif.

## 4. Exemple de sortie attendue (profil du carreleur de l'exemple de Denis)

```json
"missionsEnActionProposees": [
  { "texte": "Poser du carrelage sur sols, murs et escaliers dans des logements, avec découpes et ajustements précis.", "illustrePar": ["Pose de carrelage sur différents supports et espaces intérieurs"], "competence": "Pose de carrelage" },
  { "texte": "Préparer les supports par ponçage et rebouchage avant les travaux de finition.", "illustrePar": ["Réalisation de travaux de peinture en bâtiment"], "competence": "Préparation des supports" },
  { "texte": "Travailler en équipe sur chantier pour respecter l'avancement et les étapes d'exécution.", "illustrePar": ["Pose de carrelage sur différents supports et espaces intérieurs", "Réalisation de travaux de peinture en bâtiment"], "competence": "Travail de chantier" }
]
```
(La troisième phrase illustre le regroupement : deux expériences du même secteur, même compétence, sans rien inventer.)

## 5. Ce que fera le code (une fois le texte validé)

1. `prompts/cv.md` : ajout du point 20 et du champ dans l'exemple JSON (rien d'autre n'est modifié). Texte de secours du prompt aligné s'il en existe un (grep d'abord).
2. Lecture : le moteur de décision garde seulement les phrases dont chaque `illustrePar` correspond à une expérience réelle du dossier (comme pour `competencesGroupeesParTheme`).
3. `_pdfCompetencesEnAction` (variante « Par compétences ») : les phrases validées s'ajoutent **en tête de la réserve** (décochées), avec leur étiquette `competence` et leurs expériences sources ; les missions du repli restent derrière.
4. La liste « Modifier Compétences en action » les montre (décochées, « proposition de l'assistant »), on peut les cocher, les modifier, les monter ou descendre.
5. Si le nombre demandé dépasse les propositions de l'assistant, on complète avec les missions des expériences (déjà codé).
6. Essais ajoutés ; **les sessions déjà enregistrées n'ont pas ce champ : elles gardent le repli** jusqu'à ce que la personne relance l'assistant.

## 6. Décisions qui te reviennent (pour passer en « APTE AU MODE NUIT »)

Réponds « OK à tout » ou donne les numéros à changer :
1. Le texte du point 20 ci-dessus (ton, prudence, « vingt mots au plus »).
2. Le nom du champ : `missionsEnActionProposees` (autre suggestion : `phrasesEnAction`).
3. Le nombre : 6 à 10 propositions (suggestion), liste vide acceptée.
4. `competence` facultatif (étiquette courte dans la liste) : oui / non.
5. L'effort : cette étape se code à l'effort **haut** (tu repasses l'effort à haut avant la nuit).
