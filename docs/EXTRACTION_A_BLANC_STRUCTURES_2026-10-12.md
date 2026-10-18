# Extraction à blanc des structures de « Comprendre le cadre » (P0.1) - 2026-10-12

> Lecture seule : aucun fichier de l'application n'a été modifié. Calculé par script sur les `structures:` de tous les `contenu/<rayon>/<rayon>.collecte.md`, croisé avec `liens-verifies.txt`. **Le classement par type est automatique et approximatif : c'est une proposition à valider (D5), pas un résultat.**

## 1. Chiffres (et une correction)
- **Correction** : j'ai écrit plus haut « 415 lignes ». Ce chiffre comptait aussi les lignes de sources. Le vrai nombre de lignes de structures est **180**, réparties dans 17 rayons, soit **155 structures uniques**. Le chantier est donc plus petit que je ne l'annonçais.
- Par territoire (colonne « portée » du registre) : Dordogne **80**, Haute-Vienne **17**, région **22**, national **33**, Dordogne probable **3** (non encore au registre).
- **Rayons les plus fournis** : accompagnement 25, budget 20, mobilité 15, logement 13, jeunes 12, créer 11.
- **13 structures citées dans plusieurs rayons** (doublon d'affichage, pas de donnée) : france-travail, mission-locale-perigord, cap-emploi-dordogne, conseil-departemental-dordogne-insertion, structures-iae-dordogne, apec, asso-mission-locale-du-bergeracois-24, asso-mission-locale-du-grand-perigueux-24, caf-dordogne, chambre-metiers-artisanat-dordogne, cci-dordogne, cdad-dordogne-points-justice, siao-dordogne.
- **3 structures absentes du registre** : france-travail-createur-dordogne, france-travail-dordogne, point-justice-perigueux-bergerac.

## 2. Doublons déguisés (même structure sous plusieurs identifiants) : à fusionner à la migration
- **CCAS** : `ccas-mairie`, `ccas-commune`, `ccas-domiciliation` (trois entrées pour le même type de structure).
- **Prud'hommes de Périgueux et Bergerac** : `conseil-de-prud-hommes-perigueux-bergerac` et `conseil-prudhommes-perigueux-bergerac`.
- **Inspection du travail** : `inspection-du-travail-ddets-dordogne` et `dreets-inspection-travail-dordogne` (et `dreets-nouvelle-aquitaine-inspection-travail` côté région).
- **Points-justice** : `cdad-dordogne-points-justice`, `point-justice-dordogne`, `point-justice-perigueux-bergerac`.
- **France Travail** : au moins 9 identifiants (général, créateurs, jeunes, justice, garde, formation, français, handicap, espace employeur) : une seule structure locale avec plusieurs **services**, pas neuf structures.
- **Mission locale** : un identifiant générique (`mission-locale-perigord`, cité dans 4 rayons) à côté de **trois Missions locales distinctes en Dordogne** (Bergeracois, Grand Périgueux, Périgord Noir). C'est le cas « deux Missions locales sur un territoire » dont tu parlais : il existe déjà dans les données, et le champ « communes desservies » est donc indispensable.
- **UDAF, SOLIHA, ADIL, CIDFF, UNAFAM, APF** : une entrée par département (24 et 87) : c'est normal, à garder séparées.

## 3. Ce qui n'est pas un lieu : 19 entrées
DORA, monenfant.fr, Mes aides France Travail, ANEF, ANTS, info-retraite, casier judiciaire, etc. sont des **services en ligne ou des annuaires nationaux**, pas des adresses locales. **Recommandation** : elles n'entrent pas dans le répertoire de lieux. Elles restent dans « Comprendre le cadre » comme sources et outils (renvois datés).

## 4. Types de structure proposés (liste fermée à valider, D5)
| Type proposé | Nombre | Exemples |
|---|---|---|
| annuaire-ou-service-en-ligne | 19 | carto-inclusion-numerique, dora-services-insertion, annuaire-acteurs-dordogne |
| acces-au-droit-justice | 17 | inspection-du-travail-ddets-dordogne, conseil-de-prud-hommes-perigueux-bergerac, cdad-dordogne-points-justice |
| accueil-etrangers-francais | 13 | prefecture-dordogne-etrangers, ofii-direction-territoriale-bordeaux, cimade-nouvelle-aquitaine |
| insertion-activite-economique | 12 | structures-iae-dordogne, inae-nouvelle-aquitaine, plie-et-maison-emploi-dordogne |
| aide-alimentaire-budget | 12 | banque-france-succursales, udaf-dordogne, cresus-nouvelle-aquitaine |
| creation-activite | 10 | chambre-metiers-artisanat-dordogne, cci-dordogne, bge-perigord |
| logement-hebergement | 10 | siao-dordogne, 115-samu-social, accueils-de-jour-dordogne |
| france-travail | 9 | france-travail, france-travail-createur-dordogne, france-travail-espace-employeur |
| handicap | 9 | asso-france-alzheimer-24, asso-unafam-24, asso-unafam-87 |
| formation-orientation | 9 | transitions-pro-nouvelle-aquitaine, conseil-regional-nouvelle-aquitaine-formation, afpa-greta-cnam-dordogne |
| mobilite-solidaire | 8 | plateforme-mobilite-dordogne, conseil-regional-nouvelle-aquitaine-transports, conseil-departemental-dordogne-mobilite |
| caisse-protection-sociale | 6 | caf-dordogne, msa-dordogne-lot-et-garonne, caf-dordogne-logement |
| mission-locale | 5 | mission-locale-perigord, asso-mission-locale-du-bergeracois-24, asso-mission-locale-du-grand-perigueux-24 |
| A-CLASSER | 4 | apec, asso-arsl-87, asso-mobilim-87 |
| ccas | 3 | ccas-mairie, ccas-commune, ccas-domiciliation |
| sante-travail-employeurs | 3 | urssaf-nouvelle-aquitaine, spst-19-24-perigueux, spsti-23-87-limoges |
| conseil-departemental-region | 2 | conseil-departemental-dordogne-insertion, conseil-departemental-dordogne-fsl |
| petite-enfance | 2 | relais-petite-enfance, pmi-dordogne |
| cap-emploi | 1 | cap-emploi-dordogne |
| retraite | 1 | france-services-point-retraite |

Remarques : (1) « A-CLASSER » : apec, asso-arsl-87, asso-mobilim-87, france-services, à ranger à la main ; (2) « accueil-etrangers-francais » et « acces-au-droit-justice » sont trop larges et se couperont sans doute en deux ; (3) la liste visera 20 à 25 types au plus, pour rester lisible dans le vérificateur et la recherche.

## 5. Ce que ça change pour le plan
- **Pour la Dordogne** : environ **80 structures locales** dont une quinzaine à doublonner à fusionner, soit **60 à 70 fiches réelles** à compléter (commune, téléphone, communes desservies) et à dater. C'est un chantier d'une taille réaliste, pas de 400.
- **Pour la Haute-Vienne** : 17 structures seulement dans les données actuelles. Le même modèle s'appliquera plus tard, mais le contenu est à construire.
- **Priorité de complétion** : les structures « à plusieurs guichets » (Missions locales, CCAS, France Travail, CAF, Cap emploi), car ce sont elles qui posent la question « laquelle est la mienne ».

## Annexe : toutes les structures (identifiant | territoire | type proposé | rayons)
- france-travail | national | france-travail | accompagnement, emploi
- mission-locale-perigord | 24 | mission-locale | accompagnement, garde, jeunes, mobilite
- cap-emploi-dordogne | 24 | cap-emploi | accompagnement, emploi, handicap
- conseil-departemental-dordogne-insertion | 24 | conseil-departemental-region | accompagnement, budget
- structures-iae-dordogne | 24 | insertion-activite-economique | accompagnement, emploi
- inae-nouvelle-aquitaine | region | insertion-activite-economique | accompagnement
- plie-et-maison-emploi-dordogne | 24 | insertion-activite-economique | accompagnement
- apec | national | A-CLASSER | accompagnement, former
- asso-varlin-pont-neuf | 87 | insertion-activite-economique | accompagnement
- carto-inclusion-numerique | national | annuaire-ou-service-en-ligne | accompagnement
- asso-base-24 | 24 | insertion-activite-economique | accompagnement
- asso-la-main-forte-24 | 24 | insertion-activite-economique | accompagnement
- dora-services-insertion | national | annuaire-ou-service-en-ligne | accompagnement
- annuaire-acteurs-dordogne | 24 | annuaire-ou-service-en-ligne | accompagnement
- asso-mission-locale-du-bergeracois-24 | 24 | mission-locale | accompagnement, budget, former, garde, jeunes, mobilite
- asso-mission-locale-du-grand-perigueux-24 | 24 | mission-locale | accompagnement, budget, former, garde, jeunes, mobilite
- asso-aleas-87 | 87 | insertion-activite-economique | accompagnement
- asso-france-alzheimer-24 | 24 | handicap | accompagnement
- asso-unafam-24 | 24 | handicap | accompagnement
- asso-unafam-87 | 87 | handicap | accompagnement
- figem-annuaire-gem | national | annuaire-ou-service-en-ligne | accompagnement
- asso-reseau-alliage-87 | 87 | insertion-activite-economique | accompagnement
- asso-croix-marine-24 | 24 | handicap | accompagnement
- asso-saveurs-du-bois-du-roc-24 | 24 | insertion-activite-economique | accompagnement
- asso-geiq-24 | 24 | insertion-activite-economique | accompagnement
- point-conseil-budget-annuaire | national | annuaire-ou-service-en-ligne | budget
- mesquestionsdargent-pcb | national | annuaire-ou-service-en-ligne | budget
- banque-france-succursales | national | aide-alimentaire-budget | budget
- ccas-mairie | national | ccas | budget
- caf-dordogne | 24 | caisse-protection-sociale | budget, garde
- msa-dordogne-lot-et-garonne | 24 | caisse-protection-sociale | budget
- udaf-dordogne | 24 | aide-alimentaire-budget | budget
- cresus-nouvelle-aquitaine | region | aide-alimentaire-budget | budget
- croix-rouge-secours-catholique-microcredit | national | aide-alimentaire-budget | budget
- restos-du-coeur-dordogne | 24 | aide-alimentaire-budget | budget
- banque-alimentaire-dordogne | 24 | aide-alimentaire-budget | budget
- secours-populaire-dordogne | 24 | aide-alimentaire-budget | budget
- epiceries-sociales-solidaires | national | aide-alimentaire-budget | budget
- asso-udaf-87 | 87 | aide-alimentaire-budget | budget
- asso-restos-du-coeur-87 | 87 | aide-alimentaire-budget | budget
- asso-banque-alimentaire-87 | 87 | aide-alimentaire-budget | budget
- asso-la-maison-24 | 24 | aide-alimentaire-budget | budget
- chambre-metiers-artisanat-dordogne | 24 | creation-activite | creer, employeurs
- cci-dordogne | 24 | creation-activite | creer, employeurs
- bge-perigord | 24 | creation-activite | creer
- adie-nouvelle-aquitaine | region | creation-activite | creer
- initiative-perigord | 24 | creation-activite | creer
- france-active-nouvelle-aquitaine | region | creation-activite | creer
- cooperative-activite-emploi-dordogne | 24 | creation-activite | creer
- france-travail-createur-dordogne | 24? | france-travail | creer
- asso-coopalpha-24 | 24 | creation-activite | creer
- asso-iriscop-24 | 24 | creation-activite | creer
- asso-la-traverse-bergerac-24 | 24 | creation-activite | creer
- inspection-du-travail-ddets-dordogne | 24 | acces-au-droit-justice | emploi
- conseil-de-prud-hommes-perigueux-bergerac | 24 | acces-au-droit-justice | emploi
- cdad-dordogne-points-justice | 24 | acces-au-droit-justice | emploi, etranger, handicap
- urssaf-nouvelle-aquitaine | region | sante-travail-employeurs | employeurs
- dreets-nouvelle-aquitaine-inspection-travail | region | acces-au-droit-justice | employeurs
- spst-19-24-perigueux | 24 | sante-travail-employeurs | employeurs
- spsti-23-87-limoges | 87 | sante-travail-employeurs | employeurs
- france-travail-espace-employeur | national | france-travail | employeurs
- prefecture-dordogne-etrangers | 24 | accueil-etrangers-francais | etranger
- anef-etrangers | national | annuaire-ou-service-en-ligne | etranger
- ofii-direction-territoriale-bordeaux | region | accueil-etrangers-francais | etranger
- enic-naric-france | national | annuaire-ou-service-en-ligne | etranger
- ants-permis | national | annuaire-ou-service-en-ligne | etranger
- cimade-nouvelle-aquitaine | region | accueil-etrangers-francais | etranger
- spada-dordogne | 24 | accueil-etrangers-francais | etranger
- asso-france-terre-d-asile-24 | 24 | accueil-etrangers-francais | etranger
- mon-cep-operateur-nouvelle-aquitaine | region | annuaire-ou-service-en-ligne | former
- transitions-pro-nouvelle-aquitaine | region | formation-orientation | former
- france-travail-formation | national | france-travail | former
- conseil-regional-nouvelle-aquitaine-formation | region | formation-orientation | former
- france-vae-point-relais-conseil | region | annuaire-ou-service-en-ligne | former
- afpa-greta-cnam-dordogne | 24 | formation-orientation | former
- ofii-nouvelle-aquitaine | region | accueil-etrangers-francais | francais
- centres-sociaux-dordogne | 24 | accueil-etrangers-francais | francais
- cd24-service-social | 24 | accueil-etrangers-francais | francais
- france-travail-formation-francais | national | france-travail | francais
- region-nouvelle-aquitaine-savoirs-de-base | region | formation-orientation | francais
- etablissements-scolaires-oepre | 24 | accueil-etrangers-francais | francais
- cimade-perigueux | 24 | accueil-etrangers-francais | francais
- centres-examen-delf-dordogne | 24 | accueil-etrangers-francais | francais
- asso-ligue-de-l-enseignement-24 | 24 | accueil-etrangers-francais | francais
- asso-lire-87 | 87 | accueil-etrangers-francais | francais
- relais-petite-enfance | national | petite-enfance | garde
- pmi-dordogne | 24 | petite-enfance | garde
- france-travail-garde | national | france-travail | garde
- monenfant-annuaire | national | annuaire-ou-service-en-ligne | garde
- ccas-commune | national | ccas | garde
- pajemploi-urssaf | national | annuaire-ou-service-en-ligne | garde
- mdph-dordogne | 24 | handicap | handicap
- agefiph-delegation-nouvelle-aquitaine | region | handicap | handicap
- medecine-du-travail-service-prevention-sante | 24 | handicap | handicap
- france-travail-dordogne | 24? | france-travail | handicap
- entreprises-adaptees-esat-dordogne | 24 | insertion-activite-economique | handicap
- asso-apf-24 | 24 | handicap | handicap
- asso-apf-87 | 87 | handicap | handicap
- france-travail-jeunes-dordogne | 24 | france-travail | jeunes
- e2c-perigueux | 24 | formation-orientation | jeunes
- epide-nouvelle-aquitaine | region | formation-orientation | jeunes
- agence-service-civique | national | annuaire-ou-service-en-ligne | jeunes
- psad-plateforme-suivi-appui-decrocheurs-dordogne | 24 | formation-orientation | jeunes
- cfa-et-ecoles-de-production-nouvelle-aquitaine | region | formation-orientation | jeunes
- asso-crij-nouvelle-aquitaine | region | formation-orientation | jeunes
- asso-mission-locale-perigord-noir-24 | 24 | mission-locale | jeunes
- asso-mission-locale-rurale-87 | 87 | mission-locale | jeunes
- point-justice-dordogne | 24 | acces-au-droit-justice | juridique
- cdad-dordogne | 24 | acces-au-droit-justice | juridique
- bureau-aide-juridictionnelle-perigueux | 24 | acces-au-droit-justice | juridique
- conseil-prudhommes-perigueux-bergerac | 24 | acces-au-droit-justice | juridique
- dreets-inspection-travail-dordogne | 24 | acces-au-droit-justice | juridique
- defenseur-des-droits-delegues-dordogne | 24 | acces-au-droit-justice | juridique
- france-victimes-dordogne | 24 | acces-au-droit-justice | juridique
- ordre-avocats-perigueux | 24 | acces-au-droit-justice | juridique
- asso-cidff-24 | 24 | acces-au-droit-justice | juridique
- asso-cidff-limousin | 87 | acces-au-droit-justice | juridique
- spip-dordogne | 24 | acces-au-droit-justice | justice
- france-travail-justice-dordogne | 24 | france-travail | justice
- casier-judiciaire-national | national | annuaire-ou-service-en-ligne | justice
- point-justice-perigueux-bergerac | 24? | acces-au-droit-justice | justice
- siao-dordogne | 24 | logement-hebergement | justice, logement
- associations-post-sentencielles-dordogne | 24 | acces-au-droit-justice | justice
- structures-iae-milieu-penitentiaire | national | insertion-activite-economique | justice
- asso-arsl-87 | 87 | A-CLASSER | justice
- 115-samu-social | national | logement-hebergement | logement
- accueils-de-jour-dordogne | 24 | logement-hebergement | logement
- ccas-domiciliation | national | ccas | logement
- conseil-departemental-dordogne-fsl | 24 | conseil-departemental-region | logement
- adil-dordogne | 24 | logement-hebergement | logement
- action-logement-nouvelle-aquitaine | region | logement-hebergement | logement
- caf-dordogne-logement | 24 | caisse-protection-sociale | logement
- prefecture-dordogne-dalo | 24 | logement-hebergement | logement
- habitat-jeunes-perigord | 24 | logement-hebergement | logement
- asso-soliha-dordogne | 24 | logement-hebergement | logement
- asso-soliha-limousin | 87 | logement-hebergement | logement
- asso-adil-87 | 87 | logement-hebergement | logement
- mes-aides-france-travail | national | annuaire-ou-service-en-ligne | mobilite
- france-mobilites-solutions | national | annuaire-ou-service-en-ligne | mobilite
- plateforme-mobilite-dordogne | 24 | mobilite-solidaire | mobilite
- conseil-regional-nouvelle-aquitaine-transports | region | mobilite-solidaire | mobilite
- covoit-modalis | region | annuaire-ou-service-en-ligne | mobilite
- conseil-departemental-dordogne-mobilite | 24 | mobilite-solidaire | mobilite
- auto-ecoles-associatives-sociales | national | mobilite-solidaire | mobilite
- asso-afac-24 | 24 | mobilite-solidaire | mobilite
- asso-auto-mobilite-solidaire-dordogne | 24 | mobilite-solidaire | mobilite
- asso-plateforme-must | 24 | mobilite-solidaire | mobilite
- asso-mobilim-87 | 87 | A-CLASSER | mobilite
- asso-atchoum-24 | 24 | mobilite-solidaire | mobilite
- cpam-dordogne | 24 | caisse-protection-sociale | sante
- cpam-haute-vienne | 87 | caisse-protection-sociale | sante
- france-services | national | A-CLASSER | sante
- assurance-retraite-carsat-nouvelle-aquitaine | region | caisse-protection-sociale | seniors
- info-retraite-mon-compte-retraite | national | annuaire-ou-service-en-ligne | seniors
- france-services-point-retraite | national | retraite | seniors
