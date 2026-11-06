# Institutions de la partie N du dossier Cloud : ce qui est au sas, ce qui reste (03/11/2026)

Document produit pendant l'étape 8 du plan de reprise. Rien n'est publié : les fiches sont au sas des structures (`outils/sas/lieux.sas.txt`) et attendent le « C'est bon » de Denis dans l'outil de veille, comme les autres.

## Ce qui a été fait

- Les 193 organismes non retrouvés de la partie N.2 (A : 118, B : 71, C : 4) ont été relus un par un. 189 ont été créés au sas, plus la sous-préfecture de Nontron lue sur la page de la préfecture : **190 fiches**, aucune pré-validée (la lecture de l'annuaire est automatique, les types et les descriptions sont proposés).
- Chaque fiche porte la fiche d'annuaire officielle (lannuaire.service-public.gouv.fr) comme site, l'adresse recopiée dans la colonne Source, et le site propre de l'organisme quand il existe. La date reste vide : c'est le « C'est bon » de Denis.
- Le numéro n'est repris que s'il est unique et complet dans la fiche (171 fiches en ont un, 19 n'en ont pas : numéros courts comme le 39 60 ou le 18, numéros multiples, numéro absent). La commune est déduite de l'adresse (181 fiches ; les 9 autres sont des services départementaux ou régionaux sans adresse dans la fiche).
- Trois organismes étaient déjà au sas et n'ont pas été recréés : Aract de Nouvelle-Aquitaine, Info Jeunes de Périgueux (même numéro), Maison de justice et du droit de Limoges. Une fiche lue deux fois dans le dossier (Draaf, siège de Limoges) n'a été créée qu'une fois.

## Répartition par type de l'outil

| Type | Fiches |
|---|---|
| collectivite-etat | 94 |
| formation-jeunes | 15 |
| justice-insertion | 13 |
| appui-aux-employeurs | 12 |
| creation-activite | 11 |
| budget-endettement | 9 |
| acces-au-droit | 8 |
| formation-orientation | 7 |
| soutien-aux-familles | 7 |
| sante-soins-addictions | 4 |
| inclusion-numerique | 4 |
| service-social-secteur | 4 |
| caisse-assurance-maladie-retraite | 1 |
| accueil-etrangers | 1 |

## Un écart à trancher : la sous-préfecture de Nontron

La fiche d'annuaire du greffe des associations de la Dordogne (Nontron) donne « 12 bis boulevard Gambetta » et le 05 53 02 24 24. La page de la préfecture de la Dordogne (sous-préfecture de Nontron, mise à jour le 01/10/2026, ouverte le 03/11/2026) donne « 208 boulevard Gambetta, 24300 Nontron » et le 05 47 24 16 76, avec un espace France Services au 05 47 24 16 78. J'ai créé la fiche « Sous-préfecture de Nontron » d'après la page de la préfecture, et retiré le numéro de la fiche du greffe (adresse à trancher). L'annuaire officiel est donc en retard sur ce point : toute adresse de cette partie reste à rouvrir avant son « C'est bon ».

## Ce qui reste de la partie N

- **N.3, employeurs publics et services de sécurité** (lus par le dossier sur les pages des préfectures, non rouverts ici) : École nationale de police de Périgueux, Centre national d'entraînement des forces de gendarmerie (Saint-Astier), maison d'arrêt de Périgueux, délégués du Défenseur des droits de la Haute-Vienne, OFB, SDJES, et la page de recrutement du SDIS 24 et du SDIS 87. À rouvrir page par page avant de créer.
- **N.4, associations hors annuaire officiel** : Que Choisir Ensemble Dordogne (site de l'association lu par le dossier), Unis-Cité Limoges, Compagnons Bâtisseurs, syndicats de salariés (adresses non lues sur les sites des organisations), conseillers du salarié. Aucune n'est créée : « rien à publier sans page officielle lue ».
- **N.5, types absents** : syndicats, conseillers du salarié, maisons et centres de santé, CeGIDD, médiathèques : l'annuaire officiel ne les liste pas.
- **Listes plafonnées à 20 dans l'annuaire** (France Services, CCAS, points d'information personnes âgées, points-justice, information jeunesse) : la lecture est un échantillon ; à refaire page par page dans le navigateur.
- **N.6 point 2** : le dossier propose d'ajouter des types à l'outil (`securite-justice`, `finances-publiques`, `vie-associative`, `jeunesse`, `etudiants`). Je ne l'ai pas fait : les 190 fiches utilisent les 28 types existants, ce qui reste cohérent avec les cartes actuelles de « Qui fait quoi ». À décider avec Denis quand ce module sera repris (étape 10).
- **N.6 point 7** : l'import périodique de l'annuaire (détection des changements d'adresse, de téléphone et d'horaires) n'est pas fait ; il passerait par `outils/verification_sites/verif_employeur.py` adapté.
