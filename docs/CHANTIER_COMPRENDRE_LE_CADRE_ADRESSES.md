# Chantier complément « Comprendre le cadre » : dater les adresses (paquets B et C)

> Créé le 2026-09-06. Décision de Denis : les paquets B et C (adresses non
> encore datées dans `liens-verifies.txt`) sont regroupés dans un **chantier
> complément** de « Comprendre le cadre », à faire **après** l'extraction et
> l'implémentation du module « Comprendre les chiffres ».

---

## 1. De quoi il s'agit

Chaque fiche de « Comprendre le cadre » cite ses sources officielles en pied de
page, et l'écran « Près de chez moi » liste des structures « à qui s'adresser ».

**Règle (leçon 9.16)** : une adresse ne devient un **lien cliquable** que si sa
3e colonne dans `modules/comprendre-le-cadre/liens-verifies.txt` porte une
**date de vérification** (`AAAA-MM-JJ`). Tant que la colonne est vide, l'adresse
s'affiche en texte simple avec la mention « adresse pas encore vérifiée ».

Rien n'est cassé : le module fonctionne, les fiches s'affichent. Dater ces
adresses est un travail de **finition** qui rend les liens officiels cliquables.

### Le fichier unique où tout se trouve

**`modules/comprendre-le-cadre/liens-verifies.txt`** - c'est LE fichier, le
seul, celui qu'on édite. Il est déjà organisé par rayon, et dans chaque rayon
deux blocs sont séparés par des commentaires :

- en tête de chaque `# --- Rayon « X » ---` : les **sources documentaires** des
  fiches → **paquet B** ;
- `# Rayon « X » : structures « à qui s'adresser »` : les **structures** de
  l'écran « Près de chez moi » → **paquet C**.

Ce présent document n'est qu'une **vue lisible** de ce fichier à un instant T
(2026-09-06). En cas de doute, le fichier fait foi.

---

## 2. Ce qui est déjà daté (rappel)

- Pendant la vérification des 14 rayons + le paquet A : **~130 adresses** ouvertes
  et datées (service-public.gouv.fr, solidarites.gouv.fr, unedic.org,
  securite-routiere.gouv.fr, entreprendre.service-public.gouv.fr, anlci.gouv.fr,
  mon-cep.org, justice.gouv.fr, 1jeune1solution.gouv.fr…).
- 2 pages fausses corrigées au passage : `aide-alimentaire` (pointait sur une
  page chômage) → `solidarites-precarite-alimentaire` ; `115-siao` (pointait sur
  la page APL) → DIHAL.

---

## 3. Paquet B - sources documentaires non datées (94 entrées)

Ce sont les adresses citées comme **sources** dans le pied des fiches.
**67** sont sur des sites qui **bloquent la lecture automatique** (c'est
pour ça que je n'ai pas pu les dater) ; **27** s'ouvrent normalement même
avec un outil et pourraient être datées plus vite.

> **Avancement 2026-09-06 - paquet B terminé.** 27 ouvrables + `enic-naric` /
> `france-education-international-enic-naric` (`49e4e55`, `12ea41b`), puis Denis a
> ouvert au navigateur toutes les sources bloquées en deux passes (53 + 9), datées
> `2026-09-06` (4 URL corrigées à la 2e passe). **89/93 datées.** Restent **4
> adresses mortes (404 réel)** : `francetravail-accompagnement-global` / `-intensif`
> et `interieur-cir-formation-linguistique` / `interieur-parcours-linguistique-au-dela-cir`
> - leur remplacement touche les fiches qui les citent = décision de contenu.
> Détail : **`docs/PAQUET_B_BLOQUE_A_DATER.md`**. La liste ci-dessous (groupée par
> rayon) reste une vue de référence.

**Sites qui bloquent** : travail-emploi.gouv.fr, francetravail.fr,
mes-aides.francetravail.fr, banque-france.fr, caf.fr, legifrance.gouv.fr,
immigration.interieur.gouv.fr, interieur.gouv.fr, transitionspro.fr,
monenfant.fr, education.gouv.fr / eduscol, ac-bordeaux.fr, ecologie.gouv.fr,
economie.gouv.fr, info.gouv.fr, france-education-international.fr, urssaf.fr,
ants.gouv.fr, ofii.fr, primealaconversion.gouv.fr.

#### Liste générale (en-tête du fichier)

- `legifrance` | https://www.legifrance.gouv.fr/ | portée `national` | **site qui bloque les robots**
- `service-public` | https://www.service-public.fr/ | portée `national`
- `ministere-travail` | https://travail-emploi.gouv.fr/ | portée `national` | **site qui bloque les robots**
- `bo-travail` | https://travail-emploi.gouv.fr/publications/bo-travail | portée `national` | **site qui bloque les robots**
- `interieur-etrangers` | https://www.interieur.gouv.fr/Immigration | portée `national` | **site qui bloque les robots**
- `enic-naric` | https://www.enic-naric.fr/ | portée `national`
- `france-competences` | https://www.francecompetences.fr/ | portée `national`
- `centre-inffo` | https://www.centre-inffo.fr/ | portée `national`
- `insee` | https://www.insee.fr/fr/statistiques | portée `national`
- `dares` | https://dares.travail-emploi.gouv.fr/ | portée `national` | **site qui bloque les robots**
- `france-travail-stats` | https://www.francetravail.org/statistiques-analyses/ | portée `national`
- `france-travail-bmo` | https://statistiques.francetravail.org/bmo | portée `national`
- `cap-metiers` | https://pro.cap-metiers.fr/observer-analyser/si-terr/ | portée `region`
- `transitions-pro` | https://www.transitionspro.fr/ | portée `national` | **site qui bloque les robots**
- `observatoire-territoires` | https://www.observatoire-des-territoires.gouv.fr/ | portée `national`
- `caf` | https://www.caf.fr/allocataires/aides-et-demarches/droits-et-prestations | portée `national` | **site qui bloque les robots**
- `service-civique` | https://www.service-civique.gouv.fr/ | portée `national`
- `agefiph` | https://www.agefiph.fr/ | portée `national`

#### Venir de l'étranger

- `france-education-international-enic-naric` | https://www.france-education-international.fr/expertises/enic-naric | portée `national` | **site qui bloque les robots**
- `interieur-examen-civique` | https://www.interieur.gouv.fr/actualites/communiques-de-presse/a-partir-du-1er-janvier-2026-reussite-a-lexamen-civique-sera-necessaire-pour-obtenir-carte-de-sejour | portée `national` | **site qui bloque les robots**
- `ofii-accueil-integration` | https://www.ofii.fr/procedure/accueil-integration/ | portée `national` | **site qui bloque les robots**
- `immigration-interieur-protection-internationale` | https://www.immigration.interieur.gouv.fr/limmigration-en-france/sejour-des-etrangers/beneficiaires-de-protection-internationale | portée `national` | **site qui bloque les robots**
- `legifrance-ceseda-admission-exceptionnelle` | https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006070158/LEGISCTA000042772028/ | portée `national` | **site qui bloque les robots**
- `interieur-metiers-en-tension` | https://www.immigration.interieur.gouv.fr/limmigration-en-france/sejour-des-etrangers/liste-des-metiers-en-tension-pour-travailleurs-etrangers | portée `national` | **site qui bloque les robots**

#### Budget, dettes, droits sociaux

- `banque-france-procedure-surendettement` | https://www.banque-france.fr/fr/a-votre-service/intervenants-sociaux/comprendre-procedure-surendettement | portée `national` | **site qui bloque les robots**
- `banque-france-detail-procedure-surendettement` | https://www.banque-france.fr/fr/detail-de-la-procedure-de-surendettement | portée `national` | **site qui bloque les robots**
- `caf-rsa-prime-activite` | https://www.caf.fr/allocataires/aides-et-demarches/ma-situation/vie-professionnelle/je-beneficie-du-rsa-et-je-souhaite-la-prime-d-activite | portée `national` | **site qui bloque les robots**
- `banque-france-microcredit` | https://www.banque-france.fr/fr/a-votre-service/particuliers/connaitre-pratiques-bancaires-assurance/credit/microcredit | portée `national` | **site qui bloque les robots**
- `banque-france-ficp` | https://www.banque-france.fr/fr/a-votre-service/particuliers/fichiers-incident-bancaire/fichier-incidents-remboursement-credits | portée `national` | **site qui bloque les robots**
- `banque-france-droit-au-compte` | https://www.banque-france.fr/fr/a-votre-service/particuliers/droit-au-compte-bancaire | portée `national` | **site qui bloque les robots**

#### Mobilité

- `mes-aides-france-travail-mobilite` | https://mes-aides.francetravail.fr/transport | portée `national` | **site qui bloque les robots**
- `ecologie-aides-vehicules-peu-polluants` | https://www.ecologie.gouv.fr/politiques-publiques/prime-retrofit-bonus-ecologique-toutes-aides-faveur-lacquisition-vehicules | portée `national` | **site qui bloque les robots**
- `primealaconversion-leasing-social-2026` | https://www.primealaconversion.gouv.fr/dboneco/accueil/leasingsocial2026.html | portée `national` | **site qui bloque les robots**
- `transports-nouvelle-aquitaine-carte-solidaire` | https://transports.nouvelle-aquitaine.fr/les-offres/la-carte-solidaire | portée `region`
- `transports-nouvelle-aquitaine-tad` | https://transports.nouvelle-aquitaine.fr/transports-la-demande | portée `region`

#### Logement

- `dihal-aller-vers-accueils-de-jour-maraudes` | https://www.info.gouv.fr/organisation/delegation-interministerielle-a-l-hebergement-et-a-l-acces-au-logement/aller-vers-les-accueils-de-jour-les-maraudes | portée `national` | **site qui bloque les robots**
- `dihal-115-siao` | https://www.info.gouv.fr/organisation/delegation-interministerielle-a-l-hebergement-et-a-l-acces-au-logement | portée `national` | **site qui bloque les robots**

#### Se former et se reconvertir

- `moncompteformation` | https://www.moncompteformation.gouv.fr/ | portée `national`
- `francetravail-poei` | https://www.francetravail.fr/employeur/aides-aux-recrutements/les-aides-a-la-formation/la-preparation-operationnelle-a.html | portée `national` | **site qui bloque les robots**
- `francetravail-poec` | https://www.francetravail.fr/candidat/en-formation/mes-aides-financieres/la-preparation-operationnelle-1.html | portée `national` | **site qui bloque les robots**
- `france-vae` | https://france-vae.fr/ | portée `national`
- `transitionspro-demission-reconversion` | https://www.transitionspro.fr/nos-dispositifs/demission-reconversion/ | portée `national` | **site qui bloque les robots**
- `transitionspro-ptp` | https://www.transitionspro.fr/nos-dispositifs/projet-de-transition-professionnelle/ | portée `national` | **site qui bloque les robots**
- `francetravail-demission-reconversion` | https://www.francetravail.fr/candidat/mes-droits-aux-aides-et-allocati/a-chaque-situation-son-allocatio/quelle-est-ma-situation-professi/je-perds-ou-je-quitte-un-emploi/je-veux-demissionner-et-jai-un-p.html | portée `national` | **site qui bloque les robots**

#### Emploi et contrats

- `travail-emploi-rupture-conventionnelle` | https://travail-emploi.gouv.fr/la-rupture-conventionnelle-du-contrat-de-travail-duree-indeterminee | portée `national` | **site qui bloque les robots**
- `travail-emploi-pec` | https://travail-emploi.gouv.fr/le-parcours-emploi-competences-pec | portée `national` | **site qui bloque les robots**
- `francetravail-cdd-tremplin` | https://www.francetravail.fr/candidat/handicap-et-talents/a-la-une/handicap-inserez-vous-dans-le-mo.html | portée `national` | **site qui bloque les robots**

#### Accompagnement et structures de l'insertion

- `francetravail-contrat-engagement` | https://www.francetravail.fr/candidat/france-travail-et-vous/contrat-d-engagement.html | portée `national` | **site qui bloque les robots**
- `travail-emploi-bareme-sanctions` | https://travail-emploi.gouv.fr/nouveau-bareme-de-sanctions-en-cas-de-manquement-aux-obligations-du-contrat-dengagement-des-demandeurs-demploi | portée `national` | **site qui bloque les robots**
- `travail-emploi-accompagnement-renove-rsa` | https://travail-emploi.gouv.fr/laccompagnement-renove-des-allocataires-du-rsa | portée `national` | **site qui bloque les robots**
- `travail-emploi-loi-plein-emploi` | https://travail-emploi.gouv.fr/la-loi-pour-le-plein-emploi | portée `national` | **site qui bloque les robots**
- `francetravail-accompagnement-global` | https://www.francetravail.fr/candidat/france-travail-vous-accompagne/ | portée `national` | **site qui bloque les robots**
- `francetravail-accompagnement-intensif` | https://www.francetravail.fr/candidat/france-travail-vous-accompagne/ | portée `national` | **site qui bloque les robots**
- `plateforme-inclusion-emplois` | https://emplois.inclusion.beta.gouv.fr/ | portée `national`
- `economie-clauses-sociales` | https://www.economie.gouv.fr/daj/guide-aspects-sociaux-cp | portée `national` | **site qui bloque les robots**
- `travail-emploi-o2r` | https://travail-emploi.gouv.fr/ | portée `national` | **site qui bloque les robots**

#### Handicap et emploi

- `travail-emploi-droits-travailleurs-handicapes` | https://travail-emploi.gouv.fr/emploi/handicap/droits-des-travailleurs-en-situation-de-handicap | portée `national` | **site qui bloque les robots**
- `travail-emploi-reclassement-inaptitude` | https://travail-emploi.gouv.fr/quest-ce-quun-reclassement-et-quel-moment-suis-je-concerne | portée `national` | **site qui bloque les robots**
- `travail-emploi-cap-emploi` | https://travail-emploi.gouv.fr/cap-emploi | portée `national` | **site qui bloque les robots**

#### Moins de 26 ans

- `travail-emploi-prepa-apprentissage` | https://travail-emploi.gouv.fr/la-prepa-apprentissage | portée `national` | **site qui bloque les robots**
- `travail-emploi-ecoles-de-production` | https://travail-emploi.gouv.fr/IMG/pdf/ecoles_de_production.pdf | portée `national` | **site qui bloque les robots**

#### Créer son activité

- `urssaf-autoentrepreneur-essentiel` | https://www.autoentrepreneur.urssaf.fr/portail/accueil/sinformer-sur-le-statut/lessentiel-du-statut.html | portée `national` | **site qui bloque les robots**
- `urssaf-seuils-2026` | https://www.autoentrepreneur.urssaf.fr/portail/accueil/sinformer-sur-le-statut/toutes-les-actualites/2026--modification-des-seuils-de.html | portée `national` | **site qui bloque les robots**
- `entreprendre-franchise-tva` | https://entreprendre.service-public.gouv.fr/vosdroits/F21746 | portée `national`
- `les-cae-coop` | https://www.les-cae.coop/ | portée `national`
- `francetravail-creer-entreprise` | https://www.francetravail.fr/candidat/je-creereprends-une-entreprise/les-aides-financieres-creation-d.html | portée `national` | **site qui bloque les robots**
- `bpifrance-creation` | https://bpifrance-creation.fr/ | portée `national`

#### Justice : sortie de détention

- `justice-fr-amenagements-de-peine` | https://www.justice.fr/mon-suivi-justice/comprendre-ma-peine/amenagements-peine | portée `national`

#### Garde d'enfant

- `solidarites-cmg` | https://solidarites.gouv.fr/complement-de-libre-choix-du-mode-de-garde | portée `national`
- `legifrance-decret-2025-515-cmg` | https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000051714530 | portée `national` | **site qui bloque les robots**
- `urssaf-evolution-cmg` | https://www.urssaf.fr/accueil/actualites/evolution-cmg-ce-qui-va-changer.html | portée `national` | **site qui bloque les robots**
- `caf-cmg-evolue` | https://www.caf.fr/professionnels/actualites/le-complement-de-libre-choix-du-mode-de-garde-cmg-evolue | portée `national` | **site qui bloque les robots**
- `francetravail-age-formation` | https://www.francetravail.fr/candidat/en-formation/les-dispositifs/formation---laide-a-la-garde-den.html | portée `national` | **site qui bloque les robots**
- `francetravail-age-faq` | https://www.francetravail.fr/faq/candidat/mes-allocations---mes-aides/les-aides/pour-la-garde-denfants/agepi.html | portée `national` | **site qui bloque les robots**
- `solidarites-agepi` | https://mes-aides.francetravail.fr/famille-et-vie-quotidienne/faire-garder-mes-enfants/france-travail/aide-a-la-garde-d-enfantsage | portée `national` | **site qui bloque les robots**
- `solidarites-avip` | https://solidarites.gouv.fr/les-creches-vocation-dinsertion-professionnelle-avip | portée `national`
- `caf-avip` | https://www.caf.fr/professionnels/actualites/les-creches-vocation-d-insertion-professionnelle-avip | portée `national` | **site qui bloque les robots**
- `monenfant-aides` | https://monenfant.fr/des-aides-sp%C3%A9cifiques-pour-la-garde-du-jeune-enfant | portée `national` | **site qui bloque les robots**
- `monenfant-rpe` | https://monenfant.fr/les-relais-petite-enfance | portée `national` | **site qui bloque les robots**
- `solidarites-choisir-mode-accueil` | https://solidarites.gouv.fr/comment-choisir-un-mode-daccueil-pour-son-enfant | portée `national`
- `caf-rpe` | https://www.caf.fr/allocataires/aides-et-demarches/thematique-libre/relais-petite-enfance-rpe | portée `national` | **site qui bloque les robots**
- `mesdroitssociaux-simulateur-cmg` | https://www.mesdroitssociaux.gouv.fr/votre-simulateur/complement-mode-de-garde/ | portée `national`

#### Apprendre le français

- `interieur-cir-formation-linguistique` | https://www.immigration.interieur.gouv.fr/Integration-et-Acces-a-la-nationalite/Le-parcours-d-integration-republicaine/Le-contrat-d-integration-republicaine-CIR/La-formation-linguistique | portée `national` | **site qui bloque les robots**
- `interieur-parcours-linguistique-au-dela-cir` | https://www.immigration.interieur.gouv.fr/fr/Integration-et-Acces-a-la-nationalite/Le-parcours-d-integration-republicaine/Au-dela-du-contrat-d-integration-republicaine-CIR/Le-parcours-linguistique-au-dela-du-CIR | portée `national` | **site qui bloque les robots**
- `interieur-oepre` | https://www.immigration.interieur.gouv.fr/lintegration-des-etrangers/dispositifs-de-lintegration-en-france/ouvrir-lecole-aux-parents-pour-reussite-des-enfants | portée `national` | **site qui bloque les robots**
- `eduscol-oepre` | https://eduscol.education.gouv.fr/5103/ouvrir-l-ecole-aux-parents-pour-la-reussite-des-enfants | portée `national` | **site qui bloque les robots**
- `education-circulaire-oepre-2025` | https://www.education.gouv.fr/bo/2025/Hebdo38/MENE2525824C | portée `national` | **site qui bloque les robots**
- `anlci-accueil` | https://www.anlci.gouv.fr/ | portée `national`
- `francetravail-cpf-aif-poec` | https://www.francetravail.fr/actualites/a-laffiche/2026/cpf-aif-poec-quel-financement.html | portée `national` | **site qui bloque les robots**
- `fei-diplomes-tests` | https://www.france-education-international.fr/hub/diplomes-tests | portée `national` | **site qui bloque les robots**
- `fei-centres-examen` | https://www.france-education-international.fr/centres-d-examen/carte | portée `national` | **site qui bloque les robots**

#### Questions juridiques

- `aidejuridictionnelle-simulateur` | https://www.aidejuridictionnelle.justice.fr/simulateur | portée `national`
- `francetravail-recours-discrimination` | https://www.francetravail.fr/candidat/vos-recherches/preparer-votre-candidature/accompagne-dans-sa-recherche/les-recours-en-cas-de-discrimina.html | portée `national` | **site qui bloque les robots**
- `justice-fr-annuaires` | https://www.justice.fr/ | portée `national`

---

## 4. Paquet C - structures « à qui s'adresser » non datées (100 entrées)

Ce sont les structures listées dans l'écran « Près de chez moi » de chaque rayon.
**Recommandation forte** : ce paquet n'est PAS un chantier séparé. Il se traite
**avec le chantier territoire** (`docs/CHANTIER_TERRITOIRE_REGION_DEPARTEMENT.md`)
 - on valide la portée d'une structure (24 / région / national) et on la date
**dans le même geste**. Les faire séparément = ouvrir deux fois les mêmes pages.

Quelques adresses pointent encore vers un site national là où il faudrait du
local (`mission-locale-perigord`, `adil-dordogne`, `mdph-dordogne`,
`habitat-jeunes-perigord`, plusieurs `justice.fr`…) ou vers un domaine à
revérifier (`msa-dordogne.fr`, `presanse-aquitaine.org`) : à corriger au moment
du tag de portée.

#### Venir de l'étranger

- `prefecture-dordogne-etrangers` | https://www.dordogne.gouv.fr/ | portée `24`
- `anef-etrangers` | https://administration-etrangers-en-france.interieur.gouv.fr/ | portée `national` | **site qui bloque les robots**
- `ofii-direction-territoriale-bordeaux` | https://www.ofii.fr/ | portée `region` | **site qui bloque les robots**
- `enic-naric-france` | https://www.france-education-international.fr/expertises/enic-naric | portée `national` | **site qui bloque les robots**
- `ants-permis` | https://ants.gouv.fr/ | portée `national` | **site qui bloque les robots**
- `cdad-dordogne-points-justice` | https://www.justice.fr/ | portée `24`
- `cimade-nouvelle-aquitaine` | https://www.lacimade.org/ | portée `region`
- `spada-dordogne` | https://www.demarches.interieur.gouv.fr/particuliers/demande-asile | portée `24` | **site qui bloque les robots**

#### Budget, dettes, droits sociaux

- `point-conseil-budget-annuaire` | https://lannuaire.service-public.gouv.fr/navigation/pcb | portée `national`
- `mesquestionsdargent-pcb` | https://www.mesquestionsdargent.fr/ | portée `national`
- `banque-france-succursales` | https://www.banque-france.fr/fr/la-banque-de-france/organisation/le-reseau-de-la-banque-de-france | portée `national` | **site qui bloque les robots**
- `ccas-mairie` | https://lannuaire.service-public.gouv.fr/navigation/ccas | portée `national`
- `conseil-departemental-dordogne-insertion` | https://www.dordogne.fr/ | portée `24`
- `caf-dordogne` | https://www.caf.fr/allocataires/caf-de-la-dordogne | portée `24` | **site qui bloque les robots**
- `msa-dordogne-lot-et-garonne` | https://www.msa-dordogne.fr/ | portée `24`
- `udaf-dordogne` | https://www.udaf24.fr/ | portée `24`
- `cresus-nouvelle-aquitaine` | https://www.cresus.org/ | portée `region`
- `croix-rouge-secours-catholique-microcredit` | https://www.france-microcredit.org/ | portée `national`
- `restos-du-coeur-aide-alimentaire` | https://www.restosducoeur.org/nos-actions/aide-alimentaire/ | portée `national`
- `restos-du-coeur-dordogne` | https://ad24.restosducoeur.org/ | portée `24`
- `banque-alimentaire-dordogne` | https://www.banquealimentaire.org/ | portée `24`
- `secours-populaire-dordogne` | https://www.secourspopulaire.fr/ | portée `24`
- `epiceries-sociales-solidaires` | https://www.andes-france.com/ | portée `national`

#### Mobilité

- `mes-aides-france-travail` | https://mes-aides.francetravail.fr/ | portée `national` | **site qui bloque les robots**
- `france-mobilites-solutions` | https://www.francemobilites.fr/ | portée `national`
- `plateforme-mobilite-dordogne` | https://mes-aides.francetravail.fr/regions/nouvelle-aquitaine | portée `24` | **site qui bloque les robots**
- `conseil-regional-nouvelle-aquitaine-transports` | https://transports.nouvelle-aquitaine.fr/ | portée `region`
- `covoit-modalis` | https://www.modalis.fr/ | portée `region`
- `conseil-departemental-dordogne-mobilite` | https://www.dordogne.fr/ | portée `24`
- `mission-locale-perigord` | https://www.mission-locale.fr/ | portée `24`
- `auto-ecoles-associatives-sociales` | https://mes-aides.francetravail.fr/mobilite | portée `national` | **site qui bloque les robots**

#### Logement

- `115-samu-social` | https://www.info.gouv.fr/organisation/delegation-interministerielle-a-l-hebergement-et-a-l-acces-au-logement | portée `national` | **site qui bloque les robots**
- `siao-dordogne` | https://annuaire.action-sociale.org/ | portée `24`
- `accueils-de-jour-dordogne` | https://annuaire.action-sociale.org/ | portée `24`
- `ccas-domiciliation` | https://lannuaire.service-public.gouv.fr/navigation/ccas | portée `national`
- `conseil-departemental-dordogne-action-sociale` | https://www.dordogne.fr/ | portée `24`
- `actionlogement-garantie-visale` | https://www.actionlogement.fr/la-garantie-visale | portée `national`
- `actionlogement-avance-loca-pass` | https://www.actionlogement.fr/l-avance-loca-pass | portée `national`
- `conseil-departemental-dordogne-fsl` | https://www.dordogne.fr/ | portée `24`
- `adil-dordogne` | https://www.anil.org/qui-sommes-nous/reseau-des-adil/ | portée `24`
- `action-logement-nouvelle-aquitaine` | https://www.actionlogement.fr/ | portée `region`
- `caf-dordogne-logement` | https://www.caf.fr/allocataires/caf-de-la-dordogne | portée `24` | **site qui bloque les robots**
- `prefecture-dordogne-dalo` | https://www.dordogne.gouv.fr/ | portée `24`
- `habitat-jeunes-perigord` | https://www.habitatjeunes.org/ | portée `24`

#### Se former et se reconvertir

- `mon-cep-operateur-nouvelle-aquitaine` | https://mon-cep.org/ | portée `region`
- `transitions-pro-nouvelle-aquitaine` | https://www.transitionspro-na.fr/ | portée `region`
- `apec` | https://www.apec.fr/ | portée `national`
- `france-travail-formation` | https://www.francetravail.fr/ | portée `national` | **site qui bloque les robots**
- `conseil-regional-nouvelle-aquitaine-formation` | https://www.nouvelle-aquitaine.fr/ | portée `region`
- `france-vae-point-relais-conseil` | https://france-vae.fr/ | portée `region`
- `afpa-greta-cnam-dordogne` | https://www.afpa.fr/ | portée `24`

#### Emploi et contrats

- `france-travail` | https://www.francetravail.fr/ | portée `national` | **site qui bloque les robots**
- `inspection-du-travail-ddets-dordogne` | https://nouvelle-aquitaine.dreets.gouv.fr/ | portée `24`
- `conseil-de-prud-hommes-perigueux-bergerac` | https://www.justice.fr/ | portée `24`
- `structures-iae-dordogne` | https://emplois.inclusion.beta.gouv.fr/ | portée `24`
- `cap-emploi-dordogne` | https://www.capemploi.fr/ | portée `24`

#### Accompagnement et structures de l'insertion

- `mission-locale-perigord` | https://www.unml.info/ | portée `24`
- `conseil-departemental-dordogne-insertion` | https://www.dordogne.fr/ | portée `24`
- `plie-et-maison-emploi-dordogne` | https://www.ville-emploi.asso.fr/annuaire-du-reseau | portée `24`

#### Handicap et emploi

- `mdph-dordogne` | https://www.dordogne.fr/ | portée `24`
- `agefiph-delegation-nouvelle-aquitaine` | https://www.agefiph.fr/ | portée `region`
- `medecine-du-travail-service-prevention-sante` | https://www.presanse-aquitaine.org/ | portée `24`
- `entreprises-adaptees-esat-dordogne` | https://annuaire.action-sociale.org/ | portée `24`

#### Moins de 26 ans

- `france-travail-jeunes-dordogne` | https://www.francetravail.fr/candidat/jeunes.html | portée `24` | **site qui bloque les robots**
- `e2c-perigueux` | https://reseau-e2c.fr/ | portée `24`
- `epide-nouvelle-aquitaine` | https://www.epide.fr/ | portée `region`
- `agence-service-civique` | https://www.service-civique.gouv.fr/trouver-ma-mission | portée `national`
- `psad-plateforme-suivi-appui-decrocheurs-dordogne` | https://www.education.gouv.fr/ | portée `24` | **site qui bloque les robots**

#### Créer son activité

- `chambre-metiers-artisanat-dordogne` | https://www.artisanat.fr/ | portée `24`
- `cci-dordogne` | https://www.dordogne.cci.fr/ | portée `24`
- `bge-perigord` | https://www.bge.asso.fr/ | portée `24`
- `adie-nouvelle-aquitaine` | https://www.adie.org/ | portée `region`
- `initiative-perigord` | https://initiative-france.fr/ | portée `24`
- `france-active-nouvelle-aquitaine` | https://www.franceactive.org/ | portée `region`
- `cooperative-activite-emploi-dordogne` | https://www.les-cae.coop/trouver-une-cae | portée `24`

#### Justice : sortie de détention

- `spip-dordogne` | https://www.justice.gouv.fr/annuaire/structures-reinsertion-demploi/services-penitentiaires-dinsertion-probation-spip | portée `24`
- `associations-post-sentencielles-dordogne` | https://www.justice.gouv.fr/annuaire | portée `24`

#### Garde d'enfant

- `relais-petite-enfance` | https://monenfant.fr/les-relais-petite-enfance | portée `national` | **site qui bloque les robots**
- `caf-dordogne` | https://www.caf.fr/allocataires/caf-de-la-dordogne | portée `24` | **site qui bloque les robots**
- `pmi-dordogne` | https://www.dordogne.fr/ | portée `24`
- `france-travail-garde` | https://www.francetravail.fr/ | portée `national` | **site qui bloque les robots**
- `monenfant-annuaire` | https://monenfant.fr/ | portée `national` | **site qui bloque les robots**
- `ccas-commune` | https://lannuaire.service-public.gouv.fr/ | portée `national`
- `mission-locale-perigord` | https://www.mission-locale.fr/ | portée `24`
- `pajemploi-urssaf` | https://www.pajemploi.urssaf.fr/ | portée `national` | **site qui bloque les robots**

#### Apprendre le français

- `ofii-nouvelle-aquitaine` | https://www.ofii.fr/ | portée `region` | **site qui bloque les robots**
- `centres-sociaux-dordogne` | https://www.centres-sociaux.fr/ | portée `24`
- `cd24-service-social` | https://www.dordogne.fr/ | portée `24`
- `france-travail-formation-francais` | https://www.francetravail.fr/ | portée `national` | **site qui bloque les robots**
- `region-nouvelle-aquitaine-savoirs-de-base` | https://www.nouvelle-aquitaine.fr/ | portée `region`
- `etablissements-scolaires-oepre` | https://www.ac-bordeaux.fr/ | portée `24` | **site qui bloque les robots**
- `cimade-perigueux` | https://www.lacimade.org/ | portée `24`
- `centres-examen-delf-dordogne` | https://www.france-education-international.fr/centres-d-examen/carte | portée `24` | **site qui bloque les robots**

#### Questions juridiques

- `point-justice-dordogne` | https://www.justice.fr/ | portée `24`
- `cdad-dordogne` | https://www.justice.fr/ | portée `24`
- `bureau-aide-juridictionnelle-perigueux` | https://www.justice.fr/ | portée `24`
- `conseil-prudhommes-perigueux-bergerac` | https://www.justice.fr/ | portée `24`
- `dreets-inspection-travail-dordogne` | https://nouvelle-aquitaine.dreets.gouv.fr/ | portée `24`
- `france-victimes-dordogne` | https://www.france-victimes.fr/ | portée `24`
- `ordre-avocats-perigueux` | https://www.justice.fr/ | portée `24`

---

## 5. Comment faire (procédure)

Pour chaque ligne à traiter dans `modules/comprendre-le-cadre/liens-verifies.txt` :

1. Ouvrir l'URL (3e champ vide) dans un vrai navigateur.
2. Vérifier qu'elle pointe bien au bon endroit (bon sujet, page pas déplacée ni
   morte).
3. Si c'est bon : écrire la date du jour dans la **3e colonne**, format
   `AAAA-MM-JJ`. Si la page a bougé : corriger l'URL (2e colonne) puis dater.
   Pour le paquet C : renseigner aussi la **4e colonne** (portée : `national`,
   `region`, `24` ou `87`).
4. Enregistrer. Le lien devient cliquable en pied de fiche automatiquement  - 
   aucun code, aucune recompilation.

Format d'une ligne : `nom-court | adresse | date | portée`.

Procédure aussi notée dans `outils/veille.html`, section « Déposer dans le dépôt ».

---

## 6. Ordre recommandé (réponse à la question de Denis)

**Recommandation : « Comprendre les chiffres » d'abord, ce chantier ensuite.**

| | Bénéfice | Risque / coût |
|---|---|---|
| **Chiffres d'abord** (recommandé) | Vrai module, vraie valeur pour l'usager, débloque le digest « Chiffres » de la veille et la destination « Chiffres » de l'import manuel. Les adresses ne bloquent rien en attendant. | Les sources restent affichées en texte non cliquable quelques semaines de plus (impact usager faible : on clique rarement une source, c'est un signe de sérieux, pas une fonction). |
| **Adresses d'abord** | Les pieds de fiche deviennent « propres » plus tôt. | Du budget et de l'énergie dépensés sur de la finition à faible valeur, le vrai module repoussé d'autant. Le paquet C serait de toute façon à refaire avec le chantier territoire. |

**En clair :**
- **Paquet C** → ne pas en faire un chantier. Le fondre dans le **chantier
  territoire** (tag de portée + date dans le même geste).
- **Paquet B** → ~67 liens réellement bloqués. C'est mécanique (ouvrir,
  vérifier, dater), sans conception ni code. Ça se grignote par lots de 10 au
  navigateur, quand tu as un moment - pas besoin d'un gros chantier dédié.
- **« Comprendre les chiffres »** → c'est LUI qui fait avancer le produit :
  maquette (Mode A, tracer le parcours réel avant le code) puis implémentation.

---

## 7. Où c'est tracé ailleurs

- `docs/COMPRENDRE_LE_CADRE_SUITES_2026-09-05.md` § 4 (état des adresses).
- `docs/TACHES_VALIDEES.md`, section « [CLOS - 2026-09-06] Module Comprendre le
  cadre ».
- `docs/CHANTIER_TERRITOIRE_REGION_DEPARTEMENT.md` (paquet C).
- Mémoire assistant `project_se_tenir_informe_comprendre_le_cadre`.
