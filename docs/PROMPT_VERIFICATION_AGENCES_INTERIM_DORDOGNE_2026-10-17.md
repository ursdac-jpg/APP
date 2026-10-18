# Prompt de vérification : agences d'intérim de la Dordogne (second assistant, un seul message groupé)

> Écrit le 2026-10-17. À coller dans un second assistant qui sait ouvrir des pages web (celui qui a produit le fichier CSV, ou Perplexity). **34 lignes** sur 56 : celles dont la page de l'agence n'a pas pu être contrôlée automatiquement (page refusée aux robots, page générale du réseau, page absente) ou qui paraissent suspectes. Les 22 autres ont déjà leur téléphone et leur adresse retrouvés dans leur page officielle par le contrôle automatique (voir `docs/VERIFICATION_AGENCES_INTERIM_DORDOGNE_2026-10-17.md`). Rien n'est publié avant l'ouverture à la main par Denis.

> **Amélioration constatée le 2026-10-17 : le complément de prompt `docs/PROMPT_VERIFICATION_COMPLEMENT_QUI_MARCHE_2026-10-17.md` fonctionne mieux** (règles de décision par cas, annuaires interdits, suite en PARTIE 2, 3, aucun commentaire). Le coller avant la liste.


## Le message à coller

```
Je te donne 34 agences d'intérim de la Dordogne (24), proposées par un autre assistant, que je dois VÉRIFIER une par une. Pour chaque ligne, ouvre le site OFFICIEL du réseau (localisateur d'agences ou page de l'agence) et dis-moi ce que tu y LIS réellement. N'invente rien, ne complète rien de mémoire.

Pour chaque ligne, réponds par UNE ligne dans ce format exact, colonnes séparées par « | », sans titre, sans puces :
réseau | nom de l'agence | commune | code postal | adresse | téléphone | adresse (https) de LA PAGE DE CETTE AGENCE | statut | ce que tu as lu

Valeurs du statut (une seule) :
- confirmé : l'agence figure sur la page officielle avec ce téléphone et cette adresse
- corrigé : l'agence existe mais l'adresse ou le téléphone sont différents ; donne les valeurs lues
- fermée ou absente : le réseau n'a pas d'agence à cette adresse ou plus du tout en Dordogne
- non vérifiable : tu n'as pas pu ouvrir la page officielle (dis laquelle)

Règles : le téléphone doit être celui de CETTE agence, lu sur sa page (jamais un numéro national). L'adresse https doit être la page de l'agence elle-même, pas la page d'accueil du réseau. Si l'adresse et le téléphone d'une agence sont ceux d'une autre agence d'un autre réseau, signale-le. Pas d'annuaire, pas de comparateur, pas de site d'offres d'emploi.

Voici les 34 lignes (réseau | nom | commune | code postal | adresse | téléphone | page indiquée) :
Manpower | Manpower Périgueux | Périgueux | 24000 | 4 Cours Saint-Georges | 05 53 45 46 30 | https://vosagences.manpower.fr/nouvelle-aquitaine/dordogne/perigueux/manpower-perigueux-687
Manpower | Manpower Bergerac | Bergerac | 24100 | 1 Rue Ragueneau | 05 53 22 13 00 | https://vosagences.manpower.fr/nouvelle-aquitaine/dordogne/bergerac/manpower-bergerac-218
Manpower | Manpower Montpon | Montpon-Ménestérol | 24700 | 51 Avenue Jean Moulin | 05 53 22 13 00 | https://vosagences.manpower.fr/nouvelle-aquitaine/dordogne/montpon-menesterol/manpower-montpon-760
Manpower | Manpower Espace Nontron | Nontron | 24300 | Rue Brune | 05 53 60 80 00 | https://vosagences.manpower.fr/nouvelle-aquitaine/dordogne/nontron/manpower-espace-nontron-607
Manpower | Manpower Sarlat | Sarlat-la-Canéda | 24200 | 76 Avenue Aristide Briand | 05 53 31 70 50 | https://vosagences.manpower.fr/nouvelle-aquitaine/dordogne/sarlat-la-caneda/manpower-sarlat-259
Proman | Proman Bergerac | Bergerac | 24100 | 21 Place Gambetta | 05 53 74 01 15 | https://www.proman.group/nos-implantations/
Proman | Proman Périgueux | Périgueux | 24000 | 175 Route de Lyon | 05 53 30 93 29 | https://www.proman.group/nos-implantations/
Start People | Start People Périgueux | Boulazac Isle Manoire | 24750 | 28 Impasse Denis Diderot | 05 53 03 04 70 | https://www.startpeople.fr/nos-agences
Actual | Actual Périgueux Wilson | Périgueux | 24000 | 3 Rue du Président Wilson | 05 53 02 14 14 | https://www.actualgroup.com/agences/actual-perigueux-wilson
Temporis | Temporis Terrasson | Terrasson-Lavilledieu | 24120 | 38 Avenue Charles de Gaulle | 05 53 50 34 69 | https://www.temporis-franchise.fr/agences/temporis-terrasson-lavilledieu
Temporis | Temporis Sarlat | Sarlat-la-Canéda | 24200 | 7 Boulevard Nessmann | 05 33 09 28 25 | https://www.temporis-franchise.fr/agences/temporis-sarlat-la-caneda
Appel Médical | Appel Médical Périgueux | Coulounieix-Chamiers | 24660 | 212 Boulevard des Saveurs | 05 53 04 70 33 | https://www.appelmedical.com/agences/
Triangle Intérim | Triangle Intérim Périgueux | Périgueux | 24000 | 167 bis Route de Lyon | 05 64 74 00 05 | https://www.triangle.fr/nos-agences/
Profil Intérim | Profil Intérim Bergerac | Bergerac | 24100 | 45 Place Gambetta | 05 53 58 18 50 | https://www.profilinterim.fr
Profil Intérim | Profil Intérim Périgueux | Périgueux | 24000 | 134 Avenue Maréchal Juin | 05 53 06 06 21 | https://www.profilinterim.fr
Profil Intérim | Profil Intérim Ribérac | Ribérac | 24600 | 21 ter Place du Général de Gaulle | 05 53 91 39 07 | https://www.profilinterim.fr
Profil Intérim | Profil Intérim Montpon | Montpon-Ménestérol | 24700 | 2 Place Gambetta | 05 53 80 33 33 | https://www.profilinterim.fr
Profil Intérim | Profil Intérim Thiviers | Thiviers | 24800 | 2 Place du Chapeau Rouge | 05 53 55 05 00 | https://www.profilinterim.fr
ALM Intérim | ALM Intérim Périgueux | Périgueux | 24000 | 171 Route de Lyon | 05 54 67 10 53 | https://www.alm-interim.fr/
Adéquat | Adéquat Bergerac | Bergerac | 24100 | 27 Rue Neuve d'Argenson | 05 53 23 69 29 | https://www.lejobadequat.com/nos-agences
Adéquat | Adéquat Périgueux BTP | Périgueux | 24000 | 36 Rue du Président Wilson | introuvable | https://www.lejobadequat.com/nos-agences
Adéquat | Adéquat Périgueux | Périgueux | 24000 | 51 Rue du Président Wilson | 05 53 09 90 60 | https://www.lejobadequat.com/nos-agences
Adéquat | Adéquat Nontron | Nontron | 24300 | 18 bis Avenue Yvon Delbos | 05 47 62 50 20 | https://www.lejobadequat.com/nos-agences
Adéquat | Adéquat Terrasson-Lavilledieu | Terrasson-Lavilledieu | 24120 | 10 Avenue Jean Jaurès | 05 53 51 02 15 | https://www.lejobadequat.com/nos-agences
Adéquat | Adéquat Inside Staffing Industrie Parfumerie | Neuvic | 24190 | Théorat | 06 61 79 24 96 | https://www.lejobadequat.com/nos-agences
Work 2000 | Work 2000 Boulazac | Boulazac Isle Manoire | 24750 | 547 Avenue Louis Lescure | 05 53 08 57 02 | https://www.work2000.fr/nos-agences/
R.A.S Intérim | R.A.S Intérim Périgueux | Boulazac Isle Manoire | 24750 | 13 ZA du Ponteix | 05 19 08 18 60 | https://www.ras-interim.fr/le-reseau/
Menco | Menco Bergerac | Bergerac | 24100 | Route de Sainte-Alvère | 05 53 58 77 70 | https://www.menco-rh.fr/agences/bergerac
Profrais | Profrais Bergerac | Bergerac | 24100 | 5 Rue Junien Rabier | 05 35 54 13 10 | https://www.profrais.fr/
Vitalis Médical | Vitalis Médical Périgueux | Marsac-sur-l'Isle | 24430 | 7 bis Boulevard de l'Industrie | 05 64 31 14 44 | https://www.vitalis-medical.com/agences/vitalis-medical-perigueux/
WellJob | WellJob Périgueux | Périgueux | 24000 | 2 Cours Saint-Georges | 05 53 13 17 13 | https://www.welljob.fr/agences
Jubil Intérim | Jubil Intérim Périgueux | Marsac-sur-l'Isle | 24430 | 35 Impasse Louis Suder | 05 18 22 20 20 | https://www.jubil.fr/nos-agences
Parker Intérim | Parker Intérim Bergerac | Bergerac | 24100 | 14 Place des Petites Boucheries | introuvable | introuvable
JL Intérim | JL Intérim Périgueux | Marsac-sur-l'Isle | 24430 | 7 bis Boulevard de l'Industrie | introuvable | introuvable```

## Ce que Denis fait ensuite
1. Il colle la réponse ici (telle quelle). Les lignes « confirmé » rejoignent le sas, les « corrigé » sont mises à jour, les « fermée ou absente » sont écartées.
2. Il ouvre à la main la page de chaque agence (les 22 déjà retrouvées par le contrôle automatique + celles confirmées) : c'est cette ouverture qui donne la date de vérification et qui rend l'agence publique.
3. Les agences d'intérim sont rangées une par agence dans l'application (voir la proposition de rangement dans le document de chantier).
