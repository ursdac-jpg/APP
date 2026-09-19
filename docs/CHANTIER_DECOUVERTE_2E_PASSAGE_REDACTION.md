# Chantier — 2e passage IA obligatoire pour "Découvrir mes compétences" (rédaction du CV)

> **PLAN À VALIDER AVANT DE CODER** (Mode A, décision Denis 2026-09-18). Aucun code n'a
> été écrit pour ce chantier au moment de la rédaction de ce document — uniquement de la
> lecture/recherche. À lire en entier avant de commencer, avec `CLAUDE.md` et
> `docs/TRAVAILLER_AVEC_DENIS.md`.

## 0. Décision de Denis (résumé du besoin, ne pas re-débattre)

- Le 2e passage est **obligatoire**, pas optionnel.
- Il fait plus que produire 5 accroches : il doit aussi **exploiter réellement** les réponses
  aux questions ciblées du 1er passage (aujourd'hui juste recopiées telles quelles, jamais
  reformulées), les expériences ajoutées/modifiées par la personne, et **corriger fautes de
  frappe + incohérences**.
- Il se place **juste après la possibilité de rajouter des expériences** (mécanisme déjà
  existant ailleurs dans l'appli, à rapatrier dans le parcours Découverte lui-même).
- **Reste dans le module Découverte** : pas de renvoi vers la page/le mécanisme d'un autre
  module, pas de fenêtre modale pour ce passage précis (l'éditeur d'expériences, lui, reste
  une fenêtre — Denis l'a validé tel quel).
- Réutilise les fonctions déjà écrites pour "Créer un nouveau CV" (le mécanisme du 2e passage
  qui produit déjà les accroches là-bas), sans les dupliquer.
- Nouveau prompt dédié à ce passage (pas une fusion dans `decouverte-competences.md`, déjà
  très chargé), en récupérant des instructions de `prompts/cv.md`.
- Barre de navigation du module : renommer le repère "Mon CV" en **"Rédiger mon CV"** (ce
  sera ce nouveau passage), puis ajouter un dernier repère **"Mon CV"** (mise en page/export
  uniquement, sans IA).
- **Urgence** : Denis n'a plus de temps d'utilisation sur ce compte ce soir. Ce document est
  écrit pour être exécuté par une autre instance de Claude, qui n'a aucune mémoire de cette
  conversation — tout ce qu'il faut savoir doit être dans ce fichier.

---

## 1. Ce qui existe déjà et doit être réutilisé tel quel

### 1.1 Le pipeline "rédaction IA du CV" de "Créer un nouveau CV" (js/app.js)

Ce pipeline **fonctionne déjà** pour les parcours `'maj'`/`'pret'` sur `pageResultats()`
(js/app.js, fonction `pageResultats()`, lignes **17266-18176**, route `'resultats'`). Il est
actuellement **explicitement exclu pour Découverte** par une garde :

```js
// ligne 18042
var secondPasseIARequise = !window._decouverteVersResultats && !creationCvGuidee && !venantDeCoLettre;
```

Le commentaire qui justifie cette exclusion (lignes 18108-18119, "Decouverte a deja son propre
passage...") est **erroné** : vérifié dans `decouverteParcours.js`, le passage assistant de
Découverte (`etapeChoixAssistant`/`etapeCollerReponse`) sert à l'**extraction de compétences**
(prompt `decouverte-competences.md`, fonction `executerAnalyseInitiale`), jamais à la
**rédaction du CV** (prompt `cv.md`, fonction `analyserReponseIACV`). Ce sont deux prompts et
deux pipelines totalement séparés. Découverte n'écrit d'ailleurs **jamais** dans `dossier.ia`
aujourd'hui (confirmé, commentaire `decouverteParcours.js` ligne 1602-1603).

**Fonctions à réutiliser, TOUJOURS par paire HTML + câblage (jamais recomposer avec du HTML
maison, sinon le câblage cherche des ID DOM qui n'existent pas et ne fait rien silencieusement)** :

| Rôle | HTML | Câblage |
|---|---|---|
| Choisir l'assistant | `contenuRectangleChoixIA(docActif)` (ligne 11578) | `wireRectangleChoixIA(docActif, rerender)` (ligne 11756-11765 — wrapper qui appelle `wireChoixAssistantIA(rerender)` ligne 11537 + branche un bouton "voir le texte transmis" en plus ; **utiliser `wireRectangleChoixIA`, pas `wireChoixAssistantIA` seule**, pour avoir le comportement complet identique à `pageResultats()`) |
| Coller la réponse | `contenuAccordeonImportIA(docActif)` (ligne 11867-11909) | `wireImportIA(docActif, rerender, idEtapeApres)` (ligne 11919-12214) |
| Choisir ce qui ira sur le CV | `contenuRectangleRelectureIA()` (ligne 11773-11804) | `wireRectangleRelectureIA(rerender)` (ligne 11821-11862) |

**Le paramètre `rerender` de ces trois fonctions est appelé sans argument** (`rerender()`), alors
que la fonction de rendu interne de Découverte est `afficherEtape(numero)` (avec un `numero`
obligatoire), définie ligne 466 de `decouverteParcours.js`, **en closure locale à
l'intérieur de `ouvrirDecouverteCompetences()` (ligne 358)** — donc non accessible telle quelle
depuis l'extérieur de cette fonction. Le `rerender` à passer aux fonctions partagées doit être
une petite fonction enveloppe définie dans ce même scope, par exemple
`function () { afficherEtape(etat.etapeCourante); }`, pas `afficherEtape` directement.

Fonctions de traitement (pures, pas de HTML, déjà globales, appelables directement) :
- `analyserReponseIACV(texteColle)` (lignes 26947-27025) — parse la réponse collée selon le
  schéma JSON de `cv.md` (voir 1.3), gère `analyseImpossible`.
- `creerBrouillonChoixIACV(valeurs)` (~25584-25891) — construit l'objet `brouillon` (accroches,
  points forts, mots-clés, expériences, compétences... voir structure en 1.4).
- `ouvrirRelectureIACV(brouillon, onValider, onRetour, enPage, rerender)` (lignes 11190-11201)
  — bascule vers l'écran de relecture. **Avec `enPage=true`**, pose `_brouillonRelectureIACV`
  et `_onValiderRelectureIACV` (globales) puis appelle `rerender()`.
- `appliquerBrouillonChoixIACV(brouillonValide)` (~26394-26489) — écrit `dossier.titreCV`,
  `dossier.ia.cv.profil` (accroche choisie), `dossier.ia.cv.pointsForts/motsCles/recommandations.*`.

### 1.2 Le piège à éviter absolument : couplage à des globales de module

Ces fonctions ont été écrites pour être appelées depuis `pageResultats()` ou `pageAssistant()`
et **lisent des globales de module plutôt que leurs paramètres**, à trois endroits précis :

1. **`etatAccordeon` / `etatAccordeonValide`** (globales de module, ligne ~11095/11136) : mutées
   directement par `avancerEtape()`. Avant d'appeler la moindre fonction ci-dessus depuis
   Découverte, il FAUT poser explicitement :
   ```js
   etatAccordeon = accordeonPourType('cv');
   etatAccordeonValide = accordeonValidePourType('cv');
   ```
   (c'est exactement ce que fait `pageResultats()` elle-même, ligne 17357-17358 — même geste
   à copier).

2. **`docActifActuel()`** (ligne 24717, `return dossier.dernierDocumentPrepare || (dossier.modeCreation === 'pret' ? 'lettre' : 'cv')`)
   est appelée **en interne** par plusieurs handlers, en ignorant le paramètre `docActif` reçu
   par la fonction englobante (vérifié précisément : `wireImportIA`'s clic sur
   `btnImporterReponseIA` relit `docActifActuel()` ligne 12067 au lieu d'utiliser le paramètre
   `docActif` de la fonction ; `ouvrirRelectureIACV` fait pareil ligne 11194). Pour un dossier
   Découverte tout frais, `dossier.dernierDocumentPrepare` est normalement vide et
   `dossier.modeCreation` n'est jamais `'pret'`, donc ça résout naturellement en `'cv'` —
   **mais ce n'est pas garanti par contrat, à vérifier/forcer explicitement** avant l'appel
   (ex. s'assurer que `dossier.dernierDocumentPrepare` est bien vide à ce stade, ou le forcer).

3. **Écrans tampon IA** (`_etatTransitionIA`, `_intervalleDecompteIA`, décompte avant ouverture
   de l'assistant) : ce sont des globales `js/app.js`, déjà référencées aussi côté
   `decouverteParcours.js` (pas d'isolement de portée entre les deux fichiers, chargés en
   `<script>` classiques). Sans risque tant qu'un seul écran assistant n'est actif à la fois
   (garanti par construction : Découverte réécrit `fenetre.innerHTML` en entier à chaque étape).

**Conclusion de l'agent qui a vérifié ce point en détail : pas de mur architectural, la
réutilisation directe (option recommandée) demande ~3-4 lignes de "pontage" avant chaque appel,
rien de plus. Le seul vrai risque est d'oublier un des 3 points ci-dessus — silencieux, pas de
plantage, juste une fonctionnalité qui ne se déclenche pas (décompte, câblage de bouton...).**

### 1.3 Schéma JSON attendu par `analyserReponseIACV` (= schéma de sortie de `prompts/cv.md`)

Le nouveau prompt (voir section 3) doit produire **exactement ce schéma** pour que
`analyserReponseIACV`/`creerBrouillonChoixIACV`/`appliquerBrouillonChoixIACV` fonctionnent sans
aucune modification de code :

```json
{
  "titresProposes": ["...", "...", "...", "...", "..."],
  "accrochesProposees": ["...", "...", "...", "...", "..."],
  "pointsForts": ["...", "..."],
  "motsCles": ["...", "..."],
  "couleurEntrepriseSuggeree": "#RRGGBB ou null",
  "recommandations": {
    "typeCV": { "valeur": "specifique", "justification": "..." },
    "postesRecommandes": ["...", "...", "..."],
    "experiencesAMettreEnAvant": [{ "poste": "...", "entreprise": "...", "justification": "...", "dateDebut": "...", "dateFin": "..." }],
    "competencesAValoriser": [{ "competence": "...", "justification": "..." }],
    "competencesPersonnelles": [{ "competence": "...", "source": "...", "justification": "..." }],
    "rubriquesMasquables": [{ "rubrique": "...", "justification": "..." }],
    "savoirFaireParExperience": [{ "poste": "...", "entreprise": "...", "missions": ["...", "...", "...", "...", "..."] }],
    "formationRetenue": { "intitule": "...", "justification": "...", "missions": ["...", "..."] },
    "certificationsAMettreEnAvant": [{ "certification": "...", "justification": "..." }],
    "experiencePersonnelleAMettreEnAvant": { "intitule": "...", "missions": ["...", "...", "..."], "justification": "..." },
    "regroupementExperiences": {
      "experiencesRetenues": [{ "type": "professionnelle", "poste": "...", "entreprise": "...", "intitule": "...", "nombreMissionsSuggere": 5, "missions": ["...", "...", "...", "...", "..."], "justification": "..." }],
      "groupes": [{ "metiers": ["...", "..."], "texteRegroupe": "..." }]
    },
    "competencesGroupeesParTheme": [{ "theme": "...", "items": [{ "texte": "...", "illustrePar": ["...", "..."] }] }],
    "loisirRetenu": { "intitule": "...", "justification": "...", "missions": ["...", "..."] }
  },
  "analyseImpossible": false
}
```
(`analyseImpossible: true` + `message` en cas d'échec, comme dans `cv.md` lignes 102-110.)

### 1.4 Éditeur d'expériences (mécanisme "rajouter des expériences" que Denis dit déjà utiliser)

Déjà **commun** aux deux modules (`docs/BRIQUES_COMMUNES.md`, table A, ligne 33 —
entrée à mettre à jour pour ajouter Découverte comme consommateur explicite) :
- `ouvrirFenetreExperiences()` (js/app.js, ligne 14638-14643) ouvre une fenêtre ERIP construite
  par `construireContenuFenetreExperiences()` (14436-14501, fusionne `dossier.experiences` +
  `dossier.experiencesPerso` dans un éditeur unique, décision Denis 2026-08-22).
- Câblage : `cablerFenetreExperiences()` (14526-14627).
- Rendu de chaque carte : `construireCarteExperience(e, i, contexte, liste)` (14306-14324),
  `contexte` = `'page'` (déjà utilisé par Découverte sur `pageResultats()`) ou `'modale'`.
- Modification d'une carte existante en ligne (hors fenêtre) : `ouvrirFenetreExperienceProInline(index, pageResultats)` (ligne 22253).

**Ce mécanisme reste une fenêtre modale** — Denis l'a validé tel quel (point 2 de sa réponse),
ce n'est PAS ce qu'il faut "sortir de la fenêtre". Seul le passage assistant (1.1) doit être une
page du module, pas une fenêtre.

### 1.5 Mise en page / export (dernier repère "Mon CV") — déjà générique, ne pas y toucher

`pageResultats()` (js/app.js) affiche déjà, indépendamment de l'origine du CV, les rectangles :
- **Le format** : `contenuRectangleFormatCV()` (11628-11645) — Word vs PDF, `dossier.formatCV`.
- **La mise en page** : `construireMiseEnPageCV(docActif)` (~16216), lit `dossier.reglagesMiseEnPageCV`.
- **Exporter** : `contenuRectangleExporter(docActif)` (11677-11721) + `wireRectExporter(rerender)`
  (11723-11754) — Word/PDF/copier/CSV Canva.

Ces 3 rectangles lisent `dossier.experiences`, `dossier.titreCV`, `dossier.ia.cv.profil`, etc. —
**rien à construire ici**, ils fonctionneront correctement dès que `dossier.ia.cv.*` sera rempli
par le nouveau passage (aujourd'hui vide pour Découverte, d'où un CV "brut" sans accroche ni
missions reformulées). Le repère final "Mon CV" de la nouvelle barre de navigation, c'est
`naviguerVers('resultats')` → cette même `pageResultats()`, exactement comme aujourd'hui — pas
de nouvel écran à construire, juste un renommage de repère (voir section 4).

---

## 2. Ce qui manque et doit être construit dans `decouverteParcours.js`

### 2.1 Nouvelle étape "Vos expériences" (avant le passage assistant)

Un nouvel écran, natif à Découverte (comme les 8 étapes actuelles), qui :
- Affiche les expériences déjà mappées (`dossier.experiences`, via `construireCarteExperience(e, i, 'page', dossier.experiences)`, déjà utilisée par Découverte aujourd'hui sur `pageResultats()` — la déplacer plus tôt dans le parcours ne change rien à son fonctionnement).
- Propose un bouton "Ajouter/modifier une expérience" → `ouvrirFenetreExperiences()` (voir 1.4, inchangé).
- Un bouton "Continuer" vers l'étape suivante (choix de l'assistant).

**Point d'insertion exact** : aujourd'hui, `etapeMobilite()` (étape 8 "Compléter",
`decouverteParcours.js` ligne 2245-3939) se termine (`onContinuer`, ligne 3814-3937) par :
```js
calculerStrategieSiBesoin();
finaliserEtNaviguerVersResultats();   // ligne 3935-3936
```
`finaliserEtNaviguerVersResultats()` (lignes 3975-4167) fait deux choses qu'il faut **séparer** :
1. Le **mapping** fragments → dossier (lignes 3989-4150, y compris le garde-fou
   `etat.decouverteDejaAppliquee` — à conserver impérativement, `appliquerMisesAJourDossier`
   concatène sans dédoublonnage).
2. La **navigation finale** (lignes 4151-4166 : `masquerDecouverteCompetences()`,
   `window._decouverteVersResultats = true`, `dossier.decouverteTerminee = true`,
   `naviguerVers('resultats')`).

**Refactorisation nécessaire** : renommer/scinder en deux fonctions, par exemple :
- `finaliserMappingDossier()` = l'étape 1 ci-dessus, appelée à la fin de `etapeMobilite().onContinuer()` À LA PLACE de `finaliserEtNaviguerVersResultats()`, puis navigation vers la nouvelle étape 9 (au lieu de `naviguerVers('resultats')`).
- `terminerParcoursDecouverte()` = l'étape 2 ci-dessus, appelée seulement à la toute fin, après validation du brouillon CV (voir 2.3).

Ceci est nécessaire car `texteProfil('cv')` (js/app.js, ligne 24730) — qui construit le texte
envoyé à l'assistant pour la rédaction — lit `dossier.experiences`/`dossier.formations`/etc. :
ces champs doivent donc être déjà peuplés (mapping fait) AVANT le nouveau passage assistant,
mais la navigation vers `pageResultats()` doit, elle, attendre la fin de ce nouveau passage.

### 2.2 Nouvelle étape "Choisissez votre assistant" + "Collez la réponse" (rédaction du CV)

Réutilise 1.1, avec le pontage de 1.2. Concrètement, dans la nouvelle étape de
`decouverteParcours.js` :
```js
etatAccordeon = accordeonPourType('cv');
etatAccordeonValide = accordeonValidePourType('cv');
// vérifier/forcer dossier.dernierDocumentPrepare vide et dossier.modeCreation !== 'pret'
```
puis construire l'écran avec `contenuRectangleChoixIA('cv')` + `contenuAccordeonImportIA('cv')`,
et câbler avec `wireRectangleChoixIA('cv', rerenderDecouverte)` et
`wireImportIA('cv', rerenderDecouverte, <id-etape-suivante>)`, où `rerenderDecouverte` est une
fonction enveloppe locale du type `function () { afficherEtape(etat.etapeCourante); }` (voir
précision section 1.1 sur `afficherEtape`, ligne 466 de `decouverteParcours.js`, closure locale
à `ouvrirDecouverteCompetences()` ligne 358 — pas directement passable telle quelle).

**Le texte envoyé à l'assistant** doit utiliser le **nouveau prompt** (section 3), pas `cv.md` :
il faut donc soit dupliquer légèrement `wireChoixAssistantIA`'s `construireTexteACopier` pour
pointer vers la nouvelle clé de prompt, soit généraliser cette fonction pour accepter la clé en
paramètre (à trancher en codant, généraliser est préférable à dupliquer par
`docs/LECONS_A_NE_PAS_REPRODUIRE.md` règle "une seule source de vérité").

**Important — deux allers-retours assistant distincts** : Découverte demandera donc à la
personne d'ouvrir l'assistant en ligne DEUX fois dans son parcours (une fois pour raconter son
parcours = extraction de compétences, une fois pour la rédaction finale du CV). C'est cohérent
avec la demande de Denis (passage séparé, explicitement voulu), mais à rappeler clairement dans
le texte d'écran ("2e et dernier échange avec l'assistant") pour ne pas surprendre la personne.

### 2.3 Nouvelle étape "Choisir ce qui ira sur le CV" (relecture/validation)

Réutilise `contenuRectangleRelectureIA()` / `wireRectangleRelectureIA(rerenderDecouverte)` (1.1),
via `ouvrirRelectureIACV(brouillon, onValider, onRetour, true, rerenderDecouverte)`. Le
`onValider` doit :
```js
appliquerBrouillonChoixIACV(brouillonValide);   // écrit dossier.ia.cv.*, dossier.titreCV
terminerParcoursDecouverte();                    // la fonction scindée en 2.1, navigue enfin vers 'resultats'
```

### 2.4 Barre de navigation (`DECOUVERTE_NAV_ETAPES` + `_decouverteNavIndex`)

État actuel (`decouverteParcours.js` lignes 56-89) :
```js
var DECOUVERTE_NAV_ETAPES = [
  { label: 'Préparer', icone: '...' },      // 0
  { label: 'Assistant', icone: '...' },     // 1
  { label: 'Réponse', icone: '...' },       // 2
  { label: 'Compétences', icone: '...' },   // 3
  { label: 'Compléter', icone: '...' },     // 4
  { label: 'Mon CV', icone: '...' }         // 5 — jamais réellement atteint pendant le parcours
];
function _decouverteNavIndex(numero) {
  var table = [null, 0, 0, 0, 1, 2, 3, 3, 4];   // étapes techniques 1..8 -> repère 0..4
  ...
}
```
Nouvelle version demandée par Denis :
```js
var DECOUVERTE_NAV_ETAPES = [
  { label: 'Préparer', icone: '...' },        // 0
  { label: 'Assistant', icone: '...' },       // 1
  { label: 'Réponse', icone: '...' },         // 2
  { label: 'Compétences', icone: '...' },     // 3
  { label: 'Compléter', icone: '...' },       // 4
  { label: 'Rédiger mon CV', icone: '...' },  // 5 — RENOMMÉ, devient un vrai repère du parcours
  { label: 'Mon CV', icone: '...' }           // 6 — NOUVEAU, mise en page/export (pageResultats)
];
```
`table` étendue pour couvrir les nouvelles étapes techniques 9 (vos expériences), 10 (choix
assistant), 11 (coller réponse), 12 (relecture) → toutes mappées au repère 5 "Rédiger mon CV".
Le repère 6 "Mon CV" reste, comme aujourd'hui, seulement atteint sur `pageResultats()`
(en dehors du `_decouverteNavIndex` du parcours lui-même — comportement identique à l'existant,
juste un repère de plus dans le tableau).

### 2.5 Fonction `obtenirDefinitionEtape(numero)` (lignes 4297-4320)

Ajouter les branches pour les numéros 9/10/11/12 vers les nouvelles fonctions d'écran
(`etapeVosExperiences()`, `etapeChoisirAssistantCV()`, `etapeCollerReponseCV()`,
`etapeRelectureCV()` — noms indicatifs, à harmoniser avec les conventions déjà en place dans ce
fichier).

---

## 3. Nouveau prompt `prompts/decouverte-redaction.md`

**Avis sur la demande de Denis (point 3, "quel est ton avis ?") : d'accord avec un prompt
séparé.** Raisons : `decouverte-competences.md` est déjà très chargé (risque documenté,
`docs/LECONS_A_NE_PAS_REPRODUIRE.md`, section sur la fusion diagnostic+extraction V3 retirée le
2026-08-24 pour ce type de surcharge) ; `cv.md` sert un module différent avec ses propres
réglages (mode général/spécifique déjà bien couvert, réutilisable tel quel) ; le nouveau prompt
peut donc **reprendre l'essentiel de `cv.md`** (règles de style, contrainte 1 page, méthode de
sélection, schéma JSON de sortie **identique à l'octet près**, pour que le code de parsing
n'ait rien à changer) et y ajouter deux consignes réellement nouvelles :

1. **Correction silencieuse des fautes de frappe et incohérences** : à ajouter en règle
   générale (absente de `cv.md` aujourd'hui, qui ne corrige que l'intitulé de poste, ligne 69).
   Exemple de formulation : *"Le texte fourni peut contenir des fautes de frappe, des
   répétitions ou de petites incohérences (dates qui se chevauchent, doublons). Corrige-les
   silencieusement dans le texte que tu produis, sans les signaler ni les commenter."*

2. **Valorisation explicite des réponses aux questions ciblées et des expériences
   ajoutées/modifiées** : `cv.md` (ligne 19) instruit déjà de reformuler
   professionnellement tout ce qui vient d'un récit plutôt que de le recopier — cette règle
   suffit probablement pour le contenu de `dossier.informationsNonClassees` (qui contient déjà
   les réponses aux questions ciblées + le récit nettoyé, voir 4.2). **Point à vérifier/renforcer
   en testant réellement** : s'assurer que le nouveau prompt insiste sur le fait que ce
   contenu est ici la matière **principale** (pas un simple complément secondaire comme c'est
   le cas pour un utilisateur classique de "Créer un nouveau CV" qui remplit des champs
   structurés) — sinon l'assistant risque de le sous-pondérer par habitude du format `cv.md`.

**Mise en œuvre technique** : ajouter une entrée dans le registre `promptsExternesCharges`
(js/app.js, `chargerPromptsExternes()`, ~ligne 25317, registre `cv: 'prompts/cv.md'`) — par
exemple `decouverteRedaction: 'prompts/decouverte-redaction.md'` — pour que le fichier soit
chargé au démarrage comme les autres prompts externes.

**Le nouveau prompt doit être mis au point sur de vrais essais** (comme tous les prompts de ce
projet, jamais figé au premier jet) — prévoir au moins 2-3 passes de test réel avant de
considérer le texte figé.

---

## 4. Données déjà disponibles pour construire le texte envoyé à l'assistant

Au moment où la personne atteint la nouvelle étape (après le mapping de 2.1), le dossier
contient déjà tout ce dont `cv.md`/le nouveau prompt ont besoin :
- `dossier.experiences[]`, `dossier.experiencesPerso[]`, `dossier.formations[]`,
  `dossier.certifications[]`, `dossier.permis`, `dossier.engagements[]`, `dossier.loisirs[]`
- `dossier.competences.savoirFaire[]`, `dossier.competences.savoirEtre[]`,
  `dossier.competencesPersonnellesDecouverte[]`
- `dossier.identite.*`, `dossier.metierCible`/`dossier.secteurCible`/`dossier.objectif`/
  `dossier.typeCV` (alimentés dès l'étape 1 "Ce que vous visez" de Découverte, lignes 397-399,
  1040, 1069, 1106, 1125 de `decouverteParcours.js` — donc **pas de saisie de repli à prévoir**,
  contrairement à une inquiétude initiale)
- `dossier.informationsNonClassees[]` — contient déjà, pour chaque question ciblée de type
  "texte", une ligne `question.texte + ' - Réponse : ' + reponse` (posée par
  `finaliserEtNaviguerVersResultats()`/`finaliserMappingDossier()`, ligne 4114), et le récit
  nettoyé complet (ligne 4140-4142). **C'est le canal par lequel les réponses aux questions
  ciblées arrivent déjà au 2e passage** si on réutilise `texteProfil('cv')` telle quelle (section
  "INFORMATIONS COMPLÉMENTAIRES", js/app.js lignes ~25027-25066+).
- `dossier.typeCVRecommandeDecouverte` (stratégie calculée localement, sans IA, par
  `decouverteStrategie.js` — peut nourrir `recommandations.typeCV` en repli si l'assistant ne le
  redétermine pas).

**Réutiliser `texteProfil('cv')` (js/app.js, ligne 24730) telle quelle est probablement la voie
la plus sûre** pour construire le texte du profil envoyé à l'assistant — elle lit exactement ces
champs et dégrade proprement en cas d'absence (vérifié : pas de plantage si `metierCible`/
`secteurCible` absents, ligne 24759 et 24791-24802). Seule la clé de prompt change
(`decouverteRedaction` au lieu de `cv`), pas la construction du profil.

---

## 5. Points de vigilance / risques à garder en tête en codant

1. **Garde anti-double-exécution** (`etat.decouverteDejaAppliquee`) : à conserver sur la partie
   mapping (2.1). Vérifier qu'un retour en arrière dans les nouvelles étapes (9 à 12) ne
   redéclenche jamais ce mapping une 2e fois.
2. **Pontage `etatAccordeon`/`etatAccordeonValide`/`docActifActuel()`** (section 1.2) : à poser
   explicitement avant chaque appel aux fonctions partagées, sinon échec silencieux (pas de
   plantage visible, juste un bouton qui ne répond pas ou un décompte qui ne démarre pas).
3. **Paires HTML + câblage jamais mélangées** avec du HTML maison (section 1.2, point 3).
4. **Deux allers-retours assistant distincts** dans le même parcours (section 2.2) — à annoncer
   clairement à l'écran pour ne pas surprendre la personne (public en fragilité numérique).
5. **`docs/BRIQUES_COMMUNES.md`** : mettre à jour l'entrée de l'éditeur d'expériences (table A,
   ligne ~33) pour lister explicitement Découverte comme consommateur (elle l'était déjà en
   pratique via `pageResultats()`, ce chantier la rend juste plus visible/anticipée dans le
   parcours) ; ajouter une entrée décrivant le nouveau prompt `decouverte-redaction.md` et son
   lien de parenté avec `cv.md` (pour que la prochaine personne qui modifie `cv.md` pense à
   vérifier si `decouverte-redaction.md` doit suivre).
6. **`docs/TACHES_VALIDEES.md`** : le commentaire js/app.js ligne 18108-18119
   ("Decouverte a deja son propre passage...") devient obsolète une fois ce chantier fait — à
   corriger dans le code en même temps (sinon c'est un mensonge qui traîne dans les commentaires
   pour le prochain passage).
7. **Fonction `ligneEtapesAction()`** (js/app.js ligne 17464) est du **code mort** (plus aucun
   appel dans tout le fichier, vérifié par grep) — ne pas s'appuyer dessus, et signaler cette
   dette dans `docs/BRIQUES_COMMUNES.md` ou `docs/ERREURS_ET_BUGS.md` si un nettoyage futur est
   pertinent (hors périmètre de ce chantier, ne pas le supprimer au passage sans le signaler
   d'abord).
8. **`js/app.js` et `modules/*/ui.js` ne sont pas couverts par `npm test`** (rappel `CLAUDE.md`)
   — test navigateur bout en bout obligatoire à chaque sous-étape : parcours complet Découverte
   du début à l'export, clair + sombre, un cas avec expérience ajoutée en cours de route, un cas
   `analyseImpossible` sur le nouveau prompt, vérifier qu'aucune régression n'apparaît sur les
   parcours `'maj'`/`'pret'`/`'nouveau'` existants (ils partagent les mêmes fonctions globales).

---

## 6. Ordre de mise en œuvre recommandé (un commit par sous-étape, `npm test` + navigateur avant la suivante)

1. Créer `prompts/decouverte-redaction.md` (contenu détaillé en section 3) + l'enregistrer dans
   `chargerPromptsExternes()`. Pas de câblage encore, juste le fichier + le registre.
2. Scinder `finaliserEtNaviguerVersResultats()` en `finaliserMappingDossier()` +
   `terminerParcoursDecouverte()` (section 2.1), sans encore rien changer au parcours (appeler
   les deux à la suite comme avant, pour ne rien casser) — commit + test de non-régression.
3. Ajouter la nouvelle étape "Vos expériences" (2.1), brancher `etapeMobilite().onContinuer()`
   dessus au lieu d'appeler directement les deux fonctions de l'étape précédente.
4. Ajouter les étapes "Choisissez votre assistant" + "Collez la réponse" (2.2), avec le pontage
   de 1.2. Tester spécifiquement : décompte, ouverture réelle de l'assistant, retour, collage,
   `analyseImpossible`.
5. Ajouter l'étape "Choisir ce qui ira sur le CV" (2.3), brancher `appliquerBrouillonChoixIACV`
   + `terminerParcoursDecouverte()`.
6. Mettre à jour `DECOUVERTE_NAV_ETAPES`/`_decouverteNavIndex`/`obtenirDefinitionEtape` (2.4-2.5).
7. Vérifier bout en bout un parcours Découverte complet, clair + sombre, et vérifier
   spécifiquement l'absence de régression sur "Créer un nouveau CV"/"Mettre à jour mon CV"/"CV
   prêt" (fonctions globales partagées).
8. Mettre à jour `docs/BRIQUES_COMMUNES.md`, `docs/TACHES_VALIDEES.md`, corriger le commentaire
   obsolète ligne 18108-18119 de js/app.js (point 5.6 ci-dessus).

Chaque étape ci-dessus = un commit séparé sur `master`, message en français, sans tiret
cadratin, terminé par la ligne d'attribution habituelle.
