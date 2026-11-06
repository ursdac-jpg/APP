# Prompts du cloud, lots du sas complet (31 octobre 2026)

Un lot = un message à coller dans une session cloud. Résultat à recoller au Claude local. Voir `docs/CHANTIER_VERIFICATION_SAS_EMPLOYEURS.md`. Fabriqué par `scripts/veille_sas/fabriquer_prompts.js` (lots de 25).

Ordre conseillé : les lots qui CONFIRMENT (S3, E4) d'abord, car ils fabriquent directement des fiches pré-validées ; ensuite ceux qui cherchent un site (S2, E2, S1, E1).

## Sommaire

| Groupe | Fiches | Lots |
|---|---|---|
| Structures dont le site répond : confirmer le site, le territoire et relever le numéro affiché | 265 | 1 à 11 |
| Employeurs dont le site répond : confirmer que c'est le bon et la bonne région | 328 | 12 à 25 |
| Structures dont le site proposé ne marche pas : trouver le bon | 99 | 26 à 29 |
| Employeurs dont le site proposé ne marche pas : trouver le bon | 79 | 30 à 33 |
| Structures sans site : trouver la page officielle et le numéro affiché | 108 | 34 à 38 |
| Employeurs sans site : trouver le site et la page de recrutement | 314 | 39 à 51 |

Non traités par un prompt : 30 employeurs et 10 structures dont le site refuse les robots (le cloud serait bloqué de la même façon) : la liste cliquable est dans `docs/A_OUVRIR_PAR_DENIS_2026-10-31.md`.

---

# Lot 1 (S3, 1/11)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), un site est proposé et il répond : vérifie que c'est bien le site officiel de CETTE structure dans le BON territoire, puis trouve (1) la page officielle qui la présente, (2) le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure. Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : n'en cherche jamais ailleurs que sur une page officielle, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Territoire confirmé (commune, 24 ou 87) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Fonds de solidarité pour le logement de la Haute-Vienne (Limoges, portée region) | site proposé : https://www.haute-vienne.fr
2. Fondation pour le Logement des Défavorisés (, portée region) | site proposé : https://www.fondationpourlelogement.fr
3. Croix-Rouge française (, portée region) | site proposé : https://www.croix-rouge.fr
4. Secours Catholique - Caritas France (, portée region) | site proposé : https://www.secours-catholique.org
5. Mission Locale du Haut Périgord (Thiviers) | site proposé : https://missionlocalehautperigord.fr | numéro de la fiche : 05 53 52 59 91
6. Union nationale des Missions Locales (, portée national) | site proposé : https://www.unml.info
7. Cheops - Réseau Cap emploi (, portée national) | site proposé : https://www.cheops-ops.org
8. ASFEL (Limoges) | site proposé : https://www.asfel.fr | numéro de la fiche : 05 19 29 00 50
9. Osengo Limoges (Limoges) | site proposé : https://www.osengo.fr | numéro de la fiche : 05 55 77 75 89
10. IGL Formation (Limoges) | site proposé : https://igl-formation.fr | numéro de la fiche : 05 55 32 32 59
11. Cité de l'Emploi Limoges (Limoges) | site proposé : https://www.limoges-metropole.fr | numéro de la fiche : 05 87 14 10 10
12. L'Atelier budgétaire (Périgueux) | site proposé : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/dordogne/pcb
13. Connect' e-bus UDAF Dordogne (Périgueux) | site proposé : https://dora.inclusion.gouv.fr/services/un-dep-ass-familial--mediation-numerique-qfec
14. Point Conseil Budget du CCAS de Limoges (Limoges) | site proposé : https://www.haute-vienne.gouv.fr/Actions-de-l-Etat/Solidarite-et-cohesion-sociale/Points-Conseil-Budget | numéro de la fiche : 05 55 45 97 50
15. Confédération Syndicale des Familles (Limoges) | site proposé : https://www.haute-vienne.gouv.fr/Actions-de-l-Etat/Solidarite-et-cohesion-sociale/Points-Conseil-Budget | numéro de la fiche : 05 55 37 52 26
16. URAF Nouvelle-Aquitaine - Microcrédit personnel (, portée region) | site proposé : https://www.uraf-nouvelleaquitaine.fr/les-services-aux-familles/microcredit/
17. France Services Mussidan (Mussidan) | site proposé : https://www.france-services.gouv.fr | numéro de la fiche : 05 53 81 05 06
18. France Services La Force (La Force) | site proposé : https://www.france-services.gouv.fr | numéro de la fiche : 05 53 24 00 24
19. France Services Carlux (Carlux) | site proposé : https://www.france-services.gouv.fr | numéro de la fiche : 05 53 59 19 87
20. France Services Mouleydier (Mouleydier) | site proposé : https://www.france-services.gouv.fr | numéro de la fiche : 05 53 23 06 10
21. France Services Château-l'Évêque (Château-l'Évêque) | site proposé : https://www.france-services.gouv.fr | numéro de la fiche : 05 53 46 28 74
22. France Services Boulazac Isle Manoire (Boulazac Isle Manoire) | site proposé : https://www.france-services.gouv.fr | numéro de la fiche : 05 53 35 59 53
23. France Services Limoges Val de l'Aurence (Limoges) | site proposé : https://www.france-services.gouv.fr/le-reseau/france-services-de-limoges-val-de-laurence | numéro de la fiche : 05 55 45 86 38
24. France Services Limoges Nord Beaubreuil (Limoges) | site proposé : https://www.france-services.gouv.fr
25. France Services Aixe-sur-Vienne (Aixe-sur-Vienne) | site proposé : https://www.france-services.gouv.fr

---

# Lot 2 (S3, 2/11)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), un site est proposé et il répond : vérifie que c'est bien le site officiel de CETTE structure dans le BON territoire, puis trouve (1) la page officielle qui la présente, (2) le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure. Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : n'en cherche jamais ailleurs que sur une page officielle, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Territoire confirmé (commune, 24 ou 87) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. France Services Ambazac (Ambazac) | site proposé : https://www.france-services.gouv.fr
2. France Services Bellac (Bellac) | site proposé : https://www.france-services.gouv.fr
3. France Services Bergerac (Bergerac) | site proposé : https://www.france-services.gouv.fr
4. France Services Brantôme en Périgord (Brantôme en Périgord) | site proposé : https://www.france-services.gouv.fr
5. France Services Coulounieix-Chamiers (Coulounieix-Chamiers) | site proposé : https://www.france-services.gouv.fr
6. France Services Eymet (Eymet) | site proposé : https://www.france-services.gouv.fr
7. France Services Lalinde (Lalinde) | site proposé : https://www.france-services.gouv.fr
8. France Services Le Bugue (Le Bugue) | site proposé : https://www.france-services.gouv.fr
9. France Services Monpazier (Monpazier) | site proposé : https://www.france-services.gouv.fr
10. France Services Montignac (Montignac-Lascaux) | site proposé : https://www.france-services.gouv.fr
11. France Services Périgueux (Périgueux) | site proposé : https://www.france-services.gouv.fr
12. France Services Châlus (Châlus) | site proposé : https://www.france-services.gouv.fr | numéro de la fiche : 05 55 78 43 93
13. France Services Châteauponsac (Châteauponsac) | site proposé : https://www.france-services.gouv.fr
14. France Services Eymoutiers (Eymoutiers) | site proposé : https://www.france-services.gouv.fr | numéro de la fiche : 05 44 22 53 36
15. France Services Javerdat (Javerdat) | site proposé : https://www.france-services.gouv.fr | numéro de la fiche : 05 55 03 21 69
16. France Services Le Dorat (Le Dorat) | site proposé : https://www.france-services.gouv.fr | numéro de la fiche : 05 55 60 90 53
17. France Services Nexon (Nexon) | site proposé : https://www.france-services.gouv.fr | numéro de la fiche : 05 55 58 11 05
18. France Services Rochechouart (Rochechouart) | site proposé : https://www.france-services.gouv.fr | numéro de la fiche : 05 87 03 11 50
19. Wimoov Nouvelle-Aquitaine (, portée region) | site proposé : https://www.wimoov.org
20. Mob'In Nouvelle-Aquitaine (, portée region) | site proposé : https://mobin-solutions.fr
21. Mob'In France (, portée national) | site proposé : https://mobin-solutions.fr
22. Centre Info Jeunes de Périgueux (Périgueux) | site proposé : https://www.infojeunes-na.fr | numéro de la fiche : 05 53 53 52 81
23. Info Jeunes Sarlat (Sarlat-la-Canéda) | site proposé : https://www.infojeunes-na.fr | numéro de la fiche : 05 53 31 19 11
24. Mission Locale de l'Agglomération de Limoges Métropole - Antenne Paul Gauguin (Limoges) | site proposé : https://mission-locale-limoges.fr | numéro de la fiche : 05 55 37 06 65
25. Mission Locale de l'Agglomération de Limoges Métropole - Antenne Marcel Vardelle (Limoges) | site proposé : https://mission-locale-limoges.fr | numéro de la fiche : 05 55 49 14 00

---

# Lot 3 (S3, 3/11)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), un site est proposé et il répond : vérifie que c'est bien le site officiel de CETTE structure dans le BON territoire, puis trouve (1) la page officielle qui la présente, (2) le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure. Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : n'en cherche jamais ailleurs que sur une page officielle, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Territoire confirmé (commune, 24 ou 87) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Mission Locale de l'Agglomération de Limoges Métropole - Antenne Fabre-d'Églantine (Limoges) | site proposé : https://mission-locale-limoges.fr | numéro de la fiche : 05 55 10 01 00
2. Info Jeunes Limoges (Limoges) | site proposé : https://www.infojeunes-na.fr | numéro de la fiche : 05 55 10 08 00
3. Info Jeunes France (, portée national) | site proposé : https://www.infojeunesfrance.org
4. 1 jeune 1 solution (, portée national) | site proposé : https://www.1jeune1solution.gouv.fr
5. Caisse d'Allocations Familiales de la Dordogne (Périgueux) | site proposé : https://www.caf.fr/allocataires/caf-de-la-dordogne/offre-de-service/vie-personnelle/je-cherche-un-mode-de-garde-pour-mon-enfant
6. Caisse d'Allocations Familiales de la Haute-Vienne (Limoges) | site proposé : https://www.caf.fr | numéro de la fiche : 05 55 43 40 50
7. Caisse d'Allocations Familiales (, portée national) | site proposé : https://www.caf.fr
8. Maison départementale des personnes handicapées de la Haute-Vienne (Limoges) | site proposé : https://www.haute-vienne.fr/nos-actions/personnes-en-situation-de-handicap/la-mdph | numéro de la fiche : 05 55 14 14 50
9. Cap emploi Haute-Vienne (Limoges) | site proposé : https://www.capemploi-87.com | numéro de la fiche : 05 55 38 89 70
10. Association Valentin Haüy - Comité de Limoges (Limoges, portée national) | site proposé : https://www.avh.asso.fr
11. Unapei Limousin (Limoges, portée region) | site proposé : https://www.unapei.org
12. AFM-Téléthon Nouvelle-Aquitaine (, portée region) | site proposé : https://www.afm-telethon.fr
13. France Parkinson - Comité Nouvelle-Aquitaine (, portée region) | site proposé : https://www.franceparkinson.fr
14. Fédération APAJH Nouvelle-Aquitaine (, portée region) | site proposé : https://www.apajh.org
15. FNATH Groupement Sud-Ouest - Permanence de Périgueux (Périgueux) | site proposé : https://www.fnath.org | numéro de la fiche : 05 53 45 44 50
16. APSAH (Aixe-sur-Vienne) | site proposé : https://www.apsah.asso.fr | numéro de la fiche : 05 55 70 23 84
17. FNATH (, portée national) | site proposé : https://www.fnath.org
18. Unafam (, portée national) | site proposé : https://www.unafam.org
19. Association Valentin Haüy (, portée national) | site proposé : https://www.avh.asso.fr
20. AFM-Téléthon (, portée national) | site proposé : https://www.afm-telethon.fr
21. Fédération APAJH (, portée national) | site proposé : https://www.apajh.org
22. Dispositif académique de validation des acquis (DAVA) de l'Académie de Limoges (Périgueux) | site proposé : https://vae.education.gouv.fr/academie/22
23. Écoles de la CCI Dordogne (Bergerac) | site proposé : https://www.ecoles.dordogne.cci.fr/vae-validation-des-acquis-par-lexperience/ | numéro de la fiche : 05 53 35 72 72
24. Académie de Limoges - Dispositif académique de validation des acquis (Limoges, portée region) | site proposé : https://vae.education.gouv.fr/academie/22 | numéro de la fiche : 06 20 68 49 99
25. Validation des acquis de l'expérience de l'Éducation nationale (, portée national) | site proposé : https://vae.education.gouv.fr/

---

# Lot 4 (S3, 4/11)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), un site est proposé et il répond : vérifie que c'est bien le site officiel de CETTE structure dans le BON territoire, puis trouve (1) la page officielle qui la présente, (2) le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure. Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : n'en cherche jamais ailleurs que sur une page officielle, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Territoire confirmé (commune, 24 ou 87) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Démission-Reconversion (, portée national) | site proposé : https://www.demission-reconversion.gouv.fr/etape3_valider_son_projet
2. CIBC Solutions RH (Périgueux, portée region) | site proposé : https://vae.gouv.fr/regions/nouvelle-aquitaine/conseillers/ | numéro de la fiche : 05 53 45 46 90
3. CIBC Haute-Vienne (Limoges, portée region) | site proposé : https://vae.gouv.fr/regions/nouvelle-aquitaine/conseillers/ | numéro de la fiche : 05 55 45 15 15
4. France VAE (, portée national) | site proposé : https://vae.gouv.fr/
5. Centre national de la fonction publique territoriale (CNFPT) (, portée national) | site proposé : https://www.cnfpt.fr
6. Association nationale pour la formation permanente du personnel hospitalier (ANFH) (, portée national) | site proposé : https://www.anfh.fr
7. Conseillers mobilité-carrière de la fonction publique de l'État (, portée national) | site proposé : https://www.fonction-publique.gouv.fr
8. Agence de services et de paiement - Plateforme VAE des agents hospitaliers (Limoges, portée national) | site proposé : https://vaedem.asp-public.fr
9. Point-Justice de Périgueux (CDAD de la Dordogne) (Périgueux) | site proposé : https://cdad-dordogne.fr/le-c-d-a-d/lieux-d-acces-au-droit.html | numéro de la fiche : 05 53 06 39 33
10. Point-Justice de Bergerac (Bergerac) | site proposé : https://cdad-dordogne.fr/le-c-d-a-d/lieux-d-acces-au-droit.html | numéro de la fiche : 05 53 74 40 00
11. Point-Justice de Sarlat-la-Canéda (Sarlat-la-Canéda) | site proposé : https://cdad-dordogne.fr/le-c-d-a-d/lieux-d-acces-au-droit.html
12. Point-Justice de Vergt (Vergt) | site proposé : https://cdad-dordogne.fr/le-c-d-a-d/lieux-d-acces-au-droit.html | numéro de la fiche : 05 33 09 58 98
13. Point-Justice de Saint-Médard-d'Excideuil (Saint-Médard-d'Excideuil) | site proposé : https://cdad-dordogne.fr/le-c-d-a-d/lieux-d-acces-au-droit.html | numéro de la fiche : 05 53 06 39 33
14. Point-Justice de Nontron (Nontron) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html | numéro de la fiche : 05 53 06 39 33
15. Point-Justice de Terrasson-Lavilledieu (Terrasson-Lavilledieu) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html | numéro de la fiche : 05 53 06 39 33
16. Point-Justice de Ribérac (Ribérac) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html | numéro de la fiche : 05 53 06 39 33
17. Point-Justice de Mussidan (Mussidan) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html | numéro de la fiche : 05 53 06 39 33
18. Point-Justice de Thenon (Thenon) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html | numéro de la fiche : 05 53 06 39 33
19. Point-Justice de Hautefort (Hautefort) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html | numéro de la fiche : 05 53 06 39 33
20. Point-Justice de Villefranche-du-Périgord (Villefranche-du-Périgord) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html | numéro de la fiche : 05 53 06 39 33
21. Point-Justice de Monpazier (Monpazier) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html | numéro de la fiche : 05 53 06 39 33
22. Point-Justice de Thiviers (Thiviers) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html | numéro de la fiche : 05 53 06 39 33
23. Point-Justice de Brantôme en Périgord (Brantôme en Périgord) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html | numéro de la fiche : 05 53 06 39 33
24. Point-Justice de Saint-Astier (Saint-Astier) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html | numéro de la fiche : 05 53 06 39 33
25. Point-Justice de Belvès (Pays de Belvès) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html | numéro de la fiche : 05 53 06 39 33

---

# Lot 5 (S3, 5/11)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), un site est proposé et il répond : vérifie que c'est bien le site officiel de CETTE structure dans le BON territoire, puis trouve (1) la page officielle qui la présente, (2) le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure. Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : n'en cherche jamais ailleurs que sur une page officielle, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Territoire confirmé (commune, 24 ou 87) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Point-Justice de Saint-Aulaye (Saint-Aulaye-Puymangou) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html | numéro de la fiche : 05 53 06 39 33
2. Point-Justice du Commissaire de justice de Limoges (Limoges) | site proposé : https://lannuaire.service-public.gouv.fr/nouvelle-aquitaine/haute-vienne/4a428d7d-213c-4548-a207-194dcba4a2a1 | numéro de la fiche : 05 87 19 35 94
3. Point-Justice des Chambres consulaires de Limoges (Limoges) | site proposé : https://lannuaire.service-public.gouv.fr/nouvelle-aquitaine/haute-vienne/f610dd40-9745-43d7-aee9-5ce1ae9b93ca | numéro de la fiche : 05 87 19 34 00
4. Point-Justice des associations caritatives de Limoges (Limoges) | site proposé : https://lannuaire.service-public.gouv.fr/nouvelle-aquitaine/haute-vienne/a7bacfc6-4eaf-40b1-acfc-289159152879 | numéro de la fiche : 05 55 77 42 76
5. Défenseur des droits (, portée region) | site proposé : https://www.defenseurdesdroits.fr
6. Service Public (, portée national) | site proposé : https://www.service-public.fr
7. Ministère de la Justice (, portée national) | site proposé : https://www.justice.fr
8. Ordre des avocats du Barreau de Limoges (Limoges) | site proposé : https://www.avocats-limoges.org
9. Barreau de Limoges (Limoges) | site proposé : https://www.avocats-limoges.org
10. Conseil national des barreaux (, portée national) | site proposé : https://www.cnb.avocat.fr
11. Fédération nationale des CIDFF (, portée national) | site proposé : https://fncidff.info
12. AFPA Nouvelle-Aquitaine (, portée region) | site proposé : https://www.afpa.fr
13. AGEFIPH Nouvelle-Aquitaine (, portée national) | site proposé : https://www.agefiph.fr
14. Adie Dordogne (Saint-Astier) | site proposé : https://www.adie.org | numéro de la fiche : 09 69 32 81 10
15. Maison de la Justice et du Droit de Périgueux (Périgueux) | site proposé : https://www.justice.fr
16. Association d'aide aux victimes AVIMED France Victimes 87 (Limoges) | site proposé : https://france-victimes.fr
17. France Victimes (, portée national) | site proposé : https://www.france-victimes.fr
18. Réseau des délégués du Défenseur des droits (, portée national) | site proposé : https://www.defenseurdesdroits.fr
19. Association de Soutien de la Dordogne (ASD) - Pôle Logement (Périgueux) | site proposé : https://www.asd24.org/service/les-logements-de-transition-et-l-accompagnement-en-matiere-de-logement
20. Hestia 87 - ASLL / AVDL (Limoges) | site proposé : https://hestia87.fr/actions/assl-avdl/ | numéro de la fiche : 05 55 77 93 43
21. Hestia 87 - ALBA (Limoges) | site proposé : https://hestia87.fr/actions/alba/ | numéro de la fiche : 05 55 79 30 25
22. Services pénitentiaires d'insertion et de probation (SPIP) (, portée national) | site proposé : https://www.justice.gouv.fr/annuaire/structures-reinsertion-demploi/services-penitentiaires-dinsertion-probation-spip
23. Chambre d'agriculture de la Dordogne (Périgueux) | site proposé : https://dordogne.chambre-agriculture.fr | numéro de la fiche : 05 53 35 88 88
24. Chambre d'agriculture de la Haute-Vienne (Limoges) | site proposé : https://haute-vienne.chambre-agriculture.fr | numéro de la fiche : 05 55 10 37 00
25. Réseau Entreprendre Nouvelle-Aquitaine (, portée region) | site proposé : https://www.reseau-entreprendre.org/nouvelle-aquitaine

---

# Lot 6 (S3, 6/11)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), un site est proposé et il répond : vérifie que c'est bien le site officiel de CETTE structure dans le BON territoire, puis trouve (1) la page officielle qui la présente, (2) le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure. Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : n'en cherche jamais ailleurs que sur une page officielle, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Territoire confirmé (commune, 24 ou 87) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Bpifrance Création (, portée national) | site proposé : https://bpifrance-creation.fr
2. Chambres d'agriculture France (, portée national) | site proposé : https://chambres-agriculture.fr
3. CMA France (, portée national) | site proposé : https://www.artisanat.fr
4. Chambre d'agriculture de la Dordogne - Antenne du Périgord Noir (Sarlat-la-Canéda) | site proposé : https://dordogne.chambre-agriculture.fr
5. France Services Vallée Dordogne Forêt Bessède - Belvès (Pays-de-Belvès) | site proposé : https://ccdordogne-bessede.fr/aides-creation-entreprise/ | numéro de la fiche : 05 53 31 44 81
6. France Services Vallée Dordogne Forêt Bessède - Saint-Cyprien (Saint-Cyprien) | site proposé : https://ccdordogne-bessede.fr/aides-creation-entreprise/ | numéro de la fiche : 05 53 28 63 90
7. Réseau Entreprendre Limousin (Limoges) | site proposé : https://www.limoges.fr/ville-creative/accompagnement-la-creation
8. La Fabrique à Initiatives Limousin (Limoges, portée region) | site proposé : https://www.franceactive.org/solutions/la-fabrique-a-initiatives/
9. Coopérative Tiers-Lieux Nouvelle-Aquitaine (, portée region) | site proposé : https://coop.tierslieux.net/tiers-lieux/creer-un-tiers-lieu/etre-accompagne/
10. BGE Nouvelle-Aquitaine (, portée region) | site proposé : https://www.bge-nouvelle-aquitaine.fr
11. Initiative France (, portée national) | site proposé : https://www.initiative-france.fr
12. Réseau Entreprendre (, portée national) | site proposé : https://www.reseau-entreprendre.org
13. Adie (, portée national) | site proposé : https://www.adie.org
14. Coopérer pour Entreprendre (, portée national) | site proposé : https://www.cooperer.coop
15. Coopérative Tiers-Lieux - Annuaire régional (, portée region) | site proposé : https://coop.tierslieux.net/carte
16. Direction départementale de l'emploi, du travail, des solidarités et de la protection des populations de la Dordogne (DDETSPP) (Périgueux) | site proposé : https://www.dordogne.gouv.fr/Services-de-l-Etat/Les-directions-interministerielles/Direction-de-l-Emploi-du-Travail-des-Solidarites-et-de-la-Protection-des-Populations-DDETSPP
17. Maison de l'Emploi du Grand Périgueux (Périgueux) | site proposé : https://www.mde-grandperigueux.fr
18. Les Entreprises s'engagent (, portée national) | site proposé : https://www.lesentreprises-sengagent.gouv.fr
19. Service Public - Aides à l'embauche (, portée national) | site proposé : https://entreprendre.service-public.fr
20. ANEFA Dordogne (Coulounieix-Chamiers) | site proposé : https://www.anefa.org/dordogne/page-daccueil/nos-missions/
21. Conseil départemental de la Haute-Vienne (Limoges) | site proposé : https://www.haute-vienne.fr/nos-actions/insertion/vous-etes-un-employeur-du-public-ou-du-prive
22. Entreprendre.Service-Public.fr (, portée national) | site proposé : https://entreprendre.service-public.fr
23. Réseau Entreprendre Aquitaine (, portée region) | site proposé : https://www.reseau-entreprendre.org/aquitaine
24. Chambres d'agriculture Nouvelle-Aquitaine (, portée region) | site proposé : https://nouvelle-aquitaine.chambres-agriculture.fr
25. Centre Ressources Illettrisme Analphabétisme Nouvelle-Aquitaine (CRIA Nouvelle-Aquitaine) (, portée region) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation

---

# Lot 7 (S3, 7/11)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), un site est proposé et il répond : vérifie que c'est bien le site officiel de CETTE structure dans le BON territoire, puis trouve (1) la page officielle qui la présente, (2) le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure. Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : n'en cherche jamais ailleurs que sur une page officielle, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Territoire confirmé (commune, 24 ou 87) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. ENTRE DEUX (Limoges, portée region) | site proposé : https://annuairesolidaire.fr/services/caa4dc93ba-action-socio-linguistique-complementaire-du-cir-limoges/ | numéro de la fiche : 05 87 19 69 95
2. POLARIS Formation (Limoges) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation/polaris-formation/ | numéro de la fiche : 05 55 34 34 34
3. Centre Social VITAL (Limoges) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation/centre-social-vital/ | numéro de la fiche : 05 55 37 73 04
4. AFP 87 (Limoges) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation?locations=66
5. Association de Soutien de la Dordogne (ASD) (Périgueux) | site proposé : https://www.asd24.fr
6. Centre d'accueil pour demandeurs d'asile de l'Association de Soutien de la Dordogne (Périgueux) | site proposé : https://www.asd24.fr
7. Préfecture de la Haute-Vienne - Bureau de l'immigration et de l'intégration (Limoges) | site proposé : https://www.haute-vienne.gouv.fr/Demarches/Accueil-des-etrangers-vos-demarches-en-Haute-Vienne | numéro de la fiche : 05 55 44 18 00
8. Structure de premier accueil des demandeurs d'asile de Limoges (Limoges) | site proposé : https://www.haute-vienne.gouv.fr/Demarches/Accueil-des-etrangers-vos-demarches-en-Haute-Vienne/Demander-l-asile/Informations-generales | numéro de la fiche : 05 19 99 10 60
9. Office français de protection des réfugiés et apatrides (OFPRA) (, portée national) | site proposé : https://www.ofpra.gouv.fr
10. Administration numérique pour les étrangers en France (ANEF) (, portée national) | site proposé : https://administration-etrangers-en-france.interieur.gouv.fr
11. Agence régionale de santé Nouvelle-Aquitaine - Délégation départementale de la Dordogne (Périgueux) | site proposé : https://www.nouvelle-aquitaine.ars.sante.fr/ | numéro de la fiche : 09 69 37 00 22
12. Centre départemental de santé - site d'Excideuil (Excideuil) | site proposé : https://www.dordogne.fr/relever-les-defis-du-21e-siecle/lavenir-en-grand/centre-departemental-de-sante | numéro de la fiche : 05 53 02 06 00
13. Centre départemental de santé - site de Ribérac (Ribérac) | site proposé : https://www.dordogne.fr/relever-les-defis-du-21e-siecle/lavenir-en-grand/centre-departemental-de-sante | numéro de la fiche : 05 53 02 07 20
14. Centre départemental de santé - site de Saint-Médard-de-Mussidan (Saint-Médard-de-Mussidan) | site proposé : https://www.dordogne.fr/relever-les-defis-du-21e-siecle/lavenir-en-grand/centre-departemental-de-sante | numéro de la fiche : 05 53 02 06 20
15. Agence régionale de santé Nouvelle-Aquitaine - Délégation départementale de la Haute-Vienne (Limoges) | site proposé : https://www.nouvelle-aquitaine.ars.sante.fr/
16. Centre Hospitalier Esquirol (Limoges) | site proposé : https://www.ch-esquirol-limoges.fr/notre-etablissement/presentation-generale/presentation/ | numéro de la fiche : 05 55 43 10 10
17. Agence régionale de santé Nouvelle-Aquitaine (, portée region) | site proposé : https://www.nouvelle-aquitaine.ars.sante.fr/
18. Association Addictions France (, portée national) | site proposé : https://addictions-france.org
19. Psycom (, portée national) | site proposé : https://www.psycom.org
20. Centre d'information de conseil et d'accueil des salariés (Cicas) - Dordogne (Périgueux) | site proposé : https://lannuaire.service-public.gouv.fr/nouvelle-aquitaine/dordogne/d0c52cfb-701f-40e9-a9ca-0d1b82fb467a | numéro de la fiche : 09 70 66 06 60
21. Centre d'information de conseil et d'accueil des salariés (Cicas) - Haute-Vienne (Limoges) | site proposé : https://lannuaire.service-public.gouv.fr/nouvelle-aquitaine/haute-vienne/1f442393-418a-43cc-a8dd-dd709fc06f92 | numéro de la fiche : 09 70 66 06 60
22. AFPA Haute-Vienne (Limoges) | site proposé : https://www.afpa.fr
23. Cnam Nouvelle-Aquitaine - centre de Limoges (Limoges) | site proposé : https://www.cnam-nouvelle-aquitaine.fr
24. Chambre de métiers et de l'artisanat de la Haute-Vienne (Limoges) | site proposé : https://www.cma-nouvelleaquitaine.fr
25. Service social départemental de la Haute-Vienne (Limoges) | site proposé : https://www.haute-vienne.fr

---

# Lot 8 (S3, 8/11)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), un site est proposé et il répond : vérifie que c'est bien le site officiel de CETTE structure dans le BON territoire, puis trouve (1) la page officielle qui la présente, (2) le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure. Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : n'en cherche jamais ailleurs que sur une page officielle, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Territoire confirmé (commune, 24 ou 87) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Service insertion du Conseil départemental de la Haute-Vienne (Limoges) | site proposé : https://www.haute-vienne.fr
2. Coop'Alpha Limousin (Limoges) | site proposé : https://www.coopalpha.coop
3. Délégués du Défenseur des droits en Haute-Vienne (Limoges) | site proposé : https://www.defenseurdesdroits.fr
4. Entreprises adaptées et ESAT de la Haute-Vienne (Limoges) | site proposé : https://annuaire.action-sociale.org
5. Habitat Jeunes Limoges (Limoges) | site proposé : https://www.unhaj.org
6. France Travail Haute-Vienne (Limoges) | site proposé : https://www.francetravail.fr | numéro de la fiche : 09 72 72 39 49
7. France Travail Haute-Vienne - accompagnement justice (Limoges) | site proposé : https://www.francetravail.fr
8. GEIQ Limousin (Limoges) | site proposé : https://www.lesgeiq.fr
9. MSA du Limousin (Limoges) | site proposé : https://limousin.msa.fr
10. PLIE Limoges Métropole (Limoges) | site proposé : https://www.limoges-metropole.fr
11. Point régional conseil VAE Haute-Vienne (Limoges) | site proposé : https://www.vae.gouv.fr
12. Points-justice de la Haute-Vienne (Limoges) | site proposé : https://www.justice.fr
13. Préfecture de la Haute-Vienne (Limoges) | site proposé : https://www.haute-vienne.gouv.fr | numéro de la fiche : 05 55 44 18 00
14. Protection maternelle et infantile de la Haute-Vienne (Limoges) | site proposé : https://www.haute-vienne.fr
15. Réseau France Services de la Haute-Vienne (Limoges) | site proposé : https://www.haute-vienne.gouv.fr/Demarches/France-services/France-services
16. Réseau des conseillers numériques France Services de la Haute-Vienne (Limoges) | site proposé : https://www.conseiller-numerique.gouv.fr
17. Centre communal d'action sociale de Saint-Junien (Saint-Junien) | site proposé : https://www.saint-junien.fr
18. Centre communal d'action sociale d'Aixe-sur-Vienne (Aixe-sur-Vienne) | site proposé : https://www.aixesurvienne.fr
19. Centre communal d'action sociale de Saint-Yrieix-la-Perche (Saint-Yrieix-la-Perche) | site proposé : https://www.saint-yrieix.fr
20. Centre communal d'action sociale de Bellac (Bellac) | site proposé : https://www.bellac.fr
21. AF2P - Ligue 24 (Bergerac) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation/app-bergerac/ | numéro de la fiche : 05 53 63 14 93
22. CLAP Sud-Ouest (, portée region) | site proposé : https://clap-so.org/les-secteurs/cri-aquitaine/
23. Croix-Rouge française - Délégation territoriale de la Haute-Vienne (Limoges) | site proposé : https://www.croix-rouge.fr/delegation-territoriale-de-la-haute-vienne | numéro de la fiche : 05 55 32 08 87
24. Centre d'information et d'orientation de Bergerac (Bergerac) | site proposé : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/dordogne/cio
25. Centre d'information et d'orientation de Nontron (Nontron) | site proposé : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/dordogne/cio

---

# Lot 9 (S3, 9/11)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), un site est proposé et il répond : vérifie que c'est bien le site officiel de CETTE structure dans le BON territoire, puis trouve (1) la page officielle qui la présente, (2) le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure. Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : n'en cherche jamais ailleurs que sur une page officielle, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Territoire confirmé (commune, 24 ou 87) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Centre d'information et d'orientation de Périgueux (Périgueux) | site proposé : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/dordogne/cio | numéro de la fiche : 05 53 35 65 00
2. Centre d'information et d'orientation de Ribérac (Ribérac) | site proposé : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/dordogne/cio
3. Centre d'information et d'orientation de Sarlat-la-Canéda (Sarlat-la-Canéda) | site proposé : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/dordogne/cio
4. Centre d'information et d'orientation de Bellac (Bellac) | site proposé : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/haute-vienne/cio
5. Centre d'information et d'orientation de Limoges (Limoges) | site proposé : https://lannuaire.service-public.gouv.fr/nouvelle-aquitaine/haute-vienne/b6509d4d-2135-4571-b4a4-5c5f4357d1bf | numéro de la fiche : 05 87 50 46 00
6. Centre d'information et d'orientation de Saint-Junien (Saint-Junien) | site proposé : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/haute-vienne/cio
7. Centre d'information et d'orientation de Saint-Yrieix-la-Perche (Saint-Yrieix-la-Perche) | site proposé : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/haute-vienne/cio
8. ANEFA du Limousin (Limoges) | site proposé : https://www.anefa.org | numéro de la fiche : 07 88 44 22 75
9. Cap Métiers Nouvelle-Aquitaine (, portée region) | site proposé : https://www.cap-metiers.fr/ | numéro de la fiche : 05 57 81 45 65
10. AlloCMonInfo - Cap Métiers Nouvelle-Aquitaine (Limoges, portée region) | site proposé : https://www.cap-metiers.fr/ | numéro de la fiche : 08 00 94 01 66
11. Espaces Régionaux d'Information de Proximité (ERIP) (, portée region) | site proposé : https://www.nouvelle-aquitaine.fr/les-actions/economie-et-emploi/formation-professionnelle-et-emploi/erip-points-informations-et-conseils
12. ANEFA (, portée national) | site proposé : https://www.anefa.org
13. GEIQ Agri Limousin Périgord - Antenne Dordogne (Coulounieix-Chamiers) | site proposé : https://geiqagri-limousin-perigord.fr/contact/ | numéro de la fiche : 05 53 02 61 32
14. Comité Régional des GEIQ de Nouvelle-Aquitaine (, portée region) | site proposé : https://www.lesgeiq-nouvelleaquitaine.fr/ | numéro de la fiche : 05 56 46 35 28
15. GEIQ Santé Social Médico-Social Nouvelle-Aquitaine (, portée region) | site proposé : https://plateforme.inclusion.gouv.fr/company/7379/card
16. GEIQ Sport et Animation Nouvelle-Aquitaine (, portée region) | site proposé : https://www.lesgeiq-nouvelleaquitaine.fr/trouver-un-geiq-en-nouvelle-aquitaine/geiq-sport-et-animation-nouvelle-aquitaine/
17. Fédération Française des GEIQ (, portée national) | site proposé : https://www.lesgeiq.fr/
18. EGEE Dordogne (Périgueux) | site proposé : https://www.egee.asso.fr
19. 60 000 Rebonds Nouvelle-Aquitaine (Périgueux) | site proposé : https://60000rebonds.com
20. Jeune Chambre Économique de Bergerac (Bergerac) | site proposé : https://www.jcef.fr
21. EGEE Haute-Vienne (Limoges) | site proposé : https://www.egee.asso.fr | numéro de la fiche : 05 55 45 18 38
22. Jeune Chambre Économique de Limoges (Limoges) | site proposé : https://www.jcef.fr
23. EGEE Nouvelle-Aquitaine (, portée region) | site proposé : https://www.egee.asso.fr
24. Jeune Chambre Économique Française (, portée national) | site proposé : https://jcef.asso.fr | numéro de la fiche : 01 47 66 24 47
25. Centre des Jeunes Dirigeants d'entreprise (, portée national) | site proposé : https://www.cjd.net | numéro de la fiche : 01 53 35 03 00

---

# Lot 10 (S3, 10/11)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), un site est proposé et il répond : vérifie que c'est bien le site officiel de CETTE structure dans le BON territoire, puis trouve (1) la page officielle qui la présente, (2) le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure. Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : n'en cherche jamais ailleurs que sur une page officielle, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Territoire confirmé (commune, 24 ou 87) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Périgord Habitat (Périgueux) | site proposé : https://www.perigordhabitat.fr | numéro de la fiche : 05 53 02 55 00
2. Fédération des Centres Sociaux de la Haute-Vienne (Limoges) | site proposé : https://www.centres-sociaux.fr
3. ODHAC 87 (Le Palais-sur-Vienne) | site proposé : https://www.odhac87.fr | numéro de la fiche : 05 55 05 42 00
4. Union Départementale des Associations Familiales de la Haute-Vienne (Limoges) | site proposé : https://www.udaf87.fr | numéro de la fiche : 05 55 10 31 00
5. Planning Familial Nouvelle-Aquitaine (, portée region) | site proposé : https://planning-familial-na.org
6. Le Planning Familial 87 - Haute-Vienne / Limoges (Limoges) | site proposé : https://planning-familial-na.org/antenne-departementale/haute-vienne-87-limoges/ | numéro de la fiche : 06 44 96 43 86
7. Le Planning Familial 87 - Haute-Vienne / Saint-Yrieix-la-Perche (Saint-Yrieix-la-Perche) | site proposé : https://planning-familial-na.org/antenne-departementale/haute-vienne-87-saint-yrieix-la-perche/ | numéro de la fiche : 06 41 95 02 60
8. Alcooliques Anonymes France (, portée national) | site proposé : https://alcooliques-anonymes.fr | numéro de la fiche : 09 69 39 40 20
9. Consultation de planification des Carmes (Limoges) | site proposé : https://www.haute-vienne.fr/tous-les-annuaires/tous-les-centres-de-planification
10. Centre de planification familiale de Saint-Junien (Saint-Junien) | site proposé : https://www.haute-vienne.fr/tous-les-annuaires/tous-les-centres-de-planification
11. Centre de planification de Saint-Yrieix (Saint-Yrieix-la-Perche) | site proposé : https://www.haute-vienne.fr/tous-les-annuaires/tous-les-centres-de-planification
12. Centre de gestion de la fonction publique territoriale de la Dordogne (Marsac-sur-l'Isle) | site proposé : https://www.cdg24.fr/ | numéro de la fiche : 05 53 02 87 00
13. Centre d'information et de recrutement des forces armées de Périgueux (Périgueux) | site proposé : https://lannuaire.service-public.gouv.fr/nouvelle-aquitaine/dordogne/ed48ebed-2cc3-4f79-8db9-066b42b97be8 | numéro de la fiche : 05 53 02 82 75
14. Centre de gestion de la fonction publique territoriale de la Haute-Vienne (Limoges) | site proposé : https://www.cdg87.fr/ | numéro de la fiche : 05 55 30 08 40
15. Centre d'information et de recrutement des forces armées de Limoges (Limoges) | site proposé : https://lannuaire.service-public.gouv.fr/nouvelle-aquitaine/haute-vienne/ae90453d-0f29-4ed2-8c3b-daea5462d950 | numéro de la fiche : 05 55 34 84 00
16. Choisir le service public (, portée national) | site proposé : https://choisirleservicepublic.gouv.fr
17. SCORE - Concours et recrutements de l'État (, portée national) | site proposé : https://www.fonction-publique.gouv.fr/score
18. Service de Remplacement Dordogne (Coulounieix-Chamiers) | site proposé : https://servicederemplacement.fr/les-structures-locales/nouvelle-aquitaine-10 | numéro de la fiche : 05 53 35 88 48
19. FDSEA Dordogne - Service Employeurs (Coulounieix-Chamiers) | site proposé : https://fdsea24.fr/services-employeurs/ | numéro de la fiche : 05 53 35 88 38
20. MSA Dordogne Lot-et-Garonne - Santé au travail (Périgueux) | site proposé : https://dlg.msa.fr/lfp/sst/st | numéro de la fiche : 05 53 67 77 23
21. Service de Remplacement Haute-Vienne (Panazol) | site proposé : https://servicederemplacement.fr/les-structures-locales/nouvelle-aquitaine-10 | numéro de la fiche : 05 87 50 41 10
22. MSA du Limousin - Santé Sécurité au Travail (Limoges) | site proposé : https://limousin.msa.fr | numéro de la fiche : 05 55 49 85 00
23. Fédération Service de Remplacement Nouvelle-Aquitaine (, portée region) | site proposé : https://servicederemplacement.fr/les-structures-locales/nouvelle-aquitaine-10 | numéro de la fiche : 05 56 01 33 60
24. MSA - Santé Sécurité au Travail (, portée national) | site proposé : https://ssa.msa.fr
25. L'Atelier, Service d'accueil et d'orientation (SAO) (Bergerac) | site proposé : https://atelier-asso.fr/ | numéro de la fiche : 05 53 22 79 00

---

# Lot 11 (S3, 11/11)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), un site est proposé et il répond : vérifie que c'est bien le site officiel de CETTE structure dans le BON territoire, puis trouve (1) la page officielle qui la présente, (2) le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure. Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : n'en cherche jamais ailleurs que sur une page officielle, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Territoire confirmé (commune, 24 ou 87) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. L'Atelier, Domiciliation (Bergerac) | site proposé : https://atelier-asso.fr/ | numéro de la fiche : 06 46 34 09 89
2. L'Atelier, Service hébergement de Bergerac (Bergerac) | site proposé : https://atelier-asso.fr/ | numéro de la fiche : 05 35 56 99 65
3. L'Atelier, Service hébergement de Sarlat (Sarlat-la-Canéda) | site proposé : https://atelier-asso.fr/
4. L'Atelier, Bar sans alcool et médiation santé (Bergerac) | site proposé : https://atelier-asso.fr/
5. L'Atelier, Club de prévention spécialisée (Bergerac) | site proposé : https://atelier-asso.fr/ | numéro de la fiche : 05 53 22 78 50
6. L'Atelier, Espace rencontre parents-enfants (Bergerac) | site proposé : https://atelier-asso.fr/ | numéro de la fiche : 05 53 57 78 26
7. Maison des adolescents de la Dordogne (MDA 24, gérée par l'Atelier) (Bergerac) | site proposé : https://atelier-asso.fr/
8. L'Atelier, Centre provisoire d'hébergement (CPH) de Bergerac (Bergerac) | site proposé : https://atelier-asso.fr/ | numéro de la fiche : 05 53 57 78 93
9. L'Atelier, Centre provisoire d'hébergement (CPH) de Sarlat (Sarlat-la-Canéda) | site proposé : https://atelier-asso.fr/ | numéro de la fiche : 05 33 09 71 54
10. L'Atelier, Plateforme départementale pour les bénéficiaires de la protection internationale (BPI) (Bergerac) | site proposé : https://atelier-asso.fr/ | numéro de la fiche : 06 46 34 09 89
11. Parcours Confiance (Institut de microcrédit) (, portée national) | site proposé : https://parcours-confiance.fr
12. Action Logement, service d'accompagnement social (, portée national) | site proposé : https://www.actionlogement.fr/le-cil-pass-assistance | numéro de la fiche : 09 70 800 800
13. Action Logement, prêts pour les salariés (travaux et accession) (, portée national) | site proposé : https://actionlogement.fr/le-pret-travaux-amelioration
14. BASE (Bergerac Actions Solidarité Emploi) () | site proposé : https://associationbase.fr/ | numéro de la fiche : 05 53 58 88 69
15. Association d'aide à la santé mentale Croix Marine Dordogne () | site proposé : https://www.croixmarine24.fr/ | numéro de la fiche : 05 53 35 64 20

---

# Lot 12 (E4, 1/14)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, un site est proposé et il répond. Vérifie que c'est bien LE SITE OFFICIEL de CET employeur et qu'il est actif dans la bonne zone (Dordogne 24 et/ou Haute-Vienne 87, ou ses communes citées). Si une page de recrutement est proposée, vérifie qu'elle appartient à cet employeur et concerne la bonne région ; si aucune n'est proposée, cherche-en une. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site confirmé (oui / non / autre adresse) | Page de recrutement confirmée ou trouvée | Présence 24 / 87 ou commune (la phrase lue) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. B&M (commerce-vente ; Limoges) | site proposé : https://www.bmstores.fr
2. C&A (commerce-vente ; Boisseuil) | site proposé : https://www.c-and-a.com
3. Géant des Beaux-Arts (commerce-vente ; Limoges) | site proposé : https://www.geant-beaux-arts.fr
4. Lapeyre (commerce-vente ; Limoges) | site proposé : https://www.lapeyre.fr
5. Mobilier de France (commerce-vente ; Feytiat) | site proposé : https://www.mobilierdefrance.com | recrutement proposé : https://recrutement.mobilierdefrance.com
6. Le Moulin du Roc (hotellerie-restauration ; Brantôme en Périgord) | site proposé : https://www.moulinduroc.com | recrutement proposé : https://www.moulinduroc.com/recrutement
7. Château des Vigiers (hotellerie-restauration ; Monestier) | site proposé : https://vigiers.com | recrutement proposé : https://vigiers.com/fr/hotel-dordogne/recrutement-dordogne.php
8. Slow Village Séveilles (hotellerie-restauration ; Coux et Bigaroque-Mouzens) | site proposé : https://www.slow-village.com | recrutement proposé : https://www.slow-village.com
9. Le Clos du Moulin (hotellerie-restauration ; Terrasson-Lavilledieu) | site proposé : https://www.leclosdumoulin.com
10. The Originals City Hôtel Albizia (hotellerie-restauration ; Sarlat-la-Canéda) | site proposé : https://www.theoriginalshotels.com
11. Kyriad Périgueux Boulazac (hotellerie-restauration ; Boulazac Isle Manoire) | site proposé : https://www.kyriad.com
12. Campanile Périgueux Boulazac (hotellerie-restauration ; Boulazac Isle Manoire) | site proposé : https://www.campanile.com
13. Première Classe Périgueux Boulazac (hotellerie-restauration ; Boulazac Isle Manoire) | site proposé : https://www.premiereclasse.com
14. Vacancéole Le Clos du Rocher (hotellerie-restauration ; Les Eyzies) | site proposé : https://www.vacanceole.com
15. Huttopia Sarlat (hotellerie-restauration ; Sarlat-la-Canéda) | site proposé : https://europe.huttopia.com
16. Domaine d'Essendiéras (hotellerie-restauration ; Saint-Médard-d'Excideuil) | site proposé : https://www.essendieras.fr | recrutement proposé : https://www.essendieras.fr/recrutement
17. Campanile Limoges Nord (hotellerie-restauration ; Limoges) | site proposé : https://www.campanile.com
18. Kyriad Limoges Centre Gare Atrium (hotellerie-restauration ; Limoges) | site proposé : https://www.kyriad.com
19. The Originals City Hôtel Saint-Martial (hotellerie-restauration ; Limoges) | site proposé : https://www.theoriginalshotels.com
20. Logis Hôtel Auberge Dupuytren (hotellerie-restauration ; Pierre-Buffière) | site proposé : https://www.logishotels.com
21. La Chapelle Saint Martin (hotellerie-restauration ; Nieul) | site proposé : https://www.chapellesaintmartin.com
22. Grand Frais Bergerac (commerce-vente ; Bergerac) | site proposé : https://www.grandfrais.com/magasins/bergerac
23. Grand Frais Limoges Centre (commerce-vente ; Limoges) | site proposé : https://www.grandfrais.com/magasins/limoges-centre
24. Grand Frais Limoges Nord (commerce-vente ; Limoges) | site proposé : https://www.grandfrais.com/magasins/limoges-nord
25. Grand Frais Limoges Sud (commerce-vente ; Limoges) | site proposé : https://www.grandfrais.com/magasins/limoges-sud

---

# Lot 13 (E4, 2/14)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, un site est proposé et il répond. Vérifie que c'est bien LE SITE OFFICIEL de CET employeur et qu'il est actif dans la bonne zone (Dordogne 24 et/ou Haute-Vienne 87, ou ses communes citées). Si une page de recrutement est proposée, vérifie qu'elle appartient à cet employeur et concerne la bonne région ; si aucune n'est proposée, cherche-en une. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site confirmé (oui / non / autre adresse) | Page de recrutement confirmée ou trouvée | Présence 24 / 87 ou commune (la phrase lue) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Le Brit Europ'Hôtel Bergerac (hotellerie-restauration ; Bergerac) | site proposé : https://www.europ-hotel-bergerac.com/
2. Logis Hôtel & Restaurant Ludik (hotellerie-restauration ; Bergerac) | site proposé : https://ludikresort.com/
3. Camping La Pelouse (hotellerie-restauration ; Bergerac) | site proposé : https://www.bergerac.fr/decouvrir-bergerac/tourisme/
4. Domaine de l'Étang de Bazange (hotellerie-restauration ; Monfaucon) | site proposé : https://www.camping-bazange-dordogne.com/
5. Restaurant Hercule Poireau (hotellerie-restauration ; Périgueux) | site proposé : https://www.tourisme-grandperigueux.fr/fiche/hercule-poireau/
6. Restaurant Capelo (hotellerie-restauration ; Périgueux) | site proposé : https://www.restaurant-capelo-perigueux.fr/
7. Restaurant Eden (hotellerie-restauration ; Périgueux) | site proposé : https://restaurant-eden-perigueux-24.fr/fr/page/contact
8. Camping d'Auberoche (hotellerie-restauration ; Bassillac et Auberoche) | site proposé : https://campingdauberoche.fr/
9. Camping Le Domaine du Bois Coquet (hotellerie-restauration ; La Douze) | site proposé : https://www.tourisme-grandperigueux.fr/fiche/camping-le-domaine-du-bois-coquet/
10. Domaine de Loisirs Le Montant (hotellerie-restauration ; Sarlat-la-Canéda) | site proposé : https://www.camping-sarlat.com/
11. Flower Camping La Sagne (hotellerie-restauration ; Vitrac) | site proposé : https://www.camping-la-sagne.com/
12. Les Chalets du Périgord (hotellerie-restauration ; Sarlat-la-Canéda) | site proposé : https://www.location-vacance-sarlat.com/
13. Camping La Châtaigneraie (hotellerie-restauration ; Prats-de-Carlux) | site proposé : https://www.camping-vagues-oceanes.com/camping-dordogne-et-lot/la-chataigneraie
14. Le Bistro de l'Octroi (hotellerie-restauration ; Sarlat-la-Canéda) | site proposé : https://lebistrodeloctroi.fr/
15. Restaurant L'Esprit Sarlat (hotellerie-restauration ; Sarlat-la-Canéda) | site proposé : https://www.lesprit-sarlat.com/
16. L'Assiette Sarladaise (hotellerie-restauration ; Sarlat-la-Canéda) | site proposé : https://www.lassiettesarladaise-sarlat.fr/
17. Mairie de Sarlat-la-Canéda - restauration scolaire (hotellerie-restauration ; Sarlat-la-Canéda) | site proposé : https://sarlat.fr/mon-quotidien/scolarite-enfance-et-jeunesse/les-ecoles-de-sarlat/la-restauration-scolaire/
18. ibis budget Limoges Nord (hotellerie-restauration ; Limoges) | site proposé : https://all.accor.com/hotel/A475/index.en.shtml
19. Mercure Limoges Centre (hotellerie-restauration ; Limoges) | site proposé : https://all.accor.com/hotel/5955/index.fr.shtml
20. greet hotel Limoges Nord (hotellerie-restauration ; Limoges) | site proposé : https://all.accor.com/hotel/C343/index.fr.shtml
21. Hôtel des Deux Moulins (hotellerie-restauration ; Limoges) | site proposé : https://www.hotel-limoges.com/contact
22. La Table d'Adrien (hotellerie-restauration ; Limoges) | site proposé : https://www.latabledadrien.fr/
23. Brasserie Le Versailles (hotellerie-restauration ; Limoges) | site proposé : https://www.brasserie-le-versailles-limoges.com/
24. Camping Paradis Les Deux Îles (hotellerie-restauration ; Peyrat-le-Château) | site proposé : https://campingles2iles.fr/
25. Centre Hospitalier de Bergerac (sante ; Bergerac) | site proposé : https://www.ch-bergerac.fr

---

# Lot 14 (E4, 3/14)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, un site est proposé et il répond. Vérifie que c'est bien LE SITE OFFICIEL de CET employeur et qu'il est actif dans la bonne zone (Dordogne 24 et/ou Haute-Vienne 87, ou ses communes citées). Si une page de recrutement est proposée, vérifie qu'elle appartient à cet employeur et concerne la bonne région ; si aucune n'est proposée, cherche-en une. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site confirmé (oui / non / autre adresse) | Page de recrutement confirmée ou trouvée | Présence 24 / 87 ou commune (la phrase lue) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Centre Hospitalier de Sarlat (sante ; Sarlat-la-Canéda) | site proposé : https://www.ch-sarlat.fr
2. Centre Hospitalier de Lanmary (sante ; Antonne-et-Trigonant) | site proposé : https://www.ch-lanmary.fr
3. Clinique Francheville (ELSAN) (sante ; Périgueux) | site proposé : https://www.elsan.care
4. Clinique Pasteur (ELSAN) (sante ; Bergerac) | site proposé : https://www.elsan.care
5. DomusVi (sante ; Saint-Pierre-de-Chignac, Limoges, Panazol) | site proposé : https://www.domusvi.com | recrutement proposé : https://emploi.domusvi.com/
6. VYV3 Cœur d'Aquitaine (sante ; Périgueux, Bergerac, Sarlat-la-Canéda) | site proposé : https://www.vyv3.fr | recrutement proposé : https://recrutement.vyv3.fr
7. SYNLAB (sante ; Bergerac) | site proposé : https://www.synlab.fr | recrutement proposé : https://synlab-recrute.fr/
8. Centre Hospitalier Universitaire de Limoges (sante ; Limoges) | site proposé : https://www.chu-limoges.fr
9. Centre Hospitalier Esquirol (sante ; Limoges) | site proposé : https://www.ch-esquirol-limoges.fr | recrutement proposé : https://www.ch-esquirol-limoges.fr/recrutement
10. Centre Hospitalier de Saint-Junien (sante ; Saint-Junien) | site proposé : https://www.ch-stjunien.fr
11. Clinique Chénieux (ELSAN) (sante ; Limoges) | site proposé : https://www.elsan.care
12. Clinique des Emailleurs - Colombier (ELSAN) (sante ; Limoges) | site proposé : https://www.elsan.care
13. ADHAP Périgueux (social-personne ; Périgueux) | site proposé : https://www.adhap.fr
14. Senior Compagnie Saint-Astier (social-personne ; Saint-Astier) | site proposé : https://senior-compagnie.fr | recrutement proposé : https://recrutement.senior-compagnie.fr
15. ACTIMAD (social-personne ; Panazol) | site proposé : https://www.actimad.fr
16. ADHAP Limoges (social-personne ; Limoges) | site proposé : https://www.adhap.fr
17. Senior Compagnie Limoges (social-personne ; Limoges) | site proposé : https://senior-compagnie.fr | recrutement proposé : https://recrutement.senior-compagnie.fr
18. Vitalliance Limoges (social-personne ; Limoges) | site proposé : https://www.vitalliance.fr
19. ONELA Limoges (social-personne ; Limoges) | site proposé : https://www.onela.com
20. APEF Limoges (social-personne ; Limoges) | site proposé : https://www.apef.fr | recrutement proposé : https://www.apefrecrute.fr
21. ADPAD 87 (social-personne ; Limoges) | site proposé : https://adpad87.fr | recrutement proposé : https://adpad87.fr/recrutement
22. Générale des Services Limoges (social-personne ; Limoges) | site proposé : https://www.generaledesservices.com | recrutement proposé : https://www.generaledesservices.com/recrutement
23. Free Dom Limoges (social-personne ; Limoges, Saint-Junien) | site proposé : https://www.free-dom.fr | recrutement proposé : https://www.free-dom.fr/recrutement
24. CIAS Pays de Nexon-Monts de Châlus (social-personne ; Nexon) | site proposé : https://www.paysdenexon-montsdechalus.fr
25. Vigier Construction Métallique (btp ; Gardonne) | site proposé : https://www.vigier.fr

---

# Lot 15 (E4, 4/14)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, un site est proposé et il répond. Vérifie que c'est bien LE SITE OFFICIEL de CET employeur et qu'il est actif dans la bonne zone (Dordogne 24 et/ou Haute-Vienne 87, ou ses communes citées). Si une page de recrutement est proposée, vérifie qu'elle appartient à cet employeur et concerne la bonne région ; si aucune n'est proposée, cherche-en une. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site confirmé (oui / non / autre adresse) | Page de recrutement confirmée ou trouvée | Présence 24 / 87 ou commune (la phrase lue) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Novamiante (btp ; Gardonne) | site proposé : https://www.novamiante.fr | recrutement proposé : https://www.novamiante.fr/recrutement
2. GEIQ 24 Bâtiment (btp ; Périgueux) | site proposé : https://geiq24.com | recrutement proposé : https://geiq24.com
3. Garrigou TP Carrières (btp ; Groléjac) | site proposé : https://www.garrigou.fr
4. Écoludom (btp ; Marsac-sur-l'Isle) | site proposé : https://www.ecoludom.fr
5. DP Services Dordogne (btp ; Montpon-Ménestérol) | site proposé : https://www.dpservicesdordogne.fr
6. JBS Plomberie (btp ; Boulazac Isle Manoire) | site proposé : https://www.jbs-plomberie.fr
7. Eiffage Construction Limousin (btp ; Limoges) | site proposé : https://www.eiffageconstruction.com | recrutement proposé : https://www.eiffage.com/carrieres
8. Eurovia Poitou Charentes Limousin (btp ; Limoges) | site proposé : https://www.eurovia.fr | recrutement proposé : https://jobs.vinci.com
9. Coren Limousin (btp ; Limoges) | site proposé : https://www.coren.fr
10. Aixe Bâtiments (btp ; Aixe-sur-Vienne) | site proposé : https://www.aixebatiments.fr | recrutement proposé : https://www.aixebatiments.fr/nous-recrutons.html
11. GEIQ 87 Construction (btp ; Limoges) | site proposé : https://www.geiq87construction.fr | recrutement proposé : https://www.geiq87construction.fr
12. Transports Mauffrey Dordogne Périgord (transport-logistique ; Creysse) | site proposé : https://www.mauffrey.com
13. SAS Transports Pijassou (transport-logistique ; Thiviers) | site proposé : https://www.transportspijassou.fr
14. GEODIS Distribution & Express (transport-logistique ; Limoges) | site proposé : https://www.geodis.com
15. STEF Transport Limoges (transport-logistique ; Limoges) | site proposé : https://www.stef.com | recrutement proposé : https://www.stef.jobs
16. Transports Briche (transport-logistique ; Limoges) | site proposé : https://www.transports-briche.fr
17. Transports Leroux (transport-logistique ; Boisseuil) | site proposé : https://www.transports-leroux.fr
18. Transports Nascimento et Fils (transport-logistique ; Oradour-sur-Glane) | site proposé : https://www.transports-nascimento.fr
19. Limocars (transport-logistique ; Limoges) | site proposé : https://www.limocars.fr
20. GEODIS Road Transport (transport-logistique ; Limoges) | site proposé : https://www.geodis.com
21. Transports Primasfirst (transport-logistique ; Saint-Junien) | site proposé : https://www.primasfirst.com
22. Eurocourses (transport-logistique ; Limoges) | site proposé : https://www.eurocourses.fr
23. Transports Izaret Limousin (transport-logistique ; Saint-Junien) | site proposé : https://www.izaret.fr
24. XPO Logistics France (transport-logistique ; Limoges) | site proposé : https://europe.xpo.com | recrutement proposé : https://europe.xpo.com/fr/carrieres
25. DPD France (transport-logistique ; Limoges) | site proposé : https://www.dpd.fr

---

# Lot 16 (E4, 5/14)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, un site est proposé et il répond. Vérifie que c'est bien LE SITE OFFICIEL de CET employeur et qu'il est actif dans la bonne zone (Dordogne 24 et/ou Haute-Vienne 87, ou ses communes citées). Si une page de recrutement est proposée, vérifie qu'elle appartient à cet employeur et concerne la bonne région ; si aucune n'est proposée, cherche-en une. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site confirmé (oui / non / autre adresse) | Page de recrutement confirmée ou trouvée | Présence 24 / 87 ou commune (la phrase lue) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. DB Schenker (transport-logistique ; Limoges) | site proposé : https://www.dbschenker.com | recrutement proposé : https://www.dbschenker.com/global/careers
2. St Michel (industrie ; Champagnac-de-Belair) | site proposé : https://www.stmichel.fr
3. Sonoco Metal Packaging France (industrie ; Périgueux) | site proposé : https://sonoco.com | recrutement proposé : https://careers.sonoco.com
4. ArcelorMittal Périgueux (industrie ; Périgueux) | site proposé : https://france.arcelormittal.com
5. CETEC Industrie (industrie ; Chancelade) | site proposé : https://www.cetec-industrie.fr
6. SERM 24 (industrie ; Creysse) | site proposé : https://www.serm24.fr
7. Catalent France Limoges SAS (industrie ; Limoges) | site proposé : https://www.catalent.com | recrutement proposé : https://www.catalent.com/careers
8. Sylvamo (industrie ; Saillat-sur-Vienne) | site proposé : https://www.sylvamo.com
9. Specialty Minerals France (industrie ; Saillat-sur-Vienne) | site proposé : https://www.mineralstech.com | recrutement proposé : https://www.mineralstech.com/careers
10. Madeleines Bijou (industrie ; Saint-Yrieix-la-Perche) | site proposé : https://www.bijou.com
11. Broussaud Textiles (industrie ; Les Cars) | site proposé : https://www.broussaud.com
12. ElringKlinger Meillor SAS (industrie ; Nantiat) | site proposé : https://www.elringklinger.com
13. Lacotte Industrie (industrie ; Le Palais-sur-Vienne) | site proposé : https://www.lacotte-industrie.fr
14. Saica Pack (industrie ; Saint-Junien) | site proposé : https://www.saica.com
15. Orano Mining (industrie ; Bessines-sur-Gartempe) | site proposé : https://www.orano.group | recrutement proposé : https://www.orano.group/jobs
16. Valeo Matériaux de Friction (industrie ; Limoges) | site proposé : https://www.valeo.com
17. J.M. Weston Manufacture (industrie ; Limoges) | site proposé : https://www.jmweston.com
18. Pusterla 1880 France (industrie ; Oradour-sur-Glane) | site proposé : https://www.pusterla1880.com | recrutement proposé : https://www.pusterla1880.com/careers
19. France Paratonnerres SAS (industrie ; Limoges) | site proposé : https://www.france-paratonnerres.com
20. Delouis Fils (industrie ; Champsac) | site proposé : https://www.delouis.com
21. Bernardaud (industrie ; Limoges) | site proposé : https://www.bernardaud.com | recrutement proposé : https://www.bernardaud.com/fr/recrutement
22. MEDIA6 Production PLV (industrie ; Verneuil-sur-Vienne) | site proposé : https://www.media6.com
23. Conseil départemental de la Dordogne (administration ; Périgueux) | site proposé : https://www.dordogne.fr | recrutement proposé : https://www.dordogne.fr/recrutement
24. Ville de Périgueux (administration ; Périgueux) | site proposé : https://www.perigueux.fr
25. Ville de Bergerac (administration ; Bergerac) | site proposé : https://www.bergerac.fr

---

# Lot 17 (E4, 6/14)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, un site est proposé et il répond. Vérifie que c'est bien LE SITE OFFICIEL de CET employeur et qu'il est actif dans la bonne zone (Dordogne 24 et/ou Haute-Vienne 87, ou ses communes citées). Si une page de recrutement est proposée, vérifie qu'elle appartient à cet employeur et concerne la bonne région ; si aucune n'est proposée, cherche-en une. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site confirmé (oui / non / autre adresse) | Page de recrutement confirmée ou trouvée | Présence 24 / 87 ou commune (la phrase lue) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Grand Périgueux (administration ; Périgueux) | site proposé : https://www.grandperigueux.fr | recrutement proposé : https://www.grandperigueux.fr/votre-agglo/recrutement
2. Communauté de communes Sarlat-Périgord Noir (administration ; Sarlat-la-Canéda) | site proposé : https://www.cc-sarlatperigordnoir.fr
3. Mutualité Française Dordogne (administration ; Périgueux) | site proposé : https://www.mutualite.fr
4. Conseil départemental de la Haute-Vienne (administration ; Limoges) | site proposé : https://www.haute-vienne.fr | recrutement proposé : https://www.haute-vienne.fr/votre-conseil-departemental/recrutement
5. Ville de Limoges (administration ; Limoges) | site proposé : https://www.limoges.fr
6. Limoges Métropole (administration ; Limoges) | site proposé : https://www.limoges-metropole.fr
7. Ville de Saint-Junien (administration ; Saint-Junien) | site proposé : https://www.saint-junien.fr
8. Ville de Saint-Yrieix-la-Perche (administration ; Saint-Yrieix-la-Perche) | site proposé : https://www.saint-yrieix.fr
9. Communauté de communes Haut Limousin en Marche (administration ; Bellac, Le Dorat) | site proposé : https://www.hautlimousinenmarche.fr
10. Communauté de communes Porte Océane du Limousin (administration ; Saint-Junien) | site proposé : https://www.porteoceane-dulimousin.fr
11. KPMG (administration ; Limoges) | site proposé : https://kpmg.com/fr | recrutement proposé : https://kpmg.com/fr/fr/home/carrieres.html
12. EXCO Valliance (administration ; Limoges) | site proposé : https://www.exco.fr | recrutement proposé : https://www.exco.fr/recrutement
13. VIASANTÉ Mutuelle (administration ; Limoges) | site proposé : https://www.viasante.fr
14. MSA du Limousin (administration ; Limoges) | site proposé : https://limousin.msa.fr | recrutement proposé : https://recrutement.msa.fr
15. CPAM de la Haute-Vienne (administration ; Limoges) | site proposé : https://www.ameli.fr | recrutement proposé : https://www.lasecurecrute.fr
16. CMA Nouvelle-Aquitaine - Haute-Vienne (administration ; Limoges) | site proposé : https://www.artisanat-nouvelle-aquitaine.fr | recrutement proposé : https://www.artisanat-nouvelle-aquitaine.fr/recrutement
17. AG2R La Mondiale (administration ; Limoges) | site proposé : https://www.ag2rlamondiale.fr | recrutement proposé : https://www.ag2rlamondiale.fr/recrutement
18. Malakoff Humanis (administration ; Limoges) | site proposé : https://www.malakoffhumanis.com | recrutement proposé : https://carrieres.malakoffhumanis.com
19. MGEN Haute-Vienne (administration ; Limoges) | site proposé : https://www.mgen.fr | recrutement proposé : https://recrutement.mgen.fr
20. ACEC BSR Audit (administration ; Limoges) | site proposé : https://www.acec.fr
21. Secaut SA (administration ; Limoges) | site proposé : https://www.secaut.fr
22. Gamm Vert (La Périgourdine) (agriculture-nature ; Bergerac, Boulazac Isle Manoire, Ribérac) | site proposé : https://laperigourdine.com
23. Périgord Bois Énergie (agriculture-nature ; Saint-Laurent-des-Hommes) | site proposé : https://laperigourdine.com
24. Rousseau Paysage (agriculture-nature ; Coulounieix-Chamiers) | site proposé : https://www.rousseau-paysage.fr
25. idverde (agriculture-nature ; Boulazac Isle Manoire) | site proposé : https://www.idverde.fr

---

# Lot 18 (E4, 7/14)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, un site est proposé et il répond. Vérifie que c'est bien LE SITE OFFICIEL de CET employeur et qu'il est actif dans la bonne zone (Dordogne 24 et/ou Haute-Vienne 87, ou ses communes citées). Si une page de recrutement est proposée, vérifie qu'elle appartient à cet employeur et concerne la bonne région ; si aucune n'est proposée, cherche-en une. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site confirmé (oui / non / autre adresse) | Page de recrutement confirmée ou trouvée | Présence 24 / 87 ou commune (la phrase lue) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Serpe (agriculture-nature ; Boulazac Isle Manoire) | site proposé : https://www.serpe.fr
2. Union Coopérative Agricole Altitude (agriculture-nature ; Verneuil-sur-Vienne) | site proposé : https://www.groupe-altitude.com | recrutement proposé : https://www.groupe-altitude.com/recrutement
3. ECOOVI (agriculture-nature ; Peyrat-de-Bellac) | site proposé : https://www.ecoovi.fr
4. Au Service du Paysage (agriculture-nature ; Boisseuil) | site proposé : https://www.auservicedupaysage.fr
5. Rebeyrol Créateur et Soins de Jardins (agriculture-nature ; Le Vigen) | site proposé : https://www.rebeyrol.com | recrutement proposé : https://www.rebeyrol.com/recrutement
6. Pépiplant Olivier Giraud (agriculture-nature ; Chaptelat) | site proposé : https://www.pepiplant.fr
7. Serra Paysage (agriculture-nature ; Boulazac Isle Manoire) | site proposé : https://www.serra-paysage.fr
8. Syndicat Mixte Départemental des Déchets de la Dordogne (SMD3) (proprete ; Coulounieix-Chamiers) | site proposé : https://smd3.fr | recrutement proposé : https://smd3.fr/recrutement
9. Paprec Trivalo Dordogne (proprete ; Coulounieix-Chamiers) | site proposé : https://www.paprec.com
10. Paprec CRV 24 (proprete ; Mouleydier) | site proposé : https://www.paprec.com
11. SUEZ RV Sud Ouest (proprete ; Bergerac) | site proposé : https://www.suez.com | recrutement proposé : https://www.suez.com/fr/carrieres
12. Samsic Propreté (proprete ; Périgueux) | site proposé : https://www.samsic.fr | recrutement proposé : https://jobs.samsic.com
13. SYDED Haute-Vienne (proprete ; Panazol) | site proposé : https://www.syded87.org | recrutement proposé : https://www.syded87.org/recrutement
14. SUEZ Recyclage et Valorisation (proprete ; Limoges) | site proposé : https://www.suez.com | recrutement proposé : https://www.suez.com/fr/carrieres
15. Samsic Facility (proprete ; Limoges) | site proposé : https://www.samsic.fr | recrutement proposé : https://jobs.samsic.com
16. Limousin Entretien (proprete ; Limoges) | site proposé : https://www.limousin-entretien.fr
17. Atalian Facility (proprete ; Limoges) | site proposé : https://www.atalian.com | recrutement proposé : https://jobs.atalian.com
18. ISOR (proprete ; Limoges) | site proposé : https://www.isor.fr
19. Challancin (proprete ; Limoges) | site proposé : https://www.challancin.fr
20. A.N Carrosserie Bergerac (automobile ; Creysse) | site proposé : https://www.ancarrosserie.fr
21. Carrosserie de la Gare Grenier & Fils (automobile ; Bergerac) | site proposé : https://www.carrosserie-grenier.fr
22. Autovision Bergerac (automobile ; Bergerac) | site proposé : https://www.autovision.fr
23. RapidContrôle Périgueux (automobile ; Périgueux) | site proposé : https://www.rapidcontrole.fr
24. Sécuritest Neuvic (automobile ; Neuvic) | site proposé : https://www.securitest.fr
25. Sécuritest Saint-Front-de-Pradoux (automobile ; Saint-Front-de-Pradoux) | site proposé : https://www.securitest.fr

---

# Lot 19 (E4, 8/14)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, un site est proposé et il répond. Vérifie que c'est bien LE SITE OFFICIEL de CET employeur et qu'il est actif dans la bonne zone (Dordogne 24 et/ou Haute-Vienne 87, ou ses communes citées). Si une page de recrutement est proposée, vérifie qu'elle appartient à cet employeur et concerne la bonne région ; si aucune n'est proposée, cherche-en une. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site confirmé (oui / non / autre adresse) | Page de recrutement confirmée ou trouvée | Présence 24 / 87 ou commune (la phrase lue) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Faurie Motor Centre Limousin Opel (automobile ; Limoges) | site proposé : https://www.faurie.fr
2. Toyota Carnot Automobile (automobile ; Limoges) | site proposé : https://www.groupe-carnot.fr
3. Kia Limoges - Jean Rouyer Automobiles (automobile ; Limoges) | site proposé : https://www.jeanrouyerautomobiles.fr
4. Aventi Automobiles (automobile ; Limoges) | site proposé : https://www.aventi-automobiles.fr
5. Garage Mécanique Carrosserie Gauthier (automobile ; Vicq-sur-Breuilh) | site proposé : https://www.garage-gauthier.fr
6. Autosécurité Limoges Dutreix (automobile ; Limoges) | site proposé : https://www.autosecurite.com
7. Autosécurité Limoges Nord (automobile ; Limoges) | site proposé : https://www.autosecurite.com
8. Autocontrol (automobile ; Limoges) | site proposé : https://www.autocontrol.fr
9. Sécuritest Limoges Sud (automobile ; Limoges) | site proposé : https://www.securitest.fr
10. Sécuritest Le Vigen (automobile ; Le Vigen) | site proposé : https://www.securitest.fr
11. Autosur (automobile ; Aixe-sur-Vienne) | site proposé : https://www.autosur.fr
12. Groupe Péricaud Limoges Sud (Volkswagen, Audi, Škoda, SEAT, CUPRA) (automobile ; Limoges) | site proposé : https://www.pericaud.com
13. DEKRA Contrôle Technique (automobile ; Le Palais-sur-Vienne) | site proposé : https://www.dekra-norisko.fr
14. Duval Services Auto Motrio (automobile ; Bonnac-la-Côte) | site proposé : https://www.motrio.fr
15. GSP Security (securite ; Périgueux) | site proposé : https://gsp-security.fr
16. Opti Sécurité (securite ; Bergerac, Limoges) | site proposé : https://www.optisecurite.fr | recrutement proposé : https://optisecurite-2.flatchr.io
17. Detexial Sécurité (securite ; Saint-Martial-d'Artenset) | site proposé : https://www.detexial.fr
18. Groupe SGP (securite ; Limoges) | site proposé : https://www.groupe-sgp.fr | recrutement proposé : https://www.groupe-sgp.fr/recrutement
19. Securitas France (securite ; Limoges) | site proposé : https://www.securitas.fr
20. Fiducial Sécurité (securite ; Limoges) | site proposé : https://www.fiducial-securite.fr | recrutement proposé : https://www.fiducial-securite.fr/recrutement
21. Torann-France (securite ; Limoges) | site proposé : https://www.torann-france.fr | recrutement proposé : https://www.torann-france.fr/recrutement
22. Goron (securite ; Limoges) | site proposé : https://www.goron.fr
23. Atlas Sécurité Privée (securite ; Limoges) | site proposé : https://www.atlassecurite.fr
24. Groupe OPS (securite ; Limoges) | site proposé : https://groupeops.fr
25. Team Sécurité (securite ; Panazol) | site proposé : https://www.teamsecurite.fr

---

# Lot 20 (E4, 9/14)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, un site est proposé et il répond. Vérifie que c'est bien LE SITE OFFICIEL de CET employeur et qu'il est actif dans la bonne zone (Dordogne 24 et/ou Haute-Vienne 87, ou ses communes citées). Si une page de recrutement est proposée, vérifie qu'elle appartient à cet employeur et concerne la bonne région ; si aucune n'est proposée, cherche-en une. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site confirmé (oui / non / autre adresse) | Page de recrutement confirmée ou trouvée | Présence 24 / 87 ou commune (la phrase lue) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Osyris Sécurité Privée (securite ; Limoges) | site proposé : https://www.osyris-securite.fr
2. LAYA Sécurité Privée 87 (securite ; Limoges) | site proposé : https://www.laya-securite.fr
3. Crédit Agricole Charente-Périgord (banque-assurance-immobilier ; Périgueux, Bergerac, Sarlat-la-Canéda) | site proposé : https://www.credit-agricole.fr/ca-charente-perigord/particulier.html | recrutement proposé : https://groupecreditagricole.jobs/fr/
4. Crédit Agricole Services Immobiliers (banque-assurance-immobilier ; Périgueux, Bergerac, Limoges) | site proposé : https://www.ca-immobilier.fr | recrutement proposé : https://groupecreditagricole.jobs
5. LCL Banque et assurance (banque-assurance-immobilier ; Périgueux, Bergerac, Sarlat-la-Canéda) | site proposé : https://www.lcl.fr | recrutement proposé : https://www.lcl.fr/decouvrir-lcl/recrutement
6. SG (banque-assurance-immobilier ; Périgueux, Trélissac, Bergerac) | site proposé : https://particuliers.sg.fr | recrutement proposé : https://careers.societegenerale.com
7. Banque Populaire Aquitaine Centre Atlantique (banque-assurance-immobilier ; Périgueux, Bergerac, Sarlat-la-Canéda) | site proposé : https://www.banquepopulaire.fr/
8. Crédit Mutuel (banque-assurance-immobilier ; Périgueux, Bergerac, Sarlat-la-Canéda) | site proposé : https://www.creditmutuel.fr | recrutement proposé : https://recrutement.creditmutuel.fr
9. AXA Assurance et Banque (banque-assurance-immobilier ; Périgueux, Bergerac, Trélissac) | site proposé : https://www.axa.fr | recrutement proposé : https://recrutement.axa.fr
10. Generali (banque-assurance-immobilier ; Creysse, Limoges) | site proposé : https://www.generali.fr | recrutement proposé : https://carrieres.generali.fr/
11. Orpi (banque-assurance-immobilier ; Périgueux, Bergerac, Sarlat-la-Canéda) | site proposé : https://www.orpi.com | recrutement proposé : https://www.orpi.com/recrutement
12. Laforêt (banque-assurance-immobilier ; Périgueux, Bergerac, Sarlat-la-Canéda) | site proposé : https://www.laforet.com | recrutement proposé : https://www.laforet.com/recrutement
13. Guy Hoquet (banque-assurance-immobilier ; Bergerac, Périgueux) | site proposé : https://www.guy-hoquet.com | recrutement proposé : https://recrutement.guy-hoquet.com/fr
14. Crédit Agricole Centre Ouest (banque-assurance-immobilier ; Limoges, Saint-Junien, Bellac) | site proposé : https://www.ca-centreouest.fr | recrutement proposé : https://groupecreditagricole.jobs
15. Gan Assurances (banque-assurance-immobilier ; Limoges, Saint-Junien) | site proposé : https://www.gan.fr | recrutement proposé : https://www.gan.fr/rh-nous-rejoindre/
16. Groupama Centre-Atlantique (banque-assurance-immobilier ; Limoges, Saint-Junien, Bellac) | site proposé : https://www.groupama.fr | recrutement proposé : https://www.groupama-gan-recrute.com/
17. CAFPI Limoges (banque-assurance-immobilier ; Limoges) | site proposé : https://www.cafpi.fr | recrutement proposé : https://cafpi-career.talent-soft.com
18. Meilleurtaux Limoges (banque-assurance-immobilier ; Limoges) | site proposé : https://www.meilleurtaux.com
19. Empruntis Limoges (banque-assurance-immobilier ; Limoges) | site proposé : https://www.empruntis.com
20. Ymanci Limoges (banque-assurance-immobilier ; Limoges) | site proposé : https://www.ymanci.fr
21. CAFPI Périgueux (banque-assurance-immobilier ; Périgueux) | site proposé : https://www.cafpi.fr | recrutement proposé : https://cafpi-career.talent-soft.com
22. Meilleurtaux Périgueux (banque-assurance-immobilier ; Périgueux) | site proposé : https://www.meilleurtaux.com
23. AFPA Centre de Périgueux (education-formation ; Boulazac Isle Manoire) | site proposé : https://www.afpa.fr
24. Écoles de la CCI Dordogne (education-formation ; Boulazac Isle Manoire) | site proposé : https://www.dordogne.cci.fr | recrutement proposé : https://www.dordogne.cci.fr/recrutement
25. Collège Notre-Dame (education-formation ; Ribérac) | site proposé : https://www.notredame-riberac.fr

---

# Lot 21 (E4, 10/14)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, un site est proposé et il répond. Vérifie que c'est bien LE SITE OFFICIEL de CET employeur et qu'il est actif dans la bonne zone (Dordogne 24 et/ou Haute-Vienne 87, ou ses communes citées). Si une page de recrutement est proposée, vérifie qu'elle appartient à cet employeur et concerne la bonne région ; si aucune n'est proposée, cherche-en une. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site confirmé (oui / non / autre adresse) | Page de recrutement confirmée ou trouvée | Présence 24 / 87 ou commune (la phrase lue) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. AFPA Limoges Romanet (education-formation ; Limoges) | site proposé : https://www.afpa.fr
2. Greta-CFA Limousin (education-formation ; Limoges) | site proposé : https://www.greta-du-limousin.fr | recrutement proposé : https://www.ac-limoges.fr/conseilleres-en-formation-professionnelle-hf-125332
3. CMA Formation Le Moulin Rabaud (education-formation ; Limoges) | site proposé : https://www.cma-nouvelleaquitaine.fr
4. INSUP Formation (education-formation ; Limoges) | site proposé : https://www.insup.org | recrutement proposé : https://www.insup.org/recrutement
5. Osengo Limoges (education-formation ; Limoges) | site proposé : https://www.osengo.fr | recrutement proposé : https://www.osengo.fr/recrutement
6. Polaris Formation (education-formation ; Limoges) | site proposé : https://www.polaris-formation.fr
7. Cnam Nouvelle-Aquitaine Limoges (education-formation ; Limoges) | site proposé : https://www.cnam-nouvelle-aquitaine.fr
8. EPCP Centre de Formation PMS (education-formation ; Boisseuil) | site proposé : https://epcp.fr
9. Profession Sport & Loisirs Dordogne (sport-animation ; Périgueux) | site proposé : https://dordogne.profession-sport-loisirs.fr | recrutement proposé : https://www.lesportrecrute.fr/pages-entreprises/emploi-Psl-24-e-459
10. GEIQ Sport Animation Nouvelle-Aquitaine - Antenne Dordogne (sport-animation ; Périgueux) | site proposé : https://dordogne.profession-sport-loisirs.fr/geiq-sport-animation-na-dordogne
11. GIGAFIT Périgueux Marsac (sport-animation ; Marsac-sur-l'Isle) | site proposé : https://gigafit.fr | recrutement proposé : https://gigafit.fr/recrutement
12. Keepcool Périgueux (sport-animation ; Sanilhac) | site proposé : https://www.keepcool.fr
13. L'Orange Bleue Sarlat (sport-animation ; Sarlat-la-Canéda) | site proposé : https://www.lorangebleue.fr | recrutement proposé : https://www.lorangebleue.fr/recrutement
14. Liberty Gym (sport-animation ; Sarlat-la-Canéda) | site proposé : https://libertygym.fr
15. Profession Sport & Loisirs Haute-Vienne (sport-animation ; Limoges) | site proposé : https://lesportrecrute.fr | recrutement proposé : https://lesportrecrute.fr
16. GEIQ Sport Animation Nouvelle-Aquitaine - Haute-Vienne (sport-animation ; Limoges) | site proposé : https://lesportrecrute.fr | recrutement proposé : https://lesportrecrute.fr
17. Comité Départemental Olympique et Sportif de la Haute-Vienne (sport-animation ; Limoges) | site proposé : https://cdos87.fr
18. CHÉOPS 87 (sport-animation ; Limoges) | site proposé : https://www.cheops87.com
19. Fitness Park Limoges (sport-animation ; Limoges) | site proposé : https://www.fitnesspark.fr
20. Elancia Limoges La Borie (sport-animation ; Limoges) | site proposé : https://www.elancia.fr | recrutement proposé : https://www.elancia.fr/recrutement
21. Planète Forme (sport-animation ; Feytiat) | site proposé : https://www.planeteforme.fr
22. Ma Salle (sport-animation ; Limoges) | site proposé : https://www.masalle.fr
23. Terra'Job (sport-animation ; Périgueux) | site proposé : https://terra-job.fr | recrutement proposé : https://terra-job.fr
24. Familles Rurales Fédération Régionale Nouvelle-Aquitaine (sport-animation ; Limoges) | site proposé : https://www.famillesrurales.org
25. On Air Fitness Limoges Centre (sport-animation ; Limoges) | site proposé : https://www.onair-fitness.fr

---

# Lot 22 (E4, 11/14)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, un site est proposé et il répond. Vérifie que c'est bien LE SITE OFFICIEL de CET employeur et qu'il est actif dans la bonne zone (Dordogne 24 et/ou Haute-Vienne 87, ou ses communes citées). Si une page de recrutement est proposée, vérifie qu'elle appartient à cet employeur et concerne la bonne région ; si aucune n'est proposée, cherche-en une. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site confirmé (oui / non / autre adresse) | Page de recrutement confirmée ou trouvée | Présence 24 / 87 ou commune (la phrase lue) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Elancia Limoges Nord (sport-animation ; Limoges) | site proposé : https://www.elancia.fr | recrutement proposé : https://www.elancia.fr/recrutement
2. Elancia Limoges Sud (sport-animation ; Limoges) | site proposé : https://www.elancia.fr | recrutement proposé : https://www.elancia.fr/recrutement
3. AT Internet (Piano Analytics) (numerique ; Périgueux) | site proposé : https://www.piano.io | recrutement proposé : https://www.piano.io/company/careers
4. Octopus Business (numerique ; Boulazac Isle Manoire) | site proposé : https://www.octopusbusiness.fr
5. Apsodia (numerique ; Périgueux) | site proposé : https://apsodia.com
6. APLOSE - Ma Gestion Cloud (numerique ; Beleymas) | site proposé : https://aplose.fr
7. Adekoi (numerique ; Sanilhac) | site proposé : https://adekoi.com
8. CSTE (numerique ; Trélissac) | site proposé : https://www.cste.fr
9. Heliaq (numerique ; Limoges) | site proposé : https://heliaq.fr
10. Koesio Aquitaine (numerique ; Limoges) | site proposé : https://koesio.com
11. Limousin Informatique (numerique ; Limoges) | site proposé : https://www.limousin-informatique.fr
12. Ecomsoft (numerique ; Limoges) | site proposé : https://www.ecomsoft.fr
13. Internatél (numerique ; Le Palais-sur-Vienne) | site proposé : https://www.internatel.fr
14. Neowise (numerique ; Limoges) | site proposé : https://www.neowise.fr
15. Orbial (numerique ; Limoges) | site proposé : https://orbial.fr
16. Conecti by LDS (numerique ; Limoges) | site proposé : https://conecti.fr
17. Néosoft (numerique ; Limoges) | site proposé : https://www.neosoft.fr
18. Fluffy Agency (numerique ; Limoges) | site proposé : https://www.fluffy-agency.com
19. Youlead Limoges (numerique ; Limoges) | site proposé : https://www.youlead-limoges.fr
20. Proximit (numerique ; Aixe-sur-Vienne) | site proposé : https://www.proximit.fr
21. Buildéo SARL (numerique ; Saint-Junien) | site proposé : https://www.buildeo.fr
22. ATENOS (numerique ; Limoges) | site proposé : https://atenos.fr
23. Boulangerie Desem (artisanat-bouche ; Limoges) | site proposé : https://www.boulangeriedesem.com
24. Maison Vareille (artisanat-bouche ; Solignac) | site proposé : https://www.boulangerie-vareille.fr
25. Le Caramélia (artisanat-bouche ; Limoges) | site proposé : https://www.le-caramelia.fr

---

# Lot 23 (E4, 12/14)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, un site est proposé et il répond. Vérifie que c'est bien LE SITE OFFICIEL de CET employeur et qu'il est actif dans la bonne zone (Dordogne 24 et/ou Haute-Vienne 87, ou ses communes citées). Si une page de recrutement est proposée, vérifie qu'elle appartient à cet employeur et concerne la bonne région ; si aucune n'est proposée, cherche-en une. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site confirmé (oui / non / autre adresse) | Page de recrutement confirmée ou trouvée | Présence 24 / 87 ou commune (la phrase lue) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Boulangerie Feuillette (artisanat-bouche ; Limoges) | site proposé : https://feuillette.fr
2. Pascalain SARL (artisanat-bouche ; Feytiat) | site proposé : https://www.pascalain.fr
3. Menuiseries Seguy (artisanat ; Montignac-Lascaux) | site proposé : https://www.menuiseries-seguy.fr
4. Naudon Mathé Frères (artisanat ; Limoges) | site proposé : https://www.naudon-mathe.fr
5. Lo'Talhier - Atelier Parot SARL (artisanat ; Saint-Jean-Ligoure) | site proposé : https://www.lotalhier.fr
6. Carrés de Lumière (artisanat ; Limoges) | site proposé : https://www.carresdelumiere.fr
7. DELAGE Menuiseries (artisanat ; Saint-Junien) | site proposé : https://menuiseries-delage.fr | recrutement proposé : https://menuiseries-delage.fr/recrutement-menuisiers/
8. Haviland (artisanat ; Limoges) | site proposé : https://haviland.fr
9. JL Coquet (artisanat ; Saint-Léonard-de-Noblat) | site proposé : https://jlcoquet.com
10. Raynaud (artisanat ; Limoges) | site proposé : https://www.raynaud.fr
11. Deshoulières (artisanat ; Limoges) | site proposé : https://www.deshoulieres.com
12. Ateliers Arquié (artisanat ; Limoges) | site proposé : https://www.ateliersarquie.com
13. Émaux Chéron (artisanat ; Limoges) | site proposé : https://www.emauxcheron.com
14. Franck Provost (coiffure-esthetique ; Périgueux, Sarlat-la-Canéda, Limoges) | site proposé : https://www.franckprovost.com | recrutement proposé : https://www.franckprovost.com/nous-rejoindre
15. Saint Algue (coiffure-esthetique ; Limoges) | site proposé : https://www.saint-algue.com
16. Camille Albane (coiffure-esthetique ; Limoges) | site proposé : https://www.camillealbane.com
17. Fabio Salsa (coiffure-esthetique ; Limoges) | site proposé : https://www.fabiosalsa.com
18. DESSANGE (coiffure-esthetique ; Limoges) | site proposé : https://www.dessange.com | recrutement proposé : https://www.dessange.com/recrutement
19. Intermède (coiffure-esthetique ; Limoges) | site proposé : https://www.intermede.fr
20. Naïa Spa (coiffure-esthetique ; Limoges) | site proposé : https://www.naiaspa.fr
21. PXINFOS (communication-culture ; Périgueux) | site proposé : https://www.pxinfos.fr
22. L'Odyssée Scène Conventionnée (communication-culture ; Périgueux) | site proposé : https://www.odyssee-perigueux.fr
23. Le Palace (communication-culture ; Périgueux) | site proposé : https://www.odyssee-perigueux.fr
24. Agora Pôle National Cirque (communication-culture ; Boulazac Isle Manoire) | site proposé : https://www.agora-boulazac.fr
25. Musée National de Préhistoire (communication-culture ; Les Eyzies) | site proposé : https://musee-prehistoire-eyzies.fr | recrutement proposé : https://choisirleservicepublic.gouv.fr

---

# Lot 24 (E4, 13/14)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, un site est proposé et il répond. Vérifie que c'est bien LE SITE OFFICIEL de CET employeur et qu'il est actif dans la bonne zone (Dordogne 24 et/ou Haute-Vienne 87, ou ses communes citées). Si une page de recrutement est proposée, vérifie qu'elle appartient à cet employeur et concerne la bonne région ; si aucune n'est proposée, cherche-en une. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site confirmé (oui / non / autre adresse) | Page de recrutement confirmée ou trouvée | Présence 24 / 87 ou commune (la phrase lue) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Écomusée de la Truffe (communication-culture ; Sorges et Ligueux en Périgord) | site proposé : https://ecomuseedelatruffe.com
2. JAÉCO (communication-culture ; Périgueux) | site proposé : https://www.jaeco.fr
3. ILÔ Créatif (communication-culture ; Périgueux) | site proposé : https://www.ilo-creatif.com
4. Médias-Conseils (communication-culture ; Cours-de-Pile) | site proposé : https://www.medias-conseils.com
5. Le Populaire du Centre (communication-culture ; Limoges) | site proposé : https://www.lepopulaire.fr
6. Centre France Publicité (communication-culture ; Limoges) | site proposé : https://centrefrancepub.fr
7. France 3 Limousin (communication-culture ; Limoges) | site proposé : https://france3-regions.francetvinfo.fr/nouvelle-aquitaine
8. Opéra de Limoges (communication-culture ; Limoges) | site proposé : https://www.operalimoges.fr
9. Les Francophonies - Des écritures à la scène (communication-culture ; Limoges) | site proposé : https://www.lesfrancophonies.fr
10. Musée d'Art Contemporain de Rochechouart (communication-culture ; Rochechouart) | site proposé : https://www.musee-rochechouart.com | recrutement proposé : https://choisirleservicepublic.gouv.fr
11. Terre-Lune (communication-culture ; Limoges) | site proposé : https://www.terre-lune.com
12. Pixine (communication-culture ; Limoges) | site proposé : https://www.pixine.fr
13. ITI Communication (communication-culture ; Limoges) | site proposé : https://www.iti-communication.com
14. Graphitéine (communication-culture ; Limoges) | site proposé : https://www.graphiteine.fr
15. Théâtre de l'Union - CDN du Limousin (communication-culture ; Limoges) | site proposé : https://www.theatre-union.fr | recrutement proposé : https://www.theatre-union.fr/recrutement
16. Zénith Limoges Métropole (communication-culture ; Limoges) | site proposé : https://www.zenithlimoges.com
17. Musée national Adrien Dubouché (communication-culture ; Limoges) | site proposé : https://www.musee-adriendubouche.fr | recrutement proposé : https://choisirleservicepublic.gouv.fr
18. Centre International de la Caricature, du Dessin de Presse et d'Humour (communication-culture ; Saint-Just-le-Martel) | site proposé : https://www.caricature.eu
19. Clinique vétérinaire du Gour de l'Arche (animalier ; Périgueux) | site proposé : https://www.capveto.fr
20. Clinique Vétérinaire Animalis (animalier ; Montpon-Ménestérol) | site proposé : https://www.capveto.fr
21. Société Protectrice des Animaux Dordogne (animalier ; Marsac-sur-l'Isle) | site proposé : https://spa24bergerac.org
22. SPA24 Bergerac (animalier ; Bergerac) | site proposé : https://spa24bergerac.org
23. Réserve Zoologique de Calviac (animalier ; Calviac-en-Périgord) | site proposé : https://www.reserve-calviac.org
24. Clinique Vétérinaire Argos Val de l'Aurence (animalier ; Limoges) | site proposé : https://www.argos-veterinaire.com
25. Groupement Vétérinaire Univet Val de Vienne (animalier ; Aixe-sur-Vienne) | site proposé : https://www.univet.fr | recrutement proposé : https://www.univet.fr/recrutement

---

# Lot 25 (E4, 14/14)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, un site est proposé et il répond. Vérifie que c'est bien LE SITE OFFICIEL de CET employeur et qu'il est actif dans la bonne zone (Dordogne 24 et/ou Haute-Vienne 87, ou ses communes citées). Si une page de recrutement est proposée, vérifie qu'elle appartient à cet employeur et concerne la bonne région ; si aucune n'est proposée, cherche-en une. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site confirmé (oui / non / autre adresse) | Page de recrutement confirmée ou trouvée | Présence 24 / 87 ou commune (la phrase lue) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Elephant Haven European Elephant Sanctuary (animalier ; Bussière-Galant) | site proposé : https://www.elephanthaven.com
2. Cabinet Vétérinaire Univet Val de Gorre (animalier ; Verneuil-sur-Vienne) | site proposé : https://www.univet.fr | recrutement proposé : https://www.univet.fr/recrutement
3. Association ERINA - Centre de soins pour les mammifères sauvages (animalier ; Razès) | site proposé : https://www.associationerina.com

---

# Lot 26 (S2, 1/4)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), le site proposé ne marche pas ou ne semble pas être le bon (erreur, certificat, nom absent) : trouve (1) le BON SITE OFFICIEL ou la page officielle qui la présente, (2) le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure. Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : n'en cherche jamais ailleurs que sur une page officielle, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Territoire confirmé (commune, 24 ou 87) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Maison de Justice et du Droit de Limoges (Limoges) | site proposé : https://cdad-hautevienne.justice.fr/maisons-de-la-justice-et-du-droit/ | numéro de la fiche : 05 55 04 04 05
2. Association Formation Avenir Conseil 24 (Coulounieix-Chamiers) | site proposé : https://www.fac24.fr | numéro de la fiche : 05 53 09 03 15
3. Mission Locale Limoges Métropole (Limoges) | site proposé : https://www.ml-limoges.fr | numéro de la fiche : 05 55 10 01 00
4. Mission Locale Rurale Haute-Vienne (Aixe-sur-Vienne) | site proposé : https://www.missionlocalerurale87.fr | numéro de la fiche : 05 55 70 45 74
5. GRETA du Limousin (Limoges) | site proposé : https://greta-limousin.fr | numéro de la fiche : 05 55 12 31 31
6. Envergure Limoges (Limoges) | site proposé : https://www.groupe-envergure.fr | numéro de la fiche : 05 55 79 06 06
7. Formation Avenir Conseil - Antenne Bergerac (Bergerac) | site proposé : https://www.fac24.fr | numéro de la fiche : 05 53 09 03 15
8. Formation Avenir Conseil - Antenne Sarlat (Sarlat-la-Canéda) | site proposé : https://www.fac24.fr | numéro de la fiche : 05 53 09 03 15
9. Formation Avenir Conseil - Antenne Thiviers (Thiviers) | site proposé : https://www.fac24.fr | numéro de la fiche : 05 53 09 03 15
10. Conseil départemental de la Haute-Vienne - Accompagnement éducatif et budgétaire (Limoges) | site proposé : https://www.haute-vienne.fr/nos-actions/action-sociale-a-votre-ecoute/gerer-votre-budget | numéro de la fiche : 05 55 45 10 10
11. France Services (, portée national) | site proposé : https://www.france-services.gouv.fr
12. ASPAT (Bergerac) | site proposé : https://www.aspat24.fr | numéro de la fiche : 05 53 57 43 22
13. Fédération Châtaigneraie Limousine (Saint-Junien) | site proposé : https://www.federation-chataigneraie.fr | numéro de la fiche : 05 55 02 20 79
14. Rempart (Limoges) | site proposé : https://www.association-rempart.com | numéro de la fiche : 05 55 33 46 53
15. ALEAS (Limoges) | site proposé : https://www.aleas87.fr | numéro de la fiche : 05 55 10 01 20
16. Mission Locale Ribéracois Vallée de l'Isle (Ribérac) | site proposé : https://www.missionlocale-riberacois.fr | numéro de la fiche : 05 53 92 40 75
17. Mission Locale de Saint-Astier (Saint-Astier) | site proposé : https://www.missionlocale-riberacois.fr | numéro de la fiche : 05 53 02 42 96
18. Association Régionale des Missions Locales Nouvelle-Aquitaine (, portée region) | site proposé : https://www.arml-na.fr
19. Crèches municipales de Limoges (Limoges) | site proposé : https://www.limoges.fr/pratique/petite-enfance | numéro de la fiche : 05 55 45 60 00
20. Les Papillons Blancs de Bergerac (Bergerac) | site proposé : https://www.papillonsblancsbergerac.fr | numéro de la fiche : 05 53 74 49 49
21. SPSTI 23-87 Prévention Santé Travail (Limoges) | site proposé : https://www.spsti23-87.fr | numéro de la fiche : 05 55 77 65 63
22. Autisme 87 (Limoges) | site proposé : https://www.autisme87.fr | numéro de la fiche : 05 55 05 07 68
23. ARES Limousin (Limoges) | site proposé : https://www.ares-limousin.com | numéro de la fiche : 05 55 01 42 56
24. Maison des Sourds de la Haute-Vienne (Limoges) | site proposé : https://www.mshv.fr | numéro de la fiche : 05 55 32 59 80
25. CFPPA de la Dordogne (Coulounieix-Chamiers) | site proposé : https://perigord.educagri.fr/fileadmin/user_upload/PLAQUETTES_PDF_FORMATIONS/CFPPA/VAE_2025_.pdf | numéro de la fiche : 05 53 02 61 30

---

# Lot 27 (S2, 2/4)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), le site proposé ne marche pas ou ne semble pas être le bon (erreur, certificat, nom absent) : trouve (1) le BON SITE OFFICIEL ou la page officielle qui la présente, (2) le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure. Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : n'en cherche jamais ailleurs que sur une page officielle, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Territoire confirmé (commune, 24 ou 87) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Point-Justice de la Cité judiciaire de Limoges (Limoges) | site proposé : https://cdad-hautevienne.justice.fr/lespermanences/permanence-daccueil-et-decoute/
2. Point-Justice itinérant en France Services de la Haute-Vienne (Limoges) | site proposé : https://cdad-hautevienne.justice.fr/lespermanences/point-justice-itinerant/
3. Ministère du Travail (, portée national) | site proposé : https://travail-emploi.gouv.fr
4. Conseil départemental de l'accès au droit de la Haute-Vienne (CDAD 87) (Limoges) | site proposé : https://cdad-hautevienne.justice.fr | numéro de la fiche : 05 87 19 34 00
5. Maison de la Justice et du Droit de Limoges (Limoges) | site proposé : https://cdad-hautevienne.justice.fr
6. Maison du Droit de Saint-Junien (Saint-Junien) | site proposé : https://cdad-hautevienne.justice.fr
7. Service d'accueil unique du justiciable (SAUJ) du tribunal judiciaire de Limoges (Limoges) | site proposé : https://cdad-hautevienne.justice.fr/acteurs-du-droit/ | numéro de la fiche : 05 87 19 34 00
8. Point-Justice du Dorat (Le Dorat) | site proposé : https://cdad-hautevienne.justice.fr/permanences/
9. Point-Justice de Bessines-sur-Gartempe (Bessines-sur-Gartempe) | site proposé : https://cdad-hautevienne.justice.fr/permanences/
10. Point-Justice de Saint-Junien (Saint-Junien) | site proposé : https://cdad-hautevienne.justice.fr/permanences/
11. Point-Justice de Saint-Yrieix-la-Perche (Saint-Yrieix-la-Perche) | site proposé : https://cdad-hautevienne.justice.fr/permanences/
12. Point-Justice de Panazol (Panazol) | site proposé : https://cdad-hautevienne.justice.fr/permanences/
13. Service d'accueil unique du justiciable du tribunal judiciaire de Périgueux (Périgueux) | site proposé : https://www.justice.fr
14. Service d'accueil unique du justiciable du tribunal judiciaire de Bergerac (Bergerac) | site proposé : https://www.justice.fr
15. Bureau d'aide juridictionnelle du tribunal judiciaire de Limoges (Limoges) | site proposé : https://www.justice.fr
16. Service d'accueil unique du justiciable du tribunal de proximité de Sarlat-la-Canéda (Sarlat-la-Canéda) | site proposé : https://www.justice.fr
17. Casier judiciaire national (, portée national) | site proposé : https://www.service-public.fr/particuliers/vosdroits/N517
18. Association Périgourdine d'Action et de Recherche sur l'Exclusion (APARE) (Périgueux) | site proposé : https://www.apare24.fr
19. Halte Vincent (Limoges) | site proposé : https://www.justice.gouv.fr/annuaire/fiche/maison-d-arret-de-limoges | numéro de la fiche : 05 55 57 83 79
20. Initiative Sarlat (Sarlat-la-Canéda) | site proposé : https://initiative-perigord.fr
21. Périgord Développement (Périgueux) | site proposé : https://perigord-developpement.fr
22. BGE Limousin (Limoges) | site proposé : https://bge-limousin.fr | numéro de la fiche : 05 55 33 08 30
23. Initiative Haute-Vienne (Limoges) | site proposé : https://www.initiative-hautevienne.fr
24. ALTIPÔLE (Limoges) | site proposé : https://www.altipole.coop
25. Les Premières Nouvelle-Aquitaine (, portée region) | site proposé : https://lespremieres.fr

---

# Lot 28 (S2, 3/4)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), le site proposé ne marche pas ou ne semble pas être le bon (erreur, certificat, nom absent) : trouve (1) le BON SITE OFFICIEL ou la page officielle qui la présente, (2) le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure. Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : n'en cherche jamais ailleurs que sur une page officielle, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Territoire confirmé (commune, 24 ou 87) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Incubatest BGE Limousin (Limoges) | site proposé : https://www.bge-nouvelle-aquitaine.fr/presence-sur-le-territoire/haute-vienne | numéro de la fiche : 05 55 33 14 79
2. Association Interconsulaire de la Haute-Vienne (Limoges) | site proposé : https://www.haute-vienne.gouv.fr/Actions-de-l-Etat/Entreprises-economie-emploi-et-finances-publiques/Appui-au-developpement-de-l-emploi-et-des-entreprises-en-Haute-Vienne
3. ARACT Nouvelle-Aquitaine (, portée region) | site proposé : https://nouvelle-aquitaine.aract.fr
4. Conseil départemental de la Dordogne - Direction de l'économie et de l'emploi (Périgueux) | site proposé : https://demarches.dordogne.fr/guides-des-aides/dgatd/dde/eco-aides-aux-entreprises/ | numéro de la fiche : 05 53 02 01 10
5. DREETS Nouvelle-Aquitaine - Pôle entreprises, emploi et économie (, portée region) | site proposé : https://dreets.gouv.fr/nouvelle-aquitaine
6. Initiative Nouvelle-Aquitaine (, portée region) | site proposé : https://www.initiative-nouvelleaquitaine.org
7. AF2P Bergerac (Bergerac) | site proposé : https://www.af2p24.fr | numéro de la fiche : 05 53 63 14 93
8. A.E.C. (Bergerac) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation/alphabenn/
9. ACCJ - Chantiers Jacquaire (Limoges) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation?locations=66
10. AFORMAC (Bellac) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation?locations=66
11. AFPA Limoges (Limoges) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation?locations=66
12. Association Familiale Protestante Partage (Limoges) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation?locations=66
13. Association Familles Rurales Bellac et ses environs (Bellac) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation?locations=66
14. Conseil départemental de l'accès au droit de la Dordogne (Périgueux) | site proposé : https://www.cdad24.fr | numéro de la fiche : 05 53 06 39 33
15. Agence conseil retraite Agirc-Arrco de Périgueux (Périgueux) | site proposé : https://www.agirc-arrco.fr/departement/24/ | numéro de la fiche : 09 70 66 06 60
16. Agence conseil retraite Agirc-Arrco de Limoges (Limoges) | site proposé : https://www.agirc-arrco.fr/agences-retraite/agence-de-la-haute-vienne/ | numéro de la fiche : 09 70 66 06 60
17. Agirc-Arrco (, portée national) | site proposé : https://www.agirc-arrco.fr
18. Accueil conseil retraite Agirc-Arrco de Limoges - Agence PRO BTP (Limoges) | site proposé : https://www.agirc-arrco.fr/agences-retraite/accueil-conseil-retraite-agirc-arrco-de-limoges-agence-probtp/ | numéro de la fiche : 09 73 88 88 88
19. Centres d'information de conseil et d'accueil des salariés (Cicas) (, portée national) | site proposé : https://www.cicas.agirc-arrco.fr | numéro de la fiche : 09 70 66 06 60
20. Accueils de jour de la Haute-Vienne (Limoges) | site proposé : https://www.service-public.fr
21. GRETA Limousin (Limoges) | site proposé : https://greta.ac-limoges.fr
22. Conseil départemental de l'accès au droit de la Haute-Vienne (Limoges) | site proposé : https://www.cdad-hautevienne.fr
23. Conseil de prud'hommes de Limoges (Limoges) | site proposé : https://www.justice.fr
24. DDETSPP de la Haute-Vienne - Inspection du travail (Limoges) | site proposé : https://haute-vienne.gouv.fr
25. IRISCOP Limousin (Limoges) | site proposé : https://www.iriscop.org

---

# Lot 29 (S2, 4/4)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), le site proposé ne marche pas ou ne semble pas être le bon (erreur, certificat, nom absent) : trouve (1) le BON SITE OFFICIEL ou la page officielle qui la présente, (2) le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure. Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : n'en cherche jamais ailleurs que sur une page officielle, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Territoire confirmé (commune, 24 ou 87) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. SIAO Haute-Vienne (Limoges) | site proposé : https://www.siao87.fr
2. Centre communal d'action sociale de Limoges (Limoges) | site proposé : https://www.limoges.fr | numéro de la fiche : 05 55 45 97 00
3. Centre communal d'action sociale de Panazol (Panazol) | site proposé : https://www.panazol.fr
4. Centre communal d'action sociale d'Isle (Isle) | site proposé : https://www.isle.fr
5. Centre communal d'action sociale de Couzeix (Couzeix) | site proposé : https://www.ville-couzeix.fr
6. Groupe FEL (Limoges) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation/fiche-repertoire/fel-gueret/
7. ASTI de Périgueux (Périgueux) | site proposé : https://asti24.fr
8. ADEFA Dordogne (Coulounieix-Chamiers) | site proposé : https://www.anefa.org
9. Retravailler Sud-Ouest (, portée region) | site proposé : https://www.retravailler-sudouest.fr | numéro de la fiche : 05 56 08 29 58
10. GEIQ Agri Limousin Périgord (Limoges) | site proposé : https://www.geiqagriqualif-limousin.fr/ | numéro de la fiche : 05 55 49 85 76
11. GEIQ Transport Nouvelle-Aquitaine (Saint-Germain-les-Belles) | site proposé : https://www.geiqtransport-na.fr/ | numéro de la fiche : 05 55 77 54 50
12. Club Dordogne Entrepreneurs (Bergerac) | site proposé : https://www.club-dordogne-entrepreneurs.fr | numéro de la fiche : 06 63 12 53 61
13. CoActions (Périgueux) | site proposé : https://www.coactions.coop | numéro de la fiche : 05 53 35 80 30
14. CoActions (Limoges) | site proposé : https://www.coactions.coop | numéro de la fiche : 05 55 79 11 14
15. ASTER Couveuse d'entreprises (Limoges) | site proposé : https://www.bge-nouvelle-aquitaine.fr/presence-sur-le-territoire/haute-vienne | numéro de la fiche : 05 55 33 14 79
16. Entreprendre au Féminin Aquitaine (, portée region) | site proposé : https://entreprendreaufeminin-aquitaine.org | numéro de la fiche : 05 56 01 35 70
17. Limoges Habitat (Limoges) | site proposé : https://www.limoges-habitat.fr | numéro de la fiche : 05 55 43 45 00
18. Le Planning Familial 24 - Dordogne / Périgueux (Périgueux) | site proposé : https://planning-familial-na.org/antenne-departementale/dordogne-24-perigueux/ | numéro de la fiche : 06 71 77 37 02
19. Le Planning Familial 24 - Dordogne / Bergerac (Bergerac) | site proposé : https://planning-familial-na.org/antenne-departementale/dordogne-24-bergerac/
20. Espace CHOISIR (Limoges) | site proposé : https://www.haute-vienne.fr/tous-les-annuaires/tous-les-centres-de-planification
21. Place de l'emploi public (, portée national) | site proposé : https://www.place-emploi-public.gouv.fr
22. FDSEA de la Haute-Vienne - Service Employeurs (Panazol) | site proposé : https://www.fdsea87.fr | numéro de la fiche : 05 87 50 41 00
23. FARAGO Nouvelle-Aquitaine (, portée region) | site proposé : https://www.farago.fr | numéro de la fiche : 05 56 01 33 60
24. France Rénov' (, portée national) | site proposé : https://france-renov.gouv.fr | numéro de la fiche : 0 808 800 700

---

# Lot 30 (E2, 1/4)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, le site proposé ne marche pas ou ne semble pas être le bon (erreur, certificat, nom absent de la page). Trouve le BON SITE OFFICIEL et, si elle existe, sa PAGE DE RECRUTEMENT. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Bon site officiel | Page de recrutement | Pourquoi l'ancien site ne convenait pas | Preuve (la phrase lue) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Zara (commerce-vente ; Limoges) | site proposé : https://www.zara.com | recrutement proposé : https://www.inditexcareers.com
2. Sandaya Le Grand Dague (hotellerie-restauration ; Boulazac Isle Manoire) | site proposé : https://www.sandaya.fr | recrutement proposé : https://recrutement.sandaya.jobs/fr/offres
3. VTF Le Domaine du Peyrichoux (hotellerie-restauration ; Singleyrac) | site proposé : https://www.vtf-vacances.com | recrutement proposé : https://www.vtf-vacances.com
4. Mercure Périgueux Centre (hotellerie-restauration ; Périgueux) | site proposé : https://all.accor.com | recrutement proposé : https://careers.accor.com
5. Mercure Limoges Royal Limousin (hotellerie-restauration ; Limoges) | site proposé : https://all.accor.com | recrutement proposé : https://careers.accor.com
6. Centre Hospitalier de Domme (sante ; Domme) | site proposé : https://www.hldomme.com | recrutement proposé : https://www.hldomme.com/recrutement
7. Laboratoire Départemental d'Analyse et de Recherche de la Dordogne (sante ; Coulounieix-Chamiers) | site proposé : https://www.labo24.fr
8. VYV Ambulance (sante ; Isle) | site proposé : https://www.vyv3.fr | recrutement proposé : https://recrutement.vyv3.fr
9. Amelis Périgueux (social-personne ; Périgueux) | site proposé : https://www.amelis-services.com
10. O2 Périgueux Ouest (social-personne ; Périgueux) | site proposé : https://www.o2.fr | recrutement proposé : https://www.o2recrute.fr
11. A DOM' Limousin (social-personne ; Limoges) | site proposé : https://www.adomlimousin.fr
12. UNA OUEST 87 (social-personne ; Saint-Junien) | site proposé : https://www.una.fr
13. Foyer Sourds Aveugles La Peyrouse (social-personne ; Saint-Félix-de-Villadeix) | site proposé : https://www.apajh.org | recrutement proposé : https://www.apajh.org/recrutement
14. FamiDom Limoges (social-personne ; Limoges) | site proposé : https://www.famidom.fr | recrutement proposé : https://www.famidom.fr/recrutement
15. NGE - ABTP BIARD (btp ; Bergerac) | site proposé : https://www.groupe-nge.fr
16. Entreprise Guy (btp ; Le Buisson-de-Cadouin) | site proposé : https://www.entrepriseguy.fr
17. Bergerac TP (btp ; Saint-Agne) | site proposé : https://www.bergeractp.fr
18. NGE Routes (btp ; Limoges) | site proposé : https://www.groupe-nge.fr
19. Hebras Travaux Publics (btp ; Limoges) | site proposé : https://www.hebras.fr
20. Pasquier & Fils (btp ; Pierre-Buffière) | site proposé : https://www.pasquier-et-fils.fr
21. Flacassier Bâtiment (btp ; Feytiat) | site proposé : https://www.flacassier.fr
22. Voyages Rey (transport-logistique ; Le Bugue) | site proposé : https://www.voyages-rey.fr
23. Transport Big Big (transport-logistique ; Saint-Astier) | site proposé : https://www.bigbig.fr
24. Régie Régionale des Transports de la Haute-Vienne (transport-logistique ; Limoges) | site proposé : https://www.rrthv.fr | recrutement proposé : https://www.rrthv.fr/recrutement
25. Transports Royer-Sazerat (transport-logistique ; Limoges) | site proposé : https://www.royer.fr

---

# Lot 31 (E2, 2/4)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, le site proposé ne marche pas ou ne semble pas être le bon (erreur, certificat, nom absent de la page). Trouve le BON SITE OFFICIEL et, si elle existe, sa PAGE DE RECRUTEMENT. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Bon site officiel | Page de recrutement | Pourquoi l'ancien site ne convenait pas | Preuve (la phrase lue) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. DHL Freight (transport-logistique ; Limoges) | site proposé : https://www.dhl.com | recrutement proposé : https://careers.dhl.com
2. Eurenco Bergerac (industrie ; Bergerac) | site proposé : https://www.eurenco.com | recrutement proposé : https://www.eurenco.com/careers
3. Interspray (Groupe Fareva) (industrie ; Neuvic) | site proposé : https://www.fareva.com
4. Fromarsac (industrie ; Marsac-sur-l'Isle) | site proposé : https://www.fromarsac.fr
5. Grasasa (industrie ; Beaumontois en Périgord) | site proposé : https://www.grasasa.com
6. Arquus (industrie ; Limoges) | site proposé : https://www.arquus-defense.com | recrutement proposé : https://www.arquus-defense.com/fr/carrieres
7. Steva Limousin (industrie ; Bessines-sur-Gartempe) | site proposé : https://www.steva.fr
8. EPC France (industrie ; Saint-Sylvestre) | site proposé : https://www.epc-groupe.com | recrutement proposé : https://www.epc-groupe.com/carrieres
9. Communauté d'Agglomération Bergeracoise (administration ; Bergerac) | site proposé : https://www.la-cab.fr
10. AGC Dordogne (administration ; Coulounieix-Chamiers) | site proposé : https://www.agc24.fr
11. Ville de Panazol (administration ; Panazol) | site proposé : https://www.panazol.fr
12. CAF de la Haute-Vienne (administration ; Limoges) | site proposé : https://www.caf.fr | recrutement proposé : https://www.lasecurecrute.fr
13. URSSAF Limousin (administration ; Limoges) | site proposé : https://www.urssaf.fr | recrutement proposé : https://www.urssaf.org/recrutement
14. Hébert et Associés (administration ; Limoges) | site proposé : https://www.hebert-associes.fr
15. Océalia (agriculture-nature ; Limoges) | site proposé : https://www.ocealia-groupe.com | recrutement proposé : https://www.ocealia-groupe.com/recrutement
16. Avenir Paysage 87 (agriculture-nature ; Verneuil-sur-Vienne) | site proposé : https://www.avenirpaysage87.fr
17. GEIQ Agri Limousin Périgord (agriculture-nature ; Limoges) | site proposé : https://www.geiqagri.com
18. Groupe Nicollin (proprete ; Périgueux) | site proposé : https://www.groupenicollin.com | recrutement proposé : https://www.groupenicollin.com/recrutement
19. Henault Recyclage (proprete ; Limoges) | site proposé : https://www.henault.com
20. CDR Environnement (proprete ; Limoges) | site proposé : https://www.cdr-environnement.fr
21. Sanicentre Limoges (proprete ; Limoges) | site proposé : https://www.sanicentre-limoges.fr
22. Abeille Compost 87 (proprete ; Saint-Junien) | site proposé : https://www.abeille-compost.fr
23. GSF Athéna (proprete ; Limoges) | site proposé : https://www.gsf.fr
24. Mercedes-Benz LG Périgueux Automobiles (automobile ; Trélissac) | site proposé : https://www.lg-automobiles.com | recrutement proposé : https://www.lg-automobiles.com/recrutement
25. Clara Automobiles Peugeot (automobile ; Trélissac, Bergerac) | site proposé : https://www.clara-automobiles.com | recrutement proposé : https://www.clara-automobiles.com/recrutement

---

# Lot 32 (E2, 3/4)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, le site proposé ne marche pas ou ne semble pas être le bon (erreur, certificat, nom absent de la page). Trouve le BON SITE OFFICIEL et, si elle existe, sa PAGE DE RECRUTEMENT. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Bon site officiel | Page de recrutement | Pourquoi l'ancien site ne convenait pas | Preuve (la phrase lue) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Toyota Clara Automobiles (automobile ; Trélissac) | site proposé : https://www.clara-automobiles.com | recrutement proposé : https://www.clara-automobiles.com/recrutement
2. Centrale Auto Marché (automobile ; Saint-Médard-de-Mussidan) | site proposé : https://www.centraleautomarche.com
3. Mercedes-Benz LG Limoges Automobiles (automobile ; Limoges) | site proposé : https://www.lg-automobiles.com | recrutement proposé : https://www.lg-automobiles.com/recrutement
4. Fiat Ital Auto 87 (automobile ; Limoges) | site proposé : https://www.italauto.fr | recrutement proposé : https://www.italauto.fr/recrutement
5. Samsic Sécurité (securite ; Limoges) | site proposé : https://www.samsic-securite.fr | recrutement proposé : https://jobs.samsic.com
6. BTP CFA 87 Limoges (education-formation ; Limoges) | site proposé : https://www.btpcfa-na.fr
7. CFPPA Les Vaseix (education-formation ; Verneuil-sur-Vienne, Bellac) | site proposé : https://www.epl-limoges-nord87.fr
8. MFR Les Vaseix (education-formation ; Verneuil-sur-Vienne) | site proposé : https://www.mfr.fr
9. Les Pros d'Avenir - École de Production (education-formation ; Limoges) | site proposé : https://lesprosdavenir.fr
10. Magic Fitness (sport-animation ; Couzeix) | site proposé : https://www.magicfitness.fr
11. Centre Social Municipal de Beaubreuil (sport-animation ; Limoges) | site proposé : https://www.limoges.fr
12. Centre Social Municipal La Parenthèse de la Glane (sport-animation ; Saint-Junien) | site proposé : https://www.saint-junien.fr
13. SFERE24 (numerique ; Boulazac Isle Manoire) | site proposé : https://telecoms.groupe-sequences.fr
14. Agence Beacom (numerique ; Bergerac) | site proposé : https://beacom.fr
15. Solune (numerique ; Limoges) | site proposé : https://www.solune.fr | recrutement proposé : https://www.solune.fr/recrutement
16. Ecomdata (numerique ; Limoges) | site proposé : https://www.ecomdata.fr
17. Code to Solve (numerique ; Limoges) | site proposé : https://www.codetosolve.fr
18. SCO.ME.BAT Coopérative des Menuisiers du Bâtiment (artisanat ; Ribérac) | site proposé : https://www.scomebat.fr
19. PENY Ébénisterie Menuiserie Agencement (artisanat ; Gardonne) | site proposé : https://www.peny-ebenisterie.fr
20. Rebinguet Frères (artisanat ; Ginestet) | site proposé : https://www.rebinguet.fr
21. Leclerc Menuiseries (artisanat ; Isle) | site proposé : https://www.leclerc-menuiseries.fr
22. Carpenet Porcelaine (artisanat ; Limoges) | site proposé : https://www.carpenet.com
23. Addict Paris (coiffure-esthetique ; Le Vigen) | site proposé : https://addictparis.fr
24. Réussir Le Périgord (communication-culture ; Périgueux) | site proposé : https://www.reussir.fr/perigord
25. Musée Vesunna (communication-culture ; Périgueux) | site proposé : https://vesunna.fr

---

# Lot 33 (E2, 4/4)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, le site proposé ne marche pas ou ne semble pas être le bon (erreur, certificat, nom absent de la page). Trouve le BON SITE OFFICIEL et, si elle existe, sa PAGE DE RECRUTEMENT. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Bon site officiel | Page de recrutement | Pourquoi l'ancien site ne convenait pas | Preuve (la phrase lue) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Musée du Tabac (communication-culture ; Bergerac) | site proposé : https://www.bergerac.fr
2. L'Agence (communication-culture ; Limoges) | site proposé : https://www.lagencecom.fr
3. Agence Monstera (communication-culture ; Limoges) | site proposé : https://www.monstera.fr
4. Parc du Thot (animalier ; Thonac) | site proposé : https://www.lascaux.fr

---

# Lot 34 (S1, 1/5)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), trouve (1) son SITE OFFICIEL ou la page officielle qui la présente, (2) le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure. Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : n'en cherche jamais ailleurs que sur une page officielle, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Territoire confirmé (commune, 24 ou 87) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Habitat et Humanisme Limousin (Limoges) | numéro de la fiche : 05 55 32 21 98
2. Cité Béthanie - CHRS (Bergerac) | numéro de la fiche : 05 53 23 74 98
3. La Halte 24 (Périgueux)
4. France Terre d'Asile (Bergerac)
5. Service d'Accompagnement des Familles en Difficulté (SAFED) (Périgueux)
6. Association Service Formation Emploi Limousin (Saint-Junien) | numéro de la fiche : 05 19 29 00 50
7. Mon Garage Solidaire (Coly-Saint-Amand) | numéro de la fiche : 06 76 78 05 60
8. MSoR - Mobilité Solidaire Rurale (Bellac) | numéro de la fiche : 06 33 65 17 47
9. Micro-crèche La Fée Risette (Compreignac) | numéro de la fiche : 05 55 12 88 02
10. Crèche Napoléon Magne (Périgueux) | numéro de la fiche : 05 53 53 47 49
11. Crèche des Arènes (Périgueux) | numéro de la fiche : 05 53 08 04 29
12. Crèche Halte Garderie Câlins Câlines (Périgueux) | numéro de la fiche : 05 53 53 55 79
13. Crèche Clos Chassaing (Périgueux) | numéro de la fiche : 05 53 35 86 38
14. Crèche La Maison des Doudous (Bassillac et Auberoche) | numéro de la fiche : 05 53 03 45 33
15. Crèche La Maison du Petit Prince (Coulounieix-Chamiers) | numéro de la fiche : 05 53 35 74 10
16. Crèche Valentine Bussière (Boulazac Isle Manoire) | numéro de la fiche : 05 53 03 53 16
17. Le Xylophone (Boulazac Isle Manoire)
18. Crèche Les Souris Vertes (Marsac-sur-l'Isle) | numéro de la fiche : 05 53 04 12 12
19. Maison de la Petite Enfance (Sarlat-la-Canéda) | numéro de la fiche : 05 53 31 45 64
20. Gambada Crèche La Canéda (Sarlat-la-Canéda) | numéro de la fiche : 06 65 65 62 05
21. Maison de l'Enfance (Montignac-Lascaux) | numéro de la fiche : 05 53 51 87 06
22. Multi Accueil La Souris Jaune (Le Bugue) | numéro de la fiche : 05 53 07 82 14
23. Crèche Pous (Bergerac) | numéro de la fiche : 05 53 57 22 95
24. Crèche L'Isle aux Bambins (Mussidan) | numéro de la fiche : 05 53 81 23 68
25. Maison Petite Enfance (Saint-Astier) | numéro de la fiche : 05 53 54 06 58

---

# Lot 35 (S1, 2/5)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), trouve (1) son SITE OFFICIEL ou la page officielle qui la présente, (2) le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure. Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : n'en cherche jamais ailleurs que sur une page officielle, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Territoire confirmé (commune, 24 ou 87) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Micro-Crèche Les Coccinelles (Brantôme en Périgord) | numéro de la fiche : 05 53 05 27 83
2. Micro Crèche Les Petitous (Château-l'Évêque) | numéro de la fiche : 05 53 03 47 88
3. Micro-Crèche Les Ptits Loups (Nontron) | numéro de la fiche : 05 53 56 67 13
4. Micro Crèche Les Lutins d'Edith (Sanilhac) | numéro de la fiche : 05 53 04 31 89
5. APEI Périgueux (Boulazac Isle Manoire) | numéro de la fiche : 05 53 08 20 87
6. Service pénitentiaire d'insertion et de probation de la Haute-Vienne (Limoges) | numéro de la fiche : 05 55 49 11 00
7. Culture Alpha (Limoges)
8. Association Périgourdine d'Action et de Recherche sur l'Exclusion (APARE) - Centre d'accueil pour demandeurs d'asile (Périgueux) | numéro de la fiche : 05 53 02 65 00
9. ARSL - Centre d'accueil pour demandeurs d'asile (Limoges) | numéro de la fiche : 05 55 34 70 44
10. Association HESTIA - Centre d'accueil pour demandeurs d'asile (Limoges) | numéro de la fiche : 05 55 38 98 00
11. Adoma - Centre d'accueil pour demandeurs d'asile d'Eymoutiers (Eymoutiers) | numéro de la fiche : 05 19 76 11 01
12. Centre hospitalier spécialisé Vauclaire (Montpon-Ménestérol) | numéro de la fiche : 05 53 82 82 82
13. Centre Médico-Psychologique de Périgueux (Périgueux) | numéro de la fiche : 05 53 45 29 05
14. Centre Médico-Psychologique de Nontron (Nontron) | numéro de la fiche : 05 53 05 66 89
15. Centre Médico-Psychologique de Sarlat (Sarlat-la-Canéda) | numéro de la fiche : 05 53 31 76 56
16. CMP / CATTP et Hôpital de jour du Centre hospitalier Vauclaire (Brantôme en Périgord) | numéro de la fiche : 05 53 82 89 90
17. Centre Médico-Psychologique de Terrasson (Terrasson-Lavilledieu)
18. Centre Médico-Psychologique de Montpon-Ménestérol (Montpon-Ménestérol) | numéro de la fiche : 05 53 82 00 55
19. Association Addictions France - CSAPA de Périgueux (Périgueux) | numéro de la fiche : 05 53 07 66 82
20. Centre d'Addictologie du Sarladais (Sarlat-la-Canéda) | numéro de la fiche : 05 53 28 92 34
21. CEID Périgueux (Périgueux) | numéro de la fiche : 05 53 46 63 83
22. Maison des Adolescents de la Dordogne (Bergerac) | numéro de la fiche : 05 53 61 55 93
23. Pôle d'Hospitalisation Psychiatrique Bergeracois (Bergerac)
24. Centre Médico-Psycho-Pédagogique de Périgueux (Périgueux) | numéro de la fiche : 05 53 53 38 85
25. Centre Médico-Psycho-Pédagogique de Bergerac (Bergerac) | numéro de la fiche : 05 53 57 18 65

---

# Lot 36 (S1, 3/5)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), trouve (1) son SITE OFFICIEL ou la page officielle qui la présente, (2) le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure. Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : n'en cherche jamais ailleurs que sur une page officielle, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Territoire confirmé (commune, 24 ou 87) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Centre Médico-Psychologique pour enfants et adolescents de Périgueux (Périgueux) | numéro de la fiche : 05 53 82 82 56
2. Centre Médico-Psychologique Enfants et Adolescents de Montpon-Ménestérol (Montpon-Ménestérol) | numéro de la fiche : 05 53 80 39 43
3. Centre Médico-Psychologique Enfants et Adolescents de Beaumontois-en-Périgord (Beaumontois-en-Périgord) | numéro de la fiche : 05 53 22 85 76
4. Centre Médico-Psychologique Enfants et Adolescents de Ribérac (Ribérac) | numéro de la fiche : 05 53 61 55 94
5. Consultation Médico-Psychologique pour Enfants et Adolescents de Nontron (Nontron) | numéro de la fiche : 05 53 56 23 25
6. CEID Addictions Dordogne - antenne de Bergerac (Bergerac) | numéro de la fiche : 05 53 74 20 49
7. Centre hospitalier Vauclaire - Unité d'addictologie Escales (Périgueux) | numéro de la fiche : 05 53 05 66 80
8. Hôpital de jour Addictologie L'Envol (Périgueux) | numéro de la fiche : 05 53 61 55 99
9. Centre Médico-Psychologique pour Adultes de Bergerac (Bergerac) | numéro de la fiche : 05 53 27 42 46
10. Centre Médico Psychologique Van Gogh (Limoges) | numéro de la fiche : 05 55 43 13 33
11. Centre Médico Psychologique Sainte Claire (Limoges) | numéro de la fiche : 05 55 43 13 33
12. Centre Médico Psychologique du Val de Vienne (Saint-Junien) | numéro de la fiche : 05 55 43 11 20
13. Centre Médico Psychologique du Bassin Arédien (Saint-Yrieix-la-Perche) | numéro de la fiche : 05 55 43 11 20
14. Centre de Proximité en Santé Mentale du Haut Limousin (Magnac-Laval) | numéro de la fiche : 05 55 43 11 20
15. Centre Médico Psychologique Monts et Barrages (Saint-Léonard-de-Noblat) | numéro de la fiche : 05 87 50 90 94
16. Centre Médico Psycho Pédagogique de Limoges (Limoges) | numéro de la fiche : 05 55 77 32 39
17. Centre Médico Psycho Pédagogique de Saint-Junien (Saint-Junien) | numéro de la fiche : 05 55 02 27 40
18. Équipe Mobile Psychiatrie Précarité (Limoges) | numéro de la fiche : 05 55 43 12 07
19. Association Addictions France Haute-Vienne (Limoges) | numéro de la fiche : 05 55 34 46 00
20. CSAPA Bobillot (Limoges) | numéro de la fiche : 05 55 34 43 77
21. Maison des Adolescents de la Haute-Vienne (Limoges) | numéro de la fiche : 05 55 12 76 00
22. Association Périgord Linguistique et Culturel (Périgueux)
23. Maison de l'Emploi du Périgord Noir (Sarlat-la-Canéda) | numéro de la fiche : 05 53 31 56 00
24. Espace Économie Emploi du Ribéracois (Ribérac)
25. Groupement Employeurs Métiers 24 (Périgueux)

---

# Lot 37 (S1, 4/5)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), trouve (1) son SITE OFFICIEL ou la page officielle qui la présente, (2) le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure. Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : n'en cherche jamais ailleurs que sur une page officielle, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Territoire confirmé (commune, 24 ou 87) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Groupement d'Employeurs Rural Sarladais (Montignac-Lascaux)
2. GEIQ 87 Construction (Limoges) | numéro de la fiche : 05 55 35 10 42
3. GE Alisé Haute-Vienne (Limoges) | numéro de la fiche : 05 55 01 18 73
4. GEIQ SAGE (Limoges)
5. Fédération Départementale des Centres Sociaux du Périgord (Marsac-sur-l'Isle) | numéro de la fiche : 07 89 34 00 03
6. Centre Social Jean Moulin (Bergerac) | numéro de la fiche : 05 53 22 23 40
7. Centre Social Germaine Tillion (Bergerac) | numéro de la fiche : 05 53 57 92 78
8. Centre Social La Brunetière (Bergerac) | numéro de la fiche : 05 53 63 15 57
9. Centre Social Saint-Exupéry (Coulounieix-Chamiers) | numéro de la fiche : 05 53 45 60 30
10. Centre Social et Culturel L'Arche (Périgueux) | numéro de la fiche : 05 53 09 50 43
11. La Maison des Aidants (Bergerac) | numéro de la fiche : 05 53 24 97 27
12. Union Départementale des Associations Familiales de la Dordogne (Périgueux) | numéro de la fiche : 05 53 06 41 00
13. Centre Social Aristide Briand - ALIS (Limoges) | numéro de la fiche : 05 55 10 95 36
14. Centre Social Entre Deux - ALIS (Limoges) | numéro de la fiche : 05 87 75 80 64
15. Centre Social Alchimis (Limoges) | numéro de la fiche : 05 55 57 38 24
16. Centre Social Municipal de Beaubreuil (Limoges) | numéro de la fiche : 05 55 45 64 84
17. Centre Social Municipal La Parenthèse de la Glane (Saint-Junien) | numéro de la fiche : 07 61 64 42 75
18. Plateforme de soutien aux aidants Evaasion (Limoges) | numéro de la fiche : 05 19 99 99 99
19. Plateforme d'accompagnement et de répit des aidants Le Castel (Limoges) | numéro de la fiche : 05 55 33 99 00
20. Équipe mobile psychiatrie précarité du Bergeracois (centre hospitalier de Vauclaire) (Bergerac) | numéro de la fiche : 05 53 27 71 41
21. Groupe d'entraide mutuelle (GEM) de Bergerac, association Croix Marine (Bergerac) | numéro de la fiche : 05 53 22 55 24
22. Groupe d'entraide mutuelle (GEM) d'Excideuil, association Croix Marine (Excideuil) | numéro de la fiche : 09 52 86 72 23
23. Groupe d'entraide mutuelle (GEM) de Montpon-Ménestérol, association Croix Marine (Montpon-Ménestérol) | numéro de la fiche : 09 53 19 43 99
24. Groupe d'entraide mutuelle (GEM) de Neuvic, association Croix Marine (Neuvic) | numéro de la fiche : 09 50 47 79 63
25. Groupe d'entraide mutuelle (GEM) de Nontron, association Croix Marine (Nontron) | numéro de la fiche : 09 84 07 29 25

---

# Lot 38 (S1, 5/5)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), trouve (1) son SITE OFFICIEL ou la page officielle qui la présente, (2) le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure. Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : n'en cherche jamais ailleurs que sur une page officielle, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Territoire confirmé (commune, 24 ou 87) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Groupe d'entraide mutuelle (GEM) de Périgueux, association Croix Marine (Périgueux) | numéro de la fiche : 05 53 08 56 29
2. Groupe d'entraide mutuelle (GEM) de Sarlat-la-Canéda, association Croix Marine (Sarlat-la-Canéda) | numéro de la fiche : 09 50 25 30 99
3. Groupe d'entraide mutuelle (GEM) de Terrasson-Lavilledieu, association Croix Marine (Terrasson-Lavilledieu) | numéro de la fiche : 09 53 99 82 61
4. Part'ÂGE, espace de vie sociale (quartier Campréal) (Bergerac) | numéro de la fiche : 05 53 57 28 57
5. Centre médico-social de Sigoulès (canton sud bergeracois) (Sigoulès-et-Flaugeac) | numéro de la fiche : 05 53 02 06 13
6. La Traverse, accès aux droits et aide au numérique (Bergerac) | numéro de la fiche : 07 69 63 67 85
7. CIDFF de la Dordogne, accompagnements numériques () | numéro de la fiche : 05 53 35 90 90
8. La Banque Postale, service L'Appui (, portée national) | numéro de la fiche : 09 69 36 39 20

---

# Lot 39 (E1, 1/13)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, trouve (1) son SITE OFFICIEL, (2) sa PAGE DE RECRUTEMENT si elle existe (offres, « nous rejoindre », candidature spontanée). Beaucoup sont de petites entreprises locales sans site : dans ce cas écris « pas de site trouvé », ce n'est pas un échec. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site officiel | Page de recrutement | Preuve (la phrase lue, avec la commune ou le département) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Camping du Lac de Saint-Pardoux (hotellerie-restauration ; Saint-Pardoux-le-Lac)
2. Camping Au Pont du Dognon (hotellerie-restauration ; Saint-Laurent-les-Églises)
3. Camping du Château de Leychoisier (hotellerie-restauration ; Bonnac-la-Côte)
4. Camping de Montréal (hotellerie-restauration ; Saint-Germain-les-Belles)
5. Camping du Lac d'Arfeuille (hotellerie-restauration ; Saint-Yrieix-la-Perche)
6. Camping Le Cheyenne Limousin (hotellerie-restauration ; Châteauneuf-la-Forêt)
7. Centre Hospitalier de Belvès (sante ; Pays de Belvès)
8. Dordogne Ambulances (sante ; Terrasson-Lavilledieu)
9. Ambulances Paoli (sante ; Pays de Belvès)
10. Secours Ambulances Services 24 (sante ; Périgueux)
11. Périgord Ambulances (sante ; Trélissac)
12. SAS Fredange Ambulances Rouffignacoises (sante ; Rouffignac-Saint-Cernin-de-Reilhac)
13. Ambulances et Taxis de Lalinde (sante ; Lalinde)
14. EHPAD de Mussidan (sante ; Mussidan)
15. Centre Hospitalier du Haut Limousin (sante ; Bellac, Magnac-Laval, Le Dorat)
16. Centre Hospitalier Jacques Boutard (sante ; Saint-Yrieix-la-Perche)
17. Centre Hospitalier Michel Barriet (sante ; Eymoutiers)
18. Express'Ambulances (sante ; Limoges)
19. Malika et Associés Ambulances (sante ; Limoges)
20. LCB Ambulances (sante ; Feytiat)
21. Ambulances Pascal 87 (sante ; Limoges)
22. EHPAD Les 5 Sens (sante ; Limoges)
23. EHPAD Jean Mahaut (sante ; Nieul)
24. EHPAD Le Puy Martin (sante ; Le Palais-sur-Vienne)
25. EHPAD Résidence du Parc (sante ; Panazol)

---

# Lot 40 (E1, 2/13)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, trouve (1) son SITE OFFICIEL, (2) sa PAGE DE RECRUTEMENT si elle existe (offres, « nous rejoindre », candidature spontanée). Beaucoup sont de petites entreprises locales sans site : dans ce cas écris « pas de site trouvé », ce n'est pas un échec. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site officiel | Page de recrutement | Preuve (la phrase lue, avec la commune ou le département) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. EHPAD La Pélaudine (sante ; Eymoutiers)
2. Unité de Vie Victor Thuillat (sante ; Limoges)
3. ADMR La Voie Verte (social-personne ; Sanilhac)
4. Association Maintien à Domicile Sud Bergeracois (AMAD) (social-personne ; Eymet)
5. Aide Familiale à Domicile (social-personne ; Bergerac)
6. AARD AV 24 (social-personne ; Bergerac)
7. ASSAD Dordogne (social-personne ; Périgueux)
8. ASADHP (social-personne ; Thiviers)
9. Association Communauté de Communes d'Aide à Domicile (social-personne ; Mussidan)
10. Service d'Aide à la Personne du Sarladais (social-personne ; Sarlat-la-Canéda)
11. Vie Paisible (social-personne ; Limoges)
12. Limousin Aide à Domicile (social-personne ; Limoges)
13. Foyer de Vie Lysander (social-personne ; Bassillac et Auberoche)
14. Foyer de Vie Lou Prat Dòu Solelh (social-personne ; Ribérac)
15. Foyer Jacques Delprat (social-personne ; Monpazier)
16. Éveil Aides et Services à Domicile (social-personne ; Ambazac, Compreignac)
17. Aides et Services 87 (social-personne ; Limoges)
18. AFRPA Bessines-Laurière (social-personne ; Bessines-sur-Gartempe)
19. BMPAH (social-personne ; Val d'Issoire)
20. Lhomme et Fils TP (btp ; Bergerac)
21. Bouijaud TP (btp ; Vélines)
22. Alemps & Fils (btp ; Savignac-les-Églises)
23. Entreprise Générale de Bâtiment (btp ; Creysse)
24. ETS Ribeiro (btp ; Coulounieix-Chamiers)
25. Coren Périgord (btp ; Saint-Astier)

---

# Lot 41 (E1, 3/13)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, trouve (1) son SITE OFFICIEL, (2) sa PAGE DE RECRUTEMENT si elle existe (offres, « nous rejoindre », candidature spontanée). Beaucoup sont de petites entreprises locales sans site : dans ce cas écris « pas de site trouvé », ce n'est pas un échec. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site officiel | Page de recrutement | Preuve (la phrase lue, avec la commune ou le département) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Bergeron Goudronnage EURL (btp ; Chancelade)
2. Tallet et Fils (btp ; Sarlande)
3. Cap'Élec Énergies (btp ; Trélissac)
4. Services Périgourdins (btp ; Montagnac-la-Crempse)
5. Batifrère Électricité (btp ; Siorac-en-Périgord)
6. Dordogne Sanitaire Chauffage Lamblin (btp ; Périgueux)
7. Chaumeil TP (btp ; Peyrat-de-Bellac)
8. SOTEC Groupe Massy (btp ; Limoges)
9. Entreprise Blanchon (btp ; Limoges)
10. TLB SARL (btp ; Limoges)
11. GEBO TP (btp ; Limoges)
12. COULON TP (btp ; Saint-Victurnien)
13. DLTP (btp ; Saint-Martin-le-Vieux)
14. Ouvrage BTP (btp ; Saint-Junien)
15. Transports Gil (transport-logistique ; Creysse)
16. Quertour Transports (transport-logistique ; Creysse)
17. Transports Peyrou (transport-logistique ; Bertric-Burée)
18. Transports Gauthier (transport-logistique ; Saint-Pardoux-la-Rivière)
19. Transports J.R. Maury (transport-logistique ; Négrondes)
20. Transports Malaurie (transport-logistique ; Le Buisson-de-Cadouin)
21. Voyages Duverneuil (transport-logistique ; Brantôme en Périgord)
22. Périgord Voyages (transport-logistique ; Carsac-Aillac)
23. Aquitaine Cars (transport-logistique ; Montpon-Ménestérol)
24. Transports Bellanger (transport-logistique ; Grignols)
25. Transports Gardon Limoges (TGL) (transport-logistique ; Le Palais-sur-Vienne)

---

# Lot 42 (E1, 4/13)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, trouve (1) son SITE OFFICIEL, (2) sa PAGE DE RECRUTEMENT si elle existe (offres, « nous rejoindre », candidature spontanée). Beaucoup sont de petites entreprises locales sans site : dans ce cas écris « pas de site trouvé », ce n'est pas un échec. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site officiel | Page de recrutement | Preuve (la phrase lue, avec la commune ou le département) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Transports Rebeyrolle (transport-logistique ; Saint-Victurnien)
2. Massy Voyages (transport-logistique ; Limoges)
3. Bus Lavalade Daniel (transport-logistique ; Bellac)
4. Europ Voyages 87 (transport-logistique ; Limoges)
5. Royer Logistique (transport-logistique ; Limoges)
6. CRC Logistique (transport-logistique ; Limoges)
7. Viandes Logistique Distribution (transport-logistique ; Limoges)
8. Groupe MTA Limoges (transport-logistique ; Limoges)
9. Centre Express Limousin 87 (transport-logistique ; Bonnac-la-Côte)
10. Transports Realle (transport-logistique ; Limoges)
11. Société des Transports de la Haute-Vienne (transport-logistique ; Bonnac-la-Côte)
12. Limousin Loctrans (transport-logistique ; Limoges)
13. Biscotterie La Chanteracoise (industrie ; Saint-Germain-du-Salembre)
14. Bouchillou Alkya (industrie ; Bergerac)
15. TPL Systèmes (industrie ; Sarlat-la-Canéda)
16. Industrie Bois Rousseau (industrie ; Dussac)
17. Europe Industrie 87 (industrie ; Saint-Junien)
18. IDMC Manufacture (industrie ; Limoges)
19. DVI (industrie ; Limoges)
20. Plast Avenir 87 (industrie ; Limoges)
21. MSA Dordogne Lot (administration ; Coulounieix-Chamiers) | recrutement proposé : https://recrutement.msa.fr
22. Communauté de communes ELAN Limousin Avenir Nature (administration ; Ambazac)
23. CBA Cabinet Bauriaud Associés (administration ; Limoges)
24. Sageco Bellac (administration ; Bellac)
25. Cabinet Muriel Bellegarde (administration ; Limoges)

---

# Lot 43 (E1, 5/13)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, trouve (1) son SITE OFFICIEL, (2) sa PAGE DE RECRUTEMENT si elle existe (offres, « nous rejoindre », candidature spontanée). Beaucoup sont de petites entreprises locales sans site : dans ce cas écris « pas de site trouvé », ce n'est pas un échec. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site officiel | Page de recrutement | Preuve (la phrase lue, avec la commune ou le département) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Pépinières Laplace (agriculture-nature ; Le Buisson-de-Cadouin)
2. Pépinières du Périgord (agriculture-nature ; Douville)
3. Farago Haute-Vienne (agriculture-nature ; Limoges)
4. Limousin Paysage (agriculture-nature ; Couzeix)
5. E. Gauquié Paysage (agriculture-nature ; Saint-Just-le-Martel)
6. Le Jardin de Plaisance (agriculture-nature ; Le Vigen)
7. Horticulture Delage (agriculture-nature ; Panazol)
8. Pépinière de la Chapelle (agriculture-nature ; Isle)
9. Pépinière Les Prés du Chiron (agriculture-nature ; Saint-Sornin-la-Marche)
10. Thibaut Paysage SARL (agriculture-nature ; Limoges)
11. Le Jardin de Vanteaux (agriculture-nature ; Limoges)
12. Chlorophylle Horticulture Germain Joncheray (agriculture-nature ; Condat-sur-Vienne)
13. Puygrenier Agriculture Centre Vert (agriculture-nature ; Glandon)
14. Herbelys (agriculture-nature ; Cheissoux)
15. Les Serres du Ponteix (agriculture-nature ; Feytiat)
16. Les Serres de Ventadour (agriculture-nature ; Solignac)
17. Dupuy SARL (agriculture-nature ; Saint-Yrieix-la-Perche)
18. P.N.S (proprete ; Verneuil-sur-Vienne)
19. Multi-Propr'Services (proprete ; Couzeix)
20. SICTOM Sud Haute-Vienne (proprete ; Saint-Yrieix-la-Perche)
21. Matei Environnement (proprete ; Limoges)
22. Net Plus (proprete ; Limoges)
23. Concept Nettoyage (proprete ; Saint-Gence)
24. Clean Service 87 (proprete ; Limoges)
25. Jeammet Automobiles (automobile ; Coulounieix-Chamiers)

---

# Lot 44 (E1, 6/13)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, trouve (1) son SITE OFFICIEL, (2) sa PAGE DE RECRUTEMENT si elle existe (offres, « nous rejoindre », candidature spontanée). Beaucoup sont de petites entreprises locales sans site : dans ce cas écris « pas de site trouvé », ce n'est pas un échec. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site officiel | Page de recrutement | Preuve (la phrase lue, avec la commune ou le département) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Garage de Guglielmi AD (automobile ; Trélissac)
2. Garage Lacombe (automobile ; Sarlat-la-Canéda)
3. Garage Antoine (automobile ; Sarlat-la-Canéda)
4. Clinic Auto (automobile ; Sarlat-la-Canéda)
5. Carrosserie Bardot (automobile ; Chancelade)
6. Carross'rie Gregory (automobile ; Bergerac)
7. Autobilan du Périgord (automobile ; Coulounieix-Chamiers)
8. SDAL Peugeot (automobile ; Limoges)
9. Gros Automobiles (automobile ; Feytiat)
10. Centre Auto du Palais (automobile ; Le Palais-sur-Vienne)
11. Carrosserie Langlade (automobile ; Verneuil-sur-Vienne)
12. L'Atelier du Carrossier LM (automobile ; La Geneytouse)
13. Garage Carrosserie Charbonnier (automobile ; Saint-Martin-le-Vieux)
14. Citroën Limoges Sud - Midi Auto 87 (automobile ; Limoges)
15. LD Auto 87 Staff Auto (automobile ; Couzeix)
16. SpeedAuto (automobile ; Limoges)
17. SPP Sécurité (securite ; Coulounieix-Chamiers)
18. ASI (securite ; Périgueux)
19. Compétence Sécurité (securite ; Périgueux)
20. GS3 Sécurité (securite ; Périgueux)
21. Xantor Vigilance et Sécurité (securite ; Saint-Astier)
22. Weesure Protection (securite ; Périgueux, Bergerac, Limoges)
23. Provençale Sécurité (securite ; Périgueux)
24. Limousin Sécurité (securite ; Limoges)
25. APS 87 (securite ; Limoges)

---

# Lot 45 (E1, 7/13)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, trouve (1) son SITE OFFICIEL, (2) sa PAGE DE RECRUTEMENT si elle existe (offres, « nous rejoindre », candidature spontanée). Beaucoup sont de petites entreprises locales sans site : dans ce cas écris « pas de site trouvé », ce n'est pas un échec. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site officiel | Page de recrutement | Preuve (la phrase lue, avec la commune ou le département) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. PSL Sécurité (securite ; Limoges)
2. Wise Sécurité (securite ; Limoges)
3. MP SP (securite ; Verneuil-sur-Vienne)
4. ALK Sécurité (securite ; Nedde)
5. GPSI Sécurité (securite ; Limoges)
6. SEGAO Sécurité (securite ; Feytiat)
7. APM Sécurité 87 (securite ; Limoges)
8. Protection Sécurité Privée (securite ; Limoges)
9. Lynx Sécurité Europe (securite ; Limoges)
10. Institution Sainte-Marthe Saint-Front (education-formation ; Bergerac)
11. Institution Sainte-Marthe (education-formation ; Périgueux)
12. Institution Saint-Joseph (education-formation ; Sarlat-la-Canéda)
13. École Sacré-Cœur (education-formation ; Périgueux)
14. CFA Académique du Limousin (education-formation ; Limoges)
15. CFIM TP (education-formation ; Le Palais-sur-Vienne)
16. 3iL Formation (education-formation ; Limoges)
17. Institution Alfred Fournier (education-formation ; Limoges)
18. Ligue de l'Enseignement de la Haute-Vienne (education-formation ; Limoges)
19. École de la Deuxième Chance Limousin (education-formation ; Verneuil-sur-Vienne)
20. ISFOGEP (education-formation ; Limoges)
21. HV Formations (education-formation ; Oradour-sur-Glane)
22. Fédération Départementale des Centres Sociaux du Périgord (sport-animation ; Marsac-sur-l'Isle)
23. Centre Social Jean Moulin (sport-animation ; Bergerac)
24. Centre Social Germaine Tillion (sport-animation ; Bergerac)
25. Centre Social La Brunetière (sport-animation ; Bergerac)

---

# Lot 46 (E1, 8/13)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, trouve (1) son SITE OFFICIEL, (2) sa PAGE DE RECRUTEMENT si elle existe (offres, « nous rejoindre », candidature spontanée). Beaucoup sont de petites entreprises locales sans site : dans ce cas écris « pas de site trouvé », ce n'est pas un échec. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site officiel | Page de recrutement | Preuve (la phrase lue, avec la commune ou le département) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Centre Social et Culturel L'Arche (sport-animation ; Périgueux)
2. Centre Social Saint-Exupéry (sport-animation ; Coulounieix-Chamiers)
3. Centre Social et Culturel Passerelle Vézère Haut Périgord Noir (sport-animation ; Thenon)
4. Le Loft Fitness Club (sport-animation ; Périgueux)
5. Le Club Sport en Conscience (sport-animation ; Bergerac)
6. Duck Gym (sport-animation ; Le Bugue)
7. Iron Gym (sport-animation ; Limoges)
8. Espace Forme (sport-animation ; Limoges)
9. Centre Social Aristide Briand ALIS (sport-animation ; Limoges)
10. Centre Social Entre Deux ALIS (sport-animation ; Limoges)
11. Le Club des Sports (sport-animation ; Saint-Junien)
12. Association Temps Jeunes (sport-animation ; Terrasson-Lavilledieu)
13. Association Soutien Partage Évasion (sport-animation ; Villamblard)
14. AJMR Lalinde (sport-animation ; Lalinde)
15. Centre Loisirs Jeunes de Limoges (sport-animation ; Limoges)
16. Centre de Ressources des Accueils de Loisirs de la Haute-Vienne (sport-animation ; Limoges)
17. MJC Limoges (sport-animation ; Limoges)
18. ASC Bellevue Sainte-Claire (sport-animation ; Limoges)
19. Centre social Alchimis (sport-animation ; Limoges)
20. OD&B (numerique ; Limoges)
21. Société Périgourdine de Salaisons (SPS) (artisanat-bouche ; Boulazac Isle Manoire)
22. Maison Lissajoux (artisanat-bouche ; Sarlat-la-Canéda)
23. SARL Au Fournil de la Cité (artisanat-bouche ; Périgueux)
24. Antoine Girard Pâtisserie Boulangerie (artisanat-bouche ; Périgueux)
25. Au Fournil de Benjamin (artisanat-bouche ; Périgueux)

---

# Lot 47 (E1, 9/13)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, trouve (1) son SITE OFFICIEL, (2) sa PAGE DE RECRUTEMENT si elle existe (offres, « nous rejoindre », candidature spontanée). Beaucoup sont de petites entreprises locales sans site : dans ce cas écris « pas de site trouvé », ce n'est pas un échec. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site officiel | Page de recrutement | Preuve (la phrase lue, avec la commune ou le département) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Au Tour des Traditions (artisanat-bouche ; Sanilhac)
2. Maison Carré (artisanat-bouche ; Castelnaud-la-Chapelle)
3. Boulangerie-Pâtisserie Fellner (artisanat-bouche ; La Douze)
4. Boulangerie Eytier (artisanat-bouche ; Mareuil en Périgord)
5. L'Ami du Pain Éric Perrier (artisanat-bouche ; Saint-Vincent-de-Connezac)
6. Charcuterie de Campagne Vaux (artisanat-bouche ; Sarlat-la-Canéda)
7. GBS Boucherie Charcuterie (artisanat-bouche ; Sarlat-la-Canéda)
8. Charcuterie Traiteur Christophe Orteil (artisanat-bouche ; Périgueux)
9. Maison Simoens FMG (artisanat-bouche ; Coursac)
10. Charcuterie Traiteur Anthony Filet (artisanat-bouche ; Bergerac)
11. Établissements Coudeyrat (artisanat-bouche ; Le Bugue)
12. Lard du Goût SARL (artisanat-bouche ; Saint-Pardoux-la-Rivière)
13. Servolle Jean-Jacques (artisanat-bouche ; Saint-Chamassy)
14. Chez Arnaud (artisanat-bouche ; Périgueux)
15. Les Gourmandises de Lucco (artisanat-bouche ; Castels et Bézenac)
16. Maison Faurie (artisanat-bouche ; Bessines-sur-Gartempe)
17. Artisan Boulanger Deperry (artisanat-bouche ; Saint-Junien)
18. Chez Sylvain (artisanat-bouche ; Limoges)
19. Chez Sylvain (artisanat-bouche ; Panazol)
20. Pâtisserie Sainte-Thérèse (artisanat-bouche ; Limoges)
21. Délices des Gourmets (artisanat-bouche ; Limoges)
22. Boulangerie Gavroche (artisanat-bouche ; Limoges)
23. Le Diablotin (artisanat-bouche ; Limoges)
24. Tournepains (artisanat-bouche ; Bosmie-l'Aiguille)
25. Coignac SAS (artisanat-bouche ; Saint-Léonard-de-Noblat)

---

# Lot 48 (E1, 10/13)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, trouve (1) son SITE OFFICIEL, (2) sa PAGE DE RECRUTEMENT si elle existe (offres, « nous rejoindre », candidature spontanée). Beaucoup sont de petites entreprises locales sans site : dans ce cas écris « pas de site trouvé », ce n'est pas un échec. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site officiel | Page de recrutement | Preuve (la phrase lue, avec la commune ou le département) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Chez Many (artisanat-bouche ; Veyrac)
2. La Cerise sur le Gâteau (artisanat-bouche ; Limoges)
3. Chez Renard (artisanat-bouche ; Limoges)
4. Boulangerie Sylvain Chatenet (artisanat-bouche ; Limoges, Feytiat)
5. Pain et Tradition de France (artisanat-bouche ; Limoges)
6. Au Fin Palais (artisanat-bouche ; Limoges)
7. Les Beigneurs (artisanat-bouche ; Limoges)
8. Maison MG (artisanat-bouche ; Isle)
9. A La Forêt Noire (artisanat-bouche ; Limoges)
10. Boulangerie Pâtisserie Sainte Claire (artisanat-bouche ; Limoges)
11. Ouvertures Périgourdines (artisanat ; Périgueux)
12. Marty Menuiseries Miroiteries (artisanat ; Champagnac-de-Belair)
13. Passion d'Autrefois (artisanat ; Saint-Laurent-des-Vignes)
14. L'Atelier du Périgord (artisanat ; Ménesplet)
15. LP Menuiserie (artisanat ; Castelnaud-la-Chapelle)
16. Ateliers Férignac (artisanat ; Hautefort)
17. Atelier Saint-Agnan (artisanat ; Hautefort)
18. Menuiserie Raynal (artisanat ; Coulounieix-Chamiers)
19. Maurice Faure Menuiseries (artisanat ; Limoges)
20. Isol-Eco (artisanat ; Feytiat)
21. Société Limousine de Menuiserie Charpente (SLMC) (artisanat ; Limoges)
22. SARL Mandonnaud Menuiserie (artisanat ; Limoges)
23. Inertia Menuiseries (artisanat ; Limoges)
24. Menuiserie de la Maulde (artisanat ; Bujaleuf)
25. Inno'Menuiserie (artisanat ; Limoges)

---

# Lot 49 (E1, 11/13)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, trouve (1) son SITE OFFICIEL, (2) sa PAGE DE RECRUTEMENT si elle existe (offres, « nous rejoindre », candidature spontanée). Beaucoup sont de petites entreprises locales sans site : dans ce cas écris « pas de site trouvé », ce n'est pas un échec. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site officiel | Page de recrutement | Preuve (la phrase lue, avec la commune ou le département) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. L'Atelier Barbabois (artisanat ; Saint-Yrieix-sous-Aixe)
2. CIDJI Fam Atelier de Stylisme Modélisme (artisanat ; Limoges)
3. Atelier d'ISA (artisanat ; Limoges)
4. Coud'Fil (artisanat ; Limoges)
5. Atelier des Métiers d'Art Hazard (artisanat ; Limoges)
6. Artistyk (coiffure-esthetique ; Périgueux)
7. Mathy's by Kristel (coiffure-esthetique ; Bergerac)
8. Anne Marie Styl (coiffure-esthetique ; Bergerac)
9. Style & Tendances (coiffure-esthetique ; Chancelade)
10. L'Instant Coiffure Beauté (coiffure-esthetique ; Sarlat-la-Canéda)
11. C&B Coiffure et Beauté (coiffure-esthetique ; Bergerac)
12. À l'Image de Soie (coiffure-esthetique ; Périgueux)
13. Rêv'Style (coiffure-esthetique ; Périgueux)
14. Au P'tit Salon (coiffure-esthetique ; Périgueux)
15. Styl'Coiffure Laetis (coiffure-esthetique ; Cénac-et-Saint-Julien)
16. Secrets de Fée (coiffure-esthetique ; Périgueux)
17. L'Institut VK (coiffure-esthetique ; Périgueux)
18. Aura & Beauté (coiffure-esthetique ; Trélissac)
19. Perles de Spa (coiffure-esthetique ; Marsac-sur-l'Isle)
20. Carole Beauté (coiffure-esthetique ; Mussidan)
21. Les Fées de la Beauté (coiffure-esthetique ; Thiviers)
22. Le Grain de Beauté (coiffure-esthetique ; Le Bugue)
23. Esthète Salon (coiffure-esthetique ; Limoges)
24. Au Salon d'Anaïs Coiffure Esthétique et Ongles (coiffure-esthetique ; Boisseuil)
25. Emy Avet Coiffure & Esthétique (coiffure-esthetique ; Limoges)

---

# Lot 50 (E1, 12/13)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, trouve (1) son SITE OFFICIEL, (2) sa PAGE DE RECRUTEMENT si elle existe (offres, « nous rejoindre », candidature spontanée). Beaucoup sont de petites entreprises locales sans site : dans ce cas écris « pas de site trouvé », ce n'est pas un échec. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site officiel | Page de recrutement | Preuve (la phrase lue, avec la commune ou le département) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Me and My Salon (coiffure-esthetique ; Rilhac-Rancon)
2. Univ'HairSpa (coiffure-esthetique ; Panazol)
3. Mon Salon Coiffure Institut (coiffure-esthetique ; Saint-Victurnien)
4. Isatis Le Spa (coiffure-esthetique ; Limoges)
5. Mon Spa (coiffure-esthetique ; Limoges)
6. Institut Sépia (coiffure-esthetique ; Limoges)
7. Pensée Cocoon (coiffure-esthetique ; Limoges)
8. Atelier du Bien Être (coiffure-esthetique ; Limoges)
9. Ambre Institut (coiffure-esthetique ; Aixe-sur-Vienne)
10. Le Démocrate Indépendant (communication-culture ; Bergerac)
11. CYL&COM (communication-culture ; Périgueux)
12. Distinguez-Vous (communication-culture ; Périgueux)
13. Centre Culturel Jean Gagnant (communication-culture ; Limoges)
14. Musée des Beaux-Arts de Limoges (communication-culture ; Limoges)
15. Stratege Communication (communication-culture ; Limoges)
16. Studio Emia (communication-culture ; Limoges)
17. Théâtre Expression 7 (communication-culture ; Limoges)
18. Musée de la Résistance (communication-culture ; Limoges)
19. Maison de l'Or en Limousin (communication-culture ; Le Chalard)
20. Au Royaume de l'Espoir CA-LIN (animalier ; Bassillac et Auberoche)
21. Le Parc Sauvage (animalier ; La Tour-Blanche-Cercles)
22. Zoo Refuge de Mescoules (animalier ; Mescoules)
23. SPA de la Haute-Vienne (animalier ; Couzeix)
24. Clinique Vétérinaire Vanteaux (animalier ; Limoges) | recrutement proposé : https://emploi.ivcevidensia.fr
25. Clinique Vétérinaire du Sablard (animalier ; Limoges)

---

# Lot 51 (E1, 13/13)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, trouve (1) son SITE OFFICIEL, (2) sa PAGE DE RECRUTEMENT si elle existe (offres, « nous rejoindre », candidature spontanée). Beaucoup sont de petites entreprises locales sans site : dans ce cas écris « pas de site trouvé », ce n'est pas un échec. Ne cherche PAS d'adresses de magasins ni de numéros de téléphone.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse ni de téléphone.

Format de réponse : un tableau Markdown : Employeur | Site officiel | Page de recrutement | Preuve (la phrase lue, avec la commune ou le département) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Clinique Vétérinaire Beaublanc (animalier ; Limoges)
2. Clinique Sirius (animalier ; Couzeix)
3. Clinique Vétérinaire du Palais (animalier ; Le Palais-sur-Vienne)
4. Parc Zoo du Reynou (animalier ; Le Vigen)
5. Refuge de Filémon (animalier ; Val-d'Issoire)
6. Clinique Vétérinaire de Louyat (animalier ; Limoges)
7. Cabinet Vétérinaire Armand Dutreix (animalier ; Limoges)
8. Cabinet vétérinaire Les Moustaches (animalier ; Chaptelat)
9. Clinique Vétérinaire Panaveto (animalier ; Panazol)
10. Clinique vétérinaire d'Ambazac (animalier ; Ambazac)
11. Clinique d'Arsonval (animalier ; Saint-Yrieix-la-Perche)
12. Groupement Vétérinaire (animalier ; Saint-Léonard-de-Noblat)
13. SOS Faune Sauvage (animalier ; Verneuil-sur-Vienne)
14. Galop Pour La Vie (animalier ; Bellac)
