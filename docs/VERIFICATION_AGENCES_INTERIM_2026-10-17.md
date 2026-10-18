# Contrôle automatique des agences d'intérim (Dordogne et Haute-Vienne)

> Généré par `node scripts/verifierAgencesInterim.js` le 2026-10-17 sur `outils/sas/interim.sas.txt` (93 lignes).
> **Ce contrôle ne déclare jamais une agence bonne** : Denis ouvre la page à la main. Niveau A = téléphone ET adresse retrouvés dans la page de l'agence ; B = l'un des deux ; C = la page répond mais ne les contient pas (page générale ou ligne fausse) ; D = page refusée aux robots, absente ou non indiquée.

Résumé : A 45, B 13, C 13, D 22.

## Doublons et anomalies

- même adresse : « 2 Cours Saint-Georges » : Adecco Périgueux (Périgueux) ; WellJob Périgueux (Périgueux)
- MÊME ADRESSE DANS DES COMMUNES DIFFÉRENTES : « 2 Place Gambetta » : Profil Intérim Montpon (Montpon-Ménestérol) ; Claudette Intérim Saint-Astier (Saint-Astier)
- même adresse : « 1-3 Avenue du Midi, Immeuble le Manager » : Manpower Limoges BTP Transport (Limoges) ; Manpower Limoges Industrie Tertiaire (Limoges)
- même adresse : « 26 Rue Atlantis » : Adecco Limoges (Limoges) ; Adecco Limoges Tertiaire (Limoges) ; Adecco Medical Limoges (Limoges)
- même adresse : « 26 Rue Atlantis, Parc Ester » : Adecco BTP Limoges (Limoges) ; Adecco Logistique Transport Limoges (Limoges)
- même téléphone 05 53 22 13 00 : Manpower Bergerac ; Manpower Montpon
- même téléphone 05 55 77 27 27 : Adecco Limoges Tertiaire ; Adecco Saint-Junien

## Détail

| Niveau | Agence | Commune | Téléphone | Origine | Constat |
|---|---|---|---|---|---|
| A | Randstad Périgueux | Coulounieix-Chamiers | 05 53 06 64 90 | csv | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Randstad Bergerac | Bergerac | 05 53 74 54 20 | csv | téléphone retrouvé sur la page ; adresse retrouvée sur la page ; remarque : ChatGPT donnait 05 53 06 64 90 (numéro de Périgueux) : le fichier CSV, avec la fiche officielle, donne 05 53 74 54 20 |
| A | Adecco Périgueux | Périgueux | 05 53 45 42 20 | csv | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Adecco Bergerac | Bergerac | 05 53 57 79 99 | csv | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Adecco Nontron | Nontron | 05 53 56 39 40 | csv | téléphone retrouvé sur la page ; adresse retrouvée sur la page ; remarque : Sur rendez-vous (mention officielle) |
| A | Adecco Sarlat | Sarlat-la-Canéda | 05 53 31 78 78 | csv | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Agence Synergie Bergerac | Bergerac | 05 53 22 15 00 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Agence Synergie Périgueux-Boulazac | Boulazac Isle Manoire | 05 53 02 69 50 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Start People Périgueux | Boulazac Isle Manoire | 05 53 03 04 70 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page ; remarque : Page générale du réseau |
| A | Actual Périgueux Centre | Périgueux | 05 53 09 46 56 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Actual Nontron | Nontron | 05 53 56 67 42 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Samsic Emploi Bergerac | Bergerac | 05 53 22 27 40 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Samsic Emploi Périgueux | Périgueux | 05 53 03 26 26 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Appel Médical Périgueux | Coulounieix-Chamiers | 05 53 04 70 33 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page ; remarque : Intérim spécialisé santé ; même adresse que Randstad Périgueux : à vérifier |
| A | Profil Intérim Bergerac | Bergerac | 05 53 58 18 50 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page ; remarque : Page d'accueil du réseau |
| A | Claudette Intérim Bergerac | Bergerac | 05 53 22 34 84 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Claudette Intérim Périgueux | Périgueux | 05 53 35 17 01 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Claudette Intérim Nontron | Nontron | 05 53 60 82 88 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Claudette Intérim Sarlat | Sarlat-la-Canéda | 05 53 30 43 30 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Claudette Intérim Saint-Astier | Saint-Astier | 05 53 09 49 28 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Claudette Intérim Thiviers | Thiviers | 05 33 09 05 33 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Claudette Intérim Montpon-Ménestérol | Montpon-Ménestérol | 05 33 09 29 19 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Interim 24 Bergerac | Creysse | 05 64 34 00 36 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page ; remarque : Page d'accueil |
| A | ALM Intérim Périgueux | Périgueux | 05 54 67 10 53 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page ; remarque : Page d'accueil |
| A | Artus Intérim Périgueux | Marsac-sur-l'Isle | 05 33 82 00 44 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Artus Intérim Nontron | Nontron | 05 53 56 44 17 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Menco Bergerac | Bergerac | 05 64 34 02 10 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | WellJob Périgueux | Périgueux | 05 53 13 17 13 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page ; remarque : SUSPECT : même adresse que Adecco Périgueux ; deux réponses de ChatGPT différentes (« à relever » puis adresse) |
| A | Randstad Limoges | Limoges | 05 55 12 81 20 | csv | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Randstad Saint-Junien | Saint-Junien | 05 55 02 61 80 | csv | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Adecco Limoges | Limoges | 05 55 10 02 87 | csv | téléphone retrouvé sur la page ; adresse retrouvée sur la page ; remarque : Regroupe les fiches ADFR_850, V41 et Z94 (même téléphone) ; codes postaux divergents selon les fiches Adecco |
| A | Adecco Limoges Tertiaire | Limoges | 05 55 77 27 27 | csv | téléphone retrouvé sur la page ; adresse retrouvée sur la page ; remarque : Même numéro que Adecco Saint-Junien : un des deux est probablement faux ; doublon possible (à confirmer) |
| A | Adecco BTP Limoges | Limoges | 05 55 34 25 49 | csv | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Adecco Logistique Transport Limoges | Limoges | 05 55 10 30 10 | csv | téléphone retrouvé sur la page ; adresse retrouvée sur la page ; remarque : Immeuble Cassiopée, 1er étage |
| A | Adecco Saint-Junien | Saint-Junien | 05 55 77 27 27 | csv | téléphone retrouvé sur la page ; adresse retrouvée sur la page ; remarque : Numéro divergent selon les pages d'Adecco (05 55 77 27 27 ou 05 55 10 02 87) : à vérifier |
| A | Adecco Medical Limoges | Limoges | 05 55 10 15 98 | csv | téléphone retrouvé sur la page ; adresse retrouvée sur la page ; remarque : Intérim spécialisé santé |
| A | Start People Limoges | Limoges | 05 55 77 38 50 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Samsic Emploi Limoges | Limoges | 05 55 78 15 82 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Partnaire Limoges | Limoges | 05 44 19 14 00 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Supplay Limoges | Limoges | 05 55 03 02 01 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page ; remarque : Page générale du réseau |
| A | Domino Care Limoges | Limoges | 05 19 08 28 40 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page ; remarque : Intérim santé (Domino Care) |
| A | Les 5 Pierre | Limoges | 05 55 12 78 56 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page ; remarque : À vérifier : réseau peu connu ; page d'accueil |
| A | Artus Intérim Limoges | Limoges | 05 55 79 74 08 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page |
| A | Artus Intérim Saint-Junien | Saint-Junien | 05 55 01 79 20 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page ; remarque : Deux adresses de page différentes proposées par ChatGPT |
| A | Saintext Intérim Limoges | Limoges | 08 06 11 04 40 | gpt | téléphone retrouvé sur la page ; adresse retrouvée sur la page ; remarque : SUSPECT : numéro en 08 06 (surtaxé) ; page d'accueil |
| B | Temporis Terrasson | Terrasson-Lavilledieu | 05 53 50 34 69 | gpt | téléphone retrouvé sur la page ; adresse ABSENTE de la page |
| B | Adéquat Bergerac | Bergerac | 05 53 23 69 29 | gpt | téléphone ABSENT de la page ; adresse retrouvée sur la page ; remarque : Page générale du réseau |
| B | Adéquat Périgueux BTP | Périgueux | 05 53 35 16 20 | gpt | téléphone ABSENT de la page ; adresse retrouvée sur la page ; remarque : Téléphone introuvable ; page générale du réseau |
| B | Adéquat Périgueux | Périgueux | 05 53 09 90 60 | gpt | téléphone ABSENT de la page ; adresse retrouvée sur la page ; remarque : Page générale du réseau |
| B | Adéquat Nontron | Nontron | 05 47 62 50 20 | gpt | téléphone ABSENT de la page ; adresse retrouvée sur la page ; remarque : Page générale du réseau |
| B | Adéquat Terrasson-Lavilledieu | Terrasson-Lavilledieu | 05 53 51 02 15 | gpt | téléphone ABSENT de la page ; adresse retrouvée sur la page ; remarque : Page générale du réseau |
| B | Work 2000 Boulazac | Boulazac Isle Manoire | 05 53 08 57 02 | gpt | téléphone retrouvé sur la page ; adresse ABSENTE de la page ; remarque : Page générale du réseau |
| B | Crit Limoges Nord | Limoges | 05 55 77 97 30 | gpt | téléphone ABSENT de la page ; adresse retrouvée sur la page |
| B | Crit Limoges Sud | Limoges | 05 55 10 10 31 | gpt | téléphone ABSENT de la page ; adresse retrouvée sur la page |
| B | Optineris Industrie Tertiaire Transport Limoges | Limoges | 05 55 77 87 87 | gpt | téléphone ABSENT de la page ; adresse retrouvée sur la page |
| B | Adéquat Limoges | Limoges | introuvable | gpt | adresse retrouvée sur la page ; remarque : ChatGPT a donné deux adresses différentes (13 avenue de la Libération, 46-48 avenue des Bénédictins) ; téléphone « introuvable » dans une réponse |
| B | Camo Emploi Limoges | Limoges | 06 30 27 23 49 | gpt | téléphone retrouvé sur la page ; adresse ABSENTE de la page ; remarque : ChatGPT a donné deux adresses différentes (10 rue d'Isly, 44 avenue Garibaldi) ; numéro mobile |
| B | PlaceActiv Limousin | Saint-Junien | 05 55 03 63 40 | gpt | téléphone ABSENT de la page ; adresse retrouvée sur la page ; remarque : À vérifier : peut être une structure d'insertion |
| C | Proman Bergerac | Bergerac | 05 53 74 01 15 | gpt | téléphone ABSENT de la page ; adresse ABSENTE de la page ; remarque : Page générale du réseau, pas la page de l'agence |
| C | Proman Périgueux | Périgueux | 05 53 09 32 90 | gpt | téléphone ABSENT de la page ; adresse ABSENTE de la page ; remarque : Page générale du réseau, pas la page de l'agence |
| C | Actual Périgueux Wilson | Périgueux | 05 53 02 14 14 | gpt | téléphone ABSENT de la page ; adresse ABSENTE de la page |
| C | Triangle Intérim Périgueux | Périgueux | 05 64 74 00 05 | gpt | téléphone ABSENT de la page ; adresse ABSENTE de la page ; remarque : Page générale du réseau |
| C | Adéquat Inside Staffing Industrie Parfumerie | Neuvic | 06 61 79 24 96 | gpt | téléphone ABSENT de la page ; adresse ABSENTE de la page ; remarque : Agence sur site industriel ; numéro mobile : à vérifier |
| C | R.A.S Intérim Périgueux | Boulazac Isle Manoire | 05 19 08 18 60 | gpt | téléphone ABSENT de la page ; adresse ABSENTE de la page ; remarque : Page générale du réseau |
| C | Profrais Bergerac | Bergerac | 05 35 54 13 10 | gpt | téléphone ABSENT de la page ; adresse ABSENTE de la page ; remarque : Page d'accueil |
| C | Vitalis Médical Périgueux | Marsac-sur-l'Isle | 05 64 31 14 44 | gpt | téléphone ABSENT de la page ; adresse ABSENTE de la page ; remarque : Intérim spécialisé santé |
| C | Actual Limoges | Limoges | 05 55 49 07 22 | gpt | téléphone ABSENT de la page ; adresse ABSENTE de la page |
| C | Triangle Intérim Limoges | Limoges | 05 44 00 04 00 | gpt | téléphone ABSENT de la page ; adresse ABSENTE de la page ; remarque : Page générale du réseau |
| C | Optineris BTP Limoges | Limoges | 05 55 77 71 66 | gpt | téléphone ABSENT de la page ; adresse ABSENTE de la page |
| C | Optineris Saint-Junien | Saint-Junien | 05 55 02 02 55 | gpt | téléphone ABSENT de la page ; adresse ABSENTE de la page |
| C | Job Direct Limoges | Limoges | introuvable | gpt | adresse ABSENTE de la page ; remarque : Téléphone introuvable ; fiche d'agence à confirmer |
| D | Manpower Périgueux | Périgueux | 05 53 45 46 30 | csv | page refusée aux robots (403) : à ouvrir à la main |
| D | Manpower Bergerac | Bergerac | 05 53 22 13 00 | csv | page refusée aux robots (403) : à ouvrir à la main |
| D | Manpower Montpon | Montpon-Ménestérol | 05 53 22 13 00 | csv | page refusée aux robots (403) : à ouvrir à la main ; remarque : Même numéro que Bergerac (tel que publié par Manpower) |
| D | Manpower Espace Nontron | Nontron | 05 53 60 80 00 | csv | page refusée aux robots (403) : à ouvrir à la main |
| D | Manpower Sarlat | Sarlat-la-Canéda | 05 53 31 70 50 | csv | page refusée aux robots (403) : à ouvrir à la main |
| D | Temporis Sarlat | Sarlat-la-Canéda | 05 33 09 28 25 | gpt | page absente ou en erreur (404) |
| D | Profil Intérim Périgueux | Périgueux | 05 53 06 06 21 | gpt | la page ne répond pas (ERR_TLS_CERT_ALTNAME_INVALID) ; remarque : Page d'accueil du réseau |
| D | Profil Intérim Ribérac | Ribérac | 05 53 91 39 07 | gpt | la page ne répond pas (ERR_TLS_CERT_ALTNAME_INVALID) ; remarque : Page d'accueil du réseau |
| D | Profil Intérim Montpon | Montpon-Ménestérol | 05 53 80 33 33 | gpt | la page ne répond pas (ERR_TLS_CERT_ALTNAME_INVALID) ; remarque : Page d'accueil du réseau |
| D | Profil Intérim Thiviers | Thiviers | 05 53 55 05 00 | gpt | la page ne répond pas (ERR_TLS_CERT_ALTNAME_INVALID) ; remarque : Page d'accueil du réseau |
| D | Jubil Intérim Périgueux | Marsac-sur-l'Isle | 05 18 22 20 20 | gpt | page absente ou en erreur (404) ; remarque : SUSPECT : deux réponses de ChatGPT différentes (« à relever » puis adresse) |
| D | Manpower Limoges BTP Transport | Limoges | 05 55 38 84 00 | csv | page refusée aux robots (403) : à ouvrir à la main ; remarque : Accueil sur rendez-vous (mention officielle) |
| D | Manpower Limoges Industrie Tertiaire | Limoges | 05 55 34 81 40 | csv | page refusée aux robots (403) : à ouvrir à la main ; remarque : Accueil sur rendez-vous ; même numéro que le cabinet de recrutement Manpower (tel que publié) |
| D | Manpower Saint-Junien | Saint-Junien | 05 55 43 03 00 | csv | page refusée aux robots (403) : à ouvrir à la main |
| D | Synergie Limoges | Limoges | 05 55 33 20 30 | gpt | page absente ou en erreur (404) |
| D | Proman Limoges | Limoges | 05 55 10 85 92 | gpt | page absente ou en erreur (404) |
| D | Temporis Limoges | Limoges | 05 55 35 13 81 | gpt | page absente ou en erreur (404) ; remarque : Maud Emploi indique la même adresse et le même numéro (écartée) |
| D | R.A.S Intérim Limoges | Limoges | 05 55 50 11 30 | gpt | page absente ou en erreur (404) |
| D | LIP Intérim Limoges | Limoges | 05 19 08 01 71 | gpt | page absente ou en erreur (404) |
| D | Fusion Intérim Limoges | Limoges | 05 55 05 06 00 | gpt | la page ne répond pas (ENOTFOUND) ; remarque : Page d'accueil |
| D | Réseau Alliance Intérim Limoges | Limoges | 05 55 77 60 07 | gpt | la page ne répond pas (UND_ERR_CONNECT_TIMEOUT) ; remarque : Adresse de la page à confirmer |
| D | Réseau Alliance Intérim Saint-Junien | Saint-Junien | 05 55 01 45 14 | gpt | la page ne répond pas (UND_ERR_CONNECT_TIMEOUT) ; remarque : Même adresse que ACTO Intérim Saint-Junien |
