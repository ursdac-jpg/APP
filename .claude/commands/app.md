---
description: Recharge le contexte du projet APP (fichier maître + mode de travail + chantier actif)
---

Recharge le contexte du projet **APP**. Fais, dans l'ordre :

1. Lis `CLAUDE.md` (racine) en entier - c'est le protocole de travail.
2. Lis `docs/TRAVAILLER_AVEC_DENIS.md` en entier.
3. Lis la **partie 0** de `docs/ETAT_DES_CHANTIERS.md` (photo actuelle des chantiers). Pour le chantier actif, lis aussi ses fichiers propres (plan, retours, maquette).
4. **Ne lis PAS** les 4 fichiers de référence (LECONS / TACHES_VALIDEES / IDEES_A_RECLASSER / BRIQUES_COMMUNES) en entier : tu les consulteras en lecture ciblée (`grep`) au moment de démarrer un bloc concret, comme l'impose `CLAUDE.md`.
5. **Contrôle croisé** : lance `git log -1` et compare avec ce que dit `docs/ETAT_DES_CHANTIERS.md` (dernier chantier clos/en cours, date). Si ça ne correspond pas, signale-le avant de faire ton point de situation - ne suppose jamais que le fichier est à jour.

Puis, en 8 lignes maximum, réponds :
- le chantier actif et où il en est (2 lignes) ;
- le **mode recommandé** (A / B / C / D / Nuit) et l'effort recommandé pour la suite, et pourquoi ;
- ce dont tu as besoin de Denis pour reprendre.

Si Denis a écrit quelque chose après `/app`, traite-le comme le point de départ : « $ARGUMENTS ».
