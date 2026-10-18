# Mon territoire : les prompts ChatGPT, prêts à copier

> Généré le 2026-10-12 depuis les données réelles du module (127 structures, 5 employeurs). **Rien à compléter, rien à remplacer** : chaque encadré se copie tel quel dans ChatGPT. Ce fichier ne contient que les prompts pour ChatGPT, dans l'ordre où les utiliser.

## L'ordre en un coup d'oeil

| Étape | Quoi | Combien de conversations |
|---|---|---|
| **1** | Un réglage, une seule fois : les instructions personnalisées de ChatGPT | 1 |
| **2** | Les structures (logement, accompagnement, santé...), les deux départements dans la même réponse | 17 |
| **3** | Les employeurs, secteur par secteur, les deux départements dans la même réponse | 21 |
| **4** | Les numéros de téléphone des structures déjà connues, par lots de 15 | 9 |
| **5** | Les relances, seulement si ChatGPT résiste | 4 |

**Une conversation = un encadré.** Ouvrez une **nouvelle conversation** pour chaque encadré (ne les enchaînez pas dans la même), collez-le, et laissez ChatGPT répondre. S'il s'arrête en demandant « OUI », répondez « oui ». **Recopiez ensuite sa réponse entière** dans l'outil de veille : Dépôt, section 5 « Mon territoire », « Ouvrir Mon territoire », « Importer plusieurs fiches ». Dans l'outil, choisissez « des structures » pour l'étape 2, « des employeurs » pour l'étape 3 et « des numéros de téléphone » pour l'étape 4.

**Active la recherche web** de ChatGPT (bouton « Rechercher » ou globe sous la zone de saisie) pour les étapes 2, 3 et 4. Sans elle, ChatGPT répond de mémoire et se trompe.

---

## Étape 1 : le réglage à faire une seule fois

Dans ChatGPT : votre nom en bas à gauche, **Personnalisation**, **Instructions personnalisées**, champ « Comment ChatGPT doit-il répondre ? ». Collez ce texte (1114 caractères) :

```
Tu es un extracteur de données, pas un assistant. Réponds UNIQUEMENT par le bloc de code demandé, puis deux listes courtes : « À vérifier » et « Sources consultées ». Jamais d'introduction, de conclusion, de question, d'excuse, d'offre d'aide ni de commentaire. Ne discute pas, ne négocie pas, ne propose jamais une version plus courte.
Donne TOUT, sans limite de longueur : toutes les lignes que tu peux sourcer, pour la Dordogne (24) puis la Haute-Vienne (87) dans la même réponse. Interdit de résumer, d'abréger, de regrouper, d'écrire « etc. », « ... », « par exemple », « je peux continuer ». Une fiche = une ligne complète. Si tu vas donner moins que ce qui existe, continue. N'invente jamais une fiche ni une colonne : un vide vaut mieux qu'une erreur.
Si c'est trop long, découpe toi-même en parties. Commence chacune par « PARTIE 1/3 ». Termine chacune, sauf la dernière, par « PARTIE 1/3 TERMINÉE. Répondez OUI pour la suite. » et arrête-toi. Quand je réponds « oui », envoie IMMÉDIATEMENT la partie suivante, sans rien d'autre, sans répéter. Dernière partie : « FIN : toutes les parties sont envoyées. »
```

Si le champ refuse (limite de caractères), collez cette version plus courte (727 caractères) :

```
Extracteur de données, pas assistant : réponds UNIQUEMENT par le bloc de code demandé + listes « À vérifier » et « Sources ». Aucune introduction, conclusion, question, excuse, commentaire. Ne négocie jamais. Donne TOUT sans limite de longueur, Dordogne (24) puis Haute-Vienne (87) dans la même réponse. Interdit de résumer, abréger, « etc. », « ... ». Une fiche = une ligne complète. Si tu vas donner moins que ce qui existe, continue. N'invente rien : un vide vaut mieux qu'une erreur. Si trop long : parties « PARTIE 1/3 », finies par « PARTIE 1/3 TERMINÉE. Répondez OUI pour la suite. », arrête-toi ; à mon « oui », envoie IMMÉDIATEMENT la suivante, sans rien d'autre. Dernière : « FIN : toutes les parties sont envoyées. »
```

Quand vous avez fini tous les prompts, retirez ces instructions si vous utilisez ChatGPT pour autre chose.

---

## Étape 2 : les structures (17 conversations)

Un encadré par rayon. Commencez par **Logement**, puis dans l'ordre. La Haute-Vienne est la priorité : on y a très peu de structures.

### 2.1 : Logement

```
Rayon : Logement. Ce que je cherche : Hébergement d'urgence, aides au logement, conseil juridique sur le bail, garanties locatives. Types autorisés (colonne « type ») : logement-hebergement, caf, ccas, acces-au-droit.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon, pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par structure, au format exact :
id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date

- id : minuscules, chiffres et tirets, unique, terminé par le département (exemple : mission-locale-limoges-87).
- type : UN de la liste ci-dessus, sans en inventer.
- nom : nom officiel de l'organisme (jamais le nom d'une personne).
- description : UNE phrase simple sur ce que la structure fait pour la personne.
- commune : commune de l'accueil principal. zone : vide.
- téléphone : le standard, format 05 55 00 00 00, SEULEMENT s'il figure sur la page officielle ; sinon vide. Si tu donnes un numéro, la colonne « source » DOIT être l'adresse de la page où tu l'as lu ; sans cette page, laisse aussi le numéro vide.
- site : adresse https de la page officielle que tu as réellement ouverte ; sinon vide.
- portée : 24, 87, region (toute la Nouvelle-Aquitaine) ou national. Pour une structure nationale ou régionale, la commune est celle du siège ou reste vide.
- rayons : logement, plus d'autres parmi : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors si la structure en concerne plusieurs, séparés par des virgules SANS espace. UNIQUEMENT des rayons de cette liste : jamais un type (« soutien-aux-familles », « caf », « handicap » comme type ne sont pas des rayons).
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : Accueils de jour de la Dordogne ; Action Logement, agence de Nouvelle-Aquitaine ; ADIL de la Dordogne (agence départementale d'information sur le logement) ; ADIL de la Haute-Vienne ; CAF de la Dordogne ; Centre communal d'action sociale (CCAS) ; Conseil départemental de la Dordogne ; Foyers de jeunes travailleurs et résidences Habitat Jeunes du Périgord ; Le 115 ; Préfecture de la Dordogne ; SIAO de la Dordogne ; SOLIHA Dordogne-Périgord ; SOLIHA Limousin.
```

### 2.2 : Se faire accompagner

```
Rayon : Se faire accompagner. Ce que je cherche : Qui accompagne vers l'emploi : France Travail, Mission locale, Cap emploi, PLIE, structures d'insertion, services sociaux. Types autorisés (colonne « type ») : france-travail, mission-locale, cap-emploi, plie, siae, formation-orientation, collectivite-etat, soutien-aux-familles.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon, pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par structure, au format exact :
id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date

- id : minuscules, chiffres et tirets, unique, terminé par le département (exemple : mission-locale-limoges-87).
- type : UN de la liste ci-dessus, sans en inventer.
- nom : nom officiel de l'organisme (jamais le nom d'une personne).
- description : UNE phrase simple sur ce que la structure fait pour la personne.
- commune : commune de l'accueil principal. zone : vide.
- téléphone : le standard, format 05 55 00 00 00, SEULEMENT s'il figure sur la page officielle ; sinon vide. Si tu donnes un numéro, la colonne « source » DOIT être l'adresse de la page où tu l'as lu ; sans cette page, laisse aussi le numéro vide.
- site : adresse https de la page officielle que tu as réellement ouverte ; sinon vide.
- portée : 24, 87, region (toute la Nouvelle-Aquitaine) ou national. Pour une structure nationale ou régionale, la commune est celle du siège ou reste vide.
- rayons : accompagnement, plus d'autres parmi : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors si la structure en concerne plusieurs, séparés par des virgules SANS espace. UNIQUEMENT des rayons de cette liste : jamais un type (« soutien-aux-familles », « caf », « handicap » comme type ne sont pas des rayons).
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : ALEAS (Association Limousine Emplois Activités Services) ; APEC ; Association d'aide à la santé mentale Croix Marine Dordogne ; BASE (Bergerac Actions Solidarité Emploi) ; Cap emploi de la Dordogne ; Conseil départemental de la Dordogne, services d'insertion ; France Alzheimer Dordogne ; France Travail ; GEIQ 24 (groupement d'employeurs pour l'insertion et la qualification) ; INAÉ, réseau régional de l'insertion par l'activité économique en Nouvelle-Aquitaine ; La Main Forte ; Les Saveurs du Bois du Roc ; Mission locale du Bergeracois ; Mission locale du Grand Périgueux ; Mission locale et Maison de l'emploi du Périgord Noir ; Plans locaux pour l'insertion et l'emploi et maisons de l'emploi de la Dordogne ; PLIE du Bergeracois (porté par la Mission locale du Bergeracois) ; Réseau Alliage ; Structures de l'insertion par l'activité économique de la Dordogne (entreprises d'insertion, associations intermédiaires, ateliers et chantiers d'insertion, ETTI) ; UNAFAM Dordogne ; UNAFAM Haute-Vienne ; Varlin Pont-Neuf.
```

### 2.3 : Budget et aides

```
Rayon : Budget et aides. Ce que je cherche : Aide alimentaire, point conseil budget, surendettement, microcrédit, aides sociales. Types autorisés (colonne « type ») : budget-endettement, aide-alimentaire-materielle, caf, ccas, caisse-assurance-maladie-retraite, france-services.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon, pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par structure, au format exact :
id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date

- id : minuscules, chiffres et tirets, unique, terminé par le département (exemple : mission-locale-limoges-87).
- type : UN de la liste ci-dessus, sans en inventer.
- nom : nom officiel de l'organisme (jamais le nom d'une personne).
- description : UNE phrase simple sur ce que la structure fait pour la personne.
- commune : commune de l'accueil principal. zone : vide.
- téléphone : le standard, format 05 55 00 00 00, SEULEMENT s'il figure sur la page officielle ; sinon vide. Si tu donnes un numéro, la colonne « source » DOIT être l'adresse de la page où tu l'as lu ; sans cette page, laisse aussi le numéro vide.
- site : adresse https de la page officielle que tu as réellement ouverte ; sinon vide.
- portée : 24, 87, region (toute la Nouvelle-Aquitaine) ou national. Pour une structure nationale ou régionale, la commune est celle du siège ou reste vide.
- rayons : budget, plus d'autres parmi : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors si la structure en concerne plusieurs, séparés par des virgules SANS espace. UNIQUEMENT des rayons de cette liste : jamais un type (« soutien-aux-familles », « caf », « handicap » comme type ne sont pas des rayons).
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : Banque alimentaire de la Dordogne ; Banque alimentaire de la Haute-Vienne ; CAF de la Dordogne ; Centre communal d'action sociale (CCAS) de la commune ; Croix-Rouge française, Secours catholique, Restos du Cœur, Familles rurales ; Épiceries sociales et solidaires ; Fédération CRÉSUS ; La Maison 24 ; Les Restos du Cœur, association départementale de la Dordogne ; Les Restos du Cœur, association départementale de la Haute-Vienne ; MSA Dordogne, Lot-et-Garonne, Landes ; Secours populaire français, fédération de la Dordogne ; Succursales de la Banque de France ; UDAF de la Dordogne ; UDAF de la Haute-Vienne.
```

### 2.4 : Mobilité

```
Rayon : Mobilité. Ce que je cherche : Garage solidaire, location solidaire de véhicules, aide au permis, transports, plateformes de mobilité. Types autorisés (colonne « type ») : mobilite-solidaire, collectivite-etat.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon, pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par structure, au format exact :
id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date

- id : minuscules, chiffres et tirets, unique, terminé par le département (exemple : mission-locale-limoges-87).
- type : UN de la liste ci-dessus, sans en inventer.
- nom : nom officiel de l'organisme (jamais le nom d'une personne).
- description : UNE phrase simple sur ce que la structure fait pour la personne.
- commune : commune de l'accueil principal. zone : vide.
- téléphone : le standard, format 05 55 00 00 00, SEULEMENT s'il figure sur la page officielle ; sinon vide. Si tu donnes un numéro, la colonne « source » DOIT être l'adresse de la page où tu l'as lu ; sans cette page, laisse aussi le numéro vide.
- site : adresse https de la page officielle que tu as réellement ouverte ; sinon vide.
- portée : 24, 87, region (toute la Nouvelle-Aquitaine) ou national. Pour une structure nationale ou régionale, la commune est celle du siège ou reste vide.
- rayons : mobilite, plus d'autres parmi : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors si la structure en concerne plusieurs, séparés par des virgules SANS espace. UNIQUEMENT des rayons de cette liste : jamais un type (« soutien-aux-familles », « caf », « handicap » comme type ne sont pas des rayons).
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : AFAC 24 (Association Formation Avenir Conseil) ; Atchoum ; Auto-écoles associatives et sociales ; Auto-Mobilité Solidaire Dordogne ; Conseil départemental de la Dordogne ; Mission locale et Maison de l'emploi du Périgord Noir ; Mobilim 87 (association Varlin Pont-Neuf) ; Plateforme mobilité de la Dordogne ; Plateforme MUST ; Région Nouvelle-Aquitaine, service des transports.
```

### 2.5 : Moins de 26 ans

```
Rayon : Moins de 26 ans. Ce que je cherche : Missions locales, écoles de la 2e chance, information jeunesse, Garantie jeunes, contrat d'engagement jeune. Types autorisés (colonne « type ») : mission-locale, formation-jeunes, soutien-aux-familles.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon, pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par structure, au format exact :
id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date

- id : minuscules, chiffres et tirets, unique, terminé par le département (exemple : mission-locale-limoges-87).
- type : UN de la liste ci-dessus, sans en inventer.
- nom : nom officiel de l'organisme (jamais le nom d'une personne).
- description : UNE phrase simple sur ce que la structure fait pour la personne.
- commune : commune de l'accueil principal. zone : vide.
- téléphone : le standard, format 05 55 00 00 00, SEULEMENT s'il figure sur la page officielle ; sinon vide. Si tu donnes un numéro, la colonne « source » DOIT être l'adresse de la page où tu l'as lu ; sans cette page, laisse aussi le numéro vide.
- site : adresse https de la page officielle que tu as réellement ouverte ; sinon vide.
- portée : 24, 87, region (toute la Nouvelle-Aquitaine) ou national. Pour une structure nationale ou régionale, la commune est celle du siège ou reste vide.
- rayons : jeunes, plus d'autres parmi : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors si la structure en concerne plusieurs, séparés par des virgules SANS espace. UNIQUEMENT des rayons de cette liste : jamais un type (« soutien-aux-familles », « caf », « handicap » comme type ne sont pas des rayons).
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : Centres de formation d'apprentis et écoles de production de Nouvelle-Aquitaine ; École de la deuxième chance de la Dordogne (Périgueux) ; EPIDE, centres de Nouvelle-Aquitaine ; France Travail de la Dordogne ; Info Jeunes Nouvelle-Aquitaine (CRIJ) ; Mission locale rurale de la Haute-Vienne ; Plateforme de suivi et d'appui aux décrocheurs de la Dordogne.
```

### 2.6 : Garde d'enfant

```
Rayon : Garde d'enfant. Ce que je cherche : Relais petite enfance, PMI, crèches, aides à la garde, CAF. Types autorisés (colonne « type ») : petite-enfance, soutien-aux-familles, caf, ccas.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon, pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par structure, au format exact :
id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date

- id : minuscules, chiffres et tirets, unique, terminé par le département (exemple : mission-locale-limoges-87).
- type : UN de la liste ci-dessus, sans en inventer.
- nom : nom officiel de l'organisme (jamais le nom d'une personne).
- description : UNE phrase simple sur ce que la structure fait pour la personne.
- commune : commune de l'accueil principal. zone : vide.
- téléphone : le standard, format 05 55 00 00 00, SEULEMENT s'il figure sur la page officielle ; sinon vide. Si tu donnes un numéro, la colonne « source » DOIT être l'adresse de la page où tu l'as lu ; sans cette page, laisse aussi le numéro vide.
- site : adresse https de la page officielle que tu as réellement ouverte ; sinon vide.
- portée : 24, 87, region (toute la Nouvelle-Aquitaine) ou national. Pour une structure nationale ou régionale, la commune est celle du siège ou reste vide.
- rayons : garde, plus d'autres parmi : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors si la structure en concerne plusieurs, séparés par des virgules SANS espace. UNIQUEMENT des rayons de cette liste : jamais un type (« soutien-aux-familles », « caf », « handicap » comme type ne sont pas des rayons).
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : Centre communal d'action sociale (CCAS) de la commune ; France Travail ; Protection maternelle et infantile (PMI) du conseil départemental de la Dordogne ; Relais petite enfance (RPE).
```

### 2.7 : Handicap

```
Rayon : Handicap. Ce que je cherche : MDPH, Cap emploi, entreprises adaptées et ESAT, AGEFIPH, santé au travail, associations de personnes handicapées. Types autorisés (colonne « type ») : handicap, cap-emploi, caisse-assurance-maladie-retraite.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon, pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par structure, au format exact :
id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date

- id : minuscules, chiffres et tirets, unique, terminé par le département (exemple : mission-locale-limoges-87).
- type : UN de la liste ci-dessus, sans en inventer.
- nom : nom officiel de l'organisme (jamais le nom d'une personne).
- description : UNE phrase simple sur ce que la structure fait pour la personne.
- commune : commune de l'accueil principal. zone : vide.
- téléphone : le standard, format 05 55 00 00 00, SEULEMENT s'il figure sur la page officielle ; sinon vide. Si tu donnes un numéro, la colonne « source » DOIT être l'adresse de la page où tu l'as lu ; sans cette page, laisse aussi le numéro vide.
- site : adresse https de la page officielle que tu as réellement ouverte ; sinon vide.
- portée : 24, 87, region (toute la Nouvelle-Aquitaine) ou national. Pour une structure nationale ou régionale, la commune est celle du siège ou reste vide.
- rayons : handicap, plus d'autres parmi : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors si la structure en concerne plusieurs, séparés par des virgules SANS espace. UNIQUEMENT des rayons de cette liste : jamais un type (« soutien-aux-familles », « caf », « handicap » comme type ne sont pas des rayons).
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : AGEFIPH, délégation régionale Nouvelle-Aquitaine ; APF France handicap, délégation de la Dordogne ; APF France handicap, délégation de la Haute-Vienne ; Entreprises adaptées et ESAT de la Dordogne ; Maison départementale des personnes handicapées (MDPH) de la Dordogne ; Points-justice de la Dordogne ; Service de prévention et de santé au travail interentreprises de la Dordogne.
```

### 2.8 : Se former et se reconvertir

```
Rayon : Se former et se reconvertir. Ce que je cherche : Conseil en évolution professionnelle, VAE, Transitions Pro, AFPA, GRETA, CNAM, Région. Types autorisés (colonne « type ») : formation-orientation, france-travail, collectivite-etat.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon, pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par structure, au format exact :
id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date

- id : minuscules, chiffres et tirets, unique, terminé par le département (exemple : mission-locale-limoges-87).
- type : UN de la liste ci-dessus, sans en inventer.
- nom : nom officiel de l'organisme (jamais le nom d'une personne).
- description : UNE phrase simple sur ce que la structure fait pour la personne.
- commune : commune de l'accueil principal. zone : vide.
- téléphone : le standard, format 05 55 00 00 00, SEULEMENT s'il figure sur la page officielle ; sinon vide. Si tu donnes un numéro, la colonne « source » DOIT être l'adresse de la page où tu l'as lu ; sans cette page, laisse aussi le numéro vide.
- site : adresse https de la page officielle que tu as réellement ouverte ; sinon vide.
- portée : 24, 87, region (toute la Nouvelle-Aquitaine) ou national. Pour une structure nationale ou régionale, la commune est celle du siège ou reste vide.
- rayons : former, plus d'autres parmi : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors si la structure en concerne plusieurs, séparés par des virgules SANS espace. UNIQUEMENT des rayons de cette liste : jamais un type (« soutien-aux-familles », « caf », « handicap » comme type ne sont pas des rayons).
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : AFPA, réseau des GRETA, CNAM ; France Travail ; Opérateur régional du conseil en évolution professionnelle pour la Nouvelle-Aquitaine (salariés et indépendants du privé), sélectionné par France compétences ; Points relais conseil VAE de la Dordogne ; Région Nouvelle-Aquitaine ; Transitions Pro Nouvelle-Aquitaine.
```

### 2.9 : Contrats et droit du travail

```
Rayon : Contrats et droit du travail. Ce que je cherche : Inspection du travail, prud'hommes, points-justice, droits du salarié. Types autorisés (colonne « type ») : acces-au-droit, collectivite-etat.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon, pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par structure, au format exact :
id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date

- id : minuscules, chiffres et tirets, unique, terminé par le département (exemple : mission-locale-limoges-87).
- type : UN de la liste ci-dessus, sans en inventer.
- nom : nom officiel de l'organisme (jamais le nom d'une personne).
- description : UNE phrase simple sur ce que la structure fait pour la personne.
- commune : commune de l'accueil principal. zone : vide.
- téléphone : le standard, format 05 55 00 00 00, SEULEMENT s'il figure sur la page officielle ; sinon vide. Si tu donnes un numéro, la colonne « source » DOIT être l'adresse de la page où tu l'as lu ; sans cette page, laisse aussi le numéro vide.
- site : adresse https de la page officielle que tu as réellement ouverte ; sinon vide.
- portée : 24, 87, region (toute la Nouvelle-Aquitaine) ou national. Pour une structure nationale ou régionale, la commune est celle du siège ou reste vide.
- rayons : emploi, plus d'autres parmi : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors si la structure en concerne plusieurs, séparés par des virgules SANS espace. UNIQUEMENT des rayons de cette liste : jamais un type (« soutien-aux-familles », « caf », « handicap » comme type ne sont pas des rayons).
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : Conseils de prud'hommes de Périgueux et de Bergerac ; Inspection du travail (DDETS de la Dordogne).
```

### 2.10 : Questions juridiques

```
Rayon : Questions juridiques. Ce que je cherche : Accès au droit, avocats, aide juridictionnelle, Défenseur des droits, aide aux victimes, CIDFF. Types autorisés (colonne « type ») : acces-au-droit, justice-insertion.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon, pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par structure, au format exact :
id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date

- id : minuscules, chiffres et tirets, unique, terminé par le département (exemple : mission-locale-limoges-87).
- type : UN de la liste ci-dessus, sans en inventer.
- nom : nom officiel de l'organisme (jamais le nom d'une personne).
- description : UNE phrase simple sur ce que la structure fait pour la personne.
- commune : commune de l'accueil principal. zone : vide.
- téléphone : le standard, format 05 55 00 00 00, SEULEMENT s'il figure sur la page officielle ; sinon vide. Si tu donnes un numéro, la colonne « source » DOIT être l'adresse de la page où tu l'as lu ; sans cette page, laisse aussi le numéro vide.
- site : adresse https de la page officielle que tu as réellement ouverte ; sinon vide.
- portée : 24, 87, region (toute la Nouvelle-Aquitaine) ou national. Pour une structure nationale ou régionale, la commune est celle du siège ou reste vide.
- rayons : juridique, plus d'autres parmi : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors si la structure en concerne plusieurs, séparés par des virgules SANS espace. UNIQUEMENT des rayons de cette liste : jamais un type (« soutien-aux-familles », « caf », « handicap » comme type ne sont pas des rayons).
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : Association d'aide aux victimes (réseau France Victimes) de la Dordogne ; Barreau de Périgueux ; Bureau d'aide juridictionnelle, tribunal judiciaire de Périgueux et de Bergerac ; CIDFF de la Dordogne ; CIDFF Limousin ; Conseil départemental de l'accès au droit (CDAD) de la Dordogne ; Conseils de prud'hommes de Périgueux et de Bergerac ; Délégués territoriaux du Défenseur des droits en Dordogne ; Inspection du travail (DDETS de la Dordogne) ; Points-justice de la Dordogne.
```

### 2.11 : Sortie de détention et justice

```
Rayon : Sortie de détention et justice. Ce que je cherche : SPIP, associations d'accompagnement des sortants de détention, hébergement, casier judiciaire. Types autorisés (colonne « type ») : justice-insertion, acces-au-droit, logement-hebergement.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon, pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par structure, au format exact :
id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date

- id : minuscules, chiffres et tirets, unique, terminé par le département (exemple : mission-locale-limoges-87).
- type : UN de la liste ci-dessus, sans en inventer.
- nom : nom officiel de l'organisme (jamais le nom d'une personne).
- description : UNE phrase simple sur ce que la structure fait pour la personne.
- commune : commune de l'accueil principal. zone : vide.
- téléphone : le standard, format 05 55 00 00 00, SEULEMENT s'il figure sur la page officielle ; sinon vide. Si tu donnes un numéro, la colonne « source » DOIT être l'adresse de la page où tu l'as lu ; sans cette page, laisse aussi le numéro vide.
- site : adresse https de la page officielle que tu as réellement ouverte ; sinon vide.
- portée : 24, 87, region (toute la Nouvelle-Aquitaine) ou national. Pour une structure nationale ou régionale, la commune est celle du siège ou reste vide.
- rayons : justice, plus d'autres parmi : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors si la structure en concerne plusieurs, séparés par des virgules SANS espace. UNIQUEMENT des rayons de cette liste : jamais un type (« soutien-aux-familles », « caf », « handicap » comme type ne sont pas des rayons).
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : ARSL (Association régionale des solidarités) ; ATIGIP et structures d'insertion par l'activité économique implantées en milieu pénitentiaire ; France Travail, conseillers justice ; Points-justice de la Dordogne ; Service pénitentiaire d'insertion et de probation de la Dordogne.
```

### 2.12 : Créer son activité

```
Rayon : Créer son activité. Ce que je cherche : Chambres consulaires, BGE, ADIE, Initiative, France Active, coopératives d'activité, tiers-lieux. Types autorisés (colonne « type ») : creation-activite, appui-aux-employeurs.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon, pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par structure, au format exact :
id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date

- id : minuscules, chiffres et tirets, unique, terminé par le département (exemple : mission-locale-limoges-87).
- type : UN de la liste ci-dessus, sans en inventer.
- nom : nom officiel de l'organisme (jamais le nom d'une personne).
- description : UNE phrase simple sur ce que la structure fait pour la personne.
- commune : commune de l'accueil principal. zone : vide.
- téléphone : le standard, format 05 55 00 00 00, SEULEMENT s'il figure sur la page officielle ; sinon vide. Si tu donnes un numéro, la colonne « source » DOIT être l'adresse de la page où tu l'as lu ; sans cette page, laisse aussi le numéro vide.
- site : adresse https de la page officielle que tu as réellement ouverte ; sinon vide.
- portée : 24, 87, region (toute la Nouvelle-Aquitaine) ou national. Pour une structure nationale ou régionale, la commune est celle du siège ou reste vide.
- rayons : creer, plus d'autres parmi : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors si la structure en concerne plusieurs, séparés par des virgules SANS espace. UNIQUEMENT des rayons de cette liste : jamais un type (« soutien-aux-familles », « caf », « handicap » comme type ne sont pas des rayons).
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : ADIE Nouvelle-Aquitaine ; BGE Périgord ; Chambre de commerce et d'industrie de la Dordogne ; Chambre de métiers et de l'artisanat de la Dordogne (rattachée à la CMA Nouvelle-Aquitaine) ; Coop'alpha ; France Active Nouvelle-Aquitaine ; Initiative Périgord ; IRISCOP ; La Traverse.
```

### 2.13 : Appui aux employeurs

```
Rayon : Appui aux employeurs. Ce que je cherche : URSSAF, DREETS, santé au travail, chambres consulaires, aides à l'embauche. Types autorisés (colonne « type ») : appui-aux-employeurs, creation-activite, collectivite-etat, france-travail.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon, pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par structure, au format exact :
id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date

- id : minuscules, chiffres et tirets, unique, terminé par le département (exemple : mission-locale-limoges-87).
- type : UN de la liste ci-dessus, sans en inventer.
- nom : nom officiel de l'organisme (jamais le nom d'une personne).
- description : UNE phrase simple sur ce que la structure fait pour la personne.
- commune : commune de l'accueil principal. zone : vide.
- téléphone : le standard, format 05 55 00 00 00, SEULEMENT s'il figure sur la page officielle ; sinon vide. Si tu donnes un numéro, la colonne « source » DOIT être l'adresse de la page où tu l'as lu ; sans cette page, laisse aussi le numéro vide.
- site : adresse https de la page officielle que tu as réellement ouverte ; sinon vide.
- portée : 24, 87, region (toute la Nouvelle-Aquitaine) ou national. Pour une structure nationale ou régionale, la commune est celle du siège ou reste vide.
- rayons : employeurs, plus d'autres parmi : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors si la structure en concerne plusieurs, séparés par des virgules SANS espace. UNIQUEMENT des rayons de cette liste : jamais un type (« soutien-aux-familles », « caf », « handicap » comme type ne sont pas des rayons).
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : Chambre de commerce et d'industrie de la Dordogne ; Chambre de métiers et de l'artisanat de la Dordogne (rattachée à la CMA Nouvelle-Aquitaine) ; DREETS Nouvelle-Aquitaine (inspection du travail) ; France Travail, espace employeur ; Service de prévention et de santé au travail interentreprises de la Dordogne ; SPSTI 23/87 (service de prévention et de santé au travail Creuse-Haute-Vienne) ; URSSAF Nouvelle-Aquitaine.
```

### 2.14 : Apprendre le français

```
Rayon : Apprendre le français. Ce que je cherche : Ateliers sociolinguistiques, cours, alphabétisation, savoirs de base, illettrisme. Types autorisés (colonne « type ») : francais-langue, accueil-etrangers, service-social-secteur, collectivite-etat.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon, pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par structure, au format exact :
id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date

- id : minuscules, chiffres et tirets, unique, terminé par le département (exemple : mission-locale-limoges-87).
- type : UN de la liste ci-dessus, sans en inventer.
- nom : nom officiel de l'organisme (jamais le nom d'une personne).
- description : UNE phrase simple sur ce que la structure fait pour la personne.
- commune : commune de l'accueil principal. zone : vide.
- téléphone : le standard, format 05 55 00 00 00, SEULEMENT s'il figure sur la page officielle ; sinon vide. Si tu donnes un numéro, la colonne « source » DOIT être l'adresse de la page où tu l'as lu ; sans cette page, laisse aussi le numéro vide.
- site : adresse https de la page officielle que tu as réellement ouverte ; sinon vide.
- portée : 24, 87, region (toute la Nouvelle-Aquitaine) ou national. Pour une structure nationale ou régionale, la commune est celle du siège ou reste vide.
- rayons : francais, plus d'autres parmi : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors si la structure en concerne plusieurs, séparés par des virgules SANS espace. UNIQUEMENT des rayons de cette liste : jamais un type (« soutien-aux-familles », « caf », « handicap » comme type ne sont pas des rayons).
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : Association L.I.R.E. ; Centres sociaux et centres socioculturels de la Dordogne ; Conseil départemental de la Dordogne, service social départemental ; Écoles, collèges et lycées proposant le dispositif OEPRE, via l'inspection académique de la Dordogne ; France Travail ; La Cimade, permanence de Périgueux ; Ligue de l'enseignement de la Dordogne ; Office français de l'immigration et de l'intégration (OFII), direction territoriale ; Région Nouvelle-Aquitaine, programme régional de formation.
```

### 2.15 : Venir de l'étranger

```
Rayon : Venir de l'étranger. Ce que je cherche : Préfecture (service des étrangers), OFII, asile (SPADA, CADA), reconnaissance de diplômes, aide juridique aux étrangers. Types autorisés (colonne « type ») : accueil-etrangers, acces-au-droit, collectivite-etat.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon, pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par structure, au format exact :
id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date

- id : minuscules, chiffres et tirets, unique, terminé par le département (exemple : mission-locale-limoges-87).
- type : UN de la liste ci-dessus, sans en inventer.
- nom : nom officiel de l'organisme (jamais le nom d'une personne).
- description : UNE phrase simple sur ce que la structure fait pour la personne.
- commune : commune de l'accueil principal. zone : vide.
- téléphone : le standard, format 05 55 00 00 00, SEULEMENT s'il figure sur la page officielle ; sinon vide. Si tu donnes un numéro, la colonne « source » DOIT être l'adresse de la page où tu l'as lu ; sans cette page, laisse aussi le numéro vide.
- site : adresse https de la page officielle que tu as réellement ouverte ; sinon vide.
- portée : 24, 87, region (toute la Nouvelle-Aquitaine) ou national. Pour une structure nationale ou régionale, la commune est celle du siège ou reste vide.
- rayons : etranger, plus d'autres parmi : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors si la structure en concerne plusieurs, séparés par des virgules SANS espace. UNIQUEMENT des rayons de cette liste : jamais un type (« soutien-aux-familles », « caf », « handicap » comme type ne sont pas des rayons).
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : Centre ENIC-NARIC France (France Éducation international) ; France Terre d'Asile, CADA de Périgueux ; La Cimade, région Nouvelle-Aquitaine ; Office français de l'immigration et de l'intégration (OFII), direction territoriale ; Préfecture de la Dordogne, service des étrangers ; Structure de premier accueil des demandeurs d'asile (SPADA) de la Dordogne.
```

### 2.16 : Santé

```
Rayon : Santé. Ce que je cherche : Assurance maladie, médecin traitant, soins, santé mentale. Types autorisés (colonne « type ») : caisse-assurance-maladie-retraite, sante-soins-addictions, france-services.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon, pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par structure, au format exact :
id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date

- id : minuscules, chiffres et tirets, unique, terminé par le département (exemple : mission-locale-limoges-87).
- type : UN de la liste ci-dessus, sans en inventer.
- nom : nom officiel de l'organisme (jamais le nom d'une personne).
- description : UNE phrase simple sur ce que la structure fait pour la personne.
- commune : commune de l'accueil principal. zone : vide.
- téléphone : le standard, format 05 55 00 00 00, SEULEMENT s'il figure sur la page officielle ; sinon vide. Si tu donnes un numéro, la colonne « source » DOIT être l'adresse de la page où tu l'as lu ; sans cette page, laisse aussi le numéro vide.
- site : adresse https de la page officielle que tu as réellement ouverte ; sinon vide.
- portée : 24, 87, region (toute la Nouvelle-Aquitaine) ou national. Pour une structure nationale ou régionale, la commune est celle du siège ou reste vide.
- rayons : sante, plus d'autres parmi : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors si la structure en concerne plusieurs, séparés par des virgules SANS espace. UNIQUEMENT des rayons de cette liste : jamais un type (« soutien-aux-familles », « caf », « handicap » comme type ne sont pas des rayons).
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : CPAM de la Dordogne (siège de Périgueux) ; CPAM de la Haute-Vienne (siège de Limoges) ; Maisons France Services.
```

### 2.17 : Retraite et seniors

```
Rayon : Retraite et seniors. Ce que je cherche : Caisse de retraite, démarches retraite, aide aux seniors. Types autorisés (colonne « type ») : caisse-assurance-maladie-retraite, france-services.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon, pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par structure, au format exact :
id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date

- id : minuscules, chiffres et tirets, unique, terminé par le département (exemple : mission-locale-limoges-87).
- type : UN de la liste ci-dessus, sans en inventer.
- nom : nom officiel de l'organisme (jamais le nom d'une personne).
- description : UNE phrase simple sur ce que la structure fait pour la personne.
- commune : commune de l'accueil principal. zone : vide.
- téléphone : le standard, format 05 55 00 00 00, SEULEMENT s'il figure sur la page officielle ; sinon vide. Si tu donnes un numéro, la colonne « source » DOIT être l'adresse de la page où tu l'as lu ; sans cette page, laisse aussi le numéro vide.
- site : adresse https de la page officielle que tu as réellement ouverte ; sinon vide.
- portée : 24, 87, region (toute la Nouvelle-Aquitaine) ou national. Pour une structure nationale ou régionale, la commune est celle du siège ou reste vide.
- rayons : seniors, plus d'autres parmi : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors si la structure en concerne plusieurs, séparés par des virgules SANS espace. UNIQUEMENT des rayons de cette liste : jamais un type (« soutien-aux-familles », « caf », « handicap » comme type ne sont pas des rayons).
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : Assurance retraite / CARSAT Nouvelle-Aquitaine ; Maisons France Services.
```

### 2.18 : Complément Haute-Vienne (les structures de base)

À faire **après** les 17 conversations ci-dessus. ChatGPT ne redonne pas ce qu'on lui présente comme « déjà connu » ; or les structures de base de la Dordogne (France Travail, CAF, CCAS, PMI, MDPH...) ont chacune leur équivalent en Haute-Vienne, qu'il peut avoir sauté. Ce prompt les demande une par une.

```
Pour la HAUTE-VIENNE (87) UNIQUEMENT, donne l'équivalent local de chacune des structures ci-dessous, qui existent déjà en Dordogne : pour chacune, la structure de la Haute-Vienne qui joue le même rôle (par exemple pour « CAF de la Dordogne » : la CAF de la Haute-Vienne ; pour un CCAS : le CCAS de Limoges et ceux des autres grandes communes). Une seule section « DÉPARTEMENT 87 ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par structure, au format exact :
id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date

- id : minuscules, chiffres et tirets, unique, terminé par -87 (exemple : caf-haute-vienne-87).
- type : UN parmi : france-travail, mission-locale, cap-emploi, plie, siae, caf, caisse-assurance-maladie-retraite, ccas, service-social-secteur, france-services, inclusion-numerique, creation-activite, formation-orientation, formation-jeunes, logement-hebergement, mobilite-solidaire, aide-alimentaire-materielle, budget-endettement, acces-au-droit, justice-insertion, handicap, sante-soins-addictions, soutien-aux-familles, petite-enfance, accueil-etrangers, francais-langue, appui-aux-employeurs, collectivite-etat.
- nom : nom officiel de l'organisme (jamais le nom d'une personne). description : UNE phrase simple sur ce que la structure fait pour la personne.
- commune : commune de l'accueil principal. zone : vide.
- téléphone : le standard, format 05 55 00 00 00, SEULEMENT s'il figure sur la page officielle ; si tu donnes un numéro, la colonne « source » DOIT être l'adresse de la page où tu l'as lu ; sinon laisse le numéro vide.
- site : adresse https de la page officielle que tu as réellement ouverte ; sinon vide.
- portée : 87.
- rayons : séparés par des virgules SANS espace, UNIQUEMENT parmi : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors (jamais un type).
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps) ; sinon laisse vide.
- date : vide.

Structures de la Dordogne dont je veux l'équivalent en Haute-Vienne : Accueils de jour de la Dordogne ; ADIL de la Dordogne (agence départementale d'information sur le logement) ; AFPA, réseau des GRETA, CNAM ; APF France handicap, délégation de la Dordogne ; Association d'aide aux victimes (réseau France Victimes) de la Dordogne ; Barreau de Périgueux ; BASE (Bergerac Actions Solidarité Emploi) ; BGE Périgord ; Bureau d'aide juridictionnelle, tribunal judiciaire de Périgueux et de Bergerac ; CAF de la Dordogne ; CAF de la Dordogne ; Cap emploi de la Dordogne ; Chambre de commerce et d'industrie de la Dordogne ; Chambre de métiers et de l'artisanat de la Dordogne (rattachée à la CMA Nouvelle-Aquitaine) ; CIDFF de la Dordogne ; Conseil départemental de l'accès au droit (CDAD) de la Dordogne ; Conseil départemental de la Dordogne ; Conseil départemental de la Dordogne ; Conseil départemental de la Dordogne, service social départemental ; Conseil départemental de la Dordogne, services d'insertion ; Conseils de prud'hommes de Périgueux et de Bergerac ; Coop'alpha ; CPAM de la Dordogne (siège de Périgueux) ; Délégués territoriaux du Défenseur des droits en Dordogne ; Entreprises adaptées et ESAT de la Dordogne ; Foyers de jeunes travailleurs et résidences Habitat Jeunes du Périgord ; France Travail de la Dordogne ; France Travail, conseillers justice ; GEIQ 24 (groupement d'employeurs pour l'insertion et la qualification) ; Initiative Périgord ; Inspection du travail (DDETS de la Dordogne) ; IRISCOP ; La Main Forte ; La Traverse ; Les Saveurs du Bois du Roc ; Maison départementale des personnes handicapées (MDPH) de la Dordogne ; Mission locale du Bergeracois ; Mission locale du Grand Périgueux ; Mission locale et Maison de l'emploi du Périgord Noir ; MSA Dordogne, Lot-et-Garonne, Landes ; Plans locaux pour l'insertion et l'emploi et maisons de l'emploi de la Dordogne ; PLIE du Bergeracois (porté par la Mission locale du Bergeracois) ; Points relais conseil VAE de la Dordogne ; Points-justice de la Dordogne ; Préfecture de la Dordogne ; Protection maternelle et infantile (PMI) du conseil départemental de la Dordogne ; Service de prévention et de santé au travail interentreprises de la Dordogne ; SIAO de la Dordogne ; SOLIHA Dordogne-Périgord ; Structures de l'insertion par l'activité économique de la Dordogne (entreprises d'insertion, associations intermédiaires, ateliers et chantiers d'insertion, ETTI) ; UDAF de la Dordogne.

Structures de la Haute-Vienne DÉJÀ CONNUES, à ne pas redonner : ADIL de la Haute-Vienne ; ALEAS (Association Limousine Emplois Activités Services) ; APF France handicap, délégation de la Haute-Vienne ; ARSL (Association régionale des solidarités) ; Association L.I.R.E. ; Banque alimentaire de la Haute-Vienne ; CIDFF Limousin ; CPAM de la Haute-Vienne (siège de Limoges) ; Les Restos du Cœur, association départementale de la Haute-Vienne ; Mission locale rurale de la Haute-Vienne ; Mobilim 87 (association Varlin Pont-Neuf) ; Réseau Alliage ; SOLIHA Limousin ; SPSTI 23/87 (service de prévention et de santé au travail Creuse-Haute-Vienne) ; UDAF de la Haute-Vienne ; UNAFAM Haute-Vienne ; Varlin Pont-Neuf.
```

---

## Étape 3 : les employeurs (21 conversations)

Un encadré par secteur. L'ordre ci-dessous est **provisoire** (les secteurs qui emploient le plus de monde en premier) ; je le corrigerai avec les données officielles de France Travail dès que je les aurai consultées. Commencez par les 8 premiers.

### 3.1 : Commerce et vente (priorité)

```
Secteur : Commerce et vente (métiers : caissier, vendeur, employé libre-service). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUTES les zones d'emploi de l'INSEE qui le recouvrent (identifie-les toi-même, sans me les demander).

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : supermarchés et enseignes alimentaires, magasins de bricolage et de jardinage, enseignes d'habillement et de chaussures, grandes surfaces spécialisées. Critères : établissement implanté dans le département, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, zone par zone, sans plafond : je ne veux pas un échantillon. Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par fiche, au format exact :
id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente dans plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours commerce-vente.
- établissements : Commune:adresse ; Commune:adresse (nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur ; sinon vide. page de recrutement : adresse https de sa page « recrutement », « carrières » ou « candidature spontanée » ; sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, « non-indique » si rien n'est précisé. Ne devine pas.
- source : adresse de la page où tu as relevé l'information.
- date : vide.

Employeurs DÉJÀ CONNUS, à ne pas redonner : Aldi ; Carrefour Market ; Intermarché ; Lidl ; Netto.
```

### 3.2 : Hôtellerie, restauration et tourisme (priorité)

```
Secteur : Hôtellerie, restauration et tourisme (métiers : serveur, cuisinier, employé d’étage). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUTES les zones d'emploi de l'INSEE qui le recouvrent (identifie-les toi-même, sans me les demander).

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : hôtels, campings, villages de vacances, restaurants avec salariés, restauration collective. Critères : établissement implanté dans le département, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, zone par zone, sans plafond : je ne veux pas un échantillon. Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par fiche, au format exact :
id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente dans plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours hotellerie-restauration.
- établissements : Commune:adresse ; Commune:adresse (nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur ; sinon vide. page de recrutement : adresse https de sa page « recrutement », « carrières » ou « candidature spontanée » ; sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, « non-indique » si rien n'est précisé. Ne devine pas.
- source : adresse de la page où tu as relevé l'information.
- date : vide.

Aucun employeur déjà connu pour ce secteur.
```

### 3.3 : Santé et soins (priorité)

```
Secteur : Santé et soins (métiers : aide-soignant, infirmier, ambulancier). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUTES les zones d'emploi de l'INSEE qui le recouvrent (identifie-les toi-même, sans me les demander).

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : hôpitaux, cliniques, EHPAD, laboratoires, entreprises d'ambulances. Critères : établissement implanté dans le département, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, zone par zone, sans plafond : je ne veux pas un échantillon. Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par fiche, au format exact :
id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente dans plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours sante.
- établissements : Commune:adresse ; Commune:adresse (nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur ; sinon vide. page de recrutement : adresse https de sa page « recrutement », « carrières » ou « candidature spontanée » ; sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, « non-indique » si rien n'est précisé. Ne devine pas.
- source : adresse de la page où tu as relevé l'information.
- date : vide.

Aucun employeur déjà connu pour ce secteur.
```

### 3.4 : Social et services à la personne (priorité)

```
Secteur : Social et services à la personne (métiers : aide à domicile, auxiliaire de vie). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUTES les zones d'emploi de l'INSEE qui le recouvrent (identifie-les toi-même, sans me les demander).

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : associations d'aide à domicile, structures d'accueil de la petite enfance, foyers, services à la personne. Critères : établissement implanté dans le département, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, zone par zone, sans plafond : je ne veux pas un échantillon. Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par fiche, au format exact :
id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente dans plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours social-personne.
- établissements : Commune:adresse ; Commune:adresse (nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur ; sinon vide. page de recrutement : adresse https de sa page « recrutement », « carrières » ou « candidature spontanée » ; sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, « non-indique » si rien n'est précisé. Ne devine pas.
- source : adresse de la page où tu as relevé l'information.
- date : vide.

Aucun employeur déjà connu pour ce secteur.
```

### 3.5 : Bâtiment et travaux publics (priorité)

```
Secteur : Bâtiment et travaux publics (métiers : maçon, électricien, plombier). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUTES les zones d'emploi de l'INSEE qui le recouvrent (identifie-les toi-même, sans me les demander).

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : entreprises de maçonnerie, d'électricité, de plomberie, de couverture, de travaux publics (avec salariés). Critères : établissement implanté dans le département, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, zone par zone, sans plafond : je ne veux pas un échantillon. Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par fiche, au format exact :
id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente dans plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours btp.
- établissements : Commune:adresse ; Commune:adresse (nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur ; sinon vide. page de recrutement : adresse https de sa page « recrutement », « carrières » ou « candidature spontanée » ; sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, « non-indique » si rien n'est précisé. Ne devine pas.
- source : adresse de la page où tu as relevé l'information.
- date : vide.

Aucun employeur déjà connu pour ce secteur.
```

### 3.6 : Transport et logistique (priorité)

```
Secteur : Transport et logistique (métiers : chauffeur, préparateur de commandes). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUTES les zones d'emploi de l'INSEE qui le recouvrent (identifie-les toi-même, sans me les demander).

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : transporteurs routiers, entrepôts et plateformes logistiques, transport de voyageurs et scolaire. Critères : établissement implanté dans le département, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, zone par zone, sans plafond : je ne veux pas un échantillon. Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par fiche, au format exact :
id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente dans plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours transport-logistique.
- établissements : Commune:adresse ; Commune:adresse (nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur ; sinon vide. page de recrutement : adresse https de sa page « recrutement », « carrières » ou « candidature spontanée » ; sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, « non-indique » si rien n'est précisé. Ne devine pas.
- source : adresse de la page où tu as relevé l'information.
- date : vide.

Aucun employeur déjà connu pour ce secteur.
```

### 3.7 : Industrie, production et énergie (priorité)

```
Secteur : Industrie, production et énergie (métiers : opérateur, soudeur, cariste). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUTES les zones d'emploi de l'INSEE qui le recouvrent (identifie-les toi-même, sans me les demander).

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : usines, ateliers de production, entreprises de transformation, sites d'énergie. Critères : établissement implanté dans le département, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, zone par zone, sans plafond : je ne veux pas un échantillon. Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par fiche, au format exact :
id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente dans plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours industrie.
- établissements : Commune:adresse ; Commune:adresse (nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur ; sinon vide. page de recrutement : adresse https de sa page « recrutement », « carrières » ou « candidature spontanée » ; sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, « non-indique » si rien n'est précisé. Ne devine pas.
- source : adresse de la page où tu as relevé l'information.
- date : vide.

Aucun employeur déjà connu pour ce secteur.
```

### 3.8 : Administration, gestion et bureau (priorité)

```
Secteur : Administration, gestion et bureau (métiers : secrétaire, agent d’accueil, comptable). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUTES les zones d'emploi de l'INSEE qui le recouvrent (identifie-les toi-même, sans me les demander).

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : mairies et intercommunalités, conseil départemental, administrations, mutuelles, cabinets comptables. Critères : établissement implanté dans le département, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, zone par zone, sans plafond : je ne veux pas un échantillon. Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par fiche, au format exact :
id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente dans plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours administration.
- établissements : Commune:adresse ; Commune:adresse (nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur ; sinon vide. page de recrutement : adresse https de sa page « recrutement », « carrières » ou « candidature spontanée » ; sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, « non-indique » si rien n'est précisé. Ne devine pas.
- source : adresse de la page où tu as relevé l'information.
- date : vide.

Aucun employeur déjà connu pour ce secteur.
```

### 3.9 : Agriculture, nature et espaces verts

```
Secteur : Agriculture, nature et espaces verts (métiers : ouvrier agricole, jardinier, paysagiste). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUTES les zones d'emploi de l'INSEE qui le recouvrent (identifie-les toi-même, sans me les demander).

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : exploitations employeuses, coopératives agricoles, pépinières, entreprises du paysage. Critères : établissement implanté dans le département, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, zone par zone, sans plafond : je ne veux pas un échantillon. Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par fiche, au format exact :
id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente dans plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours agriculture-nature.
- établissements : Commune:adresse ; Commune:adresse (nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur ; sinon vide. page de recrutement : adresse https de sa page « recrutement », « carrières » ou « candidature spontanée » ; sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, « non-indique » si rien n'est précisé. Ne devine pas.
- source : adresse de la page où tu as relevé l'information.
- date : vide.

Aucun employeur déjà connu pour ce secteur.
```

### 3.10 : Propreté et gestion des déchets

```
Secteur : Propreté et gestion des déchets (métiers : agent d’entretien, agent de collecte). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUTES les zones d'emploi de l'INSEE qui le recouvrent (identifie-les toi-même, sans me les demander).

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : entreprises de nettoyage, collecte et traitement des déchets. Critères : établissement implanté dans le département, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, zone par zone, sans plafond : je ne veux pas un échantillon. Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par fiche, au format exact :
id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente dans plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours proprete.
- établissements : Commune:adresse ; Commune:adresse (nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur ; sinon vide. page de recrutement : adresse https de sa page « recrutement », « carrières » ou « candidature spontanée » ; sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, « non-indique » si rien n'est précisé. Ne devine pas.
- source : adresse de la page où tu as relevé l'information.
- date : vide.

Aucun employeur déjà connu pour ce secteur.
```

### 3.11 : Mécanique et automobile

```
Secteur : Mécanique et automobile (métiers : mécanicien, carrossier). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUTES les zones d'emploi de l'INSEE qui le recouvrent (identifie-les toi-même, sans me les demander).

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : garages, concessions, carrosseries, centres de contrôle. Critères : établissement implanté dans le département, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, zone par zone, sans plafond : je ne veux pas un échantillon. Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par fiche, au format exact :
id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente dans plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours automobile.
- établissements : Commune:adresse ; Commune:adresse (nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur ; sinon vide. page de recrutement : adresse https de sa page « recrutement », « carrières » ou « candidature spontanée » ; sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, « non-indique » si rien n'est précisé. Ne devine pas.
- source : adresse de la page où tu as relevé l'information.
- date : vide.

Aucun employeur déjà connu pour ce secteur.
```

### 3.12 : Sécurité

```
Secteur : Sécurité (métiers : agent de sécurité, télésurveillance). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUTES les zones d'emploi de l'INSEE qui le recouvrent (identifie-les toi-même, sans me les demander).

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : sociétés de gardiennage et de télésurveillance. Critères : établissement implanté dans le département, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, zone par zone, sans plafond : je ne veux pas un échantillon. Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par fiche, au format exact :
id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente dans plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours securite.
- établissements : Commune:adresse ; Commune:adresse (nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur ; sinon vide. page de recrutement : adresse https de sa page « recrutement », « carrières » ou « candidature spontanée » ; sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, « non-indique » si rien n'est précisé. Ne devine pas.
- source : adresse de la page où tu as relevé l'information.
- date : vide.

Aucun employeur déjà connu pour ce secteur.
```

### 3.13 : Banque, assurance et immobilier

```
Secteur : Banque, assurance et immobilier (métiers : conseiller clientèle, agent immobilier). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUTES les zones d'emploi de l'INSEE qui le recouvrent (identifie-les toi-même, sans me les demander).

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : agences bancaires, assurances, agences immobilières. Critères : établissement implanté dans le département, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, zone par zone, sans plafond : je ne veux pas un échantillon. Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par fiche, au format exact :
id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente dans plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours banque-assurance-immobilier.
- établissements : Commune:adresse ; Commune:adresse (nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur ; sinon vide. page de recrutement : adresse https de sa page « recrutement », « carrières » ou « candidature spontanée » ; sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, « non-indique » si rien n'est précisé. Ne devine pas.
- source : adresse de la page où tu as relevé l'information.
- date : vide.

Aucun employeur déjà connu pour ce secteur.
```

### 3.14 : Éducation et formation

```
Secteur : Éducation et formation (métiers : formateur, assistant d’éducation). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUTES les zones d'emploi de l'INSEE qui le recouvrent (identifie-les toi-même, sans me les demander).

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : organismes de formation, CFA, établissements privés, associations éducatives. Critères : établissement implanté dans le département, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, zone par zone, sans plafond : je ne veux pas un échantillon. Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par fiche, au format exact :
id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente dans plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours education-formation.
- établissements : Commune:adresse ; Commune:adresse (nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur ; sinon vide. page de recrutement : adresse https de sa page « recrutement », « carrières » ou « candidature spontanée » ; sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, « non-indique » si rien n'est précisé. Ne devine pas.
- source : adresse de la page où tu as relevé l'information.
- date : vide.

Aucun employeur déjà connu pour ce secteur.
```

### 3.15 : Sport, animation et loisirs

```
Secteur : Sport, animation et loisirs (métiers : animateur, éducateur sportif). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUTES les zones d'emploi de l'INSEE qui le recouvrent (identifie-les toi-même, sans me les demander).

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : centres de loisirs, centres socioculturels, salles de sport, clubs employeurs. Critères : établissement implanté dans le département, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, zone par zone, sans plafond : je ne veux pas un échantillon. Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par fiche, au format exact :
id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente dans plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours sport-animation.
- établissements : Commune:adresse ; Commune:adresse (nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur ; sinon vide. page de recrutement : adresse https de sa page « recrutement », « carrières » ou « candidature spontanée » ; sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, « non-indique » si rien n'est précisé. Ne devine pas.
- source : adresse de la page où tu as relevé l'information.
- date : vide.

Aucun employeur déjà connu pour ce secteur.
```

### 3.16 : Informatique et numérique

```
Secteur : Informatique et numérique (métiers : développeur, technicien de maintenance). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUTES les zones d'emploi de l'INSEE qui le recouvrent (identifie-les toi-même, sans me les demander).

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : entreprises de services numériques, éditeurs de logiciels, opérateurs télécoms, agences web. Critères : établissement implanté dans le département, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, zone par zone, sans plafond : je ne veux pas un échantillon. Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par fiche, au format exact :
id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente dans plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours numerique.
- établissements : Commune:adresse ; Commune:adresse (nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur ; sinon vide. page de recrutement : adresse https de sa page « recrutement », « carrières » ou « candidature spontanée » ; sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, « non-indique » si rien n'est précisé. Ne devine pas.
- source : adresse de la page où tu as relevé l'information.
- date : vide.

Aucun employeur déjà connu pour ce secteur.
```

### 3.17 : Métiers de bouche (artisanat)

```
Secteur : Métiers de bouche (artisanat) (métiers : boulanger, boucher, pâtissier). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUTES les zones d'emploi de l'INSEE qui le recouvrent (identifie-les toi-même, sans me les demander).

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : boulangeries, boucheries, pâtisseries, charcuteries avec salariés. Critères : établissement implanté dans le département, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, zone par zone, sans plafond : je ne veux pas un échantillon. Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par fiche, au format exact :
id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente dans plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours artisanat-bouche.
- établissements : Commune:adresse ; Commune:adresse (nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur ; sinon vide. page de recrutement : adresse https de sa page « recrutement », « carrières » ou « candidature spontanée » ; sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, « non-indique » si rien n'est précisé. Ne devine pas.
- source : adresse de la page où tu as relevé l'information.
- date : vide.

Aucun employeur déjà connu pour ce secteur.
```

### 3.18 : Artisanat et création

```
Secteur : Artisanat et création (métiers : menuisier, couturier, céramiste). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUTES les zones d'emploi de l'INSEE qui le recouvrent (identifie-les toi-même, sans me les demander).

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : ateliers de menuiserie, de métiers d'art, entreprises artisanales avec salariés. Critères : établissement implanté dans le département, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, zone par zone, sans plafond : je ne veux pas un échantillon. Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par fiche, au format exact :
id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente dans plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours artisanat.
- établissements : Commune:adresse ; Commune:adresse (nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur ; sinon vide. page de recrutement : adresse https de sa page « recrutement », « carrières » ou « candidature spontanée » ; sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, « non-indique » si rien n'est précisé. Ne devine pas.
- source : adresse de la page où tu as relevé l'information.
- date : vide.

Aucun employeur déjà connu pour ce secteur.
```

### 3.19 : Coiffure et esthétique

```
Secteur : Coiffure et esthétique (métiers : coiffeur, esthéticien). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUTES les zones d'emploi de l'INSEE qui le recouvrent (identifie-les toi-même, sans me les demander).

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : salons de coiffure et instituts de beauté à plusieurs salariés, enseignes. Critères : établissement implanté dans le département, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, zone par zone, sans plafond : je ne veux pas un échantillon. Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par fiche, au format exact :
id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente dans plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours coiffure-esthetique.
- établissements : Commune:adresse ; Commune:adresse (nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur ; sinon vide. page de recrutement : adresse https de sa page « recrutement », « carrières » ou « candidature spontanée » ; sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, « non-indique » si rien n'est précisé. Ne devine pas.
- source : adresse de la page où tu as relevé l'information.
- date : vide.

Aucun employeur déjà connu pour ce secteur.
```

### 3.20 : Communication, culture et événementiel

```
Secteur : Communication, culture et événementiel (métiers : chargé de communication, technicien son). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUTES les zones d'emploi de l'INSEE qui le recouvrent (identifie-les toi-même, sans me les demander).

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : médias locaux, théâtres, musées, salles de spectacle, agences de communication. Critères : établissement implanté dans le département, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, zone par zone, sans plafond : je ne veux pas un échantillon. Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par fiche, au format exact :
id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente dans plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours communication-culture.
- établissements : Commune:adresse ; Commune:adresse (nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur ; sinon vide. page de recrutement : adresse https de sa page « recrutement », « carrières » ou « candidature spontanée » ; sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, « non-indique » si rien n'est précisé. Ne devine pas.
- source : adresse de la page où tu as relevé l'information.
- date : vide.

Aucun employeur déjà connu pour ce secteur.
```

### 3.21 : Métiers animaliers

```
Secteur : Métiers animaliers (métiers : soigneur, toiletteur, éleveur). Départements : la DORDOGNE (24) puis la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Dans chaque département, couvre TOUTES les zones d'emploi de l'INSEE qui le recouvrent (identifie-les toi-même, sans me les demander).

Repère les employeurs de ce secteur où une personne peut se présenter ou envoyer une candidature spontanée : refuges, cliniques vétérinaires, parcs animaliers, élevages employeurs. Critères : établissement implanté dans le département, existant légalement (inscrit au registre des entreprises, établissement actif), en activité depuis au moins 3 ans, avec un site officiel ou une page de contact publique. Exclus les entrepreneurs individuels. Donne TOUS ceux que tu peux vérifier, zone par zone, sans plafond : je ne veux pas un échantillon. Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ».

Une ligne par fiche, au format exact :
id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date

- id : minuscules, chiffres et tirets, unique (exemple : leclerc-bergerac).
- nature : « enseigne » (une fiche pour une enseigne présente dans plusieurs communes) ou « local » (un seul établissement).
- secteur : toujours animalier.
- établissements : Commune:adresse ; Commune:adresse (nom de la commune exactement comme dans le code officiel géographique). Une enseigne présente dans plusieurs communes : une seule fiche, tous ses établissements séparés par " ; ".
- téléphone : le standard, format 05 53 00 00 00, SEULEMENT s'il est sur la page officielle ; sinon vide.
- site : adresse https officielle de l'employeur ; sinon vide. page de recrutement : adresse https de sa page « recrutement », « carrières » ou « candidature spontanée » ; sinon vide.
- modes : un ou plusieurs parmi spontanee, concours, portail, interim, prescripteur, non-indique (séparés par une virgule). « portail » si les candidatures passent par un site de recrutement, « concours » pour la fonction publique, « non-indique » si rien n'est précisé. Ne devine pas.
- source : adresse de la page où tu as relevé l'information.
- date : vide.

Aucun employeur déjà connu pour ce secteur.
```

---

## Étape 4 : les numéros de téléphone (9 conversations)

Un encadré par lot de 15 structures. Dans l'outil de veille, choisissez « des numéros de téléphone à ajouter aux fiches déjà connues » avant de coller la réponse.

### 4.1 : lot 1 sur 9

```
Voici 15 structures (nom | site officiel enregistré). Pour chacune, donne le numéro de téléphone du standard ou de l'accueil, tel qu'il est publié sur la page officielle de la structure ou sur service-public.fr. Réponds UNIQUEMENT par un bloc de code, une ligne par structure, au format exact :
nom | téléphone | adresse complète de la page où tu l'as lu | à vérifier (oui ou non)
Copie le nom exactement comme ci-dessous. Format du numéro : 05 53 00 00 00. Si tu ne trouves pas de numéro officiel, écris « non trouvé » à la place du numéro : n'en invente jamais et ne donne jamais un numéro de personne. Une ligne par structure, aucune omission, aucun commentaire.

Accueils de jour de la Dordogne | https://annuaire.action-sociale.org/
Action Logement, agence de Nouvelle-Aquitaine | https://www.actionlogement.fr/
ADIE Nouvelle-Aquitaine | https://www.adie.org/
ADIL de la Dordogne (agence départementale d'information sur le logement) | https://www.anil.org/qui-sommes-nous/reseau-des-adil/
ADIL de la Haute-Vienne | https://www.anil.org/adil-87/
AFAC 24 (Association Formation Avenir Conseil) | https://afac24.com/
AFPA, réseau des GRETA, CNAM | https://www.afpa.fr/
AGEFIPH, délégation régionale Nouvelle-Aquitaine | https://www.agefiph.fr/
ALEAS (Association Limousine Emplois Activités Services) | https://www.association-aleas.fr/
APEC | https://www.apec.fr/
APF France handicap, délégation de la Dordogne | https://dordogne.apf-francehandicap.org/
APF France handicap, délégation de la Haute-Vienne | https://haute-vienne.apf-francehandicap.org/
ARSL (Association régionale des solidarités) | https://arsl.eu/
Association d'aide à la santé mentale Croix Marine Dordogne | https://www.croixmarine24.fr/
Association d'aide aux victimes (réseau France Victimes) de la Dordogne | https://www.france-victimes.fr/
```

### 4.2 : lot 2 sur 9

```
Voici 15 structures (nom | site officiel enregistré). Pour chacune, donne le numéro de téléphone du standard ou de l'accueil, tel qu'il est publié sur la page officielle de la structure ou sur service-public.fr. Réponds UNIQUEMENT par un bloc de code, une ligne par structure, au format exact :
nom | téléphone | adresse complète de la page où tu l'as lu | à vérifier (oui ou non)
Copie le nom exactement comme ci-dessous. Format du numéro : 05 53 00 00 00. Si tu ne trouves pas de numéro officiel, écris « non trouvé » à la place du numéro : n'en invente jamais et ne donne jamais un numéro de personne. Une ligne par structure, aucune omission, aucun commentaire.

Association L.I.R.E. | https://www.associationlire.com/
Assurance retraite / CARSAT Nouvelle-Aquitaine | https://www.lassuranceretraite.fr/
Atchoum | https://www.atchoum.eu/
ATIGIP et structures d'insertion par l'activité économique implantées en milieu pénitentiaire | https://atigip.justice.gouv.fr/travail-et-formation/travail-en-detention/
Auto-écoles associatives et sociales | https://mes-aides.francetravail.fr/mobilite
Auto-Mobilité Solidaire Dordogne | https://automobilitesolida.wixsite.com/website
Banque alimentaire de la Dordogne | https://www.banquealimentaire.org/
Banque alimentaire de la Haute-Vienne | https://ba87.banquealimentaire.org/
Barreau de Périgueux | https://www.avocats-perigueux.com/
BASE (Bergerac Actions Solidarité Emploi) | https://associationbase.fr/
BGE Périgord | https://www.bge.asso.fr/
Bureau d'aide juridictionnelle, tribunal judiciaire de Périgueux et de Bergerac | https://www.justice.fr/
CAF de la Dordogne | https://www.caf.fr/allocataires/caf-de-la-dordogne
CAF de la Dordogne | https://www.caf.fr/allocataires/caf-de-la-dordogne
Cap emploi de la Dordogne | https://www.capemploi-24.com/
```

### 4.3 : lot 3 sur 9

```
Voici 15 structures (nom | site officiel enregistré). Pour chacune, donne le numéro de téléphone du standard ou de l'accueil, tel qu'il est publié sur la page officielle de la structure ou sur service-public.fr. Réponds UNIQUEMENT par un bloc de code, une ligne par structure, au format exact :
nom | téléphone | adresse complète de la page où tu l'as lu | à vérifier (oui ou non)
Copie le nom exactement comme ci-dessous. Format du numéro : 05 53 00 00 00. Si tu ne trouves pas de numéro officiel, écris « non trouvé » à la place du numéro : n'en invente jamais et ne donne jamais un numéro de personne. Une ligne par structure, aucune omission, aucun commentaire.

Centre communal d'action sociale (CCAS) | https://lannuaire.service-public.gouv.fr/navigation/ccas
Centre communal d'action sociale (CCAS) de la commune | https://lannuaire.service-public.gouv.fr/navigation/ccas
Centre communal d'action sociale (CCAS) de la commune | https://lannuaire.service-public.gouv.fr/
Centre ENIC-NARIC France (France Éducation international) | https://www.france-education-international.fr/expertises/enic-naric
Centres de formation d'apprentis et écoles de production de Nouvelle-Aquitaine | https://www.1jeune1solution.gouv.fr/formations-initiales
Centres sociaux et centres socioculturels de la Dordogne | https://www.centres-sociaux.fr/
Chambre de commerce et d'industrie de la Dordogne | https://www.dordogne.cci.fr/
Chambre de métiers et de l'artisanat de la Dordogne (rattachée à la CMA Nouvelle-Aquitaine) | https://www.artisanat.fr/
CIDFF de la Dordogne | https://dordogne.cidff.info/
CIDFF Limousin | https://limousin.cidff.info/
Conseil départemental de l'accès au droit (CDAD) de la Dordogne | https://www.cdad-dordogne.fr/
Conseil départemental de la Dordogne | https://www.dordogne.fr/
Conseil départemental de la Dordogne | https://www.dordogne.fr/
Conseil départemental de la Dordogne, service social départemental | https://www.dordogne.fr/
Conseil départemental de la Dordogne, services d'insertion | https://www.dordogne.fr/
```

### 4.4 : lot 4 sur 9

```
Voici 15 structures (nom | site officiel enregistré). Pour chacune, donne le numéro de téléphone du standard ou de l'accueil, tel qu'il est publié sur la page officielle de la structure ou sur service-public.fr. Réponds UNIQUEMENT par un bloc de code, une ligne par structure, au format exact :
nom | téléphone | adresse complète de la page où tu l'as lu | à vérifier (oui ou non)
Copie le nom exactement comme ci-dessous. Format du numéro : 05 53 00 00 00. Si tu ne trouves pas de numéro officiel, écris « non trouvé » à la place du numéro : n'en invente jamais et ne donne jamais un numéro de personne. Une ligne par structure, aucune omission, aucun commentaire.

Conseils de prud'hommes de Périgueux et de Bergerac | https://lannuaire.service-public.gouv.fr/nouvelle-aquitaine/dordogne/4e40b4a0-0ebb-4332-8451-587a57b781dc
Coop'alpha | https://www.coopalpha.coop/
CPAM de la Dordogne (siège de Périgueux) | https://www.ameli.fr/dordogne/assure
CPAM de la Haute-Vienne (siège de Limoges) | https://www.ameli.fr/haute-vienne/assure
Croix-Rouge française, Secours catholique, Restos du Cœur, Familles rurales | https://www.service-public.gouv.fr/particuliers/vosdroits/F21375
Délégués territoriaux du Défenseur des droits en Dordogne | https://www.defenseurdesdroits.fr/carte-des-delegues
DREETS Nouvelle-Aquitaine (inspection du travail) | https://nouvelle-aquitaine.dreets.gouv.fr/
École de la deuxième chance de la Dordogne (Périgueux) | https://reseau-e2c.fr/
Écoles, collèges et lycées proposant le dispositif OEPRE, via l'inspection académique de la Dordogne | https://www.ac-bordeaux.fr/
Entreprises adaptées et ESAT de la Dordogne | https://annuaire.action-sociale.org/
Épiceries sociales et solidaires | https://www.andes-france.com/
EPIDE, centres de Nouvelle-Aquitaine | https://www.epide.fr/
Fédération CRÉSUS | https://www.cresus.org/
Foyers de jeunes travailleurs et résidences Habitat Jeunes du Périgord | https://habitat.dordogne.fr/mon-logement/hebergement-pour-les-jeunes-et-etudiants-en-dordogne
France Active Nouvelle-Aquitaine | https://www.franceactive.org/
```

### 4.5 : lot 5 sur 9

```
Voici 15 structures (nom | site officiel enregistré). Pour chacune, donne le numéro de téléphone du standard ou de l'accueil, tel qu'il est publié sur la page officielle de la structure ou sur service-public.fr. Réponds UNIQUEMENT par un bloc de code, une ligne par structure, au format exact :
nom | téléphone | adresse complète de la page où tu l'as lu | à vérifier (oui ou non)
Copie le nom exactement comme ci-dessous. Format du numéro : 05 53 00 00 00. Si tu ne trouves pas de numéro officiel, écris « non trouvé » à la place du numéro : n'en invente jamais et ne donne jamais un numéro de personne. Une ligne par structure, aucune omission, aucun commentaire.

France Alzheimer Dordogne | https://www.francealzheimer.org/dordogne/
France Terre d'Asile, CADA de Périgueux | https://www.france-terre-asile.org/etablissement/cada-de-perigueux
France Travail | https://www.francetravail.fr/
France Travail | https://www.francetravail.fr/
France Travail | https://www.francetravail.fr/
France Travail | https://www.francetravail.fr/
France Travail de la Dordogne | https://www.francetravail.fr/candidat/jeunes.html
France Travail, conseillers justice | https://www.francetravail.fr/candidat/mes-droits-aux-aides-et-allocati/a-chaque-situation-son-allocatio/quelle-est-ma-situation-personne/jentre--je-sors-de-prison.html
France Travail, espace employeur | https://www.francetravail.fr/employeur/
GEIQ 24 (groupement d'employeurs pour l'insertion et la qualification) | https://geiq24.com/
INAÉ, réseau régional de l'insertion par l'activité économique en Nouvelle-Aquitaine | https://inae-nouvelleaquitaine.org/
Info Jeunes Nouvelle-Aquitaine (CRIJ) | https://crijna.fr/
Initiative Périgord | https://initiative-france.fr/
Inspection du travail (DDETS de la Dordogne) | https://nouvelle-aquitaine.dreets.gouv.fr/
IRISCOP | https://iriscop.com/
```

### 4.6 : lot 6 sur 9

```
Voici 15 structures (nom | site officiel enregistré). Pour chacune, donne le numéro de téléphone du standard ou de l'accueil, tel qu'il est publié sur la page officielle de la structure ou sur service-public.fr. Réponds UNIQUEMENT par un bloc de code, une ligne par structure, au format exact :
nom | téléphone | adresse complète de la page où tu l'as lu | à vérifier (oui ou non)
Copie le nom exactement comme ci-dessous. Format du numéro : 05 53 00 00 00. Si tu ne trouves pas de numéro officiel, écris « non trouvé » à la place du numéro : n'en invente jamais et ne donne jamais un numéro de personne. Une ligne par structure, aucune omission, aucun commentaire.

La Cimade, permanence de Périgueux | https://www.lacimade.org/
La Cimade, région Nouvelle-Aquitaine | https://www.lacimade.org/
La Main Forte | https://lamainforte.org/
La Maison 24 | https://www.lamaison24.net/
La Traverse | https://latraverse-bergerac.fr/
Le 115 | https://www.info.gouv.fr/organisation/delegation-interministerielle-a-l-hebergement-et-a-l-acces-au-logement
Les Restos du Cœur, association départementale de la Dordogne | https://ad24.restosducoeur.org/
Les Restos du Cœur, association départementale de la Haute-Vienne | https://ad87.restosducoeur.org/
Les Saveurs du Bois du Roc | https://www.saveursduboisduroc.fr/
Ligue de l'enseignement de la Dordogne | https://laligue24.org/
Maison départementale des personnes handicapées (MDPH) de la Dordogne | https://www.dordogne.fr/a-votre-service/handicap/maison-departementale-des-personnes-handicapees
Maisons France Services | https://www.france-services.gouv.fr/
Mission locale du Bergeracois | https://www.missionlocaledubergeracois.com/
Mission locale du Grand Périgueux | https://www.ml-grandperigueux.fr/
Mission locale et Maison de l'emploi du Périgord Noir | https://www.missionlocaleperigordnoir.com/
```

### 4.7 : lot 7 sur 9

```
Voici 15 structures (nom | site officiel enregistré). Pour chacune, donne le numéro de téléphone du standard ou de l'accueil, tel qu'il est publié sur la page officielle de la structure ou sur service-public.fr. Réponds UNIQUEMENT par un bloc de code, une ligne par structure, au format exact :
nom | téléphone | adresse complète de la page où tu l'as lu | à vérifier (oui ou non)
Copie le nom exactement comme ci-dessous. Format du numéro : 05 53 00 00 00. Si tu ne trouves pas de numéro officiel, écris « non trouvé » à la place du numéro : n'en invente jamais et ne donne jamais un numéro de personne. Une ligne par structure, aucune omission, aucun commentaire.

Mission locale rurale de la Haute-Vienne | https://www.missionlocaleruralehautevienne.com/
Mobilim 87 (association Varlin Pont-Neuf) | https://mobilim87.fr/
MSA Dordogne, Lot-et-Garonne, Landes | https://dlg.msa.fr/lfp
Office français de l'immigration et de l'intégration (OFII), direction territoriale | https://www.ofii.fr/
Opérateur régional du conseil en évolution professionnelle pour la Nouvelle-Aquitaine (salariés et indépendants du privé), sélectionné par France compétences | https://mon-cep.org/
Plans locaux pour l'insertion et l'emploi et maisons de l'emploi de la Dordogne | https://www.ville-emploi.asso.fr/annuaire-du-reseau
Plateforme de suivi et d'appui aux décrocheurs de la Dordogne | https://www.ac-bordeaux.fr/ia24
Plateforme mobilité de la Dordogne | https://mes-aides.francetravail.fr/regions/nouvelle-aquitaine
Plateforme MUST | https://www.plateforme-must.fr/
PLIE du Bergeracois (porté par la Mission locale du Bergeracois) | https://www.missionlocaledubergeracois.com/le-plie
Points relais conseil VAE de la Dordogne | https://vae.gouv.fr/
Points-justice de la Dordogne | https://cdad-dordogne.fr/lieux-d-acces-au-droit.html
Préfecture de la Dordogne | https://www.dordogne.gouv.fr/
Préfecture de la Dordogne, service des étrangers | https://www.dordogne.gouv.fr/
Protection maternelle et infantile (PMI) du conseil départemental de la Dordogne | https://www.dordogne.fr/
```

### 4.8 : lot 8 sur 9

```
Voici 15 structures (nom | site officiel enregistré). Pour chacune, donne le numéro de téléphone du standard ou de l'accueil, tel qu'il est publié sur la page officielle de la structure ou sur service-public.fr. Réponds UNIQUEMENT par un bloc de code, une ligne par structure, au format exact :
nom | téléphone | adresse complète de la page où tu l'as lu | à vérifier (oui ou non)
Copie le nom exactement comme ci-dessous. Format du numéro : 05 53 00 00 00. Si tu ne trouves pas de numéro officiel, écris « non trouvé » à la place du numéro : n'en invente jamais et ne donne jamais un numéro de personne. Une ligne par structure, aucune omission, aucun commentaire.

Région Nouvelle-Aquitaine | https://www.nouvelle-aquitaine.fr/
Région Nouvelle-Aquitaine, programme régional de formation | https://www.nouvelle-aquitaine.fr/
Région Nouvelle-Aquitaine, service des transports | https://transports.nouvelle-aquitaine.fr/
Relais petite enfance (RPE) | https://monenfant.fr/les-relais-petite-enfance
Réseau Alliage | https://www.reseau-alliage.fr/
Secours populaire français, fédération de la Dordogne | https://www.secourspopulaire.fr/
Service de prévention et de santé au travail interentreprises de la Dordogne | https://www.spst19-24.org/
Service pénitentiaire d'insertion et de probation de la Dordogne | https://www.justice.gouv.fr/annuaire/structures-reinsertion-demploi/services-penitentiaires-dinsertion-probation-spip
SIAO de la Dordogne | https://annuaire.action-sociale.org/
SOLIHA Dordogne-Périgord | https://www.dordogne.soliha.fr/
SOLIHA Limousin | https://limousin.soliha.fr/
SPSTI 23/87 (service de prévention et de santé au travail Creuse-Haute-Vienne) | https://www.net1901.org/association/SERVICE-DE-PREVENTION-ET-DE-SANTE-AU-TRAVAIL-INTERENTREPRISES-POUR-LA-CREUSE-ET-LA-HAUTE-VIENNE-SPSTI-2387,2516114.html
Structure de premier accueil des demandeurs d'asile (SPADA) de la Dordogne | https://www.asd24.org/
Structures de l'insertion par l'activité économique de la Dordogne (entreprises d'insertion, associations intermédiaires, ateliers et chantiers d'insertion, ETTI) | https://emplois.inclusion.beta.gouv.fr/
Succursales de la Banque de France | https://www.banque-france.fr/fr/nous-trouver
```

### 4.9 : lot 9 sur 9

```
Voici 7 structures (nom | site officiel enregistré). Pour chacune, donne le numéro de téléphone du standard ou de l'accueil, tel qu'il est publié sur la page officielle de la structure ou sur service-public.fr. Réponds UNIQUEMENT par un bloc de code, une ligne par structure, au format exact :
nom | téléphone | adresse complète de la page où tu l'as lu | à vérifier (oui ou non)
Copie le nom exactement comme ci-dessous. Format du numéro : 05 53 00 00 00. Si tu ne trouves pas de numéro officiel, écris « non trouvé » à la place du numéro : n'en invente jamais et ne donne jamais un numéro de personne. Une ligne par structure, aucune omission, aucun commentaire.

Transitions Pro Nouvelle-Aquitaine | https://www.transitionspro-na.fr/
UDAF de la Dordogne | https://www.udaf24.fr/acces-au-microcredit-personnel-accompagne-udaf/
UDAF de la Haute-Vienne | https://www.udaf87.fr/
UNAFAM Dordogne | https://www.unafam.org/dordogne
UNAFAM Haute-Vienne | https://www.unafam.org/haute-vienne
URSSAF Nouvelle-Aquitaine | https://www.urssaf.fr/
Varlin Pont-Neuf | https://varlinpontneuf.fr/
```

---

## Étape 5 : les relances (seulement si ChatGPT résiste)

**Il a raccourci ou s'est arrêté :**

```
Tu as donné moins de lignes que ce qui existe. Reprends sans aucun commentaire : donne maintenant TOUTES les lignes manquantes, pour la Dordogne puis pour la Haute-Vienne, au même format, sans répéter celles déjà données. Si c'est trop long, découpe en parties : « PARTIE 1/3 », puis attends mon « oui ».
```

**Il bavarde ou pose des questions :**

```
Ne réponds plus par des phrases. Uniquement le bloc de code demandé, puis les deux listes « À vérifier » et « Sources consultées ». Recommence ta dernière réponse maintenant.
```

**Il a coupé au milieu d'une ligne :**

```
Ta réponse s'est coupée. Reprends à partir de la dernière ligne COMPLÈTE que tu as écrite, sans la répéter, sans commentaire, et continue jusqu'au bout.
```

**Pour vérifier qu'il n'a rien oublié :**

```
Sans rien écrire d'autre, donne uniquement : le nombre de lignes données pour la Dordogne, le nombre pour la Haute-Vienne, et la liste de ce que tu connais mais que tu n'as PAS mis dans le tableau, avec la raison de chaque omission. Puis écris les lignes manquantes que tu peux sourcer.
```

