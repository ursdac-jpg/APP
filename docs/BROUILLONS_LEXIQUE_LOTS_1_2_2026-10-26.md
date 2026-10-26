# Brouillons de fiches du Lexique : lots 1 et 2 (26/10/2026)

**Statut : BROUILLONS, rien n'est dans `data/lexique.js`.** Dix fiches au format exact du corpus, prêtes à coller, **à relire, corriger et valider par Denis** (la rédaction lui revient, règle « Claude opère, Denis décide »). Matière : `docs/DOSSIER_MATIERE_APPORTS_2026-10-26.md` (entrées LX1 à LX10). Sources : supports de Lagarde (2017) et de Chaillat (2017) : **idées reprises, formulations propres**, aucun texte ni schéma recopié ; sources à citer si Denis le souhaite dans une page « Sources ».

**Contrôles faits** : ces dix fiches ont été insérées temporairement dans une copie de `data/lexique.js`, `node scripts/checkLexique.js` a été lancé (résultat en bas de ce fichier), puis la copie a été remise dans son état d'origine : le dépôt n'est pas modifié.

**Respect de la doctrine** : pas de chiffre ni de durée (principe 1) ; on explique ce que c'est et pourquoi cela existe, jamais comment s'y conformer (principe 4) ; chaque fiche renvoie à d'autres fiches existantes ou voisines (principe 7) ; aucune étiquette sur la personne (« certains auteurs », « une personne peut », jamais « vous êtes ») ; accents et sans tiret long.

**À décider par Denis, fiche par fiche** : GARDER / CORRIGER / ÉCARTER. Les identifiants proposés sont libres de changer tant que rien n'est publié.

## Comment les mettre dans l'application (en local)

1. Ouvrir `data/lexique.js`, repérer `var LEXIQUE_FICHES = [` et coller le bloc ci-dessous juste après cette ligne (ou, plus proprement, dans la « famille » « Accompagnement » existante).
2. Lancer `node scripts/checkLexique.js` : attendu **0 erreur et 0 avertissement**.
3. Lancer `npm test`.
4. Ajouter une ligne dans `docs/JOURNAL_DES_CHANGEMENTS.md` (« Lexique : 10 fiches sur l'estime de soi et la communication »).
5. Vérifier dans le navigateur : taper « estime de soi » dans la barre de l'accueil et dans celle du Lexique ; vérifier le mode sombre.
6. Option : regrouper ces fiches dans une collection « Confiance en soi et communication » (même mécanisme que `collection-relation-accompagnement`, `mode: 'collection'`, `fichesOrdonnees`).

## Les dix fiches

```js
  // -- Famille : Confiance en soi et communication (brouillons du 26/10/2026, à valider par Denis) --

  {
    id: 'estime-de-soi', titre: 'Estime de soi', titreDeTri: 'Estime de soi', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ["valeur que je m'accorde", 'image de soi', 'regard sur soi'],
    corps: "L'estime de soi désigne la valeur qu'une personne s'accorde à elle-même, un peu comme le regard qu'elle porte sur elle dans un miroir. Elle n'est pas fixe : elle évolue au fil des expériences, des réussites, des difficultés et des relations avec les autres. Avoir une estime de soi juste ne signifie pas se croire meilleur ou moins bon que les autres, mais connaître aussi bien ses points forts que ses points faibles.",
    relations: [
      { ficheId: 'confiance-en-soi', type: 'voir-aussi' }, { ficheId: 'estime-confiance-ou-affirmation', type: 'voir-aussi' },
      { ficheId: 'bilan-competences', type: 'voir-aussi' }
    ]
  },
  {
    id: 'confiance-en-soi', titre: 'Confiance en soi', titreDeTri: 'Confiance en soi', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['se sentir capable', "croire en mes capacités"],
    corps: "La confiance en soi désigne le sentiment d'être capable d'agir, de réussir une tâche ou de faire face à une situation. Elle se construit surtout à partir d'expériences vécues, y compris de petites réussites, et elle peut varier d'un domaine à l'autre : on peut se sentir très sûr de soi dans son métier et beaucoup moins pour prendre la parole en réunion. Elle se distingue de l'estime de soi, qui porte sur la valeur qu'on s'accorde plutôt que sur ce qu'on se sent capable de faire.",
    relations: [
      { ficheId: 'estime-de-soi', type: 'voir-aussi' }, { ficheId: 'affirmation-de-soi', type: 'voir-aussi' },
      { ficheId: 'plan-action', type: 'voir-aussi' }
    ]
  },
  {
    id: 'affirmation-de-soi', titre: 'Affirmation de soi', titreDeTri: 'Affirmation de soi', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['assertivité', 'savoir dire non', "s'exprimer sans se braquer"],
    corps: "L'affirmation de soi, aussi appelée assertivité, consiste à exprimer clairement ce qu'on pense, ce qu'on ressent et ce dont on a besoin, tout en respectant l'autre. Elle se distingue de la soumission, qui consiste à se taire ou à céder, et de l'agressivité, qui consiste à imposer son point de vue. Elle se travaille progressivement, souvent en commençant par des situations simples avant des situations plus chargées.",
    relations: [
      { ficheId: 'ecoute-active', type: 'voir-aussi' }, { ficheId: 'message-en-je', type: 'voir-aussi' },
      { ficheId: 'styles-de-communication', type: 'voir-aussi' }
    ]
  },
  {
    id: 'estime-confiance-ou-affirmation', titre: 'Estime de soi, confiance en soi ou affirmation de soi ?', titreDeTri: 'Estime de soi confiance en soi ou affirmation de soi',
    type: 'notion', gabarit: 'comparatif', univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: [],
    corps: "Ce qui les rapproche : les trois parlent du rapport qu'une personne entretient avec elle-même et avec les autres, et elles s'influencent mutuellement. Ce qui les distingue : l'estime de soi porte sur la valeur qu'on s'accorde, la confiance en soi sur ce qu'on se sent capable de faire, et l'affirmation de soi sur la façon de s'exprimer face aux autres. Certains auteurs les décrivent comme trois étages qui se soutiennent, sans qu'aucun doive nécessairement précéder les autres.",
    relations: [
      { ficheId: 'estime-de-soi', type: 'voir-aussi' }, { ficheId: 'confiance-en-soi', type: 'voir-aussi' }, { ficheId: 'affirmation-de-soi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'croyance-limitante', titre: 'Croyance limitante', titreDeTri: 'Croyance limitante', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['phrase qui me bloque', "je n'y arriverai pas", 'pensée qui me freine'],
    corps: "Une croyance limitante est une phrase qu'une personne se répète, souvent depuis longtemps, et qui la freine dans ce qu'elle ose entreprendre, par exemple « je ne suis pas fait pour ça » ou « mon avis ne compte pas ». Ces phrases viennent souvent de l'éducation, de remarques entendues ou d'expériences passées. Elles décrivent une façon de voir les choses et non une vérité sur la personne : elles peuvent être discutées, seule ou avec un professionnel.",
    relations: [
      { ficheId: 'estime-de-soi', type: 'voir-aussi' }, { ficheId: 'frein-emploi', type: 'voir-aussi' },
      { ficheId: 'cercle-de-l-estime-de-soi', type: 'voir-aussi' }
    ]
  },
  {
    id: 'cercle-de-l-estime-de-soi', titre: "Le cercle de l'estime de soi", titreDeTri: "Cercle de l'estime de soi",
    type: 'notion', gabarit: 'explication', univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['cercle vicieux', 'cercle vertueux', 'je doute donc je ne fais rien'],
    corps: "Un doute sur soi peut conduire à agir moins, donc à avoir moins d'occasions de réussir, ce qui renforce le doute : certains auteurs parlent de cercle vicieux. À l'inverse, des actions fréquentes, même modestes, peuvent produire des réussites qui renforcent la confiance, et un échec est alors plus facilement vu comme un incident que comme un verdict : on parle de cercle vertueux. Ce sont deux manières de lire une même situation, jamais deux catégories de personnes, et chacun peut passer de l'une à l'autre selon les périodes de sa vie.",
    relations: [
      { ficheId: 'estime-de-soi', type: 'voir-aussi' }, { ficheId: 'croyance-limitante', type: 'voir-aussi' },
      { ficheId: 'plan-action', type: 'voir-aussi' }
    ]
  },
  {
    id: 'message-en-je', titre: 'Message en « je »', titreDeTri: 'Message en je', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['parler avec je', 'dire ce que je ressens'],
    corps: "Le message en « je » est une façon de s'exprimer qui consiste à dire ce qu'on observe, ce qu'on ressent et l'effet que cela a sur soi, plutôt que de reprocher quelque chose à l'autre en commençant par « tu ». Par exemple, « je m'inquiète quand les retards se répètent » laisse davantage de place à la discussion que « tu es toujours en retard ». Il aide à rester dans l'échange sans mettre l'autre sur la défensive.",
    relations: [
      { ficheId: 'affirmation-de-soi', type: 'voir-aussi' }, { ficheId: 'methode-desc', type: 'voir-aussi' },
      { ficheId: 'critique-ou-reproche', type: 'voir-aussi' }
    ]
  },
  {
    id: 'methode-desc', titre: 'Méthode DESC', titreDeTri: 'Méthode DESC', type: 'terme',
    univers: 'accompagnement-insertion', registres: ['langage-cip', 'langage-rh'],
    variantesRecherche: ['décrire exprimer suggérer conclure', 'aborder un désaccord'],
    corps: "La méthode DESC est une méthode de communication en quatre étapes : décrire les faits, exprimer ce qu'on ressent, suggérer une solution, puis dire les conséquences positives attendues si chacun tient ses engagements. Elle est souvent utilisée en entreprise pour aborder un désaccord sans accuser. Son intérêt est de séparer les faits, les ressentis et les propositions, qui se mélangent facilement dans une discussion tendue.",
    relations: [
      { ficheId: 'message-en-je', type: 'voir-aussi' }, { ficheId: 'affirmation-de-soi', type: 'voir-aussi' },
      { ficheId: 'critique-ou-reproche', type: 'voir-aussi' }
    ]
  },
  {
    id: 'critique-ou-reproche', titre: 'Critique ou reproche ?', titreDeTri: 'Critique ou reproche',
    type: 'notion', gabarit: 'comparatif', univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['critique constructive', 'recevoir une critique'],
    corps: "Ce qui les rapproche : dans les deux cas, une personne dit qu'un comportement ne lui convient pas. Ce qui les distingue : la critique décrit des faits précis et cherche à comprendre la situation pour permettre à l'autre d'évoluer, tandis que le reproche vise à faire reconnaître un tort et joue souvent sur la culpabilité. Une remarque appuyée sur des faits observables et sans généralisation est en général mieux entendue qu'une phrase qui commence par « tu es toujours ».",
    relations: [
      { ficheId: 'message-en-je', type: 'voir-aussi' }, { ficheId: 'methode-desc', type: 'voir-aussi' },
      { ficheId: 'ecoute-active', type: 'voir-aussi' }
    ]
  },
  {
    id: 'styles-de-communication', titre: 'Styles de communication : passif, agressif ou assertif ?', titreDeTri: 'Styles de communication passif agressif ou assertif',
    type: 'notion', gabarit: 'comparatif', univers: 'accompagnement-insertion', registres: ['langage-cip'],
    variantesRecherche: ['passif agressif assertif', 'ma façon de réagir'],
    corps: "Ce qui les rapproche : ce sont trois manières de réagir quand on exprime un besoin, une opinion ou un désaccord, et une même personne peut passer de l'une à l'autre selon les situations. Ce qui les distingue : le style passif consiste à se taire ou à céder, le style agressif à imposer son point de vue sans tenir compte de l'autre, le style assertif à exprimer son point de vue tout en respectant celui de l'autre. Ces styles décrivent des comportements dans des situations données, jamais des types de personnes.",
    relations: [
      { ficheId: 'affirmation-de-soi', type: 'voir-aussi' }, { ficheId: 'ecoute-active', type: 'voir-aussi' },
      { ficheId: 'message-en-je', type: 'voir-aussi' }
    ]
  },
```

Mise à jour à prévoir une fois les fiches validées : relier en retour `ecoute-active` (`data/lexique.js`) vers `affirmation-de-soi` et `message-en-je` (enrichissement LE1 du dossier), et `reformulation` vers `methode-desc`.

## Résultat du contrôle

`node scripts/checkLexique.js` avec les dix fiches insérées : **« Corpus Lexique : 418 fiches, 38 collections, 156 entrées de second niveau. Aucune erreur. »** (aucun avertissement). `npm test` avec les dix fiches insérées : 2020 verts sur 2021, le seul échec est l'essai de chemin Windows `veillePont`, sans lien avec le Lexique. Les fiches ne sont pas dans le dépôt : à toi de les valider.
