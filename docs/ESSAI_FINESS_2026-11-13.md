# Essai FINESS (2026-11-13)

Essai sur pièce demandé par Denis le 13/11/2026 (consigne 270, suite 5). Aucun code d'onglet écrit : le fichier a été lu, trié et comparé au registre et au sas par des scripts jetables.

## Ce qui a été fait

- Fichier FINESS des structures (ministère de la Santé, ANS), version du 12/11/2026, 52 Mo compressés : 98 352 personnes morales et 175 094 établissements pour toute la France.
- Gardé : les établissements **ouverts** (aucune date de fermeture, état actif) de la **Dordogne et de la Haute-Vienne** : **1 294**.
- Parmi eux, 140 appartiennent à des catégories utiles à votre public (hébergement et insertion sociale, travail et handicap, addictions, droits et accès aux soins). Les autres (pharmacies 273, EHPAD 111, aide à domicile 96, laboratoires, imagerie, hôpitaux, écoles de soins, etc.) sont écartés d'office : pas votre sujet.
- Comparés au registre et au sas avec les mêmes contrôles que l'onglet Prospection : **40 déjà connus** (même téléphone ou même nom), **9 qui ressemblent** à une fiche existante (à trancher), **91 nouveaux**.

## Ce que ça apporte

- **Un vrai complément** : les ESAT (17 nouveaux), les entreprises adaptées et ateliers protégés (14), les maisons relais (11), les centres d'hébergement d'urgence et d'insertion (9), les résidences et foyers pour jeunes travailleurs (7), les centres de planification (4), les structures d'addictologie (3). Beaucoup n'étaient pas dans data.inclusion.
- **Des données fiables** : 91 fiches sur 91 ont une adresse, 78 un téléphone, 86 un SIRET (donc l'état « en activité » peut être vérifié dans le registre officiel, comme pour l'onglet actuel).
- **Le contrôle des doublons fonctionne sur cette source** : il a retrouvé le CHRS Cité Béthanie, le CADA d'Eymoutiers ou l'ARSL sous un autre nom.

## Ce que ça n'apporte pas (soyons francs)

- **Aucun site web** et **aucune description** : chaque fiche demandera votre phrase d'explication entièrement écrite (ou celle de l'assistant en ligne, piste 2 reportée).
- **Des noms bruts** : abréviations (« Mr », « Res Soc Fjt Rhj »), majuscules sans accents. Il faudrait les réécrire à la main, ou ajouter une petite étape de nettoyage (je l'ai fait ici, de façon incomplète).
- **Plusieurs établissements pour une même association** : l'ESAT OSEA a 4 sites, le CDTPI d'Isle 3, Clairvivre 4 fiches. À regrouper ou à garder séparées selon votre choix.
- **Des services peu utiles à votre public** : mandataires judiciaires (tutelles), délégués aux prestations familiales. Je les ai gardés dans l'essai pour que vous jugiez ; je les retirerais.
- **Un fichier qui bouge lentement** : un passage tous les 3 à 6 mois suffit, pas chaque mois.

## Mon avis

FINESS vaut la peine, **modestement** : une centaine de fiches utiles, surtout pour l'emploi des personnes en situation de handicap et l'hébergement. Ce n'est pas une mine, et chaque fiche demande plus de travail d'écriture que celles de data.inclusion. Je ne ferais **pas un nouvel onglet** : j'ajouterais FINESS comme **deuxième source de l'onglet Prospection actuel** (mêmes contrôles de doublons, mêmes écartées, même filtre par département), avec un passage tous les trimestres.

## Les 91 fiches nouvelles


### Addictions

| Dép. | Catégorie | Nom | Commune | Téléphone |
| --- | --- | --- | --- | --- |
| 24 | CAARUD | CAARUD Dordogne | Périgueux | non indiqué |
| 87 | CAARUD | CAARUD Aides | Limoges | 05 55 06 18 19 |
| 24 | CSAPA | CSAPA avec hébergement : communauté thérapeutique | Brantôme en Périgord | non indiqué |

### Droits, santé et accès aux soins

| Dép. | Catégorie | Nom | Commune | Téléphone |
| --- | --- | --- | --- | --- |
| 24 | Centre d'examens de santé | Centre d'examens de santé | Périgueux | 05 53 06 41 70 |
| 24 | Centre de planification | Centre de Planification de Bergerac | Bergerac | 05 53 02 04 70 |
| 24 | Centre de planification | Centre de Planification de Nontron | Nontron | 05 53 56 01 84 |
| 24 | Centre de planification | Centre de Planification de Périgueux | Périgueux | 05 53 02 03 90 |
| 24 | Centre de planification | Centre de Planification de Ribérac | Ribérac | non indiqué |
| 87 | Délégués aux prestations familiales | ALSEA service délégué aux prestations familiales | Limoges | 05 55 11 03 10 |
| 24 | Mandataires judiciaires (MJPM) | Service MJPM : AMJP | Sarlat-la-Canéda | 05 53 30 80 95 |
| 24 | Mandataires judiciaires (MJPM) | Service MJPM MSA Tutelles | Périgueux | 05 53 02 67 82 |
| 24 | Mandataires judiciaires (MJPM) | Service MJPM SAFED | Périgueux | 05 53 05 17 80 |
| 87 | Mandataires judiciaires (MJPM) | AEPAPE 87 service mandataire judiciaire protection des majeurs | Limoges | 05 55 79 24 59 |
| 87 | Mandataires judiciaires (MJPM) | ALSEA service mandataire judiciaire à la protection des majeurs | Limoges | 05 55 11 03 10 |
| 87 | Santé au travail | AMCO BTP 87 | Limoges | 05 55 11 21 00 |

### Hébergement et insertion sociale

| Dép. | Catégorie | Nom | Commune | Téléphone |
| --- | --- | --- | --- | --- |
| 87 | Accueil de demandeurs d'asile (CADA) | CADA Audacia 87 | Saint Léonard de Noblat | 05 49 03 18 56 |
| 24 | Accueil de jour | Accueil de Jour L'Ilot femmes | Périgueux | non indiqué |
| 24 | Appartements de coordination thérapeutique | ACT ASD | Périgueux | 05 53 06 82 13 |
| 24 | Appartements de coordination thérapeutique | ACT Périgueux | Périgueux | 05 53 54 89 41 |
| 87 | Appartements de coordination thérapeutique | Appartement de Coordination thérapeutique | Limoges 1 | 05 55 43 13 21 |
| 87 | Centre provisoire d'hébergement (réfugiés) | CPH de l'ARSL | Limoges | 05 55 34 70 44 |
| 24 | CHRS | Centre hébergement service d'accueil familles en difficulté | Périgueux | 05 53 05 55 35 |
| 24 | CHRS | CHRS Foyer Lakanal |  | 05 53 45 20 05 |
| 24 | CHRS | CHRS IPSEA | Périgueux | 05 53 06 82 14 |
| 24 | Foyer de jeunes travailleurs / résidence sociale | Foyer jeunes travailleurs résidence sociale | Périgueux | 05 53 06 81 40 |
| 24 | Foyer de jeunes travailleurs / résidence sociale | La maison des Compagnons du Devoir | Chancelade | 05 53 03 32 80 |
| 24 | Foyer de jeunes travailleurs / résidence sociale | Résidence sociale FJT Campus Boulazac | Boulazac Isle Manoire | 05 53 02 44 70 |
| 24 | Foyer de jeunes travailleurs / résidence sociale | Résidence sociale FJT RHJ Périgord Noir | Sarlat-la-Canéda | 05 53 30 89 05 |
| 87 | Foyer de jeunes travailleurs / résidence sociale | Fédération compagnonnique des métiers du bâtiment | Limoges | 05 55 33 55 60 |
| 24 | Hébergement d'insertion et d'urgence | Centre d'hébergement : les chalets d'accueil | Périgueux | 05 53 04 99 43 |
| 24 | Hébergement d'insertion et d'urgence | Centre d'hébergement de stabilisation | Bergerac | 05 53 23 57 00 |
| 24 | Hébergement d'insertion et d'urgence | Hébergement d'urgence Caritas | Bergerac | non indiqué |
| 24 | Hébergement d'insertion et d'urgence | Hébergement urgence : logements Passerelle | Périgueux | non indiqué |
| 24 | Hébergement d'insertion et d'urgence | Hébergement urgence femmes victimes de violence | Bergerac | 06 38 55 63 60 |
| 24 | Hébergement d'insertion et d'urgence | HU femmes victimes APARE | Périgueux | non indiqué |
| 24 | Hébergement d'insertion et d'urgence | HUDI APARE | Périgueux | non indiqué |
| 24 | Hébergement d'insertion et d'urgence | Logements HU CCAS 24 | Périgueux | non indiqué |
| 87 | Hébergement d'insertion et d'urgence | ARSL résidence Montalat | Limoges | 05 55 34 79 29 |
| 87 | Lits d'accueil médicalisés | LAM Reinsertion sociale Limousin | Limoges | non indiqué |
| 24 | Maison relais | Maison relais SAFED | Périgueux | 05 53 06 62 62 |
| 24 | Maison relais | Maison relais ACSC | Bergerac | 06 38 55 63 60 |
| 24 | Maison relais | Maison relais des Bords de L'Isle | Périgueux | 05 53 45 20 08 |
| 24 | Maison relais | Maison relais UDAF 24 | Périgueux | 05 53 06 41 24 |
| 24 | Maison relais | Maison relais résidence accueil de Montpon | Montpon-Ménestérol | 09 55 13 59 58 |
| 87 | Maison relais | Maison relais résidence Acc PRISM | Limoges | 05 54 49 01 06 |
| 87 | Maison relais | Maison relais les Clarisses | Limoges | 05 55 32 10 88 |
| 87 | Maison relais | Maison relais Montplaisir | Couzeix | 05 55 39 22 97 |
| 87 | Maison relais | Résidence accueil UDAF 87 | Saint Junien | non indiqué |
| 87 | Maison relais | Résidence du Mas Loubier | Limoges | 07 54 37 63 42 |
| 87 | Maison relais | Résidence sociale Quai Militaire Adoma | Limoges | 05 55 37 26 51 |
| 24 | Résidence hôtelière à vocation sociale | Résidence hôtelière a vocation sociale | Boulazac Isle Manoire | 05 53 06 63 00 |
| 87 | Résidence sociale | Résidence de L'Industrie | Limoges | 05 55 10 20 93 |
| 87 | Résidence sociale | Résidence sociale les Sources | Limoges | 05 55 37 26 51 |

### Travail et handicap

| Dép. | Catégorie | Nom | Commune | Téléphone |
| --- | --- | --- | --- | --- |
| 24 | Atelier protégé / entreprise adaptée | Atelier protégé de Mialet | Mialet | 05 53 62 55 32 |
| 24 | Atelier protégé / entreprise adaptée | Equilibre : atelier protégé | Terrasson | 05 53 50 69 22 |
| 24 | Atelier protégé / entreprise adaptée | Restauvezere Cuisine Centrale | Sainte Eulalie d Ans | 05 53 51 65 94 |
| 87 | Atelier protégé / entreprise adaptée | APAJH services 87 | Verneuil sur Vienne | 05 55 48 06 97 |
| 87 | Atelier protégé / entreprise adaptée | Aprobois des Feuillardiers | Les Cars | 05 55 39 16 04 |
| 87 | Atelier protégé / entreprise adaptée | Atelier protégé la Feuillade B.roche | Limoges 9 | 05 55 37 86 47 |
| 87 | Atelier protégé / entreprise adaptée | Atelier protégé de L'Isop | Saint Martial sur Isop | 05 55 60 31 32 |
| 87 | Atelier protégé / entreprise adaptée | Atelier protégé de la Valoine | Boisseuil | 05 55 30 52 30 |
| 87 | Atelier protégé / entreprise adaptée | Atelier protégé du CDTPI | Isle | 05 55 49 10 00 |
| 87 | Atelier protégé / entreprise adaptée | Atelier protégé informatique internet et communication | Oradour Saint Genest | 05 55 60 61 02 |
| 87 | Atelier protégé / entreprise adaptée | Atelier protégé STS | Limoges 9 | 05 55 37 78 82 |
| 87 | Atelier protégé / entreprise adaptée | Entreprise adaptée ARAI | Saint Laurent les Églises | 05 55 56 58 92 |
| 87 | Atelier protégé / entreprise adaptée | Entreprise adaptée les Jardins de Fougeras | Limoges | 05 55 35 49 50 |
| 87 | Atelier protégé / entreprise adaptée | IDEA Limousin | Boisseuil | 05 55 30 52 30 |
| 24 | ESAT | ESAT Bertran de Born | Salagnac | 05 53 62 23 00 |
| 24 | ESAT | Établissement et service d'aide par le travail de Prats de Carlux | Prats de Carlux | 05 53 28 63 20 |
| 24 | ESAT | Établissement et service d'aide par le travail OSEA | Trélissac | 05 53 54 46 49 |
| 24 | ESAT | Établissement et service d'aide par le travail OSEA : Antonne | Antonne et Trigonant | 05 53 54 46 49 |
| 24 | ESAT | Établissement et service d'aide par le travail OSEA : Saint : Astier | Saint Astier | 05 53 54 46 49 |
| 24 | ESAT | Établissement et service d'aide par le travail OSEA : Tocane : Saint : Apre | Tocane Saint Apre | 05 53 54 46 49 |
| 87 | ESAT | Centre d'aide par le travail Andre Chevalier Bellac | Bellac | 05 55 60 93 40 |
| 87 | ESAT | ESAT ARAI | Saint Laurent les Églises | 05 55 56 58 92 |
| 87 | ESAT | ESAT CDTPI : site de Glandon | Glandon | 05 55 49 10 00 |
| 87 | ESAT | ESAT la Ribière | Limoges | 05 55 70 79 60 |
| 87 | ESAT | ESAT Trisomie 21 hors les murs 87 | Limoges | 05 55 34 43 17 |
| 87 | ESAT | Établissement et service d'aide par le travail | Isle | 05 55 49 10 00 |
| 87 | ESAT | Établissement et service d'aide par le travail de l'APSAH | Limoges 2 | 05 55 77 14 23 |
| 87 | ESAT | Établissement et service d'aide par le travail Eymoutiers | Eymoutiers | 05 55 69 22 96 |
| 87 | ESAT | Établissement et service d'aide par le travail L'Envol | Limoges | 05 55 32 06 15 |
| 87 | ESAT | Établissement et service d'aide par le travail les Seilles | Saint Junien | 05 55 43 83 40 |
| 87 | ESAT | Établissement service aide par le travail insertion Delta + | Limoges | 05 55 35 49 50 |
| 24 | Pré-orientation (ESPO) | ESPO de Clairvivre : antenne de Boulazac | Boulazac Isle Manoire | non indiqué |
| 24 | Pré-orientation (ESPO) | Établissement et service de pré orientation Clairvivre | Salagnac | 05 53 62 23 00 |
| 24 | Réadaptation professionnelle (ESRP) | ESRP de Clairvivre : antenne Boulazac | Boulazac Isle Manoire | non indiqué |
| 24 | Réadaptation professionnelle (ESRP) | Établissement et service de réadaptation professionnelle de Clairvivre | Salagnac | 05 53 62 23 00 |
| 87 | Réadaptation professionnelle (ESRP) | ESPR : IFMK déficients Visuels APSAH | Limoges | 05 55 33 10 10 |
| 87 | Réadaptation professionnelle (ESRP) | ESRP EPNAK 87 | Limoges 1 | 05 55 33 56 07 |
| 87 | Réentraînement et orientation sociale et professionnelle | Unite évaluation réentraînement et orientation sociale professionnelle | Limoges 1 | 05 55 43 11 85 |

## Les 9 qui ressemblent à une fiche existante

| Établissement du fichier FINESS | Fiche proche déjà au registre ou au sas |
| --- | --- |
| CeGIDD 24 : Périgueux (Périgueux) | CeGIDD du centre hospitalier de Périgueux, Périgueux |
| Maison relais résidence accueil Bergerac (Bergerac) | Point d'accueil numérique - Bergerac (Sous-préfecture), Bergerac |
| Maison relais résidence accueil de Périgueux (Périgueux) | Maison d'arrêt de Périgueux, Périgueux |
| Maison relais résidence accueil Sarlat (Sarlat-la-Canéda) | Point d'accueil numérique - Sarlat-la-Canéda (Sous-préfecture), Sarlat-la-Canéda |
| CHRS Cité Béthanie (Bergerac) | Cité Béthanie - CHRS, Bergerac |
| CADA Eymoutiers : Adoma (Eymoutiers) | Adoma - Centre d'accueil pour demandeurs d'asile d'Eymoutiers, Eymoutiers |
| Centre régional d'examens de santé du Limousin : site de Limoges (Limoges) | ENVIE (site de Limoges), Limoges |
| ARSL hébergement urgence (Limoges) | ARSL - Hébergement & Logement, Panazol |
| Association interprofessionnelle pour la santé au travail 87 (Limoges) | MSA du Limousin - Santé Sécurité au Travail, Limoges |

Plusieurs sont de vrais doublons (CHRS Cité Béthanie, CADA d'Eymoutiers, CeGIDD de Périgueux, ARSL). D'autres sont de fausses alertes (une « maison relais » rapprochée d'une « maison d'arrêt » à cause du mot « maison ») : dans l'onglet, c'est vous qui trancheriez, comme pour les fiches orange.

## Les 40 déjà connues

Reconnues par le téléphone ou le nom : elles sont déjà dans votre registre ou dans le sas, rien à faire. Cela confirme que votre base couvre déjà bien ces catégories (40 sur 140, soit 29 %).

## Source

Fichier « FINESS structures » journalier du 12/11/2026, ministère de la Santé (ANS), publié sur data.gouv.fr sous Licence Ouverte 2.0.
