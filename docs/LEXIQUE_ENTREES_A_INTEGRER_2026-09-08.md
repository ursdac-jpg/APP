# Lexique : entrées « dispositifs et fondations » (2026-09-08)

> **INTÉGRÉ le 2026-09-08, commit `9f40639`.** Les 8 entrées, les 8 secondes
> lectures et la relation réciproque sur `reconversion` sont dans `data/lexique.js`.
> `checkLexique` : 162 fiches, aucune erreur ni avertissement. `npm test` : 780.
> Vérifié au navigateur (recherche + affichage des 8 entrées, comparatif au bon
> gabarit). Ce fichier reste comme trace de la préparation et des choix.
>
> Issues de la recherche « dispositifs et fondations » (voir
> `docs/NOTES_RESSOURCES_2026-09-08.md`).

---

## 8 entrées principales -> à ajouter dans `LEXIQUE_FICHES`

```js
  {
    id: 'erip', titre: 'ERIP', titreDeTri: 'ERIP', type: 'terme',
    univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ["espace régional d'information de proximité", 'espace métiers', "où me renseigner sur les métiers et la formation"],
    corps: "Un ERIP (espace régional d'information de proximité) est un lieu d'accueil du réseau mis en place par la Région Nouvelle-Aquitaine. On peut y venir librement et gratuitement, à tout âge et quelle que soit sa situation, pour s'informer sur les métiers, la formation, la recherche d'emploi, la VAE ou la création d'entreprise, et être orienté vers le bon interlocuteur. Chaque ERIP est porté par une structure locale, souvent une mission locale, une maison de l'emploi ou un organisme de formation. Le réseau existe depuis 2020 : il a réuni sous un même nom des réseaux plus anciens, comme l'Espace métiers Aquitaine.",
    relations: [
      { ficheId: 'mission-locale', type: 'voir-aussi' }, { ficheId: 'cep', type: 'voir-aussi' }, { ficheId: 'vae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'pait', titre: 'PAIT', titreDeTri: 'PAIT', type: 'terme',
    univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['point accueil installation', "je veux m'installer en agriculture", 'devenir agriculteur'],
    corps: "Le PAIT (point accueil installation transmission) est le premier interlocuteur, gratuit et neutre, pour toute personne qui envisage de s'installer en agriculture ou de transmettre une exploitation. Il y en a un par département, à la chambre d'agriculture. On y explique les étapes, les contacts, les aides et les formations, et on oriente vers un conseiller qui suit le projet. Le PAIT tient aussi le répertoire des exploitations à reprendre.",
    relations: [
      { ficheId: 'erip', type: 'voir-aussi' }, { ficheId: 'bprea', type: 'voir-aussi' }
    ]
  },
  {
    id: 'bprea', titre: 'BPREA', titreDeTri: 'BPREA', type: 'terme',
    univers: 'formation', registres: ['langage-administratif'],
    variantesRecherche: ["brevet professionnel responsable d'entreprise agricole", 'capacité professionnelle agricole', "se reconvertir dans l'agriculture"],
    corps: "Le BPREA (brevet professionnel responsable d'entreprise agricole) est un diplôme de niveau bac, en formation continue, souvent en un an, en centre ou à distance. Il forme des chefs d'exploitation : conduite des productions, gestion, commercialisation. Il s'obtient bloc par bloc. C'est la voie la plus courante pour une reconversion vers l'agriculture, car il donne la capacité professionnelle agricole, exigée pour s'installer avec les aides publiques.",
    relations: [
      { ficheId: 'pait', type: 'voir-aussi' }, { ficheId: 'dnja', type: 'voir-aussi' }, { ficheId: 'reconversion', type: 'voir-aussi' }
    ]
  },
  {
    id: 'dnja', titre: 'DNJA (ex-DJA)', titreDeTri: 'DNJA', type: 'terme',
    univers: 'dispositifs', registres: ['langage-administratif'],
    variantesRecherche: ['dotation nouveaux et jeunes agriculteurs', 'dotation jeune agriculteur', "aide à l'installation en agriculture"],
    corps: "La DNJA (dotation nouveaux et jeunes agriculteurs) est une aide versée en capital au moment de l'installation en agriculture, cofinancée par la Région et l'Europe. En Nouvelle-Aquitaine, depuis 2023, elle a remplacé la DJA (dotation jeune agriculteur) et l'ouvre plus largement : de 18 à 55 ans, avec un diplôme agricole ou une expérience équivalente. Son montant dépend de la zone et du projet. La demande passe par le PAIT puis un plan de professionnalisation.",
    relations: [
      { ficheId: 'pait', type: 'voir-aussi' }, { ficheId: 'bprea', type: 'voir-aussi' }
    ]
  },
  {
    id: 'fondation-2eme-chance', titre: 'La Fondation de la 2ème Chance', titreDeTri: "Fondation de la 2ème Chance", type: 'terme',
    univers: 'dispositifs', registres: [],
    variantesRecherche: ['fondation deuxième chance', 'aide de dernier recours pour se former', 'aide après une épreuve de vie'],
    corps: "La Fondation de la 2ème Chance aide des personnes de 18 à 62 ans qui ont traversé de lourdes épreuves de vie, sont aujourd'hui en situation de précarité, et portent un projet concret. Elle finance une formation qualifiante (jusqu'à 5 000 euros) ou une création ou reprise d'entreprise (jusqu'à 8 000 euros), avec un parrainage par un bénévole. C'est une aide de dernier recours : il faut avoir cherché les autres financements avant. Le dossier se monte avec une structure d'accompagnement.",
    relations: [
      { ficheId: 'reconversion', type: 'voir-aussi' }, { ficheId: 'frein-emploi', type: 'voir-aussi' }, { ficheId: 'cep', type: 'voir-aussi' }
    ]
  },
  {
    id: 'clause-sociale', titre: "La clause sociale d'insertion", titreDeTri: "Clause sociale d'insertion", type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-administratif', 'langage-cip'],
    variantesRecherche: ["clause d'insertion", "heures d'insertion", 'marché public insertion'],
    corps: "La clause sociale d'insertion est une obligation inscrite dans un marché public : l'entreprise qui décroche le marché doit réserver un volume d'heures de travail (les heures d'insertion) à des personnes éloignées de l'emploi. Ces heures correspondent à un vrai poste, payé normalement. L'entreprise embauche directement, passe par une structure d'insertion, ou propose une alternance. On y accède par l'intermédiaire d'un facilitateur, sur orientation de son conseiller. Depuis le 22 août 2026, la clause devient obligatoire sur les marchés publics les plus importants.",
    relations: [
      { ficheId: 'facilitateur-clause-sociale', type: 'voir-aussi' }, { ficheId: 'maitre-ouvrage-ou-maitre-oeuvre', type: 'voir-aussi' }, { ficheId: 'iae', type: 'voir-aussi' }
    ]
  },
  {
    id: 'facilitateur-clause-sociale', titre: 'Le facilitateur de la clause sociale', titreDeTri: 'Facilitateur de la clause sociale', type: 'terme',
    univers: 'structures-organismes', registres: ['langage-administratif'],
    variantesRecherche: ['facilitateur clause sociale', "qui gère les heures d'insertion"],
    corps: "Le facilitateur de la clause sociale est la personne qui fait le lien entre l'acheteur public, les entreprises titulaires des marchés et les candidats en insertion. Il aide à rédiger la clause, propose des profils, suit les heures réalisées et rend compte à l'acheteur. Il est en général rattaché à une maison de l'emploi, à un PLIE ou au service emploi d'un conseil départemental. C'est lui qu'on contacte, souvent via son conseiller, pour accéder à des heures d'insertion.",
    relations: [
      { ficheId: 'clause-sociale', type: 'voir-aussi' }, { ficheId: 'plie', type: 'voir-aussi' }
    ]
  },
  {
    id: 'maitre-ouvrage-ou-maitre-oeuvre', titre: "Maître d'ouvrage ou maître d'œuvre ?", titreDeTri: "Maître d'ouvrage ou maître d'œuvre",
    type: 'notion', gabarit: 'comparatif', univers: 'organisation-travail-management', registres: [],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les deux interviennent dans un projet de travaux ou d'aménagement, du côté de celui qui fait faire. Ce qui les distingue : le maître d'ouvrage est celui qui commande et paie l'ouvrage (une commune, un bailleur, une entreprise) et en définit le besoin. Le maître d'œuvre est celui qu'il mandate pour concevoir le projet et surveiller son exécution (un architecte, un bureau d'études) : il anime les réunions de chantier et en rédige les comptes rendus.",
    relations: [
      { ficheId: 'clause-sociale', type: 'voir-aussi' }
    ]
  },
```

## 8 secondes lectures -> à ajouter dans `LEXIQUE_SECOND_NIVEAU`

```js
  {
    id: 'second-niveau-erip',
    titre: 'Nuance utile',
    fichesEntree: ['erip'],
    corps: "Un ERIP ne remplace pas France Travail ni la mission locale : c'est un point d'information et d'orientation, ouvert à tous, qui renvoie ensuite vers la structure adaptée. On peut le consulter sans être inscrit nulle part."
  },
  {
    id: 'second-niveau-pait',
    titre: 'Par où commencer',
    fichesEntree: ['pait'],
    corps: "Avant tout engagement, prendre rendez-vous au PAIT de son département : l'entretien est sans condition et ne juge pas le projet. C'est lui qui déclenche l'accès au parcours d'aides, dont la dotation à l'installation."
  },
  {
    id: 'second-niveau-bprea',
    titre: 'Nuance utile',
    fichesEntree: ['bprea'],
    corps: "La capacité professionnelle agricole ne passe pas forcément par le BPREA : un autre diplôme agricole de niveau bac la donne aussi, et un diplôme non agricole de niveau bac peut suffire s'il est complété par une expérience agricole."
  },
  {
    id: 'second-niveau-dnja',
    titre: 'Nuance utile',
    fichesEntree: ['dnja'],
    corps: "Le nom et les règles varient selon la région : DNJA est le nom en Nouvelle-Aquitaine. Ailleurs, l'aide à l'installation peut s'appeler autrement et avoir d'autres montants ou d'autres conditions d'âge."
  },
  {
    id: 'second-niveau-fondation-2eme-chance',
    titre: 'Nuance utile',
    fichesEntree: ['fondation-2eme-chance'],
    corps: "L'aide n'est pas automatique : chaque dossier passe devant un comité, qui peut refuser. Elle vient compléter un plan de financement, pas le remplacer, et suppose un projet déjà construit avec un accompagnement."
  },
  {
    id: 'second-niveau-clause-sociale',
    titre: 'Dans quels cas ?',
    fichesEntree: ['clause-sociale'],
    corps: "Les publics visés varient selon les marchés : demandeurs d'emploi de longue durée, bénéficiaires du RSA, jeunes peu qualifiés, travailleurs handicapés, habitants des quartiers prioritaires. C'est le facilitateur qui vérifie l'éligibilité."
  },
  {
    id: 'second-niveau-facilitateur-clause-sociale',
    titre: 'Exemples concrets',
    fichesEntree: ['facilitateur-clause-sociale'],
    corps: "Sur un chantier de rénovation d'un bailleur social, le facilitateur repère les postes ouvrables aux heures d'insertion, contacte les entreprises, et propose des candidats suivis par France Travail, une mission locale ou une structure d'insertion."
  },
  {
    id: 'second-niveau-maitre-ouvrage-ou-maitre-oeuvre',
    titre: 'Nuance utile',
    fichesEntree: ['maitre-ouvrage-ou-maitre-oeuvre'],
    corps: "Dans une clause sociale, c'est le maître d'ouvrage qui décide de l'inscrire au marché, et le maître d'œuvre qui vérifie, en réunion de chantier, que l'entreprise tient ses engagements, dont les heures d'insertion."
  },
```

## Ajout réciproque sur une fiche existante (au moment de l'intégration)

Sans ça, `fondation-2eme-chance` ne serait citée par aucune autre fiche
(`checkLexique` : avertissement « jamais citée »).

Dans la fiche **`reconversion`**, ajouter à `relations` (elle en a 2, plafond 3) :

```js
      { ficheId: 'fondation-2eme-chance', type: 'voir-aussi' }
```

## Choix faits

- **Pas d'entrée « capacité professionnelle agricole » séparée** : elle est
  définie dans le corps de `bprea` et dans sa seconde lecture, et « capacité
  professionnelle agricole » est une variante de recherche de `bprea`. Une
  micro-fiche de plus n'apportait rien.
- **Pas d'entrée « heures d'insertion » séparée** : c'est l'unité de la clause,
  définie dans `clause-sociale` (corps + variante de recherche).
- **Pas d'entrée « FEADER »** : trop abstrait pour le public ; le cofinancement
  européen est cité dans le corps de `dnja` sans nommer le fonds.
- **Pas d'entrée « MSA »** : hors périmètre de cette recherche ; à proposer
  séparément si le besoin apparaît (elle serait le pendant agricole d'une
  éventuelle fiche URSSAF, qui n'existe pas non plus).
- `maitre-ouvrage-ou-maitre-oeuvre` en `notion` / `gabarit: comparatif` : c'est
  le format déjà validé pour les paires qu'on confond (comme
  `reorientation-ou-reconversion`).
