> # ⚠️ BRIEF CADUC - NE PAS EXÉCUTER (décision Denis, 2026-09-09)
>
> Ce brief lançait le grand sujet Lexique « Les compétences » + un référentiel de 80-120 fiches,
> pour nourrir le module « Mes preuves ».
>
> **Les deux sont abandonnés le 2026-09-09** :
> - « Mes preuves » : test de prompt non concluant sur deux assistants, pas de territoire propre
>   (fichiers de conception archivés puis supprimés le 2026-09-09, récupérables dans l'historique git) ;
> - le grand sujet Lexique : n'avait de raison d'être que pour « Mes preuves », et 80-120 fiches
>   compétences transformeraient le Lexique en répertoire lourd et peu consulté.
>
> Voir `docs/TACHES_VALIDEES.md`, entrées `[ABANDONNÉ - 2026-09-09]`.
>
> Fichier gardé uniquement comme trace. Aucune suite à donner.

---

# Brief - enrichir le Lexique d'APP avec le grand sujet « Les compétences »

> Message destiné à un autre compte Claude travaillant sur **ce dépôt** (APP / Site_V2).
> À coller tel quel. Le destinataire a le même `CLAUDE.md` et les mêmes fichiers de référence,
> mais **pas** la mémoire de la conversation où ce brief a été produit.

---

## 1. Contexte

APP est une application web statique d'accompagnement de parcours professionnel, pour un public
en fragilité numérique et à confiance en soi fragile. Le **Lexique** est la bibliothèque de
référence de l'app (déjà ~150 fiches, plusieurs grands sujets : conditions de travail, droits
sociaux, comprendre un contrat...). Il grandit **par lots de fiches**, jamais en réécrivant
l'architecture.

Une tâche `[À FAIRE]` existe déjà dans `docs/TACHES_VALIDEES.md` :
**« Lexique : grand sujet Les compétences + référentiel de compétences »**. Ce brief la lance et
la précise.

**Pourquoi maintenant** : un module en cours de conception (« Mes preuves ») a besoin, pour un
de ses écrans, d'une **liste de compétences professionnelles à cocher**, et d'une **explication
courte par compétence** qui servira à cadrer un passage par un assistant en ligne. Cette liste
et ces explications doivent vivre **dans le Lexique**, pas dans un bloc isolé - une seule source,
réutilisée par le Lexique lui-même, par « Votre profil » (descriptif au clic) et par « Mes
preuves ». Tu n'as **pas** à toucher à « Mes preuves » ni à « Votre profil » : ton périmètre est
le contenu du Lexique.

---

## 2. À lire avant de commencer (procédure du dépôt)

1. `CLAUDE.md` (racine) - fichier maître, ordre de lecture, non-négociables.
2. `docs/LECONS_A_NE_PAS_REPRODUIRE.md` (section 10 surtout).
3. `docs/DOCTRINE_LEXIQUE.md` et `docs/CHANTIER_LEXIQUE.md` - doctrine et architecture du module.
4. `data/lexique.js` + `modules/lexique/index.js` - la structure réelle d'un univers, d'une
   collection/parcours, d'une fiche (front-matter : `titre`, `variantesRecherche`, `verifie_le`
   avant `lexique:`, `revisions:`, « second niveau » pour « En savoir plus »).
5. `scripts/checkLexique.js` - ce que le contrôle exige.
6. `git log` sur le Lexique : les commits récents « Lexique : lot N, ... (+ famille) » montrent
   le patron exact à suivre (un univers/famille + des fiches par lot).
7. `docs/IDEES_A_RECLASSER.md` - entrées du **2026-08-27** (« Enrichissement du contenu du
   Lexique : Les compétences ») et du **2026-09-02** (« alimenter le Lexique avec un référentiel
   de compétences ») : matière déjà pensée, à reprendre.
8. `docs/TRAVAILLER_AVEC_DENIS.md`.

**Coordination** : un autre compte Claude conçoit « Mes preuves » en parallèle et attend ce
contenu. Ne modifie que le Lexique (données + module + recherche + docs Lexique). Ne touche pas
à `js/app.js` au-delà du branchement de recherche déjà prévu pour toute nouvelle fiche.

---

## 3. Le livrable

Dans le Lexique, un nouveau **grand sujet « Les compétences »** en deux parties :

### Partie A - Les notions (5 à 7 fiches « concept »)

Des fiches courtes et neutres, dans le registre du reste du Lexique (de la connaissance, jamais
un diagnostic) :

- **Qu'est-ce qu'une compétence** : ce que le mot recouvre, comment une compétence se compose.
- **Savoir-faire / savoir-être / savoirs** : les trois dimensions classiques, avec des exemples
  concrets et simples.
- **« Savoir y faire »** : la 4e dimension - la capacité à mobiliser ses savoirs et savoir-faire
  en situation réelle (différent du savoir-faire).
- **Compétence transversale** : utile dans presque tous les métiers (organiser, communiquer...).
- **Compétence transférable** : acquise dans un métier, réutilisable dans un autre.
- **Le sens large de « competency »** (anglais) : englobe aussi la motivation et le projet
  d'avenir - une définition plus large que l'usage français courant. (Fiche optionnelle.)
- Éventuellement **« Comment repérer ses compétences à partir de ce qu'on a fait »** : la
  méthode (partir de l'action, pas de l'étiquette). Neutre, pas prescriptif.

### Partie B - Le référentiel de compétences (~80 à 120 fiches courtes)

Une fiche par **compétence professionnelle** (surtout des **savoir-faire** - ce sont ceux que
les gens n'arrivent pas à nommer seuls ; les savoir-être peuvent rester peu nombreux, les gens
les repèrent mieux). Regroupées en **~10 familles**, **chaque famille creusée avec le même
soin** (proscrire 3-4 libellés dans une famille et 15 dans une autre - ça laisse croire que
certaines comptent plus).

**Source de la liste** : consolider, à plat et dédoublonné :
- les ~60 libellés de `categorieCompetence` dans `data/metiers.js` ;
- les listes `savoirFaire` réparties dans les ~125 fiches métier de `data/metiers.js`.
Complète avec les compétences fréquentes qui manquent, retire les doublons et le trop spécifique.
Cible : **80 à 120 libellés**. (Repère d'échelle : les référentiels ROME / ESCO ont ~13 000
entrées au grain fin ; les listes utilisables dans un outil grand public font 60 à 150 entrées
regroupées. On vise l'usage, pas l'exhaustivité.)

**Familles proposées** (à ajuster) : Organiser et gérer · Contact, clientèle, public · Vente et
conseil · Soin et aide à la personne · Travail manuel et technique · Conduite et engins ·
Cuisine, service, hygiène des locaux · Sécurité et contrôle qualité · Transmettre et encadrer ·
Écrit, chiffres, outils informatiques · Langues et communication.

**Structure d'une fiche compétence** :
- `titre` : le libellé, formulé simplement et à la 1re personne d'action quand c'est naturel
  (« Gérer un imprévu », « Accueillir et renseigner du public », « Suivre plusieurs tâches à la
  fois »).
- `variantesRecherche` : les autres façons de dire la même chose (pour la barre de recherche).
- **Définition courte, neutre, sans secteur** (1 à 3 phrases, langage simple) : *ce que la
  compétence recouvre concrètement*, ce qu'on fait quand on la met en oeuvre. Pas de jargon RH
  non expliqué.
- **« En savoir plus » (second niveau)** : un peu plus - à quoi ça ressemble en situation, un
  exemple ordinaire, savoir-faire ou savoir-être, compétences voisines (avec renvois internes au
  Lexique), transversale/transférable si pertinent.
- `verifie_le` : la date du jour, au bon endroit dans le front-matter.

---

## 4. Le garde-fou central (à ne jamais franchir)

La fiche dit ce que la compétence **veut dire en général**. Elle ne dit **jamais** :
- « comment défendre cette compétence dans tel métier / tel secteur » ;
- « ce que cette compétence signifie dans l'aide à domicile / le bâtiment / etc. ».

Ce contenu-là (compétence × secteur) est **volontairement exclu** : il ferait exploser le
volume (des milliers de combinaisons), dépasserait vite le Lexique et se périmerait. Le sens
taillé au métier est produit **à la volée par un assistant en ligne** dans un autre module, pas
écrit ici.

Donc : **une définition neutre, valable quel que soit le métier.**

---

## 5. Non-négociables du projet (rappel)

- **Français impeccable** : accents partout, orthographe correcte, partout (fiches, variantes,
  « En savoir plus »).
- **Jamais de tiret cadratin ni de demi-cadratin**. Tiret court uniquement.
- **Jamais le mot « IA » visible**, jamais d'icône tête de robot / visage / yeux.
- **Jamais de diagnostic sur la personne.** Registre connaissance : « on parle de… »,
  « cette compétence recouvre… », jamais « vous êtes… », jamais un jugement de niveau.
- **Ton simple et rassurant**, phrases courtes, public peu à l'aise avec l'écrit.
- **Mode sombre** : toute couleur nouvelle a sa valeur `[data-theme="sombre"]` (rare ici, mais
  si tu ajoutes du style).
- **Brancher la recherche** : chaque nouvelle fiche doit être trouvable depuis la barre de
  l'accueil (`rechercherBaseConnaissances` / `data/baseConnaissancesERIP.js`) **et** depuis la
  recherche du Lexique (`_lexiqueRechercher` / `modules/lexique/index.js`). Vérifie le patron
  déjà en place pour les fiches Lexique (souvent automatique via `titre` + `variantesRecherche`
  - confirme dans le code).

---

## 6. Méthode

- **Par lots**, comme les commits Lexique récents : d'abord la famille (l'univers/collection),
  puis les fiches par paquets de 10-20, un commit par lot.
- **Commencer par les compétences les plus fréquentes** (celles qui reviennent le plus dans
  `data/metiers.js`), puis compléter famille par famille, **également**.
- Après chaque lot : `node scripts/checkLexique.js` (**0 erreur ET 0 avertissement**) **et**
  `npm test` (doit rester vert). Vérification navigateur du rendu d'une fiche (clair + sombre).
- Mettre à jour `docs/CHANTIER_LEXIQUE.md` (ou le doc de suivi du Lexique) et cocher l'avancée
  dans `docs/TACHES_VALIDEES.md`.
- Commits en français, sans tiret cadratin, sur `master`, un par lot vérifié.

---

## 7. Deux usages en aval (pour information - rien à coder ici)

1. Le module « Mes preuves » affichera la **liste des libellés** (groupés par famille) comme une
   liste à cocher : quelqu'un qui ne sait pas nommer une compétence la **reconnaît** et la coche.
2. Quand la personne coche une compétence, l'app transmettra à un assistant en ligne
   `{ le libellé + la définition courte de la fiche }` + le secteur + le récit de la personne,
   pour un retour plus pertinent et moins variable.

Conséquence pour toi : la **définition courte** de chaque fiche doit être **autoportante et
réutilisable telle quelle** (une phrase claire, sans renvoi, compréhensible hors contexte). Le
« En savoir plus » peut, lui, contenir des renvois et du détail.

---

## 8. Résultat attendu

- Un grand sujet « Les compétences » dans le Lexique : Partie A (5-7 fiches notions) + Partie B
  (80-120 fiches compétences en ~10 familles équilibrées).
- `checkLexique` propre, `npm test` vert, recherche branchée, rendu vérifié clair + sombre.
- Docs de suivi du Lexique à jour.
- Aucun contenu « compétence × secteur ». Aucune fiche qui pose un diagnostic ou juge un niveau.
