# Paquet C : structures « à qui s'adresser » - TERMINÉ le 2026-09-06

> Sorti de `modules/comprendre-le-cadre/liens-verifies.txt` le 2026-09-06. La portée
> était déjà renseignée partout (`national` / `region` / `24` / `87`). Restait à **dater
> la 3e colonne** pour rendre chaque structure cliquable en « Près de chez moi » (LECONS 9.16).
>
> **État au 2026-09-06 : toutes les lignes du Paquet C sont datées.** Plus aucune ligne de
> structure sans date dans `liens-verifies.txt`.
>
> - **Groupe A** : 27 clés, vérifiées au navigateur par Denis.
> - **Groupe B2** : ~18 clés à URL corrigée, vérifiées au navigateur par Denis (« B2 aussi,
>   vérifié et validé »).
> - **Groupe B1** : ~60 clés (pages d'accueil génériques + sites nationaux de réseaux),
>   vérifiées le 2026-09-06 par contrôle automatique (chaque URL ouverte, organisme confirmé) ;
>   une seule correction : `cap-emploi-dordogne` (`capemploi.fr` racheté / page parkée) →
>   `https://www.capemploi-24.com/` (vrai Cap emploi Dordogne, Périgueux). Les domaines
>   officiels qui bloquent les robots (`ants.gouv.fr`, `ofii.fr`, `annuaire.action-sociale.org`,
>   `ac-bordeaux.fr`, `justice.fr`, `administration-etrangers-en-france.interieur.gouv.fr`,
>   `pajemploi.urssaf.fr`) ont été datés après confirmation par recherche web qu'ils sont vivants.
>
> Suite : entretien courant (contrôle des liens à la cadence de `docs/VEILLE_PROMPTS.md`).

## Attention : ce n'est pas purement mécanique

Beaucoup de lignes pointent encore vers une **page d'accueil générique** (`dordogne.fr`,
`justice.fr`, `francetravail.fr`, `mission-locale.fr`…) là où il faudrait le **vrai site
de la structure locale**. Pour celles-là, il faut d'abord **trouver et corriger l'URL**,
puis dater. C'est signalé dans le chantier territoire (§ 4) : `mission-locale-perigord`,
`adil-dordogne`, `mdph-dordogne`, `habitat-jeunes-perigord`, les `justice.fr` locaux, à
revérifier `msa-dordogne.fr`, `presanse-aquitaine.org`.

Deux groupes ci-dessous.

---

## GROUPE B2 : TERMINÉ le 2026-09-06 (Denis, navigateur : « B2 aussi, vérifié et validé »)

Toutes les clés du Groupe B2 sont datées `2026-09-06` dans `liens-verifies.txt`.

- [x] `mdph-dordogne` [24] → https://www.dordogne.fr/a-votre-service/handicap/maison-departementale-des-personnes-handicapees
- [x] `cdad-dordogne` [24] → https://www.cdad-dordogne.fr/
- [x] `cdad-dordogne-points-justice` [24] → https://cdad-dordogne.fr/lieux-d-acces-au-droit.html
- [x] `point-justice-dordogne` [24] → https://cdad-dordogne.fr/lieux-d-acces-au-droit.html
- [x] `ordre-avocats-perigueux` [24] → https://www.avocats-perigueux.com/
- [x] `conseil-de-prud-hommes-perigueux-bergerac` [24] → https://lannuaire.service-public.gouv.fr/nouvelle-aquitaine/dordogne/4e40b4a0-0ebb-4332-8451-587a57b781dc *(daté 2026-09-06 ; justice.fr/annuaire : 404)*
- [x] `conseil-prudhommes-perigueux-bergerac` [24] → même URL lannuaire *(daté 2026-09-06)*
- [x] `mission-locale-perigord` [24] (x3) → https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/dordogne/mission_locale *(daté 2026-09-06 ; annuaire des 5 missions locales de Dordogne. Sites concrets connus : ml-grandperigueux.fr, missionlocaledubergeracois.com - non retenus car la clé couvre tout le département)*
- [x] `habitat-jeunes-perigord` [24] → https://habitat.dordogne.fr/mon-logement/hebergement-pour-les-jeunes-et-etudiants-en-dordogne
- [x] `msa-dordogne-lot-et-garonne` [24] → https://dlg.msa.fr/lfp *(daté 2026-09-06, Denis navigateur ; ancien msa-dordogne.fr : DNS mort)*
- [x] `medecine-du-travail-service-prevention-sante` [24] → https://www.spst19-24.org/ *(daté 2026-09-06, Denis navigateur ; ancien presanse-aquitaine.org : DNS mort)*
- [x] `spada-dordogne` [24] → https://www.asd24.org/ *(daté 2026-09-06, Denis navigateur)*
- [x] `banque-france-succursales` [national] → https://www.banque-france.fr/fr/nous-trouver *(daté 2026-09-06, Denis navigateur)*
- [x] `croix-rouge-secours-catholique-microcredit` [national] → https://www.service-public.gouv.fr/particuliers/vosdroits/F21375 *(daté 2026-09-06, Denis navigateur ; france-microcredit.org et l'annuaire Banque de France écartés)*
- [x] `udaf-dordogne` [24] → https://www.udaf24.fr/acces-au-microcredit-personnel-accompagne-udaf/ *(daté 2026-09-06, Denis navigateur - page microcrédit accompagné de l'UDAF 24, plus précise que l'accueil)*

## Encore mort - traité le 2026-09-06

- [x] `france-vae-point-relais-conseil` [region] → https://vae.gouv.fr/ *(daté 2026-09-06 ; france-vae.fr : SSL mort ; Denis tranche pour le portail national)*
- [x] `psad-plateforme-suivi-appui-decrocheurs-dordogne` [24] → https://www.ac-bordeaux.fr/ia24 *(daté 2026-09-06, Denis ; direction académique de la Dordogne, à défaut de page PSAD dédiée)*

## GROUPE A : URL déjà spécifique - TRAITÉ le 2026-09-06 (Denis, navigateur)

**25 clés datées `2026-09-06` dans `liens-verifies.txt`** (commit `9817448`) : elles sont
cliquables en « Près de chez moi ». Rien à refaire ici.

- [x] `caf-dordogne` [24]
- [x] `caf-dordogne-logement` [24]
- [x] `point-conseil-budget-annuaire` [national]
- [x] `ccas-mairie` [national]
- [x] `ccas-domiciliation` [national]
- [x] `actionlogement-garantie-visale` [national]
- [x] `actionlogement-avance-loca-pass` [national]
- [x] `adil-dordogne` [24]
- [x] `spip-dordogne` [24]
- [x] `associations-post-sentencielles-dordogne` [24]
- [x] `relais-petite-enfance` [national]
- [x] `restos-du-coeur-aide-alimentaire` [national]
- [x] `restos-du-coeur-dordogne` [24]
- [x] `agence-service-civique` [national]
- [x] `enic-naric-france` [national]
- [x] `centres-examen-delf-dordogne` [24]
- [x] `france-travail-jeunes-dordogne` [24]
- [x] `plateforme-mobilite-dordogne` [24]
- [x] `auto-ecoles-associatives-sociales` [national]
- [x] `structures-iae-dordogne` [24]
- [x] `cooperative-activite-emploi-dordogne` [24]
- [x] `plie-et-maison-emploi-dordogne` [24]
- [x] `115-samu-social` [national]
- [x] `cfa-et-ecoles-de-production-nouvelle-aquitaine` (déjà datée 2026-09-05)
- [x] `defenseur-des-droits-delegues-dordogne` (déjà datée 2026-09-05)

**2 clés du groupe A** (liens morts signalés par Denis) — **datées le 2026-09-06** après
vérification navigateur de Denis :
- [x] `banque-france-succursales` [national] → `https://www.banque-france.fr/fr/nous-trouver` *(ancienne page « le réseau de la Banque de France » : 404)*
- [x] `spada-dordogne` [24] → `https://www.asd24.org/` *(Association de Soutien de la Dordogne ; ancienne page interieur.gouv.fr déplacée)*

## GROUPE B1 : TERMINÉ le 2026-09-06 (contrôle automatique)

Les ~60 clés à URL générique (portails de conseil départemental, préfecture,
sites nationaux de réseaux, annuaires officiels) ont été vérifiées une par une :
chaque URL ouverte, organisme confirmé, puis datée `2026-09-06` dans
`liens-verifies.txt`.

- **Une seule correction** : `cap-emploi-dordogne` -> `https://www.capemploi-24.com/`
  (l'ancien `capemploi.fr` est une page parkée / nom de domaine à vendre).
- Domaines officiels qui bloquent les robots, datés après confirmation par
  recherche web qu'ils sont vivants : `ants.gouv.fr`, `ofii.fr`,
  `annuaire.action-sociale.org` (x3), `ac-bordeaux.fr`, `justice.fr`,
  `administration-etrangers-en-france.interieur.gouv.fr`, `pajemploi.urssaf.fr`.
- `psad-plateforme-suivi-appui-decrocheurs-dordogne` et
  `medecine-du-travail-service-prevention-sante` avaient déjà été repointés +
  datés au Groupe B2 (voir plus haut).

Plus aucune ligne de structure sans date. Le Paquet C passe en entretien courant.

## Déjà datées (14, pour mémoire)

`solidarites-precarite-alimentaire`, `service-public-avance-loca-pass`, `service-public-fsl`,
`service-public-aides-au-logement-caf`, `service-public-dalo`, `service-public-fjt`,
`service-public-etablissements-precarite`, `service-public-loyers-impayes-expulsion`,
`service-public-demande-logement-social`, `cfa-et-ecoles-de-production-nouvelle-aquitaine`,
`france-travail-justice-dordogne`, `casier-judiciaire-national`,
`structures-iae-milieu-penitentiaire`, `defenseur-des-droits-delegues-dordogne`.
