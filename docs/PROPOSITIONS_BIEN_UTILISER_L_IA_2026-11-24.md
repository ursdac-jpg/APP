# Bien utiliser l'IA : propositions d'évolution (dossier du 24/11/2026)

Demande de Denis, 24/11/2026 : faire le maximum de ce qui reste, puis proposer des idées de pédagogie, de techniques au-delà du prompt, d'interactivité et de pratique personnelle ou professionnelle. Mode A, effort haut. Rien n'est ouvert au public (`BUIA_OUVERT = false`). Rien de ce dossier n'est codé, sauf la page « Projets et mémoire » (commit `a350aea2`, expliquée plus bas) et, depuis le choix de Denis du 24/11/2026 (décision A, option 1), les exercices P1 et P2 (chemin 1) et l'écran P4 « Quand s'en passer » (chemin 4). P3 a été codé ensuite (chemin 1, écran 4), ainsi que P5, P6, P11 et P12 ; seule la décision D reste ouverte, avec P7 à P9 (à sourcer) et P13 (à auditer).

## L'essentiel en dix lignes

1. **Avant vos essais** : coupez la mémoire et la personnalisation de l'assistant, ou utilisez sa conversation temporaire. Sinon vos réponses de test peuvent être influencées par vos anciennes conversations (voir le paragraphe 6).
2. **Fait aujourd'hui** : la page « Projets et mémoire » est corrigée avec les pages officielles de quatre éditeurs (couper la mémoire n'efface pas les souvenirs, supprimer une conversation non plus, la conversation temporaire ne laisse rien).
3. **Maquette interactive à essayer** : `docs/maquettes/maquette-bien-utiliser-ia-exercices-2026-11-24.html`. Quatre exercices sans aucun envoi à un assistant : réparer une demande, repérer ce qui se vérifie, avant et après, quand ne pas lui demander.
4. **Recommandation** : coder l'exercice « réparer une demande », l'exercice « repérer ce qui se vérifie » et la page « Quand ne pas lui demander ». Ce sont les trois propositions qui s'appuient le mieux sur les références (Pix IA, études sur l'apprentissage par exemples travaillés).
5. **Au-delà du prompt, déjà sourcé** : « une conversation longue se brouille » et « poser deux fois et comparer ». Deux textes courts à ajouter à des écrans existants.
6. **Au-delà du prompt, à sourcer d'abord** : les instructions permanentes, les outils qui répondent seulement à partir de vos documents, la flatterie des assistants.
7. **Écarté pour le public** : agents, outils connectés, « skills ». Ça change trop vite et le risque pour les données est trop grand.
8. **Pour les professionnels** : une liste de questions à poser à sa structure avant d'utiliser un assistant (jamais une règle écrite à sa place).
9. **Ce qui reste à vous** : vos essais, les deux réglages 2b du chemin 3, la validation de l'écart 2e, la vidéo en dernier.
10. **Je n'ai rien décidé à votre place** : les choix sont au paragraphe 7, avec une recommandation et les bénéfices et risques de chaque option.

## 1. Comment voir l'écart 2e (point à valider)

Sur votre poste, le module est visible : accueil, carte « Boîte à outils », « Bien utiliser l'IA », chemin « Écrire ma propre demande », écran « Améliorer ». Cochez « La réponse ne répond pas vraiment à ce que j'ai demandé » : au lieu d'ajouter une phrase toute faite, l'écran demande une courte précision écrite (« Mon but exact, en une phrase »). Même chose pour « Elle ne tient pas compte de ma situation ». Raison de l'écart avec la maquette : sans précision, la demande contiendrait un « à compléter » oublié. Si la précision vous paraît trop lourde, l'alternative est de remplacer ces deux corrections par un simple conseil sans bouton « Ajouter ».

## 2. Où le module se situe par rapport aux références

Trois références publiques ont été relues le 24/11/2026.

| Référence | Ce qu'elle dit | Ce que le module couvre |
|---|---|---|
| **Référentiel Pix « compétences numériques en IA », version 1.5 de janvier 2026** (document de travail) | Trois domaines : fondements de l'IA, usages, enjeux. Compétence 2.2 « Utiliser un logiciel d'IA générative » avec trois niveaux (novice, indépendant, avancé) | Écrire des requêtes claires et précises : couvert (chemins 1 et 3). Ajuster et affiner : couvert (écran « Améliorer »). Évaluer une réponse et repérer les erreurs : couvert en texte, **pas en exercice**. Croiser avec d'autres sources : couvert (chemin 4, écran « Comment choisir »). Données personnelles : couvert (rappels). Principe du « répondre à partir de ses documents » et charte d'usage dans une organisation (compétence 2.5) : **non couvert** |
| **Cadre européen DigComp 2.2**, thème « Quand interagir avec des systèmes d'IA ? » | Cité par Pix comme l'une de ses sources | Non couvert : c'est l'objet de la proposition P4 |
| **Cadre UE et OCDE de culture de l'IA (AILit), publié le 18 juin 2026** | Quatre dimensions (s'engager avec l'IA, créer avec, la gérer, la façonner), dix-neuf compétences, pour l'école primaire et secondaire | Texte complet non lu (seule la page de présentation l'a été). À lire avant de s'y référer |

À savoir : deux parcours Pix sur l'IA deviennent obligatoires pour les élèves de 4e, de seconde et de première année de CAP à la rentrée 2026-2027 (source : site de l'académie de Paris). Les jeunes que vous accompagnez les auront donc vus. Pix dit « requête » là où l'application dit « demande » : le Lexique relie déjà « prompt », « consigne » et « demande ».

**Recommandation** : ne rien afficher qui ressemble à un label « conforme à ». Garder ces références comme grille interne pour vérifier que rien d'important n'est oublié. Le domaine 3 de Pix (environnement, gouvernance, emploi, enjeux culturels) est volontairement laissé de côté : ce n'est pas l'objet d'un module d'usage et le sujet est politiquement chargé.

## 3. Ce que dit la recherche sur l'apprentissage de la demande

À ne pas sur-promettre : les preuves sont récentes et portent sur des élèves ou des étudiants, pas sur des adultes en fragilité numérique.

- **Exemples travaillés et retour immédiat détaillé.** Trois travaux : une intervention avec 22 étudiants novices (arXiv 2506.19107, gains en écriture de demandes), un module pour élèves du secondaire avec retour immédiat détaillé (arXiv 2508.13962), un guide d'écriture de demandes fondé sur des exemples travaillés, testé auprès de 245 étudiants (Tolzin, Knoth et Janson). Les exercices P1 à P3 s'en inspirent. L'application n'ayant aucune connexion à un assistant, le retour est fait par des règles écrites à l'avance : toujours le même, toujours calme, jamais une note.
- **Plus de contexte n'est pas mieux.** L'article d'Anthropic sur l'ingénierie du contexte (relu le 24/11/2026) parle de « context rot » : plus il y a de texte, moins l'assistant retrouve bien chaque information. Le principe : « le plus petit ensemble possible d'éléments utiles ». Il cite aussi le résumé d'une longue conversation comme technique.
- **Réduire les inventions.** Le guide d'Anthropic « Reduce hallucinations » (relu le 24/11/2026) recommande : autoriser l'assistant à dire « je ne sais pas » ; pour un long document, extraire d'abord les citations exactes puis analyser à partir d'elles ; faire citer un passage pour chaque affirmation et retirer celles qui n'ont pas de passage ; poser plusieurs fois la même question et comparer ; limiter l'assistant aux documents fournis. Le guide précise que ces techniques réduisent les inventions sans les supprimer.
- **La flatterie.** Une étude parue dans Science en mars 2026 (équipe de Stanford, onze modèles testés) rapporte que les assistants approuvent les actions de l'utilisateur environ 49 % de plus que ne le font des personnes. Relu le 24/11/2026 par la version préliminaire (arXiv) et par l'article de l'agence AP lu en entier ; la page de la revue est fermée au public (voir le paragraphe 5 bis).

## 4. Propositions pour les personnes (pédagogie interactive)

La maquette `docs/maquettes/maquette-bien-utiliser-ia-exercices-2026-11-24.html` montre les quatre exercices, câblés, avec des cas inventés. Tout est calculé sur la page, rien ne part nulle part, aucune note, aucun enregistrement.

| N° | Proposition | Ce que la personne fait | Effort | Verdict |
|---|---|---|---|---|
| **P1** | **Réparer une demande** | Voit une demande vague (« Aide-moi pour l'école »), coche ce que l'assistant ne peut pas deviner parmi les six éléments, puis voit ce qui manque et la même demande réparée en six blocs de couleur | moyen | GO |
| **P2** | **Repérer ce qui se vérifie** | Lit une réponse d'assistant (cas inventé) et touche les phrases qu'elle vérifierait. L'écran montre que tout ce qui est daté, chiffré, nommé ou cité (une « loi de 2019 », par exemple) se vérifie | moyen | GO |
| **P3** | **Avant et après** | Voit deux demandes du même besoin et les réponses qu'elles donnent (écrites à la main, présentées comme exemples) | bas | GO |
| **P4** | **Quand ne pas lui demander** | Lit quatre situations (urgence, grande décision, réponse qui doit être exacte, texte sur d'autres personnes) et la bonne source | bas | GO, formulation à sourcer |

Points d'attention honnêtes :
- **P2 ne demande jamais de « trouver l'erreur »**, car personne ne peut savoir seul ce qui est inventé. L'exercice apprend un réflexe vérifiable : tout fait précis se contrôle. Les cas sont inventés de bout en bout (association, loi et nom fictifs), jamais un organisme ou un texte réel.
- **P3** montre des réponses écrites par moi. Une vraie réponse sera un peu différente : le message est écrit à l'écran.
- **P4** touche à la santé et à l'urgence : le texte reste court, calme, et renvoie vers une personne ou les secours, sans numéro cité de mémoire.
- **Où les placer** : P1, P2 et P3 dans le chemin 1, au niveau « Pour aller plus loin », sous la forme d'un écran « S'entraîner ». P4 dans le chemin 4. Le patron de code existe (données dans `data/`, logique pure testée sous Node, écran dans `modules/`), c'est le même travail que le chemin 4.
- **Jamais de note, de score ni de classement.** Le retour d'un exercice porte sur la demande ou sur la réponse, jamais sur la personne.

## 5. Propositions au-delà du prompt

Un prompt bien écrit n'est qu'une partie de ce qui fait un bon usage. Les autres leviers, du plus simple au plus avancé :

| N° | Proposition | Source | État | Effort | Verdict |
|---|---|---|---|---|---|
| **P5** | **Une conversation longue se brouille.** Pour un nouveau sujet, ouvrir une nouvelle conversation. Pour garder le fil, demander à l'assistant un court résumé et le coller au début de la suivante | Anthropic, ingénierie du contexte (« context rot », résumé de conversation) | sourcé | bas | GO |
| **P6** | **Poser deux fois et comparer.** Si un chiffre, une date ou un nom change d'une réponse à l'autre, c'est un signal à vérifier | Anthropic, « Reduce hallucinations » (comparer plusieurs réponses) | sourcé | bas | GO |
| **P7** | **Les instructions permanentes.** Un réglage où écrire une fois pour toutes ses préférences (langage simple, réponses courtes). Distinct de la mémoire. Mêmes garde-fous : ni nom ni adresse | Pages officielles d'OpenAI, d'Anthropic et de Google relues le 24/11/2026 (voir le paragraphe 5 bis) | **sourcé** (trois éditeurs) | bas | **CODÉ le 24/11/2026** |
| **P8** | **Les outils qui répondent seulement à partir de vos documents, avec le passage cité.** Intérêt direct pour les professionnels (notes, comptes rendus fidèles). Google dit que NotebookLM répond à partir des sources ajoutées et cite des extraits. Un article parle d'un changement de nom en « Gemini Notebook », non confirmé par Google. À ne nommer que sur l'écran daté des assistants. Mêmes précautions sur les documents envoyés | Page d'aide Google relue le 24/11/2026 (voir le paragraphe 5 bis) | **sourcé pour un seul outil** | moyen | **CODÉ le 24/11/2026 avec ses réserves**, sans nommer l'outil |
| **P9** | **L'assistant a tendance à vous donner raison.** Conséquence pratique : demander « quels sont les points faibles ? » ou « quels arguments iraient dans l'autre sens ? ». Utile pour un public à la confiance fragile qui pourrait prendre une approbation pour une preuve | Étude de Cheng et coll. (Science, 26/03/2026), lue par la version préliminaire et l'article de l'agence AP ; la page de la revue est fermée au public | **sourcé pour le fait, pas pour le remède** | bas | **CODÉ le 24/11/2026**, remède présenté comme une piste |
| **P10** | **Agents, outils connectés, « skills ».** L'assistant agit à votre place sur d'autres services | Aucune source relue | non traité | | **NO GO pour le public** : change trop vite, risque pour les données, aucun besoin de ce public. Une mention « D'autres fonctions existent » suffit |

Un mot de prudence sur P5 : l'exemple de phrase (« résume en cinq lignes ce que nous avons décidé ») est une phrase d'explication, pas un prompt de l'application. Si vous préférez que je ne l'écrive pas, le texte peut rester sans exemple de phrase.

## 5 bis. P7 à P9 sourcés (lecture du 24/11/2026) et textes proposés

Ce que les pages disent vraiment, et ce qu'elles ne disent pas. Rien de ce paragraphe n'est codé.

**P7, les instructions permanentes (trois éditeurs lus).**
- OpenAI (page lue) : « Custom instructions allow you to share anything you'd like ChatGPT to consider in its response. » Elles s'appliquent à toutes les conversations, sur tous les forfaits ; on les règle dans « Personnalisation » et on les coupe avec l'interrupteur « Enable customization ». La page dit aussi que les informations issues de ces instructions servent à améliorer le modèle, avec une possibilité de refus. Deux phrases de la même page se contredisent sur les conversations déjà ouvertes (immédiat ou seulement les suivantes) : le texte du module n'en dit rien.
- Anthropic (page lue) : les « Instructions for Claude » sont un réglage du compte : « Any instructions you add here will be applied to all of your conversations with Claude. » Les instructions d'un projet ne valent que dans ce projet. La page ne contient aucun avertissement sur les informations sensibles.
- Google (page lue) : « Your instructions for Gemini », sous « Personal context » ; la consigne s'applique à chaque conversation ; on peut la modifier, la supprimer ou la couper ; Google dit que demander d'oublier ou d'éviter un sujet « doesn't always work perfectly ». La page est limitée à certains pays pour la mémoire, pas pour les instructions.
- Pas relus : Copilot, Le Chat, DeepSeek, Perplexity. Le texte dit donc « plusieurs assistants », jamais « tous ».
- Garde-fou ajouté par le module (pas par les éditeurs) : même précaution que pour la mémoire, ni nom ni adresse ni rien de personnel, car ce texte accompagne chaque demande. Aucun nombre de caractères n'est cité (il change selon le forfait).

**P8, répondre seulement à partir de vos documents (un seul outil lu).**
- Google (page « Gemini Notebook Help » lue ; l'adresse d'assistance dit encore notebooklm) : l'outil répond à partir des sources, et « If the answer isn't in the source material, it won't provide a response. » Mais les citations ne sont pas systématiques : pour une source très courte, il renvoie au document entier sans passage précis. La page dit « Your data will never be shared by Gemini Notebook » et ne dit pas si les documents servent à entraîner les modèles. Il faut avoir vérifié son âge ; un compte professionnel ou scolaire demande l'accord de l'administrateur.
- Le changement de nom est donc plausible (le titre de la page a changé) mais jamais annoncé noir sur blanc : l'outil ne sera pas nommé. Le texte décrit le principe, pas un produit.
- Aucun autre éditeur lu : le texte dit « certains outils ». À ne pas généraliser.
- Précaution à écrire : le passage cité se retrouve dans votre document, vous ne le croyez pas sur parole ; les documents envoyés suivent les mêmes règles que n'importe quel texte (sans noms ni numéros), car rien ne dit qu'ils ne servent pas à améliorer l'outil.

**P9, l'assistant a tendance à vous donner raison (fait confirmé, remède non officiel).**
- L'étude : Cheng et coll., « Sycophantic AI decreases prosocial intentions and promotes dependence », Science, 26/03/2026. La page de la revue est fermée au public (erreur 403). Lus : la version préliminaire (arXiv 2510.01395 : onze modèles, deux expériences, 1 604 personnes, environ 50 % d'approbation en plus) et l'article de l'agence AP du 26/03/2026, lu en entier (onze modèles, 49 % de plus que des personnes, environ 2 400 participants). Les chiffres diffèrent un peu entre la version préliminaire et la version publiée : le texte du module n'en cite aucun.
- Ce qui est établi : les assistants approuvent plus souvent que des personnes, même pour des actes trompeurs ou nuisibles ; après un échange avec un assistant trop approbateur, les participants se sentent plus sûrs d'avoir raison et réparent moins la relation ; ils jugent pourtant ces réponses meilleures et leur font plus confiance. Le ton n'y change rien.
- Ce qui n'est PAS établi : un remède officiel. Ni Anthropic ni OpenAI ne publient de conseil à l'utilisateur. L'article d'AP rapporte des pistes de chercheurs : transformer une affirmation en question réduit l'approbation, et plus la personne est catégorique, plus l'assistant acquiesce. « Demander les points faibles » est une pratique courante mais non testée : le texte la présente comme une piste, jamais comme une garantie.

**Textes proposés (à valider par vous, rien n'est écrit dans le code).** Aucun mot « IA » hors dérogation, aucun nom d'outil, aucun chiffre.

1. **P7**, chemin 4, écran « Projets et mémoire », au niveau « Pour aller plus loin » : *« Des consignes une fois pour toutes. Plusieurs assistants permettent d'écrire une fois pour toutes vos préférences, par exemple « réponds avec des phrases courtes et des mots simples ». Elles s'appliquent ensuite à chaque conversation. Ce n'est pas la mémoire : c'est vous qui écrivez, et vous pouvez les modifier, les couper ou les effacer. Le nom et l'endroit du réglage changent selon l'assistant. Même précaution que pour la mémoire : n'y écrivez ni votre nom, ni votre adresse, ni rien de personnel, car ce texte accompagne chacune de vos demandes. Regardez aussi les réglages de confidentialité : selon l'assistant, il peut servir à l'améliorer. »*
2. **P9**, chemin 1, écran « Vérifier la réponse », au niveau « Pour aller plus loin » : *« Un assistant a tendance à vous donner raison. Des recherches récentes montrent que les assistants approuvent ce que vous faites plus souvent que ne le feraient des personnes, même quand ce n'est pas une bonne idée. Une approbation n'est donc pas une preuve. Pour un choix important, essayez de lui demander les arguments contraires ou les points faibles, ou posez la question sans dire ce que vous en pensez. Ce sont des pistes, pas des garanties : parlez-en aussi à une personne de confiance. »*
3. **P8**, chemin 4, écran « Projets et mémoire » (à côté de P7), au niveau « Pour aller plus loin », avec réserves : *« Répondre seulement à partir de vos documents. Certains outils répondent uniquement à partir des documents que vous leur donnez, et disent quand la réponse n'y figure pas. Deux précautions : le passage cité n'est pas toujours indiqué, retrouvez-le vous-même dans votre document ; et les documents envoyés suivent les mêmes règles que n'importe quel texte, sans noms ni numéros, car rien ne garantit qu'ils ne servent pas à améliorer l'outil. »*

**Décision de Denis le 24/11/2026 : « Oui, les trois ». P7, P8 et P9 sont codés** (P9 : `BUIA_C1_E6.plus3`, niveau « Pour aller plus loin » du chemin 1 ; P7 et P8 : `BUIA_C4_E6.consignes` et `documents`, écran 6 du chemin 4). Les textes codés sont ceux ci-dessus, mot pour mot, avec les apostrophes typographiques. P8 repose sur un seul éditeur : à relire à la prochaine revue de six mois, avec une deuxième source si elle existe.

## 5 ter. P13 audité (25/11/2026) : le partage passe par un fichier à part, jamais par la disquette

Audit du code réel (`js/app.js` autour des lignes 41642 et 41896, `modules/bien-utiliser-ia/gardeLogique.js`) :
- **La disquette ne peut pas servir au partage.** Elle contient toute la session (CV, lettres, coordonnées), et son importation REMPLACE tout ce que la personne a. Envoyer sa disquette livrerait des données personnelles et écraserait le travail du collègue.
- **Simple (reprise de l'existant).** `buiaGardeImporter` revérifie déjà tout (types, longueurs, 20 demandes au plus, modèles inconnus écartés) ; le texte à traiter et le courrier sont déjà vidés avant toute sauvegarde ; l'affichage échappe les textes ; le téléchargement (`telechargerFichierTexte`) et la lecture d'un fichier existent. Aucune modification de `app.js` ni de la disquette.
- **Risqué.** Données personnelles écrites dans but, situation ou exemple (l'application ne sait pas reconnaître un nom : seule parade, montrer ce qui part et demander de relire) ; une demande de même nom en remplacerait une autre (à la réception, garder les deux avec « (reçue) » et renuméroter les identifiants) ; plafond de 20 demandes (dire combien sont ajoutées) ; texte venu d'un tiers (lu, jamais envoyé automatiquement) ; messageries qui bloquent les fichiers .json.
- **Bloquant : rien.** Coût moyen : une logique d'export et de fusion (pure, testée), deux boutons, des messages.

## 6 bis. Maquette de P13 (25/11/2026)

`docs/maquettes/maquette-bien-utiliser-ia-partager-mes-demandes-2026-11-25.html` : le fichier s'enregistre vraiment (`demandes-partagees-JJ-MM-AAAA.json`, format `{ type: 'demandes-partagees', version: 1, demandes: [...] }`) et se rouvre dans l'onglet « Recevoir ». Les cinq recommandations ont été validées par Denis le 25/11/2026 (« Oui, les cinq ») et codées. Les cinq choix étaient (recommandation en premier) : case « J'ai relu » avant d'enregistrer ; lire le contenu avant d'ajouter ; même nom = garder les deux avec « (reçue) » ; bouton de réception dans « Pour les professionnels » ; nom du fichier avec la date. Codé : logique pure `buiaPartage*` dans `gardeLogique.js` (export, lecture d'un fichier reçu, ajout, lignes montrées avant l'envoi), textes `BUIA_PARTAGE_T` dans `data/buiaLibreTextes.js`, interface dans `modelesUi.js` (cases dans « Mes demandes », bloc « Recevoir » dans « Pour les professionnels »), `tests/bienUtiliserIaPartage.test.js` (21 tests). Ni `js/app.js` ni la disquette ne sont modifiés. La lecture d'une demande de la disquette passe désormais par une seule fonction `_buiaGPropre`, partagée avec le fichier reçu (comportement inchangé, vérifié par test). Règle de Denis du 25/11/2026 : toute date, même dans un nom de fichier enregistré, s'écrit jour-mois-année (voir `dateFichierFr`, `modules/cv-core/dates.js`) ; le fichier s'appelle donc `demandes-partagees-25-11-2026.json`. Limites écrites en dur : 20 demandes gardées, 100 lues par fichier, fichier de 2 Mo au plus.

## 6. Pour votre pratique à vous (essais, conseil, professionnels)

1. **Avant d'essayer les modèles : conversation temporaire ou mémoire coupée.** ChatGPT propose avant de commencer une conversation temporaire non personnalisée (aucun souvenir ni instruction personnalisée ne s'applique, et rien n'est retenu après). Claude a le mode incognito et, par conversation, la possibilité de couper la mémoire. Copilot a un interrupteur « Saved memories ». Gemini a un réglage « Memory » et des « Temporary Chats ». Sans cela, un test de prompt peut être faussé par ce que l'assistant sait déjà de vous, et deux essais ne seront plus comparables. Sources : voir l'annexe.
2. **Une conversation par tâche, un résumé en fin de séance.** C'est P5 appliqué à votre travail.
3. **Pour un long document : citations d'abord, analyse ensuite.** Le guide d'Anthropic recommande cette méthode pour les documents très longs (il cite plus de 20 000 « tokens », soit environ trente pages). C'est déjà l'esprit du modèle de synthèse de notes.
4. **Un deuxième assistant comme relecteur.** Donnez-lui la réponse du premier avec la consigne « cherche ce qui pourrait être faux ou manquer ». Deux assistants qui se trompent de la même façon sont rares.
5. **Un jeu de trois cas fictifs, rejoué après chaque changement d'assistant.** Vous le faites déjà pour les courriers A, B, C. Les assistants changent de version sans prévenir : une demande qui marche aujourd'hui peut se comporter autrement dans trois mois.
6. **Pour les professionnels que vous formez : « les questions à poser à ma structure »** (P11 ci-dessous), plutôt qu'une règle écrite à leur place.

| N° | Proposition pour les professionnels | Effort | Verdict |
|---|---|---|---|
| **P11** | **Questions à poser à sa structure avant d'utiliser un assistant** : quels assistants sont autorisés, quelles informations ne jamais envoyer, qui est responsable de la vérification, où conserver les textes produits. Liste de questions, jamais de règle formulée à la place de la structure (décision déjà prise le 22/11/2026). S'appuie sur la compétence Pix 2.5 (charte d'usage dans une organisation) | bas | GO |
| **P12** | **Grille d'essai imprimable** : trois cas fictifs, une grille de relecture, un numéro de version, pour tester ses propres demandes. Prolonge ce que le chemin 3 dit déjà (« testez sur un cas imaginaire ») | bas | GO |
| **P13** | **Partager ses demandes entre collègues** (export et import d'un fichier). Dépend de la disquette : audit du code à faire avant toute promesse | moyen | AUDITÉ et MAQUETTÉ le 25/11/2026 ; **CODÉ le 25/11/2026** après validation des cinq recommandations par Denis (paragraphe 6 bis) |

## 7. Vos décisions (une recommandation et les bénéfices et risques de chaque option)

**Décision A : les exercices (P1 à P4).**

- **Option 1, recommandée : coder P1, P2 et P4 maintenant, P3 après.** Bénéfice : ce sont les trois propositions les mieux appuyées (Pix 2.2 « évaluer la réponse », études sur les exemples travaillés, DigComp « quand interagir »). Risque : du contenu en plus à tester par vous avant l'ouverture, donc une ouverture un peu plus tardive.
- **Option 2 : tout coder maintenant (P1 à P4).** Bénéfice : un module plus complet à l'ouverture. Risque : plus de choses à valider en même temps que vos essais des modèles.
- **Option 3 : rien avant l'ouverture, tout en version 2.** Bénéfice : vous testez ce qui existe et ouvrez plus vite. Risque : le module à l'ouverture enseigne à écrire mais n'entraîne pas à vérifier, alors que vérifier est la compétence la plus utile.

**Décision B : le contenu au-delà du prompt (P5 à P9).**

*Tranchée le 24/11/2026 : option 1. P5 (écran 7) et P6 (écran 6) du chemin 1 sont codés, au niveau « Pour aller plus loin ». P7, P8 et P9 restent à sourcer.*

- **Option 1, recommandée : ajouter maintenant P5 et P6 (déjà sourcés, deux textes courts sur des écrans existants), puis sourcer P7, P8 et P9 dans une prochaine séance.** Bénéfice : du contenu fiable tout de suite, pas de texte non vérifié. Risque : quelques semaines de plus pour les trois autres.
- **Option 2 : tout sourcer et tout coder d'un coup.** Bénéfice : un seul passage. Risque : P8 et P9 demandent de lire plusieurs pages officielles : séance longue, et rien ne sera visible avant la fin.
- **Option 3 : s'en tenir au prompt.** Bénéfice : un module plus simple. Risque : une personne qui progresse butera sur la mémoire, les longues conversations et la flatterie sans qu'aucun écran ne l'ait prévenue.

**Décision C : les professionnels (P11, P12, P13).** *Tranchée le 24/11/2026 : P11 et P12 codés dans la famille « Pour les professionnels » du chemin 2 ; la grille P12 se lit à l'écran, sans bouton d'impression (consigne 588). P13 reste à auditer.* Recommandation : P11 et P12 avec la décision A (peu de travail, forte valeur pour un professionnel), P13 seulement après l'audit de la disquette. Risque principal de P11 : paraître donner une règle ; le texte reste une liste de questions.

**Décision D : les références (Pix, DigComp, AILit).** *Tranchée le 25/11/2026 par Denis : option 1, grille interne seulement, avec la grille écrite dans `docs/GRILLE_REFERENTIELS_BIEN_UTILISER_L_IA_2026-11-25.md` ; rien n'est affiché dans l'application.* Recommandation : grille interne seulement, aucun logo ni mention « conforme ». Bénéfice : aucune promesse de conformité à tenir. Risque : néant côté public ; côté partenaire, une mention éventuelle se déciderait avec lui.

## 8. Ce qui n'a pas été fait, et pourquoi

- **2b** (deux réglages du chemin 3) : votre décision seule, aucune modification de prompt par Claude.
- **2e** : à valider par vous (voir le paragraphe 1).
- **2f** : présentation et vidéo, une seule fois, à la fin.
- **Vos essais des modèles** : à faire avec la mémoire coupée (paragraphe 6).
- **Consigne 599** (« fiche de départ » sur la disquette) : à reproposer après vos essais.
- **Décisions de Denis du 25/11/2026 sur les idées restantes** :
  - « S'entraîner à demander » avec une réponse d'assistant collée, puis sa version étroite « Comparer la réponse à mon papier » : **ABANDONNÉS** (ne pas reproposer sans fait nouveau). Raison : l'écran ne peut pas dire si une réponse est juste, un repérage automatique risque de donner une fausse assurance, et le module enseigne déjà ce réflexe (exercice « Repérer ce qui se vérifie », chemin 3 écran 2).
  - Version imprimable de la grille d'essai : écartée (« ça ne sert à rien »).
  - Fiche de départ (consigne 599) : expliquée, à reproposer après les essais, en version minimale, pas avant l'ouverture.
  - Relecture tous les six mois : validée (tâche programmée à créer le jour de l'ouverture, voir `docs/OUVERTURE_BIEN_UTILISER_L_IA.md`).
  - AILit : grille renseignée à partir des 19 intitulés ; le PDF complet n'est pas nécessaire ; reste à décider (avec sources) le sujet « un texte écrit avec un assistant est-il encore le mien ? ».
  - Vidéo et présentation : tout à la fin.
- **Tâche programmée du jour** « Reprendre les niveaux d'accès des métiers (MétierScope) » : non lancée, elle attend votre accord.

## Annexe : registre des sources relues (24/11/2026)

À revoir tous les six mois. Les pages d'aide changent de nom et de contenu.

| Affirmation | Source | Lecture |
|---|---|---|
| Couper la mémoire n'efface pas les souvenirs ; supprimer un chat non plus ; conversation temporaire sans souvenir | OpenAI, `help.openai.com/en/articles/8590148-memory-faq` | page lue |
| Mémoire active par défaut (gratuit compris) ; incognito ; mémoire coupée par conversation ; mémoire de projet séparée ; sujets sensibles non retenus par défaut | Anthropic, `support.claude.com`, article 11817273 | page lue |
| Interrupteur « Saved memories » ; désactiver n'efface pas ; supprimer un chat n'efface pas les souvenirs | Microsoft, `support.microsoft.com`, « Manage Copilot Memory » | résultat de recherche sur la page |
| Réglage « Memory » ; désactiver n'efface pas les conversations passées | Google, `support.google.com/gemini/answer/16598469` | résultat de recherche sur la page |
| Plus de contexte n'est pas mieux ; résumé de conversation ; exemples variés | Anthropic, `anthropic.com/engineering/effective-context-engineering-for-ai-agents` | page lue |
| Autoriser « je ne sais pas » ; citations d'abord ; vérification par citation ; comparer plusieurs réponses ; ces techniques ne suppriment pas les inventions | Anthropic, `platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations` | page lue |
| Compétences en IA, niveaux novice, indépendant, avancé ; requêtes, vérification, charte d'usage | Pix, référentiel IA v1.5 de janvier 2026 (document de travail), `dane.web.ac-grenoble.fr`, `pix_referentiel_ia_v1.5_janvier_2026.pdf` | PDF lu |
| Parcours Pix IA obligatoires à la rentrée 2026-2027 pour la 4e, la seconde et la première année de CAP | Académie de Paris, `ac-paris.fr/pix-ia-133911` | résultat de recherche |
| Cadre AILit (quatre dimensions, dix-neuf compétences), publié le 18 juin 2026 | Commission européenne, `education.ec.europa.eu/node/3537` | page de présentation lue, texte complet non lu |
| NotebookLM (page « Gemini Notebook Help ») : répond à partir des sources, ne répond pas si la réponse n'y figure pas, citations non systématiques, données « never shared » sans mention de l'entraînement | Google, `support.google.com/notebooklm/answer/16269187` | page lue |
| Exemples travaillés et retour détaillé | arXiv 2506.19107 ; arXiv 2508.13962 ; Tolzin, Knoth, Janson | résultats de recherche seulement |
| Flatterie : onze modèles, approbation plus fréquente que chez des personnes (49 % dans la version publiée selon AP, 50 % dans la version préliminaire), effets sur les participants | Cheng et coll., Science, 26/03/2026 ; arXiv 2510.01395 ; AP du 26/03/2026 | version préliminaire lue (résumé), article AP lu en entier ; page de la revue en erreur 403 |
| Aucun conseil officiel d'éditeur pour réduire la flatterie ; pistes de chercheurs rapportées par AP | Anthropic, `anthropic.com/research/towards-understanding-sycophancy-in-language-models` ; AP | résultat de recherche seulement pour Anthropic |
| Instructions permanentes ChatGPT : toutes les conversations, interrupteur, données utilisées pour améliorer le modèle avec refus possible | OpenAI, `help.openai.com/en/articles/8096356-chatgpt-custom-instructions` | page lue |
| Instructions de profil de Claude : tout le compte, distinctes des projets | Anthropic, `support.claude.com/en/articles/10185728` | page lue |
| « Your instructions for Gemini » : chaque conversation, modifiables, supprimables, désactivables ; oubli d'un sujet « pas toujours parfait » | Google, `support.google.com/gemini/answer/16598625` | page lue |
