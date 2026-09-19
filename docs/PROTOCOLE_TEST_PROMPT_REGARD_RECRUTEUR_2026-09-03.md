# Protocole de test - Prompt Regard recruteur

> Document opérationnel. Il rend exécutable la validation du prompt `prompts/regard-recruteur.md`
> sur de vrais CV, avant toute écriture du parser et des écrans.
> Le prompt reste **figé** pendant toute une passe de test : on ne change jamais le prompt et le
> corpus en même temps.
>
> Références : `prompts/regard-recruteur.md`, `docs/CHANTIER_REGARD_RECRUTEUR_SCHEMA_SORTIE_2026-09-03.md`
> (le schéma que la sortie doit respecter), `docs/PROTOCOLE_TEST_PROMPT1_BILAN_CANDIDATURE.md` (même logique).

---

## 1. Sélection des CV de test

**Règle non négociable - anonymisation avant tout envoi.** Le prompt est collé vers un assistant
externe sans compte maîtrisé : toute donnée collée quitte définitivement notre périmètre.
- En **mode image** : masquer sur l'image, avec des rectangles pleins, le nom, le prénom, la photo,
  l'adresse, le téléphone, l'e-mail, **avant** de la joindre (exactement ce que le module demandera
  à la personne).
- En **mode texte** : retirer ou remplacer nom, coordonnées, employeurs identifiables.
- Ne jamais tester avec le CV d'une personne réelle identifiable sans son accord explicite pour cet usage.

**Corpus de référence fixe.** Une fois les CV choisis, ils ne changent plus d'une version de prompt
à l'autre (section 6). Changer le prompt et le corpus ensemble rend toute comparaison inexploitable.

**Origine des CV.** Par ordre de préférence : CV réels anonymisés de bénéficiaires ayant donné leur
accord ; à défaut, CV construits à la main mais **réalistes** (pas de profil caricatural conçu pour
« faire réussir » ou « faire échouer » artificiellement le test). Pour le mode image, il faut de
vraies mises en page (une exportée depuis un traitement de texte, une capture d'écran).

---

## 2. Composition du premier tour de test

**6 cas pour le tour 1**, choisis pour croiser les usages les plus fréquents et les points de
vigilance propres à ce module :

1. **Cas nominal (mode image)** - CV complet d'une page, offre fournie, entreprise + site fournis.
   Fonctionnement de référence : les 6 axes, la synthèse d'ouverture, au moins 5 questions liées au CV,
   un JSON strictement valide.
2. **CV court / début de parcours (mode image)** - une seule expérience, quelques lignes.
   Vérifie `cvCourt: true` + `messageCvCourt`, **aucune invention** sur les `constat` / `piste`,
   `positif` quand même à 2 points minimum, les axes sans matière passés à `afficher: false`.
3. **CV « registre associatif vers entreprise privée »** - vocabulaire de l'action sociale, offre
   dans le privé. Vérifie l'axe `message` point « registre de langage » : mots réellement cités du CV
   + une reformulation concrète ; et le **rappel obligatoire** qu'aucune expérience ne vaut moins
   qu'une autre, qu'un parcours varié est une force.
4. **CV de deux pages, dense en bas (mode image, 2 images jointes)** - Vérifie que les **deux pages
   sont lues**, l'axe `presentation` (densité, longueur), l'axe `premiere-lecture` (ce qui est vu
   d'abord, ce qui risque d'être parcouru vite).
5. **CV pour un métier technique / informatique** - outils nommés de façon vague (« logiciel de
   gestion », « outils bureautiques »), pas de chiffres. Vérifie l'**adaptation au secteur**
   (le prompt attend chiffres, résultats, certifications, outils précis) et l'axe `message` point
   « logiciels et outils que vous nommez ».
6. **Mode texte** - le CV du cas 1, collé en texte au lieu d'images. Vérifie : `presentation` et
   `couleurs` ont `afficher: false` et `points: []` ; **4 axes** affichés ; `premiere-lecture`
   reformulé pour le texte (« en parcourant vite le texte... ») ; **aucun avis sur la mise en forme,
   les colonnes, les couleurs**.

**Extension** (si le tour 1 ne révèle aucune erreur réelle - section 4) :
7. **CV inexploitable** - texte charabia, ou image floue / photo d'écran illisible. Attendu :
   réponse = **uniquement** le petit bloc `{ "analyseImpossible": true, "messageAnalyseImpossible": "..." }`.
8. **CV « objectif stage » pour une offre en poste** - le CV dit « recherche un stage », l'offre est
   un contrat. Attendu : un point dans l'axe `coherence` (« Emploi ou stage ? »), nommé clairement.
9. **Entreprise indiquée mais SANS site** (`{SITE_ENTREPRISE_FOURNI}` = `non`). Attendu : l'axe
   `couleurs` a **seulement** le point 1 (« Combien de couleurs ») ; aucun avis sur les codes de
   l'entreprise.
10. **CV « trop large »** - 8 à 10 expériences très variées, aucune mise en avant. Attendu : axe
    `message` point « quelles expériences vous mettez en avant » avec la piste « remonter 3-4
    expériences, regrouper le reste » + le rappel « capacité d'adaptation, à assumer ».

Si le tour 1 révèle une ou plusieurs erreurs réelles : traiter d'abord la décision de modification
(section 5) avant d'élargir le corpus.

---

## 3. Grille d'évaluation par test

Sept critères, notés `Conforme` / `Partiel` / `Non conforme`.

| Critère | Ce qui est vérifié |
|---|---|
| **Ancrage sur CE CV** | Chaque `constat` et chaque `origine` renvoie à un élément réel et identifiable du CV, jamais à une généralité interchangeable. |
| **Aucun verdict, aucun jugement** | Pas de score / note / pourcentage / jauge / « niveau de certitude » ; pas de « bon / mauvais / faible / convaincant / beau / moche / moderne / élégant » ; aucun diagnostic sur la personne ; l'absence du nom, de la photo ou des coordonnées **n'est jamais signalée**. |
| **Doutes formulés en questions** | Chaque doute est au conditionnel, comme une question ou un point à vérifier, jamais un reproche. Le sujet est le document, pas la personne. |
| **Aiguillage respecté** | Un même élément apparaît dans **un seul** endroit : dates/titre/accroche/stage → `coherence` ; registre/logiciels/ordre des expériences/loisirs/ciblage → `message` ; page/densité/police → `presentation` ; couleurs → `couleurs` ; question d'oral → `questionsLieesAuCv`. Aucun doublon. |
| **Structure du JSON** | Parse sans erreur. **Exactement 6 axes**, dans l'ordre `positif, coherence, message, premiere-lecture, presentation, couleurs`. `premiere-lecture` = exactement 1 point. `positif` >= 2 points. Chaque question a un `origine` non vide. En mode texte : `presentation` et `couleurs` en `afficher: false`. Le point « codes de l'entreprise » de `couleurs` présent **seulement si** le site est fourni. Les 3 regards ne sont **jamais** mentionnés dans la sortie. |
| **Adaptation au secteur** | La lecture change réellement selon le milieu visé (un CV technique et un CV associatif ne produisent pas les mêmes attentes). |
| **Utilité réelle** | Une personne qui lit sait concrètement quoi préparer pour l'entretien et quoi retravailler sur son CV. |

### Fiche de test type (à dupliquer pour chaque test)

```
CV : [identifiant anonymisé]     Date : [date]     Assistant : [ChatGPT / Claude / Gemini / Copilot / ...]
Mode : [image / texte]     Nb images : [1-3]
Contexte fourni : poste [oui/non] · offre [oui/non] · entreprise [oui/non] · site [oui/non] · type de structure [...]
Cas testé : [numéro/nom, section 2]

| Critère                        | Conforme / Partiel / Non conforme | Écart constaté |
|--------------------------------|-----------------------------------|----------------|
| Ancrage sur CE CV              |                                   |                |
| Aucun verdict, aucun jugement  |                                   |                |
| Doutes formulés en questions   |                                   |                |
| Aiguillage respecté            |                                   |                |
| Structure du JSON              |                                   |                |
| Adaptation au secteur          |                                   |                |
| Utilité réelle                 |                                   |                |

Vérifications ciblées :
[ ] 6 axes exactement, dans l'ordre ; premiere-lecture = 1 point ; positif >= 2
[ ] Chaque question de questionsLieesAuCv a un origine ancré dans le CV (pas de question générique type "parlez-moi d'un échec" sans motif)
[ ] Aucun doublon : les dates ne sont pas à la fois dans coherence ET dans les questions
[ ] Mode texte -> presentation et couleurs en afficher:false, aucun avis sur la forme
[ ] Site non fourni -> pas de point "codes de l'entreprise"
[ ] CV court -> cvCourt:true, aucune invention, positif quand même rempli
[ ] Les 3 regards (recruteur/DRH/conseiller) n'apparaissent nulle part dans la réponse
[ ] Aucun mot interdit (manque, faible, insuffisant, problème, défaut, beau, moderne...) ni score

Verdict global : Réussite / Réussite avec réserve / Échec
Erreur réelle détectée : Oui / Non - si oui, quelle règle explicite du prompt est violée : [citation de la règle]
```

---

## 4. Distinguer une erreur réelle d'une différence d'interprétation

Un seul test face à un résultat qui semble décevant :

**Le prompt formule-t-il, pour ce point précis, une règle explicite, un test binaire ou une
structure obligatoire ?**

- **Oui, et la sortie la contredit → erreur réelle.** Exemples : un score ou un « niveau de
  certitude » malgré la règle absolue 1 ; une question sans `origine` malgré la règle obligatoire ;
  7 axes au lieu de 6 ; `premiere-lecture` avec 3 points ; `presentation` rempli en mode texte ;
  l'absence de coordonnées signalée ; un JSON qui ne parse pas ; les 3 regards cités dans la réponse.
- **Non, le prompt laisse la place au jugement → différence d'interprétation légitime, à ne pas
  corriger.** Exemples : le choix des 2 à 5 observations de l'axe `positif` ; la formulation exacte
  d'une `piste` ; le fait de retenir 4 ou 6 points dans `message` ; l'ordre exact des questions
  entre deux d'importance voisine.

**Instabilité inter-exécutions.** Rejouer deux fois le même CV inchangé produit légitimement des
formulations différentes. Ce n'est un problème à consigner que si la divergence :
- fait apparaître ou disparaître le point « Emploi ou stage ? » de l'axe `coherence` (potentiellement éliminatoire),
- fait basculer `analyseImpossible` ou `cvCourt` d'une exécution à l'autre sur le même CV,
- change le nombre d'axes ou casse la structure du JSON.
Une variation de formulation, ou 4 questions au lieu de 5, ne l'est pas.

---

## 5. Critère de décision - quand modifier le prompt

Une modification n'est engagée que si :
- **Récurrence** : la même erreur réelle (section 4) apparaît sur au moins **2 CV différents**.
- **Gravité disproportionnée** : une seule occurrence suffit si elle touche une règle absolue
  (score/verdict, coordonnées signalées, JSON invalide, 3 regards visibles).
- **Bascule** : une instabilité inter-exécutions du type décrit en section 4, même sur un seul CV.

Dans tous les autres cas : consigner l'écart dans la fiche, ne pas modifier le prompt. Toute
modification retenue reste **ciblée sur la règle concernée**, jamais une réécriture large.

---

## 6. Comparaison entre deux versions du prompt

1. Même corpus exact que la version précédente (section 1).
2. Grille complète (section 3) sur chaque CV, pour la nouvelle version.
3. Comparer côte à côte, critère par critère.
4. **Une nouvelle version n'est adoptée que si elle égale ou améliore chaque critère, sans en
   dégrader aucun.** Toute régression est explicitement assumée et justifiée, jamais silencieuse.

---

## 7. Déroulé pratique

1. Anonymiser le CV (section 1). En mode image : masquer nom, photo, coordonnées sur l'image.
2. Remplacer les placeholders du prompt par les données du cas :
   `{MODE_ANALYSE}` (`image` ou `texte`), `{CV_TEXTE}` (mode texte seulement),
   `{POSTE_VISE}`, `{ENTREPRISE}`, `{OFFRE}`, `{TYPE_STRUCTURE}`,
   `{SITE_ENTREPRISE_FOURNI}` (`oui` / `non`), `{COULEURS_ENTREPRISE}`.
3. Coller le prompt dans l'assistant choisi. En mode image : joindre 1 à 3 images du CV masquées.
4. Récupérer la réponse. Vérifier d'abord qu'elle est **uniquement** un bloc JSON (rien avant, rien après).
5. Coller le JSON dans un vérificateur (jsonlint ou équivalent) : parse-t-il sans erreur ?
6. Remplir la fiche de test (section 3) à partir de la réponse.
7. Appliquer le test de la section 4 sur chaque écart.
8. Tour terminé : appliquer la section 5 pour décider s'il faut modifier le prompt.

À partir de maintenant, toute évolution de `prompts/regard-recruteur.md` passe par une fiche de test
et une décision motivée par la section 5.
