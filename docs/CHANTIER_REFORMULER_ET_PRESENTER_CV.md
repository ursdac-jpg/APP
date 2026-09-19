# Chantier « Reformuler et présenter mon CV » (4e tuile de « Mes documents »)

> Ouvert le 2026-09-07. **Mode A** (décision d'architecture + d'UX). Conception
> menée avec Denis, bloc par bloc. Ce document est l'état **figé** de la
> conception au 2026-09-07 : le parcours, les décisions actées, la liste fermée
> du prompt. La construction n'a pas commencé.
>
> Maquette : `docs/MAQUETTE_REFORMULER_ET_PRESENTER_CV_2026-09-07.html`.
> Prompt : `prompts/reformuler-cv.md`.

---

## 1. Le besoin

Une personne arrive avec **son CV, déjà complet et à jour**. Toutes les
informations y sont. Le problème est la **présentation** : formulation pauvre,
rubriques mal rangées, vocabulaire générique. Elle ne veut ni retravailler le
contenu, ni repartir de zéro, ni un avis critique. Elle veut le **remettre en
forme proprement**, avec le bon ton et un vocabulaire de compétences adapté au
poste visé, puis le récupérer dans un modèle ou pour le mettre en forme
ailleurs (Canva, traitement de texte).

Aujourd'hui ce public part sur un assistant en ligne en saisie libre. L'intérêt
d'APP : le **prompt est cadré**, il préserve l'authenticité (rien d'inventé,
rien de supprimé) tout en professionnalisant.

## 2. Pourquoi une 4e tuile et pas autre chose

- La tuile « **Mettre à jour mon CV** » (`_prepLEMode = 'maj'`) fait déjà 80 % du
  tuyau : dépôt du CV, extraction, correction, choix de la présentation, sortie
  modèle interne **ou** copier le texte. Mais elle fait de l'**extraction
  fidèle** et de la **correction de contenu**, pas de la reformulation.
- L'écart réel avec « Mettre à jour » tient en deux points : (a) l'**intention**
  (« mon contenu est bon, je n'y touche pas ») et le message rassurant qui va
  avec ; (b) le **prompt** (reformuler pour l'impact sans rien ajouter, adapter
  le vocabulaire des compétences au poste).
- **Option retenue : A.** Une 4e tuile légère qui **réutilise le tuyau** de
  « Mettre à jour mon CV » (page dépliante partagée, briques de dépôt, de
  contexte, de choix d'assistant, de collage, sorties du Composeur), avec sa
  propre page d'intro et son propre prompt. Un `_prepLEMode` supplémentaire
  (par ex. `'reformuler'`).
- Écarté : un module indépendant (multiplie la confusion « lequel j'utilise ? »,
  cf. raisonnement de fusion ATS dans `docs/IDEES_A_RECLASSER.md`) ; une simple
  bascule dans « Mettre à jour » (alourdit une tuile déjà dense, noie le
  cadrage « on ne touche à rien »).

## 3. Le parcours figé

```
Carte « Mes documents »  (4 tuiles, aiguillage dans la bulle « i »)
  -> tuile « Reformuler et présenter mon CV »  (route dédiée, _prepLEMode = 'reformuler')
  -> Page d'intro  (htmlPageIntroModuleParcours, contenu = maquette vue 2)
  -> Page dépliante « Préparer »  (htmlPreparerLettreEntretienDepliante réutilisée)
       1. Votre CV                       -> dépôt fichier / coller / photo-scan (repli modale)
       2. Relire, vérifier, masquer      -> obligatoire (htmlVerificationDocument / relectureConfidentialite)
       3. Le poste ou le domaine visé    -> NÉCESSAIRE ici (bilanCorpsCiblageOffreHTML), entreprise/offre facultatifs
  -> Choix de l'assistant  (htmlChoixAssistantBilanCorps)
  -> Bandeau de transition + envoi  (htmlBanniereTransitionIA)  -- UN SEUL aller-retour
  -> Coller la réponse  (htmlCollageInstantane)
  -> Écran « Vérifier », en deux temps :
       5a. Choisir entre les DEUX propositions renvoyées par l'assistant
       5b. Vérifier la proposition retenue  (marqueurs, intitulés d'origine, champs éditables,
           résumé « ce qui a changé » en haut)
  -> Les deux sorties :
       - Remplir un de nos modèles (Composeur PDF / Word, écran « La mise en page » existant)
       - Récupérer le texte structuré (à copier pour Canva ou ailleurs)
  -> Enchaînement possible sur « Préparer ma lettre et mon entretien », sans ressaisie.
```

Barre d'étapes : `Préparer > Assistant > Réponse > Vérifier > Mise en forme`.
Pas de barre d'étapes sur la page d'intro (règle B.5).

## 4. Décisions actées (2026-09-07)

| Sujet | Décision |
|---|---|
| Nom de la tuile | « Reformuler et présenter mon CV » |
| Icône | `bi-brush` (mettre en valeur, pas de visage) |
| Place dans « Mes documents » | 2e position : après « Créer un nouveau CV », avant « Mettre à jour mon CV » |
| Aiguillage | 4 lignes dans la bulle « i » de la carte (voir maquette vue 1), pas en permanence à l'écran |
| Poste / domaine visé | **Nécessaire** : bouton d'envoi bloqué tant que le champ est vide |
| Nombre d'allers-retours assistant | **Un seul** |
| Nombre de propositions renvoyées | **Deux** : « la plus fidèle » + « autre version ». Les deux visibles, la personne choisit. (Passé de 3 à 2 le 2026-09-07 : choix plus simple pour le public, réponse plus courte à recoller, moins de risque de troncature.) |
| Proposition 1 « la plus fidèle » | Longueur et volume **conservés** (le CV ne rétrécit pas), ordre des expériences anti-chronologique conservé, aucune expérience coupée. Seuls changent mots, ton, ponctuation, ordre des puces internes, intitulés de compétences. |
| Proposition 2 « autre version » | Nettement différente : longueur, accent, organisation libres. Toutes les expériences/dates/diplômes y figurent quand même, rien d'inventé. Ligne `[PISTE : ...]` en tête. |
| Vocabulaire des compétences | Tiré de l'**offre visée** si fournie ; sinon vocabulaire professionnel neutre, jamais un jargon de secteur inventé. Chaque compétence reste adossée à une tâche présente dans le CV. Jamais de montée en niveau (exécuté ≠ piloté). |
| Marqueurs `[À PRÉCISER]` | 5 maximum par proposition. Présents dans les deux propositions ; l'écran ne les affiche que pour la proposition retenue. Jamais sur la vie personnelle / les périodes sans emploi. Retirés en silence à l'export s'ils restent vides (jamais de crochet visible dans le CV final). |
| Balise `[ORIGINE : ...]` | Après chaque intitulé de compétence reformulé, et après une accroche proposée. Affichée **visible par défaut** sur l'écran « Vérifier » (pas repliée). |
| Résumé « ce qui a changé » | En haut de l'écran « Vérifier », 3-4 lignes simples (nombre de formulations reprises, d'intitulés rapprochés, de précisions demandées). |
| Bouton « Repasser par l'assistant » | **Retiré.** Avec deux propositions au choix, une reprise cachée n'a plus de sens ; sinon « Tout recommencer » depuis « Préparer ». |
| Garde-fou « ce n'est pas un CV » | Le prompt répond `[PAS_UN_CV : ...]` et rien d'autre ; l'écran affiche un message clair, aucun CV fabriqué. |
| Sorties (V1) | Les deux : modèle interne (Composeur PDF / Word) **et** texte structuré à copier. |
| Comparaison avec l'original | Simple panneau « Voir mon CV d'origine » (texte brut déposé), pas un diff riche. |

### Points a / b / c / d figés sur recommandation de Claude (à confirmer au 1er test réel)

- **a. Accroche créée quand le CV n'en a pas** : autorisée, uniquement à partir
  de faits déjà présents, signalée par `[ORIGINE : accroche proposée..., à vérifier]`.
- **b. Deux balises** (`[À PRÉCISER]` + `[ORIGINE]`) : conservées. Parsing un peu
  plus lourd, mais donne proprement le « voir les intitulés d'origine ».
- **c. Rubrique Compétences créée quand le CV n'en a pas** : autorisée, 3 à 6
  intitulés, chacun tracé à une tâche décrite dans une expérience.
- **d. Plafond de marqueurs** : 5 par proposition.

### Précisions du 2026-09-07 (début de la construction, étape 1)

- **Page « Assistant » + « Réponse » : réutilisation stricte de l'existant.**
  Aucun écran neuf. On reprend à l'identique `htmlChoixAssistantBilanCorps()` +
  `htmlCollageInstantane()` / `activerCollageInstantane()`, exactement comme
  Cohérence de mon dossier et Co-construire ma lettre (bouton « Coller la
  réponse » rectangulaire compris). Objectif : la même cohérence partout ;
  toute différence sur cette page raterait le but.
- **Barre d'étapes visuelle : une icône par étape** (comme les autres barres).
  `REFORMULER_CV_NAV_ETAPES` : Préparer 📝, Assistant 💬, Réponse 📥,
  Vérifier 🔍, Mise en forme 📄.
- **Écran « Choisir une proposition » (5a)** : le « Déplier » de chaque carte est
  un **vrai bouton** (`.btn`), pas un lien texte, pour que la personne voie
  qu'elle peut ouvrir la version en entier.
- **Aucune icône avec des yeux / un visage.** Le pictogramme « œil » de
  « Voir mon CV d'origine » (👁️) est remplacé par un pictogramme de document
  (📄). Règle CLAUDE.md, à respecter partout dans le module.

### Étape 3 faite le 2026-09-07 (page « Préparer »)

- **Bloc 3** du mode `'reformuler'` : « Le poste ou le domaine que vous
  visez », **nécessaire** (au moins l'un des deux : `Poste visé` /
  `Domaine ou secteur`). Bouton « Choisir mon assistant » bloqué tant que CV
  non déposé/relu OU poste/domaine vide. Stocké dans
  `dossier.rechercheCandidature.reformulerPoste` / `.reformulerSecteur`
  (champs dédiés, lus par le seul prompt reformuler).
- **Bloc 4** « L'offre visée » : inchangé (facultatif), texte d'intro adapté
  pour `'reformuler'` (le vocabulaire des compétences s'aligne sur l'offre).
- **`dossier.modeCreation` : décision prise.** `'reformuler'` garde les
  sémantiques `'maj'` pour `modeCreation` ; tout le branchement propre au
  module passe par `_prepLEMode` / la route `reformuler-cv`, jamais une 4e
  valeur de `modeCreation` (éviter d'auditer les ~40 lecteurs).
- Après « Choisir mon assistant », le mode `'reformuler'` ne passe **pas**
  par `structurerTexteExistant()` (extraction-cv.md + parcours guidé) :
  écran d'attente `_prepLEEcran === 'assistant'` en place, remplacé à
  l'étape 4 par choix de l'assistant + `reformuler-cv.md` + collage +
  écran « Vérifier ».
- **Correctif bulle « i » de la carte « Mes documents »** (retour Denis :
  texte trop chargé, non défilable au toucher) : aiguillage raccourci à
  4 lignes courtes ; `positionner()` (`data/metiers.js`) borne désormais la
  hauteur de la bulle à la place réellement disponible et l'ancre en haut
  de l'écran quand il n'y a pas assez de place dessous, pour qu'elle reste
  toujours entièrement visible et défilable (CSS : `overscroll-behavior:
  contain`).

### Étape 4 faite le 2026-09-07 (échange avec l'assistant)

- **Prompt** : `prompts/reformuler-cv.md` enregistré dans
  `FICHIERS_PROMPTS_EXTERNES` (`js/app.js`), chargé au démarrage, repli
  générique dans `promptParDefaut`. `_reformulerCvComposerPrompt()` =
  `promptCache('reformuler-cv', <bloc contexte>)` où le bloc contexte porte
  `POSTE OU DOMAINE VISÉ` (poste + secteur du bloc 3), `OFFRE VISÉE`
  (`rechercheCandidature.lienOffre` ou « Non fournie. ») et
  `CV DE LA PERSONNE` (`_prepLEEtat.cvTexte`, déjà relu/masqué).
- **Aiguillage bulle « i » : option A appliquée** (décision Denis) — une
  phrase d'intro + une ligne « quand le choisir » par parcours, structure
  identique aux autres cartes, nom du module cité une seule fois. Les 3
  infobulles existantes ont été réécrites en conséquence.
- **Aucune fenêtre modale, et une seule page pour l'échange** (décisions
  Denis 2026-09-07) : ce module va plus loin que Cohérence et Co-lettre,
  qui avaient gardé la fenêtre « Avant de continuer vers X »
  (`ouvrirFenetreAssistantIA`). Ici : au clic sur un assistant, le prompt
  est copié (synchrone) et l'état de transition posé ; **pas de fenêtre**.
  Choix de l'assistant **et** collage de la réponse vivent sur **une seule
  page** `_prepLEEcran === 'echange'` (`_reformulerCvRendreEchange()`), en
  deux blocs dépliants comme la page « Préparer » : bloc 1 « Choisissez
  votre assistant », bloc 2 « Collez la réponse » qui se débloque dès qu'un
  assistant est choisi (bloc 1 se replie alors en résumé + « Choisir un
  autre assistant »). La bannière partagée `htmlBanniereTransitionIA` gère
  le décompte, l'ouverture de l'onglet et le repli si le navigateur bloque.
- Pages du module désormais : intro → `depot` (Préparer dépliante) →
  `echange` (1 page) → `verifier`. Le collage stocke la réponse brute dans
  `_prepLEEtat.reponseAssistant` ; « Continuer » mène à l'écran `verifier`
  (encore un placeholder : parsing + choix des 2 propositions + marqueurs =
  **étape 5**).

### Étape 5 faite le 2026-09-07 (parsing + écran « Vérifier »)

- **Parseur** `_reformulerCvParserReponse(brut)` (`data/metiers.js`),
  tolérant comme `_comprendreLeCadreParserReponse1` : préambule/postambule
  ignorés, accents facultatifs sur les balises. Renvoie
  `{ pasUnCv: '<phrase>' }` si `[PAS_UN_CV : …]`, sinon
  `{ propositions: [{texte, piste}, …] }` (coupe sur
  `=== PROPOSITION n : … ===`, 1 ou 2 entrées). Balises inline gérées :
  `[À PRÉCISER : q]`, `[ORIGINE : mots]`.
- **Écran `verifier` en un seul écran, deux temps** (pas de page en plus) :
  - **5a — choisir une version** : deux cartes (« La plus proche de votre
    CV » / « Autre version » avec sa ligne `[PISTE]`), aperçu tronqué +
    « Déplier », bouton « Voir mon CV d'origine » (panneau `<details>` avec
    `_prepLEEtat.cvTexte` brut). Les marqueurs y sont de simples surlignages
    jaunes. Alerte si moins de 2 propositions trouvées.
  - **5b — vérifier la version retenue** : résumé « Ce qui a changé »
    (`_reformulerCvResumeChangements` : ordre des rubriques, nombre
    d'intitulés `[ORIGINE]`, nombre de marqueurs), corps rendu rubrique par
    rubrique (`_reformulerCvRenduCorpsProposition`), **marqueurs
    `[À PRÉCISER]` = champs jaunes éditables**, `[ORIGINE]` = annotation
    grise visible par défaut, bouton « Modifier le texte » (bascule vers un
    `<textarea>` du texte final), « Revenir au choix des deux versions ».
  - **Réponses aux marqueurs mémorisées PAR proposition**
    (`_prepLEEtat.reponsesMarqueurs[propIndex][markerIdx]`) : l'index d'un
    marqueur ne veut pas dire la même chose d'une version à l'autre.
    Vérifié : passer de la version 1 à la 2 puis revenir ne mélange pas les
    réponses.
- **Texte final** `_reformulerCvTexteFinalProposition` : marqueur rempli →
  remplacé par la réponse ; marqueur vide → retiré silencieusement ;
  `[ORIGINE]` / `[PISTE]` retirés ; espaces/lignes nettoyés. Stocké dans
  `_prepLEEtat.cvReformuleFinal`, consommé par l'étape 6.
- CSS : bloc `« Reformuler et présenter mon CV » : écran Vérifier` dans
  `css/style.css` (classes `.reformuler-*`, theme-aware clair + sombre).
- Écran `sorties` = placeholder (les deux sorties = **étape 6**).

### Décision Denis 2026-09-07 (fin de journée) : PLUS DE QUESTIONS / MARQUEURS

Denis revient sur la décision « marqueurs `[À PRÉCISER]` » des premières
heures. **Ce module ne pose aucune question et ne demande aucune
précision.** Il fait une seule chose : mettre à jour le **langage** et le
**vocabulaire attendu** (poste, entreprise, secteur) d'un CV déjà bon, sans
rien ajouter ni corriger sur le fond (chiffres, dates, contenu : d'autres
modules, plus anciens, font ça — on n'empiète pas). L'assistant renvoie
**deux versions dans la même réponse** : « la plus proche de votre CV » et
« notre version recommandée » (retravaillée plus en profondeur sur la
forme). La personne choisit entre les deux. Un seul aller-retour.

Appliqué :
- **`prompts/reformuler-cv.md`** : section 7 « marqueurs » supprimée ;
  toute mention de `[À PRÉCISER]` retirée ; PROPOSITION 2 renommée
  « notre version recommandée » ; balises autorisées = `[ORIGINE]` +
  `[PISTE]` (+ `[PAS_UN_CV]`), « aucune demande de précision ».
- **`data/metiers.js`** : `_reformulerCvRenduCorpsProposition(texte)`
  (plus de branche éditable / `reponses`) ; toute balise `[À PRÉCISER]`
  parasite est **retirée en silence** ; `reponsesMarqueurs` supprimé de
  `_prepLEEtat` ; `_reformulerCvResumeChangements` ne parle plus de
  précisions, ajoute « le fond n'a pas changé » ; `_reformulerCvTexteFinalProposition(texte)`
  ne fait plus que retirer les balises. Écran 5b : plus de champs jaunes ;
  « Modifier le texte » (édition libre par la personne) conservé.
- CSS `.reformuler-marqueur*` retiré (mort).

### Étape 6 — 2026-09-07 : sortie « texte » faite, sortie « modèle » BLOQUÉE

- **Sortie « Récupérer le texte de mon CV » : FAITE.** Écran `sorties`
  (`_reformulerCvRendreSorties`), zone de texte (`.reformuler-textarea`,
  theme-aware) avec `_prepLEEtat.cvReformuleFinal` + bouton « Copier le
  texte » (`copierTexteVersPressePapier`). Aucune fenêtre. Pour Canva, un
  traitement de texte, une autre plateforme.
- **Sortie « Remplir un de nos modèles » : bouton désactivé, EN ATTENTE.**
  Option A (enchaîner sur `structurerTexteExistant` → pipeline « Mettre à
  jour ») a été **rejetée par Denis le 2026-09-07** : `structurerTexteExistant`
  ouvre la fenêtre modale `ouvrirAssistantDepotCV` (« Étape 3 · Analyse
  assistée »), or **aucune fenêtre n'est acceptée dans ce module**. Structurer
  un texte en champs pour un modèle passe aujourd'hui, dans toute l'appli,
  par ce wizard modal + l'écran de validation d'import (`ouvrirEcranValidationImport`),
  eux aussi des fenêtres. Le chantier « élimination des fenêtres de dépôt CV »
  ne les avait pas portés en pages.
- **À trancher pour débloquer la sortie « modèle »** :
  1. **Parseur déterministe** : lire le format contrôlé du prompt
     (`RUBRIQUE EN MAJ` + puces `-`) et remplir `dossier` sans assistant.
     Zéro fenêtre, zéro aller-retour. Fragile si l'assistant s'écarte du
     format ; l'identité (nom, tél.) manque souvent après masquage.
  2. **Structuration en pages** : porter `ouvrirAssistantDepotCV` étape 3-4
     + `ouvrirEcranValidationImport` en pages (réutiliser le patron
     `_reformulerCvRendreEchange` + `analyserReponseImport` + un écran de
     validation d'import routé). Chantier à part, pas trivial.
  3. **V1 = sortie texte seule**, sortie « modèle » plus tard.

### Étape 7 faite le 2026-09-07 (recherche + BRIQUES)

- **Recherche d'accueil** : entrée dans `MODULES_RECHERCHABLES`
  (`data/baseConnaissancesERIP.js`), `cible: 'carte:mesdocuments'` (comme
  les autres parcours CV : ouvre le panneau, la personne clique la tuile
  qui remet l'état à zéro). Mots-clés : « reformuler / présenter / mettre en
  forme / remettre au propre / rendre présentable mon CV », « cv mal
  présenté », « améliorer la formulation », etc. Vérifié : la recherche
  trouve le module sur toutes ces formulations.
- **Lexique** : rien à ajouter — ce module n'introduit aucun terme du monde
  du travail (c'est un outil, pas du vocabulaire).
- **`BRIQUES_COMMUNES.md`** : dette **B.10** ouverte — page unique « choix de
  l'assistant + collage » (`_reformulerCvRendreEchange`), à extraire en
  brique si un 2ᵉ module veut ce schéma « tout sur une page, zéro fenêtre »
  (et migrer Cohérence + Co-lettre dessus au passage).

### Sortie « Remplir un de nos modèles » faite le 2026-09-07 (parseur déterministe)

Option retenue (Denis : « attaque la sortie modèle maintenant », toujours
zéro fenêtre) : **structuration déterministe**, sans assistant, sans
fenêtre. Le format du prompt `reformuler-cv.md` est contrôlé (rubrique en
majuscules + puces `-`) : on le lit directement.

- `_reformulerCvTexteVersDossier(texte)` (`data/metiers.js`) : découpe en
  blocs de rubrique (`_REFORMULER_RUBRIQUES` : titre / accroche /
  expériences / formations / compétences / langues / loisirs /
  certifications / logiciels), puis best effort par bloc — en-tête
  d'expérience « Poste, Entreprise, 2019-2024 » → `{poste, entreprise,
  dateDebut, dateFin}`, puces → `missions`; formation → `{niveau:'',
  intitule, annee}`; etc.
- `_reformulerCvVersModele(texteFinal)` : applique à
  `dossier.{titreCV, ia.cv.profil, experiences, formations, competencesCV,
  langues, loisirs, certifications, logiciels}`, pose
  `modeCreation = 'maj'` + `cvAnalyse = true`, puis
  `naviguerVers('objectif')` — **exactement le point d'atterrissage du
  parcours « Mettre à jour » après structuration**, mais atteint sans le
  wizard modal. La personne vérifie et complète champ par champ
  (« Vos informations » pour l'identité, jamais transmise à l'assistant).
- Vérifié navigateur : parsing correct sur un CV type (2 expériences avec
  missions, formation, compétences, langue, logiciels), application au
  `dossier`, arrivée sur « Votre objectif », **aucune fenêtre**, 0 erreur
  console.
- **Limite assumée** : structuration best effort. Si l'assistant s'écarte
  du format, le résultat sera imparfait — la personne corrige à l'écran
  suivant, comme après une extraction assistée. L'identité n'est jamais
  remplie ici (masquée à la relecture), elle se saisit dans « Vos
  informations ».

### Reste avant clôture

- Test terrain (vrais CV, vrais assistants), vidéo si Denis en fait une.
- `TACHES_VALIDEES.md` : passer l'entrée `[À FAIRE]` en `[CLOS]`.

## 5. La liste fermée du prompt

Figée dans `prompts/reformuler-cv.md` (2026-09-07). Résumé des sections :

1. Rôle + ce que l'assistant reçoit (CV masqué, poste/domaine, offre facultative).
2. Principe non négociable : le fond ne change pas (rien d'ajouté, rien de
   supprimé, sens des phrases conservé, niveau de langue conservé).
3. Ce qu'il doit faire dans les deux versions (reformuler, intituler, harmoniser,
   corriger l'orthographe, poser les marqueurs).
4. Les deux versions : proposition 1 « la plus fidèle » (longueur conservée) ;
   proposition 2 « autre version » (libre, `[PISTE]` en tête).
5. Titre et accroche (reformulés s'ils existent ; proposés sinon, `[ORIGINE]`).
6. Vocabulaire des compétences (offre si fournie, sinon neutre ; adossé au CV ;
   pas de montée en niveau ; `[ORIGINE]` après chaque intitulé ; création
   possible si absente).
7. Marqueurs `[À PRÉCISER]` (5 max, faits professionnels imprécis uniquement,
   jamais la vie perso, jamais la réponse inventée).
8. Si ce n'est pas un CV : `[PAS_UN_CV : ...]` seul.
9. Ton (personne réelle, phrases courtes, aucun jugement, aucun conseil).
10. Format de sortie (deux blocs `=== PROPOSITION n : ... ===`, intitulés de
    rubrique en majuscules, seules balises autorisées, rien avant/après,
    français).

### Note sur le socle B.8

Le socle commun de `outils/veille.html` (dette B.8) est **spécifique à la
recherche web** (date du jour, recherche web obligatoire, ne jamais fabriquer
une URL / un numéro de texte). **Il ne s'applique pas ici** : ce prompt ne fait
pas de recherche web. Seul l'esprit anti-fabrication et le ton « écris pour une
personne réelle » sont repris, réécrits pour le contexte CV. Le prompt garde en
tête le préambule anti-injection standard (même patron que `prompts/extraction-cv.md`).

## 6. Ce qu'on réutilise sans le réécrire

| Brique | Source |
|---|---|
| Page dépliante « Préparer » | `htmlPreparerLettreEntretienDepliante` / `_prepLE*` (`data/metiers.js`) |
| Dépôt d'un document (Pattern A, inline + repli photo/scan) | `obtenirOuDeposerTexteCV()` / `ouvrirAssistantDepotCV()` |
| Relecture / masquage avant envoi | `htmlVerificationDocument()` + `modules/*/collecte/relectureConfidentialite.js` |
| Contexte offre / entreprise / type de structure | `bilanCorpsCiblageOffreHTML()` / `bilanCablerCiblageOffre()` / `bilanLireCiblageOffre()` (`data/metiers.js`) |
| Choix de l'assistant | `htmlChoixAssistantBilanCorps()` / `wireChoixAssistantBilanEtapes()` |
| Bandeau de transition | `htmlBanniereTransitionIA()` |
| Collage de la réponse | `htmlCollageInstantane()` + `activerCollageInstantane()` |
| Parsing de balises tolérant | patron `_comprendreLeCadreParserReponse1()` (`modules/comprendre-le-cadre/index.js`) : régex `[\s\S]*?`, tolère préambule/postambule, renvoie `null` si aucune balise |
| Sorties PDF / Word | Composeur + écran « La mise en page » existant |
| Page d'intro | `htmlPageIntroModuleParcours(config)` (`data/metiers.js`) |
| Barre d'étapes | `barreEtapesModule()` (`js/app.js`) |
| Source unique des tuiles | `MES_DOCUMENTS_PARCOURS` (`data/metiers.js`) |

**Vraiment neuf** : le prompt (`prompts/reformuler-cv.md`), l'écran « Vérifier »
en deux temps (choix entre 2 propositions + vérification avec marqueurs), la
tuile et sa page d'intro, le `_prepLEMode = 'reformuler'`, le parseur des balises
`[À PRÉCISER]` / `[ORIGINE]` / `[PISTE]` / `[PAS_UN_CV]`.

## 7. Séquence de construction (à venir, Mode B après validation)

Un commit par sous-étape, `npm test` + test navigateur clair/sombre à chaque.

1. **La tuile** : entrée dans `MES_DOCUMENTS_PARCOURS`, route, `_prepLEMode`
   supplémentaire, aiguillage 4 lignes dans la bulle « i ».
2. **La page d'intro** (`htmlPageIntroModuleParcours`, contenu = maquette vue 2).
3. **La page « Préparer »** : réutilisation de la page dépliante ; le bloc 3
   (poste / domaine) devient bloquant tant qu'il est vide.
4. **L'aller-retour assistant** : choix de l'assistant + composition du prompt
   (`prompts/reformuler-cv.md` + poste/domaine + offre si fournie + CV masqué) +
   collage de la réponse.
5. **Le parseur** : `=== PROPOSITION 1/2 ===`, `[PISTE]`, `[À PRÉCISER]`,
   `[ORIGINE]`, `[PAS_UN_CV]`. Tolérant (préambule, `< 2` propositions détecté →
   proposer de recoller la suite ou de recommencer).
6. **Écran « Vérifier » 5a** : deux cartes, aperçu + déplier, `[PISTE]` sur la 2,
   bouton « Voir mon CV d'origine », choix.
7. **Écran « Vérifier » 5b** : proposition retenue rendue rubrique par rubrique,
   marqueurs `[À PRÉCISER]` en champs éditables, `[ORIGINE]` visibles, champs
   modifiables, résumé « ce qui a changé » en haut. Marqueurs vides retirés à
   l'export.
8. **Les deux sorties** : branchement Composeur (PDF / Word) et texte structuré à
   copier.
9. **Recherche** : brancher la tuile dans la barre d'accueil
   (`rechercherBaseConnaissances()`) et le Lexique.
10. **Écrits de fin** : `TACHES_VALIDEES.md`, `BRIQUES_COMMUNES.md` (nouvelle
    brique « écran de choix + vérification de CV reformulé » si réutilisable),
    `LECONS_A_NE_PAS_REPRODUIRE.md` si un piège est rencontré, mémoire.

## 8. Risques identifiés (à surveiller au 1er test réel)

- **Gonflage des compétences** : la tendance naturelle de l'assistant. Garde-fou
  = `[ORIGINE]` visible + règle « pas de montée en niveau » + résumé « ce qui a
  changé ». Vérifier sur de vrais CV.
- **Marqueurs impossibles à remplir** : l'assistant demande des chiffres que la
  personne n'a pas. Garde-fou = consigne « de préférence une chose que la
  personne sait de mémoire ». À ajuster si le test montre le contraire.
- **Longueur de la proposition 1 qui dérive** : « même longueur » est souvent mal
  respecté. À vérifier ; si récurrent, ajouter une contrainte plus explicite.
- **Assistant gratuit qui tronque** (deux CV = réponse longue) : le parseur
  détecte `< 2` propositions et propose de recoller / recommencer.
- **Format ignoré** (« Voici votre CV : » en tête) : parseur tolérant, ne jamais
  compter sur « rien avant, rien après ».
- **OCR d'une photo bruité** : la reformulation travaille sur un texte déjà
  approximatif. L'étape de relecture (bloc 2) doit rattraper ; qualité moindre à
  assumer.

## 9. Angles morts, priorité basse

- **Passerelle vers « Mettre à jour mon CV »** si la personne réalise qu'elle
  doit changer du contenu : aujourd'hui elle recommence. Un lien qui bascule en
  gardant le CV déjà déposé serait plus doux. Pas V1.
