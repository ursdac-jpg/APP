# Contrôle à la main des chiffres du BODACC : l'échantillon d'une semaine (2026-10-19)

> Pour la case M6 de `docs/CHANTIER_REPERES_ENTREPRISES_TERRITOIRE_2026-10-18.md`. Aucun nom d'entreprise ni de personne dans ce fichier. Durée : environ 10 minutes. Essayé par Claude le 2026-10-19 sur le vrai site pour la Dordogne (l'adresse fonctionne, 27 résultats comme dans l'outil, 7 annonces « JUGEMENT D'OUVERTURE » comptées à la main sur les 3 pages) ; les nombres de la Haute-Vienne et des ventes viennent de l'outil et n'ont pas été recomptés sur le site.

## Pourquoi un échantillon
Le site du BODACC ne sait pas donner d'un coup le nombre d'annonces d'ouverture sur douze mois. On vérifie donc **une semaine entière** : si l'outil et le site donnent le même nombre pour cette semaine, la façon de compter est la bonne, et la même façon de compter donne les douze mois.

## Ce qu'on compte (définition choisie par Denis le 2026-10-19)
Chaque annonce du BODACC a un titre en capitales. **« JUGEMENT D'OUVERTURE »** est le titre des annonces qui ouvrent une procédure (liquidation, redressement, sauvegarde), plus les extensions de procédure. Compter ce titre sur le site est simple et exact. Les autres titres (« JUGEMENT DE CLÔTURE », « EXTRAIT DE JUGEMENT », « AVIS DE DÉPÔT ») ne comptent pas.

## La semaine choisie : du lundi 5 au dimanche 11 octobre 2026

**Dordogne** : ouvrir cette adresse
`https://www.bodacc.fr/pages/annonces-commerciales-recherche/?sort=dateparution&refine.familleavis_lib=Proc%C3%A9dures%20collectives&refine.numerodepartement=24&q=dateparution%3A%5B2026-10-05%20TO%202026-10-11%5D`

**Haute-Vienne** : la même adresse avec `refine.numerodepartement=87` à la place de `24`.

Ce qu'on doit voir en haut de la liste :
| | Dordogne | Haute-Vienne |
|---|---|---|
| « … résultats pour votre recherche » | **27** | **65** |
| annonces au titre « JUGEMENT D'OUVERTURE » (à compter en parcourant les pages 1, 2, 3... de 10 annonces, avec les numéros de page sous la liste) | **7** | **16** |

Si les deux nombres de la première ligne sont les bons mais que ton comptage des titres « JUGEMENT D'OUVERTURE » diffère d'une annonce ou deux, regarde si une annonce contient deux entreprises (une seule annonce peut en nommer plusieurs : on compte les annonces, pas les entreprises).

## Les ventes (même semaine)
Même adresse avec `refine.familleavis_lib=Ventes%20et%20cessions` à la place de `Proc%C3%A9dures%20collectives` : on doit voir **3 résultats** pour la Dordogne et **7** pour la Haute-Vienne.

## Ce que cela prouve, et ce que cela ne prouve pas
Prouve : l'outil lit bien la bonne famille d'annonces, dans le bon département, sur la bonne période, et classe correctement les annonces d'ouverture. Ne prouve pas : que les douze mois sont complets (le site peut avoir ajouté ou corrigé des annonces depuis) ; c'est pourquoi le chiffre publié porte une période en toutes lettres et la date de relevé.
