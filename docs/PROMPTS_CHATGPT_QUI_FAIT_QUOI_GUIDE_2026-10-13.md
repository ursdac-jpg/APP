# Qui fait quoi : prompts ChatGPT pour compléter le répertoire à partir du guide

> Généré le 2026-10-13 (`gen_prompts_guide.js`, dans le dossier de travail de la session) depuis les données réelles : les listes « déjà connues » sont celles du répertoire public ET du sas des structures. **Sujets issus du tri du guide** (`docs/TRI_GUIDE_QUI_FAIT_QUOI_2026-10-13.md`, verdict B) ; **aucun texte du guide n'est repris**, ChatGPT cherche les organismes ACTUELS dans les deux départements.

**Mode d'emploi** : même méthode que `docs/PROMPTS_CHATGPT_PRETS_A_COPIER_2026-10-12.md` (réglage « instructions personnalisées » de l'étape 1, une conversation par encadré, répondre « oui » à chaque partie). Copiez la réponse entière dans la conversation avec Claude : il la range dans le sas (jamais public), puis le prompt de vérification pour un autre assistant est régénéré.

---

### G1 : Orientation, bilan de compétences et emploi agricole

```
Rayon : Orientation et aide à l'emploi locale. Ce que je cherche : centres d'information et d'orientation (CIO) ou leurs successeurs, centres interinstitutionnels de bilans de compétences (CIBC), Nouvelle-Aquitaine Cap Métiers, associations d'aide à la reconversion (par exemple Retravailler), association pour l'emploi et la formation en agriculture (ADEFA ou équivalent), maisons de l'emploi et espaces économie emploi s'ils existent encore, bureaux et points information jeunesse. Types autorisés (colonne « type ») : formation-orientation, formation-jeunes, france-travail, mission-locale, collectivite-etat, appui-aux-employeurs.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon et qui EXISTENT ACTUELLEMENT (vérifie qu'elles n'ont pas fermé, changé de nom ou fusionné), pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ». Si une structure que je cite n'existe plus, ne l'invente pas : ne la donne pas.

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
- rayons : UNIQUEMENT des rayons de cette liste, séparés par des virgules SANS espace : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors. Jamais un type à la place d'un rayon.
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : Centre Info Jeunes de Périgueux ; CIBC Haute-Vienne ; CIBC Solutions RH ; Info Jeunes France ; Info Jeunes Limoges ; Info Jeunes Nouvelle-Aquitaine (CRIJ) ; Info Jeunes Sarlat.
```

---

### G2 : Insertion par l'activité économique et groupements d'employeurs

```
Rayon : Insertion par l'activité économique. Ce que je cherche : toutes les structures de l'insertion par l'activité économique (associations intermédiaires, ateliers et chantiers d'insertion, entreprises d'insertion, entreprises de travail temporaire d'insertion, régies de quartier), les groupements d'employeurs pour l'insertion et la qualification (GEIQ) et les groupements d'employeurs (GE). Types autorisés (colonne « type ») : siae, appui-aux-employeurs, plie.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon et qui EXISTENT ACTUELLEMENT (vérifie qu'elles n'ont pas fermé, changé de nom ou fusionné), pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ». Si une structure que je cite n'existe plus, ne l'invente pas : ne la donne pas.

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
- rayons : UNIQUEMENT des rayons de cette liste, séparés par des virgules SANS espace : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors. Jamais un type à la place d'un rayon.
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : ACCJ - Chantiers Jacquaire ; ACTO Insertion ; ALAIJE - Association Lieux Accueil Insertion Jardins Environnement ; ATIGIP et structures d'insertion par l'activité économique implantées en milieu pénitentiaire ; Centre d'Hébergement et de Réinsertion Sociale APARE ; Conseil départemental de la Dordogne, services d'insertion ; GEIQ 24 (groupement d'employeurs pour l'insertion et la qualification) ; GEIQ Limousin ; INAÉ, réseau régional de l'insertion par l'activité économique en Nouvelle-Aquitaine ; Plans locaux pour l'insertion et l'emploi et maisons de l'emploi de la Dordogne ; PLIE du Bergeracois (porté par la Mission locale du Bergeracois) ; PLIE Limoges Métropole ; Relais Insertion Solidaire ; Service insertion du Conseil départemental de la Haute-Vienne ; Service pénitentiaire d'insertion et de probation de la Dordogne ; Service pénitentiaire d'insertion et de probation de la Haute-Vienne ; Services pénitentiaires d'insertion et de probation (SPIP) ; Structures de l'insertion par l'activité économique de la Dordogne (entreprises d'insertion, associations intermédiaires, ateliers et chantiers d'insertion, ETTI) ; Structures de l'insertion par l'activité économique de la Haute-Vienne.
```

---

### G3 : Création et reprise d'activité, réseaux d'entrepreneurs

```
Rayon : Créer son activité. Ce que je cherche : clubs et associations de créateurs et de repreneurs d'entreprise (par exemple Club Dordogne Entrepreneurs), réseau Entreprendre, Initiative, BGE, Adie, France Active, couveuses et coopératives d'activité et d'emploi, associations de dirigeants bénévoles qui accompagnent les créateurs, Jeune Chambre Économique. Types autorisés (colonne « type ») : creation-activite, appui-aux-employeurs.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon et qui EXISTENT ACTUELLEMENT (vérifie qu'elles n'ont pas fermé, changé de nom ou fusionné), pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ». Si une structure que je cite n'existe plus, ne l'invente pas : ne la donne pas.

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
- rayons : UNIQUEMENT des rayons de cette liste, séparés par des virgules SANS espace : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors. Jamais un type à la place d'un rayon.
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : Adie ; Adie Dordogne ; ADIE Nouvelle-Aquitaine ; BGE Limousin ; BGE Nouvelle-Aquitaine ; BGE Périgord ; Bpifrance Création ; Coopérer pour Entreprendre ; Entreprendre.Service-Public.fr ; France Active Nouvelle-Aquitaine ; Incubatest BGE Limousin ; Initiative France ; Initiative Haute-Vienne ; Initiative Nouvelle-Aquitaine ; Initiative Périgord ; Initiative Sarlat ; IRISCOP ; IRISCOP Limousin ; La Fabrique à Initiatives Limousin ; Réseau Entreprendre ; Réseau Entreprendre Aquitaine ; Réseau Entreprendre Limousin ; Réseau Entreprendre Nouvelle-Aquitaine.
```

---

### G4 : Famille, aide aux aidants, planification, bailleurs sociaux

```
Rayon : Famille et social de proximité. Ce que je cherche : points info famille, centres sociaux et centres socioculturels (les fédérations départementales et les principaux centres), maisons des aidants, centres de planification et d'éducation familiale, bailleurs sociaux (offices publics de l'habitat), structures d'accueil temporaire, aides au logement des jeunes, Restos du Cœur, Alcooliques Anonymes, associations d'aide alimentaire. Types autorisés (colonne « type ») : soutien-aux-familles, petite-enfance, logement-hebergement, aide-alimentaire-materielle, service-social-secteur, sante-soins-addictions, ccas.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon et qui EXISTENT ACTUELLEMENT (vérifie qu'elles n'ont pas fermé, changé de nom ou fusionné), pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ». Si une structure que je cite n'existe plus, ne l'invente pas : ne la donne pas.

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
- rayons : UNIQUEMENT des rayons de cette liste, séparés par des virgules SANS espace : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors. Jamais un type à la place d'un rayon.
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : Action Logement, agence de Nouvelle-Aquitaine ; ADIL de la Dordogne (agence départementale d'information sur le logement) ; ARSL - Hébergement & Logement ; ARSL Logement ; Association de Soutien de la Dordogne (ASD) - Pôle Logement ; Association Familles Rurales Bellac et ses environs ; Banque alimentaire de la Dordogne ; Banque alimentaire de la Haute-Vienne ; Centre Social VITAL ; Confédération Syndicale des Familles ; Croix-Rouge française, Secours catholique, Restos du Cœur, Familles rurales ; Fondation pour le Logement des Défavorisés ; Fonds de solidarité pour le logement de la Haute-Vienne ; Foyers de jeunes travailleurs et résidences Habitat Jeunes du Périgord ; Habitat et Humanisme Dordogne ; Habitat et Humanisme Limousin ; Habitat Jeunes Limoges ; Les Restos du Cœur, association départementale de la Dordogne ; Les Restos du Cœur, association départementale de la Haute-Vienne ; Service d'Accompagnement des Familles en Difficulté (SAFED).
```

---

### G5 : Fonction publique et armées

```
Rayon : Fonction publique et armées. Ce que je cherche : les centres de gestion de la fonction publique territoriale, les services de la préfecture et du rectorat qui informent sur les concours, les centres d'information et de recrutement des forces armées (CIRFA) et leurs permanences dans le département, les points d'information sur les métiers de la fonction publique. Types autorisés (colonne « type ») : collectivite-etat, france-travail.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon et qui EXISTENT ACTUELLEMENT (vérifie qu'elles n'ont pas fermé, changé de nom ou fusionné), pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ». Si une structure que je cite n'existe plus, ne l'invente pas : ne la donne pas.

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
- rayons : UNIQUEMENT des rayons de cette liste, séparés par des virgules SANS espace : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors. Jamais un type à la place d'un rayon.
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : Centre national de la fonction publique territoriale (CNFPT) ; Conseillers mobilité-carrière de la fonction publique de l'État ; Préfecture de la Dordogne ; Préfecture de la Dordogne, service des étrangers ; Préfecture de la Haute-Vienne ; Préfecture de la Haute-Vienne - Bureau de l'immigration et de l'intégration.
```

---

### G6 : Chambres consulaires et appui aux employeurs agricoles

```
Rayon : Chambres et appui aux employeurs. Ce que je cherche : chambres d'agriculture, chambres économiques ou interconsulaires, organisations qui aident les employeurs agricoles à recruter (services de remplacement, groupements d'employeurs agricoles), santé au travail agricole. Types autorisés (colonne « type ») : appui-aux-employeurs, creation-activite, collectivite-etat.

Donne TOUTES les structures publiques ou associatives qui répondent à ce rayon et qui EXISTENT ACTUELLEMENT (vérifie qu'elles n'ont pas fermé, changé de nom ou fusionné), pour la DORDOGNE (24) puis pour la HAUTE-VIENNE (87), dans la même réponse (sections « DÉPARTEMENT 24 » puis « DÉPARTEMENT 87 »). Ajoute les structures régionales (toute la Nouvelle-Aquitaine) et nationales qui ont un accueil dans ces départements, une seule fois, dans une section « RÉGION ET NATIONAL ». Zéro bavardage, aucune limite de longueur, aucune ligne résumée ; si c'est trop long, découpe en parties et attends mon « oui ». Si une structure que je cite n'existe plus, ne l'invente pas : ne la donne pas.

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
- rayons : UNIQUEMENT des rayons de cette liste, séparés par des virgules SANS espace : accompagnement, budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, logement, mobilite, sante, seniors. Jamais un type à la place d'un rayon.
- source : adresse https d'une page que tu as réellement consultée (jamais un nom de document, jamais Google Maps ni un moteur de recherche) ; sinon laisse vide.
- date : vide.

Structures DÉJÀ CONNUES, à ne pas redonner : ATIGIP et structures d'insertion par l'activité économique implantées en milieu pénitentiaire ; Chambre d'agriculture de la Dordogne ; Chambre d'agriculture de la Dordogne - Antenne du Périgord Noir ; Chambre d'agriculture de la Haute-Vienne ; Chambre de commerce et d'industrie de la Dordogne ; Chambre de commerce et d'industrie Limoges et Haute-Vienne ; Chambre de métiers et de l'artisanat de la Dordogne (rattachée à la CMA Nouvelle-Aquitaine) ; Chambre de métiers et de l'artisanat de la Haute-Vienne ; Chambres d'agriculture France ; Chambres d'agriculture Nouvelle-Aquitaine ; INAÉ, réseau régional de l'insertion par l'activité économique en Nouvelle-Aquitaine ; MSA Dordogne, Lot-et-Garonne, Landes ; MSA du Limousin ; Point-Justice des Chambres consulaires de Limoges ; Structures de l'insertion par l'activité économique de la Dordogne (entreprises d'insertion, associations intermédiaires, ateliers et chantiers d'insertion, ETTI) ; Structures de l'insertion par l'activité économique de la Haute-Vienne.
```

