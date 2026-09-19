# Plan — retours de Denis (31/08 soir) : Découverte + points transverses

> Contexte : après les tests A/B des prompts, Denis a relevé une série de points
> qui dépassent une simple correction. Ce document est le **plan** : chaque
> chantier = quoi / comment / risque / taille. Denis choisit l'ordre, on traite
> **un chantier à la fois**, un commit par sous-étape, `npm test` + navigateur.

## Déjà fait

- `523e738` — bug d'import : un 2e essai après échec aboutit + le message d'erreur
  ne colle plus (Bilan, Cohérence, Découverte, page Action, Titre/accroche).
- `20db6e6` — pilules / onglets « Expérience N » / bouton « Je valide » modernisés
  (jetons du thème, scope `.decouverte-parcours`).
- `fe7ce79` — scroll : on remonte en haut à chaque changement d'écran / entrée
  dans le parcours (plus au milieu sous la zone verte).
- **`f5e8634` — Chantiers 2 + 3 FAITS.** `dossier.decouverteTerminee` persistant
  posé à la finalisation, lu par `pageResultats()` (page adaptée sur tous les
  chemins) ; « Voir mon CV » sur l'intro **seulement si le parcours est fini** ;
  reset du drapeau sur « recommencer » / création de CV normale. Vérifié : import
  sans fin -> pas de « Voir mon CV » ; parcours fini -> page adaptée même après
  aller-retour accueil ; entrée « Mon projet » intacte.
- **`3148512` — Chantier 6 FAIT (parcours).** `htmlEncartMultilingue()` sur les 7
  pages d'intro de type parcours (Découverte, Lettre, Entretien, Comparer, ATS,
  Bilan, Cohérence). **Reste** : décider avec Denis pour Carnet / Lexique /
  Repères (pas de passage assistant -> texte à adapter).

---

## Chantier 1 — [ÉCARTÉ, décision Denis 2026-08-31]

**État réel (audit du code) :** l'encart `htmlEncartRepriseModule` + gel
(`appliquerGelModule`) + « Continuer / Recommencer » **existe et fonctionne** sur
**Bilan, Cohérence transversale, Comparer mes pistes, ET Découvrir mes
compétences**. Il n'est pas sur Carnet / Repères / Lexique.

**Donc pour Découverte, c'est fait.** Ce que Denis a vécu (« je n'ai pas cet
encart ») vient du **Chantier 2** : il a cliqué « Voir mon CV » sur la page
d'intro, qui court-circuite ce mécanisme.

**Ne pas l'étendre à Carnet / Repères / Lexique** (Denis, 2026-08-31) : ce sont
des outils de **captation / consultation permanente**, faits pour entrer et
sortir en continu depuis n'importe quel module. Les geler irait contre leur
raison d'être, et il n'y a **pas d'état à moitié fait à protéger** (une note est
enregistrée au fil de la frappe). L'encart + gel reste réservé aux **parcours**
où on investit un travail multi-étapes en attendant un retour.

---

## Chantier 2 — La bannière « Voir mon CV » sur la page d'intro de Découverte

**Le problème** (`pageDecouverteIntro`, `data/metiers.js` ~4870) :
- Dès que `dossier.decouverteAnalyseRecue` est vrai (= dès le 1er import réussi,
  **avant** d'avoir validé les compétences et « Compléter »), la page d'intro
  affiche un encart bleu **« Voir mon CV »** au-dessus du reste.
- Ce bouton fait `naviguerVers('resultats')` **sans** passer par le parcours :
  - il **saute** les étapes non validées (Compétences, Compléter) ;
  - il n'arme **pas** `_decouverteVersResultats` -> on tombe sur l'**ancienne**
    page Action (barre « Mon projet » + 3 onglets), pas sur la page adaptée
    « Créer mon CV » qu'on a construite au point 6 ;
  - il **empêche** l'encart « Continuer / Réinitialiser » d'apparaître (Denis
    aurait dû cliquer le CTA « Reprendre / recommencer → » à la place).

**Correctif proposé :**
- Ajouter un fait **persistant** `dossier.decouverteTerminee` (posé par
  `finaliserEtNaviguerVersResultats()`), remis à `false` par un vrai
  « recommencer » de Découverte et par le choix « Créer un nouveau CV » de la
  carte « Mes documents ».
- Sur la page d'intro :
  - `decouverteAnalyseRecue` **mais pas** `decouverteTerminee` (parcours commencé,
    pas fini) -> **pas de bannière « Voir mon CV »**. Le seul chemin est le CTA
    « Reprendre mon parcours → » (qui déclenche l'encart Continuer/Recommencer).
  - `decouverteTerminee` -> on garde une synthèse « Voir mon CV », mais le bouton
    route vers la page Action **adaptée** (voir Chantier 3).
- **Risque** : faible (une bannière conditionnelle + un drapeau).
- **Taille** : petite.

---

## Chantier 3 — La page Action adaptée sur *tous* les chemins d'entrée depuis Découverte

**Le problème** : l'adaptation du point 6 (barre du module, titre « Créer mon CV »,
pas de sélecteur, sous-barre retirée) ne s'active que si `_decouverteVersResultats`
est vrai. Ce drapeau est **transitoire** : un aller-retour par l'accueil le perd.

**Correctif proposé :**
- Dans `pageResultats()` :
  `var depuisDecouverte = !!window._decouverteVersResultats || dossier.cvOrigine === 'decouverte';`
- `dossier.cvOrigine = 'decouverte'` posé à la finalisation du parcours, effacé
  quand on lance une création de CV « normale » (mêmes points de reset que le
  drapeau `decouverteTerminee` du Chantier 2).
- **Risque** : faible, mais tester les 3 entrées de `pageResultats` (Découverte /
  Mon projet / import de session) à chaque sous-étape (garde-fou du point 6).
- **Taille** : petite. **Dépend de** rien, mais se fait naturellement avec le
  Chantier 2 (même drapeau).

---

## Chantier 4 — Saisie inexploitable : bloquer proprement quand l'assistant ne peut rien tirer du texte

**Le problème** : un texte incompréhensible passe quand même. L'assistant renvoie
un « fragment » dont toutes les propositions disent « texte incompréhensible /
aucune expérience identifiable », et l'app propose de l'importer dans les
**expériences professionnelles** — ce qui n'a aucun sens.

**Correctif proposé (prompt + code) :**
- **Prompt** (`decouverte-competences.md` d'abord) : sortie de secours. Quand le
  récit ne permet d'identifier **aucune** activité, l'assistant renvoie
  `{ "analyseImpossible": true, "message": "<phrase courte, bienveillante, figée>" }`
  et **rien d'autre** (pas de `fragments`). Formulation à figer + tester par un
  vrai collage (comme pour le prompt).
- **Code** (`analyserReponseDecouverte` / `executerAnalyseInitiale`) : détecter
  `analyseImpossible` -> renvoyer un **type de résultat distinct** -> écran dédié
  « On n'a pas réussi à exploiter votre texte » (exemples, encouragement,
  « réécrivez votre récit »). Jamais la fenêtre de validation des fragments.
- **Filet côté code** : même sans le drapeau, détecter une sortie dégénérée
  (aucun fragment, ou tous les fragments sans proposition **et** sans compétence)
  et basculer sur le même écran.
- **Portée** : uniquement les **1ers passages** où la personne exprime un besoin
  brut : Découverte, création de CV (`cv.md`), Bilan diagnostic (`bilan-v1.md`),
  Lettre, Entretien, Cohérence. Les 2èmes passages travaillent sur du contenu
  déjà filtré. **NB** : si le 1er passage échoue, il n'y a de toute façon **jamais**
  de 2ème passage -> le seul vrai correctif est côté 1er passage.
- **Risque** : moyen (touche ~6 prompts + une détection partagée cote code).
  Sur `bilan-v1.md` : le compactage du 31/08 a rendu ~530 octets, l'ajout du
  Chantier 4 tient en 1 ligne -> il y a la place ; la seule précaution est de
  rester minimal et que Denis re-valide sur de vrais CV. **Fait le 2026-09-01 :
  Denis a validé `bilan-v1.md` sur de vrais CV, conforme.**
- **Taille** : chantier. **Module par module, Découverte d'abord.**

### État au 2026-09-01

| Module | Prompt | Détection code | Écran dédié | Commit |
|---|---|---|---|---|
| Découverte | `decouverte-competences.md` | `analyserReponseDecouverte` (`analyseImpossible` + filet `fragments:[]`) | « Revenir à mon récit » + croix « tout effacer » | `c4ae281` / `fb62ca5` |
| Bilan | `bilan-v1.md` | `diagnosticResponseParser` -> `SaisieInexploitable` | « Revenir au dépôt du CV » (`bilanEntrerPreparation`) | `b001154` |
| CV (Passons à l'action) | `cv.md` | `analyserReponseIACV` -> `{analyseImpossible:true}` | « Compléter mes informations » (`naviguerVers('objectif')`) | `947263d` |
| Cohérence de mon dossier | `coherence-transversale.md` | `ctParserReponseDiagnostic` -> `SaisieInexploitable` | « Revenir au dépôt » (`ctDemarrerCollecte`) | `ad5bfe4` |
| Lettre | `lettre-v1.md` | — | — | **NE PAS FAIRE (décision Denis 2026-09-01)** |
| Entretien | `entretien.md` | — | — | **NE PAS FAIRE (décision Denis 2026-09-01)** |

**Lettre et Entretien — arrêt à 4 prompts, décidé par Denis le 2026-09-01.**
Ces deux prompts ne sont **pas** des analyses en un coup : ce sont des **séances
de dialogue progressif** (`lettre-v1.md` : « le bénéficiaire ne répond pas à un
questionnaire », MOT DE DÉMARRAGE — START ; `entretien.md` : « accompagnement
progressif, par le dialogue, qui se termine par un bilan »). Il n'existe donc pas
de bloc JSON unique que l'app lit pour décider « exploitable / pas exploitable » :
l'assistant ouvre une conversation, et un assistant correct dit déjà de lui-même
« je n'ai pas assez d'éléments » en cours d'échange. De plus, ces deux séances ne
se lancent **qu'après** le travail CV (le profil transmis contient déjà le CV) :
le cas « rien d'exploitable » n'y arrive quasiment jamais. Greffer le garde-fou
`analyseImpossible` sur le parser d'import final (`analyserReponseIALettre` /
entretien) serait possible mais se déclencherait après toute la séance déjà
investie — effort disproportionné pour un cas qui ne se produit pas. **Denis a
validé l'arrêt à 4 prompts le 2026-09-01 : on ne touche pas Lettre/Entretien.**

### La croix « tout effacer » dans les autres modules

Demande de Denis (24) : après la croix ajoutée à Découverte, « implémente le même
comportement dans les autres modules ». Après implémentation : **sans objet pour
Bilan / CV / Cohérence.** La croix de Découverte existe parce que « Revenir à mon
récit » ramène sur la **même** zone de texte, texte encore présent. Bilan, CV et
Cohérence, eux, renvoient vers un **dépôt neuf** (`bilanEntrerPreparation` /
`naviguerVers('objectif')` / `ctDemarrerCollecte`) qui repart de zéro : il n'y a
aucune zone de texte à vider à la main, donc aucune croix à afficher. Confirmé
avec Denis le 2026-09-01 (croix spécifique à Découverte).

### Chantier 4 : CLOS le 2026-09-01, testé

4 prompts sur 6 traités (Découverte, Bilan, CV, Cohérence). Lettre/Entretien
écartés sur décision. **Testé par Denis le 2026-09-01** : volet Découverte avec un
vrai assistant + texte incompréhensible (conforme), `bilan-v1.md` sur de vrais CV
(conforme), protocole ChatGPT « compte perso » (conforme). Plus rien en attente.

---

## Chantier 5 — Les deux messages redondants à l'import d'un JSON sans compétences

**À reproduire précisément d'abord** (ou capture de Denis) : quel écran, quels
deux messages. Hypothèse : le message d'erreur `#messageImportDecouverte` +
l'encart « phrase prête » (ajout 5d), ou deux bandeaux de l'étape « Vos
compétences » qui se recouvrent.

**Correctif** : si les deux couvrent la même chose -> fusionner. S'ils visent
deux situations mais partent du **même déclencheur** -> **un seul bloc, deux
lignes**, une par situation, chacune avec son explication.
- **Risque** : faible. **Taille** : petite. **Dépend de** : une repro.

---

## Chantier 6 — Encart multilingue sur les pages d'intro de modules

**Forme retenue (Denis, 31/08)** : garder le **titre de rubrique**
« 🌍 Vous préférez une autre langue ? » + une ligne **cliquable**
« Cliquez ici pour plus d'informations », qui **déplie** le texte long. 80 % ne
l'ouvriront pas ; ceux qui l'ouvrent sauront pourquoi.

**Texte long (déplié) — version validée par Denis :**
> Votre navigateur peut souvent traduire cette page dans votre langue (clic droit
> sur la page, ou le menu du navigateur, puis « Traduire »). Vous pouvez alors
> répondre aux questions dans votre langue : votre CV et votre lettre de
> motivation seront, eux, rédigés en français correct.
>
> Pour dicter à la voix dans votre langue : la dictée de Windows (touches
> Windows + H) suit la langue de l'ordinateur, le plus souvent le français.
> Sinon, utilisez la dictée vocale de Google Docs, ou le micro du clavier de
> votre téléphone, puis collez le texte ici.

**Mise en œuvre :**
- Brique partagée dans `htmlPageIntroModuleParcours` (+ le patron des pages
  d'intro routées type Carnet/Lexique), un seul texte à maintenir.
- Posée sur **toutes les pages d'intro actuelles** + à **inscrire dans les
  maquettes** des modules à venir (notamment les 3 parcours de la carte
  « Mes documents »).
- **Risque** : nul (bloc `<details>` additif). **Taille** : petite.

---

## Reste à faire

**Rien — plan entièrement terminé au 2026-09-01.**

- Chantier 1 : écarté (décision Denis).
- Chantiers 2+3 : `f5e8634`.
- Chantier 5 : `5685995` (un seul bloc d'aide à l'échec, deux lignes).
- Chantier 6 : `3148512` (parcours) + `5685995` (Carnet/Lexique/Repères, version courte option 2).
- Chantier 4 : `c4ae281` / `fb62ca5` (Découverte) + `b001154` (Bilan) + `947263d` (CV) + `ad5bfe4` (Cohérence). Lettre/Entretien écartés. **Testé par Denis le 2026-09-01** (Découverte avec un vrai assistant + texte incompréhensible : conforme ; `bilan-v1.md` sur de vrais CV : conforme ; protocole ChatGPT « compte perso » : conforme).
