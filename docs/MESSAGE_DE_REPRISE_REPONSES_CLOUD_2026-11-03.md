# Message de reprise : intégrer les réponses du Cloud (Lexique et fiches incertaines)

À coller dans la première phrase d'une nouvelle conversation, après `/app`.

---

/app Reprise du chantier « intégration du dossier Cloud ». Lis d'abord `docs/PLAN_DE_REPRISE_DOSSIER_CLOUD_2026-11-03.md` (section 4 « Point d'arrêt », puis la section 3.8), puis lance `git log -8` et `git status` : le dernier commit de la séance précédente est `9cad87ef`.

Ce que je vais te coller, dans l'ordre où je le reçois du Cloud :

1. **Les seconds niveaux du Lexique** (message `docs/PROMPT_CLOUD_SECONDS_NIVEAUX_LEXIQUE_2026-11-03.md`). Une ligne par mot : `identifiant | texte | adresse de la page lue | date`. Pour chaque mot : ouvre la page citée, vérifie que le texte ne répète pas le corps de la fiche et ne contient aucun chiffre, puis ajoute une entrée dans `LEXIQUE_SECOND_NIVEAU` de `data/lexique.js` (modèle : les entrées existantes). Contrôle ensuite avec `node scripts/checkLexique.js` (0 erreur, 0 avertissement) et `npm test`. Les mots de la section « NON TRAITÉS » restent sans second niveau (aucun contenu sans source officielle). Les pages de « À OUVRIR PAR MOI » : tu les ouvres toi-même dans le navigateur, ou tu me les listes si elles te sont bloquées.

2. **La vérification des 94 fiches « INCERTAIN »** (message `docs/PROMPT_CLOUD_VERIFICATION_FICHES_INCERTAINES_2026-11-03.md`). Une ligne par fiche : `id | A JOUR ou ECART ou NON VERIFIE | page | date | ce que dit la page | ce que dit la fiche`. Pour chaque ÉCART : rouvre la page, compare avec la fiche de `modules/comprendre-le-cadre/contenu/`, corrige la fiche (avec `verifie_le` et une ligne de `revisions`) seulement si la page lue le justifie. Pour NON VERIFIE et « À OUVRIR PAR MOI » : ouvre toi-même la page. Après chaque lot : `node scripts/genererBaseVeille.js`, `node scripts/genererRenvoisCadre.js`, `npm test`, un commit par lot.

Règles à ne pas oublier (elles sont dans CLAUDE.md) : français impeccable avec accents, jamais de tiret long, jamais le mot « IA », jamais « facultatif » (écris « à compléter »), page officielle ouverte avant d'écrire un chiffre, jamais `git add -A`, jamais de push, `Cloud/` jamais dans Git, ligne dans `docs/JOURNAL_DES_CHANGEMENTS.md` pour tout changement visible, `outils/passages.json` est à moi (ne pas le toucher). Mets à jour le point d'arrêt du plan de reprise à chaque fin de lot.
