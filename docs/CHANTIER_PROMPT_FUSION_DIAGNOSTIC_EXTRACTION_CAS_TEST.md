# Fusion diagnostic + extraction — protocole de test manuel

> **[ABANDONNÉ le 2026-08-30, décision de Denis]** Ce chantier est clos. La fusion (diagnostic + extraction en un seul passage IA) a été déployée puis retirée le 2026-08-24 (bloc d'extraction pas produit de façon fiable), et n'est pas reprise. Raison : le gain (un aller-retour IA en moins pour le seul cas « CV en texte brut ») ne vaut pas le risque qualité (le modèle doit re-émettre tout le CV en JSON en plus de l'analyse). Ce cas est désormais géré par l'écran « On organise votre CV » (`htmlBilanAgirChoixContenu`, Lot 4) + sa vidéo (R8). Ce protocole reste comme trace, il n'est pas à exécuter.

**Statut** : ABANDONNÉ (2026-08-30). Historique ci-dessous conservé. Prototype à tester, v3 (2026-08-23) — architecture retenue après analyse comparative de 4 scénarios : **un seul passage IA, deux blocs JSON indépendants** (`## BLOC_DIAGNOSTIC` / `## BLOC_EXTRACTION_CV`), jamais un objet JSON fusionné. Cadrage retravaillé (v3, décision de Denis) : le prompt ne présente plus le diagnostic et l'extraction comme deux tâches successives, mais comme **une seule compréhension du CV, restituée sous deux formes différentes** — voir l'introduction de `prompts/bilan-v1-extraction-prototype.md`.

**Le critère de décision n'est plus « est-ce que ça fonctionne ? » mais « conservons-nous la même qualité, sur des profils de CV variés, tout en supprimant un aller-retour IA — et le parcours en paraît-il réellement plus simple ? »** (exigence de Denis, 2026-08-23, complétée le 2026-08-24) — d'où le passage d'un seul cas de test (CIP) à 5 profils volontairement différents, testés systématiquement, avec une observation d'usage en plus de la comparaison de contenu (voir critère 6 ci-dessous).

**Risques identifiés à l'avance, à surveiller spécifiquement en lisant les réponses** :
1. Contamination de posture : la Restitution 1 (sélective, jugeante) influence la Restitution 2 (exhaustive, neutre) ou l'inverse. **C'est le risque principal** — les autres sont déjà atténués par l'architecture à blocs séparés.
2. Troncature : l'un des deux blocs est-il coupé avant la fin ? Une troncature ne devrait affecter qu'un seul bloc à la fois — à vérifier en pratique, en particulier sur le profil "long" (le plus volumineux).
3. Perte de rigueur sur l'une des deux restitutions par rapport à ce que produirait le prompt seul sur le même CV — **à mesurer profil par profil**, pas seulement en moyenne : un profil peut compenser un autre dans une impression générale sans qu'aucun des deux ne soit réellement satisfaisant.
4. Discipline des marqueurs : `## BLOC_DIAGNOSTIC` / `## BLOC_EXTRACTION_CV` recopiés mot pour mot, sans paraphrase ni omission.
5. **Sensibilité au profil** : la fusion peut très bien fonctionner sur un CV long et bien structuré, et se dégrader sur un CV court ou mal structuré (moins de matière pour "ancrer" la double restitution) — ou l'inverse. C'est précisément pour détecter ce genre d'effet que les 5 profils sont nécessaires : une seule mesure moyenne masquerait ce risque.
6. **Simplicité et naturel perçus du parcours** (critère ajouté par Denis, 2026-08-24) : au-delà de l'équivalence de qualité des deux restitutions, noter si le parcours paraît *effectivement* plus simple et plus naturel à l'usage — un seul copier-coller, une seule attente, une réponse à lire d'un bloc plutôt que deux allers-retours séparés. **La fusion n'a d'intérêt que si elle améliore réellement l'expérience, pas seulement si elle produit un résultat équivalent** : une qualité identique obtenue au prix d'un parcours qui paraît plus lourd ou plus confus à lire ne justifie pas d'adopter la fusion.

## Comment procéder

Pour **chacun des 5 profils** ci-dessous, dans des conversations neuves avec l'assistant habituel (jamais dans cette conversation-ci) :

1. Copier intégralement `prompts/bilan-v1-extraction-prototype.md`, remplacer les placeholders par les valeurs du profil (données à la fin de chaque section).
2. Coller le tout en un seul message dans une conversation neuve, récupérer la réponse brute.
3. **Pour comparer** : dans 2 autres conversations neuves séparées, coller `prompts/bilan-v1.md` seul (mêmes placeholders) puis `prompts/extraction-cv.md` seul (même texte de CV).
4. En plus de comparer le contenu, noter l'impression d'usage du passage fusionné : le copier-coller unique, l'attente unique, la lecture d'une réponse en un bloc paraissent-ils réellement plus simples que les 2 allers-retours séparés — ou est-ce juste une réponse plus longue à lire sans gain ressenti ?
5. Remplir la ligne du profil dans la grille de comparaison (section 7) à partir des 3 réponses obtenues et de cette impression d'usage.

Soit **15 conversations neuves au total** (5 profils × 3 prompts) — c'est volontairement plus lourd qu'un test à un seul cas : c'est le prix d'une vraie décision d'architecture, pas d'un ajustement d'écran.

---

## 1. Profil "moyen" (cas CIP déjà connu, voir `docs/CHANTIER_CARTE_CORRESPONDANCE_DONNEES_TEST.md`)

CV de longueur et structure ordinaires, plusieurs expériences transférables, sert de référence aux 4 autres profils.

```
EXPÉRIENCE PROFESSIONNELLE

Chargé(e) d'accueil et d'insertion — en alternance (Titre Professionnel CIP)
Mission locale de secteur — 2024 - en cours
- Conduite de 5 entretiens individuels de diagnostic en stage, sous supervision
- Co-animation d'un atelier collectif de techniques de recherche d'emploi
- Construction de deux plans d'action individualisés en étude de cas, avec l'appui d'un formateur

Agent d'accueil du public
Mairie de secteur, service social — 2022 - 2024
- Accueil et orientation d'environ 40 usagers par jour
- Renseignement sur les démarches administratives
- Usage quotidien d'un logiciel métier de gestion des rendez-vous et des dossiers
- Gestion des appels et prise de rendez-vous
- Gestion de situations de tension avec des usagers en difficulté

Animateur(trice) socioculturel(le)
Centre social associatif — 2019 - 2022
- Animation hebdomadaire d'ateliers pour des groupes de 8 à 15 personnes
- Adaptation du contenu selon l'âge et le profil des participants
- Gestion du planning des salles et du matériel
- Recueil des besoins des habitants lors de permanences d'accueil
- Rédaction de bilans d'activité trimestriels
- Lien avec les éducateurs de rue et les services sociaux sur des situations individuelles

Serveur(se)
Restaurant Le Central — 2017 - 2019
- Gestion simultanée de 6 à 8 tables en horaires de forte affluence
- Gestion des réclamations clients avec solutions immédiates
- Autonomie sur la clôture de caisse en fin de service
- Formation des nouveaux serveurs saisonniers

EXPÉRIENCE BÉNÉVOLE

Bénévole
Épicerie sociale du quartier — 2023 - 2024 (en parallèle de l'emploi)
- Accompagnement individuel de bénéficiaires sur l'analyse de leur budget et leurs démarches
- Participation aux réunions mensuelles de coordination avec le réseau de partenaires (CCAS, CAF, associations locales)
- Gestion des inscriptions et du suivi de plus de 60 familles
- Formation de deux nouveaux bénévoles à un logiciel de gestion des stocks et des inscriptions

FORMATION

Titre Professionnel Conseiller en Insertion Professionnelle (CIP)
Organisme de formation — 2024 - 2025 (en cours, alternance, dernière année)

Baccalauréat général
Lycée — 2016

COMPÉTENCES
Maîtrise Word, Excel et les outils de visioconférence

CERTIFICATIONS
Certification PIX — 2024

LANGUES
Anglais — B1

CENTRES D'INTÉRÊT
Course à pied (pratique régulière depuis 5 ans, un semi-marathon couru en 2023)
Bénévolat associatif (voir expérience bénévole ci-dessus)

PERMIS
Permis B, véhiculé(e)
```

**Placeholders** : `{NIVEAU_ANALYSE}` = `3` · `{METIER_VISE_OU_NON_FOURNI}` = `Conseiller en insertion professionnelle (CIP)` · `{OFFRE_EMPLOI_OU_NON_FOURNIE}` = `Non fournie` · `{ENTREPRISE_CIBLEE_OU_NON_FOURNIE}` = `Non fournie` · `{OBSERVATIONS_DETERMINISTES}` = `Aucune (à calculer par toi à partir du texte ci-dessus)`

---

## 2. Profil "court" — peu de matière, sans diplôme au-delà du bac

Teste le cas le plus fragile pour une double restitution : très peu de contenu à la fois pour juger ET pour extraire — risque que l'un des deux passages "invente" de la matière pour compenser, ou que l'extraction paraisse dérisoire à côté d'un diagnostic qui, lui, doit rester substantiel.

```
EXPÉRIENCE PROFESSIONNELLE

Employé(e) polyvalent(e) libre-service
Supérette de quartier — Mars 2024 - Novembre 2024
- Mise en rayon et gestion des stocks
- Tenue de caisse
- Accueil et renseignement des clients

FORMATION

Baccalauréat professionnel Commerce
Lycée professionnel — 2023

CENTRES D'INTÉRÊT
Football (licencié en club depuis l'enfance)

PERMIS
Pas encore de permis
```

**Placeholders** : `{NIVEAU_ANALYSE}` = `1` · `{METIER_VISE_OU_NON_FOURNI}` = `Vendeur / employé(e) commercial(e)` · `{OFFRE_EMPLOI_OU_NON_FOURNIE}` = `Non fournie` · `{ENTREPRISE_CIBLEE_OU_NON_FOURNIE}` = `Non fournie` · `{OBSERVATIONS_DETERMINISTES}` = `Aucune (à calculer par toi à partir du texte ci-dessus)`

---

## 3. Profil "long" — profil sénior, beaucoup de matière

Teste le cas le plus exposé à la troncature : un diagnostic déjà long (niveau d'analyse élevé, plusieurs axes différenciateurs/contextuels à traiter) additionné d'une extraction volumineuse (6 expériences, plusieurs formations, compétences et langues étoffées).

```
EXPÉRIENCE PROFESSIONNELLE

Responsable d'agence
Réseau national de services aux entreprises — 2019 - en cours
- Pilotage d'une équipe de 8 personnes (conseillers, assistants administratifs)
- Responsabilité du chiffre d'affaires de l'agence (1,2M€ annuel)
- Développement du portefeuille clients (+18% de clients actifs sur 3 ans)
- Recrutement et intégration de 6 collaborateurs depuis 2019
- Reporting mensuel à la direction régionale

Adjoint(e) au responsable d'agence
Même groupe, agence voisine — 2015 - 2019
- Supervision de l'équipe en l'absence du responsable
- Gestion des réclamations clients de niveau 2
- Mise en place d'une nouvelle procédure d'accueil, généralisée ensuite au réseau

Conseiller(ère) clientèle
Même groupe — 2011 - 2015
- Portefeuille de 300 clients particuliers et professionnels
- Vente de produits et services additionnels
- Animation de deux réunions d'équipe hebdomadaires

Assistant(e) commercial(e)
PME du secteur des services — 2008 - 2011
- Support administratif à l'équipe commerciale (8 personnes)
- Suivi des commandes et de la facturation
- Organisation logistique de salons professionnels (3 par an)

Stagiaire assistant(e) de gestion
Entreprise industrielle — 2007 (6 mois)
- Saisie et suivi des factures fournisseurs
- Classement et archivage

Employé(e) polyvalent(e), job étudiant
Restauration rapide — 2005 - 2007 (week-ends, pendant les études)
- Service en salle et caisse

FORMATION

Master 2 Management des Organisations
Université — 2008

Licence Économie-Gestion
Université — 2006

Baccalauréat ES
Lycée — 2003

COMPÉTENCES
Management d'équipe, pilotage budgétaire, négociation commerciale, gestion de la relation client (CRM Salesforce), reporting Excel avancé, conduite du changement

CERTIFICATIONS
Certification interne "Manager coach" (groupe employeur) — 2020

LANGUES
Anglais — B2 (utilisé occasionnellement avec des clients internationaux)
Espagnol — notions scolaires

CENTRES D'INTÉRÊT
Trail running (plusieurs courses de 20 à 30km par an)
Bénévolat : trésorier d'une association sportive locale depuis 2018

PERMIS
Permis B, véhiculé(e)
```

**Placeholders** : `{NIVEAU_ANALYSE}` = `4` · `{METIER_VISE_OU_NON_FOURNI}` = `Responsable d'agence / manager de proximité` · `{OFFRE_EMPLOI_OU_NON_FOURNIE}` = `Non fournie` · `{ENTREPRISE_CIBLEE_OU_NON_FOURNIE}` = `Non fournie` · `{OBSERVATIONS_DETERMINISTES}` = `Aucune (à calculer par toi à partir du texte ci-dessus)`

---

## 4. Profil "peu structuré" — texte brut, sans rubriques

Teste la capacité des deux restitutions à s'accorder sur un texte qui ne suit aucune convention de CV — dates mêlées à la prose, aucune séparation visuelle. C'est le cas le plus proche de ce qu'une personne pourrait réellement coller dans le Bilan sans avoir mis son CV en forme.

```
Je m'appelle et j'ai travaillé un peu partout. J'ai commencé en 2016 comme manutentionnaire dans un entrepôt logistique près de chez moi, j'y suis resté environ 2 ans, je préparais les commandes et je chargeais les camions, c'était physique. Ensuite j'ai fait une formation de cariste (CACES 1,3,5) financée par Pôle Emploi en 2018, ça a duré 3 mois. Après j'ai retrouvé du travail assez vite comme cariste dans un autre entrepôt, plus grand celui-là, une plateforme de distribution alimentaire, j'y suis resté jusqu'en 2022, presque 4 ans, je gérais aussi un peu les inventaires vers la fin et j'ai formé deux nouveaux caristes. En 2022 j'ai eu un accident de travail (rien de grave mais ça m'a arrêté quelques mois) et depuis je fais de l'intérim régulièrement dans la logistique, toujours cariste ou manutention, avec plusieurs agences. Niveau formation j'ai un CAP obtenu en 2015 mais je ne me souviens plus exactement du domaine, c'était plutôt orienté maintenance je crois. Je parle un peu anglais mais pas au travail. J'ai le permis B et le permis poids lourd aussi obtenu en 2019. Je fais de la musculation régulièrement depuis des années.
```

**Placeholders** : `{NIVEAU_ANALYSE}` = `1` · `{METIER_VISE_OU_NON_FOURNI}` = `Cariste / agent logistique` · `{OFFRE_EMPLOI_OU_NON_FOURNIE}` = `Non fournie` · `{ENTREPRISE_CIBLEE_OU_NON_FOURNIE}` = `Non fournie` · `{OBSERVATIONS_DETERMINISTES}` = `Aucune (à calculer par toi à partir du texte ci-dessus)`

---

## 5. Profil "déjà très bon" — CV professionnel, chiffré, bien structuré

Teste l'effet inverse d'un CV faible : est-ce que le diagnostic reste honnête (peu de points faibles à trouver, sans en inventer artificiellement pour "remplir"), et est-ce que l'extraction reste fidèle sur un texte déjà dense en chiffres et verbes d'action.

```
EXPÉRIENCE PROFESSIONNELLE

Chef(fe) de projet digital
Agence de communication — 2021 - en cours
- Pilotage de 12 projets simultanés pour des clients grands comptes, budget moyen 80K€
- Réduction de 30% des délais de livraison grâce à la mise en place d'une méthode agile
- Encadrement fonctionnel d'une équipe de 4 personnes (développeurs, designers)
- Taux de satisfaction client de 94% sur les 18 derniers mois (mesuré par enquête post-projet)

Chargé(e) de projet junior
Même agence — 2019 - 2021
- Coordination de projets web pour des PME (budget 15-30K€)
- Rédaction de 25 cahiers des charges fonctionnels
- Mise en place d'un outil de suivi de projet, adopté ensuite par toute l'agence

FORMATION

Master Chef de projet digital
École spécialisée — 2019

Licence Information-Communication
Université — 2017

COMPÉTENCES
Gestion de projet agile (Scrum), conduite de réunion client, rédaction de cahiers des charges, outils : Jira, Notion, Figma (lecture)

CERTIFICATIONS
Certification Scrum Master (PSM I) — 2022

LANGUES
Anglais — C1 (working proficiency, échanges clients réguliers)

CENTRES D'INTÉRÊT
Photographie (exposition collective en 2023)
```

**Placeholders** : `{NIVEAU_ANALYSE}` = `3` · `{METIER_VISE_OU_NON_FOURNI}` = `Chef(fe) de projet digital senior` · `{OFFRE_EMPLOI_OU_NON_FOURNIE}` = `Non fournie` · `{ENTREPRISE_CIBLEE_OU_NON_FOURNIE}` = `Non fournie` · `{OBSERVATIONS_DETERMINISTES}` = `Aucune (à calculer par toi à partir du texte ci-dessus)`

---

## 6. Points de vérification, par profil

**Sur la structure de réponse** (les 5 profils) :
- Les deux marqueurs apparaissent-ils exactement tels quels ?
- Chaque bloc JSON est-il valide et complet indépendamment de l'autre ?
- *(Profil "long" en particulier)* : la réponse combinée est-elle allée au bout sans troncature ? Si troncature il y a, est-elle bien limitée à un seul bloc (l'autre restant exploitable) ?

**Sur le diagnostic (combiné vs seul), par profil** :
- Mêmes niveaux qualitatifs par axe (🟢/🟡/🔴) ?
- Reste-t-il synthétique (2-4 observations/axe), ou dérive-t-il vers l'exhaustivité de l'extraction ?
- *(Profil "court")* : le diagnostic combiné invente-t-il de la matière (affirmations non reliées au texte) pour compenser la brièveté du CV, plus que la version seule ?
- *(Profil "déjà très bon")* : le diagnostic combiné reste-t-il honnête (pas de points faibles inventés pour "remplir"), au même niveau que la version seule ?
- *(Profil "peu structuré")* : le diagnostic combiné arrive-t-il à la même "première impression" (lisibilité) que la version seule, malgré l'absence de mise en forme ?

**Sur l'extraction (combinée vs seule), par profil** :
- Toutes les expériences sont-elles extraites, avec toutes leurs missions ?
- *(Profil "long")* : aucune des 6 expériences n'est-elle résumée/coupée par rapport à la version seule ?
- *(Profil "peu structuré")* : l'extraction combinée retrouve-t-elle les mêmes 4 expériences que la version seule, malgré l'absence de rubriques et les dates noyées dans le texte ?
- Les compétences implicites (savoir-être/savoirs inférés) sont-elles présentes dans les deux cas de la même façon ?

## 7. Grille de comparaison à remplir

| Profil | Marqueurs fiables | Diagnostic ≈ équivalent | Extraction ≈ équivalente | Troncature observée | Parcours réellement plus simple ? | Verdict profil |
|---|---|---|---|---|---|---|
| Moyen (CIP) | | | | | | |
| Court | | | | | | |
| Long | | | | | | |
| Peu structuré | | | | | | |
| Déjà très bon | | | | | | |

## 8. Règle de décision (figée le 2026-08-24, ne se discute plus après les résultats)

**Le prototype V3 n'est adopté que si les deux conditions suivantes sont remplies SIMULTANÉMENT** :
1. Les deux restitutions restent au moins équivalentes aux prompts actuels, sans perte significative de qualité sur les profils testés.
2. Le parcours est réellement perçu comme plus simple et plus naturel pour l'utilisateur (critère 6 ci-dessus) — pas seulement un résultat équivalent obtenu autrement.

**Si une seule des deux conditions n'est pas remplie, la fusion n'est pas retenue en l'état.** Ce n'est pas une moyenne pondérée ni un compromis : les deux portes doivent s'ouvrir ensemble.

## 9. Verdict global

- **Si les 5 lignes sont positives sur les deux conditions** (marqueurs fiables, qualité équivalente, pas de troncature bloquante, et parcours ressenti comme réellement plus simple) → la fusion à blocs séparés est viable sur la diversité réelle de profils, on peut passer à l'intégration.
- **Si un ou deux profils précis se dégradent** (ex. "court" ou "peu structuré" seulement) sur la condition 1 → la fusion reste possible, mais avec un repli explicite pour ces profils-là (détecter le cas et proposer le parcours en 2 passages séparés uniquement pour eux) — pas un verdict tout-ou-rien.
- **Si la dégradation est générale, indépendante du profil**, ou si la condition 2 n'est pas remplie même quand la condition 1 l'est → la fusion n'est pas retenue en l'état ; on revient au scénario "garder 2 passages séparés, retravailler seulement l'écran de transition" (coût quasi nul, zéro risque de qualité) — sauf si l'analyse des causes (section 10) identifie un ajustement ciblé qui règle spécifiquement le point d'échec, à évaluer avant de conclure définitivement.

## 10. Analyse des causes, pas seulement du résultat

Pour tout test qui échoue (l'une ou l'autre condition, sur n'importe quel profil), chercher la cause avant de simplement constater l'échec — cette information conditionne la décision de la section 9 (repli ciblé possible vs abandon général) :
- **Troncature** — la réponse s'est-elle arrêtée avant la fin d'un bloc ? Dans quel bloc, à quelle taille de CV ?
- **Confusion entre les blocs** — un contenu de forme "extraction" apparu sous le marqueur "diagnostic" (ou l'inverse) ?
- **Perte de rigueur** — la restitution a-t-elle dérivé vers l'autre posture (diagnostic devenu exhaustif, extraction devenue sélective) ?
- **Limite du modèle utilisé** — l'assistant choisi pour ce test a-t-il une limite de contexte/sortie connue qui expliquerait l'échec indépendamment du prompt lui-même ?
- **Autre** — toute cause qui ne rentre dans aucune des catégories ci-dessus, à documenter telle quelle.

## 11. Protocole gelé (2026-08-24)

Prompt, 5 profils, critères d'évaluation et grille de comparaison ne sont plus modifiés avant la fin des 15 tests. Toute idée d'ajustement qui apparaîtrait pendant la campagne est notée pour l'analyse post-tests, jamais appliquée en cours de route (ça invaliderait la comparaison). Le commit dédié au chantier V3 (prompt + toute sa documentation) n'a lieu qu'après la décision finale (validation ou ajustement), jamais avant.
