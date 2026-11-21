# Audit des trois chemins : tous les métiers peuvent-ils sortir, et que sort-il après peu de choix ? (21/11/2026, consigne 503)

> Analyse seule : aucun code de l'application n'a été modifié. Mesures faites sur le vrai moteur et la vraie base (1 925 métiers par nom, 1 920 par code ROME). Scripts rejouables : `scripts/auditAtteignabilite/` (lecture seule, à lancer depuis ce dossier avec `node <fichier>`). Mode B, effort moyen.

## 0. Ce qui est impossible, et ce qui a été fait à la place

Tester « chaque combinaison possible » n'est pas faisable : le chemin 2 propose 113 choix (jusqu'à 44 à la fois), ce qui fait des milliards de combinaisons. Le chemin 1 propose 489 savoir-faire, 16 savoir-être et plus de 6 000 savoirs. Ce qui a été testé, honnêtement :

- **Atteignabilité de chaque métier**, un par un (1 925 sur le chemin 2, 1 920 sur le chemin 1, 1 925 sur le chemin 3) ;
- **toutes les paires** de choix du chemin 2 (6 328 paires), **3 000 triples** pris au hasard (un choix par page), et **un triple « cohérent » par métier** (trois choix tirés de la fiche du métier lui-même) ;
- sur le chemin 1 : **un triple cohérent par métier** (1 920), **3 000 triples au hasard**, et chacun des 505 choix pris seul ;
- sur le chemin 3 : tous les codes de lettres possibles (156) et la répartition des métiers par code.

Une machine ne peut pas dire « ce résultat est absurde » : elle peut dire « ce résultat est surprenant ». Le jugement final sur les résultats surprenants reste à Denis (liste de départ au paragraphe 5).

## 1. Réponse à « tous les métiers peuvent-ils être atteints ? »

| Chemin | Métiers atteignables | Détail |
|---|---|---|
| 1. Par un métier (compétences) | **1 920 sur 1 920 codes ROME** | Chacun entre dans les 5 premiers avec 1 ou 2 compétences. Premier de la liste avec au plus 8 compétences : 1 900 sur 1 920. Les 20 autres restent à la 2e place ou plus, à égalité avec un métier voisin quasi identique (liste au paragraphe 4). |
| 2. Par ce que vous aimez faire | **1 925 sur 1 925** | Chacun entre dans les 20 premiers avec au plus 5 choix et dans les 5 premiers avec au plus 6 choix, à condition de choisir ce que sa fiche porte. Premier avec au plus 8 choix : 1 912 sur 1 925 (13 restent 2e à 8e, mêmes raisons). |
| 3. Questionnaire | **1 925 sur 1 925 ont des lettres** | Mais le chemin 3 ne désigne jamais un métier : il donne une famille de lettres (36 codes seulement). Dans sa propre famille, le rang médian d'un métier est 36. |

Deux réserves sur le chemin 1 : cinq métiers partagent le code ROME d'un autre et **ne peuvent pas sortir sous leur propre nom** (Arboriculteur, Agent de tri, Garde d'enfants à domicile, Agent de collecte des déchets, Agent polyvalent de collectivité : le chemin 1 garde un métier par code). Et « Installateur mainteneur en systèmes solaires, thermiques et photovoltaïques » n'a pas de signature ROME : une seule fiche décrit ses choix sur le chemin 2.

Tous les choix du catalogue (113) sont portés par au moins un métier. Le plus rare : « Des abeilles » (un seul métier : Apiculteur), puis « Préparer des boissons » (3), « Servir à table ou au comptoir » (14), « Des chevaux » (16).

## 2. « Quel est le métier avec le moins de choix ? »

- **Chemin 2** : les métiers que le moins de choix du catalogue décrivent sont **Grutier** et **Brancardier** (5 choix sur 113). Viennent ensuite 12 métiers à 6 choix (Chauffeur routier, Mécanicien automobile, Soudeur, Carreleur, Agent de service hospitalier, Agent immobilier...). La médiane est 10 choix par métier, le maximum 17.
- **Chemin 1** : **Gestionnaire en protection sociale** (12 compétences en tout), puis Masseur bien-être (15), Inventoriste et Technicien sécurité sociale (16). La médiane est 39, le maximum 93.
- **Plus petit nombre de choix pour faire sortir un métier en tête** : un seul choix suffit pour 68 métiers sur le chemin 2 (par exemple Apiculteur avec « Des abeilles », Barista et Barman avec « Préparer des boissons », Serveur en restauration avec « Servir »). Sur le chemin 1, un seul choix met 927 métiers en tête. Mais ce n'est pas un bon signe : voir le paragraphe 3.
- **Chemin 3** : les plus petites familles de lettres comptent 4 métiers (SA, IA), puis 5 (E, AS).

## 3. Le métier « idéal » après trois choix ?

Mesure sur les triples cohérents (trois choix pris dans la fiche d'un métier) :

| | Chemin 2 | Chemin 1 |
|---|---|---|
| Le métier source est dans la liste | 100 % | 100 % |
| Il est **premier** | **9,7 %** | **75 %** |
| Il est dans les 10 premiers | 39 % | 98 % |
| Taille de liste (médiane) | 207 métiers | **15 métiers** |
| Listes de moins de 3 métiers | 0 | 175 sur 1 920 (9 %) |
| Pourcentage en tête | 55 % (plafond de trois choix) | 55 % |

- **Chemin 2 : pas de métier idéal trop tôt.** Avec trois choix, la liste compte des centaines de métiers et le métier source est premier dans 1 cas sur 10. Avec une seule paire de choix, 354 métiers sont retenus en médiane. Aucune paire ne donne moins de 4 métiers. Le plafond de pourcentage fait son travail.
- **Chemin 1 : la liste se resserre très vite.** Trois compétences tirées d'un métier le mettent premier trois fois sur quatre, avec une liste médiane de 15 métiers. Cela vient de la pondération par rareté (consigne 497) et du seuil de 40 %. Ce n'est pas absurde (les compétences sont précises), mais c'est le chemin où la personne peut croire avoir trouvé « le » métier après trois clics. Au hasard : 8,7 % des triples donnent une liste vide, 27,7 % moins de 5 métiers.
- **Défaut d'affichage, tous chemins** : la première carte est toujours étiquetée « Première proposition » avec le texte « Pourquoi ce métier vous est proposé », même avec un seul choix et même quand des dizaines de métiers sont à égalité. Mesure : à égalité en tête, la médiane est de 139 métiers avec un seul choix, 14 avec deux, 13 avec trois choix cohérents. La « première » est alors désignée par des règles invisibles (précision de la fiche, puis ordre alphabétique) : elle ne vaut pas mieux que la deuxième.

## 4. Les listes de métiers quasi jumeaux (premier jamais atteint en 8 choix)

Chemin 1 : Agent de sûreté ferroviaire, Chef barman, Commercial itinérant en commerce de gros, Conducteur livreur installateur, Conseiller de vente en pièces de rechange, Danseur, Directeur de pays d'accueil touristique, Directeur de travaux du bâtiment, Documentariste, Mandataire en assurance, Opérateur en horlogerie, Ouvrier de chai, Pâtissier, Poseur en fermetures de bâtiment, Préparateur de bateau, Reporter, Responsable d'exploitation transport maritime, Scripte de fiction, Spécialiste du soutien armement nucléaire, Technicien de forage pétrole et gaz.

Chemin 2 : Ingénieur informaticien, Conducteur de machines à papier ou carton, Pneumologue, Cardiologue, Urologue, Responsable gestion des sinistres, Conducteur de véhicules Super Lourds, Conseiller en études actuarielles, Responsable d'îlot de production, Chargé d'affaires bancaires, Responsable de la conformité industrielle, Fileur en industrie textile, Responsable comptabilité. Ils ont chacun une fiche voisine qui retrouve exactement les mêmes choix : seule une précision absente du catalogue les départagerait (médecins spécialistes entre eux, métiers de banque entre eux).

## 5. Résultats surprenants à faire juger par Denis

Sur 1 925 triples cohérents du chemin 2, **514 n'ont aucun métier du secteur d'origine parmi les 5 premiers** (27 %). L'essai à la main de 22 d'entre eux montre surtout des choix très généraux (« nettoyer », « bureau », « gérer ») qui ramènent d'autres secteurs de façon plausible : cela vient d'étiquettes larges, pas d'absurdités. À lire quand même, par exemple :

- « Mécanicien structure avion » avec « manipuler des produits, gérer des stocks, machines » : Mérandier, Laqueur industriel, Foreur ;
- « Opérateur en bijouterie » avec « produits dangereux, monter, manipuler des produits » : Maçon, Plâtrier, Plaquiste ;
- « Infirmier de prévention » avec « accompagner, expliquer, usagers » : cinq guides et animateurs sportifs.

Étiquettes de secteur qui semblent fausses dans la base (à confirmer) : Sismologue (classé Bâtiment et travaux publics), Psychanalyste (Social), Facteur (Administration), Plagiste, Socio-coiffeur, Socio-esthéticien, Agent de soins en hydrothérapie (tous Commerce et vente), Inspecteur vétérinaire (Administration). Ces secteurs servent au chemin 1 (filtre de secteur) et à la mesure de cohérence.

Chemin 3 : jamais d'absurdité possible sur un métier précis (il liste les métiers qui partagent des lettres) ; en revanche 36 codes seulement pour 1 925 métiers, donc des listes de 200 à 500 métiers par code (RC : 276 métiers, R : 242).

## 6. Ce qui va bien

- Aucun choix n'est « mort » : tous les 113 choix du chemin 2 ramènent des métiers.
- Les choix précis donnent des résultats cohérents (animaux, cuisine, soigner, bâtiment) : cohérence des profils types de 0,6 à 1 (banc d'essai de référence rejoué, inchangé).
- Le choix « à éviter » (consigne 502) a été testé séparément : il ne retire jamais un métier et sa baisse est écrite sur chaque carte.

## 7. Propositions, à trancher par Denis (rien n'est codé)

1. **« Première proposition » trompeuse (recommandé : l'enlever tant que la liste est fragile).** Tant qu'il y a moins de 5 choix, ou plus de 3 métiers à égalité en tête, parler de « Pistes à explorer » sans mettre un métier en vedette, et remplacer « Pourquoi ce métier vous est proposé » par « Pourquoi ces métiers ». *Apport* : supprime l'impression de « métier idéal » dès les premiers choix, sur les trois chemins. *Risque* : l'écran perd sa grande carte tant que la liste n'est pas précise (la mise en page est à revoir par maquette).
2. **Chemin 1 : garder une liste assez longue.** Quand moins de 10 métiers passent le seuil de 40 %, compléter par les métiers les plus proches, marqués « un peu moins proches ». *Apport* : plus de liste vide ni de métier unique après 3 clics. *Risque* : revient à ajouter des métiers qui retrouvent peu de choix, donc des pistes moins nettes.
3. **Étiquettes de secteur et métiers jumeaux.** Corriger la liste de secteurs du paragraphe 5, et décider des cinq métiers qui partagent un code ROME (un métier par code sur le chemin 1 aujourd'hui). *Apport* : tous les métiers de la base atteignables par le chemin 1. *Risque* : faible, mais c'est un travail sur 8 à 20 fiches à valider une par une.
4. **Jury humain.** Faire lire à Denis (ou à un conseiller) les 22 cas du paragraphe 5 : c'est lui qui dit si un résultat est absurde pour le public.

## 8. Suite du 21/11/2026 : fiabilité réelle selon le nombre de choix, et idée de Denis (échelle de « pistes »)

**L'idée de Denis** : plutôt que de supprimer la « Première proposition », donner à la liste un NOM qui change avec le nombre de choix, de la piste la plus éloignée à la plus précise, avec une couleur, une légende qui explique pourquoi elle s'appelle ainsi et combien de choix manquent pour passer au niveau suivant. Les propositions 1 (retirer l'étiquette) et 2 du paragraphe 7 sont absorbées par cette échelle ; les propositions 3 (secteurs, métiers jumeaux) et 4 (jury) restent à part, car l'échelle ne les couvre pas.

**Mesure** : pour k choix pris au hasard dans la fiche d'un métier (comme une personne qui pense à ce métier). Chemin 2 : 107 métiers par ligne ; chemin 1 : 1 920 métiers par ligne. Scripts : `courbe_fiabilite_chemin1.js`, `courbe_fiabilite_chemin2.js`, `courbe_fiabilite_resume.js`.

| Choix | Chemin 2 : métier dans les 10 premiers | premier | égalités en tête (médiane) | plafond actuel | Chemin 1 : dans les 10 premiers | premier | liste (médiane) |
|---|---|---|---|---|---|---|---|
| 1 | 4 % | 2 % | 322 | 25 % | 42 % | 11 % | 55 |
| 2 | 20 % | 3 % | 54 | 40 % | 84 % | 45 % | 23 |
| 3 | 43 % | 11 % | 12 | 55 % | 98 % | 75 % | 16 |
| 4 | 53 % | 19 % | 3 | 65 % | 100 % | 90 % | 11 |
| 5 | 64 % | 28 % | 1 | 75 % | 100 % | 96 % | 8 |
| 6 | 70 % | 37 % | 1 | 82 % | 100 % | 98 % | 6 |
| 7 | 79 % | 49 % | 1 | 88 % | 100 % | 99 % | 5 |
| 8 | 86 % | 51 % | 1 | 94 % | 100 % | 99 % | 4 |
| 9 | 90 % | 58 % | 1 | 100 % | 100 % | 99 % | 4 |

**Ce que cela dit du pourcentage.** Le pourcentage ne peut pas sauter à 99 % après trois choix : il a un plafond selon le nombre de choix (25, 40, 55, 65, 75, 82, 88, 94, 100). Sur le chemin 2, ce plafond suit la réalité avec environ dix points d'avance (3 choix : plafond 55 %, réalité 43 %). Sur le chemin 1, il est au contraire prudent (3 choix : plafond 55 %, réalité 98 % dans les 10 premiers) : la liste y est très étroite.

**Échelle proposée (à valider).** Un seul niveau pour toute la liste, déterminé par le NOMBRE DE CHOIX (la fiabilité de la liste) ; le pourcentage de chaque carte reste la ressemblance du métier. Une seule teinte qui s'intensifie du plus clair au plus soutenu (jamais de rouge, jamais la couleur seule : le nom, une jauge à cinq barres et la légende le disent aussi) ; variables claires et sombres.

| Niveau | Nom | Chemin 2 (choix) | Chemin 1 (choix) | Pourquoi ce nom (légende) |
|---|---|---|---|---|
| 1 | Piste éloignée | 1 à 2 | 1 | Des centaines de métiers sont encore possibles : ce sont des idées de départ. |
| 2 | Piste à explorer | 3 à 4 | 2 | La liste commence à se resserrer, plusieurs métiers se valent encore. |
| 3 | Piste qui se précise | 5 à 6 | 3 | Un métier ressort plus nettement, d'autres restent proches. |
| 4 | Piste proche | 7 à 8 | 4 à 5 | Peu de métiers retrouvent tout ce que vous avez choisi. |
| 5 | Piste précise | 9 et plus | 6 et plus | La liste est étroite : parlez-en avec un conseiller pour la confirmer. |

La grande carte « Première proposition » n'apparaît qu'à partir du niveau 3. En dessous, une grille de « pistes » sans vedette. La légende dit toujours combien de choix manquent pour passer au niveau suivant. Le chemin 3 garde son vocabulaire (familles de lettres) : l'échelle s'y appliquerait au nombre de parties du questionnaire remplies, à décider.

**Décisions de Denis attendues** : (1) à partir de combien de choix une « proposition » (vedette) paraît, par chemin ; (2) les cinq noms, les seuils et la teinte ; (3) maquette sur le moteur réel avant tout code ; (4) plafond de 100 % à 9 choix : le garder ou le limiter à 95 % pour ne jamais dire « certain ».

**Feuille du jury** : les 22 cas surprenants du chemin 2 sont les profils P31 à P52 de `docs/bancEssai/feuille_jury.html` (générée par `node scripts/genererFeuilleJury.js`, liste fixée dans `scripts/auditAtteignabilite/cas_jury_503.json`).

## 9. Suite du 21/11/2026 : étiquettes de secteur corrigées, bornes contrôlées (consigne 506)

**Secteurs.** Six fiches corrigées par la table `SECTEUR_CORRIGE_PAR_CODE` : Facteur (M1603) en Transport et logistique, Plagiste (D1235) en Hôtellerie, restauration et tourisme, Socio-coiffeur (D1217) et Socio-esthéticien (D1237) en Coiffure et esthétique, Agent de soins en hydrothérapie (D1203) en Santé et soins, Inspecteur vétérinaire (K1411) en Métiers animaliers. Deux étiquettes soupçonnées au paragraphe 5 sont gardées : Psychanalyste (rangé avec Psychologue, Conseiller conjugal, Sophrologue : cohérent) et Sismologue (domaine ROME des études du bâtiment, aucun secteur de l'application ne convient mieux).

**Bornes de l'échelle.** Lecture du tableau du paragraphe 8 au premier choix de chaque niveau (chemin 2, métier visé dans les 10 premiers) : niveau 1 (3 choix) 43 %, niveau 2 (5 choix) 64 %, niveau 3 (7 choix) 79 %, niveau 4 (9 choix) 90 %. La fiabilité monte à chaque niveau (écarts de 21, 15 et 11 points) et le plafond affiché (30, 50, 70, 90) reste en dessous de la réalité à chaque borne : l'échelle ne promet jamais plus que ce que la liste tient. Sur le chemin 1, la réalité est bien meilleure (98 % dès 3 choix), l'échelle commune est donc prudente pour lui, ce qui est voulu (consigne 505). Limite à connaître : au niveau « Piste précise » (9 choix), le métier visé est premier dans 58 % des cas seulement sur le chemin 2 : « précise » veut dire une liste ciblée, pas « le premier est le bon ».

## 10. Chemin 3 : fiabilité du questionnaire selon le nombre de lignes répondues (consigne 508)

**Mesure** : 360 personnes simulées (30 codes, 12 personnes par code) répondent à toutes les lignes selon leur code (première lettre très présente, deuxième et troisième moins, les autres peu), puis on ne garde que m réponses au hasard ; les autres lignes restent vides et comptent zéro, comme dans l'application. Script : `scripts/auditAtteignabilite/courbe_fiabilite_chemin3.js`. Une personne simulée n'est pas une vraie personne : c'est un ordre de grandeur.

| Lignes répondues (sur 300) | Résultat avec un code | Première lettre juste | Trois lettres justes (ensemble) | Même code qu'avec 300 lignes |
|---|---|---|---|---|
| 60 (20 %) | 3 % | 2 % | 1 % | 1 % |
| 90 (30 %) | 35 % | 27 % | 27 % | 16 % |
| 120 (40 %) | 91 % | 68 % | 85 % | 48 % |
| 150 (50 %) | 100 % | 75 % | 97 % | 61 % |
| 200 (67 %) | 100 % | 84 % | 99 % | 74 % |
| 250 (83 %) | 100 % | 94 % | 100 % | 89 % |
| 300 (100 %) | 100 % | 96 % | 100 % | 100 % |

**Décision de Denis (21/11/2026)** : aucune lettre sous 40 % des lignes répondues ; niveaux « Piste éloignée » dès 40 % (120 lignes), « Piste à explorer » dès 50 % (150), « Piste proche » dès 67 % (200), « Piste précise » dès 83 % (250). La première lettre juste passe de 68 % à 94 % sur ces seuils : l'échelle ne promet pas plus que la mesure. Limite : la partie 4 passée donne un total plus petit (les seuils s'appliquent à la part, pas au nombre).
