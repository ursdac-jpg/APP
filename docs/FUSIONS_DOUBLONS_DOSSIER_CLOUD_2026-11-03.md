# Fusions des doublons du dossier Cloud (A4) : ce qui a été fait le 03/11/2026

Consigne 107 de Denis : jamais de doublon, un seul exemplaire avec les informations des deux entrées. Rien n'a été supprimé : chaque fiche du sas garde sa ligne, seule la colonne « Source » a changé.

## Ce que j'ai constaté

Sur les 121 « fusions probables » du document `A_CONTROLER_ET_DOUBLONS_DOSSIER_CLOUD_2026-11-03.md` :

- **0** groupe a ses deux entrées au sas : le doublon est dans le dossier Cloud, pas dans l'application ;
- **62** groupes ont une entrée au sas et une absente ;
- **59** groupes n'ont aucune entrée au sas (voir plus bas).

Pour les 62 groupes, la fiche du sas est déjà l'exemplaire unique (commune et adresse y sont). Il restait un défaut : la mention « À contrôler par le responsable » venait de l'entrée mise de côté du dossier (site illisible), alors que l'autre entrée, du même employeur, avait été vérifiée.

## Ce qui a été fait (employeurs.sas.txt)

**11 fiches : mention « à contrôler » remplacée par une mention de fusion**, parce que l'autre entrée du dossier est vérifiée avec une confiance « sûr » : actimad, delouis-fils, ecomsoft, heliaq-limoges, keepcool-perigueux, limocars, neowise, octopus-business, proximit, securitas-france-limoges, transports-briche. La mention garde les deux verdicts du dossier. Rien n'est publié : « C'est bon » reste à donner.

**2 fiches : commune de Périgueux ajoutée** (l'autre entrée du dossier était le salon de Périgueux, vu sur la page officielle des salons de la Dordogne) : camille-albane-limoges et dessange-limoges (passées en « enseigne », limoges + Périgueux, adresse du salon de Périgueux à relever).

**49 fiches inchangées** : soit il n'y avait pas de mention à corriger (l'autre entrée n'apportait rien), soit l'autre entrée est elle aussi mise de côté ou vérifiée seulement en « confiance moyenne », donc la mention « à contrôler » reste justifiée (ag2r-la-mondiale-limoges, erctp, haviland, malakoff-humanis-limoges, neosoft-limoges, raynaud : jumeau vérifié en confiance moyenne ; les autres : jumeau mis de côté).

## Centre hospitalier de Périgueux (réponse de Denis, 03/11/2026)

Denis a confirmé la fiche (site en maintenance mais bon, adresse, numéro et site identiques). Ce n'est pas un doublon : une seule fiche `centre-hospitalier-perigueux` existe parmi les employeurs ; ses lignes dans les fichiers d'offres (`recruteurs`, `recruteurs_publics`) sont des pages de recrutement, pas des fiches d'employeur. La mention « à contrôler » est remplacée par la confirmation de Denis et la fiche est inscrite « pré-validée » (base `texte-denis`).

## Les 59 groupes sans aucune entrée au sas

Ce sont des entreprises du dossier absentes de l'application sous les deux écritures (par exemple « A DOM' Limousin » et « A DOM' Limousin (Limoges) »). Décision de Denis (consigne 108) : il vérifie lui-même les entrées absentes du sas et apporte les sites ; je les intègre ensuite en une seule fiche. Critère d'intégration : présent dans l'un des deux départements suffit.
