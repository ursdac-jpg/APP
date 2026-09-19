# Chantier « Comprendre les chiffres » : extraction en module autonome

> Ouvert le 2026-09-06. **Mode A** (décision d'architecture + d'UX). Conception
> ouverte : rien n'est tranché tant que Denis n'a pas validé, bloc par bloc.
>
> Précédent : le digest « Comprendre les chiffres » est aujourd'hui un simple
> écran « outil » à l'intérieur du module « Comprendre le cadre »
> (`_comprendreLeCadreEtat.ecran === 'chiffres'`), sans contenu réel. Denis veut
> l'**extraire en module à part** : intro propre, barre de navigation propre,
> fil d'Ariane propre.
>
> Sources de conception : `docs/MAQUETTE_SE_TENIR_INFORME_PARCOURS_2026-09-03.html`
> (écran « chiffres », décisions 21 et 33), `docs/CHANTIER_SE_TENIR_INFORME_MAJ_2026-09-03.md`
> § 17.6 et 17.21, `docs/VEILLE_PROMPTS.md` § 5ter (le prompt `[CHIFFRES]` et le
> format de fichier), et les retours de plusieurs assistants en ligne collectés
> par Denis le 2026-09-06 (synthétisés au § 4).

---

## 1. Le parcours réel aujourd'hui

1. Accueil de l'app -> carte **« Se tenir informé »** (`data-carte-accueil="informe"`,
   `js/app.js`) -> `naviguerVers('se-tenir-informe-intro')`.
2. -> page d'introduction `pageIntroSeTenirInforme()` (`data/metiers.js`, route
   `se-tenir-informe-intro`), titrée « Comprendre le cadre ».
3. -> bouton « Ouvrir Comprendre le cadre » -> `naviguerVers('comprendre-le-cadre')`
   -> **accueil du module « Comprendre le cadre »**.
4. accueil du module -> section **« Outils »** (sous les 14 rayons) -> sous-carte
   **« Comprendre les chiffres »** (`COMPRENDRE_LE_CADRE_OUTILS`, entrée `chiffres`).
5. clic -> `_comprendreLeCadreOuvrirDigest('chiffres')` -> écran digest
   (`_comprendreLeCadreRenduDigest` + `_comprendreLeCadreRenduDigestCorps`).

**État de l'écran 5 aujourd'hui** : aucun fichier `contenu/chiffres/*.md`
n'existe -> l'écran affiche « Aucun digest disponible pour le moment ». Le rendu
prévu est un markdown souple, c'est un **placeholder**, pas ce que veut la
maquette.

Barre d'étapes du module : `[Accueil | Un rayon | Affiner ma recherche | Outils]`.
« Comprendre les chiffres » est sous « Outils » (index 3). Bouton Retour ->
« Tous les rayons » -> accueil du module.

---

## 2. Ce que le module doit être (cible)

Deux parties : **A. les chiffres du territoire** (stockées, en 3 couches - voir
§ 4) et **B. une autre question sur les chiffres** (en direct, rien stocké).

### Deux niveaux de lecture (décision Denis 2026-09-06)

Un bouton en tête de l'écran principal : **« Vue simple »** (par défaut) /
**« Vue d'ensemble »**. Le module sert deux publics : une personne fragile qui
veut savoir où en est l'emploi près de chez elle, et un professionnel de
l'insertion qui lit une **situation**, pas un chiffre isolé.

- **Vue simple** : les 5 cartes de la couche 1, une idée à la fois, dépliants
  fermés.
- **Vue d'ensemble** (pour les CIP) : voir le § 5bis.

### Partie A - Les chiffres du territoire

- **Couche 1 - la photo du trimestre** : l'écran par défaut. 5 cartes (§ 4).
  Vient d'un fichier `contenu/chiffres/<dernier-mois-du-trimestre>.md`, produit une
  fois par trimestre par `outils/veille.html` (bloc `[CHIFFRES]`, format 7 champs :
  `indicateur / territoire / valeur / date_donnee / valeur_precedente / serie / source`).
- **Couche 2 - le portrait du territoire** : dépliée au clic en vue simple,
  ouverte en vue d'ensemble. Rafraîchie 1x/an, fichier séparé
  (`contenu/chiffres/portrait-<annee>.md`).
- **Couche 3 - ce qui se prépare (BMO)** : bloc à part, sa propre date, 1x/an.
- **Choix du territoire** (décision Denis 2026-09-06) :
  - **Quel département** : le **composant partagé de « Comprendre le cadre »**
    (`demanderDepartementSiInconnu()` / `CLE_DEPARTEMENT_RESSOURCES`), le même
    rectangle, jamais un nouveau sélecteur. Deux départements pour l'instant :
    Dordogne (24) et Haute-Vienne (87).
  - **Niveau de lecture** : un toggle à **4 pastilles** - « Mon département /
    Ma région (Nouvelle-Aquitaine) / France entière / **Union européenne** ».
    **Tous les chiffres de l'écran s'adaptent au niveau choisi.**
- **Niveau « Union européenne »** (décision Denis 2026-09-06, dans la V1) :
  quand cette pastille est choisie, l'écran montre **les 10 indicateurs
  harmonisés les plus importants, France comparée à la moyenne de l'UE-27**
  (et, plus tard, à un pays au choix). L'UE n'a pas les mêmes indicateurs que le
  local (pas de « demandeurs France Travail »), donc à ce niveau la liste est
  spécifique. Source **Eurostat**. Cadrage : mise en perspective, jamais un
  jugement sur la France, jamais un repère pour l'usager en recherche. Les 10 :
  taux de chômage (BIT) · chômage des jeunes (15-24) · part du chômage de longue
  durée · taux d'emploi (20-64) · taux d'activité · part des NEET (jeunes ni en
  emploi ni en études ni en formation) · part du temps partiel · part de
  l'emploi temporaire (CDD) · écart de salaire femmes-hommes · part des 25-64 ans
  diplômés du supérieur. **Choisir un pays précis à comparer = plus tard**
  (`IDEES_A_RECLASSER.md` point J).
- Pour chaque indicateur : **valeur en couleur d'accent + gras** (§ 5),
  « d'après [source], en [date] », infobulle de source au survol du chiffre, et
  un **graphique à barres SVG** (valeur au-dessus de chaque barre, **infobulle au
  survol**, barres empilées + légende quand plusieurs mesures, **jamais un `%` et
  un nombre de personnes sur le même graphique**). En vue simple, le graphe est
  replié derrière « Voir l'évolution sur 8 trimestres » (§ 5quater).
- **Superposition de séries** (§ 5ter) : sur chaque carte, une case « voir aussi
  la région et la France » ; et un bloc « Croiser plusieurs chiffres ».
- « Les trimestres précédents » : archive des digests plus anciens (au clic, on
  bascule sans nouveau `fetch`).
- Dépliants : « ce qu'il faut savoir sur ces chiffres » (lien vers
  `contenu/methode/comment-lire-un-taux-de-chomage.md`) et « zone d'emploi ou
  bassin d'emploi ? ».

### Partie B - « Une autre question sur les chiffres » (en direct, rien stocké)

- Champ libre -> l'app prépare un **texte de recherche** -> la personne le colle
  chez un assistant en ligne -> elle colle la réponse -> l'app **met les chiffres
  en gras et dessine le graphique** -> **rien n'est enregistré** (décision 21).
- C'est un mini « Affiner ma recherche » spécialisé chiffres. Socle et ton repris
  de la veille, comme pour « Affiner ma recherche » (dette B.8 de
  `BRIQUES_COMMUNES.md`).

### Encart de prudence (bas d'écran)

« Les chiffres clés sont une photo trimestrielle, datée et sourcée, pas un tableau
de bord en temps réel. La question libre est traitée en direct et rien n'est
enregistré. Dans les deux cas : simplifier une statistique peut la déformer, on
écrit toujours "d'après [source], en [date]", jamais une vérité, et la fiche
"comment lire ça" est toujours à portée. »

### Code nouveau à prévoir

- un **parseur du bloc `[CHIFFRES]`** (le format de `VEILLE_PROMPTS.md` § 5ter) ;
- un **composant graphique à barres SVG** (le reste de l'app n'en a pas ; la
  maquette fournit le gabarit exact, lignes ~917-972).

---

## 3. Question d'architecture : où vit le module

Aujourd'hui : « Se tenir informé » = 1 carte -> 1 intro -> 1 module. Pour que
« Comprendre les chiffres » ait sa propre intro / barre de nav / fil d'Ariane, il
lui faut un point d'entrée.

| Option | Bénéfice | Risque / coût |
|---|---|---|
| **A (recommandée) : « Se tenir informé » devient un hub à 2 sous-cartes** (« Comprendre le cadre » et « Comprendre les chiffres »), chacune avec sa page d'intro | Les deux modules sont frères, cohérent avec le fait que « Se tenir informé » était déjà pensé pour accueillir d'autres sous-cartes. L'accueil de l'app ne gonfle pas. | Il faut créer l'écran hub (inexistant) et retoucher la bascule `informe`, qui va aujourd'hui direct à l'intro de « Comprendre le cadre ». |
| **B : « Comprendre les chiffres » a sa propre carte sur l'accueil de l'app** | Visibilité maximale, entrée en 1 clic. | Une carte de plus sur un accueil déjà chargé (méga-chantier accueil en attente). Noie le lien conceptuel avec « Comprendre le cadre ». |
| **C : ça reste une sous-carte « Outils » de « Comprendre le cadre »**, mais l'écran gagne son propre chrome | Le moins de plomberie ; l'accueil du module bouge peu. | Un fil d'Ariane dans un fil d'Ariane, peu clair pour le public. Contredit la demande d'« intro propre ». |

**Recommandation : Option A.** Elle est la plus cohérente sur le long terme et ne
touche pas l'accueil de l'app (mégachantier en attente). L'écran hub reste léger :
un titre, deux sous-cartes avec la brique `.sous-carte-accueil` déjà utilisée.

---

## 4. Les indicateurs (synthèse des retours d'assistants + `VEILLE_PROMPTS.md` § 5ter)

Denis a collecté le 2026-09-06 les retours de plusieurs assistants en ligne, puis
a ajouté sa propre liste (tissu d'entreprises, contrats, intérim, égalité
femmes-hommes, temps de travail...). Constat : **la plupart de ces indicateurs ne
bougent pas tous les trimestres** - ce sont des portraits qui se rafraîchissent
une fois par an. D'où une organisation en **3 couches**.

### Couche 1 - La photo du trimestre (5 indicateurs, séries 6 à 8 trimestres, trio département / région / France)

C'est l'**écran par défaut**, cadré pour le public fragile.

| # | Indicateur | Question simple | Source | Fréquence |
|---|---|---|---|---|
| 1 | **Taux de chômage localisé** (BIT) | « Sur 100 personnes actives, combien sont au chômage ? » | Insee, « Taux de chômage localisés » | Trimestrielle. **Dernier trimestre provisoire.** |
| 2 | **Demandeurs d'emploi cat. A** (+ détail A / B / C en dépliant) | « Combien de personnes cherchent un emploi sans en avoir ? » | Dares / France Travail, STMT | Trimestrielle |
| 3 | **Part des inscrits depuis plus d'un an** parmi les A / B / C | « La difficulté est-elle passagère ou installée ? » | Observatoire des territoires (STMT) | Trimestrielle |
| 4 | **Emploi salarié : niveau + variation du trimestre** | « Le territoire crée ou perd des emplois ? » | Insee, estimations trimestrielles (ou Urssaf) | Trimestrielle |
| 5 | **Offres collectées par France Travail** (+ part d'offres durables : CDI ou CDD > 6 mois) | « Y a-t-il des offres visibles, et sont-elles stables ? » | France Travail, « Offres d'emploi et recrutements » | Trimestrielle |

### Couche 2 - Le portrait du territoire (rafraîchi 1x/an, déplié au clic, surtout pour les CIP)

Pas des « photos du trimestre » : des repères de fond sur le tissu économique et
le marché du travail local. Chacun avec sa propre date, cadré comme du contexte,
jamais comme un jugement.

**Décision Denis 2026-09-06 (revient sur la V1 allégée) : TOUT dans la V1.**
Pour un nouveau module il n'y a pas de « régression », mais Denis ne veut aucune
perte de quantité ni de qualité d'information par rapport à ce qui a été conçu
ensemble. Le coût assumé : un chantier plus long et une production annuelle du
portrait plus lourde. Contrepartie : le portrait ne se rafraîchit qu'une fois par
an, donc l'effort est ponctuel.

| Bloc | Contenu | Source | Échelle réelle |
|---|---|---|---|
| **De quoi vit le territoire** | poids des grands secteurs (agriculture, industrie, construction, commerce, services, santé-social) + nombre d'entreprises par taille (très petites / PME / grandes) | Insee (Flores, démographie des entreprises, estimations d'emploi) | Département |
| **Comment on est embauché ici** | part de CDI / CDD / contrats très courts (moins d'un mois) ; poids de l'intérim par secteur ; poids du temps partiel par secteur | Dares (déclarations d'embauche, emploi intérimaire) + Insee | Région, département partiel |
| **Le marché n'est pas le même pour tout le monde** | répartition femmes / hommes par secteur + écart de salaire femmes-hommes (cadrage neutre) | Insee | Région surtout |
| **Salaires par secteur** | salaire net médian par grand secteur | Insee | Région / national |
| **Qui cherche un emploi ici** | répartition par âge des demandeurs d'emploi (moins de 25 ans, 50 ans et plus) + nombre accompagnées au titre du RSA | STMT + CAF / conseil départemental | Département |
| **Le territoire bouge-t-il** | créations d'entreprises et de micro-entreprises + poids de l'emploi lié au tourisme | Insee | Département |
| **Qui habite ici** (ajout Denis 2026-09-06) | structure par âge de la **population** (jeunes / actifs / 60 ans et plus / 75 ans et plus) - aide à comprendre le territoire (ex. beaucoup de personnes âgées -> le premier employeur est une structure médicale) | Insee (recensement) | Département |
| **Le niveau de formation** (ajout Denis 2026-09-06) | niveau d'études de la population des 25-64 ans (sans diplôme / CAP-BEP / bac / supérieur) - marqueur d'accompagnement | Insee (recensement) | Département |
| **Éditorial** (voir plus bas) | calendrier de saisonnalité + principaux employeurs | à la main, daté, sourcé | - |

**Bloc éditorial adossé à la couche 2** (pas des « chiffres », écrits à la main,
datés, avec source - à décider avec Denis, voir § 9) :
- **Calendrier de saisonnalité** par département (déjà noté dans
  `IDEES_A_RECLASSER.md`).
- **Principaux employeurs du territoire** (ex. en Dordogne : la Fondation John
  Bost...) : les 4-5 plus gros, leur secteur, un ordre de grandeur d'effectif.
  **Aucune série officielle ne les nomme** : source = CCI, presse économique
  locale, Cap Métiers. Formule prudente, jamais « où postuler ».

### Couche 3 - Ce qui se prépare (enquête BMO, 1x/an au printemps)

Intentions d'employeurs, pas embauches. Exploitable surtout au bassin d'emploi et
à la région, pas toujours au département. Bloc à part, avec sa propre date.

| Indicateur | Question simple | Source |
|---|---|---|
| **Projets de recrutement dans l'année + top métiers locaux** | « Dans quels métiers les employeurs pensent embaucher ? » | BMO |
| **Part des projets jugés difficiles à pourvoir** | « Les employeurs ont-ils du mal à recruter ? » (à nuancer, § 6) | BMO |
| **Part des projets saisonniers** | « Ces embauches sont-elles liées à une saison ? » | BMO |
| **Part des projets accessibles sans diplôme ou aux débutants** | Réassurance directe pour le public visé | BMO (dispo variable) |

### Écartés (ou simple tag de lecture, jamais un chiffre en avant)

- **Catégories B et C isolées** : trop technique. Restent dans le dépliant
  « détail A / B / C » de l'indicateur 2.
- **Ratio brut « offres par demandeur d'emploi »** : anxiogène et biaisé.
- **Indice synthétique de tension** (score 0,8 / 1,5) : opaque.
- **Classements de départements** : hiérarchie morale, pas une aide.
- **Top employeurs nommés en indicateur chiffré** : pas de source officielle -> si
  on le fait, c'est en éditorial (voir couche 2), pas en « chiffre ».
- **Données de sites d'offres privés / baromètres non labellisés** : pas de
  garantie méthodologique.

### Points de vigilance sur la couche 2

- **Écart de salaire femmes-hommes** : légitime et important pour un CIP, mais
  sujet sensible et donnée surtout régionale. Cadrage : « le marché du travail
  n'est pas le même pour tout le monde », jamais un ton militant ni fataliste.
- **Salaire médian** : « la moitié des salaires sont en dessous, la moitié
  au-dessus - ça dépend fortement du poste, du temps de travail, de l'ancienneté ».
- **RSA** : « combien de personnes sont accompagnées » (jamais « part de pauvres »).
- **Âge** : une répartition des demandeurs d'emploi, jamais une carte « les
  seniors ne s'en sortent pas ».

### Cap Métiers (CARIF-OREF Nouvelle-Aquitaine)

À utiliser pour les **filières, formations, événements, parcours** (renvois),
**jamais comme source statistique de référence**.

---

## 5. Règles de présentation (convergentes dans tous les retours)

- **Une carte = une idée.** Titre en question simple (« Combien de personnes
  cherchent un emploi ici ? »), pas un libellé technique.
- **Un seul nombre en grand**, arrondi (« environ 12 300 », pas « 12 287 »). Pour
  un taux, le `%` ; pour un effectif, un nombre rond.
- **Phrase en langage courant** sous le chiffre : « Sur 100 personnes actives dans
  le département, environ 7 sont au chômage. » Jamais de formule (« taux =
  chômeurs / actifs »).
- **Double comparaison, systématique et identique sur chaque carte** :
  - dans le temps : trimestre précédent **et** même trimestre l'année précédente
    (le second neutralise l'effet de saison) ;
  - dans l'espace : département, Nouvelle-Aquitaine, France.
- **Tendance en mots** (« en légère baisse », « à peu près stable », « en hausse
  modérée ») + une flèche discrète (haut / bas / stable). **Pas de rouge / vert
  agressif** ; couleur d'accent sobre, jamais alarmiste. Respecter le daltonisme
  (LECONS 9.1 / 9.10).
- **« 1 sur 4 » avant « 25 % »** quand c'est possible.
- **Toujours daté et sourcé** : « d'après [source], données du [trimestre] ».
  Mention « photo arrêtée au [date], prochaine mise à jour [date] ».
- **Mini-graphique** : 6 à 8 trimestres, seulement pour les indicateurs
  trimestriels (1 à 5). Barres empilées + légende dès plus d'une couleur. Jamais
  un `%` et un nombre de personnes sur le même graphe.
- **Superposition de séries : même unité uniquement.** On peut tracer plusieurs
  séries sur un graphe **si elles ont la même unité** (des `%` ensemble, ou des
  nombres ensemble). **Jamais un `%` et un nombre de personnes sur le même
  graphe** - deux échelles = fausse relation, le piège n°1 des mauvaises stats.
- **Tous les chiffres et pourcentages en couleur d'accent** (demande Denis
  2026-09-06). Chaque valeur numérique dans le texte, les phrases, les tableaux,
  les blocs du portrait est rendue en `var(--accent)` et en gras - « les chiffres
  sont ce qui compte dans ce module, ils doivent ressortir ». La valeur en tête
  de carte reste la plus grosse ; les chiffres en ligne sont accent + gras mais
  taille normale (garder la hiérarchie).
- **Infobulle de source sur chaque chiffre** (demande Denis 2026-09-06) : survol
  d'un chiffre -> infobulle « d'après [source], [dataset], [date] ». En plus (pas
  à la place) du bouton de source en pied de bloc.
- **Aucun lien texte cliquable** (LECONS 9.6). Les sources officielles sont des
  **boutons / pastilles**, jamais un `<a>` souligné - cohérent avec le reste
  d'APP. Dans le module réel, même mécanisme que « Comprendre le cadre » : la
  pastille n'est active que si l'adresse est vérifiée dans un registre
  (LECONS 9.16).
- **Encart fixe « À savoir avant de lire ces chiffres »** (les pièges du § 6),
  toujours visible ou en tête.
- **Archivage** : chaque photo trimestrielle est datée (« T2 2026 ») et
  consultable en historique, mêmes indicateurs à chaque fois.
- **Impression** : une page A4 simple (chiffres + phrases + sources).
- **Jamais un diagnostic sur la personne** : « Ce chiffre décrit le contexte, pas
  votre situation. Il ne dit pas si vous allez trouver un emploi. » (LECONS,
  public cible.)

---

## 5bis. La « Vue d'ensemble » (pour les professionnels de l'insertion)

Décision Denis 2026-09-06 : « un professionnel ne va pas s'attarder à un seul
chiffre, il prend la globalité, l'ensemble ». La vue d'ensemble ajoute, sur le
même écran (bascule en tête) :

0. **Une phrase de garde-fou** en tête (validée Denis 2026-09-06) :
   > « Ces chiffres décrivent un territoire, ils ne concluent rien sur un projet.
   > Ils servent à repérer des difficultés et à s'y préparer avec la personne,
   > jamais à la décourager ni à revoir son projet à la baisse. »

   Le risque réel avec des données de territoire : qu'elles servent à revoir les
   ambitions d'une personne à la baisse.
1. **Un tableau de synthèse** : tous les indicateurs (couche 1 + portrait +
   BMO) sur une grille compacte - valeur, tendance, comparaison territoire -
   lisible d'un coup, sans dérouler.
2. **Une « lecture du territoire » écrite** : 2 à 3 paragraphes qui **relient les
   chiffres entre eux, avec prudence** (« la baisse du taux va souvent de pair
   avec des sorties de liste plutôt qu'avec une vague d'embauches ; les contrats
   proposés sont souvent courts ou saisonniers »). **Principe (précision Denis
   2026-09-06) : le texte décrit et donne deux ou trois indications de lecture,
   il ne prédit rien, il ne juge aucun projet, il n'interprète jamais de façon
   trop affirmée** - sinon il influence la personne au lieu de l'informer.
   **Écrit à la main, daté, jamais généré dans l'app.** Décision Denis : Claude
   aide à rédiger chaque synthèse (à partir des chiffres du digest ou via un
   prompt de l'outil de veille), **Denis vérifie et valide** avant mise en ligne.
   Champ dédié dans le fichier `contenu/chiffres/<mois>.md`.
3. **La mise en relation visuelle** : sur chaque carte, un renvoi « à lire avec :
   [autre indicateur] » ; l'outil « Croiser plusieurs chiffres » (§ 5ter) mis en
   avant, pas enfoui ; le portrait du territoire **ouvert** (pas de dépliants
   pour un pro). Décision Denis : garder **tout le texte** (ne pas raccourcir au
   profit du seul visuel).
4. **Un bouton imprimer** toute la vue d'ensemble (A4), pour préparer un
   rendez-vous.

La vue simple ne change pas. La bascule prépare le terrain pour le futur
interrupteur global « accompagné / autonome » du chantier Accessibilité.

## 5quater. Charge cognitive : rien ne « tombe » d'un bloc

Demande Denis 2026-09-06 : « ne pas avoir l'impression que tout est un bloc ;
voir que ce sont des choses séparées ; ne pas submerger la personne, comme sur
les sites de statistiques où le cerveau bloque devant trop d'informations d'un
coup ».

- **On arrive, on voit les 5 chiffres clés du trimestre, et rien d'autre
  déplié.** Le graphe de chaque carte est replié derrière « Voir l'évolution sur
  8 trimestres ».
- **Tout le reste** (portrait du territoire, BMO, France dans l'UE, croiser,
  pièges, zone d'emploi, archive) = des **panneaux fermés**, chacun avec un
  **titre + une pastille « Cliquez pour ouvrir » + une phrase qui décrit ce qu'il
  y a dedans**. La personne ouvre ce qu'elle veut, une chose à la fois.
- **Séparation visuelle nette** entre les sections (filet, espace, intertitre).
- Rien n'est retiré : tout est là, mais **exposé comme une invitation, pas comme
  un mur**.
- En **vue d'ensemble**, tous les panneaux s'ouvrent (le CIP veut le tout).

## 5ter. Superposition de séries sur un même graphique

Décision Denis 2026-09-06 : les deux niveaux, **dès la V1**.

- **Niveau léger, sur chaque carte de la couche 1** : une case **« voir aussi la
  région et la France »**. Coché -> le graphe ajoute ces 2 séries (même unité,
  sûr - c'est la comparaison déjà affichée en texte). Infobulle = toutes les
  valeurs actives pour le trimestre survolé. Livré avec la couche 1 (bloc 2).
- **Niveau complet, bloc « Croiser plusieurs chiffres »** (couche 2, pour les
  CIP) : une liste de séries **groupées par unité** ; on coche 2 à 4 séries d'un
  même groupe ; elles se superposent (couleur ou opacité par série, légende,
  infobulle multi-valeurs). **L'UI empêche de mélanger un `%` et un nombre.**
  **Décision Denis 2026-09-06 (revient sur le report) : DANS la V1, dès
  l'implémentation.** « C'est très important. » Claude avait recommandé de le
  reporter (complexité, usage incertain) ; Denis tranche pour l'inclure. Le
  composant graphique du module est donc multi-séries dès le départ.

Le composant graphique passe donc de « barres simples » à « multi-séries avec
redessin dynamique » - travail réel, cadré dans le découpage (§ 10).

---

## 6. Pièges de lecture à désamorcer explicitement (encart en bas de module)

1. **« Demandeurs d'emploi » n'est pas « chômage » au sens Insee.** France Travail
   compte des personnes inscrites, par catégories ; l'Insee mesure un chômage au
   sens statistique (enquête). Le second est plus étroit. Ne pas mélanger sans
   l'expliquer.
2. **Le taux de chômage peut baisser sans plus d'emplois.** Des personnes sortent
   des listes : formation, maladie, découragement, radiation, changement de
   catégorie, retraite.
3. **Le dernier trimestre Insee est provisoire.** Il peut être révisé ; l'écrire.
4. **BMO = intentions de recrutement, pas embauches garanties.** Une entreprise
   peut prévoir puis annuler.
5. **« Métier en tension » ne veut pas dire « facile d'y entrer ».** La tension
   peut venir des conditions (horaires, pénibilité, mobilité, prérequis), pas
   d'un simple manque de candidats.
6. **Effet de saison.** Une hausse des offres au printemps en Dordogne est
   habituelle ; comparer toujours au même trimestre de l'année précédente.
7. **Un chiffre brut sans population de référence trompe.** 500 offres ou 5 000
   inscrits n'ont pas le même sens selon la taille du territoire ; garder le taux
   ou le pourcentage à côté.
8. **Sur un petit territoire, un seul employeur peut faire bouger les chiffres.**
9. **Un seul trimestre ne fait pas une tendance.** Regarder 6 à 8 trimestres.
10. **Changements de règles.** Depuis la loi pour le plein emploi (2025), la façon
    dont certaines personnes sont inscrites à France Travail a changé (nouvelles
    catégories). Cela peut faire varier les chiffres administratifs sans que le
    marché du travail bouge vraiment.
11. **Toutes les offres ne sont pas en ligne.** Candidature spontanée, réseau,
    intérim : une part importante des embauches.

---

## 7. La partie B (« autre question sur les chiffres ») : deux portes

Décision Denis 2026-09-06 (« 1 et 2 ») : la partie B offre **deux portes**.

- **Porte 1 - « J'ai une question chiffrée précise »** (un temps) : « le salaire
  dans la restauration ici », « le chômage des moins de 25 ans sur 3 ans ».
  Préparer un texte de recherche -> coller la réponse -> l'app met les chiffres en
  gras et dessine le graphe -> rien gardé. Pour tout le monde.
- **Porte 2 - « Je veux comprendre mon territoire »** (deux temps, plutôt pour un
  CIP) : l'assistant structure d'abord un panorama en sous-chapitres (marché de
  l'emploi, secteurs, publics, tensions...), la personne choisit ceux à creuser,
  deuxième passage plus fin. Même principe que « Affiner ma recherche ». C'est ce
  qui donne la « dimension pro / la compréhension fine du territoire ».

Colle avec la note de mémoire « 2 entrées, 2 prompts ».

**Livraison** : ces deux portes = les **deux derniers blocs** du chantier (après
les chiffres clés), pour valider d'abord le parseur et le graphe sur les données
stables du digest avant de les brancher sur du texte collé imprévisible.

---

## 8. Production et mise à jour (côté `outils/veille.html`)

**Demande Denis 2026-09-06 : le module doit se maintenir avec la même logique que
« Comprendre le cadre ».** Il faut donc, **dans le même chantier**, les prompts de
l'outil de veille qui alimentent ET corrigent le module, chacun avec sa cadence
écrite noir sur blanc. Le prompt `[CHIFFRES]` de `docs/VEILLE_PROMPTS.md` § 5ter
existe mais **ne couvre plus** tout ce qui a été décidé - à étendre.

### Les fichiers de contenu et leur cadence

| Fichier | Contenu | Prompt de veille | Cadence |
|---|---|---|---|
| `contenu/chiffres/<mois>.md` | **couche 1** (5 chiffres clés + séries) + le **tableau de synthèse** + la **lecture du territoire** écrite | `[CHIFFRES]` (étendu) | **trimestrielle** (dernier trimestre civil complet) |
| `contenu/chiffres/portrait-<annee>.md` | **couche 2** entière : tissu d'entreprises, contrats / intérim / temps partiel, femmes-hommes, salaires par secteur, âge des demandeurs + RSA, créations d'entreprises + tourisme, **population + densité**, **âge de la population**, **niveau de formation**, **les freins du territoire** (~10, avec %), + éditorial (saisonnalité, principaux employeurs) | `[PORTRAIT]` (**nouveau**) | **annuelle** |
| `contenu/chiffres/ue-<annee>.md` | **niveau Union européenne** : les 10 indicateurs Eurostat France vs UE-27 + les freins comparables (Eurostat LFS) | `[CHIFFRES-UE]` (**nouveau**) | **annuelle** (Eurostat) |

### Les prompts de la partie B (dans le module, pas dans la veille)

- Porte 1 (question chiffrée précise) et porte 2 (comprendre le territoire) :
  reprennent le **socle de recherche** et le **ton** de la veille (dette B.8), et
  la liste des indicateurs / sources de ce document, pour que l'assistant sache
  quoi chercher et où.

### Le premier jeu de données : de VRAIS chiffres, même rigueur que les 14 rayons

**Demande Denis 2026-09-06 :** à l'implémentation, le module est **déjà rempli
avec des chiffres officiels à jour** ; Denis les vérifie ensuite, puis fait les
mises à jour lui-même. **Pas de valeurs inventées.** Claude produit les trois
premiers fichiers de la **même façon que les 14 rayons de « Comprendre le
cadre »** : ouvrir la page officielle (INSEE « Dossier complet » et séries
chronologiques, DARES / France Travail STMT, France Travail BMO et « offres et
recrutements », Eurostat), relever **valeur + source + date de la donnée**,
marquer « à vérifier » **uniquement** quand la source bloque la lecture
automatique ou que la donnée n'a pas été trouvée. Moins de sites que pour
« Comprendre le cadre » (il en existe peu), mais la même exigence.

### Les cadences de mise à jour - à écrire DANS `outils/veille.html`

Chaque prompt de veille et chaque fichier porte, dans l'outil, sa cadence et sa
prochaine échéance (même principe que le « vu le [date] » de « Comprendre le
cadre ») :

| Prompt / fichier | Cadence recommandée | Quand relancer |
|---|---|---|
| `[CHIFFRES]` -> `contenu/chiffres/<mois>.md` | **trimestrielle** | ~2 à 3 mois après la fin d'un trimestre civil (le chômage localisé et la STMT paraissent avec un trimestre de retard) |
| `[PORTRAIT]` -> `portrait-<annee>.md` | **annuelle** | une fois par an, après la parution des données de recensement et des estimations d'emploi (été) |
| `[CHIFFRES-UE]` -> `ue-<annee>.md` | **annuelle** | une fois par an (Eurostat se met à jour en continu ; une photo annuelle suffit) |
| Enquête BMO (dans `[PORTRAIT]`) | **annuelle** | au **printemps** (publication avril / mai) |
| La « lecture du territoire » (dans `[CHIFFRES]`) | **trimestrielle** | avec le digest de la couche 1 |

Une fois le module en place : **boucler le branchement du volet « Chiffres » de
l'import manuel** (`docs/CHANTIER_IMPORT_MANUEL_VEILLE.md` § 2).

---

## 9. Décisions

### Actées (2026-09-06)

1. **Architecture** (§ 3) : Option A - « Se tenir informé » devient un hub à
   2 sous-cartes.
2. **Salaire médian / RSA / âge** : gardés, dans la couche 2 « portrait du
   territoire », jamais en carte principale, avec le cadrage du § 4.
3. **Partie B** (§ 7) : deux portes (question précise, un temps / comprendre le
   territoire, deux temps). Livrées en dernier.
4. **Visuels** : les graphiques SVG et l'infobulle au survol de la maquette sont
   préservés (demande explicite de Denis).
5. **Indicateurs de la couche 2** : la liste du § 4 est retenue (tissu
   d'entreprises, contrats, intérim, temps partiel, femmes-hommes, secteurs,
   RSA, âge, créations d'entreprises, tourisme).

### Tranchées le 2026-09-06 (toutes sur la reco)

- **D1 - Ordre** : par blocs, la couche 1 (photo du trimestre) d'abord.
- **D2 - Fichier du portrait** : un fichier annuel séparé
  (`contenu/chiffres/portrait-<annee>.md`), distinct du digest trimestriel.
- **D3 - Principaux employeurs** : oui, dans la V1, en bloc éditorial daté, avec
  source (CCI / presse éco / Cap Métiers), formule prudente (« les gros
  employeurs du territoire », jamais « où postuler »).
- **D4 - Écart de salaire femmes-hommes** : oui, dans la V1 de la couche 2, avec
  un cadrage neutre. Donnée surtout régionale.
- **D5 - Digest d'exemple** : Claude fabrique un `contenu/chiffres/2026-06.md`
  d'exemple pour coder dessus, remplacé par le vrai plus tard.
- **D6 - Jetons / structure d'écran** : proposés dans la maquette (bloc 0).
- **D7 - Vue professionnelle** : bouton « Vue simple / Vue d'ensemble » en tête de
  l'écran principal (§ 5bis).
- **D8 - Lecture du territoire** : texte de synthèse écrit à la main (2-3 §) +
  mise en relation visuelle (« à lire avec ») ; **on garde tout le texte**, on
  n'allège pas au profit du seul visuel. Claude aide à rédiger, Denis valide.
- **D9 - Superposition de séries** : « voir aussi région + France » sur les
  cartes + bloc « Croiser plusieurs chiffres » (§ 5ter), **les deux dès la V1**
  (Denis 2026-09-06, revient sur le report).
- **D10 - Périmètre V1 : complet, pas de version allégée** (Denis 2026-09-06,
  revient sur la V1 allégée). Aucune perte de contenu par rapport à ce qui a été
  conçu : couche 2 entière (6 blocs + éditorial), croiser les chiffres inclus.
  Coût assumé : chantier plus long, production annuelle du portrait plus lourde.
- **D11 - Mise en avant des chiffres** (Denis 2026-09-06) : tous les chiffres et
  pourcentages en couleur d'accent + gras ; infobulle de source au survol d'un
  chiffre ; aucun lien texte, les sources sont des boutons / pastilles (§ 5).
- **D12 - Charge cognitive** (Denis 2026-09-06) : on arrive sur les 5 chiffres
  clés seuls ; tout le reste en panneaux fermés avec titre + « Cliquez pour
  ouvrir » + description ; séparation visuelle nette entre sections ; le graphe
  de chaque carte replié en vue simple (§ 5quater). Rien n'est retiré.
- **D13 - Choix du territoire** (Denis 2026-09-06) : réutiliser le **rectangle /
  la fonction de « Comprendre le cadre »** pour le département (24 / 87), jamais
  un nouveau sélecteur ; + un toggle à **4 pastilles** « Mon département / Ma
  région / France / Union européenne » ; tous les chiffres de l'écran s'adaptent
  au niveau choisi.
- **D14 - Niveau « Union européenne »** (Denis 2026-09-06) : une **pastille de
  plein droit** dans le toggle. À ce niveau, l'écran montre **10 indicateurs
  Eurostat harmonisés, France vs moyenne UE-27** (liste au § 3). Comparer à un
  pays précis = plus tard. Le panneau fermé « La France dans l'UE » de la
  maquette v3 est remplacé par ce niveau.
- **D15 - Deux indicateurs de population ajoutés à la couche 2** (Denis
  2026-09-06) : structure par âge de la **population** du département (ex.
  beaucoup de personnes âgées explique un premier employeur médical) et niveau
  d'études des 25-64 ans. Source Insee (recensement).
- **D16 - Complémentarité affichée avec « Comprendre le cadre »** (Denis
  2026-09-06) : un **rectangle à part** (avec les deux icônes) dans l'intro de
  « Comprendre les chiffres » ET dans l'intro de « Comprendre le cadre »
  (`pageIntroSeTenirInforme()`, `data/metiers.js`), disant que les deux vont
  ensemble - l'un donne les repères sur les droits et démarches, l'autre les
  chiffres du territoire. **Pas de bouton, pas de lien de renvoi** entre les
  deux modules : juste la phrase. Le rectangle réciproque dans « Comprendre le
  cadre » se fait au bloc 1.
- **D17 - Infobulle de source sur TOUS les chiffres** (Denis 2026-09-06) : pas
  seulement les valeurs en tête de carte. Chaque nombre / pourcentage en couleur
  d'accent montre au survol d'où il vient, sans avoir à cliquer le lien (qui
  reste disponible en dessous). Dans le module réel : soit un `data-source` par
  chiffre, soit un repli sur la ligne de source du bloc.
- **D18 - Population et densité** (Denis 2026-09-06) : ajouter à la couche 2 la
  population et la densité (hab./km²) du département, de la région et de la
  France - aide à comprendre le poids des services de proximité, les trajets, la
  mobilité comme frein. Source Insee.
- **D19 - Les freins du territoire** (Denis 2026-09-06, « très important » mais
  **pas alarmant**) : un panneau **replié comme les autres**, **même traitement,
  pas de couleur qui tape à l'œil**, pas d'icône « attention ». Denis : « une
  information parmi les autres, exposée de la même façon, que la personne ouvre
  si elle veut - pas une impression de lourdeur dès le départ ». Les ~10 freins
  majeurs (mobilité, santé, numérique, garde d'enfant, logement, français,
  savoirs de base, budget, administratif, isolement), avec un % pour chacun **si
  la source le donne**, au niveau département / région / France - et, pour ceux
  qu'Eurostat permet de comparer (responsabilités familiales, maladie,
  formation), au niveau Union européenne.
  **Caveat honnête** : les études sur les freins sont surtout **nationales** ;
  le régional existe parfois, le départemental rarement. Le bloc dit d'où vient
  chaque chiffre et marque « à vérifier » ou « difficile à chiffrer » quand
  c'est le cas. La liste s'appuie sur `data/freins.js` (freins déjà cadrés par
  Denis).
- **D20 - Prompts de veille dans le même chantier** (Denis 2026-09-06) :
  `outils/veille.html` gagne un bloc « Comprendre les chiffres » avec
  `[CHIFFRES]` (étendu, trimestriel), `[PORTRAIT]` (nouveau, annuel) et
  `[CHIFFRES-UE]` (nouveau, annuel). **Chaque prompt et chaque fichier porte sa
  cadence et sa prochaine échéance dans l'outil** (§ 8).
- **D21 - Premiers chiffres = de vrais chiffres** (Denis 2026-09-06) : à
  l'implémentation le module est déjà rempli de données officielles à jour,
  produites avec la **même rigueur que les 14 rayons** (source + date par
  valeur, « à vérifier » seulement si bloqué). Pas de valeurs inventées. Denis
  vérifie ensuite et prend le relais des mises à jour.
- **D22 - Quatre ajouts de finition** (Denis 2026-09-06) : (a) **3 fiches
  méthode** au lieu d'une (comment lire un taux ; taux INSEE vs inscrits ;
  comment lire une évolution) ; (b) **repère de fraîcheur** visible sous chaque
  titre de section (« Données arrêtées en [mois]. Prochaine mise à jour : [mois]. ») ;
  (c) **évolution de la population** (gagne / perd des habitants) dans le bloc
  « Population et densité » ; (d) **décrochage scolaire** (jeunes 18-24 ans sans
  diplôme ni formation) dans le bloc « Le niveau de formation ». + en vue
  d'ensemble, les graphes « Voir l'évolution » des cartes restent repliés.
- **D23 - Liste des 10 indicateurs UE validée** (Denis 2026-09-06) : la liste du
  § 3 est retenue (ajustable au moment de chercher les vraies données si l'une
  n'est pas disponible).
- **D24 - Méthode de code : bloc par bloc** (Denis 2026-09-06), test navigateur +
  comparaison à la maquette + commit à chaque bloc.
- **AUTONOMIE (Denis 2026-09-06)** : tout ce qui a été validé ensemble est
  validé. Claude exécute les blocs seul, enchaîne, s'arrête seulement sur risque
  de régression / de casse ou impératif majeur. Bilan à la fin.
  **Consigne n°1 : l'implémentation doit être IDENTIQUE à la maquette** - même
  charte graphique, même logique, mêmes boutons, même cohérence.
- **Garde-fou CIP validé** : « Ces chiffres décrivent un territoire, ils ne
  concluent rien sur un projet. Ils servent à repérer des difficultés et à s'y
  préparer avec la personne, jamais à la décourager ni à revoir son projet à la
  baisse. » + principe : la « lecture du territoire » décrit et donne 2-3
  indications, elle ne prédit rien, ne juge aucun projet, n'interprète jamais de
  façon trop affirmée (§ 5bis point 0 et 2).

---

## 10. Découpage proposé

- **Bloc 0** : **maquette** (couches 1-3, vue simple / vue d'ensemble, superposition
  de séries, partie B), langage très simple, libellés exacts, gabarit du graphe,
  **phrase-type** par indicateur, **brouillon de la lecture du territoire** pour
  les données d'exemple. Validation Denis.
- **Bloc 1** : le module autonome coquille - dossier, intro (avec le rectangle de
  complémentarité, D16), route, barre de nav, fil d'Ariane, **écran hub « Se
  tenir informé »** (Option A), retrait de l'entrée `chiffres` de
  `COMPRENDRE_LE_CADRE_OUTILS`, accueil de « Comprendre le cadre » mis à jour,
  **rectangle réciproque dans `pageIntroSeTenirInforme()`** (`data/metiers.js`).
  `npm test` + navigateur.
- **Bloc 2** : **prompts de veille + premiers fichiers de contenu réels** (§ 8) -
  `outils/veille.html` gagne le bloc « Comprendre les chiffres » (`[CHIFFRES]`
  étendu, `[PORTRAIT]`, `[CHIFFRES-UE]`, chacun avec sa cadence affichée),
  `docs/VEILLE_PROMPTS.md` mis à jour. Claude **va chercher les vrais chiffres**
  sur les sources officielles (méthode des 14 rayons) et remplit
  `contenu/chiffres/<mois>.md`, `portrait-<annee>.md` et `ue-<annee>.md` -
  source + date par valeur, « à vérifier » seulement si bloqué. Le module a du
  contenu officiel avant d'être codé ; Denis vérifie ensuite.
- **Bloc 3** : **couche 1, vue simple** - parseur, composant graphe SVG (infobulle
  au survol + case « voir aussi région + France »), rendu des 5 cartes, rectangle
  « Votre département » partagé + toggle 4 niveaux, archive des trimestres,
  dépliants méthode, encart des pièges. Sur les fichiers du bloc 2.
- **Bloc 4** : **couche 2 (tous les blocs, dont population/densité, âge population,
  formation, freins) + couche 3 (BMO) + niveau « Union européenne » (Eurostat,
  dont freins UE)**.
- **Bloc 5** : **« Croiser plusieurs chiffres »** - graphe multi-séries, liste
  groupée par unité, garde-fou anti-mélange `%` / nombre, infobulle multi-valeurs.
- **Bloc 6** : **vue d'ensemble** - bascule, garde-fou CIP, tableau de synthèse,
  lecture du territoire (champ du digest), renvois « à lire avec », portrait
  ouvert, bouton imprimer.
- **Bloc 7** : **partie B, porte 1** - question chiffrée précise, un temps.
- **Bloc 8** : **partie B, porte 2** - comprendre le territoire, deux temps.
- **Bloc 9** : branchement du volet « Chiffres » de l'import manuel ; documentation
  de fin de chantier (LECONS / TACHES_VALIDEES / IDEES / ARCHITECTURE_TECHNIQUE).

Chaque bloc applique les règles du § 5 (chiffres en accent, infobulle de source
sur **tous** les chiffres, sources en pastilles).
