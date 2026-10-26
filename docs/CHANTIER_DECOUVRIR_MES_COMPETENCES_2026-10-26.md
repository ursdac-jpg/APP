# Chantier « Découvrir mes compétences » (nouvel outil de la Boîte à outils)

Créé le 26/10/2026. Mode A, `[effort : haut]`. Lot 9 de `docs/MESSAGES_PAR_LOT_RETOURS_2026-10-25.md`, point F12 de `docs/LISTE_PRIORITES_RETOURS_DENIS_2026-10-24.md`.
**État : CONCEPTION. Rien n'est codé. Aucune maquette encore.** Phase actuelle : étape 1 de la méthode (concept grossier) et audit des recoupements.

## 1. La vision de Denis (26/10/2026, à garder telle quelle)

- Outil de la **Boîte à outils**, jamais obligatoire, jamais un diagnostic. But : **valoriser la personne, l'encourager**, lui montrer les compétences qu'elle a acquises.
- **Entrées** : un CV, ou plusieurs ; une lettre de motivation, ou plusieurs ; une lettre de recommandation, ou plusieurs ; ou un récit (voir le recoupement avec « À partir de mon récit », section 3).
- **Sortie** : les compétences relevées, expliquées, avec pour chacune des synonymes, une façon de la défendre à l'oral, la façon dont elle a été mise en œuvre. À la fin : un **document « mes compétences »** que la personne garde.
- **Sens large du mot « compétence »** (à la manière anglo-saxonne, sans afficher d'anglais) : savoir-faire, savoir-être, savoirs, **et aussi motivations et vision à moyen et long terme**.
- **Adaptation** au secteur, à la structure, au type de poste et au **niveau du poste** : le vocabulaire d'un ouvrier n'est pas celui d'un cadre ou d'une direction. Valoriser sans gonfler.
- **Faire comprendre ce qu'est une compétence** (pédagogie), comment elle fonctionne.
- **Derrière chaque expérience** : ce qui en ressort, et comment le mettre en avant.
- **Ambition à long terme** : ce document devient une **source concrète** pour le CV, la lettre et l'entretien. Au lieu de laisser l'assistant inventer, on lui donne des éléments tirés de l'expérience de la personne, qu'elle peut défendre. (Décision de plus tard, pas dans la première version.)
- **Difficulté posée par Denis** : tracer les limites pour ne pas empiéter sur les modules existants.

## 2. Audit du code réel (26/10/2026) : qui touche déjà aux compétences

| Où | Ce que ça fait aujourd'hui | Recoupement avec le nouvel outil |
|---|---|---|
| `modules/decouverte-competences/` (6 fichiers, `decouverteParcours.js` 2791 lignes), prompts `decouverte-competences.md` (1er passage) et `decouverte-redaction.md` (2e passage) | À partir d'un **récit**, relève les expériences (fragments), les compétences (savoir-faire, savoir-être, savoirs, centres d'intérêt), propose 5 formulations par fragment, pose des questions ciblées, **écrit dans le dossier** (`experiences`, `competences`, `loisirs`, `engagements`) via une table fixe (`decouverteMapping.js`) puis rédige le CV. Déjà renommé « À partir de mon récit » (troisième parcours de « Créer un nouveau CV »). | **FORT** : même matière. À ne pas dupliquer. |
| `prompts/extraction-cv.md` | Lit un CV déposé et en tire les données, y compris les compétences (savoir-faire, savoir-être déduits des loisirs, savoirs). | **FORT** : c'est déjà le lecteur de CV. À réutiliser. |
| Bilan (`bilan-v1/v2`), Cohérence, Regard recruteur, ATS, Reformuler | Comparent ou jugent un CV (face à une offre, au marché, aux recruteurs). | Moyen : eux évaluent, le nouvel outil révèle. Frontière : **jamais de note, jamais de comparaison à une offre**. |
| `data/competences.js` (79 compétences, descriptifs) et `data/competencesSecteurs.js` (827 lignes), clic compétence vers pistes de métiers | Catalogue de départ déjà existant, classé savoir-faire / savoir-être / savoirs. | **Matière première** du répertoire (à enrichir, pas à recréer). |
| « Un CV, plusieurs métiers », `comparer-pistes` | Compétences transférables vers des métiers. | Faible : le nouvel outil n'oriente pas vers des métiers. |
| Lexique | Notions de vocabulaire. **Décision déjà prise : « Compétences dans le Lexique » ÉCARTÉ** (09/09 et 16/09/2026, 80 à 120 fiches auraient alourdi le Lexique). | **CONFLIT à trancher** : F12 dit « enrichit le lexique ». Voir question Q4. |
| Entretien (`entretien.md`, fiche d'entretien) | Coaching, cas pratique, fiche de préparation. | Moyen : la partie « défendre à l'oral » s'en rapproche. L'outil donne la matière, l'entretien reste l'entraînement. |

**Ce que l'outil apporte de réellement nouveau** : plusieurs documents à la fois (CV, lettres de motivation et de recommandation) ; sens large de la compétence (motivations, vision) ; adaptation au niveau du poste ; défense à l'oral ; pédagogie (« qu'est-ce qu'une compétence ») ; le **document « mes compétences »** réutilisable ailleurs.

## 3. Pistes de frontières (à valider par Denis)

1. **Récit** : « À partir de mon récit » reste le seul parcours qui part d'un récit et qui **rédige un CV**. L'outil « Découvrir mes compétences » part de **documents** (et peut proposer, en option, un petit récit pour une expérience sans document), mais **ne rédige jamais de CV**.
2. **Lecture des documents** : réutiliser le lecteur existant (`extraction-cv.md` pour le CV). Les lettres sont nouvelles à lire pour ce but : un prompt dédié.
3. **Évaluation** : jamais de note ni de comparaison à une offre (c'est le Bilan, la Cohérence, le Regard recruteur).
4. **Oral** : l'outil donne « comment défendre cette compétence » (quelques phrases, une preuve). L'entraînement par échanges reste « M'entraîner à l'entretien ».
5. **Sortie** : un objet unique « mes compétences » dans le dossier, lu par les autres modules plus tard (idée IDEES « objets nommés et uniques », « une compétence vaut environ 10 ans »).

## 4. Matière piochée dans `docs/IDEES_A_RECLASSER.md` (déjà notée, compatible)

- Une phrase prête pour le CV sous chaque compétence ; 4 déclencheurs de récit (géré, fabriqué ou réparé, transmis, résolu) ; variante « ce que vous avez fait, avec quoi ou qui, quel résultat, ce qui était difficile » ; regroupement par thème ; « déjà validées » et « à préciser » ; panier de compétences ; bouton « ajouter à mon CV ».
- Dictée vocale pour raconter (fragilité d'écriture, à vérifier : qualité, confidentialité).
- Référentiel de compétences avec fiche courte par compétence (idée du 02/09/2026).
- **Ligne éthique à garder** (IDEES, 346) : ne jamais aider à mettre une compétence que la personne n'a pas ; la personne est démasquée en entretien.
- « Cohérence des compétences » : une compétence citée dans le CV et la lettre mais jamais préparée pour l'entretien.

## 5. Questions ouvertes pour Denis (une par une, aucune tranchée)

- **Q1** Entrées : documents seulement, ou documents plus petit récit facultatif pour une expérience sans document ?
- **Q2** Sortie « mes compétences » : un document à télécharger seulement, ou aussi un objet gardé dans le dossier que les autres modules liront plus tard ?
- **Q3** Sens large : motivations et vision à moyen et long terme dans la **même liste** que les compétences, ou dans un bloc voisin « Ce qui vous anime » ?
- **Q4** Lexique : l'enrichir par quelques fiches (distinction savoir-faire, savoir-être, savoirs, comment défendre une compétence) ou garder la décision « pas de compétences dans le Lexique » ?
- **Q5** Niveau du poste : la personne le choisit-elle (ouvrier, employé, technicien, cadre, direction) ou l'outil le propose-t-il à partir des documents ?
- **Q6** Où ranger la phrase « défendre à l'oral » : dans l'outil seulement, ou aussi branchée vers la fiche d'entretien ?

## 6. Plan (à compléter après décisions)

Méthode : concept grossier, carte de faisabilité (verdict GO / NO GO), maquette détaillée, audit complet et verdict avant code (cas module neuf : vérification contre `LANGAGE_VISUEL_COMMUN.md` et `BRIQUES_COMMUNES.md`).

- [ ] `[effort : haut]` Messages de recherche chez d'autres plateformes : `docs/PROMPTS_AUTRES_IA_DECOUVRIR_COMPETENCES_2026-10-26.md` (fait, à lancer par Denis) puis rapporter les réponses dans un fichier du chantier.
- [ ] `[effort : haut]` Trancher Q1 à Q6.
- [ ] `[effort : haut]` Concept grossier puis carte de faisabilité (verdict).
- [ ] `[effort : haut]` Maquette détaillée.
- [ ] `[effort : haut]` Audit complet, inventaire GARDÉ / DÉPLACÉ / FUSIONNÉ / ENRICHI, verdict final, verdict mode nuit.
- [ ] Code (cases à écrire après la maquette).

Brique à vérifier avant code : fenêtre d'import CV partagée (dette B.1, composant du Bilan), « Votre candidature » (écran d'objectif unique, Lot 4), `data-barre-bas`, recherche (accueil et Lexique), mode sombre, entrée dans la Boîte à outils (retirée le 25/10/2026 par F11).
