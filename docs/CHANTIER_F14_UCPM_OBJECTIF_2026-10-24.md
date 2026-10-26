# Chantier F14 : « Mon objectif » de « Un CV, plusieurs métiers » avec la logique de la lettre (24/10/2026)

Maquette validée par Denis : `docs/MAQUETTE_UCPM_OBJECTIF_LETTRE_2026-10-24.html`. Décisions de Denis : (1) contrat et temps de travail retirés pour « Réponse à une offre » ; (2) voie A (une copie du dossier prêtée au panneau) ; (3) entreprise précise pour un seul métier à la fois ; (4) ordre ci-dessous. `[effort : haut]` pour les cases 1 et 2, moyen ensuite.

## Précisions trouvées à l'audit du code (avant de coder)
- La brique de la lettre (`contenuModeRecherche`) contient aussi la question « un métier précis ou plusieurs » et la recherche du métier : sans objet ici (le métier est celui du CV). Ajout d'une option **`metierDonne`** (désactivée par défaut, aucun autre écran touché).
- La famille **emploi** (offre, spontanée, changer de métier) passe par la brique. La famille **période** (stage, immersion, alternance, formation) garde ses champs actuels (durée, dates séparées, organisme, formation visée, objectifs d'immersion) : ils n'ont pas d'équivalent dans la brique et ne sont pas à retirer.
- Le panneau prête une copie du dossier à chaque événement (capture puis relecture), jamais en continu.
- Nouveaux champs du brouillon : `forme`, `intitule`, `horaires` ; ils doivent atteindre les prompts (`ucpmDetailsObjectif`, `ucpmPoserObjectifDansDossier`).
- « Une date précise » (début possible) : la brique n'a que les jetons ; le champ de date précise est gardé à côté (rien n'est retiré).

## Plan en cases
- [x] **1.** Brouillon enrichi (`forme`, `intitule`, `horaires`) et adaptateur pur brouillon <-> forme du dossier, avec tests (`logiqueObjectifDossier.js`) `[effort : haut]`
- [x] **2.** Option `metierDonne` de la brique ; panneau pour un métier seul : six cartes, famille emploi par la brique, famille période inchangée, blocage avec raison `[effort : haut]`
- [x] **3.** Colonnes et « tous les métiers cochés » (entreprise précise réservée à un seul métier), remise à zéro au changement de carte `[effort : moyen]`
- [x] **4.** Prompts du module : forme, intitulé mis en avant, horaires dans `ucpmDetailsObjectif` et `ucpmPoserObjectifDansDossier` `[effort : moyen]`
- [x] **5.** Parcours de test rejoués, essai réel de Denis (à faire par lui)

Un commit par case, `npm test` et navigateur avant la suivante.

## État au 25/10/2026
Cases 1 à 4 faites. Vérifié : 8 tests de l'adaptateur, `npm test` 1991 réussis, parcours du module rejoués (186 contrôles, 4 échecs qui existaient avant : défilement de la page 6 et trois contrôles de lettres de la page 7). Pour plusieurs métiers : « entreprise précise » et « offre » grisées pour la spontanée et le changement de métier, champs entreprise, offre et recruteur masqués (seul le type de structure reste).
Écarts avec la maquette, à dire à Denis : (1) « Stage » ouvre le choix stage de formation / immersion et bloque « Appliquer » tant qu'il n'est pas fait ; (2) la question « Votre recherche porte sur : un métier précis ou plusieurs métiers d'un même domaine » de la brique remplace « Je vise » pour offre, spontanée et changement de métier (« Je vise » reste pour stage, alternance, immersion, formation) ; (3) le site de l'entreprise n'est pas repris (il n'existait pas dans le module) ; (4) « une date précise » de début est un champ à part (`dateDebut`) sous les disponibilités ; (5) les branches mortes de l'ancien panneau ont été retirées le 25/10/2026 (cases à cocher contrat et temps, bloc offre, ancien métier en double : 40 lignes de moins, 146 contrôles du module réussis).
Reste : l'essai réel de Denis (ouvrir « Mon objectif » pour un métier, pour une colonne, pour tous ; changer de carte ; vérifier les lettres et accroches générées).
