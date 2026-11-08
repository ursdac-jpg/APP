# Aide aux courriers administratifs : analyse du pour et du contre (07/11/2026)

> Demande de Denis (consigne 163) : une analyse poussée pour savoir si ce module apporte une vraie plus-value, ou si n'importe qui peut obtenir la même qualité sur ChatGPT et que l'on s'encombre pour rien.
> Statut : analyse rendue, décision à prendre par Denis. Rien n'est codé.
> Complète la première évaluation de `docs/IDEES_A_RECLASSER.md` (« Aide rédactionnelle pour les courriers administratifs »), qui répondait seulement à « est-ce faisable ? ». Ici on répond à « est-ce utile ? ».

---

## 1. La question, posée clairement

Deux questions différentes se cachaient dans « faire des courriers avec des prompts » :

1. **La qualité du texte.** Un assistant en ligne gratuit écrit-il aussi bien que ce que ferait APP ? Réponse : oui, c'est le même type de modèle. APP n'écrit pas mieux que ChatGPT.
2. **Tout ce qui entoure le texte.** Savoir quel courrier envoyer, à qui, avec quels faits, quelles pièces, avant quelle date, avec quelles règles exactes, sans livrer ses données de santé à n'importe quel outil. Là, une personne seule devant ChatGPT est mal outillée, et c'est le seul endroit où APP pourrait apporter quelque chose.

Toute la décision tient à ceci : **la valeur n'est pas dans la rédaction, elle est dans le cadrage.**

---

## 2. Ce que montre la recherche (sources, avec leurs limites)

| Constat | Source | Limite à connaître |
|---|---|---|
| Environ 1 foyer éligible sur 3 ne perçoit pas le RSA (non-recours entre 33 et 37 %, données fin 2021). Les plus âgés sont freinés par les démarches en ligne, les plus jeunes par la méconnaissance de leurs droits. | DREES, étude de 2026 (via vie-publique.fr) | Chiffre sur le RSA seulement ; aucune donnée trouvée sur le courrier lui-même comme cause du non-recours. |
| La dématérialisation continue d'écarter les personnes âgées, non diplômées, handicapées ou en difficulté de lecture. Le maintien de l'accueil physique doit rester le principe. 38 recommandations. | Défenseure des droits, rapport de février 2022 | Rapport de 2022. |
| 17 % de la population en illectronisme selon l'Insee (chiffre cité dans une question parlementaire). | Question écrite à l'Assemblée nationale | Source de seconde main. |
| 48 % des Français utilisent l'IA générative (juin 2025), dont 63 % surtout ChatGPT ; seuls 19 % paient. | Baromètre du numérique du Crédoc, février 2026 | **Aucune donnée trouvée par diplôme ni pour les demandeurs d'emploi.** On ne peut donc pas dire quelle part de notre public s'en sert déjà. |
| Les assistants généralistes se trompent beaucoup sur le droit : 58 à 82 % de réponses erronées sur des questions juridiques dans l'étude de Stanford la plus citée ; les outils juridiques spécialisés se trompent encore dans plus de 17 % des cas. Ils inventent des références. | Stanford HAI, 2024 | Étude de 2023 à 2024 : les modèles ont progressé depuis. À prendre comme un ordre de grandeur du risque, pas comme un chiffre actuel. |
| Les modèles de lettre gratuits existent déjà en grand nombre (CAF, remise de dette, recours gracieux), y compris un formulaire officiel de la CAF. Mais beaucoup viennent de sites commerciaux qui mêlent conseil et publicité. | Recherche web du 07/11/2026 | Je n'ai pas pu ouvrir le modèle officiel de service-public.fr ; à vérifier. |
| Pour le « projet de vie » MDPH, **la MDPH a l'obligation d'aider** la personne qui le demande ; des permanences associatives, des écrivains publics et un guide de la CNSA existent. Les guides conseillent un texte court (2 à 3 pages) appuyé sur des pièces. **La partie « projet de vie » a été rebaptisée « vie quotidienne » dans le dossier actuel**, alors que beaucoup de documents gardent l'ancien nom. | CNSA, APF, Mon Parcours Handicap | À vérifier sur le formulaire en vigueur de la MDPH du département. |
| Aucun outil gratuit destiné au public et dédié à ces courriers n'a été trouvé. Il y a des prestataires payants (environ 17 euros le courrier), un écrivain public numérique en mairie, et une application d'aide administrative générale (non examinée). | Recherche web du 07/11/2026 | **Une recherche ne prouve pas l'absence.** À confirmer avant de s'appuyer sur « personne ne le fait ». |
| Les outils grand public peuvent conserver ce qu'on y écrit ; la HAS déconseille d'y saisir des informations de santé identifiantes. | HAS (synthèse de juin 2026), CNIL | La CNIL n'a pas de page pour les particuliers aussi nette ; une partie vient de résumés de seconde main. |

---

## 3. Les arguments POUR

1. **Le besoin est réel et documenté.** Non-recours, difficultés face au numérique, courriers redoutés : la fragilité du public n'est pas une hypothèse.
2. **Le blocage est rarement la belle phrase.** C'est de savoir par où commencer, quoi dire, quoi joindre, avant quand. C'est exactement ce qu'un parcours guidé résout et qu'une page blanche de ChatGPT ne résout pas.
3. **Notre base vérifiée est un vrai avantage.** « Comprendre le cadre » contient des fiches datées et sourcées (contester une décision, handicap et RQTH, surendettement, aide juridictionnelle, discrimination). Les injecter dans la demande évite que l'assistant invente un article de loi ou un délai. C'est ce qui manque à ChatGPT, et ce qu'aucun concurrent gratuit trouvé n'a.
4. **Le circuit existe déjà.** Demande à coller, réponse à recoller, éditeur, export Word, masquage des noms : l'essentiel des briques existe déjà (audit rapide du 07/11/2026, pas un chiffrage). Un prototype ne demande pas un nouveau module.
5. **Cohérence avec la mission.** Les freins périphériques (dettes, santé, logement, droits) bloquent un parcours professionnel. L'application a déjà un répertoire des freins. Un courrier pour contester une radiation ou expliquer une absence à France Travail touche directement l'emploi.
6. **Une valeur de relais.** Dire à la personne : « la MDPH doit vous aider à écrire ce texte, voici comment demander », ou « un écrivain public numérique existe en mairie ». Ce conseil vaut parfois plus que le courrier.

---

## 4. Les arguments CONTRE

1. **Sur le texte seul, ChatGPT fait aussi bien, gratuitement.** Pour une personne à l'aise, APP n'ajoute rien. Une partie de notre public s'en sert peut-être déjà (près d'un Français sur deux), sans que nous sachions laquelle.
2. **Le texte est déjà disponible partout.** Modèles gratuits, formulaire officiel CAF, écrivains publics, permanences associatives, obligation d'aide de la MDPH. L'espace libre n'est pas « un courrier », mais « un parcours guidé et sûr ».
3. **Le risque est plus lourd que pour un CV.** Un CV raté fait perdre une chance ; un courrier à la CAF ou à la MDPH peut faire rater un délai de recours (souvent de l'ordre de deux mois, à vérifier cas par cas) ou une aide. Si une fiche est périmée ou si la personne envoie sans relire, la conséquence est réelle. APP ne connaît pas le dossier et ne peut pas promettre le résultat.
4. **Données sensibles.** La santé (MDPH), les ressources et les dettes (CAF) seraient collées chez un assistant extérieur. Le masquage des noms ne suffit pas toujours : « je suis atteint de telle maladie, je touche telle somme » reste identifiant dans son contexte.
5. **Un courrier personnel doit rester personnel.** Pour un « projet de vie », un texte qui sonne généré peut desservir la personne. Notre garde-fou « voix humaine » aide, mais le risque existe.
6. **Un poids d'entretien neuf, porté par une seule personne.** Chaque type de courrier est une fiche de données à tenir à jour (noms des commissions, délais, adresses, formulaires : le seul exemple « projet de vie » devenu « vie quotidienne » le montre). Cinq à dix types, revérifiés tous les six mois, c'est un nouveau chantier permanent, même avec l'outil de veille.
7. **Le coût d'opportunité.** L'application est déjà très large ; il reste des essais, l'accessibilité et le découpage de `js/app.js` (environ 30 900 lignes). Ajouter un domaine juridique et administratif retarde ces chantiers.
8. **Un public cible fragile et une responsabilité diffuse.** Quand l'application propose « un courrier pour la CAF », la personne comprend « c'est bon, je peux envoyer ». Il faut un avertissement qui soit lu, ce qui est difficile avec ce public.

---

## 5. Ce qu'APP pourrait apporter que ChatGPT n'apporte pas (classé par valeur réelle)

| Rang | Apport | Pourquoi ChatGPT seul ne le fait pas | Coût |
|---|---|---|---|
| 1 | **Questions simples sur la situation** (qui, quoi, quand, ce qui s'est passé), au lieu d'une page blanche | La personne ne sait pas quoi demander ni quels faits donner | Bas |
| 2 | **Règles exactes tirées de nos fiches vérifiées** (délai, nom de la commission, pièces à joindre, où envoyer) | Il invente ou donne des règles périmées | Moyen, puis entretien |
| 3 | **Avant l'envoi : masquage et avertissement simple** | Aucun cadre de protection | Bas, existe déjà |
| 4 | **Liste de contrôle après le texte** : pièces, date, recommandé, copie à garder | Ne l'ajoute pas toujours, jamais adapté au cas | Bas |
| 5 | **Relais vers l'aide humaine** (MDPH tenue d'aider, écrivain public, France Services) | Ne sait pas ce qui existe près de chez la personne | Bas |
| 6 | **Le texte lui-même** | Même qualité | Aucun apport |

Le point 2 est le seul avantage difficile à copier, et c'est aussi le plus coûteux à entretenir.

---

## 6. Une piste que le sujet cache : lire, plutôt qu'écrire

Notre public reçoit plus de courriers qu'il n'en écrit. Beaucoup de personnes ne comprennent pas la lettre reçue : que demande-t-elle, avant quand, que faire ? Une aide « Comprendre mon courrier » (expliquer en mots simples, dire le délai, proposer la suite) pourrait avoir plus de valeur que « écrire mon courrier », et rejoindre l'idée d'expliquer simplement qui traverse tout le Lexique.
**C'est mon jugement, pas un fait sourcé** : une recherche a seulement montré qu'un guide de travail social évoque un courrier CAF mis en langage simple (FALC) avec une IA. À confirmer auprès de Denis, qui connaît le terrain. Contrainte : il faudrait que la personne dépose un courrier, donc des données sensibles et un traitement d'image.

---

## 7. Les options

**Option A : ne pas construire (garder l'idée en réserve).**
Bénéfice : zéro entretien, aucun risque. Risque : on laisse sans réponse un besoin documenté.

**Option B : un essai minimal sur UN seul type de courrier (recommandé, avec un essai préalable).**
Un bouton « Préparer mon courrier » dans une fiche existante de « Comprendre le cadre », qui réutilise le circuit actuel avec UN prompt socle et UNE fiche de données. Si le résultat est bon, on étend ; sinon on s'arrête sans avoir bâti un module.
Bénéfice : on apprend avant d'investir ; peu de code ; entretien limité à une fiche. Risque : un seul type peut faire croire que tout le reste suivra ; il faut s'arrêter franchement si l'essai déçoit.

**Option C : le module complet (5 à 10 types).**
Bénéfice : une vraie entrée « Courriers », cohérente. Risque : entretien lourd, risque juridique multiplié, retard sur les autres chantiers. **Je le déconseille aujourd'hui.**

**Option D : « Comprendre mon courrier » d'abord.**
Bénéfice : probablement plus utile et rejoint la vocation du Lexique. Risque : traitement d'un document reçu, donc données sensibles et risque de mal expliquer un délai ; à évaluer avant de promettre.

### Recommandation

**B, avec un essai préalable de Denis, et D à évaluer ensuite.** Pas C.

**Changement par rapport à ma première évaluation** : je recommandais de tester un parcours « MDPH, projet de vie ». Je ne le recommande plus pour commencer : données de santé, texte très personnel, intitulé en train de changer, et la MDPH est déjà tenue d'aider. Je recommande plutôt, pour l'essai :
1. **France Travail : contester une radiation ou expliquer une absence** (le plus proche de la mission de l'application, peu de données de santé), ou
2. **CAF : demande de remise de dette** (cadre précis, formulaire officiel existant, enjeu fort mais sans données de santé).

### Essai préalable de Denis (30 minutes, sans code)

Prendre une situation réelle ou plausible (par exemple une radiation France Travail), la décrire à ChatGPT en une phrase, comme le ferait une personne du public. Noter :
- Le courrier est-il utilisable tel quel ?
- Cite-t-il un article ou un délai ? Est-il exact (à comparer avec nos fiches) ?
- Dit-il quoi joindre, où envoyer, avant quand ?
- A-t-il demandé des précisions, ou a-t-il tout inventé ?

Si ChatGPT répond bien sur tout cela, la plus-value d'APP est faible et il faut s'en tenir à l'option A. S'il invente des règles ou oublie les pièces et les délais, il y a une vraie place pour l'option B.

---

## 8. Limites de cette analyse (dites franchement)

- Une seule passe de recherche. Aucune donnée sur l'usage de ChatGPT par diplôme ni par situation de chômage.
- Le chiffre de Stanford est ancien et les modèles ont progressé : le risque existe, sa taille actuelle est inconnue. L'essai préalable de Denis le mesurera sur nos cas.
- « Aucun outil gratuit dédié trouvé » ne signifie pas qu'il n'existe pas.
- Je n'ai pas examiné l'application Buddy ni vérifié le modèle officiel de service-public.fr.
- Le jugement sur « lire plutôt qu'écrire » est le mien ; Denis connaît le terrain mieux que moi.

## 9. Sources

- DREES, non-recours au RSA : [vie-publique.fr](https://www.vie-publique.fr/node/303136) ; [dossier DREES](https://drees.solidarites-sante.gouv.fr/non-recours-et-acces-aux-droits)
- Défenseure des droits, dématérialisation (2022) : [Banque des Territoires](https://www.banquedesterritoires.fr/les-ravages-de-la-dematerialisation-nouveau-denonces-par-la-defenseure-des-droits)
- Crédoc, Baromètre du numérique : [Univers Freebox](https://www.universfreebox.com/article/591439/chatgpt-gemini-le-chat-lia-generative-explose-en-france-pres-dun-francais-sur-deux-deja-utilisateur/amp) ; [Banque des Territoires](https://www.banquedesterritoires.fr/barometre-du-numerique-comment-lia-dessine-de-nouvelles-fractures)
- Stanford HAI, erreurs des outils juridiques : [hai.stanford.edu](https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-or-more-benchmarking-queries)
- MDPH, aide à la formulation du projet de vie : [CNSA](https://www.cnsa.fr/documentation/fs-interparcours_13-aide_formulation_projet_de_vie.pdf) ; [Mon Parcours Handicap](https://www.monparcourshandicap.gouv.fr/index.php/aides/le-depot-du-dossier-et-le-traitement-de-la-demande-par-la-maison-departementale-des-personnes)
- Modèles de lettre CAF : [formulaire CAF](https://www.caf.fr/sites/default/files/medias/301/dette/RE%206%20forml.pdf) ; [aide-sociale.fr](https://www.aide-sociale.fr/demande-remise-de-dette-caf)
- HAS, repères pour les usagers de l'IA en santé : [has-sante.fr](https://has-sante.fr/jcms/p_4092354/fr/intelligence-artificielle-en-sante-la-has-publie-des-reperes-pour-les-usagers)
