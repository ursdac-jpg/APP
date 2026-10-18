# Mon territoire : liste de contrôle avant l'ouverture au public

> Préparée le 2026-10-12, à l'issue de la migration des 17 rayons de « Comprendre le cadre ». **Mise à jour le 2026-10-12 (soir)** : chiffres relevés de nouveau dans les fichiers, ouverture avec la Dordogne ET la Haute-Vienne (décision de Denis), sas de vérification en place.
> Le module est **fermé au public** (`MT_OUVERT = false` dans `modules/mon-territoire/logique.js`). Rien n'est ouvert tant que Denis n'a pas donné son feu vert écrit.
> Cette liste sépare ce qui est **déjà vérifié**, ce qui **dépend de Denis**, ce qui est **à faire au moment d'ouvrir**, et comment **revenir en arrière**.

---

## 1. L'état réel du contenu (chiffres relevés dans les fichiers, pas supposés)

| Élément | État |
|---|---|
| Structures publiées dans le répertoire (`lieux.txt`) | **127**, toutes avec adresse et date, 0 erreur de format |
| Portée | 73 en Dordogne, **17 en Haute-Vienne** (migrées le 2026-10-12, lot L2), 19 régionales, 18 nationales |
| Dates de vérification | du 2026-09-05 au 2026-10-12 : tous les liens restent cliquables jusqu'au 2027-09-05, puis disparaissent un à un (règle des 12 mois) |
| Numéros de téléphone | **aucun** (la colonne existe mais est vide pour les 110 structures) |
| Zones de couverture connues | 1 seule : le PLIE du Bergeracois. Partout ailleurs, la phrase « laquelle est la vôtre dépend de votre commune de résidence » s'affiche |
| Employeurs publiés (`employeurs.txt`) | **5 enseignes, toutes à Bergerac, dans un seul secteur** (commerce et vente). 3 sans date de vérification : Carrefour Market, Intermarché, Netto. Les 20 autres secteurs affichent « Pas encore de liste » |
| **Le sas (non public, vérification une à une)** | **380 structures** (Dordogne et Haute-Vienne) et **100 employeurs** (commerce et vente, hôtellerie et restauration, deux départements), dont beaucoup sans téléphone ni site : points à vérifier dans `docs/VERIFICATIONS_A_FAIRE_SAS_MON_TERRITOIRE_2026-10-12.md` ; prompt pour un autre assistant : `docs/PROMPT_VERIFICATION_AUTRE_ASSISTANT_SAS_MON_TERRITOIRE.md` |
| Rayons de « Comprendre le cadre » lus dans le répertoire | 17 sur 17 |
| Structures restées hors répertoire, sans adresse vérifiée | 2 : France Travail de la Dordogne (rayon handicap) et France Travail de la Dordogne (rayon création). Elles s'affichent « à vérifier selon votre territoire », comme avant |

---

## 2. Déjà vérifié (aucune action)

- `npm test` : 1534 verts. `node scripts/checkLexique.js` : 0 erreur.
- Série complète des 18 essais navigateur de Mon territoire : verte (158 contrôles), avec le module ouvert par l'aperçu.
- Un test vérifie que **les 17 rayons sont migrés** et que chacun a un domaine.
- Départements autres que la Dordogne et la Haute-Vienne : l'écran « territoire non couvert » s'affiche dans le module (table `MT_DEPARTEMENTS`, lot L5), et les rayons de « Comprendre le cadre » gardent leurs structures nationales, régionales et de la Haute-Vienne (aucune perte).
- Les sujets sensibles (violences, addiction) ne renvoient **jamais** vers une structure, ni par les freins, ni par la recherche (corrigé le 2026-10-12).
- Le mode sombre, le français, l'absence de tiret cadratin et de mot « IA » visible ont été contrôlés à chaque étape.
- Retour arrière : une seule ligne à remettre à `false` (voir point 6).

---

## 3. Ce qui dépend de Denis (décisions)

### 3.1 Le volet « employeurs » est presque vide : ouvrir quand même ? (PHRASE TRANCHÉE le 2026-10-13 : la tuile parle des structures puis des employeurs, option A ; reste à décider l'ouverture avec les 20 secteurs vides)
Un usager de Périgueux qui ouvre la tuile « Emploi » voit **20 secteurs sur 21 sans liste** et 5 enseignes de Bergerac dans le dernier. C'est honnête (« Pas encore de liste »), mais la phrase de la tuile d'accueil (« des employeurs, puis des structures ») promet davantage que ce qui existe.

| Option | Bénéfice | Risque |
|---|---|---|
| **A. Ouvrir tout, en reformulant la phrase de la tuile pour qu'elle parle d'abord des structures (Recommandé)** | La partie utile (110 structures) est accessible tout de suite ; la phrase ne promet que ce qui existe | Les 20 secteurs vides restent visibles, donc une impression d'inachevé dans l'onglet Emploi |
| B. Ouvrir en masquant la tuile « Emploi » tant qu'elle n'a pas au moins 3 secteurs | Aucune impression d'inachevé | Un changement de code en plus, à retirer plus tard ; Denis perd la visibilité du volet employeurs |
| C. Attendre que les employeurs soient remplis | Une ouverture plus complète | Aucune date : le volet employeurs dépend du travail de saisie par la veille |

### 3.2 Quel territoire annoncer ? (TRANCHÉ, Denis 2026-10-12)
Ouvrir avec la Dordogne ET la Haute-Vienne remplies, sans message « un seul département » ni tuile unique ; le module parle du département de la personne (lot L5 fait, table `MT_DEPARTEMENTS`). Reste : que la Haute-Vienne soit assez remplie au moment de l'ouverture (seuil proposé dans `PROPOSITION_CHANTIER_DEUX_DEPARTEMENTS_MON_TERRITOIRE_2026-10-12.md`, en attente du feu vert de Denis). Les fiches du sas deviennent publiques une à une après vérification (« C'est bon »).

### 3.3 Les trois enseignes sans date
Carrefour Market, Intermarché, Netto : les vérifier à la main (page de recrutement de chaque enseigne), puis saisir la date dans la section 5 « Mon territoire » de l'outil de veille. Sans date, aucun lien cliquable n'est affiché pour elles (comportement voulu).

### 3.4 Les deux adresses de France Travail
Retrouver à la main la page du conseiller France Travail pour la création d'activité (ACRE, ARE, ARCE) et celle des conseillers handicap, puis les ajouter au répertoire. Tant que ce n'est pas fait, elles restent signalées « pas encore vérifiée ». Non bloquant.

### 3.5 L'entretien du 15 octobre avec les partenaires
Demander : les zones de chaque Mission locale de la Dordogne (communes ou intercommunalités couvertes) et la liste complète des Missions locales. Ces informations s'entrent dans la colonne « Zone » via l'outil de veille. Non bloquant, mais c'est ce qui fera disparaître la phrase « dépend de votre commune » pour les Missions locales.

### 3.6 Numéros de téléphone
**TRANCHÉ le 2026-10-13 : la phrase est reformulée (« où aller et qui contacter »), le saisie de numéros reste souhaitable mais plus bloquante.** Aucun n'est saisi. L'introduction du module dit « à qui téléphoner » : soit on saisit au moins les numéros des structures les plus demandées (Mission locale, CAF, France Travail, CCAS), soit on reformule la phrase. **À trancher.**

### 3.7 Relecture finale
Relire les textes visibles du module une dernière fois, sur un écran réel (présentation, accueil, un domaine, une fiche, « Revoir la présentation », l'écran « territoire non couvert »). Les textes ont été validés par Denis le 2026-10-12, mais pas relus après la migration des 17 rayons (nouvelles sous-branches et nouveaux titres de domaines).

---

## 4. À faire au moment d'ouvrir (Claude, après le feu vert)

Dans cet ordre, un commit par étape, `npm test` avant chacun :

1. `MT_OUVERT = true` dans `modules/mon-territoire/logique.js`, et adapter le test qui l'exige fermé (`tests/monTerritoire.test.js`, ligne `assert.equal(L.MT_OUVERT, false)`).
2. **FAIT le 2026-10-13 (lot L6) : aide contextuelle** (`AIDE_PAGES['mon-territoire']` et `['mon-territoire-intro']`, 10 entrées, essai `monTerritoireAide`, 6 contrôles verts). Ancien libellé : ajouter `AIDE_PAGES['mon-territoire']` et `AIDE_PAGES['mon-territoire-intro']` dans `js/app.js` (modèle : `AIDE_PAGES['comprendre-le-cadre']`). Aujourd'hui **aucune entrée n'existe** : le module n'aurait pas d'aide contextuelle.
3. **Texte de la carte d'accueil « Se tenir informé »** : vérifier la phrase de la tuile (`data/metiers.js`, `btnCarteAccueilMonTerritoire`) et la phrase de la carte (`js/app.js`, liste des puces) après la décision 3.1.
4. Retirer le **bloc « Annuaire associatif »** de `outils/veille.html` (ligne 1141 environ, et l'entrée `associations` de la liste de vérification) : il est remplacé par le répertoire, et sa disparition évite deux endroits où tenir à jour la même information.
5. Rejouer la **série complète des essais** sans la clé d'aperçu (`erip_mon_territoire_apercu` retirée), pour vérifier le comportement réel d'un visiteur.
6. Vérifier à la main, module ouvert et aperçu retiré : la tuile sur l'accueil, la recherche d'accueil (« logement », « CAF », « violences » : ce dernier mot ne doit rien proposer), le bouton « Voir dans Mon territoire » depuis un rayon de « Comprendre le cadre », le Lexique (fiches Mission locale et PLIE en Dordogne), et le rendu sur téléphone (largeur 375).
7. Ajouter le module à la **documentation des modules** (`docs/ETAT_DES_CHANTIERS.md`) et clore le chantier.

---

## 5. Après l'ouverture : l'entretien courant

- **Horizon de péremption** : à partir du 2027-09-05, les liens des structures dont la date n'est pas renouvelée cessent d'être cliquables. Prévoir une passe de vérification annuelle avant cette date (outil de veille, section 5 « Mon territoire », qui contrôle les erreurs et se rejoue sans risque).
- **Nouveau territoire** : ajouter un département = ajouter ses structures dans `lieux.txt` et ses communes dans un fichier de communes, puis retirer la mention « territoire non couvert » pour lui. À cadrer avant de promettre un deuxième département.
- **Retours terrain** : les analyser avec la méthode en six catégories (jamais modifier sur un seul retour, sauf erreur avérée).

---

## 6. Retour arrière

Si un défaut grave apparaît après l'ouverture : remettre `MT_OUVERT = false` dans `modules/mon-territoire/logique.js` et redéployer. La tuile, le bouton « Voir dans Mon territoire », la recherche et les liens depuis le Lexique disparaissent ; **les rayons de « Comprendre le cadre » continuent de fonctionner** puisqu'ils lisent le répertoire quelle que soit l'ouverture du module. Aucune donnée de l'usager n'est à nettoyer : seule la commune éventuellement saisie est mémorisée, sur son appareil.

---

## 7. Récapitulatif : qui fait quoi

| # | Action | Qui | Bloquant ? |
|---|---|---|---|
| 3.1 | Choisir l'option A, B ou C pour le volet employeurs | Denis | Oui |
| 3.2 | Relire la présentation côté territoire annoncé | Denis | Oui |
| 3.6 | Trancher : saisir des téléphones ou reformuler la phrase | Denis | Oui |
| 3.7 | Relecture finale sur écran réel | Denis | Oui |
| 3.3 | Vérifier les 3 enseignes sans date | Denis | Non |
| 3.4 | Retrouver les 2 pages France Travail | Denis | Non |
| 3.5 | Entretien du 15 octobre (zones des Missions locales) | Denis | Non |
| 4 | Les 7 gestes techniques d'ouverture | Claude | Après le feu vert |
