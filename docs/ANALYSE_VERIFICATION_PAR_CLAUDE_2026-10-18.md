# Analyse : un bouton qui confie les vérifications du sas à Claude (idée de Denis, 2026-10-18)

**Statut : analyse faite, AUCUN code. DÉCISIONS DE DENIS (2026-10-18) : D1 = Claude n'écrit que des preuves, jamais la date ni la publication ; D2 = Denis contrôle 1 carte sur 10 au hasard ; D3 = un lot d'essai de 20 cartes d'abord ; D4 = Denis essaie d'abord l'étape 1 (contrôle automatique du sas) sur son poste. NE RIEN CODER de ce bouton avant ses retours sur l'étape 1 ; puis décider de l'ordre avec l'étape 2 (revérification à six mois).** `[effort : haut]`, Mode A.

## L'idée de Denis
Un bouton, désactivé par défaut. Quand il l'active et lance, Claude fait lui-même les vérifications des cartes du sas (et plus tard des fiches publiées), à la place de Denis. **Condition unique** : la qualité doit être exemplaire, comme si Denis l'avait faite : tout vérifié, jamais partiellement ; tout point d'interrogation ou besoin de vérification manuelle est mis de côté pour Denis.

## Ce qui est possible, et ce qui ne l'est pas
1. **L'outil de veille ne peut pas appeler Claude tout seul.** C'est un petit serveur local sans accès à Claude. Il faudrait une clé et un compte d'API payants (facturation à part, par token) : ce serait « plus cher », contraire à la condition de Denis. **Écarté.**
2. **Ce qui marche** : le bouton prépare le travail (une file d'attente de cartes à vérifier, avec les preuves déjà trouvées par le contrôle automatique), puis Denis ouvre une séance Claude Code dans ce dossier et lance une commande du projet (comme `/app`), par exemple `/verifier-sas`. Claude lit la file, vérifie carte par carte avec ses outils (lecture de pages, recherche web, navigateur), écrit ses résultats dans un fichier local, que l'outil affiche sur les cartes. Une séance = un lot (par exemple 40 cartes), reprise possible quand la limite d'usage est atteinte.
3. **Tâche planifiée** (le bureau Claude a des tâches planifiées) : possible aussi, mais elle tourne sans que Denis surveille ; à envisager seulement après un premier lot réussi.

## Ce que Claude peut garantir, et ce qu'il ne peut pas
- **Peut** : retrouver le vrai site quand le domaine n'existe pas (325 sites sur 773 dans le sas), la vraie page de recrutement (222 introuvables), un numéro sur la page « Contact », comparer nom, adresse, commune, territoire, et dire ce qui a changé.
- **Ne peut pas** : lire les sites qui bloquent les robots (71 sur 950), les pages construites en JavaScript, les numéros qui n'existent que sur des cartes ou des annuaires fermés. **Tout ça est mis de côté pour Denis**, ce qui est exactement sa règle.
- **Risque propre à une IA : confirmer à tort.** Garde-fou proposé : **une valeur n'est « confirmée » que si l'outil retrouve LUI-MÊME, mécaniquement, la citation que Claude donne sur la page qu'il cite** (l'adresse de la page et l'extrait sont enregistrés). Sans preuve retrouvée par le code, la valeur reste « à vérifier à la main ». Claude propose, le code contrôle la preuve, Denis décide.
- **Ce que le bouton n'écrit jamais** : la date « Vérifié le » et la publication. C'est le « C'est bon » de Denis qui date (la date dit au public qu'un humain a relu). Les cartes entièrement confirmées arrivent avec toutes leurs preuves (10 secondes de lecture), et Denis contrôle un échantillon au hasard (par exemple 1 carte sur 10) pour mesurer la fiabilité réelle de Claude.

## Coût en usage (honnête)
- Lire les pages en entier, carte par carte : de l'ordre de 15 000 à 30 000 tokens par carte, soit des dizaines de millions pour 950 cartes : **irréaliste**.
- Version réaliste : le contrôle automatique (gratuit, 93 secondes pour tout le sas) fournit des preuves compactes ; Claude ne traite que les cartes ambiguës, avec ces preuves (environ 2 000 à 5 000 tokens par carte), par lots. Les 255 cartes déjà « concluantes » n'ont pas besoin de Claude ; les 325 sites introuvables demandent une recherche web (le plus coûteux).
- À mesurer sur un premier lot de 20 cartes avant de s'engager : c'est la seule façon d'avoir un chiffre fiable.

## Décisions que Denis doit prendre
- **D1** : la vérification de Claude écrit-elle seulement des preuves (recommandé), ou peut-elle dater une fiche ? (Recommandé : jamais de date automatique.)
- **D2** : échantillon de contrôle par Denis (recommandé : 1 carte sur 10 au début) ?
- **D3** : on commence par un lot d'essai de 20 cartes pour mesurer qualité et coût, avant tout le sas ?
- **D4** : ordre : étape 2 (revérification à six mois) avant ou après ce bouton ? Recommandé : essayer d'abord l'étape 1 sur le poste de Denis, puis décider.

## Plan si GO
1. File d'attente et fichier de résultats de Claude (formats, vérification mécanique des preuves) ; 2. affichage sur les cartes (« vérifié par l'assistant, preuves » / « mis de côté : pourquoi ») ; 3. bouton désactivé par défaut + commande `/verifier-sas` ; 4. lot d'essai de 20 cartes, mesure, ajustement.
