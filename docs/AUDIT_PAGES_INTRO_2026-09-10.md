# Audit de fidélité des pages d'introduction (2026-09-10)

But : pour chaque module, vérifier si sa page d'introduction décrit ce que le
module fait **aujourd'hui**. Certaines intros ont été écrites avant que le
module existe, puis le module a évolué sans que l'intro suive.

Périmètre : **16 pages d'introduction** (toutes celles du code). Décision des
corrections = Denis.

> **2026-09-10 — CORRIGÉ.** Les 4 dérives de la section 2 sont corrigées et la
> section « Mes Repères » est ajoutée aux 3 intros qui ne l'avaient pas
> (Co-construire ma lettre, Préparer un entretien, Découvrir mes compétences) :
> toutes les intros de parcours ont maintenant le bloc. `npm test` 780 verts,
> checkLexique propre, rendu vérifié au navigateur (aucune erreur console).
> **2026-09-10 (suite) — tranchés.** Réserve §1 : l'intro « Analyser ma
> candidature » ne nomme plus « Les mots de votre CV » (« c'est le rôle d'un
> autre outil de l'application ») — plus aucune intro ne nomme un module
> voisin. Wording §4 : les 4 parcours « Mes documents » disent maintenant
> « Ce que ce **parcours** ne fait pas » (le mot de la carte, « Quatre
> parcours »).

---

## 1. Pages FIDÈLES (12)

| Module | Renderer | Vérifié contre |
|---|---|---|
| Analyser ma candidature | `htmlBilanIntro` (js/app.js:16926) | rapport + Atelier CV + ciblage structure : OK. **Réserve** ci-dessous. |
| Cohérence de mon dossier | `ctHtmlExplication` (modules/coherence-transversale/ui.js:192) | 3 documents, 3e facultatif, relance analyse, édition sur une page : OK |
| Reformuler et présenter mon CV | `_reformulerCvRendreIntro` (data/metiers.js:4647) | 2 versions proposées, passage surligné, sorties modèle/texte : OK |
| Préparer un entretien d'embauche | `_prepaEntretienRendreIntro` (data/metiers.js:7182) | CV + lettre facultative, voix, « ne corrige pas votre CV » présent : OK |
| Découvrir mes compétences | `pageDecouverteIntro` (data/metiers.js:7265) | 5 étapes Préparer/Assistant/Réponse/Compétences/Compléter : OK |
| Les mots de votre CV (ATS) | `pageIntroAts` (data/metiers.js:7389) | 4 listes de mots (resultatParser.js), détection texte caché : OK |
| Comparer mes pistes | `pageIntroAideDecision` (data/metiers.js:7687) | 2-3 pistes, encadré « À vérifier », « piste à approfondir » ≠ « métier choisi » : OK |
| Mes Repères | `_reperesRenduAccueil` (modules/reperes/index.js:1337) | 4 types, Regard Extérieur + Aller plus loin existent bien : OK |
| Mon Carnet | `_carnetRenduIntro` (modules/carnet/index.js:321) | note libre, titre auto, transformer en Repère (copie), dictée Windows+H : OK |
| Créer un nouveau CV | `pageCreerCv` (data/metiers.js:4722) | objectif → parcours → assistant → mise en forme : OK |
| Préparer ma lettre et mon entretien | `_prepLERendreIntro` (data/metiers.js:3775) | mode 'pret' : dépôt + relecture + extraction assistant + vérification (structurerTexteExistant) : OK |
| Mettre à jour mon CV | `_majCvRendreIntro` (data/metiers.js:3859) | mode 'maj' : dépôt + extraction + arrivée directe en correction champ par champ : OK |

### Réserve sur « Analyser ma candidature »
Dans « Ce que ce module ne fait pas », l'intro **nomme un autre module** :
« c'est un autre outil de l'application, "Les mots de votre CV" ». C'est une
désambiguïsation (pas une recommandation), mais ça enfreint la règle
« une intro ne parle que de son module » que tu as rappelée. **À trancher** :
reformuler sans nommer (« un autre outil compare le vocabulaire à une offre »)
ou garder.

---

## 2. Pages qui ONT DÉRIVÉ (4)

### A. Regard recruteur — `pageIntroRegardRecruteur` (data/metiers.js:7459)
**Dérive importante — un mode d'entrée entier est invisible.**
- Le module a un **« Mode texte seul »** complet : on colle le texte du CV au
  lieu d'une image, et 4 des 6 parties de la lecture restent disponibles
  (`data-rr-mode-texte`, `etat.modeTexte`, bandeau « Lecture sur le texte
  seul : 4 parties »). L'intro décrit **uniquement** le chemin image
  (« Vous préparez une image de votre CV », « Vous masquez sur l'image, avec
  des rectangles »). Rien ne dit qu'on peut se passer d'image.
- Le trait fondateur **« ne modifie jamais le CV »** (décision de clôture,
  option A) n'est **pas** écrit noir sur blanc, alors qu'il l'est chez
  Reformuler, Cohérence et Préparer un entretien. « Ce que ce module ne fait
  pas » liste « pas une note », « pas un entretien en direct » mais pas ça.

### B. Comprendre le cadre — `pageIntroSeTenirInforme` (data/metiers.js:7536)
- **Fonction promise qui n'existe pas : « Imprimer une synthèse ».** Citée
  deux fois (« à montrer à une personne ou à imprimer avant un rendez-vous » ;
  « Imprimer une synthèse pour la préparer avant un rendez-vous »). Aucune
  fonction d'impression ni de synthèse dans `modules/comprendre-le-cadre/`
  (grep `imprim` / `synthèse` / `print` = 0 résultat).
- **Rayon oublié dans l'énumération.** L'intro liste les rayons (« l'emploi et
  les contrats, la formation… les moins de 26 ans, le handicap… ») mais **omet
  le rayon seniors** (`{ r: 'seniors' }`, titre « Travailler après 50 ans et
  retraite », question « J'ai plus de 50 ans, je pense à ma fin de carrière ou
  à la retraite »), qui existe bien dans le module.
- Non touché : l'encart `_introBlocComplementariteChiffres()` (ta zone).

### C. Co-construire ma lettre de motivation — `_coLettreRendreIntro` (data/metiers.js:3275)
- **Fausse promesse.** « Ce que vous pourrez faire ensuite » dit : « Garder
  aussi… les questions d'entretien et les pistes de réponse que l'assistant
  ajoute à la fin de l'échange. » Le nouveau prompt `prompts/lettre-co.md`
  (ligne 94) dit l'inverse : « aucun conseil de préparation d'entretien,
  aucune "question piège" : ce n'est pas le rôle de cette séance. » → cette
  ligne doit sauter.
- **Fonctions récentes non mentionnées.** « Ce que vous pourrez faire ensuite »
  ne cite que « lettre au format Word (DOCX) ». Depuis L1 étape 10, le module
  offre aussi une **version courte** (« Copier la version courte ») et un
  bouton **Aperçu / Imprimer**.

### D. Lexique — `_lexiqueRenduIntro` (modules/lexique/index.js:578)
- **Description du Mode Livre périmée.** L'intro : « Un Mode Livre affiche
  l'ensemble des fiches **classées par domaine**. » Depuis la refonte du
  2026-09-09, le Mode Livre est **une seule liste A→Z** de toutes les fiches
  (« toutes les fiches, de A à Z ») ; le classement par domaine est devenu une
  entrée séparée, **« Parcourir par domaine »**. La phrase mélange les deux
  écrans.

---

## 3. Noté, PAS corrigé (zone Denis)

- **Comprendre les chiffres** — `pageIntroComprendreLesChiffres`
  (data/metiers.js:7621). Tu avances dessus depuis un autre PC. Je n'audite
  pas `modules/comprendre-les-chiffres/` et je n'y touche pas.

---

## 4. Transversal (harmonisation, décision Denis)

- **Section « Mes Repères » dans l'intro** : présente dans Analyser ma
  candidature, Cohérence, Reformuler, Créer un CV, MAJ CV, Préparer ma lettre,
  ATS, Comparer, Comprendre le cadre. Absente de : Co-construire ma lettre,
  Préparer un entretien, Découvrir mes compétences. À harmoniser (toutes / une
  règle claire).
- **Wording** : « ce mode ne fait pas » (Créer CV, MAJ CV, Reformuler, Préparer
  ma lettre) vs « ce module ne fait pas » (partout ailleurs). Les 4 parcours
  « Mes documents » sont des modes d'un même ensemble → « mode » est
  volontaire, mais à confirmer.
