# Repertoire : donnees a ajouter a la veille pour « Comprendre les chiffres »

**Statut au 2026-09-09 :**
- **Lot 1 CODE** (carte chomage : colonne « Ou se situer » + courbe pluriannuelle). Les donnees
  reelles necessaires ont ete mises dans `modules/comprendre-les-chiffres/contenu/2026-06.md`
  a la main (INSEE T1 2026 pour les extremes ; INSEE series longues + Eurostat pour la courbe).
  Le prompt `[CHIFFRES]` de `outils/veille.html` n'est **pas encore** mis a jour : au prochain
  passage de veille, ces lignes seront a re-remplir a la main tant que le prompt ne les demande
  pas. C'est ce que decrivent les sections 2.1 et 2.2 ci-dessous.
- **Lot 2 a faire** (synthese, reperes, colonnes droites des 4 autres cartes) : sections 2.3, 2.4.
- L'integration dans `outils/veille.html` + `docs/VEILLE_PROMPTS.md` reste le **2e temps**,
  a faire avec Denis.

**Contexte.** La maquette `docs/MAQUETTE_COMPRENDRE_LES_CHIFFRES_COMPACT_2026-09-09.html` (v9)
enrichit le module. Certaines donnees affichees n'existent pas encore dans le digest
`modules/comprendre-les-chiffres/contenu/<trimestre>.md` ni dans le prompt `[CHIFFRES]`
(`docs/VEILLE_PROMPTS.md` § 5ter.1). Les voici.

---

## 1. Deja produit par la veille : RIEN A FAIRE

Le prompt `[CHIFFRES]` couvre deja, chaque trimestre, aux 3 niveaux (departement / region /
France ; l'Union europeenne a son prompt `[CHIFFRES-UE]`, § 5ter.3) :

- les 5 valeurs de tete + valeur du trimestre precedent + valeur d'il y a un an ;
- le sens d'evolution (deduit) ;
- la `serie` des 6 a 8 derniers **trimestres** pour le chomage et pour les inscrits cat. A ;
- le total A + B + C ;
- la part de longue duree (1 an et plus) et la part 2 ans et plus ;
- l'emploi salarie region / France (variation trimestre) ;
- le nombre d'offres collectees + repere « 4 embauches sur 10 durent plus d'un mois » ;
- les valeurs de comparaison Nouvelle-Aquitaine / France affichees a cote du chiffre ;
- le bloc `[LECTURE]` (2 a 3 paragraphes « Lecture du territoire »).

---

## 2. NOUVEAU : a ajouter au prompt `[CHIFFRES]` (§ 5ter.1)

### 2.1 Les extremes territoriaux du taux de chomage  *(confirme par Denis, 2026-09-09)*

Affiche dans la colonne droite de la carte chomage (« Ou se situe la Dordogne » : les deux
barres). Aujourd'hui : **valeurs d'exemple** (Cantal, Pyrenees-Orientales, Bretagne,
Hauts-de-France).

A recuperer **chaque trimestre**, une seule fois (portee nationale, identique pour tous) :

| Donnee | Exemple actuel (a remplacer) |
|---|---|
| Departement au taux le plus **bas** : nom + taux | Cantal, 5,0 % |
| Departement au taux le plus **haut** : nom + taux | Pyrenees-Orientales, 12,4 % |
| Region au taux le plus **bas** : nom + taux | Bretagne, 5,8 % |
| Region au taux le plus **haut** : nom + taux | Hauts-de-France, 9,6 % |

Source : **INSEE, taux de chomage localises** (le tableau complet contient tous les
departements et toutes les regions ; c'est la meme sortie que celle deja utilisee pour le
taux du departement). Trimestriel, un trimestre de retard.

### 2.2 La serie chomage **pluriannuelle** (courbe « L'evolution sur plusieurs annees »)

Le 2e graphe de la carte chomage est une courbe sur ~6 ans (2021 a 2026), avec 4 territoires
qu'on active un par un : departement, region, France, Union europeenne. Aujourd'hui : valeurs
d'exemple.

Le prompt produit deja une `serie` **trimestrielle courte** (6-8 trimestres). Il faut en plus
une **serie longue** :

| Territoire | Ce qu'il faut | Source |
|---|---|---|
| Departement | taux de chomage, ~6 ans | INSEE, series longues (SITES_BLOQUES : rendu JS, releve a la main) |
| Region | taux de chomage, ~6 ans | INSEE, series longues |
| France | taux de chomage, ~6 ans | INSEE, series longues |
| Union europeenne | taux de chomage harmonise, ~6 ans | Eurostat (prompt `[CHIFFRES-UE]`, a etendre) |

**Decision a prendre** : courbe **annuelle** (6 points, plus simple a lire et a maintenir) ou
**trimestrielle** (~24 points, plus fine, meme requete). Voir § 5.

Dans le fichier : une ligne `serie_longue:` (ou `serie_annuelle:`) par territoire, en plus de
la `serie` trimestrielle existante.

### 2.3 La phrase de synthese courte « En quelques mots »  *(demande Denis, 2026-09-09)*

En haut du module, avant les 5 chiffres. **Elle doit coller aux chiffres du trimestre** : elle
change a chaque mise a jour, elle n'est jamais figee.

Le prompt produit deja `[LECTURE]` (2-3 paragraphes) pour la section « Lecture du territoire »
en bas de page. Il faut en plus une version **courte** :

- **1 paragraphe, 3 phrases maximum**, langage tres simple (public peu a l'aise avec l'ecrit) ;
- decrit, ne predit rien, ne juge aucun projet ;
- se termine (ou est suivie) du garde-fou fixe : « Ces chiffres decrivent un territoire. Ils
  ne disent rien sur votre projet a vous. »

A ajouter au prompt `[CHIFFRES]` : un bloc `[SYNTHESE-COURTE]` (en plus de `[LECTURE]`), avec
la meme regle de prudence et le meme `[brouillon a verifier et valider]`.

### 2.4 Les « reperes » (une phrase-verdict sous chaque chiffre)

Sous chaque chiffre, une phrase qui donne le sens en un coup d'oeil (« c'est eleve », « en
baisse ici mais pas en region », « dans la moyenne francaise »). Elle change avec les chiffres.

Aujourd'hui il y a 5 reperes, un par carte. Ils s'appuient sur des donnees deja produites
(comparaison au national, sens de l'evolution, comparaison au departement voisin).

**Decision a prendre** (voir § 5) :
- **(a) genere par le code** a partir des chiffres : « au-dessus / dans la moyenne / en
  dessous » + « monte / stable / baisse ». Simple, zero veille, mais ne capte pas les nuances
  (« a cause d'un changement de regles d'inscription »).
- **(b) produit par le prompt** : une ligne `repere:` par indicateur (une phrase factuelle,
  sans avis). Capte les nuances, mais +5 phrases a relire chaque trimestre.
- **(c) hybride** : le code propose un brouillon, Denis l'ajuste a la veille.

---

## 3. Deja DEMANDE dans le prompt, mais pas encore recupere : a debloquer

Pas nouveau a cause de la maquette, mais la maquette l'affiche, donc il faut le sourcer.

### 3.1 Part d'offres durables (CDI ou CDD de plus de 6 mois), departement

Deja dans le prompt `[CHIFFRES]` (point 5). Marque `[a verifier]` dans le digest actuel.
Source : France Travail, Data Emploi, panorama departemental, rubrique « Offres d'emploi » >
« type de contrat » (a relever au navigateur : SITES_BLOQUES).

### 3.2 Variation trimestrielle de l'emploi salarie **departemental**

Deja demande dans le prompt (point 4, pour [DEPT]). Marque `[a verifier]` dans le digest (la
serie departementale INSEE est en SITES_BLOQUES). Le digest se rabat aujourd'hui sur une
valeur ancienne (2022 pour la Dordogne, 2023 pour la Haute-Vienne).

---

## 4. Contenu STATIQUE : hors veille trimestrielle

Ecrit une fois, ne bouge pas (ou tres rarement). A poser en dur dans le module.

- L'explication des categories A a E (colonne droite de la carte « demandeurs »).
- La definition de l'emploi salarie (colonne droite de la carte « emploi salarie »).
- Le texte « une offre deposee n'est pas une embauche ».
- Le texte « plus l'inscription dure, plus le retour a l'emploi demande du temps... ».
- La cible « plein emploi : un chomage autour de 5 % » (quasi-statique ; a re-verifier une
  fois par an, cible politique et non gravee dans la loi).
- Le garde-fou « ces chiffres decrivent un territoire, ils ne disent rien sur votre projet ».

---

## 5. Decisions (tranchees par Denis, 2026-09-09)

1. **Courbe pluriannuelle : ANNUELLE.** 6 points (2021 a 2026), un par an. Lecture et
   maintenance simples. Le prompt produit une `serie_annuelle:` par territoire.
2. **Reperes : HYBRIDE.** Le code propose un brouillon a partir des chiffres (au-dessus /
   dans la moyenne / en dessous ; monte / stable / baisse) ; Denis l'ajuste a la veille quand
   une nuance manque. Le prompt fournit une ligne `repere:` optionnelle par indicateur, qui
   ecrase le brouillon du code si elle est remplie.
3. **Synthese courte : PAR TERRITOIRE.** Le bloc `[SYNTHESE-COURTE]` produit une phrase par
   territoire lu (departement, region, France ; l'UE a la sienne via `[CHIFFRES-UE]`), pas une
   phrase combinee. Le `[LECTURE]` long peut rester combine.

### 4. Ce qu'on montre aux niveaux region / France / UE (reco Claude)

**La courbe** : identique partout. Toujours les 4 lignes (departement / region / France /
Union europeenne) qu'on active une par une. Seule la ligne du niveau lu est affichee **par
defaut** (au niveau region : la ligne region ; au niveau France : la ligne France ; etc.).
La ligne pointillee « plein emploi » partout.

**« Ou se situe » (les barres d'extremes)** :

| Niveau lu | Ce qu'on montre |
|---|---|
| **Departement** | barre des departements (le sien marque) + barre des regions (sa region marquee). *(= la maquette)* |
| **Region** | barre des regions (la sienne marquee). En option, une ligne de texte : « dans la region, les departements vont d'environ X % a environ Y % » (meme tableau INSEE, filtre sur la region). |
| **France** | pas de barre : une ligne compacte « France : 7,9 % - moyenne UE27 : X % - le plus bas : &lt;pays&gt; - le plus haut : &lt;pays&gt; ». Donnees Eurostat (deja demandees dans `[CHIFFRES-UE]`). |
| **Union europeenne** | idem France : l'ecran UE fait deja la comparaison France / UE27 sur 11 indicateurs, on ne double pas. |

Consequence veille : les extremes departements + regions (§ 2.1) suffisent pour le niveau
departement, qui est le cas d'usage principal. Le niveau region ajoute, en option, le min/max
des departements DE la region (facile : sous-ensemble du meme tableau). Les niveaux France / UE
n'ajoutent rien : ils reutilisent Eurostat, deja au programme.
