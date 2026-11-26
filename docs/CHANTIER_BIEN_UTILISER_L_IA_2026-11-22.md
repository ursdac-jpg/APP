# Chantier « Bien utiliser l'IA » : module pour apprendre à écrire ses demandes (prompts)

> **MISE À JOUR du 25/11/2026 : le module est codé (neuf commits du 24/11) et OUVERT AU PUBLIC (consigne 602, commit 9e24b117). État réel : `docs/ETAT_DES_CHANTIERS.md`. Le texte ci-dessous est l'historique du cadrage du 22/11.** Créé le 22/11/2026 à la demande de Denis (consigne 568). **À l'époque, rien n'était codé, aucune maquette détaillée.** État : concept grossier validé, carte de faisabilité rendue (GO AVEC RÉSERVES), nom tranché. Prochaine étape : la maquette détaillée, en Mode A, effort haut. À ne pas engager avant la fin des essais d'« Explorer les métiers » (Denis finit avant de passer à la suite).
> Le document Word d'origine de Denis (`Doc3.docx`, quatre captures d'une formation en visio) a servi d'inspiration pour la structure seulement : les textes sont à réécrire, rien n'est à recopier.

## 1. Décisions de Denis (22/11/2026), à ne pas rouvrir

- **Un module pédagogique** : aider les personnes à faire leur propre prompt, pour la recherche d'emploi, les papiers, les mails, la rédaction, la synthèse. Question de départ : « Comment fait-on un très bon prompt ? »
- **Les deux options à la fois** : pédagogie pure ET modèles à compléter, dans un seul module à **trois portes** : « Comprendre l'essentiel », « Mes modèles à compléter », « Pour les professionnels ».
- **Deux publics** : les personnes accompagnées ET les professionnels (conseillers et autres), qui sont très bons dans leur métier mais ne savent pas écrire leurs prompts, surtout de synthèse et de rédaction. Denis juge le module « encore plus bénéfique pour le professionnel ». Argument de fond : l'application parle d'autonomie, elle ne peut pas ignorer la compétence clé du moment.
- **Emplacement** : carte « Boîte à outils » de l'accueil.
- **Dérogation au mot « IA »** : dans ce module, et dans ses fiches du Lexique, on parle clairement d'IA et d'intelligence artificielle. Partout ailleurs, la règle reste entière (« l'assistant en ligne »). Jamais d'icône de robot ni de visage, même ici.
- **Nom : « Bien utiliser l'IA »**, sous-titre proposé « Apprenez à écrire une demande claire et à vérifier la réponse ». « Bien demander à l'IA » a été refusé (« médiocre »).
- **Lexique** : créer des fiches « IA » et « prompt », et d'autres si utile (proposition : cinq, voir le paragraphe 6).

## 2. Concept grossier (validé)

Trois blocs montrés à Denis : l'entrée à trois portes, l'écran de l'idée (quatre ingrédients et l'astuce « laissez-le vous poser les questions »), et un exemple Avant / Après de synthèse avec, en tête, le rappel de protection des données.

- **Porte 1, « Comprendre l'essentiel »** : l'idée en une phrase (l'IA ne devine pas, elle complète ce que vous écrivez), puis les bases, par petits écrans.
- **Porte 2, « Mes modèles à compléter »** : des demandes prêtes avec des trous à remplir, un assemblage en direct, un bouton « Copier ma demande ». Rien n'est envoyé ailleurs.
- **Porte 3, « Pour les professionnels »** : rappel de protection des données en tête, puis synthèse, rédaction, relecture, chaînage, avec exemples Avant / Après.

## 2bis. Mode rapide, porte d'entrée (demandé par Denis le 22/11/2026, validé le 23/11/2026, consigne 571)

**Question de Denis** : la personne est-elle obligée de passer par les 24 techniques, ou peut-elle venir avec un besoin précis, le dire librement et accéder directement à ce qu'il lui faut, sans API ? **Réponse** : aucune obligation. Les 24 techniques sont un catalogue, pas un parcours.

**Écran d'entrée, A + B + C sur un seul écran (validé)** :
1. **Un champ** : « Dites en quelques mots ce dont vous avez besoin ». Le rappel d'anonymiser est juste au-dessus ; le texte ne quitte jamais la page et n'est jamais enregistré.
2. **A. Des boutons de situation** dessous (dix à douze situations, liste à fixer avec Denis) : fiable, la personne ne se trompe pas.
3. **B. Reconnaissance de mots** : le texte tapé fait remonter jusqu'à trois modèles à compléter, avec le même principe que la barre de recherche de l'accueil (début de mot, correspondance partielle, accents ignorés, mots de recherche écrits à la main par modèle). L'application ne comprend rien : elle compare des mots.
4. **C. « Aucun ne convient : préparer ma demande sur mesure »** (**RETIRÉE le 25/11/2026 par décision de Denis** : le bouton menait à une impasse publique et « Écrire ma propre demande » couvre déjà n'importe quel sujet ; reprise possible plus tard, avec les mesures d'usage) : l'application enveloppe le besoin dans une consigne à copier, que la personne colle dans son propre assistant (technique 21 : « Voici mon besoin : [texte]. Pose-moi les questions utiles, puis écris la meilleure demande à me faire »). C'est le seul moyen de couvrir « tout » sans API, car l'intelligence vient de l'assistant de la personne.

**Conséquences sur le concept** : le mode rapide devient la porte d'entrée ; « Comprendre l'essentiel » et « Pour les professionnels » restent accessibles depuis le même écran ; « Mes modèles à compléter » devient à la fois le résultat du mode rapide et un catalogue complet (« Voir tous les modèles »). La pédagogie se glisse dans le résultat : chaque trou du modèle porte son étiquette (« Ma situation », « Mon but », « La forme voulue »), et un lien optionnel « Pourquoi ça marche » ouvre la page correspondante de « Comprendre ». Placement exact des trois portes à trancher pendant la maquette.

**Réserves de faisabilité (GO)** :
- La reconnaissance de mots n'a pas été testée sur de vraies phrases. Test prévu : un corpus d'au moins 30 phrases réelles de personnes accompagnées ou de professionnels, fourni par Denis, rejoué contre la logique pure ; on note combien de fois un modèle pertinent figure parmi les trois proposés, et le bouton « Aucun ne convient » reste toujours présent.
- La consigne de la voie C est un prompt neuf : Denis la teste seul, Claude ne l'écrit ni ne la juge sans demande expresse (consigne 532).
- Sans API, les modèles couvrent les situations prévues (douze en première vague, environ soixante au total, voir 2ter) ; tout le reste passe par la voie C.
- Un lien direct de la barre de recherche de l'accueil vers un modèle précis demanderait un paramètre dans la recherche partagée (grep sur tout le dépôt avant) : option de version 2, pas de la version 1.

## 2ter. Élargissement : huit familles, environ soixante situations, courriers administratifs coopératifs (demandé et décidé le 23/11/2026, consigne 572)

**Demande de Denis** : douze situations, c'est le minimum ; élargir, donner des « annexes », et aider aussi à rédiger des courriers à caractère administratif, sous un nom générique (« Répondre à l'administration »), sans détailler davantage et sans la façon évidente de l'ancien module (réponses aux radiations de France Travail et autres). Un conseiller peut aussi s'en servir pour des démarches administratives.

**Décision de Denis : courriers coopératifs seulement.**
- **Retenus** : répondre à une demande de l'administration, fournir une pièce, demander une explication, un délai ou un rendez-vous, signaler un changement de situation, remplir un formulaire case par case, suivre une demande.
- **Exclus** : contestation, recours, désaccord, radiation, article de loi, menace. La décision du 07/11/2026 (APP médiateur, partenariat avec des structures comme France Travail) est maintenue pour ces cas et nuancée pour les courriers coopératifs. Les courriers argumentés restent réservés à une autre application (`docs/ANALYSE_COURRIERS_POUR_CONTRE_2026-11-07.md`).
- **Garde-fous communs à chaque modèle administratif** (écrits avec Denis, qui les teste seul, consigne 532) : ton courtois et factuel ; aucune menace ; aucun article de loi, délai, montant ou nom d'organisme inventé ; « liste ce que je dois vérifier auprès de l'organisme » ; rappel visible d'anonymiser ; une phrase douce pour la personne dont le besoin sort du cadre (désaccord, situation difficile), qui l'oriente vers une aide humaine et vers les fiches d'aide de l'application. Le titre reste générique.
- **Point d'attention** : l'application étant intégrée chez un partenaire, il serait sain de l'informer de cette fonction avant l'ouverture (à décider par Denis).

**Huit familles** (environ soixante situations, proposition de Claude, à valider) :
1. **Chercher un emploi** (12) : mail et lettre de candidature, candidature spontanée, relire mon CV face à une offre, adapter mon CV, comprendre une offre, préparer et simuler un entretien, expliquer un trou dans le parcours, remercier ou relancer, refuser poliment, décrire une expérience (bénévolat, famille) en compétences.
2. **Formation et orientation** (6) : comprendre une formation, comparer deux formations ou métiers, préparer une reconversion, demander une formation, préparer des questions pour un conseiller, demander un stage ou une immersion.
3. **Administration, coopératifs** (10) : comprendre un courrier, répondre à une demande, fournir une pièce, demander une explication, un délai ou un rendez-vous, signaler un changement, remplir un formulaire case par case, préparer un appel, lister les pièces, suivre une demande.
4. **Mails et messages** (8) : mail clair et poli, répondre, relancer, refuser, s'excuser d'un retard, demander un horaire, annoncer une difficulté, reformuler plus posé.
5. **Comprendre et apprendre** (6) : expliquer simplement, résumer, passer un document en langage simple, expliquer un mot, préparer un exposé, apprendre pas à pas.
6. **Organiser et décider** (5) : planifier mes démarches, comparer deux possibilités, avantages et inconvénients, préparer mes questions.
7. **Logement et quotidien** (3) : écrire à un propriétaire, comprendre un contrat ou une facture, écrire à un proche.
8. **Pour les professionnels** (12) : synthèse de notes, compte rendu, bilan de parcours, courrier ou mail à un partenaire, préparer un atelier, créer des exercices, passer un document en langage simple, offre d'emploi, accompagner une démarche administrative avec la personne (sans données nominatives).

**Écran d'entrée** : pas soixante boutons, mais huit familles qui ouvrent chacune leur liste, le champ libre, et les douze situations les plus demandées en raccourcis (choisies avec le corpus de phrases de Denis).

**Annexes (les deux lectures, retenues ensemble)** : des **variantes** (un point de départ ouvre des cas voisins : « mail de candidature » mène à spontanée, après un entretien, relance, remerciement) et des **compléments** ajoutables d'un clic à n'importe quel modèle, écrits une seule fois : plus court, plus simple (langage clair), ton plus chaleureux ou plus sobre, plusieurs versions, « pose-moi des questions avant », « vérifie ta réponse », « liste ce que je dois vérifier ».

**Trois vagues** : première vague, douze modèles ; deuxième, une vingtaine ; troisième, après usage réel. Chaque situation est un enregistrement de données (le code ne change pas quand on en ajoute une) ; un squelette commun défini une fois dans le code (situation, but, matière, forme, « n'invente rien ») garantit la cohérence. Le goulot est l'écriture et le test des modèles, par Denis (consigne 532) ; Claude peut préparer un brief à coller chez un autre assistant pour obtenir des brouillons à tester.

## 2quater. Première vague validée (douze situations) et comment le reste est couvert (23/11/2026)

**Validé par Denis le 23/11/2026** : douze points de départ pour la première vague, dont neuf pour tout le monde et trois pour les professionnels. D'autres vagues suivront (accord de Denis).

| N° | Situation | Annexes (variantes) | Famille |
|---|---|---|---|
| 1 | Écrire un mail de candidature | spontanée, après un entretien, relance, remerciement | Chercher un emploi |
| 2 | Relire mon CV face à une offre | points forts et points à améliorer, sans note | Chercher un emploi |
| 3 | Préparer un entretien | m'entraîner aux questions, expliquer un trou dans mon parcours | Chercher un emploi |
| 4 | Comprendre un courrier reçu | ce que je dois faire, et pour quand | Administration |
| 5 | Répondre à l'administration (coopératif) | fournir une pièce, demander une explication, un délai ou un rendez-vous, signaler un changement | Administration |
| 6 | Écrire un mail clair et poli | répondre, relancer, refuser, s'excuser d'un retard | Mails et messages |
| 7 | Reformuler ou résumer un texte | plus simple, plus court, plus posé | Comprendre et écrire |
| 8 | Me faire expliquer un mot ou un document | en langage simple, étape par étape | Comprendre et apprendre |
| 9 | Préparer un rendez-vous ou un appel | liste de questions, ce que je dois apporter | Administration et démarches |
| 10 | Pro : synthèse de notes d'entretien | sans noms, fidèle au texte, un point = un passage cité | Professionnels |
| 11 | Pro : compte rendu ou bilan | gabarit de la structure, ton neutre | Professionnels |
| 12 | Pro : passer un document en langage simple | pour les personnes accompagnées | Professionnels |

**Comment les soixante situations sont couvertes (question de Denis ; approche par couches VALIDÉE par Denis le 23/11/2026)** : il n'y a **pas un prompt par famille**, qui serait trop vague (c'est le rôle de la voie « demande sur mesure »). L'assemblage se fait en couches :
1. **Squelette commun** (dans le code, écrit une fois) : situation, but, matière, forme, « n'invente rien ».
2. **Famille** : le regroupement affiché à l'écran et des valeurs par défaut partagées (par exemple, la famille Administration porte toujours les garde-fous coopératifs).
3. **Modèle** = un point de départ : un enregistrement de données, avec ses trous étiquetés et ses mots de recherche.
4. **Variante** = un choix à l'intérieur d'un modèle qui change une phrase et quelques trous (candidature : spontanée, après un entretien, relance...). Une situation de la liste de soixante est donc un modèle ou une variante.
5. **Compléments** ajoutables d'un clic (plus court, ton, plusieurs versions, « pose-moi des questions », « vérifie ta réponse », « liste ce que je dois vérifier »).

Sans API, rien ne s'adapte tout seul : tout ce qui varie est écrit à la main dans une variante. Les exemples Avant / Après sont écrits à la main pour les modèles principaux ; les autres montrent le squelette avec ses trous étiquetés. Ce qui n'est pas prévu passe par la voie « demande sur mesure ».

**Effet** : les douze modèles de la première vague donnent accès à environ trente-cinq situations grâce aux variantes. Chaque vague suivante ajoute des modèles et des variantes (un ajout = un enregistrement de données, sans changer le code). Vague 2 : environ vingt modèles (formation, comparer, organiser, logement, exposé, mails et professionnels supplémentaires). Vague 3 : après usage réel. Chaque vague est testée et validée par Denis avant d'être ouverte.

**Écran d'entrée** : seules les familles qui ont au moins un modèle prêt sont affichées (première vague : Chercher un emploi, Administration et démarches, Mails et messages, Comprendre et écrire, Professionnels). Une famille avec un seul modèle fait pauvre : regroupement à ajuster à la maquette (par exemple joindre « Mails et messages » à « Comprendre et écrire »).

**Deux chemins (23/11/2026, consigne 578)** : chemin rapide (situation choisie, suggestions, demande construite sans papier joint) et chemin pas à pas (papier joint et masqué par la personne, premier passage de l'assistant lu par le code et mis en page, questions à réponses proposées ou libres, deuxième passage qui produit le courrier). Pourcentage « écrit par une IA » : NO GO (consigne 577), remplacé par un message de réassurance sourcé. À trancher à la maquette.

**Recherche et corpus (23/11/2026)** : sur demande de Denis, Claude a fait une recherche web (difficultés et courriers administratifs fréquents, langage clair, assistants et services publics), reconstitué un corpus de trente phrases (marquées « R ») et rédigé trois brouillons de demandes à tester par Denis seul (situations 4, 5 et 9, exception expresse à la consigne 532) : `docs/RECHERCHE_COURRIERS_ET_CORPUS_BIEN_UTILISER_L_IA_2026-11-23.md`.

## 2quinquies. Alerte d'urgence faite par le code (demandée par Denis le 23/11/2026, consigne 584)

**Idée** : l'assistant alerte déjà dans sa réponse (« votre rendez-vous est demain »). Denis veut que l'application le fasse aussi, dès que la personne colle son courrier, avant même d'envoyer la demande.

**Carte de faisabilité : GO AVEC RÉSERVES.**
- **Simple (reprise de l'existant, calcul local)** : repérer les dates écrites en toutes lettres (« 24 novembre 2026 ») ou en chiffres (« 24/11/2026 »), les comparer à la date du jour de l'appareil, et afficher sous le courrier une phrase calme : « Une date proche a été repérée dans votre courrier : mardi 24 novembre 2026 (demain). Vérifiez-la. » Rien n'est envoyé, aucune intelligence artificielle, le même résultat à chaque fois.
- **Risqué** : un courrier contient plusieurs dates (date d'envoi du courrier, date du rendez-vous, date limite). Le code ne sait pas laquelle compte. Il montrera donc la phrase du courrier où la date est écrite et laissera la personne confirmer. Les délais sans date (« dans un délai de 15 jours à compter de la réception ») ne peuvent pas être calculés : le code dit seulement « un délai est indiqué : lisez-le avec attention ».
- **Garde-fous** : ton calme, jamais « vous êtes en retard » ni « vous allez perdre vos droits » ; une date déjà passée est signalée avec douceur (« cette date est passée : vérifiez si une démarche reste à faire ») ; aucune décision à la place de la personne ; mot « urgent » évité au profit de « proche » ; la même alerte est ajoutée en tête de la demande, seulement si la personne le souhaite.
- **À trancher à la maquette** : où s'affiche l'alerte (sous le courrier collé, puis rappelée avant « Copier »), une case « j'ai vérifié » ou non, et si elle est reprise dans la demande envoyée à l'assistant.
- **Aucun point bloquant.** Prévoir un test unitaire sur une liste de formulations de dates (avec et sans accents, « 1er », « 1ᵉʳ », mois abrégés) et sur les trois courriers fictifs A, B, C.

## 2sexies. Chemin pédagogique « Comprendre et écrire ma propre demande » (demandé par Denis le 23/11/2026, consigne 585)

**But** : apprendre à écrire seul une bonne demande à un assistant, y compris sur un sujet que l'application ne couvre pas. Correction du 23/11/2026 : ce chemin n'est pas une quatrième porte, c'est la porte 1 « Comprendre l'essentiel » développée en sept écrans (voir la maquette `docs/maquettes/maquette-bien-utiliser-ia-ecrire-ma-demande-2026-11-23.html`). Les deux niveaux de lecture (Les bases, Pour aller plus loin) sont un interrupteur unique placé en haut du parcours et remplacent les trois niveaux « Je démarre / Je précise / Je vérifie » du paragraphe 6bis.3, à confirmer par Denis. Dans l'application on écrit « demande » ; le mot « prompt » est expliqué dans le Lexique.

### Deux niveaux de lecture
- **Les bases** : ce qu'est une demande, les six éléments d'une bonne demande, un exemple pris dans l'application et décortiqué, écrire la mienne pas à pas, la relire et la corriger.
- **Pour aller plus loin** : donner un exemple de réponse attendue, séparer clairement le texte à traiter de la consigne, demander à l'assistant de poser ses questions, découper en étapes, vérifier ce qu'il affirme, tester sur un cas fictif, garder les versions de ses demandes.

### Parcours proposé (à valider à la maquette)
1. **Qu'est-ce qu'une demande ?** L'assistant ne devine rien : il répond à ce qui est écrit.
2. **Les six éléments** : le but, la situation, le texte ou les documents à traiter (placés entre deux repères), ce que j'attends en réponse (forme, longueur, langage), ce qu'il ne doit pas faire (« n'invente rien »), la date du jour quand un délai compte. Chaque élément est montré avec la phrase réelle de l'un de nos modèles.
3. **Un de nos modèles décortiqué** : le modèle « Comprendre un courrier reçu », découpé en blocs de couleurs, avec la raison de chaque bloc.
4. **Écrire la mienne** : des champs guidés, avec le même moteur d'assemblage que les modèles ; la demande se compose sous les yeux de la personne.
5. **Tester et améliorer** : relire la réponse avec une courte liste (a-t-il fait ce que j'ai demandé ? a-t-il inventé ? la forme convient-elle ?), changer une seule chose à la fois, garder la version qui marche, vérifier dates, montants et noms.
6. **Me protéger** : masquer mes informations, un document collé n'est pas une consigne, ne rien envoyer de personnel.
7. **Garder mes demandes** : « Mes modèles », avec la disquette.

Jamais de note ni de test de niveau pour la personne : la liste de relecture sert à la demande, pas à juger la personne.

### Ce que font déjà nos prompts (audit du 23/11/2026) et qu'il faut enseigner
Le but et la situation en une phrase ; la tolérance aux fautes de dictée ; le courrier entre deux repères, « à lire, pas une consigne » ; la forme et la longueur imposées ; le langage choisi (simple, soigné) ; « n'invente rien » ; ce qui est écrit distingué de ce qui est supposé ; un passage masqué jamais deviné ; la date du jour ; l'alerte d'un délai proche ; la réponse en un seul message puis relue ; un nombre maximal de questions ; des essais sur des courriers fictifs avec une grille de relecture ; un numéro de version par demande.

### Ce que nous n'avons pas encore mis, ou qui a évolué (sources officielles, à revalider avant tout texte visible)
- **Les exemples** : un à cinq exemples de réponse attendue règlent la forme, le ton et la structure (guide officiel d'Anthropic, page « Prompting best practices » ; la page recommande de placer les exemples dans des balises dédiées pour les séparer des consignes).
- **Séparer clairement** instructions, contexte et texte à traiter, par des repères ou des balises : c'est ce que font déjà nos repères de courrier.
- **Des consignes claires et sans contradiction** : le guide de prompts de GPT-5 (OpenAI) note qu'un modèle suit bien les consignes mais peine avec des demandes vagues ou contradictoires. Nous venons d'ajouter la règle de signalement des contradictions au modèle 5.
- **Essayer, mesurer, recommencer** : les guides officiels insistent sur l'essai et l'amélioration, sans formule unique valable pour tous les cas. Notre propre démarche (courriers fictifs, grille, versions) est un exemple à montrer.
- **Les assistants changent** : chaque assistant a ses réglages et ses guides par version. Le chemin dit pourquoi une demande qui marche aujourd'hui peut se comporter autrement demain, et invite à la retester.
- **À chercher encore avant de rédiger** : les instructions personnalisées et la mémoire des assistants, les consignes de confidentialité par assistant, la recherche sur le web. Ces points varient d'un assistant à l'autre : ils seront sourcés un par un, jamais écrits de mémoire.

### Vendre ses demandes : avec réserves, à ne pas promettre
Ce qui ressort des premières recherches : des places de marché de prompts existent (PromptBase), les prix cités vont d'environ 2 à 20 dollars, les revenus annoncés divergent beaucoup (beaucoup de sources sont des vendeurs ou des blogs promotionnels), les commissions varient selon les sources. Côté droit français, un article d'avocat rappelle que la protection par le droit d'auteur suppose une œuvre originale (article L.111-1 du Code de la propriété intellectuelle) : un prompt purement fonctionnel peut ne pas être protégé, et ce que reçoit l'acheteur n'est pas toujours clair.

**Recommandation de Claude** : ne pas en faire un argument du chemin des personnes accompagnées (faux espoir de revenu, public en fragilité). Une courte rubrique honnête dans la porte « pour les professionnels » : « Une bonne demande a de la valeur, mais la vendre est incertain : les revenus sont irréguliers, les règles et la protection juridique varient. Renseignez-vous auprès de la plateforme et d'un professionnel. » Aucun lien vers une place de marché, aucun chiffre de gain. À décider par Denis à la maquette.

### Carte de faisabilité : GO AVEC RÉSERVES
- **Simple (reprise de l'existant)** : le moteur d'assemblage par blocs, les modèles déjà écrits comme exemples décortiqués, la disquette pour garder ses demandes, le Lexique.
- **Risqué** : (1) le contenu est abondant à rédiger et à sourcer, avec une relecture tous les six mois, car les pratiques et les assistants évoluent vite ; (2) l'atelier « écrire la mienne » ne doit pas devenir un deuxième éditeur de demandes à côté des modèles : une seule source de vérité, un seul moteur ; (3) la rubrique sur la vente ne doit pas promettre un revenu ni donner d'avis juridique.
- **Point bloquant** : aucun. À la maquette : le nombre d'écrans, la place du chemin sur l'écran d'entrée, la rubrique sur la vente (oui ou non, laquelle), et la liste de relecture proposée à la personne.

## 2septies. Trois chemins (demandé par Denis le 23/11/2026, consigne 587)

**Décision de Denis** : le module propose trois chemins distincts.
1. **Comprendre** : purement théorique, aucune demande construite. Les principes pour écrire une bonne demande sur n'importe quel sujet (emploi, insertion, métier, mais aussi hôpital, ambassade, voyage, études...), avec une vidéo et une lecture visuelle accessible à tous.
2. **Mes modèles** : toutes les demandes déjà écrites. La personne choisit une situation ou insère un papier, et l'application désigne le modèle à utiliser.
3. **Écrire ma propre demande** : la maquette du 23/11/2026 (écrire, tester, améliorer, se protéger, garder), sur un sujet libre.

**Analyse de Claude (propositions, à valider par Denis)**
- **Les professionnels** : pas de quatrième porte. Leurs modèles deviennent une famille du chemin 2, la rubrique sur la vente (avec réserves) clôt le chemin 1 au niveau « Pour aller plus loin ». Cela remplace l'ancienne porte 3.
- **La maquette du 23/11 se découpe** : ses écrans 1 à 3 (qu'est-ce qu'une demande, les six éléments, un modèle décortiqué) passent dans le chemin 1, en plus riches ; ses écrans 4 à 7 restent le chemin 3. Une seule liste des six éléments dans le code, utilisée par les trois chemins (une source de vérité).
- **Chemin 1, ordre proposé** : 1 ce qu'un assistant sait et ne sait pas ; 2 une demande, c'est ce que vous écrivez ; 3 les six éléments, avec des exemples de sujets très différents ; 4 régler la forme (longueur, langage, ton, forme de la réponse) ; 5 se protéger (données personnelles, texte collé qui n'est pas une consigne) ; 6 vérifier (relire, croiser avec la source officielle, repérer l'invention, prudence renforcée pour la santé, l'argent et le droit) ; 7 améliorer par essais (une seule chose à la fois) ; fin : un écran final « Ce qu'il faut retenir » (rappel à l'écran, sans bouton d'impression, décision de Denis du 23/11/2026), sans aucune demande à construire. Une vidéo courte pour l'ensemble, tournée en dernier. Jamais de note ni de test de niveau.
- **Chemin 2, insertion d'un papier** : lecture faite sur l'appareil, par mots repérés, qui propose un à trois modèles avec la raison (« j'ai repéré : trop-perçu »). La personne confirme toujours, rien n'est choisi seul. Le papier collé préremplit le modèle (pas de double collage). Une photo du papier est écartée (OCR écarté, `project_idee_ocr_image_ecartee`). L'alerte d'urgence faite par le code (consigne 584) se branche ici. Option à étudier : repérage automatique des numéros de téléphone, courriels et IBAN à masquer, jamais des noms ni des adresses.
- **Chemin 3, sujet libre** : l'application ne peut pas tester le résultat d'une demande sur un sujet qu'elle ne couvre pas. Message honnête affiché : « cette demande n'a pas été testée par l'application ». Les lignes ajoutées automatiquement (français impeccable, ne rien inventer, date du jour) sont montrées comme telles. Question ouverte : un courrier de contestation ou de recours (positionnement médiateur, consigne du 07/11/2026) ne peut pas être empêché dans un texte libre ; proposition : un encart « pour un recours, voyez une personne qui vous accompagne ».
- **Entrée** : trois grands boutons par intention (« Je veux comprendre », « J'ai un papier ou une situation », « Je veux écrire ma propre demande »), avec une aide « Par où commencer ? ». La zone « insérer un papier » vit dans le chemin 2.

**Maquette du chemin 1 (23/11/2026)** : `docs/maquettes/maquette-bien-utiliser-ia-comprendre-2026-11-23.html`, sept écrans plus un écran final « Ce qu'il faut retenir » (sans impression), trois sujets de démonstration (ambassade, hôpital, voyage), emplacement vidéo, deux niveaux de lecture. Choix et sujets à confirmer par Denis (listés au bas de la maquette).

**Maquette du chemin 2 (23/11/2026)** : `docs/maquettes/maquette-bien-utiliser-ia-mes-modeles-2026-11-23.html`. Trois écrans (choisir, compléter, après la réponse). Entrée : un papier collé, quelques mots, ou la liste des familles (quatre familles, « Mails et messages » jointe à « Comprendre et écrire »). Repérage par mots avec confirmation obligatoire et mots repérés affichés ; alerte de date faite par le code, calme, avec la phrase du courrier ; masquage automatique des numéros, courriels et IBAN ; modèle 4 entièrement câblé (version 3.1 du corpus). Questions à trancher listées au bas de la maquette (dont le chemin « pas à pas » de la consigne 578).

**Chemin 2 : sept points tranchés par Denis le 23/11/2026 (consigne 589)** : (1) papier collé, modèle proposé, confirmation toujours demandée ; (2) alerte de date par le code, case « Je l'ai vu », date reprise dans la demande seulement si la personne le souhaite ; (3) masquage automatique des numéros, courriels et IBAN avec message clair ; (4) quatre familles, « Écrire et comprendre » regroupe les mails ; (5) professionnels = famille à part entière avec rappel « sans noms ni données nominatives » ; (6) « pas à pas » de la consigne 578 remplacé par le modèle unique plus enchaînement (reste en réserve) ; (7) compléments d'un clic reportés après les essais de Denis. La maquette est à jour : case « Je l'ai vu » sous l'alerte (elle devient plus calme une fois cochée) et case « Ajouter cette date à ma demande » avant la copie (testée sur le courrier de convocation, date du jour au 23/11/2026).

**Maquette de l'écran d'entrée (23/11/2026)** : `docs/maquettes/maquette-bien-utiliser-ia-entree-2026-11-23.html`. Titre « Bien utiliser l'IA », trois grands boutons par intention (Je veux comprendre, J'ai un papier ou une situation, Je veux écrire ma propre demande, ce dernier ouvrant les maquettes des chemins), aide « Par où commencer ? » à quatre phrases qui allume le chemin conseillé (suggestion, aucun diagnostic), bloc de réassurance (aucune note, rien n'est envoyé, vérifier la réponse), boutons « Revoir la présentation » et « Voir les mots expliqués », barre du bas Retour et Accueil. Vérifiée en clair, en sombre et à 375 px. Les six points ont été tranchés par Denis le 23/11/2026 (consigne 592) : ordre Comprendre, Mes modèles, Écrire ; « Par où commencer ? » gardée ; « Revoir la présentation » en bas ; professionnels en simple mention sous le deuxième bouton ; pas d'accès « demandes gardées » sur cet écran pour l'instant ; vocabulaire confirmé (« demande », « prompt » seulement dans le Lexique, « assistant en ligne », jamais de robot). Les cinq questions du chemin 1 sont tranchées le 23/11/2026 (consigne 593) : vidéo tournée en dernier, écran « Ce qu'il faut retenir » gardé, aucune rubrique sur la vente de demandes (la piste « Vendre ses demandes » du paragraphe 2sexies est donc écartée du module), sept écrans gardés, trois sujets (ambassade, hôpital, voyage).

**Maquette du chemin 3 allégée (23/11/2026)** : `docs/maquettes/maquette-bien-utiliser-ia-ecrire-ma-demande-2026-11-23.html` passe de sept à trois écrans (Écrire, Améliorer, Garder) ; les anciens écrans 1 à 3 vivent dans le chemin 1, l'ancien écran « Me protéger » est remplacé par un rappel avec renvoi vers le chemin 1, la rubrique sur la vente est retirée (consigne 593). Ajouts proposés : message « application ne peut pas tester un sujet libre », ligne « lignes ajoutées par l'application », encart « Contester ou faire un recours ? ». Vérifiée en clair, en sombre, à 375 px, parcours complet testé. Les cinq points ont été tranchés par Denis le 23/11/2026 (consigne 595) : trois écrans, message « non testé » gardé, encart recours gardé, « Pour aller plus loin » gardé, et garder une demande par la disquette seulement (la maquette disait à tort « gardée sur cet appareil », corrigé ; une famille « Mes demandes » est à ajouter au chemin 2 quand une disquette est ouverte).

**Bilan des maquettes (23/11/2026)** : entrée, chemins 1, 2 et 3 sont toutes validées par Denis. Prochaine étape : le plan de code (modules, fichiers, tests, Lexique, recherche) à présenter avec audit du code réel avant tout feu vert.

**Carte de faisabilité** : chemin 1 GO (pages statiques, briques existantes, chaîne vidéo) ; chemin 2 GO AVEC RÉSERVES (le repérage du modèle peut se tromper : d'où la confirmation par la personne) ; chemin 3 GO AVEC RÉSERVES (sujet libre non testable, positionnement). Risque commun : volume de contenu à sourcer et à relire tous les six mois.

## 3. Contenu : les techniques, en trois niveaux (à rédiger avec Denis)

Principe : trois niveaux au choix de la personne, « Je démarre », « Je précise », « Je vérifie ». Les 24 points ci-dessous sont trop pour un public fragile : la valeur est dans les 5 à 7 premiers, le reste reste replié.

**Bases (version 1)**
1. L'IA comme un collègue très compétent qui arrive ce matin : il ne sait rien de votre situation. Une seule phrase, pas d'explication technique.
2. Dire sa situation et son but : qui je suis, pour qui est le texte, à quoi il servira.
3. Donner la matière (le courrier, le CV, les notes) plutôt que la décrire, bien séparée de la demande ; pour un long document, la question à la fin.
4. Dire la forme voulue : longueur, parties, phrases courtes, niveau de langage.
5. Dire ce qu'on veut plutôt que ce qu'on ne veut pas.
6. Lui laisser poser les questions : « Avant de répondre, pose-moi les questions dont tu as besoin. »
7. « N'invente rien : s'il manque une information, dis-le-moi. »

**Pour aller plus loin (version 2)**
8. Le rôle : utile pour le ton et le point de vue, avec une tâche précise ; les formules grandioses n'apportent presque rien.
9. Donner un exemple de son propre style (un mail déjà écrit).
10. Des critères de réussite (longueur, politesse, une date proposée).
11. Une chose à la fois ; enchaîner de petites demandes.
12. Demander la réponse en parties (résumé, points forts, points à améliorer).
13. Demander plusieurs versions à comparer.
14. Faire vérifier sa propre réponse : « qu'est-ce qui pourrait être faux ou manquer ? »
15. Retoucher plutôt que recommencer.
16. Ne plus présenter « réfléchis étape par étape » comme une formule magique ; demander plutôt « explique comment tu arrives à cette conclusion ».

**Prudence (à répéter partout, jamais en fin de parcours seulement)**
17. Remplacer les données sensibles par des repères ; lien avec le module `confidentialite`.
18. Préciser la date et le territoire pour les démarches.
19. Toujours vérifier, surtout les règles et les papiers : l'IA peut inventer un lien ou une loi.
20. Relire et se réapproprier avant d'envoyer un CV ou un mail.

**Astuces pour ceux qui ne savent pas par où commencer**
21. « Aide-moi à formuler ma demande » : l'IA pose des questions puis écrit la demande.
22. Dicter sa demande (module `astuce-dictee`, avec la convention `Windows + H` en gras insécable).
23. Joindre une photo ou un fichier quand l'outil le permet, avec la même prudence que le point 17.
24. Activer la recherche sur le web pour une information récente.

**Contenu propre aux professionnels** : fidélité au texte (« n'ajoute rien qui ne soit dans mes notes »), citer le passage qui justifie chaque point, longueur et destinataire, gabarit de compte rendu ou de bilan, ancien document anonymisé comme exemple de style, chaînage (extraire les faits, organiser, rédiger), garder ses demandes réutilisables avec des trous, et utiliser le module comme support d'atelier avec les personnes accompagnées.

**Modèles à compléter pressentis** : relire mon CV face à une offre, mon mail de candidature, préparer un entretien, comprendre un courrier reçu, préparer un rendez-vous avec un organisme, relancer poliment, reformuler un mail plus posé ; côté professionnels : synthèse de notes d'entretien, compte rendu, relecture. Pour les papiers administratifs : COMPRENDRE un courrier et préparer des courriers COOPÉRATIFS seulement (consigne 572, paragraphe 2ter) ; jamais de contestation, de recours, de désaccord ni d'article de loi (positionnement médiateur du 07/11/2026).

Une note de l'ancien document de Denis : le modèle « note sur 100 d'un candidat » (point de vue du recruteur) n'est pas repris. Une note chiffrée posée sur une personne contredit la règle « jamais de diagnostic », et l'IA la donne sans base fiable : on enseigne à demander « points forts et points à améliorer ».

## 4. Carte de faisabilité (22/11/2026) : GO AVEC RÉSERVES, aucun bloquant technique

**Patron à reprendre** : le module « Ce qui compte pour moi » (`modules/ce-qui-compte/`, `data/cqcpm*.js`, environ 1 900 lignes avec les tests) : interrupteur local (`cqcpmOuvert`), routes d'introduction et de module (`js/app.js` autour de la ligne 3943), page de présentation partagée (`htmlPageIntroModuleParcours`), tuile de la carte « Boîte à outils » (`js/app.js` ligne 5383 et `data/metiers.js` lignes 9436 et 9596), entrée de recherche avec `ouvertSi` (`data/baseConnaissancesERIP.js` lignes 110 à 112), aide contextuelle (`AIDE_PAGES`), flèche « Précédent » (brique B.24).

| Élément | Verdict |
|---|---|
| Entrée à trois portes, pages « Comprendre » en blocs dépliants | Faisable tel quel |
| « Avant / Après » (exemples écrits à la main, marqués « exemple ») | Faisable tel quel ; l'effort est dans l'écriture et la relecture de Denis |
| Modèles à compléter, assemblage en direct, bouton Copier (`copierTexteVersPressePapier`, `js/app.js` ligne 39297) | Faisable |
| Porte « Pour les professionnels » | Faisable ; réserve de fond sur la confidentialité (voir ci-dessous) |
| « Qu'est-ce qui manque ? » (clic sur les manques d'une demande vague) | Faisable avec ajustement ; à garder pour la version 2 |
| Recherche de l'accueil | Faisable tel quel ; mots de recherche cachés : IA, prompt, consigne, demande |
| Lexique | À créer : aucune fiche « prompt » ni « IA » n'existe ; `node scripts/checkLexique.js` doit rester à 0 erreur et 0 avertissement (4 variantes de recherche au maximum par fiche) |
| Détecteur automatique de noms à retirer | **NO GO** : il laisserait passer les noms et donnerait un faux sentiment de sécurité. Un simple rappel clair, avec la liste de ce qu'il faut retirer à la main |

**Réserves et imprévus**
- **Aucun enregistrement des saisies**, pas même dans la disquette : les notes de professionnels sont sensibles et le poste peut être partagé. Conséquence : une personne qui ferme la page perd ses trous remplis ; elle garde « Copier » et l'impression.
- **Confidentialité** : le rappel ouvre la page des professionnels. Claude ne formule jamais à la place de la structure la règle applicable : il dit de vérifier la règle de sa structure.
- **Tests qui interdisent le mot « IA »** : `tests/nouveautes.test.js` (ligne 51 pour le titre, le texte et le module d'une ligne de `data/nouveautes.js` ; ligne 89 pour `data/problemesCorriges.js`, à traiter de la même façon si un défaut de ce module y est un jour listé) ; plusieurs tests propres à d'autres modules. Le module aura ses propres tests, qui autorisent le mot dans ses textes seulement. La ligne Nouveautés du module exige une **exception nominative et ciblée** dans le test de `data/nouveautes.js`, jamais un assouplissement général. Les tests de `tests/introduction.test.js` ne sont pas touchés (le module n'ajoute rien à `modules/introduction/`).
- **Le mot « IA » apparaît donc** sur la tuile de l'accueil, dans la recherche, dans la ligne Nouveautés et dans le Lexique, tous liés au module. Le reste de l'application ne change pas.
- **Péremption** : les techniques changent vite. À l'ouverture au public, prévoir une tâche programmée de relecture tous les six mois (`outils/taches_programmees.json`), sans noms de produits dans les textes.
- **Confiance excessive** : apprendre à mieux demander peut donner trop de confiance dans la réponse. Le volet « vérifier » revient dans chaque porte.
- **Aucun prompt de l'application n'est touché** (consigne 532) : le module enseigne des principes, il ne modifie ni ne montre les demandes que l'application écrit elle-même.

## 5. Garde-fous à vérifier à chaque écran

Français impeccable avec tous les accents ; aucun tiret long ; aucune icône de robot ni de visage ; mode sombre pour toute variable de couleur ; boutons rectangulaires (jamais une ligne de texte cliquable) ; « à compléter » et jamais « facultatif » ; pas de « bravo » ; ton simple et rassurant, sans diagnostic sur la personne ; jamais « aimer travailler » ; jamais de durée annoncée en minutes ; liens vers d'autres modules seulement s'ils sont ouverts (`typeof` et fonction d'ouverture, comme dans `pageIntroCeQuiCompte`) ; chaque contrôle réellement câblé ; recherche, Lexique, aide contextuelle branchés dès la création ; présentation, vidéo et diaporama à examiner en fin de chantier.

## 6. Fiches du Lexique prévues (dérogation « IA » acceptée)

1. **Intelligence artificielle (IA)** : ce que c'est, ce que ça fait, ce que ça ne fait pas.
2. **Prompt (la demande ou la consigne)** : le mot entendu partout, expliqué simplement.
3. **Réponse inventée** (mot de recherche « hallucination ») : pourquoi l'IA peut se tromper avec aplomb.
4. **Anonymiser** : retirer les noms et numéros avant d'envoyer un texte.
5. **Assistant en ligne** : le nom employé ailleurs dans l'application, relié à « IA ».

Chacune avec son « En savoir plus » ; le bouton « Les mots de la page » les relie aux pages du module.

## 7. Étapes (cases à cocher ; mise à jour à chaque étape et à chaque commit)

Dépendances : la maquette précède tout ; le contenu précède le code des écrans ; l'ouverture au public est une décision de Denis.

- [ ] `[effort : haut]` Lire en entier `LECONS_A_NE_PAS_REPRODUIRE.md` section 10 et `LANGAGE_VISUEL_COMMUN.md` (cas du module neuf : cohérence avec le langage visuel et les briques communes).
- [x] `[effort : haut]` Refaire le concept grossier de l'écran d'entrée avec le mode rapide (champ libre, boutons de situation, modèles proposés, « Aucun ne convient »). **FAIT et VALIDÉ par Denis le 23/11/2026** comme point de départ de la maquette : champ libre avec rappel d'anonymiser au-dessus, boutons de situation, modèles proposés, dernier bouton « Aucun ne convient : préparer ma demande sur mesure », deux portes secondaires en bas (« Comprendre l'essentiel », « Pour les professionnels »). Le placement exact de « Mes modèles » reste à décider à la maquette.
- [x] `[effort : haut]` (première vague de douze situations FAITE et validée le 23/11/2026, paragraphe 2quater ; restent les vagues suivantes) Fixer avec Denis les huit familles et les situations de la première vague (douze), puis des deux vagues suivantes ; Denis fournit un corpus d'au moins 30 phrases réelles pour tester la reconnaissance de mots.
- [ ] `[effort : haut]` Maquette détaillée en HTML dans `docs/`, avec questions à Denis (Mode A). Un seul écran à la fois si Denis est fatigué.
- [ ] `[effort : haut]` Écrire avec Denis le squelette commun des modèles et les garde-fous des modèles administratifs coopératifs (Denis les teste seul, consigne 532).
- [ ] `[effort : moyen]` Les compléments ajoutables à tout modèle, écrits une seule fois en données.
- [ ] `[effort : moyen]` Logique pure de reconnaissance de mots (modèles proposés à partir d'un texte libre), testée sous Node avec le corpus de phrases réelles.
- [x] `[effort : haut]` Consigne de la voie C (« demande sur mesure ») : ABANDONNÉE le 25/11/2026 (décision de Denis) ; le bouton est retiré de l'écran « Mon papier ». Si un jour reprise : Denis écrit et teste la consigne seul (consigne 532).
- [ ] `[effort : haut]` Rédaction des textes avec Denis : les sept bases, les exemples Avant / Après (quatre situations), les modèles, la porte des professionnels. Denis relit chaque bloc.
- [ ] `[effort : moyen]` Code : données (fichiers `data/` avec un préfixe propre), logique pure testée sous Node, écrans, interrupteur fermé au public, flèche « Précédent » (B.24), présentation partagée.
- [ ] `[effort : moyen]` Cinq fiches du Lexique, puis `node scripts/checkLexique.js` à 0 erreur et 0 avertissement.
- [ ] `[effort : moyen]` Tuile et panneau de la carte « Boîte à outils » (`js/app.js` et `data/metiers.js`, grep sur tout le dépôt avant de toucher une liste partagée), entrée de recherche de l'accueil, aide contextuelle.
- [ ] `[effort : moyen]` Test navigateur obligatoire (ordinateur, téléphone, mode sombre) : `js/app.js` et les `modules/*/index.js` ne passent pas les tests Node.
- [ ] `[effort : bas]` À l'ouverture seulement : exception ciblée dans `tests/nouveautes.test.js`, ligne `data/nouveautes.js` (carte « Boîte à outils »), ligne de `docs/JOURNAL_DES_CHANGEMENTS.md`, tâche programmée de relecture tous les six mois.
- [ ] `[effort : bas]` En tout dernier : une seule vidéo d'introduction (jamais une par écran) et examen des présentations existantes.
- [ ] Ouverture au public : décision de Denis, après ses essais réels.

**Verdict Mode Nuit : NON APTE.** Décisions encore ouvertes : la maquette détaillée, les quatre situations des exemples, les modèles de la première version, ceux de la porte des professionnels, le texte exact de chaque base.

## 6bis. Points à trancher avec Denis pendant la maquette

1. Les quatre situations des exemples Avant / Après (proposition : recherche d'emploi, courrier reçu, mail, synthèse de notes pour un professionnel).
2. Combien de modèles à compléter dans la première version (proposition : trois pour les personnes, trois pour les professionnels).
3. Les trois niveaux « Je démarre », « Je précise », « Je vérifie » : confirmés ou remplacés par un autre découpage.
4. Phrase décrivant le module dans la carte « Boîte à outils » de l'accueil.

## 8. Sources consultées (22/11/2026, à revérifier avant la rédaction finale)

- Anthropic, bonnes pratiques de prompt (guide officiel) : https://claude.com/resources/articles/best-practices-for-prompt-engineering
- IBM, guide 2026 : https://www.ibm.com/think/prompt-engineering
- DigitalOcean, bonnes pratiques : https://www.digitalocean.com/resources/articles/prompt-engineering-best-practices
- Réserve : plusieurs pages trouvées sont du contenu de blog ; certains chiffres annoncés (gains en pourcentage) n'ont pas pu être vérifiés dans la source d'origine et ne sont pas repris. Aucun guide officiel d'un autre éditeur n'a été relu directement : à faire pendant la rédaction.

## Enrichissement du module (consignes 596, 23/11/2026) : À FAIRE APRÈS LES COMMITS 5 À 9

Demande de Denis, pendant le commit 5. Le contenu à ajouter : (1) une petite rubrique « Comment fonctionne une IA » (surtout les assistants qui écrivent du texte, les « grands modèles de langage », ou LLM) : comment ils font leurs phrases, d'où vient leur information, pourquoi ils écrivent « ce texte-là », pourquoi une consigne change leur façon de formuler ; (2) dire qu'il faut activer la recherche web pour une information précise ; (3) les spécificités de chaque assistant et comment l'utiliser (Perplexity, Claude, ChatGPT, DeepSeek...) ; (4) dire clairement, une fois, que « l'IA, c'est l'assistant », puis garder le mot « assistant » (le mot « IA » ne remplace pas « assistant » partout) ; (5) toute autre information utile que Claude peut récupérer. Cela concerne tout le module, pas seulement le chemin 1.

Calendrier voulu par Denis : après tout ce qui est prévu (commits 5 à 9), parce que le contenu et la disposition seront ajustés. Étape à suivre : maquette avec questions (recommandation et risques de chaque option), puis code. Points d'attention de Claude : les spécificités des assistants changent vite et sont des affirmations sur des produits commerciaux : à sourcer, à dater et à revalider (tâche tous les six mois déjà prévue) ; décider avec Denis si l'ouverture au public (commit 9) attend cet enrichissement ; les tests actuels interdisent les noms d'outils dans les textes du module : ils seront changés nommément à ce moment-là.

## Lexique à enrichir (consigne 597, 23/11/2026)

Denis veut que les notions qui demandent une explication (IA, LLM, prompt, et d'autres à repérer, notamment les techniques) aient chacune leur fiche dans le Lexique, et réfléchit à une rubrique à part (« numérique » englobant, ou intelligence artificielle). Le Lexique ne contient aujourd'hui aucune fiche sur ces notions (les seules fiches numériques : FranceConnect, identité numérique, France Services, conseiller numérique, aidant numérique, illectronisme, Pix ; collection « Faire ses démarches en ligne »). Élargit le commit 7 (cinq fiches prévues : IA, prompt, réponse inventée, anonymiser, assistant en ligne). En attente du choix de Denis : liste des notions et emplacement.

Décision du 23/11/2026 : option 1 validée (nouvel univers « Numérique et assistants en ligne » + parcours ordonné, liste d'environ dix-sept notions). Travail à faire au commit 7 : ajouter l'univers (modules/lexique/index.js et scripts/checkLexique.js), rédiger les fiches (`data/lexique.js`), la collection en mode parcours, les renvois depuis « Faire ses démarches en ligne », la recherche de l'accueil, puis `node scripts/checkLexique.js` (0 erreur, 0 avertissement) et `npm test`.
