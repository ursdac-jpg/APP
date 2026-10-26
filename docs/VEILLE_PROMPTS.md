# VEILLE_PROMPTS - les textes de recherche du module « Comprendre le cadre »

> **Document privé. Jamais publié, jamais montré à une personne accompagnée.**
> Créé le 2026-09-03 à partir de l'annexe de `docs/MAQUETTE_SE_TENIR_INFORME_PARCOURS_2026-09-03.html`.
>
> **Source du texte des prompts : `outils/veille.html`.** C'est l'outil que Denis lance ; il assemble
> chaque prompt avec le matériau et la liste des fiches existantes insérés dedans. Ce document est la
> **référence lisible** : il archive le texte, explique le rôle de chaque prompt et fixe le rituel.
> Si un mot d'un prompt change, il change **d'abord dans `outils/veille.html`**, puis ici.

---

## 1. Ce que c'est, ce que ce n'est pas

- **C'est** : la manière de nourrir la base de fiches du module, sans que Denis rédige quoi que ce soit.
- **Ce n'est pas** : un prompt que la personne accompagnée voit. Le seul prompt public est celui de
  « Vérifier une information récente », monté par le code du module selon le sujet et le territoire
  (section 6, pour mémoire).
- **L'outil n'appelle jamais d'assistant lui-même** (pas de budget API) : Denis copie le prompt, le
  lance sur son compte, recolle la réponse. Le prompt 2 (rédaction) passe par son compte personnel,
  sans limite de longueur.

---

## 2. Le pipeline en un coup d'oeil

```
CRÉER UNE FICHE (sujet nouveau)
  Denis choisit un rayon
    -> PROMPT 1 COLLECTE (web, ramène tout, ne résume pas)          -> bloc [COLLECTE]
    -> veille.html assemble le prompt 2 (matériau + fiches existantes du rayon dedans)
    -> PROMPT 2 RÉDACTION (compte perso) : 1 à 8 fiches courtes      -> blocs [FICHE n]
    -> veille.html produit  <id>.md  +  <rayon>.collecte.md
    -> commit sur GitHub -> le module affiche la fiche

ENTRETENIR (une fois par mois, par rayon, au rythme de sa cadence)
    -> PROMPT 3 CONTRÔLE (web) : vérifie chaque fiche du rayon,
       NE RÉÉCRIT RIEN                                              -> bloc [CONTROLE]
    -> veille.html pose une pastille par fiche (à jour / changement / incertain)
    -> pour chaque « changement » : bouton « Traiter » -> repart en PROMPT 1 ciblé

BALAYER (une fois par trimestre, quatre prompts SÉPARÉS, aucun ne produit de fiche)
    -> BALAYAGE (web) : les changements officiels du dernier trimestre civil  -> [BALAYAGE]
    -> veille.html produit  contenu/balayage/<mois>.md
    -> CHIFFRES (web) : les 5 chiffres clés du trimestre + [LECTURE]          -> [CHIFFRES]
    -> veille.html produit  modules/comprendre-les-chiffres/contenu/<mois>.md
       (+ [PORTRAIT] et [CHIFFRES-UE], annuels : voir 5ter.2 / 5ter.3 ; + profil des découpes
       et professions de santé, annuels, sans recherche web : voir 5ter.4 / 5ter.5)
    -> LEXIQUE (web) : idées de mots nouveaux ou changés  -> [LEXIQUE-BRUT]
       -> fenêtre « Le Lexique » de l'outil, « Ma liste » (tri des doublons fait par le code, § 5quater)
    -> À CONFRONTER (web) : le non officiel du réseau, recoupé à l'officiel   -> [CONFRONTER]
    -> veille.html produit  contenu/a-confronter/<mois>.md
    -> ASSOCIATIONS (web) : assos 24 / 87 par rayon, pour « Près de chez moi » -> [ASSOCIATIONS]
       -> structures: des collectes + liens-verifies.txt (non datés) -> NOUVEAUTES_A_STATUER.md (voir 5octies)
    -> commit -> le module affiche « Ce qui a changé récemment », « Les chiffres clés »,
       et le bloc « À confronter » des rayons
```

**Identité d'une fiche = son `id`** (`<rayon>-<slug-du-titre>`), fixé une fois, jamais renommé. C'est lui
qui garantit qu'une nouvelle collecte met à jour la bonne fiche et n'en crée pas un doublon. Les prompts
2 et 3 reçoivent la liste `id | titre | tags` des fiches existantes du rayon et doivent reprendre l'`id`
exact quand ils retombent sur un sujet connu.

---

## 2bis. Le socle de recherche commun

`veille.html` insère le même garde-fou (`socleRecherche()`) dans **tous** les prompts qui font une
recherche web (collecte, contrôle, balayage, chiffres, lexique, à confronter). Une seule source de
vérité, à corriger à un seul endroit :

> Nous sommes le [date du jour]. Recherche web obligatoire : si tu ne peux pas consulter le web,
> dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais
> une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as
> pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un
> seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse
> d'accueil du site officiel. Certains sites officiels (Légifrance, ministères, education.gouv.fr)
> bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi
> sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail,
> les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, espace presse de
> France Travail, Unédic, presse spécialisée emploi-formation) et signale chaque point que tu n'as pas
> pu confirmer sur la source primaire.

La dernière phrase (relais des sites bloqués) répond à une question de Denis 2026-09-05 : oui, le
Balayage et les Chiffres sont exposés au blocage anti-robot (ils visent Légifrance et le JORF). Le
socle commun leur dit de passer par les relais et de dire ce qu'ils n'ont pas pu confirmer. Pour un
changement qui n'existe **que** sur un site bloqué, Denis le lit lui-même et le fait entrer par la
section « Importer un texte à la main » (5sexies).

Motivé par des retours réels : une réponse `[BALAYAGE]` où un morceau de texte s'était inséré au milieu
d'une URL, des `[CHIFFRES]` où des indicateurs demandés étaient omis ou marqués « non retrouvés » sans
avoir cherché au bon endroit. Le contrôle de cohérence de l'outil signale en plus : source sans adresse,
même adresse réutilisée pour deux changements, série aberrante, valeur qui ne colle pas à la série.

---

## 2ter. Prompt « Faire vérifier par un assistant » (sas des changements, 2026-10-15)

Bouton de chaque carte du sas des changements (outil de veille, Dépôt, section 6). **Source de vérité : `construirePrompt()` dans `outils/veilleChangements.js`** (jamais une copie ici). Il reprend le socle de recherche commun (`socleRecherche()`), le changement tel qu'il est écrit, trois cartes publiées comme modèles de style (`exemplesDeStyle()`) et impose un bloc `[VERIFICATION]` (une ligne par case : `en_vigueur`, `nature`, `concerne`, `ce_qui_change`, `source_titre`, `source_url`, avec la page et une courte citation). `lireReponse()` lit le bloc : « non trouvé », « inchangé » et « à vérifier » ne proposent rien ; date hors format, adresse sans https, tiret long, « à vérifier » sont refusés. L'assistant PROPOSE : la personne ouvre la source et coche « J'ai ouvert la source et je confirme » avant « C'est bon ». « Sans objet » : circulaire, discours, programme d'accompagnement, publication statistique. Détail : `docs/CHANTIER_SAS_DES_CHANGEMENTS_2026-10-15.md`, maquette `docs/MAQUETTE_VERIFICATION_PAR_ASSISTANT_2026-10-15.html`. **Pas encore essayé sur une vraie réponse d'assistant** (seulement sur des réponses simulées).

---

## 2quinquies. Modifier directement une fiche du cadre (2026-10-18)

Pour corriger ou mettre à jour **une fiche existante** de « Comprendre le cadre » sans passer par les prompts : outil de veille, Dépôt, section « 7. Les fiches de « Comprendre le cadre » » (liste avec filtres par date, heure et rayon ; formulaire champ par champ ; écran « ce qui va changer » en couleurs ; historique). Les prompts de ce document restent le circuit pour **créer** une fiche ou récolter de la matière nouvelle. Détail : `docs/CHANTIER_EDITION_DEPUIS_LA_VEILLE_2026-10-18.md`.

## 2quater. Complément de prompt pour FAIRE VÉRIFIER une liste sur les sites officiels (2026-10-17)

Quand on fait vérifier des lignes (agences d'intérim, pages de recrutement, structures, employeurs) par un assistant qui a la recherche sur le web, utiliser le complément de `docs/PROMPT_VERIFICATION_COMPLEMENT_QUI_MARCHE_2026-10-17.md` : constaté par Denis comme bien plus fiable (règles de décision par cas, annuaires interdits, suite en PARTIE 2, 3, aucun commentaire).

## 3. Prompt 1 - COLLECTE

**Rôle :** ramener le maximum d'information officielle sur tout un rayon (ou, en mise à jour, sur une
fiche précise), sans rédiger. Aucune limite de longueur. Recherche web obligatoire.

**Texte assemblé par l'outil :**

```
Je constitue une base d'information pour un module d'accompagnement en insertion
professionnelle. Ton rôle est UNIQUEMENT de collecter, pas de rédiger ni de synthétiser.

[LIGNE « Sujet : ... » - voir les variantes ci-dessous]

Rassemble le MAXIMUM d'informations officielles : le texte tel qu'il est écrit sur les
sites officiels, les articles de loi cités, les montants, les conditions, les délais, les
cas particuliers, les exceptions. Il n'y a AUCUNE limite de longueur : ramène tout ce que
tu trouves, je n'aurai pas le temps d'aller page par page. Cherche sur le site du service
public, Légifrance, le ministère compétent, France Travail, l'INSEE, la préfecture ou le
conseil départemental concernés, et tout autre site officiel pertinent que tu identifies
toi-même. [Signale ce qui a changé depuis MOIS ANNÉE si tu le sais. / Signale les
changements récents que tu connais.]

[SOCLE DE RECHERCHE COMMUN - voir 2bis]

Rassemble AUSSI « à qui s'adresser » : les types de structures et de permanences où une
personne peut obtenir de l'aide ou une réponse ferme sur ce sujet, au niveau national et
surtout dans [DÉPT]. Guichets publics, permanences d'accès au droit, réseaux
d'accompagnement, associations reconnues. Pour chacune : son nom, à quoi elle sert, et son
site officiel si tu le connais (adresse revérifiée à la main). Précise aussi sa **portée** :
nationale (vaut partout en France), régionale (Nouvelle-Aquitaine), ou départementale
([DÉPT]). Quand tu ne trouves qu'une structure ou une source régionale et rien de
spécifique au département, dis-le explicitement plutôt que de laisser un vide.

Termine par un bloc entre [COLLECTE] et [/COLLECTE]. Pour les sources ET les structures,
une ligne chacune, quatre colonnes séparées par des barres verticales, dans CET ordre :
nom-court | titre ou nom lisible | adresse complète | date de consultation. Le nom-court en
minuscules avec des tirets (ex. service-public-autorisation-travail-salarie ou
point-conseil-budget-perigueux).
[COLLECTE]
sources:
- nom-court | titre lisible | https://adresse | AAAA-MM-JJ
structures:
- nom-court | nom de la structure, à quoi elle sert, et sa portée (nationale / régionale / départementale) | https://adresse | AAAA-MM-JJ
texte_brut:
tout le matériau collecté, organisé par sous-sujet, en gardant le détail et les citations
des textes officiels
[/COLLECTE]
```

**« À qui s'adresser » (décision Denis 2026-09-04) :** tous les prompts de collecte rassemblent
désormais une section `structures:` en plus de `sources:`. Elle alimente **« Près de chez moi »**
(la liste de liens locaux du module), **jamais le corps des fiches** : dans la prose, la fiche
renvoie à un *type* de structure (« se vérifie auprès de la préfecture », « un point conseil
budget peut vous aider »), pas à un nom précis avec un lien. Les adresses des structures se
vérifient à la main comme les sources, via le registre. Rien pour les digests (chiffres,
lexique, à confronter) : ils ne proposent pas de solution à une personne.

**Portée d'une structure (chantier territoire, 2026-09-05,
`docs/CHANTIER_TERRITOIRE_REGION_DEPARTEMENT.md`) :** l'assistant indique dans la description
si la structure est nationale, régionale (Nouvelle-Aquitaine) ou départementale. Denis reporte
cette portée dans le **4e champ** de `liens-verifies.txt` (`nom | adresse | date | portée`,
valeurs `national` / `region` / `24` / `87`) au moment de vérifier l'adresse - pas sur la
ligne `structures:` du fichier de collecte, qui reste à 4 colonnes. « Près de chez moi »
affiche alors 3 sections (Partout en France / En Nouvelle-Aquitaine / En [département]), avec
un repli honnête vers le régional puis le national quand le départemental manque. Une
structure sans portée reste affichée pour tout le monde, dans une section « À vérifier selon
votre territoire ».

**Ce que l'outil remplit :**

| Placeholder | Rempli avec |
|---|---|
| `MOIS ANNÉE` | le champ « Dernière vérification connue » (si renseigné) ; sinon la phrase « Signale les changements récents que tu connais. » |
| Le département dans la ligne « Sujet : » | `le département de la Dordogne (24)` ou `le département de la Haute-Vienne (87)` (réglé au build de l'instance) |
| La région | `Nouvelle-Aquitaine` |

### Les lignes « Sujet : », un sujet par rayon (les 14)

Chaque entrée du menu « Sujet » monte une ligne « Sujet : » différente. `[DÉPT]` = « le département de
la Dordogne (24) » (ou la Haute-Vienne selon l'instance), `[RÉGION]` = « Nouvelle-Aquitaine ». Tous les
rayons sauf les deux « Étranger » ont un **sous-thème réglable** (vide = tout le rayon). Les prompts
complets vivent dans `outils/veille.html` (`SUJETS`) ; ceci en est le résumé lisible. Décision Denis
2026-09-04 : les 14 sont écrits d'un bloc pour que l'implémentation soit mécanique.

| Rayon (clé) | Portée de la ligne « Sujet : » (défaut, sans sous-thème) |
|---|---|
| **Emploi et contrats** (`emploi`) | Période d'essai et sa rupture, rupture conventionnelle individuelle, CDD (motifs, durée, renouvellement, indemnité de précarité), CDI, intérim classique et intérim d'insertion (ETTI), CDD d'insertion, contrats aidés (parcours emploi compétences, CDD tremplin). Texte en vigueur, durées, conditions, indemnités, ce qui distingue chaque contrat, structures locales de l'IAE. |
| **Travailler après 50 ans et retraite** (`seniors`) | Retraite progressive (âge, trimestres, bornes de temps partiel, démarche employeur et caisse), cumul emploi-retraite (cumul intégral ou plafonné, seconde pension), départ volontaire à la retraite (préavis, indemnité), mise à la retraite par l'employeur (67 ans, 70 ans, interrogation annuelle, indemnité), où s'informer (info-retraite.fr, l'Assurance retraite / CARSAT, entretien information retraite). Règles en vigueur, âges et bornes à jour, mesures des lois de financement de la Sécurité sociale, interlocuteurs. Ne PAS couvrir le calcul détaillé des pensions (renvoi à l'Assurance retraite). |
| **Se former et se reconvertir** (`former`) | CPF (montants, abondements, reste à charge), POEI/POEC, AFPR, VAE, projet de transition professionnelle via Transitions Pro, démission-reconversion, période de reconversion, conseil en évolution professionnelle, reconversion ou promotion par alternance. Conditions, financements, organismes instructeurs, offre du conseil régional. |
| **Accompagnement et structures de l'insertion** (`accompagnement`) | France Travail (PPAE, accompagnement global, contrat d'engagement, obligations et sanctions), Mission Locale, Cap emploi, IAE (AI, EI, ACI, ETTI), clause sociale, PLIE, référent unique de parcours. Rôle de chaque acteur, conditions d'orientation, structures conventionnées du département (DREETS/DDETS). |
| **Créer son activité** (`creer`) | Micro-entreprise ou société (régime fiscal et social, plafonds, responsabilité), coopérative d'activité et d'emploi (CAPE puis CESA, SIRET mutualisé, statut de salarié), aides (ACRE, maintien des allocations, NACRE), chambre de métiers et chambre de commerce. Conditions, démarches, seuils à jour, réseaux d'accompagnement locaux. |
| **Moins de 26 ans** (`jeunes`) | Mission Locale et contrat d'engagement jeune, école de la deuxième chance, EPIDE, service civique, obligation de formation des 16-18 ans, écoles de production, prépa apprentissage, accompagnement intensif jeunes. Principe et conditions, publics, durée, rémunération, structures locales. |
| **Handicap et emploi** (`handicap`) | RQTH (dossier MDPH, durée, renouvellement), médecin traitant et médecine du travail, AGEFIPH et FIPHFP, Cap emploi, aménagement de poste et RLH, emploi accompagné, obligation d'emploi, entreprises adaptées et ESAT, réforme de l'offre de services AGEFIPH. Conditions, démarches, aides à jour, structures locales (MDPH, Cap emploi, délégation régionale AGEFIPH). |
| **Étranger : séjour et droit au travail** (`etr-sejour`) | Quels titres de séjour permettent de travailler (avec ou sans autorisation), comment ça figure sur le titre, cas particuliers (récépissé, demandeur d'asile, réfugié, étudiant, carte talent, carte de résident), admission exceptionnelle au séjour par le travail. Liens locaux : région et préfecture. |
| **Étranger : démarches et équivalences** (`etr-demarches`) | Reconnaissance d'un diplôme étranger (ENIC-NARIC France), échange d'un permis de conduire étranger (UE, réciprocité, autres, délais), grandes étapes d'une naturalisation. Liens locaux : région et département. |
| **Justice : sortie de détention** (`justice`) | SPIP, aménagement de peine (placement extérieur, semi-liberté, DDSE, libération sous contrainte), travail et formation en détention et acte d'engagement, bulletin n° 3 du casier et effacement, accès aux droits sociaux à la levée d'écrou, IAE en milieu pénitentiaire, France Travail justice. Règles en vigueur, interlocuteurs, dispositifs de sortie locaux. |
| **Budget, dettes, droits sociaux** (`budget`) | Surendettement des particuliers (dossier Banque de France, recevabilité, plan conventionnel, rétablissement personnel), points conseil budget, microcrédit personnel accompagné, droit au compte, RSA et prime d'activité (conditions, montants, cumul avec un salaire, contrôle), accompagnement des allocataires du RSA par le département, FICP, MSA. Conditions, montants à jour, démarches, PCB et permanences d'accès aux droits du département. |
| **Mobilité** (`mobilite`) | Financer le permis, permis annulé et récupération de points, garage et location solidaires, achat de véhicule, se déplacer sans voiture. Aides de France Travail, du conseil régional, du conseil départemental, structures locales. |
| **Logement** (`logement`) | Action Logement (aide à la mobilité, avance Loca-Pass, garantie Visale), fonds de solidarité pour le logement du département, aide au logement de la CAF, droit au logement opposable, hébergement d'urgence et 115, résidences sociales et foyers de jeunes travailleurs, intermédiation locative, accompagnement vers et dans le logement. Conditions, plafonds à jour, démarches, structures locales (Action Logement, FSL, ADIL). |
| **Garde d'enfant** (`garde`) | Crèches à vocation d'insertion professionnelle, haltes-garderies et multi-accueil, complément de libre choix du mode de garde de la CAF, aide à la garde d'enfant pour parent isolé de France Travail, places réservées aux personnes en insertion, garde ponctuelle pour un entretien, relais petite enfance. Conditions, aides à jour, démarches, structures locales (relais petite enfance, crèches VIP, PMI). |
| **Apprendre le français** (`francais`) | Formations de français langue étrangère, contrat d'intégration républicaine et cours de l'OFII, ateliers sociolinguistiques, français à visée professionnelle et formations aux compétences clés, évaluation du niveau (CECRL), rôle du conseil régional et de France Travail dans le financement. Conditions d'accès, financeurs, organismes et associations locaux. |
| **Questions juridiques** (`juridique`) | Conseil de prud'hommes (saisine, délais, référé), tribunal administratif, défenseur des droits (discrimination, service public), aide juridictionnelle (plafonds, demande), maisons de justice et du droit et points-justice, médiation, contestation d'une décision de France Travail (recours préalable, médiateur). Procédures, délais, conditions de ressources à jour, lieux d'accès au droit du département. |

- **Mettre à jour une fiche précise** (`fiche-ciblee`, déclenché par le bouton « Traiter » après un contrôle)
  > Sujet : je dois mettre à jour une fiche existante intitulée « TITRE DE LA FICHE » pour [DÉPT],
  > région [RÉGION]. Un contrôle a signalé ceci, à confirmer et à préciser : RÉSUMÉ DU CONTRÔLE.
  > Rassemble tout le matériau officiel à jour sur ce point précis : le texte en vigueur, les
  > montants, les conditions, les délais, les cas particuliers, et ce qui a changé récemment.

**Règle inchangée :** toujours une ligne « Sujet : » étroite, jamais un texte fourre-tout (LECONS 1bis) ;
au besoin on affine par sous-thème plutôt que d'élargir. Jamais plus de deux prompts par rayon (les
deux « Étranger » sont l'exception assumée). Le digest « Comprendre les chiffres » et le Balayage ne
sont PAS des sujets de collecte : ils ont leurs propres blocs (sections 5bis, 5ter).

---

## 4. Prompt 2 - RÉDACTION

**Rôle :** transformer le matériau brut en plusieurs fiches courtes (3 à 8), une par sujet distinct,
prêtes à publier. Commun à tous les rayons. Lancé sur le compte personnel de Denis.

**Texte assemblé par l'outil :**

```
Voici un matériau d'information officiel que j'ai collecté sur un thème large. Ce matériau
couvre plusieurs sujets distincts. Ton rôle est d'en tirer PLUSIEURS FICHES, une par sujet
qu'une personne se poserait vraiment (typiquement 3 à 8). Repère toi-même les sujets.
Chaque fiche est prête à publier pour un public en insertion professionnelle et n'utilise
que ce qui, dans le matériau, concerne son sujet.

=== FICHES DÉJÀ EXISTANTES DANS CE RAYON ===
Ne recrée pas ces sujets. Si une fiche que tu produis traite le même sujet que l'une
d'elles, recopie son identifiant EXACT dans le champ « id » et traite-la comme une mise à
jour. Ne produis jamais deux fiches qui se recouvrent.
- <id>  |  <titre>  |  <tags>          (une ligne par fiche existante du rayon)
=== FIN DES FICHES EXISTANTES ===

=== MATÉRIAU ===
[le champ texte_brut du prompt 1, inséré automatiquement par l'outil]
=== FIN DU MATÉRIAU ===

RÈGLES DE RÉDACTION (communes à toutes les fiches) :
Écris pour une personne réelle qui va te lire, pas pour un système. Elle peut être un
professionnel de l'insertion ou une personne en recherche d'emploi. Vocabulaire
professionnel mais toujours expliqué. Phrases courtes. Jamais condescendant, jamais un
pavé technique. Commence par le cas concret. Ton posé, clair, un peu chaleureux : ni
administratif, ni familier. Développe chaque sigle une fois. Ne conclus jamais à la place
de la personne : tu expliques, elle décide.

Pour chaque fiche : une synthèse humaine qui garde le maximum de détails utiles, sans
recopier le matériau. Garde les nuances et les cas particuliers importants : ne lisse pas
au point de perdre l'information. Dix à vingt lignes. Pas de numéro d'article dans le
corps du texte (ils vont dans les sources). Ce qui bouge (montants, listes, délais) va
dans « ce qui change souvent », pas dans le corps. N'ajoute AUCUN fait qui ne serait pas
dans le matériau : si le matériau ne dit rien sur un point, la fiche n'en parle pas, elle
ne comble pas le vide. Je publie ces textes tels quels après une relecture.

Rends une suite de blocs, chacun entre [FICHE n] et [/FICHE n], une information par ligne.
Le champ « texte » est LA FICHE elle-même, pas un résumé de tes recherches.

[FICHE 1]
id: laisse vide pour un sujet nouveau ; recopie l'identifiant exact si la fiche correspond
  à un sujet déjà existant listé plus haut
titre: une question qu'une personne se pose vraiment
pour_qui: une phrase, dans quel cas cette fiche sert
territoire: national
verifie_le: AAAA-MM (le mois en cours)
tags: mot-clé, mot-clé, mot-clé
lexique:
- terme = définition courte
sources:
- les noms-courts du matériau utiles à CETTE fiche (2 à 8), repris exactement, un par ligne
ce_qui_change_souvent:
- trois à cinq points maximum, seulement ce qui bouge vraiment
texte:
la fiche complète, dix à vingt lignes, prête à publier, au ton demandé
[/FICHE 1]

[FICHE 2]
... même structure ...
[/FICHE 2]
```

**Après la réponse :** l'outil lit chaque bloc `[FICHE n]`, l'étiquette *met à jour* (id repris) /
*ressemble à* (titre et mots-clés proches, Denis tranche) / *nouvelle*, et pré-remplit le formulaire,
texte compris. Denis **relit**, corrige un mot si besoin, télécharge les deux fichiers.

---

## 5. Prompt 3 - CONTRÔLE

**Rôle :** une fois par mois, par rayon, vérifier chaque fiche sur le web **sans rien réécrire** et
rendre un rapport. Les fiches signalées « CHANGEMENT » déclenchent ensuite un prompt 1 ciblé.

**Texte assemblé par l'outil :**

```
Je maintiens une base de fiches d'information pour un module d'accompagnement en insertion
professionnelle. Voici toutes les fiches actuelles du rayon « RAYON », avec leur date de
dernière vérification.

Ton rôle : pour CHAQUE fiche, vérifie sur le web si l'information est toujours exacte
AUJOURD'HUI. Tu NE RÉÉCRIS RIEN. Tu rends seulement un rapport court, fiche par fiche.

Cas particulier à ne pas rater : si le dispositif décrit par une fiche a été supprimé, fermé,
ou entièrement remplacé (la fiche ne décrit plus rien qui existe encore), ne le classe pas en
simple « changement ». Classe-le PRINCIPE OBSOLETE et dis dans le résumé ce qui l'a remplacé,
s'il y a quelque chose.

Pour chaque fiche, indique les pages que tu as ouvertes pour vérifier (avec leur adresse).
Une vérification faite « de mémoire », sans page consultée, n'en est pas une : dans ce cas
l'état est INCERTAIN, jamais A JOUR. A JOUR = tu as retrouvé l'information sur une source
officielle à jour.

Territoire concerné : [DÉPT], région [RÉGION]. [SOCLE DE RECHERCHE COMMUN - voir 2bis]

=== FICHES DU RAYON ===
[fiche] id: <id>
titre: <titre>
verifie_le: <AAAA-MM>
ce_qui_change_souvent:
- <point>            (ou « - (non précisé) »)
texte:
<le corps de la fiche>
---
[fiche] id: ...
...
=== FIN ===

Termine par un bloc entre [CONTROLE rayon: RAYON] et [/CONTROLE]. Une entrée par fiche,
dans cet ordre :
fiche: l'identifiant de la fiche, repris exactement
etat: A JOUR | CHANGEMENT | PRINCIPE OBSOLETE | INCERTAIN
depuis: AAAA-MM (seulement si CHANGEMENT ou PRINCIPE OBSOLETE ; le mois de la dernière vérification rappelé plus haut)
resume: deux ou trois lignes maximum, ce qui a changé concrètement (« rien à signaler » si A JOUR)
sources:
- une adresse officielle par ligne, celles où tu l'as vérifié
```

**Garde-fou :** le contrôle est un **repérage**, jamais une autorité. Un « A JOUR » ne redate pas la
fiche tout seul : c'est Denis qui met `verifie_le` à jour quand il a vraiment revérifié. Le scan lève
des drapeaux, il n'en baisse aucun. Même sans signal, une fiche non contrôlée depuis six mois repasse
en ambre côté public.

### Cadence par rayon

Réglable dans `outils/veille.html`, gardée d'une session à l'autre. Le panneau « Ce mois-ci » ne
réclame un rayon que quand sa cadence est due.

| Cadence | Rayons (défaut) |
|---|---|
| Mensuelle | Venir de l'étranger · Budget, dettes, droits sociaux · Emploi et contrats · Questions juridiques |
| Trimestrielle | Se former et se reconvertir · Créer son activité · Accompagnement et structures de l'insertion · Handicap et emploi · Mobilité · Logement · Justice : sortie de détention · Travailler après 50 ans et retraite |
| Semestrielle | Garde d'enfant · Apprendre le français |

Sur 14 rayons, cela fait environ 5 à 6 contrôles par mois, jamais 14.

---

## 5bis. Balayage trimestriel - le digest « ce qui a changé »

**Rôle :** une fois par trimestre, repérer les changements officiels du **dernier trimestre civil complet**
(ex. avril à juin, digest fait en juillet ou plus tard), pour des professionnels de l'insertion (CIP)
surtout. **Ne produit pas de fiches** : un seul fichier digest, **nommé par le dernier mois du trimestre
couvert** (`contenu/balayage/2026-06.md` pour avril-juin), archivé (les anciens restent consultables).
`publie_le` dans l'en-tête dit quand Denis l'a fait. Décision Denis 2026-09-03 (recentrage CIP, 17.19-17.20).

Bloc dédié dans `outils/veille.html` (mode « Entretenir la base »). Le prompt est déjà généré à
l'ouverture, pour le dernier trimestre complet. Pour un autre trimestre : choisir un mois qui en fait
partie ; sinon, laisser le champ vide.

### Texte assemblé par l'outil

```
Je constitue un digest trimestriel de veille pour des professionnels de l'insertion (CIP).
Ton rôle est de repérer et résumer les changements officiels du trimestre [PÉRIODE, ex.
« avril à juin 2026 »] (publications et entrées en vigueur pendant cette période), pas de
refaire l'histoire d'un dispositif.

[SOCLE DE RECHERCHE COMMUN - voir section 2bis] Commence par les veilles réglementaires
librement consultables : la lettre hebdo du ministère du Travail (travail-emploi.gouv.fr),
les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine (le CARIF-OREF régional), et
vie-publique.fr (suivi des réformes). Complète avec service-public.fr, l'espace presse de
France Travail, France compétences, l'Unédic. Pour le texte officiel lui-même (Journal officiel, Légifrance,
bulletins officiels des ministères) : si tu ne peux pas l'ouvrir directement, cite-le
d'après ces relais et écris « source primaire à vérifier ». Un balayage complémentaire des
sites qui bloquent la lecture automatique est fait à la main en dehors de ce prompt :
signale ce que tu n'as pas pu atteindre, ne bloque pas dessus.
Si le trimestre [PÉRIODE] n'est pas encore terminé à la date d'aujourd'hui, ne couvre que
les mois déjà écoulés et dis-le en une ligne au début du bloc.

Reprends EXACTEMENT ces intitulés de domaine, dans cet ordre, une ligne « domaine: » chacun,
y compris ceux qui n'ont rien eu ce trimestre :
- Emploi et contrats de travail
- Assurance chômage et France Travail
- Formation, CPF, apprentissage, VAE, France compétences
- Insertion par l'activité économique et contrats aidés
- Handicap et emploi (RQTH, AGEFIPH, Cap emploi)
- RSA, prime d'activité, AAH et leurs cumuls
- Séjour et droit au travail des personnes étrangères
- Mobilité et aides associées
- Accompagnement des jeunes (contrat d'engagement, Mission Locale)
- Retraite et fin de carrière (retraite progressive, cumul emploi-retraite, départ et mise à la retraite, mesures des lois de financement de la Sécurité sociale)
- Propre à la région [RÉGION] ou au département [DÉPT]
- Annoncé, pas encore en vigueur

Pour CHAQUE changement retenu :
- intitulé court
- type : loi / décret / arrêté / circulaire ou note / déploiement de dispositif
- date de publication
- date d'entrée en vigueur (ou « à venir » avec la date prévue)
- qui est concerné
- ce qui change, en une à trois phrases, sans jargon non expliqué
- la source : nom-court | titre | adresse | date de consultation (adresse jamais vide)

Territoire : d'abord le national ; ce qui est propre à la région ou au département va dans
le domaine « Propre à la région ... » (conseil régional, conseil départemental, préfecture,
DREETS/DDETS). Ne mélange pas les départements.
Une mesure publiée pendant le trimestre mais qui n'entre en vigueur qu'APRÈS la fin du
trimestre, un projet de loi, une concertation en cours : tout ça va UNIQUEMENT dans
« Annoncé, pas encore en vigueur ». Chaque changement apparaît dans UN SEUL domaine.
Ne donne pas d'avis, pas de recommandation, pas de classement. Tu listes ce qui a changé.

Termine par un bloc entre [BALAYAGE periode: PÉRIODE] et [/BALAYAGE]. Pour chaque domaine,
une ligne « domaine: <nom> », puis les changements, chacun décrit par sept lignes
« champ: valeur » dans cet ordre (intitule, type, publie_le, en_vigueur, concerne,
ce_qui_change, source), séparés par une ligne vide. Si un domaine n'a rien eu, une seule
ligne « intitule: Aucun changement retenu ». Sans puce, sans gras, sans renvoi entre crochets.
[BALAYAGE periode: PÉRIODE]
domaine: Assurance chômage et France Travail
intitule: ...
type: décret
publie_le: AAAA-MM-JJ
en_vigueur: AAAA-MM-JJ
concerne: ...
ce_qui_change: ...
source: nom-court | titre | https://adresse | AAAA-MM-JJ

intitule: ...
type: ...
(etc.)

domaine: Formation, CPF, apprentissage
intitule: ...

[/BALAYAGE]
```

*L'outil est tolérant : il lit aussi bien `intitule:` avec ou sans tiret, avec ou sans lignes vides
entre les champs.*

### Le fichier produit : `contenu/balayage/2026-06.md`

```yaml
---
type: balayage
periode: "avril à juin 2026"
publie_le: 2026-09
territoire: national
sources:
  - "nom-court | titre | url | date"
---

# Ce qui a changé, avril à juin 2026

## Assurance chômage et France Travail

### [intitulé du changement]
Type : décret, publié le 2026-04-25, en vigueur le 2026-05-01.
Concerne : ...
Ce qui change : ...
Source : [le titre du texte]

## Insertion par l'activité économique et contrats aidés

_Rien de nouveau retenu ce trimestre._

## Annoncé, pas encore en vigueur
...
```

Denis relit le digest dans l'outil (aperçu groupé par domaine), corrige un mot si besoin, télécharge,
dépose dans `contenu/balayage/`, committe. Le module affiche le dernier digest en 5e outil « Ce qui a
changé récemment » ; les précédents restent consultables.

### Le complément manuel (sites qui bloquent la lecture automatique)

Le prompt de balayage ne peut pas ouvrir Légifrance, l'Intérieur, education.gouv.fr et quelques autres
(pare-feux anti-robot). Le socle l'oriente vers les relais (lettre hebdo du ministère du Travail,
Cap Métiers et les autres CARIF-OREF, vie-publique.fr) et lui fait
signaler ce qu'il n'a pas pu confirmer sur la source primaire. Le reste se fait à la main, une fois
par trimestre : bloc **« Complément manuel du Balayage »** dans `veille.html`, section « Chaque
trimestre ». Il liste les sites bloqués qui publient de la réglementation (`SITES_BLOQUES` avec
`veille: true` : Légifrance/JORF, Immigration-Intérieur, info.gouv.fr/DIHAL, economie.gouv.fr,
education.gouv.fr/BO), chacun avec un lien vers la bonne rubrique. Denis les parcourt sur les trois
mois du trimestre ; pour tout changement utile, il passe par **« Importer un texte à la main »**
(5sexies), destination Comprendre le cadre, qui range la trouvaille dans la ou les fiches concernées.
Une case « parcouru pour ce trimestre » par site (`localStorage` `veille_balayage_manuel`) ; quand
toutes sont cochées, « Ce trimestre » marque le point fait. Décision Denis 2026-09-05.

**Filet de sécurité** : si un changement passe entre les mailles, le contrôle mensuel du rayon
concerné le signale dans le mois ou les deux qui suivent (pastille « CHANGEMENT »).

### 5bis.2 - `[TRIAGE]` : du digest à la liste de travail

> Un bloc « Triage du digest » existe dans `veille.html` (mode « Entretenir la base », section
> « Chaque trimestre », juste après le Balayage) : bouton « Préparer le prompt » puis « Copier le prompt et ouvrir Perplexity ».
> Le texte de référence est ci-dessous. Pas besoin de recherche web : l'assistant travaille sur
> le digest fourni.

**Rôle :** le Balayage produit une liste de changements ; le triage dit, pour chacun, s'il touche
une fiche existante, s'il faut en créer une, ou s'il reste de l'actualité pure. Sa sortie se recopie
dans **`docs/NOUVEAUTES_A_STATUER.md`**, où Denis tranche ligne par ligne.

```
Voici un digest trimestriel de veille (les changements officiels d'un trimestre) et la
liste des fiches actuelles du module « Comprendre le cadre ». Pour CHAQUE changement du
digest, dis-moi :
- fiche(s) concernée(s) : le ou les `id` exacts de la liste ci-dessous que ce changement
  oblige à revoir, ou « aucune (sujet nouveau) » ;
- action : MISE À JOUR (une fiche existe et une phrase est à revoir) / NOUVELLE FICHE
  (sujet durable sans fiche) / DIGEST SEULEMENT (actualité ponctuelle : un montant, une
  date, une campagne — ça reste dans le digest, pas de fiche) ;
- en une ligne : ce qu'il faudrait changer ou créer.
Ne réécris aucune fiche. Ne cherche rien sur le web. Si tu hésites entre MISE À JOUR et
NOUVELLE FICHE, dis-le.

DIGEST :
[coller le contenu de contenu/balayage/<mois>.md]

FICHES ACTUELLES (id | titre | rayon) :
[coller la liste - le futur bloc veille.html la fournira ; en attendant, les tableaux
« Les N fiches » des README de chaque rayon]

Termine par un bloc entre [TRIAGE] et [/TRIAGE], une ligne par changement :
[TRIAGE]
- changement: <intitulé court> | fiche: <id ou « aucune »> | action: <MISE À JOUR | NOUVELLE FICHE | DIGEST SEULEMENT> | quoi: <une ligne>
[/TRIAGE]
```

---

## 5ter. « Comprendre les chiffres » - les cinq prompts du module

Le module **« Comprendre les chiffres »** (`modules/comprendre-les-chiffres/`, 2e sous-carte de
« Se tenir informé », chantier `docs/CHANTIER_COMPRENDRE_LES_CHIFFRES.md`) est alimenté par **cinq
prompts** de `outils/veille.html`, chacun avec sa cadence :

| Prompt | Fichier produit | Cadence | Quand relancer |
|---|---|---|---|
| **`[CHIFFRES]`** (§ 5ter.1) | `modules/comprendre-les-chiffres/contenu/<dernier-mois-du-trimestre>.md` | trimestrielle | 2 à 3 mois après la fin d'un trimestre civil |
| **`[PORTRAIT]`** (§ 5ter.2) | `modules/comprendre-les-chiffres/contenu/portrait-<annee>.md` | annuelle | l'été (après recensement + estimations d'emploi) ; enquête BMO au printemps |
| **`[CHIFFRES-UE]`** (§ 5ter.3) | `modules/comprendre-les-chiffres/contenu/ue-<annee>.md` | annuelle | une fois par an (Eurostat) |
| **Le profil des découpes** (§ 5ter.4) | `zones-emploi.md`, `departements-region.md`, `regions-france.md` | annuelle | à la rentrée, quand l'INSEE republie ses tableaux « Dossier complet » |
| **Les professions de santé** (§ 5ter.5) | `medecins-*.md`, `specialistes-*.md`, `dentistes-*.md`, `pharmaciens-*.md` | annuelle | à la rentrée, quand l'INSEE republie ses séries TCRED |

Aucun ne produit de fiches : ce sont des **photos datées et sourcées** (§16.9), rien n'est écrit
automatiquement, Denis relit avant commit. Bloc dédié dans `veille.html`, mode « Entretenir »,
sujet « Comprendre les chiffres ».

**Sources qu'un assistant ne sait pas lire** (relevées dans `SITES_BLOQUES` de `veille.html`,
tag `module: 'chiffres'`) : les séries chronologiques de l'INSEE (`insee.fr/fr/statistiques/serie/...`,
rendu JavaScript), les tableaux de bord STMT de `statistiques.francetravail.org`, les PDF
départementaux de la DREETS Nouvelle-Aquitaine, la base Eurostat (Data Browser), l'enquête BMO,
et **SI-Terr de Cap Métiers Nouvelle-Aquitaine** (`siterr.cap-metiers.pro`, portraits de
territoire région / département / zone d'emploi qui croisent INSEE, DARES, France Travail et le
Rectorat - point de départ utile, mais la source à citer reste la source primaire). Pour ces
sources, Denis relève la valeur à la main et l'importe via « Importer un texte à la main »,
cible « Comprendre les chiffres ».

---

### 5ter.1 - `[CHIFFRES]` : les 5 chiffres clés du trimestre + la lecture du territoire

**Rôle :** les indicateurs qui bougent chaque trimestre. **Mis à jour le 2026-09-11** pour
coller au vrai code (`assemblerChiffres()` / `lireChiffres()` / `construireChiffresMd()` dans
`outils/veille.html` - avant cette date, le texte ci-dessous était périmé par rapport au code).

**Le prompt tourne UN département à la fois** (menu déroulant `selDept` : Dordogne (24) ou
Haute-Vienne (87), partagé avec les autres prompts de l'outil). Pour couvrir les deux
départements, on le lance deux fois - une fois par département - et on fusionne les deux
réponses à la main dans le même fichier `.md` (le fichier ne connaît qu'un seul jeu de
territoires : le département en cours, la région, la France).

**Ce que ce prompt NE demande PAS**, volontairement :
- `serie_annuelle:` et `histo:` (courbe pluriannuelle + fourchette historique depuis 1982) :
  ces données ne sont pas accessibles à un assistant qui navigue (pages INSEE en JavaScript,
  voir SITES_BLOQUES) - elles viennent d'un fichier officiel téléchargé par Denis (xls INSEE,
  xlsx Eurostat) et relevées à la main avec Claude, en général une fois par an, pas à chaque
  trimestre.
- `repere:` (la phrase-verdict sous chaque chiffre) : un assistant générique produit des
  reperes plats (« dans la moyenne »). Ceux qui apportent une vraie nuance (« à cause du
  changement des règles d'inscription ») se rédigent avec Claude, chiffres en main, pas via
  ce prompt. Sans `repere:` écrit, le module calcule un brouillon automatique (décision
  hybride de Denis, 2026-09-09).

#### Texte assemblé par l'outil (paramétré par le département choisi, ici Dordogne (24))

```
Je constitue un digest trimestriel de chiffres clés pour des professionnels de l'insertion
et des personnes en recherche d'emploi. Donne la dernière valeur connue de chaque indicateur,
avec sa source, la date exacte de la donnée, la valeur du trimestre précédent et celle du même
trimestre l'an dernier si tu les as. Trimestre de référence : avril à juin 2026.

Territoires : le département de la Dordogne (24), la région Nouvelle-Aquitaine, la France
entière. Ne mélange jamais les territoires ; une entrée par territoire.

Indicateurs (les 5 du module, dans cet ordre) :
1. Taux de chômage localisé (au sens du BIT). Paraît avec un trimestre de retard : donne le
   dernier trimestre publié, ne l'avance pas. Le dernier trimestre est souvent provisoire :
   dis-le.
2. Nombre de demandeurs d'emploi inscrits à France Travail, catégorie A ; et le total A+B+C ;
   pour le département, la région et la France (STMT, statistiques du marché du travail).
   **Historique (vérifié le 2026-09-12)** : Data Emploi ne donne que le trimestre en cours, pas
   d'historique lisible trouvé pour l'instant. Un jeu de données data.gouv.fr (« Demandeurs
   d'emploi inscrits à France Travail », xlsx trimestriel, mis à jour régulièrement) existe et
   pourrait en contenir un, mais son contenu exact reste à vérifier - **Denis, si tu veux
   l'exploiter, le télécharger et regarder s'il donne un historique départemental** est le plus
   sûr moyen de le savoir. En attendant, comme les offres durables : reporter la ligne `serie:`
   du digest précédent et ajouter le nouveau point (démarrée le 2026-09-12).
3. Part des inscrits depuis plus d'un an (chômage de longue durée) parmi les A+B+C, pour le
   département, la région ET la France. **Historique (vérifié le 2026-09-12)** : même limite que
   l'indicateur 2 (pas de source lisible avec un historique) - même consigne de report de série
   d'un trimestre à l'autre (démarrée le 2026-09-12).
4. Emploi salarié : la variation sur le trimestre (%), pour le département, la région et la
   France (estimations trimestrielles d'emploi de l'INSEE, publication « Informations rapides »
   du trimestre - c'est **le pourcentage de variation qui sert de chiffre affiché**, jamais un
   décompte en nombre, pour rester comparable aux 3 autres territoires et cohérent d'un trimestre
   à l'autre). **Historique (vérifié le 2026-09-12)** : contrairement aux offres durables,
   l'INSEE publie un vrai historique, mais réparti sur plusieurs bulletins trimestriels distincts
   (un nouveau « Informations rapides » à chaque trimestre) plutôt qu'un seul fichier - la série
   `serie:` des 4 territoires (départements, Nouvelle-Aquitaine, France) doit reporter celle du
   digest précédent et y ajouter le nouveau point (comme les offres durables). Elle contient déjà
   5 trimestres (T1 2025 à T1 2026) au 2026-09-12, reconstitués en consultant les 5 derniers
   bulletins régionaux/départementaux de l'INSEE un par un.
5. Nombre d'offres d'emploi collectées par France Travail sur le trimestre, et la part
   d'offres durables (CDI ou CDD de plus de 6 mois), pour le département.
   **Part d'offres durables - cas particulier (vérifié le 2026-09-12)** : contrairement au
   chômage, cette donnée n'a pas d'historique public sur les sources habituelles (le panorama
   Data Emploi ne donne que le trimestre en cours). La série ne peut donc grandir qu'un point à
   la fois, d'un digest à l'autre. **Avant de générer le nouveau digest, reporter la ligne
   `serie:` du digest précédent (`contenu/<mois-precedent>.md`, section « Offres d'emploi
   collectées ») et y ajouter le nouveau point** - sinon l'historique repart de zéro à chaque
   trimestre. Série commencée le 2026-09-12 : T1 2026 (24 : 39 % ; 87 : 41 %).
6. Où se situer : dans le même tableau INSEE que l'indicateur 1, le département français au
   taux le plus bas et celui au taux le plus haut (nom + valeur), la région française la plus
   basse et la plus haute (nom + valeur). Une seule fois pour le trimestre, indépendant du
   département choisi ci-dessus.

[SOCLE DE RECHERCHE COMMUN - voir 2bis] Cherche sur : l'INSEE (taux de chômage localisés,
estimations d'emploi), la DARES et France Travail (STMT, offres collectées), l'Observatoire
des territoires pour la part de longue durée.

Produis une entrée pour CHAQUE indicateur et CHAQUE territoire demandé, même sans valeur
(« valeur: non trouvée » + où tu as cherché). N'en omets aucun. Pas d'avis, pas de commentaire
d'opportunité.

POUR LE TAUX DE CHÔMAGE (chaque territoire) et POUR LES INSCRITS CAT. A, ajoute une ligne
« serie » avec les 6 à 8 derniers trimestres connus : « T3 2024: 7,7 % ; T4 2024: 7,6 % ; ... ».
Sinon « serie » reste vide.

Ensuite, rédige un bloc [LECTURE] : 2 à 3 paragraphes courts qui RELIENT ces chiffres entre eux,
avec prudence. Il décrit, il ne prédit rien, il ne juge aucun projet, il n'interprète jamais de
façon trop affirmée. Exemple de ton : « la baisse du taux va souvent de pair avec des sorties
de liste plutôt qu'avec une vague d'embauches ». Termine par « [brouillon à vérifier et valider] ».

Puis un bloc [SYNTHESE-COURTE] : une phrase de synthèse par territoire (2 à 3 phrases maximum,
langage très simple), qui résume les chiffres ci-dessus pour CE territoire. Décrit, ne prédit
rien, ne juge aucun projet. Une ligne par territoire, au format « Territoire : phrase ».

Format de sortie. D'abord le bloc chiffres :
[CHIFFRES periode: avril à juin 2026]
indicateur: Taux de chômage localisé
territoire: Dordogne (24)
valeur: 7,8 %
date_donnee: 1er trimestre 2026 (provisoire)
valeur_precedente: 7,9 %
valeur_an_precedent: 8,1 %
serie: T3 2024: 8,3 % ; ... ; T2 2026: 7,8 %
source: nom-court | titre | https://adresse | AAAA-MM-JJ

indicateur: ...
[/CHIFFRES]

Puis le bloc « où se situer » (une seule fois, pas par territoire) :
[OU-SE-SITUER]
departement_bas: Cantal | 4,7 % | 1er trimestre 2026
departement_haut: Pyrénées-Orientales | 12,7 % | 1er trimestre 2026
region_bas: Pays de la Loire | 6,6 % | 1er trimestre 2026
region_haut: Hauts-de-France | 9,8 % | 1er trimestre 2026
source: nom-court | titre | https://adresse | AAAA-MM-JJ
[/OU-SE-SITUER]

Puis le bloc lecture :
[LECTURE]
Paragraphe 1...

Paragraphe 2...
[brouillon à vérifier et valider]
[/LECTURE]

Puis le bloc synthèse courte :
[SYNTHESE-COURTE]
Dordogne (24) : phrase...
Nouvelle-Aquitaine : phrase...
France entière : phrase...
[/SYNTHESE-COURTE]
```

### Le fichier produit : `modules/comprendre-les-chiffres/contenu/2026-06.md`

En-tête `--- type: chiffres / periode / publie_le / verifie_le / sources ---`, puis une section
`## <indicateur>` par indicateur, une puce `- <territoire> : **valeur** (date) - précédent : x ;
il y a un an : y. serie: ... source: nom-court | url` par territoire, puis une section
`## Où se situer : comparaison des territoires` (les 4 bornes du bloc `[OU-SE-SITUER]`, titre
exact obligatoire - un autre titre entrerait en collision avec la section chômage), puis une
section `## Synthèse courte` (les lignes du bloc `[SYNTHESE-COURTE]`, une puce par territoire),
puis `## Lecture du territoire` avec les paragraphes du bloc `[LECTURE]`. Le module lit ce
fichier pour l'écran « Les chiffres clés » : les 5 valeurs + une courbe par `serie` + les 2
barres « Où se situer » + la phrase « En quelques mots » + le texte de lecture (en vue
d'ensemble seulement).

**`outils/veille.html` génère déjà ces 2 nouvelles sections automatiquement** depuis les blocs
`[OU-SE-SITUER]` et `[SYNTHESE-COURTE]` collés dans la réponse - pas de mise en forme à la main.

---

### 5ter.2 - `[PORTRAIT]` : le portrait structurel du territoire (annuel)

**Rôle :** ce qui bouge lentement (une fois par an) et explique le marché local : de quoi vit le
territoire, comment on est embauché ici, salaires par secteur, qui cherche un emploi, qui habite,
niveau de formation, freins périphériques. Alimente la **couche 2** du module (blocs dépliés) et
la **couche 3** (métiers en tension, enquête BMO).

#### Texte assemblé par l'outil

```
Je constitue le portrait annuel d'un territoire pour des professionnels de l'insertion et
des personnes en recherche d'emploi. Donne la dernière valeur connue de chaque indicateur,
avec sa source, la date exacte de la donnée, et l'avant-dernière valeur si tu l'as pour
montrer le sens d'évolution. Territoires : le département [DÉPT], la région [RÉGION], la
France entière. Année de référence : [ANNÉE].

A. De quoi vit le territoire
   - répartition de l'emploi par grand secteur (agriculture, industrie, construction,
     commerce-transports-services, administration-enseignement-santé-social), en %
   - les plus gros employeurs ou secteurs employeurs du département
   - poids de l'emploi public / de l'économie présentielle

B. Comment on est embauché ici
   - part des CDI, des CDD, de l'intérim dans les embauches (hors intérim : DPAE)
   - part des CDD de moins d'un mois
   - part des temps partiels
   - part des salariés de la fonction publique

C. Salaires
   - salaire net mensuel médian en équivalent temps plein, pour [DÉPT] et [RÉGION]
   - salaire net médian par grand secteur (régional ou national si pas de niveau
     départemental)
   - écart salarial femmes / hommes

D. Qui cherche un emploi ici (demandeurs A+B+C de [DÉPT])
   - part des moins de 25 ans, part des 50 ans et plus
   - part des femmes
   - part des demandeurs de longue durée (plus d'un an)
   - part des bénéficiaires de l'obligation d'emploi (travailleurs handicapés)
   - nombre et part d'allocataires du RSA dans la population

E. Le territoire bouge-t-il
   - nombre de créations d'entreprises sur l'année, dont micro-entrepreneurs
   - taux de création (créations rapportées au stock)
   - poids du tourisme (emplois touristiques, part dans l'emploi) si disponible

F. Qui habite ici
   - population, densité (hab/km2)
   - part des 60 ans et plus, part des moins de 25 ans
   - évolution de la population sur 5 ans (solde naturel, solde migratoire)

G. Le niveau de formation (population 25-64 ans ou 15+ non scolarisée)
   - part sans diplôme ou brevet seul
   - part diplômés du supérieur
   - taux de décrochage scolaire / part de jeunes 18-24 ans peu ou pas diplômés et sans emploi
     ni formation (NEET) si disponible au niveau régional

H. Les freins périphériques à l'emploi (mobilité, garde d'enfants, logement, santé,
   illettrisme, illectronisme)
   - donne ce qui est chiffré au niveau national ou régional, en disant clairement à chaque
     fois si une déclinaison départementale existe ou non ; marque « difficile à chiffrer »
     là où il n'y a pas de source solide. Sujet à traiter avec prudence, sans dramatiser.

[SOCLE DE RECHERCHE COMMUN - voir 2bis] Cherche sur : l'INSEE (dossier complet et comparateur
de territoire, recensement, REE créations d'entreprises, DADS/DSN salaires, estimations
d'emploi), la DARES, France Travail (STMT, DPAE, enquête Besoins en Main d'Œuvre), l'Agefiph,
la CAF ou le conseil départemental pour le RSA, le CARIF-OREF de la région (Cap Métiers pour
la Nouvelle-Aquitaine), l'ANLCI pour l'illettrisme, l'Observatoire des territoires.

Ajoute enfin la couche « métiers en tension » : les 8 à 12 métiers avec le plus de projets
de recrutement dans [DÉPT] et la part jugée difficile à recruter (enquête BMO de l'année),
plus les 3 à 5 secteurs les plus en tension au niveau régional.

Produis une entrée pour CHAQUE indicateur, même sans valeur (« valeur: non trouvée » + où tu
as cherché). Pas d'avis, pas de conseil, pas de ton alarmiste (surtout sur les freins et sur
le niveau de formation).

Termine par un bloc entre [PORTRAIT annee: ANNÉE] et [/PORTRAIT]. Une entrée par ligne de
résultat, séparées par une ligne vide, six lignes « champ: valeur » dans cet ordre :
bloc: une des lettres A à H, ou « tension »
indicateur: le libellé
territoire: [DÉPT] | [RÉGION] | France entière
valeur: ...
date_donnee: AAAA ou « recensement AAAA »
source: nom-court | titre | https://adresse | AAAA-MM-JJ
[/PORTRAIT]
```

### Le fichier produit : `modules/comprendre-les-chiffres/contenu/portrait-2026.md`

En-tête `--- type: portrait / annee / publie_le / verifie_le / sources ---`, puis une section
`## <lettre A-H> - <titre du bloc>` avec ses puces `- <indicateur> - <territoire> : **valeur**
(date). source: ...`, et une section `## Métiers en tension` (couche 3). Le module lit ce
fichier pour les blocs dépliés de la couche 2 et pour le bloc BMO de la couche 3.

---

### 5ter.3 - `[CHIFFRES-UE]` : la France dans l'Union européenne (annuel)

**Rôle :** le 4e niveau de lecture du module (« Union européenne »). Onze indicateurs Eurostat,
valeur France + moyenne UE27, chacun avec le code de sa table Eurostat, pour situer la France.
Sert aussi de support pédagogique pour les futurs CIP (décision Denis 2026-09-06). Plus une
courte note sur les freins comparés (accueil du jeune enfant, accès internet, obstacles
déclarés) quand Eurostat les documente. **Aligné le 2026-09-06** sur les sections réelles du
fichier `ue-2026.md` (l'AROPE remplacé par l'écart salarial F/H et les diplômés du supérieur ;
codes de tables ajoutés ; sortie au format à deux lignes du module).

#### Texte assemblé par l'outil

```
Je situe la France dans l'Union européenne pour des professionnels de l'insertion et un
public en recherche d'emploi. Pour chacun des 11 indicateurs ci-dessous, donne : la valeur
France, la moyenne UE27, l'année de la donnée, et le code de la table Eurostat.
Année de référence : [ANNÉE].

1. Taux de chômage harmonisé, 15-74 ans (une_rt_m) - donne aussi le pays le plus bas et le plus haut
2. Taux de chômage des jeunes, 15-24 ans (une_rt_m)
3. Taux de chômage de longue durée, part des actifs 12 mois et plus, 15-74 ans (une_ltu_a, PC_ACT)
4. Taux d'emploi, 20-64 ans (lfsi_emp_a)
5. Taux d'emploi des seniors, 55-64 ans (lfsi_emp_a)
6. Part des NEET, 15-29 ans (edat_lfse_20)
7. Part de l'emploi à durée limitée, salariés 15-64 ans (lfsa_etpga)
8. Part du temps partiel, 20-64 ans (lfsa_eppga)
9. Écart de salaire femmes-hommes non ajusté (sdg_05_20)
10. Part des diplômés du supérieur, 25-64 ans (edat_lfse_03, ED5-8)
11. Participation des adultes 25-64 ans à une formation, 4 dernières semaines (trng_lfse_01)

Note « freins comparés » France contre moyenne UE : accueil formel des moins de 3 ans
(ilc_caindformal), accès internet des ménages (isoc_ci_in_h), et si trouvé, la répartition
des personnes hors du marché du travail par principal obstacle (module ad hoc LFS 2021,
séries lfso_21).

La base Eurostat (Data Browser) est en JavaScript ; pour lire une valeur sans l'ouvrir,
utilise l'interface de diffusion :
https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/<CODE>?format=JSON&geo=FR&geo=EU27_2020&time=[ANNÉE]
(ajoute sex=T, age=..., unit=... selon la table). Adresse de la source obligatoire. On situe,
on ne juge pas.

Rends le résultat au format du fichier du module : pour chaque indicateur, DEUX lignes,
valeur en gras, année entre parenthèses :
- France : **<valeur>** (<année>). Source : Eurostat, table <code> | https://ec.europa.eu/eurostat/databrowser/view/<code>
- Moyenne UE-27 : **<valeur>** (<année>). Source : Eurostat.
(indicateur 1 : ajoute une 3e ligne « - Pays les mieux placés, pays les moins bien placés : ... ».)

Termine par un bloc entre [CHIFFRES-UE annee: ANNÉE] et [/CHIFFRES-UE] : une entrée par
indicateur, lignes « champ: valeur » dans cet ordre : indicateur, france, ue27, date_donnee,
table, source (https://adresse).
[/CHIFFRES-UE]
```

### Le fichier produit : `modules/comprendre-les-chiffres/contenu/ue-2026.md`

En-tête `--- type: chiffres-ue / annee / publie_le / verifie_le / sources ---`, puis une
section `## <indicateur>` avec **une puce « France : » et une puce « Moyenne UE-27 : »**
(format lu par l'extracteur `_comprendreLesChiffresExtraireValeurUE` de la vue tableau ; une
seule ligne mêlant les deux casse la colonne UE), et enfin `## Freins comparés`. Le module
lit ce fichier pour la pastille de niveau « Union européenne ».

### Contrôle de cohérence et vérification (2026-09-04)

L'outil ne lit pas les PDF, mais après « Coller ici et lire » il **signale** (il ne corrige pas) : un point
qui s'écarte de plus de 10 % du reste de sa série, une valeur qui ne colle pas au dernier point de la
série, un pourcentage hors de 0 à 100, une source sans adresse, une date de donnée dans le futur. Les
adresses (PDF compris) sont cliquables dans l'aperçu.

Le bouton **« Préparer une vérification »** génère un prompt qui liste les points douteux (valeur + source),
à confronter au document dans Claude ou ChatGPT. La réponse revient dans un bloc `[VERIF]` :
`point / valeur_verifiee / statut (confirme | corrige | introuvable) / citation`. Recollé, l'outil remplace
la valeur des points « corrige », marque « (vérifié) » et tamponne l'en-tête `verifie_le: <mois>`. La
correction va dans le digest lui-même, pas dans un fichier à part.

---

### 5ter.4 - Le profil des découpes : âge et niveau de diplôme (annuel)

Contrairement aux trois prompts ci-dessus, ce prompt (bouton « Afficher les liens et les consignes »
du bloc « Le profil des découpes », mode « Entretenir ») **ne demande aucune recherche web** : il
liste simplement les 12 liens directs vers le « Dossier complet » INSEE (tableaux POP T5 et FOR T3)
des 4 départements/régions suivis et des 5 zones d'emploi de Dordogne/Haute-Vienne, avec la consigne
de coller les tableaux copiés directement dans une conversation avec **Claude** (jamais un assistant
sans recherche web, puisqu'il n'y a ici aucune recherche à faire : seulement des tableaux à lire).
Claude calcule les 3 pourcentages (part des 65 ans et plus, part sans diplôme ou brevet seul, part de
diplômés du supérieur) et met à jour les 3 fichiers concernés (`zones-emploi.md`,
`departements-region.md`, `regions-france.md`) avec la même méthode que la construction initiale
(2026-09-12) : chiffres secondaires ajoutés en `COMPRENDRE_LES_CHIFFRES_ZONES_STATS`, jamais une
généralité, une vraie recherche de fond si un chiffre change assez pour changer l'interprétation
déjà écrite.

### 5ter.5 - Les professions de santé : déserts médicaux (annuel)

Même principe que ci-dessus (bouton « Afficher les liens et les consignes » du bloc « L'accès aux
médecins, dentistes et pharmaciens »), pour la série annuelle INSEE de densité de personnels de
santé (famille TCRED - Personnels de santé) : liens directs vers les séries des départements et
régions suivis pour chaque métier du registre `COMPRENDRE_LES_CHIFFRES_PROFESSIONS_SANTE` (médecins
généralistes, médecins spécialistes, chirurgiens-dentistes, pharmaciens - `modules/comprendre-les-chiffres/index.js`),
plus les 2 territoires marqués « extrême, à vérifier chaque année » pour chaque métier. **Consigne
explicite** : les extrêmes fixés lors de la construction initiale peuvent avoir changé d'une année
sur l'autre - vérifier plutôt que de recopier simplement une nouvelle valeur sur l'ancien nom de
territoire (parcourir les 13 régions ou chercher le classement national des départements, comme lors
de la construction). Ajouter un futur métier (dentistes/pharmaciens ajoutés le 2026-09-13, infirmiers
écartés pour l'instant faute de source à jour - voir `docs/TACHES_VALIDEES.md`) ne demande qu'une
entrée dans ce registre, jamais une nouvelle fonction ni un nouveau bouton.

---

## 5quater. Le Lexique de l'outil de veille (la fenêtre « Le Lexique »)

**Rôle :** tenir `data/lexique.js` (le corpus que le module Lexique de l'application lit vraiment) : lire la
liste des mots, **modifier un mot champ par champ avec l'avant et l'après**, suivre l'évolution des mots,
et trier les **idées de mots nouveaux** dans une liste d'attente (« Ma liste »). Décisions de Denis du
20 octobre 2026 (cahier : `docs/CHANTIER_MODERNISATION_LEXIQUE_VEILLE_2026-10-20.md`, maquette :
`docs/MAQUETTE_LEXIQUE_VEILLE_2026-10-20.html`). **Rien n'apparaît dans le module « Se tenir informé »** :
c'est du travail de fond. **Un assistant en ligne ne rédige jamais le texte d'un mot** : il peut
seulement proposer des idées avec leur source ; le texte est écrit par Denis dans l'écran, ou par Claude
directement dans « Ma liste » à sa demande, puis relu par Denis (case « J'ai relu le texte » obligatoire).

**Ce qui a remplacé l'ancien circuit.** Le bloc « Nourrir le Lexique » de la page d'édition n'existe
plus. Sont donc retirés (validé par Denis le 20 octobre 2026) : le chargement manuel de
`data/lexique.js`, la case « Termes déjà dans le Lexique » (la liste est lue toute seule dans le
dépôt), le fichier `lexique-candidats-AAAA-MM.js` à recopier, le prompt `[TRIAGE-MOTS]` (le tri des
doublons est fait par du code : mot identique, mot proche, mot déjà écarté) et le tableau « Mots du
Lexique à statuer » de `docs/NOUVEAUTES_A_STATUER.md` (« Ma liste » est maintenant le registre).

### Où le trouver

Page d'édition de `outils/veille.html`, section **« 9. Le Lexique »**, bouton « Ouvrir le Lexique »
(les deux cartes du menu « Lexique » et la ligne « Lexique » de la liste du trimestre ouvrent la même
fenêtre). Aucune clé, aucun fichier à charger.

### Les quatre vues de la fenêtre

| Vue | Ce qu'elle fait |
|---|---|
| **Les mots** (liste) | Les 408 fiches de `data/lexique.js` lues directement dans le dépôt. Recherche, filtres : « Avec un chiffre ou une date dans le texte » (relecture de la doctrine, 64 fiches au 20 octobre 2026), « Sans mot de recherche », « Sans renvoi », « Cités par aucun autre mot », « Modifiés avec l'outil » ; famille ; mot ou notion. Les fiches venues de `data/freins.js` et `data/urgences.js` ne sont pas dans ce fichier : la fenêtre le dit et ne les liste pas. |
| **Ajouter un mot** (bouton de la liste, 20 octobre 2026) | Formulaire vide : titre (l'identifiant et le titre de tri sont proposés), **type de fiche en liste de choix** (un mot, ou une notion avec son gabarit parmi les 6 de `scripts/checkLexique.js`), famille en liste de choix, registres en cases, renvois choisis dans la liste des mots existants (un mot inconnu est refusé). Même publication contrôlée que « Ma liste ». |
| **Modifier un mot** | Formulaire champ par champ : titre, titre de tri (champ éditorial, saisi, jamais calculé), **type de fiche (mot ou notion avec sa présentation, en listes de choix, depuis le 20 octobre 2026 : seule la ligne `type` change dans le fichier, avec un avertissement et sa carte dans l'écran « Avant d'enregistrer »)**, famille, registres, mots de recherche, texte, renvois. L'`id` est verrouillé. La liste des mots a un résumé cliquable (« À regarder : N avec un chiffre ou une date, N sans renvoi, N sans mot de recherche, N cités par aucun autre mot »). Contrôles en direct (plafonds de `scripts/checkLexique.js`). Avertissement « chiffre ou date » : il prévient sans bloquer. Écran « Avant d'enregistrer » : l'avant et l'après de chaque champ, texte comparé mot à mot, case « J'ai relu », phrase pour le journal. L'enregistrement n'écrit que les propriétés changées, lance `scripts/checkLexique.js` et `npm test`, et **revient en arrière tout seul** si une erreur apparaît ; il s'annule avec « Annuler la dernière publication ». |
| **Les mots à proposer** (« Ma liste ») | Voir ci-dessous. |
| **L'évolution des mots** | Relevé de chaque modification (l'avant, l'après, date et heure en français, phrase de Denis), fichier `outils/evolution_lexique.txt`. Les modifications faites avant la mise en service de ce relevé n'y figurent pas. La vue « Historique » existante a une option « Mots du Lexique ». |

### « Ma liste » et les trois portes d'entrée

Fichier `outils/sas/mots.sas.txt` (créé au premier usage, jamais lu par l'application, comme les autres
sas). Une ligne par idée : état (idée, en rédaction, en attente, écartée, publiée), origine, motif
d'écart, brouillon. Une idée repérée automatiquement n'est écrite dans le fichier que quand Denis
agit dessus (retenir, plus tard, écarter). « Écarter » est mémorisé : l'idée n'est jamais reproposée.
« Publier » passe par la voie existante (`analyserCandidatsLexique` puis `integrerCandidatsLexique` de
`outils/veilleDepot.js`, forme stricte, refus d'un `id` déjà pris, contrôle `checkLexique`, retour en
arrière automatique) et la ligne passe à « publiée ».

- **Porte A, « Mots qui reviennent dans l'application »** : script local, gratuit, sans envoi sur Internet. Lit
  166 fichiers du dépôt (fiches du cadre, fichiers de chiffres et digests des veilles, « Qui fait
  quoi »). Trois signaux, du plus fort au plus faible : un mot expliqué dans le bloc « Mots expliqués »
  d'une fiche du cadre mais sans fiche du Lexique (sa définition est montrée comme matière à
  reformuler, jamais recopiée) ; un sigle présent dans au moins 3 fichiers sans fiche ; un sigle de
  structure de « Qui fait quoi ». Plafond de 30 idées, sigles comparés en casse exacte, niveaux de
  langue exclus. **C'est un aide-mémoire pour trier, jamais une liste à vider** (doctrine, principe 6 :
  une fiche naît d'un besoin réel, pas d'un effort de couverture).
- **Porte C, « Demander à un assistant en ligne »** (ChatGPT ou Perplexity) : le prompt ci-dessous est
  assemblé par l'outil, **avec la liste des mots existants ajoutée automatiquement**. La réponse
  `[LEXIQUE-BRUT]` se colle dans la zone prévue (« Coller ici et lire ») : les idées arrivent dans
  « Ma liste » avec leur source et le fait brut, sans texte de fiche.
- **Porte D, « Saisir un mot rencontré »** : un champ « le mot », un champ « où je l'ai rencontré »
  (facultatif). Contrôle immédiat : mot déjà existant (bouton « Modifier cette fiche »), mot proche, ou
  déjà dans la liste.
- **Porte B, « Recherches sans résultat »** (codée le 20 octobre 2026, à la demande de Denis, **sans avoir pu vérifier le
  contenu réel de l'export Umami** : la vérification B0 reste à faire par Denis). L'outil **ne se connecte jamais à Umami** : Denis
  copie dans Umami (onglet « Events », événement `lexique_recherche_sans_resultat`, propriété `texte`) la liste des valeurs, et la
  colle dans la zone de la porte B (« Coller ici et lire »). Formats acceptés : une recherche par ligne, avec ou sans son nombre
  (séparé par une tabulation, un point-virgule, une virgule, deux espaces ou « (3) »), ou un fichier CSV avec une colonne `texte`
  (ou `string_value`, `value`) et, si elle existe, une colonne `event_name` (seules les lignes de l'événement sont gardées).
  **Vie privée** : seules les formes courtes (40 caractères et 4 mots au plus, lettres seulement : ni chiffre, ni « @ », ni adresse)
  cherchées au moins 2 fois sont montrées ; tout le reste est écarté et seulement compté, jamais affiché. Les idées arrivent comme
  celles de la porte A (retenir et rédiger, plus tard, écarter avec motif) avec la porte `umami`. Code : `lireRecherches`
  (`outils/veilleIdees.js`), route `/api/lexique/recherches`. Si le format réel de l'export diffère, ajuster `lireRecherches`.

### Le modèle de données (autorité : `scripts/checkLexique.js`)

L'outil lit ses listes et plafonds **directement dans le script** (exportés, aucune copie : c'est la
correction du constat D du cahier, il manquait `acces-aux-soins` dans l'ancien prompt).

| Champ de la fiche | Règle |
|---|---|
| `id` | kebab-case, unique. Verrouillé à la modification. |
| `titre` | tel qu'on l'écrit (sigle développé entre parenthèses si utile). |
| `titreDeTri` | le titre sans accents, cédilles ni apostrophes (champ éditorial : 253 fiches sur 408 en ont un différent du titre). |
| `type` | `terme` ou `notion`. Verrouillé à la modification. |
| `gabarit` | uniquement si `type: notion` : `explication`, `comparatif`, `decryptage`, `grille-lecture`, `deroule-demarche`, `role`. |
| `univers` | UNE valeur parmi les 17 familles du script : `accompagnement-insertion`, `emploi-recrutement`, `ressources-humaines`, `organisation-travail-management`, `droit-travail`, `contrats-statuts-emploi`, `formation`, `bulletin-salaire`, `protection-sociale`, `sante-travail`, **`acces-aux-soins`**, `structures-organismes`, `dispositifs`, `mobilite-budget`, `entrepreneuriat-independance`, `demarches-administratives`, `conditions-travail`. |
| `registres` | 1 à 3 parmi : `langage-cip`, `langage-rh`, `langage-juridique`, `langage-employeur`, `langage-administratif`, `langage-france-travail`. |
| `variantesRecherche` | 1 à **4**, langage naturel, sans doublon. |
| `corps` | 2 à 4 phrases, langage simple, sigle développé une fois ; **jamais de chiffre ni de règle susceptible de devenir fausse** (`docs/DOCTRINE_LEXIQUE.md`). |
| `relations` | 0 à 3 `voir-aussi` + 0 à 2 `a-ne-pas-confondre`, vers un `id` **existant**. |

Pas de date « Vérifié le » : ce sont de purs textes. La liste de contrôle « chiffre ou date » avertit et
ne bloque pas (64 fiches existantes contiennent déjà un chiffre : case B2, relecture par Denis).

**Inventaire hors outil** : `node scripts/checkLexique.js --termes` imprime `id | titre | variantes de
recherche`, puis la liste des familles. Utile pour un balayage fait à la main ou dans un chat. Un mot
qui figure dans cette sortie ne se re-propose pas : au mieux il devient une modification de la fiche
existante.

**Après chaque modification** : `node scripts/checkLexique.js` (0 erreur ET 0 avertissement attendus,
LECONS 9.26) et `npm test`. L'outil les lance lui-même à l'enregistrement.

### Prompt de la porte C (texte assemblé par l'outil)

```
Je maintiens un lexique pour des professionnels de l'insertion et des personnes en
recherche d'emploi. Repère les termes, sigles, dispositifs et pratiques du champ de
l'insertion professionnelle qui sont APPARUS ou ont CHANGÉ DE SENS sur [PÉRIODE, défaut :
les douze derniers mois]. Ton rôle est UNIQUEMENT de collecter des faits sur ces termes,
PAS de rédiger une définition ni de classer le terme.

[SOCLE DE RECHERCHE COMMUN - voir 2bis] Cherche sur : service-public.fr, Légifrance,
ministère du Travail (dont la lettre hebdo travail-emploi), France Travail, France
compétences, les CARIF-OREF (Cap Métiers Nouvelle-Aquitaine), vie-publique.fr. Adresse de
la source obligatoire. Ne propose pas un terme dont tu n'as pas trouvé de source officielle :
mieux vaut une liste courte et sûre. Pas d'avis, pas de recommandation.

Pour chaque terme, renseigne EXACTEMENT ces champs, dans cet ordre :
- id : identifiant court en minuscules avec des traits d'union (ex. contrat-valorisation-experience)
- titre : le terme tel qu'on l'écrit (sigle développé entre parenthèses si utile)
- statut : nouveau / evolue / obsolete
- changement : seulement si évolué ou obsolète, ce qui a changé et par quoi c'est remplacé
- fait_brut : ce que dit la source officielle sur ce terme, TEL QUEL (à qui il s'adresse, ce
  qu'il permet, conditions, montants) - pas une définition simplifiée, le fait complet
- source : nom-court | titre | https://adresse | JJ/MM/AAAA

TERMES EXISTANTS, pour ne pas proposer un doublon (identifiant | titre) :
[l'outil colle ici la liste lue dans data/lexique.js]

Termine par un bloc entre [LEXIQUE-BRUT] et [/LEXIQUE-BRUT], une entrée par terme, séparées par
une ligne vide, les champs dans l'ordre ci-dessus (une ligne « champ: valeur » chacun).
[LEXIQUE-BRUT]
id: ...
titre: ...
statut: nouveau | evolue | obsolete
changement: -
fait_brut: ...
source: nom-court | titre | https://adresse | JJ/MM/AAAA
[/LEXIQUE-BRUT]
```

(L'assistant en ligne ne classe rien et ne rédige rien : la famille, les registres, les mots de
recherche, le texte et les renvois sont choisis par Denis dans le formulaire du mot.)

**`docs/CORPUS_LEXIQUE.md`** : doc éditorial de 42 fiches, **marqué périmé le 2026-09-06**. La source de
vérité est `data/lexique.js`. Conservé pour l'historique ; ne rien y ajouter.

### 5quater.2 - Les chiffres à jour d'une fiche, et leur revérification tous les 6 mois (21 octobre 2026)

Chantier `docs/CHANTIER_LEXIQUE_CHIFFRES_A_JOUR_2026-10-20.md`. Décision de Denis : ne pas niveler par le bas, donner l'information à jour avec le maximum de détails utiles, tant qu'elle est vérifiée.

**Le principe.** Une fiche a un **texte de fond sans chiffre qui vieillit** et, si besoin, un **bloc « Les chiffres à jour »** (champ `detailsAJour` de `data/lexique.js`) : date de vérification, source officielle (nom et adresse https), lignes (libellé, valeur, catégorie, « peut changer »), 8 lignes au plus. L'application n'affiche le bloc que s'il a été **vérifié depuis moins de 6 mois** (constante `LEXIQUE_SEUIL_MOIS_DETAILS` de `modules/lexique/index.js`, lue aussi par l'outil) ; sinon un **message général**, le même pour toutes les fiches, renvoie à la source officielle. Un bloc dont aucune ligne ne peut changer (faits passés) ne se périme jamais. Une fiche migrée mais jamais vérifiée montre le message général. **Aucun bouton de modification dans l'application.**

**Retrouver les fiches concernées (existantes et futures).** Un seul détecteur, `scripts/reperesChiffres.js` : date ou année, montant, durée, pourcentage, référence de texte, âge ou seuil ; les chiffres des noms (115, bulletin n° 3, A1 à C2) et les tournures (« un jour relancé », « d'un trimestre à l'autre ») ne sont pas des repères. Il sert à l'outil (formulaire, filtres de la liste), à `scripts/checkLexique.js` et aux essais : **un chiffre dans le texte d'une fiche absente de la liste de transition est une erreur**, quelle que soit la façon dont la fiche est arrivée (écrite à la main, créée dans l'outil, modifiée par Claude). La liste de transition (`outils/lexique_transition_chiffres.txt`) ne fait que rétrécir.

**Dans « Le Lexique » de l'outil.** Formulaire d'un mot : bloc « Les chiffres à jour » (lignes, source, case « J'ai ouvert la source », bouton « Marquer comme vérifié le … » : la date ne change jamais toute seule), « Placer dans le bloc » (les chiffres repérés dans le texte deviennent des lignes), avant et après du bloc. Liste des mots : filtres par catégorie et par état (à jour, bientôt à revérifier, périmé, jamais vérifié, faits qui ne changent pas), résumé « chiffres à revérifier ». Rappel : carte « Revérifier les chiffres des fiches » du menu Lexique (rythme « Tous les 6 mois ») et badge du Lexique sur l'accueil de l'outil.

**Prompt de vérification par lot** (filtre « chiffres à revérifier », bouton « Préparer la vérification de ces fiches », huit fiches au plus, les plus en retard d'abord ; routes `/api/lexique/verification-prompt` et `/api/lexique/verification-lire`). Il reprend la structure du complément qui marche (`docs/PROMPT_VERIFICATION_COMPLEMENT_QUI_MARCHE_2026-10-17.md`) : recherche web, sites officiels seulement, règle par cas « confirmé », « corrigé », « non vérifiable », forums, blogs et comparateurs interdits, suite en PARTIE 2, aucun commentaire. Réponse attendue entre `[LEXIQUE-CHIFFRES]` et `[/LEXIQUE-CHIFFRES]`, une ligne par valeur :

```
identifiant de la fiche | libellé | statut | valeur lue sur la page officielle | URL exacte de la page lue | ce que tu as lu
```

L'outil lit la réponse contre les vrais blocs (libellé exact, tableau markdown toléré, adresse https seulement) et montre des **propositions** : « Ouvrir la fiche avec les valeurs proposées » les met dans le bloc sans rien enregistrer. L'assistant propose, **Denis ouvre la source, coche et enregistre**.

**Migration des fiches existantes (21 octobre 2026).** Les 69 fiches de la liste de transition ont chacune une proposition (texte de fond sans chiffre, lignes du bloc reprises du texte actuel, source) dans `outils/sas/migration_chiffres.sas.txt` (7 lots ; trois fiches sans bloc). Bouton « Proposition de migration (lot N) » dans la liste des mots : la proposition se met à l'écran sans rien enregistrer ; Denis relit, corrige, enregistre ; la fiche sort alors de la liste de transition dans le même enregistrement.

### 5quater.1 - Le prompt `[TRIAGE-MOTS]` n'existe plus

Retiré le 20 octobre 2026 (décision 6 de Denis) : le tri « ce mot existe-t-il déjà ? » est fait par le
code de l'outil (identifiant identique, titre proche, mot déjà en liste ou déjà écarté), sans assistant
en ligne et sans coût. Voir « Ma liste » ci-dessus.

---

## 5quinquies. À confronter - le non officiel, recoupé

**Rôle :** une fois par trimestre, aller voir ce qui se dit **hors des sources officielles** (réseau des
professionnels de l'insertion : publications LinkedIn de CIP, de France Travail, de missions locales,
de structures de l'IAE ; lettres d'information de réseaux ; groupes et pages métier ; blogs
emploi-formation), puis **confronter chaque signal à l'information officielle** et le classer. Décision
Denis 2026-09-04. C'est le **seul** endroit du circuit où l'on regarde du non officiel : les prompts
1, 3, Balayage, Chiffres et Lexique restent volontairement sur les sources institutionnelles.

**Ne produit pas de fiches.** Un digest trimestriel `contenu/a-confronter/<fin>.md` qui alimente le
bloc « À confronter » des rayons (maquette décision 12) : jamais mélangé aux fiches ni au tableau des
sources, jamais de lien cliquable, formulation non fataliste (« à recouper vous-même, et à en parler
avec la personne qui vous accompagne »).

Bloc « À confronter » dans `veille.html`, section « Chaque trimestre ». Prompt généré à l'ouverture
pour le dernier trimestre civil complet.

### Texte assemblé par l'outil

```
Je prépare des pistes de réflexion pour un conseiller en insertion professionnelle. Je veux
savoir ce qui se dit dans le réseau des professionnels de l'insertion sur le trimestre
[PÉRIODE], et le confronter à l'information officielle.

[SOCLE DE RECHERCHE COMMUN - voir 2bis]

Étape 1, le terrain : cherche sur des sources NON officielles orientées métier ce qui
revient sur l'accompagnement vers l'emploi, l'insertion, la formation, les aides, les
publics en difficulté : publications LinkedIn de conseillers en insertion, de France
Travail, de missions locales, de structures de l'insertion par l'activité économique ;
lettres d'information de réseaux professionnels ; groupes et pages métier ; blogs
spécialisés emploi-formation. On cherche le SIGNAL FAIBLE, pas l'actualité déjà officielle :
une pratique de terrain qui se répand, une inquiétude qui circule (fermeture, gel de
crédits, délai qui se dégrade), une consigne interne relayée, un écart entre ce que disent
les collègues et ce que dit le texte. N'inclus PAS un événement déjà annoncé par une
administration ou France Travail (job dating, semaine des métiers, tournée d'un dispositif) :
ça relève du Balayage. Zone : [RÉGION], [DÉPT] quand c'est local.

Étape 2, la confrontation : pour CHAQUE point retenu, fais une recherche web sur les
sources officielles (service-public.fr, Légifrance, ministères, France Travail, France
compétences, CARIF-OREF, INSEE, DARES) et dis ce qu'elles disent, ou si elles ne disent
rien. Puis classe le point.

Ne donne pas d'avis sur les personnes, pas de conseil, pas de ton alarmiste. Tu rapportes
un signal et tu le recoupes.

Termine par un bloc entre [CONFRONTER periode: PÉRIODE] et [/CONFRONTER]. Un point par
entrée, séparé du suivant par une ligne vide, six lignes « champ: valeur » dans cet ordre :
signal: ce qui se dit, en une ou deux phrases
d_ou: le type de source, sans nom de personne
rayon: un des mots-clés de rayon, ou « général »
confrontation: ce que disent les sources officielles, ou « rien trouvé »
statut: CONFIRME | EN PARTIE | INEXACT | PAS DE POSITION
a_recouper: ce qu'un CIP devrait vérifier lui-même
Si rien de solide : une seule ligne « signal: Rien retenu ce trimestre ».
```

### La sortie

`contenu/a-confronter/<fin>.md`, frontmatter `type: a-confronter` + `non_verifie: true`, une entrée
par signal avec `rayon:`, `statut:` (confirmé / en partie / contredit / pas de position), ce qui se
dit, d'où, ce que dit l'officiel, à recouper. Contrôle de cohérence : signal sans confrontation, rayon
manquant.

---

## 5sexies. Import manuel - un texte copié à la main

**Rôle :** certains sites officiels (Légifrance, ministère de l'Intérieur, education.gouv.fr,
monenfant.fr, justice.fr...) bloquent toute lecture automatique. Quand une information n'est
disponible que sur un de ces sites, Denis y va lui-même, copie le passage, et le colle dans
`veille.html`, section **« Importer un texte à la main »** (tout en haut, hors des deux modes).
L'outil prépare **un des trois prompts** selon la destination choisie. Décision Denis 2026-09-05.

- **La liste des sites bloqués** est dans l'outil (`SITES_BLOQUES`), chacun avec un lien direct et
  une marque « vu le [date] » gardée dans le navigateur (`localStorage` `veille_sites_vus`), pour
  savoir quand le site a été consulté pour la dernière fois. Générer un prompt avec une adresse
  dont le domaine est dans la liste marque ce site « vu » automatiquement.
- **L'adresse de la page (champ dédié).** Denis colle l'URL exacte de la page qu'il a ouverte. Le
  prompt demande à l'assistant de la citer comme source ET de la reporter dans le bloc final
  **avec la date du jour** : elle est vérifiée, Denis vient de la consulter. Un site qui bloque la
  lecture automatique n'est pas un site fermé. C'est la **seule exception** au « pas de lien tant
  que non vérifié » de LECONS 9.16, et elle est légitime : la vérification, c'est la visite de
  Denis. Toute autre adresse ajoutée par l'assistant reste sans date.
- **Trois destinations, trois prompts.** L'utilisateur tranche lui-même la destination (il sait sur
  quel site il est allé) ; il n'y a pas de classement automatique.
  - **Comprendre le cadre** : l'assistant dit à quel(s) rayon(s) le texte se rattache, puis produit
    des blocs `[FICHE n]` (même format que le prompt 2) et un bloc `[COLLECTE]` (sources +
    structures avec portée). Dépôt à la main dans `contenu/`.
  - **Lexique** : bloc `[LEXIQUE-BRUT]` (§ 5quater, porte C). Se colle dans la fenêtre « Le Lexique »
    de l'outil (« Les mots à proposer », « Coller ici et lire »).
  - **Chiffres** : bloc `[CHIFFRES]`. **Le prompt existe, le branchement vers le module « Comprendre
    les chiffres » est reporté** à la construction de ce module (voir
    `CHANTIER_IMPORT_MANUEL_VEILLE.md`).
- **Garde-fou** : l'assistant travaille à partir du texte fourni, peut compléter avec des sources
  qu'il ouvre, mais n'invente ni adresse, ni numéro de texte, ni date. Ce qu'il ne peut pas
  vérifier : « à vérifier ». Toute adresse extraite arrive dans `liens-verifies.txt` avec la
  colonne date vide (LECONS 9.16).

Le texte exact des trois prompts vit dans `veille.html` (`assemblerImport()`).

---

## 5septies. `[CONTROLE-SOURCE]` - un lien source ne répond plus

> Un bloc « Un lien source ne répond plus » existe dans `veille.html` (mode « Entretenir la base »,
> section « Chaque trimestre ») : on renseigne titre de la fiche, adresse morte, ce que la fiche
> affirme, date `verifie_le`, et il assemble ce prompt. Le texte de référence est ci-dessous.
> Denis (ou un assistant avec recherche web) le lance quand un lien « source officielle » renvoie
> une erreur, ou lors d'un contrôle périodique.

**Quand :** un lien source d'une fiche renvoie une erreur (404, page introuvable) au navigateur ;
ou, au passage trimestriel, contrôle d'un rayon ; ou Denis a un doute sur une fiche.

**Le principe :** un lien mort **ne veut pas dire** que l'information est périmée. Le plus souvent
la page a seulement changé d'adresse (les sites .gouv.fr se réorganisent). Ce prompt fait la
différence entre **relogé** (restructuration, contenu valable), **modifié** (existe mais les règles
ont changé) et **supprimé** (dispositif aboli ou fondu dans un autre).

**Ce que Denis fournit :** le titre de la fiche + 2-3 phrases de ce qu'elle affirme + l'URL morte +
la date `verifie_le` de la fiche.

```
Recherche web obligatoire. Une fiche d'information cite une source officielle dont
l'adresse ne répond plus. Vérifie le SUJET, pas seulement l'adresse.

Fiche : « [TITRE DE LA FICHE] »
Ce qu'elle affirme : [2 à 3 phrases]
Adresse qui ne répond plus : [URL]
Date de dernière vérification de la fiche : [AAAA-MM]

Réponds en quatre points :
1. LE DISPOSITIF EXISTE-T-IL ENCORE ? oui / non / remplacé par [X]. Cite les pages
   officielles que tu as réellement ouvertes, avec leur URL et leur date de dernière
   mise à jour. N'invente jamais une adresse ni une date : si tu ne l'as pas vue,
   écris « à vérifier ».
2. VERDICT : RESTRUCTURÉ (la page a changé d'adresse, le contenu reste valable) /
   MODIFIÉ (le dispositif existe mais des règles ont changé - précise lesquelles) /
   SUPPRIMÉ (aboli ou fondu dans un autre dispositif - lequel).
3. NOUVELLE ADRESSE (si RESTRUCTURÉ ou MODIFIÉ) : 1 à 3 URL officielles candidates,
   à valider ensuite au navigateur.
4. CE QUI CHANGE DANS LA FICHE (si MODIFIÉ ou SUPPRIMÉ) : les phrases précises à
   corriger, ou la recommandation de retirer / remplacer la fiche.

Termine par un bloc entre [CONTROLE-SOURCE] et [/CONTROLE-SOURCE].
[CONTROLE-SOURCE]
dispositif: <existe / remplacé par X / n'existe plus>
verdict: <RESTRUCTURÉ | MODIFIÉ | SUPPRIMÉ>
nouvelle_adresse: <URL(s) candidate(s) ou « - »>
fiche_a_changer: <ce qui bouge dans la fiche, ou « rien »>
sources_ouvertes: <URL | date, une par ligne>
[/CONTROLE-SOURCE]
```

**Le circuit ensuite :**

| Verdict | Denis | Dans l'app |
|---|---|---|
| RESTRUCTURÉ | ouvre l'URL proposée, la valide au navigateur | corrige la 2e colonne de `liens-verifies.txt` + date la 3e ; à défaut, repointe la fiche vers une source déjà datée qui couvre le même sujet |
| MODIFIÉ | valide ce qui a changé | ligne dans `docs/NOUVEAUTES_A_STATUER.md`, décision `MISE À JOUR` ; réécrire les phrases via « Traiter » de `veille.html`, MAJ `verifie_le` + `revisions:` |
| SUPPRIMÉ | décision éditoriale | `statut: retire` (pierre tombale) OU fiche de remplacement ; tracé dans le README du rayon + `NOUVEAUTES_A_STATUER.md` |

Cas déjà traités par cette méthode (démonstration, 2026-09-06) : `accompagnement-global-et-intensif`,
`francais-cours-de-l-ofii-cir`, `francais-a-quoi-servent-les-niveaux` - verdict RESTRUCTURÉ pour les
trois, sources repointées vers des clés déjà datées (voir `docs/PAQUET_B_BLOQUE_A_DATER.md`).

---

## 5octies. `[ASSOCIATIONS]` - l'annuaire associatif 24 / 87 (le circuit veille -> « Près de chez moi »)

> **RETIRÉ le 20/10/2026** : le bloc de recherche ouverte correspondant a été supprimé de l'outil de veille (décision de Denis : pas de recherche ouverte à l'extérieur). Le repérage des structures se fait désormais dans l'onglet « Structures d'aide » de l'outil de prospection (saisie à la main, texte lu sur une photo, page d'un partenaire), puis le pont vers le sas. Voir `docs/CHANTIER_PROSPECTION_PONT_REPERAGE_PETITES_STRUCTURES_2026-10-20.md`. Ce qui suit est conservé pour mémoire, ne plus l'utiliser.


**Rôle :** repérer les **associations et structures non officielles** (monde associatif, insertion,
accompagnement social, solidarité) actives en Dordogne (24) et en Haute-Vienne (87), et les rattacher
au **rayon** de « Comprendre le cadre » qu'elles concernent, pour **compléter** les structures
officielles dans « Près de chez moi ». Décision Denis 2026-09-06 : le monde associatif est une vraie
ressource pour un public que les guichets officiels intimident ; on l'ajoute **en complément**, jamais
en remplacement. Cadence : une fois par trimestre.

Bloc « Annuaire associatif Dordogne et Haute-Vienne » de `veille.html`, section « Entretenir la base »,
rectangle bleu « Nourrit : Comprendre le cadre ».

### Le circuit

**repérer** (`[ASSOCIATIONS]`) -> **relire** (l'outil groupe par rayon, produit deux blocs prêts à
coller) -> **déposer non daté** (`structures:` des collectes de rayon + `liens-verifies.txt`,
3e colonne vide) -> **statuer** (`docs/NOUVEAUTES_A_STATUER.md`, section « Structures associatives à
vérifier ») -> **vérifier au navigateur** (LECONS 9.16 : une adresse ne devient cliquable qu'une fois
ouverte et datée ; **jamais dater sans avoir vu le site**, sauf certitude à 100 % - antenne locale
d'une fédération nationale connue).

### Où l'assistant cherche

Annuaire de l'économie sociale et solidaire, HelloAsso, Le Mouvement associatif Nouvelle-Aquitaine,
URIOPSS Nouvelle-Aquitaine, guides des solidarités des conseils départementaux 24 et 87, annuaires des
CCAS et des centres sociaux, fédérations nationales et leurs antennes 24 / 87 (Cimade, Secours
catholique, Croix-Rouge, Restos du cœur, Secours populaire, ADIE, France Victimes, France Bénévolat,
auto-écoles sociales, garages solidaires, épiceries solidaires, associations de cours de français et
de médiation administrative, régies de quartier).

### Garde-fou anti-invention

Le prompt exige : **n'invente aucune adresse ; si tu n'as pas ouvert le site de l'association, ne le
donne pas ; mieux vaut cinq associations sûres que trente douteuses ; donne l'adresse du site de
l'association elle-même (pas celle de l'annuaire), sa ville, et l'annuaire où tu l'as trouvée.** Pas
de structure purement officielle (déjà couverte).

### Format de sortie

Bloc entre `[ASSOCIATIONS]` et `[/ASSOCIATIONS]`, une entrée par association, lignes `champ: valeur`
dans cet ordre : `rayon` (clé exacte, ex. `mobilite`), `nom`, `ville` (avec `(24)` ou `(87)`), `url`,
`quoi` (une phrase), `annuaire` (où trouvée). L'outil en tire :

- pour chaque rayon, des lignes `structures:` `"asso-<slug> | <nom> : <quoi> | <url> | "` à coller
  dans `modules/comprendre-le-cadre/contenu/<rayon>/<rayon>.collecte.md` ;
- les lignes de `liens-verifies.txt` : `asso-<slug> | <url> |  | <24|87|region>` (date vide).

Rien n'est écrit automatiquement : Denis relit, garde, colle, puis vérifie et date au fil des passages.

---

## 6. Prompt public - « Vérifier une information récente » (pour mémoire)

**Ce prompt n'est pas dans ce circuit de veille.** Il est monté par le **code du module** selon le
sujet choisi et le territoire, et c'est le seul prompt qu'une personne accompagnée voit. Reproduit ici
seulement pour garder tous les textes de recherche au même endroit.

```
Je cherche une information récente et vérifiée concernant : [le sujet choisi, ex. « le
montant actuel de la prime d'activité pour une personne seule sans enfant »].

Territoire : réponds uniquement pour [la France entière / la région Nouvelle-Aquitaine /
le département de la Dordogne (24)]. [Distingue clairement ce qui relève du niveau
national, du niveau régional et du niveau départemental. N'utilise jamais d'informations
d'un autre département : ne mélange pas les départements.]
[Ce département compte plusieurs zones d'emploi (bassins d'emploi : Bergerac, Périgueux,
Sarlat). La loi est la même partout, mais les métiers qui recrutent, les structures et les
dispositifs peuvent varier d'une zone à l'autre : si c'est le cas, précise pour quelle zone.]

Recherche : recherche web obligatoire. Appuie-toi d'abord sur des sources officielles
françaises (sites en .gouv.fr, le site du service public, l'INSEE, France Travail, la
DARES, le conseil régional, le conseil départemental). Pour chaque information, cite la
source, sa date et le territoire exact. Si tu ne peux pas faire de recherche web, dis-le
et ne réponds pas.
[Si le sujet est « un dispositif et qui le porte » : Pour chaque dispositif, indique quelle
structure le porte sur ce territoire et comment la contacter. Si tu ne trouves pas la
structure porteuse, dis-le clairement plutôt que de deviner.]

Cherche aussi les associations reconnues de ce territoire qui accompagnent sur ce sujet :
donne leur nom, leur site officiel et comment les contacter. Range-les à part, sous
"associations à contacter", et précise bien que ce sont des associations, pas des services
publics.

Si la réponse dépend de ma situation personnelle, explique de quoi elle dépend, sans
conclure à ma place. Pas de classement, pas de recommandation, pas de score.
```

---

## 7. Les règles de territoire (communes à tous les prompts)

Trois couches, écrites noir sur blanc dans le prompt pour que l'assistant ne mélange jamais les
territoires :

- **National** : « la France entière ». Si une règle particulière ne vaut que dans certaines régions
  ou certains départements, l'assistant doit le signaler.
- **Régional** : « la région Nouvelle-Aquitaine ». Distinguer national et régional ; ne pas utiliser
  d'informations d'une autre région.
- **Départemental** : « le département de la Dordogne (24) » (ou la Haute-Vienne selon l'instance).
  Distinguer national / régional / départemental ; **ne jamais utiliser d'informations d'un autre
  département**.

**Nuance zone d'emploi (bassin d'emploi) :** la loi est la même dans tout le département, mais les
métiers qui recrutent, les structures et les dispositifs varient d'un bassin à l'autre. Quand la
réponse en dépend, l'assistant précise pour quelle zone. Zones d'emploi indicatives : Dordogne
= Bergerac, Périgueux, Sarlat ; Haute-Vienne = Limoges et sa couronne, ouest du département.

---

## 8. Le rituel : mensuel et trimestriel

### Tous les trois mois : le Balayage et les Chiffres (deux prompts séparés)

Le panneau **« Ce trimestre »** (en haut, en miroir de « Ce mois-ci ») liste les quatre digests
(Balayage ☐, Chiffres ☐, Lexique ☐, À confronter ☐) pour le dernier trimestre civil complet, et coche
chacun dès que son bloc a été lu. On voit d'un coup ce qui reste.

Quatre blocs séparés : « Balayage trimestriel » (les changements officiels), « Chiffres clés du
trimestre » (les valeurs), la fenêtre « Le Lexique » (les mots), « À confronter » (le non officiel,
recoupé). Chacun a son prompt déjà généré à l'ouverture, pour le dernier trimestre civil complet (ou
un autre, en choisissant un mois du trimestre voulu). Copier, lancer en recherche web, recoller le
bloc (`[BALAYAGE]` / `[CHIFFRES]` / `[LEXIQUE]` / `[CONFRONTER]`), relire l'aperçu, télécharger vers
`contenu/balayage/`, `contenu/chiffres/` ou `contenu/a-confronter/`, committer. C'est la première
chose produite de la V1 (recentrage CIP, 17.19-17.22). Les garder séparés protège la profondeur de
chaque recherche (LECONS 1bis).

**Juste après le Balayage : le triage.** Coller le digest + la liste des fiches dans le prompt
`[TRIAGE]` (§ 5bis.2), recopier sa sortie dans `docs/NOUVEAUTES_A_STATUER.md`, trancher chaque ligne
(MISE À JOUR / NOUVELLE FICHE / ÉCARTÉ). Rien de repéré ne se perd : le registre garde la décision.
Un lien source mort se traite à part, par `[CONTROLE-SOURCE]` (§ 5septies).

### Tous les mois : le contrôle des fiches

Une passe par mois, dans `outils/veille.html`, mode « Entretenir la base » :

1. Charger « Ma base » (les `.md` du dossier `contenu/`) si des fiches ont changé depuis la dernière fois.
2. Bloc « Contrôle mensuel des rayons ». La **checklist de cycle** montre chaque rayon avec son état :
   ⬜ à faire · 🔄 en cours · ✅ contrôlé ce mois-ci (persiste, impossible à rater, pas de double travail).
   - **Cycle** : cocher les rayons du jour (ou « Cocher ceux qui sont dus »), « Démarrer ». L'outil prépare
     le prompt 3 du 1er rayon ; dès qu'on colle son `[CONTROLE]`, il enchaîne sur le suivant, jusqu'au bout
     (« Cycle 2 / 3 : Mobilité », puis « Cycle terminé »). Les allers-retours avec l'assistant restent
     manuels (pas d'API) ; le cycle enlève la navigation et le suivi.
   - **Ou un rayon isolé** : le même prompt 3, un rayon à la fois.
   Pour chaque rapport `[CONTROLE]` lu :
   a. (déjà fait par le cycle : le prompt 3 a été généré et lancé)
   b. Lire les pastilles dans « Ma base » :
      - **A JOUR** : rien à faire. Si Denis a réellement revérifié, bouton « Cette fiche est toujours
        bonne » (redate `verifie_le`, pas de ligne de révision).
      - **CHANGEMENT** : bouton « Traiter » -> prompt 1 ciblé pré-rempli -> collecte -> rédaction ->
        la nouvelle version s'intègre à la même fiche (même `id`) avec une ligne `revisions:` datée.
      - **PRINCIPE OBSOLETE** : le dispositif n'existe plus. Pas de « Traiter » : direction
        « Retirer une fiche » (pierre tombale, avec le remplacement éventuel dans le résumé).
      - **INCERTAIN** : Denis va voir lui-même.
3. Vérifier les adresses nouvelles dans le registre `liens-verifies.txt`.
4. Committer les fiches modifiées et le registre.

**Les trois issues d'une fiche :** *redater* (rien de matériel n'a changé), *réviser* (un détail a
bougé -> ligne `revisions:`), *retirer* (dispositif fermé ou info trompeuse -> `statut: retire`, pierre
tombale). On ne garde jamais une information fausse « pour l'historique ».

---

## 9. Anti-doublon : le rappel

- L'**identité** d'une fiche est son `id` (`<rayon>-<slug-du-titre>`), décidé une fois par Denis, jamais
  renommé. Pas de codes émis par l'assistant : il n'a pas de mémoire d'une session à l'autre.
- Les prompts 2 et 3 reçoivent la liste des fiches existantes du rayon et doivent reprendre l'`id` exact.
- À l'import, l'outil signale les rapprochements (« ressemble à ») ; **Denis tranche**, l'outil ne décide
  pas.
- Si le titre d'une fiche devient faux : on change le champ `titre:`, **pas le nom du fichier**.

---

## 10. Tenue de ce document

- Le texte exact des prompts vit dans `outils/veille.html`. Ce document le reflète : toute retouche se
  fait d'abord dans l'outil, puis ici, dans le même passage.
- `[TRIAGE]` (§ 5bis.2) et `[CONTROLE-SOURCE]` (§ 5septies) : d'abord écrits ici en documentation
  (2026-09-06), puis câblés en blocs `veille.html` (mode « Entretenir la base », section « Chaque
  trimestre ») dans le même passage. La section « Comment ça marche » de `veille.html` décrit le
  circuit pour qu'il soit reproductible sans Denis.
- (Historique, remplacé le 20 octobre 2026 par la fenêtre « Le Lexique », § 5quater : le bloc « Nourrir le Lexique » et le prompt `[TRIAGE-MOTS]` n'existent plus.) `[LEXIQUE]` retargeté et `[TRIAGE-MOTS]` : chantier veille -> mots, 2026-09-06.
  Bloc 1 (doc) + bloc 2 (rewire du bloc « Nourrir le Lexique » de `veille.html` vers le format objet
  `data/lexique.js`, champ « termes existants », bouton `[TRIAGE-MOTS]`) + bloc 3
  (`docs/CORPUS_LEXIQUE.md` marqué périmé ; « Comment ça marche » de `veille.html` complété) : faits.
- **Centre Inffo retiré des relais (2026-09-08).** Centre Inffo est en liquidation judiciaire depuis
  le 16 juillet 2026, sans repreneur : « Le Quotidien de la formation » et « Inffo Formation » ont
  cessé (perte du financement public au 1er janvier 2026). Les trois prompts qui s'appuyaient dessus
  (socle commun § 2bis, balayage § 5bis, lexique § 5quater) le remplacent par : la lettre hebdo du
  ministère du Travail (`travail-emploi.gouv.fr`), les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine,
  et `vie-publique.fr`. Corrigé dans `veille.html` puis ici, même passage. Reste à instruire : la
  veille juridique fine sur la formation (spécialité de Centre Inffo) n'a pas d'équivalent gratuit
  direct ; seul candidat, AEF info, payant (voir `docs/VEILLE_NEWSLETTERS.md`).
- Ce document et la maquette (`docs/MAQUETTE_SE_TENIR_INFORME_PARCOURS_2026-09-03.html`, annexe) et la
  réconciliation (`docs/CHANTIER_SE_TENIR_INFORME_MAJ_2026-09-03.md`, section 17) doivent rester
  cohérents. En cas de doute, l'outil fait foi pour le texte, la réconciliation fait foi pour la
  doctrine.
- Deux comptes Claude travaillent sur ce dépôt : vérifier `git log` avant de reprendre.
- **§ 5ter.4 et 5ter.5 documentés a posteriori (2026-09-13, audit de cohérence).** Les deux prompts
  existaient déjà dans `outils/veille.html` depuis leur construction (profil des découpes et médecins
  généralistes, 2026-09-12 ; spécialistes, dentistes, pharmaciens ajoutés ensuite au même mécanisme)
  mais n'avaient jamais été reportés ici, contrairement à la règle du premier point de cette section.
  Trouvé en auditant le chantier « déserts médicaux » à la demande de Denis. Rien à changer côté
  `veille.html` : uniquement un rattrapage de documentation.


## Mon territoire : mettre à jour les structures et les employeurs (ajouté le 2026-10-12)

Les **structures** (logement, puis les autres rayons au fur et à mesure) et les **employeurs** du module « Mon territoire » ne passent pas par les prompts : ils se mettent à jour **à la main, par fiche**, dans l'outil de veille, panneau **Dépôt**, section **5. Mon territoire** (bouton « Ouvrir Mon territoire »).

- **Choisir le registre** : « Les structures » ou « Les employeurs ». Le filtre « À vérifier » montre les fiches sans date ou vérifiées il y a plus de 12 mois : c'est la liste mensuelle à revérifier.
- **Valider** : cliquer l'adresse (elle s'ouvre), constater que la page est bonne, « Valider » (date du jour). **Modifier** : changer l'adresse ou le texte, cocher « j'ai ouvert l'adresse » pour dater. **Ajouter** : remplir la fiche ; une adresse ou un téléphone sans date est refusé. **Supprimer** : retire la fiche.
- **Enregistrer** : l'outil contrôle l'ensemble avec les règles de l'application, regénère les copies, lance les tests, et enregistre en local (jamais de push). Si un contrôle échoue, tout revient comme avant. « Annuler la dernière publication » défait l'enregistrement.
- **Une adresse ou un téléphone ne s'affiche dans l'application que si la fiche est datée de moins de 12 mois.**
- **Zones** : la colonne « Zone desservie » se remplit avec `epci:` (code de l'intercommunalité, liste dans `modules/mon-territoire/contenu/communes-24.txt`) ou `commune:` (nom), séparés par « ; ». Ne jamais la deviner : laisser vide tant qu'elle n'est pas confirmée par la structure.
- **Rayons migrés** (aujourd'hui : Logement et Accompagnement) : leurs structures vivent seulement dans `lieux.txt` ; ne plus les ajouter à la collecte du rayon ni au registre `liens-verifies.txt`. Le bloc « Annuaire associatif » de la page reste valable pour les rayons pas encore migrés.
- Détail technique : `outils/veilleTerritoire.js`, `outils/veilleDepot.js` (type `territoire`), `modules/mon-territoire/ARCHITECTURE_TECHNIQUE.md`.
