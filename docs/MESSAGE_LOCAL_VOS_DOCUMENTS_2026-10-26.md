# Message à coller dans la session locale (Claude Code sur le PC de Denis), 26/10/2026

Copier tout ce qui est entre les deux lignes de tirets.

----------------------------------------------------------------------
/app

Je reprends un chantier commencé dans une session cloud (la session cloud n'a rien modifié dans le code de l'application, seulement des documents et des scripts de mesure, sur la branche `claude/youthful-fermi-6q9gzu`).

Étape 0, avant tout :
1. Vérifie `git status`. S'il y a des modifications non commitées, dis-le-moi avant de continuer.
2. Récupère la branche : `git fetch origin claude/youthful-fermi-6q9gzu`, puis `git switch claude/youthful-fermi-6q9gzu`. Ne touche pas à `master`, ne fusionne rien, ne pousse rien sans ma demande.
3. Lis dans cet ordre : **`docs/SYNTHESE_AUDIT_TOUTES_CARTES_ET_PLAN_2026-10-26.md` (document d'entrée : grappes de corrections, lots L0 à L10, décisions à demander)**, puis `docs/CHANTIER_VOS_DOCUMENTS_COHERENCE_2026-10-26.md` (carte « Mes documents », constats C1 à C23), `docs/CHANTIER_AUDIT_TOUTES_CARTES_2026-10-26.md` (les cinq autres cartes, constats D1 à D31) et `docs/CONCEPTION_REGISTRE_FAMILLES_VOS_DOCUMENTS_2026-10-26.md` (lot L7).
4. Lance `npm test` et note le résultat. Dans le cloud, l'état de départ est 2021 essais, 2020 verts, 1 échec sur un dossier `PROSPECTION` absent du dépôt cloné ; sur mon PC le résultat peut être différent : note-le comme état de départ local.

Règle absolue : zéro régression. Avant toute modification, grep sur tout le dépôt de chaque fonction partagée touchée ; un commit par sous-étape ; après chaque sous-étape, `npm test` identique à l'état de départ et essai navigateur de chaque famille de parcours concernée.

Ce que je te demande maintenant, dans l'ordre :
A. Annonce le mode et l'effort conseillés pour chaque lot, puis attends que j'aie réglé l'effort (règle 4bis).
B. Dans le navigateur de l'outil d'aperçu (serveur `site-v2-python-server`, port 8123), rejoue la mesure `docs/mesures_2026-10-26/matrice_vos_documents.js` : ce script Playwright pose l'état de chaque famille de parcours, ouvre « Vos documents » et relève barre d'étapes, titre, boutons du bas et action de « Retour ». Si Playwright n'est pas disponible sur ce PC, adapte-le à l'outil d'aperçu (même 12 états, mêmes mesures). Compare avec `matrice_vos_documents.REFERENCE.json` et dis-moi toute différence : elle serait liée à mon PC et non au code.
C. Lot 6 du plan (parcours de bout en bout) : rejoue avec de vraies saisies les trois parcours de « Créer un nouveau CV », les trois voies de « Reprendre mon CV », « J'ai déjà un CV », « Écrire ma lettre », « M'entraîner à un entretien », « Un CV, plusieurs métiers » et le Bilan, avec `scripts/parcours/parcours_smoke.js` quand un essai existe. Complète le cahier avec ce que tu vois (écrans intermédiaires, sorties), sans modifier le code.
D. Audite la famille « Écrire ma lettre » sur « Vos documents » : pourquoi aucun bouton principal n'est affiché (lot 4b du plan).
E. Ensuite seulement, propose d'abord le lot L0 (défaut C18 : CV déposé par texte collé), puis L1, L3 et L4 (petits, sans choix d'interface), dans l'ordre de la synthèse avec le détail de ce que tu vas modifier, et attends mon feu vert. Les lots 2 à 5 demandent mes décisions et une maquette : ne les commence pas sans moi.

À la fin de la séance, mets à jour le cahier et `docs/ETAT_DES_CHANTIERS.md` (passation), et dis-moi les essais réels que je dois faire.
----------------------------------------------------------------------

## Pour Denis, avant de coller
- Ne modifier ni `js/app.js` ni `data/metiers.js` en local en même temps qu'une session cloud : une seule copie du code à la fois.
- Pour revenir à votre état habituel à tout moment : `git switch master`.
