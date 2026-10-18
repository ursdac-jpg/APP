# Prompt de vérification : agences d'intérim de la Haute-Vienne (second assistant, un seul message groupé)

> Écrit le 2026-10-17. Même principe que pour la Dordogne (`docs/PROMPT_VERIFICATION_AGENCES_INTERIM_DORDOGNE_2026-10-17.md`). **29 lignes** de la Haute-Vienne dont la page n'a pas pu être contrôlée automatiquement : beaucoup d'adresses de pages proposées par ChatGPT n'existent pas (erreur 404) ou ne contiennent pas l'agence. Les agences dont la page contient déjà le téléphone et l'adresse (niveau A) n'ont pas besoin de ce passage. Détail du contrôle : `docs/VERIFICATION_AGENCES_INTERIM_2026-10-17.md`. Rien n'est publié avant l'ouverture à la main par Denis.

> **Amélioration constatée le 2026-10-17 : le complément de prompt `docs/PROMPT_VERIFICATION_COMPLEMENT_QUI_MARCHE_2026-10-17.md` fonctionne mieux** (règles de décision par cas, annuaires interdits, suite en PARTIE 2, 3, aucun commentaire). Le coller avant la liste.


## Le message à coller

```
Je te donne des agences d'intérim de la Haute-Vienne (87), proposées par un autre assistant, que je dois VÉRIFIER une par une. Pour chaque ligne, ouvre le site OFFICIEL du réseau (localisateur d'agences ou page de l'agence) et dis-moi ce que tu y LIS réellement. N'invente rien, ne complète rien de mémoire.

Pour chaque ligne, réponds par UNE ligne dans ce format exact, colonnes séparées par « | », sans titre, sans puces :
réseau | nom de l'agence | commune | code postal | adresse | téléphone | adresse (https) de LA PAGE DE CETTE AGENCE | statut | ce que tu as lu

Valeurs du statut (une seule) :
- confirmé : l'agence figure sur la page officielle avec ce téléphone et cette adresse
- corrigé : l'agence existe mais l'adresse ou le téléphone sont différents ; donne les valeurs lues
- fermée ou absente : le réseau n'a pas d'agence à cette adresse ou plus du tout en Haute-Vienne
- non vérifiable : tu n'as pas pu ouvrir la page officielle (dis laquelle)

Règles : le téléphone doit être celui de CETTE agence, lu sur sa page (jamais un numéro national ni un numéro surtaxé en 08). L'adresse https doit être la page de l'agence elle-même, pas la page d'accueil du réseau. Si l'adresse et le téléphone d'une agence sont ceux d'une autre agence d'un autre réseau, signale-le. Si une structure est en réalité une entreprise d'insertion ou une structure d'insertion par l'activité économique (et non une agence d'intérim classique), écris « structure d'insertion » dans le statut. Pas d'annuaire, pas de comparateur, pas de site d'offres d'emploi.

Voici les lignes (réseau | nom | commune | code postal | adresse | téléphone | page indiquée) :
Manpower | Manpower Limoges BTP Transport | Limoges | 87000 | 1-3 Avenue du Midi, Immeuble le Manager | 05 55 38 84 00 | https://vosagences.manpower.fr/nouvelle-aquitaine/haute-vienne/limoges/manpower-limoges-btp-transport-559
Manpower | Manpower Limoges Industrie Tertiaire | Limoges | 87000 | 1-3 Avenue du Midi, Immeuble le Manager | 05 55 34 81 40 | https://vosagences.manpower.fr/nouvelle-aquitaine/haute-vienne/limoges/manpower-limoges-industrie-tertiaire-336
Manpower | Manpower Saint-Junien | Saint-Junien | 87200 | 1 Rue Junien Rigaud | 05 55 43 03 00 | https://vosagences.manpower.fr/nouvelle-aquitaine/haute-vienne/saint-junien/manpower-saint-junien-289
Synergie | Synergie Limoges | Limoges | 87000 | 3 avenue du Général de Gaulle | 05 55 33 20 30 | https://www.synergie.fr/trouver-une-agence/synergie-limoges
Actual | Actual Limoges | Limoges | 87000 | 16 avenue Baudin | 05 55 49 07 22 | https://www.groupeactual.eu/agence/actual-limoges
Proman | Proman Limoges | Limoges | 87000 | 5-7 rue des Petites Maisons, avenue Gabriel Péri | 05 55 10 85 92 | https://www.proman-emploi.fr/agence/limoges/
Samsic Emploi | Samsic Emploi Limoges | Limoges | 87000 | 9 cours Vergniaud | 05 55 78 15 82 | https://www.samsic-emploi.fr/nos-agences/samsic-emploi-limoges
Partnaire | Partnaire Limoges | Limoges | 87000 | 1 rue Jean Jaurès | 05 44 19 14 00 | https://www.partnaire.fr/nos-agences/a/71-agence-d-interim-cdd-cdi-limoges/
Crit | Crit Limoges Nord | Limoges | 87000 | 208 bis Rue de Toulouse, Bâtiment 1B | 05 55 77 97 30 | https://www.crit-job.com/agences/voir/046-crit-limoges-nord/
Crit | Crit Limoges Sud | Limoges | 87000 | 208 Rue de Toulouse, Bâtiment 1A | 05 55 10 10 31 | https://www.crit-job.com/agences/voir/415-crit-limoges-sud/
Triangle Intérim | Triangle Intérim Limoges | Limoges | 87000 | 60 ter avenue Garibaldi | 05 44 00 04 00 | https://www.triangle.fr/nos-agences/
Temporis | Temporis Limoges | Limoges | 87000 | 21 boulevard Victor Hugo | 05 55 35 13 81 | https://www.temporis-franchise.fr/agences/temporis-interim-limoges
R.A.S Intérim | R.A.S Intérim Limoges | Limoges | 87280 | 31 rue Amédée Gordini | 05 55 50 11 30 | https://www.ras-interim.fr/agences/limoges/
LIP Intérim | LIP Intérim Limoges | Limoges | 87000 | 21 cours Bugeaud | 05 19 08 01 71 | https://www.lipinterim.fr/agence/lip-limoges
Optineris | Optineris Industrie Tertiaire Transport Limoges | Limoges | 87000 | 18 cours Jourdan | 05 55 77 87 87 | https://agence.optineris.fr/9-optineris-industrie-tertiaire-transport-limoges
Optineris | Optineris BTP Limoges | Limoges | 87000 | 66 rue François Chénieux | 05 55 77 71 66 | https://agence.optineris.fr/10-optineris-btp-limoges
Optineris | Optineris Saint-Junien | Saint-Junien | 87200 | 11 boulevard de la République | 05 55 02 02 55 | https://agence.optineris.fr/33-optineris-saint-junien
ACTO | ACTO Intérim Limoges | Limoges | 87000 | 8 rue du Général Cérez | 05 19 87 99 87 | https://www.acto-rh.com/agences/limoges
ACTO | ACTO Intérim Saint-Junien | Saint-Junien | 87200 | 67 avenue Henri Barbusse | 05 19 87 82 80 | https://www.acto-rh.com/agences
Les 5 Pierre | Les 5 Pierre | Limoges | 87000 | 5 bis cours Vergniaud | 05 55 12 78 56 | https://www.les5pierre.com/
Fusion Intérim | Fusion Intérim Limoges | Limoges | 87000 | 18 boulevard Victor Hugo | 05 55 05 06 00 | https://fusioninterim.fr/
Artus Intérim | Artus Intérim Limoges | Limoges | 87000 | 8 rue Charles Gide | 05 55 79 70 00 | https://www.artus-interim.com/agence/artus-limoges/
Réseau Alliance | Réseau Alliance Intérim Limoges | Limoges | 87000 | 8 bis rue François Chénieux | 05 55 77 60 07 | https://www.reseaualliance.fr/agence/limoges
Réseau Alliance | Réseau Alliance Intérim Saint-Junien | Saint-Junien | 87200 | 67 avenue Henri Barbusse | 05 55 01 45 14 | https://www.reseaualliance.fr/agence/saint-junien
Adéquat | Adéquat Limoges | Limoges | 87000 | 13 avenue de la Libération | 05 55 04 34 90 | https://www.lejobadequat.com/nos-agences/agence-adequat-interim-recrutement-limoges
Camo Emploi | Camo Emploi Limoges | Limoges | 87000 | 10 rue d'Isly | 06 30 27 23 49 | https://www.camo-emploi.fr/agence/camo-emploi-limoges-79
Saintext Intérim | Saintext Intérim Limoges | Limoges | 87000 | 67 boulevard Gambetta | 08 06 11 04 40 | https://www.saintext-interim.fr/
Job Direct | Job Direct Limoges | Limoges | 87000 | 12 avenue Garibaldi | introuvable | https://www.job-direct.fr
PlaceActiv | PlaceActiv Limousin | Saint-Junien | 87200 | 16 rue Augustin Fresnel | 05 55 03 63 40 | https://placeactiv.fr```

## Ce que Denis fait ensuite
1. Il colle la réponse ici (telle quelle). Les lignes « confirmé » restent dans le sas, les « corrigé » sont mises à jour, les « fermée ou absente » et les « structure d'insertion » sont écartées.
2. Dans l'outil de veille, « Le sas », registre des employeurs, filtre **Tous les types** puis **interim** : il ouvre la page de chaque agence, puis « C'est bon, publier ». La date de vérification se pose à ce moment-là.
