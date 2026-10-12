# Plan de la nuit du 2026-10-08 (mode Nuit, `[effort : moyen]`, délégation de Denis)

**Verdict : APTE AU MODE NUIT pour les cases ci-dessous** (décisions toutes tranchées par Denis). **NON APTE** pour ce qui figure en fin de fichier.
Règles : un commit par case cochée, `npm test` à chaque fois, essais de parcours avec la fenêtre à 738 x 698 (`resize_window`, page rechargée, ne pas la redimensionner pendant l'essai), aucun `push`, aucune commande destructive. Au réveil : compte-rendu fait / bloqué / pourquoi, avec le hash de départ `567cd8f8`.

## À faire (cocher au fur et à mesure)
- [x] **A. Finir le lot « colonnes + photo »** (code déjà écrit, non commité au départ) : deux boutons « Une colonne » / « Deux colonnes » sans choix au départ (`data-mep-org-colonnes`, `_colonnesChoisies`), tirage Standard qui respecte le choix ; modèles à photo cachés sans photo (`_MEP_MODELES_A_PHOTO`). Essais `tirageStandard`, `optionsSupp`, `looksFamilles`, `ambiance`, `coordEnLigne` verts, puis commit. Dernier échec connu : « Annuler revient au tirage précédent » (essai lancé avec une fenêtre de 1242 de large : le relancer à 738).
- [x] **B. Mesurer les modèles qui laissent un cadre photo vide sans photo** et compléter `_MEP_MODELES_A_PHOTO` (`js/app.js`) ; essai : sans photo, aucun cadre photo vide sur aucun modèle proposé.
- [x] **C. Bouton « Dégradé » en rectangle** (demande de Denis du 2026-10-08) : le mot « Dégradé » écrit dans un rectangle à fond légèrement dégradé (bleu du thème) ; état activé / non activé bien visible (fond plein et bordure marquée quand activé, fond pâle et trait fin sinon) ; remplace la case « Dégradé » de la zone Couleurs (`data-mep-degrade-simple`) en gardant le même geste ; mode sombre ; essai de parcours.
- [x] **D. Légende du mode Standard** (`_htmlGalerieModelesMiseEnPage`, `js/app.js`) : phrase à jour (ambiance au hasard, variantes visuelles, nombre de colonnes respecté).
- [x] **E. Suite complète de parcours** (`await window.__parcours()`, environ 45 minutes, fenêtre 738 x 698) : 0 échec ; sinon corriger ou noter. Mettre à jour `docs/ETAT_DES_CHANTIERS.md` (passation).
- [x] **F. Préparation du module « Un CV, plusieurs métiers »** (technique seulement, rien de visible) : second prototype « un PDF mêlant plusieurs modèles de CV sans mélanger les styles » (isolation du CSS de chaque CV : Shadow DOM ou préfixe de classes ; impression Chrome sans interface, comptage des pages ; prototype jetable dans un dossier temporaire, résultat écrit en section 19 de `docs/CHANTIER_UN_CV_PLUSIEURS_METIERS_2026-09-30.md`).

## NON APTE AU MODE NUIT (attendre Denis)
- Différencier visuellement les trois boutons d'allure Sobre / Standard / Créatif : maquette puis choix de Denis.
- Maquette et décisions du module « Un CV, plusieurs métiers » (demain, effort haut).
- Ouvrir la disposition décalée dans un vrai Word.

## Compte-rendu de fin de nuit (2026-10-08)
Hash de départ de la nuit : `567cd8f8`. Tout est commité sur `master`, rien n'est poussé. Cases A à F faites. Suite complète de parcours : **1356 contrôles verts**, 2 attentes d'un ancien essai de galerie adaptées à la règle « sans photo, pas de modèle à photo » (puis relancé : 36 verts). `npm test` : 1331 verts. Banc B7 : identique (les CV existants n'ont pas bougé).
