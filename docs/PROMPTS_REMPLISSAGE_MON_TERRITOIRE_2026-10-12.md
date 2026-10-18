# Mon territoire : prompts pour remplir la Dordogne et la Haute-Vienne

> **Pour ChatGPT seulement, prêts à copier, dans l'ordre : utilisez `docs/PROMPTS_CHATGPT_PRETS_A_COPIER_2026-10-12.md`** (aucun champ à compléter). Le présent fichier reste la référence détaillée (principes, modèles, annexes).

> Préparé le 2026-10-12 pour Denis. À utiliser dans ChatGPT et Perplexity, un prompt à la fois.
> **Règle d'or** : ce que répondent ces assistants est une **liste de candidats**, jamais une vérité. Rien n'entre dans l'application sans une vérification datée (ouvrir le site de l'organisme, constater que l'adresse et le numéro sont bons, dater du jour). C'est ce qui rend le module fiable pour le public.
> Cette étape ne change **rien** dans l'application : le module reste fermé.

---

## 0. Comment travailler, en 6 étapes

| Étape | Quoi | Où | Durée indicative |
|---|---|---|---|
| 1 | Coller le **prompt 0 (règles communes)** au début de chaque nouvelle conversation | ChatGPT ou Perplexity | 1 minute |
| 2 | **Prompt 1** : les bassins d'emploi de chaque département (à valider une fois) | Perplexity | 15 minutes |
| 3 | **Prompt 2** : les secteurs à remplir en premier (données officielles) | Perplexity | 15 minutes |
| 4 | **Prompt 3** : les structures, rayon par rayon, **les deux départements dans la même conversation** (17 conversations) | ChatGPT (puis un autre assistant pour recouper) | 17 x 10 minutes |
| 5 | **Prompt 4** : les employeurs, secteur par secteur, **les deux départements dans la même conversation** | ChatGPT (ou Perplexity) | 21 conversations au maximum |
| 6 | **Prompt 5** : les numéros de téléphone d'une liste déjà connue, **Prompt 6** : le contrôle croisé | les deux | par lots de 15 lignes |

**Deux sources à ne pas oublier** :
- **Le carnet de votre tutrice** : vous le photographiez, je le lis et je le transcris. **Avant toute transcription** : l'accord de votre tutrice, et retrait de tout nom de personne (le module n'affiche que des coordonnées d'organismes).
- **Les partenaires de l'entretien du 15 octobre** : leur demander de relire les listes de leur territoire, sans contrepartie (le module reste neutre : « liste non exhaustive, aucun partenariat, aucune rémunération »).

**Pourquoi un assistant ne suffit pas** : il se trompe de numéro, de commune, ou cite des structures fermées. Le numéro de téléphone n'est donc **jamais gardé** s'il n'est pas accompagné de l'adresse de la page officielle où il figure : c'est la page que vous ouvrirez pour vérifier.

---

## 0bis. Si vous n'avez que ChatGPT gratuit (pas de Perplexity payant)

Perplexity n'est **pas indispensable** : tout peut se faire avec ChatGPT, avec ces adaptations.
- **Activer la recherche web** dans ChatGPT (bouton « Rechercher » ou globe sous la zone de saisie). Sans elle, ChatGPT répond de mémoire et se trompe de numéros et d'adresses : dans ce cas, n'utilisez ses réponses que comme une liste de **noms** à faire vérifier, et laissez vides les colonnes téléphone, site et source.
- **Les prompts 1 et 2 (bassins d'emploi, secteurs qui recrutent) : ne les faites pas.** Je les fais moi-même avec mes outils de recherche sur les sites officiels (INSEE, France Travail, Sirene), avec les sources citées. Vous n'avez rien à demander à ChatGPT pour cela.
- **Les prompts 3 et 4 (structures, employeurs) :** ChatGPT convient, une conversation par rayon ou par secteur. Collez le prompt 0 d'abord.
- **Le prompt 5 (téléphones)** et **le prompt 6 (contrôle croisé)** : je les remplace en partie par mes propres vérifications. Je contrôle les sites que ChatGPT cite avant de dater quoi que ce soit.
- **Quand ChatGPT limite le nombre de messages** : travaillez par petits blocs (un rayon, ou un secteur dans un département) et reprenez plus tard. Rien n'est perdu : chaque réponse est indépendante.
- **Rapportez-moi les réponses telles quelles** (copier-coller), y compris les listes « À vérifier » et « Sources consultées ».

---

## 1. Prompt 0 : règles communes (à coller en premier, à chaque conversation)

**Version renforcée du 2026-10-12** : elle interdit le bavardage, interdit de raccourcir, impose les deux départements dans la même réponse, et organise le découpage en parties avec votre « oui ». Collez-la **telle quelle** au début de chaque nouvelle conversation (ou, mieux, dans les « Instructions personnalisées » de ChatGPT : voir 1bis).

```
Tu es un extracteur de données, pas un assistant conversationnel. Je constitue un annuaire public et gratuit de structures et d'employeurs pour des personnes en recherche d'emploi, en Dordogne (24) et en Haute-Vienne (87), France. Ces règles s'appliquent à TOUTES tes réponses, jusqu'à la fin de la conversation.

A. FORME : ZÉRO BAVARDAGE
1. Ta réponse contient UNIQUEMENT : le bloc de code demandé, puis (si besoin) deux listes courtes « À vérifier » et « Sources consultées ». Rien d'autre.
2. Interdits : introduction, conclusion, reformulation de ma demande, « voici », « bien sûr », « je vous propose », excuses, explications, avertissements, questions, offres d'aide, suggestions, commentaires dans le bloc.
3. Tu ne discutes pas, tu ne négocies pas, tu ne demandes pas de confirmation, tu ne proposes pas de « faire une version plus courte » ou « de commencer par une partie ». Tu exécutes.

B. QUANTITÉ : TOUT, SANS RACCOURCIR
4. Aucune limite de longueur. Je veux TOUTES les lignes que tu peux sourcer, pour la Dordogne ET pour la Haute-Vienne, dans la MÊME réponse (deux sections : « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »).
5. Il est interdit de résumer, d'abréger, de regrouper plusieurs fiches en une, d'écrire « etc. », « ... », « et ainsi de suite », « liste non exhaustive », « par exemple », « je peux continuer », ou de ne donner qu'un échantillon. Chaque fiche a sa propre ligne, complète, avec toutes ses colonnes.
6. Si tu t'apprêtes à donner moins de lignes que ce que tu sais exister, c'est une erreur : continue d'écrire. Ne t'arrête que lorsque tu n'as réellement plus aucune fiche vérifiable à ajouter.
7. N'invente JAMAIS une fiche pour faire du volume. Une ligne sans source officielle n'est pas écrite : ses colonnes incertaines restent vides (jamais d'invention), et la ligne est signalée dans « À vérifier ».

C. SI C'EST TROP LONG POUR UN SEUL MESSAGE : DÉCOUPE EN PARTIES
8. Découpe TOI-MÊME la réponse en parties égales de taille raisonnable. Commence chaque partie par la ligne « PARTIE 1/3 » (puis 2/3, 3/3...). Ne mets que cette ligne avant le bloc.
9. Termine chaque partie, sauf la dernière, par exactement cette ligne : « PARTIE 1/3 TERMINÉE. Répondez OUI pour la partie suivante. » et ARRÊTE-TOI là.
10. Quand je réponds « oui » (ou « suite »), envoie IMMÉDIATEMENT la partie suivante, sans rien d'autre, sans rappeler ce qui précède, sans résumer. Continue ainsi jusqu'à la dernière partie, que tu termines par la ligne « FIN : toutes les parties sont envoyées. ».
11. Aucune ligne ne doit être répétée d'une partie à l'autre ni omise entre deux parties.

D. DONNÉES
12. N'invente rien. Si une information n'est pas trouvée sur une source officielle, laisse la colonne VIDE. Un vide vaut mieux qu'une erreur.
13. Téléphone : uniquement le standard de l'organisme ou de l'établissement, tel qu'il est publié sur son site officiel ou sur un annuaire officiel (service-public.fr, annuaire de l'administration, site de l'enseigne). Jamais un numéro de personne, jamais un mobile, jamais un numéro trouvé sur un site d'annonces. Pour chaque numéro, la page où tu l'as lu va dans la colonne « source ».
14. Aucune personne nommée (ni directeur, ni conseiller, ni gérant). Coordonnées d'organismes uniquement. Exclus les entrepreneurs individuels et auto-entrepreneurs.
15. Pas d'offres d'emploi, pas de classement, pas de note, jamais « recrute régulièrement ».
16. Français correct avec les accents. Jamais de tiret long ni de demi-cadratin : seulement le tiret simple "-" ou une virgule.
17. Format : un bloc de code, UNE LIGNE PAR FICHE, colonnes séparées par " | ", sans titre ni commentaire dans le bloc. La colonne « date » reste VIDE (ce sera la date de ma vérification).

Réponds uniquement : « Compris. »
```

### 1bis. Pour ne plus rien coller : les « Instructions personnalisées » de ChatGPT
Dans ChatGPT : votre nom en bas à gauche, puis **Personnalisation**, puis **Instructions personnalisées**, champ « Comment ChatGPT doit-il répondre ? ». Ce champ est limité (environ 1 500 caractères) : le prompt 0 complet est trop long pour y entrer, voici donc **la version courte qui couvre les trois points A, B et C** (1114 caractères, espaces compris). Une fois posée, elle s'applique à toutes vos conversations, et la version payante, qui tend à « économiser » ses réponses, y est contrainte plus fermement que par un message collé au milieu d'une conversation. Pensez à la retirer quand vous utilisez ChatGPT pour autre chose.

```
Tu es un extracteur de données, pas un assistant. Réponds UNIQUEMENT par le bloc de code demandé, puis deux listes courtes : « À vérifier » et « Sources consultées ». Jamais d'introduction, de conclusion, de question, d'excuse, d'offre d'aide ni de commentaire. Ne discute pas, ne négocie pas, ne propose jamais une version plus courte.
Donne TOUT, sans limite de longueur : toutes les lignes que tu peux sourcer, pour la Dordogne (24) puis la Haute-Vienne (87) dans la même réponse. Interdit de résumer, d'abréger, de regrouper, d'écrire « etc. », « ... », « par exemple », « je peux continuer ». Une fiche = une ligne complète. Si tu vas donner moins que ce qui existe, continue. N'invente jamais une fiche ni une colonne : un vide vaut mieux qu'une erreur.
Si c'est trop long, découpe toi-même en parties. Commence chacune par « PARTIE 1/3 ». Termine chacune, sauf la dernière, par « PARTIE 1/3 TERMINÉE. Répondez OUI pour la suite. » et arrête-toi. Quand je réponds « oui », envoie IMMÉDIATEMENT la partie suivante, sans rien d'autre, sans répéter. Dernière partie : « FIN : toutes les parties sont envoyées. »
```

**Encore plus court (727 caractères)**, si le champ vous refuse encore la version ci-dessus :

```
Extracteur de données, pas assistant : réponds UNIQUEMENT par le bloc de code demandé + listes « À vérifier » et « Sources ». Aucune introduction, conclusion, question, excuse, commentaire. Ne négocie jamais. Donne TOUT sans limite de longueur, Dordogne (24) puis Haute-Vienne (87) dans la même réponse. Interdit de résumer, abréger, « etc. », « ... ». Une fiche = une ligne complète. Si tu vas donner moins que ce qui existe, continue. N'invente rien : un vide vaut mieux qu'une erreur. Si trop long : parties « PARTIE 1/3 », finies par « PARTIE 1/3 TERMINÉE. Répondez OUI pour la suite. », arrête-toi ; à mon « oui », envoie IMMÉDIATEMENT la suivante, sans rien d'autre. Dernière : « FIN : toutes les parties sont envoyées. »
```

Les règles de données (D : numéros de téléphone, pas de personne nommée, format des lignes) restent dans le prompt de chaque conversation (prompts 3 et 4) : elles n'ont pas besoin d'être dans les instructions personnalisées.

### 1ter. Les relances toutes prêtes (à coller seulement si ChatGPT résiste)

**Il a raccourci ou s'est arrêté :**
```
Tu as donné moins de lignes que ce qui existe. Reprends sans aucun commentaire : donne maintenant TOUTES les lignes manquantes, pour la Dordogne puis pour la Haute-Vienne, au même format, sans répéter celles déjà données. Si c'est trop long, découpe en parties selon la règle C.
```

**Il bavarde ou pose des questions :**
```
Ne réponds plus par des phrases. Applique la règle A : uniquement le bloc de code demandé, puis les deux listes. Recommence ta dernière réponse maintenant.
```

**Il a coupé au milieu d'une ligne :**
```
Ta réponse s'est coupée. Reprends à partir de la dernière ligne COMPLÈTE que tu as écrite, sans la répéter, sans commentaire, et continue jusqu'au bout.
```

**Pour vérifier qu'il n'a rien oublié :**
```
Sans rien écrire d'autre, donne uniquement : le nombre de lignes données pour la Dordogne, le nombre pour la Haute-Vienne, et la liste des structures ou employeurs que tu connais mais que tu n'as PAS mis dans le tableau, avec la raison de chaque omission. Puis écris les lignes manquantes que tu peux sourcer.
```

---

## 2. Prompt 1 : les bassins d'emploi (une fois par département)

À faire dans **Perplexity** (il cite ses sources). Vous validez ensuite la liste : elle servira à tous les prompts d'employeurs.

```
Pour le département [DÉPARTEMENT : la Dordogne (24) / la Haute-Vienne (87)], donne les zones d'emploi de l'INSEE qui le recouvrent, avec pour chacune : son nom, ses 5 principales communes par population, et si elle déborde sur un autre département. Ajoute, pour chaque zone, la page de l'INSEE ou de France Travail qui la définit. Réponds en tableau (zone | communes principales | déborde sur | source). Dis-moi si tu hésites sur une zone.
```

---

## 3. Prompt 2 : choisir les secteurs à remplir en premier

À faire dans **Perplexity**. On remplit d'abord là où l'embauche est la plus forte, sur des données officielles, pas sur une impression.

```
Pour le département [DÉPARTEMENT], donne les métiers et secteurs qui ont le plus de projets de recrutement dans la dernière enquête Besoins en main-d'oeuvre (BMO) de France Travail disponible, avec : l'année de l'enquête, le nombre de projets, la part de projets jugés difficiles, et l'adresse de la page source. Donne les 15 premiers métiers, puis regroupe-les dans les 21 secteurs suivants : commerce et vente, bâtiment et travaux publics, industrie, hôtellerie-restauration-tourisme, agriculture et espaces verts, transport et logistique, santé, social et services à la personne, administration et bureau, communication-culture, métiers animaliers, propreté et déchets, sport et animation, numérique, banque-assurance-immobilier, artisanat, métiers de bouche, éducation et formation, mécanique et automobile, sécurité, coiffure et esthétique. Si une donnée n'existe pas pour ce département, dis-le.
```

---

## 4. Prompt 3 : les structures d'un rayon, pour les DEUX départements

À faire dans **ChatGPT** (avec recherche web) après le prompt 0. **Une conversation par rayon, les deux départements dans la même réponse** : 17 conversations en tout. Pour la **Haute-Vienne**, on part presque de zéro (17 structures locales connues contre 73 pour la Dordogne) : c'est la priorité.

### 4.1 Le prompt (à adapter avec le tableau 4.2)

```
Rayon : [LIBELLÉ DU RAYON]. Ce que je cherche : [CONTENU DU RAYON]. Types autorisés (colonne « type ») : [TYPES DU RAYON].

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon, pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Applique strictement les règles du prompt 0 : zéro bavardage, aucune limite de longueur, aucune ligne résumée, découpage en parties avec mon « oui » si c'est trop long.

Une ligne par structure, au format exact :

id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date

- id : minuscules, chiffres et tirets, unique, terminé par le département (exemple : mission-locale-limoges-87).
- type : UN de la liste fermée ci-dessus, sans en inventer.
- nom : le nom officiel de l'organisme (pas d'une personne).
- description : UNE phrase simple, sur ce que la structure fait pour la personne (pas de jargon, pas de publicité).
- commune : la commune de l'accueil principal. zone : laisse vide.
- téléphone : le standard, au format 05 55 00 00 00, seulement s'il figure sur la page officielle (donne la page dans « source »).
- site : l'adresse https de la page officielle de la structure. Une adresse que tu n'as pas vue ouverte : laisse vide.
- portée : 24 (Dordogne), 87 (Haute-Vienne), region (toute la Nouvelle-Aquitaine) ou national.
- rayons : [IDENTIFIANT DU RAYON], plus d'autres rayons de la liste ci-dessous si la structure en concerne plusieurs.
- source : l'adresse de la page où tu as relevé l'information.
- date : vide.

Rayons possibles : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors.

Structures DÉJÀ CONNUES, à ne pas redonner : [COLLER ICI LES NOMS DÉJÀ CONNUS (annexe 4.3) ; rien pour la Haute-Vienne sauf les 17 listées en 4.3].
```

### 4.2 Valeurs à mettre dans le prompt, rayon par rayon

| Identifiant du rayon | Libellé | Ce que je cherche | Types autorisés (à choisir) |
|---|---|---|---|
| `accompagnement` | Se faire accompagner | Qui accompagne vers l'emploi : France Travail, Mission locale, Cap emploi, PLIE, insertion, MDS | france-travail, mission-locale, cap-emploi, plie, siae, formation-orientation, collectivite-etat, soutien-aux-familles |
| `budget` | Budget et aides | Aide alimentaire, point conseil budget, surendettement, aides sociales | budget-endettement, aide-alimentaire-materielle, caf, ccas, caisse-assurance-maladie-retraite, france-services |
| `creer` | Créer son activité | Conseil, financement, couveuses, coopératives, chambres consulaires | creation-activite, appui-aux-employeurs |
| `emploi` | Contrats et droit du travail | Inspection du travail, prud'hommes, droits du salarié | acces-au-droit, collectivite-etat |
| `employeurs` | Appui aux employeurs | URSSAF, DREETS, santé au travail, chambres, aides à l'embauche | appui-aux-employeurs, creation-activite, collectivite-etat, france-travail |
| `etranger` | Venir de l'étranger | Préfecture, OFII, asile, reconnaissance de diplômes | accueil-etrangers, acces-au-droit, collectivite-etat |
| `former` | Se former et se reconvertir | Conseil en évolution professionnelle, VAE, formations pour adultes | formation-orientation, france-travail, collectivite-etat |
| `francais` | Apprendre le français | Ateliers, cours, alphabétisation, savoirs de base | francais-langue, accueil-etrangers, service-social-secteur, collectivite-etat |
| `garde` | Garde d'enfant | Relais petite enfance, PMI, crèches, aides à la garde | petite-enfance, soutien-aux-familles, caf, ccas |
| `handicap` | Handicap | MDPH, Cap emploi, entreprises adaptées, aides | handicap, cap-emploi, caisse-assurance-maladie-retraite |
| `jeunes` | Moins de 26 ans | Missions locales, écoles de la 2e chance, information jeunesse, Garantie jeunes | mission-locale, formation-jeunes, soutien-aux-familles |
| `juridique` | Questions juridiques | Accès au droit, avocats, aide juridictionnelle, victimes | acces-au-droit, justice-insertion |
| `justice` | Sortie de détention et justice | SPIP, associations de sortants, hébergement, casier | justice-insertion, acces-au-droit, logement-hebergement |
| `logement` | Logement | Hébergement d'urgence, aides au logement, conseil juridique sur le bail | logement-hebergement, caf, ccas, acces-au-droit |
| `mobilite` | Mobilité | Garage solidaire, location solidaire, transports, aide au permis | mobilite-solidaire, collectivite-etat |
| `sante` | Santé | Assurance maladie, médecin traitant, soins | caisse-assurance-maladie-retraite, sante-soins-addictions, france-services |
| `seniors` | Retraite et seniors | Caisse de retraite, démarches retraite | caisse-assurance-maladie-retraite, france-services |

**Sujets sensibles** (violences, addictions) : les structures d'aide aux victimes ou aux personnes concernées par une addiction sont acceptées dans leur rayon (`juridique`, `sante`), mais elles ne sont **jamais** reliées à un frein sensible ni proposées quand la personne tape ces mots dans la recherche (règle de l'application).

### 4.3 Les noms déjà connus
- Dordogne : voir [ANNEXE_STRUCTURES_DEJA_CONNUES_24_2026-10-12.txt](ANNEXE_STRUCTURES_DEJA_CONNUES_24_2026-10-12.txt) (110 structures rangées par rayon). Coller la partie du rayon concerné.
- Haute-Vienne : 17 structures connues seulement : Varlin Pont-Neuf, ALEAS, UNAFAM 87, Réseau Alliage, UDAF 87, Restos du coeur 87, Banque alimentaire 87, SPSTI 23/87, L.I.R.E., APF 87, Mission locale rurale 87, CIDFF Limousin, ARSL, SOLIHA Limousin, ADIL 87, Mobilim 87, CPAM 87. **Manquent probablement** : France Travail 87, Mission locale de Limoges, CAF 87, CCAS de Limoges, Conseil départemental 87, MDPH 87, Cap emploi 87, PLIE de Limoges, SIAO 87, préfecture, etc. C'est ce que le prompt doit retrouver.

---

## 5. Prompt 4 : les employeurs d'un secteur, pour les DEUX départements

À faire dans **ChatGPT** (avec recherche web) après le prompt 0, **ou** dans Perplexity si vous le pouvez. **Un prompt par secteur, les deux départements dans la même réponse** : 21 conversations au maximum (au lieu de 42). Commencer par les 8 secteurs que le prompt 2 désigne comme les plus porteurs (je vous les donnerai, voir 0bis).

### 5.1 Le prompt

```
Secteur : [LIBELLÉ DU SECTEUR] (métiers : [EXEMPLES DE MÉTIERS]). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUS les bassins d'emploi : [LES BASSINS VALIDÉS, un par un].

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : [TYPES D'EMPLOYEURS À CHERCHER]. Critères : établissement implanté dans le bassin, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, bassin par bassin, sans plafond : je ne veux pas un échantillon. Applique strictement les règles du prompt 0 : zéro bavardage, aucune limite de longueur, aucune ligne résumée, découpage en parties avec mon « oui » si c'est trop long.

Une ligne par fiche, au format exact :

id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente sur plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours la clé [CLÉ DU SECTEUR].
- établissements : Commune:adresse ; Commune:adresse (le nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes d'un département : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur. page de recrutement : l'adresse https de sa page « recrutement », « carrières » ou « candidature spontanée », sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). Mets « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, et « non-indique » si rien n'est précisé. Ne devine pas.
- source : l'adresse de la page où tu as relevé l'information.
- date : vide.
```

### 5.2 Les 21 secteurs : valeurs à mettre dans le prompt

| Clé du secteur | Libellé | Exemples de métiers | Types d'employeurs à chercher |
|---|---|---|---|
| `commerce-vente` | Commerce et vente | caissier, vendeur, employé libre-service | supermarchés et enseignes alimentaires, magasins de bricolage et de jardinage, enseignes d'habillement et de chaussures, grandes surfaces spécialisées |
| `btp` | Bâtiment et travaux publics | maçon, électricien, plombier | entreprises de maçonnerie, d'électricité, de plomberie, de couverture, de travaux publics (avec salariés) |
| `industrie` | Industrie, production et énergie | opérateur, soudeur, cariste | usines, ateliers de production, entreprises de transformation, sites d'énergie |
| `hotellerie-restauration` | Hôtellerie, restauration et tourisme | serveur, cuisinier, employé d'étage | hôtels, campings, villages de vacances, restaurants avec salariés, restauration collective |
| `agriculture-nature` | Agriculture, nature et espaces verts | ouvrier agricole, jardinier, paysagiste | exploitations employeuses, coopératives agricoles, pépinières, entreprises du paysage |
| `transport-logistique` | Transport et logistique | chauffeur, préparateur de commandes | transporteurs routiers, entrepôts et plateformes logistiques, transport de voyageurs et scolaire |
| `sante` | Santé et soins | aide-soignant, infirmier, ambulancier | hôpitaux, cliniques, EHPAD, laboratoires, entreprises d'ambulances |
| `social-personne` | Social et services à la personne | aide à domicile, auxiliaire de vie | associations d'aide à domicile, structures d'accueil de la petite enfance, foyers, services à la personne |
| `administration` | Administration, gestion et bureau | secrétaire, agent d'accueil, comptable | mairies et intercommunalités, conseil départemental, administrations, mutuelles, cabinets comptables |
| `communication-culture` | Communication, culture et événementiel | chargé de communication, technicien son | médias locaux, théâtres, musées, salles de spectacle, agences de communication |
| `animalier` | Métiers animaliers | soigneur, toiletteur, éleveur | refuges, cliniques vétérinaires, parcs animaliers, élevages employeurs |
| `proprete` | Propreté et gestion des déchets | agent d'entretien, agent de collecte | entreprises de nettoyage, collecte et traitement des déchets |
| `sport-animation` | Sport, animation et loisirs | animateur, éducateur sportif | centres de loisirs, centres socioculturels, salles de sport, clubs employeurs |
| `numerique` | Informatique et numérique | développeur, technicien de maintenance | entreprises de services numériques, éditeurs de logiciels, opérateurs télécoms, agences web |
| `banque-assurance-immobilier` | Banque, assurance et immobilier | conseiller clientèle, agent immobilier | agences bancaires, assurances, agences immobilières |
| `artisanat` | Artisanat et création | menuisier, couturier, céramiste | ateliers de menuiserie, de métiers d'art, entreprises artisanales avec salariés |
| `artisanat-bouche` | Métiers de bouche | boulanger, boucher, pâtissier | boulangeries, boucheries, pâtisseries, charcuteries avec salariés |
| `education-formation` | Éducation et formation | formateur, assistant d'éducation | organismes de formation, CFA, établissements privés, associations éducatives |
| `automobile` | Mécanique et automobile | mécanicien, carrossier | garages, concessions, carrosseries, centres de contrôle |
| `securite` | Sécurité | agent de sécurité, télésurveillance | sociétés de gardiennage et de télésurveillance |
| `coiffure-esthetique` | Coiffure et esthétique | coiffeur, esthéticien | salons de coiffure et instituts de beauté à plusieurs salariés, enseignes |

### 5.3 Ordre de travail conseillé
1. Les 8 secteurs les plus porteurs du prompt 2, pour les deux départements à la fois (8 conversations).
2. Le premier bassin déjà commencé : Bergerac (5 enseignes de commerce connues).
3. Les 13 autres secteurs, au rythme de ce que vous savez vérifier : **le plafond n'est pas un nombre par secteur, c'est ce qu'on peut revérifier chaque année** (décision du 2026-10-01).

---

## 6. Prompt 5 : trouver les téléphones d'une liste déjà connue

Pour les 110 structures de la Dordogne (aucun numéro n'est saisi aujourd'hui) et pour les structures de la Haute-Vienne. **Par lots de 15 lignes.** Les lots (nom + site) sont prêts dans [ANNEXE_LOTS_TELEPHONES_2026-10-12.txt](ANNEXE_LOTS_TELEPHONES_2026-10-12.txt) : 8 lots, vous n'avez qu'à les coller.

```
Voici 15 structures (nom | site officiel). Pour chacune, donne le numéro de téléphone du standard ou de l'accueil, tel qu'il est publié sur la page officielle de la structure ou sur service-public.fr. Réponds en tableau : nom | téléphone (format 05 53 00 00 00) | adresse complète de la page où tu l'as lu | à vérifier (oui ou non). Si tu ne trouves pas un numéro officiel, écris « non trouvé » : n'en invente jamais et ne donne jamais un numéro de personne.

[COLLER LES 15 LIGNES]
```

---

## 7. Prompt 6 : contrôle croisé (le second assistant relit le premier)

À faire dans l'**autre** assistant que celui qui a produit la liste.

```
Voici une liste de fiches produite par un autre assistant (format : id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date). Tu es relecteur. Pour chaque ligne, vérifie sur le web : (1) la structure existe encore et à cette commune, (2) le site est bien le site officiel, (3) le téléphone figure bien sur la page citée, (4) elle n'est pas en double avec une autre ligne, (5) elle est bien dans le bon département. Réponds en tableau : id | verdict (bon, douteux, faux) | ce qui ne va pas | la correction avec sa source. Ne réécris pas les lignes bonnes. Sois sceptique : « douteux » plutôt que « bon » si tu n'as pas pu ouvrir la source.

[COLLER LA LISTE]
```

---

## 8. Ce que vous me rapportez, et ce que j'en fais

1. Pour chaque prompt : **le bloc de code** de la réponse (tel quel), plus les listes « À vérifier » et « Sources consultées ».
2. Je **contrôle chaque ligne** : le format (le vérificateur de l'application refuse une ligne mal écrite), les doublons, les types, les communes, puis j'ouvre les sites pour dater.
3. Ce qui reste incertain **n'entre pas** : il reste dans une liste « à vérifier ».
4. Les lignes validées entrent dans les fichiers du module (`lieux.txt`, `employeurs.txt`), jamais dans le code.

**Attention** : aujourd'hui l'outil de veille n'accepte qu'**une fiche à la fois**. Pour des centaines de lignes, il faut d'abord construire un **import par lot** (coller plusieurs lignes, voir ce qui est accepté ou refusé, puis valider). C'est décrit dans la proposition de chantier qui accompagne ce document.
