# Chantier « Se tenir informé » - recueil de conception (APP)

**Statut : recueil de travail, RIEN à coder, RIEN de décidé.** Créé le 2026-08-28.
Ce module tient particulièrement à coeur à Denis (professionnel de l'insertion + bénéficiaires). Traité comme un mini-chantier à part : son propre recueil, sa liste de sources, sa maquette plus tard.

Contraintes dures rappelées : site 100 % statique, aucun serveur, aucune base, aucune interface de programmation interne, aucun stockage d'information côté application, une seule personne (Denis) pour toutes les mises à jour, sans budget. Principes APP : pas de flux, pas de notifications, consultation à la demande.

---

## 1. Le constat central : ce n'est pas un module d'actualités

Plusieurs assistants, indépendamment, ont conclu la même chose : **le concept « actualités » est le mauvais cadre**. Un module d'actualités répond à « qu'est-ce qui s'est passé aujourd'hui ? ». Le besoin réel de Denis répond à « qu'est-ce que je devrais savoir avant de prendre une décision de recherche d'emploi, ou avant d'accompagner quelqu'un ? ».

**Recommandation forte : reconcevoir et renommer** en module de repères durables - pistes de nom proposées : « Repères sur le monde du travail », « Points de repère », « Ce qui bouge » (sans « actualités », sans « veille », sans « à la une »). Cela résout d'emblée la tension avec le 2e principe de la Constitution (ne jamais chercher à retenir l'attention) et divise la charge de mise à jour.

Conséquence : le contenu est surtout des **fiches de référence stables + des renvois vers des sources officielles vivantes**, pas un suivi de l'actu.

---

## 2. Forme concrète (convergence des assistants)

**Structure** : une page d'entrée courte, puis 4 à 5 dossiers thématiques :
- Droit, droits et démarches (ce qui change dans la loi et les aides)
- Chiffres et marché du travail (emploi, chômage, salaires)
- Métiers qui recrutent (tensions, intentions d'embauche)
- Repères par territoire
- Freins et ressources (mobilité, garde d'enfants, logement, numérique)

**Gabarit d'une fiche** (toujours le même squelette, court) :
- Titre factuel, sans effet d'annonce
- Pour qui / pourquoi c'est utile (1 ligne)
- Ce qu'il faut retenir (3 à 5 lignes, rédigé à la main, langage simple)
- Ce que ça change pour vous / pour l'accompagnement (1 à 2 lignes)
- Territoire concerné (si pertinent)
- « Repère vérifié en [mois année] »
- 1 à 2 liens vers la source officielle

**Deux couches assumées et étiquetées** : « rédigé à la main » (l'explication, le point d'attention) vs « source officielle vivante » (le lien qui se met à jour tout seul).

**Honnêteté sur la fraîcheur** : jamais un faux « mis à jour le [date] ». Écrire : « Repère vérifié en [mois année]. Les règles et les chiffres peuvent évoluer ; le lien ci-dessous pointe vers la source officielle à jour. » Un bandeau discret « à revérifier » sur les fiches de plus de 6 mois. Bloc d'entête permanent qui dit que ces fiches sont rédigées à la main, à une date donnée, et que la source fait foi.

**Pas de** : classement chronologique inverse, macaron « Nouveau », compteur, « à la une », notification, mémoire de consultation.

---

## 3. Sources officielles françaises à pointer (la partie la plus utile)

| Type d'information | Source (nom précis) | Ce qu'on y trouve | Cadence propre |
|---|---|---|---|
| Droit du travail (textes) | **Légifrance** (legifrance.gouv.fr) | Code du travail en version consolidée, historique des versions, décrets | Versionné en continu |
| Droits, aides, démarches (explication) | **Service-Public.fr** | Fiches pratiques vérifiées et datées sur contrats, rupture, aides, formation | Pages datées, révisées régulièrement |
| Réformes en cours | **Ministère du Travail** (travail-emploi.gouv.fr) | Dossiers thématiques, communiqués | Au fil de l'eau |
| Chômage, emploi, salaires | **INSEE** (insee.fr) | Taux de chômage (trimestriel), emploi, salaires, séries longues, données locales | Trimestriel / annuel |
| Analyses emploi, métiers en tension | **DARES** (dares.travail-emploi.gouv.fr) | Études sur l'emploi, le chômage, l'apprentissage, indicateurs de tension par métier | Publications régulières |
| Intentions d'embauche par métier / bassin | **France Travail - enquête BMO (Besoins en Main-d'Oeuvre)** | Projets de recrutement par métier, secteur, bassin d'emploi, difficulté de recrutement | Annuel |
| Recrutement des cadres | **APEC** (apec.fr) | Études recrutement cadres par secteur et région | Régulier |
| Données territoriales | **INSEE - données locales** + **Observatoire des territoires (ANCT)** (observatoire-des-territoires.gouv.fr) | Chiffres par commune/département/région ; baromètre territorial ; accès à l'emploi, aux services, au logement, mobilités ; France services | Selon jeux de données |
| Emploi / formation en région | **Réseau CARIF-OREF** (les observatoires régionaux, nom variable : Via Compétences, GREF Bretagne, Cariforef...) | Métiers en tension, formations, diagnostics régionaux | Régional, variable |
| Freins - mobilité | **Mobiliscope** + Observatoire des territoires | Accès aux emplois et services selon la mobilité | Selon données |
| Freins - garde d'enfants | **CAF / CNAF - CAFdata** + rapport **ONAPE** (Observatoire national de la petite enfance) | Données géolocalisées (national / départemental / communal), taux de couverture | Annuel |
| Freins - logement | **ANAH**, **Observatoire des territoires** | Aides au logement, tension, rénovation | Régulier |
| Freins - numérique | **ANCT** (inclusion numérique, très haut débit) | Couverture, accès aux services numériques | Régulier |
| Diagnostics territoriaux emploi | **DREETS** (par région, dreets.gouv.fr) | Diagnostics territoriaux, freins à l'emploi, plans d'action | Régional |
| Écosystème insertion (structures locales) | **DORA** (dora.inclusion.beta.gouv.fr) | Répertoire des structures, services et aides à l'insertion par territoire | Mis à jour en continu |
| Aides sociales locales | **CCAS** de la commune, **Conseil départemental**, **Mission Locale** du territoire | RSA, insertion, aides communales, accompagnement jeunes | Local |

Note : il n'existe pas de base officielle unique « les freins par territoire ». Le montage consiste à assembler des indicateurs indirects (accès emploi / services / logement / mobilité) issus de l'Observatoire des territoires, de la CAF et de l'ANCT.

---

## 4. Doctrine de maintenance (pour une personne seule)

**Ne rédiger à la main que** : la synthèse simple, le point d'attention, « ce que ça change pour la personne / l'accompagnement ». Viser 5 à 8 fiches au total pour commencer, pas plus.

**Laisser en simple lien** : tous les chiffres détaillés, les textes de loi, les tableaux territoriaux, les cartes, les montants d'aides précis - tout ce que la source officielle maintient déjà.

**Cadence réaliste (~2 à 4 h / mois)** :
- mensuel : coup d'oeil aux pages Service-Public et Ministère du Travail sur les aides sensibles ; rédiger au maximum 1 à 2 fiches ;
- trimestriel : vérifier les liens (liens morts), relire les fiches « droit et aides », mettre à jour la date de vérification des fiches touchées ;
- annuel : nouvelle enquête BMO ; revue complète de toutes les fiches ; passage en « à revérifier » des fiches non revues depuis 6 mois.

**Idée pour réduire encore la charge** : un fichier texte versionné `sources.txt` (nom / adresse / description, une par ligne) transformé en tableau au moment de la construction du site - la personne qui maintient ne touche jamais au HTML. Faible effort, évite les erreurs de saisie.

**Fiche méta utile** : « Comment vérifier une information soi-même » (reconnaître une source fiable) - rend la personne autonome, ne la laisse pas dépendante de la page.

---

## 5. Questions de doctrine éditoriale restées ouvertes (à trancher avec Denis)

- **Quand écrire une fiche vs quand renvoyer directement ?** Piste : n'écrire que si la fiche ajoute une vraie compréhension ET que le sujet est stable.
- **Quels contenus sont intemporels** (à rédiger une fois) : « comment lire une offre d'emploi », « qu'est-ce qu'une convention collective », « comment fonctionne un contrat de professionnalisation », « qui sont les acteurs de l'insertion »...
- **Quels contenus deviennent faux vite** (toujours un lien, jamais rédigés) : chiffres du chômage, montants d'aides, seuils, barèmes, listes de métiers en tension.
- **Où est la frontière entre « information utile à une décision de recherche d'emploi » et « information intéressante » ?** C'est cette frontière qui empêche le module de devenir un agrégateur.
- **Niveau de granularité d'une fiche** : une phrase ? une page ? Viser « utile sans devenir une encyclopédie ».
- **Test de résilience** : « si on s'interdit d'ajouter la moindre information pendant 6 mois, le module reste-t-il utile ? » Si oui, il est bien conçu (fondé sur du pérenne + des renvois).

**Phrase à ajouter au brief pour un éventuel dernier tour IA** : « Nous concevons un module de référence durable, pas un média d'actualité. Si votre proposition transforme progressivement APP en site d'information ou en veille permanente, dites-le et proposez une alternative compatible avec nos principes. »

---

## 6. Écarté (avec la raison)

- **Mode « conseiller » / mode « personne »**, comparateur multi-territoires, carte ou graphique embarqué, chronologie des évolutions : jugés trop lourds à maintenir pour une personne seule, par les assistants eux-mêmes.
- **Schémas `localStorage` JSON** proposés par des assistants pour stocker des fiches : inutile, l'app est statique et n'a pas à stocker ça (le `sources.txt` en revanche est retenu, c'est différent : un fichier de build, pas du stockage runtime).
- **Sélecteur de territoire mémorisé** : contredit « aucun stockage » ; un sélecteur éphémère sans mémoire serait acceptable.
- **Toute logique d'alerte / notification / nouveautés** : contredit directement l'absence de flux.

---

## 7. Verdict et plan proposés (Claude, 2026-08-28) - pas besoin d'un autre tour IA

**Faut-il un autre aller-retour IA ?** Non. Trois tours sur les modules en général + une convergence nette sur celui-ci. On a de quoi faire un plan.

**Ce module doit-il exister ?** Oui, mais **modeste**. Pas comme une veille (une personne seule ne peut pas la tenir, et un flux contredit le 2e principe). Comme une **petite carte fiable** : « quand vous avez besoin de savoir X, voici le seul endroit sûr, et voici ce qu'il faut comprendre d'abord ».

Raisons de le garder :
- Le public visé (fragilité numérique) ne sait pas que l'INSEE, la DARES, l'enquête BMO existent, et s'il y arrive il se noie. Une carte curatée de 8 sources, avec « à quoi sert chacune » et « le lien à cliquer », est une vraie valeur pour CE public.
- Denis en a besoin comme **base de connaissances structurée** : l'endroit où il range ce qu'il juge solide, qu'il peut montrer à une personne ou imprimer pour un rendez-vous.
- C'est le **domicile naturel des données territoriales** dont le futur module « Répertoire des freins et ressources » aura besoin, et de l'« index de sites de référence » déjà prévu pour la barre de recherche élargie.

Raisons de rester modeste : sans cette limite, le module dérive en agrégateur ; il fait doublon avec le futur Lexique « centre de connaissances » ; il n'est pas au coeur d'APP (travailler ses propres documents et décisions).

**Frontière avec le Lexique « centre de connaissances »** (à trancher avec Denis) : les fiches « comment marche le monde du travail » (lire une offre, convention collective, contrat de pro) -> Lexique. « Où trouver les données officielles + repères par territoire » -> ce module. Les deux restent distincts.

**Deux usages, deux utilisateurs :**
- *Le bénéficiaire* : rarement. Il vient une ou deux fois, quand une question précise le bloque (« ai-je droit à une aide au permis ? », « ça recrute dans quoi près de chez moi ? »). Il lit une fiche, clique un lien officiel, repart. Ça remplace une recherche Google affolée qui tombe sur un site douteux.
- *Denis / le conseiller* : plus souvent. Sa base curatée, qu'il alimente, qu'il montre, qu'il imprime en synthèse pour un rendez-vous.

**Risque assumé** : si Denis ne tient pas les ~2 à 3 h/mois, les fiches vieillissent. Atténué par « vérifié en [mois] » + bandeau « à revérifier » (le vieillissement est visible et honnête), et par le fait que le vrai contenu, ce sont les liens vers des sources vivantes - qui, elles, ne vieillissent pas.

**Plan en 3 phases (aucune n'est du code aujourd'hui) :**
1. *Décider avec Denis* : le nom ; le périmètre (carte curatée + fiches durables, jamais de flux) ; la frontière avec le Lexique.
2. *Contenu, hors code* : écrire le `sources.txt` (le tableau de la partie 3) ; écrire 5 à 8 fiches durables maximum ; rédiger le texte de la page d'introduction (patron des pages d'intro de module).
3. *Construction, plus tard* : page statique ; tableau des sources généré depuis `sources.txt` au build ; gabarit de fiche ; page d'introduction + tampons « vérifié en [mois] » ; branchements (index de la barre de recherche, module Freins/Ressources, encart « Cet outil travaille avec… »). Puis le rituel de maintenance.

---

## 8. Clarifications de Denis (2026-08-28)

- **Temps de maintenance** : Denis compte y consacrer **plus de 2 à 3 h/mois**. Sa méthode : des prompts thématiques ciblés, qu'il fait tourner en aller-retour sur une IA de recherche, dont il ramène les informations avec leurs sources, et dont il alimente le `sources.txt`. Ce fichier texte alimente ensuite la base / met à jour ce qui est affiché dans l'app.
- **Aucun conflit avec le Lexique, au contraire** : le Lexique = concepts et définitions plutôt figés ; ce module = veille. La veille **alimente** le Lexique : quand elle fait remonter un terme ou une pratique, il rejoint le Lexique. À prévoir : définir les champs que le Lexique veut couvrir, et un système d'alimentation continue du Lexique sur le même modèle `sources.txt` (le Lexique a un objectif de grandir). Voir `docs/IDEES_A_RECLASSER.md`, entrée Lexique du 2026-08-27/28.
- **Différence avec Google, argument de Denis** : Google suppose qu'on sache déjà quoi chercher, et il a des pubs et des mots-clés achetés. Ici, pas de pub, pas de mots achetés - juste le lexique professionnel de l'insertion et de l'emploi. Peut faire gagner un temps considérable à qui ne sait pas par où commencer.
- **Le nom : PAS tranché, mais NI "Actualités" NI "repères"**. "repère professionnel" ferait doublon avec le module "Mes Repères" existant. Denis veut garder ce module **distinct de Mes Repères**. Il faut un nom : pas intimidant pour la personne, qui parle aussi aux professionnels, cohérent avec le rôle (comprendre / s'informer, pas suivre l'actu). "Se tenir informé" en carte d'accueil peut rester ; c'est surtout la sous-carte "Actualités" qui doit changer.
- **Prompts : exigence très élevée, et MULTIPLES prompts spécialisés, pas un seul gros**. Dans le code, selon l'information cherchée, l'app fournit le prompt thématique adapté (même logique "copier le prompt -> le passer à l'assistant -> ramener la réponse" que le reste d'APP). Idéal : une IA de pointe en recherche web, qui ramène les dernières informations AVEC les sources.
- **Choix de l'IA pour CE module** : on ne pourra pas laisser toutes les IA. Parmi celles sans compte, il en reste deux : **ChatGPT** et **Perplexity**. À trancher entre les deux - Denis veut une petite enquête comparative avant de choisir.

---

## 9. Décision d'architecture : base curatée vs recherche en temps direct (2026-08-28)

Denis a posé le choix entre deux modèles :
- **Modèle A - recherche en temps direct** : le module fournit des prompts ; la personne ou le professionnel les lance elle-même sur une IA de recherche et ramène l'information. Rien n'est stocké.
- **Modèle B - base curatée** : le module contient déjà un corps d'informations large, alimenté **exclusivement par Denis** via ses prompts (pour qu'il vérifie la certitude, la pertinence et la fiabilité des sources). Le public consulte ce qui est là.

**Recommandation de Claude : Modèle B, nettement. Avec le découpage que Denis propose lui-même :**
1. **Partie publique** = le module "Comprendre le monde du travail" : lecture seule, cherchable (branché à la barre de recherche élargie), favoris, quelques indicateurs clés en instantané daté, et le tableau des sources officielles.
2. **Partie maintenance, privée** = l'espace de travail de Denis : sa bibliothèque de prompts thématiques + un rituel (lancer un prompt -> vérifier -> mettre à jour les fichiers de contenu -> committer). Pas besoin que ce soit un "module" dans l'app : un doc de prompts + des fichiers de contenu (`sources.txt` / `data/veille/*`) édités et commités suffisent au départ.

**Pourquoi B plutôt que A :**
- **Le public qui en a le plus besoin (fragilité numérique) ne peut PAS faire du self-service.** Lancer un prompt de recherche, juger les sources, extraire la réponse : c'est exactement ce que ce public ne sait pas faire. A échoue pour eux.
- **Denis veut le contrôle éditorial** sur la fiabilité des sources - c'est sa demande explicite. A y renonce entièrement ; B est le seul qui le donne.
- **Seul B peut alimenter les autres modules** (Lexique, Répertoire des freins et ressources, plus tard Mes Repères) et **être indexé par la barre de recherche**. Une recherche éphémère ne s'indexe pas, ne se met pas en favori, ne nourrit rien.
- **La peur de "perdre les informations" se retourne** : avec B + commits GitHub, tout ce qui est commité est conservé pour toujours dans l'historique git. Les fichiers de contenu SONT la base de données, versionnée, sauvegardée. Avec A, il n'y a rien à perdre parce qu'il n'y a rien d'accumulé.
- La charge de maintenance (inquiétude n°1 de Denis) est tenable : il est prêt à un passage hebdomadaire ; la doctrine garde les données volatiles en simple lien ; le vieillissement est rendu visible et honnête ("vérifié en [mois]"), pas caché.

**Nuance : ce n'est pas strictement l'un ou l'autre.** B peut inclure une pincée de A : pour une poignée de questions vraiment vivantes (ex. "le taux de chômage actuel"), le module peut proposer un prompt prêt à lancer - mais cadré ("ce chiffre change chaque mois ; voici la page officielle ; et voici un prompt si vous voulez le chiffre du moment expliqué"). La colonne vertébrale reste B ; A est un garnish pour le strictement live, et plutôt à l'usage du professionnel qu'à celui du bénéficiaire.

**Trois rôles, à garder nets :** le bénéficiaire *consulte* ; le professionnel *consulte* et *peut* utiliser la bibliothèque de prompts ; Denis *seul* alimente, en règle générale.

**Sur les graphiques / chiffres "actualisés" :** un site statique ne met pas un graphique à jour tout seul. Trois options : (a) lien vers l'outil interactif officiel (INSEE) ; (b) Denis met à jour un petit fichier de données au passage hebdomadaire et la page dessine un graphique simple à partir de ce fichier ; (c) capture d'écran datée. Doctrine : instantané structuré pour les 3-4 indicateurs les plus importants (mis à jour dans le rituel), lien pour tout le reste.

---

## 10. Modèle affiné par Denis : base curatée + capteur de demande (2026-08-28)

Denis précise le modèle. C'est du B (base curatée) comme colonne vertébrale, avec un élément A surveillé qui sert de **capteur de ce que les gens cherchent**.

**a. Prompt public "combler un trou".** Si une information manque dans la base, n'importe qui peut lancer un prompt pour aller la chercher - **avec des conditions**. Conditions à prévoir :
- ne s'affiche qu'après une recherche restée sans résultat (même logique que la barre de recherche : "aucun résultat" -> "voici un prompt pour chercher vous-même") ;
- le prompt lui-même est cadré : "réponds uniquement à partir de sources officielles françaises (sites en .gouv.fr, service-public.fr, insee.fr, francetravail.org, dares...), cite chaque source avec son lien, et dis clairement si tu ne trouves pas" ;
- la réponse n'est jamais présentée comme celle d'APP : "vous avez interrogé un assistant, voici ce qu'il a répondu, vérifiez toujours la source officielle indiquée" ;
- rappel de confidentialité habituel (ne pas coller d'informations personnelles).

**b. Les prompts de mise à jour de Denis : plusieurs PETITS, très spécifiques.** Un par famille de fiche / type de donnée (ex. "chiffres du chômage région X", "métiers en tension bassin Y", "formations financées par la région Z", "dispositifs d'aide à la mobilité"). Lancés plusieurs fois par semaine ou par mois selon le sujet. Un prompt petit et précis = meilleures sources, plus facile à vérifier. En plus : **un seul "grand" prompt de balayage**, lancé plus rarement, pour repérer les angles morts que Denis n'avait pas pensé à chercher. Ces prompts vivent dans un doc privé (`docs/VEILLE_PROMPTS.md` ou équivalent), versionné, affiné avec le temps.

**c. Boucle de rétroaction par le tracker.** Quand quelqu'un utilise le prompt public (ou fait une recherche sans résultat), on enregistre le sujet cherché (texte de la requête seulement, aucune donnée personnelle - exactement comme l'événement `recherche_sans_resultat` déjà en place pour la barre de recherche élargie). Denis relit périodiquement cette liste : si un sujet revient et qu'il ne l'avait pas, il affine un prompt spécifique et l'intègre de façon **pérenne** dans la base. La base grandit alors en suivant la demande réelle, pas au hasard.

**Résumé du modèle** : base curatée par Denis seul (fiabilité, indexable, nourrit les autres modules) + prompt public cadré comme filet d'appoint et comme capteur + tracker qui transforme les trous en priorités de veille.

---

## 11. Le principe anti-doublon : module d'acquisition qui ROUTE, ne garde que le résiduel (2026-08-28)

Denis a formulé le coeur conceptuel. « Comprendre le monde du travail » (CMT) n'est pas un module qui accumule : c'est le **module d'acquisition** de tout l'écosystème. Denis, avec ses prompts, va chercher l'information, puis CMT la **route** vers le module dont c'est le rôle, selon la NATURE de l'information (pas selon l'endroit où elle a été trouvée) :
- un **dispositif, un contact, une aide concrète** -> module **Ressources** ; CMT ne le garde pas.
- un **mot, une expression, un concept, une pratique** -> module **Lexique** ; CMT ne le garde pas.
- tout ce qui **n'a pas de module preneur** -> **reste dans CMT**, daté : statistiques, compréhension du territoire, état du marché, intelligence secteur/entreprises. C'est le résiduel, et c'est l'identité de CMT.

**Mécanisme** : un **fichier d'import unique et typé**. Quand Denis importe, chaque module y prend son morceau (par type) qui alimente directement son contenu. Une information vit dans **un seul** module. Pas de bagarre, pas de doublon.

**Identité claire de chaque module :**
- **Lexique** = « qu'est-ce que ça veut dire » - vocabulaire, concepts, pratiques, tendances, intemporel et explicatif.
- **Ressources** = « qui peut m'aider pour ce frein » - freins + liens + dispositifs + contacts, actionnable, léger (juste un état des freins avec des liens).
- **CMT** = « quelle est la situation » - chiffres, territoire, marché, secteurs, entreprises, daté et contextuel.

**Règles de départage aux frontières floues (à retenir) :**
- *Lexique vs CMT sur un même sujet* : le Lexique porte le **sens intemporel** (« qu'est-ce que la médiation corporelle ») ; CMT porte le **signal daté** (« cette pratique se répand dans les structures depuis 2025 »). Ce ne sont PAS des doublons : questions différentes. Ils peuvent co-exister sur le même thème, c'est normal.
- *Ressources vs CMT sur les dispositifs* : le **dispositif lui-même et comment y accéder** (contact, conditions) -> Ressources. Le **paysage** des dispositifs (lequel est en fin de vie, la région a baissé son budget formation de 20 %) -> CMT.
- *Intelligence "soft" (entreprises accueillantes aux stagiaires, structures amies de l'alternance)* : ça ne vient pas d'une source officielle, ça vient des newsletters et du réseau CIP. À **garder côté privé** (boîte à outils du conseiller) ou à afficher très prudemment (« structures identifiées par le réseau, à vérifier »). Ne jamais présenter comme un fait vérifié ce qui est du bouche-à-oreille.

**Ce qu'il faut ajouter au concept (Claude) :**
- **Tampon de provenance partout, pas seulement dans CMT.** Toute information routée vers Lexique ou Ressources via la veille garde « ajouté via la veille, [mois année] », pour que son vieillissement soit visible dans le module où elle a atterri.
- **Chemin de mise à jour inverse.** Le routage est à sens unique (CMT -> modules), mais les **retraits** aussi ont besoin d'un chemin : si un dispositif ferme, le rituel de veille doit inclure un passage « ce que j'ai déjà publié est-il encore vrai ? », pas seulement « qu'est-ce que j'ajoute ».
- **Le module privé de "dissection" reste un simple fichier de travail + la bibliothèque de prompts**, pas une interface. Plus c'est léger, plus Denis tient le rythme.

**Faut-il ajouter d'autres fonctions à CMT maintenant ? Non.** Le concept tient précisément parce que CMT est un résiduel léger. Si on lui ajoute dès maintenant un annuaire d'entreprises, une base de formations avec contacts, etc., CMT cesse d'être un résiduel et devient une sous-application lourde avec son propre problème de maintenance. Commencer au plus petit (tableau des sources + 5-8 fiches durables + 3-4 indicateurs datés), prouver que le routage marche, PUIS décider si « formations financées par la région » mérite sa propre vue structurée.

---

## 12. La raison d'être du module, formulée par Denis (2026-08-28)

L'information officielle **existe déjà, est gratuite, est en accès libre**. Le problème n'est pas la disponibilité : c'est que les gens ne savent **ni quoi chercher, ni où, ni comment, ni comment lire** ce qu'ils trouvent.

Les sites officiels (INSEE, DARES, France Travail...) sont **obligés** d'être exhaustifs et précis : l'État doit rendre des comptes, servir des chercheurs et des professionnels, pas seulement des demandeurs d'emploi. Résultat : des tableaux, des séries, des graphiques multi-périodes, un niveau de détail au-delà de ce qu'un CIP exploite, et très au-delà de ce qu'une personne en recherche d'emploi peut décrypter sans formation en statistiques.

**La valeur d'APP ici : mettre des poignées sur cette masse.** Rendre l'information ergonomique, digeste, compréhensible. Aller chercher **seulement l'information nécessaire**. Ne pas afficher un graphique complet avec toutes les périodes : **répondre à une question concrète, par une source concrète, datée.**

Denis estime que ça peut apporter plus que les ateliers « comprendre le fonctionnement d'un site officiel » proposés par les structures : même un très bon site reste illisible pour qui n'aime pas les chiffres.

**Conséquence structurelle : les fiches sont en forme de QUESTION, pas de thème.**
- Pas : « Tableau de bord des tensions de recrutement ».
- Mais : « Ça recrute dans quoi près de chez moi ? » -> une réponse courte, un ou deux chiffres, un lien source, une date.
- « Le chômage, ça monte ou ça baisse en ce moment ? » ; « Quels métiers manquent de candidats dans ma région ? » ; « La formation X, elle mène à quoi ? »
Chaque fiche = une question qu'une personne se pose vraiment + la réponse simplifiée + « d'après [source], [date] » + le lien pour vérifier.

**Garde-fou indissociable de cette promesse** : simplifier une statistique, c'est risquer de la déformer. Toujours : formuler « d'après [source], en [date] », jamais une vérité absolue ; toujours afficher le lien source et la date ; prévoir une poignée de fiches « comment lire ça vous-même » (ex. « comment lire un taux de chômage » - catégorie A ou BIT ? localisé ? corrigé des variations saisonnières ?). Ces fiches « comment lire » vivent dans CMT, elles sont inséparables des données qu'il présente.

Cette formulation « question -> réponse simplifiée -> source datée » est l'accroche naturelle de la page d'introduction du module.

---

## 13. Comparaison avec la "Veille" déjà en ligne chez PCGI 87 (2026-08-28, capture d'écran)

La "Veille" de PCGI 87 est un **fil d'événements** : "Événements en Haute-Vienne (87) / Actualités du territoire local". Cartes datées (DuoDay 2026, portes ouvertes AFPA, "Rapport annuel insertion Dept. 87 2025"), chacune avec un titre, 2-3 lignes, un bouton "Ouvrir la source" et un bouton "Vérifier la source" qui est **un lien de recherche Google**, pas une URL confirmée. C'est automatisé (personne ne saisit à la main), et le "Vérifier via Google" trahit une génération assistée non vérifiée.

**Est-ce un doublon avec "Comprendre le monde du travail" ? Non - concepts différents, avec un petit recouvrement à cadrer.**

| | PCGI 87 - Veille | APP - Comprendre le monde du travail |
|---|---|---|
| Nature | Fil d'**événements** ("il se passe quoi bientôt") | **Compréhension** ("c'est comment, et comment lire ça") |
| Fabrication | Automatisée, non vérifiée ("vérifier via Google") | Curée et **vérifiée par un humain**, sources officielles confirmées |
| Sortie | Un lien, aucune synthèse | La synthèse EST la valeur (la "poignée") |
| Public | Professionnels / partenaires | Grand public qui ne sait pas lire l'INSEE |
| Écosystème | Fil isolé | Alimente Lexique et Ressources |

**Verdict : le concept de Denis va plus loin, et j'en suis d'accord.** Un fil d'événements automatisé avec un bouton "Google pour vérifier" est un produit à faible confiance et sans synthèse. La proposition de Denis (poignées + fiches-question + sources vérifiées + alimentation du reste) est plus ambitieuse et plus utile pour son public.

**La nuance / le petit recouvrement** : PCGI 87 couvre les **événements** (forums, portes ouvertes, DuoDay) - c'est exactement le contenu volatil que le modèle de Denis dit de NE PAS transformer en fiche (ça expire, ça change chaque semaine, un humain seul ne suit pas). Donc "Comprendre le monde du travail" **ne doit pas** essayer d'être un fil d'événements ; si une personne veut "ce qui se passe près de chez moi", le module renvoie vers la Veille de PCGI 87 (ou les calendriers des structures), il ne duplique pas. Frontière propre : PCGI 87 = les événements ; APP = la compréhension.

**Cadre stratégique** : Denis est **intégré dans** PCGI 87. Ce n'est donc pas "concurrencer" mais "coordonner". Son module est la couche de synthèse et de vérification que leur automatisation ne fait pas ; leur fil couvre les événements qu'un humain seul ne peut pas suivre ; le Lexique et Ressources d'APP peuvent absorber le durable que leurs onglets Acronymes / Aides ont commencé. À aborder lors du rendez-vous avec les responsables (le même que pour le changement de nom).

---

## 14. Renvoi vers les événements locaux, et la question du multi-département (2026-08-28)

Denis est en **Dordogne (24)**, PCGI 87 est en **Haute-Vienne (87)**. Les événements de PCGI 87 (portes ouvertes AFPA Limoges...) ne concernent pas un usager du 24. Denis prévoit de déployer aussi une version 24 -> **deux départements** au moins.

**Comment renvoyer vers les événements : dans le CODE, pas dans un prompt.**
- Les événements sont volatils -> routage déterministe obligatoire (principe déjà acté : "prompt pour comprendre, code pour garantir").
- Prévoir une **petite table par département** : `département -> lien vers la page officielle des événements locaux`.
  - 87 -> la Veille de PCGI 87.
  - 24 -> à identifier par Denis (calendriers Cap Emploi 24, Mission Locale du Bergeracois, Conseil départemental 24, France Travail Dordogne) ; sinon repli national (Mes Événements Emploi / France Travail, 1jeune1solution).
  - inconnu / autre -> repli national.
- Le **prompt** de "Comprendre le monde du travail" ne fait que porter une règle de doctrine : *jamais de fiche pour un événement ou une annonce à date limitée ; ça appartient aux pages d'événements locales, pas ici.* Il ne route pas lui-même.
- Maintenance quasi nulle : un lien par département, mis à jour seulement si un lien meurt ou si Denis ouvre un nouveau département.

**Conséquence plus large : APP a besoin d'une notion de "territoire".** Modèle à trois couches :
- **National** (la majorité des fiches : lire un taux de chômage, RQTH, RSA, contrats...) - identique partout.
- **Régional** (Nouvelle-Aquitaine : Néo Terra, éco-socio-conditionnalités, DREETS et OREF régionaux, PRAFQPH...) - **couvre 24 ET 87**, tous deux en Nouvelle-Aquitaine. Rien à dupliquer à ce niveau.
- **Départemental** (lien événements, lien annuaire, Conseil départemental, CCAS, Cap Emploi et Mission Locale locaux) - **seule couche qui se multiplie par département**, via une petite config.

Comment le site statique connaît le département : soit une **config au build** (une "version 24", une "version 87" - cohérent avec le fait que l'app est déjà embarquée séparément chez PCGI 87), soit **demandé une fois** à l'usager et gardé en local. À trancher avec Denis. Cette notion de territoire rejoint l'idée d'**objets métier partagés** (`docs/IDEES_A_RECLASSER.md`, point D/5).

---

## 15. Apport externe 2026-08-31 (collé par Denis, NON réconcilié avec les sections 1 à 14)

Denis a collé dans le chat une proposition détaillée d'un assistant externe. C'est de la **matière d'inspiration**, pas une décision. Elle est plus ambitieuse que la doctrine « rester modeste » des sections 1, 7 et 9 : deux points de conflit restent à trancher (voir plus bas).

**Cadrage proposé** : non pas « un module d'actualités » mais « un module de veille professionnelle intelligente », qui répond à « qu'est-ce qui a changé depuis la dernière fois et qui peut impacter mon travail ? ». Contextualise, priorise, rend l'information directement exploitable dans l'accompagnement.

**Rubriques proposées (14)** : 1. Veille réglementaire (dispositifs : France Travail, CPF, CEP, VAE, RSA, CEJ, PACEA, aides à l'embauche, AGEFIPH, FSE+, France 2030, dispositifs régionaux). 2. Veille juridique (Code du travail, décrets, arrêtés, circulaires, BO, JO ; format « avant -> après -> conséquences pour le CIP »). 3. Veille France Travail (services, interface, aides, appels à projets / à offres). 4. Veille formation (organismes, certifications RNCP / RS, formations financées, actions régionales). 5. Veille Région (par région). 6. Veille emploi (métiers en tension, secteurs qui recrutent, métiers émergents / qui disparaissent, par territoire). 7. Statistiques (INSEE, DARES, France Travail, France Compétences, Eurostat, OCDE ; requêtes du type « demandeurs d'emploi < 26 ans en Haute-Vienne », « évolution du chômage sur 5 ans »). 8. Évènements (salons, forums, job dating, webinaires, portes ouvertes, filtrés par département). 9. Appels à projets (FSE, Région, France Travail, Europe, fondations). 10. Organismes à surveiller (France Travail, Mission Locale, Cap emploi, APEC, AGEFIPH, ANLCI, France Compétences, Ministère du Travail, ANACT, CNIL, CAF, CPAM, Région, Départements). 11. Base documentaire (décret, circulaire, instruction, guide, FAQ, rapport, étude, livre blanc). 12. Indicateurs économiques (inflation, SMIC, RSA, APL, prime d'activité, ASS, AAH, minimum vieillesse, barème kilométrique, coût des formations). 13. Intelligence métier : produire « ce qui change pour un CIP aujourd'hui » -> ce qui est nouveau / pourquoi c'est important / publics concernés / démarches qui changent / actions à mettre en oeuvre. 14. Recherche intelligente en langage naturel (« les nouveautés sur le CPF », « les aides pour les travailleurs handicapés », « les métiers en tension autour de Limoges »).

**Sources proposées** — *officielles* : Journal officiel, Légifrance, Ministère du Travail, France Travail, France Compétences, DARES, INSEE, AGEFIPH, Régions, Carif-Oref et leur réseau, Mon Compte Formation, RNCP / Répertoire spécifique, Europe (FSE+). *Complémentaires* : APEC, Cap emploi, UNML, OPCO (Atlas, AKTO, Constructys...), Centre Inffo, Défi Métiers, OREF régionaux, branches professionnelles.

**Architecture proposée en 4 espaces** : (1) « À retenir aujourd'hui » : les 5 à 10 changements les plus importants depuis la dernière consultation. (2) « Explorer » : recherche par thème. (3) « Tableau de bord » : indicateurs avec filtres territoire / période. (4) « Assistant de veille » : recherche en langage naturel qui interroge des sources récentes et fournit une synthèse référencée.

**Points de conflit avec les sections 1 à 14, à trancher avec Denis :**
1. **« À retenir depuis la dernière consultation »** suppose une **mémoire de visite**, explicitement écartée (section 6, 2e principe de la Constitution, « aucun stockage »).
2. **L'ampleur** (14 rubriques, agenda et appels à projets auto, tableaux de bord) contre le fil rouge « rester modeste, sinon le module dérive en agrégateur » (sections 1, 7, 9) et la maintenance par une seule personne.

Décision Denis 2026-08-31 : la **maquette de la page de présentation** (`docs/MAQUETTE_INTRO_SE_TENIR_INFORME.html`) présente **les deux faces** (assistant de veille par thème + recherche en langage courant sourcée, ET carte curatée de repères durables + tableau des sources), en texte commun bénéficiaire / professionnel, **sans** le « à retenir depuis la dernière visite ». La méthode précise (périmètre exact, cadence, choix de l'assistant) reste à définir.

---

## 16. Récolte multi-IA du 2026-08-31 (2e tour) - synthèse et recalibrage

Denis a envoyé un brief (annexe 15bis) à plusieurs assistants et collé leurs réponses. **Convergence très forte.** Ce qui suit est le tri.

### 16.1 Le critère de conception à garder en tête

> **Quel est le plus petit module qui reste utile même s'il n'est pas mis à jour pendant plusieurs mois ?**

Reformulation du « test des 6 mois » (partie 5) en critère directeur. Si le module perd tout son intérêt après quelques semaines sans intervention, il est trop ambitieux pour une personne seule.

### 16.2 Ampleur : tous les assistants réduisent fortement les 14 rubriques

**Retiré, unanime** (logique de média, maintenance intenable) : événements, appels à projets (comme rubrique), « intelligence métier », tableau de bord, indicateurs économiques figés, « à retenir aujourd'hui » / mémoire de visite, actualités, assistant de veille avec alertes.

**Retenu** : une poignée de dossiers seulement. Deux découpages proposés :
- **Par fonction** (le plus résilient) : (1) *Comprendre* - explications stables (dispositifs, acteurs, démarches, notions) ; (2) *Trouver une source officielle* - liste organisée de liens, l'app ne recopie rien ; (3) *Vérifier une information récente* - recherche par prompt (montants, financements, métiers en tension, statistiques, recrutements) ; (4) *Comprendre son territoire* - repères durables, quelles structures, où trouver les données locales, **pas de chiffres** ; (5) *Définitions* - le lexique, même base.
- **Par thème** (3 à 6 dossiers) : Droit et démarches - Dispositifs et aides - Formation - Emploi et métiers - Repères par territoire (+ Sources officielles, + Lexique).

Recommandation de Claude : le découpage **par fonction** (5 familles) - il porte le critère 16.1 dans sa structure même.

### 16.3 Maintenance (converge)

- **Rédigé à la main** = repères durables : définitions, « qu'est-ce que le CPF / OPCO / VAE », principes des dispositifs, rôle des acteurs, fiches méthode. Révision annuelle, sauf réforme majeure.
- **Lien sortant uniquement** = tout montant, barème, seuil, liste de métiers en tension, événement, appel à projets. Jamais figé dans l'app.
- **Rituel mensuel (2 à 4 h)** : (1) vérifier les liens cassés (30-45 min, un petit script local de détection de liens morts est recommandé) ; (2) choisir 2 à 4 fiches sensibles, lancer le prompt mainteneur, vérifier sources et dates, mettre à jour, changer « Vérifié en [mois année] » (1 h à 1 h 30) ; (3) contrôler le tableau des sources officielles (15-30 min) ; (4) nettoyer / fusionner les fiches redondantes (tous les 2-3 mois).
- Gabarit d'une fiche : Définition - Résumé - Quand utiliser cette information - Ce qui évolue régulièrement - Sources officielles - Date de vérification.

### 16.4 Séparation « rédigé à la main » / « source vivante » (converge)

Deux **blocs visuellement distincts** dans chaque fiche :
- **« Ce que cette fiche explique »** (fond gris clair) - texte de repère + « Rédigé et vérifié en [mois année] ».
- **« Pour connaître la situation actuelle »** (cadre coloré + icône lien externe) - liens vers sources institutionnelles (Service-Public, Légifrance, France Travail, région…), mention « ce lien est actualisé par l'organisme qui le publie ».
- Encadré **« Ce qui peut changer souvent »** (montants, listes, conditions d'éligibilité).
- **Bandeau « À revérifier » automatique** dès que la date de vérification dépasse 6 mois (basé sur la date de dernière modification du fichier, aucun coût). Jamais de faux « mis à jour aujourd'hui ».

### 16.5 Prompts : deux familles (converge)

- **Mainteneur** (exigeant) : recherche web obligatoire - pour chaque affirmation : source + date + territoire - priorité aux sources officielles - **signale les évolutions depuis la précédente vérification** - distingue « informations durables » / « informations susceptibles d'avoir changé » - **ne rédige aucune conclusion**.
- **Personne** (simple) : « Je cherche une information récente concernant : … - recherche web obligatoire - cite la source - donne la date - précise le territoire - si plusieurs réponses selon les régions, indique-le - si l'information dépend de critères personnels, explique lesquels **sans conclure à ma place** ».
- Règle commune : **jamais de classement, de recommandation ni de score.**

### 16.6 Territoire sans stockage (converge : hybride)

- **Config au build** pour les déploiements institutionnels (une instance par territoire, ex. version 87 / version 24 - cohérent avec l'intégration séparée chez PCGI 87). Le fichier de config porte : nom du département, nom de la région, liens vers les sites institutionnels locaux.
- **Question éphémère** « Quel territoire souhaitez-vous consulter ? (France / ma région / mon département) » pour les déploiements larges - adapte les liens et pré-remplit les prompts **pour la session en cours seulement**, aucune mémoire.
- Modèle à 3 couches déjà acté (partie 14) : national - régional (Nouvelle-Aquitaine couvre 24 ET 87) - départemental (seule couche qui se multiplie).
- **Piège signalé** : la « sur-territorialisation » (décliner chaque fiche par département) multiplie la maintenance - les fiches restent nationales, seuls les liens locaux varient.

### 16.7 Une seule source de vérité (converge - « le point le plus important »)

Un **objet documentaire unique** par sujet : identifiant - titre - définition - résumé - acteurs concernés - sources officielles - date de vérification - mots-clés / tags.
- Le **Lexique** affiche uniquement la définition (index de liens vers la fiche complète).
- Le bloc **« Freins et ressources »** (`data/freins.js`, déjà existant, champ `quiVoir`) affiche le résumé + les liens + les acteurs.
- Le module affiche la **fiche complète**.
- **Un fichier source unique, plusieurs vues générées au build.** Jamais recopier le contenu ailleurs - seulement référencer (balisage / tags). Rejoint la Règle 13 de `LECONS` (une donnée = une source de vérité) et `docs/BRIQUES_COMMUNES.md`.

### 16.8 Nom du module : « Se tenir informé » remis en cause

Consensus : « Se tenir informé » évoque trop une **veille continue** (une obligation pour un professionnel, « il faut suivre l'actu » pour une personne fragile). Chercher un nom qui dit **« comprendre quand j'en ai besoin »**. Propositions rendues, par préférence des assistants :
- **« Mieux comprendre »** (le plus cité, accessible aux deux publics)
- **« Comprendre le cadre »** (+ sous-titre : « Des fiches courtes et des liens officiels pour comprendre l'emploi, la formation et les aides, à votre rythme »)
- « Comprendre les démarches » - « S'informer » - « Informations utiles » - « Repères et démarches »
- ajout du 2e retour (avec la récolte ATS, 2026-08-31) : « Infos pratiques » - « Repères utiles » - « Points utiles »

**À trancher par Denis.** « Se tenir informé » est déjà le nom de la carte d'accueil, de la route (`se-tenir-informe-intro`), de la maquette (`MAQUETTE_INTRO_SE_TENIR_INFORME.html`) et de `pageIntroSeTenirInforme` - un changement se répercute partout.

### 16.9 Test des 6 mois : réussi par la version réduite (unanime)

Restent utiles sans aucune mise à jour : définitions, explications, sources officielles, liens, prompts, lexique. Vieillissent : la date de vérification, quelques liens (→ bandeau « à revérifier »). **Échouerait** s'il contenait : métiers qui recrutent, statistiques, événements, appels à projets, financements figés → signe de sur-ambition.

### 16.10 Risques (converge)

Ajout progressif de rubriques « parce qu'elles seraient utiles » - recopier du volatil dans les fiches « pour éviter un clic » - fichier de base qui gonfle (discipline d'organisation par thèmes) - obsolescence silencieuse des liens externes (les sites institutionnels changent leurs URL) - friction du double copier / coller pour le public en grande fragilité numérique (étayage au 1er usage) - faux sentiment d'exhaustivité - sur-territorialisation.

### 16.11 Notes d'autocritique rendues : 16 à 19 / 20

Points faibles récurrents : aucun test utilisateur ; dépendance à la qualité de l'assistant web et à la discipline mensuelle du mainteneur ; le mécanisme « une seule source de vérité » demande une structuration propre des fichiers statiques et une discipline éditoriale.

### 16.12 Décisions à prendre par Denis avant maquette

1. Découpage : **par fonction (5 familles)** ou par thème (3-6 dossiers) ?
2. Nom : « Mieux comprendre » / « Comprendre le cadre » / autre ? (répercussions carte + route + maquette + aide)
3. Territoire : config au build seule, question éphémère seule, ou hybride ?
4. Retire-t-on de la maquette de présentation la puce « recherche en langage courant vers un assistant en ligne » ? La récolte la conserve mais bien encadrée.
5. L'objet documentaire unique (16.7) est-il un chantier commun avec le Lexique et `data/freins.js` (maquette + plan, jamais à chaud) ?

---

## 15bis. Annexe : brief envoyé aux assistants (2e tour, 2026-08-31)

Contexte : APP, application web statique d'accompagnement de parcours professionnel, public en fragilité numérique + professionnels de l'insertion, un seul mainteneur, sans budget, tout par copier / coller. Philosophie : aide à comprendre, ne décide jamais, ne cherche jamais à retenir l'attention (pas de flux, pas de notification, pas de mémoire de consultation).

Module à enrichir : « Se tenir informé » (nom non tranché ; ni « Actualités » ni « Repères »). Coeur = un fichier texte de base maintenu à la main (mensuel) via des prompts sourcés, qui alimente aussi le Lexique et le bloc « freins et ressources ». Façade = quelques dossiers thématiques, fiches courtes « vérifié en [mois] » + lien officiel, tableau des sources, recherche par prompt. Une proposition externe à 14 rubriques + 4 espaces est sur la table mais pose deux problèmes (mémoire de visite ; ampleur intenable pour une personne seule).

8 questions : ampleur (garder / fusionner / retirer) - maintenance réaliste (2-4 h/mois) - séparation écran « rédigé » / « source vivante » - prompts (mainteneur + personne, règles) - territoire sans stockage - alimentation Lexique + freins sans duplication - nom - test de résilience à 6 mois.

Garde-fous : module de référence durable, pas un média ; signaler toute proposition qui suppose base / serveur / compte / budget / mémoire ; jamais de flux, notification, « nouveau », compteur ; tout volatil reste un lien ou une recherche par prompt ; honnêteté sur la fraîcheur.

Format : (a) textes pour la personne et le professionnel - (b) fonctions avec « ce que ça améliore » ET « ce que ça coûte en maintenance » - (c) risques et dérives, y compris dans ses propres propositions - (d) autocritique notée sur 20.
