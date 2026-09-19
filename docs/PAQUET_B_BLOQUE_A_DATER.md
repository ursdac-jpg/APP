# Paquet B : TERMINÉ (2026-09-06)

> Adresses documentaires de `modules/comprendre-le-cadre/liens-verifies.txt`.

## Bilan

| lot | nombre | état |
|---|---|---|
| Sources ouvrables | 27 | datées 2026-09-06 (`49e4e55`, `12ea41b`) |
| Sources bloquées, 1re passe Denis | 53 | datées 2026-09-06 (`0d1fe22`) |
| Sources bloquées, 2e passe Denis | 9 | datées 2026-09-06 (dont 4 URL corrigées) |
| 4 adresses mortes orphelines | 4 | **supprimées** de `liens-verifies.txt` et des collectes (2026-09-06) |

89 sources datées, 4 mortes supprimées. **Paquet B clos.** Rien ne pointe plus dans le vide.

## 2e passe (2026-09-06) - 9 datées

Sans changement d'URL : `caf`, `banque-france-detail-procedure-surendettement`,
`banque-france-microcredit`, `banque-france-ficp`, `banque-france-droit-au-compte`.

Avec URL corrigée :
- `bo-travail` → `https://travail-emploi.gouv.fr/publications-et-ressources/bulletins-officiels-et-documents-opposables`
- `interieur-etrangers` → `https://www.immigration.interieur.gouv.fr/Immigration`
- `economie-clauses-sociales` → `https://www.economie.gouv.fr/daj/guide-sur-les-aspects-sociaux-de-la-commande-publique`
- `travail-emploi-ecoles-de-production` → `https://www.info.gouv.fr/actualite/les-ecoles-de-production-une-autre-facon-d-apprendre-un-metier`
  *(article info.gouv.fr de 2021, gouvernement Castex : sur le bon sujet mais ancien.
  À remplacer si une page de référence plus récente apparaît. Pas de page HTML
  stable équivalente sur travail-emploi.gouv.fr.)*

## Les 4 adresses mortes : supprimées le 2026-09-06

Contrôle du 2026-09-06 (verdict `RESTRUCTURÉ` : dispositifs vivants, pages
déplacées). Les fiches qui les citaient avaient déjà été repointées vers des
sources datées couvrant le même terrain ; les 4 clés n'étaient plus citées par
aucune fiche. Elles ont été **retirées** de `liens-verifies.txt` et des blocs
`sources:` des collectes `accompagnement` et `francais` (re-vérifié au navigateur
le 2026-09-06 : `francetravail.fr/candidat/france-travail-vous-accompagne/` → 404).

- `francetravail-accompagnement-global`, `francetravail-accompagnement-intensif`
  - terrain couvert par `service-public-contrat-engagement` + `travail-emploi-loi-plein-emploi`.
- `interieur-cir-formation-linguistique`, `interieur-parcours-linguistique-au-dela-cir`
  - terrain couvert par `service-public-contrat-integration-republicaine` (F17048) + `ofii-accueil-integration`.
