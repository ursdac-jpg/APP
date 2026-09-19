# Audit noté des premières pages de modules

**2026-09-09.** Demande de Denis : regarder la **première page de chaque module** (l'écran
sur lequel on arrive à l'intérieur du module, **pas** la page de présentation), les noter,
voir si elles sont au même niveau, et comment les retravailler.

Écrans regardés en navigateur (clair), à froid ou avec un état minimal.

## Grille de notes

Barème /20 : entrée claire (4) · densité juste, ni mur ni vide (4) · cohérence visuelle avec
les autres modules (4) · action principale évidente (4) · ton simple et rassurant (4).

| Module | Première page regardée | Note | En un mot |
|---|---|---:|---|
| Analyser ma candidature (Bilan) | « Préparer » | 18 | Référence. Barre d'étapes + accordéons numérotés + pastilles d'état. |
| Co-construire ma lettre | Écran de dépôt | 18 | Même patron que le Bilan, très propre. |
| Lexique | Écran de recherche (refondu 2026-09-09) | 18 | Refonte en 3 niveaux. |
| Cohérence de mon dossier | Écran de collecte | 17 | Propre. Pas de barre d'étapes ici ; « Revoir la présentation » à vérifier. |
| Préparer un entretien | Écran de dépôt | 17 | Même patron que Co-construire ma lettre. |
| Comparer mes pistes | « Ajouter mes pistes » | 16 | Bon patron. Titre = nom d'étape, barre d'étapes sous le titre. |
| Découvrir mes compétences | « Préparer » (étape 1) | 16 | Guidé et rassurant. Titre = nom d'étape. |
| Les mots de votre CV (ATS) | « Préparer » | 15 | Titre = « Préparer » (pas le nom du module). Sous-titre mal aligné. |
| Regard recruteur | « Préparer » | 15 | Idem ATS. Barre d'étapes placée sous le titre. |
| Mon Carnet | Écran de saisie | 14 | Deux zones de saisie qui se ressemblent = confusion. Du vide. |
| Mes Repères | Écran principal (liste vide) | 14 | 3 onglets sur une liste vide + état vide perdu au milieu d'un grand blanc. |
| Comprendre le cadre | Porte « indiquez votre territoire » | 11 | Un encart + un bouton + un grand vide. Aucun aperçu du contenu. |
| Comprendre les chiffres | Porte « indiquez votre département » | 11 | Identique à « Comprendre le cadre ». |

## Ce qui fait la différence

**Le peloton de tête** (Bilan, Co-construire ma lettre, Cohérence, Préparer un entretien,
Comparer, Découverte) partage un patron qui marche : gros titre centré, sous-titre court,
**accordéons numérotés dépliants**, **pastilles d'état** (« À déposer », « facultatif »,
« conseillé si vous l'avez »), action principale (« Déposer mon CV ») bien visible.

**Trois écrans « trop vides »** — le reproche fait au Lexique, encore présent ailleurs :

- **Comprendre le cadre** et **Comprendre les chiffres** : à froid, un seul encart
  « indiquez votre territoire/département » + un gros bouton, puis un grand blanc. Aucun
  aperçu de ce que le module contient. Ce sont les deux sous-modules de « Se tenir
  informé » et ils ont exactement le même écran.
- **Mes Repères** (liste vide) : les 3 onglets « Non analysés / Déjà analysés / Deuxième
  regard » s'affichent sur une liste vide, et l'état vide (icône + 2 lignes) flotte au
  milieu d'un grand espace.
- **Mon Carnet** : deux champs de saisie se ressemblent (« vos notes, comme elles
  viennent » en haut + une deuxième zone « Notez tout ce qui vous semble utile » + bouton
  « Noter ») — on ne sait pas où écrire. Et beaucoup de blanc.

**Incohérences dans le peloton de tête :**

1. **Titre de l'écran** : Bilan / Co-construire ma lettre / Cohérence affichent le **nom du
   module** (« Analyser ma candidature »). ATS, Regard recruteur, Comparer, Découverte
   affichent seulement le **nom de l'étape** (« Préparer », « Ajouter mes pistes ») — on
   perd l'identité du module sur son propre écran de travail.
2. **Barre d'étapes** : au-dessus de « Revoir la présentation » chez Bilan / Co-construire
   ma lettre / Comprendre le cadre ; en dessous du titre chez ATS / Regard recruteur /
   Comparer / Découverte. Pas homogène.
3. **Sous-titre** : aligné à gauche chez Bilan / Cohérence / Co-construire ma lettre ;
   **indenté bizarrement** (il démarre au milieu de la largeur) chez ATS et Regard
   recruteur — un défaut de mise en page, pas un choix.
4. **« Revoir la présentation »** : présent partout, sauf peut-être l'écran de collecte de
   Cohérence — à vérifier.

**Carnet et Repères** (deux modules « famille 1 » voisins) ont des en-têtes différents :
Carnet = titre centré ; Repères = titre à gauche encadré de deux boutons.

**Poids des boutons** (retour de Denis du jour, sur le Lexique et sur une fiche) : thème
récurrent. Les boutons `btn-outline-secondary btn-sm` en pavés bordés pèsent lourd partout
— Niveau 3 du Lexique (corrigé le 2026-09-09), relations d'une fiche Lexique, anciens
boutons de l'accueil Lexique. À alléger comme un fil transverse.

## Recommandations, par priorité

**P1 — les deux modules de « Se tenir informé » (Comprendre le cadre / Comprendre les
chiffres). — FAIT le 2026-09-09** (`df6cc31`, `e406c2f`). Ils avaient exactement le problème
du Lexique. Recette appliquée : garder le choix du territoire, mais afficher dès l'arrivée un
aperçu verrouillé de ce que le module couvre (les rayons + outils pour le cadre ; la liste des
questions traitées pour les chiffres). Aperçu grisé, `inert`, non cliquable ; un clic n'importe
où rouvre le choix du territoire ; le choix fait, l'accueil réel s'affiche. Deux modules d'un
coup, gain visible immédiat.

**P2 — harmoniser le peloton de tête.** Un passage transverse : (a) titre = **nom du
module** partout ; (b) barre d'étapes toujours au même endroit ; (c) corriger
l'indentation du sous-titre d'ATS et de Regard recruteur ; (d) vérifier « Revoir la
présentation » sur l'écran de collecte de Cohérence.

**P3 — Carnet + Repères.** Carnet : une seule zone de saisie visible, pas deux. Repères :
soigner l'état vide (moins de blanc ; masquer les 3 onglets tant que la liste est vide ?).
Aligner les deux en-têtes.

**P4 — fil transverse « alléger les boutons ».** Les relations d'une fiche Lexique (retour
de Denis du jour, capture « Rupture conventionnelle » : les boutons pèsent plus lourd que
la définition) et plus généralement les boutons `btn-sm` en pavés — les passer en pilules
fines / liste légère, comme fait pour le Niveau 3 du Lexique le 2026-09-09. La fiche Lexique
mérite sa propre maquette (écran le plus consulté du module).
